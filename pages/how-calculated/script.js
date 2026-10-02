/* How we got your number — the month as a picture, not a formula.
   Salary, minus each fixed payment and the planned debt payment,
   = money I can use, shared over the days until salary = the daily number.
   Every row is a button that opens one plain sentence (aria-expanded). */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data;
  const d = D.get();
  const r = D.calculate(d);
  const open = {};               // which explanations are open (kept across re-renders)
  const FIXED_COLORS = ['rent', 'bills', 'extra'];

  /* ---------- the steps, from TZ.data ---------- */
  function steps() {
    const out = [{ id: 'salary', tone: 'salary', icon: 'moneyIn', sign: '', name: I.t('howCalculated.salary'), amount: d.salary,
      info: I.t('howCalculated.salaryInfo', { day: F.num(d.salaryDay) }) }];
    (d.fixed || []).forEach(function (f, i) {
      out.push({ id: 'f-' + f.id, tone: FIXED_COLORS[Math.min(i, 2)], icon: f.preset, sign: 'minus', name: D.name(f),
        amount: D.monthly(f), paid: !!f.paid, bar: true,
        info: f.paid ? I.t('howCalculated.paidInfo')
          : f.every === 'year' ? I.t('howCalculated.fixedYearlyInfo') : I.t('howCalculated.fixedInfo', { day: F.num(f.dueDay) }) });
    });
    (d.debts || []).forEach(function (x) {
      if (!(x.remaining > 0)) return;
      out.push({ id: 'd-' + x.id, tone: 'debt', icon: x.preset || 'debt', sign: 'minus',
        name: I.t('howCalculated.debtName', { name: D.name(x) }), amount: Math.min(x.monthly, x.remaining), paid: !!x.paid, bar: true,
        info: x.paid ? I.t('howCalculated.paidInfo') : I.t('howCalculated.debtInfo') });
    });
    const change = r.moneyICanUse - Math.max(0, r.plan);
    if (change) {
      out.push({ id: 'changes', tone: 'changes', icon: change > 0 ? 'moneyIn' : 'moneyOut', sign: change > 0 ? 'plus' : 'minus',
        name: I.t('howCalculated.changes'), amount: Math.abs(change), info: I.t('howCalculated.changesInfo') });
    }
    out.push({ id: 'use', tone: 'use', icon: 'wallet', sign: 'equals', name: I.t('howCalculated.use'), amount: r.moneyICanUse,
      total: true, bar: true, info: I.t('howCalculated.useInfo') });
    return out;
  }

  function stepHtml(s, i) {
    const infoId = 'hc-info-' + s.id;
    return '<li class="hc-step hc-tone--' + s.tone + (s.total ? ' hc-step--total' : '') + '" style="--i:' + i + '">' +
      '<button type="button" class="hc-step__btn" aria-expanded="' + !!open[s.id] + '" aria-controls="' + infoId + '" data-step="' + s.id + '">' +
        '<span class="hc-chip">' + IC.icon(s.icon) + '</span>' +
        '<span class="hc-step__name">' + P.esc(s.name) +
          (s.paid ? ' <span class="hc-tag">' + IC.icon('check') + '<span data-i18n="howCalculated.paidTag"></span></span>' : '') +
        '</span>' +
        '<span class="hc-step__amt">' + (s.sign ? '<span class="hc-sign">' + IC.icon(s.sign) + '</span>' : '') + F.moneyHtml(s.amount) + '</span>' +
        IC.icon('chevron', { cls: 'hc-step__chev' }) +
      '</button>' +
      '<p class="hc-step__info" id="' + infoId + '"' + (open[s.id] ? '' : ' hidden') + '>' + P.esc(s.info) + '</p>' +
    '</li>';
  }

  /* ---------- the result: shared over the days left ---------- */
  function result(n) {
    return '<section class="card card--hero hc-result" style="--i:' + n + '" aria-labelledby="hc-shared">' +
      '<p class="hc-result__eyebrow">' + IC.icon('calendar') +
        '<span id="hc-shared" data-i18n="howCalculated.shared"' + P.vars({ n: F.num(r.daysLeft) }) + '></span></p>' +
      '<p class="hero-number hc-result__num"><bdi class="hero-number__value num">' + F.num(r.daily) + '</bdi>' +
        '<span class="hero-number__cur">' + I.currency() + '</span>' +
        '<span class="hc-result__per" data-i18n="howCalculated.perDay"></span></p>' +
      '<p class="hc-result__sub" data-i18n="howCalculated.sharedInfo"' + P.vars({ date: F.date(r.nextSalary, 'short') }) + '></p>' +
    '</section>';
  }

  /* ---------- salary split into parts (proportional, with a text legend) ---------- */
  function split(list) {
    const parts = list.filter(function (s) { return s.bar && s.amount > 0; });
    const whole = Math.max(d.salary, parts.reduce(function (a, s) { return a + s.amount; }, 0)) || 1;
    const aria = I.t('howCalculated.barAria', {
      salary: F.money(d.salary),
      list: parts.map(function (s) { return s.name + ' ' + F.money(s.amount); }).join(', ')
    });
    return '<section class="card hc-split" aria-labelledby="hc-split-title">' +
      '<h2 class="hc-split__title" id="hc-split-title" data-i18n="howCalculated.barTitle"></h2>' +
      '<div class="hc-bar" role="img" aria-label="' + P.esc(aria) + '">' +
        parts.map(function (s, i) {
          return '<span class="hc-seg hc-tone--' + s.tone + '" style="--w:' + (s.amount / whole * 100).toFixed(2) + '%;--i:' + i + '"></span>';
        }).join('') +
      '</div>' +
      '<ul class="hc-legend" aria-hidden="true">' + parts.map(function (s) {
        return '<li class="hc-tone--' + s.tone + '"><span class="hc-swatch"></span><span class="hc-legend__name">' + P.esc(s.name) + '</span>' +
          '<span class="hc-legend__amt">' + F.moneyHtml(s.amount) + '</span></li>';
      }).join('') + '</ul>' +
    '</section>';
  }

  function render() {
    const list = steps();
    document.getElementById('app').innerHTML =
      P.header({ titleKey: 'howCalculated.title', back: 'home' }) +
      '<main class="phone__scroll"><div class="screen hc is-play">' +
        '<p class="lead" data-i18n="howCalculated.lead"></p>' +
        '<ol class="hc-steps" data-i18n-aria="howCalculated.stepsAria">' + list.map(stepHtml).join('') + '</ol>' +
        result(list.length) +
        split(list) +
        '<p class="note">' + IC.icon('info') + '<span data-i18n="howCalculated.note"></span></p>' +
        '<button type="button" class="btn btn--secondary hc-replay" data-replay>' + IC.icon('replay') +
          '<span data-i18n="howCalculated.replay"></span></button>' +
      '</div></main>';
  }

  /* ---------- actions ---------- */
  function toggle(btn) {
    const id = btn.getAttribute('data-step');
    open[id] = !open[id];
    btn.setAttribute('aria-expanded', String(open[id]));
    document.getElementById('hc-info-' + id).hidden = !open[id];
  }
  function replay() {
    const root = document.querySelector('.hc');
    root.classList.remove('is-play');
    void root.offsetWidth;          // restart the CSS animations
    root.classList.add('is-play');
    const scroller = document.querySelector('.phone__scroll');
    scroller.scrollTo({ top: 0, behavior: TZ.ui.reduceMotion() ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', function (e) {
    const step = e.target.closest('[data-step]');
    if (step) { toggle(step); return; }
    if (e.target.closest('[data-replay]')) replay();
  });

  P.boot({ titleKey: 'howCalculated.title', render: render });
})();
