"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLLISION_MAP, PATHS, PROPS, TERMINALS, WORLD_ZONES } from "../level";
import Equipment, { AccentLight, Indicator } from "./Equipment";
import ZoneTag from "./ZoneTag";
import { INK, TOON, ZONE_TOON, InkOutlines, popFor, toon, toonGradient } from "./toon";

const WALL_H = 3.4;

const WALL = toon("#605348");
const WALL_TRIM = toon(TOON.dark);
const FLOOR = toon("#39332b");

function Walls() {
  const boxes = useMemo(
    () =>
      COLLISION_MAP.map(([x0, z0, x1, z1], i) => ({
        key: i,
        pos: [x0 + (x1 - x0) / 2, WALL_H / 2, z0 + (z1 - z0) / 2] as [number, number, number],
        size: [Math.abs(x1 - x0), WALL_H, Math.abs(z1 - z0)] as [number, number, number],
      })),
    []
  );
  return (
    <group>
      {boxes.map((b) => (
        <mesh key={b.key} position={b.pos} receiveShadow castShadow>
          <boxGeometry args={b.size} />
          <meshToonMaterial {...WALL} />
          <InkOutlines thickness={0.014} />
        </mesh>
      ))}
    </group>
  );
}

/** Chunky ink-banded trim instead of a soft glow strip. */
function WallTrim() {
  const boxes = useMemo(
    () =>
      COLLISION_MAP.map(([x0, z0, x1, z1], i) => ({
        key: i,
        pos: [x0 + (x1 - x0) / 2, 1.15, z0 + (z1 - z0) / 2] as [number, number, number],
        size: [Math.abs(x1 - x0) + 0.02, 0.08, Math.abs(z1 - z0) + 0.02] as [number, number, number],
      })),
    []
  );
  return (
    <group>
      {boxes.map((b) => (
        <mesh key={`trim-${b.key}`} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshToonMaterial {...toon(TOON.gold)} />
          <InkOutlines thickness={0.008} />
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
    material.opacity = 0.3;
    material.depthWrite = false;
  }, []);
  return <gridHelper ref={ref} args={[76, 38, INK, "#6b5f4f"]} position={[0, 0.006, 0]} />;
}

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[76, 64]} />
        <meshToonMaterial {...FLOOR} />
      </mesh>
      <FloorGrid />
      {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => (
        <mesh
          key={z.id}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[(z.x0 + z.x1) / 2, 0.003, (z.z0 + z.z1) / 2]}
        >
          <planeGeometry args={[z.x1 - z.x0, z.z1 - z.z0]} />
          <meshBasicMaterial color={ZONE_TOON[z.id] ?? z.accent} transparent opacity={0.25} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Bold ink-backed route lines — readable at a glance. */
function PathStrips() {
  const seg = useMemo(
    () =>
      PATHS.map((p, i) => {
        const dx = p.end[0] - p.start[0];
        const dz = p.end[2] - p.start[2];
        return {
          key: i,
          len: Math.hypot(dx, dz),
          pos: [(p.start[0] + p.end[0]) / 2, 0.02, (p.start[2] + p.end[2]) / 2] as [number, number, number],
          rot: Math.atan2(dx, dz),
        };
      }),
    []
  );
  return (
    <group>
      {seg.map((s) => (
        <group key={s.key} position={s.pos} rotation={[0, s.rot, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
            <planeGeometry args={[0.26, s.len]} />
            <meshBasicMaterial color={INK} toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, s.len]} />
            <meshBasicMaterial color={TOON.gold} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Flat cartoon wordmark with a hard shadow and ink outline. */
function Logo() {
  const logo = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = "700 160px 'Oswald', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 22;
    ctx.strokeStyle = INK;
    ctx.strokeText("GYMVERSE", 530, 138);
    ctx.fillStyle = INK;
    ctx.fillText("GYMVERSE", 530, 138);
    ctx.lineWidth = 14;
    ctx.strokeStyle = INK;
    ctx.strokeText("GYMVERSE", 512, 120);
    ctx.fillStyle = TOON.gold;
    ctx.fillText("GYMVERSE", 512, 120);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <group position={[0, 1.6, 4]}>
      <mesh position={[0, -0.04, -0.03]}>
        <planeGeometry args={[4.9, 1.3]} />
        <meshToonMaterial {...toon(TOON.orange)} />
        <InkOutlines thickness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4.6, 1.15]} />
        <meshBasicMaterial map={logo} transparent toneMapped={false} />
      </mesh>
      <Indicator color={TOON.cream} position={[-2, -0.6, 0]} />
      <Indicator color={TOON.cream} position={[2, -0.6, 0]} />
    </group>
  );
}

function Terminal({ id }: { id: string }) {
  const t = TERMINALS.find((x) => x.id === id)!;
  const pop = popFor(t.accent);
  const face = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = pop;
    ctx.fillRect(0, 0, 512, 512);
    ctx.lineWidth = 24;
    ctx.strokeStyle = INK;
    ctx.strokeRect(12, 12, 488, 488);
    ctx.fillStyle = INK;
    ctx.font = "700 92px 'Oswald', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.label, 256, 190);
    ctx.fillStyle = "#fffaf0";
    ctx.font = "700 54px 'Oswald', sans-serif";
    ctx.fillText("PRESS [E]", 256, 330);
    return new THREE.CanvasTexture(c);
  }, [t, pop]);

  return (
    <group position={t.position} rotation={[0, t.rotY, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.0, 0.5]} />
        <meshToonMaterial {...WALL_TRIM} />
        <InkOutlines />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={face} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.95, 0.02]}>
        <boxGeometry args={[1.9, 0.08, 0.08]} />
        <meshBasicMaterial color={pop} toneMapped={false} />
      </mesh>
      <AccentLight color={pop} position={[0, 2.2, 0.3]} intensity={0.7} />
      <Indicator color={pop} position={[0.9, 0.3, 0.28]} />
    </group>
  );
}

/** Slow-rotating cartoon gems and rings well above head height. */
function FloatingDecor() {
  const group = useRef<THREE.Group>(null);
  const pieces = useMemo(
    () =>
      [
        { p: [-8, 4.4, 5] as [number, number, number], c: TOON.orange, s: 0.28, r: "gem" },
        { p: [8, 4.8, 5] as [number, number, number], c: TOON.teal, s: 0.3, r: "ring" },
        { p: [-4, 5.1, -8] as [number, number, number], c: TOON.coral, s: 0.22, r: "gem" },
        { p: [5, 4.6, -9] as [number, number, number], c: TOON.lilac, s: 0.26, r: "ring" },
        { p: [0, 5.4, 12] as [number, number, number], c: TOON.gold, s: 0.32, r: "gem" },
      ],
    []
  );
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      child.rotation.y = clock.elapsedTime * (0.6 + i * 0.15);
      child.position.y = pieces[i].p[1] + Math.sin(clock.elapsedTime * 1.4 + i) * 0.18;
    });
  });
  return (
    <group ref={group}>
      {pieces.map((d, i) => (
        <group key={i} position={d.p}>
          <mesh scale={d.s}>
            {d.r === "gem" ? (
              <octahedronGeometry args={[1, 0]} />
            ) : (
              <torusGeometry args={[0.8, 0.28, 6, 10]} />
            )}
            <meshToonMaterial {...toon(d.c)} />
            <InkOutlines thickness={0.03} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ZoneMarker({ accent, position }: { accent: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.8, 0.8, 0.06]} />
        <meshToonMaterial {...toon(accent)} />
        <InkOutlines />
      </mesh>
    </group>
  );
}

function Ceiling() {
  return (
    <group>
      <mesh position={[0, 6.4, 0]} receiveShadow>
        <boxGeometry args={[76, 0.12, 64]} />
        <meshToonMaterial color="#2e2820" gradientMap={toonGradient()} />
      </mesh>
      {[-24, -12, 0, 12, 24].map((x) => (
        <mesh key={x} position={[x, 6.2, 0]}>
          <boxGeometry args={[0.35, 0.06, 30]} />
          <meshBasicMaterial color={TOON.cream} toneMapped={false} />
        </mesh>
      ))}
      {[-18, 0, 18].map((z) => (
        <mesh key={z} position={[0, 6.2, z]}>
          <boxGeometry args={[64, 0.06, 0.35]} />
          <meshBasicMaterial color={TOON.cream} toneMapped={false} />
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
      <FloatingDecor />

      {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => (
        <ZoneTag
          key={z.id}
          text={z.name}
          color={ZONE_TOON[z.id] ?? z.accent}
          width={3.2}
          height={0.6}
          position={[(z.x0 + z.x1) / 2, 5.4, (z.z0 + z.z1) / 2]}
        />
      ))}

      <Logo />

      {TERMINALS.map((t) => (
        <Terminal key={t.id} id={t.id} />
      ))}

      {PROPS.map((p, i) => (
        <Equipment key={i} kind={p.kind} color={p.accent} position={p.position} rotY={p.rotY ?? 0} />
      ))}

      {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => (
        <AccentLight
          key={z.id}
          color={ZONE_TOON[z.id] ?? z.accent}
          position={[(z.x0 + z.x1) / 2, 2.8, (z.z0 + z.z1) / 2]}
          intensity={0.75}
        />
      ))}

      <ZoneMarker accent={TOON.lime} position={[30, 2, 16]} />
    </group>
  );
});

export default memoized;
