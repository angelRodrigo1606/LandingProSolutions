/**
 * Sistema de Modo Oscuro/Claro
 * Detecta preferencia del sistema, guarda en localStorage y restaura al recargar
 */

(function() {
    'use strict';

    const THEME_STORAGE_KEY = 'landingpro-theme';
    const THEME_ATTRIBUTE = 'data-theme';

    /**
     * Obtiene el tema preferido del sistema
     * @returns {string} 'dark' o 'light'
     */
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Obtiene el tema guardado en localStorage
     * @returns {string|null} 'dark', 'light' o null
     */
    function getStoredTheme() {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch (e) {
            console.warn('No se pudo acceder a localStorage:', e);
            return null;
        }
    }

    /**
     * Guarda el tema en localStorage
     * @param {string} theme - 'dark' o 'light'
     */
    function setStoredTheme(theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
        }
    }

    /**
     * Aplica el tema al documento
     * @param {string} theme - 'dark' o 'light'
     */
    function applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.setAttribute(THEME_ATTRIBUTE, 'dark');
        } else {
            html.removeAttribute(THEME_ATTRIBUTE);
        }
    }

    /**
     * Obtiene el tema actual
     * @returns {string} 'dark' o 'light'
     */
    function getCurrentTheme() {
        return document.documentElement.getAttribute(THEME_ATTRIBUTE) === 'dark' ? 'dark' : 'light';
    }

    /**
     * Alterna entre modo oscuro y claro
     */
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme);
        setStoredTheme(newTheme);
        
        // Actualizar icono del botón
        updateThemeButton(newTheme);
        
        // Trackear cambio de tema (si existe tracking)
        if (typeof trackEvent === 'function') {
            trackEvent('theme_toggle', {
                from: currentTheme,
                to: newTheme
            });
        }
    }

    /**
     * Actualiza el icono del botón de tema
     * @param {string} theme - 'dark' o 'light'
     */
    function updateThemeButton(theme) {
        const button = document.getElementById('themeToggle');
        if (button) {
            button.setAttribute('aria-label', 
                theme === 'dark' 
                    ? 'Cambiar a modo claro' 
                    : 'Cambiar a modo oscuro'
            );
        }
    }

    /**
     * Inicializa el sistema de temas
     */
    function initTheme() {
        // Obtener tema: primero de localStorage, luego del sistema
        const storedTheme = getStoredTheme();
        const systemTheme = getSystemTheme();
        const initialTheme = storedTheme || systemTheme;

        // Aplicar tema inicial (sin transición para evitar flash)
        applyTheme(initialTheme);
        updateThemeButton(initialTheme);

        // Configurar listener para cambios en preferencia del sistema
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Solo aplicar si no hay preferencia guardada
            if (!storedTheme) {
                mediaQuery.addEventListener('change', function(e) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    applyTheme(newTheme);
                    updateThemeButton(newTheme);
                });
            }
        }

        // Configurar botón toggle
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleTheme);
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        // Si el DOM ya está listo, inicializar inmediatamente
        // pero después de un pequeño delay para evitar flash
        setTimeout(initTheme, 0);
    }
})();
