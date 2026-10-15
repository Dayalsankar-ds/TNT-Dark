/**
 * /services PAGE CONTENT — built 2026-10-09 from the Services Overview master
 * brief. The catalog itself (names, ids, one-liners, who offers what) lives
 * in src/components/site/services.ts; this file only holds what the page
 * says beyond that.
 *
 * CONTENT RULES (from the brief, applied throughout):
 *   - No capacities, fleet counts, certifications, statistics or results.
 *   - Capability lists are GROUP-LEVEL — the page says so, and each card's
 *     "offered directly by" line comes from the availability table.
 *   - Scope caveats ("where available", "selected facilities") stay in the
 *     copy wherever the brief flagged one.
 *   - Photos are the real TNT/RMS photography registered in photos.ts. No
 *     storage photo exists, so that card shows a labelled placeholder.
 *
 * PENDING APPROVAL — every item here is the brief's working copy, not final
 * operational sign-off. Specifically unconfirmed: storage facility list and
 * climate control, bare-rental coverage, and the How We Work process.
 */

import type { ServiceId } from "@/components/site/services";

export type Photo = { src: string; alt: string };

export type ServiceDetail = {
  description: string;
  /** Heading over the chip list — "Key capabilities", "Applications", … */
  listLabel: string;
  items: string[];
  /** Optional second list (Machinery Moving's example equipment). */
  extra?: { label: string; items: string[] };
  /** Scope caveat, shown in small type under the lists. */
  scope?: string;
  photo: Photo | null;
};

export const SERVICE_DETAILS: Record<ServiceId, ServiceDetail> = {
  "crane-rental": {
    description:
      "Mobile, crawler, rough-terrain and specialized crane rental for construction, infrastructure and industrial lifting.",
    listLabel: "Crane types across the network",
    items: [
      "All-Terrain Cranes",
      "Hydraulic Truck Cranes",
      "Crawler Cranes",
      "Rough-Terrain Cranes",
      "Carry Deck Cranes",
      "Boom Trucks",
      "Tower Cranes",
      "Telescopic Crawler Cranes",
      "Stiff-Boom Cranes",
      "Folding / Knuckle-Boom Cranes",
    ],
    extra: { label: "Rental options", items: ["Operated crane rental", "Bare crane rental, where available"] },
    scope:
      "Crane types are group-level categories. Not every type, or bare rental, is available at every location.",
    photo: {
      src: "/photos/services/crane-rental-at-crane-cooler-lift.jpg",
      alt: "TNT Crane & Rigging all-terrain crane mid-lift at a commercial site",
    },
  },
  "specialized-rigging": {
    description:
      "Specialized lifting, positioning and load-handling for complex industrial equipment and heavy machinery.",
    listLabel: "Key capabilities",
    items: [
      "Hydraulic Gantry Systems",
      "Jack-and-Slide Systems",
      "Hydraulic Jacks",
      "Machinery Skates",
      "Cantilever Bars",
      "Specialized Rigging Forklifts",
      "Self-Propelled Modular Transporters (SPMTs)",
    ],
    photo: {
      src: "/photos/rigging/hydraulic-gantry.jpg",
      alt: "TNT hydraulic gantry setting a heavy vessel-sized load",
    },
  },
  "machinery-moving": {
    description:
      "Relocation, positioning and installation of industrial equipment in demanding plant and facility environments.",
    listLabel: "Applications",
    items: [
      "Industrial Equipment Relocation",
      "Plant Equipment Moving",
      "Equipment Installation",
      "Precision Positioning",
      "Machinery Removal",
      "Facility Relocation Support",
    ],
    extra: {
      label: "Example equipment",
      items: [
        "CNC Machines",
        "Industrial Presses",
        "Generators",
        "Transformers",
        "Chillers",
        "Data Center Equipment",
        "MRI Equipment",
        "Industrial Vaults",
      ],
    },
    scope: "Examples of typical applications, not a guarantee of availability at every location.",
    photo: {
      src: "/photos/rigging/versa-lift-machinery-moving.jpg",
      alt: "TNT Versa-Lift moving a large transformer",
    },
  },
  "heavy-haul-transport": {
    description:
      "Specialized transportation for oversized, overweight and complex industrial loads.",
    listLabel: "Key capabilities",
    items: [
      "Heavy-Haul Trucking",
      "Oversized Load Transportation",
      "Specialized Trailers",
      "Industrial Equipment Transportation",
      "On-Site Heavy Transport",
      "SPMT Transportation",
      "Transport Planning",
    ],
    scope:
      "RMS Cranes and JMS Crane & Rigging offer heavy haul directly. Transport capabilities differ across the rest of the network.",
    photo: {
      src: "/photos/rigging/spmt-modular-transport.jpg",
      alt: "Self-propelled modular transporter carrying a large transformer",
    },
  },
  "lift-planning-engineering": {
    description:
      "Engineering expertise and detailed planning to support complex lifting, rigging and industrial operations.",
    listLabel: "Key capabilities",
    items: [
      "Critical Lift Planning",
      "Engineered Lift Plans",
      "Rigging Diagrams",
      "Ground-Bearing Studies",
      "Wind Condition Assessments",
      "Lift Feasibility Studies",
      "Transport Route Studies",
      "Specialized Equipment Design",
      "Custom Fabrication, where available",
    ],
    scope: "Engineering deliverables are scoped per project; confirm what your project needs with our team.",
    photo: {
      src: "/photos/rigging/cantilever-spreader-bar.jpg",
      alt: "TNT cantilever spreader bar rigged below a crawler crane hook beside a high-rise",
    },
  },
  "industrial-storage": {
    description:
      "Equipment storage, staging and handling at selected TNT facilities, backed by crane and rigging resources.",
    listLabel: "Key capabilities",
    items: [
      "Indoor Storage",
      "Outdoor Storage",
      "Climate-Controlled Storage, where available",
      "Equipment Staging",
      "Industrial Equipment Handling",
      "Crane and Rigging Support",
    ],
    extra: {
      label: "Storage locations",
      items: ["Buda, TX (two sites)", "Houston, TX", "Dallas, TX", "Conyers, GA", "Henderson, CO"],
    },
    scope: "Storage features differ by facility. Confirm current availability for your location.",
    photo: null,
  },
};

/* ── Specialized capabilities ─────────────────────────────────────────── */

export type Specialized = {
  id: string;
  title: string;
  /** Who offers it — attribution the brief requires. */
  provider: string;
  items: string[];
  /** Only routes/anchors that exist. Wind, rail and precast have no page
   *  yet, so they send the visitor to a person instead of a dead link. */
  link: { href: string; label: string };
  note?: string;
};

export const SPECIALIZED: Specialized[] = [
  {
    id: "wind-energy",
    title: "Wind Energy",
    provider: "RMS Cranes wind division · regional support elsewhere",
    items: [
      "Wind Turbine Component Lifting",
      "Rotor Assembly",
      "Nacelle Lifting",
      "Maintenance Support",
      "Repowering",
      "Decommissioning",
      "Gearbox and Component Handling",
    ],
    link: { href: "/contact", label: "Discuss a wind project" },
  },
  {
    id: "tower-cranes",
    title: "Tower Cranes",
    provider: "RMS Cranes",
    items: [
      "Self-Erecting Tower Cranes",
      "Flat-Top Tower Cranes",
      "Hammerhead Tower Cranes",
      "Luffing Tower Cranes",
      "Erection and Dismantling Support",
    ],
    link: { href: "/#tower-cranes", label: "See tower cranes in the fleet" },
  },
  {
    id: "rail-crane-services",
    title: "Rail Crane Services",
    provider: "Eagle West Crane & Rigging",
    items: ["Rail Infrastructure Lifting", "Road-and-Rail Crane Operations", "Railway Construction Support"],
    link: { href: "/contact", label: "Talk to our team" },
  },
  {
    id: "precast-concrete",
    title: "Precast Concrete",
    provider: "Eagle West Crane & Rigging · Chilliwack, BC",
    items: ["Road Barriers", "OCTA-BLOC Products", "Parking Curbs", "Related Precast Products"],
    link: { href: "/contact", label: "Ask about precast products" },
    note: "A product and installation offering, not crane rental.",
  },
  {
    id: "custom-fabrication",
    title: "Custom Fabrication",
    provider: "JMS Crane & Rigging",
    items: ["Custom Equipment Design", "Special Fabrication", "Project-Specific Equipment Solutions"],
    link: { href: "#lift-planning-engineering", label: "See Lift Planning & Engineering" },
  },
];

/* ── Crane rental preview ─────────────────────────────────────────────── */

export type CraneType = {
  name: string;
  application: string;
  /** null = no rights-cleared photo of this class yet. */
  photo: (Photo & { stock?: boolean }) | null;
  link: { href: string; label: string };
};

// Fleet anchors (/#crawler-cranes …) are EquipmentGuide.tsx's per-type ids;
// All-Terrain has its own load-chart page. Boom Trucks and Carry Deck have
// no real TNT photo — the Unsplash truck-mounted boom crane photos.ts files
// under "carryDeckCrane" is, by its own note, really a boom truck, so it's
// used for Boom Trucks here and tagged as stock.
export const CRANE_TYPES: CraneType[] = [
  {
    name: "All-Terrain Cranes",
    application: "Road-legal telescopic cranes with off-road capability, for sites that need a crane on the move.",
    photo: { src: "/photos/fleet/all-terrain-crane.jpg", alt: "Red TNT all-terrain crane lifting in downtown Houston" },
    link: { href: "/load-chart/all-terrain-cranes", label: "View load charts" },
  },
  {
    name: "Crawler Cranes",
    application: "Tracked lattice-boom cranes for heavy, long-duration lifts on prepared ground.",
    photo: { src: "/photos/fleet/crawler-crane.jpg", alt: "TNT crawler crane setting bridge girders over a creek" },
    link: { href: "/#crawler-cranes", label: "Explore" },
  },
  {
    name: "Rough-Terrain Cranes",
    application: "Compact four-wheel-drive cranes for unpaved and uneven job sites.",
    photo: {
      src: "https://images.unsplash.com/photo-1597089038854-6be9a836a40d?fm=jpg&q=70&w=800&auto=format&fit=crop",
      alt: "Mobile crane boom and hook block against the sky",
      stock: true,
    },
    link: { href: "/#rough-terrain-cranes", label: "Explore" },
  },
  {
    name: "Hydraulic Truck Cranes",
    application: "Telescopic cranes that travel on public roads and set up quickly on arrival.",
    photo: {
      src: "/photos/fleet/hydraulic-truck-crane.jpg",
      alt: "A line of TNT hydraulic truck cranes lifting a pipeline section",
    },
    link: { href: "/#hydraulic-truck-cranes", label: "Explore" },
  },
  {
    name: "Carry Deck Cranes",
    application: "Low-profile pick-and-carry cranes for plants, warehouses and tight spaces.",
    photo: null,
    link: { href: "/#carry-deck-cranes", label: "Explore" },
  },
  {
    name: "Boom Trucks",
    application: "Truck-mounted cranes for lighter picks, deliveries and material placement.",
    photo: {
      src: "https://images.unsplash.com/photo-1583246820648-e06ee5e2c267?fm=jpg&q=70&w=800&auto=format&fit=crop",
      alt: "Truck-mounted boom crane working at a residential job site",
      stock: true,
    },
    link: { href: "/contact?service=crane-rental#contact-form", label: "Ask about boom trucks" },
  },
];

/* ── How we work ──────────────────────────────────────────────────────── */

export const STEPS: { title: string; body: string }[] = [
  {
    title: "Discuss your requirements",
    body: "Share your project scope, location, equipment needs and anticipated schedule.",
  },
  {
    title: "Plan the solution",
    body: "Technical teams assess lifting requirements, equipment suitability and site constraints.",
  },
  {
    title: "Coordinate resources",
    body: "Equipment, people and support are lined up to match the service scope and availability.",
  },
  {
    title: "Execute the project",
    body: "The responsible operating team carries out the planned lift, rig, move or haul.",
  },
];

/* ── Projects ─────────────────────────────────────────────────────────── */

// Real TNT/RMS job photos (photos.ts CASE_PHOTOS). The write-ups behind them
// are placeholder, so only the service and general category are shown —
// no project names, places, tonnages or outcomes until approved.
export const PROJECTS: { service: string; category: string; photo: Photo }[] = [
  {
    service: "Crane Rental",
    category: "Infrastructure · Bridge girder setting",
    photo: { src: "/photos/cases/tnt-211-bridge-girder-set.jpg", alt: "TNT all-terrain crane setting a bridge girder over water" },
  },
  {
    service: "Specialized Rigging",
    category: "Industrial · Vessel placement",
    photo: {
      src: "/photos/cases/tnt-176-petrochemical-vessel-placement.jpg",
      alt: "TNT hydraulic gantry lifting a vessel-sized load",
    },
  },
  {
    service: "Wind Energy",
    category: "Renewables · Turbine erection",
    photo: {
      src: "/photos/cases/tnt-098-wind-farm-turbine-erection.jpg",
      alt: "Two crawler cranes erecting a wind turbine tower section",
    },
  },
];
