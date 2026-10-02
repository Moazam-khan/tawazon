/* My money — "Goals": target, saved so far, progress, "Save about X a month".
   Goals never change the daily number (said on screen). */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons, FM = MM.form;
  const PRESETS = [
    { id: 'umrah', icon: 'star', key: 'myMoney.goals.preset.umrah' },
    { id: 'car', icon: 'car', key: 'myMoney.goals.preset.car' },
    { id: 'wedding', icon: 'heart', key: 'myMoney.goals.preset.wedding' },
    { id: 'emergency', icon: 'shield', key: 'myMoney.goals.preset.emergency' },
    { id: 'travel', icon: 'globe', key: 'myMoney.goals.preset.travel' },
    { id: 'other', icon: 'goal', key: 'myMoney.goals.preset.other' }
  ];
  function icon(g) { return (PRESETS.filter(function (p) { return p.id === g.preset; })[0] || { icon: 'goal' }).icon; }

  function card(g, today) {
    const plan = TZ.data.goalPlan(g, today);
    const nm = MM.name(g);
    const pct = Math.min(100, plan.pct);
    const reached = g.saved >= g.target;
    return '<li class="card mm-goal">' +
      MM.head({
        icon: icon(g), sand: true, title: nm,
        end: '<span class="row__end mm-goal__pct" data-i18n="myMoney.goals.pct"' + P.vars({ n: F.num(pct) }) + '></span>',
        sub: '<span class="row__sub" data-i18n="myMoney.goals.by"' + P.vars({ month: F.date(g.by, 'month') }) + '></span>'
      }) +
      '<div class="progress progress--accent" style="--value:' + pct + '%">' +
        '<div class="progress__head"><span data-i18n="myMoney.goals.progress"' + P.vars({ saved: F.money(g.saved), target: F.money(g.target) }) + '></span></div>' +
        '<div class="progress__track"><div class="progress__fill"></div></div>' +
      '</div>' +
      (reached ? '<p class="mm-tag mm-tag--sand">' + IC.icon('party') + '<span data-i18n="myMoney.goals.reached"></span></p>'
               : '<p class="mm-suggest">' + IC.icon('sparkle') + '<span data-i18n="myMoney.goals.suggest"' + P.vars({ amount: F.money(plan.perMonth) }) + '></span></p>') +
      '<div class="mm-item__foot">' +
        '<button type="button" class="btn mm-soft-btn" data-act="goals:money" data-id="' + P.esc(g.id) + '" data-i18n-aria="myMoney.goals.addMoneyAria"' + P.vars({ name: nm }) + '>' +
          IC.icon('plus') + '<span data-i18n="myMoney.goals.addMoney"></span></button>' +
        MM.tools('goals', g.id, nm) +
      '</div>' +
    '</li>';
  }

  /* Link to the Big months planner (Ramadan, Eid, summer, school) */
  function seasonsLink() {
    return '<div class="list"><a class="row" href="' + P.url('seasons') + '">' +
      '<span class="row__icon row__icon--sand">' + IC.icon('moon') + '</span>' +
      '<span class="row__body"><span class="row__title" data-i18n="myMoney.goals.seasonsTitle"></span>' +
        '<span class="row__sub" data-i18n="myMoney.goals.seasonsSub"></span></span>' +
      IC.icon('chevron', { dir: true, cls: 'row__chev' }) + '</a></div>';
  }

  function render(d) {
    const note = MM.note('info', 'myMoney.goals.note');
    if (!d.goals.length) return note + MM.empty('think', 'myMoney.goals', 'goals:add') + seasonsLink();
    const saved = d.goals.reduce(function (s, g) { return s + g.saved; }, 0);
    const target = d.goals.reduce(function (s, g) { return s + g.target; }, 0);
    return MM.summary({ icon: 'goal', sand: true, labelKey: 'myMoney.goals.sumLabel', amount: saved,
        lineKey: 'myMoney.goals.sumLine', lineVars: { amount: F.money(target) } }) +
      note +
      '<ul class="mm-cards">' + d.goals.map(function (g) { return card(g, d.today); }).join('') + '</ul>' +
      MM.addBtn('goals:add', 'myMoney.goals.add') +
      seasonsLink();
  }

  function sheet(g) {
    const s = TZ.keypad.sheet({
      titleKey: g ? 'myMoney.editTitle' : 'myMoney.goals.addTitle',
      titleVars: g ? { name: MM.name(g) } : null,
      labelKey: 'myMoney.goals.targetLabel',
      value: g ? g.target : 0,
      extraHtml: FM.chips(PRESETS, g ? g.preset : null) + FM.name('myMoney.form.name', g ? MM.name(g) : '') +
        FM.select('myMoney.form.byWhen', 'by', FM.futureMonths(MM.get().today, 36), g ? g.by.slice(0, 8) + '01' : FM.futureMonths(MM.get().today, 12)[11].v),
      onSave: function (n, el) {
        const r = FM.read(el);
        if (!r) return false;
        let label = r.name;
        MM.act(function (d) {
          let it = g ? MM.find(d.goals, g.id) : null;
          if (!it) { it = { id: MM.uid(), preset: 'other', saved: 0 }; d.goals.push(it); }
          FM.applyName(it, r);
          if (r.preset) it.preset = r.preset;
          it.target = n; it.by = r.by;
          label = MM.name(it);
        }, function (from, to) { return I.t(g ? 'myMoney.changed' : 'myMoney.added', { name: label }) + ' ' + MM.changeLine(from, to); });
      }
    });
    FM.wire(s.el);
  }

  function addMoney(id) {
    const g = MM.find(MM.get().goals, id), nm = MM.name(g);
    TZ.keypad.sheet({
      titleKey: 'myMoney.goals.addMoneyTitle', titleVars: { name: nm },
      labelKey: 'myMoney.goals.addMoneyLabel',
      extraHtml: MM.note('info', 'myMoney.goals.note'),
      onSave: function (n) {
        MM.act(function (d) { MM.find(d.goals, id).saved += n; }, function (from, to) {
          const it = MM.find(MM.get().goals, id);
          return it.saved >= it.target ? I.t('myMoney.goals.reachedToast', { name: nm })
            : I.t('myMoney.goals.moneyAdded', { amount: F.money(n), name: nm, daily: F.money(to) });
        });
      }
    });
  }

  MM.sections.goals = {
    icon: 'goal',
    render: render,
    actions: {
      add: function () { sheet(null); },
      edit: function (id) { sheet(MM.find(MM.get().goals, id)); },
      money: addMoney,
      remove: function (id) {
        const nm = MM.name(MM.find(MM.get().goals, id));
        MM.confirmRemove(nm, function () {
          MM.act(function (d) { d.goals = d.goals.filter(function (x) { return x.id !== id; }); }, I.t('myMoney.removed', { name: nm }));
        });
      }
    }
  };
})();
