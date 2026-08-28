"use client";

import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import ZoneTag from "./ZoneTag";

const STEEL = { color: "#3a3d42", metalness: 0.8, roughness: 0.35 };
const DARK = { color: "#1b1c1f", metalness: 0.55, roughness: 0.55 };
const MATTE = { color: "#232428", metalness: 0.2, roughness: 0.9 };

interface Open {
  side: "x+" | "x-" | "z+" | "z-";
  from: number;
  to: number;
}

function Room({
  cx,
  cz,
  hx,
  hz,
  open,
  accent = "#4a9eff",
}: {
  cx: number;
  cz: number;
  hx: number;
  hz: number;
  open: Open;
  accent?: string;
}) {
  const th = 0.16;
  const wallH = 3;
  const x0 = cx - hx;
  const x1 = cx + hx;
  const z0 = cz - hz;
  const z1 = cz + hz;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[hx * 2, hz * 2]} />
        <meshStandardMaterial color="#0c0c0e" metalness={0.3} roughness={0.85} />
      </mesh>
      <mesh position={[cx, 1.55, z1 - th / 2]}>
        <meshBasicMaterial color={accent} transparent opacity={0.04} />
        <planeGeometry args={[hx * 2 - 0.2, 0.06]} />
      </mesh>

      {([
        { z: z0, side: "z-" as const },
        { z: z1, side: "z+" as const },
      ] as const).map(({ z, side }) => {
        const segs: [number, number][] = [];
        if (open.side === side) {
          if (open.from - x0 > 0.2) segs.push([x0, open.from]);
          if (x1 - open.to > 0.2) segs.push([open.to, x1]);
        } else segs.push([x0, x1]);
        return segs.map(([a, b], j) =>
          b - a > 0.1 ? (
            <mesh key={`z${side}${j}`} position={[(a + b) / 2, wallH / 2, z]} receiveShadow>
              <boxGeometry args={[b - a, wallH, th]} />
              <meshStandardMaterial {...DARK} />
            </mesh>
          ) : null
        );
      })}

      {([
        { x: x0, side: "x-" as const },
        { x: x1, side: "x+" as const },
      ] as const).map(({ x, side }) => {
        const segs: [number, number][] = [];
        if (open.side === side) {
          if (open.from - z0 > 0.2) segs.push([z0, open.from]);
          if (z1 - open.to > 0.2) segs.push([open.to, z1]);
        } else segs.push([z0, z1]);
        return segs.map(([a, b], j) =>
          b - a > 0.1 ? (
            <mesh key={`x${side}${j}`} position={[x, wallH / 2, (a + b) / 2]} receiveShadow>
              <boxGeometry args={[th, wallH, b - a]} />
              <meshStandardMaterial {...DARK} />
            </mesh>
          ) : null
        );
      })}
    </group>
  );
}

function AccentLight({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.intensity =
      3.2 + Math.sin(clock.elapsedTime * 5 + position[0]) * 0.8;
  });
  return <pointLight ref={ref} position={position} color={color} intensity={3} distance={9} decay={2} />;
}

function LintelStrip({ position, accent, length = 2.6 }: { position: [number, number, number]; accent: string; length?: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[length, 0.07, 0.25]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
    </mesh>
  );
}

function AboutZone({ reduced }: { reduced?: boolean }) {
  return (
    <group>
      <Room cx={3.5} cz={-15.25} hx={4.75} hz={2.75} open={{ side: "z+", from: 3, to: 5.8 }} accent="#4a9eff" />
      <AccentLight position={[3.5, 2.6, -14.5]} color="#4a9eff" />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[7.1, 1.15 + i * 0.5, -15.2]}>
          <mesh>
            <planeGeometry args={[0.85, 0.38]} />
            <meshStandardMaterial color="#0b1626" emissive="#173a63" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[0.9, 0.43]} />
            <meshBasicMaterial color="#4a9eff" transparent opacity={0.08} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.4, 1.5, -15.2]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshStandardMaterial color="#101a28" emissive="#2a4a75" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.4, 1.5, -15.18]}>
        <torusGeometry args={[0.75, 0.02, 8, 30]} />
        <meshStandardMaterial color="#4a9eff" emissive="#4a9eff" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <mesh position={[2.2, 0.32, -17.2]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.64, 16]} />
        <meshStandardMaterial color="#c9a64f" metalness={0.9} roughness={0.25} emissive="#5c4620" emissiveIntensity={0.4} />
      </mesh>
      <LintelStrip position={[4.5, 2.5, -12.45]} accent="#4a9eff" />
      <ZoneTag text="ABOUT" position={[3.5, 2.5, -17] } rotation={[0, 0, 0]} />
      <Sparkles count={reduced ? 8 : 14} scale={[7, 2, 5]} position={[3.5, 1.8, -15.2]} size={2} speed={0.2} opacity={0.3} color="#4a9eff" />
    </group>
  );
}

function ProgramsZone({ reduced }: { reduced?: boolean }) {
  return (
    <group>
      <Room cx={16} cz={-3.75} hx={3} hz={3.25} open={{ side: "x-", from: -4.2, to: -0.8 }} accent="#4a9eff" />
      <AccentLight position={[16, 2.7, -3.5]} color="#4a9eff" />
      <mesh position={[18.5, 1.8, -3.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.6, 2.2]} />
        <meshStandardMaterial color="#0b1626" emissive="#173a63" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[18.47, 1.8, -3.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.7, 2.3]} />
        <meshBasicMaterial color="#4a9eff" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[16.5 - i * 1.1, 0.42, -5.9]}>
          <mesh castShadow>
            <boxGeometry args={[0.95, 0.14, 3.4]} />
            <meshStandardMaterial {...MATTE} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.85, 0.1, 2.9]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
        </group>
      ))}
      <mesh position={[15, 0.85, -1.3]} castShadow>
        <boxGeometry args={[1.3, 0.1, 1.3]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[15, 1.35, -1.3]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
        <boxGeometry args={[0.9, 0.06, 0.9]} />
        <meshStandardMaterial color="#0d2338" emissive="#4a9eff" emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <LintelStrip position={[13, 2.5, -2.4]} accent="#4a9eff" />
      <ZoneTag text="PROGRAMS" position={[18.4, 2.55, -3.6]} rotation={[0, Math.PI / 2, 0]} width={2.4} height={0.44} />
      <Sparkles count={reduced ? 8 : 14} scale={[6, 2, 6]} position={[16, 1.8, -3.75]} size={2} speed={0.2} opacity={0.3} color="#4a9eff" />
    </group>
  );
}

function TrainersZone({ reduced }: { reduced?: boolean }) {
  return (
    <group>
      <Room cx={16} cz={3.75} hx={3} hz={3.25} open={{ side: "x-", from: 1.5, to: 5.2 }} accent="#9dbaff" />
      <AccentLight position={[16, 2.7, 3.9]} color="#9dbaff" />
      <mesh position={[16, 2.8, 6.4]}>
        <torusGeometry args={[1.1, 0.045, 10, 40]} />
        <meshStandardMaterial color="#9dbaff" emissive="#9dbaff" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh position={[16, 0.15, 3.75]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.3, 32]} />
        <meshStandardMaterial color="#15161a" metalness={0.5} roughness={0.5} />
      </mesh>
      {[-1.4, 0, 1.4].map((x, i) => (
        <group key={i} position={[15.4, 0.32, 2.2 + i * 1.45]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.6, 0.64, 20]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[0.3, 0.9, 10, 1, true]} />
            <meshBasicMaterial color="#9dbaff" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <mesh position={[17.4, 1.3, 1.2]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.75, 0.16]} />
        <meshStandardMaterial color="#0d2338" emissive="#9dbaff" emissiveIntensity={0.9} />
      </mesh>
      <LintelStrip position={[13, 2.5, 3.3]} accent="#9dbaff" length={3} />
      <ZoneTag text="TRAINERS" position={[15.6, 2.75, 6.25]} width={2.8} height={0.52} color="#9dbaff" />
      <Sparkles count={reduced ? 8 : 12} scale={[6, 2, 6]} position={[16, 1.8, 3.75]} size={2} speed={0.25} opacity={0.3} color="#9dbaff" />
    </group>
  );
}

function FacilityZone({ reduced }: { reduced?: boolean }) {
  return (
    <group>
      <Room cx={-16} cz={-4.25} hx={3} hz={3.75} open={{ side: "x+", from: -6.5, to: -3.5 }} accent="#4a9eff" />
      <AccentLight position={[-16, 2.7, -4.5]} color="#4a9eff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, 0.03, -4.25]}>
        <planeGeometry args={[4.6, 0.9]} />
        <meshStandardMaterial color="#131a24" metalness={0.5} roughness={0.5} />
      </mesh>
      {[
        { x: -18.6, z: -5.4, kind: "treadmill" },
        { x: -16, z: -5.4, kind: "barbell" },
        { x: -13.4, z: -5.4, kind: "box" },
      ].map((p, i) => (
        <group key={i} position={[p.x, 0.6, p.z]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 1.2, 1.1]} />
            <meshStandardMaterial {...MATTE} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <boxGeometry args={[1.58, 0.05, 1.08]} />
            <meshStandardMaterial color="#4a9eff" emissive="#4a9eff" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
          {p.kind === "treadmill" && (
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.7, 0.12, 1]} />
              <meshStandardMaterial {...DARK} />
            </mesh>
          )}
          {p.kind === "barbell" && (
            <mesh position={[0, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 1.1, 8]} />
              <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.2} />
            </mesh>
          )}
          {p.kind === "box" && (
            <mesh position={[0, 0.16, 0]}>
              <boxGeometry args={[0.6, 0.32, 0.6]} />
              <meshStandardMaterial color="#303238" metalness={0.3} roughness={0.6} />
            </mesh>
          )}
        </group>
      ))}
      <LintelStrip position={[-13, 2.5, -5]} accent="#4a9eff" length={2.6} />
      <ZoneTag text="FACILITY" position={[-16, 2.5, -7.9]} width={3} height={0.55} />
      <Sparkles count={reduced ? 8 : 12} scale={[6, 2, 7]} position={[-16, 1.8, -4.25]} size={2} speed={0.2} opacity={0.3} color="#4a9eff" />
    </group>
  );
}

function MembershipZone({ reduced }: { reduced?: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, 0, 7.6]} receiveShadow>
        <planeGeometry args={[10, 1.6]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.85} />
      </mesh>
      <Room cx={14} cz={11.5} hx={3} hz={3} open={{ side: "z-", from: 10.4, to: 13.8 }} accent="#f59e0b" />
      <AccentLight position={[14, 2.7, 11]} color="#f8b84a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14, 0.02, 11.5]}>
        <planeGeometry args={[4.8, 4.8]} />
        <meshStandardMaterial color="#1a1510" metalness={0.3} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14, 0.035, 11.5]}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.06} />
      </mesh>
      {[
        [-0.9, -0.8, 0],
        [0.9, -0.8, 0.12],
      ].map(([x, z, rot], i) => (
        <group key={i} position={[14 + x, 0.4, 11.5 + z]} rotation={[0, rot, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.42, 0.9]} />
            <meshStandardMaterial {...MATTE} />
          </mesh>
          <mesh position={[0, 0.22, -0.4]} castShadow>
            <boxGeometry args={[0.9, 0.12, 0.08]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
        </group>
      ))}
      <mesh position={[14, 0.42, 12.7]} castShadow>
        <boxGeometry args={[1.1, 0.1, 0.6]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      <mesh position={[14, 0.74, 12.7]}>
        <boxGeometry args={[0.8, 0.04, 0.4]} />
        <meshStandardMaterial color="#2a2416" emissive="#f59e0b" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <ZONE_VAULTS />
      <LintelStrip position={[12, 2.6, 8.45]} accent="#f59e0b" length={2.8} />
      <ZoneTag text="VIP LOUNGE" position={[14, 2.6, 14.4]} width={3.6} height={0.6} color="#f59e0b" />
      <Sparkles count={reduced ? 10 : 18} scale={[5, 2.4, 6]} position={[14, 1.9, 11.5]} size={2.4} speed={0.22} opacity={0.4} color="#f5b942" />
    </group>
  );
}

function ZONE_VAULTS() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[14 + (i - 1) * 0.7, 1.05, 9.4]}>
          <torusGeometry args={[0.18, 0.025, 8, 22]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function ContactZone({ reduced }: { reduced?: boolean }) {
  return (
    <group>
      <Room cx={-16} cz={3.75} hx={3} hz={3.25} open={{ side: "x+", from: 1.8, to: 5.2 }} accent="#4a9eff" />
      <AccentLight position={[-16, 2.6, 3.6]} color="#4a9eff" />
      <mesh position={[-18.3, 0.72, 3.6]} castShadow>
        <boxGeometry args={[0.22, 1.45, 4.9]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[-17.9, 1.35, 3.75]} castShadow>
        <boxGeometry args={[0.55, 0.08, 4.9]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[-17.9, 1.44, 3.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.7, 0.33]} />
        <meshStandardMaterial color="#4a9eff" emissive="#4a9eff" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <mesh position={[-18.3, 1.28, 1.2]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.55, 0.5]} />
        <meshStandardMaterial color="#0d2338" emissive="#4a9eff" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[-18.3, 0.68, 1.2]}>
        <boxGeometry args={[0.2, 0.06, 0.3]} />
        <meshStandardMaterial color="#4a9eff" emissive="#4a9eff" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <mesh position={[-15.6, 2.3, 0.9]}>
        <torusGeometry args={[0.4, 0.035, 8, 26]} />
        <meshStandardMaterial color="#4a9eff" emissive="#4a9eff" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <LintelStrip position={[-13, 2.5, 3.5]} accent="#4a9eff" length={2.8} />
      <ZoneTag text="CONTACT" position={[-16, 2.6, 6.9]} width={3.2} height={0.55} />
      <Sparkles count={reduced ? 8 : 12} scale={[6, 2, 6]} position={[-16, 1.8, 3.75]} size={2} speed={0.2} opacity={0.3} color="#4a9eff" />
    </group>
  );
}

export default memo(function ZoneEnvironments({
  reduced = false,
}: {
  reduced?: boolean;
}) {
  return (
    <group>
      <AboutZone reduced={reduced} />
      <ProgramsZone reduced={reduced} />
      <TrainersZone reduced={reduced} />
      <FacilityZone reduced={reduced} />
      <MembershipZone reduced={reduced} />
      <ContactZone reduced={reduced} />
    </group>
  );
});