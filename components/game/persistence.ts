"use client";

import { PROGRAMS } from "./data";
import {
  useGame,
  type MissionState,
  type Quality,
  type Settings,
  type ViewMode,
  type WorldZoneId,
} from "./store";

const KEY = "gymverse.save.v1";
const VERSION = 1;

interface Progression {
  level: number;
  xp: number;
  fitnessScore: number;
  streak: number;
  visitedZones: WorldZoneId[];
}

interface SaveFile {
  version: number;
  settings: Partial<Settings>;
  progression: Progression;
  missions: Record<string, MissionState>;
}

const QUALITIES: Quality[] = ["low", "medium", "high", "ultra"];
const VIEW_MODES: ViewMode[] = ["first", "third"];
const PROGRAM_IDS = new Set(PROGRAMS.map((p) => p.id));
const ZONES = new Set([
  "entry",
  "cardio",
  "strength",
  "weights",
  "functional",
  "recovery",
  "exit",
]);

const num = (v: unknown, fallback: number, min: number, max: number) => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const bool = (v: unknown, fallback: boolean) =>
  typeof v === "boolean" ? v : fallback;

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const probe = "__gymverse_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function sanitizeSettings(raw: unknown): Partial<Settings> {
  if (!raw || typeof raw !== "object") return {};
  const s = raw as Record<string, unknown>;
  const out: Partial<Settings> = {};
  if (typeof s.sound === "boolean") out.sound = s.sound;
  if (typeof s.music === "boolean") out.music = s.music;
  if (typeof s.sfx === "boolean") out.sfx = s.sfx;
  if (typeof s.cinematics === "boolean") out.cinematics = s.cinematics;
  if (typeof s.colorblind === "boolean") out.colorblind = s.colorblind;
  if (typeof s.motionBlur === "boolean") out.motionBlur = s.motionBlur;
  if (typeof s.quality === "string" && QUALITIES.includes(s.quality as Quality))
    out.quality = s.quality as Quality;
  if (typeof s.viewMode === "string" && VIEW_MODES.includes(s.viewMode as ViewMode))
    out.viewMode = s.viewMode as ViewMode;
  if ("hudBrightness" in s)
    out.hudBrightness = num(s.hudBrightness, 1, 0.4, 1.6);
  if ("mouseSensitivity" in s)
    out.mouseSensitivity = num(s.mouseSensitivity, 1, 0.3, 2.5);
  if ("cameraSensitivity" in s)
    out.cameraSensitivity = num(s.cameraSensitivity, 1, 0.3, 2.5);
  if ("fov" in s) out.fov = Math.round(num(s.fov, 68, 55, 90));
  return out;
}

export function sanitizeMission(raw: unknown): MissionState | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  if (typeof m.id !== "string" || !PROGRAM_IDS.has(m.id)) return null;
  const status = m.status === "completed" ? "completed" : "active";
  const exercises = Array.isArray(m.completedExercises)
    ? m.completedExercises.filter((x): x is string => typeof x === "string")
    : [];
  return {
    id: m.id,
    accepted: true,
    status,
    startedAt: typeof m.startedAt === "number" ? m.startedAt : Date.now(),
    progress: num(m.progress, 0, 0, 100),
    completedExercises: exercises,
    xpReward: typeof m.xpReward === "number" ? m.xpReward : 0,
    xpEarned: num(m.xpEarned, 0, 0, 100000),
    completedAt: typeof m.completedAt === "number" ? m.completedAt : null,
  };
}

export function sanitizeProgression(raw: unknown): Progression {
  const p = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const visited = Array.isArray(p.visitedZones)
    ? p.visitedZones.filter(
        (z): z is WorldZoneId =>
          typeof z === "string" && ZONES.has(z as WorldZoneId)
      )
    : [];
  return {
    level: Math.round(num(p.level, 27, 1, 99)),
    xp: Math.round(num(p.xp, 4820, 0, 1_000_000)),
    fitnessScore: Math.round(num(p.fitnessScore, 87, 0, 100)),
    streak: Math.round(num(p.streak, 4, 0, 100000)),
    visitedZones: visited,
  };
}

export function readSave(): SaveFile | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const text = storage.getItem(KEY);
    if (!text) return null;
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    const missions: Record<string, MissionState> = {};
    const rawMissions = parsed.missions;
    if (rawMissions && typeof rawMissions === "object") {
      for (const [id, value] of Object.entries(rawMissions)) {
        const m = sanitizeMission({ ...(value as object), id });
        if (m) missions[id] = m;
      }
    }
    return {
      version: VERSION,
      settings: sanitizeSettings(parsed.settings),
      progression: sanitizeProgression(parsed.progression),
      missions,
    };
  } catch {
    return null;
  }
}

let writeTimer: number | null = null;

export function writeSave() {
  const storage = safeStorage();
  if (!storage) return;
  const s = useGame.getState();
  const save: SaveFile = {
    version: VERSION,
    settings: {
      sound: s.settings.sound,
      music: s.settings.music,
      sfx: s.settings.sfx,
      cinematics: s.settings.cinematics,
      quality: s.settings.quality,
      hudBrightness: s.settings.hudBrightness,
      colorblind: s.settings.colorblind,
      viewMode: s.settings.viewMode,
      mouseSensitivity: s.settings.mouseSensitivity,
      cameraSensitivity: s.settings.cameraSensitivity,
      fov: s.settings.fov,
      motionBlur: s.settings.motionBlur,
    },
    progression: {
      level: s.level,
      xp: s.xp,
      fitnessScore: s.fitnessScore,
      streak: s.streak,
      visitedZones: s.visitedZones,
    },
    missions: s.missions,
  };
  try {
    storage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* storage full or unavailable — progress stays in memory */
  }
}

export function clearSave() {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

let started = false;

/** Restore persisted state and begin saving future changes. Idempotent. */
export function initPersistence() {
  if (started || typeof window === "undefined") return () => {};
  started = true;

  const save = readSave();
  if (save) {
    useGame.setState({
      settings: { ...useGame.getState().settings, ...save.settings },
      level: save.progression.level,
      xp: save.progression.xp,
      fitnessScore: save.progression.fitnessScore,
      streak: save.progression.streak,
      visitedZones: save.progression.visitedZones,
      missions: save.missions,
      viewMode: save.settings.viewMode ?? useGame.getState().viewMode,
    });
  }

  const unsubscribe = useGame.subscribe((state, prev) => {
    if (
      state.settings === prev.settings &&
      state.level === prev.level &&
      state.xp === prev.xp &&
      state.fitnessScore === prev.fitnessScore &&
      state.streak === prev.streak &&
      state.missions === prev.missions &&
      state.visitedZones === prev.visitedZones
    )
      return;
    if (writeTimer != null) window.clearTimeout(writeTimer);
    writeTimer = window.setTimeout(writeSave, 250);
  });

  window.addEventListener("pagehide", writeSave);
  return () => {
    unsubscribe();
    window.removeEventListener("pagehide", writeSave);
    writeSave();
  };
}
