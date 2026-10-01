"use client";

/**
 * LOCATION SELECT — the region picker in the Services mega panel.
 *
 * A native <select> would be less code, but it can't show the two-line
 * region + operating-brand pair that makes the choice legible ("Southeast" and
 * "Southway Crane" are the same answer to a visitor who only knows one of
 * them). So this is the ARIA listbox pattern, built to the same contract a
 * native select gives you:
 *
 *   - collapsed trigger is a button with aria-haspopup/aria-expanded
 *   - Arrow keys, Home/End move the active option; Enter/Space commit
 *   - Escape closes the LIST only, never the surrounding mega panel — it
 *     stops propagation so SiteNav's document-level Escape handler doesn't
 *     also fire and yank the panel out from under the visitor
 *   - focus stays on the list (aria-activedescendant), so the browser never
 *     scrolls the panel to chase a focused <li>
 *
 * The desktop panel is the only consumer. The mobile accordion uses a real
 * <select> instead — on touch, the OS picker beats anything reimplemented.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SERVICE_LOCATIONS, type LocationId } from "./navigation";

/**
 * The operating company for a location row.
 *
 * Logo chips were removed 2026-07-29 — this is now the text treatment that two
 * companies (Allison, Stampede/TNT Canada) already used for want of a mark, so
 * every row reads the same way. The `logo` paths remain mapped in
 * navigation.ts, unused here, if the marks are ever wanted back.
 *
 * Fixed width so the city column can't jog between rows.
 */
/**
 * Escape hand-off between this control and SiteNav.
 *
 * `e.stopPropagation()` is NOT enough here. React 19 attaches its delegated
 * listeners to `document`, and SiteNav's Escape handler is a plain
 * `document.addEventListener` — two listeners on the SAME node, so there is no
 * propagation between them to stop. Escape therefore cleared the search box AND
 * closed the whole mega panel (measured: panel gone after one Escape).
 *
 * Both listeners do see the same native event object, so marking it is the
 * reliable channel. `stopImmediatePropagation` would also work but depends on
 * registration order, which neither component controls.
 */
const ESC_MARK = "__tntLocationEscapeHandled";
type MarkedEvent = KeyboardEvent & { [ESC_MARK]?: boolean };

export function markEscapeHandled(e: KeyboardEvent) {
  (e as MarkedEvent)[ESC_MARK] = true;
}
export function wasEscapeHandled(e: KeyboardEvent) {
  return (e as MarkedEvent)[ESC_MARK] === true;
}

function BrandMark({ brand }: { brand: string }) {
  return (
    <span className="flex h-8 w-[88px] shrink-0 items-center justify-end text-right font-mono text-[9px] leading-tight tracking-[0.06em] uppercase text-white/50">
      {brand}
    </span>
  );
}

export default function LocationSelect({
  value,
  brands,
  onChange,
  open,
  onOpenChange,
}: {
  value: LocationId;
  /** Companies toggled on in the logo row; empty = no company filter. */
  brands: string[];
  onChange: (next: LocationId) => void;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected =
    SERVICE_LOCATIONS.find((l) => l.id === value) ?? SERVICE_LOCATIONS[0];
  // With companies picked in the logo row, the list offers only their cities,
  // plus the "All Locations" row as the way back to "any of those companies".
  const brandScope = useMemo(
    () =>
      brands.length
        ? SERVICE_LOCATIONS.filter((l) => !l.region || brands.includes(l.brand))
        : SERVICE_LOCATIONS,
    [brands],
  );

  // The trigger's second line: with no city picked, it names the company
  // filter rather than claiming the whole network.
  const scopeLine =
    selected.region || brands.length === 0
      ? selected.brand
      : brands.length === 1
        ? brands[0]
        : `${brands.length} companies`;

  // Matches the city AND the operating company, so "RMS" finds Denver and
  // "Eagle" finds Vancouver — people look for markets both ways.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = brandScope;
    if (!q) return source;
    return source.filter(
      (l) =>
        l.label.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q),
    );
  }, [brandScope, query]);

  // activeIndex indexes the FILTERED list, so it must return to range whenever
  // the query narrows the results. Done at the keystroke rather than in an
  // effect keyed on `query` — typing is the event, and an effect would render
  // one frame with a stale index (and trips react-hooks/set-state-in-effect).
  const search = (next: string) => {
    setQuery(next);
    setActiveIndex(0);
  };

  // Focus goes to the search box, not the list: the point of opening is to
  // start typing. Arrow keys are handled there and drive the list through
  // aria-activedescendant, which is the combobox half of the ARIA pattern.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Focus stays on the input, so nothing scrolls the list for us — arrowing
  // past the fold would walk an active option the visitor can't see.
  const activeItem = filtered[activeIndex] ?? filtered[0] ?? null;

  useEffect(() => {
    if (!open) return;
    const id = activeItem?.id;
    if (!id) return;
    document
      .getElementById(`nav-loc-${id}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeItem]);

  const close = () => {
    onOpenChange(false);
    setQuery("");
    buttonRef.current?.focus();
  };

  const commit = (index: number) => {
    const next = filtered[index];
    if (next) onChange(next.id);
    close();
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(filtered.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (filtered.length) commit(activeIndex);
        break;
      // NOT Space — it's a character in a search field now.
      case "Escape":
        // First Escape clears a query; a second closes. Closing outright would
        // throw away typing on the way to fixing a typo. Either way this must
        // not reach SiteNav's document handler, which would shut the panel.
        e.preventDefault();
        e.stopPropagation();
        markEscapeHandled(e.nativeEvent);
        if (query) search("");
        else close();
        break;
      case "Tab":
        onOpenChange(false);
        search("");
        break;
    }
  };

  return (
    <div className="relative">
      <p
        id="nav-location-label"
        className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/45"
      >
        Choose Location
      </p>

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="nav-location-label nav-location-value"
        onClick={() => (open ? close() : (search(""), onOpenChange(true)))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            search("");
            onOpenChange(true);
          }
        }}
        className="mt-2 flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors hover:border-tnt-amber/60 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none border-white/15 bg-white/5"
      >
        {/* Selected state keeps the CITY as the headline and the company mark
            beneath it, so the association survives after the list closes. */}
        <span id="nav-location-value" className="min-w-0">
          <span className="block truncate font-body text-sm font-semibold text-white">
            {selected.label}
          </span>
          <span className="block truncate font-mono text-[11px] text-white/45">
            {scopeLine}
          </span>
        </span>
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className={`h-2.5 w-2.5 shrink-0 text-tnt-amber ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
        </svg>
      </button>

      {open && (
        /* Wider than the trigger: the rail is narrow, but "Colorado Springs, CO"
           over "Eagle West Crane & Rigging" needs room to read without
           truncating. Anchored left so it opens into the panel. */
        <div className="absolute left-0 z-10 mt-1 w-[21rem] overflow-hidden rounded-md border shadow-2xl shadow-black/20 border-white/15 bg-black">
          <div className="border-b p-2 border-white/10">
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2 ring-1 focus-within:ring-tnt-amber bg-white/5 ring-white/10">
              <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-white/50" />
              <input
                ref={inputRef}
                // combobox + listbox: the input owns focus and drives the list
                // through aria-activedescendant. `type="text"`, not "search" —
                // the native clear button would sit outside our key handling.
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="nav-location-list"
                aria-autocomplete="list"
                aria-activedescendant={
                  activeItem ? `nav-loc-${activeItem.id}` : undefined
                }
                aria-label="Search locations by city or company"
                value={query}
                onChange={(e) => search(e.target.value)}
                onKeyDown={onInputKeyDown}
                onBlur={() => onOpenChange(false)}
                placeholder="Search city or company…"
                className="w-full bg-transparent font-body text-sm focus:outline-none text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <p aria-live="polite" className="sr-only">
            {filtered.length} locations match.
          </p>

          <ul
            id="nav-location-list"
            role="listbox"
            aria-label="Locations"
            // Without this Lenis takes the wheel and scrolls the page behind the
            // open dropdown instead of the list.
            data-lenis-prevent
            className="max-h-[22rem] overflow-y-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-3 font-body text-sm text-white/50">
                No locations match &quot;{query}&quot;.
              </li>
            )}
            {filtered.map((loc, i) => {
            const isSelected = loc.id === value;
            const isActive = i === activeIndex;
            return (
              <li
                key={loc.id}
                id={`nav-loc-${loc.id}`}
                role="option"
                aria-selected={isSelected}
                // The logo is decorative (alt=""), so the brand has to reach
                // assistive tech through the option's own name.
                aria-label={loc.region ? `${loc.label} — ${loc.brand}` : loc.label}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  // mousedown, not click: the list closes on blur, and blur
                  // would fire first and unmount the option mid-click.
                  e.preventDefault();
                  commit(i);
                }}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${
                  isActive ? "bg-white/5" : ""
                }`}
              >
                <span
                  className={`min-w-0 flex-1 truncate font-body text-sm font-semibold ${
                    isSelected ? "text-tnt-amber" : "text-white/85"
                  }`}
                >
                  {loc.label}
                </span>
                {/* "All Locations" has no company, but still reserves the slot
                    so its row matches the rest — otherwise the list ripples. */}
                {loc.region ? (
                  <BrandMark brand={loc.brand} />
                ) : (
                  <span aria-hidden="true" className="h-8 w-[88px] shrink-0" />
                )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
