"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CINEMATIC_LINES, ZONES } from "./data";
import { MOTION_PREF, useGame, type PortalId } from "./store";
import { sound } from "./sound";
import IntroScreen from "./IntroScreen";
import ProfileScreen from "./ProfileScreen";
import Hud from "./Hud";
import PortalContent from "./PortalContent";
import TunnelFlash from "./TunnelFlash";
import CustomCursor from "./CustomCursor";
import GameScene from "./three/GameScene";

function CutsceneLines() {
  const gymEntries = useGame((s) => s.gymEntries);
  const cinematics = useGame((s) => s.settings.cinematics);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (gymEntries === 0) return;
    if (MOTION_PREF || !cinematics) return;
    const ids: number[] = [];
    ids.push(window.setTimeout(() => setShow(true), 30));
    CINEMATIC_LINES.forEach((_, i) => {
      ids.push(window.setTimeout(() => setIdx(i), 30 + i * 700));
    });
    ids.push(
      window.setTimeout(
        () => setShow(false),
        30 + CINEMATIC_LINES.length * 700 + 900
      )
    );
    return () => ids.forEach(window.clearTimeout);
  }, [gymEntries, cinematics]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 z-[66] flex items-center justify-center bg-black/40"
        >
          <AnimatePresence mode="wait">
            {idx < CINEMATIC_LINES.length ? (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 18, letterSpacing: "0.6em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.3em" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="font-display text-2xl text-white sm:text-4xl"
              >
                {CINEMATIC_LINES[idx]}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function GameRoot() {
  const screen = useGame((s) => s.screen);
  const soundOn = useGame((s) => s.settings.sound);
  const profilePanel = useGame((s) => s.profilePanel);
  const setProfilePanel = useGame((s) => s.setProfilePanel);

  useEffect(() => {
    sound.setEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    if (MOTION_PREF) useGame.setState({ cameraMode: "hub" });
  }, []);

  useEffect(() => {
    const cb = useGame.getState().settings.colorblind;
    document.documentElement.dataset.cb = String(cb);
    const un = useGame.subscribe((s) => {
      document.documentElement.dataset.cb = String(s.settings.colorblind);
    });
    return () => un();
  }, []);

  useEffect(() => {
    const m = window.location.hash.match(/^#zone\/([a-z-]+)$/);
    if (!m) return;
    const id = m[1] as PortalId;
    const valid = ["about", "programs", "trainers", "facility", "membership", "contact"].includes(id);
    if (!valid) return;
    if (MOTION_PREF) return;
    const t1 = window.setTimeout(() => {
      useGame.getState().setScreen("gym");
    }, 400);
    const t2 = window.setTimeout(() => {
      useGame.getState().openPortal(id, ZONES[id].anchor);
    }, 2200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const unlock = () => sound.ensure();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#070707]">
      <GameScene />

      <div className="vignette" />
      <div className="scanlines" />

      {screen === "intro" && <IntroScreen />}
      {screen === "profile" && <ProfileScreen />}

      <PortalContent />
      <TunnelFlash />

      {screen === "gym" && (
        <Hud onProfile={() => setProfilePanel(true)} />
      )}

      {profilePanel && screen === "gym" && (
        <ProfileScreen onClose={() => setProfilePanel(false)} />
      )}

      {screen === "gym" && <CutsceneLines />}

      <CustomCursor />
    </div>
  );
}