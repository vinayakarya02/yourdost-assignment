"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Eye, Lock, MessagesSquare, Sprout, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { OrbStage } from "@/components/orb/OrbStage";
import { ButtonLink, Reveal, TiltCard, fadeUp, stagger } from "@/components/ui";

const categories = [
  { title: "Talk to a therapist", body: "A private conversation with a verified professional who fits what you need.", href: "/therapists", icon: MessagesSquare, tone: "from-lilac/45 to-mist/40", ink: "text-indigo-ink" },
  { title: "Explore self-help", body: "Short reads, videos and guided activities you can do at your own pace.", href: "/library", icon: BookOpen, tone: "from-sage/50 to-sage/10", ink: "text-sage-deep" },
  { title: "Understand how I'm feeling", body: "Gentle self-reflection to notice patterns. Not a test, never a diagnosis.", href: "/library?kind=assessment", icon: Eye, tone: "from-peach/50 to-peach/10", ink: "text-peach-deep" },
  { title: "Join a wellbeing programme", body: "Structured two-to-three-week programmes for sleep, stress and more.", href: "/library?kind=programme", icon: Sprout, tone: "from-mist to-white/40", ink: "text-indigo-deep" },
];

const steps = [
  { n: "01", t: "Check in", d: "Five short questions, one at a time. Skip the optional ones. No sign-up, no personal details." },
  { n: "02", t: "See a place to start", d: "One clear suggestion with the reasons behind it, plus a couple of alternatives. Nothing is decided for you." },
  { n: "03", t: "Take a small step", d: "Book a counsellor, start an exercise or save it for later. Come back and adjust whenever you like." },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-8 sm:px-6 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:px-8 lg:pb-24 lg:pt-16">
          <motion.div style={{ y: textY }} variants={stagger(0.11)} initial="hidden" animate="show" className="relative z-10 order-2 lg:order-1">
            <motion.p variants={fadeUp} className="eyebrow flex items-center gap-2">
              <span className="h-px w-8 bg-indigo-deep/50" /> YourDOST Wellbeing Compass
            </motion.p>
            <motion.h1 variants={fadeUp} className="display mt-5 text-[2.9rem] sm:text-6xl lg:text-[5.1rem]">
              Your mind deserves <span className="relative whitespace-nowrap text-indigo-deep">a little space<span className="text-midnight">.</span></span>
            </motion.h1>
            <motion.p variants={fadeUp} className="lead mt-6 max-w-[34rem] sm:text-lg">
              A gentle place to understand what you&apos;re feeling and find the support that feels right.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/check-in" size="lg" className="w-full sm:w-auto">
                Find my next step <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#explore" variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore wellbeing
              </ButtonLink>
            </motion.div>
            <motion.ul variants={fadeUp} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-midnight-mute">
              <li className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Private by design</li>
              <li className="flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" /> No sign-up to try</li>
              <li className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Real people, when you want them</li>
            </motion.ul>
          </motion.div>

          <motion.div style={{ y: orbY }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="relative order-1 mx-auto w-[78%] max-w-[560px] sm:w-[62%] lg:order-2 lg:w-full">
            <OrbStage />
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 0.8 }} className="glass absolute -left-2 bottom-[16%] hidden rounded-3xl px-4 py-3 shadow-soft sm:block lg:-left-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-midnight-mute">Today</p>
              <p className="text-sm font-semibold text-midnight">One small step is enough.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="glass absolute -right-1 top-[14%] hidden items-center gap-2.5 rounded-full py-2 pl-2 pr-4 shadow-soft sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-sage/50 text-sage-deep"><Compass className="h-4 w-4" /></span>
              <span className="text-[13px] font-semibold text-midnight">Guided, never pushed</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* INTRO + CATEGORIES */}
      <section id="explore" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Not sure where to start?</p>
            <h2 className="h2 mt-4 max-w-xl">Your wellbeing journey starts with one small step.</h2>
          </div>
          <p className="lead max-w-lg lg:justify-self-end">
            You don&apos;t need to have everything figured out. Tell us what&apos;s been on your mind, and we&apos;ll help you explore the support that feels right.
          </p>
        </Reveal>

        <motion.div variants={stagger(0.09)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <motion.div key={c.title} variants={fadeUp}>
              <TiltCard className="h-full">
                <Link href={c.href} className="focus-ring group relative flex h-full flex-col overflow-hidden rounded-4xl border border-white/80 bg-white/75 p-6 shadow-soft transition-shadow duration-500 hover:shadow-lift">
                  <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${c.tone} blur-2xl transition-transform duration-700 group-hover:scale-125`} aria-hidden />
                  <div className={`relative grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft ${c.ink}`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="relative mt-10 text-lg font-semibold tracking-tight">{c.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-midnight-soft">{c.body}</p>
                  <span className="relative mt-6 inline-flex items-center gap-1 text-sm font-semibold text-indigo-deep">
                    Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-5xl bg-midnight px-6 py-14 text-white sm:px-12 lg:px-16 lg:py-20">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo/40 blur-3xl" aria-hidden />
          <div className="absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-sage/20 blur-3xl" aria-hidden />
          <Reveal className="relative max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-label text-lilac">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] sm:text-[2.6rem] sm:leading-[1.1]">A calm, three-minute way to find your footing.</h2>
          </Reveal>
          <div className="relative mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="border-t border-white/15 pt-6">
                  <p className="text-sm font-semibold text-lilac">{s.n}</p>
                  <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="relative mt-12">
            <ButtonLink href="/check-in" variant="secondary" size="lg" className="border-white/20 bg-white text-midnight">
              Start my check-in <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Your words stay yours", d: "Anything you type is used once to shape suggestions and is never stored by this prototype." },
            { t: "Guidance, not diagnosis", d: "We never label you or score how you feel. We help you find a next step within YourDOST." },
            { t: "A person is always an option", d: "If things feel urgent, Wellbeing Compass steps aside and shows you how to reach people who can help." },
          ].map((x, i) => (
            <Reveal key={x.t} delay={i * 0.08}>
              <div className="card h-full p-7">
                <h3 className="text-base font-semibold">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-midnight-soft">{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
