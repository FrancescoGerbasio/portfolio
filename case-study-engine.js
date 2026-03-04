/* ============================================================
   CASE STUDY ENGINE — JavaScript
   Handles: open/close animation, scroll reveal, progress bar,
            keyboard nav, multiple overlays
   ============================================================ */

(function () {
  'use strict';

  // All registered case studies: { cardEl, overlayEl, panelEl, progressEl }
  const studies = [];

  function register(cardId, overlayId) {
    const card    = document.getElementById(cardId);
    const overlay = document.getElementById(overlayId);
    if (!card || !overlay) return;

    const panel    = overlay.querySelector('.cs-panel');
    const closeBtn = overlay.querySelector('.cs-close-btn');
    const backdrop = overlay.querySelector('.cs-backdrop');
    const progress = overlay.nextElementSibling; // .cs-progress-bar

    const study = { card, overlay, panel, closeBtn, backdrop, progress };
    studies.push(study);

    // ── Scroll reveal inside panel ──
    function setupReveal() {
      const sections = panel.querySelectorAll('.cs-section');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('cs-visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      sections.forEach(s => obs.observe(s));
    }

    // ── Reading progress ──
    panel.addEventListener('scroll', () => {
      if (!progress) return;
      const sh = panel.scrollHeight - panel.clientHeight;
      const pct = sh > 0 ? (panel.scrollTop / sh) * 100 : 0;
      progress.style.width = pct + '%';
    });

    // ── Open ──
    function open() {
      const rect = card.getBoundingClientRect();

      // Snap panel to card rect (no transition)
      panel.style.transition = 'none';
      panel.style.top    = rect.top  + 'px';
      panel.style.left   = rect.left + 'px';
      panel.style.width  = rect.width  + 'px';
      panel.style.height = rect.height + 'px';
      panel.style.borderRadius = '20px';
      panel.scrollTop = 0;

      overlay.classList.add('cs-open');
      document.body.style.overflow = 'hidden';

      // Force reflow then animate to full viewport
      panel.offsetHeight;
      panel.style.transition = '';
      panel.style.top    = '0';
      panel.style.left   = '0';
      panel.style.width  = '100%';
      panel.style.height = '100%';
      panel.style.borderRadius = '0';

      setTimeout(setupReveal, 680);
    }

    // ── Close ──
    function close() {
      // Reset sections for re-open
      panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));

      const rect = card.getBoundingClientRect();
      panel.style.top    = rect.top  + 'px';
      panel.style.left   = rect.left + 'px';
      panel.style.width  = rect.width  + 'px';
      panel.style.height = rect.height + 'px';
      panel.style.borderRadius = '20px';

      overlay.classList.remove('cs-open');
      document.body.style.overflow = '';

      if (progress) {
        setTimeout(() => { progress.style.width = '0%'; panel.scrollTop = 0; }, 780);
      }
    }

    card.addEventListener('click', open);
    if (closeBtn)  closeBtn.addEventListener('click', close);
    if (backdrop)  backdrop.addEventListener('click', close);

    study.close = close;
  }

  // ── Global ESC handler ──
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    studies.forEach(s => {
      if (s.overlay.classList.contains('cs-open') && s.close) s.close();
    });
  });

  // ── Expose globally ──
  window.CaseStudy = { register };
})();
