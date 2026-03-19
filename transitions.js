/* ============================================================
   PAGE TRANSITIONS — Apple spring
   Animates <main> / #page-content only.
   Fixed nav, hamburger, overlays are siblings → unaffected.

   Enter : content springs up from slightly below + fades in
   Leave : content floats up + fades out, then navigates
============================================================ */

(function () {
    'use strict';

    const DURATION_OUT = 260;
    const DURATION_IN  = 520;

    function getTarget() {
        return document.querySelector('main') || document.querySelector('.container');
    }

    function animateIn() {
        const el = getTarget();
        if (!el) return;
        el.classList.add('pt-enter');
        setTimeout(() => el.classList.remove('pt-enter'), DURATION_IN + 60);
    }

    function animateOut(href) {
        const el = getTarget();
        if (!el) return;
        if (el.classList.contains('pt-leave')) return;
        el.classList.add('pt-leave');
        setTimeout(() => { window.location.href = href; }, DURATION_OUT);
    }

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateIn);
    } else {
        requestAnimationFrame(() => requestAnimationFrame(animateIn));
    }

    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            const el = getTarget();
            if (el) el.classList.remove('pt-leave');
            animateIn();
        }
    });

})();