/* ============================================================
   PAGE TRANSITIONS — Apple-style fade
   Uses a full-screen overlay so position:fixed nav is unaffected.
   Enter: overlay fades out (revealing new page)
   Leave: overlay fades in (covering old page) then navigates
   ============================================================ */

(function () {
    'use strict';

    const DURATION_OUT = 300;  // ms — leave (overlay fades in)
    const DURATION_IN  = 400;  // ms — enter (overlay fades out)

    // Inject overlay into DOM
    const overlay = document.createElement('div');
    overlay.id = 'pt-overlay';
    document.body.appendChild(overlay);

    // Animate in — overlay fades out revealing the page
    function animateIn() {
        overlay.classList.add('pt-visible');
        // tiny delay so the browser paints the overlay before removing it
        requestAnimationFrame(() => requestAnimationFrame(() => {
            overlay.classList.add('pt-fade-out');
            setTimeout(() => {
                overlay.classList.remove('pt-visible', 'pt-fade-out');
            }, DURATION_IN + 50);
        }));
    }

    // Animate out — overlay fades in covering the page, then navigate
    function animateOut(href) {
        if (overlay.classList.contains('pt-leaving')) return;
        overlay.classList.add('pt-visible', 'pt-leaving');
        setTimeout(() => {
            window.location.href = href;
        }, DURATION_OUT);
    }

    // Intercept nav clicks
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href) return;

        const isInternal = (
            !anchor.target &&
            !href.startsWith('http') &&
            !href.startsWith('//') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('#') &&
            !anchor.hasAttribute('data-cv-trigger') &&
            !e.ctrlKey && !e.metaKey && !e.shiftKey
        );

        if (!isInternal) return;
        if (document.body.classList.contains('cs-is-open')) return;

        e.preventDefault();
        animateOut(href);
    });

    // Animate in on every page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateIn);
    } else {
        animateIn();
    }

    // Handle back/forward from bfcache
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            overlay.classList.remove('pt-leaving');
            animateIn();
        }
    });

})();