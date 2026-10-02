/* Special moments — money screens: bad month, salary day, debt paid, money received.
   Every number comes from TZ.data.calculate() on a working copy of the sample data. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data, K = TZ.states.kit;

  /* Scenario inputs that the sample data does not hold (see the report to the team) */
  const EXTRA_PAYMENT = { id: 'school', preset: 'school', nameKey: 'preset.school', amount: 4400, every: 'month', dueDay: 10, paid: false };
  const LEFT_OVER = TZ.data.SAMPLE.leftOverLastMonth;

  function car(d) { return (d.debts || []).filter(function (x) { return x.id === 'car'; })[0] || d.debts[0]; }
  function screen(body, cls) { return '<main class="phone__scroll"><div class="screen ' + (cls || '') + '">' + body + '</div></main>'; }

  /* ---------- 1. Payments bigger than salary ---------- */
  TZ.states.screens['bad-month'] = {
    render: function () {
      const d = D.get();
      d.fixed.push(K.clone(EXTRA_PAYMENT));
      const r = D.calculate(d);                       // r.badMonth === true, r.daily === 0
      const loan = car(d);
      const moved = K.clone(d);
      moved.debts = moved.debts.filter(function (x) { return x !== loan && x.id !== loan.id; });
      const r2 = D.calculate(moved);
      return screen(
        K.hero(r.daily, { extra: '<p class="st-hero__note">' + K.t('states.bad.zero') + '</p>' }) +
        '<div class="bubble-row st-say">' + K.mascot('care', 'mascot--sm') +
          '<p class="bubble" data-i18n="states.bad.message"></p></div>' +
        '<div class="card st-kv">' +
          '<div class="kv"><span class="kv__k" data-i18n="states.bad.salary"></span><span class="kv__v">' + K.money(r.salary) + '</span></div>' +
          '<div class="kv"><span class="kv__k" data-i18n="states.bad.payments"></span><span class="kv__v">' + K.money(r.setAside) + '</span></div>' +
          '<div class="kv st-kv__short"><span class="kv__k" data-i18n="states.bad.short"></span><span class="kv__v">' + K.money(r.shortBy) + '</span></div>' +
        '</div>' +
        '<section class="card card--sand st-idea" aria-labelledby="st-idea-title">' +
          '<h2 class="st-idea__title" id="st-idea-title">' + IC.icon('sparkle') + '<span data-i18n="states.bad.ideaTitle"></span></h2>' +
          '<p class="st-idea__text">' + K.t('states.bad.idea', { name: K.nameIn(loan), amount: K.money(loan.monthly) }) + '</p>' +
          '<p class="st-idea__result">' + K.t('states.bad.ideaResult', { left: K.money(r2.moneyICanUse), daily: K.money(r2.daily) }) + '</p>' +
        '</section>') +
        '<div class="page-foot">' +
          '<a class="btn btn--primary btn--block" href="' + P.url('my-money') + '" data-i18n="states.bad.seePayments"></a>' +
          '<button type="button" class="btn btn--text btn--block" data-act="later" data-i18n="states.bad.later"></button>' +
        '</div>';
    },
    on: function (act) { if (act === 'later') K.toast(I.t('states.bad.laterToast')); }
  };

  /* ---------- 2. Salary day ---------- */
  let salaryChoice = null;
  TZ.states.screens['salary-day'] = {
    reset: function () { salaryChoice = null; },
    render: function () {
      const d = D.get();
      d.today = D.calculate(d).nextSalary;              // it is salary day
      const base = D.calculate(d);
      const kept = D.calculate(Object.assign(K.clone(d), { adjust: (d.adjust || 0) + LEFT_OVER }));
      const daily = salaryChoice === 'keep' ? kept.daily : base.daily;
      const savings = d.savings.total + LEFT_OVER;
      const choice = salaryChoice
        ? '<div class="note st-done" role="status">' + IC.icon('check') + '<span>' +
            (salaryChoice === 'move' ? K.t('states.salary.moved', { amount: K.money(LEFT_OVER) })
                                     : K.t('states.salary.kept', { daily: K.money(kept.daily) })) + '</span></div>'
        : '<section class="card st-left" aria-labelledby="st-left-q">' +
            '<p class="st-left__q" id="st-left-q">' + K.t('states.salary.leftQ', { amount: K.money(LEFT_OVER) }) + '</p>' +
            '<button type="button" class="st-choice st-choice--main" data-act="move">' +
              '<span class="row__icon row__icon--sand">' + IC.icon('jar') + '</span><span class="st-choice__body">' +
              '<span class="st-choice__title" data-i18n="states.salary.yes"></span>' +
              '<span class="st-choice__sub">' + K.t('states.salary.yesSub', { total: K.money(savings) }) + '</span></span></button>' +
            '<button type="button" class="st-choice" data-act="keep">' +
              '<span class="row__icon">' + IC.icon('wallet') + '</span><span class="st-choice__body">' +
              '<span class="st-choice__title" data-i18n="states.salary.keep"></span>' +
              '<span class="st-choice__sub">' + K.t('states.salary.keepSub', { daily: K.money(kept.daily), base: K.money(base.daily) }) + '</span></span></button>' +
          '</section>';
      return screen(
        '<div class="st-celebrate">' + K.mascot('celebrate', 'mascot--lg') +
          '<h2 class="t-title" data-i18n="states.salary.title"></h2>' +
          '<p class="lead">' + K.t('states.salary.text', { date: '<bdi>' + F.date(base.nextSalary, 'long') + '</bdi>' }) + '</p></div>' +
        K.hero(daily, { eyebrowKey: 'states.salary.newNumber', extra: '<p class="st-hero__note" data-i18n="common.perDay"></p>' }) +
        choice);
    },
    on: function (act, el, rerender) {
      if (act !== 'move' && act !== 'keep') return;
      salaryChoice = act;
      rerender();
      const m = K.money(LEFT_OVER).replace(/<[^>]+>/g, '');
      K.toast(I.t(act === 'move' ? 'states.salary.movedToast' : 'states.salary.keptToast', { amount: m }),
        function () { salaryChoice = null; rerender(); });
    }
  };

  /* ---------- 3. Debt fully paid ---------- */
  function confetti() {
    const colors = ['var(--accent)', 'var(--primary)', 'var(--sand-300)', 'var(--brand-300)', 'var(--sand-200)', 'var(--brand-200)'];
    let out = '';
    for (let i = 0; i < 22; i++) {
      const x = (i * 37) % 100, y = (i * 53) % 46, rot = (i * 47) % 180, delay = (i % 7) * 90;
      out += '<i style="--x:' + x + '%;--y:' + y + '%;--r:' + rot + 'deg;--d:' + delay + 'ms;--c:' + colors[i % colors.length] + '"' +
        (i % 3 === 0 ? ' class="is-dot"' : '') + '></i>';
    }
    return '<div class="st-confetti" aria-hidden="true">' + out + '</div>';
  }
  TZ.states.screens['debt-paid'] = {
    render: function () {
      const d = D.get(), loan = car(d);
      return screen(confetti() +
        '<div class="st-celebrate">' + K.mascot('celebrate', 'mascot--lg') +
          '<h2 class="t-title st-big-title">' + K.t('states.debt.title', { name: D.name(loan) }) + '</h2>' +
          '<p class="lead">' + K.t('states.debt.text', { you: I.t('mock.you'), total: K.money(loan.total) }) + '</p></div>' +
        '<div class="card"><div class="progress" style="--value:100%">' +
          '<div class="progress__head"><span>' + K.t('states.debt.progress', { paid: K.money(loan.total), total: K.money(loan.total) }) + '</span>' +
          IC.icon('check', { cls: 'st-tick' }) + '</div>' +
          '<div class="progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><div class="progress__fill"></div></div></div></div>' +
        '<section class="card card--sand st-means" aria-labelledby="st-means">' +
          '<h3 class="st-means__title" id="st-means" data-i18n="states.debt.meansTitle"></h3>' +
          '<p>' + K.t('states.debt.means', { amount: K.money(loan.monthly) }) + '</p></section>', 'st-party') +
        '<div class="page-foot">' +
          '<a class="btn btn--primary btn--block" href="' + P.url('my-money') + '" data-i18n="states.debt.seeMoney"></a>' +
          '<a class="btn btn--text btn--block" href="' + P.url('home') + '" data-i18n="states.debt.home"></a>' +
        '</div>';
    }
  };

  /* ---------- 4. Money received (Ahmed paid back) ---------- */
  let undone = false;
  TZ.states.screens['money-received'] = {
    reset: function () { undone = false; },
    render: function () {
      const d = D.get(), who = d.owedToMe[0];
      const before = D.calculate(d);
      const after = D.calculate(Object.assign(K.clone(d), { adjust: (d.adjust || 0) + who.amount }));
      const now = undone ? before : after;
      const up = after.daily - before.daily;
      return screen(
        K.hero(now.daily, { extra: undone ? '' : '<span class="st-up">' + IC.icon('arrow', { cls: 'st-up__icon' }) +
          '<span>' + K.t('states.received.upBy', { n: K.num(up) }) + '</span></span>' }) +
        '<section class="card st-recv" aria-labelledby="st-recv">' +
          '<h2 class="st-recv__title" id="st-recv"><span class="row__icon">' + IC.icon('moneyIn') + '</span><span>' +
            K.t('states.received.title', { name: D.name(who), amount: K.money(who.amount) }) + '</span></h2>' +
          '<div class="st-ba">' +
            '<div class="st-ba__item"><span data-i18n="states.received.before"></span><b>' + K.num(before.daily) + '</b></div>' +
            IC.icon('arrow', { dir: true, cls: 'st-ba__arrow' }) +
            '<div class="st-ba__item st-ba__item--now"><span data-i18n="states.received.now"></span><b>' + K.num(after.daily) + '</b></div>' +
          '</div>' +
          '<p class="muted st-recv__why">' + K.t('states.received.why', { n: K.num(after.daysLeft), plus: K.money(up) }) + '</p>' +
        '</section>') +
        '<div class="page-foot">' +
          '<a class="btn btn--primary btn--block" href="' + P.url('home') + '" data-i18n="common.gotIt"></a>' +
          (undone ? '' : '<button type="button" class="btn btn--text btn--block" data-act="undo">' + IC.icon('undo', { dir: true }) + '<span data-i18n="common.undo"></span></button>') +
        '</div>';
    },
    on: function (act, el, rerender) {
      if (act !== 'undo') return;
      undone = true;
      rerender();
      const d = D.get();
      K.toast(I.t('states.received.undoToast', { amount: F.num(D.calculate(d).daily) }), function () { undone = false; rerender(); });
    }
  };
})();
