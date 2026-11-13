"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bookmark, CalendarClock, CheckCircle2, Heart, Repeat2, Trash2, UserRoundSearch } from "lucide-react";
import Link from "next/link";
import { Avatar, dayLabel } from "@/components/people";
import { useApp, type Booking } from "@/components/providers";
import { ButtonLink, DemoBadge, EmptyState, Skeleton, cn } from "@/components/ui";
import { therapistById } from "@/data/therapists";

export default function MySpace() {
  const { hydrated, saved, bookings, continueWith, toggleSave, cancelBooking, setContinueWith, resetDemo, completed } = useApp();
  const counsellor = continueWith ? therapistById(continueWith) : null;

  if (!hydrated) return <div className="mx-auto max-w-5xl px-4 py-16"><Skeleton className="h-72" /></div>;

  const empty = saved.length === 0 && bookings.length === 0 && !counsellor;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 lg:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My Space</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Your support, in one calm place.</h1>
          <p className="lead mt-3 max-w-xl">Saved items, demo sessions and the people you&apos;d like to keep talking to. Stored only in this browser.</p>
        </div>
        <DemoBadge label="Stored locally" />
      </div>

      {empty ? (
        <div className="mt-10">
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="Nothing saved yet"
            body="When you save a recommendation, join a programme or book a demo session, it'll appear here."
            action={<ButtonLink href="/check-in">Start a check-in <ArrowRight className="h-4 w-4" /></ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="card p-6 sm:p-7">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarClock className="h-5 w-5 text-indigo-deep" /> Sessions</h2>
              {bookings.length === 0 ? (
                <p className="mt-3 text-sm text-midnight-mute">No sessions booked. <Link href="/therapists" className="font-semibold text-indigo-deep">Find a counsellor →</Link></p>
              ) : (
                <ul className="mt-4 space-y-3">
                  <AnimatePresence>{bookings.map((b) => <BookingRow key={b.id} b={b} onCancel={() => cancelBooking(b.id)} />)}</AnimatePresence>
                </ul>
              )}
            </div>

            <div className="card p-6 sm:p-7">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><Bookmark className="h-5 w-5 text-indigo-deep" /> Saved</h2>
              {saved.length === 0 ? <p className="mt-3 text-sm text-midnight-mute">Nothing saved yet.</p> : (
                <ul className="mt-4 divide-y divide-midnight/5">
                  <AnimatePresence>
                    {saved.map((s) => (
                      <motion.li key={s.id} layout exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3 py-3">
                        <span className="chip capitalize">{s.kind}</span>
                        <Link href={s.href} className="min-w-0 flex-1 truncate text-sm font-semibold text-midnight hover:text-indigo-deep">{s.title}</Link>
                        {completed.includes(s.id) && <CheckCircle2 className="h-4 w-4 text-sage-deep" aria-label="Completed" />}
                        <button onClick={() => toggleSave(s)} className="focus-ring grid h-9 w-9 place-items-center rounded-full text-midnight-mute hover:bg-peach/20 hover:text-peach-deep" aria-label={`Remove ${s.title}`}><Trash2 className="h-4 w-4" /></button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-4xl bg-gradient-to-br from-sage/40 to-mist/60 p-6 sm:p-7">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><Repeat2 className="h-5 w-5 text-sage-deep" /> Your counsellor</h2>
              {counsellor ? (
                <>
                  <div className="mt-4 flex items-center gap-4">
                    <Avatar t={counsellor} size={56} />
                    <div>
                      <p className="font-semibold">{counsellor.name}</p>
                      <p className="text-xs text-midnight-mute">{counsellor.focusLabel}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-midnight-soft">They&apos;ll stay first in your matches. Switching is always okay; it&apos;s about fit, not loyalty.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/therapists?focus=${counsellor.id}&book=1`} className="focus-ring rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white">Book again</Link>
                    <Link href="/therapists" className="focus-ring rounded-full bg-white px-4 py-2 text-sm font-semibold">Explore others</Link>
                    <button onClick={() => setContinueWith(null)} className="focus-ring rounded-full px-3 py-2 text-sm font-medium text-midnight-mute hover:text-midnight">Remove</button>
                  </div>
                </>
              ) : (
                <div className="mt-3 text-sm text-midnight-soft">
                  <p>Found someone you&apos;d like to keep talking to? Turn on &ldquo;keep as my counsellor&rdquo; on their profile.</p>
                  <Link href="/therapists" className="mt-3 inline-flex items-center gap-1 font-semibold text-indigo-deep"><UserRoundSearch className="h-4 w-4" /> Browse counsellors</Link>
                </div>
              )}
            </div>
            <div className="rounded-4xl border border-midnight/5 bg-white/60 p-6 text-sm text-midnight-soft">
              <p className="font-semibold text-midnight">Privacy</p>
              <p className="mt-1">This demo stores only saved items and demo bookings in your browser. Your check-in text is never stored.</p>
              <button onClick={resetDemo} className="focus-ring mt-3 font-semibold text-peach-deep hover:underline">Clear all demo data</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BookingRow({ b, onCancel }: { b: Booking; onCancel: () => void }) {
  const t = therapistById(b.therapistId);
  const { feedback, setFeedback, setContinueWith, continueWith, toast } = useApp();
  const f = feedback[b.id] ?? {};
  if (!t) return null;
  const q = (key: "comfortable" | "understood" | "continue", label: string) => (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[13px] text-midnight-soft">{label}</span>
      <div className="flex gap-1.5">
        {[true, false].map((v) => (
          <button key={String(v)} aria-pressed={f[key] === v}
            onClick={() => {
              setFeedback(b.id, { [key]: v });
              if (key === "continue" && v && continueWith !== t.id) { setContinueWith(t.id); toast(`${t.name.split(" ")[0]} will stay first in your matches`); }
              if (key === "continue" && !v) toast("Thanks. We'll show you other good fits, no explanation needed", "info");
            }}
            className={cn("focus-ring h-8 rounded-full border px-3 text-xs font-semibold transition", f[key] === v ? "border-indigo-deep bg-mist text-indigo-ink" : "border-midnight/10 bg-white text-midnight-mute hover:text-midnight")}>
            {v ? "Yes" : "Not really"}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl border border-midnight/5 bg-ivory/70 p-4">
      <div className="flex items-center gap-3">
        <Avatar t={t} size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-midnight-mute">{dayLabel(b.dayOffset)}, {b.time} · {b.format} · demo</p>
        </div>
        <button onClick={onCancel} className="focus-ring rounded-full px-3 py-1.5 text-xs font-semibold text-midnight-mute hover:bg-white hover:text-peach-deep">Cancel</button>
      </div>
      <details className="group mt-3 rounded-2xl bg-white p-3">
        <summary className="cursor-pointer list-none text-[13px] font-semibold text-indigo-deep">After your session: how did it feel? <span className="font-normal text-midnight-mute">(optional, simulated)</span></summary>
        <div className="mt-2">
          {q("comfortable", "Were you comfortable?")}
          {q("understood", "Did you feel understood?")}
          {q("continue", `Continue with ${t.name.split(" ")[0]}?`)}
          <p className="mt-2 text-[11px] text-midnight-mute">Used only to improve your matches. Skipping is fine, and it never affects your access to support.</p>
        </div>
      </details>
    </motion.li>
  );
}
