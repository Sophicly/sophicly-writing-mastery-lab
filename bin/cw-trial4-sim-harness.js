#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-trial4-sim-harness.js — BEHAVIOURAL gate for Trial 4: Emotional Impact (v7.20.835, FIXLIST #884-③, CW trials slice 5).
 * Generated from cw-trial3-sim-harness.js with an ordered replacement list.
 *
 * Trial 4 is the SAME examiner walk as the earlier trials — `_cwTrialCtlFactory(4)` — on Trial 4's own checks
 * (wml-core.js CW_TRIAL4_ELEMENTS: the Draft 4 `empathy` lens). The other trial sims prove the factory still IS
 * the earlier trials; this proves Trial 4's half: its rows, its words (WML.cwTrialDim, read at use-time), a plan read from the ONE technique list (only the techniques the student chose; a turned-down one is never handed over),
 * its arithmetic (/22) and its saved result.
 *
 *  1. The opening pages, names the dimension; the first ask is the first check, verbatim.
 *  2. ⭐ The grade-goal row and the five checks' rows never collide.
 *  3. ⭐ ONE API call for the whole trial; the marking turn carries THEIR plan as background, the checks' marker contract,
 *     and the right totals.
 *  4. Sophia's verdicts land in the document; the mark is /22 for emotional impact.
 *  5. ⭐ Every next-draft word says Draft 5; the target is filed and saved as trial 4.
 *  6. A marking reply missing a verdict files NO mark and leaves a chip (§4d, §11).
 *  7. A reload mid-walk lands on the check in flight (§4c.8b).
 *  8. A stuck student's help call names Trial 4's checks and the plan for THAT check, never an earlier trial's.
 *  9. A new device (no saved position in this browser) rebuilds the walk from the document (#897).
 *  Liveness is checked automatically inside every say()/tap() (walk-sim-lib, §4d).
 *
 * Usage: node bin/cw-trial4-sim-harness.js
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
const t3Idx = CORE.indexOf('const CW_TRIAL4_ELEMENTS = [');
const empIdx = CORE.indexOf('const CW_EMPATHY_TECHNIQUES = [');
const fidIdx = CORE.indexOf('const _cwEmpFids = function');
const EMP_FIDS = fidIdx < 0 ? '' : CORE.slice(fidIdx, CORE.indexOf('\n', fidIdx));   // the REAL helper, never a copy
const accIdx = CORE.indexOf('const CW_TRIAL1_ACCURACY = {');
const dimIdx = CORE.indexOf('const CW_TRIAL_DIMS = {');
if (t3Idx < 0 || empIdx < 0 || fidIdx < 0 || accIdx < 0 || dimIdx < 0) { console.error('❌ CW_TRIAL4_ELEMENTS / CW_EMPATHY_TECHNIQUES / _cwEmpFids / CW_TRIAL1_ACCURACY / CW_TRIAL_DIMS not found in wml-core.js'); process.exit(1); }
// eslint-disable-next-line no-eval
const CHECKS = eval('(function () { const CW_EMPATHY_TECHNIQUES = ' + braceSliceFrom(CORE, empIdx, '[', ']').text + '; ' + EMP_FIDS + ' return ' + braceSliceFrom(CORE, t3Idx, '[', ']').text + '; })()');
// eslint-disable-next-line no-eval
const ACCURACY = eval('(' + braceSliceFrom(CORE, accIdx, '{', '}').text + ')');
// eslint-disable-next-line no-eval
const DIMS = eval('(' + braceSliceFrom(CORE, dimIdx, '{', '}').text + ')');
const ELEMENTS = CHECKS.concat([ACCURACY]);
const OUT_OF = ELEMENTS.reduce((a, e) => a + (e.outOf || 4), 0);   // 22

const lgIdx = SRC.indexOf('function _ladderGrade(pct)');
// eslint-disable-next-line no-new-func
const LADDER_GRADE = new Function('return ' + SRC.slice(lgIdx, braceSliceFrom(SRC, lgIdx, '{', '}').end) + ';')();
const fIdx = SRC.indexOf('function _cwTrialCtlFactory(N) {');
if (fIdx < 0) { console.error('❌ _cwTrialCtlFactory not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = { src: '(function (N) ' + braceSliceFrom(SRC, fIdx, '{', '}').text + ')(4)' };

const FIDS = ELEMENTS.map((e) => 'cw-trial-4-' + e.id)
    .concat(ELEMENTS.map((e) => 'cw-trial-4-fb-' + e.id))
    .concat(['cw-trial-4-mark', 'cw-trial-4-gap', 'cw-trial-4-strength', 'cw-trial-4-priority', 'cw-trial-4-target', 'cw-trial-4-goal']);
// Their empathy plan (Step 18): the techniques they chose, by the ONE list's ids.
const NOT_USING = (CORE.match(/const CW_STRUCT_NOT_USING = '([^']+)'/) || [])[1] || '';   // the REAL row text
const PLAN = {
    'empathy_plan|cw-step-16-unfair-injury': 'The coach drops her from the team photo.',
    'empathy_plan|cw-step-16-wishes': 'She wants the team to accept her.',
    'empathy_plan|cw-step-16-jeopardy': NOT_USING,   // a technique they turned down at Step 18 — never handed to Sophia as a plan
    'empathy_plan|cw-step-16-caring': 'She gives up her place so Priya can play.',
    'empathy_plan|cw-step-16-courage': 'She takes the penalty though her legs are shaking.',
    'empathy_plan|cw-step-16-mistakes': 'She regrets ignoring Priya earlier.',
    'empathy_plan|cw-step-16-wit': 'She reads the other team\u2019s tactics.',
};

let planLoaded = {};
let ladder = null;
let _pickWorld = null;
function world(opts) {
    opts = opts || {};
    planLoaded = {};
    ladder = null;
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_trial_4',
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
    // Added AFTER the controller is built — exactly what the walk must survive (the trial's words are read when USED).
    Object.assign(w.deps.WML, {
        cwTrialElements: function (n) { return n === 4 ? ELEMENTS : []; },
        cwTrialDim: function (n) { return DIMS[n] || null; },
        CW_EMPATHY_NOT_USING: NOT_USING,
        CW_STEPS: [{ step: 20, draft: 4 }, { id: 'trial_4', trial: 4 }, { step: 21 }],
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
async function toTarget(w) {
    for (let i = 0; i < 12; i++) {
        await settle();
        if (/your one target for Draft 5/i.test(lastBubble(w))) return true;
        const c = chipNamed(w, /Continue/) || w.chips().filter((x) => !/Change my answers|Give me my marks|Try again/.test(String(x.textContent)))[0];
        if (!c) break;
        w.tap(c);
    }
    await settle();
    return /your one target for Draft 5/i.test(lastBubble(w));
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
    const sentence = note || 'Her hands shake as she places the ball.';
    if (opts && opts.last) { w.ctl.handleTurn(sentence); } else { await w.say(sentence); }
    await settle();
    return true;
}
async function scoreAll(w, mark) {
    for (let i = 0; i < ELEMENTS.length; i++) {
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
    lines.push('@TRIAL_STRENGTH[courage] Her shaking hands on the ball.');
    lines.push('@TRIAL_PRIORITY[build] Let the reader see her alone before the kick.');
    return lines.join('\n');
}

async function main() {
    console.log('\nCW TRIAL 4 — behavioural sim (_cwTrialCtlFactory(4), real Trial 4 checks, real ladder)\n');

    ok(ELEMENTS.length === 6 && OUT_OF === 22 && ELEMENTS.map((e) => e.id).join(',') === 'hurt,courage,cost,balance,build,accuracy',
        '0 · Trial 4 is five empathy checks + technical accuracy, out of 22', ELEMENTS.map((e) => e.id));
    ok(ELEMENTS.every((e) => /^[a-z]+$/.test(e.id)), '0 · every id is letters only — the marker regex reads [a-zA-Z]+');
    ok(!ELEMENTS.some((e) => ['goal', 'mark', 'gap', 'strength', 'priority', 'target'].indexOf(e.id) !== -1),
        '0 · ⭐ no element id shares a name with a fixed row — one key, one row (§5d)');

    // ── 1 · OPENING ──────────────────────────────────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await settle();
        ok(!!chipNamed(w, /Continue/), '1 · the orientation PAGES — one bubble at a time (§4b)');
        await toFirstAsk(w);
        const all = allText(w);
        ok(/feel with your protagonist, and care more by the end/.test(all), '1 · it asks Trial 4\'s question, in plain words');
        ok(!/inner struggle driving what happens|watch it change/.test(all), '1 · ⭐ …and never an earlier trial\'s');
        ok(/\*\*5 checks\*\*/.test(all) && /\*\*22\*\*/.test(all), '1 · five checks, and the whole trial is out of 22');
        ok(/fix in Draft 5/.test(all) && !/fix in Draft 4/.test(all), '1 · ⭐ the next draft named in the opening is Draft 5');
        const t = lastBubble(w);
        ok(/\*\*Vulnerability\*\*/.test(t) && /1 of 6/.test(t), '1 · the first ask is the first check, Vulnerability, 1 of 6');
        ok(t.indexOf(CHECKS[0].prompt) !== -1 && t.indexOf(CHECKS[0].example) !== -1, '1 · it carries the lens\'s own question and a worked example, verbatim');
        ok(!!ladder && ladder.title === 'Vulnerability' && ladder.total === 6, '1 · the card is published for this check');
        const l1 = (ladder.levels || []).filter((lv) => lv.n === 1)[0];
        ok(!!l1 && l1.text === CHECKS[0].l1, '1 · Level 1 is the check said-or-named (its own l1)');
        ok(w.sends.length === 0, '1 · nothing has cost an API call yet');
    }

    // ── 2 · ROWS NEVER COLLIDE ───────────────────────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        ok(w.rows.get('cw-trial-4-goal') === 'Grade 8', '2 · the grade goal is banked in its own row', w.rows.get('cw-trial-4-goal'));
        await score(w, 4, 'Her hands shake as she places the ball.');
        ok(/^4\/4 — Her hands shake/.test(w.rows.get('cw-trial-4-hurt') || ''), '2 · the Vulnerability check banks into cw-trial-4-hurt', w.rows.get('cw-trial-4-hurt'));
        ok(w.rows.get('cw-trial-4-goal') === 'Grade 8', '2 · ⭐ …and the grade-goal row is untouched by it');
        ok(/\*\*Courage\*\*/.test(lastBubble(w)), '2 · the walk moves to the second check, Courage');
    }

    // ── 3 + 4 + 5 · THE MARKING TURN, THE MARK, THE WORDS, THE TARGET ───────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        const n = await scoreAll(w, 3);
        ok(n === 6, '3 · all six judged', n);
        ok(w.sends.length === 1, '3 · ⭐ ONE API call — the marking turn', w.sends.length);
        const ctx = hiddenCtx(w);
        ok(/TRIAL 4 — EMOTIONAL IMPACT/.test(ctx) && /their own Draft 4 the way an examiner does/.test(ctx), '3 · the marking turn names the trial and the draft it judges');
        ok(/for each of the 5 empathy checks/.test(ctx), '3 · …and counts its own checks by their own name');
        ok(/THEIR EMPATHY PLAN/.test(ctx) && ctx.indexOf('Unfair Injury/Mistreatment: ' + PLAN['empathy_plan|cw-step-16-unfair-injury']) !== -1
            && ctx.indexOf('Courage: ' + PLAN['empathy_plan|cw-step-16-courage']) !== -1 && !/Childlike Innocence/.test(ctx),
            '3 · ⭐ it hands her THEIR Step 18 plan — only the techniques they chose — as background');
        ok(!!NOT_USING && ctx.indexOf(NOT_USING) === -1 && !/Jeopardy:/.test(ctx), '3 · ⭐ …and a technique they turned down ("' + NOT_USING + '") is never handed to her as a plan');
        ok(!/THEIR CHARACTER PLAN|THEIR ARCHETYPE PLAN/.test(ctx), '3 · ⭐ …never an earlier trial\'s plan heading');
        ok(/out of 4, 2, 20 or 22/.test(ctx) && !/24 or 26/.test(ctx) && !/28 or 30/.test(ctx), '3 · the no-number rule names Trial 3\'s totals');
        ok(ELEMENTS.every((e) => ctx.indexOf('@TRIAL_VERDICT[' + e.id + '=') !== -1), '3 · the marker contract lists every check');
        ok(/most in Draft 5/.test(ctx) && /that element in Draft 5/.test(ctx) && /Judge only emotional impact/.test(ctx), '3 · priority is for Draft 5, and she judges emotional impact only');
        w.resolveApi('My calls, check by check.\n\n' + markerBlock({ hurt: 'l2_top', courage: 'l2_low', cost: 'l1_top', balance: 'l1_low', build: 'l2_top', accuracy: 'l2' }));
        for (let i = 0; i < 8; i++) await settle();
        ok(/^4\/4 \(top of Level 2\)/.test(w.rows.get('cw-trial-4-fb-hurt') || ''), '4 · her verdict lands in the document, per check', w.rows.get('cw-trial-4-fb-hurt'));
        const mk = w.rows.get('cw-trial-4-mark') || '';
        ok(/^Grade 7 \(16\/22 · 73%\) for emotional impact$/.test(mk), '4 · ⭐ the mark is CODE arithmetic: 4+3+2+1+4+2 = 16 / 22, for emotional impact', mk);
        const all = allText(w);
        ok(/out of 22\*\*/.test(all) && !/out of 26/.test(all), '4 · the calibration speaks in 22');
        ok(/for emotional impact — 16 out of 22/.test(all), '4 · How am I going? names the dimension and the mark');
        ok(await toTarget(w), '5 · the walk reaches the closing target ask');
        const all5 = allText(w);
        ok(/your one target for Draft 5/.test(all5) && /Draft 5 must do that Draft 4 does not/.test(all5), '5 · ⭐ the target is for Draft 5, against Draft 4');
        ok(/Let the reader see her alone before the kick/.test(all5), '5 · Where to next? carries her priority');
        await w.say('Show her alone with the ball before the kick.');
        for (let i = 0; i < 4; i++) await settle();
        ok(w.rows.get('cw-trial-4-target') === 'Show her alone with the ball before the kick.', '5 · the target is filed in its row');
        const last = w.saved[w.saved.length - 1] || {};
        ok(last.n === 4 && last.payload && last.payload.trial === 4 && last.payload.dimension === 'emotional_impact',
            '5 · ⭐ the result is saved as TRIAL 4 — Draft 5\'s opener reads it by that number', last);
        ok(w.saved.length === 2 && w.saved[0].payload.marks === 16 && w.saved[0].payload.out_of === 22, '5 · the first save carries the mark (16/22), the second the target', w.saved.map((x) => x.payload.marks));
    }

    // ── 6 · A MISSING VERDICT FILES NOTHING ─────────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 3);
        w.resolveApi('Calls.\n\n' + markerBlock({}, { drop: 'balance' }));
        for (let i = 0; i < 6; i++) await settle();
        ok(!w.rows.get('cw-trial-4-mark'), '6 · five of six verdicts → NO mark filed (never half a mark)');
        ok(!!chipNamed(w, /Give me my marks/), '6 · …and the student is left a chip to run the marking again (§4d)');
    }

    // ── 7 · RESUME LANDS ON THE CHECK IN FLIGHT ─────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await score(w, 3, 'Her hands shake on the ball.');
        await score(w, 2, 'She runs back towards the goal anyway.');
        const w2 = reload(w);
        ok(w2.ctl.tryResume() === true, '7 · a reload resumes the walk');
        for (let i = 0; i < 6; i++) await settle();
        ok(/\*\*Kindness at a Cost\*\*/.test(lastBubble(w2)) && /3 of 6/.test(lastBubble(w2)), '7 · ⭐ …on the third check, where the student was — not the top', lastBubble(w2).slice(0, 80));
    }

    // ── 8 · A STUCK STUDENT'S HELP CALL IS TRIAL 3'S ────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        const stuck = w.helpChipNamed(/Still stuck/);   // the rig keeps help-bar buttons out of chips() on purpose
        ok(!!stuck, '8 · the last help rung is there');
        if (stuck) {
            w.tap(stuck);
            await settle();
            const ctx = hiddenCtx(w);
            ok(w.sends.length === 1, '8 · the help rung is the only call in the item loop');
            ok(/ONE of the five empathy checks \(how the reader is made to feel with their protagonist\)/.test(ctx), '8 · ⭐ it names Trial 4\'s checks, never an earlier trial\'s');
            ok(/in their empathy plan from Step 18/.test(ctx) && ctx.indexOf('Unfair Injury/Mistreatment: ' + PLAN['empathy_plan|cw-step-16-unfair-injury']) !== -1, '8 · …and hands her the plan for THIS check (the victim techniques they chose)');
        }
    }

    // ── 9 · ⭐ A NEW DEVICE (no saved position in this browser) — rebuilt from the DOCUMENT (#897, §4d) ──────────────
    {
        const newDevice = (w) => world({ prefill: Object.fromEntries(w.rows) });   // the page's rows, none of this browser's state
        // (a) mid-walk: two checks banked
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await score(w, 3, 'Her hands shake on the ball.');
        await score(w, 2, 'She runs back towards the goal anyway.');
        const a = newDevice(w);
        ok(a.ctl.tryResume() === true, '9a · ⭐ with NO saved position on this device, the walk still resumes (it used to return false: a dead screen)');
        for (let i = 0; i < 6; i++) await settle();
        ok(/\*\*Kindness at a Cost\*\*/.test(lastBubble(a)) && /3 of 6/.test(lastBubble(a)), '9a · …on the third check, read from the banked rows', lastBubble(a).slice(0, 80));
        ok(!!ladder && ladder.title === 'Kindness at a Cost', '9a · …with its marking card published');
        ok(a.sends.length === 0, '9a · …and no API call');
        // (b) every check judged, no mark yet: a chip, never an unasked marking call
        const w2 = world();
        w2.ctl.forceStart();
        await toFirstAsk(w2);
        await scoreAll(w2, 3);
        const rowsB = Object.fromEntries(w2.rows);
        delete rowsB['cw-trial-4-mark'];
        const b2 = world({ prefill: rowsB });
        ok(b2.ctl.tryResume() === true, '9b · all checks banked, no mark: it resumes');
        for (let i = 0; i < 6; i++) await settle();
        ok(!!chipNamed(b2, /Give me my marks/), '9b · ⭐ …offering "Give me my marks" (§4d: something to press)');
        ok(b2.sends.length === 0, '9b · ⭐ …and it does NOT send the marking call by itself', b2.sends.length);
        // (c) marked, no target yet: the target ask, with the mark read back from its row
        w2.resolveApi('Calls.\n\n' + markerBlock({ hurt: 'l2_top', courage: 'l2_low', cost: 'l1_top', balance: 'l1_low', build: 'l2_top', accuracy: 'l2' }));
        for (let i = 0; i < 8; i++) await settle();
        const c3 = newDevice(w2);
        ok(c3.ctl.tryResume() === true, '9c · marked, no target: it resumes');
        for (let i = 0; i < 6; i++) await settle();
        ok(/your one target for Draft 5/i.test(lastBubble(c3)), '9c · …on the target ask', lastBubble(c3).slice(0, 80));
        await c3.say('Show her alone with the ball before the kick.');
        for (let i = 0; i < 4; i++) await settle();
        const sv = c3.saved[c3.saved.length - 1] || {};
        ok(sv.payload && sv.payload.marks === 16 && sv.payload.out_of === 22 && sv.payload.sophia && sv.payload.sophia.hurt === 4 && sv.payload.target,
            '9c · ⭐ …and the target save carries the mark and Sophia\'s calls read back from the page — never an empty record', sv.payload);
        // (d) nothing of the walk on the page: false, so entry starts it fresh exactly as before
        const d4 = world();
        ok(d4.ctl.tryResume() === false, '9d · an untouched page and no transcript: false — the fresh entry starts the walk');
        // (e) MEASURED on staging: the walk spoke once (orientation message 1), then the student left; a new device has the
        // transcript but nothing banked. A fresh entry will not run over a transcript, so the walk must carry on itself.
        const e0 = world();
        e0.ctl.forceStart();
        await settle();
        const first = (e0.deps.canvasChatHistory || []).filter((t) => t.role === 'assistant').slice(0, 1);
        ok(first.length === 1 && /care more by the end/.test(first[0].content), '9e · (setup) the transcript holds orientation message 1');
        const e5 = world({ history: first.map((t) => Object.assign({}, t)) });
        ok(e5.ctl.tryResume() === true, '9e · ⭐ transcript started, nothing banked, new device: it resumes');
        for (let i = 0; i < 4; i++) await settle();
        ok(/Content and Organisation/.test(lastBubble(e5)) && !/care more by the end/.test(lastBubble(e5)), '9e · …with orientation message 2, not message 1 again', lastBubble(e5).slice(0, 80));
        ok(!!chipNamed(e5, /Continue/), '9e · …and a Continue chip (§4d: something to press)');
        for (let i = 0; i < 10; i++) { await settle(); const c = chipNamed(e5, /Continue/); if (!c) break; e5.tap(c); }
        await settle();
        ok(!!chipNamed(e5, /Grade 8/), '9e · …through to the grade-goal question');
        ok(e5.sends.length === 0, '9e · …with no API call');
    }

    console.log('\n   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
    console.log(fail ? '❌ cw-trial4-sim FAILED' : '✅ cw-trial4-sim passed (' + asserts.pass + ' assertions, 0 failed)');
    process.exit(fail);
}
main().catch((e) => { console.error('❌ cw-trial4-sim crashed —', e && e.stack); process.exit(1); });
