/* Explorer — the Overview dashboard: the number, what's inside, the journey,
   the sample person, review progress and the decisions behind the design. */
window.TZ = window.TZ || {};
TZ.ex = TZ.ex || {};

TZ.ex.overview = (function () {
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons;
  const v = function (o) { return P.vars(o); };

  function countTexts() {
    let n = 0;
    (function walk(o) {
      Object.keys(o).forEach(function (k) {
        const x = o[k];
        if (x && typeof x === 'object' && x.other == null) walk(x); else n += 1;
      });
    })(TZ.LANGS.en);
    return n;
  }

  function hero(r, lang) {
    const how = {
      salary: F.money(r.salary), setAside: F.money(r.setAside), use: F.money(r.moneyICanUse),
      days: I.t('common.days', { n: F.num(r.daysLeft) }), daily: F.money(r.daily)
    };
    return '<section class="ex-hero" aria-labelledby="ex-hero-title">' +
      '<div class="ex-hero__text">' +
        '<p class="ex-eyebrow ex-eyebrow--light" data-i18n="explore.hero.eyebrow"></p>' +
        '<h2 class="ex-hero__label" id="ex-hero-title" data-i18n="explore.hero.today"></h2>' +
        '<p class="ex-hero__num"><bdi class="num">' + F.num(r.daily) + '</bdi><span>' + I.currency() + '</span></p>' +
        '<p class="ex-hero__how" data-i18n="explore.hero.how"' + v(how) + '></p>' +
        '<div class="ex-hero__actions">' +
          '<a class="btn ex-btn-light" href="' + P.url('welcome') + '">' + IC.icon('arrow', { dir: true }) + '<span data-i18n="explore.hero.try"></span></a>' +
          '<a class="btn ex-btn-ghost" href="#screens" data-tab-link="screens" data-i18n="explore.hero.browse"></a>' +
        '</div>' +
      '</div>' +
      '<div class="ex-hero__phone" aria-hidden="true">' +
        '<img src="' + TZ.shotPath(TZ.SCREENS[4], 'good', lang) + '" width="500" height="1082" alt="">' +
      '</div>' +
    '</section>';
  }

  function inside() {
    const states = TZ.SCREENS.reduce(function (s, x) { return s + x.states.length; }, 0);
    const tiles = [
      ['phone', TZ.SCREENS.length, 'screens'], ['list', states, 'states'], ['globe', 2, 'languages'],
      ['doc', countTexts(), 'texts'], ['eye', 3, 'sizes'], ['moon', 2, 'themes']
    ];
    return '<section class="ex-sec" aria-labelledby="ex-inside">' +
      '<h2 class="ex-h2" id="ex-inside" data-i18n="explore.inside.title"></h2>' +
      '<ul class="ex-tiles">' + tiles.map(function (t) {
        return '<li class="ex-tile"><span class="ex-tile__icon">' + IC.icon(t[0]) + '</span>' +
          '<span class="ex-tile__num num">' + F.num(t[1]) + '</span>' +
          '<span class="ex-tile__label" data-i18n="explore.inside.' + t[2] + '"></span></li>';
      }).join('') + '</ul></section>';
  }

  function journey() {
    return '<section class="ex-sec" aria-labelledby="ex-journey">' +
      '<div class="ex-sec__head"><h2 class="ex-h2" id="ex-journey" data-i18n="explore.journey.title"></h2>' +
        '<p class="ex-muted" data-i18n="explore.journey.lead"></p></div>' +
      '<ol class="ex-journey">' + TZ.SCREEN_GROUPS.map(function (g, i) {
        const list = TZ.SCREENS.filter(function (s) { return s.group === g; });
        return '<li><a class="ex-step" href="#screens" data-tab-link="screens" data-group="' + g + '">' +
          '<span class="ex-step__num num">' + F.num(i + 1) + '</span>' +
          '<span class="ex-step__body"><span class="ex-step__title" data-i18n="gallery.group.' + g + '"></span>' +
            '<span class="ex-step__count" data-i18n="explore.journey.count"' + v({ n: F.num(list.length) }) + '></span>' +
            '<span class="ex-step__names">' + list.map(function (s) {
              return '<span class="ex-chip" data-i18n="gallery.screen.' + TZ.screenKey(s.id) + '.name"></span>';
            }).join('') + '</span></span>' +
          IC.icon('chevron', { dir: true, cls: 'ex-step__chev' }) + '</a></li>';
      }).join('') + '</ol></section>';
  }

  function person(d, r) {
    const debt = d.debts[0], goal = d.goals[0], owed = d.owedToMe[0];
    const dp = TZ.data.debtPlan(debt, d.today), gp = TZ.data.goalPlan(goal, d.today);
    const parts = d.fixed.map(function (f) { return { key: f.nameKey, amount: TZ.data.monthly(f), cls: 'ex-seg--' + f.id }; })
      .concat([{ key: debt.nameKey, amount: debt.monthly, cls: 'ex-seg--debt' }, { key: 'explore.person.use', amount: r.plan, cls: 'ex-seg--use' }]);
    return '<section class="ex-sec ex-card" aria-labelledby="ex-person">' +
      '<div class="ex-sec__head"><h2 class="ex-h2" id="ex-person" data-i18n="explore.person.title"></h2>' +
        '<p class="ex-muted" data-i18n="explore.person.lead"></p></div>' +
      '<div class="ex-person__salary"><span class="ex-muted" data-i18n="explore.person.salary"' + v({ day: F.num(d.salaryDay) }) + '></span>' +
        '<strong class="ex-big">' + F.moneyHtml(r.salary) + '</strong></div>' +
      '<p class="ex-label" data-i18n="explore.person.split"></p>' +
      '<div class="ex-split" aria-hidden="true">' + parts.map(function (x) {
        return '<span class="ex-seg ' + x.cls + '" style="flex-grow:' + x.amount + '"></span>';
      }).join('') + '</div>' +
      '<ul class="ex-legend">' + parts.map(function (x) {
        return '<li><span class="ex-dot ' + x.cls + '"></span><span data-i18n="' + x.key + '"></span><strong>' + F.moneyHtml(x.amount) + '</strong></li>';
      }).join('') + '</ul>' +
      '<ul class="ex-facts">' +
        fact('calendar', 'explore.person.daily', { amount: F.money(r.daily), days: I.t('common.days', { n: F.num(r.daysLeft) }) }) +
        fact('car', 'explore.person.debt', { date: F.date(dp.endDate, 'month') }) +
        fact('person', 'explore.person.owed', { name: TZ.data.name(owed), amount: F.money(owed.amount) }, true) +
        fact('goal', 'explore.person.goal', { name: TZ.data.name(goal), amount: F.money(gp.perMonth) }, true) +
      '</ul></section>';
  }
  function fact(icon, key, vars, sand) {   /* sand = money in or kept */
    return '<li><span class="ex-fact__icon' + (sand ? ' ex-fact__icon--sand' : '') + '">' + IC.icon(icon) + '</span><span data-i18n="' + key + '"' + v(vars) + '></span></li>';
  }

  function progress() {
    const done = TZ.review.done(), total = TZ.review.total();
    const pct = Math.round(done / total * 100);
    const msg = done === 0 ? 'none' : done >= total ? 'all' : 'some';
    const C = 2 * Math.PI * 26;
    return '<section class="ex-sec ex-card ex-progress" aria-labelledby="ex-progress">' +
      '<svg class="ex-ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="ex-ring__track"/>' +
        (done ? '<circle cx="32" cy="32" r="26" class="ex-ring__fill" stroke-dasharray="' + (C * pct / 100).toFixed(1) + ' ' + C.toFixed(1) + '"/>' : '') + '<text x="32" y="32" class="ex-ring__pct">' + F.num(pct) + '%</text></svg>' +
      '<div class="ex-progress__body">' +
        '<h2 class="ex-h2" id="ex-progress" data-i18n="explore.progress.title"></h2>' +
        '<p class="ex-progress__count" data-i18n="explore.progress.count"' + v({ done: F.num(done), total: F.num(total) }) + '></p>' +
        '<p class="ex-muted" data-i18n="explore.progress.' + msg + '"></p>' +
        '<a class="btn btn--secondary ex-btn-sm" href="#review" data-tab-link="review" data-i18n="explore.progress.go"></a>' +
      '</div></section>';
  }

  function decisions() {
    const keys = ['daily', 'ai', 'check', 'over', 'status', 'changes', 'debts', 'yearly', 'free', 'prices', 'words'];
    return '<section class="ex-sec" aria-labelledby="ex-decisions">' +
      '<h2 class="ex-h2" id="ex-decisions" data-i18n="explore.decisions.title"></h2>' +
      '<div class="ex-decisions">' + keys.map(function (k) {
        return '<details class="ex-decision"><summary><span data-i18n="explore.decisions.' + k + '.t"></span>' +
          IC.icon('chevron', { cls: 'ex-decision__chev' }) + '</summary>' +
          '<p data-i18n="explore.decisions.' + k + '.d"></p></details>';
      }).join('') + '</div></section>';
  }

  function render(lang) {
    const d = TZ.data.get(), r = TZ.data.calculate(d);
    return hero(r, lang) +
      '<div class="ex-columns"><div class="ex-col">' + inside() + journey() + '</div>' +
      '<div class="ex-col">' + progress() + person(d, r) + '</div></div>' +
      decisions();
  }

  return { render: render };
})();
