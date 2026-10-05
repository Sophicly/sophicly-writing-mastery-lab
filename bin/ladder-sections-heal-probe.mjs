#!/usr/bin/env node
/**
 * v7.20.673 — DRIVES healLadderSectionsUnderSelfAssessment on a REAL TipTap/ProseMirror editor
 * (the shipped wml-tiptap.min.js), with the SHIPPED builders and heal sliced out of
 * wml-assessment.js (no reimplementation). FIXLIST #683.
 *
 * Why this exists: the heal MOVES sections inside a live ProseMirror document (tr.delete + insert
 * with position mapping) and INSERTS missing ones (insertContentAt). Static checks prove the code
 * says the right thing; only a real editor proves the transaction lands the section where Neil
 * asked ("underneath the self-assessment") with the student's filled rows intact.
 *
 * Fixtures, all built with the shipped builders:
 *   OLD-LANG  the shape 20 of 31 live docs had (measured on prod 2026-09-30): Mark-Scheme SA and
 *             Calibration at the BOTTOM, after Analytics and the Action Plan, rows FILLED;
 *   TEMPLATE  the pre-.673 template order: Mark-Scheme SA + Calibration ABOVE the Self-Assessment;
 *   LIT-NEW   an existing AQA Literature doc (Shakespeare) that has never had either section;
 *   IN-ORDER  already correct — the heal must make NO transaction at all.
 * Every fixture then runs the heal a SECOND time: nothing may change (idempotent).
 *
 * Needs a browser: `playwright-core` from ~/.sophicly/probe. Skips LOUDLY without it.
 *   node bin/ladder-sections-heal-probe.mjs        (WML_SRC=<file> proves it on a mutant)
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = fs.readFileSync(process.env.WML_SRC || path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
const TIPTAP = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-tiptap.min.js'), 'utf8');
const DATA = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-markscheme-data.js'), 'utf8');
let chromium;
try {
    const require = createRequire(path.join(os.homedir(), '.sophicly/probe/package.json'));
    ({ chromium } = require('playwright-core'));
} catch (e) {
    console.log('⚠️  ladder-sections-heal-probe SKIPPED — playwright-core not found in ~/.sophicly/probe (this is NOT a pass)');
    process.exit(0);
}

function sliceBalanced(i, open, close) {
    let d = 0;
    for (let k = SRC.indexOf(open, i); k < SRC.length; k++) {
        if (SRC[k] === open) d++;
        else if (SRC[k] === close) { d--; if (!d) return k; }
    }
    return -1;
}
function sliceName(name) {
    let i = SRC.search(new RegExp('\\n\\s*function ' + name + '\\('));
    if (i !== -1) { i = SRC.indexOf('function ' + name + '(', i); return SRC.slice(i, sliceBalanced(i, '{', '}') + 1); }
    i = SRC.search(new RegExp('\\n\\s*(const|let|var) ' + name + ' = '));
    if (i === -1) return null;
    i = SRC.indexOf(name + ' = ', i);
    const start = SRC.lastIndexOf('\n', i) + 1;
    return SRC.slice(start, SRC.indexOf(';\n', i) + 1);
}
const NAMES = ['LADDER_SA_LABEL', 'CALIB_LABEL', 'LIT_CALIB_KEY', 'escapeHTML', 'sectionHTML', 'inputHTML', 'dividerHTML',
    '_isLitEssay', 'LADDER_POINT_SCHEMES', '_ladderPointScheme', '_ladderSchemeKeysFor', '_ladderFids', '_ladderGroupHTML', 'buildMarkSchemeSelfAssessSection', '_calibFids', '_ladderIsLit',   // v7.20.713 (#726): + the Q1 point rows
    'GAP_SECTIONS', '_gapFids',   // v7.20.674 (#686): the Literature Calibration template carries the paragraph rows
    'buildCalibrationSection', 'healLadderSectionsUnderSelfAssessment',
    // v7.20.677 (#691): the wording heal + the one-ask confidence fix, both driven below
    'LADDER_SA_INTRO', 'LADDER_SA_PROMPTS', 'LADDER_SA_OLD', '_setParagraphContentViaPM', 'healLadderSaWording', '_ladderHostAskConfidence',
    // v7.20.678: the Section Guard's own node count — the guard reverted the first cut of the heal
    '_PROTECTED_NODE_TYPES', 'countSections', '_ladderOneSentence',
    // v7.20.713 (#726 Q1 point rows · #730 one id = one box): the two new heals + the one-tap ask, driven in block P
    '_ladderRowText', '_ladderRowExists', '_ladderMarksInHistory', '_ladderPointSkip', '_ladderPointExempt', '_ladderHostGroups',
    'healLadderPointRows', '_ladderHostAskPoints', '_ladderHostFilePoints', '_dupFieldRuns', '_dupFieldMerged', 'healDuplicateInputFields'];
const CODE = NAMES.map((n) => { const s = sliceName(n); if (!s) throw new Error('cannot slice ' + n); return s; }).join('\n');

const browser = await chromium.launch();
let failed = 0;
const ok = (label, pass, extra) => { console.log((pass ? '  ✓ ' : '  ✗ ') + label + (extra ? '  — ' + extra : '')); if (!pass) failed++; };

for (const FIX of ['OLD-LANG', 'TEMPLATE', 'LIT-NEW', 'IN-ORDER']) {
    console.log('\n== ' + FIX);
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('  page error:', e.message));
    await page.setContent('<!doctype html><html><body><div id="ed"></div></body></html>');
    await page.addScriptTag({ content: TIPTAP });
    await page.addScriptTag({ content: DATA });
    const r = await page.evaluate(({ CODE, FIX }) => {
        const T = window.TipTap;
        // The two node types the heal touches, with the SAME parse rules as the shipped schema.
        const SectionBlock = T.Node.create({
            name: 'sectionBlock', group: 'block', content: 'block+', defining: true,
            addAttributes() { return { sectionType: { default: 'response' }, label: { default: '' } }; },
            parseHTML() { return [{ tag: 'div[data-section-type]', getAttrs: (d) => ({ sectionType: d.getAttribute('data-section-type'), label: d.getAttribute('data-section-label') || '' }) }]; },
            renderHTML({ HTMLAttributes: a }) { return ['div', { 'data-section-type': a.sectionType, 'data-section-label': a.label }, 0]; },
        });
        const InputField = T.Node.create({
            name: 'inputField', group: 'block', content: 'inline*',
            addAttributes() { return { fieldId: { default: null } }; },
            parseHTML() { return [{ tag: 'div[data-input-field]', getAttrs: (d) => ({ fieldId: d.getAttribute('data-field-id') }) }]; },
            renderHTML({ HTMLAttributes: a }) { return ['div', { 'data-input-field': 'true', 'data-field-id': a.fieldId }, 0]; },
        });
        const lit = FIX === 'LIT-NEW';
        const state = { board: 'aqa', subject: lit ? 'shakespeare' : 'language', text: lit ? 'macbeth' : 'aqa_lang_paper_1', task: 'assessment', reviewMode: false };
        let saves = 0;
        const api = new Function('state', 'WML', 'canvasEditorRef', '_scoreOverlaysRefresh', '_recomputeAllCompletion', 'saveCanvasContent',
            'let canvasEditor = null;\n' + CODE
            + '\nreturn { setEd: (e) => { canvasEditor = e; }, sectionHTML, inputHTML, dividerHTML, buildMarkSchemeSelfAssessSection, buildCalibrationSection, heal: healLadderSectionsUnderSelfAssessment };')(
            state, { hasAssessmentSections: () => true }, null, () => {}, () => {}, () => { saves++; });
        const S = (type, label, inner) => api.sectionHTML(type, label, true, null, inner || '<p>' + label + ' body</p>');
        const sa = S('action', 'Self-Assessment', '<h3>Introduction</h3><p>Hook: 3 / 5</p>');
        const ms = api.buildMarkSchemeSelfAssessSection(null);
        const cal = api.buildCalibrationSection(null);
        const tail = S('feedback', 'Overall Feedback') + api.dividerHTML('RESULTS') + S('scores', 'Score Summary') + S('feedback', 'Analytics') + S('action', 'Action Plan');
        const fb = lit ? ['Introduction (2 / 3)', 'Body 1 (6 / 8)'].map((x) => S('feedback', 'Feedback: ' + x)).join('') : S('feedback', 'Feedback: Q2 (5 / 8)');
        const head = S('response', 'Response') + api.dividerHTML('FEEDBACK');
        const sign = S('signoff', 'Tutor Sign-off');
        let html;
        if (FIX === 'OLD-LANG') html = head + sa + fb + tail + ms + cal + sign;
        else if (FIX === 'TEMPLATE') html = head + ms + cal + sa + fb + tail + sign;
        else if (FIX === 'LIT-NEW') html = head + sa + fb + tail + sign;
        else html = head + sa + ms + cal + fb + tail + sign;
        const editor = new T.Editor({ element: document.getElementById('ed'), extensions: [T.StarterKit, SectionBlock, InputField], content: html });
        api.setEd(editor);
        // Fill two of the student's own rows (a filled row must survive a MOVE).
        const fill = (fid, text) => {
            let at = null;
            editor.state.doc.descendants((n, p) => { if (at === null && n.type.name === 'inputField' && n.attrs.fieldId === fid) at = p; });
            if (at !== null) editor.view.dispatch(editor.state.tr.insertText(text, at + 1));
            return at !== null;
        };
        const filled = FIX === 'LIT-NEW' ? true
            : fill('sa-ms-aqa_lang1_q2_ao2-mark', '5 / 8') && fill('sa-ms-aqa_lang1_q2_ao2-reason', 'my quotes were precise');
        let tx = 0;
        const origDispatch = editor.view.dispatch.bind(editor.view);
        editor.view.dispatch = (t) => { if (t.docChanged) tx++; return origDispatch(t); };
        const labels = () => { const out = []; editor.state.doc.forEach((n) => { if (n.type.name === 'sectionBlock') out.push(n.attrs.label); }); return out; };
        const rowText = (fid) => { let t = null; editor.state.doc.descendants((n) => { if (t === null && n.type.name === 'inputField' && n.attrs.fieldId === fid) t = n.textContent; }); return t; };
        const fids = () => { const out = []; editor.state.doc.descendants((n) => { if (n.type.name === 'inputField' && n.attrs.fieldId) out.push(n.attrs.fieldId); }); return out; };
        const before = labels();
        api.heal();
        const after1 = labels(), tx1 = tx, saves1 = saves;
        api.heal();
        const after2 = labels(), tx2 = tx - tx1;
        return { before, after1, after2, tx1, tx2, saves1, filled, fids: fids(),
            mark: rowText('sa-ms-aqa_lang1_q2_ao2-mark'), reason: rowText('sa-ms-aqa_lang1_q2_ao2-reason') };
    }, { CODE, FIX });

    const iSA = r.after1.indexOf('Self-Assessment'), iMS = r.after1.indexOf('Mark-Scheme Self-Assessment'), iCal = r.after1.indexOf('Calibration');
    ok('Self-Assessment → Mark-Scheme Self-Assessment → Calibration, directly adjacent', iSA !== -1 && iMS === iSA + 1 && iCal === iSA + 2,
        r.after1.join(' › '));
    ok('Tutor Sign-off is still last, nothing else reordered', r.after1[r.after1.length - 1] === 'Tutor Sign-off'
        && r.after1.filter((l) => l !== 'Mark-Scheme Self-Assessment' && l !== 'Calibration').join('|')
           === r.before.filter((l) => l !== 'Mark-Scheme Self-Assessment' && l !== 'Calibration').join('|'));
    ok('no section duplicated', new Set(r.after1).size === r.after1.length);
    ok('a second run changes nothing (idempotent — no transaction)', r.tx2 === 0 && r.after2.join('|') === r.after1.join('|'));
    if (FIX === 'IN-ORDER') ok('already in order → the heal makes NO transaction and no save', r.tx1 === 0 && r.saves1 === 0);
    else ok('the heal changed the document and saved it once', r.tx1 > 0 && r.saves1 === 1, 'tx=' + r.tx1 + ' saves=' + r.saves1);
    if (FIX === 'OLD-LANG' || FIX === 'TEMPLATE') {
        ok('the student\'s filled rows were MOVED with the section, not rebuilt', r.filled && r.mark === '5 / 8' && r.reason === 'my quotes were precise',
            'mark=' + JSON.stringify(r.mark) + ' reason=' + JSON.stringify(r.reason));
    }
    if (FIX === 'LIT-NEW') {
        ok('an existing Literature doc GAINS the Paper 1 AO1–AO3 rows and the AO4 rows',
            ['sa-ms-aqa_lit_p1_ao123-mark', 'sa-ms-aqa_lit_p1_ao123-reason', 'sa-ms-aqa_lit_ao4-mark', 'sa-ms-confidence'].every((f) => r.fids.indexOf(f) !== -1));
        ok('…with a criteria box for AO1–AO3 and NONE for AO4 (one-sentence levels — #691)', r.fids.indexOf('sa-ms-aqa_lit_p1_ao123-met') !== -1 && r.fids.indexOf('sa-ms-aqa_lit_ao4-met') === -1);
        ok('…and ONE whole-essay Calibration group, not one per scheme', r.fids.indexOf('calib-aqa_lit_essay-decision') !== -1
            && r.fids.filter((f) => /^calib-.*-decision$/.test(f)).length === 1);
    }
    await page.close();
}
// ── v7.20.677 (#691) ─────────────────────────────────────────────────────────────────────────────
// OLD-WORDING: a document saved before .677 (old intro, old labels, a Band box per scheme). The heal
// must rewrite exactly the old strings, remove every Band box that is empty or already inside its
// level box, KEEP one a student typed something else into, leave filled rows alone, and be idempotent.
// CONFIDENCE: the reload race MEASURED on staging — two routes each ask, and every new bubble strips
// the older bubbles' buttons. Exactly one ask may remain, last, with its five buttons.
{
    console.log('\n== OLD-WORDING + CONFIDENCE (#691)');
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('  page error:', e.message));
    await page.setContent('<!doctype html><html><body><div id="ed"></div><div id="chat"></div></body></html>');
    await page.addScriptTag({ content: TIPTAP });
    await page.addScriptTag({ content: DATA });
    const r = await page.evaluate(({ CODE }) => {
        const T = window.TipTap;
        const SectionBlock = T.Node.create({
            name: 'sectionBlock', group: 'block', content: 'block+', defining: true,
            addAttributes() { return { sectionType: { default: 'response' }, label: { default: '' } }; },
            parseHTML() { return [{ tag: 'div[data-section-type]', getAttrs: (d) => ({ sectionType: d.getAttribute('data-section-type'), label: d.getAttribute('data-section-label') || '' }) }]; },
            renderHTML({ HTMLAttributes: a }) { return ['div', { 'data-section-type': a.sectionType, 'data-section-label': a.label }, 0]; },
        });
        // The shipped inputField's attrs: fieldId + prompt (data-prompt), same parse rules.
        const InputField = T.Node.create({
            name: 'inputField', group: 'block', content: 'inline*',
            addAttributes() { return { fieldId: { default: null }, prompt: { default: '' } }; },
            parseHTML() { return [{ tag: 'div[data-input-field]', getAttrs: (d) => ({ fieldId: d.getAttribute('data-field-id'), prompt: d.getAttribute('data-prompt') || '' }) }]; },
            renderHTML({ HTMLAttributes: a }) { return ['div', { 'data-input-field': 'true', 'data-field-id': a.fieldId, 'data-prompt': a.prompt }, 0]; },
        });
        const state = { board: 'aqa', subject: 'language', text: 'aqa_lang_paper_1', task: 'assessment', reviewMode: false };
        let saves = 0, rendered = 0;
        const chat = document.getElementById('chat');
        // The chat shell as the real addChatMessage behaves: EVERY new bubble strips all older button rows.
        const shell = { messages: chat, history: [], addMsg: (html) => {
            chat.querySelectorAll('.swml-quick-actions').forEach((q) => q.remove());
            const b = document.createElement('div'); b.className = 'bubble'; b.innerHTML = '<div class="swml-bubble-content">' + html + '</div>'; chat.appendChild(b); return b; } };
        const el = (tag, o) => { const n = document.createElement(tag); if (o && o.className) n.className = o.className; if (o && o.textContent) n.textContent = o.textContent; if (o && o.onClick) n.addEventListener('click', o.onClick); return n; };
        // THE SECTION GUARD (wml-assessment.js onTransaction, v7.13.92) — the same rule, on the same
        // sliced countSections / _migrationActive the shipped heal sets. MEASURED 2026-09-30: without
        // _migrationActive the guard undid the whole heal on a document loaded from localStorage, while
        // this probe (which had no guard) passed. assess-ladder-host-harness pins the shipped guard's shape.
        const GUARD = '\nlet _undoGuardActive = false, _sectionCount = 0, _reverted = 0;\n'
            + 'function guardTx(editor, transaction) {\n'
            + '  if (!transaction.docChanged || _sectionCount <= 0) return;\n'
            + '  if (_migrationActive || _undoGuardActive) { _sectionCount = countSections(editor.state.doc); return; }\n'
            + '  const newCount = countSections(editor.state.doc);\n'
            + '  if (newCount < _sectionCount) { _reverted++; _undoGuardActive = true; editor.commands.undo(); _undoGuardActive = false; _sectionCount = countSections(editor.state.doc); return; }\n'
            + '  _sectionCount = newCount;\n}\n';
        const api = new Function('state', 'WML', '_scoreOverlaysRefresh', '_recomputeAllCompletion', 'saveCanvasContent', '_chatShell', 'formatAI', 'el', '_writeOutlineRowField', 'saveCanvasChat', '_ladderHostRenderCurrent',
            'let canvasEditor = null; let _migrationActive = false;\n' + CODE + GUARD
            + '\nreturn { setEd: (e) => { canvasEditor = e; _sectionCount = countSections(e.state.doc); }, guardTx, reverted: () => _reverted, sectionHTML, inputHTML, heal: healLadderSaWording, ask: _ladderHostAskConfidence, _ladderFids, _ladderSchemeKeysFor, OLD: LADDER_SA_OLD, NEW: LADDER_SA_PROMPTS, INTRO: LADDER_SA_INTRO, buildMarkSchemeSelfAssessSection };')(
            state, { hasAssessmentSections: () => true, recordTurn: () => null }, () => {}, () => {}, () => { saves++; },
            shell, (x) => x, el, () => true, () => {}, () => { rendered++; });

        // Build the pre-.677 section byte-for-byte from the OLD strings. A pre-.677 document never had a
        // point-marked (Q1) box — those arrived at .713 — so the old section is built from the levelled keys only.
        const keys = api._ladderSchemeKeysFor(null).filter((k) => !k.points);
        let inner = '<p><em>' + api.OLD.intro + '</em></p>';
        keys.forEach((k) => {
            const f = api._ladderFids(k.key), b = 'sa-ms-' + k.key + '-band';
            inner += '<h3>' + k.q + ' — ' + k.ao + '</h3>' + api.inputHTML(api.OLD.level, f.level) + api.inputHTML(api.OLD.met, f.met)
                + api.inputHTML(api.OLD.mark, f.mark) + api.inputHTML(api.OLD.reason, f.reason) + api.inputHTML(api.OLD.band, b);
        });
        inner += '<h3>Confidence</h3>' + api.inputHTML('How confident are you in your own marks? (1 = not at all · 5 = very)', 'sa-ms-confidence');
        const html = api.sectionHTML('action', 'Self-Assessment', true, null, '<p>SA</p>') + api.sectionHTML('action', 'Mark-Scheme Self-Assessment', true, null, inner)
            + api.sectionHTML('feedback', 'Feedback: Q2 (5 / 8)', true, null, '<p>fb</p>');
        const editor = new T.Editor({ element: document.getElementById('ed'), extensions: [T.StarterKit, SectionBlock, InputField], content: html,
            onTransaction: ({ editor: e, transaction }) => api.guardTx(e, transaction) });
        api.setEd(editor);
        const fill = (fid, text) => { let at = null; editor.state.doc.descendants((n, p) => { if (at === null && n.type.name === 'inputField' && n.attrs.fieldId === fid) at = p; }); if (at !== null) editor.view.dispatch(editor.state.tr.insertText(text, at + 1)); return at !== null; };
        const filled = fill('sa-ms-aqa_lang1_q5_ao5-level', 'Level 4 · Upper Level 4 · Top of this level') && fill('sa-ms-aqa_lang1_q5_ao5-band', 'Upper Level 4')
            && fill('sa-ms-aqa_lang1_q5_ao5-mark', '24 / 24') && fill('sa-ms-aqa_lang1_q2_ao2-band', 'my own note') && fill('sa-ms-aqa_lang1_q2_ao2-reason', 'precise quotes');
        const rows = () => { const o = {}; editor.state.doc.descendants((n) => { if (n.type.name === 'inputField' && n.attrs.fieldId) o[n.attrs.fieldId] = { t: n.textContent, p: n.attrs.prompt }; }); return o; };
        const paras = () => { const o = []; editor.state.doc.descendants((n) => { if (n.type.name === 'paragraph') o.push(n.textContent); }); return o; };
        let tx = 0; const orig = editor.view.dispatch.bind(editor.view); editor.view.dispatch = (t) => { if (t.docChanged) tx++; return orig(t); };
        api.heal();
        const r1 = rows(), p1 = paras(), tx1 = tx, saves1 = saves;
        api.heal();
        const tx2 = tx - tx1;

        // OLD-LIT (#691, v7.20.679): Neil's own shape — a Macbeth doc saved before .677. AO4's empty
        // criteria box must go (one-sentence levels); AO1–AO3's FILLED one must stay, relabelled.
        state.subject = 'shakespeare'; state.text = 'macbeth';
        const lkeys = api._ladderSchemeKeysFor(null);
        let linner = '<p><em>' + api.OLD.intro + '</em></p>';
        lkeys.forEach((k) => {
            const f = { level: 'sa-ms-' + k.key + '-level', met: 'sa-ms-' + k.key + '-met', mark: 'sa-ms-' + k.key + '-mark', reason: 'sa-ms-' + k.key + '-reason' };
            linner += '<h3>' + k.q + '</h3>' + api.inputHTML(api.OLD.level, f.level) + api.inputHTML(api.OLD.met, f.met)
                + api.inputHTML(api.OLD.mark, f.mark) + api.inputHTML(api.OLD.reason, f.reason) + api.inputHTML(api.OLD.band, 'sa-ms-' + k.key + '-band');
        });
        document.getElementById('ed').innerHTML = '';
        const led = new T.Editor({ element: document.getElementById('ed'), extensions: [T.StarterKit, SectionBlock, InputField],
            content: api.sectionHTML('action', 'Mark-Scheme Self-Assessment', true, null, linner), onTransaction: ({ editor: e, transaction }) => api.guardTx(e, transaction) });
        api.setEd(led);
        const lfill = (fid, text) => { let at = null; led.state.doc.descendants((n, p) => { if (at === null && n.type.name === 'inputField' && n.attrs.fieldId === fid) at = p; }); if (at !== null) led.view.dispatch(led.state.tr.insertText(text, at + 1)); };
        lfill('sa-ms-aqa_lit_p1_ao123-met', '✓ Thoughtful, developed response to task and whole text.');
        lfill('sa-ms-aqa_lit_ao4-level', 'Level 3 — High performance');
        api.heal();
        const lrows = {}; led.state.doc.descendants((n) => { if (n.type.name === 'inputField' && n.attrs.fieldId) lrows[n.attrs.fieldId] = { t: n.textContent, p: n.attrs.prompt }; });
        const litOld = { keys: lkeys.map((k) => k.key), rows: lrows, reverted: api.reverted() };

        // CONFIDENCE — the measured order: wrap bubble, route A asks, route B asks after it.
        shell.addMsg('Your own mark for Essay — AO4: 4 / 4');
        api.ask();
        api.ask();
        const asks = Array.from(chat.children).filter((n) => /One last tap/.test(n.textContent));
        const last = chat.lastElementChild;
        // …and the other order: route A asks BEFORE the wrap is re-served, then route B asks.
        chat.innerHTML = '';
        api.ask();
        shell.addMsg('Your own mark for Essay — AO4: 4 / 4');
        api.ask();
        const asks2 = Array.from(chat.children).filter((n) => /One last tap/.test(n.textContent));
        const last2 = chat.lastElementChild;
        const btns = (n) => (n && n.querySelectorAll('.swml-sa-walk-btn').length) || 0;
        return { r1, p1, tx1, tx2, saves1, filled, reverted: api.reverted(), litOld, keys: keys.map((k) => k.key), NEW: api.NEW, OLD: api.OLD, INTRO: api.INTRO,
            asks: asks.length, lastIsAsk: last === asks[asks.length - 1], lastBtns: btns(last), btnText: last ? Array.from(last.querySelectorAll('.swml-sa-walk-btn')).map((b) => b.textContent) : [],
            asks2: asks2.length, last2IsAsk: last2 === asks2[asks2.length - 1], last2Btns: btns(last2),
            freshHasBand: /-band"/.test(api.buildMarkSchemeSelfAssessSection(null)) };
    }, { CODE });

    const bandLeft = Object.keys(r.r1).filter((f) => /-band$/.test(f));
    ok('the Section Guard did NOT revert the heal (it runs as a migration)', r.reverted === 0, 'reverted=' + r.reverted);
    ok('the Band box already inside its level box is removed ("Upper Level 4")', r.filled && !r.r1['sa-ms-aqa_lang1_q5_ao5-band']);
    ok('every EMPTY Band box is removed', bandLeft.every((f) => r.r1[f].t.trim() !== ''), bandLeft.join(', '));
    ok('a Band box holding something the level box does not is KEPT — nothing typed is ever lost', bandLeft.length === 1 && r.r1['sa-ms-aqa_lang1_q2_ao2-band'] && r.r1['sa-ms-aqa_lang1_q2_ao2-band'].t === 'my own note');
    const kinds = ['level', 'met', 'mark', 'reason'];
    ok('every level / criteria / mark / reason box now carries the new label', r.keys.every((k) => kinds.every((kd) => r.r1['sa-ms-' + k + '-' + kd] && r.r1['sa-ms-' + k + '-' + kd].p === r.NEW[kd])));
    ok('the student\'s filled rows are untouched', r.r1['sa-ms-aqa_lang1_q5_ao5-level'].t === 'Level 4 · Upper Level 4 · Top of this level'
        && r.r1['sa-ms-aqa_lang1_q5_ao5-mark'].t === '24 / 24' && r.r1['sa-ms-aqa_lang1_q2_ao2-reason'].t === 'precise quotes');
    ok('the confidence box is left exactly as it was', r.r1['sa-ms-confidence'] && /^How confident/.test(r.r1['sa-ms-confidence'].p));
    ok('the old intro is replaced by the new one', r.p1.indexOf(r.OLD.intro) === -1 && r.p1.indexOf(r.INTRO) !== -1);
    ok('the heal changed the document and saved it', r.tx1 > 0 && r.saves1 === 1, 'tx=' + r.tx1 + ' saves=' + r.saves1);
    ok('a second run changes nothing (idempotent — no transaction)', r.tx2 === 0);
    ok('a NEW document is built with no Band box at all', r.freshHasBand === false);
    const L = r.litOld.rows;
    ok('OLD-LIT: the old Macbeth doc has both schemes (AO1–AO3 + AO4)', r.litOld.keys.join(',') === 'aqa_lit_p1_ao123,aqa_lit_ao4', r.litOld.keys.join(','));
    ok('OLD-LIT: AO4\'s empty criteria box is removed (its levels are one sentence)', !L['sa-ms-aqa_lit_ao4-met']);
    ok('OLD-LIT: AO1–AO3\'s filled criteria box is KEPT and relabelled', L['sa-ms-aqa_lit_p1_ao123-met'] && /^✓ Thoughtful/.test(L['sa-ms-aqa_lit_p1_ao123-met'].t) && L['sa-ms-aqa_lit_p1_ao123-met'].p === r.NEW.met);
    ok('OLD-LIT: no band boxes left, AO4\'s level untouched, and the guard never reverted', !Object.keys(L).some((f) => /-band$/.test(f)) && L['sa-ms-aqa_lit_ao4-level'].t === 'Level 3 — High performance' && r.litOld.reverted === 0);
    ok('reload race (wrap → ask → ask): ONE confidence ask, last in the chat, with 5 buttons', r.asks === 1 && r.lastIsAsk && r.lastBtns === 5, 'asks=' + r.asks + ' buttons=' + r.lastBtns);
    ok('reload race (ask → wrap → ask): still ONE ask, last, with 5 buttons', r.asks2 === 1 && r.last2IsAsk && r.last2Btns === 5, 'asks=' + r.asks2 + ' buttons=' + r.last2Btns);
    ok('the buttons carry words (#690)', r.btnText.join('|') === '1 — Not at all|2 — Not very|3 — Somewhat|4 — Fairly|5 — Very', r.btnText.join('|'));
    await page.close();
}

// ── P · v7.20.713 — Q1 POINT ROWS (#726) + ONE ID = ONE BOX (#730), in a real TipTap editor under the real guard ──
{
    console.log('\n== P · Q1 point rows + duplicate answer boxes (#726, #730)');
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('  page error:', e.message));
    await page.setContent('<!doctype html><html><body><div id="swml-tiptap-editor"></div><div id="chat"></div></body></html>');
    await page.addScriptTag({ content: TIPTAP });
    await page.addScriptTag({ content: DATA });
    const r = await page.evaluate(({ CODE }) => {
        const T = window.TipTap;
        const SectionBlock = T.Node.create({
            name: 'sectionBlock', group: 'block', content: 'block+', defining: true,
            addAttributes() { return { sectionType: { default: 'response' }, label: { default: '' } }; },
            parseHTML() { return [{ tag: 'div[data-section-type]', getAttrs: (d) => ({ sectionType: d.getAttribute('data-section-type'), label: d.getAttribute('data-section-label') || '' }) }]; },
            renderHTML({ HTMLAttributes: a }) { return ['div', { 'data-section-type': a.sectionType, 'data-section-label': a.label }, 0]; },
        });
        const InputField = T.Node.create({
            name: 'inputField', group: 'block', content: 'inline*',
            addAttributes() { return { fieldId: { default: null }, prompt: { default: '' } }; },
            parseHTML() { return [{ tag: 'div[data-input-field]', getAttrs: (d) => ({ fieldId: d.getAttribute('data-field-id'), prompt: d.getAttribute('data-prompt') || '' }) }]; },
            renderHTML({ HTMLAttributes: a }) { return ['div', { 'data-input-field': 'true', 'data-field-id': a.fieldId, 'data-prompt': a.prompt }, 0]; },
        });
        const state = { board: 'aqa', subject: 'language', text: 'aqa_lang_paper_1', task: 'assessment', reviewMode: false };
        let saves = 0, rendered = 0, edRef = null;
        const chat = document.getElementById('chat');
        const shell = { messages: chat, history: [], addMsg: (html) => {
            chat.querySelectorAll('.swml-quick-actions').forEach((q) => q.remove());
            const b = document.createElement('div'); b.className = 'bubble'; b.innerHTML = '<div class="swml-bubble-content">' + html + '</div>'; chat.appendChild(b); return b; } };
        const el = (tag, o) => { const n = document.createElement(tag); if (o && o.className) n.className = o.className; if (o && o.textContent) n.textContent = o.textContent; if (o && o.onClick) n.addEventListener('click', o.onClick); return n; };
        // The shipped write: replace the box's text through a transaction (true = written).
        const write = (fid, text) => { let at = null, node = null; edRef.state.doc.descendants((n, p) => { if (at === null && n.type.name === 'inputField' && n.attrs.fieldId === fid) { at = p; node = n; } });
            if (at === null) return false; edRef.view.dispatch(edRef.state.tr.insertText(text, at + 1, at + node.nodeSize - 1)); return true; };
        const GUARD = '\nlet _undoGuardActive = false, _sectionCount = 0, _reverted = 0;\n'
            + 'function guardTx(editor, transaction) {\n'
            + '  if (!transaction.docChanged || _sectionCount <= 0) return;\n'
            + '  if (_migrationActive || _undoGuardActive) { _sectionCount = countSections(editor.state.doc); return; }\n'
            + '  const newCount = countSections(editor.state.doc);\n'
            + '  if (newCount < _sectionCount) { _reverted++; _undoGuardActive = true; editor.commands.undo(); _undoGuardActive = false; _sectionCount = countSections(editor.state.doc); return; }\n'
            + '  _sectionCount = newCount;\n}\n';
        const api = new Function('state', 'WML', '_scoreOverlaysRefresh', '_recomputeAllCompletion', 'saveCanvasContent', '_chatShell', 'formatAI', 'el', '_writeOutlineRowField', 'saveCanvasChat', '_ladderHostRenderCurrent',
            'let canvasEditor = null; let _migrationActive = false;\n' + CODE + GUARD
            + '\nreturn { setEd: (e) => { canvasEditor = e; _sectionCount = countSections(e.state.doc); }, guardTx, reverted: () => _reverted, sectionHTML, inputHTML, _ladderSchemeKeysFor, _ladderFids, _ladderGroupHTML,'
            + ' healPoints: healLadderPointRows, ask: _ladderHostAskPoints, groups: _ladderHostGroups, healDup: healDuplicateInputFields, runs: _dupFieldRuns };')(
            // recordTurn as shipped (wml-core.js:4271): a durable turn is stored, a durable:false one is not.
            state, { hasAssessmentSections: () => true, recordTurn: (h, e, o) => { if (o && o.durable) { h.push(e); return e; } return null; } }, () => {}, () => {}, () => { saves++; },
            shell, (x) => x, el, (fid, text) => write(fid, text), () => {}, () => { rendered++; });
        const mount = (html) => { if (edRef) edRef.destroy(); edRef = new T.Editor({ element: document.getElementById('swml-tiptap-editor'), extensions: [T.StarterKit, SectionBlock, InputField], content: html,
            onTransaction: ({ editor: e, transaction }) => api.guardTx(e, transaction) }); api.setEd(edRef); return edRef; };
        const rows = () => { const o = {}; edRef.state.doc.descendants((n) => { if (n.type.name === 'inputField' && n.attrs.fieldId) o[n.attrs.fieldId] = (o[n.attrs.fieldId] || []).concat([n.textContent]); }); return o; };
        const firstHeadingInSa = () => { let h = null; edRef.state.doc.descendants((n) => { if (n.type.name === 'sectionBlock') { if (n.attrs.label === 'Mark-Scheme Self-Assessment') n.forEach((c) => { if (!h && c.type.name === 'heading') h = c.textContent; }); return false; } return true; }); return h; };
        let tx = 0; const countTx = () => { tx = 0; const h = () => { tx++; }; edRef.on('transaction', h); return () => edRef.off('transaction', h); };

        // A pre-.713 Mark-Scheme section: the levelled keys only, confidence empty (the walk not finished).
        const levelled = api._ladderSchemeKeysFor(null).filter((k) => !k.points);
        const preSection = (conf) => api.sectionHTML('action', 'Self-Assessment', true, null, '<p>SA</p>')
            + api.sectionHTML('action', 'Mark-Scheme Self-Assessment', true, null, '<p><em>intro</em></p>' + levelled.map(api._ladderGroupHTML).join('')
                + '<h3>Confidence</h3>' + api.inputHTML('How confident are you in your own marks? (1 = not at all · 5 = very)', 'sa-ms-confidence'))
            + api.sectionHTML('feedback', 'Feedback: Q1 (— / 4)', true, null, '<p>fb</p>');
        const out = {};
        mount(preSection());
        let stop = countTx(); saves = 0;
        api.healPoints();
        stop();
        out.a1 = { q1: rows()['sa-ms-aqa_lang1_q1_ao1-mark'] || null, first: firstHeadingInSa(), tx: tx, saves: saves, reverted: api.reverted() };
        stop = countTx(); api.healPoints(); stop(); out.a2 = { tx: tx, q1Count: (rows()['sa-ms-aqa_lang1_q1_ao1-mark'] || []).length };
        out.a3 = { order: api.groups().map((g) => g.q + (g.done ? '✓' : '·')).join(' ') };
        // B — the one-tap ask files "3 / 4" into the Q1 box.
        api.ask(api.groups()[0]);
        const btns = Array.from(chat.querySelectorAll('.swml-sa-walk-btn'));
        out.b1 = { text: btns.map((b) => b.textContent).join('|'), askLast: chat.lastElementChild && /How many of your answers are correct\?/.test(chat.lastElementChild.textContent) };
        const three = btns.find((b) => b.textContent === '3 / 4'); if (three) three.click();
        out.b2 = { q1: rows()['sa-ms-aqa_lang1_q1_ao1-mark'], said: shell.history.filter((m) => m.role === 'user').map((m) => m.content), rendered: rendered, done: api.groups()[0].done };
        // A finished walk (confidence filed) is never given a Q1 box.
        mount(preSection());
        write('sa-ms-confidence', '4 / 5');
        stop = countTx(); api.healPoints(); stop();
        out.a4 = { q1: rows()['sa-ms-aqa_lang1_q1_ao1-mark'] || null, tx: tx, exempt: api.groups()[0].done };

        // C — Mishel's measured shape: the answer, then four empty copies sharing its id; Q3 clean.
        const resp = (label, fields) => api.sectionHTML('response', label, true, null, fields.map(([id, t]) => '<div data-input-field="true" data-field-id="' + id + '" data-prompt="Write your response here.">' + (t || '') + '</div>').join(''));
        mount(resp('Q2 Response', [['Q2-response', 'The storm is a warning sign.<br><br>'], ['Q2-response'], ['Q2-response'], ['Q2-response'], ['Q2-response']])
            + resp('Q3 Response', [['Q3-response', 'Structure answer.']]));
        out.c0 = { runs: api.runs(edRef.state.doc).map((x) => x.id + '×' + x.nodes.length) };
        saves = 0; stop = countTx(); api.healDup(); stop();
        out.c1 = { q2: rows()['Q2-response'], q3: rows()['Q3-response'], tx: tx, saves: saves, reverted: api.reverted(), left: api.runs(edRef.state.doc).length };
        stop = countTx(); api.healDup(); stop(); out.c2 = { tx: tx };
        // A split that carried text keeps every word.
        mount(resp('Q2 Response', [['Q2-response', 'First paragraph.'], ['Q2-response', 'Second paragraph.']]));
        api.healDup();
        let joined = null; edRef.state.doc.descendants((n) => { if (n.type.name === 'inputField' && n.attrs.fieldId === 'Q2-response') joined = { text: n.textContent, brs: (() => { let c = 0; n.forEach((x) => { if (x.type.name === 'hardBreak') c++; }); return c; })() }; });
        out.c3 = { joined: joined, count: (rows()['Q2-response'] || []).length };
        return out;
    }, { CODE });
    ok('A1: an unfinished pre-.713 walk gets ONE Q1 box', r.a1.q1 && r.a1.q1.length === 1, JSON.stringify(r.a1.q1));
    ok('A1: the Q1 box comes first — before Q2\'s heading', r.a1.first === 'Q1 — AO1 (/4)', r.a1.first);
    ok('A1: one heal transaction, saved once, the Section Guard never reverted it', r.a1.tx >= 1 && r.a1.saves === 1 && r.a1.reverted === 0, JSON.stringify(r.a1));
    ok('A2: a second run changes nothing (idempotent)', r.a2.tx === 0 && r.a2.q1Count === 1, JSON.stringify(r.a2));
    ok('A3: the walk asks Q1 first, then the levelled questions', /^Q1· Q2· Q3· Q4· Q5· Q5·$/.test(r.a3.order), r.a3.order);
    ok('B1: the ask ends on its question with one button per possible mark (0–4)', r.b1.askLast && r.b1.text === '0 / 4|1 / 4|2 / 4|3 / 4|4 / 4', JSON.stringify(r.b1));
    ok('B2: the tap files "3 / 4", records the pick as a real turn, and moves the walk on', r.b2.q1 && r.b2.q1[0] === '3 / 4' && r.b2.said.indexOf('Q1: 3 / 4') !== -1 && r.b2.done && r.b2.rendered >= 1, JSON.stringify(r.b2));
    ok('A4: a FINISHED walk (confidence filed) gets no Q1 box and is not pulled back', !r.a4.q1 && r.a4.tx === 0 && r.a4.exempt === true, JSON.stringify(r.a4));
    ok('C0: the measured shape is found — Q2-response ×5', r.c0.runs.join() === 'Q2-response×5', r.c0.runs.join());
    ok('C1: one Q2 box after the heal, her answer intact; Q3 untouched', r.c1.q2 && r.c1.q2.length === 1 && r.c1.q2[0] === 'The storm is a warning sign.' && r.c1.q3.length === 1 && r.c1.left === 0, JSON.stringify(r.c1));
    ok('C1: the merge is a migration — saved once, never reverted by the Section Guard', r.c1.saves === 1 && r.c1.reverted === 0 && r.c1.tx >= 1, JSON.stringify(r.c1));
    ok('C2: a second run changes nothing (idempotent)', r.c2.tx === 0);
    ok('C3: a copy holding text is joined back with a blank line — no word lost', r.c3.count === 1 && r.c3.joined && r.c3.joined.text === 'First paragraph.Second paragraph.' && r.c3.joined.brs === 2, JSON.stringify(r.c3));
    await page.close();
}
await browser.close();
console.log('\n' + (failed ? '❌ ladder-sections-heal-probe FAILED (' + failed + ')' : '✅ ladder-sections-heal-probe passed'));
process.exit(failed ? 1 : 0);
