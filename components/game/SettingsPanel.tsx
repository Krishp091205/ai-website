"use client";

import { motion } from "framer-motion";
import { IS_MOBILE } from "./store";
import { useGame, type Quality } from "./store";
import { sound } from "./sound";

const QUALITIES: { id: Quality; label: string }[] = [
  { id: "low", label: "LOW" },
  { id: "medium", label: "MEDIUM" },
  { id: "high", label: "HIGH" },
  { id: "ultra", label: "ULTRA" },
];

export default function SettingsPanel({
  onClose,
  onMap,
  onProfile,
}: {
  onClose: () => void;
  onMap?: () => void;
  onProfile?: () => void;
}) {
  const settings = useGame((s) => s.settings);
  const setSettings = useGame((s) => s.setSettings);
  const setViewMode = useGame((s) => s.setViewMode);

  const toggleSound = () => {
    const next = !settings.sound;
    sound.setEnabled(next);
    setSettings({ sound: next, sfx: next });
    if (next) sound.click();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      className="hud-panel max-h-[88vh] w-[94vw] max-w-lg overflow-y-auto rounded-sm p-7"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-[0.2em] text-white">MENU</h2>
        <button
          data-cursor="SELECT"
          className="no-pointer-lock text-muted transition-colors hover:text-white"
          onClick={() => {
            sound.click();
            onClose();
          }}
          aria-label="Close menu"
        >
          ESC ✕
        </button>
      </div>

      {!IS_MOBILE && (
        <div className="mt-5 grid grid-cols-3 gap-2 border-b border-line pb-6">
          <button
            data-cursor="SELECT"
            onClick={() => {
              sound.click();
              onClose();
              onMap?.();
            }}
            className="border border-line px-3 py-3 text-[11px] tracking-[0.22em] text-white/75 transition-colors hover:border-accent/50 hover:text-white"
          >
            GYM MAP
          </button>
          <button
            data-cursor="SELECT"
            onClick={() => {
              sound.click();
              onClose();
              onProfile?.();
            }}
            className="border border-line px-3 py-3 text-[11px] tracking-[0.22em] text-white/75 transition-colors hover:border-accent/50 hover:text-white"
          >
            PROFILE
          </button>
          <button
            data-cursor="SELECT"
            onClick={() => {
              sound.click();
              if (document.exitPointerLock) document.exitPointerLock();
              onClose();
            }}
            className="border border-line px-3 py-3 text-[11px] tracking-[0.22em] text-white/75 transition-colors hover:border-accent/50 hover:text-white"
          >
            RESUME
          </button>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* view mode */}
        <div>
          <div className="flex items-center justify-between text-[11px] tracking-[0.24em] text-white/70">
            <span>CAMERA</span>
            <span className="text-accent">{settings.viewMode === "first" ? "FIRST PERSON" : "THIRD PERSON"}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["first", "third"] as const).map((v) => (
              <button
                key={v}
                data-cursor="SELECT"
                onClick={() => {
                  sound.click();
                  setViewMode(v);
                }}
                className={`border px-3 py-2 text-[11px] tracking-[0.22em] transition-colors ${
                  settings.viewMode === v
                    ? "border-accent/60 bg-accent/15 text-white"
                    : "border-line text-white/60 hover:border-accent/40"
                }`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* quality */}
        <div>
          <div className="text-[11px] tracking-[0.24em] text-white/70">GRAPHICS QUALITY</div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {QUALITIES.map((q) => (
              <button
                key={q.id}
                data-cursor="SELECT"
                onClick={() => {
                  sound.click();
                  setSettings({ quality: q.id });
                }}
                className={`border px-1 py-2 text-[10px] tracking-[0.14em] transition-colors ${
                  settings.quality === q.id
                    ? "border-accent/60 bg-accent/15 text-white"
                    : "border-line text-white/55 hover:border-accent/40"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <Toggle label="SOUND" on={settings.sound} onClick={toggleSound} />
        <Toggle
          label="SFX"
          on={settings.sfx}
          onClick={() => setSettings({ sfx: !settings.sfx })}
        />
        <Toggle
          label="CINEMATIC EFFECTS"
          on={settings.cinematics}
          onClick={() => setSettings({ cinematics: !settings.cinematics })}
        />
        <Toggle
          label="COLORBLIND MODE"
          on={settings.colorblind}
          onClick={() => setSettings({ colorblind: !settings.colorblind })}
        />

        <Slider
          label="MOUSE SENSITIVITY"
          min={0.3}
          max={2.5}
          step={0.1}
          value={settings.mouseSensitivity}
          display={`${Math.round(settings.mouseSensitivity * 40)}%`}
          onChange={(v) => setSettings({ mouseSensitivity: v })}
        />
        <Slider
          label="FIELD OF VIEW"
          min={55}
          max={90}
          step={1}
          value={settings.fov}
          display={`${settings.fov}°`}
          onChange={(v) => setSettings({ fov: v })}
        />
        <Slider
          label="HUD BRIGHTNESS"
          min={0.4}
          max={1.6}
          step={0.1}
          value={settings.hudBrightness}
          display={`${Math.round(settings.hudBrightness * 100)}%`}
          onChange={(v) => setSettings({ hudBrightness: v })}
        />

        <p className="pt-1 text-[10px] tracking-[0.24em] text-muted">
          {IS_MOBILE ? "TOUCH: JOYSTICK + SWIPE CAMERA" : "WASD MOVE · MOUSE LOOK · SHIFT SPRINT · SPACE JUMP · E INTERACT · M MAP"}
        </p>
      </div>
    </motion.div>
  );
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-cursor="SELECT"
      onClick={onClick}
      aria-pressed={on}
      className="flex w-full items-center justify-between text-[11px] tracking-[0.24em] text-white/80"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-10 rounded-full border transition-colors ${
          on ? "border-accent/60 bg-accent/20" : "border-line bg-charcoal"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
            on ? "left-5.5 bg-accent" : "left-0.5 bg-white/30"
          }`}
        />
      </span>
    </button>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] tracking-[0.24em] text-white/70">
        <span>{label}</span>
        <span className="text-accent">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="range mt-3 w-full accent-[#4a9eff]"
      />
    </div>
  );
}
