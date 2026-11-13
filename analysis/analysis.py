"""
YourDOST Task 1 - Parents & online gaming survey: reproducible analysis.

Usage (from repo root):
    python analysis/analysis.py
Input : analysis/source/survey_raw.xlsx  (export of the Google Sheet referenced in analysis/SOURCE.md)
Output: analysis/survey_clean.csv, analysis/results.json, printed log.

Every number used in the infographic and the analysis document comes from results.json.
"""
import json, sys
from pathlib import Path
import numpy as np
import pandas as pd
from scipy import stats

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = Path(__file__).resolve().parent
RAW = HERE / "source" / "survey_raw.xlsx"

raw = pd.read_excel(RAW)
assert raw.shape == (100, 38), raw.shape

# ---------- 1. Rename columns to short, stable names ----------
ATT = ["beneficial", "stress_buster", "socialize", "career", "needs_supervision",
       "distraction", "violent", "dangerous", "waste_money"]
FEAR = ["f_addictive", "f_aggression", "f_content", "f_academic", "f_health"]
ROLE = ["played_self", "know_fav", "understand_why", "played_with_kid", "not_interested", "rules_necessary"]
RULES = ["r_days", "r_times", "r_duration", "r_exams", "r_kinds", "r_money", "r_none"]
IMP = ["i_frustration", "i_conflict", "i_strain"]
NAMES = ["timestamp", "plays", "games"] + ATT + FEAR + ROLE + RULES + IMP + ["income", "kid_age", "gender", "occupation", "city"]
df = raw.copy()
df.columns = NAMES

log = {}
log["raw_rows"] = int(len(df))
log["raw_columns"] = int(df.shape[1])
log["collection_window"] = [str(df.timestamp.min()), str(df.timestamp.max())]
log["plays_counts"] = df.plays.value_counts().to_dict()
log["exact_duplicate_rows"] = int(df.duplicated().sum())
log["duplicate_timestamps"] = int(df.timestamp.duplicated().sum())

# ---------- 2. Routing check: "No" respondents skip every question ----------
no = df[df.plays == "No"]
log["no_rows_all_blank_after_q1"] = int(no.iloc[:, 2:].isna().all(axis=1).sum())
d = df[df.plays != "No"].copy()
N = len(d)
log["analysable_n"] = N

# ---------- 3. Encode ----------
LIKERT = {"Strongly Agree": 2, "Agree": 1, "Neutral": 0, "Disagree": -1, "Strongly Disagree": -2}
FEARMAP = {"High fear": 3, "Medium fear": 2, "Low fear": 1, "No fear": 0}
IMPMAP = {"High Impact": 3, "Medium Impact": 2, "Low Impact": 1, "No Impact": 0}
for c in ATT:
    d[c] = d[c].map(LIKERT)
for c in FEAR:
    d[c] = d[c].map(FEARMAP)
for c in IMP:
    d[c] = d[c].map(IMPMAP)
for c in ROLE + RULES:
    s = d[c].astype(str).str.replace('"', "").str.strip()
    d[c] = s.map({"True": 1.0, "False": 0.0})  # NaN stays NaN (item skipped)

unmapped = {c: int(d[c].isna().sum()) for c in ATT + FEAR + IMP + ROLE}
log["missing_in_required_grids"] = unmapped  # expected all zero
log["missing_in_rules_grid"] = {c: int(d[c].isna().sum()) for c in RULES}

# Light text normalisation
d["games"] = d["games"].astype(str).str.strip()
d["occupation"] = d["occupation"].replace({"High school teacher": "Teacher"})
d["cant_name_game"] = d["games"].str.lower().str.contains(r"know|no idea|^no$|remember", regex=True)

# ---------- 4. Consistency checks ----------
specific = ["r_days", "r_times", "r_duration", "r_exams", "r_kinds", "r_money"]
d["n_rules"] = d[specific].sum(axis=1, min_count=1)
contradiction = (d.r_none == 1) & (d[specific].fillna(0).sum(axis=1) > 0)
log["contradiction_no_rules_but_lists_rules"] = int(contradiction.sum())
# Decision: a respondent "has at least one rule" if ANY specific rule is True.
d["has_rule"] = (d[specific].fillna(0).sum(axis=1) > 0).astype(int)
d["no_rule_reported"] = 1 - d["has_rule"]
log["kids_age_infant_n"] = int((d.kid_age == "Infants/Toddlers (0-3 years old)").sum())

def pct(a, b):
    return round(100 * a / b, 1)

def frac(mask, base=None):
    base = mask.notna() if base is None else base
    num = int(mask[base].sum()); den = int(base.sum())
    return {"num": num, "den": den, "pct": pct(num, den)}

R = {"meta": log}

# ---------- 5. Descriptives ----------
R["attitudes"] = {c: {"agree": frac(d[c] > 0), "disagree": frac(d[c] < 0), "neutral": frac(d[c] == 0)} for c in ATT}
R["fear"] = {c: {"high": frac(d[c] == 3), "high_or_medium": frac(d[c] >= 2)} for c in FEAR}
R["role"] = {c: frac(d[c] == 1) for c in ROLE}
R["rules"] = {c: frac(d[c] == 1, d[c].notna()) for c in specific}
R["impact"] = {c: {"medium_or_high": frac(d[c] >= 2), "none": frac(d[c] == 0)} for c in IMP}
R["demographics"] = {k: d[k].value_counts().to_dict() for k in ["gender", "kid_age", "income", "occupation", "city", "plays"]}

# ---------- 6. Insight calculations ----------
# I1 Ambivalence: same parent holds both views
both = (d.stress_buster > 0) & (d.distraction > 0)
R["I1_ambivalence"] = {
    "distraction_agree": frac(d.distraction > 0),
    "stress_buster_agree": frac(d.stress_buster > 0),
    "both_agree": frac(both),
    "share_of_stress_buster_agreers_who_also_say_distraction": frac(d.distraction > 0, d.stress_buster > 0),
}

# I2 Fear concentrated on addiction & academics, not violence
R["I2_fear_ranking"] = {c: R["fear"][c]["high"] for c in FEAR}

# I3 Say-do gap on rules
base = d.rules_necessary.notna()
R["I3_rules_gap"] = {
    "rules_necessary": frac(d.rules_necessary == 1),
    "no_specific_rule_among_rules_necessary": frac(d.has_rule == 0, d.rules_necessary == 1),
    "rule_count_distribution": d.n_rules.fillna(0).astype(int).value_counts().sort_index().to_dict(),
}

# I4 Fear vs family conflict (association)
d["fear_index"] = d[FEAR].mean(axis=1)
d["impact_index"] = d[IMP].mean(axis=1)
rho, p = stats.spearmanr(d.fear_index, d.impact_index)
high_addict = d.f_addictive == 3
conflict_mh = d.i_conflict >= 2
R["I4_fear_conflict"] = {
    "spearman_fear_index_vs_family_impact_index": {"rho": round(rho, 2), "p": round(p, 4), "n": N},
    "conflict_medium_high_if_high_addiction_fear": frac(conflict_mh, high_addict),
    "conflict_medium_high_if_not_high_addiction_fear": frac(conflict_mh, ~high_addict),
}
# Rules vs conflict
rr, rp = stats.spearmanr(d.n_rules.fillna(0), d.impact_index)
R["I4_rules_vs_impact"] = {
    "spearman_rule_count_vs_impact_index": {"rho": round(rr, 2), "p": round(rp, 3), "n": N},
    "conflict_medium_high_if_has_rule": frac(conflict_mh, d.has_rule == 1),
    "conflict_medium_high_if_no_rule": frac(conflict_mh, d.has_rule == 0),
}
fisher = stats.fisher_exact(pd.crosstab(d.has_rule, conflict_mh).values)
R["I4_rules_vs_impact"]["fisher_p"] = round(fisher[1], 3)

# I5 Understanding / participation vs fear
und = d.understand_why == 1
hf = d.fear_index >= 2.5  # mean of 5 items at or above midway between Medium(2) and High(3)
R["I5_understanding"] = {
    "high_fear_index_if_understands_why": frac(hf, und),
    "high_fear_index_if_does_not_understand": frac(hf, ~und),
    "mean_fear_index_understands": round(d.loc[und, "fear_index"].mean(), 2),
    "mean_fear_index_not_understands": round(d.loc[~und, "fear_index"].mean(), 2),
    "mannwhitney_p": round(stats.mannwhitneyu(d.loc[und, "fear_index"], d.loc[~und, "fear_index"]).pvalue, 3),
    "played_with_kid": frac(d.played_with_kid == 1),
    "not_interested_in_learning": frac(d.not_interested == 1),
    "cant_name_a_game": frac(d.cant_name_game),
    "mean_fear_index_played_with_kid": round(d.loc[d.played_with_kid == 1, "fear_index"].mean(), 2),
    "mean_fear_index_not_played_with_kid": round(d.loc[d.played_with_kid == 0, "fear_index"].mean(), 2),
    "played_with_kid_mannwhitney_p": round(stats.mannwhitneyu(d.loc[d.played_with_kid == 1, "fear_index"], d.loc[d.played_with_kid == 0, "fear_index"]).pvalue, 3),
}

# I6 Gender difference in perceived benefit
d["benefit_index"] = d[["beneficial", "stress_buster", "socialize", "career"]].mean(axis=1)
m, f = d[d.gender == "Male"], d[d.gender == "Female"]
R["I6_gender"] = {
    "beneficial_agree_fathers": frac(m.beneficial > 0, pd.Series(True, index=m.index)),
    "beneficial_agree_mothers": frac(f.beneficial > 0, pd.Series(True, index=f.index)),
    "mean_benefit_index_fathers": round(m.benefit_index.mean(), 2),
    "mean_benefit_index_mothers": round(f.benefit_index.mean(), 2),
    "mannwhitney_p": round(stats.mannwhitneyu(m.benefit_index, f.benefit_index).pvalue, 3),
    "high_addiction_fear_fathers": frac(m.f_addictive == 3, pd.Series(True, index=m.index)),
    "high_addiction_fear_mothers": frac(f.f_addictive == 3, pd.Series(True, index=f.index)),
}

# Exploratory: kid age group (small cells - descriptive only)
R["by_kid_age"] = {k: {"n": int(len(g)), "mean_fear_index": round(g.fear_index.mean(), 2),
                       "high_addiction_fear": frac(g.f_addictive == 3, pd.Series(True, index=g.index))}
                   for k, g in d.groupby("kid_age")}

# ---------- 7. Save ----------
clean_cols = ["timestamp", "plays", "games", "cant_name_game"] + ATT + FEAR + ROLE + RULES + IMP + \
    ["n_rules", "has_rule", "fear_index", "impact_index", "benefit_index", "income", "kid_age", "gender", "occupation", "city"]
d[clean_cols].to_csv(HERE / "survey_clean.csv", index=False)

def conv(o):
    if isinstance(o, (np.integer,)): return int(o)
    if isinstance(o, (np.floating,)): return float(o)
    return str(o)

(HERE / "results.json").write_text(json.dumps(R, indent=2, default=conv, ensure_ascii=False), encoding="utf-8")
print(json.dumps(R, indent=1, default=conv, ensure_ascii=False))
