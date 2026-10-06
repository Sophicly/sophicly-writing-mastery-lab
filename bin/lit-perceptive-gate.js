#!/usr/bin/env node
/* eslint-env node */
/**
 * lit-perceptive-gate.js — v7.20.715 (PEDAGOGY §53, LIT-PERCEPTIVE-INFERENCE-PLAN §6.1)
 *
 * ANSWERS: "is the Literature marking Neil ruled on 6 October still the marking Sophia is given?"
 *
 * WHAT IT PROVES (source only, no WordPress):
 *   A · the AQA Literature anchor: the eleven v5 body rows, byte-exact and in sentence order, summing
 *       to 8; the Introduction (3) and Conclusion (7) unchanged in worth, every row carrying its
 *       "Marked:" split; the LITERATURE MARKING STANDARD (Rule 5 restated with AQA's word
 *       "conceptualised", Rule 6, the nine links, the sound-device rule); T2 / TTE1 / H1 / P2 kept
 *       off the body penalty list and P2 off every list; no "type Y" step left (§53.29).
 *   B · the AQA 19th-century override (router) re-weights rows that EXIST by those exact names, and
 *       the body it produces sums to 7 (§53.25).
 *   C · marking-fairness Rule 6 (every board) with the "Not valid —" Why shape the chips read.
 *   D · T2 means "not linked by any of the nine methods" wherever T2 means linking (§53.21), and
 *       the Penalty Ledger's plain name agrees.
 *   E · the mark-table ROW chips behave: coherence below worth → Linking Sentences & Paragraphs;
 *       a "Not valid —" Why → The Interpretation Ladder; full marks / header rows → nothing.
 *   F · the literature inventory is COUNTED from the manifests, so a new or unmapped literature
 *       protocol fails here instead of silently missing the ruling. Every file is either PORTED
 *       (checked in A) or listed PENDING with its plan §4 status.
 *
 * MUTATION-PROVED: `--self-test` re-runs every check against deliberately broken copies (an old
 * row name back, a worth changed, T2 back on the body list, Rule 6 deleted, the override
 * re-weighting a row that does not exist, a row chip removed, a Y gate restored) and FAILS unless
 * each one is caught. A gate that passes its own mutations is not a gate.
 *
 * Run: node bin/lit-perceptive-gate.js [--self-test]      (wired into bin/pre-ship-check.sh)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const P = (...a) => path.join(ROOT, ...a);
const read = (f) => fs.readFileSync(f, 'utf8');

const FILES = {
    proto: P('protocols', 'aqa', 'literature', 'modules', 'protocol-a-assessment.md'),
    router: P('includes', 'class-protocol-router.php'),
    fairness: P('protocols', 'shared', 'mark-scheme', 'marking-fairness-universal.md'),
    core: P('frontend', 'wml-core.js'),
    assess: P('frontend', 'wml-assessment.js'),
    poetryProto: P('protocols', 'aqa', 'poetry', 'modules', 'protocol-a-assessment-poetry.md'),
    penLit: P('protocols', 'aqa', 'literature', 'modules', 'penalty-codes.md'),
    penPoetry: P('protocols', 'aqa', 'poetry', 'modules', 'penalty-codes-poetry.md'),
    penAqaL2: P('protocols', 'aqa', 'language2', 'modules', 'knowledge-penalties.md'),
    penEdxL2: P('protocols', 'edexcel', 'language2', 'modules', 'knowledge-penalties.md'),
    penEdqL2: P('protocols', 'eduqas', 'language2', 'modules', 'knowledge-penalties.md'),
};

// The ruled tables (PEDAGOGY §53.23–26). Name → worth, in the order the student writes.
const BODY = [
    ['Topic sentence links to thesis and question (AO1)', 1.0],
    ['Technique + anchor quotation + inference, in one sentence (AO2/AO1)', 1.0],
    ['Quotation integrated into the sentence (AO1)', 0.5],
    ['Fine-grained close analysis of words, sounds and punctuation (AO2)', 1.25],
    ['Analysis of technique interplay (AO2)', 0.5],
    ['First detailed sentence on reader effects (AO2)', 0.5],
    ['Second detailed sentence on reader effects (AO2)', 0.5],
    ["Evaluates author's purpose (AO1)", 1.0],
    ["Context drives author's choices (AO3)", 1.0],
    ['Coherence and flow (AO1)', 0.5],
    ['Judicious supporting quotations (AO1)', 0.25],
];
const INTRO_TOTAL = 3, BODY_TOTAL = 8, CONC_TOTAL = 7, BODY_19C = 7;
const OLD_NAMES = ['Strategic selection of quotes', 'Accurate technical terminology', 'Integrated quotes & supporting evidence',
    'Analysis links to topic sentence (AO1/AO2)', 'Perceptive close analysis of words/sound/structure'];

// Literature assessment protocols, by manifest dir. PORTED = checked in A. PENDING = the plan §4 port
// list (status quoted from the plan); a literature manifest dir in neither list FAILS (F).
const LIT_PORTED = ['aqa/literature'];
const LIT_PENDING = {
    'aqa/poetry': 'comparative poetry — no links row, so no coherence row (plan §4 exceptions)',
    'aqa/unseen': 'not yet mapped (plan §4)',
    'ccea/prose': 'six sibling tables (plan §4) — body 9',
    'ccea/unseen-prose': 'not yet mapped (plan §4)',
    'edexcel-igcse/heritage': 'six sibling tables (plan §4) — body 7.5',
    'edexcel-igcse/literature': 'six sibling tables (plan §4) — body 7.5',
    'edexcel-igcse/modern': 'six sibling tables (plan §4) — body 7',
    'edexcel-igcse/modern-prose': 'not yet mapped (plan §4)',
    'edexcel/19th_century': 'already in sentence order — one TEI row, needs a ruling (plan §4)',
    'edexcel/modern': 'not yet mapped (plan §4)',
    'edexcel/poetry': 'comparative poetry — no links / selection row (plan §4 exceptions)',
    'edexcel/shakespeare': 'already in sentence order — one TEI row, needs a ruling (plan §4)',
    'edexcel/unseen': 'not yet mapped (plan §4)',
    'eduqas/literature': 'six sibling tables (plan §4) — body 9',
    'eduqas/modern': 'six sibling tables (plan §4) — body 9',
    'eduqas/poetry': 'comparative poetry (plan §4 exceptions)',
    'eduqas/shakespeare': 'already in sentence order — one TEI row, needs a ruling (plan §4)',
    'eduqas/unseen': 'not yet mapped (plan §4)',
    'ocr/literature': 'six sibling tables (plan §4) — body 9',
    'ocr/poetry': 'not yet mapped (plan §4)',
    'sqa/critical-reading': 'no strategic-selection row — needs a ruling (plan §4)',
};
const NON_LIT = /^(?:[a-z-]+)\/(?:language\d?|language-?\w*|creative-writing|cw)$/;

function num(s) { return Math.round(parseFloat(s) * 1000) / 1000; }
function sum(a) { return Math.round(a.reduce((x, y) => x + y, 0) * 1000) / 1000; }

// Rows of one numbered table: "N. **Name** \- Worth: W mark(s)".
function rowsBetween(text, fromHeading, toHeading) {
    const a = text.indexOf(fromHeading);
    const b = toHeading ? text.indexOf(toHeading, a + 1) : text.length;
    if (a < 0 || b < 0) return null;
    const seg = text.slice(a, b);
    const out = [];
    const re = /^\s*\d+\.\s+\*\*(.+?)\*\*\s*\\?-\s*Worth:\s*([\d.]+)\s*marks?/gm;
    let m;
    while ((m = re.exec(seg)) !== null) out.push([m[1].replace(/\\/g, ''), num(m[2])]);
    return { seg: seg, rows: out };
}

function checkAll(T, log) {
    let fail = 0;
    const ok = (label, cond, got) => {
        if (cond) { if (log) console.log('  ✓ ' + label); }
        else { fail++; if (log) console.log('  ✗ ' + label + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); }
    };
    const H = (s) => { if (log) console.log('\n' + s); };

    // ── A · the AQA Literature anchor ──────────────────────────────────────────────────────
    H('A · AQA Literature — the v5 tables, the standard, the penalties, no Y step');
    const pr = T.proto;
    const intro = rowsBetween(pr, '**1\\. Introduction Assessment', '**2\\. Body Paragraph Assessments');
    const body = rowsBetween(pr, '**2\\. Body Paragraph Assessments', '**3\\. Conclusion Assessment');
    const conc = rowsBetween(pr, '**3\\. Conclusion Assessment', '**4\\. Final Summary');
    ok('the three section tables are found', !!(intro && body && conc));
    if (intro && body && conc) {
        ok('Introduction: 4 rows summing to ' + INTRO_TOTAL, intro.rows.length === 4 && sum(intro.rows.map(r => r[1])) === INTRO_TOTAL, intro.rows);
        ok('Conclusion: 7 rows summing to ' + CONC_TOTAL, conc.rows.length === 7 && sum(conc.rows.map(r => r[1])) === CONC_TOTAL, conc.rows.map(r => r[1]));
        ok('Body: exactly ' + BODY.length + ' rows', body.rows.length === BODY.length, body.rows.length);
        BODY.forEach((b, i) => {
            const got = body.rows[i];
            ok('Body row ' + (i + 1) + ' is "' + b[0] + '" worth ' + b[1], !!got && got[0] === b[0] && got[1] === b[1], got);
        });
        ok('Body rows sum to ' + BODY_TOTAL, sum(body.rows.map(r => r[1])) === BODY_TOTAL, sum(body.rows.map(r => r[1])));
        OLD_NAMES.forEach(n => ok('the retired row "' + n + '" is gone from the body table', body.seg.indexOf(n) === -1));
        const marked = (seg) => (seg.match(/^\s*- Marked: /gm) || []).length;
        ok('every Introduction row says how it is marked (4 "Marked:" lines)', marked(intro.seg) === 4, marked(intro.seg));
        ok('every Body row says how it is marked (11)', marked(body.seg) === BODY.length, marked(body.seg));
        ok('every Conclusion row says how it is marked (7)', marked(conc.seg) === 7, marked(conc.seg));
        ok('the thesis row splits 0.5 three points + 0.25 one core argument + 0.25 conceptualised (§53.26)',
            /0\.5 three points that map the essay · \+0\.25 the three points set up ONE core argument[^\n]*\+0\.25 conceptualised/.test(intro.seg));
        ok('the topic sentence splits 0.25 link + 0.5 convincing concept + 0.25 from the anchor (§53.10)',
            /0\.25 links to the thesis and the question · \+0\.5 a CONVINCING concept[^\n]*\+0\.25 that concept is drawn from the ANCHOR/.test(body.seg));
        ok('row 2 splits 0.25 sequence + 0.25 named correctly + 0.5 inference (§53.16–17)',
            /0\.25 a technique used in the sequence[^\n]*\+0\.25 the technique is named correctly[^\n]*\+0\.5 the inference/.test(body.seg));
        // Body penalty list: the four codes the rows now carry are absent; P2 absent everywhere.
        const bodyPen = (body.seg.match(/Apply maximum 3 penalties from codes: ([^(]*)/) || [])[1] || '';
        ok('the body penalty list is found', !!bodyPen);
        ['T2', 'TTE1', 'H1', 'P2'].forEach(c => ok('body penalty list does NOT offer ' + c + ' (one fault, one charge)',
            !new RegExp('(?:^|[ ,])' + c + '(?:,|$|\\s)').test(bodyPen), bodyPen));
        const icPens = [intro.seg, conc.seg].map(s => (s.match(/Apply maximum 2 penalties from codes: ([^(]*)/) || [])[1] || '');
        ok('Introduction + Conclusion lists still offer T2 (no coherence row there — §53.21)', icPens.every(l => /\bT2\b/.test(l)), icPens);
        ok('…and never P2 (every row carries its perceptive quarter)', icPens.every(l => l && !/\bP2\b/.test(l)), icPens);
    }
    const std = (pr.match(/LITERATURE MARKING STANDARD[\s\S]*?(?=\*\*Internal AI Note — OPTIMAL-GOLD COHERENCE RULE)/) || [''])[0];
    ok('the LITERATURE MARKING STANDARD block is present', std.length > 2000, std.length);
    ok('…Rule 5 restated, AQA word "conceptualised"', /marking-fairness Rule 5/.test(std) && /conceptualised/.test(std));
    ok('…Rule 6 restated ("Only valid readings count") with the "Not valid —" Why shape', /Rule 6/.test(std) && /`Not valid —`/.test(std));
    ok('…"convincing" is checkable (the Why names the reading AND quotes the words)', /names the student's reading AND quotes the words/.test(std));
    ok('…the coherence row takes ANY of the nine methods; discourse markers never required',
        /nine linking methods/.test(std) && /Discourse markers are ONE method and are never required/.test(std));
    ok('…the five sound devices may be the sentence-2 technique; Plosive/Tense credited, not deducted (§53.28)',
        /Alliteration, Assonance, Consonance, Sibilance and Onomatopoeia/.test(std) && /Plosive and Tense belong in close analysis/.test(std) && /without deducting/.test(std));
    ok('…a colon-led quotation earns full integration credit (§53.18)', /after a colon is valid and earns full credit/.test(std));
    ok('no STEP 2a "type **Y**" gate is left in the protocol (§53.29)', !/type \*{0,2}Y\*{0,2} to see|WAIT for the student to reply \*\*Y\*\*/i.test(pr));
    ok('every STEP 2a says to mark in the SAME message', (pr.match(/STEP 2a — Acknowledge, then mark in the SAME message/g) || []).length === 3);
    ok('the Table Format Rule pins exact criterion names (rows are read by name)', /Copy each Criterion name EXACTLY/.test(pr));
    ok('the weak-verb tier points at F1, never T2', !/WEAK \(T2 imprecision territory\)/.test(pr));
    // v7.20.717 — measured on the WML 327 A poetry walk: with the gate still in the protocol, Sophia
    // obeyed it on Body 1 and not on the Introduction (the router's state block says the opposite).
    ok('AQA poetry: no STEP 2a "type **Y**" gate either (§53.29)', !/type \*{0,2}Y\*{0,2} to see|WAIT for the student to reply \*\*Y\*\*/i.test(T.poetryProto)
        && (T.poetryProto.match(/STEP 2a — Acknowledge, then mark in the SAME message/g) || []).length === 5);

    // ── B · the AQA 19th-century override ─────────────────────────────────────────────────
    H('B · the AQA 19th-century override (body out of 7)');
    const ov = (T.router.match(/19TH-CENTURY NOVEL — MARK-SCHEME OVERRIDE[\s\S]*?Total: \[X\]\/30/) || [''])[0];
    ok('the override block is found', ov.length > 200);
    const bodyLine = (ov.match(/Each Body Paragraph is out of 7[^\n]*/) || [''])[0];
    const reweights = [...bodyLine.matchAll(/\\"([^"\\]+)\\" is worth \*\*([\d.]+)\*\*/g)].map(m => [m[1], num(m[2])]);
    ok('the override re-weights purpose, close analysis and context (§53.25)', reweights.length === 3, reweights);
    const names = BODY.map(b => b[0]);
    reweights.forEach(r => ok('override row "' + r[0] + '" exists in the body table byte-for-byte', names.indexOf(r[0]) !== -1));
    ok('the topic sentence stays whole (1.0) in the override', /Topic sentence links to thesis and question \(AO1\)\\" stays \*\*1\.0\*\*/.test(bodyLine));
    const w19 = BODY.map(b => { const r = reweights.find(x => x[0] === b[0]); return r ? r[1] : b[1]; });
    ok('the 19th-century body sums to ' + BODY_19C, sum(w19) === BODY_19C, sum(w19));
    ok('purpose 0.5 · close analysis 1.0 · context 0.75 exactly as ruled',
        JSON.stringify(reweights.map(r => r[1]).sort()) === JSON.stringify([0.5, 0.75, 1].sort()), reweights);
    const ai = T.router.indexOf('19TH-CENTURY NOVEL — MARK-SCHEME OVERRIDE');
    const anchors = ai > 0 ? T.router.slice(T.router.lastIndexOf("if ($subject === '19th_century'", ai), ai) : '';
    ok('the fail-loud anchor check names every row the override re-weights',
        anchors && reweights.every(r => anchors.indexOf("strpos($assembled, " + (r[0].indexOf("'") !== -1 ? '"' + r[0] + '"' : "'" + r[0] + "'")) !== -1), reweights.map(r => r[0]));

    // ── C · fairness Rule 6 ──────────────────────────────────────────────────────────────
    H('C · marking-fairness Rule 6 — only valid readings count (every board)');
    ok('Rule 6 heading present', /## Rule 6 — Only valid readings count/.test(T.fairness));
    ok('…no penalty code for it (Rule 3: one charge)', /there is NO penalty code for it/.test(T.fairness));
    ok('…the Why opens `Not valid —` (the shape the chips read)', /begin it `Not valid —`/.test(T.fairness));
    ok('…an unusual reading the words support is valid', /Valid is not the same as usual/.test(T.fairness));
    ok('…module version bumped to 1.2.0', /\*\*Version:\*\* 1\.2\.0/.test(T.fairness));

    // ── D · T2 = not linked by any of the nine methods ────────────────────────────────────
    H('D · T2 means a missing link (the toolkit\'s nine), never "add Furthermore"');
    ['penLit', 'penPoetry', 'penAqaL2', 'penEdxL2', 'penEdqL2'].forEach(k => {
        const t = T[k];
        ok(k + ': T2 is "Sentence not linked to the one before"', /T2\*?\*?\s*[–-]\s*Sentence not linked to the one before/.test(t));
        ok(k + ': T2 no longer prescribes "Add Furthermore"', !/T2[^\n]*Lacks transitional phrases|Add Furthermore, Consequently/.test(t));
    });
    ok('Penalty Ledger plain name: T2 = sentence not linked to the one before', /T2: 'sentence not linked to the one before'/.test(T.assess));
    ok('the T2 Learn chip opens Linking Sentences & Paragraphs', /T2: \{ dest: 'toolkit', arg: 'sentence-transitions'/.test(T.core));

    // ── E · row chips (behaviour, not presence) ───────────────────────────────────────────
    H('E · mark-table row chips behave');
    const a = T.core.indexOf('    const ROW_LEARN_RULES = ['), b = T.core.indexOf('function rowChipsFor(');
    const end = b > 0 ? T.core.indexOf('\n    }\n', b) + 6 : -1;
    ok('ROW_LEARN_RULES … rowChipsFor slice found', a > 0 && b > a && end > b);
    if (a > 0 && b > a && end > b) {
        const ctx = {};
        vm.createContext(ctx);
        try {
            vm.runInContext(T.core.slice(a, end) + '\nthis.X = { rowChipsFor, _rowFromMd, _rowFromDocLine };', ctx);
            const X = ctx.X;
            const args = (r) => X.rowChipsFor(r).map(c => c.arg).join(',');
            ok('chat row: coherence 0.25 of 0.5 → Linking Sentences & Paragraphs',
                args(X._rowFromMd('| Coherence and flow (AO1) | 0.5 | 0.25 | Sentence 4 drifts |')) === 'sentence-transitions');
            ok('chat row: coherence full marks → no chip', args(X._rowFromMd('| Coherence and flow (AO1) | 0.5 | 0.5 | Flows |')) === '');
            ok('chat row: a "Not valid —" Why → The Interpretation Ladder',
                args(X._rowFromMd('| Fine-grained close analysis of words, sounds and punctuation (AO2) | 1.25 | 0.5 | Not valid — "naturally" normalises prejudice |')) === 'interpretation-ladder');
            ok('doc row (cwMarkdownToDocHtml shape): coherence below worth → chip',
                args(X._rowFromDocLine('Coherence and flow (AO1) — 0.5 · 0 · A list of facts')) === 'sentence-transitions');
            ok('doc row: "Not valid —" → ladder chip', args(X._rowFromDocLine('Context drives author\'s choices (AO3) — 1.0 · 0 · Not valid — anachronism')) === 'interpretation-ladder');
            ok('header and separator rows → nothing', X._rowFromMd('| Criterion | Worth | Your Score | Why |') === null && X._rowFromMd('|---|---|---|---|') === null
                && X._rowFromDocLine('Criterion — Worth · Your Score · Why') === null);
            ok('another row below worth → no coherence chip', args(X._rowFromMd('| Analysis of technique interplay (AO2) | 0.5 | 0 | Separate |')) === '');
        } catch (e) { ok('row-chip slice runs standalone', false, e.message); }
    }
    ok('chat bubbles tag mark-table rows (tagLearnChips second pass)', /rowChipsFor\(_rowFromMd\(row\)\)/.test(T.core));
    ok('the in-doc healer reads rows (learnChipsForLine falls back to the row reading)', /if \(!m\) return rowChipsFor\(_rowFromDocLine\(t\)\);/.test(T.core));
    ok('the Feedback pad reads rows (appendLearnChips)', /rowChipsFor\(_rowFromDocLine\(t\)\)/.test(T.core.slice(T.core.indexOf('function appendLearnChips('))));

    // ── F · the literature inventory, counted from the manifests ──────────────────────────
    H('F · every literature assessment protocol is either PORTED or listed PENDING');
    const dirs = [];
    fs.readdirSync(P('protocols')).forEach(board => {
        const bd = P('protocols', board);
        if (!fs.statSync(bd).isDirectory()) return;
        fs.readdirSync(bd).forEach(sub => {
            const mf = path.join(bd, sub, 'manifest.json');
            if (!fs.existsSync(mf)) return;
            let j; try { j = JSON.parse(read(mf)); } catch (e) { return; }
            const a2 = (j.assessment || {});
            const files = [].concat(a2.always || [], ...Object.values(a2.steps || {}).map(s => s.files || []));
            if (!files.some(f => /protocol-a-assessment/.test(f))) return;
            dirs.push(board + '/' + sub);
        });
    });
    const lit = dirs.filter(d => !NON_LIT.test(d));
    ok('the manifests yield literature assessment protocols to account for (' + lit.length + ')', lit.length >= 20, lit.length);
    lit.forEach(d => ok(d + ' is ' + (LIT_PORTED.includes(d) ? 'PORTED (checked in A)' : (LIT_PENDING[d] ? 'PENDING — ' + LIT_PENDING[d] : 'UNACCOUNTED FOR')),
        LIT_PORTED.includes(d) || !!LIT_PENDING[d]));
    Object.keys(LIT_PENDING).concat(LIT_PORTED).forEach(d => ok('listed ' + d + ' still has a literature manifest', lit.includes(d)));
    return fail;
}

function load() { const T = {}; Object.keys(FILES).forEach(k => { T[k] = read(FILES[k]); }); return T; }

if (process.argv.includes('--self-test')) {
    console.log('lit-perceptive-gate — SELF-TEST (every mutation must be caught)\n');
    const base = load();
    const baseFail = checkAll(base, false);
    let bad = baseFail ? 1 : 0;
    console.log((baseFail ? '  ✗' : '  ✓') + ' the real files pass (' + baseFail + ' failures)');
    const M = [
        ['an old row name back', T => { T.proto = T.proto.replace('Quotation integrated into the sentence (AO1)', 'Strategic selection of quotes (AO1)'); }],
        ['close analysis back to 1.5', T => { T.proto = T.proto.replace('punctuation (AO2)** \\- Worth: 1.25', 'punctuation (AO2)** \\- Worth: 1.5'); }],
        ['T2 back on the body list', T => { T.proto = T.proto.replace('Apply maximum 3 penalties from codes: C1,', 'Apply maximum 3 penalties from codes: C1, T2,'); }],
        ['P2 back on the introduction list', T => { T.proto = T.proto.replace('Apply maximum 2 penalties from codes: C1, T2, S2, R1, G1, I1,', 'Apply maximum 2 penalties from codes: C1, T2, S2, R1, G1, I1, P2,'); }],
        ['a STEP 2a Y gate restored', T => { T.proto = T.proto.replace('Now let me provide my formal assessment of your introduction.', 'Type **Y** to see your introduction mark breakdown.'); }],
        ['Rule 6 deleted', T => { T.fairness = T.fairness.replace('## Rule 6 — Only valid readings count', '## Rule six'); }],
        ['the override re-weights a row that does not exist', T => { T.router = T.router.replace('\\"Context drives author\'s choices (AO3)\\" is worth', '\\"Context (AO3)\\" is worth'); }],
        ['the override cuts the topic sentence again (sum ≠ 7)', T => { T.router = T.router.replace('is worth **0.75** (not 1.0', 'is worth **1.0** (not 1.0'); }],
        ['the coherence row chip removed', T => { T.core = T.core.replace("{ arg: 'sentence-transitions', label: 'Linking Sentences & Paragraphs', test:", "{ arg: 'cohesion', label: 'Coherence & Cohesion', test:"); }],
        ['T2 back to "Add Furthermore"', T => { T.penPoetry = T.penPoetry.replace('T2 – Sentence not linked to the one before', 'T2 – Lacks transitional phrases/discourse markers (-0.5) Fix: Add Furthermore, Consequently'); }],
        ['a poetry Y gate restored', T => { T.poetryProto = T.poetryProto.replace('**STEP 2a — Acknowledge, then mark in the SAME message', '**STEP 2a — type **Y** to see your mark breakdown'); }],
    ];
    M.forEach(([name, mut]) => {
        const T = Object.assign({}, base);
        mut(T);
        const changed = Object.keys(T).some(k => T[k] !== base[k]);
        const f = checkAll(T, false);
        const caught = changed && f > 0;
        if (!caught) bad++;
        console.log((caught ? '  ✓' : '  ✗') + ' mutation "' + name + '" ' + (changed ? (caught ? 'caught (' + f + ' checks red)' : 'NOT CAUGHT') : 'did not apply — the mutation text is stale'));
    });
    console.log('\n' + (bad ? '❌ lit-perceptive-gate self-test FAILED (' + bad + ')' : '✅ lit-perceptive-gate self-test passed (' + M.length + ' mutations caught)'));
    process.exit(bad ? 1 : 0);
}

console.log('LIT-PERCEPTIVE GATE — the Literature marking Neil ruled on 6 Oct (PEDAGOGY §53) is the marking Sophia gets');
const fails = checkAll(load(), true);
console.log('\n' + (fails ? '❌ lit-perceptive-gate FAILED — ' + fails + ' check(s)' : '✅ lit-perceptive-gate passed'));
process.exit(fails ? 1 : 0);
