#!/usr/bin/env node
/* eslint-env node */
// comment-modal-harness.js — v7.20.797 (#847) + v7.20.798 (#849 every Common Issues chip links · #850 the popover). Neil, 9 Oct: the tutor comment modal sat "slightly down to the
// bottom right" (absolute inside .swml-canvas, whose box includes the right panel), its chips were not minimal,
// it needed a brand pass, three quick comments were missing, and a quick comment should deep-link to the
// relevant Mastery Toolkit section or Table of Techniques card. This fails the build if any of that regresses —
// above all, if a quick comment's link points at a section or technique that does not exist (a dead chip draws
// nothing, which reads exactly like "not built").
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'frontend/wml-canvas.css'), 'utf8');
const TOT = fs.readFileSync(path.join(ROOT, 'protocols/shared/reference/table-of-techniques.md'), 'utf8');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

const fnStart = JS.indexOf('        function addComment(selFrom, selTo) {');
const fn = JS.slice(fnStart, JS.indexOf('\n        }\n', fnStart) + 11);

// ── Position + brand: the house modal, body-mounted ──
ok(/el\('div', \{ className: 'swml-review-modal-overlay swml-cm-overlay' \}\)/.test(fn) && /className: 'swml-review-modal swml-cm'/.test(fn),
    'the comment modal wears the house modal (.swml-review-modal-overlay / .swml-review-modal)');
ok(/document\.body\.appendChild\(overlay\);/.test(fn) && !/canvas\.appendChild\(overlay\)/.test(fn),
    'BODY-mounted, so the fixed overlay centres on the screen — not inside .swml-canvas (which includes the right panel)');
const ov = CSS.slice(CSS.indexOf('.swml-review-modal-overlay {'), CSS.indexOf('}', CSS.indexOf('.swml-review-modal-overlay {')));
ok(/position:\s*fixed;/.test(ov) && /align-items:\s*center;/.test(ov) && /justify-content:\s*center;/.test(ov) && /overscroll-behavior:\s*contain;/.test(ov),
    'the house overlay is fixed, centred both ways, and contains overscroll');
ok(/overlay\.addEventListener\('wheel', e => \{ if \(e\.target === overlay\) e\.preventDefault\(\); \}, \{ passive: false \}\);/.test(fn)
    && /overlay\.addEventListener\('touchmove'/.test(fn) && /document\.body\.style\.overflow = 'hidden';/.test(fn) && /document\.body\.style\.overflow = prevOverflow;/.test(fn),
    'scroll isolation, all three layers (root CLAUDE.md §OVERLAY): backdrop swallows wheel/touch, body locked and restored');
ok(/e\.key === 'Escape'/.test(fn) && /document\.removeEventListener\('keydown', onKeydown, true\);/.test(fn), 'Esc closes, and the key listener leaves with the modal');
ok(/_swmlIncrediblesBtn\('Add comment'/.test(fn) && /className: 'swml-mc-gate-quiet', type: 'button', textContent: 'Cancel'/.test(fn), 'brand: the house button submits, the house quiet button cancels');
ok(!/\.swml-comment-modal\b|\.swml-quick-chip\b/.test(CSS) && !/swml-comment-modal|swml-quick-chip/.test(JS), 'the old skin is gone (no .swml-comment-modal / .swml-quick-chip left to fight the house rules)');
const chipCss = CSS.slice(CSS.indexOf('.swml-cm-chip {'), CSS.indexOf('}', CSS.indexOf('.swml-cm-chip {')));
ok(/border:\s*0;/.test(chipCss) && !/box-shadow|gradient/.test(chipCss), 'minimal chips: no border, no 3D shadow, no gradient');
ok(/\[data-swml-theme="light"\] \.swml-cm \.swml-btn-main/.test(CSS), 'the body-mounted house button gets its light-theme skin');

// ── The three new quick comments (his words as the labels) ──
for (const lab of ['Too descriptive', 'Not conceptual enough', 'Not perceptive enough']) {
    ok((JS.match(new RegExp("\\{ label: '" + lab + "', text: ")) || []).length === 1, 'quick comment "' + lab + '" exists exactly once');
}

// ── Every link resolves: toolkit args via ELEMENT_TOOLKIT_MAP.analytical (each proven by toolkit-link-gate),
//    table names via table-of-techniques.md (the same parse as get_technique_names) ──
const qStart = JS.indexOf('        const QUICK_COMMENTS = [');
const qBlock = JS.slice(qStart, JS.indexOf('\n        ];\n', qStart));
// v7.20.798 (#849): _qcTk(arg) takes its label from ELEMENT_TOOLKIT_MAP; _qcTk(arg, 'Label') passes the section's own title.
const tkCalls = [...qBlock.matchAll(/_qcTk\('([^']+)'(?:, '((?:[^'\\]|\\.)*)')?\)/g)].map(m => ({ arg: m[1], label: m[2] ? m[2].replace(/\\'/g, "'") : null }));
const tkArgs = tkCalls.map(c => c.arg);
const techs = [...qBlock.matchAll(/_qcTech\('([^']+)'\)/g)].map(m => m[1]);
const mapStart = CORE.indexOf('    const ELEMENT_TOOLKIT_MAP = {');
const analytical = CORE.slice(CORE.indexOf('analytical: [', mapStart), CORE.indexOf('\n        ],', CORE.indexOf('analytical: [', mapStart)));
const mapArgs = new Set([...analytical.matchAll(/arg: '([^']+)'/g)].map(m => m[1]));
const allowSrc = CORE.slice(CORE.indexOf('    const RESOURCE_TOOLKIT_IDS = ['), CORE.indexOf('];', CORE.indexOf('    const RESOURCE_TOOLKIT_IDS = [')));
const ALLOW = new Set([...allowSrc.matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1]));
const notAllowed = tkArgs.filter(a => !ALLOW.has(a));
ok(tkArgs.length >= 22 && notAllowed.length === 0, 'every Toolkit link (' + tkArgs.length + ') is in RESOURCE_TOOLKIT_IDS — the list bin/toolkit-link-gate.js proves against the built bundle' + (notAllowed.length ? ' — NOT ALLOWED: ' + notAllowed.join(', ') : ''));
const unlabelled = tkCalls.filter(c => !mapArgs.has(c.arg) && !c.label);
ok(unlabelled.length === 0, 'a link outside ELEMENT_TOOLKIT_MAP passes its own label' + (unlabelled.length ? ' — MISSING: ' + unlabelled.map(c => c.arg).join(', ') : ''));
// The label a student reads on the chip must be the title they land on. The notes bundle is a sibling repo; a
// missing bundle is a FAILURE (as in toolkit-link-gate) — a label that cannot be checked is the one that drifts.
const BUNDLE = path.resolve(ROOT, '..', '..', '..', 'sophicly-plugins', 'sophicly-notes', 'assets', 'js', 'sophicly-toolkit.js');
if (!fs.existsSync(BUNDLE)) ok(false, 'the notes Toolkit bundle was not found at ' + BUNDLE + ' — labels UNVERIFIED');
else {
    const titles = new Map([...fs.readFileSync(BUNDLE, 'utf8').matchAll(/id:"([a-z0-9-]+)",t:"([^"]*)"/g)].map(m => [m[1], m[2]]));
    const wrong = tkCalls.filter(c => c.label && titles.get(c.arg) !== c.label);
    ok(wrong.length === 0, 'every own-label matches the section title in the built Toolkit' + (wrong.length ? ' — WRONG: ' + wrong.map(c => c.arg + ' "' + c.label + '" vs "' + titles.get(c.arg) + '"').join('; ') : ''));
}
// #849, Neil: "do we have a deep link for every single one of those?" — every Common Issues chip links.
const common = qBlock.slice(qBlock.indexOf("category: 'Common Issues'"), qBlock.indexOf("category: 'Praise'"));
const commonItems = [...common.matchAll(/\{ label: '((?:[^'\\]|\\.)*)'[^\n]*/g)];
const commonNoLink = commonItems.filter(m => !/link: _qc(Tk|Tech)\(/.test(m[0])).map(m => m[1]);
ok(commonItems.length >= 13 && commonNoLink.length === 0, 'every Common Issues chip (' + commonItems.length + ') has a deep link' + (commonNoLink.length ? ' — NO LINK: ' + commonNoLink.join(', ') : ''));
const names = new Set([...TOT.matchAll(/^###\s+(.+?)\s+`[^`]{1,4}`\s*$/gm)].map(m => m[1]));
const badTech = techs.filter(t => !names.has(t));
ok(techs.length >= 14 && badTech.length === 0, 'every Table link (' + techs.length + ') names a real technique in table-of-techniques.md' + (badTech.length ? ' — MISSING: ' + badTech.join(', ') : ''));
ok(/label: 'Too descriptive'[^\n]*_qcTk\('fix-topic-sentence'\)/.test(qBlock) && /label: 'Not conceptual enough'[^\n]*_qcTk\('conceptual'\)/.test(qBlock)
    && /label: 'Not perceptive enough'[^\n]*_qcTk\('interpretation-ladder'\)/.test(qBlock), 'the three new comments link to Topic Sentences · Conceptual Thinking · The Interpretation Ladder');
const praise = qBlock.slice(qBlock.indexOf("category: 'Praise'"), qBlock.indexOf("category: 'TTECEA Breakdown'"));
ok(!/link:/.test(praise), 'praise carries no link (nothing to fix)');

// ── The link travels: stored on the message, drawn through ONE producer ──
ok(/if \(pickedLink\) first\.link = \{ dest: pickedLink\.dest, arg: pickedLink\.arg, label: pickedLink\.label \};/.test(fn), 'the picked link is stored on the comment\'s first message');
ok(/const lh = WML\.learnChipHtml \? WML\.learnChipHtml\(msg\.link\) : '';/.test(JS), 'the thread draws a stored link through WML.learnChipHtml');
ok(/function learnChipHtml\(link\) \{[\s\S]{0,400}renderLearnChipTokens\(tagResourceLinks\(marker\)\)/.test(CORE) && /\n        learnChipHtml,/.test(CORE),
    'learnChipHtml runs the SAME validation as Sophia\'s @RESOURCE_LINK (unknown → nothing), and is exported');

// Behaviour: run the real learnChipHtml chain (tagResourceLinks + renderLearnChipTokens) from the shipped core.
try {
    // Top-level core functions are 4-space indented and close on their own '    }' line (brace-counting would trip on regex literals).
    const grab = (sig) => { const a = CORE.indexOf(sig); if (a < 0) throw new Error('missing ' + sig); return CORE.slice(a, CORE.indexOf('\n    }\n', a) + 6); };
    const idsSrc = CORE.slice(CORE.indexOf('    const RESOURCE_TOOLKIT_IDS = ['), CORE.indexOf('];', CORE.indexOf('    const RESOURCE_TOOLKIT_IDS = [')) + 2);
    const ctx = { window: { SophiclyToolkit: { open() {} }, SophiclyTable: { open() {} } }, console: { warn() {} }, swmlConfig: { techniqueNames: [...names] } };
    vm.createContext(ctx);
    vm.runInContext('let _techMatcher = null;\n' + idsSrc + '\n' + grab('function _resolveTechniqueName(text)') + '\n' + grab('function tagResourceLinks(text)')
        + '\n' + grab('function renderLearnChipTokens(html)') + '\n' + grab('function learnChipHtml(link)') + '\nthis.learnChipHtml = learnChipHtml;', ctx);
    const a = ctx.learnChipHtml({ dest: 'toolkit', arg: 'fix-topic-sentence', label: 'Topic Sentences' });
    const b = ctx.learnChipHtml({ dest: 'table', arg: 'Metaphor', label: 'Metaphor' });
    const c = ctx.learnChipHtml({ dest: 'toolkit', arg: 'no-such-section', label: 'X' });
    ok(/class="swml-learn-chip" data-learn-dest="toolkit" data-learn-arg="fix-topic-sentence"/.test(a) && /Learn: Topic Sentences/.test(a), 'behaviour: a Toolkit link becomes the house learn chip');
    ok(/data-learn-dest="table" data-learn-arg="Metaphor"/.test(b), 'behaviour: a Table link becomes the house learn chip');
    ok(c === '', 'behaviour: an unknown section draws nothing (never a dead chip)');
} catch (e) { ok(false, 'behaviour check could not run: ' + e.message); }

// ── #850 (v7.20.798): the comment POPOVER — same family, and right for a live-modelling lesson ──
const famDark = CSS.slice(CSS.indexOf('.swml-phase-coach,\n.swml-weight-card,'), CSS.indexOf('--swml-coach-surface: #1c1d1f;'));
const famLight = CSS.slice(CSS.indexOf('.swml-canvas-light .swml-phase-coach,'), CSS.indexOf('--swml-coach-surface: #ffffff;'));
ok(/\.swml-comment-popover/.test(famDark) && /\.swml-canvas-light \.swml-comment-popover/.test(famLight) && /\[data-swml-theme="light"\] \.swml-comment-popover/.test(famLight),
    'the popover joins the coaching-card family tokens, dark and light (the canvas class AND the body attribute, for the extract pad)');
const popCss = CSS.slice(CSS.indexOf('.swml-comment-popover {\n    position: absolute;'), CSS.indexOf('}', CSS.indexOf('.swml-comment-popover {\n    position: absolute;')));
ok(/background: var\(--swml-coach-surface\);/.test(popCss) && /box-shadow: var\(--swml-coach-shadow\);/.test(popCss) && !/border:/.test(popCss),
    'the popover surface + shadow come from the family; no hairline border');
const blockStart = CSS.indexOf('/* ── Comment popover — v7.20.798 (#850)');
const popBlock = CSS.slice(blockStart, CSS.indexOf('/* ── Comment modal — v7.20.797 (#847)'));
ok(blockStart > 0 && !/inset 0|radial-gradient|oklch\(|--btn-inner/.test(popBlock), 'no 3D buttons left in the popover (no inset bevels, no radial gradients)');
const pop = JS.slice(JS.indexOf('        function showCommentPopover(commentId, anchorEl, popoverContainer) {'), JS.indexOf('        function findCommentRange(commentId) {'));
ok(/const isLiveAuthor = isLiveDoc && !state\.reviewMode;/.test(pop) && /const isTutor = \(!!state\.reviewMode && !isReadonly && !isPreview\) \|\| isLiveAuthor;/.test(pop)
    && /const isStudent = !isLiveAuthor && /.test(pop), 'live modelling: the AUTHOR gets the tutor\'s controls, never the student ladder (no self-"Acknowledged", no "Mark actioned")');
ok(/if \(!isLiveDoc\) headerLeft\.appendChild\(statusChip\);/.test(pop) && !/statusChip\.style\.color/.test(pop), 'live modelling shows no Open/Acknowledged status; elsewhere the colour lives on the dot only');
ok(/textContent: 'Comment' \}/.test(pop) && !/textContent: 'Thread' \}/.test(pop), 'the popover is titled "Comment", not "Thread"');
ok(/_swmlIncrediblesBtn\('Mark actioned'/.test(pop) && /_swmlIncrediblesBtn\('Submit'/.test(pop), 'the student\'s one deliberate action wears the house button');
ok(/const commentRole = \(state\.reviewMode \|\| \(WML\.isLiveModelling && WML\.isLiveModelling\(\)\)\) \? 'tutor' : 'student';/.test(fn), 'a live-modelling author\'s comment is saved as the TUTOR\'s');

console.log('\n' + (fail ? '❌ FAIL' : '✅ PASS') + ' — ' + n + ' checks');
process.exit(fail);
