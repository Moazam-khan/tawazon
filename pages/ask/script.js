/* Ask — one chat, two layers.
   Layer 1: question cards that always work (no AI), answered from TZ.data.
   Layer 2: optional smart answers (free text + mic), with resting / offline /
   daily-limit / first-time consent states. #spend opens "Can I spend?" directly.
   #plan (from Home, "Ask Tawazon for a plan") asks "I spent more than my number" and plays the answer. */
(function () {
  'use strict';
  const P = TZ.page, F = TZ.fmt, IC = TZ.icons, I = TZ.i18n, A = TZ.askAnswers;
  const STATES = ['on', 'resting', 'offline', 'limit', 'consent', 'unclear', 'plan'];
  const QUESTIONS = [
    { id: 'spend', icon: 'wallet' }, { id: 'why', icon: 'question' },
    { id: 'debt', icon: 'car' }, { id: 'goal', icon: 'goal' }, { id: 'over', icon: 'heart' }
  ];

  let ai = 'on';            // on | resting | offline | limit
  let consented = true;
  let msgs = [];
  let draft = '';
  let pending = null;       // free question waiting for consent
  let busy = false;
  let listening = null;     // mic timer
  let chatId = 0;           // a pending answer is dropped if the chat was reset meanwhile
  let bubbleId = 0;         // ids for the read-aloud buttons

  /* ---------- design states ---------- */
  function preset(id) {
    const q = { who: 'user', key: 'ask.ai.sampleQ' };
    consented = id !== 'consent';
    ai = (id === 'consent' || id === 'unclear' || id === 'plan') ? 'on' : id;
    msgs = ({
      on: [q, { who: 'bot', type: 'savings' }],
      unclear: [{ who: 'user', key: 'ask.ai.unclearQ' }, { who: 'bot', type: 'unclear' }],
      resting: [q, { who: 'bot', type: 'resting' }],
      limit: [q, { who: 'bot', type: 'limit' }]
    })[id] || [];
    draft = ''; pending = null; busy = false; chatId++;
    if (listening) { clearTimeout(listening); listening = null; }
  }

  /* ---------- markup ---------- */
  function avatar(type) {
    const mood = { resting: 'resting', limit: 'care', unclear: 'think' }[type] || 'happy';
    return '<span class="ask-avatar">' + IC.mascot(mood, '', I.t('brand.short')) + '</span>';
  }

  function msgHtml(msg) {
    if (msg.who === 'user') {
      const text = msg.key ? I.t(msg.key, msg.vars) : P.esc(msg.text);
      return '<div class="ask-msg ask-msg--user"><p class="ask-bubble ask-bubble--user">' + text + '</p></div>';
    }
    const cls = msg.type === 'unclear' || msg.type === 'resting' || msg.type === 'limit' ? ' ask-bubble--soft' : '';
    return botMsg(msg.type, cls, A[msg.type](msg));
  }
  /* Tawazon bubble with a small read-aloud button under it (reads the bubble text) */
  function botMsg(type, cls, inner) {
    const id = 'ask-b' + (++bubbleId);
    return '<div class="ask-msg ask-msg--bot">' + avatar(type) + '<div class="ask-col">' +
      '<div class="ask-bubble' + cls + '" id="' + id + '">' + inner + '</div>' +
      (TZ.speak ? TZ.speak.button('#' + id, { cls: 'speak--sm' }) : '') + '</div></div>';
  }

  function typingHtml() {
    return '<div class="ask-msg ask-msg--bot" data-typing>' + avatar('typing') +
      '<div class="ask-bubble ask-typing"><span class="sr-only">' + I.t('ask.typing') + '</span>' +
      '<i></i><i></i><i></i></div></div>';
  }

  function cardsHtml() {
    return '<section class="ask-cards" aria-labelledby="ask-cards-title">' +
      '<h2 class="ask-cards__title" id="ask-cards-title" data-i18n="' + (msgs.length ? 'ask.cardsMore' : 'ask.cardsTitle') + '"></h2>' +
      '<div class="ask-cards__list">' + QUESTIONS.map(function (q) {
        return '<button type="button" class="ask-card" data-q="' + q.id + '">' +
          '<span class="row__icon">' + IC.icon(q.icon) + '</span>' +
          '<span class="ask-card__body"><span class="ask-card__q">' + I.t('ask.q.' + q.id, { amount: F.num(A.SPEND_EXAMPLE) }) + '</span>' +
          '<span class="ask-card__sub">' + I.t('ask.q.' + q.id + 'Sub') + '</span></span>' +
          IC.icon('chevron', { dir: true, cls: 'row__chev' }) + '</button>';
      }).join('') + '</div></section>';
  }

  function composerHtml() {
    /* "Smart answers" badge; when paused it also says why (never colour alone) */
    const badge = '<span class="ask-badge ask-badge--' + ai + '">' + IC.icon(ai === 'offline' ? 'wifiOff' : 'sparkle') +
      '<span data-i18n="ask.ai.badge"></span>' + (ai === 'on' ? '' :
      '<span class="ask-badge__dot" aria-hidden="true"></span><span data-i18n="ask.ai.status.' + ai + '"></span>') + '</span>';
    /* Smart answers paused: no dead input, just a calm line (the cards above still work) */
    if (ai !== 'on') {
      const hint = { resting: 'ask.ai.restingHint', offline: 'ask.ai.offlineHint', limit: 'ask.ai.limitHint' }[ai];
      return '<div class="ask-composer ask-composer--off" data-composer>' + badge +
        '<p class="ask-composer__hint" data-i18n="' + hint + '"></p></div>';
    }
    return '<form class="ask-composer" data-composer novalidate>' +
      '<div class="ask-composer__head">' +
        '<label class="ask-composer__label" for="ask-input" data-i18n="ask.ai.label"></label>' + badge +
      '</div>' +
      '<div class="ask-composer__row">' +
        '<input class="field__input ask-composer__input" id="ask-input" type="text" autocomplete="off" enterkeyhint="send"' +
          ' data-i18n-placeholder="ask.ai.placeholder">' +
        '<button type="button" class="ask-round ask-round--mic" data-mic aria-pressed="' + (!!listening) + '"' +
          ' data-i18n-aria="' + (listening ? 'ask.ai.micStop' : 'ask.ai.mic') + '">' + IC.icon('mic') + '</button>' +
        '<button type="submit" class="ask-round ask-round--send" data-i18n-aria="ask.ai.send">' +
          IC.icon('send', { dir: true }) + '</button>' +
      '</div>' +
      (listening ? '<p class="ask-composer__hint ask-composer__hint--live" role="status" data-i18n="ask.ai.listening"></p>' : '') +
    '</form>';
  }

  function consentHtml() {
    function line(icon, key) {
      return '<li class="ask-consent__line"><span class="row__icon">' + IC.icon(icon) + '</span><span data-i18n="' + key + '"></span></li>';
    }
    return '<div class="overlay" data-sheet="consent" aria-hidden="true">' +
      '<div class="sheet ask-consent" role="dialog" aria-modal="true" aria-labelledby="consent-title">' +
        '<div class="sheet__handle"></div>' +
        '<div class="ask-consent__badge">' + IC.icon('sparkle') + '<span data-i18n="ask.ai.badge"></span></div>' +
        '<h2 class="sheet__title" id="consent-title" data-i18n="ask.consent.title"></h2>' +
        '<ul class="ask-consent__list">' + line('list', 'ask.consent.amounts') + line('lock', 'ask.consent.private') +
          line('settings', 'ask.consent.off') + '</ul>' +
        '<div class="stack-2">' +
          '<button type="button" class="btn btn--primary btn--block" data-agree>' + IC.icon('check') + '<span data-i18n="ask.consent.agree"></span></button>' +
          '<button type="button" class="btn btn--text btn--block" data-notnow data-i18n="ask.consent.notNow"></button>' +
        '</div>' +
      '</div></div>';
  }

  function render() {
    const app = document.getElementById('app');
    const consentOpen = !!app.querySelector('[data-sheet="consent"].is-open');
    /* keep sheets and toasts made by shared helpers (keypad sheet, undo toast) */
    const keep = Array.prototype.filter.call(app.children, function (el) {
      return (el.classList.contains('overlay') && !el.hasAttribute('data-sheet')) || el.classList.contains('toast');
    });
    const newChat = '<button type="button" class="ask-new" data-new' + (msgs.length ? '' : ' disabled') + '>' +
      IC.icon('plus') + '<span class="ask-new__text" data-i18n="ask.newChat"></span></button>';
    app.innerHTML =
      P.header({ titleKey: 'ask.title', settings: true, end: newChat }) +
      '<main class="phone__scroll ask-scroll"><div class="screen ask-screen">' +
        (ai === 'offline' ? '<div class="note ask-offline" role="status">' + IC.icon('wifiOff') + '<span data-i18n="ask.ai.offline"></span></div>' : '') +
        botMsg('hello', '', '<p data-i18n="ask.hello"' + P.vars({ name: I.t('mock.you') }) + '></p>' +
          '<p class="ask-fine">' + IC.icon('info') + '<span data-i18n="ask.advice"></span></p>') +
        '<div class="ask-thread" data-thread aria-live="polite" aria-relevant="additions">' + msgs.map(msgHtml).join('') + '</div>' +
        cardsHtml() +
      '</div></main>' +
      composerHtml() +
      P.tabbar('ask') +
      consentHtml();
    keep.forEach(function (el) { app.appendChild(el); });
    const input = app.querySelector('#ask-input');
    if (input) input.value = draft;
    if (consentOpen) requestAnimationFrame(function () { P.openSheet('consent'); });
  }

  /* ---------- chat flow ---------- */
  function scrollTo(el) {
    /* scroll only the chat area (scrollIntoView would also shift the phone frame) */
    const box = document.querySelector('.ask-scroll');
    if (!el || !box) return;
    const top = box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - 12;
    box.scrollTo({ top: top, behavior: TZ.ui.reduceMotion() ? 'auto' : 'smooth' });
  }
  function addMsg(msg) {
    msgs.push(msg);
    const thread = document.querySelector('[data-thread]');
    thread.insertAdjacentHTML('beforeend', msgHtml(msg));
    I.apply(thread.lastElementChild);
    syncChrome();
    return thread.lastElementChild;
  }
  function syncChrome() {
    const nb = document.querySelector('[data-new]');
    if (nb) nb.disabled = !msgs.length;
    const ct = document.getElementById('ask-cards-title');
    if (ct) { ct.setAttribute('data-i18n', msgs.length ? 'ask.cardsMore' : 'ask.cardsTitle'); I.apply(ct.parentNode); }
  }

  /* user bubble -> typing dots -> Tawazon's answer */
  function converse(userMsg, botMsg) {
    if (busy) return;
    busy = true;
    const id = chatId;
    const q = addMsg(userMsg);
    const thread = document.querySelector('[data-thread]');
    thread.insertAdjacentHTML('beforeend', typingHtml());
    scrollTo(q);
    setTimeout(function () {
      const t = document.querySelector('[data-typing]');
      if (t) t.remove();
      if (id !== chatId) return;
      addMsg(botMsg);
      busy = false;
      scrollTo(document.querySelector('[data-thread]').lastElementChild.previousElementSibling);
    }, TZ.ui.reduceMotion() ? 500 : 1200);
  }

  function askCard(id, amount) {
    if (id === 'spend' && !amount) { openSpend(); return; }
    const user = { who: 'user', key: 'ask.q.' + id, vars: { amount: F.num(amount || A.SPEND_EXAMPLE) } };
    if (id === 'over') { converse(user, { who: 'bot', type: 'plan', smart: ai === 'on' }); return; }
    converse(user, { who: 'bot', type: id, amount: amount });
  }

  function openSpend() {
    TZ.keypad.sheet({
      titleKey: 'ask.spend.sheetTitle', labelKey: 'ask.spend.sheetLabel', saveKey: 'ask.spend.checkBtn',
      value: A.SPEND_EXAMPLE,
      onSave: function (n) { setTimeout(function () { askCard('spend', n); }, 350); }
    });
  }

  /* Free question: understood topics use the card answers; otherwise "try one of these" */
  function route(text) {
    function has(k) { return new RegExp(I.t('ask.match.' + k), 'i').test(text); }
    const user = { who: 'user', text: text };
    if (has('spend')) {
      const digits = text.replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); }).match(/\d[\d,]*/); // i18n-ok (digit map)
      const n = digits ? Number(digits[0].replace(/,/g, '')) : 0;
      if (!n) { openSpend(); return; }
      converse(user, { who: 'bot', type: 'spend', amount: n });
      return;
    }
    const topic = ['why', 'debt', 'goal', 'savings'].filter(has)[0];
    converse(user, { who: 'bot', type: topic || 'unclear' });
  }

  function send() {
    const input = document.getElementById('ask-input');
    const text = input ? (input.value || '').trim() : '';
    if (!text || ai !== 'on' || busy) return;
    if (!consented) { pending = text; P.openSheet('consent', input); return; }
    input.value = draft = '';
    route(text);
  }

  function toggleMic(btn) {
    if (listening) { clearTimeout(listening); listening = null; }
    else {
      listening = setTimeout(function () {   /* prototype: pretend we heard the sample question */
        listening = null;
        if (ai !== 'on') return;
        draft = I.t('ask.ai.sampleQ');
        rerenderComposer();
        document.getElementById('ask-input').focus();
      }, 2200);
    }
    rerenderComposer();
    const mic = document.querySelector('[data-mic]');
    if (mic && btn) mic.focus();
  }
  function rerenderComposer() {
    const old = document.querySelector('[data-composer]');
    old.insertAdjacentHTML('afterend', composerHtml());
    old.remove();
    const fresh = document.querySelector('[data-composer]');
    I.apply(fresh);
    fresh.querySelector('#ask-input').value = draft;
  }

  function newChat() {
    if (!msgs.length) return;
    const before = msgs.slice();
    msgs = []; busy = false; chatId++;
    render(); I.apply(document); P.wire(document);
    const focusTo = document.getElementById('ask-input') || document.querySelector('.ask-card');
    if (focusTo) focusTo.focus({ preventScroll: true });
    TZ.ui.toast(document.querySelector('.phone'), {
      message: I.t('ask.cleared'), undoLabel: I.t('common.undo'),
      onUndo: function () { msgs = before; render(); I.apply(document); P.wire(document); }
    });
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    const q = e.target.closest('[data-q]');
    if (q) { askCard(q.getAttribute('data-q')); return; }
    if (e.target.closest('[data-new]')) { newChat(); return; }
    const mic = e.target.closest('[data-mic]');
    if (mic) { toggleMic(mic); return; }
    if (e.target.closest('[data-agree]')) {
      consented = true;
      P.closeSheet('consent');
      const input = document.getElementById('ask-input');
      if (pending) { const t = pending; pending = null; draft = ''; if (input) input.value = ''; route(t); }
      else if (input) setTimeout(function () { input.focus(); }, 60);
      return;
    }
    if (e.target.closest('[data-notnow]')) {
      pending = null;
      P.closeSheet('consent');
      TZ.ui.toast(document.querySelector('.phone'), { message: I.t('ask.consent.later'), duration: 5000 });
    }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.closest('[data-composer]')) { e.preventDefault(); send(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'ask-input') draft = e.target.value;
  });
  /* #plan: the question is asked for the user, then Tawazon types its plan */
  function startPlan() {
    const user = { who: 'user', key: 'ask.q.over' }, bot = { who: 'bot', type: 'plan', smart: ai === 'on', demo: true };
    if (!document.documentElement.classList.contains('is-capture')) { converse(user, bot); return; }
    msgs = [user, bot];      /* screenshots: no typing delay */
    render(); I.apply(document); P.wire(document);
    scrollTo(document.querySelector('.ask-msg--user'));
  }

  const startHash = location.hash.replace('#', '');
  preset(STATES.indexOf(startHash) > -1 ? startHash : 'on');
  if (startHash === 'spend') msgs = [];

  P.boot({ titleKey: 'ask.title', render: render });

  P.demoBar(STATES.map(function (id) { return { id: id, labelKey: 'ask.demo.' + id }; }), function (id) {
    preset(id);
    render(); I.apply(document); P.wire(document);
    if (id === 'consent') P.openSheet('consent', document.getElementById('ask-input'));
    if (id === 'plan') startPlan();
  }, startHash === 'spend' ? 'on' : null);

  if (startHash === 'consent') setTimeout(function () { P.openSheet('consent', document.getElementById('ask-input')); }, 250);
  if (startHash === 'spend') setTimeout(openSpend, 250);
  if (startHash === 'plan') setTimeout(startPlan, 300);
})();
