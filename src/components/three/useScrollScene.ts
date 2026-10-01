"use client";

/**
 * USE SCROLL SCENE — the bridge between GSAP ScrollTrigger and an R3F scene.
 *
 * Call from a component INSIDE <SceneCanvas> (it needs the R3F store). Returns
 * a ref holding the section's scroll progress (0 → 1). On every scroll update
 * it stores the new progress and calls R3F's `invalidate()`, which is what
 * makes a `frameloop="demand"` canvas render — so the scene draws exactly when
 * scroll moves it and is idle the rest of the time, on the one shared rAF loop.
 *
 * Recipe (the scene mount owns the trigger element):
 *
 *   const stageRef = useRef<HTMLDivElement>(null);
 *   <div ref={stageRef} className="relative">
 *     <SceneCanvas className="pointer-events-none absolute inset-0">
 *       <MyScene trigger={stageRef} />   // calls useScrollScene(trigger)
 *     </SceneCanvas>
 *     ...section content above the canvas...
 *   </div>
 *
 * Read `progress.current` inside `useFrame` — never store it in React state;
 * a state set per scroll tick would re-render React 60×/s for values only the
 * GPU cares about.
 *
 * prefers-reduced-motion: no ScrollTrigger is created — the scene renders its
 * initial frame once and holds it, like a poster.
 */

import { useEffect, useRef, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function useScrollScene(
  trigger: RefObject<HTMLElement | null>,
  {
    start = "top bottom", // section enters viewport…
    end = "bottom top", // …until it fully leaves
  }: { start?: string; end?: string } = {},
) {
  const progress = useRef(0);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    // Draw the first frame unconditionally — a demand-mode canvas that is
    // never invalidated stays blank forever.
    invalidate();

    const el = trigger.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => {
        progress.current = self.progress;
        invalidate();
      },
    });
    return () => st.kill();
  }, [trigger, start, end, invalidate]);

  return progress;
}
