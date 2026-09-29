#!/usr/bin/env node
/* eslint-env node */
/**
 * stepped-history-harness.js — v7.20.659 (#645b): the history window for chats that do not send the whole
 * conversation must keep its FIRST message fixed between steps, or the server's cache point can never be read
 * back (the sliding last-24 window cost 74% of prod spend, 22–28 Sep). Extracts steppedHistory from the shipped
 * wml-core.js and checks: ≤24 messages pass whole; the window is 24–35 long; the first message changes only
 * every 12 turns; and the call sites use it (no sliding slice(-24) left on a history sent to the model).
 */
const fs = require('fs'); const path = require('path'); const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const core = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
const wa = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'frontend/wml-app.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const i = core.indexOf('function steppedHistory(');
let body = '';
if (i !== -1) { let d = 0; for (let k = core.indexOf('{', i); k < core.length; k++) { if (core[k] === '{') d++; else if (core[k] === '}') { d--; if (!d) { body = core.slice(i, k + 1); break; } } } }
ok(!!body, 'steppedHistory present in wml-core.js');
const ctx = {}; vm.createContext(ctx); vm.runInContext(body, ctx);
const H = (n) => Array.from({ length: n }, (_, j) => j);
ok(ctx.steppedHistory(H(10)).length === 10 && ctx.steppedHistory(H(24)).length === 24, 'up to 24 messages are sent whole');
let firstChanges = 0, prevFirst = null, minLen = 1e9, maxLen = 0;
for (let n = 25; n <= 200; n++) {
    const w = ctx.steppedHistory(H(n));
    minLen = Math.min(minLen, w.length); maxLen = Math.max(maxLen, w.length);
    if (w[w.length - 1] !== n - 1) { fail++; console.log('  ✗ window lost the latest message at n=' + n); }
    if (prevFirst !== null && w[0] !== prevFirst) firstChanges++;
    prevFirst = w[0];
}
ok(minLen === 24 && maxLen === 35, 'the window is 24–35 messages long (was exactly 24)');
ok(firstChanges === Math.floor((200 - 24) / 12) - Math.floor((25 - 24) / 12), 'the first message changes only every 12 turns (' + firstChanges + ' steps over 176 turns, was 175)');
ok(!/slice\(0, -1\)\.slice\(-24\)/.test(wa), 'wml-assessment.js: no sliding slice(-24) left on a history sent to the model');
ok(!/\.slice\(-MAX_HISTORY_MESSAGES\)/.test(app), 'wml-app.js: no sliding slice(-MAX_HISTORY_MESSAGES) left');
ok((wa.match(/WML\.steppedHistory\(/g) || []).length === 4 && (app.match(/WML\.steppedHistory\(/g) || []).length === 2, 'all six call sites use the stepped window');
console.log('\n' + (fail ? '✗ stepped-history-harness FAILED' : '✅ stepped-history-harness passed') + ' (' + pass + ' passed, ' + fail + ' failed).');
process.exit(fail ? 1 : 0);
