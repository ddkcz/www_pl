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
