"use client";

/**
 * HERO — rebuilt 2026-10-01, on request, from new footage ("First clip.mp4" +
 * "Second clip.mp4", supplied directly), after the previous hero was removed
 * entirely on 2026-09-23 (see page.tsx's own history note). The two clips
 * are merged into one continuous shot.
 *
 * NOW A REAL <video> (2026-10-01, on request — "there is some wait or stuck
 * on hero section"): this first shipped as a WebP frame sequence (frames-v7:
 * 578 frames, 39MB; then frames-v8: 289 frames, 10MB) whose `src` was swapped
 * on an <img> every rAF tick. Two problems with that, both gone now:
 *   1. The WAIT — nothing could play until every frame had downloaded and
 *      decoded, so visitors sat on a black screen first.
 *   2. The STUTTER — each swap could trigger a main-thread image decode,
 *      dropping frames mid-play.
 * public/video/hero.mp4 is H.264, 1280x720, 55fps, 3.8MB (encoded on-device
 * with AVFoundation from the v7 frames, every other frame). It starts as soon
 * as the first chunk arrives, decodes on the GPU, and `hero-poster.webp`
 * (frame 0) shows instantly while it buffers. All the earlier playback-speed
 * requests ("full speed on both clip" — both clips at 110 frames/sec of the
 * original sequence) are baked into the encode itself, as is dropping the
 * never-shown final TNT-logo card ("user no need to see last frame of second
 * clip") — so there are no FPS constants or frame caps left in code.
 *
 * FULLY AUTOMATED, NOT SCROLL-DRIVEN (on request — "I don't want have user
 * interaction while playing. Every thing automated from first frame to last
 * frame. User can experience only one time. After that they need to reload
 * the site to experience it again"): no scroll-scrub, no pin, no WebGL. The
 * video plays once (no `loop`, no controls) and its `ended` event hands off
 * to the auto-scroll below. A reload plays it again from the start.
 *
 * REDUCED MOTION: the video is never played — the poster stays as a static
 * image. `preload="none"` means nothing beyond the poster is downloaded
 * until play() is called, which only happens outside reduced motion.
 *
 * AUTOPLAY BLOCKED (e.g. iOS Low Power Mode rejects play() even for muted
 * video): play()'s rejection is swallowed and the poster stays up — the
 * visitor scrolls on normally, same as reduced motion.
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
 * AUTO-SCROLL ON COMPLETION (2026-10-01, on request — "auto scroll up to nav
 * bar visible"): the instant the video ends, `scrollToFamilyStrip()` fires.
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
 * HERO COLLAPSES AFTER LANDING (2026-10-01, on request — "remove the scroll
 * back to hero section final frame... automatically stop at TNT Crane
 * family of companies section"): replaces THE WALL, an earlier scroll
 * listener that clamped scrollY back down to the landing spot whenever the
 * visitor scrolled up. That fought Lenis's inertial scroll on every wheel
 * tick, so the frozen hero could still flash into view before the clamp
 * caught it. Now, once the landing scroll completes, the hero itself
 * shrinks to a COLLAPSED_H black band (hidden behind the fixed nav) and
 * scrollY is shifted by the same amount before paint, so nothing visibly
 * moves — #family stays exactly where it landed, but the page now starts
 * there and there is no hero left above it to scroll back into. A reload
 * plays the hero again from frame 0.
 *
 * TRIGGERED BY POSITION, NOT BY THE SCROLL'S onComplete (2026-10-01, on
 * request — the scroll-back was still reachable): the collapse used to wait
 * for the landing scroll's Lenis `onComplete`, which Lenis silently skips
 * when the visitor's own wheel/trackpad input interrupts the programmatic
 * scroll — and never fired at all if the visitor scrolled down past the
 * hero themselves mid-playback. Either way the hero stayed, final frame
 * and all. Now a gsap.ticker poll (same loop and approach SiteNav.tsx's
 * reveal check uses) collapses the hero the moment #family's top reaches
 * LANDING_TOP, however it got there — auto-scroll, manual scroll, or
 * autoplay blocked and the visitor scrolled on their own. The scroll fix-up
 * re-pins #family to wherever it was on screen at that moment (not always
 * LANDING_TOP — a fast manual scroll can be well past it), so the collapse
 * is still invisible. The landing scroll is also `lock`ed now, so wheel
 * input can't fight it partway down.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";

const VIDEO_SRC = "/video/hero.mp4";
const POSTER_SRC = "/video/hero-poster.webp";

/** Where #family's top rests in the viewport after landing: comfortably past
 *  the nav's reveal line (SiteNav's REVEAL_AT = CHROME_H), not balanced on it. */
const LANDING_TOP = CHROME_H - 24;
/** The hero's height once collapsed — exactly LANDING_TOP, so at scrollY 0
 *  #family sits where the landing scroll left it, under the fixed nav. */
const COLLAPSED_H = LANDING_TOP;

/** Instantly sets scrollY, keeping Lenis's internal position in sync. */
function jumpTo(y: number) {
  const lenis = getLenis();
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(y, { immediate: true, force: true });
  } else {
    window.scrollTo({ top: y });
  }
}

/** Scrolls to #family (the Family-of-companies logo strip) — see the
 *  LANDING SPOT note above for the back-and-forth that settled here. Lenis
 *  when it's booted (the ordinary case), locked so the visitor's own wheel
 *  input can't interrupt it; a plain smooth window.scrollTo as the fallback.
 *  Arrival is detected by the collapse poll in Hero(), not here. */
function scrollToFamilyStrip() {
  const family = document.getElementById("family");
  if (!family) return;
  const target = window.scrollY + family.getBoundingClientRect().top - LANDING_TOP;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.2, lock: true });
  } else {
    window.scrollTo({ top: target, behavior: "smooth" });
  }
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Flips true the moment #family reaches LANDING_TOP — see TRIGGERED BY
  // POSITION above. `pinTopRef` is #family's on-screen top at that moment,
  // which the layout effect below restores after the hero shrinks.
  const [collapsed, setCollapsed] = useState(false);
  const pinTopRef = useRef(LANDING_TOP);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onEnded = () => scrollToFamilyStrip();
    video.addEventListener("ended", onEnded);
    video.muted = true; // React doesn't reliably reflect the `muted` attribute; autoplay needs it
    video.play().catch(() => {}); // autoplay blocked — see AUTOPLAY BLOCKED above
    return () => video.removeEventListener("ended", onEnded);
  }, []);

  // The collapse trigger — see TRIGGERED BY POSITION above. Polled on
  // gsap.ticker rather than `scroll` events, which are unreliable under
  // smooth scrolling; removes itself once it has fired.
  useEffect(() => {
    const tick = () => {
      const family = document.getElementById("family");
      if (!family) return;
      const top = family.getBoundingClientRect().top;
      if (top > LANDING_TOP + 1) return;
      gsap.ticker.remove(tick);
      pinTopRef.current = top;
      videoRef.current?.pause();
      setCollapsed(true);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Runs after the collapse is in the DOM but before paint: re-pin #family to
  // the exact viewport spot it was at when the collapse fired, so nothing
  // visibly moves.
  useLayoutEffect(() => {
    if (!collapsed) return;
    const family = document.getElementById("family");
    if (!family) return;
    jumpTo(Math.max(0, window.scrollY + family.getBoundingClientRect().top - pinTopRef.current));
  }, [collapsed]);

  return (
    <section
      className={`relative overflow-hidden bg-black ${collapsed ? "" : "h-screen min-h-[600px]"}`}
      style={collapsed ? { height: COLLAPSED_H } : undefined}
    >
      <video
        ref={videoRef}
        hidden={collapsed}
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="none"
        aria-label="TNT Crane & Rigging"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </section>
  );
}
