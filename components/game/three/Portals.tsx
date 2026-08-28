"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { PORTALS, PORTAL_COMMANDS } from "../data";
import { useGame, type PortalId } from "../store";
import { sound } from "../sound";

function Portal({ id }: { id: PortalId }) {
  const def = PORTALS.find((p) => p.id === id)!;
  const color = id === "membership" ? "#f59e0b" : "#4a9eff";
  const openPortal = useGame((s) => s.openPortal);
  const setCursor = useGame((s) => s.setCursor);
  const [hovered, setHovered] = useState(false);
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      const target = hovered ? 1.18 : 1;
      group.current.scale.lerp(
        new THREE.Vector3(target, target, target),
        0.12
      );
      group.current.position.y = def.position[1] + Math.sin(t * 1.4 + def.position[0]) * 0.06;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.35;
      (ring.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.4 + (hovered ? 1.3 : 0.4) + Math.sin(t * 3 + def.position[0]) * 0.3;
    }
    if (inner.current) {
      inner.current.rotation.z = -t * 0.5;
      (inner.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.1 + (hovered ? 1.4 : 0.5) + Math.sin(t * 2.4) * 0.4;
    }
  });

  const activate = () => {
    sound.whoosh();
    const p = def.position;
    const dir = new THREE.Vector3(...p).normalize();
    const to: [number, number, number] = [
      p[0] - dir.x * 2.4,
      1.7,
      p[2] - dir.z * 2.4,
    ];
    const look: [number, number, number] = [p[0], 1.7, p[2]];
    openPortal(id, { to, look });
  };

  return (
    <group position={def.position}>
      <group ref={group}>
        <mesh
          ref={ring}
          castShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            setCursor({
              label: PORTAL_COMMANDS[id] ?? "ENTER",
              sub: `${def.name} · ${def.tagline}`,
            });
            sound.hover();
          }}
          onPointerOut={() => {
            setHovered(false);
            setCursor({ label: null, sub: null });
          }}
          onClick={(e) => {
            e.stopPropagation();
            activate();
          }}
        >
          <torusGeometry args={[1.1, 0.1, 12, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.6}
            toneMapped={false}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
        <mesh ref={inner}>
          <circleGeometry args={[0.95, 40]} />
          <meshStandardMaterial
            color="#060810"
            emissive={color}
            emissiveIntensity={1.2}
            toneMapped={false}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.9, 0.9, 0.6, 32, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <Sparkles
          count={12}
          scale={[1.4, 1.4, 1.4]}
          size={2.2}
          speed={0.5}
          opacity={0.55}
          color={color}
        />
      </group>
    </group>
  );
}

export default function Portals() {
  return (
    <group>
      {PORTALS.map((p) => (
        <Portal key={p.id} id={p.id} />
      ))}
    </group>
  );
}
