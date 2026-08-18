#!/usr/bin/env node
/* eslint-env node */
/**
 * tariff-gate.js — every mark a student is scored against must be QUOTED from the board's own PDF.
 *
 * WHY THIS EXISTS (Neil, 2026-08-18): "one thing I've noticed about Opus 5 is that it always makes
 * the first attempt a guess. It guesses, and then I have to check it." He is right, and prose rules
 * have not stopped it — CLAUDE.md §19 ("never guess, always measure") was already in force during
 * the failures it was written for. The live proof on the marking side: Edexcel IGCSE Lang P1 marked
 * Q2 out of 3 (real: 4) and Q3 out of 6 (real: 5), and told students to write 6 sentences where the
 * paper wants 5. Authored 2026-04-08, live for FOUR MONTHS, invisible to every check we owned.
 *
 * ⭐ THE LOAD-BEARING IDEA — CHECK THE CITATION, NOT THE CONSISTENCY.
 * A gate that only diffs our files against each other is a check that duplicates its subject: a
 * model that guesses "3" writes 3 in both places and the gate agrees. So every declared mark must
 * carry a `quote` that is VERBATIM PRESENT IN THE BOARD'S OWN PDF, and the gate re-opens that PDF
 * and looks for it. You cannot invent a tariff without inventing a string that has to exist in
 * Pearson's / Cambridge's document.
 *
 * ⚠️ A TOTALS CHECK CANNOT CATCH A WRONG TARIFF SET (root CLAUDE.md, Neil 2026-08-16):
 * 2+3+6+12+22 and 2+4+5+12+22 both make 45. Arithmetic is check C here, never the whole check.
 *
 * WHAT IT CHECKS, per paper source in protocols/_marks/*.json:
 *   A CITATION   every quote appears verbatim in the cited PDF        ← the anti-guess check
 *   B QUOTE↔NUM  the declared number appears inside its own quote     (digits or words: "four")
 *   C ARITHMETIC components sum to the question; questions sum to the paper total
 *   D SPEC JSON  declared marks/AOs match language-/literature-paper-specs.json
 *   E PROTOCOL   declared marks match the tariffs written in the protocol .md
 *   F COVERAGE   which papers have no source file at all (loud, never silent)
 *
 * USAGE:  node bin/tariff-gate.js [--list] [--only <substring>] [--verbose]
 * EXIT:   0 all gated papers clean · 1 any mismatch · 2 the gate itself could not run
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MARKS_DIR = path.join(ROOT, 'protocols', '_marks');
const CACHE_DIR = path.join(MARKS_DIR, '.pdftext-cache');
const SPEC_FILES = {
    language: path.join(ROOT, 'protocols', 'shared', 'language-paper-specs.json'),
    literature: path.join(ROOT, 'protocols', 'shared', 'literature-paper-specs.json'),
};

const args = process.argv.slice(2);
const OPT = {
    list: args.includes('--list'),
    verbose: args.includes('--verbose'),
    only: (() => { const i = args.indexOf('--only'); return i >= 0 ? args[i + 1] : null; })(),
};

const RED = '\x1b[31m', GRN = '\x1b[32m', YEL = '\x1b[33m', DIM = '\x1b[2m', OFF = '\x1b[0m';
const problems = [];
const notes = [];
let checksRun = 0;

const fail = (paper, check, msg) => problems.push({ paper, check, msg });
const note = (msg) => notes.push(msg);

/* ─── PDF text, cached ────────────────────────────────────────────────────────────────────────
 * pdftotext is required. If it is missing we EXIT 2 — a gate that silently skips its only real
 * check is worse than no gate, because a skip reads as a pass (root CLAUDE.md §10 fail loud). */
function pdfText(absPdf) {
    if (!fs.existsSync(absPdf)) return null;
    const stat = fs.statSync(absPdf);
    const key = Buffer.from(absPdf).toString('base64url').slice(-120) + '_' + stat.size + '.txt';
    const cached = path.join(CACHE_DIR, key);
    if (fs.existsSync(cached)) return fs.readFileSync(cached, 'utf8');
    let txt;
    try {
        txt = execFileSync('pdftotext', ['-layout', absPdf, '-'], {
            encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
        });
    } catch (e) {
        console.error(`${RED}tariff-gate: pdftotext failed on${OFF} ${absPdf}\n  ${e.message}`);
        process.exit(2);
    }
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cached, txt);
    return txt;
}

/**
 * Resolve an authority path. `MSR/…` means the shared mark-scheme library, which lives OUTSIDE the
 * plugin (…/sophicly-etchwp-package v2.6/Sophicly Etch Mark Scheme Resources). Keeping it as an
 * alias rather than a pile of ../.. means a source file survives the plugin dir being moved or
 * renamed — and the gate says WHERE it looked when it cannot find it, instead of just "missing".
 */
const MSR_ROOT = path.resolve(ROOT, '..', '..', 'Sophicly Etch Mark Scheme Resources');
const CAM_ROOT = path.resolve(ROOT, '..', '..', '..', 'Cambridge IGCSE English 0500-0990');
function resolveAuthority(rel) {
    if (path.isAbsolute(rel)) return rel;
    if (rel.startsWith('MSR/')) return path.join(MSR_ROOT, rel.slice(4));
    if (rel.startsWith('CAM/')) return path.join(CAM_ROOT, rel.slice(4));
    return path.resolve(ROOT, rel);
}

/** Normalise for quote matching: PDF extraction mangles whitespace, quotes and dashes. */
function norm(s) {
    return String(s)
        .replace(/[‘’ʼ]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[‐-―−]/g, '-')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

const WORD_NUM = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
};

/** Does `quote` contain `n`, as digits or as an English word? */
function quoteStatesNumber(quote, n) {
    const q = norm(quote);
    if (new RegExp(`(^|[^0-9])${n}([^0-9]|$)`).test(q)) return true;
    for (const [word, val] of Object.entries(WORD_NUM)) {
        if (val === n && new RegExp(`\\b${word}\\b`).test(q)) return true;
    }
    return false;
}

/* ─── the per-paper checks ──────────────────────────────────────────────────────────────────── */

function checkPaper(src, file) {
    const id = `${src.board}/${src.paper}`;
    const required = ['board', 'paper', 'authority', 'total', 'questions'];
    for (const k of required) {
        if (!src[k]) { fail(id, 'SCHEMA', `missing required key "${k}" in ${path.basename(file)}`); return; }
    }

    /* ── A. CITATION — the anti-guess check ── */
    const pdfRel = src.authority.file;
    const pdfAbs = resolveAuthority(pdfRel);
    const text = pdfText(pdfAbs);
    if (text === null) {
        fail(id, 'A CITATION', `cited authority does not exist on disk: ${pdfRel}\n      looked in: ${pdfAbs}`);
        return;
    }
    const hay = norm(text);

    /* Question quotes are matched against the WHOLE document; component quotes must additionally
     * sit INSIDE their own question's region. Board documents repeat boilerplate verbatim ("This
     * question tests the following reading assessment objectives (15 marks):" appears under several
     * questions), so a document-wide presence check would pass a component lifted from the wrong
     * question — which is precisely the mistake the gate exists to catch. */
    const qPos = new Map();
    for (const q of src.questions) {
        if (q.quote) { const i = hay.indexOf(norm(q.quote)); if (i >= 0) qPos.set(q.id, i); }
    }
    const sortedPos = [...qPos.values()].sort((a, b) => a - b);
    const regionEnd = (start) => {
        const next = sortedPos.find(p => p > start);
        return next == null ? hay.length : next;
    };

    const checkQuote = (label, quote, marks, region) => {
        checksRun++;
        const at = region ? hay.slice(region[0], region[1]).indexOf(norm(quote))
                          : hay.indexOf(norm(quote));
        if (at < 0) {
            fail(id, 'A CITATION', region
                ? `${label}: quote NOT FOUND inside its own question's section of ${path.basename(pdfRel)} — ` +
                  `it may belong to a different question\n      quote: "${quote}"`
                : `${label}: quote NOT FOUND in ${path.basename(pdfRel)} — ` +
                  `either the citation is wrong or the number was invented\n      quote: "${quote}"`);
            return;
        }
        /* ── B. QUOTE ↔ NUMBER ── */
        checksRun++;
        if (typeof marks === 'number' && !quoteStatesNumber(quote, marks)) {
            fail(id, 'B QUOTE↔NUM', `${label}: declares ${marks} marks but its own quote does not state ${marks}\n      quote: "${quote}"`);
        }
    };

    if (src.total.quote) checkQuote('total', src.total.quote, src.total.marks, null);
    else if (src.total.marks_from !== 'questions') {
        fail(id, 'SCHEMA', `paper total declares ${src.total.marks} marks with no quote — either quote the ` +
            `document stating it, or set marks_from: "questions" to say it is the sum of the questions`);
    }
    for (const q of src.questions) {
        const start = qPos.get(q.id);
        /* A question may state its tariff in its own heading ("Question 2 ... (25 marks)"), or the
         * heading may only LOCATE it while the number lives in a level band further down
         * ("Level 5  11–12"). In the second case `quote` is the locator and `marks_quote` carries
         * the number — and the number must still be found INSIDE this question's own region, so a
         * band lifted from another question's grid cannot pass. */
        /* Every number is either QUOTED or DERIVED, and the source file must say which — an
         * unexplained number is exactly the thing this gate exists to stop. `marks_from:
         * "components"` means the board never states this total and it is the sum of quoted parts
         * (check C proves the sum). Anything else must carry a quote stating the number. */
        if (!q.quote && !q.marks_quote && q.marks_from !== 'components') {
            fail(id, 'SCHEMA', `${q.id}: declares ${q.marks} marks with no quote and no marks_from — ` +
                `state where the number comes from`);
        }
        if (q.quote) {
            if (q.marks_quote || q.marks_from === 'components') checkQuote(`${q.id} (locator)`, q.quote, null, null);
            else checkQuote(q.id, q.quote, q.marks, null);
        }
        if (q.marks_from === 'components' && !(q.components || []).length) {
            fail(id, 'SCHEMA', `${q.id}: marks_from "components" but no components are listed`);
        }
        if (q.marks_quote) {
            if (start == null) fail(id, 'A CITATION', `${q.id}: marks_quote cannot be scoped — ${q.id}'s locator quote was not found`);
            else checkQuote(`${q.id} marks`, q.marks_quote, q.marks, [start, regionEnd(start)]);
        }
        for (const c of q.components || []) {
            if (!c.quote) continue;
            if (start == null) {
                fail(id, 'A CITATION', `${q.id}.${c.label}: cannot scope this component — ${q.id}'s own quote was not located`);
                continue;
            }
            checkQuote(`${q.id}.${c.label}`, c.quote, c.marks, [start, regionEnd(start)]);
        }
    }

    /* ── C. ARITHMETIC (necessary, never sufficient) ── */
    let qSum = 0;
    for (const q of src.questions) {
        qSum += q.marks;
        const comps = q.components || [];
        if (comps.length) {
            checksRun++;
            const cSum = comps.reduce((a, c) => a + c.marks, 0);
            if (cSum !== q.marks) {
                fail(id, 'C ARITHMETIC', `${q.id}: components sum to ${cSum} but the question is ${q.marks} ` +
                    `(${comps.map(c => `${c.label} ${c.marks}`).join(' + ')})`);
            }
        }
    }
    checksRun++;
    if (qSum !== src.total.marks) {
        fail(id, 'C ARITHMETIC', `questions sum to ${qSum} but the paper total is ${src.total.marks}`);
    }

    /* ── D. SPEC JSON ── */
    if (src.spec) {
        const specPath = SPEC_FILES[src.spec.file] || path.resolve(ROOT, src.spec.file);
        if (!fs.existsSync(specPath)) {
            fail(id, 'D SPEC', `spec file not found: ${src.spec.file}`);
        } else {
            const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
            const entry = src.spec.key.split('.').reduce((o, k) => (o == null ? o : o[k]), spec);
            if (!entry) {
                fail(id, 'D SPEC', `spec key not found: ${src.spec.key}`);
            } else {
                checksRun++;
                if (entry.total !== src.total.marks) {
                    fail(id, 'D SPEC', `spec ${src.spec.key}.total = ${entry.total}, mark scheme says ${src.total.marks}`);
                }
                const specQs = [];
                for (const sec of entry.sections || []) for (const q of sec.questions || []) specQs.push(q);
                for (const q of src.questions) {
                    const sq = specQs.find(x => x.id === q.id);
                    if (!sq) { fail(id, 'D SPEC', `${q.id} absent from ${src.spec.key}`); continue; }
                    checksRun++;
                    if (sq.marks !== q.marks) {
                        fail(id, 'D SPEC', `${q.id}: spec says ${sq.marks} marks, the board says ${q.marks}`);
                    }
                    /* component KINDS — this is what catches a right number under a wrong name,
                     * e.g. 25 writing marks recorded as spag_marks and preambled as "SPaG=25". */
                    for (const c of q.components || []) {
                        if (!c.spec_field) continue;
                        checksRun++;
                        const got = sq[c.spec_field];
                        if (got !== c.marks) {
                            fail(id, 'D SPEC', `${q.id}.${c.label}: spec ${c.spec_field} = ${got == null ? 'absent' : got}, ` +
                                `the board says ${c.marks} (${c.kind || 'unlabelled'})`);
                        }
                    }
                    for (const [field, kind] of Object.entries(src.spec.field_kinds || {})) {
                        if (sq[field] == null) continue;
                        const comp = (q.components || []).find(c => c.spec_field === field);
                        if (!comp) continue;
                        checksRun++;
                        if (comp.kind && comp.kind !== kind) {
                            fail(id, 'D SPEC', `${q.id}: spec field "${field}" means "${kind}" but these ${comp.marks} marks are ` +
                                `${comp.kind.toUpperCase()} — the label is wrong even though the number is right`);
                        }
                    }
                }
            }
        }
    }

    /* ── E. PROTOCOL .md ──
     * Find each question's own SECTION in the protocol, then read the headline tariffs inside it.
     * ⚠️ The first cut of this check matched only two string shapes and therefore silently verified
     * NOTHING for Q4/Q5/Q6 of this very paper — a gate that finds no tariff and stays green is the
     * ghost-check class (a skip that reads as a pass). So a question whose section yields no tariff
     * at all is now REPORTED as unchecked, never treated as clean. */
    for (const p of src.protocols || []) {
        const abs = path.resolve(ROOT, p.file);
        if (!fs.existsSync(abs)) { fail(id, 'E PROTOCOL', `protocol not found: ${p.file}`); continue; }
        const body = fs.readFileSync(abs, 'utf8');
        const base = path.basename(p.file);

        /* section boundaries: every "Assessment Sub-Protocol: Question N" heading, in order */
        /* Must be a real markdown HEADING. Protocols contain a dispatch line that names every
         * question in one sentence ("ELIF current_question == Q4: EXECUTE Assessment Sub-Protocol:
         * Question 4 …"); matching that gave six "sections" a few characters long, and every
         * question then reported as having no tariff. Anchor to start-of-line + heading marks. */
        const heads = [...body.matchAll(/^#{1,6}\s*\**\s*Assessment Sub-?Protocol:?\s*\**\s*Question\s*(\d+)/gim)]
            .map(m => ({ num: +m[1], at: m.index }));

        for (const q of src.questions) {
            const num = +((q.id.match(/\d+/) || [])[0]);
            if (!num) continue;
            const h = heads.find(x => x.num === num);
            let region;
            if (h) {
                const next = heads.filter(x => x.at > h.at).sort((a, b) => a.at - b.at)[0];
                region = body.slice(h.at, next ? next.at : body.length);
            } else {
                region = null;
            }
            if (!region) {
                note(`${YEL}E PROTOCOL — ${id} ${q.id}: no "Assessment Sub-Protocol: Question ${num}" section in ` +
                     `${base}, so its tariff is UNVERIFIED (not clean, just unchecked).${OFF}`);
                continue;
            }

            /* ONLY forms that can be nothing but this question's total. An earlier cut also read
             * a bare "out of N marks" and "[X]/N" and produced garbage — it picked up per-element
             * part-marks and even word counts (550, 700). A check that cries wolf gets switched
             * off, so precision matters more than coverage here: anything not matched is REPORTED
             * as unverified rather than guessed at. */
            const found = new Set();
            const add = (re, hay, g = 1) => { for (const m of hay.matchAll(re)) found.add(+m[g]); };
            const headingLine = region.slice(0, region.indexOf('\n') === -1 ? region.length : region.indexOf('\n'));
            add(/\(\s*AO[^)]*?(\d+)\s*Marks?/gi, headingLine);                       // "Question 4 (AO2 – 12 Marks Total)"
            add(/Total Mark for Q\d+[^0-9\n]{0,40}?\/\s*\\?(\d+)/gi, region);         // "Total Mark for Q2: [X] / 4"
            add(new RegExp(`mark for Question\\s*${num}\\s*is[^0-9\\n]{0,20}(?:\\d+|\\\\?\\[X\\\\?\\])\\s*out of\\s*(\\d+)`, 'gi'), region);

            if (!found.size) {
                note(`${YEL}E PROTOCOL — ${id} ${q.id}: section found in ${base} but it states no headline ` +
                     `tariff, so the mark it awards is UNVERIFIED.${OFF}`);
                continue;
            }
            checksRun++;
            const wrong = [...found].filter(v => v !== q.marks);
            if (wrong.length) {
                fail(id, 'E PROTOCOL', `${base} marks ${q.id} out of ${wrong.join(' and ')} — the board says ${q.marks}`);
            }
        }
    }
}

/* ─── coverage ──────────────────────────────────────────────────────────────────────────────── */

function coverage(gated) {
    const specPath = SPEC_FILES.language;
    if (!fs.existsSync(specPath)) return;
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const ungated = [];
    for (const [board, papers] of Object.entries(spec)) {
        if (board.startsWith('_') || typeof papers !== 'object') continue;
        for (const paper of Object.keys(papers)) {
            if (typeof papers[paper] !== 'object' || !papers[paper].total) continue;
            if (!gated.has(`${board}/${paper}`)) ungated.push(`${board}/${paper}`);
        }
    }
    if (ungated.length) {
        note(`${YEL}UNGATED — no protocols/_marks source, so NOTHING verifies these tariffs:${OFF}\n  ` +
            ungated.join('\n  '));
    }
}

/* ─── main ──────────────────────────────────────────────────────────────────────────────────── */

if (!fs.existsSync(MARKS_DIR)) {
    console.error(`${RED}tariff-gate: no protocols/_marks directory${OFF}`);
    process.exit(2);
}
try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); }
catch { console.error(`${RED}tariff-gate: pdftotext not installed — cannot verify any citation. ` +
    `brew install poppler${OFF}`); process.exit(2); }

const files = fs.readdirSync(MARKS_DIR).filter(f => f.endsWith('.json')).sort();
const gated = new Set();

for (const f of files) {
    const abs = path.join(MARKS_DIR, f);
    let src;
    try { src = JSON.parse(fs.readFileSync(abs, 'utf8')); }
    catch (e) { fail(f, 'SCHEMA', `not valid JSON — ${e.message}`); continue; }
    if (OPT.only && !`${src.board}/${src.paper}`.includes(OPT.only)) continue;
    gated.add(`${src.board}/${src.paper}`);
    if (OPT.list) { console.log(`${DIM}gated:${OFF} ${src.board}/${src.paper}  ${DIM}← ${path.basename(src.authority.file)}${OFF}`); continue; }
    checkPaper(src, abs);
}

if (OPT.list) process.exit(0);
if (!OPT.only) coverage(gated);

console.log('');
if (problems.length) {
    console.log(`${RED}✘ tariff-gate: ${problems.length} problem(s) across ${gated.size} gated paper(s)${OFF}\n`);
    let last = '';
    for (const p of problems) {
        if (p.paper !== last) { console.log(`  ${p.paper}`); last = p.paper; }
        console.log(`    ${RED}${p.check}${OFF}  ${p.msg}`);
    }
    console.log('');
} else {
    console.log(`${GRN}✔ tariff-gate: ${gated.size} paper(s) gated, ${checksRun} checks, every mark quoted from the board's own document${OFF}`);
}
for (const n of notes) console.log('\n' + n);
process.exit(problems.length ? 1 : 0);
