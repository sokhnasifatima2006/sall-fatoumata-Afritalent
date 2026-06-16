/**
 * AFRITALENT — main.js
 * COMMIT 8 : JS : filtrage dynamique des freelances et validation du formulaire de contact
 *
 * Fonctionnalités implémentées :
 * 1. Dark Mode / localStorage          (commit 6)
 * 2. Navbar dynamique au scroll        (commit 6)
 * 3. Bouton retour en haut             (commit 6)
 * 4. Fade-in au scroll                 (commit 7)
 * 5. Compteurs animés                  (commit 7)
 * 6. Filtrage dynamique freelances     (commit 8) ← NOUVEAU
 * 7. Validation formulaire de contact  (commit 8) ← NOUVEAU
 */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────────
   1. DARK MODE
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
───────────────────────────────────────────── */
function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  const handleScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
}

/* ─────────────────────────────────────────────
   3. BOUTON RETOUR EN HAUT
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
   IntersectionObserver — testé sur index.html et about.html
───────────────────────────────────────────── */
function initFadeIn() {
  const elements = $$('.fi');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => {
    if (el.closest('.hero') || el.closest('[style*="background-color:#1A1A2E"]')) {
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });
}

/* ─────────────────────────────────────────────
   5. COMPTEURS ANIMÉS AU SCROLL
   IntersectionObserver — testé sur index.html et about.html
───────────────────────────────────────────── */
function animateCounter(el, target, duration = 1800) {
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const start  = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = prefix + Math.round(target * ease).toLocaleString('fr-FR') + suffix;
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
          animateCounter(entry.target, parseInt(entry.target.dataset.counter, 10));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────────────────
   6. FILTRAGE DYNAMIQUE DES FREELANCES
   Sur freelances.html — sans rechargement de page
   Les cartes .free-wrap ont data-category="dev|design|data|marketing|devops"
───────────────────────────────────────────── */
function initFilter() {
  const btns  = $$('.f-btn');
  const sel   = $('#filterSelect');
  const cards = $$('.free-wrap');

  /* Pas sur la page freelances → sortir */
  if (!cards.length) return;

  /* Filtrer les cartes selon la catégorie choisie */
  const filterCards = (category) => {
    cards.forEach((card) => {
      const match = category === 'all' || card.dataset.category === category;

      if (match) {
        card.style.display = '';
        /* Relancer le fade-in pour les cartes réaffichées */
        const fi = card.querySelector('.fi, .fc');
        if (fi) {
          fi.classList.remove('visible');
          setTimeout(() => fi.classList.add('visible'), 30);
        }
      } else {
        card.style.display = 'none';
      }
    });
  };

  /* Clic sur un bouton de filtre */
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      /* Retirer active de tous les boutons */
      btns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });

      /* Activer le bouton cliqué */
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const category = btn.dataset.filter;

      /* Synchroniser le select */
      if (sel) sel.value = category;

      filterCards(category);
    });
  });

  /* Changement via le select dropdown */
  if (sel) {
    sel.addEventListener('change', () => {
      const category = sel.value;

      /* Synchroniser les boutons */
      btns.forEach((btn) => {
        const active = btn.dataset.filter === category;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });

      filterCards(category);
    });
  }
}

/* ─────────────────────────────────────────────
   7. VALIDATION FORMULAIRE DE CONTACT
   Sur contact.html
   - Tous les champs requis vérifiés
   - Format email vérifié par regex
   - Longueur minimum du message : 20 caractères
   - Messages d'erreur sous chaque champ
   - Message de succès après soumission
───────────────────────────────────────────── */
function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#successMessage');

  /* Pas sur la page contact → sortir */
  if (!form) return;

  /* Regex validation email */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Valider un champ individuel
     Retourne true si valide, false sinon */
  const validateField = (field) => {
    const value    = field.value.trim();
    const feedback = field.parentElement.querySelector('.invalid-feedback');
    let   error    = '';

    /* Champ obligatoire vide */
    if (field.hasAttribute('required') && !value) {
      error = 'Ce champ est obligatoire.';
    }
    /* Format email invalide */
    else if (field.type === 'email' && value && !emailRegex.test(value)) {
      error = 'Veuillez entrer une adresse email valide.';
    }
    /* Message trop court (minimum 20 caractères) */
    else if (field.id === 'message' && value && value.length < 20) {
      error = `Message trop court — ${value.length}/20 caractères minimum.`;
    }

    /* Appliquer les classes de validation Bootstrap */
    if (error) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      if (feedback) feedback.textContent = error;
      return false;
    } else {
      field.classList.remove('is-invalid');
      if (value) field.classList.add('is-valid');
      return true;
    }
  };

  /* Validation en temps réel à la perte du focus */
  $$('.form-control, .form-select', form).forEach((field) => {
    /* Valider quand l'utilisateur quitte le champ */
    field.addEventListener('blur', () => validateField(field));

    /* Re-valider en cours de saisie si déjà en erreur */
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  /* Soumission du formulaire */
  form.addEventListener('submit', (e) => {
    e.preventDefault(); /* Pas d'envoi réel */

    /* Valider tous les champs */
    const fields  = $$('.form-control, .form-select', form);
    const allValid = fields.map(validateField).every(Boolean);

    if (allValid) {
      /* Masquer le formulaire */
      form.style.display = 'none';

      /* Afficher le message de succès stylisé */
      if (success) success.classList.add('show');

      /* Scroller vers le message de succès */
      if (success) success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
  /* Active les animations CSS .fi */
  document.body.classList.add('js-loaded');

  initDarkMode();
  initNavbar();
  initBackToTop();
  initFadeIn();
  initCounters();
  initFilter();       /* COMMIT 8 — filtrage freelances */
  initContactForm();  /* COMMIT 8 — validation formulaire */
  initYear();
});