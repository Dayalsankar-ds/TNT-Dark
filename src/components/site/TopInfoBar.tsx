/**
 * TOP INFO BAR — the utility strip above the main nav.
 *
 * Lives INSIDE <SiteNav>'s fixed header rather than beside it, so the two move
 * as one piece of chrome: the homepage's hide-over-the-hero behaviour applies
 * to both, and the cinematic hero stays full-bleed.
 *
 * Deep navy against the nav's slate glass — the darkest tone in the system sits
 * furthest up, so the chrome reads as two deliberate tiers rather than one
 * thick bar. Amber is used only on the icons, keeping to the accent-as-
 * punctuation rule.
 *
 * Hidden below `lg`: on small screens the nav already collapses to a menu
 * button and this content belongs in the footer, not stacked above it. Sticky
 * offsets that clear the chrome (see StickyStack) only engage at `lg` too, so
 * the two breakpoints agree.
 */

import { Icon } from "./primitives";

const SOCIALS = [
  // TODO: swap in TNT's real profile URLs — these are placeholders.
  { name: "Facebook", icon: "facebook", href: "#" },
  { name: "LinkedIn", icon: "linkedin", href: "#" },
  { name: "YouTube", icon: "youtube", href: "#" },
  { name: "Instagram", icon: "instagram", href: "#" },
] as const;

export default function TopInfoBar() {
  return (
    <div className="hidden border-b border-white/10 bg-tnt-navy lg:block">
      {/* h-10 = 40px; pairs with the nav's h-20 to make CHROME_H = 120. */}
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Where we are + how to reach us */}
        <div className="flex items-center gap-7">
          <span className="flex items-center gap-2 font-mono text-[12px] tracking-wide text-white/70">
            <Icon name="pin" className="h-4 w-4 shrink-0 text-tnt-amber" />
            Houston, TX
          </span>
          <a
            href="mailto:info@tntcrane.com"
            className="flex items-center gap-2 font-mono text-[12px] tracking-wide text-white/70 transition-colors hover:text-tnt-amber"
          >
            <Icon name="mail" className="h-4 w-4 shrink-0 text-tnt-amber" />
            info@tntcrane.com
          </a>
          {/* Phone, `lg`-only — the inverse of the nav rail's `xl:block`
              number (2026-09-10). The eight-item bar has no room for it at
              `lg`, so it lands here in that band and hides again at `xl`
              where the rail takes it back. Exactly one is ever visible. */}
          <a
            href="tel:+18007992505"
            className="flex items-center gap-2 font-mono text-[12px] tracking-wide text-white/70 transition-colors hover:text-tnt-amber xl:hidden"
          >
            <Icon name="payment" className="h-4 w-4 shrink-0 text-tnt-amber" />
            1-800-799-2505
          </a>
        </div>

        {/* Social */}
        <ul className="flex items-center gap-1">
          {SOCIALS.map((s) => (
            <li key={s.name}>
              <a
                href={s.href}
                aria-label={s.name}
                className="flex h-8 w-8 items-center justify-center rounded text-white/60 transition-colors hover:text-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
              >
                <Icon name={s.icon} className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
