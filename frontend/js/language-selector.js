/* Professional Language Selector - Integrates with config.js */
(function () {
    'use strict';

    const DEFAULT_LANG = 'bg';
    const STORAGE_KEYS = ['appLanguage', 'app_lang', 'app_language'];

    // Detect currently saved language
    function detectLanguage() {
        for (let key of STORAGE_KEYS) {
            const stored = localStorage.getItem(key);
            if (stored && (stored === 'bg' || stored === 'en')) {
                return stored;
            }
        }
        return DEFAULT_LANG;
    }

    // Initialize the language selector
    function initLanguageSelector() {
        let selector = document.getElementById('languageSelect');
        const currentLang = detectLanguage();

        // Create floating selector if one doesn't exist
        if (!selector) {
            const wrapper = document.createElement('div');
            wrapper.className = 'language-switcher-fixed';

            const label = document.createElement('label');
            label.className = 'language-selector';
            label.setAttribute('role', 'combobox');
            label.setAttribute('aria-expanded', 'false');
            label.setAttribute('aria-label', 'Select language');

            const icon = document.createElement('i');
            icon.className = 'fas fa-globe';
            icon.setAttribute('aria-hidden', 'true');

            const sel = document.createElement('select');
            sel.id = 'languageSelect';
            sel.className = 'language-select';

            const optBg = document.createElement('option');
            optBg.value = 'bg';
            optBg.textContent = 'Bulgarian';

            const optEn = document.createElement('option');
            optEn.value = 'en';
            optEn.textContent = 'English';

            sel.appendChild(optBg);
            sel.appendChild(optEn);
            sel.value = currentLang;

            label.appendChild(icon);
            label.appendChild(sel);
            wrapper.appendChild(label);
            document.body.appendChild(wrapper);

            selector = sel;
            
            // Attach listener for floating selector since config.js won't find it yet
            selector.addEventListener('change', handleLanguageChange);
            selector.dataset.languageListenerAttached = 'true';
        } else {
            // Update value if selector already exists
            selector.value = currentLang;
        }

        return selector;
    }

    // Handle language change (only for floating selectors created by this script)
    function handleLanguageChange(event) {
        const newLang = event.target.value;
        
        // Sync to all storage keys
        localStorage.setItem('appLanguage', newLang);
        localStorage.setItem('app_lang', newLang);
        localStorage.setItem('app_language', newLang);

        // Use config.js applyTranslations if available
        if (typeof window.applyTranslations === 'function') {
            window.applyTranslations(newLang);
        }

        // Dispatch custom event for page-specific handlers
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: newLang } }));
    }

    // Main initialization - wait for config.js to load first
    function init() {
        const checkConfigLoaded = setInterval(() => {
            if (typeof window.applyTranslations === 'function' && typeof window.setupLanguageSwitcher === 'function') {
                clearInterval(checkConfigLoaded);
                
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        setTimeout(initLanguageSelector, 50);
                    });
                } else {
                    initLanguageSelector();
                }
                
                // Call setupLanguageSwitcher from config.js to ensure it attaches listener
                window.setupLanguageSwitcher();
            }
        }, 10);
        
        // Fallback if config.js not loaded
        setTimeout(() => {
            clearInterval(checkConfigLoaded);
            if (typeof window.applyTranslations !== 'function') {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        setTimeout(initLanguageSelector, 50);
                    });
                } else {
                    initLanguageSelector();
                }
            }
        }, 1000);
    }

    // Start
    init();

    // Export to global scope
    window.LanguageSelector = {
        getCurrentLanguage: detectLanguage,
        setLanguage: function (lang) {
            if (lang !== 'bg' && lang !== 'en') return;
            
            // Sync to all storage keys
            localStorage.setItem('appLanguage', lang);
            localStorage.setItem('app_lang', lang);
            localStorage.setItem('app_language', lang);
            
            const selector = document.getElementById('languageSelect');
            if (selector) {
                selector.value = lang;
                selector.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    };

})();
