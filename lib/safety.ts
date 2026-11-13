// Deterministic safety screen. Runs BEFORE any AI call, on both client and server.
// It is intentionally conservative about urgent phrases and intentionally does NOT treat
// ordinary sadness, stress or anxiety words as an emergency.
// This is a routing aid, not a risk assessment: it cannot detect or prevent suicide.

const URGENT_PATTERNS: RegExp[] = [
  /\b(kill(ing)?|end(ing)?|hurt(ing)?|harm(ing)?|tak(e|ing)|took)\s+(myself|my\s*self|my\s+(own\s+)?life)\b/i,
  /\bsuicid(e|al)\b/i,
  /\b(want|wanna|going|plan(ning)?|ready|wish(ing)?)\s+to\s+die\b/i,
  /\b(wish\s+i\s+(was|were)|want\s+to\s+be)\s+dead\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive|be\s+here\s+any\s*more|exist|wake\s+up)\b/i,
  /\b(no|any|not\s+any)\s*(reason|point)\s+(to|in)\s+(live|living|go(ing)?\s+on)\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\bself[\s-]?harm(ing)?\b/i,
  /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ed|ing)\b/i,
  /\bjump(ing)?\s+(off|from)\s+(a|the)\s+(building|bridge|roof|terrace|balcony)\b/i,
  /\bend\s+it\s+all\b/i,
  /\b(i'?m|i\s+am|i\s+feel)\s+not\s+safe\b/i,
  /\bi\s+don'?t\s+feel\s+safe\b/i,
  /\b(he|she|they|someone)\s+(is\s+going\s+to|will|wants\s+to)\s+(hurt|kill)\s+me\b/i,
  // Hinglish
  /\b(mar\s*jaana|mar\s+jaun|marna\s+(chahta|chahti|hai)|jeena\s+nahi|khudkushi|aatmahatya|jaan\s+de\s*(na|dun|dunga|dungi|doon))\b/i,
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
