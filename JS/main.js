/**
 * AFRITALENT — main.js
 * COMMIT 7 : JS : compteurs animés au scroll et animations fade-in des sections
 *
 * Fonctionnalités implémentées :
 * 1. Toggle Dark/Light Mode (commit 6)
 * 2. Thème sauvegardé dans localStorage (commit 6)
 * 3. Navbar dynamique au scroll (commit 6)
 * 4. Bouton "Retour en haut" (commit 6)
 * 5. Compteurs animés de 0 à leur valeur cible au scroll — IntersectionObserver
 * 6. Animations fade-in des sections à l'entrée dans le viewport — IntersectionObserver
 */

/* ─────────────────────────────────────────────
   UTILITAIRE — sélecteurs courts
───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────────
   1. DARK MODE / LIGHT MODE
   Sauvegardé dans localStorage, persiste entre les pages
───────────────────────────────────────────── */
function initDarkMode() {
  const btn = $('#darkModeToggle');
  if (!btn) return;

  const getTheme = () =>
    document.documentElement.getAttribute('data-theme') || 'light';

  const updateIcon = (theme) => {
    btn.innerHTML = theme === 'dark'
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-fill"></i>';
    btn.setAttribute('aria-label',
      theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre');
  };

  updateIcon(getTheme());

  btn.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('afritalent-theme', next);
    updateIcon(next);
  });
}

/* ─────────────────────────────────────────────
   2. NAVBAR DYNAMIQUE AU SCROLL
   Fond + ombre + effet shrink au scroll
───────────────────────────────────────────── */
function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  const handleScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* Lien actif selon la page courante */
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
}

/* ─────────────────────────────────────────────
   3. BOUTON RETOUR EN HAUT
   Apparaît après 400px de scroll
───────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────
   4. ANIMATIONS FADE-IN AU SCROLL
   Les éléments .fi apparaissent en fondu
   quand ils entrent dans le viewport
   Utilise IntersectionObserver
   Testé sur index.html et about.html
───────────────────────────────────────────── */
function initFadeIn() {
  const elements = $$('.fi');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          /* Ajouter .visible → déclenche la transition CSS */
          entry.target.classList.add('visible');
          /* Ne s'anime qu'une seule fois */
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach((el) => {
    /* Les éléments dans le hero sont visibles immédiatement */
    if (el.closest('.hero') || el.closest('[style*="background-color:#1A1A2E"]')) {
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });
}

/* ─────────────────────────────────────────────
   5. COMPTEURS ANIMÉS AU SCROLL
   Les chiffres s'animent de 0 à leur valeur cible
   Usage HTML : <span data-counter="2500" data-suffix="+">0</span>
   Utilise IntersectionObserver
   Testé sur index.html et about.html
───────────────────────────────────────────── */

/* Animer un compteur de 0 à target en duration ms */
function animateCounter(el, target, duration = 1800) {
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const start  = performance.now();

  const step = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);

    /* Easing easeOutExpo — accélération puis ralentissement */
    const ease = progress === 1
      ? 1
      : 1 - Math.pow(2, -10 * progress);

    const current = Math.round(target * ease);

    /* Afficher avec séparateur de milliers français */
    el.textContent = prefix + current.toLocaleString('fr-FR') + suffix;

    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.counter, 10);
          animateCounter(entry.target, target);
          /* Chaque compteur ne s'anime qu'une seule fois */
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────────────────
   ANNÉE DYNAMIQUE dans le footer
───────────────────────────────────────────── */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────
   INITIALISATION AU CHARGEMENT DU DOM
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Active les animations CSS .fi (js-loaded sur body) */
  document.body.classList.add('js-loaded');

  initDarkMode();
  initNavbar();
  initBackToTop();
  initFadeIn();    /* COMMIT 7 — fade-in au scroll */
  initCounters();  /* COMMIT 7 — compteurs animés */
  initYear();
});