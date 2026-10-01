/**
 * ABOUT THE FLEET (2026-09-13, on request) — replaces the "Rigging &
 * Attachments" card-grid + compare-modal section entirely, with content
 * matching tntcrane.com's own "About the Fleet" homepage section, restyled
 * in this site's own type/color system rather than copied verbatim:
 *   - Eyebrow "About the Fleet" + heading "A Modern Fleet of More Than 700
 *     Cranes" (their exact copy)
 *   - Their 6-item crane-type list (All-Terrain, Crawler, Hydraulic Truck,
 *     Rough-Terrain, Carry Deck, Tower)
 *   - Their two closing paragraphs (specialized rigging equipment, then
 *     Machinery Moving / Industrial Storage) as descriptive copy.
 *
 * NO CTA BUTTON — a "Talk to an engineer" button briefly lived here, added
 * on the assumption every section should close with one (the pattern
 * elsewhere on this site). Checked the live section directly: it has no CTA
 * at all — just the two paragraphs, plus inline links on "Machinery
 * Moving"/"Industrial Storage" within the second one pointing at those
 * service pages. Removed to match the actual source rather than an
 * invented convention.
 *
 * SCROLLING PHOTO GALLERY (2026-09-13, on request: "add that images... I
 * prefer scrolling type"): the plain bulleted list is now a horizontal,
 * snap-scrolling gallery of the same 6 crane types — real photography where
 * it exists, a plain gradient+icon tile where it doesn't (see below). Native
 * CSS scroll-snap (`overflow-x-auto snap-x`), no carousel library or client
 * state needed. Text content moved above the gallery (was beside the list
 * in a 2-column grid) since a full-bleed-width gallery and a side column
 * don't coexist — the copy now reads as an intro, the gallery as what it's
 * introducing.
 *
 * SINGLE-PHOTO SLIDESHOW (2026-09-17, on request: "one single image
 * placeholder need to change one by one" — didn't like the 6-card scroll
 * gallery's image placement): replaced the horizontal gallery with one
 * large photo beside a clickable list of the same 6 crane types. The photo
 * crossfades to match whichever type is active; active state both
 * auto-advances (every 4s, on request — "auto-rotate + labels") and can be
 * jumped to directly by clicking a label, same interaction shape as
 * StorySlideshow.tsx's own autoplaying card grid (4s cadence,
 * reduced-motion opt-out, gated on the section being in view — copied
 * rather than reinvented, so the two autoplay features on this page behave
 * identically). Each label keeps the slugified `id` the old cards carried,
 * so navigation.ts's Fleet panel deep links still land on something real.
 *
 * 3 REAL + 3 STOCK, ALL 6 WITH A PHOTO (2026-09-13, same day — a bare
 * gradient tile for 3 of 6 cards read as "missing photos" sitting next to
 * ones that had them, in a gallery where all 6 are visible side by side —
 * on request, made consistent instead): all-terrain, crawler, and hydraulic
 * truck cranes are real TNT photography, downloaded and inspected from
 * tntcrane.com's own homepage (FLEET_PHOTOS in photos.ts has the full
 * sourcing note and file provenance). Rough-Terrain, Carry Deck, and Tower
 * Cranes use verified Unsplash stock instead (PHOTOS.roughTerrainCrane /
 * carryDeckCrane / towerCrane) — genuine photos of that equipment class,
 * just not TNT's own fleet, and not claimed to be. A set of same-named PNGs
 * already existed on disk for exactly these 3 categories; opened and
 * inspected, they turned out to be synthetic/AI-generated (see
 * FLEET_PHOTOS's own docblock) and were left unused rather than reached
 * for — a genuine stock photo beats a fabricated "real" one.
 *
 * Each card keeps its own `id` (slugified) and `scroll-mt-32` so
 * navigation.ts's Fleet panel sub-items still have something real to deep-
 * link to, same pattern the old card grid used.
 *
 * Section keeps `id="fleet-guide"` — navigation.ts's "Fleet" group href
 * still points at it; renaming the anchor would mean touching every place
 * that links to the group, not just this file.
 *
 * LIGHT GREY THEME: shell is `bg-tnt-gray` (#eeeeee — this token's own
 * globals.css comment literally calls it out for "alternating section
 * backgrounds"), not plain white, so this section reads as its own tinted
 * band between the white Full-Scope Capability section above and whatever
 * follows, rather than blending into either.
 *
 * "VIEW FULL CAPACITY CHART" POPUP REMOVED (2026-09-29, on request —
 * "Remove 'FULL CAPACITY CHART' pop up from main screen"): this section used
 * to also have a button opening every model TNT operates, in a modal
 * (CraneCapacityChart.tsx, via the shared capacityChartStore.ts so the Load
 * Chart nav dropdown's CTA could open the same one). Both the button and the
 * modal are gone; the label list above is the section's only interaction
 * now. CraneCapacityChart.tsx and capacityChartStore.ts were this modal's
 * only consumers, so both files were deleted rather than left orphaned —
 * see /load-chart/all-terrain-cranes for where model-browsing now actually
 * lives (CraneCardGrid.tsx, its own light-theme card view).
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Eyebrow, Icon } from "./primitives";
import { slugify } from "./navigation";
import { FLEET_TYPES } from "./fleetTypes";

export default function EquipmentGuide() {
  // Single-photo slideshow — same shape as StorySlideshow.tsx's autoplay:
  // 4s cadence, off while the section is out of view or reduced-motion is
  // on, and any manual pick (clicking a label) restarts the 4s window
  // rather than getting immediately overridden by an in-flight timer.
  const [activeType, setActiveType] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const reducedMotionRef = useRef(false);
  // Hovering a label pauses the 4s autoplay (2026-09-29, on request —
  // "shall we make that changes into while hovering"): without this, the
  // photo you just hovered to preview could get yanked away mid-look by the
  // next autoplay tick. Resumes the moment the pointer leaves the list.
  const hoveringRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotionRef.current) return;
    const id = setInterval(() => {
      if (inViewRef.current && !hoveringRef.current) {
        setActiveType((i) => (i + 1) % FLEET_TYPES.length);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [activeType]);

  const selectType = useCallback((i: number) => setActiveType(i), []);

  return (
    <section id="fleet-guide" className="bg-tnt-slate text-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        {/* TWO-SIDE LAYOUT (2026-09-18, on request: "divide that section in
            two, A side and B side — A side is left side which needs to
            have content, B side needs to have image"): the whole section
            is now one lg:grid-cols-2 row — side A (heading, paragraphs,
            the label list, and the capacity-chart button) on the left,
            side B (just the photo) on the right. Replaces the previous
            stacked layout (full-width text block, then a separate
            list+photo row below it). DOM order is content-then-photo, so
            mobile stacks the same way (content first, image below) rather
            than needing `order-*` utilities to reorder anything. */}
        <div ref={galleryRef} className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          {/* ── SIDE A — content ─────────────────────────────────────── */}
          <div className="flex flex-col">
            <Eyebrow>About the Fleet</Eyebrow>
            <h2 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight uppercase sm:text-6xl text-white">
              A modern fleet of
              <br />
              more than 700 cranes
            </h2>

            {/* Condensed to one paragraph (2026-09-29, on request — "can we
                reduce this content"): was two paragraphs, the first an
                itemized equipment list (gantry lift systems, jack & slide
                systems, machinery skates, etc.). Still links "Specialized
                Rigging"/"Machinery Moving"/"Industrial Storage" out to those
                service pages — same-page anchors to CoreServices.tsx's own
                stage cards (identical slugs: `slugify("Specialized
                Rigging")` etc.), since those are the real equivalent
                sections on THIS site. */}
            <p className="mt-6 font-body text-base leading-relaxed text-tnt-body">
              TNT Crane &amp; Rigging also offers an extended fleet of{" "}
              <a
                href="#specialized-rigging"
                className="font-semibold text-tnt-amber underline-offset-2 hover:underline"
              >
                Specialized Rigging
              </a>{" "}
              equipment, expert{" "}
              <a
                href="#machinery-moving"
                className="font-semibold text-tnt-amber underline-offset-2 hover:underline"
              >
                Machinery Moving
              </a>
              , and secure{" "}
              <a
                href="#industrial-storage"
                className="font-semibold text-tnt-amber underline-offset-2 hover:underline"
              >
                Industrial Storage
              </a>{" "}
              — from precision equipment relocation to complex rigging in
              tight spaces, handled with the same efficiency and care as
              everything else we do.
            </p>

            {/* Label list — hover to preview, click to jump (click matters
                on touch, where hover doesn't fire). Active state also
                driven by the 4s autoplay above, paused while a label is
                hovered (see `hoveringRef`). Keeps each type's slugified
                `id` so navigation.ts's Fleet panel deep links still land on
                something real.
                HOVER-TO-PREVIEW (2026-09-29, on request — "shall we make
                that changes into while hovering"): `onMouseEnter` calls the
                same `selectType` the click handler does — hovering and
                clicking aren't two different actions, hovering just fires
                it sooner, on any device with a real pointer.
                ALL-TERRAIN LINKS OUT (2026-09-29, on request — "if user
                clicked All terrain from 'About the Fleet' it needs to take
                the dedicated page"): every other label just swaps the
                slideshow photo in place, but All-Terrain Cranes is the one
                type with its own real page
                (/load-chart/all-terrain-cranes — 46 real models, searchable
                and filterable), so its label is a `Link` there instead of a
                `selectType` button — hovering it still previews its photo,
                same as the rest, before you click through. Same visual
                treatment either way (icon + label, active-state ring), so
                the row doesn't visually call out which one behaves
                differently until you click it. */}
            <ul
              className="mt-8 flex flex-col gap-2"
              onMouseEnter={() => {
                hoveringRef.current = true;
              }}
              onMouseLeave={() => {
                hoveringRef.current = false;
              }}
            >
              {FLEET_TYPES.map((t, i) => {
                const isActive = i === activeType;
                const content = (
                  <>
                    <Icon
                      name={t.icon}
                      className={`h-8 w-8 shrink-0 ${
                        isActive ? "text-tnt-amber" : "text-white/40"
                      }`}
                      strokeWidth={1.5}
                    />
                    <span
                      className={`font-body text-base font-semibold ${
                        isActive ? "text-white" : "text-white/60"
                      }`}
                    >
                      {t.name}
                    </span>
                  </>
                );
                const itemClassName = `flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-colors ${
                  isActive
                    ? "border-tnt-amber bg-tnt-amber/10"
                    : "border-transparent hover:border-white/10"
                }`;

                return (
                  <li key={t.name} id={slugify(t.name)} className="scroll-mt-32">
                    {t.name === "All-Terrain Cranes" ? (
                      <Link
                        href="/load-chart/all-terrain-cranes"
                        onMouseEnter={() => selectType(i)}
                        className={itemClassName}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => selectType(i)}
                        onMouseEnter={() => selectType(i)}
                        aria-current={isActive ? "true" : undefined}
                        className={itemClassName}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── SIDE B — photo ───────────────────────────────────────── */}
          {/* Every type's <img> stacked in the same box, crossfading via
              opacity so there's no layout shift between them.
              `lg:aspect-3/4`: a real portrait aspect ratio (on request,
              "a true tall/portrait shape"), not a height borrowed from
              `items-stretch`. `object-cover` on the <img>s below crops
              each (landscape-sourced) photo to fill it. Below `lg` (where
              side A stacks above this instead of sitting beside it) it
              keeps the original 4:3 / 16:10 landscape aspect ratios —
              portrait only reads as intentional next to a column beside
              it, not stacked full-width under one. */}
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border sm:aspect-16/10 lg:aspect-3/4 lg:self-start border-white/10 bg-black">
            {FLEET_TYPES.map((t, i) => (
              <div
                key={t.name}
                aria-hidden={i !== activeType}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  i === activeType ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: t.gradient }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.photo}
                  alt={t.name}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Honesty tag, not a design flourish — see the docblock's
                    "3 REAL + 3 STOCK" note. A generic Unsplash photo and an
                    actual TNT jobsite photo are different claims; this is
                    the one place on the card that says which is which. */}
                {!t.isRealFleetPhoto && (
                  <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-white/80 uppercase backdrop-blur-sm">
                    Stock photo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
