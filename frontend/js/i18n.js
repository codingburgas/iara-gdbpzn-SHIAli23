/* Language selector helper that works with config.js translation engine */
(function () {
    const DEFAULT_LANG = 'bg';
    const STORAGE_KEY = window.LANGUAGE_STORAGE_KEY || 'appLanguage';

    function getSavedLang() {
        if (typeof window.getSavedLanguage === 'function') {
            return window.getSavedLanguage();
        }
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    }

    function saveLang(lang) {
        if (typeof window.saveLanguage === 'function') {
            window.saveLanguage(lang);
            return;
        }
        localStorage.setItem(STORAGE_KEY, lang);
    }

    function createFloatingSelector(current) {
        if (document.getElementById('languageSelect')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'language-switcher-fixed';

        const label = document.createElement('label');
        label.className = 'language-selector';

        const icon = document.createElement('i');
        icon.className = 'fas fa-globe';
        icon.setAttribute('aria-hidden', 'true');
        label.appendChild(icon);

        const sel = document.createElement('select');
        sel.id = 'languageSelect';
        sel.className = 'language-select';
        sel.setAttribute('aria-label', 'Language selector');

        const optBg = document.createElement('option');
        optBg.value = 'bg';
        optBg.text = 'Bulgarian';

        const optEn = document.createElement('option');
        optEn.value = 'en';
        optEn.text = 'English';

        sel.appendChild(optBg);
        sel.appendChild(optEn);
        label.appendChild(sel);
        wrapper.appendChild(label);
        document.body.appendChild(wrapper);
        return sel;
    }

    function applyLanguage(lang) {
        if (typeof window.applyTranslations === 'function') {
            window.applyTranslations(lang);
        } else {
            document.documentElement.lang = lang === 'en' ? 'en' : 'bg';
        }
    }

    function init() {
        const saved = getSavedLang();
        let selector = document.getElementById('languageSelect');
        if (!selector) selector = createFloatingSelector(saved);
        if (!selector) return;

        selector.value = saved;
        selector.addEventListener('change', (event) => {
            const lang = event.target.value;
            saveLang(lang);
            applyLanguage(lang);
        });

        applyLanguage(saved);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
