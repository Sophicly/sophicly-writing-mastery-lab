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
 *   E. a sentence saying the inciting incident HANDS OVER a goal and calling that goal the
 *      SPECIFIC / picturable one (PEDAGOGY §22 rule 6, Neil 2026-09-06 / #458d — the general want
 *      is the inciting incident's output; the picturable finish line is Stunning Surprise #1's).
 *   F. structural twin of E: the CW Step-3 goal ask must not DEMAND the picturable finish line in
 *      its criteria, and must say both that the goal is general here and where the specific plan
 *      arrives. E alone could not see it — the demand sat in a bullet two paragraphs from the
 *      sentence that handed the goal over, and each half read correctly on its own.
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
// RULE E — the goal the inciting incident hands over, described at the WRONG GRADE.
// "hands / gives / produces … a goal" in the same sentence as a specificity marker. Deliberately
// NOT matching "given" or "granted": "a plan the character has not been given yet" is the correct
// teaching and must stay quiet.
const RE_HANDS_GOAL = /(?:inciting\s+incident|that\s+event|this\s+event)\b[^.!?]{0,60}?\b(?:hands?|handed|gives?|gave|produces?|yields?)\b[^.!?]{0,40}?\bgoal\b/i;
const RE_SPECIFIC_GOAL = /picturable|photograph|\bone\s+specific\b|\ba\s+single,?\s+physical\b|single,?\s+physical,?\s+visible/i;

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
            // E — the inciting incident's goal called the SPECIFIC one. Hauge's picturable test is
            //     not withdrawn, it is RELOCATED to Stunning Surprise #1 (PEDAGOGY §22 rule 6).
            if (RE_HANDS_GOAL.test(s) && RE_SPECIFIC_GOAL.test(s)) {
                push('E', 'calls the goal the inciting incident hands over the SPECIFIC/picturable one — '
                    + 'that grade of goal is Stunning Surprise #1\'s output, and demanding it here asks '
                    + 'the student to invent the plan a later step exists to produce', s);
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
    for (const d of ['protocols', 'resources']) {
        // v7.20.597: `resources/` was outside the scan, and the Creative Writing Reference Guide —
        // the 📖 Guidance rung the walk sends a stuck student to — carried the conflated definition
        // ("the event that shatters the protagonist's normal life") the whole time the gate was
        // reporting the walk clean. A gate that guards one of two student-facing copies guards
        // neither (feedback: `a_gate_guarding_one_of_two_sources_guards_nothing`).
        const p = path.join(ROOT, d);
        if (fs.existsSync(p)) walk(p, list);
    }
    return list.filter((f) => fs.existsSync(f));
}

// ─────────────────────────────────────────────────────────────────────────────
// RULE D — PLACEMENT, in the eight plot templates. Structural, not textual.
//
// Rules A–C police what a sentence SAYS. D polices where the beat SITS in
// `OUTLINE_CRITERIA.cwPlotArchetypes`, because the templates were teaching the right words in the
// wrong order: Stunning Surprise #1 sat at Stage II beat 7–9 — roughly eighteen beats BEFORE the
// threshold-crossing row that is our Act One curtain (Neil: "the stunning surprise only happens
// like halfway through stage two"). Edson names SS#1 and "Crossing the First Threshold" as the
// SAME moment, and it is what turns the general goal into a specific one — so the specific-goal
// row that opens Stage III must come after it, in every archetype, with no exceptions.
//
// D is deliberately about ORDER and PRESENCE, never about position-in-the-list: §22's addendum
// says the FUNCTION is the discriminator and the clock is only a tendency. "After X, before Y" is
// a claim about causation the student can read off the page; "at beat 26" would not be.
const RE_SS1_ROW = /stunning\s+surprise\s*\\?#\s*1/i;
const RE_THRESHOLD_ROW = /crosses?\s+the\s+threshold/i;
const RE_SPECIFIC_GOAL_ROW = /goal\s+becomes\s+much\s+more\s+specific/i;

function extractArchetypes(src) {
    const at = src.indexOf('cwPlotArchetypes:');
    if (at < 0) return null;
    let i = at + 'cwPlotArchetypes:'.length;
    while (src[i] !== '{') i++;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (!depth) break; }
    }
    // eslint-disable-next-line no-new-func
    return new Function('return ' + src.slice(start, i + 1) + ';')();
}

function ruleD(src, label, findings) {
    const arch = extractArchetypes(src);
    const push = (why, sentence) => findings.push({ label, rule: 'D', why, sentence, line: 0 });
    if (!arch) { push('cwPlotArchetypes not found — rule D cannot run, so it is failing loud', label); return; }
    Object.keys(arch).forEach((key) => {
        const a = arch[key] || {};
        const secs = Array.isArray(a.sections) ? a.sections : [];
        const di = secs.findIndex((s) => s.id === 'dream');
        if (di < 0) { push(`archetype "${key}" has no Stage II (dream) section`, key); return; }
        const rows = secs[di].criteria || [];
        const txt = (c) => String((c && c.label) || '') + ' ' + String((c && c.prompt) || '');
        const ss = rows.findIndex((c) => RE_SS1_ROW.test(txt(c)));
        const th = rows.findIndex((c) => RE_THRESHOLD_ROW.test(txt(c)));
        if (ss < 0) { push(`archetype "${key}" has no STUNNING SURPRISE #1 row in Stage II`, key); return; }
        if (th < 0) { push(`archetype "${key}" has no threshold-crossing row in Stage II`, key); return; }
        if (ss < th) {
            push(`archetype "${key}": STUNNING SURPRISE #1 sits at Stage II beat ${ss + 1}, BEFORE the `
                + `threshold-crossing beat ${th + 1} — so the act curtain lands before the act does`,
            String(rows[ss].label || '').slice(0, 150));
        }
        const later = secs.slice(di + 1);
        const hasSpec = later.some((s) => (s.criteria || []).some((c) => RE_SPECIFIC_GOAL_ROW.test(txt(c))));
        if (!hasSpec) {
            push(`archetype "${key}" has no "goal becomes much more specific" row after Stage II — `
                + `the beat that MAKES the goal specific then has nothing to hand it to`, key);
        }
    });
}

// Rule D's own self-test: the pre-fix shape must fail, the fixed shape must pass.
function selfTestD() {
    const shape = (ssFirst, withSpec) => 'cwPlotArchetypes: {'
        + ' "x": { sections: ['
        + '  { id: "dream", criteria: ['
        + (ssFirst ? '   { label: "STUNNING SURPRISE #1: x", prompt: "" }, { label: "Protagonist crosses the threshold", prompt: "" }'
            : '   { label: "Protagonist crosses the threshold", prompt: "" }, { label: "STUNNING SURPRISE #1: x", prompt: "" }')
        + '  ] },'
        + '  { id: "fascination", criteria: [' + (withSpec ? '{ label: "goal becomes much more specific", prompt: "" }' : '{ label: "something else", prompt: "" }') + '] }'
        + ' ] } }';
    const cases = [[shape(true, true), 1], [shape(false, false), 1], [shape(true, false), 2], [shape(false, true), 0]];
    let bad = 0;
    cases.forEach(([src, want], i) => {
        const f = [];
        ruleD(src, 'selftestD#' + i, f);
        if (f.length !== want) { bad++; console.error(`  ✗ rule-D self-test ${i}: expected ${want} finding(s), got ${f.length}`); }
    });
    return bad;
}

// ─────────────────────────────────────────────────────────────────────────────
// RULE F — the CW Step-3 goal ask, structurally. The twin of E, and it exists because E CANNOT
// see this defect: the demand sat in an "A strong goal:" bullet two paragraphs below the sentence
// that handed the goal over, so no single sentence was wrong. Block 4 (the inciting incident) was
// corrected at .596/.597 to hand over a GENERAL goal and say the specific plan comes later; block
// 5, the very next bubble, still required "one physical, picturable finish line". Two consecutive
// asks contradicted each other and the sweep passed over both.
//
// The criteria[] array is the right thing to police: bin/cw-keymatch-harness.js already proves
// every criterion is lifted verbatim from that ask's own bullets, so a clean criteria list is a
// clean bullet list, transitively. Neil ruled the staging on 2026-09-06 (FIXLIST #458d): general
// want at Step 3, specific plan at Stunning Surprise #1 — "both, in two stages".
function ruleF(src, label, findings) {
    const push = (why, sentence) => findings.push({ label, rule: 'F', why, sentence: String(sentence).slice(0, 190), line: 0 });
    // The fid appears more than once — the sidebar model lists it as a bare { fid, label } row.
    // The ASK is the occurrence that carries a criteria[] with it; anchoring on the first hit
    // policed the sidebar row and reported "no criteria" for ever.
    let at = -1;
    for (let i = src.indexOf("fid: 'cw-step-3-goal'"); i >= 0; i = src.indexOf("fid: 'cw-step-3-goal'", i + 10)) {
        if (/criteria:\s*\[/.test(src.slice(i, i + 400))) { at = i; break; }
    }
    if (at < 0) {
        push("the CW Step-3 goal ASK (fid 'cw-step-3-goal' with a criteria[]) was not found — rule F "
            + 'cannot run, so it fails loud', label);
        return;
    }
    const next = src.indexOf("{ fid: '", at + 10);
    const block = src.slice(at, next > at ? next : at + 6000);

    const cm = /criteria:\s*\[([\s\S]*?)\]/.exec(block);
    if (!cm) { push('the Step-3 goal ask carries no criteria[] — its self-assessment tick list cannot be checked', block); return; }
    if (RE_SPECIFIC_GOAL.test(cm[1])) {
        push('the Step-3 goal criteria DEMAND the specific/picturable finish line — that is Stunning '
            + "Surprise #1's output (PEDAGOGY §22 rule 6), and Step 3 sits before it", cm[1].replace(/\s+/g, ' ').trim());
    }

    const askM = /ask:\s*\n?\s*'((?:[^'\\]|\\.)*)'/.exec(block);
    const ask = askM ? decode(askM[1]) : '';
    if (!ask) { push('the Step-3 goal ask string could not be read — rule F fails loud rather than passing blind', block); return; }
    if (!/\bgeneral\b/i.test(ask)) {
        push('the Step-3 goal ask never says the goal is GENERAL at this stage, so a student reads it as '
            + 'the final, specific one', ask);
    }
    if (!RE_STUNNING.test(ask)) {
        push('the Step-3 goal ask never says where the SPECIFIC plan arrives (the stunning surprise), so '
            + 'the two stages are never connected for the student', ask);
    }
}

// Rule F's own self-test: the pre-fix shape must fail on all three counts, the shipped shape pass.
function selfTestF() {
    const mk = (criteria, ask) => "{ fid: 'cw-step-3-goal', label: 'Goal', criteria: [" + criteria
        + "], ask:\n                    '" + ask + "' },\n                { fid: 'cw-step-3-obstacle', label: 'Obstacle', criteria: [], ask: 'x' },";
    const OLD = mk("\n 'is one physical, picturable finish line',\n 'stands for a deeper need',\n",
        '**5 of 7 - The goal**\\n\\nThat event hands your protagonist a **goal** - something they now desperately want.');
    const NEW = mk("\n 'is a want you can say in a few plain words',\n 'stands for a deeper need',\n",
        '**5 of 7 - The goal**\\n\\nThat event hands your protagonist a **goal**. At this stage it is usually still **general**: get out, get even, get home. The one specific plan arrives at the **stunning surprise**.');
    const cases = [[OLD, 3], [NEW, 0], ["{ fid: 'cw-step-3-flaw' }", 1]];
    let bad = 0;
    cases.forEach(([src, want], i) => {
        const f = [];
        ruleF(src, 'selftestF#' + i, f);
        if (f.length !== want) {
            bad++;
            console.error(`  ✗ rule-F self-test ${i}: expected ${want} finding(s), got ${f.length}`
                + (f.length ? ' — ' + f.map((x) => x.why.slice(0, 60)).join(' | ') : ''));
        }
    });
    return bad;
}

// ── run ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
console.log('inciting-incident gate (PEDAGOGY.md §22 + 2026-09-05 addendum)');

const selfBad = selfTest() + selfTestD() + selfTestF();
if (selfBad) {
    console.error(`\n❌ inciting-incident gate: ${selfBad} SELF-TEST(S) FAILED — the gate itself is broken (a check that cannot fire is worse than none).`);
    process.exit(1);
}
console.log('  self-test: 10/10 text + 4/4 placement + 3/3 goal-staging ok (each rule proven to fire and to stay quiet)');

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
    // D runs on whichever file carries the templates — so `--file <a copy>` checks that copy.
    if (/wml-assessment\.js$/.test(f)) { ruleD(raw, rel, findings); ruleF(raw, rel, findings); }
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
    console.error('And ask for each grade at its own step: the GENERAL want at CW Step 3, the picturable');
    console.error('finish line at Stunning Surprise #1 in Step 6 (PEDAGOGY §22 rule 6). Welcome a specific');
    console.error('plan early — one event can do both jobs — but never DEMAND it at Step 3.');
    process.exit(1);
}

console.log('✅ inciting-incident gate passed — no beat taught as the other, no position-only definition.');
