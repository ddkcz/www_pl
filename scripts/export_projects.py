"""
Exports all project data from projects/*.html into projects_export.csv.
The CSV can be edited and imported back with import_projects.py.

Run from the project root:
    python3 scripts/export_projects.py
"""

import re, csv, html, pathlib

ROOT = pathlib.Path(__file__).parent.parent

def strip_tags(text):
    text = re.sub(r'<[^>]+>', '', text)
    return html.unescape(text).strip()

def extract_project(path):
    src = path.read_text()

    prj_id  = strip_tags(re.search(r'class="prj-id">(.*?)</span>', src).group(1))
    company = strip_tags(re.search(r'class="prj-company">(.*?)</span>', src).group(1))
    year    = strip_tags(re.search(r'class="prj-company">.*?</span>\s*<span>(.*?)</span>', src, re.DOTALL).group(1))
    title   = strip_tags(re.search(r'<h2>(.*?)</h2>', src, re.DOTALL).group(1))
    page_title = strip_tags(re.search(r'<title>(.*?)</title>', src).group(1))

    intro_m = re.search(r'</div>\s*\n\s*<p>(.*?)</p>', src, re.DOTALL)
    intro   = strip_tags(intro_m.group(1)) if intro_m else ''
    intro   = re.sub(r'^Rola:\s*', '', intro)

    stack_m = re.search(r'class="project-stack"[^>]*>(.*?)</div>', src, re.DOTALL)
    stack   = ' | '.join(strip_tags(t) for t in re.findall(r'<span>(.*?)</span>', stack_m.group(1))) if stack_m else ''

    article_m = re.search(r'<article class="project-entry">(.*?)</article>', src, re.DOTALL)
    article   = article_m.group(1) if article_m else ''
    sections  = []
    for sec_m in re.finditer(r'<h3>(.*?)</h3>(.*?)(?=<h3>|<table|<div class="project-links|$)', article, re.DOTALL):
        sec_title = strip_tags(sec_m.group(1))
        sec_body  = sec_m.group(2).strip()
        bullets   = re.findall(r'<li>(.*?)</li>', sec_body, re.DOTALL)
        if bullets:
            body_text = '\n'.join('- ' + strip_tags(b) for b in bullets)
        else:
            para_m    = re.search(r'<p>(.*?)</p>', sec_body, re.DOTALL)
            body_text = strip_tags(para_m.group(1)) if para_m else strip_tags(sec_body)
        sections.append(f'[{sec_title}]\n{body_text}')
    content = '\n\n'.join(sections)

    links_m = re.search(r'class="project-links-inline">(.*?)</div>', src, re.DOTALL)
    links   = ' | '.join(
        strip_tags(a) + ' → ' + re.search(r'href="([^"]+)"', a).group(1)
        for a in re.findall(r'<a[^>]+>.*?</a>', links_m.group(1), re.DOTALL)
    ) if links_m else ''

    return {
        'file': path.name, 'prj_id': prj_id, 'company': company,
        'year': year, 'page_title': page_title, 'title': title,
        'role': intro, 'stack': stack, 'content': content, 'links': links,
    }

rows = []
for proj in sorted((ROOT / 'projects').glob('*.html')):
    row = extract_project(proj)
    rows.append(row)
    print(f'✓ {row["prj_id"]} — {row["title"][:55]}')

out    = ROOT / 'projects_export.csv'
fields = ['file','prj_id','company','year','page_title','title','role','stack','content','links']
with out.open('w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=fields, quoting=csv.QUOTE_ALL)
    w.writeheader()
    w.writerows(rows)

print(f'\nExported {len(rows)} projects → {out.name}')
