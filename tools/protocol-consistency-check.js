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

const SECTION_RE = /\*\*\s*(\d+)\\?\.\s*([^*()]+?)\s*\(\s*(\d+)\s*Marks?\s*(Each|Total)?\s*\)\s*\*\*/gi;

function lineOf(txt, idx) { return txt.slice(0, idx).split('\n').length; }

// ── Single source of truth: literature paper totals ─────────────────────────
// literature-paper-specs.json holds the VERIFIED per-paper totals (cross-checked
// against official mark-scheme PDFs). A protocol's section split must sum to the
// total of the paper(s) it marks. This map ties each protocol DIR to the JSON
// paper-key(s) it is the PRIMARY scaffold for (one protocol can mark several
// papers that share a shape, e.g. all OCR 40-mark essays).
const SPECS_FILE = path.resolve(__dirname, '..', 'protocols', 'shared', 'literature-paper-specs.json');
const PRIMARY_MAP = {
  'aqa/literature':            ['aqa.shakespeare', 'aqa.modern_text'],          // 34
  'ocr/literature':            ['ocr.shakespeare', 'ocr.19th_century', 'ocr.modern_text'], // 40
  'edexcel/shakespeare':       ['edexcel.shakespeare'],
  'edexcel/19th_century':      ['edexcel.19th_century'],
  'edexcel/modern':            ['edexcel.modern_text'],
  'edexcel/poetry':            ['edexcel.poetry_anthology'],
  'edexcel/unseen':            ['edexcel.unseen'],
  'eduqas/literature':         ['eduqas.19th_century'],                          // 40
  'eduqas/modern':             ['eduqas.modern_text'],                           // 40
  'eduqas/shakespeare':        ['eduqas.shakespeare'],                           // 40 (15+25, custom)
  'eduqas/unseen':             ['eduqas.unseen'],
  'ccea/prose':                ['ccea.prose'],                                   // 40
  'ccea/unseen-prose':         ['ccea.unseen_prose'],                            // 20
  'sqa/critical-reading':      ['sqa.critical_reading_section_2'],               // 20 holistic
  'edexcel-igcse/heritage':    ['edexcel-igcse.heritage'],
  'edexcel-igcse/modern':      ['edexcel-igcse.modern'],
  'edexcel-igcse/modern-prose':['edexcel-igcse.modern-prose'],
  'edexcel-igcse/literature':  ['edexcel-igcse.literature'],
};

function loadLitSpecs() {
  try {
    const j = JSON.parse(fs.readFileSync(SPECS_FILE, 'utf8'));
    const get = (dotted) => { const [b, p] = dotted.split('.'); return j[b] && j[b][p] ? j[b][p] : null; };
    return { j, get };
  } catch (e) { return { j: null, get: () => null, err: e.message }; }
}

// Paper-key this protocol DIR primarily marks (board/<paper>) — e.g. 'aqa/literature'.
function protoKey(file) {
  const parts = path.relative(ROOT, file).split(path.sep);
  return parts.slice(0, 2).join('/'); // <board>/<paper-dir>
}

// Count distinct "Body Paragraph N" references → how many times an "Each" body
// section repeats. Defaults to 3 (the standard lit scaffold) if none found.
function bodyCountOf(txt) {
  const nums = new Set();
  const re = /Body\s+(?:Paragraph\s+)?([1-9])\b/gi; let x;
  while ((x = re.exec(txt))) nums.add(parseInt(x[1], 10));
  return nums.size >= 2 ? nums.size : 3;
}

// Suggest a section split that SUMS TO the verified total, scaling the current
// shape proportionally. Advisory — the exact per-section pedagogy is a human
// choice; this just shows a valid distribution so no one has to do the arithmetic.
function recommendSplit(cur, target) {
  const curTotal = cur.intro + cur.body * cur.body_count + cur.conclusion;
  if (curTotal === target) return cur;
  const k = target / curTotal;
  const intro = Math.max(1, Math.round(cur.intro * k));
  const body = Math.max(1, Math.round(cur.body * k));
  let conclusion = target - intro - body * cur.body_count;
  if (conclusion < 1) conclusion = 1;
  return { intro, body, body_count: cur.body_count, conclusion };
}

// Parse the frontend MARK_SPLITS lookup (keyed by paper total) from wml-assessment.js
// so we can verify it agrees with the JSON splits. Returns { total: {intro,body,conclusion} }.
function loadMarkSplits() {
  const f = path.resolve(__dirname, '..', 'frontend', 'wml-assessment.js');
  try {
    const txt = fs.readFileSync(f, 'utf8');
    const m = txt.match(/const\s+MARK_SPLITS\s*=\s*\{([\s\S]*?)\n\s*\};/);
    if (!m) return null;
    const out = {};
    const re = /(\d+)\s*:\s*\{\s*intro:\s*(\d+(?:\.\d+)?)\s*,\s*body:\s*(\d+(?:\.\d+)?)\s*,\s*conclusion:\s*(\d+(?:\.\d+)?)\s*\}/g;
    let r; while ((r = re.exec(m[1]))) out[+r[1]] = { intro: +r[2], body: +r[3], conclusion: +r[4] };
    return out;
  } catch (e) { return null; }
}

function checkFile(file, defined, specs, markSplits) {
  const txt = fs.readFileSync(file, 'utf8');
  const rel = path.relative(path.resolve(__dirname, '..'), file);
  const issues = [];

  // ---- sections (header + declared total) ----
  const sections = [];
  let m;
  SECTION_RE.lastIndex = 0;
  while ((m = SECTION_RE.exec(txt))) {
    sections.push({ name: m[2].trim(), declared: parseInt(m[3], 10), each: /each/i.test(m[4] || ''), at: m.index, line: lineOf(txt, m.index) });
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

  // ---- [JSON] TRUE total (Each × body_count) vs the single source of truth ----
  // The protocol's section split must sum to the VERIFIED paper total in
  // literature-paper-specs.json. This is the check that catches the whole
  // duplication class: header drift, stale copies, and sibling mis-marks.
  const bodyCount = bodyCountOf(txt);
  const trueTotal = sections.reduce((a, s) => a + (s.declared || 0) * (s.each ? bodyCount : 1), 0);
  let split = null;
  if (sections.length) {
    // Standard scaffold = first "Total" (intro), an "Each" (body), last "Total" (conclusion).
    const intro = sections[0];
    const body = sections.find(s => s.each);
    const concl = sections[sections.length - 1];
    if (body && intro !== concl) {
      split = { intro: intro.declared, body: body.declared, body_count: bodyCount, conclusion: concl.declared };
    }
  }
  const keys = PRIMARY_MAP[protoKey(file)] || [];
  const specTotals = keys.map(k => ({ k, marks: specs.get(k) ? specs.get(k).marks : undefined }));
  const primarySpec = keys.map(k => specs.get(k)).find(Boolean);
  const declaredShape = primarySpec && primarySpec.split ? primarySpec.split.shape : 'standard';
  if (keys.length && (declaredShape === 'custom' || declaredShape === 'holistic')) {
    // Intentionally non-TTECEA (multi-question, 2-box, or band-holistic). The
    // intro/body/conclusion checksum does not apply — just require a verified total.
    const known = specTotals.filter(t => typeof t.marks === 'number');
    if (!known.length) {
      issues.push({ sev: 'MED', tag: 'JSON', line: 0,
        msg: `${declaredShape} paper but JSON total is null for [${keys.join(', ')}] — set the verified marks` });
    }
  } else if (keys.length) {
    const known = specTotals.filter(t => typeof t.marks === 'number');
    if (!known.length) {
      issues.push({ sev: 'MED', tag: 'JSON', line: 0,
        msg: `protocol sums to ${trueTotal} (= ${split ? `${split.intro}/${split.body}×${split.body_count}/${split.conclusion}` : 'n/a'}) but its JSON paper(s) [${keys.join(', ')}] have marks:null — set the verified total + split in literature-paper-specs.json` });
    } else if (!known.some(t => t.marks === trueTotal)) {
      const want = known[0].marks;
      const rec = split ? recommendSplit(split, want) : null;
      issues.push({ sev: 'HIGH', tag: 'JSON', line: sections[0] ? sections[0].line : 0,
        msg: `protocol sums to ${trueTotal} but verified total is ${want} (${known.map(t => `${t.k}=${t.marks}`).join(', ')}). ` +
             (rec ? `Canonical split for ${want}: intro ${rec.intro} / body ${rec.body}×${rec.body_count} / conclusion ${rec.conclusion}.` : 'Resolve the section headers to sum to the verified total.') });
    } else {
      // sums match — verify the JSON actually carries this split, and MARK_SPLITS agrees
      const hit = known.find(t => t.marks === trueTotal);
      const sp = specs.get(hit.k);
      if (sp && !sp.split) {
        issues.push({ sev: 'LOW', tag: 'JSON', line: 0,
          msg: `protocol sums to ${trueTotal} ✓ but ${hit.k} has no "split" in JSON — add { "shape":"standard", "intro":${split.intro}, "body":${split.body}, "body_count":${split.body_count}, "conclusion":${split.conclusion} }` });
      }
      if (split && markSplits && markSplits[trueTotal]) {
        const ms = markSplits[trueTotal];
        if (ms.intro !== split.intro || ms.body !== split.body || ms.conclusion !== split.conclusion) {
          issues.push({ sev: 'MED', tag: 'JSON', line: 0,
            msg: `frontend MARK_SPLITS[${trueTotal}] = ${ms.intro}/${ms.body}/${ms.conclusion} disagrees with this protocol's ${split.intro}/${split.body}/${split.conclusion} — reconcile (one source)` });
        }
      }
    }
  }

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

  return { rel, issues, paperTotal, trueTotal, sectionCount: sections.length };
}

// ---- run ----
const defined = loadDefinedCodes();
const specs = loadLitSpecs();
const markSplits = loadMarkSplits();
if (specs.err) console.log(`⚠ could not load literature-paper-specs.json (${specs.err}) — JSON checks skipped`);
let files = walk(ROOT, []);
if (filter) files = files.filter(f => f.includes(filter));
files.sort();

let totalIssues = 0;
const bySev = { HIGH: 0, MED: 0, LOW: 0 };
const order = { HIGH: 0, MED: 1, LOW: 2 };

for (const f of files) {
  const r = checkFile(f, defined, specs, markSplits);
  const tag = `Σtrue ${r.trueTotal} (Each×body)`;
  if (!r.issues.length) {
    console.log(`\n✓ ${r.rel}  (${r.sectionCount} sections, ${tag})`);
    continue;
  }
  console.log(`\n● ${r.rel}  (${r.sectionCount} sections, ${tag})`);
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
