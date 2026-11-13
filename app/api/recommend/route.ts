import { NextResponse } from "next/server";
import { parseAnswers } from "@/lib/checkin";
import { crisisRecommendation, recommend } from "@/lib/engine";
import { llmConfigured, recommendWithLLM } from "@/lib/llm";
import { screenText } from "@/lib/safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Very small in-memory rate limit (per instance) to protect the LLM key in a public demo.
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1;
  return h.n > 20;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const answers = parseAnswers((body as { answers?: unknown })?.answers);
  if (!answers) return NextResponse.json({ error: "invalid_answers", message: "Please complete the check-in." }, { status: 422 });

  // 1. Deterministic safety screen BEFORE any AI. The note is never logged or stored.
  if (screenText(answers.note).urgent) {
    return NextResponse.json({ recommendation: crisisRecommendation(), mode: "safety" }, { headers: { "Cache-Control": "no-store" } });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const useAI = llmConfigured() && !limited(ip);

  if (useAI) {
    try {
      const recommendation = await recommendWithLLM(answers);
      return NextResponse.json({ recommendation, mode: "ai" }, { headers: { "Cache-Control": "no-store" } });
    } catch (e) {
      // Log only the error class, never user content.
      console.warn("[recommend] AI unavailable, using rules:", e instanceof Error ? e.message.slice(0, 80) : "unknown");
    }
  }
  return NextResponse.json(
    { recommendation: recommend(answers), mode: llmConfigured() ? "rules_fallback" : "rules" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export function GET() {
  return NextResponse.json({ ok: true, ai: llmConfigured() });
}
