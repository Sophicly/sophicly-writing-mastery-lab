#!/usr/bin/env node
/* eslint-env node */
/**
 * aqa-2026-wording-harness.js — v7.20.826 (WML 345 A, FIXLIST #887).
 * AQA's 2026 Language wording is live for the November 2026 resits (P1 3 Nov, P2 5 Nov). Sources, as text:
 * research/sources/aqa-8700-faq-2026-changes.txt · aqa-8700-1-sqp-2026.txt · aqa-8700-2-2026-specimen-qp.txt ·
 * aqa-8700-2-nov24-examiner-report.txt. This gate EXECUTES the real code, it does not grep for it:
 *   A · the practice papers through the real PHP parser — P1 Q3 names ONE effect in AQA's 2026 shape, P1 Q4 has no
 *       imaginary student and asks "agree and/or disagree", P2 Q1 uses AQA's own instruction, P2 Q4 says "comment on";
 *   B · P2 Q1 is scored by the PLATFORM, AQA's way (a mark off for every tick beyond four), and Sophia is handed it;
 *   C · the audit's real Pass 2 (its own source text, run in a sandbox) forces Q1 Total to that score and caps an
 *       unaddressed P1 Q3 named effect at 4/8 — in the marking turn AND in a later summary that restates Q3 Total;
 *   D · the protocols say the same (the old "first four ticks" and "compare … AND the methods" rules are gone).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const SRC = read('frontend/wml-assessment.js');
let pass = 0, fail = 0;
const ok = (c, msg, extra) => { if (c) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg + (extra !== undefined ? ' — ' + JSON.stringify(extra).slice(0, 300) : '')); } };

// ── A · the practice papers, through the real parser ───────────────────────────────────────────────────────────
console.log('\nA · the practice papers (real PHP parser)');
const STUBS = 'define("ABSPATH","/");function current_time($t){return "2026-01-01 00:00:00";}function sanitize_text_field($s){return trim(strip_tags($s));}function wp_json_encode($d,$f=0){return json_encode($d,$f);}';
function parseQs(markdown) {
    const php = STUBS + 'require ' + JSON.stringify(path.join(ROOT, 'includes/class-topic-parser.php')) + ';'
        + '$t=SWML_Topic_Parser::parse(stream_get_contents(STDIN));$o=[];foreach($t as $tp){$m=is_string($tp["metadata"]??null)?json_decode($tp["metadata"],true):($tp["metadata"]??[]);'
        + 'foreach(($m["questions"]??[]) as $q) $o[]=["topic"=>$tp["topic_number"],"id"=>$q["id"],"text"=>$q["text"]];}echo json_encode($o);';
    return JSON.parse(execFileSync('php', ['-d', 'error_log=/dev/null', '-r', php], { input: markdown, encoding: 'utf8' }));
}
const P1 = parseQs(read('protocols/shared/templates/topics/aqa-language-p1.md'));
const p1q = (id) => P1.filter((q) => q.id === id);
ok(p1q('Q3').length === 5 && p1q('Q4').length === 5, 'Paper 1: five practice papers, each with a Q3 and a Q4', [p1q('Q3').length, p1q('Q4').length]);
const effects = [];
p1q('Q3').forEach((q) => {
    const m = q.text.match(/How has the writer structured the text to ((?:create|build) [^?]+)\?/);
    effects.push(m && m[1]);
    ok(m && !/interest you as a reader/i.test(q.text), `P1 Topic ${q.topic} Q3 names ONE effect (${m && m[1]}) — never "to interest you as a reader"`, q.text.slice(0, 200));
    ok(/structure of the source as a whole/.test(q.text) && /has increased or decreased by the end of the source/.test(q.text)
        && /how the writer uses structure to create an effect/.test(q.text) && /changes in mood, tone or perspective/.test(q.text),
        `P1 Topic ${q.topic} Q3 uses AQA's 2026 sample-paper wording and bullets`);
});
ok(new Set(effects).size === effects.length, 'every practice paper practises a DIFFERENT named effect', effects);
p1q('Q4').forEach((q) => {
    ok(!/A student/i.test(q.text) && /To what extent do you agree and\/or disagree with this statement\?/.test(q.text)
        && /comment on the methods the writer uses/.test(q.text) && !/\bevaluate how\b/i.test(q.text)
        && /For this question focus on the second part of the source, from line \d+ to the end\./.test(q.text),
        `P1 Topic ${q.topic} Q4 in the 2026 form (no imaginary student · agree and/or disagree · comment on the methods)`, q.text.slice(0, 260));
});
const P2 = parseQs(read('protocols/shared/templates/topics/aqa-language-p2.md'));
const p2q = (id) => P2.filter((q) => q.id === id);
ok(p2q('Q1').length === 5 && p2q('Q4').length === 5, 'Paper 2: five practice papers, each with a Q1 and a Q4');
p2q('Q1').forEach((q) => ok(/Choose four statements below which are true\. Choose a maximum of four statements\./.test(q.text) && !/Identify four/i.test(q.text),
    `P2 Topic ${q.topic} Q1 carries AQA's own instruction ("Choose a maximum of four statements")`, q.text));
p2q('Q4').forEach((q) => ok(/comment on the methods the writers use/.test(q.text) && !/compare the methods/i.test(q.text),
    `P2 Topic ${q.topic} Q4 says "comment on the methods" (2026), never "compare the methods"`));
p2q('Q2').forEach((q) => ok(/What can you infer about the (?:differences|similarities)/.test(q.text), `P2 Topic ${q.topic} Q2 is the 2026 inference question`));

// ── B · Paper 2 Q1 scored by the platform ──────────────────────────────────────────────────────────────────────
console.log('\nB · Paper 2 Q1 — the platform scores the ticks (real functions, executed)');
function fnSrc(name) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i < 0) return '';
    let d = 0, j = SRC.indexOf('{', i);
    for (; j < SRC.length; j++) { if (SRC[j] === '{') d++; else if (SRC[j] === '}' && --d === 0) break; }
    return SRC.slice(i, j + 1);
}
const NAMES = ['_readChecklistTicks', '_scoreChecklistTicks', '_readChoiceAnswers', '_scoreChoiceAnswers', '_platformChoiceScore', '_formatChoiceSummary', '_formatChecklistSummary', '_q3FocusCap'];
const code = NAMES.map(fnSrc);
ok(code.every(Boolean), 'the scorer, the readers, the summary and the Q3 cap all exist', NAMES.filter((n, i) => !code[i]));
const DOC_STUB = { getElementById: () => null, querySelectorAll: () => [] };
// eslint-disable-next-line no-new-func
const api = new Function('document', 'let canvasEditor = null; const _setEd = (e) => { canvasEditor = e; };\n' + code.join('\n')
    + '\nreturn { ' + NAMES.join(', ') + ', _setEd };')(DOC_STUB);
// A ProseMirror-shaped P2 Q1: eight statements, 1·3·5·6 TRUE (the template's real key shape); `ticks` = numbers ticked.
const KEY = { 1: true, 2: false, 3: true, 4: false, 5: true, 6: true, 7: false, 8: false };
const stmtDoc = (ticks, key) => {
    const nodes = Object.keys(KEY).map(Number).map((n) => ({ type: { name: 'checklistItem' }, textContent: 'Statement ' + n,
        attrs: { itemId: 'Q1-stmt-' + n, checked: ticks.includes(n), correct: (key || KEY)[n] } }));
    return { state: { doc: { descendants: (f) => nodes.forEach((n) => f(n)) } } };
};
const sc = (ticks, key) => api._scoreChecklistTicks(api._readChecklistTicks(stmtDoc(ticks, key))[0]);
ok(sc([1, 3, 5, 6]).score === 4, 'the four true statements = 4/4');
ok(sc([1, 3, 5, 2]).score === 3, 'three true + one false (four ticks) = 3/4');
ok(sc([1, 3]).score === 2, 'two true, nothing else = 2/4 (an empty tick is missed, never deducted)');
ok(sc([1, 3, 5, 6, 2]).score === 3 && sc([1, 3, 5, 6, 2]).extra === 1, 'all four true + ONE extra tick = 3/4 — AQA takes a mark off per tick beyond four');
ok(sc([1, 2, 3, 4, 5, 6, 7, 8]).score === 0, 'ticking all eight = 0/4 (four right, four extra)');
ok(sc([1, 3, 2, 4, 7, 8]).score === 0, 'two true among six ticks = 0, never below zero');
ok(sc([1, 3, 5, 2, 4, 7]).score === 1, 'three true among six ticks = 3 − 2 = 1/4');
ok(sc([1, 3, 5, 6], { ...KEY, 8: undefined }) === null, 'an incomplete answer key = null (the protocol blocks; nothing is guessed)');
const summary = api._formatChecklistSummary(stmtDoc([1, 3, 5, 6, 2]));
ok(/\[Q1 PLATFORM SCORE: 3\/4 — 4 true statements ticked; 5 ticks in all, 1 beyond the 4 allowed, and each extra tick loses one mark/.test(summary)
    && /Write "Q1 Total: 3\/4" exactly; never re-mark or change it\.\]/.test(summary),
    'Sophia is handed the score — and the reason — as a fixed mark', summary.slice(-320));
ok(/\[ANSWER KEY — INTERNAL ONLY/.test(summary) && summary.indexOf('PLATFORM SCORE') > summary.indexOf('[ANSWER KEY'), 'the score sits under the answer key, in the block the protocol reads');
api._setEd(stmtDoc([1, 3, 5, 6, 2]));
ok((api._platformChoiceScore('Q1') || {}).score === 3 && api._platformChoiceScore('Q2') === null,
    "the audit's reader returns Paper 2's platform score for Q1, and null for every other question");

// ── C · the audit's real Pass 2, executed ──────────────────────────────────────────────────────────────────────
console.log('\nC · the mark audit (its real Pass 2 source, run in a sandbox)');
const P2S = SRC.indexOf('// ---- Pass 2: verify each Qn Total');
const P2E = SRC.indexOf('// ---- v7.19.868: set THE single audited grade', P2S);
const pass2 = SRC.slice(P2S, P2E);
ok(P2S > 0 && P2E > P2S && /out = out\.replace\(\/\(Q\(\\d\+\)\\s\*Total:/.test(pass2), 'Pass 2 located (its Qn Total rewrite)', pass2.slice(0, 120));
ok(/const _q3Cap = _q3FocusCap\(qn, den, out, \(!arr \|\| arr\.length < 2\) \? _q3FeedbackBoxText\(\) : ''\);/.test(pass2),
    'Pass 2 asks for the Q3 cap with the FILED verdict only when it is restating, not marking');
function runPass2(out, opts) {
    const o = opts || {};
    const sandbox = {
        out: out,
        _fbAudit: { totals: o.totals || {}, failed: {}, paraIdx: {} },
        _platformChoiceScore: o.platform || (() => null),
        _sectionBWcCeiling: () => null,
        _q3FocusCap: api._q3FocusCap,
        _q3FeedbackBoxText: () => o.record || '',
        console: { warn: () => {}, log: () => {} },
    };
    // eslint-disable-next-line no-new-func
    return new Function('S', 'let out = S.out; const _fbAudit = S._fbAudit; const _platformChoiceScore = S._platformChoiceScore;'
        + 'const _sectionBWcCeiling = S._sectionBWcCeiling; const _q3FocusCap = S._q3FocusCap; const _q3FeedbackBoxText = S._q3FeedbackBoxText;'
        + 'const console = S.console;\n' + pass2 + '\nreturn out;')(sandbox);
}
ok(/Q3 Total: 4\/8/.test(runPass2('Total Mark for Paragraph 2: 3.5/4\nQ3 focus: not addressed\nQ3 Total: 7/8', { totals: { Q3: [3.5, 3.5] } })),
    'marking turn: paragraphs worth 7 + "Q3 focus: not addressed" → the filed Q3 Total is 4/8');
ok(/Q3 Total: 4\/8/.test(runPass2('**Q3 focus:** not addressed\nQ3 Total: 4/8', { totals: { Q3: [3.5, 3.5] } })),
    'when Sophia already wrote the capped 4/8, the audit leaves it (no flip back to the sum of 7)');
ok(/Q3 Total: 7\/8/.test(runPass2('Q3 focus: addressed\nQ3 Total: 7/8', { totals: { Q3: [3.5, 3.5] } })),
    'focus addressed → no cap (7/8 stands)');
ok(/Q3 Total: 7\/8/.test(runPass2('Q3 Total: 7/8', { totals: { Q3: [3.5, 3.5] } })),
    'an older document (no Q3 focus line) → no cap');
ok(/Q3 Total: 4\/8/.test(runPass2('Q1 Total: 3/4\nQ3 Total: 7/8\nQ5 Total: 30/40', { record: '\nFeedback\nQ3 focus: not addressed\nYour answer never says how…' })),
    'a later SUMMARY that restates Q3 Total 7/8 reads the verdict filed in the document → 4/8');
ok(/Q3 Total: 7\/8/.test(runPass2('Q3 Total: 7/8', { record: '\nQ3 focus: not addressed', totals: { Q3: [3.5, 3.5] } })),
    'the filed verdict is NOT consulted in a marking turn (a fresh marking with no line is never capped by an old one)');
ok(/Q3 Total: 6\/12/.test(runPass2('Q3 focus: not addressed\nQ3 Total: 6/12', { totals: { Q3: [3, 3] } })),
    'never on a 12-mark Q3 (Paper 2 language): the cap is for the 8-mark Paper 1 structure question only');
ok(/Q1 Total: 3\/4/.test(runPass2('Q1 Total: 4/4', { platform: (q) => (q === 'Q1' ? { score: 3, max: 4 } : null) })),
    "Paper 2: Sophia's 4/4 becomes the platform's 3/4 (the extra tick)");

{
    // #858: the marking payload no longer calls a ticked Paper 2 Q1 "NOT ATTEMPTED" — it counts the ticks and points at
    // the block that holds them and the platform's score. Checked in the builder, before its empty-answer exit.
    const iSt = SRC.indexOf('const _stOpts = section.querySelectorAll(\'[data-item-id^="\' + qId + \'-stmt-"]\');');
    const iEmpty = SRC.indexOf('parts.push(`=== ${qId} RESPONSE — NOT ATTEMPTED (empty)${_planNote} ===`);');
    ok(iSt > 0 && iEmpty > iSt && /true statements: \$\{_stTicked\} of \$\{_stOpts\.length\} ticked\. Which ones, and the platform's score, are in the \[STUDENT CHECKLIST TICKS — \$\{qId\}\] block/.test(SRC.slice(iSt, iSt + 700)),
        'the marking payload counts Paper 2\'s ticks before it can ever say "NOT ATTEMPTED" (#858)');
}

// ── D · the protocols agree ────────────────────────────────────────────────────────────────────────────────────
console.log('\nD · the protocols');
const MSQ = read('protocols/aqa/language2/modules/protocol-q1-msq.md');
ok(!/first 4 ticks|ONLY the first 4|No negative marking|excess ticks invalidate/i.test(MSQ), 'P2 Q1 module: the old "first four ticks" / "no negative marking" rules are gone');
ok(/1 mark OFF for every tick beyond four/.test(MSQ) && /PLATFORM SCORE/.test(MSQ), "P2 Q1 module: AQA's deduction + the platform's score");
const A2 = read('protocols/aqa/language2/modules/protocol-a-assessment.md');
ok(/The platform scores the ticks/.test(A2) && /X is the platform's score, exactly/.test(A2), 'P2 Protocol A Q1: the platform score IS the mark');
ok(!/feelings and perspectives AND the methods used to convey them/.test(A2) && /not necessarily by\s+a direct comparison between the methods/.test(A2),
    'P2 Q4 principle follows AQA 2026: perspectives compared, methods commented on');
ok(/Differences OR similarities/.test(A2), 'P2 Q2 follows the question\'s own word (differences OR similarities)');
const A1 = read('protocols/aqa/language1/modules/protocol-a-assessment.md');
ok(/THE NAMED EFFECT/.test(A1) && /`Q3 focus: addressed` · `Q3 focus: not addressed`/.test(A1) && /caps Q3 at 4\/8, the top of Level 2/.test(A1),
    'P1 Q3 marking: the named-effect rule, the exact line the code reads, and the cap');
const norm = (t) => String(t).replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
const FAQ = norm(read('research/sources/aqa-8700-faq-2026-changes.txt'));
const KMS = read('protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md');
const faqLine = (KMS.match(/^> AQA \(2026\): .+$/m) || [''])[0];
const faqQuotes = (faqLine.match(/"[^"]+"/g) || []).map((q) => q.slice(1, -1));
ok(faqQuotes.length === 2 && faqQuotes.every((q) => FAQ.includes(norm(q))),
    'the knowledge file quotes AQA\'s FAQ word for word (checked against the saved FAQ text)', faqQuotes.filter((q) => !FAQ.includes(norm(q))));
ok(!/Level 3-4 instead of reaching Level 5-6/.test(read('protocols/aqa/language1/modules/knowledge-ttecea-lang.md')), 'no "Level 5-6" on an AQA Language paper (it has four levels)');
const Q1QUIZ = read('protocols/shared/mark-scheme-quiz/language1.md');
ok(!/interest you as a reader/.test(Q1QUIZ) && !/convincing and \\\[BLANK\\\] response to the focus of the statement/.test(Q1QUIZ),
    'the Paper 1 quiz no longer teaches the pre-2026 Q3 or Q4 wording');

console.log('\n' + (fail ? '❌' : '✅') + ' aqa-2026-wording-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
