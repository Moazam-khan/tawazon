/* ==========================================================================
   Tawazon Plus — page shell (shared by every page)
   - TZ.page.boot({ titleKey, render })  start a page; render() runs again on
     every language / digit change, then translations are applied.
   - TZ.page.header({...}) / TZ.page.tabbar('home')   shared chrome (HTML strings)
   - TZ.page.url('home') / TZ.page.go('home')          links that work from any depth
   - TZ.page.confirm({...}) -> Promise<boolean>         plain-language confirm
   - TZ.page.demoBar([...])                             design states in the review bar
   - review tools (all screens · previous · next · states) only with ?tools in the link
   - TZ.fmt.money(n) / moneyHtml(n) / num(n) / date(iso, style)
   ========================================================================== */
window.TZ = window.TZ || {};

TZ.page = (function () {
  const I = function () { return TZ.i18n; };
  const IC = function () { return TZ.icons; };

  /* Project root, worked out from where this script lives (handles nested pages) */
  const SRC = (document.currentScript && document.currentScript.src) || '';
  const ROOT = SRC.replace(/assets\/js\/shell\.js.*$/, '');

  function url(name) { return ROOT + (name === 'gallery' ? 'index.html' : 'pages/' + name + '/index.html'); }
  function go(name, hash) { TZ.ui.navigate(url(name) + (hash || '')); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function attrVars(vars) { return vars ? " data-i18n-vars='" + JSON.stringify(vars).replace(/'/g, '&#39;') + "'" : ''; }

  /* ---------- header ----------
     opts: { titleKey, back: 'home' | 'my-money' | true (history) | null,
             lang: true (show switch, default), settings: bool, end: extra HTML } */
  function header(opts) {
    opts = opts || {};
    let start = opts.start || '';   /* e.g. the logo on Home */
    if (opts.back) {
      const href = opts.back === true ? '#' : url(opts.back);
      start = '<a class="appbar__btn" href="' + href + '"' + (opts.back === true ? ' data-back' : '') +
        ' data-i18n-aria="common.back">' + IC().icon('back', { dir: true }) + '</a>';
    }
    const title = opts.titleKey
      ? '<h1 class="appbar__title" data-i18n="' + opts.titleKey + '"' + attrVars(opts.titleVars) + '></h1>'
      : '<span class="appbar__title"></span>';
    let end = opts.end || '';
    if (opts.settings) {
      end += '<a class="appbar__btn" href="' + url('settings') + '" data-i18n-aria="nav.settings">' + IC().icon('settings') + '</a>';
    }
    if (opts.lang !== false) end += langSwitch();
    return '<header class="appbar' + (opts.back ? '' : ' appbar--root') + '">' + start + title +
      '<div class="appbar__end">' + end + '</div></header>';
  }

  /* Shows the OTHER language's name; switching is instant and remembered */
  function langSwitch() {
    return '<button type="button" class="langswitch" data-langswitch data-i18n-aria="lang.switchAria">' +
      IC().icon('globe') + '<span data-i18n="lang.switchTo"></span></button>';
  }
  function syncLangSwitch() {
    const other = I().getLang() === 'ar' ? 'en' : 'ar';
    document.querySelectorAll('[data-langswitch] span').forEach(function (s) { s.setAttribute('lang', other); });
  }

  /* ---------- bottom tab bar: Home · My money · Ask ---------- */
  function tabbar(active) {
    const tabs = [['home', 'home', 'tab.home'], ['my-money', 'wallet', 'tab.money'], ['ask', 'chat', 'tab.ask']];
    return '<nav class="tabbar" data-i18n-aria="nav.main">' + tabs.map(function (t) {
      return '<a class="tab" href="' + url(t[0]) + '"' + (t[0] === active ? ' aria-current="page"' : '') + '>' +
        '<span class="tab__icon">' + IC().icon(t[1]) + '</span><span data-i18n="' + t[2] + '"></span></a>';
    }).join('') + '</nav>';
  }

  /* ---------- review bar (outside the phone, for people reviewing the design) ----------
     A slim bar on every page: all screens · previous · "4 of 12 · Home" · next,
     plus a "States" menu when the page has design states (see demoBar). */
  const SCREENS = ['welcome', 'setup', 'reveal', 'paywall', 'home', 'month', 'how-calculated', 'ask',
    'my-money', 'my-money/debt-details', 'seasons', 'settings', 'login', 'states'];
  const screenKey = function (s) { return s.replace(/[-/](\w)/g, function (m, c) { return c.toUpperCase(); }); };
  function currentScreen() {
    const here = location.href.split(/[?#]/)[0];
    const rel = here.indexOf(ROOT) === 0 ? here.slice(ROOT.length) : here;
    const m = rel.match(/^pages\/(.+)\/index\.html$/) || rel.match(/^pages\/(.+)\/$/);
    return m ? m[1] : null;
  }
  const isCapture = function () { return /[?&]capture/.test(location.search) || document.documentElement.classList.contains('is-capture'); };

  let bar = null, statesEl = null, statesBtn = null;
  /* Hidden by default so every screen is just the phone; add ?tools to a page link to show them */
  const wantTools = function () { return /[?&]tools/.test(location.search); };
  function ensureBar() {
    if (bar || isCapture() || !wantTools()) return bar;
    const me = currentScreen();
    const i = SCREENS.indexOf(me);
    if (i < 0) return null;
    bar = document.createElement('aside');
    bar.className = 'demo-bar';
    bar.setAttribute('data-i18n-aria', 'demo.title');
    const prev = i > 0 ? url(SCREENS[i - 1]) : url('gallery');
    const next = i < SCREENS.length - 1 ? url(SCREENS[i + 1]) : url('gallery');
    bar.innerHTML =
      '<p class="demo-bar__label" data-i18n="demo.tools"></p>' +
      '<div class="demo-bar__row">' +
        '<a class="demo-bar__icon" href="' + url('gallery') + '" data-i18n-aria="demo.allScreens">' + IC().icon('list') + '</a>' +
        '<a class="demo-bar__icon" href="' + prev + '" data-i18n-aria="demo.prev">' + IC().icon('chevronBack', { dir: true }) + '</a>' +
        '<p class="demo-bar__where"><span class="demo-bar__count" data-i18n="demo.position"' + attrVars({ n: String(i + 1), total: String(SCREENS.length) }) + '></span>' +
          '<span class="demo-bar__name" data-i18n="gallery.screen.' + screenKey(me) + '.name"></span></p>' +
        '<a class="demo-bar__icon" href="' + next + '" data-i18n-aria="demo.next">' + IC().icon('chevron', { dir: true }) + '</a>' +
        '<button type="button" class="demo-bar__toggle" aria-expanded="false" hidden>' +
          '<span data-i18n="demo.states"></span>' + IC().icon('chevron', { cls: 'demo-bar__caret' }) + '</button>' +
      '</div>' +
      '<div class="demo-bar__list" role="radiogroup" data-i18n-aria="demo.title" hidden></div>';
    document.body.insertBefore(bar, document.body.firstChild);
    statesEl = bar.querySelector('.demo-bar__list');
    statesBtn = bar.querySelector('.demo-bar__toggle');
    statesBtn.onclick = function () {
      const open = statesBtn.getAttribute('aria-expanded') !== 'true';
      statesBtn.setAttribute('aria-expanded', String(open));
      statesEl.hidden = !open;
      try { localStorage.setItem('tz-review-states', open ? 'open' : 'closed'); } catch (e) {}
      fitPhone();
    };
    tuckOnScroll();
    I().apply(bar);
    document.addEventListener('tz:langchange', function () { I().apply(bar); });
    return bar;
  }

  /* Phones: tuck the review strip away while scrolling down, bring it back on the way up */
  function tuckOnScroll() {
    const last = new WeakMap();
    document.addEventListener('scroll', function (e) {
      const t = e.target;
      if (!bar || window.innerWidth >= 560 || !t || t.scrollTop == null) return;
      const y = t.scrollTop, prev = last.has(t) ? last.get(t) : 0;
      last.set(t, y);
      if (y > 48 && y - prev > 4) bar.classList.add('is-tucked');
      else if (prev - y > 4 || y < 8) bar.classList.remove('is-tucked');
    }, true);
  }

  /* Framed phone (tablet / desktop): scale the whole 390 × 844 device to fit the window */
  function fitPhone() {
    const root = document.documentElement;
    if (window.innerWidth < 560 || !document.querySelector('.phone')) { root.style.removeProperty('--phone-fit'); return; }
    const side = window.innerWidth >= 1000 && bar ? 272 : 0;
    const top = window.innerWidth < 1000 && bar ? bar.offsetHeight : 0;
    const fit = Math.min(1, (window.innerHeight - top - 32) / 864, (window.innerWidth - side - 32) / 410);
    root.style.setProperty('--phone-fit', Math.max(0.5, fit).toFixed(3));
  }
  window.addEventListener('resize', function () { fitPhone(); });

  /* iPhone-style status bar inside the framed phone (hidden on real phones) */
  function statusBar() {
    const phone = document.querySelector('.phone');
    if (!phone || phone.querySelector(':scope > .phone__status')) return;
    const el = document.createElement('div');
    el.className = 'phone__status';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span>9:41</span><span class="phone__island"></span><span class="phone__sys">' +
      '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
      '<svg viewBox="0 0 16 12"><path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.3-1.4A10.3 10.3 0 0 0 8 .5 10.3 10.3 0 0 0 .7 3.4L2 4.8a8.4 8.4 0 0 1 6-2.4Zm0 3.8c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.7 6.7 0 0 0 8 4.3a6.7 6.7 0 0 0-4.7 1.8l1.3 1.4c.9-.8 2.1-1.3 3.4-1.3Zm0 3.7c-.5 0-1 .2-1.4.5L8 11.9l1.4-1.5A2.2 2.2 0 0 0 8 9.9Z"/></svg>' +
      '<svg class="phone__bat" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="17" height="8" rx="1.6"/><rect x="23.5" y="4" width="1.6" height="4" rx=".8" opacity=".4"/></svg></span>';
    phone.insertBefore(el, phone.firstChild);
  }

  /* Design states: items [{ id, labelKey }]; onPick(id). Reads/writes location.hash
     so links can open one state: pages/ask/index.html#offline */
  function demoBar(items, onPick, current) {
    const fromHash = location.hash.replace('#', '');
    const ids = items.map(function (x) { return x.id; });
    let cur = ids.indexOf(fromHash) > -1 ? fromHash : (current || ids[0]);
    const api = {
      get: function () { return cur; },
      set: function (id) { cur = id; history.replaceState(null, '', '#' + id); draw(); }
    };
    if (!ensureBar()) return api;
    const wide = window.matchMedia('(min-width: 1000px)').matches;
    let open = wide;
    try { const s = localStorage.getItem('tz-review-states'); if (s && !wide) open = s === 'open'; } catch (e) {}
    statesBtn.hidden = false;
    statesBtn.setAttribute('aria-expanded', String(open));
    statesEl.hidden = !open;
    function draw() {
      statesEl.innerHTML = items.map(function (x) {
        return '<button type="button" class="demo-bar__btn" role="radio" aria-checked="' + (x.id === cur) + '" data-demo="' + x.id + '" data-i18n="' + x.labelKey + '"></button>';
      }).join('');
      I().apply(statesEl);
    }
    statesEl.onclick = function (e) {
      const b = e.target.closest('[data-demo]');
      if (!b) return;
      cur = b.getAttribute('data-demo');
      history.replaceState(null, '', '#' + cur);
      draw();
      onPick(cur);
    };
    document.addEventListener('tz:langchange', draw);
    draw();
    fitPhone();
    return api;
  }

  /* ---------- confirm (plain words, focus-trapped) ---------- */
  function confirm(opts) {
    return new Promise(function (resolve) {
      const phone = document.querySelector('.phone');
      const ov = document.createElement('div');
      ov.className = 'overlay overlay--center';
      ov.setAttribute('data-keep', '');
      ov.innerHTML = '<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-text">' +
        '<div class="modal__icon' + (opts.tone === 'calm' ? ' modal__icon--calm' : '') + '">' + IC().icon(opts.icon || 'trash') + '</div>' +
        '<h2 class="modal__title" id="cf-title"></h2><p class="modal__text" id="cf-text"></p>' +
        '<div class="modal__actions">' +
          '<button type="button" class="btn ' + (opts.tone === 'calm' ? 'btn--primary' : 'btn--danger-soft') + ' btn--block" data-yes></button>' +
          '<button type="button" class="btn btn--secondary btn--block" data-no data-autofocus></button>' +
        '</div></div>';
      ov.querySelector('#cf-title').textContent = opts.title || '';
      ov.querySelector('#cf-text').textContent = opts.text || '';
      ov.querySelector('[data-yes]').textContent = opts.yes || I().t('common.yes');
      ov.querySelector('[data-no]').textContent = opts.no || I().t('common.cancel');
      phone.appendChild(ov);
      TZ.ui.wireOverlay(ov);
      const opener = document.activeElement;
      requestAnimationFrame(function () { TZ.ui.openOverlay(ov, opener); });
      function done(v) {
        TZ.ui.closeOverlay(ov);
        setTimeout(function () { ov.remove(); }, 300);
        resolve(v);
      }
      ov.querySelector('[data-yes]').onclick = function () { done(true); };
      ov.querySelector('[data-no]').onclick = function () { done(false); };
      ov.addEventListener('click', function (e) { if (e.target === ov) done(false); });
      ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') done(false); });
    });
  }

  /* ---------- sheets declared in HTML: <div class="overlay" data-sheet="add"> ---------- */
  function openSheet(id, opener) {
    const ov = document.querySelector('[data-sheet="' + id + '"]');
    if (ov) TZ.ui.openOverlay(ov, opener || document.activeElement);
    return ov;
  }
  function closeSheet(id) {
    const ov = typeof id === 'string' ? document.querySelector('[data-sheet="' + id + '"]') : id;
    if (ov) TZ.ui.closeOverlay(ov);
  }
  function wire(root) {
    (root || document).querySelectorAll('.overlay').forEach(function (ov) {
      if (ov.__wired) return;
      ov.__wired = true;
      TZ.ui.wireOverlay(ov);
    });
  }

  /* Re-apply translations after changing markup outside render() (e.g. a demo state) */
  function refresh(root) { I().apply(root || document); syncLangSwitch(); wire(document); }

  /* ---------- boot ---------- */
  function boot(opts) {
    opts = opts || {};
    function rerender() {
      /* keep open amount sheets / confirms / toasts alive across a language switch */
      const phone = document.querySelector('.phone');
      const keep = phone ? Array.prototype.slice.call(phone.querySelectorAll(':scope > .toast, :scope > [data-keep]')) : [];
      keep.forEach(function (n) { n.remove(); });
      if (opts.render) opts.render(I().getLang());
      keep.forEach(function (n) { if (phone && !n.isConnected) phone.appendChild(n); });
      statusBar();
      I().apply(document);
      syncLangSwitch();
      wire(document);
      if (opts.titleKey) document.title = I().t(opts.titleKey) + ' · ' + I().t('brand.name');
    }
    document.addEventListener('click', function (e) {
      const sw = e.target.closest('[data-langswitch]');
      if (sw) { I().setLang(I().getLang() === 'ar' ? 'en' : 'ar'); return; }
      const back = e.target.closest('[data-back]');
      if (back) { e.preventDefault(); if (history.length > 1) history.back(); else go('home'); return; }
      const close = e.target.closest('[data-close]');
      if (close && close.closest('.overlay')) { TZ.ui.closeOverlay(close.closest('.overlay')); }
    });
    document.addEventListener('tz:langchange', rerender);
    document.addEventListener('tz:digitschange', rerender);
    /* Review links: ?lang=ar&theme=dark&size=xlarge&digits=arab (remembered like a normal choice) */
    const q = new URLSearchParams(location.search);
    try {
      if (q.get('lang')) localStorage.setItem('tz-lang', q.get('lang'));
      if (q.get('theme')) localStorage.setItem('tz-theme', q.get('theme'));
      if (q.get('size')) localStorage.setItem('tz-text-size', q.get('size'));
      if (q.get('digits')) localStorage.setItem('tz-digits', q.get('digits'));
    } catch (e) {}
    if (q.get('lang')) TZ.settings.lang = q.get('lang');
    if (q.has('capture')) document.documentElement.classList.add('is-capture');
    TZ.ui.initCommon();
    TZ.i18n.init();            // fires tz:langchange -> first render
    ensureBar();
    fitPhone();
    const phoneEl = document.querySelector('.phone');
    if (phoneEl && window.MutationObserver) new MutationObserver(statusBar).observe(phoneEl, { childList: true });
    document.body.classList.add('is-ready');
  }

  return {
    root: ROOT, url: url, go: go, esc: esc, vars: attrVars,
    header: header, tabbar: tabbar, langSwitch: langSwitch, demoBar: demoBar,
    fit: fitPhone, confirm: confirm, openSheet: openSheet, closeSheet: closeSheet, wire: wire, refresh: refresh, boot: boot
  };
})();

/* ---------- formatting shortcuts (current page language) ---------- */
TZ.fmt = (function () {
  const I = function () { return TZ.i18n; };
  function num(n, lang) { return I().fmtNumber(n, lang); }
  function money(n, lang) { return I().money(n, lang); }
  function moneyHtml(n, lang) { return '<bdi class="num">' + money(n, lang) + '</bdi>'; }
  /* Gregorian calendar in both languages (salaries are paid by Gregorian date) */
  function date(isoStr, style, lang) {
    lang = lang || I().getLang();
    const p = isoStr.split('-');
    const dt = new Date(+p[0], +p[1] - 1, +p[2]);
    const arab = lang === 'ar' && I().getDigits() === 'arab';
    const loc = lang === 'ar' ? (arab ? 'ar-SA-u-ca-gregory-nu-arab' : 'ar-SA-u-ca-gregory-nu-latn') : 'en-GB';
    const o = style === 'long' ? { day: 'numeric', month: 'long', year: 'numeric' }
            : style === 'month' ? { month: 'long', year: 'numeric' }
            : { day: 'numeric', month: 'short' };
    return new Intl.DateTimeFormat(loc, o).format(dt);
  }
  return { num: num, money: money, moneyHtml: moneyHtml, date: date };
})();
