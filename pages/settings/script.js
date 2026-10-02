/* Settings — state and behaviour. Markup lives in sections.js (TZ.settingsView). */
(function () {
  'use strict';
  const P = TZ.page, I = TZ.i18n, V = TZ.settingsView;
  const data = TZ.data.get();

  /* Simple on/off choices are kept with the demo data so other pages can read them */
  data.prefs = Object.assign({ reminder: true, time: '08:00', notifications: true, biometric: false, smartAnswers: true }, data.prefs);

  let signedIn = !!data.account.signedIn;
  let pendingTime = data.prefs.time;
  let focusKey = null;           // re-focus this control after a re-render (language / digits)

  function state() {
    return {
      lang: I.getLang(), digits: I.getDigits(), theme: TZ.ui.getTheme(), size: TZ.ui.getTextSize(),
      prefs: data.prefs, account: data.account, signedIn: signedIn, provider: data.account.provider || 'apple'
    };
  }

  function render() {
    document.getElementById('app').innerHTML =
      P.header({ titleKey: 'settings.title', back: 'home' }) + V.page(state());
    if (focusKey) {
      const el = document.querySelector('[data-fk="' + focusKey + '"]');
      focusKey = null;
      if (el) requestAnimationFrame(function () { el.focus(); });
    }
  }
  function refresh() {
    render();
    I.apply(document);
    P.wire(document);
    const sw = document.querySelector('[data-langswitch] span');
    if (sw) sw.setAttribute('lang', I.getLang() === 'ar' ? 'en' : 'ar');
  }
  function toast(key) { TZ.ui.toast(document.querySelector('.phone'), { message: I.t(key), duration: 6000 }); }

  /* Mark one option in a radio group as chosen, without re-rendering */
  function mark(group, value) {
    group.querySelectorAll('[role="radio"]').forEach(function (b) {
      const on = b.getAttribute('data-value') === value;
      b.setAttribute('aria-checked', on);
      b.tabIndex = on ? 0 : -1;
    });
  }

  function choose(groupId, value, btn) {
    const group = btn.closest('[data-group]');
    if (groupId === 'lang') {
      if (value === I.getLang()) return;
      focusKey = 'lang-' + value;
      I.setLang(value);                       // page re-renders itself
    } else if (groupId === 'digits') {
      if (value === I.getDigits()) return;
      focusKey = 'digits-' + value;
      I.setDigits(value);                     // page re-renders itself
    } else if (groupId === 'theme') {
      TZ.ui.setTheme(value);
      mark(group, value);
      const row = group.closest('.row').querySelector('.row__icon');
      row.innerHTML = TZ.icons.icon(value === 'dark' ? 'moon' : 'sun');
    } else if (groupId === 'size') {
      TZ.ui.setTextSize(value);
      mark(group, value);
      const sub = document.getElementById('size-s');
      sub.setAttribute('data-i18n', V.sizeKey(value));
      I.apply(sub.parentNode);
    } else if (groupId === 'time') {
      pendingTime = value;
      mark(group, value);
    }
  }

  function togglePref(btn) {
    const key = btn.getAttribute('data-pref');
    data.prefs[key] = !data.prefs[key];
    btn.setAttribute('aria-checked', data.prefs[key]);
    TZ.data.save(data);
    if (key === 'reminder') document.querySelector('[data-time-row]').hidden = !data.prefs.reminder;
  }

  function saveTime() {
    data.prefs.time = pendingTime;
    TZ.data.save(data);
    document.querySelector('[data-time-value]').textContent = V.time(pendingTime);
    P.closeSheet('time');
  }

  function deleteAccount() {
    P.confirm({
      title: I.t('settings.del1Title'), text: I.t('settings.del1Text'),
      yes: I.t('settings.del1Yes'), no: I.t('settings.del1No'), icon: 'trash'
    }).then(function (step1) {
      if (!step1) return null;
      return new Promise(function (r) { setTimeout(r, 320); }).then(function () {
        return P.confirm({
          title: I.t('settings.del2Title'), text: I.t('settings.del2Text'),
          yes: I.t('settings.del2Yes'), no: I.t('settings.del1No'), icon: 'alert'
        });
      });
    }).then(function (sure) {
      if (!sure) return;
      toast('settings.deleted');
    });
  }

  function signOut() {
    P.confirm({
      title: I.t('settings.signOutTitle'), text: I.t('settings.signOutText'),
      yes: I.t('settings.signOut'), no: I.t('settings.signOutNo'), icon: 'logout', tone: 'calm'
    }).then(function (yes) {
      if (!yes) return;
      data.account.signedIn = false;
      TZ.data.save(data);
      const b = document.querySelector('[data-demo="guest"]');
      if (b) b.click(); else { signedIn = false; refresh(); }
      toast('settings.signedOut');
    });
  }

  document.addEventListener('click', function (e) {
    const radio = e.target.closest('[data-group] [role="radio"]');
    if (radio) { choose(radio.closest('[data-group]').getAttribute('data-group'), radio.getAttribute('data-value'), radio); return; }
    const sw = e.target.closest('[data-pref]');
    if (sw) { togglePref(sw); return; }
    const act = e.target.closest('[data-action]');
    if (!act) return;
    const a = act.getAttribute('data-action');
    if (a === 'time') {
      pendingTime = data.prefs.time;
      mark(document.querySelector('[data-group="time"]'), pendingTime);
      P.openSheet('time', act);
    } else if (a === 'time-save') saveTime();
    else if (a === 'privacy') P.openSheet('privacy', act);
    else if (a === 'export') toast('settings.exportDone');
    else if (a === 'delete') deleteAccount();
    else if (a === 'signout') signOut();
  });

  /* Arrow keys inside any choice group (mirrored for Arabic) */
  document.addEventListener('keydown', function (e) {
    const radio = e.target.closest('[data-group] [role="radio"]');
    if (!radio) return;
    let step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    if (/Left|Right/.test(e.key) && I.dir() === 'rtl') step = -step;
    e.preventDefault();
    const items = Array.prototype.slice.call(radio.closest('[data-group]').querySelectorAll('[role="radio"]'));
    const next = items[(items.indexOf(radio) + step + items.length) % items.length];
    next.click();
    if (document.body.contains(next)) next.focus();
  });

  P.boot({ titleKey: 'settings.title', render: render });

  const bar = P.demoBar([
    { id: 'guest', labelKey: 'settings.demo.guest' },
    { id: 'signedIn', labelKey: 'settings.demo.signedIn' }
  ], function (id) {
    signedIn = id === 'signedIn';
    refresh();
  }, signedIn ? 'signedIn' : 'guest');
  if ((bar.get() === 'signedIn') !== signedIn) { signedIn = bar.get() === 'signedIn'; refresh(); }
})();
