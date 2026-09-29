#!/usr/bin/env node
/* eslint-env node */
/**
 * question-history-harness.js — v7.20.650 (FIXLIST #635/#636): PREVIOUS · BEST, PER QUESTION.
 *
 * WHY THIS EXISTS
 * Neil, 2026-09-28: "predicted versus actual versus previous… in the redraft to see how that
 * compares to the diagnostic. What was improved and what wasn't… what about versus best… topic
 * two diagnostic… compare that to whichever one is the best… for each question."
 *
 * WHAT IT CHECKS
 *   1. THE RULE — _qHistBefore / _qHistCompare are EXTRACTED from the shipped file (between the
 *      @QHIST-PURE sentinels) with the real _paraKey, never re-typed, and driven through: a
 *      redraft against its own diagnostic; Topic 2's diagnostic against Topic 1 (previous = the
 *      redraft, best = whichever scored higher); the current attempt never compares with itself;
 *      a box at a DIFFERENT maximum is not the same question; a re-sit (attempt 2) orders after
 *      attempt 1; a tie for best goes to the later attempt; and AQA's Q27.1 /24 and Q27.2 /8,
 *      which _paraKey folds into one key, stay apart by their maximum.
 *   2. THE SERVER HALF — decodes the stored JSON before reading labels (raw meta holds `\/`,
 *      which a text search misses — measured on prod: 0 hits raw), prefers the canonical key
 *      over its legacy copy, skips documents with no marked box, is viewer-access gated, and
 *      returns the box names verbatim so ONE key builder (_paraKey) keys both sides (§5d).
 *   3. THE SURFACES — one builder feeds the card row and the Feedback pad; the card's sig
 *      carries the history so it redraws when it lands; the redraw is overlays-only (no score
 *      recalculation side effects); "Best" is hidden when it is the same attempt as "Previous".
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const js = read('frontend/wml-assessment.js');
const rest = read('includes/class-rest-api.php');

let pass = 0, failN = 0;
function ok(cond, label, detail) {
    if (cond) { pass++; console.log('  ✓ ' + label); }
    else { failN++; console.log('  ✗ ' + label + (detail ? ' — ' + detail : '')); }
}
const sl = (name) => {
    const i = js.indexOf('    function ' + name + '(');
    if (i === -1) return '';
    let d = 0;
    for (let k = js.indexOf('{', i); k < js.length; k++) {
        if (js[k] === '{') d++;
        else if (js[k] === '}') { d--; if (!d) return js.slice(i, k + 1); }
    }
    return '';
};

console.log('\n1 · the rule (extracted from the shipped file)');
const a = js.indexOf('// ── @QHIST-PURE');
const b = js.indexOf('// ── @QHIST-PURE-END ──');
ok(a !== -1 && b > a, '@QHIST-PURE sentinels present');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(sl('_paraKey') + '\n' + js.slice(a, b), ctx);
const cmp = (attempts, cur, key, max) => ctx._qHistCompare(attempts, cur, key, max, ctx._paraKey);

const t1d = { topic: 1, phase: 'initial', attempt: 1, boxes: { 'Feedback: Q1': { mark: 4, max: 4 }, 'Feedback: Q2': { mark: 3, max: 8 }, 'Feedback: Q3': { mark: 1, max: 8 }, 'Feedback: Q4': { mark: 4, max: 20 }, 'Feedback: Q5': { mark: 30, max: 40 } } };
const t1r = { topic: 1, phase: 'redraft', attempt: 1, boxes: { 'Feedback: Q1': { mark: 4, max: 4 }, 'Feedback: Q2': { mark: 4, max: 8 }, 'Feedback: Q3': { mark: 4, max: 8 }, 'Feedback: Q4': { mark: 14, max: 20 }, 'Feedback: Q5': { mark: 28, max: 40 } } };
const hist = [t1d, t1r];

let h = cmp(hist, { topic: 1, phase: 'redraft', attempt: 1 }, '2', 8);
ok(h.prev && h.prev.mark === 3 && h.prev.phase === 'initial', 'the redraft’s Q2 compares with its own diagnostic (3/8)');
ok(h.best && h.best.phase === 'initial' && h.best.topic === 1, '…and best is that same attempt (the renderer then shows it once)');
h = cmp(hist, { topic: 1, phase: 'initial', attempt: 1 }, '2', 8);
ok(!h.prev && !h.best, 'the very first attempt has nothing earlier — never compared with itself');
h = cmp(hist, { topic: 2, phase: 'initial', attempt: 1 }, '2', 8);
ok(h.prev && h.prev.phase === 'redraft' && h.prev.mark === 4, 'Topic 2’s diagnostic: previous = Topic 1’s redraft (the latest earlier attempt)');
ok(h.best && h.best.mark === 4 && h.best.phase === 'redraft', '…best = the higher of Topic 1’s two (4 > 3)');
h = cmp(hist, { topic: 2, phase: 'initial', attempt: 1 }, '5', 40);
ok(h.prev && h.prev.mark === 28 && h.best && h.best.mark === 30 && h.best.phase === 'initial', 'Q5: previous = the redraft’s 28, best = the diagnostic’s 30 (best is not always the latest)');
h = cmp([{ topic: 1, phase: 'initial', attempt: 1, boxes: { 'Feedback: Q2': { mark: 5, max: 6 } } }], { topic: 1, phase: 'redraft', attempt: 1 }, '2', 8);
ok(!h.prev, 'a box at a DIFFERENT maximum is not the same question — ignored');
const resit = { topic: 1, phase: 'initial', attempt: 2, boxes: { 'Feedback: Q2': { mark: 5, max: 8 } } };
h = cmp([t1d, resit], { topic: 1, phase: 'redraft', attempt: 1 }, '2', 8);
ok(h.prev && h.prev.attempt === 2 && h.prev.mark === 5, 'a re-sit (attempt 2) orders after attempt 1 and before the redraft');
const tieA = { topic: 1, phase: 'initial', attempt: 1, boxes: { 'Feedback: Q3': { mark: 5, max: 8 } } };
const tieB = { topic: 1, phase: 'redraft', attempt: 1, boxes: { 'Feedback: Q3': { mark: 5, max: 8 } } };
h = cmp([tieA, tieB], { topic: 2, phase: 'initial', attempt: 1 }, '3', 8);
ok(h.best && h.best.phase === 'redraft', 'a tie for best goes to the later attempt');
const unseen = { topic: 1, phase: 'initial', attempt: 1, boxes: { 'Feedback: Q27.1': { mark: 15, max: 24 }, 'Feedback: Q27.2': { mark: 6, max: 8 } } };
ok(ctx._paraKey('Feedback: Q27.1') === ctx._paraKey('Feedback: Q27.2'), 'CONTROL: _paraKey folds Q27.1 and Q27.2 into one key');
h = cmp([unseen], { topic: 2, phase: 'initial', attempt: 1 }, ctx._paraKey('Feedback: Q27.2'), 8);
ok(h.prev && h.prev.mark === 6, '…so the maximum keeps them apart: the /8 box compares with Q27.2 (6), never Q27.1 (15)');
ok(ctx._qHistBefore({ topic: 1, phase: 'redraft', attempt: 1 }, { topic: 2, phase: 'initial', attempt: 1 }), 'order: Topic 1 redraft < Topic 2 diagnostic');
// v7.20.653 (#644): the EXACT key — every family's label shape, and the folds it must NOT make.
const K = ctx._fbHistKey;
ok(typeof K === 'function', '_fbHistKey lives inside @QHIST-PURE');
[['Feedback: Q2', '2'], ['Feedback: Question 2', '2'], ['Feedback: Body 2', '2'], ['Feedback: Introduction', 'Intro'], ['Feedback: Conclusion', 'Conclusion'],
 ['Part A Feedback: Introduction', 'a:Intro'], ['Part B Feedback: Body 3', 'b:3'], ['Feedback: Q1(a)', '1a'], ['Feedback: Q7b', '7b'], ['Feedback: Q27.1', '27.1'],
 ['Feedback: Q2 (4 / 8)', '2'], ['Overall Feedback', '']].forEach(([l, want]) => ok(K(l) === want, '_fbHistKey(' + JSON.stringify(l) + ') = ' + JSON.stringify(want) + ' (got ' + JSON.stringify(K(l)) + ')'));
const dual = { topic: 1, phase: 'initial', attempt: 1, boxes: { 'Part A Feedback: Introduction': { mark: 2, max: 3 }, 'Part B Feedback: Introduction': { mark: 3, max: 3 } } };
const cmpX = (attempts, cur, label, max) => ctx._qHistCompare(attempts, cur, K(label), max, K);
h = cmpX([dual], { topic: 1, phase: 'redraft', attempt: 1 }, 'Part B Feedback: Introduction', 3);
ok(h.prev && h.prev.mark === 3, 'Part B Introduction compares with Part B (3), never Part A (2) — same max, so only the key keeps them apart');
ok(ctx._paraKey('Part A Feedback: Introduction') === ctx._paraKey('Part B Feedback: Introduction'), 'CONTROL: _paraKey folds Part A / Part B (why history needs its own key)');
const lettered = { topic: 1, phase: 'initial', attempt: 1, boxes: { 'Feedback: Q1(a)': { mark: 1, max: 1 }, 'Feedback: Q1(b)': { mark: 0, max: 1 } } };
h = cmpX([lettered], { topic: 1, phase: 'redraft', attempt: 1 }, 'Feedback: Q1(b)', 1);
ok(h.prev && h.prev.mark === 0, 'Q1(b) compares with Q1(b) (0), never Q1(a) (1)');
h = cmpX([unseen], { topic: 2, phase: 'initial', attempt: 1 }, 'Feedback: Q27.2', 8);
ok(h.prev && h.prev.mark === 6, 'Q27.2 still compares with Q27.2 under the exact key');
h = cmpX(hist, { topic: 1, phase: 'redraft', attempt: 1 }, 'Feedback: Q2', 8);
ok(h.prev && h.prev.mark === 3, 'AQA Lang Q2 unchanged under the exact key (3/8)');
ok(!ctx._qHistBefore({ topic: 1, phase: 'redraft', attempt: 3 }, { topic: 1, phase: 'redraft', attempt: 3 }), 'order: an attempt is never before itself');

console.log('\n2 · the server half');
const fnA = rest.indexOf('public function get_question_history(');
const fnB = rest.indexOf('public function get_all_attempts(');
const fn = fnA !== -1 && fnB > fnA ? rest.slice(fnA, fnB) : '';
ok(!!fn, 'get_question_history exists');
ok(/'\/canvas\/question-history'[\s\S]{0,120}'callback' => \[\$this, 'get_question_history'\]/.test(rest), 'route /canvas/question-history is registered');
ok(/verify_viewer_access\(\$student_id\)/.test(fn), 'another student’s history is gated by verify_viewer_access (tutor / specialist / admin / connected parent)');
ok(/self::decode_canvas_json\(/.test(fn), 'labels are read from the DECODED document (raw meta holds `\\/`)');
ok(/\$rank\s*=\s*\(\$sfx === '_assessment' \|\| \$sfx === '_reassessment'\) \? 2 : 1;/.test(fn) && /\$by\[\$id\]\['rank'\] >= \$rank\) continue;/.test(fn), 'the canonical key outranks its legacy copy (bare _tN, _tN_redraft)');
ok(/if \(!preg_match_all\([\s\S]{0,160}\$mm, PREG_SET_ORDER\)\) continue;/.test(fn), 'a document with no marked box is not an attempt');
ok(!/meta_key REGEXP/.test(fn) && /SELECT meta_key FROM[\s\S]{0,200}LIKE %s/.test(fn) && /array_filter\([\s\S]{0,120}preg_match\(\$key_re/.test(fn) && /meta_key IN \(\$in\)/.test(fn), 'keys first, filtered by the PHP key pattern, THEN only those values are loaded (v7.20.653 — no SQL REGEXP dialect; never every planning/outlining doc)');
ok(/\$boxes\[trim\(\$x\[1\]\)\]/.test(fn) && !/_paraKey|para_key/.test(fn), 'box names returned VERBATIM — the client keys both sides with one _paraKey');
// the label regex, run in node against a decoded-shape label
const reM = fn.match(/preg_match_all\('(\/data-section-label[^']+\/)'/);
if (reM) {
    const re = new RegExp(reM[1].slice(1, -1).replace(/\\\//g, '/'), 'g');
    const html = '<div data-section-type="feedback" data-section-label="Feedback: Q2 (4 / 8)"></div><div data-section-label="Feedback: Q3 (— / 8)"></div><div data-section-label="Feedback: Introduction (2.5 / 3)"></div><div data-section-label="Part A Feedback: Introduction (3 / 5)"></div><div data-section-label="Feedback: Q1(a) (1 / 1)"></div><div data-section-label="Overall Feedback"></div>';
    const found = []; let m;
    while ((m = re.exec(html))) found.push(m[1].trim() + '=' + m[2] + '/' + m[3]);
    ok(found.join(',') === 'Feedback: Q2=4/8,Feedback: Introduction=2.5/3,Part A Feedback: Introduction=3/5,Feedback: Q1(a)=1/1', 'label regex: marked boxes only, half marks kept, "—" skipped, Part prefix + sub-part kept (v7.20.653) — got ' + found.join(','));
} else ok(false, 'label regex found in get_question_history');

console.log('\n3 · the surfaces');
ok((js.match(/_qHistReadoutHTML\(/g) || []).length >= 3, 'ONE builder feeds the card row AND the Feedback pad');
ok(/_qHistCompare\(_qHist\.attempts, _qHistCurrent\(\), qKey, maxMarks, _fbHistKey\)/.test(js) && /const qKey = _fbHistKey\(label\);/.test(js), 'the readout keys BOTH sides with the exact _fbHistKey (v7.20.653), never the folding _paraKey');
ok(/_qHistReadoutHTML\(baseName, /.test(js) && /_qHistReadoutHTML\(mLbl\[1\], /.test(js), 'card and pad pass the LABEL, not a pre-folded key');
ok(/label\.match\(\/\^\(\.\*\?Feedback:/.test(js), 'the card row accepts a Part-prefixed label (dual / either-or literature)');
ok(/const sig = 'fb\|'[^\n]*_qHistSig\(\)/.test(js), 'the card sig carries the history, so it redraws when the history lands');
ok(/_overlaysOnlyRefresh = function \(\) \{ try \{ buildDropdownOverlays\(\); \} catch \(_\) \{\} \};/.test(js) && /if \(typeof _overlaysOnlyRefresh === 'function'\) _overlaysOnlyRefresh\(\);/.test(js), 'history arrival redraws overlays ONLY — never recalculateScoreSummary (auto-commit side effects)');
ok(/const same = h\.best && h\.best\.topic === h\.prev\.topic && h\.best\.phase === h\.prev\.phase && h\.best\.attempt === h\.prev\.attempt;/.test(js), '"Best" is hidden when it is the same attempt as "Previous"');
ok(/if \(_qHist\.id !== id\) return;/.test(js), 'a response for a lesson the student has left is dropped (SPA navigation)');

console.log('\n' + (failN ? '✗ ' + failN + ' failed, ' + pass + ' passed' : '✓ question-history-harness: all ' + pass + ' checks passed'));
process.exit(failN ? 1 : 0);
