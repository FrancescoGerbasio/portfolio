/* ===================================
   CV LANGUAGE PICKER
   Paste this in your main JS file, or
   add as <script src="cv-picker.js"> before </body>
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
(function () {
    'use strict';

    const picker   = document.getElementById('cvPicker');
    const backdrop = document.getElementById('cvPickerBackdrop');
    if (!picker || !backdrop) return;

    // All nav links that should trigger the picker
    // Works across desktop nav + mobile menu + any other instance
    const triggers = document.querySelectorAll('[data-cv-trigger]');

    let isOpen = false;

    /* ── Position picker below the clicked trigger (desktop only) ── */
    function positionBelow(trigger) {
        if (window.innerWidth <= 768) return; // mobile uses fixed bottom sheet

        const rect   = trigger.getBoundingClientRect();
        const top    = rect.bottom + 10; // 10px gap below nav link
        const center = rect.left + rect.width / 2;

        picker.style.setProperty('--cv-picker-top',  top  + 'px');
        picker.style.setProperty('--cv-picker-left', center + 'px');
    }

    /* ── Open ── */
    function open(trigger) {
        if (isOpen) { close(); return; } // toggle
        positionBelow(trigger);
        picker.classList.add('active');
        backdrop.classList.add('active');
        isOpen = true;
        trigger.setAttribute('aria-expanded', 'true');
    }

    /* ── Close ── */
    function close() {
        if (!isOpen) return;
        picker.classList.remove('active');
        backdrop.classList.remove('active');
        isOpen = false;
        triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
    }

    /* ── Bind triggers ── */
    triggers.forEach(trigger => {
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', 'cvPicker');

        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            open(this);
        });
    });

    /* ── Close on backdrop click ── */
    backdrop.addEventListener('click', close);

    /* ── Close on ESC ── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) close();
    });

    /* ── Close when a CV link is actually clicked ── */
    picker.querySelectorAll('.cv-picker-option').forEach(function (link) {
        link.addEventListener('click', function () {
            // Small delay so the user sees the active state before dismiss
            setTimeout(close, 220);
        });
    });

    /* ── Reposition on resize ── */
    window.addEventListener('resize', function () {
        if (isOpen) {
            const activeTrigger = document.querySelector('[data-cv-trigger][aria-expanded="true"]');
            if (activeTrigger) positionBelow(activeTrigger);
        }
    });

})();
});