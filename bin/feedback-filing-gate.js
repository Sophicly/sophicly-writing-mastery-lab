#!/usr/bin/env node
/* eslint-env node */
/**
 * FEEDBACK AUTO-FILING GATE (v7.20.621 — Neil's ask, 2026-09-14: "We have to create a gate for
 * the auto filing.")
 *
 * THE DEFECT IT EXISTS TO KILL, found by Neil driving IGCSE Lang P1 on staging:
 * Sophia marked Q1, Q2 and Q3 correctly IN CHAT and filed NOTHING into the document — while Q4
 * filed perfectly in the same session. The Score Summary then read 7/90 (Q4's 6.5 rounded) and
 * called an 11/11 start "Grade 1, 8%".
 *
 * ROOT CAUSE — a write-key != read-key mismatch between PROSE and a REGEX:
 *   the protocol instructs   "Total Mark for Q2: [X] / 4"
 *   the reader requires      /Q\s*([1-5])\s*Total\b/        ("Q2 Total")
 *                       or   /Total:\s*\d+(?:\.\d+)?\s*\/\s*\d+/   ("Total: 4/4")
 * "TOTAL Mark for Q2:" has Q and Total in the wrong ORDER and words between "Total" and ":",
 * so it matches neither. AQA writes "Q1 Total: X/4" and files fine. Nothing anywhere compared
 * the two sides, and the failure is SILENT — the marking looks perfect in chat.
 *
 * WHAT THIS GATE DOES — it never re-implements the reader. It SLICES the two live detector
 * regexes out of frontend/wml-assessment.js and runs them against the literal total-lines each
 * assessment protocol instructs. A question is considered fileable if EITHER:
 *   (a) the protocol emits an @FB_BEGIN card for it (marker-driven filing), OR
 *   (b) its instructed total-line matches a live detector (fallback detection).
 * Anything else is a question that will mark in chat and file nothing.
 *
 * Run: node bin/feedback-filing-gate.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

// ── 1. SLICE THE LIVE READER REGEXES (never retyped — a copy would drift) ────────────────────
function sliceRegex(label, marker, re) {
    const i = SRC.indexOf(marker);
    if (i === -1) { console.error(`❌ feedback-filing-gate: cannot find ${label} (${marker}) in wml-assessment.js — the reader moved; update this gate.`); process.exit(1); }
    const m = SRC.slice(i, i + 400).match(re);
    if (!m) { console.error(`❌ feedback-filing-gate: found ${label} but could not extract its regex literal.`); process.exit(1); }
    return m[1];
}
// _detectQuestionTotal's header test
const HDR_SRC = sliceRegex('_detectQuestionTotal HDR', 'const HDR = ', /const HDR = (\/.*?\/[gimsuy]*);/);
// _detectFeedbackCard's score-total test
const SCORE_SRC = sliceRegex('_detectFeedbackCard hasScoreTotal', 'const hasScoreTotal = ', /const hasScoreTotal = (\/.*?\/[gimsuy]*)\.test/);
const GOLD_SRC = sliceRegex('_detectFeedbackCard hasGold', 'const hasGold = ', /const hasGold = (\/.*?\/[gimsuy]*)\.test/);

function mk(src) { const m = src.match(/^\/([\s\S]*)\/([gimsuy]*)$/); return new RegExp(m[1], m[2].replace('g', '')); }
const HDR = mk(HDR_SRC), SCORE = mk(SCORE_SRC), GOLD = mk(GOLD_SRC);

console.log('— READER (sliced live from wml-assessment.js):');
console.log('    _detectQuestionTotal HDR    ' + HDR_SRC);
console.log('    _detectFeedbackCard  score  ' + SCORE_SRC);
console.log('    _detectFeedbackCard  gold   ' + GOLD_SRC);
console.log();

// ── 2. FIND EVERY ASSESSMENT PROTOCOL ────────────────────────────────────────────────────────
function walk(dir, out) {
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!p.includes('_superseded')) walk(p, out); }
        else if (/^protocol-a-assessment.*\.md$/.test(e.name)) out.push(p);
    }
    return out;
}
const protocols = walk(path.join(ROOT, 'protocols'), []).sort();

// A line that INSTRUCTS a per-question total. We look for the literal the model is told to emit.
// Deliberately broad on the left (Total … Q / Q … Total) so a mis-ordered form is CAUGHT, not missed.
const TOTAL_LINE = /^.*\bTotal\b.*$/i;
const MENTIONS_Q  = /\bQ(?:uestion)?\s*([1-9])\b/i;


// ── THE RATCHET ─────────────────────────────────────────────────────────────────────────────
// 24 protocols file NOTHING today: every board except AQA (and now Edexcel IGCSE Lang P1) marks
// in chat and writes nothing into the student's document. That is a real, large defect — but it
// predates this gate, so failing the build on all of it would only get the gate switched off.
// Instead: this list is the KNOWN DEBT. A protocol not on it that cannot file FAILS the build,
// and an entry that starts passing FAILS TOO (delete it — that is how the list shrinks).
// ⛔ Never add a line here to silence a port you are building. Fix it: add @FB_BEGIN cards,
//    anchors are protocols/aqa/{language1,language2,literature}/modules/protocol-a-assessment.md.
const KNOWN_UNFILED = new Set([
    'protocols/ccea/prose/modules/protocol-a-assessment.md',
    'protocols/ccea/unseen-prose/modules/protocol-a-assessment.md',
    'protocols/edexcel-igcse/heritage/modules/protocol-a-assessment.md',
    'protocols/edexcel-igcse/literature/modules/protocol-a-assessment.md',
    'protocols/edexcel-igcse/modern-prose/modules/protocol-a-assessment.md',
    'protocols/edexcel-igcse/modern/modules/protocol-a-assessment.md',
    'protocols/edexcel/19th_century/modules/protocol-a-assessment.md',
    'protocols/edexcel/language1/modules/protocol-a-assessment.md',
    'protocols/edexcel/language2/modules/protocol-a-assessment.md',
    'protocols/edexcel/modern/modules/protocol-a-assessment.md',
    'protocols/edexcel/poetry/modules/protocol-a-assessment.md',
    'protocols/edexcel/shakespeare/modules/protocol-a-assessment.md',
    'protocols/edexcel/unseen/modules/protocol-a-assessment.md',
    'protocols/eduqas/language1/modules/protocol-a-assessment.md',
    'protocols/eduqas/language2/modules/protocol-a-assessment.md',
    'protocols/eduqas/literature/modules/protocol-a-assessment.md',
    'protocols/eduqas/modern/modules/protocol-a-assessment.md',
    'protocols/eduqas/poetry/modules/protocol-a-assessment-poetry.md',
    'protocols/eduqas/shakespeare/modules/protocol-a-assessment.md',
    'protocols/eduqas/unseen/modules/protocol-a-assessment.md',
    'protocols/ocr/literature/modules/protocol-a-assessment.md',
    'protocols/ocr/poetry/modules/protocol-a-assessment.md',
    'protocols/shared/assessment/protocol-a-assessment.md',
    'protocols/sqa/critical-reading/modules/protocol-a-assessment.md'
]);

let fail = 0, checked = 0;
const rows = [];

for (const file of protocols) {
    const rel = path.relative(ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    const fbCount = (text.match(/@FB_BEGIN/g) || []).length;
    const hasFB = fbCount > 0;
    const fbQs = new Set();
    for (const m of text.matchAll(/@FB_BEGIN\s*\{[^}]*"q"\s*:\s*"([^"]+)"/g)) {
        const n = String(m[1]).match(/\d+/); if (n) fbQs.add(n[0]);
    }

    // collect the per-question total lines this protocol instructs
    const perQ = new Map(); // qNum -> [{line, ok}]
    for (const raw of text.split('\n')) {
        if (!TOTAL_LINE.test(raw)) continue;
        // only lines that name a question AND look like an emitted total (carry a tariff)
        if (!MENTIONS_Q.test(raw)) continue;
        if (!/\/\s*\d|out of\s*\d/i.test(raw)) continue;
        // skip prose ABOUT totals (rules/《never round》notes) — we want emitted literals
        if (/never|do not|don't|rounding happens|plain sum|=\s*the plain/i.test(raw)) continue;
        const q = raw.match(MENTIONS_Q)[1];
        // the literal the model would print: strip our markdown escaping + bold
        const literal = raw.replace(/\\/g, '').replace(/\*\*/g, '').replace(/^[\s*\-0-9.]+/, '').trim();
        const ok = HDR.test(literal) || SCORE.test(literal);
        if (!perQ.has(q)) perQ.set(q, []);
        perQ.get(q).push({ literal, ok });
    }

    if (!perQ.size && !hasFB) {
        const known = KNOWN_UNFILED.has(rel);
        if (!known) fail++;
        rows.push({ rel, known, status: (known ? '· known debt' : '❌ NEW') + ' — NOTHING CAN FILE: no @FB_BEGIN cards and no readable total line', vacuum: true });
        continue;
    }
    checked++;
    if (!perQ.size && hasFB) { rows.push({ rel, status: `✅ ok (marker-driven: ${fbCount} @FB_BEGIN card(s); marks by section, not question number)` }); continue; }

    const bad = [];
    for (const [q, lines] of [...perQ.entries()].sort()) {
        if (fbQs.has(q)) continue;                    // marker-driven: filing does not depend on prose
        if (lines.some(l => l.ok)) continue;          // at least one instructed literal is readable
        bad.push({ q, lines });
    }

    if (bad.length) {
        const known = KNOWN_UNFILED.has(rel);
        if (!known) fail++;
        rows.push({ rel, known, status: `${known ? '· known debt' : '❌ NEW'} — ${bad.length} question(s) file NOTHING`, bad, hasFB, fbCount });
    } else {
        rows.push({ rel, status: `✅ ok (${perQ.size} question total(s)${hasFB ? `, ${fbCount} @FB_BEGIN card(s)` : ', fallback-detected only — fragile, prefer @FB cards'})` });
    }
}

for (const r of rows) {
    if (r.vacuum) { console.log(`${r.known ? '·' : '❌'} ${r.rel}`); console.log(`     ${r.status}`); console.log('     Every mark it gives is chat-only. Add @FB_BEGIN cards (AQA P1/P2/Literature are the anchors).'); continue; }
    console.log(`${r.status.startsWith('✅') ? '✅' : (r.known ? '·' : '❌')} ${r.rel}`);
    console.log(`     ${r.status}`);
    if (r.bad) {
        console.log(`     @FB_BEGIN cards in this protocol: ${r.hasFB ? r.fbCount : 'NONE'}`);
        for (const b of r.bad) {
            console.log(`     ⛔ Q${b.q} — no readable total line. The protocol instructs:`);
            b.lines.slice(0, 2).forEach(l => console.log(`          "${l.literal.slice(0, 110)}"`));
            console.log(`        Neither detector matches, so Sophia marks it in chat and the box stays empty.`);
            console.log(`        FIX: emit the canonical form on its own line — "Q${b.q} Total: X/N" — or add an @FB_BEGIN card.`);
        }
    }
}

// an entry that now PASSES must be deleted — that is how the debt shrinks
const nowPassing = [...KNOWN_UNFILED].filter(k => !rows.some(r => r.rel === k && (r.vacuum || r.bad)));
if (nowPassing.length) {
    fail += nowPassing.length;
    console.log('\n❌ STALE KNOWN_UNFILED entr(ies) — these now file correctly, delete them from the list:');
    nowPassing.forEach(k => console.log('     ' + k));
}
const debt = rows.filter(r => r.known).length;
console.log(`\n— DEBT: ${debt} protocol(s) still file nothing (known). Only AQA + Edexcel IGCSE Lang P1 file today.`);
console.log();
if (fail) {
    console.error(`❌ feedback-filing-gate: ${fail} NEW or STALE finding(s). A protocol that marks in chat and files nothing is a silent defect — the student sees marks and the document stays empty.`);
    process.exit(1);
}
console.log(`✅ feedback-filing-gate passed (${checked} assessment protocol(s); every per-question total is either @FB-carded or matches a live detector).`);
