"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CheckInAnswers, Recommendation } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Storage helpers: only NON-sensitive demo state is ever persisted.   */
/* The free-text note is never written to any storage.                 */
/* ------------------------------------------------------------------ */
const LS_KEY = "ydc.demo.v1";
const SS_KEY = "ydc.checkin.v1";

function safeRead<T>(store: "local" | "session", key: string, fallback: T): T {
  try {
    const s = store === "local" ? window.localStorage : window.sessionStorage;
    const v = s.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function safeWrite(store: "local" | "session", key: string, value: unknown) {
  try {
    const s = store === "local" ? window.localStorage : window.sessionStorage;
    s.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode etc. - app keeps working in memory */
  }
}

export interface Booking {
  id: string;
  therapistId: string;
  dayOffset: number;
  time: string;
  format: string;
  createdAt: number;
}
export interface SavedItem {
  id: string; // resource / programme / therapist / rec id
  kind: "resource" | "programme" | "therapist" | "recommendation";
  title: string;
  href: string;
}
interface Persisted {
  saved: SavedItem[];
  bookings: Booking[];
  continueWith: string | null;
  completed: string[];
  feedback: Record<string, { comfortable?: boolean; understood?: boolean; continue?: boolean }>;
}
const emptyPersisted: Persisted = { saved: [], bookings: [], continueWith: null, completed: [], feedback: {} };

interface AppState extends Persisted {
  hydrated: boolean;
  answers: CheckInAnswers | null;
  recommendation: Recommendation | null;
  setCheckIn: (a: CheckInAnswers | null, r: Recommendation | null) => void;
  toggleSave: (item: SavedItem) => void;
  isSaved: (id: string) => boolean;
  addBooking: (b: Omit<Booking, "id" | "createdAt">) => Booking;
  cancelBooking: (id: string) => void;
  setContinueWith: (id: string | null) => void;
  markComplete: (id: string) => void;
  setFeedback: (bookingId: string, f: Persisted["feedback"][string]) => void;
  resetDemo: () => void;
  toast: (msg: string, tone?: "success" | "info") => void;
  safetyOpen: boolean;
  setSafetyOpen: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}

interface Toast { id: number; msg: string; tone: "success" | "info" }

export function Providers({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [p, setP] = useState<Persisted>(emptyPersisted);
  const [answers, setAnswers] = useState<CheckInAnswers | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const tid = useRef(0);

  useEffect(() => {
    setP({ ...emptyPersisted, ...safeRead<Persisted>("local", LS_KEY, emptyPersisted) });
    const a = safeRead<CheckInAnswers | null>("session", SS_KEY, null);
    if (a) setAnswers({ ...a, note: "" });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) safeWrite("local", LS_KEY, p);
  }, [p, hydrated]);

  const toast = useCallback((msg: string, tone: "success" | "info" = "success") => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const value = useMemo<AppState>(() => ({
    ...p,
    hydrated,
    answers,
    recommendation,
    setCheckIn: (a, r) => {
      setAnswers(a);
      setRecommendation(r);
      // Persist structured answers only (no free text) so a refresh can regenerate results.
      if (a) safeWrite("session", SS_KEY, { ...a, note: "" });
      else { try { window.sessionStorage.removeItem(SS_KEY); } catch {} }
    },
    toggleSave: (item) => {
      const exists = p.saved.some((x) => x.id === item.id);
      toast(exists ? "Removed from My Space" : "Saved to My Space", exists ? "info" : "success");
      setP((s) => ({ ...s, saved: exists ? s.saved.filter((x) => x.id !== item.id) : [item, ...s.saved.filter((x) => x.id !== item.id)] }));
    },
    isSaved: (id) => p.saved.some((x) => x.id === id),
    addBooking: (b) => {
      const booking = { ...b, id: `bk-${Date.now()}`, createdAt: Date.now() };
      setP((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
      return booking;
    },
    cancelBooking: (id) => {
      setP((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== id) }));
      toast("Demo booking cancelled", "info");
    },
    setContinueWith: (id) => setP((s) => ({ ...s, continueWith: id })),
    markComplete: (id) => setP((s) => (s.completed.includes(id) ? s : { ...s, completed: [...s.completed, id] })),
    setFeedback: (bid, f) => setP((s) => ({ ...s, feedback: { ...s.feedback, [bid]: { ...s.feedback[bid], ...f } } })),
    resetDemo: () => {
      setP(emptyPersisted);
      setAnswers(null);
      setRecommendation(null);
      try { window.sessionStorage.removeItem(SS_KEY); } catch {}
      toast("Demo data cleared from this browser", "info");
    },
    toast,
    safetyOpen,
    setSafetyOpen,
  }), [p, hydrated, answers, recommendation, toast, safetyOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <Ctx.Provider value={value}>
        {children}
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-midnight px-5 py-3 text-sm font-medium text-white shadow-lift"
              >
                {t.tone === "success" ? <CheckCircle2 className="h-4 w-4 text-sage" /> : <Info className="h-4 w-4 text-lilac" />}
                {t.msg}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Ctx.Provider>
    </MotionConfig>
  );
}
