/* Special moments — first-time tour: 3 tooltips over a home-like screen.
   Skippable, step dots, Esc skips, Tab stays inside the tooltip, focus returns after. */
(function () {
  'use strict';
  const P = TZ.page, I = TZ.i18n, IC = TZ.icons, D = TZ.data, K = TZ.states.kit;
  const STEPS = [
    { target: '[data-tour="number"]', title: 'states.tour.s1Title', text: 'states.tour.s1' },
    { target: '[data-tour="status"]', title: 'states.tour.s2Title', text: 'states.tour.s2' },
    { target: '.tabbar .tab:last-child', title: 'states.tour.s3Title', text: 'states.tour.s3' }
  ];
  let step = 0;          // -1 = finished
  let resizeWired = false;

  function tipHtml() {
    const s = STEPS[step], last = step === STEPS.length - 1;
    return '<div class="st-tour" data-tour-layer>' +
      '<div class="st-tour__hole" aria-hidden="true"></div>' +
      '<div class="st-tour__tip" role="dialog" aria-modal="true" aria-labelledby="st-tour-title" aria-describedby="st-tour-text">' +
        '<p class="st-tour__step"><span class="st-tour__dots" aria-hidden="true">' +
          STEPS.map(function (x, i) { return '<i' + (i === step ? ' class="is-on"' : '') + '></i>'; }).join('') + '</span>' +
          '<span data-i18n="states.tour.step"' + P.vars({ n: TZ.fmt.num(step + 1), total: TZ.fmt.num(STEPS.length) }) + '></span></p>' +
        '<h2 class="st-tour__title" id="st-tour-title" data-i18n="' + s.title + '"></h2>' +
        '<p class="st-tour__text" id="st-tour-text" data-i18n="' + s.text + '"></p>' +
        '<div class="st-tour__actions">' +
          '<button type="button" class="btn btn--text" data-act="tour-skip" data-i18n="states.tour.skip"></button>' +
          '<button type="button" class="btn btn--primary" data-act="tour-next" data-autofocus>' +
            '<span data-i18n="' + (last ? 'states.tour.start' : 'common.next') + '"></span>' +
            (last ? '' : IC.icon('arrow', { dir: true })) + '</button>' +
        '</div>' +
      '</div></div>';
  }

  /* Place the spotlight over the target and the tooltip next to it (logical sides only) */
  function place() {
    const layer = document.querySelector('[data-tour-layer]');
    const phone = document.querySelector('.phone');
    const target = layer && document.querySelector(STEPS[step].target);
    if (!layer || !target) return;
    const pr = phone.getBoundingClientRect(), tr = target.getBoundingClientRect();
    const pad = 6, rtl = I.dir() === 'rtl';
    const top = tr.top - pr.top - phone.clientTop - pad;
    const start = rtl ? pr.right - phone.clientLeft - tr.right - pad : tr.left - pr.left - phone.clientLeft - pad;
    const hole = layer.querySelector('.st-tour__hole');
    hole.style.top = top + 'px';
    hole.style.insetInlineStart = start + 'px';
    hole.style.width = (tr.width + pad * 2) + 'px';
    hole.style.height = (tr.height + pad * 2) + 'px';
    const tip = layer.querySelector('.st-tour__tip');
    const inner = phone.clientHeight;
    if (top + tr.height / 2 < inner / 2) { tip.style.top = (top + tr.height + pad * 2 + 14) + 'px'; tip.style.bottom = ''; }
    else { tip.style.bottom = (inner - top + 14) + 'px'; tip.style.top = ''; }
    tip.classList.toggle('st-tour__tip--up', !(top + tr.height / 2 < inner / 2));
  }

  function trap(e) {
    const tip = document.querySelector('.st-tour__tip');
    if (!tip) return;
    if (e.key === 'Escape') { e.preventDefault(); finish(); return; }
    if (e.key !== 'Tab') return;
    const items = tip.querySelectorAll('button');
    const first = items[0], lastB = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastB.focus(); }
    else if (!e.shiftKey && document.activeElement === lastB) { e.preventDefault(); first.focus(); }
    else if (!tip.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }

  function finish() {
    step = -1;
    TZ.states.rerender();
    const again = document.querySelector('[data-act="tour-again"]');
    if (again) again.focus();
  }

  TZ.states.screens.tour = {
    reset: function () { step = 0; },
    render: function () {
      const d = D.get(), r = D.calculate(d);
      const body = '<main class="phone__scroll"' + (step >= 0 ? ' inert' : '') + '><div class="screen">' +
        (step < 0 ? '<button type="button" class="btn btn--secondary st-again" data-act="tour-again">' + IC.icon('replay') +
          '<span data-i18n="states.tour.replay"></span></button>' : '') +
        K.homeBody(d, r, { tour: true }) + '</div></main>';
      const bar = step >= 0 ? P.tabbar('home').replace('<nav ', '<nav inert ') : P.tabbar('home');
      return body + bar + (step >= 0 ? tipHtml() : '');
    },
    after: function () {
      if (step < 0) return;
      place();
      const next = document.querySelector('[data-act="tour-next"]');
      if (next) next.focus({ preventScroll: true });
      if (!resizeWired) {
        resizeWired = true;
        window.addEventListener('resize', function () { if (step >= 0) place(); });
        document.addEventListener('keydown', function (e) { if (step >= 0 && document.querySelector('[data-tour-layer]')) trap(e); });
      }
    },
    on: function (act, el, rerender) {
      if (act === 'tour-next') { if (step < STEPS.length - 1) { step++; rerender(); } else finish(); }
      else if (act === 'tour-skip') finish();
      else if (act === 'tour-again') { step = 0; rerender(); }
    }
  };
})();
