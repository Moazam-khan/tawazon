/* Big months of the year — markup pieces (no state here; script.js owns it).
   SN.intro() · SN.summary(d) · SN.list(d) · SN.item(s, d) · SN.keepNote()   */
window.SN = (function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons, D = TZ.data;

  /* One icon per season (two Eids must not look the same). Every season uses the
     sand tint: big months are money kept for later (see PAGE-GUIDE "Colour roles"). */
  const LOOK = {
    ramadan: { icon: 'moon',   tone: 'sand' },
    eidFitr: { icon: 'gift',   tone: 'sand' },
    eidAdha: { icon: 'star',   tone: 'sand' },
    summer:  { icon: 'sun',    tone: 'sand' },
    school:  { icon: 'school', tone: 'sand' }
  };
  function look(s) { return LOOK[s.id] || { icon: s.icon || 'calendar', tone: 'sand' }; }
  function name(s) { return I.t('seasons.name.' + s.id); }
  function sorted(d) { return (d.seasons || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }); }
  function active(d) { return sorted(d).filter(function (s) { return s.active; }); }

  /* Daily number if nothing were set aside for big months */
  function dailyWithout(d) {
    const c = JSON.parse(JSON.stringify(d));
    (c.seasons || []).forEach(function (s) { s.active = false; });
    return D.calculate(c).daily;
  }

  function intro() {
    return '<div class="bubble-row sn-intro">' +
      IC.mascot('happy', 'mascot--sm mascot--float', I.t('brand.short')) +
      '<p class="bubble sn-intro__text" data-i18n="seasons.intro"></p>' +
    '</div>';
  }

  /* ---------- summary card at the top ---------- */
  function summary(d) {
    const r = D.calculate(d), on = active(d);
    if (!on.length) {
      return '<section class="card sn-sum sn-sum--empty" data-sum aria-labelledby="sn-sum-title">' +
        '<div class="sn-sum__top"><span class="sn-sum__icon">' + IC.icon('calendar') + '</span>' +
          '<h2 class="sn-sum__title" id="sn-sum-title" data-i18n="seasons.empty.title"></h2></div>' +
        '<p class="sn-sum__text" data-i18n="seasons.empty.text"></p>' +
        '<p class="sn-sum__stays">' + IC.icon('check') +
          '<span data-i18n="seasons.empty.daily"' + P.vars({ amount: F.money(r.daily) }) + '></span></p>' +
      '</section>';
    }
    return '<section class="card sn-sum" data-sum aria-labelledby="sn-sum-label">' +
      '<div class="sn-sum__top"><span class="sn-sum__icon">' + IC.icon('jar') + '</span>' +
        '<h2 class="sn-sum__label" id="sn-sum-label" data-i18n="seasons.sum.label"></h2></div>' +
      '<p class="sn-sum__value"><bdi class="sn-sum__num num">' + F.num(r.seasonsMonthly) + '</bdi>' +
        '<span class="sn-sum__cur">' + I.currency() + '</span>' +
        '<span class="sn-sum__per" data-i18n="common.perMonth"></span></p>' +
      '<ul class="sn-sum__for" data-i18n-aria="seasons.sum.forLabel">' + on.map(function (s) {
        return '<li class="sn-pill sn-tone--' + look(s).tone + '">' + IC.icon(look(s).icon) + '<span>' + P.esc(name(s)) + '</span></li>';
      }).join('') + '</ul>' +
      '<div class="sn-sum__daily">' +
        '<p class="kv"><span class="kv__k" data-i18n="seasons.sum.daily"></span>' +
          '<span class="kv__v sn-sum__dnum">' + F.moneyHtml(r.daily) + '</span></p>' +
        '<p class="sn-sum__was" data-i18n="seasons.sum.was"' + P.vars({ amount: F.money(dailyWithout(d)) }) + '></p>' +
      '</div>' +
    '</section>';
  }

  /* ---------- one season on the timeline ---------- */
  function when(s, d) {
    const plan = D.seasonPlan(s, d.today);
    const away = plan.daysAway < 40
      ? I.t('seasons.whenDays', { days: I.t('common.days', { n: F.num(plan.daysAway) }) })
      : I.t('seasons.when', { n: F.num(plan.months) });
    return P.esc(away) + ' · <span class="sn-nowrap">' + P.esc(F.date(s.date, 'month')) + '</span>';
  }

  function item(s, d) {
    const lk = look(s), plan = D.seasonPlan(s, d.today), nm = name(s), id = P.esc(s.id);
    return '<li class="sn-item sn-tone--' + lk.tone + (s.active ? ' is-on' : '') + '" data-item="' + id + '">' +
      '<span class="sn-dot" aria-hidden="true">' + IC.icon('check') + '</span>' +
      '<article class="card sn-card" aria-labelledby="sn-name-' + id + '">' +
        '<div class="sn-card__head">' +
          '<span class="sn-icon">' + IC.icon(lk.icon) + '</span>' +
          '<div class="sn-card__titles">' +
            '<h3 class="sn-card__name" id="sn-name-' + id + '">' + P.esc(nm) + '</h3>' +
            '<p class="sn-card__covers" data-i18n="seasons.covers.' + id + '"></p>' +
          '</div>' +
        '</div>' +
        '<p class="sn-card__when">' + IC.icon('calendar') + '<span>' + when(s, d) + '</span></p>' +
        '<div class="sn-box">' +
          '<div class="sn-cost">' +
            '<p class="sn-cost__text"><span class="sn-cost__k" data-i18n="seasons.cost"></span>' +
              '<span class="sn-cost__v">' + F.moneyHtml(s.amount) + '</span></p>' +
            '<button type="button" class="sn-change" data-act="edit" data-id="' + id + '" data-i18n-aria="seasons.changeAria"' + P.vars({ name: nm }) + '>' +
              IC.icon('edit') + '<span data-i18n="seasons.change"></span></button>' +
          '</div>' +
          '<p class="sn-per">' + IC.icon('sparkle') +
            '<span data-i18n="seasons.perMonth"' + P.vars({ amount: F.money(plan.perMonth) }) + '></span></p>' +
        '</div>' +
        '<button type="button" class="sn-switch" role="switch" aria-checked="' + !!s.active + '" data-act="toggle" data-id="' + id + '"' +
          ' aria-labelledby="sn-name-' + id + ' sn-sw-' + id + '">' +
          '<span class="sn-switch__text" id="sn-sw-' + id + '" data-i18n="' + (s.active ? 'seasons.saving' : 'seasons.start') + '"></span>' +
          '<span class="sn-switch__track" aria-hidden="true"><span class="sn-switch__thumb">' + IC.icon('check') + '</span></span>' +
        '</button>' +
      '</article>' +
    '</li>';
  }

  function list(d) {
    const all = sorted(d);
    const moon = all.some(function (s) { return /^(ramadan|eid)/.test(s.id); });
    return '<section class="sn-upcoming" aria-labelledby="sn-list-title">' +
      '<h2 class="section-title" id="sn-list-title" data-i18n="seasons.listTitle"></h2>' +
      (moon ? '<p class="sn-moon">' + IC.icon('moon') + '<span data-i18n="seasons.moonNote"></span></p>' : '') +
      '<ol class="sn-list">' + all.map(function (s) { return item(s, d); }).join('') + '</ol>' +
    '</section>';
  }

  function keepNote() {
    return '<p class="note note--sand">' + IC.icon('shield') + '<span data-i18n="seasons.keepNote"></span></p>';
  }

  /* Live line inside the amount sheet: "Put aside about X a month" (+ daily number change if on) */
  function preview() {
    return '<p class="note note--sand sn-preview">' + IC.icon('sparkle') +
      '<span class="sn-preview__body"><span data-sn="per"></span><strong data-sn="daily" hidden></strong></span></p>';
  }

  return { name: name, look: look, sorted: sorted, intro: intro, summary: summary, item: item, list: list, keepNote: keepNote, preview: preview };
})();
