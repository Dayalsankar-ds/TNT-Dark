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
import { COMPANIES, SERVICES, confirmedServices, serviceHref, type CompanyId } from "./services";

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
  /** Catalog id (services.ts) for items the Services location filter can
   *  narrow — matched on this, not on the href, since a dedicated page
   *  (/services/crane-rental) carries no #id. */
  id?: string;
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
    href: "/about",
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
          // Who We Are + Family of Companies point at the /about page
          // (2026-10-08, approved); the rest stay homepage sections.
          { label: "Who We Are", href: "/about", icon: "commercial" },
          { label: "Coverage Map", href: "/#coverage", icon: "pin" },
          { label: "Family of Companies", href: "/about#family-of-companies", icon: "commercial" },
          { label: "Safety & Record", href: "/#safety", icon: "engineering" },
          // "Case Studies" (/#projects) removed 2026-09-18, on request —
          // it was a dead link: CaseStudies.tsx is unrendered on the
          // homepage (see page.tsx), so #projects doesn't exist. See
          // page.tsx's own note — the footer still links there too.
          { label: "Contact Us", href: "/contact", icon: "mail" },
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
    // /services is a real page as of 2026-10-09 (Services Overview brief),
    // so the trigger links there and every item deep-links to its detail
    // block on that page. Items come from services.ts — the one catalog the
    // homepage cards, footer, forms and branch map also read — so the panel
    // can't drift from them. Heavy Haul & Transport is core again; Wind
    // Energy moved to /services#specialized (see services.ts).
    label: "Services",
    href: "/services",
    columns: [
      {
        no: "01",
        heading: "Capabilities",
        items: SERVICES.map((s) => ({
          index: s.index,
          label: s.label,
          icon: s.icon,
          href: serviceHref(s),
          id: s.id,
        })),
      },
    ],
    // "Stamped by in-house engineers" dropped 2026-10-09: the brief rules out
    // promising engineer-stamped plans network-wide without confirmation.
    feature: {
      eyebrow: "Single Scope",
      title: "Lift plan to final set",
      blurb:
        "Lifting, rigging, transport, engineering and storage, coordinated across the TNT family of companies.",
      href: "/services",
      cta: "Explore all services",
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
  // Contact Us replaced the inert "Careers" item in this slot (2026-10-08,
  // on request). Repointed the same day from the homepage's /#contact
  // section to the dedicated /contact page, on request — which also gives
  // it an active state there via activeGroup().
  { label: "Contact Us", href: "/contact", columns: [] },
  // The inert items. Each was a real route until 2026-08-04 and has no
  // page or homepage section, so there is nothing honest to point at yet —
  // see the `href` docs on NavGroup above. Careers was removed for Contact
  // Us and brought back beside it the same day (2026-10-08, on request).
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
 * The Services panel carries a location selector, because "do you do heavy
 * haul" has a different answer in Billings than in Atlanta, and a national
 * list that quietly over-promises is worse than a shorter honest one.
 *
 * Rebuilt 2026-10-09 around services.ts: availability is per OPERATING
 * COMPANY (not per region) and comes from that file's audited table. The old
 * region table here was editorial placeholder and included Allison Crane &
 * Rigging, which isn't on TNT's own family list — it's gone, and the city
 * list below is now the audited branch list (branchLocatorData.ts SEEDS),
 * replacing cities no company site lists (Cheyenne, Savannah, Charleston,
 * Jacksonville, Pecos, …).
 * ========================================================================== */

/** A city slug, or "all" for the unfiltered reset row. */
export type LocationId = string;

export type ServiceLocation = {
  id: LocationId;
  /** What the row shows — the city, because that's what a caller knows. */
  label: string;
  /** Operating company whose services this city inherits. null on "all". */
  company: CompanyId | null;
  /** Operating brand. Carries the association the city name alone loses, and
   *  is the accessible name + the fallback when no logo exists. */
  brand: string;
  /** Brand mark in public/brand. null where no distinct mark exists. */
  logo: string | null;
};

// Same cities, same companies as the branch map (branchLocatorData.ts SEEDS)
// — kept as labels here rather than imported, because that file imports this
// one. Change both together.
const MARKET_CITIES: Record<CompanyId, string[]> = {
  "tnt-us": [
    "Austin, TX", "Beaumont, TX", "Buda, TX", "Corpus Christi, TX", "Dallas, TX",
    "Edinburg, TX", "Fort Worth, TX", "Freeport, TX", "Houston, TX", "Midland, TX",
    "Norco, LA", "Oklahoma City, OK", "Pampa, TX", "San Antonio, TX", "St James, LA",
    "Tulsa, OK",
  ],
  rms: [
    "Denver, CO", "Henderson, CO", "Colorado Springs, CO", "Windsor, CO",
    "Casper, WY", "Albuquerque, NM",
  ],
  southway: [
    "Albany, GA", "Atlanta, GA", "Birmingham, AL", "Byron, GA", "Conyers, GA",
    "Lexington, SC", "Midway, FL", "Montgomery, AL", "North Augusta, SC",
    "Port Wentworth, GA", "Ringgold, GA", "Valdosta, GA",
  ],
  jms: ["Billings, MT", "Sioux Falls, SD"],
  "eagle-west": ["Abbotsford, BC", "Chilliwack, BC", "Kamloops, BC", "Kelowna, BC", "Vancouver, BC"],
  "tnt-canada": [
    "Edmonton, AB", "Fort McMurray, AB", "Calgary, AB", "Lethbridge, AB",
    "Brooks, AB", "Medicine Hat, AB",
  ],
};

export const SERVICE_LOCATIONS: ServiceLocation[] = [
  {
    id: "all",
    label: "All Locations",
    company: null,
    brand: "US & Canada network",
    logo: null,
  },
  ...COMPANIES.flatMap((c) =>
    MARKET_CITIES[c.id].map((city) => ({
      id: slugify(city),
      label: city,
      company: c.id,
      brand: c.name,
      logo: c.logo,
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

export type FamilyBrand = { brand: string; logo: string };

/** The family companies with a distinct mark, in catalog order (TNT Canada
 *  shares TNT's, so it has none here — it's still reachable by its cities). */
export const FAMILY_BRANDS: FamilyBrand[] = COMPANIES.filter((c) => c.logo).map((c) => ({
  brand: c.name,
  logo: c.logo!,
}));

export type FamilyFilter = FamilyBrand & { locationId: LocationId };

/** One filter target per operating company, using its first market city. */
export const FAMILY_FILTERS: FamilyFilter[] = FAMILY_BRANDS.map((brand) => {
  const location = SERVICE_LOCATIONS.find((entry) => entry.brand === brand.brand);
  return { ...brand, locationId: location?.id ?? "all" };
});

/**
 * Closing card per company. Copy is limited to what aboutData.ts and
 * services.ts can back — the old region cards made claims nothing sourced
 * (Baton Rouge turnarounds, "self-contained crews", Allison's dispatch).
 */
const COMPANY_FEATURE: Record<CompanyId, NavFeature> = {
  "tnt-us": {
    eyebrow: "Texas · Louisiana · Oklahoma",
    title: "Where TNT started",
    blurb: "Sixteen branches across the Gulf Coast and the Southern Plains, with industrial storage in Buda, Houston and Dallas.",
    href: "/services#availability",
    cta: "See regional services",
  },
  southway: {
    eyebrow: "Southeast",
    title: "Southway Crane & Rigging",
    blurb: "Twelve branches from Ringgold to Midway, with industrial storage in Conyers, Georgia.",
    href: "/services#availability",
    cta: "See regional services",
  },
  rms: {
    eyebrow: "Rocky Mountain",
    title: "RMS Cranes",
    blurb: "Colorado, Wyoming and New Mexico, including heavy-haul trucking, a dedicated wind division and tower cranes.",
    href: "/services#availability",
    cta: "See regional services",
  },
  jms: {
    eyebrow: "Montana · South Dakota",
    title: "JMS Crane & Rigging",
    blurb: "Crane, heavy-haul and engineering services out of Billings and Sioux Falls, including bare crane rental.",
    href: "/services#availability",
    cta: "See regional services",
  },
  "tnt-canada": {
    eyebrow: "Alberta",
    title: "TNT Crane & Rigging Canada",
    blurb: "Six Alberta branches, from Fort McMurray to Medicine Hat. Contact our team to confirm services for your project.",
    href: "/contact",
    cta: "Contact our team",
  },
  "eagle-west": {
    eyebrow: "British Columbia",
    title: "Eagle West Crane & Rigging",
    blurb: "Fraser Valley to the Interior, including rail crane services and precast concrete from Chilliwack.",
    href: "/services#availability",
    cta: "See regional services",
  },
};

/** The Services group as-authored — "All Locations" is simply this, unfiltered. */
const SERVICES_GROUP = NAV_GROUPS.find((g) => g.label === "Services")!;

/**
 * Services panel content for a location, or for a set of operating companies.
 * Returns the same shape the panel renders for any other group, so the
 * location layer stays out of the view.
 *
 * A picked city wins over the company filter — it is the narrower answer.
 * With no city, `brands` filters to the UNION of what those companies offer:
 * picking RMS and Southway asks "what can either of you do". An empty
 * `brands` means no filter.
 *
 * Only direct/network services are listed. When nothing is confirmed for the
 * selection (TNT Canada today), the full list stays and the closing card says
 * to confirm with the team — an empty panel would read as "offers nothing".
 */
export function servicesPanelFor(
  locationId: LocationId,
  brands: string[] = [],
): {
  columns: NavColumn[];
  feature: NavFeature;
} {
  const loc = SERVICE_LOCATIONS.find((l) => l.id === locationId);
  const companies: CompanyId[] = loc?.company
    ? [loc.company]
    : COMPANIES.filter((c) => brands.includes(c.name)).map((c) => c.id);
  if (companies.length === 0) {
    return { columns: SERVICES_GROUP.columns, feature: SERVICES_GROUP.feature! };
  }
  const allowed = new Set(companies.flatMap((c) => confirmedServices(c).map((s) => s.id as string)));

  const columns =
    allowed.size === 0
      ? SERVICES_GROUP.columns
      : SERVICES_GROUP.columns
          .map((col) => ({
            ...col,
            items: col.items.filter((item) => allowed.has(item.id ?? "")),
          }))
          .filter((col) => col.items.length > 0);

  // A picked city is named back in the eyebrow (you asked for Houston); a
  // picked company keeps its territory eyebrow, since the card's title
  // already names it. Several companies get the network-wide card under a
  // count.
  if (companies.length === 1) {
    return {
      columns,
      feature: {
        ...COMPANY_FEATURE[companies[0]],
        eyebrow: loc?.company ? loc.label : COMPANY_FEATURE[companies[0]].eyebrow,
      },
    };
  }
  return {
    columns,
    feature: { ...SERVICES_GROUP.feature!, eyebrow: `${companies.length} companies` },
  };
}

/** Routes that no longer sit at top level but must still resolve to a group so
 *  the trigger can show an active state when you land on them directly.
 *
 *  Empty from 2026-08-04 until /services/crane-rental (2026-10-09), the
 *  first service with its own page — add each new /services/* page here so
 *  the Services trigger stays lit on it. */
const EXTRA_ROUTES: Record<string, string> = {
  "/services/crane-rental": "Services",
};

/** Which group (if any) owns the current pathname. */
export function activeGroup(pathname: string): string | null {
  const extra = EXTRA_ROUTES[pathname];
  if (extra) return extra;
  const hit = NAV_GROUPS.find((g) => g.href !== null && g.href === pathname);
  return hit ? hit.label : null;
}
