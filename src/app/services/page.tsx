import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/site/Button";
import { Eyebrow, Icon } from "@/components/site/primitives";
import ScrollButton from "@/components/about/ScrollButton";
import HashScroll from "@/components/about/HashScroll";
import TargetHighlight from "@/components/site/TargetHighlight";
import RegionalAvailability from "@/components/services/RegionalAvailability";
import CraneTypeGrid from "@/components/services/CraneTypeGrid";
import HashRedirect from "@/components/services/HashRedirect";
import { COMPANIES, SERVICES, availability, serviceById, serviceHref } from "@/components/site/services";
import { contactFor } from "@/components/site/regionalContacts";
import {
  PROJECTS,
  SERVICE_DETAILS,
  SPECIALIZED,
  STEPS,
} from "@/components/services/servicesPageData";

/**
 * /services — the Services Overview page. Built 2026-10-09 from the Services
 * Overview master brief; structure, data model and scope decisions approved
 * with the user the same day:
 *
 *   - One page, no /services/* sub-pages yet. Every service (and every nav,
 *     footer and homepage-card link) lands on its own block here:
 *     /services#crane-rental … /services#industrial-storage.
 *   - The six services and who offers them come from site/services.ts — the
 *     same table the nav panel, homepage map and forms read.
 *   - Projects show real photos with a "details coming soon" tag; their
 *     write-ups are placeholder, so no names, numbers or outcomes appear.
 *
 * Server component. Client islands: hash handling, the hero scroll CTA, the
 * targeted-card outline and the regional availability tabs. Nav and footer
 * come from the root layout. Section rhythm follows /about — no two adjacent
 * bands alike, one dark band mid-page, gold close.
 *
 * DEDICATED SERVICE PAGES (2026-10-09): Crane Rental has its own page,
 * /services/crane-rental; its card here links to it, and old
 * /services#crane-rental links redirect there (HashRedirect). The other five
 * still live only as cards here. A hash-switched "focus view" briefly did
 * this job on this page — replaced because search engines ignore fragments.
 *
 * Quote CTAs go to /contact (the honest form — it says nothing is sent until
 * a backend exists) with ?service= preselecting the service.
 *
 * DARK THEME (TNT Dark, 2026-10-15 — ported from TNT Light; structure,
 * copy, data and behaviour unchanged, colour only). Bands: black hero →
 * slate intro → black core services → graphite specialized → black crane
 * preview → slate how-we-work → black availability → graphite projects →
 * slate safety & engineering → gold quote (unchanged). Headings are plain
 * <h2>s rather than primitives' `Heading`, which hard-codes text-black.
 * Cards are tnt-slate on black bands and black on slate/graphite bands,
 * with white/10 hairlines; buttons on dark bands use `onDark`, the gold
 * close keeps the light variants.
 */

export const metadata: Metadata = {
  title: "Crane Rental, Rigging & Industrial Services | TNT Crane & Rigging",
  description:
    "Explore crane rental, specialized rigging, machinery moving, heavy-haul transport, engineering, and industrial storage solutions from TNT Crane & Rigging.",
  alternates: { canonical: "/services" },
};

/** Same eased fade as /about's hero (see that file's easedFade note). */
function easedFade(direction: string) {
  const stops: [number, number][] = [
    [1, 0], [0.987, 8.1], [0.951, 15.5], [0.896, 22.5], [0.825, 29], [0.741, 35.3],
    [0.648, 41.2], [0.55, 47.1], [0.45, 52.9], [0.352, 58.8], [0.259, 64.7],
    [0.175, 71], [0.104, 77.5], [0.049, 84.5], [0.013, 91.9], [0, 100],
  ];
  return `linear-gradient(${direction}, ${stops.map(([a, p]) => `rgba(0,0,0,${a}) ${p}%`).join(", ")})`;
}

const KEY_MESSAGES = [
  { title: "Connected regional expertise", body: "Local teams who know their sites, backed by the wider TNT family." },
  { title: "Broad equipment capabilities", body: "Cranes, rigging systems and transport across the network." },
  { title: "Integrated industrial services", body: "Lifting, rigging, moving, hauling and storage under one conversation." },
  { title: "Project-specific technical support", body: "Planning and engineering matched to what each job needs." },
];

const ENGINEERING_POINTS = [
  "Critical lift planning",
  "Engineered lifting solutions",
  "Equipment selection",
  "Ground condition assessment",
  "Project-specific technical support",
];

const SAFETY_POINTS = [
  "Safety-focused planning",
  "Qualified operating teams",
  "Established safety procedures",
  "Project-specific risk considerations",
];

/** TNT's main published line (regionalContacts.ts), for the quote band —
 *  buyers often call rather than fill in a form. */
const MAIN_LINE = contactFor("TNT Crane & Rigging")!.phones[0];

/** Companies that offer a service directly, by short name. */
function directProviders(id: (typeof SERVICES)[number]["id"]) {
  return COMPANIES.filter((c) => availability(c.id, id).status === "direct").map((c) => c.short);
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {items.map((i) => (
        <li
          key={i}
          className="rounded-md border border-white/12 bg-white/[0.05] px-2.5 py-1 font-body text-[12px] leading-snug text-white/75"
        >
          {i}
        </li>
      ))}
    </ul>
  );
}

export default function ServicesPage() {
  return (
    <>
      <HashScroll />
      <HashRedirect />
      <TargetHighlight selector=".svc-tile" />

      {/* 01 — HERO */}
      {/* -mt-10 below lg: same nav-height correction as /about's hero. */}
      <section
        aria-labelledby="services-hero-heading"
        className="relative -mt-10 flex flex-col overflow-hidden bg-black lg:mt-0 lg:min-h-[min(46rem,calc(100svh-var(--chrome-h)))] lg:flex-row lg:items-center"
      >
        <div className="relative order-2 aspect-[16/10] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[32%] lg:aspect-auto">
          <Image
            src="/photos/cases/tnt-142-refinery-reactor-exchange.jpg"
            alt="Large TNT crawler crane rigged for a heavy lift at a refinery"
            fill
            priority
            sizes="(min-width: 1024px) 68vw, 100vw"
            className="object-cover object-[60%_50%]"
          />
          <div aria-hidden="true" className="absolute inset-y-0 -left-0.5 hidden w-[calc(42%+2px)] lg:block" style={{ backgroundImage: easedFade("to right") }} />
          <div aria-hidden="true" className="absolute inset-x-0 -top-0.5 h-[calc(45%+2px)] lg:hidden" style={{ backgroundImage: easedFade("to bottom") }} />
        </div>

        <div className="relative z-10 order-1 flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:w-[50%] lg:px-16 xl:px-20">
          <p className="flex items-center gap-4 font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
            <span aria-hidden="true" className="h-px w-9 bg-tnt-amber" />
            Our Services
          </p>
          <h1 id="services-hero-heading" className="mt-8 font-display text-5xl leading-[1.02] text-white uppercase sm:text-6xl xl:text-7xl">
            Full-scope lifting,
            <br />
            rigging &amp; <span className="text-tnt-amber">industrial solutions</span>
          </h1>
          <p className="mt-8 max-w-lg font-body text-base leading-relaxed text-white/75 sm:text-lg">
            From crane rental and specialized rigging to heavy transport, engineering and industrial
            storage, TNT Crane &amp; Rigging brings together the capabilities of its family of
            companies to support complex projects across North America.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ScrollButton targetId="core-services" onDark>
              Explore Our Services
            </ScrollButton>
            <Button href="/contact#contact-form" variant="secondary" onDark>
              Request a Quote
            </Button>
          </div>
        </div>
      </section>

      {/* 02 — INTRODUCTION */}
      <section aria-labelledby="intro-heading" className="bg-tnt-slate">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20 lg:px-8">
          <div>
            <Eyebrow>The TNT Network</Eyebrow>
            <h2 id="intro-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white uppercase sm:text-6xl">
              One network.
              <br />
              Complete project support.
            </h2>
          </div>
          <div>
            <p className="font-body text-lg leading-relaxed text-white/70">
              TNT Crane &amp; Rigging brings together specialized equipment, experienced teams and
              regional expertise for lifting, rigging, transportation, engineering and industrial
              projects. Through its family of companies, TNT connects customers with the capabilities
              their specific project requires.
            </p>
            <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {KEY_MESSAGES.map((m) => (
                <li key={m.title} className="border-t-2 border-white/80 pt-4">
                  <h3 className="font-display text-xl tracking-wide text-white uppercase">{m.title}</h3>
                  <p className="mt-2 font-body text-[15px] leading-relaxed text-white/65">{m.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 03 — CORE SERVICES */}
      <section id="core-services" aria-labelledby="core-heading" className="scroll-mt-32 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Core Services</Eyebrow>
            <h2 id="core-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white uppercase sm:text-6xl">
              Our core services
            </h2>
            <p className="mt-6 font-body text-lg leading-relaxed text-white/70">
              Explore comprehensive lifting, rigging, transportation and industrial solutions.
            </p>
          </div>

          {/* Two across, not three: each card carries its capability list, and
              at three across the chips wrap into a column of one-word rows.
              Not a stretched-link card — each has its own CTA and expandable
              list, so the card itself isn't one control. */}
          <ol className="mt-12 grid gap-6 lg:grid-cols-2">
            {SERVICES.map((s) => {
              const d = SERVICE_DETAILS[s.id];
              const providers = directProviders(s.id);
              return (
                <li key={s.id} id={s.id} className="svc-tile scroll-mt-32 rounded-xl">
                  <article
                    aria-labelledby={`${s.id}-title`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-tnt-slate transition-[border-color,translate] duration-300 ease-out hover:-translate-y-0.5 hover:border-tnt-amber motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <div className="relative aspect-[16/8] overflow-hidden bg-black">
                      {d.photo ? (
                        <Image
                          src={d.photo.src}
                          alt={d.photo.alt}
                          fill
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#000_0%,#242424_100%)]">
                          <Icon name={s.icon} className="h-12 w-12 text-tnt-amber" />
                          <span className="font-mono text-[10px] tracking-[0.16em] text-white/50 uppercase">
                            Facility photo pending
                          </span>
                        </div>
                      )}
                      <span className="absolute top-4 left-4 rounded-md bg-black/80 px-2.5 py-1 font-mono text-xs tabular-nums text-tnt-amber">
                        {s.index}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6 sm:p-8">
                      <h3 id={`${s.id}-title`} className="font-display text-3xl tracking-wide text-white uppercase">
                        {s.label}
                      </h3>
                      <p className="mt-3 font-body text-base leading-relaxed text-white/70">{d.description}</p>

                      <p className="mt-6 font-body text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
                        {d.listLabel}
                      </p>
                      <Chips items={d.items} />

                      {d.extra && (
                        <details className="group/more mt-5">
                          <summary className="flex cursor-pointer list-none items-center gap-2 font-body text-[13px] font-semibold text-white hover:text-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                            <Icon name="arrow" className="h-3.5 w-3.5 text-tnt-amber transition-transform group-open/more:rotate-90" />
                            {d.extra.label}
                          </summary>
                          <Chips items={d.extra.items} />
                        </details>
                      )}

                      {d.scope && (
                        <p className="mt-5 font-body text-[13px] leading-relaxed text-white/60">{d.scope}</p>
                      )}

                      <div className="mt-auto pt-6">
                        <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-body text-[13px] text-white/65">
                            <span className="font-semibold text-white">Offered directly by: </span>
                            {providers.length ? providers.join(" · ") : "contact our team to confirm"}
                          </p>
                          {/* A service with its own page sends people there
                              (the page carries the quote form); the rest go
                              straight to /contact with the service set. */}
                          {s.page ? (
                            <Button href={s.page} variant="primary" onDark className="shrink-0">
                              Explore {s.label}
                            </Button>
                          ) : (
                            <Button href={`/contact?service=${s.id}#contact-form`} variant="primary" onDark className="shrink-0">
                              Request a Quote<span className="sr-only"> for {s.label}</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 04 — SPECIALIZED CAPABILITIES */}
      <section id="specialized" aria-labelledby="specialized-heading" className="scroll-mt-32 bg-tnt-graphite">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
            <div>
              <Eyebrow>Specialized Capabilities</Eyebrow>
              <h2 id="specialized-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white uppercase sm:text-6xl">
                Specialized solutions
                <br />
                for complex projects
              </h2>
            </div>
            <p className="font-body text-lg leading-relaxed text-white/70">
              Regional and industry-specific capabilities within the TNT family. Each one is offered
              by the company named on it, not across every location.
            </p>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALIZED.map((c) => (
              <li key={c.id} id={c.id} className="scroll-mt-32">
                <article className="flex h-full flex-col rounded-xl border border-white/10 bg-black p-6 transition-colors duration-300 hover:border-tnt-amber">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-tnt-amber/50 bg-tnt-amber/10 px-3 py-1 font-body text-[11px] font-semibold text-white">
                    <Icon name="pin" className="h-3.5 w-3.5 text-tnt-amber" />
                    {c.provider}
                  </span>
                  <h3 className="mt-5 font-display text-2xl tracking-wide text-white uppercase">{c.title}</h3>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {c.items.map((i) => (
                      <li key={i} className="flex items-start gap-2 font-body text-[14px] text-white/65">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-tnt-amber" />
                        {i}
                      </li>
                    ))}
                  </ul>
                  {c.note && <p className="mt-4 font-body text-[13px] text-white/60">{c.note}</p>}
                  <div className="mt-6">
                    <Button href={c.link.href} variant="link" onDark>
                      {c.link.label}
                    </Button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 — CRANE RENTAL PREVIEW */}
      <section id="crane-types" aria-labelledby="cranes-heading" className="scroll-mt-32 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-2xl">
              <Eyebrow>Crane Rental</Eyebrow>
              <h2 id="cranes-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide uppercase sm:text-6xl">
                Find the right crane
                <br />
                for your project
              </h2>
              <p className="mt-6 font-body text-lg leading-relaxed text-white/70">
                TNT&rsquo;s range of crane solutions for construction, industrial, infrastructure and
                specialized lifting. Availability varies by location.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button href={serviceHref(serviceById("crane-rental"))} variant="primary" onDark>
                Explore Crane Rental
              </Button>
              <Button href="/load-chart/all-terrain-cranes" variant="secondary" onDark>
                Search Load Charts
              </Button>
            </div>
          </div>

          <CraneTypeGrid tone="dark" />
        </div>
      </section>

      {/* 06 — HOW WE WORK */}
      <section aria-labelledby="process-heading" className="bg-tnt-slate">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>How We Work</Eyebrow>
            <h2 id="process-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white uppercase sm:text-6xl">
              From planning
              <br />
              to project execution
            </h2>
            <p className="mt-6 font-body text-lg leading-relaxed text-white/70">
              A typical engagement. Your team will confirm the steps for your project.
            </p>
          </div>
          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t-2 border-white/80 pt-5">
                <span className="font-mono text-sm tabular-nums text-tnt-amber">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-2xl tracking-wide text-white uppercase">{step.title}</h3>
                <p className="mt-2 font-body text-base leading-relaxed text-white/65">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 07 — REGIONAL AVAILABILITY */}
      <section id="availability" aria-labelledby="availability-heading" className="scroll-mt-32 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
            <div>
              <Eyebrow>Regional Service Availability</Eyebrow>
              <h2 id="availability-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white uppercase sm:text-6xl">
                Local expertise.
                <br />
                Connected capabilities.
              </h2>
            </div>
            <div>
              <p className="font-body text-lg leading-relaxed text-white/70">
                TNT&rsquo;s regional network connects you with the right teams, equipment and services
                for your project location. Choose a company to see what it offers.
              </p>
              <div className="mt-6">
                <Button href="/#coverage" variant="link" onDark>
                  Find a branch on the map
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <RegionalAvailability />
          </div>
        </div>
      </section>

      {/* 08 — PROJECTS */}
      <section aria-labelledby="projects-heading" className="bg-tnt-graphite">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>Projects</Eyebrow>
            <h2 id="projects-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white uppercase sm:text-6xl">
              Proven capabilities.
              <br />
              Real-world projects.
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {PROJECTS.map((p) => (
              <li key={p.photo.src}>
                <article className="h-full overflow-hidden rounded-xl border border-white/10 bg-black">
                  <div className="relative aspect-[4/3]">
                    <Image src={p.photo.src} alt={p.photo.alt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <p className="font-body text-[11px] font-semibold tracking-[0.16em] text-tnt-amber uppercase">{p.service}</p>
                    <h3 className="mt-2 font-display text-xl tracking-wide text-white uppercase">{p.category}</h3>
                    <p className="mt-3 inline-flex rounded-full border border-white/15 px-3 py-1 font-body text-[12px] text-white/60">
                      Project details coming soon
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 09 — SAFETY & ENGINEERING */}
      <section aria-labelledby="safety-eng-heading" className="bg-tnt-slate">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>Safety &amp; Engineering</Eyebrow>
            <h2 id="safety-eng-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white uppercase sm:text-6xl">
              Safety and precision
              <br />
              at every stage
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-xl border border-white/10 bg-black p-8 text-white sm:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-tnt-amber/15 text-tnt-amber">
                <Icon name="engineering" className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-display text-3xl tracking-wide uppercase">Engineering expertise</h3>
              <p className="mt-3 font-body text-base leading-relaxed text-white/70">
                Complex lifting operations call for careful planning, technical analysis and the right
                equipment for the job.
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {ENGINEERING_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 font-body text-[15px] text-white/80">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tnt-amber" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="#lift-planning-engineering" variant="primary" onDark>
                  Explore Engineering
                </Button>
              </div>
            </article>

            <article className="flex flex-col rounded-xl border border-white/10 bg-black p-8 sm:p-10">
              {/* The badge artwork is drawn for a light ground, so it keeps a
                  white tile on the dark card (as on /about). */}
              <div className="w-fit rounded-lg bg-white p-2.5">
                <Image
                  src="/brand/icare-badge.png"
                  alt="TNT iCARE safety program badge"
                  width={976}
                  height={1170}
                  sizes="5rem"
                  className="h-auto w-16 sm:w-20"
                />
              </div>
              <h3 className="mt-6 font-display text-3xl tracking-wide text-white uppercase">Safety commitment</h3>
              <p className="mt-3 font-body text-base leading-relaxed text-white/70">
                Safety is an essential consideration throughout TNT&rsquo;s lifting, rigging and
                industrial operations, and iCARE is the program every company in the family works to.
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {SAFETY_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 font-body text-[15px] text-white/75">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tnt-amber" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/#safety" variant="primary" onDark>
                  Our Safety Commitment
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 10 — REQUEST A QUOTE */}
      <section id="quote" aria-labelledby="quote-heading" className="scroll-mt-32 bg-tnt-amber">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="font-body text-[13px] font-bold tracking-[0.18em] text-black/70 uppercase">Request a Quote</p>
            <h2 id="quote-heading" className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-black uppercase sm:text-6xl">
              Let&rsquo;s plan
              <br />
              your next project
            </h2>
            <p className="mt-6 font-body text-lg leading-relaxed text-black/75">
              Tell us about your project and our team can help identify the right service and next
              steps.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button href="/contact#contact-form" variant="primary">
              Request a Quote
            </Button>
            <Button href="/contact#regional-contacts" variant="secondary">
              Contact Our Team
            </Button>
            <Button href={MAIN_LINE.href} variant="secondary" arrow={false}>
              Call {MAIN_LINE.display}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
