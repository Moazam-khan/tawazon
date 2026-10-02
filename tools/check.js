#!/usr/bin/env node
/* ==========================================================================
   Tawazon Plus — automatic quality checks. Run after every change:
       node tools/check.js
   Checks: EN/AR key parity · every key used exists · no left/right CSS ·
   no text under 16px · banned words · no hardcoded text in pages ·
   no hex colors outside tokens · file size ceiling.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const errors = [], warnings = [];
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.git')) continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const files = walk(ROOT);
const byExt = (ext) => files.filter((f) => f.endsWith(ext));
const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } };

/* ---------- 1. load translations ---------- */
const ctx = { window: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
const langFiles = [path.join(ROOT, 'assets/lang/en.js'), path.join(ROOT, 'assets/lang/ar.js')]
  .concat(files.filter((f) => /assets[\\/]lang[\\/]_parts[\\/].+\.js$/.test(f)).sort());
for (const f of langFiles) {
  try { vm.runInContext(read(f), ctx, { filename: rel(f) }); }
  catch (e) { errors.push(`${rel(f)}: cannot load (${e.message})`); }
}
const L = (ctx.TZ && ctx.TZ.LANGS) || {};
function flat(o, p = '', out = {}) {
  for (const [k, v] of Object.entries(o || {})) {
    const plural = v && typeof v === 'object' && v.other != null && Object.keys(v).every((x) => /^(zero|one|two|few|many|other)$/.test(x));
    if (v && typeof v === 'object' && !plural) flat(v, p + k + '.', out);
    else out[p + k] = plural ? String(v.other) : String(v);
  }
  return out;
}
const EN = flat(L.en), AR = flat(L.ar);
for (const k of Object.keys(EN)) if (!(k in AR)) errors.push(`missing in ar.js: ${k}`);
for (const k of Object.keys(AR)) if (!(k in EN)) errors.push(`missing in en.js: ${k}`);
for (const k of Object.keys(EN)) {
  const pe = (EN[k].match(/\{\w+\}/g) || []).sort().join();
  const pa = ((AR[k] || '').match(/\{\w+\}/g) || []).sort().join();
  if (k in AR && pe !== pa) errors.push(`placeholders differ for ${k}: en[${pe}] ar[${pa}]`);
}

/* ---------- 2. keys used in pages exist ---------- */
const codeFiles = byExt('.html').concat(byExt('.js')).filter((f) => !/assets[\\/]lang|tools[\\/]/.test(f));
const KEY_RE = [
  /data-i18n(?:-aria|-title|-placeholder)?=\\?["']([a-zA-Z]\w*\.[\w.]+)\\?["']/g,
  /\b(?:I|i18n|TZ\.i18n|I\(\))\.t\(\s*'([a-zA-Z][\w.]*)'/g,
  /\b(?:labelKey|titleKey|nameKey|textKey|key|subKey|bodyKey)\s*:\s*'([a-zA-Z][\w.]*\.[\w.]+)'/g
];
const used = new Map();
for (const f of codeFiles) {
  const src = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const re of KEY_RE) {
    for (const m of src.matchAll(re)) {
      const k = m[1];
      if (k.endsWith('.')) continue;
      if (!used.has(k)) used.set(k, rel(f));
    }
  }
}
for (const [k, f] of used) if (!(k in EN)) errors.push(`key not found: ${k} (used in ${f})`);

/* ---------- 3. CSS rules ---------- */
const PHYS = /(?:^|[\s;{"'])(margin|padding|border)-(left|right)\s*:|(?:^|[\s;{"'])(left|right)\s*:\s*[^;]+|text-align\s*:\s*(left|right)|float\s*:\s*(left|right)/;
const cssLike = byExt('.css').map((f) => [f, read(f)])
  .concat(codeFiles.filter((f) => /pages[\\/]/.test(f)).map((f) => [f, (read(f).match(/style=["'][^"']*["']/g) || []).join('\n')]));
for (const [f, src] of cssLike) {
  src.split('\n').forEach((line, i) => {
    if (PHYS.test(line) && !/inset-inline|logical-ok/.test(line)) errors.push(`${rel(f)}:${i + 1} physical left/right — use logical properties`);
    const fs1 = line.match(/font-size\s*:\s*([\d.]+)(px|rem|em)/);
    if (fs1) {
      const px = fs1[2] === 'px' ? +fs1[1] : +fs1[1] * 16;
      if (px < 16 && !/small-ok/.test(line)) errors.push(`${rel(f)}:${i + 1} font-size ${fs1[1]}${fs1[2]} is under 16px`);
    }
    if (f.endsWith('.css') && !/tokens\.css$/.test(f) && /#[0-9a-fA-F]{3,8}\b/.test(line) && !/color-ok/.test(line))
      warnings.push(`${rel(f)}:${i + 1} hex color outside tokens.css`);
  });
}

/* ---------- 4. banned words ---------- */
const BANNED = /\b(commitments?|liabilit(y|ies)|cycle|available|transactions?|deficit)\b|التزامات|الالتزامات|متاح|متاحة|دورة|الخصوم|معاملة|عجز/i;   /* docs/WORDS.md */
for (const [k, v] of Object.entries(EN)) if (BANNED.test(v)) errors.push(`banned word in en ${k}: "${v}"`);
for (const [k, v] of Object.entries(AR)) if (BANNED.test(v)) errors.push(`banned word in ar ${k}: "${v}"`);

/* ---------- 5. hardcoded text in pages ---------- */
for (const f of codeFiles.filter((x) => /pages[\\/]/.test(x))) {
  let src = read(f);
  if (f.endsWith('.html')) {
    src = src.replace(/<title>[\s\S]*?<\/title>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '');
    for (const m of src.matchAll(/>([^<>]*[A-Za-z\u0600-\u06FF][^<>]*)</g)) {
      const t = m[1].trim();
      if (t && !/^[A-Za-z]$/.test(t)) errors.push(`${rel(f)}: hardcoded text "${t.slice(0, 40)}"`);
    }
    if (/<title>[^<]*[A-Za-z\u0600-\u06FF]/.test(read(f)) && !/titleKey/.test(read(f.replace(/index\.html$/, 'script.js')) || ''))
      warnings.push(`${rel(f)}: <title> is static; pass titleKey to TZ.page.boot`);
  } else {
    src.split('\n').forEach((line, i) => {
      if (/[\u0600-\u06FF]/.test(line) && !/i18n-ok/.test(line)) errors.push(`${rel(f)}:${i + 1} Arabic text in code — move to ar.js`);
      if (/(textContent|innerText|placeholder|aria-label)\s*=\s*'[A-Za-z][a-z]+ [a-z]+/.test(line)) errors.push(`${rel(f)}:${i + 1} English text in code — move to en.js`);
    });
  }
}

/* ---------- 6. file size ---------- */
for (const f of codeFiles.concat(byExt('.css'))) {
  const n = read(f).split('\n').length;
  const ceil = f.endsWith('.css') ? 800 : 600;
  if (n > ceil) errors.push(`${rel(f)}: ${n} lines — split it (ceiling ${ceil})`);
  else if (n > 400) warnings.push(`${rel(f)}: ${n} lines — consider splitting`);
}

/* ---------- report ---------- */
console.log(`Tawazon checks · ${Object.keys(EN).length} keys (en) · ${Object.keys(AR).length} keys (ar) · ${used.size} keys used`);
warnings.forEach((w) => console.log('  warn  ' + w));
errors.forEach((e) => console.log('  FAIL  ' + e));
console.log(errors.length ? `\n${errors.length} problem(s) to fix.` : '\nAll checks passed.');
process.exit(errors.length ? 1 : 0);
