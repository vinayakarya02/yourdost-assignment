"""Builds docs/presentation-walkthrough-script.docx (2–3 minute demo script)."""
from pathlib import Path
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

OUT = Path(__file__).resolve().parents[1] / "presentation-walkthrough-script.docx"
MIDNIGHT, INDIGO, MUTE = RGBColor(0x25, 0x24, 0x3A), RGBColor(0x55, 0x4E, 0xA8), RGBColor(0x6B, 0x6A, 0x80)


def shade(cell, hex_):
    tcPr = cell._tc.get_or_add_tcPr()
    s = OxmlElement("w:shd"); s.set(qn("w:val"), "clear"); s.set(qn("w:color"), "auto"); s.set(qn("w:fill"), hex_); tcPr.append(s)


def run(p, text, bold=False, color=MIDNIGHT, size=10.5, italic=False):
    r = p.add_run(text); r.bold = bold; r.italic = italic; r.font.color.rgb = color; r.font.size = Pt(size); r.font.name = "Calibri"
    return r


doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Mm(210), Mm(297)
sec.left_margin = sec.right_margin = Mm(20); sec.top_margin = sec.bottom_margin = Mm(18)
st = doc.styles["Normal"]; st.font.name = "Calibri"; st.font.size = Pt(10.5)
st.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")

p = doc.add_paragraph(); run(p, "YOURDOST · PM ASSIGNMENT", True, INDIGO, 8.5)
p = doc.add_paragraph(); run(p, "Presentation walkthrough script", True, MIDNIGHT, 24)
p = doc.add_paragraph(); run(p, "Wellbeing Compass prototype + Tasks 1 & 2 · target length 2:30–2:45 (about 340 spoken words)", False, MUTE, 10.5)

p = doc.add_paragraph(); run(p, "Before you start: ", True, size=10); run(p,
    "open the live app on the landing page in a desktop browser. Have task1-gaming-infographic.png and the PRD open in other tabs. "
    "Clear demo data first (My Space → Clear all demo data) so the flow starts fresh. If no API key is configured, "
    "the results page shows ‘Rule-based demo mode’. Say so; don’t claim AI output.", size=10, color=MUTE)

beats = [
    ("0:00–0:20", "Landing page. Move the cursor slowly so the orb follows.",
     "Many people who could benefit from YourDOST never start, because the first step is a decision they don’t know how to make: a therapist? an article? a programme? Wellbeing Compass is a gentle navigator for exactly that moment. It is not a therapist and it never diagnoses."),
    ("0:20–0:55", "Click ‘Find my next step’. Answer: Sleep difficulties → A few weeks → Affecting my daily routine → Guided exercises → I feel overwhelmed. Type a short note.",
     "It’s one question at a time, in plain language, with a skip on anything optional and no sign-up. The note is used once and never stored. Watch what happens if someone writes something that sounds unsafe…"),
    ("0:55–1:10", "Type ‘I don’t want to be alive anymore’ to show the crisis panel, then replace it with the normal note.",
     "The safety check runs before any AI. Urgent language immediately pauses suggestions and shows emergency and Tele-MANAS numbers, plus a route to a real person. Everyday stress words don’t trigger it, and that is unit-tested."),
    ("1:10–1:45", "Submit. Let the rings animation play. Scroll through summary, primary step, ‘why this may help’ and the three options.",
     "Instead of a menu, you get one place to start, here a two-week sleep programme, with reasons tied to exactly what you said, plus an honest note on what this can’t know. If an Anthropic key is configured, Claude writes this copy inside a strict JSON schema; rules still decide the safety level and the options. Without a key, as now, a transparent rule engine produces the same structure, and the badge says which mode you’re seeing."),
    ("1:45–2:15", "Click ‘Book a session’ on the matched therapist. Open ‘How this match was made’, pick a slot, confirm.",
     "This is Task 2 running live. Matching filters for eligibility first, then ranks on six weighted factors: specialisation 35%, preferences 20%, language and availability 15% each, format 10%, experience 5%. Every card says why. These weights are hypotheses that we’d calibrate with clinicians and real outcomes, not clinical claims. Booking is a demo; no payment is taken."),
    ("2:15–2:35", "Open My Space. Expand the post-session feedback; toggle ‘Continue’.",
     "Continuity is the North Star: did a first session lead to a second with the same person? After a session we ask three optional questions, and ‘yes, continue’ keeps that therapist first. Low engagement is never read as a signal about someone’s mental health."),
    ("2:35–2:50", "Switch to the infographic tab.",
     "The same principles shaped Task 1: of 67 parents whose children game, most are anxious rather than anti-gaming. Rules didn’t track calmer homes; understanding why their child plays did. That points to curiosity-first content YourDOST can ship. Thank you."),
]

t = doc.add_table(rows=1, cols=3); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.style = "Table Grid"
widths = (Mm(20), Mm(52), Mm(98))
for i, h in enumerate(["Time", "On screen", "Say"]):
    c = t.rows[0].cells[i]; c.width = widths[i]; shade(c, "25243A")
    c.paragraphs[0].text = ""; run(c.paragraphs[0], h, True, RGBColor(0xFF, 0xFF, 0xFF), 9.5)
for k, (tm, screen, say) in enumerate(beats):
    cells = t.add_row().cells
    for i, w in enumerate(widths): cells[i].width = w
    if k % 2 == 0:
        for c in cells: shade(c, "F3EFFD")
    run(cells[0].paragraphs[0], tm, True, INDIGO, 9.5)
    run(cells[1].paragraphs[0], screen, False, MUTE, 9)
    run(cells[2].paragraphs[0], say, False, MIDNIGHT, 10)

doc.add_paragraph()
p = doc.add_paragraph(); run(p, "Likely questions (have a one-line answer ready)", True, MIDNIGHT, 13)
qa = [
    ("Is the AI deciding someone’s care?", "No. It only structures language and writes copy within a schema; options, safety and matching are deterministic and testable."),
    ("What if the AI fails or isn’t configured?", "The server, and then the browser, fall back to the same rule engine; the page labels the mode."),
    ("How would you know it works?", "Funnel metrics (check-in completion, recommendation → action, booking) are kept separate from clinical outcomes, which are measured by clinicians with validated instruments."),
    ("Why these matching weights?", "They are starting hypotheses: calibrate them through clinician review, shadow mode, then outcome-fitted regression and A/B tests."),
]
for q, a in qa:
    p = doc.add_paragraph(style="List Bullet"); run(p, q + " ", True, size=10); run(p, a, size=10, color=MUTE)

p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.LEFT
run(p, "All therapists, resources and bookings in the prototype are fictional demo data.", False, MUTE, 8.5, italic=True)
doc.save(OUT)
print(OUT)
