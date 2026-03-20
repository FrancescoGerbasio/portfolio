/* ============================================================
   CASE STUDY ENGINE — v4
   Clean scale+fade open/close. No card-position snapping.
   Lazy loads overlay HTML from separate fragment files.
   ============================================================ */

(function () {
  'use strict';

  const studies  = [];
  const studyMap = {};
  const loaded   = {};
  const registry = {};

  // ── Fetch and inject overlay HTML ──
  async function loadOverlay(overlayId) {
    if (loaded[overlayId]) return;
    loaded[overlayId] = true;
    try {
      const res  = await fetch(`${overlayId}.html`);
      const text = await res.text();
      const tmp  = document.createElement('div');
      tmp.innerHTML = text;
      while (tmp.firstChild) document.body.appendChild(tmp.firstChild);
      const entry = registry[overlayId];
      if (entry) _register(entry.cardId, overlayId);
    } catch (err) {
      console.error(`Failed to load ${overlayId}.html`, err);
      loaded[overlayId] = false;
    }
  }

  // ── Open — scale up from center ──
  function openOverlay(overlayId) {
    const study = studyMap[overlayId];
    if (!study) return;
    const { overlay, panel } = study;

    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));
    panel.scrollTop = 0;

    // Reset any leftover inline styles from a previous close
    panel.style.cssText = '';

    overlay.classList.add('cs-open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cs-is-open');

    setTimeout(() => setupReveal(panel), 600);
  }

  // ── Close — scale down to center ──
  function closeOverlay(overlayId) {
    const study = studyMap[overlayId];
    if (!study) return;
    const { overlay, panel, progress } = study;

    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));

    overlay.classList.remove('cs-open');
    overlay.classList.add('cs-closing');
    document.body.style.overflow = '';
    document.body.classList.remove('cs-is-open');

    setTimeout(() => {
      overlay.classList.remove('cs-closing');
      panel.scrollTop = 0;
      if (progress) progress.style.width = '0%';
    }, 420);
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

  // ── Internal register (after overlay injected into DOM) ──
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

    panel.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', () => {
        closeOverlay(overlayId);
        setTimeout(() => ensureAndOpen(el.dataset.open), 100);
      });
    });

    const backTop   = panel.querySelector('#cs-back-to-top');
    const backArrow = panel.querySelector('#cs-back-arrow');
    [backTop, backArrow].forEach(el => {
      if (!el) return;
      el.addEventListener('click', () => {
        closeOverlay(overlayId);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 200);
      });
    });

    if (registry[overlayId]?._pendingOpen) {
      registry[overlayId]._pendingOpen = false;
      requestAnimationFrame(() => requestAnimationFrame(() => openOverlay(overlayId)));
    }
  }

  // ── Ensure loaded then open ──
  async function ensureAndOpen(overlayId) {
    if (!loaded[overlayId]) {
      if (!registry[overlayId]) registry[overlayId] = {};
      registry[overlayId]._pendingOpen = true;
      await loadOverlay(overlayId);
      if (studyMap[overlayId]) {
        requestAnimationFrame(() => requestAnimationFrame(() => openOverlay(overlayId)));
      }
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => openOverlay(overlayId)));
    }
  }

  // ── Public register ──
  function register(cardId, overlayId) {
    registry[overlayId] = { cardId, overlayId };
    const card = document.getElementById(cardId);
    if (!card) return;

    card.addEventListener('click', async () => {
      if (!loaded[overlayId]) {
        card.style.cursor = 'wait';
        await loadOverlay(overlayId);
        card.style.cursor = '';
        requestAnimationFrame(() => requestAnimationFrame(() => openOverlay(overlayId)));
      } else {
        openOverlay(overlayId);
      }
    });
  }

  // ── ESC ──
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    studies.forEach(s => {
      if (s.overlay.classList.contains('cs-open')) closeOverlay(s.overlayId);
    });
  });

  window.CaseStudy = { register };

})();