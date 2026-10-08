#!/usr/bin/env node
/* eslint-env node */
/**
 * msa-topic-key-harness.js — v7.20.760 (FIXLIST #803, root CLAUDE.md §5e KEY GRANULARITY).
 *
 * A Mark Scheme Assessment is ONE QUIZ PER TOPIC (every literature course runs MSA 1, 2, 3… on the same text·board
 * bank). Its resume record AND its server session id (qsid) are the same string, `lsKey()`. Before .760 that string
 * had no topic, so MSA N overwrote MSA N−1's resume record and server accumulator. This gate executes the REAL key
 * code from wml-assessment.js and asserts: (1) two MSA topics get two keys; (2) MSQ / FQ keys are byte-identical to
 * before (their scope is not this change); (3) a round saved under the pre-.760 key is still found, and keeps that
 * key (so its server session) until the next fresh round; (4) every fresh round returns to the topic key.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
function ok(c, msg, got) { if (c) { pass++; return; } fail++; console.error('  ❌ ' + msg + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); }

const a = SRC.indexOf('const _lsKeyBase = () =>');
const b = SRC.indexOf('const lsKey = () =>', a);
const e = SRC.indexOf('\n', b);
ok(a > 0 && b > a && b - a < 1500, 'the quiz key block exists (base key, legacy flag, topic key) in one place');
const BLOCK = SRC.slice(a, e);
// `quizType` is read by the key arrows at CALL time, so it is declared in the same scope as the sliced block.
const run = (st, qt) => {
    const f = new Function('state', 'qt', 'let quizType = qt;\n' + BLOCK + '\nreturn { key: () => lsKey(), base: () => _lsKeyBase(), legacy: (v) => { _msaLegacyKey = v; } };');   // eslint-disable-line no-new-func
    return f(st, qt);
};
const S = (topic) => ({ board: 'aqa', subject: 'shakespeare', text: 'much_ado', attempt: 1, fqStage: 0, fqBank: '', topicNumber: topic });
const OLD = (qt, st) => (qt === 'foundational' ? 'swml_fq_' : qt === 'mark_scheme_assessment' ? 'swml_msa_' : 'swml_msq_') + [st.board, st.subject, (st.fqBank || st.text), (st.attempt || 1), 's' + (st.fqStage || 0)].join('_');

const m2 = run(S(2), 'mark_scheme_assessment'), m3 = run(S(3), 'mark_scheme_assessment');
ok(m2.key() !== m3.key(), '⭐ MSA 2 and MSA 3 on the same text get DIFFERENT keys (so different resume records and server sessions)', [m2.key(), m3.key()]);
ok(m3.key() === OLD('mark_scheme_assessment', S(3)) + '_t3', 'the MSA key is the old key plus its topic', m3.key());
ok(run(S(3), 'mark_scheme').key() === OLD('mark_scheme', S(3)) && run(S(3), 'foundational').key() === OLD('foundational', S(3)),
    'MSQ and FQ keys are byte-identical to before (not this change\'s scope)');
const lg = run(S(3), 'mark_scheme_assessment'); lg.legacy(true);
ok(lg.key() === OLD('mark_scheme_assessment', S(3)), 'a resumed pre-.760 round keeps its ORIGINAL key — and so its server session', lg.key());

// wiring: rehydrate falls back to the old key only when the new one is empty; every fresh round resets the flag
ok(/let raw = localStorage\.getItem\(lsKey\(\)\);\s*\n\s*if \(!raw && quizType === 'mark_scheme_assessment' && !_msaLegacyKey\) \{[^}]*localStorage\.getItem\(_lsKeyBase\(\)\);\s*\n\s*if \(old\) \{ _msaLegacyKey = true; raw = old;/.test(SRC),
    'rehydrate() looks under the old key only when the topic key holds nothing, and then adopts it');
const sr = SRC.indexOf('async function startRound() {');
ok(sr > 0 && /_msaLegacyKey = false;/.test(SRC.slice(sr, sr + 600)) && SRC.slice(sr, sr + 600).indexOf('_msaLegacyKey = false;') < SRC.slice(sr, sr + 900).indexOf('qsid: lsKey()'),
    'every fresh round goes back to the topic key BEFORE it asks the server for a session');

console.log('msa-topic-key-harness: ' + pass + ' passed' + (fail ? ', ' + fail + ' FAILED' : ''));
if (fail) { console.error('❌ msa-topic-key-harness FAILED'); process.exit(1); }
console.log('✅ msa-topic-key-harness passed (one Mark Scheme Assessment per topic, one key per topic).');
