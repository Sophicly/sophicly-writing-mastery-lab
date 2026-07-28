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

console.log(`   ${asserts.pass} assertions passed`);
if (fail) {
    console.error(`❌ cw-keymatch-harness FAILED (${asserts.fail} assertion(s)).`);
    process.exit(1);
}
console.log('✅ cw-keymatch-harness passed (every CW write-key has a row that creates it).');
