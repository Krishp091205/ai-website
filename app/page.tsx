"use client";

import dynamic from "next/dynamic";

const GameRoot = dynamic(() => import("@/components/game/GameRoot"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center bg-[#070707]">
      <div className="font-display text-sm tracking-[0.4em] text-white/60">
        ENTERING GYMVERSE…
      </div>
    </div>
  ),
});

export default function Home() {
  return <GameRoot />;
}
