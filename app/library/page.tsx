"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Compass, Leaf, PlayCircle, Search, SearchX, Sprout } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/providers";
import { ResourceModal, type LibraryItem } from "@/components/resource-modal";
import { DemoBadge, EmptyState, Skeleton, cn } from "@/components/ui";
import { categoryLabels, kindLabels, programmeById, programmes, resourceById, resources } from "@/data/resources";
import type { Concern, ResourceCategory, ResourceKind } from "@/lib/types";

const concernToCategory: Partial<Record<Concern, ResourceCategory>> = {
  stress: "stress", anxiety: "anxiety", low_mood: "resilience", work_academic: "workplace",
  relationships: "relationships", sleep: "sleep", confidence: "resilience",
};
const programmeCategory: Record<string, ResourceCategory> = {
  "p-stress-reset": "stress", "p-sleep": "sleep", "p-calm-mind": "anxiety", "p-gratitude": "resilience", "p-connection": "relationships",
};
const kindIcon: Record<ResourceKind, React.ReactNode> = {
  article: <BookOpen className="h-5 w-5" />, video: <PlayCircle className="h-5 w-5" />, activity: <Leaf className="h-5 w-5" />,
  assessment: <Compass className="h-5 w-5" />, programme: <Sprout className="h-5 w-5" />,
};
const kindTone: Record<ResourceKind, string> = {
  article: "from-mist to-white", video: "from-lilac/50 to-mist/40", activity: "from-sage/50 to-sage/10",
  assessment: "from-peach/45 to-peach/10", programme: "from-indigo/25 to-lilac/20",
};

type Card = { id: string; title: string; summary: string; kind: ResourceKind; category: ResourceCategory; minutes: string };
const allCards: Card[] = [
  ...programmes.map((p) => ({ id: p.id, title: p.name, summary: p.description, kind: "programme" as const, category: programmeCategory[p.id], minutes: `${p.weeks} wks · ${p.minutesPerDay} min/day` })),
  ...resources.map((r) => ({ id: r.id, title: r.title, summary: r.summary, kind: r.kind, category: r.category, minutes: `${r.minutes} min` })),
];

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16"><Skeleton className="h-96" /></div>}>
      <Library />
    </Suspense>
  );
}

function Library() {
  const params = useSearchParams();
  const router = useRouter();
  const { completed, hydrated } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ResourceCategory | "all">("all");
  const [kind, setKind] = useState<ResourceKind | "all">("all");
  const [open, setOpen] = useState<LibraryItem | null>(null);

  useEffect(() => {
    const c = params.get("category");
    if (c) setCat((categoryLabels as Record<string, string>)[c] ? (c as ResourceCategory) : concernToCategory[c as Concern] ?? "all");
    const k = params.get("kind");
    if (k && (kindLabels as Record<string, string>)[k]) setKind(k as ResourceKind);
    const o = params.get("open");
    if (o) {
      const r = resourceById(o); const p = programmeById(o);
      if (r) setOpen({ type: "resource", r }); else if (p) setOpen({ type: "programme", p });
    }
  }, [params]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return allCards.filter((c) => (cat === "all" || c.category === cat) && (kind === "all" || c.kind === kind) && (!s || `${c.title} ${c.summary} ${categoryLabels[c.category]}`.toLowerCase().includes(s)));
  }, [q, cat, kind]);

  const openCard = (c: Card) => {
    const r = resourceById(c.id); const p = programmeById(c.id);
    setOpen(r ? { type: "resource", r } : { type: "programme", p: p! });
  };
  const close = useCallback(() => {
    setOpen(null);
    if (params.get("open")) router.replace("/library", { scroll: false });
  }, [params, router]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Wellbeing library</p>
          <h1 className="display mt-3 text-4xl sm:text-[3.4rem]">Small things that help.</h1>
          <p className="lead mt-4 max-w-2xl">Articles, short videos, guided activities, reflections and programmes. Most take under ten minutes.</p>
        </div>
        <DemoBadge label="Demo content" className="self-start lg:self-auto" />
      </div>

      <div className="mt-8 space-y-3">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search the library</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sleep, breathing, exams…" className="input h-12 rounded-full pl-11" />
        </label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Categories">
          {(["all", ...Object.keys(categoryLabels)] as (ResourceCategory | "all")[]).map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("focus-ring relative h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors", cat === c ? "text-white" : "bg-white/70 text-midnight-soft hover:bg-white")}>
              {cat === c && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-midnight" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{c === "all" ? "All topics" : categoryLabels[c]}</span>
            </button>
          ))}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {(["all", "article", "video", "activity", "assessment", "programme"] as (ResourceKind | "all")[]).map((k) => (
            <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={cn("focus-ring h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition", kind === k ? "border-indigo-deep bg-mist text-indigo-ink" : "border-midnight/10 text-midnight-mute hover:text-midnight")}>
              {{ all: "All formats", article: "Articles", video: "Videos", activity: "Guided activities", assessment: "Self-reflection", programme: "Programmes" }[k]}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-midnight-mute" aria-live="polite">{list.length} {list.length === 1 ? "item" : "items"}</p>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={<SearchX className="h-6 w-6" />} title="Nothing found" body="Try a different word, or browse all topics." action={<button onClick={() => { setQ(""); setCat("all"); setKind("all"); }} className="focus-ring rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white">Show everything</button>} />
        </div>
      ) : (
        <motion.div layout className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <motion.button
                layout key={c.id} onClick={() => openCard(c)}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="focus-ring group relative flex h-full flex-col overflow-hidden rounded-4xl border border-white/80 bg-white/80 p-6 text-left shadow-soft transition-shadow duration-500 hover:shadow-lift"
              >
                <div className={cn("absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br blur-2xl transition-transform duration-700 group-hover:scale-125", kindTone[c.kind])} aria-hidden />
                <div className="relative flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-indigo-deep shadow-soft">{kindIcon[c.kind]}</span>
                  {hydrated && completed.includes(c.id) && <span className="inline-flex items-center gap-1 rounded-full bg-sage/40 px-2 py-0.5 text-[11px] font-semibold text-sage-deep"><CheckCircle2 className="h-3 w-3" /> Done</span>}
                </div>
                <p className="relative mt-6 text-[11px] font-semibold uppercase tracking-wider text-midnight-mute">{kindLabels[c.kind]} · {categoryLabels[c.category]}</p>
                <h3 className="relative mt-1.5 text-lg font-semibold leading-snug tracking-tight">{c.title}</h3>
                <p className="relative mt-2 line-clamp-2 text-sm leading-relaxed text-midnight-soft">{c.summary}</p>
                <p className="relative mt-auto pt-5 text-xs font-semibold text-indigo-deep">{c.minutes}</p>
              </motion.button>
            ))}
        </motion.div>
      )}

      <ResourceModal item={open} onClose={close} />
    </section>
  );
}
