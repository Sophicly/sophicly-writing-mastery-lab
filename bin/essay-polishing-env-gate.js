#!/usr/bin/env node
/* eslint-env node */
/**
 * essay-polishing-env-gate.js — a ported essay-polishing cell is served as an ENVIRONMENT, and the
 * old walk it replaces can never be loaded at a student again. (v7.20.609, PROTOCOL-STANDARD Part D)
 *
 * WHY THIS EXISTS. Neil, 2026-09-07 (FIXLIST #476): *"by that point, they should actually have a
 * full answer written out… they're just gonna highlight… and then they'll just say what they wanna
 * do with it."* The March-2026 `protocol-c-polishing.md` walk asks them to paste text and pick a
 * question number instead — and a fence in the preamble does not stop it, because whole files load
 * into the model's context (WML CLAUDE.md §5, measured again 2026-09-13: a `scan-elements` chip turn
 * came back as a greeting that "identified the first area to polish"). So the file must be
 * UNLOADABLE for a ported cell, exactly as the CW Step-14 walk is (bin/cw-polishing-env-gate.js).
 *
 * THE SHAPE, mirrored from that gate: the PHP router holds THE map (`essay_polishing_env`), the
 * JS chip holds the ladder keyed on the same text slugs, the manifest cell retires its `always`
 * list, and a per-paper rubric defines every button. Four surfaces that must agree — this asserts
 * the WHOLE SET each run, so a future port that adds a router row without a rubric, or a chip
 * ladder without a router row, fails the build instead of shipping a button the model improvises.
 *
 * ⚠️ It checks WIRING and the pure scans, not behaviour: only a browser proves the environment
 * renders and coaches (root §14b). That is the staging drive, not a gate.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(label, cond, got) {
    if (cond) { console.log('  ✓ ' + label); pass++; }
    else { console.log('  ✗ ' + label + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); fail++; }
}
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ── 1. THE ROUTER MAP is the source of truth ─────────────────────────────────────────────────
console.log('\nThe router declares the essay-polishing environment map:');
const ROUTER = read('includes/class-protocol-router.php');
const mapBlock = ROUTER.match(/\$essay_polishing_rubrics\s*=\s*\[([\s\S]*?)\n        \];/);
ok('$essay_polishing_rubrics exists inside essay_polishing_env()', !!mapBlock);
const rows = [];
if (mapBlock) {
    const re = /'([a-z0-9_]+)'\s*=>\s*\[\s*'cell'\s*=>\s*'([^']+)',\s*'rubric'\s*=>\s*'([^']+)',\s*'gold'\s*=>\s*\[([^\]]*)\]/g;
    let m;
    while ((m = re.exec(mapBlock[1])) !== null) {
        rows.push({ text: m[1], cell: m[2], rubric: m[3], gold: [...m[4].matchAll(/'([^']+)'/g)].map(x => x[1]) });
    }
}
ok('it has at least one row', rows.length >= 1, rows.length);
ok('AQA Language Paper 1 is ported (Neil\'s priority #1, 2026-09-13)', rows.some(r => r.text === 'aqa_lang_paper_1'));
ok('every row keys on a canonical text slug (lower-case, underscores — the §0c slug-trace form)',
    rows.every(r => /^[a-z0-9_]+$/.test(r.text)), rows.map(r => r.text));

// ── 2. The branch runs BEFORE the subject-based group resolver ───────────────────────────────
console.log('\nThe environment branch precedes the manifest path:');
const lmp = ROUTER.indexOf('private function load_modular_protocol(');
const envCall = ROUTER.indexOf('self::essay_polishing_env($context)', lmp);
const groupCall = ROUTER.indexOf('$this->resolve_protocol_group($board, $subject)', lmp);
ok('load_modular_protocol calls essay_polishing_env()', envCall > lmp);
ok('…BEFORE resolve_protocol_group() — a bare "language" subject resolves to a group with no manifest (measured 2026-09-13), so the text-keyed branch must win first',
    envCall > 0 && groupCall > 0 && envCall < groupCall, { envCall, groupCall });
ok('the branch returns the assembled stack (never falls through to the manifest)',
    /if \(\$task === 'polishing' && \$polish_env\) \{[\s\S]*?return !empty\(trim\(\$content\)\) \? \$content : null;\n        \}/.test(ROUTER));
ok('it loads the inline-coaching stack (core + engine-1 + rubric-base), same shape as CW polishing',
    /essay_polishing_env\(\$context\);\s*if \(\$task === 'polishing' && \$polish_env\) \{[\s\S]*?'inline-coaching-core\.md'[\s\S]*?'inline-coaching-engine-1\.md'[\s\S]*?'rubric-base\.md'/.test(ROUTER));

// ── 3. Every row's files exist and its manifest cell is retired ──────────────────────────────
console.log('\nEvery ported cell has its rubric, its gold, and a retired manifest entry:');
const manifests = [];
for (const r of rows) {
    const rubricRel = 'protocols/shared/modules/rubrics/' + r.rubric;
    ok(`${r.text}: rubric ${r.rubric} exists`, fs.existsSync(path.join(ROOT, rubricRel)));
    for (const g of r.gold) ok(`${r.text}: gold file ${g} exists`, fs.existsSync(path.join(ROOT, g)));
    const manRel = `protocols/${r.cell}/manifest.json`;
    const hasMan = fs.existsSync(path.join(ROOT, manRel));
    ok(`${r.text}: manifest cell protocols/${r.cell} exists`, hasMan);
    if (hasMan) {
        const man = JSON.parse(read(manRel));
        manifests.push({ r, man });
        const pol = man.polishing || {};
        const always = Array.isArray(pol.always) ? pol.always : [];
        ok(`${r.text}: manifest polishing.always is EMPTY — the monolith stack cannot load (retained-source law §5)`,
            always.length === 0, always);
        ok(`${r.text}: manifest polishing carries a _retired note naming the router row`,
            typeof pol._retired === 'string' && /essay_polishing_env/.test(pol._retired));
        // Only LOADABLE lists count — `always` / `steps` / `groups` of every task. Note keys
        // (`_retired`, `_destitched`) may and should NAME the file they retire.
        const loadable = JSON.stringify(man, (k, v) => (typeof k === 'string' && k.startsWith('_')) ? undefined : v);
        ok(`${r.text}: no loadable list in the manifest names protocol-c-polishing.md`,
            !loadable.includes('protocol-c-polishing.md'));
    }
}

// ── 4. The rubric defines the lesson, the actions, and the exit ──────────────────────────────
console.log('\nEach rubric is a Part D rubric — provenance, actions, exit, no AO3 on P1:');
for (const r of rows) {
    const rubricRel = 'protocols/shared/modules/rubrics/' + r.rubric;
    if (!fs.existsSync(path.join(ROOT, rubricRel))) continue;
    const R = read(rubricRel);
    ok(`${r.rubric}: names its mark-scheme provenance (§2b — PDF/sitting, never general GCSE knowledge)`,
        /Provenance/.test(R) && /June 2024|mark scheme/i.test(R));
    ok(`${r.rubric}: has an INLINE COACHING ACTIONS section`, /## INLINE COACHING ACTIONS/.test(R));
    ok(`${r.rubric}: states the exit — Mark Complete in the footer, no task menu`, /Mark Complete/.test(R) && /no task menu/i.test(R));
    ok(`${r.rubric}: the student chooses — it forbids picking the first area for them`, /never pick the first thing|Do NOT choose the first area|never pick the first/i.test(R));
    ok(`${r.rubric}: macro → micro order stated (PEDAGOGY §32a)`, /macro → micro|macro→micro/.test(R));
    if (r.text === 'aqa_lang_paper_1') {
        ok('rubric-aqa-lang-p1-fiction: AO3 is NOT assessed on Paper 1 — scan-context-drive is redirected, never run',
            /AO3 is NOT assessed/.test(R) && /`scan-context-drive`[^\n]*does NOT apply/.test(R));
        ok('rubric-aqa-lang-p1-fiction: Q2/Q3 = two TTECEA paragraphs, Q4 = intro + 3 + conclusion, Q5 holistic (the LANGUAGE anchor\'s shape)',
            /two TTECEA body paragraphs/.test(R) && /three TTECEA body paragraphs/.test(R) && /marked as a WHOLE piece/.test(R));
        ok('rubric-aqa-lang-p1-fiction: the seven scene-structure elements are the ones the Q5 plan box names',
            /Hook ·\s*Setup · Reaction · Epiphany · Proaction · Climax · Denouement/.test(R));
        ok('rubric-aqa-lang-p1-fiction: the penalty registry is the anchor\'s (F1 shows-family, S1 starters, K1/E1 on Q4)',
            /F1 the "shows" family/.test(R) && /S1 weak or repeated sentence starters/.test(R) && /K1/.test(R) && /E1/.test(R));
    }
}

// ── 5. The preamble frames the environment, and never demands a plan ─────────────────────────
console.log('\nThe preamble matches the environment:');
ok('plan enforcement no longer fires for polishing (it told the model "plan first" — staging chat 2026-04-20)',
    /if \(\$plan_required && in_array\(\$task, \['planning'\]\)\)/.test(ROUTER)
    && !/in_array\(\$task, \['planning', 'polishing'\]\)\) \{\n\s*\$preamble \.= "\*\*Plan Enforcement/.test(ROUTER));
const envFraming = ROUTER.indexOf('POLISHING ENVIRONMENT — THE STUDENT CHOOSES');
const legacyStart = ROUTER.indexOf('**START DIRECTLY** by reading the student\'s response');
ok('an environment framing exists ("THE STUDENT CHOOSES")', envFraming > 0);
ok('the legacy "START DIRECTLY… identifying the first area to polish" survives ONLY in the else-branch, after the environment framing',
    envFraming > 0 && legacyStart > envFraming
    && /\$polish_env = self::essay_polishing_env\(\$context\);\s*\n\s*if \(\$polish_env\) \{/.test(ROUTER));
ok('the environment framing names the exit (Mark Complete in the footer, no task menu)',
    /THE STUDENT CHOOSES[\s\S]{0,3000}Mark Complete\*\* in the document footer/.test(ROUTER));
ok('the environment framing tells the model where the text is (the live full document block) — never to ask for a paste',
    /THE STUDENT CHOOSES[\s\S]{0,3000}Current full document \(live this turn\)[\s\S]{0,600}Never ask the student to paste/.test(ROUTER));

// ── 6. The JS environment + the chip ladder agree with the router (§5d across two languages) ─
console.log('\nThe JS side agrees with the PHP side:');
global.window = { addEventListener() {}, removeEventListener() {}, location: { search: '', href: '' } };
global.document = {
    addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return _stubEl(); }, getElementById() { return null; }, createTextNode() { return _stubEl(); },
    head: _stubEl(), documentElement: _stubEl(), body: _stubEl(),
};
function _stubEl() {
    return {
        style: { setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } },
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        appendChild() {}, removeChild() {}, remove() {}, setAttribute() {}, getAttribute() { return null; },
        addEventListener() {}, removeEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, dataset: {},
    };
}
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
global.MutationObserver = class { observe() {} disconnect() {} };
global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
global.requestAnimationFrame = () => 0;
global.window.MutationObserver = global.MutationObserver;
global.window.localStorage = global.localStorage;
global.window.document = global.document;

try { new Function(read('frontend/wml-core.js'))(); } catch (e) { console.log('essay-polishing-env-gate: wml-core.js did not evaluate — ' + e.message); process.exit(1); }
const WML = global.window.WML;
const cfgPol = WML && WML.getExerciseConfig ? WML.getExerciseConfig('polishing') : null;
ok('EXERCISE_MANIFEST.polishing is the inline-coaching environment', !!cfgPol && cfgPol.environment === 'inline-coaching', cfgPol && cfgPol.environment);
ok('…with the chat PANEL off — Sophia is reached from a selection', !!cfgPol && cfgPol.panels && cfgPol.panels.chat === false);
ok('…the document shown', !!cfgPol && cfgPol.panels && cfgPol.panels.document === true);
ok('…protocolTask "polishing" (the router key this gate checks)', !!cfgPol && cfgPol.protocolTask === 'polishing');
ok('…no sidebar steps (nothing could ever tick them — §4d)', !!cfgPol && !cfgPol.sidebarSteps);

const CHIP = read('frontend/wml-selection-chip.js');
let chipEvalOk = false;
try { new Function(CHIP)(); chipEvalOk = !!(WML.SelectionChip && WML.SelectionChip.filterActionsForScope); }
catch (e) { ok('wml-selection-chip.js evaluates under the shim', false, e.message); }
if (chipEvalOk) {
    ok('wml-selection-chip.js evaluates under the shim and exposes filterActionsForScope', true);
    const listM = CHIP.match(/const ESSAY_POLISH_ENV_TEXTS = \[([^\]]*)\];/);
    const chipTexts = listM ? [...listM[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : [];
    ok('the chip declares ESSAY_POLISH_ENV_TEXTS', chipTexts.length > 0, chipTexts);
    ok('the chip list and the router map name the SAME texts (§5d write-key / read-key, two languages)',
        JSON.stringify([...chipTexts].sort()) === JSON.stringify(rows.map(r => r.text).sort()),
        { chip: chipTexts, router: rows.map(r => r.text) });
    const labels = WML.SelectionChip.ACTION_LABELS;
    for (const r of rows) {
        const groups = WML.SelectionChip.filterActionsForScope('sentence', { board: r.cell.split('/')[0], subject: 'language1', text: r.text, task: 'polishing' });
        const actions = groups.flatMap(g => g.actions);
        ok(`${r.text}: the ladder opens with scan-structure (macro → micro)`, actions[0] === 'scan-structure', actions.slice(0, 3));
        ok(`${r.text}: no scan-context-drive on a paper with no AO3`, !actions.includes('scan-context-drive'));
        ok(`${r.text}: SPaG is the LAST fix group, reference after it`,
            groups.map(g => g.key).slice(-2).join(',') === 'fixSpag,reference', groups.map(g => g.key));
        const noLabel = actions.filter(a => !labels[a]);
        ok(`${r.text}: every button has a human label (root §14 — no raw ids)`, noLabel.length === 0, noLabel);
        const rubricRel = 'protocols/shared/modules/rubrics/' + r.rubric;
        if (fs.existsSync(path.join(ROOT, rubricRel))) {
            const R = read(rubricRel);
            const undefinedActions = actions.filter(a => !R.includes('`' + a + '`'));
            ok(`${r.text}: all ${actions.length} buttons have a rubric row — no button the model improvises (§5c)`,
                undefinedActions.length === 0, undefinedActions);
        }
    }
}

// ── 7. The two Paper 1 scans are code-served and pure (v7.20.585's contract, extended) ───────
console.log('\nThe Language Paper 1 word-choice scans answer from CODE:');
{
    const fnSrc = CHIP.match(/function _codeServedWordScan\(action, text\) \{[\s\S]*?\n    \}/);
    ok('_codeServedWordScan exists in the chip', !!fnSrc);
    let scan = null;
    try { scan = new Function('return ' + fnSrc[0])(); } catch (e) { ok('it evaluates in ISOLATION (pure — no DOM, no _ctx)', false, e.message); }
    if (scan) {
        ok('it evaluates in ISOLATION (pure — no DOM, no _ctx)', true);
        const prose = 'The writer shows that Alex is angry. This illustrates his grief and uses a metaphor. '
            + 'These images make the reader feel tense. Consequently, the storm exposes his loneliness.';
        const v = scan('lang-scan-verbs', prose);
        ok('lang-scan-verbs finds the "shows" family (shows, illustrates)', /\*\*shows\*\*/.test(v) && /\*\*illustrates\*\*/.test(v), v && v.slice(0, 160));
        ok('…and the imprecise verbs (uses, make)', /\*\*uses\*\*/.test(v) && /\*\*make\*\*/.test(v));
        ok('…quotes the student\'s own phrase back', /…|The writer \*\*shows\*\*/.test(v));
        ok('…offers the precise-verb list and asks for TWO rewrites, not all', /depicts/.test(v) && /Pick TWO/.test(v));
        ok('…ends at the help ladder — Sophia is the last rung', /Type the sentence below/.test(v));
        const s = scan('lang-scan-starters', prose);
        ok('lang-scan-starters finds the The / This / These openers', /\*\*The\*\*/.test(s) && /\*\*This\*\*/.test(s) && /\*\*These\*\*/.test(s));
        ok('…does not flag "Consequently," (a discourse marker opener)', !/\*\*Consequently\*\*/.test(s));
        ok('…teaches the three replacements (discourse marker / prepositional phrase / participle)',
            /discourse marker/.test(s) && /prepositional phrase/.test(s) && /participle/.test(s));
        const s2 = scan('lang-scan-starters', 'The storm rages. The wind howls. Alex waits.');
        ok('…names a REPEATED opener as the one to change (one of each is allowed)', /Repeated opener[^\n]*\*\*The\*\*/.test(s2));
        ok('a clean passage gets praise, not an empty scan',
            /no "shows"-family verbs/.test(scan('lang-scan-verbs', 'Through metaphor, the writer exposes grief.'))
            && /no sentence opening with The, This or These/.test(scan('lang-scan-starters', 'Through metaphor, the writer exposes grief.')));
        ok('the CW scans still answer (cw-verbs unchanged)', /verb-circling pass/.test(scan('cw-verbs', 'She was tired and walked slowly.')));
        ok('an unknown action falls through to the API (null)', scan('scan-structure', prose) === null);
        ok('an empty selection falls through to the API (null)', scan('lang-scan-verbs', '   ') === null);
    }
}

// ── 8. The coach panel opens the polishing lesson with its instructions ──────────────────────
console.log('\nThe polishing lesson opens with instructions, not a "Start with Sophia" button:');
const ASSESS = read('frontend/wml-assessment.js');
const emptyFn = ASSESS.slice(ASSESS.indexOf('function buildCoachEmptyState()'), ASSESS.indexOf('} // end buildCoachEmptyState'));
ok('buildCoachEmptyState branches on state.task === "polishing" before the CTA', /if \(state\.task === 'polishing'\) \{/.test(emptyFn)
    && emptyFn.indexOf("if (state.task === 'polishing')") < emptyFn.indexOf('swml-coach-empty-cta'));
ok('the card tells the student to highlight, tap Sophia in the toolbar, then edit themselves', /Highlight<\/strong>/.test(emptyFn) && /Tap Sophia<\/strong>/.test(emptyFn) && /Edit your response yourself/.test(emptyFn));
ok('the card names the exit — Mark Complete in the footer', /Mark Complete<\/strong> in the footer/.test(emptyFn));
ok('the card surfaces the student\'s Phase-1 targets from /phase/status (the target is visible, Part D §4)', /API\.phaseStatus/.test(emptyFn) && /target_1/.test(emptyFn));
ok('the card renders without the targets too (liveness §4d — never an empty panel)', /the card stands without targets/.test(emptyFn));
ok('no insider words on the card (rubric / protocol / tier / engine)', !/rubric|protocol|tier|engine/i.test(emptyFn.slice(emptyFn.indexOf("if (state.task === 'polishing')"), emptyFn.indexOf('return empty;'))));

console.log('');
if (fail) { console.log(`❌ essay-polishing-env-gate FAILED (${fail})`); process.exit(1); }
console.log(`✅ essay-polishing-env-gate passed  (${pass} assertions, 0 failed)`);
