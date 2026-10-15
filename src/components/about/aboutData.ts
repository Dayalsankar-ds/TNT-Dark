/**
 * ABOUT PAGE CONTENT — every fact here is sourced; nothing is filler.
 * Sources (audited 2026-10-08 against each company's live website):
 *   - 1985 founding in Houston: supplied in the About page brief.
 *   - Southway acquired December 2012: southwaycrane.com homepage.
 *   - TNT enters Canada in 2014 by acquiring Stampede Crane & Rigging and
 *     Eagle West Cranes: Crane Briefing trade press
 *     (cranebriefing.com, "TNT Crane & Rigging enters international market…").
 *   - RMS Cranes merged with TNT in 2015: rmscranes.com homepage; Vertikal.
 *   - Branch cities, regions, services: each company's own contact/services
 *     pages (tntcrane.com, southwaycrane.com, rmscranes.com, tntcrane.ca,
 *     eaglewestcranes.com, jmscraneandrigging.com).
 *
 * DELIBERATELY NOT HERE: founding dates for the regional companies, a JMS
 * acquisition year, and how TNT Canada relates to the 2014 Stampede
 * acquisition — none is published. Allison Crane & Rigging is excluded on
 * request (it isn't on TNT's own Family of Companies list). Fuller company
 * histories are still to come from the TNT team; when they arrive, they go
 * in `story` below.
 */

import { SERVICES, type ServiceId } from "@/components/site/services";

export type Milestone = {
  id: string;
  /** Shown big; "Today" for the closing chapter. */
  year: string;
  /** Short chapter title, e.g. "The first lift". */
  chapter: string;
  /** Where the story moves to. */
  place: string;
  body: string;
  /** Logos joining in this chapter (public paths). */
  logos: { src: string; alt: string }[];
};

export const MILESTONES: Milestone[] = [
  {
    id: "1985",
    year: "1985",
    chapter: "The first lift",
    place: "Houston, Texas",
    body: "TNT Crane & Rigging is founded on the Texas Gulf Coast. One city, one standard: show up, plan the lift, and get it right.",
    logos: [{ src: "/brand/tnt.svg", alt: "TNT Crane & Rigging" }],
  },
  {
    id: "2012",
    year: "2012",
    chapter: "Heading southeast",
    place: "Georgia · Alabama · South Carolina · Florida",
    body: "In December, Southway Crane & Rigging of Atlanta joins TNT, keeping its name and its Southeastern customer relationships, now with TNT's fleet behind it.",
    logos: [{ src: "/brand/southway.svg", alt: "Southway Crane & Rigging" }],
  },
  {
    id: "2014",
    year: "2014",
    chapter: "North of the border",
    place: "Alberta · British Columbia",
    body: "TNT enters Canada by acquiring Stampede Crane & Rigging and Eagle West Cranes, and the family becomes North American.",
    logos: [{ src: "/brand/eagle-west.svg", alt: "Eagle West Crane & Rigging" }],
  },
  {
    id: "2015",
    year: "2015",
    chapter: "Into the Rockies",
    place: "Colorado · Wyoming · New Mexico",
    body: "Denver's RMS Cranes merges with TNT, bringing Rocky Mountain crews and know-how into the network.",
    logos: [{ src: "/brand/rms-cranes.svg", alt: "RMS Cranes" }],
  },
  {
    id: "today",
    year: "Today",
    chapter: "Different names. One TNT.",
    place: "United States & Canada",
    body: "Six regional identities, one connected organization, and now one website, so every customer can see the whole family behind their local crew.",
    logos: [],
  },
];

export type Company = {
  id: string;
  name: string;
  /** Logo shown in the selector and panel. */
  logo: string;
  /** Small label under the logo, for identities that share a logo. */
  logoTag?: string;
  region: string;
  base: string;
  /** How it relates to TNT — wording kept to what's published. */
  relationship: string;
  story: string;
  /** Branch cities as listed on the company's own site. */
  locations: string[];
  /** Capabilities named on the company's own site. Empty = the site names
   *  none, and the panel leaves the list out rather than guessing. */
  offers: string[];
  website: { label: string; href: string };
};

export const PARENT: Company = {
  id: "tnt-us",
  name: "TNT Crane & Rigging",
  logo: "/brand/tnt.svg",
  region: "Texas · Louisiana · Oklahoma",
  base: "Houston, Texas",
  relationship: "Parent company, founded 1985",
  story:
    "Where it all started. The fleet, engineering, and iCARE safety program behind every company in the family are TNT's.",
  locations: [
    "Austin", "Beaumont", "Buda", "Corpus Christi", "Dallas", "Edinburg", "Houston",
    "and more across Texas, Louisiana & Oklahoma",
  ],
  offers: ["Crane Rental", "Specialized Rigging", "Machinery Moving", "Industrial Storage", "Engineering"],
  website: { label: "tntcrane.com", href: "https://www.tntcrane.com" },
};

export const COMPANIES: Company[] = [
  {
    id: "southway",
    name: "Southway Crane & Rigging",
    logo: "/brand/southway.svg",
    region: "Georgia · Alabama · South Carolina · Florida",
    base: "Atlanta, Georgia",
    relationship: "Part of the TNT family since December 2012",
    story:
      "Twelve Southeastern branches, from Ringgold to Tallahassee, each listed as open 24 hours.",
    locations: [
      "Albany", "Atlanta", "Birmingham", "Byron", "Conyers", "Lexington", "Montgomery",
      "Midway", "North Augusta", "Port Wentworth", "Ringgold", "Valdosta",
    ],
    offers: ["Crane Rental", "Specialized Rigging", "Machinery Moving", "Industrial Storage", "Engineering"],
    website: { label: "southwaycrane.com", href: "https://www.southwaycrane.com" },
  },
  {
    id: "rms",
    name: "RMS Cranes",
    logo: "/brand/rms-cranes.svg",
    region: "Colorado · Wyoming · New Mexico",
    base: "Denver, Colorado",
    relationship: "Merged with TNT in 2015",
    story:
      "Six branches across Colorado, Wyoming and New Mexico, headquartered in Denver.",
    locations: ["Denver", "Henderson", "Colorado Springs", "Windsor", "Casper", "Albuquerque"],
    offers: [
      "Crane Rental", "Specialized Rigging", "Machinery Moving", "Industrial Storage",
      "Heavy-Haul Trucking", "Lift Planning",
    ],
    website: { label: "rmscranes.com", href: "https://www.rmscranes.com" },
  },
  {
    id: "eagle-west",
    name: "Eagle West Crane & Rigging",
    logo: "/brand/eagle-west.svg",
    region: "British Columbia",
    base: "Abbotsford, British Columbia",
    relationship: "Joined TNT in 2014",
    story:
      "British Columbia's TNT family member, from the Fraser Valley to the Interior, including a TNT/MNBC partnership with the Métis Nation of British Columbia.",
    locations: ["Abbotsford", "Chilliwack", "Vancouver", "Kamloops", "Kelowna"],
    offers: ["Industrial Moving", "Crawler cranes through the TNT network", "Precast concrete plant (Chilliwack)"],
    website: { label: "eaglewestcranes.com", href: "https://www.eaglewestcranes.com" },
  },
  {
    id: "jms",
    name: "JMS Crane & Rigging",
    logo: "/brand/jms.svg",
    region: "Montana · South Dakota",
    base: "Billings, Montana",
    relationship: "Part of the TNT family of companies",
    story: "Montana-based crane, transport and engineering services, reaching across Montana and South Dakota.",
    locations: ["Billings", "Sioux Falls"],
    offers: [
      "Bare Crane Rental", "Heavy Haul", "Jack and Slide", "On-Site Transport", "Engineering Services",
    ],
    website: { label: "jmscraneandrigging.com", href: "https://www.jmscraneandrigging.com" },
  },
  {
    id: "tnt-canada",
    name: "TNT Crane & Rigging Canada",
    logo: "/brand/tnt.svg",
    logoTag: "Canada",
    region: "Alberta",
    base: "Alberta, Canada",
    relationship: "TNT's Canadian operations, serving Alberta",
    story:
      "TNT under its own name in Alberta, from Fort McMurray to Medicine Hat, with every branch open 24 hours, 7 days a week.",
    locations: ["Edmonton (Leduc)", "Fort McMurray", "Calgary", "Lethbridge", "Brooks", "Medicine Hat (Redcliff)"],
    offers: [],
    website: { label: "tntcrane.ca", href: "https://www.tntcrane.ca" },
  },
];

export type Capability = {
  id: string;
  title: string;
  body: string;
  /** Real TNT photography only (see photos.ts provenance). Null = no photo. */
  photo: { src: string; alt: string } | null;
};

/** The six services from services.ts (site-wide catalog since 2026-10-09 —
 *  Heavy Haul & Transport replaced Wind Energy as a core service). Copy is
 *  the catalog's own one-liner; only the photo is About-specific. */
const CAPABILITY_PHOTOS: Record<ServiceId, Capability["photo"]> = {
  "crane-rental": {
    src: "/photos/services/crane-rental-at-crane-cooler-lift.jpg",
    alt: "TNT Crane & Rigging all-terrain crane mid-lift at a commercial site",
  },
  "specialized-rigging": {
    src: "/photos/rigging/cantilever-spreader-bar.jpg",
    alt: "TNT cantilever spreader bar rigged below a crawler crane hook beside a high-rise",
  },
  "machinery-moving": {
    src: "/photos/rigging/versa-lift-machinery-moving.jpg",
    alt: "TNT Versa-Lift moving a large transformer",
  },
  "heavy-haul-transport": {
    src: "/photos/rigging/spmt-modular-transport.jpg",
    alt: "Self-propelled modular transporter carrying a large transformer",
  },
  "lift-planning-engineering": {
    src: "/photos/cases/tnt-142-refinery-reactor-exchange.jpg",
    alt: "Large crawler crane rigged for a heavy lift at a refinery",
  },
  "industrial-storage": null,
};

export const CAPABILITIES: Capability[] = SERVICES.map((s) => ({
  id: s.id,
  title: s.label,
  body: s.short,
  photo: CAPABILITY_PHOTOS[s.id],
}));
