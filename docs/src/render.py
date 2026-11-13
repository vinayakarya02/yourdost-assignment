"""Render HTML -> PDF/PNG with headless Chrome, then inspect with PyMuPDF.
   python docs/src/render.py
"""
import subprocess, sys
from pathlib import Path

SRC = Path(__file__).resolve().parent
DOCS = SRC.parent
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
COMMON = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-pdf-header-footer", "--virtual-time-budget=8000", "--run-all-compositor-stages-before-draw"]

JOBS = [
    ("task1-infographic.html", "task1-gaming-infographic.pdf", (1080, 1350)),
    ("task1-analysis.html", "task1-gaming-analysis.pdf", None),
    ("task2-prd.html", "task2-therapist-matching-prd.pdf", None),
    ("task3-decisions.html", "task3-product-decisions.pdf", None),
]


def pdf(html, out):
    subprocess.run([CHROME, *COMMON, f"--print-to-pdf={DOCS / out}", (SRC / html).as_uri()], check=True, capture_output=True)


def png(html, out, size):
    subprocess.run([CHROME, *COMMON, f"--window-size={size[0]},{size[1]}", f"--screenshot={DOCS / out}", (SRC / html).as_uri()], check=True, capture_output=True)


if __name__ == "__main__":
    only = sys.argv[1:]
    import fitz
    for html, out, size in JOBS:
        if only and not any(o in html for o in only):
            continue
        if not (SRC / html).exists():
            continue
        pdf(html, out)
        if size:
            png(html, out.replace(".pdf", ".png"), size)
        d = fitz.open(DOCS / out)
        print(f"{out}: {d.page_count} page(s)")
        for i, p in enumerate(d):
            p.get_pixmap(dpi=70).save(SRC / "_preview" / f"{out[:-4]}-p{i+1}.png") if (SRC / "_preview").exists() else None
