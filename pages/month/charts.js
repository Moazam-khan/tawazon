/* My month — the three charts, drawn as inline SVG (no libraries).
   - The SVG is as wide as its box, so 1 unit = 1 CSS px and text stays at 1rem or more.
   - Layout is worked out in logical x (0 = inline start) and mirrored in Arabic,
     so time runs right-to-left there. text-anchor start/end follow the page direction.
   - Colours are tokens only (classes in style.css). Every chart has role="img" + a summary. */
window.TZ = window.TZ || {};

TZ.monthCharts = (function () {
  'use strict';
  const F = TZ.fmt, I = TZ.i18n, P = TZ.page;
  let canvas = null;

  function box(el) {
    const W = Math.max(240, Math.round(el.clientWidth));
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const rtl = I.dir() === 'rtl';
    return { W: W, fs: fs, rtl: rtl, X: function (x) { return +(rtl ? W - x : x).toFixed(1); } };
  }
  /* Text width, so labels are placed (or dropped) before they can collide */
  function measure(str, fs, weight) {
    canvas = canvas || document.createElement('canvas');
    const g = canvas.getContext('2d');
    g.font = (weight || 400) + ' ' + fs + 'px ' + getComputedStyle(document.body).fontFamily;
    return g.measureText(String(str)).width;
  }
  function text(x, y, str, cls, anchor) {
    return '<text x="' + x + '" y="' + y.toFixed(1) + '" class="' + cls + '" text-anchor="' + (anchor || 'middle') + '">' + P.esc(str) + '</text>';
  }
  function svg(b, h, aria, cls, body) {
    return '<svg class="mo-svg ' + (cls || '') + '" width="' + b.W + '" height="' + Math.ceil(h) + '" viewBox="0 0 ' + b.W + ' ' + Math.ceil(h) +
      '" role="img" aria-label="' + P.esc(aria) + '" focusable="false">' + body + '</svg>';
  }
  /* A column with a 4px rounded top and a square foot on the baseline */
  function column(left, w, top, base) {
    const h = base - top;
    if (h <= 0) return '';
    const r = Math.min(4, h, w / 2);
    return 'M' + left + ',' + base + 'V' + (top + r) + 'Q' + left + ',' + top + ' ' + (left + r) + ',' + top +
      'H' + (left + w - r) + 'Q' + (left + w) + ',' + top + ' ' + (left + w) + ',' + (top + r) + 'V' + base + 'Z';
  }

  /* ---------- 1. the daily number, salary to salary ----------
     o: { points:[{i,v,date}], todayIdx, N (salary day index), normal, salaryDate, mark:{i,tone}, sel, play } */
  function daily(el, o) {
    const b = box(el), fs = b.fs;
    const vals = o.points.map(function (p) { return p.v; });
    const top = fs * 2.4, H = Math.round(fs * 9), base = top + H;
    const max = Math.max.apply(null, vals.concat([o.normal, 1]));
    const domain = max * 1.18;
    const step = niceStep(domain / 3);
    const ticks = [];
    for (let v = 0; v <= domain; v += step) ticks.push(v);
    const gx = Math.ceil(Math.max.apply(null, ticks.map(function (v) { return measure(F.num(v), fs); }))) + 10;
    const x0 = gx, x1 = b.W - 8;
    const x = function (i) { return x0 + i * (x1 - x0) / o.N; };
    const y = function (v) { return base - v / domain * H; };
    const t = o.todayIdx, tv = o.points[o.points.length - 1].v;
    let s = '';

    ticks.forEach(function (v) {
      s += '<line class="mo-grid" x1="' + b.X(x0) + '" x2="' + b.X(x1) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>';
      s += text(b.X(x0 - 8), y(v) + fs * 0.35, F.num(v), 'mo-tick', 'end');
    });

    /* a normal day: dashed reference, labelled at the far end */
    const yn = y(o.normal);
    s += '<line class="mo-normal" x1="' + b.X(x0) + '" x2="' + b.X(x1) + '" y1="' + yn + '" y2="' + yn + '"/>';
    const nLabel = I.t('month.daily.normal', { amount: F.money(o.normal) });
    /* above the dashed line when there is room under the "if nothing changes" line, else below */
    const above = yn - y(o.points[o.points.length - 1].v) > fs * 1.6;
    s += text(b.X(x1), above ? yn - fs * 0.45 : Math.min(yn + fs * 1.25, base - fs * 0.3), nLabel, 'mo-label', 'end');

    /* if nothing changes: today's number held until the day before salary */
    const pe = x(o.N - 1);
    s += '<path class="mo-ahead-area" d="M' + b.X(x(t)) + ',' + y(tv) + 'H' + b.X(pe) + 'V' + base + 'H' + b.X(x(t)) + 'Z"/>';
    s += '<line class="mo-ahead" x1="' + b.X(x(t)) + '" x2="' + b.X(pe) + '" y1="' + y(tv) + '" y2="' + y(tv) + '"/>';

    /* the days so far */
    const pts = o.points.map(function (p) { return b.X(x(p.i)) + ',' + y(p.v).toFixed(1); });
    s += '<path class="mo-area" d="M' + b.X(x(o.points[0].i)) + ',' + base + 'L' + pts.join('L') + 'L' + b.X(x(t)) + ',' + base + 'Z"/>';
    s += '<path class="mo-line" pathLength="1" d="M' + pts.join('L') + '"/>';

    /* salary day: a small sand dot on the baseline */
    s += '<circle class="mo-dot mo-dot--salary" cx="' + b.X(x(o.N)) + '" cy="' + base + '" r="4"/>';

    /* the biggest change, keyed to the sentence under the chart */
    if (o.mark) {
      const mp = o.points.filter(function (p) { return p.i === o.mark.i; })[0];
      if (mp) s += '<circle class="mo-dot mo-dot--' + o.mark.tone + '" cx="' + b.X(x(mp.i)) + '" cy="' + y(mp.v) + '" r="4.5"/>';
    }

    /* the picked day (crosshair) */
    const sp = o.points.filter(function (p) { return p.i === o.sel; })[0];
    if (sp) {
      s += '<line class="mo-cross" x1="' + b.X(x(sp.i)) + '" x2="' + b.X(x(sp.i)) + '" y1="' + y(sp.v) + '" y2="' + base + '"/>';
      if (sp.i !== t) s += '<circle class="mo-dot mo-dot--pick" cx="' + b.X(x(sp.i)) + '" cy="' + y(sp.v) + '" r="5"/>';
    }

    /* today: the strong point and its value */
    s += '<circle class="mo-dot mo-dot--today" cx="' + b.X(x(t)) + '" cy="' + y(tv) + '" r="6"/>';
    const tl = F.money(tv), tw = measure(tl, fs, 700);
    const tx = Math.min(Math.max(x(t), x0 + tw / 2), x1 - tw / 2);
    s += text(b.X(tx), Math.max(fs, y(Math.max(tv, valueNear(o.points, t))) - fs * 0.85), tl, 'mo-value');

    /* time axis: start · Today · salary day (labels that would touch are dropped) */
    const ly = base + fs * 1.45;
    const today = I.t('month.daily.today'), todayW = measure(today, fs, 600);
    const start = F.date(o.points[0].date, 'short'), startW = measure(start, fs);
    const sal = I.t('month.daily.salary', { date: F.date(o.salaryDate, 'short') });
    const salW = measure(sal, fs);
    if (x(o.points[0].i) + startW + 8 < x(t) - todayW / 2) s += text(b.X(x0), ly, start, 'mo-tick', 'start');
    s += text(b.X(Math.max(x(t), x0 + todayW / 2)), ly, today, 'mo-tick mo-tick--strong');
    if (x(t) + todayW / 2 + 8 < x1 - salW) s += text(b.X(x1), ly, sal, 'mo-tick', 'end');

    el.innerHTML = svg(b, base + fs * 2, o.aria, o.play ? 'is-play' : '', s);
    el.__geo = { W: b.W, rtl: b.rtl, x0: x0, x1: x1, N: o.N };
  }
  function valueNear(points, t) {   /* keep today's label clear of the line just before it */
    return points.filter(function (p) { return p.i >= t - 3; }).reduce(function (m, p) { return Math.max(m, p.v); }, 0);
  }
  function niceStep(raw) {
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))));
    const m = [1, 2, 2.5, 5, 10].filter(function (k) { return k * mag >= raw; })[0];
    return m * mag;
  }
  /* pointer x (px inside the chart box) -> day index, mirrored in Arabic */
  function indexAt(el, px) {
    const g = el.__geo;
    if (!g) return null;
    const lx = g.rtl ? g.W - px : px;
    return Math.round((lx - g.x0) / (g.x1 - g.x0) * g.N);
  }

  /* ---------- 2. where the salary goes: one stacked bar ----------
     parts: [{ amount, tone }]  (2px surface gaps, rounded only at the two outer ends) */
  function split(el, parts, whole, aria, play) {
    const b = box(el), h = 24, gap = 2;
    const n = parts.length, room = b.W - gap * (n - 1);
    let at = 0, s = '';
    parts.forEach(function (p, i) {
      const w = Math.max(2, p.amount / whole * room);
      const left = b.rtl ? b.W - at - w : at;
      s += '<rect class="mo-seg mo-tone--' + p.tone + '" x="' + left.toFixed(1) + '" y="0" width="' + w.toFixed(1) + '" height="' + h + '" style="--i:' + i + '"/>';
      at += w + gap;
    });
    const id = 'mo-clip-split';
    const body = '<defs><clipPath id="' + id + '"><rect x="0" y="0" width="' + b.W + '" height="' + h + '" rx="6"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + ')"><g class="mo-split" style="transform-origin:' + b.X(0) + 'px 0">' + s + '</g></g>';
    el.innerHTML = svg(b, h, aria, play ? 'is-play' : '', body);
  }

  /* ---------- 3. saved month by month: paired columns ----------
     months: [{ label, left, saved }]  — left over (lighter) then saved, value on each cap */
  function saved(el, months, aria, play) {
    const b = box(el), fs = b.fs;
    const top = fs * 1.7, H = Math.round(fs * 6.5), base = top + H;
    const max = Math.max.apply(null, months.map(function (m) { return Math.max(m.left, m.saved); }).concat([1]));
    const gw = b.W / months.length, bw = Math.min(24, gw * 0.3), gap = 4;
    const yv = function (v) { return base - v / max * H; };
    /* month names that would touch are staggered onto two rows */
    const wide = months.some(function (m) { return measure(m.label, fs) > gw - 8; });
    let s = '<line class="mo-base" x1="0" x2="' + b.W + '" y1="' + base + '" y2="' + base + '"/>';
    months.forEach(function (m, i) {
      const c = gw * i + gw / 2;
      const bars = [{ v: m.left, cls: 'mo-tone--left', l: c - gap / 2 - bw }, { v: m.saved, cls: 'mo-tone--saved', l: c + gap / 2 }];
      bars.forEach(function (bar, k) {
        const left = b.rtl ? b.W - bar.l - bw : bar.l;
        s += '<path class="mo-bar ' + bar.cls + '" style="--i:' + (i * 2 + k) + ';transform-origin:0 ' + base + 'px" d="' + column(+left.toFixed(1), +bw.toFixed(1), yv(bar.v), base) + '"/>';
      });
      s += labels(b, bars, bw, yv, fs);
      s += text(b.X(c), base + fs * (wide && i % 2 ? 2.6 : 1.4), m.label, 'mo-tick');
    });
    el.innerHTML = svg(b, base + fs * (wide ? 3.2 : 2), aria, play ? 'is-play' : '', s);
  }
  /* One label when the pair is equal; otherwise one per cap, lifted if they would touch */
  function labels(b, bars, bw, yv, fs) {
    const a = bars[0], z = bars[1];
    if (a.v === z.v) return text(b.X((a.l + z.l + bw) / 2), yv(a.v) - fs * 0.45, F.num(a.v), 'mo-value');
    const wa = measure(F.num(a.v), fs, 600), wz = measure(F.num(z.v), fs, 600);
    let ya = yv(a.v) - fs * 0.45, yz = yv(z.v) - fs * 0.45;
    const touch = (wa + wz) / 2 + 4 > (z.l - a.l) && Math.abs(ya - yz) < fs * 1.1;
    if (touch) { if (a.v > z.v) ya = yz - fs * 1.1; else yz = ya - fs * 1.1; }
    return text(b.X(a.l + bw / 2), ya, F.num(a.v), 'mo-value') + text(b.X(z.l + bw / 2), yz, F.num(z.v), 'mo-value');
  }

  return { daily: daily, indexAt: indexAt, split: split, saved: saved };
})();
