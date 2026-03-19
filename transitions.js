/* ============================================================
   PAGE TRANSITIONS — Apple-style
   Enter: page scales up from 0.97 + fades in (spring ease)
   Leave: page scales down to 0.98 + fades out (fast)
   ============================================================ */

(function () {
    'use strict';

    const DURATION_OUT = 220;  // ms — leave animation
    const DURATION_IN  = 480;  // ms — enter animation (spring feels longer)

    // Mark the page as ready to animate in
    function animateIn() {
        document.documentElement.classList.add('page-enter');
        setTimeout(() => {
            document.documentElement.classList.remove('page-enter');
        }, DURATION_IN + 100);
    }

    // Animate out then navigate
    function animateOut(href) {
        if (document.documentElement.classList.contains('page-leaving')) return;
        document.documentElement.classList.add('page-leaving');
        setTimeout(() => {
            window.location.href = href;
        }, DURATION_OUT);
    }

    // Intercept nav clicks
    function handleClick(e) {
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

        // Don't intercept if a case study overlay is open
        if (document.body.classList.contains('cs-is-open')) return;

        e.preventDefault();
        animateOut(href);
    }

    document.addEventListener('click', handleClick);

    // Animate in on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateIn);
    } else {
        requestAnimationFrame(() => requestAnimationFrame(animateIn));
    }

    // Handle back/forward navigation
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            document.documentElement.classList.remove('page-leaving');
            animateIn();
        }
    });

})();
