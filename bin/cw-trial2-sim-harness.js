#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-trial2-sim-harness.js — BEHAVIOURAL gate for Trial 2: Character Depth (v7.20.824, FIXLIST #884-①, CW trials slice 5).
 *
 * Trial 2 is the SAME examiner walk as Trial 1 — `_cwTrialCtlFactory(2)` — on Trial 2's own checks (wml-core.js
 * CW_TRIAL2_ELEMENTS: the Draft 2 `character_arc` lens). bin/cw-trial1-sim-harness.js proves the factory still IS Trial 1;
 * this proves the factory's per-trial half: Trial 2's rows, words, plan source, arithmetic and saved result.
 *
 *  1. The opening pages, teaches the method, names the dimension; the first ask is the first check, verbatim.
 *  2. ⭐ The grade-goal row and the six checks' rows never collide (the `goal` id collision found while building).
 *  3. ⭐ ONE API call for the whole trial; the marking turn carries THEIR character plan as background, the checks'
 *     marker contract, and the right totals (24 or 26, never Trial 1's 28 or 30).
 *  4. Sophia's verdicts land in the document; the mark is /26 for character depth; calibration and summary use 26.
 *  5. ⭐ Every next-draft word says Draft 3, never Trial 1's Draft 2; the target is filed and saved as trial 2.
 *  6. A marking reply missing a verdict files NO mark and leaves a chip (§4d, §11).
 *  7. A reload mid-walk lands on the check in flight (§4c.8b).
 *  Liveness is checked automatically inside every say()/tap() (walk-sim-lib, §4d).
 *
 * Usage: node bin/cw-trial2-sim-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { SRC, braceSliceFrom, makeWorld, settle } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg, got) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg + (got !== undefined ? '   got: ' + JSON.stringify(got).slice(0, 300) : ''));
    return false;
}

// ── the REAL data ───────────────────────────────────────────────────────────────────────────────
const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
const t2Idx = CORE.indexOf('const CW_TRIAL2_ELEMENTS = [');
const accIdx = CORE.indexOf('const CW_TRIAL1_ACCURACY = {');
if (t2Idx < 0 || accIdx < 0) { console.error('❌ CW_TRIAL2_ELEMENTS / CW_TRIAL1_ACCURACY not found in wml-core.js'); process.exit(1); }
// eslint-disable-next-line no-eval
const CHECKS = eval(braceSliceFrom(CORE, t2Idx, '[', ']').text);
// eslint-disable-next-line no-eval
const ACCURACY = eval('(' + braceSliceFrom(CORE, accIdx, '{', '}').text + ')');
const ELEMENTS = CHECKS.concat([ACCURACY]);
const OUT_OF = ELEMENTS.reduce((a, e) => a + (e.outOf || 4), 0);   // 26

const lgIdx = SRC.indexOf('function _ladderGrade(pct)');
// eslint-disable-next-line no-new-func
const LADDER_GRADE = new Function('return ' + SRC.slice(lgIdx, braceSliceFrom(SRC, lgIdx, '{', '}').end) + ';')();
const fIdx = SRC.indexOf('function _cwTrialCtlFactory(N) {');
if (fIdx < 0) { console.error('❌ _cwTrialCtlFactory not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = { src: '(function (N) ' + braceSliceFrom(SRC, fIdx, '{', '}').text + ')(2)' };

const FIDS = ELEMENTS.map((e) => 'cw-trial-2-' + e.id)
    .concat(ELEMENTS.map((e) => 'cw-trial-2-fb-' + e.id))
    .concat(['cw-trial-2-mark', 'cw-trial-2-gap', 'cw-trial-2-strength', 'cw-trial-2-priority', 'cw-trial-2-target', 'cw-trial-2-goal']);
// Their character plan, by the documents the elements name (Step 11's profile, Step 3's logline).
const PLAN = {
    'character_profile|cw-step-10-ext-goal-begin': 'Mara wants to WIN the regional final.',
    'logline|cw-step-3-flaw': 'She never asks for help.',
    'character_profile|cw-step-10-need-begin': 'She needs to trust her team.',
};

let planLoaded = {};
let ladder = null;
let _pickWorld = null;
function world(opts) {
    opts = opts || {};
    planLoaded = {};
    ladder = null;
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_trial_2',
        fids: FIDS,
        ok: ok,
        externalSurface: function () { return !!(ladder && (ladder.levels || []).some((lv) => lv.shown && !lv.verdict)); },
        extraDeps: {
            _ladderGrade: LADDER_GRADE,
            _cwDocValue: function (key, fid) { return (planLoaded[key] && PLAN[key + '|' + fid]) || ''; },
            _cwLoadDocValues: function (pid, key) { return new Promise((res) => setImmediate(() => { planLoaded[key] = true; res({}); })); },
            setTrialLadderModel: function (m) { ladder = m; },
            _swmlScrollToTop: function () {},
        },
    }, opts));
    _pickWorld = w;
    w.saved = [];
    Object.assign(w.deps.WML, {
        cwTrialElements: function (n) { return n === 2 ? ELEMENTS : []; },
        CW_STEPS: [{ step: 14, draft: 2 }, { id: 'trial_2', trial: 2 }, { step: 15 }],
        cwProject: { saveTrial: function (pid, payload, n) { w.saved.push({ payload: payload, n: n }); return Promise.resolve({ success: true }); } },
    });
    return w;
}

const lastBubble = (w) => w.bubbles[w.bubbles.length - 1] || '';
const allText = (w) => w.bubbles.join('\n');
const chipNamed = (w, re) => w.chips().filter((c) => re.test(String(c.textContent)))[0] || null;
const hiddenCtx = (w) => (w.deps.canvasChatHistory || []).filter((t) => t.hidden).map((t) => t.content).join('\n');
const reload = (w) => world({ ls: w.ls, prefill: Object.fromEntries(w.rows) });

async function toFirstAsk(w) {
    for (let i = 0; i < 12; i++) { await settle(); const c = chipNamed(w, /Continue/); if (!c) break; w.tap(c); }
    await settle();
    const g = chipNamed(w, /Grade 8/);
    if (g) { w.tap(g); await settle(); }
}
/** After the reveal: the calibration line, then the paced summary (Continue chips), to the target ask. */
async function toTarget(w) {
    for (let i = 0; i < 12; i++) {
        await settle();
        if (/your one target for Draft 3/i.test(lastBubble(w))) return true;
        const c = chipNamed(w, /Continue/) || w.chips().filter((x) => !/Change my answers|Give me my marks|Try again/.test(String(x.textContent)))[0];
        if (!c) break;
        w.tap(c);
    }
    await settle();
    return /your one target for Draft 3/i.test(lastBubble(w));
}
async function pickLevel(n, verdict) {
    if (!ladder || typeof ladder.onPick !== 'function') return false;
    const lv = (ladder.levels || []).filter((x) => x.n === n)[0];
    if (!lv || !lv.shown || lv.verdict) return false;
    const w = _pickWorld; const before = w ? w.bubbles.length : 0;
    ladder.onPick(n, verdict);
    await settle();
    if (w && w.ctl.active) {
        const live = !!(ladder && (ladder.levels || []).some((x) => x.shown && !x.verdict));
        ok(w.bubbles.length > before || w.chips().length > 0 || live, 'DEAD END after tapping Level ' + n + ' "' + verdict + '"');
    }
    return true;
}
async function score(w, mark, note, opts) {
    let tapped = true;
    if (mark === 0) tapped = await pickLevel(1, 'not');
    else if (mark === 1) tapped = await pickLevel(1, 'some');
    else if (mark === 2) tapped = (await pickLevel(1, 'all')) && (await pickLevel(2, 'not'));
    else if (mark === 3) tapped = (await pickLevel(1, 'all')) && (await pickLevel(2, 'some'));
    else tapped = (await pickLevel(1, 'all')) && (await pickLevel(2, 'all'));
    if (!tapped) return false;
    const sentence = note || 'Her clenched hands on the start line prove it.';
    if (opts && opts.last) { w.ctl.handleTurn(sentence); } else { await w.say(sentence); }
    await settle();
    return true;
}
async function scoreAll(w, mark) {
    for (let i = 0; i < ELEMENTS.length; i++) {
        // technical accuracy is out of 2: a 1-mark level has no "some" — climb "all", then Level 2 "not" = 1/2
        const m = ELEMENTS[i].outOf === 2 ? 2 : mark;
        if (!(await score(w, m, null, { last: i === ELEMENTS.length - 1 }))) return i;
    }
    await settle();
    return ELEMENTS.length;
}
function markerBlock(map, opts) {
    opts = opts || {};
    const lines = ELEMENTS.filter((e) => !(opts.drop && opts.drop === e.id)).map((e) => '@TRIAL_VERDICT[' + e.id + '=' + (map[e.id] || (e.outOf === 2 ? 'l1' : 'l1_top')) + ']'
        + ' Her sentence on the ' + e.id + ', quoting "their words".' + '\n@TRIAL_EXAMPLE[' + e.id + '] Rewritten ' + e.id + ' at Level 2, in their voice.');
    lines.push('@TRIAL_STRENGTH[flaw] Her refusal to ask for help drives every scene.');
    lines.push('@TRIAL_PRIORITY[change] Let the last line show her passing the ball.');
    return lines.join('\n');
}

async function main() {
    console.log('\nCW TRIAL 2 — behavioural sim (_cwTrialCtlFactory(2), real Trial 2 checks, real ladder)\n');

    ok(ELEMENTS.length === 7 && OUT_OF === 26 && ELEMENTS.map((e) => e.id).join(',') === 'want,flaw,stakes,need,dilemma,change,accuracy',
        '0 · Trial 2 is six character-depth checks + technical accuracy, out of 26', ELEMENTS.map((e) => e.id));
    ok(ELEMENTS.every((e) => /^[a-z]+$/.test(e.id)), '0 · every id is letters only — the marker regex reads [a-zA-Z]+');
    ok(!ELEMENTS.some((e) => e.id === 'goal' || e.id === 'mark' || e.id === 'gap' || e.id === 'strength' || e.id === 'priority' || e.id === 'target'),
        '0 · ⭐ no element id shares a name with a fixed row (goal/mark/gap/strength/priority/target) — one key, one row (§5d)');

    // ── 1 · OPENING ──────────────────────────────────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await settle();
        ok(!!chipNamed(w, /Continue/), '1 · the orientation PAGES — one bubble at a time (§4b)');
        await toFirstAsk(w);
        const all = allText(w);
        ok(/inner struggle driving what happens/.test(all), '1 · it asks Trial 2\'s question, in plain words');
        ok(/AO5/.test(all) && /AO6/.test(all) && /Edexcel IGCSE numbers it AO4/.test(all), '1 · the dimension is named with its codes and the board caveat (§33.11)');
        ok(/the way a real examiner marks/i.test(all), '1 · the examiner method is taught again before it is used (§33.15)');
        ok(/\*\*6 checks\*\*/.test(all) && /\*\*26\*\*/.test(all), '1 · six checks, and the whole trial is out of 26');
        ok(!/Draft 2;|in Draft 2\b|for Draft 2\b/.test(all), '1 · ⭐ nothing in the opening points at Draft 2 as the NEXT draft');
        const t = lastBubble(w);
        ok(/\*\*Goal\*\*/.test(t) && /1 of 7/.test(t), '1 · the first ask is the first check, Goal, 1 of 7');
        ok(t.indexOf(CHECKS[0].prompt) !== -1, '1 · it carries the lens\'s own question, verbatim');
        ok(t.indexOf(CHECKS[0].example) !== -1, '1 · …and a worked example inside the ask (§4c.2)');
        ok(!!ladder && ladder.title === 'Goal' && ladder.total === 7, '1 · the card is published for this check');
        const l1 = (ladder.levels || []).filter((lv) => lv.n === 1)[0];
        ok(!!l1 && l1.text === CHECKS[0].l1, '1 · Level 1 is the check said-not-shown (its own l1)');
        ok(w.sends.length === 0, '1 · nothing has cost an API call yet');
    }

    // ── 2 · ROWS NEVER COLLIDE ───────────────────────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        ok(w.rows.get('cw-trial-2-goal') === 'Grade 8', '2 · the grade goal is banked in its own row', w.rows.get('cw-trial-2-goal'));
        await score(w, 4, 'She shoves past the coach to grab the ball.');
        ok(/^4\/4 — She shoves past/.test(w.rows.get('cw-trial-2-want') || ''), '2 · the Goal check banks into cw-trial-2-want', w.rows.get('cw-trial-2-want'));
        ok(w.rows.get('cw-trial-2-goal') === 'Grade 8', '2 · ⭐ …and the grade-goal row is untouched by it', w.rows.get('cw-trial-2-goal'));
        ok(/\*\*Flaw\*\*/.test(lastBubble(w)), '2 · the walk moves to the second check, Flaw');
    }

    // ── 3 + 4 + 5 · THE MARKING TURN, THE MARK, THE WORDS, THE TARGET ───────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        const n = await scoreAll(w, 3);
        ok(n === 7, '3 · all seven judged', n);
        ok(w.sends.length === 1, '3 · ⭐ ONE API call — the marking turn', w.sends.length);
        const ctx = hiddenCtx(w);
        ok(/TRIAL 2 — CHARACTER DEPTH/.test(ctx) && /their own Draft 2 the way an examiner does/.test(ctx), '3 · the marking turn names the trial and the draft it judges');
        ok(/THEIR CHARACTER PLAN/.test(ctx) && ctx.indexOf(PLAN['logline|cw-step-3-flaw']) !== -1 && ctx.indexOf(PLAN['character_profile|cw-step-10-ext-goal-begin']) !== -1,
            '3 · ⭐ it hands her THEIR plan (Step 11 profile + Step 3 flaw) as background');
        ok(/out of 4, 2, 24 or 26/.test(ctx) && !/28 or 30/.test(ctx), '3 · the no-number rule names Trial 2\'s totals, never Trial 1\'s');
        ok(ELEMENTS.every((e) => ctx.indexOf('@TRIAL_VERDICT[' + e.id + '=') !== -1), '3 · the marker contract lists every check');
        ok(/most in Draft 3/.test(ctx) && /that element in Draft 3/.test(ctx) && /Judge only character depth/.test(ctx), '3 · priority is for Draft 3, and she judges character depth only');
        w.resolveApi('My calls, check by check.\n\n' + markerBlock({ want: 'l2_top', flaw: 'l2_low', stakes: 'l1_top', need: 'l1_low', dilemma: 'l2_top', change: 'l1_top', accuracy: 'l2' }));
        for (let i = 0; i < 8; i++) await settle();
        ok(/^4\/4 \(top of Level 2\)/.test(w.rows.get('cw-trial-2-fb-want') || ''), '4 · her verdict lands in the document, per check', w.rows.get('cw-trial-2-fb-want'));
        const mk = w.rows.get('cw-trial-2-mark') || '';
        ok(/\(18\/26 · 69%\) for character depth$/.test(mk), '4 · ⭐ the mark is CODE arithmetic: 4+3+2+1+4+2+2 = 18 / 26, for character depth', mk);
        const all = allText(w);
        ok(/out of 26\*\*/.test(all) && !/out of 30/.test(all), '4 · the calibration speaks in 26, never 30');
        ok(/for character depth — 18 out of 26/.test(all), '4 · How am I going? names the dimension and the mark');
        ok(await toTarget(w), '5 · the walk reaches the closing target ask (after calibration + the paced summary)');
        const all5 = allText(w);
        ok(/your one target for Draft 3/.test(all5) && /Draft 3 must do that Draft 2 does not/.test(all5), '5 · ⭐ the target is for Draft 3, against Draft 2');
        ok(/Where to next\?/.test(all5) && /Let the last line show her passing the ball/.test(all5), '5 · Where to next? carries her priority');
        ok(!/target for Draft 2|carry into Draft 2|changes Draft 2|hold it in Draft 2|Draft 2 is where this counts/.test(allText(w)), '5 · ⭐ no next-draft sentence says Draft 2');
        await w.say('Show Mara passing the ball in the last line.');
        for (let i = 0; i < 4; i++) await settle();
        ok(w.rows.get('cw-trial-2-target') === 'Show Mara passing the ball in the last line.', '5 · the target is filed in its row');
        const last = w.saved[w.saved.length - 1] || {};
        ok(last.n === 2 && last.payload && last.payload.trial === 2 && last.payload.dimension === 'character_depth' && last.payload.target === 'Show Mara passing the ball in the last line.',
            '5 · ⭐ the result is saved as TRIAL 2 — the next draft\'s opener reads it by that number', last);
        ok(w.saved.length === 2 && w.saved[0].payload.marks === 18 && w.saved[0].payload.out_of === 26, '5 · the first save carries the mark (18/26), the second the target', w.saved.map((x) => x.payload.marks));
        ok(/opening move for Draft 3/.test(lastBubble(w)) || /opening move for Draft 3/.test(allText(w)), '5 · the close points at Draft 3');
    }

    // ── 6 · A MISSING VERDICT FILES NOTHING ─────────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 3);
        w.resolveApi('Calls.\n\n' + markerBlock({}, { drop: 'need' }));
        for (let i = 0; i < 6; i++) await settle();
        ok(!w.rows.get('cw-trial-2-mark'), '6 · six of seven verdicts → NO mark filed (never half a mark)');
        ok(!!chipNamed(w, /Give me my marks/), '6 · …and the student is left a chip to run the marking again (§4d)');
    }

    // ── 7 · RESUME LANDS ON THE CHECK IN FLIGHT ─────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await score(w, 3, 'Mara grabs the ball before anyone speaks.');
        await score(w, 2, 'She snaps at her teammate.');
        const w2 = reload(w);
        ok(w2.ctl.tryResume() === true, '7 · a reload resumes the walk');
        for (let i = 0; i < 6; i++) await settle();
        ok(/\*\*Stakes\*\*/.test(lastBubble(w2)) && /3 of 7/.test(lastBubble(w2)), '7 · ⭐ …on the third check, where the student was — not the top', lastBubble(w2).slice(0, 80));
    }

    console.log('\n   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
    console.log(fail ? '❌ cw-trial2-sim FAILED' : '✅ cw-trial2-sim passed (' + asserts.pass + ' assertions, 0 failed)');
    process.exit(fail);
}
main().catch((e) => { console.error('❌ cw-trial2-sim crashed —', e && e.stack); process.exit(1); });
