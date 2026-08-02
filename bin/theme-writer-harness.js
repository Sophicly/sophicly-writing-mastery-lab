#!/usr/bin/env node
/* eslint-env node */
/**
 * theme-writer-harness.js — v7.20.404 (FIXLIST #183)
 *
 * WHY THIS EXISTS. Neil, 2026-08-02: *"in full screen the theme toggle doesn't work… it's kind of
 * frozen"* — and then the instruction that made this file: *"we've actually solved that problem
 * several times before. So we need to find out why it's returned, how to solve it once and for
 * all. And then document the problem and the solution. And I think create a harness for it."*
 *
 * WHY IT KEPT COMING BACK — the two halves were fixed in different versions, months apart:
 *   • v7.19.228/.229 wrote the canvas toggle's choice into the PRIVATE key `swml-theme-manual`,
 *     because that is what `getTheme()` read at the time.
 *   • v7.20.13 RETIRED that key on the READ side: `theme-preference` (sessionStorage → cookie)
 *     became the source of truth, and `toggleTheme()` now DELETES the private key so a stale copy
 *     cannot fight the site toggle.
 *   • Nobody changed the canvas WRITE. It became the one writer in the app that never writes the
 *     store the app reads — the write-key ≠ read-key class (root CLAUDE.md §5d).
 *
 * WHY THE SYMPTOM IS "FROZEN" AND NOT "WRONG": the flip and the revert are one frame apart. Click →
 * html flips; `themeObserver` fires on the next DOM mutation (the canvas mutates constantly) →
 * `getTheme()` reads the shared store, which still says the OLD theme → `applyTheme(old)` → its
 * tail calls `window.themeToggle.setTheme(old)` and drags the whole site back. Nothing errors.
 *
 * ⭐ WHAT MAKES THIS A GATE AND NOT A NOTE. Every previous fix was correct ON THE DAY and was
 * invalidated by a later change to the OTHER side. A comment cannot notice that. These assertions
 * are pinned to BOTH sides at once: if the read order changes, or a new write path appears, the
 * build fails — which is the only form of "once and for all" that survives the next refactor.
 *
 * ⚠️ IT SLICES THE REAL FUNCTIONS (see cw6-livevalue-harness for the same convention). A check that
 * restates the rule tests its own memory of it, not the code
 * (`feedback_a_check_that_duplicates_its_subject_is_not_a_check`).
 *
 * PROVEN NON-VACUOUS — each injected and confirmed red:
 *   • restore the pre-.404 canvas handler (writes `swml-theme-manual`, calls themeToggle.setTheme)
 *     → "ONE WRITER" and the behavioural revert check both fail;
 *   • put the private key first in `getTheme()`   → "read order" fails;
 *   • drop the delete from `toggleTheme()`        → "retires the legacy key" fails.
 *
 * Run: node bin/theme-writer-harness.js       (wired into bin/pre-ship-check.sh)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CORE = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-core.js'), 'utf8');
const ASSESS = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

function braceSliceFrom(s, idx, open, close) {
    const start = s.indexOf(open, idx);
    let d = 0;
    for (let k = start; k < s.length; k++) {
        const c = s[k];
        if (c === open) d++;
        else if (c === close) { d--; if (d === 0) return { text: s.slice(start, k + 1), end: k + 1 }; }
        else if (c === '/' && s[k + 1] === '/') { while (k < s.length && s[k] !== '\n') k++; }
        else if (c === '/' && s[k + 1] === '*') { k += 2; while (k < s.length && !(s[k] === '*' && s[k + 1] === '/')) k++; k++; }
        else if (c === '"' || c === "'" || c === '`') {
            const q = c; k++;
            while (k < s.length && s[k] !== q) { if (s[k] === '\\') k++; k++; }
        }
    }
    return null;
}
function sliceFn(src, decl, label) {
    const i = src.indexOf(decl);
    if (i < 0) { console.error('theme-writer: cannot find `' + decl + '` — renamed? (' + label + ')'); process.exit(1); }
    return src.slice(i, braceSliceFrom(src, i, '{', '}').end);
}

// ⚠️ STRIP COMMENTS BEFORE MEASURING ORDER — the first cut of this harness did NOT, and it was
// VACUOUS: `getTheme()` opens with a comment that names BOTH stores, shared one first, explaining
// the v7.20.13 decision. So `indexOf` was measuring the PROSE, which says the right thing no
// matter what the code below it does — injecting the real defect (legacy key read first) left the
// check green. Same shape as the fossil-lint lesson where a `why` string blinded the value check:
// a check that can be satisfied by a comment is not a check.
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}

let failed = 0, passed = 0;
function ok(cond, label, detail) {
    if (cond) { passed++; return; }
    failed++;
    console.error('  ✗ ' + label + (detail ? '\n      ' + detail : ''));
}

console.log('theme-writer-harness — one store, one writer (FIXLIST #183)\n');

const FN_GET = sliceFn(CORE, 'function getTheme()', 'core');
const FN_TOGGLE = sliceFn(CORE, 'function toggleTheme()', 'core');
const FN_APPLY = sliceFn(CORE, 'function applyTheme(theme)', 'core');
const LEGACY = 'swml-theme-manual';
const SHARED = 'theme-preference';

// ── 1. READ ORDER — the shared store must be consulted BEFORE the legacy key. ─────────────────
// If the private key is read first, a stale copy outranks the user's actual site-wide choice,
// which is the loop v7.20.13 was written to end.
{
    const CODE_GET = stripComments(FN_GET);   // measure the CODE, never the comment above it
    const iShared = CODE_GET.indexOf(SHARED);
    const iLegacy = CODE_GET.indexOf(LEGACY);
    ok(iShared > -1, 'getTheme() reads the shared `' + SHARED + '` store');
    ok(iLegacy === -1 || iShared < iLegacy,
        'getTheme() reads the shared store BEFORE the legacy key',
        'the legacy key appears at ' + iLegacy + ', the shared store at ' + iShared
        + ' — reading the private key first is what lets a stale value outrank the site-wide choice.');
}

// ── 2. THE ONE WRITER — toggleTheme persists to the shared store and RETIRES the legacy key. ──
{
    ok(stripComments(FN_TOGGLE).indexOf(SHARED) > -1, 'toggleTheme() persists to the shared store');
    ok(/removeItem\(\s*'swml-theme-manual'/.test(stripComments(FN_TOGGLE)),
        'toggleTheme() retires the legacy key, so a stale copy cannot fight the site toggle');
}

// ── 3. ⭐ NO SECOND WRITER — nothing else in the frontend may PERSIST the retired key. ─────────
// This is the assertion that would have caught the regression the day it was introduced: the
// canvas toggle kept writing a key the rest of the app had stopped reading.
{
    const files = fs.readdirSync(path.join(ROOT, 'frontend')).filter((f) => /\.js$/.test(f) && !/tiptap|min\.js/.test(f));
    const offenders = [];
    files.forEach((f) => {
        const src = fs.readFileSync(path.join(ROOT, 'frontend', f), 'utf8');
        src.split('\n').forEach((line, i) => {
            // A WRITE is setItem on the legacy key. Reads (getItem) and the retirement
            // (removeItem) are both legitimate and deliberately not matched.
            if (/(localStorage|sessionStorage)\.setItem\(\s*'swml-theme-manual'/.test(line)) {
                offenders.push(f + ':' + (i + 1));
            }
        });
    });
    ok(offenders.length === 0,
        'nothing persists the retired `' + LEGACY + '` key — the shared store is the ONLY writer',
        offenders.length ? 'writes found at ' + offenders.join(', ')
            + '\n      A theme choice stored here is invisible to getTheme(), which reads `' + SHARED
            + '` first — so the next DOM mutation reverts the user and the control reads as frozen.'
            : '');
}

// ── 4. THE CANVAS TOGGLE GOES THROUGH THE ONE WRITER. ────────────────────────────────────────
// Sliced from its real call site rather than described, so a future rewrite is measured, not
// assumed. It must not hand-roll html/dataset writes of its own.
{
    const i = ASSESS.indexOf("createThemeToggleBtn('swml-canvas-theme-toggle'");
    ok(i > -1, 'the canvas theme toggle still exists');
    if (i > -1) {
        const body = stripComments(ASSESS.slice(i, i + 700));
        ok(/toggleTheme\(\)/.test(body),
            'the canvas toggle calls toggleTheme() — the one writer',
            'it must not persist the theme itself; that is how the two sides drifted apart.');
        ok(!/setItem\(\s*'swml-theme-manual'/.test(body),
            'the canvas toggle does not write the retired key');
        ok(!/documentElement\.setAttribute\(\s*'data-theme'/.test(body),
            'the canvas toggle does not hand-roll the html attribute — applyTheme owns that');
    }
}

// ── 5. BEHAVIOURAL — drive the REAL getTheme/toggleTheme and prove a click STICKS. ────────────
// This is the check that speaks to what Neil saw. The revert needs no observer to be modelled:
// if getTheme() does not return the new theme immediately after toggleTheme(), then the very next
// themeObserver tick calls applyTheme(old) and the site snaps back.
{
    function world() {
        const store = { session: {}, local: {} };
        const mk = (bag) => ({
            getItem: (k) => (Object.prototype.hasOwnProperty.call(bag, k) ? bag[k] : null),
            setItem: (k, v) => { bag[k] = String(v); },
            removeItem: (k) => { delete bag[k]; },
        });
        const html = { attrs: {}, classes: {} };
        const documentStub = {
            cookie: '',
            documentElement: {
                getAttribute: (k) => (k in html.attrs ? html.attrs[k] : null),
                setAttribute: (k, v) => { html.attrs[k] = v; },
                classList: { toggle: (c, on) => { html.classes[c] = !!on; } },
            },
            body: { setAttribute: () => {} },
            getElementById: () => null,
        };
        const api = new Function(
            'sessionStorage', 'localStorage', 'document', 'window', '$', 'getSystemTheme',
            FN_GET + '\n' + FN_APPLY + '\n' + FN_TOGGLE
            + '\nreturn { getTheme: getTheme, toggleTheme: toggleTheme, html: null };'
        )(mk(store.session), mk(store.local), documentStub, { themeToggle: null }, () => null, () => 'dark');
        return { api, store, html, documentStub };
    }

    // The exact scenario: the site is dark, the student clicks the canvas toggle in full screen.
    const w = world();
    w.store.session[SHARED] = 'dark';
    w.api.toggleTheme();
    ok(w.api.getTheme() === 'light',
        'a click STICKS — getTheme() reports the new theme immediately afterwards',
        'got "' + w.api.getTheme() + '". If this is still the old theme, the next DOM mutation '
        + 'calls applyTheme(old) and drags the whole site back one frame later. That is the '
        + '"frozen" toggle, and no error is ever logged.');
    ok(w.store.session[SHARED] === 'light', 'the shared store carries the new value');
    ok(!w.store.local[LEGACY] && !w.store.session[LEGACY],
        'the retired key is left deleted, not re-seeded');

    // And back again, from a cookie-only starting state (a fresh tab: sessionStorage empty).
    const w2 = world();
    w2.documentStub.cookie = 'theme-preference=light';
    ok(w2.api.getTheme() === 'light', 'a fresh tab reads the durable cookie');
    w2.api.toggleTheme();
    ok(w2.api.getTheme() === 'dark', 'and a click in that tab sticks too');
}

if (failed) {
    console.error('\ntheme-writer-harness: ' + failed + ' FAILED, ' + passed + ' passed');
    process.exit(1);
}
console.log('✓ ' + passed + ' assertions passed — one store, one writer, and a click cannot be reverted');
