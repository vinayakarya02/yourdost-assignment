"use client";

import { motion } from "framer-motion";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal, UserRoundSearch } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { TherapistCard } from "@/components/people";
import { useApp } from "@/components/providers";
import { TherapistDrawer } from "@/components/therapist-drawer";
import { DemoBadge, EmptyState, Skeleton, cn } from "@/components/ui";
import { therapists } from "@/data/therapists";
import { concernOptions } from "@/lib/checkin";
import { rank, type MatchPrefs } from "@/lib/matching";
import type { Concern, Language, SessionFormat } from "@/lib/types";

const languages: Language[] = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Kannada", "Marathi"];

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16"><Skeleton className="h-96" /></div>}>
      <Therapists />
    </Suspense>
  );
}

function Therapists() {
  const params = useSearchParams();
  const router = useRouter();
  const { answers, continueWith, hydrated } = useApp();
  const [q, setQ] = useState("");
  const [concern, setConcern] = useState<Concern | "all">("all");
  const [language, setLanguage] = useState<Language | "any">("any");
  const [gender, setGender] = useState<"any" | "woman" | "man">("any");
  const [format, setFormat] = useState<SessionFormat | "any">("any");
  const [when, setWhen] = useState<"any" | "soon" | "week">("any");
  const [covered, setCovered] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [open, setOpen] = useState<{ id: string; step: "profile" | "book" } | null>(null);

  useEffect(() => {
    const c = (params.get("concern") as Concern | null) ?? answers?.concern ?? null;
    if (c && concernOptions.some((o) => o.value === c)) setConcern(c);
    const f = params.get("focus");
    if (f && therapists.some((t) => t.id === f)) setOpen({ id: f, step: params.get("book") ? "book" : "profile" });
  }, [params, answers?.concern]);

  const prefs: MatchPrefs = {
    concern: concern === "all" ? null : concern, language, gender, format, when, orgCoveredOnly: covered, continueWith,
  };
  const results = useMemo(() => {
    const ranked = rank(therapists, prefs);
    const s = q.trim().toLowerCase();
    return s
      ? ranked.filter(({ therapist: t }) => [t.name, t.focusLabel, t.title, ...t.languages, ...t.approaches].join(" ").toLowerCase().includes(s))
      : ranked;
  }, [q, concern, language, gender, format, when, covered, continueWith]); // eslint-disable-line react-hooks/exhaustive-deps

  const all = useMemo(() => rank(therapists, { concern: null, continueWith }), [continueWith]);
  const openMatch = open ? results.find((r) => r.therapist.id === open.id) ?? all.find((r) => r.therapist.id === open.id) ?? null : null;
  const active = [concern !== "all", language !== "any", gender !== "any", format !== "any", when !== "any", covered, q !== ""].filter(Boolean).length;

  const reset = () => { setQ(""); setConcern("all"); setLanguage("any"); setGender("any"); setFormat("any"); setWhen("any"); setCovered(false); };
  const close = useCallback(() => {
    setOpen(null);
    if (params.get("focus")) router.replace("/therapists", { scroll: false });
  }, [params, router]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">YourDOST Match</p>
          <h1 className="display mt-3 text-4xl sm:text-[3.4rem]">Find the right person to talk to.</h1>
          <p className="lead mt-4 max-w-2xl">
            The best counsellor isn&apos;t the most popular one. It&apos;s the one who fits your needs, language and time. We rank by fit and show you why.
          </p>
        </div>
        <DemoBadge label="Fictional profiles" className="self-start lg:self-auto" />
      </div>

      {/* Search + filters */}
      <div className="sticky top-16 z-30 -mx-4 mt-8 bg-ivory/85 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-4xl sm:border sm:border-white/80 sm:bg-white/70 sm:p-4 sm:shadow-soft">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search therapists</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-mute" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, focus, language or approach" className="input h-12 rounded-full pl-11" />
          </label>
          <button onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters} className="focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-midnight/10 bg-white px-4 text-sm font-semibold lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters{active > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-deep text-[10px] text-white">{active}</span>}
          </button>
        </div>
        <div className={cn("mt-3 flex-wrap items-center gap-2 lg:flex", showFilters ? "flex" : "hidden")}>
          <Select label="Concern" value={concern} onChange={(v) => setConcern(v as Concern | "all")} options={[["all", "Any concern"], ...concernOptions.map((o) => [o.value, o.label] as [string, string])]} />
          <Select label="Language" value={language} onChange={(v) => setLanguage(v as Language | "any")} options={[["any", "Any language"], ...languages.map((l) => [l, l] as [string, string])]} />
          <Select label="Therapist gender" value={gender} onChange={(v) => setGender(v as "any")} options={[["any", "No gender preference"], ["woman", "Woman"], ["man", "Man"]]} />
          <Select label="Format" value={format} onChange={(v) => setFormat(v as SessionFormat | "any")} options={[["any", "Any format"], ["video", "Video"], ["audio", "Audio"], ["chat", "Chat"]]} />
          <Select label="Availability" value={when} onChange={(v) => setWhen(v as "any")} options={[["any", "Any time"], ["soon", "Within 48 hours"], ["week", "This week"]]} />
          <button onClick={() => setCovered((v) => !v)} aria-pressed={covered} className={cn("focus-ring h-10 rounded-full border px-4 text-sm font-medium transition", covered ? "border-indigo-deep bg-mist text-indigo-ink" : "border-midnight/10 bg-white text-midnight-soft hover:border-indigo/40")}>
            Covered by my organisation
          </button>
          {active > 0 && (
            <button onClick={reset} className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-midnight-mute hover:text-midnight"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-midnight-mute">
        <p aria-live="polite">{results.length} {results.length === 1 ? "match" : "matches"}, ranked by fit</p>
        {hydrated && answers?.concern && concern === answers.concern && <p className="hidden sm:block">Using your check-in: {concernOptions.find((o) => o.value === answers.concern)?.label}</p>}
      </div>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<UserRoundSearch className="h-6 w-6" />}
            title="No one matches all of those filters"
            body="Try removing a filter. Language and availability usually make the biggest difference."
            action={<button onClick={reset} className="focus-ring rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white">Clear filters</button>}
          />
        </div>
      ) : (
        <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((m, k) => (
              <TherapistCard
                key={m.therapist.id}
                m={m}
                rankIndex={k}
                highlight={k === 0}
                onOpen={() => setOpen({ id: m.therapist.id, step: "profile" })}
                onBook={() => setOpen({ id: m.therapist.id, step: "book" })}
              />
            ))}
        </motion.div>
      )}

      <TherapistDrawer m={openMatch} initialStep={open?.step ?? "profile"} onClose={close} />
    </section>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("focus-ring h-10 appearance-none rounded-full border bg-white pl-4 pr-9 text-sm font-medium transition", value !== options[0][0] ? "border-indigo-deep text-indigo-ink" : "border-midnight/10 text-midnight-soft hover:border-indigo/40")}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-mute" />
    </label>
  );
}
