/* Debt details — markup for each part of the page (no state here; script.js decides). */
window.DD = (function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons;

  function t(key, vars, tag, cls) {
    return '<' + (tag || 'span') + (cls ? ' class="' + cls + '"' : '') + ' data-i18n="' + key + '"' + P.vars(vars) + '></' + (tag || 'span') + '>';
  }

  /* Progress ring + "7,300 of 10,800 paid" */
  function hero(x, plan) {
    const pct = plan.paidPct;
    return '<section class="card card--hero dd-hero">' +
      '<div class="dd-ring">' +
        '<svg class="dd-ring__svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
          '<circle class="dd-ring__track" cx="60" cy="60" r="52" pathLength="100"></circle>' +
          '<circle class="dd-ring__fill" cx="60" cy="60" r="52" pathLength="100" stroke-dasharray="' + pct + ' 100"></circle>' +
        '</svg>' +
        '<div class="dd-ring__text"><bdi class="dd-ring__num num" data-i18n="debtDetails.pct"' + P.vars({ n: F.num(pct) }) + '></bdi>' +
          t('debtDetails.paidSoFar', null, 'span', 'dd-ring__label') + '</div>' +
      '</div>' +
      t('debtDetails.paidOf', { paid: F.money(x.total - x.remaining), total: F.money(x.total) }, 'p', 'dd-hero__paid') +
    '</section>';
  }

  function facts(x, next) {
    function kv(k, v) { return '<div class="kv">' + t(k, null, 'span', 'kv__k') + '<span class="kv__v">' + v + '</span></div>'; }
    return '<section class="card dd-facts">' +
      kv('debtDetails.left', F.moneyHtml(x.remaining)) +
      kv('debtDetails.monthly', F.moneyHtml(x.monthly)) +
      kv('debtDetails.next', '<bdi>' + F.date(next, 'short') + '</bdi>') +
    '</section>';
  }

  function finish(plan) {
    const one = plan.payments === 1;
    return '<section class="card card--sand dd-finish">' +
      '<span class="dd-finish__icon">' + IC.icon('calendar') + '</span>' +
      '<div class="stack-2">' + t('debtDetails.finishTitle', { month: F.date(plan.endDate, 'month') }, 'h2', 'dd-finish__title') +
        t(one ? 'debtDetails.finishTextOne' : 'debtDetails.finishText', { n: F.num(plan.payments), amount: F.money(plan.last) }, 'p') +
      '</div></section>';
  }

  function log(x) {
    const items = x.log || [];
    return '<section class="stack-3">' + t('debtDetails.history', null, 'h2', 'section-title') +
      (items.length ? '<ul class="list mm-list dd-log">' + items.map(function (p) {
        return '<li class="mm-item mm-row">' + MM.head({ icon: 'check', titleKey: 'debtDetails.paymentRow',
          end: '<span class="row__end">' + F.moneyHtml(p.amount) + '</span>',
          sub: '<span class="row__sub">' + F.date(p.date, 'long') + '</span>' }) + '</li>';
      }).join('') + '</ul>' : t('debtDetails.noPayments', null, 'p', 'muted')) +
    '</section>';
  }

  function manage() {
    return '<div class="dd-manage">' +
      '<button type="button" class="btn btn--secondary btn--block" data-dd="edit">' + IC.icon('edit') + t('debtDetails.edit') + '</button>' +
      '<button type="button" class="btn btn--text btn--block dd-remove" data-dd="remove">' + IC.icon('trash') + t('debtDetails.remove') + '</button>' +
    '</div>';
  }

  /* Result of the last payment: { kind: nice | extra | part, title, titleVars, text, textVars } */
  function banner(b) {
    const mood = b.kind === 'nice' ? 'celebrate' : b.kind === 'extra' ? 'happy' : 'calm';
    return '<section class="card dd-banner dd-banner--' + b.kind + '" tabindex="-1" data-banner>' +
      IC.mascot(mood, 'mascot--sm', I.t('brand.short')) +
      '<div class="dd-banner__body">' + t(b.title, b.titleVars, 'h2', 'dd-banner__title') +
        t(b.text, b.textVars, 'p', 'dd-banner__text') + '</div>' +
      '<button type="button" class="mm-icon-btn dd-banner__close" data-dd="closeBanner" data-i18n-aria="common.close">' + IC.icon('close') + '</button>' +
    '</section>';
  }

  /* Remaining hit 0 */
  function done(x) {
    let sparks = '';
    for (let i = 0; i < 12; i++) sparks += '<i></i>';
    return '<section class="card dd-done" tabindex="-1" data-banner>' +
      '<div class="dd-sparks" aria-hidden="true">' + sparks + '</div>' +
      IC.mascot('celebrate', 'mascot--lg', I.t('brand.short')) +
      '<span class="mm-tag mm-tag--good dd-done__tag">' + IC.icon('check') + t('debtDetails.doneBadge') + '</span>' +
      t('debtDetails.doneTitle', null, 'h2', 'dd-done__title') +
      t('debtDetails.doneText', { name: MM.name(x), amount: F.money(x.monthly) }, 'p', 'dd-done__text') +
      '<a class="btn btn--primary btn--block" href="' + P.url('my-money') + '#owe">' + t('debtDetails.backToMoney') + '</a>' +
    '</section>';
  }

  function message(mood, titleKey, titleVars, textKey, action) {
    return '<div class="card empty dd-message">' + IC.mascot(mood, 'mascot--float', I.t('brand.short')) +
      t(titleKey, titleVars, 'h2', 'empty__title') + t(textKey, null, 'p', 'empty__text') + action + '</div>';
  }

  return { hero: hero, facts: facts, finish: finish, log: log, manage: manage, banner: banner, done: done, message: message, t: t };
})();
