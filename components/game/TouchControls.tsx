"use client";

import { useEffect, useRef, useState } from "react";
import { useInput } from "./input";
import { IS_MOBILE } from "./store";

export default function TouchControls({ onMap }: { onMap: () => void }) {
  const [active] = useState(IS_MOBILE);
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const touchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lastLook = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!active) return;

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // left half of screen = joystick zone
        if (t.clientX < window.innerWidth * 0.45 && touchId.current === null) {
          touchId.current = t.identifier;
          origin.current = { x: t.clientX, y: t.clientY };
          if (stickRef.current)
            stickRef.current.style.left = `${t.clientX}px`;
          if (stickRef.current)
            stickRef.current.style.top = `${t.clientY}px`;
          if (stickRef.current) stickRef.current.style.opacity = "1";
          if (knobRef.current) {
            knobRef.current.style.transform = "translate(-50%,-50%)";
          }
        } else if (lookTouchId.current === null) {
          lookTouchId.current = t.identifier;
          lastLook.current = { x: t.clientX, y: t.clientY };
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId.current) {
          const dx = t.clientX - origin.current.x;
          const dy = t.clientY - origin.current.y;
          const mag = Math.hypot(dx, dy);
          const max = 52;
          const cl = mag > max ? max / mag : 1;
          const nx = dx * cl;
          const ny = dy * cl;
          if (knobRef.current)
            knobRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
          const norm = (Math.abs(mag) > 6 ? Math.min(max, mag) / max : 0);
          const ax = (dx / max) * norm;
          const ay = (dy / max) * norm;
          useInput.getState().setJoy(ax, -ay, true);
        } else if (t.identifier === lookTouchId.current) {
          const dx = t.clientX - lastLook.current.x;
          const dy = t.clientY - lastLook.current.y;
          lastLook.current = { x: t.clientX, y: t.clientY };
          if (dx || dy) {
            useInput.getState().applyLook(dx, dy);
          }
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId.current) {
          touchId.current = null;
          useInput.getState().setJoy(0, 0, false);
          if (stickRef.current) stickRef.current.style.opacity = "0";
        } else if (t.identifier === lookTouchId.current) {
          lookTouchId.current = null;
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [active]);

  if (!active) return null;

  const interact = () => useInput.getState().press();
  const sprintStart = () => useInput.getState().setKeys({ sprint: true });
  const sprintEnd = () => useInput.getState().setKeys({ sprint: false });
  const jump = () => useInput.getState().setKeys({ jump: true });

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none select-none">
      {/* joystick base */}
      <div
        ref={stickRef}
        className="pointer-events-none absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: 0, left: 0, top: 0 }}
      >
        <div
          ref={knobRef}
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/50 bg-accent/25"
        />
      </div>

      {/* right side action buttons */}
      <div className="pointer-events-auto absolute bottom-8 right-4 flex flex-col items-end gap-3">
        <button
          onPointerDown={sprintStart}
          onPointerUp={sprintEnd}
          onPointerLeave={sprintEnd}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/50 bg-black/40 text-[10px] font-bold tracking-[0.1em] text-white"
        >
          RUN
        </button>
        <button
          onPointerDown={jump}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-black/40 text-[10px] font-bold tracking-[0.1em] text-white/80"
        >
          JUMP
        </button>
        <button
          onPointerDown={interact}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-accent bg-accent/25 text-[11px] font-bold tracking-[0.12em] text-white"
        >
          INTERACT
        </button>
      </div>

      {/* top-right small map */}
      <button
        onClick={onMap}
        className="pointer-events-auto absolute right-3 top-16 flex h-10 w-10 items-center justify-center rounded-sm border border-line bg-black/40 text-[10px] font-bold tracking-[0.1em] text-white/80"
      >
        MAP
      </button>
    </div>
  );
}
