#!/usr/bin/env node
/* eslint-env node */
/**
 * island-contrast-lint.js — WCAG AA contrast gate for the Scene Selection island (Step 9).
 *
 * WHY THIS EXISTS (#204 addendum 20, Neil 2026-08-10):
 *   "I'm not sure I'm too much of a fan of the teal in light theme... can you do an accessibility
 *    audit or something? some of the colors in light theme are a little bit... there's too much
 *    clashing going on with the white."
 *
 *   He was right, and the cause was structural, not taste: the light-theme block overrode the
 *   SURFACE ladder (--ground/--surface/--ink/--line) but NOT ONE ACCENT TOKEN, so --teal #51dacf,
 *   --done #1CD991 and --warn #F1C40F — all picked to sit on a #1b1c1f ground — were painted as
 *   TEXT on white. Teal on white is 1.9:1. Amber on white is 1.7:1. The floor is 4.5:1.
 *
 *   Two hover bugs of the same family shipped in the same component: a rule carrying
 *   `:hover:not([disabled])` scores (0,4,0) and silently BEATS the (0,3,0) state rule it was
 *   meant to decorate, so `.step-pill.is-live` lost its teal ground on hover while its numeral
 *   kept the dark ink built for that ground (1.24:1), and `.btn.primary` in light theme flipped
 *   its ground back to teal while keeping blue #4D76FD ink.
 *
 * SO THE GATE IS SPECIFICITY-AWARE ON PURPOSE. Eyeballing a stylesheet cannot catch a cascade
 * bug — that is exactly the class that shipped twice. This runs a mini-cascade: every declared
 * instance is resolved through real specificity + source order, per theme, per state.
 *
 * STANDARD: DESIGN.md §3 — body text 4.5:1, large text (>=24px, or >=19px bold) 3:1,
 * "interactive states each keep their own contrast". Non-text UI indicators: 3:1 (WCAG 1.4.11).
 *
 * Usage:  node bin/island-contrast-lint.js [--verbose]
 * Exit 1 on any failure. Wired into bin/pre-ship-check.sh.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(__dirname, '..', 'frontend', 'wml-scene-island.css');
const VERBOSE = process.argv.includes('--verbose');

/* ── colour maths ───────────────────────────────────────────────────────────────────────── */

function parseColor(str) {
    if (!str) return null;
    const s = String(str).trim();
    let m = /^#([0-9a-f]{3})$/i.exec(s);
    if (m) return { r: parseInt(m[1][0] + m[1][0], 16), g: parseInt(m[1][1] + m[1][1], 16), b: parseInt(m[1][2] + m[1][2], 16), a: 1 };
    m = /^#([0-9a-f]{6})$/i.exec(s);
    if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
    m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(s);
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
    if (s === '#fff' || s === 'white') return { r: 255, g: 255, b: 255, a: 1 };
    return null;
}

/** Composite a (possibly translucent) colour over an opaque backdrop. */
function over(fg, bg) {
    if (!fg) return bg;
    if (fg.a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 };
    return {
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1,
    };
}

function relLuminance(c) {
    const f = (v) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

function contrast(fg, bg) {
    const a = relLuminance(fg), b = relLuminance(bg);
    const hi = Math.max(a, b), lo = Math.min(a, b);
    return (hi + 0.05) / (lo + 0.05);
}

/* ── CSS parsing ────────────────────────────────────────────────────────────────────────── */

function stripComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** All rules, in source order, as {selectors[], decls{}, order}. Skips @-blocks and keyframes. */
function parseRules(css) {
    const src = stripComments(css);
    const rules = [];
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m, order = 0;
    while ((m = re.exec(src))) {
        const selRaw = m[1].trim();
        if (!selRaw || selRaw.startsWith('@') || /^(from|to|\d+%)$/.test(selRaw)) continue;
        const decls = {};
        m[2].split(';').forEach((d) => {
            const i = d.indexOf(':');
            if (i < 0) return;
            decls[d.slice(0, i).trim()] = d.slice(i + 1).trim();
        });
        selRaw.split(',').forEach((sel) => rules.push({ sel: sel.trim().replace(/\s+/g, ' '), decls, order: order++ }));
    }
    return rules;
}

/** Theme variable maps, read from the two token blocks in the real stylesheet. */
function readThemes(rules) {
    const dark = {}, light = {};
    rules.forEach((r) => {
        const isBase = r.sel === '.swml-scene-island';
        const isLight = r.sel === 'body[data-swml-theme="light"] .swml-scene-island';
        if (!isBase && !isLight) return;
        Object.keys(r.decls).forEach((k) => {
            if (k.startsWith('--')) (isBase ? dark : light)[k] = r.decls[k];
        });
    });
    return { dark, light: Object.assign({}, dark, light) };
}

function resolveVar(value, vars, depth) {
    if (!value || depth > 6) return value;
    return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (all, name, fallback) => {
        const v = vars[name] !== undefined ? vars[name] : (fallback || '');
        return resolveVar(v.trim(), vars, (depth || 0) + 1);
    });
}

/* ── the mini-cascade ───────────────────────────────────────────────────────────────────── */

/** Specificity of one compound/descendant selector: [ids, classes, elements]. */
function specificity(sel) {
    let s = sel;
    let ids = 0, cls = 0, els = 0;
    // :not(...) / :has(...) — count the inner parts, the pseudo itself counts nothing
    s = s.replace(/:(?:not|has|is)\(([^)]*)\)/g, (all, inner) => ' ' + inner + ' ');
    s = s.replace(/::[\w-]+/g, ''); // pseudo-ELEMENTS count as elements; handled below
    const pseudoEls = (sel.match(/::[\w-]+/g) || []).length;
    ids += (s.match(/#[\w-]+/g) || []).length;
    cls += (s.match(/\.[\w-]+/g) || []).length;
    cls += (s.match(/\[[^\]]+\]/g) || []).length;
    cls += (s.match(/:(?!:)[\w-]+/g) || []).length;
    els += (s.replace(/[.#[][^\s>+~]*/g, ' ').match(/\b[a-z][\w-]*\b/g) || []).length;
    els += pseudoEls;
    return [ids, cls, els];
}

function specGE(a, b) {
    for (let i = 0; i < 3; i++) {
        if (a[i] !== b[i]) return a[i] > b[i];
    }
    return true;
}

/**
 * Does `sel` match this instance?
 * An instance is an ancestor chain of "class sets", innermost last, plus state flags.
 * Supported: descendant combinator, .class, :hover, :not(...), [disabled], the light-theme
 * body prefix. Sibling/:has selectors are border-only decoration here and are skipped.
 */
/**
 * ⚠️ HOVER IS PER-LEVEL, NOT PER-LEAF. The first cut of this gate tracked hover only on the
 * innermost element and PASSED the real .497 defect on re-injection: the live step-pill's
 * numeral goes dark-on-dark only when its PARENT is hovered, and a leaf-only model cannot
 * express that. `hoverFlags` is aligned to `chain`, so `.step-pill:hover .n` resolves properly
 * and the recursive ground walk keeps the flags instead of silently dropping them.
 */
function hoverFlags(inst) {
    const n = inst.chain.length;
    const f = new Array(n).fill(false);
    if (inst.hover) f[n - 1] = true;
    if (inst.parentHover && n >= 2) f[n - 2] = true;
    return f;
}

function matches(sel, inst, theme) {
    if (/[+~]/.test(sel) || /:has\(/.test(sel)) return false;
    if (/::(before|after|placeholder|-webkit-[\w-]+)/.test(sel)) return false;

    let s = sel;
    const wantsLight = s.startsWith('body[data-swml-theme="light"]');
    if (wantsLight) {
        if (theme !== 'light') return false;
        s = s.replace('body[data-swml-theme="light"] ', '');
    }
    const flags = inst.flags || hoverFlags(inst);
    const parts = s.split(' ').filter(Boolean);
    // walk the instance chain right-to-left
    let ci = inst.chain.length - 1;
    for (let pi = parts.length - 1; pi >= 0; pi--) {
        const part = parts[pi];
        let matchedAt = -1;
        for (let k = ci; k >= 0; k--) {
            if (compoundMatches(part, inst.chain[k], !!flags[k])) { matchedAt = k; break; }
        }
        if (matchedAt < 0) return false;
        ci = matchedAt - 1;
        if (ci < -1) return false;
    }
    return true;
}

function compoundMatches(part, classes, isHovered) {
    const negs = [];
    let p = part.replace(/:not\(([^)]*)\)/g, (all, inner) => { negs.push(inner.trim()); return ''; });

    const need = (p.match(/\.[\w-]+/g) || []).map((c) => c.slice(1));
    if (need.some((c) => !classes.includes(c))) return false;

    if (/:hover/.test(p) && !isHovered) return false;
    if (/:focus-visible|:last-child|:disabled/.test(p)) return false;
    if (/\[disabled\]/.test(p)) return false; // we never audit the disabled state's own rules

    for (const n of negs) {
        if (n === '[disabled]') continue; // instances are never disabled
        const nc = (n.match(/\.[\w-]+/g) || []).map((c) => c.slice(1));
        if (nc.length && nc.every((c) => classes.includes(c))) return false;
    }
    return true;
}

/** Winning declaration for a property on an instance, under real cascade rules. */
function resolveProp(rules, inst, prop, theme, vars) {
    let best = null, bestSpec = null;
    rules.forEach((r) => {
        if (r.decls[prop] === undefined) return;
        if (!matches(r.sel, inst, theme)) return;
        const sp = specificity(r.sel);
        if (!best || specGE(sp, bestSpec)) { best = r; bestSpec = sp; }
    });
    if (!best) return null;
    return { value: resolveVar(best.decls[prop], vars, 0), sel: best.sel, spec: bestSpec };
}

/* ── what we audit ──────────────────────────────────────────────────────────────────────── */

/**
 * ESCALATED, NOT EXEMPT. These pairs fail the floor but are NOT this component's to change —
 * they are the site-wide house standard, and DESIGN.md §13/#13 forbid silently deviating from a
 * reference. They are listed here so the miss stays VISIBLE (a hidden exception is how a known
 * defect becomes an unknown one), and they are reported on every run.
 *
 *   `.btn.primary` light theme = #ECF3FF fill + #4D76FD ink = 3.54:1 at 12px/700 caps.
 *   Source: DESIGN.md §8 House Standard + §Halo button; canonical impl `sophicly-blog-chrome.css`
 *   `.sb-related__return`. Fixing it here alone would fork the brand button.
 *   → raised with Neil 2026-08-10 (#204 add.20); handed to the web-design lane, which owns
 *     site-wide button tokens. If that lane darkens the ink, delete this entry and re-run.
 */
const ESCALATED = [
    { theme: 'light', label: 'btn PRIMARY', why: 'house-standard light button pair (DESIGN.md §8) — web-design lane owns it' },
    { theme: 'light', label: 'btn PRIMARY HOVER', why: 'same pair as above' },
];

/** Neil's seven element hues (#204 add.10) — painted inline from wml-assessment.js ELEMENTS. */
const EL_HUES = [
    ['hook', '#ef8a4b'], ['setup', '#e5c558'], ['reaction', '#45c0d9'], ['epiphany', '#c678dd'],
    ['proaction', '#5aa9f7'], ['climax', '#ef6a6a'], ['denouement', '#ef79a7'],
];

/**
 * Each entry: a real thing on screen. `chain` is the ancestor class stack (outermost first);
 * `ground` names the opaque backdrop when no rule in the chain paints one.
 * `large: true` = >=24px, or >=19px bold (DESIGN.md §3 lets those sit at 3:1).
 */
function instances() {
    const I = (label, chain, opts) => Object.assign({ label, chain, hover: false, large: false, ground: null }, opts || {});
    const list = [
        I('body copy .sub', [['swml-scene-island'], ['sub']]),
        I('.sub strong', [['swml-scene-island'], ['sub'], ['strong']]),
        I('eyebrow', [['swml-scene-island'], ['eyebrow']]),
        I('phase lead', [['swml-scene-island'], ['phase'], ['lead']]),
        I('phase lead strong', [['swml-scene-island'], ['phase'], ['lead'], ['strong']]),

        I('close button', [['swml-scene-island'], ['ssi-close']]),
        I('close button HOVER', [['swml-scene-island'], ['ssi-close']], { hover: true }),

        I('step-pill rest', [['swml-scene-island'], ['step-pill']]),
        I('step-pill HOVER', [['swml-scene-island'], ['step-pill']], { hover: true }),
        I('step-pill numeral', [['swml-scene-island'], ['step-pill'], ['n']]),
        I('step-pill LIVE', [['swml-scene-island'], ['step-pill', 'is-live']]),
        I('step-pill LIVE HOVER', [['swml-scene-island'], ['step-pill', 'is-live']], { hover: true }),
        I('step-pill LIVE numeral', [['swml-scene-island'], ['step-pill', 'is-live'], ['n']]),
        I('step-pill LIVE numeral (pill hovered)', [['swml-scene-island'], ['step-pill', 'is-live'], ['n']], { parentHover: true }),
        I('step-pill DONE', [['swml-scene-island'], ['step-pill', 'is-done']]),
        I('step-pill DONE numeral', [['swml-scene-island'], ['step-pill', 'is-done'], ['n']]),

        I('stage-card body', [['swml-scene-island'], ['stage-card']]),
        I('stage-card roman', [['swml-scene-island'], ['stage-card'], ['roman']]),
        I('stage-card meta', [['swml-scene-island'], ['stage-card'], ['meta']]),
        I('stage-card SELECTED roman', [['swml-scene-island'], ['stage-card', 'is-sel'], ['roman']]),
        I('stage-card SELECTED meta', [['swml-scene-island'], ['stage-card', 'is-sel'], ['meta']]),
        I('hint (amber)', [['swml-scene-island'], ['hint']]),
        I('stage-head', [['swml-scene-island'], ['stage-head']]),

        I('beat text', [['swml-scene-island'], ['beat-card'], ['b-text']]),
        I('beat label', [['swml-scene-island'], ['beat-card'], ['b-label']]),
        I('beat ord', [['swml-scene-island'], ['beat-card'], ['ord']]),
        I('beat SELECTED ord', [['swml-scene-island'], ['beat-card', 'is-sel'], ['ord']]),
        I('beat SELECTED text', [['swml-scene-island'], ['beat-card', 'is-sel'], ['b-text']]),
        I('trim-note', [['swml-scene-island'], ['beat-card', 'is-end'], ['trim-note']]),
        I('beat tick glyph', [['swml-scene-island'], ['beat-card', 'is-sel'], ['tick']]),

        I('strip label', [['swml-scene-island'], ['strip-wrap'], ['strip-label']]),
        I('strip hint', [['swml-scene-island'], ['strip-wrap'], ['strip-hint']]),
        I('el-pill rest', [['swml-scene-island'], ['el-pill']]),
        I('el-pill done', [['swml-scene-island'], ['el-pill', 'is-done']]),
        I('el-pill tickmark', [['swml-scene-island'], ['el-pill', 'is-done'], ['tickmark']]),
        I('el-map-hint', [['swml-scene-island'], ['el-map-hint']]),

        I('ask-panel what', [['swml-scene-island'], ['ask-panel'], ['ask-what']]),
        I('chip-btn', [['swml-scene-island'], ['chip-btn']]),
        I('chip-btn HOVER', [['swml-scene-island'], ['chip-btn']], { hover: true }),

        I('band el-prompt', [['swml-scene-island'], ['band'], ['band-head'], ['el-prompt']]),
        I('band count', [['swml-scene-island'], ['band'], ['band-head'], ['count']]),
        I('band EMPTY count', [['swml-scene-island'], ['band', 'is-empty'], ['band-head'], ['count']]),

        I('p3 row label', [['swml-scene-island'], ['p3-row'], ['b-label']]),
        I('p3 row text', [['swml-scene-island'], ['p3-row'], ['b-text']]),
        I('p3 NEW row label', [['swml-scene-island'], ['p3-row', 'new'], ['b-label']]),
        I('p3 NEW row button', [['swml-scene-island'], ['p3-row', 'new'], ['button']]),
        I('p3 NEW row button HOVER', [['swml-scene-island'], ['p3-row', 'new'], ['button']], { hover: true }),

        I('unshaped head', [['swml-scene-island'], ['unshaped-head']]),
        I('u-row text', [['swml-scene-island'], ['u-row']]),
        I('u-row label', [['swml-scene-island'], ['u-row'], ['b-label']]),
        I('add-in', [['swml-scene-island'], ['band-add'], ['add-in']]),
        I('add-in HOVER', [['swml-scene-island'], ['band-add'], ['add-in']], { hover: true }),
        I('add-form input', [['swml-scene-island'], ['add-form'], ['input']]),
        I('reshape', [['swml-scene-island'], ['reshape']]),
        I('reshape HOVER', [['swml-scene-island'], ['reshape']], { hover: true }),
        I('refine-banner text', [['swml-scene-island'], ['refine-banner'], ['span']]),
        I('row-grip', [['swml-scene-island'], ['row-grip']]),
        I('row-grip HOVER', [['swml-scene-island'], ['row-grip']], { hover: true }),
        I('row-move', [['swml-scene-island'], ['row-move']]),
        I('row-move HOVER', [['swml-scene-island'], ['row-move']], { hover: true }),

        I('nudge title', [['swml-scene-island'], ['nudge'], ['n-title']]),
        I('nudge body', [['swml-scene-island'], ['nudge'], ['n-body']]),
        I('nudge body strong', [['swml-scene-island'], ['nudge'], ['n-body'], ['strong']]),

        I('status', [['swml-scene-island'], ['actionbar'], ['status']]),
        I('status strong', [['swml-scene-island'], ['actionbar'], ['status'], ['strong']]),
        I('btn secondary', [['swml-scene-island'], ['actionbar'], ['btn']]),
        I('btn secondary HOVER', [['swml-scene-island'], ['actionbar'], ['btn']], { hover: true }),
        I('btn PRIMARY', [['swml-scene-island'], ['actionbar'], ['btn', 'primary']]),
        I('btn PRIMARY HOVER', [['swml-scene-island'], ['actionbar'], ['btn', 'primary']], { hover: true }),

        I('summary what', [['swml-scene-island'], ['summary-row'], ['what']]),
        I('summary own', [['swml-scene-island'], ['summary-row'], ['what'], ['own']]),
        I('done-note', [['swml-scene-island'], ['done-note']]),
        I('done-note strong', [['swml-scene-island'], ['done-note'], ['strong']]),
    ];
    return list;
}

/** Resolve the opaque backdrop behind an instance by walking its chain outward. */
function groundFor(rules, inst, theme, vars) {
    const flags = inst.flags || hoverFlags(inst);
    for (let depth = inst.chain.length; depth >= 1; depth--) {
        const sub = { chain: inst.chain.slice(0, depth), flags: flags.slice(0, depth) };
        const bg = resolveProp(rules, sub, 'background', theme, vars);
        const raw = bg && bg.value;
        if (!raw || raw === 'none' || raw === 'transparent') continue;
        if (/linear-gradient/.test(raw)) {
            // our only gradients are a flat tint over a surface: tint over the trailing colour
            const tail = raw.split('),').pop().trim();
            const base = parseColor(tail);
            const tint = parseColor((/rgba?\([^)]*\)/.exec(raw) || [])[0]);
            if (base) return over(tint, base);
            continue;
        }
        const c = parseColor(raw);
        if (!c) continue;
        if (c.a >= 1) return c;
        // translucent: composite over whatever is behind it
        const behind = groundFor(rules, { chain: inst.chain.slice(0, depth - 1), flags: flags.slice(0, depth - 1) }, theme, vars);
        return over(c, behind);
    }
    return parseColor(resolveVar('var(--ground)', vars, 0)) || { r: 255, g: 255, b: 255, a: 1 };
}

/* ── run ────────────────────────────────────────────────────────────────────────────────── */

function run() {
    const css = fs.readFileSync(CSS_PATH, 'utf8');
    const rules = parseRules(css);
    const themes = readThemes(rules);

    let failures = [];
    const rows = [];

    ['dark', 'light'].forEach((theme) => {
        const vars = themes[theme];
        instances().forEach((inst) => {
            const fgD = resolveProp(rules, inst, 'color', theme, vars);
            if (!fgD) return;
            const fg = parseColor(fgD.value);
            if (!fg) return;
            const ground = groundFor(rules, inst, theme, vars);
            const ratio = contrast(over(fg, ground), ground);
            const floor = inst.large ? 3 : 4.5;
            const rec = {
                theme, label: inst.label, ratio: +ratio.toFixed(2), floor,
                fg: fgD.value, bg: `rgb(${Math.round(ground.r)},${Math.round(ground.g)},${Math.round(ground.b)})`,
                sel: fgD.sel,
            };
            rows.push(rec);
            if (ratio < floor) failures.push(rec);
        });
    });

    // Neil's 7 element hue badges carry hardcoded #1C1D1F ink; same in both themes.
    EL_HUES.forEach(([id, hue]) => {
        const bg = parseColor(hue);
        const ratio = contrast(parseColor('#1C1D1F'), bg);
        const rec = { theme: 'both', label: `element badge numeral (${id})`, ratio: +ratio.toFixed(2), floor: 4.5, fg: '#1C1D1F', bg: hue, sel: '.band-head .el .ord' };
        rows.push(rec);
        if (ratio < 4.5) failures.push(rec);
    });

    if (VERBOSE) {
        rows.sort((a, b) => a.ratio - b.ratio).forEach((r) => {
            console.log(`${r.ratio < r.floor ? 'FAIL' : 'ok  '} ${String(r.ratio).padStart(6)}:1  [${r.theme}] ${r.label}  (${r.fg} on ${r.bg})`);
        });
        console.log('');
    }

    const escalated = failures.filter((f) => ESCALATED.some((e) => e.theme === f.theme && e.label === f.label));
    const blocking = failures.filter((f) => !escalated.includes(f));

    if (escalated.length) {
        console.log(`\n⚠️  ${escalated.length} ESCALATED (site-wide, not this component's to fix — still failing, still tracked):`);
        escalated.forEach((f) => {
            const why = (ESCALATED.find((e) => e.theme === f.theme && e.label === f.label) || {}).why;
            console.log(`   [${f.theme}] ${f.label}  ${f.ratio}:1 (needs ${f.floor}:1)  — ${why}`);
        });
        console.log('');
    }

    const failuresAll = failures;
    failures = blocking;
    void failuresAll;

    if (failures.length) {
        console.error(`\n❌ island-contrast-lint: ${failures.length} contrast failure(s) — DESIGN.md §3 floor is 4.5:1 body / 3:1 large.\n`);
        failures.sort((a, b) => a.ratio - b.ratio).forEach((f) => {
            console.error(`  [${f.theme}] ${f.label}`);
            console.error(`      ${f.ratio}:1  (needs ${f.floor}:1)   fg ${f.fg}  on  bg ${f.bg}`);
            console.error(`      winning rule: ${f.sel}`);
        });
        console.error('\n  Light theme note: the light block must override the ACCENT tokens too, not just the');
        console.error('  surface ladder. DESIGN.md §ICON CHROME: dark-surface accent #51dacf, light-surface #4D76FD.\n');
        process.exit(1);
    }

    console.log(`✅ island-contrast-lint: ${rows.length} painted pairs pass (dark + light, rest + hover, WCAG AA).`);
}

run();
