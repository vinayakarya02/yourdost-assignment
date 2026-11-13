"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HeartHandshake, Phone, ShieldCheck, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { crisisContacts } from "@/data/crisis";
import { useApp } from "./providers";
import { cn } from "./ui";

/** The compassionate, direct crisis panel. Rendered by deterministic rules, never by the AI. */
export function CrisisPanel({ compact = false, message }: { compact?: boolean; message?: string }) {
  return (
    <div className={cn("rounded-4xl border border-peach/60 bg-white shadow-lift", compact ? "p-6" : "p-7 sm:p-10")}>
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-peach/35 text-peach-deep">
          <HeartHandshake className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h2 className={cn("font-semibold tracking-tight text-midnight", compact ? "text-xl" : "text-2xl sm:text-3xl")}>
            You don&apos;t have to go through this alone.
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-midnight-soft">
            {message ??
              "If you're thinking about harming yourself, or you feel unsafe right now, please contact someone who can help immediately."}{" "}
            If you can, reach out to someone you trust and let them know how you&apos;re feeling.
          </p>
        </div>
      </div>

      <ul className="mt-7 grid gap-3 sm:grid-cols-2">
        {crisisContacts.map((c) => (
          <li key={c.number}>
            <a
              href={`tel:${c.tel}`}
              className="focus-ring group flex h-full items-start gap-3 rounded-3xl border border-midnight/10 bg-ivory/70 p-5 transition hover:border-indigo/40 hover:bg-white"
            >
              <Phone className="mt-0.5 h-5 w-5 text-indigo-deep" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-midnight-soft">{c.name}</span>
                <span className="block text-2xl font-semibold tracking-tight text-midnight">{c.number}</span>
                <span className="mt-1 block text-[13px] leading-snug text-midnight-mute">{c.note}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-3 rounded-3xl bg-mist/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 text-indigo-deep" aria-hidden />
          <p className="text-sm leading-relaxed text-midnight">
            <span className="font-semibold">Talk to a person at YourDOST.</span> In the live product this connects to the
            on-duty human support team. <span className="text-midnight-mute">(Simulated in this demo.)</span>
          </p>
        </div>
        <Link href="/support#human" className="focus-ring shrink-0 rounded-full bg-midnight px-5 py-2.5 text-center text-sm font-semibold text-white">
          Request human support
        </Link>
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs text-midnight-mute">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Wellbeing Compass can&apos;t assess or manage an emergency. These
        services can. Numbers are public Government of India services; verify locally before launch.
      </p>
    </div>
  );
}

export function SafetySheet() {
  const { safetyOpen, setSafetyOpen } = useApp();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!safetyOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSafetyOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [safetyOpen, setSafetyOpen]);

  return (
    <AnimatePresence>
      {safetyOpen && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-midnight/40 backdrop-blur-sm" onClick={() => setSafetyOpen(false)} aria-hidden />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Get help now"
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-4xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button ref={closeRef} onClick={() => setSafetyOpen(false)} className="focus-ring absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-ivory text-midnight hover:bg-mist" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <CrisisPanel compact />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
