#!/usr/bin/env node
/* eslint-env node */
/**
 * breakdown-parts-harness.js — v7.20.892 (dashboard #697; Neil 14 Oct: a target should show whether what it names improved).
 *
 * Before .892 a Literature essay sent NO analytics breakdown (no "Qn" feedback box → _breakdownFromDoc returned null), so
 * prod's wp_sophicly_assessment_marks held Language rows only (8 sessions since 1 Sep, measured 14 Oct). Now every marked
 * piece sends two finer dimensions, read off the SAME paragraph rows as the "Where you are" box:
 *   element — one row per marked paragraph (intro · body1… · conclusion; a language answer prefixes its question: q4.intro)
 *   skill   — one row per criterion family across the piece (WML's own keys; the dashboard maps focus items onto them)
 *
 * What it proves, from the SHIPPED code (sentinel slices; the server method runs in PHP):
 *   A. LIT      — Shayaan 1397's real P&C rows (numbers + the protocol's criterion names only) give the element and skill
 *                 rows worked out by hand.
 *   B. LANGUAGE — keys carry the question; a "not submitted" paragraph (no mark table) gets no row, never a 0.
 *   C. WIRING   — one reader (_pathAnswersFromDoc) for the box and the breakdown; a Literature essay is no longer null; the
 *                 server runs breakdown_parts on every branch; student-data routes both dimensions.
 *   D. SERVER   — breakdown_parts, executed: keeps good rows, drops a bad key, earned > available, available 0, non-numbers.
 *   E. FALSIFY  — four mutations each fail A–D.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const os = require('os');
const ROOT = path.resolve(__dirname, '..');
const JS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const REST0 = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');
const LISTENER = path.resolve(ROOT, '..', '..', '..', 'sophicly-plugins', 'sophicly-student-data', 'includes', 'class-wml-listener.php');

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
        + '\nthis.P = { breakdownPartsModel, _pathBlockOf, _pathCardUnits, _gapSectionFor };', ctx);
    return ctx.P;
}

// ── fixtures: NUMBERS ONLY (criterion names are the protocol's own wording; the "why" cell is a dash) ──
const line = (c, w, s) => c + ' — ' + w + ' · ' + s + '/' + w + ' · –';
const card = (rows) => ['Criterion — Worth · Your Score · Why'].concat(rows.map((r) => line(r[0], r[1], r[2])));
const SH_INTRO = [['Comparative hook (AO1/AO3)', '0.5', '0'], ['Building sentence: comparative context (AO3)', '0.5', '0'],
    ['Building sentence: context shapes themes differently (AO3)', '0.5', '0'], ['Comparative thesis (AO1)', '1.5', '0.75']];
const shBody = (ts, tt, ev, iq, ca, ef, ip, ap, cx, kind) => [
    ['Comparative topic sentence (' + kind + ')', '0.5', ts], ['Technical terminology (' + kind + ', both poems)', '0.5', tt],
    ['Strategic evidence (both poems)', '0.5', ev], ['Integrated quotes', '0.5', iq], ['Close analysis (both poems, ' + kind + ')', '1.5', ca],
    ['Comparative effects (differentiated)', '1.0', ef], ['Technique interplay', '0.5', ip], ["Comparative author's purpose", '1.0', ap],
    ['Comparative context', '1.0', cx]];
const SH = {
    Introduction: SH_INTRO,
    'Body 1': shBody('0', '0', '0', '0.5', '0.75', '0.25', '0', '0.25', '0', 'FORM'),
    'Body 2': shBody('0', '0.25', '0', '0.5', '0.5', '0.25', '0.25', '0.25', '0.25', 'STRUCTURE'),
    'Body 3': shBody('0.25', '0.25', '0', '0.5', '0.75', '0.25', '0.25', '0.25', '0.25', 'LANGUAGE'),
    Conclusion: [['Restated comparative thesis (AO1)', '1.0', '0'], ['Synthesized central comparative concept (AO1)', '1.0', '0'],
        ["Synthesized both poets' methods/purposes (AO1/AO2)", '1.5', '0'], ['Universal comparative message (AO1)', '1.5', '0'],
        ['Final evaluative judgement (AO1)', '1.0', '0']],
};
// Worked by hand from the rows above.
const LIT_ELEMENT = { intro: [0.75, 3], body1: [1.75, 7], body2: [2.25, 7], body3: [2.75, 7], conclusion: [0, 6] };
const LIT_SKILL = {
    hook: [0, 0.5], building_sentences: [0, 1], thesis: [0.75, 1.5],
    topic_sentence: [0.25, 1.5], technical_terms: [0.5, 1.5], evidence: [1.5, 3], close_analysis: [2.5, 6],
    effects: [0.75, 3], purpose: [0.75, 3], context: [0.5, 3],
    restated_thesis: [0, 1], controlling_concept: [0, 1], central_purpose: [0, 1.5], universal_message: [0, 1.5],
};   // "Final evaluative judgement" is named by no skill rule → no skill row (its 1 mark still counts in conclusion)
const LANG_Q4 = ['Q4 — Introduction', 'Introduction — not submitted.', 'Total Mark for Introduction: 0/1',
    'Q4 — Body Paragraph 1', 'Criterion — Worth · Your Score · Why',
    line('Topic sentence addresses evaluative keywords + links to thesis', '1.0', '0.5'), line('Perceptive close analysis', '1.0', '0.25'),
    line('First detailed sentence evaluating effects', '0.75', '0.5'),
    'Q4 — Conclusion', line('Restated thesis', '0.5', '0.5'), 'Q4 — Question Total', 'Q4 Total: 1.75/20'];

function check(JS, REST) {
    const fails = [];
    const ok = (c, m) => { if (!c) fails.push(m); };
    let P;
    try { P = load(JS); } catch (e) { return ['load: ' + e.message]; }
    const near = (a, b) => Math.abs(a - b) < 0.001;

    // ── A. Literature ──
    const units = Object.keys(SH).map((lab) => {
        const sec = P._gapSectionFor(lab); const b = P._pathBlockOf(card(SH[lab]));
        return { label: sec.label, part: sec.label, group: sec.group, rows: b.rows, notSubmitted: b.notSubmitted };
    });
    const lit = P.breakdownPartsModel([{ label: 'Your essay', lit: true, needed: 5, written: 5, units: units }]);
    const el = {}; lit.element.forEach((r) => { el[r.key] = r; });
    ok(Object.keys(el).join(',') === 'intro,body1,body2,body3,conclusion', 'A: one element row per paragraph, keyed intro/body1-3/conclusion (got ' + Object.keys(el).join(',') + ')');
    Object.keys(LIT_ELEMENT).forEach((k) => ok(el[k] && near(el[k].earned, LIT_ELEMENT[k][0]) && near(el[k].available, LIT_ELEMENT[k][1]),
        'A: ' + k + ' = ' + LIT_ELEMENT[k].join('/') + ' (got ' + (el[k] ? el[k].earned + '/' + el[k].available : 'none') + ')'));
    const sk = {}; lit.skill.forEach((r) => { sk[r.key] = r; });
    ok(Object.keys(sk).length === Object.keys(LIT_SKILL).length, 'A: ' + Object.keys(LIT_SKILL).length + ' skill rows (got ' + Object.keys(sk).join(',') + ')');
    Object.keys(LIT_SKILL).forEach((k) => ok(sk[k] && near(sk[k].earned, LIT_SKILL[k][0]) && near(sk[k].available, LIT_SKILL[k][1]),
        'A: skill ' + k + ' = ' + LIT_SKILL[k].join('/') + ' (got ' + (sk[k] ? sk[k].earned + '/' + sk[k].available : 'none') + ')'));
    ok(lit.skill.every((r) => /^[a-z0-9_.]{1,40}$/.test(r.key)) && lit.element.every((r) => /^[a-z0-9_.]{1,40}$/.test(r.key)), 'A: every key passes the server\'s key rule');

    // ── B. Language ──
    const lu = P._pathCardUnits(LANG_Q4, 'Q4');
    const lang = P.breakdownPartsModel([{ label: 'Q4', lit: false, needed: lu.length, written: lu.length - 1, units: lu }]);
    const lk = lang.element.map((r) => r.key + '=' + r.earned + '/' + r.available).join(',');
    ok(lk === 'q4.body1=1.25/2.75,q4.conclusion=0.5/0.5', 'B: language keys carry the question; the not-submitted introduction has no row (got ' + lk + ')');
    ok(!lang.element.some((r) => r.key === 'q4.intro'), 'B: a paragraph with no mark table is never given a number');

    // ── C. Wiring ──
    ok(/function _pathBoxData\(\) \{\n        const answers = _pathAnswersFromDoc\(\);/.test(JS), 'C: the box reads _pathAnswersFromDoc');
    ok(/parts = breakdownPartsModel\(_pathAnswersFromDoc\(\) \|\| \[\]\);/.test(JS), 'C: the breakdown reads the same _pathAnswersFromDoc');
    ok(/if \(!question\.length && !parts\.element\.length\) return null;/.test(JS) && !/if \(!question\.length\) return null;/.test(JS), 'C: a Literature essay (no Qn box) is no longer null');
    ok(/if \(parts\.element\.length\) out\.element = parts\.element;/.test(JS) && /if \(parts\.skill\.length\) out\.skill = parts\.skill;/.test(JS), 'C: both dimensions ride the payload');
    const bb = REST.slice(REST.indexOf('private function build_breakdown('), REST.indexOf('private static function breakdown_label('));
    const iParts = bb.indexOf('$parts = self::breakdown_parts($client);'), iSpec = bb.indexOf('if (!$resolved) {');
    ok(iParts > 0 && iSpec > iParts && /\$out \+= \$parts;/.test(bb), 'C: the server attaches the parts before any branch can return');
    if (fs.existsSync(LISTENER)) {
        const L = fs.readFileSync(LISTENER, 'utf8');
        ok(/foreach \( array\( 'ao', 'question', 'skill', 'technique', 'element' \) as \$dim \)/.test(L), 'C: student-data routes skill and element rows (class-wml-listener.php)');
    } else ok(false, 'C: student-data listener not found at ' + LISTENER + ' — routing UNVERIFIED');

    // ── D. Server, executed ──
    const m = /    private static function breakdown_parts\(\$client\) \{[\s\S]*?\n    \}\n/.exec(REST);
    const lab = /    private static function breakdown_label\(\$s\) \{[\s\S]*?\n    \}\n/.exec(REST);
    ok(!!m && !!lab, 'D: breakdown_parts / breakdown_label found');
    if (m && lab) {
        const f = path.join(os.tmpdir(), 'bdp-' + process.pid + '.php');
        fs.writeFileSync(f, '<?php\nclass T {\n' + m[0] + lab[0] + '    public static function run($c) { return self::breakdown_parts($c); }\n}\n'
            + '$c = ["element" => [["key"=>"intro","label"=>"Introduction","earned"=>0.75,"available"=>3],["key"=>"Body 1","earned"=>1,"available"=>2],'
            + '["key"=>"body2","earned"=>3,"available"=>2],["key"=>"body3","earned"=>0,"available"=>0],["key"=>"conclusion","earned"=>"x","available"=>6]],'
            + '"skill" => [["key"=>"close_analysis","label"=>"Close Analysis","earned"=>2.5,"available"=>6]], "other" => [["key"=>"a","earned"=>1,"available"=>1]]];\n'
            + 'echo json_encode(T::run($c));\n');
        let r = null;
        try { r = JSON.parse(execFileSync('php', [f], { encoding: 'utf8' })); } catch (e) { ok(false, 'D: php run failed — ' + e.message.slice(0, 120)); }
        fs.unlinkSync(f);
        if (r) {
            ok(r.element && r.element.length === 1 && r.element[0].key === 'intro' && r.element[0].earned === 0.75,
                'D: keeps the good row; drops a bad key, earned > available, available 0 and a non-number (got ' + JSON.stringify(r.element) + ')');
            ok(r.skill && r.skill.length === 1 && r.skill[0].key === 'close_analysis', 'D: skill rows pass');
            ok(!r.other, 'D: only element and skill are read');
        }
    }
    return fails;
}

let failed = 0;
const base = check(JS0, REST0);
base.forEach((f) => { console.log('  ❌ ' + f); failed++; });
if (!base.length) console.log('  ✅ A–D: Shayaan\'s rows by hand · language keys + no number for an unwritten paragraph · one reader · server, executed');

const MUT = [
    ['language keys lose their question', (j, r) => [j.replace("const key = a.lit ? pk : String(a.label || '').toLowerCase() + '.' + pk;", 'const key = pk;'), r]],
    ['an unwritten paragraph gets a number', (j, r) => [j.replace('const pk = rows.length ? _breakdownParaKey(u.part || u.label) : null;', 'const pk = _breakdownParaKey(u.part || u.label);'), r]],
    ['Literature is null again', (j, r) => [j.replace('if (!question.length && !parts.element.length) return null;', 'if (!question.length) return null;'), r]],
    ['server lets earned > available through', (j, r) => [j, r.replace('if (!($a > 0) || $e < 0 || $e > $a + 0.001) continue;', 'if (!($a > 0) || $e < 0) continue;')]],
];
MUT.forEach(([name, f]) => {
    const [j, r] = f(JS0, REST0);
    if (j === JS0 && r === REST0) { console.log('  ❌ E: mutation "' + name + '" did not apply'); failed++; return; }
    const res = check(j, r);
    if (res.length) console.log('  ✅ E: "' + name + '" is caught (' + res[0] + ')');
    else { console.log('  ❌ E: "' + name + '" passed — the gate is blind to it'); failed++; }
});
if (failed) { console.log('\n❌ FAIL — breakdown-parts-harness'); process.exit(1); }
console.log('\n✅ PASS — breakdown-parts-harness');
