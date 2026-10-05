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

// v7.20.673 (#473/#683): AQA Literature — one six-level AO1–AO3 ladder per paper + AO4.
const lit = Object.keys(data).filter((k) => k.indexOf('aqa_lit_') === 0);
ok(lit.length === 3 && ['aqa_lit_p1_ao123', 'aqa_lit_p2_ao123', 'aqa_lit_ao4'].every((k) => lit.indexOf(k) !== -1),
    'AQA Literature: 3 schemes (Paper 1 AO1–AO3 · Paper 2 AO1–AO3 · AO4) — got ' + lit.join(', '));
['aqa_lit_p1_ao123', 'aqa_lit_p2_ao123'].forEach((k) => {
    const s = data[k];
    ok(s && s.maxMarks === 30 && s.levels.length === 6 && s.levels.every((l) => l.bands.length === 1
        && l.bands[0].strands.map((x) => x.name).join(',') === 'AO1,AO2,AO3'),
        k + ': ONE six-level /30 ladder, every level carrying named AO1 · AO2 · AO3 strands (never a lead-in "AO1")');
});
ok(data.aqa_lit_ao4 && data.aqa_lit_ao4.maxMarks === 4 && data.aqa_lit_ao4.levels.length === 3,
    'AO4: three performance levels out of 4 (Threshold 1 · Intermediate 2–3 · High 4)');
ok(data.aqa_unseen_q271.levels.every((l) => l.lead === null && l.bands[0].strands[0].name === 'AO1'),
    'unseen Q27.1: "AO1:" is a named strand, not the level lead-in (v7.20.673 parser fix)');
// Paper 2 prints "writer’s methods" where Paper 1 prints "the writer’s methods" — kept apart, verbatim.
const _descs = (k) => [].concat.apply([], data[k].levels.map((l) => [].concat.apply([], l.bands[0].strands.map((x) => x.descriptors))));
ok(_descs('aqa_lit_p1_ao123').indexOf('Identification of the writer’s methods.') !== -1
    && _descs('aqa_lit_p2_ao123').indexOf('Identification of writers’ methods.') !== -1,
    'each paper keeps its OWN wording (P1 "the writer’s" · P2 "writers’")');

// The host's key builder, executed against a fake state/window — the real function, sliced whole.
const kbSrc = JS.slice(JS.indexOf('    function _ladderSchemeKeysFor(topicData) {'), JS.indexOf('    function _ladderFids(key) {'))
    // v7.20.673: the builder calls _isLitEssay — the REAL predicate, sliced too. Without it the
    // sandbox threw, the builder's try/catch returned [], and "no keys for Literature" passed on a crash.
    + JS.slice(JS.indexOf('    function _isLitEssay() {'), JS.indexOf('    function _isPoetryLadder() {'));
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
const _kk = (s, t) => keysUnder('aqa', s, null, t || '').map((k) => k.key).join(',');
ok(_kk('shakespeare', 'macbeth') === 'aqa_lit_p1_ao123,aqa_lit_ao4', 'Shakespeare (Zayan\'s real lesson: subject=shakespeare text=macbeth) → Paper 1 ladder + AO4 — got ' + _kk('shakespeare', 'macbeth'));
ok(_kk('modern_text', 'inspector_calls') === 'aqa_lit_p2_ao123,aqa_lit_ao4', 'modern text → Paper 2 ladder + AO4 — got ' + _kk('modern_text', 'inspector_calls'));
ok(_kk('19th_century', 'christmas_carol') === 'aqa_lit_p1_ao123', '19th-century novel → Paper 1 ladder, NO AO4 ("AO4 will be assessed on Section A only") — got ' + _kk('19th_century', 'christmas_carol'));
ok(_kk('poetry_anthology', 'love_relationships_poetry') === '', 'poetry anthology → nothing yet (its comparison grid is the next batch — honest empty, not a guess)');
ok(keysUnder('edexcel', 'shakespeare').length === 0, 'Edexcel Shakespeare → nothing (AQA data only)');
{
    const m = keysUnder('aqa', 'shakespeare', null, 'macbeth');
    ok(m.reduce((s, k) => s + k.max, 0) === 34, 'Shakespeare maxima sum to 34 = the essay\'s own total (3 + 8×3 + 7) — no conversion needed');
    ok(keysUnder('aqa', '19th_century').reduce((s, k) => s + k.max, 0) === 30, '19th-century maxima sum to 30 = its essay total (3 + 7×3 + 6)');
}

// ── B · DOC ──────────────────────────────────────────────────────────────────────────────────
console.log('\nB · the document section');
const bsSrc = JS.slice(JS.indexOf('    function buildMarkSchemeSelfAssessSection(topicData) {'), JS.indexOf('    function _ladderRowText(fid) {'));
const fidSrc = JS.slice(JS.indexOf('    function _ladderFids(key) {'), JS.indexOf('    // The document section'));
function sectionUnder(board, subject, text) {
    const ctx = {
        window: { WML_MARK_SCHEMES: data }, state: { board, subject, text: text || '' }, console,
        escapeHTML: (x) => String(x), inputHTML: (p, f) => '<row fid="' + f + '" p="' + p + '"/>',
        sectionHTML: (t, l, e, p, inner) => '<sec label="' + l + '">' + inner + '</sec>',
        LADDER_SA_LABEL: 'Mark-Scheme Self-Assessment',
    };
    vm.createContext(ctx);
    vm.runInContext(kbSrc + fidSrc + bsSrc + '\nthis.__out = buildMarkSchemeSelfAssessSection(null);', ctx);
    return ctx.__out;
}
const p1 = sectionUnder('aqa', 'language1');
ok(/label="Mark-Scheme Self-Assessment"/.test(p1), 'P1 section carries the host\'s label');
ok((p1.match(/<row fid="sa-ms-aqa_lang1_/g) || []).length === 20, 'P1: 5 keys × 4 rows = 20 rows — got ' + (p1.match(/<row fid="sa-ms-aqa_lang1_/g) || []).length);
ok(/fid="sa-ms-confidence"/.test(p1), 'P1: the confidence row exists');
// v7.20.677 (#691 — Neil: "is that what I've given myself?… at the bottom it shows what Sophia is
// going to give me or something?"): every box is the student's own, and says so; no Band box.
ok(!/-band"/.test(p1), 'no Band box — only AQA Lang Q5 content prints Upper/Lower, and there the level box already carries it (#691)');
{
    const prompts = (p1.match(/ p="([^"]*)"/g) || []).map((x) => x.slice(4, -1)).filter((x) => !/^How confident/.test(x));
    ok(prompts.length === 20 && prompts.every((x) => /you gave yourself|you said your answer|^Your reason/.test(x)),
        'every box names it as the student\'s own decision — ' + Array.from(new Set(prompts)).join(' | '));
    ok(!prompts.some((x) => /band|placement/i.test(x)), 'no label mentions band or placement');
    ok(/Every box here holds what you decided\./.test(p1) && /Sophia’s marks go in the Feedback sections\./.test(p1) && /Calibration section then puts your marks and hers side by side/.test(p1),
        'the intro says the boxes are the student\'s, and where Sophia\'s marks go instead');
}
{
    // v7.20.679 (#691 — Neil, on AO4's criteria box: "I have no idea what that means"): AQA prints each
    // Literature AO4 level as ONE sentence, so it has no criteria to tick — and no box. Every other
    // scheme keeps its criteria box.
    const osCtx = { window: { WML_MARK_SCHEMES: data } };
    vm.createContext(osCtx);
    vm.runInContext(fidSrc + '\nthis.one = _ladderOneSentence; this.fids = _ladderFids;', osCtx);
    const oneSentence = Object.keys(data).filter((k) => data[k] && Array.isArray(data[k].levels) && osCtx.one(k));
    ok(oneSentence.join(',') === 'aqa_lit_ao4', 'only Literature AO4 has one-sentence levels — got ' + (oneSentence.join(',') || 'none'));
    ok(!('met' in osCtx.fids('aqa_lit_ao4')) && osCtx.fids('aqa_lit_p1_ao123').met === 'sa-ms-aqa_lit_p1_ao123-met', 'AO4 has no criteria fid; AO1–AO3 keeps its own');
    const lit = sectionUnder('aqa', 'shakespeare', 'macbeth');
    ok(/fid="sa-ms-aqa_lit_p1_ao123-met"/.test(lit) && !/fid="sa-ms-aqa_lit_ao4-met"/.test(lit) && /fid="sa-ms-aqa_lit_ao4-mark"/.test(lit),
        'a Macbeth document: AO1–AO3 has a criteria box, AO4 has none (and still its level, mark and reason)');
}
{
    const bandSrc = JS.slice(JS.indexOf('    function _ladderBandOf(key, levelText) {'), JS.indexOf('    function _ladderHostEligible() {'));
    const bctx = { window: { WML_MARK_SCHEMES: data } };
    vm.createContext(bctx);
    vm.runInContext(bandSrc + '\nthis.f = _ladderBandOf;', bctx);
    ok(bctx.f('aqa_lang1_q5_ao5', 'Level 4 · Upper Level 4 · Top of this level') === 'Upper Level 4', 'the saved band is read back from the level box (Lang Q5 AO5 → "Upper Level 4")');
    ok(bctx.f('aqa_lang1_q5_ao5', 'Level 2 · Lower Level 2 · Middle of this level') === 'Lower Level 2', '…and the lower half');
    ok(bctx.f('aqa_lit_p1_ao123', 'Level 5 · Bottom of this level') === '' && bctx.f('aqa_lang1_q3_ao2', 'Level 3 · Top of this level') === '',
        'a scheme that prints no halves reads back no band (a one-band level named "Level 5" is not a band)');
}
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
// v7.20.673 (#683, Neil): the skills walk FIRST, then the mark scheme — at BOTH sites.
ok(idxL.length === 2 && idxS.length === 2 && idxS[0] < idxL[0] && idxS[1] < idxL[1], 'the blind skills walk precedes the ladder at both sites');
// …and the skills walk hands to the ladder, never to marking, while a ladder is still owed.
{
    const hb = JS.slice(JS.indexOf('    function _saWalkHandBack() {'), JS.indexOf('    function _saWalkHandBack() {') + 2600);
    const iBridge = hb.indexOf('if (_ladderHostEligible() && !_ladderHostComplete())');
    const iMark = hb.indexOf('Beginning marking');
    ok(iBridge !== -1 && iMark !== -1 && iBridge < iMark && /_ladderHostRenderCurrent\(\)/.test(hb.slice(iBridge, iMark)),
        'the skills walk BRIDGES to the ladder before any "Beginning marking" line (one marking hand-off, not two)');
}
// v7.20.673: the section is placed by a targeted heal UNDER the Self-Assessment — never by
// migrateDocument's setContent above Tutor Sign-off (20 of 31 live docs had it at the bottom).
ok(!/label: LADDER_SA_LABEL, build: \(\) => buildMarkSchemeSelfAssessSection\(\)/.test(JS), 'migrateDocument no longer adds it (setContent, above Tutor Sign-off)');
ok(/_migrateStep\('healSelfAssessmentAboveFeedback', healSelfAssessmentAboveFeedback\);\s*\n\s*\/\/[^\n]*\n\s*_migrateStep\('healLadderSectionsUnderSelfAssessment', healLadderSectionsUnderSelfAssessment\);/.test(JS),
    'healLadderSectionsUnderSelfAssessment runs straight after the Self-Assessment reposition');
ok(/try \{ healLadderSectionsUnderSelfAssessment\(\); \} catch \(_\) \{\}/.test(JS), '…and again in the settled-state pass (the keys read state.subject)');
{
    const heal = JS.slice(JS.indexOf('    function healLadderSectionsUnderSelfAssessment() {'), JS.indexOf('    function migrateDocument() {'));
    ok(/insertContentAt\(target, html\)/.test(heal) && !/setContent/.test(heal), 'the heal INSERTS in place (insertContentAt) — never setContent (the v818 law)');
    ok(/tr\.delete\(cur\.pos, cur\.pos \+ cur\.node\.nodeSize\);\s*\n\s*tr\.insert\(tr\.mapping\.map\(target\), cur\.node\);/.test(heal), 'a misplaced section is MOVED as the same node (filled rows kept)');
    ok(/if \(cur && cur\.pos === target\) continue;/.test(heal), 'idempotent: already in place → no transaction');
}
// New documents are BUILT in that order — Self-Assessment, then the mark scheme, then Calibration.
{
    const sites = [];
    JS.replace(/html \+= buildSelfAssessmentSection\([^)]*\);[^\n]*\n[^\n]*\n\s*html \+= buildMarkSchemeSelfAssessSection\([^)]*\);[^\n]*\n\s*html \+= buildCalibrationSection\(/g, (m) => { sites.push(m); return m; });
    ok(sites.length === 5, 'all 5 templates build SA → Mark-Scheme SA → Calibration — got ' + sites.length);
}
// v7.20.614: the Calibration section joined both lists — it is the student's own record, not
// their writing, so marking must never read it and the ledger must never scan it.
ok(/STRIP_LABELS = new Set\(\['Analytics', 'Self-Assessment', 'Mark-Scheme Self-Assessment', 'Calibration', 'Action Plan'\]\)/.test(JS), 'stripped from the marking payload (incl. Calibration)');
ok(/SKIP = \/\^\(Overall Feedback\|Analytics\|Self-Assessment\|Mark-Scheme Self-Assessment\|Calibration\|Action Plan\|Score Summary\)\/i/.test(JS), 'skipped by the ledger scan (incl. Calibration)');
ok(count(/html \+= buildMarkSchemeSelfAssessSection\((?:topicData|null)\);/g) === 5, 'composed at all 5 document sites (2 exam-prep + 3 literature/dual) — got ' + count(/html \+= buildMarkSchemeSelfAssessSection\((?:topicData|null)\);/g));
ok(/self_assessment: \{ regime: 'bestfit', confidence: _ladderHostConfidence\(\) \|\| null, items: items \}/.test(JS), 'the canvas save carries self_assessment {regime, confidence, items[]}');
ok(/band: _ladderBandOf\(g\.key, _ladderRowText\(g\.fids\.level\)\) \|\| null,/.test(JS), 'the save still carries `band` — now read from the level box (#691)');
ok(/querySelectorAll\('\[data-swml-ask="ladder-confidence"\]'\)\.forEach\(n => n\.remove\(\)\)/.test(JS) && /_ab\.setAttribute\('data-swml-ask', 'ladder-confidence'\)/.test(JS),
    'the confidence ask removes an earlier copy and tags itself — ONE ask after a reload, with its buttons (#691)');
ok(/try \{ healLadderSaWording\(\); \} catch \(_\) \{\}/.test(JS), 'the wording heal runs in the settled-state pass, beside the section heal (#691)');
{
    // v7.20.678: the heal removes protected nodes, so it must run as a migration or the Section Guard
    // undoes it (MEASURED on staging). The probe replays the guard's rule — pin the shipped shape here.
    const wh = JS.slice(JS.indexOf('    function healLadderSaWording() {'), JS.indexOf('    function migrateDocument() {'));
    ok(/tr\.setMeta\('addToHistory', false\);\s*_migrationActive = true;\s*try \{ canvasEditor\.view\.dispatch\(tr\); \}[\s\S]{0,160}finally \{ _migrationActive = false; \}/.test(wh),
        'the wording heal dispatches under _migrationActive and outside undo history (#691)');
    ok(/if \(_migrationActive \|\| _undoGuardActive\) \{\s*_sectionCount = countSections\(editor\.state\.doc\);\s*return;\s*\}/.test(JS)
        && /if \(newCount < _sectionCount\) \{[\s\S]{0,240}editor\.commands\.undo\(\);/.test(JS),
        'the Section Guard still has the shape ladder-sections-heal-probe replays (migration bypass; undo on a lower count)');
}
ok(/\(step\.level\.name \? ' — ' \+ step\.level\.name : ''\) \+ \(st\.bandName \? ' · ' \+ st\.bandName : ''\)/.test(JS), 'a one-mark level still writes the band into the level box (the band box is gone)');
ok(/if \(_all\.length\) writeRow\(fid\('met'\), _all\.join\('\\n'\), \{ replace: true \}\);/.test(JS), 'better than the top level files every top-level criterion as met — the criteria box is never left empty beside a top mark (#691)');
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
ok(/_ladderFeedPrediction\(next\.q, next\.key, res\.mark\)/.test(JS) && /_setPredicted\(key, Math\.round\(sum\)\)/.test(JS), 'the own mark feeds the existing calibration path (_ladderFeedPrediction → _setPredicted, summed per question — v7.20.633)');
['protocols/aqa/language1/modules/protocol-a-assessment.md', 'protocols/aqa/language2/modules/protocol-a-assessment.md', 'protocols/aqa/unseen/modules/protocol-a-assessment-unseen.md'].forEach((rel) => {
    const md = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\s+/g, ' ');
    ok(/THE STUDENT'S OWN MARKS/.test(md) && /never let their mark move yours/.test(md), rel.split('/')[2] + ' protocol: own marks supersede the panel prediction; their mark never moves Sophia\'s');
});

// ── F · §4d liveness on a resumed wrap ──────────────────────────────────────────────────────
console.log('\nF · a resumed wrap re-enters the host');
ok(/else if \(cfg && cfg\.walkId === LADDER_SA_WALK\)/.test(ladderSrc) && /_ladderHostRenderCurrent\(\)/.test(ladderSrc), 'wrap without a live onDone (after reload) calls the host again');

// ── G · v7.20.632 (#577) — the ladder REPLACES the in-chat reflection panel ──────────────────
console.log('\nG · the in-chat reflection panel is removed wherever the ladder exists');
const ROUTER = fs.readFileSync(path.join(ROOT, 'includes', 'class-protocol-router.php'), 'utf8');
ok(/function _ladderReplacesReflect\(\)/.test(JS), 'ONE predicate: _ladderReplacesReflect');
const rri = JS.slice(JS.indexOf('function _renderReflectInto('), JS.indexOf('function _taskUsesReflectPanel'));
ok(/if \(_ladderReplacesReflect\(\)\)/.test(rri) && /return true;/.test(rri), 'the renderer never draws the panel in a ladder session');
ok(/there is NO reflection panel in this session/.test(rri) && /Continue now with STEP 2a/.test(rri), '…and fires a continue directive instead (§4d — the next thing on screen is the Y gate)');
ok(/_reflectLadderRepaired\[_lk\] = true/.test(rri), '…at most once per question (no loop)');
ok(/_reflectLadderRepaired = \{\};/.test(JS.slice(JS.indexOf('_reflectDone = {}; _reflectPending = null;'))), 'the once-flag resets with the other reflection state');
// v7.20.712: a planning branch now comes first (planning has no reflection panel at all); the ladder branch it guards is unchanged.
ok(/chatTextarea\.value = (?:state\.task === 'planning'\s*\?\s*`[^`]*`\s*:\s*)?_ladderReplacesReflect\(\)\s*\?/.test(JS), 'the ✓-continue directive stops demanding STEP 1 in a ladder session');
// v7.20.702 (#619): the first gated question is the PAPER's (_firstGatedQ — Q2 on AQA, Q4 on IGCSE P1, Q1 on IGCSE P2)
ok(/_ladderReplacesReflect\(\) && \(out\.indexOf\('@FB_BEGIN\{"q":"' \+ _fq \+ '","para":"1"'\)/.test(JS)
    && /const _fq = _firstGatedQ\(\);/.test(JS) && /function _firstGatedQ\(\)/.test(JS), 'the penalty ledger resets at the first CARD when there is no first gate (the paper\'s first gated question)');
ok(/private function ladder_marks_in_history\(\)/.test(ROUTER), 'router: ladder_marks_in_history() (chat-truth, no board literal)');
ok((ROUTER.match(/\$this->ladder_marks_in_history\(\)/g) || []).length >= 3, 'router: used at the metacog mandate, the setup-phase gate and the per-question reflection directive');
ok(/NO IN-CHAT REFLECTION IN THIS SESSION/.test(ROUTER) && /\} else \{\s*\n\s*\$preamble \.= "### ⛔ METACOGNITIVE REFLECTION CYCLE/.test(ROUTER), 'router: the three reflection mandates are SKIPPED in a ladder session, not merely contradicted');
ok(/REFLECTION — \{\$current\}: there is NO reflection panel in this session/.test(ROUTER), 'router: the per-question directive says "no panel" instead of demanding one');
['protocols/aqa/language1/modules/protocol-a-assessment.md', 'protocols/aqa/language2/modules/protocol-a-assessment.md', 'protocols/aqa/unseen/modules/protocol-a-assessment-unseen.md'].forEach((rel) => {
    const md = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const step1 = md.match(/^\*\*STEP 1 — Reflection panel/gm) || [];
    const skipped = md.match(/^\*\*STEP 1 — Reflection panel[^\n]*Skipped entirely when THE STUDENT'S OWN MARKS are present/gm) || [];
    ok(step1.length > 0 && skipped.length === step1.length, rel.split('/')[2] + ': every STEP 1 (' + step1.length + ') is marked skipped when the own marks are present');
    ok(/AND THERE IS NO REFLECTION PANEL IN THAT SESSION/.test(md), rel.split('/')[2] + ': the OWN-MARKS note carries the no-panel law');
    ok(/Metacognitive journey[^\n]*their own level \+ mark per question vs actual/.test(md), rel.split('/')[2] + ': the Final Summary journey reads their own marks, not a self-rating pattern');
});
// The panel STAYS where no ladder exists: lit + poetry keep every gate untouched.
['protocols/aqa/literature/modules/protocol-a-assessment.md', 'protocols/aqa/poetry/modules/protocol-a-assessment-poetry.md'].forEach((rel) => {
    const md = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    ok(/@REFLECT_GATE\{/.test(md) && !/Skipped entirely when THE STUDENT'S OWN MARKS/.test(md), rel.split('/')[2] + ': no ladder → the reflection panel stays (untouched)');
});

// ── H · v7.20.633 (#580) — the ladder feeds the document's Predicted·Actual row PER QUESTION ─────
console.log('\nH · the prediction is the SUM of a question\'s schemes; the calibration actual is per scheme');
ok((JS.match(/_ladderFeedPrediction\(/g) || []).length >= 3, 'both hand-off sites (host onDone + controller resume) feed through _ladderFeedPrediction');
ok(!/_setPredicted\(qNum, res\.mark\)/.test(JS), 'no site feeds a single scheme\'s mark straight into the per-question prediction any more');
ok(/actual: _calibActualFor\(k\.q, k\.ao, k\.max\)/.test(JS), '_calibGroups asks for the SCHEME\'s actual (q, ao, max)');
{
    const sl = (name) => { const i = JS.indexOf('    function ' + name + '('); let d = 0; for (let k = JS.indexOf('{', i); k < JS.length; k++) { if (JS[k] === '{') d++; else if (JS[k] === '}') { d--; if (!d) return JS.slice(i, k + 1); } } return ''; };
    const rows = {};   // fieldId → text, the document's ladder rows
    const secs = [];   // feedback sections: { label, text }
    const store = {};
    const ctx = {
        window: { WML_MARK_SCHEMES: data }, state: { board: 'aqa', subject: 'language', text: 'aqa_lang_paper_1', attempt: 1 },
        location: { pathname: '/t' }, console,
        localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
        document: {
            querySelector: (sel) => { const m = /data-field-id="([^"]+)"/.exec(sel); return (m && m[1] in rows) ? { textContent: rows[m[1]] } : null; },
            getElementById: () => ({ querySelectorAll: () => secs.map((x) => ({ getAttribute: () => x.label, textContent: x.text })) }),
        },
    };
    vm.createContext(ctx);
    vm.runInContext(kbSrc + sl('_ladderFids') + sl('_ladderOneSentence') + sl('_ladderRowText') + sl('_ladderHostGroups') + sl('_paraKey') + sl('_calibDocKey') + sl('_predKey')
        + sl('_predFromDoc') + sl('_predFromChat')
        + sl('_getPredicted') + sl('_setPredicted') + sl('_ladderFeedPrediction') + sl('_calibActualFor'), ctx);
    const run = (code) => vm.runInContext(code, ctx);
    run("_ladderFeedPrediction('Q2', 'aqa_lang1_q2_ao2', 6)");
    ok(run("_getPredicted('2')") === 6 && run("_getPredicted(2)") === 6, 'Q2 (one scheme): prediction 6, readable by the doc row (string key) and the sidebar (number key)');
    run("_ladderFeedPrediction('Q5', 'aqa_lang1_q5_ao5', 18)");
    ok(run("_getPredicted('5')") === null, 'Q5 after AO5 only: NO prediction yet (AO6 not marked) — never a per-AO mark against a /40 box');
    rows['sa-ms-aqa_lang1_q5_ao5-mark'] = '18 / 24';
    run("_ladderFeedPrediction('Q5', 'aqa_lang1_q5_ao6', 14)");
    ok(run("_getPredicted('5')") === 32, 'Q5 after AO6: prediction = 18 + 14 = 32 (the sum, against the /40 box) — got ' + run("_getPredicted('5')"));
    // v7.20.650 (#634): the prediction is READ FROM THE DOCUMENT — the tutor's browser (and any
    // other device) has no localStorage entry, which is exactly why Neil saw "Predicted —".
    rows['sa-ms-aqa_lang1_q3_ao2-mark'] = '6 / 8';
    ok(run("_getPredicted('3')") === 6, 'Q3 with NO cached prediction: 6 read straight from the document row (tutor view / another device)');
    rows['sa-ms-aqa_lang1_q5_ao6-mark'] = '12 / 16';
    ok(run("_getPredicted('5')") === 30, 'Q5 both rows in the document: 18 + 12 = 30 — the document outranks this browser\'s cached 32');
    store['swml_pred:/t:a1:Q1'] = '4';
    ctx.state.reviewMode = true;
    ok(run("_getPredicted('1')") === null, 'review mode never reads this browser\'s cache (a tutor would be shown another student\'s prediction)');
    ctx.state.reviewMode = false;
    ok(run("_getPredicted('1')") === 4, 'CONTROL: outside review mode the cached value still serves');
    ctx._canvasHistoryHook = () => [{ role: 'user', content: 'Predicted Q4 mark: 12/20. Self-rating: 3/5.' }];
    ok(run("_getPredicted('4')") === 12, 'no ladder rows for Q4 → the transcript\'s own reflect line "Predicted Q4 mark: 12/20" (server-held)');
    ctx._canvasHistoryHook = null;
    secs.push({ label: 'Feedback: Q2 (5 / 8)', text: 'Mark Breakdown …' });
    secs.push({ label: 'Feedback: Q5 (30 / 40)', text: 'Holistic marks: Content & Organisation (AO5): 17/24 — sits in the upper band. Technical Accuracy (AO6): 13/16 — Level 3.' });
    const a2 = run("_calibActualFor('Q2', 'AO2', 8)"), a5 = run("_calibActualFor('Q5', 'AO5', 24)"), a6 = run("_calibActualFor('Q5', 'AO6', 16)");
    ok(a2 && a2.mark === 5 && a2.max === 8, 'Q2 actual: 5 / 8 from the box label (whole-question scheme, unchanged)');
    ok(a5 && a5.mark === 17 && a5.max === 24, 'Q5 AO5 actual: 17 / 24 from the card text, never 30 / 24 — got ' + JSON.stringify(a5));
    ok(a6 && a6.mark === 13 && a6.max === 16, 'Q5 AO6 actual: 13 / 16 from the card text — got ' + JSON.stringify(a6));
    secs[1].text = 'Holistic marks: (pending)';
    ok(run("_calibActualFor('Q5', 'AO5', 24)") === null, 'Q5 box filled but the AO lines not yet → not ready (null), never the /40 total');
}

console.log('\nI · the calibration chips land where the card is (v7.20.638, #597)');
{
    const cc = (JS.match(/function _calibChips\(options, onPick\)\s*\{([\s\S]*?)\n    \}/) || [])[1] || '';
    ok(!!cc, '_calibChips exists');
    ok(/const host = \(_chatShell && _chatShell\.messages\)/.test(cc), 'the chips attach to the registered chat container — the one the card was written into');
    ok(!/const host = document\.querySelector\('\.swml-chat-messages'\)/.test(cc), 'never the bare .swml-chat-messages lookup: it matches NOTHING on a canvas page (measured on staging), so the chips never rendered and the student was stuck');
    ok(/swml-canvas-chat-messages/.test(cc), 'falls back to the canvas chat by id');
    ok(/className: 'swml-canvas-chat-messages', id: 'swml-canvas-chat-messages'/.test(JS), 'CONTROL: the canvas chat really is .swml-canvas-chat-messages (not .swml-chat-messages)');
}

// ── J · v7.20.673 (#683/#684) — Literature: one whole-essay calibration; the AO-only card ─────
console.log('\nJ · Literature under the mark scheme — one comparison, the AO-only card, chat-truth sessions');
{
    const sl = (name) => { const i = JS.indexOf('    function ' + name + '('); if (i === -1) return ''; let d = 0; for (let k = JS.indexOf('{', i); k < JS.length; k++) { if (JS[k] === '{') d++; else if (JS[k] === '}') { d--; if (!d) return JS.slice(i, k + 1); } } return ''; };
    const constLine = (name) => (JS.match(new RegExp('    const ' + name + ' = [^\\n]*\\n')) || [''])[0];
    const rows = {}, secs = [];
    let history = [];
    const ctx = {
        window: { WML_MARK_SCHEMES: data }, state: { board: 'aqa', subject: 'shakespeare', text: 'macbeth' }, console,
        document: {
            querySelector: (sel) => { const m = /data-field-id="([^"]+)"/.exec(sel); return (m && m[1] in rows) ? { textContent: rows[m[1]] } : null; },
            getElementById: () => ({ querySelectorAll: () => secs.map((x) => ({ getAttribute: () => x.label, textContent: x.text || '' })) }),
        },
        _canvasHistoryHook: () => history,
    };
    vm.createContext(ctx);
    vm.runInContext(constLine('LIT_CALIB_KEY') + kbSrc
        + ['_litLadderKeepsAoCard', '_ladderFids', '_ladderOneSentence', '_ladderRowText', '_calibFids', '_calibActualFor', '_ladderMarksInHistory', '_reflectAoOnly',
           '_ladderReplacesReflect', '_ladderIsLit', '_litEssayActual', '_litCalibGroup', '_calibGroups'].map(sl).join('\n'), ctx);
    const run = (code) => vm.runInContext(code, ctx);

    rows['sa-ms-aqa_lit_p1_ao123-mark'] = '22 / 30';
    rows['sa-ms-aqa_lit_p1_ao123-level'] = 'Level 5 · Middle of this level';
    rows['sa-ms-aqa_lit_p1_ao123-reason'] = 'my thesis runs through every paragraph';
    rows['sa-ms-aqa_lit_ao4-mark'] = '3 / 4';
    [['Introduction', '2.5 / 3'], ['Body 1', '6 / 8'], ['Body 2', '6.5 / 8'], ['Body 3', '5 / 8'], ['Conclusion', '5 / 7']]
        .forEach(([s, m]) => secs.push({ label: 'Feedback: ' + s + ' (' + m + ')' }));
    let g = run('_calibGroups()');
    ok(g.length === 1 && g[0].key === 'aqa_lit_essay', 'Literature calibrates ONCE, for the whole essay — got ' + g.length + ' group(s)');
    ok(g[0].mineNum === 25 && g[0].max === 34, 'the student\'s own mark = AO1–AO3 22 + AO4 3 = 25 / 34 — got ' + g[0].mineNum + ' / ' + g[0].max);
    ok(g[0].actual && g[0].actual.mark === 25 && g[0].actual.max === 34, 'Sophia\'s = 2.5 + 6 + 6.5 + 5 + 5 = 25 / 34, same scale, no conversion — got ' + JSON.stringify(g[0].actual));
    ok(g[0].myLevel === 'Level 5 · Middle of this level' && /thesis/.test(g[0].myWhy), 'the level and reason shown are the AO1–AO3 ladder\'s');
    secs[3].label = 'Feedback: Body 3 (— / 8)';
    ok(run('_calibGroups()')[0].actual === null, 'one paragraph still unmarked → Sophia\'s total is NOT ready (null), never a partial sum');
    secs[3].label = 'Feedback: Body 3 (5 / 8)';
    const _conc = secs.pop();
    ok(run('_calibGroups()')[0].actual === null, 'a paragraph box MISSING (boxes total /27, scheme /34) → no comparison, never a rescaled "plausible" mark');
    secs.push(_conc);
    ctx.state.subject = '19th_century'; ctx.state.text = 'christmas_carol';
    secs.length = 0;
    [['Introduction', '2 / 3'], ['Body 1', '5 / 7'], ['Body 2', '5 / 7'], ['Body 3', '4.5 / 7'], ['Conclusion', '4 / 6']]
        .forEach(([s, m]) => secs.push({ label: 'Feedback: ' + s + ' (' + m + ')' }));
    g = run('_calibGroups()');
    ok(g[0].max === 30 && g[0].mineNum === 22 && g[0].actual && g[0].actual.max === 30 && g[0].actual.mark === 21,
        '19th century: 22 / 30 vs 20.5 → 21 / 30 — the AO4 row is not in its sum — got ' + JSON.stringify({ mine: g[0].mineNum, max: g[0].max, act: g[0].actual }));
    ctx.state.subject = 'language'; ctx.state.text = 'aqa_lang_paper_1';
    ok(run('_calibGroups()').length === 5, 'CONTROL: Language still calibrates per question × AO (5 groups)');

    // the session predicates — chat-truth, the same evidence as the server's ladder_marks_in_history()
    const handOff = { role: 'user', hidden: true, content: "SYSTEM (not from the student): … THE STUDENT'S OWN MARKS (their level, their mark…):\n- Essay AO1 + AO2 + AO3: Level 5 · 22 / 30" };
    ctx.state.subject = 'shakespeare'; ctx.state.text = 'macbeth'; history = [];
    ok(run('_ladderMarksInHistory()') === false && run('_reflectAoOnly()') === false && run('_ladderReplacesReflect()') === false,
        'no hand-off in the chat (a session that began before the ladder) → the OLD card, exactly what the server still expects');
    history = [handOff];
    ok(run('_reflectAoOnly()') === true && run('_ladderReplacesReflect()') === false, 'Literature after the hand-off → the AO-only card (not removed)');
    ctx.state.subject = 'language'; ctx.state.text = 'aqa_lang_paper_1';
    ok(run('_reflectAoOnly()') === false && run('_ladderReplacesReflect()') === true, 'Language after the hand-off → no card at all (§39, unchanged)');
    ok(/function _ladderReplacesReflect\(\) \{ try \{ return _ladderMarksInHistory\(\) && !_reflectAoOnly\(\); \}/.test(JS),
        '_ladderReplacesReflect no longer reads the live editor DOM (Mishel 1237: it read FALSE after she had walked the ladder)');
    // THE ONE SWITCH (server LIT_LADDER_AO_CARD → swmlConfig.litLadderAoCard): off → Literature gets NO card.
    ctx.state.subject = 'shakespeare'; ctx.state.text = 'macbeth';
    ctx.window.swmlConfig = { litLadderAoCard: '0' };
    ok(run('_reflectAoOnly()') === false && run('_ladderReplacesReflect()') === true, "switch '0' → the Literature card is removed entirely (§39 path)");
    ctx.window.swmlConfig = { litLadderAoCard: '1' };
    ok(run('_reflectAoOnly()') === true, "switch '1' → the AO-only card");
    delete ctx.window.swmlConfig;

    const panel = JS.slice(JS.indexOf('    function _renderReflectPanel('), JS.indexOf('    function _renderReflectPanel(') + 16000);
    ok(/const aoOnly = _reflectAoOnly\(\);/.test(panel) && /const showPredict = !aoOnly && /.test(panel), 'the card: no mark-prediction row in a Literature mark-scheme session');
    ok(/if \(!aoOnly\) wrap\.appendChild\(rateWrap\);/.test(panel), 'the card: no 1–5 self-rating row either');
    ok(/const ok = \(aoOnly \|\| rating != null\)/.test(panel), 'the card: Submit needs only an AO or a line of text (no rating to wait for)');
    ok(/msg = 'AO targeting: ' \+ \(aoStr \|\| 'not chosen'\) \+ '\.' \+ \(detail \? ' What I was trying to show: ' \+ detail : ''\);/.test(panel),
        'the card sends ONE labelled line — the shape the protocol\'s MARK-SCHEME SESSION rule reads');
    // v7.20.682 (#702): no "Predicted —" placeholders still — but where the student RATED the paragraph's parts,
    // their ratings as a mark sit beside the actual ("Your rating ≈ x · Actual y · Δ"); unrated → Actual only.
    ok(/\(_pred == null && _ladderIsLit\(\)\) \? litTxt/.test(JS) && /let litTxt = actTxt;/.test(JS) && /if \(_pred == null && _ratingPred != null\)/.test(JS),
        'a Literature card never shows "Predicted —"; it shows the student\'s ratings as a mark where they rated, else Actual only (#702)');
    ok(/g\.key === LIT_CALIB_KEY \? 'five paragraph marks, added up'/.test(JS), 'the comparison card says how Sophia\'s number was made');
    ok(/if \(r && r\.min === r\.max\) \{/.test(JS), 'a one-mark level (AO4 High / Threshold) is filed without a pointless top/middle/bottom question');
    ok(/if \(_r\.length && _r\[_r\.length - 1\]\.level === step\.level\.level\) \{?\s*st\.stoppedAt = step\.level\.level;/.test(JS),
        'a top-out ("better than the top level") records WHERE it stopped — it used to file "Level null", no mark, and re-open the same question');
}

console.log('\n' + (fail ? '❌' : '✅') + ' assess-ladder-host-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
