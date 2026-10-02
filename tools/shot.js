#!/usr/bin/env node
/* Screenshot a page with headless Edge/Chrome (for reviewing designs).
     node tools/shot.js pages/home/index.html out.png
     node tools/shot.js "pages/home/index.html?lang=ar&theme=dark" out.png 430 932
   Width defaults to 430 (phone view). Height defaults to 932.
   Use "#state" at the end of the page path to open a design state. */
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const [, , page, out, w = '430', h = '932'] = process.argv;
if (!page || !out) { console.log('usage: node tools/shot.js <page[?query][#state]> <out.png> [width] [height]'); process.exit(1); }

const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
];
const bin = BROWSERS.find((b) => fs.existsSync(b));
if (!bin) { console.error('No Edge/Chrome found'); process.exit(1); }

const root = path.resolve(__dirname, '..');
const [file, rest = ''] = page.split(/(?=[?#])/);
const url = 'file:///' + path.join(root, file).replace(/\\/g, '/') + page.slice(file.length);
const outAbs = path.resolve(out);
/* headless windows have a ~500px minimum; render wider and let the phone centre */
const width = Math.max(500, +w);
const profile = path.join(require('os').tmpdir(), 'tz-shot-profile-' + process.pid);
try { fs.unlinkSync(outAbs); } catch (e) {}
try {
  /* Edge sometimes leaves helper processes running after the screenshot is
     written, so don't wait forever: the timeout ends the call, the file stays. */
  execFileSync(bin, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`,
    `--window-size=${width},${h}`, '--virtual-time-budget=4000',
    `--screenshot=${outAbs}`, url
  ], { stdio: 'ignore', timeout: 20000, killSignal: 'SIGKILL' });
} catch (e) { /* timed out after writing — checked below */ }
if (!fs.existsSync(outAbs)) { console.error('screenshot failed: ' + url); process.exit(1); }
console.log('saved ' + outAbs);
