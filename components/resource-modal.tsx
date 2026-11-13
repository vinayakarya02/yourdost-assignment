"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Check, CheckCircle2, Pause, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categoryLabels, kindLabels } from "@/data/resources";
import type { Programme, Resource } from "@/lib/types";
import { useApp } from "./providers";
import { Button, DemoBadge, cn } from "./ui";

// Short demo takeaways for articles (fictional editorial content written for the prototype).
const takeaways: Record<string, string[]> = {
  "r-overwhelm-article": ["Overwhelm often comes from too many open loops, not from weakness.", "Write everything down, then pick only the next small action.", "Protect one short recovery break before the day gets away from you."],
  "r-anxiety-article": ["Thoughts like 'what if…' are predictions, not facts.", "Naming a thought ('I'm having the thought that…') can loosen its grip.", "You don't have to win the argument with worry. Just notice it and return to now."],
  "r-sleep-article": ["Stress keeps the body alert even when the mind is tired.", "A consistent wake-up time often helps more than an early bedtime.", "Screens and work email late at night keep your brain in 'day mode'."],
  "r-conversations": ["Start with how you feel, not what they did wrong.", "Ask one curious question before offering your view.", "Agree on one small next step rather than solving everything at once."],
  "r-workload-article": ["Go in with a list of current priorities and rough time estimates.", "Ask 'what should move down the list?' rather than 'can I do less?'", "Follow up in writing so expectations stay clear."],
  "r-exam-article": ["Rest is part of revision. Memory consolidates when you pause.", "Plan in 45-minute blocks with real breaks.", "Keep one evening a week completely study-free."],
  "r-low-mood-article": ["Low mood often makes everything feel effortful and flat.", "Small, planned activities can help, even before motivation returns.", "If it's been weeks and getting harder, talking to someone may be worth considering."],
};

// Reflection prompts per self-reflection item. The last item in each set is a protective factor.
const reflectionSets: Record<string, string[]> = {
  "a-reflection": [
    "I've found it hard to switch off or relax",
    "I've felt more tired than usual during the day",
    "I've been less interested in things I usually enjoy",
    "I've felt tense or on edge",
    "I've felt able to talk to someone about how I'm doing",
  ],
  "a-stress-check": [
    "My to-do list has felt bigger than the time I have",
    "I've found it hard to take proper breaks",
    "Small things have irritated me more than usual",
    "Work or study has followed me into evenings and weekends",
    "I've had time for something that recharges me",
  ],
  "a-sleep-diary": [
    "It's taken me a long time to fall asleep",
    "I've woken in the night and struggled to get back to sleep",
    "I've been on my phone or working in the hour before bed",
    "I've felt tired or foggy during the day",
    "I've kept a fairly regular wake-up time",
  ],
};
const scale = ["Rarely", "Sometimes", "Often"];

export type LibraryItem = { type: "resource"; r: Resource } | { type: "programme"; p: Programme };

export function ResourceModal({ item, onClose }: { item: LibraryItem | null; onClose: () => void }) {
  const { toggleSave, isSaved, markComplete, completed, setSafetyOpen } = useApp();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => closeRef.current?.focus(), 50);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [item, onClose]);

  const id = item ? (item.type === "resource" ? item.r.id : item.p.id) : "";
  const title = item ? (item.type === "resource" ? item.r.title : item.p.name) : "";
  const done = completed.includes(id);

  return (
    <AnimatePresence>
      {item && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-midnight/35 backdrop-blur-[3px]" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ y: 60, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-5xl bg-ivory shadow-2xl sm:rounded-5xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-ivory/90 px-6 py-4 backdrop-blur sm:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{item.type === "resource" ? kindLabels[item.r.kind] : "Programme"}</span>
                {item.type === "resource" && <span className="chip">{categoryLabels[item.r.category]}</span>}
                <DemoBadge />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSave({ id, kind: item.type === "programme" ? "programme" : "resource", title, href: `/library?open=${id}` })}
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white text-midnight shadow-soft hover:bg-mist"
                  aria-label={isSaved(id) ? "Remove from My Space" : "Save to My Space"}
                >
                  {isSaved(id) ? <BookmarkCheck className="h-5 w-5 text-indigo-deep" /> : <Bookmark className="h-5 w-5" />}
                </button>
                <button ref={closeRef} onClick={onClose} className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white text-midnight shadow-soft hover:bg-mist" aria-label="Close"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="px-6 pb-8 sm:px-8">
              <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em]">{title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-midnight-soft">{item.type === "resource" ? item.r.summary : item.p.description}</p>

              <div className="mt-6">
                {item.type === "programme" && <ProgrammeBody p={item.p} joined={isSaved(item.p.id)} onJoin={() => toggleSave({ id: item.p.id, kind: "programme", title: item.p.name, href: `/library?open=${item.p.id}` })} />}
                {item.type === "resource" && item.r.kind === "activity" && <ActivityBody r={item.r} onDone={() => markComplete(item.r.id)} />}
                {item.type === "resource" && item.r.kind === "video" && <VideoBody r={item.r} onDone={() => markComplete(item.r.id)} />}
                {item.type === "resource" && item.r.kind === "article" && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-midnight-mute">Key ideas · {item.r.minutes} min read</p>
                    <ul className="mt-3 space-y-3">
                      {(takeaways[item.r.id] ?? [item.r.summary]).map((t, k) => (
                        <li key={t} className="flex gap-3 rounded-2xl bg-white p-4 text-[15px] leading-relaxed text-midnight-soft shadow-soft">
                          <span className="font-semibold text-indigo-deep">{k + 1}</span>{t}
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-6 w-full" variant={done ? "soft" : "primary"} onClick={() => markComplete(item.r.id)}>
                      {done ? <><CheckCircle2 className="h-4 w-4" /> Marked as read</> : "Mark as read"}
                    </Button>
                  </div>
                )}
                {item.type === "resource" && item.r.kind === "assessment" && <ReflectionBody key={item.r.id} items={reflectionSets[item.r.id] ?? reflectionSets["a-reflection"]} onDone={() => markComplete(item.r.id)} onHelp={() => setSafetyOpen(true)} />}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProgrammeBody({ p, joined, onJoin }: { p: Programme; joined: boolean; onJoin: () => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-soft"><p className="text-xs text-midnight-mute">Duration</p><p className="text-lg font-semibold">{p.weeks} weeks</p></div>
        <div className="rounded-2xl bg-white p-4 shadow-soft"><p className="text-xs text-midnight-mute">Daily time</p><p className="text-lg font-semibold">~{p.minutesPerDay} minutes</p></div>
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-midnight-mute">What you can expect</p>
      <ul className="mt-3 space-y-2">
        {p.expect.map((e) => <li key={e} className="flex gap-2 text-[15px] text-midnight-soft"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" />{e}</li>)}
      </ul>
      <p className="mt-6 rounded-2xl bg-mist/60 p-4 text-sm text-midnight-soft">Miss a day? That&apos;s fine. Programmes pause and wait for you; there are no streaks to lose.</p>
      <Button className="mt-6 w-full" size="lg" variant={joined ? "soft" : "primary"} onClick={onJoin}>
        {joined ? <><Check className="h-4 w-4" /> Joined (demo) · tap to leave</> : "Join this programme (demo)"}
      </Button>
    </div>
  );
}

function ActivityBody({ r, onDone }: { r: Resource; onDone: () => void }) {
  const steps = r.steps ?? [];
  const [k, setK] = useState(-1);
  const finished = k >= steps.length;
  return (
    <div>
      {k === -1 ? (
        <div className="rounded-4xl bg-white p-6 text-center shadow-soft">
          <div className="css-orb mx-auto h-20 w-20 animate-breathe rounded-full" aria-hidden />
          <p className="mt-4 text-sm text-midnight-soft">{steps.length} gentle steps · about {r.minutes} minutes. Find a comfortable position.</p>
          <Button className="mt-5" onClick={() => setK(0)}>Begin</Button>
        </div>
      ) : finished ? (
        <div className="rounded-4xl bg-white p-6 text-center shadow-soft">
          <CheckCircle2 className="mx-auto h-10 w-10 text-sage-deep" />
          <p className="mt-3 text-lg font-semibold">Nicely done.</p>
          <p className="mt-1 text-sm text-midnight-soft">Notice how you feel right now, without judging it. You can come back to this any time.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="secondary" onClick={() => setK(0)}><RotateCcw className="h-4 w-4" /> Again</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-4xl bg-white p-6 shadow-soft">
          <div className="flex gap-1.5">{steps.map((_, x) => <span key={x} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", x <= k ? "bg-indigo" : "bg-midnight/10")} />)}</div>
          <AnimatePresence mode="wait">
            <motion.p key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-8 min-h-[4.5rem] text-center text-xl font-medium leading-snug text-midnight">
              {steps[k]}
            </motion.p>
          </AnimatePresence>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>Back</Button>
            <Button onClick={() => { if (k === steps.length - 1) onDone(); setK((x) => x + 1); }}>{k === steps.length - 1 ? "Finish" : "Next step"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoBody({ r, onDone }: { r: Resource; onDone: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setP((x) => {
      const n = Math.min(100, x + 2.5);
      if (n >= 100) { setPlaying(false); onDone(); }
      return n;
    }), 250);
    return () => clearInterval(id);
  }, [playing, onDone]);
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-4xl bg-gradient-to-br from-indigo via-lilac to-mist">
        <motion.div className="css-orb absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full" animate={playing ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        {playing && <p className="absolute inset-x-0 bottom-12 text-center text-sm font-medium text-white/90">{p < 50 ? "Breathe in…" : "…and slowly out"}</p>}
        <button onClick={() => { if (p >= 100) setP(0); setPlaying((v) => !v); }} className="focus-ring absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-midnight shadow-lift" aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>
        <div className="absolute bottom-6 left-20 right-5 h-1.5 overflow-hidden rounded-full bg-white/30"><div className="h-full bg-white transition-[width] duration-200" style={{ width: `${p}%` }} /></div>
      </div>
      <p className="mt-3 text-xs text-midnight-mute">Demo player: a 10-second visual preview stands in for the {r.minutes}-minute video in this prototype.</p>
    </div>
  );
}

function ReflectionBody({ items: reflectionItems, onDone, onHelp }: { items: string[]; onDone: () => void; onHelp: () => void }) {
  const [vals, setVals] = useState<(number | null)[]>(reflectionItems.map(() => null));
  const [show, setShow] = useState(false);
  const complete = vals.every((v) => v !== null);
  const often = vals.slice(0, 4).filter((v) => v === 2).length;
  return (
    <div>
      {!show ? (
        <>
          <p className="text-sm text-midnight-mute">Over the past two weeks… There are no right answers, and nothing here is saved.</p>
          <ul className="mt-4 space-y-3">
            {reflectionItems.map((q, k) => (
              <li key={q} className="rounded-3xl bg-white p-4 shadow-soft">
                <p className="text-[15px] font-medium text-midnight">{q}</p>
                <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={q}>
                  {scale.map((s, v) => (
                    <button key={s} role="radio" aria-checked={vals[k] === v} onClick={() => setVals((a) => a.map((x, i) => (i === k ? v : x)))}
                      className={cn("focus-ring h-10 rounded-2xl border text-sm font-medium transition", vals[k] === v ? "border-indigo-deep bg-mist text-indigo-ink" : "border-midnight/10 text-midnight-soft hover:border-indigo/40")}>
                      {s}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <Button className="mt-6 w-full" disabled={!complete} onClick={() => { setShow(true); onDone(); }}>
            {complete ? "See my reflection" : `Answer all ${reflectionItems.length} to continue`}
          </Button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-4xl bg-white p-6 shadow-soft">
          <p className="eyebrow">Your reflection</p>
          <p className="mt-3 text-[17px] leading-relaxed text-midnight">
            {often >= 3
              ? "Quite a few of these have been showing up often for you lately. That sounds like a lot to carry. Talking it through with a counsellor may be worth considering, alongside small daily practices."
              : often >= 1
              ? "Some of these have been showing up often. Noticing that is useful. A short daily practice, or a conversation with someone, might help you understand what's behind it."
              : "Most of these haven't been showing up often. It may still help to keep checking in with yourself from time to time."}
          </p>
          {vals[4] === 0 && <p className="mt-3 text-sm text-midnight-soft">You said &ldquo;{reflectionItems[4]}&rdquo; rarely applies right now. That&apos;s a good place to start small, and YourDOST counsellors can help you think it through whenever you&apos;re ready.</p>}
          <p className="mt-4 rounded-2xl bg-ivory p-3 text-xs text-midnight-mute">This is a reflection prompt, not a test, score or diagnosis.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href="/therapists" className="focus-ring rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white">Find a counsellor</a>
            <button onClick={() => { setVals(reflectionItems.map(() => null)); setShow(false); }} className="focus-ring rounded-full border border-midnight/10 bg-white px-5 py-2.5 text-sm font-semibold">Start again</button>
            <button onClick={onHelp} className="focus-ring rounded-full px-3 py-2.5 text-sm font-semibold text-indigo-deep">Need help now?</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
