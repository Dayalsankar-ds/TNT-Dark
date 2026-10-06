"use client";

/**
 * CHAT WIDGET — floating "Ask TNT" button (bottom-right) that opens the AI
 * site assistant. Talks to POST /api/chat (src/app/api/chat/route.ts),
 * which streams plain-text replies grounded in src/lib/chat/knowledge.ts.
 *
 * - Conversation lives in component state only — closing the panel keeps
 *   it, a reload starts fresh. Nothing is stored in the browser.
 * - Replies stream in as they're generated. A "\u0000" in the stream means
 *   "discard what came before" — the route sends it ahead of its canned
 *   fallback reply when a refusal or error lands mid-answer.
 * - Assistant text gets a deliberately tiny renderer (MessageText): **bold**,
 *   "- " bullet lines, and [label](href) links — links only to same-site
 *   paths ("/…"), which is all the system prompt allows. No HTML is ever
 *   injected.
 * - `data-lenis-prevent` on the message list lets it scroll natively instead
 *   of the page's Lenis smooth-scroll hijacking the wheel.
 * - White panel, black header with the gold accent — the same design as
 *   TNT Light's, kept as-is on this dark site (a light panel floating over
 *   dark sections reads clearly as an overlay). The launcher is the one
 *   departure from TNT Light: its black pill vanished against this site's
 *   near-black sections (2026-10-06, on request — "Button is not visible on
 *   dark back ground"), so it's gold with black text/icon here, like the
 *   nav's "Get a Quote" CTA, with a white focus ring (gold would vanish on
 *   gold).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What crane sizes do you rent?",
  "Where are your branches?",
  "How do I request a quote?",
];

const GREETING =
  "Hi! I'm the TNT assistant. Ask me about our cranes, services, safety program, or locations.";

/** Renders a line's **bold** and same-site [label](/path) links. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  // [label](/path) links and **bold**, in order of appearance.
  const re = /\[([^\]]+)\]\((\/[^)\s]*)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <a key={`${keyBase}-${i++}`} href={m[2]} className="font-semibold text-black underline decoration-tnt-amber decoration-2 underline-offset-2 hover:text-tnt-maroon">
          {m[1]}
        </a>,
      );
    } else {
      out.push(<strong key={`${keyBase}-${i++}`}>{m[3]}</strong>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function MessageText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (key: string) => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={key} className="my-1 list-disc space-y-1 pl-5">
        {bullets.map((b, j) => (
          <li key={j}>{inline(b, `${key}-${j}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  text.split("\n").forEach((line, idx) => {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flush(`ul-${idx}`);
    if (line.trim()) blocks.push(<p key={`p-${idx}`}>{inline(line, `p-${idx}`)}</p>);
  });
  flush("ul-end");
  return <div className="space-y-2">{blocks}</div>;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Keep the newest message in view as replies stream in.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // Focus the input on open; Esc closes and returns focus to the launcher.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Abort an in-flight reply if the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const setReply = (reply: string) =>
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: reply }]);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        setReply(
          res.status === 503
            ? "The assistant isn't available right now. Please call 1-800-799-2505 (24/7) or request a quote."
            : err?.error ?? "Something went wrong. Please try again, or call 1-800-799-2505.",
        );
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        const reset = reply.lastIndexOf("\u0000");
        setReply(reset >= 0 ? reply.slice(reset + 1) : reply);
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setReply("Connection lost. Please try again, or call 1-800-799-2505.");
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="TNT assistant"
          className="fixed inset-x-3 bottom-20 z-[70] flex max-h-[min(36rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl shadow-black/25 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[24rem]"
        >
          <div className="flex items-center justify-between bg-black px-4 py-3">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-tnt-amber" />
              <p className="font-body text-sm font-bold tracking-[0.12em] text-white uppercase">
                Ask TNT
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label="Close assistant"
              className="rounded-md p-1 text-white/70 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div
            ref={listRef}
            data-lenis-prevent
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 font-body text-sm leading-relaxed text-black"
          >
            <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-tnt-gray px-3 py-2">{GREETING}</div>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-black px-3 py-2 whitespace-pre-wrap text-white">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[85%] rounded-lg rounded-tl-sm bg-tnt-gray px-3 py-2">
                  {m.content ? (
                    <MessageText text={m.content} />
                  ) : (
                    <span className="inline-flex gap-1 py-1" aria-label="Assistant is typing">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:240ms]" />
                    </span>
                  )}
                </div>
              ),
            )}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-black/15 px-3 py-1.5 text-left text-[13px] text-black/80 transition-colors hover:border-tnt-amber hover:bg-tnt-amber/10 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-black/10 p-3"
          >
            <div className="flex items-end gap-2">
              <label htmlFor="tnt-chat-input" className="sr-only">
                Message the TNT assistant
              </label>
              <textarea
                id="tnt-chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={2000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about cranes, services, locations…"
                className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-md border border-black/15 px-3 py-2 font-body text-sm text-black placeholder:text-black/40 focus:border-black focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-black text-tnt-amber transition-colors hover:bg-tnt-slate disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="mt-2 font-body text-[11px] text-black/45">
              AI answers can be inaccurate. Confirm job details with dispatch: 1-800-799-2505.
            </p>
          </form>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close TNT assistant" : "Open TNT assistant"}
        className="fixed right-4 bottom-4 z-[70] flex items-center gap-2 rounded-full bg-tnt-amber py-3 pr-5 pl-4 font-body text-sm font-semibold text-black shadow-lg shadow-black/40 transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-tnt-amber-vivid focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none sm:right-6 sm:bottom-6"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 5h16v11H8l-4 4V5z" strokeLinejoin="round" />
          )}
        </svg>
        {open ? "Close" : "Ask TNT"}
      </button>
    </>
  );
}
