// Shared domain types. All data in /data is synthetic demo content.

export type Concern =
  | "stress"
  | "anxiety"
  | "low_mood"
  | "work_academic"
  | "relationships"
  | "sleep"
  | "confidence"
  | "other";

export type Duration = "days" | "weeks" | "months" | "na";
export type Impact = "not_much" | "sometimes" | "routine" | "function";
export type SupportPref = "professional" | "independent" | "guided" | "unsure";
export type EmotionalState = "okay" | "overwhelmed" | "stuck" | "struggling";

export interface CheckInAnswers {
  concern: Concern | null;
  duration: Duration | null;
  impact: Impact | null;
  support: SupportPref | null;
  state: EmotionalState | null;
  /** Optional free text. Kept in memory only, never written to storage. */
  note?: string;
}

export type ResourceKind = "article" | "video" | "activity" | "assessment" | "programme";
export type ResourceCategory =
  | "stress"
  | "anxiety"
  | "sleep"
  | "relationships"
  | "workplace"
  | "academic"
  | "resilience";

export interface Resource {
  id: string;
  title: string;
  kind: ResourceKind;
  category: ResourceCategory;
  minutes: number;
  summary: string;
  concerns: Concern[];
  steps?: string[];
}

export interface Programme {
  id: string;
  name: string;
  description: string;
  weeks: number;
  minutesPerDay: number;
  expect: string[];
  concerns: Concern[];
}

export type SessionFormat = "video" | "audio" | "chat";
export type Language = "English" | "Hindi" | "Bengali" | "Tamil" | "Kannada" | "Marathi" | "Telugu";

export interface Therapist {
  id: string;
  name: string;
  pronouns: string;
  gender: "woman" | "man";
  title: string;
  credentials: string[];
  verified: boolean;
  years: number;
  specialisations: Concern[];
  focusLabel: string;
  approaches: string[];
  languages: Language[];
  formats: SessionFormat[];
  /** Day offsets (0 = today) and times for demo slots */
  slots: { day: number; times: string[] }[];
  bio: string;
  feedback: { fit: number; responses: number };
  continuityRate: number; // share of first sessions followed by a second (demo)
  orgCovered: boolean;
  hue: [string, string];
  initials: string;
}

export type NextStepType =
  | "counselling"
  | "guided_exercise"
  | "programme"
  | "assessment"
  | "resources";

export type SafetyLevel = "none" | "elevated" | "urgent";

export interface Recommendation {
  source: "ai" | "rules";
  safety: { level: SafetyLevel; message: string };
  summary: string;
  supportNeeds: string[];
  nextStep: { type: NextStepType; title: string; description: string; cta: string; href: string };
  category: "therapist" | "self_help" | "assessment" | "programme";
  reasons: string[];
  professionalSupport: { worthConsidering: boolean; note: string };
  resourceIds: string[];
  programmeId: string;
  therapistId: string;
  uncertainty: string;
}
