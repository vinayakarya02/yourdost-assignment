"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Bookmark, BookmarkCheck, BookOpen, CalendarClock, CheckCircle2, Clock, Compass, Info, Languages,
  Leaf, MessagesSquare, PencilLine, PlayCircle, RefreshCw, Repeat2, Sprout, Users, WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, nextSlot } from "@/components/people";
import { Processing, RingsOrb } from "@/components/processing";
import { useApp } from "@/components/providers";
import { CrisisPanel } from "@/components/safety";
import { Button, ButtonLink, DemoBadge, EmptyState, TiltCard, cn, fadeUp, stagger } from "@/components/ui";
import { kindLabels, programmeById, resourceById } from "@/data/resources";
import { therapistById } from "@/data/therapists";
import { recommend } from "@/lib/engine";
import { labelFor } from "@/lib/checkin";
import type { Recommendation } from "@/lib/types";

type Mode = "ai" | "rules" | "rules_fallback" | "offline" | "safety";

export default function Results() {
  const { answers, recommendation, setCheckIn, hydrated, toggleSave, isSaved, setSafetyOpen, continueWith, setContinueWith } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  const load = async () => {
    if (!answers) return;
    setLoading(true);
    const minDelay = new Promise((r) => setTimeout(r, 1900)); // gentle, deliberate reveal
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20_000);
      const res = await fetch("/api/recommend", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }), signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { recommendation: Recommendation; mode: Mode };
      await minDelay;
      setCheckIn(answers, data.recommendation);
      setMode(data.mode);
    } catch {
      await minDelay;
      setCheckIn(answers, recommend(answers)); // same deterministic engine, in the browser
      setMode("offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    if (answers && !recommendation) load();
    else if (recommendation) setMode(recommendation.source === "ai" ? "ai" : "rules");
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated || loading || (answers && !recommendation)) {
    return <section className="mx-auto max-w-3xl px-4"><Processing /></section>;
  }

  if (!answers || !recommendation) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24">
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="No check-in yet"
          body="Answer five short questions and we'll suggest a gentle place to start. It takes about two minutes."
          action={<ButtonLink href="/check-in">Start my check-in <ArrowRight className="h-4 w-4" /></ButtonLink>}
        />
      </section>
    );
  }

  const r = recommendation;

  if (r.safety.level === "urgent") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
        <p className="eyebrow mb-4">We&apos;ve paused your suggestions</p>
        <CrisisPanel message={r.safety.message} />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/support" variant="secondary">More support options</ButtonLink>
          <Button variant="ghost" onClick={() => { setCheckIn(null, null); router.push("/check-in"); }}>Edit my answers</Button>
        </div>
      </section>
    );
  }

  const therapist = therapistById(continueWith ?? r.therapistId) ?? therapistById(r.therapistId)!;
  const programme = programmeById(r.programmeId);
  const res = r.resourceIds.map(resourceById).filter(Boolean);
  const recSaveId = `rec-${answers.concern}-${r.nextStep.type}`;
  const primaryIcon = { counselling: MessagesSquare, programme: Sprout, guided_exercise: Leaf, assessment: Compass, resources: BookOpen }[r.nextStep.type];
  const PrimaryIcon = primaryIcon;

  return (
    <motion.section variants={stagger(0.12)} initial="hidden" animate="show" className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
            <RingsOrb size={84} />
          </motion.div>
          <div>
            <p className="eyebrow">Your check-in</p>
            <h1 className="display mt-2 text-4xl sm:text-5xl">Here&apos;s a place to start.</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode={mode} />
          <Link href="/check-in" className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-midnight-mute hover:bg-white hover:text-midnight">
            <PencilLine className="h-4 w-4" /> Edit answers
          </Link>
        </div>
      </motion.div>

      {/* Summary + Primary */}
      <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={fadeUp} className="card relative overflow-hidden p-7 sm:p-8">
          <p className="eyebrow">Your check-in summary</p>
          <p className="mt-4 text-[19px] font-medium leading-[1.55] tracking-[-0.01em] text-midnight">{r.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[labelFor("concern", answers.concern), labelFor("duration", answers.duration), labelFor("support", answers.support)].filter(Boolean).map((x) => (
              <span key={x} className="chip">{x}</span>
            ))}
          </div>
          {r.supportNeeds.length > 0 && (
            <div className="mt-6 border-t border-midnight/5 pt-5">
              <p className="text-xs font-semibold text-midnight-mute">What might help</p>
              <ul className="mt-2 space-y-1.5">
                {r.supportNeeds.map((n) => (
                  <li key={n} className="flex items-center gap-2 text-sm text-midnight-soft"><CheckCircle2 className="h-4 w-4 text-sage-deep" />{n}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-4xl bg-midnight p-7 text-white shadow-lift sm:p-9">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo/50 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-peach/25 blur-3xl" aria-hidden />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-label text-lilac">Your recommended next step</p>
              <button
                onClick={() => toggleSave({ id: recSaveId, kind: "recommendation", title: r.nextStep.title, href: r.nextStep.href })}
                className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label={isSaved(recSaveId) ? "Remove saved recommendation" : "Save recommendation"}
              >
                {isSaved(recSaveId) ? <BookmarkCheck className="h-5 w-5 text-sage" /> : <Bookmark className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-lilac"><PrimaryIcon className="h-6 w-6" /></div>
            <h2 className="mt-5 text-[1.9rem] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[2.3rem]">{r.nextStep.title}</h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/75">{r.nextStep.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={r.nextStep.href} variant="secondary" size="lg" className="w-full border-0 !bg-white text-midnight hover:!bg-ivory sm:w-auto">
                {r.nextStep.cta} <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <a href="#options" className="focus-ring inline-flex h-14 items-center justify-center rounded-full px-6 text-[15px] font-semibold text-white/80 hover:text-white">See other options</a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Why */}
      <motion.div variants={fadeUp} className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-7 sm:p-8">
          <p className="eyebrow">Why this may help</p>
          <ol className="mt-5 space-y-4">
            {r.reasons.map((x, k) => (
              <motion.li key={x} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + k * 0.12 }} className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-xs font-bold text-indigo-ink">{k + 1}</span>
                <span className="pt-0.5 text-[15px] leading-relaxed text-midnight-soft">{x}</span>
              </motion.li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-5">
          <div className={cn("rounded-4xl p-7", r.professionalSupport.worthConsidering ? "bg-lilac/25" : "bg-sage/25")}>
            <p className="flex items-center gap-2 text-sm font-semibold text-midnight"><Users className="h-4 w-4" /> About talking to someone</p>
            <p className="mt-2 text-sm leading-relaxed text-midnight-soft">{r.professionalSupport.note}</p>
          </div>
          <div className="rounded-4xl border border-midnight/5 bg-white/60 p-7">
            <p className="flex items-center gap-2 text-sm font-semibold text-midnight"><Info className="h-4 w-4" /> What this can&apos;t know</p>
            <p className="mt-2 text-sm leading-relaxed text-midnight-soft">{r.uncertainty} This is guidance, not a diagnosis.</p>
            {r.safety.level === "elevated" && (
              <button onClick={() => setSafetyOpen(true)} className="focus-ring mt-3 text-sm font-semibold text-indigo-deep underline-offset-4 hover:underline">
                If things feel like too much, here&apos;s how to reach a person now →
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Support options */}
      <div id="options" className="scroll-mt-24 pt-20">
        <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Your support options</p>
            <h2 className="h2 mt-3">Three ways to move forward.</h2>
          </div>
          <DemoBadge label="Sample demo content" />
        </motion.div>

        <motion.div variants={stagger(0.1)} className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* A: Therapist */}
          <motion.div variants={fadeUp}>
            <TiltCard max={4} className="h-full">
              <OptionShell label="Talk to someone" icon={<MessagesSquare className="h-4 w-4" />} tone="bg-lilac/30 text-indigo-ink">
                <div className="flex items-center gap-4">
                  <Avatar t={therapist} size={64} />
                  <div>
                    <p className="text-lg font-semibold tracking-tight">{therapist.name}</p>
                    <p className="text-[13px] text-midnight-mute">{therapist.title}</p>
                  </div>
                </div>
                <dl className="mt-5 space-y-2.5 text-sm">
                  <Row icon={<Sprout className="h-4 w-4" />} k="Specialty" v={therapist.focusLabel} />
                  <Row icon={<Languages className="h-4 w-4" />} k="Languages" v={therapist.languages.join(", ")} />
                  <Row icon={<Clock className="h-4 w-4" />} k="Experience" v={`${therapist.years} years`} />
                  <Row icon={<CalendarClock className="h-4 w-4" />} k="Next available" v={nextSlot(therapist)} />
                </dl>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
                  <Link href={`/therapists?focus=${therapist.id}`} className="focus-ring grid h-11 place-items-center rounded-full border border-midnight/10 bg-white text-sm font-semibold hover:bg-ivory">View profile</Link>
                  <Link href={`/therapists?focus=${therapist.id}&book=1`} className="focus-ring grid h-11 place-items-center rounded-full bg-midnight text-sm font-semibold text-white hover:bg-[#2F2E4A]">Book a session</Link>
                </div>
              </OptionShell>
            </TiltCard>
          </motion.div>

          {/* B: Self-help */}
          <motion.div variants={fadeUp}>
            <TiltCard max={4} className="h-full">
              <OptionShell label="Explore self-help" icon={<BookOpen className="h-4 w-4" />} tone="bg-sage/40 text-sage-deep">
                <ul className="space-y-2">
                  {res.map((x) => (
                    <li key={x!.id}>
                      <Link href={`/library?open=${x!.id}`} className="focus-ring group flex items-center gap-3 rounded-2xl border border-midnight/5 bg-ivory/60 p-3 transition hover:border-indigo/30 hover:bg-white">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-deep shadow-soft">
                          {x!.kind === "video" ? <PlayCircle className="h-5 w-5" /> : x!.kind === "activity" ? <Leaf className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-midnight">{x!.title}</span>
                          <span className="text-xs text-midnight-mute">{kindLabels[x!.kind]} · {x!.minutes} min</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-midnight-mute transition group-hover:translate-x-0.5 group-hover:text-indigo-deep" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/library`} className="focus-ring mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-indigo-deep">Browse the full library <ArrowRight className="h-4 w-4" /></Link>
              </OptionShell>
            </TiltCard>
          </motion.div>

          {/* C: Programme */}
          {programme && (
            <motion.div variants={fadeUp}>
              <TiltCard max={4} className="h-full">
                <OptionShell label="Build a daily habit" icon={<Sprout className="h-4 w-4" />} tone="bg-peach/40 text-peach-deep">
                  <p className="text-xl font-semibold tracking-tight">{programme.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-midnight-soft">{programme.description}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="chip">{programme.weeks} weeks</span>
                    <span className="chip">{programme.minutesPerDay} min/day</span>
                  </div>
                  <p className="mt-5 text-xs font-semibold text-midnight-mute">What to expect</p>
                  <ul className="mt-2 space-y-1.5">
                    {programme.expect.map((e) => (
                      <li key={e} className="flex gap-2 text-sm text-midnight-soft"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />{e}</li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6"><Link href={`/library?open=${programme.id}`} className="focus-ring grid h-11 place-items-center rounded-full bg-midnight text-sm font-semibold text-white hover:bg-[#2F2E4A]">Preview programme</Link></div>
                </OptionShell>
              </TiltCard>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Continuity */}
      <motion.div variants={fadeUp} className="mt-20 overflow-hidden rounded-5xl border border-white/80 bg-gradient-to-br from-mist/80 via-white/70 to-sage/30 p-7 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">At your pace</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Would you like to continue with this support?</h2>
            <p className="mt-3 text-sm leading-relaxed text-midnight-soft">Nothing here expires, and there&apos;s no streak to keep. Save what feels useful and come back when you&apos;re ready.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ContinuityAction
              icon={isSaved(recSaveId) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              title={isSaved(recSaveId) ? "Saved to My Space" : "Save this recommendation"}
              body="Find it again any time."
              onClick={() => toggleSave({ id: recSaveId, kind: "recommendation", title: r.nextStep.title, href: r.nextStep.href })}
              active={isSaved(recSaveId)}
            />
            <ContinuityAction
              icon={<Repeat2 className="h-5 w-5" />}
              title={continueWith === therapist.id ? `Continuing with ${therapist.name.split(" ")[0]}` : `Continue with ${therapist.name.split(" ")[0]}`}
              body="We'll keep them first in your matches."
              onClick={() => setContinueWith(continueWith === therapist.id ? null : therapist.id)}
              active={continueWith === therapist.id}
            />
            <ContinuityAction icon={<Users className="h-5 w-5" />} title="Explore another therapist" body="Compare a few people, no commitment." href={`/therapists?concern=${answers.concern}`} />
            <ContinuityAction icon={<BookOpen className="h-5 w-5" />} title="Explore other resources" body="Browse by topic or format." href="/library" />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

function ModeBadge({ mode }: { mode: Mode | null }) {
  if (!mode) return null;
  const m = {
    ai: { t: "AI-assisted · reviewed by rules", c: "bg-mist text-indigo-ink", i: <Compass className="h-3.5 w-3.5" /> },
    rules: { t: "Rule-based demo mode", c: "bg-sage/35 text-sage-deep", i: <CheckCircle2 className="h-3.5 w-3.5" /> },
    rules_fallback: { t: "AI unavailable · rule-based", c: "bg-sage/35 text-sage-deep", i: <RefreshCw className="h-3.5 w-3.5" /> },
    offline: { t: "Offline · rule-based", c: "bg-peach/30 text-peach-deep", i: <WifiOff className="h-3.5 w-3.5" /> },
    safety: { t: "Safety first", c: "bg-peach/30 text-peach-deep", i: <Info className="h-3.5 w-3.5" /> },
  }[mode];
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", m.c)}>{m.i}{m.t}</span>;
}

function OptionShell({ label, icon, tone, children }: { label: string; icon: React.ReactNode; tone: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-4xl border border-white/80 bg-white/85 p-6 shadow-soft transition-shadow duration-500 hover:shadow-lift sm:p-7">
      <span className={cn("mb-5 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", tone)}>{icon}{label}</span>
      {children}
    </div>
  );
}

function Row({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-midnight-mute">{icon}</span>
      <dt className="w-28 shrink-0 text-midnight-mute">{k}</dt>
      <dd className="font-medium text-midnight">{v}</dd>
    </div>
  );
}

function ContinuityAction({ icon, title, body, onClick, href, active }: { icon: React.ReactNode; title: string; body: string; onClick?: () => void; href?: string; active?: boolean }) {
  const inner = (
    <>
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors", active ? "bg-indigo-deep text-white" : "bg-white text-indigo-deep shadow-soft")}>
        <AnimatePresence mode="wait"><motion.span key={String(active)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{icon}</motion.span></AnimatePresence>
      </span>
      <span>
        <span className="block text-sm font-semibold text-midnight">{title}</span>
        <span className="block text-xs text-midnight-mute">{body}</span>
      </span>
    </>
  );
  const cls = cn("focus-ring flex w-full items-center gap-3 rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft", active ? "border-indigo/40 bg-white" : "border-white/80 bg-white/60 hover:bg-white");
  return href ? <Link href={href} className={cls}>{inner}</Link> : <button onClick={onClick} className={cls} aria-pressed={active}>{inner}</button>;
}
