/* My money — "Remind on WhatsApp" for money people owe me.
   A bottom sheet: tone (Friendly / Gentle) · message language · the message in a
   chat bubble the user can edit · a real wa.me link (the person is chosen inside
   WhatsApp — the sample data has no phone numbers) · Copy message.
   Used by sec-owed.js through MM.remind.button(item). */
(function () {
  'use strict';
  const F = TZ.fmt, I = TZ.i18n, IC = TZ.icons, P = TZ.page;
  const TONES = ['friendly', 'gentle'];

  /* Round chat bubble with a phone handset (stroke style, brand colours via currentColor) */
  const WA_ICON = '<svg class="icon rm-wa" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5Z"/>' +
    '<path d="M9.4 8.3c.3-.3.8-.3 1 .1l.7 1.4c.1.3.1.6-.2.8l-.5.5c.5 1 1.3 1.8 2.3 2.3l.5-.5c.2-.3.5-.3.8-.2l1.4.7c.4.2.4.7.1 1-.7.7-1.6.9-2.5.6a7 7 0 0 1-4.2-4.2c-.3-.9-.1-1.8.6-2.5Z" fill="currentColor" stroke="none"/></svg>';
  const COPY_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<rect x="8.5" y="8.5" width="11" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H7A2.5 2.5 0 0 0 4.5 6v7A2.5 2.5 0 0 0 7 15.5h1.5"/></svg>';

  /* ---------- the message ---------- */
  function amountText(n, lang) { return I.fmtNumber(n, lang) + ' ' + I.t('remind.cur', null, lang); }
  function message(x, tone, lang) {
    return I.t('remind.msg.' + tone, {
      name: TZ.data.name(x, lang),
      amount: amountText(x.amount, lang),
      date: F.date(x.since || MM.get().today, 'long', lang)
    }, lang);
  }
  function waLink(text) { return 'https://wa.me/?text=' + encodeURIComponent(text); }

  /* ---------- the row button (sec-owed.js) ---------- */
  function button(x) {
    return '<button type="button" class="btn btn--secondary btn--block mm-remind" data-act="owed:remind" data-id="' + P.esc(x.id) + '"' +
      ' data-i18n-aria="remind.btnAria"' + P.vars({ name: MM.name(x) }) + '>' + WA_ICON + '<span data-i18n="remind.btn"></span></button>';
  }

  /* ---------- the sheet ---------- */
  function markup(x) {
    const nm = P.vars({ name: MM.name(x) });
    return '<div class="sheet rm-sheet" role="dialog" aria-modal="true" aria-labelledby="rm-title">' +
      '<div class="sheet__handle"></div>' +
      '<div class="rm-head">' +
        '<h2 class="sheet__title" id="rm-title" data-i18n="remind.title"' + nm + '></h2>' +
        '<button type="button" class="mm-icon-btn" data-rm-close data-i18n-aria="common.close">' + IC.icon('close') + '</button>' +
      '</div>' +
      '<p class="rm-lead" data-i18n="remind.lead"></p>' +
      '<div class="rm-group">' +
        '<p class="field__label" id="rm-tone-label" data-i18n="remind.toneLabel"></p>' +
        '<div class="segmented segmented--block" role="radiogroup" aria-labelledby="rm-tone-label" data-rm-tones>' +
          TONES.map(function (t) {
            return '<button type="button" class="segmented__btn" role="radio" data-tone="' + t + '" data-i18n="remind.' + t + '"></button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="rm-group">' +
        '<div class="rm-labelrow">' +
          '<label class="field__label" for="rm-text" data-i18n="remind.label"></label>' +
          '<button type="button" class="rm-lang" data-rm-lang>' + IC.icon('globe') + '<span></span></button>' +
        '</div>' +
        '<div class="rm-chat"><textarea class="rm-bubble" id="rm-text" rows="6" spellcheck="true"></textarea></div>' +
      '</div>' +
      '<div class="rm-actions">' +
        '<a class="btn btn--primary btn--block" data-rm-open target="_blank" rel="noopener" href="#">' + WA_ICON +
          '<span data-i18n="remind.open"></span></a>' +
        '<p class="rm-hint">' + IC.icon('person') + '<span data-i18n="remind.choose"' + nm + '></span></p>' +
        '<button type="button" class="btn btn--text btn--block" data-rm-copy>' + COPY_ICON + '<span data-i18n="remind.copy"></span></button>' +
        '<p class="rm-status" role="status" aria-live="polite"></p>' +
      '</div>' +
    '</div>';
  }

  function open(x, opener) {
    if (!x) return;
    let tone = 'friendly', lang = I.getLang();
    const phone = document.querySelector('.phone');
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.setAttribute('data-keep', '');
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = markup(x);
    phone.appendChild(ov);
    I.apply(ov);

    const ta = ov.querySelector('#rm-text'), go = ov.querySelector('[data-rm-open]');
    const status = ov.querySelector('.rm-status');

    function syncLink() { go.href = waLink(ta.value.trim()); }
    /* tone or language changed: write the message again in that tone / language */
    function write() {
      ov.querySelectorAll('[data-tone]').forEach(function (b) {
        const on = b.getAttribute('data-tone') === tone;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      const other = lang === 'ar' ? 'en' : 'ar';
      const sw = ov.querySelector('[data-rm-lang] span');
      sw.textContent = I.t('remind.writeIn', null, other);
      sw.setAttribute('lang', other);
      ta.value = message(x, tone, lang);
      ta.setAttribute('lang', lang);
      ta.setAttribute('dir', I.dir(lang));
      status.textContent = '';
      syncLink();
    }
    function pickTone(t, focus) {
      tone = t;
      write();
      if (focus) ov.querySelector('[data-tone="' + t + '"]').focus();
    }

    function close() {
      TZ.ui.closeOverlay(ov);
      setTimeout(function () { ov.remove(); }, 450);
    }
    function say(key) {
      status.innerHTML = IC.icon('check') + '<span></span>';
      status.lastChild.textContent = I.t(key);
    }
    function copy() {
      function manual() { ta.focus(); ta.select(); say('remind.copyManual'); }
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('no clipboard');
        navigator.clipboard.writeText(ta.value).then(function () { say('remind.copied'); }, manual);
      } catch (e) { manual(); }
    }

    ov.addEventListener('click', function (e) {
      if (e.target === ov || e.target.closest('[data-rm-close]')) { close(); return; }
      const t = e.target.closest('[data-tone]');
      if (t) { pickTone(t.getAttribute('data-tone')); return; }
      if (e.target.closest('[data-rm-lang]')) { lang = lang === 'ar' ? 'en' : 'ar'; write(); return; }
      if (e.target.closest('[data-rm-copy]')) { copy(); return; }
      if (e.target.closest('[data-rm-open]')) {
        syncLink();                                   /* the link opens WhatsApp in a new tab */
        setTimeout(function () { close(); MM.toast(I.t('remind.ready')); }, 0);
      }
    });
    /* Tone radios: arrow keys move the choice (mirrored in Arabic) */
    ov.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (!e.target.closest('[data-tone]')) return;
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (keys.indexOf(e.key) < 0) return;
      e.preventDefault();
      pickTone(tone === 'friendly' ? 'gentle' : 'friendly', true);
    });
    ta.addEventListener('input', function () { status.textContent = ''; syncLink(); });

    write();
    TZ.ui.wireOverlay(ov);
    requestAnimationFrame(function () { TZ.ui.openOverlay(ov, opener || document.activeElement); });
  }

  window.MM.remind = { button: button, open: open };
  MM.sections.owed.actions.remind = function (id, btn) { open(MM.find(MM.get().owedToMe, id), btn); };
})();
