"use client";

import { memo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { PORTALS, PORTAL_COMMANDS, ZONES } from "../data";
import { useGame, type PortalId } from "../store";
import { sound } from "../sound";
import ZoneTag from "./ZoneTag";

function Portal({ id }: { id: PortalId }) {
  const def = PORTALS.find((p) => p.id === id)!;
  const zone = ZONES[id];
  const color = zone.accent;
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
      group.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
      group.current.position.y = def.position[1] + Math.sin(t * 1.4 + def.position[0]) * 0.05;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.35;
      (ring.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.5 + (hovered ? 1.3 : 0.4) + Math.sin(t * 3 + def.position[0]) * 0.3;
    }
    if (inner.current) {
      inner.current.rotation.z = -t * 0.5;
      (inner.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.2 + (hovered ? 1.4 : 0.5) + Math.sin(t * 2.4) * 0.4;
    }
  });

  return (
    <group position={def.position}>
      <group ref={group} rotation={[0, def.rotY ?? 0, 0]}>
        <mesh
          ref={ring}
          castShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            setCursor({
              label: PORTAL_COMMANDS[id] ?? "ENTER",
              sub: `${def.name} · ${zone.blurb}`,
            });
            sound.hover();
          }}
          onPointerOut={() => {
            setHovered(false);
            setCursor({ label: null, sub: null });
          }}
          onClick={(e) => {
            e.stopPropagation();
            sound.whoosh();
            openPortal(id, zone.anchor);
          }}
        >
          <torusGeometry args={[1.05, 0.1, 12, 48]} />
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
          <circleGeometry args={[0.92, 40]} />
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
          <cylinderGeometry args={[0.85, 0.85, 0.6, 32, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[1.9, 0.14, 0.2]} />
          <meshStandardMaterial {...doorSteel} />
        </mesh>
        <mesh position={[-1.05, 0, 0]}>
          <boxGeometry args={[0.16, 3.3, 0.18]} />
          <meshStandardMaterial {...doorSteel} />
        </mesh>
        <mesh position={[1.05, 0, 0]}>
          <boxGeometry args={[0.16, 3.3, 0.18]} />
          <meshStandardMaterial {...doorSteel} />
        </mesh>
        <ZoneTag
          text={def.name}
          color={color}
          width={1.7}
          height={0.3}
          position={[0, 2.8, 0]}
        />
        <Sparkles
          count={12}
          scale={[1.3, 1.3, 1.3]}
          size={2.4}
          speed={0.5}
          opacity={0.55}
          color={color}
        />
      </group>
    </group>
  );
}

const doorSteel = { color: "#2b2d33", metalness: 0.8, roughness: 0.4 };

export default memo(function Portals() {
  return (
    <group>
      {PORTALS.map((p) => (
        <Portal key={p.id} id={p.id} />
      ))}
    </group>
  );
});