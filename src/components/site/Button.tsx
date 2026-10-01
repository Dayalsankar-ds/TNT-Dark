"use client";

/**
 * BUTTON — the single CTA style for the whole site.
 *
 * Variants:
 *   primary   — solid fill (black on light / amber on dark) for the top CTA.
 *   secondary — hairline outline that fills in on hover (for section CTAs).
 *   link      — text + arrow, no box (lightest CTA; amber, reads on any bg).
 *
 * `onDark` flips primary/secondary for dark-background sections (navy, black,
 * maroon, the nav). Every variant shares the same amber arrow that nudges right
 * on hover — the one consistent, on-brand motion across the site.
 *
 * PRESS ANIMATION (2026-09-24, on request — "I want a button animation",
 * against the TNT Button design system in Figma, node 195:50): that file
 * defines Default/Hover/Pressed/Disabled as four separate states for every
 * style, but this component only ever had two — a static look plus a hover
 * color swap, no Pressed state at all. Checked Figma's own motion data for
 * this node directly (`get_motion_context`) and it came back empty — the
 * file is a static state-swatch reference, not an animated prototype, so
 * there was no specific easing/timing spec to copy; the animation itself is
 * this component's own addition to close that gap; `active:scale-[0.97]`
 * gives every variant a real tactile press-down on click/tap, not just a
 * color change, eased back out on release via the same `transition-transform`
 * that already drives the arrow's hover nudge. `active:` in the Tailwind
 * sense (the `:active` pseudo-class, i.e. "currently being pressed") should
 * not be confused with `onDark`'s "active"/current styling elsewhere in this
 * codebase — different meaning entirely.
 *
 * Renders an <a> when `href` is set, otherwise a <button>.
 */

import { type ReactNode, type Ref } from "react";
import { Icon } from "./primitives";

type Variant = "primary" | "secondary" | "link";

const SKINS: Record<string, string> = {
  "primary-light": "rounded-md bg-black px-5 py-2.5 text-white hover:bg-tnt-navy",
  "primary-dark":
    "rounded-md bg-tnt-amber px-5 py-2.5 text-black hover:bg-tnt-amber-vivid",
  "secondary-light":
    "rounded-md border border-black/15 px-5 py-2.5 text-black hover:border-black hover:bg-black hover:text-white",
  "secondary-dark":
    "rounded-md border border-white/25 px-5 py-2.5 text-white hover:border-white hover:bg-white hover:text-black",
  "link-light": "text-tnt-amber hover:text-tnt-amber-vivid",
  "link-dark": "text-tnt-amber hover:text-tnt-amber-vivid",
};

export default function Button({
  children,
  href,
  variant = "secondary",
  onDark = false,
  arrow = true,
  className = "",
  onClick,
  type = "button",
  ref,
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  onDark?: boolean;
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  // React 19: function components receive `ref` as a plain prop, no
  // forwardRef needed. Typed for both tags since the element rendered
  // depends on `href` and the caller may want either.
  ref?: Ref<HTMLAnchorElement | HTMLButtonElement>;
}) {
  const skin = SKINS[`${variant}-${onDark ? "dark" : "light"}`];
  // The link variant used to get NO focus ring at all, which left every
  // text-link button on the site with no visible keyboard focus (WCAG 2.4.7).
  // It gets one too — just tighter, since it has no filled box to offset from.
  const ring =
    variant === "link"
      ? "rounded-sm focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
      : "focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:ring-offset-2 focus-visible:outline-none";
  const cls = `group inline-flex items-center gap-2 font-body text-sm font-semibold transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${skin} ${ring} ${className}`;

  // Amber arrow everywhere except the amber-filled primary-on-dark button,
  // where amber-on-amber would vanish — there it follows the (black) text.
  const arrowColor = variant === "primary" && onDark ? "" : "text-tnt-amber";
  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <Icon
          name="arrow"
          className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${arrowColor}`}
        />
      )}
    </>
  );

  return href ? (
    <a
      ref={ref as Ref<HTMLAnchorElement>}
      href={href}
      className={cls}
      onClick={onClick}
    >
      {inner}
    </a>
  ) : (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      className={cls}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}
