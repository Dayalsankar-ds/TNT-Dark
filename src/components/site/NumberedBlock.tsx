/**
 * NUMBERED BLOCK — the shared rhythm for Sections 2, 5, and 6.
 *
 * One large vertical photo paired 1:1 with a content column. A big amber
 * display number anchors each block (echoing Enerblock's numbering); an
 * optional standalone Deep Navy figure sits beside it (e.g. a capacity range).
 * Thin top rule instead of a card border. Alternates photo side via `flip`.
 * Wrapped in <Reveal> so it fades/slides up on scroll.
 *
 * Pass EITHER `photo` (with a gradient fallback) OR `panel` (e.g. the featured
 * soft-amber treatment) as the visual half — not both.
 */

import type { ReactNode } from "react";
import Reveal from "./Reveal";
import CursorReadout from "./CursorReadout";
import { IMG } from "./photos";

export type BlockPhoto = {
  /** Unsplash ID, resolved through `IMG()`. Ignored when `src` is set. */
  id: string;
  /** Owned photography: a local path under `public/`. Takes precedence over
   *  `id`, and is what routes the image through `next/image` — the raw files
   *  are multi-megabyte and must not ship unoptimised. */
  src?: string;
  alt: string;
  gradient: string;
};

export default function NumberedBlock({
  index,
  title,
  body,
  figure,
  figureLabel,
  photo,
  panel,
  cta,
  readout,
  flip = false,
}: {
  index: string;
  title: string;
  body: string;
  figure?: string; // standalone navy stat, e.g. "80–750 Tons"
  figureLabel?: string;
  photo?: BlockPhoto;
  panel?: ReactNode;
  cta?: { label: string; href: string };
  readout?: { load: string; radius: string }; // enables the cursor readout
  flip?: boolean;
}) {
  const image = photo ? (
    <div style={{ backgroundImage: photo.gradient }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMG(photo.id)}
        alt={photo.alt}
        loading="lazy"
        className="aspect-4/5 w-full object-cover transition-transform duration-700 hover:scale-105 sm:aspect-3/4"
      />
    </div>
  ) : null;
  return (
    <Reveal>
      <div className="border-t border-black/10 pt-10 sm:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Visual half */}
          <div className={flip ? "lg:order-2" : "lg:order-1"}>
            {image ? (
              readout ? (
                <CursorReadout load={readout.load} radius={readout.radius}>
                  {image}
                </CursorReadout>
              ) : (
                <div className="overflow-hidden rounded-lg">{image}</div>
              )
            ) : (
              panel
            )}
          </div>

          {/* Content half */}
          <div className={flip ? "lg:order-1" : "lg:order-2"}>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="font-display text-6xl leading-none tracking-wide text-tnt-amber sm:text-7xl">
                {index}
              </span>
              {figure && (
                <span className="flex flex-col">
                  <span className="font-display text-2xl leading-none tracking-wide text-tnt-navy sm:text-3xl">
                    {figure}
                  </span>
                  {figureLabel && (
                    <span className="mt-1 font-body text-[11px] font-semibold tracking-[0.16em] text-tnt-meta uppercase">
                      {figureLabel}
                    </span>
                  )}
                </span>
              )}
            </div>

            <h3 className="mt-5 font-display text-3xl tracking-wide text-black uppercase sm:text-4xl">
              {title}
            </h3>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-tnt-body sm:text-lg">
              {body}
            </p>

            {cta && (
              <a
                href={cta.href}
                className="mt-6 inline-flex items-center gap-2 font-body text-sm font-bold tracking-wide text-tnt-amber uppercase transition-colors hover:text-tnt-maroon"
              >
                {cta.label}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
