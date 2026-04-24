"""
Replaces inline <footer>...</footer> blocks in all root-level HTML pages
with <div id="footer-placeholder"></div>, which is then populated at runtime
by the shared footer loader in js/script.js fetching footer.html.

Run from the project root:
    python3 scripts/replace_footer.py
"""

import re
import pathlib

ROOT = pathlib.Path(__file__).parent.parent
FOOTER_PATTERN = re.compile(r'\s*<footer>.*?</footer>', re.DOTALL)
REPLACEMENT = '\n  <div id="footer-placeholder"></div>'

html_files = [
    f for f in ROOT.glob('*.html')
    if f.name != 'footer.html'
]

for path in sorted(html_files):
    text = path.read_text()
    new_text, count = FOOTER_PATTERN.subn(REPLACEMENT, text)
    if count:
        path.write_text(new_text)
        print(f"✓ {path.name} ({count} replacement)")
    else:
        print(f"✗ {path.name} — no <footer> found, skipped")
