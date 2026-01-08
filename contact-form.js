/**
 * Formulario de Contacto - Validación en Tiempo Real
 * JavaScript Vanilla - Sin dependencias externas
 */

(function() {
    'use strict';

    // Configuración de validación
    const VALIDATION_RULES = {
        nombre: {
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            errorMessages: {
                required: 'El nombre es obligatorio',
                minLength: 'El nombre debe tener al menos 2 caracteres',
                maxLength: 'El nombre no puede exceder 50 caracteres',
                pattern: 'El nombre solo puede contener letras y espacios'
            }
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessages: {
                required: 'El email es obligatorio',
                pattern: 'Por favor, ingresa un email válido'
            }
        },
        mensaje: {
            minLength: 10,
            maxLength: 1000,
            errorMessages: {
                required: 'El mensaje es obligatorio',
                minLength: 'El mensaje debe tener al menos 10 caracteres',
                maxLength: 'El mensaje no puede exceder 1000 caracteres'
            }
        }
    };

    // Referencias a elementos del DOM
    let form;
    let formFields;
    let formStatus;

    /**
     * Inicializa el formulario cuando el DOM está listo
     */
    function init() {
        form = document.getElementById('contactForm');
        if (!form) return;

        formFields = {
            nombre: document.getElementById('nombre'),
            email: document.getElementById('email'),
            mensaje: document.getElementById('mensaje')
        };

        formStatus = document.getElementById('formStatus');

        setupEventListeners();
    }

    /**
     * Configura los event listeners para validación en tiempo real
     */
    function setupEventListeners() {
        // Validación en tiempo real al escribir (debounce)
        Object.keys(formFields).forEach(fieldName => {
            const field = formFields[fieldName];
            let timeout;

            field.addEventListener('input', function() {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    validateField(fieldName);
                }, 300); // Debounce de 300ms
            });

            // Validación al perder el foco
            field.addEventListener('blur', function() {
                validateField(fieldName);
            });
        });

        // Prevenir envío si hay errores
        form.addEventListener('submit', handleSubmit);
    }

    /**
     * Valida un campo individual
     * @param {string} fieldName - Nombre del campo a validar
     * @returns {boolean} - true si es válido, false si hay errores
     */
    function validateField(fieldName) {
        const field = formFields[fieldName];
        const rules = VALIDATION_RULES[fieldName];
        const value = field.value.trim();
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        let isValid = true;
        let errorMessage = '';

        // Validar campo requerido
        if (field.hasAttribute('required') && value === '') {
            isValid = false;
            errorMessage = rules.errorMessages.required;
        }
        // Validar longitud mínima
        else if (rules.minLength && value.length > 0 && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.errorMessages.minLength;
        }
        // Validar longitud máxima
        else if (rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = rules.errorMessages.maxLength;
        }
        // Validar patrón
        else if (rules.pattern && value.length > 0 && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.errorMessages.pattern;
        }

        // Actualizar estado visual y accesibilidad
        updateFieldState(field, errorElement, isValid, errorMessage);

        return isValid;
    }

    /**
     * Actualiza el estado visual y de accesibilidad de un campo
     * @param {HTMLElement} field - Campo del formulario
     * @param {HTMLElement} errorElement - Elemento que muestra el error
     * @param {boolean} isValid - Si el campo es válido
     * @param {string} errorMessage - Mensaje de error (vacío si es válido)
     */
    function updateFieldState(field, errorElement, isValid, errorMessage) {
        if (isValid) {
            field.setAttribute('aria-invalid', 'false');
            field.classList.remove('error');
            field.classList.add('valid');
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        } else {
            field.setAttribute('aria-invalid', 'true');
            field.classList.remove('valid');
            field.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    }

    /**
     * Valida todos los campos del formulario
     * @returns {boolean} - true si todos son válidos
     */
    function validateAllFields() {
        let allValid = true;

        Object.keys(formFields).forEach(fieldName => {
            const fieldValid = validateField(fieldName);
            if (!fieldValid) {
                allValid = false;
            }
        });

        return allValid;
    }

    /**
     * Maneja el envío del formulario
     * @param {Event} event - Evento de submit
     */
    function handleSubmit(event) {
        event.preventDefault();

        // Validar todos los campos
        const isValid = validateAllFields();

        if (!isValid) {
            showFormStatus('Por favor, corrige los errores en el formulario antes de enviar.', 'error');
            
            // Enfocar el primer campo con error
            const firstErrorField = form.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
            
            return;
        }

        // Si es válido, procesar el envío
        submitForm();
    }

    /**
     * Procesa el envío del formulario usando mailto
     */
    function submitForm() {
        // Obtener datos del formulario
        const formData = {
            nombre: formFields.nombre.value.trim(),
            email: formFields.email.value.trim(),
            mensaje: formFields.mensaje.value.trim()
        };

        // Construir asunto del correo
        const subject = encodeURIComponent(`Contacto desde LandingPro Solutions - ${formData.nombre}`);
        
        // Construir cuerpo del correo
        const body = encodeURIComponent(
            `Hola,\n\n` +
            `He visto tu landing page y me interesa conocer más sobre LandingPro Solutions.\n\n` +
            `Nombre: ${formData.nombre}\n` +
            `Email: ${formData.email}\n\n` +
            `Mensaje:\n${formData.mensaje}\n\n` +
            `Saludos cordiales.`
        );

        // Construir URL de mailto
        const mailtoUrl = `mailto:angel@gmail.com?subject=${subject}&body=${body}`;

        // Abrir cliente de correo
        try {
            window.location.href = mailtoUrl;
            
            // Mostrar mensaje de éxito
            showFormStatus('¡Redirigiendo a tu cliente de correo! Por favor, completa el envío desde allí.', 'success');
            
            // Trackear envío exitoso del formulario
            if (typeof window.trackFormSuccess === 'function') {
                window.trackFormSuccess(formData);
            }
            
            // Limpiar formulario después de un breve delay
            setTimeout(() => {
                form.reset();
                
                // Limpiar estados visuales
                Object.keys(formFields).forEach(fieldName => {
                    const field = formFields[fieldName];
                    const errorElement = document.getElementById(`${fieldName}-error`);
                    field.classList.remove('error', 'valid');
                    field.setAttribute('aria-invalid', 'false');
                    errorElement.textContent = '';
                    errorElement.classList.remove('show');
                });

                // Enfocar el primer campo después del éxito
                formFields.nombre.focus();
            }, 2000);
        } catch (error) {
            console.error('Error al abrir cliente de correo:', error);
            showFormStatus('Error al abrir el cliente de correo. Por favor, copia la información y envíala manualmente a angel@gmail.com', 'error');
        }
    }

    /**
     * Muestra un mensaje de estado del formulario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje ('success' o 'error')
     */
    function showFormStatus(message, type) {
        if (!formStatus) return;

        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.classList.add('show');

        // Ocultar mensaje después de 5 segundos (solo para éxito)
        if (type === 'success') {
            setTimeout(() => {
                formStatus.classList.remove('show');
            }, 5000);
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
