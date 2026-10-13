#!/usr/bin/env node
/* eslint-env node */
/**
 * msa-attempt-harness.js — v7.20.870 (FIXLIST msa-attempt-reuse-overwrites-grade). A fresh Mark Scheme Assessment
 * sitting restarted its attempt # at 1, re-emitted …:_msa:a1, and the student-data listener UPDATEd that row: prod,
 * 13 Oct — Anam's code-scored 20/20 · G9 (7 Sep) was overwritten by 12/20 · G5. The server now numbers a new round
 * after every attempt already on record for that document.
 * Runs the pure next_msa_attempt() in PHP, checks start() uses it with the listener's own session_id template.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const QE = fs.readFileSync(path.join(__dirname, '..', 'includes', 'class-quiz-engine.php'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m, g) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (g !== undefined ? '  — got: ' + JSON.stringify(g) : '')); } };

console.log('\n1. the rule (the shipped PHP, executed)');
const b = QE.indexOf('// @MSA-ATTEMPT-PURE-BEGIN'), e = QE.indexOf('// @MSA-ATTEMPT-PURE-END');
ok(b > -1 && e > b, 'the @MSA-ATTEMPT-PURE block exists');
if (b > -1 && e > b) {
    const fn = QE.slice(b, e).replace('public static function', 'function');
    const P = 'canvas:aqa:aqa_lang_paper_2:t0:_msa:a';
    const run = (client, rows) => execFileSync('php', ['-r', fn + ' echo next_msa_attempt(' + client + ', ' + JSON.stringify(rows).replace(/^\[/, 'array(').replace(/\]$/, ')') + ', ' + JSON.stringify(P) + ');']).toString();
    ok(run(1, []) === '1', 'first ever sitting → a1');
    ok(run(1, [P + '1', P + '2', P + '3', P + '4']) === '5', "⭐ a fresh sitting after a1–a4 → a5 (Anam's case: it was a1, overwriting her G9)");
    ok(run(2, [P + '1']) === '2', 'round 2 of the same sitting → a2 (unchanged)');
    ok(run(1, [P + '2', P + '7']) === '8', 'a gap in the record still lands after the highest');
    ok(run(1, ['canvas:aqa:aqa_lang_paper_2:t1:_msa:a9', P + 'x', P + '3b']) === '1', "another topic's rows and malformed ids are ignored");
    ok(run(6, [P + '2']) === '6', 'never below the client\'s own count');
}

console.log('\n2. start() assigns it for the MSA, with the listener\'s session_id');
const st = QE.slice(QE.indexOf('public function start('), QE.indexOf('// @MSA-ATTEMPT-PURE-BEGIN'));
ok(/if \(\$accumulator\['quiz_type'\] === 'mark_scheme_assessment'\) \{[\s\S]*?self::next_msa_attempt\(/.test(st), '⭐ start() calls next_msa_attempt for mark_scheme_assessment');
ok(/sprintf\('canvas:%s:%s:t%d:_msa:a', sanitize_text_field\(\$accumulator\['board'\]\),\s*sanitize_text_field\(\$accumulator\['text'\]\), absint\(\$accumulator\['topic_number'\]\)\)/.test(st), 'the prefix uses the listener\'s sanitisers: text_field(board) · text_field(text) · absint(topic)');
ok(st.indexOf('next_msa_attempt(') < st.indexOf('$this->save_accumulator('), 'assigned before the accumulator is saved (so a re-finalize reuses it)');
const LST = path.join(__dirname, '..', '..', '..', '..', 'sophicly-plugins', 'sophicly-student-data', 'includes', 'class-wml-listener.php');
if (fs.existsSync(LST)) {
    const L = fs.readFileSync(LST, 'utf8');
    ok(L.includes("$session_id = sprintf( 'canvas:%s:%s:t%d:%s:a%d', $board, $text, $topic, $suffix, $attempt );"), "the student-data listener still builds canvas:{board}:{text}:t{topic}:{suffix}:a{N} (read side of the key)");
    ok(/\$board\s+= sanitize_text_field\( \$board \);[\s\S]{0,120}\$text\s+= sanitize_text_field\( \$text \);[\s\S]{0,60}\$topic\s+= absint\( \$topic \);/.test(L), 'and sanitises board/text/topic the same way');
} else {
    console.log('  · listener not found beside this repo — template cross-check skipped');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ msa-attempt-harness FAILED'); process.exit(1); }
console.log('✅ msa-attempt-harness passed (a re-sit never re-uses an attempt already on record).');
