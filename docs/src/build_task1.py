"""Builds Task 1 deliverables from analysis/results.json (no hand-typed numbers).
   python docs/src/build_task1.py   ->  docs/src/task1-*.html   (render with docs/src/render.py)
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
R = json.loads((ROOT / "analysis" / "results.json").read_text(encoding="utf-8"))
OUT = Path(__file__).resolve().parent
M = R["meta"]
N = M["analysable_n"]


def f(x):  # "num/den (pct%)"
    return f'{x["num"]}/{x["den"]}'


def pct(x):
    return f'{x["pct"]:.1f}%'.replace(".0%", "%") if x["pct"] == int(x["pct"]) else f'{x["pct"]:.1f}%'


I1, I2, I3 = R["I1_ambivalence"], R["I2_fear_ranking"], R["I3_rules_gap"]
I4, I4r, I5, I6 = R["I4_fear_conflict"], R["I4_rules_vs_impact"], R["I5_understanding"], R["I6_gender"]
rho = I4["spearman_fear_index_vs_family_impact_index"]["rho"]
fear_names = {"f_addictive": "Addiction", "f_academic": "Academic performance", "f_health": "Health effects",
              "f_content": "Inappropriate content", "f_aggression": "Aggressive behaviour"}
fears = sorted(I2.items(), key=lambda kv: -kv[1]["pct"])


def hbar(label, x, color="linear-gradient(90deg,#7770C9,#B9A5F5)", w=100):
    return f'''<div class="hb"><div class="hb-l"><span>{label}</span><span><small>{f(x)}</small> <b>{pct(x)}</b></span></div>
    <div class="hb-t"><i style="width:{x["pct"]*w/100:.1f}%;background:{color}"></i></div></div>'''


# ------------------------------------------------------------------ INFOGRAPHIC (1080 x 1350)
info = f'''<!doctype html><html><head><meta charset="utf-8"><title>Parents and online gaming</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=block">
<style>
*{{box-sizing:border-box;margin:0;padding:0}} html{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
@page{{size:1080px 1350px;margin:0}}
body{{width:1080px;height:1350px;font-family:'Plus Jakarta Sans',sans-serif;color:#25243A;background:#F7F4EF;position:relative;overflow:hidden}}
.blob{{position:absolute;border-radius:50%;filter:blur(10px)}}
.wrap{{position:relative;padding:46px 60px 0}}
.top{{display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#554EA8}}
.brand{{display:flex;align-items:center;gap:10px}} .orb{{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff 0 8%,#C9B9F8 30%,#B9A5F5 60%,#7770C9 100%)}}
h1{{font-size:66px;line-height:1.0;letter-spacing:-.035em;font-weight:800;margin-top:24px}} h1 em{{font-style:normal;color:#554EA8}}
.sub{{font-size:20px;color:#4A4960;margin-top:12px;line-height:1.4;max-width:900px}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px}}
.t{{background:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.9);border-radius:24px;padding:22px 24px;box-shadow:0 18px 40px -26px rgba(37,36,58,.35)}}
.t.wide{{grid-column:span 2}}
.k{{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#554EA8}}
.k i{{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:9px;background:#E6DDFB;font-style:normal;font-size:13px;color:#3F3A86}}
.t h2{{font-size:22px;line-height:1.15;letter-spacing:-.02em;margin:8px 0 10px;font-weight:700}}
.hb{{margin-bottom:10px}} .hb-l small{{font-size:11.5px;color:#6B6A80;font-weight:500;margin-right:6px}} .hb-l{{display:flex;justify-content:space-between;font-size:15px;color:#4A4960;font-weight:600}} .hb-l b{{color:#25243A;font-size:17px}}
.hb-t{{height:10px;border-radius:99px;background:rgba(37,36,58,.07);margin-top:5px;overflow:hidden}} .hb-t i{{display:block;height:100%;border-radius:99px}}
.hb-n{{font-size:11.5px;color:#6B6A80;margin-top:3px}}
.cmp{{display:flex;gap:16px;align-items:flex-end}} .cmp .c{{flex:1}}
.big{{font-size:44px;font-weight:800;letter-spacing:-.04em;line-height:1}} .cap{{font-size:13px;color:#4A4960;margin-top:5px;line-height:1.35}}
.note{{font-size:12px;color:#6B6A80;margin-top:6px;line-height:1.4}}
.take{{margin-top:18px;background:#25243A;color:#fff;border-radius:24px;padding:18px 26px;display:flex;gap:22px;align-items:center}}
.take b{{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#B9A5F5;white-space:nowrap}} .take p{{font-size:18px;line-height:1.35;font-weight:600}}
.src{{position:absolute;left:60px;right:60px;bottom:20px;font-size:11.5px;color:#6B6A80;line-height:1.45}}
</style></head><body>
<div class="blob" style="width:520px;height:520px;right:-160px;top:-170px;background:radial-gradient(circle,#E6DDFB,rgba(230,221,251,0) 70%)"></div>
<div class="blob" style="width:420px;height:420px;left:-170px;bottom:120px;background:radial-gradient(circle,rgba(167,201,180,.55),rgba(167,201,180,0) 70%)"></div>
<div class="wrap">
 <div class="top"><span class="brand"><span class="orb"></span>YourDOST · Parent Wellbeing</span><span>Survey insights</span></div>
 <h1>Parents aren&rsquo;t anti-gaming.<br><em>They&rsquo;re anxious.</em></h1>
 <p class="sub">What {N} Indian parents whose children play online games told us about benefits, fears, rules and family life.</p>
 <div class="grid">
  <div class="t"><div class="k"><i>1</i>Mixed feelings</div><h2>Most see a distraction. Half also see a stress-buster.</h2>
   {hbar("Gaming can be a distraction", I1["distraction_agree"])}
   {hbar("Gaming is a good stress-buster", I1["stress_buster_agree"], "linear-gradient(90deg,#3E6B52,#A7C9B4)")}
   {hbar("Hold both views at once", I1["both_agree"], "linear-gradient(90deg,#9A4A33,#F1BBAA)")}
  </div>
  <div class="t"><div class="k"><i>2</i>What they fear most</div><h2>Addiction and grades, more than violence.</h2>
   {"".join(hbar(fear_names[k], v) for k, v in fears[:3])}
   {hbar(fear_names[fears[-1][0]], fears[-1][1], "linear-gradient(90deg,#A7C9B4,#DCEBE2)")}
   <div class="note" style="margin-top:-2px">Share of parents reporting <b>high</b> fear.</div>
  </div>
  <div class="t"><div class="k"><i>3</i>Fear &amp; family</div><h2>Fear travels with family conflict.</h2>
   <div class="cmp"><div class="c"><div class="big" style="color:#554EA8">{pct(I4["conflict_medium_high_if_high_addiction_fear"])}</div><div class="cap">report medium/high conflict when addiction fear is high <span style="color:#6B6A80">({f(I4["conflict_medium_high_if_high_addiction_fear"])})</span></div></div>
   <div class="c"><div class="big" style="color:#9AA0A6">{pct(I4["conflict_medium_high_if_not_high_addiction_fear"])}</div><div class="cap">when it isn&rsquo;t high <span style="color:#6B6A80">({f(I4["conflict_medium_high_if_not_high_addiction_fear"])})</span></div></div></div>
   <div class="note">Overall fear vs family impact: Spearman &rho; = {rho:.2f}. An association, not proof of cause.</div>
  </div>
  <div class="t"><div class="k"><i>4</i>Rules aren&rsquo;t the fix</div><h2>{pct(I3["rules_necessary"])} say rules are needed. Rules don&rsquo;t mean calmer homes.</h2>
   <div class="cmp"><div class="c"><div class="big" style="color:#554EA8">{pct(I4r["conflict_medium_high_if_has_rule"])}</div><div class="cap">medium/high conflict <b>with</b> rules <span style="color:#6B6A80">({f(I4r["conflict_medium_high_if_has_rule"])})</span></div></div>
   <div class="c"><div class="big" style="color:#9AA0A6">{pct(I4r["conflict_medium_high_if_no_rule"])}</div><div class="cap">with no rules <span style="color:#6B6A80">({f(I4r["conflict_medium_high_if_no_rule"])}, small group)</span></div></div></div>
   <div class="note">No meaningful difference (Fisher p = {I4r["fisher_p"]:.2f}).</div>
  </div>
  <div class="t wide"><div class="k"><i>5</i>Understanding helps</div>
   <div style="display:flex;gap:30px;align-items:center"><div style="flex:1.2"><h2 style="margin-bottom:6px">Parents who understand why their child plays are half as likely to be highly fearful.</h2>
    <div class="note">High fear = average across 5 fear items at or above midway between &lsquo;medium&rsquo; and &lsquo;high&rsquo;. Mann-Whitney p = {I5["mannwhitney_p"]:.3f}.</div></div>
    <div style="flex:1">{hbar("Don&rsquo;t understand why", I5["high_fear_index_if_does_not_understand"], "linear-gradient(90deg,#9A4A33,#F1BBAA)")}{hbar("Understand why", I5["high_fear_index_if_understands_why"], "linear-gradient(90deg,#3E6B52,#A7C9B4)")}</div></div>
  </div>
 </div>
 <div class="take"><b>Takeaway</b><p>Curiosity before control. Ask what your child enjoys, play once together, then agree rules with them, not for them.</p></div>
</div>
<div class="src">Source: YourDOST parent survey (Google Form), {M["raw_rows"]} responses collected 1&ndash;3 Dec 2020. Analysed n = {N} parents whose children play online games ({M["plays_counts"]["No"]} &lsquo;No&rsquo; respondents skipped all questions by design). Convenience sample during COVID lockdowns; findings are associations, not causes. Full method: task1-gaming-analysis.pdf.</div>
</body></html>'''
(OUT / "task1-infographic.html").write_text(info, encoding="utf-8")

# ------------------------------------------------------------------ REPORT (2 x A4)
demo = R["demographics"]


def rows(items):
    return "".join(f"<tr><td>{a}</td><td class='num'>{b}</td><td class='num'><strong>{c}</strong></td></tr>" for a, b, c in items)


fear_svg_rows = "".join(
    f'<g transform="translate(0,{i*22})"><text x="0" y="12" font-size="9.5" fill="#4A4960">{fear_names[k]}</text>'
    f'<rect x="118" y="4" width="150" height="9" rx="4.5" fill="#EEEDF2"/><rect x="118" y="4" width="{v["pct"]*1.5:.1f}" height="9" rx="4.5" fill="url(#g)"/>'
    f'<text x="274" y="12" font-size="9.5" font-weight="700" fill="#25243A">{pct(v)}</text><text x="310" y="12" font-size="8.5" fill="#6B6A80">{f(v)}</text></g>'
    for i, (k, v) in enumerate(fears))
fear_svg = f'''<svg viewBox="0 0 340 {len(fears)*22}" width="100%" font-family="Plus Jakarta Sans"><defs><linearGradient id="g"><stop offset="0" stop-color="#7770C9"/><stop offset="1" stop-color="#B9A5F5"/></linearGradient></defs>{fear_svg_rows}</svg>'''

report = f'''<!doctype html><html><head><meta charset="utf-8"><title>Task 1 – Parents and online gaming: analysis</title>
<link rel="stylesheet" href="atmosphere.css"><style>body{{font-size:8.6pt;line-height:1.45}} table{{font-size:7.8pt}} td{{padding:1.15mm 1.8mm}} h2{{margin:3.5mm 0 1.6mm;font-size:11.5pt}} h1{{font-size:23pt}} .lead{{font-size:9.8pt}} li{{margin-bottom:.5mm}}</style></head><body>
<section class="page">
 <div class="runhead"><span class="brand"><span class="orb"></span>YourDOST · Task 1</span><span>Supporting analysis</span></div>
 <div class="eyebrow">Parents &amp; online gaming survey</div>
 <h1>Parents aren&rsquo;t anti-gaming. <em>They&rsquo;re anxious.</em></h1>
 <p class="lead">Five evidence-backed insights from {N} parents whose children play online games, with the exact calculations, what they mean and what YourDOST and parents can do with them.</p>

 <div class="grid2" style="margin-top:4mm">
  <div>
   <h2><span class="n">1</span>Research objective</h2>
   <p>Understand how parents perceive online gaming, what worries them, how they intervene, and how those worries relate to family life, to shape parent-facing wellbeing content and campaigns on YourDOST.</p>
   <h2><span class="n">2</span>Dataset overview</h2>
   <table><tr><th>Item</th><th>Value</th></tr>
    <tr><td>Source</td><td>Google Form &rarr; linked Sheet (re-downloaded and matched to the local copy cell for cell)</td></tr>
    <tr><td>Responses</td><td class="num">{M["raw_rows"]} rows &times; {M["raw_columns"]} columns</td></tr>
    <tr><td>Collected</td><td>1&ndash;3 December 2020</td></tr>
    <tr class="hl"><td><strong>Analysed</strong></td><td><strong>{N}</strong> ({M["plays_counts"]["Yes"]} &lsquo;Yes&rsquo; + {M["plays_counts"]["Sometimes"]} &lsquo;Sometimes&rsquo;)</td></tr>
    <tr><td>Respondents</td><td>{demo["gender"]["Female"]} women, {demo["gender"]["Male"]} men; cities: Other {demo["city"]["Other"]}, Kolkata {demo["city"]["Kolkata"]}, Bangalore {demo["city"]["Bangalore"]}, rest &le;6 each</td></tr>
    <tr><td>Question blocks</td><td>9 attitude items (5-pt agree), 5 fear items (4-pt), 6 role items &amp; 7 rule items (True/False), 3 family-impact items (4-pt), 5 demographics</td></tr>
   </table>
  </div>
  <div>
   <h2><span class="n">3</span>Cleaning &amp; validation</h2>
   <ul>
    <li><strong>Routing check:</strong> all {M["no_rows_all_blank_after_q1"]} &lsquo;No, my child doesn&rsquo;t play&rsquo; rows are blank after Q1. The form sent them straight to submit, so they are excluded rather than imputed.</li>
    <li><strong>Duplicates:</strong> {M["exact_duplicate_rows"]} exact duplicates and {M["duplicate_timestamps"]} repeated timestamps.</li>
    <li><strong>Missing values:</strong> none in attitude, fear, role or impact grids. The rules grid has 1&ndash;3 blanks per item, so rule percentages use the answered base.</li>
    <li><strong>Inconsistency:</strong> {M["contradiction_no_rules_but_lists_rules"]} parents ticked &lsquo;I have no rules whatsoever&rsquo; <em>and</em> at least one specific rule. A parent is counted as having rules if any specific rule is True.</li>
    <li><strong>Encoding:</strong> Likert &minus;2&hellip;+2; fear and impact 0&ndash;3; True/False &rarr; 1/0. Indices are item means: fear (5 items), family impact (3), perceived benefit (4).</li>
    <li><strong>Not available:</strong> the form has <strong>no gaming-duration question</strong>, so no duration analysis is attempted.</li>
   </ul>
   <div class="callout small">Reproducible: <code>python analysis/analysis.py</code> writes <code>survey_clean.csv</code> and <code>results.json</code>. Every figure in this document and the infographic is generated from that file.</div>
  </div>
 </div>

 <h2><span class="n">4</span>Key insights</h2>
 <table>
  <tr><th style="width:36%">Finding</th><th>Calculation</th><th>Result</th><th style="width:33%">Why it matters</th></tr>
  <tr><td><strong>1. Ambivalence, not opposition.</strong> Most see gaming as a distraction, and most of those who value it as a stress-buster hold both views.</td><td class="num">distraction {f(I1["distraction_agree"])}<br>stress-buster {f(I1["stress_buster_agree"])}<br>both {f(I1["both_agree"])}</td><td class="num"><strong>{pct(I1["distraction_agree"])}</strong><br>{pct(I1["stress_buster_agree"])}<br>{pct(I1["both_agree"])}</td><td>Ban-style messaging will miss parents who already see value. Content should help them balance, not choose sides.</td></tr>
  <tr><td><strong>2. Fear centres on addiction and grades.</strong> Violence-related fear ranks last.</td><td class="num">high fear: addiction {f(I2["f_addictive"])}<br>academics {f(I2["f_academic"])}<br>aggression {f(I2["f_aggression"])}</td><td class="num"><strong>{pct(I2["f_addictive"])}</strong><br>{pct(I2["f_academic"])}<br>{pct(I2["f_aggression"])}</td><td>Prioritise content on healthy habits and study balance over violence.</td></tr>
  <tr class="hl"><td><strong>3. Fear travels with family conflict.</strong></td><td class="num">conflict med/high:<br>high addiction fear {f(I4["conflict_medium_high_if_high_addiction_fear"])}<br>others {f(I4["conflict_medium_high_if_not_high_addiction_fear"])}<br>&rho;(fear, impact) = {rho:.2f}, n={N}</td><td class="num"><strong>{pct(I4["conflict_medium_high_if_high_addiction_fear"])}</strong><br>vs {pct(I4["conflict_medium_high_if_not_high_addiction_fear"])}</td><td>Correlation only: fear may cause conflict, conflict may raise fear, or both may stem from heavier play. Either way, anxious parents are a natural audience for family-communication support.</td></tr>
  <tr><td><strong>4. Belief in rules is near-universal; rules don&rsquo;t track calmer homes.</strong></td><td class="num">rules necessary {f(I3["rules_necessary"])}<br>believe but have none {f(I3["no_specific_rule_among_rules_necessary"])}<br>conflict: rules {f(I4r["conflict_medium_high_if_has_rule"])} vs none {f(I4r["conflict_medium_high_if_no_rule"])}</td><td class="num"><strong>{pct(I3["rules_necessary"])}</strong><br>{pct(I3["no_specific_rule_among_rules_necessary"])}<br>{pct(I4r["conflict_medium_high_if_has_rule"])} vs {pct(I4r["conflict_medium_high_if_no_rule"])}<br><span class="muted">p = {I4r["fisher_p"]:.2f}</span></td><td>Rules alone aren&rsquo;t associated with less conflict, and the no-rules group is small (n={I4r["conflict_medium_high_if_no_rule"]["den"]}). The gap between intent and action is a coaching opportunity.</td></tr>
  <tr><td><strong>5. Understanding is linked to lower fear.</strong></td><td class="num">high fear index:<br>don&rsquo;t understand {f(I5["high_fear_index_if_does_not_understand"])}<br>understand {f(I5["high_fear_index_if_understands_why"])}</td><td class="num"><strong>{pct(I5["high_fear_index_if_does_not_understand"])}</strong><br>vs {pct(I5["high_fear_index_if_understands_why"])}<br><span class="muted">p = {I5["mannwhitney_p"]:.3f}</span></td><td>The most actionable lever: helping parents understand <em>why</em> children play is cheap and scalable.</td></tr>
 </table>
 <div class="footer"><span>YourDOST PM Assignment · Task 1 analysis</span><span>Source data: YourDOST parent survey (n={N} analysed of {M["raw_rows"]})</span><span>1 / 2</span></div>
</section>

<section class="page">
 <div class="runhead"><span class="brand"><span class="orb"></span>YourDOST · Task 1</span><span>Supporting analysis</span></div>
 <div class="grid2">
  <div class="card">
   <h3>High fear by concern <span class="muted small">(share of {N} parents)</span></h3>
   {fear_svg}
  </div>
  <div class="card mist">
   <h3>Unexpected pattern: fathers see more upside</h3>
   <p>Fathers agree more often that gaming can be beneficial: <strong>{pct(I6["beneficial_agree_fathers"])}</strong> ({f(I6["beneficial_agree_fathers"])}) vs <strong>{pct(I6["beneficial_agree_mothers"])}</strong> ({f(I6["beneficial_agree_mothers"])}) of mothers. The mean benefit index is {I6["mean_benefit_index_fathers"]:+.2f} vs {I6["mean_benefit_index_mothers"]:+.2f} (Mann-Whitney p = {I6["mannwhitney_p"]:.3f}). Mothers report high addiction fear slightly more often ({pct(I6["high_addiction_fear_mothers"])} vs {pct(I6["high_addiction_fear_fathers"])}).</p>
  </div>
 </div>

 <h2><span class="n">5</span>Interpretation</h2>
 <p>The picture is <strong>worry without hostility</strong>. Parents recognise both sides of gaming, but their fears concentrate on the things that feel out of their control: compulsive use and slipping grades. Fear and family friction move together. And while almost every parent believes in rules, households with rules report no less conflict than those without. What <em>is</em> associated with lower fear is understanding: knowing why the child plays. Parents who have played with their child ({f(I5["played_with_kid"])}) also average a lower fear index ({I5["mean_fear_index_played_with_kid"]:.2f} vs {I5["mean_fear_index_not_played_with_kid"]:.2f} on a 0&ndash;3 scale), though that gap is only borderline (p = {I5["played_with_kid_mannwhitney_p"]:.3f}). Yet {pct(I5["not_interested_in_learning"])} ({f(I5["not_interested_in_learning"])}) say they aren&rsquo;t interested in learning about games, which is the gap to close.</p>
 <div class="callout"><strong>Correlation, not causation.</strong> This is a cross-sectional, self-reported survey. We cannot say rules fail, or that understanding <em>reduces</em> fear. Calmer, more curious parents may simply be both less fearful and more engaged.</div>

 <h2><span class="n">6</span>Limitations &amp; potential biases</h2>
 <div class="grid2">
  <ul>
   <li><strong>Small sample:</strong> n={N}; subgroup cells are small (e.g. no-rules n={I4r["conflict_medium_high_if_no_rule"]["den"]}, adolescents&rsquo; parents n={R["by_kid_age"]["Adolescents (13-17 years old)"]["n"]}). Age-group differences are not reported as findings.</li>
   <li><strong>Convenience sample:</strong> skewed to women ({demo["gender"]["Female"]}/{N}), Kolkata and Bangalore; not representative of Indian parents.</li>
   <li><strong>Timing:</strong> collected during COVID-19 restrictions (Dec 2020), when screen time and family stress were unusually high.</li>
  </ul>
  <ul>
   <li><strong>Self-report and social desirability:</strong> parents may over-report rules and under-report conflict.</li>
   <li><strong>Survey design:</strong> no measure of actual gaming time; a single &lsquo;age group&rsquo; field for families with several children; some data-quality issues (e.g. {M["contradiction_no_rules_but_lists_rules"]} contradictory rule answers, {M["kids_age_infant_n"]} parent of a 0&ndash;3-year-old reporting gaming).</li>
   <li><strong>Multiple comparisons:</strong> several tests were run; p-values near .05 should be read as directional.</li>
  </ul>
 </div>

 <h2><span class="n">7</span>Recommendations</h2>
 <div class="grid3">
  <div class="card sage"><h3>For parents</h3><ul class="small"><li>Ask your child what they enjoy about their favourite game, then play it once together.</li><li>Agree a few rules <em>with</em> your child (timing, exams, spending) instead of announcing them.</li><li>Notice your own worry; anxious conversations tend to escalate.</li></ul></div>
  <div class="card mist"><h3>For YourDOST content</h3><ul class="small"><li>A &lsquo;Curiosity before control&rsquo; parent series: short videos on why kids play and how to talk about it.</li><li>Lead campaigns with addiction and study-balance, not violence.</li><li>A gaming-and-family self-reflection that routes high-worry parents to counselling.</li></ul></div>
  <div class="card peach"><h3>For B2B programmes &amp; research</h3><ul class="small"><li>Offer a parent-wellbeing module in employer campaigns (working parents were {demo["occupation"]["Working Professional"]}/{N}).</li><li>Re-run with gaming hours, child-level age and a larger, balanced sample.</li><li>Pilot a family-communication workshop and measure change in parent-reported conflict.</li></ul></div>
 </div>
 <div class="footer"><span>YourDOST PM Assignment · Task 1 analysis</span><span>All figures generated by analysis/analysis.py → results.json</span><span>2 / 2</span></div>
</section>
</body></html>'''
(OUT / "task1-analysis.html").write_text(report, encoding="utf-8")
print("ok")
