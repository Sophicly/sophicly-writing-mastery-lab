#!/usr/bin/env node
/* eslint-env node */
/**
 * rail-panel-harness.js — BEHAVIOURAL + structural gate for the rail panels (v7.20.319).
 *
 * Slices the REAL `_wireRailPanel` out of wml-assessment.js and drives it against a minimal fake
 * DOM, so what is asserted is the shipped code (same method as cw1-loop-harness.js).
 *
 * ⭐ WHY THIS EXISTS. Neil could not resize ANY rail panel and Previous Assessments had no detach
 * button at all. Two failures, both silent:
 *
 *   1. v7.20.317 gave `.swml-outline-panel` an intrinsic width band (min 260 / max 380). Every
 *      resize handler only wrote `style.width`, and max-width beats width however it is set — so a
 *      panel already at the 380px cap simply did not move. No error, no warning; the drag handler
 *      ran perfectly and the browser threw the result away. A CSS-vs-JS clamp is invisible to every
 *      syntax and scope gate we own, which is exactly why it needs a behavioural one.
 *   2. Detach/dock/drag/resize was hand-rolled three times. The .318 port of Previous Assessments
 *      copied the CSS and not the interaction, so the fourth panel silently had none of it.
 *
 * So this gate asserts BOTH: that the band is actually released when a drag writes a size, and
 * that every rail panel goes through the ONE implementation.
 *
 * Negative controls included — a test that cannot fail is not a test
 * (memory: feedback_negative_test_must_fail_for_the_right_reason).
 *
 * Usage: node bin/rail-panel-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-canvas.css'), 'utf8');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

// ── brace-matched slice (line comments skipped: an apostrophe in prose reads as a quote) ──
function sliceFn(src, signature) {
    const start = src.indexOf(signature);
    if (start < 0) return null;
    let depth = 0, i = src.indexOf('{', start), inStr = null, started = false;
    for (; i < src.length; i++) {
        const c = src[i], n = src[i + 1];
        if (!inStr && c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
        if (!inStr && c === '/' && n === '*') { i = src.indexOf('*/', i) + 1; continue; }
        if (inStr) {
            if (c === '\\') { i++; continue; }
            if (c === inStr) inStr = null;
            continue;
        }
        if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
        if (c === '{') { depth++; started = true; continue; }
        if (c === '}') { depth--; if (started && depth === 0) return src.slice(start, i + 1); }
    }
    return null;
}

// ── minimal fake DOM ─────────────────────────────────────────────────────────────────────────
function makeStyle() {
    const s = {};
    Object.defineProperty(s, 'cssText', {
        get() { return ''; },
        set(v) { if (v === '') Object.keys(s).forEach(k => { delete s[k]; }); }
    });
    return s;
}
function matches(node, sel) {
    return sel.split(',').some(one => {
        const cls = one.trim().replace(/^\./, '');
        return String(node.className || '').split(/\s+/).includes(cls);
    });
}
function makeEl(className) {
    const node = {
        className: className || '',
        innerHTML: '',
        title: '',
        dataset: {},
        children: [],
        parentNode: null,
        style: makeStyle(),
        _handlers: {},
        _rect: { top: 100, left: 40, width: 380, height: 400 },
        classList: {
            _set: new Set(String(className || '').split(/\s+/).filter(Boolean)),
            add(c) { this._set.add(c); },
            remove(c) { this._set.delete(c); },
            contains(c) { return this._set.has(c); }
        },
        getBoundingClientRect() { return this._rect; },
        appendChild(child) { child.parentNode = node; node.children.push(child); return child; },
        insertBefore(child, ref) {
            child.parentNode = node;
            const at = ref ? node.children.indexOf(ref) : -1;
            if (at < 0) node.children.push(child); else node.children.splice(at, 0, child);
            return child;
        },
        get firstChild() { return node.children[0] || null; },
        querySelector(sel) { return node.children.find(c => matches(c, sel)) || null; },
        querySelectorAll(sel) {
            const out = node.children.filter(c => matches(c, sel));
            out.forEach = Array.prototype.forEach.bind(out);
            return out;
        },
        addEventListener(type, fn) { (node._handlers[type] = node._handlers[type] || []).push(fn); },
        fire(type, ev) { (node._handlers[type] || []).forEach(fn => fn(ev || {})); }
    };
    return node;
}
function makeEvent(x, y) {
    return { button: 0, clientX: x, clientY: y, preventDefault() {}, stopPropagation() {} };
}

// Build the sandbox the sliced function runs inside. Everything it can reach is declared here, so
// an accidental new dependency surfaces as a ReferenceError rather than passing quietly.
function buildRunner(source, dockedMaxW) {
    const doc = {
        _handlers: {},
        addEventListener(type, fn) { (doc._handlers[type] = doc._handlers[type] || []).push(fn); },
        fire(type, ev) { (doc._handlers[type] || []).forEach(fn => fn(ev || {})); },
        body: makeEl('body')
    };
    const el = (tag, props) => {
        const node = makeEl((props && props.className) || '');
        if (props) {
            if (props.innerHTML !== undefined) node.innerHTML = props.innerHTML;
            if (props.title !== undefined) node.title = props.title;
        }
        return node;
    };
    const scope = {
        el,
        document: doc,
        window: { innerHeight: 900 },
        _swmlDockedMaxW: () => dockedMaxW,
        _anchorRailPanel: () => {},
        SWML_SVG_DETACH: '<svg id="detach"/>',
        SWML_SVG_DOCK: '<svg id="dock"/>'
    };
    const factory = new Function(
        'el', 'document', 'window', '_swmlDockedMaxW', '_anchorRailPanel',
        'SWML_SVG_DETACH', 'SWML_SVG_DOCK',
        source + '\nreturn _wireRailPanel;'
    );
    return {
        doc,
        wire: factory(scope.el, scope.document, scope.window, scope._swmlDockedMaxW,
            scope._anchorRailPanel, scope.SWML_SVG_DETACH, scope.SWML_SVG_DOCK)
    };
}

function newPanel(openClass) {
    const panel = makeEl('swml-outline-panel swml-resources-panel');
    const header = makeEl('swml-outline-header');
    header.appendChild(makeEl('swml-outline-close'));
    panel.appendChild(header);
    panel.appendChild(makeEl('swml-outline-list'));
    if (openClass) panel.classList.add(openClass);
    return { panel, header };
}
function handleFor(panel, dir) {
    return panel.querySelectorAll('.swml-outline-rh').find(h => h.dataset.dir === dir);
}

console.log('RAIL PANELS — detach · dock · drag · resize (real _wireRailPanel)');

const SRC = sliceFn(JS, 'function _wireRailPanel(panel, opts)');
if (!SRC) {
    console.error('  ❌ could not slice _wireRailPanel from wml-assessment.js');
    process.exit(1);
}

// ── 1. a bare panel gets the full interaction kit built for it ────────────────────────────────
{
    const { panel, header } = newPanel();
    const { wire } = buildRunner(SRC, 900);
    const ctl = wire(panel, { header });
    ok(panel.querySelectorAll('.swml-outline-rh').length === 8,
        'a panel with no handles is given all 8 (this is what Previous Assessments was missing)');
    ok(!!panel.querySelector('.swml-outline-grip'), 'a grip is created when the panel has none');
    ok(panel.firstChild === panel.querySelector('.swml-outline-grip'), 'the grip is inserted FIRST, above the header');
    const detach = header.querySelector('.swml-outline-detach-btn');
    ok(!!detach, 'a detach button is created in the header (Neil: "there is no detach button")');
    ok(header.children.indexOf(detach) < header.children.indexOf(header.querySelector('.swml-outline-close')),
        'the detach button sits LEFT of the ✕, matching the other panels');
    ok(ctl && typeof ctl.isFloating === 'function' && ctl.isFloating() === false, 'starts docked');
}

// ── 2. THE BUG: a docked east drag must escape the v7.20.317 width band ────────────────────────
{
    const { panel, header } = newPanel();
    const { wire, doc } = buildRunner(SRC, 900);
    wire(panel, { header });
    const e = handleFor(panel, 'e');
    ok(!!e, 'an east handle exists');
    e.fire('mousedown', makeEvent(400, 300));
    ok(panel.style.maxWidth !== 'none',
        'NEGATIVE CONTROL: mousedown ALONE must NOT release the band — with width:max-content ' +
        'unbounded, a held-but-unmoved button would jump the panel to its full content width');
    doc.fire('mousemove', makeEvent(600, 300));   // +200px east
    ok(panel.style.maxWidth === 'none' && panel.style.minWidth === '0px',
        'the drag releases the intrinsic band (WITHOUT this, max-width:380px silently discards ' +
        'every width write and the panel does not move — the exact bug Neil reported)');
    ok(parseFloat(panel.style.width) === 580, 'width follows the pointer: 380 + 200 = 580px');
    ok(parseFloat(panel.style.width) > 380, 'and it is past the 380px CSS cap, which is the whole point');
}

// ── 3. the docked ceiling is the clipping container, not the CSS cap ───────────────────────────
{
    const { panel, header } = newPanel();
    const { wire, doc } = buildRunner(SRC, 500);   // container allows 500px
    wire(panel, { header });
    handleFor(panel, 'e').fire('mousedown', makeEvent(400, 300));
    doc.fire('mousemove', makeEvent(1400, 300));   // drag far past it
    ok(parseFloat(panel.style.width) === 500,
        'clamped to _swmlDockedMaxW — anything wider is sliced by the overflow-x:hidden scroller (v7.20.293)');
}

// ── 4. south edge resizes height while docked (Neil expected the bottom to drag) ───────────────
{
    const { panel, header } = newPanel();
    const { wire, doc } = buildRunner(SRC, 900);
    wire(panel, { header });
    const s = handleFor(panel, 's');
    ok(!!s, 'a south handle exists');
    s.fire('mousedown', makeEvent(200, 500));
    doc.fire('mousemove', makeEvent(200, 560));    // +60px down
    ok(panel.style.maxHeight === 'none', 'the CSS max-height is released so an explicit height can apply');
    ok(parseFloat(panel.style.height) === 460, 'height follows the pointer: 400 + 60 = 460px');
    // rect.top is 100 and innerHeight 900 → ceiling = 900 - 100 - 16 = 784
    doc.fire('mousemove', makeEvent(200, 2000));
    ok(parseFloat(panel.style.height) === 784, 'height is clamped to the viewport, not left to run off-screen');
}

// ── 5. directions that would move the anchor stay detached-only ────────────────────────────────
{
    const { panel, header } = newPanel();
    const { wire, doc } = buildRunner(SRC, 900);
    wire(panel, { header });
    ['n', 'w', 'nw', 'sw'].forEach(dir => {
        handleFor(panel, dir).fire('mousedown', makeEvent(400, 300));
        doc.fire('mousemove', makeEvent(600, 500));
        ok(panel.style.width === undefined || panel.style.width === '',
            `docked ${dir} drag is refused — it would move the top-left corner, which IS the trigger`);
    });
}

// ── 6. float reparents to <body>; dock restores and clears inline state ────────────────────────
{
    const { panel, header } = newPanel();
    const { wire, doc } = buildRunner(SRC, 900);
    const column = makeEl('swml-outline-btn-column');
    column.appendChild(panel);
    const ctl = wire(panel, { header });
    ctl.toggleFloat();
    ok(ctl.isFloating(), 'toggleFloat detaches');
    ok(panel.parentNode === doc.body,
        'floating REPARENTS to <body> — a transformed ancestor traps position:fixed and no z-index escapes it (v7.19.91)');
    ok(panel.classList.contains('swml-outline-detached'), 'the detached class is applied');
    ok(header.querySelector('.swml-outline-detach-btn').innerHTML.includes('dock'), 'the button flips to the DOCK icon');
    ctl.toggleFloat();
    ok(!ctl.isFloating() && panel.parentNode === column, 'docking restores the panel to the rail column');
    ok(panel.style.position === undefined || panel.style.position === '', 'inline styles are cleared on dock');
}

// ── 7. justResized() suppresses the synthetic click a resize mouseup produces ───────────────────
{
    const { panel, header } = newPanel();
    const { wire, doc } = buildRunner(SRC, 900);
    const ctl = wire(panel, { header });
    ok(ctl.justResized() === false, 'clean before any drag');
    handleFor(panel, 'e').fire('mousedown', makeEvent(400, 300));
    doc.fire('mousemove', makeEvent(500, 300));
    doc.fire('mouseup', {});
    ok(ctl.justResized() === true, 'set on mouseup, so click-outside cannot close the panel you just resized');
}

// ── 8. wiring twice is a no-op (double listeners would double every drag delta) ─────────────────
{
    const { panel, header } = newPanel();
    const { wire } = buildRunner(SRC, 900);
    const a = wire(panel, { header });
    const b = wire(panel, { header });
    ok(a === b, 'a second _wireRailPanel call returns the same controller instead of re-binding');
    ok(panel.querySelectorAll('.swml-outline-rh').length === 8, 'and does not add a second set of handles');
}

// ── 9. STRUCTURAL: one implementation, four callers, no survivors of the old copies ────────────
console.log('RAIL PANELS — structure');
{
    const callers = (JS.match(/_wireRailPanel\(/g) || []).length - 1;  // minus the definition
    ok(callers >= 4, `all four rail panels route through _wireRailPanel (found ${callers} call sites)`);
    ok(/_wireRailPanel\(panel, \{ header: hdr, anchorTrigger: anchorBtn \}\)/.test(JS),
        'Previous Assessments is wired (the panel that had no interaction at all)');
    [
        ['olResizing', 'outline panel resize'],
        ['rsResizing', 'resources panel resize'],
        ['wpRDir', 'writer-profile panel resize'],
        ['outlineFloating', 'outline float flag'],
        ['resFloating', 'resources float flag'],
        ['wpFloating', 'writer-profile float flag']
    ].forEach(([name, what]) => {
        ok(!new RegExp('\\b' + name + '\\b').test(JS), `no ${what} state survives (${name}) — the copies are gone, not shadowed`);
    });
    // The band release must be in the same statement group as every inline width/height write.
    const fn = SRC;
    ok(/releaseWidthBand\(\);\s*\n\s*panel\.style\.width/.test(fn),
        'the width band is released immediately before the width is written, never earlier');
    ok(/releaseHeightBand\(\);\s*\n\s*panel\.style\.height/.test(fn),
        'the height band is released immediately before the height is written, never earlier');
}

// ── 10. CSS must actually SHOW the handles the JS now accepts ──────────────────────────────────
console.log('RAIL PANELS — CSS');
{
    const dockedShow = CSS.match(/\.swml-(outline|resources)-panel\.swml-(outline|resources)-open:not\(\.swml-outline-detached\) \.swml-outline-rh-([a-z]+)/g) || [];
    const dirs = new Set(dockedShow.map(m => m.split('swml-outline-rh-')[1]));
    ['e', 's', 'ne', 'se'].forEach(d => {
        ok(dirs.has(d), `docked CSS shows the ${d} handle — a handle the JS accepts but CSS hides has no cursor and cannot be grabbed`);
    });
    ['n', 'w', 'nw', 'sw'].forEach(d => {
        ok(!dirs.has(d), `docked CSS hides the ${d} handle, matching the JS refusal`);
    });
    ok(/\.swml-outline-list \{[^}]*min-height: 0;/.test(CSS),
        'the panel body has min-height:0 — without it a flex child grows past an explicit panel height instead of scrolling');
}

console.log(`   ${asserts.pass} assertions passed`);
if (fail) {
    console.error(`❌ rail-panel-harness FAILED (${asserts.fail} assertion(s)).`);
    process.exit(1);
}
console.log('✅ rail-panel-harness passed (one implementation, four panels, the CSS band cannot clamp a drag dead again).');
