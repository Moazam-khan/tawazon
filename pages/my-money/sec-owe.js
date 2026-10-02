/* My money — "Money I owe": total, monthly payment, one card per debt (→ debt details). */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons;

  function card(x, today) {
    const plan = TZ.data.debtPlan(x, today);
    const done = x.remaining <= 0;
    const pct = done ? 100 : plan.paidPct;
    const href = P.url('my-money/debt-details') + '?id=' + encodeURIComponent(x.id);
    return '<li><a class="card mm-debt" href="' + href + '">' +
      '<span class="mm-debt__top">' +
        MM.head({
          icon: MM.debtForm.icon(x), title: MM.name(x),
          end: done ? '<span class="mm-tag mm-tag--good">' + IC.icon('check') + '<span data-i18n="myMoney.owe.allPaid"></span></span>'
                    : '<span class="row__end" data-i18n="myMoney.owe.leftAmount"' + P.vars({ amount: F.money(x.remaining) }) + '></span>',
          sub: '<span class="row__sub" data-i18n="myMoney.owe.perMonth"' + P.vars({ amount: F.money(x.monthly) }) + '></span>'
        }) +
        IC.icon('chevron', { dir: true, cls: 'row__chev' }) +
      '</span>' +
      '<span class="progress mm-debt__progress" style="--value:' + pct + '%">' +
        '<span class="progress__head"><span data-i18n="myMoney.owe.paidPct"' + P.vars({ n: F.num(pct) }) + '></span>' +
          (plan.endDate ? '<span data-i18n="myMoney.owe.endsIn"' + P.vars({ month: F.date(plan.endDate, 'month') }) + '></span>' : '') +
        '</span>' +
        '<span class="progress__track"><span class="progress__fill"></span></span>' +
      '</span>' +
    '</a></li>';
  }

  function render(d, r) {
    if (!d.debts.length) return MM.empty('happy', 'myMoney.owe', 'owe:add');
    const total = d.debts.reduce(function (s, x) { return s + Math.max(0, x.remaining); }, 0);
    return MM.summary({ icon: 'debt', labelKey: 'myMoney.owe.sumLabel', amount: total,
        lineKey: 'myMoney.owe.sumLine', lineVars: { amount: F.money(r.debtMonthly) } }) +
      '<ul class="mm-cards">' + d.debts.map(function (x) { return card(x, d.today); }).join('') + '</ul>' +
      MM.addBtn('owe:add', 'myMoney.owe.add') +
      MM.note('info', 'myMoney.owe.note');
  }

  MM.sections.owe = {
    icon: 'debt',
    render: render,
    actions: { add: function () { MM.debtForm.open(null); } }
  };
})();
