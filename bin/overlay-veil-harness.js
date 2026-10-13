#!/usr/bin/env node
/* eslint-env node */
/**
 * overlay-veil-harness.js — v7.20.871 (FIXLIST purple-overlays-to-blur). Neil, 13 Oct: "I don't like the purple
 * overlay… Maybe it's better if we have the blurred overlay instead." The house blurred overlay = the Switch Student
 * veil (sophicly-components/frontend/sophicly-student-switcher.css), copied exactly.
 *  1. WML's three formerly-purple modal backdrops carry that veil + blur, in both themes.
 *  2. No full-screen WML overlay/backdrop rule is purple-tinted again (the house light veil is the one exemption).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const F = (n) => fs.readFileSync(path.join(__dirname, '..', 'frontend', n), 'utf8');
const CSS = { 'wml-styles.css': F('wml-styles.css'), 'wml-canvas.css': F('wml-canvas.css') };
let pass = 0, fail = 0;
const ok = (c, m, g) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (g !== undefined ? '  — got: ' + JSON.stringify(g) : '')); } };
const rules = (src) => { const out = []; const re = /([^{}]+)\{([^{}]*)\}/g; let m; while ((m = re.exec(src))) out.push({ sel: m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim(), body: m[2] }); return out; };
const DARK = 'rgba(10, 6, 18, 0.58)', LIGHT = 'rgba(24, 16, 38, 0.52)', BLUR = 'blur(14px) saturate(120%)';

console.log('\n1. the house blurred overlay (Switch Student, copied exactly) on WML\'s three modal backdrops');
for (const [file, sel] of [['wml-styles.css', '.swml-confirm-overlay'], ['wml-canvas.css', '.swml-review-modal-overlay'], ['wml-canvas.css', '.swml-cw-project-overlay']]) {
    const rs = rules(CSS[file]);
    const base = rs.find(r => r.sel === sel);
    const bg = base && (base.body.match(/(?:^|;|\s)background:\s*([^;]+);/) || [])[1];
    ok(base && bg && bg.trim() === DARK, `${sel}: dark veil ${DARK}`, bg && bg.trim());
    ok(base && new RegExp('(?:^|[;\\s])backdrop-filter:\\s*' + BLUR.replace(/[()]/g, '\\$&') + ';').test(base.body), `${sel}: backdrop-filter ${BLUR}`);
    ok(base && new RegExp('-webkit-backdrop-filter:\\s*' + BLUR.replace(/[()]/g, '\\$&') + ';').test(base.body), `${sel}: -webkit-backdrop-filter too (Safari)`);
    const light = rs.find(r => r.sel === `[data-swml-theme="light"] ${sel}`);
    const lbg = light && (light.body.match(/background:\s*([^;]+);/) || [])[1];
    ok(lbg && lbg.trim() === LIGHT, `${sel}: light veil ${LIGHT}`, lbg && lbg.trim());
}

console.log('\n2. no purple full-screen backdrop left in WML\'s stylesheets');
const purple = (v) => {
    if (v.includes(LIGHT) || v.includes(DARK)) return false;
    let m = v.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) { const [r, g, b] = m.slice(1).map(Number); return b - Math.max(r, g) >= 12; }
    m = v.match(/oklch\(\s*[\d.]+%?\s+([\d.]+)\s+([\d.]+)/);
    if (m) { const C = +m[1], H = +m[2]; return C >= 0.02 && H >= 250 && H <= 320; }
    return false;
};
const hits = [];
for (const [file, src] of Object.entries(CSS)) for (const r of rules(src)) {
    if (!/-(overlay|backdrop)\b/.test(r.sel) || !/inset:\s*0/.test(r.body)) continue;
    const bg = (r.body.match(/(?:^|;|\s)background(?:-color)?:\s*([^;]+);/) || [])[1];
    if (bg && purple(bg)) hits.push(`${file} ${r.sel} → ${bg.trim()}`);
}
ok(hits.length === 0, 'every full-screen overlay/backdrop is neutral or the house veil', hits);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ overlay-veil-harness FAILED'); process.exit(1); }
console.log('✅ overlay-veil-harness passed (no purple modal overlays — the Switch Student blur instead).');
