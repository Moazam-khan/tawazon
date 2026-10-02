/* Setup — question 1 (salary keypad) and question 2 (pay day grid). */
(function () {
  'use strict';
  const F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, P = TZ.page;
  const S = SU.state;
  const COLS = 6;              // day grid columns (keeps every cell >= 48px wide)

  function head(qKey, hintKey) {
    return '<div class="su-head">' +
      '<h1 class="su-q" id="su-q" tabindex="-1" data-i18n="' + qKey + '"></h1>' +
      '<p class="lead" data-i18n="' + hintKey + '"></p>' +
    '</div>';
  }

  /* ---------- 1. salary ---------- */
  function salaryHtml() {
    return head('setup.salary.q', 'setup.salary.hint') +
      '<div class="su-pad" id="su-pad"></div>' +
      '<button type="button" class="btn btn--text su-example" data-example>' + IC.icon('sparkle') +
        '<span data-i18n="setup.example"></span></button>';
  }

  function salaryCheck(n, lang) {
    if (!n) return S.showZero ? I.t('check.zero', null, lang) : '';
    if (n < 1500) return I.t('check.low', { amount: F.money(n, lang) }, lang);
    if (n > 50000) return I.t('check.high', { amount: F.money(n, lang) }, lang);
    return '';
  }

  function mountSalary(root, onChange) {
    const pad = TZ.keypad.create(root.querySelector('#su-pad'), {
      labelKey: 'setup.salary.label',
      value: S.salary,
      check: salaryCheck,
      onChange: function (n) { S.salary = n; S.showZero = false; onChange(); }
    });
    return pad;
  }

  /* ---------- 2. pay day ---------- */
  function dayHtml() {
    let cells = '';
    for (let d = 1; d <= 31; d++) {
      const on = !S.lastDay && S.day === d;
      cells += '<button type="button" class="su-day" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) +
        '" data-day="' + d + '"><span class="num">' + F.num(d) + '</span></button>';
    }
    cells += '<button type="button" class="su-day su-day--last" role="radio" aria-checked="' + S.lastDay +
      '" tabindex="' + (S.lastDay ? 0 : -1) + '" data-day="last">' + IC.icon('calendar') +
      '<span data-i18n="setup.day.last"></span></button>';
    return head('setup.day.q', 'setup.day.hint') +
      '<div class="su-days" role="radiogroup" aria-labelledby="su-q">' + cells + '</div>' +
      '<div class="su-dayinfo" id="su-dayinfo" aria-live="polite">' + dayInfoHtml() + '</div>';
  }

  function daysText(n) {
    return I.t('common.days', { n: F.num(n) });   /* plural-aware key (Arabic forms handled by i18n) */
  }

  function dayInfoHtml() {
    const r = SU.preview();
    let html = '<div class="su-next">' +
      '<span class="su-next__icon">' + IC.icon('calendar') + '</span>' +
      '<span class="su-next__body">' +
        '<span class="su-next__title" data-i18n="setup.day.next"' + P.vars({ date: F.date(r.nextSalary, 'long') }) + '></span>' +
        '<span class="su-next__sub" data-i18n="setup.day.count"' + P.vars({ days: daysText(r.daysLeft) }) + '></span>' +
      '</span></div>';
    if (S.lastDay) {
      html += '<p class="note">' + IC.icon('info') + '<span data-i18n="setup.day.lastNote"' +
        P.vars({ a: F.num(28), b: F.num(30), c: F.num(31) }) + '></span></p>';
    } else if (S.day >= 29) {
      html += '<p class="note">' + IC.icon('info') + '<span data-i18n="setup.day.short"' +
        P.vars({ day: F.num(S.day) }) + '></span></p>';
    }
    return html;
  }

  function mountDay(root, onChange) {
    const group = root.querySelector('.su-days');
    const info = root.querySelector('#su-dayinfo');
    const cells = Array.prototype.slice.call(group.querySelectorAll('.su-day'));

    function pick(btn, focus) {
      const v = btn.getAttribute('data-day');
      S.lastDay = v === 'last';
      if (!S.lastDay) S.day = Number(v);
      cells.forEach(function (c) {
        const on = c === btn;
        c.setAttribute('aria-checked', on);
        c.tabIndex = on ? 0 : -1;
      });
      if (focus) btn.focus();
      info.innerHTML = dayInfoHtml();
      I.apply(info);
      onChange();
    }

    group.addEventListener('click', function (e) {
      const b = e.target.closest('.su-day');
      if (b) pick(b, false);
    });
    group.addEventListener('keydown', function (e) {
      const i = cells.indexOf(document.activeElement);
      if (i < 0) return;
      const rtl = document.documentElement.dir === 'rtl';
      const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: COLS, ArrowUp: -COLS }[e.key];
      let next = null;
      if (step) next = Math.max(0, Math.min(cells.length - 1, i + step));
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = cells.length - 1;
      if (next === null) return;
      e.preventDefault();
      pick(cells[next], true);
    });
  }

  SU.steps = {
    salaryHtml: salaryHtml, mountSalary: mountSalary,
    dayHtml: dayHtml, mountDay: mountDay
  };
})();
