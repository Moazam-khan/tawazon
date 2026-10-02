/* My money — page shell.
   Opens on a dashboard: one tile per section with its amount (#overview).
   A tile opens that section (#owe #fixed #owed #savings #goals) with a back arrow.
   "#owed-empty" (any section + "-empty") shows the empty demo state.
   Sections live in sec-*.js and register themselves on MM.sections.          */
(function () {
  'use strict';
  const P = TZ.page, I = TZ.i18n, F = TZ.fmt, IC = TZ.icons, S = MM.sections;
  const ORDER = ['owe', 'fixed', 'owed', 'savings', 'goals'];
  let section = 'overview', mode = 'filled';

  function readHash() {
    const h = location.hash.replace('#', '').split('-');
    section = ORDER.indexOf(h[0]) > -1 ? h[0] : 'overview';
    mode = (h[0] === 'empty' || h[1] === 'empty') ? 'empty' : 'filled';
  }
  function hashFor(id) { return '#' + id + (mode === 'empty' ? '-empty' : ''); }
  function loadData() { MM.use(mode === 'empty' ? MM.emptyCopy() : TZ.data.get(), mode !== 'empty'); }
  const sum = function (list, key) { return (list || []).reduce(function (s, x) { return s + (x[key] || 0); }, 0); };

  /* ---------- dashboard ---------- */
  function tile(id, amountHtml, subKey, subVars, extra) {
    return '<a class="mm-tile mm-tile--' + id + '" href="' + hashFor(id) + '" data-open-section="' + id + '">' +
      '<span class="mm-tile__top"><span class="mm-tile__icon">' + IC.icon(S[id].icon) + '</span>' +
        IC.icon('chevron', { dir: true, cls: 'mm-tile__chev' }) + '</span>' +
      '<span class="mm-tile__label" data-i18n="myMoney.tab.' + id + '"></span>' +
      '<span class="mm-tile__amount">' + amountHtml + '</span>' +
      '<span class="mm-tile__sub" data-i18n="' + subKey + '"' + P.vars(subVars) + '></span>' +
      (extra || '') + '</a>';
  }
  function overview() {
    const d = MM.get(), r = MM.calc();
    const owe = sum(d.debts, 'remaining'), owed = sum(d.owedToMe, 'amount');
    const gSaved = sum(d.goals, 'saved'), gTarget = sum(d.goals, 'target');
    const gPct = gTarget ? Math.round(gSaved / gTarget * 100) : 0;
    return '<p class="lead mm-dash__lead" data-i18n="myMoney.dash.lead"></p>' +
      '<div class="mm-dash">' +
        tile('owe', F.moneyHtml(owe), owe ? 'myMoney.dash.owe' : 'myMoney.dash.oweNone', { amount: F.money(r.debtMonthly) }) +
        tile('fixed', F.moneyHtml(r.fixedMonthly), d.fixed.length ? 'myMoney.dash.fixed' : 'myMoney.dash.none', { n: F.num(d.fixed.length) }) +
        tile('owed', F.moneyHtml(owed), d.owedToMe.length ? 'myMoney.dash.owed' : 'myMoney.dash.none', { n: F.num(d.owedToMe.length) }) +
        tile('savings', F.moneyHtml(d.savings.total), d.savings.total ? 'myMoney.dash.savings' : 'myMoney.dash.none') +
        tile('goals', F.moneyHtml(gSaved), d.goals.length ? 'myMoney.dash.goals' : 'myMoney.dash.goalsNone', { amount: F.money(gTarget) },
          d.goals.length ? '<span class="progress progress--accent mm-tile__bar" style="--value:' + gPct + '%"><span class="progress__track"><span class="progress__fill"></span></span></span>' : '') +
      '</div>' +
      '<div class="list"><a class="row" href="' + P.url('seasons') + '">' +
        '<span class="row__icon row__icon--sand">' + IC.icon('moon') + '</span>' +
        '<span class="row__body"><span class="row__title" data-i18n="myMoney.goals.seasonsTitle"></span>' +
          '<span class="row__sub" data-i18n="myMoney.goals.seasonsSub"></span></span>' +
        IC.icon('chevron', { dir: true, cls: 'row__chev' }) + '</a></div>' +
      MM.note('info', 'myMoney.dash.note');
  }

  /* ---------- one section ---------- */
  function content() {
    return '<div class="mm-panel">' + (section === 'overview' ? overview() : S[section].render(MM.get(), MM.calc())) + '</div>';
  }

  function header() {
    if (section === 'overview') return P.header({ titleKey: 'myMoney.title', settings: true });
    return '<header class="appbar">' +
      '<a class="appbar__btn" href="' + hashFor('overview') + '" data-open-section="overview" data-i18n-aria="myMoney.dash.back">' + IC.icon('back', { dir: true }) + '</a>' +
      '<h1 class="appbar__title" data-i18n="myMoney.tab.' + section + '"></h1>' +
      '<div class="appbar__end">' + P.langSwitch() + '</div></header>';
  }

  function render() {
    document.getElementById('app').innerHTML =
      header() +
      '<main class="phone__scroll" data-main><div class="screen" data-panels>' + content() + '</div></main>' +
      P.tabbar('my-money');
  }

  /* Re-draw only the content (keeps toasts and open sheets) */
  function refresh() {
    const box = document.querySelector('[data-panels]');
    if (!box) return;
    box.innerHTML = content();
    I.apply(box);
  }

  function open(id) {
    section = id;
    history.replaceState(null, '', hashFor(id));
    render();
    P.refresh();
    document.querySelector('[data-main]').scrollTop = 0;
    const target = id === 'overview' ? document.querySelector('[data-open-section]') : document.querySelector('.appbar__title');
    if (target) { if (id !== 'overview') target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  }

  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-open-section]');
    if (t) { e.preventDefault(); open(t.getAttribute('data-open-section')); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const parts = b.getAttribute('data-act').split(':');
    S[parts[0]].actions[parts[1]](b.getAttribute('data-id'), b);
  });

  window.addEventListener('hashchange', function () {
    const was = mode, wasSection = section;
    readHash();
    if (was !== mode) loadData();
    if (was !== mode || wasSection !== section) { render(); P.refresh(); }
  });

  readHash();
  loadData();
  MM.onRefresh(refresh);
  P.boot({ titleKey: 'myMoney.title', render: render });
  P.demoBar([
    { id: 'filled', labelKey: 'myMoney.demo.filled' },
    { id: 'empty', labelKey: 'myMoney.demo.empty' }
  ], function (id) {
    mode = id;
    history.replaceState(null, '', hashFor(section));
    loadData();
    refresh();
  }, mode);
})();
