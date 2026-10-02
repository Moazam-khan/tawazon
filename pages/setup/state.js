/* Setup — state, presets and the working copy used for the live preview.
   Shared with steps.js, payments.js and script.js through window.SU. */
window.SU = (function () {
  'use strict';
  const SAMPLE = TZ.data.SAMPLE;

  /* Fixed-payment presets (order = order of the chips) */
  const PRESETS = [
    { id: 'rent',         icon: 'rent' },
    { id: 'bills',        icon: 'bills' },
    { id: 'electricity',  icon: 'electricity' },
    { id: 'water',        icon: 'water' },
    { id: 'internet',     icon: 'internet' },
    { id: 'phone',        icon: 'phone' },
    { id: 'school',       icon: 'school' },
    { id: 'family',       icon: 'heart' },
    { id: 'worker',       icon: 'person' },
    { id: 'subscription', icon: 'subscription' },
    { id: 'loan',         icon: 'debt', debt: true },
    { id: 'other',        icon: 'other', repeat: true }
  ];
  function preset(id) { return PRESETS.filter(function (p) { return p.id === id; })[0] || PRESETS[PRESETS.length - 1]; }

  /* What the person has answered so far (kept across re-renders) */
  const state = {
    step: 1,
    salary: 0,
    day: SAMPLE.salaryDay,       // default pay day
    lastDay: false,              // "Last day of the month" chosen
    items: [],                   // { id, preset, amount, every: 'month'|'year', name?, sample? }
    showZero: false              // show the kind "please enter an amount" message
  };
  let seq = 0;
  function newId() { seq += 1; return 'p' + Date.now().toString(36) + seq; }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* Sample payments for "Use example numbers" and the review state */
  function sampleItems() {
    const out = SAMPLE.fixed.map(function (f) {
      return { id: newId(), preset: f.preset, amount: f.amount, every: f.every, sample: f.id };
    });
    SAMPLE.debts.forEach(function (x) {
      out.push({ id: newId(), preset: 'loan', amount: x.monthly, every: 'month', sample: x.id, nameKey: x.nameKey });
    });
    return out;
  }
  function useExample() {
    state.salary = SAMPLE.salary;
    state.day = SAMPLE.salaryDay;
    state.lastDay = false;
    state.items = sampleItems();
    state.showZero = false;
  }
  function reset() {
    state.salary = 0; state.day = SAMPLE.salaryDay; state.lastDay = false;
    state.items = []; state.showZero = false;
  }

  function payDay() { return state.lastDay ? 31 : state.day; }
  function isDebt(item) { return preset(item.preset).debt === true; }
  function itemName(item, lang) {
    if (item.nameKey) return TZ.i18n.t(item.nameKey, null, lang);
    if (item.name) return item.name;
    return TZ.i18n.t('preset.' + item.preset, null, lang);
  }
  function monthlyOf(item) { return TZ.data.monthly(item); }

  /* Shapes TZ.data expects. Sample items keep the sample's details so every
     other screen tells the same story; new items get calm defaults. */
  function toFixed(item) {
    const base = item.sample ? clone(SAMPLE.fixed.filter(function (f) { return f.id === item.sample; })[0] || {}) : {};
    return Object.assign(base, {
      id: item.sample || item.id, preset: item.preset,
      nameKey: item.name ? undefined : 'preset.' + item.preset, name: item.name || undefined,
      amount: item.amount, every: item.every,
      dueDay: base.dueDay || 1, paid: base.paid || false
    });
  }
  function toDebt(item) {
    const base = item.sample ? clone(SAMPLE.debts.filter(function (x) { return x.id === item.sample; })[0] || {}) : {};
    /* We only know the monthly payment; "Money I owe" asks for what is left later. */
    const guess = item.amount * 12;
    return Object.assign({
      id: item.id, preset: 'loan', nameKey: 'preset.loan',
      total: guess, remaining: guess, dueDay: 1, log: [], needsDetails: true
    }, base, { monthly: item.amount });
  }

  /* Working copy of the money data for the live preview and for saving */
  function work() {
    const d = clone(SAMPLE);
    d.today = SAMPLE.today;
    d.salary = state.salary;
    d.salaryDay = payDay();
    d.salaryLastDay = state.lastDay;
    d.fixed = state.items.filter(function (i) { return !isDebt(i); }).map(toFixed);
    d.debts = state.items.filter(isDebt).map(toDebt);
    d.adjust = 0;
    d.moneyCheck = null;
    return d;
  }
  function preview() { return TZ.data.calculate(work()); }

  function setAside() {
    return state.items.reduce(function (s, i) { return s + monthlyOf(i); }, 0);
  }

  /* Save into TZ.data (keeps the rest of the demo story: savings, goals, people) */
  function save() {
    const w = work();
    const d = TZ.data.get();
    ['today', 'salary', 'salaryDay', 'salaryLastDay', 'fixed', 'debts', 'adjust', 'moneyCheck'].forEach(function (k) { d[k] = w[k]; });
    TZ.data.save(d);
  }

  return {
    state: state, PRESETS: PRESETS, preset: preset, newId: newId,
    useExample: useExample, sampleItems: sampleItems, reset: reset,
    payDay: payDay, isDebt: isDebt, itemName: itemName, monthlyOf: monthlyOf,
    work: work, preview: preview, setAside: setAside, save: save
  };
})();
