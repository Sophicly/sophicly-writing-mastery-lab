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

// ── 1b. A LANGUAGE ROW WITHOUT A PAPER SPEC SILENTLY MIS-GATES THE WRITING QUESTION (v7.20.612) ──
// The chip serves the transactional-device buttons and the writing-flavoured word-choice group on
// the extended-writing question, and it asks `WML.isWritingQuestion`, which reads
// protocols/shared/language-paper-specs.json. A board with NO spec block falls back to Q5 — correct
// for AQA, wrong for Edexcel GCSE P2 (Q8) and Edexcel International GCSE P1 (Q6). Measured
// 2026-09-13: eduqas, ocr and ccea have no block at all, so a row landing for one of them ahead of
// its spec would gate Section B on a question the paper may not even have, with no error anywhere.
// This is the §5d write-key/read-key law across a THIRD language (PHP row · JS chip · JSON spec).
const _LANGSPECS = JSON.parse(read('protocols/shared/language-paper-specs.json'));
const _CHIPSRC = read('frontend/wml-selection-chip.js');
const _CORESRC = read('frontend/wml-core.js');
// Run the REAL resolver out of wml-core.js — never a reimplementation. A gate that re-derives the
// key it is checking tests its own copy and passes while the shipped code is wrong (which is how
// the first cut of this very check was written: it built `'language_p' + n` and would have
// false-failed every Eduqas, OCR and CCEA row, whose spec keys are `_c`/`_u`).
const _resolver = (() => {
    const grab = (name) => {
        const i = _CORESRC.indexOf('function ' + name + '(');
        if (i < 0) return null;
        let d = 0;
        for (let k = _CORESRC.indexOf('{', i); k < _CORESRC.length; k++) {
            if (_CORESRC[k] === '{') d++;
            else if (_CORESRC[k] === '}') { d--; if (!d) return _CORESRC.slice(i, k + 1); }
        }
        return null;
    };
    const parts = ['_langPaperOrdinal', '_langSpecPaperKey', 'writingQuestionIds', 'isWritingQuestion'].map(grab);
    if (parts.some(p => !p)) return null;
    global.window = { swmlLangSpecs: _LANGSPECS };
    return new Function(parts.join('\n') + ';return { writingQuestionIds, _langSpecPaperKey };')();
})();
ok('the writing-question resolver is extractable from wml-core.js (so this gate runs the real code)', !!_resolver);
T.forEach(r => {
    const board = String(r.cell || '').split('/')[0];
    const pm = /language(\d)$/.exec(String(r.cell || ''));
    const ctx = { board, subject: 'language' + (pm ? pm[1] : ''), text: r.key };
    const paperKey = _resolver && _resolver._langSpecPaperKey(_LANGSPECS[board], ctx.subject, ctx.text);
    ok('language-paper-specs has a block for ' + r.key + ' (' + board + ' → ' + paperKey + ')',
        !!(paperKey && _LANGSPECS[board][paperKey] && Array.isArray(_LANGSPECS[board][paperKey].sections)),
        'MISSING — the chip would fall back to Q5');
    const ids = _resolver ? _resolver.writingQuestionIds(ctx) : [];
    const fellBack = ids.length === 1 && ids[0] === 'Q5' && board !== 'aqa';
    ok('the spec for ' + r.key + ' names its own extended-writing question(s) — ' + JSON.stringify(ids)
        + ' — so the device buttons land on the right one', !!paperKey && !fellBack, ids);
});
ok('the chip asks WML.isWritingQuestion rather than hardcoding q === \'Q5\'',
    /WML\.isWritingQuestion\(q, taskCtx\)/.test(_CHIPSRC) && !/const isSectionB = q === 'Q5';/.test(_CHIPSRC));
ok('WML exports the writing-question resolver and derives it from the spec\'s own question type',
    /writingQuestionIds, isWritingQuestion,/.test(_CORESRC)
    && /q\.type === 'extended_writing' \|\| q\.type === 'choice'/.test(_CORESRC));
ok('the resolver keeps the board key hyphenated (edexceligcse matches no board — the §5d trap)',
    /replace\(\/_\/g, '-'\)[\s\S]{0,200}_langSpecSubjectKey/.test(_CORESRC)
    || /const board = String\(\(ctx && ctx\.board\) \|\| ''\)\.replace\(\/_\/g, '-'\)/.test(_CORESRC));
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

// ── 3b. THE REVERSE PAIRING — A RETIRED MANIFEST WITH NO ROUTER ROW SERVES THE STUDENT NOTHING ──
// §4d applied to configuration: emptying `polishing.always` is the REFUSAL half of the change, and
// the router row is the "what they get instead" half. Land the content of a board port without its
// row and that cell's polishing lesson loads NO protocol at all — strictly worse than the monolith
// it replaced, and silent (`load_modular_protocol` simply returns an empty stack). Six board-port
// lanes correctly retired their manifests on the assumption the row lands in the SAME change; this
// asserts that assumption instead of trusting it. Whole-repo by nature: any cell, any board.
console.log('\nEvery retired polishing cell has a router row to replace it (the §4d pairing):');
const cellsWithRows = new Set(rows.map(r => r.cell));
const manifestDirs = [];
for (const board of fs.readdirSync(path.join(ROOT, 'protocols'))) {
    if (board.startsWith('_') || board === 'shared') continue;
    const boardDir = path.join(ROOT, 'protocols', board);
    if (!fs.statSync(boardDir).isDirectory()) continue;
    for (const subject of fs.readdirSync(boardDir)) {
        if (subject.startsWith('_')) continue;
        if (fs.existsSync(path.join(boardDir, subject, 'manifest.json'))) manifestDirs.push(board + '/' + subject);
    }
}
let retiredNoRow = 0;
for (const cell of manifestDirs) {
    let man;
    try { man = JSON.parse(read('protocols/' + cell + '/manifest.json')); } catch (_) { continue; }
    const pol = man.polishing || {};
    if (!Array.isArray(pol.always) || pol.always.length !== 0) continue;   // not retired — nothing to pair
    if (!pol._retired) continue;                                          // never had a polishing stack
    if (!cellsWithRows.has(cell)) {
        retiredNoRow++;
        ok(cell + ': manifest polishing is RETIRED but no essay_polishing_env row replaces it — '
            + 'this cell\'s polishing lesson would load no protocol at all', false, 'add the router row');
    }
}
ok('no cell has a retired polishing manifest without a router row (' + manifestDirs.length + ' manifests scanned)',
    retiredNoRow === 0, retiredNoRow + ' unpaired');

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
    // v7.20.614: both call sites now pass the SELECTION TEXT too — it is what decides which
    // paragraph the selection sits in, and without it the position was never knowable.
    ok('the box-open snapshot and every send re-read the Location from the live DOM, with the selection text', /location = extractLocation\(anchorEl, text\)/.test(CHIP) && /liveLocation = extractLocation\(sel\.anchorEl, sel\.text\)/.test(CHIP));
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
        // ⭐ v7.20.613 — THIS ASSERTION USED TO ENCODE THE DEFECT. It required `illustrates` to be
        // FLAGGED, but the anchor's tier list (protocols/aqa/language1/modules/protocol-a-assessment.md
        // :183-188, the v7.19.950 Neil ruling) puts `illustrates` on the STRONG tier — "consistent
        // with depicts/portrays" — and rules `aims to` / `seems to` UN-TIERED hedges that must NEVER
        // be penalised as verbs. The scan charged all three, so it told students off for verbs our
        // own marking permits. The gate now asserts the ANCHOR, which makes it the regression guard.
        ok('lang-scan-verbs finds the "shows" family', /\*\*shows\*\*/.test(v), v && v.slice(0, 160));
        ok('…and does NOT charge `illustrates` — the anchor lists it STRONG (v7.19.950)', !/\*\*illustrates\*\*/.test(v));
        ok('…and does NOT charge the un-tiered hedges `aims to` / `seems to`',
            !/\*\*aims to\*\*/.test(scan('lang-scan-verbs', 'The poet aims to unsettle us and seems to mourn.'))
            && !/\*\*seems to\*\*/.test(scan('lang-scan-verbs', 'The poet aims to unsettle us and seems to mourn.')));
        ok('…and does NOT sweep is/are/was/were — they sit on no tier',
            !/\*\*(?:is|are|was|were)\*\*/.test(scan('lang-scan-verbs', 'The mood is bleak. The soldiers were tired.')));
        ok('…and the imprecise verbs (uses, make)', /\*\*uses\*\*/.test(v) && /\*\*make\*\*/.test(v));
        ok('…tells the student a hedge is SAFE rather than silently ignoring it',
            /Not counted:/.test(scan('lang-scan-verbs', 'The writer shows grief and seems to mourn.')));
        ok('…frames the scan as a pattern, not a verdict (Neil, 2026-09-14)', /pattern, not a verdict/.test(v));
        ok('…links to the Toolkit Inference Verbs word bank', /@RESOURCE_LINK[^\n]*wb-verbs/.test(v));
        ok('…offers the precise-verb list and asks for TWO rewrites, not all', /depicts/.test(v) && /Pick TWO/.test(v));
        ok('…ends at the help ladder — Sophia is the last rung', /Type the sentence below/.test(v));
        const s = scan('lang-scan-starters', prose);
        ok('lang-scan-starters finds the The / This / These openers', /\*\*The\*\*/.test(s) && /\*\*This\*\*/.test(s) && /\*\*These\*\*/.test(s));
        ok('…does not flag "Consequently," (a discourse marker opener)', !/\*\*Consequently\*\*/.test(s));
        const s2 = scan('lang-scan-starters', 'The storm rages. The wind howls. Alex waits.');
        // v7.20.613: the finding now SPLITS charged from permitted. S1 is charged on the second and
        // later use of an opener, never the first, so listing all of them together invited a student
        // to rewrite openers that cost them nothing (Neil, 2026-09-14: "distinguish a detected
        // pattern from a confirmed problem").
        ok('…separates the repeats worth changing from the first use, which is allowed',
            /Worth changing \(1\)/.test(s2) && /Fine as they are \(1\)/.test(s2), s2 && s2.slice(0, 200));
        ok('…says plainly that nothing is charged when no opener repeats',
            /nothing is costing you marks/.test(scan('lang-scan-starters', 'The storm rages. This unsettles us. Alex waits.')));
        ok('…links to Sentence Starters AND Coherence & Cohesion in the Toolkit',
            /@RESOURCE_LINK[^\n]*fix-sentence-starters/.test(s2) && /@RESOURCE_LINK[^\n]*cohesion/.test(s2));
        ok('a clean passage gets praise, not an empty scan', /no "shows"-family verbs/.test(scan('lang-scan-verbs', 'Through metaphor, the writer exposes grief.')));
        // ── v7.20.613: the combined SPaG CHECK. Both false positives below were found by running
        // the first cut and are kept as regression guards — each one would quietly teach a student
        // to "correct" writing that was already right, which is worse than not checking at all.
        const spag = (t) => scan('check-spag', t);
        ok('check-spag answers from CODE', typeof spag('He was tired , and  it is bleak.') === 'string');
        ok('…it is a CHECK, not a fix — it says it is changing nothing',
            /not changing them/.test(spag('He was tired , and  it is bleak.')));
        ok('…it states the scope it did NOT cover (a regex cannot parse a clause)',
            /What it did NOT cover/.test(spag('He was tired , and  it is bleak.')));
        ok('…REGRESSION: "metaphor" is not an American spelling (the first cut matched any -or word)',
            /found nothing to flag/.test(spag('Through metaphor the writer exposes grief. The imagery unsettles us.')));
        ok('…REGRESSION: quoted material is masked, and the mask does not itself trip a check',
            /found nothing to flag/.test(spag('The poet writes “the colour of  her realize i” and analyses it well.')));
        ok('…both -ise and -ize are accepted British usage and are never flagged',
            /found nothing to flag/.test(spag('The writer organises the scene; the poet realizes the cost.')));
        ok('…but it does find the real faults (double space · space before comma · lone i · repeat)',
            ['Double spaces', 'A space before punctuation', 'Lower-case', 'A word typed twice']
                .every(k => spag('He was tired , and  the imagery is bleak. i think the the colour is wrong.').includes(k)));
        ok('…and links to the Toolkit punctuation section', /@RESOURCE_LINK[^\n]*fix-punctuation/.test(spag('He was tired , and  it is bleak.')));
        ok('the CW scans still answer (cw-verbs unchanged)', /verb-circling pass/.test(scan('cw-verbs', 'She was tired and walked slowly.')));
        ok('an unknown action falls through to the API (null)', scan('scan-structure', prose) === null);
        ok('an empty selection falls through to the API (null)', scan('lang-scan-verbs', '   ') === null);
    }
}


// ── 8b. THE DOCUMENT IS READ IN CODE (v7.20.614) ────────────────────────────────────────────
// Neil, 2026-09-14: the structure scan claimed "both paragraphs present" about a selection whose
// shape it had never been told. Measured cause: every response section is ONE `swml-input-field`
// with `<br><br>` between paragraphs and ZERO `<p>` elements, so the paragraph count reaching the
// model was always 0 and `textContent` welded the paragraphs into one run.
//
// The four regression paragraphs below are Neil's own list: his supplied example, a structurally
// correct but shallow paragraph, one with no close analysis, and a strong alternative reading.
// The gate asserts the FACTS distinguish them — the verdict itself is the model's judgement, but a
// model cannot tell them apart from evidence that does not distinguish them.
console.log('\nThe document is COUNTED in code, not asserted by the model:');
{
    const P = WML.SelectionChip;
    const need = ['splitParagraphs', 'splitSentences', 'sentenceSignals', 'locateSelection', 'buildDocumentFacts'];
    ok('the chip exposes the pure document readers', need.every((n) => typeof P[n] === 'function'), need.filter((n) => typeof P[n] !== 'function'));

    // ⭐ THE ROOT: a `<br><br>`-separated input field is TWO paragraphs, not one welded run.
    ok('a <br><br> field splits into real paragraphs', P.splitParagraphs('One.\nTwo.\n\nSecond para.').length === 2);
    ok('…a soft single break does NOT start a new paragraph', P.splitParagraphs('One,\nstill one.').length === 1);
    ok('…and empty input yields nothing rather than a phantom paragraph', P.splitParagraphs('   \n\n  ').length === 0);

    const NEIL = "The writer uses a list of three to show the storm is violent. The quote 'wind lashing the trees, rain on the rooftop, and thunder' shows that the storm is getting worse and worse. The word 'lashing' shows the wind is like a whip which shows it is violent and out of control. This makes the reader feel scared for Alex because he is only a boy. This also makes the reader think the storm is like his feelings about his mother. The writer does this to show that Alex is not in control of his life.";
    const P2 = "The writer also uses a metaphor 'a sensation of being adrift in a boat'. This shows that Alex feels lost, he does not know what to do. The word 'adrift' shows he is floating with no direction. This makes the reader feel sorry for him.";
    // (b) structurally correct, every element present, every claim literal.
    const SHALLOW = "Allende presents the storm as loud. She uses the triadic list 'wind lashing the trees, rain on the rooftop, and thunder' to build the noise. The word 'thunder' is a loud sound. This makes the reader feel the noise. This also makes the reader notice the weather. Allende does this to show the storm is loud.";
    // (c) no sentence zooms to a single word — close analysis genuinely absent.
    const NO_CLOSE = "Allende presents the storm as an intruder into Alex's sleep. She uses the triadic list 'wind lashing the trees, rain on the rooftop, and thunder' to pile the sounds on top of one another. This makes the reader feel surrounded. This also makes the reader share his exhaustion. Allende exposes how little control he has over his own night.";
    // (d) a strong, supported alternative reading.
    const STRONG = "Allende makes the storm the continuation of Alex's nightmare rather than his escape from it. The triadic list 'wind lashing the trees, rain on the rooftop, and thunder' arrives in the sentence that explains what woke him, so the waking world inherits the dream's violence. The verb 'lashing' casts the wind as something that beats a body, which suggests the storm is not merely loud but punitive. This makes the reader read the weather as an assault rather than as weather. This also invites the reader to hear his own 'pounding' heart in its rhythm. Allende arguably positions the storm as the form his fear for his mother takes when he is awake.";

    const facts = (paras, sel) => {
        const h = P.locateSelection(paras, sel);
        return P.buildDocumentFacts({
            label: 'Q2 Response', type: 'response', question: 'Q2',
            paraCount: paras.length, paraTexts: paras,
            paraIndex: h.start, paraEnd: h.end !== h.start ? h.end : null,
            words: paras.join(' ').split(/\s+/).length,
        }, { sentences: true });
    };

    const fNeil = facts([NEIL, P2], NEIL);
    ok('⭐ the block STATES the paragraph count — the claim the scan used to invent', /holds \*\*2 paragraphs\*\*/.test(fNeil), fNeil.split('\n')[1]);
    ok('…and which paragraph the selection sits in, decided by the selection\'s own text', /selection sits in \*\*paragraph 1 of 2\*\*/.test(fNeil));
    ok('…a selection in the SECOND paragraph is located there, not defaulted to the first', /paragraph 2 of 2/.test(facts([NEIL, P2], P2)));
    ok('…a selection spanning both is reported as SPANNING, never as one', /SPANS paragraphs 1–2/.test(facts([NEIL, P2], NEIL + ' ' + P2)));
    ok('…an unlocatable selection says so rather than guessing', /could not be located/.test(facts([NEIL, P2], 'text that is nowhere in this document at all')));
    ok('the block forbids re-counting and describing unlisted sentences', /AUTHORITATIVE/.test(fNeil) && /never describe a sentence or paragraph this block does not list/.test(fNeil));
    ok('every sentence is quoted VERBATIM and numbered (no paraphrase to mis-attribute)',
        /S1 \(13w\) "The writer uses a list of three to show the storm is violent\."/.test(fNeil));

    // ⭐ FAULT 1 (Neil): the scan read S1 as a topic sentence. The facts say it names a technique.
    ok('⭐ S1 is shown NAMING A TECHNIQUE — the evidence the scan needed to see the topic sentence was displaced',
        /S1 [^\n]*names a technique: list of three/.test(fNeil));
    // ⭐ FAULT 2 (Neil): "limited depth is a quality issue, not evidence the element is absent."
    ok('⭐ S3 is shown ZOOMING TO ONE WORD — close analysis is PRESENT, however thin',
        /S3 [^\n]*zooms to a single word \(“lashing”\)/.test(fNeil));
    ok('…and the quotation it zooms into is named', /S3 [^\n]*quotes the text \(“lashing”\)/.test(fNeil));
    // ⭐ FAULT 4 (Neil): "do not attribute wording or ideas to a sentence that does not contain it."
    ok('⭐ repetition is EVIDENCED — the shared claim word is named, not recalled',
        /S3↔S1 share “violent”/.test(fNeil), (fNeil.match(/Content words shared[^\n]*/) || [''])[0]);
    ok('…and the block says outright that a shared word is not repetition by itself',
        /A shared word is NOT repetition by itself/.test(fNeil));
    ok('…the analytical furniture (writer · reader · shows · uses) is NOT counted as a shared claim word',
        !/share [^\n]*“(?:writer|reader|show|use|quote)”/.test(fNeil), (fNeil.match(/Content words shared[^\n]*/) || [''])[0]);

    // The four cases must be DISTINGUISHABLE from the facts alone.
    const fShallow = facts([SHALLOW], SHALLOW);
    const fNoClose = facts([NO_CLOSE], NO_CLOSE);
    const fStrong = facts([STRONG], STRONG);
    ok('⭐ REGRESSION (c): a paragraph with NO close analysis shows no zoom signal at all',
        !/zooms to a single word/.test(fNoClose), fNoClose);
    ok('⭐ REGRESSION (b): a shallow-but-complete paragraph still shows its zoom — shallow ≠ absent',
        /zooms to a single word/.test(fShallow));
    ok('…and the shallow one is marked as re-using its own claim word ("loud")',
        /share [^\n]*“loud”/.test(fShallow), (fShallow.match(/Content words shared[^\n]*/) || [''])[0]);
    ok('⭐ REGRESSION (d): the strong reading carries tentative language, which the thin ones do not',
        /tentative language/.test(fStrong) && !/tentative language/.test(fShallow));
    ok('…and the author\'s / character\'s name is never counted as a repeated claim word',
        !/share [^\n]*“(?:allende|alex|scrooge|macbeth)”/.test(fStrong), (fStrong.match(/Content words shared[^\n]*/) || [''])[0]);
    ok('…the strong reading carries MORE distinct signals than the shallow one (zoom · tentative · purpose)',
        /S3 [^\n]*zooms to a single word/.test(fStrong) && /tentative language/.test(fStrong) && /ascribes a purpose/.test(fStrong));
    ok('a purpose sentence is recognised by its verb, not by its position',
        /ascribes a purpose/.test(fNeil) && /ascribes a purpose/.test(fNoClose));

    // The block is only as big as the turn needs (Neil: keep API context focused).
    ok('no sentence table on turns that do not judge a sentence',
        !/sentence by sentence/.test(P.buildDocumentFacts({ label: 'Q2 Response', paraCount: 2, paraTexts: [NEIL, P2], paraIndex: 1, words: 231 }, {})));
    ok('…and the sentence table rides scan-structure, scan-elements, scan-concept and freetext',
        ['scan-structure', 'scan-elements', 'scan-concept', 'freetext'].every((a) => CHIP.includes("'" + a + "'"))
        && /const FACT_SENTENCE_ACTIONS = \[/.test(CHIP));
    ok('buildPrompt emits the facts block every turn it applies to', /const facts = buildDocumentFacts\(location, \{ sentences: FACT_SENTENCE_ACTIONS/.test(CHIP));

    // The full document must not weld either — getText() lost both labels and breaks.
    ok('the full-document snapshot is built from the DOM, not canvasEditor.getText()',
        /function _liveFullDoc\(\)/.test(CHIP) && /liveFullDoc = _liveFullDoc\(\)/.test(CHIP));
    ok('…it keeps the section labels the model locates by', /=== ' \+ label\.toUpperCase\(\) \+ ' \[' \+ type \+ '\] ===/.test(CHIP));
    ok('…and still NAMES an empty student section rather than dropping it (v7.19.421)',
        /EMPTY — the student has not written anything in this section yet/.test(CHIP));
    ok('the section context read is br-aware (the v7.20.340 weld, on the polishing side)',
        /_sectionParagraphs\(cur\)\.map\(\(u\) => u\.text\)/.test(CHIP) && /function _blockText\(node\)/.test(CHIP));
    ok('the selection text reaches extractLocation on BOTH the box-open and the send path',
        /extractLocation\(anchorEl, text\)/.test(CHIP) && /extractLocation\(sel\.anchorEl, sel\.text\)/.test(CHIP));
}

// ── 8c. THE DIAGNOSIS LAW IS IN THE LOADED PROTOCOL (v7.20.614) ─────────────────────────────
console.log('\nThe scan-diagnosis law and the interpretation ladder reach the model:');
{
    ok('inline-coaching-core.md carries HOW A SCAN DIAGNOSES', /## ⭐⭐ HOW A SCAN DIAGNOSES/.test(CORE));
    ok('…it names the three verdicts and forbids blurring them',
        /MISSING/.test(CORE) && /OUT OF ORDER/.test(CORE) && /PRESENT BUT THIN/.test(CORE)
        && /A thin element is never reported as a missing one/.test(CORE));
    ok('…it forbids stating a number the facts block does not state', /Never state a number the block does not state/.test(CORE));
    ok('…it forbids describing a sentence the block does not list', /Never describe a sentence the block does not list/.test(CORE));
    ok('…it names the multi-function rule (a job folded into another sentence is the finding)',
        /A SENTENCE MAY DO MORE THAN ONE JOB/.test(CORE));
    ok('…it forbids presenting our shape as the board\'s rule', /is \*\*not\*\* an exam-board\nrule/.test(CORE) || /OUR SHAPE IS OURS/.test(CORE));
    ok('…and the INPUT CONTRACT documents the facts block the chip now sends',
        /Document facts \(counted in CODE this turn — AUTHORITATIVE\)/.test(CORE));

    ok('rubric-base.md carries THE INTERPRETATION LADDER', /## ⭐⭐ THE INTERPRETATION LADDER/.test(BASE));
    ok('…anchored to the board\'s own word, not ours', /perceptive/.test(BASE) && /judicious/.test(BASE));
    ok('…with the six verdicts named', ['MISSING', 'LITERAL', 'REPETITION', 'PROMISING BUT UNDEVELOPED', 'SUPPORTED AND PRECISE', 'SPECULATION BEYOND THE EVIDENCE'].every((v) => BASE.includes(v)));
    ok('…and Neil\'s explicit brake: it is NOT one new inference per sentence',
        /THIS IS NOT A QUOTA OF ONE NEW INFERENCE PER SENTENCE/.test(BASE));
    ok('…and a symbolic reading is not perceptive by default', /never treat a symbolic reading\nas automatically perceptive/.test(BASE) || /wearing a good coat/.test(BASE));

    // Every analytical rubric points at both laws — one source, no per-paper drift (§13).
    const analytical = ['rubric-aqa-lang-p1-fiction.md', 'rubric-aqa-lang-p2-nonfiction.md', 'rubric-nonfiction-lang.md',
        'rubric-aqa-lit-shakespeare.md', 'rubric-aqa-lit-19c-novel.md', 'rubric-aqa-lit-modern-text.md',
        'rubric-aqa-lit-anthology-poetry.md', 'rubric-aqa-lit-unseen-poetry.md'];
    analytical.forEach((f) => {
        const R = read('protocols/shared/modules/rubrics/' + f);
        ok(f + ': points at both shared laws instead of restating them',
            /HOW EVERY SCAN BELOW DIAGNOSES/.test(R) && /THE INTERPRETATION LADDER/.test(R));
    });

    // The P1 worked diagnosis — the paragraph Neil actually tested.
    const P1R = read('protocols/shared/modules/rubrics/rubric-aqa-lang-p1-fiction.md');
    ok('the P1 rubric works Neil\'s own paragraph through the law', /wind lashing the trees/.test(P1R));
    ok('…and says outright that S3 IS the close analysis', /Do NOT ask \*"where's the close analysis sentence/.test(P1R));
    ok('…and that S1 displaced the topic sentence', /the topic sentence is MISSING, and a technique has taken its place/.test(P1R));
    ok('…quoting the extract, not inventing it (the words are Allende\'s)', /pounding in his chest/.test(P1R));

    // ⭐ The conclusion-element contradiction: 4 taught, never 7 (PEDAGOGY §32a).
    const SHK = read('protocols/shared/modules/rubrics/rubric-aqa-lit-shakespeare.md');
    ok('⭐ the Shakespeare rubric coaches FOUR conclusion elements, not seven',
        /\*\*for the conclusion, the FOUR taught elements\*\*/.test(SHK) && !/the seven conclusion elements/.test(SHK));
    ok('…and explains the seven MARKING criteria as depth inside those four', /those are the DEPTH inside the four elements/.test(SHK));
    const ASSESS_JS = read('frontend/wml-assessment.js');
    const conc = ASSESS_JS.slice(ASSESS_JS.indexOf('            conclusion: ['), ASSESS_JS.indexOf('            conclusion: [') + 900);
    ok('…which is what the engine\'s own element set holds (the one source)',
        ['Restated Thesis', 'Controlling Concept', "Author's Central Purpose", 'Universal Message'].every((l) => conc.includes(l))
        && (conc.match(/\{ id:/g) || []).length === 4);
}

// ── 8d. THE CALIBRATION STAGE (v7.20.614) ───────────────────────────────────────────────────
console.log('\nStep 6 — the calibration stage compares the two judgements and keeps the decision:');
{
    const A = read('frontend/wml-assessment.js');
    ok('there is a Calibration document section with ONE producer', /function buildCalibrationSection\(topicData\)/.test(A));
    ok('…it is a NEW section, so the existing section-level heal carries it into existing documents',
        /\{ label: CALIB_LABEL, build: \(\) => buildCalibrationSection\(\) \}/.test(A));
    ok('…it holds all three records distinctly (their mark, Sophia\'s, what they decided and why)',
        /inputHTML\("Sophia's mark", f\.sophia\)/.test(A) && /inputHTML\('What you decided after seeing both', f\.decision\)/.test(A)
        && /inputHTML\('Why — in your own words', f\.why\)/.test(A));
    ok('…and the ONE improvement goal', /inputHTML\('The ONE thing you will do differently next time', 'calib-goal'\)/.test(A));
    ok('the student may KEEP their own mark — Sophia\'s is not a verdict to submit to',
        /const CALIB_KEEP = 'Keep my own mark'/.test(A) && /an assessment to examine, not a verdict/.test(A));
    ok('…all three options exist (keep · take mine · in between)', /CALIB_TAKE/.test(A) && /CALIB_BETWEEN/.test(A));
    ok('the comparison numbers are read from the document, never recalled by the model',
        /function _calibActualFor\(qLabel\)/.test(A) && /function _calibCompareText\(g\)/.test(A));
    ok('…an unmarked question is skipped, never treated as a zero', /an unmarked question is simply not ready to calibrate, never a zero/.test(A));
    ok('the stage NEVER changes a mark', /this stage never writes to it/.test(A));
    ok('it is never marked and never scanned as a ledger row',
        /STRIP_LABELS = new Set\(\['Analytics', 'Self-Assessment', 'Mark-Scheme Self-Assessment', 'Calibration', 'Action Plan'\]\)/.test(A)
        && /Mark-Scheme Self-Assessment\|Calibration\|Action Plan/.test(A));
    ok('it opens on the [ASSESSMENT_COMPLETE] closing turn', /function _maybeOpenCalibration\(reply\)/.test(A) && /_maybeOpenCalibration\(_r\)/.test(A));
    ok('§4d LIVENESS: a typed turn mid-stage is consumed and the question RE-SERVED, never dropped to the AI',
        /Re-serve the question\.\n            _calibHostRenderCurrent\(\);\n            return true;/.test(A));
    ok('…and the typed consumer is wired into BOTH chat pipelines',
        (A.match(/if \(!_pcStage && _calibHostConsumeTyped\(msg\)\)/g) || []).length === 2);
    ok('§4c.7 FOSSIL: the live comparison is drawn, never stored', /durable: false, why: 'a present-state comparison of two live marks/.test(A));
    ok('§4c.10: the document scrolls to the feedback box being discussed', /_swmlScrollToTop\(fb\)/.test(A));

    const REST = read('includes/class-rest-api.php');
    ok('the calibration is filed onto the phase record by its own endpoint', /'\/phase\/calibration'/.test(REST) && /function save_phase_calibration/.test(REST));
    ok('…it MERGES, so no other field of the record is lost', /\$latest\['calibration'\] =/.test(REST));
    ok('…it refuses when there is no completed result to calibrate against', /No completed phase result to attach a calibration to/.test(REST));
    ok('…it round-trip verifies the write (the wp_unslash gotcha)', /Calibration saved but round-trip verification failed/.test(REST));
    ok('…and it can never fork a re-mark attempt (it writes no grade or total)',
        !/\$latest\['grade'\] =/.test(REST.slice(REST.indexOf('function save_phase_calibration'), REST.indexOf('public function complete_phase'))));

    ok('the client posts it when the stage completes', /API\.phaseCalibration/.test(A) && /function _calibPersist\(\)/.test(A));
    ok('…and a failed post never blocks the student (the document keeps the record)', /document record kept, phase record not updated/.test(A));
    ok('the API map carries the route', /phaseCalibration: config\.restUrl \+ 'phase\/calibration'/.test(_CORESRC));

    ok('⭐ the calibration TRAVELS into the polishing lesson', /WHAT THEY DECIDED AFTER MARKING THEMSELVES \(their calibration\)/.test(ROUTER));
    ok('…naming the goal they set and where their judgement was furthest out', /The one thing they said they would do differently/.test(ROUTER) && /furthest from the criteria/.test(ROUTER));
    ok('…and forbidding re-marking in a lesson that has no marks in it', /this lesson has no marks in it/.test(ROUTER));
}


// ── 8e. DEEP LINKS — the element → reference map, and WHEN a link may appear (v7.20.615) ────
// Neil, 2026-09-15: *"we want the students to get used to using the entire website"* — every
// element we ask a student to master needs a reference, and a stuck student needs a route to it.
// But retrieval comes FIRST: a link handed over at the finding teaches nothing.
console.log('\nEvery taught element has a reference, and the link is a LATE rung:');
{
    const mapSrc = _CORESRC.match(/const ELEMENT_TOOLKIT_MAP = \{[\s\S]*?\n    \};/);
    const fnSrc = _CORESRC.match(/function elementToolkitLines\(families\) \{[\s\S]*?\n    \}/);
    ok('wml-core.js carries ELEMENT_TOOLKIT_MAP and its ONE line producer', !!mapSrc && !!fnSrc);
    let M = null;
    try { M = new Function(mapSrc[0] + '\n' + fnSrc[0] + '\nreturn { ELEMENT_TOOLKIT_MAP, elementToolkitLines };')(); }
    catch (e) { ok('…and they evaluate in isolation (pure — no DOM, no window)', false, e.message); }
    if (M) {
        ok('…and they evaluate in isolation (pure — no DOM, no window)', true);
        const FAMS = Object.keys(M.ELEMENT_TOOLKIT_MAP);
        ok('the map covers the four kinds of writing we teach',
            ['analytical', 'iumvcc', 'creative', 'comparison'].every((f) => FAMS.includes(f)), FAMS);

        // ⭐ EVERY destination must be a REAL section AND in the allowlist. Either half failing
        // makes the chip render nothing at all, which is invisible to the student and to Neil.
        const args = [...new Set([].concat(...Object.values(M.ELEMENT_TOOLKIT_MAP)).map((r) => r.arg))];
        console.log('    ' + args.length + ' distinct Toolkit destinations across the map');
        // ⚠️ Whether each destination is in the allowlist AND resolves in the BUILT notes bundle is
        // asserted by bin/toolkit-link-gate.js — that gate owns the bundle and hard-FAILS when it
        // is absent, so the check belongs there and must never be duplicated weakly here.
        const allowSrc = _CORESRC.match(/const RESOURCE_TOOLKIT_IDS = (\[[\s\S]*?\]);/);
        const allow = allowSrc ? new Function('return ' + allowSrc[1] + ';')() : [];
        ok('every destination is in RESOURCE_TOOLKIT_IDS (else tagResourceLinks drops it silently)',
            args.every((a) => allow.includes(a)), args.filter((a) => !allow.includes(a)));

        // ⭐ THE ELEMENTS WE ACTUALLY TEACH — sourced from the engine's own OUTLINE_CRITERIA, not
        // from a list written here. An element with no reference is a CONTENT gap for the notes
        // lane; this gate names it rather than letting it pass unnoticed.
        const A = read('frontend/wml-assessment.js');
        const oc = A.slice(A.indexOf('const OUTLINE_CRITERIA'), A.indexOf('const OUTLINE_CRITERIA') + 20000);
        const taught = [...new Set([...oc.matchAll(/label: '([^']{3,40})'/g)].map((m) => m[1]))]
            .filter((l) => !/^(Hero|STAGE|TURNING|Protagonist|The |Opening|Theme|Snapshot|May have|Expand|If the|Main character|B Story|Foreshadows|Oppressive|Given |State of)/.test(l));
        const blob = JSON.stringify(M.ELEMENT_TOOLKIT_MAP).toLowerCase();
        // Each taught element is covered when the map names it, or names the section that holds it.
        const COVERED_BY_CONTAINER = {
            'Hook': 'intro', 'Building Sentences': 'intro', 'Restated Thesis': 'conclusion',
            'Technique + Evidence + Inference': 'fix-evidence', 'Effect 1 on Reader': 'fix-effects',
            'Effect 2 on Reader': 'fix-effects', "Author's Central Purpose": 'purposes',
            'Introduction': 'intro', 'Conclusion': 'conclusion',
        };
        const uncovered = taught.filter((l) => {
            const key = l.toLowerCase().replace(/[^a-z ]/g, '').trim();
            if (blob.includes(key)) return false;
            return !COVERED_BY_CONTAINER[l];
        });
        console.log('    ' + taught.length + ' taught element labels checked against the map');
        // The known gaps are NAMED, so a new one cannot hide among them (§10 fail loud).
        const KNOWN_GAPS = [
            'Source A — Perceptive Topic Sentence', 'Source A — Evidence + Developed Inference',
            'Source B — Discourse Marker + Perceptive Topic Sentence', 'Source B — Evidence + Developed Inference',
            'Hook technique', 'Devices', 'Urgency', 'Emotional appeal', 'Methodology', 'Vision', 'Emotion',
            'Tone', 'Counter-Argument', 'Objection family', 'Rebuttal technique', 'Rebuttal verb family',
            'Closing approach',
        ];
        const unexpected = uncovered.filter((l) => !KNOWN_GAPS.includes(l));
        ok('no NEW taught element has appeared without a reference (known gaps are listed in the notes handoff)',
            unexpected.length === 0, unexpected);

        // The line the model copies must be the marker tagResourceLinks actually parses.
        const lines = M.elementToolkitLines(['analytical']);
        ok('the analytical set lists the whole TTECEA+C paragraph, element by element', lines.length >= 20, lines.length);
        ok('…each line carries a COMPLETE, parseable @RESOURCE_LINK marker',
            lines.every((l) => /@RESOURCE_LINK\{"dest":"toolkit","arg":"[a-z0-9-]+","label":"[^"]+"\}/.test(l)));
        ok('…and every one of them parses as JSON the way tagResourceLinks parses it',
            lines.every((l) => { try { return !!JSON.parse(/(\{[^}]*\})/.exec(l)[1]).arg; } catch (e) { return false; } }));
        ok('⭐ the element Neil\'s scan found — Topic Sentences — has a line', /fix-topic-sentence/.test(lines.join('\n')));
        ok('…and so does the paragraph shape itself, which is what he was really asking for', /"arg":"body"/.test(lines.join('\n')));
        ok('a row whose section only CONTAINS the element says so, rather than implying its own page',
            /this section also covers/.test(lines.join('\n')));
        ok('the creative set does NOT claim to teach the seven scene elements (it holds the Story Spine)',
            !/seven scene/i.test(JSON.stringify(M.ELEMENT_TOOLKIT_MAP.creative)));
        ok('no duplicate destination inside one family (a menu of two links gets skipped)',
            Object.values(M.ELEMENT_TOOLKIT_MAP).every((f) => new Set(f.map((r) => r.arg)).size === f.length));
    }

    // The chip picks the right family, so an essay student is never sent to the Story Spine.
    const RF = WML.SelectionChip.referenceFamilies;
    ok('the chip exposes the family resolver', typeof RF === 'function');
    if (typeof RF === 'function') {
        ok('a reading question on a fiction paper gets the analytical set',
            RF({ text: 'aqa_lang_paper_1', subject: 'language1', task: 'polishing' }, { question: 'Q2' }).join() === 'analytical');
        ok('⭐ the WRITING question on a FICTION paper gets the creative set, not the essay set',
            RF({ text: 'aqa_lang_paper_1', subject: 'language1', task: 'polishing' }, { question: 'Q5' }).join() === 'creative');
        ok('⭐ the WRITING question on a NON-FICTION paper gets IUMVCC',
            RF({ text: 'aqa_lang_paper_2', subject: 'language2', task: 'polishing' }, { question: 'Q5' }).join() === 'iumvcc');
        ok('a Creative Writing lesson gets the creative set whatever the question',
            RF({ subject: 'creative_writing', task: 'cw_step_14' }, null).join() === 'creative');
        ok('anthology poetry adds the comparison connectives on top of the analytical set',
            RF({ text: 'love_relationships_poetry', subject: 'poetry_anthology', task: 'polishing' }, { question: null }).join() === 'analytical,comparison');
    }

    // The links ride the prompt, on the same turns as the sentence table.
    ok('buildPrompt sends the legal lines, and says COPY not compose',
        /Mastery Toolkit sections you may link to/.test(CHIP) && /never invent an `arg`/.test(CHIP));
    ok('…on the judgement turns only', /if \(FACT_SENTENCE_ACTIONS\.indexOf\(action \|\| 'freetext'\) !== -1\n\s+&& typeof WML !== 'undefined' && typeof WML\.elementToolkitLines/.test(CHIP));

    // The ORDER — retrieval first, the link late.
    ok('inline-coaching-core.md carries THE HELP LADDER FOR A SCAN FINDING', /## ⭐⭐ THE HELP LADDER FOR A SCAN FINDING/.test(CORE));
    ok('⭐ rung 0 and rung 1 forbid a link — the student must try first', /\*\*no link\*\*/.test(CORE));
    ok('…and rung 3 is where it belongs', /this is where the link belongs/.test(CORE));
    ok('a link NEVER replaces the question (§4d liveness)', /a link never replaces the question/.test(CORE));
    ok('the model is told to COPY the line, never compose an id', /COPY the line verbatim/.test(CORE) && /Never invent, guess, shorten or "fix" an `arg`/.test(CORE));
    ok('…and told what an invented id actually does — renders nothing at all', /\*\*renders\s+nothing at all\*\*/.test(CORE));
    ok('ONE link per turn — two is a menu and a menu gets skipped', /Never offer more than ONE link in a turn/.test(CORE));
    ok('⭐ an element with NO page is SAID, never substituted with the nearest one',
        /Never substitute\s+the nearest page/.test(CORE) && /don't have a\s+page on that one yet/.test(CORE));
    ok('the INPUT CONTRACT documents the block the chip now sends', /Mastery Toolkit sections you may link to`\*\* —/.test(CORE));
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
