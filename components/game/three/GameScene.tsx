"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { IS_MOBILE, useGame } from "../store";
import CameraRig from "./CameraRig";
import GymHub from "./GymHub";
import Portals from "./Portals";
import ZoneEnvironments from "./ZoneEnvironments";

function FlickerLight({
  position,
  color = "#4a9eff",
  base = 0.5,
  speed = 9,
}: {
  position: [number, number, number];
  color?: string;
  base?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.intensity =
      base +
      Math.sin(clock.elapsedTime * speed + position[0]) * base * 0.3 +
      Math.random() * base * 0.15;
  });
  return (
    <pointLight
      ref={ref}
      position={position}
      color={color}
      intensity={base}
      distance={7}
      decay={2}
    />
  );
}

export default function GameScene() {
  const quality = useGame((s) => s.settings.quality);
  const high = quality === "high";
  const bloom = high && !IS_MOBILE;

  return (
    <Canvas
      shadows={high}
      dpr={[1, high ? 2 : 1.25]}
      camera={{ fov: 46, near: 0.1, far: 120, position: [0, 3.4, 21] }}
      gl={{ antialias: high, powerPreference: "high-performance" }}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#0a0a0c"]} />
      <fog attach="fog" args={["#0a0a0c", high ? 13 : 20, 36]} />

      <CameraRig />
      <GymHub reduced={!high} />
      <Portals />
      <ZoneEnvironments />

      <ambientLight intensity={high ? 0.3 : 0.5} />
      <hemisphereLight
        args={["#3a4658", "#0b0b0d", high ? 0.45 : 0.7]}
      />
      <spotLight
        position={[0, 6.4, -2]}
        angle={0.9}
        penumbra={0.85}
        intensity={high ? 1.4 : 1.8}
        color="#dfe9ff"
        castShadow={high}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-8, 4, 6]}
        intensity={high ? 0.35 : 0.5}
        color="#bfd4f0"
      />
      <FlickerLight position={[-6, 4.4, -4]} color="#4a9eff" base={0.6} />
      <FlickerLight position={[6, 4.4, 2]} color="#5aa7ff" base={0.5} speed={6} />
      <pointLight
        position={[9.5, 3, 6]}
        color="#f59e0b"
        intensity={0.8}
        distance={8}
        decay={2}
      />

      {bloom && (
        <EffectComposer>
          <Bloom
            intensity={0.5}
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
