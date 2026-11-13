"use client";

import { motion } from "framer-motion";
import { BadgeCheck, CalendarClock, Languages, Repeat2, Sparkles } from "lucide-react";
import type { MatchResult } from "@/lib/matching";
import type { Therapist } from "@/lib/types";
import { cn } from "./ui";

export function dayLabel(offset: number) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function nextSlot(t: Therapist) {
  const s = [...t.slots].sort((a, b) => a.day - b.day)[0];
  return `${dayLabel(s.day)}, ${s.times[0]}`;
}

/** Tasteful abstract avatar (no stock photos of real people). */
export function Avatar({ t, size = 56, className }: { t: Therapist; size?: number; className?: string }) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-[30%] shadow-soft", className)}
      style={{ width: size, height: size, background: `radial-gradient(circle at 30% 25%, #ffffff 0%, ${t.hue[1]} 35%, ${t.hue[0]} 100%)` }}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full opacity-70">
        <circle cx="32" cy="25" r="11" fill="rgba(255,255,255,.55)" />
        <path d="M10 64c2-14 11-21 22-21s20 7 22 21z" fill="rgba(255,255,255,.55)" />
      </svg>
      <span className="absolute bottom-1 right-1.5 text-[10px] font-bold tracking-wide text-midnight/70">{t.initials}</span>
    </div>
  );
}

export function TherapistCard({
  m, onOpen, onBook, highlight, rankIndex,
}: { m: MatchResult; onOpen: () => void; onBook: () => void; highlight?: boolean; rankIndex?: number }) {
  const t = m.therapist;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn(
        "group relative flex h-full flex-col rounded-4xl border bg-white/85 p-6 shadow-soft transition-shadow duration-500 hover:shadow-lift",
        highlight ? "border-indigo/40 ring-1 ring-indigo/20" : "border-white/80",
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar t={t} size={60} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {m.continuity && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage/40 px-2 py-0.5 text-[11px] font-semibold text-sage-deep"><Repeat2 className="h-3 w-3" /> Your counsellor</span>
            )}
            {!m.continuity && rankIndex === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-indigo-ink"><Sparkles className="h-3 w-3" /> Best fit</span>
            )}
          </div>
          <h3 className="mt-1 flex items-center gap-1.5 text-lg font-semibold tracking-tight">
            {t.name}
            {t.verified && <BadgeCheck className="h-4 w-4 text-indigo-deep" aria-label="Verified credentials (demo)" />}
          </h3>
          <p className="text-[13px] text-midnight-mute">{t.title} · {t.years} yrs · {t.pronouns}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-midnight">{t.focusLabel}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="chip"><Languages className="h-3.5 w-3.5" />{t.languages.join(", ")}</span>
        <span className="chip"><CalendarClock className="h-3.5 w-3.5" />{nextSlot(t)}</span>
      </div>
      {m.reasons.length > 0 && (
        <div className="mt-4 rounded-2xl bg-ivory/80 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-midnight-mute">Why we suggest {t.name.split(" ")[0]}</p>
          <ul className="mt-1.5 space-y-1">
            {m.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-[13px] leading-snug text-midnight-soft"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo" />{r}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-auto flex gap-2 pt-5">
        <button onClick={onOpen} className="focus-ring h-11 flex-1 rounded-full border border-midnight/10 bg-white text-sm font-semibold text-midnight transition hover:bg-ivory">View profile</button>
        <button onClick={onBook} className="focus-ring h-11 flex-1 rounded-full bg-midnight text-sm font-semibold text-white transition hover:bg-[#2F2E4A]">Book a session</button>
      </div>
    </motion.article>
  );
}
