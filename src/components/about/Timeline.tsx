"use client";

/**
 * TIMELINE — "the route": TNT's growth told as stops along one line.
 *
 * SCROLL-DRIVEN (2026-10-08, on request — "bring scroll animations on this
 * THE ROUTE SO FAR section", scroll-driven story chosen over a one-time
 * reveal):
 *
 * Desktop (lg+), motion allowed: the route sits in a tall wrapper
 * (`motion-safe:lg:h-[200vh]`) whose inner frame is `position: sticky`, so
 * the timeline stays pinned while the page scrolls through it. Scroll
 * progress through the wrapper drives everything: the gold line fills
 * continuously, each stop activates as the line reaches it, and that
 * chapter's panel fades up. It's ordinary page scroll — nothing intercepts
 * the wheel — and clicking a year (or arrow keys / Home / End on the tabs)
 * scrolls the page to that chapter's point, so the two never disagree.
 *
 * DISSOLVE (2026-10-08, on request — "smooth dissolve on ... text
 * changes"): the panel used to remount the chapter (old text gone at once,
 * new text fading up). Now all chapters are stacked and crossfade on
 * opacity (out 300ms; in 500ms after a 150ms beat — FADE_IN / FADE_OUT)
 * — see the DISSOLVE note in the panel markup.
 *
 * The pinned layout is pure CSS behind `motion-safe:lg:`, so there's no
 * hydration flash and reduced motion simply gets the un-pinned version: a
 * normal click-to-select tablist (the scroll range is then ~0 and the
 * scroll loop leaves `active` to clicks).
 *
 * PACE (2026-10-08, on request — "increase the speed of the scrolling
 * animation"): wrapper cut 320vh → 200vh, i.e. ~525px → ~255px of scroll per
 * chapter at a 900px viewport (scroll range = wrapper height − pinned frame
 * height); chapter fade 400 → 250ms, stop transition 300 → 200ms, click-to-
 * chapter scroll 0.9 → 0.6s. To change the pace again, the wrapper height is
 * the one knob that matters.
 *
 * Mobile/tablet: the chapters as a vertical route, all visible. With motion
 * allowed, the route's gold line draws down with scroll and each chapter
 * fades up once its top passes 85% of the viewport (checked by position
 * each frame, so jumping past a chapter still reveals it). The hidden "not yet seen" state is only applied
 * after mount (`armed`), so without JS everything is simply visible.
 *
 * Desktop and mobile layouts are toggled with CSS `display`, so only one is
 * ever in the accessibility tree. Scroll position is read in a rAF loop that
 * only runs while the section is near the viewport (IntersectionObserver) —
 * window scroll events are unreliable under Lenis (see SiteNav.tsx).
 *
 * Only verified milestones live here — see aboutData.ts for sources.
 *
 * DARK THEME (TNT Dark, 2026-10-15): sits on the page's black band. Track
 * and inactive text are white-alpha; unreached stops are filled with the
 * band's black (they were white on TNT Light's grey band) and the mobile
 * dot's ring border matches it too. Company logos sit on a small light chip:
 * RMS Cranes' wordmark is plain black artwork with no white version in the
 * brand files, so it would vanish on black otherwise — all logos get the
 * chip so they read as one set.
 */

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";
import { MILESTONES, type Milestone } from "./aboutData";

const LAST = MILESTONES.length - 1;
/** Staggered dissolve: the outgoing chapter fades out quickly, the incoming
 *  one fades in a beat later and slower. Still reads as one smooth dissolve,
 *  but the overlap is short — a jump that scrolls past chapters (1985 →
 *  2014 passes 2012) no longer stacks three chapters' text at once. The
 *  transition timing comes from the target state, so each direction gets
 *  its own duration. */
const FADE_IN = "opacity-100 motion-safe:duration-500 motion-safe:delay-150";
const FADE_OUT = "opacity-0 motion-safe:duration-300 motion-safe:delay-0";
/** The line spans the middle 80% of the row (stop 0 at 10%, last at 90%). */
const LINE_SPAN = 80;

function Logos({ m, className = "" }: { m: Milestone; className?: string }) {
  if (!m.logos.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {m.logos.map((l) => (
        <span key={l.src} className="inline-flex rounded-md bg-[#f5f4f0] px-3 py-2">
          <Image src={l.src} alt={l.alt} width={160} height={48} className="h-9 w-auto" />
        </span>
      ))}
    </div>
  );
}

/** Calls `onFrame` every animation frame while `el` is near the viewport. */
function useNearViewportLoop(el: React.RefObject<HTMLElement | null>, onFrame: () => void) {
  const cb = useRef(onFrame);
  useEffect(() => {
    cb.current = onFrame;
  });
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let raf = 0;
    const loop = () => {
      cb.current();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(raf);
        if (entry.isIntersecting) raf = requestAnimationFrame(loop);
        else cb.current(); // settle the final state as it leaves
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [el]);
}

export default function Timeline() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);
  const m = MILESTONES[active];

  /** Scroll distance the pinned frame travels, or 0 when not pinned. */
  const pinRange = () => {
    const wrap = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return 0;
    return Math.max(0, wrap.offsetHeight - frame.offsetHeight);
  };

  // Desktop scroll-driven progress.
  useNearViewportLoop(wrapRef, () => {
    const wrap = wrapRef.current;
    const range = pinRange();
    if (!wrap || range < 40) {
      // Not pinned (reduced motion / below lg): the line follows clicks.
      if (fillRef.current) fillRef.current.style.width = `${(activeRef.current / LAST) * LINE_SPAN}%`;
      return;
    }
    const scrolled = CHROME_H - wrap.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, scrolled / range));
    if (fillRef.current) fillRef.current.style.width = `${p * LINE_SPAN}%`;
    // A stop activates once the line reaches it (small lead so it lands
    // just as the fill arrives, not after).
    const next = Math.min(LAST, Math.floor(p * LAST + 0.08));
    if (next !== activeRef.current) {
      activeRef.current = next;
      setActive(next);
    }
  });

  /** Select stop i: scroll to its point when pinned, else just select. */
  const select = (i: number, { smooth = true }: { smooth?: boolean } = {}) => {
    const wrap = wrapRef.current;
    const range = pinRange();
    if (wrap && range >= 40) {
      const wrapTop = window.scrollY + wrap.getBoundingClientRect().top;
      const y = wrapTop - CHROME_H + (i / LAST) * range + 2;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, smooth ? { duration: 0.6 } : { immediate: true });
      else window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
      return;
    }
    activeRef.current = i;
    setActive(i);
    if (fillRef.current) fillRef.current.style.width = `${(i / LAST) * LINE_SPAN}%`;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next =
      e.key === "ArrowRight" ? Math.min(LAST, active + 1)
      : e.key === "ArrowLeft" ? Math.max(0, active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? LAST
      : null;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabs.current[next]?.focus({ preventScroll: true });
  };

  // ── Mobile: line draws with scroll, chapters fade up on entry ──────────
  const listRef = useRef<HTMLOListElement>(null);
  const mobileLineRef = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(false);
  const [seen, setSeen] = useState<boolean[]>(() => MILESTONES.map(() => false));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const seenRef = useRef(seen);
  useNearViewportLoop(listRef, () => {
    const list = listRef.current;
    const line = mobileLineRef.current;
    if (!list || !line || !armed) return;
    const r = list.getBoundingClientRect();
    // Fill as the list passes the 70% line of the viewport.
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / r.height));
    line.style.transform = `scaleY(${p})`;
    // Reveal every chapter whose top has passed 85% of the viewport — by
    // position, not by "seen crossing", so a fast flick or an anchor jump
    // past a chapter can never leave it invisible.
    const revealAt = window.innerHeight * 0.85;
    const items = list.querySelectorAll<HTMLElement>("[data-step]");
    let changed = false;
    const next = seenRef.current.map((v, i) => {
      if (v) return v;
      const hit = items[i] ? items[i].getBoundingClientRect().top < revealAt : false;
      if (hit) changed = true;
      return hit;
    });
    if (changed) {
      seenRef.current = next;
      setSeen(next);
    }
  });

  return (
    <div>
      {/* ── Desktop: scroll-driven, pinned route ────────────────────────── */}
      <div ref={wrapRef} className="relative hidden lg:block motion-safe:lg:h-[200vh]">
        <div
          ref={frameRef}
          className="motion-safe:lg:sticky motion-safe:lg:top-[var(--chrome-h)] motion-safe:lg:flex motion-safe:lg:h-[calc(100svh-var(--chrome-h))] motion-safe:lg:flex-col motion-safe:lg:justify-center"
        >
          <div className="flex items-baseline justify-between">
            <p className="font-body text-xs font-bold tracking-[0.18em] text-white/50 uppercase">The route so far</p>
            <p aria-hidden="true" className="font-body text-xs font-bold tracking-[0.18em] text-white/50 tabular-nums">
              {String(active + 1).padStart(2, "0")} / {String(LAST + 1).padStart(2, "0")}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="TNT milestones"
            onKeyDown={onKeyDown}
            className="relative mt-8 grid"
            style={{ gridTemplateColumns: `repeat(${MILESTONES.length}, minmax(0, 1fr))` }}
          >
            {/* The line, and its gold fill (width driven by scroll). */}
            <span aria-hidden="true" className="absolute top-[1.15rem] right-[10%] left-[10%] h-0.5 bg-white/15" />
            <span
              ref={fillRef}
              aria-hidden="true"
              className="absolute top-[1.15rem] left-[10%] h-0.5 bg-tnt-amber"
              style={{ width: "0%" }}
            />
            {MILESTONES.map((ms, i) => {
              const selected = i === active;
              const reached = i <= active;
              return (
                <button
                  key={ms.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`milestone-tab-${ms.id}`}
                  aria-selected={selected}
                  aria-controls="milestone-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className="group relative flex flex-col items-center gap-3 rounded-md pb-2 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className={`relative z-10 flex h-[2.3rem] w-[2.3rem] items-center justify-center rounded-full border-2 motion-safe:transition-[background-color,border-color,transform] motion-safe:duration-200 ${
                      reached ? "border-tnt-amber bg-tnt-amber" : "border-white/25 bg-black group-hover:border-white/50"
                    } ${selected ? "motion-safe:scale-110" : ""}`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${selected ? "bg-black" : reached ? "bg-black/40" : "bg-white/20"}`} />
                  </span>
                  <span className={`font-display text-2xl tracking-wide motion-safe:transition-colors ${selected ? "text-white" : "text-white/50 group-hover:text-white/75"}`}>
                    {ms.year}
                  </span>
                  <span className={`font-body text-xs font-semibold tracking-[0.14em] uppercase ${selected ? "text-white/75" : "text-white/60"}`}>
                    {ms.chapter}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="milestone-panel"
            role="tabpanel"
            aria-labelledby={`milestone-tab-${m.id}`}
            tabIndex={0}
            className="mt-10 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-end gap-12 border-t border-white/10 pt-10 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
          >
            {/* DISSOLVE: every chapter is rendered, stacked in the same grid
                cell, and only the active one is opaque, so a change is a true
                crossfade (old out while new in) rather than a swap. Opacity
                only, no movement; instant under reduced motion. Inactive
                layers are aria-hidden + inert, so only the active chapter is
                read or focusable. Stacking also fixes the panel's height to
                the tallest chapter, so nothing below shifts as text changes. */}
            <div className="grid items-end">
              {MILESTONES.map((ms, i) => (
                <p
                  key={ms.id}
                  aria-hidden={i !== active}
                  className={`[grid-area:1/1] font-display text-[clamp(5rem,11vw,10rem)] leading-[0.85] text-white motion-safe:transition-opacity motion-safe:ease-in-out ${
                    i === active ? FADE_IN : FADE_OUT
                  }`}
                >
                  {ms.year}
                </p>
              ))}
            </div>
            <div className="grid items-start">
              {MILESTONES.map((ms, i) => (
                <div
                  key={ms.id}
                  aria-hidden={i !== active}
                  inert={i !== active}
                  className={`[grid-area:1/1] motion-safe:transition-opacity motion-safe:ease-in-out ${
                    i === active ? FADE_IN : FADE_OUT
                  }`}
                >
                  <p className="font-body text-xs font-bold tracking-[0.18em] text-tnt-amber uppercase">{ms.place}</p>
                  <h3 className="mt-3 font-display text-3xl tracking-wide text-white uppercase">{ms.chapter}</h3>
                  <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-white/70">{ms.body}</p>
                  <Logos m={ms} className="mt-6" />
                </div>
              ))}
            </div>
          </div>

          <p aria-hidden="true" className="mt-8 hidden font-body text-xs text-white/45 motion-safe:lg:block">
            Scroll to follow the route, or pick a year.
          </p>
        </div>
      </div>

      {/* ── Mobile / tablet: vertical route, everything readable ──────── */}
      <div className="lg:hidden">
        <p className="font-body text-xs font-bold tracking-[0.18em] text-white/50 uppercase">The route so far</p>
        <div className="relative mt-8">
          {/* Track + gold line that draws down with scroll (motion only). */}
          <span aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-0.5 bg-white/10" />
          <span
            ref={mobileLineRef}
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-0 w-0.5 origin-top bg-tnt-amber"
            style={armed ? { transform: "scaleY(0)" } : undefined}
          />
        <ol ref={listRef} className="relative space-y-10 pl-8">
          {MILESTONES.map((ms, i) => {
            const hidden = armed && !seen[i];
            return (
              <li
                key={ms.id}
                data-step={i}
                className={`relative motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out ${
                  hidden ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-2 -left-[2.45rem] h-4 w-4 rounded-full border-4 border-black bg-tnt-amber ring-2 ring-tnt-amber"
                />
                <p className="font-display text-5xl leading-none text-white">{ms.year}</p>
                <p className="mt-2 font-body text-xs font-bold tracking-[0.18em] text-tnt-amber uppercase">{ms.place}</p>
                <h3 className="mt-2 font-display text-2xl tracking-wide text-white uppercase">{ms.chapter}</h3>
                <p className="mt-3 font-body text-base leading-relaxed text-white/70">{ms.body}</p>
                <Logos m={ms} className="mt-4" />
              </li>
            );
          })}
        </ol>
        </div>
      </div>
    </div>
  );
}
