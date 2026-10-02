/* Every screen of the prototype in journey order, with its design states.
   Used by the Explorer (index.html) and by tools/capture-all.js.
   Screenshots live in explore/shots/<lang>/<id with / as _>--<state>.png */
window.TZ = window.TZ || {};
TZ.SCREENS = [
  { id: 'welcome',               group: 'start',   icon: 'heart',    states: [''] },
  { id: 'setup',                 group: 'start',   icon: 'list',     states: ['step1', 'step2', 'step3', 'step3-filled'] },
  { id: 'reveal',                group: 'start',   icon: 'sparkle',  states: ['result', 'math'] },
  { id: 'paywall',               group: 'start',   icon: 'crown',    states: ['reveal', 'day3', 'success'] },
  { id: 'home',                  group: 'daily',   icon: 'home',     states: ['good', 'careful', 'tight', 'check', 'over', 'ranout'] },
  { id: 'month',                 group: 'daily',   icon: 'calendar', states: [''] },
  { id: 'how-calculated',        group: 'daily',   icon: 'question', states: [''] },
  { id: 'ask',                   group: 'daily',   icon: 'chat',     states: ['on', 'plan', 'resting', 'offline', 'limit', 'consent', 'unclear'] },
  { id: 'my-money',              group: 'money',   icon: 'wallet',   states: ['overview', 'owe', 'fixed', 'owed', 'savings', 'goals'], labels: 'myMoney.tab' },
  { id: 'my-money/debt-details', group: 'money',   icon: 'car',      states: ['plan', 'last', 'done'] },
  { id: 'seasons',               group: 'money',   icon: 'moon',     states: ['plan', 'saving'] },
  { id: 'settings',              group: 'account', icon: 'settings', states: ['guest', 'signedIn'] },
  { id: 'login',                 group: 'account', icon: 'shield',   states: ['start', 'found', 'done'] },
  { id: 'states',                group: 'moments', icon: 'party',    states: ['bad-month', 'salary-day', 'debt-paid', 'money-received', 'offline', 'error', 'empty-home', 'tour', 'notifications', 'widget'] }
];
TZ.SCREEN_GROUPS = ['start', 'daily', 'money', 'account', 'moments'];

/* helpers */
TZ.screenKey = function (id) { return id.replace(/[-/](\w)/g, function (m, c) { return c.toUpperCase(); }); };
TZ.stateLabelKey = function (s, st) {
  const camel = st.replace(/-(\w)/g, function (m, c) { return c.toUpperCase(); });
  return (s.labels || TZ.screenKey(s.id.split('/').pop()) + '.demo') + '.' + camel;
};
TZ.shotPath = function (s, st, lang) { return 'explore/shots/' + lang + '/' + s.id.replace('/', '_') + (st ? '--' + st : '') + '.png'; };

/* Review ticks: "<screen id>:<lang>" -> true. Saved in this browser only. */
TZ.review = (function () {
  const KEY = 'tz-review-ticks';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  let ticks = load();
  return {
    has: function (id, lang) { return !!ticks[id + ':' + lang]; },
    set: function (id, lang, on) { if (on) ticks[id + ':' + lang] = true; else delete ticks[id + ':' + lang]; save(ticks); },
    done: function () { return Object.keys(ticks).length; },
    total: function () { return TZ.SCREENS.length * 2; },
    snapshot: function () { return JSON.parse(JSON.stringify(ticks)); },
    restore: function (o) { ticks = o || {}; save(ticks); },
    clear: function () { ticks = {}; save(ticks); }
  };
})();
