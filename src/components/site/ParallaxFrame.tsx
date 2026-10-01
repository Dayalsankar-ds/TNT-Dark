"use client";

/**
 * PARALLAX FRAME — a photo that drifts slightly slower than the page.
 *
 * Scroll-linked via ScrollTrigger `scrub`, which runs on the SHARED GSAP ticker
 * (see SmoothScroll) rather than a private rAF — this page already proved what
 * a second loop costs. Scrub writes the transform directly every frame, so
 * unlike a CSS transition it cannot be starved mid-flight.
 *
 * The image is over-scaled by OVERSCAN so the drift never exposes an edge. The
 * frame clips it; nothing about the section's height changes.
 *
 * prefers-reduced-motion: no trigger is created, the photo simply sits still.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IMG } from "./photos";

/** How far the photo travels across the whole scroll-through, in % of frame. */
const DRIFT = 12;
/** Extra scale so the drift can't reveal a gap at the top or bottom. */
const OVERSCAN = 1.18;

export default function ParallaxFrame({
  id,
  alt,
  className = "",
  children,
}: {
  /** Either an Unsplash photo ID (run through `IMG()`) or a local path
   *  starting with "/" (e.g. from SERVICE_PHOTOS/CASE_PHOTOS/RIGGING_PHOTOS
   *  in photos.ts), used as-is — same local-path convention those exports
   *  already use elsewhere (see EquipmentGuide.tsx's `localPhoto` field). */
  id: string;
  alt: string;
  className?: string;
  /** Overlay content — scrims, copy, CTA. Rendered above the photo. */
  children?: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { yPercent: -DRIFT / 2 },
        {
          yPercent: DRIFT / 2,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, frame);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={id.startsWith("/") ? id : IMG(id, 1800)}
        alt={alt}
        loading="lazy"
        style={{ scale: OVERSCAN }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
      {children}
    </div>
  );
}
