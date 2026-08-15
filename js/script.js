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

// MailerLite calls this function after a successful newsletter subscription.
function ml_webform_success_44862063() {
  document.querySelectorAll('.ml-subscribe-form-44862063').forEach(form => {
    const formBody = form.querySelector('.row-form');
    const successBody = form.querySelector('.row-success');
    if (formBody) formBody.style.display = 'none';
    if (successBody) successBody.style.display = 'block';
  });
}

// Shared newsletter block — appended to every journal article.
function initNewsletterSignup() {
  const article = document.querySelector('.journal-entry');
  const placeholder = document.querySelector('[data-newsletter-signup]');
  const target = placeholder || article;
  if (!target || target.querySelector('.newsletter-signup')) return;

  const copy = IS_ENGLISH
    ? {
        title: 'Let’s stay in touch',
        description: 'New articles, checklists and engineering insights. Subscribe and I’ll let you know when something new is published.',
        name: 'Name',
        optional: 'optional',
        namePlaceholder: 'Your name',
        consent: 'I agree to receive the CADsmart newsletter and accept the',
        privacy: 'Privacy Policy',
        submit: 'Subscribe →',
        loading: 'Subscribing…',
        successTitle: 'Thank you!',
        successText: 'Your address has been added. Check your inbox and confirm your subscription.',
      }
    : {
        title: 'Zostańmy w kontakcie',
        description: 'Nowe artykuły, checklisty i inżynierskie przemyślenia. Zapisz się, a dam Ci znać, kiedy pojawi się coś nowego.',
        name: 'Imię',
        optional: 'opcjonalnie',
        namePlaceholder: 'Twoje imię',
        consent: 'Chcę otrzymywać newsletter CADsmart i akceptuję',
        privacy: 'Politykę prywatności',
        submit: 'Zapisuję się →',
        loading: 'Zapisywanie…',
        successTitle: 'Dziękuję!',
        successText: 'Adres został zapisany. Sprawdź skrzynkę i potwierdź zapis do newslettera.',
      };

  const languageSuffix = IS_ENGLISH ? 'en' : 'pl';
  const privacyHref = article ? '../privacy.html' : 'privacy.html';
  const section = document.createElement('section');
  section.className = 'newsletter-signup';
  section.setAttribute('aria-labelledby', `newsletter-title-${languageSuffix}`);
  section.innerHTML = `
    <div class="newsletter-signup__intro">
      <span class="newsletter-signup__label">NEWSLETTER · CADSMART</span>
      <h2 id="newsletter-title-${languageSuffix}">${copy.title}</h2>
      <p>${copy.description}</p>
    </div>
    <div id="mlb2-44862063" class="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-44862063 newsletter-signup__form">
      <div class="ml-form-align-center">
        <div class="ml-form-embedWrapper embedForm">
          <div class="ml-form-embedBody ml-form-embedBodyDefault row-form">
            <form class="ml-block-form" action="https://assets.mailerlite.com/jsonp/2577461/forms/195873593710609665/subscribe" data-code="" method="post" target="_blank">
              <div class="ml-form-fieldRow">
                <label for="newsletter-name-${languageSuffix}">${copy.name} <span>(${copy.optional})</span></label>
                <input id="newsletter-name-${languageSuffix}" aria-label="${copy.name}" type="text" name="fields[name]" placeholder="${copy.namePlaceholder}" autocomplete="given-name">
              </div>
              <div class="ml-form-fieldRow ml-validate-email ml-validate-required">
                <label for="newsletter-email-${languageSuffix}">E-mail</label>
                <input id="newsletter-email-${languageSuffix}" aria-label="E-mail" aria-required="true" type="email" name="fields[email]" placeholder="your@email.com" autocomplete="email" required>
              </div>
              <div class="ml-form-checkboxRow ml-validate-required newsletter-signup__consent">
                <label>
                  <input type="checkbox" required>
                  <span>${copy.consent} <a href="${privacyHref}">${copy.privacy}</a>.</span>
                </label>
              </div>
              <div class="ml-form-recaptcha ml-validate-required newsletter-signup__recaptcha">
                <div class="g-recaptcha" data-sitekey="6Lf1KHQUAAAAAFNKEX1hdSWCS3mRMv4FlFaNslaD"></div>
              </div>
              <input type="hidden" name="ml-submit" value="1">
              <input type="hidden" name="anticsrf" value="true">
              <div class="ml-form-embedSubmit">
                <button type="submit" class="primary">${copy.submit}</button>
                <button disabled style="display: none" type="button" class="loading">
                  <span class="newsletter-signup__loader" aria-hidden="true"></span>
                  <span class="sr-only">${copy.loading}</span>
                </button>
              </div>
            </form>
          </div>
          <div class="ml-form-successBody row-success newsletter-signup__success" role="status" aria-live="polite" style="display: none">
            <h2>${copy.successTitle}</h2>
            <p>${copy.successText}</p>
          </div>
        </div>
      </div>
    </div>`;

  target.appendChild(section);

  const recaptcha = document.createElement('script');
  recaptcha.src = 'https://www.google.com/recaptcha/api.js';
  recaptcha.async = true;
  recaptcha.defer = true;
  document.body.appendChild(recaptcha);

  const mailerLite = document.createElement('script');
  mailerLite.src = 'https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519';
  mailerLite.onload = () => fetch('https://assets.mailerlite.com/jsonp/2577461/forms/195873593710609665/takel');
  document.body.appendChild(mailerLite);
}

initNewsletterSignup();

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

  const pageWithoutTranslation =
    document.body.hasAttribute('data-no-translation') ||
    (document.querySelector('.journal-entry') &&
      !document.querySelector(`link[rel="alternate"][hreflang="${IS_ENGLISH ? 'pl' : 'en'}"]`));

  toggle.href = pageWithoutTranslation
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
// Journal checklist — generate a branded PDF in the browser
// ============================================
(function () {
  const buttons = [...document.querySelectorAll('[data-checklist-pdf]')];
  if (!buttons.length) return;

  const PDFMAKE_VERSION = '0.2.23';
  let pdfMakeReady;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function loadPdfMake() {
    if (!pdfMakeReady) {
      const base = `https://cdn.jsdelivr.net/npm/pdfmake@${PDFMAKE_VERSION}/build`;
      pdfMakeReady = loadScript(`${base}/pdfmake.min.js`)
        .then(() => loadScript(`${base}/vfs_fonts.js`))
        .then(() => {
          if (!window.pdfMake) throw new Error('pdfMake is unavailable');
          return window.pdfMake;
        });
    }
    return pdfMakeReady;
  }

  function pdfBackground(currentPage, pageSize) {
    const headerHeight = 46;
    const footerHeight = 36;
    const contentBottom = pageSize.height - footerHeight;
    const lines = [
      { type: 'rect', x: 0, y: 0, w: pageSize.width, h: headerHeight, color: '#ebe7dc' },
      { type: 'rect', x: 0, y: contentBottom, w: pageSize.width, h: footerHeight, color: '#ebe7dc' }
    ];
    const step = 28;

    for (let x = 0; x <= pageSize.width; x += step) {
      lines.push({ type: 'line', x1: x, y1: headerHeight, x2: x, y2: contentBottom, lineColor: '#e4dfd5', lineWidth: 0.35 });
    }
    for (let y = headerHeight; y <= contentBottom; y += step) {
      lines.push({ type: 'line', x1: 0, y1: y, x2: pageSize.width, y2: y, lineColor: '#e4dfd5', lineWidth: 0.35 });
    }
    lines.push({ type: 'line', x1: 0, y1: headerHeight, x2: pageSize.width, y2: headerHeight, lineColor: '#1a2332', lineWidth: 1 });
    lines.push({ type: 'line', x1: 0, y1: contentBottom, x2: pageSize.width, y2: contentBottom, lineColor: '#1a2332', lineWidth: 1 });

    return { canvas: lines };
  }

  function createChecklistDefinition(button) {
    const article = button.closest('.journal-entry');
    const checklist = button.closest('.journal-project-check');
    const questions = [...checklist.querySelectorAll('.journal-checklist__items li')]
      .map(item => item.textContent.trim());
    const title = article.querySelector('h1').textContent.trim();
    const seriesElement = article.querySelector('.journal-series');
    const series = seriesElement.textContent
      .replace(/\s*[·•]\s*\d{2}\/\d{2}\s*$/, '')
      .trim();
    const seriesPart = `${seriesElement.dataset.seriesPart}/${seriesElement.dataset.seriesTotal}`;

    const labels = IS_ENGLISH ? {
      documentLabel: 'PROJECT CHECKLIST',
      intro: 'Questions to use during your project review',
      answer: '□  YES     □  NO     □  TO REVIEW',
      subject: 'CADsmart project checklist'
    } : {
      documentLabel: 'CHECKLISTA PROJEKTOWA',
      intro: 'Pytania do wykorzystania podczas przeglądu projektu',
      answer: '□  TAK     □  NIE     □  DO SPRAWDZENIA',
      subject: 'Checklista projektowa CADsmart'
    };

    const columnCount = questions.length <= 10 ? 1 : questions.length <= 18 ? 2 : 3;
    const questionsPerColumn = Math.ceil(questions.length / columnCount);
    const density = Math.max(0, questions.length - 9);
    const questionFontSize = Math.max(columnCount === 1 ? 7.2 : 6.2, 8.7 - density * 0.13);
    const rowPadding = Math.max(3, 6 - density * 0.16);

    function questionTable(items, numberOffset) {
      const rows = items.map((question, index) => ([
        {
          text: String(numberOffset + index + 1).padStart(2, '0'),
          style: 'questionNumber',
          margin: [0, 1, 0, 0]
        },
        {
          stack: [
            { text: question, style: 'question' },
            { text: labels.answer, style: 'answer', margin: [0, 4, 0, 0] }
          ]
        }
      ]));

      return {
        table: {
          widths: [columnCount === 1 ? 30 : 24, '*'],
          body: rows,
          dontBreakRows: true
        },
        layout: {
          hLineWidth: () => 0.8,
          vLineWidth: i => i === 1 ? 0.8 : 0,
          hLineColor: () => '#b8b3a4',
          vLineColor: () => '#b8b3a4',
          paddingLeft: i => i === 0 ? 0 : columnCount === 1 ? 9 : 7,
          paddingRight: () => columnCount === 1 ? 8 : 5,
          paddingTop: () => rowPadding,
          paddingBottom: () => rowPadding
        }
      };
    }

    const questionColumns = Array.from({ length: columnCount }, (_, index) => {
      const start = index * questionsPerColumn;
      return questionTable(questions.slice(start, start + questionsPerColumn), start);
    });
    const questionBlock = columnCount === 1
      ? questionColumns[0]
      : { columns: questionColumns, columnGap: columnCount === 2 ? 12 : 8 };

    return {
      pageSize: 'A4',
      pageOrientation: columnCount === 3 ? 'landscape' : 'portrait',
      pageMargins: [42, 48, 42, 40],
      background: pdfBackground,
      info: {
        title: `CADsmart — ${title}`,
        author: 'Dawid Kuczyński',
        subject: labels.subject
      },
      header: {
        margin: [42, 12, 42, 0],
        columns: [
          {
            width: 83,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 174 46">
              <rect x="1.5" y="1.5" width="171" height="43" rx="10" fill="#f4f1ea" stroke="#c23a1e" stroke-width="2.5"/>
              <g fill="none" stroke="#c23a1e" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">
                <polygon points="22,13 30,17.5 22,22 14,17.5"/>
                <polygon points="14,17.5 22,22 22,31 14,26.5"/>
                <polygon points="22,22 30,17.5 30,26.5 22,31"/>
              </g>
              <text x="40" y="30" font-family="Roboto, Arial, sans-serif" font-size="23" font-weight="700" fill="#1a2332">CADsmart</text>
            </svg>`,
            fit: [83, 22]
          },
          {
            text: `${labels.documentLabel}  ·  ${series.toUpperCase()}  ·  ${seriesPart}`,
            style: 'headerLabel',
            alignment: 'center',
            margin: [0, 7, 0, 0]
          }
        ]
      },
      footer: {
        margin: [42, 17, 42, 0],
        text: IS_ENGLISH
          ? 'dawid@cadsmart.pl  ·  © 2026 CADsmart.pl — all rights reserved'
          : 'dawid@cadsmart.pl  ·  © 2026 CADsmart.pl — wszelkie prawa zastrzeżone',
        style: 'footer',
        alignment: 'center'
      },
      content: [
        { text: title, style: 'title' },
        { text: labels.intro, style: 'intro' },
        questionBlock
      ],
      defaultStyle: {
        font: 'Roboto',
        color: '#1a2332',
        fontSize: 8.5,
        lineHeight: 1.15
      },
      styles: {
        brand: { color: '#c23a1e', bold: true, fontSize: 14 },
        headerLabel: { color: '#6b7789', bold: true, fontSize: 7.2, characterSpacing: 1.1 },
        title: { color: '#1a2332', bold: true, fontSize: 18, lineHeight: 1.02, margin: [0, 12, 0, 6] },
        intro: { color: '#6b7789', fontSize: 8, margin: [0, 0, 0, 10] },
        questionNumber: { color: '#c23a1e', bold: true, fontSize: Math.max(6.5, questionFontSize - 0.2), characterSpacing: 0.8 },
        question: { color: '#1a2332', bold: true, fontSize: questionFontSize, lineHeight: 1.08 },
        answer: { color: '#6b7789', fontSize: Math.max(5.5, questionFontSize - 2), characterSpacing: 0.25 },
        footer: { color: '#6b7789', fontSize: 6.5 }
      }
    };
  }

  buttons.forEach(button => {
    const defaultLabel = button.textContent;

    button.addEventListener('click', async () => {
      button.disabled = true;
      button.textContent = IS_ENGLISH ? 'Preparing PDF…' : 'Przygotowuję PDF…';

      try {
        const pdfMake = await loadPdfMake();
        const definition = createChecklistDefinition(button);
        pdfMake.createPdf(definition).download(button.dataset.pdfFilename || 'CADsmart-checklista.pdf');
        button.textContent = IS_ENGLISH ? 'PDF downloaded ✓' : 'PDF pobrany ✓';
      } catch (error) {
        console.error('Checklist PDF generation failed:', error);
        button.textContent = IS_ENGLISH ? 'Could not create PDF — try again' : 'Nie udało się utworzyć PDF — spróbuj ponownie';
      } finally {
        window.setTimeout(() => {
          button.disabled = false;
          button.textContent = defaultLabel;
        }, 3000);
      }
    });
  });
})();

// ============================================
// Testimonials — manual stacked-card carousel
// ============================================
(function () {
  document.querySelectorAll('[data-testimonial-carousel]').forEach(carousel => {
    const slides = [...carousel.querySelectorAll('[data-testimonial-slide]')];
    const dots = [...carousel.querySelectorAll('[data-testimonial-dot]')];
    const previous = carousel.querySelector('[data-testimonial-prev]');
    const next = carousel.querySelector('[data-testimonial-next]');
    const current = carousel.querySelector('[data-testimonial-current]');
    if (!slides.length || !previous || !next || !current) return;

    let activeIndex = 0;

    function showTestimonial(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.hidden = !isActive;
        slide.classList.toggle('is-active', isActive);
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle('is-active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });

      current.textContent = String(activeIndex + 1).padStart(2, '0');
    }

    previous.addEventListener('click', () => showTestimonial(activeIndex - 1));
    next.addEventListener('click', () => showTestimonial(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => showTestimonial(index)));

    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showTestimonial(activeIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showTestimonial(activeIndex + 1);
      }
    });
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
