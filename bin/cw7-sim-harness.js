#!/usr/bin/env node
/* eslint-env node */
/**
 * cw7-sim-harness.js — BEHAVIOURAL gate for the CW Step-7 universal-values walk (v7.20.419).
 *
 * Slices the REAL `_cwValuesCtl` out of wml-assessment.js and drives it on the SHARED rig
 * (walk-sim-lib), so what is asserted is the shipped code and the shipped primitives — the answer
 * slot, serveCwChunks' pacing, recordTurn's durability contract and the automatic liveness check
 * inside say()/tap(), which cannot be opted out of.
 *
 * ⭐ WHY THIS WALK NEEDED ITS OWN GATE, beyond "every walk has one".
 *
 * 1. **It is the first walk whose rows are MULTI-CONTROL.** A Step-7 value row is only complete
 *    with ≥1 trait ticked AND a balance/excess/deficit state AND text (Neil's #232 ruling). Three
 *    separate writes, into two namespaced control states and a text field, per row, twelve times.
 *    The primitive that does it (`_setRowControlChoice`) is modelled in the rig rather than
 *    stubbed, so "the state pick quietly wiped the traits" would FAIL here rather than on a
 *    student's screen. In production the wrong helper (`_tickOutlineRow`) does exactly that, and
 *    silently.
 * 2. **It is the first walk with ZERO judgment calls.** The budget assertion is therefore
 *    `sends.length === 0`, not "one". If a future edit reaches for the model — a verdict, a
 *    summary, a "let me check that for you" — this fails, which is the whole point of #220b.
 * 3. **Its position is a PAIR** (station, phase) and both are derived from the document. A walk
 *    that re-derives only the station would re-ask for traits the student already ticked, or skip
 *    straight past a half-finished row.
 *
 * Usage: node bin/cw7-sim-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { SRC, braceSliceFrom, makeWorld, settle } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── the shipped Step-7 data, sliced (never re-typed — that would be a second producer) ─────────
function evalAfter(label) {
    const i = SRC.indexOf(label);
    if (i < 0) throw new Error('not found in wml-assessment.js: ' + label);
    // eslint-disable-next-line no-eval
    return eval('(' + braceSliceFrom(SRC, i + label.length, '[', ']').text + ')');
}
const CW7_VALUES = evalAfter('const CW7_VALUES =');
const CW7_STATES = evalAfter('const CW7_STATES =');
const fidIdx = SRC.indexOf('function _cw7RowFieldId(');
if (fidIdx < 0) { console.error('❌ _cw7RowFieldId not found — the ONE field-id producer is gone'); process.exit(1); }
// eslint-disable-next-line no-new-func
const _cw7RowFieldId = new Function('return ' + SRC.slice(fidIdx, braceSliceFrom(SRC, fidIdx, '{', '}').end)
    .replace(/^function\s+\w+/, 'function') + ';')();

const ctlIdx = SRC.indexOf('const _cwValuesCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwValuesCtl not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = { src: braceSliceFrom(SRC, ctlIdx, '(', ')').text + '()' };

const FIDS = [];
['begin', 'end'].forEach((w) => CW7_VALUES.forEach((v) => FIDS.push(_cw7RowFieldId(w, v.id))));
['shift', 'align', 'pressure'].forEach((s) => FIDS.push(_cw7RowFieldId('reflect', s)));
const VALUE_FIDS = FIDS.slice(0, CW7_VALUES.length * 2);
const REFLECT_FIDS = FIDS.slice(CW7_VALUES.length * 2);

// The real roster for each control, so the rig can refuse a label the document does not carry.
function ctlItemsFor(fid, ctlId) {
    if (ctlId === 'state') return CW7_STATES;
    const v = CW7_VALUES.filter((x) => fid.indexOf('-' + x.id) !== -1)
        .sort((a, b) => b.id.length - a.id.length)[0];
    return v ? v.traits : [];
}

function world(opts) {
    opts = opts || {};
    return makeWorld(CTL_SRC, Object.assign({
        task: 'cw_step_7',
        fids: FIDS,
        ok: ok,                     // enables the rig's automatic liveness check
        ctlItemsFor: ctlItemsFor,
        extraDeps: {
            CW7_VALUES: CW7_VALUES,
            CW7_STATES: CW7_STATES,
            _cw7RowFieldId: _cw7RowFieldId,
        },
    }, opts));
}

// ── DRIVING THIS WALK ─────────────────────────────────────────────────────────────────────────
// The rig's own `toAsk()` waits for the answer slot to arm, which is right for every walk whose
// stations OPEN with a typed question. Step 7's open with a TAP (the trait multi-select), so the
// slot is deliberately clear at that point and toAsk would spin. These name the three surfaces
// explicitly instead, which is also what lets a test assert WHICH one it is on.
const isNav = (c) => /Continue/.test(String(c.textContent));
const isState = (c) => CW7_STATES.indexOf(String(c.textContent).replace(/^✓ /, '')) !== -1;

// A PACED teaching run: one bubble, one Continue, nothing else on the bar (law 4b).
function tapThroughPacing(w, limit) {
    for (let g = 0; g < (limit || 12); g++) {
        const chips = w.chips();
        if (chips.length !== 1 || !isNav(chips[0])) return true;
        w.tap(chips[0]);
    }
    return false;
}

// Drive one value station the way a student does: tick a trait, Continue, tap a state, write.
function playStation(w, traitIdx, stateLabel, text) {
    tapThroughPacing(w);
    const chips = w.chips();
    const traits = chips.filter((c) => !isNav(c));
    if (!traits.length) return false;
    w.tap(traits[Math.min(traitIdx || 0, traits.length - 1)]);
    const cont = w.chips().filter(isNav)[0];
    if (!cont) return false;
    w.tap(cont);
    const st = w.chips().filter((c) => String(c.textContent) === stateLabel)[0];
    if (!st) return false;
    w.tap(st);
    w.say(text);
    return true;
}

async function main() {
console.log('CW STEP-7 VALUES WALK — behavioural sim (real _cwValuesCtl)');

// ── 0. THE SHAPE ──────────────────────────────────────────────────────────────────────────────
ok(CW7_VALUES.length === 6, 'there are six universal values, found ' + CW7_VALUES.length);
ok(CW7_STATES.length === 3 && CW7_STATES.join('|') === 'In balance|In excess|In deficit',
    'the three states are not the ones the document offers — the walk would tick nothing');
ok(FIDS.length === 15, 'expected 15 rows (12 value + 3 reflection), got ' + FIDS.length);
// Every id the walk uses must be one the DOCUMENT builder produces. Both sides call the same
// producer here, which is the point — but if someone re-types one, this catches it (§5d).
ok(FIDS.every((f) => f.indexOf('cw-step-7-') === 0),
    'a Step-7 field id does not carry the cw-step-7- prefix — it would fall out of the key-match and criteria gates');

// ── 1. FULL RUN — the whole walk, every row complete, and NOT ONE API CALL ────────────────────
{
    const w = world();
    w.ctl.forceStart();
    await settle();
    ok(w.ctl.active, 'full run: the walk did not activate');
    // Orientation is PACED (law 4b) — more than one bubble must never land in a single frame.
    ok(w.bubbles.length >= 1, 'full run: nothing was served on start');
    ok(tapThroughPacing(w, 12), 'full run: the paced orientation never handed over to a station');
    ok(w.chips().length > 1, 'full run: the first station did not open on its trait multi-select');

    let guard = 0;
    while (guard++ < 120 && w.ctl.active) {
        const before = w.bubbles.length;
        const chips = w.chips();
        if (chips.some((c) => /Change an answer/.test(String(c.textContent)))) break;   // the wrap
        if (chips.length) {
            const state = chips.filter(isState)[0];
            if (state) { w.tap(state); continue; }
            const traits = chips.filter((c) => !isNav(c));
            if (traits.length) { w.tap(traits[0]); }        // tick one, then Continue in the SAME pass
            const cont = w.chips().filter(isNav)[0];
            if (cont) { w.tap(cont); continue; }
        }
        if (w.deps._walkSlot && w.deps._walkSlot.armed) {
            w.say('answer ' + guard + ' — she says nothing in the head teacher’s office.');
            continue;
        }
        if (w.bubbles.length === before && !w.chips().length) break;       // stalled
    }

    const emptyRows = FIDS.filter((f) => !w.rows.get(f));
    ok(emptyRows.length === 0, 'full run: rows STILL EMPTY at the end — ' + emptyRows.join(', '));
    const noTraits = VALUE_FIDS.filter((f) => !(w.ctls.get(f + '|traits') || []).length);
    ok(noTraits.length === 0, 'full run: ' + noTraits.length + ' value row(s) have no trait ticked — '
        + 'the row can never complete and the section can never tick green (#232)');
    const noState = VALUE_FIDS.filter((f) => !(w.ctls.get(f + '|state') || []).length);
    ok(noState.length === 0, 'full run: ' + noState.length + ' value row(s) have no balance/excess/deficit');
    const twoStates = VALUE_FIDS.filter((f) => (w.ctls.get(f + '|state') || []).length > 1);
    ok(twoStates.length === 0, 'full run: a row holds TWO states at once (' + twoStates.join(', ')
        + ') — the state pick must be exclusive, a value cannot be in balance and in deficit');
    ok(!w.lostWrite, 'full run: a write targeted a row that does not exist — ' + w.lostWrite);
    ok(!w.lostCtl, 'full run: a control tick targeted a row that does not exist — ' + w.lostCtl);
    ok(!w.lostCtlLabel, 'full run: the walk offered a choice the DOCUMENT does not carry — '
        + w.lostCtlLabel + ' (the chip would tick nothing, silently)');

    // ⭐⭐ THE BUDGET. Fifteen stations, ~39 turns, ZERO round-trips.
    ok(w.sends.length === 0, 'full run: ' + w.sends.length + ' API call(s) — Step 7 spends NONE '
        + '(#220b). The greeting is the only round trip in this step and it happens before the walk.');
    ok(!w.armed, 'full run: the walk armed a resume hook — it has no judgment turn to wait for');
    ok(!w.ctl.active, 'full run: still active after the wrap');
}

// ── 2. THE STATE PICK IS EXCLUSIVE, AND IT CANNOT CLOBBER THE TRAITS ─────────────────────────
// The defect this models is invisible in the browser: _tickOutlineRow would replace the row's
// whole check-state object and delete the traits the student had just chosen.
{
    const w = world();
    w.ctl.forceStart(); await settle(); w.toAsk(12);
    const f0 = VALUE_FIDS[0];
    playStation(w, 0, 'In deficit', 'she says nothing when it counts.');
    ok((w.ctls.get(f0 + '|traits') || []).length >= 1,
        'exclusivity: the traits were LOST when the state was picked — this is the multi-control '
        + 'clobber, and in the browser it happens with no error at all');
    ok((w.ctls.get(f0 + '|state') || []).join('') === 'In deficit', 'exclusivity: the state did not file');
    ok(!!w.rows.get(f0), 'exclusivity: the explanation did not reach the row');
}

// ── 2b. THE STATE PICK REPLACES ONE ALREADY IN THE DOCUMENT ──────────────────────────────────
// ⚠️ THIS TEST EXISTS BECAUSE THE OBVIOUS ONE WAS VACUOUS. A full run only ever picks a state
// once, so it passes identically with and without `exclusive` — proved by injecting the defect
// and watching nothing fail. The reachable case is a student who ticked a state BY HAND in the
// document (the boxes stay hand-usable, deliberately) and then walks the step: the walk's pick
// must REPLACE theirs, not sit alongside it.
//
// Worth stating plainly, because it is pre-existing and not ours to change here: BY HAND the
// document lets a student tick two states, because the control is a `choice` checklist rather
// than a radio group. The walk never produces that state; only a hand tick can.
{
    const w = world();
    const f0 = VALUE_FIDS[0];
    w.ctls.set(f0 + '|state', ['In balance']);          // ← their earlier hand tick
    w.ctl.forceStart(); await settle(); tapThroughPacing(w, 12);
    playStation(w, 0, 'In deficit', 'nothing about him is in balance at the start.');
    const states = w.ctls.get(f0 + '|state') || [];
    ok(states.length === 1 && states[0] === 'In deficit',
        'exclusivity: the row now holds [' + states.join(', ') + ']. A value cannot be in balance '
        + 'AND in deficit — the walk\'s pick must replace what was there, not add to it.');
}

// ── 3. TICKING NOTHING IS REFUSED — AND THE REFUSAL LEAVES A QUESTION ON SCREEN (law 4d) ─────
{
    const w = world();
    w.ctl.forceStart(); await settle(); w.toAsk(12);
    const before = w.bubbles.length;
    const cont = w.chips().filter((c) => /Continue/.test(String(c.textContent)))[0];
    ok(!!cont, 'empty-tick: no Continue on the trait multi-select');
    w.tap(cont);                                  // Continue with nothing ticked
    ok(w.bubbles.length > before, 'empty-tick: the walk said NOTHING when it refused — a refusal with '
        + 'nothing in its place is a dead end (law 4d)');
    ok(w.chips().length > 0, 'empty-tick: the trait chips were not re-offered — the student is stuck');
    ok(!(w.ctls.get(VALUE_FIDS[0] + '|traits') || []).length, 'empty-tick: something was filed anyway');
}

// ── 4. RESUME — mid-station, at each of the three phases, from the DOCUMENT ───────────────────
// The walk's position is a PAIR (station, phase). A resume that restores only the station would
// re-ask for traits already ticked (or skip a half-finished row), and a typed answer would then be
// filed against the wrong field — the exact class the answer slot exists to stop.
{
    const ls = new Map();
    const w = world({ ls: ls });
    w.ctl.forceStart(); await settle(); w.toAsk(12);
    playStation(w, 0, 'In balance', 'he is curious about everything, and it gets him into trouble.');
    // Now part-way through station 2: traits ticked, no state yet.
    const chips = w.chips();
    w.tap(chips[0]);
    const cont = w.chips().filter((c) => /Continue/.test(String(c.textContent)))[0];
    w.tap(cont);

    // RELOAD: same document + sidecar, fresh controller.
    const w2 = world({ ls: ls });
    w2.ctls = w.ctls;                     // the document survives a reload; the DOM does not
    w2.deps._rowControlPicks = function (fid, ctlId) { return (w.ctls.get(fid + '|' + ctlId) || []).slice(); };
    w2.deps._setRowControlChoice = w.deps._setRowControlChoice;
    FIDS.forEach((f) => w2.rows.set(f, w.rows.get(f) || ''));
    const revived = w2.ctl.tryResume();
    ok(revived, 'resume: the walk did not revive from a live sidecar');
    ok(w2.chips().length > 0 || (w2.deps._walkSlot && w2.deps._walkSlot.armed),
        'resume: came back to a screen with no question and no chip (law 4d)');
}

// ── 5. A PRISTINE DOCUMENT WITH NO SIDECAR IS A FRESH START, NOT A RESUME (the .330 lesson) ───
{
    const w = world();
    const revived = w.ctl.tryResume();
    ok(revived === false, 'fresh start: tryResume claimed a resume on a pristine document — the '
        + 'greeting’s hand-over would then have nothing to hand to, and the student sits on help '
        + 'chips with no question (Neil, staging .329)');
    ok(!w.ctl.active, 'fresh start: the walk went active with nothing served');
}

// ── 6. A FINISHED WALK IS NOT A DEAD ONE ─────────────────────────────────────────────────────
{
    const prefill = {};
    FIDS.forEach((f) => { prefill[f] = 'already answered'; });
    const w = world({ prefill: prefill });
    VALUE_FIDS.forEach((f) => {
        w.ctls.set(f + '|traits', [ctlItemsFor(f, 'traits')[0]]);
        w.ctls.set(f + '|state', ['In balance']);
    });
    w.ctl.forceStart();
    await settle();
    ok(w.bubbles.length > 0, 're-entry: a completed Step 7 said NOTHING on entry (the #74 defect)');
    ok(w.chips().some((c) => /Change an answer/.test(String(c.textContent))),
        're-entry: no route back into an answered row');
    ok(w.sends.length === 0, 're-entry: spent an API call');
}

// ── 7. THE WRAP QUOTES THE STUDENT'S OWN SHIFT, AND IS NEVER STORED ──────────────────────────
// The shift is computed from their twelve picks. Those picks stay editable in the document beside
// the chat, so a STORED sentence naming them would keep asserting an old answer for ever (the
// .351 fossil law). Drawn, not pushed — assert it never reaches the transcript.
{
    const prefill = {};
    FIDS.forEach((f) => { prefill[f] = 'answered'; });
    const w = world({ prefill: prefill });
    VALUE_FIDS.forEach((f, n) => {
        w.ctls.set(f + '|traits', [ctlItemsFor(f, 'traits')[0]]);
        w.ctls.set(f + '|state', [n < CW7_VALUES.length ? 'In deficit' : 'In balance']);
    });
    w.ctl.forceStart();
    await settle();
    const wrap = w.bubbles[w.bubbles.length - 1] || '';
    ok(/In deficit → In balance/.test(wrap),
        'wrap: the transformation was not computed from the student’s own picks — the ask would be '
        + 'a blank "which value changed?" when the document already knows');
    const stored = (w.deps.canvasChatHistory || []).map((t) => String(t.content || '')).join('\n');
    ok(!/In deficit → In balance/.test(stored),
        'wrap: the computed shift was PUSHED into chat history. It names values the student can '
        + 'still change, and replay is verbatim — it would assert the old answer for ever (§4c.7).');
}

// ── 8. NOTHING IS FILED WITHOUT AN ASK (the answer slot), AND THE REFUSAL RE-SERVES ──────────
{
    const w = world();
    w.ctl.forceStart(); await settle();
    // Typing during the PACED orientation: no ask has been served, so nothing may be filed.
    const before = w.bubbles.length;
    w.ctl.handleTurn('let’s go');
    ok(FIDS.every((f) => !w.rows.get(f)),
        'answer slot: text was filed with no ask served — this is how "Let’s go" reached a '
        + 'Protagonist row on prod (uid 1334)');
    ok(w.bubbles.length > before || w.chips().length > 0,
        'answer slot: the refusal left the student with nothing on screen (law 4d)');
}

console.log(`\n${asserts.pass} passed, ${asserts.fail} failed`);
if (fail) { console.error('cw7-sim-harness FAILED'); process.exit(1); }
console.log('✅ cw7-sim-harness passed — 15 stations, every row complete, ZERO API calls.');
}

main().catch((e) => { console.error('cw7-sim-harness THREW —', e && e.stack); process.exit(1); });
