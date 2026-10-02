/* ==========================================================================
   Tawazon Plus — "spent more than planned" + "ran out before salary"
   Shared by Home (the sheets) and Ask (the plan). Every number comes from
   TZ.data rules; the AI only explains and plans, it never does the maths.

   const o = TZ.overspend.options(d, 3600);   // { extra, before, spread, withSavings, ... }
   TZ.overspend.sheet({ o, onChoose(choice), onDismiss() });     // spread | savings | ask
   TZ.overspend.ranOut({ d, onUseSavings(opt), onClose() });     // full-height calm screen
   TZ.overspend.plan(d)  -> { intro, steps: [html, html, html], outro }
   TZ.overspend.demoCopy(d) -> working copy after a sample money check (design states)
   Strings: overspend.* (assets/lang/_parts/overspend.*.js)
   ========================================================================== */
window.TZ = window.TZ || {};

TZ.overspend = (function () {
  'use strict';
  const D = TZ.data, F = TZ.fmt, IC = TZ.icons, P = TZ.page;
  const I = function () { return TZ.i18n; };
  const t = function (k, v) { return I().t(k, v); };

  /* ---------- maths (rules from TZ.data only) ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function dailyWith(d, changes) { return D.calculate(Object.assign(clone(d), changes)).daily; }
  /* daily number if `extraIn` more riyals reached money I can use */
  function dailyPlus(d, extraIn) { return dailyWith(d, { adjust: (d.adjust || 0) + extraIn }); }
  function check(d, n, adjust) { return { moneyCheck: { date: d.today, amount: n }, adjust: adjust || 0 }; }

  /* What each choice gives, for a money check of n (computed BEFORE the check is applied).
     The check resets earlier changes this month (adjust = 0), like Home does. */
  function options(d, n) {
    const o = D.overspend(d, n);
    const spread = dailyWith(d, check(d, n, 0));
    return {
      haveNow: n, expected: o.expected, extra: o.extra, before: o.before, daysLeft: o.daysLeft,
      nextSalary: D.calculate(d).nextSalary,
      spread: spread,
      savings: (d.savings && d.savings.total) || 0,
      fromSavings: o.fromSavings, savingsAfter: o.savingsAfter,
      withSavings: dailyWith(d, check(d, n, o.fromSavings)),
      partial: o.fromSavings < o.extra,
      ranOut: o.ranOut || spread === 0,
      more: n >= o.expected
    };
  }

  /* Apply a money check / move money from savings into money I can use */
  function applyCheck(d, n) { d.moneyCheck = { date: d.today, amount: n }; d.adjust = 0; }
  function applySavings(d, x) {
    d.savings.total = Math.max(0, d.savings.total - x);
    d.adjust = (d.adjust || 0) + x;
  }
  /* A line for "Why did my number change?" (newest first) */
  function logEvent(d, type, amount, from, to) {
    (d.events = d.events || []).unshift({ date: d.today, type: type, amount: amount, from: from, to: to });
  }

  /* Design states: a money check of about 90% of what was expected (sample: 4,000 -> 3,600) */
  function demoAmount(d) { return Math.round(D.overspend(d, 0).expected * 0.9 / 100) * 100; }
  function demoCopy(d) {
    const c = clone(d);
    c.moneyCheck = null; c.adjust = 0;
    applyCheck(c, demoAmount(c));
    return c;
  }

  /* The biggest payment still to pay before salary (it is already set aside) */
  function dueDate(d, day) {
    const td = D.parse(d.today);
    let dt = new Date(td.getFullYear(), td.getMonth(), day);
    if (dt < td) dt = new Date(td.getFullYear(), td.getMonth() + 1, day);
    return D.iso(dt);
  }
  function bigPayment(d) {
    const next = D.calculate(d).nextSalary, items = [];
    (d.fixed || []).forEach(function (f) {
      if (f.every !== 'year' && f.dueDay && !f.paid) items.push({ kind: 'fixed', item: f, name: D.name(f), amount: f.amount, date: dueDate(d, f.dueDay) });
    });
    (d.debts || []).forEach(function (x) {
      if (x.remaining > 0 && !x.paid) {
        items.push({ kind: 'debt', item: x, name: t('home.upcoming.debtName', { name: D.name(x) }),
          amount: Math.min(x.monthly, x.remaining), date: dueDate(d, x.dueDay) });
      }
    });
    return items.filter(function (it) { return it.date < next; })
      .sort(function (a, b) { return (b.amount - a.amount) || (a.date < b.date ? -1 : 1); })[0] || null;
  }
  /* Sample names are plain nouns ("Car loan payment"): lower-case them mid-sentence in English */
  function midName(name, item) { return P.esc(item.nameKey && I().getLang() === 'en' ? name.toLowerCase() : name); }

  /* Ran out: up to 4 real options, each with the daily number it would give */
  function ranOutOptions(d) {
    const list = [];
    const save = (d.savings && d.savings.total) || 0;
    if (save > 0) list.push({ id: 'savings', amount: save, daily: dailyPlus(d, save) });
    const owed = (d.owedToMe || [])[0];
    if (owed) list.push({ id: 'owed', item: owed, amount: owed.amount, daily: dailyPlus(d, owed.amount) });
    const pay = bigPayment(d);
    if (pay) list.push({ id: 'move', pay: pay, amount: pay.amount, daily: dailyPlus(d, pay.amount) });
    list.push({ id: 'ask' });
    return list;
  }

  /* A short plan in 3 numbered steps (Ask). Built from rules + data. */
  function plan(d) {
    const r = D.calculate(d), m = F.moneyHtml;
    const days = t('common.days', { n: F.num(r.daysLeft) });
    const save = (d.savings && d.savings.total) || 0;
    const owed = (d.owedToMe || [])[0], pay = bigPayment(d);
    const steps = [];
    if (r.daily === 0) steps.push(t('overspend.plan.zero', { days: days }));
    else if (d.moneyCheck) {
      const o = D.overspend(d, d.moneyCheck.amount);
      steps.push(o.extra > 0 ? t('overspend.plan.newNumber', { daily: m(r.daily), extra: m(o.extra), days: days })
                             : t('overspend.plan.steady', { daily: m(r.daily) }));
    } else steps.push(t('overspend.plan.update', { daily: m(r.daily) }));
    if (owed) steps.push(t('overspend.plan.owed', { name: P.esc(D.name(owed)), amount: m(owed.amount), daily: m(dailyPlus(d, owed.amount)) }));
    if (r.daily === 0 && save > 0) steps.push(t('overspend.plan.savings', { amount: m(save), daily: m(dailyPlus(d, save)) }));
    else if (r.daily === 0 && pay) steps.push(t('overspend.plan.move', { name: midName(pay.name, pay.item), amount: m(pay.amount), daily: m(dailyPlus(d, pay.amount)) }));
    else if (pay) steps.push(t('overspend.plan.payment', { name: midName(pay.name, pay.item), amount: m(pay.amount), date: '<bdi>' + F.date(pay.date, 'short') + '</bdi>' }));
    return {
      intro: t('overspend.plan.intro', { date: '<bdi>' + F.date(r.nextSalary, 'long') + '</bdi>' }),
      steps: steps.slice(0, 3),
      outro: t('overspend.plan.outro')
    };
  }

  /* ---------- a sheet built in JS (kept across a language switch) ---------- */
  function overlay(cls, build, onDismiss, returnTo) {
    const phone = document.querySelector('.phone');
    const ov = document.createElement('div');
    ov.className = 'overlay os-overlay' + (cls ? ' ' + cls : '');
    ov.setAttribute('data-keep', '');
    ov.setAttribute('aria-hidden', 'true');
    phone.appendChild(ov);
    let closed = false;
    function draw() {
      const f = document.activeElement, key = f && ov.contains(f) ? f.getAttribute('data-os-key') : null;
      ov.innerHTML = build();
      I().apply(ov);
      const again = key && ov.querySelector('[data-os-key="' + key + '"]');
      if (again) again.focus({ preventScroll: true });
    }
    function close(silent) {
      if (closed) return;
      closed = true;
      TZ.ui.closeOverlay(ov);
      document.removeEventListener('tz:langchange', draw);
      setTimeout(function () { ov.remove(); }, 450);
      /* the opener may have been redrawn meanwhile: send focus somewhere sensible */
      setTimeout(function () {
        const a = document.activeElement;
        if ((!a || a === document.body || !a.isConnected || ov.contains(a)) && returnTo) {
          const el = document.querySelector(returnTo);
          if (el) el.focus({ preventScroll: true });
        }
      }, 60);
      if (!silent && onDismiss) onDismiss();
    }
    draw();
    TZ.ui.wireOverlay(ov);
    ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-os-close]')) close(); });
    document.addEventListener('tz:langchange', draw);
    const opener = document.activeElement;
    requestAnimationFrame(function () { TZ.ui.openOverlay(ov, opener); });
    return { el: ov, close: close, draw: draw };
  }

  function closeBtn() {
    return '<button type="button" class="os-x" data-os-close data-os-key="x" aria-label="' + P.esc(t('common.close')) + '">' + IC.icon('close') + '</button>';
  }
  function head(mood, id, titleHtml, subKey) {
    return '<div class="os-head">' + IC.mascot(mood, 'os-mascot', t('brand.short')) +
      '<h2 class="os-title" id="' + id + '-t" tabindex="-1" data-autofocus data-os-key="title">' + titleHtml + '</h2>' +
      '<p class="os-sub" id="' + id + '-s">' + t(subKey) + '</p></div>';
  }

  /* ---------- 1. Spent more than planned: three choices ---------- */
  function sheet(opts) {
    const o = opts.o;
    let pick = 'spread';
    function choice(id, icon, sand, title, lines, tag) {
      return '<label class="os-choice">' +
        '<span class="row__icon' + (sand ? ' row__icon--sand' : '') + '">' + IC.icon(icon) + '</span>' +
        '<span class="os-choice__body">' +
          (tag ? '<span class="os-tag">' + IC.icon('star') + t('overspend.recommended') + '</span>' : '') +
          '<span class="os-choice__title">' + title + '</span>' + lines + '</span>' +
        '<input class="os-radio" type="radio" name="os-pick" value="' + id + '" data-os-key="r-' + id + '"' + (pick === id ? ' checked' : '') + '>' +
      '</label>';
    }
    function result(html) { return '<span class="os-result">' + html + '</span>'; }
    function line(html) { return '<span class="os-line">' + html + '</span>'; }
    function build() {
      const m = F.moneyHtml;
      const savingsLines = (o.partial
        ? result(t('overspend.perDay', { amount: m(o.withSavings) })) + line(t('overspend.savings.part', { amount: m(o.fromSavings) }))
        : result(t('overspend.savings.stay', { amount: m(o.withSavings) }))) +
        line(t('overspend.savings.after', { from: m(o.savings), to: m(o.savingsAfter) }));
      const btn = { spread: 'overspend.spread.btn', savings: 'overspend.savings.btn', ask: 'overspend.ask.btn' }[pick];
      return '<div class="sheet os-sheet" role="dialog" aria-modal="true" aria-labelledby="os-t" aria-describedby="os-s">' +
        '<div class="sheet__handle"></div>' + closeBtn() +
        head('calm', 'os', t('overspend.title', { amount: m(o.extra) }), 'overspend.sub') +
        '<fieldset class="os-choices"><legend class="sr-only">' + t('overspend.legend') + '</legend>' +
          choice('spread', 'calendar', false, t('overspend.spread.title', { days: t('common.days', { n: F.num(o.daysLeft) }) }),
            result(t('overspend.perDay', { amount: m(o.spread) })) +
            line(t('overspend.spread.sub', { date: '<bdi>' + F.date(o.nextSalary, 'short') + '</bdi>' })), true) +
          (o.savings > 0 ? choice('savings', 'jar', true, t(o.partial ? 'overspend.savings.titlePart' : 'overspend.savings.title'), savingsLines) : '') +
          choice('ask', 'chat', false, t('overspend.ask.title'), line(t('overspend.ask.sub'))) +
        '</fieldset>' +
        '<button type="button" class="btn btn--primary btn--block os-go" data-os-go data-os-key="go">' +
          IC.icon(pick === 'ask' ? 'sparkle' : 'check') + '<span>' + t(btn) + '</span></button>' +
      '</div>';
    }
    const s = overlay('', build, opts.onDismiss, opts.returnTo);
    s.el.addEventListener('change', function (e) {
      if (e.target.name !== 'os-pick') return;
      pick = e.target.value;
      const go = s.el.querySelector('[data-os-go]');
      go.innerHTML = IC.icon(pick === 'ask' ? 'sparkle' : 'check') + '<span>' + t({ spread: 'overspend.spread.btn', savings: 'overspend.savings.btn', ask: 'overspend.ask.btn' }[pick]) + '</span>';
    });
    s.el.addEventListener('click', function (e) {
      if (!e.target.closest('[data-os-go]')) return;
      s.close(true);
      if (opts.onChoose) opts.onChoose(pick);
    });
    return s;
  }

  /* ---------- 2. Ran out before salary: calm full-height screen ---------- */
  function ranOut(opts) {
    function row(opt) {
      const m = F.moneyHtml;
      const then = function (n) { return '<span class="os-result os-result--sm">' + t('overspend.ranout.then', { amount: m(n) }) + '</span>'; };
      const body = function (icon, sand, title, sub, extra) {
        return '<span class="row__icon' + (sand ? ' row__icon--sand' : '') + '">' + IC.icon(icon) + '</span>' +
          '<span class="row__body"><span class="row__title">' + title + '</span><span class="row__sub">' + sub + '</span>' + (extra || '') + '</span>' +
          IC.icon('chevron', { dir: true, cls: 'row__chev' });
      };
      if (opt.id === 'savings') {
        return '<button type="button" class="row os-help" data-os-use data-os-key="use">' +
          body('jar', true, t('overspend.ranout.savingsTitle'), t('overspend.ranout.savingsSub', { amount: m(opt.amount) }),
            '<span class="os-result os-result--sm">' + t('overspend.perDay', { amount: m(opt.daily) }) + '</span>') + '</button>';
      }
      if (opt.id === 'owed') {
        return '<a class="row os-help" href="' + P.url('my-money') + '#owed" data-os-key="owed">' +
          body('moneyIn', true, t('overspend.ranout.owedTitle', { name: P.esc(D.name(opt.item)), amount: m(opt.amount) }),
            t('overspend.ranout.owedSub'), then(opt.daily)) + '</a>';
      }
      if (opt.id === 'move') {
        return '<a class="row os-help" href="' + P.url('my-money') + (opt.pay.kind === 'debt' ? '#owe' : '#fixed') + '" data-os-key="move">' +
          body(opt.pay.item.preset || (opt.pay.kind === 'debt' ? 'debt' : 'bills'), false,
            t('overspend.ranout.moveTitle', { name: midName(opt.pay.name, opt.pay.item) }),
            t('overspend.ranout.moveSub', { amount: m(opt.amount), date: '<bdi>' + F.date(opt.pay.date, 'short') + '</bdi>' }), then(opt.daily)) + '</a>';
      }
      return '<a class="row os-help" href="' + P.url('ask') + '#plan" data-os-key="ask">' +
        body('chat', false, t('overspend.ranout.askTitle'), t('overspend.ranout.askSub')) + '</a>';
    }
    function build() {
      const d = opts.d, r = D.calculate(d);
      return '<div class="sheet os-sheet os-full" role="dialog" aria-modal="true" aria-labelledby="ro-t" aria-describedby="ro-s">' +
        closeBtn() +
        head('calm', 'ro', t('overspend.ranout.title'), 'overspend.ranout.sub') +
        '<div class="os-zero">' +
          '<p class="os-zero__k">' + t('home.canSpendToday') + '</p>' +
          '<p class="os-zero__num"><bdi class="num">' + F.num(r.daily) + '</bdi><span>' + I().currency() + '</span></p>' +
          '<p class="os-zero__days">' + IC.icon('calendar') + '<span>' + t('home.daysUntil', { n: F.num(r.daysLeft) }) + '</span></p>' +
          '<p class="os-zero__note">' + t('overspend.ranout.zero') + '</p>' +
        '</div>' +
        '<h3 class="section-title os-help-title">' + t('overspend.ranout.help') + '</h3>' +
        '<ul class="list os-helps">' + ranOutOptions(d).map(function (x) { return '<li>' + row(x) + '</li>'; }).join('') + '</ul>' +
        '<button type="button" class="btn btn--secondary btn--block" data-os-close data-os-key="back">' + t('overspend.ranout.back') + '</button>' +
      '</div>';
    }
    const s = overlay('os-overlay--full', build, opts.onClose, opts.returnTo);
    s.el.addEventListener('click', function (e) {
      if (!e.target.closest('[data-os-use]')) return;
      const opt = ranOutOptions(opts.d).filter(function (x) { return x.id === 'savings'; })[0];
      s.close(true);
      if (opt && opts.onUseSavings) opts.onUseSavings(opt);
    });
    return s;
  }

  return {
    options: options, ranOutOptions: ranOutOptions, plan: plan, bigPayment: bigPayment,
    applyCheck: applyCheck, applySavings: applySavings, logEvent: logEvent,
    demoAmount: demoAmount, demoCopy: demoCopy, dailyPlus: dailyPlus,
    sheet: sheet, ranOut: ranOut
  };
})();
