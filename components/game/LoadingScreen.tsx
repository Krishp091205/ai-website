"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "./store";

const STEPS = [
  "Loading environment…",
  "Loading equipment…",
  "Synchronizing player…",
  "Entering gym…",
];

export default function LoadingScreen() {
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState(0);
  const setProgress = useGame((s) => s.setLoadingProgress);

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + 1 + Math.random() * 3);
      setPct(v);
      setProgress(v);
      setStep(Math.min(STEPS.length - 1, Math.floor((v / 100) * STEPS.length)));
      if (v >= 100) {
        clearInterval(id);
        window.setTimeout(() => {
          useGame.getState().setScreen("gym");
          useGame.getState().setObjective("EXPLORE THE TRAINING FLOOR — VISIT A ZONE");
        }, 500);
      }
    }, 55);
    return () => clearInterval(id);
  }, [setProgress]);

  return (
    <div className="absolute inset-0 z-[58] flex flex-col items-center justify-center bg-[#070708]">
      <motion.h1
        initial={{ opacity: 0, letterSpacing: "0.7em" }}
        animate={{ opacity: 1, letterSpacing: "0.28em" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="font-display text-5xl font-semibold text-white sm:text-7xl"
      >
        GYM<span className="shimmer-text">VERSE</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="letter-spacing-game mt-6 text-[11px] text-white/60"
      >
        INITIALIZING FITNESS SYSTEM…
      </motion.p>

      <div className="mt-10 w-72 sm:w-96">
        <div className="flex justify-between text-[10px] tracking-[0.22em] text-white/50">
          <span>{STEPS[step]}</span>
          <span className="text-accent">{Math.round(pct)}%</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-accent"
            style={{ boxShadow: "0 0 12px rgba(74,158,255,0.8)" }}
            animate={{ width: `${pct}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-10 text-[9px] tracking-[0.3em] text-white/25"
      >
        42 IRON ST · GYMVERSE COMPLEX · MUMBAI
      </motion.p>
    </div>
  );
}
