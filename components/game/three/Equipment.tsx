"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EquipmentKind } from "../level";
import { InkOutlines, TOON, popFor, toon } from "./toon";

/**
 * Cel-shaded gym equipment: four light bands, flat pop colours, ink contours.
 * All interaction data (kind, label, accent, positions) is untouched —
 * the accent is only remapped to a brighter cartoon colour for rendering.
 */
const STEEL = toon(TOON.steel);
const DARK = toon(TOON.dark);
const MATTE = toon("#4a4034");
const CHARCOAL = toon("#2c2620");
const GOLD = toon(TOON.gold);

export function AccentLight({
  color,
  position,
  intensity = 0.8,
}: {
  color: string;
  position: [number, number, number];
  intensity?: number;
}) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.intensity = intensity + Math.sin(clock.elapsedTime * 5 + position[0]) * 0.15;
  });
  return <pointLight ref={ref} position={position} color={color} intensity={intensity} distance={8} decay={2} />;
}

/** Faceted gem marker — flat colour, tiny pulse, no glow. */
export function Indicator({
  color = TOON.gold,
  position = [0, 0, 0],
  scale = 0.06,
}: {
  color?: string;
  position?: [number, number, number];
  scale?: number;
}) {
  const m = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (m.current) m.current.rotation.y = clock.elapsedTime * 1.6;
  });
  return (
    <mesh ref={m} position={position}>
      <octahedronGeometry args={[scale, 0]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Treadmill({ color }: { color: string }) {
  const belt = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (belt.current) {
      (belt.current.material as THREE.MeshBasicMaterial).opacity =
        0.72 + Math.sin(clock.elapsedTime * 8) * 0.22;
    }
  });
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.36, 1.6]} />
        <meshToonMaterial {...MATTE} />
        <InkOutlines />
      </mesh>
      <mesh ref={belt} position={[0, 0.32, 0.02]}>
        <boxGeometry args={[0.58, 0.03, 1.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.78, -0.4]} castShadow>
        <boxGeometry args={[0.62, 0.7, 0.14]} />
        <meshToonMaterial {...STEEL} />
        <InkOutlines />
      </mesh>
      <mesh position={[0, 1.05, -0.46]}>
        <planeGeometry args={[0.5, 0.32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Indicator color={color} position={[0.3, 0.6, -0.42]} />
      <Indicator color={color} position={[-0.3, 0.6, -0.42]} />
    </group>
  );
}

function Bike({ color }: { color: string }) {
  const fly = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (fly.current) fly.current.rotation.x = clock.elapsedTime * 4;
  });
  return (
    <group>
      <mesh position={[0, 0.5, -0.5]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.12]} />
        <meshToonMaterial {...STEEL} />
        <InkOutlines />
      </mesh>
      <mesh position={[0, 0.9, 0.15]}>
        <boxGeometry args={[0.55, 0.12, 0.9]} />
        <meshToonMaterial {...DARK} />
        <InkOutlines thickness={0.012} />
      </mesh>
      <group ref={fly} position={[0, 0.95, 0.15]}>
        <mesh>
          <torusGeometry args={[0.22, 0.055, 6, 12]} />
          <meshToonMaterial {...CHARCOAL} />
          <InkOutlines thickness={0.012} />
        </mesh>
      </group>
      <mesh position={[0, 0.45, 0.15]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 8]} />
        <meshToonMaterial {...DARK} />
      </mesh>
      <Indicator color={color} position={[0.34, 0.85, 0.15]} />
    </group>
  );
}

function Rower({ color }: { color: string }) {
  const handle = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (handle.current) handle.current.position.x = Math.sin(clock.elapsedTime * 3) * 0.18;
  });
  return (
    <group>
      <mesh position={[0, 0.35, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.7, 1.9]} />
        <meshToonMaterial {...MATTE} />
        <InkOutlines />
      </mesh>
      <mesh ref={handle} position={[0, 0.55, 0.3]}>
        <boxGeometry args={[0.5, 0.05, 0.08]} />
        <meshToonMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.5, -0.85]}>
        <cylinderGeometry args={[0.16, 0.22, 0.1, 8]} />
        <meshToonMaterial {...DARK} />
      </mesh>
      <Indicator color={color} position={[0.28, 0.8, -0.5]} />
    </group>
  );
}

function SquatRack({ color }: { color: string }) {
  const h = 2.6;
  return (
    <group>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, h / 2, -0.4]} castShadow>
          <boxGeometry args={[0.12, h, 0.12]} />
          <meshToonMaterial {...STEEL} />
          <InkOutlines thickness={0.012} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, -0.4]} castShadow>
        <boxGeometry args={[1.9, 0.08, 0.14]} />
        <meshToonMaterial {...STEEL} />
        <InkOutlines thickness={0.012} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.09, 0.7]} />
        <meshToonMaterial {...MATTE} />
        <InkOutlines />
      </mesh>
      <mesh position={[0, 0.325, 0]}>
        <boxGeometry args={[1.9, 0.012, 0.03]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.35, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.9, 8]} />
        <meshToonMaterial {...STEEL} />
      </mesh>
      <Indicator color={color} position={[0.62, 0.3, -0.12]} />
      <Indicator color={color} position={[-0.62, 0.3, -0.12]} />
    </group>
  );
}

function BenchPress({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.42, 0.25]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.1, 1.7]} />
        <meshToonMaterial {...MATTE} />
        <InkOutlines />
      </mesh>
      <mesh position={[0, 0.78, 0.25]} castShadow>
        <boxGeometry args={[0.45, 0.09, 1.55]} />
        <meshToonMaterial {...DARK} />
        <InkOutlines thickness={0.012} />
      </mesh>
      {[0.32, -0.32].map((x) => (
        <mesh key={x} position={[x, 1.22, -0.4]} castShadow>
          <boxGeometry args={[0.07, 0.5, 0.09]} />
          <meshToonMaterial {...STEEL} />
        </mesh>
      ))}
      <mesh position={[0, 1.45, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.7, 8]} />
        <meshToonMaterial {...STEEL} />
      </mesh>
      <Indicator color={color} position={[0.32, 0.2, 0.9]} />
    </group>
  );
}

function DumbbellRack({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.75, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.6, 0.14]} />
        <meshToonMaterial {...STEEL} />
        <InkOutlines />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.08, 0.5]} />
        <meshToonMaterial {...MATTE} />
      </mesh>
      {[-0.02, 0.02].map((dx, i) =>
        [0.62, 1.0].map((y, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[dx, y, 0.02]}
            rotation={[0, 0, i === 0 ? Math.PI / 2 : 0]}
            castShadow
          >
            <cylinderGeometry args={[0.045, 0.045, 0.3, 6]} />
            <meshToonMaterial {...(j === 0 ? DARK : GOLD)} />
          </mesh>
        ))
      )}
      <Indicator color={color} position={[0.4, 0.5, 0.2]} />
    </group>
  );
}

function Kettlebell({ color }: { color: string }) {
  return (
    <group>
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]} scale={[1, 0.85, 1]} castShadow>
          <icosahedronGeometry args={[0.12, 0]} />
          <meshToonMaterial {...DARK} />
          <InkOutlines thickness={0.012} />
        </mesh>
      ))}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.5]} />
        <meshToonMaterial {...MATTE} />
      </mesh>
      <Indicator color={color} position={[0.5, 0.4, 0.1]} />
    </group>
  );
}

function PlyoBoxes({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        <meshToonMaterial {...toon(TOON.orange)} />
        <InkOutlines />
      </mesh>
      <mesh position={[0.9, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.9, 0.65]} />
        <meshToonMaterial {...toon(TOON.teal)} />
        <InkOutlines />
      </mesh>
      <mesh position={[-0.9, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.3, 0.65]} />
        <meshToonMaterial {...toon(TOON.coral)} />
        <InkOutlines />
      </mesh>
      <Indicator color={color} position={[0.3, 0.5, -0.28]} />
    </group>
  );
}

function Ropes({ color }: { color: string }) {
  const rope = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!rope.current) return;
    const t = clock.elapsedTime * 3;
    rope.current.children.forEach((c, i) => {
      c.position.y = Math.sin(t + i * 0.7) * 0.12;
    });
  });
  return (
    <group>
      {[0, 1].map((i) => (
        <mesh key={i} position={[(i - 0.5) * 0.9, 0.4, 0]}>
          <torusGeometry args={[0.42, 0.07, 6, 12]} />
          <meshToonMaterial {...STEEL} />
          <InkOutlines thickness={0.012} />
        </mesh>
      ))}
      <group ref={rope} position={[0, 0, 0]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[(i - 2) * 0.34, 0.92, 0]} castShadow>
            <boxGeometry args={[0.34, 1.8, 0.045]} />
            <meshToonMaterial {...toon(TOON.gold)} />
          </mesh>
        ))}
      </group>
      <Indicator color={color} position={[-0.4, 0.7, 0]} />
      <Indicator color={color} position={[0.4, 0.7, 0]} />
    </group>
  );
}

function Mat({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.035, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.07, 2.2]} />
        <meshToonMaterial {...toon(TOON.lilac)} />
        <InkOutlines />
      </mesh>
      <mesh position={[0, 0.052, 0]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <Indicator color={color} position={[-0.6, 0.3, -0.9]} />
    </group>
  );
}

function Sauna({ color }: { color: string }) {
  const glow = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glow.current) {
      (glow.current.material as THREE.MeshBasicMaterial).opacity =
        0.72 + Math.sin(clock.elapsedTime * 2.5) * 0.24;
    }
  });
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.78, 1.6, 8]} />
        <meshToonMaterial {...DARK} />
        <InkOutlines />
      </mesh>
      <mesh position={[0, 0.85, 0.55]}>
        <torusGeometry args={[0.4, 0.05, 6, 12]} />
        <meshToonMaterial {...STEEL} />
      </mesh>
      <mesh ref={glow} position={[0, 0.9, 0.56]}>
        <circleGeometry args={[0.3, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <Indicator color={color} position={[-0.5, 0.3, 0.5]} />
    </group>
  );
}

export default function Equipment({
  kind,
  color,
  position,
  rotY = 0,
}: {
  kind: EquipmentKind;
  color: string;
  position: [number, number, number];
  rotY?: number;
}) {
  const pop = popFor(color);
  let node: React.ReactNode;
  switch (kind) {
    case "treadmill": node = <Treadmill color={pop} />; break;
    case "bike": node = <Bike color={pop} />; break;
    case "rower": node = <Rower color={pop} />; break;
    case "squatrack": node = <SquatRack color={pop} />; break;
    case "benchpress": node = <BenchPress color={pop} />; break;
    case "dumbbells": node = <DumbbellRack color={pop} />; break;
    case "kettlebell": node = <Kettlebell color={pop} />; break;
    case "plyobox": node = <PlyoBoxes color={pop} />; break;
    case "ropes": node = <Ropes color={pop} />; break;
    case "mat": node = <Mat color={pop} />; break;
    case "sauna": node = <Sauna color={pop} />; break;
    default: node = null;
  }
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {node}
    </group>
  );
}
