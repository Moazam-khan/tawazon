/* Template page — copy this folder to start a new page. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons;
  const data = TZ.data.get();
  const r = TZ.data.calculate(data);

  function render() {
    document.getElementById('app').innerHTML =
      P.header({ titleKey: 'template.title', back: 'home', settings: true }) +
      '<main class="phone__scroll"><div class="screen">' +
        '<div class="card card--hero tpl-hero">' +
          '<div class="card__eyebrow" data-i18n="home.canSpendToday"></div>' +
          '<div class="hero-number"><bdi class="hero-number__value num">' + F.num(r.daily) + '</bdi>' +
          '<span class="hero-number__cur">' + TZ.i18n.currency() + '</span></div>' +
        '</div>' +
        '<p class="lead" data-i18n="template.lead"' + P.vars({ days: F.num(r.daysLeft) }) + '></p>' +
        '<div class="note">' + IC.icon('info') + '<span data-i18n="template.note"></span></div>' +
      '</div></main>' +
      P.tabbar('home');
  }

  P.boot({ titleKey: 'template.title', render: render });
})();
