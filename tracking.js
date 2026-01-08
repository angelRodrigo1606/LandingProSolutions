/**
 * Sistema de Tracking para Landing Page
 * Compatible con Google Analytics, Facebook Pixel y otros sistemas de tracking
 * JavaScript Vanilla - Sin dependencias
 */

(function() {
    'use strict';

    // Configuración de tracking
    const TRACKING_CONFIG = {
        // Habilitar/deshabilitar tracking
        enabled: true,
        
        // IDs de tracking (configurar según necesidad)
        googleAnalyticsId: 'GA_MEASUREMENT_ID', // Reemplazar con ID real
        facebookPixelId: 'FACEBOOK_PIXEL_ID',   // Reemplazar con ID real
        
        // Debug mode
        debug: false
    };

    /**
     * Inicializa el sistema de tracking
     */
    function initTracking() {
        if (!TRACKING_CONFIG.enabled) {
            log('Tracking deshabilitado');
            return;
        }

        setupCTATracking();
        setupFormTracking();
        setupScrollTracking();
        
        log('Sistema de tracking inicializado');
    }

    /**
     * Configura tracking para todos los CTAs
     */
    function setupCTATracking() {
        const ctaElements = document.querySelectorAll('[data-track="cta_click"]');
        
        ctaElements.forEach(element => {
            element.addEventListener('click', function(event) {
                const trackingData = {
                    event: 'cta_click',
                    location: element.getAttribute('data-track-location') || 'unknown',
                    type: element.getAttribute('data-track-type') || 'unknown',
                    label: element.getAttribute('data-track-label') || element.textContent.trim(),
                    plan: element.getAttribute('data-track-plan') || null,
                    url: element.href || window.location.href,
                    timestamp: new Date().toISOString()
                };

                trackEvent('cta_click', trackingData);
                log('CTA clicked:', trackingData);
            });
        });
    }

    /**
     * Configura tracking para el formulario
     */
    function setupFormTracking() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const submitButton = form.querySelector('[data-track="form_submit"]');
        
        if (submitButton) {
            submitButton.addEventListener('click', function() {
                const trackingData = {
                    event: 'form_submit_attempt',
                    location: submitButton.getAttribute('data-track-location') || 'contact_form',
                    timestamp: new Date().toISOString()
                };

                trackEvent('form_submit_attempt', trackingData);
                log('Form submit attempted:', trackingData);
            });
        }

        // Tracking cuando el formulario se envía exitosamente
        form.addEventListener('submit', function(event) {
            // El tracking real se hace después de validación exitosa
            // en contact-form.js
        });
    }

    /**
     * Configura tracking de scroll (opcional)
     */
    function setupScrollTracking() {
        const sections = document.querySelectorAll('section[id]');
        const viewedSections = new Set();
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !viewedSections.has(entry.target.id)) {
                    viewedSections.add(entry.target.id);
                    
                    const trackingData = {
                        event: 'section_view',
                        section: entry.target.id,
                        sectionName: entry.target.querySelector('h2, h1')?.textContent || entry.target.id,
                        timestamp: new Date().toISOString()
                    };

                    trackEvent('section_view', trackingData);
                    log('Section viewed:', trackingData);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Función principal de tracking
     * @param {string} eventName - Nombre del evento
     * @param {Object} data - Datos del evento
     */
    function trackEvent(eventName, data) {
        if (!TRACKING_CONFIG.enabled) return;

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: data.location || 'general',
                event_label: data.label || eventName,
                value: 1,
                ...data
            });
        }

        // Google Analytics Universal (legacy)
        if (typeof ga !== 'undefined') {
            ga('send', 'event', {
                eventCategory: data.location || 'general',
                eventAction: eventName,
                eventLabel: data.label || eventName,
                ...data
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, data);
        }

        // Enviar a endpoint personalizado (opcional)
        sendToCustomEndpoint(eventName, data);
    }

    /**
     * Envía datos a un endpoint personalizado
     * @param {string} eventName - Nombre del evento
     * @param {Object} data - Datos del evento
     */
    function sendToCustomEndpoint(eventName, data) {
        // Descomentar y configurar según necesidad
        /*
        if (navigator.sendBeacon) {
            const payload = JSON.stringify({
                event: eventName,
                ...data,
                page: window.location.pathname,
                referrer: document.referrer,
                userAgent: navigator.userAgent
            });

            navigator.sendBeacon('/api/track', payload);
        }
        */
    }

    /**
     * Función de logging para debug
     * @param {...any} args - Argumentos a loguear
     */
    function log(...args) {
        if (TRACKING_CONFIG.debug) {
            console.log('[Tracking]', ...args);
        }
    }

    /**
     * Función para trackear envío exitoso del formulario
     * Llamada desde contact-form.js después de envío exitoso
     */
    window.trackFormSuccess = function(formData) {
        const trackingData = {
            event: 'form_submit_success',
            location: 'contact_form',
            formData: {
                hasName: !!formData.nombre,
                hasEmail: !!formData.email,
                messageLength: formData.mensaje ? formData.mensaje.length : 0
            },
            timestamp: new Date().toISOString()
        };

        trackEvent('form_submit_success', trackingData);
        log('Form submitted successfully:', trackingData);
    };

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }
})();
