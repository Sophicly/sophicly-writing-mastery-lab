#!/usr/bin/env node
/* eslint-env node */
/**
 * marking-gate.js — FREE deterministic verifier for a WML marking reply (0 tokens).
 *
 * The cheap half of the "marking judge": everything code can decide, code decides —
 * before any AI judge (Haiku) is spent, and before a student ever sees the mark.
 * Catches the wrong-grade-shown class (arithmetic / cap / roll-up / grade-ladder)
 * plus penalty-without-fix-example, AO leaks, and banned F1 verbs in the gold.
 *
 * Usage:  node bin/marking-gate.js <reply.md> [--paper aqa:language_p1]
 *   exit 0 = clean, exit 1 = at least one finding (so a pipeline / deploy gate can block).
 *
 * Grade ladder + valid-AO set are READ from protocols/shared/language-paper-specs.json
 * (never hardcoded here). This is a prototype of the free layer only — the AI judgment
 * layer (does the feedback actually fit the essay?) is a separate, optional step.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const specPath = path.join(__dirname, '..', 'protocols', 'shared', 'language-paper-specs.json');
const SPECS = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const BAND = SPECS._grade_band_percent; // {"9":85,...,"1":1}

function gradeFromPct(pct) {
  for (const g of ['9', '8', '7', '6', '5', '4', '3', '2', '1']) {
    if (pct >= BAND[g]) return g;
  }
  return 'U';
}

// ── args
const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const paperArg = (args.find(a => a.startsWith('--paper=')) || '').split('=')[1]
  || (args.includes('--paper') ? args[args.indexOf('--paper') + 1] : '') || 'aqa:language_p1';
if (!file) { console.error('usage: node bin/marking-gate.js <reply.md> [--paper board:paper]'); process.exit(2); }

const [board, paper] = paperArg.split(':');
const paperSpec = (SPECS[board] || {})[paper] || {};
const validAOs = new Set(Object.keys(paperSpec.aos_descriptions || {})); // e.g. AO1,AO2,AO4,AO5,AO6
const paperTotal = paperSpec.total || null;

const text = fs.readFileSync(file, 'utf8');
const plain = text.replace(/\*\*/g, '').replace(/\*/g, ''); // strip markdown bold/italic
const findings = [];
const flag = (check, msg) => findings.push({ check, msg });

// ── A. summed-total arithmetic:  "X + Y ( + ...) = Z / max"  and  "AO5 X/24 + AO6 Y/16 = Z/40"
for (const m of plain.matchAll(/([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*[0-9]+)?(?:\s*\+\s*(?:AO\d\s*)?[0-9]+(?:\.[0-9]+)?(?:\s*\/\s*[0-9]+)?)+)\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*([0-9]+)/gi)) {
  // each addend is either "n/max" (take numerator n) or a bare "n"
  const terms = m[1].split('+').map(t => {
    const mm = t.match(/([0-9]+(?:\.[0-9]+)?)\s*\/\s*[0-9]+/) || t.match(/([0-9]+(?:\.[0-9]+)?)/);
    return mm ? parseFloat(mm[1]) : NaN;
  }).filter(n => !isNaN(n));
  const sum = terms.reduce((a, b) => a + b, 0);
  const stated = parseFloat(m[2]);
  if (Math.abs(sum - stated) > 0.001) {
    flag('arithmetic', `"${m[0].trim()}" — parts sum to ${round(sum)}, but stated total is ${stated}`);
  }
}

// ── B. cap: any "n/max" where n > max is an impossible mark
for (const m of plain.matchAll(/([0-9]+(?:\.[0-9]+)?)\s*\/\s*([0-9]+)\b/g)) {
  const n = parseFloat(m[1]), max = parseFloat(m[2]);
  if (n > max) flag('cap', `"${m[0]}" — mark ${n} exceeds its maximum ${max}`);
}

// ── C. grand-total roll-up:  sum of "Q<n> Total: .../qmax"  must equal "Total: X/paperTotal"
const qTotals = [...plain.matchAll(/Q\s*\d+\s*Total:\s*(?:[^=\n]*=\s*)?([0-9]+(?:\.[0-9]+)?)\s*\/\s*[0-9]+/gi)]
  .map(m => parseFloat(m[1]));
// the grand total is a line-leading "Total:" (summary), NOT "Q1 Total:" / "Paragraph 1 Total:"
// m[3] captures the rest of that line ("— 66.25%, which is a Grade 7") so % is read from the
// total's own line, not from a progress bar or the decimals of another number elsewhere.
const grandAll = [...plain.matchAll(/(?:^|\n)\s*(?:Grand\s+|Final\s+)?Total:\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*([0-9]+)([^\n]*)/gi)];
const grand = grandAll.length ? grandAll[grandAll.length - 1] : null;
// rollup only makes sense on a message that carries the WHOLE breakdown (≥4 question totals) —
// a single chat turn often shows just one Q, which would false-positive against the grand total.
if (grand && qTotals.length >= 4) {
  const qSum = qTotals.reduce((a, b) => a + b, 0);
  const stated = parseFloat(grand[1]);
  if (Math.abs(qSum - stated) > 0.001) {
    flag('rollup', `question totals sum to ${round(qSum)} (${qTotals.join(' + ')}), but the grand Total says ${stated}`);
  }
  const denom = parseFloat(grand[2]);
  if (paperTotal && denom !== paperTotal) {
    flag('rollup', `grand Total denominator is /${denom} but ${paperArg} is out of /${paperTotal}`);
  }
}

// ── D. grade ladder: computed grade from Total% must match the stated Grade + the stated %
if (grand) {
  const pct = (parseFloat(grand[1]) / parseFloat(grand[2])) * 100;
  const should = gradeFromPct(pct);
  const gm = plain.match(/Grade:\s*([1-9U])\b/i);
  if (gm && gm[1].toUpperCase() !== should) {
    flag('grade', `Total ${round(pct)}% is a Grade ${should} on the canonical ladder, but the reply states Grade ${gm[1]}`);
  }
  // read the stated % from the total's OWN line only (m[3]) — not a progress bar or a decimal
  // fragment of another number. `(?<![\d.])` stops "66.25%" from yielding "25%".
  const pm = (grand[3] || '').match(/(?<![\d.])([0-9]{1,3}(?:\.[0-9]+)?)\s*%/);
  if (pm && Math.abs(parseFloat(pm[1]) - pct) > 1) {
    flag('grade', `stated ${pm[1]}% doesn't match Total ${grand[1]}/${grand[2]} = ${round(pct)}%`);
  }
}

// ── E. penalty without a fix-example: a "−N (CODE)" penalty line must carry "Fix: ... → ..."
const lines = text.split('\n');
lines.forEach((ln, i) => {
  if (/[−-]\s*[0-9.]+\s*\((?:F1|T1|E2|E1|C1|CX|SP|WC|[A-Z]{1,3}\d?)\)/.test(ln) || /\bpenalty\b.*[−-]\s*[0-9.]/i.test(ln)) {
    const window = lines.slice(i, i + 4).join(' ');
    if (!/Fix:\s*.*→/.test(window) && !/\bWC\b|word[- ]count/i.test(ln)) { // WC ceiling is code-computed, exempt
      flag('penalty', `line ${i + 1}: penalty deducted with no "Fix: … → …" worked example — "${ln.trim().slice(0, 80)}"`);
    }
  }
});

// ── F. banned F1 "empty assertion" verb inside a gold / model-answer rewrite
const goldBlocks = [...text.matchAll(/(?:gold(?:\s+standard)?|model\s+answer|rewrite|optimal)[^\n]*\n([\s\S]{0,1200}?)(?:\n#{1,4}\s|\n\n\*\*|$)/gi)].map(m => m[1]);
const BANNED = /\b(shows?|showing|shown|tells us|is about)\b/i;
goldBlocks.forEach(b => {
  const hit = b.match(BANNED);
  if (hit) flag('banned-verb', `gold/model rewrite uses banned F1 verb "${hit[0]}" — "${excerpt(b, hit.index)}"`);
});

// ── G. AO leak: an AO marked here that this paper doesn't assess
if (validAOs.size) {
  for (const m of plain.matchAll(/\bAO([0-9])\b/g)) {
    const ao = 'AO' + m[1];
    if (!validAOs.has(ao)) { flag('ao-leak', `${ao} appears but ${paperArg} assesses only ${[...validAOs].join(', ')}`); break; }
  }
}

// ── report
function round(n) { return Math.round(n * 100) / 100; }
function excerpt(s, i) { return s.slice(Math.max(0, i - 20), i + 40).replace(/\s+/g, ' ').trim(); }

if (!findings.length) {
  console.log(`✅ marking-gate: clean (${paperArg}) — no deterministic defects. Ready for the AI judgment pass.`);
  process.exit(0);
}
console.log(`❌ marking-gate: ${findings.length} finding(s) in ${path.basename(file)} (${paperArg})\n`);
const dedup = new Set();
for (const f of findings) {
  const key = f.check + '|' + f.msg;
  if (dedup.has(key)) continue; dedup.add(key);
  console.log(`  [${f.check}] ${f.msg}`);
}
console.log(`\nThese would re-mark (Sonnet) → re-judge, capped at 1–2 retries, before the student sees anything.`);
process.exit(1);
