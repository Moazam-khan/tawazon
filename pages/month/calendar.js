/* My month — "The days until salary": a small calendar from today to salary day.
   Payment days and salary day carry an icon; tapping one shows a one-line detail
   (aria-expanded + aria-controls). Weeks start on Sunday, as in Saudi Arabia. */
window.TZ = window.TZ || {};

TZ.monthCalendar = (function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data;

  function addDays(iso, n) { const t = D.parse(iso); t.setDate(t.getDate() + n); return D.iso(t); }
  function icon(name, fallback) { return IC.icon(IC.names.indexOf(name) > -1 ? name : fallback); }

  /* What happens on each day from today until salary: { iso: [ {kind, icon, name, amount, paid} ] } */
  function marks(d, r) {
    const out = {};
    const add = function (iso, m) { (out[iso] = out[iso] || []).push(m); };
    for (let iso = d.today; iso < r.nextSalary; iso = addDays(iso, 1)) {
      const day = D.parse(iso).getDate();
      (d.fixed || []).forEach(function (f) {
        if (f.every !== 'year' && f.dueDay === day) add(iso, { kind: 'pay', icon: f.preset, name: D.name(f), amount: D.monthly(f), paid: !!f.paid });
      });
      (d.debts || []).forEach(function (x) {
        if (x.remaining > 0 && x.dueDay === day) {
          add(iso, { kind: 'pay', icon: x.preset || 'debt', name: I.t('howCalculated.debtName', { name: D.name(x) }), amount: Math.min(x.monthly, x.remaining), paid: !!x.paid });
        }
      });
    }
    add(r.nextSalary, { kind: 'salary', icon: 'moneyIn', name: I.t('month.cal.salary'), amount: d.salary });
    return out;
  }

  function detail(iso, list) {
    const date = F.date(iso, 'short');
    return list.map(function (m) {
      if (m.kind === 'salary') return I.t('month.cal.salaryDetail', { date: date, amount: F.money(m.amount) });
      return I.t(m.paid ? 'month.cal.paid' : 'month.cal.payment', { date: date, name: m.name, amount: F.money(m.amount) });
    }).join(' ');
  }

  function weekdays() {
    const loc = I.getLang() === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB';
    const fmt = new Intl.DateTimeFormat(loc, { weekday: 'narrow' });
    /* 1 Jan 2023 was a Sunday */
    return [0, 1, 2, 3, 4, 5, 6].map(function (k) { return fmt.format(new Date(2023, 0, 1 + k)); });
  }

  function cell(iso, d, r, mk, openDay) {
    const n = F.num(D.parse(iso).getDate());
    if (iso < d.today) return '<span class="mo-day mo-day--past" aria-hidden="true">' + n + '</span>';
    if (iso > r.nextSalary) return '<span class="mo-day mo-day--empty" aria-hidden="true"></span>';
    const list = mk[iso];
    const today = iso === d.today ? ' mo-day--today' : '';
    if (!list) return '<span class="mo-day' + today + '" aria-hidden="true">' + n + '</span>';
    const salary = list.some(function (m) { return m.kind === 'salary'; });
    const what = list.map(function (m) { return m.name; }).join(', ');
    return '<button type="button" class="mo-day mo-day--mark mo-day--' + (salary ? 'salary' : 'pay') + today + '" data-calday="' + iso + '"' +
      ' aria-expanded="' + (openDay === iso) + '" aria-controls="mo-cal-detail"' +
      ' aria-label="' + P.esc(I.t('month.cal.dayAria', { date: F.date(iso, 'long'), what: what })) + '">' +
      '<span class="mo-day__n">' + n + '</span>' + icon(list[0].icon, salary ? 'moneyIn' : 'bills') + '</button>';
  }

  function section(d, r, openDay) {
    const mk = marks(d, r);
    const t = D.parse(d.today), first = addDays(d.today, -t.getDay());
    const s = D.parse(r.nextSalary), last = addDays(r.nextSalary, 6 - s.getDay());
    let cells = '';
    for (let iso = first; iso <= last; iso = addDays(iso, 1)) cells += cell(iso, d, r, mk, openDay);

    /* key: today + each distinct thing that happens, in date order */
    const seen = {};
    let keys = '<li><i class="mo-key mo-key--today"></i><span data-i18n="common.today"></span></li>';
    Object.keys(mk).sort().forEach(function (iso) {
      mk[iso].forEach(function (m) {
        if (seen[m.name]) return;
        seen[m.name] = true;
        keys += '<li><span class="mo-chip mo-chip--' + m.kind + '">' + icon(m.icon, m.kind === 'salary' ? 'moneyIn' : 'bills') + '</span>' +
          '<span>' + P.esc(m.name) + '</span></li>';
      });
    });

    return '<section class="card mo-card mo-cal" aria-labelledby="mo-cal-title">' +
      '<div class="mo-head"><h2 class="mo-title" id="mo-cal-title" data-i18n="month.cal.title"></h2>' +
        '<p class="mo-sub" data-i18n="month.hero.daysLeft"' + P.vars({ n: F.num(r.daysLeft) }) + '></p></div>' +
      '<div class="mo-cal__grid" role="group" aria-label="' + P.esc(I.t('month.cal.aria', { from: F.date(d.today, 'long'), to: F.date(r.nextSalary, 'long') })) + '">' +
        weekdays().map(function (w) { return '<span class="mo-cal__wd" aria-hidden="true">' + P.esc(w) + '</span>'; }).join('') +
        cells +
      '</div>' +
      '<p class="mo-cal__detail' + (openDay ? ' is-open' : '') + '" id="mo-cal-detail" aria-live="polite">' +
        P.esc(openDay && mk[openDay] ? detail(openDay, mk[openDay]) : I.t('month.cal.hint')) + '</p>' +
      '<ul class="mo-keys mo-keys--cal" aria-hidden="true">' + keys + '</ul>' +
    '</section>';
  }

  /* Open / close a day's detail without re-rendering (keeps focus where it is) */
  function sync(d, openDay) {
    const r = D.calculate(d), mk = marks(d, r);
    document.querySelectorAll('[data-calday]').forEach(function (b) {
      b.setAttribute('aria-expanded', String(b.getAttribute('data-calday') === openDay));
    });
    const el = document.getElementById('mo-cal-detail');
    if (!el) return;
    el.textContent = openDay && mk[openDay] ? detail(openDay, mk[openDay]) : I.t('month.cal.hint');
    el.classList.toggle('is-open', !!openDay);
  }

  return { section: section, sync: sync };
})();
