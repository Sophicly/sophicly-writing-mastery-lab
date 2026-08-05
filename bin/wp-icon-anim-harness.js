#!/usr/bin/env node
/* eslint-env node */
/**
 * wp-icon-anim-harness.js — v7.20.444 (#282)
 *
 * Gate for the Writer's-Profile rail icon's hover animation (the port of
 * `reference/animated-icons/Animated Profile Icon.html`, svg.user).
 *
 * ⭐ WHY THIS EXISTS AND WHY IT IS A COMPUTED-STYLE DIFF, not a screenshot check.
 * Root CLAUDE.md §14c gate 2: the properties that carry this effect — `stroke-dasharray`,
 * `transition-*` INCLUDING the delay, `animation-*`, and the opacity of a 1.6px bar — are all
 * INVISIBLE IN A STILL. A frame-grab of the hover state passes identically whether the delays are
 * right, whether the animation is attached, and whether the SECOND icon layer got any of it. So
 * this asserts the computed values, per state, on BOTH layers, against the reference's numbers.
 *
 * ⭐ AND IT LOADS THE REAL FILES. The glyph comes from `WML.icon('profileAnimated')` out of the
 * real wml-core.js, the CSS is the real wml-canvas.css, and the hue clone is made the same way
 * wml-assessment.js makes it. A harness that restates the values it is checking is checking its
 * own memory (`feedback_a_check_that_duplicates_its_subject_is_not_a_check`).
 *
 * Run: node bin/wp-icon-anim-harness.js [--shot]
 *      --shot also writes /tmp/wp-icon-anim.png for a human look.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CORE = path.join(ROOT, 'frontend/wml-core.js');
const CSS  = path.join(ROOT, 'frontend/wml-canvas.css');
const REF  = path.join(ROOT, 'reference/animated-icons/Animated Profile Icon.html');

// Playwright is not a dependency of this plugin; it is used by several ad-hoc rigs via the npx
// cache. Resolve it leniently so this harness SKIPS (never fails) on a machine without it.
function loadPlaywright() {
    const candidates = [];
    try { candidates.push(require.resolve('playwright')); } catch (_) {}
    const npx = path.join(process.env.HOME || '', '.npm/_npx');
    if (fs.existsSync(npx)) {
        for (const d of fs.readdirSync(npx)) {
            const p = path.join(npx, d, 'node_modules/playwright');
            if (fs.existsSync(p)) candidates.push(p);
        }
    }
    for (const c of candidates) { try { return require(c); } catch (_) {} }
    return null;
}

const fail = [];
const ok   = [];
const T = (cond, msg) => (cond ? ok : fail).push(msg);

// ── 1. THE REFERENCE STILL SAYS WHAT WE PORTED ───────────────────────────────────────────────
// If Neil ever replaces the asset, this is where the port stops matching its source.
const ref = fs.readFileSync(REF, 'utf8');
const refBlink = /@keyframes blink \{([\s\S]*?)\n\}/.exec(ref);
T(!!refBlink, 'reference: @keyframes blink found');
const refStops = refBlink ? (refBlink[1].match(/(\d+)%\s*\{\s*opacity:\s*([\d.]+)/g) || [])
    .map(s => s.replace(/\s+/g, ' ').trim()) : [];
T(refStops.length === 10, `reference: blink has 10 stops (got ${refStops.length}) — it is a DOUBLE blink`);
T(/svg\.toggle\.user rect \{[\s\S]{0,80}animation: blink 6s ease-in-out infinite/.test(ref),
    'reference: the blink is 6s ease-in-out infinite');
T(/svg\.user circle\.animation \{[\s\S]{0,200}stroke-dasharray: 1,200/.test(ref),
    'reference: rest dasharray is 1,200');
T(/svg\.toggle\.user circle\.animation \{[\s\S]{0,200}stroke-dasharray: 200,0/.test(ref),
    'reference: active dasharray is 200,0');
T(/transition: stroke-dashoffset 400ms linear 0ms, stroke-dasharray 400ms linear 0ms/.test(ref),
    'reference: the ring draw is 400ms linear, BOTH dash properties');

(async () => {
    const pw = loadPlaywright();
    if (!pw) {
        console.log('⏭  playwright not resolvable — static reference checks only.');
        report(); return;
    }
    const browser = await pw.chromium.launch();
    const page = await browser.newPage({ viewport: { width: 420, height: 200 }, deviceScaleFactor: 2 });

    const css  = fs.readFileSync(CSS, 'utf8');
    const core = fs.readFileSync(CORE, 'utf8');

    await page.setContent(`<!doctype html><html><head><style>${css}</style>
      <style>body{margin:0;padding:24px;background:#1c1d1f}</style></head>
      <body><div class="swml-outline-btn-column"><button id="wp"
        class="swml-outline-btn swml-wp-trigger" aria-label="Writer’s Profile"></button></div>
      <div id="probe" style="position:absolute;left:-9999px"></div></body></html>`);

    // The real registry, out of the real file.
    await page.addScriptTag({ content: 'window.swmlConfig = { restUrl: "/", iconBaseUrl: "/" };' });
    await page.addScriptTag({ content: core });
    const glyph = await page.evaluate(() => {
        try { return window.WML && typeof window.WML.icon === 'function'
            ? window.WML.icon('profileAnimated', 16) : null; } catch (e) { return 'ERR:' + e.message; }
    });
    T(glyph && glyph.indexOf('ERR:') !== 0 && glyph.length > 100,
        'WML.icon("profileAnimated") returns a glyph from the real registry');
    if (!glyph || glyph.indexOf('<svg') !== 0) { await browser.close(); report(); return; }

    ['swml-wp-ring', 'swml-wp-ring-draw', 'swml-wp-head'].forEach(c =>
        T(glyph.indexOf(c) !== -1, `glyph carries the .${c} hook`));
    T(/pathLength="200"/.test(glyph), 'glyph: the draw-ring declares pathLength="200"');
    // The eyes must be SUBPATHS of the head, not a separate shape — that is the whole reason the
    // blink can be one fill operation and cannot re-grow the compositing band it was built to kill.
    T(!/swml-wp-eyebar/.test(glyph),
        'glyph: no separate eye-bar shape (an overlapping bar composites into a visible band)');
    T(!/fill-rule=/.test(glyph),
        'glyph: fill-rule is NOT set as an attribute — the CSS owns it, so rest cannot disagree with the animation');

    // Mount it, then clone the hue layer EXACTLY as wml-assessment.js does (~26107).
    await page.evaluate((g) => {
        const btn = document.getElementById('wp');
        btn.innerHTML = g;
        const dup = btn.querySelector(':scope > svg').cloneNode(true);
        dup.classList.add('swml-rail-hue');
        dup.setAttribute('aria-hidden', 'true');
        btn.appendChild(dup);
    }, glyph);

    // ── 2. THE EYES ARE INSIDE THE HEAD AND ARE WOUND TO MERGE UNDER `nonzero` ────────────────
    // Geometry, not vibes. `fill-rule` only shuts the eyes if the eye subpaths are (a) contained by
    // the disc and (b) wound the SAME way as it — reverse one and `nonzero` cuts it too, so the
    // blink silently stops working while every style assertion still passes.
    const geo = await page.evaluate(() => {
        const head = document.querySelector('#wp > svg .swml-wp-head');
        const d = head.getAttribute('d');
        const arcs = (d.match(/M([\d.]+) ([\d.]+)m-([\d.]+) 0a([\d.]+) [\d.]+ 0 1 (\d)/g) || []).map(s => {
            const m = /M([\d.]+) ([\d.]+)m-([\d.]+) 0a([\d.]+) [\d.]+ 0 1 (\d)/.exec(s);
            return { cx: +m[1], cy: +m[2], r: +m[3], sweep: +m[5] };
        });
        return { disc: arcs[0], eyes: arcs.slice(1) };
    });
    T(geo.eyes.length === 2, `glyph: two eye subpaths found (got ${geo.eyes.length})`);
    geo.eyes.forEach((e, i) => {
        const inside = Math.hypot(e.cx - geo.disc.cx, e.cy - geo.disc.cy) + e.r <= geo.disc.r;
        T(inside, `eye ${i + 1} sits wholly inside the head disc`);
        T(e.sweep === geo.disc.sweep,
            `eye ${i + 1} is wound the same way as the disc, so nonzero MERGES it (shuts the eye)`);
    });

    // ── 3. COMPUTED-STYLE DIFF, PER STATE, ON BOTH LAYERS ────────────────────────────────────
    const read = () => page.evaluate(() => {
        const out = {};
        ['', '.swml-rail-hue'].forEach((sel, i) => {
            const svg = document.querySelector('#wp > svg' + sel);
            const g = (c) => {
                const s = getComputedStyle(svg.querySelector('.' + c));
                return { dash: s.strokeDasharray, off: s.strokeDashoffset, cap: s.strokeLinecap,
                         op: s.opacity, anim: s.animationName, dur: s.animationDuration,
                         tim: s.animationTimingFunction, iter: s.animationIterationCount,
                         trans: s.transition, rule: s.fillRule };
            };
            out[i === 0 ? 'base' : 'hue'] = {
                ring: g('swml-wp-ring'), draw: g('swml-wp-ring-draw'), head: g('swml-wp-head'),
            };
        });
        return out;
    });

    const rest = await read();
    await page.hover('#wp');
    await page.waitForTimeout(700);          // past the 400ms draw
    const hover = await read();

    ['base', 'hue'].forEach(layer => {
        const r = rest[layer], h = hover[layer];
        // The ring draw — the reference's signature move.
        T(/^1(px)?,\s*200/.test(r.draw.dash.replace(/\s+/g, '')) || /^1,200/.test(r.draw.dash.replace(/\s+/g, '')),
            `${layer}: rest dasharray is the reference's 1,200 (got "${r.draw.dash}")`);
        T(r.draw.dash !== h.draw.dash, `${layer}: the ring dasharray CHANGES on hover (rest "${r.draw.dash}" → hover "${h.draw.dash}")`);
        T(r.draw.cap === 'butt', `${layer}: the draw-ring uses butt caps, so the rest dash is a hairline not a blob (got "${r.draw.cap}")`);
        T(/400ms|0\.4s/.test(r.draw.trans) && /dasharray/.test(r.draw.trans) && /dashoffset/.test(r.draw.trans),
            `${layer}: BOTH dash properties transition at 400ms (got "${r.draw.trans}")`);
        // The static ring dims so the draw reads without a second palette.
        T(parseFloat(r.ring.op) === 1 && parseFloat(h.ring.op) < 1,
            `${layer}: the static ring dims on hover (${r.ring.op} → ${h.ring.op})`);
        // The blink.
        T(r.head.anim === 'none', `${layer}: NO blink at rest (got "${r.head.anim}")`);
        T(h.head.anim === 'swmlWpBlink', `${layer}: the blink is attached on hover (got "${h.head.anim}")`);
        T(h.head.dur === '6s', `${layer}: blink is 6s (got "${h.head.dur}")`);
        T(h.head.tim === 'ease-in-out', `${layer}: blink is ease-in-out (got "${h.head.tim}")`);
        T(h.head.iter === 'infinite', `${layer}: blink is infinite (got "${h.head.iter}")`);
        // The reference's rest state: eyes SHUT until you hover, OPEN once you do.
        T(r.head.rule === 'nonzero', `${layer}: eyes are SHUT at rest, as the reference has it (got "${r.head.rule}")`);
        T(h.head.rule === 'evenodd', `${layer}: eyes OPEN on hover (got "${h.head.rule}")`);
    });

    // ── 3b. THE BLINK ACTUALLY SHUTS THE EYES AT THE PEAK ────────────────────────────────────
    // Sampled with the Web Animations API, NOT by setting a negative animation-delay: measured,
    // a delay change on an already-running animation did NOT reposition it, so an earlier version
    // of this check "froze" at 31% and was silently still reading the resting frame.
    const peak = await page.evaluate(() => {
        document.querySelectorAll('#wp > svg .swml-wp-head').forEach(e =>
            e.getAnimations().forEach(a => { a.pause(); a.currentTime = 1860; }));   // 31% of 6s
        return [...document.querySelectorAll('#wp > svg .swml-wp-head')]
            .map(e => getComputedStyle(e).fillRule);
    });
    T(peak.length === 2 && peak.every(r => r === 'nonzero'),
        `at the 31% peak the eyes are shut on BOTH layers (got ${JSON.stringify(peak)})`);
    await page.evaluate(() => document.querySelectorAll('#wp > svg .swml-wp-head')
        .forEach(e => e.getAnimations().forEach(a => a.play())));

    // ── 3c. EXACTLY ONE FILLED SHAPE — the root of the band defect, asserted structurally ─────
    // ⭐ THE CHECK FOR THE DEFECT THAT ACTUALLY SHIPPED IN THE FIRST CUT OF THIS PORT.
    // Ported verbatim, the blink was an eye-BAR faded over the head. Our icon paints in a
    // SEMI-TRANSPARENT currentColor, so the two fills composited (0.55 over 0.55 ≈ 0.8) and the
    // head wore a visible lighter band across it AT REST. Every computed-style assertion above
    // passed while that was on screen — it was caught by looking at a retina render.
    // A band can only arise where two translucent fills OVERLAP, so the invariant that kills the
    // whole class is: this glyph paints exactly ONE filled shape and everything else is stroke.
    // Structural rather than pixel-sampling on purpose — deterministic, and it names the cause
    // rather than one symptom of it. (It does NOT prove the render is pretty; that is what the
    // --shot render and Neil's eyes are for.)
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
    const fills = await page.evaluate(() =>
        [...document.querySelectorAll('#wp > svg:not(.swml-rail-hue) > *')]
            .map(n => ({ cls: n.getAttribute('class') || n.tagName, fill: getComputedStyle(n).fill }))
            .filter(x => x.fill && x.fill !== 'none'));
    T(fills.length === 1 && fills[0].cls === 'swml-wp-head',
        `exactly one filled shape, and it is the head — no overlap can composite into a band `
        + `(got ${JSON.stringify(fills.map(f => f.cls))})`);

    // ── 4. THE KEYFRAMES MATCH THE REFERENCE STOP FOR STOP ───────────────────────────────────
    // The PROPERTY differs by design (fill-rule, not opacity — see §3c for why), so what is
    // asserted is the thing that actually carries the character: the stop percentages, in order,
    // and that each stop means the same as the reference's (opacity 0 = eyes open = evenodd).
    const ourBody = (/@keyframes swmlWpBlink \{([\s\S]*?)\n\}/.exec(css) || [, ''])[1];
    const ourStops = (ourBody.match(/(\d+)%\s*\{\s*fill-rule:\s*(\w+)/g) || []).map(s => {
        const m = /(\d+)%\s*\{\s*fill-rule:\s*(\w+)/.exec(s);
        return { at: +m[1], shut: m[2] === 'nonzero' };
    });
    const refPairs = refStops.map(s => {
        const m = /(\d+)% \{ opacity: ([\d.]+)/.exec(s);
        return { at: +m[1], shut: parseFloat(m[2]) === 1 };
    });
    T(ourStops.length === refPairs.length,
        `our blink has the same number of stops as the reference (${ourStops.length} vs ${refPairs.length})`);
    T(JSON.stringify(ourStops) === JSON.stringify(refPairs),
        'every stop matches the reference: same percentages, same open/shut meaning, same order');
    T(refPairs.filter(p => p.shut).length === 3,
        'it is still the reference DOUBLE blink — three shut-frames per cycle (31%, 71%, 73%)');

    // ── 5. THE OTHER RAIL BUTTONS ARE UNTOUCHED ──────────────────────────────────────────────
    const scoped = (css.match(/\.swml-wp-trigger[^,{]*(swml-wp-ring|swml-wp-head)/g) || []).length;
    T(scoped > 0, 'the animation CSS is scoped to .swml-wp-trigger');
    T(!/\.swml-outline-btn[^,{]*\.swml-wp-(ring|head)/.test(css),
        'no rule applies the animation to every rail button');

    // ── 6. REDUCED MOTION ────────────────────────────────────────────────────────────────────
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.hover('#wp');
    await page.waitForTimeout(120);
    const rm = await page.evaluate(() => {
        const s = getComputedStyle(document.querySelector('#wp > svg .swml-wp-head'));
        return { anim: s.animationName, rule: s.fillRule };
    });
    T(rm.anim === 'none', `prefers-reduced-motion kills the infinite blink (got "${rm.anim}")`);
    // §4d: a refusal is half a change. Killing the animation must not leave the hover saying nothing.
    T(rm.rule === 'evenodd',
        `under reduced motion the eyes still OPEN on hover, so the button still answers (got "${rm.rule}")`);

    if (process.argv.includes('--shot')) {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.hover('#wp');
        await page.waitForTimeout(500);
        await page.screenshot({ path: '/tmp/wp-icon-anim.png' });
        console.log('📷 /tmp/wp-icon-anim.png');
    }
    await browser.close();
    report();
})().catch(e => { console.error('harness error:', e); process.exit(1); });

function report() {
    ok.forEach(m => console.log('  ✓ ' + m));
    fail.forEach(m => console.log('  ✗ ' + m));
    console.log(`\n${ok.length} passed, ${fail.length} failed`);
    process.exit(fail.length ? 1 : 0);
}
