"use client";

/**
 * FAMILY STRIP V2 — the Family-of-Companies section. Originally gated
 * behind a "Nav / 02" picker (see git history for navVersionStore.ts) so it
 * could be compared side by side with FamilyStrip.tsx ("V1") — both the
 * picker and V1 were removed outright 2026-09-29, on request ("we are
 * going with Nav Version 2"), and this is rendered directly now (already
 * true since 2026-09-13 — see page.tsx). Kept as a genuinely different
 * composition rather than a variant of V1, for the record:
 *
 *   V1 (FamilyStrip)   — light canvas, split diagonal charcoal panel + a
 *                         2×2 logo quadrant anchored on a crosshair.
 *   V2 (this file)     — black headline band on top, then a light "shelf"
 *                         holding the four brands in one horizontal row with
 *                         hairline dividers — reads like a portfolio/
 *                         investor-relations "brands of the group" strip
 *                         rather than a geometric composition.
 *
 * 2026-09-22: shelf right-aligned within its section (was full-bleed/
 * centered) on request, to echo a reference hero layout that placed a
 * family-of-companies lockup row in the bottom-right corner of the banner
 * rather than spanning edge-to-edge.
 *
 * 2026-09-23: reverted back to full-bleed — the hero it was echoing was
 * removed entirely the same day, and this section is now the first thing on
 * the page, directly under the nav. Right-aligning it with `ml-auto
 * max-w-3xl` left a solid black block filling the left ~60% of the section
 * (the bg-black section showing through past the un-shelved space) instead
 * of the thin seam the docblock above describes — that seam assumption only
 * holds when the shelf spans the full width.
 *
 * THE LOGOS ARE FULL-COLOR LOCKUPS, NOT SILHOUETTES — this is why the shelf
 * is light, not dark. Checked each /public/brand/*.svg: they're built from a
 * default-black shape (a solid panel in southway/eagle-west/jms, bare
 * linework in rms-cranes) plus maroon/amber sub-elements, and southway/
 * eagle-west/jms additionally carry a WHITE sub-element that only reads
 * against something dark. There's no version of these marks that's legible
 * as flat white-on-black (an invert filter garbles the maroon/amber into
 * off-hues) or plain-rendered on black (the black portions vanish). V1
 * already proves the fix: put them on a light surface, unfiltered, exactly
 * as authored. This shelf is that surface, just inset in an otherwise dark
 * section instead of being the section itself.
 *
 * Same visual vocabulary as the rest of the site (black/white/gold, no
 * cards, no drop shadows, font-display headline, font-body labels) so it
 * still feels like this site, not a different product. The shelf is a
 * full-bleed strip, not a bounded/shadowed card, to stay inside that rule.
 */

import { useEffect, useRef, useState } from "react";

const BRANDS: { name: string; src: string; id: string; region: string }[] = [
  { name: "Southway Crane & Rigging", src: "/brand/southway.svg", id: "southway", region: "Gulf Coast" },
  { name: "RMS Cranes", src: "/brand/rms-cranes.svg", id: "rms", region: "Western Canada" },
  { name: "Eagle West Crane & Rigging", src: "/brand/eagle-west.svg", id: "eagle", region: "Pacific Northwest" },
  { name: "JMS Crane & Rigging", src: "/brand/jms.svg", id: "jms", region: "Central Canada" },
];

export default function FamilyStripV2() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 },
    );
    io.observe(section);

    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="family" className="relative overflow-hidden bg-black">
      {/* Headline band (eyebrow, "Family of Companies" heading, and the
          "Four regional brands..." description) removed 2026-09-13, on
          request — this section now goes straight to the brand shelf below.
          `bg-black` on the <section> itself is kept: without the headline
          band's own py-24 padding, that black would otherwise collapse to
          zero height, but a thin black seam still frames the shelf above the
          hero and below whatever follows, matching how the rest of the site
          treats section boundaries. */}

      {/* Brand shelf — full-bleed light strip so the lockups render exactly
          as authored (see docblock). Hairline dividers, no card/shadow. */}
      <div
        className={`bg-[#FCFCFC] transition-all delay-150 duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 divide-y divide-black/10 px-6 sm:divide-x sm:divide-y-0 sm:px-10 lg:grid-cols-4 lg:px-12">
          {BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col items-center gap-4 px-6 py-8 text-center"
            >
              <div className="flex h-12 w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="h-full w-auto max-w-[85%] object-contain"
                />
              </div>
              <p className="font-body text-xs font-semibold tracking-[0.14em] text-tnt-meta uppercase">
                {brand.region}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
