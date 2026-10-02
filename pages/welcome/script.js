/* Welcome — the first screen anyone sees. One promise, one button. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n;

  /* The teaser shows the sample story (an example, labelled as one) */
  const sample = TZ.data.calculate(JSON.parse(JSON.stringify(TZ.data.SAMPLE)));

  function teaser() {
    return '<div class="wl-hero">' +
      '<div class="wl-hero__mascot">' + IC.mascot('happy', 'mascot--lg mascot--float', I.t('welcome.hello')) + '</div>' +
      '<div class="card wl-teaser">' +
        '<span class="wl-teaser__tag" data-i18n="welcome.example"></span>' +
        '<div class="card__eyebrow" data-i18n="home.canSpendToday"></div>' +
        '<div class="hero-number wl-teaser__num">' +
          '<bdi class="hero-number__value num">' + F.num(sample.daily) + '</bdi>' +
          '<span class="hero-number__cur">' + I.currency() + '</span>' +
        '</div>' +
        '<span class="badge badge--' + sample.status + ' wl-teaser__badge">' + IC.face(sample.status) +
          '<span data-i18n="status.' + sample.status + '"></span></span>' +
      '</div>' +
    '</div>';
  }

  function trust() {
    const items = [['shield', 'welcome.trust.bank'], ['clock', 'welcome.trust.time'], ['lock', 'welcome.trust.private']];
    return '<ul class="wl-trust" data-i18n-aria="welcome.trustTitle">' + items.map(function (x) {
      return '<li class="wl-trust__item"><span class="wl-trust__icon">' + IC.icon(x[0]) + '</span>' +
        '<span data-i18n="' + x[1] + '"></span></li>';
    }).join('') + '</ul>';
  }

  function render() {
    document.getElementById('app').innerHTML =
      P.header({}) +
      '<main class="phone__scroll wl-scroll"><div class="screen wl">' +
        '<div class="wl-brand">' + IC.logo('wl-brand__logo') +
          '<span class="wl-brand__name" data-i18n="brand.name"></span></div>' +
        teaser() +
        '<div class="wl-copy">' +
          '<h1 class="t-title wl-copy__title" data-i18n="welcome.heading"></h1>' +
          '<p class="lead wl-copy__lead" data-i18n="welcome.promise"></p>' +
        '</div>' +
        trust() +
      '</div></main>' +
      '<div class="page-foot wl-foot">' +
        '<a class="btn btn--primary btn--block" href="' + P.url('setup') + '">' +
          '<span data-i18n="welcome.start"></span>' + IC.icon('arrow', { dir: true }) + '</a>' +
        '<a class="btn btn--text btn--block" href="' + P.url('login') + '" data-i18n="welcome.haveAccount"></a>' +
      '</div>';
  }

  P.boot({ titleKey: 'welcome.title', render: render });
})();
