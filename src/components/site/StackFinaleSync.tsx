"use client";

/**
 * STACK FINALE SYNC — keeps the pile in step with the finale card as it rises.
 *
 * Two jobs, both driven off one measurement (the finale's top edge):
 *
 * 1. HIDE EACH COVERED TAB. The ladder cards stay pinned to the end of the
 *    stack so the finale passes OVER them rather than dragging them along. But
 *    a pinned tab is as tall as the finale, so while the finale is higher up
 *    the screen than a tab, that tab's lower part reappears below the finale's
 *    bottom edge. The old fix was to make the finale a full viewport tall —
 *    which worked, but left ~275px of empty white under its photo, since the
 *    card's content is only ~593px. Hiding each tab the instant it is fully
 *    covered removes the need for that height entirely, so the finale can be an
 *    ordinary card identical to the rest of the pile.
 *
 *    A tab is fully covered exactly when the finale's top reaches the tab's own
 *    pinned top: both boxes are the same height, so from that point the finale
 *    spans everything the tab does. `visibility` (not `display`) so the tab
 *    keeps its box and the sticky maths around it is untouched.
 *
 * 2. PUSH THE TITLE RAIL. Sticky's only "push" is a containing block running
 *    out, and using it here would drag the TABS too — they would slide away
 *    before the finale ever covered them. So once the finale's top edge crosses
 *    the rail's bottom edge, the rail is translated by exactly the overlap: the
 *    two stay in contact and never intersect, and the card appears to shunt the
 *    title out of frame.
 *
 * Reads on scroll, writes in a rAF, and only when a value actually changes.
 * Below `lg` nothing in the stack is sticky, so both effects are skipped and
 * any previous state is cleared.
 */

import { useEffect, useRef, type ReactNode } from "react";

/** Matches the `lg` breakpoint, where the stack's sticky offsets engage. */
const LG = 1024;

export default function StackFinaleSync({
  railBottom,
  children,
}: {
  /** Y of the rail's bottom edge when pinned (its sticky `top` + height). The
   *  push begins when the finale's top edge rises past this. */
  railBottom: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    // The rail is transformed directly, never through a wrapper: a wrapper box
    // would become the sticky rail's containing block and un-pin it almost
    // immediately. Hence `display: contents` on the host below, and marking the
    // rail itself rather than assuming it is the first child.
    const el = host.querySelector<HTMLElement>("[data-stack-rail]");
    // `display: contents` means the host has no box, so parentElement is the
    // stack's own relative wrapper — the cards' parent.
    const stack = host.parentElement;
    const finale = stack?.querySelector<HTMLElement>("[data-stack-finale]");
    if (!el || !stack || !finale) return;

    // Ladder tabs, paired with the y each is pinned at. That pin is the
    // threshold at which the finale has fully covered it (see above), and it
    // lives in the inline style StickyStack writes.
    const tabs = Array.from(
      stack.querySelectorAll<HTMLElement>("article:not([data-stack-finale])"),
    ).map((node) => ({ node, pin: parseFloat(node.style.top) || 0 }));

    let frame = 0;
    let appliedShift = NaN;
    const appliedHidden = new WeakMap<HTMLElement, boolean>();

    const measure = () => {
      frame = 0;
      const small = window.innerWidth < LG;
      const finaleTop = finale.getBoundingClientRect().top;

      for (const { node, pin } of tabs) {
        const hide = !small && finaleTop <= pin;
        if (appliedHidden.get(node) === hide) continue;
        appliedHidden.set(node, hide);
        node.style.visibility = hide ? "hidden" : "";
      }

      const shift = small ? 0 : Math.min(0, finaleTop - railBottom);
      if (shift === appliedShift) return;
      appliedShift = shift;
      // translate3d keeps the rail on its own layer, so the push doesn't
      // re-rasterise the heading on every frame.
      el.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : "";
      el.style.willChange = shift ? "transform" : "";
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
      el.style.willChange = "";
      for (const { node } of tabs) node.style.visibility = "";
    };
  }, [railBottom]);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
