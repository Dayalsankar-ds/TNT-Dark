"use client";

/**
 * CAPABILITY EXPLORER — a large featured image beside a selectable list of
 * the six services (WAI-ARIA tabs, vertical: Up/Down/Home/End). Selecting a
 * service swaps the image and description. Not the homepage's six-card
 * grid: one big image, one decision at a time.
 *
 * Photos are real TNT/RMS photography only (provenance: photos.ts).
 * Industrial Storage has none, so it gets a typographic panel instead of a
 * stand-in. All six photos are rendered and only the active one is shown
 * (opacity), so switching never waits on a download; only the first loads
 * eagerly. Phones: the list comes first and the description sits below the
 * image instead of over it (a 16:10 image at 375px is too short for it).
 *
 * DARK THEME (TNT Dark, 2026-10-15): sits on the page's tnt-slate band, so
 * Industrial Storage's typographic panel is tnt-graphite (slate would read
 * as a hole in the black panel), the list is white-alpha, and the selected
 * icon chip is gold-on-black inverted to black-on-gold.
 */

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { Icon, type IconName } from "@/components/site/primitives";
import { CAPABILITIES } from "./aboutData";
import { SERVICES } from "@/components/site/services";

const ICONS: Record<string, IconName> = Object.fromEntries(SERVICES.map((s) => [s.id, s.icon]));

export default function CapabilityExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = CAPABILITIES.length - 1;
  const cap = CAPABILITIES[active];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
      {/* Featured image + the active service's detail */}
      <div
        id="capability-panel"
        role="tabpanel"
        aria-labelledby={`capability-tab-${cap.id}`}
        className="relative order-2 overflow-hidden rounded-xl bg-black lg:order-1"
      >
        <div className="relative aspect-[16/10]">
          {CAPABILITIES.map((c, i) =>
            c.photo ? (
              <Image
                key={c.id}
                src={c.photo.src}
                alt={i === active ? c.photo.alt : ""}
                aria-hidden={i === active ? undefined : true}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                priority={i === 0}
                className={`object-cover motion-safe:transition-opacity motion-safe:duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
              />
            ) : (
              <div
                key={c.id}
                aria-hidden={i === active ? undefined : true}
                className={`absolute inset-0 flex items-center justify-center bg-tnt-graphite motion-safe:transition-opacity motion-safe:duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
              >
                <Icon name={ICONS[c.id]} className="h-24 w-24 text-tnt-amber" strokeWidth={1.2} />
              </div>
            ),
          )}
          <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-t from-black/85 via-black/20 to-transparent lg:block" />
        </div>
        <div
          key={cap.id}
          className="p-6 sm:p-8 lg:absolute lg:inset-x-0 lg:bottom-0 motion-safe:animate-[about-fade-up_400ms_cubic-bezier(0.22,1,0.36,1)]"
        >
          <h3 className="font-display text-3xl tracking-wide text-white uppercase sm:text-4xl">{cap.title}</h3>
          <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-white/80 sm:text-lg">{cap.body}</p>
        </div>
      </div>

      {/* The list */}
      <div
        role="tablist"
        aria-label="TNT capabilities"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="order-1 flex flex-col border-t border-white/10 lg:order-2"
      >
        {CAPABILITIES.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`capability-tab-${c.id}`}
              aria-selected={selected}
              aria-controls="capability-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`group flex items-center gap-4 border-b border-white/10 py-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none focus-visible:ring-inset ${
                selected ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              <span className="w-8 font-body text-xs font-bold tracking-[0.14em] text-white/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  selected ? "bg-tnt-amber text-black" : "bg-white/10 text-white/60 group-hover:text-white"
                }`}
              >
                <Icon name={ICONS[c.id]} className="h-5 w-5" />
              </span>
              <span className="flex-1 font-display text-xl tracking-wide uppercase sm:text-2xl">{c.title}</span>
              <span
                aria-hidden="true"
                className={`h-0.5 bg-tnt-amber transition-all ${selected ? "w-8" : "w-0"}`}
              />
            </button>
          );
        })}
        <p className="mt-5 font-body text-sm text-white/55">
          Availability varies by branch and region. Ask your nearest branch what it can deliver locally.
        </p>
      </div>
    </div>
  );
}
