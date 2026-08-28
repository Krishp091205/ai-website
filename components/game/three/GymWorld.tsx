"use client";

import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
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

const WALL = { color: "#17181b", metalness: 0.35, roughness: 0.65 };
const WALL_TRIM = { color: "#23252a", metalness: 0.5, roughness: 0.5 };

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

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[76, 64]} />
        <meshStandardMaterial color="#0b0c0f" metalness={0.3} roughness={0.75} />
      </mesh>
      {/* zone accent floor tiles */}
      {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => (
        <mesh key={z.id} rotation={[-Math.PI / 2, 0, 0]} position={[(z.x0 + z.x1) / 2, 0.002, (z.z0 + z.z1) / 2]}>
          <planeGeometry args={[z.x1 - z.x0, z.z1 - z.z0]} />
          <meshBasicMaterial color={z.accent} transparent opacity={0.04} />
        </mesh>
      ))}
    </group>
  );
}

function PathStrips() {
  const seg = useMemo(() => {
    const arr: { a: [number, number]; b: [number, number]; len: number; pos: [number, number, number]; rot: number }[] = [];
    for (const p of PATHS) {
      const ax = p.start[0], az = p.start[2];
      const bx = p.end[0], bz = p.end[2];
      const dx = bx - ax, dz = bz - az;
      const len = Math.hypot(dx, dz);
      arr.push({
        a: [ax, az],
        b: [bx, bz],
        len,
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
            <planeGeometry args={[0.55, s.len]} />
            <meshBasicMaterial color="#4a9eff" transparent opacity={0.5} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <planeGeometry args={[0.8, s.len]} />
            <meshBasicMaterial color="#4a9eff" transparent opacity={0.09} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

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
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, "#2b8cff");
    grad.addColorStop(0.5, "#9adeff");
    grad.addColorStop(1, "#2b8cff");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#4a9eff";
    ctx.shadowBlur = 40;
    ctx.fillText("GYMVERSE", 512, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  const sweep = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (sweep.current) {
      const x = ((clock.elapsedTime * 0.6) % 2) - 1;
      sweep.current.position.x = x;
    }
  });
  return (
    <group position={[0, 1.6, 4]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4.6, 1.15]} />
        <meshBasicMaterial map={logo} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[4.8, 1.3]} />
        <meshBasicMaterial color="#4a9eff" transparent opacity={0.06} toneMapped={false} />
      </mesh>
      {/* light sweep */}
      <mesh ref={sweep} position={[0, 0, -0.02]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.7, 1.35]} />
        <meshBasicMaterial color="#bde7ff" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <Sparkles count={26} scale={[6, 2, 3]} size={1.6} speed={0.3} opacity={0.4} color="#7fd0ff" />
      <Indicator color="#4a9eff" position={[-2, -0.6, 0]} />
      <Indicator color="#4a9eff" position={[2, -0.6, 0]} />
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
    ctx.fillStyle = "#020508";
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
    ctx.globalAlpha = 0.7;
    ctx.fillText("PRESS [E]", 256, 320);
    ctx.globalAlpha = 1;
    return new THREE.CanvasTexture(c);
  }, [t]);
  const screen = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (screen.current) {
      (screen.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.1 + Math.sin(clock.elapsedTime * 4) * 0.3;
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
        <meshStandardMaterial map={face} emissiveMap={face} emissive={t.accent} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.95, 0.02]}>
        <boxGeometry args={[1.9, 0.06, 0.06]} />
        <meshStandardMaterial color={t.accent} emissive={t.accent} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <AccentLight color={t.accent} position={[0, 2.2, 0.3]} intensity={2} />
      <Indicator color={t.accent} position={[0.9, 0.3, 0.28]} />
    </group>
  );
}

function ZoneMarker({ accent, position }: { accent: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color={accent} transparent opacity={0.08} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Ceiling() {
  return (
    <group>
      <mesh position={[0, 6.4, 0]} receiveShadow>
        <boxGeometry args={[76, 0.12, 64]} />
        <meshStandardMaterial color="#0d0e11" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* light strips */}
      {[-24, -12, 0, 12, 24].map((x) => (
        <mesh key={x} position={[x, 6.2, 0]}>
          <boxGeometry args={[0.35, 0.06, 30]} />
          <meshStandardMaterial color="#dce9ff" emissive="#4a9eff" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      {[-18, 0, 18].map((z) => (
        <mesh key={z} position={[0, 6.2, z]}>
          <boxGeometry args={[64, 0.06, 0.35]} />
          <meshStandardMaterial color="#dce9ff" emissive="#4a9eff" emissiveIntensity={1.0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default memo(function GymWorld({ reduced }: { reduced: boolean }) {
  return (
    <group>
      <Floor />
      <Walls />
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

      {/* per-zone ambient accent lights near doorways */}
      {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => (
        <AccentLight key={z.id} color={z.accent} position={[(z.x0 + z.x1) / 2, 2.8, (z.z0 + z.z1) / 2]} intensity={1.6} />
      ))}

      {!reduced && (
        <Sparkles
          count={120}
          scale={[60, 5, 50]}
          position={[0, 2.8, 0]}
          size={1.2}
          speed={0.2}
          opacity={0.3}
          color="#8fa8bf"
        />
      )}

      <ZoneMarker accent="#f87171" position={[30, 2, 16]} />
    </group>
  );
});
