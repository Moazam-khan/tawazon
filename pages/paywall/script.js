/* Paywall — shown after the reveal and again on day 3 of the free days.
   Honest by design: easy close, billed price is the biggest price, clear terms. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n;
  const data = TZ.data.get();

  /* Prices come from the shared sample data (assets/js/mock-data.js) */
  const PRICE = { year: data.pricing.year, month: data.pricing.month };
  const TRIAL_DAYS = data.pricing.trialDays, CANCEL_HOURS = 24;
  const SAVING = PRICE.month * 12 - PRICE.year;          // 249
  const PER_MONTH = PRICE.year / 12;                     // 8.25

  let plan = 'year';
  let state = 'reveal';          // reveal | day3 | success
  let keptOnDay3 = false;

  function addDays(iso, n) { const d = TZ.data.parse(iso); d.setDate(d.getDate() + n); return TZ.data.iso(d); }
  const trialEnd = addDays(data.today, data.account.trialDaysLeft || 1);   // day 3 view
  const firstPay = addDays(data.today, TRIAL_DAYS);                      // after the reveal

  /* 8.25 needs two decimals */
  function money2(n) { return I.fmtDecimal(n, 2) + ' ' + I.currency(); }

  function termsKey() {
    return 'paywall.terms' + (state === 'day3' ? 'Day3' : '') + (plan === 'year' ? 'Year' : 'Month');
  }
  function termsVars() {
    return { n: F.num(TRIAL_DAYS), h: F.num(CANCEL_HOURS), amount: F.money(PRICE[plan]), date: F.date(trialEnd, 'long') };
  }

  /* ---------- pieces ---------- */
  function topBar() {
    return '<header class="appbar">' +
      '<a class="appbar__btn pw-close" href="' + P.url('home') + '" data-i18n-aria="paywall.closeAria">' + IC.icon('close') + '</a>' +
      '<span class="appbar__title"></span>' +
      '<div class="appbar__end">' + P.langSwitch() + '</div></header>';
  }

  function hero(mood, titleKey, titleVars, leadKey, leadVars) {
    return '<div class="pw-hero">' +
      '<div class="pw-hero__art">' + IC.mascot(mood, 'pw-mascot', I.t('brand.short')) + '</div>' +
      '<span class="pw-eyebrow">' + IC.icon('crown') + '<span data-i18n="paywall.eyebrow"></span></span>' +
      '<h1 class="t-title" data-i18n="' + titleKey + '"' + P.vars(titleVars) + '></h1>' +
      '<p class="lead" data-i18n="' + leadKey + '"' + P.vars(leadVars) + '></p>' +
    '</div>';
  }

  function benefits() {
    const items = [['sparkle', 'b1'], ['download', 'b2'], ['bell', 'b3']];
    return '<section class="stack-3" aria-labelledby="pw-ben">' +
      '<h2 class="sr-only" id="pw-ben" data-i18n="paywall.benefitsTitle"></h2>' +
      '<ul class="card pw-benefits">' + items.map(function (b) {
        return '<li class="pw-benefit"><span class="row__icon">' + IC.icon(b[0]) + '</span>' +
          '<span data-i18n="paywall.' + b[1] + '"></span></li>';
      }).join('') +
        '<li class="pw-benefit pw-benefit--free"><span class="row__icon row__icon--sand">' + IC.icon('heart') + '</span>' +
          '<span data-i18n="paywall.freeForever"></span></li>' +
      '</ul>' +
    '</section>';
  }

  function planCard(id) {
    const on = plan === id;
    const year = id === 'year';
    return '<button type="button" class="pw-plan" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-plan="' + id + '">' +
      '<span class="pw-plan__dot" aria-hidden="true">' + IC.icon('check') + '</span>' +
      '<span class="pw-plan__body">' +
        '<span class="pw-plan__top"><span class="pw-plan__name" data-i18n="common.' + (year ? 'yearly' : 'monthly') + '"></span>' +
          (year ? '<span class="pw-plan__badge" data-i18n="paywall.save"' + P.vars({ amount: F.money(SAVING) }) + '></span>' : '') +
        '</span>' +
        '<span class="pw-plan__price num" data-i18n="paywall.' + (year ? 'priceYear' : 'priceMonth') + '"' + P.vars({ amount: F.money(PRICE[id]) }) + '></span>' +
        '<span class="pw-plan__sub" data-i18n="' + (year ? 'paywall.about' : 'paywall.billedMonthly') + '"' +
          (year ? P.vars({ amount: money2(PER_MONTH) }) : '') + '></span>' +
      '</span></button>';
  }

  function plans() {
    return '<section class="stack-3" aria-labelledby="pw-plans">' +
      '<h2 class="section-title" id="pw-plans" data-i18n="paywall.plansTitle"></h2>' +
      '<div class="pw-plans" role="radiogroup" aria-labelledby="pw-plans">' + planCard('year') + planCard('month') + '</div>' +
      (state === 'day3' ? '' : '<p class="pw-remind">' + IC.icon('bell') + '<span data-i18n="paywall.remind"></span></p>') +
    '</section>';
  }

  function offer() {
    const day3 = state === 'day3';
    return '<main class="phone__scroll"><div class="screen pw">' +
        (day3
          ? hero('calm', 'paywall.day3Headline', null, 'paywall.day3Lead', { date: F.date(trialEnd, 'long') })
          : hero('happy', 'paywall.headline', { n: F.num(TRIAL_DAYS) }, 'paywall.lead')) +
        benefits() + plans() +
        '<button type="button" class="btn btn--text pw-restore" data-restore data-i18n="paywall.restore"></button>' +
      '</div></main>' +
      '<div class="page-foot pw-foot">' +
        '<button type="button" class="btn btn--primary btn--block" data-start aria-describedby="pw-terms">' +
          '<span data-i18n="' + (day3 ? 'paywall.ctaDay3' : 'paywall.cta') + '"></span></button>' +
        '<p class="pw-terms" id="pw-terms" data-i18n="' + termsKey() + '"' + P.vars(termsVars()) + '></p>' +
        '<a class="btn btn--text btn--block" href="' + P.url('home') + '" data-i18n="paywall.later"></a>' +
      '</div>';
  }

  function success() {
    const planKey = plan === 'year' ? 'paywall.priceYear' : 'paywall.priceMonth';
    const payDate = keptOnDay3 ? addDays(trialEnd, 1) : firstPay;
    return '<main class="phone__scroll"><div class="screen pw pw--done">' +
        hero('celebrate', 'paywall.successTitle', null, keptOnDay3 ? 'paywall.successKeep' : 'paywall.successText',
          keptOnDay3 ? { date: F.date(payDate, 'long') } : { n: F.num(TRIAL_DAYS) }) +
        '<div class="card">' +
          '<div class="kv"><span class="kv__k" data-i18n="paywall.successPlan"></span>' +
            '<span class="kv__v"><span data-i18n="common.' + (plan === 'year' ? 'yearly' : 'monthly') + '"></span> · ' +
            '<bdi data-i18n="' + planKey + '"' + P.vars({ amount: F.money(PRICE[plan]) }) + '></bdi></span></div>' +
          '<div class="kv"><span class="kv__k" data-i18n="paywall.successStarts"></span>' +
            '<span class="kv__v">' + F.date(payDate, 'long') + '</span></div>' +
        '</div>' +
        '<p class="note">' + IC.icon('info') + '<span data-i18n="paywall.successCancel"></span></p>' +
      '</div></main>' +
      '<div class="page-foot"><a class="btn btn--primary btn--block" href="' + P.url('home') + '">' +
        '<span data-i18n="paywall.successCta"></span>' + IC.icon('arrow', { dir: true }) + '</a></div>';
  }

  function render() {
    document.getElementById('app').innerHTML = topBar() + (state === 'success' ? success() : offer());
  }
  /* Re-draw outside of boot (demo states); also tags the language switch for its font */
  function refresh() {
    render();
    I.apply(document);
    const sw = document.querySelector('[data-langswitch] span');
    if (sw) sw.setAttribute('lang', I.getLang() === 'ar' ? 'en' : 'ar');
    document.querySelector('.phone__scroll').scrollTop = 0;
  }

  /* ---------- behaviour ---------- */
  function pickPlan(id, focus) {
    plan = id;
    document.querySelectorAll('[data-plan]').forEach(function (b) {
      const on = b.getAttribute('data-plan') === id;
      b.setAttribute('aria-checked', on);
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    const terms = document.getElementById('pw-terms');
    terms.setAttribute('data-i18n', termsKey());
    terms.setAttribute('data-i18n-vars', JSON.stringify(termsVars()));
    I.apply(terms.parentNode);
  }

  document.addEventListener('click', function (e) {
    const card = e.target.closest('[data-plan]');
    if (card) { pickPlan(card.getAttribute('data-plan')); return; }
    if (e.target.closest('[data-restore]')) {
      TZ.ui.toast(document.querySelector('.phone'), { message: I.t('paywall.restoreToast'), duration: 6000 });
      return;
    }
    const start = e.target.closest('[data-start]');
    if (start) {
      start.disabled = true;
      start.firstChild.setAttribute('data-i18n', 'common.loading');
      I.apply(start);
      keptOnDay3 = state === 'day3';
      setTimeout(function () { demo.pick('success'); }, 700);
    }
  });

  /* Arrow keys move between plans (mirrored in Arabic) */
  document.addEventListener('keydown', function (e) {
    const card = e.target.closest('[data-plan]');
    if (!card) return;
    let step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    if (/Left|Right/.test(e.key) && I.dir() === 'rtl') step = -step;
    e.preventDefault();
    const ids = ['year', 'month'];
    pickPlan(ids[(ids.indexOf(plan) + step + ids.length) % ids.length], true);
  });

  P.boot({ titleKey: 'paywall.title', render: render });

  const bar = P.demoBar([
    { id: 'reveal', labelKey: 'paywall.demo.reveal' },
    { id: 'day3', labelKey: 'paywall.demo.day3' },
    { id: 'success', labelKey: 'paywall.demo.success' }
  ], function (id) {
    if (id !== 'success') keptOnDay3 = false;
    state = id;
    refresh();
  });
  const demo = {
    pick: function (id) { const b = document.querySelector('[data-demo="' + id + '"]'); if (b) b.click(); }
  };
  if (bar.get() !== state) { state = bar.get(); refresh(); }
})();
