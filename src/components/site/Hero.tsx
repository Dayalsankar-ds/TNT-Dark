"use client";

/**
 * HERO — rebuilt 2026-10-01, on request, from new footage ("First clip.mp4" +
 * "Second clip.mp4", supplied directly), after the previous hero was removed
 * entirely on 2026-09-23 (see page.tsx's own history note). Converted to a
 * 578-frame WebP sequence (public/video/frames-v7, 1280px wide) and merged by
 * continuous frame numbering (clip 1 = 00000–00264, clip 2 picks up at
 * 00265) rather than two separate sequences, so playback reads as one
 * continuous shot.
 *
 * QUALITY (2026-10-01, on request — "increase the quality of this video
 * clip"): re-encoded at WebP q75 (up from the old hero pipeline's q40 this
 * first shipped with) — same 1280px width and frame count, just less
 * compression per frame. 39MB total, up from 25MB. Width wasn't raised to
 * the 1918px source resolution in the same pass — that alone would roughly
 * 2.25x the payload on top of the quality bump, which is a separate,
 * heavier tradeoff than "look less compressed" calls for.
 *
 * FULLY AUTOMATED, NOT SCROLL-DRIVEN (on request — "I don't want have user
 * interaction while playing. Every thing automated from first frame to last
 * frame. User can experience only one time. After that they need to reload
 * the site to experience it again"): this is NOT the old hero's
 * scroll-scrubbed pin (590vh section, frame position tied to scroll offset,
 * HeroFrameGL/WebGL, useHeroAutoScroll claiming the scroll itself). There is
 * no scroll interaction of any kind here — the section is a normal
 * single-viewport-height block, and playback is pure elapsed time: all 578
 * frames preload, then a single rAF loop steps through them at the
 * source's own 24fps (~24s total) the moment they're ready, stopping dead on
 * the last frame rather than looping. A user who reloads gets the play
 * through again from frame 0 (a fresh mount re-preloads and restarts); one
 * who doesn't reload is left looking at the final frame (the TNT logo
 * reveal) — there is no replay affordance by design, per the request above.
 *
 * A single <img> tag has its `src` swapped each tick rather than a canvas —
 * every frame is already a preloaded, cache-resident Image() object by the
 * time playback starts, so each swap is a cache hit, not a network request.
 * `object-cover` handles the crop/scale, so there's no manual draw-rect math
 * the way the old canvas-based HeroFrameGL needed.
 *
 * REDUCED MOTION: skips the sequence entirely and shows frame 0 as a static
 * poster — no preloading of the other 577 frames, no rAF loop. No "poster
 * mode" for low-end devices/coarse pointers the way the old hero had
 * (scrub vs. poster vs. reduced): the old distinction existed because
 * scroll-scrubbing WebGL was the expensive part, and nothing here scrubs —
 * swapping a 1280px img.src 24 times a second is comfortably cheap on any
 * device this site otherwise supports. Read into a ref, not state — it only
 * ever gates which branch the mount effect takes, never what JSX renders, so
 * there's nothing for a re-render to accomplish (same pattern
 * EquipmentGuide.tsx's `reducedMotionRef` uses for its own autoplay gate).
 *
 * `ready` becomes true via `requestAnimationFrame`/image `onload` callbacks,
 * never synchronously inside an effect body — `react-hooks/set-state-in-
 * effect` flags the latter (a same-tick setState cascades an extra render),
 * and deferring by one frame is invisible here regardless.
 *
 * FULL-BLEED UNDER THE FIXED NAV (2026-10-01, on request — "I can see dark
 * space on the top of this video clip"): this first shipped sitting inside
 * <main>'s normal `pt-[var(--chrome-h)]` nav clearance, which read as a
 * solid dark band above the footage instead of video running the full
 * height of the viewport. Reverted to the pre-removal placement instead —
 * page.tsx's wrapper cancels that padding (`-mt-[var(--chrome-h)] bg-black`)
 * so this section starts at true y=0, with `.glass-nav`'s own translucent,
 * backdrop-blurred fixed bar (SiteNav.tsx) floating over it exactly as it
 * did before. `h-screen` here (not the shorter mobile-specific height this
 * used at first) matches that full-bleed placement.
 *
 * PLAYBACK SPEED, PER CLIP (2026-10-01, on request, across five rounds —
 * "increase the speed of this video" → "increase the more speed on second
 * clip only" → "still increase the speed of the second clip" → "increase
 * the speed of the first clip too, I want full speed on both clip"): the
 * first request raised a single uniform `PLAYBACK_FPS` 24 → 40. The next
 * two asked for clip 2 specifically faster than clip 1, taking it 40 → 70 →
 * 110 while clip 1 stayed at 40. The last request caught clip 1 back up to
 * match — both `CLIP1_FPS` and `CLIP2_FPS` are 110 now, i.e. uniformly
 * fast rather than clip 1 being the slow half. The split into two named
 * constants (rather than going back to one shared `PLAYBACK_FPS`) is
 * deliberate even though the values are equal right now — keeping them
 * separate is what makes "just clip 2" or "just clip 1" a one-line change
 * again if a future request asks for that split back.
 * `frameIndexForElapsed()` is the one place that piecewise timing lives;
 * CLIP_SPLIT marks where the merged sequence's numbering crosses from clip
 * 1 into clip 2 (see the merge note above).
 *
 * AUTO-SCROLL ON COMPLETION, SKIPPING THE TRUE LAST FRAME (2026-10-01, on
 * request — "auto scroll up to nav bar visible. User no need to see last
 * frame of second clip"): playback never actually shows frame 577 (the held
 * TNT-logo card) — `LAST_VISIBLE_FRAME` caps the displayed index one frame
 * short of it, and the instant elapsed time would reach the end,
 * `scrollToFamilyStrip()` fires immediately rather than holding on whatever
 * frame is showing.
 *
 * LANDING SPOT, BACK AND FORTH (2026-10-01, same day, three requests in a
 * row): first landed on #family (FamilyStripV2, the logo strip right under
 * the hero) — the same spot the OLD hero's useHeroAutoScroll.ts used. Then
 * moved to #statement ("About Us"), on request ("just scroll to about us
 * section, no need to stop there [at Family]") — landing on the short
 * Family strip read as the scroll stalling partway rather than going
 * anywhere. Then moved BACK to #family, on request ("can we stop the auto
 * scroll on TNT Family of company section?") — so #family is the landing
 * spot again, same as the very first version; the intervening #statement
 * target was not kept. SiteNav.tsx's own reveal check also watches
 * #family's position directly, so landing there is the simplest case for
 * the nav to reveal correctly — no "is the next section far enough past
 * #family" reasoning needed the way the #statement version required.
 *
 * Driven by `getLenis()` (SmoothScroll.tsx) — the same "drive the scroll
 * programmatically" escape hatch useHeroAutoScroll.ts used — falling back
 * to a plain `window.scrollTo` under reduced motion / before Lenis has
 * booted.
 *
 * THE WALL (2026-10-01, on request — "we have to remove that scroll back to
 * the hero section final frame"): this shipped without one at first ("no
 * scroll-position wall... just a one-time nudge"), which meant a wheel-up
 * right after landing could scroll back into the (frozen-looking, since
 * playback has ended) hero — exactly the resting state the auto-scroll
 * exists to get past. `passedRef`/`boundaryRef` + the scroll listener below
 * are a deliberately smaller version of the OLD hero's own wall
 * (useHeroAutoScroll.ts's `heroPassed`/`onScroll`): that one also had to
 * fight a scroll-jacked, locked, mid-flight run; this only has to stop
 * scrollY from dropping back below the landing spot AFTER playback has
 * already finished and landed — so a plain scroll listener that clamps
 * scrollY back up to the boundary is sufficient, no lock/force-complete/
 * stall-watch machinery needed. Scrolling further DOWN past the boundary is
 * completely untouched — only the hero itself becomes unreachable again.
 */

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";

const FRAME_DIR = "/video/frames-v7";
const FRAME_COUNT = 578;
/** First index of clip 2 in the merged sequence (clip 1 is 00000–00264). */
const CLIP_SPLIT = 265;
/** Clip 1's playback rate (frames 00000–00264). Raised 40 → 110 (2026-10-01,
 *  "increase the speed of the first clip too, I want full speed on both
 *  clip") — now equal to clip 2's rate, i.e. uniformly fast rather than
 *  clip 1 being the slower of the two. */
const CLIP1_FPS = 110;
/** Clip 2's playback rate (frames 00265–00577). Raised 24 → 40 → 70 → 110
 *  across three earlier requests, then matched by CLIP1_FPS above so both
 *  clips now play at the same (fast) rate. */
const CLIP2_FPS = 110;
/** Never actually displayed — see AUTO-SCROLL note above. */
const LAST_VISIBLE_FRAME = FRAME_COUNT - 2;

const CLIP1_FRAME_DURATION = 1000 / CLIP1_FPS;
const CLIP2_FRAME_DURATION = 1000 / CLIP2_FPS;
const CLIP1_DURATION = CLIP_SPLIT * CLIP1_FRAME_DURATION;
const CLIP2_DURATION = (FRAME_COUNT - CLIP_SPLIT) * CLIP2_FRAME_DURATION;
const TOTAL_DURATION = CLIP1_DURATION + CLIP2_DURATION;

const framePath = (n: number) => `${FRAME_DIR}/${String(n).padStart(5, "0")}.webp`;

/** Elapsed ms since playback started → the frame to show, capped at
 *  LAST_VISIBLE_FRAME regardless of how far elapsed has actually gone. */
function frameIndexForElapsed(elapsed: number): number {
  const index =
    elapsed < CLIP1_DURATION
      ? Math.floor(elapsed / CLIP1_FRAME_DURATION)
      : CLIP_SPLIT + Math.floor((elapsed - CLIP1_DURATION) / CLIP2_FRAME_DURATION);
  return Math.min(index, LAST_VISIBLE_FRAME);
}

/** Scrolls to #family (the Family-of-companies logo strip) — see the
 *  LANDING SPOT note above for the back-and-forth that settled here. Lenis
 *  when it's booted (the ordinary case); a plain smooth window.scrollTo as
 *  the fallback (whose completion is approximated with a timeout — no
 *  cross-browser-reliable completion event for native smooth scroll).
 *  Returns the target scrollY (or null if #family isn't on the page) so the
 *  caller can use it as THE WALL's boundary. */
function scrollToFamilyStrip(onComplete: () => void): number | null {
  const family = document.getElementById("family");
  if (!family) return null;
  const margin = 24; // comfortably past the nav's reveal line, not balanced on it
  const target = window.scrollY + family.getBoundingClientRect().top - CHROME_H + margin;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.2, onComplete });
  } else {
    window.scrollTo({ top: target, behavior: "smooth" });
    window.setTimeout(onComplete, 700);
  }
  return target;
}

export default function Hero() {
  const imgRef = useRef<HTMLImageElement>(null);
  const reducedMotionRef = useRef(false);
  const [ready, setReady] = useState(false);
  // THE WALL — see that docblock note above. `passedRef` flips true only
  // once the post-playback scroll has actually landed (not when it starts),
  // so the wall can't fight the very scroll that sets it up. `boundaryRef`
  // is the scrollY scrollToFamilyStrip() landed on; null until then.
  const passedRef = useRef(false);
  const boundaryRef = useRef<number | null>(null);

  // Preload every frame before playback starts — a mid-sequence stutter
  // waiting on a late frame would be worse than a longer, one-time wait up
  // front. Skipped entirely under reduced motion (frame 0 is a plain <img>,
  // loaded the normal way) — `ready` still flips, just via a deferred rAF
  // instead of a same-tick setState.
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotionRef.current) {
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }

    let cancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let settled = 0;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const done = () => {
        if (cancelled) return;
        settled += 1;
        if (settled === FRAME_COUNT) setReady(true);
      };
      img.onload = done;
      img.onerror = done; // a missing frame must not deadlock the preload
      img.src = framePath(i);
      images[i] = img;
    }
    return () => {
      cancelled = true;
      for (const img of images) {
        img.onload = null;
        img.onerror = null;
        img.src = "";
      }
    };
  }, []);

  // The one-time playback. Elapsed-time driven, not frame-count driven, so a
  // dropped rAF tick shows a later frame next time rather than falling
  // behind permanently. Ends by handing off to scrollToFamilyStrip() rather
  // than holding on a final frame — see that function's own note above.
  useEffect(() => {
    if (!ready || reducedMotionRef.current) return;
    let startTime: number | null = null;
    let rafId: number;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      if (imgRef.current) imgRef.current.src = framePath(frameIndexForElapsed(elapsed));
      if (elapsed < TOTAL_DURATION) {
        rafId = requestAnimationFrame(tick);
      } else {
        boundaryRef.current = scrollToFamilyStrip(() => {
          passedRef.current = true;
        });
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ready]);

  // THE WALL itself — see the docblock note above. Only ever pushes scrollY
  // UP to the boundary (a scroll attempt back into the hero); scrolling
  // further down is left alone entirely.
  useEffect(() => {
    const onScroll = () => {
      if (!passedRef.current || boundaryRef.current === null) return;
      if (window.scrollY < boundaryRef.current - 1) {
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(boundaryRef.current, { immediate: true, force: true });
        } else {
          window.scrollTo({ top: boundaryRef.current });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={framePath(0)}
        alt="TNT Crane & Rigging"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </section>
  );
}
