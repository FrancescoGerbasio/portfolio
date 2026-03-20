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
        // Force iOS Safari to update browser chrome color
        // setAttribute alone is ignored — remove+recreate is the reliable fix
        const color = theme === 'dark' ? '#252525' : '#fdf5f6';
        let meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.parentNode.removeChild(meta);
        }
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.id = 'themeColorMeta';
        meta.content = color;
        document.head.appendChild(meta);
    }

    function getSavedTheme() {
        return localStorage.getItem(STORAGE_KEY) || 'light';
    }

    function toggleTheme() {
        const current = html.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        // Reload only on mobile so iOS Safari updates the status bar color
        if (window.innerWidth <= 768) {
            location.reload();
        } else {
            applyTheme(next);
        }
    }

    // Apply immediately — before any paint — to prevent flash
    applyTheme(getSavedTheme());

    document.addEventListener('DOMContentLoaded', function () {
        // Sync theme-color meta with saved theme
        const meta = document.getElementById('themeColorMeta');
        if (meta) meta.setAttribute('content', getSavedTheme() === 'dark' ? '#252525' : '#fdf5f6');

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