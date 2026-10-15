/**
 * CRANE TYPE GRID — the six common crane classes as photo cards. Shared by
 * /services' Crane Rental preview (section 05) and the Crane Rental focus
 * view, so the two can't drift. Server component; data in servicesPageData.
 *
 * `tone`: "dark" for /services' black band, "light" for the Crane Rental
 * page's grey band (2026-10-13, on request — that section is light now).
 * Only the card chrome and text change; photos and tags are the same.
 *
 * TNT Dark (2026-10-15): both Services pages use "dark" here (the crane page's
 * band is tnt-slate, not grey). The dark title is set explicitly rather than
 * inherited, since not every dark band sets text-white.
 */

import Image from "next/image";
import { Icon } from "@/components/site/primitives";
import { CRANE_TYPES } from "./servicesPageData";

const TONE = {
  dark: {
    card: "border-white/12 bg-white/[0.04]",
    title: "text-white",
    body: "text-white/65",
    pending: "text-white/45",
    well: "bg-[linear-gradient(135deg,#1a1a1a_0%,#000_100%)]",
  },
  light: {
    card: "border-black/10 bg-white",
    title: "text-black",
    body: "text-black/60",
    pending: "text-black/40",
    well: "bg-black/[0.05]",
  },
} as const;

export default function CraneTypeGrid({
  className = "mt-12",
  tone = "dark",
}: {
  className?: string;
  tone?: keyof typeof TONE;
}) {
  const t0 = TONE[tone];
  return (
      <ul className={`${className} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
        {CRANE_TYPES.map((t) => (
          <li key={t.name}>
            <a
              href={t.link.href}
              className={`group flex h-full flex-col overflow-hidden rounded-xl border ${t0.card} transition-colors duration-300 hover:border-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none`}
            >
              <div className={`relative aspect-[16/10] overflow-hidden ${t0.well}`}>
                {t.photo && !t.photo.stock && (
                  <Image
                    src={t.photo.src}
                    alt={t.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                )}
                {t.photo?.stock && (
                  // Remote stock (not in next.config remotePatterns), same
                  // treatment as EquipmentGuide.tsx.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.photo.src}
                    alt={t.photo.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                )}
                {!t.photo && (
                  <span className={`absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.16em] ${t0.pending} uppercase`}>
                    Photo pending
                  </span>
                )}
                {t.photo?.stock && (
                  <span className="absolute right-3 bottom-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] tracking-wider text-white/70 uppercase">
                    Stock photo
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className={`font-display text-2xl tracking-wide uppercase ${t0.title}`}>{t.name}</h3>
                <p className={`mt-2 flex-1 font-body text-[14px] leading-relaxed ${t0.body}`}>{t.application}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-tnt-amber">
                  {t.link.label}
                  <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
  );
}
