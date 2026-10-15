/**
 * SCROLL TO ELEMENT — shared by the /about page (its in-page CTAs and
 * arriving-with-a-hash handling) and Hero.tsx's hash-arrival fix.
 *
 * Why this exists: SmoothScroll.tsx deliberately sets
 * history.scrollRestoration = "manual" and scrolls to the top on every page
 * load, which also throws away the browser's own jump to a URL's #hash. So
 * any route that should honour /page#section has to scroll there itself,
 * after mount. Lenis when it's booted; native scrolling otherwise (it isn't
 * booted under reduced motion).
 *
 * Offsets by CHROME_H so the target lands just below the fixed nav, the same
 * clearance every section's `scroll-mt-32` gives native anchor jumps.
 */

import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";

export function scrollToElement(el: HTMLElement, { smooth = false }: { smooth?: boolean } = {}) {
  const top = Math.max(0, window.scrollY + el.getBoundingClientRect().top - CHROME_H);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animate = smooth && !reduced;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, animate ? { duration: 1.1 } : { immediate: true, force: true });
  } else {
    window.scrollTo({ top, behavior: animate ? "smooth" : "auto" });
  }
}

/** The element a URL hash points at, or null (also null for "", "#"). */
export function hashTarget(hash: string = window.location.hash): HTMLElement | null {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  return id ? document.getElementById(id) : null;
}
