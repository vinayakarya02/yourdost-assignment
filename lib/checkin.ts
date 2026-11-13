import type { CheckInAnswers, Concern, Duration, EmotionalState, Impact, SupportPref } from "./types.ts";

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon: string; // lucide icon name, resolved in the UI
  tone: "lilac" | "sage" | "peach" | "mist" | "indigo";
}

export interface Question<K extends keyof CheckInAnswers = keyof CheckInAnswers> {
  key: K;
  eyebrow: string;
  title: string;
  helper: string;
  options?: Option<string>[];
  optional?: boolean;
}

export const concernOptions: Option<Concern>[] = [
  { value: "stress", label: "Stress and overwhelm", icon: "Waves", tone: "lilac" },
  { value: "anxiety", label: "Anxiety and constant worrying", icon: "CloudDrizzle", tone: "mist" },
  { value: "low_mood", label: "Low mood", icon: "CloudSun", tone: "peach" },
  { value: "work_academic", label: "Work or academic pressure", icon: "BriefcaseBusiness", tone: "indigo" },
  { value: "relationships", label: "Relationship challenges", icon: "HeartHandshake", tone: "peach" },
  { value: "sleep", label: "Sleep difficulties", icon: "MoonStar", tone: "indigo" },
  { value: "confidence", label: "Confidence and self-esteem", icon: "Sprout", tone: "sage" },
  { value: "other", label: "Something else", icon: "Sparkles", tone: "mist" },
];

export const durationOptions: Option<Duration>[] = [
  { value: "days", label: "A few days", icon: "Sun", tone: "sage" },
  { value: "weeks", label: "A few weeks", icon: "CalendarDays", tone: "lilac" },
  { value: "months", label: "A few months", icon: "CalendarRange", tone: "peach" },
  { value: "na", label: "Prefer not to say", icon: "EyeOff", tone: "mist" },
];

export const impactOptions: Option<Impact>[] = [
  { value: "not_much", label: "Not much", hint: "Life is mostly as usual", icon: "Feather", tone: "sage" },
  { value: "sometimes", label: "Sometimes makes things difficult", icon: "Wind", tone: "lilac" },
  { value: "routine", label: "Affecting my daily routine", icon: "Clock3", tone: "peach" },
  { value: "function", label: "Making it difficult to function", icon: "Mountain", tone: "indigo" },
];

export const supportOptions: Option<SupportPref>[] = [
  { value: "professional", label: "Talking to a professional", hint: "A private 1:1 conversation", icon: "MessagesSquare", tone: "lilac" },
  { value: "independent", label: "Exploring things independently", hint: "Read and reflect at my own pace", icon: "BookOpen", tone: "sage" },
  { value: "guided", label: "Guided exercises and activities", hint: "Short, structured practices", icon: "Leaf", tone: "peach" },
  { value: "unsure", label: "Not sure yet", hint: "That's completely okay", icon: "Compass", tone: "mist" },
];

export const stateOptions: Option<EmotionalState>[] = [
  { value: "okay", label: "I feel okay but want to improve", icon: "Smile", tone: "sage" },
  { value: "overwhelmed", label: "I feel overwhelmed", icon: "Waves", tone: "peach" },
  { value: "stuck", label: "I feel stuck", icon: "Anchor", tone: "mist" },
  { value: "struggling", label: "I am struggling and need support", icon: "LifeBuoy", tone: "lilac" },
];

export const questions: Question[] = [
  { key: "concern", eyebrow: "Let's begin", title: "What has been on your mind lately?", helper: "Choose the one that feels closest. There's no wrong answer.", options: concernOptions },
  { key: "duration", eyebrow: "A little context", title: "How long have you been feeling this way?", helper: "A rough sense is enough.", options: durationOptions },
  { key: "impact", eyebrow: "Day to day", title: "How is it affecting your everyday life?", helper: "This helps us suggest support at the right pace.", options: impactOptions },
  { key: "support", eyebrow: "Your comfort", title: "What kind of support would you feel comfortable with?", helper: "You can always change your mind later.", options: supportOptions },
  { key: "state", eyebrow: "Right now", title: "How would you describe how you're feeling at the moment?", helper: "Be as honest as feels comfortable.", options: stateOptions },
  { key: "note", eyebrow: "Optional", title: "Anything else you'd like to share, in your own words?", helper: "Only if you want to. This is used once to shape your suggestions and is not saved.", optional: true },
];

export const emptyAnswers: CheckInAnswers = { concern: null, duration: null, impact: null, support: null, state: null, note: "" };

export function labelFor(key: keyof CheckInAnswers, value: string | null | undefined): string {
  const map: Record<string, Option<string>[]> = {
    concern: concernOptions, duration: durationOptions, impact: impactOptions, support: supportOptions, state: stateOptions,
  };
  return map[key]?.find((o) => o.value === value)?.label ?? "";
}

export function isComplete(a: CheckInAnswers): boolean {
  return Boolean(a.concern && a.duration && a.impact && a.support && a.state);
}

/** Validates an untrusted payload (API boundary). Returns null if invalid. */
export function parseAnswers(input: unknown): CheckInAnswers | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, opts: Option<T>[]): T | null =>
    typeof v === "string" && opts.some((x) => x.value === v) ? (v as T) : null;
  const a: CheckInAnswers = {
    concern: pick(o.concern, concernOptions),
    duration: pick(o.duration, durationOptions),
    impact: pick(o.impact, impactOptions),
    support: pick(o.support, supportOptions),
    state: pick(o.state, stateOptions),
    note: typeof o.note === "string" ? o.note.slice(0, 1000) : "",
  };
  return isComplete(a) ? a : null;
}
