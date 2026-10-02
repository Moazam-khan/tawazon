/* Debt details — one debt: progress, plan, payment log, "Add a payment", change / remove.
   ?id=car picks the debt (first one if missing). Demo states: #plan · #last · #done      */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons, V = DD;
  const id = new URLSearchParams(location.search).get('id');
  let demo = 'plan', banner = null, removed = null, focusBanner = false;

  /* "last" and "done" are working copies (never saved) */
  function load() {
    const d = TZ.data.get();
    const x = find(d);
    if (x && demo !== 'plan') {
      const last = TZ.data.debtPlan(x, d.today).last;      // the final payment of the plan
      x.remaining = demo === 'done' ? 0 : last;
      if (demo === 'done') x.log.unshift({ date: d.today, amount: last });
    }
    MM.use(d, demo === 'plan');
  }
  function find(d) { return (id ? MM.find(d.debts, id) : d.debts[0]) || null; }
  function debt() { return find(MM.get()); }

  /* How much of this month's planned payment is still to come */
  function plannedLeft(x) {
    const d = MM.get(), from = TZ.data.period(d.today, d.salaryDay).prev;
    const paid = (x.log || []).filter(function (p) { return p.date >= from; }).reduce(function (s, p) { return s + p.amount; }, 0);
    return Math.max(0, Math.min(x.monthly, x.remaining) - paid);
  }

  function body(x) {
    if (removed) return V.message('calm', 'debtDetails.removedTitle', { name: removed.name }, 'debtDetails.removedText',
      '<button type="button" class="btn btn--primary" data-dd="bringBack">' + IC.icon('undo', { dir: true }) + V.t('debtDetails.bringBack') + '</button>' +
      '<a class="btn btn--text" href="' + P.url('my-money') + '#owe">' + V.t('debtDetails.backToMoney') + '</a>');
    if (!x) return V.message('think', 'debtDetails.notFoundTitle', null, 'debtDetails.notFoundText',
      '<a class="btn btn--primary" href="' + P.url('my-money') + '#owe">' + V.t('debtDetails.backToMoney') + '</a>');
    if (x.remaining <= 0) return V.done(x) + V.log(x) + V.manage();
    const plan = TZ.data.debtPlan(x, MM.get().today);
    return (banner ? V.banner(banner) : '') + V.hero(x, plan) + V.facts(x, MM.nextDue(x.dueDay, 0, plannedLeft(x) === 0)) +
      V.finish(plan) + V.log(x) + V.manage();
  }

  function render() {
    const x = removed ? null : debt();
    const live = x && x.remaining > 0 && !removed;
    document.getElementById('app').innerHTML =
      P.header({ titleKey: x ? 'debtDetails.title' : 'debtDetails.docTitle', titleVars: { name: x ? MM.name(x) : '' }, back: 'my-money' }) +
      '<main class="phone__scroll"><div class="screen">' + body(x) + '</div></main>' +
      (live ? '<div class="page-foot"><button type="button" class="btn btn--primary btn--block" data-dd="pay">' + IC.icon('plus') +
        V.t('debtDetails.addPayment') + '</button></div>' : '');
  }

  /* Re-draw but keep a toast or closing sheet that lives in the phone */
  function refresh() {
    const app = document.getElementById('app');
    const keep = Array.prototype.slice.call(app.querySelectorAll('.toast, .overlay'));
    const hadFocus = app.contains(document.activeElement);
    render();
    keep.forEach(function (n) { app.appendChild(n); });
    I.apply(app);
    const b = app.querySelector('[data-banner]');
    if (focusBanner && b) { b.focus({ preventScroll: false }); app.querySelector('.phone__scroll').scrollTop = 0; }
    /* if the focused button went away (or a sheet closed onto it), land somewhere useful */
    function settle() {
      const a = document.activeElement;
      if (a && a !== document.body) return;
      const f = app.querySelector('[data-banner]') || app.querySelector('[data-dd="pay"]') || app.querySelector('.appbar__btn');
      if (f) f.focus({ preventScroll: true });
    }
    if (hadFocus) settle();
    setTimeout(settle, 500);
    focusBanner = false;
  }

  function pay() {
    const x = debt(), planned = plannedLeft(x);
    TZ.keypad.sheet({
      titleKey: 'debtDetails.sheetTitle', labelKey: 'debtDetails.sheetLabel',
      value: planned || Math.min(x.monthly, x.remaining),
      check: function (n) {
        if (n > x.remaining) return I.t('debtDetails.tooMuch', { amount: F.money(x.remaining) });
        return n > planned ? I.t('debtDetails.extraHint', { extra: F.money(n - planned) }) : '';
      },
      onSave: function (n) {
        if (n > x.remaining) return false;
        const extra = Math.max(0, n - planned);
        banner = null;
        const res = MM.act(function (d) {
          const it = MM.find(d.debts, x.id), before = MM.calc(d);
          it.remaining -= n;
          (it.log = it.log || []).unshift({ date: d.today, amount: n });
          /* the planned payment was already put aside: only the extra comes out of money I can use */
          d.adjust = (d.adjust || 0) - (MM.calc(d).plan - before.plan) - extra;
        }, I.t('debtDetails.savedToast', { amount: F.money(n) }), function () { banner = null; });
        const after = debt();
        if (after.remaining > 0) {
          banner = extra ? { kind: 'extra', title: 'debtDetails.extraTitle', titleVars: { extra: F.money(extra) },
                             text: 'debtDetails.extraText', textVars: { from: F.num(res.from), to: F.num(res.to) } }
                 : n < planned ? { kind: 'part', title: 'debtDetails.partTitle', text: 'debtDetails.partText', textVars: { amount: F.money(planned - n) } }
                 : { kind: 'nice', title: 'debtDetails.niceTitle', titleVars: { n: F.num(TZ.data.debtPlan(after, MM.get().today).payments) },
                     text: 'debtDetails.niceText', textVars: { amount: F.money(res.to) } };
        }
        focusBanner = true;
        refresh();
      }
    });
  }

  function remove() {
    const x = debt(), nm = MM.name(x);
    MM.confirmRemove(nm, function () {
      const res = MM.act(function (d) { d.debts = d.debts.filter(function (o) { return o.id !== x.id; }); },
        function (from, to) { return I.t('myMoney.removed', { name: nm }) + ' ' + MM.changeLine(from, to); },
        function () { removed = null; });
      removed = { name: nm, before: res.before };
      refresh();
    });
  }

  const ACTIONS = {
    pay: pay,
    remove: remove,
    edit: function () { MM.debtForm.open(debt()); },
    closeBanner: function () { banner = null; refresh(); },
    bringBack: function () { const b = removed.before; removed = null; MM.undo(b); }
  };
  document.addEventListener('click', function (e) {
    const b = e.target.closest('[data-dd]');
    if (b) ACTIONS[b.getAttribute('data-dd')]();
  });

  const h = location.hash.replace('#', '');
  if (h === 'last' || h === 'done') demo = h;
  MM.onRefresh(refresh);
  P.boot({ titleKey: 'debtDetails.docTitle', render: function () { if (!MM.get()) load(); render(); } });
  P.demoBar([
    { id: 'plan', labelKey: 'debtDetails.demo.plan' },
    { id: 'last', labelKey: 'debtDetails.demo.last' },
    { id: 'done', labelKey: 'debtDetails.demo.done' }
  ], function (s) { demo = s; banner = null; removed = null; load(); refresh(); }, demo);
})();
