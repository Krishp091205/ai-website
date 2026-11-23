"use client";

import dynamic from "next/dynamic";

const GameRoot = dynamic(() => import("@/components/game/GameRoot"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center bg-[#080807]">
      <div className="text-center">
        <div className="font-display text-lg tracking-[0.36em] text-white/85">
          GYMVERSE
        </div>
        <div className="mt-3 text-[10px] tracking-[0.3em] text-accent">
          PREPARING THE ARENA…
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <GameRoot />;
}
