// ============================================
// Theme init — runs immediately to avoid flash
// ============================================
(function () {
  const saved = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', saved || (systemDark ? 'dark' : 'light'));
})();

// ============================================
// Shared layout loader (header + footer)
// ============================================
const IS_ENGLISH = document.documentElement.lang.toLowerCase().startsWith('en');
fetch(IS_ENGLISH ? '/layout-en.html' : '/layout.html')
  .then(r => r.text())
  .then(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.querySelectorAll('[data-slot="head"] link').forEach(el => {
      if (!document.head.querySelector(`link[href="${el.getAttribute('href')}"]`)) {
        document.head.appendChild(el.cloneNode(true));
      }
    });

    const header = document.getElementById('header-placeholder');
    if (header) {
      header.outerHTML = doc.querySelector('[data-slot="header"]').outerHTML;
      initNav();
    }

    const footer = document.getElementById('footer-placeholder');
    if (footer) footer.outerHTML = doc.querySelector('[data-slot="footer"]').outerHTML;
  });

// ============================================
// Nav behaviours — called after header inject
// ============================================
function initNav() {
  initLanguageSwitch();

  // Theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    const setLabel = () => {
      const current = document.documentElement.getAttribute('data-theme');
      themeToggle.setAttribute(
        'aria-label',
        current === 'dark'
          ? (IS_ENGLISH ? 'Switch to light mode' : 'Przełącz na tryb jasny')
          : (IS_ENGLISH ? 'Switch to dark mode' : 'Przełącz na tryb ciemny')
      );
    };
    setLabel();
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      setLabel();
    });
  }

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });
  }

  // Active link highlight
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initLanguageSwitch() {
  const relativePath = window.location.pathname
    .replace(/^\/en\//, '')
    .replace(/^\//, '') || 'index.html';
  const toggle = document.querySelector('[data-language-toggle]');
  if (!toggle) return;

  const articleWithoutTranslation =
    document.querySelector('.journal-entry') &&
    !document.querySelector(`link[rel="alternate"][hreflang="${IS_ENGLISH ? 'pl' : 'en'}"]`);

  toggle.href = articleWithoutTranslation
    ? (IS_ENGLISH ? '/blog.html' : '/en/blog.html')
    : (IS_ENGLISH ? `/${relativePath}` : `/en/${relativePath}`);
  toggle.textContent = IS_ENGLISH ? 'PL' : 'EN';
  toggle.lang = IS_ENGLISH ? 'pl' : 'en';
  toggle.setAttribute(
    'aria-label',
    IS_ENGLISH ? 'Przełącz na język polski' : 'Switch to English'
  );
}

// ============================================
// Project tags — single source of truth
// ============================================
const PROJECT_TAGS = {
  'tarrace': {
    cad:    ['SketchUp'],
    sector: ['Konstrukcje drewniane'],
    stack:  [],
  },
  'www': {
    cad:    [],
    sector: ['Web Design'],
    stack:  [],
  },
  'ai': {
    cad:    [],
    sector: ['Automation & AI'],
    stack:  ['AI', 'Process Automation', 'Python', 'JavaScript', 'CI/CD'],
  },
  'garage': {
    cad:    ['SketchUp'],
    sector: ['Konstrukcje drewniane'],
    stack:  [],
  },
  'globallogic': {
    cad:    ['SolidWorks'],
    sector: ['Med-tech'],
    stack:  ['GD&T', 'Electromechanical Integration', 'DFM / DFMA', 'Prototyping & Validation', 'PLM / ECO / ECR'],
  },
  'cedrowa': {
    cad:    ['SketchUp', 'Onshape'],
    sector: ['Meble na wymiar'],
    stack:  ['Product Development & Management', 'Process Automation', 'Manufacturing & Assembly', 'DFM / DFMA', 'AI'],
  },
  'euroloop': {
    cad:    ['Onshape'],
    sector: ['E-mobility'],
    stack:  ['GD&T', 'Product Development & Management', 'DFM / DFMA', 'Electromechanical Integration', 'PLM / ECO / ECR'],
  },
  'abb': {
    cad:    ['SolidWorks'],
    sector: ['E-mobility'],
    stack:  ['GD&T', 'MES', 'DFM / DFMA', 'Electromechanical Integration', 'PLM / ECO / ECR'],
  },
  'roamfurther': {
    cad:    ['SolidWorks', 'SketchUp'],
    sector: ['Construction', 'Industrial production'],
    stack:  [],
  },
  'techramps': {
    cad:    ['SolidWorks', 'SketchUp'],
    sector: ['Architectural design'],
    stack:  ['Product Development & Management', 'DFM / DFMA', 'Electromechanical Integration', 'Process Automation', 'Engineering Calculations'],
  },
  'rally': {
    cad:    ['SolidWorks'],
    sector: ['Motorsport'],
    stack:  ['MES', 'Prototyping & Validation', 'Root Cause Analysis', 'Manufacturing & Assembly', 'DFM / DFMA'],
  },
  'flowparks': {
    cad:    ['SolidWorks', 'SketchUp'],
    sector: ['Construction', 'Industrial production', 'Architectural design'],
    stack:  [],
  },
  'agh-racing': {
    cad:    ['SolidWorks', 'NX Siemens'],
    sector: ['Motorsport'],
    stack:  ['GD&T', 'MES', 'Manufacturing & Assembly', 'Prototyping & Validation'],
  },
  'wood': {
    cad:    ['Onshape', 'SketchUp'],
    sector: ['Architectural design'],
    stack:  ['Engineering Calculations', 'Manufacturing & Assembly', 'Product Development & Management', 'Prototyping & Validation', 'DFM / DFMA'],
  },
  'hobby': {
    cad:    [],
    sector: ['Side projects'],
    stack:  [],
  },
};

function buildTagSpans(tags) {
  const translations = {
    'Konstrukcje drewniane': 'Timber structures',
    'Meble na wymiar': 'Custom furniture',
  };
  const label = value => IS_ENGLISH ? (translations[value] || value) : value;
  return [
    ...(tags.cad    || []).map(t => `<span class="tag-cad">${label(t)}</span>`),
    ...(tags.sector || []).map(t => `<span class="tag-sector">${label(t)}</span>`),
    ...(tags.stack  || []).map(t => `<span class="tag-tech">${label(t)}</span>`),
  ].join('');
}

function renderProjectTags() {
  const pageKey = window.location.pathname.split('/').pop().replace('.html', '');

  // projects.html — fill each card's .project-tags from its href
  document.querySelectorAll('.card[href]').forEach(card => {
    const key = card.getAttribute('href').split('/').pop().replace('.html', '');
    card.dataset.project = key;
    const tags = PROJECT_TAGS[key];
    if (!tags) return;
    const container = card.querySelector('.project-tags');
    if (container) container.innerHTML = buildTagSpans(tags);
  });

  // Project detail pages — render tags inside the project datasheet
  const tags = PROJECT_TAGS[pageKey];
  if (!tags) return;

  const tbody = document.querySelector('.project-datasheet tbody');
  if (tbody) {
    const translations = {
      'Konstrukcje drewniane': 'Timber structures',
      'Meble na wymiar': 'Custom furniture',
    };
    const label = value => IS_ENGLISH ? (translations[value] || value) : value;
    const isGridDatasheet = Boolean(tbody.closest('.project-datasheet--grid'));
    const cadRow = tags.cad && tags.cad.length
      ? `<tr><th>CAD</th><td>${tags.cad.map(label).join(' · ')}</td></tr>`
      : (isGridDatasheet ? '<tr><th>CAD</th><td>—</td></tr>' : '');
    const sectorRow = `<tr><th>${IS_ENGLISH ? 'Sector' : 'Sektor'}</th><td>${tags.sector.map(label).join(' · ')}</td></tr>`;
    const stackRow = `<tr><th>Stack</th><td>${tags.stack.map(label).join(' · ')}</td></tr>`;
    tbody.insertAdjacentHTML('beforeend', cadRow + sectorRow + stackRow);
  }
}

renderProjectTags();
renderFilters();

// ============================================
// Filter bar — projects.html
// ============================================
function renderFilters() {
  const container = document.getElementById('project-filters');
  if (!container) return;

  const all = { cad: new Set(), sector: new Set(), stack: new Set() };
  const visibleProjectTags = [...document.querySelectorAll('.card[data-project]')]
    .map(card => PROJECT_TAGS[card.dataset.project])
    .filter(Boolean);

  visibleProjectTags.forEach(({ cad, sector, stack }) => {
    cad.forEach(v => all.cad.add(v));
    sector.forEach(v => all.sector.add(v));
    stack.forEach(v => all.stack.add(v));
  });

  const groups = [
    { key: 'cad',    label: 'CAD',    cls: 'tag-cad' },
    { key: 'sector', label: IS_ENGLISH ? 'Sector' : 'Sektor', cls: 'tag-sector' },
    { key: 'stack',  label: 'Stack',  cls: 'tag-tech' },
  ];

  let html = `<div class="filter-bar-header">
      <span class="filter-bar-title">${IS_ENGLISH ? 'Filter projects' : 'Filtruj projekty'}</span>
      <button class="filter-reset" id="filter-reset" disabled>✕ ${IS_ENGLISH ? 'Clear' : 'Wyczyść'}</button>
    </div>`;

  groups.forEach(({ key, label, cls }) => {
    const values = [...all[key]].sort((a, b) => a.localeCompare(b, IS_ENGLISH ? 'en' : 'pl'));
    html += `<div class="filter-group">`;
    html += `<span class="filter-group-label">${label}</span>`;
    html += `<div class="filter-pills">`;
    values.forEach(v => {
      const displayValue = IS_ENGLISH
        ? ({ 'Konstrukcje drewniane': 'Timber structures', 'Meble na wymiar': 'Custom furniture' }[v] || v)
        : v;
      html += `<button class="filter-pill ${cls}" data-cat="${key}" data-val="${v}">${displayValue}</button>`;
    });
    html += `</div></div>`;
  });

  container.innerHTML = html;

  const resetBtn = document.getElementById('filter-reset');

  container.addEventListener('click', e => {
    const pill = e.target.closest('.filter-pill');
    const reset = e.target.closest('#filter-reset');

    if (reset) {
      container.querySelectorAll('.filter-pill.active').forEach(p => p.classList.remove('active'));
      resetBtn.disabled = true;
      filterCards([]);
      updatePillAvailability(container, []);
      return;
    }

    if (pill) {
      const cat = pill.dataset.cat;
      if (cat === 'cad' || cat === 'sector') {
        container.querySelectorAll(`.filter-pill[data-cat="${cat}"].active`)
          .forEach(p => { if (p !== pill) p.classList.remove('active'); });
      }
      pill.classList.toggle('active');
      const active = [...container.querySelectorAll('.filter-pill.active')];
      resetBtn.disabled = active.length === 0;
      const activeFilters = active.map(p => ({ cat: p.dataset.cat, val: p.dataset.val }));
      filterCards(activeFilters);
      updatePillAvailability(container, activeFilters);
    }
  });

  updatePillAvailability(container, []);
}

function buildBycat(activeFilters) {
  const bycat = {};
  activeFilters.forEach(({ cat, val }) => {
    (bycat[cat] = bycat[cat] || []).push(val);
  });
  return bycat;
}

function projectMatchesBycat(tags, bycat) {
  return Object.entries(bycat).every(([cat, vals]) =>
    vals.every(val => tags[cat] && tags[cat].includes(val))
  );
}

function updatePillAvailability(container, activeFilters) {
  const bycat = buildBycat(activeFilters);
  const allCards = [...document.querySelectorAll('.card[data-project]')];

  container.querySelectorAll('.filter-pill:not(.active)').forEach(pill => {
    const cat = pill.dataset.cat;
    const val = pill.dataset.val;

    // Build hypothetical bycat if this pill were clicked
    const test = Object.fromEntries(Object.entries(bycat).map(([k, v]) => [k, [...v]]));
    if (cat === 'cad' || cat === 'sector') {
      test[cat] = [val];          // radio: replace
    } else {
      test[cat] = [...(test[cat] || []), val];  // stack: AND append
    }

    const wouldMatch = allCards.some(card => {
      const tags = PROJECT_TAGS[card.dataset.project];
      return tags && projectMatchesBycat(tags, test);
    });

    pill.disabled = !wouldMatch;
  });
}

function filterCards(activeFilters) {
  const cards = document.querySelectorAll('.card[data-project]');
  let visible = 0;
  const bycat = buildBycat(activeFilters);

  cards.forEach(card => {
    if (!activeFilters.length) {
      card.classList.remove('card--hidden');
      visible++;
      return;
    }
    const tags = PROJECT_TAGS[card.dataset.project];
    if (!tags) return;
    const match = projectMatchesBycat(tags, bycat);
    card.classList.toggle('card--hidden', !match);
    if (match) visible++;
  });

  const grid = document.querySelector('.grid-2');
  if (!grid) return;
  let noResults = grid.querySelector('.filter-no-results');
  if (!visible) {
    if (!noResults) {
      noResults = document.createElement('p');
      noResults.className = 'filter-no-results';
      noResults.textContent = IS_ENGLISH
        ? 'No projects match the selected filters.'
        : 'Brak projektów dla wybranych filtrów.';
      grid.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

// ============================================
// Journal — series metadata
// ============================================
function buildSeriesLabel(source) {
  const name = source.textContent.trim();
  const number = buildSeriesNumber(source);

  return number ? `${name} · ${number}` : name;
}

function buildSeriesNumber(source) {
  const part = source.dataset.seriesPart;
  const total = source.dataset.seriesTotal;

  if (!part) return '';
  return `${part}${total ? `/${total}` : ''}`;
}

(function () {
  const article = document.querySelector('.journal-entry');
  const series = document.querySelector('[data-article-series]');
  if (!article || !series) return;

  const seriesNumber = buildSeriesNumber(series);
  const wordCount = [...article.querySelectorAll('p, li')]
    .reduce((total, element) => total + element.textContent.trim().split(/\s+/).filter(Boolean).length, 0);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const published = article.dataset.published;
  const author = article.dataset.author;
  const profilePhoto = new URL(
    IS_ENGLISH ? '../../assets/profile.jpg' : '../assets/profile.jpg',
    window.location.href
  ).href;

  series.textContent = buildSeriesLabel(series);

  const datasheet = document.createElement('table');
  datasheet.className = 'project-datasheet project-datasheet--grid journal-datasheet';
  datasheet.innerHTML = `
    <caption>${IS_ENGLISH ? 'Article data' : 'Metryka artykułu'}</caption>
    <tbody>
      <tr>
        <th>${IS_ENGLISH ? 'Published' : 'Data publikacji'}</th>
        <td><time datetime="${published.replace(/\./g, '-')}">${published}</time></td>
      </tr>
      <tr><th>${IS_ENGLISH ? 'Author' : 'Autor'}</th><td>${author}</td></tr>
      <tr><th>${IS_ENGLISH ? 'Series number' : 'Numer w cyklu'}</th><td>${seriesNumber}</td></tr>
      <tr><th>${IS_ENGLISH ? 'Reading time' : 'Czas czytania'}</th><td>${readingMinutes} min</td></tr>
    </tbody>`;

  article.querySelector('.page-header').insertAdjacentElement('afterend', datasheet);

  const authorFooter = document.createElement('aside');
  authorFooter.className = 'article-author';
  authorFooter.setAttribute('aria-labelledby', 'article-author-name');
  authorFooter.innerHTML = `
    <p class="article-author__eyebrow">${IS_ENGLISH ? 'Article author / CADsmart' : 'Autor artykułu / CADsmart'}</p>
    <div class="article-author__identity">
      <img
        class="article-author__photo"
        src="${profilePhoto}"
        alt="${author}"
        width="76"
        height="76"
        loading="lazy"
      >
      <div>
        <h2 class="article-author__name" id="article-author-name">${author}</h2>
        <p class="article-author__role">${IS_ENGLISH ? 'mechanical engineer · creator of CADsmart' : 'inżynier mechanik · twórca CADsmart'}</p>
      </div>
    </div>
    <details class="article-author__disclosure">
      <summary class="article-author__summary">
        ${IS_ENGLISH ? 'Practical expertise. Editing supported by AI' : 'Merytoryka z praktyki. Redakcja wsparta AI'}
      </summary>
      <div class="article-author__note">
        <p>${IS_ENGLISH
          ? 'I do not want to add more articles to the internet that sound good but contribute little. That is why I base every article on my own know-how, years of experience and original materials.'
          : 'Nie chcę dokładać do internetu kolejnych tekstów, które dobrze brzmią, ale niewiele wnoszą. Dlatego każdy artykuł opieram na własnym know-how, doświadczeniu zbieranym latami i materiałach własnych.'}</p>
        <p>${IS_ENGLISH
          ? 'I am not a master wordsmith, so AI helps me organise notes, create a clear structure and polish the language. It does not replace technical knowledge or substantive verification. I remain responsible for the conclusions and final content. How is it possible that I have a blog post in both Polish and English? I think you know the answer.'
          : 'Nie jestem mistrzem słowa, dlatego AI pomaga mi uporządkować notatki, zbudować czytelną strukturę i dopracować język. Nie zastępuje jednak wiedzy technicznej ani merytorycznej weryfikacji. Za przedstawione wnioski i finalną treść odpowiadam ja.'}</p>
      </div>
    </details>`;

  article.appendChild(authorFooter);
})();

// Load series metadata from articles into the journal list.
(async function () {
  const list = document.querySelector('.blog-list');
  const items = [...document.querySelectorAll('.blog-item')];
  if (!items.length) return;

  await Promise.all(items.map(async item => {
    const label = item.querySelector('.blog-series');
    if (!label) return;

    try {
      const response = await fetch(item.getAttribute('href'));
      if (!response.ok) throw new Error(`Article metadata failed: ${response.status}`);

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const article = doc.querySelector('.journal-entry');
      const source = doc.querySelector('[data-article-series]');
      if (!article || !source) return;

      label.textContent = buildSeriesLabel(source);
      item.querySelector('.blog-date').textContent = article.dataset.published;
      item.dataset.published = article.dataset.published;
      item.dataset.series = source.dataset.articleSeries;
      item.dataset.seriesPart = source.dataset.seriesPart;
      item.dataset.author = article.dataset.author;
      if (source.dataset.seriesTotal) item.dataset.seriesTotal = source.dataset.seriesTotal;
    } catch (error) {
      console.warn(error);
    }
  }));

  const publishedDate = item =>
    item.dataset.published || item.querySelector('.blog-date').textContent.trim();

  items
    .sort((a, b) => publishedDate(b).localeCompare(publishedDate(a)))
    .forEach(item => list.appendChild(item));
})();

// ============================================
// Contact form — submit without redirect
// ============================================
(function () {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) return;

  const defaultLabel = submitButton.textContent;
  submitButton.setAttribute('aria-live', 'polite');

  form.addEventListener('submit', async event => {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = IS_ENGLISH ? 'Sending…' : 'Wysyłanie…';

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

      form.reset();
      submitButton.textContent = IS_ENGLISH ? 'Message sent!' : 'Wiadomość wysłana!';
    } catch (error) {
      console.error(error);
      submitButton.disabled = false;
      submitButton.textContent = IS_ENGLISH ? 'Could not send — try again' : 'Nie udało się — spróbuj ponownie';

      window.setTimeout(() => {
        if (!submitButton.disabled) submitButton.textContent = defaultLabel;
      }, 5000);
    }
  });
})();

// ============================================
// Lightbox — project galleries
// ============================================
(function () {
  const galleries = [...document.querySelectorAll('.project-gallery')];
  if (!galleries.length) return;

  let cur = 0;
  let activeFigs = [];

  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay lb-hidden';
  overlay.innerHTML =
    `<button class="lb-close" aria-label="${IS_ENGLISH ? 'Close' : 'Zamknij'}">✕</button>` +
    `<button class="lb-btn lb-prev" aria-label="${IS_ENGLISH ? 'Previous' : 'Poprzednie'}">‹</button>` +
    '<img class="lb-img" src="" alt="">' +
    '<p class="lb-caption"></p>' +
    `<button class="lb-btn lb-next" aria-label="${IS_ENGLISH ? 'Next' : 'Następne'}">›</button>` +
    '<span class="lb-counter"></span>';
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('.lb-img');
  const lbCaption = overlay.querySelector('.lb-caption');
  const lbCounter = overlay.querySelector('.lb-counter');

  function open(figs, i) {
    activeFigs = figs;
    cur = (i + activeFigs.length) % activeFigs.length;
    const img = activeFigs[cur].querySelector('img');
    const cap = activeFigs[cur].querySelector('figcaption');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = cap ? cap.textContent : '';
    lbCounter.textContent = `${cur + 1} / ${activeFigs.length}`;
    overlay.classList.remove('lb-hidden');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.add('lb-hidden');
    document.body.style.overflow = '';
  }

  galleries.forEach(gallery => {
    const figs = [...gallery.querySelectorAll('figure')];
    figs.forEach((fig, i) => fig.addEventListener('click', () => open(figs, i)));
  });
  overlay.querySelector('.lb-close').addEventListener('click', close);
  overlay.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); open(activeFigs, cur - 1); });
  overlay.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); open(activeFigs, cur + 1); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if (overlay.classList.contains('lb-hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open(activeFigs, cur - 1);
    if (e.key === 'ArrowRight') open(activeFigs, cur + 1);
  });
})();
