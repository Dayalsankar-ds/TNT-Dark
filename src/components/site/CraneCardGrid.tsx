"use client";

/**
 * CRANE CARD GRID — light-theme card view of a locked crane class, searchable
 * by make/model. Added 2026-09-29 for /load-chart/all-terrain-cranes, on
 * request — replacing the dark navy/amber CraneCapacityChart table that page
 * used at first ("remove that dark theme capacity chart, I want card view in
 * light theme"). CraneCapacityChart.tsx (and the modal on the homepage that
 * used to open it) was deleted outright later the same day, once this
 * component was the only place model-browsing actually needed to live — see
 * EquipmentGuide.tsx's docblock ("'View Full Capacity Chart' popup removed").
 *
 * CARD PHOTO (2026-09-29, on request — "add image for all the cards"; then
 * "add different image on all the cards ... don't show the same images"):
 * there is no rights-cleared photo for each of the 46 individual
 * manufacturer models — that would mean sourcing 46 separate product photos
 * from Liebherr/Grove/Tadano/Terex-Demag/Link-Belt/Demag with no confirmed
 * license, which this project's own convention (see RIGGING_PHOTOS in
 * photos.ts) treats as a real problem, not a detail to skip. Instead of one
 * repeated photo, cards now rotate through a small POOL of genuine
 * all-terrain/mobile-crane photography — the one real, rights-cleared TNT
 * photo (FLEET_PHOTOS.allTerrainCrane, same one this page shows up top) plus
 * 5 verified Unsplash photos of real all-terrain-class cranes
 * (PHOTOS.allTerrainStock1–5 in photos.ts has the full sourcing note — each
 * was opened and eyeballed, not just search-matched, since "mobile crane"/
 * "telescopic crane truck" search results on Unsplash are heavily diluted
 * with die-cast toy photography and unrelated tower/crawler cranes). `photos`
 * is that pool; `photos[i % photos.length]` assigns each rendered card a
 * photo by its position in the (filtered, sorted) list, so adjacent cards
 * essentially never repeat, without needing per-model photography that
 * doesn't exist. Stock ones carry the same "Stock photo" tag the site uses
 * everywhere else a non-TNT photo stands in for real fleet photography.
 *
 * LEFT-SIDE MAKE FILTER (2026-09-29, on request — "add filter on the left
 * side of the screen with check box"): this page is already locked to one
 * equipment class, so the one facet actually worth checkbox-filtering within
 * it is manufacturer — the 46 all-terrain models span 7 real makes
 * (Liebherr, Grove, Terex-Demag, Tadano, Demag, Link-Belt, Terex), computed
 * from `models` rather than hardcoded so a future data change can't drift
 * from what's checkable. No checks = show every make (an empty selection
 * isn't "show nothing"); checking one or more narrows to just those, ANDed
 * with the existing search box.
 *
 * TONNAGE RANGE FILTER (2026-09-29, on request — "add Tonnage Range filter
 * below the Make filter"): min/max number inputs under the Make list, same
 * ANDed-with-everything-else behavior. Bounds default to this class's own
 * real min/max (75–900 for all-terrain) rather than a guessed round number,
 * computed from `models` so they can't drift from the actual data either.
 * Each input clamps against the other on blur so min can never end up above
 * max (or vice versa) instead of silently producing an empty result.
 *
 * SEARCH MOVED INTO THE SIDEBAR (2026-09-29, on request — "move the search
 * to above Make and Tonnage range"): the search box used to sit up top next
 * to the "Showing N of M" count, the one thing left on the right side of the
 * old two-filter layout; moved into the aside, above Make, so every filter
 * lives in one place. "Showing N of M" now has that top row to itself.
 */

import { useMemo, useState } from "react";
import { Icon } from "./primitives";
import type { CraneModel } from "./craneChartData";

export type CardPhoto = { src: string; isStock: boolean };

export default function CraneCardGrid({
  models,
  photos,
}: {
  models: CraneModel[];
  /** Photo pool, assigned to cards by position — see CARD PHOTO note above. */
  photos: CardPhoto[];
}) {
  const [query, setQuery] = useState("");
  const [checkedMakes, setCheckedMakes] = useState<Set<string>>(new Set());

  const makes = useMemo(
    () => Array.from(new Set(models.map((m) => m.make))).sort(),
    [models],
  );

  const [dataMin, dataMax] = useMemo(() => {
    const tons = models.map((m) => m.capacityTons);
    return [Math.min(...tons), Math.max(...tons)];
  }, [models]);

  const [minTons, setMinTons] = useState(dataMin);
  const [maxTons, setMaxTons] = useState(dataMax);
  const tonnageActive = minTons !== dataMin || maxTons !== dataMax;

  function toggleMake(make: string) {
    setCheckedMakes((prev) => {
      const next = new Set(prev);
      if (next.has(make)) next.delete(make);
      else next.add(make);
      return next;
    });
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((m) => {
      if (checkedMakes.size > 0 && !checkedMakes.has(m.make)) return false;
      if (m.capacityTons < minTons || m.capacityTons > maxTons) return false;
      if (!q) return true;
      return m.make.toLowerCase().includes(q) || m.model.toLowerCase().includes(q);
    });
  }, [models, query, checkedMakes, minTons, maxTons]);

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      {/* ── Make filter, left column ──────────────────────────────────── */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <label className="relative block">
          <span className="sr-only">Search by make or model</span>
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40"
            strokeWidth={2}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make or model…"
            className="w-full rounded-md border py-2 pr-3 pl-9 font-body text-sm focus-visible:border-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none border-white/20 bg-white/5 text-white placeholder:text-white/40"
          />
        </label>

        <h2 className="mt-8 font-body text-[11px] font-bold tracking-[0.14em] uppercase text-white">
          Make
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {makes.map((make) => (
            <li key={make}>
              <label className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-white/75">
                <input
                  type="checkbox"
                  checked={checkedMakes.has(make)}
                  onChange={() => toggleMake(make)}
                  className="h-4 w-4 shrink-0 rounded-sm text-tnt-amber accent-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber border-white/30"
                />
                {make}
              </label>
            </li>
          ))}
        </ul>
        {checkedMakes.size > 0 && (
          <button
            type="button"
            onClick={() => setCheckedMakes(new Set())}
            className="mt-4 font-body text-[11px] font-semibold tracking-wide text-tnt-amber uppercase hover:text-white"
          >
            Clear filter
          </button>
        )}

        <h2 className="mt-8 font-body text-[11px] font-bold tracking-[0.14em] uppercase text-white">
          Tonnage Range
        </h2>
        <div className="mt-4 flex items-center gap-3">
          <label className="flex-1">
            <span className="sr-only">Minimum tons</span>
            <input
              type="number"
              min={dataMin}
              max={maxTons}
              value={minTons}
              onChange={(e) => setMinTons(Number(e.target.value))}
              onBlur={() => setMinTons((v) => Math.min(Math.max(v, dataMin), maxTons))}
              className="w-full rounded-md border px-2.5 py-1.5 font-body text-sm focus-visible:border-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none border-white/20 bg-white/5 text-white"
            />
          </label>
          <span className="font-body text-xs text-white/40">–</span>
          <label className="flex-1">
            <span className="sr-only">Maximum tons</span>
            <input
              type="number"
              min={minTons}
              max={dataMax}
              value={maxTons}
              onChange={(e) => setMaxTons(Number(e.target.value))}
              onBlur={() => setMaxTons((v) => Math.max(Math.min(v, dataMax), minTons))}
              className="w-full rounded-md border px-2.5 py-1.5 font-body text-sm focus-visible:border-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none border-white/20 bg-white/5 text-white"
            />
          </label>
        </div>
        <p className="mt-2 font-body text-[11px] text-white/40">
          Tons, fleet range {dataMin}–{dataMax}
        </p>
        {tonnageActive && (
          <button
            type="button"
            onClick={() => {
              setMinTons(dataMin);
              setMaxTons(dataMax);
            }}
            className="mt-4 font-body text-[11px] font-semibold tracking-wide text-tnt-amber uppercase hover:text-white"
          >
            Clear filter
          </button>
        )}
      </aside>

      <div>
        <p className="font-mono text-[10px] tracking-[0.12em] text-tnt-amber tabular-nums uppercase sm:text-xs sm:tracking-[0.14em]">
          Showing {rows.length} of {models.length}
        </p>

        {rows.length > 0 ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((m, i) => {
              const cardPhoto = photos[i % photos.length];
              return (
              <li
                key={`${m.make}-${m.model}-${m.chartHref}`}
                className="flex flex-col overflow-hidden rounded-xl border border-white/15 bg-white/5"
              >
                <div className="relative aspect-16/9">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardPhoto.src}
                    alt="All-terrain crane"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {cardPhoto.isStock && (
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-white/80 uppercase backdrop-blur-sm">
                      Stock photo
                    </span>
                  )}
                  <span className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-lg bg-tnt-amber text-black shadow">
                    <Icon name="allterrain" className="h-4.5 w-4.5" strokeWidth={1.8} />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="font-body text-[10px] tracking-[0.14em] uppercase text-white/50">
                    {m.make}
                  </p>
                  <h3 className="mt-1 font-display text-xl tracking-wide uppercase text-white">
                    {m.model}
                  </h3>

                  <p className="mt-4 font-mono text-sm tracking-[0.08em] text-tnt-amber tabular-nums uppercase">
                    {m.capacityTons} Ton
                  </p>

                  <a
                    href={m.chartHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 font-body text-[11px] font-semibold tracking-wide uppercase text-white hover:text-tnt-amber"
                  >
                    View PDF
                    <Icon name="arrow" className="h-3 w-3" strokeWidth={2.5} />
                  </a>
                </div>
              </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-12 text-center font-body text-sm text-white/50">
            No machines match that search.
          </p>
        )}
      </div>
    </div>
  );
}
