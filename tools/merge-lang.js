#!/usr/bin/env node
/* Fold page string files (assets/lang/_parts/<ns>.en.js / .ar.js) into
   assets/lang/en.js and ar.js, then remove their <script> tags from pages.
   Run once after new pages are built:  node tools/merge-lang.js
   Safe to re-run: a namespace already merged is replaced, not duplicated. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARTS = path.join(ROOT, 'assets/lang/_parts');
if (!fs.existsSync(PARTS)) { console.log('Nothing to merge.'); process.exit(0); }

const parts = fs.readdirSync(PARTS).filter((f) => /^[\w-]+\.(en|ar)\.js$/.test(f)).sort();
for (const lang of ['en', 'ar']) {
  const file = path.join(ROOT, `assets/lang/${lang}.js`);
  let src = fs.readFileSync(file, 'utf8');
  for (const p of parts.filter((f) => f.endsWith(`.${lang}.js`))) {
    const ns = p.split('.')[0];
    const body = fs.readFileSync(path.join(PARTS, p), 'utf8').trim();
    const start = `/* ==== page: ${ns} ==== */`;
    const block = `${start}\n${body}\n/* ==== end: ${ns} ==== */`;
    const re = new RegExp(`/\\* ==== page: ${ns} ==== \\*/[\\s\\S]*?/\\* ==== end: ${ns} ==== \\*/`);
    src = re.test(src) ? src.replace(re, block) : src.trimEnd() + '\n\n' + block + '\n';
    console.log(`merged ${p}`);
  }
  fs.writeFileSync(file, src);
}

/* remove <script …_parts/…> tags (marked <!-- lang-part -->) from every HTML file */
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) { if (!/node_modules|\.git/.test(name)) walk(p); continue; }
    if (!p.endsWith('.html')) continue;
    const html = fs.readFileSync(p, 'utf8');
    const out = html.replace(/^[ \t]*<script src="[^"]*_parts\/[^"]+"><\/script>[ \t]*(<!-- lang-part -->)?\r?\n/gm, '');
    if (out !== html) { fs.writeFileSync(p, out); console.log(`cleaned ${path.relative(ROOT, p)}`); }
  }
})(ROOT);

for (const p of parts) fs.unlinkSync(path.join(PARTS, p));
console.log('Done. Page strings now live in assets/lang/en.js and ar.js.');
