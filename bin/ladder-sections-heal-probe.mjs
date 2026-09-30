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
    '_isLitEssay', '_ladderSchemeKeysFor', '_ladderFids', 'buildMarkSchemeSelfAssessSection', '_calibFids', '_ladderIsLit',
    'buildCalibrationSection', 'healLadderSectionsUnderSelfAssessment'];
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
        ok('…and ONE whole-essay Calibration group, not one per scheme', r.fids.indexOf('calib-aqa_lit_essay-decision') !== -1
            && r.fids.filter((f) => /^calib-.*-decision$/.test(f)).length === 1);
    }
    await page.close();
}
await browser.close();
console.log('\n' + (failed ? '❌ ladder-sections-heal-probe FAILED (' + failed + ')' : '✅ ladder-sections-heal-probe passed'));
process.exit(failed ? 1 : 0);
