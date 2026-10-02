/* Settings — markup for each group of rows. script.js owns state and behaviour.
   TZ.settingsView.page(S) -> HTML string for <main> + sheets. */
window.TZ = window.TZ || {};

TZ.settingsView = (function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n;
  const TIMES = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '10:00'];

  /* "8:00 AM" in English, the Arabic equivalent in Arabic, in the chosen digit style */
  function time(hhmm) {
    const p = hhmm.split(':');
    const ar = I.getLang() === 'ar';
    const loc = ar ? (I.getDigits() === 'arab' ? 'ar-SA-u-nu-arab' : 'ar-SA-u-nu-latn') : 'en-US';
    return new Intl.DateTimeFormat(loc, { hour: 'numeric', minute: '2-digit' }).format(new Date(2026, 9, 7, +p[0], +p[1]));
  }

  function icon(name, mod) { return '<span class="row__icon' + (mod ? ' ' + mod : '') + '">' + IC.icon(name) + '</span>'; }
  function glyph(key) { return '<span class="row__icon st-glyph" aria-hidden="true" data-i18n="' + key + '"></span>'; }
  function body(id, titleKey, subKey, subVars) {
    return '<span class="row__body"><span class="row__title" id="' + id + '-t" data-i18n="' + titleKey + '"></span>' +
      (subKey ? '<span class="row__sub" id="' + id + '-s" data-i18n="' + subKey + '"' + P.vars(subVars) + '></span>' : '') + '</span>';
  }
  function section(id, titleKey, rows) {
    return '<section class="st-sec" aria-labelledby="st-' + id + '">' +
      '<h2 class="st-sec__title" id="st-' + id + '" data-i18n="' + titleKey + '"></h2>' +
      '<div class="list">' + rows.join('') + '</div></section>';
  }

  /* Segmented choice row: label on top, full-width choice below */
  function segRow(id, iconHtml, titleKey, subKey, subVars, current, options) {
    return '<div class="row st-row--stack">' +
      '<div class="st-row__head">' + iconHtml + body(id, titleKey, subKey, subVars) + '</div>' +
      '<div class="segmented segmented--block st-seg" role="radiogroup" aria-labelledby="' + id + '-t" data-group="' + id + '">' +
        options.map(function (o) {
          const on = o.value === current;
          return '<button type="button" class="segmented__btn' + (o.cls ? ' ' + o.cls : '') + '" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '"' +
            ' data-value="' + o.value + '" data-fk="' + id + '-' + o.value + '"' + (o.aria ? ' data-i18n-aria="' + o.aria + '"' : '') + '>' +
            (o.icon ? IC.icon(o.icon) : '') + '<span' + (o.lang ? ' lang="' + o.lang + '"' : '') + ' data-i18n="' + o.key + '"></span></button>';
        }).join('') +
      '</div></div>';
  }

  function toggleRow(id, iconName, titleKey, subKey, on) {
    return '<div class="row st-row">' + icon(iconName) +
      '<label class="row__body" for="st-' + id + '"><span class="row__title" id="st-' + id + '-t" data-i18n="' + titleKey + '"></span>' +
        '<span class="row__sub" id="st-' + id + '-s" data-i18n="' + subKey + '"></span></label>' +
      '<button type="button" class="toggle" role="switch" id="st-' + id + '" aria-checked="' + !!on + '" data-pref="' + id + '"' +
        ' aria-labelledby="st-' + id + '-t" aria-describedby="st-' + id + '-s" data-fk="pref-' + id + '">' +
        '<span class="toggle__track"></span><span class="toggle__thumb"></span></button></div>';
  }

  function navRow(tag, attrs, iconHtml, id, titleKey, subKey, subVars, end) {
    return '<' + tag + ' class="row st-row" ' + attrs + '>' + iconHtml + body(id, titleKey, subKey, subVars) +
      (end || '') + IC.icon('chevron', { dir: true, cls: 'row__chev' }) + '</' + tag + '>';
  }

  /* ---------- groups ---------- */
  function look(S) {
    return section('look', 'settings.sec.look', [
      segRow('lang', icon('globe'), 'settings.language', null, null, S.lang, [
        { value: 'en', key: 'lang.en', lang: 'en' }, { value: 'ar', key: 'lang.ar', lang: 'ar' }]),
      segRow('theme', icon(S.theme === 'dark' ? 'moon' : 'sun'), 'settings.theme', null, null, S.theme, [
        { value: 'light', key: 'settings.light', icon: 'sun' }, { value: 'dark', key: 'settings.dark', icon: 'moon' }]),
      segRow('digits', glyph('settings.digitsGlyph'), 'settings.digits', 'settings.digitsSub', null, S.digits, [
        { value: 'latn', key: 'settings.digitsLatn', aria: 'settings.digitsLatnAria', cls: 'st-num' },
        { value: 'arab', key: 'settings.digitsArab', aria: 'settings.digitsArabAria', cls: 'st-num', lang: 'ar' }]),
      segRow('size', glyph('settings.sizeGlyph'), 'settings.textSize', sizeKey(S.size), null, S.size, [
        { value: 'normal', key: 'settings.sizeA', aria: 'settings.sizeNormal', cls: 'st-a st-a--1' },
        { value: 'large', key: 'settings.sizeA', aria: 'settings.sizeLarge', cls: 'st-a st-a--2' },
        { value: 'xlarge', key: 'settings.sizeA', aria: 'settings.sizeXlarge', cls: 'st-a st-a--3' }])
    ]);
  }
  function sizeKey(size) { return size === 'large' ? 'settings.sizeLarge' : size === 'xlarge' ? 'settings.sizeXlarge' : 'settings.sizeNormal'; }

  function reminders(S) {
    return section('reminders', 'settings.sec.reminders', [
      toggleRow('reminder', 'bell', 'settings.reminder', 'settings.reminderSub', S.prefs.reminder),
      '<button type="button" class="row st-row" data-action="time" data-time-row data-fk="time"' + (S.prefs.reminder ? '' : ' hidden') + '>' +
        icon('clock') + body('time', 'settings.reminderTime') +
        '<span class="row__end st-value num" data-time-value>' + time(S.prefs.time) + '</span>' +
        IC.icon('chevron', { dir: true, cls: 'row__chev' }) + '</button>',
      toggleRow('notifications', 'calendar', 'settings.notifications', 'settings.notificationsSub', S.prefs.notifications)
    ]);
  }

  function safety(S) {
    return section('safety', 'settings.sec.safety', [
      toggleRow('biometric', 'fingerprint', 'settings.biometric', 'settings.biometricSub', S.prefs.biometric),
      toggleRow('smartAnswers', 'sparkle', 'settings.ai', 'settings.aiSub', S.prefs.smartAnswers)
    ]);
  }

  function account(S) {
    const a = S.account;
    const days = a.trialDaysLeft === 1 ? I.t('common.oneDay') : I.t('common.days', { n: F.num(a.trialDaysLeft || 0) });
    const planKey = a.plan === 'year' ? 'settings.planYear' : a.plan === 'month' ? 'settings.planMonth'
      : a.trialDaysLeft > 0 ? 'settings.planTrial' : 'settings.planFree';
    const save = S.signedIn
      ? '<div class="row st-row">' + icon('shield', 'st-icon--good') +
          body('saved', 'settings.saved', 'settings.savedSub', { provider: I.t('settings.' + S.provider + 'Name') }) +
          '<span class="st-check">' + IC.icon('check') + '</span></div>'
      : navRow('a', 'href="' + P.url('login') + '"', icon('shield'), 'save', 'settings.save', 'settings.saveSub');
    return section('account', 'settings.sec.account', [
      save,
      navRow('a', 'href="' + P.url('paywall') + '"', icon('crown', 'row__icon--sand'), 'plan', 'settings.plan', planKey, { days: days }),
      '<button type="button" class="row st-row" data-action="export">' + icon('download') +
        '<span class="row__body"><span class="row__title"><span data-i18n="settings.export"></span>' +
          '<span class="st-tag">' + IC.icon('crown') + '<span data-i18n="settings.plusTag"></span></span></span>' +
          '<span class="row__sub" data-i18n="settings.exportSub"></span></span>' +
        IC.icon('chevron', { dir: true, cls: 'row__chev' }) + '</button>',
      navRow('button', 'type="button" data-action="delete"', icon('trash', 'st-icon--tight'), 'delete', 'settings.delete', 'settings.deleteSub')
    ]);
  }

  function about(S) {
    const rows = [
      navRow('button', 'type="button" data-action="privacy"', icon('lock'), 'privacy', 'settings.privacy', 'settings.privacySub'),
      '<div class="row st-row"><span class="row__icon st-logo">' + IC.logo() + '</span>' +
        body('about', 'settings.about', 'settings.version', { v: I.fmtDigits('1.0') }) + '</div>'
    ];
    if (S.signedIn) rows.push(navRow('button', 'type="button" data-action="signout"', icon('logout'), 'signout', 'settings.signOut'));
    return section('about', 'settings.sec.about', rows);
  }

  /* ---------- sheets ---------- */
  function timeSheet(S) {
    return '<div class="overlay" data-sheet="time" aria-hidden="true"><div class="sheet st-sheet" role="dialog" aria-modal="true" aria-labelledby="st-time-title">' +
      '<div class="sheet__handle"></div>' +
      '<h2 class="sheet__title" id="st-time-title" data-i18n="settings.timeTitle"></h2>' +
      '<p class="muted st-sheet__hint" id="st-time-hint" data-i18n="settings.timeHint"></p>' +
      '<div class="st-times" role="radiogroup" aria-labelledby="st-time-title" aria-describedby="st-time-hint" data-group="time">' +
        TIMES.map(function (t) {
          const on = t === S.prefs.time;
          return '<button type="button" class="st-time num" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-value="' + t + '"' +
            (on ? ' data-autofocus' : '') + '>' + time(t) + '</button>';
        }).join('') +
      '</div>' +
      '<div class="stack-2 st-sheet__actions">' +
        '<button type="button" class="btn btn--primary btn--block" data-action="time-save">' + IC.icon('check') + '<span data-i18n="common.save"></span></button>' +
        '<button type="button" class="btn btn--text btn--block" data-close data-i18n="common.cancel"></button>' +
      '</div></div></div>';
  }

  function privacySheet() {
    const items = [['lock', 'p1'], ['edit', 'p2'], ['heart', 'p3'], ['trash', 'p4']];
    return '<div class="overlay" data-sheet="privacy" aria-hidden="true"><div class="sheet st-sheet" role="dialog" aria-modal="true" aria-labelledby="st-privacy-title">' +
      '<div class="sheet__handle"></div>' +
      '<h2 class="sheet__title" id="st-privacy-title" data-i18n="settings.privacyTitle"></h2>' +
      '<ul class="st-points">' + items.map(function (x) {
        return '<li>' + icon(x[0]) + '<span data-i18n="settings.' + x[1] + '"></span></li>';
      }).join('') + '</ul>' +
      '<button type="button" class="btn btn--primary btn--block" data-close data-autofocus data-i18n="common.gotIt"></button>' +
      '</div></div>';
  }

  function page(S) {
    return '<main class="phone__scroll"><div class="screen st">' +
        look(S) + reminders(S) + safety(S) + account(S) + about(S) +
      '</div></main>' + timeSheet(S) + privacySheet();
  }

  return { page: page, time: time, sizeKey: sizeKey, TIMES: TIMES };
})();
