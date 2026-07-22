#!/usr/bin/env node
/* eslint-env node */
/**
 * KNOWN-CONTEXT LINT (WML CLAUDE.md #3 — the paste-wall law, Neil 2026-07-21).
 *
 * A planning protocol MUST NOT ask the student to type/paste/identify context the session
 * already binds (poem/text title, author, poem or extract TEXT, the question, board, paper,
 * topic). That data lives in the shortcode atts / topicData / swml_poems_* banks — resolve it,
 * never re-demand it. The one exception is a deliberate RETRIEVAL TEST (framed as such), and the
 * off-bank paste FALLBACK — both opt out per-line with a `lint-ok:` marker.
 *
 * ROLLOUT: hard-FAIL only for the CONVERTED lanes (below); every other board WARNs, so the debt is
 * VISIBLE (never silent) but does not block until that board is converted. Add a board to
 * CONVERTED the moment its b1 stops demanding pasted context.
 *
 * The proof this has teeth: run it against a poetry b1 that still says "the entire poem text
 * (copy and paste the full poem)" → it FAILS. Piece 1 (the poem picker) removes that → it passes.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Boards whose planning b1 has been converted to bank/topicData resolution → hard FAIL on a hit.
// Everything else → WARN (tracked debt). Path fragments, matched against the protocol dir.
// ROLLOUT: a lane is added here the MOMENT its b1 stops demanding pasted context — the promotion
// IS the "fix proven" assertion (the lane must be clean, or the gate goes red). Empty until the
// Phase-1 b1 poem-picker lands and flips aqa/poetry/planning + aqa/literature/planning clean.
// v7.20.246: aqa/poetry/planning CONVERTED — b1 opens code-served (focus poem + question from
// topicData, comparison poem from the b1 theme-chip picker; the router injects both texts).
// aqa/literature/planning is NOT converted yet (single-text essays need a different fix — its b1
// still asks for the text title + question; separate, tracked work).
const CONVERTED = ['aqa/poetry/planning'];

// Demand-phrases: asking the student to hand over context the system holds. Case-insensitive.
// Each carries a short label for the failure message.
// A context-noun the system already holds — the object of an illegitimate demand.
const CTX = '(poem|text|question|extract|essay|anthology)';
const PATTERNS = [
    // "copy and paste" only counts when its object is known context (NOT the "copy your ideas to Notes" tip).
    { re: new RegExp('copy and paste[^.\\n]{0,45}\\b' + CTX + '\\b', 'i'),  why: 'copy-and-paste of known context' },
    { re: new RegExp('\\bpaste (the|that|it|in)\\b[^.\\n]{0,45}\\b' + CTX + '\\b', 'i'), why: 'paste demand' },
    { re: /\b(entire|full|whole) poem(’s)?( text)?\b/i,                     why: 'demands the full poem text' },
    { re: new RegExp('provide (the|your)[^.\\n]{0,40}\\b' + CTX + '\\b', 'i'), why: 'demands provided poem/text/question' },
    { re: /\btell me the\b[^.\n]{0,30}\b(title|author|poet|question)\b/i,   why: 'asks for title/author/question' },
    { re: /what (is|are) the[^.\n]{0,30}\b(title|question)\b/i,             why: 'asks what the title/question is' },
    // "type the/your/it poem" — a directive; "type OF poem" (describing form) is excluded by requiring an article.
    { re: new RegExp('\\btype (in |out |up )?(the|your|it|that|your own)\\b[^.\\n]{0,25}\\b' + CTX + '\\b', 'i'), why: 'asks the student to type the poem/question' },
];
// A line opts out with a trailing marker: <!-- lint-ok: fallback --> (off-bank paste) or
// <!-- lint-ok: retrieval-test --> (a deliberate recall/quiz test where producing IS the pedagogy).
const OPTOUT = /<!--\s*lint-ok:\s*(fallback|retrieval-test)\b/i;

function planningDirs(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (e.name === 'planning') out.push(p); else planningDirs(p, out); }
    }
    return out;
}
const isConverted = rel => CONVERTED.some(c => rel.replace(/\\/g, '/').includes(c));

let failN = 0, warnN = 0, filesHit = 0;
const protoRoot = path.join(ROOT, 'protocols');
for (const dir of planningDirs(protoRoot, [])) {
    const relDir = path.relative(ROOT, dir);
    const converted = isConverted(relDir);
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.md'))) {
        const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
        lines.forEach((line, i) => {
            if (OPTOUT.test(line)) return;
            for (const p of PATTERNS) {
                if (p.re.test(line)) {
                    const loc = `${relDir}/${f}:${i + 1}`;
                    const tag = converted ? 'FAIL' : 'warn';
                    console.log(`${tag === 'FAIL' ? '❌ FAIL' : '⚠️  warn'} ${loc} — ${p.why}: ${line.trim().slice(0, 90)}`);
                    if (converted) failN++; else warnN++;
                    filesHit++;
                    return; // one finding per line
                }
            }
        });
    }
}

console.log('');
if (warnN) console.log(`⚠️  ${warnN} known-context demand(s) in UNCONVERTED boards (tracked debt — convert their b1 to clear).`);
if (failN) {
    console.error(`❌ known-context-lint: ${failN} demand(s) in CONVERTED lane(s) — a converted protocol must resolve context from data, never re-ask (WML CLAUDE.md #3). Fix, or mark a genuine fallback/retrieval-test with <!-- lint-ok: fallback|retrieval-test -->.`);
    process.exit(1);
}
console.log(`✅ known-context-lint passed (converted lanes clean${warnN ? `; ${warnN} debt line(s) flagged in unconverted boards` : ''}).`);
