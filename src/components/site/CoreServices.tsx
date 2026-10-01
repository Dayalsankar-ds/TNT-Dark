"use client";

/**
 * SECTION 5 — FULL-SCOPE CAPABILITY  (project lifecycle)
 *
 * REVERTED TO THE ICON-CARD DESIGN (2026-09-23, on request — a reference
 * screenshot: "FULL-SCOPE CAPABILITY" eyebrow, "ONE PARTNER, END TO END"
 * heading, 6 plain icon cards in a 3×2 grid, solid-amber closing CTA panel).
 * This replaces the "REAL SOLUTIONS FOR A HEAVIER TOMORROW" photo-card
 * redesign from 2026-09-22 (5 cards, real TNT photos, header tag list,
 * skewed CTA banner) — that version is still in git history
 * (`git show d44e684^:src/components/site/CoreServices.tsx` for the
 * pre-photo icon-card version this restores, or `git show
 * 9e69379^:src/components/site/CoreServices.tsx` for the photo-card
 * version this replaces) if either is ever wanted back instead.
 *
 * "ONE PARTNER, END TO END" is a genuine restoration, not just a copy of
 * the last icon-card version: that heading (with its own <RevealText>
 * animation) was removed entirely on 2026-09-11, before the photo-card
 * redesign ever happened. The reference screenshot shows it present, so
 * it's back here as a plain heading (no RevealText — that component's
 * animation was tied to copy this rewrite doesn't reintroduce elsewhere).
 *
 * SIX SERVICES, NOT FIVE: the 2026-09-22 redesign had dropped Wind Energy
 * after confirming against tntcrane.com that TNT's real, current service
 * list is five (Crane Rental, Specialized Rigging, Machinery Moving,
 * Industrial Storage, Engineering) — Wind Energy isn't one of them. The
 * reference screenshot for THIS restoration shows Wind Energy as card 06,
 * so it's back here on request; navigation.ts's Services panel was updated
 * to match (see that file's own note). Flagging the tension rather than
 * quietly resolving it: this section and the nav now show a service that
 * tntcrane.com's own site doesn't list.
 *
 * CRANE RENTAL KEEPS ITS DEDICATED PAGE: unlike the rest of this restored
 * design, Crane Rental's card still links to `/crane-rental` (added
 * 2026-09-18, its own real sub-page) via next/link's <Link>, not a plain
 * <a> — a plain <a> was measured forcing a full page reload instead of
 * Next's client-side route swap (see that page's own docblock). Every
 * other card still uses the shared `?service=...#quote` stretched-link
 * pattern, since none of them have a dedicated page.
 *
 * The lifecycle — LIFT → PLAN → RIG → MOVE → STORE → RENEWABLE — is carried
 * by the STAGE labels and the numbering, not by a drawn spine. Stage
 * numbering is JOURNEY order, and navigation.ts's Services panel matches —
 * the panel and this section are one numbering system or neither means
 * anything.
 *
 * THE GRID REINSTATES THE ANCHOR COLLISION a chained layout would avoid.
 * Three cards share a row, so /services#crane-rental and
 * /services#specialized-rigging resolve to the same scroll position.
 * <TargetHighlight> is what keeps the click legible — it outlines the
 * requested card even when the page cannot move. Do not remove it while
 * this layout stands.
 *
 * NO SHADOWS anywhere in this section, by request: depth is a hairline
 * border that goes gold, a 4%-opacity gold wash, and a 2px lift.
 *
 * Palette: black / white / gold. NOT navy — the brand book has no navy, and
 * the retired #071034 was removed site-wide on 2026-07-28.
 *
 * DARK ONLY (2026-10-01): the site-wide Light/Dark toggle was removed on
 * request, so this always renders the dark treatment — bg-black/text-white,
 * white/N utilities, amber-fill/black-glyph hover.
 */

import Image from "next/image";
import Link from "next/link";
import { Eyebrow, Icon, type IconName } from "./primitives";
import Button from "./Button";
import { slugify } from "./navigation";
import TargetHighlight from "./TargetHighlight";

type Stage = {
  /** Journey position. Mirrors navigation.ts. */
  index: string;
  /** The verb — what this step DOES. Carries the sequence. */
  stage: string;
  /** The service name — what it's called and sold as. */
  title: string;
  blurb: string;
  icon: IconName;
  /** Dedicated page, when one exists — see the docblock. Every stage
   *  without one falls back to the shared `?service=...#quote` link. */
  href?: string;
};

const STAGE_ICONS: Record<string, string> = {
  "Specialized Rigging": "/icons/hook.svg",
  "Machinery Moving": "/icons/forklift.svg",
  "Industrial Storage": "/icons/cart.svg",
  "Wind Energy": "/icons/tower-crane.svg",
  // Crane Rental and "Lift Planning & Engineering" have no dedicated icon
  // asset — both fall through to the /icons/crane.svg default below, which
  // (for Crane Rental at least) is the right icon anyway.
};

const STAGES: Stage[] = [
  { index: "01", stage: "Lift", title: "Crane Rental", blurb: "Operated or bare rental — by the day, month, or project, from 8 to 1,300 tons. TNT's core service and the fleet every other capability on this page supports.", icon: "rental", href: "/crane-rental" },
  { index: "02", stage: "Plan", title: "Lift Planning & Engineering", blurb: "Stamped lift plans, ground-bearing analysis, and crane selection — signed by in-house engineers before a single machine mobilizes.", icon: "engineering" },
  { index: "03", stage: "Rig", title: "Specialized Rigging", blurb: "Hydraulic gantries, jack-and-slide, and precision skidding where a crane can't reach.", icon: "rigging" },
  { index: "04", stage: "Move", title: "Machinery Moving", blurb: "SPMTs and skates for turnkey plant relocation — set, aligned, and levelled in place.", icon: "heavylift" },
  { index: "05", stage: "Store", title: "Industrial Storage", blurb: "Secure indoor and outdoor yards with crane access between phases of work.", icon: "storage" },
  { index: "06", stage: "Renewable", title: "Wind Energy", blurb: "Turbine erection, blade and component exchange across the wind corridor.", icon: "wind" },
];

export default function CoreServices() {

  return (
    <section
      id="services"
      className={`scroll-mt-32 ${"bg-black text-white"}`}
    >
      {/* Marks the stage the nav's deep link asked for. Now that each stage is
          its own row the scroll also lands correctly, but the highlight still
          answers "which one did I click?" on arrival. */}
      <TargetHighlight selector=".svc-tile" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* ── Section header ───────────────────────────────────────────── */}
        <div className="max-w-3xl">
          <Eyebrow>Full-Scope Capability</Eyebrow>
          <h2
            className={`mt-3 font-display text-4xl leading-[0.95] tracking-tight uppercase sm:text-5xl ${"text-white"}`}
          >
            One Partner, End to End
          </h2>
        </div>

        {/* ── Stages 01–06 — the grid ──────────────────────────────────── */}
        {/* Still an <ol>: the six read 01→06 across rows, so the order is real
            and assistive tech should hear "1 of 6" rather than a pile of cards.
            The lifecycle lives in the STAGE labels and numbering rather than
            in a drawn spine or a featured lead card — a 3-across grid has no
            single path to trace, and no card is bigger than another.
            Equal heights come from the grid + `h-full` + column flex, not from
            trimming the copy. */}
        <ol className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s) => (
            <li
              key={s.index}
              id={slugify(s.title)}
              className="svc-tile group relative scroll-mt-32"
            >
              {/* No shadow at any state. Depth comes from the hairline border
                  going gold, a barely-there gold wash, and a 2px lift — enough
                  to register as interactive without a drop shadow. */}
              <article
                className={`relative flex h-full flex-col rounded-xl border p-5 transition-[translate,border-color,background-color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-tnt-amber group-hover:bg-tnt-amber/[0.06] focus-within:border-tnt-amber sm:p-6 ${
                  "border-white/12 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Icon well */}
                  <span
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tnt-amber/10 text-tnt-amber transition-colors duration-300 ${
                      "group-hover:bg-tnt-amber group-hover:text-black"
                    }`}
                  >
                    <Image
                      src={STAGE_ICONS[s.title] ?? "/icons/crane.svg"}
                      alt=""
                      width={24}
                      height={24}
                      unoptimized
                      className={`h-6 w-6 object-contain transition-[filter] duration-300 [filter:brightness(0)_saturate(100%)_invert(63%)_sepia(65%)_saturate(721%)_hue-rotate(352deg)_brightness(97%)_contrast(101%)] ${
                        "group-hover:[filter:brightness(0)_saturate(100%)]"
                      }`}
                    />
                  </span>
                  <span className="flex items-center gap-2 pt-1">
                    <span
                      className={`font-mono text-[11px] tabular-nums transition-colors duration-300 group-hover:text-tnt-amber ${
                        "text-white/30"
                      }`}
                    >
                      {s.index}
                    </span>
                    <span className="font-body text-[10px] font-bold tracking-[0.2em] text-tnt-amber uppercase">
                      {s.stage}
                    </span>
                  </span>
                </div>

                <h3
                  className={`mt-5 font-display text-xl tracking-wide uppercase ${"text-white"}`}
                >
                  {s.title}
                </h3>
                {/* flex-1 pushes the CTA to a common baseline across the row,
                    so blurbs of different lengths still align. */}
                <p
                  className={`mt-2 flex-1 font-body text-[13px] leading-relaxed ${"text-white/60"}`}
                >
                  {s.blurb}
                </p>

                {/* Hairline separator instead of a shadow to divide the card's
                    body from its action. */}
                <span
                  aria-hidden="true"
                  className={`mt-5 block h-px w-full transition-colors duration-300 group-hover:bg-tnt-amber/40 ${
                    "bg-white/10"
                  }`}
                />

                {/* Learn more — the whole card is the hit area via the stretched
                    link, so this is the affordance, not the target. */}
                <span
                  className={`mt-4 flex items-center gap-2 font-body text-sm font-semibold transition-colors duration-300 group-hover:text-tnt-amber ${
                    "text-white"
                  }`}
                >
                  Learn more
                  <Icon
                    name="arrow"
                    className="h-4 w-4 text-tnt-amber transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>

                {/* Stretched link: one focusable element per card, full-card hit
                    area, and a real focus ring — a div with onClick would give
                    none of those.
                    Crane Rental is the one exception: `s.href` points at its
                    own dedicated page (/crane-rental) instead of the shared
                    quote-form anchor every other stage still uses. <Link>,
                    not a plain <a> — a plain <a> forced a full page reload
                    instead of Next's client-side route swap (measured via
                    `performance.getEntriesByType("navigation")[0].type`). */}
                <Link
                  href={s.href ?? `?service=${slugify(s.title)}#quote`}
                  className="absolute inset-0 rounded-xl focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className="sr-only">
                    {s.title} — stage {s.index}, {s.stage}. Learn more.
                  </span>
                </Link>
              </article>
            </li>
          ))}
        </ol>

        {/* ── Closing CTA ──────────────────────────────────────────────── */}
        {/* Solid amber fill — the site's standard bg-tnt-amber + text-black
            pairing (same convention as the nav CTA, active chips, etc.).
            Buttons drop `onDark` since the fill itself is light — primary/
            secondary "light" skins (black fill / black outline) are what
            read on amber.
            SINGLE CTA (2026-09-30, on request — "remove that talk to
            engineer from the strip banner"): "Talk to an engineer" (the
            secondary #contact button) removed; "Request a quote" is now the
            panel's only action. */}
        <div className="mt-12 overflow-hidden rounded-2xl bg-tnt-amber sm:mt-14">
          <div className="flex flex-col gap-7 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <div>
              <p className="font-display text-2xl leading-tight tracking-wide text-black uppercase sm:text-3xl lg:text-4xl">
                One partner.
                <br />
                From lift planning to final set.
              </p>
              <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-black/70 sm:text-base">
                Tell us the load, the site, and the window. We&rsquo;ll scope the
                rest.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Button href="#quote" variant="primary">
                Request a quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
