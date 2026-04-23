// ============================================
// Theme toggle (light / dark mode)
// ============================================

// Apply saved theme as early as possible to avoid flash
(function initTheme() {
  const saved = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (systemDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  // Set the correct label for current theme
  const setLabel = () => {
    const current = document.documentElement.getAttribute('data-theme');
    themeToggle.setAttribute(
      'aria-label',
      current === 'dark' ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'
    );
  };
  setLabel();

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setLabel();
  });
}

// ============================================
// Mobile nav toggle
// ============================================
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    toggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });
}

// ============================================
// Auto-highlight active nav link
// ============================================
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ============================================
// Simple contact form handler (demo only)
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
