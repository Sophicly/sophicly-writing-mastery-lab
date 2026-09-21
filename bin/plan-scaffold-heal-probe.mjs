#!/usr/bin/env node
/**
 * v7.20.629 — DRIVES the diagnostic→redraft plan-scaffold heal in a REAL browser DOM, using the
 * SHIPPED functions sliced out of wml-assessment.js (no reimplementation). FIXLIST #569/#570.
 *
 * It builds the document a redraft planning lesson really receives — question sections plus the
 * DIAGNOSTIC's one `Plan — Qn` box each, some holding first-attempt notes — runs the shipped
 * _upgradeDiagnosticPlanAreas on it, and asserts:
 *   1. BEFORE the heal, plan ids the planning protocol files into are MISSING (the gate bites —
 *      this is prod student 857's document on 2026-09-21);
 *   2. AFTER it, EVERY `@FIELD_SET` plan id in the paper's planning protocol exists in the doc;
 *   3. first-attempt notes survive, in the FIRST box of the new scaffold (Neil's ruling);
 *   4. no `Plan — Qn` area remains, and a second run changes nothing (idempotent).
 *
 * Needs a browser: `playwright-core` from ~/.sophicly/probe (the artifact-layout-gate's install).
 * Not wired into pre-ship for that reason — run it whenever a plan builder or this heal changes:
 *   node bin/plan-scaffold-heal-probe.mjs
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');
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
const PAPERS = [
    { name: 'AQA Language Paper 1', subject: 'language1', specKey: 'language_p1', isP2: false, protocolDir: 'protocols/aqa/language1/planning',
      notes: { Q2: '"being adrift in a boat" - shows how he has lost his bearings', Q4: 'He missed her easy laughter' } },
    { name: 'AQA Language Paper 2', subject: 'language2', specKey: 'language_p2', isP2: true, protocolDir: 'protocols/aqa/language2/planning',
      notes: { Q2: 'Source A calm, Source B frantic', Q4: 'both writers admire the sea' } },
];

const browser = await chromium.launch();
let failed = 0;
const ok = (label, pass, extra) => { console.log((pass ? '  ✓ ' : '  ✗ ') + label + (extra ? '  — ' + extra : '')); if (!pass) failed++; };

for (const P of PAPERS) {
    console.log('\n== ' + P.name);
    const qs = specs.aqa[P.specKey].sections.flatMap(s => s.questions || []);
    const protoText = fs.readdirSync(path.join(ROOT, P.protocolDir)).filter(f => f.endsWith('.md') && !f.startsWith('_'))
        .map(f => fs.readFileSync(path.join(ROOT, P.protocolDir, f), 'utf8')).join('\n');
    const filed = [...new Set([...protoText.matchAll(/@FIELD_SET\{"field":"(plan-[A-Za-z0-9-]+)"/g)].map(m => m[1]))];

    // Grow the sliced set until the shipped code runs: every ReferenceError names the next dependency.
    const names = ['escapeHTML', 'sectionHTML', 'inputHTML', 'dividerHTML', 'SWML_PERSUASIVE_RE', '_redraftPlanSectionsHTML', '_upgradeDiagnosticPlanAreas'];
    let result = null;
    for (let guard = 0; guard < 40; guard++) {
        const code = names.map(n => { const s = sliceName(n); if (!s) throw new Error('cannot slice ' + n); return s; }).join('\n');
        const page = await browser.newPage();
        result = await page.evaluate(({ code, qs, P }) => {
            try {
                const state = { subject: P.subject, board: 'aqa', phase: 'redraft', task: 'planning' };
                const lookupQuestionSpec = id => qs.find(q => q.id === id) || null;
                const _isLangPaper2 = () => P.isP2;
                const api = new Function('state', 'lookupQuestionSpec', '_isLangPaper2',
                    code + '\nreturn { sectionHTML, inputHTML, dividerHTML, _upgradeDiagnosticPlanAreas };')(state, lookupQuestionSpec, _isLangPaper2);
                // The doc a redraft planning lesson REALLY receives: the diagnostic's one box per question.
                let html = '';
                qs.forEach(q => {
                    html += api.sectionHTML('question', q.id, false, null, '<p>' + q.description + '</p><p><em>[' + q.marks + ' marks]</em></p>');
                    if (q.type === 'multiple_choice' || q.type === 'retrieval' || q.marks < 5) return;
                    html += api.dividerHTML('PLAN — ' + q.id);
                    html += api.sectionHTML('plan', 'Plan — ' + q.id, true, null,
                        api.inputHTML('Plan only — notes and quotes. Write your answer in the Response box below.', 'plan-' + q.id + '-para-1'));
                });
                const root = document.createElement('div'); root.innerHTML = html;
                Object.keys(P.notes).forEach(qid => { const f = root.querySelector('[data-field-id="plan-' + qid + '-para-1"]'); if (f) f.textContent = P.notes[qid]; });
                const ids = () => Array.from(root.querySelectorAll('[data-field-id^="plan-"]')).map(n => n.getAttribute('data-field-id'));
                const before = ids();
                const healed1 = api._upgradeDiagnosticPlanAreas(root);
                const after = ids();
                const healed2 = api._upgradeDiagnosticPlanAreas(root);
                const labels = Array.from(root.querySelectorAll('[data-section-type="plan"]')).map(n => n.getAttribute('data-section-label'));
                const notesAt = {};
                Object.keys(P.notes).forEach(qid => {
                    const hit = Array.from(root.querySelectorAll('[data-field-id^="plan-"]')).find(n => (n.textContent || '').indexOf(P.notes[qid]) !== -1);
                    notesAt[qid] = hit ? hit.getAttribute('data-field-id') : null;
                });
                return { before, after, after2: ids(), healed1, healed2, labels, notesAt };
            } catch (e) { return { error: String(e && e.message || e) }; }
        }, { code, qs, P });
        await page.close();
        if (!result.error) break;
        const m = /^(\w+) is not defined$/.exec(result.error);
        if (!m || names.includes(m[1])) { console.log('  ✗ could not run the shipped code: ' + result.error); failed++; result = null; break; }
        names.unshift(m[1]);
    }
    if (!result) continue;

    const missingBefore = filed.filter(id => !result.before.includes(id));
    const missingAfter = filed.filter(id => !result.after.includes(id));
    ok('the gate bites — before the heal, the protocol files into boxes that do not exist', missingBefore.length > 0, missingBefore.length + ' of ' + filed.length + ' missing, e.g. ' + missingBefore.slice(0, 3).join(', '));
    ok('after the heal, EVERY plan id the protocol files exists in the document', missingAfter.length === 0, missingAfter.length ? 'still missing: ' + missingAfter.join(', ') : filed.length + ' ids · doc now has ' + result.after.length + ' plan boxes');
    ok('no box was duplicated', new Set(result.after).size === result.after.length);
    Object.keys(P.notes).forEach(qid => ok(qid + ' first-attempt notes survive, in the first box of the new scaffold', !!result.notesAt[qid], String(result.notesAt[qid])));
    ok('no diagnostic "Plan — Qn" area remains', !result.labels.some(l => /^Plan — Q\d+$/.test(l || '')));
    ok('idempotent — a second run upgrades nothing and changes nothing', result.healed2 === 0 && JSON.stringify(result.after) === JSON.stringify(result.after2), 'first run upgraded ' + result.healed1 + ' question(s)');
}
await browser.close();
console.log('\n' + (failed ? '❌ plan-scaffold-heal-probe FAILED (' + failed + ')' : '✅ plan-scaffold-heal-probe passed'));
process.exit(failed ? 1 : 0);
