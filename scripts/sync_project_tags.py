"""
Reads .project-stack tags from each projects/*.html file and syncs them
into the matching card's .project-tags block in projects.html.

Run from the project root:
    python3 scripts/sync_project_tags.py
"""

import re
import pathlib

ROOT = pathlib.Path(__file__).parent.parent
PROJECTS_PAGE = ROOT / 'projects.html'

# ── helpers ───────────────────────────────────────────────────────────────

def extract_stack_tags(html: str) -> list[str]:
    block = re.search(r'<div class="project-stack">(.*?)</div>', html, re.DOTALL)
    if not block:
        return []
    return re.findall(r'<span>(.*?)</span>', block.group(1))

def build_tags_block(tags: list[str], indent: str) -> str:
    inner = '\n'.join(f'{indent}  <span>{t}</span>' for t in tags)
    return f'{indent}<div class="project-tags">\n{inner}\n{indent}</div>'

# ── main ──────────────────────────────────────────────────────────────────

projects_html = PROJECTS_PAGE.read_text()

for proj_file in sorted((ROOT / 'projects').glob('*.html')):
    tags = extract_stack_tags(proj_file.read_text())
    if not tags:
        print(f'✗ {proj_file.name} — no .project-stack found, skipped')
        continue

    href = f'projects/{proj_file.name}'

    # Find the card block for this project file
    card_pattern = re.compile(
        rf'(<a href="{re.escape(href)}"[^>]*>.*?)'   # card open → content
        rf'(<div class="project-tags">.*?</div>)',    # existing tags block
        re.DOTALL
    )
    match = card_pattern.search(projects_html)
    if not match:
        print(f'✗ {proj_file.name} — card not found in projects.html')
        continue

    # Detect indentation of the existing tags block
    line_start = projects_html.rfind('\n', 0, match.start(2)) + 1
    indent = ' ' * (match.start(2) - line_start)

    new_tags_block = build_tags_block(tags, indent)
    projects_html = (
        projects_html[:match.start(2)]
        + new_tags_block
        + projects_html[match.end(2):]
    )
    print(f'✓ {proj_file.name} → {len(tags)} tags synced')

PROJECTS_PAGE.write_text(projects_html)
print('\nprojects.html updated.')
