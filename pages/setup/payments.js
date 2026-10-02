/* Setup — question 3: fixed payments (chips -> amount sheet -> list). */
(function () {
  'use strict';
  const F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, P = TZ.page;
  const S = SU.state;

  /* ---------- markup ---------- */
  function rowSub(item) {
    const key = item.every === 'year' && !SU.isDebt(item) ? 'setup.pay.everyYear' : 'setup.pay.everyMonth';
    return '<span class="row__sub" data-i18n="' + key + '"' + P.vars({ n: F.num(12) }) + '></span>';
  }

  /* The whole row edits (big target); the bin removes. */
  function row(item) {
    const p = SU.preset(item.preset);
    const name = SU.itemName(item);
    return '<li class="su-item" data-item="' + item.id + '">' +
      '<button type="button" class="row su-item__main" data-edit="' + item.id + '">' +
        '<span class="sr-only" data-i18n="common.edit"></span>' +
        '<span class="row__icon">' + IC.icon(p.icon) + '</span>' +
        '<span class="row__body"><span class="su-item__line"><span class="row__title">' + P.esc(name) + '</span>' +
          F.moneyHtml(item.amount) + '</span>' + rowSub(item) +
          (p.debt ? '<span class="su-tag">' + IC.icon('debt') + '<span data-i18n="setup.pay.owe"></span></span>' : '') +
        '</span>' +
        '<span class="su-item__edit" aria-hidden="true">' + IC.icon('edit') + '</span>' +
      '</button>' +
      '<button type="button" class="su-iconbtn" data-remove="' + item.id + '" data-i18n-aria="setup.pay.removeAria"' +
        P.vars({ name: name }) + '>' + IC.icon('trash') + '</button>' +
    '</li>';
  }

  function chips() {
    const used = S.items.map(function (i) { return i.preset; });
    return SU.PRESETS.filter(function (p) { return p.repeat || used.indexOf(p.id) < 0; }).map(function (p) {
      return '<button type="button" class="chip su-chip" data-preset="' + p.id + '">' + IC.icon(p.icon) +
        '<span data-i18n="preset.' + p.id + '"></span>' + IC.icon('plus', { cls: 'su-chip__plus' }) + '</button>';
    }).join('');
  }

  function html() {
    const has = S.items.length > 0;
    let out = '<div class="su-head">' +
      '<h1 class="su-q" id="su-q" tabindex="-1" data-i18n="setup.pay.q"></h1>' +
      '<p class="lead" data-i18n="setup.pay.hint"></p></div>';
    if (has) {
      out += '<section class="su-block" aria-labelledby="su-yours">' +
        '<h2 class="section-title" id="su-yours" data-i18n="setup.pay.yours"></h2>' +
        '<ul class="list su-items">' + S.items.map(row).join('') + '</ul>' +
        '<div class="su-total"><span data-i18n="setup.pay.total"></span>' + F.moneyHtml(SU.setAside()) + '</div>' +
      '</section>';
    }
    out += '<section class="su-block" aria-labelledby="su-add">' +
      '<h2 class="section-title" id="su-add" tabindex="-1" data-i18n="' + (has ? 'setup.pay.addMore' : 'setup.pay.add') + '"></h2>' +
      '<div class="chips su-chips">' + chips() + '</div>' +
    '</section>';
    if (!has) out += '<p class="note">' + IC.icon('info') + '<span data-i18n="setup.pay.none"></span></p>';
    return out;
  }

  /* ---------- amount sheet ---------- */
  function everyHtml(every) {
    function btn(v, key) {
      const on = every === v;
      return '<button type="button" class="segmented__btn" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) +
        '" data-every="' + v + '" data-i18n="' + key + '"></button>';
    }
    return '<div class="su-every">' +
      '<p class="sr-only" id="su-often" data-i18n="setup.pay.often"></p>' +
      '<div class="segmented segmented--block" role="radiogroup" aria-labelledby="su-often">' +
        btn('month', 'common.monthly') + btn('year', 'common.yearly') + '</div>' +
      '<p class="su-every__note" data-every-note aria-live="polite"></p>' +
    '</div>';
  }

  function nameHtml(item) {
    return '<div class="field"><label class="field__label" for="su-name" data-i18n="setup.pay.nameLabel"></label>' +
      '<input class="field__input" id="su-name" type="text" maxlength="30" autocomplete="off" value="' +
      P.esc(item && item.name ? item.name : '') + '"></div>';
  }

  function openSheet(presetId, item) {
    const p = SU.preset(presetId);
    let every = item ? item.every : 'month';
    const token = 'su' + Math.random().toString(36).slice(2, 7);
    const extra = '<div class="su-sheet" data-su-sheet="' + token + '">' +
      (p.id === 'other' ? nameHtml(item) : '') +
      (p.debt ? '<p class="note">' + IC.icon('debt') + '<span data-i18n="setup.pay.loanNote"></span></p>' : everyHtml(every)) +
    '</div>';

    function check(n, lang) {
      const box = document.querySelector('[data-su-sheet="' + token + '"]');
      const monthly = every === 'year' ? Math.round(n / 12) : n;
      const note = box && box.querySelector('[data-every-note]');
      if (note) {
        note.textContent = every === 'year' && n
          ? I.t('setup.pay.perMonthNote', { amount: F.money(monthly, lang) }, lang)
          : I.t('setup.pay.yearlyNote', { n: F.num(12, lang) }, lang);
      }
      return S.salary && monthly > S.salary ? I.t('check.moreThanSalary', null, lang) : '';
    }

    const sh = TZ.keypad.sheet({
      titleKey: item && item.nameKey ? item.nameKey : 'preset.' + p.id,
      labelKey: 'setup.pay.label',
      value: item ? item.amount : 0,
      check: check,
      extraHtml: extra,
      onSave: function (n, el) {
        const input = el.querySelector('#su-name');
        const name = input ? input.value.trim() : '';
        let target = item;
        if (!target) {
          target = { id: SU.newId(), preset: p.id };
          S.items.push(target);
        }
        target.amount = n;
        target.every = p.debt ? 'month' : every;
        if (p.id === 'other') target.name = name || undefined;
        SU.refresh({ focusRow: target.id });
      }
    });

    /* Monthly / Yearly choice (click + arrow keys) */
    const seg = sh.el.querySelector('.segmented');
    if (seg) {
      const btns = Array.prototype.slice.call(seg.querySelectorAll('[data-every]'));
      const choose = function (b) {
        every = b.getAttribute('data-every');
        btns.forEach(function (x) { x.setAttribute('aria-checked', x === b); x.tabIndex = x === b ? 0 : -1; });
        b.focus();
        sh.pad.render();
      };
      seg.addEventListener('click', function (e) { const b = e.target.closest('[data-every]'); if (b) choose(b); });
      seg.addEventListener('keydown', function (e) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) < 0) return;
        e.preventDefault();
        choose(btns[1 - btns.indexOf(document.activeElement)] || btns[0]);
      });
    }
    sh.pad.render();
  }

  /* ---------- remove with Undo ---------- */
  function remove(id) {
    const idx = S.items.findIndex(function (i) { return i.id === id; });
    if (idx < 0) return;
    const gone = S.items.splice(idx, 1)[0];
    const name = SU.itemName(gone);
    SU.refresh({ focusAdd: true });
    const t = TZ.ui.toast(document.querySelector('.phone'), {
      message: I.t('setup.pay.removed', { name: name }),
      undoLabel: I.t('common.undo'),
      onUndo: function () {
        S.items.splice(Math.min(idx, S.items.length), 0, gone);
        SU.refresh({ focusRow: gone.id });
      }
    });
    const foot = document.querySelector('.page-foot');
    if (foot) t.el.style.bottom = (foot.offsetHeight + 12) + 'px';
  }

  function mount(root) {
    root.addEventListener('click', function (e) {
      const c = e.target.closest('[data-preset]');
      if (c) { openSheet(c.getAttribute('data-preset'), null); return; }
      const ed = e.target.closest('[data-edit]');
      if (ed) {
        const item = S.items.filter(function (i) { return i.id === ed.getAttribute('data-edit'); })[0];
        if (item) openSheet(item.preset, item);
        return;
      }
      const rm = e.target.closest('[data-remove]');
      if (rm) remove(rm.getAttribute('data-remove'));
    });
  }

  SU.pay = { html: html, mount: mount };
})();
