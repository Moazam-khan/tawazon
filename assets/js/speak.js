/* ==========================================================================
   Tawazon Plus — read aloud (for people who don't read easily)
   Uses the phone's own voice (window.speechSynthesis). Never plays by itself:
   only a tap on a speaker button speaks, a second tap stops.

     TZ.speak.say(text, lang)              speak now (cancels anything before)
     TZ.speak.stop()
     TZ.speak.register('home', fn)         fn() returns the sentence to read
     TZ.speak.button('home', { cls })      48px round speaker button (HTML string)
     TZ.speak.button('#bubble-3', { cls }) reads that element's text
     TZ.speak.daily(r)                     the daily number as one sentence
     TZ.speak.money(200)                   "two hundred riyals" / "مائتان ريال"

   Include after shell.js, with assets/css/speak.css and the speak lang parts.
   Classes: speak--hero (white, on the hero card) · speak--sm (under a chat bubble)
   ========================================================================== */
window.TZ = window.TZ || {};

TZ.speak = (function () {
  'use strict';
  const I = function () { return TZ.i18n; };
  const synth = window.speechSynthesis || null;
  const LOCALE = { ar: ['ar-sa', 'ar'], en: ['en-us', 'en-gb', 'en'] };
  const sources = {};
  let seq = 0;

  /* Speaker icon (sound waves) + stop square, both stroke style like TZ.icons */
  const ICON =
    '<svg class="icon speak__play" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M4.5 9.5H7.5L12 5.5v13l-4.5-4h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"/>' +
      '<path class="speak__w1" d="M15.5 9.3a3.8 3.8 0 0 1 0 5.4"/>' +
      '<path class="speak__w2" d="M18.3 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>' +
    '<svg class="icon speak__stop" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<rect x="7" y="7" width="10" height="10" rx="2.2" fill="currentColor"/></svg>';

  function phone() { return document.querySelector('.phone') || document.body; }
  function kindToast(key) { TZ.ui.toast(phone(), { message: I().t(key), duration: 6000 }); }

  /* ---------- voices (Chrome fills the list a moment after load) ---------- */
  function voicesReady() {
    return new Promise(function (resolve) {
      const now = synth.getVoices();
      if (now.length) { resolve(now); return; }
      let done = false;
      function finish() { if (done) return; done = true; resolve(synth.getVoices()); }
      synth.addEventListener('voiceschanged', finish, { once: true });
      setTimeout(finish, 700);
    });
  }
  function pickVoice(voices, lang) {
    const want = LOCALE[lang] || [lang];
    for (let i = 0; i < want.length; i++) {
      const hit = voices.filter(function (v) { return (v.lang || '').toLowerCase().replace('_', '-').indexOf(want[i]) === 0; });
      if (hit.length) return hit.filter(function (v) { return v.localService; })[0] || hit[0];
    }
    return null;
  }

  /* ---------- make text sound natural ---------- */
  /* "300 SAR" -> "300 riyals", "٣٠٠ ر.س" -> "٣٠٠ ريال"; arrows and dots read as pauses */
  function spoken(text, lang) {
    const cur = I().currency(lang);
    return String(text || '')
      .split(cur).join(' ' + I().t('speak.cur', null, lang))
      .replace(/[→←·•]/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function money(n, lang) {
    const w = I().words(n, lang || I().getLang());
    return (lang || I().getLang()) === 'en' ? w.charAt(0).toLowerCase() + w.slice(1) : w;
  }

  /* The daily number as one natural sentence (r = TZ.data.calculate(…)):
     "You can spend two hundred riyals today. Looking good. 20 days until your salary." */
  function daily(r, lang) {
    lang = lang || I().getLang();
    return I().t('speak.home', {
      amount: money(r.daily, lang),
      status: I().t('status.' + r.status, null, lang),
      days: I().t('speak.days', { n: r.daysLeft }, lang)
    }, lang);
  }

  /* ---------- speaking ----------
     State is kept by what is read (the key), so a button that is redrawn
     mid-sentence still shows 'speaking' and still stops on the next tap. */
  let currentKey = null, token = 0;
  function mark(key, on) {
    if (!key) return;
    document.querySelectorAll('[data-speak]').forEach(function (b) {
      if (b.getAttribute('data-speak') === key) b.setAttribute('aria-pressed', String(on));
    });
  }
  function stop() {
    token++;
    if (synth) synth.cancel();
    mark(currentKey, false);
    currentKey = null;
  }

  /* key: optional — which speaker buttons show 'speaking' */
  function say(text, lang, key) {
    lang = lang || I().getLang();
    stop();
    const my = token;
    if (!synth || !window.SpeechSynthesisUtterance) { kindToast('speak.noSpeech'); return Promise.resolve(false); }
    return voicesReady().then(function (voices) {
      if (my !== token) return false;                 // stopped while the voices loaded
      const voice = pickVoice(voices, lang);
      if (!voice) { kindToast('speak.noVoice'); return false; }
      const u = new SpeechSynthesisUtterance(spoken(text, lang));
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.95;
      currentKey = key || null;
      mark(currentKey, true);
      function end() { if (my === token) { mark(currentKey, false); currentKey = null; } }
      u.onend = end;
      u.onerror = end;
      synth.speak(u);
      return true;
    });
  }

  /* ---------- buttons ---------- */
  function register(key, fn) { sources[key] = fn; }

  /* src: a registered key, '#elementId' (reads its text) or a function */
  function button(src, opts) {
    opts = opts || {};
    if (typeof src === 'function') { const k = 'fn' + (++seq); sources[k] = src; src = k; }
    return '<button type="button" class="speak' + (opts.cls ? ' ' + opts.cls : '') + '" data-speak="' + src + '"' +
      ' aria-pressed="' + (src === currentKey) + '" data-i18n-aria="speak.read" data-i18n-title="speak.read">' +
      '<span class="speak__dot">' + ICON + '</span></button>';
  }

  function textFor(src) {
    if (sources[src]) return sources[src]();
    const el = src.charAt(0) === '#' ? document.getElementById(src.slice(1)) : null;
    return el ? (el.innerText || el.textContent || '') : '';
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-speak]');
    if (!btn) return;
    const key = btn.getAttribute('data-speak');
    if (key === currentKey) { stop(); return; }
    say(textFor(key), I().getLang(), key);
  });
  /* A new language or leaving the page: stop talking */
  document.addEventListener('tz:langchange', stop);
  window.addEventListener('pagehide', stop);

  return { say: say, stop: stop, register: register, button: button, money: money, daily: daily, spoken: spoken };
})();
