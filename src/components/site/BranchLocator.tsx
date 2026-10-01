"use client";

/**
 * BRANCH LOCATOR — the interactive "Find Your Nearest Branch" section.
 *
 * Replaces the hand-drawn Natural Earth coastline map. Heading, description and
 * the All / United States / Canada filter are carried over unchanged; the
 * search, marker selection and branch panel are rebuilt around a three-region
 * layout (search · map · detail) that stacks on smaller screens.
 *
 * State lives here rather than in <WorldMap> so the list, the markers and the
 * detail panel can never disagree about what is selected.
 *
 * The map itself is lazy-loaded: maplibre-gl is ~200KB gzipped and touches
 * `window` at import time, and none of it is needed to paint the header, the
 * search panel or the detail card.
 *
 * LIGHT BY DEFAULT (2026-09-23, on request — "it needs to be in light [theme]",
 * same ask SafetyCulture.tsx got on 2026-09-15): the section shell, search
 * panel, list, and detail card were unconditionally dark (`bg-black`,
 * white/N text) with no regard for the site's Light/Dark toggle. Every
 * white/N utility now has a black/N light counterpart, gated by
 * `dark:`/`useColorScheme` the same way EquipmentGuide.tsx and
 * SafetyCulture.tsx do it. The map's own basemap palette
 * (mapcn-map-route.tsx) was already theme-independent light "technical
 * paper" styling, so it needed no change.
 *
 * FULL-BLEED MAP + FLOATING CARDS (2026-09-23, on request — "use the same
 * map look" as a reference screenshot): the map fills the whole row
 * (`xl:absolute xl:inset-0`) with the search panel and detail card floating
 * on top, inset 60px from the map's left/right edges. Both cards are SOLID
 * opaque fills (`bg-white` / dark: `bg-tnt-slate`), not the `.glass`
 * frosted-on-dark treatment they used before — `.glass` is meant for a card
 * over a dark hero, and left translucent here it let the busy basemap
 * underneath bleed through and wash out the text. Below `xl`, none of this
 * applies — search/map/detail stack in plain flex-column order exactly as
 * before the redesign.
 */

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Search, Phone, Building2, MapPin } from "lucide-react";
import RevealText from "./RevealText";
import Button from "./Button";
import type { BranchLocatorData } from "./branchLocatorData";

// Lazy-loaded, ssr:false: maplibre-gl is ~200KB gzipped and touches `window`
// at import time. The section header, search panel and detail card all render
// without it.
const BranchMap = dynamic(
  () => import("@/components/ui/mapcn-map-route").then((m) => m.BranchMap),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[4/3] w-full animate-pulse rounded-2xl border lg:aspect-[5/4] xl:absolute xl:inset-0 xl:aspect-auto xl:h-full xl:w-full border-white/10 bg-[#0B0B0B]" />
    ),
  },
);

// TNT operates in exactly two countries. "all" is the reset state, not a country.
const COUNTRIES = [
  { id: "all", label: "All" },
  { id: "US", label: "United States" },
  { id: "CA", label: "Canada" },
] as const;

type CountryId = (typeof COUNTRIES)[number]["id"];

export default function BranchLocator({ branches }: BranchLocatorData) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<CountryId>("all");
  const [selectedId, setSelectedId] = useState<string | null>("hou");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Matches city, state (code or full name), region, operating brand, and
  // ZIP code (2026-09-29, on request — "search by using zip code"). ZIP only
  // matches branches with real address data on file (branchLocatorData.ts's
  // `address` field, currently 16 of 44) — there's no fabricated ZIP to
  // search for the rest.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches.filter((b) => {
      if (country !== "all" && b.country !== country) return false;
      if (!q) return true;
      return (
        b.city.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q) ||
        b.brand.toLowerCase().includes(q) ||
        (b.address?.zip.toLowerCase().includes(q) ?? false)
      );
    });
  }, [branches, query, country]);

  const visibleIds = useMemo(() => new Set(filtered.map((b) => b.id)), [filtered]);

  // Switching country keeps the current selection if it still fits the new
  // scope, otherwise jumps to the first branch in that country.
  const selectCountry = (next: CountryId) => {
    setCountry(next);
    setSelectedId((cur) => {
      const curBranch = branches.find((b) => b.id === cur);
      if (curBranch && (next === "all" || curBranch.country === next)) return cur;
      return branches.find((b) => next === "all" || b.country === next)?.id ?? null;
    });
  };

  const onSelect = useCallback((id: string) => setSelectedId(id), []);
  const onHover = useCallback((id: string | null) => setHoveredId(id), []);

  const selected = branches.find((b) => b.id === selectedId) ?? null;

  return (
    <section id="coverage" className="scroll-mt-32 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
            North American Coverage
          </p>
          <RevealText
            as="h2"
            barClassName="bg-tnt-amber"
            text="Find Your Nearest Branch"
            className="mt-3 font-display text-4xl tracking-wide uppercase sm:text-5xl text-white"
          />
          <p className="mt-4 font-body text-base sm:text-lg text-white/70">
            One fleet across the US and Canada. Pick a country or search a city
            or region to see the branch that mobilizes to your site.
          </p>
        </div>

        {/* Country filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          {COUNTRIES.map((c) => {
            const on = country === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCountry(c.id)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors ${
                  on
                    ? "border-tnt-amber bg-tnt-amber text-black"
                    : "border-white/20 text-white/80 hover:border-white/40 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Desktop (xl+): the map is a full-bleed backdrop (absolute, fills
            the row) with the search and detail panels floating over it as
            shadowed cards — matching the reference layout (2026-09-23, on
            request: "bring same like this, use the same map look"). Below
            xl: search · map · detail stacked in that order, which is also
            the DOM order — no visual/reading-order mismatch, and none of
            the xl: positioning utilities apply, so it's a plain flex
            column exactly as before. */}
        <div className="relative mt-10 flex flex-col gap-6 xl:h-[600px]">
          {/* ── Search + results ───────────────────────────────────────── */}
          <div
            className={`rounded-2xl p-4 xl:absolute xl:top-8 xl:left-[60px] xl:z-10 xl:w-[17rem] xl:shadow-2xl ${
              "border border-white/15 bg-tnt-slate"
            }`}
          >
            <label htmlFor="branch-search" className="sr-only">
              Search by city, state, ZIP code, or branch
            </label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 ring-1 focus-within:ring-tnt-amber bg-white/10 ring-white/20">
              <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-white/70" />
              <input
                id="branch-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City, state, ZIP, or branch…"
                className="w-full bg-transparent font-body text-sm focus:outline-none text-white placeholder:text-white/50"
              />
            </div>

            <p aria-live="polite" className="sr-only">
              {filtered.length} branches match.
            </p>

            {/* `data-lenis-prevent`: Lenis owns the wheel globally, so without
                it a wheel over this list smooth-scrolls the PAGE and the list
                never moves — measured at 583px of unreachable content. The
                matching `overscroll-behavior` rule is in globals.css. */}
            <ul
              data-lenis-prevent
              className="mt-3 max-h-64 space-y-1 overflow-y-auto overscroll-contain pr-1 lg:max-h-[26rem]"
            >
              {filtered.length === 0 && (
                <li className="px-2 py-2 font-body text-sm text-white/60">
                  No branches match “{query}”.
                </li>
              )}
              {filtered.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(b.id)}
                    onMouseEnter={() => setHoveredId(b.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-current={selectedId === b.id ? "true" : undefined}
                    className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left font-body text-sm transition-colors focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none ${
                      selectedId === b.id
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Building2
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-tnt-amber"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block">{b.city}</span>
                      <span className="block truncate font-mono text-[11px] text-white/45">
                        {b.brand}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Map ────────────────────────────────────────────────────── */}
          <BranchMap
            branches={branches}
            visibleIds={visibleIds}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={onSelect}
            onHover={onHover}
            className="aspect-[4/3] w-full lg:aspect-[5/4] xl:absolute xl:inset-0 xl:aspect-auto xl:h-full xl:w-full"
          />

          {/* ── Branch detail ──────────────────────────────────────────── */}
          {selected ? (
            <div
              className={`rounded-2xl p-5 xl:absolute xl:top-8 xl:right-[60px] xl:z-10 xl:w-[19rem] xl:shadow-2xl ${
                "border border-white/15 bg-tnt-slate"
              }`}
            >
              <p className="font-body text-[11px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
                {selected.region}
              </p>
              <p className="mt-1 font-display text-2xl tracking-wide uppercase text-white">
                {selected.city}
              </p>
              <p className="mt-1.5 font-body text-[12px] font-semibold tracking-wide text-tnt-amber">
                Operated by {selected.brand}
              </p>

              {/* Address / directions (2026-09-29, on request — "redirect
                  to gmap to check the exact distance from their current
                  location"): links to Google Maps' directions view with
                  ONLY a destination set (no origin) — Maps fills the
                  origin in with the visitor's own current location itself
                  (prompting for permission if needed), so this needs no
                  geolocation handling on our side. Destination is lat/lng,
                  not the street address string: every branch has real
                  coordinates (branchLocatorData.ts's SEEDS), but only 16 of
                  44 have a real street address (see BranchLocator's own
                  note above), so lat/lng is what makes this work for every
                  branch, not just those 16. Real address text (where it
                  exists) is still shown as the link's label — more useful
                  than a bare "Get directions" — it's just not what's
                  actually passed to Maps. */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-start gap-2 font-body text-sm transition-colors hover:text-tnt-amber text-white/80"
              >
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-tnt-amber"
                />
                <span>
                  {selected.address ? (
                    <>
                      {selected.address.street}
                      <br />
                      {selected.city} {selected.address.zip}
                    </>
                  ) : (
                    "Get directions"
                  )}
                </span>
              </a>

              {/* Contact number — real per-branch line where
                  branchLocatorData.ts found one (the 16 TNT Crane & Rigging
                  branches, via navigation.ts's LOCATION_DETAILS); a DUMMY
                  placeholder for the rest until the TNT team supplies real
                  numbers for them too. Shown as its own row, not buried in
                  a bottom link, so it reads as real branch info at a
                  glance. */}
              <a
                href={selected.phone.href}
                className="mt-4 flex items-center gap-2 font-mono text-base font-semibold transition-colors hover:text-tnt-amber text-white"
              >
                <Phone aria-hidden="true" className="h-4 w-4 text-tnt-amber" />
                {selected.phone.display}
              </a>

              <p className="mt-5 font-mono text-[11px] tracking-[0.14em] uppercase text-white/45">
                Available Services
              </p>
              <ul className="mt-2 space-y-1.5">
                {selected.services.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 font-body text-[13px] text-white/80"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-tnt-amber"
                    />
                    {s}
                  </li>
                ))}
              </ul>

              {/* Single, clear CTA (2026-09-23, on request — a redesign of
                  this card's content/functionality). Replaces the old
                  three-item stack: "View branch" pointed at `#coverage`,
                  i.e. the section it's already in — a dead link, not a real
                  destination — and "Call branch" duplicated the phone row
                  above with a hardcoded number that ignored which brand was
                  selected. */}
              <Button
                href="#quote"
                variant="primary"
                onDark
                className="mt-6 w-full justify-center"
              >
                Request a Quote
              </Button>
            </div>
          ) : (
            <div
              className={`rounded-2xl p-5 xl:absolute xl:top-8 xl:right-[60px] xl:z-10 xl:w-[19rem] xl:shadow-2xl ${
                "border border-white/15 bg-tnt-slate"
              }`}
            >
              <p className="font-body text-sm text-white/60">
                Select a branch to see its services and contact options.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
