"use client";

/**
 * REVEAL TEXT — horizontal wipe headline reveal.
 *
 * A solid bar sweeps across each line left-to-right, then retracts off to the
 * right, uncovering the words as it goes. Lines fire in sequence, so a
 * multi-line heading wipes in top to bottom.
 *
 * Per line the sequence is: bar grows from the left edge → the line's text is
 * switched on while it sits hidden behind the bar → the bar retracts to the
 * right, revealing the text in its wake. The text itself never moves; the bar
 * is the entire effect.
 *
 * Why the bars are built at play time rather than in markup: where a heading
 * breaks depends on the rendered width, so real line boxes can't be known at
 * build time. Each word is its own inline-block, words are grouped into lines
 * by their vertical offset, and one bar is measured and positioned per line —
 * so the effect survives any reflow, wrap, or font swap.
 *
 * The bar must contrast with the SECTION, not the text — on a dark section a
 * dark bar is invisible. `barClassName` carries that per call site.
 *
 * Triggering is an IntersectionObserver, not a ScrollTrigger, on purpose. A
 * ScrollTrigger-driven `gsap.from` applies the hidden start state immediately
 * and only clears it when the trigger fires, so anything that stopped the
 * trigger (a starved ticker, stale positions after the hero resized) left the
 * heading PERMANENTLY INVISIBLE rather than merely un-animated. An observer
 * fires from the browser's own compositing, so it can't be starved. The tween
 * still runs on the shared GSAP ticker.
 *
 * prefers-reduced-motion: no bars are built and nothing is hidden — the heading
 * renders as plain static text.
 */

import {
  Fragment,
  useEffect,
  useRef,
  type ElementType,
  type FC,
  type ReactNode,
  type Ref,
} from "react";
import { gsap } from "gsap";

/** Sweep-in and retract each take this long. */
const WIPE = 0.42;
/** Gap between consecutive lines starting their wipe. */
const LINE_STAGGER = 0.12;
/** Words whose tops are within this many px count as the same line. */
const LINE_TOLERANCE = 6;
/** Breathing room so the bar fully covers ascenders/descenders. */
const BAR_PAD_Y = 2;

export default function RevealText({
  text,
  as = "h2",
  className = "",
  barClassName = "bg-black",
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** Colour of the sweeping bar. Must contrast with the SECTION background. */
  barClassName?: string;
  /** Seconds to hold before the first line wipes. */
  delay?: number;
}) {
  // A bare `ElementType` JSX tag type-collapses its children to `never` under
  // @types/react ≥19.2.17 (and `ElementType<P>` is a union too large to
  // check). Present the tag as a single component signature carrying only the
  // props this component actually passes.
  const Tag = as as unknown as FC<{
    ref?: Ref<HTMLElement>;
    className?: string;
    children?: ReactNode;
  }>;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    if (!words.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Hide immediately so there's no flash of finished text before the wipe.
    gsap.set(words, { opacity: 0 });

    let played = false;
    const bars: HTMLElement[] = [];

    // Grouped at play time, not setup time, so grouping always matches the
    // current wrap — a resize before the heading is reached can't desync it.
    const groupIntoLines = () => {
      const lines: { top: number; words: HTMLElement[] }[] = [];
      for (const w of words) {
        const top = w.offsetTop;
        const line = lines.find((l) => Math.abs(l.top - top) < LINE_TOLERANCE);
        if (line) line.words.push(w);
        else lines.push({ top, words: [w] });
      }
      return lines.sort((a, b) => a.top - b.top).map((l) => l.words);
    };

    const play = () => {
      if (played) return;
      played = true;

      const host = el.getBoundingClientRect();
      const tl = gsap.timeline({ delay });

      groupIntoLines().forEach((lineWords, i) => {
        // Union box of this line, in coordinates local to the heading.
        const rects = lineWords.map((w) => w.getBoundingClientRect());
        const left = Math.min(...rects.map((r) => r.left)) - host.left;
        const right = Math.max(...rects.map((r) => r.right)) - host.left;
        const top = Math.min(...rects.map((r) => r.top)) - host.top;
        const bottom = Math.max(...rects.map((r) => r.bottom)) - host.top;

        const bar = document.createElement("span");
        bar.setAttribute("aria-hidden", "true");
        bar.className = `pointer-events-none absolute ${barClassName}`;
        bar.style.left = `${left}px`;
        bar.style.top = `${top - BAR_PAD_Y}px`;
        bar.style.width = `${right - left}px`;
        bar.style.height = `${bottom - top + BAR_PAD_Y * 2}px`;
        el.appendChild(bar);
        bars.push(bar);

        const at = i * LINE_STAGGER;
        // Sweep in from the left…
        tl.fromTo(
          bar,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: WIPE, ease: "power2.inOut" },
          at,
        )
          // …switch the words on while they sit hidden behind the bar…
          .set(lineWords, { opacity: 1 }, at + WIPE)
          // …then retract off to the right, uncovering them.
          .to(
            bar,
            {
              scaleX: 0,
              transformOrigin: "right center",
              duration: WIPE,
              ease: "power2.inOut",
            },
            at + WIPE,
          );
      });

      // Bars are scaffolding — drop them once the wipe is done.
      tl.eventCallback("onComplete", () => {
        bars.forEach((b) => b.remove());
        bars.length = 0;
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            play();
            io.disconnect();
          }
        }
      },
      // Fires a little before the heading is fully on screen, so the motion
      // reads as part of arriving at the section rather than a late correction.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      gsap.killTweensOf(words);
      bars.forEach((b) => {
        gsap.killTweensOf(b);
        b.remove();
      });
      // Never leave the heading mid-wipe and invisible on unmount.
      gsap.set(words, { opacity: 1 });
    };
  }, [delay, barClassName]);

  const words = text.split(" ");
  return (
    // `relative` anchors the per-line bars; `isolate` keeps them from painting
    // over neighbouring content if a section sets its own stacking context.
    <Tag ref={ref} className={`relative isolate ${className}`}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span data-word className="inline-block">
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
