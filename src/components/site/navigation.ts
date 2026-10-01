/**
 * NAVIGATION IA — the single source of truth for the nav bar and mobile menu.
 *
 * The bar used to carry nine flat top-level links, four of which pointed at
 * single-section pages (/charts, /for-sale, /industries, /services). Those are
 * children wearing a parent's clothes, and eleven items in one 64px row is why
 * the desktop nav could not engage until `xl`. That was collapsed to four
 * grouped panels (Equipment / Services / Coverage / Company).
 *
 * 2026-09-10: respecified to eight top-level items, as supplied by the client
 * — Home · About · Services · Fleet · Careers · News · For Sale · Contact us.
 * Items that own real content keep their panel (About, Services, Fleet); the
 * rest are flat links with no caret. Two consequences worth knowing:
 *
 *  - Careers, News and For Sale carry `href: null`. Their routes went on
 *    2026-08-04 and nothing replaced them, so they render inert rather than
 *    linking nowhere. Give them a destination (a section, a route, or an
 *    external ATS link — the sister sites send Careers to a Paycom ATS) and
 *    they become live with no component change.
 *  - The old Coverage group's destinations (#coverage, #family) moved under
 *    About, which is now the only panel that reaches them. Nothing on the
 *    homepage became unreachable in the reshuffle.
 *
 * 2026-09-11: "Contact us" removed as its own top-level item, on request —
 * back to seven flat/paneled items across the bar. It moved into the About
 * panel's items instead of disappearing from the nav outright (see that
 * column below).
 *
 * Data only — no "use client" — so the mobile accordion, the desktop panels,
 * and any future sitemap render from the same list and cannot drift.
 *
 * Child hrefs deep-link to section ids that already exist in the page
 * components (`#services`, `#areas`, `#family`, …). The equipment classes and
 * the services/industries tiles get their per-item ids from the slugs below;
 * `slugify` is exported so those components derive the same id from the same
 * title rather than repeating a hand-written string.
 */

import type { IconName } from "./primitives";

/** Title → anchor id. Shared by the nav and by the sections it links into, so
 *  a renamed tile can never silently break its nav link. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type NavChild = {
  label: string;
  href: string;
  /** Numbered-catalog index, mirroring the section it links to. */
  index?: string;
  /** Right-aligned spec (tonnage, count). Mono, tabular. */
  meta?: string;
  icon?: IconName;
};

export type NavColumn = {
  /** Column heading, rendered as BLCK. NN like the footer. */
  no: string;
  heading: string;
  items: NavChild[];
};

/** Closing card on the right edge of a panel. */
export type NavFeature = {
  eyebrow: string;
  title: string;
  blurb: string;
  href: string;
  cta: string;
};

export type NavGroup = {
  label: string;
  /** The group's own landing anchor — the trigger is a real link, not a dead
   *  button, so the panel is an enhancement rather than the only way in.
   *
   *  `null` means the item has no destination on this site yet, and renders
   *  inert rather than as a link to nowhere — the same convention
   *  SiteFooter.tsx already uses for its unbuilt legal links. Careers, News
   *  and For Sale sit here (2026-09-10): the nav bar was specified with them,
   *  but their routes were deleted on 2026-08-04 and no section replaced them. */
  href: string | null;
  /** Empty on a flat item, which then opens no panel and shows no caret. */
  columns: NavColumn[];
  /** Omitted on flat items, which have no panel to close. */
  feature?: NavFeature;
};

export const NAV_GROUPS: NavGroup[] = [
  // Flat: the hero occupies #top, so this is the one item whose destination is
  // the page itself rather than a section within it.
  { label: "Home", href: "/#top", columns: [] },
  {
    label: "About",
    href: "/#statement",
    columns: [
      {
        no: "01",
        // Coverage Map and Family of Companies moved in here on 2026-09-10,
        // when the eight-item bar removed the Coverage group they used to sit
        // under. "Contact Us" briefly left in the other direction (it was a
        // top-level flat item, so repeating it here would have been the same
        // link twice) but came back 2026-09-11 when that top-level item was
        // removed — this panel is its only way into the nav now.
        heading: "About TNT",
        items: [
          // An /our-story route briefly lived here on 2026-08-06 and was
          // deleted the same day. This points back at the homepage's Statement
          // section, which is where "who we are" lives on a single-page site.
          { label: "Who We Are", href: "/#statement", icon: "commercial" },
          { label: "Coverage Map", href: "/#coverage", icon: "pin" },
          { label: "Family of Companies", href: "/#family", icon: "commercial" },
          { label: "Safety & Record", href: "/#safety", icon: "engineering" },
          // "Case Studies" (/#projects) removed 2026-09-18, on request —
          // it was a dead link: CaseStudies.tsx is unrendered on the
          // homepage (see page.tsx), so #projects doesn't exist. See
          // page.tsx's own note — the footer still links there too.
          { label: "Contact Us", href: "/#contact", icon: "mail" },
        ],
      },
      // Dropped with their routes on 2026-08-04, none having a homepage
      // section: the "Client Portal" column — Rental Agreements, Credit
      // Application and Payment Portal all pointed at /contact#self-service
      // (ClientSelfService, which the homepage does not render). Worth noting
      // the cross-check found NO sister site ships a client portal either.
    ],
    // The careers feature went with /careers on 2026-08-04. Replaced with the
    // iCARE safety program, which IS on the homepage (#safety) — copy drawn
    // from SafetyCulture rather than invented, so the panel still makes a point
    // instead of listing.
    feature: {
      eyebrow: "Safety",
      title: "iCARE, on every lift",
      blurb:
        "The safety program every crew works to — planned, briefed, and audited on site, from the first pick to the last.",
      href: "/#safety",
      cta: "See the program",
    },
  },
  {
    label: "Services",
    href: "/#services",
    columns: [
      {
        no: "01",
        heading: "Capabilities",
        items: [
          // JOURNEY order, matching the lifecycle in CoreServices — plan, lift,
          // rig, move, store, renewable. The panel and the section are one
          // numbering system or neither number means anything.
          //
          // Heavy Haul & Transport (was 05, "Transport") removed 2026-09-11,
          // on request — CoreServices.tsx renumbered to match, and the
          // "heavy-haul-transport" slug was dropped from every region's list
          // below rather than left pointing at a capability that no longer
          // renders.
          { index: "01", label: "Crane Rental", icon: "rental", href: `/#${slugify("Crane Rental")}` },
          // Wind Energy's card was dropped 2026-09-22 (a 4-card design
          // reference didn't have it, and tntcrane.com's real, current
          // service list doesn't either) then RESTORED 2026-09-23, on
          // request, when CoreServices.tsx reverted to its earlier 6-card
          // icon design (see that file's own docblock — the reference for
          // this restoration explicitly shows Wind Energy as card 06).
          // This nav entry was left in place as a dead link through the
          // whole 4/5-card period rather than removed, so it needed no
          // change to work again now that its card is back.
          { index: "02", label: "Lift Planning & Engineering", icon: "engineering", href: `/#${slugify("Lift Planning & Engineering")}` },
          // Labels below restored to match CoreServices.tsx's own restored
          // card titles (were shortened 2026-09-22 to match that day's
          // photo-card redesign, e.g. "Rigging"/"Heavy Lift"/"Industrial
          // Services" — those shorter titles are gone from the section
          // again, so the mismatch these hardcoded hrefs existed to bridge
          // no longer applies; slugify(label) matches CoreServices' ids
          // directly again).
          { index: "03", label: "Specialized Rigging", icon: "rigging", href: `/#${slugify("Specialized Rigging")}` },
          { index: "04", label: "Machinery Moving", icon: "heavylift", href: `/#${slugify("Machinery Moving")}` },
          { index: "05", label: "Industrial Storage", icon: "storage", href: `/#${slugify("Industrial Storage")}` },
          { index: "06", label: "Wind Energy", icon: "wind", href: `/#${slugify("Wind Energy")}` },
        ],
      },
      // The "Industries" column (Commercial / Industrial & Energy /
      // Infrastructure) went with /industries on 2026-08-04. Every item pointed
      // into that route and the homepage has no industries section, so the
      // column had nothing left to hold.
    ],
    feature: {
      eyebrow: "Single Scope",
      title: "Lift plan to final set",
      blurb:
        "Engineering, rigging, transport, and storage under one scope of work — stamped by in-house engineers before mobilization.",
      href: "/#quote",
      cta: "Talk to an engineer",
    },
  },
  {
    // Renamed from "Equipment" on 2026-09-10 to the client's "Fleet", then
    // to "Load Chart" on 2026-09-23, on request.
    //
    // /load-chart PAGE REMOVED, TITLES KEPT (2026-09-29, on request —
    // "Except all terrain Cranes page remove all the other individual
    // pages", then corrected same day: "Keep the title on the nav bar I ask
    // you to remove the page only"): only the /load-chart overview page
    // itself is gone — all 6 crane-type titles stay in this dropdown.
    // All-Terrain Cranes keeps its own dedicated page
    // (/load-chart/all-terrain-cranes); the other 5, with no page of their
    // own anymore, revert to what they were before /load-chart existed —
    // same-page anchors into the homepage's EquipmentGuide.tsx ("About the
    // Fleet"), via that section's own `id={slugify(t.name)}` per card.
    label: "Load Chart",
    href: "/load-chart/all-terrain-cranes",
    columns: [
      {
        no: "01",
        heading: "About the Fleet",
        items: [
          { index: "01", label: "All-Terrain Cranes", icon: "allterrain", href: "/load-chart/all-terrain-cranes" },
          { index: "02", label: "Crawler Cranes", icon: "crawler", href: `/#${slugify("Crawler Cranes")}` },
          { index: "03", label: "Hydraulic Truck Cranes", icon: "boom", href: `/#${slugify("Hydraulic Truck Cranes")}` },
          { index: "04", label: "Rough-Terrain Cranes", icon: "transport", href: `/#${slugify("Rough-Terrain Cranes")}` },
          { index: "05", label: "Carry Deck Cranes", icon: "carrydeck", href: `/#${slugify("Carry Deck Cranes")}` },
          { index: "06", label: "Tower Cranes", icon: "tower", href: `/#${slugify("Tower Cranes")}` },
        ],
      },
    ],
    feature: {
      eyebrow: "About the Fleet",
      title: "46 all-terrain models",
      blurb:
        "75 to 900 tons, every make TNT runs — search and filter the full chart by make or tonnage.",
      href: "/load-chart/all-terrain-cranes#capacity-chart",
      cta: "View Capacity Chart",
    },
  },
  // Flat top-level item, next to Load Chart (2026-09-30, on request — "add
  // safety needs next to load chart on the nav bar", label corrected same
  // day — "name it safety needs not safety"). Points at the same #safety
  // anchor (SafetyCulture.tsx's iCARE section) the About panel's "Safety &
  // Record" item and feature card already use — one real section, now
  // reachable two ways rather than a second copy of it.
  { label: "Safety Needs", href: "/#safety", columns: [] },
  // The three inert items. Each was a real route until 2026-08-04 and has no
  // homepage section, so there is nothing honest to point at yet — see the
  // `href` docs on NavGroup above.
  { label: "Careers", href: null, columns: [] },
  { label: "News", href: null, columns: [] },
  { label: "For Sale", href: null, columns: [] },
  // "Contact us" removed as a top-level item 2026-09-11, on request. It
  // moved back into the About panel's items (see that column above) rather
  // than disappearing from the nav entirely — it had only left there in the
  // first place because this flat item duplicated it.
];

/* ==========================================================================
 * SERVICES BY LOCATION
 *
 * The Services panel carries a location selector, because "do you do wind
 * turbine work" has a different answer in Billings than in Atlanta, and a
 * national list that quietly over-promises is worse than a shorter honest one.
 *
 * Regions and brands are the site's own taxonomy — the same six that
 * AreasServed renders and that CoverageMap's branches roll up into — so the nav
 * cannot invent a market the rest of the site doesn't serve.
 *
 * ⚠ THE AVAILABILITY MAPPING BELOW IS EDITORIAL PLACEHOLDER, NOT OPS DATA.
 * Which services and industries each region actually covers has to come from
 * the business. It is deliberately one flat table so replacing it is a single
 * edit and touches no component code. Service and industry keys are the same
 * slugs the columns above build their hrefs from, so a typo surfaces as a
 * missing row rather than a broken link.
 * ========================================================================== */

export type RegionId =
  | "gulf-coast"
  | "rocky-mountain"
  | "southeast"
  | "northeast-permian"
  | "northern-rockies"
  | "western-canada";

/** A city slug, or "all" for the unfiltered reset row. */
export type LocationId = string;

export type ServiceLocation = {
  id: LocationId;
  /** What the row shows — the city, because that's what a caller knows. */
  label: string;
  /** Which region's capability set this city inherits. null on "all". */
  region: RegionId | null;
  /** Operating brand. Carries the association the city name alone loses, and
   *  is the accessible name + the fallback when no logo exists. */
  brand: string;
  /** Brand mark in public/brand. null where the kit ships no logo. */
  logo: string | null;
};

// Cities are the same set AreasServed lists, so the nav can't offer a market
// the rest of the site doesn't claim. Ordered by market so same-brand cities
// cluster and the logo column reads as a grouping rather than noise.
//
// A market is NOT the same thing as a region. Western Canada is one region for
// capability purposes but two operating companies — Eagle West runs British
// Columbia, Stampede/TNT Canada runs Alberta (see FamilyOfCompanies) — so it
// splits into two entries that share a `region`. Calgary and Edmonton
// previously carried the Eagle West mark, which was simply wrong.
//
// LOGO COVERAGE (brand kit, Assets/*.zip — verified against the archives):
// TNT, Eagle West, JMS, RMS Cranes and Southway ship marks. Allison Crane &
// Rigging and Stampede/TNT Canada ship NONE. Those two carry `logo: null` and
// render their company name as text — the same fallback FamilyOfCompanies
// already uses — rather than a stand-in graphic.
const MARKETS: {
  region: RegionId;
  brand: string;
  logo: string | null;
  cities: string[];
}[] = [
  {
    region: "gulf-coast",
    brand: "TNT Crane & Rigging",
    logo: "/brand/tnt.svg",
    cities: [
      "Austin, TX",
      "Beaumont, TX",
      "Buda, TX",
      "Corpus Christi, TX",
      "Dallas, TX",
      "Edinburg, TX",
      "Fort Worth, TX",
      "Freeport, TX",
      "Houston, TX",
      "Midland, TX",
      "Norco, LA",
      "Oklahoma City, OK",
      "Pampa, TX",
      "San Antonio, TX",
      "St James, LA",
      "Tulsa, OK",
    ],
  },
  {
    region: "rocky-mountain",
    brand: "RMS Cranes",
    logo: "/brand/rms-cranes.svg",
    cities: ["Denver, CO", "Colorado Springs, CO", "Cheyenne, WY", "Casper, WY"],
  },
  {
    region: "southeast",
    brand: "Southway Crane & Rigging",
    logo: "/brand/southway.svg",
    cities: ["Atlanta, GA", "Savannah, GA", "Charleston, SC", "Birmingham, AL", "Jacksonville, FL"],
  },
  {
    region: "northeast-permian",
    brand: "Allison Crane & Rigging",
    logo: null, // MISSING from the brand kit
    cities: ["Williamsport, PA", "Pittsburgh, PA", "Pecos, TX"],
  },
  {
    region: "northern-rockies",
    brand: "JMS Crane & Rigging",
    logo: "/brand/jms.svg",
    cities: ["Billings, MT", "Bozeman, MT", "Soda Springs, ID"],
  },
  {
    region: "western-canada",
    brand: "Eagle West Crane & Rigging",
    logo: "/brand/eagle-west.svg",
    cities: ["Vancouver, BC", "Abbotsford, BC", "Kamloops, BC"], // British Columbia
  },
  {
    region: "western-canada",
    brand: "Stampede / TNT Canada",
    logo: null, // MISSING from the brand kit
    cities: ["Calgary, AB", "Edmonton, AB"], // Alberta
  },
];

export const SERVICE_LOCATIONS: ServiceLocation[] = [
  {
    id: "all",
    label: "All Locations",
    region: null,
    brand: "US & Canada network",
    logo: null,
  },
  ...MARKETS.flatMap((m) =>
    m.cities.map((city) => ({
      id: slugify(city),
      label: city,
      region: m.region,
      brand: m.brand,
      logo: m.logo,
    })),
  ),
];

/** Detailed location information including address, phone, email, and services */
export type LocationDetails = {
  branch: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  services: string[];
};

/** Complete location details for all TNT branches. Keyed by slugified city name. */
export const LOCATION_DETAILS: Record<string, LocationDetails> = {
  "austin-tx": {
    branch: "TNT Austin",
    address: "11701 Von Quintus Rd",
    city: "Austin",
    state: "TX",
    zip: "78719",
    phone: "1-512-501-1718",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "beaumont-tx": {
    branch: "TNT Beaumont",
    address: "5245 N Twin City Hwy",
    city: "Beaumont",
    state: "TX",
    zip: "77627",
    phone: "1-409-729-5600",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "buda-tx": {
    branch: "TNT Buda",
    address: "194 Commerce Cir Dr",
    city: "Buda",
    state: "TX",
    zip: "78610",
    phone: "1-800-799-2505",
    email: "info@tntcrane.com",
    services: ["Specialized Rigging & Machinery Moving", "Industrial Storage"],
  },
  "corpus-christi-tx": {
    branch: "TNT Corpus Christi",
    address: "6485 I-37",
    city: "Corpus Christi",
    state: "TX",
    zip: "78409",
    phone: "1-361-289-5438",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "dallas-tx": {
    branch: "TNT Dallas",
    address: "10733 Spangler Rd",
    city: "Dallas",
    state: "TX",
    zip: "75220",
    phone: "1-214-432-3761",
    email: "info@tntcrane.com",
    services: ["Specialized Rigging & Machinery Moving", "Industrial Storage"],
  },
  "edinburg-tx": {
    branch: "TNT Edinburg",
    address: "1621 E Iowa Rd",
    city: "Edinburg",
    state: "TX",
    zip: "78542",
    phone: "1-956-287-1700",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "fort-worth-tx": {
    branch: "TNT Fort Worth",
    address: "1315 Riverside Dr",
    city: "Fort Worth",
    state: "TX",
    zip: "76111",
    phone: "1-817-558-0809",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "freeport-tx": {
    branch: "TNT Freeport",
    address: "1949 Victoria Ln",
    city: "Freeport",
    state: "TX",
    zip: "77541",
    phone: "1-979-271-3545",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "houston-tx": {
    branch: "TNT Houston",
    address: "925 S Loop W",
    city: "Houston",
    state: "TX",
    zip: "77054",
    phone: "1-713-644-6113",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "midland-tx": {
    branch: "TNT Midland",
    address: "9112 W County Rd 127",
    city: "Midland",
    state: "TX",
    zip: "79706",
    phone: "1-432-242-4980",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "norco-la": {
    branch: "TNT Norco",
    address: "578 Goodhope St",
    city: "Norco",
    state: "LA",
    zip: "70079",
    phone: "1-985-764-6551",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "oklahoma-city-ok": {
    branch: "TNT Oklahoma City",
    address: "8020 SW 74th St",
    city: "Oklahoma City",
    state: "OK",
    zip: "73169",
    phone: "1-405-745-2318",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "pampa-tx": {
    branch: "TNT Pampa",
    address: "12475 US-60",
    city: "Pampa",
    state: "TX",
    zip: "79065",
    phone: "1-806-686-3880",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "san-antonio-tx": {
    branch: "TNT San Antonio",
    address: "14616 I-10",
    city: "San Antonio",
    state: "TX",
    zip: "78124",
    phone: "1-210-656-7900",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "st-james-la": {
    branch: "TNT St James",
    address: "10162 Frontage St",
    city: "St James",
    state: "LA",
    zip: "70086",
    phone: "1-225-473-1500",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
  "tulsa-ok": {
    branch: "TNT Tulsa",
    address: "4812 S Sheridan Rd suite 604",
    city: "Tulsa",
    state: "OK",
    zip: "74145",
    phone: "1-918-221-0269",
    email: "info@tntcrane.com",
    services: ["Crane Rental", "Specialized Rigging & Machinery Moving", "Industrial Storage", "Lift Planning & Engineering"],
  },
};

/** The region a location belongs to, or null for "all" / unknown ids. */
export function regionOf(locationId: LocationId): RegionId | null {
  return SERVICE_LOCATIONS.find((l) => l.id === locationId)?.region ?? null;
}

export type FamilyBrand = { brand: string; logo: string };

/**
 * The TNT family companies that ship a usable mark, deduped and in market
 * order. Derived from MARKETS rather than hand-listed so it cannot drift from
 * the city→company mapping.
 *
 * Allison Crane & Rigging and Stampede/TNT Canada are absent because the brand
 * kit contains no logo for either — "available" is meant literally here, and a
 * stand-in graphic would misrepresent the kit.
 */
export const FAMILY_BRANDS: FamilyBrand[] = (() => {
  const seen = new Set<string>();
  const out: FamilyBrand[] = [];
  for (const m of MARKETS) {
    if (!m.logo || seen.has(m.brand)) continue;
    seen.add(m.brand);
    out.push({ brand: m.brand, logo: m.logo });
  }
  return out;
})();

export type FamilyFilter = FamilyBrand & { locationId: LocationId };

/** One filter target per operating company, using its first market city. */
export const FAMILY_FILTERS: FamilyFilter[] = FAMILY_BRANDS.map((brand) => {
  const location = SERVICE_LOCATIONS.find((entry) => entry.brand === brand.brand);
  return { ...brand, locationId: location?.id ?? "all" };
});

/** The operating company for one location — mark if the kit has one. */
export function brandOf(locationId: LocationId): {
  brand: string;
  logo: string | null;
} | null {
  const loc = SERVICE_LOCATIONS.find((l) => l.id === locationId);
  if (!loc?.region) return null;
  return { brand: loc.brand, logo: loc.logo };
}

type LocationContent = {
  services: string[];
  industries: string[];
  feature: NavFeature;
};

const LOCATION_CONTENT: Record<RegionId, LocationContent> = {
  "gulf-coast": {
    services: [
      "crane-rental",
      "specialized-rigging",
      "machinery-moving",
      "lift-planning-engineering",
      "industrial-storage",
      "wind-energy",
    ],
    industries: ["industrial-energy", "infrastructure", "commercial"],
    feature: {
      eyebrow: "Gulf Coast",
      title: "Turnaround-ready crews",
      blurb:
        "Refinery and petrochemical turnarounds out of Houston, Corpus Christi, and Baton Rouge — planned months ahead, staffed around the clock.",
      href: "/#quote",
      cta: "Plan a turnaround",
    },
  },
  "rocky-mountain": {
    services: [
      "crane-rental",
      "specialized-rigging",
      "machinery-moving",
      "lift-planning-engineering",
      "wind-energy",
    ],
    industries: ["industrial-energy", "infrastructure"],
    feature: {
      eyebrow: "Rocky Mountain",
      title: "High-altitude wind work",
      blurb:
        "RMS crews run turbine erection and component exchange across Colorado and Wyoming, with heavy haul over mountain permits.",
      href: "/#quote",
      cta: "Talk to RMS",
    },
  },
  southeast: {
    services: [
      "crane-rental",
      "specialized-rigging",
      "machinery-moving",
      "lift-planning-engineering",
    ],
    industries: ["commercial", "infrastructure"],
    feature: {
      eyebrow: "Southeast",
      title: "Commercial build support",
      blurb:
        "Southway covers steel sets, HVAC placement, and long-duration site cranes from Atlanta through the Carolina and Florida coasts.",
      href: "/#quote",
      cta: "Talk to Southway",
    },
  },
  "northeast-permian": {
    services: [
      "crane-rental",
      "specialized-rigging",
      "machinery-moving",
      "lift-planning-engineering",
      "industrial-storage",
    ],
    industries: ["industrial-energy", "commercial"],
    feature: {
      eyebrow: "Northeast & Permian",
      title: "Two basins, one desk",
      blurb:
        "Allison runs Pennsylvania industrial work and West Texas basin support on the same dispatch, with yard storage at both ends.",
      href: "/#quote",
      cta: "Talk to Allison",
    },
  },
  "northern-rockies": {
    services: [
      "crane-rental",
      "specialized-rigging",
      "lift-planning-engineering",
      "wind-energy",
    ],
    industries: ["industrial-energy", "infrastructure"],
    feature: {
      eyebrow: "Northern Rockies",
      title: "Remote-site mobilization",
      blurb:
        "JMS reaches sites the highway doesn't — Montana and Idaho wind, mining, and utility work with self-contained crews.",
      href: "/#quote",
      cta: "Talk to JMS",
    },
  },
  "western-canada": {
    services: [
      "crane-rental",
      "specialized-rigging",
      "machinery-moving",
      "lift-planning-engineering",
      "wind-energy",
    ],
    industries: ["commercial", "infrastructure", "industrial-energy"],
    feature: {
      eyebrow: "Western Canada",
      title: "BC and Alberta coverage",
      blurb:
        "Eagle West and TNT Canada cover Vancouver tower work through Calgary and Edmonton industrial, under Canadian certification.",
      href: "/#quote",
      cta: "Talk to TNT Canada",
    },
  },
};

/** The Services group as-authored — "All Locations" is simply this, unfiltered. */
const SERVICES_GROUP = NAV_GROUPS.find((g) => g.label === "Services")!;

/**
 * Services panel content for a location, or for a set of operating companies.
 * Returns the same shape the panel renders for any other group, so the
 * location layer stays out of the view: the component asks for columns and a
 * feature and paints them.
 *
 * A picked city wins over the company filter — it is the narrower answer.
 * With no city, `brands` (the multi-select logo row) filters to the UNION of
 * what those companies' regions offer: picking RMS and Southway asks "what can
 * either of you do", not "what can both". An empty `brands` means no filter.
 *
 * Columns that filter down to nothing are dropped rather than rendered empty —
 * a heading over a blank space reads as a loading bug.
 */
export function servicesPanelFor(
  locationId: LocationId,
  brands: string[] = [],
): {
  columns: NavColumn[];
  feature: NavFeature;
} {
  const loc = SERVICE_LOCATIONS.find((l) => l.id === locationId);
  const regions: RegionId[] = loc?.region
    ? [loc.region]
    : [
        ...new Set(
          SERVICE_LOCATIONS.filter(
            (l) => l.region && brands.includes(l.brand),
          ).map((l) => l.region as RegionId),
        ),
      ];
  if (regions.length === 0) {
    return { columns: SERVICES_GROUP.columns, feature: SERVICES_GROUP.feature! };
  }
  const services = new Set(regions.flatMap((r) => LOCATION_CONTENT[r].services));
  const industries = new Set(
    regions.flatMap((r) => LOCATION_CONTENT[r].industries),
  );
  const allow = (heading: string) =>
    heading === "Industries" ? industries : services;

  const columns = SERVICES_GROUP.columns
    .map((col) => ({
      ...col,
      items: col.items.filter((item) => {
        const slug = item.href.split("#")[1];
        return slug ? allow(col.heading).has(slug) : true;
      }),
    }))
    .filter((col) => col.items.length > 0);

  // The eyebrow names what you picked, not the region — you asked for Houston
  // (or for RMS), so the panel should say that back to you. Region copy still
  // carries the body, since that's the level the capability set is defined at.
  // Several companies spanning regions have no single region story to tell,
  // so they get the network-wide card under a count.
  if (loc?.region) {
    return {
      columns,
      feature: { ...LOCATION_CONTENT[loc.region].feature, eyebrow: loc.label },
    };
  }
  if (regions.length === 1) {
    return {
      columns,
      feature: {
        ...LOCATION_CONTENT[regions[0]].feature,
        eyebrow: brands.length === 1 ? brands[0] : `${brands.length} companies`,
      },
    };
  }
  return {
    columns,
    feature: { ...SERVICES_GROUP.feature!, eyebrow: `${brands.length} companies` },
  };
}

/**
 * Service labels available in a region, in journey order.
 *
 * The branch locator lists what each branch's operating company actually does,
 * and this is where that already lives — deriving from it means the map and the
 * mega panel can never disagree about RMS's coverage. `null` means no regional
 * restriction (TNT-operated branches carry the full scope).
 *
 * Inherits the caveat on LOCATION_CONTENT: the availability mapping is
 * editorial placeholder until the business supplies the real thing.
 */
export function servicesForRegion(region: RegionId | null): string[] {
  const items = SERVICES_GROUP.columns[0].items;
  if (!region) return items.map((i) => i.label);
  const allowed = LOCATION_CONTENT[region].services;
  return items
    .filter((i) => allowed.includes(i.href.split("#")[1] ?? ""))
    .map((i) => i.label);
}

/** Routes that no longer sit at top level but must still resolve to a group so
 *  the trigger can show an active state when you land on them directly.
 *
 *  EMPTY since 2026-08-04: the site is a single page, so there is no second
 *  pathname to attribute to a group. Every entry here (/charts, /for-sale,
 *  /industries, /careers) named a route that no longer exists. Kept as the hook
 *  rather than deleted — if a real route is ever added back, this is where it
 *  reattaches to its trigger. With it empty, `activeGroup("/")` returns null and
 *  no trigger shows a current state, which is correct when every destination
 *  lives on the page you are already on. */
const EXTRA_ROUTES: Record<string, string> = {
  // Empty: the site is a single page, so there is no second pathname to
  // attribute to a group. Add an entry here if a real route is ever added back.
};

/** Which group (if any) owns the current pathname. */
export function activeGroup(pathname: string): string | null {
  const extra = EXTRA_ROUTES[pathname];
  if (extra) return extra;
  const hit = NAV_GROUPS.find((g) => g.href !== null && g.href === pathname);
  return hit ? hit.label : null;
}
