#!/usr/bin/env node
/**
 * v7.20.671 — DRIVES the AQA Language Paper 2 planning heals on a COPIED-FORWARD document, using the
 * SHIPPED functions sliced out of wml-assessment.js (no reimplementation). FIXLIST #681 (D1, D2).
 *
 * Why this exists: every other planning gate (keymatch, fan-out, ladder) builds a BRAND-NEW redraft
 * document. Real planning docs are not new — they are copied forward from the diagnostic and then
 * healed on load. Two defects lived only on that path and no gate could see them:
 *   D1  the Q5 (IUMVCC) OUTLINE rows were never added → every Q5 filing dropped, and the ladder
 *       skipped Q5 and called the plan done (0 of 3 P2 planning docs on prod had them);
 *   D2  legacy plan-Q4-para-* boxes holding first-attempt notes blocked the comparative reshape →
 *       every Q4 approval dropped (Anam 1298).
 *
 * Two starting documents, both built with the shipped builders:
 *   A  today's DIAGNOSTIC doc (one "Plan — Qn" box per question, notes in some);
 *   B  the June-era doc Anam actually has (Q2/Q3 paragraph boxes, FOUR legacy Q4 boxes full of
 *      notes, the six IUMVCC plan boxes, NO outline rows).
 * The heals run in their migrate-chain order, then it asserts:
 *   1. B: before the heals, protocol ids are MISSING (the gate bites);
 *   2. EVERY id the P2 planning protocol files (@FIELD_COMMIT / @FIELD_SET) exists afterwards;
 *   3. no id is duplicated;
 *   4. B: all four legacy Q4 notes survive, in order, in plan-Q4-intro (Neil's #571 ruling);
 *   5. a second run changes nothing (idempotent).
 *
 * Needs a browser: `playwright-core` from ~/.sophicly/probe. Run it whenever a P2 plan/outline
 * builder or one of these heals changes:   node bin/p2-planning-heal-probe.mjs
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = fs.readFileSync(process.env.WML_SRC || path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');   // WML_SRC: prove the gate on a mutant
const require = createRequire(path.join(os.homedir(), '.sophicly/probe/package.json'));
const { chromium } = require('playwright-core');

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
    const after = SRC.slice(i + name.length + 3).trimStart()[0];
    if (after === '{' || after === '[') return SRC.slice(start, sliceBalanced(i, after, after === '{' ? '}' : ']') + 1) + ';';
    return SRC.slice(start, SRC.indexOf(';\n', i) + 1);
}

const specs = JSON.parse(fs.readFileSync(path.join(ROOT, 'protocols/shared/language-paper-specs.json'), 'utf8'));
const qs = specs.aqa.language_p2.sections.flatMap(s => s.questions || []);
const PROTO_DIR = path.join(ROOT, 'protocols/aqa/language2/planning');
const protoText = fs.readdirSync(PROTO_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => fs.readFileSync(path.join(PROTO_DIR, f), 'utf8')).join('\n');
// Concrete ids only — "<id>" and "…" are template placeholders in the protocol's prose.
const filed = [...new Set([...protoText.matchAll(/@FIELD_(?:COMMIT|SET)\{"field":"([A-Za-z0-9-]+)"/g)].map(m => m[1]))];
const Q4_NOTES = ['Munby sees the sea as a spectacle', 'Dickinson feels threatened by it', 'both use weather imagery', 'A admires, B fears'];

const browser = await chromium.launch();
let failed = 0;
const ok = (label, pass, extra) => { console.log((pass ? '  ✓ ' : '  ✗ ') + label + (extra ? '  — ' + extra : '')); if (!pass) failed++; };

// WML_DOC=<file>: also run the heals on a REAL saved document (its `html`), e.g. one pulled read-only
// from prod into a scratch folder. Never commit such a file — it is a student's work.
const REAL_HTML = process.env.WML_DOC ? fs.readFileSync(process.env.WML_DOC, 'utf8') : null;
for (const FIX of REAL_HTML ? ['A', 'B', 'REAL'] : ['A', 'B']) {
    console.log('\n== ' + (FIX === 'A' ? 'A · today\'s diagnostic doc, copied forward'
        : FIX === 'B' ? 'B · the June-era doc (Anam 1298\'s shape)' : 'REAL · ' + path.basename(process.env.WML_DOC)));
    const names = ['escapeHTML', 'sectionHTML', 'inputHTML', 'dividerHTML', 'outlineRowHTML', 'SWML_PERSUASIVE_RE',
        '_redraftPlanSectionsHTML', '_upgradeDiagnosticPlanAreas', 'buildIUMVCCPlanSection', 'buildComparativePlanSection',
        '_swapLegacyQ4Plan', 'migrateMissingQOutlines'];
    let result = null;
    for (let guard = 0; guard < 60; guard++) {
        const code = names.map(n => { const s = sliceName(n); if (!s) throw new Error('cannot slice ' + n); return s; }).join('\n');
        const page = await browser.newPage();
        result = await page.evaluate(({ code, qs, FIX, Q4_NOTES, REAL_HTML }) => {
            try {
                const state = { subject: 'language2', board: 'aqa', phase: 'redraft', draftType: 'redraft', task: 'planning' };
                const lookupQuestionSpec = id => qs.find(q => q.id === id) || null;
                const _isLangPaper2 = () => true;
                const root = document.createElement('div');
                const canvasEditor = { getHTML: () => root.innerHTML, commands: { setContent: h => { root.innerHTML = h; } } };
                const api = new Function('state', 'lookupQuestionSpec', '_isLangPaper2', 'canvasEditor',
                    'var _migrationActive = false;\n' + code
                    + '\nreturn { sectionHTML, inputHTML, dividerHTML, buildIUMVCCPlanSection, _upgradeDiagnosticPlanAreas, _swapLegacyQ4Plan, migrateMissingQOutlines };')
                    (state, lookupQuestionSpec, _isLangPaper2, canvasEditor);
                let html = '';
                qs.forEach(q => {
                    html += api.sectionHTML('question', q.id, false, null, '<p>' + q.description + '</p><p><em>[' + q.marks + ' marks]</em></p>');
                    if (q.type === 'multiple_choice' || q.type === 'retrieval' || q.marks < 5) return;
                    html += api.dividerHTML('PLAN — ' + q.id);
                    if (FIX === 'A') {
                        html += api.sectionHTML('plan', 'Plan — ' + q.id, true, null,
                            api.inputHTML('Plan only — notes and quotes. Write your answer in the Response box below.', 'plan-' + q.id + '-para-1'));
                    } else if (q.id === 'Q5') {
                        html += api.buildIUMVCCPlanSection(q.id);
                    } else {
                        const n = q.id === 'Q2' ? 2 : q.id === 'Q3' ? 3 : 4;
                        for (let i = 1; i <= n; i++) html += api.sectionHTML('plan', 'Plan: Paragraph ' + i + ' — ' + q.id, true, null,
                            api.inputHTML('Key points for paragraph ' + i, 'plan-' + q.id + '-para-' + i));
                    }
                });
                root.innerHTML = FIX === 'REAL' ? REAL_HTML : html;
                if (FIX === 'B') Q4_NOTES.forEach((t, i) => { root.querySelector('[data-field-id="plan-Q4-para-' + (i + 1) + '"]').textContent = t; });
                else if (FIX === 'A') root.querySelector('[data-field-id="plan-Q4-para-1"]').textContent = Q4_NOTES[0];
                const ids = () => Array.from(root.querySelectorAll('[data-field-id]')).map(n => n.getAttribute('data-field-id'));
                const before = ids();
                // The Q4 notes this doc really holds (REAL), and every non-empty field's text — none may be lost.
                const legacyQ4 = Array.from(root.querySelectorAll('[data-field-id^="plan-Q4-para-"]')).map(n => (n.textContent || '').trim()).filter(Boolean);
                const allText = Array.from(root.querySelectorAll('[data-field-id]')).map(n => (n.textContent || '').trim()).filter(Boolean);
                // Migrate-chain order: scaffold heal → P2 Q4 reshape → multi-question outline heal.
                const run = () => { api._upgradeDiagnosticPlanAreas(root); api._swapLegacyQ4Plan(root); api.migrateMissingQOutlines(); };
                run();
                const after = ids();
                const intro = root.querySelector('[data-field-id="plan-Q4-intro"]');
                const introText = intro ? intro.textContent : null;
                const docText = root.textContent || '';
                const lost = allText.filter(t => docText.indexOf(t) === -1);
                run();
                return { before, after, after2: ids(), introText, legacyQ4, lost };
            } catch (e) { return { error: String(e && e.message || e) }; }
        }, { code, qs, FIX, Q4_NOTES, REAL_HTML });
        await page.close();
        if (!result.error) break;
        const m = /^(\w+) is not defined$/.exec(result.error);
        if (!m || names.includes(m[1])) { console.log('  ✗ could not run the shipped code: ' + result.error); failed++; result = null; break; }
        names.unshift(m[1]);
    }
    if (!result) continue;

    const missingBefore = filed.filter(id => !result.before.includes(id));
    const missingAfter = filed.filter(id => !result.after.includes(id));
    if (FIX === 'B') ok('the gate bites — before the heals, the protocol files into boxes that do not exist', missingBefore.length > 0,
        missingBefore.length + ' of ' + filed.length + ' missing, incl. ' + missingBefore.filter(id => /iumvcc|Q4-intro/.test(id)).slice(0, 3).join(', '));
    ok('after the heals, EVERY id the P2 planning protocol files exists in the document', missingAfter.length === 0,
        missingAfter.length ? 'still missing: ' + missingAfter.join(', ') : filed.length + ' ids');
    ok('no id is duplicated', new Set(result.after).size === result.after.length,
        result.after.filter((id, i) => result.after.indexOf(id) !== i).slice(0, 5).join(', '));
    ok('no student text was lost — every non-empty box\'s words are still in the document', result.lost.length === 0,
        result.lost.length ? result.lost.length + ' lost, e.g. ' + JSON.stringify(result.lost[0].slice(0, 60)) : '');
    const want = FIX === 'B' ? Q4_NOTES : FIX === 'A' ? [Q4_NOTES[0]] : result.legacyQ4;
    const pos = want.map(t => (result.introText || '').indexOf(t));
    ok('first-attempt Q4 notes survive, in order, in plan-Q4-intro (#571)', pos.every(p => p !== -1) && pos.every((p, i) => !i || p > pos[i - 1]),
        JSON.stringify((result.introText || '').slice(0, 90)));
    ok('idempotent — a second run changes nothing', JSON.stringify(result.after) === JSON.stringify(result.after2));
}
await browser.close();
console.log('\n' + (failed ? '❌ p2-planning-heal-probe FAILED (' + failed + ')' : '✅ p2-planning-heal-probe passed'));
process.exit(failed ? 1 : 0);
