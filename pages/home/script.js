/* Home — the main screen. The daily number first; everything else is quiet.
   Design states (demo bar): good · careful · tight · check (after a money check) ·
   over (spent more than planned: choices sheet) · ranout (ran out before salary).
   Only the real "good" state saves changes; the others work on a copy. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data, V = TZ.homeView, OS = TZ.overspend;

  let state = 'good';
  let d = D.get();
  let r = D.calculate(d);
  if (TZ.speak) TZ.speak.register('home', function () { return TZ.speak.daily(r); });

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function phone() { return document.querySelector('.phone'); }

  /* ---------- demo states ---------- */
  /* careful / tight: lower "money I can use" so the daily number lands at
     65% / 40% of a normal day. Never below zero, never a red alarm. */
  function build(id) {
    const base = D.get();
    if (id === 'good') return base;
    const copy = clone(base);
    copy.moneyCheck = null;
    copy.adjust = 0;
    if (id === 'over' || id === 'ranout') return copy;   // the money check is entered in pick()
    const plain = D.calculate(copy);
    if (id === 'check') {
      copy.moneyCheck = { date: copy.today, amount: Math.round(plain.plan * 0.9 / 100) * 100 };
      return copy;
    }
    const target = Math.floor(plain.normalDaily * (id === 'careful' ? 0.65 : 0.4));
    copy.adjust = Math.max(0, target) * plain.daysLeft - plain.plan;
    return copy;
  }
  function persist() { if (state === 'good') D.save(d); }
  function recalc() { r = D.calculate(d); }

  /* ---------- render ---------- */
  function tipFor() {
    if (d.moneyCheck && d.moneyCheck.date === d.today) return ['check', 'happy'];
    return { good: ['good', 'happy'], careful: ['careful', 'calm'], tight: ['tight', 'care'] }[r.status];
  }

  function render() {
    const tip = tipFor();
    document.getElementById('app').innerHTML =
      P.header({ settings: true, start: '<span class="hm-brand">' + TZ.icons.logo() + '<span class="hm-brand__name" data-i18n="brand.name"></span></span>' }) +
      '<main class="phone__scroll"><div class="screen hm">' +
        V.greeting(d) +
        V.hero(d, r) +
        V.actions() +
        V.monthLink() +
        V.upcoming(d) +
        V.owed(d) +
        V.season(d) +
        V.tip(tip[0], tip[1]) +
      '</div></main>' +
      P.tabbar('home');
  }
  /* keep open sheets and toasts (made by shared helpers) while the screen is redrawn */
  function rerender() {
    const keep = Array.prototype.slice.call(phone().querySelectorAll(':scope > [data-keep], :scope > .toast'));
    keep.forEach(function (n) { n.remove(); });
    recalc(); render();
    keep.forEach(function (n) { phone().appendChild(n); });
    I.apply(document); P.wire(document);
  }

  function pulseNumber() {
    const el = document.querySelector('[data-daily]');
    if (!el || TZ.ui.reduceMotion()) return;
    el.classList.remove('is-new');
    void el.offsetWidth;
    el.classList.add('is-new');
  }

  function changedToast(from, to, onUndo) {
    const msg = from === to
      ? I.t('home.check.same', { to: F.num(to) })
      : I.t('home.check.toast', { from: F.num(from), to: F.num(to) });
    TZ.ui.toast(phone(), { message: msg, undoLabel: I.t('common.undo'), onUndo: onUndo });
  }

  /* ---------- "Update my money" ---------- */
  function openCheck() {
    const sheet = TZ.keypad.sheet({
      titleKey: 'home.check.title',
      labelKey: 'home.check.label',
      extraHtml: '<p class="note">' + IC.icon('info') + '<span data-i18n="home.check.helper"></span></p>',
      afterHtml: '<button type="button" class="btn btn--text btn--block" data-nothing data-i18n="overspend.nothingLeft"></button>',
      check: function (n, lang) {
        return n > d.salary * 2 ? I.t('check.high', { amount: F.money(n, lang) }, lang) : '';
      },
      onSave: function (n) { setTimeout(function () { gotAmount(n); }, 60); }
    });
    sheet.el.querySelector('[data-nothing]').onclick = function () {
      sheet.close();
      setTimeout(function () { gotAmount(0); }, 60);
    };
  }

  /* A money check: as expected or more -> toast; less -> choices sheet; nothing left -> calm plan.
     The check replaces earlier changes this month (adjust = 0). */
  function gotAmount(n) {
    const o = OS.options(d, n);
    const before = clone(d), from = r.daily;
    function undo() { d = before; persist(); rerender(); pulseNumber(); }
    OS.applyCheck(d, n);
    if (!o.more) OS.logEvent(d, 'check', n, from, D.calculate(d).daily);
    persist(); rerender(); pulseNumber();
    if (o.more) { changedToast(from, r.daily, undo); return; }
    if (o.ranOut) { openRanOut(from, undo); return; }
    OS.sheet({
      o: o, returnTo: '[data-update]',
      onDismiss: function () { changedToast(from, r.daily, undo); },
      onChoose: function (choice) {
        if (choice === 'ask') { P.go('ask', '#plan'); return; }
        if (choice === 'savings') { useSavings(o.fromSavings, from, undo); return; }
        changedToast(from, r.daily, undo);
      }
    });
  }

  /* Move money from savings into money I can use (Undo puts everything back) */
  function useSavings(amount, from, undo) {
    const mid = r.daily;
    OS.applySavings(d, amount);
    OS.logEvent(d, 'fromSavings', amount, mid, D.calculate(d).daily);
    persist(); rerender(); pulseNumber();
    const vars = { amount: F.money(amount), from: F.num(from), to: F.num(r.daily) };
    TZ.ui.toast(phone(), {
      message: I.t(from === r.daily ? 'overspend.toastSame' : 'overspend.toastSavings', vars),
      undoLabel: I.t('common.undo'), onUndo: undo
    });
  }

  /* Ran out: the number shows 0; real options to reach salary day (toast reads 0 -> new number) */
  function openRanOut(from, undo) {
    OS.ranOut({
      d: d, returnTo: '[data-update]',
      onClose: function () { changedToast(from, r.daily, undo); },
      onUseSavings: function (opt) { useSavings(opt.amount, r.daily, undo); }
    });
  }

  /* ---------- "Paid" on a coming-up payment (does NOT change the number) ---------- */
  function findItem(ref) {
    const p = ref.split(':');
    const list = p[0] === 'debt' ? d.debts : d.fixed;
    return (list || []).filter(function (x) { return x.id === p[1]; })[0];
  }
  function itemName(ref, item) {
    return ref.indexOf('debt:') === 0 ? I.t('home.upcoming.debtName', { name: D.name(item) }) : D.name(item);
  }
  function markPaid(ref) {
    const item = findItem(ref);
    if (!item) return;
    item.paid = true;
    item.paidOn = d.today;
    persist();
    rerender();
    const row = document.querySelector('[data-row="' + ref + '"]');
    if (row) row.focus({ preventScroll: true });
    TZ.ui.toast(phone(), {
      message: I.t('home.upcoming.toast', { name: itemName(ref, item) }),
      undoLabel: I.t('common.undo'),
      onUndo: function () {
        item.paid = false;
        delete item.paidOn;
        persist();
        rerender();
        const btn = document.querySelector('[data-paid="' + ref + '"]');
        if (btn) btn.focus({ preventScroll: true });
      }
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-update]')) { openCheck(); return; }
    const paid = e.target.closest('[data-paid]');
    if (paid) markPaid(paid.getAttribute('data-paid'));
  });

  /* ---------- start ---------- */
  function pick(id) {
    state = id;
    d = build(id);
    rerender();
    if (id === 'over') { gotAmount(OS.demoAmount(d)); return; }
    if (id === 'ranout') { gotAmount(0); return; }
    if (id === 'check') {
      const plainDaily = D.calculate(Object.assign(clone(d), { moneyCheck: null })).daily;
      changedToast(plainDaily, r.daily, function () { d.moneyCheck = null; rerender(); pulseNumber(); });
    }
  }

  P.boot({ titleKey: 'home.title', render: function () { recalc(); render(); } });
  const bar = P.demoBar([
    { id: 'good', labelKey: 'home.demo.good' },
    { id: 'careful', labelKey: 'home.demo.careful' },
    { id: 'tight', labelKey: 'home.demo.tight' },
    { id: 'check', labelKey: 'home.demo.check' },
    { id: 'over', labelKey: 'home.demo.over' },
    { id: 'ranout', labelKey: 'home.demo.ranout' }
  ], pick);
  if (bar.get() !== 'good') pick(bar.get());
})();
