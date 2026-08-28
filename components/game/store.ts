import { create } from "zustand";

export type Screen = "intro" | "start" | "profile" | "gym";
export type PortalId =
  | "about"
  | "programs"
  | "trainers"
  | "facility"
  | "membership"
  | "contact";

export type CameraMode = "intro" | "hub" | "flyIn" | "flyOut" | "content";

export interface FlyTarget {
  to: [number, number, number];
  look: [number, number, number];
  mode: CameraMode;
}

type Quality = "high" | "low";

export interface Settings {
  sound: boolean;
  cinematics: boolean;
  quality: Quality;
  hudBrightness: number;
}

interface CursorState {
  label: string | null;
  sub: string | null;
  x: number;
  y: number;
}

interface GameState {
  screen: Screen;
  portalOpen: PortalId | null;
  cameraMode: CameraMode;
  flyTarget: FlyTarget | null;
  cursor: CursorState;
  objective: string;
  objectiveDone: boolean;
  settings: Settings;
  soundOn: boolean;
  replayIntro: boolean;
  profilePanel: boolean;
  gymEntries: number;
  setScreen: (s: Screen) => void;
  setReplayIntro: (v: boolean) => void;
  setProfilePanel: (v: boolean) => void;
  openPortal: (id: PortalId, target?: { to: FlyTarget["to"]; look: FlyTarget["look"] }) => void;
  closePortal: () => void;
  setFlyTarget: (t: FlyTarget | null) => void;
  completeFly: () => void;
  setCursor: (c: Partial<CursorState>) => void;
  setObjective: (o: string, done?: boolean) => void;
  setSettings: (s: Partial<Settings>) => void;
}

export const useGame = create<GameState>((set, get) => ({
  screen: "intro",
  portalOpen: null,
  cameraMode: "intro",
  flyTarget: null,
  cursor: { label: null, sub: null, x: -100, y: -100 },
  objective: "Enter the GYMVERSE",
  objectiveDone: false,
  soundOn: false,
  replayIntro: true,
  profilePanel: false,
  gymEntries: 0,
  settings: {
    sound: false,
    cinematics: true,
    quality: "high",
    hudBrightness: 1,
  },
  setScreen: (screen) =>
    set({
      screen,
      portalOpen: null,
      profilePanel: false,
      cameraMode: screen === "gym" || screen === "profile" ? "hub" : get().cameraMode,
      gymEntries: screen === "gym" ? get().gymEntries + 1 : get().gymEntries,
    }),
  setReplayIntro: (v) => set({ replayIntro: v }),
  setProfilePanel: (v) => set({ profilePanel: v }),
  openPortal: (id, target) => {
    const fly =
      target ??
      ({ to: [0, 1.7, 7.2], look: [0, 1.7, -1.5] } as {
        to: FlyTarget["to"];
        look: FlyTarget["look"];
      });
    set({
      cameraMode: "flyIn",
      portalOpen: null,
      flyTarget: { to: fly.to, look: fly.look, mode: "flyIn" },
      objective: `ACCESSING ${id.toUpperCase()} ZONE`,
      objectiveDone: false,
    });
    window.setTimeout(() => {
      set({ portalOpen: id, cameraMode: "content", flyTarget: null });
    }, 1500);
  },
  closePortal: () => {
    set({ cameraMode: "flyOut", portalOpen: null });
    window.setTimeout(() => {
      set({ cameraMode: "hub", flyTarget: null });
    }, 1100);
  },
  setFlyTarget: (t) => set({ flyTarget: t }),
  completeFly: () => set({ flyTarget: null }),
  setCursor: (c) => set({ cursor: { ...get().cursor, ...c } }),
  setObjective: (objective, done = false) => set({ objective, objectiveDone: done }),
  setSettings: (s) => set({ settings: { ...get().settings, ...s } }),
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