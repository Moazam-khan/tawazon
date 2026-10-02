/* My money — small form pieces used inside the amount sheets (TZ.keypad.sheet extraHtml).
   MM.form.chips / name / seg / select build markup; MM.form.wire(sheetEl) makes it work;
   MM.form.read(sheetEl) returns { name, key, preset, <data-field>…, <data-seg>… } or null. */
MM.form = (function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons;
  let n = 0;
  function uid(p) { n += 1; return 'mmf-' + p + n; }

  /* presets: [{ id, icon, key }] — picking one fills the name field */
  function chips(presets, sel) {
    const lid = uid('pick');
    return '<div class="mm-field"><p class="field__label" id="' + lid + '" data-i18n="myMoney.form.pick"></p>' +
      '<div class="chips mm-chips" role="group" aria-labelledby="' + lid + '">' + presets.map(function (p) {
        return '<button type="button" class="chip" data-preset="' + p.id + '" data-key="' + p.key + '" aria-pressed="' + (p.id === sel) + '">' +
          IC.icon(p.icon) + '<span data-i18n="' + p.key + '"></span></button>';
      }).join('') + '</div></div>';
  }

  function name(labelKey, value) {
    const fid = uid('name');
    return '<div class="field"><label class="field__label" for="' + fid + '" data-i18n="' + labelKey + '"></label>' +
      '<input class="field__input" id="' + fid + '" type="text" autocomplete="off" maxlength="40" data-name value="' + P.esc(value || '') + '">' +
      '<p class="field__error mm-error" data-name-error hidden>' + IC.icon('info') + '<span data-i18n="myMoney.form.nameNeeded"></span></p></div>';
  }

  /* options: [{ v, key }] — a radio group that looks like a segmented control */
  function seg(labelKey, field, options, sel) {
    const lid = uid('seg');
    return '<div class="mm-field"><p class="field__label" id="' + lid + '" data-i18n="' + labelKey + '"></p>' +
      '<div class="segmented segmented--block" role="radiogroup" aria-labelledby="' + lid + '" data-seg="' + field + '">' +
      options.map(function (o) {
        const on = o.v === sel;
        return '<button type="button" class="segmented__btn" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) +
          '" data-v="' + o.v + '" data-i18n="' + o.key + '"></button>';
      }).join('') + '</div></div>';
  }

  /* options: [{ v, label }] (labels already formatted) */
  function select(labelKey, field, options, sel, hidden) {
    const fid = uid('sel');
    return '<div class="field" data-wrap="' + field + '"' + (hidden ? ' hidden' : '') + '>' +
      '<label class="field__label" for="' + fid + '" data-i18n="' + labelKey + '"></label>' +
      '<select class="field__input mm-select" id="' + fid + '" data-field="' + field + '">' + options.map(function (o) {
        return '<option value="' + o.v + '"' + (String(o.v) === String(sel) ? ' selected' : '') + '>' + P.esc(o.label) + '</option>';
      }).join('') + '</select></div>';
  }

  function days() {
    const out = [];
    for (let i = 1; i <= 31; i++) out.push({ v: i, label: I.t('myMoney.form.dayN', { n: F.num(i) }) });
    return out;
  }
  function months() {
    const loc = I.getLang() === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB';
    const fmt = new Intl.DateTimeFormat(loc, { month: 'long' });
    const out = [];
    for (let m = 0; m < 12; m++) out.push({ v: m + 1, label: fmt.format(new Date(2026, m, 1)) });
    return out;
  }
  /* The first day of each of the next `count` months, e.g. for "By when?" */
  function futureMonths(today, count) {
    const t = TZ.data.parse(today), out = [];
    for (let i = 1; i <= count; i++) {
      const iso = TZ.data.iso(new Date(t.getFullYear(), t.getMonth() + i, 1));
      out.push({ v: iso, label: F.date(iso, 'month') });
    }
    return out;
  }

  function showErr(el, on) {
    const e = el.querySelector('[data-name-error]');
    const input = el.querySelector('[data-name]');
    if (e) e.hidden = !on;
    if (input) input.setAttribute('aria-invalid', on ? 'true' : 'false');
  }

  function wire(el, opts) {
    opts = opts || {};
    function pickSeg(b) {
      b.parentNode.querySelectorAll('[data-v]').forEach(function (x) {
        const on = x === b;
        x.setAttribute('aria-checked', String(on));
        x.tabIndex = on ? 0 : -1;
      });
      if (opts.onSeg) opts.onSeg(b.getAttribute('data-v'));
    }
    el.addEventListener('click', function (e) {
      const c = e.target.closest('[data-preset]');
      if (c) {
        el.querySelectorAll('[data-preset]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
        const input = el.querySelector('[data-name]');
        if (input) {
          const other = c.getAttribute('data-preset') === 'other';
          input.value = other ? '' : I.t(c.getAttribute('data-key'));
          showErr(el, false);
          if (other) input.focus();
        }
        return;
      }
      const s = e.target.closest('[data-seg] [data-v]');
      if (s) pickSeg(s);
    });
    el.addEventListener('keydown', function (e) {
      const s = e.target.closest('[data-seg] [data-v]');
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!s || keys.indexOf(e.key) < 0) return;
      e.preventDefault();
      const all = Array.prototype.slice.call(s.parentNode.querySelectorAll('[data-v]'));
      let step = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      if (I.dir() === 'rtl' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) step = -step;
      const next = all[(all.indexOf(s) + step + all.length) % all.length];
      pickSeg(next);
      next.focus();
    });
    el.addEventListener('input', function (e) { if (e.target.matches('[data-name]')) showErr(el, false); });
  }

  function read(el) {
    const input = el.querySelector('[data-name]');
    const chip = el.querySelector('[data-preset][aria-pressed="true"]');
    const v = input ? input.value.trim() : '';
    if (input && !v) { showErr(el, true); input.focus(); return null; }
    const out = { name: v, key: null, preset: chip ? chip.getAttribute('data-preset') : null };
    if (chip && out.preset !== 'other' && v === I.t(chip.getAttribute('data-key'))) out.key = chip.getAttribute('data-key');
    el.querySelectorAll('[data-field]').forEach(function (f) { out[f.getAttribute('data-field')] = f.value; });
    el.querySelectorAll('[data-seg]').forEach(function (g) {
      const on = g.querySelector('[aria-checked="true"]');
      out[g.getAttribute('data-seg')] = on ? on.getAttribute('data-v') : null;
    });
    return out;
  }

  /* Store a translated preset name as a key (so it switches language), else the typed name */
  function applyName(item, r) {
    if (r.key) { item.nameKey = r.key; delete item.name; }
    else if (r.name !== TZ.data.name(item)) { item.name = r.name; delete item.nameKey; }
  }

  return { chips: chips, name: name, seg: seg, select: select, days: days, months: months,
           futureMonths: futureMonths, wire: wire, read: read, applyName: applyName };
})();
