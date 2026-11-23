"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { IS_MOBILE, useGame, type Quality } from "../store";
import CameraRig from "./CameraRig";
import GymWorld from "./GymWorld";
import PlayerController from "../PlayerController";
import { TOON } from "./toon";

/**
 * Cel-shaded render settings. Flat pop colours, hard bands, no filmic
 * rolloff and no fog — everything stays crisp and readable.
 */
function resolveQuality(quality: Quality): {
  dpr: number;
  shadows: boolean;
  lightMult: number;
  antialias: boolean;
} {
  if (IS_MOBILE) {
    return { dpr: 1, shadows: false, lightMult: 1.25, antialias: false };
  }
  switch (quality) {
    case "low":
      return { dpr: 0.9, shadows: false, lightMult: 1.2, antialias: false };
    case "medium":
      return { dpr: 1.1, shadows: true, lightMult: 1.15, antialias: true };
    case "ultra":
      return { dpr: 2, shadows: true, lightMult: 1.05, antialias: true };
    default:
      return { dpr: 1.6, shadows: true, lightMult: 1.1, antialias: true };
  }
}

/** Two warm practicals give the toon bands a bright side and a soft side. */
function ArenaLights({ mult }: { mult: number }) {
  return (
    <group>
      <pointLight position={[0, 4.6, -4]} color={TOON.gold} intensity={1.1 * mult} distance={18} decay={2} />
      <pointLight position={[0, 4.6, 10]} color={TOON.orange} intensity={0.9 * mult} distance={18} decay={2} />
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
      camera={{ fov: 64, near: 0.1, far: 180, position: [0, 1.8, 8] }}
      gl={{ antialias: q.antialias, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
      }}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#14110e"]} />

      <CameraRig />
      <Suspense fallback={null}>
        <PlayerController />
        <GymWorld />
      </Suspense>

      <ambientLight intensity={0.34 * q.lightMult} color="#fff2d8" />
      <hemisphereLight args={["#ffe3a8", "#2a2118", 0.4 * q.lightMult]} />

      {/* One hard key light keeps the cel bands clean. */}
      <directionalLight
        position={[-18, 18, 10]}
        intensity={1.5 * q.lightMult}
        color="#fff3dc"
        castShadow={q.shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
      />

      <ArenaLights mult={q.lightMult} />
    </Canvas>
  );
}
