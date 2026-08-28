"use client";

import { motion } from "framer-motion";
import { ROOM_BY_ID, WORLD_ZONES } from "./level";
import { useGame, type WorldZoneId } from "./store";
import { sound } from "./sound";

export default function WorldMap({ onClose }: { onClose: () => void }) {
  const currentZone = useGame((s) => s.currentZone);
  const playerPos = useGame((s) => s.playerPos);

  const xMin = -38;
  const xMax = 38;
  const zMin = -32;
  const zMax = 32;
  const mapX = (x: number) => ((x - xMin) / (xMax - xMin)) * 100;
  const mapY = (z: number) => ((z - zMin) / (zMax - zMin)) * 100;

  const travel = (id: WorldZoneId) => {
    sound.whoosh();
    const z = ROOM_BY_ID[id];
    if (id === "entry") {
      useGame.setState({ playerPos: [0, 0, 8], currentZone: "entry" });
    } else {
      const cx = (z.x0 + z.x1) / 2;
      const cz = (z.z0 + z.z1) / 2;
      useGame.setState({ playerPos: [cx, 0, cz], currentZone: id });
    }
    onClose();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Gym map"
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      className="hud-panel w-[94vw] max-w-3xl rounded-sm p-7 sm:p-9"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-[0.2em] text-white">GYM MAP</h2>
          <p className="mt-1 text-[10px] tracking-[0.26em] text-muted">
            TAP A ZONE TO TRAVEL
          </p>
        </div>
        <button
          data-cursor="SELECT"
          className="no-pointer-lock text-muted transition-colors hover:text-white"
          onClick={() => {
            sound.click();
            onClose();
          }}
          aria-label="Close map"
        >
          ESC ✕
        </button>
      </div>

      <div className="relative mt-6 aspect-[70/62] w-full overflow-hidden rounded-sm border border-line bg-[radial-gradient(100%_100%_at_50%_40%,#0d1624_0%,#06070b_100%)]">
        {/* zone cells */}
        {WORLD_ZONES.filter((z) => z.id !== "entry").map((z) => {
          const active = currentZone === z.id;
          const left = mapX(z.x0);
          const top = mapY(z.z0);
          const w = mapX(z.x1) - left;
          const h = mapY(z.z1) - top;
          return (
            <button
              key={z.id}
              data-cursor="TRAVEL"
              onClick={() => travel(z.id)}
              className="group absolute z-10 rounded-sm border transition-all"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${w}%`,
                height: `${h}%`,
                borderColor: active ? z.accent : `${z.accent}55`,
                background: active ? `${z.accent}33` : `${z.accent}0f`,
                boxShadow: active ? `0 0 16px ${z.accent}66` : "none",
              }}
            >
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold tracking-[0.2em]"
                style={{ color: z.accent }}
              >
                {z.name}
              </span>
            </button>
          );
        })}

        {/* entry atrium highlight */}
        <div
          className="pointer-events-none absolute rounded-sm border border-accent/40"
          style={{
            left: `${mapX(-24)}%`,
            top: `${mapY(-16)}%`,
            width: `${mapX(24) - mapX(-24)}%`,
            height: `${mapY(16) - mapY(-16)}%`,
          }}
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] tracking-[0.22em] text-accent">
            ENTRY
          </span>
        </div>

        {/* player marker */}
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: `${mapX(playerPos[0])}%`,
            top: `${mapY(playerPos[2])}%`,
            transform: "translate(-50%,-50%)",
          }}
        >
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/50" />
            <span className="relative h-3.5 w-3.5 rounded-full border-2 border-accent bg-accent/40" />
          </span>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.26em] text-white/25">
          42 IRON ST · GYMVERSE COMPLEX
        </div>
      </div>
    </motion.div>
  );
}
