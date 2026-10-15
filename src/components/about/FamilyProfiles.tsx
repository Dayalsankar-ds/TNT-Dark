"use client";

/**
 * FAMILY PROFILES — the regional identities as a logo selector + detail
 * panel (WAI-ARIA tabs, automatic activation; arrows / Home / End). Works the
 * same at every width: the logo row wraps into a grid on phones and the
 * panel sits underneath, so every company's details stay reachable without
 * hover.
 *
 * Deliberately not the homepage FamilyOfCompanies 2×2 grid: this is the
 * deeper read — relationship to TNT, base, branch cities, and what each
 * company's own site says it offers. Data and sources: aboutData.ts.
 *
 * DARK THEME (TNT Dark, 2026-10-15): the logo selector stays a LIGHT shelf
 * (white / off-white tiles), exactly as on TNT Light — the brand lockups are
 * drawn for a light ground and RMS Cranes' wordmark is plain black artwork
 * with no white version in the brand files, the same reason the homepage's
 * FamilyOfCompanies keeps its company grid light. Only its outer border
 * changes. The detail panel below is dark: black card, white-alpha text.
 */

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { COMPANIES } from "./aboutData";

export default function FamilyProfiles() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = COMPANIES.length - 1;
  const c = COMPANIES[active];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Regional companies in the TNT family"
        onKeyDown={onKeyDown}
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-[#dcdbd6] sm:grid-cols-3 lg:grid-cols-5"
      >
        {COMPANIES.map((co, i) => {
          const selected = i === active;
          return (
            <button
              key={co.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`company-tab-${co.id}`}
              aria-selected={selected}
              aria-controls="company-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`relative flex min-h-28 flex-col items-center justify-center gap-2 px-4 py-5 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none focus-visible:ring-inset ${
                selected ? "bg-white" : "bg-[#f5f4f0] hover:bg-white"
              }`}
            >
              <Image
                src={co.logo}
                alt={co.name}
                width={180}
                height={56}
                className={`h-11 w-auto max-w-full object-contain transition-opacity ${selected ? "" : "opacity-60 grayscale"}`}
              />
              {co.logoTag && (
                <span className="font-body text-[11px] font-bold tracking-[0.18em] text-black/60 uppercase">{co.logoTag}</span>
              )}
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-0 h-1 bg-tnt-amber transition-transform ${selected ? "scale-x-100" : "scale-x-0"}`}
              />
            </button>
          );
        })}
      </div>

      <div
        id="company-panel"
        role="tabpanel"
        aria-labelledby={`company-tab-${c.id}`}
        tabIndex={0}
        className="mt-8 grid gap-10 rounded-xl border border-white/10 bg-black p-6 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16"
      >
        <div key={c.id} className="motion-safe:animate-[about-fade-up_400ms_cubic-bezier(0.22,1,0.36,1)]">
          <p className="font-body text-xs font-bold tracking-[0.18em] text-tnt-amber uppercase">{c.relationship}</p>
          <h3 className="mt-3 font-display text-4xl tracking-wide text-white uppercase sm:text-5xl">{c.name}</h3>
          <dl className="mt-6 grid grid-cols-2 gap-6 border-y border-white/10 py-5">
            <div>
              <dt className="font-body text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Region</dt>
              <dd className="mt-1 font-body text-base font-semibold text-white">{c.region}</dd>
            </div>
            <div>
              <dt className="font-body text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Based in</dt>
              <dd className="mt-1 font-body text-base font-semibold text-white">{c.base}</dd>
            </div>
          </dl>
          <p className="mt-6 font-body text-lg leading-relaxed text-white/70">{c.story}</p>
          <a
            href={c.website.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-white underline decoration-tnt-amber decoration-2 underline-offset-4 hover:decoration-white focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
          >
            Visit {c.website.label}
            <span aria-hidden="true">↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        <div key={`${c.id}-lists`} className="space-y-8 motion-safe:animate-[about-fade-up_400ms_cubic-bezier(0.22,1,0.36,1)]">
          <div>
            <h4 className="font-body text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">
              Branches ({c.locations.length})
            </h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {c.locations.map((l) => (
                <li key={l} className="rounded-full border border-white/15 px-3 py-1 font-body text-sm text-white/80">
                  {l}
                </li>
              ))}
            </ul>
          </div>
          {c.offers.length > 0 && (
            <div>
              <h4 className="font-body text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">
                Named on their site
              </h4>
              <ul className="mt-3 space-y-2">
                {c.offers.map((o) => (
                  <li key={o} className="flex items-center gap-3 font-body text-base text-white">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-tnt-amber" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
