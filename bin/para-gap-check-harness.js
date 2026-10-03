#!/usr/bin/env node
/* eslint-env node */
/**
 * para-gap-check-harness.js — v7.20.674 (#686): the paragraph-by-paragraph self-assessment check.
 *
 * Neil (2026-09-30): "does that get reflected on in the feedback? … how similar or different is that
 * to the student's own self-reflection? … It has to mean something in the end." Measured first: the
 * skills ratings never reached Sophia, so .673's "Element Check" compared ratings she could not see.
 *
 * What it proves, from the SHIPPED code (the pure core is sliced between its sentinels, never copied):
 *   A. MAPPING — every mark-table criterion in the AQA Literature protocol maps to the skill the student
 *                rated (or is deliberately unmapped), and the protocol has NO criterion this table has not
 *                seen (a COUNT, §14c gate 1: a new criterion fails here until someone maps it).
 *   B. PARSE   — the measured prod card shape (Body 1, user 1287, 30 Sep: `&amp;` entities, header +
 *                separator rows) parses to its 11 rows; the "not submitted" Introduction card (Zayan 1109,
 *                29 Sep) is a card with NO table; the closing summary is never read as a paragraph.
 *   C. COMPARE — one scale both sides, the biggest gap, the tie-break, the one-step tolerance.
 *   D. WORDS   — the ask ends on its question, the table's first header cell is never empty, and no
 *                insider word reaches a student (§5c-ii).
 *   E. WIRING  — both pipelines consume the typed answer BEFORE the calibration consumer; the continue
 *                gate is built by ONE builder that the check can call back; resume re-asks or re-offers;
 *                the closing fact rides the closing turn; the rows exist in the Calibration template; the
 *                record travels to polishing; Sophia is no longer told to compare ratings she never sees.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const PROTO = fs.readFileSync(path.join(ROOT, 'protocols', 'aqa', 'literature', 'modules', 'protocol-a-assessment.md'), 'utf8');
const ROUTER = fs.readFileSync(path.join(ROOT, 'includes', 'class-protocol-router.php'), 'utf8');
const REST = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } };
const count = (hay, needle) => hay.split(needle).length - 1;

// ── the pure core, sliced whole ─────────────────────────────────────────────────────────────
const B = JS.indexOf('    // @GAP-CHECK-PURE-BEGIN'), E = JS.indexOf('    // @GAP-CHECK-PURE-END');
ok(B > 0 && E > B, 'the pure core sits between its two sentinels');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(JS.slice(B, E) + '\nthis.X = { GAP_SECTIONS, GAP_TOL, _gapSectionFor, _gapSkillFor, _gapCardOf, _gapRowsFrom, _gapCompare, _gapQuestionText, _gapFiledLine, _gapRevealText, _gapPastLine, _gapFactText, _gapTotalOf };', ctx);
const X = ctx.X;

// ── A · MAPPING ─────────────────────────────────────────────────────────────────────────────
console.log('\nA · every protocol criterion maps to the skill the student rated');
const crit = [];
PROTO.split('\n').forEach((line) => {
    const m = /^\s*\d+\.\s+\*\*(.+?)\*\*\s*\\?-\s*Worth:\s*([\d.]+)/.exec(line);
    if (m) crit.push(m[1].replace(/\\/g, '').trim());
});
// The three tables, in protocol order: Introduction (4) · Body (11) · Conclusion (7). The expected skill
// for each row is written out by hand — the harness is the second opinion, not a copy of the rules.
const EXPECT = [
    ['Introduction', 'Compelling hook that establishes an intriguing concept/contextual factor (AO1/AO3)', 'Hook'],
    ['Introduction', 'Building sentence(s) that establishe(s) pertinent contextual backdrop (AO3)', 'Building Sentences'],
    ['Introduction', 'Building sentence(s) that evaluate(s) how context shapes themes/purpose/choices (AO3)', 'Building Sentences'],
    ['Introduction', 'Clear, precise three-point thesis with powerful argument (AO1)', 'Thesis'],
    ['Body Paragraphs', 'Topic sentence links to thesis and question (AO1)', 'Topic Sentence'],
    ['Body Paragraphs', 'Integrated quotes & supporting evidence (AO1)', 'Evidence'],
    ['Body Paragraphs', 'Strategic selection of quotes (AO1)', 'Evidence'],
    ['Body Paragraphs', 'Accurate technical terminology (AO2)', 'Technical Terms'],
    ['Body Paragraphs', 'Analysis links to topic sentence (AO1/AO2)', null],
    ['Body Paragraphs', 'Perceptive close analysis of words/sound/structure (AO2)', 'Close Analysis'],
    ['Body Paragraphs', 'Analysis of technique interplay (AO2)', 'Close Analysis'],
    ['Body Paragraphs', 'First detailed sentence on reader effects (AO2)', 'Effects on Reader'],
    ['Body Paragraphs', 'Second detailed sentence on reader effects (AO2)', 'Effects on Reader'],
    ['Body Paragraphs', "Evaluates author's purpose (AO1)", "Author's Purpose"],
    ['Body Paragraphs', "Context drives author's choices (AO3)", 'Context'],
    ['Conclusion', 'Restates thesis (AO1)', 'Restated Thesis'],
    ['Conclusion', 'Links to question (AO1)', null],
    ['Conclusion', 'Evaluates controlling concept (AO1)', 'Controlling Concept'],
    ['Conclusion', 'Links concept to key techniques (AO1/AO2)', 'Controlling Concept'],
    ['Conclusion', "Evaluates author's purpose (AO1)", 'Central Purpose'],
    ['Conclusion', "Context drives author's central purpose (AO1/AO3)", 'Central Purpose'],
    ['Conclusion', 'Evaluates moral/message (AO1)', 'Universal Message'],
];
ok(crit.length === EXPECT.length, 'the protocol prints ' + crit.length + ' criteria; this table accounts for ' + EXPECT.length + ' (a new criterion must be mapped here first)');
EXPECT.forEach((e, i) => {
    ok(crit[i] === e[1], 'protocol row ' + (i + 1) + ' is still "' + e[1] + '"' + (crit[i] === e[1] ? '' : ' — found "' + crit[i] + '"'));
    const got = X._gapSkillFor(e[0], e[1]);
    ok(got === e[2], e[0] + ': "' + e[1] + '" → ' + (e[2] || 'UNMAPPED') + (got === e[2] ? '' : ' (got ' + got + ')'));
});
// The model shortens criteria in its tables; the common short forms must land on the same skill.
[['Introduction', 'Hook', 'Hook'], ['Introduction', 'Building sentence (context)', 'Building Sentences'], ['Introduction', 'Thesis', 'Thesis'],
 ['Body Paragraphs', 'Topic sentence', 'Topic Sentence'], ['Body Paragraphs', 'Technical terms', 'Technical Terms'], ['Body Paragraphs', 'Close analysis', 'Close Analysis'],
 ['Body Paragraphs', 'Effect on reader 1', 'Effects on Reader'], ['Body Paragraphs', 'Context', 'Context'], ['Conclusion', 'Universal message', 'Universal Message']]
    .forEach((e) => ok(X._gapSkillFor(e[0], e[1]) === e[2], 'short form "' + e[1] + '" → ' + e[2]));

// ── B · PARSE ───────────────────────────────────────────────────────────────────────────────
console.log('\nB · the measured card shapes parse');
const BODY1 = [
    'Let me assess Body Paragraph 1.',
    '',
    '@FB_BEGIN{"q":"Body 1","title":"Body Paragraph 1"}',
    '| Criterion | Worth | Your Score | Why |',
    '|---|---|---|---|',
    '| Topic sentence links to thesis and question (AO1) | 1.0 | 0.5 | Narrates plot rather than stating a concept |',
    '| Integrated quotes &amp; supporting evidence (AO1) | 0.5 | 0.5 | Quote embedded naturally into the sentence |',
    '| Strategic selection of quotes (AO1) | 0.5 | 0.25 | Accurate but analytically thin quote choice |',
    '| Accurate technical terminology (AO2) | 0.5 | 0 | No technique named anywhere |',
    '| Analysis links to topic sentence (AO1/AO2) | 0.5 | 0.25 | Loosely tied to curiosity, not conflict |',
    '| Perceptive close analysis of words/sound/structure (AO2) | 1.5 | 0.25 | Paraphrases meaning, no word-level zoom |',
    '| Analysis of technique interplay (AO2) | 0.5 | 0 | No technique named to interrelate |',
    '| First detailed sentence on reader effects (AO2) | 0.5 | 0.5 | Clear emotional effect, tied to downfall |',
    '| Second detailed sentence on reader effects (AO2) | 0.5 | 0.25 | Generic moralising, not text-specific |',
    "| Evaluates author's purpose (AO1) | 1.0 | 0.5 | States purpose but lacks development |",
    "| Context drives author's choices (AO3) | 1.0 | 0 | No context anywhere in paragraph |",
    '| Bonus: sustained conceptual line | +0.5 | +0.25 | Sustained through the paragraph |',
    'Total Mark for Body Paragraph 1: 2.75/8',
    '@FB_END',
    '',
    'Does that clear it up? Shall we continue with **Body Paragraph 2**?',
    '',
    '`[✓ Got it — continue]` `[🤔 Still confused]` `[💬 Different question]` `[⏸ Pause here]`',
].join('\n');
const card = X._gapCardOf(BODY1);
ok(card && card.section.key === 'body1', 'the card\'s own q ("Body 1") names the paragraph');
const rows = X._gapRowsFrom(card && card.body);
ok(rows.length === 11, 'eleven criterion rows — header, separator and the +bonus row skipped (got ' + rows.length + ')');
ok(rows.some((r) => r.criterion === 'Integrated quotes & supporting evidence (AO1)'), 'the stored "&amp;" is decoded before matching');
ok(X._gapCardOf('@FB_BEGIN{"q":"Introduction","title":"Introduction"}\n\nTotal Mark for Introduction: 0/3\n\nNo introduction was submitted for this essay.\n@FB_END').section.key === 'intro'
    && X._gapRowsFrom('No introduction was submitted for this essay.').length === 0,
    'the "not submitted" Introduction (Zayan 1109, 29 Sep) is a card with NO rows → filed "not compared", never a question about nothing');
ok(X._gapCardOf('**Total Mark for Conclusion: 4/7**\n\nFinal Summary — Grand Total 21/34\n[ASSESSMENT_COMPLETE]') === null, 'the closing summary is never read as a paragraph\'s marking');
ok(X._gapCardOf('Total Mark for Conclusion: 4.5/7').section.key === 'conclusion', 'no marker → the canonical total line names the paragraph');
ok(X._gapSectionFor('Body Paragraph 3').key === 'body3' && X._gapSectionFor('Introduction').key === 'intro' && X._gapSectionFor('Body Two') === null,
    'paragraph names resolve (Body Paragraph 3 → body3); an unknown name resolves to nothing, never a guess');

// ── C · COMPARE ─────────────────────────────────────────────────────────────────────────────
console.log('\nC · one scale, the biggest gap, the tolerance');
const R = (group, pairs) => pairs.map((p) => ({ group: group, skill: p[0], value: p[1] }));
// Zayan's real body ratings (staging 1355, 30 Sep): Topic Sentence 2, every other body skill 4.
const bodyRatings = R('Body Paragraphs', [['Topic Sentence', 2], ['Technical Terms', 4], ['Evidence', 4], ['Close Analysis', 4], ['Effects on Reader', 4], ["Author's Purpose", 4], ['Context', 4]]);
const cmp = X._gapCompare(card.section, bodyRatings, rows);
ok(cmp && cmp.items.length === 7, 'all seven rated body skills are compared (got ' + (cmp && cmp.items.length) + ')');
const ev = cmp.items.find((i) => i.skill === 'Evidence');
ok(ev && ev.score === 0.75 && ev.worth === 1, 'two criteria for one skill are ADDED (Evidence 0.5 + 0.25 of 0.5 + 0.5 → 0.75 of 1)');
// v7.20.681 (#695): the student now reads MARKS, so the biggest gap is the largest difference in
// marks among the parts more than one step out. Close Analysis: rated 4 = 1.5 of 2, scored 0.25 of 2
// → 1.25 marks out. (By proportion it was Context, 0.75 of 1 — a smaller gap on the screen.)
ok(cmp.biggest.skill === 'Close Analysis' && cmp.dir === 'over', 'biggest gap = Close Analysis, rated 1.25 marks higher than it scored — the largest gap IN MARKS (#695)');
const introRows = X._gapRowsFrom([
    '| Hook | 1.0 | 0.5 | Plot summary opener |',
    '| Building sentence (context) | 0.5 | 0.5 | Jacobean fear of regicide set up |',
    '| Building sentence (evaluation) | 0.5 | 0.5 | Links context to ambition |',
    '| Thesis | 1.0 | 1.0 | Clear three-point argument |'].join('\n'));
const introCmp = X._gapCompare(X._gapSectionFor('Introduction'), R('Introduction', [['Hook', 3], ['Building Sentences', 3], ['Thesis', 2]]), introRows);
ok(introCmp.biggest.skill === 'Thesis' && introCmp.dir === 'under', 'Zayan\'s own Introduction ratings (3 · 3 · 2) against full marks for the thesis → rated LOWER than it scored');
const close = X._gapCompare(X._gapSectionFor('Introduction'), R('Introduction', [['Hook', 3], ['Building Sentences', 5], ['Thesis', 4]]), introRows);
ok(close.dir === 'close', 'every part within one step (Hook 3 vs ½ · Thesis 4 vs full = exactly one step) → agreement, not a gap');
{
    // A one-step difference on a big part never outranks a real (two-step) gap, even when the marks tie.
    const tie = X._gapCompare(X._gapSectionFor('Body 1'), R('Body Paragraphs', [['Evidence', 3], ['Close Analysis', 2]]),
        X._gapRowsFrom('| Integrated quotes (AO1) | 1.0 | 1.0 | Apt |\n| Perceptive close analysis (AO2) | 2.0 | 1.0 | Clear |'));
    ok(tie.biggest.skill === 'Evidence' && tie.dir === 'under', 'equal mark gaps (0.5 each): the part two steps out is named, not the one a single step out');
}
const twoSteps = X._gapCompare(X._gapSectionFor('Introduction'), R('Introduction', [['Hook', 5], ['Building Sentences', 5], ['Thesis', 5]]), introRows);
ok(twoSteps.biggest.skill === 'Hook' && twoSteps.dir === 'over', 'TWO steps apart is a real gap (Hook rated 5 = Perceptive, scored ½ of 1) — the tolerance is exactly one step');
ok(X._gapCompare(X._gapSectionFor('Introduction'), [], introRows) === null && X._gapCompare(X._gapSectionFor('Introduction'), R('Introduction', [['Hook', 3]]), []) === null,
    'no ratings, or no rows → nothing to compare (the caller files "not compared")');
ok(X._gapCompare(X._gapSectionFor('Introduction'), R('Body Paragraphs', [['Hook', 3]]), introRows) === null, 'a rating from another group never leaks into this paragraph');

// ── D · WORDS ───────────────────────────────────────────────────────────────────────────────
console.log('\nD · what the student reads');
const q = X._gapQuestionText(introCmp);
ok(/\| Part \| Your rating \| Your rating as a mark \| My mark \|/.test(q), 'the table\'s first header cell is never empty (the formatAI row-split, v7.20.631) — and it now has the rating as a mark (#695)');
ok(/\*\*What do you think made it work\?\*\* Type one line below\. Then I will show you why I marked it that way\.$/.test(q), 'an under-rating asks what made it work — and the ask ENDS on it (§4c.4)');
ok(/What do you think it is missing\?/.test(X._gapQuestionText(cmp)), 'an over-rating asks what the part is missing');
ok(/Which part are you surest about/.test(X._gapQuestionText(close)), 'agreement still asks one question (one answer per paragraph, as ruled)');
const allText = [q, X._gapQuestionText(cmp), X._gapQuestionText(close), X._gapFiledLine(cmp), X._gapRevealText(cmp), X._gapPastLine(cmp), X._gapPastLine(close)].join('\n');
ok(!/\b(protocol|module|component|the system|the platform|payload|marker|bank)\b/i.test(allText), 'no insider word reaches the student (§5c-ii)');
ok(/^Filed under \*\*Calibration\*\*: on \*\*Body 1\*\*, the biggest gap was your \*\*Close Analysis\*\* — you had rated it higher than I marked it\.$/.test(X._gapPastLine(cmp))
    && /agreed on the \*\*Introduction\*\*\.$/.test(X._gapPastLine(close)),
    'the stored turn is PAST tense (§4c.7) — and it is exactly what the resume hook recognises');
ok(X._gapRevealText(cmp) === '**Why I gave your Close Analysis that mark:** “Paraphrases meaning, no word-level zoom” · “No technique named to interrelate”',
    'the reveal is my own reason from the mark table, verbatim (both criteria of a two-row part)');
ok(X._gapFiledLine(introCmp) === 'Thesis — you: Developing (2 of 5) = 0.25 of 1 · Sophia: 1 of 1 · you rated it lower than it scored',
    'the document row names the part, both judgements — the rating as a mark too (#695) — and the direction');
const fact = X._gapFactText([{ label: 'Introduction', gap: X._gapFiledLine(introCmp), said: 'it answered the question directly' },
    { label: 'Body 1', gap: 'Not compared — there was no mark table for this paragraph.', said: '' }]);
ok(/Introduction: Thesis — you: Developing/.test(fact) && /they said: "it answered the question directly"/.test(fact) && !/Not compared/.test(fact),
    'the closing fact carries the student\'s own words and leaves out paragraphs that were not compared');
ok(/Do NOT add a priority, change any mark/.test(fact), 'the closing fact cannot change a mark or add a priority');
ok(X._gapFactText([]) === '', 'no filed gaps → no fact at all');

// ── E · WIRING ──────────────────────────────────────────────────────────────────────────────
// ── D2 · MARKS — the rating as a mark, and the totals (v7.20.681, FIXLIST #695) ─────────────────
// Neil, on the live check: "it should show what my rating would equal in terms of a mark… and what
// Sophia actually gave… it doesn't even show me the total marks that Sophia gave me."
console.log('\nD2 · the rating as a mark, and the totals (#695)');
{
    const it = (c, k) => c.items.find((i) => i.skill === k);
    ok(it(cmp, 'Topic Sentence').selfMark === 0.25 && it(cmp, 'Close Analysis').selfMark === 1.5 && it(cmp, 'Technical Terms').selfMark === 0.5,
        'a rating becomes a mark by its step × what the part is worth, to the nearest quarter (2 of 5 on 1 → 0.25 · 4 of 5 on 2 → 1.5 · 4 of 5 on 0.5 → 0.375 → 0.5)');
    ok(cmp.rated.self === 5.25 && cmp.rated.mine === 2.75 && cmp.rated.worth === 7.5, 'the rated parts add up on both sides — 5.25 of 7.5 against 2.75 of 7.5 (got ' + JSON.stringify(cmp.rated) + ')');
    const t = X._gapTotalOf(BODY1, card.section);
    ok(t && t.got === 2.75 && t.of === 8, 'the paragraph mark is read from the card\'s OWN total line ("Total Mark for Body Paragraph 1: 2.75/8")');
    ok(X._gapTotalOf(BODY1, X._gapSectionFor('Body 2')) === null && X._gapTotalOf('no total here', card.section) === null, '…and only for THIS paragraph — never another paragraph\'s total, never a guess');
    const full = X._gapCompare(card.section, bodyRatings, rows, t);
    ok(full.penalties === true, 'penalties are detected when the card\'s total is below its rows (3 > 2.75)');
    ok(full.unrated.length === 1 && full.unrated[0] === 'Analysis links to topic sentence', 'the part no rating covers is named, without its AO tag');
    const ft = X._gapQuestionText(full);
    ok(/\| \*\*All the parts you rated\*\* \| — \| \*\*5\.25 of 7\.5\*\* \| \*\*2\.75 of 7\.5\*\* \|/.test(ft), 'the table ends on the totals for the parts the student rated, both sides');
    ok(/My mark for the whole of Body 1 is \*\*2\.75 \/ 8\*\*\. That mark also counts the part you did not rate \(analysis links to topic sentence\)\. Penalties have been taken off that mark\./.test(ft),
        'the whole paragraph\'s mark is shown, and why it differs from the table: the unrated part and the penalties');
    ok(/Close Analysis \| Good \(4 of 5\) \| 1\.5 of 2 \| 0\.25 of 2 \|/.test(ft), 'each row: rating · rating as a mark · my mark, all on the same "of" scale');
    ok(!/My mark for the whole/.test(X._gapQuestionText(cmp)), 'no total line on the card → no whole-paragraph sentence (never a made-up total)');

    // ⭐ NEIL'S OWN RUN (staging 1355, 3 Oct — Zayan's essay, Body 1 card as stored, his ratings off the screenshot).
    const NEIL_B1 = [
        '| Criterion | Worth | Your Score | Why |', '|---|---|---|---|',
        '| Topic sentence links to thesis/question (AO1) | 1.0 | 0.75 | Clear link; states feeling, not concept |',
        '| Integrated quotes &amp; evidence (AO1) | 0.5 | 0.5 | Smoothly embedded, correctly punctuated |',
        '| Strategic quote selection (AO1) | 0.5 | 0.5 | Apt — captures hesitation, early in play |',
        '| Accurate technical terminology (AO2) | 0.5 | 0.5 | "Repetition", "conditional" both accurate |',
        '| Analysis links to topic sentence (AO1/AO2) | 0.5 | 0.5 | Clearly reinforces ambition vs conscience |',
        '| Perceptive close analysis (AO2) | 1.5 | 1.0 | Clear word-focus; inference stays surface |',
        '| Analysis of technique interplay (AO2) | 0.5 | 0 | Techniques analysed separately, not together |',
        '| Effect 1 on reader (AO2) | 0.5 | 0.5 | Clear — tragic effect identified |',
        '| Effect 2 on reader (AO2) | 0.5 | 0 | Absent — no second effect sentence |',
        "| Evaluates author's purpose (AO1) | 1.0 | 0.25 | Implied only, never explicitly stated |",
        '| Context drives choices (AO3) | 1.0 | 0.75 | Correlational, not yet driving the argument |',
        '', 'Total Mark for Body Paragraph 1: 3.75/8'].join('\n');
    const nb = X._gapCompare(X._gapSectionFor('Body 1'), R('Body Paragraphs', [['Topic Sentence', 4], ['Technical Terms', 3], ['Evidence', 3], ['Close Analysis', 2], ['Effects on Reader', 2], ["Author's Purpose", 2], ['Context', 3]]),
        X._gapRowsFrom(NEIL_B1), X._gapTotalOf(NEIL_B1, X._gapSectionFor('Body 1')));
    const nt = X._gapQuestionText(nb);
    const want = ['| Topic Sentence | Good (4 of 5) | 0.75 of 1 | 0.75 of 1 |', '| Technical Terms | Secure (3 of 5) | 0.25 of 0.5 | 0.5 of 0.5 |',
        '| Evidence | Secure (3 of 5) | 0.5 of 1 | 1 of 1 |', '| Close Analysis | Developing (2 of 5) | 0.5 of 2 | 1 of 2 |',
        '| Effects on Reader | Developing (2 of 5) | 0.25 of 1 | 0.5 of 1 |', "| Author's Purpose | Developing (2 of 5) | 0.25 of 1 | 0.25 of 1 |",
        '| Context | Secure (3 of 5) | 0.5 of 1 | 0.75 of 1 |', '| **All the parts you rated** | — | **3 of 7.5** | **4.75 of 7.5** |'];
    want.forEach((w) => ok(nt.indexOf(w) !== -1, 'Neil\'s Body 1: ' + w));
    ok(/My mark for the whole of Body 1 is \*\*3\.75 \/ 8\*\*\./.test(nt), 'Neil\'s Body 1: "the total marks that Sophia gave me" — 3.75 / 8, from the card');
    ok(nb.biggest.skill === 'Evidence' && nb.dir === 'under', 'Neil\'s Body 1: still Evidence (two steps under, 0.5 marks) — the part he was asked about on screen');

    // Zayan's Introduction (staging, 3 Oct): rows 0.75, total 0/3 — the penalties are the difference.
    const Z_INTRO = ['| Compelling hook with intriguing concept/context (AO1/AO3) | 1.0 | 0.25 | Reads as thesis, not an intriguing hook |',
        '| Building sentence establishes contextual backdrop (AO3) | 0.5 | 0 | Absent — no historical context given |',
        '| Building sentence shows context shaping purpose (AO3) | 0.5 | 0 | Absent — context never linked to argument |',
        '| Clear, precise three-point thesis (AO1) | 1.0 | 0.5 | Single-concept thesis, lacks three-point roadmap |', '', 'Total Mark for Introduction: 0/3'].join('\n');
    const zi = X._gapCompare(X._gapSectionFor('Introduction'), R('Introduction', [['Hook', 3], ['Building Sentences', 3], ['Thesis', 2]]),
        X._gapRowsFrom(Z_INTRO), X._gapTotalOf(Z_INTRO, X._gapSectionFor('Introduction')));
    ok(/My mark for the whole of the Introduction is \*\*0 \/ 3\*\*\. Penalties have been taken off that mark\./.test(X._gapQuestionText(zi)) && zi.unrated.length === 0,
        'Zayan\'s Introduction: the whole mark (0 / 3) is shown and the penalties explain why it is below the rows');
    ok(/Every part you rated is within one step of my mark\./.test(X._gapQuestionText(close)), 'agreement is stated honestly ("within one step"), never as "agree" beside visible quarter-mark differences');
}

console.log('\nE · wiring (both pipelines, resume, the record, Sophia\'s instructions)');
ok(count(JS, 'if (!_pcStage && _gapConsumeTyped(msg))') === 2, 'the typed answer is consumed in BOTH chat pipelines');
JS.split('if (!_pcStage && _gapConsumeTyped(msg))').slice(1).forEach((after, i) => {
    ok(after.indexOf('_calibHostConsumeTyped(msg)') !== -1 && after.indexOf('_calibHostConsumeTyped(msg)') < 400, 'pipeline ' + (i + 1) + ': the gap answer is taken BEFORE the calibration consumer');
});
ok(/if \(_gapCheckTakeOver\(res\.reply, nextLabel\)\) return;\s*\n\s*if \(bc\) bc\.appendChild\(_buildAssessConfirmBar\(nextLabel\)\);/.test(JS),
    'the continue gate asks the check FIRST, then shows the buttons — one builder for both paths');
ok(count(JS, 'function _buildAssessConfirmBar(nextLabel)') === 1 && /confirmBar: _buildAssessConfirmBar/.test(JS), 'ONE button builder, registered on the chat shell for the check to call back');
ok(count(JS, "textContent: '🤔 Still confused'") === 0 && count(JS, "_mkBtn('🤔 Still confused'") === 1, 'the gate buttons exist in exactly one place (no stale second copy)');
ok(count(JS, 'if (_gapCheckResume()) return;') === 2, 'BOTH resume hooks re-ask the open question or give the continue buttons back (§4d)');
ok(count(JS, 'setTimeout(() => _gapCheckNoGate(_r), 1650);') === 2, 'a marking reply that lost its gate still gets the check, in both pipelines');
ok(/_facts \+= _gapCheckFact\(\);/.test(JS), 'the filed gaps ride the closing turn (Final Summary + Action Plan) — no extra call');
ok(/function _registerChatShell\(refs\) \{ _chatShell = refs; _gapOpen = null; \}/.test(JS), 'a new chat shell closes any question left open in the old one');
const calibSrc = JS.slice(JS.indexOf('    function buildCalibrationSection(topicData) {'), JS.indexOf('    function _maybeOpenCalibration(reply) {'));
ok(/if \(_ladderIsLit\(\)\) \{[\s\S]*GAP_SECTIONS\.forEach[\s\S]*_gapFids\(s\.key\)/.test(calibSrc), 'the Calibration template carries the five paragraph rows (Literature only)');
ok(/gaps: GAP_SECTIONS\.map/.test(JS) && /\$params\['gaps'\]/.test(REST) && /'gaps'\s*=>\s*array_slice\(\$gaps, 0, 5\)/.test(REST), 'the gaps travel onto the phase record, sanitised');
ok(/\$cal\['gaps'\]/.test(ROUTER), 'the polishing lesson reads them');
ok(!/replace the Self-Rating Reflection with an \*\*Element Check\*\*/.test(PROTO) && /the platform itself puts the student's own ratings beside your element scores/.test(PROTO),
    'the protocol no longer asks Sophia for an Element Check against ratings she is never given');
ok(!/and with their own Self-Assessment ratings for this section's elements/.test(ROUTER) && !/compares the section's mark with their own Self-Assessment ratings/.test(ROUTER),
    'neither Literature preamble tells Sophia to compare ratings she is never given');
ok(/CODE-DERIVED PARAGRAPH SELF-ASSESSMENT/.test(PROTO), 'the protocol\'s Final Summary names the closing fact');

console.log('\n' + (fail ? '❌' : '✅') + ' para-gap-check-harness: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
