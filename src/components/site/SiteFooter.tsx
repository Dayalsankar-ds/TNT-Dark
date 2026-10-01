/**
 * SECTION 10 — FOOTER
 *
 * Organized as numbered blocks — BLCK. 01 Services / BLCK. 02 Company /
 * BLCK. 03 Resources & Legal — echoing the page's numbering system. Dark Slate
 * (#2F3640) background, amber links. TNT Crane & Rigging identity ONLY; no
 * regional brand names or logos (confirmed scope).
 */

import Link from "next/link";
import Button from "./Button";
import Reveal from "./Reveal";

/**
 * Every link here pointed at `#top` — eighteen of them, so the whole footer
 * scrolled you to the top of the page you were already on. They now resolve to
 * the same destinations the nav panels use (see navigation.ts).
 *
 * `href: null` marks the five that have no page to point at yet — the legal and
 * compliance set. They render as plain text rather than as links, because a
 * link that goes nowhere is a worse promise than no link at all. Give them
 * routes and they become links again.
 */
type FooterLink = { label: string; href: string | null };

const BLOCKS: { no: string; heading: string; links: FooterLink[] }[] = [
  {
    no: "01",
    heading: "Services",
    links: [
      { label: "Crane Rental", href: "/#crane-rental" },
      { label: "Specialty Rigging", href: "/#specialized-rigging" },
      { label: "Lift Planning & Engineering", href: "/#lift-planning-engineering" },
      { label: "Wind Energy", href: "/#wind-energy" },
    ],
  },
  {
    no: "02",
    heading: "Company",
    links: [
      { label: "Equipment", href: "/#fleet-guide" },
      { label: "Coverage Map", href: "/#coverage" },
      // `href: null` — the existing convention here for a destination that
      // isn't built. Industries and Careers lost their routes on 2026-08-04 and
      // have no homepage section, so they read as plain labels rather than
      // vanishing from the information architecture entirely.
      { label: "Industries", href: null },
      { label: "Case Studies", href: "/#projects" },
      { label: "Careers", href: null },
    ],
  },
  {
    no: "03",
    heading: "Resources & Legal",
    links: [
      // Same as above: all three pointed at /contact#self-service
      // (ClientSelfService), which the homepage does not render.
      { label: "Rental Agreements", href: null },
      { label: "Credit Application", href: null },
      { label: "Payment Portal", href: null },
      // Now has a real target — SafetyCulture is on the homepage.
      { label: "Safety & Compliance", href: "/#safety" },
      { label: "Privacy Policy", href: null },
    ],
  },
];

const LEGAL: FooterLink[] = [
  { label: "Terms of Service", href: null },
  { label: "Accessibility", href: null },
  { label: "Sitemap", href: null },
];

export default function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-tnt-slate">
      {/* Oversized closing wordmark — one large statement before the link blocks.
         `max-w-7xl`, NOT the 1600px it used to carry: every other container on
         the site (including the link grid directly below) is max-w-7xl, so the
         wider box left this wordmark starting 160px to the LEFT of the tagline
         and the BLCK columns it sits above. The size is untouched — it is the
         box that was out of step, not the type. */}
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <Reveal>
          <p className="font-display leading-[0.85] tracking-tight text-white [font-size:clamp(2.75rem,13vw,12rem)]">
            TNT<span className="text-tnt-amber">·</span>CRANE
            <span className="text-white/25"> &amp; RIGGING</span>
          </p>
        </Reveal>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          {/* Brand tagline block */}
          <div>
            <p className="max-w-xs font-body text-sm leading-relaxed text-tnt-gray">
              Crane rental, specialty rigging, and lift engineering — one fleet,
              one standard, across the US and Canada.
            </p>
            <Button href="/#quote" variant="primary" onDark className="mt-6">
              Get a Quote
            </Button>
          </div>

          {/* Numbered link blocks */}
          {BLOCKS.map((b) => (
            <nav key={b.no} aria-label={b.heading}>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg tracking-wide text-tnt-amber">
                  BLCK. {b.no}
                </span>
              </div>
              <p className="mt-1 font-display text-sm tracking-wide text-white uppercase">
                {b.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {b.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="font-body text-sm text-tnt-gray transition-colors hover:text-tnt-amber"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="font-body text-sm text-tnt-gray/50">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-tnt-gray/70">
            © {new Date().getFullYear()} TNT Crane &amp; Rigging. All rights
            reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((l) => (
              <li key={l.label}>
                {l.href ? (
                  <Link
                    href={l.href}
                    className="font-body text-xs text-tnt-gray transition-colors hover:text-tnt-amber"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <span className="font-body text-xs text-tnt-gray/50">
                    {l.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
