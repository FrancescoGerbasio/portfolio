// ===================================
// DARK MODE THEME TOGGLE
// Runs before DOMContentLoaded to prevent flash of wrong theme
// ===================================

(function () {
    'use strict';

    const STORAGE_KEY = 'theme';
    const html = document.documentElement;

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
    }

    function getSavedTheme() {
        return localStorage.getItem(STORAGE_KEY) || 'light';
    }

    function toggleTheme() {
        const current = html.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
    }

    // Apply immediately — before any paint — to prevent flash
    applyTheme(getSavedTheme());

    // Suppress nav dot animation during initial paint
    document.documentElement.classList.add('preload');
    window.addEventListener('load', function () {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.documentElement.classList.remove('preload');
        }));
    });

    document.addEventListener('DOMContentLoaded', function () {
        // Bind both desktop and mobile toggles
        ['themeToggle', 'themeToggleMobile'].forEach(function (id) {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', toggleTheme);
        });

        // Sync across tabs
        window.addEventListener('storage', function (e) {
            if (e.key === STORAGE_KEY && e.newValue) {
                applyTheme(e.newValue);
            }
        });

        // Respect OS preference if user hasn't manually set a preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem(STORAGE_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    });
})();