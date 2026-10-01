/**
 * ALL-TERRAIN CRANES — dedicated page for this one crane type, originally
 * one of 6 on the /load-chart overview page (2026-09-29, first added as a
 * pilot for reaching a dedicated inner page from the nav instead of an
 * anchor). /load-chart itself was deleted the same day, on request ("except
 * All-Terrain Cranes page remove all the other individual pages") — this is
 * the only crane-type page the site has now. The other 5 crane-type nav
 * titles (Crawler, Hydraulic Truck, Rough-Terrain, Carry Deck, Tower) were
 * removed in the same edit, then explicitly put back — "keep the title on
 * the nav bar, I ask you to remove the page only" — pointing at
 * EquipmentGuide.tsx's homepage anchors instead of the deleted page. See
 * navigation.ts's "Load Chart" group for the full history.
 *
 * Overview data (name, icon, photo) is still fleetTypes.ts's own FLEET_TYPES
 * entry — the exact same one EquipmentGuide.tsx renders — not a duplicate.
 * Real TNT photography (isRealFleetPhoto: true), so no "Stock photo" tag
 * needed on the hero.
 *
 * REAL ALL-TERRAIN DATA (2026-09-29, on request — "bring all these listed
 * Cranes on that dedicated page"): craneChartData.ts now carries a genuine
 * "all-terrain" class, 46 models, split out of the old catch-all "mobile"
 * bucket by matching make+model against tntcrane.com/crane-charts/'s own
 * live "All-Terrain Cranes" filter (checked directly, 2026-09-29) — not a
 * guess.
 *
 * CARD VIEW, NOT THE DARK CHART (2026-09-29, on request — "remove that dark
 * theme capacity chart, I want card view in light theme"): this page used
 * CraneCapacityChart's navy/amber table at first; swapped for CraneCardGrid,
 * a light-theme card-per-model layout with the same search-by-make/model
 * behavior. CraneCapacityChart.tsx and the homepage modal that used to open
 * it were both deleted later the same day — see EquipmentGuide.tsx's
 * docblock ("'View Full Capacity Chart' popup removed").
 *
 * NO STANDALONE HERO PHOTO (2026-09-29, on request — "there is an image on
 * the top alone remove that"): the page used to also show CRANE_TYPE.photo
 * once, full-width, between the header and the grid. Once every card in
 * CraneCardGrid started showing that same photo as its own thumbnail (see
 * that component's CARD PHOTO note), the standalone copy above the grid was
 * just the same image twice — removed here, kept in the cards.
 *
 * NO "BACK TO LOAD CHART" LINK (2026-09-29, on request — "remove that back
 * arrow"): the header used to open with a `<Link href="/load-chart">` above
 * the eyebrow; removed outright, not just hidden — the top nav's own "Load
 * Chart" menu still reaches /load-chart, so the page isn't a dead end.
 *
 * NO HEADER DIVIDER (2026-09-29, on request — "I can see a line on the page
 * remove that too"): the header `<section>` used to carry `border-b`,
 * drawing a rule under the intro paragraph before the card grid — removed;
 * the two sections' own padding is enough separation.
 *
 * HERO BANNER (2026-09-29, on request — "add background image behind this
 * ... act as a hero banner"): the header is now CRANE_TYPE.photo full-bleed
 * behind the eyebrow/heading/intro, with the same left-to-right dark scrim
 * StorySlideshow.tsx uses over its own photos (`from-black/85 via-black/45
 * to-transparent`) so the now-white text stays readable regardless of what
 * part of the photo sits behind it, without flattening the image under a
 * uniform tint.
 *
 * Stats in the copy (model count, capacity range) are computed from
 * CRANE_MODELS at render time, not hardcoded — they can't drift from the
 * table below them.
 *
 * CARD PHOTO POOL, NOT ONE REPEATED IMAGE (2026-09-29, on request — "add
 * different image on all the cards... don't show the same images"): built
 * here as `CARD_PHOTOS` — the real CRANE_TYPE.photo first, then 5 verified
 * Unsplash photos of genuine all-terrain-class cranes (PHOTOS.allTerrainStock
 * 1–5, sourcing note in photos.ts). Passed to CraneCardGrid as a pool it
 * rotates by card position — see that component's own CARD PHOTO note for
 * why a pool instead of per-model photography.
 */

import { Eyebrow, Icon } from "@/components/site/primitives";
import Button from "@/components/site/Button";
import { FLEET_TYPES } from "@/components/site/fleetTypes";
import { CRANE_MODELS } from "@/components/site/craneChartData";
import { IMG, PHOTOS } from "@/components/site/photos";
import CraneCardGrid, { type CardPhoto } from "@/components/site/CraneCardGrid";

const CRANE_TYPE = FLEET_TYPES.find((t) => t.name === "All-Terrain Cranes")!;

const ALL_TERRAIN_MODELS = CRANE_MODELS.filter((m) => m.type === "all-terrain");
const MIN_CAPACITY = Math.min(...ALL_TERRAIN_MODELS.map((m) => m.capacityTons));
const MAX_CAPACITY = Math.max(...ALL_TERRAIN_MODELS.map((m) => m.capacityTons));

const CARD_PHOTOS: CardPhoto[] = [
  { src: CRANE_TYPE.photo, isStock: false },
  { src: IMG(PHOTOS.allTerrainStock1, 800), isStock: true },
  { src: IMG(PHOTOS.allTerrainStock2, 800), isStock: true },
  { src: IMG(PHOTOS.allTerrainStock3, 800), isStock: true },
  { src: IMG(PHOTOS.allTerrainStock4, 800), isStock: true },
  { src: IMG(PHOTOS.allTerrainStock5, 800), isStock: true },
];

export default function AllTerrainCranesPage() {
  return (
    <div className="bg-white bg-black text-white">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CRANE_TYPE.photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <Eyebrow>Load Chart</Eyebrow>
          <h1 className="mt-4 flex items-center gap-4 font-display text-5xl leading-[0.95] tracking-tight text-white uppercase sm:text-6xl">
            <Icon name={CRANE_TYPE.icon} className="h-10 w-10 shrink-0 text-tnt-amber sm:h-12 sm:w-12" strokeWidth={1.5} />
            All-Terrain Cranes
          </h1>
          <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-white/80 sm:text-lg">
            All-terrain cranes combine highway-legal travel with off-road
            stability — one machine that drives to the job and works once
            it&rsquo;s there, without a separate carrier. {ALL_TERRAIN_MODELS.length}{" "}
            models on file below, rated from {MIN_CAPACITY} to{" "}
            {MAX_CAPACITY} tons.
          </p>
        </div>
      </section>

      {/* ── Card grid, locked to this class ──────────────────────────── */}
      <section id="capacity-chart" className="scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <CraneCardGrid models={ALL_TERRAIN_MODELS} photos={CARD_PHOTOS} />
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section className="bg-tnt-amber">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <p className="font-display text-2xl leading-tight tracking-wide text-black uppercase sm:text-3xl">
              Need an all-terrain crane on site?
              <br />
              Tell us the load, the site, and the window.
            </p>
            <div className="flex shrink-0 gap-4">
              <Button href="/#quote" variant="primary">
                Request a Quote
              </Button>
              <Button href="tel:+18007992505" variant="secondary">
                Call 1-800-799-2505
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
