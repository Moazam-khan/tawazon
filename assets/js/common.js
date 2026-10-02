/* ==========================================================================
   Tawazon Plus — common UI helpers (theme, text size, toast, overlays, motion)
   ========================================================================== */
window.TZ = window.TZ || {};

TZ.ui = (function () {
  const html = document.documentElement;
  const reduceMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k)     { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------- theme (light / dark) ---------- */
  function setTheme(theme) {
    theme = theme === 'dark' ? 'dark' : 'light';
    html.setAttribute('data-theme', theme);
    store('tz-theme', theme);
    document.dispatchEvent(new CustomEvent('tz:themechange', { detail: { theme: theme } }));
  }
  function getTheme() { return html.getAttribute('data-theme') || 'light'; }
  function toggleTheme() { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); }
  function initTheme() {
    const saved = new URLSearchParams(location.search).get('theme') || load('tz-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved || (prefersDark ? 'dark' : 'light'));
  }

  /* ---------- text size (normal / large / xlarge) ---------- */
  function setTextSize(size) {
    if (size === 'large' || size === 'xlarge') html.setAttribute('data-text-size', size);
    else html.removeAttribute('data-text-size');
    store('tz-text-size', size || 'normal');
  }
  function getTextSize() { return html.getAttribute('data-text-size') || 'normal'; }
  function initTextSize() { setTextSize(new URLSearchParams(location.search).get('size') || load('tz-text-size') || 'normal'); }

  /* ---------- toast with Undo ---------- */
  /* TZ.ui.toast(rootEl, { message, undoLabel, onUndo, duration }) */
  function toast(root, opts) {
    opts = opts || {};
    const duration = opts.duration || 10000;
    root.querySelectorAll('.toast:not(.toast--static)').forEach(function (n) { n.remove(); });

    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.setProperty('--toast-time', duration + 'ms');

    const msg = document.createElement('span');
    msg.className = 'toast__msg';
    /* keep "200 → 181" together: no-break spaces around the arrow */
    msg.textContent = (opts.message || '').replace(/ ([→←]) /g, ' $1 ');
    el.appendChild(msg);

    let timer;
    function dismiss() {
      clearTimeout(timer);
      if (!el.parentNode) return;
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, reduceMotion() ? 0 : 220);
    }

    if (opts.undoLabel) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toast__undo';
      btn.innerHTML = TZ.icons.icon('undo', { dir: true }) + '<span></span>';
      btn.lastChild.textContent = opts.undoLabel;
      btn.addEventListener('click', function () {
        if (opts.onUndo) opts.onUndo();
        dismiss();
      });
      el.appendChild(btn);
    }
    const bar = document.createElement('i');
    bar.className = 'toast__timer';
    el.appendChild(bar);

    root.appendChild(el);
    timer = setTimeout(dismiss, duration);
    return { el: el, dismiss: dismiss };
  }

  /* ---------- overlays: bottom sheet / modal (focus managed) ---------- */
  const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const openers = new WeakMap();

  function openOverlay(overlay, opener) {
    overlay.classList.add('is-open');
    overlay.removeAttribute('aria-hidden');
    if (opener) openers.set(overlay, opener);
    const target = overlay.querySelector('[data-autofocus]') || overlay.querySelector(FOCUSABLE);
    setTimeout(function () { if (target) target.focus({ preventScroll: true }); }, 30);
  }
  function closeOverlay(overlay) {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    const opener = openers.get(overlay);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }
  /* Call once per overlay: Esc closes, Tab stays inside, tapping the scrim closes */
  function wireOverlay(overlay) {
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeOverlay(overlay); return; }
      if (e.key !== 'Tab') return;
      const items = Array.prototype.filter.call(overlay.querySelectorAll(FOCUSABLE), function (n) { return n.offsetParent !== null; });
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay(overlay);
    });
  }

  /* ---------- count-up animation (the daily number reveal) ---------- */
  function countUp(el, to, opts) {
    opts = opts || {};
    const duration = opts.duration || 1400;
    const format = opts.format || function (n) { return String(n); };
    if (reduceMotion()) { el.textContent = format(to); return; }
    const start = performance.now();
    function tick(now) {
      const p = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- page transition: fade out, then go ---------- */
  function navigate(url) {
    if (reduceMotion()) { window.location.href = url; return; }
    document.body.style.transition = 'opacity 160ms ease';
    document.body.style.opacity = '0';
    setTimeout(function () { window.location.href = url; }, 160);
  }

  /* ---------- wiring for common toggles that exist on every page ---------- */
  function initCommon() {
    initTheme();
    initTextSize();
    document.addEventListener('click', function (e) {
      const langBtn = e.target.closest('[data-set-lang]');
      if (langBtn) { TZ.i18n.setLang(langBtn.getAttribute('data-set-lang')); return; }
      const themeBtn = e.target.closest('[data-toggle-theme]');
      if (themeBtn) toggleTheme();
    });
  }

  return {
    setTheme: setTheme, getTheme: getTheme, toggleTheme: toggleTheme,
    setTextSize: setTextSize, getTextSize: getTextSize,
    toast: toast, openOverlay: openOverlay, closeOverlay: closeOverlay, wireOverlay: wireOverlay,
    countUp: countUp, navigate: navigate, reduceMotion: reduceMotion,
    initCommon: initCommon
  };
})();
