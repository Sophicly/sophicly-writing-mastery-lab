#!/usr/bin/env node
/* eslint-env node */
/**
 * essay-polishing-env-gate.js — a ported essay-polishing cell is served as an ENVIRONMENT, and the
 * old walk it replaces can never be loaded at a student again. (v7.20.609 → v7.20.610, PROTOCOL-STANDARD Part D)
 *
 * WHY THIS EXISTS. Neil, 2026-09-07 (FIXLIST #476): *"by that point, they should actually have a
 * full answer written out… they're just gonna highlight… and then they'll just say what they wanna
 * do with it."* The March-2026 `protocol-c-polishing.md` walk asks them to paste text and pick a
 * question number instead — and a fence in the preamble does not stop it, because whole files load
 * into the model's context (WML CLAUDE.md §5). So the file must be UNLOADABLE for a ported cell.
 *
 * v7.20.610 (Neil's brief, 2026-09-13): the router now holds TWO maps — text rows for Language papers
 * and board/subject-family rows for Literature — plus a per-row engine (language | lit), extras and a
 * context-bank slice; the preamble for an environment cell is LEAN (built by
 * build_polish_env_preamble, never the walk-era general path); the chip stamps a code-built Location
 * line; rubric-base.md is split so Language never carries the five-paragraph Literature shapes. Every
 * one of those is a surface that must agree with the others, so this gate asserts the WHOLE SET.
 *
 * ⚠️ It checks WIRING and the pure scans, not behaviour: only a browser or a real chat turn proves
 * the environment coaches (root §14b). That is the journeys run, not a gate.
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
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// ── 1. THE ROUTER MAPS are the source of truth ───────────────────────────────────────────────
console.log('\nThe router declares the essay-polishing environment maps:');
const ROUTER = read('includes/class-protocol-router.php');
function parseMap(varName) {
    const m = ROUTER.match(new RegExp('\\$' + varName + '\\s*=\\s*\\[([\\s\\S]*?)\\n        \\];'));
    if (!m) return null;
    const rows = [];
    const re = /'([a-z0-9_\/]+)'\s*=>\s*\[([\s\S]*?)\n            \],/g;
    let r;
    while ((r = re.exec(m[1])) !== null) {
        const body = r[2];
        const f = (k) => { const x = body.match(new RegExp("'" + k + "'\\s*=>\\s*'([^']+)'")); return x ? x[1] : null; };
        const list = (k) => { const x = body.match(new RegExp("'" + k + "'\\s*=>\\s*\\[([^\\]]*)\\]")); return x ? [...x[1].matchAll(/'([^']+)'/g)].map(y => y[1]) : []; };
        rows.push({ key: r[1], cell: f('cell'), rubric: f('rubric'), gold: list('gold'), extras: list('extras'), engine: f('engine'), context_bank: f('context_bank') });
    }
    return rows;
}
const textRows = parseMap('essay_polishing_rubrics');
const subjRows = parseMap('essay_polishing_subject_rows');
ok('$essay_polishing_rubrics (Language, keyed on text slug) exists inside essay_polishing_env()', !!textRows);
ok('$essay_polishing_subject_rows (Literature, keyed on board/subject) exists inside essay_polishing_env()', !!subjRows);
const T = textRows || [], S = subjRows || [];
const rows = [...T.map(r => ({ ...r, kind: 'text', text: r.key })), ...S.map(r => ({ ...r, kind: 'subject', text: '' }))];
ok('AQA Language Paper 1 is ported (Neil\'s priority #1, 2026-09-13)', T.some(r => r.key === 'aqa_lang_paper_1'));
ok('AQA Language Paper 2 is ported (priority #2)', T.some(r => r.key === 'aqa_lang_paper_2'));
ok('the five AQA Literature families are ported (shakespeare · 19th_century · modern_text · poetry_anthology · unseen_poetry)',
    ['aqa/shakespeare', 'aqa/19th_century', 'aqa/modern_text', 'aqa/poetry_anthology', 'aqa/unseen_poetry'].every(k => S.some(r => r.key === k)), S.map(r => r.key));
ok('every text row keys on a canonical text slug (lower-case, underscores — the §0c slug-trace form)', T.every(r => /^[a-z0-9_]+$/.test(r.key)), T.map(r => r.key));
ok('every subject row keys on board/subject in the resolver\'s normalised form', S.every(r => /^[a-z0-9_]+\/[a-z0-9_]+$/.test(r.key)), S.map(r => r.key));
ok('every row names its engine (language | lit)', rows.every(r => r.engine === 'language' || r.engine === 'lit'), rows.map(r => r.key + ':' + r.engine));
ok('Language rows use the language engine; Literature rows use engine-1', T.every(r => r.engine === 'language') && S.every(r => r.engine === 'lit'));
ok('the resolver folds 20th_century → modern_text (the course-category sibling) in both essay_polishing_env and resolve_protocol_group',
    (ROUTER.match(/'20th_century'\)\s*\$subject = 'modern_text'/g) || []).length >= 2);
ok('the resolver folds a bare "language" subject from the text slug (#482)', /if \(\$subject === 'language'\) \{[\s\S]{0,400}paper_\(\\d\)\$\//.test(ROUTER));

// ── 2. The branch runs BEFORE the subject-based group resolver and loads the right stack ─────
console.log('\nThe environment branch precedes the manifest path and loads per-engine:');
const lmp = ROUTER.indexOf('private function load_modular_protocol(');
const envCall = ROUTER.indexOf('self::essay_polishing_env($context)', lmp);
const groupCall = ROUTER.indexOf('$this->resolve_protocol_group($board, $subject', lmp);
ok('load_modular_protocol calls essay_polishing_env()', envCall > lmp);
ok('…BEFORE resolve_protocol_group()', envCall > 0 && groupCall > 0 && envCall < groupCall, { envCall, groupCall });
const loader = ROUTER.slice(envCall, groupCall);
ok('the branch returns the assembled stack (never falls through to the manifest)', /return !empty\(trim\(\$content\)\) \? \$content : null;/.test(loader));
ok('it loads core + the per-engine coaching file + rubric-base', /'inline-coaching-core\.md'/.test(loader) && /\$is_lit \? 'inline-coaching-engine-1\.md' : 'inline-coaching-engine-language\.md'/.test(loader) && /'rubric-base\.md'/.test(loader));
ok('…and rubric-base-lit.md ONLY for Literature rows', /if \(\$is_lit\) \$files_to_load\[\] = \$rubrics_dir \. 'rubric-base-lit\.md';/.test(loader));
ok('…the gold, then the extras, in order', loader.indexOf("['gold']") < loader.indexOf("['extras']"));
ok('the context bank is SLICED to the active text, with an explicit "no bank" note on a miss (never all twelve texts, never an invented fact)',
    /slice_context_bank\(/.test(loader) && /No context bank exists for the text/.test(loader));
ok('slice_context_bank knows the text slugs the census carries (macbeth · christmas_carol · inspector_calls · jekyll_and_hyde …)',
    ['macbeth', 'christmas_carol', 'inspector_calls', 'jekyll_and_hyde', 'animal_farm', 'blood_brothers'].every(s => new RegExp("'" + s + "'\\s*=>").test(ROUTER)));

// ── 3. Every row's files exist and its manifest cell is retired ──────────────────────────────
console.log('\nEvery ported cell has its rubric, its gold, its extras, and a retired manifest entry:');
const cellsSeen = new Set();
for (const r of rows) {
    ok(`${r.key}: rubric ${r.rubric} exists`, exists('protocols/shared/modules/rubrics/' + r.rubric));
    for (const g of r.gold) ok(`${r.key}: gold file ${g} exists`, exists(g));
    for (const e of r.extras) ok(`${r.key}: extra file ${e} exists`, exists(e));
    if (r.context_bank) ok(`${r.key}: context bank ${r.context_bank} exists`, exists(r.context_bank));
    if (cellsSeen.has(r.cell)) continue;
    cellsSeen.add(r.cell);
    const manRel = `protocols/${r.cell}/manifest.json`;
    const hasMan = exists(manRel);
    ok(`${r.cell}: manifest exists`, hasMan);
    if (hasMan) {
        const man = JSON.parse(read(manRel));
        const pol = man.polishing || {};
        const always = Array.isArray(pol.always) ? pol.always : [];
        ok(`${r.cell}: manifest polishing.always is EMPTY — the monolith stack cannot load (retained-source law §5)`, always.length === 0, always);
        ok(`${r.cell}: manifest polishing carries a _retired note naming the router row`, typeof pol._retired === 'string' && /essay_polishing_env/.test(pol._retired));
        const loadable = JSON.stringify(man, (k, v) => (typeof k === 'string' && k.startsWith('_')) ? undefined : v);
        ok(`${r.cell}: no loadable list in the manifest names a protocol-c-polishing file`, !/protocol-c-polishing/.test(loadable));
    }
}

// ── 4. The rubric defines the lesson, the actions, and the exit ──────────────────────────────
console.log('\nEach rubric is a Part D rubric — provenance, actions, exit, the paper\'s shape:');
const rubricsSeen = new Set();
for (const r of rows) {
    if (rubricsSeen.has(r.rubric)) continue;
    rubricsSeen.add(r.rubric);
    const rubricRel = 'protocols/shared/modules/rubrics/' + r.rubric;
    if (!exists(rubricRel)) continue;
    const R = read(rubricRel).replace(/\s+/g, ' ');   // wrapped lines read as one
    ok(`${r.rubric}: names its provenance (§2b — mark scheme / protocol, never general GCSE knowledge)`, /Provenance/.test(R) && /mark scheme/i.test(R));
    ok(`${r.rubric}: has THE LESSON'S SHAPE (Part D)`, /## THE LESSON'S SHAPE/.test(R));
    ok(`${r.rubric}: has an INLINE COACHING ACTIONS section`, /## INLINE COACHING ACTIONS/.test(R));
    ok(`${r.rubric}: states the exit — Mark Complete in the footer, no task menu`, /Mark Complete/.test(R) && /no task menu/i.test(R));
    ok(`${r.rubric}: the student chooses — it forbids picking the first area for them`, /student chooses|never pick the first thing|Do NOT choose the first area|never pick the first/i.test(R));
    ok(`${r.rubric}: macro → micro order stated (PEDAGOGY §32a)`, /macro → micro|macro→micro/.test(R));
    ok(`${r.rubric}: the two contrasting rewrites are the ONLY rewrite (STOP RULE)`, /two contrasting rewrites/i.test(R));
    ok(`${r.rubric}: no "Level N needs…" pointer to the student`, !/(Pointer phrases \(use verbatim\)|^- \*Level \d (needs|rewards))/m.test(read(rubricRel)));
    if (r.key === 'aqa_lang_paper_1') {
        ok('rubric-aqa-lang-p1-fiction: AO3 is NOT assessed on Paper 1 — scan-context-drive is redirected, never run', /AO3 is NOT assessed/.test(R) && /`scan-context-drive`[^\n]*does NOT apply/.test(R));
        ok('rubric-aqa-lang-p1-fiction: Q2/Q3 = two TTECEA paragraphs, Q4 = intro + 3 + conclusion, Q5 holistic', /two TTECEA body paragraphs/.test(R) && /three TTECEA body paragraphs/.test(R) && /marked as a WHOLE piece/.test(R));
        ok('rubric-aqa-lang-p1-fiction: the seven scene-structure elements are the ones the Q5 plan box names', /Hook ·\s*Setup · Reaction · Epiphany · Proaction · Climax · Denouement/.test(R));
        ok('rubric-aqa-lang-p1-fiction: the penalty registry is the anchor\'s (F1 shows-family, S1 starters, K1/E1 on Q4)', /F1 the "shows" family/.test(R) && /S1 weak or repeated sentence starters/.test(R) && /K1/.test(R) && /E1/.test(R));
    }
    if (r.key === 'aqa_lang_paper_2') {
        ok('rubric-aqa-lang-p2-nonfiction: Q2 is paired inference (NOT TTECEA), Q3 = three TTECEA, Q4 = comparative with ONE effect per source, Q5 = IUMVCC six sections',
            /two paired-inference paragraphs/.test(R) && /three TTECEA body paragraphs/.test(R) && /One effect sentence per source/.test(R) && /I — Introduction/.test(R) && /C — Counter-argument/.test(R));
        ok('rubric-aqa-lang-p2-nonfiction: AO3 is COMPARISON here, scan-context-drive is redirected', /AO3 here means COMPARISON/.test(R) && /`scan-context-drive`[^\n]*does NOT apply/.test(R));
        ok('rubric-aqa-lang-p2-nonfiction: IUMVCC comes from the LIVE planning protocol (image-first · imperative check · no fake facts)', /image-first/.test(R) && /imperative check/.test(R) && /no fake facts/.test(R));
        ok('rubric-aqa-lang-p2-nonfiction: defines every device-* button for Q5', /`device-suggest`/.test(R) && /`device-other`/.test(R) && /Q5 only/.test(R));
    }
    if (r.engine === 'lit') {
        ok(`${r.rubric}: TTECEA order matches the protocol (close analysis BEFORE the two effects — D3 fixed)`, !/3\. E1 ?\(/.test(R) || /3\. C \(/.test(R));
    }
}

// ── 5. The preamble: a LEAN environment preamble, never the walk-era general path ─────────────
console.log('\nThe preamble matches the environment:');
ok('plan enforcement no longer fires for polishing', /if \(\$plan_required && in_array\(\$task, \['planning'\]\)\)/.test(ROUTER)
    && !/in_array\(\$task, \['planning', 'polishing'\]\)\) \{\n\s*\$preamble \.= "\*\*Plan Enforcement/.test(ROUTER));
const bp = ROUTER.indexOf('public function build_preamble(');
const leanCall = ROUTER.indexOf('return $this->build_polish_env_preamble(', bp);
const helpBlock = ROUTER.indexOf("$_help_task = $context['task'] ?? '';", bp);
const universal = ROUTER.indexOf('UNIVERSAL RULES — APPLY TO EVERY MESSAGE', bp);
ok('build_preamble returns the LEAN environment preamble for a ported polishing cell…', leanCall > bp);
ok('…BEFORE the help block and BEFORE the UNIVERSAL RULES / PANEL / function-call blocks ever run', leanCall < helpBlock && leanCall < universal, { leanCall, helpBlock, universal });
const leanStart = ROUTER.indexOf('private function build_polish_env_preamble(');
const leanEnd = ROUTER.indexOf('private function build_reminders(', leanStart);
const lean = ROUTER.slice(leanStart, leanEnd);
ok('the lean builder exists', leanStart > 0 && leanEnd > leanStart);
ok('it frames the environment ("THE STUDENT CHOOSES"), names the exit and the live-document block', /THE STUDENT CHOOSES/.test(lean) && /Mark Complete\*\* in the document footer/.test(lean) && /Current full document \(live this turn\)/.test(lean));
ok('it tells the model to trust the code-built Location line', /Location\*\* line built by code/.test(lean) && /Trust the Location line/.test(lean));
ok('it carries the Phase-1 result for THIS topic (grade · strength · target_1 · target_2) — assessment findings reach the model', /get_latest_phase_result\(/.test(lean) && /target_1/.test(lean) && /target_2/.test(lean) && /strength_1/.test(lean));
ok('it states macro → micro and forbids reducing polishing to vocabulary swaps or proofreading', /macro → micro/.test(lean) && /never reduce a session to vocabulary swaps or proofreading/.test(lean));
ok('it says the gold standard is a QUALITY target, never the model\'s wording — a different successful answer is the goal', /never the model's wording or interpretation/.test(lean));
ok('it strips the walk-era "greet the student fresh" line from the session block', /Greet the student fresh/.test(lean) && /str_replace\(/.test(lean));
ok('it contains NONE of the walk-era blocks (UNIVERSAL RULES · [PANEL] · save_session_element · CHUNK · HARD GATE · diagnostic essay)',
    !/UNIVERSAL RULES|\[PANEL|save_session_element|CHUNK|HARD GATE|diagnostic essay/.test(lean));
ok('it appends the shared coaching pedagogy (STOP RULE)', /coaching-pedagogy-shared\.md/.test(lean));
ok('the legacy "START DIRECTLY… identifying the first area to polish" survives only for unported cells, after the lean return', ROUTER.indexOf('**START DIRECTLY** by reading the student\'s response') > leanCall);
ok('the REST chat endpoint reads draftType into the context', /'draft_type' => sanitize_text_field\(\$params\['draftType'\]/.test(read('includes/class-rest-api.php')));

// ── 6. The shared stack: language engine + base split ────────────────────────────────────────
console.log('\nThe shared stack no longer sends the five-paragraph essay to a Language paper:');
ok('inline-coaching-engine-language.md exists', exists('protocols/shared/modules/inline-coaching-engine-language.md'));
if (exists('protocols/shared/modules/inline-coaching-engine-language.md')) {
    const E = read('protocols/shared/modules/inline-coaching-engine-language.md');
    ok('…and is small (≤ 20 KB; engine-1 is 52 KB)', Buffer.byteLength(E) <= 20480, Buffer.byteLength(E));
    ok('…carries no five-paragraph walk, no AO3 substrate, no quotas, no task menu',
        !/Intro → BP1 → BP2 → BP3|Walk order:|BP1 quote = BEGINNING|Tambora|knowledge-text-context-banks|SUGGESTION_LIMIT|Main Menu|for their workbook/.test(E));
    ok('…defers every structural fact to the rubric and trusts the Location line', /every structural fact comes from the paper's rubric/i.test(E) && /Location/.test(E));
    ok('…names the STOP RULE reveal as the only rewrite', /two contrasting rewrites of THEIR line/i.test(E) || /two contrasting rewrites/i.test(E));
    ok('…bans insider words to the student', /Never say \*tier\*, \*rubric\*, \*protocol\*/.test(E));
}
const BASE = read('protocols/shared/modules/rubrics/rubric-base.md');
ok('rubric-base.md is universal: no Lit intro/conclusion shapes, no critical frames, no hamartia, no TBD file index', !/INTRO \+ CONCLUSION SHAPES|CRITICAL FRAMES|Hamartia|FILE INDEX|\(TBD\)/.test(BASE));
ok('rubric-base.md TTECEA order = T · T+E · C · E1 · E2 · A · +C (the anchor\'s)', /3\. \*\*C\*\*lose analysis/.test(BASE) && /4\. \*\*E\*\*ffect on the audience 1/.test(BASE));
ok('rubric-base-lit.md exists and holds the Literature shapes', exists('protocols/shared/modules/rubrics/rubric-base-lit.md') && /INTRO \+ CONCLUSION SHAPES/.test(read('protocols/shared/modules/rubrics/rubric-base-lit.md')) && /Hamartia/.test(read('protocols/shared/modules/rubrics/rubric-base-lit.md')));
ok('exam_crib loads rubric-base-lit.md for Literature cribs', /'rubric-base-lit\.md';\s*\n\s*\$files_to_load\[\] = \$rubrics_dir \. 'gold-standard-exemplars-aqa-lit\.md'/.test(ROUTER));
const CORE = read('protocols/shared/modules/inline-coaching-core.md');
ok('inline-coaching-core.md no longer claims "You do NOT receive the entire document"', !/You do NOT receive the entire document/.test(CORE) && /receive the entire document every turn/.test(CORE));
ok('inline-coaching-core.md red line 4 sanctions ONLY the paired STOP-RULE reveal', /two contrasting rewrites of their own line/.test(CORE));
ok('inline-coaching-core.md has no opener mandate and no Level-N pointer example', /\*\*No opener\.\*\*/.test(CORE) && !/Level 5 needs precise analytical terminology/.test(CORE));

// ── 7. The JS environment + the chip ladders agree with the router (§5d across two languages) ─
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
ok('…protocolTask "polishing"', !!cfgPol && cfgPol.protocolTask === 'polishing');
ok('…no sidebar steps (nothing could ever tick them — §4d)', !!cfgPol && !cfgPol.sidebarSteps);
ok('the polishing step description no longer says "Write your improved essay" (#476)', !/Write your improved essay using your outline/.test(read('frontend/wml-core.js')));

const CHIP = read('frontend/wml-selection-chip.js');
let chipEvalOk = false;
try { new Function(CHIP)(); chipEvalOk = !!(WML.SelectionChip && WML.SelectionChip.filterActionsForScope); }
catch (e) { ok('wml-selection-chip.js evaluates under the shim', false, e.message); }
if (chipEvalOk) {
    ok('wml-selection-chip.js evaluates under the shim and exposes filterActionsForScope', true);
    const listM = CHIP.match(/const ESSAY_POLISH_ENV_TEXTS = \[([^\]]*)\];/);
    const chipTexts = listM ? [...listM[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : [];
    ok('the chip list and the router text map name the SAME texts (§5d write-key / read-key)', JSON.stringify([...chipTexts].sort()) === JSON.stringify(T.map(r => r.key).sort()), { chip: chipTexts, router: T.map(r => r.key) });
    const subjM = CHIP.match(/const ESSAY_POLISH_ENV_SUBJECTS = \[([^\]]*)\];/);
    const chipSubj = subjM ? [...subjM[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : [];
    ok('the chip subject list and the router subject map name the SAME families', JSON.stringify([...chipSubj].sort()) === JSON.stringify(S.map(r => r.key).sort()), { chip: chipSubj, router: S.map(r => r.key) });
    const labels = WML.SelectionChip.ACTION_LABELS;
    const F = WML.SelectionChip.filterActionsForScope;
    const rubricHas = (r, actions) => { const R = read('protocols/shared/modules/rubrics/' + r.rubric); return actions.filter(a => !R.includes('`' + a + '`')); };
    for (const r of T) {
        const ctx = { board: r.cell.split('/')[0], subject: 'language1', text: r.key, task: 'polishing' };
        const gQ2 = F('sentence', ctx, { question: 'Q2', label: 'Q2 Response' });
        const gQ5 = F('sentence', ctx, { question: 'Q5', label: 'Q5 Response' });
        const gNone = F('sentence', ctx, null);
        const aQ2 = gQ2.flatMap(g => g.actions), aQ5 = gQ5.flatMap(g => g.actions), aNone = gNone.flatMap(g => g.actions);
        ok(`${r.key}: the ladder opens with scan-structure (macro → micro)`, aQ2[0] === 'scan-structure', aQ2.slice(0, 3));
        ok(`${r.key}: no scan-context-drive on a paper with no AO3-context`, !aQ2.includes('scan-context-drive') && !aQ5.includes('scan-context-drive'));
        ok(`${r.key}: SPaG is the LAST fix group, reference after it`, gQ2.map(g => g.key).slice(-2).join(',') === 'fixSpag,reference', gQ2.map(g => g.key));
        ok(`${r.key}: on a reading question (Q2) no Section-B buttons (devices / modifier cut)`, !aQ2.includes('cw-cut-modifiers') && !aQ2.some(a => a.startsWith('device-')));
        ok(`${r.key}: on the writing question (Q5) the modifier cut is offered`, aQ5.includes('cw-cut-modifiers'));
        if (r.key === 'aqa_lang_paper_2') ok('aqa_lang_paper_2: on Q5 the device group is offered', aQ5.some(a => a.startsWith('device-')));
        ok(`${r.key}: with no Location the full ladder is offered (never an empty menu — §4d)`, aNone.length >= aQ5.length);
        const all = [...new Set([...aQ2, ...aQ5, ...aNone])];
        ok(`${r.key}: every button has a human label (root §14 — no raw ids)`, all.every(a => labels[a]), all.filter(a => !labels[a]));
        ok(`${r.key}: all ${all.length} buttons have a rubric row — no button the model improvises (§5c)`, rubricHas(r, all).length === 0, rubricHas(r, all));
    }
    for (const r of S) {
        const [board, subject] = r.key.split('/');
        const g = F('sentence', { board, subject, text: 'macbeth', task: 'polishing' }, { label: 'Response', paraIndex: 2, paraCount: 5 });
        const a = g.flatMap(x => x.actions);
        ok(`${r.key}: the ladder opens with scan-structure`, a[0] === 'scan-structure', a.slice(0, 3));
        if (subject === 'unseen_poetry') ok(`${r.key}: no scan-context-drive (no AO3 on unseen)`, !a.includes('scan-context-drive'));
        else ok(`${r.key}: scan-context-drive IS offered (AO3 assessed)`, a.includes('scan-context-drive'));
        ok(`${r.key}: the code-served analytical word scans are offered`, a.includes('lang-scan-verbs') && a.includes('lang-scan-starters'));
        ok(`${r.key}: no story-craft buttons on an essay`, !a.includes('cw-cut-modifiers') && !a.some(x => x.startsWith('cw-')));
        ok(`${r.key}: SPaG is the LAST fix group, reference after it`, g.map(x => x.key).slice(-2).join(',') === 'fixSpag,reference', g.map(x => x.key));
        ok(`${r.key}: every button has a human label`, a.every(x => labels[x]), a.filter(x => !labels[x]));
        ok(`${r.key}: all ${a.length} buttons have a rubric row`, rubricHas(r, a).length === 0, rubricHas(r, a));
    }
    // The fold the router applies must be mirrored: a 20th_century subject reaches the modern_text ladder.
    const g20 = F('sentence', { board: 'aqa', subject: '20th_century', text: 'inspector_calls', task: 'polishing' }, null);
    ok('a 20th_century subject reaches the modern_text ladder (the fold is mirrored in JS)', g20.some(x => x.key === 'litWordChoice'));
    // An unported cell falls through to the legacy ladder untouched.
    const gLegacy = F('sentence', { board: 'edexcel', subject: 'language1', text: 'edexcel_lang_paper_1', task: 'polishing' }, null);
    ok('an unported text still gets the legacy ladder (no behaviour change until its row exists)', gLegacy[0].key === 'tierScans');
    // Location line
    const fmt = WML.SelectionChip.formatLocation;
    ok('formatLocation exists and names question · paragraph i of n · words', typeof fmt === 'function' && /Q3 Response · paragraph 2 of 3 · 180 words/.test(fmt({ label: 'Q3 Response', question: 'Q3', paraIndex: 2, paraCount: 3, words: 180 })));
    ok('…and names the paragraph\'s job in a five-paragraph Literature Response box', /paragraph 5 of 5 \(Conclusion\)/.test(fmt({ label: 'Response', question: null, paraIndex: 5, paraCount: 5, words: 900 })) && /\(Body Paragraph 2\)/.test(fmt({ label: 'Response', question: null, paraIndex: 3, paraCount: 5, words: 900 })));
    ok('buildPrompt sends the Location line every turn', /'- \*\*Location:\*\* ' \+ formatLocation\(location\)/.test(CHIP));
    ok('the box-open snapshot and every send re-read the Location from the live DOM', /location = extractLocation\(anchorEl\)/.test(CHIP) && /liveLocation = extractLocation\(sel\.anchorEl\)/.test(CHIP));
    ok('the chat body carries phase + draftType', /phase: state \? \(state\.phase \|\| ''\) : ''/.test(CHIP) && /draftType: state \? \(state\.draftType \|\| ''\) : ''/.test(CHIP));
}

// ── 8. The word-choice scans are code-served and pure (v7.20.585's contract, extended) ───────
console.log('\nThe analytical word-choice scans answer from CODE:');
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
        ok('…offers the precise-verb list and asks for TWO rewrites, not all', /depicts/.test(v) && /Pick TWO/.test(v));
        ok('…ends at the help ladder — Sophia is the last rung', /Type the sentence below/.test(v));
        const s = scan('lang-scan-starters', prose);
        ok('lang-scan-starters finds the The / This / These openers', /\*\*The\*\*/.test(s) && /\*\*This\*\*/.test(s) && /\*\*These\*\*/.test(s));
        ok('…does not flag "Consequently," (a discourse marker opener)', !/\*\*Consequently\*\*/.test(s));
        const s2 = scan('lang-scan-starters', 'The storm rages. The wind howls. Alex waits.');
        ok('…names a REPEATED opener as the one to change (one of each is allowed)', /Repeated opener[^\n]*\*\*The\*\*/.test(s2));
        ok('a clean passage gets praise, not an empty scan', /no "shows"-family verbs/.test(scan('lang-scan-verbs', 'Through metaphor, the writer exposes grief.')));
        ok('the CW scans still answer (cw-verbs unchanged)', /verb-circling pass/.test(scan('cw-verbs', 'She was tired and walked slowly.')));
        ok('an unknown action falls through to the API (null)', scan('scan-structure', prose) === null);
        ok('an empty selection falls through to the API (null)', scan('lang-scan-verbs', '   ') === null);
    }
}

// ── 9. The coach panel opens the polishing lesson with its instructions ──────────────────────
console.log('\nThe polishing lesson opens with instructions, not a "Start with Sophia" button:');
const ASSESS = read('frontend/wml-assessment.js');
const emptyFn = ASSESS.slice(ASSESS.indexOf('function buildCoachEmptyState()'), ASSESS.indexOf('} // end buildCoachEmptyState'));
ok('buildCoachEmptyState branches on state.task === "polishing" before the CTA', /if \(state\.task === 'polishing'\) \{/.test(emptyFn) && emptyFn.indexOf("if (state.task === 'polishing')") < emptyFn.indexOf('swml-coach-empty-cta'));
ok('the card tells the student to highlight, tap Sophia in the toolbar, then edit themselves', /Highlight<\/strong>/.test(emptyFn) && /Tap Sophia<\/strong>/.test(emptyFn) && /Edit your response yourself/.test(emptyFn));
ok('the card names the exit — Mark Complete in the footer', /Mark Complete<\/strong> in the footer/.test(emptyFn));
ok('the card surfaces the student\'s Phase-1 targets from /phase/status', /API\.phaseStatus/.test(emptyFn) && /target_1/.test(emptyFn));
ok('the card renders without the targets too (liveness §4d)', /the card stands without targets/.test(emptyFn));
ok('no insider words on the card', !/rubric|protocol|tier|engine/i.test(emptyFn.slice(emptyFn.indexOf("if (state.task === 'polishing')"), emptyFn.indexOf('return empty;'))));

console.log('');
if (fail) { console.log(`❌ essay-polishing-env-gate FAILED (${fail})`); process.exit(1); }
console.log(`✅ essay-polishing-env-gate passed  (${pass} assertions, 0 failed)`);
