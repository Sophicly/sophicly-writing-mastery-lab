#!/usr/bin/env node
/* eslint-env node */
// v7.20.204 (Neil) — C-LADDER B-CHECK HARNESS. Guards the three invariants of the universal
// contingent-scaffolding ladder (PROTOCOL-STANDARD.md C-LADDER; design =
// PLANNING-LADDER-PROSE-DESIGN-P1-2026-07-18.md §2) so no future edit can silently erode the
// contract, and so every planning protocol keeps the ladder honest as the fan-out opts in.
//
// TWO scopes:
//   (1) THE CONTRACT (always checked): PROTOCOL-STANDARD.md must carry the canonical literal lines
//       for each invariant. Deleting/rewording one is a hard fail — the whole design reduces to
//       these lines, so they are the thing a drift would erase first.
//   (2) EACH LADDER-ENABLED PROTOCOL (opportunistic): any protocols/**/planning/*.md that has
//       opted into the ladder (carries "Session Law 9" or a "LENS REGISTRY") is checked for the
//       same three invariants. Protocols not yet retrofitted are SKIPPED (the fan-out is gradual —
//       AQA P2 retrofit is bundled into the P3 build), so this branch is dormant today and lights
//       up automatically the moment a protocol declares the ladder. A ladder-enabled protocol that
//       violates an invariant is a hard fail.
//
// THE THREE INVARIANTS (Fable §2):
//   (a) REGIME SPLIT      — weak-owned ≠ failed; precedence WRONG → FAILED → WEAK/RESOLVED stated.
//   (b) METHOD-NOT-CONTENT — the tutor never supplies a READING; L3 lenses name a DIRECTION, never
//                            a completed reading of today's text.
//   (c) WRONG = FALSIFIABLE — a `wrong` verdict is a falsifiable error only, never interpretation.
//
// Run: node bin/ladder-check-harness.js   (wired into bin/pre-ship-check.sh)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let failed = 0;
const note = (s) => console.log(s);

// ── (1) THE CONTRACT — canonical literal lines in PROTOCOL-STANDARD.md ────────────────────────
// Each entry: the invariant it protects + the exact substring that MUST be present. These are the
// literals the C-LADDER section is authored around; keep this list byte-synced with that section.
const STANDARD = path.join(ROOT, 'PROTOCOL-STANDARD.md');
const CONTRACT_LINES = [
  { inv: '(a) regime precedence',    lit: 'WRONG → FAILED → WEAK/RESOLVED' },
  { inv: '(a) weak never climbs',    lit: 'A weak-but-owned answer NEVER enters the ladder' },
  { inv: '(b) method-not-content',   lit: 'you may NEVER supply a READING' },
  { inv: '(c) wrong = falsifiable',  lit: 'falsifiable against the text or an established fact' },
];
if (!fs.existsSync(STANDARD)) {
  note('❌ PROTOCOL-STANDARD.md not found — cannot verify the C-LADDER contract.');
  failed = 1;
} else {
  const std = fs.readFileSync(STANDARD, 'utf8');
  const miss = CONTRACT_LINES.filter(c => !std.includes(c.lit));
  note(`— CONTRACT (PROTOCOL-STANDARD.md C-LADDER): ${CONTRACT_LINES.length - miss.length}/${CONTRACT_LINES.length} canonical lines present.`);
  if (miss.length) {
    failed = 1;
    note('  ❌ MISSING canonical C-LADDER line(s) — the contract has drifted:');
    miss.forEach(c => note(`       ${c.inv}: expected literal «${c.lit}»`));
  }
}

// ── (2) LADDER-ENABLED PLANNING PROTOCOLS — opportunistic per-invariant check ──────────────────
// Direction-nouns an L3 lens is allowed to attach to "the writer's …" (a DIRECTION to look in).
// Anything else after "the writer's " in a lens line is a candidate completed READING (content).
const DIRECTION_NOUNS = new Set([
  'attitude', 'focus', 'choice', 'choices', 'purpose', 'tone', 'intention', 'intentions',
  'stance', 'perspective', 'viewpoint', 'method', 'methods', 'technique', 'techniques',
  'craft', 'approach', 'position', 'emphasis', 'concern', 'concerns',
]);

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && p.endsWith('.md') && p.includes(`${path.sep}planning${path.sep}`)) out.push(p);
  }
}
const protoDir = path.join(ROOT, 'protocols');
const planningFiles = [];
if (fs.existsSync(protoDir)) walk(protoDir, planningFiles);

// v7.20.229: the invariant UNIT is the PROTOCOL, not the file — modular protocols (lit) split
// the ladder module (b-ladder.md) from the step files that reference it, so each planning DIR's
// .md files are concatenated and checked once. Monolith dirs (P1/P2) reduce to the same check.
// _superseded copies are excluded (stale text must not join a live unit).
const unitMap = new Map();
for (const p of planningFiles) {
  if (p.includes('_superseded')) continue;
  const dir = path.dirname(p);
  if (!unitMap.has(dir)) unitMap.set(dir, []);
  unitMap.get(dir).push(p);
}
const ladderUnits = [];
for (const [dir, files] of unitMap) {
  const t = files.sort().map(f => fs.readFileSync(f, 'utf8')).join('\n');
  if (/Session Law 9/i.test(t) || /LENS REGISTRY/i.test(t)) ladderUnits.push({ dir, t });
}

if (ladderUnits.length === 0) {
  note('— PROTOCOLS: no planning protocol has opted into the ladder yet (Session Law 9 / LENS REGISTRY) — nothing to check. (AQA P2 retrofit is bundled into P3.)');
} else {
  for (const u of ladderUnits) {
    const rel = path.relative(ROOT, u.dir);
    const t = u.t;
    const problems = [];

    // (a) regime split — the precedence line + the weak-never-climbs law must both be present.
    if (!t.includes('WRONG → FAILED → WEAK/RESOLVED')) problems.push('(a) missing precedence line WRONG → FAILED → WEAK/RESOLVED');
    if (!/weak-but-owned answer NEVER enters the ladder/i.test(t)) problems.push('(a) missing the weak-never-climbs law');

    // (c) wrong = falsifiable — the discriminator must be stated where the protocol echoes the verdicts.
    if (!/falsifiable against the text or an established fact/i.test(t)) problems.push('(c) missing the wrong=falsifiable discriminator');

    // (b) method-not-content — scan ONLY actual L3 lens MENUS (a line carrying the lettered
    // A)/B)/C) angles) for a completed "the writer's <content-noun>" reading. Restricting to
    // lettered menus excludes explanatory prose that quotes a counter-example ("never CONTENT
    // ('the writer's bitterness')") or the grounding template ("the writer's actual words") — those
    // are the RULE, not a lens, so flagging them is a false positive (the harness must fail only for
    // the right reason). Every "the writer's <noun>" on a genuine menu line is checked, not just the first.
    const lensLines = t.split('\n').filter(l =>
      /\bA\)/.test(l) && /\bB\)/.test(l) && /\bC\)/.test(l) && /the writer'?s\s+[a-z]/i.test(l));
    for (const l of lensLines) {
      const occ = l.match(/the writer'?s\s+[a-z]+/gi) || [];
      for (const g of occ) {
        const noun = /the writer'?s\s+([a-z]+)/i.exec(g)[1].toLowerCase();
        if (!DIRECTION_NOUNS.has(noun)) {
          problems.push(`(b) lens names a completed reading: "the writer's ${noun}" — use a DIRECTION (attitude/focus/choice), not content, in:\n         ${l.trim()}`);
        }
      }
    }

    if (problems.length) {
      failed = 1;
      note(`  ❌ ${rel} — ladder-enabled but violates ${problems.length} invariant(s):`);
      problems.forEach(x => note('       ' + x));
    } else {
      note(`— PROTOCOL ${rel}: ladder-enabled, all three invariants hold.`);
    }
  }
}

// ── (3) EL BYTE-TRACE — the KEY-MATCH gate (CLAUDE.md §5d — the #1 recurring bug) ──────────────
// The el a filing element declares in the CODE registry (frontend/wml-assessment.js) is echoed by
// the LLM and is ALSO the fieldId @FIELD_COMMIT writes to. If the code registry names an el that is
// NOT a real @FIELD_COMMIT field in the AQA P2 planning protocol, the LLM echoes an id that files
// nowhere (write-key ≠ read-key) — the exact silent "saves fine but nothing shows up" failure.
// This reconstructs the code's FILING els (those keyed to an outline box; synthetic q*-… els file
// nothing and are excluded) and proves every one is a @FIELD_COMMIT field in the protocol.
const AQA_P2_PROTO = path.join(ROOT, 'protocols', 'aqa', 'language2', 'planning', 'protocol-b-planning.md');
const ASSESS_JS = path.join(ROOT, 'frontend', 'wml-assessment.js');
function aqaP2FilingEls() {
  const els = [];
  for (let i = 1; i <= 2; i++) {                       // Q2 — inf1/inf2 × topic/evidence, -q2
    els.push(`outline-body-${i}-inf1-topic-q2`, `outline-body-${i}-inf1-evidence-q2`,
             `outline-body-${i}-inf2-topic-q2`, `outline-body-${i}-inf2-evidence-q2`);
  }
  for (let i = 1; i <= 3; i++) {                       // Q3 — TTECEA, -q3 (technique files nothing)
    els.push(`outline-body-${i}-topic-q3`, `outline-body-${i}-evidence-q3`, `outline-body-${i}-analysis-q3`,
             `outline-body-${i}-effects-q3`, `outline-body-${i}-effects2-q3`, `outline-body-${i}-purpose-q3`);
  }
  for (let i = 1; i <= 3; i++) {                       // Q4 — comparative body UNSUFFIXED
    els.push(`outline-body-${i}-topic`, `outline-body-${i}-evidence`, `outline-body-${i}-analysis`,
             `outline-body-${i}-effects`, `outline-body-${i}-effects2`, `outline-body-${i}-purpose`);
  }
  els.push('outline-intro-thesis-q4', 'outline-conclusion-thesis');
  // Q5 — synthetic els file nothing; the section COMPILE files these (resolveBy targets).
  els.push('outline-iumvcc-intro', 'outline-iumvcc-urgency', 'outline-iumvcc-method-point-1',
           'outline-iumvcc-method-point-2', 'outline-iumvcc-method-point-3', 'outline-iumvcc-vision',
           'outline-iumvcc-counter', 'outline-iumvcc-conclusion');
  return els;
}
if (!fs.existsSync(AQA_P2_PROTO)) {
  note(`— EL BYTE-TRACE: SKIP (AQA P2 planning protocol not found at ${path.relative(ROOT, AQA_P2_PROTO)}).`);
} else {
  const proto = fs.readFileSync(AQA_P2_PROTO, 'utf8');
  const commitFields = new Set();
  const re = /@FIELD_COMMIT\s*\{[^}]*?"field"\s*:\s*"([^"]+)"[^}]*\}/g;
  let mm;
  while ((mm = re.exec(proto)) !== null) commitFields.add(mm[1].trim());
  const expected = aqaP2FilingEls();
  const orphans = expected.filter(e => !commitFields.has(e));
  // Cross-tie to the CODE: the registry source must actually build these (guards a code-side rename
  // that the harness's own reconstruction would otherwise mask). Check the distinctive static tokens.
  const jsSrc = fs.existsSync(ASSESS_JS) ? fs.readFileSync(ASSESS_JS, 'utf8') : '';
  const codeTokens = ["'outline-body-'", "'-topic-q3'", "'-inf1-topic-q2'", "'outline-intro-thesis-q4'",
                      "'outline-conclusion-thesis'", "'outline-iumvcc-intro'", "'q3-technique-p'"];
  const missingTokens = jsSrc ? codeTokens.filter(tok => !jsSrc.includes(tok)) : ['(wml-assessment.js not found)'];
  // v7.20.226: P2 plan boxes moved to the @FIELD_SET side (the P1 .216 model — approved
  // structure at mirror-back approval, never per-element commits). IUMVCC plan boxes stay
  // commit-side by design (the student composes each compile — it IS the approved form).
  const setFieldsP2 = new Set();
  { const reS2 = /@FIELD_SET\{"field":"([^"]+)"/g; let mS2;
    while ((mS2 = reS2.exec(proto)) !== null) setFieldsP2.add(mS2[1]); }
  const planFieldsP2 = ['plan-Q2-para-1', 'plan-Q2-para-2', 'plan-Q3-para-1', 'plan-Q3-para-2',
    'plan-Q3-para-3', 'plan-Q4-body-1', 'plan-Q4-body-2', 'plan-Q4-body-3',
    'plan-Q4-intro', 'plan-Q4-conclusion'];
  const iumvccPlanP2 = ['iumvcc-intro', 'iumvcc-urgency', 'iumvcc-method', 'iumvcc-vision',
    'iumvcc-counter', 'iumvcc-conclusion'];
  const planMissP2 = planFieldsP2.filter(e => !setFieldsP2.has(e))
    .concat(iumvccPlanP2.filter(e => !commitFields.has(e)));
  note(`— EL BYTE-TRACE: ${expected.length - orphans.length}/${expected.length} code filing els + ${planFieldsP2.length + iumvccPlanP2.length - planMissP2.length}/${planFieldsP2.length + iumvccPlanP2.length} plan(@FIELD_SET)/IUMVCC(@FIELD_COMMIT) fields are real in the AQA P2 protocol.`);
  if (orphans.length) {
    failed = 1;
    note('  ❌ CODE registry el(s) with NO matching @FIELD_COMMIT field (write-key ≠ read-key — the LLM would echo an id that files nowhere):');
    orphans.forEach(e => note(`       ${e}`));
  }
  if (planMissP2.length) {
    failed = 1;
    note('  ❌ P2 plan/IUMVCC field(s) missing from the protocol (plan → @FIELD_SET template; iumvcc → @FIELD_COMMIT):');
    planMissP2.forEach(e => note(`       ${e}`));
  }
  if (missingTokens.length) {
    failed = 1;
    note('  ❌ frontend/wml-assessment.js _ladderRegistry no longer builds expected el token(s) — code/harness drift:');
    missingTokens.forEach(t => note(`       missing token ${t}`));
  }
}

// ── (3b) EL BYTE-TRACE — AQA P1 (v7.20.208 port; same KEY-MATCH gate as (3)) ───────────────────
// P1 registry els (_ladderRegistryP1) vs the P1 planning monolith's @FIELD_COMMIT fields.
// Q2/Q3 = TTECEA ×2 with -q2/-q3 suffixes; Q4 = bodies UNSUFFIXED + suffixed intro thesis +
// unsuffixed conclusion thesis. Synthetic els (q2-technique-p*, q3-feature-p*, q4-concepts,
// q4-technique-b*) file nothing and are excluded. Q5 scene rows are NOT registry els (CW is
// outside the ladder) but ARE protocol filings — checked as protocol fields only.
const AQA_P1_PROTO = path.join(ROOT, 'protocols', 'aqa', 'language1', 'planning', 'protocol-b-planning.md');
function aqaP1FilingEls() {
  const els = [];
  for (let i = 1; i <= 2; i++) {
    els.push(`outline-body-${i}-topic-q2`, `outline-body-${i}-evidence-q2`, `outline-body-${i}-analysis-q2`,
             `outline-body-${i}-effects-q2`, `outline-body-${i}-effects2-q2`, `outline-body-${i}-purpose-q2`);
  }
  for (let i = 1; i <= 2; i++) {
    els.push(`outline-body-${i}-topic-q3`, `outline-body-${i}-evidence-q3`, `outline-body-${i}-analysis-q3`,
             `outline-body-${i}-effects-q3`, `outline-body-${i}-effects2-q3`, `outline-body-${i}-purpose-q3`);
  }
  for (let i = 1; i <= 3; i++) {
    els.push(`outline-body-${i}-topic`, `outline-body-${i}-evidence`, `outline-body-${i}-analysis`,
             `outline-body-${i}-effects`, `outline-body-${i}-effects2`, `outline-body-${i}-purpose`);
  }
  els.push('outline-intro-thesis-q4', 'outline-conclusion-thesis');
  return els;
}
if (!fs.existsSync(AQA_P1_PROTO)) {
  note(`— EL BYTE-TRACE (P1): SKIP (AQA P1 planning protocol not found at ${path.relative(ROOT, AQA_P1_PROTO)}).`);
} else {
  const protoP1 = fs.readFileSync(AQA_P1_PROTO, 'utf8');
  const commitFieldsP1 = new Set();
  const reP1 = /@FIELD_COMMIT\s*\{[^}]*?"field"\s*:\s*"([^"]+)"[^}]*\}/g;
  let m1;
  while ((m1 = reP1.exec(protoP1)) !== null) commitFieldsP1.add(m1[1].trim());
  const expectedP1 = aqaP1FilingEls();
  const orphansP1 = expectedP1.filter(e => !commitFieldsP1.has(e));
  // Plan-side + Q5 scene filings the protocol must also target (template-real ids, no registry).
  // v7.20.216: plan boxes fill via @FIELD_SET at mirror-back approval (approved structure),
  // NOT per-element @FIELD_COMMIT (raw verbatim — outline-only now). Scene rows stay commits.
  const setFieldsP1 = new Set();
  { const reS = /@FIELD_SET\{"field":"([^"]+)"/g; let mS;
    while ((mS = reS.exec(protoP1)) !== null) setFieldsP1.add(mS[1]); }
  const planFieldsP1 = ['plan-Q2-para-1', 'plan-Q2-para-2', 'plan-Q3-para-1', 'plan-Q3-para-2',
    'plan-body-1', 'plan-body-2', 'plan-body-3', 'plan-intro', 'plan-conclusion'];
  const sceneFieldsP1 = ['plan-scene-Q5-hook', 'plan-scene-Q5-setup', 'plan-scene-Q5-reaction',
    'plan-scene-Q5-epiphany', 'plan-scene-Q5-proaction', 'plan-scene-Q5-climax', 'plan-scene-Q5-denouement'];
  const planMissP1 = planFieldsP1.filter(e => !setFieldsP1.has(e))
    .concat(sceneFieldsP1.filter(e => !commitFieldsP1.has(e)));
  const jsSrcP1 = fs.existsSync(ASSESS_JS) ? fs.readFileSync(ASSESS_JS, 'utf8') : '';
  const codeTokensP1 = ["'q2-technique-p'", "'q3-feature-p'", "'q4-concepts'", "'q4-technique-b'",
                        '_ladderRegistryP1', '_ladderQuestionOrder'];
  const missingTokensP1 = jsSrcP1 ? codeTokensP1.filter(tok => !jsSrcP1.includes(tok)) : ['(wml-assessment.js not found)'];
  note(`— EL BYTE-TRACE (P1): ${expectedP1.length - orphansP1.length}/${expectedP1.length} code filing els + ${planFieldsP1.length + sceneFieldsP1.length - planMissP1.length}/${planFieldsP1.length + sceneFieldsP1.length} plan(@FIELD_SET)/scene(@FIELD_COMMIT) fields are real @FIELD_COMMIT fields in the AQA P1 protocol.`);
  if (orphansP1.length) {
    failed = 1;
    note('  ❌ P1 CODE registry el(s) with NO matching @FIELD_COMMIT field (write-key ≠ read-key):');
    orphansP1.forEach(e => note(`       ${e}`));
  }
  if (planMissP1.length) {
    failed = 1;
    note('  ❌ P1 plan/scene field(s) the protocol never files (silent no-op on the doc):');
    planMissP1.forEach(e => note(`       ${e}`));
  }
  if (missingTokensP1.length) {
    failed = 1;
    note('  ❌ frontend/wml-assessment.js no longer builds expected P1 el token(s) — code/harness drift:');
    missingTokensP1.forEach(t => note(`       missing token ${t}`));
  }
}

// ── (3c) EL BYTE-TRACE — AQA LITERATURE (v7.20.229 port; same KEY-MATCH gate as (3)) ───────────
// Lit registry els (_ladderRegistryLit) vs the lit planning STEP FILES' @FIELD_COMMIT fields
// (modular protocol — filings live across b4/b5/b7/b8, so all planning/*.md are concatenated).
// Bodies = TTECEA+C ×3 UNSUFFIXED incl. the AO3 `context` row; intro/conclusion = per-element
// UNSUFFIXED. Synthetic els (lit-technique-b*, lit-overarching-concept, lit-working-thesis)
// file nothing and are excluded. Plan boxes fill via @FIELD_SET at each arc's approval.
const AQA_LIT_PLAN_DIR = path.join(ROOT, 'protocols', 'aqa', 'literature', 'planning');
function aqaLitFilingEls() {
  const els = [];
  for (let i = 1; i <= 3; i++) {
    els.push(`outline-body-${i}-topic`, `outline-body-${i}-evidence`, `outline-body-${i}-analysis`,
             `outline-body-${i}-effects`, `outline-body-${i}-effects2`, `outline-body-${i}-purpose`,
             `outline-body-${i}-context`);
  }
  els.push('outline-intro-thesis', 'outline-intro-hook', 'outline-intro-building');
  els.push('outline-conclusion-thesis', 'outline-conclusion-concept', 'outline-conclusion-purpose',
           'outline-conclusion-message');
  return els;
}
if (!fs.existsSync(AQA_LIT_PLAN_DIR)) {
  note(`— EL BYTE-TRACE (LIT): SKIP (lit planning dir not found at ${path.relative(ROOT, AQA_LIT_PLAN_DIR)}).`);
} else {
  const protoLit = fs.readdirSync(AQA_LIT_PLAN_DIR).filter(f => f.endsWith('.md'))
    .map(f => fs.readFileSync(path.join(AQA_LIT_PLAN_DIR, f), 'utf8')).join('\n');
  const commitFieldsLit = new Set();
  const reLit = /@FIELD_COMMIT\s*\{[^}]*?"field"\s*:\s*"([^"]+)"[^}]*\}/g;
  let mL;
  while ((mL = reLit.exec(protoLit)) !== null) commitFieldsLit.add(mL[1].trim());
  const expectedLit = aqaLitFilingEls();
  const orphansLit = expectedLit.filter(e => !commitFieldsLit.has(e));
  const setFieldsLit = new Set();
  { const reSL = /@FIELD_SET\{"field":"([^"]+)"/g; let mSL;
    while ((mSL = reSL.exec(protoLit)) !== null) setFieldsLit.add(mSL[1]); }
  const planFieldsLit = ['plan-body-1', 'plan-body-2', 'plan-body-3', 'plan-intro', 'plan-conclusion'];
  const planMissLit = planFieldsLit.filter(e => !setFieldsLit.has(e));
  const jsSrcLit = fs.existsSync(ASSESS_JS) ? fs.readFileSync(ASSESS_JS, 'utf8') : '';
  const codeTokensLit = ["'lit-technique-b'", "'lit-overarching-concept'", "'lit-working-thesis'",
                         '_ladderRegistryLit', '_isLitEssay'];
  const missingTokensLit = jsSrcLit ? codeTokensLit.filter(tok => !jsSrcLit.includes(tok)) : ['(wml-assessment.js not found)'];
  // The ladder module must ride the manifest's ALWAYS list — a step-scoped ladder file means
  // Session Law 9 vanishes on every step that doesn't name it (silent contract loss).
  const litManifest = path.join(ROOT, 'protocols', 'aqa', 'literature', 'manifest.json');
  let manifestOk = false;
  try {
    const mf = JSON.parse(fs.readFileSync(litManifest, 'utf8'));
    manifestOk = (mf.planning && Array.isArray(mf.planning.always) && mf.planning.always.includes('planning/b-ladder.md'));
  } catch (_) { manifestOk = false; }
  note(`— EL BYTE-TRACE (LIT): ${expectedLit.length - orphansLit.length}/${expectedLit.length} code filing els + ${planFieldsLit.length - planMissLit.length}/${planFieldsLit.length} plan @FIELD_SET fields are real in the lit planning files; b-ladder.md always-loaded: ${manifestOk ? 'yes' : 'NO'}.`);
  if (orphansLit.length) {
    failed = 1;
    note('  ❌ LIT CODE registry el(s) with NO matching @FIELD_COMMIT field (write-key ≠ read-key):');
    orphansLit.forEach(e => note(`       ${e}`));
  }
  if (planMissLit.length) {
    failed = 1;
    note('  ❌ LIT plan @FIELD_SET field(s) missing from the lit planning files:');
    planMissLit.forEach(e => note(`       ${e}`));
  }
  if (missingTokensLit.length) {
    failed = 1;
    note('  ❌ frontend/wml-assessment.js no longer builds expected LIT el token(s) — code/harness drift:');
    missingTokensLit.forEach(t => note(`       missing token ${t}`));
  }
  if (!manifestOk) {
    failed = 1;
    note('  ❌ protocols/aqa/literature/manifest.json planning.always does not include planning/b-ladder.md — the ladder contract would vanish on unlisted steps.');
  }
}

// ── (3d) EL BYTE-TRACE — EDUQAS 19th-CENTURY LITERATURE (v7.20.235 port; same gate as (3c)) ──────
// Eduqas 19th-c prose (Component 2 Section B) rides the SAME board-agnostic lit registry
// (_ladderRegistryLit) and the SAME outline/plan fieldIds as AQA lit — the engine gate _isLitEssay
// is subject-keyed (19thcentury), so no per-board engine leg was needed. This block proves the
// eduqas planning dir's @FIELD_COMMIT/@FIELD_SET ids and its manifest match that shared registry.
const EDU_LIT_PLAN_DIR = path.join(ROOT, 'protocols', 'eduqas', 'literature', 'planning');
if (!fs.existsSync(EDU_LIT_PLAN_DIR)) {
  note(`— EL BYTE-TRACE (EDUQAS LIT): SKIP (eduqas lit planning dir not found at ${path.relative(ROOT, EDU_LIT_PLAN_DIR)}).`);
} else {
  const protoEdu = fs.readdirSync(EDU_LIT_PLAN_DIR).filter(f => f.endsWith('.md'))
    .map(f => fs.readFileSync(path.join(EDU_LIT_PLAN_DIR, f), 'utf8')).join('\n');
  const commitFieldsEdu = new Set();
  const reEdu = /@FIELD_COMMIT\s*\{[^}]*?"field"\s*:\s*"([^"]+)"[^}]*\}/g;
  let mE;
  while ((mE = reEdu.exec(protoEdu)) !== null) commitFieldsEdu.add(mE[1].trim());
  const expectedEdu = aqaLitFilingEls();
  const orphansEdu = expectedEdu.filter(e => !commitFieldsEdu.has(e));
  const setFieldsEdu = new Set();
  { const reSE = /@FIELD_SET\{"field":"([^"]+)"/g; let mSE;
    while ((mSE = reSE.exec(protoEdu)) !== null) setFieldsEdu.add(mSE[1]); }
  const planFieldsEdu = ['plan-body-1', 'plan-body-2', 'plan-body-3', 'plan-intro', 'plan-conclusion'];
  const planMissEdu = planFieldsEdu.filter(e => !setFieldsEdu.has(e));
  const eduManifest = path.join(ROOT, 'protocols', 'eduqas', 'literature', 'manifest.json');
  let eduManifestOk = false;
  try {
    const mf = JSON.parse(fs.readFileSync(eduManifest, 'utf8'));
    eduManifestOk = (mf.planning && Array.isArray(mf.planning.always) && mf.planning.always.includes('planning/b-ladder.md'));
  } catch (_) { eduManifestOk = false; }
  note(`— EL BYTE-TRACE (EDUQAS LIT): ${expectedEdu.length - orphansEdu.length}/${expectedEdu.length} code filing els + ${planFieldsEdu.length - planMissEdu.length}/${planFieldsEdu.length} plan @FIELD_SET fields are real in the eduqas lit planning files; b-ladder.md always-loaded: ${eduManifestOk ? 'yes' : 'NO'}.`);
  if (orphansEdu.length) {
    failed = 1;
    note('  ❌ EDUQAS LIT CODE registry el(s) with NO matching @FIELD_COMMIT field (write-key ≠ read-key):');
    orphansEdu.forEach(e => note(`       ${e}`));
  }
  if (planMissEdu.length) {
    failed = 1;
    note('  ❌ EDUQAS LIT plan @FIELD_SET field(s) missing from the eduqas lit planning files:');
    planMissEdu.forEach(e => note(`       ${e}`));
  }
  if (!eduManifestOk) {
    failed = 1;
    note('  ❌ protocols/eduqas/literature/manifest.json planning.always does not include planning/b-ladder.md — the ladder contract would vanish on unlisted steps.');
  }
}

// ── (4) ENGINE CONTRACT — lock the verdict/heal mechanics from silent erosion (as (1) locks the
// protocol literals). These are the load-bearing lines a refactor would quietly break; the Fable
// review's two fixes (heal-weak must not spend the push; el-specific heal-commit) are guarded here
// so a future edit can't regress them unnoticed.
const ENGINE_CHECKS = [
  { file: ASSESS_JS, inv: 'wrong-class enum',            lit: "_LADDER_WRONG_CLASSES = ['misread', 'false-fact', 'technique-misid']" },
  { file: ASSESS_JS, inv: 'wrong-without-class heals',   lit: 'wrong without valid class → heal to weak' },
  { file: ASSESS_JS, inv: 'healed weak ≠ push spend',    lit: "s.verdict === 'weak' && s.source === 'llm'" },
  { file: ASSESS_JS, inv: 'heal-commit is el-specific',  lit: '_ladderReplyCommitsEl(reply, told.el)' },
  { file: ASSESS_JS, inv: 'idk gate (climb needs attempt)', lit: 'idkPending' },
  { file: ASSESS_JS, inv: 'insight wallet signal',       lit: '_LADDER_INSIGHT_RE' },
  { file: path.join(ROOT, 'frontend', 'wml-core.js'), inv: '@ELEMENT_JUDGE stripped (payload-optional, case-insensitive)', lit: '@ELEMENT_JUDGE(?:\\s*\\{[^}]*\\})?/gi' },
  { file: path.join(ROOT, 'frontend', 'wml-core.js'), inv: '@INSIGHT_SPENT stripped (payload-optional, case-insensitive)', lit: '@INSIGHT_SPENT(?:\\s*\\{[^}]*\\})?/gi' },
];
const engineMiss = [];
for (const c of ENGINE_CHECKS) {
  const src = fs.existsSync(c.file) ? fs.readFileSync(c.file, 'utf8') : '';
  if (!src.includes(c.lit)) engineMiss.push(c);
}
// v7.20.236 (Neil ruling, PEDAGOGY.md §10): lit essays are ALWAYS 3 body paragraphs — marks
// scale density, never structure. ONE constant, and the old marks-derived count must never return.
{
  const src236 = fs.existsSync(ASSESS_JS) ? fs.readFileSync(ASSESS_JS, 'utf8') : '';
  if (!src236.includes('var LIT_ESSAY_BODY_COUNT = 3')) {
    failed = 1;
    note('  ❌ LIT_ESSAY_BODY_COUNT constant missing — lit body count must be the single constant 3 (PEDAGOGY.md §10).');
  }
  if (/marks\s*>=\s*40\s*\?\s*4\s*:\s*3/.test(src236)) {
    failed = 1;
    note('  ❌ a `marks >= 40 ? 4 : 3` body-count derivation has returned — banned by PEDAGOGY.md §10 (density scales, structure never).');
  }
}
note(`— ENGINE CONTRACT (ladder mechanics in wml-assessment.js / wml-core.js): ${ENGINE_CHECKS.length - engineMiss.length}/${ENGINE_CHECKS.length} load-bearing lines present.`);
if (engineMiss.length) {
  failed = 1;
  note('  ❌ ladder engine mechanics have drifted (a refactor broke a guarded invariant):');
  engineMiss.forEach(c => note(`       ${c.inv} (${path.basename(c.file)}): expected «${c.lit}»`));
}

// ── (5) PIPELINE DISPATCH — the consumer must be UNGATED (v7.20.209, Neil's live P1 drive:
// applyFieldCommits sat inside the cw_ guard in BOTH pipelines, so every C-LADDER planning
// filing silently no-opped — 26 markers emitted, zero fields written. Task-scoping rule 1.)
// Check: every applyFieldCommits(res.reply CALL must NOT sit within 12 lines after a cw_ gate.
{
  const src = fs.existsSync(ASSESS_JS) ? fs.readFileSync(ASSESS_JS, 'utf8') : '';
  const lines = src.split('\n');
  const callIdx = [];
  lines.forEach((l, i) => { if (l.includes('applyFieldCommits(res.reply')) callIdx.push(i); });
  const gated = callIdx.filter(i => lines.slice(Math.max(0, i - 12), i).some(l => l.includes("startsWith('cw_')")));
  note(`— PIPELINE DISPATCH: ${callIdx.length} applyFieldCommits call site(s); ${gated.length} gated behind cw_.`);
  if (callIdx.length < 2 || gated.length) {
    failed = 1;
    if (callIdx.length < 2) note('  ❌ expected ≥2 applyFieldCommits(res.reply…) call sites (one per chat pipeline).');
    gated.forEach(i => note(`       ❌ call at line ${i + 1} sits inside/just after a cw_ guard — planning filings will silently no-op.`));
  }
}

if (failed) {
  note('\n❌ ladder-check-harness FAILED — the C-LADDER contract, a ladder protocol, the el key-match, or the engine mechanics have drifted.');
  process.exit(1);
}
note('✅ ladder-check-harness passed (C-LADDER contract intact; ladder protocols honest; el key-match verified; engine mechanics locked).');
