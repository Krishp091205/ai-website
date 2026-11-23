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
    let t3 = 0;
    const menuAt = () => setStage("menu");
    if (MOTION_PREF || !cinematics) {
      t0 = window.setTimeout(() => {
        setStage("reveal");
        t3 = window.setTimeout(menuAt, 400);
      }, 0);
      return () => {
        window.clearTimeout(t0);
        window.clearTimeout(t3);
      };
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
                THE FLOOR IS WAITING
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === "menu" && <StartScreen />}
      </motion.div>
    </AnimatePresence>
  );
}

export function StartScreen() {
  const setScreen = useGame((s) => s.setScreen);
  const openPortal = useGame((s) => s.openPortal);

  const pick = (id: "profile" | "gym" | "programs" | "membership") => {
    sound.whoosh();
    if (id === "profile") {
      setScreen("profile");
      return;
    }
    if (id === "gym") {
      setScreen("loading");
      return;
    }
    setScreen("loading");
    window.setTimeout(() => openPortal(id), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="absolute inset-0 z-[56] flex flex-col justify-between px-6 pb-[6vh] pt-[10vh] sm:px-12 lg:px-20"
    >
      <div className="hero-scrim" />

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="relative z-10 flex items-start justify-between gap-6"
      >
        <div>
          <div className="eyebrow">GYMVERSE · MUMBAI · EST. 2019</div>
          <div className="gold-rule mt-3 h-px w-28" />
        </div>
        <div className="hidden text-right text-[10px] leading-5 tracking-[0.26em] text-white/45 sm:block">
          <div>14,000 SQ FT</div>
          <div>6 TRAINING ZONES</div>
        </div>
      </motion.div>

      <div className="relative z-10 grid w-full max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="eyebrow"
          >
            THE TRAINING ARENA
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9, ease: "easeOut" }}
            className="mt-5 font-display text-[clamp(3.8rem,11vw,9.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.035em] text-white"
          >
            <span className="block">TRAIN</span>
            <span className="block shimmer-text">WITHOUT</span>
            <span className="block">APOLOGY</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="mt-7 max-w-xl text-sm leading-7 text-white/70 sm:text-base"
          >
            A 14,000 sq ft strength and conditioning arena. Choose a mission,
            enter the floor, and track every rep.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8 }}
          className="lg:pb-2"
        >
          <div className="eyebrow mb-4">QUICK ENTRY</div>
          <div className="flex flex-col gap-3 sm:max-w-md">
            <button
              data-cursor="ENTER"
              onClick={() => pick("gym")}
              className="btn-primary"
            >
              ENTER THE ARENA <span aria-hidden="true">→</span>
            </button>
            <button
              data-cursor="SELECT"
              onClick={() => pick("profile")}
              className="btn-secondary"
            >
              BUILD YOUR PROFILE
            </button>
            <button
              data-cursor="VIEW"
              onClick={() => pick("programs")}
              className="btn-ghost justify-start"
            >
              VIEW TRAINING PROGRAMS
            </button>
            <button
              data-cursor="VIEW"
              onClick={() => pick("membership")}
              className="btn-ghost justify-start"
            >
              MEMBERSHIP &amp; PRICING
            </button>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 border-t border-line pt-5">
            {[
              ["18", "COACHES"],
              ["2,400", "MEMBERS"],
              ["31", "RECORDS / YR"],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="font-display text-2xl text-white">{value}</div>
                <div className="mt-1 text-[9px] tracking-[0.22em] text-white/40">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.35 }}
        className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 text-[9px] tracking-[0.26em] text-white/40"
      >
        <span>WASD MOVE · MOUSE LOOK · E INTERACT · M MAP</span>
        <span>ESC SKIPS INTRO · AUDIO FOLLOWS BROWSER</span>
      </motion.div>
    </motion.div>
  );
}
