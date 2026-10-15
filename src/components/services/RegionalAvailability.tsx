"use client";

/**
 * REGIONAL SERVICE AVAILABILITY — /services section 07.
 *
 * Pick an operating company (each is a region), see all six services with
 * their status from services.ts: offered directly, through the network, or
 * "contact us to confirm". A list, not a second map — the homepage branch
 * map already exists and is linked from here rather than rebuilt.
 *
 * WAI-ARIA tabs (horizontal: Left/Right/Home/End, automatic activation), the
 * same pattern as /contact's form tabs. The company list scrolls sideways on
 * phones instead of wrapping into a tall block of buttons.
 *
 * Unconfirmed is shown as unconfirmed, with the fallback line — never as
 * "not offered". A company with nothing confirmed (TNT Canada today) says
 * so at the top of its panel.
 *
 * DARK THEME (TNT Dark, 2026-10-15 — colour only): sits on a black band;
 * selected tab is gold, the others white-alpha with a gold hover; the panel
 * is tnt-slate with white/10 dividers; badges use the dark tone.
 */

import { useRef, useState, type KeyboardEvent } from "react";
import StatusBadge from "./AvailabilityBadge";
import Button from "@/components/site/Button";
import {
  COMPANIES,
  CONFIRM_FALLBACK,
  SERVICES,
  availability,
  confirmedServices,
} from "@/components/site/services";

export default function RegionalAvailability() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const company = COMPANIES[active];
  const confirmed = confirmedServices(company.id);
  const last = COMPANIES.length - 1;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Operating company and region"
        onKeyDown={onKeyDown}
        className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6"
      >
        {COMPANIES.map((c, i) => {
          const on = i === active;
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`availability-tab-${c.id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="availability-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={`min-w-44 shrink-0 snap-start sm:min-w-0 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none ${
                on
                  ? "border-tnt-amber bg-tnt-amber text-black"
                  : "border-white/12 bg-white/[0.04] text-white hover:border-tnt-amber"
              }`}
            >
              <span className="block font-display text-base tracking-wide uppercase">{c.short}</span>
              <span className={`mt-0.5 block font-body text-xs ${on ? "text-black/70" : "text-white/55"}`}>
                {c.territory}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="availability-panel"
        role="tabpanel"
        aria-labelledby={`availability-tab-${company.id}`}
        className="mt-6 rounded-xl border border-white/10 bg-tnt-slate"
      >
        <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <p className="font-body text-xs font-semibold tracking-[0.16em] text-white/55 uppercase">
              {company.country === "CA" ? "Canada" : "United States"} · {company.territory}
            </p>
            <h3 className="mt-2 font-display text-3xl tracking-wide text-white uppercase">{company.name}</h3>
            {confirmed.length === 0 && (
              <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-white/65">
                Service details for this company haven&rsquo;t been confirmed yet. {CONFIRM_FALLBACK}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact#regional-contacts" variant="secondary" onDark>
              Contact {company.short}
            </Button>
          </div>
        </div>

        <ul className="divide-y divide-white/10">
          {SERVICES.map((s) => {
            const cell = availability(company.id, s.id);
            return (
              <li
                key={s.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div className="min-w-0">
                  <a
                    href={s.page ?? `#${s.id}`}
                    className="font-body text-base font-semibold text-white underline-offset-4 hover:text-tnt-amber hover:underline focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
                  >
                    {s.label}
                  </a>
                  {cell.note && <p className="mt-0.5 font-body text-[13px] text-white/60">{cell.note}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={cell.status} tone="dark" />
                  {cell.status !== "not_offered" && (
                    <a
                      href={`/contact?service=${s.id}#contact-form`}
                      className="font-body text-[13px] font-semibold whitespace-nowrap text-tnt-amber hover:text-white focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
                    >
                      {cell.status === "unconfirmed" ? "Ask us" : "Request a quote"}
                      <span className="sr-only"> for {s.label}</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Legend — the statuses mean something specific; say what. */}
      <dl className="mt-6 grid gap-4 font-body text-[13px] text-white/60 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <dt><StatusBadge status="direct" tone="dark" /></dt>
          <dd>Listed on the company&rsquo;s own services.</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt><StatusBadge status="network" tone="dark" /></dt>
          <dd>Sourced through another TNT company.</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt><StatusBadge status="unconfirmed" tone="dark" /></dt>
          <dd>Not yet confirmed. It may still be available, so ask our team.</dd>
        </div>
      </dl>
    </div>
  );
}
