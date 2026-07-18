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

    // (b) method-not-content — scan LENS REGISTRY lens lines for (i) a source quotation, (ii) a
    // completed "the writer's <content-noun>" reading. Conservative: only flags clear violations.
    const lensLines = t.split('\n').filter(l => /the writer'?s\s+[a-z]/i.test(l));
    for (const l of lensLines) {
      const m = /the writer'?s\s+([a-z]+)/i.exec(l);
      if (m && !DIRECTION_NOUNS.has(m[1].toLowerCase())) {
        problems.push(`(b) lens names a completed reading: "the writer's ${m[1]}" — use a DIRECTION (attitude/focus/choice), not content, in:\n         ${l.trim()}`);
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

if (failed) {
  note('\n❌ ladder-check-harness FAILED — the C-LADDER contract or a ladder protocol has drifted.');
  process.exit(1);
}
note('✅ ladder-check-harness passed (C-LADDER contract intact; ladder protocols honest).');
