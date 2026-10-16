#!/usr/bin/env node
/* eslint-env node */
/**
 * library-panel-harness.js — v7.20.861 (FIXLIST rail-feedback-library-popout). Neil, 13 Oct: "select resources from
 * the library to pop out". The Library rail button lists the Library's pages for the text a student is working on and
 * opens one in a draggable pad, through the Library's resource-content route (Library v1.53.0).
 *
 * What this proves, and why each one is here:
 *   1. The PURE rules (@LIBRARY-PURE, extracted from the shipped file and run):
 *      · a lesson's text reaches its Library text through the map, by NAME — never by a post ID, because the IDs
 *        differ between staging and prod (Macbeth 55911 / 54607, measured 13 Oct);
 *      · resources are ORDERED by exam board, never filtered — an untagged or all-boards resource can never vanish;
 *      · a locked part shows only its message, whatever else the row carries.
 *   2. The WIRING in the shipped file: hidden on test tasks (a test stays a test), every Library call goes through
 *      apiGet (X-WP-Nonce — without it a signed-in student reads as a visitor and every part is locked), every failure
 *      leaves a Try again (§4d), the panel uses the shared rail shell, the pad the shared drag/resize/raise shell.
 *   3. The SERVER half: the same helper feeds BOTH swmlConfig sites (one missing = the button silently absent on one
 *      route — the v7.20.522 lesson), no config without the Library route (no dead control), the map is keyed on
 *      canonical slugs, and the Edexcel IGCSE board pairs with the term the Library actually uses.
 *
 * Usage: node bin/library-panel-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const PHP = fs.readFileSync(path.join(ROOT, 'sophicly-writing-mastery-lab.php'), 'utf8');
const REST = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, got) {
    if (cond) { pass++; console.log('  ✓ ' + msg); }
    else { fail++; console.log('  ✗ ' + msg + (got !== undefined ? '  — got: ' + JSON.stringify(got) : '')); }
}

// ── 1. the pure rules ────────────────────────────────────────────────────────────────────────────────────────────
console.log('\n1. pure rules (@LIBRARY-PURE, run from the shipped file)');
const a = JS.indexOf('/* @LIBRARY-PURE-START'), b = JS.indexOf('/* @LIBRARY-PURE-END */');
if (a === -1 || b === -1 || b < a) {
    console.log('  ✗ the @LIBRARY-PURE sentinels are missing from wml-assessment.js');
    process.exit(1);
}
let P;
try {
    P = new Function(JS.slice(a, b) + '\nreturn { libTextFor, libSplitByBoard, libRowView, libToolkitTarget };')();
} catch (e) {
    console.log('  ✗ the @LIBRARY-PURE block does not run on its own: ' + e.message);
    process.exit(1);
}
const LIB = {
    texts: [{ id: 54607, slug: 'macbeth', title: 'Macbeth' }, { id: 54609, slug: 'an-inspector-calls', title: 'An Inspector Calls' }],
    map: { macbeth: 'macbeth', inspector_calls: 'an-inspector-calls', aic: 'an-inspector-calls', jane_eyre: 'jane-eyre-charlotte-bronte' },
    boards: { aqa: ['aqa'], 'edexcel-igcse': ['edexcel-gcse'], edexcel: ['edexcel'] },
};
ok(P.libTextFor('macbeth', LIB) && P.libTextFor('macbeth', LIB).id === 54607, 'a mapped text reaches its Library text');
ok(P.libTextFor('aic', LIB) && P.libTextFor('aic', LIB).id === 54609, 'an alias form reaches the same text (the server expands the map)');
ok(P.libTextFor('lord_of_the_flies', LIB) === null, 'an unmapped text has no Library text (the panel still offers the others)');
ok(P.libTextFor('jane_eyre', LIB) === null, 'a map entry whose Library text is not on this site resolves to nothing, not a stale id');
ok(P.libTextFor('', LIB) === null && P.libTextFor('macbeth', null) === null, 'no text / no config → nothing');

const R = (id, slugs, all) => ({ id, exam_boards: slugs.map(s => ({ slug: s, name: s.toUpperCase() })), all_boards: !!all });
const res = [R(1, ['aqa']), R(2, ['edexcel']), R(3, []), R(4, ['all-exam-boards']), R(5, ['ocr', 'eduqas'], true), R(6, ['edexcel-gcse'])];
const ids = (xs) => xs.map(x => x.id).join(',');
let s = P.libSplitByBoard(res, 'aqa', LIB);
ok(ids(s.mine) === '1,3,4,5' && ids(s.other) === '2,6', 'AQA: own board, untagged, all-boards first; other boards after', { mine: ids(s.mine), other: ids(s.other) });
ok(s.mine.length + s.other.length === res.length, 'ORDER, never filter: every resource is in one of the two lists');
s = P.libSplitByBoard(res, 'edexcel-igcse', LIB);
ok(ids(s.mine) === '3,4,5,6', 'Edexcel IGCSE pairs with the Library term edexcel-gcse (measured 13 Oct)', ids(s.mine));
s = P.libSplitByBoard(res, 'universal', LIB);
ok(ids(s.mine) === '1,2,3,4,5,6' && !s.other.length, 'a board with no terms (universal) puts everything first');
ok(ids(P.libSplitByBoard(null, 'aqa', LIB).mine) === '', 'no resources → two empty lists, never a throw');

ok(P.libRowView({ locked: true, lockMessage: 'This is included with the Bronze plan.', html: '<p>LEAK</p>' }).kind === 'locked'
    && !('html' in P.libRowView({ locked: true, html: '<p>LEAK</p>' })), 'a locked part shows its message and never its html');
ok(/plan/.test(P.libRowView({ locked: true }).message), 'a locked part with no message still says it is part of a plan');
ok(P.libRowView({ type: 'pdf', downloadUrl: 'https://x/y.pdf' }).kind === 'pdf', 'a PDF part becomes a link');
ok(P.libRowView({ type: 'pdf', downloadUrl: 'https://x/y.pdf', locked: true }).kind === 'locked', 'a locked PDF is locked, not a link');
ok(P.libRowView({ type: 'tiptap', html: '<p>x</p>' }).kind === 'html', 'a text part shows its html');
ok(P.libRowView({ type: 'tiptap', html: '' }).kind === 'empty' && P.libRowView(null).kind === 'empty', 'an empty part is said to be empty');

// ── 2. the wiring in the shipped file ───────────────────────────────────────────────────────────────────────────
// v7.20.911 (Neil 16 Oct): a Library link into the Mastery Toolkit opens it in place, at that section.
{
    const T = P.libToolkitTarget, K = 'https://www.sophicly.com/library/resources/sophicly-gcse-english-mastery-toolkit/';
    ok(T(K + '?sn_toolkit=inference-every-element') === 'inference-every-element', 'a Toolkit deep link → its section id');
    ok(T(K) === '' && T('/library/resources/sophicly-gcse-english-mastery-toolkit/') === '', 'the Toolkit page itself (absolute or relative) → its front page');
    ok(T('https://sophiclymain-staging.kjjabv7qty-yjr3ozq9r41m.p.temp-site.link/library/resources/sophicly-gcse-english-mastery-toolkit/?sn_toolkit=ttecea') === 'ttecea', 'staging links count too');
    ok(T(K + '?sn_toolkit=<script>') === '', 'a malformed section id opens the front page, never passes through');
    ok(T('https://www.sophicly.com/library/resources/macbeth-model-answers/') === null && T('https://www.aqa.org.uk/x?sn_toolkit=ttecea') === null && T('') === null && T('mailto:a@b.c') === null,
        'every other link (another Library page, another site, empty, mailto) keeps its new tab');
}

console.log('\n2. wiring');
const blkStart = JS.indexOf('/* @LIBRARY-PURE-END */');
const blkEnd = JS.indexOf('// ── Comparison-Poem viewer', blkStart);
const BLK = (blkStart > -1 && blkEnd > blkStart) ? JS.slice(blkStart, blkEnd) : '';
ok(BLK.length > 0, 'the Library block sits between @LIBRARY-PURE-END and the Comparison-Poem viewer');
ok(/if\s*\(\s*_lib\s*&&\s*!_paTestingTask\s*\)\s*btnColumn\.appendChild\(libraryBtn\)/.test(BLK),
    'the button is added only with a Library config AND never on a test task (diagnostic · quiz · mark-scheme test)');
ok(JS.indexOf('const _paTestingTask') > -1 && JS.indexOf('const _paTestingTask') < JS.indexOf('if (_lib && !_paTestingTask)'),
    'the test predicate is declared before the Library button uses it');
ok(/function _libApi\(path\)\s*\{\s*return apiGet\(_lib\.restUrl \+ path\);\s*\}/.test(BLK), 'every Library call goes through apiGet (X-WP-Nonce)');
// v7.20.915: ONE named exception — the likes toggle posts to the Library's admin-ajax action with its own nonce in the
// form body (not a REST call, so apiGet's X-WP-Nonce does not apply). Every other fetch is still refused.
ok(!/\bfetch\(/.test(BLK.replace("await fetch(_libFavs.ajaxUrl, { method: 'POST', body: fd, credentials: 'same-origin' })", '')), 'no raw fetch() in the Library block (it would drop the nonce) — except the likes toggle, which carries the Library nonce in its body');
ok((BLK.match(/_libRetry\(/g) || []).length >= 3, 'both loaders end a failure on a message + Try again (§4d)', (BLK.match(/_libRetry\(/g) || []).length);
ok(/_wireRailPanel\(panel, \{ header: hdr, anchorTrigger: anchorBtn \}\)/.test(BLK) && /swml-outline-panel swml-resources-panel swml-prior-panel swml-library-panel/.test(BLK),
    'the panel is the shared rail shell (one default — v7.20.318/.319)');
ok(/_makePanelInteractive\(panel\)/.test(BLK) && /document\.body\.appendChild\(panel\)/.test(BLK), 'the pad uses the shared drag/resize/raise shell, portalled to <body>');
ok(/querySelectorAll\('script, style, iframe, object, embed'\)/.test(BLK) && /\/\^on\/i\.test\(a\.name\)/.test(BLK),
    'Library html is stripped of script/style/iframe and on* handlers before it is shown');
ok(/_closeOtherRailPanels\(_libPanel\)/.test(BLK) && /_anchorRailPanel\(_libPanel, anchorBtn\)/.test(BLK), 'opening it closes the other rail panels and anchors to the button');
// v7.20.862: a whole resource above the reader's plan arrives as locked + requiredTier + rows [] (staging, 13 Oct).
ok(/res\.locked\s*\?\s*\(res\.lockMessage \|\| \(tier \?/.test(BLK) && /'This is included with the ' \+ tier\.charAt\(0\)\.toUpperCase\(\)/.test(BLK),
    "a wholly locked resource says which plan includes it (the Library's wording first, else the tier in words)");

// ── 3. the server half ──────────────────────────────────────────────────────────────────────────────────────────
console.log('\n3. server half');
ok((PHP.match(/'library'\s*=>\s*self::library_config\(\)/g) || []).length === 2, 'BOTH swmlConfig sites carry the same library_config() (v7.20.522 lesson)',
    (PHP.match(/'library'\s*=>\s*self::library_config\(\)/g) || []).length);
const cfgI = PHP.indexOf('public static function library_config()');
const cfg = cfgI > -1 ? PHP.slice(cfgI, PHP.indexOf('\n    }\n', cfgI)) : '';
ok(/if \(!function_exists\('sophicly_api_get_resource_content'\)\) return null;/.test(cfg), 'no Library route on the site → null → no button (no dead control)');
ok(/if \(!\$texts\) return null;/.test(cfg), 'no published Library texts → null → no button');
ok(/SWML_REST_API::slug_aliases\(\)/.test(cfg), 'alias forms are expanded from the ONE slug registry, never a second table');
ok(/isset\(\$have\[\$lib\]\)/.test(cfg), 'only map entries whose Library text exists on THIS site are sent');
const mapI = PHP.indexOf('const LIBRARY_TEXT_MAP = [');
const mapSrc = mapI > -1 ? PHP.slice(mapI, PHP.indexOf('];', mapI)) : '';
const mapKeys = [...mapSrc.matchAll(/'([a-z0-9_]+)'\s*=>\s*'([a-z0-9-]+)'/g)].map(m => m[1]);
ok(mapKeys.length >= 25, 'the text map is present', mapKeys.length);
const aliasSrc = REST.slice(REST.indexOf('private static $SLUG_ALIASES'), REST.indexOf('];', REST.indexOf('private static $SLUG_ALIASES')));
const aliasKeys = [...aliasSrc.matchAll(/'([a-z0-9_]+)'\s*=>/g)].map(m => m[1]);
const aliasKeyed = mapKeys.filter(k => aliasKeys.includes(k));
ok(aliasKeys.length > 5 && !aliasKeyed.length, 'the map is keyed on CANONICAL slugs only (aliases are expanded, never listed)', aliasKeyed);
ok(/'edexcel-igcse'\s*=>\s*\['edexcel-gcse'\]/.test(PHP), "Edexcel IGCSE → the Library's 'edexcel-gcse' term (measured 13 Oct)");

console.log('\n4. reading + navigation (v7.20.910 — Neil 16 Oct: spacing, contents, search, load only when needed)');
{
    const CSS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-canvas.css'), 'utf8');
    ok(/\.swml-library-row p \{ margin: 0 0 12px; \}/.test(CSS), 'paragraphs carry the live Library page gap (12px)');
    ok(/\.swml-library-row h1 \{ font-size: 20px; \}/.test(CSS) && /\.swml-library-row h2 \{ font-size: 16px; \}/.test(CSS), 'headings take the Library reader sizes, never the theme’s');
    const fill = BLK.slice(BLK.indexOf('async function _libFillPad'), BLK.indexOf('function _libPadTools'));
    ok(/_libPadTools\(body\);\s*\}\s*$/.test(fill.trim() + '\n}') || /_libPadTools\(body\);/.test(fill), 'the tools are built inside _libFillPad, after the content arrived (nothing exists before a pad opens)');
    const tools = BLK.slice(BLK.indexOf('function _libPadTools'), BLK.indexOf('function spawnLibraryPad'));
    ok(/if \(items\.length < 2 && heads\.length < 3\) return;/.test(tools), 'a short page gets no tools (2+ parts or 3+ headings only)');
    ok(/querySelectorAll\('\.swml-library-row'\)\.forEach\(row =>/.test(tools) && !/createTreeWalker\(body/.test(tools), 'search reads the Library text only — never the part headers (a mark in a header would break its toggle)');
    ok(/const tk = libToolkitTarget\(a\.getAttribute\('href'\)\);[\s\S]{0,300}if \(!\(window\.SophiclyToolkit && window\.SophiclyToolkit\.open\)\) return;[\s\S]{0,80}e\.preventDefault\(\);\s*window\.SophiclyToolkit\.open\(tk\);/.test(BLK), 'a Toolkit link opens in place ONLY when the Toolkit is on the page — otherwise the new tab, as before');
    ok(/hits\.length < 500/.test(tools), 'search caps its highlights (a one-letter page cannot freeze the pad)');
    ok(/\['mousedown', 'pointerdown', 'keydown'\]\.forEach\(t => search\.addEventListener/.test(tools), 'typing in the search box never drags the pad or reaches the document');
}

console.log('\n5. likes — ONE store with the Library (v7.20.915, Neil 16 Oct) + the house scroll-to');
{
    const fv = PHP.slice(PHP.indexOf('public static function library_favs()'), PHP.indexOf('public static function library_favs()') + 1600);
    ok(/get_user_meta\(get_current_user_id\(\), '_sophicly_fav_resources', true\)/.test(fv), "the pad reads the Library's own list (_sophicly_fav_resources) — never a second key");
    ok(/wp_create_nonce\('sophicly_library_nonce'\)/.test(fv) && /function_exists\('sophicly_toggle_fav_resource'\)/.test(fv), "it writes through the Library's own action + nonce, and offers no hearts where that action is missing");
    ok(/'favs'\s*=> self::library_favs\(\)/.test(PHP), 'library_config carries the likes');
    ok(/const _libFavs = \(_lib && _lib\.favs && !state\.reviewMode\)/.test(BLK), 'no hearts in review (the viewer\'s likes are not the student\'s)');
    ok(/fd\.append\('action', 'sophicly_toggle_fav_resource'\)/.test(BLK) && /credentials: 'same-origin'/.test(BLK), 'a tap posts the Library\'s own toggle');
    ok(/catch \(e\) \{\s*if \(was\) _libFavIds\.add\(id\); else _libFavIds\.delete\(id\);\s*paint\(was\);[\s\S]{0,120}showToast/.test(BLK), 'a failed save puts the heart back AND says so (§4d)');
    ok(/_libFavIds\.clear\(\); j\.data\.favorites\.forEach/.test(BLK), "the server's list wins after every save");
    ok(BLK.indexOf("_libGroup('Saved'") > -1 && BLK.indexOf("_libGroup('Saved'") < BLK.indexOf('const cur = libTextFor(state.text, _lib);'), 'Saved is the first group in the panel');
    ok(/WML\.smoothScrollTo\(body, top\)/.test(BLK), 'contents + search jumps use the house scroll-to (BRAND §SCROLL-TO)');
    const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
    ok(/const SCROLL_TO_MS = 1500;/.test(CORE) && /t < 0\.5 \? 2 \* t \* t : 1 - Math\.pow\(-2 \* t \+ 2, 2\) \/ 2/.test(CORE), 'the house scroll-to is 1.5 s power2.inOut (the landing page floating nav)');
}

console.log(`\n${fail ? '✗' : '✓'} library-panel-harness: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
