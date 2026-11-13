"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "../ui";

const Orb3D = dynamic(() => import("./Orb3D"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** CSS/SVG fallback: used while the 3D scene loads, without WebGL, or as a lightweight orb elsewhere. */
export function CssOrb({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <div className={cn("relative grid place-items-center", className)} aria-hidden>
      <div className={cn("absolute inset-[6%] rounded-full border border-indigo/15", animate && "animate-spinslow")}>
        <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-glow" />
        <span className="absolute bottom-[14%] right-[4%] h-2 w-2 rounded-full bg-peach" />
      </div>
      <div className={cn("absolute inset-[16%] rounded-full border border-white/70", animate && "animate-[spinslow_60s_linear_infinite_reverse]")}>
        <span className="absolute left-[8%] top-[20%] h-2.5 w-2.5 rounded-full bg-sage" />
      </div>
      <div className={cn("css-orb aspect-square w-[58%] rounded-full", animate && "animate-breathe")} />
    </div>
  );
}

export function OrbStage({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"pending" | "webgl" | "css">("pending");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const lowPower = (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 3;
    setMode(hasWebGL() && !lowPower ? "webgl" : "css");
  }, []);

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      {/* soft ambient halo */}
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(185,165,245,.55),rgba(230,221,251,0)_70%)] blur-2xl" aria-hidden />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: ready && mode === "webgl" ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <CssOrb className="h-full w-full" animate={!reduce} />
      </motion.div>
      {mode === "webgl" && (
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.1 }}>
          <Orb3D still={Boolean(reduce)} onReady={() => setReady(true)} />
        </motion.div>
      )}
    </div>
  );
}
