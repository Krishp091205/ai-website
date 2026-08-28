"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PORTALS, PROFILE, ZONES } from "./data";
import { useGame, type PortalId } from "./store";
import { sound } from "./sound";

export default function Hud({ onProfile }: { onProfile: () => void }) {
  const cameraMode = useGame((s) => s.cameraMode);
  const objective = useGame((s) => s.objective);
  const objectiveDone = useGame((s) => s.objectiveDone);
  const soundOn = useGame((s) => s.settings.sound);
  const setSettings = useGame((s) => s.setSettings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const visible = cameraMode !== "intro" && cameraMode !== "content";

  const toggleSound = () => {
    const next = !soundOn;
    sound.setEnabled(next);
    setSettings({ sound: next });
    if (next) sound.click();
  };

  const travelTo = (id: PortalId) => {
    sound.whoosh();
    setMapOpen(false);
    window.setTimeout(() => {
      const st = useGame.getState();
      if (st.portalOpen) return;
      st.openPortal(id, ZONES[id].anchor);
    }, 250);
  };

  return (
    <>
      <AnimatePresence>
        {visible && !mapOpen && !menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none fixed inset-0 z-50"
          >
            <div className="absolute left-6 top-5 flex items-center gap-3">
              <span className="hud-panel flex h-9 items-center rounded-sm px-4 text-[11px] font-bold tracking-[0.3em] text-white">
                GY<span className="text-accent">M</span>VERSE
              </span>
            </div>

            <div className="absolute right-6 top-5 flex items-center gap-5 font-display text-[11px] tracking-[0.22em] text-white/70">
              <span className="hud-panel rounded-sm px-3 py-2">
                LEVEL <span className="text-white">{PROFILE.level}</span>
              </span>
              <span className="hud-panel rounded-sm px-3 py-2">
                FITNESS <span className="text-accent text-glow">{PROFILE.fitnessScore}</span>
              </span>
            </div>

            <motion.div
              key={objective}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-6 left-6"
            >
              <div className="hud-panel rounded-sm px-4 py-3">
                <div className="text-[9px] tracking-[0.3em] text-accent">
                  {objectiveDone ? "OBJECTIVE COMPLETE" : "CURRENT OBJECTIVE"}
                </div>
                <div className="font-display text-[15px] tracking-[0.14em] text-white/90">
                  {objective}
                </div>
              </div>
              {objectiveDone && (
                <div className="mt-1 text-[10px] tracking-[0.3em] text-emerald-400">
                  ✓ COMPLETE
                </div>
              )}
            </motion.div>

            <div className="absolute bottom-6 right-6 flex items-center gap-3">
              <button
                data-cursor="SELECT"
                onClick={() => {
                  sound.click();
                  setMapOpen(true);
                }}
                className="hud-panel rounded-sm px-4 py-3 text-[11px] font-semibold tracking-[0.24em] text-white/80 transition-colors hover:border-accent/40 hover:text-white"
              >
                MAP
              </button>
              <button
                data-cursor="SELECT"
                onClick={onProfile}
                className="hud-panel rounded-sm px-4 py-3 text-[11px] font-semibold tracking-[0.24em] text-white/80 transition-colors hover:border-accent/40 hover:text-white"
              >
                PROFILE
              </button>
              <button
                data-cursor="SELECT"
                onClick={() => {
                  sound.click();
                  setMenuOpen(true);
                }}
                className="hud-panel rounded-sm px-4 py-3 text-[11px] font-semibold tracking-[0.24em] text-white/80 transition-colors hover:border-accent/40 hover:text-white"
              >
                MENU
              </button>
              <button
                data-cursor="SELECT"
                onClick={toggleSound}
                aria-pressed={soundOn}
                className="hud-panel rounded-sm px-4 py-3 text-[11px] font-semibold tracking-[0.2em] text-white/80 transition-colors hover:border-accent/40 hover:text-white"
              >
                {soundOn ? "🔊" : "🔇"}
              </button>
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
            {mapOpen && (
              <motion.div
                initial={{ scale: 0.94, y: 12, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, y: 10, opacity: 0 }}
                className="hud-panel w-[92vw] max-w-2xl rounded-sm p-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl tracking-[0.2em] text-white">
                      WORLD MAP
                    </h2>
                    <p className="mt-1 text-[10px] tracking-[0.26em] text-muted">
                      TAP A ZONE TO FAST-TRAVEL
                    </p>
                  </div>
                  <button
                    data-cursor="SELECT"
                    className="text-muted transition-colors hover:text-white"
                    onClick={() => {
                      sound.click();
                      setMapOpen(false);
                    }}
                    aria-label="Close map"
                  >
                    ESC ✕
                  </button>
                </div>

                <div className="relative mt-6 h-[300px] overflow-hidden rounded-sm border border-line bg-[radial-gradient(100%_100%_at_50%_50%,#0d1119_0%,#07070a_100%)]">
                  {PORTALS.map((p) => {
                    const [mx, my] = project(p.position);
                    return (
                      <motion.button
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * mapIndex(p.id) }}
                        data-cursor={p.command}
                        onClick={() => travelTo(p.id)}
                        className="group absolute z-10"
                        style={{ left: mx - 14, top: my - 14 }}
                      >
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full border transition-transform group-hover:scale-125 animate-float"
                          style={{
                            borderColor: ZONES[p.id].accent,
                            boxShadow: `0 0 12px ${ZONES[p.id].accent}66`,
                            background: `${ZONES[p.id].accent}14`,
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: ZONES[p.id].accent }}
                          />
                        </span>
                        <span className="absolute left-1/2 top-full mt-1 whitespace-nowrap -translate-x-1/2 text-[9px] tracking-[0.22em] text-white/60 group-hover:text-white">
                          {p.name}
                        </span>
                      </motion.button>
                    );
                  })}

                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/50" />
                      <span className="relative h-3 w-3 rounded-full border border-accent bg-accent/30" />
                    </span>
                    <span className="text-[9px] tracking-[0.24em] text-accent">
                      YOU ARE HERE — HUB
                    </span>
                  </span>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.26em] text-white/25">
                    42 IRON ST · GYMVERSE COMPLEX
                  </div>
                </div>
              </motion.div>
            )}
            {menuOpen && (
              <motion.div
                initial={{ scale: 0.94, y: 12, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, y: 10, opacity: 0 }}
                className="hud-panel w-[92vw] max-w-md rounded-sm p-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl tracking-[0.2em] text-white">
                    SETTINGS
                  </h2>
                  <button
                    data-cursor="SELECT"
                    className="text-muted transition-colors hover:text-white"
                    onClick={() => {
                      sound.click();
                      setMenuOpen(false);
                    }}
                    aria-label="Close settings"
                  >
                    ESC ✕
                  </button>
                </div>
                <div className="mt-6 space-y-6">
                  <Toggle
                    label="SOUND"
                    on={soundOn}
                    onClick={toggleSound}
                  />
                  <Toggle
                    label="CINEMATICS"
                    on={useGame.getState().settings.cinematics}
                    onClick={() =>
                      useGame
                        .getState()
                        .setSettings({ cinematics: !useGame.getState().settings.cinematics })
                    }
                  />
                  <div className="flex items-center justify-between text-[11px] tracking-[0.24em] text-white/70">
                    <span>ANIMATION SPEED</span>
                    <span className="text-muted">100%</span>
                  </div>
                </div>
                <p className="mt-6 text-[10px] tracking-[0.24em] text-muted">
                  PRESS ESC TO RETURN TO THE WORLD
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-cursor="SELECT"
      onClick={onClick}
      aria-pressed={on}
      className="flex w-full items-center justify-between text-[11px] tracking-[0.24em] text-white/80"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-10 rounded-full border transition-colors ${
          on ? "border-accent/60 bg-accent/20" : "border-line bg-charcoal"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
            on ? "left-5.5 bg-accent" : "left-0.5 bg-white/30"
          }`}
        />
      </span>
    </button>
  );
}

const MAP_ORDER: Record<string, number> = {
  about: 0,
  programs: 1,
  trainers: 2,
  facility: 3,
  membership: 4,
  contact: 5,
};

function mapIndex(id: string) {
  return MAP_ORDER[id] ?? 0;
}

function project(p: [number, number, number]): [number, number] {
  return [150 + p[0] * 5.6, 150 - p[2] * 5.8];
}