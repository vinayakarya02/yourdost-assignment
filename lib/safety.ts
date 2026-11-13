// Deterministic safety screen. Runs BEFORE any AI call, on both client and server.
// It is intentionally conservative about urgent phrases and intentionally does NOT treat
// ordinary sadness, stress or anxiety words as an emergency.
// This is a routing aid, not a risk assessment: it cannot detect or prevent suicide.

const URGENT_PATTERNS: RegExp[] = [
  /\b(kill|end|hurt|harm)\s*(myself|my\s*self|my\s*life)\b/i,
  /\bsuicid(e|al)\b/i,
  /\b(want|wanna|going|plan(ning)?)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive|exist|wake\s+up)\b/i,
  /\b(no|any)\s*(reason|point)\s+(to|in)\s+(live|living)\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\bself[\s-]?harm(ing)?\b/i,
  /\bcut(ting)?\s+myself\b/i,
  /\b(overdose|od)\s+on\b/i,
  /\bjump\s+off\b/i,
  /\bend\s+it\s+all\b/i,
  /\b(i'?m|i\s+am|i\s+feel|i\s+don'?t\s+feel)\s+(not\s+)?safe\s+(at\s+home|with\s+myself|right\s+now)\b/i,
  /\b(he|she|they|someone)\s+(is\s+going\s+to|will)\s+(hurt|kill)\s+me\b/i,
  // Hinglish
  /\b(mar\s*jaana|marna\s+chahta|marna\s+chahti|jeena\s+nahi|khudkushi|aatmahatya)\b/i,
];

export interface SafetyScreen {
  urgent: boolean;
  matched: boolean;
}

export function screenText(text: string | undefined | null): SafetyScreen {
  if (!text) return { urgent: false, matched: false };
  const normalised = text.replace(/[’']/g, "'").replace(/\s+/g, " ");
  const urgent = URGENT_PATTERNS.some((p) => p.test(normalised));
  return { urgent, matched: urgent };
}
