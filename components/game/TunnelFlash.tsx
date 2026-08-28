"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "./store";

export default function TunnelFlash() {
  const flash = useGame((s) => s.flash);
  return (
    <AnimatePresence>
      {flash === "bright" && (
        <motion.div
          key="tunnel-bright"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="pointer-events-none fixed inset-0 z-[65]"
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(190,225,255,0.55) 0%, rgba(74,158,255,0.18) 30%, rgba(0,0,0,0.55) 75%, #000 100%)",
              filter: "blur(18px)",
            }}
            animate={{ scale: [0.35, 1.25], opacity: [1, 0] }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="absolute inset-0 bg-black"
            animate={{ scale: [0.5, 1], opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        </motion.div>
      )}

      {flash === "dark" && (
        <motion.div
          key="tunnel-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.92, 0.92, 0] }}
          transition={{
            duration: 1.2,
            times: [0, 0.2, 0.85, 1],
            ease: "easeInOut",
          }}
          className="pointer-events-none fixed inset-0 z-[65] bg-black"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(74,158,255,0.1) 0%, transparent 55%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}