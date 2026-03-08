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

    const { card, overlay, panel } = study;

    // Store trigger for focus return on close
    study.triggerEl = document.activeElement;

    // Reset scroll + section reveals
    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));
    panel.scrollTop = 0;

    // Compute card position relative to viewport for clip-path origin
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r  = card.getBoundingClientRect();

    // clip-path inset: top right bottom left
    const t = Math.round(r.top);
    const r_ = Math.round(vw - r.right);
    const b = Math.round(vh - r.bottom);
    const l = Math.round(r.left);
    const radius = 20;

    // Set start clip instantly (no transition)
    panel.style.transition = 'none';
    panel.style.clipPath   = `inset(${t}px ${r_}px ${b}px ${l}px round ${radius}px)`;

    overlay.classList.add('cs-open');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cs-is-open');
    document.querySelector('.container')?.setAttribute('aria-hidden', 'true');

    // Force reflow, then let CSS transition take over to fully open
    panel.offsetHeight;
    panel.style.transition = '';
    panel.style.clipPath   = 'inset(0px 0px 0px 0px round 0px)';

    // Reveal sections + focus close btn after animation lands
    setTimeout(() => {
      setupReveal(panel);
      const closeBtn = overlay.querySelector('.cs-close-btn');
      if (closeBtn) closeBtn.focus();
    }, 620);
  }

  // ── Core close function ──
  function closeOverlay(overlayId) {
    const study = studyMap[overlayId];
    if (!study) return;

    const { card, overlay, panel, progress } = study;

    panel.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));

    // Scroll panel to top first so clip origin matches what user sees
    panel.scrollTop = 0;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r  = card.getBoundingClientRect();

    // If card is off-screen (user scrolled past it), collapse to center
    const cardVisible = r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0;
    let clipTarget;
    if (cardVisible) {
      const t  = Math.round(r.top);
      const r_ = Math.round(vw - r.right);
      const b  = Math.round(vh - r.bottom);
      const l  = Math.round(r.left);
      clipTarget = `inset(${t}px ${r_}px ${b}px ${l}px round 20px)`;
    } else {
      // Collapse to center of screen
      const cy = Math.round(vh / 2);
      const cx = Math.round(vw / 2);
      clipTarget = `inset(${cy}px ${cx}px ${cy}px ${cx}px round 20px)`;
    }

    // Start clip animation — keep cs-open so backdrop fades in sync
    panel.style.clipPath = clipTarget;

    // Fade backdrop out slightly behind the clip
    setTimeout(() => {
      overlay.classList.remove('cs-open');
      overlay.setAttribute('aria-hidden', 'true');
    }, 80);

    document.body.style.overflow = '';
    document.body.classList.remove('cs-is-open');
    document.querySelector('.container')?.removeAttribute('aria-hidden');

    if (study.triggerEl) {
      study.triggerEl.focus();
      study.triggerEl = null;
    }

    // After animation: reset for next open
    setTimeout(() => {
      panel.style.transition = 'none';
      panel.style.clipPath   = 'inset(50% 50% 50% 50% round 20px)';
      panel.scrollTop        = 0;
      if (progress) progress.style.width = '0%';
    }, 680);
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
    const progress = overlay.nextElementSibling?.classList.contains('cs-progress-bar')
                   ? overlay.nextElementSibling : null;

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
        // Instant collapse, no animation
        overlay.classList.remove('cs-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('cs-is-open');
        document.body.style.overflow = '';
        panel.style.transition = 'none';
        panel.style.clipPath   = 'inset(50% 50% 50% 50% round 20px)';
        panel.scrollTop = 0;
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