# YourDOST – PM Assignment

Three tasks for the YourDOST Product Manager assignment, in one repository.

| Task | Deliverable |
|---|---|
| **1. Parents & online gaming survey** | [Infographic PNG](docs/task1-gaming-infographic.png) · [Infographic PDF](docs/task1-gaming-infographic.pdf) · [Analysis report (2 pp)](docs/task1-gaming-analysis.pdf) · [Analysis script](analysis/analysis.py) · [Clean data](analysis/survey_clean.csv) · [All computed figures](analysis/results.json) |
| **2. YourDOST Match – therapist matching** | [PRD (7 pp)](docs/task2-therapist-matching-prd.pdf) · engine: [`lib/matching.ts`](lib/matching.ts) |
| **3. Wellbeing Compass prototype** | This Next.js app · [Product decisions (2 pp)](docs/task3-product-decisions.pdf) · [Walkthrough script DOCX](docs/presentation-walkthrough-script.docx) / [PDF](docs/presentation-walkthrough-script.pdf) |

> All therapists, resources, programmes and bookings in the prototype are **fictional demo data**. Crisis numbers shown (112, Tele-MANAS 14416) are public Government of India services.

---

## Wellbeing Compass (Task 3)

*"Not sure where to start? Let's find your next step together."*

An AI-assisted navigator that helps employees and students find one appropriate next step inside YourDOST. It is **not** a therapist, diagnostic tool or crisis service.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · React Three Fiber (lazy-loaded 3D orb with CSS fallback) · Lucide · Zod · Anthropic TypeScript SDK (server-side only).

### Journeys
1. **Landing** (ATMOSPHERE design, interactive 3D orb) → 4 support doors
2. **Check-in**: one question per screen, progress, back/skip, validation, privacy notes
3. **AI reasoning** at `POST /api/recommend`: deterministic safety screen → rule engine → optional Claude (JSON schema output) → validation and merge
4. **Results**: summary, one primary next step, "why this may help", three support options
5. **Therapist discovery**: search plus 6 filters, explainable match score (Task 2 weights), profile drawer, demo booking with slot validation and confirmation
6. **Library**: 7 topics × 5 formats; guided activities, video preview, non-diagnostic reflections, programme enrolment
7. **Continuity**: save, keep this counsellor, post-session 3-question feedback, My Space
8. **Safety**: always-visible "Need help now?"; crisis language stops recommendations and shows human support

### Run locally
```bash
npm install
npm run dev            # http://localhost:3000
npm test               # 21 engine / safety / matching / validation tests
npm run build && npm start
```

### AI configuration
Copy `.env.example` to `.env.local`:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | No | none | Server-side only. Without it the **rule-based engine** is used and the app is fully functional. |
| `ANTHROPIC_MODEL` | No | `claude-opus-5-5` | Called with `effort: low`, a JSON-schema output, a 15 s timeout and server-side refusal fallback. |

The LLM may only choose from the catalogue it is given. Its output is validated (Zod), checked for diagnostic language, and merged with deterministic safety, therapist and programme choices. On any error it falls back to rules, and the results page shows which mode was used.

### Project structure
```
app/            pages (/, /check-in, /results, /therapists, /library, /my-space, /support) + api/recommend
components/     UI system, 3D orb, therapist drawer, resource modal, safety sheet, providers
lib/            safety.ts · engine.ts (rules) · matching.ts (Task 2) · llm.ts (Claude) · checkin.ts · types.ts
data/           synthetic therapists, resources, programmes, crisis contacts
analysis/       Task 1: source/survey_raw.xlsx, analysis.py, survey_clean.csv, results.json, SOURCE.md
docs/           final PDFs / PNG / DOCX; docs/src = HTML sources + build scripts
tests/          engine.test.ts
render.yaml     Render Blueprint
```

---

## Test results (verified 14 Nov 2026)

| Check | Result |
|---|---|
| Unit tests (`npm test`) | **21/21 pass**: safety screen incl. false-positive cases, rule engine, matching, API validation |
| TypeScript (`tsc --noEmit`) | Pass |
| Production build (`next build`) | Pass; all pages static except `/api/recommend` |
| Check-in navigation, validation, back, skip | Pass (browser) |
| Results generated; outputs change with inputs | Pass (5 input sets via API + browser) |
| Rule-based fallback without API key | Pass (the mode tested end to end) |
| AI error path (invalid key → 401 → rules in 0.47 s, no user text in logs) | Pass |
| **Live Claude response** | **Not tested: no API key was available** |
| Safety flow (crisis phrase → panel; ordinary stress → no panel) | Pass |
| Therapist search and filters (language, gender, format, availability, org cover, concern, empty state) | Pass: counts and rendered cards match |
| Profile drawer, demo booking, slot validation, confirmation | Pass |
| Library: activities, video, reflections, programmes, deep links | Pass |
| My Space, continuity toggle, post-session feedback, clear data | Pass |
| Mobile 375 px: no horizontal scroll on 8 routes | Pass |
| Privacy: free-text note never in local/session storage | Pass |
| Browser console errors | None from the app (missing `/favicon.ico` fixed) |

## Deploy to Render
`render.yaml` defines a Node web service (`npm ci && npm run build` → `npm start`, health check `/api/recommend`).

1. Render Dashboard → **New → Blueprint** → select this repository → **Apply**.
2. Optional: set `ANTHROPIC_API_KEY` in the service environment (leave empty for rule-based mode).
3. After deploy, open `/api/recommend`. `{"ok":true,"ai":false}` means rule-based mode.

Or use the one-click link: `https://render.com/deploy?repo=https://github.com/vinayakarya02/yourdost-assignment`

## Known limitations
- The live Claude path is implemented but not exercised without a key; run a smoke test after adding one.
- The safety screen is a transparent keyword routing aid (English + some Hinglish), not risk detection; it needs clinical red-teaming and regional languages.
- Prototype state lives in the browser (no accounts or backend). Bookings, programmes and the video player are simulated.
- Task 1 sample: n = 67 convenience sample (Dec 2020); findings are associations.
- Matching weights are product hypotheses awaiting clinician and outcome calibration.
