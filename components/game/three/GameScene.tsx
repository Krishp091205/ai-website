"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { IS_MOBILE, useGame, type Quality } from "../store";
import CameraRig from "./CameraRig";
import GymWorld from "./GymWorld";
import PlayerController from "../PlayerController";

function resolveQuality(quality: Quality): {
  dpr: number;
  shadows: boolean;
  bloom: boolean;
  sparkles: boolean;
  lightMult: number;
  antialias: boolean;
} {
  if (IS_MOBILE) {
    return { dpr: 1, shadows: false, bloom: false, sparkles: false, lightMult: 1.3, antialias: false };
  }
  switch (quality) {
    case "low":
      return { dpr: 0.9, shadows: false, bloom: false, sparkles: false, lightMult: 1.2, antialias: false };
    case "medium":
      return { dpr: 1.1, shadows: true, bloom: false, sparkles: false, lightMult: 1.1, antialias: true };
    case "ultra":
      return { dpr: 2, shadows: true, bloom: true, sparkles: true, lightMult: 1, antialias: true };
    default: // high
      return { dpr: 1.6, shadows: true, bloom: true, sparkles: true, lightMult: 1.05, antialias: true };
  }
}

function FlickerLights({ mult }: { mult: number }) {
  return (
    <group>
      {/* central atrium accents */}
      <pointLight position={[0, 3.2, -4]} color="#4a9eff" intensity={1.4 * mult} distance={14} decay={2} />
      <pointLight position={[0, 3.2, 9]} color="#6db6ff" intensity={1.2 * mult} distance={14} decay={2} />
      <pointLight position={[-14, 2.6, 0]} color="#7faeff" intensity={0.8 * mult} distance={12} decay={2} />
      <pointLight position={[14, 2.6, 0]} color="#7faeff" intensity={0.8 * mult} distance={12} decay={2} />
    </group>
  );
}

export default function GameScene() {
  const quality = useGame((s) => s.settings.quality);
  const q = useMemo(() => resolveQuality(quality), [quality]);

  return (
    <Canvas
      shadows={q.shadows}
      dpr={q.dpr}
      camera={{ fov: 68, near: 0.1, far: 160, position: [0, 1.8, 8] }}
      gl={{ antialias: q.antialias, powerPreference: "high-performance" }}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#070708"]} />
      <fog attach="fog" args={["#070708", 34, 90]} />

      <CameraRig />
      <Suspense fallback={null}>
        <PlayerController />
        <GymWorld reduced={!q.sparkles} />
      </Suspense>

      {/* scene lights */}
      <ambientLight intensity={0.55 * q.lightMult} />
      <hemisphereLight args={["#3a4658", "#0b0b0d", 0.5 * q.lightMult]} />
      <directionalLight
        position={[-18, 14, 10]}
        intensity={0.5 * q.lightMult}
        color="#dbe6ff"
        castShadow={q.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={60}
      />
      <FlickerLights mult={q.lightMult} />

      {q.bloom && (
        <EffectComposer>
          <Bloom
            intensity={0.55}
            luminanceThreshold={1}
            luminanceSmoothing={0.2}
            mipmapBlur
            radius={0.7}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
