"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const STEEL = { color: "#3a3d42", metalness: 0.8, roughness: 0.35 };
const DARK = { color: "#1b1c1f", metalness: 0.55, roughness: 0.55 };
const MATTE = { color: "#232428", metalness: 0.2, roughness: 0.9 };
const RUBBER = { color: "#0e0e10", metalness: 0.05, roughness: 0.95 };

function NeonSign() {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 640, 128);
    ctx.font = "700 96px 'Oswald', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#4a9eff";
    ctx.shadowColor = "#4a9eff";
    ctx.shadowBlur = 26;
    ctx.fillText("GYMVERSE", 320, 64);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const flicker = 0.82 + Math.sin(clock.elapsedTime * 7) * 0.05 + Math.random() * 0.04;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = flicker;
  });

  return (
    <group position={[0, 4.4, -9.6]}>
      <mesh ref={ref}>
        <planeGeometry args={[6.4, 1.28]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} color="#9dcdff" />
      </mesh>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[6.6, 1.38]} />
        <meshBasicMaterial color="#4a9eff" transparent opacity={0.06} toneMapped={false} />
      </mesh>
    </group>
  );
}

function LightShaft({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <coneGeometry args={[1.4, 6, 12, 1, true]} />
      <meshBasicMaterial
        color="#9db8d8"
        transparent
        opacity={0.045}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function SquatRack({ position }: { position: [number, number, number] }) {
  const h = 2.5;
  return (
    <group position={position}>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, h / 2, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.12, h, 0.12]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
      <mesh position={[0, 2.35, -0.4]} castShadow>
        <boxGeometry args={[1.9, 0.08, 0.14]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.3, 0.35]} castShadow>
        <boxGeometry args={[2, 0.09, 0.6]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      <PlateStack position={[-0.14, 0, 1.02]} rotations={2} />
      <PlateStack position={[0.14, 0, 1.02]} rotations={2} />
      <Barbell position={[0, 1.32, -0.4]} />
    </group>
  );
}

function PlateStack({ position, rotations }: { position: [number, number, number]; rotations?: number }) {
  const plates = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        y: 0.03 + i * 0.07,
        r: 0.32 - i * 0.02 + (i % 3) * 0.004,
        rot: rotations ? (i % 2) * 0.9 : 0,
      })),
    [rotations]
  );
  return (
    <group position={position}>
      {plates.map((p, i) => (
        <mesh key={i} position={[0, p.y + 0.035, 0]} rotation={[0, p.rot, 0]} castShadow>
          <cylinderGeometry args={[p.r, p.r, 0.07, 16]} />
          <meshStandardMaterial color="#141518" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Barbell({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 2.2, 10]} />
        <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.25} />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.19, 0.19, 0.09, 16]} />
          <meshStandardMaterial color="#101012" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function BenchPress({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.1, 1.7]} />
        <meshStandardMaterial color="#1f2024" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.79, 0.3]} castShadow>
        <boxGeometry args={[0.45, 0.09, 1.55]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0.32, 0.36, -0.02]} castShadow>
        <boxGeometry args={[0.06, 0.14, 0.7]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[-0.32, 0.36, -0.02]} castShadow>
        <boxGeometry args={[0.06, 0.14, 0.7]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0.32, 1.05, -0.28]} castShadow>
        <boxGeometry args={[0.07, 0.5, 0.09]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[-0.32, 1.05, -0.28]} castShadow>
        <boxGeometry args={[0.07, 0.5, 0.09]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <Barbell position={[0, 1.3, -0.28]} />
      <PlateStack position={[-0.03, 0, -0.08]} />
      <PlateStack position={[0.03, 0, -0.08]} />
    </group>
  );
}

function DeadliftPlatform({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.08, 2.6]} />
        <meshStandardMaterial color="#141416" metalness={0.4} roughness={0.6} />
      </mesh>
      <group position={[0, 0.42, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 12]} />
          <meshStandardMaterial color="#c9ccd2" metalness={0.92} roughness={0.2} />
        </mesh>
        {[-1.25, 1.25].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 18]} />
            <meshStandardMaterial color="#101012" metalness={0.6} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DumbbellRack({ position }: { position: [number, number, number] }) {
  const rack = useMemo(() => {
    const arr: { p: [number, number, number]; r: number }[] = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        arr.push({ p: [-0.28 + col * 0.14, 0.62 + row * 0.3, 0], r: row === 0 ? 1.1 : 0 });
      }
    }
    return arr;
  }, []);
  return (
    <group position={position}>
      <mesh position={[0, 0.75, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 1.5, 0.14]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[0.9, 0.05, 0.4]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      <Instances range={rack.length} limit={rack.length}>
        <cylinderGeometry args={[0.035, 0.035, 0.3, 10]} />
        <meshStandardMaterial {...STEEL} />
        {rack.map((d, i) => (
          <Instance key={i} position={d.p} rotation={[0, 0, d.r === 1.1 ? Math.PI / 2 : 0]} />
        ))}
      </Instances>
    </group>
  );
}

function KettlebellRack({ position }: { position: [number, number, number] }) {
  const spots = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        p: [-0.5 + i * 0.2, 0.14 + (i % 2) * 0.12, 0] as [number, number, number],
      })),
    []
  );
  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.45]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      <Instances range={spots.length} limit={spots.length}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#191a1d" metalness={0.6} roughness={0.5} />
        {spots.map((s, i) => (
          <Instance key={i} position={s.p} scale={[1, 0.85, 1]} />
        ))}
      </Instances>
    </group>
  );
}

function Treadmill({ position }: { position: [number, number, number] }) {
  const belt = useRef<THREE.Mesh>(null);
  const stripe = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (belt.current) belt.current.position.z = 0.4 + Math.sin(t * 5) * 0.18;
    if (stripe.current) stripe.current.position.x = ((t * 0.7) % 0.62) - 0.31;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.75, 0.32, 1.7]} />
        <meshStandardMaterial {...MATTE} />
      </mesh>
      <group ref={belt} position={[0, 0.28, 0.4]}>
        <mesh>
          <boxGeometry args={[0.62, 0.02, 1.4]} />
          <meshStandardMaterial color="#101012" roughness={0.95} />
        </mesh>
        <mesh ref={stripe}>
          <boxGeometry args={[0.72, 0.012, 0.06]} />
          <meshStandardMaterial color="#33363c" roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[0, 0.72, -0.38]} castShadow>
        <boxGeometry args={[0.7, 0.65, 0.16]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.95, -0.46]}>
        <planeGeometry args={[0.42, 0.28]} />
        <meshBasicMaterial color="#0a2b4d" toneMapped={false} />
      </mesh>
    </group>
  );
}

function CableMachine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.4, 2.4, 0.12]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0, 2.75, 0]} castShadow>
        <boxGeometry args={[1.6, 0.22, 0.45]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[-0.55, 0.55, 0]}>
        <torusGeometry args={[0.28, 0.03, 8, 20]} />
        <meshStandardMaterial {...RUBBER} />
      </mesh>
      <mesh position={[0.55, 0.55, 0]}>
        <torusGeometry args={[0.28, 0.03, 8, 20]} />
        <meshStandardMaterial {...RUBBER} />
      </mesh>
    </group>
  );
}

function PlyoBoxes({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.75, 0.6, 0.75]} />
        <meshStandardMaterial color="#2c2e33" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0.95, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color="#23252a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[-0.95, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.9, 0.7]} />
        <meshStandardMaterial color="#303238" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}

function RecoveryMats({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.035, 0]} receiveShadow>
          <boxGeometry args={[0.9, 0.07, 2.1]} />
          <meshStandardMaterial color="#1a1d24" metalness={0.1} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Athlete({
  position,
  pose,
  color = "#23262c",
}: {
  position: [number, number, number];
  pose: "curls" | "run" | "stretch" | "squat";
  color?: string;
}) {
  const legs = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const speed = pose === "run" ? 8 : 2.2;
    const a = Math.sin(t * speed);
    if (legs.current) legs.current.rotation.x = a * 0.5 + (pose === "squat" ? 0.9 : 0);
    if (arms.current) {
      if (pose === "curls") arms.current.rotation.x = 0.4 + Math.max(0, a) * 1.4;
      else if (pose === "run") arms.current.rotation.x = -a * 0.9;
      else if (pose === "stretch") arms.current.rotation.x = 0.6 + a * 0.25;
      else arms.current.rotation.x = a * 0.2;
    }
    if (body.current) body.current.position.y = Math.abs(a) * (pose === "squat" ? 0.12 : 0.035);
    if (pose === "run" && body.current)
      body.current.rotation.x = pose === "run" ? 0.12 : 0;
  });

  return (
    <group position={position}>
      <group ref={body}>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.32, 0.42, 0.22]} />
          <meshStandardMaterial color={color} metalness={0.1} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.55, 0]} castShadow>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <group ref={legs} position={[0, 0.86, 0]}>
          {[-0.11, 0.11].map((x) => (
            <mesh key={x} position={[x, -0.25, 0]} castShadow>
              <boxGeometry args={[0.11, 0.5, 0.12]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          ))}
        </group>
        <group ref={arms} position={[0, 1.32, 0]}>
          {[-0.19, 0.19].map((x) => (
            <mesh key={x} position={[x, -0.22, 0.02]} castShadow>
              <boxGeometry args={[0.08, 0.44, 0.09]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export default function GymHub({ reduced }: { reduced: boolean }) {
  const wall = (p: [number, number, number], s: [number, number, number]) => (
    <mesh key={p.join(",")} position={p} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color="#141417" metalness={0.4} roughness={0.55} />
    </mesh>
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.5]} receiveShadow>
        <planeGeometry args={[24, 22]} />
        <meshStandardMaterial color="#0d0d0f" metalness={0.25} roughness={0.8} />
      </mesh>
      {wall([-11.1, 1.2, -9.35], [0.2, 3.2, 6.3])}
      {wall([-11.1, 1.2, -0.75], [0.2, 3.2, 6.2])}
      {wall([-11.1, 1.2, 7.1], [0.2, 3.2, 4.8])}
      {wall([11.1, 1.2, -8.1], [0.2, 3.2, 8.8])}
      {wall([11.1, 1.2, 0.4], [0.2, 3.2, 3.5])}
      {wall([11.1, 1.2, 6.98], [0.2, 3.2, 5])}
      {wall([-3.9, 1.2, -10.6], [14.4, 3.2, 0.2])}
      {wall([8.4, 1.2, -10.6], [5.4, 3.2, 0.2])}
      <mesh position={[0, 5.6, -1.5]} receiveShadow>
        <boxGeometry args={[22.4, 0.18, 22]} />
        <meshStandardMaterial color="#101013" metalness={0.6} roughness={0.4} />
      </mesh>
      <NeonSign />
      <LightShaft position={[-4, 3.4, -2]} rotation={[0.25, 0.2, 0]} />
      <LightShaft position={[4, 3.4, 1]} rotation={[0.3, -0.25, 0]} />

      {!reduced && (
        <Sparkles
          count={reduced ? 28 : 70}
          scale={[18, 4.2, 15]}
          position={[0, 2.6, -1.5]}
          size={1.4}
          speed={0.22}
          opacity={reduced ? 0.18 : 0.32}
          color="#8fa8bf"
        />
      )}

      <SquatRack position={[-7.2, 0, -3.2]} />
      <SquatRack position={[-5.6, 0, -3.2]} />
      <DeadliftPlatform position={[0, 0, -3.4]} />
      <CableMachine position={[-3.4, 0, -5.6]} />
      <BenchPress position={[2.6, 0, -1.2]} />
      <DumbbellRack position={[-8.6, 0, 0.4]} />
      <KettlebellRack position={[5.2, 0, 0.9]} />
      <PlyoBoxes position={[-1.2, 0, 4.4]} />
      <RecoveryMats position={[2, 0, 5.4]} />
      <Treadmill position={[6.4, 0, 4]} />
      <Treadmill position={[7.7, 0, 4.1]} />
      <Treadmill position={[9, 0, 3.9]} />

      <Athlete position={[2.6, 0, -1.35]} pose="squat" />
      <Athlete position={[-7.2, 0, -2.6]} pose="squat" color="#2a2e36" />
      <Athlete position={[6.4, 0, 4.5]} pose="run" color="#23262c" />
      <Athlete position={[5.1, 0, 2]} pose="curls" color="#272b33" />
      <Athlete position={[1.4, 0, 5.4]} pose="stretch" color="#2e3138" />
      <Athlete position={[-4.6, 0, -5]} pose="curls" color="#23262c" />
    </group>
  );
}