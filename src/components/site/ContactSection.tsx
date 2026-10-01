"use client";

/**
 * CONTACT — the "reach a human" section.
 *
 * Fixes the biggest user gap: no phone/email/contact anywhere. Navy band,
 * primary contact rail + region-aware dispatch numbers (each acquired brand
 * kept its own 1-800). Numbers in mono (CAD motif). The "24/7/365 dispatch"
 * pill that used to sit above the headline was removed 2026-09-15, on
 * request.
 *
 * NOTE: phone numbers are the real per-brand lines from the site audit but
 * should be confirmed against TNT's current routing before launch.
 *
 * LIGHT BY DEFAULT (2026-09-23, on request — caught in light mode still
 * rendering the unconditional navy band): every white/N utility now has a
 * black/N light counterpart, gated by `dark:`/`useColorScheme`, same
 * convention as BranchLocator.tsx and SafetyCulture.tsx. The `.glass`
 * regional-dispatch panel keeps that frosted treatment only in Dark mode —
 * `.glass` is a white-tinted overlay meant to sit on a dark fill, so in
 * Light mode it falls back to the `border-black/12 bg-black/[0.03]` card
 * style used elsewhere.
 */

import { Icon } from "./primitives";
import RevealText from "./RevealText";

const PRIMARY = [
  { icon: "payment", label: "Phone", value: "1-800-799-2505", href: "tel:+18007992505" },
  { icon: "agreement", label: "Email", value: "info@tntcrane.com", href: "mailto:info@tntcrane.com" },
  { icon: "pin", label: "Headquarters", value: "Houston, TX", href: null },
] as const;

const REGIONAL = [
  { brand: "TNT Crane & Rigging", region: "Gulf Coast · National", phone: "1-800-799-2505", href: "tel:+18007992505" },
  { brand: "Southway Crane", region: "Southeast (GA · AL · SC · FL)", phone: "1-800-335-3148", href: "tel:+18003353148" },
  { brand: "RMS Cranes", region: "Rocky Mountain (CO · WY · NM)", phone: "1-800-588-7095", href: "tel:+18005887095" },
  { brand: "Eagle West Cranes", region: "British Columbia", phone: "1-800-667-2215", href: "tel:+18006672215" },
  { brand: "JMS Crane", region: "Montana · Idaho", phone: "(406) 839-5035", href: "tel:+14068395035" },
];

export default function ContactSection() {

  return (
    <section id="contact" className="scroll-mt-32 bg-tnt-navy">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — headline + primary contact. The "24/7/365 dispatch" pill
              that used to sit above the headline was removed 2026-09-15,
              on request. */}
          <div>
            <RevealText
              as="h2"
              barClassName="bg-tnt-amber"
              text="Reach the Nearest Team"
              className="font-display text-4xl tracking-wide uppercase sm:text-5xl text-white"
            />
            <p className="mt-4 max-w-md font-body text-base sm:text-lg text-white/70">
              Cranes move fast — so do we. Call the branch nearest your site, day
              or night, or send us the details and a rep will follow up.
            </p>

            <dl className="mt-10 space-y-5">
              {PRIMARY.map((p) => {
                const inner = (
                  <>
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-tnt-amber bg-white/10">
                      <Icon name={p.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <dt className="font-body text-[11px] font-semibold tracking-[0.16em] uppercase text-white/50">
                        {p.label}
                      </dt>
                      <dd className="mt-0.5 font-mono text-lg text-white">
                        {p.value}
                      </dd>
                    </span>
                  </>
                );
                return p.href ? (
                  <a
                    key={p.label}
                    href={p.href}
                    className="flex items-center gap-4 transition-colors hover:text-tnt-amber"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={p.label} className="flex items-center gap-4">
                    {inner}
                  </div>
                );
              })}
            </dl>
          </div>

          {/* Right — regional dispatch numbers */}
          <div
            className={
              "glass rounded-2xl p-6 sm:p-8"
            }
          >
            <p className="font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
              Regional Dispatch
            </p>
            <ul className="mt-5 divide-y divide-white/10">
              {REGIONAL.map((r) => (
                <li key={r.brand}>
                  <a
                    href={r.href}
                    className="group flex items-center justify-between gap-4 py-4 transition-colors hover:text-tnt-amber"
                  >
                    <span>
                      <span className="block font-display text-lg tracking-wide uppercase group-hover:text-tnt-amber text-white">
                        {r.brand}
                      </span>
                      <span className="mt-0.5 block font-body text-sm text-white/60">
                        {r.region}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-sm text-tnt-amber">
                      {r.phone}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
