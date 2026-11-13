"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const lines = ["Reading your check-in…", "Looking across YourDOST support…", "Choosing a gentle place to start…"];

/** AI processing visual: concentric rings, soft particles and a pulsing core. */
export function RingsOrb({ size = 200, active = true }: { size?: number; active?: boolean }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} aria-hidden>
      {[0, 1, 2].map((k) => (
        <motion.span
          key={k}
          className="absolute rounded-full border border-indigo/25"
          style={{ inset: `${k * 12}%` }}
          animate={active ? { scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] } : undefined}
          transition={{ duration: 3.2, repeat: Infinity, delay: k * 0.45, ease: "easeInOut" }}
        />
      ))}
      <motion.div className="absolute inset-0" animate={active ? { rotate: 360 } : undefined} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}>
        {[0, 60, 130, 200, 260, 320].map((deg, k) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ transform: `rotate(${deg}deg) translateX(${size * 0.46}px)`, background: ["#B9A5F5", "#F1BBAA", "#A7C9B4"][k % 3] }}
          />
        ))}
      </motion.div>
      <motion.div
        className="css-orb rounded-full"
        style={{ width: size * 0.42, height: size * 0.42 }}
        animate={active ? { scale: [1, 1.07, 1] } : undefined}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function Processing() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((x) => Math.min(x + 1, lines.length - 1)), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center" role="status" aria-live="polite">
      <RingsOrb size={220} />
      <div className="mt-10 h-7">
        <AnimatePresence mode="wait">
          <motion.p key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-lg font-medium text-midnight">
            {lines[k]}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="mt-2 text-sm text-midnight-mute">This only takes a moment.</p>
    </div>
  );
}
