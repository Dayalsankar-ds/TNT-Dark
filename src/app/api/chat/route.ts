/**
 * POST /api/chat — the site assistant (ChatWidget.tsx). Streams Claude's
 * reply back as plain UTF-8 text chunks.
 *
 * Request body: { messages: { role: "user" | "assistant"; content: string }[] }
 * — the whole visible conversation, oldest first, ending with the visitor's
 * new message. The API is stateless, so the client resends history each turn.
 *
 * Needs ANTHROPIC_API_KEY in the environment (.env.local for dev; the
 * project's environment variables on Vercel). Without it the route answers
 * 503 and the widget shows a "not available" message.
 *
 * Grounding lives in src/lib/chat/knowledge.ts (SYSTEM_PROMPT).
 */

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/chat/knowledge";

// A chat turn at low effort is seconds, not minutes; this bounds a stuck one.
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
const MAX_MESSAGES = 20; // conversation turns kept per request
const MAX_CHARS = 2000; // per message
const MAX_TOTAL_CHARS = 16000; // whole conversation

/** Shown in the widget when Claude declines, even after the fallback chain. */
const REFUSAL_REPLY =
  "Sorry, I can't help with that here. For anything about a job, call 1-800-799-2505 (24/7) or request a quote.";
/** Shown when the API call itself fails (outage, bad key, rate limit). */
const ERROR_REPLY =
  "The assistant is having trouble right now. Please try again shortly, or call 1-800-799-2505 (24/7).";

// BEST-EFFORT RATE LIMIT: per-IP sliding window held in this server
// instance's memory. On a single dev server it's exact; on Vercel each
// serverless instance has its own copy, so it only slows a single abuser
// down. Put a durable limiter (e.g. Vercel KV / Upstash) in front before
// heavy public traffic.
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

/** Validates the body into SDK message params, or returns an error string. */
function parseMessages(body: unknown): Anthropic.Beta.BetaMessageParam[] | string {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return "messages must be a non-empty array";
  const recent = raw.slice(-MAX_MESSAGES);
  let total = 0;
  const out: Anthropic.Beta.BetaMessageParam[] = [];
  for (const m of recent) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return "each message needs a role of user or assistant and string content";
    }
    const text = content.trim().slice(0, MAX_CHARS);
    if (!text) continue;
    total += text.length;
    out.push({ role, content: text });
  }
  // Trimming to the last N can leave an assistant turn first; the API needs
  // the conversation to open with the user.
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user") return "the last message must be from the user";
  if (total > MAX_TOTAL_CHARS) return "conversation too long";
  return out;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Chat is not configured." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many messages. Please wait a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const messages = parseMessages(body);
  if (typeof messages === "string") {
    return Response.json({ error: messages }, { status: 400 });
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    // Chat answers are short and factual; low effort keeps them fast.
    output_config: { effort: "low" },
    // Server-side fallback: if a safety classifier declines, the API retries
    // on Anthropic's recommended model for that refusal category.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sentText = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sentText = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        // A refusal that survived the fallback chain: replace any partial
        // text with the canned reply (the widget swaps on the \u0000 marker).
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(`${sentText ? "\u0000" : ""}${REFUSAL_REPLY}`));
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          console.error("[chat] Anthropic rate limit", error.message);
        } else if (error instanceof Anthropic.AuthenticationError) {
          console.error("[chat] Anthropic authentication failed — check ANTHROPIC_API_KEY");
        } else if (error instanceof Anthropic.APIError) {
          console.error(`[chat] Anthropic API error ${error.status}`, error.message);
        } else {
          console.error("[chat] stream failed", error);
        }
        controller.enqueue(encoder.encode(`${sentText ? "\u0000" : ""}${ERROR_REPLY}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      // Visitor closed the panel or navigated away — stop generating.
      stream.abort();
    },
  });

  return new Response(body$, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
