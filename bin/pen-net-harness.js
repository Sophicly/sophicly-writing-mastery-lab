#!/usr/bin/env node
/* eslint-env node */
// pen-net-harness (v7.20.718) — the mark auditor's penalty nets.
//
// 1. ONE VERB CHARGE PER SENTENCE (Neil, 2026-10-06, PEDAGOGY §53.31 — "One penalty for that sentence").
//    Measured on the AQA Lang P2 walk: "Munby uses positive adjectives to show how beautiful the snow makes
//    London." was charged F1 ("show") AND T1 ("uses") — 1 mark from one sentence in a paragraph worth 4.
// 2. A STRIPPED PENALTY GIVES ITS MARKS BACK. Every card states "Total penalties: −X" and the card auditor
//    prefers that line to the bullets, so the three older nets (strong-verb, verbatim-quote, duplicate) hid
//    the charge but left the deduction standing. Found while building 1; fixed for all four nets.
//
// Slices the REAL code between @PEN-NET-PURE-BEGIN/END, drives it with real card shapes, reads the penalty
// exactly as Pass 1 does, and checks the wiring order in _auditAssessmentArithmetic.
// `--self-test` breaks the code four ways and proves each break turns this harness red.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
const BEGIN = '// ── @PEN-NET-PURE-BEGIN', END = '// ── @PEN-NET-PURE-END ──';

// Pass 1's own reading of a card's penalty (copied from _auditAssessmentArithmetic — keep in step).
function penOf(card) {
    const penLine = card.match(/Total penalties:?\*{0,2}\s*[−–-]\s*([\d.]+)/i);
    if (penLine) return parseFloat(penLine[1]);
    let pen = 0, pm; const re = /(?:^|\n)\s*(?:[·•*-]\s*)?\*{0,2}[A-Z]{1,3}\d(?:-[A-Z]+)?\*{0,2}[^\n]{0,80}?\([−–-]\s*([\d.]+)\)/g;
    while ((pm = re.exec(card)) !== null) pen += parseFloat(pm[1]);
    return Math.round(pen * 100) / 100;
}
const cards = t => (String(t).match(/@FB_BEGIN[\s\S]*?@FB_END/g) || []);
const card = (q, pens, total, excerpt) => ['@FB_BEGIN{"q":"' + q + '","para":"1"}']
    .concat(excerpt ? ['> ' + excerpt] : [])
    .concat([
        '| Criterion | Worth | Your Score | Why |', '|---|---|---|---|',
        '| Conceptual topic sentence (AO2) | 0.5 | 0.5 | Clear idea |',
        '| Technique + quote + inference (AO2) | 1.0 | 0.5 | Thin inference |',
        '| Close analysis (AO2) | 0.5 | 0.25 | Paraphrase |',
        '**Penalties applied:**'], pens, [total, 'Total Mark for ' + q + ': 0.25/4', '@FB_END']).join('\n');
const F1 = q => '- **F1 — weak analytical (inference) verb (−0.5):** "' + q + '" — Fix: "conveys …"';
const T1 = q => '- **T1 — imprecise analytical (inference) verb (−0.5):** "' + q + '" — Fix: "crafts …"';
const PEN = (c, q) => '- **' + c + ' — other fault (−0.5):** "' + q + '" — Fix: "…"';

const MUNBY = 'The snow fell all night. Munby uses positive adjectives to show how beautiful the snow makes London. The streets are silent.';

function suite(src) {
    let pass = 0, fail = 0; const msgs = [];
    const ok = (c, label, got) => { if (c) pass++; else { fail++; msgs.push('  ❌ ' + label + (got !== undefined ? ' — got ' + JSON.stringify(got) : '')); } };
    const B = src.indexOf(BEGIN), E = src.indexOf(END);
    ok(B > 0 && E > B, 'the nets sit between their sentinels');
    if (!(B > 0 && E > B)) return { pass, fail, msgs };
    const ctx = { console: { warn: () => {}, log: () => {} } };
    vm.createContext(ctx);
    try {
        vm.runInContext(src.slice(B, E) + '\nthis.n = { _stripStrongVerbPenalties, _stripUnverbatimPenalties, _stripDuplicatePenalties, _mergeSameSentenceVerbPenalties, _reconcileCardPenaltyTotals };', ctx);
    } catch (e) { ok(false, 'the sliced code runs', String(e)); return { pass, fail, msgs }; }
    const n = ctx.n;
    // The production order: 0b → 0c → 0d → 0e → 0f.
    const run = (t, s) => n._reconcileCardPenaltyTotals(n._mergeSameSentenceVerbPenalties(
        n._stripDuplicatePenalties(n._stripUnverbatimPenalties(n._stripStrongVerbPenalties(t))), s));

    // H1 — the case Neil ruled on.
    let out = run(card('Q2', [F1('to show how beautiful the snow makes London'), T1('Munby uses positive adjectives')], 'Total penalties: −1.0'), MUNBY);
    ok(out.indexOf('**T1') === -1, 'H1: "uses … to show" — the T1 charge is gone', out);
    ok(out.indexOf('**F1') !== -1, 'H1: the F1 charge stays');
    ok(penOf(out) === 0.5, 'H1: the card now deducts 0.5, not 1.0', penOf(out));
    ok(out.indexOf('\u0001') === -1, 'H1: no marker survives');

    // H2 — two different sentences keep two charges.
    out = run(card('Q2', [F1('This shows how beautiful London is'), T1('Munby uses positive adjectives')], 'Total penalties: −1.0'),
        'Munby uses positive adjectives. This shows how beautiful London is.');
    ok(out.indexOf('**T1') !== -1 && out.indexOf('**F1') !== -1 && penOf(out) === 1.0, 'H2: different sentences → both charges stand', penOf(out));

    // H3 — Literature: both verbs are F1 → one F1 for the sentence; the bold total line form.
    out = run(card('Body 1', [F1('Shakespeare uses imagery'), F1('to show his guilt')], '**Total penalties:** −1.0'),
        'In Act 2 Macbeth hesitates. Shakespeare uses imagery to show his guilt. He cannot sleep.');
    ok((out.match(/\*\*F1/g) || []).length === 1 && penOf(out) === 0.5, 'H3: Lit "uses … to show" → ONE F1, total 0.5', penOf(out));
    ok(/\*\*Total penalties:\*\* −0\.5/.test(out), 'H3: the visible total line reads −0.5');

    // H4 — both quotes ambiguous (each verb in two sentences) → both stand.
    out = run(card('Q2', [F1('shows'), T1('uses')], 'Total penalties: −1.0'), 'He uses a metaphor. It shows fear. She uses a simile. It shows hope.');
    ok(penOf(out) === 1.0 && out.indexOf('**T1') !== -1, 'H4: two ambiguous quotes → nothing merged', penOf(out));

    // H5 — no source text: the same words quoted twice still merge.
    out = run(card('Q2', [F1('uses positive adjectives to show'), T1('uses positive adjectives')], 'Total penalties: −1.0'), '');
    ok(penOf(out) === 0.5 && out.indexOf('**T1') === -1, 'H5: no source, overlapping quotes → merged', penOf(out));

    // H6 — an OLDER net (strong-verb) now gives its mark back.
    out = run(card('Q3', [F1('Munby frames the snow as a blanket')], 'Total penalties: −0.5'), MUNBY);
    ok(out.indexOf('**F1') === -1, 'H6: the unsupportable F1 is stripped (as before)');
    ok(penOf(out) === 0, 'H6: …and the card deducts 0, not 0.5', penOf(out));

    // H7 — a capped list keeps its cap after a merge.
    out = run(card('Q2', [F1('to show how beautiful the snow makes London'), T1('Munby uses positive adjectives'),
        PEN('P1', 'The snow fell all night'), PEN('S1', 'The streets are silent')], 'Total penalties: −1.5'), MUNBY);
    ok(penOf(out) === 1.5 && out.indexOf('**T1') === -1, 'H7: four listed, capped at 1.5 → still 1.5 with three left', penOf(out));

    // H8 — penalty lines outside any card are not touched.
    const loose = F1('to show how beautiful the snow makes London') + '\n' + T1('Munby uses positive adjectives');
    ok(run(loose, MUNBY) === loose, 'H8: lines outside a card are untouched');

    // H9 — the duplicate net (another unit's words) now gives its mark back.
    const A = card('Q2', [F1('to show how beautiful the snow makes London')], 'Total penalties: −0.5', MUNBY);
    const Bc = card('Q3', [F1('to show how beautiful the snow makes London')], 'Total penalties: −0.5', 'Later the thaw arrives and the city turns grey.');
    out = run(A + '\n\n' + Bc, MUNBY);
    const cs = cards(out);
    ok(cs.length === 2 && penOf(cs[0]) === 0.5 && penOf(cs[1]) === 0, 'H9: the copied charge leaves Q3 AND its 0.5 goes with it', cs.map(penOf));

    // H10 — idempotent.
    const once = run(card('Q2', [F1('to show how beautiful the snow makes London'), T1('Munby uses positive adjectives')], 'Total penalties: −1.0'), MUNBY);
    ok(run(once, MUNBY) === once, 'H10: a second pass changes nothing');

    // H11 — an ellipsis quote is placed by its pieces.
    out = run(card('Q2', [F1('uses positive adjectives … to show how beautiful'), T1('Munby uses positive adjectives')], 'Total penalties: −1.0'), MUNBY);
    ok(penOf(out) === 0.5, 'H11: an ellipsis quote is placed in its sentence', penOf(out));

    // H12 — the F1 is kept even when the T1 is listed first.
    out = run(card('Q2', [T1('Munby uses positive adjectives'), F1('to show how beautiful the snow makes London')], 'Total penalties: −1.0'), MUNBY);
    ok(out.indexOf('**T1') === -1 && out.indexOf('**F1') !== -1, 'H12: F1 kept over T1 whatever the order');

    // H13 — a quote-less charge is never merged (cannot be placed).
    const ql = '- **T1 — imprecise analytical (inference) verb (−0.5):** uses — Fix: crafts';
    out = run(card('Q2', [F1('to show how beautiful the snow makes London'), ql], 'Total penalties: −1.0'), MUNBY);
    ok(penOf(out) === 1.0, 'H13: a charge with no quotation stands', penOf(out));

    // W — production wiring: the new passes run after the three older nets, before Pass 1.
    const a = src.indexOf('out = _stripDuplicatePenalties(out);');
    const m = src.indexOf('out = _mergeSameSentenceVerbPenalties(out, _penSentenceSource());');
    const r = src.indexOf('out = _reconcileCardPenaltyTotals(out);');
    const p1 = src.indexOf('// ---- Pass 1: each card — recompute total from its own table ----');
    ok(a > 0 && m > a && r > m && p1 > r, 'W1: 0d → 0e merge → 0f reconcile → Pass 1, in that order', [a, m, r, p1]);
    ok((src.match(/return lead \+ _penDropMark\(whole\);/g) || []).length === 2, 'W2: the strong-verb and verbatim nets leave the marker');
    return { pass, fail, msgs };
}

const MUTATIONS = [
    ['the reconcile no longer lowers the stated total', 'if (tm) {   // no stated total', 'if (false) {   // no stated total'],
    ['the merge keeps T1 instead of F1', "if (ch[m[k]].code === 'F1')", "if (ch[m[k]].code === 'T1')"],
    ['the merge ignores which sentence a quote is in', "const groupOf = ch.map(c => (c.cand.length === 1 ? 's' + c.cand[0] : null));", "const groupOf = ch.map(c => 'all');"],
    ['an older net stops leaving the marker', 'return lead + _penDropMark(whole);', 'return lead;'],
];

if (process.argv.includes('--self-test')) {
    let bad = 0;
    MUTATIONS.forEach(([label, from, to]) => {
        if (SRC.indexOf(from) === -1) { console.log('  ❌ mutation target missing: ' + label); bad++; return; }
        const r = suite(SRC.split(from).join(to));
        if (r.fail === 0) { console.log('  ❌ NOT caught: ' + label); bad++; } else console.log('  ✓ caught: ' + label + ' (' + r.fail + ' red)');
    });
    console.log(bad ? '❌ pen-net-harness --self-test: ' + bad + ' mutation(s) not caught' : '✅ pen-net-harness --self-test: all ' + MUTATIONS.length + ' mutations caught');
    process.exit(bad ? 1 : 0);
}
const res = suite(SRC);
res.msgs.forEach(x => console.log(x));
console.log((res.fail ? '❌' : '✅') + ` pen-net-harness: ${res.pass}/${res.pass + res.fail} assertions passed (one verb charge per sentence; stripped charges give their marks back).`);
process.exit(res.fail ? 1 : 0);
