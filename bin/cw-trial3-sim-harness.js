#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-trial3-sim-harness.js — BEHAVIOURAL gate for Trial 3: Archetype Coherence (v7.20.831, FIXLIST #884-②, CW trials slice 5).
 *
 * Trial 3 is the SAME examiner walk as Trials 1 and 2 — `_cwTrialCtlFactory(3)` — on Trial 3's own checks (wml-core.js
 * CW_TRIAL3_ELEMENTS: the Draft 3 `archetypes` lens). bin/cw-trial1-sim-harness.js and bin/cw-trial2-sim-harness.js prove the
 * factory still IS Trials 1 and 2; this proves Trial 3's half: its rows, its words (WML.cwTrialDim, read at use-time), a plan
 * that spans the story (planFids: beginning · middle · end), its arithmetic (/22) and its saved result.
 *
 *  1. The opening pages, names the dimension; the first ask is the first check, verbatim.
 *  2. ⭐ The grade-goal row and the five checks' rows never collide.
 *  3. ⭐ ONE API call for the whole trial; the marking turn carries THEIR archetype plan, part by part, the checks' marker
 *     contract, and the right totals (20 or 22, never Trial 1's or Trial 2's).
 *  4. Sophia's verdicts land in the document; the mark is /22 for archetype coherence.
 *  5. ⭐ Every next-draft word says Draft 4; the target is filed and saved as trial 3.
 *  6. A marking reply missing a verdict files NO mark and leaves a chip (§4d, §11).
 *  7. A reload mid-walk lands on the check in flight (§4c.8b).
 *  8. A stuck student's help call names Trial 3's checks and plan, never Trial 2's.
 *  Liveness is checked automatically inside every say()/tap() (walk-sim-lib, §4d).
 *
 * Usage: node bin/cw-trial3-sim-harness.js
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
const t3Idx = CORE.indexOf('const CW_TRIAL3_ELEMENTS = [');
const accIdx = CORE.indexOf('const CW_TRIAL1_ACCURACY = {');
const dimIdx = CORE.indexOf('const CW_TRIAL_DIMS = {');
if (t3Idx < 0 || accIdx < 0 || dimIdx < 0) { console.error('❌ CW_TRIAL3_ELEMENTS / CW_TRIAL1_ACCURACY / CW_TRIAL_DIMS not found in wml-core.js'); process.exit(1); }
// eslint-disable-next-line no-eval
const CHECKS = eval(braceSliceFrom(CORE, t3Idx, '[', ']').text);
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
const CTL_SRC = { src: '(function (N) ' + braceSliceFrom(SRC, fIdx, '{', '}').text + ')(3)' };

const FIDS = ELEMENTS.map((e) => 'cw-trial-3-' + e.id)
    .concat(ELEMENTS.map((e) => 'cw-trial-3-fb-' + e.id))
    .concat(['cw-trial-3-mark', 'cw-trial-3-gap', 'cw-trial-3-strength', 'cw-trial-3-priority', 'cw-trial-3-target', 'cw-trial-3-goal']);
// Their archetype plan (Step 15), by part of the story.
const PLAN = {
    'character_archetypes|cw-step-13-arch-begin': 'The Underdog — small, ignored by the team.',
    'character_archetypes|cw-step-13-phys-begin': 'Oversized hand-me-down kit, scuffed boots.',
    'character_archetypes|cw-step-13-arch-mid': 'The Rebel — argues with the coach.',
    'character_archetypes|cw-step-13-arch-end': 'The Hero — takes the penalty for the team.',
    'character_archetypes|cw-step-13-phys-end': 'Stands tall, captain’s armband.',
};

let planLoaded = {};
let ladder = null;
let _pickWorld = null;
function world(opts) {
    opts = opts || {};
    planLoaded = {};
    ladder = null;
    const w = makeWorld(CTL_SRC, Object.assign({
        task: 'cw_trial_3',
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
        cwTrialElements: function (n) { return n === 3 ? ELEMENTS : []; },
        cwTrialDim: function (n) { return DIMS[n] || null; },
        CW_STEPS: [{ step: 17, draft: 3 }, { id: 'trial_3', trial: 3 }, { step: 18 }],
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
        if (/your one target for Draft 4/i.test(lastBubble(w))) return true;
        const c = chipNamed(w, /Continue/) || w.chips().filter((x) => !/Change my answers|Give me my marks|Try again/.test(String(x.textContent)))[0];
        if (!c) break;
        w.tap(c);
    }
    await settle();
    return /your one target for Draft 4/i.test(lastBubble(w));
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
    const sentence = note || 'Her scuffed boots catch on the step as she runs out.';
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
    lines.push('@TRIAL_STRENGTH[pressure] When the coach shouts, she argues back.');
    lines.push('@TRIAL_PRIORITY[shift] Let the old habit crack at the penalty spot.');
    return lines.join('\n');
}

async function main() {
    console.log('\nCW TRIAL 3 — behavioural sim (_cwTrialCtlFactory(3), real Trial 3 checks, real ladder)\n');

    ok(ELEMENTS.length === 6 && OUT_OF === 22 && ELEMENTS.map((e) => e.id).join(',') === 'look,choices,pressure,shift,detail,accuracy',
        '0 · Trial 3 is five archetype checks + technical accuracy, out of 22', ELEMENTS.map((e) => e.id));
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
        ok(/tell what kind of person your protagonist is, and watch it change/.test(all), '1 · it asks Trial 3\'s question, in plain words');
        ok(!/inner struggle driving what happens/.test(all), '1 · ⭐ …and never Trial 2\'s');
        ok(/\*\*5 checks\*\*/.test(all) && /\*\*22\*\*/.test(all), '1 · five checks, and the whole trial is out of 22');
        ok(/fix in Draft 4/.test(all) && !/fix in Draft 3/.test(all), '1 · ⭐ the next draft named in the opening is Draft 4');
        const t = lastBubble(w);
        ok(/\*\*Appearance\*\*/.test(t) && /1 of 6/.test(t), '1 · the first ask is the first check, Appearance, 1 of 6');
        ok(t.indexOf(CHECKS[0].prompt) !== -1 && t.indexOf(CHECKS[0].example) !== -1, '1 · it carries the lens\'s own question and a worked example, verbatim');
        ok(!!ladder && ladder.title === 'Appearance' && ladder.total === 6, '1 · the card is published for this check');
        const l1 = (ladder.levels || []).filter((lv) => lv.n === 1)[0];
        ok(!!l1 && l1.text === CHECKS[0].l1, '1 · Level 1 is the check said-or-named (its own l1)');
        ok(w.sends.length === 0, '1 · nothing has cost an API call yet');
    }

    // ── 2 · ROWS NEVER COLLIDE ───────────────────────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        ok(w.rows.get('cw-trial-3-goal') === 'Grade 8', '2 · the grade goal is banked in its own row', w.rows.get('cw-trial-3-goal'));
        await score(w, 4, 'Her scuffed boots catch on the step as she runs out.');
        ok(/^4\/4 — Her scuffed boots/.test(w.rows.get('cw-trial-3-look') || ''), '2 · the Appearance check banks into cw-trial-3-look', w.rows.get('cw-trial-3-look'));
        ok(w.rows.get('cw-trial-3-goal') === 'Grade 8', '2 · ⭐ …and the grade-goal row is untouched by it');
        ok(/\*\*Choices\*\*/.test(lastBubble(w)), '2 · the walk moves to the second check, Choices');
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
        ok(/TRIAL 3 — ARCHETYPE COHERENCE/.test(ctx) && /their own Draft 3 the way an examiner does/.test(ctx), '3 · the marking turn names the trial and the draft it judges');
        ok(/for each of the 5 archetype checks/.test(ctx), '3 · …and counts its own checks by their own name');
        ok(/THEIR ARCHETYPE PLAN/.test(ctx) && ctx.indexOf('Beginning: ' + PLAN['character_archetypes|cw-step-13-arch-begin']) !== -1
            && ctx.indexOf('End: ' + PLAN['character_archetypes|cw-step-13-arch-end']) !== -1,
            '3 · ⭐ it hands her THEIR Step 15 plan, part by part (beginning · end), as background');
        ok(!/THEIR CHARACTER PLAN/.test(ctx), '3 · ⭐ …never Trial 2\'s plan heading');
        ok(/out of 4, 2, 20 or 22/.test(ctx) && !/24 or 26/.test(ctx) && !/28 or 30/.test(ctx), '3 · the no-number rule names Trial 3\'s totals');
        ok(ELEMENTS.every((e) => ctx.indexOf('@TRIAL_VERDICT[' + e.id + '=') !== -1), '3 · the marker contract lists every check');
        ok(/most in Draft 4/.test(ctx) && /that element in Draft 4/.test(ctx) && /Judge only archetype coherence/.test(ctx), '3 · priority is for Draft 4, and she judges archetype coherence only');
        w.resolveApi('My calls, check by check.\n\n' + markerBlock({ look: 'l2_top', choices: 'l2_low', pressure: 'l1_top', shift: 'l1_low', detail: 'l2_top', accuracy: 'l2' }));
        for (let i = 0; i < 8; i++) await settle();
        ok(/^4\/4 \(top of Level 2\)/.test(w.rows.get('cw-trial-3-fb-look') || ''), '4 · her verdict lands in the document, per check', w.rows.get('cw-trial-3-fb-look'));
        const mk = w.rows.get('cw-trial-3-mark') || '';
        ok(/^Grade 7 \(16\/22 · 73%\) for archetype coherence$/.test(mk), '4 · ⭐ the mark is CODE arithmetic: 4+3+2+1+4+2 = 16 / 22, for archetype coherence', mk);
        const all = allText(w);
        ok(/out of 22\*\*/.test(all) && !/out of 26/.test(all), '4 · the calibration speaks in 22');
        ok(/for archetype coherence — 16 out of 22/.test(all), '4 · How am I going? names the dimension and the mark');
        ok(await toTarget(w), '5 · the walk reaches the closing target ask');
        const all5 = allText(w);
        ok(/your one target for Draft 4/.test(all5) && /Draft 4 must do that Draft 3 does not/.test(all5), '5 · ⭐ the target is for Draft 4, against Draft 3');
        ok(/Let the old habit crack at the penalty spot/.test(all5), '5 · Where to next? carries her priority');
        await w.say('Let her stop arguing and take the penalty herself.');
        for (let i = 0; i < 4; i++) await settle();
        ok(w.rows.get('cw-trial-3-target') === 'Let her stop arguing and take the penalty herself.', '5 · the target is filed in its row');
        const last = w.saved[w.saved.length - 1] || {};
        ok(last.n === 3 && last.payload && last.payload.trial === 3 && last.payload.dimension === 'archetype_coherence',
            '5 · ⭐ the result is saved as TRIAL 3 — Draft 4\'s opener reads it by that number', last);
        ok(w.saved.length === 2 && w.saved[0].payload.marks === 16 && w.saved[0].payload.out_of === 22, '5 · the first save carries the mark (16/22), the second the target', w.saved.map((x) => x.payload.marks));
    }

    // ── 6 · A MISSING VERDICT FILES NOTHING ─────────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await scoreAll(w, 3);
        w.resolveApi('Calls.\n\n' + markerBlock({}, { drop: 'shift' }));
        for (let i = 0; i < 6; i++) await settle();
        ok(!w.rows.get('cw-trial-3-mark'), '6 · five of six verdicts → NO mark filed (never half a mark)');
        ok(!!chipNamed(w, /Give me my marks/), '6 · …and the student is left a chip to run the marking again (§4d)');
    }

    // ── 7 · RESUME LANDS ON THE CHECK IN FLIGHT ─────────────────────────────────────────────
    {
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await score(w, 3, 'Her boots are too big for her.');
        await score(w, 2, 'She keeps quiet when the coach shouts.');
        const w2 = reload(w);
        ok(w2.ctl.tryResume() === true, '7 · a reload resumes the walk');
        for (let i = 0; i < 6; i++) await settle();
        ok(/\*\*Reaction Under Pressure\*\*/.test(lastBubble(w2)) && /3 of 6/.test(lastBubble(w2)), '7 · ⭐ …on the third check, where the student was — not the top', lastBubble(w2).slice(0, 80));
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
            ok(/ONE of the five archetype checks \(how their protagonist’s archetype shows in the scene, and how it shifts\)/.test(ctx), '8 · ⭐ it names Trial 3\'s checks, never "the six character-depth checks"');
            ok(/in their archetype plan from Step 15/.test(ctx) && ctx.indexOf('Beginning: ' + PLAN['character_archetypes|cw-step-13-phys-begin']) !== -1, '8 · …and hands her the plan for THIS check (appearance, part by part)');
        }
    }

    // ── 9 · ⭐ A NEW DEVICE (no saved position in this browser) — rebuilt from the DOCUMENT (#897, §4d) ──────────────
    {
        const newDevice = (w) => world({ prefill: Object.fromEntries(w.rows) });   // the page's rows, none of this browser's state
        // (a) mid-walk: two checks banked
        const w = world();
        w.ctl.forceStart();
        await toFirstAsk(w);
        await score(w, 3, 'Her boots are too big for her.');
        await score(w, 2, 'She keeps quiet when the coach shouts.');
        const a = newDevice(w);
        ok(a.ctl.tryResume() === true, '9a · ⭐ with NO saved position on this device, the walk still resumes (it used to return false: a dead screen)');
        for (let i = 0; i < 6; i++) await settle();
        ok(/\*\*Reaction Under Pressure\*\*/.test(lastBubble(a)) && /3 of 6/.test(lastBubble(a)), '9a · …on the third check, read from the banked rows', lastBubble(a).slice(0, 80));
        ok(!!ladder && ladder.title === 'Reaction Under Pressure', '9a · …with its marking card published');
        ok(a.sends.length === 0, '9a · …and no API call');
        // (b) every check judged, no mark yet: a chip, never an unasked marking call
        const w2 = world();
        w2.ctl.forceStart();
        await toFirstAsk(w2);
        await scoreAll(w2, 3);
        const rowsB = Object.fromEntries(w2.rows);
        delete rowsB['cw-trial-3-mark'];
        const b2 = world({ prefill: rowsB });
        ok(b2.ctl.tryResume() === true, '9b · all checks banked, no mark: it resumes');
        for (let i = 0; i < 6; i++) await settle();
        ok(!!chipNamed(b2, /Give me my marks/), '9b · ⭐ …offering "Give me my marks" (§4d: something to press)');
        ok(b2.sends.length === 0, '9b · ⭐ …and it does NOT send the marking call by itself', b2.sends.length);
        // (c) marked, no target yet: the target ask, with the mark read back from its row
        w2.resolveApi('Calls.\n\n' + markerBlock({ look: 'l2_top', choices: 'l2_low', pressure: 'l1_top', shift: 'l1_low', detail: 'l2_top', accuracy: 'l2' }));
        for (let i = 0; i < 8; i++) await settle();
        const c3 = newDevice(w2);
        ok(c3.ctl.tryResume() === true, '9c · marked, no target: it resumes');
        for (let i = 0; i < 6; i++) await settle();
        ok(/your one target for Draft 4/i.test(lastBubble(c3)), '9c · …on the target ask', lastBubble(c3).slice(0, 80));
        await c3.say('Let her stop arguing and take the penalty herself.');
        for (let i = 0; i < 4; i++) await settle();
        const sv = c3.saved[c3.saved.length - 1] || {};
        ok(sv.payload && sv.payload.marks === 16 && sv.payload.out_of === 22 && sv.payload.sophia && sv.payload.sophia.look === 4 && sv.payload.target,
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
        ok(first.length === 1 && /watch it change/.test(first[0].content), '9e · (setup) the transcript holds orientation message 1');
        const e5 = world({ history: first.map((t) => Object.assign({}, t)) });
        ok(e5.ctl.tryResume() === true, '9e · ⭐ transcript started, nothing banked, new device: it resumes');
        for (let i = 0; i < 4; i++) await settle();
        ok(/Content and Organisation/.test(lastBubble(e5)) && !/watch it change/.test(lastBubble(e5)), '9e · …with orientation message 2, not message 1 again', lastBubble(e5).slice(0, 80));
        ok(!!chipNamed(e5, /Continue/), '9e · …and a Continue chip (§4d: something to press)');
        for (let i = 0; i < 10; i++) { await settle(); const c = chipNamed(e5, /Continue/); if (!c) break; e5.tap(c); }
        await settle();
        ok(!!chipNamed(e5, /Grade 8/), '9e · …through to the grade-goal question');
        ok(e5.sends.length === 0, '9e · …with no API call');
    }

    console.log('\n   ' + asserts.pass + ' assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
    console.log(fail ? '❌ cw-trial3-sim FAILED' : '✅ cw-trial3-sim passed (' + asserts.pass + ' assertions, 0 failed)');
    process.exit(fail);
}
main().catch((e) => { console.error('❌ cw-trial3-sim crashed —', e && e.stack); process.exit(1); });
