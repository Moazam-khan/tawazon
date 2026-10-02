/* Explorer — full-screen viewer: a big picture of one screen, swipe or arrows
   to move between screens, chips for its states, "Open the live screen" and
   Approve for the current language. */
window.TZ = window.TZ || {};
TZ.ex = TZ.ex || {};

TZ.ex.viewer = (function () {
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons;
  let el = null, at = 0, st = 0, opener = null, onChange = null;

  function screen() { return TZ.SCREENS[at]; }
  function nameOf(s) { return I.t('gallery.screen.' + TZ.screenKey(s.id) + '.name'); }
  function langName() { return I.t('lang.' + I.getLang()); }

  function liveUrl(s, state) { return P.url(s.id) + (state ? '#' + state : ''); }

  function draw() {
    const s = screen(), lang = I.getLang(), state = s.states[st];
    const approved = TZ.review.has(s.id, lang);
    el.innerHTML =
      '<div class="vw" role="dialog" aria-modal="true" aria-labelledby="vw-title" data-i18n-aria="explore.viewer.label">' +
        '<header class="vw-top">' +
          '<button type="button" class="vw-icon" data-vw="close" data-i18n-aria="explore.viewer.close">' + IC.icon('close') + '</button>' +
          '<div class="vw-title"><h2 id="vw-title">' + P.esc(nameOf(s)) + '</h2>' +
            '<p class="vw-pos" data-i18n="explore.viewer.position"' + P.vars({ n: F.num(at + 1), total: F.num(TZ.SCREENS.length) }) + '></p></div>' +
          P.langSwitch() +
        '</header>' +
        '<div class="vw-stage" data-vw="stage">' +
          '<button type="button" class="vw-nav" data-vw="prev" data-i18n-aria="explore.viewer.prev"' + (at === 0 ? ' disabled' : '') + '>' + IC.icon('chevronBack', { dir: true }) + '</button>' +
          '<figure class="vw-phone"><img src="' + TZ.shotPath(s, state, lang) + '" width="500" height="1082" alt="' +
            P.esc(state ? I.t('explore.viewer.shot', { name: nameOf(s), state: I.t(TZ.stateLabelKey(s, state)) }) : I.t('explore.viewer.shotPlain', { name: nameOf(s) })) + '" draggable="false"></figure>' +
          '<button type="button" class="vw-nav" data-vw="next" data-i18n-aria="explore.viewer.next"' + (at === TZ.SCREENS.length - 1 ? ' disabled' : '') + '>' + IC.icon('chevron', { dir: true }) + '</button>' +
        '</div>' +
        (s.states.length > 1
          ? '<div class="vw-states" role="radiogroup" data-i18n-aria="explore.viewer.states">' + s.states.map(function (x, i) {
              return '<button type="button" class="ex-filter" role="radio" aria-checked="' + (i === st) + '" data-vw-state="' + i + '" data-i18n="' + TZ.stateLabelKey(s, x) + '"></button>';
            }).join('') + '</div>'
          : '') +
        '<p class="vw-desc" data-i18n="gallery.screen.' + TZ.screenKey(s.id) + '.desc"></p>' +
        '<footer class="vw-foot">' +
          '<a class="btn btn--primary" href="' + liveUrl(s, state) + '">' + IC.icon('phone') + '<span data-i18n="explore.viewer.openLive"></span></a>' +
          '<button type="button" class="btn ' + (approved ? 'btn--primary vw-approved' : 'btn--secondary') + '" data-vw="approve" aria-pressed="' + approved + '">' +
            IC.icon('check') + '<span data-i18n="explore.viewer.' + (approved ? 'approved' : 'approve') + '"' + P.vars({ lang: langName() }) + '></span></button>' +
        '</footer>' +
      '</div>';
    P.refresh(el);
    preload();
  }

  function preload() {
    [at - 1, at + 1].forEach(function (i) {
      const s = TZ.SCREENS[i];
      if (s) { const im = new Image(); im.src = TZ.shotPath(s, s.states[0], I.getLang()); }
    });
  }

  function go(delta) {
    const n = at + delta;
    if (n < 0 || n >= TZ.SCREENS.length) return;
    at = n; st = 0;
    draw();
    const img = el.querySelector('.vw-phone img');
    if (img && !TZ.ui.reduceMotion()) img.animate([
      { opacity: 0, transform: 'translateX(' + (delta * (I.dir() === 'rtl' ? -1 : 1) * 24) + 'px)' },
      { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
    focusKeep('[data-vw="' + (delta > 0 ? 'next' : 'prev') + '"]');
  }
  function focusKeep(sel) {
    const b = el.querySelector(sel);
    if (b && !b.disabled) b.focus({ preventScroll: true }); else el.querySelector('[data-vw="close"]').focus();
  }

  function open(index, stateIndex, from) {
    at = index; st = stateIndex || 0; opener = from || document.activeElement;
    if (!el) {
      el = document.createElement('div');
      el.className = 'vw-wrap';
      document.body.appendChild(el);
      bind();
    }
    el.hidden = false;
    document.body.classList.add('vw-open');
    draw();
    el.querySelector('[data-vw="close"]').focus();
  }
  function close() {
    if (!el) return;
    el.hidden = true;
    document.body.classList.remove('vw-open');
    if (onChange) onChange();
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  function bind() {
    el.addEventListener('click', function (e) {
      const b = e.target.closest('[data-vw]');
      const s = e.target.closest('[data-vw-state]');
      if (s) { st = +s.getAttribute('data-vw-state'); draw(); focusKeep('[data-vw-state="' + st + '"]'); return; }
      if (!b) return;
      const what = b.getAttribute('data-vw');
      if (what === 'close') close();
      else if (what === 'prev') go(-1);
      else if (what === 'next') go(1);
      else if (what === 'approve') {
        const s2 = screen(), lang = I.getLang();
        TZ.review.set(s2.id, lang, !TZ.review.has(s2.id, lang));
        draw(); focusKeep('[data-vw="approve"]');
      }
    });
    el.addEventListener('keydown', function (e) {
      const rtl = I.dir() === 'rtl';
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowRight' && !e.target.closest('.vw-states')) go(rtl ? -1 : 1);
      if (e.key === 'ArrowLeft' && !e.target.closest('.vw-states')) go(rtl ? 1 : -1);
      if (e.key === 'Tab') {
        const items = Array.prototype.filter.call(el.querySelectorAll('button:not([disabled]), a[href]'), function (n) { return n.offsetParent !== null; });
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    /* swipe: left means "next" in English, right means "next" in Arabic */
    let x0 = null, y0 = null;
    el.addEventListener('pointerdown', function (e) { if (e.target.closest('.vw-stage')) { x0 = e.clientX; y0 = e.clientY; } });
    el.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      const forward = I.dir() === 'rtl' ? dx > 0 : dx < 0;
      go(forward ? 1 : -1);
    });
    document.addEventListener('tz:langchange', function () { if (el && !el.hidden) draw(); });
  }

  return { open: open, close: close, onClose: function (fn) { onChange = fn; } };
})();
