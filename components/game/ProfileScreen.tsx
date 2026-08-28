"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import { PROFILE } from "./data";
import { useGame } from "./store";
import { sound } from "./sound";

export default function ProfileScreen({
  onClose,
}: {
  onClose?: () => void;
}) {
  const setScreen = useGame((s) => s.setScreen);
  const openPortal = useGame((s) => s.openPortal);
  const liveLevel = useGame((s) => s.level);
  const liveFitness = useGame((s) => s.fitnessScore);
  const liveXp = useGame((s) => s.xp);
  const liveStreak = useGame((s) => s.streak);

  const enterGym = () => {
    sound.whoosh();
    setScreen("loading");
    useGame.getState().setObjective("EXPLORE THE TRAINING FLOOR");
  };
  const startProgram = () => {
    sound.whoosh();
    setScreen("loading");
    window.setTimeout(() => openPortal("programs"), 2500);
  };

  return (
    <div className="absolute inset-0 z-[58] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hud-panel w-[92vw] max-w-4xl rounded-sm p-8 sm:p-12"
      >
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-[10px] tracking-[0.34em] text-accent">
              PLAYER PROFILE
            </div>
            <h1 className="mt-2 font-display text-5xl font-semibold tracking-[0.12em] text-white sm:text-6xl">
              {PROFILE.player}
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="relative h-28 w-28"
          >
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#4a9eff"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 52 * (1 - liveLevel / 100),
                }}
                transition={{ delay: 0.6, duration: 1.4, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 0 10px rgba(74,158,255,0.6))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl text-white">
                {liveLevel}
              </span>
              <span className="text-[9px] tracking-[0.3em] text-muted">
                LEVEL
              </span>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div>
              <div className="flex items-end justify-between text-[11px] tracking-[0.24em]">
                <span className="text-white/80">FITNESS SCORE</span>
                <Counter
                  to={liveFitness}
                  className="font-display text-2xl text-accent text-glow"
                />
              </div>
              <Bar value={liveFitness} color="accent" delay={0.5} />
            </div>
            <div>
              <div className="flex items-end justify-between text-[11px] tracking-[0.24em]">
                <span className="text-white/80">XP → NEXT LEVEL</span>
                <Counter
                  to={Math.min(100, Math.round((liveXp / PROFILE.xpNext) * 100))}
                  className="font-display text-2xl text-white"
                  suffix="%"
                />
              </div>
              <Bar
                value={Math.min(100, Math.round((liveXp / PROFILE.xpNext) * 100))}
                color="white"
                delay={0.7}
              />
              <div className="mt-2 flex justify-between text-[10px] tracking-[0.2em] text-muted">
                <span>{liveXp.toLocaleString()} XP</span>
                <span>{PROFILE.xpNext.toLocaleString()} XP · STREAK {liveStreak}</span>
              </div>
            </div>
            <div className="space-y-3">
              {PROFILE.stats.map((s, i) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[10px] tracking-[0.22em] text-white/70">
                    <span>{s.label}</span>
                    <span className="text-white">
                      <Counter to={s.value} />
                    </span>
                  </div>
                  <Bar value={s.value} delay={0.9 + i * 0.15} />
                </div>
              ))}
            </div>
          </div>

          <motion.div className="flex flex-col justify-between gap-8">
            <div>
              <div className="text-[10px] tracking-[0.34em] text-muted">
                MILESTONES UNLOCKED
              </div>
              <ul className="mt-4 space-y-3">
                {PROFILE.milestones.map((m, i) => (
                  <motion.li
                    key={m}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.2 }}
                    className="flex items-center gap-3 text-sm text-white/80"
                  >
                    <span className="flex h-4 w-4 items-center justify-center text-[10px] text-accent">
                      ✓
                    </span>
                    {m}
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="flex flex-wrap items-center gap-3"
            >
              <button
                data-cursor="ENTER GYM"
                onClick={enterGym}
                className="rounded-sm bg-accent px-8 py-4 font-display text-sm tracking-[0.28em] text-black transition-all hover:bg-white"
              >
                ENTER GYM
              </button>
              <button
                data-cursor="SELECT"
                onClick={startProgram}
                className="rounded-sm border border-line px-8 py-4 font-display text-sm tracking-[0.28em] text-white/80 transition-all hover:border-accent/60 hover:text-white"
              >
                START PROGRAM
              </button>
              {onClose && (
                <button
                  data-cursor="RETURN"
                  onClick={() => {
                    sound.click();
                    onClose();
                  }}
                  className="rounded-sm border border-line px-6 py-4 text-xs tracking-[0.28em] text-white/50 transition-colors hover:text-white"
                >
                  RETURN
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function Counter({
  to,
  className,
  suffix = "",
}: {
  to: number;
  className?: string;
  suffix?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (n) => setV(Math.round(n)),
    });
    return () => c.stop();
  }, [to]);
  return (
    <span className={className}>
      {v}
      {suffix}
    </span>
  );
}

function Bar({
  value,
  delay = 0,
  color = "accent",
}: {
  value: number;
  delay?: number;
  color?: "accent" | "white";
}) {
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <motion.div
        className={`h-full rounded-full ${
          color === "accent" ? "bg-accent" : "bg-white/80"
        }`}
        style={{
          boxShadow:
            color === "accent"
              ? "0 0 10px rgba(74,158,255,0.7)"
              : "0 0 8px rgba(255,255,255,0.4)",
        }}
        initial={{ width: "0%" }}
        animate={{ width: `${value}%` }}
        transition={{ delay, duration: 1.1, ease: "easeOut" }}
      />
    </div>
  );
}