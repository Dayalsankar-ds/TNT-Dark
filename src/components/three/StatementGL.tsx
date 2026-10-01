"use client";

/**
 * STATEMENT GL — the Statement section's background scene: a receding
 * engineering grid with a sparse field of amber survey points, drifting
 * slightly with scroll. Deliberately quiet — it reads as paper texture with
 * depth, not as a set piece; the manifesto type on top is the section.
 *
 * All motion is scroll-derived via useScrollScene (demand frameloop — renders
 * only while the section actually moves through the viewport).
 */

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import SceneCanvas from "./SceneCanvas";
import useScrollScene from "./useScrollScene";

const POINT_COUNT = 260;

function Scene({ trigger }: { trigger: RefObject<HTMLDivElement | null> }) {
  const progress = useScrollScene(trigger);
  const group = useRef<Group>(null);

  // Deterministic scatter — a seeded LCG instead of Math.random so the field
  // doesn't visibly reshuffle when React strict-mode/HMR remounts the scene.
  const positions = useMemo(() => {
    const arr = new Float32Array(POINT_COUNT * 3);
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < POINT_COUNT; i++) {
      arr[i * 3] = (rand() - 0.5) * 30; // x — spread wide
      arr[i * 3 + 1] = rand() * 4 - 0.8; // y — hover above the grid
      arr[i * 3 + 2] = (rand() - 0.5) * 24; // z — depth
    }
    return arr;
  }, []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = progress.current;
    // Gentle parallax: a slow yaw and a dolly-forward as the section passes.
    g.rotation.y = (p - 0.5) * 0.22;
    g.position.z = p * 2.2;
  });

  return (
    <group ref={group}>
      {/* Neutral greys — were #b7bec2/#ccd2d5, both cool blue-greys. */}
      <gridHelper args={[60, 48, "#bcbcbc", "#d1d1d1"]} position={[0, -1.6, 0]} />
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          /* Official Gold. This file was missed in the brand-kit pass and still
             carried the pre-kit #edb144. */
          color="#f8ae1c"
          size={0.06}
          sizeAttenuation
          transparent
          opacity={0.55}
        />
      </points>
    </group>
  );
}

export default function StatementGL({
  trigger,
}: {
  trigger: RefObject<HTMLDivElement | null>;
}) {
  return (
    <SceneCanvas
      className="pointer-events-none absolute inset-0"
      flat
      camera={{ position: [0, 1.1, 7], fov: 45 }}
    >
      <Scene trigger={trigger} />
    </SceneCanvas>
  );
}
