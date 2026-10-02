/* ==========================================================================
   Tawazon Plus — sample data + calculate()

   ##########################################################################
   ##  DESIGN MOCK ONLY - real engine comes later.                         ##
   ##  These numbers exist so every screen tells the same story.           ##
   ##########################################################################

   The story (matches the master brief):
     Salary 8,000 · paid on the 27th · today is 7 Oct 2026
     Rent 2,500 + Bills 600 + Car loan payment 900  = 4,000 set aside
     Money I can use 4,000 · 20 days until salary  -> 200 a day
     Car loan: 3,500 still to pay · Ahmed owes me 300

   Rules the screens follow (see README "Decisions"):
     - The daily number never goes below 0.
     - Changes the number: money added to savings (-), an EXTRA debt payment (-),
       money received (+), "Can I spend X?" preview (-), a money check (sets it).
     - Does NOT change it: marking a planned payment as paid, goals.
     - Debt payments live only in "Money I owe" (never also in fixed payments).
     - Yearly payments are spread over 12 months.

   Usage:
     const d = TZ.data.get();            // working copy (saved between pages)
     const r = TZ.data.calculate(d);     // { moneyICanUse, daysLeft, daily, status, ... }
     TZ.data.save(d);  TZ.data.reset();
   ========================================================================== */
window.TZ = window.TZ || {};

TZ.data = (function () {
  const KEY = 'tz-demo';

  const SAMPLE = {
    today: '2026-10-07',
    salary: 8000,
    salaryDay: 27,

    /* Fixed payments: monthly or yearly (yearly is spread over 12 months) */
    fixed: [
      { id: 'rent',  preset: 'rent',  nameKey: 'preset.rent',  amount: 2500, every: 'month', dueDay: 1,  paid: true  },
      { id: 'bills', preset: 'bills', nameKey: 'preset.bills', amount: 600,  every: 'month', dueDay: 15, paid: false }
    ],

    /* Money I owe. The monthly payment is part of the plan. */
    debts: [
      {
        id: 'car', preset: 'car', nameKey: 'mock.carLoan',
        total: 10800, remaining: 3500, monthly: 900, dueDay: 20,
        log: [
          { date: '2026-09-20', amount: 900 },
          { date: '2026-08-20', amount: 900 },
          { date: '2026-07-20', amount: 900 }
        ]
      }
    ],

    /* People owe me */
    owedToMe: [
      { id: 'ahmed', nameKey: 'mock.ahmed', amount: 300, since: '2026-09-15' }
    ],

    /* Savings: money put aside, already out of "money I can use" */
    savings: {
      total: 2000,
      log: [
        { date: '2026-10-05', amount: 300 },
        { date: '2026-09-28', amount: 500 },
        { date: '2026-08-28', amount: 500 },
        { date: '2026-07-28', amount: 700 }
      ]
    },

    /* Goals never change the daily number */
    goals: [
      { id: 'umrah', preset: 'goal', nameKey: 'mock.goalUmrah', target: 6000, saved: 1200, by: '2027-06-01' }
    ],

    /* Big months of the year (Hijri dates are approximate — they follow the moon).
       active: true means a monthly amount is set aside so the season is ready. */
    seasons: [
      { id: 'ramadan', icon: 'moon',   date: '2027-02-08', amount: 1500, active: false },
      { id: 'eidFitr', icon: 'gift',   date: '2027-03-10', amount: 1000, active: false },
      { id: 'eidAdha', icon: 'gift',   date: '2027-05-16', amount: 1500, active: false },
      { id: 'summer',  icon: 'sun',    date: '2027-07-01', amount: 3000, active: false },
      { id: 'school',  icon: 'school', date: '2027-08-22', amount: 1200, active: false }
    ],

    /* Daily number on each day of this salary period (27 Sep → today), for charts.
       Changes match the events below: +450 from Sara on 28 Sep, 300 to savings on 5 Oct. */
    dailyHistory: [
      { date: '2026-09-27', daily: 190 }, { date: '2026-09-28', daily: 205 }, { date: '2026-09-29', daily: 205 },
      { date: '2026-09-30', daily: 200 }, { date: '2026-10-01', daily: 200 }, { date: '2026-10-02', daily: 205 },
      { date: '2026-10-03', daily: 210 }, { date: '2026-10-04', daily: 215 }, { date: '2026-10-05', daily: 200 },
      { date: '2026-10-06', daily: 200 }, { date: '2026-10-07', daily: 200 }
    ],

    /* Past salary periods (month = when that salary period ended).
       leftOver = money not spent by salary day; saved = what went to savings.
       Saved adds up with the 300 on 5 Oct to the 2,000 savings total. */
    months: [
      { month: '2026-05', leftOver: 0,   saved: 0 },
      { month: '2026-06', leftOver: 180, saved: 0 },
      { month: '2026-07', leftOver: 700, saved: 700 },
      { month: '2026-08', leftOver: 500, saved: 500 },
      { month: '2026-09', leftOver: 500, saved: 500 }
    ],

    /* Recent events for "Why did my number change?" (newest first) */
    events: [
      { date: '2026-10-05', type: 'savings',  amount: 300, from: 215, to: 200 },
      { date: '2026-10-01', type: 'paid',     amount: 2500, from: 200, to: 200, nameKey: 'preset.rent' },
      { date: '2026-09-28', type: 'received', amount: 450, from: 190, to: 205, nameKey: 'mock.sara' }
    ],

    /* Money not spent last month (shown on salary day: "Move it to savings?") */
    leftOverLastMonth: 340,

    /* Extra changes this month (+ received, - savings / extra debt payments) */
    adjust: 0,

    /* Last "How much money do you have now?" answer, or null */
    moneyCheck: null,

    account: { signedIn: false, trialDaysLeft: 2, plan: null },
    pricing: { year: 99, month: 29, trialDays: 3 },
    prefs: { reminder: true, time: '08:00', notifications: true, biometric: false, smartAnswers: true },
    ai: 'on'             // on | resting | offline | limit
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load(k)    { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }

  function get() {
    const raw = load(KEY);
    if (!raw) return clone(SAMPLE);
    try { return Object.assign(clone(SAMPLE), JSON.parse(raw)); } catch (e) { return clone(SAMPLE); }
  }
  function save(d) { store(KEY, JSON.stringify(d)); }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* ---------- dates ---------- */
  function parse(iso) { const p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(dt) {
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  /* Salary day 31 in a 30-day month is paid on the 30th (last day). */
  function salaryDate(y, m, day) { return new Date(y, m, Math.min(day, daysInMonth(y, m))); }
  const DAY = 86400000;

  function period(today, salaryDay) {
    const t = parse(today);
    let next = salaryDate(t.getFullYear(), t.getMonth(), salaryDay);
    if (next <= t) next = salaryDate(t.getFullYear(), t.getMonth() + 1, salaryDay);
    const prev = salaryDate(next.getFullYear(), next.getMonth() - 1, salaryDay);
    const periodDays = Math.round((next - prev) / DAY);
    const daysLeft = Math.round((next - t) / DAY);          // counts today, not salary day
    return { next: iso(next), prev: iso(prev), periodDays: periodDays, daysLeft: daysLeft, dayOfPeriod: periodDays - daysLeft + 1 };
  }

  /* ---------- the one calculation ---------- */
  function monthly(item) { return item.every === 'year' ? Math.round(item.amount / 12) : item.amount; }

  function calculate(d, opts) {
    d = d || get();
    opts = opts || {};
    const fixedMonthly = (d.fixed || []).reduce(function (s, f) { return s + monthly(f); }, 0);
    const debtMonthly  = (d.debts || []).reduce(function (s, x) { return s + (x.remaining > 0 ? Math.min(x.monthly, x.remaining) : 0); }, 0);
    const seasonsMonthly = (d.seasons || []).reduce(function (s, x) { return s + (x.active ? seasonPlan(x, d.today).perMonth : 0); }, 0);
    const setAside = fixedMonthly + debtMonthly + seasonsMonthly;
    const plan = d.salary - setAside;                           // money I can use this month
    const p = period(d.today, d.salaryDay);

    let moneyICanUse = d.moneyCheck ? d.moneyCheck.amount : plan;
    moneyICanUse += d.adjust || 0;
    moneyICanUse -= opts.spend || 0;

    const days = opts.spend ? Math.max(1, p.daysLeft - 1) : p.daysLeft;   // after spending today, from tomorrow
    const daily = Math.max(0, Math.floor(Math.max(0, moneyICanUse) / Math.max(1, days)));

    /* Status: compare with a normal day this month (good >= 80%, careful >= 50%) */
    const normalDaily = plan > 0 ? plan / p.periodDays : 0;
    const ratio = normalDaily ? daily / normalDaily : 0;
    const status = plan <= 0 || ratio < 0.5 ? 'tight' : ratio < 0.8 ? 'careful' : 'good';

    return {
      salary: d.salary,
      fixedMonthly: fixedMonthly,
      debtMonthly: debtMonthly,
      seasonsMonthly: seasonsMonthly,
      setAside: setAside,
      plan: plan,
      moneyICanUse: Math.max(0, moneyICanUse),
      daysLeft: p.daysLeft,
      periodDays: p.periodDays,
      dayOfPeriod: p.dayOfPeriod,
      nextSalary: p.next,
      daily: daily,
      normalDaily: Math.round(normalDaily),
      status: status,
      badMonth: plan < 0,
      shortBy: plan < 0 ? -plan : 0
    };
  }

  /* Overspend: compare a money check with what Tawazon expected.
     extra = how much more was spent than planned (0 if on track or better). */
  function overspend(d, haveNow) {
    const r = calculate(Object.assign({}, d, { moneyCheck: null }));
    const expected = r.moneyICanUse;
    const extra = Math.max(0, expected - haveNow);
    const after = calculate(Object.assign({}, d, { moneyCheck: { date: d.today, amount: haveNow } }));
    const fromSavings = Math.min(extra, (d.savings && d.savings.total) || 0);
    return {
      expected: expected, haveNow: haveNow, extra: extra,
      spreadDaily: after.daily, before: r.daily, lessPerDay: r.daily - after.daily,
      fromSavings: fromSavings, savingsAfter: ((d.savings && d.savings.total) || 0) - fromSavings,
      ranOut: haveNow <= 0, daysLeft: r.daysLeft
    };
  }

  /* "Can I spend 300 today?" -> what tomorrow's number becomes */
  function previewSpend(d, amount) {
    const now = calculate(d);
    const after = calculate(d, { spend: amount });
    return { today: now.daily, tomorrow: after.daily, fits: amount <= now.daily, left: now.moneyICanUse - amount };
  }

  /* Debt: how many payments left and when it ends */
  function debtPlan(debt, today) {
    if (!debt || debt.remaining <= 0) return { payments: 0, last: 0, endDate: null };
    const full = Math.floor(debt.remaining / debt.monthly);
    const last = debt.remaining - full * debt.monthly;
    const payments = full + (last > 0 ? 1 : 0);
    const t = parse(today || SAMPLE.today);
    let first = new Date(t.getFullYear(), t.getMonth(), debt.dueDay);
    if (first < t) first = new Date(t.getFullYear(), t.getMonth() + 1, debt.dueDay);
    const end = new Date(first.getFullYear(), first.getMonth() + payments - 1, debt.dueDay);
    return { payments: payments, last: last || debt.monthly, endDate: iso(end), paidPct: Math.round((1 - debt.remaining / debt.total) * 100) };
  }

  /* Goal: about how much to save each month (rounded up to 10) */
  function goalPlan(goal, today) {
    const t = parse(today || SAMPLE.today), by = parse(goal.by);
    const months = Math.max(1, (by.getFullYear() - t.getFullYear()) * 12 + by.getMonth() - t.getMonth());
    const left = Math.max(0, goal.target - goal.saved);
    return { months: months, left: left, perMonth: Math.ceil(left / months / 10) * 10, pct: Math.round(goal.saved / goal.target * 100) };
  }

  /* Season: salaries left before it starts and about how much to put aside each month (rounded up to 10) */
  function seasonPlan(season, today) {
    const t = parse(today || SAMPLE.today), by = parse(season.date);
    const months = Math.max(1, (by.getFullYear() - t.getFullYear()) * 12 + by.getMonth() - t.getMonth());
    return { months: months, perMonth: Math.ceil(season.amount / months / 10) * 10, daysAway: Math.round((by - t) / DAY) };
  }

  /* Display name of a sample item (translated) or a user-typed name */
  function name(item, lang) { return item.nameKey ? TZ.i18n.t(item.nameKey, null, lang) : (item.name || ''); }

  return {
    SAMPLE: SAMPLE, get: get, save: save, reset: reset,
    calculate: calculate, previewSpend: previewSpend, overspend: overspend, debtPlan: debtPlan, goalPlan: goalPlan, seasonPlan: seasonPlan,
    monthly: monthly, period: period, name: name, parse: parse, iso: iso
  };
})();
