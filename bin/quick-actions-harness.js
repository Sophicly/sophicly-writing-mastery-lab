#!/usr/bin/env node
/* eslint-env node */
// quick-actions-harness (v7.20.709) — chips are the student's real choices, in the words they were offered.
//
// Two defects seen walking Edexcel IGCSE P2 planning on staging (59207, 2026-10-05), both in the shared
// detectQuickActions (wml-app.js — every board, both chat pipelines):
//  1. the anchor recap ("• F: … • S: … • L: …") became three chips under an ask that said "type ready";
//  2. every ' was stripped from labels, so "I'll choose my own three anchors" read "Ill choose…" — and the label is the
//     text sent as the student's turn.
// Slices the REAL function and drives it with the walk's own texts.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-app.js'), 'utf8');
const m = src.match(/    function detectQuickActions\(text\) \{[\s\S]*?\n    \}\n/);
if (!m) { console.error('❌ quick-actions-harness: cannot slice detectQuickActions'); process.exit(1); }
const sb = { state: { task: 'planning', board: 'edexcel-igcse', subject: 'language_p2' }, console: { log() {}, warn() {} } };
vm.createContext(sb);
vm.runInContext(m[0], sb);
const qa = (t) => sb.detectQuickActions(t) || [];
const labels = (t) => qa(t).map(o => o.label);

let passed = 0, failed = 0;
const ok = (c, label, d) => { if (c) passed++; else { failed++; console.log('  ❌ ' + label + (d !== undefined ? ' — ' + JSON.stringify(d) : '')); } };

const RECAP = "Strong choices, Neil. All three are copied accurately from the printed text, and each sits at a pivotal moment:\n\n• F: \"afflicted with a heart trouble\" comes from the opening, where the narrator first frames Mrs Mallard.\n• S: \"free, free, free!\" is the turning point in her room, where fear gives way to release.\n• L: \"of the joy that kills\" is the final line and the story's reversal.\n\nType 'ready' to begin Body Paragraph 1.";
ok(!qa(RECAP).some(o => /^[FSL]$/.test(o.value)), 'Q1: the F/S/L anchor recap is not a menu (no F) / S) / L) chips)', labels(RECAP));
const PROCEED = "How would you like to proceed?\n\n**A** — I'll choose my own three anchors (F, S and L)\n**B** — Point me towards the key moments first, and I'll choose the words";
ok(labels(PROCEED)[0] === "A) I'll choose my own three anchors (F, S and L)", 'Q2: an in-word apostrophe survives in the chip label (and so in the sent turn)', labels(PROCEED));
const QUOTED = 'Which do you want?\n\nA) "Save these key words"\nB) \'Tweak them\'';
ok(labels(QUOTED).join('|') === 'A) Save these key words|B) Tweak them', 'Q3: wrapping quotation marks are still removed', labels(QUOTED));
const TARGETS = 'Which up to three targets do you want to pin?\nA) Replace shows\nB) Two effects\nC) Interplay\nD) Zoom\nE) Full chain\nF) Conclusion loop';
ok(qa(TARGETS).length === 6 && qa(TARGETS)[5].value === 'F', 'Q4: a real A–F menu keeps its F option', labels(TARGETS));
const PLAIN = 'Pick one:\nA) Yes, use my feedback to set Planning Targets\nB) No, skip this and move on to choosing quotations';
ok(qa(PLAIN).length === 2, 'Q5: an ordinary A/B menu is unchanged', labels(PLAIN));
// v7.20.721 (#747) — IGCSE P1 planning walk, Vision sensory-detail ask (staging 59205, 2026-10-06), verbatim tail.
const SEEHEAR = 'Now the sensory details. Your scene already has one touch, the strap, and that is what your listeners feel. Give them more to work with: what can they see or hear in the moment someone says "what are you into?" Think about the gate on that same Monday. What is the one detail, other than the strap, that will make your listeners feel they are standing there?';
ok(qa(SEEHEAR).length === 0, 'Q6: an open "see or hear" question is not split into two chips', labels(SEEHEAR));
const WHICHEXTRACT = 'Which extract would you like to use: Act 1 Scene 4 (fate and dreams) or Act 3 Scene 1 (fortune) for your essay?';
ok(labels(WHICHEXTRACT).join('|') === 'Act 1 Scene 4|Act 3 Scene 1', 'Q7: the v7.15.74 "Which X: A or B?" choice still gives two chips', labels(WHICHEXTRACT));

console.log(`— QUICK ACTIONS: ${passed}/${passed + failed} assertions passed.`);
if (failed) { console.log('\n❌ quick-actions-harness FAILED'); process.exit(1); }
console.log('✅ quick-actions-harness passed (no recap posing as a menu; labels keep their apostrophes).');
