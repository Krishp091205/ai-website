"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { IS_FINE_POINTER, useGame } from "./store";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [pressing, setPressing] = useState(false);
  const label = useGame((s) => s.cursor.label);
  const sub = useGame((s) => s.cursor.sub);
  const setCursor = useGame((s) => s.setCursor);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });
  const rx = useRef(x);

  useEffect(() => {
    if (!IS_FINE_POINTER) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      const raw = el?.getAttribute("data-cursor") || el?.getAttribute("aria-label");
      if (el) {
        setCursor({ label: raw && raw.length < 24 ? raw.toUpperCase() : null });
      } else {
        setCursor({ label: null });
      }
    };
    const down = () => {
      setPressing(true);
      rx.current = x as never;
    };
    const up = () => setPressing(false);
    const leave = () => {
      setVisible(false);
      setCursor({ label: null });
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [setCursor, x, y]);

  if (!IS_FINE_POINTER) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        animate={{
          width: label ? 74 : 22,
          height: label ? 74 : 22,
          scale: pressing ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
      >
        <div className="h-full w-full rounded-full border border-white/60 [box-shadow:0_0_12px_rgba(255,255,255,0.25)]" />
        {label && (
          <span className="letter-spacing-game absolute text-[10px] font-semibold text-white [text-shadow:0_0_8px_rgba(0,0,0,0.9)]">
            {label}
          </span>
        )}
        {sub && (
          <span className="absolute top-full mt-1.5 whitespace-nowrap text-[9px] tracking-[0.2em] text-white/70 [text-shadow:0_0_8px_rgba(0,0,0,0.9)]">
            {sub.toUpperCase()}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}