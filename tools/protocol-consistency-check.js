#!/usr/bin/env node
/**
 * Protocol consistency checker (v1) — Sophicly WML
 * ------------------------------------------------------------------
 * Re-runnable audit of every board/paper `protocol-a-assessment.md` for the
 * MECHANICAL drift that creeps into hand-built protocols over time. It does NOT
 * judge pedagogy — only facts that must agree with each other or with a source
 * of truth. Output is a prioritised, per-file defect list.
 *
 * Checks:
 *   [MARK]    per section, header total vs element Worth-sum vs "Total Mark for"
 *             line vs @REFLECT_GATE "max" — these must all agree.
 *   [TOTAL]   sum of section totals (reported; compare to the paper's marks).
 *   [PENALTY] every penalty code cited in a "codes: …" list exists in the
 *             board's penalty module (penalty-codes.md / knowledge-penalties.md).
 *   [LEAK]    stale remnants: "workbook"/"copy this into", arrows (→ -> =>),
 *             "Unit 1/2" terminology clash, "paste the source" dead nav.
 *
 * Usage:  node tools/protocol-consistency-check.js
 *         node tools/protocol-consistency-check.js protocols/aqa/literature   (filter)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'protocols');
const filter = process.argv[2] || '';

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name === 'protocol-a-assessment.md') acc.push(p);
  }
  return acc;
}

const boardOf = (file) => {
  const parts = path.relative(ROOT, file).split(path.sep);
  return parts[0]; // protocols/<board>/...
};

// Collect penalty codes DEFINED per board (UNION of every penalty module under that board —
// a board can have separate lit + language modules, and a paper inherits all of them). Plus a
// global union as a last-resort fallback so a shared vocabulary isn't falsely flagged missing.
function loadDefinedCodes() {
  const byBoard = {}; // board -> Set(codes)
  const all = new Set();
  (function find(dir) {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) find(p);
      else if (/penalty-codes\.md$|knowledge-penalties\.md$/.test(name)) {
        const board = boardOf(p);
        const txt = fs.readFileSync(p, 'utf8');
        const re = /(^|\n)\s*\*{0,2}([A-Z]\d)\b\s*[–\-]/g; let x;
        (byBoard[board] = byBoard[board] || new Set());
        while ((x = re.exec(txt))) { byBoard[board].add(x[2]); all.add(x[2]); }
      }
    }
  })(ROOT);
  byBoard.__all__ = all;
  return byBoard;
}

// Codes governing a file = its board's union; if its board has no module, fall back to the
// global union (shared/derived boards reuse a common penalty vocabulary).
function codesFor(file, defined) {
  return defined[boardOf(file)] || defined.__all__ || null;
}

const SECTION_RE = /\*\*\s*(\d+)\\?\.\s*([^*()]+?)\s*\(\s*(\d+)\s*Marks?\s*(?:Each|Total)?\s*\)\s*\*\*/gi;

function lineOf(txt, idx) { return txt.slice(0, idx).split('\n').length; }

function checkFile(file, defined) {
  const txt = fs.readFileSync(file, 'utf8');
  const rel = path.relative(path.resolve(__dirname, '..'), file);
  const issues = [];

  // ---- sections (header + declared total) ----
  const sections = [];
  let m;
  SECTION_RE.lastIndex = 0;
  while ((m = SECTION_RE.exec(txt))) {
    sections.push({ name: m[2].trim(), declared: parseInt(m[3], 10), at: m.index, line: lineOf(txt, m.index) });
  }
  // bound each section by the next one
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const end = i + 1 < sections.length ? sections[i + 1].at : txt.length;
    const block = txt.slice(s.at, end);
    // element Worth sum
    let sum = 0, n = 0;
    const wre = /Worth:\s*([\d.]+)\s*marks?/gi; let w;
    while ((w = wre.exec(block))) { const v = parseFloat(w[1]); if (v > 0 && v <= 3) { sum += v; n++; } } // cap: no single criterion is worth >3 (filters stray "30 marks" mentions)
    s.elementSum = n ? Math.round(sum * 100) / 100 : null;
    // "Total Mark for X: ... out of N" / "/N"
    const tm = block.match(/Total Mark for [^:\n]*:[^\n]*?(?:out of|\/)\s*(\d+)/i);
    s.totalLine = tm ? parseInt(tm[1], 10) : null;
    // @REFLECT_GATE max within this section
    const rg = block.match(/@REFLECT_GATE\{[^}]*"max"\s*:\s*(\d+)/);
    s.markerMax = rg ? parseInt(rg[1], 10) : null;

    // compare the four
    const vals = { header: s.declared, elements: s.elementSum, totalLine: s.totalLine, marker: s.markerMax };
    const present = Object.entries(vals).filter(([, v]) => v != null);
    const distinct = [...new Set(present.map(([, v]) => v))];
    if (distinct.length > 1) {
      issues.push({ sev: 'HIGH', tag: 'MARK', line: s.line,
        msg: `"${s.name}" mark mismatch — ` + present.map(([k, v]) => `${k}=${v}`).join(', ') });
    }
  }
  const paperTotal = sections.reduce((a, s) => a + (s.declared || 0), 0);

  // ---- penalty codes cited vs defined ----
  const cited = new Set();
  const cre = /codes?:\s*([A-Z]\d(?:\s*,\s*[A-Z]\d)*)/gi; let c;
  while ((c = cre.exec(txt))) c[1].split(/\s*,\s*/).forEach(code => cited.add(code));
  const def = codesFor(file, defined);
  if (def) {
    for (const code of cited) if (!def.has(code)) {
      issues.push({ sev: 'HIGH', tag: 'PENALTY', line: 0, msg: `penalty code "${code}" is cited but NOT defined in this board's penalty module` });
    }
  } else if (cited.size) {
    issues.push({ sev: 'MED', tag: 'PENALTY', line: 0, msg: `cites ${cited.size} penalty code(s) but no penalty module found for this board` });
  }

  // ---- stale leaks (tuned to avoid false positives: arrows in internal IF→SAY logic are
  // fine — the ban is for student-facing models only; "do NOT say workbook" lines are correct) ----
  const NEGATION = /\bnot\b|never|don'?t|deprecated|replaces|instead of|no longer/i;
  const leaks = [
    [/copy (?:this|it) into your workbook|paste (?:this|the source)/i, 'workbook/copy/paste instruction (deprecated)'],
    [/\bUnit\s+[12]\b/, '"Unit 1/2" — terminology clash (Units = LearnDash Lessons)'],
  ];
  txt.split('\n').forEach((ln, i) => {
    if (NEGATION.test(ln)) return; // a line telling the AI NOT to do X is correct, not a leak
    for (const [re, label] of leaks) if (re.test(ln)) issues.push({ sev: 'LOW', tag: 'LEAK', line: i + 1, msg: `${label} :: ${ln.trim().slice(0, 80)}` });
  });

  return { rel, issues, paperTotal, sectionCount: sections.length };
}

// ---- run ----
const defined = loadDefinedCodes();
let files = walk(ROOT, []);
if (filter) files = files.filter(f => f.includes(filter));
files.sort();

let totalIssues = 0;
const bySev = { HIGH: 0, MED: 0, LOW: 0 };
const order = { HIGH: 0, MED: 1, LOW: 2 };

for (const f of files) {
  const r = checkFile(f, defined);
  if (!r.issues.length) {
    console.log(`\n✓ ${r.rel}  (${r.sectionCount} sections, Σheaders ${r.paperTotal} — 'Each' counted once, not the paper total)`);
    continue;
  }
  console.log(`\n● ${r.rel}  (${r.sectionCount} sections, Σheaders ${r.paperTotal} — 'Each' counted once, not the paper total)`);
  r.issues.sort((a, b) => order[a.sev] - order[b.sev] || a.line - b.line);
  for (const it of r.issues) {
    totalIssues++; bySev[it.sev]++;
    const loc = it.line ? `:${it.line}` : '';
    console.log(`   [${it.sev}] ${it.tag}${loc}  ${it.msg}`);
  }
}

console.log(`\n────────────────────────────────────────`);
console.log(`Scanned ${files.length} protocol(s). ${totalIssues} issue(s): ${bySev.HIGH} HIGH · ${bySev.MED} MED · ${bySev.LOW} LOW`);
console.log(`(MARK/PENALTY = mechanical, fix directly. LEAK = review. Pedagogy is NOT audited here.)`);
