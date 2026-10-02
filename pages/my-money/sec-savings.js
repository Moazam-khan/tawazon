/* My money — "Savings": total, "Add money" (lowers the daily number), history. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons;

  function row(e, i) {
    return '<li class="mm-item mm-row">' +
      MM.head({ icon: 'jar', sand: true, titleKey: 'myMoney.savings.entry', end: '<span class="row__end">' + F.moneyHtml(e.amount) + '</span>',
        sub: '<span class="row__sub">' + F.date(e.date, 'long') + '</span>' }) +
      '<button type="button" class="mm-icon-btn" data-act="savings:remove" data-id="' + i + '" data-i18n-aria="myMoney.savings.takeOutAria"' +
        P.vars({ amount: F.money(e.amount) }) + '>' + IC.icon('trash') + '</button>' +
    '</li>';
  }

  function render(d) {
    const s = d.savings || { total: 0, log: [] };
    if (!s.total && !(s.log || []).length) return MM.empty('happy', 'myMoney.savings', 'savings:add');
    return MM.summary({ icon: 'jar', sand: true, labelKey: 'myMoney.savings.sumLabel', amount: s.total, lineKey: 'myMoney.savings.sumLine' }) +
      '<button type="button" class="btn btn--primary btn--block" data-act="savings:add">' + IC.icon('plus') +
        '<span data-i18n="myMoney.savings.add"></span></button>' +
      MM.note('info', 'myMoney.savings.note', true) +
      (s.log.length ? '<h3 class="section-title" data-i18n="myMoney.savings.history"></h3>' +
        '<ul class="list mm-list">' + s.log.map(row).join('') + '</ul>' : '');
  }

  function add() {
    const pid = 'mm-prev-' + MM.uid();
    const from = MM.calc().daily;
    TZ.keypad.sheet({
      titleKey: 'myMoney.savings.addTitle',
      labelKey: 'myMoney.savings.amountLabel',
      extraHtml: '<p class="note note--sand mm-preview">' + IC.icon('info') + '<span><span data-i18n="myMoney.savings.note"></span>' +
        '<strong class="mm-preview__line" id="' + pid + '" hidden></strong></span></p>',
      check: function (n) {
        const el = document.getElementById(pid);
        if (el) {
          const d = MM.snap();
          d.adjust = (d.adjust || 0) - n;
          el.hidden = !n;
          el.textContent = I.t('myMoney.savings.preview', { from: F.num(from), to: F.num(MM.calc(d).daily) });
        }
        return '';
      },
      onSave: function (n) {
        MM.act(function (d) {
          const before = MM.calc(d).daily;
          d.savings.total += n;
          d.savings.log.unshift({ date: d.today, amount: n });
          d.adjust = (d.adjust || 0) - n;
          (d.events = d.events || []).unshift({ date: d.today, type: 'savings', amount: n, from: before, to: MM.calc(d).daily });
        }, function (a, b) { return I.t('myMoney.savings.addedToast', { amount: F.money(n), from: F.num(a), to: F.num(b) }); });
      }
    });
  }

  MM.sections.savings = {
    icon: 'jar',
    render: render,
    actions: {
      add: add,
      remove: function (i) {
        const e = MM.get().savings.log[+i];
        const amt = F.money(e.amount);
        MM.confirmRemove(amt, function () {
          MM.act(function (d) {
            d.savings.log.splice(+i, 1);
            d.savings.total = Math.max(0, d.savings.total - e.amount);
            d.adjust = (d.adjust || 0) + e.amount;
          }, function (a, b) { return I.t('myMoney.savings.takenToast', { amount: amt, from: F.num(a), to: F.num(b) }); });
        }, { title: I.t('myMoney.savings.takeOutTitle', { amount: amt }), text: I.t('myMoney.savings.takeOutText'),
             yes: I.t('myMoney.savings.takeOutYes'), icon: 'jar', tone: 'calm' });
      }
    }
  };
})();
