/**
 * STATEMENT — the second homepage section, directly after the hero.
 *
 * 2026-07-30: now a thin re-export of StorySlideshow (six user-driven slides,
 * see that file's docblock for the full history — it supersedes the earlier
 * static split, OperationalScale.tsx, which itself supersedes the original
 * scroll-expand mechanic). StorySlideshow owns its own `<section id="statement">`
 * directly, so this wrapper adds nothing structural — it exists only so the
 * rest of the codebase (page.tsx, memory of "the Statement section") keeps a
 * stable import name across whatever the section's content turns out to be
 * next.
 *
 * 2026-09-02: briefly swapped in a second component (AboutStripV2, a
 * Family-of-Companies-style split panel) behind the "About /01 /02" picker
 * in SiteNav.tsx — replaced same day. What that picker now toggles is
 * StorySlideshow's OWN two description layouts (desktop-style vs
 * mobile-style, previously just breakpoint-driven) rather than swapping in a
 * different component — see the "ABOUT VERSION" note in StorySlideshow.tsx.
 *
 * `id="statement"` MUST exist on whatever renders here — SiteNav polls that
 * exact element's position to decide when to reveal the fixed header on the
 * homepage (see SiteNav.tsx's reveal-band comment). It currently lives inside
 * StorySlideshow's own markup.
 */

import StorySlideshow from "./StorySlideshow";

export default function StatementSection() {
  return <StorySlideshow />;
}
