#!/usr/bin/env node
/* eslint-env node */
/**
 * msa-quote-gate.js — v7.20.782 (WML 339 A, FIXLIST #815d/#822). A mark-scheme bank TEACHES the mark scheme's own words,
 * so every word it puts in quotation marks must BE the mark scheme's word — never a paraphrase in quotation marks.
 * Measured 9 Oct: the AQA Paper 1 section quoted June 2024 wording that the 2026 scheme changed (Q3's structure framing,
 * Q4's Level 4, the "Level 1 or Level 2" note moving from Q3 to Q2) and phrases found in NO AQA document.
 *
 * For each PILOTED section (below), every fragment in double quotation marks on a Feedback, Why or WhyWrong line — split
 * on "…", "[BLANK]" and "___" — must appear verbatim (case, whitespace, curly/straight quotes and dashes normalised) in
 * the item's OWN Question/Options (a note may quote the student answer it is judging) or in an allowed source:
 *   · the 2026 sample mark scheme text (research/sources/aqa-8700-1-sms-2026.txt, pdftotext -raw of AQA-8700-1-SMS-2026.pdf)
 *   · the knowledge file re-sourced from it (protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md)
 *   · the June 2024 mark scheme + its insert (research/sources/aqa-8700-1-jun24-ms.txt, -insert.txt) — ONLY in the items
 *     that deliberately use its indicative answers as ranking rungs (JUN24_ITEMS), so a 2024 descriptor can never stand in
 *     for a 2026 one.
 * Also fails when the section does not hold the planned count and AO mix.
 *   node bin/msa-quote-gate.js            check every piloted section
 *   node bin/msa-quote-gate.js --selftest prove a fabricated quote fails and a verbatim one passes
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const norm = (s) => String(s)
    .replace(/[‘’‛′]/g, "'").replace(/[“”‟″]/g, '"')
    .replace(/[–—−]/g, '-').replace(/…/g, '...')
    .replace(/\s+/g, ' ').trim().toLowerCase();

const PILOTS = [{
    bank: 'protocols/shared/mark-scheme-assessment/banks/language1.md',
    section: 'AQA (',
    count: 40,
    ao: { AO1: 4, AO2: 10, AO4: 9, AO5: 9, AO6: 8 },
    // v7.20.802 (#857): the 2026 sample QUESTION PAPER + insert are AQA's own 2026 documents too (Question 1's options).
    sources: ['research/sources/aqa-8700-1-sms-2026.txt', 'protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md',
        'research/sources/aqa-8700-1-sqp-2026.txt', 'research/sources/aqa-8700-1-sins-2026.txt'],
    jun24: ['research/sources/aqa-8700-1-jun24-ms.txt', 'research/sources/aqa-8700-1-jun24-insert.txt'],
    JUN24_ITEMS: [4, 10, 17, 25],
    // v7.20.802 (#857): items 1 and 16 now teach the 2026 multiple-choice Question 1 — no item is exempt any more.
    ALLOW: {},
}, {
    // v7.20.813 (WML 345 A, FIXLIST #866): #815d step 2 — AQA Paper 2, the second most-used section on prod (6 real
    // students). Same reading 23 / writing 17 split as the Paper 1 pilot, spread by Paper 2's marks (Q1+Q2 AO1 12,
    // Q3 AO2 12, Q4 AO3 16 · Q5 AO5 24 + AO6 16).
    bank: 'protocols/shared/mark-scheme-assessment/banks/language2.md',
    section: 'AQA (',
    count: 40,
    ao: { AO1: 7, AO2: 7, AO3: 9, AO5: 9, AO6: 8 },
    sources: ['research/sources/aqa-8700-2-sms-2026.txt', 'protocols/aqa/language2/modules/knowledge-mark-scheme-lang2.md'],
    jun24: ['research/sources/aqa-8700-2-jun24-ms.txt'],
    // Items 4, 8 and 12 rank AQA's own June 2024 indicative answers (the doctor and nurse sources).
    JUN24_ITEMS: [4, 8, 12],
    ALLOW: {},
}, {
    // v7.20.817 (WML 345 A, FIXLIST #869): #815d step 3 — Macbeth AQA (9 attempts by 3 real students). AQA Literature has
    // no 2026 re-specification: the June 2024 8702/1 scheme is the newest on the drive and the authority. AO mix follows
    // the marks (AO1 12 · AO2 12 · AO3 6 + AO4 4 of 34): AO1 14 · AO2 14 · AO3 7 · AO4 5.
    bank: 'protocols/shared/mark-scheme-assessment/banks/macbeth.md',
    section: 'AQA (',
    count: 40,
    ao: { AO1: 14, AO2: 14, AO3: 7, AO4: 5 },
    sources: ['research/sources/aqa-8702-1-jun24-ms.txt', 'protocols/aqa/literature/modules/knowledge-mark-scheme.md'],
    jun24: [],
    JUN24_ITEMS: [],
    ALLOW: {},
}];

// The section's items: "N. **Type: X [Tests AOn]**" blocks inside the section that starts "### **SECTION …: <label>".
function sectionItems(md, label) {
    const heads = [...md.matchAll(/^### \*\*SECTION [A-Z]: (.+?)\*\*\s*$/gm)];
    const i = heads.findIndex((h) => h[1].startsWith(label));
    if (i < 0) return null;
    const body = md.slice(heads[i].index, i + 1 < heads.length ? heads[i + 1].index : md.length);
    const blocks = body.split(/^(?=\d+\.\s+\*\*Type:)/m).filter((b) => /^\d+\.\s+\*\*Type:/.test(b));
    return blocks.map((b) => ({ n: Number(b.match(/^(\d+)\./)[1]), ao: (b.match(/\[Tests (AO\d)\]/) || [])[1] || '?', text: b }));
}
// Quoted fragments on the lines that teach (never Options — distractors are deliberately not the mark scheme's words).
function fragments(item) {
    const out = [];
    for (const line of item.text.split('\n')) {
        if (!/^\s*\*\s+\*\*(Feedback|Why [A-Z]|WhyWrong):\*\*/.test(line)) continue;
        for (const m of line.matchAll(/["“]([^"“”]{2,}?)["”]/g)) {
            for (const part of m[1].split(/…|\.\.\.|\[BLANK\]|_{3,}/)) {
                const p = part.replace(/^[\s,;:.]+|[\s,;:.]+$/g, '');
                if (p.length >= 2) out.push(p);
            }
        }
    }
    return out;
}
function check(pilot, md, srcText) {
    const errs = [];
    const items = sectionItems(md, pilot.section);
    if (!items) return [`no section "${pilot.section}…" in ${pilot.bank}`];
    if (items.length !== pilot.count) errs.push(`section holds ${items.length} items, the pilot needs ${pilot.count}`);
    const nums = items.map((x) => x.n);
    nums.forEach((n, i) => { if (n !== i + 1) errs.push(`item numbering breaks at position ${i + 1} (found ${n}) — never renumber, append`); });
    const ao = {}; items.forEach((x) => { ao[x.ao] = (ao[x.ao] || 0) + 1; });
    for (const [k, v] of Object.entries(pilot.ao)) if ((ao[k] || 0) !== v) errs.push(`${k}: ${ao[k] || 0} items, the plan needs ${v}`);
    for (const it of items) {
        // Options are SHUFFLED at serve time (SWML_Quiz_Bank::shuffle_options), so a note that names an option by its
        // letter ("B is Level 1", "C (simple) then A") names the wrong option for most students. Identify by content.
        for (const line of it.text.split('\n')) {
            if (!/^\s*\*\s+\*\*(Feedback|Why [A-Z]|WhyWrong):\*\*/.test(line)) continue;
            // v7.20.817: "Section A is", "Source B," name a part of the paper or a source, never an option — the same names
            // SWML_Quiz_Bank::cites_option_letter() (v7.20.815, the server's predicate) removes before it looks.
            const body = line.replace(/^\s*\*\s+\*\*(Feedback|Why [A-Z]|WhyWrong):\*\*/, '')
                .replace(/\b(?:Sources?|Sections?|Spec|Specification|Paper|Component|Part|Text|Level|Question)\s+[A-E]\b/g, '');
            const m = body.match(/(?<![A-Za-z\u2019'])([A-D])(?=\s+(?:\(|is\b|then\b)|,\s*[A-D]\b)/);
            if (m) errs.push(`#${it.n} names option ${m[1]} by its letter — options shuffle when served, so name the answer by its words`);
        }
        if (pilot.ALLOW[it.n]) continue;
        const pool = pilot.JUN24_ITEMS.includes(it.n) ? srcText.main + ' ' + srcText.jun24 : srcText.main;
        const own = norm(it.text.split('\n').filter((l) => /^\s*\*\s+\*\*(Question|Options|Answer):\*\*/.test(l)).join(' '));
        for (const f of fragments(it)) {
            if (!pool.includes(norm(f)) && !own.includes(norm(f))) errs.push(`#${it.n} quotes "${f}" — not verbatim in ${pilot.JUN24_ITEMS.includes(it.n) ? 'the 2026 scheme, the knowledge file or June 2024' : 'the 2026 scheme or the knowledge file'}`);
        }
    }
    return errs;
}
const load = (pilot) => ({
    main: pilot.sources.map((p) => norm(fs.readFileSync(path.join(ROOT, p), 'utf8'))).join(' '),
    jun24: pilot.jun24.map((p) => norm(fs.readFileSync(path.join(ROOT, p), 'utf8'))).join(' '),
});

if (process.argv.includes('--selftest')) {
    const pilot = { ...PILOTS[0], count: 2, ao: { AO2: 2 } };
    const src = { main: norm('Shows perceptive and detailed understanding of language: Analyses the effects of the writer’s choices'), jun24: norm('the lizards darted') };
    const mk = (a, b) => '### **SECTION A: AQA (fixture)**\n\n1. **Type: MCQ [Tests AO2]**\n   * **Feedback:** ✓ Level 4 "' + a + '".\n\n2. **Type: MCQ [Tests AO2]**\n   * **Feedback:** "' + b + '"\n';
    const cases = [
        ['verbatim (curly apostrophe, line-joined)', mk('Analyses the effects of the writer\'s choices', 'Shows perceptive and detailed… language'), 0],
        ['a fabricated quote', mk('Analyses the impact of the writer\'s methods', 'Shows perceptive'), 1],
        ['a June 2024 quote outside the allowed items', mk('the lizards darted', 'Shows perceptive'), 1],
        ['a note that names an option by its letter', mk('Shows perceptive', 'Shows perceptive') + '   * **WhyWrong:** B is Level 1, then D.\n', 1],
    ];
    let bad = 0;
    for (const [name, md, want] of cases) {
        const got = check({ ...pilot, JUN24_ITEMS: [], ALLOW: {} }, md, src).length;
        const ok = want === 0 ? got === 0 : got >= want;
        if (!ok) bad++;
        console.log((ok ? '  ✓ ' : '  ✗ ') + name + (want ? ' fails' : ' passes') + (ok ? '' : ` (got ${got} error(s))`));
    }
    console.log(bad ? 'msa-quote-gate selftest FAILED' : 'msa-quote-gate selftest passed (4 cases)');
    process.exit(bad ? 1 : 0);
}

let failed = 0;
for (const pilot of PILOTS) {
    const md = fs.readFileSync(path.join(ROOT, pilot.bank), 'utf8');
    const errs = check(pilot, md, load(pilot));
    const allow = Object.entries(pilot.ALLOW).map(([n, why]) => `#${n} (${why})`).join(', ');
    console.log(`msa-quote-gate — ${pilot.bank} § ${pilot.section}…  (allow-listed: ${allow || 'none'})`);
    if (errs.length) { failed += errs.length; errs.forEach((e) => console.log('  ✗ ' + e)); }
    else console.log('  ✓ every quotation verbatim, ' + pilot.count + ' items, AO mix as planned');
}
process.exit(failed ? 1 : 0);
