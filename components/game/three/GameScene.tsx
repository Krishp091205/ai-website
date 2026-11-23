"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { IS_MOBILE, useGame, type Quality } from "../store";
import CameraRig from "./CameraRig";
import GymWorld from "./GymWorld";
import PlayerController from "../PlayerController";

/**
 * Faceted brutalist render settings.
 * No bloom, no filmic rolloff, minimal fill — geometry and hard light do the work.
 */
function resolveQuality(quality: Quality): {
  dpr: number;
  shadows: boolean;
  lightMult: number;
  antialias: boolean;
} {
  if (IS_MOBILE) {
    return { dpr: 1, shadows: false, lightMult: 1.15, antialias: false };
  }
  switch (quality) {
    case "low":
      return { dpr: 0.9, shadows: false, lightMult: 1.1, antialias: false };
    case "medium":
      return { dpr: 1.1, shadows: true, lightMult: 1.05, antialias: true };
    case "ultra":
      return { dpr: 2, shadows: true, lightMult: 0.95, antialias: true };
    default: // high
      return { dpr: 1.6, shadows: true, lightMult: 1, antialias: true };
  }
}

/** Two hard practicals. Kept sparse so shadow shapes stay legible. */
function ArenaLights({ mult }: { mult: number }) {
  return (
    <group>
      <pointLight
        position={[0, 4.2, -4]}
        color="#e8c46a"
        intensity={1.3 * mult}
        distance={16}
        decay={2}
      />
      <pointLight
        position={[0, 4.2, 10]}
        color="#f0d59a"
        intensity={1.1 * mult}
        distance={16}
        decay={2}
      />
    </group>
  );
}

export default function GameScene() {
  const quality = useGame((s) => s.settings.quality);
  const q = useMemo(() => resolveQuality(quality), [quality]);

  return (
    <Canvas
      shadows={{ type: THREE.BasicShadowMap }}
      dpr={q.dpr}
      camera={{ fov: 64, near: 0.1, far: 160, position: [0, 1.8, 8] }}
      gl={{ antialias: q.antialias, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        // No filmic rolloff. Faces stay flat and contrast stays hard.
        gl.toneMapping = THREE.NoToneMapping;
      }}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#080705"]} />
      <fog attach="fog" args={["#080705", 30, 82]} />

      <CameraRig />
      <Suspense fallback={null}>
        <PlayerController />
        <GymWorld />
      </Suspense>

      {/* Minimal fill — shadow side of every facet should stay dark. */}
      <ambientLight intensity={0.14 * q.lightMult} color="#fff4e2" />
      <hemisphereLight args={["#d8bd82", "#060504", 0.16 * q.lightMult]} />

      {/* Single hard key light. BasicShadowMap gives crisp, unblurred edges. */}
      <directionalLight
        position={[-18, 16, 10]}
        intensity={1.7 * q.lightMult}
        color="#ffedcb"
        castShadow={q.shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={70}
        shadow-bias={-0.0005}
      />

      {/* Hard-edged overhead marker light. No penumbra. */}
      <spotLight
        position={[0, 13, 2]}
        angle={0.78}
        penumbra={0.04}
        intensity={1.5 * q.lightMult}
        color="#ffe6b0"
        distance={90}
        decay={2}
        castShadow={q.shadows}
        shadow-mapSize={[1024, 1024]}
      />

      <ArenaLights mult={q.lightMult} />
    </Canvas>
  );
}
