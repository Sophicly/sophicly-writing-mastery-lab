#!/usr/bin/env node
/* eslint-env node */
/**
 * assess-ladder-host-harness.js — v7.20.604 (#469): the mark-scheme self-assessment for assessments.
 *
 * What it proves, from the SHIPPED code (never a summary of it):
 *   A. DATA   — every scheme key the host can derive for AQA Lang P1 / P2 / unseen exists in the
 *               generated dataset, with levels and a max; unseen's Q27.2 is excluded unless the
 *               topic data poses it (the course's own unseen topics pose ONE question).
 *   B. DOC    — the section builder emits one row-group per key (level · met · mark · reason ·
 *               band) plus the confidence row, under the ONE label the host reads back, and emits
 *               NOTHING where no scheme data exists (no empty section on other boards).
 *   C. WIRING — the 'ladder' stage precedes 'selfassess' in BOTH chat pipelines (the dual-pipeline
 *               rule: a feature added to one silently misses the other), the render branch exists
 *               in both, the typed fallback is guarded in both, the heal list carries the section,
 *               the label is stripped from the marking payload and the ledger scan, and the
 *               record spread carries `self_assessment`.
 *   D. REGIME — the best-fit regime exists in the ladder controller and its student-facing copy
 *               carries none of the words PEDAGOGY §35 bans (hurdle · unlock · pass this level ·
 *               before you can move up); the CW regime's copy is untouched.
 *   E. SOPHIA — the hand-back directive carries the student's own marks and tells the marker to
 *               use them in the Calibration Check; the three AQA assessment protocols say the same.
 *   F. §4d    — the resumed-wrap branch re-enters the host (no wrap with nothing to do next).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } };
const count = (re) => (JS.match(re) || []).length;

// ── A · DATA ─────────────────────────────────────────────────────────────────────────────────
console.log('\nA · the dataset carries every key the host derives');
const data = require(path.join(ROOT, 'frontend', 'wml-markscheme-data.js'));
const keysFor = (paper) => Object.keys(data).filter((k) => k.indexOf('aqa_' + paper + '_') === 0 && data[k] && Array.isArray(data[k].levels));
const l1 = keysFor('lang1'), l2 = keysFor('lang2'), us = keysFor('unseen');
ok(l1.length === 5, 'AQA Lang P1: 5 schemes (Q2 AO2 · Q3 AO2 · Q4 AO4 · Q5 AO5 · Q5 AO6) — got ' + l1.length);
ok(l2.length === 5, 'AQA Lang P2: 5 schemes (Q2 AO1 · Q3 AO2 · Q4 AO3 · Q5 AO5 · Q5 AO6) — got ' + l2.length);
ok(us.length === 2, 'AQA unseen: 2 schemes (Q27.1 · Q27.2) — got ' + us.length);
[].concat(l1, l2, us).forEach((k) => {
    const s = data[k];
    ok(s.levels.length >= 4 && s.maxMarks > 0 && s.question && s.ao, k + ': ' + s.levels.length + ' levels, /' + s.maxMarks + ', ' + s.question + ' ' + s.ao);
});
ok(data.aqa_unseen_q271 && data.aqa_unseen_q271.levels.every((l) => l.bands.length === 1 && l.bands[0].strands.length === 2),
    'unseen Q27.1 is ONE ladder with an AO1 + AO2 strand per level (never two 24-mark ladders)');

// The host's key builder, executed against a fake state/window — the real function, sliced whole.
const kbSrc = JS.slice(JS.indexOf('    function _ladderSchemeKeysFor(topicData) {'), JS.indexOf('    function _ladderFids(key) {'));
ok(kbSrc.length > 200 && /return keys\.map/.test(kbSrc), 'sliced the real _ladderSchemeKeysFor whole');
function keysUnder(board, subject, topicData, text) {
    const ctx = { window: { WML_MARK_SCHEMES: data }, state: { board, subject, text: text || '' }, console };
    vm.createContext(ctx);
    vm.runInContext(kbSrc + '\nthis.__out = _ladderSchemeKeysFor(' + JSON.stringify(topicData || null) + ');', ctx);
    return ctx.__out;
}
ok(keysUnder('aqa', 'language1').length === 5, 'derives 5 keys for aqa/language1');
// The REAL shortcode shape on the staging AQA P1 assessment lesson (measured 2026-09-07):
// subject="language" text="aqa_lang_paper_1" — the paper is in the TEXT slug.
ok(keysUnder('aqa', 'language', null, 'aqa_lang_paper_1').length === 5, 'derives 5 keys for subject=language + text=aqa_lang_paper_1 (the real lesson shape)');
ok(keysUnder('aqa', 'language', null, 'aqa_lang_paper_2').length === 5, 'derives 5 keys for subject=language + text=aqa_lang_paper_2');
ok(keysUnder('aqa', 'language', null, 'aqa-lang-paper-1').length === 5, 'dash form of the text slug resolves too');
ok(keysUnder('aqa', 'language', null, '').length === 0, 'subject=language with NO text → nothing (never guess a paper)');
ok(keysUnder('aqa', 'language_p2').length === 5, 'derives 5 keys for aqa/language_p2 (spec-key spelling)');
ok(keysUnder('aqa', 'unseen_poetry').length === 1 && keysUnder('aqa', 'unseen_poetry')[0].key === 'aqa_unseen_q271',
    'unseen with NO Q27.2 in the topic → Q27.1 only (the course\'s own topics)');
ok(keysUnder('aqa', 'unseen_poetry', { questions: [{ id: 'Q27.1' }, { id: 'Q27.2' }] }).length === 2,
    'unseen with Q27.2 posed → both ladders (a real past-paper sitting)');
ok(keysUnder('edexcel', 'language1').length === 0, 'no keys for a board with no scheme data (edexcel) — the section never renders there');
ok(keysUnder('aqa', 'shakespeare').length === 0, 'no keys for AQA Literature yet (its 6-level shape is not in the dataset) — honest empty, not a guess');

// ── B · DOC ──────────────────────────────────────────────────────────────────────────────────
console.log('\nB · the document section');
const bsSrc = JS.slice(JS.indexOf('    function buildMarkSchemeSelfAssessSection(topicData) {'), JS.indexOf('    function _ladderRowText(fid) {'));
const fidSrc = JS.slice(JS.indexOf('    function _ladderFids(key) {'), JS.indexOf('    // The document section'));
function sectionUnder(board, subject) {
    const ctx = {
        window: { WML_MARK_SCHEMES: data }, state: { board, subject }, console,
        escapeHTML: (x) => String(x), inputHTML: (p, f) => '<row fid="' + f + '"/>',
        sectionHTML: (t, l, e, p, inner) => '<sec label="' + l + '">' + inner + '</sec>',
        LADDER_SA_LABEL: 'Mark-Scheme Self-Assessment',
    };
    vm.createContext(ctx);
    vm.runInContext(kbSrc + fidSrc + bsSrc + '\nthis.__out = buildMarkSchemeSelfAssessSection(null);', ctx);
    return ctx.__out;
}
const p1 = sectionUnder('aqa', 'language1');
ok(/label="Mark-Scheme Self-Assessment"/.test(p1), 'P1 section carries the host\'s label');
ok((p1.match(/<row fid="sa-ms-aqa_lang1_/g) || []).length === 25, 'P1: 5 keys × 5 rows = 25 rows — got ' + (p1.match(/<row fid="sa-ms-aqa_lang1_/g) || []).length);
ok(/fid="sa-ms-confidence"/.test(p1), 'P1: the confidence row exists');
ok(sectionUnder('edexcel', 'language1') === '', 'no scheme data → empty string (no orphan section)');

// ── C · WIRING ───────────────────────────────────────────────────────────────────────────────
console.log('\nC · both pipelines, heal, strip, record');
ok(count(/if \(_ladderHostEligible\(\) && !_ladderHostComplete\(\)\) return 'ladder';/g) === 2, "'ladder' stage returned in BOTH pre-chains");
ok(count(/if \(stage === 'ladder'\) \{ _ladderHostRenderCurrent\(\); return; \}/g) === 2, 'ladder render branch in BOTH pipelines');
ok(count(/_pcStage === 'ladder' && _ladderHostConsumeTyped\(msg\)/g) === 2, 'typed confidence fallback guarded in BOTH pipelines');
// order: ladder line must come BEFORE the selfassess line at each site
const idxL = [], idxS = [];
JS.replace(/return 'ladder';/g, (m, o) => { idxL.push(o); return m; });
JS.replace(/return 'selfassess';/g, (m, o) => { idxS.push(o); return m; });
ok(idxL.length === 2 && idxS.length === 2 && idxL[0] < idxS[0] && idxL[1] < idxS[1], 'the ladder precedes the blind walk at both sites');
ok(/label: LADDER_SA_LABEL, build: \(\) => buildMarkSchemeSelfAssessSection\(\)/.test(JS), 'healed into existing documents (requiredSections)');
ok(/STRIP_LABELS = new Set\(\['Analytics', 'Self-Assessment', 'Mark-Scheme Self-Assessment', 'Action Plan'\]\)/.test(JS), 'stripped from the marking payload');
ok(/SKIP = \/\^\(Overall Feedback\|Analytics\|Self-Assessment\|Mark-Scheme Self-Assessment\|Action Plan\|Score Summary\)\/i/.test(JS), 'skipped by the ledger scan');
ok(count(/html \+= buildMarkSchemeSelfAssessSection\((?:topicData|null)\);/g) === 5, 'composed at all 5 document sites (2 exam-prep + 3 literature/dual) — got ' + count(/html \+= buildMarkSchemeSelfAssessSection\((?:topicData|null)\);/g));
ok(/self_assessment: \{ regime: 'bestfit', confidence: _ladderHostConfidence\(\) \|\| null, items: items \}/.test(JS), 'the canvas save carries self_assessment {regime, confidence, items[]}');
ok(/_ladderOpenHook = function \(o\) \{ return _examinerLadderCtl\.open\(o\); \};/.test(JS), 'the closure-local ladder is reached through a module-scope hook (the .898 lesson)');

// ── D · REGIME + COPY BANS (PEDAGOGY §35) ───────────────────────────────────────────────────
console.log('\nD · best-fit regime and the §35 copy bans');
const ladderSrc = JS.slice(JS.indexOf('const _examinerLadderCtl = (function () {'), JS.indexOf('_ladderOpenHook = function (o)'));
ok(/const isBestFit = function \(\) \{ return !!\(cfg && cfg\.regime === 'bestfit'\); \};/.test(ladderSrc), 'regime switch exists');
ok(/Is your writing still better than this description\?/.test(ladderSrc), 'best-fit rung question is the §35 question');
ok(/if \(pick === YES \|\| pick === BF_BETTER\)/.test(ladderSrc), 'a best-fit "better" climbs through the same engine path');
// Only the best-fit branches are student-facing under the new regime: the orientation block's
// return array, each ternary's TRUE operand, and the best-fit chip line. The CW branches are
// deliberately excluded — they keep §33.10's wording.
const bfStrings = [
    ...(ladderSrc.match(/if \(isBestFit\(\)\) \{\s*return \[([\s\S]*?)\];/g) || []),
    ...(ladderSrc.match(/isBestFit\(\)\s*\?\s*([\s\S]*?)\n\s*:\s/g) || []),
    ...(ladderSrc.match(/if \(isBestFit\(\)\) chipBarOrRetry\([^\n]*/g) || []),
    (ladderSrc.match(/const BF_BETTER = '[^']*';/) || [''])[0],
    (ladderSrc.match(/const BF_HERE = '[^']*';/) || [''])[0],
].join('\n');
ok(bfStrings.length > 800, 'best-fit copy extracted for the ban scan (' + bfStrings.length + ' chars)');
['hurdle', 'unlock', 'pass this level', 'before you can move up', 'met every one'].forEach((w) => {
    ok(bfStrings.toLowerCase().indexOf(w) === -1, 'best-fit copy never says "' + w + '"');
});
ok(/Have you met every one of these in your writing\?/.test(ladderSrc), 'the CW regime\'s original rung question is untouched');
ok(/regime: 'bestfit'/.test(JS.slice(JS.indexOf('function _ladderHostRenderCurrent'))), 'the assessment host opens the ladder in best-fit');

// ── E · SOPHIA ───────────────────────────────────────────────────────────────────────────────
console.log('\nE · the marker is handed the student\'s own marks');
ok(/THE STUDENT\\'S OWN MARKS \(their level, their mark, the criteria they judged met, their reason\)/.test(JS), 'hand-back directive carries the own-marks summary');
ok(/Use these in every Calibration Check/.test(JS), 'directive tells the marker to use them in the Calibration Check');
ok(/_setPredicted\(qNum, res\.mark\)/.test(JS), 'the own mark feeds the existing calibration path (_setPredicted)');
['protocols/aqa/language1/modules/protocol-a-assessment.md', 'protocols/aqa/language2/modules/protocol-a-assessment.md', 'protocols/aqa/unseen/modules/protocol-a-assessment-unseen.md'].forEach((rel) => {
    const md = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\s+/g, ' ');
    ok(/THE STUDENT'S OWN MARKS/.test(md) && /never let their mark move yours/.test(md), rel.split('/')[2] + ' protocol: own marks supersede the panel prediction; their mark never moves Sophia\'s');
});

// ── F · §4d liveness on a resumed wrap ──────────────────────────────────────────────────────
console.log('\nF · a resumed wrap re-enters the host');
ok(/else if \(cfg && cfg\.walkId === LADDER_SA_WALK\)/.test(ladderSrc) && /_ladderHostRenderCurrent\(\)/.test(ladderSrc), 'wrap without a live onDone (after reload) calls the host again');

console.log('\n' + (fail ? '❌' : '✅') + ' assess-ladder-host-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
