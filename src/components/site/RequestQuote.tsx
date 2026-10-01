"use client";

/**
 * REQUEST A QUOTE — the primary conversion action (was entirely missing).
 *
 * Enerblock "tell us about your project" band, in our design system. Front-end
 * only: on submit it shows a success state — there is NO backend yet, so wire
 * the handler to a real endpoint/email service before launch. Services are
 * multi-select chips (reusing the Coverage filter-pill treatment).
 *
 * LIGHT-MODE SHELL IS `bg-tnt-gray` (2026-09-26, on request — same "add grey
 * bg" ask SafetyCulture.tsx got, for the same reason: this section sat right
 * after ContactSection, both `bg-white`, so they ran together with no
 * visible seam. `tnt-gray` (#eeeeee) is globals.css's own token for exactly
 * this — "alternating section backgrounds". The form/success card underneath
 * stays `bg-white` — it now reads as a card floating on the grey band rather
 * than blending into it, same pattern the floating map cards use.
 *
 * REQUIRED FIELDS (2026-09-29, from the desktop comparison review against
 * maximcrane.com): name, email, phone, jobsite ZIP and crane type are
 * required and marked with an asterisk, keyed by a "* Required" note at the
 * top of the form. Phone moved from optional to required — sales calls back.
 * Jobsite ZIP and crane type were added so a rep can route the lead to a
 * branch and a fleet class without a follow-up question. Load and radius are
 * their own optional fields (they used to live only in the description
 * placeholder) — a visitor who knows them saves a call; one who doesn't
 * shouldn't be blocked.
 */

import { useState, type FormEvent } from "react";
import { Eyebrow } from "./primitives";
import Button from "./Button";
import RevealText from "./RevealText";

const SERVICES = [
  "Crane Rental",
  "Specialized Rigging",
  "Machinery Moving",
  "Industrial Storage",
  "Engineering",
];

// The six classes in the nav's Load Chart menu, so the form and the fleet
// speak the same taxonomy. "Not sure" is a real answer — a rep will recommend.
const CRANE_TYPES = [
  "All-Terrain Crane",
  "Crawler Crane",
  "Hydraulic Truck Crane",
  "Rough-Terrain Crane",
  "Carry Deck Crane",
  "Tower Crane",
  "Not sure — recommend one",
];

// US ZIP (12345 or 12345-6789) or Canadian postal code (A1A 1A1) — TNT
// Canada and Eagle West quote Canadian jobsites.
const POSTAL_PATTERN = "\\d{5}(-\\d{4})?|[A-Za-z]\\d[A-Za-z] ?\\d[A-Za-z]\\d";

const field =
  "w-full rounded-md border px-4 py-3 font-body text-sm placeholder:text-tnt-meta focus:border-tnt-amber focus:ring-1 focus:ring-tnt-amber focus:outline-none border-white/15 bg-black text-white";
const label =
  "block font-body text-[11px] font-semibold tracking-[0.16em] text-tnt-meta uppercase";

/** Visual required marker. aria-hidden: the input's own `required` is what
 *  assistive tech announces, so the star would only be read as "star". */
function Req() {
  return (
    <span aria-hidden="true" className="ml-1 text-tnt-amber">
      *
    </span>
  );
}

/** Quiet "optional" tag for the fields a visitor may reasonably not know. */
function Opt() {
  return (
    <span className="ml-1 font-normal tracking-normal normal-case">(optional)</span>
  );
}

export default function RequestQuote() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (s: string) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: POST to a real endpoint / email service.
    setSubmitted(true);
  };

  return (
    <section id="quote" className="scroll-mt-32 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          {/* Left — statement */}
          <div className="lg:sticky lg:top-[var(--chrome-h)] lg:self-start">
            <Eyebrow>Request a Quote</Eyebrow>
            <RevealText
              as="h2"
              text="Request a Job Quote"
              className="mt-3 font-display text-4xl tracking-wide uppercase sm:text-5xl text-white"
            />
            <p className="mt-4 font-body text-base text-tnt-body sm:text-lg">
              Tell us about the lift and a TNT rep will follow up with capacity,
              availability, and pricing. Prefer to talk it through?
            </p>
            <p className="mt-2 font-mono text-sm text-tnt-navy">
              Call 1-800-799-2505 — 24/7.
            </p>
          </div>

          {/* Right — form */}
          {submitted ? (
            <div className="flex flex-col items-start justify-center rounded-2xl border p-8 sm:p-12 border-white/10 bg-black">
              <span className="font-display text-3xl tracking-wide uppercase sm:text-4xl text-white">
                Request received
              </span>
              <p className="mt-3 max-w-md font-body text-base text-tnt-body">
                Thanks — a TNT Sales Representative will be in touch shortly. For
                anything urgent, call{" "}
                <a href="tel:+18007992505" className="font-semibold text-tnt-amber">
                  1-800-799-2505
                </a>
                .
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border p-6 sm:p-8 border-white/10 bg-black"
            >
              <p className="mb-5 font-body text-[13px] text-tnt-body">
                <span aria-hidden="true" className="text-tnt-amber">*</span>{" "}
                Required field
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-name" className={label}>
                    Full name<Req />
                  </label>
                  <input id="q-name" name="name" required autoComplete="name" className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor="q-company" className={label}>
                    Company
                  </label>
                  <input id="q-company" name="company" autoComplete="organization" className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor="q-email" className={label}>
                    Email<Req />
                  </label>
                  <input id="q-email" name="email" type="email" required autoComplete="email" className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor="q-phone" className={label}>
                    Phone<Req />
                  </label>
                  <input id="q-phone" name="phone" type="tel" required autoComplete="tel" className={`mt-2 ${field}`} />
                </div>
              </div>

              {/* Job details — where, what, and (if known) how big */}
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-zip" className={label}>
                    Jobsite ZIP / postal code<Req />
                  </label>
                  <input
                    id="q-zip"
                    name="jobsiteZip"
                    required
                    autoComplete="postal-code"
                    pattern={POSTAL_PATTERN}
                    title="5-digit ZIP (e.g. 77001) or Canadian postal code (e.g. T2P 1J9)"
                    placeholder="e.g. 77001"
                    className={`mt-2 ${field}`}
                  />
                </div>
                <div>
                  <label htmlFor="q-crane" className={label}>
                    Crane type<Req />
                  </label>
                  <select
                    id="q-crane"
                    name="craneType"
                    required
                    defaultValue=""
                    className={`mt-2 ${field}`}
                  >
                    <option value="" disabled>
                      Select a crane type
                    </option>
                    {CRANE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="q-load" className={label}>
                    Load weight (tons)<Opt />
                  </label>
                  <input
                    id="q-load"
                    name="loadTons"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    placeholder="e.g. 40"
                    className={`mt-2 ${field}`}
                  />
                </div>
                <div>
                  <label htmlFor="q-radius" className={label}>
                    Lift radius (ft)<Opt />
                  </label>
                  <input
                    id="q-radius"
                    name="radiusFt"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    placeholder="e.g. 80"
                    className={`mt-2 ${field}`}
                  />
                </div>
              </div>

              {/* Services — multi-select chips */}
              <fieldset className="mt-6">
                <legend className={label}>Services required</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SERVICES.map((s) => {
                    const on = selected.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(s)}
                        aria-pressed={on}
                        className={`rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors ${
                          on
                            ? "border-tnt-amber bg-tnt-amber text-black"
                            : "text-tnt-body border-white/15 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-start" className={label}>
                    Start date
                  </label>
                  <input id="q-start" name="start" type="date" className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor="q-duration" className={label}>
                    Estimated duration
                  </label>
                  <input
                    id="q-duration"
                    name="duration"
                    placeholder="e.g. 3 days"
                    className={`mt-2 ${field}`}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="q-desc" className={label}>
                  Project description
                </label>
                <textarea
                  id="q-desc"
                  name="description"
                  rows={4}
                  placeholder="Site conditions, access, lift height, anything else…"
                  className={`mt-2 ${field} resize-y`}
                />
              </div>

              <div className="mt-6">
                <label htmlFor="q-file" className={label}>
                  Attach a drawing or spec (optional)
                </label>
                <input
                  id="q-file"
                  name="file"
                  type="file"
                  className="mt-2 block w-full font-body text-sm text-tnt-body file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-tnt-navy"
                />
              </div>

              <label className="mt-6 flex items-start gap-3 font-body text-[13px] leading-relaxed text-tnt-body">
                <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-tnt-amber" />
                <span>
                  I agree to receive text messages from TNT Crane &amp; Rigging
                  about my request. Reply STOP to opt out. Message &amp; data
                  rates may apply.
                </span>
              </label>

              <div className="mt-8">
                <Button type="submit" variant="primary">
                  Submit request
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
