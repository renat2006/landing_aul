/**
 * IT-AUL i18n Module
 * Lightweight internationalization engine for vanilla JS
 */

import ruLocale from './locales/ru.json';
import enLocale from './locales/en.json';
import zhLocale from './locales/zh.json';
import deLocale from './locales/de.json';
import esLocale from './locales/es.json';

class I18n {
  constructor() {
    this.locales = { ru: ruLocale, en: enLocale, zh: zhLocale, de: deLocale, es: esLocale };
    this.currentLocale = 'ru';
    this.fallbackLocale = 'ru';
    this._listeners = [];
  }

  /**
   * Initialize i18n — detect language and apply translations
   */
  init() {
    this.currentLocale = this._detectLocale();
    this._applyToDOM();
    this._updateHTMLLang();
    this._updateMetaTags();

    // Async geo-detection via Cloudflare (enhances first visit only)
    this._detectCountryAndApply();

    return this;
  }

  /**
   * Detect user locale from URL param → localStorage → navigator.language → fallback
   */
  _detectLocale() {
    // 1. URL parameter ?lang=en
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && this.locales[urlLang]) {
      localStorage.setItem('itaul-lang', urlLang);
      return urlLang;
    }

    // 2. localStorage (user has previously chosen a language)
    const stored = localStorage.getItem('itaul-lang');
    if (stored && this.locales[stored]) {
      return stored;
    }

    // 3. Browser language
    const browserLang = navigator.language?.slice(0, 2);
    if (browserLang && this.locales[browserLang]) {
      return browserLang;
    }

    // 4. Fallback
    return this.fallbackLocale;
  }

  /**
   * Cloudflare geo-detection — async enhancement for first-time visitors
   * Uses /cdn-cgi/trace (free on all Cloudflare Pages sites)
   * Only applies if user hasn't explicitly set a language (no localStorage)
   */
  async _detectCountryAndApply() {
    // Skip if user already chose a language or URL param is set
    const stored = localStorage.getItem('itaul-lang');
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (stored || urlLang) return;

    const country = await this._getUserCountry();
    if (!country) return;

    // Map country codes to supported locales
    const countryToLocale = {
      RU: 'ru', BY: 'ru', KZ: 'ru', UA: 'ru', KG: 'ru', UZ: 'ru',
      US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en', IN: 'en',
      CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
      DE: 'de', AT: 'de', CH: 'de',
      ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
    };

    const detectedLocale = countryToLocale[country];
    if (detectedLocale && detectedLocale !== this.currentLocale && this.locales[detectedLocale]) {
      this.setLocale(detectedLocale);
    }
  }

  /**
   * Fetch user country from Cloudflare /cdn-cgi/trace
   * @returns {Promise<string|null>} ISO country code ('RU', 'US', 'DE', etc.) or null
   */
  async _getUserCountry() {
    try {
      const res = await fetch('/cdn-cgi/trace');
      const text = await res.text();
      const match = text.match(/loc=(\w+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Get translation by dot-notation key
   * @param {string} key - e.g. "hero.badge"
   * @param {object} params - optional interpolation params
   * @returns {string}
   */
  t(key, params = {}) {
    const locale = this.locales[this.currentLocale] || this.locales[this.fallbackLocale];
    let value = this._getNestedValue(locale, key);

    if (value === undefined) {
      // Try fallback locale
      const fallback = this.locales[this.fallbackLocale];
      value = this._getNestedValue(fallback, key);
    }

    if (value === undefined) {
      console.warn(`[i18n] Missing translation key: "${key}"`);
      return key;
    }

    // Simple interpolation: {{param}}
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] ?? `{{${k}}}`);
    }

    return value;
  }

  /**
   * Get nested value from object by dot-notation
   */
  _getNestedValue(obj, key) {
    return key.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  /**
   * Set locale and re-render
   */
  setLocale(locale) {
    if (!this.locales[locale]) {
      console.warn(`[i18n] Unknown locale: "${locale}"`);
      return;
    }
    if (locale === this.currentLocale) return;

    this.currentLocale = locale;
    localStorage.setItem('itaul-lang', locale);

    // Add transition class
    document.body.classList.add('i18n-switching');

    // Apply translations
    this._applyToDOM();
    this._updateHTMLLang();
    this._updateMetaTags();
    this._updateSwitcher();

    // Notify listeners
    this._listeners.forEach(fn => fn(locale));

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { locale } }));

    // Remove transition class
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.classList.remove('i18n-switching');
      }, 300);
    });

    // Update URL param without reload
    const url = new URL(window.location);
    if (locale === this.fallbackLocale) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', locale);
    }
    window.history.replaceState({}, '', url);
  }

  /**
   * Register a callback for language changes
   */
  onLanguageChange(callback) {
    this._listeners.push(callback);
  }

  /**
   * Get current locale
   */
  getLocale() {
    return this.currentLocale;
  }

  /**
   * Apply translations to DOM elements with data-i18n attributes
   */
  _applyToDOM() {
    // data-i18n="key" → textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = this.t(key);
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });

    // data-i18n-html="key" → innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const value = this.t(key);
      if (typeof value === 'string') {
        el.innerHTML = value;
      }
    });

    // data-i18n-placeholder="key" → placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // data-i18n-aria="key" → aria-label attribute
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', this.t(key));
    });

    // data-i18n-list="key" → update <li> children from array
    document.querySelectorAll('[data-i18n-list]').forEach(ul => {
      const key = ul.getAttribute('data-i18n-list');
      const items = this.t(key);
      if (Array.isArray(items)) {
        const lis = ul.querySelectorAll('li');
        items.forEach((text, i) => {
          if (lis[i]) lis[i].textContent = text;
        });
      }
    });
  }

  /**
   * Update <html lang> attribute
   */
  _updateHTMLLang() {
    document.documentElement.lang = this.currentLocale;
  }

  /**
   * Update meta tags for SEO
   */
  _updateMetaTags() {
    const meta = this.t('meta');
    if (!meta || typeof meta !== 'object') return;

    // Title
    if (meta.title) document.title = meta.title;

    // Meta description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && meta.description) descMeta.content = meta.description;

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && meta.ogTitle) ogTitle.content = meta.ogTitle;

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && meta.ogDescription) ogDesc.content = meta.ogDescription;

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      const localeMap = { ru: 'ru_RU', en: 'en_US', zh: 'zh_CN', de: 'de_DE', es: 'es_ES' };
      ogLocale.content = localeMap[this.currentLocale] || 'ru_RU';
    }

    // Twitter tags
    const twTitle = document.querySelector('meta[property="twitter:title"]');
    if (twTitle && meta.twitterTitle) twTitle.content = meta.twitterTitle;

    const twDesc = document.querySelector('meta[property="twitter:description"]');
    if (twDesc && meta.twitterDescription) twDesc.content = meta.twitterDescription;
  }

  /**
   * Update the language switcher UI
   */
  _updateSwitcher() {
    // Update select dropdown
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.value = this.currentLocale;
    }
  }
}

// Singleton instance
const i18n = new I18n();
export default i18n;
