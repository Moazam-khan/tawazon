/* Home — markup for each section. Pure functions: data in, HTML string out.
   script.js owns state, demo states and actions. */
window.TZ = window.TZ || {};

TZ.homeView = (function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data;
  const DAY = 86400000;

  /* ---------- greeting ---------- */
  function greeting(d) {
    const h = 9;   /* mock time: the sample story is a morning (matches the morning-number notification) */
    const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    return '<div class="hm-greet">' +
      '<p class="hm-greet__date">' + F.date(d.today, 'long') + '</p>' +
      '<h1 class="hm-greet__title" data-i18n="home.greet.' + part + '"' + P.vars({ name: I.t('mock.you') }) + '></h1>' +
    '</div>';
  }

  /* ---------- the daily number ---------- */
  function hero(d, r) {
    const pct = Math.round(r.dayOfPeriod / r.periodDays * 100);
    const daysKey = r.daysLeft === 1 ? 'home.oneDayUntil' : 'home.daysUntil';
    return '<section class="card card--hero hm-hero" aria-labelledby="hm-eyebrow">' +
      '<h2 class="card__eyebrow hm-hero__eyebrow" id="hm-eyebrow" data-i18n="home.canSpendToday"></h2>' +
      '<div class="hm-hero__numrow">' +
        '<p class="hero-number hm-hero__number">' +
          '<bdi class="hero-number__value num" data-daily>' + F.num(r.daily) + '</bdi>' +
          '<span class="hero-number__cur">' + I.currency() + '</span>' +
        '</p>' +
        (TZ.speak ? TZ.speak.button('home', { cls: 'speak--hero hm-hero__speak' }) : '') +
      '</div>' +
      '<span class="badge badge--' + r.status + ' hm-hero__badge">' + IC.face(r.status) +
        '<span data-i18n="status.' + r.status + '"></span></span>' +
      (d.moneyCheck ? '<p class="hm-hero__check">' + IC.icon('check') + '<span data-i18n="home.fromCheck"></span></p>' : '') +
      '<div class="progress hm-hero__progress" style="--value:' + pct + '%">' +
        '<div class="progress__head">' +
          '<span data-i18n="' + daysKey + '"' + P.vars({ n: F.num(r.daysLeft) }) + '></span>' +
          '<span data-i18n="home.salaryOn"' + P.vars({ date: F.date(r.nextSalary, 'short') }) + '></span>' +
        '</div>' +
        '<div class="progress__track" role="progressbar" aria-valuemin="1" aria-valuemax="' + r.periodDays + '" aria-valuenow="' + r.dayOfPeriod + '"' +
          ' data-i18n-aria="progress.day"' + P.vars({ day: F.num(r.dayOfPeriod), total: F.num(r.periodDays) }) + '>' +
          '<div class="progress__fill"></div></div>' +
      '</div>' +
      '<a class="hm-hero__how" href="' + P.url('how-calculated') + '">' +
        IC.icon('question') + '<span data-i18n="home.howLink"></span>' + IC.icon('chevron', { dir: true, cls: 'hm-hero__chev' }) + '</a>' +
    '</section>';
  }

  /* ---------- two big quick actions ---------- */
  function actions() {
    function tile(tag, attrs, icon, key) {
      return '<' + tag + ' class="hm-action" ' + attrs + '>' +
        '<span class="hm-action__icon">' + IC.icon(icon) + '</span>' +
        '<span class="hm-action__title" data-i18n="home.actions.' + key + '"></span>' +
        '<span class="hm-action__sub" data-i18n="home.actions.' + key + 'Sub"></span>' +
      '</' + tag + '>';
    }
    return '<div class="hm-actions">' +
      tile('a', 'href="' + P.url('ask') + '#spend"', 'chat', 'spend') +
      tile('button', 'type="button" data-update', 'wallet', 'update') +
    '</div>';
  }

  /* ---------- coming up: fixed payments + the planned debt payment ---------- */
  function dueDate(today, dueDay, paid, paidOn) {
    if (paid && paidOn) return D.parse(paidOn);      // paid early: show the day it was paid
    const t = D.parse(today);
    let dt = new Date(t.getFullYear(), t.getMonth(), dueDay);
    if (!paid && dt < t) dt = new Date(t.getFullYear(), t.getMonth() + 1, dueDay);
    return dt;
  }
  function upcomingItems(d) {
    const items = [];
    (d.fixed || []).forEach(function (f) {
      if (f.every === 'year' || !f.dueDay) return;
      items.push({ kind: 'fixed', id: f.id, icon: f.preset, name: D.name(f), amount: f.amount, paid: !!f.paid, date: dueDate(d.today, f.dueDay, f.paid, f.paidOn) });
    });
    (d.debts || []).forEach(function (x) {
      if (!(x.remaining > 0)) return;
      items.push({ kind: 'debt', id: x.id, icon: x.preset || 'debt', name: I.t('home.upcoming.debtName', { name: D.name(x) }),
        amount: Math.min(x.monthly, x.remaining), paid: !!x.paid, date: dueDate(d.today, x.dueDay, x.paid, x.paidOn) });
    });
    return items.sort(function (a, b) { return (a.paid - b.paid) || (a.date - b.date); });
  }
  function upcomingRow(it, today) {
    const iso = D.iso(it.date);
    const n = Math.round((it.date - D.parse(today)) / DAY);
    let sub;
    if (it.paid) sub = '<span data-i18n="home.upcoming.paidOn"' + P.vars({ date: F.date(iso, 'short') }) + '></span>';
    else {
      const key = n <= 0 ? 'today' : n === 1 ? 'tomorrow' : 'inDays';
      sub = '<span data-i18n="home.upcoming.' + key + '"' + P.vars({ date: F.date(iso, 'short'), n: F.num(n) }) + '></span>';
    }
    return '<li class="row hm-due' + (it.paid ? ' is-paid' : '') + '" data-row="' + it.kind + ':' + it.id + '" tabindex="-1">' +
      '<span class="row__icon">' + IC.icon(it.paid ? 'check' : it.icon) + '</span>' +
      '<span class="row__body"><span class="row__title">' + P.esc(it.name) + '</span><span class="row__sub">' + sub + '</span></span>' +
      '<span class="hm-due__end">' +
        '<span class="row__end">' + F.moneyHtml(it.amount) + '</span>' +
        (it.paid ? '' : '<button type="button" class="hm-paid" data-paid="' + it.kind + ':' + it.id + '"' +
          ' data-i18n-aria="home.upcoming.markAria"' + P.vars({ name: it.name }) + '>' + IC.icon('check') +
          '<span data-i18n="home.upcoming.markPaid"></span></button>') +
      '</span>' +
    '</li>';
  }
  function upcoming(d) {
    const items = upcomingItems(d);
    if (!items.length) return '';
    return '<section class="stack-3" aria-labelledby="hm-up">' +
      '<h2 class="section-title" id="hm-up" data-i18n="home.upcoming.title"></h2>' +
      '<ul class="list">' + items.map(function (it) { return upcomingRow(it, d.today); }).join('') + '</ul>' +
    '</section>';
  }

  /* ---------- someone owes me ---------- */
  function owed(d) {
    const o = (d.owedToMe || [])[0];
    if (!o) return '';
    return '<div class="list"><a class="row hm-owed" href="' + P.url('my-money') + '#owed">' +
      '<span class="row__icon row__icon--sand">' + IC.icon('moneyIn') + '</span>' +
      '<span class="row__body"><span class="row__title" data-i18n="home.owed.title"' + P.vars({ name: D.name(o) }) + '></span>' +
        '<span class="row__sub" data-i18n="home.owed.sub"></span></span>' +
      '<span class="row__end">' + F.moneyHtml(o.amount) + '</span>' +
      IC.icon('chevron', { dir: true, cls: 'row__chev' }) +
    '</a></div>';
  }

  /* ---------- mascot tip ---------- */
  /* Link to the My month charts */
  function monthLink() {
    return '<div class="list"><a class="row" href="' + P.url('month') + '">' +
      '<span class="row__icon">' + IC.icon('calendar') + '</span>' +
      '<span class="row__body"><span class="row__title" data-i18n="home.monthLink.title"></span>' +
        '<span class="row__sub" data-i18n="home.monthLink.sub"></span></span>' +
      IC.icon('chevron', { dir: true, cls: 'row__chev' }) + '</a></div>';
  }

  /* The next big month (Ramadan, Eid…) with a link to the Big months planner */
  function season(d) {
    const next = (d.seasons || []).filter(function (s) { return D.seasonPlan(s, d.today).daysAway > 0; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; })[0];
    if (!next) return '';
    const plan = D.seasonPlan(next, d.today);
    const months = I.t('home.season.months', { n: F.num(plan.months) });
    return '<div class="list"><a class="row" href="' + P.url('seasons') + '">' +
      '<span class="row__icon row__icon--sand">' + IC.icon(next.icon) + '</span>' +
      '<span class="row__body"><span class="row__title" data-i18n="home.season.title"' + P.vars({ name: I.t('seasons.name.' + next.id), months: months }) + '></span>' +
        '<span class="row__sub" data-i18n="home.season.' + (next.active ? 'subOn' : 'sub') + '"' + P.vars({ amount: F.money(plan.perMonth) }) + '></span></span>' +
      IC.icon('chevron', { dir: true, cls: 'row__chev' }) +
    '</a></div>';
  }

  function tip(key, mood) {
    return '<div class="bubble-row hm-tip">' +
      IC.mascot(mood, 'mascot--sm', I.t('brand.short')) +
      '<p class="bubble" data-i18n="home.tip.' + key + '"></p>' +
    '</div>';
  }

  return { greeting: greeting, hero: hero, actions: actions, upcoming: upcoming, owed: owed, season: season, monthLink: monthLink, tip: tip };
})();
