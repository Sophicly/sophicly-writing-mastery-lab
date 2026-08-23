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

// ── 1. THE CRITERIA ARE WHAT THE COURSE TAUGHT ────────────────────────────────────────────────
console.log('\nThe trial asks about the seven elements Step 9 taught, in Step 9\'s own words:');
ok('there are seven of them', ELEMENTS.length === 7, ELEMENTS.length);
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
ok('the marker contract is stated, all seven lines',
    ELEMENTS.every(e => PROTO.indexOf('@TRIAL_VERDICT[' + e.id + '=') !== -1));
ok('…and it says all seven are required', /All seven must be present/i.test(PROTO));
ok('it scopes the judgment to story coherence, not SPaG (that is the final assessment\'s job)',
    /Not spelling, not punctuation|story coherence only/i.test(PROTO));
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

// ── 3. THE DOCUMENT ───────────────────────────────────────────────────────────────────────────
console.log('\nThe trial document holds the student\'s own judgement, and Sophia\'s mark is locked:');
ok('the seven verdict rows are BUILT FROM the element list, never hand-typed beside it',
    /_els\.map\(function \(e\) \{[\s\S]{0,200}'cw-trial-1-' \+ e\.id/.test(SRC));
ok('the mark row exists', /'cw-trial-1-mark'/.test(SRC));
ok('the gap row exists', /'cw-trial-1-gap'/.test(SRC));
ok('⭐ both are LOCKED — a mark a student can retype is not a mark',
    /label: 'Mark'[^)]*locked: true[^)]*\}, 'cw-trial-1-mark'\)/.test(SRC)
    && /label: 'Where you differed'[^)]*locked: true[^)]*\}, 'cw-trial-1-gap'\)/.test(SRC));
ok('the mark section itself is read-only',
    /sectionHTML\('response', 'Story Coherence Mark', false, null/.test(SRC));
ok('the walk writes the mark to the row the template builds (one key, both sides — §5d)',
    /writeRow\('cw-trial-1-mark'/.test(SRC) && /writeRow\('cw-trial-1-gap'/.test(SRC));
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
    ok('the points are the stated ones: met=2 · partly=1 · not=0',
        /POINTS = \{ met: 2, partly: 1, not: 0 \}/.test(CTL));
    ok('the walk spends ONE call on marking and one only on an explicit ask for help',
        (CTL.match(/sendCanvasMessage\(\);/g) || []).length === 2,
        (CTL.match(/sendCanvasMessage\(\);/g) || []).length);
}

console.log(fails
    ? '\n❌ cw-trial1-gate FAILED (' + fails + ')'
    : '\n✅ cw-trial1-gate passed (Trial 1 asks what the course taught, in the words it taught them).');
process.exit(fails ? 1 : 0);
