/* Special moments — Tawazon widgets on the phone's home screen (#widget).
   A home-screen picture (wallpaper, plain app squares, time 9:41) with a SMALL and a
   MEDIUM Tawazon widget, then three simple steps to add one. Numbers from TZ.data. */
(function () {
  'use strict';
  const F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data, K = TZ.states.kit;

  /* Plain app squares: glyph + tint number (no names, no brands) */
  const GRID = [['calendar', 1], ['sun', 2], ['clock', 3], ['star', 4]];
  const ROW = [['bell', 5], ['heart', 6], ['gift', 2], ['mic', 1]];
  const DOCK = [['phone', 4], ['globe', 3], ['doc', 5], ['list', 6]];

  function app(a) { return '<span class="wg-app wg-app--' + a[1] + '" aria-hidden="true">' + IC.icon(a[0]) + '</span>'; }

  function statusBar() {
    return '<div class="wg-bar" aria-hidden="true"><span class="wg-bar__time">' + I.fmtDigits('9:41') + '</span>' +
      '<span class="wg-bar__sys">' +
        '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
        '<svg viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="16" height="8" rx="1.6"/><rect x="23.5" y="4" width="1.6" height="4" rx=".8" opacity=".5"/></svg>' +
      '</span></div>';
  }

  /* Next fixed payment or planned debt payment still to come before salary */
  function nextPayment(d) {
    const day = +d.today.split('-')[2];
    const fixed = (d.fixed || []).filter(function (f) { return !f.paid && f.every !== 'year' && f.dueDay > day; })
      .map(function (f) { return { item: f, icon: f.preset || 'bills', amount: D.monthly(f), day: f.dueDay }; });
    const debts = (d.debts || []).filter(function (x) { return x.remaining > 0 && !x.paid && x.dueDay > day; })
      .map(function (x) { return { item: x, icon: x.preset || 'debt', amount: Math.min(x.monthly, x.remaining), day: x.dueDay }; });
    return fixed.concat(debts).sort(function (a, b) { return a.day - b.day; })[0] || null;
  }

  function status(r) {
    return '<p class="wg-status wg-status--' + r.status + '">' + IC.face(r.status) +
      '<span data-i18n="status.' + r.status + '"></span></p>';
  }
  function number(r, cls) {
    return '<p class="wg-num ' + (cls || '') + '"><bdi class="num">' + F.num(r.daily) + '</bdi>' +
      '<span class="wg-num__cur">' + I.currency() + '</span></p>';
  }

  function small(r) {
    return '<div class="wg-widget wg-small">' +
      '<p class="wg-top">' + IC.logo('wg-logo') + '<span data-i18n="widget.today"></span></p>' +
      number(r) + status(r) +
    '</div>';
  }

  function medium(d, r) {
    const pct = Math.round(r.dayOfPeriod / r.periodDays * 100);
    const nx = nextPayment(d);
    const next = nx ? '<p class="wg-next">' +
        '<span class="wg-next__icon">' + IC.icon(nx.icon) + '</span>' +
        '<span class="sr-only" data-i18n="widget.nextAria"></span>' +
        '<span class="wg-next__text">' + K.t('widget.next', {
          name: D.name(nx.item), amount: K.money(nx.amount),
          date: '<bdi>' + F.date(d.today.slice(0, 8) + String(nx.day).padStart(2, '0'), 'short') + '</bdi>'
        }) + '</span></p>' : '';
    return '<div class="wg-widget wg-medium">' +
      '<p class="wg-top">' + IC.logo('wg-logo') + '<span data-i18n="home.canSpendToday"></span></p>' +
      '<div class="wg-medium__row">' + number(r, 'wg-num--md') + status(r) + '</div>' +
      '<div class="wg-days">' +
        '<p class="wg-days__text" data-i18n="widget.daysLeft"' + TZ.page.vars({ n: F.num(r.daysLeft) }) + '></p>' +
        '<div class="progress wg-progress" style="--value:' + pct + '%"><div class="progress__track"><div class="progress__fill"></div></div></div>' +
      '</div>' +
      next +
    '</div>';
  }

  function steps() {
    return '<ol class="wg-steps">' + ['step1', 'step2', 'step3'].map(function (k, i) {
      return '<li class="wg-step"><span class="wg-step__n" aria-hidden="true">' + F.num(i + 1) + '</span>' +
        '<span data-i18n="widget.' + k + '"></span></li>';
    }).join('') + '</ol>';
  }

  TZ.states.screens.widget = {
    render: function () {
      const d = D.get(), r = D.calculate(d);
      return '<main class="phone__scroll"><div class="screen wg">' +
        '<section class="wg-home" aria-labelledby="wg-home-title">' +
          '<h2 class="sr-only" id="wg-home-title" data-i18n="widget.homeAria"></h2>' +
          statusBar() +
          '<div class="wg-grid">' + small(r) + GRID.map(app).join('') + medium(d, r) + ROW.map(app).join('') + '</div>' +
          '<div class="wg-dots" aria-hidden="true"><i class="is-on"></i><i></i></div>' +
          '<div class="wg-dock" aria-hidden="true">' + DOCK.map(app).join('') + '</div>' +
        '</section>' +
        '<section class="card wg-how" aria-labelledby="wg-how-title">' +
          '<div class="wg-how__head">' + IC.logo('wg-how__logo') +
            '<div class="wg-how__text"><h2 class="wg-how__title" id="wg-how-title" data-i18n="widget.addTitle"></h2>' +
            '<p class="wg-how__lead" data-i18n="widget.addLead"></p></div></div>' +
          steps() +
        '</section>' +
      '</div></main>';
    }
  };
})();
