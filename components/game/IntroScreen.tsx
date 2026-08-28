"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MOTION_PREF, useGame } from "./store";
import { sound } from "./sound";

export default function IntroScreen() {
  const cinematics = useGame((s) => s.settings.cinematics);
  const replayIntro = useGame((s) => s.replayIntro);
  const setReplayIntro = useGame((s) => s.setReplayIntro);
  const [stage, setStage] = useState<"fade" | "reveal" | "menu">(
    replayIntro ? "fade" : "menu"
  );

  useEffect(() => {
    if (stage === "menu") {
      setReplayIntro(false);
      return;
    }
    let t0 = 0;
    const menuAt = () => setStage("menu");
    if (MOTION_PREF || !cinematics) {
      t0 = window.setTimeout(() => {
        setStage("reveal");
        window.setTimeout(menuAt, 400);
      }, 0);
      return () => window.clearTimeout(t0);
    }
    const t1 = window.setTimeout(() => setStage("reveal"), 600);
    const t2 = window.setTimeout(menuAt, 4400);
    const skip = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        setStage("menu");
        sound.click();
      }
    };
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("keydown", skip);
    };
  }, [cinematics, setReplayIntro, stage]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[55]"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: stage === "fade" ? 1 : 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        <AnimatePresence>
          {stage === "reveal" && (
            <motion.div className="flex h-full w-full flex-col items-center justify-center">
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.9em" }}
                animate={{ opacity: 1, letterSpacing: "0.28em" }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="font-display text-5xl font-semibold text-white sm:text-7xl md:text-8xl"
              >
                GYM<span className="shimmer-text">VERSE</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 1 }}
                className="letter-spacing-game mt-6 text-xs text-white/60 sm:text-sm"
              >
                ENTER THE GRIND
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === "menu" && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
        )}
        {stage === "menu" && <StartScreen />}
      </motion.div>
    </AnimatePresence>
  );
}

export function StartScreen() {
  const setScreen = useGame((s) => s.setScreen);
  const openPortal = useGame((s) => s.openPortal);

  const pick = (id: "profile" | "gym" | "programs" | "membership") => {
    if (id === "profile") {
      sound.whoosh();
      setScreen("profile");
    } else {
      sound.whoosh();
      setScreen("gym");
      if (id === "programs") window.setTimeout(() => openPortal("programs"), 750);
      if (id === "membership") window.setTimeout(() => openPortal("membership"), 750);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="absolute inset-0 z-[56] flex flex-col items-center justify-end pb-[10vh]"
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-display text-6xl font-semibold tracking-[0.2em] text-white sm:text-8xl"
        >
          GYMVERSE
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="letter-spacing-game text-[11px] text-white/50 sm:text-xs"
        >
          ENTER THE GRIND
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:gap-8"
        >
          <button
            data-cursor="SELECT"
            onClick={() => pick("profile")}
            className="group relative rounded-sm border border-line px-12 py-4 font-display text-lg tracking-[0.3em] text-white transition-all hover:border-accent"
          >
            <span className="absolute inset-0 -z-10 bg-accent/10 opacity-0 transition-opacity group-hover:opacity-100" />
            START
          </button>
          <button
            data-cursor="SELECT"
            onClick={() => pick("gym")}
            className="rounded-sm border border-line px-10 py-4 font-display text-lg tracking-[0.3em] text-white/70 transition-all hover:border-accent/50 hover:text-white"
          >
            CONTINUE
          </button>
          <button
            data-cursor="SELECT"
            onClick={() => pick("gym")}
            className="rounded-sm border border-line px-10 py-4 font-display text-lg tracking-[0.3em] text-white/70 transition-all hover:border-accent/50 hover:text-white"
          >
            EXPLORE GYM
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex flex-col gap-3 sm:flex-row sm:gap-10"
        >
          {(
            [
              ["PROGRAMS", "programs"],
              ["MEMBERSHIP", "membership"],
            ] as const
          ).map(([label, id]) => (
            <button
              key={label}
              data-cursor="SELECT"
              onClick={() => pick(id)}
              className="menu-item"
            >
              {label}
            </button>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-2 text-[10px] tracking-[0.24em] text-white/30"
        >
          PRESS START · AUDIO RESPECTS YOUR BROWSER · ESC TO SKIP
        </motion.p>
      </div>
    </motion.div>
  );
}