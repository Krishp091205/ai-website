"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
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
    return {
      dpr: 1,
      shadows: false,
      bloom: false,
      sparkles: false,
      lightMult: 1.3,
      antialias: false,
    };
  }
  switch (quality) {
    case "low":
      return {
        dpr: 0.9,
        shadows: false,
        bloom: false,
        sparkles: false,
        lightMult: 1.2,
        antialias: false,
      };
    case "medium":
      return {
        dpr: 1.1,
        shadows: true,
        bloom: false,
        sparkles: false,
        lightMult: 1.1,
        antialias: true,
      };
    case "ultra":
      return {
        dpr: 2,
        shadows: true,
        bloom: true,
        sparkles: true,
        lightMult: 1,
        antialias: true,
      };
    default: // high
      return {
        dpr: 1.6,
        shadows: true,
        bloom: true,
        sparkles: true,
        lightMult: 1.05,
        antialias: true,
      };
  }
}

function ArenaLights({ mult }: { mult: number }) {
  return (
    <group>
      <pointLight
        position={[0, 3.4, -4]}
        color="#e8c46a"
        intensity={2.2 * mult}
        distance={18}
        decay={2}
      />
      <pointLight
        position={[0, 3.4, 9]}
        color="#ffe0a3"
        intensity={2 * mult}
        distance={18}
        decay={2}
      />
      <pointLight
        position={[-16, 3, 0]}
        color="#d9b45f"
        intensity={1.2 * mult}
        distance={16}
        decay={2}
      />
      <pointLight
        position={[16, 3, 0]}
        color="#d9b45f"
        intensity={1.2 * mult}
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
      shadows={q.shadows}
      dpr={q.dpr}
      camera={{ fov: 64, near: 0.1, far: 160, position: [0, 1.8, 8] }}
      gl={{ antialias: q.antialias, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#0b0a08"]} />
      <fog attach="fog" args={["#0b0a08", 36, 96]} />

      <CameraRig />
      <Suspense fallback={null}>
        <PlayerController />
        <GymWorld reduced={!q.sparkles} />
      </Suspense>

      <ambientLight intensity={0.38 * q.lightMult} color="#fff3dc" />
      <hemisphereLight args={["#e8c46a", "#070706", 0.5 * q.lightMult]} />
      <directionalLight
        position={[-18, 14, 10]}
        intensity={0.72 * q.lightMult}
        color="#ffe8bd"
        castShadow={q.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={60}
      />
      <spotLight
        position={[0, 12, 2]}
        angle={0.9}
        penumbra={0.75}
        intensity={2.1 * q.lightMult}
        color="#ffe3a8"
        distance={90}
        decay={2}
        castShadow={q.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <ArenaLights mult={q.lightMult} />

      {q.bloom && (
        <EffectComposer>
          <Bloom
            intensity={0.72}
            luminanceThreshold={0.78}
            luminanceSmoothing={0.22}
            mipmapBlur
            radius={0.78}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
