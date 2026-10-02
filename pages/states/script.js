/* Special moments — a review page that shows rare screens inside the phone.
   Pick a screen in the state bar, or deep-link with #bad-month, #tour, … */
(function () {
  'use strict';
  const P = TZ.page, I = TZ.i18n, S = TZ.states;
  const ORDER = ['bad-month', 'salary-day', 'debt-paid', 'money-received', 'offline', 'error', 'empty-home', 'tour', 'notifications', 'widget'];
  function camel(id) { return id.replace(/-(\w)/g, function (m, c) { return c.toUpperCase(); }); }

  const fromHash = location.hash.replace('#', '');
  let cur = ORDER.indexOf(fromHash) > -1 ? fromHash : ORDER[0];

  function render() {
    const app = document.getElementById('app');
    const screen = S.screens[cur];
    app.setAttribute('data-state', cur);
    app.innerHTML = P.header({ titleKey: 'states.title', back: 'gallery' }) + screen.render();
    if (screen.after) requestAnimationFrame(function () { screen.after(app); });
  }
  function rerender() { render(); I.apply(document); P.wire(document); }
  S.rerender = rerender;

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el || !document.getElementById('app').contains(el)) return;
    const screen = S.screens[cur];
    if (screen.on) screen.on(el.getAttribute('data-act'), el, rerender);
  });

  P.boot({ titleKey: 'states.title', render: render });

  P.demoBar(ORDER.map(function (id) { return { id: id, labelKey: 'states.demo.' + camel(id) }; }), function (id) {
    cur = id;
    if (S.screens[id].reset) S.screens[id].reset();
    rerender();
    const main = document.querySelector('.phone__scroll');
    if (main) main.scrollTop = 0;
  }, cur);

  /* Back/forward or a pasted link with another #state */
  window.addEventListener('hashchange', function () {
    const id = location.hash.replace('#', '');
    if (ORDER.indexOf(id) > -1 && id !== cur) {
      cur = id;
      if (S.screens[id].reset) S.screens[id].reset();
      rerender();
    }
  });
})();
