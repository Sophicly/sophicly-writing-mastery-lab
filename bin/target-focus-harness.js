#!/usr/bin/env node
/* eslint-env node */
/**
 * target-focus-harness.js — v7.20.893 (dashboard #698; Neil 14 Oct: "if it's something assessed by Sophia … should that be
 * reflected in the feedback somehow? Maybe Sophia should even take that into account?").
 *
 * The agreed answer: Sophia never sees the focus. CODE writes one line in the "Where you are" box after the marking is filed:
 * how the thing the student's target names did in THIS piece, and where to start. The attendance tracker owns which target
 * the work belongs to (Sophicly_Att_Targets::focus_for) and which breakdown rows tell how it went (describe()['wml']).
 *
 * What it proves, from the SHIPPED code (sentinel slices; the server method runs in PHP against stub classes):
 *   A. LINE     — pathFocusLine, executed: a skill focus on Shayaan 1397's real P&C rows, an element focus, a language
 *                 AO focus (two questions), a two-AO split, a single question, full marks, and no row → no line.
 *   B. NEVER A FACT — the line is a box bullet before the HOW line, never in `facts`, and never in the closing-turn text
 *                 Sophia is given (_pathFactText).
 *   C. WIRING   — one question reader (_docQuestionMarks) for the breakdown and the line; both load URLs send the course;
 *                 the load sets state.targetFocus; all five load responses carry targetFocus; the box styles the line.
 *   D. SERVER   — target_focus_for_doc, executed: marked documents only; no course / no tracker / no focus_for / no row →
 *                 null; skill keys pass; 'ao:AO2' → the questions that assess only AO2; 'ao:AO5' → the Q5 split.
 *   E. FALSIFY  — five mutations each fail A–D.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const JS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const REST0 = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');

function load(src) {
    const slice = (b, e) => {
        const B = src.indexOf('    // @' + b), E = src.indexOf('    // @' + e);
        if (!(B > 0 && E > B)) throw new Error('sentinels missing: ' + b);
        return src.slice(B, E);
    };
    const ctx = { console };
    vm.createContext(ctx);
    vm.runInContext(slice('CARD-SCORE-PURE-BEGIN', 'CARD-SCORE-PURE-END'), ctx);
    vm.runInContext(slice('GAP-CHECK-PURE-BEGIN', 'GAP-CHECK-PURE-END'), ctx);
    vm.runInContext(slice('PATH-BOX-PURE-BEGIN', 'PATH-BOX-PURE-END'), ctx);
    vm.runInContext(slice('BREAKDOWN-PARTS-PURE-BEGIN', 'BREAKDOWN-PARTS-PURE-END')
        + '\nthis.P = { pathFocusLine, pathBoxModel, _pathFactText, _pathBlockOf, _pathCardUnits, _gapSectionFor };', ctx);
    return ctx.P;
}

// ── fixtures: NUMBERS ONLY (criterion names are the protocol's own wording) ──
const line = (c, w, s) => c + ' — ' + w + ' · ' + s + '/' + w + ' · –';
const card = (rows) => ['Criterion — Worth · Your Score · Why'].concat(rows.map((r) => line(r[0], r[1], r[2])));
const shBody = (ts, tt, ev, iq, ca, ef, ip, ap, cx, kind) => [
    ['Comparative topic sentence (' + kind + ')', '0.5', ts], ['Technical terminology (' + kind + ', both poems)', '0.5', tt],
    ['Strategic evidence (both poems)', '0.5', ev], ['Integrated quotes', '0.5', iq], ['Close analysis (both poems, ' + kind + ')', '1.5', ca],
    ['Comparative effects (differentiated)', '1.0', ef], ['Technique interplay', '0.5', ip], ["Comparative author's purpose", '1.0', ap],
    ['Comparative context', '1.0', cx]];
const SH = {   // Shayaan 1397, AQA Power & Conflict, prod 13 Oct (the same rows as path-box / breakdown-parts harnesses)
    Introduction: [['Comparative hook (AO1/AO3)', '0.5', '0'], ['Building sentence: comparative context (AO3)', '0.5', '0'],
        ['Building sentence: context shapes themes differently (AO3)', '0.5', '0'], ['Comparative thesis (AO1)', '1.5', '0.75']],
    'Body 1': shBody('0', '0', '0', '0.5', '0.75', '0.25', '0', '0.25', '0', 'FORM'),
    'Body 2': shBody('0', '0.25', '0', '0.5', '0.5', '0.25', '0.25', '0.25', '0.25', 'STRUCTURE'),
    'Body 3': shBody('0.25', '0.25', '0', '0.5', '0.75', '0.25', '0.25', '0.25', '0.25', 'LANGUAGE'),
    Conclusion: [['Restated comparative thesis (AO1)', '1.0', '0'], ['Synthesized central comparative concept (AO1)', '1.0', '0'],
        ["Synthesized both poets' methods/purposes (AO1/AO2)", '1.5', '0'], ['Universal comparative message (AO1)', '1.5', '0'],
        ['Final evaluative judgement (AO1)', '1.0', '0']],
};
const LANG_Q4 = ['Q4 — Introduction', 'Criterion — Worth · Your Score · Why', line('Short thesis answering the statement', '1.0', '0.5'),
    'Q4 — Body Paragraph 1', line('Topic sentence addresses evaluative keywords + links to thesis', '1.0', '0.5'),
    'Q4 — Conclusion', line('Restated thesis', '0.5', '0'), 'Q4 — Question Total', 'Q4 Total: 1/20'];

function check(JS, REST) {
    const fails = [];
    const ok = (c, m) => { if (!c) fails.push(m); };
    let P;
    try { P = load(JS); } catch (e) { return ['load: ' + e.message]; }
    const units = Object.keys(SH).map((lab) => { const sec = P._gapSectionFor(lab); const b = P._pathBlockOf(card(SH[lab]));
        return { label: sec.label, part: sec.label, group: sec.group, rows: b.rows, notSubmitted: b.notSubmitted }; });
    const LIT = [{ label: 'Your essay', lit: true, needed: 5, written: 5, units: units }];
    const L = (focus, answers, qm) => P.pathFocusLine(focus, answers || LIT, qm || { question: [], ao_holistic: [] });

    // ── A. the line ──
    const a1 = L({ label: 'Close analysis', keys: ['skill:close_analysis'] });
    ok(a1 === '**Your target focus: Close analysis.** This time it earned 2.5 of 6 marks. Start with Body 1 (0.75 of 2).',
        'A1 skill focus, worked by hand (Body 1 and 2 both 0.75/2 — the first wins): got ' + JSON.stringify(a1));
    const a2 = L({ label: 'Introduction', keys: ['element:intro'] });
    ok(a2 === '**Your target focus: Introduction.** This time it earned 0.75 of 3 marks. Start with your building sentences (0 of 1).',
        'A2 element focus: the weakest part inside it, the bigger loss breaking the 0% tie: got ' + JSON.stringify(a2));
    const qm = { question: [{ key: 'Q2', earned: 3, available: 8 }, { key: 'Q3', earned: 5, available: 8 }, { key: 'Q4', earned: 9, available: 20 }],
        ao_holistic: [{ question: 'Q5', key: 'AO5', earned: 14, available: 24 }, { question: 'Q5', key: 'AO6', earned: 10, available: 16 }] };
    const a3 = L({ label: 'AO2: language and structure', keys: ['question:Q2', 'question:Q3'] }, [], qm);
    ok(a3 === '**Your target focus: AO2: language and structure.** This time it earned 8 of 16 marks. Start with Question 2 (3 of 8).',
        'A3 AO focus resolved to two questions: got ' + JSON.stringify(a3));
    const a4 = L({ label: 'AO5: content and organisation', keys: ['aosplit:Q5:AO5'] }, [], qm);
    ok(a4 === '**Your target focus: AO5: content and organisation.** This time it earned 14 of 24 marks.', 'A4 the Q5 split, no "start" (nothing finer): got ' + JSON.stringify(a4));
    const a5 = L({ label: 'Question 4: evaluating a statement', keys: ['question:Q4'] }, [], qm);
    ok(a5 === '**Your target focus: Question 4: evaluating a statement.** This time it earned 9 of 20 marks.', 'A5 one question → no "start" repeating it: got ' + JSON.stringify(a5));
    const full = [{ label: 'Your essay', lit: true, needed: 1, written: 1, units: [{ label: 'Introduction', part: 'Introduction', group: 'Introduction',
        rows: P._pathBlockOf(card([['Comparative thesis (AO1)', '1.5', '1.5'], ['Comparative hook (AO1/AO3)', '0.5', '0.5']])).rows }] }];
    const a6 = L({ label: 'Introduction', keys: ['element:intro'] }, full);
    ok(a6 === '**Your target focus: Introduction.** This time it earned 2 of 2 marks.', 'A6 full marks → no "start": got ' + JSON.stringify(a6));
    ok(L({ label: 'Context', keys: ['skill:context'] }, full) === '', 'A7 no row for the focus → no line (never a 0)');
    ok(L({ label: 'AO1', keys: [] }) === '' && L(null) === '' && L({ label: 'X', keys: ['bogus'] }) === '', 'A8 empty / missing / unknown keys → no line');
    const lu = P._pathCardUnits(LANG_Q4, 'Q4');
    const a9 = L({ label: 'Question 4 introduction and conclusion', keys: ['element:q4.intro', 'element:q4.conclusion'] },
        [{ label: 'Q4', lit: false, needed: lu.length, written: lu.length, units: lu }]);
    ok(a9 === '**Your target focus: Question 4 introduction and conclusion.** This time it earned 0.5 of 1.5 marks. Start with your restated thesis (0 of 0.5).',
        'A9 language element keys (q4.intro + q4.conclusion): got ' + JSON.stringify(a9));

    // ── B. never a fact ──
    const box = P.pathBoxModel({ grade: 5, answers: LIT, ratings: [], calib: [], msa: null, how: { phase: 'initial' }, focusLine: a1 });
    ok(box && box.bullets.indexOf(a1) > -1, 'B: the line is a box bullet');
    ok(box && box.bullets.indexOf(a1) === box.bullets.length - 2 && /trust the process/i.test(box.bullets[box.bullets.length - 1]), 'B: it sits just before the HOW line');
    ok(box && box.facts.every((f) => f.indexOf('target focus') === -1 && f.indexOf('Close analysis') === -1), 'B: never in facts');
    ok(box && P._pathFactText(box).indexOf('target focus') === -1, 'B: never in the closing-turn text Sophia is given');

    // ── C. wiring ──
    const bfd = JS.slice(JS.indexOf('function _breakdownFromDoc('), JS.indexOf('async function _autoCommitAssessment('));
    ok(/const _qm = _docQuestionMarks\(\);/.test(bfd) && !/_AO_SPLIT_RE\.exec\(/.test(bfd)
        && (JS.match(/_AO_SPLIT_RE\.exec\(/g) || []).length === 1 && (JS.match(/AO split failed audit/g) || []).length === 1,
        'C: one question reader (_docQuestionMarks) — the breakdown calls it, and the audited split parse exists once');
    ok(/focusLine: _pathFocusLineFor\(answers\),/.test(JS) && /return pathFocusLine\(state\.targetFocus, answers, _docQuestionMarks\(\)\);/.test(JS), 'C: the box reads the line from state.targetFocus');
    ok(/\$\{_quizIdentQS\(\)\}\$\{_focusQS\(\)\}`;\n    \}/.test(JS) && /\$\{_stageSeed\}\$\{_quizIdent\}\$\{_focusQS\(\)\}`;/.test(JS), 'C: both load URLs (student and tutor) send the course');
    ok(/state\.targetFocus = \(res && res\.targetFocus && res\.targetFocus\.label && Array\.isArray\(res\.targetFocus\.keys\)\) \? res\.targetFocus : null;/.test(JS), 'C: the load sets state.targetFocus');
    ok(/Grade \\d\|\\\*\\\*Your target focus\)/.test(JS), 'C: the box styles the line as a step');
    ok((REST.match(/'targetFocus'\s*=> \$this->target_focus_for_doc\(\$request, \$(user|student)_id, \$board, \$suffix\)/g) || []).length === 5
        && (REST.match(/'topicProgress'\s*=> \$this->topic_progress_for_doc\(/g) || []).length === 5, 'C: all five load responses carry targetFocus beside topicProgress');

    // ── D. server, executed ──
    const mm = /    private function target_focus_for_doc\(\$request, \$user_id, \$board, \$suffix\) \{[\s\S]*?\n    \}\n/.exec(REST);
    ok(!!mm, 'D: target_focus_for_doc found');
    if (mm) {
        const stubs = (withFocusFor) => '<?php\nfunction absint($v) { return abs((int) $v); }\nfunction sanitize_text_field($v) { return trim((string) $v); }\n'
            + 'class R { public $p; function __construct($p) { $this->p = $p; } function get_param($k) { return $this->p[$k] ?? null; } }\n'
            + 'class Sophicly_Att_Targets { ' + (withFocusFor ? 'static function focus_for($u, $c) { return $GLOBALS["FF"][$c] ?? null; }' : 'static function open_for($u) { return []; }') + ' }\n'
            + 'class Sophicly_Att_Focus { static function describe($f) { return $GLOBALS["DESC"][$f] ?? null; } }\n'
            + 'class SWML_Protocol_Router { static function get_paper_spec($b, $s) { if ($s === "shakespeare") return ["kind" => "lit", "spec" => []];'
            + ' return $s === "language_p1" ? ["kind" => "language", "spec" => ["sections" => [["questions" => [["id" => "Q1", "aos" => ["AO1"]], ["id" => "Q2", "aos" => ["AO2"]], ["id" => "Q3", "aos" => ["AO2"]], ["id" => "Q4", "aos" => ["AO4"]]]], ["questions" => [["id" => "Q5", "aos" => ["AO5", "AO6"]]]]]]] : null; } }\n'
            + 'class T {\n' + mm[0] + '    function run($p, $suffix) { return $this->target_focus_for_doc(new R($p), 1938, "aqa", $suffix); }\n}\n'
            + '$GLOBALS["FF"] = [42205 => ["focus" => "aqa_lang1:ao2"], 41370 => ["focus" => "aqa_lit:close"], 42517 => ["focus" => "aqa_poetry:ao1"], 43073 => ["focus" => "aqa_lang2:ao5"], 9 => null];\n'
            + '$GLOBALS["DESC"] = ["aqa_lang1:ao2" => ["label" => "AO2: language and structure", "wml" => ["ao:AO2"]], "aqa_lit:close" => ["label" => "Close analysis", "wml" => ["skill:close_analysis"]],'
            + ' "aqa_poetry:ao1" => ["label" => "AO1", "wml" => []], "aqa_lang2:ao5" => ["label" => "AO5", "wml" => ["ao:AO5"]]];\n'
            + '$t = new T(); $o = [];\n';
        const cases = stubs(true)
            + '$o["planning"] = $t->run(["focus_course" => 41370], "_planning");\n'
            + '$o["nocourse"] = $t->run([], "_assessment");\n'
            + '$o["skill"] = $t->run(["focus_course" => 41370, "focus_subject" => "shakespeare"], "_assessment");\n'
            + '$o["ao2"] = $t->run(["focus_course" => 42205, "focus_subject" => "language_p1"], "_fbdiscuss");\n'
            + '$o["ao5"] = $t->run(["focus_course" => 43073, "focus_subject" => "language_p1"], "_reassessment");\n'
            + '$o["ao_lit"] = $t->run(["focus_course" => 42205, "focus_subject" => "shakespeare"], "_assessment");\n'
            + '$o["emptykeys"] = $t->run(["focus_course" => 42517], "_assessment");\n'
            + '$o["nofocus"] = $t->run(["focus_course" => 9], "_assessment");\n'
            + 'echo json_encode($o);\n';
        const run = (src) => { const f = path.join(os.tmpdir(), 'tfh-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.php'); fs.writeFileSync(f, src);
            try { return execFileSync('php', [f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } finally { fs.unlinkSync(f); } };
        let o = null;
        try { o = JSON.parse(run(cases)); } catch (e) { ok(false, 'D: php run failed — ' + String(e.message).slice(0, 160)); }
        if (o) {
            ok(o.planning === null, 'D: not a marked document → null');
            ok(o.nocourse === null, 'D: no course → null');
            ok(o.skill && o.skill.label === 'Close analysis' && JSON.stringify(o.skill.keys) === '["skill:close_analysis"]', 'D: a skill key passes (got ' + JSON.stringify(o.skill) + ')');
            ok(o.ao2 && JSON.stringify(o.ao2.keys) === '["question:Q2","question:Q3"]', 'D: ao:AO2 → the questions that assess only AO2 (got ' + JSON.stringify(o.ao2) + ')');
            ok(o.ao5 && JSON.stringify(o.ao5.keys) === '["aosplit:Q5:AO5"]', 'D: ao:AO5 → the Q5 split (got ' + JSON.stringify(o.ao5) + ')');
            ok(o.ao_lit === null, 'D: an AO focus on a Literature paper resolves to nothing → null');
            ok(o.emptykeys === null && o.nofocus === null, 'D: no row can tell / no focus → null');
        }
        let old = null;
        try { old = run(stubs(false) + 'echo json_encode($t->run(["focus_course" => 41370], "_assessment"));\n'); } catch (e) { ok(false, 'D: an older tracker without focus_for() must not crash — ' + String(e.message).slice(0, 120)); }
        if (old !== null) ok(old.trim() === 'null', 'D: an older tracker without focus_for() → null, no crash');
    }
    return fails;
}

let failed = 0;
const base = check(JS0, REST0);
base.forEach((f) => { console.log('  ❌ ' + f); failed++; });
if (!base.length) console.log('  ✅ A–D: the line on real rows · never a fact · one reader, both loads, five responses · the server method, executed');

const MUT = [
    ['the focus becomes a fact Sophia is told', (j, r) => [j.replace('if (inp.focusLine) bullets.push(inp.focusLine);', 'if (inp.focusLine) { bullets.push(inp.focusLine); facts.push(inp.focusLine); }'), r]],
    ['a single place still gets a "start"', (j, r) => [j.replace('if (starts.length > 1 && open.length) {', 'if (open.length) {'), r]],
    ['the tutor load forgets the course', (j, r) => [j.replace('${_cwReviewProjectQS()}${_quizIdentQS()}${_focusQS()}', '${_cwReviewProjectQS()}${_quizIdentQS()}'), r]],
    ['the server shows it on unmarked documents', (j, r) => [j, r.replace("    private function target_focus_for_doc($request, $user_id, $board, $suffix) {\n        if (!in_array((string) $suffix, ['_assessment', '_reassessment', '_fbdiscuss'], true)) return null;\n", "    private function target_focus_for_doc($request, $user_id, $board, $suffix) {\n")]],
    ['the server splits every AO question', (j, r) => [j, r.replace("$keys[] = count($aos) === 1 ? 'question:' . $id : 'aosplit:' . $id . ':' . $m[1];", "$keys[] = 'aosplit:' . $id . ':' . $m[1];")]],
];
MUT.forEach(([name, f]) => {
    const [j, r] = f(JS0, REST0);
    if (j === JS0 && r === REST0) { console.log('  ❌ E: mutation "' + name + '" did not apply'); failed++; return; }
    const res = check(j, r);
    if (res.length) console.log('  ✅ E: "' + name + '" is caught (' + res[0].slice(0, 110) + ')');
    else { console.log('  ❌ E: "' + name + '" passed — the gate is blind to it'); failed++; }
});
if (failed) { console.log('\n❌ FAIL — target-focus-harness'); process.exit(1); }
console.log('\n✅ PASS — target-focus-harness');
