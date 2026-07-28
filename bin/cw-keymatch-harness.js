#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-keymatch-harness.js — KEY-SHAPE gate for the CW document field ids (v7.20.322).
 *
 * This is the first half of the ghost-call / key-shape harness Neil approved on 2026-07-27.
 *
 * ⭐ THE BUG CLASS. WML's most frequent recurring defect is a WRITE-KEY that does not match a
 * READ-KEY: a walk files an answer under `cw-step-4-throughlne`, the document has a row called
 * `cw-step-4-throughline`, and the result is "it saved fine but nothing appears" — no error, no
 * console warning, nothing to notice until a human happens to look at an empty box. Root
 * CLAUDE.md §5d calls it the number-one recurring Sophicly bug and prescribes a byte-diff of every
 * producer against every consumer. That diff is what this file does, mechanically, on every ship.
 *
 * WHAT IT ASSERTS
 *   1. Every `cw-step-N-*` field id a walk WRITES has a row that CREATES it — either in a document
 *      template (`outlineRowHTML(..., 'fid')`) or in an on-load heal. A write with no row is a
 *      silent no-op: the value goes nowhere and the student loses the answer.
 *   2. Every id that is READ back (rowText / _cwDocValue / ANCHOR_SRC) likewise resolves to a row.
 *   3. The v7.20.322 throughline specifically: template, heal, write, read and resume must all use
 *      the identical literal, and the id must be reachable from ONE constant rather than retyped.
 *
 * WHAT IT DOES NOT CLAIM. It cannot catch "a decision was never filed anywhere at all" — the
 * throughline's original defect, where the pick lived only in a localStorage sidecar and no field
 * id existed on either side. Nothing static can see an absence of intent. It catches DRIFT between
 * two sides that both exist, which is the failure that actually recurs.
 *
 * Usage: node bin/cw-keymatch-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

console.log('CW DOCUMENT KEYS — write-key ≡ read-key');

// ── every id a document ROW actually creates ──────────────────────────────────────────────────
// Both the baked templates and the on-load heals go through outlineRowHTML(props, 'fid').
const created = new Set();
const ROW_RE = /outlineRowHTML\([\s\S]{0,400}?,\s*'(cw-[a-z0-9-]+)'\s*\)/g;
let m;
while ((m = ROW_RE.exec(JS))) created.add(m[1]);
ok(created.size > 20, `the row scan found the templates (${created.size} cw-* rows created)`);

// ── every id something WRITES or READS by literal ─────────────────────────────────────────────
function literalsFrom(re) {
    const out = new Set();
    let x;
    while ((x = re.exec(JS))) out.add(x[1]);
    return out;
}
const written = literalsFrom(/_writeOutlineRowField\(\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g);
const readBack = new Set([
    ...literalsFrom(/rowText\(\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g),
    ...literalsFrom(/_cwDocValue\(\s*'[a-z_]+'\s*,\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g),
    ...literalsFrom(/(?:story_open|story_close):\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g)
]);

// The field-id tables the walks map over (COMPONENTS / BEATS / CW_STEP4_SPINE …) declare their ids
// as `fid: 'cw-…'`, and every one of those is both written and read through the same table.
const tableFids = literalsFrom(/\bfid:\s*'(cw-step-[0-9]+[a-z0-9-]*)'/g);

[['written by a walk', written], ['read back by a walk', readBack], ['declared in a walk table', tableFids]]
    .forEach(([what, set]) => {
        set.forEach(fid => {
            ok(created.has(fid),
                `${fid} is ${what} but NO document row creates it — the write lands nowhere and the ` +
                `student's answer is silently lost (add it to the step template AND an on-load heal)`);
        });
    });
console.log(`   ${created.size} rows created · ${written.size} written · ${readBack.size} read · ${tableFids.size} in walk tables`);

// ── v7.20.322: the throughline, end to end ────────────────────────────────────────────────────
console.log('CW STEP 4 — the dramatic throughline is durable');
{
    const FID = 'cw-step-4-throughline';
    ok(created.has(FID), 'a document row creates the throughline');
    // TWO producers are required and they are not interchangeable: the baked TEMPLATE serves every
    // NEW project, the HEAL serves every project that already exists. Checking only that "some row
    // creates it" passes when one of the two has drifted — which is precisely the half-fix that
    // ships a feature working for new students and silently missing for the current cohort.
    const producers = (JS.match(new RegExp(`,\\s*'${FID}'\\s*\\)`, 'g')) || []).length;
    ok(producers >= 2, `both the template AND the heal create the throughline row (found ${producers} producer(s))`);
    ok(/tryHealCwStep4Throughline/.test(JS), 'an on-load heal exists for projects created before this row');
    ok(/\.then\(\(\) => tryHealCwStep4Throughline\(\)\)/.test(JS), 'and that heal is actually wired into the load chain');
    ok(new RegExp(`THROUGHLINE_FID = '${FID}'`).test(JS), 'the id has ONE canonical constant');
    ok(/_writeOutlineRowField\(THROUGHLINE_FID, pick\)/.test(JS),
        'the pick is written to the document, not just the localStorage sidecar that finish() clears');
    ok(/if \(rowText\(THROUGHLINE_FID\)\)/.test(JS),
        'the resume asks the DOCUMENT whether the throughline was already chosen');
    // The resume test must come BEFORE the branch that forces phase='throughline', or a finished
    // walk still gets the chips stapled to its wrap-up (Neil's live catch).
    const resumeAt = JS.indexOf('if (rowText(THROUGHLINE_FID))');
    const forceAt = JS.indexOf("phase = 'throughline'; active = true; pending = false;");
    ok(resumeAt > 0 && forceAt > 0 && resumeAt < forceAt,
        'and it is checked BEFORE the branch that would force the throughline phase (order is the fix)');
    ok(/fid: 'cw-step-4-throughline'/.test(JS),
        'the throughline rides CW_STEP4_SPINE, so later steps and the Story Spine panel see it');
}

// ── v7.20.323: EVERY CHIP MENU IS CLASSIFIED — content (filed) or flow-control (ephemeral) ────
//
// Neil, 2026-07-28, on the throughline fix: "how are we going to make sure that the issue we found
// in step four is fixed universally?" This is the answer. The defect was never really "the
// throughline is missing a row" — it was that a student's CHOICE could be neither filed nor
// deliberately discarded, and nothing anywhere noticed. Auditing carefully once does not survive
// the next session; a gate does.
//
// So every chipBar/chipBarMulti call site must be declared below:
//   'content' — the pick IS an answer. It MUST reach a document row, or it dies when finish()
//               clears the sidecar (the throughline, v7.20.322; the unmet need, v7.20.323).
//   'flow'    — the pick steers the walk ("Rewrite Beat 3 →", "Leave it as it is →"). It must
//               NOT be persisted: a stored gate replays forever once its condition clears
//               (the v7.20.284 fossil-gate bug). Ephemeral is the correct answer here.
// A NEW menu belongs to neither until someone says so, and this gate refuses to pass until they
// do — which is exactly the decision that was skipped twice.
console.log('CW CHIP MENUS — every pick is filed or deliberately ephemeral');
{
    const MENUS = {
        // content — must be filed
        onSecondaryNeedsDone:  { kind: 'content', fid: 'NEEDS_FID', note: 'the "any others?" multi-select' },
        onThroughlinePick:     { kind: 'content', fid: 'THROUGHLINE_FID', note: 'the dramatic throughline' },
        onPick:                { kind: 'content', note: 'Step 5 plot archetype → _setOutlineDropdown' },
        onLoglinePick:         { kind: 'content', note: 'Step 3 chosen logline → cw-step-3-chosen (v7.20.325)' },
        // flow-control — must NOT be filed
        onCohChoice:    { kind: 'flow', note: 'rewrite / keep the beat the coherence check flagged' },
        onAnchorChoice: { kind: 'flow', note: 'Step 6 story bookend: still right / sharpen' },
        onStageChoice:  { kind: 'flow', note: 'Step 6 stage arc: sharpen / leave' },
        onFinishChoice: { kind: 'flow', note: 'Step 6 final image: rewrite / leave' },
        onPushChoice:   { kind: 'flow', note: 'Step 5 archetype push: switch / keep' },
        onMultiDone:    { kind: 'flow', note: 'Step 5 alternates considered (multi-select)' },
        onReviewChipPick: { kind: 'flow', note: 'Step 3 review: sharpen component X / move on — steers the walk' },
        // scaffold — the pick SHAPES the next ask, and the written answer that follows is what
        // gets filed. Not lost, because the beat sentence carries it. Beat 1 is the exception and
        // is handled separately (onSecondaryNeedsDone → NEEDS_FID), because there the category IS
        // the answer rather than a lead-in to one.
        onBeatChipPick: { kind: 'scaffold', note: 'Step-4 beat category chips (incident/goal/obstacle/stakes) — the beat text the student then writes is filed' },
    };
    // Match CALL sites only. `function chipBar(options, onPick)` is a DEFINITION and its parameter
    // name would otherwise be scanned as though it were a handler — and Step 5's real handler
    // happens to be called onPick too, so the two are indistinguishable without this guard.
    // The handler may be passed bare (`onThroughlinePick`) or as a factory call
    // (`onBeatChipPick(b)`), so the trailing argument list is optional.
    const CALL_RE = /(?<!function\s)\bchipBar(?:Multi)?\(\s*[\s\S]{0,240}?,\s*([A-Za-z_$][\w$]*)\s*(?:\([^()]*\))?\s*\)/g;
    const found = new Set();
    let c;
    while ((c = CALL_RE.exec(JS))) found.add(c[1]);
    found.forEach(fn => {
        ok(Object.prototype.hasOwnProperty.call(MENUS, fn),
            `chip menu "${fn}" is not classified — declare it 'content' (and file the pick to a ` +
            `document row) or 'flow' (steers the walk, must stay ephemeral). An unclassified menu ` +
            `is how the throughline and the unmet need both got lost.`);
    });
    Object.keys(MENUS).forEach(fn => {
        ok(found.has(fn), `declared chip menu "${fn}" no longer exists — remove it from this list`);
    });
    // Content menus that name a fid constant must actually write through it.
    Object.entries(MENUS).forEach(([fn, cfg]) => {
        if (cfg.kind !== 'content' || !cfg.fid) return;
        ok(new RegExp(`_writeOutlineRowField\\(${cfg.fid}`).test(JS),
            `${fn} is content (${cfg.note}) but never writes through ${cfg.fid} — the pick would ` +
            `live only in the sidecar that finish() clears`);
    });
    // Flow-control picks must not be smuggled into the document.
    // QUOTE-ANCHORED and case-SENSITIVE (v7.20.328). Chip LABELS are capitalised and quoted
    // ("Rewrite it", "Leave it as it is", "Sharpen my Flaw"); the v7.20.327 push-cycle KIND is the
    // lowercase literal 'rewrite', and `{ replace: step.cycle === 'rewrite' }` is a legitimate
    // argument, not a pick being filed. The old case-insensitive bare-word match could not tell
    // them apart and failed the gate on a correct change.
    ok(!/_writeOutlineRowField\([^)]*['"`](?:Rewrite|Leave it|Sharpen|Still right)/.test(JS),
        'no flow-control pick is written to the document (a persisted gate replays forever — v7.20.284)');
    console.log(`   ${found.size} chip menus, all classified`);
}

console.log(`   ${asserts.pass} assertions passed`);
if (fail) {
    console.error(`❌ cw-keymatch-harness FAILED (${asserts.fail} assertion(s)).`);
    process.exit(1);
}
console.log('✅ cw-keymatch-harness passed (every CW write-key has a row that creates it).');
