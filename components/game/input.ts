import { create } from "zustand";

/** Low-latency imperative input shared between keyboard, mouse, and touch. */
interface InputState {
  fwd: number; // -1..1 (W=+, S=-)
  strafe: number; // -1..1 (D=+, A=-)
  sprint: boolean;
  jump: boolean;
  interact: boolean;
  mapHeld: boolean;
  lookX: number; // accumulated yaw from mouse/touch drag (radians)
  lookY: number; // accumulated pitch (radians)
  // touch joystick vector in world-relative screen space (-1..1)
  joy: { x: number; y: number };
  joyActive: boolean;
  setKeys: (
    k: Partial<Pick<InputState, "fwd" | "strafe" | "sprint" | "jump">>
  ) => void;
  press: () => void;
  pressMap: (v: boolean) => void;
  applyLook: (x: number, y: number) => void;
  setJoy: (x: number, y: number, active: boolean) => void;
  resetAll: () => void;
}

export const useInput = create<InputState>((set) => ({
  fwd: 0,
  strafe: 0,
  sprint: false,
  jump: false,
  interact: false,
  mapHeld: false,
  lookX: 0,
  lookY: 0,
  joy: { x: 0, y: 0 },
  joyActive: false,
  setKeys: (k) => set(k),
  press: () => set({ interact: true }),
  pressMap: (v) => set({ mapHeld: v }),
  applyLook: (x, y) => set((s) => ({ lookX: s.lookX + x, lookY: s.lookY + y })),
  setJoy: (x, y, active) => set((s) => ({ joy: { x, y }, joyActive: s.joyActive || active })),
  resetAll: () => set({ interact: false, jump: false, mapHeld: false }),
}));
