/**
 * SHARED SECTION PRIMITIVES
 *
 * Eyebrow + heading enforce the type system across every section:
 *   Eyebrow  — 13px letter-spaced caps in TNT Amber
 *   Heading  — bold condensed all-caps display (Anton), Rich Black by default
 * Icon is a compact inline-SVG set (no icon-font dependency) so glyphs inherit
 * currentColor and stay crisp at any size.
 */

import type { ReactNode } from "react";

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase ${className}`}
    >
      {children}
    </p>
  );
}

export function Heading({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={`font-display tracking-wide text-black uppercase ${className}`}
    >
      {children}
    </Tag>
  );
}

export type IconName =
  | "crawler"
  | "allterrain"
  | "tower"
  | "boom"
  | "carrydeck"
  | "rigging"
  | "engineering"
  | "rail"
  | "wind"
  | "heavylift"
  | "rental"
  | "storage"
  | "transport"
  | "refinery"
  | "petrochemical"
  | "power"
  | "infrastructure"
  | "commercial"
  | "agreement"
  | "credit"
  | "payment"
  | "pin"
  | "search"
  | "arrow"
  | "mail"
  | "facebook"
  | "linkedin"
  | "youtube"
  | "instagram"
  | "clock"
  | "person"
  | "trophy"
  | "headset"
  | "chevron-up";

const PATHS: Record<IconName, ReactNode> = {
  crawler: (
    <>
      <path d="M3 17h18M4 17l2-5h9l4 5M8 12V7l9 3" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </>
  ),
  allterrain: (
    <>
      <path d="M2 15h20M4 15l1-4h11l4 4M9 11V8l8 2.5" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="12" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </>
  ),
  tower: (
    <>
      <path d="M12 21V5M6 5h12M9 5 12 2l3 3M6 5l6 4 6-4M12 9v3" />
    </>
  ),
  boom: (
    <>
      <path d="M4 20h6M7 20V8l12-3M7 8l10 8M17 5v3" />
    </>
  ),
  carrydeck: (
    <>
      <path d="M2 16h20M3 16v-3h10l3-3h4v6" />
      <circle cx="7" cy="18" r="1.4" />
      <circle cx="16" cy="18" r="1.4" />
    </>
  ),
  rigging: (
    <>
      <path d="M12 3v4M8 7h8l-2 5H10L8 7ZM12 12v4M9 20h6M12 16l-3 4M12 16l3 4" />
    </>
  ),
  engineering: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  rail: (
    <>
      <path d="M4 21 8 3M20 21 16 3M6 12h12M7 7h10M5 17h14" />
    </>
  ),
  wind: (
    <>
      <path d="M12 12V21M12 12l6-2M12 12 8 6M12 12l-5 4" />
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
  heavylift: (
    <>
      <path d="M4 20h16M7 20v-6h10v6M9 14v-3h6v3M11 11V8h2v3" />
    </>
  ),
  rental: (
    <>
      <path d="M4 8h16v11H4zM4 8l3-4h10l3 4M9 12h6" />
    </>
  ),
  storage: (
    <>
      <path d="M3 9l9-5 9 5v10H3zM3 9h18M8 19v-6h8v6" />
    </>
  ),
  transport: (
    <>
      <path d="M2 16h11V7H2zM13 10h4l3 3v3h-7" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  refinery: (
    <>
      <path d="M3 21V10l4-2v3l4-3v13M15 21V6l6 3v12M3 21h18M6 13v4M18 13v4" />
    </>
  ),
  petrochemical: (
    <>
      <path d="M6 21a4 4 0 0 0 8 0c0-3-4-5-4-9 0 4-4 6-4 9ZM16 21a3 3 0 0 0 5-2c0-2-3-3-3-6 0 3-2 4-2 6" />
    </>
  ),
  power: (
    <>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </>
  ),
  infrastructure: (
    <>
      <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M12 4v3" />
    </>
  ),
  commercial: (
    <>
      <path d="M4 21V4h9v17M13 9h7v12M7 8h3M7 12h3M7 16h3M16 13h1M16 17h1" />
    </>
  ),
  agreement: (
    <>
      <path d="M6 3h9l3 3v15H6zM9 8h6M9 12h6M9 16h3" />
    </>
  ),
  credit: (
    <>
      <path d="M3 6h18v12H3zM3 10h18M6 15h4" />
    </>
  ),
  payment: (
    <>
      <path d="M12 2v20M17 6H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  // Social marks are drawn as outline glyphs inside a shared rounded square so
  // the four read as one set and match the stroke weight of every icon above —
  // solid brand logos would sit apart from this system.
  facebook: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <path d="M15.5 8H14a1.8 1.8 0 0 0-1.8 1.8V12H10m5 0h-2.8m0 0v6" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <path d="M7.5 10.5V17M7.5 7.5v.01M11.5 17v-4a2.2 2.2 0 0 1 4.4 0v4" />
    </>
  ),
  youtube: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <path d="m10.5 9.2 4.6 2.8-4.6 2.8z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.9" cy="7.1" r="0.6" />
    </>
  ),
  // Operational-scale stats (OperationalScale.tsx): years / headcount / rank /
  // 24-7 support. Same outline convention as the set above.
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c0-4 3.2-6.8 7-6.8s7 2.8 7 6.8" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 3h10v4a5 5 0 0 1-10 0V3Z" />
      <path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" />
      <path d="M12 12v4M9 20h6" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4.5" height="6.5" rx="1.6" />
      <rect x="16.5" y="13" width="4.5" height="6.5" rx="1.6" />
    </>
  ),
  // Bare chevron, no shaft: the hero scroll cue animates the mark upward, so a
  // full arrow would read as two competing motions. Drawn shallow (6→12→18 over
  // a 5px rise) to match the open, wide angle of `arrow`'s head.
  "chevron-up": (
    <>
      <path d="m6 14.5 6-5 6 5" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-6 w-6",
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
