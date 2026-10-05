#!/usr/bin/env node
/* eslint-env node */
// v7.20.702 (#722 B2 step 1.5) — PRE-CHAIN GOAL GATE. The assessment's headline-goal question (step 2b) is asked by
// CODE, from a list in wml-assessment.js, while the protocol carries the same list for the model to read back. The
// two were "byte-matched" by a comment. Edexcel IGCSE P1 had no list of its own at all, so its students were offered
// AQA Paper 1's options — creative writing (AO5) and technical accuracy (AO6) on a paper with no creative writing and
// no AO6. This gate makes the comment true:
//   (1) every PRECHAIN_GOAL_OPTIONS_* list is identical in BOTH chat pipelines (the twin rule);
//   (2) each paper's list equals its protocol's step 2b options (bold and quote style aside), and the protocol's
//       "Something else" carries the letter after the last option — the letter the code derives.
// A protocol that has no step 2b yet (a paper mid-port) is PENDING and printed, never silently passed.
//
//   node bin/prechain-goal-gate.js        (wired into bin/pre-ship-check.sh)
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

const PAPERS = [
    ['PRECHAIN_GOAL_OPTIONS_LANG', 'protocols/aqa/language1/modules/protocol-a-assessment.md'],
    ['PRECHAIN_GOAL_OPTIONS_LANG_P2', 'protocols/aqa/language2/modules/protocol-a-assessment.md'],
    ['PRECHAIN_GOAL_OPTIONS_IGCSE_LANG_P1', 'protocols/edexcel-igcse/language1/modules/protocol-a-assessment.md'],
    ['PRECHAIN_GOAL_OPTIONS_IGCSE_LANG_P2', 'protocols/edexcel-igcse/language2/modules/assessment-section-a.md'],
];
const norm = t => String(t).replace(/\*\*/g, '').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();

let failed = 0, pending = 0;
const fail = m => { failed++; console.log('  ❌ ' + m); };

for (const [name, protoRel] of PAPERS) {
    // every copy of the list in the file (one per chat pipeline)
    const copies = [...src.matchAll(new RegExp('const ' + name + ' = \\[([\\s\\S]*?)\\];', 'g'))]
        .map(m => [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1]));
    if (copies.length !== 2) { fail(`${name}: ${copies.length} cop(ies) in wml-assessment.js — the two chat pipelines must each carry one`); continue; }
    if (JSON.stringify(copies[0]) !== JSON.stringify(copies[1])) { fail(`${name}: the two pipelines' copies differ`); continue; }
    const code = copies[0].map(norm);

    const proto = fs.readFileSync(path.join(ROOT, protoRel), 'utf8');
    const at = proto.search(/2b\.\s*(\*\*)?Headline goal/);
    if (at < 0) { pending++; console.log(`  · ${name}: PENDING — ${protoRel} has no step 2b yet (paper mid-port); its list is unchecked`); continue; }
    const opts = [];
    for (const line of proto.slice(at).split('\n').slice(1, 14)) {
        const m = /^\s*([A-Z])\)\s+(.+?)\s*$/.exec(line);
        if (m) opts.push([m[1], norm(m[2])]); else if (opts.length) break;
    }
    const other = opts.findIndex(o => /^Something else/i.test(o[1]));
    const listed = (other < 0 ? opts : opts.slice(0, other)).map(o => `${o[0]}) ${o[1]}`);
    if (JSON.stringify(listed) !== JSON.stringify(code)) {
        fail(`${name} ≠ ${protoRel} step 2b\n       code:     ${code.join(' | ')}\n       protocol: ${listed.join(' | ')}`);
        continue;
    }
    const want = String.fromCharCode(65 + code.length);
    if (other < 0) fail(`${protoRel} step 2b has no "Something else" option`);
    else if (opts[other][0] !== want) fail(`${protoRel} step 2b labels "Something else" ${opts[other][0]}) — the code shows ${want})`);
    else console.log(`  ✓ ${name} = ${path.dirname(path.dirname(protoRel)).replace(/^protocols\//, '')} step 2b (${code.length} options + ${want}) Something else)`);
}

// ── v7.20.702 (#619): the keyword-recall rotation ── the questions it rotates over are each paper's
// (language-paper-specs.json recall_rotation); the JS (_recallTargetQ) and the router twin share one default.
{
    const specs = JSON.parse(fs.readFileSync(path.join(ROOT, 'protocols', 'shared', 'language-paper-specs.json'), 'utf8'));
    let n = 0;
    for (const [board, papers] of Object.entries(specs)) {
        if (board.startsWith('_') || !papers || typeof papers !== 'object') continue;
        for (const [paper, p] of Object.entries(papers)) {
            if (!p || !p.recall_rotation) continue;
            n++;
            const ids = (p.sections || []).flatMap(x => (x.questions || []).map(q => q.id));
            const bad = p.recall_rotation.filter(q => !ids.includes(q));
            if (!Array.isArray(p.recall_rotation) || !p.recall_rotation.length) fail(`${board}/${paper}: recall_rotation is empty`);
            else if (bad.length) fail(`${board}/${paper}: recall_rotation names ${bad.join(', ')} — not a question on this paper`);
        }
    }
    const jsDef = (/const RECALL_ROTATION_DEFAULT = (\[[^\]]*\])/.exec(src) || [])[1];
    const router = fs.readFileSync(path.join(ROOT, 'includes', 'class-protocol-router.php'), 'utf8');
    const phpDef = (/\$recall_rotation = (\[[^\]]*\]);\s*\/\/ RECALL_ROTATION_DEFAULT/.exec(router) || [])[1];
    const list = t => (t || '').replace(/\s/g, '').replace(/"/g, "'");
    if (!jsDef || !phpDef) fail('recall rotation default not found in ' + (!jsDef ? 'wml-assessment.js' : 'class-protocol-router.php'));
    else if (list(jsDef) !== list(phpDef)) fail(`recall rotation defaults differ — JS ${jsDef} vs router ${phpDef}`);
    if (/\[\s*'Q4',\s*'Q2',\s*'Q3',\s*'Q5'\s*\]\s*\[/.test(src)) fail('wml-assessment.js indexes a hardcoded recall list again — read the paper\'s recall_rotation');
    if (/% 4\];/.test((/\$recall_q = [^\n]*/.exec(router) || [''])[0])) fail('the router rotates modulo 4 again — use count($recall_rotation)');
    if (!failed) console.log(`  ✓ recall rotation: ${n} paper(s) declare their own, every entry is a real question; JS and router share the default ${jsDef}`);
}

if (failed) { console.log(`\n❌ prechain-goal-gate FAILED (${failed}).`); process.exit(1); }
console.log(`✅ prechain-goal-gate passed${pending ? ` (${pending} pending — a protocol mid-port)` : ''}.`);
