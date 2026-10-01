/**
 * BRANCH LOCATOR DATA — branches and their capabilities. Built on the SERVER.
 *
 * Branches store real lat/lng, which is what MapLibre consumes directly. That
 * choice already paid off once: this file previously projected every branch
 * into a dotted-map coordinate space, and swapping the backdrop for MapLibre
 * needed no change to the data at all.
 *
 * SERVICES come from navigation.ts via the operating brand, not a new table —
 * capability varies by operating company, and the mega panel already defines
 * it. One source, so the map and the nav can't disagree.
 */

import { servicesForRegion, slugify, LOCATION_DETAILS, type RegionId } from "./navigation";

export type Country = "US" | "CA";

type Seed = {
  id: string;
  city: string;
  /** Full state/province name, so "Texas" matches as well as "TX". */
  state: string;
  region: string;
  /** Operating TNT-family brand — the consolidation bridge. */
  brand: string;
  country: Country;
  lat: number;
  lng: number;
};

export type Branch = Seed & {
  /** Capabilities this branch's operating company actually offers. */
  services: string[];
  /** Real per-branch line where navigation.ts's LOCATION_DETAILS has one
   *  (currently the 16 TNT Crane & Rigging branches); a DUMMY placeholder
   *  otherwise — see DUMMY PHONE NUMBERS below. */
  phone: { display: string; href: string };
  /** Full street address + zip, real data from navigation.ts's
   *  LOCATION_DETAILS. Undefined where no real address exists yet (every
   *  branch outside TNT Crane & Rigging) — omit the address in the UI
   *  rather than showing a fabricated one. */
  address?: { street: string; zip: string };
};

/**
 * Capability scope by operating company. TNT-operated branches carry the full
 * scope (null = unrestricted); the acquired brands inherit their region's set.
 */
const BRAND_REGION: Record<string, RegionId | null> = {
  "TNT Crane & Rigging": null,
  "TNT Canada": "western-canada",
  "RMS Cranes": "rocky-mountain",
  "JMS Crane & Rigging": "northern-rockies",
  "Southway Crane & Rigging": "southeast",
  "Allison Crane & Rigging": "northeast-permian",
  "Eagle West Cranes": "western-canada",
};

/**
 * DUMMY PHONE NUMBERS — FALLBACK ONLY (2026-09-23, on request — "each
 * location has an individual contact number... use dummy for now, we'll
 * collect the real ones from the TNT team later"). Every branch had been
 * sharing its BRAND's one real dispatch number (ContactSection.tsx's
 * Regional Dispatch list) — accurate but not per-LOCATION, which is what
 * was asked for.
 *
 * NARROWED TO A FALLBACK (2026-09-29): real per-branch numbers turned up in
 * navigation.ts's LOCATION_DETAILS (added for the Services location picker)
 * for the 16 TNT Crane & Rigging branches — buildBranchLocator() below uses
 * those directly now. This generator only fires for the other 28 branches,
 * which still have no real number on file.
 *
 * These are UNMISTAKABLY placeholders, not real numbers: "555-555-01XX"
 * doubles up on the NANP's own reserved fictional exchange (555-0100–
 * 555-0199 is set aside across North America for exactly this — movies,
 * mockups, etc. — so it can never collide with a real assigned number), one
 * per branch by its position in SEEDS below.
 *
 * REPLACE WITH REAL PER-BRANCH NUMBERS FROM THE TNT TEAM before this ships —
 * search the codebase for "555-555-01" to find every spot that needs one.
 */
function dummyPhone(index: number): { display: string; href: string } {
  const n = String(index).padStart(2, "0"); // 01 → 44, one per branch below
  return { display: `(555) 555-01${n}`, href: `tel:+155555501${n}` };
}

// All 44 branches across the TNT family of brands
const SEEDS: Seed[] = [
  // TNT Crane & Rigging (16)
  { id: "aus", city: "Austin, TX", state: "Texas", region: "Central Texas", brand: "TNT Crane & Rigging", country: "US", lat: 30.1935, lng: -97.665 },
  { id: "bea", city: "Beaumont, TX", state: "Texas", region: "Southeast Texas", brand: "TNT Crane & Rigging", country: "US", lat: 29.9803, lng: -93.9946 },
  { id: "bud", city: "Buda, TX", state: "Texas", region: "Central Texas", brand: "TNT Crane & Rigging", country: "US", lat: 30.0825, lng: -97.8417 },
  { id: "cor", city: "Corpus Christi, TX", state: "Texas", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 27.8449, lng: -97.5672 },
  { id: "dal", city: "Dallas, TX", state: "Texas", region: "North Texas", brand: "TNT Crane & Rigging", country: "US", lat: 32.877, lng: -96.9139 },
  { id: "edi", city: "Edinburg, TX", state: "Texas", region: "Rio Grande Valley", brand: "TNT Crane & Rigging", country: "US", lat: 26.281, lng: -98.1487 },
  { id: "ftw", city: "Fort Worth, TX", state: "Texas", region: "North Texas", brand: "TNT Crane & Rigging", country: "US", lat: 32.7536, lng: -97.3028 },
  { id: "fre", city: "Freeport, TX", state: "Texas", region: "Brazoria", brand: "TNT Crane & Rigging", country: "US", lat: 28.9497, lng: -95.3461 },
  { id: "hou", city: "Houston, TX", state: "Texas", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 29.6796, lng: -95.4008 },
  { id: "mid", city: "Midland, TX", state: "Texas", region: "Permian Basin", brand: "TNT Crane & Rigging", country: "US", lat: 31.9974, lng: -102.0779 },
  { id: "nor", city: "Norco, LA", state: "Louisiana", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 30.0093, lng: -90.4076 },
  { id: "okc", city: "Oklahoma City, OK", state: "Oklahoma", region: "Central Oklahoma", brand: "TNT Crane & Rigging", country: "US", lat: 35.3903, lng: -97.6544 },
  { id: "pam", city: "Pampa, TX", state: "Texas", region: "Texas Panhandle", brand: "TNT Crane & Rigging", country: "US", lat: 35.5258, lng: -100.977 },
  { id: "sat", city: "San Antonio, TX", state: "Texas", region: "South Central", brand: "TNT Crane & Rigging", country: "US", lat: 29.5713, lng: -98.1403 },
  { id: "stj", city: "St James, LA", state: "Louisiana", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 30.0097, lng: -90.799 },
  { id: "tul", city: "Tulsa, OK", state: "Oklahoma", region: "Northeast Oklahoma", brand: "TNT Crane & Rigging", country: "US", lat: 36.1563, lng: -95.9928 },

  // RMS Cranes (6)
  { id: "abq", city: "Albuquerque, NM", state: "New Mexico", region: "New Mexico", brand: "RMS Cranes", country: "US", lat: 35.005, lng: -106.6614 },
  { id: "cas", city: "Casper, WY", state: "Wyoming", region: "Wyoming", brand: "RMS Cranes", country: "US", lat: 42.8501, lng: -106.3251 },
  { id: "cos", city: "Colorado Springs, CO", state: "Colorado", region: "Southern Colorado", brand: "RMS Cranes", country: "US", lat: 38.8838, lng: -104.8095 },
  { id: "den", city: "Denver, CO", state: "Colorado", region: "Front Range", brand: "RMS Cranes", country: "US", lat: 39.8129, lng: -104.7733 },
  { id: "win", city: "Windsor, CO", state: "Colorado", region: "Northern Colorado", brand: "RMS Cranes", country: "US", lat: 40.4743, lng: -104.8812 },
  { id: "hen", city: "Denver, CO", state: "Colorado", region: "Front Range", brand: "RMS Cranes", country: "US", lat: 39.9205, lng: -104.8658 },

  // Southway Crane & Rigging (12)
  { id: "alb", city: "Albany, GA", state: "Georgia", region: "Southwest Georgia", brand: "Southway Crane & Rigging", country: "US", lat: 31.5913, lng: -84.1328 },
  { id: "atl", city: "Atlanta, GA", state: "Georgia", region: "Metro Atlanta", brand: "Southway Crane & Rigging", country: "US", lat: 33.7545, lng: -84.3898 },
  { id: "bhm", city: "Birmingham, AL", state: "Alabama", region: "Central Alabama", brand: "Southway Crane & Rigging", country: "US", lat: 33.5453, lng: -86.8184 },
  { id: "rgg", city: "Ringgold, GA", state: "Georgia", region: "Northwest Georgia", brand: "Southway Crane & Rigging", country: "US", lat: 34.9127, lng: -85.1319 },
  { id: "lex", city: "Lexington, SC", state: "South Carolina", region: "Midlands SC", brand: "Southway Crane & Rigging", country: "US", lat: 33.9472, lng: -81.2466 },
  { id: "con", city: "Conyers, GA", state: "Georgia", region: "Metro Atlanta", brand: "Southway Crane & Rigging", country: "US", lat: 33.6679, lng: -83.9855 },
  { id: "byr", city: "Byron, GA", state: "Georgia", region: "Middle Georgia", brand: "Southway Crane & Rigging", country: "US", lat: 32.6515, lng: -83.7451 },
  { id: "mgm", city: "Montgomery, AL", state: "Alabama", region: "Central Alabama", brand: "Southway Crane & Rigging", country: "US", lat: 32.3927, lng: -86.309 },
  { id: "nau", city: "North Augusta, SC", state: "South Carolina", region: "CSRA", brand: "Southway Crane & Rigging", country: "US", lat: 33.4943, lng: -81.9706 },
  { id: "pwt", city: "Port Wentworth, GA", state: "Georgia", region: "Coastal Georgia", brand: "Southway Crane & Rigging", country: "US", lat: 32.1953, lng: -81.1904 },
  { id: "mdw", city: "Midway, FL", state: "Florida", region: "Big Bend Florida", brand: "Southway Crane & Rigging", country: "US", lat: 30.4938, lng: -84.4263 },
  { id: "val", city: "Valdosta, GA", state: "Georgia", region: "South Georgia", brand: "Southway Crane & Rigging", country: "US", lat: 30.8096, lng: -83.2712 },

  // JMS Crane & Rigging (1)
  { id: "bil", city: "Billings, MT", state: "Montana", region: "Southern Montana", brand: "JMS Crane & Rigging", country: "US", lat: 45.7436, lng: -108.5624 },

  // TNT Canada (6)
  { id: "brk", city: "Brooks, AB", state: "Alberta", region: "Southern Alberta", brand: "TNT Canada", country: "CA", lat: 50.5589, lng: -111.8928 },
  { id: "cal", city: "Calgary, AB", state: "Alberta", region: "Southern Alberta", brand: "TNT Canada", country: "CA", lat: 51.3699, lng: -114.0142 },
  { id: "edm", city: "Edmonton, AB", state: "Alberta", region: "Central Alberta", brand: "TNT Canada", country: "CA", lat: 53.2608, lng: -113.5512 },
  { id: "fmm", city: "Fort McMurray, AB", state: "Alberta", region: "Northern Alberta", brand: "TNT Canada", country: "CA", lat: 56.6761, lng: -111.353 },
  { id: "let", city: "Lethbridge, AB", state: "Alberta", region: "Southern Alberta", brand: "TNT Canada", country: "CA", lat: 49.7373, lng: -112.789 },
  { id: "mh", city: "Medicine Hat, AB", state: "Alberta", region: "Southern Alberta", brand: "TNT Canada", country: "CA", lat: 50.0803, lng: -110.7618 },

  // Eagle West Cranes (3)
  { id: "abb", city: "Abbotsford, BC", state: "British Columbia", region: "Fraser Valley", brand: "Eagle West Cranes", country: "CA", lat: 49.0399, lng: -122.3575 },
  { id: "chi", city: "Chilliwack, BC", state: "British Columbia", region: "Fraser Valley", brand: "Eagle West Cranes", country: "CA", lat: 49.0645, lng: -122.0376 },
  { id: "kam", city: "Kamloops, BC", state: "British Columbia", region: "Southern Interior BC", brand: "Eagle West Cranes", country: "CA", lat: 50.6575, lng: -120.1097 },
];

export type BranchLocatorData = {
  branches: Branch[];
};

export function buildBranchLocator(): BranchLocatorData {
  return {
    branches: SEEDS.map((b, i) => {
      // slugify(b.city) matches LOCATION_DETAILS's own keys exactly — both
      // are built from "City, ST" strings the same way (e.g. "Houston, TX"
      // → "houston-tx").
      const details = LOCATION_DETAILS[slugify(b.city)];
      return {
        ...b,
        services: servicesForRegion(BRAND_REGION[b.brand] ?? null),
        phone: details
          ? { display: details.phone, href: `tel:+${details.phone.replace(/\D/g, "")}` }
          : dummyPhone(i + 1),
        address: details ? { street: details.address, zip: details.zip } : undefined,
      };
    }),
  };
}
