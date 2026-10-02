/* Login — "Save your data safely". Apple / Google sign-in, plus the calm
   "this account already has data" choice and the signed-in screen. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n;
  const data = TZ.data.get();

  /* What this phone has (from TZ.data) vs. a design-mock older backup in the account */
  const ON_PHONE = { salary: data.salary, payments: data.fixed.length + data.debts.length };
  const IN_ACCOUNT = { salary: 7500, payments: 2, savedOn: '2026-09-02' };

  let state = 'start';            // start | found | done
  let provider = data.account.provider || 'apple';
  let keep = null;                // phone | saved
  let busy = null;

  /* ---------- pieces ---------- */
  function art(mood, badge) {
    return '<div class="lg-art">' + IC.mascot(mood, 'lg-mascot', I.t('brand.short')) +
      (badge ? '<span class="lg-art__badge">' + IC.icon(badge) + '</span>' : '') + '</div>';
  }

  function signButton(id) {
    const loading = busy === id;
    return '<button type="button" class="btn btn--block lg-sso lg-sso--' + id + '" data-sso="' + id + '"' +
      (busy ? ' disabled' : '') + (loading ? ' aria-busy="true"' : '') + '>' +
      '<span class="lg-sso__icon">' + IC.icon(id) + '</span>' +
      '<span data-i18n="' + (loading ? 'common.loading' : 'login.' + id) + '"></span></button>';
  }

  function start() {
    const keeps = ['keeps1', 'keeps2', 'keeps3'];
    return '<main class="phone__scroll"><div class="screen lg">' +
        '<div class="lg-hero">' + art('calm', 'shield') +
          '<h1 class="t-title" data-i18n="login.headline"></h1>' +
          '<p class="lead" data-i18n="login.lead"></p>' +
        '</div>' +
        '<section class="card lg-keeps" aria-labelledby="lg-keeps">' +
          '<h2 class="lg-keeps__title" id="lg-keeps" data-i18n="login.keepsTitle"></h2>' +
          '<ul class="stack-2">' + keeps.map(function (k) {
            return '<li class="lg-keep">' + IC.icon('check') + '<span data-i18n="login.' + k + '"></span></li>';
          }).join('') + '</ul>' +
        '</section>' +
        '<p class="note">' + IC.icon('lock') + '<span data-i18n="login.privacy"></span></p>' +
      '</div></main>' +
      '<div class="page-foot lg-foot">' + signButton('apple') + signButton('google') +
        '<a class="btn btn--text btn--block" href="' + P.url('home') + '" data-i18n="login.later"></a>' +
      '</div>';
  }

  function choice(id, icon, titleKey, info, metaKey, metaVars) {
    const on = keep === id;
    const tab = keep ? (on ? 0 : -1) : (id === 'phone' ? 0 : -1);
    return '<button type="button" class="lg-choice" role="radio" aria-checked="' + on + '" tabindex="' + tab + '" data-keep="' + id + '">' +
      '<span class="row__icon">' + IC.icon(icon) + '</span>' +
      '<span class="lg-choice__body">' +
        '<span class="lg-choice__title" data-i18n="' + titleKey + '"></span>' +
        '<span class="lg-choice__sum num" data-i18n="login.found.summary"' + P.vars({ amount: F.num(info.salary), n: F.num(info.payments) }) + '></span>' +
        '<span class="lg-choice__meta" data-i18n="' + metaKey + '"' + P.vars(metaVars) + '></span>' +
      '</span>' +
      '<span class="lg-choice__dot" aria-hidden="true">' + IC.icon('check') + '</span></button>';
  }

  function found() {
    return '<main class="phone__scroll"><div class="screen lg">' +
        '<div class="lg-hero lg-hero--sm">' + art('think') +
          '<h1 class="t-title" data-i18n="login.found.title"></h1>' +
          '<p class="lead" id="lg-found-lead" data-i18n="login.found.lead"></p>' +
        '</div>' +
        '<div class="lg-choices" role="radiogroup" aria-labelledby="lg-found-lead">' +
          choice('phone', 'phone', 'login.found.phone', ON_PHONE, 'login.found.phoneMeta') +
          choice('saved', 'shield', 'login.found.saved', IN_ACCOUNT, 'login.found.savedMeta', { date: F.date(IN_ACCOUNT.savedOn, 'long') }) +
        '</div>' +
        '<p class="note">' + IC.icon('info') + '<span data-i18n="login.found.note"></span></p>' +
      '</div></main>' +
      '<div class="page-foot">' +
        '<button type="button" class="btn btn--primary btn--block" data-keep-confirm' + (keep ? '' : ' disabled') + '>' +
          '<span data-i18n="' + (keep ? 'login.found.confirm' : 'login.found.pickFirst') + '"></span></button>' +
        '<button type="button" class="btn btn--text btn--block" data-cancel data-i18n="common.cancel"></button>' +
      '</div>';
  }

  function done() {
    const name = I.t('login.' + provider + 'Name');
    return '<main class="phone__scroll"><div class="screen lg">' +
        '<div class="lg-hero">' + art('celebrate', 'check') +
          '<h1 class="t-title" data-i18n="login.done.title"></h1>' +
          '<p class="lead" data-i18n="login.done.text"' + P.vars({ provider: name }) + '></p>' +
        '</div>' +
        '<div class="card">' +
          '<div class="kv"><span class="kv__k" data-i18n="login.done.with"></span>' +
            '<span class="kv__v lg-provider">' + IC.icon(provider) + '<span data-i18n="login.' + provider + 'Name"></span></span></div>' +
          '<div class="kv"><span class="kv__k" data-i18n="login.done.lastSaved"></span>' +
            '<span class="kv__v" data-i18n="common.today"></span></div>' +
        '</div>' +
        '<p class="note">' + IC.icon('lock') + '<span data-i18n="login.privacy"></span></p>' +
      '</div></main>' +
      '<div class="page-foot"><a class="btn btn--primary btn--block" href="' + P.url('home') + '">' +
        '<span data-i18n="login.done.cta"></span>' + IC.icon('arrow', { dir: true }) + '</a></div>';
  }

  function render() {
    document.getElementById('app').innerHTML =
      P.header({ back: state === 'done' ? null : true }) +
      (state === 'found' ? found() : state === 'done' ? done() : start());
  }
  function refresh(focusSel) {
    render();
    I.apply(document);
    const sw = document.querySelector('[data-langswitch] span');
    if (sw) sw.setAttribute('lang', I.getLang() === 'ar' ? 'en' : 'ar');
    if (focusSel) { const el = document.querySelector(focusSel); if (el) el.focus(); }
  }
  function go(next) {
    const b = document.querySelector('[data-demo="' + next + '"]');
    if (b) b.click(); else { state = next; refresh(); }
  }

  /* ---------- behaviour ---------- */
  function pick(id, focus) {
    keep = id;
    refresh(focus ? '[data-keep="' + id + '"]' : null);
  }

  document.addEventListener('click', function (e) {
    const sso = e.target.closest('[data-sso]');
    if (sso && !busy) {
      busy = provider = sso.getAttribute('data-sso');
      refresh();
      setTimeout(function () {
        busy = null;
        data.account.signedIn = true;
        data.account.provider = provider;
        TZ.data.save(data);
        go('done');
      }, 900);
      return;
    }
    const k = e.target.closest('[data-keep]');
    if (k) { pick(k.getAttribute('data-keep')); return; }
    if (e.target.closest('[data-cancel]')) { keep = null; go('start'); return; }
    if (e.target.closest('[data-keep-confirm]') && keep) {
      P.confirm({
        title: I.t(keep === 'phone' ? 'login.found.askPhoneTitle' : 'login.found.askSavedTitle'),
        text: I.t('login.found.askText'),
        yes: I.t('login.found.askYes'), no: I.t('login.found.askNo'),
        icon: keep === 'phone' ? 'phone' : 'shield', tone: 'calm'
      }).then(function (yes) {
        if (!yes) return;
        data.account.signedIn = true;
        data.account.provider = provider;
        TZ.data.save(data);
        go('done');
      });
    }
  });

  /* Arrow keys move between the two choices (mirrored in Arabic) */
  document.addEventListener('keydown', function (e) {
    const k = e.target.closest('[data-keep]');
    if (!k) return;
    let step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    if (/Left|Right/.test(e.key) && I.dir() === 'rtl') step = -step;
    e.preventDefault();
    const ids = ['phone', 'saved'];
    const cur = ids.indexOf(k.getAttribute('data-keep'));
    pick(ids[(cur + step + ids.length) % ids.length], true);
  });

  P.boot({ titleKey: 'login.title', render: render });

  const bar = P.demoBar([
    { id: 'start', labelKey: 'login.demo.start' },
    { id: 'found', labelKey: 'login.demo.found' },
    { id: 'done', labelKey: 'login.demo.done' }
  ], function (id) {
    state = id;
    if (id !== 'found') keep = null;
    refresh();
    document.querySelector('.phone__scroll').scrollTop = 0;
  });
  if (bar.get() !== state) { state = bar.get(); refresh(); }
})();
