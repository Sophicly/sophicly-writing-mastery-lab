#!/usr/bin/env node
/* eslint-env node */
/**
 * sync-arbitration-harness — v7.20.639 (#598). WHICH COPY WINS ON LOAD: this browser's or the server's.
 *
 * THE DEFECT (measured on staging, 2026-09-26): for every task but CW and cribs, ANY local copy won
 * on load and was autosaved back over the server — no timestamps compared. Neil's browser wrote his
 * morning documents over the server's newer ones; a student working home → school → home loses the
 * school work. This runs the SHIPPED decision function (sliced from wml-assessment.js, never
 * re-implemented) against a fake localStorage, scenario by scenario, and checks the wiring.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const PHP = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (extra ? '  → ' + extra : '')); } };

function grab(name) {
    const i = JS.indexOf('    function ' + name + '(');
    if (i < 0) throw new Error(name + ' not found in wml-assessment.js');
    const j = JS.indexOf('\n    }\n', i);
    return JS.slice(i, j + 6);
}
const SRC = ['_syncRead', '_syncWrite', '_serverCopyWins', '_stashConflict'].map(grab).join('\n');
function rig() {
    const store = {};
    const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
    const warns = [];
    const console2 = { log() {}, warn: (m) => warns.push(m) };
    const api = new Function('localStorage', 'console', SRC + '; return { _syncRead, _syncWrite, _serverCopyWins, _stashConflict };')(localStorage, console2);
    return { store, api, warns };
}
const K = 'swml_canvas_aqa_aqa_lang_paper_1_1_assessment';
const t = (s) => new Date(s).toISOString();

console.log('\nA · the decision, scenario by scenario (the shipped function)');
{   // 1. one device, nothing else happened
    const { store, api } = rig();
    store[K + '__ts'] = String(Date.parse('2026-09-26T10:00:00Z'));
    api._syncWrite(K, t('2026-09-26T10:00:05Z'), Date.parse('2026-09-26T10:00:00Z'));
    const d = api._serverCopyWins(K, t('2026-09-26T10:00:05Z'));
    ok(d.wins === false, 'same device, server unchanged since its last save → this browser\'s copy stays', JSON.stringify(d));
}
{   // 2. Monday home → Tuesday school → Wednesday home
    const { store, api } = rig();
    store[K + '__ts'] = String(Date.parse('2026-09-21T18:00:00Z'));          // Monday's last edit at home
    api._syncWrite(K, t('2026-09-21T18:00:04Z'), Date.parse('2026-09-21T18:00:00Z'));
    const d = api._serverCopyWins(K, t('2026-09-22T11:30:00Z'));             // Tuesday's save at school
    ok(d.wins === true && d.conflict === false, 'home → school → home: the server (Tuesday, school) wins over the home copy (Monday)', JSON.stringify(d));
}
{   // 3. unsaved typing here, server unchanged → never lose it
    const { store, api } = rig();
    api._syncWrite(K, t('2026-09-26T10:00:05Z'), Date.parse('2026-09-26T10:00:00Z'));
    store[K + '__ts'] = String(Date.parse('2026-09-26T10:03:00Z'));          // typed after the last confirmed save
    const d = api._serverCopyWins(K, t('2026-09-26T10:00:05Z'));
    ok(d.wins === false, 'unsaved typing on THIS device, server unchanged → this device\'s copy stays (nothing lost)', JSON.stringify(d));
}
{   // 4. unsaved typing here AND the server changed elsewhere → conflict: server wins, local stashed
    const { store, api, warns } = rig();
    api._syncWrite(K, t('2026-09-26T10:00:05Z'), Date.parse('2026-09-26T10:00:00Z'));
    store[K + '__ts'] = String(Date.parse('2026-09-26T10:03:00Z'));
    store[K] = '<p>typed here</p>';
    const d = api._serverCopyWins(K, t('2026-09-26T11:00:00Z'));
    ok(d.wins === true && d.conflict === true, 'both changed → a conflict: the server copy wins', JSON.stringify(d));
    api._stashConflict(K, store[K], d.why);
    ok(store[K + '__conflict_bak'] === '<p>typed here</p>' && warns.length === 1, 'and this device\'s copy is KEPT in __conflict_bak, with a warning (nothing is silently discarded)');
}
{   // 5. clock skew: this laptop's clock is an hour fast — the decision must not care
    const { store, api } = rig();
    const fast = 3600 * 1000;
    store[K + '__ts'] = String(Date.parse('2026-09-21T18:00:00Z') + fast);
    api._syncWrite(K, t('2026-09-21T18:00:04Z'), Date.parse('2026-09-21T18:00:00Z') + fast);
    const d = api._serverCopyWins(K, t('2026-09-22T11:30:00Z'));
    ok(d.wins === true && d.conflict === false, 'a laptop clock an hour fast changes nothing — both compared times are the server\'s', JSON.stringify(d));
}
{   // 6. Neil's case: no sync record yet (first load after this ships), morning local vs afternoon server
    const { store, api } = rig();
    store[K + '__ts'] = String(Date.parse('2026-09-26T09:55:00Z'));
    const d = api._serverCopyWins(K, t('2026-09-26T12:36:49Z'));
    ok(d.wins === true, 'NEIL\'S CASE: no record yet, the server copy is hours newer → the server wins', JSON.stringify(d));
}
{   // 7. no record, server only seconds newer (this device's own debounced save) → keep local
    const { store, api } = rig();
    store[K + '__ts'] = String(Date.parse('2026-09-26T10:00:00Z'));
    const d = api._serverCopyWins(K, t('2026-09-26T10:00:05Z'));
    ok(d.wins === false, 'no record, server within two minutes of this device\'s last edit → keep this device\'s copy (the old behaviour)', JSON.stringify(d));
}
{   // 8. the server sent no time → never override
    const { api } = rig();
    ok(api._serverCopyWins(K, '').wins === false, 'a server copy with no savedAt never overrides the local one');
}

console.log('\nB · the wiring');
ok(/\|\| _srvWin\.wins;/.test(JS), 'the document mount gate lets a newer server copy win (_preferServer includes _srvWin.wins)');
ok(/_serverCopyWins\(_docKey, res\.doc && res\.doc\.savedAt\)/.test(JS), 'it decides from the server document\'s savedAt');
ok(/if \(res\.success\) \{\s*_syncWrite\(_syncKeyAtEnqueue, res\.savedAt, _syncTsAtEnqueue\)/.test(JS), 'a successful document save records which local edit the server now holds');
ok(/if \(res\.success\) _syncWrite\(_chatKeyNow, res\.savedAt, _chatTsNow\)/.test(JS), 'a successful chat save records it too');
ok(/sc\.history\.length > localChat\.history\.length\)\s*\n?\s*\? \{ wins: true/.test(JS), 'a local chat SHORTER than the server\'s always loses (the server refuses shorter saves, so it can only be behind) — how students whose chat failed to load get it back');
ok((JS.match(/_serverChatWins\(savedChat, serverChat\)/g) || []).length === 2, 'BOTH chat resume pipelines use the one chat rule');
ok(/if \(_needChat \|\| _wantSidebar \|\| savedChat\)/.test(JS) && /if \(_needChat2 \|\| _wantSidebar2 \|\| savedChat\)/.test(JS), 'both pipelines ask the server even when this browser holds a chat');
ok(/'savedAt' => \$data\['savedAt'\],\s*\/\/ v7\.20\.639/.test(PHP), 'the chat save response returns the server\'s savedAt');

console.log('\nC · the server chat can actually be loaded (v7.20.639)');
{
    const body = (name) => { const i = PHP.indexOf('    public function ' + name + '('); const j = PHP.indexOf('\n    public function ', i + 10); return i < 0 ? '' : PHP.slice(i, j); };
    const load = body('load_canvas_chat'), save = body('save_canvas_chat');
    ok(!!load && !/count\(\$history\)/.test(load.split('$data = $raw')[0]), 'load_canvas_chat never counts $history before it exists (the pasted guard made every chat load a TypeError since 2026-07-27)');
    ok(!/chat_turn_ceiling|chat_looping/.test(load), 'the runaway / loop guards are NOT in the load function');
    ok(/chat_turn_ceiling = 600/.test(save) && /chat_looping/.test(save), 'they ARE still in save_canvas_chat, the one chat-save endpoint');
}

console.log('\n' + (fail ? '❌' : '✅') + ' sync-arbitration-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
