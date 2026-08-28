"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ABOUT_COPY,
  CONTACT_INFO,
  FACILITY_ZONES,
  MEMBERSHIP,
  PROGRAMS,
  TRAINERS,
} from "./data";
import { useGame } from "./store";
import { sound } from "./sound";

const META: Record<
  string,
  { index: string; title: string; subtitle: string; accent: string }
> = {
  about: { index: "01", title: "ABOUT", subtitle: "The story of the arena", accent: "#4a9eff" },
  programs: { index: "02", title: "PROGRAMS", subtitle: "Choose your mission", accent: "#4a9eff" },
  trainers: { index: "03", title: "TRAINERS", subtitle: "Coaching center roster", accent: "#4a9eff" },
  facility: { index: "04", title: "FACILITY", subtitle: "Every zone, mapped", accent: "#4a9eff" },
  membership: { index: "05", title: "MEMBERSHIP", subtitle: "VIP access tiers", accent: "#f59e0b" },
  contact: { index: "06", title: "CONTACT", subtitle: "Front desk terminal", accent: "#4a9eff" },
};

export default function PortalContent() {
  const portalOpen = useGame((s) => s.portalOpen);
  const closePortal = useGame((s) => s.closePortal);
  const setObjective = useGame((s) => s.setObjective);

  const close = () => {
    sound.click();
    closePortal();
    setObjective("EXPLORE THE TRAINING FLOOR");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <AnimatePresence>
      {portalOpen && (
        <motion.div
          key={portalOpen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[52] overflow-y-auto"
          style={{
            background:
              "radial-gradient(90% 85% at 50% 42%, rgba(5,5,8,0.82) 0%, rgba(5,5,8,0.55) 55%, rgba(5,5,8,0.3) 100%)",
          }}
        >
          <div className="pointer-events-none fixed inset-x-0 top-0 h-[9vh] bg-black/85" />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[9vh] bg-black/85" />

          <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 text-[11px] tracking-[0.34em] text-muted">
                <span style={{ color: META[portalOpen].accent }}>
                  ZONE {META[portalOpen].index}
                </span>
                <span className="thin-line w-16" />
                <span>{META[portalOpen].subtitle}</span>
              </div>
              <h1 className="mt-3 font-display text-5xl font-semibold tracking-[0.14em] text-white sm:text-7xl">
                {META[portalOpen].title}
              </h1>
            </motion.div>

            <div className="mt-10">{renderSection(portalOpen)}</div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pointer-events-auto mt-12 flex items-center justify-center gap-4"
            >
              <button
                data-cursor="RETURN"
                onClick={close}
                className="rounded-sm border border-line px-8 py-4 font-display text-xs tracking-[0.3em] text-white/80 transition-all hover:border-accent hover:text-white"
              >
                ← RETURN TO GYM
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stagger({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function renderSection(id: string) {
  switch (id) {
    case "about":
      return (
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Stagger>
            <p
              className="font-display text-xl tracking-[0.12em] text-accent text-glow sm:text-2xl"
            >
              {ABOUT_COPY.tagline}
            </p>
            <div className="mt-6 space-y-5 text-[15px] leading-8 text-white/75">
              {ABOUT_COPY.body.map((b, i) => (
                <p key={i}>{b}</p>
              ))}
            </div>
          </Stagger>
          <Stagger delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {ABOUT_COPY.stats.map((s) => (
                <div key={s.label} className="hud-panel rounded-sm p-5 text-center">
                  <div className="font-display text-2xl text-white sm:text-3xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[9px] tracking-[0.26em] text-muted">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 hud-panel rounded-sm p-5 text-[11px] leading-6 tracking-[0.16em] text-white/60">
              OPEN 365 DAYS · TRAIN WITH INTENT
            </div>
          </Stagger>
        </div>
      );

    case "programs":
      return <ProgramsBody />;

    case "trainers":
      return (
        <div className="grid gap-4 md:grid-cols-3">
          {TRAINERS.map((t, i) => (
            <Stagger key={t.id} delay={i * 0.12}>
              <div className="hud-panel group flex h-full flex-col rounded-sm p-6 transition-colors hover:border-accent/40">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br from-accent/30 to-transparent font-display text-lg text-white">
                    {t.name[0]}
                  </span>
                  <span className="text-[10px] tracking-[0.24em] text-accent">
                    Lv.{t.level}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl tracking-[0.14em] text-white">
                  {t.name}
                </h3>
                <div className="mt-1 text-[10px] tracking-[0.22em] text-warm">
                  {t.title}
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-white/70">
                  {t.bio}
                </p>
                <div className="mt-4 text-[10px] tracking-[0.18em] text-muted">
                  {t.specialization}
                </div>
                <button
                  data-cursor="SELECT"
                  className="mt-5 rounded-sm border border-line py-2.5 text-[10px] tracking-[0.28em] text-white/70 transition-all hover:border-accent hover:text-white"
                >
                  BOOK SESSION
                </button>
              </div>
            </Stagger>
          ))}
        </div>
      );

    case "facility":
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITY_ZONES.map((z, i) => (
            <Stagger key={z.name} delay={i * 0.1}>
              <div className="hud-panel h-full rounded-sm p-5 transition-colors hover:border-accent/40">
                <div className="text-[9px] tracking-[0.3em] text-accent">
                  0{i + 1}
                </div>
                <h3 className="mt-2 font-display text-lg tracking-[0.16em] text-white">
                  {z.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{z.description}</p>
              </div>
            </Stagger>
          ))}
        </div>
      );

    case "membership":
      return (
        <div className="grid gap-4 lg:grid-cols-3">
          {MEMBERSHIP.map((tier, i) => (
            <Stagger key={tier.id} delay={i * 0.12}>
              <div
                className={`hud-panel relative flex h-full flex-col rounded-sm p-7 transition-colors hover:border-accent/40 ${
                  tier.featured ? "border-accent/50" : ""
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-sm bg-accent px-4 py-1 text-[9px] font-bold tracking-[0.28em] text-black">
                    MOST CHOSEN
                  </div>
                )}
                <h3 className="font-display text-3xl tracking-[0.2em] text-white">
                  {tier.name}
                </h3>
                <p className="mt-1 text-[10px] tracking-[0.22em] text-muted">
                  {tier.subtitle}
                </p>
                <div className="mt-5 font-display text-4xl text-warm text-glow-warm">
                  ₹{tier.price}
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-white/75">
                      <span className="text-accent">▸</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  data-cursor="SELECT"
                  className="mt-7 rounded-sm border border-line py-3 text-[11px] tracking-[0.3em] text-white/80 transition-all hover:border-warm hover:text-warm"
                >
                  ENROLL — {tier.name}
                </button>
              </div>
            </Stagger>
          ))}
        </div>
      );

    case "contact":
      return <ContactBody />;

    default:
      return null;
  }
}

function ProgramsBody() {
  const [accepted, setAccepted] = useState<string[]>([]);
  const toggle = (id: string) => {
    sound.whoosh();
    setAccepted((a) =>
      a.includes(id) ? a.filter((x) => x !== id) : [...a, id]
    );
  };
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PROGRAMS.map((p, i) => (
        <Stagger key={p.id} delay={i * 0.08}>
          <div
            className={`hud-panel flex h-full flex-col rounded-sm p-6 transition-colors hover:border-accent/40 ${
              accepted.includes(p.id) ? "border-emerald-400/50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] tracking-[0.3em] text-accent">
                {p.title.split("—")[0].trim()}
              </span>
              {accepted.includes(p.id) && (
                <span className="text-[10px] tracking-[0.2em] text-emerald-400">
                  ✓ ACTIVE
                </span>
              )}
            </div>
            <h3 className="mt-1 font-display text-2xl tracking-[0.1em] text-white">
              {p.title.split("—")[1].trim()}
            </h3>
            <div className="mt-1 text-[10px] tracking-[0.2em] text-muted">
              OBJECTIVE: {p.objective}
            </div>

            <div className="mt-5 space-y-2 text-[10px] tracking-[0.22em]">
              <div className="flex items-center justify-between text-white/60">
                <span>DIFFICULTY</span>
                <span className="text-white/80">{p.difficulty}/10</span>
              </div>
              <div className="flex gap-px">
                {Array.from({ length: 10 }, (_, d) => (
                  <div
                    key={d}
                    className={`h-1 flex-1 ${
                      d < p.difficulty ? "bg-accent/80" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-warm">+{p.xp} XP</span>
                <span>{p.duration}</span>
              </div>
            </div>

            <p className="mt-4 flex-1 text-sm leading-6 text-white/70">
              {p.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.focus.map((f) => (
                <span
                  key={f}
                  className="border border-line px-2.5 py-1 text-[9px] tracking-[0.2em] text-muted"
                >
                  {f}
                </span>
              ))}
            </div>
            <button
              data-cursor="ACCEPT"
              onClick={() => toggle(p.id)}
              className={`mt-5 rounded-sm border py-3 text-[11px] tracking-[0.3em] transition-all ${
                accepted.includes(p.id)
                  ? "border-emerald-400/60 text-emerald-300"
                  : "border-line text-white/80 hover:border-accent hover:text-white"
              }`}
            >
              {accepted.includes(p.id) ? "MISSION ACTIVE ✓" : "[ ACCEPT MISSION ]"}
            </button>
          </div>
        </Stagger>
      ))}
    </div>
  );
}

function ContactBody() {
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.whoosh();
    setSent(true);
  };
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Stagger>
        <div className="space-y-4 text-sm leading-7 text-white/75">
          {[
            ["ADDRESS", CONTACT_INFO.address],
            ["PHONE", CONTACT_INFO.phone],
            ["EMAIL", CONTACT_INFO.email],
            ["HOURS", CONTACT_INFO.hours],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <span className="w-20 shrink-0 text-[10px] tracking-[0.26em] text-accent">
                {k}
              </span>
              <span className="text-white/80">{v}</span>
            </div>
          ))}
          <div className="pt-2 flex gap-3">
            {CONTACT_INFO.social.map((s) => (
              <span
                key={s}
                className="border border-line px-3 py-1.5 text-[9px] tracking-[0.24em] text-white/60"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Stagger>
      <Stagger delay={0.12}>
        {sent ? (
          <div className="hud-panel rounded-sm p-8 text-center">
            <div className="font-display text-2xl tracking-[0.2em] text-emerald-400">
              TRANSMISSION RECEIVED
            </div>
            <p className="mt-3 text-sm text-white/70">
              A coach will reach out within 24 hours. The grind waits for no one.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="hud-panel space-y-4 rounded-sm p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="NAME" type="text" placeholder="KHALID" />
              <Field label="CONTACT" type="tel" placeholder="+91 00000 00000" />
            </div>
            <Field label="EMAIL" type="email" placeholder="you@grind.fit" />
            <div>
              <label className="block text-[10px] tracking-[0.26em] text-muted">
                MESSAGE
              </label>
              <textarea
                rows={4}
                placeholder="I want to know more about the TITAN membership…"
                className="mt-2 w-full rounded-sm border border-line bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-accent focus:outline-none"
              />
            </div>
            <button
              data-cursor="SELECT"
              type="submit"
              className="w-full rounded-sm bg-accent py-4 font-display text-xs tracking-[0.3em] text-black transition-colors hover:bg-white"
            >
              TRANSMIT INQUIRY
            </button>
          </form>
        )}
      </Stagger>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
}: {
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.26em] text-muted">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="mt-2 w-full rounded-sm border border-line bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-accent focus:outline-none"
      />
    </div>
  );
}