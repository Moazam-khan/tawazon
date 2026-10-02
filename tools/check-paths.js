#!/usr/bin/env node
/* Before deploying: every file a page links to must exist with the EXACT same
   upper/lower case (Windows ignores case, Vercel/Linux does not).
     node tools/check-paths.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const all = new Set();
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules' || name === '.vercel') continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else all.add(path.relative(ROOT, p).split(path.sep).join('/'));
  }
})(ROOT);

let bad = 0;
for (const f of [...all].filter((x) => x.endsWith('.html'))) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of src.matchAll(/(?:src|href)="([^"#?:]+\.(?:js|css|png|html))"/g)) {
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(f), m[1]));
    if (!all.has(target)) { bad++; console.log('  MISSING  ' + f + ' -> ' + m[1]); }
  }
}

/* Explorer screenshots and screen folders */
const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'explore/screens.js'), 'utf8'), ctx);
for (const s of ctx.TZ.SCREENS) {
  if (!all.has('pages/' + s.id + '/index.html')) { bad++; console.log('  NO PAGE  ' + s.id); }
  for (const st of s.states) for (const l of ['en', 'ar']) {
    const p = ctx.TZ.shotPath(s, st, l);
    if (!all.has(p)) { bad++; console.log('  NO SHOT  ' + p); }
  }
}
console.log(all.size + ' files · ' + bad + ' broken path(s)');
process.exit(bad ? 1 : 0);
