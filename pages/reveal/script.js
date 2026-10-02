/* Reveal — the "aha" moment right after setup.
   1. A short, calm build-up: three lines tick to a check (~1.5s, skipped with reduced motion).
   2. The daily number counts up, with status, days left and the mascot celebrating.
   Design states: play (the full sequence) · math (paused build-up) · result. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n;
  const d = TZ.data.get();
  const r = TZ.data.calculate(d);
  /* Read aloud: the number as a sentence, then the same calm line the screen shows */
  if (TZ.speak) TZ.speak.register('reveal', function () {
    return TZ.speak.daily(r) + ' ' + I.t(r.daily === 0 ? 'reveal.zero' : 'reveal.same');
  });

  let phase = 'math';     // math | result
  let ticked = 0;         // how many build-up lines show a check (0..3)
  let counted = false;    // the count-up has played once
  let announced = false;  // the screen reader heard the number once
  let timers = [];

  /* One live region outside the phone, so re-renders never re-announce */
  const live = document.createElement('p');
  live.className = 'sr-only';
  live.setAttribute('aria-live', 'polite');
  document.body.appendChild(live);

  /* ---------- build-up ---------- */
  function mathLines() {
    const lines = [
      ['moneyIn', 'reveal.stepSalary', F.moneyHtml(d.salary)],
      ['jar', 'reveal.stepSetAside', F.moneyHtml(r.setAside)],
      ['calendar', 'reveal.stepDays', '<bdi class="num">' + F.num(r.daysLeft) + '</bdi>']
    ];
    return '<ul class="rv-lines">' + lines.map(function (l, i) {
      const done = i < ticked;
      return '<li class="rv-line' + (done ? ' is-done' : '') + '">' +
        '<span class="rv-line__icon">' + IC.icon(l[0]) + '</span>' +
        '<span class="rv-line__text" data-i18n="' + l[1] + '"></span>' +
        '<span class="rv-line__val">' + (done ? l[2] : '') + '</span>' +
        '<span class="rv-line__mark" aria-hidden="true">' + (done ? IC.icon('check') : '<i class="rv-dot"></i>') + '</span>' +
      '</li>';
    }).join('') + '</ul>';
  }

  function mathView() {
    return '<div class="screen rv-screen rv-screen--math">' +
      '<div class="rv-math">' +
        IC.mascot('think', 'mascot--lg rv-think', I.t('brand.short')) +
        '<h1 class="t-title" data-i18n="reveal.math"></h1>' +
        '<p class="lead" data-i18n="reveal.mathSub"></p>' +
      '</div>' +
      mathLines() +
    '</div>';
  }

  /* ---------- the number ---------- */
  function resultView() {
    const zero = r.daily === 0;
    return '<div class="screen rv-screen rv-screen--result">' +
      '<div class="rv-stage">' +
        '<div class="rv-halo" aria-hidden="true"></div>' +
        IC.mascot(zero ? 'care' : 'celebrate', 'mascot--lg rv-mascot', I.t('brand.short')) +
      '</div>' +
      '<h1 class="rv-head">' +
        '<span class="rv-eyebrow" data-i18n="home.canSpendToday"></span>' +
        '<span class="rv-number" aria-hidden="true">' +
          '<bdi class="rv-number__value num" data-count>' + (counted ? F.num(r.daily) : F.num(0)) + '</bdi>' +
          '<span class="rv-number__cur">' + I.currency() + '</span>' +
        '</span>' +
        '<span class="sr-only">' + F.money(r.daily) + '</span>' +
      '</h1>' +
      (TZ.speak ? TZ.speak.button('reveal', { cls: 'rv-speak' }) : '') +
      '<div class="rv-facts">' +
        '<span class="badge badge--' + r.status + '">' + IC.face(r.status) + '<span data-i18n="status.' + r.status + '"></span></span>' +
        '<p class="rv-days">' + IC.icon('calendar') +
          '<span data-i18n="reveal.daysLeft"' + P.vars({ n: F.num(r.daysLeft) }) + '></span></p>' +
      '</div>' +
      (zero
        ? '<div class="note note--careful">' + IC.icon('heart') + '<span data-i18n="reveal.zero"></span></div>'
        : '<p class="rv-same" data-i18n="reveal.same"></p>') +
    '</div>';
  }

  function foot() {
    return '<div class="page-foot rv-foot' + (phase === 'result' ? ' is-shown' : '') + '"' + (phase === 'result' ? '' : ' hidden') + '>' +
      '<a class="btn btn--primary btn--block" href="' + P.url('paywall') + '" data-go="paywall">' +
        '<span data-i18n="common.continue"></span>' + IC.icon('arrow', { dir: true }) + '</a>' +
      '<a class="btn btn--text btn--block" href="' + P.url('how-calculated') + '" data-go="how-calculated">' +
        IC.icon('question') + '<span data-i18n="reveal.how"></span></a>' +
    '</div>';
  }

  function render() {
    document.getElementById('app').innerHTML =
      P.header({ back: null }) +
      '<main class="phone__scroll" aria-busy="' + (phase === 'math') + '">' + (phase === 'math' ? mathView() : resultView()) + '</main>' +
      foot();
    if (phase === 'result') afterResult();
  }

  function afterResult() {
    const el = document.querySelector('[data-count]');
    if (!counted) {
      counted = true;
      /* clamp: the first animation frame can land before countUp's start time */
      TZ.ui.countUp(el, r.daily, { format: function (n) { return F.num(Math.max(0, n)); }, duration: 1300 });
    }
    if (!announced) {
      announced = true;
      setTimeout(function () { live.textContent = I.t('reveal.live', { amount: F.money(r.daily) }); }, 400);
    }
  }

  /* ---------- sequence ---------- */
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function rerender() { render(); I.apply(document); }
  /* Only the lines change while counting, so nothing else re-animates */
  function tick() {
    const ul = document.querySelector('.rv-lines');
    if (!ul) { rerender(); return; }
    ul.outerHTML = mathLines();
    I.apply(document.querySelector('.rv-screen'));
  }

  function play() {
    clear();
    phase = 'math'; ticked = 0; counted = false; announced = false; live.textContent = '';
    if (TZ.ui.reduceMotion()) { phase = 'result'; ticked = 3; rerender(); return; }
    rerender();
    [380, 760, 1140].forEach(function (ms, i) { later(function () { ticked = i + 1; tick(); }, ms); });
    later(function () { phase = 'result'; rerender(); }, 1550);
  }

  function show(id) {
    clear();
    if (id === 'math') { phase = 'math'; ticked = 2; rerender(); return; }
    if (id === 'result') { phase = 'result'; ticked = 3; counted = true; announced = false; rerender(); return; }
    play();
  }

  document.addEventListener('click', function (e) {
    const a = e.target.closest('[data-go]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    P.go(a.getAttribute('data-go'));
  });

  P.boot({ titleKey: 'reveal.title', render: render });
  const bar = P.demoBar([
    { id: 'play', labelKey: 'reveal.demo.play' },
    { id: 'math', labelKey: 'reveal.demo.math' },
    { id: 'result', labelKey: 'reveal.demo.result' }
  ], show);
  show(bar.get());
})();
