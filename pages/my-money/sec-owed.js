/* My money — "People owe me": name + amount; "Mark as received" raises the daily number. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons, FM = MM.form;

  function item(x) {
    const nm = MM.name(x);
    return '<li class="mm-item">' +
      MM.head({
        icon: 'person', sand: true, title: nm,
        end: '<span class="row__end">' + F.moneyHtml(x.amount) + '</span>',
        sub: x.since ? '<span class="row__sub" data-i18n="myMoney.owed.since"' + P.vars({ date: F.date(x.since, 'short') }) + '></span>' : ''
      }) +
      '<div class="mm-item__foot"><button type="button" class="btn mm-soft-btn mm-receive" data-act="owed:receive" data-id="' + P.esc(x.id) + '" data-i18n-aria="myMoney.owed.receiveAria"' + P.vars({ name: nm }) + '>' +
        IC.icon('moneyIn') + '<span data-i18n="myMoney.owed.receive"></span></button>' +
      MM.tools('owed', x.id, nm) + '</div>' +
      (MM.remind ? MM.remind.button(x) : '') +
    '</li>';
  }

  function render(d) {
    if (!d.owedToMe.length) return MM.empty('calm', 'myMoney.owed', 'owed:add');
    const total = d.owedToMe.reduce(function (s, x) { return s + x.amount; }, 0);
    return MM.summary({ icon: 'moneyIn', sand: true, labelKey: 'myMoney.owed.sumLabel', amount: total, lineKey: 'myMoney.owed.sumLine' }) +
      '<ul class="list mm-list">' + d.owedToMe.map(item).join('') + '</ul>' +
      MM.addBtn('owed:add', 'myMoney.owed.add');
  }

  function sheet(x) {
    const s = TZ.keypad.sheet({
      titleKey: x ? 'myMoney.editTitle' : 'myMoney.owed.addTitle',
      titleVars: x ? { name: MM.name(x) } : null,
      labelKey: 'myMoney.owed.amountLabel',
      value: x ? x.amount : 0,
      extraHtml: FM.name('myMoney.owed.nameLabel', x ? MM.name(x) : ''),
      onSave: function (n, el) {
        const r = FM.read(el);
        if (!r) return false;
        MM.act(function (d) {
          let it = x ? MM.find(d.owedToMe, x.id) : null;
          if (!it) { it = { id: MM.uid(), since: d.today }; d.owedToMe.push(it); }
          FM.applyName(it, r);
          it.amount = n;
        }, I.t(x ? 'myMoney.changed' : 'myMoney.added', { name: r.name }));
      }
    });
    FM.wire(s.el);
  }

  MM.sections.owed = {
    icon: 'moneyIn',
    render: render,
    actions: {
      add: function () { sheet(null); },
      edit: function (id) { sheet(MM.find(MM.get().owedToMe, id)); },
      receive: function (id) {
        const x = MM.find(MM.get().owedToMe, id), nm = MM.name(x);
        MM.act(function (d) {
          const it = MM.find(d.owedToMe, id);
          const from = MM.calc(d).daily;
          d.adjust = (d.adjust || 0) + it.amount;
          d.owedToMe = d.owedToMe.filter(function (o) { return o.id !== id; });
          const ev = { date: d.today, type: 'received', amount: it.amount, from: from, to: MM.calc(d).daily };
          if (it.nameKey) ev.nameKey = it.nameKey; else ev.name = it.name;
          (d.events = d.events || []).unshift(ev);
        }, function (from, to) { return I.t('myMoney.owed.received', { name: nm, from: F.num(from), to: F.num(to) }); });
      },
      remove: function (id) {
        const nm = MM.name(MM.find(MM.get().owedToMe, id));
        MM.confirmRemove(nm, function () {
          MM.act(function (d) { d.owedToMe = d.owedToMe.filter(function (x) { return x.id !== id; }); }, I.t('myMoney.removed', { name: nm }));
        });
      }
    }
  };
})();
