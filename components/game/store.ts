import { create } from "zustand";

export type Screen = "intro" | "loading" | "profile" | "gym";
export type PortalId =
  | "about"
  | "programs"
  | "trainers"
  | "facility"
  | "membership"
  | "contact";

export type WorldZoneId =
  | "entry"
  | "cardio"
  | "strength"
  | "weights"
  | "functional"
  | "recovery"
  | "exit";

export type CameraMode = "intro" | "flyIn" | "flyOut" | "content";
export type ViewMode = "first" | "third";

export interface FlyTarget {
  to: [number, number, number];
  look: [number, number, number];
  mode: CameraMode;
}

export type Quality = "low" | "medium" | "high" | "ultra";

export interface MissionState {
  id: string;
  accepted: boolean;
  status: "active" | "completed";
  startedAt: number;
  progress: number;
  completedExercises: string[];
  xpReward: number;
  xpEarned: number;
  completedAt: number | null;
}

export interface Settings {
  sound: boolean;
  music: boolean;
  cinematics: boolean;
  quality: Quality;
  hudBrightness: number;
  colorblind: boolean;
  viewMode: ViewMode;
  mouseSensitivity: number;
  cameraSensitivity: number;
  fov: number;
  motionBlur: boolean;
  sfx: boolean;
}

interface Feedback {
  id: number;
  text: string;
  accent?: string;
}

interface GameState {
  screen: Screen;
  portalOpen: PortalId | null;
  cameraMode: CameraMode;
  viewMode: ViewMode;
  flyTarget: FlyTarget | null;
  contentLook: [number, number, number] | null;
  flash: "bright" | "dark" | null;
  cursor: { label: string | null; sub: string | null; x: number; y: number };
  objective: string;
  objectiveDone: boolean;
  settings: Settings;
  soundOn: boolean;
  replayIntro: boolean;
  profilePanel: boolean;
  gymEntries: number;
  loadingProgress: number;

  // ---- Player / progression ----
  playerPos: [number, number, number];
  playerRot: number;
  level: number;
  fitnessScore: number;
  xp: number;
  streak: number;
  currentZone: WorldZoneId;
  interaction: string | null;
  interactingId: string | null;
  feedback: Feedback[];
  locked: boolean;
  missions: Record<string, MissionState>;
  visitedZones: WorldZoneId[];
  /** increments whenever the player is teleported (e.g. from the gym map) */
  teleportSeq: number;

  setScreen: (s: Screen) => void;
  setReplayIntro: (v: boolean) => void;
  setProfilePanel: (v: boolean) => void;
  openPortal: (id: PortalId, target?: { to: FlyTarget["to"]; look: FlyTarget["look"] }) => void;
  closePortal: () => void;
  setFlyTarget: (t: FlyTarget | null) => void;
  completeFly: () => void;
  setCursor: (c: Partial<GameState["cursor"]>) => void;
  setObjective: (o: string, done?: boolean) => void;
  setSettings: (s: Partial<Settings>) => void;
  setLoadingProgress: (p: number) => void;
  setPlayerPos: (p: [number, number, number]) => void;
  setPlayerRot: (r: number) => void;
  setViewMode: (v: ViewMode) => void;
  setCurrentZone: (z: WorldZoneId) => void;
  setInteraction: (id: string | null, label?: string | null) => void;
  setLocked: (v: boolean) => void;
  mapOpen: boolean;
  setMapOpen: (v: boolean) => void;
  beginWorkout: (id: string, xp: number, fitness: number, label: string) => void;
  completeWorkout: (id: string, xp: number) => void;
  resetProgression: () => void;
  acceptMission: (id: string, xpReward: number) => void;
  toggleMissionExercise: (id: string, exercise: string, total: number) => void;
  completeMission: (id: string) => void;
  enterZone: (zone: WorldZoneId) => void;
  teleportTo: (pos: [number, number, number], zone: WorldZoneId) => void;
}

const LEVEL_THRESHOLDS = [500, 1200, 2400, 4000, 6000, 8500, 12000, 17000, 24000];

const ZONE_LABEL: Record<WorldZoneId, string> = {
  entry: "ENTRY",
  cardio: "CARDIO",
  strength: "STRENGTH",
  weights: "FREE WEIGHTS",
  functional: "FUNCTIONAL",
  recovery: "RECOVERY",
  exit: "EXIT",
};

const EXPLORABLE_ZONES: WorldZoneId[] = [
  "cardio",
  "strength",
  "weights",
  "functional",
  "recovery",
  "exit",
];

function applyXp(level: number, xpInto: number, amount: number) {
  let nextLevel = level;
  let nextXp = xpInto + amount;
  let leveled = false;
  let guard = 0;
  while (guard++ < 20) {
    const need = LEVEL_THRESHOLDS[nextLevel - 1] ?? 6000 + (nextLevel - 10) * 1500;
    if (nextXp >= need) {
      nextXp -= need;
      nextLevel += 1;
      leveled = true;
    } else break;
  }
  return { xp: nextXp, level: nextLevel, leveled };
}

export const useGame = create<GameState>((set, get) => ({
  screen: "intro",
  portalOpen: null,
  cameraMode: "intro",
  viewMode: "third",
  flyTarget: null,
  contentLook: null,
  flash: null,
  cursor: { label: null, sub: null, x: -100, y: -100 },
  objective: "Enter the GYMVERSE",
  objectiveDone: false,
  soundOn: false,
  replayIntro: true,
  profilePanel: false,
  gymEntries: 0,
  loadingProgress: 0,

  playerPos: [0, 0, 4],
  playerRot: Math.PI,
  level: 27,
  fitnessScore: 87,
  xp: 4820,
  streak: 4,
  currentZone: "entry",
  interaction: null,
  interactingId: null,
  feedback: [],
  locked: false,
  missions: {},
  visitedZones: [],
  teleportSeq: 0,

  settings: {
    sound: false,
    music: false,
    cinematics: true,
    quality: "high",
    hudBrightness: 1,
    colorblind: false,
    viewMode: "third",
    mouseSensitivity: 1,
    cameraSensitivity: 1,
    fov: 64,
    motionBlur: true,
    sfx: true,
  },

  setScreen: (screen) =>
    set({
      screen,
      portalOpen: null,
      profilePanel: false,
      cameraMode: screen === "gym" ? "flyIn" : get().cameraMode,
      gymEntries: screen === "gym" ? get().gymEntries + 1 : get().gymEntries,
    }),
  setReplayIntro: (v) => set({ replayIntro: v }),
  setProfilePanel: (v) => set({ profilePanel: v }),
  openPortal: (id) => {
    const pp = get().playerPos;
    const to: [number, number, number] = [pp[0], pp[1] + 2, pp[2]];
    set({
      cameraMode: "flyIn",
      portalOpen: null,
      flash: "bright",
      flyTarget: { to, look: [pp[0], pp[1] + 1, pp[2] - 4], mode: "flyIn" },
      contentLook: [pp[0], pp[1] + 1, pp[2] - 4],
      objective: `ACCESSING ${id.toUpperCase()} ZONE`,
      objectiveDone: false,
      locked: true,
    });
    window.setTimeout(() => {
      set({ portalOpen: id, cameraMode: "content", flyTarget: null, flash: null });
    }, 450);
    try {
      if (typeof window !== "undefined")
        window.history.replaceState(null, "", `#zone/${id}`);
    } catch {
      /* ignore */
    }
  },
  closePortal: () => {
    const pp = get().playerPos;
    const to: [number, number, number] = [pp[0], pp[1] + 2, pp[2]];
    set({ cameraMode: "flyOut", portalOpen: null, contentLook: null, flash: "dark", locked: false, flyTarget: { to, look: [pp[0], pp[1] + 1, pp[2] - 4], mode: "flyOut" } });
    window.setTimeout(() => {
      set({ cameraMode: "flyIn", flyTarget: null, flash: null, locked: false });
    }, 450);
    try {
      if (typeof window !== "undefined")
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }
  },
  setFlyTarget: (t) => set({ flyTarget: t }),
  completeFly: () => set({ flyTarget: null }),
  setCursor: (c) => set({ cursor: { ...get().cursor, ...c } }),
  setObjective: (objective, done = false) => set({ objective, objectiveDone: done }),
  setSettings: (s) => {
    const next = { ...get().settings, ...s };
    set({ settings: next, viewMode: next.viewMode ?? get().viewMode });
  },
  setLoadingProgress: (p) => set({ loadingProgress: p }),
  setPlayerPos: (p) => set({ playerPos: p }),
  setPlayerRot: (r) => set({ playerRot: r }),
  setViewMode: (v) => set({ viewMode: v, settings: { ...get().settings, viewMode: v } }),
  setCurrentZone: (z) => {
    const st = get();
    if (st.currentZone === z) return;
    set({ currentZone: z });
    get().enterZone(z);
  },
  setInteraction: (id, label = null) =>
    set({ interactingId: id, interaction: label }),
  setLocked: (v) => set({ locked: v }),
  mapOpen: false,
  setMapOpen: (v) => set({ mapOpen: v }),

  beginWorkout: (id, xp, fitness, label) => {
    const f = get().feedback;
    const fid = Date.now() + Math.random();
    const next = [...f.slice(-3), { id: fid, text: `[ ${label.toUpperCase()} STARTED ]` }];
    set({ feedback: next, interactingId: id, interaction: null });
  },

  completeWorkout: (id, xp) => {
    const s = get();
    const res = applyXp(s.level, s.xp, xp);
    const newFitness = Math.min(100, s.fitnessScore + 1);
    const msgs: string[] = [`+${xp} XP`, "WORKOUT COMPLETE"];
    if (res.leveled) msgs.push("LEVEL UP!");
    const seq = msgs.map((text, i) => ({
      id: Date.now() + i + Math.random(),
      text,
      accent: text === "LEVEL UP!" ? "#ffe0a3" : text.startsWith("+") ? "#e8c46a" : "#fff1d6",
    }));
    set({
      xp: res.xp,
      level: res.level,
      fitnessScore: newFitness,
      streak: s.streak + 1,
      feedback: [...s.feedback.slice(-2), ...seq],
      interactingId: null,
      interaction: null,
    });
    if (res.leveled) {
      window.setTimeout(() => {
        useGame.setState({ flash: "bright" });
        window.setTimeout(() => useGame.setState({ flash: null }), 600);
      }, 300);
    }
  },

  resetProgression: () =>
    set({ level: 27, fitnessScore: 87, xp: 4820, streak: 4, missions: {}, visitedZones: [] }),

  acceptMission: (id, xpReward) => {
    const s = get();
    if (s.missions[id]?.accepted) return;
    const now = Date.now();
    set({
      missions: {
        ...s.missions,
        [id]: {
          id,
          accepted: true,
          status: "active",
          startedAt: now,
          progress: 0,
          completedExercises: [],
          xpReward,
          xpEarned: 0,
          completedAt: null,
        },
      },
      objective: "COMPLETE YOUR ACCEPTED MISSION",
      objectiveDone: false,
    });
  },

  toggleMissionExercise: (id, exercise, total) => {
    const s = get();
    const m = s.missions[id];
    if (!m || m.status === "completed") return;
    const exists = m.completedExercises.includes(exercise);
    const completedExercises = exists
      ? m.completedExercises.filter((x) => x !== exercise)
      : [...m.completedExercises, exercise];
    const progress = total > 0 ? Math.round((completedExercises.length / total) * 100) : m.progress;
    set({
      missions: {
        ...s.missions,
        [id]: { ...m, completedExercises, progress },
      },
    });
  },

  completeMission: (id) => {
    const s = get();
    const m = s.missions[id];
    if (!m || m.status === "completed") return;
    const res = applyXp(s.level, s.xp, m.xpReward);
    const now = Date.now();
    const msgs = [`+${m.xpReward} XP`, "MISSION COMPLETE"];
    if (res.leveled) msgs.push("LEVEL UP!");
    const seq = msgs.map((text, i) => ({
      id: Date.now() + i + Math.random(),
      text,
      accent: text === "LEVEL UP!" ? "#ffe0a3" : text.startsWith("+") ? "#e8c46a" : "#fff1d6",
    }));
    set({
      missions: {
        ...s.missions,
        [id]: { ...m, status: "completed", progress: 100, xpEarned: m.xpReward, completedAt: now },
      },
      xp: res.xp,
      level: res.level,
      feedback: [...s.feedback.slice(-2), ...seq],
      objective: "MISSION COMPLETE — CONTINUE EXPLORING",
      objectiveDone: true,
    });
    if (res.leveled) {
      window.setTimeout(() => {
        useGame.setState({ flash: "bright" });
        window.setTimeout(() => useGame.setState({ flash: null }), 600);
      }, 300);
    }
  },

  enterZone: (zone) => {
    const s = get();
    if (zone === "entry") return;
    const visited = s.visitedZones.includes(zone) ? s.visitedZones : [...s.visitedZones, zone];
    if (visited.length === 1 && !s.objectiveDone) {
      set({
        visitedZones: visited,
        objective: "EXPLORE THE TRAINING FLOOR",
        objectiveDone: false,
      });
      return;
    }
    if (visited.length >= 2 && s.objective === "EXPLORE THE TRAINING FLOOR" && !s.objectiveDone) {
      set({ visitedZones: visited, objective: "EXPLORE THE TRAINING FLOOR — VISIT A ZONE", objectiveDone: false });
      return;
    }
    set({ visitedZones: visited });
  },

  teleportTo: (pos, zone) => {
    set({
      playerPos: pos,
      currentZone: zone,
      teleportSeq: get().teleportSeq + 1,
      locked: false,
    });
    get().enterZone(zone);
  },
}));

export const MOTION_PREF = typeof window !== "undefined"
  ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
  : false;

export const IS_FINE_POINTER = typeof window !== "undefined"
  ? window.matchMedia("(pointer: fine)").matches
  : true;

export const IS_MOBILE = typeof window !== "undefined"
  ? window.matchMedia("(pointer: coarse), (max-width: 768px)").matches
  : false;
