/**
 * REGIONAL CONTACT DIRECTORY — /contact's second section: each operating
 * company's published lines, directly under the form. Deliberately not a
 * second Family of Companies showcase: no logos, no stories, just who to
 * call. Server component; data from regionalContacts.ts.
 *
 * The interactive branch map that used to sit above this was removed
 * 2026-10-08, on request: it duplicated the homepage's "Find Your Nearest
 * Branch" map (same map, same branches), so a link to /#coverage stands
 * in for it instead.
 *
 * DARK THEME (TNT Dark, 2026-10-15): black band, white/N text, amber hovers
 * in place of Light's maroon.
 */

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Eyebrow } from "@/components/site/primitives";
import { REGIONAL_CONTACTS, type RegionalContact } from "@/components/site/regionalContacts";

const COUNTRIES = [
  { id: "US", label: "United States" },
  { id: "CA", label: "Canada" },
] as const;

function Row({ c }: { c: RegionalContact }) {
  return (
    <li className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-6">
      <div>
        <h3 className="font-display text-lg tracking-wide text-white uppercase">{c.brand}</h3>
        <p className="mt-0.5 font-body text-[13px] text-white/65">{c.territory}</p>
        <a
          href={c.website.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-body text-xs text-white/60 underline-offset-2 hover:text-white hover:underline"
        >
          {c.website.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <div className="space-y-1.5">
        {c.phones.map((p) => (
          <a
            key={p.display}
            href={p.href}
            className="flex flex-wrap items-baseline gap-x-2 font-mono text-[15px] font-semibold text-white transition-colors hover:text-tnt-amber"
          >
            <Phone aria-hidden="true" className="h-3.5 w-3.5 translate-y-0.5 text-tnt-amber" />
            {p.display}
            {p.label && <span className="font-body text-xs font-normal text-white/60">{p.label}</span>}
          </a>
        ))}
        {c.email ? (
          <a
            href={`mailto:${c.email}`}
            className="flex items-center gap-2 font-body text-sm break-all text-white/80 transition-colors hover:text-tnt-amber"
          >
            <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-tnt-amber" />
            {c.email}
          </a>
        ) : (
          <p className="flex items-center gap-2 font-body text-sm text-white/60">
            <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-white/30" />
            Email not publicly listed
          </p>
        )}
      </div>
    </li>
  );
}

export default function RegionalDirectory() {
  return (
    <section id="regional-contacts" aria-labelledby="regional-heading" className="scroll-mt-32 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>Regional Contacts</Eyebrow>
          <h2 id="regional-heading" className="mt-3 font-display text-4xl tracking-wide text-white uppercase sm:text-5xl">
            Call your regional team
          </h2>
          <p className="mt-4 font-body text-base text-white/70 sm:text-lg">
            Each operating company keeps its own published lines. Call the team that covers your
            project&rsquo;s region.
          </p>
        </div>
        <Link
          href="/#coverage"
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/15 bg-tnt-slate px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
        >
          <MapPin aria-hidden="true" className="h-4 w-4 text-tnt-amber" />
          See every branch on the map
        </Link>
      </div>
      <div className="mt-10 grid gap-x-12 gap-y-8 lg:grid-cols-2">
        {COUNTRIES.map((country) => (
          <div key={country.id}>
            <p className="border-b border-white/15 pb-3 font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
              {country.label}
            </p>
            <ul className="divide-y divide-white/10">
              {REGIONAL_CONTACTS.filter((c) => c.country === country.id).map((c) => (
                <Row key={c.brand} c={c} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
