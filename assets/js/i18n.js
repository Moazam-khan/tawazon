/* ==========================================================================
   Tawazon Plus — i18n (English + Arabic)
   - Strings live in assets/lang/en.js and ar.js (registered into TZ.LANGS).
   - Mark text with data-i18n="home.canSpendToday". Optional:
       data-i18n-vars='{"day":8}'   -> fills {day}
       data-i18n-aria="key"         -> sets aria-label
   - The nearest ancestor with data-lang decides the language of an element,
     which lets the design-system page show EN and AR side by side.
   - Everything else uses the page language (<html lang>), saved in localStorage.
   ========================================================================== */
window.TZ = window.TZ || {};
TZ.LANGS = TZ.LANGS || {};
TZ.settings = TZ.settings || { lang: 'en', digits: 'latn' };   // digits: 'latn' | 'arab'

TZ.i18n = (function () {
  const S = TZ.settings;
  const CURRENCY = { en: 'SAR', ar: 'ر.س' };
  const DIR = { en: 'ltr', ar: 'rtl' };

  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function load(key)       { try { return localStorage.getItem(key); } catch (e) { return null; } }

  function dict(lang) { return TZ.LANGS[lang] || {}; }
  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }

  /* Plural forms: a key whose value is { one, two, few, many, other } picks the
     right form from vars.n (Arabic: 1 يوم واحد · 2 يومان · 3–10 أيام · 11+ يومًا) */
  function toNumber(v) {
    return Number(String(v).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[^\d.-]/g, ''));
  }
  const FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];
  function isPlural(o) { return o && typeof o === 'object' && o.other != null && Object.keys(o).every(function (k) { return FORMS.indexOf(k) > -1; }); }
  function pickPlural(forms, vars, lang) {
    const n = vars && 'n' in vars ? toNumber(vars.n) : NaN;
    if (isNaN(n)) return forms.other;
    const cat = new Intl.PluralRules(lang).select(n);
    return forms[cat] != null ? forms[cat] : forms.other;
  }

  /* t('home.day', {day: 8}) — falls back to English, then to the key itself */
  function t(key, vars, lang) {
    lang = lang || S.lang;
    let s = get(dict(lang), key);
    if (s == null) s = get(dict('en'), key);
    if (s == null) { console.warn('[i18n] missing key:', key); return key; }
    if (isPlural(s)) s = pickPlural(s, vars, lang);
    return String(s).replace(/\{(\w+)\}/g, function (m, k) {
      return vars && k in vars ? vars[k] : m;
    });
  }

  /* ---------- number + money formatting ---------- */
  function fmtNumber(n, lang) {
    lang = lang || S.lang;
    const loc = (lang === 'ar' && S.digits === 'arab') ? 'ar-SA-u-nu-arab' : 'en-US';
    return new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(n);
  }
  /* digit-by-digit conversion for keypad keys and raw typed strings */
  function fmtDigits(str, lang) {
    lang = lang || S.lang;
    if (!(lang === 'ar' && S.digits === 'arab')) return String(str);
    return String(str).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; });
  }
  /* 8.25 -> "8.25" / "٨٫٢٥" */
  function fmtDecimal(n, digits, lang) {
    lang = lang || S.lang;
    const loc = (lang === 'ar' && S.digits === 'arab') ? 'ar-SA-u-nu-arab' : 'en-US';
    return new Intl.NumberFormat(loc, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  }
  function currency(lang) { return CURRENCY[lang || S.lang]; }
  function money(n, lang) { return fmtNumber(n, lang) + ' ' + currency(lang); }   /* no-break space: never split amount from currency */

  /* ---------- amount in words (design mock; real app can reuse this) ---------- */
  const EN_ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const EN_TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function enUnder1000(n) {
    const out = [];
    if (n >= 100) { out.push(EN_ONES[Math.floor(n / 100)] + ' hundred'); n %= 100; }
    if (n >= 20)  { out.push(EN_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + EN_ONES[n % 10] : '')); }
    else if (n > 0) { out.push(EN_ONES[n]); }
    return out.join(' ');
  }
  function enWords(n) {
    if (n === 0) return 'zero';
    const parts = [];
    [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']].forEach(function (u) {
      if (n >= u[0]) { parts.push(enUnder1000(Math.floor(n / u[0])) + ' ' + u[1]); n %= u[0]; }
    });
    if (n > 0) parts.push(enUnder1000(n));
    return parts.join(' ');
  }

  const AR_TEENS = ['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة','أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'];
  const AR_TENS  = ['','','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'];
  const AR_HUND  = ['','مائة','مائتان','ثلاثمائة','أربعمائة','خمسمائة','ستمائة','سبعمائة','ثمانمائة','تسعمائة'];
  function arUnder1000(n) {
    const parts = [];
    const h = Math.floor(n / 100), r = n % 100;
    if (h) parts.push(AR_HUND[h]);
    if (r) {
      if (r < 20) parts.push(AR_TEENS[r]);
      else {
        const u = r % 10, tn = Math.floor(r / 10);
        parts.push(u ? AR_TEENS[u] + ' و' + AR_TENS[tn] : AR_TENS[tn]);
      }
    }
    return parts.join(' و');
  }
  function arScale(n, one, two, few, many) {
    if (n === 1) return one;
    if (n === 2) return two;
    if (n >= 3 && n <= 10) return arUnder1000(n) + ' ' + few;
    return arUnder1000(n) + ' ' + many;
  }
  function arWords(n) {
    if (n === 0) return 'صفر';
    const parts = [];
    const m = Math.floor(n / 1e6); n %= 1e6;
    const th = Math.floor(n / 1e3); n %= 1e3;
    if (m)  parts.push(arScale(m, 'مليون', 'مليونان', 'ملايين', 'مليون'));
    if (th) parts.push(arScale(th, 'ألف', 'ألفان', 'آلاف', 'ألف'));
    if (n)  parts.push(arUnder1000(n));
    return parts.join(' و');
  }

  /* "Two thousand five hundred riyals" / "ألفان وخمسمائة ريال"
     Simplified agreement of the noun (fine for a design mock). */
  function words(n, lang) {
    lang = lang || S.lang;
    n = Math.floor(Math.abs(Number(n) || 0));
    if (n > 999999999) n = 999999999;
    if (lang === 'ar') {
      const last = n % 100;
      let noun;
      if (n === 1) return 'ريال واحد';
      if (n === 2) return 'ريالان';
      if (last >= 3 && last <= 10) noun = 'ريالات';
      else if (last >= 11) noun = 'ريالًا';
      else noun = 'ريال';
      return arWords(n) + ' ' + noun;
    }
    const w = enWords(n) + (n === 1 ? ' riyal' : ' riyals');
    return w.charAt(0).toUpperCase() + w.slice(1);
  }

  /* ---------- applying translations to the DOM ---------- */
  function langOf(el, fallback) {
    const scope = el.closest('[data-lang]');
    return (scope && scope.getAttribute('data-lang')) || fallback || S.lang;
  }
  function parseVars(el) {
    const raw = el.getAttribute('data-i18n-vars');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function apply(root, fallbackLang) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'), parseVars(el), langOf(el, fallbackLang));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'), parseVars(el), langOf(el, fallbackLang)));
    });
    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title'), parseVars(el), langOf(el, fallbackLang)));
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'), parseVars(el), langOf(el, fallbackLang)));
    });
  }

  /* Page-level language (<html lang dir>) */
  function setLang(lang, opts) {
    if (!DIR[lang]) lang = 'en';
    S.lang = lang;
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', DIR[lang]);
    if (!opts || opts.persist !== false) store('tz-lang', lang);
    apply(document);
    document.dispatchEvent(new CustomEvent('tz:langchange', { detail: { lang: lang } }));
  }
  function setDigits(mode) {
    S.digits = mode === 'arab' ? 'arab' : 'latn';
    store('tz-digits', S.digits);
    document.dispatchEvent(new CustomEvent('tz:digitschange', { detail: { digits: S.digits } }));
  }
  function init() {
    const q = new URLSearchParams(location.search);
    const savedDigits = q.get('digits') || load('tz-digits');
    if (savedDigits) S.digits = savedDigits;
    const saved = q.get('lang') || load('tz-lang');
    const fromBrowser = (navigator.language || 'en').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
    setLang(saved || fromBrowser, { persist: false });
  }

  return {
    t: t, apply: apply, init: init,
    setLang: setLang, getLang: function () { return S.lang; },
    setDigits: setDigits, getDigits: function () { return S.digits; },
    fmtNumber: fmtNumber, fmtDecimal: fmtDecimal, fmtDigits: fmtDigits, currency: currency, money: money, words: words,
    dir: function (lang) { return DIR[lang || S.lang]; }
  };
})();
