// Run: npm test  (Node 22+, uses --experimental-strip-types; no extra deps)
import assert from "node:assert/strict";
import { recommend } from "../lib/engine.ts";
import { screenText } from "../lib/safety.ts";
import { rank, eligible, WEIGHTS } from "../lib/matching.ts";
import { therapists } from "../data/therapists.ts";
import { parseAnswers } from "../lib/checkin.ts";
import type { CheckInAnswers } from "../lib/types.ts";

let passed = 0;
const t = (name: string, fn: () => void) => {
  try { fn(); passed++; console.log("  ✓", name); } catch (e) { console.error("  ✗", name); throw e; }
};

const base: CheckInAnswers = { concern: "stress", duration: "weeks", impact: "sometimes", support: "guided", state: "overwhelmed", note: "" };

console.log("Safety screen");
t("flags explicit self-harm intent", () => assert.equal(screenText("I want to kill myself").urgent, true));
t("flags 'don't want to be alive'", () => assert.equal(screenText("honestly I don't want to be alive anymore").urgent, true));
t("flags Hinglish phrase", () => assert.equal(screenText("kabhi kabhi marna chahta hoon").urgent, true));
t("does NOT flag ordinary sadness", () => assert.equal(screenText("I feel really sad and stressed and tired").urgent, false));
t("does NOT flag work idiom 'deadline is killing me'", () => assert.equal(screenText("this deadline is killing me").urgent, false));
t("does NOT flag 'my job is not safe'", () => assert.equal(screenText("my job is not safe after layoffs").urgent, false));

console.log("Rule engine");
t("crisis note short-circuits to urgent", () => assert.equal(recommend({ ...base, note: "I want to end my life" }).safety.level, "urgent"));
t("professional preference -> counselling", () => assert.equal(recommend({ ...base, support: "professional" }).nextStep.type, "counselling"));
t("sleep + guided -> sleep programme", () => {
  const r = recommend({ ...base, concern: "sleep" });
  assert.equal(r.nextStep.type, "programme"); assert.equal(r.programmeId, "p-sleep");
});
t("independent + light impact -> resources", () => assert.equal(recommend({ ...base, support: "independent", impact: "not_much", state: "okay" }).nextStep.type, "resources"));
t("high impact respects independent preference but flags professional support", () => {
  const r = recommend({ ...base, support: "independent", impact: "function", state: "struggling", duration: "months" });
  assert.equal(r.nextStep.type, "assessment"); assert.equal(r.professionalSupport.worthConsidering, true);
});
t("outputs change with inputs", () => {
  const a = recommend({ ...base, concern: "relationships" }), b = recommend({ ...base, concern: "anxiety" });
  assert.notDeepEqual(a.resourceIds, b.resourceIds); assert.notEqual(a.programmeId, b.programmeId);
});
t("never contains diagnostic labels", () => {
  for (const concern of ["stress", "anxiety", "low_mood", "work_academic", "relationships", "sleep", "confidence", "other"] as const)
    for (const support of ["professional", "independent", "guided", "unsure"] as const) {
      const r = recommend({ ...base, concern, support, impact: "function", state: "struggling" });
      assert.doesNotMatch(JSON.stringify(r), /diagnos(is|ed)\b(?! *\.)|disorder|depression|severity score/i);
    }
});

console.log("Matching (Task 2)");
t("weights sum to 1", () => assert.equal(Math.round(Object.values(WEIGHTS).reduce((a, b) => a + b, 0) * 100), 100));
t("stage 1 removes therapists without the language", () => assert.ok(eligible(therapists, { concern: "anxiety", language: "Bengali" }).every((x) => x.languages.includes("Bengali"))));
t("sleep concern ranks a sleep specialist first", () => assert.equal(rank(therapists, { concern: "sleep" })[0].therapist.id, "t-rahul"));
t("continuity boost keeps the chosen therapist on top", () => {
  const r = rank(therapists, { concern: "anxiety", continueWith: "t-vikram" });
  assert.equal(r[0].therapist.id, "t-vikram"); assert.equal(r[0].continuity, true);
});
t("every result has 1-3 reasons", () => rank(therapists, { concern: "stress" }).forEach((m) => assert.ok(m.reasons.length >= 1 && m.reasons.length <= 3)));

console.log("API boundary validation");
t("rejects incomplete payload", () => assert.equal(parseAnswers({ concern: "stress" }), null));
t("rejects unknown enum values", () => assert.equal(parseAnswers({ ...base, concern: "hacking" }), null));
t("truncates long notes", () => assert.equal(parseAnswers({ ...base, note: "x".repeat(5000) })!.note!.length, 1000));

console.log(`\n${passed} tests passed`);
