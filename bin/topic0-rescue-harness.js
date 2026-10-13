#!/usr/bin/env node
/* eslint-env node */
/**
 * topic0-rescue-harness.js — v7.20.867 (FIXLIST grades-wrong-anam-reeham). The topic orphan rescue (v7.19.138/140) must
 * never borrow ACROSS a mark-scheme document's topic 0: there, topic 0 is a separate lesson's own document (Final
 * Assessment `_ms`, Spot the Difference `_msu`). Prod, 13 Oct: Reeham's A Christmas Carol Final Assessment showed
 * Assessment 2's 16/20 · Grade 7 through Direction B.
 * Runs the pure topic0_is_own_document() in PHP, then checks all four rescue sites (student + review loaders × A/B) use it.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'includes', 'class-rest-api.php'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m, g) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (g !== undefined ? '  — got: ' + JSON.stringify(g) : '')); } };

console.log('\n1. the rule (the shipped PHP, executed)');
const b = SRC.indexOf('// @TOPIC0-OWN-PURE-BEGIN'), e = SRC.indexOf('// @TOPIC0-OWN-PURE-END');
ok(b > -1 && e > b, 'the @TOPIC0-OWN-PURE block exists');
if (b > -1 && e > b) {
    const fn = SRC.slice(b, e).replace('public static function', 'function');
    const run = (sfx) => execFileSync('php', ['-r', fn + ' echo topic0_is_own_document(' + JSON.stringify(sfx) + ') ? "1" : "0";']).toString();
    ok(run('_ms') === '1', "⭐ '_ms' (the Final Assessment) owns its topic 0");
    ok(run('_msu') === '1', "'_msu' (Spot the Difference) owns its topic 0");
    ok(run('') === '0' && run('_assessment') === '0' && run('_planning') === '0' && run('_fq') === '0', 'every other document keeps the rescue it had');
}

console.log('\n2. all four rescue sites honour it');
const A = SRC.match(/if \(empty\(\$raw\) && \$topic_number !== null && \$topic_number > 0[^\n]*\{/g) || [];
const B = SRC.match(/if \(empty\(\$raw\) && \(\$topic_number === null \|\| \$topic_number === 0\)[^\n]*\{/g) || [];
ok(A.length === 2 && A.every(l => /!self::topic0_is_own_document\(\$suffix\)/.test(l)), '⭐ Direction A (borrow + WRITE FORWARD the topic-0 doc) — student and review loaders', A);
ok(B.length === 2 && B.every(l => /!self::topic0_is_own_document\(\$suffix\)/.test(l)), '⭐ Direction B (borrow a _tN doc for an empty topic 0) — student and review loaders', B);

console.log('\n3. the "already recorded?" read (v7.20.869) — topic 0 is exact, never a wildcard');
const QE = fs.readFileSync(path.join(__dirname, '..', 'includes', 'class-quiz-engine.php'), 'utf8');
const gpr = QE.slice(QE.indexOf('public function get_persisted_result('), QE.indexOf('public function get_persisted_result(') + 4000);
ok(/AND \( \( %d = 0 AND \( topic_number IS NULL OR topic_number = 0 \) \) OR topic_number = %d \)/.test(gpr), '⭐ topic 0 matches only topic-0 rows (NULL or 0); topic N > 0 stays exact');
ok(!/AND \( %d = 0 OR topic_number = %d \)/.test(gpr), 'the wildcard form is gone');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('❌ topic0-rescue-harness FAILED'); process.exit(1); }
console.log('✅ topic0-rescue-harness passed (a Final Assessment never borrows Assessment 2, nor lends to it).');
