/* Money I owe — add / change a debt in two short steps (one question per sheet):
   1) name + how much is left   2) monthly payment + pay day.
   Used by the "Money I owe" section and by the debt details page.            */
MM.debtForm = (function () {
  'use strict';
  const F = TZ.fmt, I = TZ.i18n, FM = MM.form;
  const PRESETS = [
    { id: 'car', icon: 'car', key: 'myMoney.owe.preset.car' },
    { id: 'personal', icon: 'debt', key: 'myMoney.owe.preset.personal' },
    { id: 'card', icon: 'wallet', key: 'myMoney.owe.preset.card' },
    { id: 'family', icon: 'person', key: 'myMoney.owe.preset.family' },
    { id: 'other', icon: 'other', key: 'myMoney.owe.preset.other' }
  ];
  const ICONS = { car: 'car', personal: 'debt', card: 'wallet', family: 'person', loan: 'debt' };

  function icon(debt) { return ICONS[debt.preset] || 'debt'; }

  /* debt = null to add a new one */
  function open(debt, onDone) {
    const nm = debt ? MM.name(debt) : '';
    const s = TZ.keypad.sheet({
      titleKey: debt ? 'myMoney.editTitle' : 'myMoney.owe.addTitle',
      titleVars: debt ? { name: nm } : null,
      labelKey: 'myMoney.owe.leftLabel',
      value: debt ? debt.remaining : 0,
      extraHtml: FM.chips(PRESETS, debt ? debt.preset : null) + FM.name('myMoney.form.name', nm),
      saveKey: 'common.next',
      onSave: function (left, el) {
        const r = FM.read(el);
        if (!r) return false;
        setTimeout(function () { step2(debt, r, left, onDone); }, 320);
        return true;
      }
    });
    FM.wire(s.el);
  }

  function step2(debt, r, left, onDone) {
    TZ.keypad.sheet({
      titleKey: 'myMoney.owe.monthlyTitle',
      labelKey: 'myMoney.owe.monthlyLabel',
      value: debt ? debt.monthly : 0,
      check: function (n) { return n > left ? I.t('myMoney.owe.moreThanLeft', { amount: F.money(left) }) : ''; },
      extraHtml: FM.select('myMoney.owe.payDay', 'day', FM.days(), debt ? debt.dueDay : 1),
      onSave: function (n, el) {
        const day = +FM.read(el).day;
        let label = r.name;
        MM.act(function (d) {
          let x = debt ? MM.find(d.debts, debt.id) : null;
          if (!x) {
            x = { id: MM.uid(), preset: r.preset || 'other', total: left, remaining: left, log: [] };
            d.debts.push(x);
          } else {
            const paid = Math.max(0, x.total - x.remaining);
            x.total = paid + left;
            x.remaining = left;
            if (r.preset) x.preset = r.preset;
          }
          FM.applyName(x, r);
          x.monthly = Math.min(n, left);
          x.dueDay = day;
          label = MM.name(x);
        }, function (from, to) {
          return I.t(debt ? 'myMoney.changed' : 'myMoney.added', { name: label }) + ' ' + MM.changeLine(from, to);
        });
        if (onDone) onDone();
      }
    });
  }

  return { open: open, icon: icon };
})();
