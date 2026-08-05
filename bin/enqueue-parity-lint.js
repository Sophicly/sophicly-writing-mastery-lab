#!/usr/bin/env node
/* eslint-env node */
/**
 * enqueue-parity-lint.js — v7.20.445
 *
 * WML registers its front-end scripts in TWO places: `enqueue_assets()` (the standalone page) and
 * `enqueue_embed_assets()` (the shortcode, which is how EVERY LearnDash lesson — every CW step —
 * actually loads). Two lists that must agree is the defect; an omission is only its symptom.
 *
 * ⭐ WHY THIS EXISTS. At v7.20.444 the embed path was missing FOUR modules — `swml-cw6-concepts`,
 * `swml-techniques-index`, `swml-selection-chip`, `swml-pull-overlay`. Nothing crashed. Each one
 * DEGRADED: Step 6 lost its concept map and served every ask without criteria or examples, the
 * outline's technique picker had no vocabulary, and two modules never registered their globals at
 * all. It reached production and was found only because one of the four happened to `console.warn`
 * and a reviewer read the console. The other three were silent, and would have stayed silent.
 *
 * ⚠️ IT CHECKS BOTH HALVES, because either alone is useless:
 *   1. the same script HANDLES are enqueued by both paths, and
 *   2. a handle listed as a DEPENDENCY is one that path actually enqueues — WordPress orders only
 *      what it is told about, so a dependency on a handle you never enqueue silently does nothing.
 *
 * Run: node bin/enqueue-parity-lint.js
 */
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '../sophicly-writing-mastery-lab.php');
const src = fs.readFileSync(FILE, 'utf8');

// Handles that are legitimately page-only — a module the shortcode has no surface for. Add here
// WITH A REASON, never by deleting an assertion.
const PAGE_ONLY = new Set([]);

function fnBody(name) {
    const i = src.indexOf('function ' + name);
    if (i === -1) return null;
    let d = 0, k = src.indexOf('{', i);
    const start = k;
    for (; k < src.length; k++) {
        if (src[k] === '{') d++;
        else if (src[k] === '}') { d--; if (!d) break; }
    }
    return src.slice(start, k + 1);
}

const fail = [];
const ok = [];
const T = (c, m) => (c ? ok : fail).push(m);

const main = fnBody('enqueue_assets');
const embed = fnBody('enqueue_embed_assets');
T(!!main, 'enqueue_assets() found');
T(!!embed, 'enqueue_embed_assets() found');

if (main && embed) {
    // handle → dependency array, per path.
    const parse = (body) => {
        const out = new Map();
        const re = /wp_enqueue_script\(\s*'([a-z0-9-]+)'\s*,\s*[^,]+,\s*(\[[^\]]*\])?/g;
        let m;
        while ((m = re.exec(body))) {
            const deps = (m[2] || '[]').match(/'([a-z0-9-]+)'/g) || [];
            out.set(m[1], deps.map(d => d.replace(/'/g, '')));
        }
        return out;
    };
    const M = parse(main), E = parse(embed);

    // Only WML's own modules are compared — third-party CDN handles (hls-js) are incidental.
    const wml = (h) => h.startsWith('swml-');
    const mh = [...M.keys()].filter(wml);
    const eh = [...E.keys()].filter(wml);

    const missing = mh.filter(h => !E.has(h) && !PAGE_ONLY.has(h));
    T(missing.length === 0,
        `every WML script the page enqueues is also enqueued for the shortcode `
        + `(missing from the embed path: ${missing.length ? missing.join(', ') : 'none'})`);

    const extra = eh.filter(h => !M.has(h));
    T(extra.length === 0,
        `the embed path enqueues nothing the page does not (extra: ${extra.length ? extra.join(', ') : 'none'})`);

    // Half two: a declared dependency must be a handle THAT PATH enqueues.
    [['page', M], ['shortcode', E]].forEach(([label, map]) => {
        map.forEach((deps, handle) => {
            deps.filter(wml).forEach(d => {
                T(map.has(d),
                    `${label}: ${handle} depends on ${d}, and ${label} enqueues it`);
            });
        });
    });

    // And the dependency SETS must match, or one path can still load in the wrong order.
    mh.forEach(h => {
        if (!E.has(h)) return;
        const a = (M.get(h) || []).filter(wml).slice().sort().join(',');
        const b = (E.get(h) || []).filter(wml).slice().sort().join(',');
        T(a === b, `${h} declares the same WML dependencies on both paths (page: [${a}] · shortcode: [${b}])`);
    });
}

ok.forEach(m => console.log('  ✓ ' + m));
fail.forEach(m => console.log('  ✗ ' + m));
console.log(`\n${ok.length} passed, ${fail.length} failed`);
if (fail.length) { console.log('❌ enqueue-parity-lint FAILED — the two enqueue paths have drifted.'); process.exit(1); }
console.log('✅ enqueue-parity-lint passed (page and shortcode load the same modules, in the same order).');
