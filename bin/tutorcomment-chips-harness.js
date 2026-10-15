#!/usr/bin/env node
/* eslint-env node */
/**
 * tutorcomment-chips-harness.js — v7.20.900 (Actions round ac; Neil 15 Oct, after the mix-up: "All 15").
 *
 * The end-of-document tutor comment box (renderTutorCommentInline) had NO one-tap comments. It now carries seven, from
 * Neil's own end-of-document comments on prod, in the approved card's words; two link to the Toolkit section that teaches
 * the point. The link rides the save, the server shape-checks it, and the student's card draws it through the SAME
 * producer as the passage comments (WML.learnChipHtml — an unknown section draws nothing).
 *
 * What it proves, from the SHIPPED code:
 *   A. CHIPS   — the seven, words exact, in order; the two links are Toolkit ids the allowlist holds, labelled with the
 *                section's own title in the built Toolkit bundle; the other five carry no link.
 *   B. WIRING  — the chip row sits above the box; a tap fills the box and picks the link; emptying the box drops it; the
 *                link rides the POST and is cleared on success; the draft link survives a remount; the student's card
 *                draws entry.link through WML.learnChipHtml; the server stores the sanitised link on the entry.
 *   C. SERVER  — sanitize_comment_link, executed in PHP: good toolkit + table links kept; a bad dest, a non-id toolkit arg,
 *                a colon, an empty arg, an over-long arg and a non-array all dropped; an empty label falls back to the arg.
 *   D. STYLE   — the comment area joins the coaching-card colour family (dark + light), so the chips are not unstyled.
 *   E. FALSIFY — four mutations each fail A–D.
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const JS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
const REST0 = fs.readFileSync(path.join(ROOT, 'includes', 'class-rest-api.php'), 'utf8');
const CSS0 = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-canvas.css'), 'utf8');
const BUNDLE = path.resolve(ROOT, '..', '..', '..', 'sophicly-plugins', 'sophicly-notes', 'assets', 'js', 'sophicly-toolkit.js');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

// Neil's approved words (round ac card), exactly.
const WANT = [
    ['Not 100% yet', 'This isn’t finished yet. Complete every box to 100% before you mark the lesson complete.', null],
    ['More detail', 'Good start. Now give each answer a little more detail: a full sentence or two, not a few words.', ['whathowwhy', 'What · How · Why · So What · What Next']],
    ['Use TTECEA', 'Remember to use the TTECEA structure we have practised, in every paragraph.', ['ttecea', 'TTECEA + C']],
    ['Finish today', 'Please finish this today.', null],
    ['Follow the videos', 'Work alongside the videos: do the exercise I am doing in the video, and don’t go ahead of it.', null],
    ['Ask me', 'If you’re not sure what to do, bring your question to the strategy session, or ask me in the chat.', null],
    ['Well done', 'Well done. This is complete, and it shows real effort.', null],
];

function chipsBlock(js) {
    const a = js.indexOf('        const TUTOR_NOTE_CHIPS = [');
    return a < 0 ? '' : js.slice(a, js.indexOf('\n        ];', a));
}
function checkChips(js, quiet) {
    const bad = [];
    const blk = chipsBlock(js);
    const items = [...blk.matchAll(/\{ label: '((?:[^'\\]|\\.)*)', text: '((?:[^'\\]|\\.)*)'(?:, link: _qcTk\('([^']+)', '((?:[^'\\]|\\.)*)'\))? \}/g)]
        .map((m) => [m[1], m[2], m[3] ? [m[3], m[4]] : null]);
    const same = JSON.stringify(items) === JSON.stringify(WANT);
    if (!same) bad.push('chips');
    if (!quiet) ok(same, 'the seven chips, Neil\'s words exactly, in order, links as approved' + (same ? '' : ' — GOT ' + JSON.stringify(items).slice(0, 300)));
    return bad;
}

console.log('A. chips');
checkChips(JS0, false);
const allowSrc = CORE.slice(CORE.indexOf('    const RESOURCE_TOOLKIT_IDS = ['), CORE.indexOf('];', CORE.indexOf('    const RESOURCE_TOOLKIT_IDS = [')));
const ALLOW = new Set([...allowSrc.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]));
ok(['whathowwhy', 'ttecea'].every((a) => ALLOW.has(a)), 'both Toolkit ids are in RESOURCE_TOOLKIT_IDS (the list toolkit-link-gate proves against the built bundle)');
if (!fs.existsSync(BUNDLE)) ok(false, 'the notes Toolkit bundle was not found at ' + BUNDLE + ' — labels UNVERIFIED');
else {
    const titles = new Map([...fs.readFileSync(BUNDLE, 'utf8').matchAll(/id:"([a-z0-9-]+)",(?:goto:"[a-z0-9-]+",)?t:"([^"]*)"/g)].map((m) => [m[1], m[2]]));
    ok(titles.get('whathowwhy') === 'What · How · Why · So What · What Next' && titles.get('ttecea') === 'TTECEA + C',
        'each link\'s label is the section\'s own title in the built Toolkit (what the student lands on)');
}

console.log('B. wiring');
const rt = JS0.slice(JS0.indexOf('        function renderTutorCommentInline(refetch) {'), JS0.indexOf('        // NodeView (re)mount hook (see wml-section-block.js tutorcomment branch).'));
const wiring = (src) => {
    const r = src.slice(src.indexOf('        function renderTutorCommentInline(refetch) {'), src.indexOf('        // NodeView (re)mount hook (see wml-section-block.js tutorcomment branch).'));
    return [
        ['the draft link lives beside the draft (survives a remount)', /let _tutorCommentDraft = '';\s*let _tutorCommentDraftLink = null;/.test(src)],
        ['the chip row is built from TUTOR_NOTE_CHIPS and sits ABOVE the box', /TUTOR_NOTE_CHIPS\.forEach\(item => \{/.test(r) && /wrap\.appendChild\(chipRow\);\s*wrap\.appendChild\(ta\);\s*wrap\.appendChild\(linkLine\);/.test(r)],
        ['a tap fills the box and picks the chip\'s link', /ta\.value = item\.text;\s*_tutorCommentDraft = item\.text;\s*_tutorCommentDraftLink = item\.link \|\| null;/.test(r)],
        ['emptying the box drops the link', /if \(ta\.value\.trim\(\)\) return;\s*_tutorCommentDraftLink = null;/.test(r)],
        ['the link rides the save', /if \(_tutorCommentDraftLink\) _body\.link = \{ dest: _tutorCommentDraftLink\.dest, arg: _tutorCommentDraftLink\.arg, label: _tutorCommentDraftLink\.label \};/.test(r) && /body: JSON\.stringify\(_body\)/.test(r)],
        ['a saved comment clears the draft and its link', /if \(res && res\.success\) \{ _tutorCommentDraft = ''; _tutorCommentDraftLink = null;/.test(r)],
        ['the student\'s card draws entry.link through WML.learnChipHtml (one producer)', /if \(entry\.link\) \{\s*const lh = WML\.learnChipHtml \? WML\.learnChipHtml\(entry\.link\) : '';/.test(r)],
    ];
};
for (const [label, good] of wiring(JS0)) ok(good, label);
ok(/\$link = self::sanitize_comment_link\(\$params\['link'\] \?\? null\);\s*if \(\$link\) \$entry\['link'\] = \$link;\s*\$thread\[\] = \$entry;/.test(REST0), 'the server stores the sanitised link on the new entry');

console.log('C. server');
function methodSrc(src) {
    const a = src.indexOf('    public static function sanitize_comment_link(');
    if (a < 0) throw new Error('sanitize_comment_link missing');
    return src.slice(a, src.indexOf('\n    }\n', a) + 6);
}
const SCASES = [
    ['a Toolkit link', { dest: 'toolkit', arg: 'whathowwhy', label: 'What · How · Why · So What · What Next' }, { dest: 'toolkit', arg: 'whathowwhy', label: 'What · How · Why · So What · What Next' }],
    ['a Table link with an apostrophe', { dest: 'table', arg: "Show, Don't Tell", label: "Show, Don't Tell" }, { dest: 'table', arg: "Show, Don't Tell", label: "Show, Don't Tell" }],
    ['an empty label falls back to the arg', { dest: 'toolkit', arg: 'ttecea', label: '' }, { dest: 'toolkit', arg: 'ttecea', label: 'ttecea' }],
    ['a bad dest', { dest: 'javascript', arg: 'ttecea', label: 'x' }, null],
    ['a Toolkit arg that is not a section id', { dest: 'toolkit', arg: 'TTECEA + C', label: 'x' }, null],
    ['a colon in the arg', { dest: 'table', arg: 'Simile: bad', label: 'x' }, null],
    ['an empty arg', { dest: 'toolkit', arg: '', label: 'x' }, null],
    ['an over-long arg', { dest: 'table', arg: 'x'.repeat(81), label: 'x' }, null],
    ['not an object', 'ttecea', null],
];
function runServer(src) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tcchips-'));
    const f = path.join(dir, 't.php'), inp = path.join(dir, 'in.json');
    fs.writeFileSync(inp, JSON.stringify(SCASES.map((c) => c[1])));
    fs.writeFileSync(f, '<?php\nfunction sanitize_text_field($s) { return trim(preg_replace(\'/\\s+/\', \' \', strip_tags((string) $s))); }\nclass T {\n' + methodSrc(src)
        + '\n}\n$out = [];\nforeach (json_decode(file_get_contents(' + JSON.stringify(inp) + '), true) as $c) $out[] = T::sanitize_comment_link($c);\necho json_encode($out);\n');
    try { return JSON.parse(execFileSync('php', [f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })); }
    finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
function checkServer(src, quiet) {
    let res;
    try { res = runServer(src); } catch (e) { if (!quiet) ok(false, 'php run failed: ' + String(e.stderr || e.message).slice(0, 200)); return null; }
    const bad = [];
    SCASES.forEach(([label, , want], i) => {
        const good = JSON.stringify(res[i]) === JSON.stringify(want);
        if (!good) bad.push(label);
        if (!quiet) ok(good, (want ? 'kept: ' : 'dropped: ') + label + (good ? '' : '  GOT ' + JSON.stringify(res[i])));
    });
    return bad;
}
if (checkServer(REST0, false) === null) ok(false, 'the shipped sanitiser could not be executed');

console.log('D. style');
const fam = CSS0.slice(CSS0.indexOf('.swml-phase-coach,\n.swml-weight-card,'), CSS0.indexOf('--swml-coach-surface: #1c1d1f;'));
const famL = CSS0.slice(CSS0.indexOf('.swml-canvas-light .swml-phase-coach,'), CSS0.indexOf('--swml-coach-surface: #ffffff;'));
ok(/\.swml-tutorcomment-ui \{/.test(fam) && /\.swml-canvas-light \.swml-tutorcomment-ui,/.test(famL) && /\[data-swml-theme="light"\] \.swml-tutorcomment-ui,/.test(famL),
    'the comment area joins the coaching-card colour family, dark and light (the .swml-cm-chip styles read those tokens)');

console.log('E. falsify — each mutation must break A–D');
const MUT = [
    ['a chip\'s words changed', (s) => s.replace("{ label: 'Finish today', text: 'Please finish this today.' }", "{ label: 'Finish today', text: 'Finish this today please.' }"), 'js'],
    ['the link left off the save', (s) => s.replace('if (_tutorCommentDraftLink) _body.link =', 'if (false) _body.link ='), 'js'],
    ['any dest accepted', (s) => s.replace("if ($dest !== 'toolkit' && $dest !== 'table') return null;", ''), 'php'],
    ['a Toolkit arg not checked', (s) => s.replace("if ($dest === 'toolkit' && !preg_match('/^[a-z0-9-]+$/', $arg)) return null;", ''), 'php'],
];
for (const [label, mut, kind] of MUT) {
    const src = mut(kind === 'js' ? JS0 : REST0);
    if (src === (kind === 'js' ? JS0 : REST0)) { ok(false, 'mutation did not apply: ' + label); continue; }
    let caught;
    if (kind === 'js') caught = checkChips(src, true).length > 0 || wiring(src).some(([, g]) => !g);
    else { const b = checkServer(src, true); caught = b !== null && b.length > 0; }
    ok(caught, 'mutation caught: ' + label);
}

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
