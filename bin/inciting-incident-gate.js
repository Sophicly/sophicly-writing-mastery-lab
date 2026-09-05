#!/usr/bin/env node
/* eslint-env node */
/**
 * inciting-incident-gate.js — PEDAGOGY.md §22 + its 2026-09-05 addendum, made mechanical.
 *
 * THE RULING. Edson's INCITING INCIDENT and his STUNNING SURPRISE are two beats doing two jobs.
 * The Inciting Incident begins THIS story and no other and hands the protagonist a GENERAL goal
 * (get out, get even, get home). A Stunning Surprise turns a general want into ONE specific plan
 * (#1) or destroys that plan (#2). ⭐ The FUNCTION is the discriminator; the POSITION is only a
 * tendency — Edson: "the Inciting Incident can happen any time in Act One" — so ONE EVENT CAN DO
 * BOTH JOBS, and then the two beats coincide.
 *
 * WHY A GATE AND NOT A PARAGRAPH. Neil ruled this on 2026-07-29 and found the same conflated
 * sentence still on screen in a live lesson 38 days later: "You've defined inciting incident as
 * the stunning surprise. That's not correct." Prose lost; a build failure will not.
 *
 * WHAT IT FAILS ON — three rules, each with a self-test that proves it can still fire:
 *   A. a sentence that names the inciting incident AND the stunning surprise as one thing;
 *   B. the Stunning Surprise's "shatters the normal life / ordinary world" wording used anywhere
 *      in student-facing teaching text (that is the ACT-ENDING beat, never the opening one);
 *   C. a sentence that DEFINES the inciting incident purely by WHERE IT SITS, with no mention of
 *      the general goal anywhere in the surrounding block (the addendum's failure mode: swapping
 *      one wrong definition for another).
 *
 * SCOPE: frontend/wml-assessment.js (the CW walk + its documents) and every protocols/**\/*.md.
 * The source stores em-dashes and quotes as — / “ escapes and newlines as \n, so the
 * scanner DECODES those first — a probe that counted literal characters between them matched
 * nothing and reported the broken file clean (handoff, 2026-09-05).
 *
 * Usage:  node bin/inciting-incident-gate.js [--file <path>]...   (exit 1 = fail)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── decode the forms the sources actually store ───────────────────────────────
function decode(raw) {
    return raw
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/\\n/g, '\n')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/<[^>\n]{0,120}>/g, ' ')          // strip HTML tags, keep the prose
        .replace(/[*_`>|]/g, ' ')                  // markdown emphasis / table pipes
        .replace(/\\#/g, '#')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[—–]/g, ' - ')
        .replace(/[ \t]+/g, ' ');
}

// A "block" is a paragraph-ish run; a "sentence" is a run inside it. Both are needed: the
// conflation can sit in ONE sentence, while a definition and its position claim often straddle
// a line break ("**4 of 7 - The inciting incident**\n\nThis is the event that ...").
function blocksOf(text) { return text.split(/\n\s*\n/); }
function sentencesOf(block) {
    return block
        .split(/(?<=[.!?;])\s+|\n/)
        .map((s) => s.trim())
        .filter(Boolean);
}

const RE_INCITING = /inciting\s+incident/i;
const RE_STUNNING = /stunning\s+surprise/i;
// Edson's Stunning Surprise wording. "shatters the/their/your normal life | ordinary world | world".
const RE_SHATTER = /shatter(?:s|ing)?\s+(?:the|their|your|his|her|a)\s+(?:protagonist'?s?\s+|hero'?s?\s+|character'?s?\s+)?(?:normal\s+|ordinary\s+|everyday\s+|whole\s+)?(?:life|world|lives)/i;
// A definitional frame: "the inciting incident is …", "This is the inciting incident - …",
// "Inciting Incident: …", "2. Inciting Incident - …".
const RE_DEFINES = /inciting\s+incident\b[^.?!]{0,24}?(?:\bis\b|\bmeans\b|\s[-:]\s|—)/i;
// Position-only claims.
const RE_POSITION = /(?:near|at)\s+the\s+(?:very\s+)?(?:start|beginning|opening)|first\s+(?:one\s+to\s+)?(?:few\s+)?(?:seven\s+)?(?:minutes|pages|scene|chapter)|opening\s+(?:minutes|pages|scene|image)|act[- ]one\s+curtain|end\s+of\s+act\s+one|in\s+the\s+first\s+\d+\s+(?:minutes|pages)/i;
// The job — what a correct definition must name somewhere in the same block.
const RE_GENERAL_GOAL = /general(?:,)?\s+(?:visible\s+)?goal|general\s+want|get\s+out,\s*get\s+even,\s*get\s+home|something\s+to\s+want|begins?\s+this\s+story\s+and\s+no\s+other/i;

function scanText(text, label, findings) {
    const push = (rule, why, sentence) =>
        findings.push({ label, rule, why, sentence: sentence.slice(0, 190) });
    // Rule B only speaks about the INCITING INCIDENT's definition, so it needs the term in view
    // somewhere in the unit being scanned (a walk chunk puts the heading and the definition in
    // two different paragraphs). Without this, "a shattered life" in a poem's quiz bank trips it.
    const incidentCtx = RE_INCITING.test(text);

    blocksOf(text).forEach((block) => {
        const sents = sentencesOf(block);
        sents.forEach((s) => {
            // A — the two beats named as one thing.
            if (RE_INCITING.test(s) && (RE_STUNNING.test(s) || RE_SHATTER.test(s))) {
                // Legal: an explicit DISTINCTION ("is not the stunning surprise", "a different job").
                const distinguishes = /\bnot\s+(?:the\s+|a\s+)?(?:same|stunning)|different\s+(?:job|beat|thing)|two\s+(?:different\s+)?beats/i.test(s);
                if (!distinguishes) push('A', 'names the inciting incident as / with the stunning surprise', s);
            }
            // B — the Stunning Surprise's "shatters the normal life" wording, used anywhere.
            if (incidentCtx && RE_SHATTER.test(s)) {
                push('B', 'uses the Stunning Surprise\'s "shatters the normal life" wording', s);
            }
        });

        // C — a definition carried by POSITION alone, with the general goal named nowhere in the
        //     block. The addendum's failure mode: position is a tendency, never the definition.
        const defSent = sents.find((s) => RE_DEFINES.test(s) && RE_POSITION.test(s));
        if (defSent && !RE_GENERAL_GOAL.test(block)) {
            push('C', 'defines the inciting incident by WHERE IT SITS without naming the general goal', defSent);
        }
    });
}

// ── self-test: a rule that can no longer fire is worse than no rule at all ────
function selfTest() {
    const cases = [
        // [text as the source stores it, the rules that MUST fire]
        ['<p><strong>2. Inciting Incident</strong> \\u2014 The \\u201cstunning surprise\\u201d \\u2014 the external event that shatters the protagonist\\u2019s normal life and forces them into the story.</p>', ['A', 'B']],
        ['**4 of 7 \\u2014 The inciting incident**\\n\\nThis is the event that shatters your protagonist\\u2019s normal life and forces them into the story.', ['B']],
        ["outlineRowHTML({ id: 'incident', label: 'Inciting Incident', prompt: 'The event that shatters their normal life' })", ['A', 'B']],
        ['The inciting incident is the beat near the start of the story, in the first seven minutes.', ['C']],
        // must NOT fire \u2014 the corrected teaching, and a false positive that used to trip rule B
        ['The inciting incident is the event that begins this story and no other. It usually comes early, but it can land anywhere in the opening act. What it produces is a general goal: get out, get even, get home.', []],
        ['**4 of 7 \\u2014 The inciting incident**\\n\\nAnd it is not the stunning surprise, which does a different job: that beat turns a general want into one specific plan.', []],
        ['<p><strong>2. Inciting Incident</strong> \\u2014 the event that begins this story and no other. It usually comes early, near the start, but the job names it, not where it sits. What it produces is a general goal.</p>', []],
        ['WhyWrong: This is true - the irregular form and the swings between past and present are exactly how Owen makes the structure mirror a shattered life.', []],
    ];
    let bad = 0;
    cases.forEach(([raw, want], i) => {
        const f = [];
        scanText(decode(raw), 'selftest#' + i, f);
        const got = [...new Set(f.map((x) => x.rule))].sort().join(',');
        const exp = [...want].sort().join(',');
        if (got !== exp) {
            bad++;
            console.error(`  ✗ self-test ${i}: expected [${exp || 'none'}], got [${got || 'none'}]  — ${raw.slice(0, 80)}`);
        }
    });
    return bad;
}

// ── file collection ──────────────────────────────────────────────────────────
function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
    }
    return out;
}

function targets(argv) {
    const explicit = [];
    for (let i = 0; i < argv.length; i++) if (argv[i] === '--file') explicit.push(argv[++i]);
    if (explicit.length) return explicit;
    const list = [path.join(ROOT, 'frontend', 'wml-assessment.js')];
    const protoDir = path.join(ROOT, 'protocols');
    if (fs.existsSync(protoDir)) walk(protoDir, list);
    return list.filter((f) => fs.existsSync(f));
}

// ── run ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
console.log('inciting-incident gate (PEDAGOGY.md §22 + 2026-09-05 addendum)');

const selfBad = selfTest();
if (selfBad) {
    console.error(`\n❌ inciting-incident gate: ${selfBad} SELF-TEST(S) FAILED — the gate itself is broken (a check that cannot fire is worse than none).`);
    process.exit(1);
}
console.log('  self-test: 8/8 ok (each rule proven to fire and to stay quiet)');

const files = targets(argv);
const findings = [];
files.forEach((f) => {
    const raw = fs.readFileSync(f, 'utf8');
    const rel = f.startsWith(ROOT) ? (path.relative(ROOT, f) || f) : f;
    // line-anchored so a report points somewhere useful
    raw.split('\n').forEach((line, i) => {
        const before = findings.length;
        scanText(decode(line), rel, findings);
        for (let k = before; k < findings.length; k++) findings[k].line = i + 1;
    });
});

console.log(`  scanned ${files.length} file(s)`);

if (findings.length) {
    console.error(`\n❌ inciting-incident gate FAILED — ${findings.length} site(s):\n`);
    findings.forEach((f) => {
        console.error(`  [${f.rule}] ${f.label}:${f.line}`);
        console.error(`      ${f.why}`);
        console.error(`      “${f.sentence}”`);
    });
    console.error('\nFix: teach the JOB, not the position. Inciting Incident = begins THIS story and');
    console.error('hands the protagonist a GENERAL goal (get out, get even, get home); it usually comes');
    console.error('early but can land anywhere in the opening act. Stunning Surprise = turns a general');
    console.error('want into ONE specific plan (#1) or destroys the plan (#2). One event can do both.');
    process.exit(1);
}

console.log('✅ inciting-incident gate passed — no beat taught as the other, no position-only definition.');
