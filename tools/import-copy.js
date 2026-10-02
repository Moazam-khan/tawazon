#!/usr/bin/env node
/* Apply reviewed wording back into assets/lang/en.js and ar.js.
     node tools/import-copy.js <file.json> [more.json …]
   Each JSON is { "namespace.key": { "en": "…", "ar": "…" } } (plural forms as objects).
   Rewrites both language files as one clean nested object, keeping key order.
   Refuses a change that drops or renames a {placeholder}. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
for (const l of ['en', 'ar']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/lang/' + l + '.js'), 'utf8'), ctx);
const L = ctx.TZ.LANGS;

const holes = (v) => JSON.stringify(v).match(/\{\w+\}/g) || [];
const same = (a, b) => holes(a).filter((x, i, s) => s.indexOf(x) === i).sort().join() === holes(b).filter((x, i, s) => s.indexOf(x) === i).sort().join();

let changed = 0, refused = 0;
for (const file of process.argv.slice(2)) {
  const edits = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [key, val] of Object.entries(edits)) {
    for (const lang of ['en', 'ar']) {
      if (!(lang in val)) continue;
      const parts = key.split('.'), last = parts.pop();
      const parent = parts.reduce((o, k) => (o ? o[k] : undefined), L[lang]);
      if (!parent || !(last in parent)) { console.log('  skip (unknown key) ' + lang + ' ' + key); continue; }
      const before = parent[last], after = val[lang];
      if (JSON.stringify(before) === JSON.stringify(after)) continue;
      if (!same(before, after)) { console.log('  REFUSED (placeholders differ) ' + lang + ' ' + key); refused++; continue; }
      parent[last] = after;
      changed++;
    }
  }
}

/* serialize as a readable JS object literal */
const ident = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : "'" + k + "'");
const str = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
function lit(v, ind) {
  if (v === null || typeof v !== 'object') return str(v);
  const keys = Object.keys(v);
  const flat = keys.every((k) => typeof v[k] !== 'object') && keys.length <= 6 && JSON.stringify(v).length < 110;
  if (flat) return '{ ' + keys.map((k) => ident(k) + ': ' + str(v[k])).join(', ') + ' }';
  const pad = '  '.repeat(ind + 1);
  return '{\n' + keys.map((k) => pad + ident(k) + ': ' + lit(v[k], ind + 1)).join(',\n') + '\n' + '  '.repeat(ind) + '}';
}
const HEAD = {
  en: '/* English strings. Keys must match ar.js exactly (node tools/check.js).\n   Wording follows docs/WORDS.md. */',
  ar: '/* النصوص العربية. المفاتيح مطابقة لـ en.js (node tools/check.js).\n   الصياغة حسب docs/WORDS.md — عربية فصحى واضحة بلمسة سعودية ودودة. */'
};
for (const lang of ['en', 'ar']) {
  const out = HEAD[lang] + '\nwindow.TZ = window.TZ || {};\nTZ.LANGS = TZ.LANGS || {};\n\nTZ.LANGS.' + lang + ' = ' + lit(L[lang], 0) + ';\n';
  fs.writeFileSync(path.join(ROOT, 'assets/lang/' + lang + '.js'), out);
}
console.log(changed + ' strings changed' + (refused ? ', ' + refused + ' refused' : '') + '. Run node tools/check.js');
