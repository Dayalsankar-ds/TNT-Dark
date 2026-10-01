"use client";

/**
 * SCENE CANVAS — the shared R3F wrapper every 3D moment renders through.
 *
 * The contract that keeps 3D from breaking the site's animation foundation:
 *
 *  - `frameloop="demand"`: the scene does NOT run its own render loop. A
 *    render happens only when something calls `invalidate()` (from
 *    `@react-three/fiber`). Scroll-linked scenes get that call from a GSAP
 *    ScrollTrigger `onUpdate`, so all motion stays on the single shared rAF
 *    loop that <SmoothScroll> established — never add a free-running loop or
 *    `useFrame((_, delta) => ...)` animation that assumes continuous ticking.
 *
 *  - Consumption pattern (Next 16: `ssr: false` is only allowed inside a
 *    Client Component, and static import paths are required for code
 *    splitting). Each scene ships its own client-side mount:
 *
 *      "use client";
 *      import dynamic from "next/dynamic";
 *      const StatementScene = dynamic(() => import("./StatementScene"), {
 *        ssr: false,
 *      });
 *
 *    Sections (server components) render the mount; the Three.js bundle is
 *    fetched only on pages that actually show a scene.
 *
 *  - The canvas is a background layer: absolutely fill a `relative` section
 *    and keep the section's real content above it. 3D augments a section, it
 *    never replaces its markup — content must survive the canvas not
 *    rendering at all (old GPUs, reduced motion, WebGL disabled).
 */

import { Canvas } from "@react-three/fiber";
import type { ComponentProps } from "react";

type SceneCanvasProps = Omit<ComponentProps<typeof Canvas>, "frameloop">;

export default function SceneCanvas({
  children,
  gl,
  ...rest
}: SceneCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]} // cap devicePixelRatio; 3x+ retina buys nothing visible here
      gl={{
        antialias: true,
        alpha: true, // transparent — the section's own background shows through
        powerPreference: "high-performance",
        ...gl,
      }}
      {...rest}
    >
      {children}
    </Canvas>
  );
}
