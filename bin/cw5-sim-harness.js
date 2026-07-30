#!/usr/bin/env node
/* eslint-env node */
/**
 * cw5-sim-harness.js — BEHAVIOURAL gate for the CW Step-5 structure walk (v7.20.297).
 *
 * Slices the REAL `_cwStructureCtl` out of wml-assessment.js and drives it, so what is asserted is
 * the shipped code (same method as cw6-sim-harness.js / ladder-sim-harness.js).
 *
 * ⭐ THIS EXISTS BECAUSE OF WHAT SHIPPED BEFORE IT. Step 5 ran on prod for weeks filing NOTHING —
 * the protocol had no filing marker, so all nine document rows stayed empty through a full session
 * while the model told the student it had saved their work. Nobody noticed because nothing errored.
 * The assertion "every row holds the student's words at the end of a run" is the one that would have
 * caught it on day one, so it is a gate now.
 *
 * What it drives:
 *   • a FULL run — all nine asks; every row filled with the student's VERBATIM words and auto-ticked
 *   • the API BUDGET — exactly ONE round-trip (the reflection turn), never more
 *   • the PICK — a chip sets the dropdown, resolves to an archetype key, and carries to Step 6
 *     (`plot_structure_key` + the in-session window carry — the v7.19.443/.444 contract)
 *   • KEY-MATCH — resolvePlotStructureSlug(item) === key for all eight labels (the v7.19.438 bug)
 *   • the SWAP path — @STRUCTURE_SWAP:<key> offers a switch and the switch actually re-keys the doc
 *   • fail-open — a dropped marker leaves their pick standing and the walk moving
 *   • RESUME — including that a reload during the reflection turn NEVER re-spends the call
 *
 * Usage: node bin/cw5-sim-harness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
// v7.20.340: the shipped answer slot + no-ask guard + last-assistant probe, not stand-ins.
const { attachLiveChipsDeps, attachSlotDeps } = require('./walk-sim-lib');

let fail = 0;
const asserts = { pass: 0, fail: 0 };
function ok(cond, msg) {
    if (cond) { asserts.pass++; return true; }
    asserts.fail++; fail = 1;
    console.error('  ❌ ' + msg);
    return false;
}

function braceSliceFrom(s, idx, open, close) {
    const start = s.indexOf(open, idx);
    let d = 0;
    for (let k = start; k < s.length; k++) {
        const c = s[k];
        if (c === open) d++;
        else if (c === close) { d--; if (d === 0) return { text: s.slice(start, k + 1), end: k + 1 }; }
        else if (c === '/' && s[k + 1] === '/') {
            // A LINE COMMENT. Skipping these is not tidiness: an apostrophe in ordinary prose
            // ("the dropdown's saved selection") reads as an opening quote to the scanner below and
            // swallows the rest of the file, so the slice silently returns null.
            while (k < s.length && s[k] !== '\n') k++;
        }
        else if (c === '/' && s[k + 1] === '*') { k += 2; while (k < s.length && !(s[k] === '*' && s[k + 1] === '/')) k++; k++; }
        else if (c === '"' || c === "'" || c === '`') {
            const q = c; k++;
            while (k < s.length && s[k] !== q) { if (s[k] === '\\') k++; k++; }
        }
    }
    return null;
}
function evalObjectAfter(label) {
    const i = src.indexOf(label);
    if (i < 0) throw new Error('not found: ' + label);
    // eslint-disable-next-line no-eval
    return eval('(' + braceSliceFrom(src, i + label.length, '{', '}').text + ')');
}
function sliceFn(name) {
    const i = src.indexOf('function ' + name + '(');
    if (i < 0) throw new Error('function not found: ' + name);
    return src.slice(i, braceSliceFrom(src, i, '{', '}').end);
}
// eslint-disable-next-line no-new-func
const mkFn = (n) => new Function('return ' + sliceFn(n).replace(/^function\s+\w+/, 'function') + ';')();

const ARCH = evalObjectAfter('cwPlotArchetypes:');
const META = evalObjectAfter('const CW_PLOT_ARCHETYPE_META =');
const ITEMS = evalObjectAfter('const CW5_ARCHETYPE_ITEMS =');
const _cw5ChipLabel = mkFn('_cw5ChipLabel');
const resolvePlotStructureSlug = (function () {
    // The real resolver, minus its DOM branch (the sim only ever passes a bare label).
    const body = sliceFn('resolvePlotStructureSlug');
    // eslint-disable-next-line no-new-func
    return new Function('document', 'return ' + body.replace(/^function\s+\w+/, 'function') + ';')({
        createElement: function () { return { innerHTML: '', querySelectorAll: function () { return []; } }; },
    });
})();

const ctlIdx = src.indexOf('const _cwStructureCtl = (function () {');
if (ctlIdx < 0) { console.error('❌ _cwStructureCtl not found in wml-assessment.js'); process.exit(1); }
const CTL_SRC = braceSliceFrom(src, ctlIdx, '(', ')').text + '()';

const ROW_IDS = ['cw-step-5-context', 'cw-step-5-concept', 'cw-step-5-technique',
    'cw-step-5-primary-archetype', 'cw-step-5-why-fits', 'cw-step-5-emotion',
    'cw-step-5-theme', 'cw-step-5-connection', 'cw-step-5-secondary'];

function makeWorld(opts) {
    opts = opts || {};
    const rows = new Map();
    const ticks = new Set();
    const bubbles = [];
    const users = [];
    const sends = [];
    const substeps = [];
    const savedArtifacts = [];
    const check = new Map();       // stands in for _outlineCheckState
    const ls = new Map();
    let armed = null;
    ROW_IDS.forEach((f) => rows.set(f, ''));
    (opts.prefillRows || []).forEach((f) => rows.set(f, 'pre-existing'));
    if (opts.prefillPick) check.set('cw-step-5-primary-archetype', { selected: opts.prefillPick });

    const world = { rows, ticks, bubbles, users, sends, substeps, savedArtifacts, check,
        get armed() { return armed; } };

    function findIn(node, sel) {
        if (!node || !node.children) return null;
        for (const c of node.children) {
            if (c.className && ('.' + String(c.className).split(' ').join('.')).indexOf(sel) !== -1) return c;
            const d = findIn(c, sel);
            if (d) return d;
        }
        return null;
    }
    const deps = {
        chatMessages: { get lastElementChild() { return world._lastBubbleEl; } },
        chatTextarea: { value: '' },
        chatSendBtn: { style: {} },
        canvasChatHistory: [],
        saveCanvasChat: function () {},
        canvasChatId: 'sim',
        formatAI: function (t) { return t; },
        el: function (tag, attrs) {
            return {
                tag: tag, attrs: attrs || {}, children: [], className: (attrs && attrs.className) || '',
                textContent: (attrs && attrs.textContent) || '',
                appendChild: function (c) { this.children.push(c); return c; },
                remove: function () {}, addEventListener: function (ev, fn) { this._click = fn; },
                querySelector: function (s) { return findIn(this, s); },
                setAttribute: function () {}, getAttribute: function () { return null; },
                closest: function () { return null; },
            };
        },
        // v7.20.331: the REAL bubble-control kinds, sliced from source. Bars declare a kind so
        // that different kinds coexist on one bubble instead of silently blocking each other.
        BUBBLE_CONTROL_KINDS: (function () {
            const i = src.indexOf('const BUBBLE_CONTROL_KINDS =');
            if (i < 0) throw new Error('BUBBLE_CONTROL_KINDS not found — the one-owner primitive is gone');
            // eslint-disable-next-line no-eval
            return eval('(' + braceSliceFrom(src, i, '{', '}').text + ')');
        })(),
        state: { task: 'cw_step_5', cwProjectId: 'cwp_sim' },
        canvasEditor: { state: { doc: { descendants: function (fn) {
            for (const [f, t] of rows) {
                const cs = check.has(f) ? JSON.stringify(check.get(f)) : '{}';
                if (fn({ type: { name: 'outlineRow' }, attrs: { fieldId: f, checkState: cs }, textContent: t }, 0) === false) break;
            }
        } } } },
        _writeOutlineRowField: function (fid, text, o) {
            if (!rows.has(fid)) { world.lostWrite = fid; return false; }
            const prev = rows.get(fid);
            rows.set(fid, (!prev || (o && o.replace)) ? text : prev + '\n\n' + text);
            return true;
        },
        _tickOutlineRow: function (fid) { if (!rows.has(fid)) { world.lostTick = fid; return false; } ticks.add(fid); return true; },
        _tickRowLikeAStudent: function (fid) { if (!fid) return false; world.ticked = world.ticked || new Set();
            if (world.ticked.has(fid)) return true;
            var pre = fid.indexOf('cw-step-2-idea') === 0 ? 'cw-step-2-idea' : (fid.indexOf('cw-step-3-logline-') === 0 ? 'cw-step-3-logline-' : null);
            if (pre) Array.from(world.ticked).forEach(function (t) { if (t.indexOf(pre) === 0 && t !== fid) world.ticked.delete(t); });
            world.ticked.add(fid); return true; },
        _cwLoadStep3Values: function () { return Promise.resolve({}); },
        _cwStep3Value: function () { return ''; },
        armCwWalkHandoff: function () { return true; },
        consumeCwWalkHandoff: function () { return null; },
        cwEndpointLine: function () { return '\n\n---\n\n**That\u2019s this step done.** (sim endpoint)'; },
        _setOutlineDropdown: function (fid, label) {
            if (!rows.has(fid)) { world.lostWrite = fid; return false; }
            check.set(fid, { selected: label });
            ticks.add(fid);
            // Mirror of the real side effect, which is the whole point of the assertion below.
            const slug = resolvePlotStructureSlug(label);
            if (fid === 'cw-step-5-primary-archetype') {
                if (!slug) { world.unresolvedLabel = label; return true; }
                deps.window._wmlCwPlotStructure[deps.state.cwProjectId] = slug;
                savedArtifacts.push({ key: 'plot_structure_key', value: slug });
            }
            return true;
        },
        _outlineCheckState: check,
        saveCanvasContent: function () {},
        CANVAS_SAVE_KEY: function () { return 'sim'; },
        _cwDocValue: function (artifact, fid) {
            if (artifact === 'brief_outline') return 'beat text for ' + fid;
            if (artifact === 'logline') return 'A girl who cannot ask for help must save her mother from an AI empire.';
            return '';
        },
        _cwLoadDocValues: function () { return Promise.resolve({}); },
        CW_STEP4_SPINE: [{ fid: 'cw-step-4-beat1', label: 'Beat 1' }, { fid: 'cw-step-4-beat6', label: 'Beat 6' }],
        OUTLINE_CRITERIA: { cwPlotArchetypes: ARCH },
        CW_PLOT_ARCHETYPE_META: META,
        CW5_ARCHETYPE_ITEMS: ITEMS,
        _cw5ChipLabel: _cw5ChipLabel,
        resolvePlotStructureSlug: resolvePlotStructureSlug,
        serveCwChunks: function (chunks, o) { chunks.forEach(function (c) { o.emit(c); }); if (o.onDone) o.onDone(); return { reattach: function () {} }; },
        armWalkResume: function (id, fn) { armed = { id: id, fn: fn }; },
        sendCanvasMessage: function () {
            const h = deps.canvasChatHistory[deps.canvasChatHistory.length - 1];
            sends.push({ id: armed ? armed.id : '(none)', hidden: h && h.hidden ? h.content : null });
            deps.canvasSilentSend = false;
        },
        canvasSilentSend: false,
        applyCwSubstepProgress: function (d) { substeps.push(d); },
        showGuidePanel: function () {},
        localStorage: { getItem: (k) => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, v), removeItem: (k) => ls.delete(k) },
        window: { WML: { cwProject: { saveArtifact: function () { return Promise.resolve(); } } }, SophiclyTable: null, _wmlCwPlotStructure: {} },
        document: { querySelector: () => null, querySelectorAll: () => [] },
        setTimeout: function (fn) { fn(); return 0; },
        console: { log: function () {}, warn: function (m) { world.warns = (world.warns || []).concat([String(m)]); } },
    };
    attachLiveChipsDeps(deps);   // must precede the slot lift (both are module-scope primitives)
    attachSlotDeps(deps);
    deps.addChatMessage = function (html, who, plain) {
        if (who === 'user') { users.push(html); return; }
        bubbles.push(plain || html);
        const content = deps.el('div', { className: 'swml-bubble-content' });
        world._lastBubbleEl = { children: [content], querySelector: (s) => (s.indexOf('bubble-content') !== -1 ? content : findIn(this, s)) };
    };

    const names = Object.keys(deps);
    // eslint-disable-next-line no-new-func
    // v7.20.345: `opts.ctlSrc` lets a test drive a DELIBERATELY BROKEN copy of the real controller
    // (the negative control). Two of this session's gates were vacuous until the defect was
    // injected and watched to fail — a gate that cannot fail proves nothing.
    world.ctl = new Function(names.join(','), 'return ' + (opts.ctlSrc || CTL_SRC) + ';').apply(null, names.map((n) => deps[n]));
    world.deps = deps;
    world.chips = function () {
        const bc = world._lastBubbleEl && world._lastBubbleEl.children[0];
        const bar = bc && bc.children.filter((c) => String(c.className).indexOf('swml-quick-actions') !== -1)[0];
        return bar ? bar.children : [];
    };
    world.tap = function (part) {
        const btn = [].slice.call(world.chips()).filter((b) => String(b.textContent).indexOf(part) !== -1)[0];
        if (!btn) return false;
        const h = (btn.attrs && btn.attrs.onClick) || btn._click;
        if (!h) return false;
        h();
        return true;
    };
    world.tapMulti = function (parts) {
        parts.forEach((p) => world.tap(p));
        return world.tap('Continue');
    };
    world.resolveApi = function (reply) {
        if (!armed) return false;
        const fn = armed.fn; armed = null; fn(reply, {}); return true;
    };
    return world;
}

const tick = () => new Promise((r) => setImmediate(r));

async function main() {
console.log('CW STEP-5 STRUCTURE WALK — behavioural sim (real _cwStructureCtl)');

// ── 0. KEY-MATCH: every dropdown label must resolve to the key it is filed under. ────────
// This is the v7.19.438 bug as a gate: "Rebirth / Redemption + Hero's Journey" once slugified to
// `rebirth-redemption-hero-s-journey`, matched nothing, and every non-default pick silently became
// Hero's Journey. Three producers share these strings, so they get checked, not trusted.
Object.keys(ITEMS).forEach(function (k) {
    ok(resolvePlotStructureSlug(ITEMS[k]) === k,
        'key-match: "' + ITEMS[k] + '" resolves to ' + resolvePlotStructureSlug(ITEMS[k]) + ', filed as ' + k);
    ok(!!ARCH[k], 'key-match: ' + k + ' is not a real archetype template');
    ok(!!META[k], 'key-match: ' + k + ' has no CW_PLOT_ARCHETYPE_META entry — the menu would show a blank summary');
    ok(_cw5ChipLabel(ITEMS[k]).length > 2, 'chip label for ' + k + ' collapsed to "' + _cw5ChipLabel(ITEMS[k]) + '"');
});

// ── 1. FULL RUN — the assertion the old protocol would have failed on day one. ────────────
{
    const w = makeWorld();
    w.ctl.forceStart();
    await tick();
    ok(w.ctl.active, 'full run: walk did not activate');
    ok(w.bubbles.length >= 4, 'full run: orientation was not paced (got ' + w.bubbles.length + ' bubbles)');
    ok(/file every answer into your document/i.test(w.bubbles.join('\n')), 'full run: the orientation never promises the filing the code actually does');

    let guard = 0, apiCalls = 0;
    while (guard++ < 60) {
        if (w.armed) { apiCalls++; w.resolveApi('Your ending is internal.\n\n@STRUCTURE_OK'); continue; }
        if (w.tap('Overcoming the Monster')) continue;              // the archetype pick
        if (w.tapMulti(['Coming of Age', 'The Quest'])) continue;   // secondary elements
        if (!w.ctl.active) break;
        w.ctl.handleTurn('my answer ' + guard);
    }

    const empty = ROW_IDS.filter(function (f) { return f !== 'cw-step-5-primary-archetype' && !w.rows.get(f); });
    ok(empty.length === 0, 'full run: rows STILL EMPTY at the end — ' + empty.join(', ')
        + '  ← this is the exact prod defect this harness exists for');
    ok(!!w.check.get('cw-step-5-primary-archetype'), 'full run: the archetype dropdown was never set');
    ok(w.ticks.size === ROW_IDS.length, 'full run: ' + w.ticks.size + '/' + ROW_IDS.length + ' rows auto-ticked');
    ok(!w.lostWrite, 'full run: a write targeted a row that does not exist — ' + w.lostWrite);
    ok(!w.unresolvedLabel, 'full run: the picked label did not resolve to a structure key — ' + w.unresolvedLabel);

    // ⭐ THE BUDGET. Nine asks, ONE call.
    ok(apiCalls === 1, 'full run: expected exactly 1 API round-trip (the reflection), got ' + apiCalls);
    ok(w.sends.length === 1, 'full run: ' + w.sends.length + ' sends for 9 asks — every ask must be free');
    ok(/PLOT-STRUCTURE REFLECTION/.test((w.sends[0] || {}).hidden || ''), 'full run: the one call was not the reflection turn');
    ok(/THEIR CONCEPT/.test((w.sends[0] || {}).hidden || ''), 'full run: the reflection context omits the student’s own concept');

    // Step-6 carry — without this Step 6 builds a stale structure (v7.19.443/.444).
    ok(w.savedArtifacts.some((a) => a.key === 'plot_structure_key' && a.value === 'overcoming-the-monster'),
        'full run: plot_structure_key was not saved as overcoming-the-monster');
    ok(w.deps.window._wmlCwPlotStructure['cwp_sim'] === 'overcoming-the-monster',
        'full run: the in-session window carry was not set — Step 6 can read a stale choice');

    ok(w.rows.get('cw-step-5-secondary') === 'Coming of Age, The Quest',
        'full run: secondary multi-select filed as "' + w.rows.get('cw-step-5-secondary') + '"');
    ok(w.substeps.map((s) => s.substepNum).indexOf(3) !== -1, 'full run: the walk never stamped sub-step 3 (Confirm Choice)');
    ok(/plot structure decided/i.test(w.bubbles[w.bubbles.length - 1] || ''), 'full run: did not end on the wrap');
    ok(!w.ctl.active, 'full run: still active after the wrap');
}

// ── 2. THE SWAP PATH — the reflection must end in a real, student-owned change. ───────────
{
    const w = makeWorld();
    w.ctl.forceStart(); await tick();
    for (let n = 0; n < 3; n++) w.ctl.handleTurn('reflection answer ' + n);
    ok(w.tap('Overcoming the Monster'), 'swap: the archetype chips were not offered');
    ok(!!w.armed && w.armed.id === 'cw5-push', 'swap: the reflection call did not fire on the pick');
    w.resolveApi('Your ending is her sacrifice — that is internal.\n\n@STRUCTURE_SWAP:rebirth-redemption');
    ok(w.tap('Switch to Rebirth / Redemption'), 'swap: no switch chip was offered');
    ok((w.check.get('cw-step-5-primary-archetype') || {}).selected === ITEMS['rebirth-redemption'],
        'swap: the document was not re-keyed to Rebirth / Redemption');
    ok(w.deps.window._wmlCwPlotStructure['cwp_sim'] === 'rebirth-redemption',
        'swap: Step 6 would still build the OLD structure — the carry was not updated');

    // And keeping the pick must be equally available and equally final.
    const w2 = makeWorld();
    w2.ctl.forceStart(); await tick();
    for (let n = 0; n < 3; n++) w2.ctl.handleTurn('a');
    w2.tap('Overcoming the Monster');
    w2.resolveApi('@STRUCTURE_SWAP:rebirth-redemption');
    ok(w2.tap('Keep Overcoming the Monster'), 'swap: no keep chip was offered');
    ok((w2.check.get('cw-step-5-primary-archetype') || {}).selected === ITEMS['overcoming-the-monster'],
        'swap: keeping the pick changed the document anyway');
}

// ── 3. FAIL-OPEN — a dropped or unknown marker leaves their pick standing. ────────────────
// v7.20.340: these three drove handleTurn() WITHOUT awaiting startWalk's doc-load promise, so the
// answers arrived before any ask had been served. That used to "work" because filing was
// cursor-driven — which is the whole defect the answer slot exists to stop. Await the start.
const FAIL_OPEN_REPLIES = [null, 'no marker at all', '@STRUCTURE_SWAP:not-an-archetype'];
for (let n = 0; n < FAIL_OPEN_REPLIES.length; n++) {
    const reply = FAIL_OPEN_REPLIES[n];
    const w = makeWorld();
    w.ctl.forceStart(); await tick();
    for (let x = 0; x < 3; x++) w.ctl.handleTurn('a');
    w.tap('Tragedy');
    w.resolveApi(reply);
    ok(w.ctl.active, 'fail-open[' + n + ']: the walk went inert after a marker-less reflection reply');
    ok((w.check.get('cw-step-5-primary-archetype') || {}).selected === ITEMS['tragedy'],
        'fail-open[' + n + ']: their pick was lost');
    ok(!w.tap('Switch to'), 'fail-open[' + n + ']: a switch chip was offered with nothing valid to switch to');
}

// ── 4. RESUME — and the call is NEVER re-spent. ───────────────────────────────────────────
{
    // Reload while the reflection turn is in flight.
    const w = makeWorld({ prefillRows: ROW_IDS.slice(0, 3), prefillPick: ITEMS['tragedy'] });
    w.deps.localStorage.setItem('sim_cw5', JSON.stringify({ phase: 'push', pushed: true, swapKey: '', active: true }));
    ok(w.ctl.tryResume(), 'resume: tryResume() returned false mid-walk');
    ok(!w.armed, 'resume: the reflection call was RE-SPENT after a reload — it is already paid for');
    ok(w.sends.length === 0, 'resume: ' + w.sends.length + ' API send(s) on a resume — expected 0');
    ok(w.ctl.active, 'resume: the walk did not continue');

    // Resume from each position; the run must complete without repeating a filled row.
    ROW_IDS.forEach(function (_, n) {
        const pre = ROW_IDS.slice(0, n).filter((f) => f !== 'cw-step-5-primary-archetype');
        const w2 = makeWorld({ prefillRows: pre, prefillPick: n > 3 ? ITEMS['tragedy'] : '' });
        w2.deps.localStorage.setItem('sim_cw5', JSON.stringify({ phase: 'ask', pushed: n > 3, swapKey: '', active: true }));
        w2.ctl.tryResume();
        let guard = 0;
        while (guard++ < 60) {
            if (w2.armed) { w2.resolveApi('@STRUCTURE_OK'); continue; }
            // 'Continue' exists ONLY on the multi bar, so it disambiguates: an archetype label
            // appears on BOTH the pick bar and the secondary-elements bar, and tapping it there
            // just toggles a checkbox forever.
            if (w2.tapMulti(['Tragedy'])) continue;
            if (w2.tap('Rags to Riches')) continue;
            // v7.20.347: a walk that is inactive because a CALL IS IN FLIGHT is not a finished
            // walk. Re-check the arm before giving up — without this the loop broke in the same
            // iteration that `onPick` armed the reflection, and only survived because no bubble
            // followed the pick, so the pick chips stayed newest and the NEXT tap re-picked a
            // second archetype. That accidental double-pick was carrying the whole resume sweep.
            if (w2.armed) { w2.resolveApi('@STRUCTURE_OK'); continue; }
            if (!w2.ctl.active) break;
            w2.ctl.handleTurn('resumed');
        }
        const empty = ROW_IDS.filter((f) => f !== 'cw-step-5-primary-archetype' && !w2.rows.get(f));
        ok(empty.length === 0, 'resume@' + n + ': finished with empty rows — ' + empty.join(', '));
    });
}

// ── 4b. v7.20.298: NO SIDECAR AT ALL (new device / cleared storage / overnight return). ────
// The prod defect: tryResume() bailed the instant localStorage was empty, even though
// firstEmpty() already reads the position out of the document. The walk then sat inactive and
// every answer the student typed went to the AI, which files NOTHING. uid 1330 lost twelve
// Step-1 answers this way. A wiped sidecar must resume from the DOCUMENT and finish the run.
{
    [0, 3, 6].forEach(function (n) {
        const pre = ROW_IDS.slice(0, n).filter((f) => f !== 'cw-step-5-primary-archetype');
        const w = makeWorld({ prefillRows: pre, prefillPick: n > 3 ? ITEMS['tragedy'] : '' });
        // Deliberately write NOTHING to localStorage.
        ok(w.deps.localStorage.getItem('sim_cw5') === null, 'no-sidecar@' + n + ': sidecar should be absent');
        ok(w.ctl.tryResume(), 'no-sidecar@' + n + ': tryResume() must rebuild from the doc, not bail');
        let guard = 0;
        while (guard++ < 60) {
            if (w.armed) { w.resolveApi('@STRUCTURE_OK'); continue; }
            if (w.tapMulti(['Tragedy'])) continue;
            if (w.tap('Rags to Riches')) continue;
            if (w.armed) { w.resolveApi('@STRUCTURE_OK'); continue; }   // v7.20.347 — see §4's twin
            if (!w.ctl.active) break;
            w.ctl.handleTurn('resumed');
        }
        const empty = ROW_IDS.filter((f) => f !== 'cw-step-5-primary-archetype' && !w.rows.get(f));
        ok(empty.length === 0, 'no-sidecar@' + n + ': finished with empty rows — ' + empty.join(', '));
    });
}

// ── 5. ⭐ THE REAL ENTRY PATH (v7.20.340) — the ordering NOTHING tested. ───────────────────
// Every test above starts the walk with forceStart(), which serves the ask as its first act. The
// path a STUDENT takes does not: an AI greeting lands first ("Welcome to Step 5…"), then the walk
// revives from the document. The resume path re-attached only the HELP BAR, and helpBar() binds to
// the newest bubble — the greeting. So the student got a greeting carrying the whole help ladder
// and NO QUESTION, while the walk sat live at ask 1 and filed the next thing typed. That is how
// `let's go` became the answer to ask 1 on staging and put the walk one row behind.
//
// THE INVARIANT, and it is the one that would have caught it on day one:
//   IF THE WALK IS LIVE, THE STUDENT CAN SEE THE QUESTION IT IS WAITING ON.
// Armed-with-no-question must be unreachable by construction, not merely unlikely.
{
    const GREETING = 'Welcome to Step 5: **Choose Your Plot Structure**\n\nLet’s begin.';
    const w = makeWorld();
    // The greeting arrives BEFORE the walk exists — exactly as the entry serves it.
    w.deps.canvasChatHistory.push({ role: 'assistant', content: GREETING });
    w.deps.addChatMessage(GREETING, 'ai', GREETING);
    ok(w.deps.localStorage.getItem('sim_cw5') === null, 'real-entry: this path has no sidecar yet');

    ok(w.ctl.tryResume(), 'real-entry: the walk did not revive on a first entry');
    ok(w.ctl.active, 'real-entry: revived but inactive');

    // ⭐ live ⇒ the question is on screen. Before .340 the newest bubble was still the greeting.
    const newest = w.bubbles[w.bubbles.length - 1] || '';
    ok(newest !== GREETING,
        'real-entry: the newest bubble is still the GREETING — the student has help buttons and no question');
    ok(/1 of 9|Your Context|Your Inspiration/i.test(newest) || newest.length > GREETING.length,
        'real-entry: the newest bubble is not the ask — served "' + newest.slice(0, 60) + '…"');
    ok(!!w.deps._walkSlot.armed, 'real-entry: an ask is on screen but no slot is armed — a typed answer would file nowhere');

    // v7.20.346: and the bar on it is VISIBLE. The token reached the bubble in .344 too — at 0%,
    // which renders as an empty grey track and reads as no bar at all ("I don't see any progress").
    const pct = (String(newest).match(/\[SWML_PROGRESS_(\d+)\]/) || [])[1];
    ok(pct !== undefined && Number(pct) > 0,
        'real-entry: the first ask shows ' + (pct === undefined ? 'NO progress token' : pct + '% — an empty bar')
        + '. The bar rides the ask in hand, so ask 1 of 9 is 11%, not 0%.');

    // And the launch words, typed while NO ask has been served, must file NOTHING.
    const w2 = makeWorld();
    w2.deps.canvasChatHistory.push({ role: 'assistant', content: GREETING });
    w2.deps.addChatMessage(GREETING, 'ai', GREETING);
    w2.ctl.tryResume();
    w2.deps._walkSlot.clear('cw5');          // the pre-.340 state: live walk, no ask armed
    const bubblesBefore = w2.bubbles.length;
    w2.ctl.handleTurn("let's go");
    ok(!w2.rows.get('cw-step-5-context'),
        'real-entry: "let\'s go" was FILED as the answer to ask 1 — the whole walk now runs one behind');
    ok(w2.bubbles.length > bubblesBefore,
        'real-entry: the message was refused and the student was shown NOTHING (law 4d’s forbidden third outcome)');
}

// ── 6. THE WAY BACK IN (v7.20.340) — a finished walk is not a dead one. ───────────────────
// Neil, on tapping past an offer by mistake: "I'm just wondering if there's any way that we can
// recall things like that, just in case." Universal rule — every walk's wrap offers a route back
// into any answered row, and it must cost NO API call.
{
    const w = makeWorld({ prefillRows: ROW_IDS.filter((f) => f !== 'cw-step-5-primary-archetype'), prefillPick: ITEMS['tragedy'] });
    w.deps.localStorage.setItem('sim_cw5', JSON.stringify({ phase: 'done', pushed: true, swapKey: '', active: false }));
    w.ctl.tryResume();
    const recall = w.chips().filter((c) => /Change an answer/i.test(String(c.textContent)))[0];
    ok(!!recall, 'recall: a finished Step 5 offers NO way back into an answered row');
    if (recall) {
        const sendsBefore = w.sends.length;
        w.tap('Change an answer');
        const first = w.chips().filter((c) => !/Nothing/.test(String(c.textContent)))[0];
        ok(!!first, 'recall: the picker offered no answers to change');
        if (first) {
            const label = String(first.textContent);
            w.tap(label);
            ok(!!w.deps._walkSlot.armed, 'recall: the rewrite ask armed no slot — the answer would file nowhere');
            w.ctl.handleTurn('A completely new version of this answer.');
            const fid = ROW_IDS.filter((f) => f !== 'cw-step-5-primary-archetype')
                .filter((f) => String(w.rows.get(f) || '').indexOf('A completely new version') !== -1)[0];
            ok(!!fid, 'recall: the rewrite did not land in any row');
            ok(!fid || String(w.rows.get(fid)).indexOf('pre-existing') === -1,
                'recall: the rewrite was APPENDED to the old answer — a §4c.6 `rewrite` cycle REPLACES');
            ok(w.sends.length === sendsBefore,
                'recall spent ' + (w.sends.length - sendsBefore) + ' API call(s) — the student owns the rewrite, we only file it');
        }
    }
}

// ── 7. ⭐ THE RESUME RE-SERVE IS DRAWN, NEVER SAVED (v7.20.345) ────────────────────────────
// Neil, on .344: "the questions are in the wrong order" — the transcript read "2 of 9 — Your
// Concept" ABOVE "1 of 9 — Your Context". Both turns were written by .344, at 11% and 0%: the
// .340 resume re-serve went through aiBubble, which PUSHES to canvasChatHistory, so every entry
// appended another ask ordered by whatever the document said at that moment (§4c.7 — derived
// state is drawn or it replays forever).
//
// THE INVARIANT: N entries draw the ask N times and save it ZERO times.
{
    const GREETING = 'Welcome to Step 5: **Choose Your Plot Structure**\n\nLet’s begin.';
    const entries = (world) => {
        world.deps.canvasChatHistory.push({ role: 'assistant', content: GREETING });
        world.deps.addChatMessage(GREETING, 'ai', GREETING);
        const base = world.deps.canvasChatHistory.length;
        world.ctl.tryResume();                       // entry 1
        const drawn1 = world.bubbles.length;
        world.ctl.tryResume();                       // entry 2 — the reload that made the fossil visible
        return { base, drawn1, drawn2: world.bubbles.length, saved: world.deps.canvasChatHistory.length };
    };

    const w = makeWorld();
    const r = entries(w);
    ok(r.drawn1 > 1, 'fossil: the first entry drew no ask at all');
    ok(r.drawn2 > r.drawn1, 'fossil: the second entry drew nothing — the student came back to a screen with no question (law 4d)');
    ok(r.saved === r.base,
        'fossil: a resume re-serve was SAVED — ' + (r.saved - r.base) + ' turn(s) pushed into the transcript, which is exactly how "2 of 9" ended up above "1 of 9"');
    const askInHistory = w.deps.canvasChatHistory.filter((m) => m.role === 'assistant' && /of 9/.test(String(m.content || ''))).length;
    ok(askInHistory === 0, 'fossil: ' + askInHistory + ' re-served ask(s) are in saved history — they replay forever');

    // NEGATIVE CONTROL. Strip the guard from a copy of the REAL controller and prove the fossil
    // comes straight back; without this the three assertions above could be passing vacuously.
    const GUARD = 'if (_cwIsReplay()) return;';
    if (CTL_SRC.indexOf(GUARD) === -1) {
        ok(false, 'fossil: the guard `' + GUARD + '` is not in _cwStructureCtl — this gate is vacuous');
    } else {
        const broken = makeWorld({ ctlSrc: CTL_SRC.split(GUARD).join('') });
        const rb = entries(broken);
        ok(rb.saved > rb.base,
            'fossil NEGATIVE CONTROL: with the guard stripped the transcript must grow — it did not, so this gate proves nothing');
    }
}

console.log('   ' + asserts.pass + ' behavioural assertions passed' + (asserts.fail ? ', ' + asserts.fail + ' FAILED' : ''));
if (fail) { console.error('\ncw5-sim-harness FAILED'); process.exit(1); }
console.log('✅ cw5-sim-harness passed (9 asks all filed + ticked, ONE API call, Step-6 carry intact).');
}

main().catch(function (e) { console.error('cw5-sim-harness threw —', (e && e.stack) || e); process.exit(1); });
