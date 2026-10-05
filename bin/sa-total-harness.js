#!/usr/bin/env node
/* eslint-env node */
// sa-total-harness (v7.20.713, FIXLIST #726) — the student's OWN total is out of the board's total.
//
// Measured defect (prod, AQA Language Paper 1, student 1237, 2026-10-05): the Mark-Scheme Self-Assessment
// read "YOUR MARK 41/76" on an /80 paper. The keys came only from the generated dataset, which holds the
// questions the board marks by LEVEL; Q1 (point-marked, AO1 /4) was never self-marked, so every AQA
// Language paper summed to 76. Neil: "the total marks has to be the correct one according to what's set
// on the exam board". This harness slices the REAL key builder from wml-assessment.js, loads the REAL
// dataset, and asserts — for every paper the ladder serves — that the self-marked questions are exactly
// the board's questions and their maxima sum to the board's total, read from the repo's own tariff files
// (protocols/shared/language-paper-specs.json, literature-paper-specs.json — verified against the mark
// schemes). A tariff change, a dataset rebuild that drops a question, or a key filter that loses one, fails here.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

const slice = (re, name) => { const m = src.match(re); if (!m) { console.error('❌ sa-total-harness: cannot slice ' + name); process.exit(1); } return m[0]; };
const parts = [
    slice(/    const LADDER_POINT_SCHEMES = \{[\s\S]*?\n    \};\n/, 'LADDER_POINT_SCHEMES'),
    slice(/    function _ladderPointScheme\(key\) \{[\s\S]*?\n    \}\n/, '_ladderPointScheme'),
    slice(/    function _ladderSchemeKeysFor\(topicData\) \{[\s\S]*?\n        \} catch \(e\) \{ return \[\]; \}\n    \}\n/, '_ladderSchemeKeysFor'),
    slice(/    function _ladderFids\(key\) \{[\s\S]*?\n    \}\n/, '_ladderFids'),
    slice(/    function _ladderOneSentence\(key\) \{[\s\S]*?\n    \}\n/, '_ladderOneSentence'),
    slice(/    function _ladderGroupHTML\(k\) \{[\s\S]*?\n    \}\n/, '_ladderGroupHTML'),
];
const win = {};
const sb = {
    window: win, console, JSON, String, Array, Object, Set, parseInt, parseFloat, isNaN,
    state: { board: 'aqa', text: '', subject: '' },
    document: { querySelectorAll: () => [] },
    _isLitEssay: () => false,
    escapeHTML: (s) => String(s),
    inputHTML: (prompt, fid) => '<div data-input-field="true" data-field-id="' + fid + '" data-prompt="' + prompt + '"></div>',
    LADDER_SA_PROMPTS: { level: 'L', met: 'M', mark: 'K', reason: 'R' },
};
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'frontend', 'wml-markscheme-data.js'), 'utf8'), sb);
vm.runInContext(parts.join('\n') + '\nthis.__k = _ladderSchemeKeysFor; this.__f = _ladderFids; this.__g = _ladderGroupHTML;', sb);
if (!win.WML_MARK_SCHEMES) { console.error('❌ sa-total-harness: wml-markscheme-data.js did not define window.WML_MARK_SCHEMES'); process.exit(1); }

const lang = require(path.join(ROOT, 'protocols', 'shared', 'language-paper-specs.json')).aqa;
const lit = require(path.join(ROOT, 'protocols', 'shared', 'literature-paper-specs.json')).aqa;

let passed = 0, failed = 0;
const ok = (c, label, d) => { if (c) passed++; else { failed++; console.log('  ❌ ' + label + (d ? ' — ' + d : '')); } };
const keysFor = (text, subject, questions, lit) => {
    sb.state.text = text; sb.state.subject = subject || ''; sb._isLitEssay = () => !!lit;
    const td = questions ? { metadata: JSON.stringify({ questions: questions.map(id => ({ id })) }) } : null;
    return sb.__k(td);
};
const sum = (ks) => ks.reduce((s, k) => s + (k.max || 0), 0);

// ── 1. Full Language practice papers: the self-marked questions ARE the board's questions, total = board total.
[['language_p1', 'aqa_lang_paper_1'], ['language_p2', 'aqa_lang_paper_2']].forEach(([specKey, text]) => {
    const spec = lang[specKey];
    const qs = [].concat(...spec.sections.map(s => s.questions));
    const ks = keysFor(text, 'language', qs.map(q => q.id));
    ok(sum(ks) === spec.total, specKey + ': the student\'s own marks add up to the board\'s total (' + spec.total + ')', 'sums to ' + sum(ks) + ' — ' + ks.map(k => k.q + ' ' + k.ao + ' /' + k.max).join(', '));
    qs.forEach(q => {
        const mine = ks.filter(k => k.q === q.id);
        ok(mine.length > 0, specKey + ' ' + q.id + ': the student marks it themselves', 'no self-assessment key for ' + q.id);
        ok(sum(mine) === q.marks, specKey + ' ' + q.id + ': self-marked out of the board\'s ' + q.marks, mine.map(k => k.ao + ' /' + k.max).join(' + ') || 'none');
    });
    ok(ks.length && ks[0].q === 'Q1' && ks[0].points, specKey + ': Q1 comes first and is point-marked (one tap, no levels)');
    const f = sb.__f(ks[0].key);
    ok(Object.keys(f).join() === 'mark', specKey + ': a point question has ONE box — the mark', JSON.stringify(f));
    const html = sb.__g(ks[0]);
    ok(/<h3>Q1 — AO1 \(\/4\)<\/h3>/.test(html) && (html.match(/data-input-field/g) || []).length === 1, specKey + ': its rows are a heading and one mark box', html);
});

// ── 2. A writing-only topic (Q5 alone) self-marks Q5 alone — never Q1, which it never set.
const p2 = keysFor('aqa_lang_paper_2', 'language', ['Q5']);
ok(p2.length && p2.every(k => k.q === 'Q5') && sum(p2) === 40, 'AQA P2 writing-only topic: Q5 only, /40', p2.map(k => k.q + ' /' + k.max).join(', '));
const p1q2 = keysFor('aqa_lang_paper_1', 'language', ['Q2']);
ok(!p1q2.some(k => k.points), 'a topic that does not set Q1 gets no Q1 box');

// ── 3. Literature essays: the whole mark = the paper's total (no point questions there).
[['shakespeare', 'shakespeare'], ['modern_text', 'modern_text'], ['19th_century', '19th_century']].forEach(([subj, specKey]) => {
    const spec = lit[specKey];
    if (!spec || typeof spec.marks !== 'number') { ok(false, 'literature spec ' + specKey + ' has a numeric total'); return; }
    const ks = keysFor('', subj, null, true);
    ok(sum(ks) === spec.marks, 'AQA Literature ' + specKey + ': own total = the board\'s ' + spec.marks, 'sums to ' + sum(ks));
    ok(!ks.some(k => k.points), 'AQA Literature ' + specKey + ': no point-marked keys');
});

// ── 4. Off-AQA boards have no ladder (they keep the reflection panel) — unchanged.
sb.state.board = 'edexcel';
ok(keysFor('aqa_lang_paper_1', 'language', ['Q1', 'Q2']).length === 0, 'a non-AQA board gets no self-assessment keys (unchanged)');
sb.state.board = 'aqa';

console.log(`— SELF-MARKED TOTAL: ${passed}/${passed + failed} assertions passed.`);
if (failed) { console.log('\n❌ sa-total-harness FAILED'); process.exit(1); }
console.log('✅ sa-total-harness passed (every AQA paper\'s self-marked total is the board\'s total).');
