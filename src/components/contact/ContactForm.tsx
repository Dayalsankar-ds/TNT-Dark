"use client";

/**
 * CONTACT FORM — /contact's quote form (also embedded on
 * /services/crane-rental). One form, no tabs: the Request a Quote / General
 * Enquiry switch and the enquiry form were removed 2026-10-13, on request —
 * the homepage form has no such options, and this one mirrors it.
 *
 * Reuses the homepage RequestQuote form's field style, required/optional
 * markers and crane taxonomy (exported from RequestQuote.tsx), so the two
 * forms read as one system. Submits through the single submitContact() seam.
 *
 * ⚠ PENDING INTEGRATION: submitContact() has no destination yet and returns
 * "not-configured". The form says so up front, and after submit it states
 * that nothing was sent and offers the phone line plus an email fallback
 * (the visitor's own mail app, pre-filled for the published info@ inbox).
 * There is deliberately no path that shows a success message today.
 *
 * Validation is custom (noValidate) so errors are written messages next to
 * each field, linked by aria-describedby, flagged aria-invalid, summarised
 * in an alert, with focus moved to the first problem — never colour alone.
 *
 * DARK THEME (TNT Dark, 2026-10-15 — ported from TNT Light, colour only):
 * black card and fields from Dark's RequestQuote; Light's maroon error red
 * (unreadable on black) is red-400; required asterisk amber as on the
 * homepage form; buttons use `onDark`.
 */

import {
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { AlertCircle, Info } from "lucide-react";
import Button from "@/components/site/Button";
import { CRANE_TYPES, field, label, Opt, POSTAL_PATTERN, Req } from "@/components/site/RequestQuote";
import { SERVICES as CATALOG } from "@/components/site/services";
import { submitContact, type ContactKind, type SubmitResult } from "./submitContact";

/* ── Options ──────────────────────────────────────────────────────────── */

// QUOTE TAB = THE HOMEPAGE FORM (2026-10-13, on request — "follow the same
// from main screen form"). Same fields, order, labels, required/optional
// split, service list and field `name`s as RequestQuote.tsx, so both forms
// produce one lead shape when submissions are connected. Only the submit
// outcome differs on purpose: this form never shows a success it can't back.
const SERVICES = CATALOG.map((s) => s.label);

// Whole-string match of the homepage's own ZIP / postal pattern.
const POSTAL_RE = new RegExp(`^(?:${POSTAL_PATTERN})$`);

const FILE_EXTENSIONS = [".pdf", ".dwg", ".dxf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_MB = 10;

const MAIN_PHONE = { display: "1-800-799-2505", href: "tel:+18007992505" };
const MAIN_EMAIL = "info@tntcrane.com";

/* ── Validation ───────────────────────────────────────────────────────── */

type Rule = {
  name: string;
  label: string;
  required?: string;
  kind?: "email" | "phone" | "postal";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const QUOTE_RULES: Rule[] = [
  { name: "name", label: "Full name", required: "Enter your full name." },
  { name: "company", label: "Company" },
  { name: "email", label: "Email", required: "Enter your email address.", kind: "email" },
  { name: "phone", label: "Phone", required: "Enter your phone number.", kind: "phone" },
  {
    name: "jobsiteZip",
    label: "Jobsite ZIP / postal code",
    required: "Enter the jobsite ZIP or postal code.",
    kind: "postal",
  },
  { name: "craneType", label: "Crane type", required: "Select a crane type." },
  { name: "loadTons", label: "Load weight (tons)" },
  { name: "radiusFt", label: "Lift radius (ft)" },
  { name: "services", label: "Services required" },
  { name: "start", label: "Start date" },
  { name: "duration", label: "Estimated duration" },
  { name: "description", label: "Project description" },
];

function checkValue(rule: Rule, raw: string): string | null {
  const v = raw.trim();
  if (!v) return rule.required ?? null;
  if (rule.kind === "email" && !EMAIL_RE.test(v)) {
    return "Enter a valid email address, like name@company.com.";
  }
  if (rule.kind === "postal" && !POSTAL_RE.test(v)) {
    return "Enter a 5-digit ZIP (e.g. 77001) or Canadian postal code (e.g. T2P 1J9).";
  }
  if (rule.kind === "phone") {
    const digits = v.replace(/\D/g, "").length;
    if (digits < 10 || digits > 15) return "Enter a phone number with at least 10 digits.";
  }
  return null;
}

function checkFile(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!FILE_EXTENSIONS.includes(ext)) return "Attach a PDF, DWG, DXF, JPG or PNG file.";
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `Attach a file of ${MAX_FILE_MB} MB or smaller.`;
  return null;
}

type Errors = Record<string, string>;

function validateForm(form: HTMLFormElement, rules: Rule[]): Errors {
  const data = new FormData(form);
  const errors: Errors = {};
  for (const rule of rules) {
    // Fields that aren't rendered (e.g. the lifting fieldset when hidden)
    // simply aren't in the FormData — skip rather than flag.
    if (!form.elements.namedItem(rule.name)) continue;
    const msg = checkValue(rule, String(data.get(rule.name) ?? ""));
    if (msg) errors[rule.name] = msg;
  }
  const file = data.get("file");
  const fileMsg = checkFile(file instanceof File ? file : null);
  if (fileMsg) errors.file = fileMsg;
  return errors;
}

/* ── Form state + submit ──────────────────────────────────────────────── */

type Status = { state: "idle" } | { state: "submitting" } | SubmitResult;

function useContactForm(kind: ContactKind, rules: Rule[], idPrefix: string) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [mailto, setMailto] = useState<string | null>(null);
  // A ref, not state: a double-click lands before React re-renders, so only
  // a synchronous flag reliably blocks the second submit.
  const busy = useRef(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy.current) return;
    const form = e.currentTarget;
    const found = validateForm(form, rules);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      setStatus({ state: "idle" });
      document.getElementById(`${idPrefix}-${first}`)?.focus();
      return;
    }

    busy.current = true;
    setStatus({ state: "submitting" });
    const fd = new FormData(form);
    const data: Record<string, string> = {};
    for (const [k, v] of fd.entries()) {
      if (v instanceof File) {
        if (v.size > 0) data[k] = v.name; // name only — no file is transmitted
      } else if (v.trim()) {
        // Chip groups post one entry per checked chip — join them.
        data[k] = data[k] ? `${data[k]}, ${v.trim()}` : v.trim();
      }
    }
    const result = await submitContact(kind, data);
    busy.current = false;
    setStatus(result);
    setMailto(result.status === "sent" ? null : buildMailto(kind, rules, data));
  };

  // Re-check a field the moment it's fixed, but don't nag about fields the
  // visitor hasn't attempted yet — only fields already flagged re-validate.
  const recheck = (e: FocusEvent<HTMLFormElement> | FormEvent<HTMLFormElement>) => {
    const el = e.target as HTMLInputElement;
    if (!el.name || !(el.name in errors)) return;
    // Read from the form, not the element: a chip group's value is every
    // checked chip, not the one just clicked.
    const value = new FormData(e.currentTarget)
      .getAll(el.name)
      .filter((v): v is string => typeof v === "string")
      .join(", ");
    const msg =
      el.name === "file"
        ? checkFile(el.files?.[0] ?? null)
        : checkValue(rules.find((r) => r.name === el.name) ?? { name: el.name, label: "" }, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[el.name] = msg;
      else delete next[el.name];
      return next;
    });
  };

  /** aria wiring for one control. */
  const a11y = (name: string, hint?: boolean) => {
    const id = `${idPrefix}-${name}`;
    const describedBy = [hint && `${id}-hint`, errors[name] && `${id}-error`]
      .filter(Boolean)
      .join(" ");
    return {
      id,
      name,
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": describedBy || undefined,
    } as const;
  };

  return { errors, status, mailto, onSubmit, recheck, a11y };
}

function buildMailto(kind: ContactKind, rules: Rule[], data: Record<string, string>): string {
  const lines = rules
    .filter((r) => data[r.name])
    .map((r) => `${r.label}: ${data[r.name]}`);
  if (data.file) lines.push(`Attachment (please attach to this email): ${data.file}`);
  const subject =
    kind === "quote"
      ? `Quote request${data.services ? `: ${data.services}` : ""}${data.jobsiteZip ? `, ${data.jobsiteZip}` : ""}`
      : `Enquiry: ${data.enquiryType ?? ""}`;
  // Mail clients truncate very long mailto: URLs; keep the body comfortably short.
  const body = lines.join("\n").slice(0, 1800);
  return `mailto:${MAIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* ── Presentational pieces ────────────────────────────────────────────── */

function Field({
  id,
  text,
  required,
  optional,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  text: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={label}>
        {text}
        {required ? <Req /> : optional ? <Opt /> : null}
      </label>
      <div className="mt-2">{children}</div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 font-body text-xs text-white/60">
          {hint}
        </p>
      )}
      {error && <ErrorText id={id} error={error} />}
    </div>
  );
}

function ErrorText({ id, error }: { id: string; error: string }) {
  return (
    <p
      id={`${id}-error`}
      className="mt-1.5 flex items-start gap-1.5 font-body text-[13px] font-semibold text-red-400"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {error}
    </p>
  );
}

// The homepage RequestQuote form's service chips, exactly: amber fill when
// on, hairline outline when off. Real checkbox/radio inputs underneath
// (visually hidden), so they post with the form, take keyboard focus, and
// announce as a group.
const pillOff = "text-tnt-body border-white/15 hover:border-white/40 hover:text-white";
const pillBase = "rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors";

function ChipGroup({
  id,
  legend,
  name,
  type,
  options,
  required,
  error,
  checked,
  onToggle,
}: {
  id: string;
  legend: string;
  name: string;
  type: "checkbox" | "radio";
  options: string[];
  required?: boolean;
  error?: string;
  /** Controlled selection (checkbox groups that drive other UI). */
  checked?: string[];
  onToggle?: (value: string) => void;
}) {
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className={label}>
        {legend}
        {required && (
          <>
            <Req />
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o, i) => (
          <label key={o} className="cursor-pointer">
            <input
              type={type}
              name={name}
              value={o}
              // First chip carries the group's id, so the error summary
              // and focus-on-error land on the group.
              id={i === 0 ? id : undefined}
              checked={checked ? checked.includes(o) : undefined}
              onChange={onToggle ? () => onToggle(o) : undefined}
              aria-invalid={error ? true : undefined}
              className="peer sr-only"
            />
            <span
              className={`inline-block ${pillBase} ${pillOff} peer-checked:border-tnt-amber peer-checked:bg-tnt-amber peer-checked:text-black peer-focus-visible:ring-2 peer-focus-visible:ring-tnt-amber peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black`}
            >
              {o}
            </span>
          </label>
        ))}
      </div>
      {error && <ErrorText id={id} error={error} />}
    </fieldset>
  );
}

// Error state: a maroon border via an aria-attribute variant, so it can't
// lose a specificity fight with `field`'s own border-white/15.
const control = `${field} aria-[invalid=true]:border-red-400`;

function ErrorSummary({ errors, rules, idPrefix }: { errors: Errors; rules: Rule[]; idPrefix: string }) {
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  const labelFor = (k: string) =>
    k === "file" ? "Drawing or spec" : (rules.find((r) => r.name === k)?.label ?? k);
  return (
    <div role="alert" className="mb-6 rounded-lg border border-red-400/50 bg-red-400/[0.06] p-4">
      <p className="flex items-center gap-2 font-body text-sm font-bold text-red-400">
        <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
        {keys.length === 1 ? "1 field needs attention" : `${keys.length} fields need attention`}
      </p>
      <ul className="mt-2 space-y-1 pl-6">
        {keys.map((k) => (
          <li key={k} className="list-disc font-body text-[13px] text-red-400">
            <a
              href={`#${idPrefix}-${k}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`${idPrefix}-${k}`)?.focus();
              }}
              className="underline underline-offset-2 hover:no-underline"
            >
              {labelFor(k)}: {errors[k]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PendingNotice() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-tnt-amber/60 bg-tnt-amber/10 px-4 py-3 font-body text-[13px] leading-relaxed text-white/80">
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-tnt-amber" />
      <span>
        <strong className="font-semibold text-white">Online submission is being connected.</strong>{" "}
        Until it is, this form can&rsquo;t deliver your details to our team. For anything you need
        now, call{" "}
        <a href={MAIN_PHONE.href} className="font-semibold text-white underline underline-offset-2">
          {MAIN_PHONE.display}
        </a>{" "}
        or email{" "}
        <a href={`mailto:${MAIN_EMAIL}`} className="font-semibold text-white underline underline-offset-2">
          {MAIN_EMAIL}
        </a>
        .
      </span>
    </p>
  );
}

function ResultPanel({ status, mailto }: { status: Status; mailto: string | null }) {
  if ("state" in status) return null; // idle / submitting
  if (status.status === "sent") {
    return (
      <div role="status" className="mt-6 rounded-lg border border-white/15 bg-white/[0.03] p-5">
        <p className="font-display text-2xl tracking-wide text-white uppercase">Request sent</p>
        <p className="mt-2 font-body text-sm text-white/70">
          Thanks, we&rsquo;ve received your details. For anything urgent, call{" "}
          <a href={MAIN_PHONE.href} className="font-semibold text-white underline">
            {MAIN_PHONE.display}
          </a>
          .
        </p>
      </div>
    );
  }
  const failed = status.status === "failed";
  return (
    <div
      role={failed ? "alert" : "status"}
      className="mt-6 rounded-lg border border-red-400/50 bg-red-400/[0.06] p-5"
    >
      <p className="flex items-center gap-2 font-body text-base font-bold text-red-400">
        <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
        Your request was not sent
      </p>
      <p className="mt-2 font-body text-sm leading-relaxed text-white/75">
        {failed
          ? "Something went wrong on our side. Your details are still in the form, so you can try again, or reach us directly:"
          : "Online submissions aren’t connected yet, so nothing has been delivered to our team. Your details are still in the form. Please reach us directly:"}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button href={MAIN_PHONE.href} variant="primary" onDark arrow={false}>
          Call {MAIN_PHONE.display}
        </Button>
        {mailto && (
          <Button href={mailto} variant="secondary" onDark arrow={false}>
            Email these details
          </Button>
        )}
      </div>
      {mailto && (
        <p className="mt-3 font-body text-xs text-white/60">
          &ldquo;Email these details&rdquo; opens your own email app with this form pre-filled,
          addressed to {MAIN_EMAIL}.
        </p>
      )}
    </div>
  );
}

function SubmitRow({ status, children }: { status: Status; children: string }) {
  const submitting = "state" in status && status.state === "submitting";
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <Button type="submit" variant="primary" onDark>
        {submitting ? "Submitting…" : children}
      </Button>
      <span aria-live="polite" className="sr-only">
        {submitting ? "Submitting your request" : ""}
      </span>
    </div>
  );
}

/* ── The form ─────────────────────────────────────────────────────────── */

function QuoteForm({ initialService }: { initialService: string }) {
  const p = "cq";
  const { errors, status, mailto, onSubmit, recheck, a11y } = useContactForm("quote", QUOTE_RULES, p);
  const [services, setServices] = useState<string[]>(initialService ? [initialService] : []);
  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const submitting = "state" in status && status.state === "submitting";

  return (
    <form noValidate onSubmit={onSubmit} onBlur={recheck} onChange={recheck} aria-busy={submitting}>
      <ErrorSummary errors={errors} rules={QUOTE_RULES} idPrefix={p} />
      <p className="mb-5 font-body text-[13px] text-white/70">
        <span aria-hidden="true" className="text-tnt-amber">*</span> Required field
      </p>

      {/* Field-for-field the homepage RequestQuote form: contact, then job
          details, then services, dates, description, drawing. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${p}-name`} text="Full name" required error={errors.name}>
          <input {...a11y("name")} required autoComplete="name" className={control} />
        </Field>
        <Field id={`${p}-company`} text="Company">
          <input {...a11y("company")} autoComplete="organization" className={control} />
        </Field>
        <Field id={`${p}-email`} text="Email" required error={errors.email}>
          <input {...a11y("email")} type="email" required autoComplete="email" className={control} />
        </Field>
        <Field id={`${p}-phone`} text="Phone" required error={errors.phone}>
          <input {...a11y("phone")} type="tel" required autoComplete="tel" className={control} />
        </Field>
      </div>

      {/* Job details — where, what, and (if known) how big */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field id={`${p}-jobsiteZip`} text="Jobsite ZIP / postal code" required error={errors.jobsiteZip}>
          <input
            {...a11y("jobsiteZip")}
            required
            autoComplete="postal-code"
            placeholder="e.g. 77001"
            className={control}
          />
        </Field>
        <Field id={`${p}-craneType`} text="Crane type" required error={errors.craneType}>
          <select {...a11y("craneType")} required defaultValue="" className={control}>
            <option value="" disabled>
              Select a crane type
            </option>
            {CRANE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${p}-loadTons`} text="Load weight (tons)" optional>
          <input
            {...a11y("loadTons")}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="e.g. 40"
            className={control}
          />
        </Field>
        <Field id={`${p}-radiusFt`} text="Lift radius (ft)" optional>
          <input
            {...a11y("radiusFt")}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="e.g. 80"
            className={control}
          />
        </Field>
      </div>

      <div className="mt-6">
        <ChipGroup
          id={`${p}-services`}
          legend="Services required"
          name="services"
          type="checkbox"
          options={SERVICES}
          checked={services}
          onToggle={toggleService}
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field id={`${p}-start`} text="Start date">
          <input {...a11y("start")} type="date" className={control} />
        </Field>
        <Field id={`${p}-duration`} text="Estimated duration">
          <input {...a11y("duration")} placeholder="e.g. 3 days" className={control} />
        </Field>
      </div>

      <div className="mt-6 grid gap-6">
        <Field id={`${p}-description`} text="Project description">
          <textarea
            {...a11y("description")}
            rows={4}
            placeholder="Site conditions, access, lift height, anything else…"
            className={`${control} resize-y`}
          />
        </Field>
        <Field
          id={`${p}-file`}
          text="Attach a drawing or spec (optional)"
          error={errors.file}
          hint={`PDF, DWG, DXF, JPG or PNG, up to ${MAX_FILE_MB} MB.`}
        >
          <input
            {...a11y("file", true)}
            type="file"
            accept={FILE_EXTENSIONS.join(",")}
            className="block w-full font-body text-sm text-white/70 file:mr-4 file:rounded-md file:border-0 file:bg-tnt-amber file:px-4 file:py-2 file:font-semibold file:text-black hover:file:bg-tnt-amber-vivid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tnt-amber"
          />
        </Field>
      </div>

      {/* SMS consent — separate, optional, never pre-checked. Wording copied
          verbatim from the homepage RequestQuote form; ⚠ NOT YET APPROVED by
          TNT legal — confirm before launch (see the delivery report). */}
      <label className="mt-6 flex items-start gap-3 font-body text-[13px] leading-relaxed text-white/70">
        <input type="checkbox" name="consent" value="yes" className="mt-1 h-4 w-4 shrink-0 accent-tnt-amber" />
        <span>
          I agree to receive text messages from TNT Crane &amp; Rigging about my request. Reply STOP
          to opt out. Message &amp; data rates may apply.
        </span>
      </label>

      <div className="mt-8">
        <PendingNotice />
      </div>
      <SubmitRow status={status}>Submit request</SubmitRow>
      <ResultPanel status={status} mailto={mailto} />
    </form>
  );
}

/** `service` is a services.ts id from the URL (/contact?service=crane-rental),
 *  sent by service CTAs so a visitor doesn't pick it twice. Unknown ids are
 *  ignored rather than guessed at. */
export default function ContactForm({ service }: { service?: string }) {
  const initialService = CATALOG.find((s) => s.id === service)?.label ?? "";
  // The homepage form's card: rounded-2xl, hairline border, white on grey.
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-6 sm:p-8">
      <QuoteForm initialService={initialService} />
    </div>
  );
}
