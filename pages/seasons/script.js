/* Big months of the year — Ramadan, the two Eids, summer, back to school.
   Turning a season on puts about (cost ÷ months left) aside every month, like a
   fixed payment, so the daily number goes down a little now and the month itself
   is no shock. States: #plan (live data) · #saving (Ramadan + Eid al-Fitr on a
   working copy that is never saved). */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, D = TZ.data;
  let mode = 'plan', data = null, live = true;

  /* ---------- data ---------- */
  function readHash() { mode = location.hash === '#saving' ? 'saving' : 'plan'; }
  function load() {
    data = D.get();
    live = mode !== 'saving';
    if (!live) data.seasons.forEach(function (s) { s.active = s.id === 'ramadan' || s.id === 'eidFitr'; });
  }
  function commit() { if (live) D.save(data); }
  function snap() { return JSON.parse(JSON.stringify(data)); }
  function find(id, d) { return ((d || data).seasons || []).filter(function (s) { return s.id === id; })[0]; }
  function daily(d) { return D.calculate(d || data).daily; }
  function phone() { return document.querySelector('.phone'); }

  /* ---------- markup ---------- */
  function body() {
    return SN.intro() + SN.summary(data) + SN.list(data) + SN.keepNote();
  }
  function render() {
    document.getElementById('app').innerHTML =
      P.header({ titleKey: 'seasons.title', back: 'my-money' }) +
      '<main class="phone__scroll" data-main><div class="screen sn" data-body>' + body() + '</div></main>';
  }
  /* Re-draw the content only (keeps scroll position and the toast) */
  function refresh(focusSel) {
    const box = document.querySelector('[data-body]');
    if (!box) return;
    box.innerHTML = body();
    I.apply(box);
    if (focusSel) { const el = box.querySelector(focusSel); if (el) el.focus({ preventScroll: true }); }
  }
  /* One season changed: update that card and the summary in place, so the switch can slide */
  function paint(id) {
    const s = find(id), li = document.querySelector('[data-item="' + id + '"]');
    if (!li) { refresh(); return; }
    li.classList.toggle('is-on', !!s.active);
    const sw = li.querySelector('[data-act="toggle"]');
    sw.setAttribute('aria-checked', String(!!s.active));
    li.querySelector('.sn-switch__text').setAttribute('data-i18n', s.active ? 'seasons.saving' : 'seasons.start');
    I.apply(li);
    const sum = document.querySelector('[data-sum]'), tmp = document.createElement('div');
    tmp.innerHTML = SN.summary(data);
    I.apply(tmp);
    sum.replaceWith(tmp.firstChild);
  }

  /* ---------- toast with Undo ---------- */
  function toast(message, before, focusSel) {
    TZ.ui.toast(phone(), {
      message: message,
      undoLabel: I.t('common.undo'),
      onUndo: function () {
        data = before;
        commit();
        refresh(focusSel);
        TZ.ui.toast(phone(), { message: I.t('seasons.undone'), duration: 3500 });
      }
    });
  }

  /* ---------- actions ---------- */
  function toggle(id) {
    const before = snap(), from = daily(), s = find(id);
    s.active = !s.active;
    commit();
    paint(id);
    toast(I.t(s.active ? 'seasons.toastOn' : 'seasons.toastOff', { name: SN.name(s), from: F.num(from), to: F.num(daily()) }),
      before, '[data-act="toggle"][data-id="' + id + '"]');
  }

  function edit(id) {
    const s = find(id), nm = SN.name(s), from = daily();
    const focusSel = '[data-act="edit"][data-id="' + id + '"]';
    function update(n, el) {
      const t = snap(), ts = find(id, t);
      ts.amount = n || 0;
      const per = el.querySelector('[data-sn="per"]'), dl = el.querySelector('[data-sn="daily"]');
      per.textContent = I.t('seasons.perMonth', { amount: F.money(n ? D.seasonPlan(ts, t.today).perMonth : 0) });
      dl.hidden = !(s.active && n);
      dl.textContent = I.t('seasons.preview', { from: F.num(from), to: F.num(daily(t)) });
    }
    const sh = TZ.keypad.sheet({
      titleKey: 'seasons.editTitle', titleVars: { name: nm },
      labelKey: 'seasons.amountLabel',
      value: s.amount,
      extraHtml: SN.preview(),
      check: function (n) { return n > 50000 ? I.t('check.high', { amount: F.money(n) }) : ''; },
      onChange: update,
      onSave: function (n) {
        const before = snap();
        find(id).amount = n;
        commit();
        refresh();
        const to = daily(), cur = find(id);
        const msg = cur.active
          ? I.t('seasons.toastAmount', { name: nm, from: F.num(from), to: F.num(to) })
          : I.t('seasons.toastAmountOff', { name: nm, amount: F.money(D.seasonPlan(cur, data.today).perMonth) });
        toast(msg, before, focusSel);
        setTimeout(function () { const b = document.querySelector(focusSel); if (b) b.focus({ preventScroll: true }); }, 480);
      }
    });
    update(s.amount, sh.el);
    /* the preview lines are filled from JS: refill them after a language switch */
    document.addEventListener('tz:langchange', function again() {
      if (!sh.el.isConnected) { document.removeEventListener('tz:langchange', again); return; }
      update(sh.pad.get(), sh.el);
    });
  }

  document.addEventListener('click', function (e) {
    const b = e.target.closest('[data-act]');
    if (!b || !b.closest('[data-body]')) return;
    const id = b.getAttribute('data-id');
    if (b.getAttribute('data-act') === 'toggle') toggle(id);
    else if (b.getAttribute('data-act') === 'edit') edit(id);
  });

  window.addEventListener('hashchange', function () {
    const was = mode;
    readHash();
    if (was !== mode) { load(); refresh(); }
  });

  readHash();
  load();
  P.boot({ titleKey: 'seasons.title', render: render });
  P.demoBar([
    { id: 'plan', labelKey: 'seasons.demo.plan' },
    { id: 'saving', labelKey: 'seasons.demo.saving' }
  ], function (id) {
    mode = id;
    load();
    refresh();
  }, mode);
})();
