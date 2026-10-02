/* ==========================================================================
   Tawazon Plus — amount entry (big keypad + amount in words + kind check)
   One component for setup, my-money sheets and "Can I spend X?".

   const pad = TZ.keypad.create(container, {
     labelKey: 'setup.salaryLabel',   // text above the number
     value: 0,                        // starting amount
     max: 9999999,
     check: function (n, lang) { return n > 50000 ? 'Is that right? …' : ''; },  // kind hint or ''
     onChange: function (n) {}
   });
   pad.get(); pad.set(2500); pad.render();   // render() after a language change
   Physical keyboard: digits, Backspace and Delete work while focus is inside.
   ========================================================================== */
window.TZ = window.TZ || {};

TZ.keypad = (function () {
  const MAX_DIGITS = 7;

  function create(container, opts) {
    opts = opts || {};
    let digits = opts.value ? String(Math.floor(opts.value)) : '';
    const max = opts.max || 9999999;
    const uid = 'kp' + Math.random().toString(36).slice(2, 7);

    function I() { return TZ.i18n; }

    function html() {
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'back'];
      return '<div class="amount" role="group" aria-labelledby="' + uid + '-label">' +
          '<div class="amount__label" id="' + uid + '-label"' + (opts.labelKey ? ' data-i18n="' + opts.labelKey + '"' : '') + '></div>' +
          '<div class="amount__value" aria-live="polite" aria-atomic="true">' +
            '<span class="amount__numwrap"><bdi class="num" data-kp="num"></bdi><span class="amount__caret" aria-hidden="true"></span></span>' +
            '<span class="amount__cur" data-kp="cur"></span>' +
          '</div>' +
          '<div class="amount__words" data-kp="words"></div>' +
          '<div class="amount__hint" data-kp="hint" role="status" hidden>' + TZ.icons.icon('info') + '<span data-kp="hint-text"></span></div>' +
        '</div>' +
        '<div class="keypad" role="group" data-i18n-aria="amount.keypad">' +
          keys.map(function (k) {
            if (k === 'back') return '<button type="button" class="key key--util" data-k="back" data-i18n-aria="amount.backspace">' + TZ.icons.icon('backspace', { dir: false }) + '</button>';
            return '<button type="button" class="key' + (k === '00' ? ' key--util' : '') + '" data-k="' + k + '"><span data-kp-digit="' + k + '"></span></button>';
          }).join('') +
        '</div>';
    }

    function value() { return Number(digits || 0); }

    function render() {
      const lang = I().getLang();
      const n = value();
      container.querySelector('[data-kp="num"]').textContent = digits ? I().fmtNumber(n, lang) : I().fmtDigits('0', lang);
      container.querySelector('[data-kp="cur"]').textContent = I().currency(lang);
      container.querySelector('[data-kp="words"]').textContent = n ? I().words(n, lang) : ' ';
      container.querySelectorAll('[data-kp-digit]').forEach(function (s) {
        s.textContent = I().fmtDigits(s.getAttribute('data-kp-digit'), lang);
      });
      const msg = opts.check ? opts.check(n, lang) : '';
      const hint = container.querySelector('[data-kp="hint"]');
      hint.hidden = !msg;
      container.querySelector('[data-kp="hint-text"]').textContent = msg || '';
      const amount = container.querySelector('.amount');
      amount.classList.toggle('amount--empty', !digits);
    }

    function press(k) {
      let d = digits;
      if (k === 'back') d = d.slice(0, -1);
      else if (k === 'clear') d = '';
      else if (k === '00') { if (d && d.length + 2 <= MAX_DIGITS) d += '00'; }
      else if (d.length < MAX_DIGITS && !(d === '' && k === '0')) d += k;
      if (Number(d || 0) > max) return;
      digits = d;
      render();
      if (opts.onChange) opts.onChange(value());
    }

    container.classList.add('kp');
    container.innerHTML = html();
    I().apply(container);
    render();

    container.addEventListener('click', function (e) {
      const b = e.target.closest('[data-k]');
      if (b) press(b.getAttribute('data-k'));
    });
    container.addEventListener('keydown', function (e) {
      if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
      else if (/^[٠-٩]$/.test(e.key)) { press(String('٠١٢٣٤٥٦٧٨٩'.indexOf(e.key))); e.preventDefault(); }
      else if (e.key === 'Backspace') { press('back'); e.preventDefault(); }
      else if (e.key === 'Delete') { press('clear'); e.preventDefault(); }
    });

    return {
      get: value,
      set: function (n) { digits = n ? String(Math.floor(n)) : ''; render(); },
      render: function () { I().apply(container); render(); },
      focus: function () { const k = container.querySelector('.key'); if (k) k.focus(); }
    };
  }

  /* ---------- amount sheet: bottom sheet with title, optional extra fields, keypad, Save ----------
     TZ.keypad.sheet({
       titleKey, titleVars, labelKey, value, check,
       extraHtml: '<div>…</div>',          // optional fields shown above the keypad (read them in onSave)
       afterHtml: '<div>…</div>',          // optional fields shown below the keypad
       onChange: function (n, sheetEl) {}, // live preview while typing
       saveKey: 'common.save',
       onSave: function (n, sheetEl) {}   // n > 0 guaranteed
     });  -> { el, close } */
  function sheet(opts) {
    opts = opts || {};
    const phone = document.querySelector('.phone');
    const id = 'as' + Math.random().toString(36).slice(2, 7);
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.setAttribute('data-keep', '');
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<div class="sheet amount-sheet" role="dialog" aria-modal="true" aria-labelledby="' + id + '">' +
        '<div class="sheet__handle"></div>' +
        '<h2 class="sheet__title" id="' + id + '" data-i18n="' + opts.titleKey + '"' + TZ.page.vars(opts.titleVars) + '></h2>' +
        (opts.extraHtml ? '<div class="amount-sheet__extra">' + opts.extraHtml + '</div>' : '') +
        '<div class="amount-sheet__pad"></div>' +
        (opts.afterHtml ? '<div class="amount-sheet__extra">' + opts.afterHtml + '</div>' : '') +
        '<div class="amount-sheet__actions">' +
          '<button type="button" class="btn btn--primary btn--block" data-save>' + TZ.icons.icon('check') + '<span data-i18n="' + (opts.saveKey || 'common.save') + '"></span></button>' +
          '<button type="button" class="btn btn--text btn--block" data-cancel data-i18n="common.cancel"></button>' +
        '</div>' +
      '</div>';
    phone.appendChild(ov);
    TZ.i18n.apply(ov);
    const save = ov.querySelector('[data-save]');
    const pad = create(ov.querySelector('.amount-sheet__pad'), {
      labelKey: opts.labelKey || 'common.amount',
      value: opts.value,
      check: opts.check,
      onChange: function (n) { save.disabled = !n; if (opts.onChange) opts.onChange(n, ov); }
    });
    save.disabled = !pad.get();
    TZ.ui.wireOverlay(ov);
    const opener = document.activeElement;
    requestAnimationFrame(function () { TZ.ui.openOverlay(ov, opener); });

    function close() {
      TZ.ui.closeOverlay(ov);
      setTimeout(function () { ov.remove(); }, 450);
      document.removeEventListener('tz:langchange', relabel);
    }
    function relabel() { TZ.i18n.apply(ov); pad.render(); }
    document.addEventListener('tz:langchange', relabel);
    ov.querySelector('[data-cancel]').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    save.onclick = function () {
      const n = pad.get();
      if (!n) return;
      const keep = opts.onSave ? opts.onSave(n, ov) : true;
      if (keep !== false) close();
    };
    return { el: ov, close: close, pad: pad };
  }

  return { create: create, sheet: sheet };
})();
