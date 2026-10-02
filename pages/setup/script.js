/* Setup — three questions on one page: salary · pay day · fixed payments.
   state.js holds the answers, steps.js questions 1-2, payments.js question 3. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n;
  const S = SU.state;
  const TOTAL = 3;
  let pad = null;

  /* ---------- pieces ---------- */
  function progressBar() {
    return '<div class="su-progress-row"><div class="su-progress" role="progressbar" aria-valuemin="1" aria-valuemax="' + TOTAL +
      '" aria-valuenow="' + S.step + '" aria-labelledby="su-progress-text">' +
      '<div class="su-progress__fill" style="--value:' + Math.round(S.step / TOTAL * 100) + '%"></div></div>' +
      '<span class="su-progress-text" id="su-progress-text" data-i18n="setup.progress"' +
      P.vars({ n: F.num(S.step), total: F.num(TOTAL) }) + '></span></div>';
  }

  function previewHtml() {
    if (!S.salary) return '';
    const r = SU.preview();
    if (r.badMonth || r.daily <= 0) {
      return '<div class="su-preview su-preview--care">' +
        '<span class="su-preview__face" aria-hidden="true">' + IC.mascot('care', 'su-preview__mascot') + '</span>' +
        '<span class="su-preview__body"><span class="su-preview__text" data-i18n="setup.preview.tight"></span></span></div>';
    }
    const value = P.esc(I.t('setup.preview.value', { amount: '\u0001' })).replace('\u0001', F.moneyHtml(r.daily));
    return '<div class="su-preview">' +
      '<span class="su-preview__face" aria-hidden="true">' + IC.mascot('happy', 'su-preview__mascot') + '</span>' +
      '<span class="su-preview__body">' +
        '<span class="su-preview__label" data-i18n="setup.preview.label"></span>' +
        '<span class="su-preview__value">' + value + '</span>' +
        (S.step === 3 && S.items.length ? '<span class="su-preview__kept" data-i18n="setup.preview.kept"></span>' : '') +
      '</span></div>';
  }

  function mainButton() {
    if (S.step === 3 && !S.items.length) {
      return '<button type="button" class="btn btn--secondary btn--block" data-finish data-i18n="common.skip"></button>';
    }
    if (S.step === 3) {
      return '<button type="button" class="btn btn--primary btn--block" data-finish>' + IC.icon('sparkle') +
        '<span data-i18n="setup.finish"></span></button>';
    }
    const off = S.step === 1 && !S.salary;
    return '<button type="button" class="btn btn--primary btn--block' + (off ? ' is-disabled' : '') + '" data-next' +
      (off ? ' aria-disabled="true"' : '') + '><span data-i18n="common.continue"></span>' + IC.icon('arrow', { dir: true }) + '</button>';
  }

  function stepHtml() {
    if (S.step === 1) return SU.steps.salaryHtml();
    if (S.step === 2) return SU.steps.dayHtml();
    return SU.pay.html();
  }

  /* ---------- drawing ---------- */
  function drawPreview() {
    const box = document.getElementById('su-preview');
    if (!box) return;
    const wasEmpty = !box.firstElementChild;
    box.innerHTML = previewHtml();
    if (wasEmpty && box.firstElementChild) box.firstElementChild.classList.add('su-preview--enter');
    I.apply(box);
    const btn = document.querySelector('[data-next]');
    if (btn && S.step === 1) {
      btn.classList.toggle('is-disabled', !S.salary);
      if (S.salary) btn.removeAttribute('aria-disabled'); else btn.setAttribute('aria-disabled', 'true');
    }
  }

  function drawFoot() {
    const foot = document.getElementById('su-foot');
    foot.innerHTML = '<div id="su-preview" class="su-preview-slot" aria-live="polite"></div>' + mainButton();
    I.apply(foot);
    drawPreview();
  }

  function drawBody(dir) {
    const main = document.getElementById('su-main');
    const keep = dir ? 0 : main.scrollTop;
    main.innerHTML = '<div class="screen su-step' + (dir ? ' su-step--' + dir : '') + '" id="su-body">' + stepHtml() + '</div>';
    const body = document.getElementById('su-body');
    I.apply(body);
    pad = null;
    if (S.step === 1) pad = SU.steps.mountSalary(body, drawPreview);
    if (S.step === 2) SU.steps.mountDay(body, drawPreview);
    if (S.step === 3) SU.pay.mount(body);
    main.scrollTop = keep;
  }

  function drawProgress() {
    const bar = document.querySelector('.su-progress');
    bar.setAttribute('aria-valuenow', S.step);
    bar.firstChild.style.setProperty('--value', Math.round(S.step / TOTAL * 100) + '%');
    const txt = document.getElementById('su-progress-text');
    txt.setAttribute('data-i18n-vars', JSON.stringify({ n: F.num(S.step), total: F.num(TOTAL) }));
    I.apply(txt.parentNode);
  }

  function render() {
    document.getElementById('app').innerHTML =
      P.header({ back: 'welcome' }) +
      progressBar() +
      '<main class="phone__scroll su-main" id="su-main"></main>' +
      '<div class="page-foot su-foot" id="su-foot"></div>';
    drawBody(null);
    drawFoot();
    syncDemo();
  }

  /* ---------- moving between questions ---------- */
  function go(step, dir) {
    S.step = step;
    try { history.replaceState(null, '', '#step' + step); } catch (e) {}
    syncDemo();
    drawProgress();
    drawBody(dir);
    drawFoot();
    const q = document.getElementById('su-q');
    if (q) setTimeout(function () { q.focus({ preventScroll: true }); }, 0);
  }

  function next() {
    if (S.step === 1 && !S.salary) {
      S.showZero = true;
      if (pad) { pad.render(); pad.focus(); }
      return;
    }
    go(S.step + 1, 'fwd');
  }

  function finish() {
    SU.save();
    P.go('reveal');
  }

  function footToast(msg) {
    const t = TZ.ui.toast(document.querySelector('.phone'), { message: msg });
    const foot = document.getElementById('su-foot');
    if (foot) t.el.style.bottom = (foot.offsetHeight + 12) + 'px';
  }

  /* Called by payments.js after an add / edit / remove */
  SU.refresh = function (opts) {
    opts = opts || {};
    drawBody(null);
    drawFoot();
    setTimeout(function () {
      let el = null;
      if (opts.focusRow) el = document.querySelector('[data-item="' + opts.focusRow + '"] [data-edit]');
      if (opts.focusAdd) el = document.getElementById('su-add');
      if (el) el.focus();
    }, 60);
  };

  /* ---------- events (bound once; the markup is redrawn) ---------- */
  document.addEventListener('click', function (e) {
    const app = document.getElementById('app');
    if (!app.contains(e.target)) return;
    const back = e.target.closest('.appbar a.appbar__btn');
    if (back && S.step > 1) { e.preventDefault(); go(S.step - 1, 'back'); return; }
    if (e.target.closest('[data-next]')) { next(); return; }
    if (e.target.closest('[data-finish]')) { finish(); return; }
    if (e.target.closest('[data-example]')) {
      SU.useExample();
      if (pad) pad.set(S.salary);
      drawPreview();
      footToast(I.t('setup.exampleDone'));
    }
  });

  /* Typing digits anywhere on question 1 fills the keypad */
  document.addEventListener('keydown', function (e) {
    if (S.step !== 1 || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('#su-pad, input, textarea, .overlay.is-open')) return;
    if (document.querySelector('.overlay.is-open')) return;
    let k = /^[0-9]$/.test(e.key) ? e.key : e.key === 'Backspace' ? 'back' : null;
    const code = e.key.length === 1 ? e.key.charCodeAt(0) : 0;
    if (code >= 0x660 && code <= 0x669) k = String(code - 0x660);   /* Arabic-Indic digit keys */
    const key = k && document.querySelector('#su-pad [data-k="' + k + '"]');
    if (key) { e.preventDefault(); key.click(); }
  });

  /* ---------- review states ---------- */
  function applyDemo(id) {
    SU.reset();
    if (id === 'step3-filled') SU.useExample();
    else if (id !== 'step1') S.salary = TZ.data.SAMPLE.salary;
    S.step = id === 'step1' ? 1 : id === 'step2' ? 2 : 3;
  }
  function syncDemo() {
    const id = (location.hash || '').replace('#', '');
    document.querySelectorAll('.demo-bar__btn').forEach(function (b) {
      b.setAttribute('aria-checked', b.getAttribute('data-demo') === id || (!id && b.getAttribute('data-demo') === 'step1'));
    });
  }
  const demo = P.demoBar([
    { id: 'step1', labelKey: 'setup.demo.step1' },
    { id: 'step2', labelKey: 'setup.demo.step2' },
    { id: 'step3', labelKey: 'setup.demo.step3' },
    { id: 'step3-filled', labelKey: 'setup.demo.step3Filled' }
  ], function (id) { applyDemo(id); render(); I.apply(document); });
  applyDemo(demo.get());

  P.boot({ titleKey: 'setup.title', render: render });
})();
