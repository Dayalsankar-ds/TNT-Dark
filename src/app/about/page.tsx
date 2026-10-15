import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/site/Button";
import { Eyebrow } from "@/components/site/primitives";
import ScrollButton from "@/components/about/ScrollButton";
import HashScroll from "@/components/about/HashScroll";
import Timeline from "@/components/about/Timeline";
import FamilyProfiles from "@/components/about/FamilyProfiles";
import CapabilityExplorer from "@/components/about/CapabilityExplorer";
import { PARENT } from "@/components/about/aboutData";

/**
 * /about — TNT's story, the family of companies, combined capability, reach
 * and safety. Built 2026-10-08 from the About Us master brief.
 *
 * Server component; only the timeline, company selector, capability list,
 * scroll CTA and hash handling are client islands. Every fact is sourced in
 * src/components/about/aboutData.ts.
 *
 * Section rhythm (no two adjacent sections alike): split hero (black panel
 * + photo) → white story → grey timeline → off-white family → white
 * capabilities → off-white reach → grey safety → gold close.
 *
 * DARK THEME (TNT Dark, 2026-10-15 — ported from TNT Light's finished page;
 * content, structure and interactions unchanged, colour only): black hero →
 * tnt-slate story → black timeline → tnt-graphite family → tnt-slate
 * capabilities → black reach → tnt-graphite safety → gold close (unchanged).
 * Headings are plain <h2>s rather than primitives' `Heading`, which
 * hard-codes text-black. Buttons on dark bands use Button's `onDark` (gold);
 * the gold close keeps the light-background variants. Each photo fade is
 * passed the RGB of the band it sits on (see easedFade). "Explore Our
 * Services" goes to /services (ported 2026-10-15 alongside that page).
 *
 * Other outbound links target homepage sections (/#coverage, /#safety,
 * /#quote) — there are no separate pages for those yet. Hero.tsx
 * skips its autoplay when the homepage is opened with a #hash, so these land
 * where they say.
 *
 * HERO IMAGE: /photos/about/about-hero-crawler-sunset.webp is 02.png from
 * the supplied TNT/Image folder (chosen on request). By inspection it's a
 * rendered still from the hero-video storyboard, not a photograph of a real
 * job — so its alt text describes the scene without claiming a project.
 */

export const metadata: Metadata = {
  title: "About Us — TNT Crane & Rigging",
  description:
    "Since 1985, TNT Crane & Rigging has grown from Houston into a North American crane and rigging family: Southway, RMS Cranes, Eagle West, JMS and TNT Canada.",
};

const STATS = [
  { value: "45+", label: "Locations" },
  { value: "700+", label: "Cranes" },
  { value: "1,750+", label: "Employees" },
  { value: "2", label: "Countries" },
];

const FOOTPRINT: { country: string; rows: { company: string; areas: string[] }[] }[] = [
  {
    country: "United States",
    rows: [
      { company: "TNT Crane & Rigging", areas: ["TX", "LA", "OK"] },
      { company: "Southway Crane & Rigging", areas: ["GA", "AL", "SC", "FL"] },
      { company: "RMS Cranes", areas: ["CO", "WY", "NM"] },
      { company: "JMS Crane & Rigging", areas: ["MT", "SD"] },
    ],
  },
  {
    country: "Canada",
    rows: [
      { company: "TNT Crane & Rigging Canada", areas: ["AB"] },
      { company: "Eagle West Crane & Rigging", areas: ["BC"] },
    ],
  },
];

const SAFETY_POINTS = [
  { title: "Stop-work authority", body: "Every employee, on any job and at any level, can halt work that doesn't meet the standard, with no penalty for calling it." },
  { title: "Trained, certified operators", body: "Certified crews and daily equipment inspections before machines go to work." },
  { title: "A lift plan first", body: "A stamped lift plan is in place before the first pick." },
  { title: "Measured every month", body: "Safety performance is tracked and reported at every branch. It's a running standard, not an annual review." },
];

/**
 * An eased black → transparent fade for the hero photo's edge. A plain
 * two-stop linear gradient fades at a constant rate, which the eye reads as
 * a band with a visible start line; these stops follow an ease-in-out curve
 * (the "easing gradients" technique), so the black thins out gradually and
 * there is no edge where the fade begins or ends. `rgb` is the colour being
 * faded from — black by default, and both photos here sit on black bands
 * (on TNT Light the footprint section passed its off-white).
 */
function easedFade(direction: string, rgb = "0,0,0") {
  const stops: [number, number][] = [
    [1, 0], [0.987, 8.1], [0.951, 15.5], [0.896, 22.5], [0.825, 29], [0.741, 35.3],
    [0.648, 41.2], [0.55, 47.1], [0.45, 52.9], [0.352, 58.8], [0.259, 64.7],
    [0.175, 71], [0.104, 77.5], [0.049, 84.5], [0.013, 91.9], [0, 100],
  ];
  return `linear-gradient(${direction}, ${stops.map(([a, p]) => `rgba(${rgb},${a}) ${p}%`).join(", ")})`;
}

export default function AboutPage() {
  return (
    <>
      <HashScroll />

      {/* 01 — HERO */}
      {/* -mt-10 below lg: --chrome-h is a fixed 120px, but the nav is only
          80px tall until the lg utility strip appears, so <main>'s padding
          leaves a 40px white band above the hero on phones/tablets. Tucking
          the black hero up closes it (local fix — the shared variable also
          drives the homepage and Hero.tsx landing maths, so it's untouched). */}
      <section
        aria-labelledby="about-hero-heading"
        className="relative -mt-10 flex flex-col overflow-hidden bg-black lg:mt-0 lg:flex-row lg:min-h-[min(46rem,calc(100svh-var(--chrome-h)))] lg:items-center"
      >
        {/* Photo. Desktop: absolutely placed from 32% to the right edge, so
            it runs under the text column's edge and the eased fade below
            can blend it into the black over a wide band (no seam). Phones:
            in flow below the text, faded in from the top. Each fade starts
            2px outside the photo so a sub-pixel photo edge can't show as a
            hairline. */}
        <div className="relative order-2 aspect-[16/10] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[32%] lg:aspect-auto">
          <Image
            src="/photos/about/about-hero-crawler-sunset.webp"
            alt="TNT crawler crane lifting a precast load across a construction site at sunset"
            fill
            priority
            sizes="(min-width: 1024px) 68vw, 100vw"
            className="object-cover object-[30%_50%]"
          />
          <div aria-hidden="true" className="absolute inset-y-0 -left-0.5 hidden w-[calc(42%+2px)] lg:block" style={{ backgroundImage: easedFade("to right") }} />
          <div aria-hidden="true" className="absolute inset-x-0 -top-0.5 h-[calc(45%+2px)] lg:hidden" style={{ backgroundImage: easedFade("to bottom") }} />
        </div>

        <div className="relative z-10 order-1 flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:w-[46%] lg:px-16 xl:px-20">
          <p className="flex items-center gap-4 font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
            <span aria-hidden="true" className="h-px w-9 bg-tnt-amber" />
            About TNT Crane &amp; Rigging
          </p>
          <h1 id="about-hero-heading" className="mt-8 font-display text-5xl leading-[1.02] text-white uppercase sm:text-6xl xl:text-7xl">
            Built on local expertise.
            <br />
            <span className="text-tnt-amber">United by strength.</span>
          </h1>
          <p className="mt-8 max-w-lg font-body text-base leading-relaxed text-white/75 sm:text-lg">
            Since 1985, TNT Crane &amp; Rigging has grown from its Houston roots into a North American
            crane and rigging organization, bringing regional expertise, specialized equipment, and
            engineering capabilities together under one family.
          </p>
          <div className="mt-10">
            <ScrollButton targetId="our-story" onDark>
              Explore Our Story
            </ScrollButton>
          </div>
        </div>
      </section>

      {/* 02 — OUR STORY + TIMELINE */}
      <section id="our-story" aria-labelledby="our-story-heading" className="scroll-mt-32 bg-tnt-slate">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
            <div>
              <Eyebrow>Our Journey</Eyebrow>
              <h2 id="our-story-heading" className="mt-4 font-display tracking-wide text-white uppercase text-5xl leading-[0.95] sm:text-6xl">
                <span>
                  Four decades of
                  <br />
                  lifting what matters.
                </span>
              </h2>
              <div className="mt-8 max-w-xl space-y-5 font-body text-lg leading-relaxed text-white/70">
                <p>
                  TNT Crane &amp; Rigging was founded in 1985 in Houston, Texas. In the decades that
                  followed, it grew through regional expansion and strategic acquisitions.
                </p>
                <p>
                  Established regional businesses became part of the wider TNT family, keeping the
                  names, crews and customer relationships their regions know. Their expertise,
                  combined with TNT&apos;s fleet, engineering and safety program, makes up TNT&apos;s
                  North American presence today.
                </p>
              </div>
            </div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl lg:max-w-none">
              <Image
                src="/photos/tnt-crawler-bridge-lift.jpg"
                alt="TNT crawler crane setting bridge girders between concrete piers"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 02b — TIMELINE ("The route so far"), its own black band so it reads
          apart from the slate story above. */}
      <section aria-label="TNT timeline" className="bg-black">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <Timeline />
        </div>
      </section>

      {/* 03 — FAMILY OF COMPANIES */}
      <section id="family-of-companies" aria-labelledby="family-heading" className="scroll-mt-32 bg-tnt-graphite">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
            <div>
              <Eyebrow>The TNT Family</Eyebrow>
              <h2 id="family-heading" className="mt-4 font-display tracking-wide text-white uppercase text-5xl leading-[0.95] sm:text-6xl">
                <span>
                  Different names.
                  <br />
                  One TNT.
                </span>
              </h2>
              <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-white/70">
                Regional companies with deep local roots, each still known by the name its customers
                trust, and all backed by the fleet, engineering and iCARE safety program of TNT Crane
                &amp; Rigging.
              </p>
            </div>

            {/* Parent company — black on the graphite band, with a gold
                border so it still stands out as the parent (on the light
                page a black card stood out on its own). */}
            <div className="rounded-xl border border-tnt-amber/60 bg-black p-8 text-white sm:p-10">
              <div className="flex flex-wrap items-center gap-6">
                <Image src={PARENT.logo} alt={PARENT.name} width={220} height={80} className="h-16 w-auto" />
                <div className="border-l border-white/15 pl-6">
                  <p className="font-body text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">
                    {PARENT.relationship}
                  </p>
                  <p className="mt-1 font-body text-base text-white">{PARENT.base}</p>
                </div>
              </div>
              <p className="mt-6 font-body text-base leading-relaxed text-white/75">{PARENT.story}</p>
              <p className="mt-4 font-body text-sm text-white/60">
                <span className="font-semibold text-white">{PARENT.region}</span> · Branches including{" "}
                {PARENT.locations.join(", ")}
              </p>
            </div>
          </div>

          <div className="mt-14">
            <FamilyProfiles />
          </div>

          <div className="mt-10">
            <Button href="/#coverage" variant="primary" onDark>
              Find Our Locations
            </Button>
          </div>
        </div>
      </section>

      {/* 04 — INTEGRATED CAPABILITIES */}
      <section id="capabilities" aria-labelledby="capabilities-heading" className="scroll-mt-32 bg-tnt-slate">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>What We Do</Eyebrow>
            <h2 id="capabilities-heading" className="mt-4 font-display tracking-wide text-white uppercase text-5xl leading-[0.95] sm:text-6xl">
              <span>
                One partner.
                <br />
                End-to-end capability.
              </span>
            </h2>
            <p className="mt-6 font-body text-lg leading-relaxed text-white/70">
              From the first lift plan to the final set, TNT carries a project through planning,
              lifting, rigging and equipment moving, with the specialist crews and machines each step
              needs.
            </p>
          </div>
          <div className="mt-12">
            <CapabilityExplorer />
          </div>
          <div className="mt-10">
            <Button href="/services" variant="primary" onDark>
              Explore Our Services
            </Button>
          </div>
        </div>
      </section>

      {/* 05 — NORTH AMERICAN REACH */}
      <section id="our-reach" aria-labelledby="reach-heading" className="scroll-mt-32 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
            <div>
              <Eyebrow>Our Footprint</Eyebrow>
              <h2 id="reach-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white uppercase sm:text-6xl">
                Local expertise.
                <br />
                North American reach.
              </h2>
              <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-white/70">
                Customers work with a branch that knows their region, its sites, its weather and its
                people. Behind that branch is a family that can coordinate equipment and crews across
                the United States and Canada when a project calls for more.
              </p>
              <dl className="mt-12 grid grid-cols-2 border-t border-white/15">
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`py-7 ${i % 2 === 0 ? "border-r border-white/15 pr-6" : "pl-8"} ${i < 2 ? "border-b border-white/15" : ""}`}
                  >
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="font-display text-5xl text-white sm:text-6xl">
                        {s.value.replace(/\+$/, "")}
                        {s.value.endsWith("+") && <span className="text-tnt-amber">+</span>}
                      </span>
                      <span className="mt-2 block font-body text-sm text-white/60">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-10">
              {FOOTPRINT.map((country) => (
                <div key={country.country}>
                  <h3 className="flex items-center gap-4 font-body text-xs font-bold tracking-[0.18em] text-tnt-amber uppercase">
                    <span aria-hidden="true" className="h-px w-9 bg-tnt-amber" />
                    {country.country}
                  </h3>
                  <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
                    {country.rows.map((r) => (
                      <li key={r.company} className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <span className="font-display text-xl tracking-wide uppercase">{r.company}</span>
                        <span className="flex flex-wrap gap-2">
                          {r.areas.map((a) => (
                            <span key={a} className="rounded-md border border-white/20 bg-white/5 px-2.5 py-1 font-mono text-xs tracking-wider text-white/80">
                              {a}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Button href="/#coverage" variant="primary" onDark>
                Explore Our Locations
              </Button>
            </div>
          </div>
        </div>
        <div className="relative aspect-[21/9] w-full sm:aspect-[3/1]">
          <Image
            src="/photos/fleet/hydraulic-truck-crane.jpg"
            alt="A line of TNT hydraulic truck cranes lifting a pipeline section into place"
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Eased fade from the section's black into the photo (same curve as
              the hero; see easedFade). Tall (55%) because the sky here is
              bright, and it starts 2px above the photo so its top edge can't
              show as a hairline. */}
          <div aria-hidden="true" className="absolute inset-x-0 -top-0.5 h-[calc(55%+2px)]" style={{ backgroundImage: easedFade("to bottom", "0,0,0") }} />
        </div>
      </section>

      {/* 06 — SAFETY & iCARE */}
      <section id="safety" aria-labelledby="safety-heading" className="scroll-mt-32 bg-tnt-graphite">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20 lg:px-8">
          {/* The badge artwork is drawn for a light ground, so it keeps its
              white card on the dark band. */}
          <div className="flex items-center justify-center rounded-xl bg-white p-10 sm:p-14">
            <Image
              src="/brand/icare-badge.png"
              alt="TNT iCARE safety program badge"
              width={976}
              height={1170}
              sizes="(min-width: 1024px) 24rem, 60vw"
              className="h-auto w-full max-w-xs"
            />
          </div>
          <div>
            <Eyebrow>Our Commitment to Safety</Eyebrow>
            <h2 id="safety-heading" className="mt-4 font-display tracking-wide text-white uppercase text-5xl leading-[0.95] sm:text-6xl">
              <span>
                Safety is part
                <br />
                of every lift.
              </span>
            </h2>
            <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-white/70">
              iCARE is TNT&apos;s safety program, and every company in the family works to it. It
              comes down to accountability on every job and the same standards in every region.
            </p>
            <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {SAFETY_POINTS.map((p, i) => (
                <li key={p.title} className="border-t-2 border-tnt-amber pt-4">
                  <span className="font-body text-xs font-bold tracking-[0.14em] text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-2xl tracking-wide text-white uppercase">{p.title}</h3>
                  <p className="mt-2 font-body text-base leading-relaxed text-white/65">{p.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <Button href="/#safety" variant="primary" onDark>
                Explore Our Safety Commitment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — FINAL CTA */}
      <section id="work-with-us" aria-labelledby="cta-heading" className="scroll-mt-32 bg-tnt-amber">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="font-body text-[13px] font-bold tracking-[0.18em] text-black/70 uppercase">Let&apos;s Work Together</p>
            <h2 id="cta-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-black uppercase sm:text-6xl">
              Your next project.
              <br />
              Our next priority.
            </h2>
            <p className="mt-6 font-body text-lg leading-relaxed text-black/75">
              From lift planning and engineering to crane rental and specialized rigging, our teams
              are ready to help you move your next project forward.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button href="/#quote" variant="primary">
              Request a Quote
            </Button>
            {/* Button's arrow is gold everywhere except primary-on-dark, so on
                this gold band the secondary button's arrow vanished (TNT
                Light has the same bug). Recoloured here only, rather than
                changing the shared component. */}
            <Button href="/#coverage" variant="secondary" className="[&_svg]:text-black">
              Find a Location
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
