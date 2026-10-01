"use client";

/**
 * SITE NAV — added onto the Hero, not into it.
 *
 * Rendered as a fixed sibling above <HeroScrollExperience /> in page.tsx, so
 * the locked hero markup is never touched.
 *
 * Frosted dark glass (.glass-nav): translucent slate + backdrop-blur, so the
 * hero and sections blur through the bar. The tint is held dark enough (0.7)
 * that white nav text stays legible over the light sections below; a heavier
 * shadow drops in once scrolled. Degrades to solid slate where backdrop-filter
 * is unsupported (see globals.css).
 *
 * Visibility: on the HOMEPAGE only, the bar hides over the hero and is shown
 * once #family (the Family Strip, first section after the hero) reaches the
 * top of the viewport. A rAF loop reads that section's position each frame, so it
 * stays in sync under the hero's transform-based smooth-scroll (window `scroll`
 * events are unreliable). On every other route there is no hero, so the bar is
 * always visible — the check is gated on the pathname, not merely on the
 * target existing, so reusing the section on another route can't hide the bar.
 *
 * The toggle is instant, not animated: `.glass-nav` uses `backdrop-filter`,
 * which pushes opacity/transform transitions onto the main thread, and this
 * page's scroll rAF loops starve them (a CSS transition here freezes mid-fade).
 * The mega panels below open instantly for the same reason — they are children
 * of the glass header, so a fade on them stutters exactly the same way.
 *
 * STRUCTURE (2026-07-28). The bar carried nine flat links plus a phone number
 * and a CTA — eleven items, which is why the desktop layout could not engage
 * until `xl`. It now carries four group triggers (see navigation.ts), each
 * opening a panel that exposes the site's ~23 real destinations. Triggers are
 * real <Link>s to the group's own landing page, so the panel is an enhancement
 * and never the only route in — keyboard and no-JS users still get there.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import Link from "next/link";
import Button from "./Button";
import TopInfoBar from "./TopInfoBar";
import { Icon } from "./primitives";
import LocationSelect, { wasEscapeHandled } from "./LocationSelect";
import { CHROME_H } from "./chrome";
import Image from "next/image";
import {
  FAMILY_FILTERS,
  NAV_GROUPS,
  SERVICE_LOCATIONS,
  activeGroup,
  servicesPanelFor,
  type LocationId,
  type NavColumn,
} from "./navigation";

// Hover intent. OPEN is short enough to feel immediate on a deliberate hover
// but long enough that sweeping the pointer across all four triggers doesn't
// flash three panels. CLOSE is the more important one: it's the grace period
// for the diagonal move from a trigger down into its own panel, which briefly
// leaves both.
const OPEN_MS = 90;
const CLOSE_MS = 180;

// Reveal band for the homepage bar. Show once #family reaches the chrome;
// hide only after it has fallen a clear 140px back below that line. The gap is
// the deadband — without it, scroll settling right on the threshold strobes the
// bar and tears down any open panel. 140px is comfortably wider than Lenis's
// overshoot while still feeling immediate.
//
// This is also the line the hero's auto-scroll (useHeroAutoScroll.ts) lands
// on after the last frame: it scrolls on until #family's top sits at exactly
// this threshold, so the bar and the Family strip arrive together.
const REVEAL_AT = CHROME_H;
const HIDE_AT = CHROME_H + 140;

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  // Used to be conditional on a "Nav 1/2" toggle (Nav version 1 dropped the
  // About group entirely, for design comparison) — removed project-wide
  // 2026-09-29, on request ("we are going with Nav Version 2"), so this is
  // just NAV_GROUPS directly now, unconditionally.
  const visibleNavGroups = NAV_GROUPS;
  // Which region the Services panel is filtered to. Held here rather than in
  // the panel so the choice survives closing and reopening the menu — someone
  // who told us they're in the Gulf Coast shouldn't have to say it twice.
  const [location, setLocation] = useState<LocationId>("all");
  // Which operating companies the logo row has toggled on. Multi-select —
  // empty means "all companies", not "none". Held here for the same reason.
  const [brands, setBrands] = useState<string[]>([]);
  // Toggling a company off also drops a picked city that belonged to it, so
  // the panel never shows a city from a company the row says is excluded.
  const toggleBrand = (brand: string) => {
    const next = brands.includes(brand)
      ? brands.filter((b) => b !== brand)
      : [...brands, brand];
    setBrands(next);
    const city = SERVICE_LOCATIONS.find((l) => l.id === location);
    if (next.length && city?.region && !next.includes(city.brand)) {
      setLocation("all");
    }
  };
  // Inner routes have no hero, so start visible; the homepage starts hidden and
  // is revealed by the scroll loop below. Seeded from the initial pathname so
  // there's no first-paint flash on a direct load of an inner route.
  const [visible, setVisible] = useState(pathname !== "/");

  const current = activeGroup(pathname);
  const hoverTimer = useRef<number | null>(null);

  const clearHover = useCallback(() => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);
  const scheduleOpen = useCallback(
    (label: string) => {
      clearHover();
      hoverTimer.current = window.setTimeout(() => setOpenGroup(label), OPEN_MS);
    },
    [clearHover],
  );
  const scheduleClose = useCallback(() => {
    clearHover();
    hoverTimer.current = window.setTimeout(() => setOpenGroup(null), CLOSE_MS);
  }, [clearHover]);
  useEffect(() => clearHover, [clearHover]);

  // Keep the "am I on the homepage?" flag in a ref the rAF loop can read without
  // being re-created on navigation (SiteNav lives in the layout and persists
  // across client-side route changes, so the loop is set up once).
  const isHomeRef = useRef(pathname === "/");
  useEffect(() => {
    isHomeRef.current = pathname === "/";
  }, [pathname]);

  // The open panel, readable from the ticker below without re-registering it
  // on every open/close. Mirrored in an effect, same as isHomeRef above.
  const openGroupRef = useRef<string | null>(null);
  useEffect(() => {
    openGroupRef.current = openGroup;
  }, [openGroup]);

  // Reveal the bar once #family (the Family Strip, first section after the
  // hero) reaches the top — homepage only. Position is polled rather than
  // driven by `scroll` events, which are unreliable under smooth-scrolling;
  // on non-home routes the bar is always shown.
  //
  // Runs on gsap.ticker, NOT a private requestAnimationFrame. SmoothScroll's
  // whole point is that there is exactly one rAF loop on the page — this was
  // the only perpetual loop still outside it.
  //
  // HYSTERESIS (REVEAL_AT vs HIDE_AT) is the important part. With a single
  // threshold, a scroll that comes to rest near it strobes the bar: Lenis's
  // inertial lerp oscillates by a few px as it settles, and each flip both
  // flickered the chrome and — via `shownGroup` — tore down any open mega
  // panel. Measured at 13 flips from a ±5px jiggle. The deadband means the bar
  // must travel a real distance back up before it hides again.
  useEffect(() => {
    let shown: boolean | null = null;
    const tick = () => {
      let next: boolean;
      if (!isHomeRef.current) {
        next = true;
      } else {
        const target = document.getElementById("family");
        next = !target
          ? true
          : target.getBoundingClientRect().top <= (shown ? HIDE_AT : REVEAL_AT);
      }
      // An open panel pins the bar. The visitor is actively using the nav; the
      // scroll position that would otherwise hide it is not the stronger signal.
      if (openGroupRef.current) next = true;
      if (next !== shown) {
        shown = next;
        setVisible(next);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Any navigation closes everything. Covers the case a link inside a panel
  // points at the route you're already on, where no unmount would occur.
  // Adjusted during render rather than in an effect: this is derived-from-props
  // state, and an effect here would paint the open panel once on the new route
  // before closing it (and trips react-hooks/set-state-in-effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenGroup(null);
    setMobileOpen(false);
    setMobileSection(null);
  }

  // A panel left open while the bar hides over the hero would float detached,
  // so visibility gates it at render time — no second piece of state to sync.
  const shownGroup = visible ? openGroup : null;

  // Escape closes the open panel or the mobile sheet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // The location combobox consumes Escape first (to clear its search, then
      // to close itself). It can't stop us by propagation — React 19 delegates
      // to `document`, the same node this listener is on — so it marks the
      // native event instead. See LocationSelect.
      if (wasEscapeHandled(e)) return;
      setOpenGroup(null);
      setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Crossing to `lg` hides the mobile sheet by CSS, but the state stays true —
  // which would leave the body scroll lock below applied with nothing on screen
  // to explain it, i.e. a page that simply cannot scroll. Close it on the
  // breakpoint itself rather than trusting the sheet to be dismissed first.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Lock the page behind the mobile sheet. Lenis leaves touch to native
  // momentum scrolling, so an overflow lock on <body> is all this needs; the
  // sheet scrolls internally.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <header
      // `inert` while hidden. opacity-0 + pointer-events-none stops the MOUSE
      // but leaves every link in the tab order and the accessibility tree, so
      // a keyboard user starting at the top of the homepage tabbed through the
      // whole invisible bar — utility strip, socials, wordmark, all four
      // triggers — before reaching anything on screen. inert removes it from
      // both. Cheaper and more correct than visibility:hidden here, since the
      // toggle is instant anyway (no transition to preserve).
      inert={!visible}
      className={`glass-nav fixed inset-x-0 top-0 z-50 shadow-md shadow-black/20 ${
        visible ? "" : "pointer-events-none -translate-y-full opacity-0"
      }`}
      // Closing on focus leaving the header is what makes the panels usable by
      // keyboard: tabbing off the last link in a panel puts it away without
      // needing Escape. relatedTarget is null when focus leaves the document
      // entirely, which should not close anything.
      onBlur={(e) => {
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) {
          setOpenGroup(null);
        }
      }}
    >
      {/* Utility strip — inside the header so it hides with the nav over the
          hero. Adds 36px to the chrome at `lg`+ (see CHROME_H). */}
      <TopInfoBar />

      {/* Wrapper spans the bar AND the panel, so the pointer can travel from a
          trigger into its panel without crossing "outside". */}
      <div onMouseLeave={scheduleClose}>
        {/* h-20 = 80px; pairs with TopInfoBar's h-10 to make CHROME_H = 120. */}
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Wordmark — swapped back to Secondary mark, 2026-08-18 (traded
              places with FamilyStrip's first logo, which now carries Primary).
              Secondary is a DIFFERENT shape, not just a smaller version of
              Primary: it's wide (1200×579 vs Primary's near-square 1200×987),
              a flat "TNT" lockup with "CRANE & RIGGING" beneath — built for a
              compact horizontal placement, which suits this 80px bar better
              than Primary's stacked crane-boom illustration did.

              No white chip here, unlike the marks in the Services panel: this
              logo is drawn ON a black block, so it sits correctly against the
              dark nav — it's the light surfaces that need the chip. `priority`
              because it's above the fold on every route. */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/brand/tnt.svg"
              alt="TNT Crane &amp; Rigging — home"
              width={1200}
              height={579}
              priority
              unoptimized
              sizes="(min-width: 640px) 133px, 112px"
              className="h-[54px] w-auto sm:h-[64px]"
            />
          </Link>

          {/* Desktop triggers. Eight items as of 2026-09-10, so the gap and
              padding tighten a step to keep the row on one line at `lg` — the
              four-group bar had room to spare and this does not.

              Three shapes here, not one: a panel item (has columns) is a link
              with a caret that opens on hover; a flat item with an href is a
              plain link; a flat item with `href: null` has no destination yet
              and renders as inert text rather than a link to nowhere. */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {visibleNavGroups.map((g) => {
              const isOpen = shownGroup === g.label;
              const isCurrent = current === g.label;
              const hasPanel = g.columns.length > 0;
              const cls = `flex items-center gap-1.5 rounded-md px-2.5 py-2 font-body text-base font-semibold whitespace-nowrap transition-colors ${
                isOpen || isCurrent
                  ? "text-tnt-amber"
                  : "text-white/85 hover:text-tnt-amber"
              }`;

              if (g.href === null) {
                return (
                  <li key={g.label}>
                    {/* aria-disabled, not `disabled`: this is a span, and the
                        label still has to be readable by a screen reader —
                        it announces the item exists but goes nowhere yet. */}
                    <span
                      aria-disabled="true"
                      className="flex items-center rounded-md px-2.5 py-2 font-body text-base font-semibold whitespace-nowrap text-white/40"
                    >
                      {g.label}
                    </span>
                  </li>
                );
              }

              return (
                <li
                  key={g.label}
                  onMouseEnter={hasPanel ? () => scheduleOpen(g.label) : undefined}
                >
                  <Link
                    href={g.href}
                    aria-expanded={hasPanel ? isOpen : undefined}
                    aria-haspopup={hasPanel ? "true" : undefined}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setOpenGroup(null)}
                    onFocus={
                      hasPanel ? () => setOpenGroup(g.label) : undefined
                    }
                    onKeyDown={
                      hasPanel
                        ? (e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setOpenGroup(g.label);
                            }
                          }
                        : undefined
                    }
                    // 16px to match the panel's stepped-up labels (2026-08-04)
                    // — the trigger and the column it opens are the same rung
                    // of the hierarchy and looked mismatched a step apart.
                    className={cls}
                  >
                    {g.label}
                    {hasPanel && (
                      <svg
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                        className={`h-3 w-3 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
                      </svg>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Contact rail.

              The phone is `xl`-only as of 2026-09-10. Eight top-level items
              (up from four) need 667px of the row; with the 184px wordmark and
              a 236px rail that totalled 1087px against the 960px available at
              `lg`, which pushed "Get a Quote" clean off the right edge —
              measured, not guessed. Dropping the 134px number (plus its gap)
              brings the row to ~933px and it fits again. Nothing is lost:
              TopInfoBar carries the number below `xl` instead, and above `xl`
              this rail is unchanged. */}
          <div className="hidden items-center gap-5 lg:flex">
            <a
              href="tel:+18007992505"
              className="hidden font-mono text-base font-semibold whitespace-nowrap text-white transition-colors hover:text-tnt-amber xl:block"
            >
              1-800-799-2505
            </a>
            <Button href="/#quote" variant="primary" onDark arrow={false}>
              Get a Quote
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-300 ${
                  mobileOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute top-1.5 left-0 block h-0.5 w-6 bg-current transition-opacity duration-300 ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-300 ${
                  mobileOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </nav>

        {/* ---- Mega panel (desktop only) ------------------------------------
            Solid navy rather than more glass: the strip above is already navy,
            so the chrome reads as tiers instead of one thick blur, and link
            text over a translucent panel would sit on whatever section
            happened to be scrolling underneath. */}
        {shownGroup &&
          visibleNavGroups.filter(
            // The columns check is what keeps a flat item from ever rendering
            // an empty panel. Flat items don't call scheduleOpen either, so
            // this is belt-and-braces — but it's also what lets `feature` be
            // asserted below: a group with columns always authors one.
            (g) => g.label === shownGroup && g.columns.length > 0,
          ).map((g) => {
            // Services is the one group whose answer depends on where you are.
            // Everything else is national and renders as authored.
            const localized = g.label === "Services";
            const { columns, feature } = localized
              ? servicesPanelFor(location, brands)
              : { columns: g.columns, feature: g.feature! };
            // Remounting on the location key replays the swap animation. A
            // transition would be the obvious choice, but transitions inside
            // this backdrop-filtered header freeze mid-flight under the scroll
            // rAF loops (see the note at the top); a keyframe animation always
            // lands on its final state even when frames are dropped.
            const swapKey = localized
              ? `${location}|${brands.join(",")}`
              : "static";

            return (
              <div
                key={g.label}
                className="absolute inset-x-0 top-full hidden border-t border-tnt-amber/40 shadow-2xl shadow-black/20 lg:block bg-black"
                onMouseEnter={clearHover}
              >
                {/* Gaps and rails were tightened on 2026-08-04 to buy width
                    for the columns: at the stepped-up 16px label the longest
                    item ("Lift Planning & Engineering", 27ch) needs ~330px a
                    row and the columns only had ~276px, so it wrapped to two
                    lines. Outer gap 10→6, rails 15/19rem→12.5/17rem and their
                    inner padding 8/10→6/8 hand ~128px to the grid. The panel's
                    own `max-w-7xl` and `py-12` are deliberately untouched. */}
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  {localized && (
                    <FamilyFilters
                      selected={brands}
                      onToggle={toggleBrand}
                      onClear={() => {
                        setBrands([]);
                        setLocation("all");
                      }}
                    />
                  )}
                  <div className="flex justify-center gap-6">
                  {/* Location picker leads the panel from a rail of its own.
                      It's a filter, and a filter belongs upstream of what it
                      filters — left of the columns, read before them. */}
                  {localized && (
                    <div className="w-[12.5rem] shrink-0 border-r pr-6 border-white/10">
                      <LocationSelect
                        value={location}
                        brands={brands}
                        onChange={(next) => {
                          setLocation(next);
                          setLocationPickerOpen(true);
                        }}
                        open={locationPickerOpen}
                        onOpenChange={setLocationPickerOpen}
                      />
                    </div>
                  )}

                  <div
                    key={swapKey}
                    className={`nav-swap grid gap-x-8 gap-y-8 ${
                      // Two columns still stretch to fill the row — that's a
                      // real two-up layout. A lone column (Services) is capped
                      // to its own content width instead so it doesn't strand
                      // itself in a track as wide as the whole row. The panel
                      // row is centered (justify-center above) with an equal
                      // gap-6 + 6-unit rail padding on each side, so any
                      // leftover row width splits evenly left and right
                      // instead of collecting after the feature card.
                      columns.length > 1
                        ? "flex-1 grid-cols-2"
                        : "w-[22rem] shrink-0 grid-cols-1"
                    }`}
                  >
                    {columns.map((col) => (
                      <PanelColumn key={col.no} col={col} />
                    ))}
                  </div>

                  <div className="w-[17rem] shrink-0 border-l pl-6 border-white/10">
                    {/* Closing card — one destination per panel that carries
                        the group's argument, so the panel makes a point
                        instead of only listing. */}
                    <div key={swapKey} className="nav-swap">
                      {/* Stepped up with PanelColumn (2026-08-04) so the
                          closing card doesn't shrink relative to the list it
                          sits beside. */}
                      <p className="font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
                        {feature.eyebrow}
                      </p>
                      <p className="mt-3 font-display text-3xl leading-tight tracking-wide uppercase text-white">
                        {feature.title}
                      </p>
                      <p className="mt-3 font-body text-base leading-relaxed text-white/60">
                        {feature.blurb}
                      </p>
                      <Link
                        href={feature.href}
                        onClick={() => setOpenGroup(null)}
                        className="mt-5 inline-flex items-center gap-2 font-body text-base font-semibold text-tnt-amber hover:text-white"
                      >
                        {feature.cta}
                        <Icon name="arrow" className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Screen readers get told the list changed; the visual swap
                    alone is silent to anyone not looking at it. */}
                {localized && (
                  <p aria-live="polite" className="sr-only">
                    Showing services for{" "}
                    {SERVICE_LOCATIONS.find((l) => l.id === location)?.label}.
                  </p>
                )}
              </div>
            );
          })}
      </div>

      {/* ---- Mobile sheet ---------------------------------------------------
          Groups become accordion sections rather than one 23-item list. Height
          is capped to the viewport minus the bar so the sheet scrolls itself
          instead of the locked page behind it. */}
      <div
        id="mobile-menu"
        // Lenis leaves touch to native momentum, so this matters mainly for a
        // trackpad at a narrow window — but the sheet should scroll itself in
        // every input mode, not just the one it was designed for.
        data-lenis-prevent
        className={`overflow-y-auto overscroll-contain border-t border-white/10 bg-black lg:hidden ${
          mobileOpen ? "max-h-[calc(100vh-5rem)]" : "max-h-0 overflow-hidden"
        } transition-[max-height] duration-300`}
      >
        <ul className="flex flex-col gap-1 px-4 pt-2 pb-6">
          {visibleNavGroups.map((g) => {
            const expanded = mobileSection === g.label;
            const localized = g.label === "Services";
            const cols = localized
              ? servicesPanelFor(location, brands).columns
              : g.columns;
            // Same three shapes as the desktop bar: accordion, plain link, or
            // inert label. The accordion toggle only renders when there is
            // something under it to reveal.
            const hasPanel = cols.length > 0;
            return (
              <li key={g.label} className="border-b last:border-0 border-white/10">
                <div className="flex items-center">
                  {g.href === null ? (
                    <span
                      aria-disabled="true"
                      className="flex-1 rounded-md px-3 py-3.5 font-display text-base tracking-wide uppercase text-white/30"
                    >
                      {g.label}
                    </span>
                  ) : (
                    <Link
                      href={g.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={current === g.label ? "page" : undefined}
                      className={`flex-1 rounded-md px-3 py-3.5 font-display text-base tracking-wide uppercase ${
                        current === g.label ? "text-tnt-amber" : "text-white"
                      }`}
                    >
                      {g.label}
                    </Link>
                  )}
                  {hasPanel && (
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSection((v) => (v === g.label ? null : g.label))
                      }
                      aria-expanded={expanded}
                      aria-label={`${expanded ? "Collapse" : "Expand"} ${g.label}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white/60"
                    >
                      <svg
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                        className={`h-3 w-3 transition-transform duration-200 ${
                          expanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
                      </svg>
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className="pb-3">
                    {/* Real <select> on touch: the OS picker is better than
                        anything reimplemented, and it's keyboard-complete for
                        free. The desktop panel uses the custom listbox because
                        it shows the region's operating brand on a second line,
                        which a native option can't. */}
                    {localized && (
                      <div className="mt-2 px-3">
                        <label
                          htmlFor="mobile-location"
                          className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/45"
                        >
                          Choose Location
                        </label>
                        <select
                          id="mobile-location"
                          value={location}
                          onChange={(e) =>
                            setLocation(e.target.value as LocationId)
                          }
                          className="mt-2 w-full rounded-md border px-3 py-2.5 font-body text-sm font-semibold focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none border-white/15 bg-white/5 text-white"
                        >
                          {SERVICE_LOCATIONS.map((loc) => (
                            <option
                              key={loc.id}
                              value={loc.id}
                              className="bg-white text-black"
                            >
                              {loc.label} — {loc.brand}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {cols.map((col) => (
                      <div key={col.no} className="mt-2">
                        <p className="px-3 font-mono text-[11px] tracking-[0.14em] text-tnt-amber uppercase">
                          {col.heading}
                        </p>
                        <ul className="mt-1">
                          {col.items.map((item) => (
                            <li key={item.label + item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-[15px] hover:text-tnt-amber text-white/75 hover:bg-white/5"
                              >
                                {item.index && (
                                  <span className="font-mono text-[11px] tabular-nums text-white/30">
                                    {item.index}
                                  </span>
                                )}
                                <span className="flex-1">{item.label}</span>
                                {item.meta && (
                                  <span className="font-mono text-[11px] tabular-nums text-white/40">
                                    {item.meta}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}

          <li className="mt-4">
            <a
              href="tel:+18007992505"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-3 font-mono text-base font-semibold text-tnt-amber hover:bg-white/5"
            >
              1-800-799-2505
            </a>
          </li>
          <li className="mt-2">
            <Button
              href="/#quote"
              variant="primary"
              arrow={false}
              onClick={() => setMobileOpen(false)}
              className="w-full justify-center py-3"
            >
              Get a Quote
            </Button>
          </li>
        </ul>
      </div>

      </header>
      {/* The floating "Nav / 01" version-picker pill that used to sit here
          (bottom-right) was removed outright 2026-09-29, on request — "we
          are going with Nav Version 2" (confirmed, permanent), so there's
          no longer a version to pick. The About version picker that once
          sat alongside it was already removed 2026-09-23 for the same
          reason (see git history if either is ever wanted back). */}
    </>
  );
}


/**
 * The company logo row atop the Services panel. Multi-select: each logo is an
 * independent toggle (aria-pressed), so a visitor can ask for "RMS and
 * Southway" at once. "All" is the reset — it is pressed exactly when nothing
 * else is, since no filter and every company mean the same thing.
 */
function FamilyFilters({
  selected,
  onToggle,
  onClear,
}: {
  selected: string[];
  onToggle: (brand: string) => void;
  onClear: () => void;
}) {
  const none = selected.length === 0;
  return (
    <div className="mb-8 flex justify-center border-b pb-6 border-white/10">
      <ul
        aria-label="Filter services by company (select any number)"
        className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-3"
      >
        <li>
          <button
            type="button"
            onClick={onClear}
            aria-pressed={none}
            className={`flex h-12 min-w-20 items-center justify-center rounded-sm border px-3 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors ${
              none
                ? "border-tnt-amber bg-tnt-amber text-black"
                : "hover:border-tnt-amber/60 hover:text-tnt-amber border-white/15 text-white/65"
            }`}
          >
            All
          </button>
        </li>
        {FAMILY_FILTERS.map((company) => {
          const isOn = selected.includes(company.brand);
          return (
            <li key={company.brand}>
              <button
                type="button"
                onClick={() => onToggle(company.brand)}
                aria-label={`Filter services by ${company.brand}`}
                aria-pressed={isOn}
                className={`relative block h-12 w-28 rounded-sm border p-1 transition-colors ${
                  isOn
                    ? "border-tnt-amber ring-1 ring-tnt-amber"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                <Image
                  src={company.logo}
                  alt={company.brand}
                  fill
                  sizes="84px"
                  unoptimized
                  className="object-contain"
                />
                {/* A check, not just the ring, so "on" survives a glance at a
                    row where several logos are lit at once. */}
                {isOn && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-tnt-amber text-black"
                  >
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m2.5 6.5 2.5 2.5 4.5-5" />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * One link column inside a mega panel.
 *
 * The visible "BLCK. NN / HEADING" label was removed 2026-07-29. The grouping
 * moves to `aria-label` on the list rather than disappearing outright — a
 * screen reader still hears "Capabilities" and "Industries" as separate lists,
 * which is the only thing the heading was carrying that wasn't decorative.
 */
/** Panel type was sized up one step on 2026-08-04 (label 14→16px, mono
 *  index/meta 11→12px, icons 16→20px, row padding 2.5→3). This component backs
 *  EVERY group's panel, not just Services, so the step applies across all four
 *  — a bigger Services panel next to a smaller Equipment one would read as a
 *  mistake rather than emphasis. */
function PanelColumn({ col }: { col: NavColumn }) {
  return (
    <div>
      <ul aria-label={col.heading}>
        {col.items.map((item) => (
          <li key={item.label + item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-white/5"
            >
              {item.index && (
                <span className="font-mono text-[12px] tabular-nums transition-colors group-hover:text-tnt-amber text-white/30">
                  {item.index}
                </span>
              )}
              {item.icon && (
                <Icon
                  name={item.icon}
                  className="h-5 w-5 shrink-0 transition-colors group-hover:text-tnt-amber text-white/40"
                  strokeWidth={1.6}
                />
              )}
              {/* `whitespace-nowrap` is the guarantee, the widths above are
                  the room: a label reads as one line or not at all, so a
                  future item longer than the column overflows visibly here
                  rather than silently reflowing to two lines. */}
              <span className="font-body text-base font-semibold whitespace-nowrap transition-colors text-white/80 group-hover:text-white">
                {item.label}
              </span>
              {item.meta && (
                <span className="ml-auto font-mono text-[12px] whitespace-nowrap tabular-nums text-white/40">
                  {item.meta}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
