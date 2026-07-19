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

const ladderProtocols = planningFiles.filter(p => {
  const t = fs.readFileSync(p, 'utf8');
  return /Session Law 9/i.test(t) || /LENS REGISTRY/i.test(t);
});

if (ladderProtocols.length === 0) {
  note('— PROTOCOLS: no planning protocol has opted into the ladder yet (Session Law 9 / LENS REGISTRY) — nothing to check. (AQA P2 retrofit is bundled into P3.)');
} else {
  for (const p of ladderProtocols) {
    const rel = path.relative(ROOT, p);
    const t = fs.readFileSync(p, 'utf8');
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
  note(`— EL BYTE-TRACE: ${expected.length - orphans.length}/${expected.length} code filing els are real @FIELD_COMMIT fields in the AQA P2 protocol.`);
  if (orphans.length) {
    failed = 1;
    note('  ❌ CODE registry el(s) with NO matching @FIELD_COMMIT field (write-key ≠ read-key — the LLM would echo an id that files nowhere):');
    orphans.forEach(e => note(`       ${e}`));
  }
  if (missingTokens.length) {
    failed = 1;
    note('  ❌ frontend/wml-assessment.js _ladderRegistry no longer builds expected el token(s) — code/harness drift:');
    missingTokens.forEach(t => note(`       missing token ${t}`));
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
note(`— ENGINE CONTRACT (ladder mechanics in wml-assessment.js / wml-core.js): ${ENGINE_CHECKS.length - engineMiss.length}/${ENGINE_CHECKS.length} load-bearing lines present.`);
if (engineMiss.length) {
  failed = 1;
  note('  ❌ ladder engine mechanics have drifted (a refactor broke a guarded invariant):');
  engineMiss.forEach(c => note(`       ${c.inv} (${path.basename(c.file)}): expected «${c.lit}»`));
}

if (failed) {
  note('\n❌ ladder-check-harness FAILED — the C-LADDER contract, a ladder protocol, the el key-match, or the engine mechanics have drifted.');
  process.exit(1);
}
note('✅ ladder-check-harness passed (C-LADDER contract intact; ladder protocols honest; el key-match verified; engine mechanics locked).');
