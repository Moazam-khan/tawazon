/* Ask — answer bubbles. Each builder returns the inner HTML of one Tawazon bubble.
   Built fresh on every render, so a language switch rewrites the whole chat.
   Text comes from ask.* keys; amounts are wrapped in <bdi> by TZ.fmt.moneyHtml. */
(function () {
  'use strict';
  const F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, D = TZ.data;
  /* The brief's example question (PAGE-GUIDE §3). Only a starting value; the user can change it. */
  const SPEND_EXAMPLE = 300;

  function p(key, vars, cls) { return '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + I.t(key, vars) + '</p>'; }
  function m(n) { return F.moneyHtml(n); }
  function n(x) { return '<bdi class="num">' + F.num(x) + '</bdi>'; }

  /* Mini visual: two bars, today vs from tomorrow */
  function bars(today, tomorrow) {
    const max = Math.max(today, tomorrow, 1);
    function bar(key, v, cls) {
      return '<div class="ask-bar' + cls + '">' +
        '<span class="ask-bar__k">' + I.t(key) + '</span>' +
        '<span class="ask-bar__track" aria-hidden="true"><i style="--w:' + Math.max(4, Math.round(v / max * 100)) + '%"></i></span>' +
        '<span class="ask-bar__v">' + n(v) + ' <small>' + I.t('common.perDay') + '</small></span></div>';
    }
    return '<div class="ask-viz ask-bars">' +
      bar('ask.spend.barToday', today, '') + bar('ask.spend.barTomorrow', tomorrow, ' ask-bar--next') + '</div>';
  }

  function progress(pct, labelHtml, accent) {
    return '<div class="ask-viz progress' + (accent ? ' progress--accent' : '') + '" style="--value:' + pct + '%">' +
      '<div class="progress__head"><span>' + labelHtml + '</span><span>' + n(pct) + '%</span></div>' +
      '<div class="progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
      '<div class="progress__fill"></div></div></div>';
  }

  function spend(msg) {
    const d = D.get(), r = D.calculate(d), pv = D.previewSpend(d, msg.amount);
    const v = { amount: m(msg.amount), today: m(pv.today), tomorrow: m(pv.tomorrow), left: m(r.moneyICanUse) };
    if (pv.left < 0) {
      return p('ask.spend.tooMuch', v) + p('ask.spend.wait', { date: '<bdi>' + F.date(r.nextSalary, 'long') + '</bdi>' }) +
        bars(pv.today, 0);
    }
    return p(pv.fits ? 'ask.spend.fits' : 'ask.spend.over', v) + p('ask.spend.tomorrow', v) +
      bars(pv.today, pv.tomorrow) +
      '<p class="ask-fine">' + IC.icon('info') + '<span>' + I.t('ask.spend.note') + '</span></p>';
  }

  function eventLine(e) {
    const name = e.nameKey ? I.t(e.nameKey) : '';
    const what = I.t('ask.why.' + e.type, { amount: m(e.amount), name: name });
    const change = e.from === e.to
      ? '<span class="ask-event__same">' + I.t('ask.why.same') + '</span>'
      : '<span class="ask-event__change">' + n(e.from) + IC.icon('arrow', { dir: true, cls: 'ask-event__arrow' }) +
        '<b class="' + (e.to > e.from ? 'is-up' : 'is-down') + '">' + n(e.to) + '</b>' +
        '<span class="ask-event__per">' + I.t('common.perDay') + '</span></span>';
    const icon = { savings: 'jar', paid: 'check', received: 'moneyIn', check: 'wallet', fromSavings: 'jar' }[e.type] || 'info';
    return '<li class="ask-event"><span class="ask-event__icon" aria-hidden="true">' + IC.icon(icon) + '</span>' +
      '<span class="ask-event__body"><span class="ask-event__date">' + F.date(e.date, 'short') + '</span>' +
      '<span class="ask-event__what">' + what + '</span>' + change + '</span></li>';
  }

  function why() {
    const d = D.get();
    return p('ask.why.intro') + '<ul class="ask-viz ask-events">' + (d.events || []).map(eventLine).join('') + '</ul>' +
      p('ask.why.outro', null, 'ask-soft');
  }

  function debt() {
    const d = D.get(), x = (d.debts || []).filter(function (k) { return k.remaining > 0; })[0];
    if (!x) return p('ask.debt.none');
    const pl = D.debtPlan(x, d.today);
    /* sample names are plain nouns ("Car loan"): lower-case them mid-sentence in English */
    const nm = x.nameKey && I.getLang() === 'en' ? D.name(x).toLowerCase() : D.name(x);
    const v = { name: nm, month: '<bdi>' + F.date(pl.endDate, 'month') + '</bdi>', n: n(pl.payments), last: m(pl.last) };
    return p(pl.payments === 1 ? 'ask.debt.answerOne' : 'ask.debt.answer', v) +
      progress(pl.paidPct, I.t('ask.debt.progress', { paid: m(x.total - x.remaining), total: m(x.total) }));
  }

  function goal() {
    const d = D.get(), g = (d.goals || [])[0];
    if (!g) return p('ask.goal.none');
    const gp = D.goalPlan(g, d.today);
    return p('ask.goal.answer', { amount: m(gp.perMonth), name: D.name(g), target: m(g.target), month: '<bdi>' + F.date(g.by, 'month') + '</bdi>' }) +
      progress(gp.pct, I.t('ask.goal.progress', { saved: m(g.saved), target: m(g.target) }), true) +
      '<p class="ask-fine">' + IC.icon('info') + '<span>' + I.t('ask.goal.note') + '</span></p>';
  }

  function tag() { return '<span class="ask-tag">' + IC.icon('sparkle') + I.t('ask.ai.tag') + '</span>'; }

  function savings() {
    const s = D.get().savings, last = (s.log || [])[0] || { amount: 0, date: D.get().today };
    return tag() + p('ask.ai.sampleA', { total: m(s.total), last: m(last.amount), date: '<bdi>' + F.date(last.date, 'short') + '</bdi>' });
  }

  /* "I spent more than my number": 3 numbered steps from TZ.overspend.plan (rules + data).
     msg.demo (design state / #plan link) uses a sample money check when none was saved. */
  function plan(msg) {
    let d = D.get();
    if (msg.demo && !d.moneyCheck) d = TZ.overspend.demoCopy(d);
    const pl = TZ.overspend.plan(d);
    return (msg.smart ? tag() : '') + '<p>' + pl.intro + '</p>' +
      '<ol class="ask-viz ask-steps">' + pl.steps.map(function (s, i) {
        return '<li class="ask-step"><span class="ask-step__n" aria-hidden="true">' + n(i + 1) + '</span><span>' + s + '</span></li>';
      }).join('') + '</ol>' +
      '<p class="ask-soft">' + pl.outro + '</p>' +
      '<p class="ask-fine">' + IC.icon('info') + '<span>' + I.t('ask.advice') + '</span></p>';
  }

  /* Short question chips (used by "didn't understand" and "resting") */
  function chips() {
    return '<div class="ask-chips">' + ['spend', 'why', 'debt', 'goal'].map(function (k) {
      return '<button type="button" class="chip ask-chip" data-q="' + k + '">' + I.t('ask.chip.' + k, { amount: F.num(SPEND_EXAMPLE) }) + '</button>';
    }).join('') + '</div>';
  }

  function unclear() { return p('ask.ai.unclear') + chips(); }
  function resting() { return p('ask.ai.resting') + chips(); }
  function limit() {
    return p('ask.ai.limit') +
      '<p class="ask-plan">' + IC.icon('crown') + '<span>' + I.t('ask.ai.limitPlan') + ' ' +
      '<a href="' + TZ.page.url('paywall') + '">' + I.t('ask.ai.limitLink') + '</a></span></p>';
  }

  TZ.askAnswers = { SPEND_EXAMPLE: SPEND_EXAMPLE, spend: spend, why: why, debt: debt, goal: goal, savings: savings, plan: plan, unclear: unclear, resting: resting, limit: limit };
})();
