"use client";

/**
 * SMOOTH SCROLL — the animation foundation.
 *
 * Boots Lenis (inertial smooth scroll) and makes GSAP's ticker the single rAF
 * loop that drives BOTH the scroll and every ScrollTrigger animation. Before
 * this, each scroll-reactive piece (hero canvas scrub, nav reveal, count-ups,
 * image reveals) ran its own independent rAF loop reading layout every frame —
 * they competed on the main thread and starved each other mid-animation. From
 * here, new scroll-linked motion should be built on GSAP ScrollTrigger so it
 * shares this one loop instead of adding another.
 *
 * Renders nothing; mount once, high in the tree (root layout).
 *
 * Guards:
 *  - prefers-reduced-motion → Lenis is never started; native scrolling and the
 *    CSS `scroll-behavior: smooth` fallback stay in effect.
 *  - touch (coarse pointer) → smoothing is left to the native momentum scroll,
 *    which already feels right on mobile and avoids fighting the OS. Wheel/
 *    trackpad on pointer devices is where Lenis earns its keep.
 *
 * ALWAYS RELOADS TO THE TOP (2026-09-11, on request: "if I reloaded the
 * website it needs to start from hero section"). The browser's own scroll
 * restoration was the culprit — nothing here had ever touched
 * `history.scrollRestoration`, so a reload could land wherever the tab was
 * last scrolled, same as any ordinary page. That interacted badly with the
 * hero's own one-shot autoplay + "becomes unreachable" wall (see
 * useHeroAutoScroll.ts): the restored position could already read as
 * "past the hero" the instant the wall's flag checked it, so it looked like
 * reloading skipped the hero entirely rather than replaying it. Setting
 * `scrollRestoration = "manual"` and forcing `window.scrollTo(0, 0)` up
 * front — before Lenis boots, and unconditionally, even under
 * prefers-reduced-motion — makes every load (reload included) start at
 * scrollY 0, which is what lets `useHeroAutoScroll`'s own one-shot state
 * (reset by the reload itself, since it's just a module variable) and the
 * actual scroll position agree on "this is a fresh visit".
 */

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The live Lenis instance, for the rare caller that has to DRIVE the scroll
 * rather than react to it (see useHeroAutoScroll). Anything that merely reads
 * scroll position should use ScrollTrigger instead — that's what shares the
 * one rAF loop.
 *
 * Null before mount, and null for the whole session under prefers-reduced-
 * motion, where Lenis is deliberately never booted. Callers must handle null;
 * for a programmatic-scroll feature, null is the correct signal to do nothing.
 */
let instance: Lenis | null = null;
export const getLenis = () => instance;

export default function SmoothScroll() {
  useEffect(() => {
    // Unconditional and first — a reload should start at the top regardless
    // of motion preference, so this runs before the reduced-motion branch
    // below, not after it.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return; // native scroll; nothing to boot or tear down

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.1, // inertia; lower = heavier glide
      smoothWheel: true,
      // Leave touch to native momentum — Lenis smoothing on touch fights the OS.
    });

    instance = lenis;

    // Keep ScrollTrigger's cached positions in sync with Lenis on every scroll.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker so there is exactly one rAF loop. GSAP
    // gives time in seconds; Lenis wants milliseconds.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0); // don't let GSAP "catch up" after a stall

    // ── Recompute trigger positions once async content settles ──────────────
    // Every ScrollTrigger caches its start/end as PIXEL positions when its
    // component mounts (during hydration). But the R3F/WebGL hero and the
    // remote hero/section images finish laying out AFTER that — the hero only
    // takes its full 500vh height once mounted — which pushes the absolute
    // position of every section below it downward. Without a refresh, those
    // triggers keep their stale (too-early) start/end, so a scrubbed section
    // like StatementSection reaches progress 1 within a few px and looks frozen
    // fully-expanded. A single ScrollTrigger.refresh() after layout settles
    // repairs ALL of them at once.
    //
    // A ResizeObserver on <body> catches the exact moment the hero/images
    // change document height (debounced to one rAF); the load + fonts.ready
    // passes cover anything the observer misses. Absolutely-positioned scrub
    // elements (the expanding card, translated titles) don't change body
    // height, so this never feeds back on itself during an animation.
    let refreshRaf = 0;
    const scheduleRefresh = () => {
      cancelAnimationFrame(refreshRaf);
      refreshRaf = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const ro = new ResizeObserver(scheduleRefresh);
    ro.observe(document.body);
    window.addEventListener("load", scheduleRefresh);
    document.fonts?.ready.then(scheduleRefresh);
    const settleTimer = window.setTimeout(scheduleRefresh, 600);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      ro.disconnect();
      window.removeEventListener("load", scheduleRefresh);
      window.clearTimeout(settleTimer);
      cancelAnimationFrame(refreshRaf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
