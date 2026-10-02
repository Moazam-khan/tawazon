/* Explorer (root index.html) — Overview dashboard · Screens · Review.
   Mobile-first: tabs sit at the bottom on phones and at the top on wide screens. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons;

  const TABS = [['overview', 'home'], ['screens', 'phone'], ['review', 'check']];
  let tab = 'overview', group = 'all';
  const fromHash = location.hash.replace('#', '');
  if (TABS.some(function (t) { return t[0] === fromHash; })) tab = fromHash;

  const nameKey = function (s) { return 'gallery.screen.' + TZ.screenKey(s.id) + '.name'; };

  /* ---------- top bar + tabs ---------- */
  function top() {
    return '<header class="ex-top">' +
      '<div class="ex-brand">' + IC.logo() + '<div class="ex-brand__text"><p class="ex-brand__name" data-i18n="brand.name"></p>' +
        '<h1 class="ex-brand__sub" data-i18n="explore.title"></h1></div></div>' +
      '<nav class="ex-tabs" data-i18n-aria="explore.tabs.label">' + TABS.map(function (t) {
        return '<a class="ex-tab" href="#' + t[0] + '" data-tab-link="' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' +
          '<span class="ex-tab__icon">' + IC.icon(t[1]) + '</span><span data-i18n="explore.tabs.' + t[0] + '"></span></a>';
      }).join('') + '</nav>' +
      '<div class="ex-top__end">' +
        '<button type="button" class="langswitch ex-theme" data-toggle-theme data-i18n-aria="explore.theme">' + IC.icon(TZ.ui.getTheme() === 'dark' ? 'sun' : 'moon') + '</button>' +
        P.langSwitch() +
      '</div></header>';
  }

  /* ---------- screens ---------- */
  function card(s, i, lang) {
    const k = TZ.screenKey(s.id);
    const ticks = ['en', 'ar'].map(function (l) {
      return '<span class="ex-tick' + (TZ.review.has(s.id, l) ? ' is-on' : '') + '" lang="' + l + '">' +
        (TZ.review.has(s.id, l) ? IC.icon('check') : '') + '<span data-i18n="lang.' + l + '"></span></span>';
    }).join('');
    return '<li><button type="button" class="ex-card-screen" data-open="' + i + '" data-i18n-aria="explore.screens.view"' + P.vars({ name: I.t(nameKey(s)) }) + '>' +
      '<span class="ex-thumb"><img src="' + TZ.shotPath(s, s.states[0], lang) + '" width="500" height="1082" loading="lazy" alt=""></span>' +
      '<span class="ex-card-screen__body">' +
        '<span class="ex-card-screen__top"><span class="ex-num num">' + F.num(i + 1) + '</span><span class="ex-card-screen__name" data-i18n="' + nameKey(s) + '"></span></span>' +
        '<span class="ex-card-screen__desc" data-i18n="gallery.screen.' + k + '.desc"></span>' +
        '<span class="ex-card-screen__meta">' +
          (s.states.length > 1 ? '<span class="ex-chip" data-i18n="explore.screens.states"' + P.vars({ n: F.num(s.states.length) }) + '></span>' : '') +
          ticks + '</span>' +
      '</span></button></li>';
  }
  function screens(lang) {
    const groups = ['all'].concat(TZ.SCREEN_GROUPS);
    const filters = '<div class="ex-filters" role="radiogroup" data-i18n-aria="explore.screens.filter">' + groups.map(function (g) {
      return '<button type="button" class="ex-filter" role="radio" aria-checked="' + (g === group) + '" data-group-filter="' + g + '" data-i18n="' +
        (g === 'all' ? 'explore.screens.all' : 'gallery.group.' + g) + '"></button>';
    }).join('') + '</div>';
    const shown = TZ.SCREEN_GROUPS.filter(function (g) { return group === 'all' || g === group; });
    return filters + shown.map(function (g) {
      return '<section class="ex-sec" aria-labelledby="ex-g-' + g + '"><h2 class="ex-h2" id="ex-g-' + g + '" data-i18n="gallery.group.' + g + '"></h2>' +
        '<ul class="ex-grid">' + TZ.SCREENS.map(function (s, i) { return s.group === g ? card(s, i, lang) : ''; }).join('') + '</ul></section>';
    }).join('');
  }

  /* ---------- review checklist ---------- */
  function review(lang) {
    const done = TZ.review.done(), total = TZ.review.total();
    return '<section class="ex-sec" aria-labelledby="ex-review">' +
      '<div class="ex-sec__head"><h2 class="ex-h2" id="ex-review" data-i18n="explore.review.title"></h2>' +
        '<p class="ex-muted" data-i18n="explore.review.lead"></p></div>' +
      '<div class="ex-card ex-review-sum"><p class="ex-progress__count" data-i18n="explore.progress.count"' + P.vars({ done: F.num(done), total: F.num(total) }) + '></p>' +
        '<div class="progress" style="--value:' + Math.round(done / total * 100) + '%"><div class="progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done + '" data-i18n-aria="explore.progress.title"><div class="progress__fill"></div></div></div></div>' +
      '<ul class="ex-review">' + TZ.SCREENS.map(function (s, i) {
        return '<li class="ex-review__row">' +
          '<button type="button" class="ex-review__thumb" data-open="' + i + '" data-i18n-aria="explore.screens.view"' + P.vars({ name: I.t(nameKey(s)) }) + '>' +
            '<img src="' + TZ.shotPath(s, s.states[0], lang) + '" width="500" height="1082" loading="lazy" alt=""></button>' +
          '<div class="ex-review__body"><p class="ex-review__name"><span class="num ex-num">' + F.num(i + 1) + '</span><span data-i18n="' + nameKey(s) + '"></span></p>' +
            '<div class="ex-review__ticks">' + ['en', 'ar'].map(function (l) {
              const on = TZ.review.has(s.id, l);
              return '<button type="button" class="ex-tickbtn" aria-pressed="' + on + '" data-tick="' + s.id + '" data-lang-tick="' + l + '" data-i18n-aria="explore.review.approveIn"' +
                P.vars({ name: I.t(nameKey(s)), lang: I.t('lang.' + l) }) + '>' + IC.icon('check') + '<span lang="' + l + '" data-i18n="lang.' + l + '"></span></button>';
            }).join('') +
            '<a class="ex-review__open" href="' + P.url(s.id) + '" data-i18n="explore.review.open"></a></div></div></li>';
      }).join('') + '</ul>' +
      (done ? '<button type="button" class="btn btn--text" data-clear>' + IC.icon('replay') + '<span data-i18n="explore.review.clear"></span></button>' : '') +
    '</section>';
  }

  function foot() {
    return '<footer class="ex-foot">' +
      '<div class="ex-foot__links"><a class="btn btn--secondary ex-btn-sm" href="pages/_design-system/index.html" data-i18n="explore.foot.designSystem"></a>' +
      '<button type="button" class="btn btn--text ex-btn-sm" data-reset>' + IC.icon('replay') + '<span data-i18n="explore.foot.reset"></span></button></div>' +
      '<p class="ex-muted" data-i18n="explore.foot.note"></p></footer>';
  }

  /* ---------- render ---------- */
  function render(lang) {
    const scrollY = window.scrollY;
    const body = tab === 'screens' ? screens(lang) : tab === 'review' ? review(lang) : TZ.ex.overview.render(lang);
    document.getElementById('app').innerHTML = top() + '<main class="ex-main" id="ex-main">' + body + foot() + '</main>';
    requestAnimationFrame(function () { window.scrollTo(0, scrollY); });
  }
  function rerender() { render(I.getLang()); P.refresh(); }

  function setTab(t, g) {
    tab = t;
    if (g) group = g;
    history.replaceState(null, '', '#' + t);
    rerender();
    window.scrollTo(0, 0);
    const h = document.querySelector('.ex-main h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  document.addEventListener('click', function (e) {
    let el;
    if ((el = e.target.closest('[data-tab-link]'))) { e.preventDefault(); setTab(el.getAttribute('data-tab-link'), el.getAttribute('data-group')); return; }
    if ((el = e.target.closest('[data-group-filter]'))) { group = el.getAttribute('data-group-filter'); rerender(); document.querySelector('[data-group-filter="' + group + '"]').focus(); return; }
    if ((el = e.target.closest('[data-open]'))) { TZ.ex.viewer.open(+el.getAttribute('data-open'), 0, el); return; }
    if ((el = e.target.closest('[data-tick]'))) {
      const id = el.getAttribute('data-tick'), l = el.getAttribute('data-lang-tick');
      TZ.review.set(id, l, !TZ.review.has(id, l));
      rerender();
      const again = document.querySelector('[data-tick="' + id + '"][data-lang-tick="' + l + '"]');
      if (again) again.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest('[data-clear]')) {
      const before = TZ.review.snapshot();
      TZ.review.clear(); rerender();
      TZ.ui.toast(document.body, { message: I.t('explore.review.cleared'), undoLabel: I.t('common.undo'), onUndo: function () { TZ.review.restore(before); rerender(); } });
      return;
    }
    if (e.target.closest('[data-reset]')) {
      TZ.data.reset(); rerender();
      TZ.ui.toast(document.body, { message: I.t('explore.foot.resetDone'), duration: 3000 });
    }
  });
  document.addEventListener('tz:themechange', function () { if (document.querySelector('.ex-top')) rerender(); });
  TZ.ex.viewer.onClose(rerender);

  P.boot({ titleKey: 'explore.title', render: render });
})();
