#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-final-sim-harness.js — BEHAVIOURAL gate for the CW Final Assessment (v7.20.844, FIXLIST #884-⑦, PEDAGOGY §33.6;
 * plan CW-FINAL-ASSESSMENT-PLAN-2026-10-12.md).
 *
 * Drives the REAL `_cwFinalCtl` AND the REAL shared `_examinerLadderCtl` together on one rig (walk-sim-lib), with the REAL
 * engine and the REAL generated mark scheme underneath — never re-typed copies. The ladder is built from the SAME deps
 * as the host (one transcript, one document, one answer slot), and typed input is routed the way the real dispatcher
 * routes it: the ladder first while a climb is open (wml-assessment.js, the `_examinerLadderCtl.active` arm).
 *
 *  1. The opening: both objectives named, codes attached, maxima from the data (24 + 16 = 40), the board caveat, NO board
 *     named as the source; best fit taught (never hurdles); then the grade goal.
 *  2. ⭐ Each objective is climbed BOTTOM-UP on the board's own words, best-fit rung question, SHORT opener (the method is
 *     taught once, not twice); the student's level, criteria, mark and reason land in the page's own rows.
 *  3. ⭐ Between the objectives: their mark, then ONE chip in. After the second: straight to the marking.
 *  4. ⭐ ONE API call for the whole lesson; the marking turn carries the student's own marking, the descriptors word for
 *     word, and the marker contract.
 *  5. ⭐ Sophia's level calls resolve through the SAME resolver as the student's; her rows, the /40, the grade; the reveal
 *     leads with the disagreements and ends on the grade, quietly (§33.9).
 *  6. ⭐ Calibration ±3 on /40 → the summary → the target → the wrap; the result saves as trial 'final', finale true,
 *     never a trial number; the ring gets HER /40 through the piggyback; the sidebar ticks 1→4.
 *  7. ⭐ A marking reply missing a call, or a half, files NO mark and leaves a chip (§4d, §11); a timeout says so.
 *  8. ⭐ A reload MID-CLIMB: the ladder resumes the climb, the host stays quiet, and when the climb ends the host is
 *     reached through registerHost (its onDone did not survive) — the next objective, never a dead screen.
 *  9. ⭐ A NEW DEVICE (no saved position anywhere) lands on the stage the document says, drawn and never stored.
 * 10. "Change my answers" climbs again from Level 1; a missing mark scheme leaves a way forward.
 *  Liveness is checked automatically inside every tap (walk-sim-lib, §4d), and after every typed answer here.
 *
 * Usage: node bin/cw-final-sim-harness.js
 */
'use strict';

const path = require('path');
const { SRC, braceSliceFrom, makeWorld, settle } = require('./walk-sim-lib');

const ROOT = path.resolve(__dirname, '..');
const SCHEMES = require(path.join(ROOT, 'frontend', 'wml-markscheme-data.js'));
const ENGINE = require(path.join(ROOT, 'frontend', 'wml-examiner-ladder.js'));

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg, got) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg + (got !== undefined ? '   got: ' + JSON.stringify(got).slice(0, 400) : ''));
    return false;
}

// ── the REAL pieces ────────────────────────────────────────────────────────────────────────────────────────────
const take = (sig, open, close) => {
    const i = SRC.indexOf(sig);
    if (i < 0) { console.error('❌ not found in wml-assessment.js: ' + sig); process.exit(1); }
    return braceSliceFrom(SRC, i, open, close);
};
const FINAL_CTL = { src: take('const _cwFinalCtl = (function () {', '(', ')').text + '()' };
const LADDER_SRC = take('const _examinerLadderCtl = (function () {', '(', ')').text + '()';
// eslint-disable-next-line no-new-func
const MOD = new Function('window', [
    'const CW_FINAL_AOS = ' + take('const CW_FINAL_AOS = [', '[', ']').text + ';',
    SRC.slice(SRC.indexOf('function _cwFinalFid(part)'), take('function _cwFinalFid(part)', '{', '}').end),
    SRC.slice(SRC.indexOf('function _ladderGrade(pct)'), take('function _ladderGrade(pct)', '{', '}').end),
    'return { CW_FINAL_AOS, _cwFinalFid, _ladderGrade };',
].join('\n'))({});
const LADDER_WALK = (/const CW_FINAL_LADDER_WALK = '([^']+)';/.exec(SRC) || [])[1];
if (!LADDER_WALK) { console.error('❌ CW_FINAL_LADDER_WALK not found'); process.exit(1); }
const TASK = 'cw_final_assessment';

const F = MOD._cwFinalFid;
const AO_IDS = MOD.CW_FINAL_AOS.map((a) => a.id);
const ALL_FIDS = ['goal', 'strength', 'priority', 'mark', 'gap', 'target']
    .concat(...AO_IDS.map((id) => [id + '-level', id + '-met', id + '-mark', id + '-reason', 'fb-' + id]))
    .map(F);

function world(opts) {
    opts = opts || {};
    const ref = { ladder: null, pendingHost: null };
    const proxy = {
        open: (o) => ref.ladder.open(o),
        get active() { return !!(ref.ladder && ref.ladder.active); },
        handleTurn: (m) => ref.ladder.handleTurn(m),
        tryResume: () => ref.ladder.tryResume(),
        reset: () => ref.ladder.reset(),
        nudge: () => ref.ladder.nudge(),
        inProgressFor: (w) => ref.ladder.inProgressFor(w),
        // The host registers its hand-back WHILE it is being built — before the ladder exists in this rig.
        registerHost: (w, fn) => { if (ref.ladder) ref.ladder.registerHost(w, fn); else ref.pendingHost = [w, fn]; },
    };
    const saves = [], progress = [];
    const w = makeWorld(FINAL_CTL, {
        task: TASK, fids: ALL_FIDS, ok: ok, ls: opts.ls, prefill: opts.prefill, history: opts.history,
        extraDeps: {
            _examinerLadderCtl: proxy,
            CW_FINAL_AOS: MOD.CW_FINAL_AOS, _cwFinalFid: MOD._cwFinalFid, _ladderGrade: MOD._ladderGrade,
            CW_FINAL_LADDER_WALK: LADDER_WALK,
            applyCwSubstepProgress: (d) => progress.push(d.substepNum),
            window: { WML_MARK_SCHEMES: opts.schemes || SCHEMES, WML_EXAMINER_LADDER: ENGINE, WML: {} },
        },
    });
    Object.assign(w.deps.WML, {
        CW_FINAL_TASK: TASK,
        isCwFinalTask: (t) => t === TASK,
        cwProject: { saveTrial: (pid, payload, n) => { saves.push({ pid: pid, payload: JSON.parse(JSON.stringify(payload)), n: n }); return Promise.resolve({ success: true }); } },
    });
    const names = Object.keys(w.deps);
    // eslint-disable-next-line no-new-func
    ref.ladder = new Function(names.join(','), 'return ' + LADDER_SRC + ';').apply(null, names.map((n) => w.deps[n]));
    if (ref.pendingHost) ref.ladder.registerHost(ref.pendingHost[0], ref.pendingHost[1]);
    w.ladder = ref.ladder;
    w.saves = saves;
    w.progress = progress;
    return w;
}
const last = (w) => w.bubbles[w.bubbles.length - 1] || '';
const all = (w) => w.bubbles.join('\n');
const chip = (w, re) => w.chips().filter((c) => re.test(String(c.textContent || '')))[0] || null;
// Typed text, routed like the real dispatcher: a climb owns the turn while it is open. Liveness checked after.
async function say(w, text, reply) {
    const bb = w.bubbles.length;
    if (w.ladder.active) w.ladder.handleTurn(text); else w.ctl.handleTurn(text);
    await settle();
    // Only an explicit reply resolves a pending call — a typed answer that TRIGGERS the marking must leave it pending.
    if (reply !== undefined && w.armed) { w.resolveApi(reply); await settle(); }
    ok(w.bubbles.length > bb || w.chips().length > 0 || !w.ctl.active,
        'DEAD END after typing "' + String(text).slice(0, 30) + '": nothing said, no chip');
}
async function tapNamed(w, re) {
    const c = chip(w, re);
    if (!ok(!!c, 'a chip matching ' + re + ' is on screen', w.chips().map((x) => x.textContent))) return false;
    w.tap(c);
    await settle();
    return true;
}
// Tap "Continue →" until something else is asked.
async function continueAll(w, limit) {
    for (let g = 0; g < (limit || 12); g++) {
        const c = chip(w, /^Continue/);
        if (!c) return;
        w.tap(c);
        await settle();
    }
}
// One whole climb: `better` levels the writing is better than, then where it sits, the criteria, the half, the placement.
async function climb(w, o) {
    await continueAll(w);
    for (let k = 0; k < o.better; k++) { await tapNamed(w, /^Mine is better than this$/); await continueAll(w); }
    await tapNamed(w, /^This is where mine sits$/);
    let guard = 0;
    while (chip(w, /I met this one|Not this one/) && guard++ < 30) {
        await tapNamed(w, guard === 1 ? /I met this one/ : /Not this one/);
    }
    if (o.half) await tapNamed(w, new RegExp('^' + o.half + ' Level'));
    await tapNamed(w, new RegExp('^' + o.place + ' of this level$'));
    await say(w, o.reason);
}
const GOOD = '@FINAL_LEVEL[ao5=4|lower|bottom] Your "salt-stung harbour" opening pulls the reader straight in.\n'
    + '@FINAL_EXAMPLE[ao5] The harbour bells went quiet the moment she stepped onto the jetty.\n'
    + '@FINAL_LEVEL[ao6=2|top] Mostly secure, though "it was cold, she ran" splices two sentences.\n'
    + '@FINAL_EXAMPLE[ao6] It was cold. She ran.\n'
    + '@FINAL_STRENGTH ao5 the opening image carries the whole mood\n'
    + '@FINAL_PRIORITY ao6 mend the comma splices in the climax';

async function main() {
    console.log('\nCW FINAL ASSESSMENT — behavioural sim (real host + real ladder + real mark scheme)\n');

    // ── 1–6 · A WHOLE HONEST RUN ─────────────────────────────────────────────────────────────────────────────
    const ls = new Map();
    const w = world({ ls: ls });
    w.ctl.forceStart();
    await settle();
    ok(/final assessment/i.test(last(w)), '1 · the lesson opens on what it is (the final assessment)', last(w));
    await continueAll(w);
    const open = all(w);
    ok(/Content and Organisation\*\* \(usually called \*\*AO5\*\*, out of 24\)/.test(open) && /Technical Accuracy\*\* \(usually called \*\*AO6\*\*, out of 16\)/.test(open),
        '1 · both objectives named in plain words, codes attached, maxima from the data');
    ok(/together make \*\*40\*\*/.test(open), '1 · …and the total, 40, is a sum of the data, not a typed number');
    ok(/Edexcel IGCSE numbers them AO4 and AO5/.test(open), '1 · the board caveat for the codes is there (§33.14)');
    ok(!/AQA/.test(open), '⭐ 1 · no board is named as the source of the criteria (§33.3)');
    ok(/still better than this description/.test(open) && !/have met every|hurdle|unlock|pass this level|before you can move up/i.test(open),
        '⭐ 1 · best fit is what is taught — never hurdles (§35)');
    ok(!!chip(w, /^Grade 8$/), '1 · the grade goal comes first (§33.15)', w.chips().map((c) => c.textContent));
    await tapNamed(w, /^Grade 8$/);
    ok(w.rows.get(F('goal')) === 'Grade 8', '1 · the goal is filed in the page', w.rows.get(F('goal')));

    // AO5: better than L1 and L2, sits in L3, Lower half, top → 15/24
    await continueAll(w);
    const firstClimb = last(w);
    ok(/\*\*Level 1\b/.test(firstClimb) && !/Level 4/.test(firstClimb), '⭐ 2 · the climb starts at Level 1 — never a top-down pick', firstClimb.slice(0, 120));
    ok(/Is your writing still better than this description\?/.test(firstClimb), '⭐ 2 · the rung question is best fit (§35)');
    const l1 = ENGINE.climbDescriptors(ENGINE.rungs(SCHEMES.aqa_lang1_q5_ao5)[0]);
    ok(l1.every((d) => firstClimb.indexOf(d.text) !== -1), '⭐ 2 · every Level 1 criterion appears word for word from the dataset (' + l1.length + ')');
    ok(all(w).indexOf('An examiner reads from **Level 1** upwards. At each level they ask one question') === -1,
        '⭐ 2 · the ladder opened SHORT — the method is taught once by the lesson, not again by the ladder');
    await climb(w, { better: 2, half: 'Lower', place: 'Top', reason: 'My paragraphs link but my vocabulary stays plain.' });
    ok(w.rows.get(F('ao5-mark')) === '15 / 24', '2 · AO5: top of Lower Level 3 = 15/24, the board’s own number, in the page', w.rows.get(F('ao5-mark')));
    ok(/Level 3/.test(w.rows.get(F('ao5-level')) || '') && /Lower Level 3/.test(w.rows.get(F('ao5-level')) || ''), '2 · the level row records level and half');
    ok(/✓/.test(w.rows.get(F('ao5-met')) || ''), '2 · the criteria they met are banked');
    ok(w.rows.get(F('ao5-reason')) === 'My paragraphs link but my vocabulary stays plain.', '2 · the reason is banked VERBATIM');
    ok(!ls.has('sim_ladder'), '⭐ 3 · the finished climb’s sidecar is cleared (a reload can never resurrect it over the next stage)');
    ok(/You marked \*\*Content and Organisation\*\* at \*\*15 \/ 24\*\*/.test(all(w)), '3 · the host says their mark, in the past tense');
    ok(!!chip(w, /^Mark Technical Accuracy →$/), '⭐ 3 · then ONE chip into the next objective — the next climb is never opened unasked', w.chips().map((c) => c.textContent));
    ok(/You can stop here and come back/.test(last(w)), '3 · …with the promise that it opens exactly here');

    // AO6: better than L1, sits in L2, middle → 6/16 (5–8, middle rounds DOWN)
    await tapNamed(w, /^Mark Technical Accuracy →$/);
    await climb(w, { better: 1, half: null, place: 'Middle', reason: 'Mostly accurate, a few comma splices.' });
    ok(w.rows.get(F('ao6-mark')) === '6 / 16', '2 · AO6: middle of Level 2 (5–8) = 6/16 — the engine rounds the middle DOWN', w.rows.get(F('ao6-mark')));
    ok(w.sends.length === 1, '⭐ 4 · after the second climb the marking is sent at once — ONE call for the whole lesson', w.sends.length);
    const ctx = (w.deps.canvasChatHistory || []).filter((t) => t && t.hidden).map((t) => t.content).join('\n');
    ok(/15 \/ 24/.test(ctx) && /6 \/ 16/.test(ctx) && /My paragraphs link/.test(ctx), '4 · the marking turn carries THEIR marking, reasons included');
    const anyAo6 = ENGINE.descriptorsOf(ENGINE.rungs(SCHEMES.aqa_lang1_q5_ao6)[3])[0].text;
    const anyAo5 = ENGINE.descriptorsOf(ENGINE.rungs(SCHEMES.aqa_lang1_q5_ao5)[0])[0].text;
    ok(ctx.indexOf(anyAo6) !== -1 && ctx.indexOf(anyAo5) !== -1, '⭐ 4 · …the board’s descriptors, word for word, for both objectives');
    ok(/@FINAL_LEVEL\[ao5=<level>\|<upper\|lower>\|<top\|middle\|bottom>\]/.test(ctx) && /@FINAL_LEVEL\[ao6=<level>\|<top\|middle\|bottom>\]/.test(ctx),
        '4 · …and the marker contract the parser reads');
    ok(/Do NOT give a mark/.test(ctx), '4 · …and the rule that she states no number');
    ok(w.progress.join(',') === '1,2,2,3', '6 · the sidebar ticked: story → AO5 → AO6 (opened twice counts once per stage)', w.progress);

    // Sophia's reply: ao5 = Lower Level 4, bottom → 19; ao6 = Level 2 top → 8; 27/40 = 68% → Grade 7
    w.resolveApi(GOOD);
    await settle();
    const e5 = ENGINE.resolve(SCHEMES.aqa_lang1_q5_ao5, { levelNumber: 4, bandName: 'Lower Level 4', placement: 'bottom' });
    const e6 = ENGINE.resolve(SCHEMES.aqa_lang1_q5_ao6, { levelNumber: 2, bandName: null, placement: 'top' });
    ok(e5.mark === 19 && e6.mark === 8, '(the engine’s own answer for her calls: 19 and 8)');
    ok(/^Level 4 · Lower Level 4 · bottom of the band — 19 \/ 24 — /.test(w.rows.get(F('fb-ao5')) || ''), '⭐ 5 · her AO5 call resolved through the SAME resolver: 19/24, in her row', w.rows.get(F('fb-ao5')));
    ok(/^Level 2 · top of the level — 8 \/ 16 — /.test(w.rows.get(F('fb-ao6')) || ''), '⭐ 5 · her AO6 call: 8/16', w.rows.get(F('fb-ao6')));
    ok(/For example: “The harbour bells/.test(w.rows.get(F('fb-ao5')) || ''), '5 · her example rides in her row');
    ok(w.rows.get(F('mark')) === 'Grade 7 (27/40 · 68%) for the final assessment', '⭐ 5 · the mark: 27/40, 68% → Grade 7 through _ladderGrade', w.rows.get(F('mark')));
    ok(/Content and Organisation: you 15 \/ 24, Sophia 19 \/ 24/.test(w.rows.get(F('gap')) || ''), '5 · where they differed, filed');
    ok(/the opening image carries the whole mood/.test(w.rows.get(F('strength')) || '') && /comma splices/.test(w.rows.get(F('priority')) || ''), '5 · strength and priority filed');
    const reveal = w.bubbles.filter((b) => /Where we saw it differently/.test(b))[0] || '';
    ok(reveal.indexOf('Where we saw it differently') < reveal.indexOf('For the record') && /Grade 7/.test(reveal.slice(reveal.indexOf('For the record'))),
        '⭐ 5 · the reveal leads with the disagreements; the grade is the quiet closing line (§33.9)');
    ok(w.deps.state.cwTrialScore && w.deps.state.cwTrialScore.task === TASK && w.deps.state.cwTrialScore.score === 27 && w.deps.state.cwTrialScore.total === 40,
        '⭐ 6 · the ring gets HER /40, tagged with the final assessment’s own task (§33.8)', w.deps.state.cwTrialScore);
    const s1 = w.saves[0] || {};
    ok(s1.n === null && s1.payload && s1.payload.trial === 'final' && s1.payload.finale === true, '⭐ 6 · saved as trial \'final\', finale true, with NO trial number (plan D11)', s1);
    ok(s1.payload && s1.payload.marks === 27 && s1.payload.out_of === 40 && s1.payload.grade === 7 && s1.payload.self.ao5 === 15 && s1.payload.self.ao6 === 6,
        '6 · …with her marks and theirs', s1.payload);
    ok(s1.payload && s1.payload.calibration_delta === -6 && s1.payload.grade_goal === 8, '6 · …the calibration delta (21 − 27) and the goal', s1.payload);

    // calibration: −6 is outside ±3 → which objective drove the gap? (AO5 first: |15−19| > |6−8|)
    ok(/6 marks lower/.test(last(w)) && /which objective drove the gap/.test(last(w)), '6 · calibration ±3 on /40: six marks under → asked what drove it', last(w).slice(0, 200));
    const calibChips = w.chips().map((c) => c.textContent);
    ok(calibChips[0] === 'Content and Organisation' && calibChips[1] === 'Technical Accuracy', '6 · the biggest gap is offered first', calibChips);
    await tapNamed(w, /^Content and Organisation$/);
    await continueAll(w);
    ok(/\*\*How am I going\?\*\*/.test(all(w)) && /\*\*Where to next\?\*\*/.test(all(w)), '6 · How am I going? / Where to next?');
    ok(/Against your goal of \*\*Grade 8\*\*/.test(all(w)), '6 · …against their goal');
    ok(/your one target for the exam/.test(last(w)) && w.deps._walkSlot.armed, '6 · it ends on THEIR target — the ask is live');
    await say(w, 'Fix every comma splice before the climax.');
    ok(w.rows.get(F('target')) === 'Fix every comma splice before the climax.', '6 · the target is filed verbatim');
    ok(/top of Step 31/.test(last(w)) && !!chip(w, /Change my answers/), '6 · the wrap says where the target goes and leaves a way back in');
    const s2 = w.saves[1] || {};
    ok(s2.payload && s2.payload.target === 'Fix every comma splice before the climax.' && s2.payload.calibration_delta === undefined,
        '6 · the second save carries the target and NO second calibration delta', s2.payload);
    ok(w.progress[w.progress.length - 1] === 4, '6 · the sidebar ends on Sophia’s marking', w.progress);
    ok(w.sends.length === 1, '⭐ 4 · still exactly ONE API call for the whole lesson', w.sends.length);

    // ── 7 · bad replies file nothing ─────────────────────────────────────────────────────────────────────────
    for (const [label, reply] of [
        ['a reply with no Technical Accuracy call', GOOD.split('\n').filter((l) => !/ao6=/.test(l)).join('\n')],
        ['a Content and Organisation call with no half', GOOD.replace('ao5=4|lower|bottom', 'ao5=4|bottom')],
        ['a call to a level that does not exist', GOOD.replace('ao6=2|top', 'ao6=7|top')],
    ]) {
        const v = world({ prefill: prefillThrough('ready') });
        v.ctl.tryResume();
        await settle();
        await tapNamed(v, /Give me my marks/);
        v.resolveApi(reply);
        await settle();
        ok(!v.rows.get(F('mark')), '⭐ 7 · ' + label + ' files NO mark');
        ok(v.saves.length === 0, '7 · …saves nothing');
        ok(!!chip(v, /Give me my marks/), '7 · …and leaves a chip to try again (§4d)');
    }
    {
        const v = world({ prefill: prefillThrough('ready') });
        v.ctl.tryResume();
        await settle();
        await tapNamed(v, /Give me my marks/);
        v.resolveApi(null);
        await settle();
        ok(/your own marking is saved/.test(all(v)) && !!chip(v, /Try again/), '7 · a failed call says so and offers Try again; nothing is filed');
        const z = world({ prefill: prefillThrough('ready') });
        z.ctl.tryResume(); await settle();
        await tapNamed(z, /Give me my marks/);
        z.resolveApi(GOOD.replace('ao6=2|top', 'ao6=0'));
        await settle();
        ok(/^Nothing creditable yet — 0 \/ 16/.test(z.rows.get(F('fb-ao6')) || ''), '7 · a 0 call is a real call: nothing creditable, 0/16');
    }

    // ── 8 · a reload MID-CLIMB ────────────────────────────────────────────────────────────────────────────────
    {
        const ls2 = new Map();
        const a = world({ ls: ls2 });
        a.ctl.forceStart(); await settle(); await continueAll(a);
        await tapNamed(a, /^Grade 7$/);
        await continueAll(a);
        await tapNamed(a, /^Mine is better than this$/);   // AO5, Level 1 passed
        await continueAll(a);
        // the page reloads: same browser (localStorage), same document, same transcript
        const pre = {}; a.rows.forEach((v, k) => { if (v) pre[k] = v; });
        const b = world({ ls: ls2, prefill: pre, history: a.deps.canvasChatHistory });
        const ladderResumed = b.ladder.tryResume();          // the boot asks the ladder first …
        const hostResumed = b.ctl.tryResume();               // … then the host
        await settle(); await settle();
        ok(ladderResumed === true, '8 · the ladder resumes its own climb');
        ok(hostResumed === true && b.ctl.active, '8 · the host claims the lesson but stays QUIET (the climb is the ladder’s)');
        ok(/\*\*Level 2\b/.test(last(b)), '⭐ 8 · the student lands back on Level 2 — where they were, not Level 1', last(b).slice(0, 80));
        await tapNamed(b, /^This is where mine sits$/);
        let g = 0;
        while (chip(b, /I met this one|Not this one/) && g++ < 30) await tapNamed(b, /Not this one/);
        await tapNamed(b, /^Upper Level/);
        await tapNamed(b, /^Bottom of this level$/);
        await say(b, 'Clear but plain.');
        ok(b.rows.get(F('ao5-mark')) === '10 / 24', '8 · the resumed climb files its mark (bottom of Upper Level 2 = 10)', b.rows.get(F('ao5-mark')));
        ok(/You marked \*\*Content and Organisation\*\* at \*\*10 \/ 24\*\*/.test(all(b)) && !!chip(b, /^Mark Technical Accuracy →$/),
            '⭐ 8 · its onDone was lost in the reload — the host is reached through registerHost and moves on (never a dead screen)');
    }

    // ── 9 · a NEW DEVICE: nothing in localStorage, the document is the authority ─────────────────────────────────
    {
        const n0 = world({});
        ok(n0.ctl.tryResume() === false && !n0.ctl.active, '9 · never spoken here, nothing banked → entry starts it (resume declines)');
        const n1 = world({ prefill: prefillThrough('ao6') });
        const h0 = n1.deps.canvasChatHistory.length;
        n1.ctl.tryResume(); await settle();
        ok(!!chip(n1, /^Mark Technical Accuracy →$/), '⭐ 9 · AO5 marked on another device → lands on Technical Accuracy, one chip in', n1.chips().map((c) => c.textContent));
        ok(n1.deps.canvasChatHistory.length === h0, '9 · …and the re-served prompt is DRAWN, never stored (§4c.7)');
        const n2 = world({ prefill: prefillThrough('ready') });
        n2.ctl.tryResume(); await settle();
        ok(!!chip(n2, /Give me my marks/) && n2.sends.length === 0, '9 · both marked, no marking yet → a chip, never a call nobody asked for');
        const n3 = world({ prefill: prefillThrough('target') });
        n3.ctl.tryResume(); await settle();
        ok(/your one target for the exam/.test(last(n3)) && n3.deps._walkSlot.armed, '9 · marked by Sophia, no target → the target ask, live');
        ok(n3.deps.state.cwTrialScore && n3.deps.state.cwTrialScore.score === 27, '9 · …and her /40 is rebuilt from the page for the ring');
        const n4 = world({ prefill: prefillThrough('done') });
        n4.ctl.tryResume(); await settle();
        ok(/This assessment is finished/.test(last(n4)) && !!chip(n4, /Change my answers/), '9 · finished → the wrap, with a way back in');
        const orient = (() => { const t = world({}); t.ctl.forceStart(); return t; })();
        await settle();
        const heard = orient.deps.canvasChatHistory.filter((t) => t.role === 'assistant').slice(0, 1);
        const n5 = world({ history: heard.slice() });
        ok(n5.ctl.tryResume() === true, '9 · part of the opening heard on another device → it carries on (#897)');
        await settle();
        ok(n5.bubbles.length >= 1 && !/This is the \*\*final assessment\*\*/.test(n5.bubbles[0] || ''), '9 · …from the first UNSEEN message, not from the top', n5.bubbles[0]);
    }

    // ── 10 · change my answers · a missing scheme · a typed message with no ask ─────────────────────────────────────
    {
        const r = world({ prefill: prefillThrough('done') });
        r.ctl.tryResume(); await settle();
        await tapNamed(r, /Change my answers/);
        await continueAll(r);
        ok(/\*\*Level 1\b/.test(last(r)), '10 · Change my answers climbs again from Level 1, as an examiner would');
        const m = world({ schemes: {} });
        m.ctl.forceStart(); await settle(); await continueAll(m);
        await tapNamed(m, /^Grade 9$/);
        ok(/could not load the mark scheme/.test(all(m)) && !!chip(m, /Try again/), '10 · a missing mark scheme is said in words, with a way forward (§4d)');
        const q = world({ prefill: prefillThrough('ao6') });
        q.ctl.tryResume(); await settle();
        await say(q, 'what do I do now?');
        ok(!!chip(q, /^Mark Technical Accuracy →$/) || q.deps._walkSlot.armed, '10 · a typed message with no ask re-serves the stage (the no-ask guard)');
    }

    console.log('\n' + asserts.pass + ' passed, ' + asserts.fail + ' failed');
    if (fail) { console.error('❌ cw-final-sim-harness FAILED'); process.exit(1); }
    console.log('✅ cw-final-sim-harness passed — bottom-up best fit on the board’s words, one call, one resolver for both marks,');
    console.log('   the reveal and the target, the ring, a reload mid-climb, a new device, and no dead screen anywhere.');
}

// A document as it stands at each stage (what a new device would find).
function prefillThrough(stage) {
    const p = { [F('goal')]: 'Grade 8', [F('ao5-level')]: 'Level 3 · Lower Level 3 · Top of this level', [F('ao5-met')]: '✓ x', [F('ao5-mark')]: '15 / 24', [F('ao5-reason')]: 'r5' };
    if (stage === 'ao6') return p;
    Object.assign(p, { [F('ao6-level')]: 'Level 2 · Middle of this level', [F('ao6-met')]: '✓ y', [F('ao6-mark')]: '6 / 16', [F('ao6-reason')]: 'r6' });
    if (stage === 'ready') return p;
    Object.assign(p, {
        [F('fb-ao5')]: 'Level 4 · Lower Level 4 · bottom of the band — 19 / 24 — c', [F('fb-ao6')]: 'Level 2 · top of the level — 8 / 16 — c',
        [F('strength')]: 's', [F('priority')]: 'p', [F('mark')]: 'Grade 7 (27/40 · 68%) for the final assessment', [F('gap')]: 'g',
    });
    if (stage === 'target') return p;
    p[F('target')] = 'my target';
    return p;
}

main().catch((e) => { console.error('cw-final-sim-harness THREW —', e && e.stack); process.exit(1); });
