#!/usr/bin/env node
/* Screenshot every screen and design state in English and Arabic for the Explorer.
     node tools/capture-all.js            -> explore/shots/<lang>/<screen>--<state>.png
   Uses ?capture (no review bar, phone fills the window). Re-run after design changes. */
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const vm = require('vm');
const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../explore/screens.js'), 'utf8'), ctx);
const SCREENS = ctx.TZ.SCREENS;

const ROOT = path.resolve(__dirname, '..');
let done = 0;
for (const lang of ['en', 'ar']) {
  const dir = path.join(ROOT, 'explore/shots', lang);
  fs.mkdirSync(dir, { recursive: true });
  for (const s of SCREENS) {
    for (const st of s.states) {
      const file = path.join(dir, s.id.replace('/', '_') + (st ? '--' + st : '') + '.png');
      const page = 'pages/' + s.id + '/index.html?capture&lang=' + lang + (st ? '#' + st : '');
      execFileSync(process.execPath, [path.join(__dirname, 'shot.js'), page, file, '500', '1082'], { stdio: 'ignore' });
      done++;
      process.stdout.write('.');
    }
  }
}
console.log('\n' + done + ' screenshots saved in explore/shots/');
