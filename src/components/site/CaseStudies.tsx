/**
 * CASE STUDIES — the homepage proof section, presented as the sticky "stack".
 *
 * Replaces the old FeaturedProjects tile grid (2026-07-27, user decision): the
 * telescoping sticky-card mechanism (StickyStack) was freed up when the
 * equipment classes it used to hold were consolidated into EquipmentGuide, and
 * proof is where the pinned, one-story-at-a-time rhythm earns its height.
 *
 * Each card is one job: amber job-code tab (TNT-142 …), project title, a
 * headline stat, the lift story, and the photo carrying the LOAD/RADIUS
 * CursorReadout — the specs actually run on that job.
 *
 * PHOTOS are real TNT job-site photography as of 2026-08-26 — see
 * photos.ts's CASE_PHOTOS docblock for sourcing. The STORY COPY (titles,
 * tonnage, narrative body, readout numbers) is still placeholder narrative
 * until real project records arrive — the photos were matched to each
 * story's general category (refinery/plant, wind, bridge, gantry), not to
 * its specific numbers, so treat the copy and the imagery as two separate
 * "real vs. placeholder" questions rather than one.
 */

import { Eyebrow } from "./primitives";
import StickyStack, { type StackItem } from "./StickyStack";
import StackFinaleSync from "./StackFinaleSync";
import { CHROME_H } from "./chrome";
import { PHOTOS, CASE_PHOTOS, GRADIENTS } from "./photos";
import RevealText from "./RevealText";

/** Height of the pinned title rail (eyebrow + heading + its padding). The pile
 *  starts exactly below it, so this number and the rail's own box must stay in
 *  step — it is applied as the rail's `lg` height, not merely assumed. */
const RAIL_H = 132;

const CASES: StackItem[] = [
  {
    index: "TNT-142",
    title: "Refinery Reactor Exchange",
    figure: "900 T",
    figureLabel: "All-Terrain · Gulf Coast",
    body: "A live-unit reactor swap inside a working refinery: a 900-ton all-terrain threaded between pipe racks, night lifts sequenced into a 36-hour turnaround window — zero recordables, unit back online ahead of schedule.",
    readout: { load: "610T", radius: "12M" },
    photo: {
      id: PHOTOS.refineryNight,
      src: CASE_PHOTOS.refineryReactorExchange,
      alt: "Crawler crane rigged at a refinery/gas plant site",
      gradient: GRADIENTS.navy,
    },
  },
  {
    index: "TNT-098",
    title: "Wind Farm Turbine Erection",
    figure: "120 M",
    figureLabel: "Hub Height · Mountain West",
    body: "Forty-six nacelle and blade sets across a ridgeline wind farm, tall-boom crawlers walking tower to tower between weather windows — every pick engineered against wind-speed limits measured at the hook.",
    readout: { load: "95T", radius: "18M" },
    photo: {
      id: PHOTOS.windTurbine,
      src: CASE_PHOTOS.windFarmTurbineErection,
      alt: "Crawler cranes erecting a wind turbine tower section",
      gradient: GRADIENTS.slate,
    },
  },
  {
    index: "TNT-211",
    title: "Bridge Girder Set",
    figure: "310 T",
    figureLabel: "Tandem Lift · Infrastructure",
    body: "Twin crawlers in tandem walking a 310-ton girder across a live interstate corridor during a single overnight closure — lift plan, traffic control, and crews from three branches on one radio net.",
    readout: { load: "310T", radius: "22M" },
    photo: {
      id: PHOTOS.siteCrane1,
      src: CASE_PHOTOS.bridgeGirderSet,
      alt: "TNT crane setting a bridge girder over water",
      gradient: GRADIENTS.slate,
    },
  },
  {
    index: "TNT-176",
    title: "Petrochemical Vessel Placement",
    figure: "1,100 T",
    figureLabel: "Hydraulic Gantry · Texas",
    body: "An 1,100-ton vessel jacked, slid, and set inside a structure no crane could reach — hydraulic gantry track laid through the unit, the load traveling metres per hour with millimetre landing tolerance.",
    readout: { load: "1,100T", radius: "6M" },
    photo: {
      id: PHOTOS.plantNight,
      src: CASE_PHOTOS.petrochemicalVesselPlacement,
      alt: "TNT hydraulic gantry lifting a large vessel-sized load",
      gradient: GRADIENTS.maroon,
    },
  },
];

export default function CaseStudies() {
  return (
    // Keeps the old grid's `#projects` anchor so existing links don't break.
    <section id="projects" className="scroll-mt-32 bg-white">
      {/* The title rail is handed to StickyStack rather than rendered here so
         it shares the cards' containing block; the push that carries it off the
         top is StackFinaleSync's. See the `header` and `coverTop` props there.

         `top`: the pile pins flush under the rail rather than under the chrome.
         `coverTop`: the last job (TNT-176) leaves the staircase, rises from
         below covering the tabs, then pushes the title out — the section signs
         off on the finale alone, full-bleed.

         `lg:pb-0`: at `lg` the finale is a full-viewport panel that ends the
         section by itself, so the strip's bottom padding was pure dead white
         under it on the way out. Kept below `lg`, where nothing is sticky and
         the last card ends at its own height. */}
      <div className="pb-20 sm:pb-28 lg:pt-28 lg:pb-0">
        <StickyStack
          items={CASES}
          top={CHROME_H + RAIL_H}
          coverTop={CHROME_H}
          cta={{ label: "Request a similar lift", href: "#contact" }}
          header={
            // Scroll-driven rather than CSS: this both hides each tab as the
            // finale covers it and pushes the rail. See StackFinaleSync for why
            // sticky's own release cannot express either without dragging the
            // tabs away early.
            <StackFinaleSync railBottom={CHROME_H + RAIL_H}>
              {/* TITLE RAIL — pinned at `lg`, matching the cards' breakpoint.
                 Opaque, because the intro copy passes beneath it, and z-20 so
                 the ladder cards (later in the DOM) don't paint over it. Fixed
                 `RAIL_H` height: the pile's top is derived from it, so it
                 cannot be left to content. */}
              <header
                data-stack-rail
                style={{
                  top: `${CHROME_H}px`,
                  ["--rail-h" as string]: `${RAIL_H}px`,
                }}
                className="z-20 bg-white lg:sticky lg:h-(--rail-h)"
              >
                <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-0 lg:pb-6">
                  <Eyebrow>Proof in the Field</Eyebrow>
                  <RevealText
                    as="h2"
                    text="Case Studies"
                    className="mt-3 font-display text-5xl tracking-wide text-black uppercase sm:text-6xl"
                  />
                </div>
              </header>

              {/* Intro copy stays in normal flow: it reads with the heading on
                 arrival, then scrolls up under the rail as the pile takes
                 over. */}
              <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
                <p className="mt-4 max-w-md font-body text-base text-tnt-body sm:text-lg">
                  Four jobs, four ways a lift gets engineered. The readout on
                  every photo is the load and radius we actually ran.
                </p>
              </div>
            </StackFinaleSync>
          }
        />
      </div>
    </section>
  );
}
