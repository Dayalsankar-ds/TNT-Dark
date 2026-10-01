/**
 * Fixed-chrome geometry, shared by the header itself and by any sticky content
 * that has to sit clear of it.
 *
 * Lives in its own module (no "use client") so server components like
 * StickyStack can read it without importing across the client boundary.
 */

/** Utility strip (40px) + nav (80px). The strip only renders at `lg`+, which
 *  is also the only breakpoint where sticky offsets engage.
 *
 *  Raised from 100 (36 + 64) on 2026-07-29 — the bar read as compressed. This
 *  constant is the single source: the nav's reveal threshold, StickyStack's
 *  offsets and the sections' `scroll-mt` all derive from it, so the two `h-*`
 *  classes in TopInfoBar/SiteNav must be kept in step with this number. */
export const CHROME_H = 120;
