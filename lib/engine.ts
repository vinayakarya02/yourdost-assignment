// Deterministic, rule-based recommendation engine.
// Used when no LLM key is configured, when the LLM fails, and as the source of the
// candidate set the LLM is allowed to choose from. Never diagnoses; never scores severity.
import type { CheckInAnswers, Concern, NextStepType, Recommendation } from "./types.ts";
import { labelFor } from "./checkin.ts";
import { screenText } from "./safety.ts";
import { programmes, resources } from "../data/resources.ts";
import { therapists } from "../data/therapists.ts";
import { rank } from "./matching.ts";

const concernPhrase: Record<Concern, string> = {
  stress: "stress and feeling overwhelmed",
  anxiety: "worry and anxious thoughts",
  low_mood: "a low mood",
  work_academic: "pressure at work or in your studies",
  relationships: "challenges in your relationships",
  sleep: "difficulty sleeping",
  confidence: "confidence and how you see yourself",
  other: "something that's been weighing on you",
};

const needsByConcern: Record<Concern, string[]> = {
  stress: ["Space to slow down", "Practical ways to ease the load"],
  anxiety: ["Tools to settle worry in the moment", "Understanding what keeps worry going"],
  low_mood: ["Gentle ways to rebuild energy", "Someone to talk things through with"],
  work_academic: ["Managing workload and expectations", "Recovery time between demands"],
  relationships: ["Support with difficult conversations", "Feeling more connected"],
  sleep: ["A calmer evening routine", "Understanding what's keeping you up"],
  confidence: ["Kinder self-talk", "Small confidence-building steps"],
  other: ["Making sense of what you're feeling", "Finding the right kind of support"],
};

const programmeFor: Record<Concern, string> = {
  stress: "p-stress-reset", anxiety: "p-calm-mind", low_mood: "p-gratitude", work_academic: "p-stress-reset",
  relationships: "p-connection", sleep: "p-sleep", confidence: "p-gratitude", other: "p-gratitude",
};

const activityFor: Record<Concern, string> = {
  stress: "r-box-breathing", anxiety: "r-grounding-video", low_mood: "r-low-mood-activity", work_academic: "r-micro-breaks",
  relationships: "r-connection-activity", sleep: "r-sleep-wind-down", confidence: "r-self-compassion", other: "r-self-compassion",
};

const assessmentFor: Record<Concern, string> = {
  stress: "a-stress-check", anxiety: "a-reflection", low_mood: "a-reflection", work_academic: "a-stress-check",
  relationships: "a-reflection", sleep: "a-sleep-diary", confidence: "a-reflection", other: "a-reflection",
};

/** How much would a conversation with a professional likely help? 0..7. Never shown to the user. */
function supportSignal(a: CheckInAnswers) {
  const impact = { not_much: 0, sometimes: 1, routine: 2, function: 3 }[a.impact!];
  const state = { okay: 0, stuck: 1, overwhelmed: 1, struggling: 3 }[a.state!];
  const dur = a.duration === "months" ? 1 : 0;
  return impact + state + dur;
}

export function pickResources(concern: Concern, primaryId?: string): string[] {
  const pool = resources.filter((r) => r.concerns.includes(concern) && r.kind !== "assessment" && r.id !== primaryId);
  const byKind = (k: string) => pool.find((r) => r.kind === k);
  const picks = [byKind("video"), byKind("article"), byKind("activity")].filter(Boolean).map((r) => r!.id);
  for (const r of pool) if (picks.length < 3 && !picks.includes(r.id)) picks.push(r.id);
  return picks.slice(0, 3);
}

export function stepsFor(concern: Concern) {
  const match = rank(therapists, { concern })[0];
  const programme = programmes.find((p) => p.id === programmeFor[concern])!;
  const activity = resources.find((r) => r.id === activityFor[concern])!;
  const assessment = resources.find((r) => r.id === assessmentFor[concern])!;

  const steps: Record<NextStepType, Recommendation["nextStep"]> = {
    counselling: {
      type: "counselling", title: "Book a first conversation with a counsellor",
      description: `A private 50-minute session with someone experienced in ${concernPhrase[concern]}. You can share as much or as little as you like.`,
      cta: "See my suggested counsellor", href: `/therapists?focus=${match?.therapist.id ?? ""}`,
    },
    programme: {
      type: "programme", title: `Start the ${programme.name} programme`,
      description: `${programme.description} About ${programme.minutesPerDay} minutes a day for ${programme.weeks} weeks.`,
      cta: "Preview the programme", href: `/library?open=${programme.id}`,
    },
    guided_exercise: {
      type: "guided_exercise", title: `Try "${activity.title}"`,
      description: `${activity.summary} Takes about ${activity.minutes} minutes.`,
      cta: "Start the exercise", href: `/library?open=${activity.id}`,
    },
    assessment: {
      type: "assessment", title: `Take the "${assessment.title}"`,
      description: `${assessment.summary.replace(" Not a diagnosis.", "")} It's a reflection tool, not a test or a diagnosis.`,
      cta: "Start reflecting", href: `/library?open=${assessment.id}`,
    },
    resources: {
      type: "resources", title: "Explore a few resources picked for you",
      description: `Short reads and videos on ${concernPhrase[concern]}, to go through at your own pace.`,
      cta: "Open my resources", href: `/library?category=${concern}`,
    },
  };

  return { steps, match, programme, activity };
}

export function crisisRecommendation(): Recommendation {
  return {
    source: "rules",
    safety: {
      level: "urgent",
      message:
        "It sounds like you might be going through something really painful right now. You deserve support straight away, from a person rather than an app.",
    },
    summary: "", supportNeeds: [],
    nextStep: { type: "counselling", title: "Reach out to someone now", description: "", cta: "See support options", href: "/support" },
    category: "therapist", reasons: [], professionalSupport: { worthConsidering: true, note: "" },
    resourceIds: [], programmeId: "", therapistId: "", uncertainty: "",
  };
}

export function recommend(a: CheckInAnswers): Recommendation {
  if (screenText(a.note).urgent) return crisisRecommendation();
  const concern = a.concern ?? "other";
  const signal = supportSignal(a);
  const worthConsidering = signal >= 3 || a.support === "professional";

  let type: NextStepType;
  if (a.support === "professional") type = "counselling";
  else if (signal >= 4 && a.support !== "independent") type = "counselling";
  else if (a.support === "guided") type = concern === "sleep" ? "programme" : signal >= 2 ? "programme" : "guided_exercise";
  else if (a.support === "independent") type = signal >= 4 ? "assessment" : "resources";
  else type = concern === "sleep" ? "programme" : signal >= 3 ? "counselling" : "assessment";

  const { steps, match, programme, activity } = stepsFor(concern);

  const reasons: string[] = [`You mentioned ${concernPhrase[concern]}.`];
  if (a.duration === "months") reasons.push("You've been feeling this way for a few months, so steady, ongoing support may help more than a one-off tip.");
  else if (a.duration === "days") reasons.push("It's been a few days, so a light first step is a good place to start.");
  else if (a.duration === "weeks") reasons.push("It's been a few weeks, long enough that some structure may be useful.");
  if (a.impact === "routine") reasons.push("You said it's affecting your daily routine, so something practical and regular may help.");
  if (a.impact === "function") reasons.push("You said it's making it difficult to function day to day. That matters, and you deserve support with it.");
  const prefReason: Record<string, string> = {
    professional: "You said you'd feel comfortable talking to a professional.",
    independent: "You prefer exploring things at your own pace, so we've kept this self-directed.",
    guided: "You said guided exercises would suit you.",
    unsure: "You weren't sure what you'd prefer, so we've suggested something low-effort to try first.",
  };
  reasons.push(prefReason[a.support!]);

  const profNote = worthConsidering
    ? a.support === "professional"
      ? "A counsellor can help you understand what you're experiencing and work through it together."
      : "Based on what you shared, talking to a counsellor may also be worth considering. It's your choice, and there's no pressure."
    : "Self-help may be a good place to start. If things feel harder, talking to someone is always an option.";

  return {
    source: "rules",
    safety: { level: a.state === "struggling" && a.impact === "function" ? "elevated" : "none", message: "" },
    summary: `You've been dealing with ${concernPhrase[concern]}${a.duration && a.duration !== "na" ? ` for ${labelFor("duration", a.duration).toLowerCase()}` : ""}, and right now you ${labelFor("state", a.state).replace(/^I /, "").replace(/^am /, "are ").replace(/^feel /, "feel ").toLowerCase()}. Thank you for taking a moment to check in. That's a meaningful first step.`,
    supportNeeds: needsByConcern[concern],
    nextStep: steps[type],
    category: type === "counselling" ? "therapist" : type === "programme" ? "programme" : type === "assessment" ? "assessment" : "self_help",
    reasons,
    professionalSupport: { worthConsidering, note: profNote },
    resourceIds: pickResources(concern, activity.id === steps[type].href.split("open=")[1] ? activity.id : undefined),
    programmeId: programme.id,
    therapistId: match?.therapist.id ?? therapists[0].id,
    uncertainty: "These suggestions are based only on the few answers you gave, so they may not capture everything. You can explore other options at any time.",
  };
}
