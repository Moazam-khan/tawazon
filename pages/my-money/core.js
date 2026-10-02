/* My money — shared state + small helpers for the section files and debt details.
   MM.use(data, live)  live = save to TZ.data (false for demo working copies)
   MM.act(fn, message) change data, save, re-render, toast with Undo            */
window.MM = (function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, I = TZ.i18n, IC = TZ.icons;
  let data = null, live = true, refreshFn = function () {};

  function use(d, isLive) { data = d; live = isLive !== false; }
  function get() { return data; }
  function calc(d) { return TZ.data.calculate(d || data); }
  function commit() { if (live) TZ.data.save(data); }
  function snap() { return JSON.parse(JSON.stringify(data)); }
  function onRefresh(fn) { refreshFn = fn; }
  function refresh() { refreshFn(); }
  function uid() { return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function name(item) { return TZ.data.name(item); }
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function phone() { return document.querySelector('.phone'); }

  /* A sample-data copy with nothing in it (demo "empty" state) */
  function emptyCopy() {
    const d = TZ.data.get();
    d.fixed = []; d.debts = []; d.owedToMe = []; d.goals = [];
    d.savings = { total: 0, log: [] };
    d.adjust = 0;
    return d;
  }

  /* Plain-language follow-up about the daily number */
  function changeLine(from, to) {
    return from === to ? I.t('myMoney.stays', { amount: F.money(to) })
                       : I.t('myMoney.change', { from: F.num(from), to: F.num(to) });
  }

  function toast(message, onUndo) {
    return TZ.ui.toast(phone(), onUndo ? { message: message, undoLabel: I.t('common.undo'), onUndo: onUndo } : { message: message, duration: 3500 });
  }

  /* Change data, save, re-render, then toast with Undo (restores a snapshot) */
  function act(fn, message, onUndo) {
    const before = snap(), from = calc().daily;
    fn(data);
    commit();
    const to = calc().daily;
    refresh();
    const msg = typeof message === 'function' ? message(from, to) : message;
    toast(msg, function () { undo(before, onUndo); });
    return { from: from, to: to, before: before };
  }
  function undo(before, onUndo) {
    data = before;
    commit();
    if (onUndo) onUndo();
    refresh();
    toast(I.t('myMoney.undone'));
  }

  function confirmRemove(itemName, onYes, opts) {
    opts = opts || {};
    return P.confirm({
      title: opts.title || I.t('myMoney.removeTitle', { name: itemName }),
      text: opts.text || I.t('myMoney.removeText'),
      yes: opts.yes || I.t('common.remove'), no: I.t('common.keep'), icon: opts.icon || 'trash',
      tone: opts.tone
    }).then(function (ok) { if (ok) onYes(); return ok; });
  }

  /* Next date a payment falls on (month 1-12 for yearly payments) */
  /* paid = already paid from this salary, so a date before the next salary moves on */
  function nextDue(day, month, paid) {
    const t = TZ.data.parse(data.today);
    const salary = TZ.data.parse(TZ.data.period(data.today, data.salaryDay).next);
    function at(yy, mm) { return new Date(yy, mm, Math.min(day, new Date(yy, mm + 1, 0).getDate())); }
    function after(dt) { return month ? at(dt.getFullYear() + 1, dt.getMonth()) : at(dt.getFullYear(), dt.getMonth() + 1); }
    let dt = at(t.getFullYear(), month ? month - 1 : t.getMonth());
    if (dt < t) dt = after(dt);
    if (paid && dt < salary) dt = after(dt);
    return TZ.data.iso(dt);
  }

  /* ---------- markup pieces ---------- */
  function summary(o) {
    return '<section class="card mm-sum">' +
      '<div class="mm-sum__top"><span class="mm-sum__icon' + (o.sand ? ' mm-sum__icon--sand' : '') + '">' + IC.icon(o.icon) + '</span>' +
        '<h2 class="mm-sum__label" data-i18n="' + o.labelKey + '"></h2></div>' +
      '<p class="mm-sum__value"><bdi class="mm-sum__num num">' + F.num(o.amount) + '</bdi>' +
        '<span class="mm-sum__cur">' + I.currency() + '</span></p>' +
      (o.lineKey ? '<p class="mm-sum__line" data-i18n="' + o.lineKey + '"' + P.vars(o.lineVars) + '></p>' : '') +
    '</section>';
  }

  /* Top of an item: icon · [title … amount] with the details underneath (full width) */
  function head(o) {
    return '<div class="mm-item__main">' +
      '<span class="row__icon' + (o.sand ? ' row__icon--sand' : '') + '">' + IC.icon(o.icon) + '</span>' +
      '<span class="mm-item__body"><span class="mm-item__line">' +
        (o.titleKey ? '<span class="row__title" data-i18n="' + o.titleKey + '"></span>' : '<span class="row__title">' + P.esc(o.title) + '</span>') + o.end + '</span>' +
        (o.sub || '') + '</span>' +
    '</div>';
  }

  function empty(mood, ns, act) {
    return '<div class="card mm-empty empty">' +
      IC.mascot(mood, 'mascot--float', I.t('brand.short')) +
      '<h2 class="empty__title" data-i18n="' + ns + '.emptyTitle"></h2>' +
      '<p class="empty__text" data-i18n="' + ns + '.emptyText"></p>' +
      '<button type="button" class="btn btn--primary" data-act="' + act + '">' + IC.icon('plus') +
        '<span data-i18n="' + ns + '.add"></span></button>' +
    '</div>';
  }

  function addBtn(act, key) {
    return '<button type="button" class="btn btn--secondary btn--block mm-add" data-act="' + act + '">' +
      IC.icon('plus') + '<span data-i18n="' + key + '"></span></button>';
  }

  function note(icon, key, sand) {
    return '<p class="note' + (sand ? ' note--sand' : '') + '">' + IC.icon(icon) + '<span data-i18n="' + key + '"></span></p>';
  }

  /* Edit + remove icon buttons for one item */
  function tools(sec, id, itemName) {
    const v = P.vars({ name: itemName });
    return '<span class="mm-tools">' +
      '<button type="button" class="mm-icon-btn" data-act="' + sec + ':edit" data-id="' + P.esc(id) + '" data-i18n-aria="myMoney.editAria"' + v + '>' + IC.icon('edit') + '</button>' +
      '<button type="button" class="mm-icon-btn" data-act="' + sec + ':remove" data-id="' + P.esc(id) + '" data-i18n-aria="myMoney.removeAria"' + v + '>' + IC.icon('trash') + '</button>' +
    '</span>';
  }

  return {
    use: use, get: get, calc: calc, commit: commit, snap: snap, onRefresh: onRefresh, refresh: refresh,
    uid: uid, name: name, find: find, emptyCopy: emptyCopy, changeLine: changeLine, toast: toast,
    act: act, undo: undo, confirmRemove: confirmRemove, nextDue: nextDue,
    summary: summary, head: head, empty: empty, addBtn: addBtn, note: note, tools: tools,
    sections: {}
  };
})();
