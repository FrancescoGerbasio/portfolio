/* ============================================================
   CASE STUDY ENGINE — v3 with lazy loading
   Overlays are fetched from separate HTML files on first click,
   injected into the DOM, then opened. Subsequent opens skip fetch.
   ============================================================ */

(function () {
  'use strict';

  const studies  = [];
  const studyMap = {};

  // Track which overlays have been loaded
  const loaded = {};

  // Map card → overlay id → fragment file
  const registry = {}; // populated by CaseStudy.register()

  // ── Fetch and inject overlay HTML ──
  async function loadOverlay(overlayId) {
    if (loaded[overlayId]) return; // already in DOM
    loaded[overlayId] = true;

    try {
      const res  = await fetch(`${overlayId}.html`);
      const text = await res.text();

      // Parse and inject
      const tmp = document.createElement('div');
      tmp.innerHTML = text;
      while (tmp.firstChild) {
        document.body.appendChild(tmp.firstChild);
      }

      // Re-register now the overlay is in DOM
      const entry = registry[overlayId];
      if (entry) _register(entry.cardId, overlayId);

    } catch (err) {
      console.error(`Failed to load ${overlayId}.html`, err);
      loaded[overlayId] = false; // allow retry
    }
  }

  // ── Core open ──
  function openOverlay(overlayId) {
    const study = studyMap[overlayId];
    if (!study) return;

    const { card, overlay, panel } = study;

    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));
    panel.scrollTop = 0;

    const rect = card.getBoundingClientRect();
    panel.style.transition   = 'none';
    panel.style.visibility   = 'visible';
    panel.style.top          = rect.top    + 'px';
    panel.style.left         = rect.left   + 'px';
    panel.style.width        = rect.width  + 'px';
    panel.style.height       = rect.height + 'px';
    panel.style.borderRadius = '20px';

    overlay.classList.add('cs-open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cs-is-open');

    panel.offsetHeight;
    panel.style.transition   = '';
    panel.style.top          = '0';
    panel.style.left         = '0';
    panel.style.width        = '100%';
    panel.style.height       = '100%';
    panel.style.borderRadius = '0';

    setTimeout(() => setupReveal(panel), 700);
  }

  // ── Core close ──
  function closeOverlay(overlayId) {
    const study = studyMap[overlayId];
    if (!study) return;

    const { card, overlay, panel, progress } = study;

    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));

    const rect = card.getBoundingClientRect();
    panel.style.top          = rect.top    + 'px';
    panel.style.left         = rect.left   + 'px';
    panel.style.width        = rect.width  + 'px';
    panel.style.height       = rect.height + 'px';
    panel.style.borderRadius = '20px';

    overlay.classList.remove('cs-open');
    document.body.style.overflow = '';
    document.body.classList.remove('cs-is-open');

    setTimeout(() => {
      panel.style.visibility = 'hidden';
      panel.style.width      = '0';
      panel.style.height     = '0';
      panel.style.top        = '0';
      panel.style.left       = '0';
      panel.scrollTop        = 0;
      if (progress) progress.style.width = '0%';
    }, 820);
  }

  // ── Scroll reveal ──
  function setupReveal(panel) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('cs-visible'); obs.unobserve(e.target); }
      });
    }, { root: panel, threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    panel.querySelectorAll('.cs-section').forEach(s => obs.observe(s));
  }

  // ── Internal register (called after overlay is in DOM) ──
  function _register(cardId, overlayId) {
    const card    = document.getElementById(cardId);
    const overlay = document.getElementById(overlayId);
    if (!card || !overlay) return;

    const panel    = overlay.querySelector('.cs-panel');
    const closeBtn = overlay.querySelector('.cs-close-btn');
    const backdrop = overlay.querySelector('.cs-backdrop');
    const progress = overlay.nextElementSibling;

    const study = { card, overlay, panel, closeBtn, backdrop, progress, overlayId };
    studies.push(study);
    studyMap[overlayId] = study;

    panel.addEventListener('scroll', () => {
      if (!progress) return;
      const sh = panel.scrollHeight - panel.clientHeight;
      progress.style.width = sh > 0 ? (panel.scrollTop / sh) * 100 + '%' : '0%';
    });

    if (closeBtn) closeBtn.addEventListener('click', () => closeOverlay(overlayId));
    if (backdrop) backdrop.addEventListener('click', () => closeOverlay(overlayId));

    // "Next project" links
    panel.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.dataset.open;
        overlay.classList.remove('cs-open');
        document.body.classList.remove('cs-is-open');
        panel.style.visibility = 'hidden';
        panel.style.width = '0'; panel.style.height = '0';
        panel.scrollTop = 0;
        document.body.style.overflow = '';

        // Load target if needed, then open
        ensureAndOpen(targetId);
      });
    });

    // Back to top
    const backTop   = panel.querySelector('#cs-back-to-top');
    const backArrow = panel.querySelector('#cs-back-arrow');
    [backTop, backArrow].forEach(el => {
      if (!el) return;
      el.addEventListener('click', () => {
        closeOverlay(overlayId);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 200);
      });
    });

    // Now open if this was triggered by a click
    if (study._pendingOpen) {
      study._pendingOpen = false;
      openOverlay(overlayId);
    }
  }

  // ── Ensure overlay is loaded then open ──
  async function ensureAndOpen(overlayId) {
    if (!loaded[overlayId]) {
      // Mark as pending so _register opens it when ready
      registry[overlayId] = registry[overlayId] || {};
      registry[overlayId]._pendingOpen = true;

      await loadOverlay(overlayId);

      // If _register already ran (sync path), open now
      if (studyMap[overlayId] && !studyMap[overlayId]._pendingOpen) {
        requestAnimationFrame(() => requestAnimationFrame(() => openOverlay(overlayId)));
      }
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => openOverlay(overlayId)));
    }
  }

  // ── Public register — called on DOMContentLoaded for each card ──
  function register(cardId, overlayId) {
    registry[overlayId] = { cardId, overlayId };

    const card = document.getElementById(cardId);
    if (!card) return;

    card.addEventListener('click', async () => {
      if (!loaded[overlayId]) {
        // Show a subtle loading state on the card
        card.style.cursor = 'wait';
        await loadOverlay(overlayId);
        card.style.cursor = '';
        requestAnimationFrame(() => requestAnimationFrame(() => openOverlay(overlayId)));
      } else {
        openOverlay(overlayId);
      }
    });
  }

  // ── Global ESC ──
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    studies.forEach(s => {
      if (s.overlay.classList.contains('cs-open')) closeOverlay(s.overlayId);
    });
  });

  window.CaseStudy = { register };

})();