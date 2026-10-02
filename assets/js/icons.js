/* ==========================================================================
   Tawazon Plus — icons (inline SVG, stroke style, 24x24)
   Usage: TZ.icons.icon('home')  -> <svg class="icon">…</svg>
          TZ.icons.icon('chevron', { dir: true }) -> mirrors in RTL
          TZ.icons.face('good')   -> status face (good | careful | tight)
          TZ.icons.mascot('happy')-> the Tawazon circle-face mascot
   ========================================================================== */
window.TZ = window.TZ || {};

TZ.icons = (function () {
  const PATHS = {
    home:        '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
    wallet:      '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5Z"/><circle cx="16" cy="13.5" r="1.2"/>',
    chat:        '<path d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z"/><path d="M12 8l.8 1.7 1.7.8-1.7.8L12 13l-.8-1.7-1.7-.8 1.7-.8z"/>',
    rent:        '<path d="M4 20V8.5L12 4l8 4.5V20"/><path d="M9 20v-5.5h6V20"/><path d="M3 20h18"/>',
    electricity: '<path d="M13 3 5.5 13.5H11L10 21l8-10.5h-5.5L13 3Z"/>',
    internet:    '<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.5 12.5a9.5 9.5 0 0 1 13 0"/><path d="M8.7 16a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19.2" r="0.9" fill="currentColor"/>',
    phone:       '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    subscription:'<path d="M17 3l3 3-3 3"/><path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20"/><path d="M7 21l-3-3 3-3"/><path d="M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4"/>',
    other:       '<circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/>',
    person:      '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    debt:        '<rect x="3" y="6" width="18" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
    plus:        '<path d="M12 5v14M5 12h14"/>',
    chevron:     '<path d="m9 5 7 7-7 7"/>',
    chevronBack: '<path d="m15 5-7 7 7 7"/>',
    arrow:       '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    check:       '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    close:       '<path d="M6 6l12 12M18 6 6 18"/>',
    undo:        '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    backspace:   '<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"/><path d="m13 9.5 5 5M18 9.5l-5 5"/>',
    mic:         '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3"/>',
    sun:         '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    moon:        '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"/>',
    bell:        '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2Z"/><path d="M10 21h4"/>',
    trash:       '<path d="M4 7h16"/><path d="M9.5 7V4.5h5V7"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5.5M14 11v5.5"/>',
    edit:        '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 7.5 3 3"/>',
    info:        '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.7" r="0.6" fill="currentColor"/>',
    alert:       '<path d="M12 4 21 19.5H3L12 4Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/>',
    sparkle:     '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',
    globe:       '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.6 3.8 5.6 3.8 9S14.6 18.4 12 21c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3Z"/>',
    /* ---- added for the app screens ---- */
    back:        '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
    settings:    '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.4A7.6 7.6 0 0 0 7 6.4l-2.4-.9-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-.9a7.6 7.6 0 0 0 2.6 1.5l.4 2.4h4l.4-2.4a7.6 7.6 0 0 0 2.6-1.5l2.4.9 2-3.4-2-1.6Z"/>',
    calendar:    '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    bills:       '<path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    car:         '<path d="M5 16.5V12l2-5h10l2 5v4.5"/><path d="M3.5 12h17v4.5h-17z"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
    water:       '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z"/>',
    school:      '<path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z"/><path d="M6.5 11v5c3.5 2.5 7.5 2.5 11 0v-5"/>',
    jar:         '<path d="M8 3.5h8M7 6.5h10"/><path d="M7 6.5c-1.6 1.6-2.5 3.3-2.5 6V18a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-5.5c0-2.7-.9-4.4-2.5-6"/><path d="M12 11v6M10 12.8h3a1.2 1.2 0 0 1 0 2.4h-2a1.2 1.2 0 0 0 0 2.4h3"/>',
    goal:        '<path d="M5 21V4"/><path d="M5 4.5h11l-2 3.5 2 3.5H5"/>',
    moneyIn:     '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="16" r="2"/><path d="M12 3v5.5M9 6l3 3 3-3"/>',
    moneyOut:    '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="16" r="2"/><path d="M12 9V3.5M9 6.5l3-3 3 3"/>',
    lock:        '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    fingerprint: '<path d="M6.5 6.5a8 8 0 0 1 11 0"/><path d="M5 11a7 7 0 0 1 14 0v1.5"/><path d="M8.5 20c-1-1.8-1.5-4-1.5-7a5 5 0 0 1 10 0c0 1.2 0 2.3-.2 3.3"/><path d="M12 13c0 3.2.6 5.6 1.8 7.5"/><path d="M16.5 19.5c.2-.6.4-1.3.5-2"/>',
    download:    '<path d="M12 4v11"/><path d="m7 10.5 5 5 5-5"/><path d="M5 20h14"/>',
    logout:      '<path d="M14 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H14"/><path d="M10 12h10.5"/><path d="m17 8.5 3.5 3.5-3.5 3.5"/>',
    shield:      '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m8.8 12.2 2.2 2.2 4.3-4.4"/>',
    doc:         '<path d="M6.5 3h7.5l4 4v14h-11.5V3Z"/><path d="M13.5 3v4.5H18"/><path d="M9.5 12h5M9.5 15.5h5"/>',
    star:        '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z"/>',
    crown:       '<path d="M3.5 8 7.5 12l4.5-6.5L16.5 12l4-4-1.5 10.5H5L3.5 8Z"/><path d="M5 21h14"/>',
    clock:       '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>',
    replay:      '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5v4h4"/>',
    wifiOff:     '<path d="M3 3l18 18"/><path d="M8.7 16a5 5 0 0 1 6.6 0"/><path d="M5.5 12.5a9.4 9.4 0 0 1 4-2.1M14.5 10.6a9.5 9.5 0 0 1 4 1.9"/><path d="M2.5 9a14 14 0 0 1 4.3-2.8M11 5.1A14 14 0 0 1 21.5 9"/><circle cx="12" cy="19.2" r="0.9" fill="currentColor"/>',
    party:       '<path d="M4 20 8.5 7.5l8 8L4 20Z"/><path d="M13 4.5c.8 1 .8 2.2 0 3.2M19.5 11c-1-.8-2.2-.8-3.2 0"/><path d="M15.5 3.5v.01M20.5 8.5v.01M17.5 6.5l1.5-1.5"/>',
    heart:       '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/>',
    question:    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 0 1 5 1c0 1.8-2.5 2-2.5 3.8"/><circle cx="12" cy="17.2" r="0.6" fill="currentColor"/>',
    send:        '<path d="M4 12 20 4l-4.5 16-3.5-6.5L4 12Z"/><path d="m12 13.5 8-9.5"/>',
    minus:       '<path d="M5 12h14"/>',
    equals:      '<path d="M5 9h14M5 15h14"/>',
    list:        '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
    eye:         '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    gift:        '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20"/><path d="M12 8.5C10.5 5 7 4.5 7 6.8 7 8.5 12 8.5 12 8.5ZM12 8.5c1.5-3.5 5-4 5-1.7 0 1.7-5 1.7-5 1.7Z"/>',
    trendDown:   '<path d="m3.5 7 6.5 6.5 4-4 6.5 6.5"/><path d="M20.5 11v5h-5"/>',
    google:      '<path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7Z" fill="#4285F4" stroke="none"/><path d="M12 21.5c2.6 0 4.7-.9 6.3-2.3l-3.1-2.4c-.9.6-2 .9-3.2.9-2.5 0-4.6-1.7-5.3-3.9H3.5v2.5A9.5 9.5 0 0 0 12 21.5Z" fill="#34A853" stroke="none"/><path d="M6.7 13.8a5.7 5.7 0 0 1 0-3.6V7.7H3.5a9.5 9.5 0 0 0 0 8.6l3.2-2.5Z" fill="#FBBC05" stroke="none"/><path d="M12 6.3c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9.5 9.5 0 0 0 3.5 7.7l3.2 2.5C7.4 8 9.5 6.3 12 6.3Z" fill="#EA4335" stroke="none"/>',
    apple:       '<path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5a4.3 4.3 0 0 0-3.4-1.8c-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8a4.5 4.5 0 0 0-3.8 2.3c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.3c.9-1.3 1.2-2.5 1.2-2.6 0 0-2.4-.9-2.4-3.8ZM14.2 5.7c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3Z" fill="currentColor" stroke="none"/>'
  };

  function icon(name, opts) {
    opts = opts || {};
    const cls = 'icon' + (opts.dir ? ' icon--dir' : '') + (opts.cls ? ' ' + opts.cls : '');
    const body = PATHS[name] || PATHS.other;
    return '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* Status faces: circle in currentColor, features in --face-ink */
  function face(kind) {
    const mouth = {
      good:    '<path d="M10 19.2c1.6 2.8 10.4 2.8 12 0" />',
      careful: '<path d="M11 21h10" />',
      tight:   '<path d="M10.8 22.4c1.5-2.4 9-2.4 10.4 0" /><path d="M9 10.8l4.2-1.5M23 10.8l-4.2-1.5" />'
    }[kind] || '';
    return '<svg class="face face--' + kind + '" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
      '<circle cx="16" cy="16" r="16" fill="currentColor"/>' +
      '<g fill="var(--face-ink, #fff)"><circle cx="11.5" cy="14" r="2"/><circle cx="20.5" cy="14" r="2"/></g>' +
      '<g fill="none" stroke="var(--face-ink, #fff)" stroke-width="2" stroke-linecap="round">' + mouth + '</g>' +
      '</svg>';
  }

  /* The Tawazon mascot: a friendly teal circle with a little gold sprout.
     mood: happy | calm | celebrate | think | resting | care */
  let mascotN = 0;
  function mascot(mood, cls, label) {
    const gid = 'tzg' + (++mascotN);   /* unique gradient id per mascot */
    const MOUTH = {
      calm:      '<path d="M50 74c4 3 16 3 20 0" />',
      think:     '<path d="M52 76h14" />',
      resting:   '<path d="M52 75c3 2 13 2 16 0" />',
      care:      '<path d="M50 76c4-3 16-3 20 0" />',
      celebrate: '<path d="M45 70c3 13 27 13 30 0Z" fill="#052A24" />'
    };
    const mouth = MOUTH[mood] || '<path d="M46 72c4 9 24 9 28 0" />';
    const eyes = mood === 'resting'
      ? '<g fill="none" stroke="#052A24" stroke-width="3.5" stroke-linecap="round"><path d="M37 60c3 3 11 3 14 0M69 60c3 3 11 3 14 0"/></g>'
      : '<ellipse cx="44" cy="58" rx="7" ry="8.5" fill="#fff"/><ellipse cx="76" cy="58" rx="7" ry="8.5" fill="#fff"/>' +
        '<circle cx="' + (mood === 'think' ? 47 : 45.5) + '" cy="' + (mood === 'think' ? 56 : 59.5) + '" r="3.8" fill="#052A24"/>' +
        '<circle cx="' + (mood === 'think' ? 79 : 77.5) + '" cy="' + (mood === 'think' ? 56 : 59.5) + '" r="3.8" fill="#052A24"/>' +
        '<circle cx="46.8" cy="58" r="1.2" fill="#fff"/><circle cx="78.8" cy="58" r="1.2" fill="#fff"/>';
    const extra = mood === 'celebrate'
      ? '<g fill="var(--sand-400)"><circle cx="14" cy="34" r="3"/><circle cx="106" cy="30" r="3"/><circle cx="100" cy="98" r="2.5"/><circle cx="20" cy="94" r="2.5"/></g>'
      : mood === 'resting' ? '<g fill="var(--sand-500)" font-family="system-ui" font-weight="700"><text x="92" y="30" font-size="14">z</text><text x="102" y="18" font-size="10">z</text></g>' : '';
    return '<svg class="mascot ' + (cls || '') + '" viewBox="0 0 120 120" role="img" aria-label="' + (label || 'Tawazon') + '" focusable="false">' +
      '<ellipse cx="60" cy="112" rx="26" ry="5" fill="rgba(0,0,0,.12)"/>' +
      '<path d="M60 22c0-9 5-14 12-15 1 8-3 14-12 15Z" fill="var(--sand-400)"/>' +
      '<path d="M60 22c0-7-4-11-10-12-1 6 2 11 10 12Z" fill="var(--sand-300)"/>' +
      '<circle cx="60" cy="64" r="44" fill="var(--brand-600)"/>' +
      '<circle cx="60" cy="64" r="44" fill="url(#' + gid + ')" opacity=".35"/>' +
      '<defs><radialGradient id="' + gid + '" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>' +
      eyes +
      '<ellipse cx="34" cy="74" rx="6" ry="4" fill="var(--sand-300)" opacity=".7"/><ellipse cx="86" cy="74" rx="6" ry="4" fill="var(--sand-300)" opacity=".7"/>' +
      '<g fill="none" stroke="#052A24" stroke-width="3.5" stroke-linecap="round">' + mouth + '</g>' +
      extra +
      '</svg>';
  }

  /* App logo mark: a balance beam held level, with the gold sprout */
  function logo(cls) {
    return '<svg class="logo ' + (cls || '') + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<rect width="64" height="64" rx="18" fill="var(--brand-600)"/>' +
      '<path d="M32 17c0-5 3-8 7-8.5.5 4.5-2 8-7 8.5Z" fill="var(--sand-300)"/>' +
      '<path d="M32 17v29" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M15 27h34" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M15 27l-5 11h10l-5-11ZM49 27l-5 11h10l-5-11Z" fill="var(--sand-300)" stroke="var(--sand-300)" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M24 50h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
      '</svg>';
  }

  return { icon: icon, face: face, mascot: mascot, logo: logo, names: Object.keys(PATHS) };
})();
