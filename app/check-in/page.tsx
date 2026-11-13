"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, toneBg } from "@/components/icon";
import { useApp } from "@/components/providers";
import { CrisisPanel } from "@/components/safety";
import { Button, cn } from "@/components/ui";
import { emptyAnswers, isComplete, questions } from "@/lib/checkin";
import { screenText } from "@/lib/safety";
import type { CheckInAnswers } from "@/lib/types";

const encouragements = [
  "Take your time.",
  "Thanks. That helps.",
  "You're doing great. Just a few more.",
  "Almost there.",
  "One last thing, if you'd like.",
  "",
];

export default function CheckIn() {
  const router = useRouter();
  const { setCheckIn, answers: saved } = useApp();
  const [a, setA] = useState<CheckInAnswers>(emptyAnswers);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Restore structured answers (never the note) if the user comes back to edit
  useEffect(() => {
    if (saved) setA({ ...saved, note: "" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    if (window.scrollY > 80) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [i]);

  const q = questions[i];
  const total = questions.length;
  const value = a[q.key];
  const crisis = useMemo(() => screenText(a.note).urgent, [a.note]);

  const go = (to: number) => {
    setError("");
    setDir(to > i ? 1 : -1);
    setI(Math.max(0, Math.min(total - 1, to)));
  };

  const choose = (v: string) => {
    setA((s) => ({ ...s, [q.key]: v }));
    setError("");
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (i < total - 1) advanceTimer.current = setTimeout(() => go(i + 1), 380);
  };

  const next = () => {
    if (!q.optional && !value) {
      setError("Please choose the option that feels closest. You can change it later.");
      return;
    }
    if (i < total - 1) go(i + 1);
    else submit();
  };

  const submit = () => {
    if (crisis) return;
    if (!isComplete(a)) {
      const missing = questions.findIndex((x) => !x.optional && !a[x.key]);
      go(missing);
      setError("We just need an answer to this one before we can suggest a next step.");
      return;
    }
    setSubmitting(true);
    setCheckIn({ ...a, note: (a.note || "").trim() }, null);
    router.push("/results");
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      {/* Progress */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => (i === 0 ? router.push("/") : go(i - 1))} className="focus-ring inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-midnight-mute hover:text-midnight">
          <ArrowLeft className="h-4 w-4" /> {i === 0 ? "Home" : "Back"}
        </button>
        <p className="text-xs font-semibold tabular-nums text-midnight-mute" aria-live="polite">
          {i + 1} of {total}
        </p>
      </div>
      <div className="mt-4 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={i + 1} aria-label="Check-in progress">
        {questions.map((x, k) => (
          <button
            key={x.key}
            onClick={() => (k < i || questions.slice(0, k).every((qq) => qq.optional || a[qq.key]) ? go(k) : undefined)}
            className="focus-ring relative h-1.5 flex-1 overflow-hidden rounded-full bg-midnight/[0.08]"
            aria-label={`Go to question ${k + 1}`}
          >
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo to-lilac"
              initial={false}
              animate={{ width: k < i ? "100%" : k === i ? "50%" : "0%" }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="relative mt-10 flex-1 sm:mt-14">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={q.key}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: dir * -40, filter: "blur(6px)" }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">{q.eyebrow}</p>
            <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-[2rem] font-semibold leading-[1.12] tracking-[-0.03em] outline-none sm:text-[2.6rem]">
              {q.title}
            </h1>
            <p className="mt-3 text-[15px] text-midnight-mute">{q.helper}</p>

            {q.options ? (
              <div role="radiogroup" aria-label={q.title} className={cn("mt-8 grid gap-3", q.options.length > 4 ? "sm:grid-cols-2" : "")}>
                {q.options.map((o, k) => {
                  const selected = value === o.value;
                  return (
                    <motion.button
                      key={o.value}
                      role="radio"
                      aria-checked={selected}
                      aria-label={o.hint ? `${o.label}. ${o.hint}` : o.label}
                      onClick={() => choose(o.value)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + k * 0.04, duration: 0.4 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      className={cn(
                        "focus-ring group relative flex items-center gap-4 overflow-hidden rounded-3xl border p-4 text-left transition-[background-color,border-color,box-shadow] duration-300 sm:p-5",
                        selected ? "border-indigo/50 bg-white shadow-lift" : "border-white/80 bg-white/65 shadow-soft hover:bg-white",
                      )}
                    >
                      {selected && <motion.span layoutId={`sel-${q.key}`} className="absolute inset-0 rounded-3xl ring-2 ring-indigo/60" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-105", toneBg[o.tone])}>
                        <Icon name={o.icon} className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[15px] font-semibold text-midnight sm:text-base">{o.label}</span>
                        {o.hint && <span className="mt-0.5 block text-[13px] text-midnight-mute">{o.hint}</span>}
                      </span>
                      <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all", selected ? "border-indigo-deep bg-indigo-deep text-white" : "border-midnight/15")}>
                        <AnimatePresence>{selected && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="h-3.5 w-3.5" strokeWidth={3} /></motion.span>}</AnimatePresence>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8">
                <label htmlFor="note" className="sr-only">Describe your situation (optional)</label>
                <textarea
                  id="note"
                  value={a.note}
                  onChange={(e) => setA((s) => ({ ...s, note: e.target.value.slice(0, 1000) }))}
                  rows={5}
                  placeholder="For example: work has been non-stop and I can't switch off at night…"
                  className="input min-h-[150px] resize-none rounded-3xl p-5 text-base leading-relaxed"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-midnight-mute">
                  <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Not saved. Used once to shape your suggestions.</span>
                  <span className="tabular-nums">{(a.note || "").length}/1000</span>
                </div>
                <AnimatePresence>
                  {crisis && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
                      <CrisisPanel compact message="What you've written sounds really serious, and we want to make sure you get support from a person right now, not an app." />
                      <p className="mt-3 text-center text-xs text-midnight-mute">We&apos;ve paused suggestions so you can focus on getting support. If we misunderstood, you can edit what you wrote.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-peach/25 px-4 py-3 text-sm font-medium text-peach-deep">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="sticky bottom-0 -mx-4 mt-10 border-t border-midnight/5 bg-ivory/85 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3 hidden text-sm text-midnight-mute sm:block">
            {encouragements[i]}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => (i === 0 ? router.push("/") : go(i - 1))} className="hidden sm:inline-flex">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            {q.optional && i === total - 1 && !a.note && (
              <Button variant="secondary" onClick={submit} disabled={submitting}>Skip</Button>
            )}
            <Button onClick={next} disabled={submitting || (i === total - 1 && crisis)} className="flex-1 sm:flex-none">
              {i === total - 1 ? (submitting ? "Preparing…" : "See my next step") : "Continue"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-midnight-mute sm:justify-start">
          <Lock className="h-3.5 w-3.5" /> No names, no sign-up. Your answers stay in this browser session.
        </p>
      </div>
    </section>
  );
}
