/**
 * REGIONAL CONTACTS — each operating company's published phone and email.
 *
 * Source: the Contact Us brief (2026-10-08), cross-checked against
 * ContactSection.tsx's Regional Dispatch list for the four numbers both
 * carry. Data only (no "use client"), so server components, the branch
 * dataset and client islands all read the same values.
 *
 * Used by:
 *   - branchLocatorData.ts — a branch with no per-branch number of its own
 *     falls back to its company's line here (replacing the 555 placeholders
 *     that used to fill that gap), flagged `phone.source = "regional"`.
 *   - the /contact page's Regional Contact Directory.
 *
 * ContactSection.tsx (homepage) still carries its own copy — left untouched
 * under the homepage-protection rule. Keep the two in step by hand.
 *
 * `email: null` = the company publishes none (JMS). Never fill it with a
 * guessed address.
 */

export type ContactLine = { label?: string; display: string; href: string };

export type RegionalContact = {
  /** Matches Branch.brand in branchLocatorData.ts exactly. */
  brand: string;
  /** Short territory line — states/provinces from the About page footprint. */
  territory: string;
  country: "US" | "CA";
  phones: ContactLine[];
  email: string | null;
  website: { label: string; href: string };
};

/** "1-800-335-3148" / "(406) 839-5035" → "tel:+18003353148" / "tel:+14068395035". */
export function telHref(display: string): string {
  const digits = display.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

const line = (display: string, label?: string): ContactLine => ({
  label,
  display,
  href: telHref(display),
});

export const REGIONAL_CONTACTS: RegionalContact[] = [
  {
    brand: "TNT Crane & Rigging",
    territory: "Texas · Louisiana · Oklahoma",
    country: "US",
    phones: [line("1-800-799-2505")],
    email: "info@tntcrane.com",
    website: { label: "tntcrane.com", href: "https://www.tntcrane.com" },
  },
  {
    brand: "Southway Crane & Rigging",
    territory: "Georgia · Alabama · South Carolina · Florida",
    country: "US",
    phones: [line("1-800-335-3148")],
    email: "info@southwaycrane.com",
    website: { label: "southwaycrane.com", href: "https://www.southwaycrane.com" },
  },
  {
    brand: "RMS Cranes",
    territory: "Colorado · Wyoming · New Mexico",
    country: "US",
    phones: [line("1-800-588-7095")],
    email: "info@rmscranes.com",
    website: { label: "rmscranes.com", href: "https://www.rmscranes.com" },
  },
  {
    brand: "JMS Crane & Rigging",
    territory: "Montana · South Dakota",
    country: "US",
    phones: [line("(406) 839-5035")],
    email: null,
    website: { label: "jmscraneandrigging.com", href: "https://www.jmscraneandrigging.com" },
  },
  {
    brand: "TNT Crane & Rigging Canada",
    territory: "Alberta",
    country: "CA",
    phones: [
      line("1-833-479-7833", "Edmonton / Fort McMurray"),
      line("1-877-571-5711", "Calgary"),
      line("1-855-548-8117", "Southern Alberta"),
    ],
    email: "info@tntcrane.ca",
    website: { label: "tntcrane.ca", href: "https://www.tntcrane.ca" },
  },
  {
    brand: "Eagle West Crane & Rigging",
    territory: "British Columbia",
    country: "CA",
    phones: [line("1-800-667-2215")],
    email: "info@eaglewestcranes.com",
    website: { label: "eaglewestcranes.com", href: "https://www.eaglewestcranes.com" },
  },
];

export function contactFor(brand: string): RegionalContact | undefined {
  return REGIONAL_CONTACTS.find((c) => c.brand === brand);
}
