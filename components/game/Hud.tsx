"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ROOM_BY_ID } from "./level";
import { IS_MOBILE, useGame } from "./store";
import { sound } from "./sound";
import WorldMap from "./WorldMap";
import SettingsPanel from "./SettingsPanel";

export default function Hud({ onProfile }: { onProfile: () => void }) {
  const objective = useGame((s) => s.objective);
  const objectiveDone = useGame((s) => s.objectiveDone);
  const hudBrightness = useGame((s) => s.settings.hudBrightness);
  const level = useGame((s) => s.level);
  const fitnessScore = useGame((s) => s.fitnessScore);
  const xp = useGame((s) => s.xp);
  const streak = useGame((s) => s.streak);
  const currentZone = useGame((s) => s.currentZone);
  const interaction = useGame((s) => s.interaction);
  const feedback = useGame((s) => s.feedback);
  const locked = useGame((s) => s.locked);
  const soundOn = useGame((s) => s.settings.sound);
  const setSettings = useGame((s) => s.setSettings);
  const mapOpen = useGame((s) => s.mapOpen);
  const setMapOpen = useGame((s) => s.setMapOpen);

  const [menuOpen, setMenuOpen] = useState(false);

  const zoneName = (ROOM_BY_ID[currentZone] ?? ROOM_BY_ID.entry).name;
  const zoneAccent = (ROOM_BY_ID[currentZone] ?? ROOM_BY_ID.entry).accent;

  const toggleSound = () => {
    const next = !soundOn;
    sound.setEnabled(next);
    setSettings({ sound: next, sfx: next });
    if (next) sound.click();
  };

  // M key opens map, ESC closes overlays / opens menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (!menuOpen) {
          sound.click();
          setMapOpen(!mapOpen);
        }
      }
      if (e.key === "Escape") {
        if (menuOpen) setMenuOpen(false);
        if (mapOpen) setMapOpen(false);
        if (!menuOpen && !mapOpen) {
          setMenuOpen(true);
          document.exitPointerLock?.();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, mapOpen, setMapOpen]);

  const openMenu = () => {
    sound.click();
    document.exitPointerLock?.();
    setMenuOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {!mapOpen && !menuOpen && !locked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-50"
            style={{ filter: `brightness(${(0.55 + hudBrightness * 0.6).toFixed(2)})` }}
          >
            {/* top-left: brand */}
            <div className="absolute left-5 top-4 flex items-center gap-3">
              <span className="hud-panel flex h-8 items-center rounded-sm px-4 text-[11px] font-bold tracking-[0.3em] text-white">
                GY<span className="text-accent">M</span>VERSE
              </span>
            </div>

            {/* top-right: level + fitness */}
            <div className="absolute right-5 top-4 flex items-center gap-4 font-display text-[11px] tracking-[0.2em] text-white/75">
              <span className="hud-panel rounded-sm px-3 py-1.5">
                LEVEL <span className="text-white">{level}</span>
              </span>
              <span className="hud-panel rounded-sm px-3 py-1.5">
                FITNESS <span className="text-accent text-glow">{fitnessScore}</span>
              </span>
            </div>

            {/* XP bar top center */}
            <div className="absolute left-1/2 top-4 w-44 -translate-x-1/2">
              <div className="mb-1 flex items-center justify-between text-[9px] tracking-[0.24em] text-white/50">
                <span className="text-accent">{xp.toLocaleString()} XP</span>
                <span className="text-muted">STREAK {streak}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-accent"
                  style={{ boxShadow: "0 0 10px rgba(74,158,255,0.7)" }}
                  animate={{ width: `${Math.min(100, (xp / 6400) * 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* zone label */}
            <div className="absolute left-5 top-16">
              <div className="text-[9px] tracking-[0.3em] text-muted">CURRENT ZONE</div>
              <div className="font-display text-lg tracking-[0.18em]" style={{ color: zoneAccent }}>
                {zoneName}
              </div>
            </div>

            {/* objective bottom-left */}
            <motion.div
              key={objective}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-5 left-5"
            >
              <div className="hud-panel rounded-sm px-4 py-2.5">
                <div className="text-[9px] tracking-[0.3em] text-accent">
                  {objectiveDone ? "OBJECTIVE COMPLETE" : "CURRENT OBJECTIVE"}
                </div>
                <div className="font-display text-sm tracking-[0.14em] text-white/90">{objective}</div>
              </div>
            </motion.div>

            {/* interaction prompt bottom-center */}
            <AnimatePresence>
              {interaction && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
                >
                  <span className="hud-panel inline-flex items-center gap-3 rounded-sm px-4 py-2.5">
                    <span className="flex h-6 w-6 items-center justify-center border border-accent/70 bg-accent/20 font-display text-[11px] font-bold text-white">
                      E
                    </span>
                    <span className="text-[10px] tracking-[0.22em] text-white/90">
                      INTERACT · {interaction}
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* feedback toasts center */}
            <div className="pointer-events-none absolute left-1/2 top-[28%] -translate-x-1/2 space-y-1 text-center">
              <AnimatePresence>
                {feedback.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="font-display text-xl tracking-[0.2em]"
                    style={{ color: f.accent ?? "#ffffff" }}
                  >
                    {f.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* bottom-right buttons */}
            <div className="pointer-events-auto absolute bottom-5 right-5 flex items-center gap-2">
              {!IS_MOBILE && (
                <button
                  data-cursor="SELECT"
                  onClick={() => {
                    sound.click();
                    setMapOpen(true);
                  }}
                  aria-label="Open gym map"
                  className="hud-panel no-pointer-lock rounded-sm px-3 py-2 text-[10px] font-semibold tracking-[0.24em] text-white/80 transition-colors hover:border-accent/40 hover:text-white"
                >
                  MAP
                </button>
              )}
              <button
                data-cursor="SELECT"
                onClick={onProfile}
                aria-label="Open player profile"
                className="hud-panel no-pointer-lock rounded-sm px-3 py-2 text-[10px] font-semibold tracking-[0.24em] text-white/80 transition-colors hover:border-accent/40 hover:text-white"
              >
                PROFILE
              </button>
              <button
                data-cursor="SELECT"
                onClick={openMenu}
                aria-label="Open menu and settings"
                className="hud-panel no-pointer-lock rounded-sm px-3 py-2 text-[10px] font-semibold tracking-[0.24em] text-white/80 transition-colors hover:border-accent/40 hover:text-white"
              >
                MENU
              </button>
              <button
                data-cursor="SELECT"
                onClick={toggleSound}
                aria-pressed={soundOn}
                aria-label={soundOn ? "Mute sound" : "Enable sound"}
                className="hud-panel no-pointer-lock rounded-sm px-3 py-2 text-[10px] font-semibold tracking-[0.2em] text-white/80 transition-colors hover:border-accent/40 hover:text-white"
              >
                {soundOn ? "🔊" : "🔇"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-to-lock hint when unlocked */}
      <AnimatePresence>
        {locked && !menuOpen && !mapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[48] flex items-center justify-center"
          >
            <div className="hud-panel rounded-sm px-6 py-4 text-center">
              <div className="font-display text-lg tracking-[0.24em] text-white">
                CLICK TO {IS_MOBILE ? "CONTROL" : "LOOK AROUND"}
              </div>
              <div className="mt-1 text-[10px] tracking-[0.24em] text-muted">
                M — MAP · ESC — MENU
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(mapOpen || menuOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            {mapOpen && <WorldMap onClose={() => setMapOpen(false)} />}
            {menuOpen && (
              <SettingsPanel
                onClose={() => setMenuOpen(false)}
                onMap={() => setMapOpen(true)}
                onProfile={onProfile}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
