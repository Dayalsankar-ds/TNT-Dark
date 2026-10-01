/**
 * STICKY STACK — the telescoping card-stack scroll animation.
 *
 * Content-agnostic: it renders whatever StackItems it's given. Originally
 * built for equipment classes; since 2026-07-27 its only consumer is
 * CaseStudies (the equipment classes consolidated into EquipmentGuide).
 *
 * A faithful port of Enerblock's SOLUTIONS section (enerblock.net). Mechanism,
 * verified against their live DOM, is pure CSS — no GSAP/ScrollTrigger needed:
 *   - every card is `position: sticky`
 *   - each card's `top` increments by STEP (top = BASE + index·STEP)
 *   - cards are opaque, so as you scroll they telescope into a pile, each one
 *     leaving a STEP-tall "tab" (its number + title) visible above the next.
 *
 * Later cards sit later in the DOM, so they paint over earlier ones — that is
 * what produces the stacking. The header row is exactly STEP tall, so the
 * visible tab of a covered card is precisely its number + title.
 *
 * The cards are sticky at every breakpoint so the stack behaves the same on
 * mobile and desktop, with the pinned top offset clearing the fixed chrome.
 *
 * The per-card image carries a CursorReadout LOAD/RADIUS spec chip — the crane
 * data for that card, whether it's a class rating or a job's actual figures.
 */

import type { ReactNode } from "react";
import Image from "next/image";
import CursorReadout from "./CursorReadout";
import Button from "./Button";
import { CHROME_H } from "./chrome";
import { IMG } from "./photos";
import type { BlockPhoto } from "./NumberedBlock";

export type StackItem = {
  index: string;
  title: string;
  figure: string;
  figureLabel: string;
  body: string;
  readout: { load: string; radius: string };
  photo: BlockPhoto;
};

// Tab geometry. BASE clears the fixed chrome (utility strip + nav, see
// CHROME_H) with a little breathing room; STEP is the tab height (= header
// height), so each stacked card reveals exactly its number + title.
// Sticky only engages at `lg`, which is also where the utility strip appears,
// so a single BASE is correct at every breakpoint that stacks.
const BASE = CHROME_H + 20;
const STEP = 80;

/** Scroll distance the last ladder card holds on its own before the finale
 *  starts rising over it. Without it the finale's flow position sits directly
 *  under that card and begins covering it the instant it pins. */
const LADDER_HOLD = 360;

// There is deliberately NO trailing spacer after the finale. One used to hold
// it pinned at `coverTop` for a beat, but a card pinned to the top of the
// viewport is shorter than the viewport, so the hold could only ever be a band
// of empty white below it. Without it the finale simply scrolls on into the
// next section, which is what the ladder cards do too.

export default function StickyStack({
  items,
  cta,
  header,
  top = BASE,
  coverTop,
}: {
  items: StackItem[];
  cta?: { label: string; href: string };
  /** The section's title rail. Taken as a node (the stack stays
   *  content-agnostic) and rendered as a sibling of the cards so it shares
   *  their containing block. For the finale to push it, wrap it in
   *  StackFinaleSync — see CaseStudies. */
  header?: ReactNode;
  /** Y of the first card's pinned position. Defaults to clearing the fixed
   *  chrome; a section that pins its own title above the pile passes the
   *  bottom edge of that title rail instead (see CaseStudies). */
  top?: number;
  /** Opt the FINAL card out of the ladder: it leaves the staircase, rises from
   *  below and pins at this y (typically CHROME_H, flush under the nav),
   *  COVERING the ladder on the way — the tabs hold their pins and are hidden
   *  as they are covered, never displaced. That is why everything shares one
   *  containing block running to the end of the stack: give the ladder a block
   *  that ends where the finale begins and the finale's leading edge drags the
   *  tabs along instead of passing over them.
   *
   *  The hiding, and the title push, are StackFinaleSync's job — the card
   *  itself is laid out exactly like every other one.
   *  Omit to keep the last card on the staircase like the rest. */
  coverTop?: number;
}) {
  const hasFinale = coverTop != null && items.length > 1;
  const ladder = hasFinale ? items.slice(0, -1) : items;
  const finale = hasFinale ? items[items.length - 1] : null;

  return (
    <div className="relative">
      {header}
      {ladder.map((e, i) => (
        <Card key={e.index} e={e} pin={top + i * STEP} cta={cta} />
      ))}

      {/* Dwell for the last ladder card before the finale starts rising over
         it — see LADDER_HOLD. */}
      {hasFinale && (
        <div
          aria-hidden
          className="hidden lg:block"
          style={{ height: `${LADDER_HOLD}px` }}
        />
      )}

      {finale && <Card e={finale} pin={coverTop!} cta={cta} covers />}
    </div>
  );
}

function Card({
  e,
  pin,
  cta,
  covers = false,
}: {
  e: StackItem;
  pin: number;
  cta?: { label: string; href: string };
  /** This is the finale (see `coverTop`). */
  covers?: boolean;
}) {
  return (
        <article
          // StackFinaleSync finds the finale through this to drive the title
          // push and the tab hiding.
          data-stack-finale={covers || undefined}
          style={{ top: `${pin}px` }}
          // These panels are full-bleed bands, not inset cards, so the fill
          // MATCHES THE SECTION — otherwise the page appears to change colour
          // at the section header. The hairline rule and the stacking offset
          // are what separate the panels, not a contrasting surface.
          // Was `bg-tnt-paper` when CaseStudies was a paper section; it is
          // white now (2026-07-30), so this follows. Keep the two in step.
          // Must stay OPAQUE either way or the telescoping pile shows through
          // itself.
          // The finale is an ORDINARY card now — same height, padding and
          // layout as the ladder. It needs no extra height to hide the tabs
          // beneath it, because StackFinaleSync hides each tab the moment this
          // card covers it. Giving the CARD that job instead is what used to
          // leave a band of empty white under its photo. `z-10` only settles
          // paint order against the title rail (z-20) during the push.
          className={`border-t border-black/10 bg-white sticky ${
            covers ? "z-10" : ""
          }`}
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* HEADER TAB — stays visible when this card is covered. Its height
               equals STEP so the tab is exactly this row. */}
            <div
              className="flex items-center gap-4 sm:gap-6"
              style={{ height: `${STEP}px` }}
            >
              <span className="font-display text-2xl leading-none tracking-wide text-tnt-amber sm:text-3xl">
                {e.index}
              </span>
              <span className="font-display text-2xl leading-none tracking-wide text-black uppercase sm:text-3xl">
                {e.title}
              </span>
            </div>

            {/* BODY — image (with LOAD/RADIUS readout) + capacity, copy, CTA.
               Identical on every card, finale included: same 4:3 photo, same
               gaps, same padding. Nothing here is conditional, which is the
               point — the finale differs from the ladder only in where it pins
               and in the fact that it covers, never in how it is laid out. */}
            <div className="grid gap-8 pb-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-20">
              <div>
                <CursorReadout load={e.readout.load} radius={e.readout.radius}>
                  {/* The BOX carries the 4:3 so either image path just fills it.
                     `relative` is what `next/image`'s `fill` anchors to. Same
                     ratio on EVERY card including the finale — that parity is
                     the point. */}
                  <div
                    className="relative aspect-4/3"
                    style={{ backgroundImage: e.photo.gradient }}
                  >
                    {e.photo.src ? (
                      <Image
                        src={e.photo.src}
                        alt={e.photo.alt}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      // Unsplash fallback — still used by TNT-211, which has no
                      // owned photograph yet. Unsplash resizes server-side via
                      // IMG(), so a plain <img> is correct here.
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={IMG(e.photo.id)}
                        alt={e.photo.alt}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                </CursorReadout>
              </div>

              <div className="flex flex-col">
                <span className="font-display text-4xl leading-none tracking-wide text-tnt-navy sm:text-5xl">
                  {e.figure}
                </span>
                <span className="mt-2 font-body text-[11px] font-semibold tracking-[0.16em] text-tnt-meta uppercase">
                  {e.figureLabel}
                </span>
                <p className="mt-5 max-w-md font-body text-base leading-relaxed text-tnt-body sm:text-lg">
                  {e.body}
                </p>
                {/* `self-start`: the copy column is a column flex, which would
                    otherwise stretch the link across its full width — invisible
                    for a link variant, but it inflates the hit area well past
                    the label. */}
                {cta && (
                  <Button
                    href={cta.href}
                    variant="link"
                    className="mt-6 self-start"
                  >
                    {cta.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </article>
  );
}
