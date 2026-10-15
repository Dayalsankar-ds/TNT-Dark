/**
 * AVAILABILITY BADGE — one services.ts status as a labelled pill. Shared by
 * the regional availability tabs and the Crane Rental focus view. No client
 * state, so it renders in server and client components alike.
 *
 * `tone` (TNT Dark, 2026-10-15): "dark" for dark bands and panels, "light"
 * for the original TNT Light treatment — same pattern as CraneTypeGrid.
 */

import { Check, CircleHelp, Network, Minus } from "lucide-react";
import { AVAILABILITY_LABEL, type Availability } from "@/components/site/services";

const ICON: Record<Availability, typeof Check> = {
  direct: Check,
  network: Network,
  unconfirmed: CircleHelp,
  not_offered: Minus,
};

const TONE: Record<"dark" | "light", Record<Availability, string>> = {
  dark: {
    direct: "bg-tnt-amber text-black",
    network: "bg-white text-black",
    unconfirmed: "border border-white/25 text-white/70",
    not_offered: "bg-white/5 text-white/45",
  },
  light: {
    direct: "bg-tnt-amber text-black",
    network: "bg-black text-tnt-amber",
    unconfirmed: "border border-black/20 text-black/55",
    not_offered: "bg-black/5 text-black/40",
  },
};

export default function StatusBadge({
  status,
  tone = "dark",
}: {
  status: Availability;
  tone?: keyof typeof TONE;
}) {
  const Glyph = ICON[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold whitespace-nowrap ${TONE[tone][status]}`}
    >
      <Glyph aria-hidden="true" className="h-3.5 w-3.5" />
      {AVAILABILITY_LABEL[status]}
    </span>
  );
}
