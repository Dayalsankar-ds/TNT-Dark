"use client";

/**
 * Honours /about#section on arrival. SmoothScroll.tsx resets every page load
 * to the top (and so discards the browser's own hash jump) — this scrolls to
 * the hash target after mount, then once more when the page finishes loading
 * in case images above the target changed the layout. The second pass is
 * skipped if the visitor has already started scrolling themselves.
 */

import { useEffect } from "react";
import { hashTarget, scrollToElement } from "@/components/site/scrollToElement";

export default function HashScroll() {
  useEffect(() => {
    if (!hashTarget()) return;
    let userMoved = false;
    const stop = () => {
      userMoved = true;
    };
    const go = () => {
      const el = hashTarget();
      if (el && !userMoved) scrollToElement(el);
    };
    const id = requestAnimationFrame(go);
    window.addEventListener("wheel", stop, { passive: true, once: true });
    window.addEventListener("touchstart", stop, { passive: true, once: true });
    window.addEventListener("keydown", stop, { once: true });
    if (document.readyState !== "complete") window.addEventListener("load", go, { once: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("load", go);
    };
  }, []);
  return null;
}
