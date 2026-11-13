// YourDOST Match: two-stage, explainable therapist matching (Task 2 engine, used live in Task 3).
// Weights are initial product hypotheses, NOT clinically validated.
import type { Concern, Language, SessionFormat, Therapist } from "./types.ts";

export const WEIGHTS = {
  specialisation: 0.35,
  preference: 0.2,
  language: 0.15,
  availability: 0.15,
  format: 0.1,
  experience: 0.05,
} as const;

export interface MatchPrefs {
  concern: Concern | null;
  language?: Language | "any";
  gender?: "woman" | "man" | "any";
  format?: SessionFormat | "any";
  /** "soon" = within 48h, "week" = within 7 days */
  when?: "soon" | "week" | "any";
  orgCoveredOnly?: boolean;
  /** Therapist the user already saw and wants to continue with */
  continueWith?: string | null;
}

export interface MatchResult {
  therapist: Therapist;
  score: number; // 0-100
  parts: Record<keyof typeof WEIGHTS, number>; // each 0-1
  reasons: string[];
  continuity: boolean;
}

const RELATED: Partial<Record<Concern, Concern[]>> = {
  stress: ["work_academic", "sleep", "anxiety"],
  anxiety: ["stress", "confidence"],
  low_mood: ["relationships", "confidence"],
  work_academic: ["stress", "confidence"],
  sleep: ["stress", "anxiety"],
  confidence: ["anxiety", "low_mood"],
  relationships: ["low_mood"],
};

const concernWords: Record<Concern, string> = {
  stress: "stress and overwhelm",
  anxiety: "anxiety and worry",
  low_mood: "low mood",
  work_academic: "work or academic pressure",
  relationships: "relationships",
  sleep: "sleep",
  confidence: "confidence and self-esteem",
  other: "a range of concerns",
};

function firstSlotDay(t: Therapist) {
  return Math.min(...t.slots.map((s) => s.day));
}

/** Stage 1: hard eligibility filters. Returns eligible therapists. */
export function eligible(list: Therapist[], p: MatchPrefs): Therapist[] {
  return list.filter((t) => {
    if (!t.verified) return false;
    if (p.concern && p.concern !== "other") {
      const covers = t.specialisations.includes(p.concern) || (RELATED[p.concern] ?? []).some((c) => t.specialisations.includes(c));
      if (!covers) return false;
    }
    if (p.language && p.language !== "any" && !t.languages.includes(p.language)) return false;
    if (p.gender && p.gender !== "any" && t.gender !== p.gender) return false;
    if (p.format && p.format !== "any" && !t.formats.includes(p.format)) return false;
    if (p.orgCoveredOnly && !t.orgCovered) return false;
    if (t.slots.length === 0) return false;
    return true;
  });
}

/** Stage 2: weighted, explainable ranking. */
export function rank(list: Therapist[], p: MatchPrefs): MatchResult[] {
  const results = eligible(list, p).map((t) => {
    const spec = !p.concern || p.concern === "other"
      ? (t.specialisations.includes("other") ? 0.8 : 0.6)
      : t.specialisations[0] === p.concern ? 1
      : t.specialisations.includes(p.concern) ? 0.85
      : 0.5;
    // Preference fit: soft prefs that were not used as hard filters + explicit feedback signal
    const fb = Math.min(1, Math.max(0, (t.feedback.fit - 4) / 1));
    const pref = 0.6 * fb + 0.4 * t.continuityRate;
    // No stated preference = neutral (1). A stated preference is a hard filter in Stage 1, so survivors also score 1.
    // Kept as a weighted factor so partial matches (e.g. second-preferred language) can be scored in future.
    const lang = 1;
    const day = firstSlotDay(t);
    const avail = p.when === "soon" ? (day <= 1 ? 1 : day <= 2 ? 0.6 : 0.2) : day === 0 ? 1 : day <= 2 ? 0.85 : day <= 4 ? 0.65 : 0.45;
    const fmt = 1;
    const exp = Math.min(1, t.years / 10);
    const parts = { specialisation: spec, preference: pref, language: lang, availability: avail, format: fmt, experience: exp };
    let score = Object.entries(parts).reduce((s, [k, v]) => s + v * WEIGHTS[k as keyof typeof WEIGHTS], 0) * 100;
    const continuity = p.continueWith === t.id;
    if (continuity) score = Math.min(100, score + 15); // continuity boost, visible in reasons

    const reasons: string[] = [];
    if (continuity) reasons.push("You chose to continue with this professional");
    if (p.concern && t.specialisations.includes(p.concern)) reasons.push(`Focuses on ${concernWords[p.concern]}`);
    else if (p.concern && p.concern !== "other") reasons.push(`Works with related concerns (${t.focusLabel.toLowerCase()})`);
    if (p.language && p.language !== "any") reasons.push(`Speaks ${p.language}`);
    if (day <= 1) reasons.push(day === 0 ? "Has a slot available today" : "Available tomorrow");
    if (p.format && p.format !== "any") reasons.push(`Offers ${p.format} sessions`);
    if (t.feedback.fit >= 4.7) reasons.push("People often say they felt understood");
    return { therapist: t, score: Math.round(score), parts, reasons: reasons.slice(0, 3), continuity };
  });
  return results.sort((a, b) => b.score - a.score || b.therapist.years - a.therapist.years);
}
