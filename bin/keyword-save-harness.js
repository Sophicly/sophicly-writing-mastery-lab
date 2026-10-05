#!/usr/bin/env node
/* eslint-env node */
// keyword-save-harness (v7.20.706) — the confirmed key words file even when the model forgets the marker.
//
// Measured defect (staging 59207, test student 1938, 2026-10-05): Edexcel IGCSE P2 planning presented the student's
// key words with "A) Save these key words · B) Tweak them"; on the tap the model replied "Saved! ✅" with NO
// @FIELD_SET — the Question Focus box stayed empty and the stored history held zero markers. _healKeywordSave appends
// the marker from the presented list. This harness slices the REAL function from wml-assessment.js and drives it with
// the REAL transcript, then parses the result the way applyFieldSets does.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-assessment.js'), 'utf8');
const m = src.match(/function _healKeywordSave\(reply, history\) \{[\s\S]*?\n    \}\n/);
if (!m) { console.error('❌ keyword-save-harness: cannot slice _healKeywordSave'); process.exit(1); }
const warns = [];
const sb = { console: { warn: (...a) => warns.push(a.join(' ')) }, JSON, String, Array, state: { task: 'planning' }, canvasEditor: null };
vm.createContext(sb);
vm.runInContext(m[0], sb);
const heal = (r, h) => sb._healKeywordSave(r, h);
const withKw = { getHTML: () => '<div data-field-id="kw-focus" class="swml-input-field"></div>' };
const noKw = { getHTML: () => '<div data-field-id="plan-intro"></div>' };
// applyFieldSets' own parse (re + JSON.parse) — the consumer contract.
const fieldSets = (r) => { const out = {}; const re = /@FIELD_SET\s*(\{[^}]*\})/g; let x; while ((x = re.exec(r))) { try { const p = JSON.parse(x[1]); out[p.field] = p.value; } catch (e) { out.__bad = x[1]; } } return out; };

let passed = 0, failed = 0;
const ok = (c, label, d) => { if (c) passed++; else { failed++; console.log('  ❌ ' + label + (d ? ' — ' + d : '')); } };

// The real transcript (turns 9–11 of the 59207 walk, verbatim).
const PRESENT = "That's a thorough list, Neil. You've picked out the question's own words and all three bullet points, so every quotation and paragraph can be tested against them.\n\nHere are your key words:\n\n- present\n- Mrs Mallard's response\n- the news of her husband's death\n- her thoughts and feelings alone in her room\n- how the ending changes the way we see her\n- language and structure\n\nDo you want to save these key words as they are, or tweak them first?\n\nA) Save these key words\nB) Tweak them";
const SAVED = "Saved! ✅\n\nBefore we plan your body paragraphs, let me confirm your text type.\n\nReady to begin planning Body Paragraph 1? Just type \"**ready**\" to start.\n\n[PROGRESS: 2]";
const hist = (userSaid, presented, extra) => [{ role: 'user', content: 'Let\'s begin!', hidden: true }, { role: 'assistant', content: 'earlier' },
  { role: 'user', content: 'present, Mrs Mallard\'s response…' }, { role: 'assistant', content: presented }].concat(extra || []).concat([{ role: 'user', content: userSaid }]);

sb.canvasEditor = withKw;
let r = heal(SAVED, hist('A) Save these key words', PRESENT));
let fs1 = fieldSets(r);
ok(fs1['kw-focus'] === "present; Mrs Mallard's response; the news of her husband's death; her thoughts and feelings alone in her room; how the ending changes the way we see her; language and structure",
   'K1: REAL transcript, marker missing → kw-focus filed from the presented list (applyFieldSets parses it)', JSON.stringify(fs1));
ok(r.startsWith(SAVED.replace(/\s+$/, '')), 'K2: the model\'s own words are kept, the marker is appended after them');
ok(warns.some(w => /KeywordSave/.test(w)), 'K3: the heal warns loudly when it fires (never silent)');
const withMarker = SAVED + '\n@FIELD_SET{"field":"kw-focus","value":"the model\'s own list"}';
ok(heal(withMarker, hist('A) Save these key words', PRESENT)) === withMarker, 'K4: the model emitted the marker → reply untouched (its value wins)');
ok(heal(SAVED, hist('B) Tweak them', PRESENT)) === SAVED, 'K5: the student chose Tweak → nothing filed');
ok(heal(SAVED, hist('A) Save these key words', 'What grade are you aiming for?\nA) Grade 9')) === SAVED, 'K6: the turn answered was not a key-words presentation → nothing filed');
ok(fieldSets(heal(SAVED, hist('A', PRESENT)))['kw-focus'], 'K7: a bare "A" after the presentation also files');
const POETRY = "Excellent. You've identified the core focus:\n\n* **memory**\n* **loss**\n* **how the speaker changes**\n\nA) Save these keywords\nB) Tweak them";
ok(fieldSets(heal('Saved!', hist('A) Save these keywords', POETRY)))['kw-focus'] === 'memory; loss; how the speaker changes', 'K8: AQA poetry wording ("keywords", * bullets, **bold**) files the same way');
ok(heal(SAVED, hist('A) Save these key words', PRESENT, [{ role: 'assistant', content: 'hidden code turn', hidden: true }])).includes('"kw-focus"'), 'K9: a hidden code turn between presentation and tap is skipped');
sb.canvasEditor = noKw;
ok(heal(SAVED, hist('A) Save these key words', PRESENT)) === SAVED, 'K10: the document has no kw-focus box → nothing filed');
sb.canvasEditor = withKw; sb.state.task = 'assessment';
ok(heal(SAVED, hist('A) Save these key words', PRESENT)) === SAVED, 'K11: not a planning task → nothing filed');
sb.state.task = 'planning'; warns.length = 0;
ok(heal(SAVED, hist('A) Save these key words', 'Do you want to save these key words?\nA) Save these key words\nB) Tweak them')) === SAVED
   && warns.some(w => /could not be read/.test(w)), 'K12: a presentation with no readable list → nothing filed, warns');

console.log(`— KEYWORD SAVE: ${passed}/${passed + failed} assertions passed.`);
if (failed) { console.log('\n❌ keyword-save-harness FAILED'); process.exit(1); }
console.log('✅ keyword-save-harness passed (the confirmed key words file whether or not the model remembers the marker).');
