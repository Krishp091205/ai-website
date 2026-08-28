import type { PortalId, WorldZoneId } from "./store";

/** Axis-aligned collision rectangle on the XZ plane: [x0, z0, x1, z1] */
export type Rect = [number, number, number, number];

/** Wall segment helper direction a given side of a room is 'open' */
type OpenSide = "n" | "s" | "e" | "w";

const T = 0.3; // wall thickness

function segColliders(
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  open?: OpenSide,
  openA = 0,
  openB = 0
): Rect[] {
  const out: Rect[] = [];
  const push = (r: Rect) => out.push(r);
  // north wall (z = z0)
  if (open !== "n") push([x0, z0 - T / 2, x1, z0 + T / 2]);
  else {
    if (openA - x0 > 0.4) push([x0, z0 - T / 2, openA, z0 + T / 2]);
    if (x1 - openB > 0.4) push([openB, z0 - T / 2, x1, z0 + T / 2]);
  }
  // south wall (z = z1)
  if (open !== "s") push([x0, z1 - T / 2, x1, z1 + T / 2]);
  else {
    if (openA - x0 > 0.4) push([x0, z1 - T / 2, openA, z1 + T / 2]);
    if (x1 - openB > 0.4) push([openB, z1 - T / 2, x1, z1 + T / 2]);
  }
  // west wall (x = x0)
  if (open !== "w") push([x0 - T / 2, z0, x0 + T / 2, z1]);
  else {
    if (openA - z0 > 0.4) push([x0 - T / 2, z0, x0 + T / 2, openA]);
    if (z1 - openB > 0.4) push([x0 - T / 2, openB, x0 + T / 2, z1]);
  }
  // east wall (x = x1)
  if (open !== "e") push([x1 - T / 2, z0, x1 + T / 2, z1]);
  else {
    if (openA - z0 > 0.4) push([x1 - T / 2, z0, x1 + T / 2, openA]);
    if (z1 - openB > 0.4) push([x1 - T / 2, openB, x1 + T / 2, z1]);
  }
  return out;
}

const WORLD_X0 = -38;
const WORLD_X1 = 38;
const WORLD_Z0 = -32;
const WORLD_Z1 = 32;

// ---- room definitions ----
const ROOMS: {
  id: WorldZoneId;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  open: OpenSide;
  openA: number;
  openB: number;
}[] = [
  { id: "cardio", x0: -10, x1: 10, z0: -32, z1: -16, open: "s", openA: -4, openB: 4 },
  { id: "strength", x0: -38, x1: -24, z0: -32, z1: -16, open: "e", openA: -28, openB: -22 },
  { id: "recovery", x0: 24, x1: 38, z0: -32, z1: -16, open: "w", openA: -28, openB: -22 },
  { id: "weights", x0: -38, x1: -24, z0: 16, z1: 32, open: "e", openA: 22, openB: 28 },
  { id: "functional", x0: -10, x1: 10, z0: 16, z1: 32, open: "n", openA: -4, openB: 4 },
  { id: "exit", x0: 24, x1: 38, z0: 16, z1: 32, open: "w", openA: 22, openB: 28 },
];

export const colliders: Rect[] = [];

for (const r of ROOMS) {
  colliders.push(...segColliders(r.x0, r.x1, r.z0, r.z1, r.open, r.openA, r.openB));
}

// Close the north/south outer strip gaps between rooms and the outer shell.
// North boundary gaps between rooms along z=-32.
const northGaps: [number, number][] = [
  [-24, -10],
  [10, 24],
];
const southGaps: [number, number][] = [
  [-24, -10],
  [10, 24],
];
for (const [a, b] of northGaps) colliders.push([a, WORLD_Z0 - T / 2, b, WORLD_Z0 + T / 2]);
for (const [a, b] of southGaps) colliders.push([a, WORLD_Z1 - T / 2, b, WORLD_Z1 + T / 2]);

// West / east atrium boundary closes (between west/east room pairs).
colliders.push([WORLD_X0 - T / 2, -16, WORLD_X0 + T / 2, 16]); // west atrium
colliders.push([WORLD_X1 - T / 2, -16, WORLD_X1 + T / 2, 16]); // east atrium

// Outer shell corners to seal the four corner exterior pockets.
colliders.push([WORLD_X0 - T / 2, WORLD_Z0 - T / 2, WORLD_X0 + T / 2, -16]); // nw
colliders.push([WORLD_X1 - T / 2, WORLD_Z0 - T / 2, WORLD_X1 + T / 2, -16]); // ne
colliders.push([WORLD_X0 - T / 2, 16, WORLD_X0 + T / 2, WORLD_Z1 + T / 2]); // sw
colliders.push([WORLD_X1 - T / 2, 16, WORLD_X1 + T / 2, WORLD_Z1 + T / 2]); // se

export interface ZoneMeta {
  id: WorldZoneId;
  name: string;
  accent: string;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  terminal?: PortalId;
  subtitle: string;
}

export const WORLD_ZONES: ZoneMeta[] = [
  { id: "entry", name: "ENTRY", accent: "#4a9eff", x0: -24, x1: 24, z0: -16, z1: 16, subtitle: "Spawn & lobby" },
  { id: "cardio", name: "CARDIO", accent: "#22d3ee", x0: -12, x1: 12, z0: -32, z1: -16, terminal: "facility", subtitle: "Endurance deck" },
  { id: "strength", name: "STRENGTH", accent: "#4a9eff", x0: -38, x1: -24, z0: -32, z1: -16, terminal: "programs", subtitle: "Big lifts" },
  { id: "weights", name: "FREE WEIGHTS", accent: "#a78bfa", x0: -38, x1: -24, z0: 16, z1: 32, terminal: "trainers", subtitle: "Iron floor" },
  { id: "functional", name: "FUNCTIONAL", accent: "#34d399", x0: -12, x1: 12, z0: 16, z1: 32, terminal: "contact", subtitle: "Movement lab" },
  { id: "recovery", name: "RECOVERY", accent: "#fbbf24", x0: 24, x1: 38, z0: -32, z1: -16, terminal: "membership", subtitle: "Recharge lounge" },
  { id: "exit", name: "EXIT", accent: "#f87171", x0: 24, x1: 38, z0: 16, z1: 32, terminal: "about", subtitle: "Next level" },
];

export const ROOM_BY_ID: Record<WorldZoneId, ZoneMeta> = Object.fromEntries(
  WORLD_ZONES.map((z) => [z.id, z])
) as Record<WorldZoneId, ZoneMeta>;

export type EquipmentKind =
  | "treadmill"
  | "bike"
  | "rower"
  | "squatrack"
  | "benchpress"
  | "dumbbells"
  | "kettlebell"
  | "plyobox"
  | "ropes"
  | "mat"
  | "sauna";

export interface InteractiveProp {
  kind: EquipmentKind;
  label: string;
  sub: string;
  accent: string;
  xp: number;
  position: [number, number, number];
  rotY?: number;
  /** interaction radius */
  radius: number;
  /** footprint collider (expanded) */
  hit: Rect;
  /** if terminal defined, opens content panel on interact */
  terminal?: PortalId;
  // optional workout "animation interval" duration hints
  reps?: string;
}

export const PROPS: InteractiveProp[] = [
  // ---- CARDIO ----
  { kind: "treadmill", label: "TREADMILL", sub: "CARDIO STATION", accent: "#22d3ee", xp: 12, position: [-3.5, 0, -27.5], rotY: Math.PI, radius: 2, hit: [-6.2, -29.6, -0.8, -25.4], reps: "10 MIN · HIIT" },
  { kind: "treadmill", label: "TREADMILL", sub: "CARDIO STATION", accent: "#22d3ee", xp: 12, position: [0.5, 0, -27.5], rotY: Math.PI, radius: 2, hit: [-2.2, -29.6, 3.2, -25.4], reps: "8 MIN · STEADY" },
  { kind: "bike", label: "ASSAULT BIKE", sub: "CARDIO STATION", accent: "#22d3ee", xp: 14, position: [6, 0, -25], rotY: Math.PI, radius: 2, hit: [4.2, -27.4, 7.8, -22.6], reps: "6 X 30s SPRINTS" },
  { kind: "rower", label: "ROWING ERG", sub: "CARDIO STATION", accent: "#22d3ee", xp: 13, position: [-7, 0, -22], radius: 2, hit: [-9.2, -24.2, -4.8, -19.8], reps: "2KM TIME TRIAL" },
  // ---- STRENGTH ----
  { kind: "squatrack", label: "SQUAT RACK", sub: "STRENGTH STATION", accent: "#4a9eff", xp: 18, position: [-33, 0, -28.5], radius: 2.4, hit: [-35.6, -31.4, -30.4, -25.6], reps: "5 X 5" },
  { kind: "benchpress", label: "BENCH PRESS", sub: "STRENGTH STATION", accent: "#4a9eff", xp: 16, position: [-29, 0, -23], radius: 2, hit: [-31.6, -25.6, -26.4, -20.4], reps: "4 X 8" },
  { kind: "squatrack", label: "SQUAT RACK", sub: "STRENGTH STATION", accent: "#4a9eff", xp: 18, position: [-31, 0, -19], radius: 2.4, hit: [-33.6, -22, -28.4, -16.6], reps: "3 X 5 HEAVY" },
  // ---- FREE WEIGHTS ----
  { kind: "dumbbells", label: "DUMBBELL RACK", sub: "FREE WEIGHTS", accent: "#a78bfa", xp: 12, position: [-34.5, 0, 20], radius: 2, hit: [-36.6, 17.6, -32.4, 22.4], reps: "DB CURL · 3 X 12" },
  { kind: "kettlebell", label: "KETTLEBELL ROW", sub: "FREE WEIGHTS", accent: "#a78bfa", xp: 13, position: [-29, 0, 26.5], radius: 2, hit: [-31.6, 23.9, -26.4, 29.1], reps: "SWING · 3 X 15" },
  { kind: "dumbbells", label: "DUMBBELL PRESS", sub: "FREE WEIGHTS", accent: "#a78bfa", xp: 14, position: [-28, 0, 21], radius: 2, hit: [-30.6, 18.6, -25.4, 23.4], reps: "3 X 10" },
  // ---- FUNCTIONAL ----
  { kind: "plyobox", label: "PLYO BOXES", sub: "FUNCTIONAL TRAINING", accent: "#34d399", xp: 15, position: [-1, 0, 28.5], radius: 2, hit: [-4.2, 25.6, 2.2, 31.4], reps: "BOX JUMPS · 5 X 8" },
  { kind: "ropes", label: "BATTLE ROPES", sub: "FUNCTIONAL TRAINING", accent: "#34d399", xp: 15, position: [7, 0, 29], radius: 2.2, hit: [4.6, 26.5, 9.4, 31.5], reps: "WAVES · 3 X 40s" },
  { kind: "plyobox", label: "MEDICINE BALL", sub: "FUNCTIONAL TRAINING", accent: "#34d399", xp: 11, position: [4, 0, 23], radius: 2, hit: [1.6, 20.6, 6.4, 25.4], reps: "SLAM · 3 X 12" },
  // ---- RECOVERY ----
  { kind: "mat", label: "STRETCH MAT", sub: "RECOVERY", accent: "#fbbf24", xp: 10, position: [30, 0, -22], radius: 2, hit: [27.4, -24.6, 32.6, -19.4], reps: "MOBILITY · 10 MIN" },
  { kind: "sauna", label: "SAUNA POD", sub: "RECOVERY", accent: "#fbbf24", xp: 12, position: [34, 0, -28], radius: 2, hit: [31.8, -31.2, 36.2, -24.8], reps: "HEAT · 12 MIN" },
  { kind: "sauna", label: "COLD PLUNGE", sub: "RECOVERY", accent: "#fbbf24", xp: 13, position: [27, 0, -27], radius: 2, hit: [24.8, -29.6, 29.2, -24.4], reps: "RECOVERY · 5 MIN" },
];

// ---- Terminals (content panels). Positioned on walls / pedestals per zone. ----
export interface Terminal {
  id: PortalId;
  label: string;
  position: [number, number, number];
  rotY: number;
  radius: number;
  hit: Rect;
  accent: string;
}

export const TERMINALS: Terminal[] = [
  { id: "facility", label: "FACILITY", position: [0, 0, -18.4], rotY: 0, radius: 2.6, hit: [-3.2, -20.6, 3.2, -17.4], accent: "#22d3ee" },
  { id: "programs", label: "PROGRAMS", position: [-23.6, 0, -24.4], rotY: -Math.PI / 2, radius: 2.6, hit: [-25.6, -27.6, -22, -21.2], accent: "#4a9eff" },
  { id: "membership", label: "MEMBERSHIP", position: [23.6, 0, -21], rotY: Math.PI / 2, radius: 2.6, hit: [22, -24.2, 25.6, -17.8], accent: "#fbbf24" },
  { id: "trainers", label: "TRAINERS", position: [-24.8, 0, 24], rotY: Math.PI, radius: 2.6, hit: [-27.8, 21.8, -21.8, 26.2], accent: "#a78bfa" },
  { id: "contact", label: "CONTACT", position: [0, 0, 18.4], rotY: Math.PI, radius: 2.6, hit: [-3.2, 17.4, 3.2, 20.6], accent: "#34d399" },
  { id: "about", label: "ABOUT", position: [30.4, 0, 20], rotY: Math.PI, radius: 2.6, hit: [27.4, 17.8, 33.4, 22.2], accent: "#f87171" },
];

// ---- Navigation glow paths from spawn to each room doorway ----
export interface Path {
  start: [number, number, number];
  end: [number, number, number];
}
export const PATHS: Path[] = [
  { start: [0, 0, 2], end: [0, 0, -16] }, // entry -> cardio (north)
  { start: [0, 0, 3], end: [-26, 0, -16] }, // entry -> strength (northwest)
  { start: [0, 0, 3], end: [26, 0, -16] }, // entry -> recovery (northeast)
  { start: [0, 0, -2], end: [-26, 0, 16] }, // entry -> weights (southwest)
  { start: [0, 0, -2], end: [0, 0, 16] }, // entry -> functional (south)
  { start: [0, 0, -2], end: [26, 0, 16] }, // entry -> exit (southeast)
];

// ---- spawn ----
export const SPAWN: [number, number, number] = [0, 0, 8];
export const SPAWN_LOOK = Math.PI; // facing -Z (toward cardio north)

export const COLLISION_MAP = colliders;
