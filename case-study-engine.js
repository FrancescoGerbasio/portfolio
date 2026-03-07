/* ============================================================
   CASE STUDY ENGINE — JavaScript v2
   Fixes:
   - "Next project" navigation now properly resets scroll reveal
   - "Back to all" closes overlay and scrolls to top of page
   - Close button position avoids hamburger on mobile
   ============================================================ */

(function () {
  'use strict';

  const studies   = [];
  const studyMap  = {}; // overlayId → study

  // ── Core open function (used by card click AND next/prev nav) ──
  function openOverlay(overlayId) {
    const study = studyMap[overlayId];
    if (!study) return;

    const { card, overlay, panel, progress } = study;
    const rect = card.getBoundingClientRect();

    // Store trigger so we can return focus on close
    study.triggerEl = document.activeElement;

    // Reset sections before opening so reveal fires fresh
    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));
    panel.scrollTop = 0;

    // Position panel at card, make visible, no transition
    panel.style.transition   = 'none';
    panel.style.visibility   = 'visible';
    panel.style.top          = rect.top    + 'px';
    panel.style.left         = rect.left   + 'px';
    panel.style.width        = rect.width  + 'px';
    panel.style.height       = rect.height + 'px';
    panel.style.borderRadius = '20px';

    overlay.classList.add('cs-open');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cs-is-open');

    // Hide main page content from AT
    document.querySelector('.container')?.setAttribute('aria-hidden', 'true');

    // Force reflow then animate to fullscreen
    panel.offsetHeight;
    panel.style.transition   = '';
    panel.style.top          = '0';
    panel.style.left         = '0';
    panel.style.width        = '100%';
    panel.style.height       = '100%';
    panel.style.borderRadius = '0';

    // Set up scroll reveal + move focus to close button after animation lands
    setTimeout(() => {
      setupReveal(panel);
      const closeBtn = overlay.querySelector('.cs-close-btn');
      if (closeBtn) closeBtn.focus();
    }, 700);
  }

  // ── Core close function ──
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
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('cs-is-open');

    // Restore main page to AT and return focus to card that opened this
    document.querySelector('.container')?.removeAttribute('aria-hidden');
    if (study.triggerEl) {
      study.triggerEl.focus();
      study.triggerEl = null;
    }

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

  // ── Scroll reveal observer ──
  function setupReveal(panel) {
    const sections = panel.querySelectorAll('.cs-section');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('cs-visible');
          obs.unobserve(e.target);
        }
      });
    }, { root: panel, threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // ── Register a case study ──
  function register(cardId, overlayId) {
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

    // Reading progress bar
    panel.addEventListener('scroll', () => {
      if (!progress) return;
      const sh = panel.scrollHeight - panel.clientHeight;
      progress.style.width = sh > 0 ? (panel.scrollTop / sh) * 100 + '%' : '0%';
    });

    // Card click + keyboard → open
    card.addEventListener('click', () => openOverlay(overlayId));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOverlay(overlayId); }
    });

    // Focus trap inside panel
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeOverlay(overlayId); return; }
      if (e.key !== 'Tab') return;
      const focusable = Array.from(panel.querySelectorAll(
        'a[href], button, input, [tabindex]:not([tabindex="-1"])'
      )).filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });

    // Close button
    if (closeBtn) closeBtn.addEventListener('click', () => closeOverlay(overlayId));

    // Backdrop click
    if (backdrop) backdrop.addEventListener('click', () => closeOverlay(overlayId));

    // "Next project" links inside this panel
    panel.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.dataset.open;
        // Close current WITHOUT animation (instant), then open target
        overlay.classList.remove('cs-open');
        document.body.classList.remove('cs-is-open');
        panel.style.visibility = 'hidden';
        panel.style.width = '0'; panel.style.height = '0';
        panel.scrollTop = 0;
        document.body.style.overflow = '';
        // Small delay so the DOM settles, then open target
        requestAnimationFrame(() => requestAnimationFrame(() => openOverlay(targetId)));
      });
    });

    // "Back to all projects" — close and scroll page to top
    const backTop   = panel.querySelector('#cs-back-to-top');
    const backArrow = panel.querySelector('#cs-back-arrow');
    [backTop, backArrow].forEach(el => {
      if (!el) return;
      el.addEventListener('click', () => {
        closeOverlay(overlayId);
        // After close animation, scroll main page back to top
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 200);
      });
    });
  }

  // ── Global ESC ──
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    studies.forEach(s => {
      if (s.overlay.classList.contains('cs-open')) closeOverlay(s.overlayId);
    });
  });

  // Mark all overlays hidden from AT on init; openOverlay removes it
  document.querySelectorAll('.cs-overlay').forEach(o => o.setAttribute('aria-hidden', 'true'));

  window.CaseStudy = { register };
})();