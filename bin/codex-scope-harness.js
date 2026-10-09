#!/usr/bin/env node
/* eslint-env node */
/**
 * codex-scope-harness.js — v7.20.780 (WML 339 A, FIXLIST #824). Neil approved (9 Oct, via LD): each Mastery Codex
 * lesson shows only its own questions — owned fields answerable, earlier answers readable but locked, later
 * questions hidden behind "Opens in Unit N, lesson …"; the lesson lands on its first question; a playlist clip that
 * starts scrolls to its question, never while the student is typing or has just scrolled.
 * Checks, against the SHIPPED files and LD's REAL 37-lesson contract (bin/fixtures/codex-lesson-map-2026-10-09.json):
 *   (1) PHP codex_scope_from_map (@CODEX-SCOPE-PURE, run under php): every lesson's owned/earlier/later partition the
 *       map's fields exactly; course order wins over map order; no row → fail-open; clips only to owned fields.
 *   (2) JS pure functions (@CODEX-SCOPE-PURE, executed): model, field states, stylesheet, landing field, clip → field,
 *       the two safeguards; every non-scoped state (absent/staff/review/no-row/bad-map) locks NOTHING.
 *   (3) wiring: the lock reaches typing (_swmlNodeLocked), choices (selectField), the refusal toast (§4d), the paint
 *       hooks, the server embed — and the template order IUMVCC above Story-Spine with the doc version bumped.
 *   node bin/codex-scope-harness.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const PHP = fs.readFileSync(path.join(ROOT, 'sophicly-writing-mastery-lab.php'), 'utf8');
const CONTRACT = JSON.parse(fs.readFileSync(path.join(ROOT, 'bin/fixtures/codex-lesson-map-2026-10-09.json'), 'utf8'));
let fail = 0, n = 0;
const ok = (c, m, got) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m + (c || got === undefined ? '' : '   got: ' + JSON.stringify(got).slice(0, 300))); };
console.log('codex-scope-harness — each Codex lesson shows only its own questions (v7.20.780, #824)');

// The option's shape, built from LD's contract exactly as write-codex-map.php stores it: { "<lesson id>": row } in course order.
const MAP = {};
CONTRACT.lessons.forEach(r => { MAP[String(r.lesson_id)] = { unit: r.unit, title: r.title, fields: r.fields, bento: r.bento, clip_tags: r.clip_tags }; });
const IDS = CONTRACT.lessons.map(r => String(r.lesson_id));
const ALL = [].concat(...CONTRACT.lessons.map(r => r.fields));
ok(IDS.length === 37 && ALL.length === 138 && new Set(ALL).size === 138, 'fixture = LD\'s real contract: 37 lessons, 138 fields, each owned once', [IDS.length, ALL.length]);

// ── (1) PHP pure function under php ──────────────────────────────────────────────────────────────────────────────
const pa = PHP.indexOf('// @CODEX-SCOPE-PURE-BEGIN'), pb = PHP.indexOf('// @CODEX-SCOPE-PURE-END');
ok(pa > 0 && pb > pa, 'PHP: codex_scope_from_map sits between its sentinels');
const phpFn = PHP.slice(PHP.indexOf('\n', pa) + 1, pb);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-scope-'));
const mapFile = path.join(tmp, 'map.json');
// ⚠️ Written as TEXT in course order: a JS object with numeric keys iterates in NUMERIC order, so JSON.stringify(MAP)
// would silently re-sort the lessons by post id. (That trap is why the server orders rows by the course's own steps.)
fs.writeFileSync(mapFile, '{' + IDS.map(id => JSON.stringify(id) + ':' + JSON.stringify(MAP[id])).join(',') + '}');
const numFile = path.join(tmp, 'map-numeric.json');
fs.writeFileSync(numFile, JSON.stringify(MAP));   // the re-sorted shape a JS-built option would have
const runPhp = (lesson, order, file) => {
    const f = path.join(tmp, 'run.php');
    fs.writeFileSync(f, '<?php\nclass H {\n' + phpFn + '\n}\n$m = json_decode(file_get_contents(' + JSON.stringify(file || mapFile) + '), true);\n'
        + 'echo json_encode(H::codex_scope_from_map($m, ' + JSON.stringify(lesson) + ', json_decode(' + JSON.stringify(JSON.stringify(order || {})) + ', true)));\n');
    return JSON.parse(execFileSync('php', [f], { encoding: 'utf8' }));
};
let partitionOk = true, firstBad = null;
IDS.forEach((id, i) => {
    const s = runPhp(Number(id));
    // A lesson that owns no field (46232 "Secrets of Learning" — LD removes its embed) gets the whole Codex (fail-open).
    if (!CONTRACT.lessons[i].fields.length) { if (s.state !== 'no-fields' && partitionOk) { partitionOk = false; firstBad = { id, state: s.state }; } return; }
    const own = new Set(s.owned), ear = new Set(s.earlier), lat = new Set(Object.keys(s.later || {}));
    const wantEar = new Set([].concat(...CONTRACT.lessons.slice(0, i).map(r => r.fields)));
    const wantLat = new Set([].concat(...CONTRACT.lessons.slice(i + 1).map(r => r.fields)));
    const same = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
    const good = s.state === 'scoped' && same(own, new Set(CONTRACT.lessons[i].fields)) && same(ear, wantEar) && same(lat, wantLat)
        && own.size + ear.size + lat.size === 138;
    if (!good && partitionOk) { partitionOk = false; firstBad = { id, state: s.state, own: own.size, ear: ear.size, lat: lat.size }; }
});
ok(partitionOk, 'PHP: for all 37 lessons, owned + earlier + later = the 138 fields exactly, split at that lesson', firstBad);
const l1 = runPhp(Number(IDS[0]));
ok(l1.earlier.length === 0 && Object.keys(l1.later).length === 138 - l1.owned.length, 'PHP: the first lesson has nothing earlier and everything else later');
const lab = l1.later[CONTRACT.lessons[1].fields[0]];
ok(lab === 'Unit ' + CONTRACT.lessons[1].unit + ', lesson ' + CONTRACT.lessons[1].title, 'PHP: a later field is labelled "Unit N, lesson <title>"', lab);
ok(l1.clips.length > 0 && l1.clips.every(c => l1.owned.includes(c.field)) && l1.bento === CONTRACT.lessons[0].bento, 'PHP: clip tags carried, only to fields this lesson owns, with its playlist id', l1.clips.slice(0, 2));
const none = runPhp(99999999);
ok(none.state === 'no-row', 'PHP: a lesson with no row → no-row (the page shows the whole Codex)', none);
ok(runPhp(Number(IDS[0]), {}).state === 'scoped', 'PHP: an empty course order keeps the map order');
// Course order wins: put the LAST lesson first in the course → for it, nothing is earlier.
const order = {}; order[IDS[36]] = 0; IDS.slice(0, 36).forEach((id, i) => { order[id] = i + 1; });
const moved = runPhp(Number(IDS[36]), order);
ok(moved.earlier.length === 0 && Object.keys(moved.later).length === 138 - moved.owned.length, 'PHP: the course\'s real order decides earlier/later, not the map\'s order', [moved.earlier.length, Object.keys(moved.later).length]);
// The numeric-order trap, end to end: a map whose rows are sorted by post id, plus the course's real order.
const courseOrder = {}; IDS.forEach((id, i) => { courseOrder[id] = i; });
const numericFirst = Object.keys(JSON.parse(fs.readFileSync(numFile, 'utf8')))[0];
const healed = runPhp(Number(IDS[0]), courseOrder, numFile);
ok(numericFirst !== IDS[0] && healed.earlier.length === 0 && Object.keys(healed.later).length === 138 - healed.owned.length,
    'PHP: a map re-sorted by post id still splits correctly once the course order is applied', [numericFirst, healed.earlier.length]);
// v7.20.786 (#833): every read-only field names its owning lesson, and that lesson is labelled — the deep link's data.
const mid = runPhp(Number(IDS[5]));
const ownerOk = Object.keys(mid.owner || {}).length === 138 - mid.owned.length && Object.keys(mid.owner).every(f => {
    const r = CONTRACT.lessons.find(x => String(x.lesson_id) === mid.owner[f]); return r && r.fields.includes(f) && !mid.owned.includes(f);
}) && mid.owned.every(f => !(f in mid.owner));
ok(ownerOk, 'PHP #833: owner maps every earlier + later field to the lesson whose row holds it, and never an owned field', Object.keys(mid.owner || {}).length);
const anyLid = mid.owner[CONTRACT.lessons[0].fields[0]];
ok(mid.lessons && mid.lessons[anyLid] === 'Unit ' + CONTRACT.lessons[0].unit + ', lesson ' + CONTRACT.lessons[0].title, 'PHP #833: lessons labels each owning lesson "Unit N, lesson <title>"', mid.lessons && mid.lessons[anyLid]);
fs.rmSync(tmp, { recursive: true, force: true });

// ── (2) JS pure functions, executed from the shipped file ────────────────────────────────────────────────────────
const ja = JS.indexOf('// @CODEX-SCOPE-PURE-BEGIN'), jb = JS.indexOf('// @CODEX-SCOPE-PURE-END');
ok(ja > 0 && jb > ja, 'JS: the scope functions sit between their sentinels');
// eslint-disable-next-line no-new-func
const F = new Function(JS.slice(ja, jb) + '\nreturn { codexScopeModel, codexFieldState, codexFieldLockedIn, codexScopeCss, codexFirstOwned, codexClipField, codexFollowAllowed, codexRefusalText, codexSectionBar, codexLessonHref };')();
// The JS side is fed the shape the server sends; built here from the contract directly.
const scopeFor = (i) => {
    const own = CONTRACT.lessons[i].fields;
    const earlier = [].concat(...CONTRACT.lessons.slice(0, i).map(r => r.fields));
    const later = {}; CONTRACT.lessons.slice(i + 1).forEach(r => r.fields.forEach(f => { later[f] = 'Unit ' + r.unit + ', lesson ' + r.title; }));
    const owner = {}, lessons = {}, urls = {};
    CONTRACT.lessons.forEach((r, j) => { if (j === i || !r.fields.length) return; lessons[String(r.lesson_id)] = 'Unit ' + r.unit + ', lesson ' + r.title; urls[String(r.lesson_id)] = 'https://x.test/lesson/' + r.lesson_id + '/'; r.fields.forEach(f => { owner[f] = String(r.lesson_id); }); });
    return { state: 'scoped', lesson: CONTRACT.lessons[i].lesson_id, owned: own, earlier, later, owner, lessons, urls, bento: CONTRACT.lessons[i].bento || '',
        clips: (CONTRACT.lessons[i].clip_tags || []).map(c => ({ index: c.index, field: c.field })) };
};
['absent', 'staff', 'review', 'no-row', 'bad-map', 'no-fields'].forEach(st => {
    const m = F.codexScopeModel(st === 'absent' ? null : { state: st, owned: ['x'] });
    ok(m === null && F.codexFieldLockedIn(m, CONTRACT.lessons[0].fields[0]) === false, 'JS: state ' + st + ' → no model → nothing locked (fail-open)');
});
const i5 = 5, m5 = F.codexScopeModel(scopeFor(i5));
const f5own = CONTRACT.lessons[i5].fields[0], f5ear = CONTRACT.lessons[0].fields[0], f5lat = CONTRACT.lessons[36].fields[0];
ok(F.codexFieldState(m5, f5own) === 'own' && F.codexFieldState(m5, f5ear) === 'earlier' && F.codexFieldState(m5, f5lat) === 'later'
    && F.codexFieldState(m5, 'unit-x.not-in-map') === 'open', 'JS: field states own / earlier / later / open');
ok(!F.codexFieldLockedIn(m5, f5own) && F.codexFieldLockedIn(m5, f5ear) && F.codexFieldLockedIn(m5, f5lat) && !F.codexFieldLockedIn(m5, 'unit-x.not-in-map'),
    'JS: locked = earlier or later; own and unknown stay answerable');
// Stylesheet over a realistic section layout: one section per lesson, plus one split section.
const secs = CONTRACT.lessons.map(r => r.fields.slice());
const split = [CONTRACT.lessons[i5].fields[0], CONTRACT.lessons[36].fields[0]];
const css = F.codexScopeCss(secs.concat([split]), m5);
const laterSec = '.swml-section-block:has([data-field-id="' + CONTRACT.lessons[36].fields[0] + '"]) > .swml-section-content > *{display:none !important}';
ok(css.includes(laterSec), 'JS: an all-later section hides its content');
ok(css.includes('Opens in Unit ' + CONTRACT.lessons[36].unit + ', lesson ' + CONTRACT.lessons[36].title.replace(/"/g, '\\"')), 'JS: …and says where it opens');
const LOCKED = '{opacity:.5;filter:grayscale(1);cursor:not-allowed;';
ok(!css.includes('From an earlier lesson') && css.includes('#swml-tiptap-editor [data-field-id="' + f5ear + '"]' + LOCKED), 'JS #833: an earlier answer LOOKS read-only (faded, grey, lock icon, no-entry cursor), and carries no unclickable label');
ok(!css.includes('[data-field-id="' + f5own + '"]{') && !css.includes(':has([data-field-id="' + f5own + '"])'), 'JS: the lesson\'s own section gets no rule at all');
ok(css.includes('#swml-tiptap-editor [data-field-id="' + CONTRACT.lessons[36].fields[0] + '"]{display:none !important}'), 'JS: in a split section only the later field is hidden');
const evil = F.codexScopeCss([['a"b']], F.codexScopeModel({ state: 'scoped', owned: ['own'], earlier: [], later: { 'a"b': 'Unit 9, lesson "Q" \\ end' } }));
ok(evil.includes('[data-field-id="a\\"b"]') && evil.includes('lesson \\"Q\\" \\\\ end'), 'JS: quotes and backslashes in ids and titles are escaped', evil.slice(0, 160));
ok(F.codexScopeCss(secs, null) === '', 'JS: no model → empty stylesheet');
// v7.20.785 (#832): a later question already answered is SHOWN (greyed, read-only); only unanswered later ones stay hidden.
const latI = CONTRACT.lessons.map((r, i) => r.fields.length >= 2 ? i : -1).filter(i => i > 5).pop();
const latF = CONTRACT.lessons[latI].fields, latSecRule = '.swml-section-block:has([data-field-id="' + latF[0] + '"]) > .swml-section-content > *{display:none !important}';
const cssAns = F.codexScopeCss(secs, m5, new Set([latF[0]]));
ok(!cssAns.includes(latSecRule) && cssAns.includes('#swml-tiptap-editor [data-field-id="' + latF[0] + '"]' + LOCKED) && !cssAns.includes('#swml-tiptap-editor [data-field-id="' + latF[0] + '"]{display:none'),
    'JS #832: an ANSWERED later question is shown greyed, its section is not collapsed');
ok(latF.length >= 2 && cssAns.includes('#swml-tiptap-editor [data-field-id="' + latF[1] + '"]{display:none !important}'), 'JS #832: …while an UNANSWERED question beside it stays hidden');
// v7.20.786 (#833): the section bar names the owning lesson and links there, landing on the answer.
const latRow = CONTRACT.lessons[latI], barLat = F.codexSectionBar(latF, m5, new Set([latF[0]]));
ok(barLat && barLat.kind === 'later' && barLat.lessons.length === 1 && barLat.lessons[0].label === 'Unit ' + latRow.unit + ', lesson ' + latRow.title
    && barLat.lessons[0].url === 'https://x.test/lesson/' + latRow.lesson_id + '/' && barLat.lessons[0].field === latF[0], 'JS #833: an answered later section gets a bar naming its lesson, with that lesson\'s link, landing on the answer', barLat);
const earRow = CONTRACT.lessons[0], barEar = F.codexSectionBar(earRow.fields, m5, new Set());
ok(barEar && barEar.kind === 'earlier' && barEar.lessons.length === 1 && barEar.lessons[0].url === 'https://x.test/lesson/' + earRow.lesson_id + '/' && barEar.lessons[0].field === earRow.fields[0],
    'JS #833: an earlier section gets the same bar and link (same read-only state, same missing link)', barEar);
ok(F.codexSectionBar(CONTRACT.lessons[i5].fields, m5, new Set(CONTRACT.lessons[i5].fields)) === null && F.codexSectionBar(latF, m5, new Set()) === null && F.codexSectionBar(['unit-x.not-in-map'], m5, new Set()) === null,
    'JS #833: no bar on the lesson\'s own questions, on unanswered later ones, or on unmapped fields');
const two = F.codexSectionBar([CONTRACT.lessons[0].fields[0], CONTRACT.lessons[1].fields[0], f5own], m5, new Set());
ok(two && two.lessons.length === 2 && two.lessons[0].lesson === String(CONTRACT.lessons[0].lesson_id) && two.lessons[1].lesson === String(CONTRACT.lessons[1].lesson_id),
    'JS #833: a section holding answers from two lessons links to both, in document order', two);
ok(two && two.lessons[0].kind === 'earlier' && (F.codexSectionBar([CONTRACT.lessons[36].fields[0]], m5, new Set([CONTRACT.lessons[36].fields[0]])) || { lessons: [{}] }).lessons[0].kind === 'later',
    'JS #836: each linked lesson carries its own kind (earlier/later) — the SPA transition direction', two);
ok(F.codexLessonHref('https://x.test/l/', 'unit-1.a b', false) === 'https://x.test/l/?codex_field=unit-1.a%20b' && F.codexLessonHref('https://x.test/l/?x=1', 'f', true) === 'https://x.test/l/?x=1&codex_field=f&codex_scope=1'
    && F.codexLessonHref('', 'f', false) === '', 'JS #833: the link lands on the answer (codex_field), keeps a staff preview in the student view, and is empty without a URL');
const cssNone = F.codexScopeCss(secs, m5, new Set());
ok(cssNone.includes(latSecRule) && cssNone === F.codexScopeCss(secs, m5), 'JS #832: nothing answered → later sections collapse behind "Opens in", exactly as before');
const allAns = new Set([].concat(...CONTRACT.lessons.map(r => r.fields)));
const cssAll = F.codexScopeCss(secs, F.codexScopeModel(scopeFor(0)), allAns);
ok(!/display:none/.test(cssAll), 'JS #832: a student who answered everything sees every question from the FIRST lesson (Neil: "I should be able to see everything")');
ok(F.codexRefusalText(m5, latF[0]) === 'This answer is from Unit ' + latRow.unit + ', lesson ' + latRow.title + '. To change it, use the “Go to that lesson” button above it.'
    && F.codexRefusalText(m5, f5ear).startsWith('This answer is from Unit ' + earRow.unit + ', lesson ' + earRow.title)
    && F.codexRefusalText(m5, f5own) === '', 'JS #833: a refused keystroke names the owning lesson and points at the button above it; own fields are never refused');
ok(F.codexFirstOwned(secs, m5) === CONTRACT.lessons[i5].fields[0], 'JS: lands on the first owned field in DOCUMENT order');
const m0 = F.codexScopeModel(scopeFor(0)), c0 = CONTRACT.lessons[0].clip_tags[0];
ok(F.codexClipField(m0, { bentoId: CONTRACT.lessons[0].bento, index: c0.index }) === c0.field, 'JS: a clip index → its tagged field');
ok(F.codexClipField(m0, { bentoId: 'some_other_playlist', index: c0.index }) === null, 'JS: another playlist on the page never moves the Codex');
ok(F.codexClipField(m0, { index: 999 }) === null, 'JS: an untagged clip moves nothing');
ok(F.codexClipField(m0, { index: 999, item: { codex_field: CONTRACT.lessons[0].fields[1] } }) === CONTRACT.lessons[0].fields[1], 'JS: an item tagged codex_field wins');
ok(F.codexClipField(m0, { index: 999, item: { codex_field: CONTRACT.lessons[9].fields[0] } }) === null, 'JS: …but never to a field this lesson does not own');
ok(F.codexFollowAllowed(10000, 0, 0, 5000) && !F.codexFollowAllowed(10000, 6000, 0, 5000) && !F.codexFollowAllowed(10000, 0, 5001, 5000),
    'JS: follow only after 5 s without a keystroke AND without the student scrolling');

// ── (3) wiring ───────────────────────────────────────────────────────────────────────────────────────────────────
const fnBody = (src, sig) => { const a = src.indexOf(sig); if (a < 0) return ''; return src.slice(a, src.indexOf('\n    }\n', a) + 6); };
ok(/inputField'.*_codexFieldLocked\(/.test(fnBody(JS, 'function _swmlNodeLocked(node)')), 'wiring: _swmlNodeLocked locks a Codex input another lesson owns (typing, paste, drop, delete all consult it)');
const selView = JS.slice(JS.indexOf("name: 'selectField'"), JS.indexOf("name: 'selectField'") + 9000);
ok(/_cxLocked = _codexFieldLocked\(/.test(selView) && /if \(_cxLocked\) return;/.test(selView) && /if \(_cxLocked\) sel\.disabled = true;/.test(selView) && /if \(_cxLocked\) chip\.disabled = true;/.test(selView),
    'wiring: Codex choices are disabled and refused at save');
ok(/if \(_refused\) _codexRefusalToast\(/.test(JS), 'wiring: typing into a locked box says why (§4d)');
ok(/const answered = _codexAnsweredSet\(editor\);\s*const css = codexScopeCss\(sections, model, answered\);/.test(JS) && /showToast\(codexRefusalText\(_codexModel\(\), fid\), 4000, true\);/.test(JS),
    'wiring #832: the stylesheet is fed the answered fields, and the refusal toast uses codexRefusalText');
ok(/_renderCodexBars\(model, answered\);/.test(JS) && /_renderCodexBars\(null, null\); return; \}/.test(JS), 'wiring #833: every scope pass fills the bars, and clears them when the Codex is not scoped');
ok(/_codexLanded = landKey;\s*\n(?:\s*\/\/[^\n]*\n)*\s*_codexLastKeyAt = 0; _codexLastUserScrollAt = 0;/.test(JS),
    'wiring #836: a new lesson\'s landing starts from zero — typing or scrolling in the lesson just left (alive across a Focus SPA move) never holds it back');
ok(/const want = _codexWantedField\(\);/.test(JS) && /if \(target && first === want\) _codexFlash\(first\);/.test(JS), 'wiring #833: arriving by the link lands on that answer and highlights it');
const SB = fs.readFileSync(path.join(ROOT, 'frontend/wml-section-block.js'), 'utf8');
ok(/codexBar\.className = 'swml-codex-bar';/.test(SB) && /if \(codexBar && \(codexBar === mutation\.target \|\| codexBar\.contains\(mutation\.target\)\)\) return true;/.test(SB),
    'wiring #833: the section NodeView builds the bar and FIREWALLS it (§PM NodeView law — fills must never reach the DOMObserver)');
const bars833 = fnBody(JS, 'function _renderCodexBars(model, answered)');
ok(/a\.textContent = 'Go to that lesson to edit it →';/.test(bars833) && /window\.WML\.arrowizeEl\(a\)/.test(bars833),
    'wiring #835: the lesson button draws Neil\'s own arrow through the arrowize seam (#177); the "→" literal stays in textContent');
// v7.20.788 (#836): a plain click moves through the Focus SPA (header + sidebar stay, focusSpaNavigated flushes the
// typing) — never a full reload; a modified click / no SPA / another origin keeps the ordinary link.
const spaClick = bars833.slice(bars833.indexOf("a.addEventListener('click'"), bars833.indexOf('row.appendChild(a);'));
ok(/ev\.stopPropagation\(\);/.test(spaClick) && /ev\.button !== 0 \|\| ev\.metaKey \|\| ev\.ctrlKey \|\| ev\.shiftKey \|\| ev\.altKey\) return;/.test(spaClick)
    && /typeof spa\.navigateTo !== 'function'\) return;/.test(spaClick) && /new URL\(a\.href\)\.origin === window\.location\.origin/.test(spaClick)
    && /ev\.preventDefault\(\);[\s\S]*spa\.state\.direction = l\.kind === 'earlier' \? 'prev' : 'next';[\s\S]*spa\.navigateTo\(a\.href\);/.test(spaClick)
    && /a\.addEventListener\('mousedown', \(ev\) => ev\.stopPropagation\(\)\);/.test(bars833),
    'wiring #836: the lesson button navigates through the Focus SPA (sidebar transition, direction from its kind), keeps new-tab clicks ordinary, and the editor never takes the press');
ok(/learndash_get_step_permalink\(\(int\) \$lid, \$cid\)/.test(PHP) && /\$scope\['urls'\] = \(object\) \$urls;/.test(PHP), 'wiring #833: the server sends each owning lesson\'s URL in this course');
ok((JS.match(/_codexScopeApply\((canvasEditor|editor)\)/g) || []).length >= 3, 'wiring: scope applied on first paint, after the resume, and on every update');
ok(/addEventListener\('sophicly:media-item'/.test(JS), 'wiring: the clip-started event is followed');
// v7.20.784 (#830): on a phone the pane grows and the SHELL scrolls — landing + clip-follow use the nearest real scroller.
const scrollTo = fnBody(JS, 'function _codexScrollTo(target, allowPage)');
ok(/if \(_swmlScrollerOf\(block\)\) \{ _swmlScrollToTop\(block\); return true; \}/.test(scrollTo) && !/pane\.scrollHeight/.test(scrollTo),
    'wiring: landing scrolls the canvas\'s nearest REAL scroller (pane on a desktop, shell on a phone), not only the pane');
const follow = JS.slice(JS.indexOf("addEventListener('sophicly:media-item'"), JS.indexOf("addEventListener('sophicly:media-item'") + 900);
ok(/_codexScrollTo\(target, false\);/.test(follow), 'wiring: clip-follow uses the same scroller and never moves the page');
const toTop = fnBody(JS, 'function _swmlScrollToTop(target, pad)');
ok(/const cw = inCanvas \? _swmlScrollerOf\(target\) : null;/.test(toTop) && /if \(inCanvas && !cw\) return;/.test(toTop),
    'wiring: the one jump helper finds the real scroller and never scrollIntoView()s inside the canvas (that would shift the overflow:hidden boxes)');
ok(/'codexScope'\] = \$codex_scope/.test(PHP) && /codex_scope_for_lesson\(\(int\) \$post_id\)/.test(PHP), 'wiring: the server sends codexScope for mastery_codex');
ok(/get_option\('swml_codex_lesson_map', null\);\s*\n\s*if \(\$raw === null \|\| \$raw === false \|\| \$raw === ''\) return null;/.test(PHP), 'wiring: no option → null → the Codex behaves exactly as before (LD\'s on-switch rule)');
ok(/sophicly_review_target_id\(\)\) return \['state' => 'review'\]/.test(PHP) && /return \['state' => 'staff'\]/.test(PHP) && /isset\(\$_GET\['codex_scope'\]\)/.test(PHP),
    'wiring: reviewers and staff see the whole Codex; ?codex_scope=1 previews the student view');
const tpl = fnBody(JS, 'function buildMasteryCodexTemplate()');
ok(tpl.indexOf("'IUMVCC Draft (6 Beats)'") > 0 && tpl.indexOf("'IUMVCC Draft (6 Beats)'") < tpl.indexOf("'Story-Spine Draft (6 Beats)'"), 'template: IUMVCC (lesson 16) sits above Story-Spine (lesson 18)');
ok(/'mastery_codex': 21,/.test(JS), 'template: Codex document version bumped to 21 (answers carried by mergeCodexFields)');

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
