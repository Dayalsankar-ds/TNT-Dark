"use client";

/**
 * CURSOR READOUT — Section 2 signature effect.
 *
 * Wraps an equipment photo. On hover, a blueprint-style readout follows the
 * cursor, with thin amber crosshair lines tracking the pointer.
 *
 * Two variants of the SAME component (not a fork):
 *   - "spec"   (default) — surfaces the crane data a renter needs:
 *                "LOAD · 42T / RADIUS · 18M". Used in the numbered 01–04 list.
 *   - "coords"           — CAD-viewport axis readout: a marker dot at the
 *                pointer with "X:" / "Y:" values pinned to the frame edges like
 *                axis labels. The generic "engineering precision" motif used on
 *                the intro photo (mirrors Enerblock's site-wide instrument feel).
 *
 * Pointer-driven only: touch devices (no hover) simply never show it, so the
 * photo degrades to a plain image. No animation loop, so nothing to gate on
 * reduced-motion.
 */

import { useRef, useState, type ReactNode } from "react";

export default function CursorReadout({
  load,
  radius,
  variant = "spec",
  className = "",
  children,
}: {
  load?: string;
  radius?: string;
  variant?: "spec" | "coords";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(null)}
      className={`relative cursor-crosshair overflow-hidden ${
        variant === "coords" ? "rounded-none" : "rounded-lg"
      } ${className}`}
    >
      {children}

      {pos && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Crosshair lines track the pointer (both variants) */}
          <span
            className="absolute h-px w-full bg-tnt-amber/50"
            style={{ top: pos.y }}
          />
          <span
            className="absolute h-full w-px bg-tnt-amber/50"
            style={{ left: pos.x }}
          />

          {variant === "coords" ? (
            /* CAD-viewport axis readout: a marker dot at the pointer with the
               X / Y values pinned to the frame edges, like axis labels. */
            <>
              <span
                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tnt-amber"
                style={{ left: pos.x, top: pos.y }}
              />
              <span
                className="absolute bottom-2 -translate-x-1/2 font-mono text-[10px] tracking-wider text-tnt-navy"
                style={{ left: pos.x }}
              >
                X: {Math.round(pos.x)}
              </span>
              <span
                className="absolute left-2 -translate-y-1/2 font-mono text-[10px] tracking-wider text-tnt-navy"
                style={{ top: pos.y }}
              >
                Y: {Math.round(pos.y)}
              </span>
            </>
          ) : (
            /* Spec chip follows the pointer, surfacing the crane's rated data. */
            <div
              className="absolute rounded border border-tnt-amber/70 bg-tnt-navy/85 px-3 py-2 font-mono text-[11px] leading-tight tracking-wider text-tnt-amber whitespace-nowrap uppercase shadow-lg"
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(14px, 14px)",
              }}
            >
              <div>LOAD · {load}</div>
              <div>RADIUS · {radius}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
