/* My money — "Fixed payments": monthly or yearly, due day, "Mark as paid" (number stays). */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons, FM = MM.form;
  const PRESETS = [
    { id: 'rent', icon: 'rent', key: 'preset.rent' },
    { id: 'electricity', icon: 'electricity', key: 'preset.electricity' },
    { id: 'internet', icon: 'internet', key: 'preset.internet' },
    { id: 'phone', icon: 'phone', key: 'preset.phone' },
    { id: 'school', icon: 'school', key: 'preset.school' },
    { id: 'worker', icon: 'person', key: 'preset.worker' },
    { id: 'subscription', icon: 'subscription', key: 'preset.subscription' },
    { id: 'other', icon: 'other', key: 'preset.other' }
  ];
  const ICONS = { bills: 'bills', water: 'water', family: 'heart', car: 'car', loan: 'debt' };
  function icon(x) { return ICONS[x.preset] || (PRESETS.filter(function (p) { return p.id === x.preset; })[0] || { icon: 'bills' }).icon; }

  function item(x) {
    const yearly = x.every === 'year';
    const nm = MM.name(x);
    const due = MM.nextDue(x.dueDay || 1, yearly ? (x.dueMonth || 1) : 0, x.paid);
    return '<li class="mm-item">' +
      MM.head({
        icon: icon(x), title: nm,
        end: yearly ? '<span class="row__end" data-i18n="myMoney.fixed.perYear"' + P.vars({ amount: F.money(x.amount) }) + '></span>'
                    : '<span class="row__end">' + F.moneyHtml(x.amount) + '</span>',
        sub: '<span class="row__sub mm-sub"><span data-i18n="myMoney.fixed.' + (yearly ? 'everyYear' : 'everyMonth') + '"></span> · ' +
          '<span data-i18n="myMoney.fixed.' + (x.paid ? 'nextDue' : 'due') + '"' + P.vars({ date: F.date(due, 'short') }) + '></span></span>' +
          (yearly ? '<span class="mm-share" data-i18n="myMoney.fixed.share"' + P.vars({ amount: F.money(TZ.data.monthly(x)) }) + '></span>' : '')
      }) +
      '<div class="mm-item__foot">' +
        (x.paid ? '<span class="mm-tag mm-tag--good">' + IC.icon('check') + '<span data-i18n="myMoney.fixed.paidTag"></span></span>'
                : '<button type="button" class="btn mm-soft-btn" data-act="fixed:paid" data-id="' + P.esc(x.id) + '" data-i18n-aria="myMoney.fixed.markPaidAria"' + P.vars({ name: nm }) + '>' +
                    IC.icon('check') + '<span data-i18n="myMoney.fixed.markPaid"></span></button>') +
        MM.tools('fixed', x.id, nm) +
      '</div>' +
    '</li>';
  }

  function render(d, r) {
    if (!d.fixed.length) return MM.empty('calm', 'myMoney.fixed', 'fixed:add');
    const paid = d.fixed.filter(function (x) { return x.paid; }).length;
    const big = d.fixed.reduce(function (m, x) { return Math.max(m, TZ.data.monthly(x)); }, 0);
    return MM.summary({ icon: 'calendar', labelKey: 'myMoney.fixed.sumLabel', amount: r.fixedMonthly,
        lineKey: 'myMoney.fixed.sumLine', lineVars: { paid: F.num(paid), count: F.num(d.fixed.length) } }) +
      '<ul class="list mm-list">' + d.fixed.map(item).join('') + '</ul>' +
      MM.addBtn('fixed:add', 'myMoney.fixed.add') +
      '<p class="note">' + IC.icon('calendar') + '<span><span data-i18n="myMoney.fixed.spread"></span> ' +
        '<span data-i18n="myMoney.fixed.spreadExample"' + P.vars({ year: F.money(big * 12), month: F.money(big) }) + '></span></span></p>' +
      MM.note('info', 'myMoney.fixed.paidNote');
  }

  /* Add or change one payment */
  function sheet(x) {
    const yearly = x && x.every === 'year';
    const shareId = 'mm-share-' + MM.uid();
    const s = TZ.keypad.sheet({
      titleKey: x ? 'myMoney.editTitle' : 'myMoney.fixed.addTitle',
      titleVars: x ? { name: MM.name(x) } : null,
      labelKey: yearly ? 'myMoney.fixed.labelYear' : 'myMoney.fixed.labelMonth',
      value: x ? x.amount : 0,
      extraHtml: FM.chips(PRESETS, x ? x.preset : null) + FM.name('myMoney.form.name', x ? MM.name(x) : '') +
        FM.seg('myMoney.form.every', 'every', [{ v: 'month', key: 'common.monthly' }, { v: 'year', key: 'common.yearly' }], yearly ? 'year' : 'month') +
        '<div class="mm-row2">' + FM.select('myMoney.form.month', 'month', FM.months(), x && x.dueMonth || 1, !yearly) +
          FM.select('myMoney.form.day', 'day', FM.days(), x ? x.dueDay : 1) + '</div>' +
        '<p class="mm-share mm-share--sheet" id="' + shareId + '" hidden></p>',
      check: function (n) {
        const el = document.getElementById(shareId);
        let isYear = yearly;
        if (el) {
          isYear = el.closest('.sheet').querySelector('[data-seg="every"] [aria-checked="true"]').getAttribute('data-v') === 'year';
          el.hidden = !(isYear && n);
          el.textContent = I.t('myMoney.fixed.share', { amount: F.money(Math.round(n / 12)) });
        }
        return (isYear ? n / 12 : n) > MM.get().salary ? I.t('check.moreThanSalary') : '';
      },
      onSave: function (n, el) {
        const r = FM.read(el);
        if (!r) return false;
        let label = r.name;
        MM.act(function (d) {
          let it = x ? MM.find(d.fixed, x.id) : null;
          if (!it) { it = { id: MM.uid(), paid: false }; d.fixed.push(it); }
          FM.applyName(it, r);
          if (r.preset) it.preset = r.preset;
          it.amount = n; it.every = r.every; it.dueDay = +r.day;
          if (r.every === 'year') it.dueMonth = +r.month; else delete it.dueMonth;
          label = MM.name(it);
        }, function (from, to) { return I.t(x ? 'myMoney.changed' : 'myMoney.added', { name: label }) + ' ' + MM.changeLine(from, to); });
      }
    });
    FM.wire(s.el, { onSeg: function (v) {
      const label = s.el.querySelector('.amount__label');
      label.setAttribute('data-i18n', v === 'year' ? 'myMoney.fixed.labelYear' : 'myMoney.fixed.labelMonth');
      I.apply(label.parentNode);
      s.el.querySelector('[data-wrap="month"]').hidden = v !== 'year';
      s.pad.render();
    } });
  }

  MM.sections.fixed = {
    icon: 'calendar',
    render: render,
    actions: {
      add: function () { sheet(null); },
      edit: function (id) { sheet(MM.find(MM.get().fixed, id)); },
      paid: function (id) {
        const nm = MM.name(MM.find(MM.get().fixed, id));
        MM.act(function (d) { MM.find(d.fixed, id).paid = true; },
          function (from, to) { return I.t('myMoney.fixed.paidToast', { name: nm, amount: F.money(to) }); });
      },
      remove: function (id) {
        const nm = MM.name(MM.find(MM.get().fixed, id));
        MM.confirmRemove(nm, function () {
          MM.act(function (d) { d.fixed = d.fixed.filter(function (x) { return x.id !== id; }); },
            function (from, to) { return I.t('myMoney.removed', { name: nm }) + ' ' + MM.changeLine(from, to); });
        });
      }
    }
  };
})();
