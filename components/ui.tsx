"use client";

import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps, type Variants } from "framer-motion";
import Link from "next/link";
import { forwardRef, useRef } from "react";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "soft";
const variants: Record<Variant, string> = {
  primary:
    "bg-midnight text-white shadow-[0_1px_0_rgba(255,255,255,.15)_inset,0_10px_30px_-10px_rgba(37,36,58,.55)] hover:bg-[#2F2E4A]",
  secondary: "bg-white/80 text-midnight border border-midnight/10 shadow-soft hover:bg-white",
  ghost: "text-midnight-soft hover:text-midnight hover:bg-midnight/[0.04]",
  soft: "bg-mist text-indigo-ink hover:bg-[#DDD2FA]",
};
const sizes = { sm: "h-9 px-4 text-sm", md: "h-12 px-6 text-[15px]", lg: "h-14 px-7 text-base" } as const;

interface BtnProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "primary", size = "md", className, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "focus-ring inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant], sizes[size], className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

export function ButtonLink({
  href, variant = "primary", size = "md", className, children, ...rest
}: { href: string; variant?: Variant; size?: keyof typeof sizes; className?: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="inline-flex">
      <Link
        href={href}
        className={cn("focus-ring inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors", variants[variant], sizes[size], className)}
        {...rest}
      >
        {children}
      </Link>
    </motion.span>
  );
}

export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-peach/70 bg-peach/25 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-peach-deep", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-peach-deep/70" />
      {label}
    </span>
  );
}

/** Card with a gentle 3D tilt that follows the pointer (disabled for touch / reduced motion by MotionConfig). */
export function TiltCard({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { x.set(0.5); y.set(0.5); }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};
export const stagger = (d = 0.08): Variants => ({ hidden: {}, show: { transition: { staggerChildren: d } } });

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-midnight/[0.06]", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-mist text-indigo-deep">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-midnight-soft">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
