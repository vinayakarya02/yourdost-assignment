# Source dataset & methodology

- **Survey responses:** Google Sheet `1Td9xiaGSebE3jHzsTIgI7u6F7AsI78h4` (linked to the questionnaire Google Form `1zSxFecRbEk-lRVik4WQhqpDJFuKmEylNbB0ce_01W0w`).
- **Local copy:** `source/survey_raw.xlsx`, exported from the sheet. Re-downloaded on 14 Nov 2026 and compared cell for cell: identical (100 rows × 38 columns).
- **Collection window:** 1–3 December 2020.

## Reproduce
```bash
pip install pandas numpy scipy openpyxl
python analysis/analysis.py      # writes survey_clean.csv and results.json
python docs/src/build_task1.py   # regenerates infographic/report HTML from results.json
python docs/src/render.py        # renders PDFs/PNG with headless Chrome
```

## Cleaning decisions
1. 33 respondents answered "No" to "Does your kid play online games?"; the form routes them straight to submit and every later field is blank. They are excluded, leaving **n = 67**.
2. No exact duplicate rows or repeated timestamps.
3. No missing values in the attitude, fear, role or impact grids. The rules grid has 1–3 blanks per item, so rule percentages use the answered base.
4. 10 respondents ticked "I have no rules whatsoever" and also at least one specific rule. "Has a rule" = any specific rule ticked.
5. Encoding: agreement −2…+2; fear and impact 0–3; True/False → 1/0. Indices are means of items: fear (5), family impact (3), perceived benefit (4). "High fear" = fear index ≥ 2.5.
6. The form has no gaming-duration question, so no duration analysis.

## Statistics
Shares are reported as numerator/denominator. Associations use Spearman's ρ (ordinal indices), Mann–Whitney U (index differences between two groups) and Fisher's exact test (2×2). With n = 67 and several tests, p-values near .05 are treated as directional. All findings are correlational.
