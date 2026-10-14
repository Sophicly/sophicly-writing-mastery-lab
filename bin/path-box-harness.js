#!/usr/bin/env node
/* eslint-env node */
/**
 * path-box-harness.js — v7.20.879 (PEDAGOGY §32b): the "Where you are" box at the top of the Action Plan.
 *
 * Neil (14 Oct): "he needs to be aware that that's his issue" — and the order: "if you're under a grade 7 … your
 * priority is especially going to be structure … grade seven plus, it becomes about the details … they need to know
 * the criteria … as well." Round y: two structure counts, bullet form. Round z: take the Mark Scheme Assessment and
 * the self-assessment into account, by CODE (no extra API call).
 *
 * What it proves, from the SHIPPED code (the pure core is sliced between its sentinels, never copied):
 *   A. SHAYAAN  — his real P&C card rows (numbers + the protocol's criterion names only — no essay text), ratings
 *                 and Mark Scheme Assessment give the box worked out by hand from the rows: structure first (the
 *                 conclusion is missing; Introduction and Body 1 have fewer than half their parts working), the
 *                 criteria behind it (Context and Evidence rated Good, earning 17% and 50%), and his MSA line.
 *                 Score cells are "0/0.5" (score/worth) — read through _cardScoreCell.
 *   B. ORDER    — a complete structure is never named; below Grade 7 the criteria (or details) come first; from
 *                 Grade 7 the details, with the criteria behind; a Grade-8 essay with a missing paragraph still
 *                 starts with structure (the grade sets the order, the evidence decides).
 *   C. LANGUAGE — the real AQA Lang P1 card shape (staging, test student 1938, 14 Oct): "Q2 — Paragraph 1",
 *                 "Q4 — Introduction" … "Q4 — Conclusion", "Qn — Question Total"; Q1 (Retrieval) and Q5 (Creative
 *                 Writing) have no paragraph blocks and are skipped; Q4's two "not submitted" blocks are named.
 *   D. CRITERIA — the Calibration own-mark line fires only beyond the tolerance; the MSA alone never names the step.
 *   E. WORDS    — the closing-turn fact (what Sophia is told) and its absence when there is no step.
 *   F. WIRING   — the firewalled slot, the refresh hooks, the load, the closing-turn swaps, the server read and its
 *                 key-match with the quiz engine's writer.
 *   G. FALSIFY  — five mutations of the real source (drop the paragraph count, flip the grade rule, read scores
 *                 without the score/worth form, drop "not submitted", drop the intro/conclusion headings) each make
 *                 A–D fail. A harness that passes on a broken rule is not a gate.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const SB = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-section-block.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-canvas.css'), 'utf8');
const REST = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');
const QE = fs.readFileSync(path.join(ROOT, 'includes', 'class-quiz-engine.php'), 'utf8');

// ── load the pure core of a given source ────────────────────────────────────────────────────
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
    vm.runInContext(slice('PATH-BOX-PURE-BEGIN', 'PATH-BOX-PURE-END')
        + '\nthis.P = { pathBoxModel, _pathFactText, _pathRowOf, _pathBlockOf, _pathCardUnits, PATH_STEPS, PATH_SELF_MIN, PATH_ACT_MAX, PATH_GAP_MIN, _gapSkillFor, _pathHowLine };', ctx);
    return ctx.P;
}

// ── fixtures: NUMBERS ONLY (criterion names are the protocol's own wording) ────────────────
// A card line as the document shows it (the "why" cell is a dash — no student text in this file).
const line = (c, w, s, slash) => c + ' — ' + w + ' · ' + (slash ? s + '/' + w : s) + ' · –';
const litCard = (rows, slash) => ['Criterion — Worth · Your Score · Why'].concat(rows.map((r) => line(r[0], r[1], r[2], slash)));

// A. Shayaan 1397 — AQA Power & Conflict, first diagnostic → assessment (prod, 13 Oct). Scores written "0/0.5".
const SH_INTRO = [['Comparative hook (AO1/AO3)', '0.5', '0'], ['Building sentence: comparative context (AO3)', '0.5', '0'],
    ['Building sentence: context shapes themes differently (AO3)', '0.5', '0'], ['Comparative thesis (AO1)', '1.5', '0.75']];
const shBody = (ts, tt, ev, iq, ca, ef, ip, ap, cx, kind) => [
    ['Comparative topic sentence (' + kind + ')', '0.5', ts], ['Technical terminology (' + kind + ', both poems)', '0.5', tt],
    ['Strategic evidence (both poems)', '0.5', ev], ['Integrated quotes', '0.5', iq], ['Close analysis (both poems, ' + kind + ')', '1.5', ca],
    ['Comparative effects (differentiated)', '1.0', ef], ['Technique interplay', '0.5', ip], ["Comparative author's purpose", '1.0', ap],
    ['Comparative context', '1.0', cx]];
const SH_B1 = shBody('0', '0', '0', '0.5', '0.75', '0.25', '0', '0.25', '0', 'FORM');
const SH_B2 = shBody('0', '0.25', '0', '0.5', '0.5', '0.25', '0.25', '0.25', '0.25', 'STRUCTURE');
const SH_B3 = shBody('0.25', '0.25', '0', '0.5', '0.75', '0.25', '0.25', '0.25', '0.25', 'LANGUAGE');
const SH_CONC = [['Restated comparative thesis (AO1)', '1.0', '0'], ['Synthesized central comparative concept (AO1)', '1.0', '0'],
    ["Synthesized both poets' methods/purposes (AO1/AO2)", '1.5', '0'], ['Universal comparative message (AO1)', '1.5', '0'],
    ['Final evaluative judgement (AO1)', '1.0', '0']];
const SH_RATINGS = [['Introduction', 'Hook', 2], ['Introduction', 'Building Sentences', 3], ['Introduction', 'Thesis', 1],
    ['Body Paragraphs', 'Topic Sentence', 1], ['Body Paragraphs', 'Technical Terms', 2], ['Body Paragraphs', 'Evidence', 4],
    ['Body Paragraphs', 'Close Analysis', 3], ['Body Paragraphs', 'Effects on Reader', 3], ['Body Paragraphs', "Author's Purpose", 2],
    ['Body Paragraphs', 'Context', 4], ['Conclusion', 'Restated Thesis', 1], ['Conclusion', 'Controlling Concept', 4],
    ['Conclusion', 'Central Purpose', 2], ['Conclusion', 'Universal Message', 4], ['Academic Writing', 'Language Sophistication', 4],
    ['Academic Writing', 'Vocabulary Precision', 2], ['Academic Writing', 'Sentence Structure', 2], ['Academic Writing', 'Discourse Markers', 1]]
    .map((r) => ({ group: r[0], skill: r[1], value: r[2] }));

// C. 1938 staging AQA Lang P1 (test student): the card lines, block by block.
const LANG = {
    Q1: ['Q1 — Retrieval', 'Total: 4/4', 'Q1 — Question Total', 'Q1 Total: 4/4'],
    Q2: ['Q2 — Paragraph 1', 'Your paragraph (referenced): –', 'Mark Breakdown', 'Criterion — Worth · Your Score · Why',
        line("Conceptual topic sentence introducing the paragraph's idea", '0.5', '0.5'), line('Technique named + integrated quote + inference', '1.0', '0.5'),
        line('Detailed, perceptive word-level close analysis', '0.5', '0.5'), line('First detailed sentence evaluating effects on reader', '0.5', '0'),
        line('Second detailed sentence evaluating effects on reader', '0.5', '0'), line("Perceptive evaluation of author's purpose", '1.0', '0.5'),
        'Total Mark for Paragraph 1: 1/4', 'Your Paragraph Rewritten to Gold Standard', '–',
        'Q2 — Paragraph 2', 'Criterion — Worth · Your Score · Why',
        line("Conceptual topic sentence introducing the paragraph's idea", '0.5', '0.25'), line('Technique named + integrated quote + inference', '1.0', '0.75'),
        line('Detailed, perceptive word-level close analysis', '0.5', '0.5'), line('First detailed sentence evaluating effects on reader', '0.5', '0.5'),
        line('Second detailed sentence evaluating effects on reader', '0.5', '0'), line("Perceptive evaluation of author's purpose", '1.0', '0.5'),
        'Total Mark for Paragraph 2: 1.5/4', 'Q2 — Question Total', 'Q2 Total: 3/8', 'A) Paragraph 1', 'B) Paragraph 2'],
    Q4: ['Q4 — Introduction', 'Introduction — not submitted.', '–', 'Total Mark for Introduction: 0/1', 'Optimal Gold Standard Model', '–',
        'Q4 — Body Paragraph 1', 'Criterion — Worth · Your Score · Why',
        line('Topic sentence addresses evaluative keywords + links to thesis', '1.0', '0.5'), line('Integrated quotes &amp; supporting evidence', '0.5', '0.25'),
        line('Accurate technical terminology', '0.5', '0'), line('Analysis links to topic sentence', '0.5', '0.25'), line('Perceptive close analysis', '1.0', '0.25'),
        line('First detailed sentence evaluating effects', '0.75', '0.5'), line('Second detailed sentence evaluating effects', '0.75', '0'),
        line("Evaluates author's purpose against the statement", '1.0', '0.5'), 'Total Mark for Body Paragraph 1: 0.75/6',
        '2. Add a second reader-effect sentence (+0.5) — this is now a pattern across three paragraphs',
        'Q4 — Body Paragraph 2', line('Topic sentence addresses evaluative keywords + links to thesis', '1.0', '0.5'),
        line('Accurate technical terminology', '0.5', '0.5'), line('Perceptive close analysis', '1.0', '0.5'),
        line('Second detailed sentence evaluating effects', '0.75', '0'),
        'Q4 — Body Paragraph 3', line('Topic sentence addresses evaluative keywords + links to thesis', '1.0', '0.5'),
        line('Accurate technical terminology', '0.5', '0.5'), line('Perceptive close analysis', '1.0', '0.25'),
        line('Second detailed sentence evaluating effects', '0.75', '0'),
        'Q4 — Conclusion', 'Conclusion — not submitted.', 'Total Mark for Conclusion: 0/1',
        'Q4 — Question Total', 'Q4 Total: 4/20', 'A) Body Paragraph 1', 'B) Body Paragraph 2', 'C) Body Paragraph 3'],
    Q5: ['Q5 — Creative Writing', 'AO5 content and organisation: 17/24', 'Q5 — Question Total', 'Q5 Total: AO5 17/24 + AO6 10/16 = 27/40'],
};

// A complete five-paragraph essay: every paragraph has most of its parts working.
const FULL_BODY = [['Topic sentence links to thesis and question (AO1)', '0.5', '0.5'], ['Technique + anchor quotation + inference, in one sentence (AO2/AO1)', '1', '0.5'],
    ['Quotation integrated into the sentence (AO1)', '0.5', '0.5'], ['Fine-grained close analysis of words, sounds and punctuation (AO2)', '1', '0.5'],
    ['First detailed sentence on reader effects (AO2)', '0.5', '0.25'], ['Second detailed sentence on reader effects (AO2)', '0.5', '0'],
    ["Evaluates author's purpose (AO1)", '1', '0.5'], ["Context drives author's choices (AO3)", '1', '0.25']];
const FULL_INTRO = [['Compelling hook that establishes an intriguing concept (AO1/AO3)', '0.5', '0.5'], ['Building sentence(s) that establishe(s) contextual backdrop (AO3)', '0.5', '0.25'],
    ['Building sentence(s) that evaluate(s) how context shapes themes (AO3)', '0.5', '0.25'], ['Clear, precise three-point thesis (AO1)', '1.5', '1']];
const FULL_CONC = [['Restates thesis (AO1)', '1', '0.5'], ['Evaluates controlling concept (AO1)', '1', '0.5'], ['Links concept to key techniques (AO1/AO2)', '1', '0.25'],
    ["Author's central purpose (AO1)", '1', '0.5'], ['Universal message (AO1)', '1', '0']];

function run(P, verbose) {
    let pass = 0, fail = 0;
    const ok = (cond, msg) => { if (cond) { pass++; if (verbose) console.log('  ✓ ' + msg); } else { fail++; if (verbose) console.log('  ✗ ' + msg); } };
    const say = (s) => { if (verbose) console.log(s); };
    const blk = (label, group, rows, slash) => { const b = P._pathBlockOf(litCard(rows, slash)); return { label, part: label, group, rows: b.rows, notSubmitted: b.notSubmitted }; };
    const essay = (units, written, extra) => Object.assign({ answers: [{ label: 'Your essay', lit: true, needed: 5, written, units }] }, extra || {});
    const fullUnits = () => [blk('Introduction', 'Introduction', FULL_INTRO), blk('Body 1', 'Body Paragraphs', FULL_BODY), blk('Body 2', 'Body Paragraphs', FULL_BODY),
        blk('Body 3', 'Body Paragraphs', FULL_BODY), blk('Conclusion', 'Conclusion', FULL_CONC)];

    // ── A · SHAYAAN ─────────────────────────────────────────────────────────────────────────
    say('\nA · Shayaan 1397 — the box worked out by hand from his rows');
    const shUnits = [blk('Introduction', 'Introduction', SH_INTRO, true), blk('Body 1', 'Body Paragraphs', SH_B1, true),
        blk('Body 2', 'Body Paragraphs', SH_B2, true), blk('Body 3', 'Body Paragraphs', SH_B3, true), blk('Conclusion', 'Conclusion', SH_CONC, true)];
    ok(shUnits.every((u) => u.rows.length) && shUnits[1].rows.length === 9, 'every "0/0.5" score cell reads (score/worth through _cardScoreCell) — Body 1 has its 9 rows');
    const sh = P.pathBoxModel(essay(shUnits, 4, { grade: 2, ratings: SH_RATINGS, calib: [], msa: { score: 14, max: 20, categories: ['AO3', 'AO1'] } }));
    const SH_WANT = [
        'Your first step: **Practise the structure**.',
        'Your essay has 4 of its 5 paragraphs: the conclusion is missing.',
        'Introduction: 1 of 4 parts earning marks. Not yet working: Hook and Building Sentences.',
        'Body 1: 4 of 9 parts earning marks. Not yet working: Topic Sentence, Technical Terms, Evidence and 2 more.',
        'Behind it: **Understand the criteria**.',
        'You rated your Context Good (4 of 5). It earned 17% of its marks.',
        'You rated your Evidence Good (4 of 5). It earned 50% of its marks.',
        'In your Mark Scheme Assessment (14 out of 20), the questions you got wrong were about AO3 and AO1.',
        'How: trust the process. Your redraft lessons (planning, outlining, then polishing) take you through your structure, step by step.',
    ];
    ok(!!sh && sh.first === 'structure' && sh.second === 'criteria', 'first step = structure, behind it = criteria');
    ok(!!sh && JSON.stringify(sh.bullets) === JSON.stringify(SH_WANT), 'the nine bullets, exactly (the last is the HOW line)' + (sh && JSON.stringify(sh.bullets) !== JSON.stringify(SH_WANT) ? ' — got ' + JSON.stringify(sh.bullets) : ''));
    ok(!!sh && sh.priority1 === 'write the conclusion', 'priority 1 = write the conclusion (the biggest structural loss)');
    ok(!!sh && !sh.bullets.some((b) => /Controlling Concept|Universal Message/.test(b)), 'ratings for the MISSING conclusion are not compared (nothing was written to compare)');
    ok(!!sh && sh.facts.length === 6 && !sh.facts.some((f) => /\*\*/.test(f)), 'the closing-turn facts are the six evidence lines (no step headings)');

    // ── B · ORDER ───────────────────────────────────────────────────────────────────────────
    say('\nB · the order — the grade sets it, the evidence decides');
    const g5crit = P.pathBoxModel(essay(fullUnits(), 5, { grade: 5, ratings: [{ group: 'Body Paragraphs', skill: 'Context', value: 5 }], calib: [], msa: null }));
    ok(!!g5crit && g5crit.first === 'criteria' && g5crit.second === null, 'Grade 5, complete structure, Context rated 5 earning 25% → criteria first');
    ok(!!g5crit && !g5crit.bullets.some((b) => /structure|paragraphs/i.test(b)), 'a complete structure is never named as the problem');
    ok(!!g5crit && g5crit.bullets[1] === 'You rated your Context Perceptive (5 of 5). It earned 25% of its marks.', 'the criteria bullet names the rating word and the earned share');
    const g5det = P.pathBoxModel(essay(fullUnits(), 5, { grade: 5, ratings: [], calib: [], msa: null }));
    ok(!!g5det && g5det.first === 'details' && g5det.bullets[0] === 'Your first step: **The details**.', 'Grade 5, complete structure, no misreading → the details');
    ok(!!g5det && /^Your structure is complete\. The most marks left are in your /.test(g5det.bullets[1] || ''), 'the details bullet says the structure is complete, then where the marks are');
    const g8 = P.pathBoxModel(essay(fullUnits(), 5, { grade: 8, ratings: [{ group: 'Body Paragraphs', skill: 'Context', value: 5 }], calib: [], msa: null }));
    ok(!!g8 && g8.first === 'details' && g8.second === 'criteria', 'Grade 8, complete structure, a misreading → the details first, the criteria behind');
    ok(!!g8 && g8.bullets[0] === 'Grade 8: your first step is **The details**.', 'a Grade 7+ step line names the grade');
    const g8u = fullUnits(); g8u[4] = blk('Conclusion', 'Conclusion', FULL_CONC.map((r) => [r[0], r[1], '0']));
    const g8miss = P.pathBoxModel(essay(g8u, 4, { grade: 8, ratings: [], calib: [], msa: null }));
    ok(!!g8miss && g8miss.first === 'structure' && g8miss.bullets[1] === 'Your essay has 4 of its 5 paragraphs: the conclusion is missing.', 'Grade 8 with a missing conclusion → still structure first');
    const unclear = P.pathBoxModel(essay(fullUnits(), 3, { grade: 4, ratings: [], calib: [], msa: null }));
    ok(!!unclear && unclear.bullets[1] === 'Your essay has 3 of its 5 paragraphs.', 'two paragraphs short but no card agrees which → counted, never guessed by name');
    ok(P.pathBoxModel(essay([blk('Introduction', 'Introduction', [])], 0, { grade: 3 })) === null && P.pathBoxModel(essay(fullUnits(), 5, { grade: 0 })) === null,
        'nothing marked, or no grade yet → null (the box stays hidden)');
    const zayan = [{ label: 'Introduction', part: 'Introduction', group: 'Introduction', rows: [], notSubmitted: P._pathBlockOf(['Introduction — not submitted.', 'Total Mark for Introduction: 0/3']).notSubmitted }]
        .concat(fullUnits().slice(1));
    const zb = P.pathBoxModel(essay(zayan, 4, { grade: 4, ratings: [], calib: [], msa: null }));
    ok(!!zb && zb.bullets[1] === 'Your essay has 4 of its 5 paragraphs: the introduction is missing.', 'a card with no table that says "not submitted" names the missing paragraph (Zayan 1109\'s shape)');
    ok(P._pathBlockOf(['Criterion — Worth · Your Score · Why', line('Thesis', '1', '0'), 'nothing here was not submitted']).notSubmitted === false,
        '"not submitted" counts only on a card with no mark table');

    // ── C · LANGUAGE ────────────────────────────────────────────────────────────────────────
    say('\nC · a language paper — the card\'s own blocks are the paragraphs');
    const lq = {};
    ['Q1', 'Q2', 'Q4', 'Q5'].forEach((q) => { lq[q] = P._pathCardUnits(LANG[q], q); });
    ok(lq.Q1.length === 0 && lq.Q5.length === 0, 'Q1 (Retrieval) and Q5 (Creative Writing) have no paragraph blocks → skipped (PEDAGOGY §3)');
    ok(lq.Q2.length === 2 && lq.Q2[0].rows.length === 6 && lq.Q2[1].rows.length === 6 && lq.Q2[0].label === 'Q2 · Paragraph 1', 'Q2: two paragraph blocks, six rows each; "Question Total" ends the block');
    ok(lq.Q4.map((u) => u.part).join('|') === 'Introduction|Body Paragraph 1|Body Paragraph 2|Body Paragraph 3|Conclusion'
        && lq.Q4[0].notSubmitted && lq.Q4[4].notSubmitted && lq.Q4[0].group === 'Introduction' && lq.Q4[1].group === 'Body Paragraphs',
        'Q4: Introduction · Body Paragraph 1–3 · Conclusion, the two unwritten ones "not submitted"');
    ok(lq.Q4[1].rows.length === 8, 'a feedback tip ("2. Add … (+0.5) — this is…") is never read as a mark row');
    const ans = ['Q2', 'Q4'].map((q) => ({ label: q, lit: false, needed: lq[q].length, written: lq[q].length - lq[q].filter((u) => u.notSubmitted).length, units: lq[q] }));
    const lb = P.pathBoxModel({ grade: 4, answers: ans, ratings: [], calib: [], msa: null });
    ok(!!lb && lb.first === 'structure' && lb.bullets[1] === 'Q4: you wrote 3 of its 5 paragraphs: the introduction and the conclusion are missing.', 'the box names Q4\'s missing introduction and conclusion');
    ok(!!lb && lb.priority1 === 'write the introduction and the conclusion in Q4', 'priority 1 names the question');
    const lq2short = P._pathCardUnits(LANG.Q2.slice(0, LANG.Q2.indexOf('Q2 — Paragraph 2')).concat(['Q2 — Question Total']), 'Q2');
    const lshort = P.pathBoxModel({ grade: 4, answers: [{ label: 'Q2', lit: false, needed: lq2short.length, written: lq2short.length, units: lq2short }], ratings: [], calib: [], msa: null });
    ok(!!lshort && lshort.first !== 'structure', 'a paragraph the card leaves out altogether is NOT invented from the marks (stays silent — no guess)');

    // ── D · CRITERIA ────────────────────────────────────────────────────────────────────────
    say('\nD · the criteria evidence');
    const over = P.pathBoxModel(essay(fullUnits(), 5, { grade: 4, ratings: [], calib: [{ label: 'your essay', mine: 24, sophia: 15, max: 30, tol: 3 }], msa: null }));
    ok(!!over && over.first === 'criteria' && over.bullets[1] === 'You gave your essay 24 out of 30. It earned 15.', 'their own mark above Sophia\'s by more than the tolerance → the criteria, with the own-mark line');
    ok(!!over && over.priority1 === 'compare your own marking with the mark scheme', 'priority 1 = compare their marking with the mark scheme');
    const within = P.pathBoxModel(essay(fullUnits(), 5, { grade: 4, ratings: [], calib: [{ label: 'your essay', mine: 18, sophia: 15, max: 30, tol: 3 }], msa: null }));
    ok(!!within && within.first === 'details', 'within the tolerance (3 on /30) is agreement — not a misreading');
    const under = P.pathBoxModel(essay(fullUnits(), 5, { grade: 4, ratings: [], calib: [{ label: 'your essay', mine: 8, sophia: 15, max: 30, tol: 3 }], msa: null }));
    ok(!!under && under.first === 'details', 'marking yourself LOWER than Sophia is not a misreading of what the scheme rewards');
    const msaOnly = P.pathBoxModel(essay(fullUnits(), 5, { grade: 4, ratings: [], calib: [], msa: { score: 12, max: 20, categories: ['AO2'] } }));
    ok(!!msaOnly && msaOnly.first === 'details' && msaOnly.bullets.indexOf('In your Mark Scheme Assessment (12 out of 20), the questions you got wrong were about AO2.') !== -1,
        'the Mark Scheme Assessment alone never names the step — its line is still shown');
    const msaFull = P.pathBoxModel(essay(fullUnits(), 5, { grade: 4, ratings: [], calib: [], msa: { score: 20, max: 20, categories: [] } }));
    ok(!!msaFull && !msaFull.bullets.some((b) => /Mark Scheme Assessment/.test(b)), 'full marks in the Mark Scheme Assessment → no line');
    ok(P.PATH_SELF_MIN === 0.7 && P.PATH_ACT_MAX === 0.5 && P.PATH_GAP_MIN === 0.2, 'the thresholds are the blind-spot rule\'s (70 / 50 / 20)');
    // The P&C card wording measured on staging (1938, 14 Oct): a close-analysis row that mentions "quotes".
    ok(P._gapSkillFor('Body Paragraphs', 'Comparative close analysis of BOTH quotes on form') === 'Close Analysis'
        && P._gapSkillFor('Body Paragraphs', 'Integrated comparative quotes, BOTH poems smoothly embedded') === 'Evidence'
        && P._gapSkillFor('Body Paragraphs', 'Strategic comparative evidence from BOTH poems') === 'Evidence',
        'a close-analysis row that mentions "quotes" is Close Analysis, never Evidence');
    const pc = P.pathBoxModel(essay(fullUnits().map((u) => u.group !== 'Body Paragraphs' ? u
        : Object.assign({}, u, { rows: u.rows.concat([{ criterion: 'Comparative close analysis of BOTH quotes on form', worth: 1.5, score: 0 }]) })), 5, { grade: 3, ratings: [], calib: [], msa: null }));
    ok(!!pc && /The most marks left are in your Close Analysis \(Body 1\)/.test(pc.bullets[1] || ''), 'the details bullet names that loss Close Analysis');

    // ── E · WORDS ───────────────────────────────────────────────────────────────────────────
    say('\nE · what Sophia is told');
    const ft = P._pathFactText(sh);
    ok(/CODE-DERIVED WHERE YOU ARE/.test(ft) && /first step is "Practise the structure", and behind it "Understand the criteria"/.test(ft), 'the fact names the step and what is behind it');
    ok(/the FIRST priority MUST be to write the conclusion;/.test(ft) && /Do NOT change any mark, grade or the number of priorities/.test(ft), 'the fact fixes priority 1 and forbids changing marks');
    ok(ft.indexOf(SH_WANT[1]) > 0 && ft.indexOf('**') === -1, 'the evidence lines ride along, without step headings');
    ok(P._pathFactText(null) === '' && P._pathFactText({}) === '', 'no step → no fact (the closing turn is unchanged)');

    // ── H · THE HOW LINE (v7.20.884, PEDAGOGY §65) ──────────────────────────────────────────
    say('\nH · the HOW line — trust the process; after the redraft, the one-grade rule');
    const shH = (how, grade) => P.pathBoxModel(essay(shUnits, 4, { grade: grade, ratings: SH_RATINGS, calib: [], msa: null, how: how }));
    const up = shH({ phase: 'redraft', diagnosticGrade: 2 }, 3), flat = shH({ phase: 'redraft', diagnosticGrade: 3 }, 3), down = shH({ phase: 'redraft', diagnosticGrade: 4 }, 3);
    const unknown = shH({ phase: 'redraft', diagnosticGrade: null }, 3), first = shH({ phase: 'initial', diagnosticGrade: null }, 2);
    ok(!!first && first.how === 'How: trust the process. Your redraft lessons (planning, outlining, then polishing) take you through your structure, step by step.', 'first essay marked → the redraft lessons take you through it');
    ok(!!up && up.how === 'You moved up from Grade 2 to Grade 3. Trust the process: keep working on your structure in your next text.', 'redraft one grade up → the next text');
    ok(!!flat && flat.how === 'Not a grade up yet: Grade 3 in your first essay, Grade 3 in your redraft. Next: another essay on this text, working on your structure. Trust the process.',
        'redraft the SAME grade → another essay on this text (Neil, round ab)');
    ok(!!down && /^Not a grade up yet: Grade 4 in your first essay, Grade 3 in your redraft\./.test(down.how), 'redraft LOWER → another essay on this text, the numbers as they are');
    ok(!!unknown && unknown.how === 'Trust the process: keep working on your structure in your next essay.', 'diagnostic grade unknown → no grade claim (§18)');
    ok(!!up && up.bullets[up.bullets.length - 1] === up.how && up.facts.indexOf(up.how) === -1 && P._pathFactText(up).indexOf('Trust the process') === -1,
        'the HOW line is the last bullet, and never part of what Sophia is told');
    ok(P._pathHowLine('criteria', { phase: 'redraft', diagnosticGrade: 5 }, 6) === 'You moved up from Grade 5 to Grade 6. Trust the process: keep working on what the mark scheme rewards in your next text.'
        && /take you through the details, step by step\.$/.test(P._pathHowLine('details', { phase: 'initial' }, 8)), 'each step names its own work (criteria · details)');
    ok(!!first && !!up && !/will (solve|fix)|guarantee/i.test([first, up, flat, unknown].map((m) => (m && m.how) || '').join(' ')), 'never promises an outcome (§49.5)');

    return { pass, fail };
}

// ── run the shipped source ──────────────────────────────────────────────────────────────────
let total = { pass: 0, fail: 0 };
const ok = (cond, msg) => { if (cond) { total.pass++; console.log('  ✓ ' + msg); } else { total.fail++; console.log('  ✗ ' + msg); } };
let P0;
try { P0 = load(JS); } catch (e) { console.log('  ✗ ' + e.message); process.exit(1); }
const r0 = run(P0, true);
total.pass += r0.pass; total.fail += r0.fail;

// ── F · WIRING ──────────────────────────────────────────────────────────────────────────────
console.log('\nF · wiring');
ok(/if \(type === 'action' && _cvLabel === 'Action Plan'\) \{\s*pathBox = document\.createElement\('div'\);/.test(SB)
    && /pathBox && \(pathBox === mutation\.target \|\| pathBox\.contains\(mutation\.target\)\)\) return true;/.test(SB),
    'the Action Plan carries a firewalled "Where you are" slot (derived display, never a node — §4c.7)');
ok(/if \(pathBox && window\.WML && typeof window\.WML\.renderPathBox === 'function'\) \{\s*window\.WML\.renderPathBox\(\);/.test(SB), 'the NodeView fills it on mount');
ok(/_updateProgressSummary\(\);[^\n]*\n\s*_renderPathBox\(\);/.test(JS), 'every completion recompute re-derives it');
ok(/if \(WML\.hasAssessmentSections && WML\.hasAssessmentSections\(state\.task\)\) \{\s*const m = _pathBoxData\(\);/.test(JS), 'shown only on documents that are marked');
ok(/if \(box\.innerHTML !== html\) box\.innerHTML = html;/.test(JS) && /if \(box\.style\.display !== want\) box\.style\.display = want;/.test(JS), 'idempotent writes (no needless mutation)');
ok(/const b = _pathBlockOf\(_pathPlainLines\(_sectionContentOf\(c\)\)\);/.test(JS) && /const units = _pathCardUnits\(_pathPlainLines\(_sectionContentOf\(card\)\), q\);/.test(JS),
    'the host reads cards through the same pure readers this harness drives');
ok(!/plans\.filter\(\(l\) => new RegExp\('—\\\\s\*' \+ q/.test(JS), 'a language question\'s paragraph count no longer comes from its ONE plan box');
ok(/state\.markSchemeSummary = \(res && res\.markSchemeSummary && res\.markSchemeSummary\.max > 0\) \? res\.markSchemeSummary : null;/.test(JS),
    'the canvas load (student AND tutor review share it) stores the Mark Scheme Assessment summary');
ok(/if \(topMissed && _path && _path\.first\) \{/.test(JS) && /The Action-Plan priorities follow the WHERE YOU ARE step given below; within a step, these losses decide the order\./.test(JS)
    && /The FIRST Action-Plan Priority Target MUST be the biggest loss/.test(JS), 'closing turn: with a step the ranking follows it; without one the v7.19.890 sentence is unchanged');
ok(/if \(bs && _path && _path\.first\) \{/.test(JS) && /Name it inside the priority that fixes that part/.test(JS) && /BLEND this into the FIRST Action-Plan Priority Target/.test(JS),
    'closing turn: the blind spot moves inside its priority only when there is a step');
ok(/_facts \+= _gapCheckFact\(\);[^\n]*\n\s*_facts \+= _pathFactText\(_path\);/.test(JS), 'the step fact rides the closing turn that already happens (no extra call)');
ok(/\.swml-path-box \{/.test(CSS) && /\.swml-section-block\.swml-fb-collapsed > \.swml-path-box \{ display: none !important; \}/.test(CSS), 'styled, and hidden when the Action Plan is collapsed');
ok(/\.swml-path-box-list > li \{ list-style: disc outside; \}/.test(CSS), 'the bullets carry their own marker (the theme\'s ul[class] reset strips an inherited one — measured, staging)');
const defs = REST.split('private function mark_scheme_summary_for(').length - 1, calls = REST.split('$this->mark_scheme_summary_for(').length - 1;
ok(defs === 1 && calls === 5, 'server: one reader, five returns (load main · seed · reseed · tutor review · tutor seed preview, v7.20.886) — got ' + defs + '/' + calls);
const fnS = REST.slice(REST.indexOf('private function mark_scheme_summary_for('), REST.indexOf('Tutor review: load a student'));
ok(/in_array\(\(string\) \$suffix, \['_assessment', '_reassessment'\], true\)/.test(fnS) && /task = 'mark_scheme'/.test(fnS), 'server: marked documents only; the Mark Scheme Assessment rows only');
// KEY-MATCH (root §5d): the categories key the reader builds must be the one the quiz engine writes.
const wr = /\$ck = 'swml_qcats_' \. sanitize_key\(\$accumulator\['quiz_type'\]\) \. '_'\s*\. sanitize_key\(\$accumulator\['board'\]\) \. '_'\s*\. sanitize_key\(\$accumulator\['text'\]\) \. '_' \. \(int\) \$accumulator\['topic_number'\];/.test(QE);
const msaType = /\$ms_task = \(\$quiz_type === 'mark_scheme_assessment'\) \? 'mark_scheme' : 'mark_scheme_unit';/.test(QE);
const rd = /\$ck\s*= 'swml_qcats_mark_scheme_assessment_' \. sanitize_key\(\$board\) \. '_' \. sanitize_key\(\$text\) \. '_' \. \$topic;/.test(fnS);
ok(wr && msaType && rd, 'key-match: swml_qcats_{mark_scheme_assessment}_{board}_{text}_{topic} — writer (persist_weak_categories) == reader');
// v7.20.884 — the HOW line's grades: WML's own grade records, one reader for the box and the components chooser.
const SM = fs.readFileSync(path.join(ROOT, 'includes', 'class-session-manager.php'), 'utf8');
const tgp = REST.slice(REST.indexOf('public static function topic_grade_progress('), REST.indexOf('public static function topic_progress_for_course('));
const tpc = REST.slice(REST.indexOf('public static function topic_progress_for_course('), REST.indexOf('private function topic_progress_for_doc('));
ok(/if \(\$attempt > 1\) \$key \.= '__a' \. \(int\) \$attempt;/.test(SM) && /\$base = SWML_Session_Manager::phase_meta_key\(\$board, \$text, \$topic, \$phase, 1\);/.test(tgp)
    && /\$wpdb->esc_like\(\$base \. '__a'\) \. '%'/.test(tgp), 'key-match: the grade read uses THE phase key builder, re-marks (__aN) included — the same keys complete_phase writes');
ok(/\$diag = \$best\('initial'\);/.test(tgp) && /\$red  = \$best\('redraft'\);/.test(tgp) && /'gradeUp'         => \(\$diag && \$red\) \? \(\$red >= \$diag \+ 1\) : null,/.test(tgp),
    'the server rule: at least one grade up; null when either grade is missing');
ok(/self::canonical_slug\(\$tb\['text'\]\)/.test(tpc) && tpc.indexOf("_redraft(?:__a\\d+)?$/") !== -1 && /return \$p \? array_merge\(\['board' => \$tb\['board'\], 'text' => \$tb\['text'\], 'topic' => \$topic\], \$p\) : null;/.test(tpc),
    'the chooser read: the latest completed redraft in the course\'s text (canonical slug, re-marks included)');
ok(/\$tb\['board'\] = str_replace\('_', '-', \(string\) \$tb\['board'\]\);/.test(tpc) && tpc.indexOf("$tb['board'] = str_replace") < tpc.indexOf("$prefix = 'swml_phase_'"),
    'key-match: the course map\'s underscored board (edexcel_igcse) is hyphenated BEFORE the grade keys are built (measured: grade keys say edexcel-igcse)');
ok(REST.split("'topicProgress'").length - 1 === 5 && /in_array\(\(string\) \$suffix, \['_assessment', '_reassessment', '_fbdiscuss'\], true\)/.test(REST),
    'topicProgress rides the five marked-document returns (load · seed · reseed · tutor review · tutor seed preview, v7.20.886)');
ok(/state\.topicProgress = \(res && res\.topicProgress && typeof res\.topicProgress === 'object'\) \? res\.topicProgress : null;/.test(JS)
    && /how: \{ phase: String\(state\.phase \|\| ''\), diagnosticGrade: \(state\.topicProgress && state\.topicProgress\.diagnosticGrade\) \|\| null \},/.test(JS),
    'the page stores the grades on load and the box reads the lesson\'s phase');

// ── G · FALSIFY ─────────────────────────────────────────────────────────────────────────────
console.log('\nG · each mutation of the real source is caught');
const MUT = [
    ['drop the paragraph count', 'if (a.needed > 0 && a.written < a.needed) {', 'if (false) {'],
    ['flip the grade rule', "else if (inp.grade >= 7) { first = 'details';", "else if (inp.grade >= 70) { first = 'details';"],
    ['read scores without the score/worth form', '(\\+?\\d+(?:\\.\\d+)?(?:\\s*\\/\\s*\\d+(?:\\.\\d+)?)?)\\s+·/.exec', '(\\+?\\d+(?:\\.\\d+)?)\\s+·/.exec'],
    ['drop "not submitted"', 'u && (u.notSubmitted || (', 'u && (false || ('],
    ['let "quotes" file close analysis under Evidence', "[/quot|evidence/i, 'Evidence', /close\\s*analysis/i],", "[/quot|evidence/i, 'Evidence'],"],
    ['accept the same grade as progress (off by one)', "if (r >= d + 1) return 'You moved up from Grade '", "if (r >= d) return 'You moved up from Grade '"],
    ['drop the intro/conclusion headings',"if (!/^(?:introduction|conclusion|(?:body\\s+)?paragraph\\s*\\d+)$/i.test(part)) return;", "if (!/^(?:(?:body\\s+)?paragraph\\s*\\d+)$/i.test(part)) return;"],
];
MUT.forEach(([name, from, to]) => {
    if (JS.split(from).length !== 2) { ok(false, name + ' — mutation anchor not found exactly once (the harness is stale)'); return; }
    let r;
    try { r = run(load(JS.replace(from, to)), false); } catch (e) { r = { pass: 0, fail: 1 }; }
    ok(r.fail > 0, name + ' → ' + r.fail + ' check(s) fail');
});

console.log('\n' + (total.fail ? '❌' : '✅') + ' path-box-harness: ' + total.pass + ' passed, ' + total.fail + ' failed');
process.exit(total.fail ? 1 : 0);
