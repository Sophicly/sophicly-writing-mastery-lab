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
// v7.20.421: lifted, never re-typed — a second copy of "Not explored" would let the walk and the
// document disagree about the one answer that means "this trait is not in the story".
const CW7_NOT_EXPLORED = (SRC.match(/const CW7_NOT_EXPLORED = '([^']+)'/) || [])[1];
if (!CW7_NOT_EXPLORED) { console.error('❌ CW7_NOT_EXPLORED not found — this harness would go blind'); process.exit(1); }
const CW7_TRAIT_CHOICES = CW7_STATES.concat([CW7_NOT_EXPLORED]);
// Every id producer the walk uses, sliced from the shipped source (§5d: one producer, both sides).
function fnFrom(name) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i < 0) { console.error('❌ ' + name + ' not found — the ONE id producer is gone'); process.exit(1); }
    // eslint-disable-next-line no-new-func
    return new Function('return ' + SRC.slice(i, braceSliceFrom(SRC, i, '{', '}').end)
        .replace(/^function\s+\w+/, 'function') + ';')();
}
const _cw7RowFieldId = fnFrom('_cw7RowFieldId');
const _cw7TraitCtlId = fnFrom('_cw7TraitCtlId');
const _cw7TraitLabel = fnFrom('_cw7TraitLabel');
const _cw7AddRowFieldId = fnFrom('_cw7AddRowFieldId');

const ctlIdx = SRC.indexOf('const _cwValuesCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwValuesCtl not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = { src: braceSliceFrom(SRC, ctlIdx, '(', ')').text + '()' };

const FIDS = [];
['begin', 'end'].forEach((w) => CW7_VALUES.forEach((v) => FIDS.push(_cw7RowFieldId(w, v.id))));
['shift', 'align', 'pressure'].forEach((s) => FIDS.push(_cw7RowFieldId('reflect', s)));
const VALUE_FIDS = FIDS.slice(0, CW7_VALUES.length * 2);
const REFLECT_FIDS = FIDS.slice(CW7_VALUES.length * 2);
// v7.20.421 (#249): the build-list rows. Registered with the rig so a write to one is not counted
// as a lost write, but kept OUT of FIDS — they are legitimately empty for most students, so a
// "no row left empty" assertion over them would be false by construction.
const ADD_FIDS = CW7_VALUES.map((v) => _cw7AddRowFieldId(v.id));
const ALL_FIDS = FIDS.concat(ADD_FIDS);

// The value a field id belongs to. Longest-id-first because `wisdom` would otherwise also match
// nothing and `courage`/`humanity` share no prefix — the sort keeps it honest if one ever does.
function valueOf(fid) {
    return CW7_VALUES.filter((x) => fid.indexOf('-' + x.id) !== -1)
        .sort((a, b) => b.id.length - a.id.length)[0] || null;
}
// The real roster for each control, so the rig can refuse a label the document does not carry.
// v7.20.421: EVERY control on a value row is a trait control, and they all offer the same four
// answers. A control id the document does not build returns [] — which makes the rig report the
// walk as ticking a control that does not exist, rather than passing silently.
function ctlItemsFor(fid, ctlId) {
    const v = valueOf(fid);
    if (!v) return [];
    return v.traits.some((t) => _cw7TraitCtlId(t) === ctlId) ? CW7_TRAIT_CHOICES : [];
}
// What condition is this trait sitting at, read the way the walk reads it.
const traitStateIn = (w, fid, trait) => ((w.ctls.get(fid + '|' + _cw7TraitCtlId(trait)) || [])[0] || '');
const isRealState = (s) => CW7_STATES.indexOf(s) !== -1;

function world(opts) {
    opts = opts || {};
    return makeWorld(CTL_SRC, Object.assign({
        task: 'cw_step_7',
        fids: ALL_FIDS,
        ok: ok,                     // enables the rig's automatic liveness check
        ctlItemsFor: ctlItemsFor,
        extraDeps: {
            CW7_VALUES: CW7_VALUES,
            CW7_STATES: CW7_STATES,
            CW7_NOT_EXPLORED: CW7_NOT_EXPLORED,
            CW7_TRAIT_CHOICES: CW7_TRAIT_CHOICES,
            _cw7RowFieldId: _cw7RowFieldId,
            _cw7TraitCtlId: _cw7TraitCtlId,
            _cw7TraitLabel: _cw7TraitLabel,
            _cw7AddRowFieldId: _cw7AddRowFieldId,
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
const chipText = (c) => String(c.textContent).replace(/^✓ /, '');
const chipNamed = (w, label) => w.chips().filter((c) => chipText(c) === label)[0];

// ⭐⭐ v7.20.421 (#247) — ONE BUBBLE PER TAP, ASSERTED. This is the assertion the previous gate
// did not have, and its absence is exactly why Neil received two messages at once on .420: the
// suite proved the paced run REACHED the ask, never that only ONE bubble landed per Continue.
// It is pure counting, so it cannot rot into a style note.
function tapThroughPacing(w, limit) {
    for (let g = 0; g < (limit || 12); g++) {
        const chips = w.chips();
        if (chips.length !== 1 || !isNav(chips[0])) return true;
        const before = w.bubbles.length;
        w.tap(chips[0]);
        const landed = w.bubbles.length - before;
        ok(landed === 1, 'PACING: ' + landed + ' bubbles landed on one Continue tap — a code-served '
            + 'run must emit exactly ONE and gate the next behind a chip (law 4b). This is #247: '
            + '"I received them both at the same time, rather than step by step."');
    }
    return false;
}

// ── DRIVING A SERIAL STATION (v7.20.421) ──────────────────────────────────────────────────────
// A station is now: [value frame → Continue] → per trait { Yes/No/Not-yet → condition → why }.
// `plan` maps trait index → what the student does with it: a CW7_STATES label means "Yes, and it
// is that", 'No' means not in the story, 'Want' means not yet but I want it.
function playTrait(w, decision, text) {
    tapThroughPacing(w);
    const chips = w.chips();
    if (!chips.length) return false;
    // The END pass asks a carried trait for its condition DIRECTLY — no Yes/No in front of it.
    const askingCondition = chips.some(isState) && !chipNamed(w, 'Yes');
    if (decision === 'No' || decision === 'Want') {
        const label = decision === 'No' ? 'No' : 'Not yet — but I want it';
        const chip = chipNamed(w, label);
        if (!chip) return false;
        w.tap(chip);
        if (decision === 'No') return true;                 // no explanation owed
        w.say(text || 'she has never once been asked to.');  // Want ⇒ In deficit ⇒ owes a why
        return true;
    }
    if (!askingCondition) {
        const yes = chipNamed(w, 'Yes');
        if (!yes) return false;
        w.tap(yes);
    }
    const st = chipNamed(w, decision);
    if (!st) return false;
    w.tap(st);
    w.say(text || 'she says nothing in the head teacher’s office.');
    return true;
}
// Drive a whole value station: one decision per trait, in document order.
function playStation(w, plan, text) {
    const v = plan.value || null;
    const n = (v ? v.traits.length : (plan.count || 5));
    for (let k = 0; k < n; k++) {
        if (!playTrait(w, plan.decisions[k] || 'No', text)) return false;
    }
    return true;
}
// The simplest honest station: first trait in deficit, the rest not in the story.
function playSimpleStation(w, v, text) {
    const decisions = v.traits.map((_t, k) => (k === 0 ? 'In deficit' : 'No'));
    return playStation(w, { value: v, decisions: decisions }, text);
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
    ok(!!chipNamed(w, 'Yes'), 'full run: the first station did not open on its per-trait Yes/No ask');

    /* ⭐⭐ v7.20.434 (#274) — A HELP TAP MUST NOT COST THE STUDENT THE ASK.
       Neil, on .433: "if I click more examples, I lose the Yes / No / Not yet quick action
       buttons." The whole CW7 suite was green while that shipped, because `world.chips()` filters
       help buttons out and there was no way to press one — the branch was unreachable to the rig,
       not merely untested. `world.helpChips()` (v7.20.434) is what makes this assertable at all.
       ⭐ VERIFIED BY INJECTION, not by going green: with `reArmLiveAsk()` removed from serveMore
       this block fails on the first assertion. A check that passes both before and after the fix
       is testing its own memory (`feedback_a_check_that_duplicates_its_subject_is_not_a_check`). */
    {
        const before = w.chips().map(chipText).sort().join('|');
        const more = w.helpChipNamed(/More examples/i);
        ok(!!more, 'the trait ask offers no "More examples" rung — rung 1 of the help ladder (§4c.9) is missing');
        const bubblesBefore = w.bubbles.length;
        more.click();
        ok(w.bubbles.length > bubblesBefore, '"More examples" served nothing — a free rung that does nothing is worse than an absent one');
        const after = w.chips().map(chipText).sort().join('|');
        ok(after === before,
            'HELP ATE THE ASK: the answer chips were "' + before + '" before the "More examples" tap and "'
            + after + '" after it. §4d — the student must always have a question on screen or a chip to press, '
            + 'and a FREE help rung must never cost them the ask it was offered beside.');
        // ONE live answer bar, never two. The re-arm sweeps the stale one; without that sweep the
        // old bar survives (each chip's handler removes only its OWN bar) and would sit there live
        // after the question had already been answered.
        const liveBars = w.bubbles.length ? w.chips().length : 0;
        ok(liveBars === before.split('|').length,
            'after the help tap there are ' + liveBars + ' answer chips for a ' + before.split('|').length
            + '-option question — a stale bar was left mounted, so one question now has two live answer bars');
        // #274b — the examples must not repeat what the ask already showed.
        const askText = String(w.bubbles[bubblesBefore - 1] || '');
        const moreText = String(w.bubbles[w.bubbles.length - 1] || '');
        const exampleLine = (askText.match(/Example — (.+)/) || [])[1];
        if (exampleLine) {
            ok(moreText.indexOf(exampleLine.trim()) === -1,
                'REPEATED EXAMPLE: "More examples" re-served the exact line the ask already showed ('
                + exampleLine.trim().slice(0, 60) + '…). Neil: "the examples are repeating."');
        }
        // Spent bank ⇒ the chip retires rather than repeating itself.
        ok(!w.helpChipNamed(/More examples/i),
            'the "More examples" chip is still offered after its bank is spent — tapping it again '
            + 'repeats a bubble the student is already looking at, which is what he reported.');
    }

    let guard = 0;
    while (guard++ < 400 && w.ctl.active) {
        const before = w.bubbles.length;
        const chips = w.chips();
        if (chips.some((c) => /Change an answer/.test(String(c.textContent)))) break;   // the wrap
        if (chips.length) {
            const state = chips.filter(isState)[0];
            if (state) { w.tap(state); continue; }
            const yes = chipNamed(w, 'Yes');
            if (yes) { w.tap(yes); continue; }
            const cont = chips.filter(isNav)[0];
            if (cont) { w.tap(cont); continue; }
            w.tap(chips[0]);                                 // the rescue picker
            continue;
        }
        if (w.deps._walkSlot && w.deps._walkSlot.armed) {
            w.say('answer ' + guard + ' — she says nothing in the head teacher’s office.');
            continue;
        }
        if (w.bubbles.length === before && !w.chips().length) break;       // stalled
    }

    const emptyRows = FIDS.filter((f) => !w.rows.get(f));
    ok(emptyRows.length === 0, 'full run: rows STILL EMPTY at the end — ' + emptyRows.join(', '));
    // ⭐ v7.20.421 — EVERY TRAIT DECIDED, not just "the row has something on it". A serial walk
    // that silently skipped a trait would still leave the row complete, and the student would
    // never know they were not asked.
    const undecided = [];
    VALUE_FIDS.forEach((f) => {
        const v = valueOf(f);
        v.traits.forEach((t) => { if (!traitStateIn(w, f, t)) undecided.push(f + ' / ' + t); });
    });
    ok(undecided.length === 0, 'full run: ' + undecided.length + ' trait(s) were never asked about — '
        + undecided.slice(0, 4).join(', ') + '. Serial means EVERY item gets its own decision (§4c.8b).');
    // At least one REAL condition per value, or the row can never complete (#232 / requireAny).
    const noRealState = VALUE_FIDS.filter((f) => {
        const v = valueOf(f);
        return !v.traits.some((t) => isRealState(traitStateIn(w, f, t)));
    });
    ok(noRealState.length === 0, 'full run: ' + noRealState.length + ' value row(s) hold no real '
        + 'condition — requireAny would never be satisfied and the section could never tick green');
    const twoStates = [];
    VALUE_FIDS.forEach((f) => {
        const v = valueOf(f);
        v.traits.forEach((t) => {
            if ((w.ctls.get(f + '|' + _cw7TraitCtlId(t)) || []).length > 1) twoStates.push(f + ' / ' + t);
        });
    });
    ok(twoStates.length === 0, 'full run: a TRAIT holds two conditions at once (' + twoStates.join(', ')
        + ') — the condition pick must be exclusive; a trait cannot be in balance and in deficit');
    // ⭐ THE EXPLANATIONS ACCUMULATE, one labelled line per conditioned trait — Neil: *"we just
    // keep appending all the explanations into the section."* An `accumulate` cycle that had been
    // stamped `rewrite` would leave exactly ONE line here, and every earlier trait would be gone.
    const missingWhy = [];
    VALUE_FIDS.forEach((f) => {
        const v = valueOf(f);
        const text = w.rows.get(f) || '';
        v.traits.forEach((t) => {
            if (!isRealState(traitStateIn(w, f, t))) return;
            if (text.indexOf(_cw7TraitLabel(t) + ' — ') === -1) missingWhy.push(f + ' / ' + t);
        });
    });
    ok(missingWhy.length === 0, 'full run: ' + missingWhy.length + ' conditioned trait(s) lost their '
        + 'explanation from the row — ' + missingWhy.slice(0, 4).join(', ') + '. A `rewrite` cycle '
        + 'here would keep only the last one (§4c.6).');
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

// ── 2. ⭐⭐ THE COMPLEX CHARACTER — the whole reason for #245 ─────────────────────────────────
// Neil, on his own protagonist: creativity IN EXCESS, open-mindedness IN DEFICIT, love of learning
// IN DEFICIT — three different conditions inside ONE value. Under the shipped row that was
// unsayable, and this is the assertion that keeps it sayable.
{
    const w = world();
    w.ctl.forceStart(); await settle(); tapThroughPacing(w, 12);
    const wisdom = CW7_VALUES[0];
    const f0 = _cw7RowFieldId('begin', wisdom.id);
    ok(wisdom.traits.join('|') === 'creativity|curiosity|open-mindedness|love of learning',
        'the Wisdom traits are not the ones this test names — re-read it before trusting the result');
    ok(playStation(w, { value: wisdom, decisions: ['In excess', 'No', 'In deficit', 'In deficit'] }),
        'complex character: the serial station did not run to the end of its traits');
    ok(traitStateIn(w, f0, 'creativity') === 'In excess', 'complex character: creativity is not in excess');
    ok(traitStateIn(w, f0, 'open-mindedness') === 'In deficit', 'complex character: open-mindedness is not in deficit');
    ok(traitStateIn(w, f0, 'love of learning') === 'In deficit', 'complex character: love of learning is not in deficit');
    ok(traitStateIn(w, f0, 'curiosity') === CW7_NOT_EXPLORED,
        'complex character: a "No" left no footprint — the walk would re-ask that trait on every reload');
    const text = w.rows.get(f0) || '';
    ['Creativity', 'Open-mindedness', 'Love of learning'].forEach((label) => {
        ok(text.indexOf(label + ' — ') !== -1,
            'complex character: the row lost the ' + label + ' explanation — the explanations must ACCUMULATE');
    });
    ok(text.indexOf('Curiosity — ') === -1,
        'complex character: a trait answered "No" was given an explanation it was never asked for');
}

// ── 2b. THE CONDITION PICK REPLACES ONE ALREADY IN THE DOCUMENT ──────────────────────────────
// ⚠️ THIS TEST EXISTS BECAUSE THE OBVIOUS ONE WAS VACUOUS. A run only ever picks a condition
// once per trait, so it passes identically with and without `exclusive` — proved by injecting the
// defect and watching nothing fail. The reachable case is a student who ticked a condition BY HAND
// in the document (the boxes stay hand-usable, deliberately) and then walks the step: the walk's
// pick must REPLACE theirs, not sit alongside it.
{
    const w = world();
    const wisdom = CW7_VALUES[0];
    const f0 = _cw7RowFieldId('begin', wisdom.id);
    w.ctls.set(f0 + '|' + _cw7TraitCtlId('creativity'), ['In balance']);   // ← their earlier hand tick
    w.rows.set(f0, 'Creativity — In balance: she makes things constantly.');  // …and its explanation
    w.ctl.forceStart(); await settle(); tapThroughPacing(w, 12);
    // The document already answers creativity, so the walk opens on the NEXT trait — which is
    // itself the point of deriving position from the document. Answer curiosity, then check that
    // nothing doubled up on creativity.
    playTrait(w, 'In deficit', 'she never asks a second question.');
    const picks = w.ctls.get(f0 + '|' + _cw7TraitCtlId('creativity')) || [];
    ok(picks.length === 1,
        'exclusivity: creativity now holds [' + picks.join(', ') + '] — a trait cannot be in two conditions at once');
    ok(traitStateIn(w, f0, 'curiosity') === 'In deficit',
        'derivation: the walk did not resume on the first UNANSWERED trait — it must read the document, not a counter');
}

// ── 3. A VALUE WITH NO TRAITS AT ALL IS REFUSED — WITH A WAY THROUGH (law 4d) ────────────────
// Neil: *"if you don't have it, then you need to implement it. So choose one that you think suits
// your character."* Answering "No" to every trait leaves a row that can NEVER complete, so the
// walk must not simply move on — it must say so and offer the build-list route.
{
    const w = world();
    w.ctl.forceStart(); await settle(); tapThroughPacing(w, 12);
    const wisdom = CW7_VALUES[0];
    const f0 = _cw7RowFieldId('begin', wisdom.id);
    wisdom.traits.forEach(() => playTrait(w, 'No'));
    ok(w.chips().length > 0, 'all-No: the student was left with no chip at all after refusing every trait (law 4d)');
    const rescue = w.bubbles.join('\n\n');
    ok(/none/i.test(rescue) && /gain/i.test(rescue),
        'all-No: the walk moved on silently from a value that can never complete — it must say why and offer a way through');
    // Take the way through and check it actually resolves the row.
    const pick = w.chips()[0];
    w.tap(pick);
    w.say('she has never been shown that being wrong is survivable.');
    ok(wisdom.traits.some((t) => isRealState(traitStateIn(w, f0, t))),
        'all-No: the rescue did not give the row a real condition — it would still never complete');
    ok(!!(w.rows.get(_cw7AddRowFieldId(wisdom.id)) || '').trim(),
        'all-No: the rescued trait never reached the build list — the next lesson would have nothing to work from (#249)');
}

// ── 3b. "NOT YET — BUT I WANT IT" WRITES BOTH PLACES (#249) ──────────────────────────────────
// It is In deficit (absent in a way that MATTERS, so the row is answerable) AND on the build list
// (which is what the next lesson reads). Either write alone is a silent half-feature.
{
    const w = world();
    w.ctl.forceStart(); await settle(); tapThroughPacing(w, 12);
    const wisdom = CW7_VALUES[0];
    const f0 = _cw7RowFieldId('begin', wisdom.id);
    playTrait(w, 'Want', 'she refuses to hear anyone out, and it costs her Marcus.');
    ok(traitStateIn(w, f0, 'creativity') === 'In deficit',
        '"want": the trait was not marked In deficit — the row would be unanswerable on a value they only WANT');
    const list = w.rows.get(_cw7AddRowFieldId(wisdom.id)) || '';
    ok(list.indexOf('Creativity — ') !== -1,
        '"want": the trait never reached the build list, so the next lesson has nothing to place in the plot (#249)');
    ok((w.rows.get(f0) || '').indexOf('Creativity — ') !== -1,
        '"want": no explanation was banked for a wanted trait — it is In deficit, so it owes a why like any other');
}

// ── 4. RESUME — mid-station, at each of the three phases, from the DOCUMENT ───────────────────
// The walk's position is a PAIR (station, phase). A resume that restores only the station would
// re-ask for traits already ticked (or skip a half-finished row), and a typed answer would then be
// filed against the wrong field — the exact class the answer slot exists to stop.
{
    const ls = new Map();
    const w = world({ ls: ls });
    w.ctl.forceStart(); await settle(); tapThroughPacing(w, 12);
    playSimpleStation(w, CW7_VALUES[0], 'he is curious about everything, and it gets him into trouble.');
    // Now part-way through the SECOND value: one trait conditioned, its explanation not yet written.
    tapThroughPacing(w, 12);
    const yes = chipNamed(w, 'Yes');
    if (yes) { w.tap(yes); const st = chipNamed(w, 'In excess'); if (st) w.tap(st); }

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
        const v = valueOf(f);
        v.traits.forEach((t, k) => w.ctls.set(f + '|' + _cw7TraitCtlId(t), [k === 0 ? 'In balance' : CW7_NOT_EXPLORED]));
        w.rows.set(f, _cw7TraitLabel(v.traits[0]) + ' — In balance: ' + (w.rows.get(f) || 'answered'));
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
    // Beginning: the first trait in deficit. End: the same trait in balance. That ONE trait moving
    // is the transformation the wrap has to be able to state back to them — per TRAIT since #245,
    // because a value can move in two directions at once and a value-level summary would hide one.
    VALUE_FIDS.forEach((f, n) => {
        const v = valueOf(f);
        v.traits.forEach((t, k) => w.ctls.set(f + '|' + _cw7TraitCtlId(t),
            [k === 0 ? (n < CW7_VALUES.length ? 'In deficit' : 'In balance') : CW7_NOT_EXPLORED]));
        // The row must carry the labelled explanation, or the walk correctly reports the station
        // unfinished and never reaches its wrap.
        w.rows.set(f, _cw7TraitLabel(v.traits[0]) + ' — answered');
    });
    w.ctl.forceStart();
    await settle();
    const wrap = w.bubbles[w.bubbles.length - 1] || '';
    ok(/in deficit → in balance/i.test(wrap),
        'wrap: the transformation was not computed from the student’s own picks — the ask would be '
        + 'a blank "which value changed?" when the document already knows');
    const stored = (w.deps.canvasChatHistory || []).map((t) => String(t.content || '')).join('\n');
    ok(!/in deficit → in balance/i.test(stored),
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

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ⭐⭐ 9. WHAT THE STUDENT ACTUALLY READS (v7.20.420 — added AFTER Neil found both defects)
// ──────────────────────────────────────────────────────────────────────────────────────────────
// THE HONEST REASON THIS SECTION EXISTS. Neil, having tested .419: *"why are we allowing, once
// again, duplicate messages to go through? Have we not got a harness in place? And why have we
// also allowed a walk with a subpar user experience to go through?"*
//
// Because every assertion above this line is a NEGATIVE — nothing is filed without an ask, no row
// is left empty, no API call is spent, no state is double-ticked. **A suite made entirely of "X
// must not happen" passes perfectly on a walk that never says the right thing** (the law is
// already written down as `feedback_negative_only_tests_pass_on_a_dead_screen`; this is the same
// failure wearing a UX costume). The rig HAD the full transcript the whole time — 146 assertions
// ran over it and not one of them READ it.
//
// So these assert what is on the screen. They are still mechanical: presence of a framing the step
// cannot work without, and a text-repeat check that is pure counting.
{
    const w = world();
    w.ctl.forceStart();
    // Drive the paced orientation to its end.
    tapThroughPacing(w, 20);
    const orientation = w.bubbles.join('\n\n');

    // (a) THE ORIENTATION MUST RUN AT ALL. It did not, on staging: Neil's saved transcript went
    //     from the greeting straight into Wisdom and Knowledge, because the orientation hung off
    //     ONE control-flow branch and three entry routes bypassed it.
    ok(/Peterson and Seligman/.test(orientation),
        'the orientation never ran — the walk opened straight on the first value ask (#242)');

    // (b) IT MUST FRAME THE TWO PASSES AND THE DIFFERENCE BETWEEN THEM. That framing IS the step:
    //     without it, "— at the beginning" in a heading is decoration and the student has no idea
    //     a second pass is coming.
    ok(/BEGINNING/i.test(orientation) && /END/i.test(orientation),
        'the orientation never tells the student they will map the values TWICE (beginning and end)');
    ok(/transformation/i.test(orientation),
        'the orientation never says the DIFFERENCE between the two passes is the transformation — '
        + 'which is the entire reason this step exists (Neil, #242)');
    // ⭐ v7.20.421 (#246) — THE JOB IS STATED IN THE FIRST BUBBLE, not four chunks later. Neil
    // formed his impression of .420 from bubble one and it opened on a theme, so this asserts the
    // ORDER, not merely the presence of the framing.
    ok(/Here is what we are going to do/i.test(w.bubbles[0] || ''),
        'the orientation does not open by saying what the lesson will DO — that framing arrived in '
        + 'chunk 4 on .420, by which point Neil had already formed his impression (#246)');
    ok(/trait/i.test(w.bubbles[0] || ''),
        'the FIRST orientation bubble never mentions traits — Neil: "they need to know beforehand '
        + 'that they\'re gonna be talking about this" (#246)');
    ok(/one at a time|one trait at a time/i.test(orientation),
        'the orientation never tells the student the traits come one at a time — the serial shape is '
        + 'the lesson\'s whole rhythm (§4c.8b)');
    ok(/deficit/i.test(orientation),
        'the orientation never explains that "barely has it" is a deficit, not a blank (#237)');
    // The three-answer contract, including the build-list route (#249) — a student who does not
    // know that third chip exists simply answers No and the next lesson gets nothing.
    ok(/Not yet/i.test(orientation) && /next lesson/i.test(orientation),
        'the orientation never explains the "Not yet — but I want it" answer or where it leads (#249)');

    // (b2) ⭐ AND IT MUST RUN ON EVERY ENTRY ROUTE, NOT JUST THE HAPPY ONE.
    //      This is the assertion that actually catches the staging defect. Four routes reach the
    //      first station — @CW7_START, the fail-loud fallback, tryResume's reattach, and the
    //      send-path revive — and on staging the orientation ran on the first and was skipped by
    //      the others. Driving only forceStart() proved nothing: with the derived predicate
    //      deliberately disabled, this suite still passed, because startWalk carried its own
    //      second copy of the condition. So the RESUME route is driven explicitly here.
    {
        const ls = new Map();
        ls.set('sim_cw7', JSON.stringify({ i: 0, phase: 'traits', active: true, done: false }));
        const wr = world({ ls: ls });
        const revived = wr.ctl.tryResume();
        ok(revived, 'resume-at-station-0: the walk did not revive from its sidecar');
        // Tap through the paced run — the orientation is chunked (law 4b), so asserting before
        // tapping would test only its first bubble. (This test was wrong first: it asserted a
        // phrase from a later chunk and reported a defect that did not exist.)
        tapThroughPacing(wr, 20);
        const text = wr.bubbles.join('\n\n');
        ok(/Peterson and Seligman/.test(text),
            'a student who RESUMES at station 0 is never oriented — they land straight on the first '
            + 'value ask with no idea the step has two passes. This is the exact route that shipped '
            + 'broken in .419 (#242).');
    }

    // (c) THE SECOND PASS IS ANNOUNCED when the walk crosses into it.
    const w2 = world();
    w2.ctl.forceStart(); tapThroughPacing(w2, 20);
    for (let n = 0; n < CW7_VALUES.length; n++) {
        playSimpleStation(w2, CW7_VALUES[n], 'answer for value ' + n);
    }
    const crossing = w2.bubbles.slice(-3).join('\n\n');
    ok(/END/.test(crossing) && /transformation|gap between/i.test(crossing),
        'crossing from the beginning table into the end table says nothing — the same six values '
        + 'are simply asked again with no explanation (#242)');
}

// (d) NO CARD MAY CITE TWO EXAMPLES FROM THE SAME TEXT — Neil, #243: *"giving two examples from
//     one text is not fair on other students who are not doing that text."* Pure counting, run
//     over the REAL content, so it cannot rot into a style note.
{
    // ⭐ v7.20.422 (#251) — THE ROSTER IS THE REAL CATALOGUE, not a hand-typed list. Every text an
    // example may cite must be one the course actually teaches, so a plausible-sounding example
    // from a text no Sophicly student studies fails here rather than reaching a student.
    const CORE_JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
    const catIdx = CORE_JS.indexOf('const TEXT_CATALOGUE');
    const CATALOGUE = catIdx >= 0
        ? Array.from(new Set([...CORE_JS.slice(catIdx, catIdx + 9000)
            .matchAll(/label: (?:'([^']+)'|"([^"]+)"), icon/g)].map((m) => m[1] || m[2])))
        : [];
    ok(CATALOGUE.length > 20, 'could not read TEXT_CATALOGUE out of wml-core.js — the text roster check has gone blind');
    const TEXTS = ['An Inspector Calls', 'Frankenstein', 'Macbeth', 'A Christmas Carol',
        'Of Mice and Men', 'Animal Farm', 'Blood Brothers', 'Much Ado About Nothing',
        'Romeo and Juliet', 'Jekyll and Hyde', 'The Curious Incident of the Dog in the Night-Time',
        'Pride and Prejudice', 'Twelfth Night', 'Jane Eyre', 'The Tempest',
        'To Kill a Mockingbird', "Journey's End", 'The Old Man and the Sea',
        'Great Expectations', 'Lord of the Flies', 'Julius Caesar', 'My Name Is Leon',
        'Never Let Me Go', 'Othello', 'Henry V', 'The Merchant of Venice',
        'The Sign of the Four', 'Pigeon English', 'Anita and Me', 'DNA'];
    // Every text this gate knows about must exist in the catalogue (allowing for the catalogue's
    // own shorthand — "Jekyll & Hyde" vs the prose form used in an example sentence).
    const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
    const catNorm = CATALOGUE.map(norm);
    TEXTS.forEach((t) => {
        const n = norm(t);
        ok(catNorm.some((c) => c === n || n.indexOf(c) === 0 || c.indexOf(n) === 0
            || n.replace('and', '') === c.replace('and', '')),
            `"${t}" is cited by a Step-7 example but is not in TEXT_CATALOGUE — we would be teaching from a text no Sophicly student studies (§5c)`);
    });
    // Characters resolve to their text, because that is how the examples actually name them.
    const WHO = {
        'Sheila Birling': 'An Inspector Calls', 'Mr Birling': 'An Inspector Calls',
        'Inspector Goole': 'An Inspector Calls', 'Birlings': 'An Inspector Calls',
        'Victor': 'Frankenstein', 'Scrooge': 'A Christmas Carol', 'Bob Cratchit': 'A Christmas Carol',
        'George': 'Of Mice and Men', 'Lennie': 'Of Mice and Men',
        'Mrs Johnstone': 'Blood Brothers', 'Mrs Lyons': 'Blood Brothers', 'Mickey': 'Blood Brothers',
        'Romeo': 'Romeo and Juliet', 'Juliet': 'Romeo and Juliet', 'Mercutio': 'Romeo and Juliet',
        'Friar Lawrence': 'Romeo and Juliet', 'The Prince': 'Romeo and Juliet',
        'Hero': 'Much Ado About Nothing', 'Beatrice': 'Much Ado About Nothing',
        'Benedick': 'Much Ado About Nothing', 'Claudio': 'Much Ado About Nothing',
        'Macbeth': 'Macbeth', 'Macduff': 'Macbeth',
        'Holmes': 'The Sign of the Four', 'Christopher': 'The Curious Incident of the Dog in the Night-Time',
        'Jekyll': 'Jekyll and Hyde', 'Malvolio': 'Twelfth Night', 'Sir Toby': 'Twelfth Night',
        'Darcy': 'Pride and Prejudice', 'Mr Collins': 'Pride and Prejudice',
        'Jane': 'Jane Eyre', 'Mrs Reed': 'Jane Eyre', 'Helen Burns': 'Jane Eyre',
        'Prospero': 'The Tempest', 'Atticus': 'To Kill a Mockingbird',
        'Hibbert': "Journey's End", 'Stanhope': "Journey's End",
        'Santiago': 'The Old Man and the Sea',
        'Miss Havisham': 'Great Expectations', 'Joe Gargery': 'Great Expectations', 'Pip': 'Great Expectations',
        'Ralph': 'Lord of the Flies', 'Brutus': 'Julius Caesar', 'Cinna': 'Julius Caesar',
        'Squealer': 'Animal Farm', 'Eva Smith': 'An Inspector Calls',
        'Leon': 'My Name Is Leon', 'Kathy': 'Never Let Me Go',
        'Iago': 'Othello', 'Othello': 'Othello', 'Desdemona': 'Othello',
        'Henry': 'Henry V', 'Shylock': 'The Merchant of Venice',
        'Harri': 'Pigeon English', 'Meena': 'Anita and Me',
    };
    // Resolve every text a line cites — by title, or by a character the roster knows.
    const textsIn = (line) => {
        const s = String(line || '');
        const hits = new Set();
        TEXTS.forEach((t) => { if (s.indexOf(t) !== -1) hits.add(t); });
        Object.keys(WHO).forEach((who) => { if (new RegExp('\\b' + who + '\\b').test(s)) hits.add(WHO[who]); });
        return Array.from(hits);
    };
    const evalBlock = (decl) => {
        const idx = SRC.indexOf(decl);
        if (idx < 0) return null;
        // eslint-disable-next-line no-eval
        return eval('(' + braceSliceFrom(SRC, idx, '{', '}').text + ')');
    };
    const TEACH = evalBlock('const TEACH = {');
    ok(!!TEACH, 'the Step-7 TEACH content block was not found — this check has gone blind');

    // ⭐⭐ v7.20.422 (#251) — THE PER-TRAIT CARDS. Neil, on .421: *"how much CREATIVITY do they
    // have? In balance: Sheila ends An Inspector Calls willing to question what she is told —
    // that's not really to do with creativity, is it?"* The examples were keyed by VALUE and the
    // walk asks by TRAIT, so a card written for open-mindedness was served as the model for
    // creativity. These assertions are what make that unshippable.
    const TRAIT_TEACH = evalBlock('const TRAIT_TEACH = {');
    if (ok(!!TRAIT_TEACH, 'the Step-7 TRAIT_TEACH block was not found — the per-trait examples check has gone blind')) {
        const seen = new Map();
        const allTraits = [];
        CW7_VALUES.forEach((v) => v.traits.forEach((t) => allTraits.push(t)));
        // (a) EVERY trait the walk can ask about has its own card. A missing one is a trait asked
        //     with no example at all, which is rung 0 of the help ladder simply absent (§4c.9).
        allTraits.forEach((t) => {
            ok(!!TRAIT_TEACH[t], `the trait "${t}" has no card in TRAIT_TEACH — it would be asked with no definition and no example`);
        });
        ok(Object.keys(TRAIT_TEACH).length === allTraits.length,
            `TRAIT_TEACH has ${Object.keys(TRAIT_TEACH).length} cards for ${allTraits.length} traits — a card for a trait that does not exist is dead content`);
        // (b) each card defines its trait and gives three examples from THREE DIFFERENT texts.
        Object.keys(TRAIT_TEACH).forEach((t) => {
            const card = TRAIT_TEACH[t];
            ok(!!String(card.what || '').trim(),
                `the ${t} card has no one-line definition — the student is asked to judge a word nobody defined (§4c.1)`);
            const perState = ['balance', 'excess', 'deficit'].map((k) => textsIn(card[k]));
            perState.forEach((hits, k) => {
                ok(hits.length >= 1,
                    `the ${t} card's ${['balance', 'excess', 'deficit'][k]} example names no text this course teaches — either it is invented or the roster is missing one (§5c)`);
            });
            const flat = perState.flat();
            const dupes = flat.filter((x, n) => flat.indexOf(x) !== n);
            ok(dupes.length === 0,
                `the ${t} card cites ${dupes.join(', ')} more than once — three examples must come from THREE DIFFERENT texts, or a student not studying that one gets nothing (#243)`);
            flat.forEach((x) => seen.set(x, (seen.get(x) || 0) + 1));
        });
        // (c) ⭐ CONCENTRATION, across the whole set — the half of #243 that a per-card check
        //     cannot see. Neil: *"don't just reuse An Inspector Calls all the time… we need to
        //     make sure we've got lots of different examples."* Sixty-nine examples could all sit
        //     on six texts and pass every per-card check above.
        const CAP = 5;
        Array.from(seen.entries()).forEach(([text, n]) => {
            ok(n <= CAP, `${text} is cited ${n} times across the Step-7 trait examples (cap ${CAP}) — `
                + 'a student not studying it gets nothing, and a student studying it gets the same book every time');
        });
        ok(seen.size >= 20, `the trait examples span only ${seen.size} texts — Neil asked for "lots of different examples"`);
        const total = Array.from(seen.values()).reduce((a, b) => a + b, 0);
        console.log(`   per-trait examples: ${Object.keys(TRAIT_TEACH).length} traits · ${total} text citations · ${seen.size} different texts · busiest ${Math.max(...seen.values())}`);
    }

    const seenAcross = new Set();
    Object.keys(TEACH || {}).forEach((id) => {
        const card = TEACH[id];
        const flat = ['balance', 'excess', 'deficit'].map((k) => textsIn(card[k])).flat();
        flat.forEach((t) => seenAcross.add(t));
        const dupes = flat.filter((t, n) => flat.indexOf(t) !== n);
        ok(dupes.length === 0,
            `the ${id} card cites ${dupes.join(', ')} more than once — three examples must come from `
            + 'THREE DIFFERENT texts, or a student not studying that one gets nothing (#243)');
        ok(flat.length >= 3,
            `the ${id} card resolves only ${flat.length} example(s) to a known text — either a text `
            + 'is missing from the roster above, or an example names no text at all');
    });
    // The spread must actually reach the texts Neil named.
    ['Animal Farm', 'Romeo and Juliet', 'Much Ado About Nothing', 'Blood Brothers'].forEach((t) => {
        ok(seenAcross.has(t), `no Step-7 example comes from ${t}, which Neil named explicitly (#243)`);
    });
    console.log(`   value-frame examples span ${seenAcross.size} different texts across the six values`);
}

console.log(`\n${asserts.pass} passed, ${asserts.fail} failed`);
if (fail) { console.error('cw7-sim-harness FAILED'); process.exit(1); }
console.log('✅ cw7-sim-harness passed — 15 stations, every row complete, ZERO API calls.');
}

main().catch((e) => { console.error('cw7-sim-harness THREW —', e && e.stack); process.exit(1); });
