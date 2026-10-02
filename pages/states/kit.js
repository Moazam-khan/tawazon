/* Special moments — shared bits for the screens (registry + small render helpers).
   Each screen registers TZ.states.screens[id] = { render(), on(act, el), after(app), reset() }. */
(function () {
  'use strict';
  const F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* text with amounts already wrapped in <bdi> (translations are ours, so HTML vars are safe) */
  function t(key, vars) { return I.t(key, vars); }
  function money(n) { return F.moneyHtml(n); }
  function num(n) { return '<bdi class="num">' + F.num(n) + '</bdi>'; }

  /* A sample name inside an English sentence ("the car loan payment"); user-typed names stay as typed */
  function nameIn(item) { return item.nameKey && I.getLang() === 'en' ? D.name(item).toLowerCase() : D.name(item); }

  function mascot(mood, cls) { return IC.mascot(mood, cls || '', I.t('brand.short')); }

  function badge(status) {
    return '<span class="badge badge--' + status + '" data-tour="status">' + IC.face(status) +
      '<span data-i18n="status.' + status + '"></span></span>';
  }

  /* The daily number card, as on Home */
  function hero(daily, opts) {
    opts = opts || {};
    return '<section class="card card--hero st-hero"' + (opts.tour ? ' data-tour="number"' : '') + '>' +
      '<p class="card__eyebrow" data-i18n="' + (opts.eyebrowKey || 'home.canSpendToday') + '"></p>' +
      '<p class="hero-number"><bdi class="hero-number__value num">' + F.num(daily) + '</bdi>' +
      '<span class="hero-number__cur">' + I.currency() + '</span></p>' +
      (opts.extra || '') + '</section>';
  }

  /* Next unpaid fixed payment after today (for home-like screens) */
  function nextPayment(d) {
    const day = +d.today.split('-')[2];
    const f = (d.fixed || []).filter(function (x) { return !x.paid && x.dueDay > day; })
      .sort(function (a, b) { return a.dueDay - b.dueDay; })[0];
    if (!f) return '';
    const iso = d.today.slice(0, 8) + String(f.dueDay).padStart(2, '0');
    return '<h2 class="section-title" data-i18n="states.home.next"></h2>' +
      '<div class="list"><div class="row"><span class="row__icon">' + IC.icon(f.preset || 'bills') + '</span>' +
      '<span class="row__body"><span class="row__title">' + D.name(f) + '</span>' +
      '<span class="row__sub">' + F.date(iso, 'short') + '</span></span>' +
      '<span class="row__end">' + money(D.monthly(f)) + '</span></div></div>';
  }

  /* Home-like body: hero + status + next payment */
  function homeBody(d, r, opts) {
    opts = opts || {};
    const extra = '<div class="st-hero__foot">' + badge(r.status) +
      '<span class="st-hero__days" data-i18n="states.home.daysLeft"' + TZ.page.vars({ n: F.num(r.daysLeft) }) + '></span></div>';
    return hero(r.daily, { tour: opts.tour, extra: extra }) + nextPayment(d);
  }

  function toast(message, onUndo) {
    return TZ.ui.toast(document.querySelector('.phone'), {
      message: message, undoLabel: onUndo ? I.t('common.undo') : null, onUndo: onUndo, duration: onUndo ? 10000 : 5000
    });
  }

  TZ.states = {
    screens: {},
    kit: { nameIn: nameIn, clone: clone, t: t, money: money, num: num, mascot: mascot, badge: badge, hero: hero, homeBody: homeBody, nextPayment: nextPayment, toast: toast }
  };
})();
