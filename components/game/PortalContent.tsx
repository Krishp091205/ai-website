"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ABOUT_COPY,
  CONTACT_INFO,
  FACILITY_ZONES,
  MEMBERSHIP,
  PROGRAMS,
  TRAINERS,
  type Trainer,
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
      if (e.key !== "Escape") return;
      const st = useGame.getState();
      if (!st.portalOpen) return;
      if (document.querySelector('[role="dialog"]')) return;
      close();
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

function Feed({
  src,
  alt,
  label,
  aspect = "aspect-[16/9]",
  className = "",
}: {
  src: string;
  alt: string;
  label?: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-sm border border-line/70 ${aspect} ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover saturate-[0.8] contrast-[1.06] transition-all duration-700 group-hover:saturate-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
        }}
      />
      {label && (
        <span className="absolute left-3 top-3 rounded-sm border border-white/10 bg-black/60 px-2 py-1 text-[9px] tracking-[0.26em] text-white/80 backdrop-blur-sm">
          {label}
        </span>
      )}
      <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-accent/70" />
      <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-accent/70" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-accent/70" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-accent/70" />
    </div>
  );
}

function renderSection(id: string) {
  switch (id) {
    case "about":
      return (
        <>
          <Stagger>
            <Feed
              src={ABOUT_COPY.image}
              alt="GYMVERSE training arena"
              label="THE ARENA · LIVE FEED"
              aspect="aspect-[16/7]"
              className="mb-10"
            />
          </Stagger>
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
        </>
      );

    case "programs":
      return <ProgramsBody />;

    case "trainers":
      return <TrainersBody />;

    case "facility":
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITY_ZONES.map((z, i) => (
            <Stagger key={z.name} delay={i * 0.1}>
              <div className="hud-panel h-full rounded-sm p-3 transition-colors hover:border-accent/40">
                <Feed
                  src={z.image}
                  alt={`${z.name} zone`}
                  label={`ZONE 0${i + 1}`}
                  aspect="aspect-[16/9]"
                />
                <div className="p-4">
                  <h3 className="font-display text-lg tracking-[0.16em] text-white">
                    {z.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{z.description}</p>
                </div>
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
                className={`hud-panel relative flex h-full flex-col rounded-sm p-3 transition-colors hover:border-accent/40 ${
                  tier.featured ? "border-accent/50" : ""
                }`}
              >
                <Feed
                  src={tier.image}
                  alt={`${tier.name} membership tier`}
                  label={tier.name}
                  aspect="aspect-[21/10]"
                />
                <div className="flex h-full flex-col p-4">
                {tier.featured && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 rounded-sm bg-accent px-4 py-1 text-[9px] font-bold tracking-[0.28em] text-black">
                    MOST CHOSEN
                  </div>
                )}
                <h3 className="mt-3 font-display text-3xl tracking-[0.2em] text-white">
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
            className={`hud-panel flex h-full flex-col rounded-sm p-3 transition-colors hover:border-accent/40 ${
              accepted.includes(p.id) ? "border-emerald-400/50" : ""
            }`}
          >
            <Feed
              src={p.image}
              alt={`${p.title} training mission`}
              label="LIVE FEED"
              aspect="aspect-[16/9]"
            />
            <div className="flex h-full flex-col p-3">
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
          </div>
        </Stagger>
      ))}
    </div>
  );
}

function TrainersBody() {
  const [selected, setSelected] = useState<Trainer | null>(null);
  const [booked, setBooked] = useState<string | null>(null);

  const open = (t: Trainer) => {
    sound.click();
    setSelected(t);
    setBooked(null);
  };

  return (
    <>
      {selected ? (
        <TrainerDetail
          trainer={selected}
          booked={booked === selected.id}
          onBack={() => setSelected(null)}
          onBook={() => {
            sound.whoosh();
            setBooked(selected.id);
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {TRAINERS.map((t, i) => (
            <Stagger key={t.id} delay={i * 0.12}>
              <div className="hud-panel group flex h-full flex-col rounded-sm p-3 transition-colors hover:border-accent/40">
                <Feed
                  src={t.image}
                  alt={`${t.name} — ${t.title}`}
                  label={`LVL ${t.level}`}
                  aspect="aspect-[4/5]"
                />
                <div className="flex h-full flex-col p-3">
                <h3 className="font-display text-xl tracking-[0.14em] text-white">
                  {t.name}
                </h3>
                <div className="mt-1 text-[10px] tracking-[0.22em] text-warm">
                  {t.title}
                </div>
                <p className="mt-3 line-clamp-4 flex-1 text-sm leading-6 text-white/70">
                  {t.bio}
                </p>
                <div className="mt-4 text-[10px] tracking-[0.18em] text-muted">
                  {t.specialization}
                </div>
                <button
                  data-cursor="VIEW"
                  onClick={() => open(t)}
                  className="mt-5 rounded-sm border border-line py-2.5 text-[10px] tracking-[0.28em] text-white/70 transition-all hover:border-accent hover:text-white"
                >
                  VIEW FILE
                </button>
                </div>
              </div>
            </Stagger>
          ))}
        </div>
      )}
    </>
  );
}

function TrainerDetail({
  trainer,
  booked,
  onBack,
  onBook,
}: {
  trainer: Trainer;
  booked: boolean;
  onBack: () => void;
  onBook: () => void;
}) {
  const t = trainer;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="hud-panel mx-auto max-w-3xl rounded-sm p-6 sm:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <Feed
            src={t.image}
            alt={`${t.name} — ${t.title}`}
            aspect="aspect-square"
            className="h-24 w-24 shrink-0"
          />
          <div>
            <h3 className="font-display text-3xl tracking-[0.14em] text-white">
              {t.name}
            </h3>
            <div className="mt-1 text-[10px] tracking-[0.22em] text-warm">
              {t.title}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl text-accent text-glow">
            {t.level}
          </div>
          <div className="text-[9px] tracking-[0.3em] text-muted">LVL</div>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-6 text-sm leading-7 text-white/75">
        {t.bio}
      </div>

      <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {t.skills.map((s, i) => (
          <div key={s.label}>
            <div className="flex justify-between text-[10px] tracking-[0.24em] text-white/75">
              <span>{s.label}</span>
              <span className="text-white">{s.value}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-accent"
                style={{ boxShadow: "0 0 10px rgba(74,158,255,0.6)" }}
                initial={{ width: "0%" }}
                animate={{ width: `${s.value}%` }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.9, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-[10px] tracking-[0.24em] text-muted">
          FOCUS · {t.specialization}
        </span>
        <div className="ml-auto flex gap-3">
          <button
            data-cursor="RETURN"
            onClick={onBack}
            className="rounded-sm border border-line px-6 py-3 text-[11px] tracking-[0.28em] text-white/70 transition-all hover:border-white/40 hover:text-white"
          >
            ← BACK
          </button>
          {booked ? (
            <div className="rounded-sm border border-emerald-400/60 px-6 py-3 text-[11px] tracking-[0.28em] text-emerald-300">
              SESSION BOOKED ✓
            </div>
          ) : (
            <button
              data-cursor="SELECT"
              onClick={onBook}
              className="rounded-sm bg-accent px-6 py-3 text-[11px] font-semibold tracking-[0.28em] text-black transition-colors hover:bg-white"
            >
              BOOK SESSION
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ContactBody() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sound.whoosh();
    if (busy) return;
    const form = formRef.current;
    if (!form) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name ?? "");
    const contact = String(data.contact ?? "");
    const email = String(data.email ?? "");
    const message = String(data.message ?? "");

    const endpoint =
      typeof process !== "undefined" && process.env.NEXT_PUBLIC_FORM_ENDPOINT;

    if (endpoint) {
      setBusy(true);
      setError(null);
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, contact, email, message, source: "gymverse" }),
        });
        setSent(true);
      } catch {
        setError("TRANSMISSION FAILED — TRY EMAIL INSTEAD");
      } finally {
        setBusy(false);
      }
      return;
    }

    const subject = encodeURIComponent(
      `GYMVERSE inquiry — ${name || "New member"}`
    );
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${contact}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
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
              Your transmission is on its way. A coach replies within 24 hours — the grind waits for no one.
            </p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submit} className="hud-panel space-y-4 rounded-sm p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="NAME" name="name" type="text" placeholder="KHALID" />
              <Field
                label="CONTACT"
                name="contact"
                type="tel"
                placeholder="+91 00000 00000"
              />
            </div>
            <Field label="EMAIL" name="email" type="email" placeholder="you@grind.fit" />
            <div>
              <label className="block text-[10px] tracking-[0.26em] text-muted">
                MESSAGE
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="I want to know more about the TITAN membership…"
                className="mt-2 w-full rounded-sm border border-line bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-accent focus:outline-none"
              />
            </div>
            {error && (
              <div className="text-[10px] tracking-[0.26em] text-red-400">
                {error}
              </div>
            )}
            <button
              data-cursor="SELECT"
              type="submit"
              disabled={busy}
              className="w-full rounded-sm bg-accent py-4 font-display text-xs tracking-[0.3em] text-black transition-colors hover:bg-white disabled:opacity-50"
            >
              {busy ? "TRANSMITTING…" : "TRANSMIT INQUIRY"}
            </button>
          </form>
        )}
      </Stagger>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.26em] text-muted">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="mt-2 w-full rounded-sm border border-line bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-accent focus:outline-none"
      />
    </div>
  );
}