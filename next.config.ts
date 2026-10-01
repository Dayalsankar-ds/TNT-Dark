import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next blocks /_next/* dev resources from non-localhost origins by default.
  // Without this, opening the dev server by LAN IP (e.g. from a phone) serves
  // the HTML but blocks every JS chunk — the page renders unhydrated, so no
  // scroll animation runs at all.
  //
  // The LAN IP changes when the machine gets a new lease; these cover the
  // private ranges rather than pinning one address. Dev-only setting.
  allowedDevOrigins: ["10.*.*.*", "172.16.*.*", "192.168.*.*", "localhost"],
  images: {
    // Needed by heroSequenceManualScroll.ts's optimizedFramePath (the
    // manual-scroll hero variant, copied 2026-09-08). The /_next/image
    // endpoint 400s on a w= or q= value that isn't in these lists.
    //
    // 1280: the hero frames' native width — an optimizer pass at that width
    // is a pure format re-encode (JPEG → WebP via sharp), not a resize.
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1920, 2048, 3840],
    // 75 is Next's default; 60 is for the hero sequence, where 386 frames
    // are preloaded on mount and every byte multiplies by 386.
    qualities: [60, 75],
  },
};

export default nextConfig;
