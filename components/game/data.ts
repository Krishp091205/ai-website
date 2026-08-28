import type { PortalId } from "./store";

export interface GameProfile {
  player: string;
  level: number;
  fitnessScore: number;
  xp: number;
  xpNext: number;
  stats: { label: string; value: number }[];
  milestones: string[];
}

export const PROFILE: GameProfile = {
  player: "KRISH",
  level: 27,
  fitnessScore: 87,
  xp: 4820,
  xpNext: 6400,
  stats: [
    { label: "STRENGTH", value: 87 },
    { label: "ENDURANCE", value: 76 },
    { label: "DISCIPLINE", value: 94 },
    { label: "MOBILITY", value: 71 },
    { label: "PERFORMANCE", value: 82 },
  ],
  milestones: [
    "First Workout",
    "Strength Milestone (500 lbs total)",
    "30-Day Streak",
    "Iron Constitution",
  ],
};

export interface PortalDef {
  id: PortalId;
  name: string;
  tagline: string;
  position: [number, number, number];
  command: string;
}

export const PORTAL_COMMANDS: Record<string, string> = {
  about: "ENTER",
  programs: "SELECT",
  trainers: "VIEW",
  facility: "ENTER",
  membership: "ENTER",
  contact: "READ",
};

export const PORTALS: PortalDef[] = [
  { id: "about", name: "ABOUT", tagline: "History wall", position: [4.2, 1.7, -6], command: "ENTER" },
  { id: "programs", name: "PROGRAMS", tagline: "Training zone", position: [8.5, 1.7, -3.2], command: "SELECT" },
  { id: "facility", name: "FACILITY", tagline: "Multi-zone tour", position: [8.5, 1.7, 3.2], command: "ENTER" },
  { id: "membership", name: "MEMBERSHIP", tagline: "VIP lounge", position: [4.2, 1.7, 6], command: "ENTER" },
  { id: "contact", name: "CONTACT", tagline: "Front desk", position: [-4.2, 1.7, 6], command: "READ" },
  { id: "trainers", name: "TRAINERS", tagline: "Coaching center", position: [-8.5, 1.7, 3.2], command: "VIEW" },
];

export interface Program {
  id: string;
  title: string;
  objective: string;
  difficulty: number;
  xp: number;
  duration: string;
  description: string;
  focus: string[];
}

export const PROGRAMS: Program[] = [
  {
    id: "strength",
    title: "MISSION 01 — STRENGTH",
    objective: "Increase maximum strength & power",
    difficulty: 8,
    xp: 500,
    duration: "12 weeks",
    description:
      "A progressive overload system built around the big lifts. Squat, bench, deadlift, and overhead press programmed across four training blocks with deload weeks engineered in.",
    focus: ["Squat", "Bench", "Deadlift", "Press"],
  },
  {
    id: "hypertrophy",
    title: "MISSION 02 — HYPERTROPHY",
    objective: "Build lean muscle mass & density",
    difficulty: 6,
    xp: 420,
    duration: "10 weeks",
    description:
      "High-volume bodybuilding splits targeting every head of every muscle. Supersets, drop sets, and tempo work to maximize mechanical tension and metabolic stress.",
    focus: ["Chest", "Back", "Legs", "Arms"],
  },
  {
    id: "conditioning",
    title: "MISSION 03 — CONDITIONING",
    objective: "Engine your cardiovascular capacity",
    difficulty: 7,
    xp: 380,
    duration: "8 weeks",
    description:
      "Monostructural and strongman-style conditioning. Intervals, circuits, and sled work that build work capacity without sacrificing strength output.",
    focus: ["Rowing", "Prowler", "Intervals", "Core"],
  },
  {
    id: "mobility",
    title: "MISSION 04 — MOBILITY",
    objective: "Move better, recover faster",
    difficulty: 3,
    xp: 260,
    duration: "6 weeks",
    description:
      "Daily mobility and recovery protocol. Soft tissue work, controlled articular rotations, and loaded carries that unwind the modern desk-bound posture.",
    focus: ["Hips", "Thoracic", "Ankles", "Carries"],
  },
  {
    id: "performance",
    title: "MISSION 05 — PERFORMANCE",
    objective: "Explosive power & athletic speed",
    difficulty: 9,
    xp: 560,
    duration: "12 weeks",
    description:
      "Olympic-style lifts, plyometrics, and sprint work. Built for athletes who need to convert strength into speed and jump into a different atmosphere.",
    focus: ["Clean", "Snatch", "Plyo", "Sprint"],
  },
];

export interface Trainer {
  id: string;
  name: string;
  title: string;
  level: number;
  specialization: string;
  bio: string;
}

export const TRAINERS: Trainer[] = [
  {
    id: "marcus",
    name: "MARCUS VOID",
    title: "HEAD COACH — STRENGTH",
    level: 99,
    specialization: "Powerlifting · Olympic lifting · Programming",
    bio: "Former national powerlifting champion with 14 years on the platform. Marcus has coached 200+ lifters to state and national records. His methodology is brutal in its simplicity: master the lift, progress the load, respect the process.",
  },
  {
    id: "lenna",
    name: "LENNA FORTIS",
    title: "CONDITIONING COACH",
    level: 84,
    specialization: "HIIT · Hypertrophy · Athletic conditioning",
    bio: "A competitive CrossFit athlete turned coach, Lenna designs sessions that feel like boss fights. Expect circuits that combine strength, speed, and endurance until the last minute of the last round.",
  },
  {
    id: "deon",
    name: "DEON CRUZ",
    title: "MOBILITY & RECOVERY",
    level: 71,
    specialization: "Mobility · Injury prevention · Breathing",
    bio: "Deon spent a decade in professional football before an injury rewired his career. He lives in the spaces most people skip: ankles, hips, thoracic spine, and the breath that runs it all.",
  },
];

export interface MembershipTier {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  perks: string[];
  featured?: boolean;
}

export const MEMBERSHIP: MembershipTier[] = [
  {
    id: "iron",
    name: "IRON",
    subtitle: "Access to the floor",
    price: "1,499/mo",
    perks: [
      "Unlimited access · 5AM–11PM",
      "All strength & cardio zones",
      "Standard locker access",
      "Progress app tracking",
    ],
  },
  {
    id: "titan",
    name: "TITAN",
    subtitle: "The complete gym",
    price: "2,799/mo",
    perks: [
      "Everything in IRON",
      "Group training missions",
      "2 coach sessions / month",
      "Recovery lounge access",
      "Hydromassage & compression",
    ],
    featured: true,
  },
  {
    id: "legend",
    name: "LEGEND",
    subtitle: "VIP lounge & coaching",
    price: "4,999/mo",
    perks: [
      "Everything in TITAN",
      "Unlimited 1:1 coaching",
      "24/7 keyless access",
      "Personalized programming",
      "Guest passes · 4/mo",
      "Private VIP lounge",
    ],
  },
];

export interface FacilityZone {
  name: string;
  description: string;
}

export const FACILITY_ZONES: FacilityZone[] = [
  {
    name: "FREE WEIGHT FLOOR",
    description: "12 platforms, 8 squat racks, calibrated competition plates, and a deadlift stage with precision floor matting.",
  },
  {
    name: "CARDIO ZONE",
    description: "Treadmills, assault bikes, rowers, and ski ergs with individual media screens and heart-rate bridging.",
  },
  {
    name: "FUNCTIONAL ZONE",
    description: "Kettlebells to 48kg, battle ropes, TRX rig, sleds, and an agility turf for movement work.",
  },
  {
    name: "STRONGMAN PIT",
    description: "Yoke, log, atlas stones, farmer's handles, and a sandbag platform for serious conditioning.",
  },
  {
    name: "RECOVERY LOUNGE",
    description: "Sauna, steam, cold plunge, compression boots, and guided stretching mats with low lighting.",
  },
  {
    name: "ATHLETIC TURF",
    description: "40m sprint lanes, hurdles, plyo boxes, and a sled track for speed and explosive work.",
  },
];

export const ABOUT_COPY = {
  tagline: "ENTER THE GRIND.",
  body: [
    "GYMVERSE was built on a single conviction: training is not a routine, it is a performance.",
    "Opening our doors in 2019, we refused to build another box of mirrors and cardio desks. Instead we built a stadium for human effort — a 14,000 sq ft arena of calibrated steel, precision flooring, and atmosphere engineered for focus. From the deadlift stage to the recovery lounge, every square foot is designed around one idea: let the work speak.",
    "Our coaches are competitors, not salespeople. Our members are protagonists, not customers. And our facility is the world they enter when they decide, again, to get better.",
    "This is a gym. This is a game. Every rep counts. Every set builds you. Every day changes you.",
  ],
  stats: [
    { label: "SQ FT ARENA", value: "14,000" },
    { label: "COACHES", value: "18" },
    { label: "MEMBERS", value: "2,400" },
    { label: "YEARLY RECORDS", value: "31" },
  ],
};

export const CONTACT_INFO = {
  address: "42 Iron Street, Industrial District, Mumbai 400001",
  phone: "+91 98200 00000",
  email: "grind@gymverse.fit",
  hours: "MON–FRI 5:00–23:00 · SAT–SUN 7:00–22:00",
  social: ["INSTAGRAM", "YOUTUBE", "X"],
};

export const CINEMATIC_LINES = [
  "EVERY REP COUNTS.",
  "EVERY SET BUILDS YOU.",
  "EVERY DAY CHANGES YOU.",
  "WELCOME TO THE GRIND.",
];