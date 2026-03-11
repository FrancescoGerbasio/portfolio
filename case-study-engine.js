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

  // ── Convert a card DOMRect to a clip-path inset() string ──
  // The panel is always position:absolute inset:0 (= full viewport).
  // inset(t% r% b% l% round Rpx) clips it to match the card rect exactly —
  // GPU-composited, zero layout reads per frame, perfect aspect ratio.
  function rectToInset(rect, radius) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const t = (rect.top              / vh * 100).toFixed(3);
    const r = ((vw - rect.right)     / vw * 100).toFixed(3);
    const b = ((vh - rect.bottom)    / vh * 100).toFixed(3);
    const l = (rect.left             / vw * 100).toFixed(3);
    return `inset(${t}% ${r}% ${b}% ${l}% round ${radius}px)`;
  }

  // ── Core open function (used by card click AND next/prev nav) ──
  function openOverlay(overlayId) {
    const study = studyMap[overlayId];
    if (!study) return;

    const { card, overlay, panel, progress } = study;
    const rect = card.getBoundingClientRect();

    // Reset sections + scroll before opening
    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));
    panel.scrollTop = 0;

    // Snap clip to card rect instantly (no transition), then make visible
    // The round value (14px) matches the card's border-radius — clip-path
    // handles ALL rounding so panel border-radius is 0.
    panel.style.transition = 'none';
    panel.style.visibility = 'visible';
    panel.style.clipPath   = rectToInset(rect, 14);

    overlay.classList.add('cs-open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cs-is-open');

    // Double-rAF: browser paints the card-sized clip first,
    // then transitions to full viewport — round animates 14px → 0px smoothly.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.transition = '';
        panel.style.clipPath   = 'inset(0% 0% 0% 0% round 0px)';
      });
    });

    // Set up scroll reveal after animation lands
    setTimeout(() => setupReveal(panel), 700);
  }

  // ── Core close function — instant, no animation ──
  function closeOverlay(overlayId) {
    const study = studyMap[overlayId];
    if (!study) return;

    const { overlay, panel, progress } = study;

    overlay.classList.remove('cs-open');
    document.body.style.overflow = '';
    document.body.classList.remove('cs-is-open');

    panel.style.transition = 'none';
    panel.style.visibility = 'hidden';
    panel.style.clipPath   = 'inset(0% 0% 0% 0% round 0px)';
    panel.style.opacity    = '1';
    panel.style.overflow   = '';
    panel.scrollTop        = 0;
    if (progress) progress.style.width = '0%';
    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));
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

    // Card click → open
    card.addEventListener('click', () => openOverlay(overlayId));

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

  window.CaseStudy = { register };
})();