#!/usr/bin/env node
/* eslint-env node */
// REAL-STATE VERIFY probe (PLANNING-LADDER-PORT-RECIPE §2): what does a language paper's REDRAFT document
// actually render, question by question — plan boxes, outline rows, response boxes?
//
//   node bin/paper-render-probe.js . edexcel-igcse language_p1            (Topic 1)
//   node bin/paper-render-probe.js . edexcel-igcse language_p1 --topic=4
//   node bin/paper-render-probe.js . aqa language_p2 --all-topics          (one line per topic × question)
//
// v7.20.697 (#722 B2 step 0): the probe now runs the page's WHOLE doc builder (buildMultiQuestionTemplate,
// sliced from wml-assessment.js) on the REAL topic template, parsed by the shipped PHP parser — see
// bin/lib/template-render-sandbox.js. Its two earlier versions each measured something the page never does:
// the first read the spec JSON with the hyphenated board key the page cannot find (#618), and both re-typed
// the outline dispatch by hand, so a change to the real dispatch was invisible to them.
'use strict';
const { makeTemplateRenderer, readTopics, languageTemplate } = require('./lib/template-render-sandbox.js');

const ROOT  = process.argv[2] || require('path').join(__dirname, '..');
const BOARD = process.argv[3] || 'edexcel-igcse';
const SUBJ  = process.argv[4] || 'language_p1';
const flags = process.argv.slice(5);
const ALL = flags.includes('--all-topics');
const TOPIC = parseInt((flags.find(f => f.startsWith('--topic=')) || '').split('=')[1], 10) || null;

const { render, sandbox } = makeTemplateRenderer(ROOT);
const template = languageTemplate(ROOT, BOARD, SUBJ);
const topics = readTopics(ROOT, template).filter(t => t.questions.length);
if (!topics.length) { console.error('no topic with questions in ' + template); process.exit(1); }
const st = { board: BOARD, subject: SUBJ };

if (ALL) {
    console.log(`=== ${BOARD} ${SUBJ} — every topic, redraft (${require('path').basename(template)}) ===`);
    const shapes = {};
    for (const t of topics) {
        for (const q of render(st, 'redraft', t)) {
            const shape = `plan ${q.plan.length} · outline ${q.outline.length} · response ${q.response.length}`
                + (q.outline[0] ? ` (${q.outline[0]}…)` : q.plan[0] ? ` (${q.plan[0]}…)` : '');
            (shapes[q.qId] = shapes[q.qId] || {})[shape] = (shapes[q.qId][shape] || []).concat(t.topic);
        }
    }
    for (const [qId, byShape] of Object.entries(shapes)) {
        const n = Object.keys(byShape).length;
        console.log(`${qId}${n > 1 ? '  ⚠ ' + n + ' DIFFERENT SHAPES across topics' : ''}`);
        for (const [shape, ts] of Object.entries(byShape)) console.log(`    topics ${ts.join(',')}: ${shape}`);
    }
    process.exit(0);
}

const topic = TOPIC ? topics.find(t => t.topic === TOPIC) : topics[0];
if (!topic) { console.error('no Topic ' + TOPIC + ' with questions in ' + template); process.exit(1); }
console.log(`=== REAL DOC BUILD — board=${BOARD} subject=${SUBJ}, mode=redraft, Topic ${topic.topic} (${require('path').basename(template)}) ===\n`);
const qs = render(st, 'redraft', topic);
let specMisses = 0;
for (const q of qs) {
    if (!q.specFound) specMisses++;
    console.log(`--- ${q.qId}  (${q.marks} marks, type=${q.type}${q.specFound ? '' : ', NO SPEC FOUND'}) ---`);
    console.log(`    PLAN     ${q.plan.length ? q.plan.length + ': ' + q.plan.join(' ') : '— none'}`);
    console.log(`    OUTLINE  ${q.outline.length ? q.outline.length + ' row(s):' : '— none'}`);
    q.outline.forEach(id => console.log('        ' + id));
    console.log(`    RESPONSE ${q.response.join(' ') || '— none'}\n`);
}
if (specMisses) {
    console.log(`⛔ lookupQuestionSpec found NO spec for ${specMisses} of ${qs.length} question(s) on board=${BOARD} subject=${SUBJ} — `
        + 'the page builds these with no question type (#618). The rows above are what the page renders today.\n');
}

// Hypotheticals for porting — the shipped builders called directly, labelled as such.
const ids = html => String(html).split('\n').filter(l => l.startsWith('§R\t') || l.startsWith('§I\t')).map(l => l.split('\t')[1]);
const want = ids(sandbox.buildOutlineSection(['AO3'], 'Q5', 22, 'aqa_language_p2_comparison', { focus: 'comparative', stampAO: 'AO3' }));
console.log('=== HYPOTHETICAL: Q5 through the AQA comparative overlay ===');
console.log(`${want.length} row(s): ${want.join(' ')}`);
const iu = ids(sandbox.buildIUMVCCOutlineSection('Q6'));
console.log('\n=== HYPOTHETICAL: Section B (Q6) as IUMVCC ===');
console.log(`${iu.length} row(s): ${iu.join(' ')}`);
