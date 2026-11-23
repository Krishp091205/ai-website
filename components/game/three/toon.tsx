"use client";

import * as THREE from "three";
import { Outlines } from "@react-three/drei";

/** Four hard light bands — the core of the cel-shaded look. One shared texture. */
let gradient: THREE.DataTexture | null = null;
export function toonGradient() {
  if (!gradient) {
    const steps = new Uint8Array([52, 128, 206, 255]);
    gradient = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
}

/** Cartoon ink. Used for every silhouette outline and UI border. */
export const INK = "#0b0908";

/** Flat, saturated pop palette. Information colours stay untouched in data.ts. */
export const TOON = {
  cream: "#fff4d6",
  gold: "#ffc93c",
  orange: "#ff7a45",
  coral: "#ff5d5d",
  teal: "#4ecdc4",
  lilac: "#a78bfa",
  lime: "#9fe870",
  steel: "#d8d2c4",
  char: "#3b342b",
  dark: "#191510",
} as const;

/** Map the existing gold accents to pop colours without changing game data. */
export function popFor(hex: string): string {
  const map: Record<string, string> = {
    "#f5d77a": TOON.orange,
    "#d4af37": TOON.coral,
    "#e8c766": TOON.gold,
    "#cfae4e": TOON.teal,
    "#fff1d6": TOON.lilac,
    "#b8860b": TOON.lime,
  };
  return map[hex] ?? TOON.gold;
}

/** Per-zone pop colour, keyed by zone id so navigation stays unambiguous. */
export const ZONE_TOON: Record<string, string> = {
  entry: TOON.gold,
  cardio: TOON.orange,
  strength: TOON.coral,
  weights: TOON.gold,
  functional: TOON.teal,
  recovery: TOON.lilac,
  exit: TOON.lime,
};

/** Shared toon material props. Spread into <meshToonMaterial {...toon(TOON.gold)} />. */
export function toon(color: string) {
  return { color, gradientMap: toonGradient() };
}

/** Bold black contour. Thickness is in world units. */
export function InkOutlines({ thickness = 0.018 }: { thickness?: number }) {
  return <Outlines thickness={thickness} color={INK} />;
}
