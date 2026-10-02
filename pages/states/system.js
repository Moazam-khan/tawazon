/* Special moments — app screens: offline, error, empty home, notifications. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data, K = TZ.states.kit;

  function screen(body, cls) { return '<main class="phone__scroll"><div class="screen ' + (cls || '') + '">' + body + '</div></main>'; }

  /* ---------- Offline: home with the last saved number ---------- */
  TZ.states.screens.offline = {
    render: function () {
      const d = D.get(), r = D.calculate(d);
      return screen(
        '<div class="note st-offline" role="status">' + IC.icon('wifiOff') +
          '<span><b class="st-offline__title" data-i18n="states.offline.title"></b> <span data-i18n="states.offline.text"></span></span></div>' +
        K.hero(r.daily, { extra: '<p class="st-hero__note st-hero__note--saved">' + IC.icon('clock') + '<span data-i18n="states.offline.saved"></span></p>' }) +
        K.nextPayment(d)) +
        P.tabbar('home');
    }
  };

  /* ---------- Error: friendly, with Try again ---------- */
  let errorStep = 'error';     // error | loading | ok
  TZ.states.screens.error = {
    reset: function () { errorStep = 'error'; },
    render: function () {
      if (errorStep === 'ok') {
        const d = D.get(), r = D.calculate(d);
        return screen(K.homeBody(d, r)) + P.tabbar('home');
      }
      const loading = errorStep === 'loading';
      return screen(
        '<div class="empty st-error">' + K.mascot('think', 'mascot--lg') +
          '<h2 class="empty__title" data-i18n="states.error.title"></h2>' +
          '<p class="empty__text" data-i18n="states.error.text"></p>' +
          '<button type="button" class="btn btn--primary st-error__btn" data-act="retry"' + (loading ? ' disabled aria-busy="true"' : '') + '>' +
            (loading ? '<span class="st-spin" aria-hidden="true"></span><span data-i18n="common.loading"></span>'
                     : IC.icon('replay') + '<span data-i18n="common.tryAgain"></span>') + '</button>' +
          '<a class="btn btn--text" href="' + P.url('home') + '" data-i18n="states.error.home"></a>' +
        '</div>', 'st-center');
    },
    on: function (act, el, rerender) {
      if (act !== 'retry' || errorStep !== 'error') return;
      errorStep = 'loading';
      rerender();
      const btn = document.querySelector('[data-act="retry"]');
      if (btn) btn.focus();
      setTimeout(function () {
        if (errorStep !== 'loading') return;
        errorStep = 'ok';
        rerender();
        K.toast(I.t('states.error.ok'));
      }, 1400);
    }
  };

  /* ---------- Empty home: before setup is finished ---------- */
  TZ.states.screens['empty-home'] = {
    render: function () {
      return screen(
        '<div class="empty st-empty">' + K.mascot('happy', 'mascot--lg mascot--float') +
          '<h2 class="empty__title" data-i18n="states.empty.title"></h2>' +
          '<p class="empty__text" data-i18n="states.empty.text"></p>' +
          '<a class="btn btn--primary btn--block" href="' + P.url('setup') + '">' + '<span data-i18n="states.empty.btn"></span>' +
            IC.icon('arrow', { dir: true }) + '</a>' +
        '</div>', 'st-center');
    }
  };

  /* ---------- Notifications on a lock screen ---------- */
  function clock(d) {
    const p = d.today.split('-');
    const dt = new Date(+p[0], +p[1] - 1, +p[2], 8, 0);
    const loc = I.getLang() !== 'ar' ? 'en-GB'
      : 'ar-SA-u-ca-gregory-nu-' + (I.getDigits() === 'arab' ? 'arab' : 'latn');
    return {
      time: new Intl.DateTimeFormat(loc, { hour: 'numeric', minute: '2-digit', hour12: false }).format(dt),
      date: new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' }).format(dt)
    };
  }
  function notif(caption, title, body) {
    return '<li class="st-notif">' +
      '<p class="st-notif__caption">' + caption + '</p>' +
      '<div class="st-notif__card">' +
        '<div class="st-notif__head">' + IC.logo('st-notif__logo') +
          '<span class="st-notif__app" data-i18n="brand.name"></span>' +
          '<span class="st-notif__when" data-i18n="states.notif.now"></span></div>' +
        '<p class="st-notif__title">' + title + '</p>' +
        '<p class="st-notif__body">' + body + '</p>' +
      '</div></li>';
  }
  TZ.states.screens.notifications = {
    render: function () {
      const d = D.get(), r = D.calculate(d), c = clock(d);
      const bills = (d.fixed || []).filter(function (f) { return f.id === 'bills'; })[0] || d.fixed[0];
      const REMIND_BEFORE = 2;                      // days before a payment is due
      const trialDay = 3 - (d.account.trialDaysLeft || 1) + 1;   // 3-day trial; day 2 = ends tomorrow
      return '<main class="phone__scroll st-lock-wrap"><section class="st-lock" aria-labelledby="st-lock-title">' +
        '<h2 class="sr-only" id="st-lock-title" data-i18n="states.notif.lock"></h2>' +
        '<div class="st-lock__clock" aria-hidden="true"><span class="st-lock__time">' + c.time + '</span>' +
          '<span class="st-lock__date">' + c.date + '</span></div>' +
        '<ul class="st-lock__list">' +
          notif(I.t('states.notif.c1'), I.t('states.notif.morningTitle'), K.t('states.notif.morning', { amount: K.money(r.daily) })) +
          notif(I.t('states.notif.c2'), I.t('states.notif.billsTitle'),
            K.t('states.notif.bills', { name: D.name(bills), amount: K.money(D.monthly(bills)), days: I.t('states.notif.inDays', { n: F.num(REMIND_BEFORE) }) })) +
          notif(I.t('states.notif.c3', { n: F.num(trialDay) }), I.t('states.notif.trialTitle'), I.t('states.notif.trial')) +
        '</ul></section></main>';
    }
  };
})();
