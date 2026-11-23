"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { INK } from "./toon";

/** Chunky cartoon sign: thick ink border, flat fill, hard offset shadow. */
export default function ZoneTag({
  text,
  color = "#ffc93c",
  width = 3.4,
  height = 0.62,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  text: string;
  color?: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 192;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);

    const inset = 16;
    const radius = 28;
    const rounded = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // hard drop shadow, then ink border, then flat face
    ctx.fillStyle = INK;
    rounded(inset + 18, inset + 20, c.width - inset * 2, c.height - inset * 2, radius);
    ctx.fill();
    ctx.fillStyle = color;
    rounded(inset, inset, c.width - inset * 2 - 14, c.height - inset * 2 - 14, radius);
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = INK;
    ctx.stroke();

    ctx.font = "700 116px 'Oswald', 'Arial Narrow', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 12;
    ctx.strokeStyle = INK;
    ctx.strokeText(text, 498, 96);
    ctx.fillStyle = "#fffaf0";
    ctx.fillText(text, 498, 96);

    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }, [text, color]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
