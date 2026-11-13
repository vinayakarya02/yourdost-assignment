"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LifeBuoy, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./providers";
import { cn } from "./ui";

const nav = [
  { href: "/check-in", label: "Check-in" },
  { href: "/therapists", label: "Therapists" },
  { href: "/library", label: "Library" },
  { href: "/my-space", label: "My Space" },
];

export function Logo() {
  return (
    <Link href="/" className="focus-ring group flex items-center gap-2.5 rounded-full" aria-label="YourDOST Wellbeing Compass home">
      <span className="relative grid h-8 w-8 place-items-center">
        <span className="css-orb absolute inset-0 rounded-full transition-transform duration-700 group-hover:scale-110" />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-bold tracking-tight text-midnight">YourDOST</span>
        <span className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em] text-indigo-deep sm:tracking-[0.18em]">Wellbeing Compass</span>
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { setSafetyOpen, saved, bookings, hydrated } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const count = hydrated ? saved.length + bookings.length : 0;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={cn("sticky top-0 z-50 transition-all duration-500", scrolled ? "glass border-x-0 border-t-0 shadow-[0_1px_0_rgba(37,36,58,.05)]" : "border-b border-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={cn("focus-ring relative rounded-full px-4 py-2 text-sm font-medium transition-colors", active ? "text-midnight" : "text-midnight-mute hover:text-midnight")}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white shadow-soft" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative flex items-center gap-1.5">
                  {n.label}
                  {n.href === "/my-space" && count > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-indigo-deep px-1 text-[10px] font-bold text-white">{count}</span>}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setSafetyOpen(true)} className="focus-ring inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-peach/70 bg-peach/20 px-3 py-2 text-[13px] font-semibold text-peach-deep transition hover:bg-peach/35 sm:px-3.5" aria-label="Need help now?">
            <LifeBuoy className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Need help now?</span><span className="sm:hidden">Get help</span>
          </button>
          <button onClick={() => setOpen((v) => !v)} className="focus-ring grid h-10 w-10 place-items-center rounded-full text-midnight md:hidden" aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-midnight/5 bg-ivory/95 backdrop-blur md:hidden" aria-label="Mobile">
            <div className="flex flex-col px-4 py-3">
              {[{ href: "/", label: "Home" }, ...nav, { href: "/support", label: "Support & privacy" }].map((n) => (
                <Link key={n.href} href={n.href} className="focus-ring rounded-2xl px-3 py-3.5 text-[15px] font-medium text-midnight hover:bg-white">
                  {n.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-midnight/5">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-midnight-mute">
            Wellbeing Compass helps you find a next step within YourDOST. It is not a therapist, a diagnosis or a crisis
            service. A product prototype built for a PM assignment; all people and content are fictional demo data.
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Explore</p>
          <ul className="space-y-2 text-midnight-soft">
            <li><Link className="hover:text-midnight" href="/check-in">Start a check-in</Link></li>
            <li><Link className="hover:text-midnight" href="/therapists">Find a therapist</Link></li>
            <li><Link className="hover:text-midnight" href="/library">Resource library</Link></li>
            <li><Link className="hover:text-midnight" href="/my-space">My Space</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Trust</p>
          <ul className="space-y-2 text-midnight-soft">
            <li><Link className="hover:text-midnight" href="/support">Get help now</Link></li>
            <li><Link className="hover:text-midnight" href="/support#privacy">How we handle your data</Link></li>
            <li><Link className="hover:text-midnight" href="/support#how">How recommendations work</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
