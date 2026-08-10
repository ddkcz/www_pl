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
fetch('/layout.html')
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
  // Theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    const setLabel = () => {
      const current = document.documentElement.getAttribute('data-theme');
      themeToggle.setAttribute(
        'aria-label',
        current === 'dark' ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'
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
  return [
    ...(tags.cad    || []).map(t => `<span class="tag-cad">${t}</span>`),
    ...(tags.sector || []).map(t => `<span class="tag-sector">${t}</span>`),
    ...(tags.stack  || []).map(t => `<span class="tag-tech">${t}</span>`),
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

  // project detail pages — fill .project-stack and karta rows
  const tags = PROJECT_TAGS[pageKey];
  if (!tags) return;

  const stackEl = document.querySelector('.project-stack');
  if (stackEl) stackEl.innerHTML = buildTagSpans(tags);

  const tbody = document.querySelector('.project-datasheet tbody');
  if (tbody) {
    const cadRow    = tags.cad && tags.cad.length
      ? `<tr><th>CAD</th><td>${tags.cad.join(' · ')}</td></tr>` : '';
    const sectorRow = `<tr><th>Sektor</th><td>${tags.sector.join(' · ')}</td></tr>`;
    const stackRow  = `<tr><th>Stack</th><td>${tags.stack.join(' · ')}</td></tr>`;
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
    { key: 'sector', label: 'Sektor', cls: 'tag-sector' },
    { key: 'stack',  label: 'Stack',  cls: 'tag-tech' },
  ];

  let html = `<div class="filter-bar-header">
      <span class="filter-bar-title">Filtruj projekty</span>
      <button class="filter-reset" id="filter-reset" disabled>✕ Wyczyść</button>
    </div>`;

  groups.forEach(({ key, label, cls }) => {
    const values = [...all[key]].sort((a, b) => a.localeCompare(b, 'pl'));
    html += `<div class="filter-group">`;
    html += `<span class="filter-group-label">${label}</span>`;
    html += `<div class="filter-pills">`;
    values.forEach(v => {
      html += `<button class="filter-pill ${cls}" data-cat="${key}" data-val="${v}">${v}</button>`;
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
      noResults.textContent = 'Brak projektów dla wybranych filtrów.';
      grid.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

// ============================================
// Lightbox — project galleries
// ============================================
(function () {
  const gallery = document.querySelector('.project-gallery');
  if (!gallery) return;

  const figs = [...gallery.querySelectorAll('figure')];
  if (!figs.length) return;

  let cur = 0;

  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay lb-hidden';
  overlay.innerHTML =
    '<button class="lb-close" aria-label="Zamknij">✕</button>' +
    '<button class="lb-btn lb-prev" aria-label="Poprzednie">‹</button>' +
    '<img class="lb-img" src="" alt="">' +
    '<p class="lb-caption"></p>' +
    '<button class="lb-btn lb-next" aria-label="Następne">›</button>' +
    '<span class="lb-counter"></span>';
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('.lb-img');
  const lbCaption = overlay.querySelector('.lb-caption');
  const lbCounter = overlay.querySelector('.lb-counter');

  function open(i) {
    cur = (i + figs.length) % figs.length;
    const img = figs[cur].querySelector('img');
    const cap = figs[cur].querySelector('figcaption');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = cap ? cap.textContent : '';
    lbCounter.textContent = `${cur + 1} / ${figs.length}`;
    overlay.classList.remove('lb-hidden');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.add('lb-hidden');
    document.body.style.overflow = '';
  }

  figs.forEach((fig, i) => fig.addEventListener('click', () => open(i)));
  overlay.querySelector('.lb-close').addEventListener('click', close);
  overlay.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); open(cur - 1); });
  overlay.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); open(cur + 1); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if (overlay.classList.contains('lb-hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open(cur - 1);
    if (e.key === 'ArrowRight') open(cur + 1);
  });
})();
