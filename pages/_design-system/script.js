/* Design-system preview — renders every component into an English (LTR) phone
   and an Arabic (RTL) phone, side by side. All text comes from assets/lang. */
(function () {
  'use strict';

  const I = TZ.i18n, IC = TZ.icons, UI = TZ.ui;
  const LANGS = ['en', 'ar'];
  const STATE = {};
  let syncOn = true;

  function stateFor(lang) {
    return STATE[lang] || (STATE[lang] = {
      digits: '2500', tab: 'home', reminder: true, aloud: false, chips: ['rent'], segLang: lang
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Template                                                                  */
  /* ------------------------------------------------------------------------ */
  function template(lang) {
    const S = stateFor(lang);
    const R = TZ.data.calculate(TZ.data.SAMPLE), DEBT = TZ.data.SAMPLE.debts[0];
    const a = function (key, vars) {
      let s = 'data-i18n="' + key + '"';
      if (vars) s += " data-i18n-vars='" + JSON.stringify(vars).replace(/'/g, '&#39;') + "'";
      return s;
    };
    const aria = function (key, vars) {
      let s = 'data-i18n-aria="' + key + '"';
      if (vars) s += " data-i18n-vars='" + JSON.stringify(vars).replace(/'/g, '&#39;') + "'";
      return s;
    };
    const n = function (v) { return I.fmtNumber(v, lang); };
    const dg = function (s) { return I.fmtDigits(s, lang); };
    const money = function (v) { return '<bdi class="num">' + I.money(v, lang) + '</bdi>'; };
    const moneyText = function (v) { return I.money(v, lang); };

    const cell = function (stateKey, inner, extra) {
      return '<div class="ds-cell ' + (extra || '') + '"><span class="ds-cell__label" ' + a('state.' + stateKey) + '></span>' + inner + '</div>';
    };
    const sec = function (key, body) {
      return '<section class="ds-sec"><h2 class="ds-h" ' + a('ds.section.' + key) + '></h2>' + body + '</section>';
    };

    /* ---- Meet Tawazon -------------------------------------------------- */
    const mascotLabel = I.t('brand.short', null, lang);
    const mascot =
      '<div class="bubble-row">' + IC.mascot('happy', 'mascot--float', mascotLabel) +
        '<p class="bubble" ' + a('mascot.hello') + '></p></div>' +
      '<div class="ds-grid2">' +
        '<div class="ds-cell" style="align-items:center">' + IC.mascot('happy', 'mascot--lg', mascotLabel) + '<span class="ds-cell__label" ' + a('mascot.happy') + '></span></div>' +
        '<div class="ds-cell" style="align-items:center">' + IC.mascot('calm', 'mascot--lg', mascotLabel) + '<span class="ds-cell__label" ' + a('mascot.calm') + '></span></div>' +
      '</div>';

    /* ---- Colors ---------------------------------------------------------- */
    const swatches = [
      ['brand', 'var(--primary)', 'var(--on-primary)'],
      ['sand', 'var(--accent-soft)', 'var(--on-accent-soft)'],
      ['good', 'var(--good-bg)', 'var(--good-fg)'],
      ['careful', 'var(--careful-bg)', 'var(--careful-fg)'],
      ['tight', 'var(--tight-bg)', 'var(--tight-fg)'],
      ['surface', 'var(--surface)', 'var(--text)'],
      ['text', 'var(--text)', 'var(--bg)']
    ].map(function (s) {
      return '<div class="swatch-wrap"><div class="swatch" style="background:' + s[1] + ';color:' + s[2] + '" ' + a('typo.aa') + '></div>' +
             '<span class="swatch-name" ' + a('color.' + s[0]) + '></span></div>';
    }).join('');
    const ramp = function (prefix, steps) {
      return '<div class="ramp" aria-hidden="true">' + steps.map(function (st) {
        return '<span style="background:var(--' + prefix + '-' + st + ')"></span>';
      }).join('') + '</div>';
    };
    const colors =
      '<div class="swatches">' + swatches + '</div>' +
      ramp('brand', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) +
      ramp('sand', [50, 100, 200, 300, 400, 500, 700]);

    /* ---- Typography ------------------------------------------------------- */
    const typeRow = function (cls, labelKey, px, sample) {
      return '<div class="type-row"><span class="type-row__spec"><span ' + a('typo.' + labelKey) + '></span> · <bdi class="num">' + dg(String(px)) + ' px</bdi></span>' + sample + '</div>';
    };
    const typography =
      typeRow('t-hero', 'hero', 64, '<span class="t-hero num">' + n(R.daily) + '</span>') +
      typeRow('t-title', 'title', 28, '<span class="t-title" ' + a('typo.sample') + '></span>') +
      typeRow('t-body', 'body', 18, '<span class="t-body" ' + a('typo.sample') + '></span>') +
      typeRow('t-small', 'small', 16, '<span class="t-small" ' + a('typo.sample') + '></span>');

    /* ---- Buttons ----------------------------------------------------------- */
    const btnStates = function (cls, textKey, nameKey, extra) {
      const label = '<span ' + a(textKey) + '></span>' + (extra || '');
      const mk = function (mod, attr) {
        return '<button type="button" class="btn ' + cls + ' btn--block ' + mod + '" ' + attr + '>' + label + '</button>';
      };
      return '<div class="ds-sub" ' + a(nameKey) + '></div><div class="ds-grid2">' +
        cell('default', mk('', '')) + cell('pressed', mk('is-pressed', '')) +
        cell('disabled', mk('', 'disabled')) + cell('focus', mk('is-focus', '')) + '</div>';
    };
    const buttons =
      btnStates('btn--primary', 'btn.primary', 'btn.primaryName', IC.icon('arrow', { dir: true })) +
      btnStates('btn--secondary', 'btn.secondary', 'btn.secondaryName') +
      btnStates('btn--text', 'btn.text', 'btn.textName') +
      btnStates('btn--danger-soft', 'btn.danger', 'btn.dangerName');

    /* ---- Amount + keypad ----------------------------------------------------- */
    const amt = Number(S.digits || 0);
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'back'].map(function (k) {
      if (k === 'back') return '<button type="button" class="key key--util" data-key="back" ' + aria('amount.backspace') + '>' + IC.icon('backspace') + '</button>';
      return '<button type="button" class="key' + (k === '00' ? ' key--util' : '') + '" data-key="' + k + '">' + dg(k) + '</button>';
    }).join('');
    const keyState = function (mod, attr) {
      return '<button type="button" class="key ' + mod + '" ' + attr + '>' + dg('5') + '</button>';
    };
    const amount =
      '<div class="amount">' +
        '<div class="amount__label" ' + a('amount.label') + '></div>' +
        '<div class="amount__value">' +
          '<span class="amount__numwrap" dir="ltr"><span data-role="num">' + (S.digits ? n(amt) : dg('0')) + '</span><i class="amount__caret"></i></span>' +
          '<span class="amount__cur">' + I.currency(lang) + '</span>' +
        '</div>' +
        '<div class="amount__words" data-role="words" aria-live="polite">' + (amt ? I.words(amt, lang) : '&nbsp;') + '</div>' +
        '<div class="amount__hint" data-role="hint" hidden>' + IC.icon('info') + '<span data-role="hint-text"></span></div>' +
      '</div>' +
      '<div class="keypad" role="group" ' + aria('amount.keypad') + '>' + keys + '</div>' +
      '<div class="ds-grid2">' +
        cell('default', keyState('', '')) + cell('pressed', keyState('is-pressed', '')) +
        cell('disabled', keyState('', 'disabled')) + cell('focus', keyState('is-focus', '')) +
      '</div>';

    /* ---- Preset chips ---------------------------------------------------------- */
    const presets = ['rent', 'electricity', 'internet', 'phone', 'subscription', 'other'];
    const chip = function (id, extra) {
      return '<button type="button" class="chip" ' + (extra || '') + '>' + IC.icon(id) + '<span ' + a('preset.' + id) + '></span></button>';
    };
    const liveChips = presets.map(function (id) {
      return chip(id, 'data-chip="' + id + '" aria-pressed="' + (S.chips.indexOf(id) > -1) + '"');
    }).join('');
    const chipStates = '<div class="ds-grid2">' +
      cell('default', chip('rent')) +
      cell('selected', chip('rent', 'aria-pressed="true"')) +
      cell('pressed', chip('rent').replace('class="chip"', 'class="chip is-pressed"')) +
      cell('disabled', chip('rent', 'disabled')) +
      cell('focus', chip('rent').replace('class="chip"', 'class="chip is-focus"')) +
    '</div>';
    const chips = '<div class="chips" role="group">' + liveChips + '</div>' + chipStates;

    /* ---- Status --------------------------------------------------------------- */
    const badge = function (kind) {
      return '<span class="badge badge--' + kind + '">' + IC.face(kind) + '<span ' + a('status.' + kind) + '></span></span>';
    };
    const dayPct = Math.round(R.dayOfPeriod / R.periodDays * 100) + '%', debtPct = TZ.data.debtPlan(DEBT).paidPct;
    const dayVars = { day: n(R.dayOfPeriod), total: n(R.periodDays) };
    const status =
      '<div class="cluster">' + badge('good') + badge('careful') + badge('tight') + '</div>' +
      '<div class="card card--hero">' +
        '<div class="card__eyebrow" ' + a('home.canSpendToday') + '></div>' +
        '<div class="hero-number"><span class="hero-number__value" data-role="hero">' + n(R.daily) + '</span><span class="hero-number__cur">' + I.currency(lang) + '</span></div>' +
        badge('good') +
        '<div class="progress" style="--value:' + dayPct + ';margin-top:1.25rem">' +
          '<div class="progress__head"><span ' + a('progress.day', dayVars) + '></span></div>' +
          '<div class="progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="' + R.periodDays + '" aria-valuenow="' + R.dayOfPeriod + '" ' + aria('progress.day', dayVars) + '><div class="progress__fill"></div></div>' +
        '</div>' +
      '</div>';

    /* ---- Cards + rows ------------------------------------------------------------ */
    const row = function (icon, titleKey, subKey, subVars, end, cls) {
      return '<button type="button" class="row">' +
        '<span class="row__icon ' + (cls || '') + '">' + IC.icon(icon) + '</span>' +
        '<span class="row__body"><span class="row__title" ' + a(titleKey) + '></span><span class="row__sub" ' + a(subKey, subVars) + '></span></span>' +
        '<span class="row__end">' + money(end) + '</span>' +
        IC.icon('chevron', { dir: true, cls: 'row__chev' }) + '</button>';
    };
    const cards =
      '<div class="card card--sand"><div class="card__eyebrow" ' + a('card.next') + '></div>' +
        '<div class="between"><span class="row__title" ' + a('card.rentIn', { n: dg('3') }) + '></span><strong>' + money(2500) + '</strong></div></div>' +
      '<div class="list">' +
        row('rent', 'row.rent', 'row.rentSub', { n: dg('3') }, 2500) +
        row('person', 'row.person', 'row.personSub', null, 300, 'row__icon--sand') +
        row('debt', 'row.debt', 'row.debtSub', { amount: moneyText(3500) }, 900) +
      '</div>';

    /* ---- Progress ----------------------------------------------------------------- */
    const progress =
      '<div class="progress" style="--value:' + dayPct + '"><div class="progress__head"><span ' + a('progress.day', dayVars) + '></span></div>' +
        '<div class="progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="' + R.periodDays + '" aria-valuenow="' + R.dayOfPeriod + '" ' + aria('progress.day', dayVars) + '><div class="progress__fill"></div></div></div>' +
      '<div class="progress progress--accent" style="--value:' + debtPct + '%"><div class="progress__head"><span ' + a('progress.debt') + '></span><span>' + money(DEBT.total - DEBT.remaining) + '</span></div>' +
        '<div class="progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + debtPct + '" ' + aria('progress.debt') + '><div class="progress__fill"></div></div></div>';

    /* ---- Controls: toggle + segmented ------------------------------------------------- */
    const toggle = function (checked, mod, attr, labelKey) {
      return '<button type="button" class="toggle ' + (mod || '') + '" role="switch" aria-checked="' + checked + '" ' + (attr || '') + ' ' + aria(labelKey || 'control.reminder') + '>' +
        '<span class="toggle__track"></span><span class="toggle__thumb"></span></button>';
    };
    const toggleRow = function (labelKey, key, checked) {
      return '<div class="toggle-row"><span class="toggle-row__label" ' + a(labelKey) + '></span>' + toggle(checked, '', 'data-toggle="' + key + '"', labelKey) + '</div>';
    };
    const seg = function (opts) {
      opts = opts || {};
      return '<div class="segmented segmented--block" role="radiogroup" ' + aria('control.language') + '>' +
        ['en', 'ar'].map(function (code, i) {
          const checked = opts.live ? S.segLang === code : i === 0;
          const mod = (opts.focus && i === 0 ? ' is-focus' : '');
          return '<button type="button" class="segmented__btn' + mod + '" role="radio" aria-checked="' + checked + '" ' +
                 (opts.live ? 'data-seg="' + code + '"' : '') + (opts.disabled ? ' disabled' : '') + ' ' + a('lang.' + code) + '></button>';
        }).join('') + '</div>';
    };
    const controls =
      '<div class="card">' + toggleRow('control.reminder', 'reminder', S.reminder) + toggleRow('control.aloud', 'aloud', S.aloud) + '</div>' +
      '<div class="ds-grid2">' +
        cell('off', toggle(false), 'ds-cell--center') + cell('on', toggle(true), 'ds-cell--center') +
        cell('pressed', toggle(true, 'is-pressed'), 'ds-cell--center') + cell('disabled', toggle(false, '', 'disabled'), 'ds-cell--center') +
        cell('focus', toggle(true, 'is-focus'), 'ds-cell--center') +
      '</div>' +
      '<div class="ds-sub" ' + a('control.language') + '></div>' + seg({ live: true }) +
      '<div class="ds-grid2">' + cell('focus', seg({ focus: true })) + cell('disabled', seg({ disabled: true })) + '</div>';

    /* ---- Tab bar states (the live bar is pinned to the bottom of the phone) ------------------ */
    const tab = function (icon, key, mod, attr) {
      return '<button type="button" class="tab ' + (mod || '') + '" ' + (attr || '') + '><span class="tab__icon">' + IC.icon(icon) + '</span><span ' + a('tab.' + key) + '></span></button>';
    };
    const tabbar = '<div class="ds-grid2">' +
      cell('selected', tab('home', 'home', '', 'aria-current="page"'), 'ds-tabcell') +
      cell('default', tab('wallet', 'money'), 'ds-tabcell') +
      cell('pressed', tab('chat', 'ask', 'is-pressed'), 'ds-tabcell') +
      cell('focus', tab('wallet', 'money', 'is-focus'), 'ds-tabcell') +
      cell('disabled', tab('chat', 'ask', '', 'disabled'), 'ds-tabcell') +
    '</div>';

    /* ---- Overlays ----------------------------------------------------------------------- */
    const sheetBody = function (live) {
      return '<div class="sheet__handle"></div>' +
        '<h3 class="sheet__title" ' + (live ? 'id="sheet-title-' + lang + '" ' : '') + a('overlay.sheetTitle') + '></h3>' +
        '<div class="chips">' + chip('rent', 'aria-pressed="true"') + chip('electricity') + chip('internet') + '</div>' +
        '<p class="muted t-small" style="margin-block:1rem" ' + a('overlay.sheetHint') + '></p>' +
        '<button type="button" class="btn btn--primary btn--block" ' + (live ? 'data-close data-autofocus' : '') + '>' + IC.icon('check') + '<span ' + a('common.save') + '></span></button>';
    };
    const modalBody = function (live) {
      return '<div class="modal__icon">' + IC.icon('trash') + '</div>' +
        '<h3 class="modal__title" ' + (live ? 'id="modal-title-' + lang + '" ' : '') + a('overlay.modalTitle') + '></h3>' +
        '<p class="modal__text" ' + a('overlay.modalText', { n: dg('10') }) + '></p>' +
        '<div class="modal__actions">' +
          '<button type="button" class="btn btn--danger-soft btn--block" ' + (live ? 'data-close' : '') + ' ' + a('overlay.modalConfirm') + '></button>' +
          '<button type="button" class="btn btn--secondary btn--block" ' + (live ? 'data-close data-autofocus' : '') + ' ' + a('overlay.modalKeep') + '></button>' +
        '</div>';
    };
    const toastVars = { from: n(R.daily), to: n(212) };
    const overlays =
      '<div class="ds-actions">' +
        '<button type="button" class="btn btn--secondary" data-toast ' + a('overlay.showToast') + '></button>' +
        '<button type="button" class="btn btn--secondary" data-open="sheet" ' + a('overlay.openSheet') + '></button>' +
        '<button type="button" class="btn btn--secondary" data-open="modal" ' + a('overlay.openModal') + '></button>' +
      '</div>' +
      '<div class="ds-sub" ' + a('overlay.toastName') + '></div>' +
      '<div class="toast toast--static" role="group"><span class="toast__msg" ' + a('overlay.toastChanged', toastVars) + '></span>' +
        '<button type="button" class="toast__undo">' + IC.icon('undo', { dir: true }) + '<span ' + a('common.undo') + '></span></button><i class="toast__timer"></i></div>' +
      '<div class="ds-sub" ' + a('overlay.sheetName') + '></div>' +
      '<div class="sheet sheet--static">' + sheetBody(false) + '</div>' +
      '<div class="ds-sub" ' + a('overlay.modalName') + '></div>' +
      '<div class="modal modal--static" role="group">' + modalBody(false) + '</div>';

    /* ---- Empty state ---------------------------------------------------------------------- */
    const empty = '<div class="card"><div class="empty">' + IC.mascot('calm', 'mascot--lg', mascotLabel) +
      '<h3 class="empty__title" ' + a('empty.title') + '></h3><p class="empty__text" ' + a('empty.text') + '></p>' +
      '<button type="button" class="btn btn--primary">' + IC.icon('plus') + '<span ' + a('empty.action') + '></span></button></div></div>';

    /* ---- Live tab bar + live overlays -------------------------------------------------------- */
    const liveTab = function (id, icon) {
      return '<button type="button" class="tab" data-tab="' + id + '"' + (S.tab === id ? ' aria-current="page"' : '') + '>' +
        '<span class="tab__icon">' + IC.icon(icon) + '</span><span ' + a('tab.' + id) + '></span></button>';
    };

    return '<div class="phone__scroll" tabindex="0"><div class="ds-content">' +
        sec('mascot', mascot) + sec('colors', colors) + sec('typography', typography) +
        sec('buttons', buttons) + sec('amount', amount) + sec('chips', chips) +
        sec('status', status) + sec('cards', cards) + sec('progress', progress) +
        sec('controls', controls) + sec('tabbar', tabbar) + sec('overlays', overlays) + sec('empty', empty) +
      '</div></div>' +
      '<nav class="tabbar" ' + aria('brand.name') + '>' + liveTab('home', 'home') + liveTab('money', 'wallet') + liveTab('ask', 'chat') + '</nav>' +
      '<div class="overlay" data-overlay="sheet" aria-hidden="true"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title-' + lang + '">' + sheetBody(true) + '</div></div>' +
      '<div class="overlay overlay--center" data-overlay="modal" aria-hidden="true"><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title-' + lang + '">' + modalBody(true) + '</div></div>';
  }

  /* ------------------------------------------------------------------------ */
  /* Live behavior                                                              */
  /* ------------------------------------------------------------------------ */
  function updateAmount(phone, lang) {
    const S = stateFor(lang);
    const amt = Number(S.digits || 0);
    phone.querySelector('[data-role="num"]').textContent = S.digits ? I.fmtNumber(amt, lang) : I.fmtDigits('0', lang);
    phone.querySelector('[data-role="words"]').textContent = amt ? I.words(amt, lang) : ' ';
    const hint = phone.querySelector('[data-role="hint"]');
    const high = amt > 50000;
    hint.hidden = !high;
    if (high) phone.querySelector('[data-role="hint-text"]').textContent = I.t('amount.looksHigh', { amount: I.money(amt, lang) }, lang);
  }

  function pressKey(phone, lang, k) {
    const S = stateFor(lang);
    let d = S.digits;
    if (k === 'back') d = d.slice(0, -1);
    else if (k === '00') { if (d && d.length + 2 <= 7) d += '00'; }
    else if (d.length < 7 && !(d === '' && k === '0')) d += k;
    S.digits = d;
    updateAmount(phone, lang);
  }

  function bind(phone, lang) {
    phone.addEventListener('click', function (e) {
      const S = stateFor(lang);
      let el;
      if ((el = e.target.closest('[data-key]'))) { pressKey(phone, lang, el.getAttribute('data-key')); return; }
      if ((el = e.target.closest('[data-chip]'))) {
        const id = el.getAttribute('data-chip'), i = S.chips.indexOf(id);
        if (i > -1) S.chips.splice(i, 1); else S.chips.push(id);
        el.setAttribute('aria-pressed', String(i === -1));
        return;
      }
      if ((el = e.target.closest('[data-toggle]'))) {
        const k = el.getAttribute('data-toggle');
        S[k] = !S[k];
        el.setAttribute('aria-checked', String(S[k]));
        return;
      }
      if ((el = e.target.closest('[data-seg]'))) {
        S.segLang = el.getAttribute('data-seg');
        el.parentElement.querySelectorAll('[data-seg]').forEach(function (b) { b.setAttribute('aria-checked', String(b === el)); });
        return;
      }
      if ((el = e.target.closest('[data-tab]'))) {
        S.tab = el.getAttribute('data-tab');
        phone.querySelectorAll('[data-tab]').forEach(function (b) {
          if (b === el) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
        });
        return;
      }
      if ((el = e.target.closest('[data-open]'))) {
        UI.openOverlay(phone.querySelector('[data-overlay="' + el.getAttribute('data-open') + '"]'), el);
        return;
      }
      if ((el = e.target.closest('[data-close]'))) { UI.closeOverlay(el.closest('[data-overlay]')); return; }
      if ((el = e.target.closest('[data-toast]'))) {
        UI.toast(phone, {
          message: I.t('overlay.toastChanged', { from: I.fmtNumber(200, lang), to: I.fmtNumber(212, lang) }, lang),
          undoLabel: I.t('common.undo', null, lang)
        });
      }
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Render + sync                                                              */
  /* ------------------------------------------------------------------------ */
  function renderPhone(lang) {
    const phone = document.getElementById('phone-' + lang);
    const old = phone.querySelector('.phone__scroll');
    const top = old ? old.scrollTop : 0;

    phone.innerHTML = template(lang);
    I.apply(phone, lang);
    phone.querySelectorAll('[data-overlay]').forEach(function (o) { UI.wireOverlay(o); });

    const hero = phone.querySelector('[data-role="hero"]');
    if (hero) UI.countUp(hero, 200, { duration: 1200, format: function (v) { return I.fmtNumber(v, lang); } });

    const sc = phone.querySelector('.phone__scroll');
    sc.scrollTop = top;
    return sc;
  }

  function renderAll() {
    const scrollers = LANGS.map(renderPhone);
    let busy = false;
    function link(from, to) {
      from.addEventListener('scroll', function () {
        if (!syncOn || busy) return;
        busy = true;
        const r = from.scrollTop / Math.max(1, from.scrollHeight - from.clientHeight);
        to.scrollTop = r * (to.scrollHeight - to.clientHeight);
        requestAnimationFrame(function () { busy = false; });
      }, { passive: true });
    }
    link(scrollers[0], scrollers[1]);
    link(scrollers[1], scrollers[0]);
  }

  /* ------------------------------------------------------------------------ */
  /* Toolbar                                                                    */
  /* ------------------------------------------------------------------------ */
  function setChecked(group, matchFn) {
    group.forEach(function (b) { b.setAttribute('aria-checked', String(matchFn(b))); });
  }
  function syncToolbar() {
    setChecked(document.querySelectorAll('[data-set-lang]'), function (b) { return b.getAttribute('data-set-lang') === I.getLang(); });
    setChecked(document.querySelectorAll('[data-theme-set]'), function (b) { return b.getAttribute('data-theme-set') === UI.getTheme(); });
    setChecked(document.querySelectorAll('[data-size]'), function (b) { return b.getAttribute('data-size') === UI.getTextSize(); });
    setChecked(document.querySelectorAll('[data-digits]'), function (b) { return b.getAttribute('data-digits') === I.getDigits(); });
  }

  function initToolbar() {
    document.addEventListener('click', function (e) {
      let el;
      if ((el = e.target.closest('[data-theme-set]'))) { UI.setTheme(el.getAttribute('data-theme-set')); }
      else if ((el = e.target.closest('[data-size]'))) { UI.setTextSize(el.getAttribute('data-size')); }
      else if ((el = e.target.closest('[data-digits]'))) { I.setDigits(el.getAttribute('data-digits')); renderAll(); }
      else if ((el = e.target.closest('#sync-toggle'))) {
        syncOn = !syncOn;
        el.setAttribute('aria-checked', String(syncOn));
      }
      syncToolbar();
    });
    document.addEventListener('tz:langchange', syncToolbar);
  }

  /* ------------------------------------------------------------------------ */
  UI.initCommon();
  I.init();
  LANGS.forEach(function (lang) { bind(document.getElementById('phone-' + lang), lang); });
  renderAll();
  initToolbar();
  syncToolbar();
})();
