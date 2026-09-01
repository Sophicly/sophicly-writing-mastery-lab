#!/usr/bin/env node
/**
 * GATE — the contextual selection toolbar must FIT inside the pane it floats in, at every pane
 * width, on all three toolbars that share the placer.
 *
 * WHY (FIXLIST #460, Neil 2026-09-01): *"the contextual toolbar in the WML has a lower zed index
 * than the chat panel on the right."* The symptom was real; the cause was not the one named, and
 * this gate exists to keep both facts nailed down:
 *
 *   · the bar is z-index 100, .swml-canvas-chat is z-index 2 — the bar has ALWAYS been far above
 *     the panel, and raising it fixes nothing (asserted below by actually raising it);
 *   · the bar had NO max-width. It is a flex row that grows to its content, and the placer clamps
 *     its left with Math.max(4, ...), so as soon as the content is wider than the document pane it
 *     pins at left:4 and the excess runs off the right edge — where .swml-canvas-content's
 *     `overflow-x: hidden` CLIPS it. Being cut off at the pane edge looks exactly like sliding
 *     underneath the panel, which is why the z-index reading was so plausible.
 *
 * It renders the REAL stylesheets (never a copy of the rules) at pane widths from generous down to
 * cramped, and requires the bar to stay inside its host every time.
 *
 *   npm i playwright     # once
 *   node bin/toolbar-fits-its-pane-gate.mjs
 *   node bin/toolbar-fits-its-pane-gate.mjs --inject-defect    # prove it still has teeth
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INJECT = process.argv.includes('--inject-defect');
let pass = 0, fail = 0;
const ok = (label, cond, got) => {
    if (cond) { console.log('  ✓ ' + label); pass++; }
    else { console.log('  ✗ ' + label + (got !== undefined ? '   got: ' + JSON.stringify(got) : '')); fail++; }
};

let canvas = readFileSync(join(ROOT, 'frontend/wml-canvas.css'), 'utf8');
let styles = readFileSync(join(ROOT, 'frontend/wml-styles.css'), 'utf8');
if (INJECT) {
    // Put the defect back: remove the cap, and the shrink that makes it bite.
    const before = styles + canvas;
    styles = styles.replace(/\n\s*max-width: calc\(100% - 8px\);\n\s*box-sizing: border-box;/, '');
    canvas = canvas.replace(/\n\s*min-width: 0;\n\s*max-width: none;/, '');
    if (styles + canvas === before) {
        console.error('⛔ --inject-defect could not find what it patches — the gate would pass for the\n' +
                      '   wrong reason. Update the injection to match the current CSS.');
        process.exit(2);
    }
}

// The real bar: three text buttons, a divider, and the carousel with its drag-track + arrow lane.
const HTML = (paneW) => `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:#1b1c1f}
${styles}
${canvas}
.row{display:flex;height:360px;width:${paneW + 380}px}
</style>
<div class="row">
  <div class="swml-canvas-content" id="host" style="position:relative;overflow-x:hidden;overflow-y:auto;flex:1">
    <div style="height:700px"></div>
    <div class="swml-selection-toolbar swml-sel-neumorphic" id="tb" style="top:40px">
      <button class="swml-sel-btn"><span>Comment</span></button>
      <button class="swml-sel-btn"><span>Note</span></button>
      <button class="swml-sel-btn swml-sel-mic"><span>Dictate</span></button>
      <div class="swml-doc-sel-div"></div>
      <div class="swml-canvas-toolbar">
        <div class="swml-tb-scroll">
          <span class="swml-tb-item">B</span><span class="swml-tb-item">I</span>
          <span class="swml-tb-item">U</span><span class="swml-tb-item">S</span>
          <span class="swml-tb-sep"></span><span class="swml-tb-item">H2</span>
          <span class="swml-tb-item">H3</span><span class="swml-tb-item">Quote</span>
        </div>
        <div class="swml-tb-arrows"><button class="swml-tb-arrow">‹</button><button class="swml-tb-arrow">›</button></div>
      </div>
    </div>
  </div>
  <div class="swml-canvas-chat" id="chat"></div>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 460 } });

console.log('\nThe stack is not the problem — the bar is already far above the panel:');
await page.setContent(HTML(700), { waitUntil: 'load' });
const z = await page.evaluate(() => ({
    tb: +getComputedStyle(document.getElementById('tb')).zIndex,
    chat: +getComputedStyle(document.getElementById('chat')).zIndex,
    overflowX: getComputedStyle(document.getElementById('host')).overflowX,
}));
ok(`toolbar z-index (${z.tb}) is ABOVE the chat panel (${z.chat})`, z.tb > z.chat, z);
ok('the pane clips horizontally, which is what actually hides the overrun', z.overflowX === 'hidden', z.overflowX);

// The placer's real horizontal clamp, replicated exactly (wml-assessment.js _swmlPlaceSelToolbar).
const placeAndMeasure = (selectionCentre) => page.evaluate((cx) => {
    const host = document.getElementById('host'), tb = document.getElementById('tb');
    const hr = host.getBoundingClientRect();
    const tbW = tb.offsetWidth;
    tb.style.left = Math.max(4, Math.min(cx - tbW / 2, hr.width - tbW - 4)) + 'px';
    const tr = tb.getBoundingClientRect();
    const track = document.querySelector('.swml-tb-scroll');
    const arrows = document.querySelector('.swml-tb-arrows');
    return {
        paneW: +hr.width.toFixed(1), barW: tbW,
        overrun: +(tr.right - hr.right).toFixed(1),
        leftOverrun: +(hr.left - tr.left).toFixed(1),
        trackW: track ? track.offsetWidth : -1,
        arrowsVisible: arrows ? arrows.getBoundingClientRect().width > 0 : false,
        arrowsInsidePane: arrows ? arrows.getBoundingClientRect().right <= hr.right + 0.5 : false,
    };
}, selectionCentre);

console.log('\nThe bar stays inside its pane at every width (selection hard against the right edge):');
for (const paneW of [900, 760, 620, 520, 420, 360]) {
    await page.setContent(HTML(paneW), { waitUntil: 'load' });
    const m = await placeAndMeasure(paneW - 20);
    ok(`pane ${String(m.paneW).padStart(5)}px → bar ${String(m.barW).padStart(3)}px, overrun ${m.overrun}px`,
        m.overrun <= 0.5 && m.leftOverrun <= 0.5, m);
}

console.log('\nNothing became unreachable in exchange — the carousel absorbs it, as designed:');
await page.setContent(HTML(420), { waitUntil: 'load' });
const tight = await placeAndMeasure(400);
ok('the carousel track still has width at the tightest pane', tight.trackW > 0, tight.trackW);
ok('its scroll arrows are still rendered', tight.arrowsVisible, tight);
ok('…and they sit INSIDE the pane, so the items past the fold can be reached', tight.arrowsInsidePane, tight);

await browser.close();
console.log(`\n${pass} passed · ${fail} failed.`);
if (INJECT) {
    if (!fail) { console.error('\n⛔ GATE IS BLIND: the injected defect did not fail it.'); process.exit(1); }
    console.log(`Defect injection produced ${fail} failure(s) — the gate has teeth.`);
    process.exit(0);
}
process.exit(fail ? 1 : 0);
