#!/usr/bin/env node
/* eslint-env node */
/**
 * protocol-standard-audit.js — PROTOCOL-STANDARD.md B-CHECKS + C-CHECKS, run over EVERY protocol.
 *
 * WHY. The standard has carried grep-able acceptance tables since v7.19.852 ("run on any protocol
 * before ship"), but nothing ever ran them across the whole tree — so "what have we done?" (Neil,
 * 2026-09-06, FIXLIST #467) was answered from a July memory ("3 of 27 ported"). This prints the
 * matrix from the files, board × subject × {assessment, planning, polishing}, and nothing else.
 *
 * It is a MEASUREMENT, not a judgement: each cell is the raw count the standard asks for, and a
 * verdict only where the standard states an absolute (≥1 / =0). The parametric rows (= unit count)
 * are printed as counts for a human to read against the paper's real structure.
 *
 * Usage:  node bin/protocol-standard-audit.js [--json] [--board aqa]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const P = path.join(ROOT, 'protocols');

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const onlyBoard = (() => { const i = argv.indexOf('--board'); return i >= 0 ? argv[i + 1] : null; })();

const count = (txt, re) => (txt.match(re) || []).length;
const read = (f) => fs.readFileSync(f, 'utf8');

// ── B-CHECKS (assessment) — the rows with an absolute expectation carry a verdict ────────────
const B = [
    ['REFLECT_GATE',        (t) => count(t, /@REFLECT_GATE/g),                       null],   // = assessed units (parametric)
    ['FB pairs',            (t) => Math.min(count(t, /@FB_BEGIN/g), count(t, /@FB_END/g)), null],
    ['Total Mark for',      (t) => count(t, /Total Mark for/g),                       null],
    ['ASSESSMENT_COMPLETE', (t) => count(t, /ASSESSMENT_COMPLETE/g),                  (n) => n >= 1],
    ['SUMMARY_COMPLETE',    (t) => count(t, /SUMMARY_COMPLETE/g),                     (n) => n >= 1],
    ['SYSTEM-ASKED',        (t) => count(t, /SYSTEM-ASKED/gi),                        (n) => n >= 1],
    ['HARD PRECONDITION',   (t) => count(t, /HARD PRECONDITION/g),                    (n) => n >= 1],
    ['Got it — continue',   (t) => count(t, /Got it — continue/g),                    null],
    ['Nothing to revisit',  (t) => count(t, /Nothing to revisit/g),                   (n) => n === 0],
    ['all N steps',         (t) => count(t, /all [0-9]+ steps/gi),                    (n) => n === 0],
    ['action-grade-goal',   (t) => count(t, /action-grade-goal/g),                    (n) => n >= 1],
    ['CANONICAL GRADE LADDER', (t) => count(t, /CANONICAL GRADE LADDER/g),            (n) => n >= 1],
    ['NEVER round',         (t) => count(t, /NEVER round/gi),                         (n) => n >= 1],
    ['Penalty Ledger',      (t) => count(t, /Penalty & Ceiling Ledger|Penalty Ledger/g), (n) => n >= 1],
];
// ── C-CHECKS (planning) ────────────────────────────────────────────────────────────────────
const C = [
    ['@FIELD_COMMIT',       (t) => count(t, /@FIELD_COMMIT\{/g),                      (n) => n >= 1],
    ['Got it — continue',   (t) => count(t, /Got it — continue/g),                    null],
    ['HARD PRECONDITION',   (t) => count(t, /HARD PRECONDITION/g),                    (n) => n >= 3],
    ['all N steps',         (t) => count(t, /all [0-9]+ steps/gi),                    (n) => n === 0],
    ['@GOLD_REF',           (t) => count(t, /@GOLD_REF/g),                            (n) => n >= 1],
    ['ladder precedence',   (t) => count(t, /WRONG → FAILED → WEAK\/RESOLVED/g),      (n) => n === 1],
    ['weak never enters',   (t) => count(t, /A weak-but-owned answer NEVER enters the ladder/g), (n) => n === 1],
    ['LENS REGISTRY',       (t) => count(t, /LENS REGISTRY/g),                        (n) => n >= 1],
    ['falsifiable',         (t) => count(t, /falsifiable against the text or an established fact/g), (n) => n >= 1],
];

// ── D-CHECKS (polishing) — PROTOCOL-STANDARD Part D (v7.20.609). A cell is PORTED when the router's
// essay_polishing_env map has a row whose `cell` is this board/subject; then its rubric is checked.
// An unported cell still loads its manifest's protocol-c-* stack and is reported as `monolith`.
const ROUTER_SRC = read(path.join(ROOT, 'includes/class-protocol-router.php'));
// v7.20.610: TWO maps — Language rows keyed on the text slug, Literature rows keyed on board/subject.
const ENV_ROWS = (() => {
    const out = [];
    for (const v of ['essay_polishing_rubrics', 'essay_polishing_subject_rows']) {
        const blk = ROUTER_SRC.match(new RegExp('\\$' + v + '\\s*=\\s*\\[([\\s\\S]*?)\\n        \\];'));
        if (!blk) continue;
        const re = /'([a-z0-9_\/]+)'\s*=>\s*\[([\s\S]*?)\n            \],/g;
        let m;
        while ((m = re.exec(blk[1])) !== null) {
            const cell = (m[2].match(/'cell'\s*=>\s*'([^']+)'/) || [])[1];
            const rubric = (m[2].match(/'rubric'\s*=>\s*'([^']+)'/) || [])[1];
            if (cell && rubric) out.push({ text: m[1], cell, rubric });
        }
    }
    return out;
})();
const D = [
    ['INLINE COACHING ACTIONS', (t) => count(t, /## INLINE COACHING ACTIONS/g),              (n) => n >= 1],
    ['Provenance',              (t) => count(t, /Provenance/g),                              (n) => n >= 1],
    ['Mark Complete exit',      (t) => count(t, /Mark Complete/g),                           (n) => n >= 1],
    ['student chooses',         (t) => count(t, /student chooses|never pick the first/gi),   (n) => n >= 1],
    ['macro → micro',           (t) => count(t, /macro → micro/g),                           (n) => n >= 1],
    ['no task menu',            (t) => count(t, /no task menu/gi),                           (n) => n >= 1],
];

function filesUnder(dir, re) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => re.test(f)).map((f) => path.join(dir, f));
}
function lastCommit(f) {
    try { return require('child_process').execSync(`git log -1 --format=%cs -- "${f}"`, { cwd: ROOT }).toString().trim(); } catch (e) { return '?'; }
}

const rows = [];
for (const board of fs.readdirSync(P).sort()) {
    if (board === 'shared' || board.startsWith('_')) continue;   // v7.20.610: _marks is a data dir, not a board
    if (onlyBoard && board !== onlyBoard) continue;
    const bdir = path.join(P, board);
    if (!fs.statSync(bdir).isDirectory()) continue;
    for (const subject of fs.readdirSync(bdir).sort()) {
        const sdir = path.join(bdir, subject);
        if (!fs.statSync(sdir).isDirectory() || subject.startsWith('_')) continue;   // v7.20.610: _sources / _marks are data dirs
        const manifest = fs.existsSync(path.join(sdir, 'manifest.json')) ? JSON.parse(read(path.join(sdir, 'manifest.json'))) : null;

        // assessment = every protocol-a-* module (some subjects split per question)
        const aFiles = filesUnder(path.join(sdir, 'modules'), /^protocol-a-.*\.md$/);
        const aText = aFiles.map(read).join('\n');
        const a = {};
        let aPass = 0, aTotal = 0;
        for (const [name, fn, verdict] of B) {
            const n = aFiles.length ? fn(aText) : 0;
            a[name] = n;
            if (verdict) { aTotal++; if (verdict(n)) aPass++; }
        }
        // planning = the planning/ dir (whole), plus a legacy modules/protocol-b-* if that is all there is
        let pFiles = [];
        const pdir = path.join(sdir, 'planning');
        if (fs.existsSync(pdir)) pFiles = fs.readdirSync(pdir).filter((f) => f.endsWith('.md')).map((f) => path.join(pdir, f));
        if (!pFiles.length) pFiles = filesUnder(path.join(sdir, 'modules'), /^protocol-b-.*\.md$/);
        const pText = pFiles.map(read).join('\n');
        const c = {};
        let cPass = 0, cTotal = 0;
        for (const [name, fn, verdict] of C) {
            const n = pFiles.length ? fn(pText) : 0;
            c[name] = n;
            if (verdict) { cTotal++; if (verdict(n)) cPass++; }
        }
        // polishing = protocol-c-* : no standard exists, so measure what a port would need — engine markers
        const polFiles = filesUnder(path.join(sdir, 'modules'), /^protocol-c-.*\.md$/);
        const polText = polFiles.map(read).join('\n');
        const pol = {
            files: polFiles.length,
            bytes: Buffer.byteLength(polText),
            markers: count(polText, /@[A-Z_]{4,}/g),
            last: polFiles.length ? lastCommit(polFiles[0]) : '-',
        };
        // Part D: is this cell served as an ENVIRONMENT? (router row + rubric D-CHECKS)
        const envRow = ENV_ROWS.find((r) => r.cell === `${board}/${subject}`);
        if (envRow) {
            const rubricPath = path.join(P, 'shared/modules/rubrics', envRow.rubric);
            const rText = fs.existsSync(rubricPath) ? read(rubricPath) : '';
            let dPass = 0, dTotal = 0; const d = {};
            for (const [name, fn, verdict] of D) { const n = fn(rText); d[name] = n; dTotal++; if (verdict(n)) dPass++; }
            // loadable lists only — `_retired` / `_destitched` notes may name the file they retire
            const stillListed = manifest
                ? /protocol-c-polishing/.test(JSON.stringify(manifest, (k, v) => (typeof k === 'string' && k.startsWith('_')) ? undefined : v))
                : false;
            pol.env = { text: envRow.text, rubric: envRow.rubric, rubricExists: !!rText, pass: dPass, total: dTotal, counts: d, monolithStillInManifest: stillListed };
        }
        rows.push({
            board, subject,
            manifest: !!manifest,
            assessment: { files: aFiles.length, pass: aPass, total: aTotal, counts: a, last: aFiles.length ? lastCommit(aFiles[0]) : '-' },
            planning: { files: pFiles.length, pass: cPass, total: cTotal, counts: c, last: pFiles.length ? lastCommit(pFiles[0]) : '-' },
            polishing: pol,
        });
    }
}

if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0); }

const pad = (s, n) => String(s).padEnd(n);
console.log('PROTOCOL-STANDARD audit — B-CHECKS (assessment) · C-CHECKS (planning) · D-CHECKS (polishing: ENV rubric pass/abs, else monolith)');
console.log(pad('board/subject', 30) + pad('ASSESS pass/abs  RG  FB  TMF  last', 40) + pad('PLAN pass/abs  FC  GR  last', 30) + 'POLISH  ENV pass/abs rubric | monolith files bytes @ last');
for (const r of rows) {
    const A = r.assessment, Cc = r.planning, Po = r.polishing;
    const aCol = A.files
        ? `${A.pass}/${A.total}  ${pad(A.counts['REFLECT_GATE'], 3)} ${pad(A.counts['FB pairs'], 3)} ${pad(A.counts['Total Mark for'], 4)} ${A.last}`
        : '— no protocol-a file —';
    const cCol = Cc.files
        ? `${Cc.pass}/${Cc.total}  ${pad(Cc.counts['@FIELD_COMMIT'], 3)} ${pad(Cc.counts['@GOLD_REF'], 3)} ${Cc.last}`
        : '— no planning —';
    const pCol = Po.env
        ? `ENV ${Po.env.pass}/${Po.env.total} ${Po.env.rubric}${Po.env.rubricExists ? '' : ' (MISSING)'}${Po.env.monolithStillInManifest ? ' ⚠ monolith still in manifest' : ''}`
        : (Po.files ? `monolith ${Po.files} ${pad(Po.bytes, 6)} ${pad(Po.markers, 2)} ${Po.last}` : '—');
    console.log(pad(`${r.board}/${r.subject}`, 30) + pad(aCol, 40) + pad(cCol, 30) + pCol);
}
console.log('\nabs = rows the standard states as an absolute (≥1 / =0). RG=@REFLECT_GATE FB=@FB pairs TMF="Total Mark for" FC=@FIELD_COMMIT GR=@GOLD_REF');
