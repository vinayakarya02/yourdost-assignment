"use client";

import { motion } from "framer-motion";
import { Brain, Database, EyeOff, Scale, ShieldCheck, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/providers";
import { CrisisPanel } from "@/components/safety";
import { Button, Reveal } from "@/components/ui";

export default function Support() {
  const { toast, resetDemo } = useApp();
  const [requested, setRequested] = useState(false);
  return (
    <section className="mx-auto max-w-4xl px-4 pb-10 pt-10 sm:px-6 lg:pt-14">
      <p className="eyebrow">Support & trust</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">If you need help right now</h1>
      <p className="lead mt-3 max-w-2xl">Wellbeing Compass is a guide, not an emergency service. If you&apos;re in danger or thinking of harming yourself, please contact one of these services or someone you trust.</p>

      <div className="mt-8"><CrisisPanel /></div>

      <Reveal>
        <div id="human" className="mt-6 scroll-mt-24 rounded-4xl border border-white/80 bg-white/80 p-7 shadow-soft">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Users className="h-5 w-5 text-indigo-deep" /> Talk to a person at YourDOST</h2>
          <p className="mt-2 text-sm leading-relaxed text-midnight-soft">In the live product, this sends a request to YourDOST&apos;s on-duty support team, who reach out through your registered contact. In this prototype nothing is sent.</p>
          {requested ? (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-sage/30 p-4 text-sm font-medium text-sage-deep">
              Demo request recorded. In the live product, someone from the support team would contact you shortly. If it&apos;s urgent, please call 112 or Tele-MANAS (14416) now.
            </motion.p>
          ) : (
            <Button className="mt-4" onClick={() => { setRequested(true); toast("Demo support request recorded"); }}>Request a call back (demo)</Button>
          )}
        </div>
      </Reveal>

      <Reveal>
        <div id="how" className="mt-16 scroll-mt-24">
          <p className="eyebrow">How recommendations work</p>
          <h2 className="h2 mt-3">Transparent by design.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { i: <ShieldCheck className="h-5 w-5" />, t: "Safety rules run first", d: "Before any AI is used, a fixed set of rules checks for urgent phrases. If found, suggestions stop and this page's contacts are shown." },
              { i: <Brain className="h-5 w-5" />, t: "AI only helps you navigate", d: "When enabled, an AI model reads your answers on our server and chooses from YourDOST's existing options. It can't diagnose, and its output is checked against rules." },
              { i: <Scale className="h-5 w-5" />, t: "Works without AI", d: "If AI is unavailable, a transparent rule-based engine gives the same kinds of suggestions, so you're never stuck." },
              { i: <Users className="h-5 w-5" />, t: "Therapists ranked by fit", d: "Matches weigh specialisation, your preferences, language, availability, format and experience, and every card says why." },
            ].map((x) => (
              <div key={x.t} className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-mist text-indigo-deep">{x.i}</span>
                <h3 className="mt-4 font-semibold">{x.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-midnight-soft">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div id="privacy" className="mt-16 scroll-mt-24">
          <p className="eyebrow">Privacy</p>
          <h2 className="h2 mt-3">What happens to your answers.</h2>
          <ul className="mt-8 space-y-3">
            {[
              { i: <EyeOff className="h-5 w-5" />, t: "Your free-text note is never stored.", d: "It's held in memory, sent once over HTTPS to generate suggestions, and never written to storage, logs or analytics." },
              { i: <Database className="h-5 w-5" />, t: "Only multiple-choice answers stay, and only for this tab.", d: "They're kept in session storage so a refresh doesn't lose your results. Closing the tab clears them." },
              { i: <Database className="h-5 w-5" />, t: "Saved items and demo bookings live in your browser.", d: "Nothing is sent to a database in this prototype. No names, emails or phone numbers are collected." },
              { i: <ShieldCheck className="h-5 w-5" />, t: "No labels, no scores.", d: "We never assign a diagnosis or a clinical severity score, and AI is never used to decide whether you're 'at risk'." },
            ].map((x) => (
              <li key={x.t} className="flex gap-4 rounded-3xl bg-white/70 p-5">
                <span className="text-indigo-deep">{x.i}</span>
                <div><p className="font-semibold">{x.t}</p><p className="mt-1 text-sm leading-relaxed text-midnight-soft">{x.d}</p></div>
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-6" onClick={resetDemo}><Trash2 className="h-4 w-4" /> Clear all demo data from this browser</Button>
        </div>
      </Reveal>
    </section>
  );
}
