/* My month — a calm look at this month, in pictures. Read-only: nothing here changes the number.
   1 summary · 2 daily number chart · 3 where the salary goes · 4 days until salary ·
   5 saved month by month · 6 a note. Every number comes from TZ.data; charts are in charts.js. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data, C = TZ.monthCharts;
  const DAY = 86400000;
  const d = D.get();
  const r = D.calculate(d);
  const per = D.period(d.today, d.salaryDay);

  let played = false;      // draw-in animation only the first time
  let openDay = null;      // calendar day whose detail is showing
  const dayIdx = function (iso) { return Math.round((D.parse(iso) - D.parse(per.prev)) / DAY); };

  /* ---------- data for the daily chart (today's point is always the live number) ---------- */
  const points = (d.dailyHistory || []).filter(function (h) { return h.date >= per.prev && h.date < d.today; })
    .map(function (h) { return { i: dayIdx(h.date), v: h.daily, date: h.date }; })
    .concat([{ i: r.dayOfPeriod - 1, v: r.daily, date: d.today }]);
  let sel = points[points.length - 1].i;

  /* The biggest day-to-day change, explained by an event when one matches */
  function biggestChange() {
    let best = null;
    for (let k = 1; k < points.length; k++) {
      const diff = points[k].v - points[k - 1].v;
      if (!diff) continue;
      const ev = (d.events || []).filter(function (e) { return e.date === points[k].date && e.from !== e.to; })[0];
      const score = Math.abs(diff) + (ev ? 1e6 : 0);
      if (!best || score > best.score) best = { score: score, p: points[k], from: points[k - 1].v, diff: diff, ev: ev };
    }
    return best;
  }
  function changeSentence(c) {
    if (!c) return I.t('month.daily.flat');
    const e = c.ev;
    const why = e && e.type === 'received' ? I.t('month.daily.why.received', { name: D.name(e), amount: F.money(e.amount) })
      : e && e.type === 'savings' ? I.t('month.daily.why.savings', { amount: F.money(e.amount) })
      : I.t('month.daily.why.other', { from: F.money(c.from), to: F.money(c.p.v) });
    return I.t(c.diff > 0 ? 'month.daily.up' : 'month.daily.down', { date: F.date(c.p.date, 'short'), why: why });
  }
  const tone = function (c) { return c && c.ev && /received|savings/.test(c.ev.type) ? 'sand' : 'teal'; };

  /* ---------- 1. summary ---------- */
  function summary() {
    const pct = Math.round(r.dayOfPeriod / r.periodDays * 100);
    return '<section class="card card--hero mo-hero" aria-labelledby="mo-hero-label">' +
      '<div class="mo-hero__top">' +
        '<div class="mo-hero__num"><p class="card__eyebrow" id="mo-hero-label" data-i18n="home.canSpendToday"></p>' +
          '<p class="mo-hero__value"><bdi class="num">' + F.num(r.daily) + '</bdi> <span class="mo-hero__cur">' + I.currency() + '</span></p></div>' +
        '<span class="badge badge--' + r.status + '">' + IC.face(r.status) + '<span data-i18n="status.' + r.status + '"></span></span>' +
      '</div>' +
      '<div class="progress mo-hero__progress" style="--value:' + pct + '%">' +
        '<div class="progress__head"><span data-i18n="month.hero.day"' + P.vars({ day: F.num(r.dayOfPeriod), total: F.num(r.periodDays) }) + '></span>' +
          '<span data-i18n="month.hero.daysLeft"' + P.vars({ n: F.num(r.daysLeft) }) + '></span></div>' +
        '<div class="progress__track" role="progressbar" aria-valuemin="1" aria-valuemax="' + r.periodDays + '" aria-valuenow="' + r.dayOfPeriod + '"' +
          ' data-i18n-aria="progress.day"' + P.vars({ day: F.num(r.dayOfPeriod), total: F.num(r.periodDays) }) + '><div class="progress__fill"></div></div>' +
      '</div></section>';
  }

  /* ---------- 2. the daily number ---------- */
  function readout() {
    const p = points.filter(function (x) { return x.i === sel; })[0];
    const today = p.date === d.today;
    return today ? I.t('month.daily.readoutToday', { amount: F.money(p.v) })
      : I.t('month.daily.readout', { date: F.date(p.date, 'short'), amount: F.money(p.v) });
  }
  function dailySection() {
    const hi = points.reduce(function (a, p) { return p.v > a.v ? p : a; });
    const lo = points.reduce(function (a, p) { return p.v < a.v ? p : a; });
    const ch = biggestChange();
    function fact(key, p) {
      return '<div class="mo-fact"><p class="mo-fact__k" data-i18n="month.daily.' + key + '"></p>' +
        '<p class="mo-fact__v">' + F.moneyHtml(p.v) + '</p>' +
        '<p class="mo-fact__d" data-i18n="month.daily.onDate"' + P.vars({ date: F.date(p.date, 'short') }) + '></p></div>';
    }
    return '<section class="card mo-card" aria-labelledby="mo-daily-title">' +
      '<div class="mo-head"><h2 class="mo-title" id="mo-daily-title" data-i18n="month.daily.title"></h2>' +
        '<p class="mo-sub" data-i18n="month.daily.sub"' + P.vars({ date: F.date(per.prev, 'short') }) + '></p></div>' +
      '<p class="mo-readout" aria-hidden="true" data-readout>' + P.esc(readout()) + '</p>' +
      '<div class="mo-chart"><div data-chart="daily"></div>' +
        '<div class="mo-scrub" role="slider" tabindex="0" data-scrub data-i18n-aria="month.daily.scrub"' +
          ' aria-valuemin="1" aria-valuemax="' + (points[points.length - 1].i + 1) + '"></div></div>' +
      '<ul class="mo-keys" aria-hidden="true">' +
        '<li><i class="mo-key mo-key--line"></i><span data-i18n="month.daily.legend.number"></span></li>' +
        '<li><i class="mo-key mo-key--normal"></i><span data-i18n="month.daily.legend.normal"></span></li>' +
        '<li><i class="mo-key mo-key--ahead"></i><span data-i18n="month.daily.legend.ahead"></span></li></ul>' +
      '<div class="mo-facts">' + fact('highest', hi) + fact('lowest', lo) + '</div>' +
      '<p class="mo-change"><i class="mo-key mo-key--dot mo-key--' + tone(ch) + '"></i><span>' + P.esc(changeSentence(ch)) + '</span></p>' +
    '</section>';
  }
  function drawDaily(play) {
    const el = document.querySelector('[data-chart="daily"]');
    if (!el) return;
    const vals = points.map(function (p) { return p.v; });
    const ch = biggestChange();
    C.daily(el, {
      points: points, todayIdx: points[points.length - 1].i, N: r.periodDays, normal: r.normalDaily,
      salaryDate: r.nextSalary, sel: sel, play: play,
      mark: ch ? { i: ch.p.i, tone: tone(ch) } : null,
      aria: I.t('month.daily.aria', {
        start: F.date(points[0].date, 'short'), first: F.money(points[0].v), high: F.money(Math.max.apply(null, vals)),
        low: F.money(Math.min.apply(null, vals)), today: F.money(r.daily), normal: F.money(r.normalDaily)
      })
    });
    syncScrub();
  }
  function syncScrub() {
    const s = document.querySelector('[data-scrub]');
    if (!s) return;
    const p = points.filter(function (x) { return x.i === sel; })[0];
    s.setAttribute('aria-valuenow', String(p.i + 1));
    s.setAttribute('aria-valuetext', readout());
    document.querySelector('[data-readout]').textContent = readout();
  }
  function pick(i) {
    const ids = points.map(function (p) { return p.i; });
    let best = ids[0];
    ids.forEach(function (k) { if (Math.abs(k - i) < Math.abs(best - i)) best = k; });
    if (best === sel) return;
    sel = best;
    drawDaily(false);
  }

  /* ---------- 3. where the salary goes ---------- */
  function splitParts() {
    const pay = (d.fixed || []).map(function (f) { return { name: D.name(f), amount: D.monthly(f) }; })
      .concat((d.debts || []).filter(function (x) { return x.remaining > 0; }).map(function (x) {
        return { name: I.t('howCalculated.debtName', { name: D.name(x) }), amount: Math.min(x.monthly, x.remaining) };
      }));
    if (pay.length > 3) pay.splice(2, pay.length, { name: I.t('preset.other'), amount: pay.slice(2).reduce(function (s, p) { return s + p.amount; }, 0) });
    const parts = [{ name: I.t('howCalculated.use'), amount: Math.max(0, r.plan), tone: 'use' }]
      .concat(pay.map(function (p, i) { return { name: p.name, amount: p.amount, tone: 'pay' + (i + 1) }; }));
    if (r.seasonsMonthly) parts.push({ name: I.t('month.split.seasons'), amount: r.seasonsMonthly, tone: 'kept' });
    return parts.filter(function (p) { return p.amount > 0; });
  }
  function splitWhole(parts) { return Math.max(d.salary, parts.reduce(function (s, p) { return s + p.amount; }, 0)) || 1; }
  function splitSection() {
    const parts = splitParts(), whole = splitWhole(parts);
    return '<section class="card mo-card" aria-labelledby="mo-split-title">' +
      '<div class="mo-head mo-head--row"><h2 class="mo-title" id="mo-split-title" data-i18n="month.split.title"></h2>' +
        '<p class="mo-sub" data-i18n="month.split.total"' + P.vars({ amount: F.money(d.salary) }) + '></p></div>' +
      '<div data-chart="split"></div>' +
      '<ul class="mo-legend" aria-hidden="true">' + parts.map(function (p) {
        return '<li><i class="mo-sw mo-tone--' + p.tone + '"></i><span class="mo-legend__name">' + P.esc(p.name) + '</span>' +
          '<span class="mo-legend__amt">' + F.moneyHtml(p.amount) + '</span>' +
          '<bdi class="mo-legend__pct num">' + P.esc(I.t('month.split.pct', { n: F.num(Math.round(p.amount / whole * 100)) })) + '</bdi></li>';
      }).join('') + '</ul></section>';
  }
  function drawSplit(play) {
    const el = document.querySelector('[data-chart="split"]');
    if (!el) return;
    const parts = splitParts(), whole = splitWhole(parts);
    const list = parts.map(function (p) { return p.name + ' ' + F.money(p.amount) + ' (' + I.t('month.split.pct', { n: F.num(Math.round(p.amount / whole * 100)) }) + ')'; }).join(', ');
    C.split(el, parts, whole, I.t('month.split.aria', { salary: F.money(d.salary), list: list }), play);
  }

  /* ---------- 5. saved month by month ---------- */
  function monthsShown() {
    const loc = I.getLang() === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB';
    const fmt = new Intl.DateTimeFormat(loc, { month: 'short' });
    return (d.months || []).slice(-5).map(function (m) {
      return { label: fmt.format(D.parse(m.month + '-01')), left: m.leftOver, saved: m.saved };
    });
  }
  function savedSection() {
    const n = monthsShown().length;
    return '<section class="card mo-card" aria-labelledby="mo-saved-title">' +
      '<div class="mo-head"><h2 class="mo-title" id="mo-saved-title" data-i18n="month.saved.title"></h2>' +
        '<p class="mo-sub" data-i18n="month.saved.sub"' + P.vars({ n: F.num(n) }) + '></p></div>' +
      '<ul class="mo-keys" aria-hidden="true">' +
        '<li><i class="mo-sw mo-tone--left"></i><span data-i18n="month.saved.leftOver"></span></li>' +
        '<li><i class="mo-sw mo-tone--saved"></i><span data-i18n="month.saved.saved"></span></li></ul>' +
      '<div data-chart="saved"></div>' +
      '<div class="mo-total"><span class="row__icon row__icon--sand">' + IC.icon('jar') + '</span>' +
        '<span class="mo-total__k" data-i18n="month.saved.total"></span>' +
        '<span class="mo-total__v">' + F.moneyHtml((d.savings && d.savings.total) || 0) + '</span></div>' +
    '</section>';
  }
  function drawSaved(play) {
    const el = document.querySelector('[data-chart="saved"]');
    if (!el) return;
    const months = monthsShown();
    const list = months.map(function (m) { return I.t('month.saved.item', { month: m.label, left: F.money(m.left), saved: F.money(m.saved) }); }).join('. ');
    C.saved(el, months, I.t('month.saved.aria', { list: list, total: F.money((d.savings && d.savings.total) || 0) }), play);
  }

  /* ---------- render ---------- */
  function render() {
    document.getElementById('app').innerHTML =
      P.header({ titleKey: 'month.title', back: 'home' }) +
      '<main class="phone__scroll"><div class="screen mo">' +
        '<p class="lead mo-lead" data-i18n="month.lead"></p>' +
        summary() + dailySection() + splitSection() +
        TZ.monthCalendar.section(d, r, openDay) +
        savedSection() +
        '<p class="note">' + IC.icon('info') + '<span data-i18n="month.note"></span></p>' +
      '</div></main>';
    drawAll(!played && motionOk());
    played = true;
  }
  /* no draw-in with reduced motion, or in screenshots (?capture) */
  function motionOk() { return !TZ.ui.reduceMotion() && !document.documentElement.classList.contains('is-capture'); }
  function drawAll(play) { drawDaily(play); drawSplit(play); drawSaved(play); }

  /* ---------- interactions ---------- */
  document.addEventListener('click', function (e) {
    const day = e.target.closest('[data-calday]');
    if (!day) return;
    const iso = day.getAttribute('data-calday');
    openDay = openDay === iso ? null : iso;
    TZ.monthCalendar.sync(d, openDay);
  });
  function scrubAt(e) {
    const s = e.target.closest('[data-scrub]');
    if (!s) return;
    const rect = s.getBoundingClientRect();
    const zoom = rect.width / s.offsetWidth || 1;
    const i = C.indexAt(document.querySelector('[data-chart="daily"]'), (e.clientX - rect.left) / zoom);
    if (i != null) pick(i);
  }
  document.addEventListener('pointerdown', scrubAt);
  document.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) scrubAt(e); });
  document.addEventListener('keydown', function (e) {
    if (!e.target.closest || !e.target.closest('[data-scrub]')) return;
    const fwd = I.dir() === 'rtl' ? 'ArrowLeft' : 'ArrowRight', back = I.dir() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const ids = points.map(function (p) { return p.i; }), k = ids.indexOf(sel);
    let next = null;
    if (e.key === fwd || e.key === 'ArrowUp') next = ids[Math.min(ids.length - 1, k + 1)];
    else if (e.key === back || e.key === 'ArrowDown') next = ids[Math.max(0, k - 1)];
    else if (e.key === 'Home') next = ids[0];
    else if (e.key === 'End') next = ids[ids.length - 1];
    if (next == null) return;
    e.preventDefault();
    pick(next);
  });
  let resizeT = null;
  window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(function () { drawAll(false); }, 120); });
  /* web fonts change label widths: redraw once they arrive (keep the draw-in if it is still starting) */
  const t0 = Date.now();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawAll(Date.now() - t0 < 400 && motionOk()); });
  P.boot({ titleKey: 'month.title', render: render });
})();
