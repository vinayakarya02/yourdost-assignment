"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, CalendarCheck2, Check, MessageCircle, Mic, Repeat2, ShieldCheck, Video, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WEIGHTS, type MatchResult } from "@/lib/matching";
import type { SessionFormat } from "@/lib/types";
import { Avatar, dayLabel } from "./people";
import { useApp } from "./providers";
import { Button, DemoBadge, cn } from "./ui";

const formatIcon: Record<SessionFormat, React.ReactNode> = {
  video: <Video className="h-4 w-4" />, audio: <Mic className="h-4 w-4" />, chat: <MessageCircle className="h-4 w-4" />,
};
const partLabels: Record<keyof typeof WEIGHTS, string> = {
  specialisation: "Specialisation fit", preference: "Feedback & continuity", language: "Language",
  availability: "Availability", format: "Session format", experience: "Experience",
};

export function TherapistDrawer({ m, initialStep, onClose }: { m: MatchResult | null; initialStep: "profile" | "book"; onClose: () => void }) {
  const { addBooking, toast, continueWith, setContinueWith } = useApp();
  const [step, setStep] = useState<"profile" | "book" | "done">(initialStep);
  const [slot, setSlot] = useState<{ day: number; time: string } | null>(null);
  const [format, setFormat] = useState<SessionFormat | null>(null);
  const [err, setErr] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const t = m?.therapist;

  useEffect(() => {
    if (!m) return;
    setStep(initialStep); setSlot(null); setFormat(m.therapist.formats[0]); setErr("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => panel.current?.focus(), 50);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [m, initialStep, onClose]);

  useEffect(() => { panel.current?.scrollTo({ top: 0 }); }, [step]);

  const confirm = () => {
    if (!slot || !format || !t) { setErr("Please choose a time and a session format."); return; }
    addBooking({ therapistId: t.id, dayOffset: slot.day, time: slot.time, format });
    setStep("done");
    toast("Demo session booked");
  };

  return (
    <AnimatePresence>
      {m && t && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-midnight/35 backdrop-blur-[3px]" onClick={onClose} aria-hidden />
          <motion.aside
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={`${t.name} profile`}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto bg-ivory shadow-2xl outline-none sm:rounded-l-5xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-ivory/90 px-5 py-4 backdrop-blur sm:px-8">
              {step === "book" ? (
                <button onClick={() => setStep("profile")} className="focus-ring inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-midnight-mute hover:text-midnight"><ArrowLeft className="h-4 w-4" /> Profile</button>
              ) : <DemoBadge label="Fictional demo profile" />}
              <button onClick={onClose} className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white text-midnight shadow-soft hover:bg-mist" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>

            <div className="px-5 pb-10 sm:px-8">
              <div className="flex items-center gap-5">
                <Avatar t={t} size={88} />
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">{t.name}{t.verified && <BadgeCheck className="h-5 w-5 text-indigo-deep" />}</h2>
                  <p className="text-sm text-midnight-mute">{t.title} · {t.pronouns}</p>
                  <p className="mt-1 text-sm font-medium text-midnight">{t.years} years experience</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === "profile" && (
                  <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <p className="mt-6 text-[15px] leading-relaxed text-midnight-soft">{t.bio}</p>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                      <Info k="Focus" v={t.focusLabel} />
                      <Info k="Approaches" v={t.approaches.join(", ")} />
                      <Info k="Languages" v={t.languages.join(", ")} />
                      <Info k="Formats" v={t.formats.map((f) => f[0].toUpperCase() + f.slice(1)).join(", ")} />
                      <Info k="Credentials" v={t.credentials.join("; ")} />
                      <Info k="Covered by employer" v={t.orgCovered ? "Yes (demo org)" : "Not in demo plan"} />
                    </div>

                    <div className="mt-6 rounded-3xl bg-white p-5 shadow-soft">
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm font-semibold">How this match was made</p>
                        <p className="text-sm font-semibold text-indigo-deep">{m.score}<span className="text-midnight-mute">/100</span></p>
                      </div>
                      <p className="mt-1 text-xs text-midnight-mute">Explainable ranking. Weights are early product hypotheses, not clinical judgements.</p>
                      <ul className="mt-4 space-y-2.5">
                        {(Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).map((k) => (
                          <li key={k} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-xs">
                            <span className="text-midnight-soft">{partLabels[k]} <span className="text-midnight-mute">· {Math.round(WEIGHTS[k] * 100)}%</span></span>
                            <span className="tabular-nums text-midnight-mute">{Math.round(m.parts[k] * 100)}%</span>
                            <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-midnight/[0.06]">
                              <motion.span className="block h-full rounded-full bg-gradient-to-r from-indigo to-lilac" initial={{ width: 0 }} animate={{ width: `${m.parts[k] * 100}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
                            </span>
                          </li>
                        ))}
                      </ul>
                      {m.continuity && <p className="mt-3 text-xs font-medium text-sage-deep">+15 continuity boost: you chose to keep seeing {t.name.split(" ")[0]}.</p>}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4 rounded-3xl border border-midnight/5 bg-white/60 p-4">
                      <div className="flex items-center gap-3">
                        <Repeat2 className="h-5 w-5 text-sage-deep" />
                        <p className="text-sm text-midnight-soft">Keep {t.name.split(" ")[0]} as your counsellor for future sessions</p>
                      </div>
                      <button
                        role="switch" aria-checked={continueWith === t.id}
                        onClick={() => { const on = continueWith !== t.id; setContinueWith(on ? t.id : null); toast(on ? `${t.name.split(" ")[0]} will stay first in your matches` : "Continuity preference removed", on ? "success" : "info"); }}
                        className={cn("focus-ring relative h-7 w-12 shrink-0 rounded-full transition-colors", continueWith === t.id ? "bg-sage-deep" : "bg-midnight/15")}
                        aria-label="Continue with this counsellor"
                      >
                        <motion.span layout className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow", continueWith === t.id ? "right-1" : "left-1")} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                      </button>
                    </div>

                    <Button size="lg" className="mt-6 w-full" onClick={() => setStep("book")}>See available times</Button>
                  </motion.div>
                )}

                {step === "book" && (
                  <motion.div key="b" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h3 className="mt-8 text-lg font-semibold">Choose a time</h3>
                    <p className="text-sm text-midnight-mute">50-minute session · times shown in IST · demo slots</p>
                    <div className="mt-4 space-y-4">
                      {t.slots.map((s) => (
                        <div key={s.day}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-midnight-mute">{dayLabel(s.day)}</p>
                          <div className="flex flex-wrap gap-2">
                            {s.times.map((time) => {
                              const sel = slot?.day === s.day && slot.time === time;
                              return (
                                <motion.button
                                  key={time} whileTap={{ scale: 0.96 }}
                                  onClick={() => { setSlot({ day: s.day, time }); setErr(""); }}
                                  aria-pressed={sel}
                                  className={cn("focus-ring h-11 rounded-2xl border px-4 text-sm font-semibold transition", sel ? "border-indigo-deep bg-indigo-deep text-white shadow-lift" : "border-midnight/10 bg-white text-midnight hover:border-indigo/40")}
                                >
                                  {time}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="mt-8 text-lg font-semibold">How would you like to talk?</h3>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {t.formats.map((f) => (
                        <button key={f} onClick={() => setFormat(f)} aria-pressed={format === f}
                          className={cn("focus-ring flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold capitalize transition", format === f ? "border-indigo-deep bg-mist text-indigo-ink" : "border-midnight/10 bg-white text-midnight-soft hover:border-indigo/40")}>
                          {formatIcon[f]}{f}
                        </button>
                      ))}
                    </div>

                    {err && <p role="alert" className="mt-4 rounded-2xl bg-peach/25 px-4 py-3 text-sm font-medium text-peach-deep">{err}</p>}
                    <div className="mt-6 rounded-2xl bg-mist/60 p-4 text-xs leading-relaxed text-midnight-soft">
                      <ShieldCheck className="mb-1 h-4 w-4 text-indigo-deep" />
                      This is a prototype: no real appointment is made and no payment is taken. In the live product, sessions covered by your organisation would be confirmed here.
                    </div>
                    <Button size="lg" className="mt-6 w-full" onClick={confirm}>
                      Confirm demo booking{slot ? ` · ${dayLabel(slot.day)}, ${slot.time}` : ""}
                    </Button>
                  </motion.div>
                )}

                {step === "done" && slot && (
                  <motion.div key="d" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sage/50 text-sage-deep">
                      <Check className="h-9 w-9" strokeWidth={2.5} />
                    </motion.div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-tight">You&apos;re booked in (demo)</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-midnight-soft">
                      {dayLabel(slot.day)} at {slot.time} with {t.name}, by {format}. You can share as much or as little as you like. It&apos;s okay to feel nervous before a first session.
                    </p>
                    <div className="mx-auto mt-6 max-w-sm rounded-3xl bg-white p-5 text-left shadow-soft">
                      <p className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck2 className="h-4 w-4 text-indigo-deep" /> What happens next</p>
                      <ul className="mt-3 space-y-2 text-sm text-midnight-soft">
                        <li>• A reminder the day before (simulated)</li>
                        <li>• After the session, an optional 3-question check-in on how it felt</li>
                        <li>• You can reschedule, switch counsellor or cancel any time</li>
                      </ul>
                    </div>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <Link href="/my-space" className="focus-ring grid h-12 place-items-center rounded-full bg-midnight px-6 text-sm font-semibold text-white">Go to My Space</Link>
                      <button onClick={onClose} className="focus-ring h-12 rounded-full border border-midnight/10 bg-white px-6 text-sm font-semibold">Keep browsing</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-midnight-mute">{k}</p>
      <p className="mt-1 text-[13px] font-medium leading-snug text-midnight">{v}</p>
    </div>
  );
}
