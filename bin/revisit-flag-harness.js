#!/usr/bin/env node
/* eslint-env node */
/**
 * revisit-flag-harness.js — v7.20.410 (FIXLIST #207)
 *
 * WHY THIS EXISTS. Neil asked for a "come back to this" flag on a beat row plus a rail list of
 * everything flagged. The load-bearing property is not the button — it is DURABILITY: the flag is
 * student state, so it must live in the DOCUMENT and survive save → reload → re-entry. Sophicly has
 * lost this exact class of state before, which is why it is a law rather than a preference
 * (`feedback_walk_liveness_must_be_durable_not_localstorage`;
 * `reference_cw_walk_picks_must_be_document_rows` — a sidecar pick was destroyed by finish()).
 *
 * ⭐ WHAT MAKES THIS A GATE AND NOT A NOTE. The flag round-trips through a STRING patch over the
 * serialised HTML (patchRevisitIntoHTML), the same mechanism checkbox state uses. That patch and the
 * NodeView's read of `data-revisit` are two sides of one key, in two different parts of a 48k-line
 * file — the write-key ≠ read-key class (root CLAUDE.md §5d), which is the single most recurring
 * bug in this codebase. These assertions pin BOTH sides at once.
 *
 * ⚠️ IT SLICES THE REAL FUNCTION out of wml-assessment.js rather than restating it — a check that
 * duplicates its subject tests its own memory of it
 * (`feedback_a_check_that_duplicates_its_subject_is_not_a_check`).
 *
 * PROVEN NON-VACUOUS — each defect was injected into the shipped source and the harness confirmed
 * RED, then reverted. These are the runs that actually happened, not a plausible list:
 *   • `const CW6_FID_PREFIX = 'outline-'`                     → RED (prefix derivation)
 *   • drop the `[^>]*?` lazy head from the row pattern        → RED (replace-not-duplicate)
 *   • weaken the strip guard `!st || !st.on` → `!st`          → RED (an OFF flag would persist)
 *   • `_revisitOf` returns `st || null`                       → RED (OFF read as flagged)
 *   • treat every CW6 row as flagged inside the patch         → RED (exactly-one-row stamped)
 *
 * ⚠️ AND ONE THAT CAME BACK GREEN, which is why assertion 4b exists. The first cut mutated the row
 * button to write `{on:0}` instead of deleting the entry — and the harness PASSED, because it only
 * ever exercised `delete()`, so the `!st.on` guard was never reached. The fix was to strengthen the
 * harness (assert that an explicitly-OFF flag is stripped too), not to soften the claim. A mutation
 * that comes back green is the only reliable way to find an assertion that is testing nothing.
 *
 * Run: node bin/revisit-flag-harness.js       (wired into bin/pre-ship-check.sh)
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'frontend', 'wml-assessment.js');
const src = fs.readFileSync(SRC, 'utf8');

let failed = 0;
function ok(m) { console.log('   ✓ ' + m); }
function bad(m) { console.log('   ❌ ' + m); failed++; }
function is(actual, expected, m) {
    if (actual === expected) ok(m);
    else bad(m + '\n        expected: ' + JSON.stringify(expected) + '\n        actual:   ' + JSON.stringify(actual));
}

// ── Slice the REAL functions out of the shipped file ──────────────────────────────────────────
function sliceFn(name) {
    const start = src.indexOf('function ' + name + '(');
    if (start < 0) throw new Error('revisit-flag-harness: could not find function ' + name + ' in wml-assessment.js');
    let i = src.indexOf('{', start), depth = 0, end = -1;
    for (; i < src.length; i++) {
        const c = src[i];
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    if (end < 0) throw new Error('revisit-flag-harness: unbalanced braces slicing ' + name);
    return src.slice(start, end);
}

const srcRowFieldId = sliceFn('_cw6RowFieldId');
const srcPatch = sliceFn('patchRevisitIntoHTML');
const srcRevisitOf = sliceFn('_revisitOf');

// The prefix derivation is a one-liner const, not a function — take it verbatim so a change to it
// is a change to what this harness tests.
const prefixLine = (src.match(/^\s*const CW6_FID_PREFIX = .*$/m) || [])[0];
if (!prefixLine) { console.log('   ❌ CW6_FID_PREFIX declaration not found'); process.exit(1); }

const sandbox = new Function(
    'return (function () {\n'
    + '  const _outlineRevisitState = new Map();\n'
    + srcRowFieldId + '\n'
    + prefixLine.trim() + '\n'
    + srcRevisitOf + '\n'
    + srcPatch + '\n'
    + '  return { _outlineRevisitState, patchRevisitIntoHTML, _revisitOf, CW6_FID_PREFIX, _cw6RowFieldId };\n'
    + '})();'
)();

const { _outlineRevisitState: MAP, patchRevisitIntoHTML: patch, CW6_FID_PREFIX, _cw6RowFieldId } = sandbox;

console.log('REVISIT FLAG (#207) — durability gate');

// ── 1. The prefix is DERIVED from the one canonical producer ──────────────────────────────────
is(CW6_FID_PREFIX, 'outline-cw-', 'the CW6 row prefix derives from _cw6RowFieldId, not a second literal');

const FID = _cw6RowFieldId('rebirth-redemption', 'setup', 'beat_3');
const OTHER = _cw6RowFieldId('tragedy', 'aftermath', 'beat_9');
const NON_CW6 = 'plan-Q3-para-1';   // a literature/language row — must never be touched

const row = (fid, extra) => '<div data-outline-row="true" data-field-id="' + fid + '"' + (extra || '') + '><p>x</p></div>';
const DOC = () => row(FID) + row(OTHER) + row(NON_CW6);

// ── 2. A flagged row gets the attribute baked into the saved HTML ─────────────────────────────
MAP.clear();
MAP.set(FID, { on: 1, note: 'weak ending' });
let out = patch(DOC());
is(/data-field-id="([^"]*)"[^>]*data-revisit=/.test(out), true, 'a flagged row is stamped into the saved HTML');
is((out.match(/data-revisit=/g) || []).length, 1, 'exactly ONE row is stamped — not every row');
is(out.indexOf('&quot;note&quot;:&quot;weak ending&quot;') > -1, true, 'the student’s note rides along, entity-escaped for an attribute');

// ── 3. The READ side agrees with the WRITE side (the §5d key trace) ───────────────────────────
// This is the assertion that would have caught a `data-revisit` / `data-revisit-state` drift: it
// parses the attribute back exactly the way the NodeView's seed does.
const seedRe = /data-field-id="([^"]*)"[^>]*data-revisit="([^"]*)"/;
const m = out.match(seedRe);
const reparsed = m ? JSON.parse(m[2].replace(/&quot;/g, '"')) : null;
is(m && m[1], FID, 'the stamped attribute sits on the row it belongs to');
is(reparsed && reparsed.on, 1, 'the NodeView’s own read of data-revisit recovers the flag');
is(reparsed && reparsed.note, 'weak ending', 'the note survives the round trip byte-for-byte');

// ── 4. A CLEARED flag does not resurrect ──────────────────────────────────────────────────────
// The graveyard failure in reverse: if the save only ADDED attributes, a row cleared from the rail
// list would keep its stale data-revisit and come back flagged on the next load, for ever.
MAP.delete(FID);
out = patch(out);   // save again, over HTML that already carries the flag
is(/data-revisit=/.test(out), false, 'a cleared flag does not resurrect — the attribute is stripped on the next save');

// …and the SAME must hold for the other way a clear could be expressed. The row button deletes the
// entry, but a future writer (or a partially-migrated saved doc) could leave `{on:0}` behind, and
// an off flag must be as invisible as an absent one. Without this assertion the first mutation test
// ran GREEN — the harness only exercised delete(), so the `!st.on` guard was untested.
MAP.set(FID, { on: 0, note: 'switched off' });
out = patch(row(FID, ' data-revisit="{&quot;on&quot;:1}"'));
is(/data-revisit=/.test(out), false, 'an explicitly OFF flag is stripped too, not just a deleted one');
is(!!sandbox._revisitOf(FID), false, '_revisitOf — the ONE reader — treats {on:0} as not flagged');

// ── 5. An existing flag is REPLACED, never duplicated ─────────────────────────────────────────
MAP.clear();
MAP.set(FID, { on: 1, note: 'first' });
let twice = patch(patch(DOC()));
is((twice.match(/data-revisit=/g) || []).length, 1, 'saving twice leaves ONE attribute, not two');
MAP.set(FID, { on: 1, note: 'second' });
twice = patch(twice);
is(twice.indexOf('second') > -1 && twice.indexOf('first') === -1, true, 'an edited note replaces the old one');

// ── 6. Only CW6 beat rows are touched ─────────────────────────────────────────────────────────
// A stray flag keyed on a literature/language row would be written into a document family that has
// no control to clear it — refused with nothing (§4d), and invisible.
MAP.clear();
MAP.set(NON_CW6, { on: 1, note: 'should never appear' });
out = patch(DOC());
is(/data-revisit=/.test(out), false, 'a non-CW6 row is never stamped, even if its id is flagged in the Map');

// ── 7. The row markup is otherwise untouched ──────────────────────────────────────────────────
MAP.clear();
is(patch(DOC()), DOC(), 'with nothing flagged, the saved HTML is byte-identical to the input');

// ── 8. The flag is DOCUMENT state — no localStorage anywhere in its implementation ────────────
// The law this feature most easily breaks, asserted against the real source rather than trusted.
const implWindow = src.slice(src.indexOf('const _outlineRevisitState'), src.indexOf('const _outlineRevisitState') + 2000);
is(/localStorage|sessionStorage/.test(implWindow), false, 'the revisit store is document state — never localStorage');

// ── 9. Both halves of the clearing ritual exist (§11: no graveyards) ──────────────────────────
is(src.indexOf('swml-rv-clear') > -1, true, 'the rail list can clear a flag');
is(/_outlineRevisitState\.delete\(/.test(src), true, 'the row button can clear a flag');
is(src.indexOf('serveRevisitReminder') > -1, true, 'Review & Save surfaces what is still flagged');

console.log(failed
    ? '\n❌ revisit-flag-harness FAILED (' + failed + ' assertion(s)).'
    : '\n✅ revisit-flag-harness passed (flag survives save/reload, a cleared flag cannot resurrect, only CW6 rows touched).');
process.exit(failed ? 1 : 0);
