/**
 * SERVICES — the one source of truth for what TNT sells and who offers it.
 *
 * Built 2026-10-09 for the /services page (Services Overview master brief)
 * and adopted site-wide the same day, on request: the nav's Services panel,
 * the homepage Full-Scope Capability cards, the footer, both forms and the
 * homepage branch map all read the catalog and the availability table from
 * here. Data only (no "use client") so server components and client islands
 * get the same values.
 *
 * THE SIX CORE SERVICES changed with this file: Heavy Haul & Transport is
 * core again, and Wind Energy moved to the /services page's Specialized
 * Capabilities (it isn't one identical service across the network — RMS runs
 * a dedicated wind division; the others support wind work regionally).
 *
 * AVAILABILITY replaces navigation.ts's old LOCATION_CONTENT region table,
 * which was labelled "editorial placeholder, not ops data", still carried
 * Allison Crane & Rigging (not on TNT's own family list) and left Industrial
 * Storage off RMS. This table is keyed by OPERATING COMPANY, not region —
 * Eagle West and TNT Canada share Western Canada but not a service list.
 *
 * Statuses:
 *   direct       — the company's own site advertises the service
 *   network      — sourced through another TNT company (stated as such)
 *   unconfirmed  — no evidence either way; the UI says "contact our team"
 *   not_offered  — the company has explicitly confirmed it doesn't offer it
 *
 * A service missing from a company's row is UNCONFIRMED, never not_offered:
 * missing website information is not a "no". Nothing below is not_offered.
 *
 * Evidence: aboutData.ts `offers` (audited 2026-10-08 against each company's
 * live site) plus the brief's stated corrections (RMS storage, JMS heavy
 * haul, JMS machinery relocation). TNT Crane & Rigging Canada's site names no
 * services, so its whole row is unconfirmed until the TNT team confirms it.
 */

export type ServiceId =
  | "crane-rental"
  | "specialized-rigging"
  | "machinery-moving"
  | "heavy-haul-transport"
  | "lift-planning-engineering"
  | "industrial-storage";

export type ServiceIcon = "rental" | "rigging" | "heavylift" | "transport" | "engineering" | "storage";

export type Service = {
  id: ServiceId;
  /** Two-digit position, shared by the nav panel and every card. */
  index: string;
  label: string;
  /** One line, for the nav, homepage cards and the branch map. */
  short: string;
  icon: ServiceIcon;
  /** Line-icon asset in public/icons for the homepage card's icon well. */
  glyph: string;
  /** Dedicated page, once one exists (Crane Rental, 2026-10-09). Services
   *  without one link to their card on /services. Always go through
   *  serviceHref() rather than building the URL by hand. */
  page?: string;
};

/** Order follows the brief: lift, rig, move, haul, plan, store. */
export const SERVICES: Service[] = [
  {
    id: "crane-rental",
    index: "01",
    label: "Crane Rental",
    short: "Operated crane rental — and bare rental where available — for construction, infrastructure and industrial lifts.",
    icon: "rental",
    glyph: "/icons/crane.svg",
    page: "/services/crane-rental",
  },
  {
    id: "specialized-rigging",
    index: "02",
    label: "Specialized Rigging",
    short: "Hydraulic gantries, jack-and-slide and precision positioning for loads a crane alone can't place.",
    icon: "rigging",
    glyph: "/icons/hook.svg",
  },
  {
    id: "machinery-moving",
    index: "03",
    label: "Machinery Moving",
    short: "Relocation, installation and precise positioning of industrial equipment and plant machinery.",
    icon: "heavylift",
    glyph: "/icons/forklift.svg",
  },
  {
    id: "heavy-haul-transport",
    index: "04",
    label: "Heavy Haul & Transport",
    short: "Oversized and overweight industrial loads moved by specialized trailers and on-site transport.",
    icon: "transport",
    glyph: "/icons/truck.svg",
  },
  {
    id: "lift-planning-engineering",
    index: "05",
    label: "Lift Planning & Engineering",
    short: "Critical lift plans, rigging diagrams and ground-bearing studies before equipment mobilizes.",
    icon: "engineering",
    glyph: "/icons/tower-crane.svg",
  },
  {
    id: "industrial-storage",
    index: "06",
    label: "Industrial Storage",
    short: "Indoor and outdoor equipment storage and staging at selected TNT facilities.",
    icon: "storage",
    glyph: "/icons/cart.svg",
  },
];

export const serviceById = (id: ServiceId) => SERVICES.find((s) => s.id === id)!;

/** Where a service lives: its own page, or its card on /services. */
export const serviceHref = (s: Service) => s.page ?? `/services#${s.id}`;

/** Form option list — the six plus the honest catch-all. */
export const SERVICE_OPTIONS = [...SERVICES.map((s) => s.label), "Other / Not Sure"];

/* ── Operating companies ──────────────────────────────────────────────── */

export type CompanyId = "tnt-us" | "southway" | "rms" | "jms" | "tnt-canada" | "eagle-west";

export type OperatingCompany = {
  id: CompanyId;
  /** Exactly Branch.brand in branchLocatorData.ts and REGIONAL_CONTACTS. */
  name: string;
  /** Short name for buttons and CTAs. */
  short: string;
  territory: string;
  country: "US" | "CA";
  /** null = no usable mark (TNT Canada shares TNT's; a second identical
   *  logo in a filter row reads as a duplicate). */
  logo: string | null;
};

export const COMPANIES: OperatingCompany[] = [
  { id: "tnt-us", name: "TNT Crane & Rigging", short: "TNT", territory: "Texas · Louisiana · Oklahoma", country: "US", logo: "/brand/tnt.svg" },
  { id: "southway", name: "Southway Crane & Rigging", short: "Southway", territory: "Georgia · Alabama · South Carolina · Florida", country: "US", logo: "/brand/southway.svg" },
  { id: "rms", name: "RMS Cranes", short: "RMS", territory: "Colorado · Wyoming · New Mexico", country: "US", logo: "/brand/rms-cranes.svg" },
  { id: "jms", name: "JMS Crane & Rigging", short: "JMS", territory: "Montana · South Dakota", country: "US", logo: "/brand/jms.svg" },
  { id: "tnt-canada", name: "TNT Crane & Rigging Canada", short: "TNT Canada", territory: "Alberta", country: "CA", logo: null },
  { id: "eagle-west", name: "Eagle West Crane & Rigging", short: "Eagle West", territory: "British Columbia", country: "CA", logo: "/brand/eagle-west.svg" },
];

export const companyByName = (name: string) => COMPANIES.find((c) => c.name === name) ?? null;

/* ── Availability ─────────────────────────────────────────────────────── */

export type Availability = "direct" | "network" | "unconfirmed" | "not_offered";

export type AvailabilityCell = { status: Availability; note?: string };

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  direct: "Offered directly",
  network: "Through the TNT network",
  unconfirmed: "Contact us to confirm",
  not_offered: "Not offered",
};

const D = (note?: string): AvailabilityCell => ({ status: "direct", note });

const AVAILABILITY: Record<CompanyId, Partial<Record<ServiceId, AvailabilityCell>>> = {
  "tnt-us": {
    "crane-rental": D(),
    "specialized-rigging": D(),
    "machinery-moving": D(),
    "lift-planning-engineering": D(),
    "industrial-storage": D("Buda (two sites), Houston and Dallas, TX"),
  },
  southway: {
    "crane-rental": D(),
    "specialized-rigging": D(),
    "machinery-moving": D(),
    "lift-planning-engineering": D(),
    "industrial-storage": D("Conyers, GA"),
  },
  rms: {
    "crane-rental": D("Including a dedicated wind division and tower cranes"),
    "specialized-rigging": D(),
    "machinery-moving": D(),
    "heavy-haul-transport": D("Heavy-haul trucking"),
    "lift-planning-engineering": D("Lift planning"),
    "industrial-storage": D("Henderson, CO"),
  },
  jms: {
    "crane-rental": D("Including bare crane rental"),
    "specialized-rigging": D("Jack and slide"),
    "machinery-moving": D("Machinery and equipment relocation"),
    "heavy-haul-transport": D("Heavy haul and on-site transport"),
    "lift-planning-engineering": D("Engineering services and custom fabrication"),
  },
  "tnt-canada": {},
  "eagle-west": {
    "crane-rental": {
      status: "direct",
      note: "Rail crane services; crawler cranes through the TNT network",
    },
    "machinery-moving": D("Industrial moving"),
  },
};

/** Status of one service at one company. Missing = unconfirmed, by design. */
export function availability(company: CompanyId, service: ServiceId): AvailabilityCell {
  return AVAILABILITY[company][service] ?? { status: "unconfirmed" };
}

/** Services a company offers directly or through the network, in catalog
 *  order. Empty means nothing is confirmed yet — callers must say so rather
 *  than render an empty list as "offers nothing". */
export function confirmedServices(company: CompanyId): Service[] {
  return SERVICES.filter((s) => {
    const st = availability(company, s.id).status;
    return st === "direct" || st === "network";
  });
}

export const CONFIRM_FALLBACK =
  "Contact our team to confirm service availability for your project location.";
