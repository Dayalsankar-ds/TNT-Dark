/**
 * FAMILY OF COMPANIES — built 2026-10-04 from a supplied design, replacing
 * FamilyStripV2.tsx (the light logo shelf, now unrendered — see page.tsx).
 *
 * Split layout: a black brand panel on the left (eyebrow, "Different names.
 * One TNT." headline, TNT parent lockup, four stats) and a warm off-white
 * panel on the right holding the four operating companies in a 2×2 grid.
 * The light right panel is deliberate even on this dark-only site — the
 * brand lockups are authored for a light ground (FamilyStripV2 used a light
 * shelf for the same reason), and it's how the design draws it.
 *
 * Carries `id="family"`: Hero.tsx's auto-scroll lands on it, SiteNav.tsx's
 * reveal check watches it, and the nav's "Family of Companies" link
 * (/#family) targets it.
 *
 * Copy (regions, states) is exactly as given in the design; the stats are
 * not — see STATS.
 */

import Button from "./Button";

/** `logoText`: words set beside the logo image, for a company shown as the
 *  TNT lockup plus a name rather than its own mark (TNT Canada). */
const COMPANIES: { name: string; logo: string; logoText?: string; region: string; area: string }[] = [
  {
    name: "Southway Crane & Rigging",
    logo: "/brand/southway.svg",
    region: "Southeastern United States",
    area: "Georgia, Alabama, South Carolina, Florida",
  },
  {
    name: "RMS Cranes",
    logo: "/brand/rms-cranes.svg",
    region: "Rocky Mountain Region",
    area: "Colorado, Wyoming, New Mexico",
  },
  {
    name: "Eagle West Crane & Rigging",
    logo: "/brand/eagle-west.svg",
    region: "British Columbia",
    area: "Western Canada",
  },
  {
    name: "JMS Crane & Rigging",
    logo: "/brand/jms.svg",
    region: "Montana and Idaho",
    area: "Northern Rockies",
  },
  // Added 2026-10-17, on request ("Add that TNT Logo with Canada text"). No
  // TNT Canada mark exists in the brand files, so it's the TNT logo with
  // "Canada" set beside it. Branches per branchLocatorData.ts ("TNT Crane &
  // Rigging Canada": Brooks, Calgary, Edmonton, Fort McMurray, Lethbridge,
  // Medicine Hat — all Alberta).
  {
    name: "TNT Crane & Rigging Canada",
    logo: "/brand/tnt.svg",
    logoText: "Canada",
    region: "Alberta",
    area: "Calgary, Edmonton, Fort McMurray",
  },
];

/** Family-specific figures, all counted from COMPANIES above. The design's
 *  original four (700+ cranes, 45+ locations, 1,750+ employees, ACT 100
 *  No. 15) were replaced 2026-10-04, on request, because About Us
 *  (StorySlideshow.tsx) already shows every one of them. If a company or
 *  region changes above, recount these. */
const STATS: { value: string; label: string }[] = [
  { value: "5", label: "Regional operating companies" },
  { value: "2", label: "Countries, US and Canada" },
  // GA, AL, SC, FL, CO, WY, NM, MT, ID + British Columbia, Alberta
  { value: "11", label: "States and provinces covered" },
  { value: "1", label: "Shared fleet and iCARE safety program" },
];

export default function FamilyOfCompanies() {
  return (
    <section id="family" className="grid bg-[#0b0b0b] lg:grid-cols-[2fr_3fr]">
      {/* Left — brand panel */}
      <div className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 xl:px-20">
        <p className="flex items-center gap-4 font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
          <span aria-hidden="true" className="h-px w-9 bg-tnt-amber" />
          The TNT Family of Companies
        </p>
        <h2 className="mt-8 font-display text-6xl leading-[1.02] text-white uppercase sm:text-7xl">
          Different
          <br />
          names.
          <br />
          One TNT.
        </h2>
        <p className="mt-8 max-w-md font-body text-base leading-relaxed text-white/70 sm:text-lg">
          Regional operating companies with deep local roots, backed by the
          fleet, engineering and iCARE safety program of TNT Crane &amp; Rigging.
        </p>

        <div className="mt-10 flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/tnt.svg" alt="TNT Crane & Rigging" className="h-16 w-auto" />
          <div className="border-l border-white/15 pl-6">
            <p className="font-body text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">
              Parent company
            </p>
            <p className="mt-1 font-body text-base text-white">Houston, Texas</p>
          </div>
        </div>

        <dl className="mt-12 grid max-w-md grid-cols-2 border-t border-white/15">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`py-7 ${i % 2 === 0 ? "border-r border-white/15 pr-6" : "pl-8"} ${
                i < 2 ? "border-b border-white/15" : ""
              }`}
            >
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="font-display text-4xl text-white sm:text-5xl">
                  {s.value}
                </span>
                <span className="mt-2 block font-body text-sm text-white/60">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Right — operating companies */}
      <div className="bg-[#f5f4f0] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 xl:px-20">
        <div className="flex items-center justify-between gap-4 border-b border-black/70 pb-8">
          <p className="font-body text-[13px] font-semibold tracking-[0.18em] text-black uppercase">
            Operating companies
          </p>
          <Button href="/#coverage" variant="primary" className="shrink-0">
            Find your nearest branch
          </Button>
        </div>

        <ul className="grid sm:grid-cols-2">
          {COMPANIES.map((c, i) => {
            // Dividers for any count, not just 2×2: a rule under every cell
            // except the last (stacked) or the last row (two columns), and a
            // vertical rule on a left-column cell only when it has a
            // right-hand neighbour.
            //
            // COMPACT CELLS (2026-10-17, on request — "adjust the spacing
            // between all logos and align inside the screen size"): adding
            // TNT Canada made a third row, and with each cell held to a 22rem
            // minimum the grid grew the section to ~1,320px at 1440×900. The
            // minimum is gone, padding and the logo→caption gap are tighter,
            // and logos are a touch smaller, so the grid fits inside the left
            // panel's height again.
            const n = COMPANIES.length;
            const lastRowStart = n % 2 === 0 ? n - 2 : n - 1;
            const left = i % 2 === 0;
            // A company left alone on the last row (odd count — TNT Canada
            // today) spans both columns and is centred in it, on request
            // 2026-10-17 ("Align it on center"). Phones stack one per row, so
            // it stays left-aligned there like the rest.
            const lone = n % 2 === 1 && i === n - 1;
            return (
            <li
              key={c.name}
              className={`flex flex-col gap-6 py-8 sm:py-10 ${
                lone
                  ? "sm:col-span-2 sm:items-center sm:text-center"
                  : left
                    ? `sm:pr-10 ${i + 1 < n ? "sm:border-r sm:border-black/15" : ""}`
                    : "sm:pl-10"
              } ${i < n - 1 ? "border-b border-black/15" : ""} ${i >= lastRowStart ? "sm:border-b-0" : ""}`}
            >
              {c.logoText ? (
                <div className={`flex items-center gap-3 self-start ${lone ? "sm:self-center" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logo} alt="" className="h-11 w-auto object-contain sm:h-12" />
                  <span className="font-display text-3xl leading-none text-black uppercase sm:text-[2.1rem]">
                    {c.logoText}
                  </span>
                  <span className="sr-only">{c.name}</span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo} alt={c.name} className={`h-11 w-auto max-w-full self-start object-contain sm:h-12 ${lone ? "sm:self-center" : ""}`} />
              )}
              <div className="mt-auto">
                <p className="font-body text-xs font-semibold tracking-[0.16em] text-black/55 uppercase">
                  A TNT Crane &amp; Rigging company
                </p>
                <p className="mt-2 font-body text-lg font-semibold text-black">{c.region}</p>
                <p className="mt-1 font-body text-base text-black/65">{c.area}</p>
              </div>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
