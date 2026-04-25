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
  globallogic: {
    cad:    ['SolidWorks'],
    sector: ['Med-tech'],
    stack:  ['GD&T', 'DFM / DFA', 'Arena PLM', 'IEC 60601-1', 'Agile', 'DOE'],
  },
  euroloop: {
    cad:    ['SolidWorks'],
    sector: ['E-mobility'],
    stack:  ['GD&T', 'Analiza tolerancji', 'Szyny prądowe', 'Blacha', 'EMC', 'NPI / NPD'],
  },
  abb: {
    cad:    ['SolidWorks'],
    sector: ['E-mobility'],
    stack:  ['DFMA', 'Szyny prądowe', 'Ładowarki DC', 'NPI'],
  },
  techramps: {
    cad:    ['SketchUp'],
    sector: ['Sports infra'],
    stack:  ['Konstrukcje stalowe', 'VBA', 'Project management', 'Wycena'],
  },
  'agh-racing': {
    cad:    ['SolidWorks', 'ANSYS'],
    sector: ['Formula Student'],
    stack:  ['MES', 'CNC', 'Kompozyty CFRP', 'Zawieszenie'],
  },
  rally: {
    cad:    [],
    sector: ['Motorsport'],
    stack:  ['Budowa auta', 'Modyfikacje', 'Pilot rajdowy', 'Licencja sportowa'],
  },
  cedrowa: {
    cad:    ['SketchUp'],
    sector: ['Własna firma'],
    stack:  ['JavaScript', 'Automatyzacja', 'Prowadzenie firmy', 'Zarządzanie zespołem'],
  },
  garage: {
    cad:    [],
    sector: ['Motorsport'],
    stack:  ['Budowa auta', 'Spawanie MIG/TIG', 'Geometria zawieszenia', 'Diagnostyka OBD', 'Obróbka ręczna'],
  },
  hobby: {
    cad:    [],
    sector: ['Side projects'],
    stack:  ['JavaScript', 'VBA', 'Python', '3D Print', 'DIY Electronics'],
  },
  tarrace: {
    cad:    ['SketchUp'],
    sector: ['DIY / Dom'],
    stack:  ['Konstrukcja drewniana', 'Obliczenia statyczne', 'Stolarka'],
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
  Object.values(PROJECT_TAGS).forEach(({ cad, sector, stack }) => {
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
    if (!values.length) return;
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
      return;
    }

    if (pill) {
      pill.classList.toggle('active');
      const active = [...container.querySelectorAll('.filter-pill.active')];
      resetBtn.disabled = active.length === 0;
      filterCards(active.map(p => ({ cat: p.dataset.cat, val: p.dataset.val })));
    }
  });
}

function filterCards(activeFilters) {
  const cards = document.querySelectorAll('.card[data-project]');
  let visible = 0;

  cards.forEach(card => {
    if (!activeFilters.length) {
      card.classList.remove('card--hidden');
      visible++;
      return;
    }
    const tags = PROJECT_TAGS[card.dataset.project];
    if (!tags) return;
    const match = activeFilters.some(({ cat, val }) => tags[cat] && tags[cat].includes(val));
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
// Contact form handler
// ============================================
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = '✓ Wiadomość wysłana (demo)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      contactForm.reset();
    }, 2500);
  });
}
