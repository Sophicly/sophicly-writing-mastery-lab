#!/usr/bin/env node
/* eslint-env node */
/**
 * cw-trial-seed-gate — a trial shows the draft it is assessing. (v7.20.550, CW trials slice 3)
 *
 * WHY THIS EXISTS. A trial marks writing done in an EARLIER lesson, so the draft has to travel to
 * this page — and every way that chain breaks is silent:
 *   · the trial→draft link hard-coded, so it lies the day a trial moves in the course order;
 *   · the copy CACHED, so a student assesses a draft they have since rewritten (FIXLIST #402);
 *   · the copy EDITABLE, so the writing gets "fixed" in the one lesson that must not fix it;
 *   · the draft missing and the page silent, so a blank box reads as the student's own mistake;
 *   · the copy flagged as the student's own composition, so the CW word total counts it twice.
 * Each of those is an assertion here rather than a paragraph someone has to remember.
 *
 * It runs the REAL functions wherever it can: `cwTrialSource` is executed out of wml-core (and
 * re-executed after MOVING a trial in the course order, which is the only way to prove it derives
 * rather than remembers), and the two document helpers are sliced out of the shipped source and
 * run against a fixture. The remaining contracts live only in the source and are asserted there.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { braceSliceFrom } = require('./walk-sim-lib');

let fails = 0;
const ok = (label, cond, got) => {
    console.log((cond ? '  ✓ ' : '  ✗ ') + label + (cond || got === undefined ? '' : '   got: ' + JSON.stringify(got)));
    if (!cond) fails++;
};

// ── A REAL WORLD, thin enough that wml-core evaluates in node ─────────────────────────────────
const mkStyle = () => ({ setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } });
const mkEl = () => ({
    style: mkStyle(), classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    dataset: {}, children: [], appendChild() {}, removeChild() {}, remove() {}, setAttribute() {},
    getAttribute() { return null; }, addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, insertAdjacentHTML() {},
    closest() { return null; }, focus() {}, click() {},
    getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; },
});
global.document = {
    addEventListener() {}, removeEventListener() {}, createElement: mkEl, createTextNode() { return {}; },
    querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; },
    body: mkEl(), documentElement: mkEl(), head: mkEl(), readyState: 'complete',
};
global.window = {
    addEventListener() {}, removeEventListener() {}, location: { href: '', search: '', hash: '' },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    document: global.document, matchMedia() { return { matches: false, addEventListener() {}, addListener() {} }; },
    getComputedStyle() { return mkStyle(); }, requestAnimationFrame() { return 0; }, setTimeout() { return 0; },
};
global.getComputedStyle = global.window.getComputedStyle;
global.navigator = { userAgent: 'node' };
global.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
global.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
global.requestAnimationFrame = () => 0;
global.window.MutationObserver = global.MutationObserver;

const CORE = fs.readFileSync(path.join(ROOT, 'frontend/wml-core.js'), 'utf8');
try { new Function(CORE)(); } catch (e) {
    console.log('cw-trial-seed-gate: wml-core.js did not evaluate — ' + e.message);
    process.exit(1);
}
const WML = global.window.WML;
const SRC = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');

// ── 1. WHICH DRAFT DOES A TRIAL ASSESS — the real resolver, on the real course order ──────────
console.log('\nEvery trial resolves to the draft written before it:');
const seen = [1, 2, 3, 4, 5, 6].map(n => WML.cwTrialSource('cw_trial_' + n));
ok('Trial 1 assesses draft_1, written in Step 10',
    seen[0] && seen[0].artifactKey === 'draft_1' && seen[0].draftStep === 10, seen[0]);
ok('Trial 2 → draft_2 (Step 14)', seen[1] && seen[1].artifactKey === 'draft_2' && seen[1].draftStep === 14, seen[1]);
ok('Trial 3 → draft_3 (Step 17)', seen[2] && seen[2].artifactKey === 'draft_3' && seen[2].draftStep === 17, seen[2]);
ok('Trial 4 → draft_4 (Step 20)', seen[3] && seen[3].artifactKey === 'draft_4' && seen[3].draftStep === 20, seen[3]);
ok('Trial 5 → draft_5 (Step 23)', seen[4] && seen[4].artifactKey === 'draft_5' && seen[4].draftStep === 23, seen[4]);
ok('Trial 6 → draft_7 (Step 29) — today it follows Draft 7, and the map is not asked to remember that',
    seen[5] && seen[5].artifactKey === 'draft_7' && seen[5].draftStep === 29, seen[5]);
ok('every trial carries the draft step\'s own LABEL, so the page can name where the writing came from',
    seen.every(s => s && /^Draft \d/.test(s.draftLabel)), seen.map(s => s && s.draftLabel));
ok('a step that is not a trial resolves to nothing', WML.cwTrialSource('cw_step_10') === null);

console.log('\n…and it DERIVES that, so a trial that MOVES stays correct with no edit here:');
{
    // PEDAGOGY §33 ruling 1 moves Trial 6 to follow Draft 6 (Step 26). Perform that move against
    // the live course order and re-ask — a hand-written map would still answer draft_7.
    const steps = WML.CW_STEPS;
    const t6 = steps.findIndex(s => s.trial === 6);
    const d6 = steps.findIndex(s => s.draft === 6);
    ok('the fixture is real: trial 6 and draft 6 both exist in CW_STEPS', t6 > 0 && d6 > 0, { t6, d6 });
    const entry = steps.splice(t6, 1)[0];
    steps.splice(d6 + 1, 0, entry);                       // now: … Draft 6 (25) · Trial 6 · Step 26 …
    const moved = WML.cwTrialSource('cw_trial_6');
    ok('moved behind Draft 6, Trial 6 now assesses draft_6 (Step 26)',
        moved && moved.artifactKey === 'draft_6' && moved.draftStep === 26, moved);
    steps.splice(steps.indexOf(entry), 1);
    steps.splice(t6, 0, entry);                           // put the course back
    ok('the course order is restored for the checks below',
        WML.cwTrialSource('cw_trial_6').artifactKey === 'draft_7');
}

// ── 2. A MINIMAL HTML SHIM — self-tested first, so a broken shim fails LOUD, never green ──────
// node has no DOM and this repo carries no jsdom, so the two document helpers need somewhere to
// parse. The shim is deliberately tiny and its own fixture is asserted BEFORE it is trusted: an
// environment that silently does nothing is exactly how a gate passes on evidence that never ran.
function parseHTML(html) {
    const nodes = [];
    const stack = [{ children: nodes }];
    const re = /<(\/?)([a-zA-Z0-9-]+)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*(\/?)>|([^<]+)/g;
    let m;
    while ((m = re.exec(html)) !== null) {
        if (m[5] !== undefined) {
            // Keep whitespace-only text: a browser does, and "is this box empty?" is decided by
            // trimming what came back — a shim that quietly drops blanks answers a different
            // question from the one the shipped code asks.
            stack[stack.length - 1].children.push({ text: m[5] });
            continue;
        }
        const [, close, tag, attrsRaw, selfClose] = m;
        if (close) { if (stack.length > 1) stack.pop(); continue; }
        const attrs = {};
        (attrsRaw || '').replace(/([a-zA-Z-]+)="([^"]*)"/g, (_, k, v) => { attrs[k] = v; return ''; });
        const node = { tag, attrs, children: [], raw: m[0] };
        stack[stack.length - 1].children.push(node);
        if (!selfClose && !/^(br|img|hr|input)$/i.test(tag)) stack.push(node);
    }
    const walk = (n, fn) => { (n.children || []).forEach(c => { if (c.tag) { fn(c); walk(c, fn); } }); };
    const textOf = (n) => (n.children || []).map(c => (c.text !== undefined ? c.text : textOf(c))).join('');
    const outerOf = (n) => n.raw + (n.children || []).map(c => (c.text !== undefined ? c.text : outerOf(c))).join('') + '</' + n.tag + '>';
    const decorate = (n) => ({
        get textContent() { return textOf(n); },
        get children() { return (n.children || []).filter(c => c.tag).map(decorate); },
        get outerHTML() { return outerOf(n); },
    });
    const root = { children: nodes };
    return {
        querySelector(sel) {
            const mm = /^\[([a-zA-Z-]+)="([^"]*)"\]$/.exec(sel);
            if (!mm) throw new Error('shim: unsupported selector ' + sel);
            let hit = null;
            walk(root, (n) => { if (!hit && n.attrs[mm[1]] === mm[2]) hit = n; });
            return hit ? decorate(hit) : null;
        },
    };
}
console.log('\nThe HTML shim parses what it is about to be trusted with:');
{
    const d = parseHTML('<div data-x="1"><p>one</p><p>  </p><p>two <em>three</em></p></div>');
    const hit = d.querySelector('[data-x="1"]');
    ok('it finds a node by attribute', !!hit);
    ok('it reads nested text, whitespace and all (a browser keeps it; so must this)',
        hit && hit.textContent === 'one  two three', hit && hit.textContent);
    ok('it lists element children (3 paragraphs)', hit && hit.children.length === 3, hit && hit.children.length);
    ok('and re-serialises one', hit && hit.children[2].outerHTML === '<p>two <em>three</em></p>', hit && hit.children[2].outerHTML);
    ok('a missing node is null', d.querySelector('[data-x="9"]') === null);
}

// ── 3. THE TWO DOCUMENT HELPERS — the shipped source, executed ────────────────────────────────
const slice = (name) => {
    const i = SRC.indexOf('function ' + name + '(');
    return i === -1 ? null : braceSliceFrom(SRC, i, '{', '}').text;
};
const proseSrc = slice('_cwDraftProseFromDoc');
const innerSrc = slice('_cwTrialDraftInner');
ok('_cwDraftProseFromDoc exists in the shipped source', !!proseSrc);
ok('_cwTrialDraftInner exists (ONE producer for both states of the section)', !!innerSrc);

if (proseSrc && innerSrc) {
    const runProse = new Function('parseHTML', `
        const document = { createElement: () => ({ set innerHTML(h) { this._d = parseHTML(h); },
            querySelector(s) { return this._d.querySelector(s); } }) };
        function _cwDraftProseFromDoc(docHTML) ${proseSrc}
        return _cwDraftProseFromDoc;
    `)(parseHTML);
    const runInner = new Function(`
        function escapeHTML(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
        function _cwTrialDraftInner(src, proseHTML) ${innerSrc}
        return _cwTrialDraftInner;
    `)();

    // A real Step-10 document: teaching section, a divider, then the student's own draft box.
    const STEP10_DOC =
        '<div data-section-type="question" data-section-label="About This Draft" data-editable="false">' +
        '<h2>Draft 1: Basic prose style</h2><p>Stephen King says the first draft is just you telling yourself the story.</p></div>' +
        '<div data-section-type="divider" data-section-label="YOUR WRITING" data-editable="false"><p>YOUR WRITING</p></div>' +
        '<div data-section-type="response" data-section-label="Draft" data-editable="true" data-student-composition="true">' +
        '<p>The bell rang twice.</p><p>   </p><p>Nobody moved, not even <em>her</em>.</p></div>';

    console.log('\nThe draft is pulled out of the saved Step-10 document, and only the draft:');
    const prose = runProse(STEP10_DOC);
    ok('the student\'s paragraphs come through', /The bell rang twice\./.test(prose) && /Nobody moved/.test(prose), prose);
    ok('their inline formatting survives', /<em>her<\/em>/.test(prose), prose);
    ok('the TEACHING section is left behind — a trial must not re-teach the drafting lesson',
        !/Stephen King/.test(prose) && !/Draft 1: Basic prose style/.test(prose), prose);
    ok('an empty paragraph contributes nothing', (prose.match(/<p>/g) || []).length === 2, prose);
    ok('a document whose draft box is EMPTY reads as no draft at all (not as a blank success)',
        runProse(STEP10_DOC.replace('<p>The bell rang twice.</p><p>   </p><p>Nobody moved, not even <em>her</em>.</p>', '<p></p>')) === '', 'expected ""');
    ok('a document with no draft box reads as no draft', runProse('<div data-section-type="question" data-section-label="X"><p>hi</p></div>') === '');
    ok('no document at all reads as no draft', runProse('') === '');

    console.log('\nWhat the section SAYS, in both states:');
    const src1 = WML.cwTrialSource('cw_trial_1');
    const present = runInner(src1, prose);
    const missing = runInner(src1, '');
    ok('with a draft: the writing is on the page', /The bell rang twice\./.test(present));
    ok('…titled with the draft it is', /Draft 1: Prose Style/.test(present), present.slice(0, 120));
    ok('…and it says where the writing came from and that this is not where you change it',
        /Step 10/.test(present) && /cannot edit/i.test(present), present.slice(0, 400));
    ok('with NO draft: it says so plainly, rather than showing a blank box (§4d)',
        /has not arrived/i.test(missing), missing.slice(0, 200));
    ok('…names the lesson to go back to', /Step 10/.test(missing), missing);
    ok('…and gives the student something to DO', /Go back to/.test(missing) && /reload/.test(missing), missing);
    ok('the missing state never claims the writing is below it',
        !/copied here so you can read it/.test(missing), missing);

    console.log('\nIt is written for a 12-year-old (root §5c-ii(a) — no words of ours):');
    const banned = /\b(artifact|payload|protocol|module|component|the system|the platform|marker|bank)\b/i;
    ok('the draft-present wording carries no insider word', !banned.test(present.replace(/<[^>]+>/g, ' ')), (present.match(banned) || [])[0]);
    ok('the missing wording carries none either', !banned.test(missing.replace(/<[^>]+>/g, ' ')), (missing.match(banned) || [])[0]);
}

// ── 4. THE CONTRACTS THAT ONLY SHOW UP IN THE SOURCE ──────────────────────────────────────────
console.log('\nThe contracts a browser would be needed to see:');
const fillIdx = SRC.indexOf('const tryFillCwTrialDraft = async () => {');
const FILL = fillIdx === -1 ? '' : braceSliceFrom(SRC, fillIdx, '{', '}').text;
ok('the mount-time refresh exists', !!FILL);
ok('…and is wired into the document load chain, so it actually runs',
    /\.then\(\(\) => tryFillCwTrialDraft\(\)\)/.test(SRC));
ok('…gated to TRIALS only — no drafting step inherits it', /cwStepDef\?\.trial/.test(FILL));
ok('…and never writes while a tutor is reviewing', /state\.reviewMode/.test(FILL));
ok('the draft is read FRESH from the project on every mount (#402: never a cached copy)',
    /loadArtifact\(state\.cwProjectId, src\.artifactKey\)/.test(FILL));
ok('⭐ it does NOT skip because the section already holds text — that skip IS #402',
    !/trim\(\)\.length > 0\) return/.test(FILL), 'a length-based skip was found in the refresh');
ok('…it re-writes only when the content actually CHANGED, so a reload is not a save storm',
    /if \(sec\.innerHTML === inner\) return;/.test(FILL));
ok('the section is built READ-ONLY (PEDAGOGY §6 — the trial is not where you fix the writing)',
    /sectionHTML\('response', CW_TRIAL_DRAFT_LABEL, false, null/.test(SRC));
ok('…at EVERY site that builds it (trial-1 branch · generic branch · the heal), so no project gets an editable copy',
    (function () {
        const n = (SRC.match(/sectionHTML\('response', CW_TRIAL_DRAFT_LABEL, false, null/g) || []).length;
        const any = (SRC.match(/sectionHTML\('response', CW_TRIAL_DRAFT_LABEL,/g) || []).length;
        return n >= 3 && n === any;   // every occurrence is the read-only form — no editable variant anywhere
    })(),
    (SRC.match(/sectionHTML\('response', CW_TRIAL_DRAFT_LABEL,/g) || []).length);
ok('⛔ the copy is NOT flagged as the student\'s own composition — it would double-count their words',
    !/CW_TRIAL_DRAFT_LABEL[^\n]*student-composition/.test(SRC));
ok('older trial documents are HEALED — the section is inserted, not silently absent',
    /insertAdjacentHTML\('beforebegin', block\)/.test(FILL) && /insertAdjacentHTML\('afterbegin', block\)/.test(FILL));
ok('…anchored on the divider\'s TEXT, which a save→reload round-trip cannot change — and it knows '
    + 'both doc generations (pre-.552 ASSESSMENT, .552 YOUR JUDGEMENT)',
    /\['ASSESSMENT', 'YOUR JUDGEMENT'\]\.indexOf\(\(d\.textContent \|\| ''\)\.trim\(\)\.toUpperCase\(\)\) !== -1/.test(FILL));
ok('the document write runs under _migrationActive (or the section guard reverts it)',
    /_migrationActive = true;/.test(FILL) && /_migrationActive = _was;/.test(FILL));
ok('a missing draft is NAMED in the console with the key that was looked for, never swallowed',
    /no writing under "' \+ src\.artifactKey \+ '"/.test(FILL));
ok('the template puts the draft ABOVE the marking — you read it before you judge it',
    SRC.indexOf("dividerHTML('YOUR DRAFT')") < SRC.indexOf("dividerHTML('ASSESSMENT')"));

console.log(fails
    ? '\n❌ cw-trial-seed-gate FAILED (' + fails + ')'
    : '\n✅ cw-trial-seed-gate passed (a trial shows the draft it assesses, fresh, read-only, and says so when it is missing).');
process.exit(fails ? 1 : 0);
