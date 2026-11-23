"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  COLLISION_MAP,
  PATHS,
  PROPS,
  TERMINALS,
  WORLD_ZONES,
} from "../level";
import Equipment, { AccentLight, Indicator } from "./Equipment";
import ZoneTag from "./ZoneTag";

const WALL_H = 3.4;

/** Brutalist surfaces: matte, low metalness, flat normals. */
const WALL = { color: "#231f1a", metalness: 0.14, roughness: 0.94, flatShading: true };
const WALL_TRIM = { color: "#14110c", metalness: 0.26, roughness: 0.82, flatShading: true };
const FLOOR = { color: "#100e0c", metalness: 0.08, roughness: 0.98, flatShading: true };

function Walls() {
  const boxes = useMemo(
    () =>
      COLLISION_MAP.map(([x0, z0, x1, z1], i) => {
        const w = Math.abs(x1 - x0);
        const d = Math.abs(z1 - z0);
        return {
          key: i,
          pos: [x0 + (x1 - x0) / 2, WALL_H / 2, z0 + (z1 - z0) / 2] as [number, number, number],
          size: [w, WALL_H, d] as [number, number, number],
        };
      }),
    []
  );
  return (
    <group>
      {boxes.map((b) => (
        <mesh key={b.key} position={b.pos} receiveShadow castShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial {...WALL} />
        </mesh>
      ))}
    </group>
  );
}

/** Hard satin-brass band at eye level. Reads as a line, not a glow. */
function WallTrim() {
  const boxes = useMemo(
    () =>
      COLLISION_MAP.map(([x0, z0, x1, z1], i) => {
        const w = Math.abs(x1 - x0);
        const d = Math.abs(z1 - z0);
        return {
          key: i,
          pos: [x0 + (x1 - x0) / 2, 1.15, z0 + (z1 - z0) / 2] as [number, number, number],
          size: [w + 0.02, 0.05, d + 0.02] as [number, number, number],
        };
      }),
    []
  );

  return (
    <group>
      {boxes.map((b) => (
        <mesh key={`trim-${b.key}`} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color="#c9a227"
            emissive="#5e4a12"
            emissiveIntensity={0.18}
            metalness={0.45}
            roughness={0.62}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function FloorGrid() {
  const ref = useRef<THREE.GridHelper>(null);

  useEffect(() => {
    if (!ref.current) return;
    const material = ref.current.material as THREE.LineBasicMaterial;
    material.transparent = true;
    material.opacity = 0.16;
    material.depthWrite = false;
  }, []);

  return (
    <gridHelper
      ref={ref}
      args={[76, 38, "#c9a227", "#4a453a"]}
      position={[0, 0.006, 0]}
    />
  );
}

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[76, 64]} />
        <meshStandardMaterial {...FLOOR} />
      </mesh>
      <FloorGrid />
      {/* hard zone plates — flat, opaque-edged colour blocks */}
      {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => (
        <mesh key={z.id} rotation={[-Math.PI / 2, 0, 0]} position={[(z.x0 + z.x1) / 2, 0.003, (z.z0 + z.z1) / 2]}>
          <planeGeometry args={[z.x1 - z.x0, z.z1 - z.z0]} />
          <meshBasicMaterial color={z.accent} transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/** Single crisp line per path. No soft outer glow. */
function PathStrips() {
  const seg = useMemo(() => {
    const arr: { len: number; pos: [number, number, number]; rot: number }[] = [];
    for (const p of PATHS) {
      const ax = p.start[0], az = p.start[2];
      const bx = p.end[0], bz = p.end[2];
      const dx = bx - ax, dz = bz - az;
      arr.push({
        len: Math.hypot(dx, dz),
        pos: [(ax + bx) / 2, 0.02, (az + bz) / 2],
        rot: Math.atan2(dx, dz),
      });
    }
    return arr;
  }, []);
  return (
    <group>
      {seg.map((s, i) => (
        <group key={i} position={s.pos} rotation={[0, s.rot, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.14, s.len]} />
            <meshBasicMaterial color="#e8c46a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Flat stencil logo. No blur, no light sweep, no particles. */
function Logo() {
  const logo = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = "700 150px 'Oswald', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#d4af37";
    ctx.fillText("GYMVERSE", 512, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <group position={[0, 1.6, 4]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4.6, 1.15]} />
        <meshBasicMaterial map={logo} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[4.7, 1.24]} />
        <meshBasicMaterial color="#c9a227" toneMapped={false} />
      </mesh>
      <Indicator color="#d4af37" position={[-2, -0.6, 0]} />
      <Indicator color="#d4af37" position={[2, -0.6, 0]} />
    </group>
  );
}

function Terminal({ id }: { id: string }) {
  const t = TERMINALS.find((x) => x.id === id)!;
  const face = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#070604";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, 464, 464);
    ctx.fillStyle = t.accent;
    ctx.font = "700 150px 'Oswald', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.label, 256, 210);
    ctx.font = "600 52px 'Oswald', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("PRESS [E]", 256, 320);
    return new THREE.CanvasTexture(c);
  }, [t]);
  const screen = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (screen.current) {
      (screen.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.85 + Math.sin(clock.elapsedTime * 4) * 0.15;
    }
  });
  return (
    <group position={t.position} rotation={[0, t.rotY, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.0, 0.5]} />
        <meshStandardMaterial {...WALL_TRIM} />
      </mesh>
      <mesh ref={screen} position={[0, 1.5, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial map={face} emissiveMap={face} emissive={t.accent} emissiveIntensity={0.85} toneMapped={false} flatShading />
      </mesh>
      <mesh position={[0, 0.95, 0.02]}>
        <boxGeometry args={[1.9, 0.06, 0.06]} />
        <meshStandardMaterial color={t.accent} emissive={t.accent} emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <AccentLight color={t.accent} position={[0, 2.2, 0.3]} intensity={1} />
      <Indicator color={t.accent} position={[0.9, 0.3, 0.28]} />
    </group>
  );
}

function ZoneMarker({ accent, position }: { accent: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color={accent} transparent opacity={0.14} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Ceiling() {
  return (
    <group>
      <mesh position={[0, 6.4, 0]} receiveShadow>
        <boxGeometry args={[76, 0.12, 64]} />
        <meshStandardMaterial color="#14110c" metalness={0.3} roughness={0.84} flatShading />
      </mesh>
      {/* raw fluorescent bars — hard emissive, no halo */}
      {[-24, -12, 0, 12, 24].map((x) => (
        <mesh key={x} position={[x, 6.2, 0]}>
          <boxGeometry args={[0.35, 0.06, 30]} />
          <meshBasicMaterial color="#ffe6b0" toneMapped={false} />
        </mesh>
      ))}
      {[-18, 0, 18].map((z) => (
        <mesh key={z} position={[0, 6.2, z]}>
          <boxGeometry args={[64, 0.06, 0.35]} />
          <meshBasicMaterial color="#ffe6b0" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

const memoized = memo(function GymWorld() {
  return (
    <group>
      <Floor />
      <Walls />
      <WallTrim />
      <Ceiling />
      <PathStrips />

      {/* navigation zone labels above doorways */}
      {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => {
        const cx = (z.x0 + z.x1) / 2;
        const cz = (z.z0 + z.z1) / 2;
        return (
          <ZoneTag
            key={z.id}
            text={z.name}
            color={z.accent}
            width={2.8}
            height={0.5}
            position={[cx, 5.6, cz]}
          />
        );
      })}

      <Logo />

      {/* terminals */}
      {TERMINALS.map((t) => (
        <Terminal key={t.id} id={t.id} />
      ))}

      {/* equipment */}
      {PROPS.map((p, i) => (
        <Equipment key={i} kind={p.kind} color={p.accent} position={p.position} rotY={p.rotY ?? 0} />
      ))}

      {/* sparse zone practicals */}
      {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => (
        <AccentLight key={z.id} color={z.accent} position={[(z.x0 + z.x1) / 2, 2.8, (z.z0 + z.z1) / 2]} intensity={0.8} />
      ))}

      <ZoneMarker accent="#b8860b" position={[30, 2, 16]} />
    </group>
  );
});

export default memoized;
