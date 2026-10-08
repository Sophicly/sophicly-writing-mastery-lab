#!/usr/bin/env node
/* eslint-env node */
/**
 * panel-file-harness.js — FIXLIST #812/#812b (Neil, 2026-10-09: Speaker notes "nothing auto-filed into the slots";
 * "check all documents and protocols that have similar functions").
 *
 * Runs the SHIPPED pure block (@PANEL-FILE-PURE-BEGIN/END in frontend/wml-assessment.js) and checks the wiring:
 *   §A  approval detection — the taps that mean "save" do, and anything asking for a change does not;
 *   §B  the [PANEL] reader — Neil's real Speaker preview shape files exactly its three boxes, never an id the doc lacks;
 *   §C  the save-claim / save-offer / marker detectors the repair net decides on;
 *   §D  wiring — BOTH chat pipelines file on the approval tap and run the repair net;
 *   §E  the source half — the router swaps the legacy [PANEL] RULE 7 for the markers-only rule on every protocol that
 *       files by @FIELD_SET/@FIELD_COMMIT, and each manifest task is classified by that same rule.
 *   WML_SRC=<tree> node bin/panel-file-harness.js   runs it against another build (mutation proof).
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.env.WML_SRC || path.join(__dirname, '..');
const JS = fs.readFileSync(path.join(ROOT, 'frontend/wml-assessment.js'), 'utf8');
const PHP = fs.readFileSync(path.join(ROOT, 'includes/class-protocol-router.php'), 'utf8');
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) { pass++; } else { fail++; console.log('  ❌ ' + m); } };

const b = JS.indexOf('// @PANEL-FILE-PURE-BEGIN'), e = JS.indexOf('// @PANEL-FILE-PURE-END');
if (b < 0 || e < 0) { console.log('❌ panel-file-harness: @PANEL-FILE-PURE block not found'); process.exit(1); }
const api = new Function(JS.slice(b, e) + '\nreturn { _isSaveApproval, _panelSetsFor, _SAVE_CLAIM_RE, _SAVE_OFFER_RE, _FILING_MARKER_RE };')();

// §A
['A) Save this', 'A — ✅ Save this', '**A** — ✅ Save this', 'A', 'a', 'A.', 'Save this', '✅ Save this', 'yes', 'Yes please', 'happy', 'looks good', 'ok']
  .forEach((s) => ok(api._isSaveApproval(s), 'approval not recognised: ' + JSON.stringify(s)));
['a bit unsure', 'B — ✏️ I want to change something', 'B', 'yes but change the quote', 'no', 'A lot of people think that', 'not sure',
 'irony', 'I want to edit it', 'all of them', 'nothing besides remains', 'yes, but swap the second quote for the last line']
  .forEach((s) => ok(!api._isSaveApproval(s), 'NOT an approval, but read as one: ' + JSON.stringify(s)));

// §B — the shape of prod user 1's turn 15 (AQA Power & Conflict CN, Ozymandias)
const preview = "Let's pull all of that together into your Speaker notes for Ozymandias.\n\n"
  + '[PANEL: poem_ozymandias_speaker]The speaker is a persona, not Shelley himself — a listener relating a traveller\'s secondhand account ("I met a traveller from an antique land").\nWithin that account, a third voice is nested.[/PANEL]\n\n'
  + '[PANEL: poem_ozymandias_speaker_quotes]"I met a traveller from an antique land" • "Nothing beside remains."[/PANEL]\n\n'
  + '[PANEL: poem_ozymandias_speaker_effect]FOCUS: the gap between boast and ruin • EMOTION: weary mockery[/PANEL]\n\n'
  + '[PANEL: mp_score]8/10[/PANEL]\n\n**A** — ✅ Save this\n**B** — ✏️ I want to change something';
const boxes = new Set(['poem_ozymandias_speaker', 'poem_ozymandias_speaker_quotes', 'poem_ozymandias_speaker_effect', 'poem_ozymandias_context']);
const sets = api._panelSetsFor(preview, boxes);
ok(sets.length === 3, 'the Speaker preview must file exactly its 3 boxes (got ' + sets.length + ')');
ok(sets.map((s) => s.field).join(',') === 'poem_ozymandias_speaker,poem_ozymandias_speaker_quotes,poem_ozymandias_speaker_effect', 'wrong ids/order: ' + sets.map((s) => s.field));
ok(!sets.some((s) => s.field === 'mp_score'), 'a [PANEL] id that is not a box in this document must never file');
ok(sets[0] && !/\n/.test(sets[0].value) && /third voice is nested\.$/.test(sets[0].value), 'a multi-line panel must file as one line, whole');
ok(api._panelSetsFor('[PANEL: poem_ozymandias_speaker]x is ok[/PANEL][PANEL: poem_ozymandias_speaker]second[/PANEL]', boxes).length === 1, 'one id must file once');

// §C
['Notes saved! ✅', 'Notes saved!', 'Filed to your plan: …', 'your idea is saved and ready', 'Saved! ✅', 'Your notes are now saved.']
  .forEach((s) => ok(api._SAVE_CLAIM_RE.test(s), 'save claim not recognised: ' + s));
['Let\'s save time and move on.', 'What does the speaker save us from?', 'Great answer — now Historical Context.']
  .forEach((s) => ok(!api._SAVE_CLAIM_RE.test(s), 'not a save claim, but read as one: ' + s));
ok(api._SAVE_OFFER_RE.test(preview) && api._SAVE_OFFER_RE.test('Happy to save these notes for Speaker, or adjust anything?'), 'save offer not recognised');
ok(api._FILING_MARKER_RE.test('Notes saved! ✅\n@FIELD_SET{"field":"x","value":"y"}') && !api._FILING_MARKER_RE.test('Notes saved! ✅'), 'filing-marker detector wrong');

// §D — wiring, both pipelines
const tap = JS.match(/const msg = _poetryCnEnsurePoemMarker\(chatTextarea\.value\.trim\(\), canvasChatHistory\);\n\s+if \(!msg \|\| canvasChatLoading\) return;\n\s+_filePanelsOnApproval\(msg, canvasChatHistory\);/g) || [];
ok(tap.length === 2, 'BOTH chat pipelines must file on the approval tap, straight after the message guard (found ' + tap.length + ')');
const net = JS.match(/setTimeout\(\(\) => _maybeRepairClaimedSave\(_r\), \d+\);/g) || [];
ok(net.length === 2, 'BOTH chat pipelines must run the save-claim repair net (found ' + net.length + ')');
ok(/function _filePanelsOnApproval[\s\S]{0,900}_applyFieldValueSets\(sets\)/.test(JS), 'the approval must file through _applyFieldValueSets (same PM path + provenance as @FIELD_SET)');
ok(/function _maybeRepairClaimedSave[\s\S]{0,1600}preview === _panelFiledPreview/.test(JS), 'the repair net must skip a preview the approval already filed (no double write, no wasted call)');

// §E — the source half (router)
ok(/\$preamble \.= self::rule7_legacy_block\(\);/.test(PHP), 'build_preamble must emit the legacy RULE 7 through rule7_legacy_block() (the swap matches it exactly)');
ok(/if \(\$preamble && self::protocol_files_by_markers\(\$modular_protocol\)\) \{\s*\$_r7 = self::rule7_legacy_block\(\);\s*if \(strpos\(\$preamble, \$_r7\) !== false\) \$preamble = str_replace\(\$_r7, self::rule7_markers_block\(\), \$preamble\);/.test(PHP),
  'the assembly step must swap the legacy RULE 7 for the markers-only rule when the protocol files by markers');
const fn = (PHP.match(/public static function protocol_files_by_markers\(\$protocol\) \{([\s\S]*?)\n    \}/) || [])[1] || '';
ok(/@CONFIRM_ELEMENT[\s\S]*return false/.test(fn) && /@FIELD_SET\{/.test(fn) && /@FIELD_COMMIT\{/.test(fn), 'protocol_files_by_markers must be: no @CONFIRM_ELEMENT, and @FIELD_SET{ or @FIELD_COMMIT{');
// classify every manifest task by that rule (same resolution as the protocol loader: base_path, then protocols/shared)
const filesBy = (t) => !/@CONFIRM_ELEMENT/.test(t) && /@FIELD_SET\{|@FIELD_COMMIT\{/.test(t);
const want = { 'shared/poetry|conceptual_notes': true, 'shared/literature|conceptual_notes': true, 'shared/nonfiction|conceptual_notes': true,
  'aqa/language1|assessment': true, 'aqa/literature|planning': false };
const got = {};
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!/^_/.test(f)) walk(p); } else if (f === 'manifest.json') {
  const m = JSON.parse(fs.readFileSync(p, 'utf8')); const base = path.join(ROOT, m.base_path || path.relative(ROOT, path.dirname(p)));
  for (const [task, v] of Object.entries(m)) { if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
    const fl = new Set(v.always || []); for (const s of Object.values(v.steps || {})) if (s) [].concat(s.file || [], s.files || [], s.modules || []).forEach((x) => fl.add(x));
    if (!fl.size) continue; let t = '';
    for (const f2 of fl) for (const c of [path.join(base, f2), path.join(ROOT, 'protocols/shared', f2), path.join(ROOT, f2)]) { if (fs.existsSync(c)) { t += fs.readFileSync(c, 'utf8'); break; } }
    got[path.relative(path.join(ROOT, 'protocols'), path.dirname(p)) + '|' + task] = filesBy(t); } } } })(path.join(ROOT, 'protocols'));
for (const [k, v] of Object.entries(want)) ok(got[k] === v, k + ' should ' + (v ? '' : 'NOT ') + 'get the markers-only RULE 7 (got ' + got[k] + ')');
const swapped = Object.entries(got).filter(([, v]) => v).map(([k]) => k);
console.log('— markers-only RULE 7 applies to ' + swapped.length + ' manifest task(s): ' + swapped.join(' · '));

console.log(fail ? `❌ panel-file-harness FAILED (${fail} of ${pass + fail})` : `✅ panel-file-harness passed (${pass} checks)`);
process.exit(fail ? 1 : 0);
