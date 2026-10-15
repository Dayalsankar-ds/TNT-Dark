"use client";

/**
 * Sends old /services#<id> links to that service's own page, for services
 * that have one (services.ts `page` — Crane Rental, since 2026-10-09).
 *
 * Fragments never reach the server, so this can't be a redirect in
 * next.config; it runs on the client. `replace`, not `push`, so Back skips
 * the hop. Doubled fragments ("#crane-rental#crane-rental") resolve to the
 * last one via useHashTarget. Every other hash (#availability,
 * #machinery-moving …) is left to scroll as usual.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHashTarget } from "@/components/site/useHashTarget";
import { SERVICES } from "@/components/site/services";

export default function HashRedirect() {
  const hash = useHashTarget();
  const router = useRouter();

  useEffect(() => {
    const page = SERVICES.find((s) => s.id === hash)?.page;
    if (page) router.replace(page);
  }, [hash, router]);

  return null;
}
