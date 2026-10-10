#!/usr/bin/env node
/* eslint-env node */
/**
 * q1-choices-harness.js — v7.20.802 (WML 343 A, FIXLIST #857; #731 item 5, PEDAGOGY §51.6).
 * AQA Paper 1 Question 1 in the 2026 format: four questions on the named lines, three options each, ONE answer each
 * (research/sources/aqa-8700-1-sqp-2026.txt). This gate proves the whole chain, not its plumbing:
 *   A · the REAL PHP parser turns every practice paper's `### Choices` into q.choices (4 × 3, exactly one key) and
 *       the key never reaches the student-visible question text; a question with no key or two keys is DROPPED.
 *   B · the REAL scoring code (executed, not grepped) gives one mark per right answer, 0 for none / a wrong one /
 *       more than one, and hands Sophia the score as a fixed mark.
 *   C · the wiring: the document builder gates on the AUTHORED DATA (a past paper keeps its list-four boxes), one
 *       answer per question, the payload line, both chat pipelines, the pristine-only rebuild, the protocol's two shapes.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, msg, extra) => { if (c) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg + (extra !== undefined ? ' — ' + JSON.stringify(extra).slice(0, 300) : '')); } };

// ── A · the real parser ─────────────────────────────────────────────────────────────────────────────────────────
console.log('\nA · the topic parser (real PHP)');
const STUBS = 'define("ABSPATH","/");function current_time($t){return "2026-01-01 00:00:00";}function sanitize_text_field($s){return trim(strip_tags($s));}function wp_json_encode($d,$f=0){return json_encode($d,$f);}';
function parseQ1(markdown) {
    const php = STUBS + 'require ' + JSON.stringify(path.join(ROOT, 'includes/class-topic-parser.php')) + ';'
        + '$t=SWML_Topic_Parser::parse(stream_get_contents(STDIN));$o=[];foreach($t as $tp){$m=is_string($tp["metadata"]??null)?json_decode($tp["metadata"],true):($tp["metadata"]??[]);'
        + 'foreach(($m["questions"]??[]) as $q) if($q["id"]==="Q1") $o[]=["topic"=>$tp["topic_number"],"text"=>$q["text"],"choices"=>$q["choices"]??null];}echo json_encode($o);';
    return JSON.parse(execFileSync('php', ['-d', 'error_log=/dev/null', '-r', php], { input: markdown, encoding: 'utf8' }));
}
const TPL = fs.readFileSync(path.join(ROOT, 'protocols/shared/templates/topics/aqa-language-p1.md'), 'utf8');
const real = parseQ1(TPL);
ok(real.length === 5, 'the template holds five practice papers, each with a Q1', real.length);
real.forEach((q) => {
    const c = q.choices || [];
    ok(c.length === 4 && c.every((x) => Array.isArray(x.options) && x.options.length === 3 && Number.isInteger(x.key) && x.key >= 0 && x.key < 3),
        `Topic ${q.topic}: four questions, three options, one answer each (the 2026 shape)`, c.map((x) => [x.options && x.options.length, x.key]));
    ok(!/\[[ xX]\]|^\s*-\s/m.test(q.text) && /Choose one answer for each question\./.test(q.text) && /lines 1 to \d+/.test(q.text),
        `Topic ${q.topic}: the student sees the 2026 stem, never the answer key`, q.text);
    ok(!/list four/i.test(q.text), `Topic ${q.topic}: no list-four wording left in the question`);
    const keys = c.map((x) => x.key);
    ok(new Set(keys).size > 1, `Topic ${q.topic}: the answer is not always in the same position`, keys);
    ok(c.every((x) => x.options.every((o, i) => o && x.options.indexOf(o) === i)), `Topic ${q.topic}: no repeated option within a question`);
});
const FIX = '# Topic 1: Fixture\n**Type:** language_paper\n**Format:** multi_question\n\n## Q1\n**Marks:** 4\n**AOs:** AO1\n\nRead again lines 1 to 3.\n\n### Choices\n'
    + '1. Good question?\n   - [ ] a\n   - [x] b\n   - [ ] c\n2. Two keys?\n   - [x] a\n   - [x] b\n   - [ ] c\n3. No key?\n   - [ ] a\n   - [ ] b\n   - [ ] c\n\n## Q2\n**Marks:** 8\n\nText.\n';
const fx = parseQ1(FIX)[0] || {};
ok(fx.choices && fx.choices.length === 1 && fx.choices[0].q === 'Good question?' && fx.choices[0].key === 1,
    'a question with two answers or none is DROPPED, never served (only the good one survives)', fx.choices);

// ── B · the real scoring code, executed ─────────────────────────────────────────────────────────────────────────
console.log('\nB · scoring (the real functions, executed)');
function fnSrc(name) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i < 0) return '';
    let d = 0, j = SRC.indexOf('{', i);
    for (; j < SRC.length; j++) { if (SRC[j] === '{') d++; else if (SRC[j] === '}' && --d === 0) break; }
    return SRC.slice(i, j + 1);
}
const code = ['_readChoiceAnswers', '_scoreChoiceAnswers', '_formatChoiceSummary'].map(fnSrc);
ok(code.every(Boolean), 'the three scoring functions exist');
// A tiny ProseMirror-shaped doc: paragraphs (stems) and checklistItem nodes, walked in order.
const P = (t) => ({ type: { name: 'paragraph' }, textContent: t, attrs: {} });
const O = (id, t, correct, checked) => ({ type: { name: 'checklistItem' }, textContent: t, attrs: { itemId: id, correct, checked } });
function doc(picks) {   // picks[i] = array of option indexes ticked for question i+1 (key is always option 2)
    const nodes = [P('Choose one answer for each question.')];
    for (let i = 1; i <= 4; i++) {
        nodes.push(P(`1.${i} Question ${i}?`));
        for (let j = 1; j <= 3; j++) nodes.push(O(`Q1-mc${i}-${j}`, `Option ${i}${j}`, j === 2, (picks[i - 1] || []).includes(j)));
    }
    return { state: { doc: { descendants: (f) => nodes.forEach((n) => f(n)) } } };
}
// eslint-disable-next-line no-new-func
const api = new Function('document', code.join('\n') + '\nreturn { _readChoiceAnswers, _scoreChoiceAnswers, _formatChoiceSummary };')({ getElementById: () => null });
const score = (picks) => { const e = api._readChoiceAnswers(doc(picks))[0]; return api._scoreChoiceAnswers(e); };
ok(score([[2], [2], [2], [2]]).score === 4, 'four right answers = 4/4');
ok(score([[2], [1], [2], [3]]).score === 2, 'two right, two wrong = 2/4');
ok(score([[2, 1], [2], [2], [2]]).score === 3, 'two answers ticked in one question = no mark for that question');
ok(score([[], [], [], []]).score === 0 && score([[], [], [], []]).answered === 0, 'nothing ticked = 0/4, 0 answered');
const sum = api._formatChoiceSummary(doc([[2], [1], [], [2, 3]]));
ok(/SCORED BY THE PLATFORM/.test(sum) && /Q1 PLATFORM SCORE: 1\/4/.test(sum) && /Write "Q1 Total: 1\/4" exactly/.test(sum),
    'Sophia is handed the score as a fixed mark, in the Q1 Total line she must write', sum.slice(-200));
ok(/1\.1 Question 1\?\n\s+chose "Option 12" — CORRECT/.test(sum) && /1\.2 Question 2\?\n\s+chose "Option 21" — WRONG; the right answer: "Option 22"/.test(sum)
    && /1\.3 Question 3\?\n\s+NOT ANSWERED; the right answer: "Option 32"/.test(sum) && /1\.4[^\n]*\n\s+MORE THAN ONE ANSWER/.test(sum),
    'each question carries its stem, the choice, the verdict and (when wrong) the right answer');

// ── C · wiring ──────────────────────────────────────────────────────────────────────────────────────────────────
console.log('\nC · wiring');
const bIdx = SRC.indexOf('if (Array.isArray(q.choices) && q.choices.length) {');
const mcIdx = SRC.indexOf("} else if (qType === 'multiple_choice') {");
ok(bIdx > 0 && mcIdx > bIdx && mcIdx - bIdx < 2500, 'the builder gates on the AUTHORED choices, before (and instead of) every type branch');
const B = SRC.slice(bIdx, mcIdx);
ok(/data-item-id="\$\{qId\}-mc\$\{n\}-\$\{j \+ 1\}" data-authored="true" data-correct="\$\{j === c\.key \? 'true' : 'false'\}"/.test(B),
    'each option is an authored checklist row carrying its question group and the key');
ok(/<p data-locked="true"><em><strong>\$\{_qn\}\.\$\{n\}<\/strong> \$\{escapeHTML\(c\.q\)\}<\/em><\/p>/.test(B),
    'each question stem is a LOCKED italic line (the answer reader strips <em>, so a stem is never read as an answer)');
ok(/sectionHTML\('response', `\$\{qId\} Answers`/.test(B), 'the options sit in a "Q1 Answers" response section');
ok(/else if \(qType === 'retrieval' && qMarks <= 5\)/.test(SRC.slice(mcIdx, mcIdx + 6000)), 'without choices, the list-four boxes are still built (past papers, older documents)');
ok(/const _grp = !currentChecked \? \(String\(node\.attrs\.itemId \|\| ''\)\.match\(\/\^\(\.\+-mc\\d\+\)-\\d\+\$\/\)/.test(SRC)
    && /indexOf\(_grp \+ '-'\) === 0\) tr\.setNodeMarkup\(p2, undefined, \{ \.\.\.n2\.attrs, checked: false \}\)/.test(SRC),
    'ticking an option unticks the others in its question, in the same transaction');
ok(/const _choices = _formatChoiceSummary\(editor\);\s*const items = _readChecklistTicks\(editor\);\s*if \(items\.length === 0\) return _choices;/.test(SRC),
    'the scored block rides the existing tick summary (a choices-only document is not dropped by its early return)');
ok((SRC.match(/const mcqSummary = _formatChecklistSummary\(canvasEditor\);/g) || []).length >= 2, 'both chat pipelines inject it');
ok(/_mcOpts = section\.querySelectorAll\('\[data-item-id\^="' \+ qId \+ '-mc"\]'\)/.test(SRC) && /RESPONSE — multiple choice: \$\{_mcDone\.size\} of \$\{_mcQs\.size\} questions answered/.test(SRC),
    'the payload names the ticks instead of calling Q1 "NOT ATTEMPTED"');
const D = SRC.slice(SRC.indexOf('now has multiple-choice questions this untouched document lacks') - 1400, SRC.indexOf('now has multiple-choice questions this untouched document lacks') + 400);
ok(/includes\(`\$\{q\.id\}-mc1-1`\)/.test(D) && /\[data-input-field\], \.swml-input-field, \[data-outline-row\]/.test(D) && /if \(!_typed\) \{[\s\S]*specDriftMismatch = true;/.test(D),
    'an old document is rebuilt with the choices ONLY when no box holds a typed word');
ok(/_mcDoc = !!document\.querySelector\('#swml-tiptap-editor \[data-item-id\^="' \+ g\.q \+ '-mc"\]'\)/.test(SRC), 'the self-mark ask is worded for choices on a choices document');
const PROTO = fs.readFileSync(path.join(ROOT, 'protocols/aqa/language1/modules/protocol-a-assessment.md'), 'utf8');
ok(/TWO Q1 SHAPES/.test(PROTO) && /That score\s+IS the mark/.test(PROTO) && /LIST FOUR — per-statement feedback/.test(PROTO),
    "the marking card handles both shapes and takes the platform's score as the mark");
const KN = fs.readFileSync(path.join(ROOT, 'protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md'), 'utf8');
ok(/THE 2026 FORMAT — MULTIPLE CHOICE/.test(KN) && !/Q1, Q2 and AO6 are unchanged/.test(KN), "the knowledge file teaches the 2026 Q1 and no longer claims it is unchanged");

console.log(`\n${fail ? '❌' : '✅'} q1-choices-harness: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
