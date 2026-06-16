/**
 * AFRITALENT — main.js
 * COMMIT 6 : JS : dark mode avec localStorage, navbar dynamique au scroll
 *
 * Fonctionnalités implémentées :
 * 1. Toggle Dark/Light Mode depuis la navbar
 * 2. Thème sauvegardé dans localStorage (persiste entre les pages)
 * 3. Navbar qui change de style au scroll (fond, ombre, effet shrink)
 * 4. Bouton "Retour en haut" qui apparaît au scroll
 */

/* ─────────────────────────────────────────────
   UTILITAIRE — sélecteurs courts
───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────────
   1. DARK MODE / LIGHT MODE
   - Toggle depuis le bouton #darkModeToggle
   - Sauvegardé dans localStorage
   - Persiste entre toutes les pages
───────────────────────────────────────────── */
function initDarkMode() {
  const btn = $('#darkModeToggle');
  if (!btn) return;

  /* Lire le thème déjà appliqué par le script inline dans <head> */
  const getTheme = () =>
    document.documentElement.getAttribute('data-theme') || 'light';

  /* Mettre à jour l'icône du bouton selon le thème actif */
  const updateIcon = (theme) => {
    btn.innerHTML = theme === 'dark'
      ? '<i class="bi bi-sun-fill"></i>'   /* soleil en mode sombre */
      : '<i class="bi bi-moon-fill"></i>'; /* lune en mode clair */
    btn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'
    );
  };

  /* Appliquer l'icône dès le chargement */
  updateIcon(getTheme());

  /* Clic sur le bouton → basculer le thème */
  btn.addEventListener('click', () => {
    const current = getTheme();
    const next    = current === 'dark' ? 'light' : 'dark';

    /* Appliquer sur l'élément <html> */
    document.documentElement.setAttribute('data-theme', next);

    /* Sauvegarder dans localStorage → persiste entre les pages */
    localStorage.setItem('afritalent-theme', next);

    /* Mettre à jour l'icône */
    updateIcon(next);
  });
}

/* ─────────────────────────────────────────────
   2. NAVBAR DYNAMIQUE AU SCROLL
   - Fond transparent → fond opaque au scroll
   - Ombre portée au scroll
   - Effet "shrink" : padding réduit au scroll
───────────────────────────────────────────── */
function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  const handleScroll = () => {
    /* Ajouter/retirer la classe .scrolled selon la position */
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');    /* fond opaque + ombre */
    } else {
      nav.classList.remove('scrolled'); /* fond semi-transparent */
    }
  };

  /* Écouter le scroll (passive pour la performance) */
  window.addEventListener('scroll', handleScroll, { passive: true });

  /* Appel initial pour l'état au chargement */
  handleScroll();

  /* Marquer le lien actif selon la page courante */
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === page) {
      link.classList.add('active');
    }
  });
}

/* ─────────────────────────────────────────────
   3. BOUTON "RETOUR EN HAUT"
   - Apparaît quand on scroll vers le bas
   - Remonte en douceur (smooth scroll)
───────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  /* Afficher/masquer selon la position de scroll */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');    /* visible */
    } else {
      btn.classList.remove('show'); /* caché */
    }
  }, { passive: true });

  /* Clic → remonter en douceur */
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
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
  /* Active les animations CSS fade-in (commit 7) */
  document.body.classList.add('js-loaded');

  initDarkMode();
  initNavbar();
  initBackToTop();
  initYear();
});