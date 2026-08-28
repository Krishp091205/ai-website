"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EquipmentKind } from "../level";

const STEEL = { color: "#3c4046", metalness: 0.9, roughness: 0.3 };
const DARK = { color: "#1c1d20", metalness: 0.6, roughness: 0.5 };
const MATTE = { color: "#25272b", metalness: 0.2, roughness: 0.85 };
const CHARCOAL = { color: "#101114", metalness: 0.4, roughness: 0.6 };

export function AccentLight({
  color,
  position,
  intensity = 2.4,
}: {
  color: string;
  position: [number, number, number];
  intensity?: number;
}) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.intensity = intensity + Math.sin(clock.elapsedTime * 6 + position[0]) * 0.5;
  });
  return <pointLight ref={ref} position={position} color={color} intensity={intensity} distance={9} decay={2} />;
}

/** Small pulsing indicator light. */
export function Indicator({
  color = "#22d3ee",
  position = [0, 0, 0],
  scale = 0.05,
}: {
  color?: string;
  position?: [number, number, number];
  scale?: number;
}) {
  const m = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!m.current) return;
    (m.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      2 + Math.sin(clock.elapsedTime * 8) * 1.2;
  });
  return (
    <mesh ref={m} position={position}>
      <sphereGeometry args={[scale, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} toneMapped={false} />
    </mesh>
  );
}

function Treadmill({ color }: { color: string }) {
  const belt = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (belt.current) {
      const t = (clock.elapsedTime * 0.6) % 0.7;
      (belt.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + Math.sin(t * 30) * 0.5;
    }
  });
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.36, 1.6]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      <mesh ref={belt} position={[0, 0.32, 0.02]}>
        <boxGeometry args={[0.58, 0.03, 1.3]} />
        <meshStandardMaterial color="#0a0a0b" emissive={color} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.78, -0.4]} castShadow>
        <boxGeometry args={[0.62, 0.7, 0.14]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 1.05, -0.46]}>
        <planeGeometry args={[0.5, 0.32]} />
        <meshStandardMaterial color="#04121f" emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <Indicator color={color} position={[0.3, 0.6, -0.42]} />
      <Indicator color={color} position={[-0.3, 0.6, -0.42]} />
    </group>
  );
}

function Bike({ color }: { color: string }) {
  const fly = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (fly.current) fly.current.rotation.x = Math.sin(clock.elapsedTime * 6) * 0.5;
  });
  return (
    <group>
      <mesh position={[0, 0.5, -0.5]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.9, 0.15]}>
        <meshStandardMaterial {...DARK} />
        <boxGeometry args={[0.55, 0.12, 0.9]} />
      </mesh>
      <group ref={fly} position={[0, 0.95, 0.15]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.22, 0.04, 10, 20]} />
          <meshStandardMaterial {...CHARCOAL} />
        </mesh>
      </group>
      <mesh position={[0, 0.45, 0.15]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 20]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <Indicator color={color} position={[0.34, 0.85, 0.15]} />
    </group>
  );
}

function Rower({ color }: { color: string }) {
  const handle = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (handle.current) handle.current.position.x = Math.sin(clock.elapsedTime * 3) * 0.16;
  });
  return (
    <group>
      <mesh position={[0, 0.35, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.7, 1.9]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      <mesh ref={handle} position={[0, 0.55, 0.3]}>
        <boxGeometry args={[0.5, 0.05, 0.08]} />
        <meshStandardMaterial color="#c9ccd2" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, -0.85]}>
        <cylinderGeometry args={[0.16, 0.22, 0.1, 18]} />
        <meshStandardMaterial {...DARK} />
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
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, -0.4]} castShadow>
        <boxGeometry args={[1.9, 0.08, 0.14]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.09, 0.7]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      {/* barbell */}
      <mesh position={[0, 1.35, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.9, 10]} />
        <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.25} />
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
        <meshStandardMaterial {...MATTE} />
      </mesh>
      <mesh position={[0, 0.78, 0.25]} castShadow>
        <boxGeometry args={[0.45, 0.09, 1.55]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {[0.32, -0.32].map((x) => (
        <mesh key={x} position={[x, 1.22, -0.4]} castShadow>
          <boxGeometry args={[0.07, 0.5, 0.09]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
      <mesh position={[0, 1.45, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.7, 10]} />
        <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.25} />
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
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.08, 0.5]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      {[-0.02, 0.02].map((dx, i) =>
        [0.62, 1.0].map((y, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[dx, y, 0.02]}
            rotation={[0, 0, i === 0 ? Math.PI / 2 : 0]}
            castShadow
          >
            <cylinderGeometry args={[0.035, 0.035, 0.3, 10]} />
            <meshStandardMaterial {...STEEL} />
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
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial color="#191a1d" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.5]} />
        <meshStandardMaterial {...MATTE} />
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
        <meshStandardMaterial color="#2c2e33" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0.9, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.9, 0.65]} />
        <meshStandardMaterial color="#23252a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[-0.9, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.3, 0.65]} />
        <meshStandardMaterial color="#303238" metalness={0.3} roughness={0.6} />
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
      c.position.x = Math.sin(t + i * 1.2) * 0.16;
    });
  });
  return (
    <group>
      {[0, 1].map((i) => (
        <mesh key={i} position={[(i - 0.5) * 0.9, 0.4, 0]}>
          <torusGeometry args={[0.42, 0.06, 8, 20]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
      <group ref={rope} position={[0, 0, 0]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[(i - 2) * 0.34, 0.92, 0]} castShadow>
            <boxGeometry args={[0.34, 1.8, 0.045]} />
            <meshStandardMaterial color="#2f3135" metalness={0} roughness={0.95} />
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
        <meshStandardMaterial color="#23262d" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <Indicator color={color} position={[-0.6, 0.3, -0.9]} />
    </group>
  );
}

function Sauna({ color }: { color: string }) {
  const glow = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glow.current) {
      (glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.2 + Math.sin(clock.elapsedTime * 2.5) * 0.6;
    }
  });
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.78, 1.6, 24]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0, 0.85, 0.55]}>
        <torusGeometry args={[0.4, 0.04, 8, 24]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh ref={glow} position={[0, 0.9, 0.56]}>
        <circleGeometry args={[0.3, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
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
  let node: React.ReactNode;
  switch (kind) {
    case "treadmill": node = <Treadmill color={color} />; break;
    case "bike": node = <Bike color={color} />; break;
    case "rower": node = <Rower color={color} />; break;
    case "squatrack": node = <SquatRack color={color} />; break;
    case "benchpress": node = <BenchPress color={color} />; break;
    case "dumbbells": node = <DumbbellRack color={color} />; break;
    case "kettlebell": node = <Kettlebell color={color} />; break;
    case "plyobox": node = <PlyoBoxes color={color} />; break;
    case "ropes": node = <Ropes color={color} />; break;
    case "mat": node = <Mat color={color} />; break;
    case "sauna": node = <Sauna color={color} />; break;
    default: node = null;
  }
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {node}
    </group>
  );
}
