"""
Reads content/projects_export.csv and propagates all changes to:
  - projects/*.html   (updates existing pages, creates new ones)
  - projects.html     (rebuilds all grid cards)
  - js/script.js      (rebuilds PROJECT_TAGS object)

Run from the project root:
    python3 scripts/import_projects.py
"""

import re, csv, pathlib

ROOT          = pathlib.Path(__file__).parent.parent
CSV_PATH      = ROOT / 'content' / 'projects_export.csv'
PROJECTS_DIR  = ROOT / 'projects'
PROJECTS_PAGE = ROOT / 'projects.html'
SCRIPT_JS     = ROOT / 'js' / 'script.js'

# ── helpers ───────────────────────────────────────────────────────────────

def esc(text: str) -> str:
    return (text
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;'))

def parse_pipe(field: str) -> list[str]:
    """Split on | or , (whichever is present). Trims whitespace, drops empties."""
    sep = '|' if '|' in field else ','
    return [t.strip() for t in field.split(sep) if t.strip()]

def parse_links(field: str) -> list[tuple[str, str]]:
    """
    Accepts both:
      '→ Label → https://...'    (original format)
      'https://...'              (plain URL — label derived from domain)
    Multiple entries separated by | or newline.
    """
    result = []
    for part in re.split(r'\||\n', field):
        part = part.strip()
        if not part:
            continue
        m = re.match(r'→\s*(.+?)\s*→\s*(https?://\S+)', part)
        if m:
            result.append((m.group(1).strip(), m.group(2).strip()))
        elif re.match(r'https?://', part):
            url   = part.rstrip('/')
            label = re.sub(r'https?://(www\.)?', '', url).split('/')[0]
            result.append((label, part))
    return result

def period_short(period: str) -> str:
    """'2025 — obecnie' → '2025—',  '2022 — 2025' → '2022—2025',  '2025' → '2025'"""
    years = re.findall(r'\b(\d{4})\b', period)
    if not years:
        return period
    if len(years) == 1:
        return years[0] + ('—' if 'obecnie' in period else '')
    return years[0] + '—' + years[-1]

def content_to_html(content: str, indent: str = '      ') -> str:
    """Convert [Section]\\n- bullet format → HTML h3 + ul/p blocks."""
    if not content.strip():
        return ''
    blocks = []
    for section in re.split(r'\n{2,}', content.strip()):
        section = section.strip()
        if not section:
            continue
        lines = section.splitlines()
        header_m = re.match(r'^\[(.+)\]$', lines[0].strip())
        if header_m:
            heading  = header_m.group(1)
            body     = lines[1:]
            bullets  = [re.sub(r'^[-·]\s*', '', l).strip()
                        for l in body if re.match(r'^[-·]', l.strip())]
            non_bul  = [l.strip() for l in body
                        if not re.match(r'^[-·]', l.strip()) and l.strip()]
            block    = f'{indent}<h3>{esc(heading)}</h3>\n'
            if bullets:
                block += f'{indent}<ul class="project-bullets">\n'
                for b in bullets:
                    block += f'{indent}  <li>{esc(b)}</li>\n'
                block += f'{indent}</ul>'
            elif non_bul:
                block += f'{indent}<p>{esc(" ".join(non_bul))}</p>'
        else:
            block = f'{indent}<p>{esc(section)}</p>'
        blocks.append(block)
    return '\n\n'.join(blocks)

# ── build a complete project detail page ─────────────────────────────────

def build_page(row: dict, filename: str) -> str:
    role_raw  = row['role'].strip()
    role_html = ''
    if role_raw and role_raw != '-':
        role_html = (f'\n      <p>\n        <strong>Rola:</strong> '
                     f'{esc(role_raw)}\n      </p>')

    content_html  = content_to_html(row['content'])
    content_block = f'\n{content_html}\n' if content_html else ''

    links     = parse_links(row.get('links') or '')
    links_html = ''
    if links:
        lines = ['      <div class="project-links-inline">']
        for label, url in links:
            lines.append(f'        <a href="{url}" target="_blank" rel="noopener">→ {esc(label)}</a>')
        lines.append('      </div>')
        links_html = '\n'.join(lines) + '\n'

    page_title = f'CADsmart - {esc(row["title"])}'
    og_url     = f'https://cadsmart.pl/projects/{filename}'
    prj_id     = row['prj_id'].strip()
    period_disp = row['period'].strip()

    return f'''<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title}</title>
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="CADsmart">
  <meta property="og:url"         content="{og_url}">
  <meta property="og:title"       content="{page_title}">
  <meta property="og:description" content="{esc(row["title"])} — projekt.">
  <meta property="og:image"       content="https://cadsmart.pl/assets/og-image.png">
  <meta property="og:image:width"  content="744">
  <meta property="og:image:height" content="198">
  <meta name="twitter:card"       content="summary_large_image">




  <script>
    (function(){{
      var t = localStorage.getItem('theme');
      if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', t);
    }})();
  </script>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div id="header-placeholder"></div>

  <main class="container">

    <a href="../projects.html" class="back-link">← Wróć do wszystkich projektów</a>

    <article class="project-entry">
      <div class="project-head">
        <div class="project-entry-header">
          <span class="prj-id">{esc(prj_id)}</span>
          <span class="prj-company">{esc(row["company"])}</span>
          <span>{esc(period_disp)}</span>
        </div>
        <h2>{esc(row["title"])}</h2>{role_html}
      </div>

      <div class="project-stack"></div>
{content_block}
    <table class="project-datasheet">
      <caption>Karta projektu</caption>
      <tbody>
        <tr><th>Projekt</th><td>{esc(prj_id)}</td></tr>
        <tr><th>Klient</th><td>{esc(row["company"])}</td></tr>
        <tr><th>Okres</th><td>{esc(period_disp)}</td></tr>
        <tr><th>Rola</th><td>{esc(role_raw if role_raw != "-" else "")}</td></tr>
      </tbody>
    </table>

{links_html}    </article>

  </main>
  <div id="footer-placeholder"></div>

  <script src="../js/script.js"></script>
</body>
</html>
'''

# ── build the grid card snippet for projects.html ─────────────────────────

def build_card(row: dict, filename: str) -> str:
    prj_id  = row['prj_id'].strip()
    prefix  = f'{prj_id} · ' if prj_id else ''
    meta_id = f'{prefix}{row["company"].upper()}'
    short   = period_short(row['period'])
    return f'''      <a href="projects/{filename}" class="card">
        <div class="project-meta">
          <span>{esc(meta_id)}</span>
          <span>{esc(short)}</span>
        </div>
        <h3>{esc(row["card_title"])}</h3>
        <p>{esc(row["card_description"])}</p>
        <div class="project-tags"></div>
        <div class="project-links">
          <span>Szczegóły projektu →</span>
        </div>
      </a>'''

# ── build the PROJECT_TAGS JS object ─────────────────────────────────────

def build_project_tags_js(rows: list[dict]) -> str:
    def js_list(items):
        if not items:
            return '[]'
        quoted = ', '.join(f"'{v}'" for v in items)
        return f'[{quoted}]'

    entries = []
    for row in rows:
        key    = row['key']
        cad    = parse_pipe(row['cad'])
        sector = parse_pipe(row['sector'])
        stack  = parse_pipe(row['stack'])
        entries.append(
            f"  '{key}': {{\n"
            f"    cad:    {js_list(cad)},\n"
            f"    sector: {js_list(sector)},\n"
            f"    stack:  {js_list(stack)},\n"
            f"  }},"
        )
    return 'const PROJECT_TAGS = {\n' + '\n'.join(entries) + '\n};'

# ── main ──────────────────────────────────────────────────────────────────

def main():
    with CSV_PATH.open(encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        row['_filename'] = row['file'].strip()

    # Sort: rows with prj_id descending (biggest first), then rows without
    def sort_key(r):
        pid = r['prj_id'].strip()
        if not pid:
            return (1, 0)
        num = int(pid.replace('PRJ-', '') or 0)
        return (0, -num)
    rows.sort(key=sort_key)

    # 1. Write / overwrite each project detail page
    for row in rows:
        dest   = PROJECTS_DIR / row['_filename']
        is_new = not dest.exists()
        dest.write_text(build_page(row, row['_filename']), encoding='utf-8')
        status = '+ created' if is_new else '✓ updated'
        label  = row['prj_id'] or row['key']
        print(f'{status}  {row["_filename"]}  ({label})')

    # 2. Rebuild projects.html grid
    proj_html  = PROJECTS_PAGE.read_text(encoding='utf-8')
    cards_html = '\n\n'.join(build_card(r, r['_filename']) for r in rows)
    proj_html  = re.sub(
        r'(<section class="grid-2">).*?(</section>)',
        f'\\1\n\n{cards_html}\n\n    \\2',
        proj_html, count=1, flags=re.DOTALL
    )
    PROJECTS_PAGE.write_text(proj_html, encoding='utf-8')
    print(f'\n✓ projects.html — {len(rows)} cards rebuilt')

    # 3. Replace PROJECT_TAGS in script.js
    js_src   = SCRIPT_JS.read_text(encoding='utf-8')
    new_tags = build_project_tags_js(rows)
    js_src   = re.sub(
        r'const PROJECT_TAGS = \{.*?\};',
        new_tags,
        js_src, count=1, flags=re.DOTALL
    )
    SCRIPT_JS.write_text(js_src, encoding='utf-8')
    print(f'✓ script.js — PROJECT_TAGS updated ({len(rows)} projects)')
    print(f'\nDone. {len(rows)} projects processed.')

if __name__ == '__main__':
    main()
