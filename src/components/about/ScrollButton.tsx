"use client";

/**
 * In-page scroll CTA for /about (e.g. hero "Explore Our Story" → #our-story).
 * Rendered as the shared Button without an href — a real <button>, so the
 * browser's own instant hash jump can't fight the smooth scroll. Updates the
 * URL hash without adding a history entry. Smooth only when motion is
 * allowed (scrollToElement checks).
 */

import Button from "@/components/site/Button";
import { scrollToElement } from "@/components/site/scrollToElement";

export default function ScrollButton({
  targetId,
  children,
  variant = "primary",
  onDark = false,
}: {
  targetId: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "link";
  onDark?: boolean;
}) {
  return (
    <Button
      variant={variant}
      onDark={onDark}
      onClick={() => {
        const el = document.getElementById(targetId);
        if (!el) return;
        scrollToElement(el, { smooth: true });
        history.replaceState(null, "", `#${targetId}`);
      }}
    >
      {children}
    </Button>
  );
}
