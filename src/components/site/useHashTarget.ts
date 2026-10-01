"use client";

/**
 * THE CURRENT URL FRAGMENT, reliably — including across Next.js client
 * navigation.
 *
 * Reading `window.location.hash` once on mount and listening for `hashchange`
 * is the obvious approach and it is wrong here. Next's <Link> updates the URL
 * through the History API, which fires NEITHER `hashchange` NOR the CSS
 * `:target` match. Measured: clicking Equipment → "Tower Cranes" from the mega
 * panel left the URL at #tower-cranes while the component still showed a
 * different class, and a `.svc-tile:target { … }` rule never matched at all.
 *
 * Three sources are needed to cover every route into a fragment:
 *   - mount + `pathname` change → cross-page client nav and direct loads
 *   - `hashchange`              → real fragment nav and manual URL edits
 *   - a click on any hash link  → same-page <Link> hops, which change the URL
 *                                 via history and emit no event at all. Read
 *                                 after two frames so Next has committed it.
 *
 * Returns the decoded fragment without its leading "#", or "" when there is
 * none. Safe during SSR (returns "" until mounted).
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useHashTarget(): string {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const read = () => {
      // Take everything after the LAST "#". Navigating cross-page onto a
      // fragment and then clicking a same-page fragment link can leave Next
      // with a doubled URL — measured: "#tower-cranes#boom-trucks". The
      // visitor asked for the last one; without this the slug matches nothing
      // and the section silently stops responding to further clicks.
      const full = window.location.hash;
      const raw = full.slice(full.lastIndexOf("#") + 1);
      let next = raw;
      try {
        next = decodeURIComponent(raw);
      } catch {
        // A malformed escape sequence shouldn't take the section down with it.
      }
      setHash(next);
    };

    read();

    // Waiting a fixed number of frames after the click does not work — Next
    // commits the new URL at an unpredictable time, and a two-frame guess read
    // the PREVIOUS fragment, leaving everything one click behind. Watch for the
    // URL to actually change instead, bounded so a click that never navigates
    // (an external link, a prevented default) can't leave a loop running.
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest("a[href*='#']") : null;
      if (!el) return;
      const before = window.location.href;
      let frames = 0;
      const poll = () => {
        if (window.location.href !== before) {
          read();
          return;
        }
        if (frames++ > 40) return;
        requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    };

    window.addEventListener("hashchange", read);
    window.addEventListener("popstate", read);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", read);
      window.removeEventListener("popstate", read);
      document.removeEventListener("click", onClick, true);
    };
  }, [pathname]);

  return hash;
}
