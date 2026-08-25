#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-trial1-gate.js — the contracts around Trial 1 that a walk sim cannot see.
 * (v7.20.551, CW trials slice 4. Behaviour is gated by bin/cw-trial1-sim-harness.js.)
 *
 * WHY THIS EXISTS. Trial 1's criteria are not ours to invent: they are the seven scene elements
 * the student was taught in Step 9, and the trial must ask about them in the SAME words. Nothing
 * in the walk can notice if that copy drifts — the sim would happily prove a perfectly-behaved
 * walk asking about criteria the course never taught. So the binding is asserted here, along with
 * the three things the rewritten protocol must never do again and the wiring a walk needs to exist
 * at all.
 *
 * THE SEVEN WIRING POINTS are checked by name because a walk missing one ships DEAD (the .490
 * incident) — and it ships dead SILENTLY, which is the only reason this is a gate and not a
 * comment.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let fails = 0;
const ok = (label, cond, got) => {
    console.log((cond ? '  ✓ ' : '  ✗ ') + label + (cond || got === undefined ? '' : '   got: ' + JSON.stringify(got)));
    if (!cond) fails++;
};

const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const PROTO_PATH = 'protocols/shared/creative-writing/CW-TRIAL-01-story-coherence.md';
const PROTO = fs.readFileSync(path.join(ROOT, PROTO_PATH), 'utf8');

const { braceSliceFrom } = require('./walk-sim-lib');
const elIdx = CORE.indexOf('const CW_SCENE_ELEMENTS = [');
if (elIdx < 0) { console.log('cw-trial1-gate: CW_SCENE_ELEMENTS not found in wml-core.js'); process.exit(1); }
// eslint-disable-next-line no-eval
const ELEMENTS = eval(braceSliceFrom(CORE, elIdx, '[', ']').text);
// v7.20.559 (#431): the trial marks the seven scene parts PLUS technical accuracy (out of 2).
const accIdx = CORE.indexOf('const CW_TRIAL1_ACCURACY = {');
if (accIdx < 0) { console.log('cw-trial1-gate: CW_TRIAL1_ACCURACY not found in wml-core.js'); process.exit(1); }
// eslint-disable-next-line no-eval
const ACCURACY = eval('(' + braceSliceFrom(CORE, accIdx, '{', '}').text + ')');
const TRIAL_ELEMENTS = ELEMENTS.concat([ACCURACY]);

// The heal's source, sliced once — used by two sections below.
const healIdx = SRC.indexOf('const tryHealCwTrial1Doc = async () => {');
const HEAL = healIdx === -1 ? '' : braceSliceFrom(SRC, healIdx, '{', '}').text;

// ── 1. THE CRITERIA ARE WHAT THE COURSE TAUGHT ────────────────────────────────────────────────
console.log('\nThe trial asks about the seven elements Step 9 taught, in Step 9\'s own words:');
ok('there are seven of them', ELEMENTS.length === 7, ELEMENTS.length);
ok('⭐ …plus ONE technical-accuracy dimension out of 2, with its own Level 1 text (#431, Neil 2026-08-25) — /28 → /30',
    ACCURACY.id === 'accuracy' && ACCURACY.outOf === 2 && ACCURACY.ao === 'AO6' && /some mistakes are common/i.test(ACCURACY.l1) && /^A reader can follow/.test(ACCURACY.l1)
    && /accurate/i.test(ACCURACY.strong) && TRIAL_ELEMENTS.reduce((a, e) => a + (e.outOf || 4), 0) === 30);
ok('…and it carries a worked example + more examples like every other ask (ladder rungs 0–1)',
    typeof ACCURACY.example === 'string' && ACCURACY.example.length > 40 && Array.isArray(ACCURACY.more) && ACCURACY.more.length >= 2);
ok('in the order the scene runs',
    ELEMENTS.map(e => e.id).join(',') === 'hook,setup,reaction,epiphany,proaction,climax,denouement',
    ELEMENTS.map(e => e.id).join(','));
// The Step-9 template writes non-ASCII as \uXXXX escapes while the element list holds the real
// character, so the window is DECODED before the diff — comparing two encodings of the same
// sentence would report drift that is not there, and (worse) hide drift that is.
const deEscape = (t) => t.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
ELEMENTS.forEach((e) => {
    // The Step-9 template writes each row as outlineRowHTML({... prompt: '…' }, 'cw-step-8-<id>').
    const rowIdx = SRC.indexOf("}, 'cw-step-8-" + e.id + "')");
    const row = rowIdx > 0 ? deEscape(SRC.slice(Math.max(0, rowIdx - 400), rowIdx)) : '';
    const esc = e.prompt.replace(/'/g, "\\'");
    ok('“' + e.label + '” is BYTE-IDENTICAL to the row the student filled in Step 9',
        rowIdx > 0 && row.indexOf("prompt: '" + esc + "'") !== -1, e.prompt);
});
ok('each one names the Step-9 row its plan lives in, as a LITERAL key (§5d — no runtime string maths)',
    ELEMENTS.every(e => e.planFid === 'cw-step-8-' + e.id), ELEMENTS.map(e => e.planFid));
ok('…and every one of those rows is really built by the Step-9 template',
    ELEMENTS.every(e => SRC.indexOf("}, '" + e.planFid + "')") !== -1));
ok('every element says what a STRONG one does (the criterion they judge against)',
    ELEMENTS.every(e => e.strong && e.strong.length > 40));
ok('every element carries a worked example for the ask itself (ladder rung 0)',
    ELEMENTS.every(e => e.example && e.example.length > 40));
ok('…and two more for the [More examples] rung (rung 1)',
    ELEMENTS.every(e => Array.isArray(e.more) && e.more.length === 2));
{
    // §5c-i's quotation rule cuts both ways: a claim about a text's WORDS must quote them, so an
    // example that opens quotation marks is promising the edition's exact words. These examples
    // are deliberately story BEATS, which need no quotation — and must therefore not fake one.
    const quoted = [];
    ELEMENTS.forEach((e) => {
        [e.example].concat(e.more).forEach((x) => {
            const m = /[“"]([^”"]{25,})[”"]/.exec(x);
            if (m) quoted.push(e.id + ': ' + m[1].slice(0, 40));
        });
    });
    ok('no example fakes a long quotation — they are beats, which is what makes them verifiable',
        quoted.length === 0, quoted);
}
{
    const banned = /\b(artifact|payload|protocol|module|component|the system|the platform|marker|walk)\b/i;
    const hits = [];
    ELEMENTS.forEach((e) => {
        [e.strong, e.example].concat(e.more).forEach((x) => { if (banned.test(x)) hits.push(e.id + ': ' + (banned.exec(x) || [])[0]); });
    });
    ok('no insider words anywhere a student reads (root §5c-ii(a))', hits.length === 0, hits);
}

// ── 2. THE REWRITTEN PROTOCOL — the three laws the old stub broke ─────────────────────────────
console.log('\nThe protocol no longer breaks the three laws it was written before:');
ok('⛔ it never asks the student for their draft — the paste-wall law (WML §3)',
    !/ask the student to share|ask the student for (their|the) draft|paste (it|your)/i.test(PROTO));
ok('…and says out loud that the draft is already on the page',
    /already on the page|sent it with the marking turn/i.test(PROTO));
{
    // A PROHIBITION and the OFFENCE read the same to a naive regex ("invent a score out of five"
    // vs "score each criterion out of five"), so every mention is classified line by line. The
    // old stub's instruction was "Score each criterion on a scale of 1-5".
    const scaleLines = PROTO.split('\n').filter(l => /scale|out of five|1-5/i.test(l));
    const instructing = scaleLines.filter(l => !/invent|never|do not|don’t|must not/i.test(l));
    ok('⛔ the invented 1–5 scale is gone — every mention of one is a prohibition (root §5c)',
        instructing.length === 0, instructing);
}
ok('⛔ it does not hand the whole judgment to the model — the student marks first (PEDAGOGY §19)',
    /YOU DO NOT RUN THIS LESSON/.test(PROTO));
ok('…and the model is forbidden from stating a mark, because the arithmetic is code\'s',
    /never state a mark|give a mark[^.]{0,40}grade in your own words/i.test(PROTO)
    && /arithmetic\s+the system does|worked out from your/i.test(PROTO));
ok('the marker contract is stated, all eight lines (seven parts + accuracy)',
    TRIAL_ELEMENTS.every(e => PROTO.indexOf('@TRIAL_VERDICT[' + e.id + '=') !== -1));
ok('…in the examiner-ladder tokens (#424), with the legacy met|partly|not contract gone',
    /none\|l1_low\|l1_top\|l2_low\|l2_top/.test(PROTO) && !/met\|partly\|not/.test(PROTO));
ok('…and it says all eight verdict lines are required', /All eight verdict lines must be present/i.test(PROTO));
ok('…and carries the strength + priority markers the document rows read (#419)',
    /@TRIAL_STRENGTH\[/.test(PROTO) && /@TRIAL_PRIORITY\[/.test(PROTO));
ok('it scopes the judgment to story coherence, not SPaG (that is the final assessment\'s job)',
    /Not spelling, not punctuation|story coherence only/i.test(PROTO));
{
    // The generic trial About text promises "Sophia will analyse your writing" — the lesson
    // Trial 1 no longer is. Its template branch must carry its own About, and the heal must
    // rewrite the old sentence in existing docs.
    const t1Idx = SRC.indexOf("if (stepDef.trial === 1) {");
    const genIdx = SRC.indexOf('Sophia will analyse your writing', t1Idx);
    ok('Trial 1\'s About text is its own — the generic "Sophia will analyse" line sits AFTER its branch returns',
        t1Idx > 0 && genIdx > t1Idx);
    ok('…and the heal rewrites the superseded sentence in existing docs',
        /Sophia will analyse your writing/.test(HEAL || ''));
}
{
    // ⭐ THE RETAINED-SOURCE LAW (WML §5). The manifest loads this file WHOLE into the model's
    // context, and a model that can see the teaching text will narrate it — which is exactly how
    // the Piece-2 port shipped a lesson the student was supposed to walk. The criteria, the worked
    // examples and the asks live in code; none of them may appear here.
    const leaked = [];
    ELEMENTS.forEach((e) => {
        if (PROTO.indexOf(e.strong) !== -1) leaked.push(e.id + ' (strong)');
        if (PROTO.indexOf(e.example) !== -1) leaked.push(e.id + ' (example)');
        e.more.forEach((m, i) => { if (PROTO.indexOf(m) !== -1) leaked.push(e.id + ' (more ' + i + ')'); });
    });
    ok('⭐ NO code-served teaching text is retained in the loaded protocol (WML §5)', leaked.length === 0, leaked);
}

// ── 3. THE DOCUMENT — the essay-doc architecture, scaled to the trial (#419) ──────────────────
console.log('\nThe trial document carries the essay-doc architecture, and everything of Sophia\'s is locked:');
ok('ONE producer builds the judgement block, called by the TEMPLATE and the HEAL — healed docs cannot drift from born docs',
    (SRC.match(/_cwTrial1JudgementBlock\(/g) || []).length >= 3 && /function _cwTrial1JudgementBlock\(/.test(SRC),
    (SRC.match(/_cwTrial1JudgementBlock\(/g) || []).length);
ok('…and one for Sophia\'s block', (SRC.match(/_cwTrial1SophiaBlock\(\)/g) || []).length >= 3 && /function _cwTrial1SophiaBlock\(\)/.test(SRC),
    (SRC.match(/_cwTrial1SophiaBlock\(\)/g) || []).length);
ok('the seven verdict rows are BUILT FROM the element list, never hand-typed beside it',
    /_els\.map\(function \(e\) \{[\s\S]{0,200}'cw-trial-1-' \+ e\.id/.test(SRC));
ok('her PER-ELEMENT verdict rows exist — the per-question-feedback analogue (#419)',
    /'cw-trial-1-fb-' \+ e\.id/.test(SRC));
ok('…locked, and derived from the same element list',
    /locked: true \}, 'cw-trial-1-fb-' \+ e\.id\)/.test(SRC));
ok('Overall Feedback carries Key Strength + Priority for Draft 2, both locked',
    /label: 'Key Strength'[^)]*locked: true[^)]*\}, 'cw-trial-1-strength'\)/.test(SRC)
    && /label: 'Priority for Draft 2'[^)]*locked: true[^)]*\}, 'cw-trial-1-priority'\)/.test(SRC));
ok('the mark row exists', /'cw-trial-1-mark'/.test(SRC));
ok('the gap row exists', /'cw-trial-1-gap'/.test(SRC));
ok('⭐ both are LOCKED — a mark a student can retype is not a mark',
    /label: 'Mark'[^)]*locked: true[^)]*\}, 'cw-trial-1-mark'\)/.test(SRC)
    && /label: 'Where you differed'[^)]*locked: true[^)]*\}, 'cw-trial-1-gap'\)/.test(SRC));
ok('⛔ every Sophia section is response-typed, never feedback-typed — the feedback type recomputes '
    + 'readonly from _feedbackEditable() at render and would UNLOCK her verdicts in edit mode',
    /sectionHTML\('response', 'Sophia’s Verdict', false, null/.test(SRC)
    && /sectionHTML\('response', 'Overall Feedback', false, null/.test(SRC)
    && /sectionHTML\('response', 'Story Coherence Mark', false, null/.test(SRC));
ok('the walk writes the mark to the row the template builds (one key, both sides — §5d)',
    /writeRow\('cw-trial-1-mark'/.test(SRC) && /writeRow\('cw-trial-1-gap'/.test(SRC));
// v7.20.554 (#424 / PEDAGOGY §33.9) — the closing-target section.
ok('the closing-target row exists, from ONE producer used by template AND heal',
    /function _cwTrial1TargetBlock\(\)/.test(SRC) && (SRC.match(/_cwTrial1TargetBlock\(\)/g) || []).length >= 4,
    (SRC.match(/_cwTrial1TargetBlock\(\)/g) || []).length);
ok('…EDITABLE (it is the student\'s sentence, never Sophia\'s) — no locked flag on the target row',
    /outlineRowHTML\(\{ id: 'target', label: 'My Target', prompt: [^}]*\}, 'cw-trial-1-target'\)/.test(SRC)
    && !/locked: true \}, 'cw-trial-1-target'\)/.test(SRC));
ok('…the walk banks the student\'s target into it', /writeRow\('cw-trial-1-target'/.test(SRC));
ok('…and the heal inserts it into existing docs', /hasRow\('cw-trial-1-target'\)/.test(HEAL || ''));
ok('the NEXT draft pins the target at the top of its page (tryFillCwDraftTarget in the load chain)',
    /const tryFillCwDraftTarget = async/.test(SRC)
    && /tryHealCwTrial1Doc\(\)\)\.then\(\(\) => tryFillCwDraftTarget\(\)\)/.test(SRC));
ok('…derived from CW_STEPS like cwTrialSource — never a hand-written draft→trial map',
    /function cwDraftTrialSource\(task\)/.test(CORE) && /if \(s\.draft\) return null;/.test(CORE));
ok('…and fills the per-element + overall rows from the marking reply',
    /writeRow\('cw-trial-1-fb-' \+ e\.id/.test(SRC)
    && /writeRow\('cw-trial-1-strength'/.test(SRC) && /writeRow\('cw-trial-1-priority'/.test(SRC));

console.log('\nExisting documents are HEALED to this shape (the baked-scaffold law — Neil\'s doc predated .551):');
ok('the heal exists', !!HEAL);
ok('…and is wired into the load chain AFTER the draft filler',
    /tryFillCwTrialDraft\(\)\)\.then\(\(\) => tryHealCwTrial1Doc\(\)\)/.test(SRC));
ok('…gated to trial 1 only, and never in review mode',
    /cwStepDef\?\.trial !== 1/.test(HEAL) && /state\.reviewMode/.test(HEAL));
ok('…anchored on data-field-id, which survives every round-trip',
    /data-field-id="cw-trial-1-hook"/.test(HEAL) || /hasRow\('cw-trial-1-hook'\)/.test(HEAL));
ok('…it calls the SAME two producers the template uses',
    /_cwTrial1JudgementBlock\(\) \+ _cwTrial1SophiaBlock\(\)/.test(HEAL));
ok('…the old placeholder section is removed only when UNTOUCHED — a student\'s typing is never deleted',
    /placeholderOnly/.test(HEAL) && /Your draft will be assessed here/.test(HEAL));
ok('…the write runs under _migrationActive', /_migrationActive = true;/.test(HEAL));
ok('⭐ …and it BACKFILLS verdicts from the walk sidecar into EMPTY rows only — work given while the '
    + 'rows did not exist arrives; a hand-edited row is never clobbered',
    /backfilled/.test(HEAL) && /if \(cur\) return;/.test(HEAL));
ok('Trial 1\'s sidebar names what this trial actually does',
    /CW_SIDEBAR_STEPS\['trial_1'\] = \[[\s\S]{0,300}Judge the Seven Parts/.test(CORE));
ok('…and trials 2–6 no longer share it (six trials looked identical because they did)',
    (CORE.match(/CW_SIDEBAR_STEPS\['trial_[2-6]'\] = CW_SIDEBAR_STEPS\['trial_generic'\];/g) || []).length === 5,
    (CORE.match(/CW_SIDEBAR_STEPS\['trial_[2-6]'\] = CW_SIDEBAR_STEPS\['trial_generic'\];/g) || []).length);

// ── 4. THE SEVEN WIRING POINTS — a walk missing one ships DEAD, and silently ───────────────────
console.log('\nAll seven wiring points name the controller (the .490 incident):');
ok('1 · the dispatcher arm', /state\.task === 'cw_trial_1' && _cwTrial1Ctl\.active && _inboundIsAnswer/.test(SRC));
ok('2 · the revive map', /cw_trial_1: _cwTrial1Ctl,\s*\n\s*\};\s*\n\s*const _cwCtl = _cwCtls\[state\.task\];/.test(SRC));
ok('3 · the walk registry', /registerCwWalkCtls\(\[[^\]]*_cwTrial1Ctl\]\)/.test(SRC));
ok('4 · the onReply fan-out', /_cwTrial1Ctl\.onReply\(reply\);/.test(SRC));
ok('5 · the start-miss fallback map', /t === 'cw_trial_1' \? _cwTrial1Ctl/.test(SRC));
ok('6 · the nudge AND probe maps (both)', (SRC.match(/cw_trial_1: _cwTrial1Ctl,/g) || []).length === 3,
    (SRC.match(/cw_trial_1: _cwTrial1Ctl,/g) || []).length);
ok('7 · the tp export, for boot resume', /cwTrial1Ctl: _cwTrial1Ctl,/.test(SRC));
ok('+ fresh entry starts it in code — no protocol greeting to wait for (§4)',
    /state\.task === 'cw_trial_1' && !state\.reviewMode && tp\.cwTrial1Ctl/.test(SRC));
ok('+ boot resume calls tryResume on it', /state\.task === 'cw_trial_1' && tp\.cwTrial1Ctl\) tp\.cwTrial1Ctl\.tryResume\(\)/.test(SRC));
ok('+ chat-clear restarts the walk instead of summoning an API greeting',
    /state\.task === 'cw_trial_1'\) \{[\s\S]{0,400}_cwTrial1Ctl\.reset\(\); _cwTrial1Ctl\.forceStart\(\)/.test(SRC));

// ── 5. ONE LADDER, NOT TWO ────────────────────────────────────────────────────────────────────
console.log('\nThe mark rides the ladder this repo already has:');
ok('the trial calls the canonical _ladderGrade', /grade: _ladderGrade\(pct\)/.test(SRC));
{
    const ctlIdx = SRC.indexOf('const _cwTrial1Ctl = (function () {');
    const CTL = ctlIdx < 0 ? '' : braceSliceFrom(SRC, ctlIdx, '(', ')').text;
    ok('⛔ …and defines no grade table of its own (two ladders is how they drift)',
        !/\bpct >= 85\b|\bGRADE_BOUNDARIES\b|85 \? 9/.test(CTL));
    ok('the marks are the examiner ladder\'s (#424): none=0 · l1_low=1 · l1_top=2 · l2_low=3 · l2_top=4',
        /MARKS = \{ none: 0, l1_low: 1, l1_top: 2, l2_low: 3, l2_top: 4 \}/.test(CTL));
    ok('…summed over each element\'s outOf — /30 is a SUM, never a hardcoded 28 or 30 (#431)',
        /max \+= outOf\(e\)/.test(CTL) && !/\/ 28\b|\/ 30\b|\* 4\b/.test(CTL));
    ok('⭐ a 1-mark level offers only Yes / Not yet — no half-marks (#431)',
        /verdicts: perLevel\(e\) === 1 \? \['all', 'not'\] : null/.test(CTL)
        && /if \(verdict === 'some' && perLevel\(e\) === 1\) return;/.test(CTL));
    ok('…the marking prompt\'s marker list is DERIVED from the element list, never hand-typed (#431)',
        /els\(\)\.map\(function \(e, k\) \{[\s\S]{0,120}@TRIAL_VERDICT\[' \+ e\.id/.test(CTL) && !/@TRIAL_VERDICT\[setup=/.test(CTL));
    ok('⭐ every verdict carries a REWRITE EXAMPLE — their own moment at Level 2 (#434; root: every penalty carries a fix-example)',
        /@TRIAL_EXAMPLE\[' \+ e\.id \+ '\]/.test(CTL) && /examples\[id\] = x/.test(CTL) && /For example: /.test(CTL)
        && /@TRIAL_EXAMPLE\[hook\]/.test(PROTO));
    ok('⭐ the mark reaches STUDENT-DATA via the canvas-save score piggyback, gated to this task + project (#435)',
        /function publishTrialScore\(\)/.test(CTL) && /state\.cwTrialScore = \{ task: 'cw_trial_1', projectId/.test(CTL)
        && /snap\.task\.startsWith\('cw_trial_'\) && state\.cwTrialScore/.test(SRC)
        && /state\.cwTrialScore\.projectId === \(state\.cwProjectId \|\| ''\)/.test(SRC));
    ok('⭐ #437 the P1 shape: grade goal upfront (7/8/9, banked) · calibration question (±tolerance, gap parts as chips) · How am I going? / Where to next? · THEN the target',
        /function serveGoalAsk/.test(CTL) && /GRADE_GOALS = \[7, 8, 9\]/.test(CTL) && /writeRow\('cw-trial-1-goal'/.test(CTL)
        && /function serveCalibration/.test(CTL) && /CALIB_TOLERANCE = 2/.test(CTL) && /Something else/.test(CTL)
        && /How am I going\?/.test(CTL) && /Where to next\?/.test(CTL)
        && /onDone: function \(\) \{ serveTargetAsk\(\); \}/.test(CTL) && /saveTrialResult\(\{ withDelta: true \}\);\s*serveCalibration\(\);/.test(CTL));
    ok('…every one of those turns is CODE-served — still exactly one API call (#437, §4 programmatic-first)',
        (CTL.match(/sendCanvasMessage\(\);/g) || []).length === 2);
    ok('…and the goal row is in the template AND the heal', /'cw-trial-1-goal'\)/.test(SRC) && /cw-trial-1-goal/.test(HEAL || ''));
    ok('⭐ the piggyback also carries strength_1 / target_1 / target_2 + cw_project_id, so the Feedback section, Portfolio and Report can show the words, not just the number (#439)',
        /strength_1: st\.strengthLine/.test(CTL) && /target_2: st\.target/.test(CTL)
        && /strength_1:\s+state\.cwTrialScore\.strength_1/.test(SRC) && /cw_project_id:\s+state\.cwTrialScore\.projectId/.test(SRC)
        && /publishTrialScore\(\);\s*\/\/ v7\.20\.565/.test(CTL));
    ok('…and the orientation names BOTH dimensions with their codes and the board caveat (Neil 2026-08-25)',
        /AO5: Content and Organisation/.test(CTL) && /AO6: Technical Accuracy/.test(CTL) && /Edexcel IGCSE numbers them AO4 and AO5/.test(CTL));
    ok('…and the heal gives a pre-.559 document both accuracy rows', /cw-trial-1-accuracy/.test(HEAL || '') && /cw-trial-1-fb-accuracy/.test(HEAL || ''));
    ok('the walk spends ONE call on marking and one only on an explicit ask for help',
        (CTL.match(/sendCanvasMessage\(\);/g) || []).length === 2,
        (CTL.match(/sendCanvasMessage\(\);/g) || []).length);
    // v7.20.557 (#427a, WML §4c.10): chat points → document scrolls, to the surface the student
    // must ACT ON — the marking card (draft-section fallback for an unhealed doc).
    // v7.20.558 (#430): the levels left the document, so the surface the student ACTS ON in the
    // document is the JUDGEMENT ROW — ask and sentence both scroll there (walk/pad/doc in sync).
    ok('every element ask scrolls the document to the JUDGEMENT ROW of the current element (§4c.10), on the ONE scroll convention',
        /scrollToJudgementRow\(e\);/.test(CTL) && /_swmlScrollToTop\(target\)/.test(CTL)
        && /querySelector\('\[data-field-id="' \+ fid\(e\.id\) \+ '"\]'\)/.test(CTL));
    ok('…and the banked-sentence ask scrolls there too, so the walk, the pad and the document scroll in sync (Neil #430)',
        (CTL.match(/scrollToJudgementRow\(e\);/g) || []).length >= 2);
}

// ── 7. THE LADDER PAD (#426 → #430) — the levels are a floating PAD, never chat bubbles ──────
console.log('\nThe levels live on a floating pad, all visible at once:');
{
    const ctlIdx2 = SRC.indexOf('const _cwTrial1Ctl = (function () {');
    const CTL2 = ctlIdx2 < 0 ? '' : braceSliceFrom(SRC, ctlIdx2, '(', ')').text;
    const SB = fs.readFileSync(path.join(ROOT, 'frontend/wml-section-block.js'), 'utf8');
    ok('a `ladder` section type exists as a real nodeView', /if \(type === 'ladder'\)/.test(SB));
    ok('…its card is FIREWALLED from ProseMirror\'s observer, wrapper attrs included (§PM law)',
        /ui === mutation\.target \|\| ui\.contains\(mutation\.target\)/.test(SB)
        && /mutation\.type === 'attributes' && mutation\.target === dom/.test(SB));
    ok('⭐ …and stopEvent hands its BUTTONS their own events — PM owns keydown/mousedown for the '
        + 'editable view, which is how the tutor-comment box became untypable (v7.20.197)',
        /stopEvent: \(event\) => \{[\s\S]{0,160}ui\.contains\(t\)/.test(SB));
    ok('the card is filled on every (re)mount, like the sign-off UI',
        /window\.WML\.renderTrialLadderUI/.test(SB) && /window\.WML\.renderTrialLadderUI = renderTrialLadderInline/.test(SRC));
    ok('…breaker-guarded like every other derived card (PM law rule 5)',
        /_derivedCardFillOk\('ladder'\)/.test(SRC));
    ok('⭐⭐ every level the student has judged STAYS ON THE CARD — Neil\'s actual complaint (#426)',
        /shown: show/.test(CTL2) && /show = show && verdict === 'all';/.test(CTL2));
    ok('…rendered NEWEST ON TOP, his words ("it\'ll sit above the criteria for the first level")',
        /shown\)[\s\S]{0,40}\.reverse\(\)/.test(SRC) || /\.slice\(\)\.reverse\(\)/.test(SRC));
    ok('…and every judged level can be re-judged', /onRevise: function/.test(CTL2) && /Change my answer/.test(SRC));
    ok('⭐ re-judging DROPS every level above it and takes back the mark',
        /if \(L\.n >= n\) delete st\.levels\[e\.id\]\[L\.n\]/.test(CTL2) && /delete st\.marks\[e\.id\]/.test(CTL2));
    ok('⛔ the level chips are GONE from the chat — one control surface, not two',
        !/CH_ALL|CH_BACK|CH_L1TOP/.test(CTL2));
    ok('N LEVELS BY CONSTRUCTION — the card renders whatever it is handed, so literature\'s six '
        + 'need no second card (PEDAGOGY §33.13)',
        /LEVEL_DEFS\.forEach/.test(CTL2) && !/levels\[2\]|levels\[1\]/.test(SRC.slice(SRC.indexOf('function renderTrialLadderInline'), SRC.indexOf('function renderTrialLadderInline') + 6000)));
    ok('the levels are DERIVED, never baked into the saved document (no fossil — §4c.7)',
        !/cw-trial-1-level/.test(SRC));
    // v7.20.558 (#430): the levels moved OUT of the document into a floating pad.
    ok('⛔ the template no longer bakes a `ladder` section (#430 — the card left the document)',
        !/sectionHTML\('ladder'/.test(SRC) && !/_cwTrial1LadderBlock/.test(SRC));
    ok('…and the heal REMOVES the ladder section a .556/.557 document still carries',
        /querySelectorAll\('\[data-section-type="ladder"\]'\)\.forEach\(\(sec\) => \{ sec\.remove\(\)/.test(HEAL || ''));
    ok('the renderer targets the PAD first, the document section only as the un-healed fallback',
        /document\.querySelector\('\.swml-ladder-pad \.swml-ladder-ui'\)/.test(SRC));
    ok('the pad rides the FLOATING shell + the shared drag/resize, with an open hook AND a close hook',
        /swml-extract-panel swml-ladder-pad/.test(SRC) && /_openLadderPadHook = \(\) =>/.test(SRC)
        && /_closeLadderPadHook = \(\) =>/.test(SRC));
    ok('every element ask OPENS the pad (idempotent)', /openLadderPad\(\);\s*publishLadder\(\);/.test(CTL2));
    ok('⭐ the pad is EPHEMERAL: the marking turn, the target ask and reset all CLOSE it',
        /st\.phase = 'marking';[\s\S]{0,80}closeLadderPad\(\);/.test(CTL2)
        && /st\.phase = 'target';[\s\S]{0,60}closeLadderPad\(\);/.test(CTL2)
        && /setTrialLadderModel\(null\);[^\n]*\n\s*closeLadderPad\(\);/.test(CTL2));
    ok('⭐ a student who closes the pad mid-element is never dead: the help bar\'s FIRST chip reopens it (§4d)',
        /textContent: 'Marking levels'[\s\S]{0,120}openLadderPad\(\)/.test(CTL2));
    ok('the pad has its size in vh AND dvh in the same rule (reachability-lint B)',
        /\.swml-ladder-pad \{[^}]*max-height: 74vh; max-height: 74dvh/.test(fs.readFileSync(path.join(ROOT, 'frontend/wml-canvas.css'), 'utf8')));
    ok('the student\'s draft opens in a DRAGGABLE pad (Neil: "like the extract button")',
        /_openTrialDraftPadHook/.test(SRC) && /swml-extract-panel swml-trial-draft-pad/.test(SRC)
        && /_makePanelInteractive\(panel\)/.test(SRC));
    ok('⛔ …on the FLOATING pad shell, never the docked rail shell (two shells, two jobs)',
        !/swml-outline-panel[^']*swml-trial-draft/.test(SRC));
    const CSS = fs.readFileSync(path.join(ROOT, 'frontend/wml-canvas.css'), 'utf8');
    ok('the card has styles, in both themes', /\.swml-ladder-level/.test(CSS) && /swml-theme-light \.swml-ladder-level/.test(CSS));
    ok('⛔ …and declares no vars on :root (root CLAUDE.md — a plugin clobbering the host page)',
        !/:root\s*\{[^}]*--swml-ladder/.test(CSS));
}

// ── 6. THE MACHINE LINES NEVER REACH A HUMAN (#420, root §14) ─────────────────────────────────
console.log('\nThe marker lines are stripped at the one display renderer:');
{
    const faIdx = CORE.indexOf('function formatAI(text)');
    const FA = faIdx === -1 ? '' : CORE.slice(faIdx, faIdx + 2000);
    ok('formatAI strips @TRIAL_* machine lines before any transform', /@TRIAL_\[A-Z\]\+/.test(FA.replace(/\\/g, '')) || /@TRIAL_/.test(FA));
    // …and behaviourally: run the real strip line against Neil's actual transcript tail.
    const m = /text = String\(text\)\.replace\((\/[^;]+\/gm), ''\)\.trim\(\);/.exec(FA);
    ok('…the strip expression is present and extractable', !!m, FA.slice(0, 200));
    if (m) {
        // eslint-disable-next-line no-eval
        const re = eval(m[1]);
        const sample = 'Great work.\n\n@TRIAL_VERDICT[hook=l2_top] Your opening line does the job.\n@TRIAL_STRENGTH[proaction] Real cost.\n@TRIAL_PRIORITY[epiphany] One concrete moment.';
        const out = sample.replace(re, '').trim();
        ok('…it removes every machine line from a real marking tail', !/@TRIAL_/.test(out), out);
        ok('…and keeps the prose', /Great work\./.test(out));
        ok('…and does not touch an @ in ordinary prose', 'email sophia@sophicly.com'.replace(re, '') === 'email sophia@sophicly.com');
    }
}

console.log(fails
    ? '\n❌ cw-trial1-gate FAILED (' + fails + ')'
    : '\n✅ cw-trial1-gate passed (Trial 1 asks what the course taught, in the words it taught them).');
process.exit(fails ? 1 : 0);
