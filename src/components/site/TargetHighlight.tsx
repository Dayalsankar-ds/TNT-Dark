"use client";

/**
 * Marks the element the URL fragment points at with `data-targeted`, so CSS can
 * style it. Stands in for `:target`, which Next.js client navigation never
 * triggers (see useHashTarget).
 *
 * Renders nothing. Kept as a leaf client component so the section it serves —
 * CoreServices — stays a server component.
 */

import { useEffect } from "react";
import { useHashTarget } from "./useHashTarget";

export default function TargetHighlight({ selector }: { selector: string }) {
  const hash = useHashTarget();

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    for (const el of nodes) el.toggleAttribute("data-targeted", !!hash && el.id === hash);
    return () => {
      for (const el of nodes) el.removeAttribute("data-targeted");
    };
  }, [hash, selector]);

  return null;
}
