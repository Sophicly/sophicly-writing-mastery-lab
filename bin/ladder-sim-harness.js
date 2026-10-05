#!/usr/bin/env node
/* eslint-env node */
/* Node build-time harness — NOT shipped to the browser. Run: node bin/ladder-sim-harness.js */
//
// v7.20.206 — C-LADDER SIMULATION HARNESS (the behavioural layer the static checks can't give).
//
// WWAD: an LLM-in-the-loop feature is assessed with EVALS, not vibes — scripted sessions driven
// through the REAL shipped state machine, outcomes asserted. The ladder engine is a pure function
// over (history, doc, state), so every worked example in PLANNING-LADDER-P3-DESIGN-2026-07-18.md
// §2.3/§2.4 and every Fable-review invariant becomes an executable fixture here — no LLM needed.
//
// Not a reimplementation: the C-LADDER module is sliced VERBATIM out of wml-assessment.js
// (same method as bin/outline-rule-harness.js) and executed in a vm sandbox with only the four
// module-scope collaborators stubbed (state, canvasEditor, _isLangPaper2, _planChainNorm).
// If the engine changes, this runs the CHANGED code.
//
// Covered invariant families:
//   A. activation + question resolution      E. verdict routing (applyElementJudge)
//   B. active-element scan / doc states      F. self-heals land SAFE (never escalate/spend)
//   C. rung math: climb·cap·fade·pace·IDK    G. wallet counting + sub-cap
//   D. resume (runId — climbs die, resolutions survive)   H. deterministic pre-check regexes

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ASSESS = path.join(__dirname, '..', 'frontend', 'wml-assessment.js');
const src = fs.readFileSync(ASSESS, 'utf8');

const START = "var _ladderRunId = 'r' + Date.now();";
const END = '// v7.19.429: GENERIC chat→canvas field-fill primitive';
const i0 = src.indexOf(START), i1 = src.indexOf(END);
if (i0 < 0 || i1 < 0 || i1 <= i0) { console.error('❌ ladder-sim: cannot slice C-LADDER module (markers moved)'); process.exit(1); }
const moduleSrc = src.slice(i0, i1);

// ── sandbox: stub ONLY the module's external collaborators ────────────────────────────────────
const warns = [];
const sandbox = {
  console: { warn: (...a) => warns.push(a.join(' ')), log: () => {} },
  Date, Math, JSON, String, parseInt, parseFloat,
  state: { task: 'planning', board: 'aqa', subject: 'language2', marks: 12, question: 'Q3' },
  _planChainNorm: (s) => String(s || '').replace(/\*/g, ''),
  canvasEditor: null, // set per-fixture via mkDoc
};
vm.createContext(sandbox);
// _isLangPaper2 is sliced from the REAL source (not stubbed) — the subject-gate leg is itself
// under test (the real lesson's subject arrives as "language"-family forms; a stub returning
// true would blind the A4 dormancy fixture to a gate regression).
const isP2Match = src.match(/function _isLangPaper2\(\) \{[\s\S]*?\n    \}/);
if (!isP2Match) { console.error('❌ ladder-sim: cannot slice _isLangPaper2'); process.exit(1); }
vm.runInContext(isP2Match[0], sandbox);
// v7.20.208: the P1 twin gate is sliced from the REAL source too — the P1 activation leg
// (subject-family normalisation) is itself under test, exactly as P2's.
const isP1Match = src.match(/function _isLangPaper1\(\) \{[\s\S]*?\n    \}/);
if (!isP1Match) { console.error('❌ ladder-sim: cannot slice _isLangPaper1'); process.exit(1); }
vm.runInContext(isP1Match[0], sandbox);
// v7.20.229: the LIT essay-family gate is sliced from the REAL source too — the subject-family
// normalisation leg (shakespeare / modern_text / 19th_century, never bare 'literature') is
// itself under test.
const isLitMatch = src.match(/function _isLitEssay\(\) \{[\s\S]*?\n    \}/);
if (!isLitMatch) { console.error('❌ ladder-sim: cannot slice _isLitEssay'); process.exit(1); }
vm.runInContext(isLitMatch[0], sandbox);
vm.runInContext(moduleSrc, sandbox);

// Fake PM doc: rows = [{fieldId, text}] → canvasEditor.state.doc.descendants walking outlineRows.
function mkDoc(rows) {
  sandbox.canvasEditor = {
    state: { doc: { descendants(cb) {
      for (const r of rows) {
        const node = { type: { name: r.type || 'outlineRow' }, attrs: { fieldId: r.fieldId }, textContent: r.text || '' };
        if (cb(node) === false) return;
      }
    } } }
  };
}
// The Q3 planning doc: all 18 TTECEA outline boxes present (empty unless named in `filled`).
function q3Doc(filled) {
  filled = filled || {};
  const rows = [];
  for (let i = 1; i <= 3; i++) {
    for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) {
      const fid = `outline-body-${i}-${s}-q3`;
      rows.push({ fieldId: fid, text: filled[fid] || '' });
    }
  }
  return rows;
}
const call = (fn, ...args) => sandbox[fn](...args);
const setRun = (id) => vm.runInContext(`_ladderRunId = ${JSON.stringify(id)};`, sandbox);
const RUN = () => vm.runInContext('_ladderRunId', sandbox);

let passed = 0, failed = 0;
function ok(cond, label, detail) {
  if (cond) { passed++; }
  else { failed++; console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`); }
}
// A judged-turn stamp as the engine would have written it (helper for history fixtures).
function stamp(el, verdict, extra) {
  return Object.assign({ role: 'assistant', content: 'x', ladder: Object.assign(
    { el, verdict, rung: 1, regime: 'normal', runId: RUN(), question: 'q3', kind: 'attempt', source: 'llm' }, extra) }, {});
}

// ═══ A. ACTIVATION + DOC-DERIVED QUESTION RESOLUTION (v7.20.206 — the real-lesson shape) ═════
// The REAL P2 planning lesson carries NO marks attr and NO question label (staging shortcode,
// verified 2026-07-19: board="aqa" subject="language" text="aqa_lang_paper_2"). The question is
// derived from the DOC — these fixtures run with marks=30/question='' (the real values).
mkDoc(q3Doc());
sandbox.state.marks = 30; sandbox.state.question = '';
let stA = call('deriveLadderState', []);
ok(stA && stA.el === 'outline-body-1-topic-q3' && stA.question === 'q3',
   'A1: REAL lesson state (marks 30, no label) + Q3 doc → ladder LIVE, question doc-derived');
sandbox.state.task = 'assessment';
ok(call('deriveLadderState', []) === null, 'A2: non-planning task → dormant');
sandbox.state.task = 'planning'; sandbox.state.board = 'edexcel';
ok(call('deriveLadderState', []) === null, 'A3: unported board (edexcel) → dormant');
sandbox.state.board = 'aqa'; sandbox.state.subject = 'literature';
ok(call('deriveLadderState', []) === null, 'A4: non-P2 subject → dormant');
sandbox.state.subject = 'language2';
// The whole-paper MONOLITH doc (Q2 + Q3 boxes; the real lesson shape):
function monolithDoc(filled) {
  filled = filled || {};
  const rows = [];
  for (let i = 1; i <= 2; i++) for (const s of ['inf1-topic', 'inf1-evidence', 'inf2-topic', 'inf2-evidence']) {
    const fid = `outline-body-${i}-${s}-q2`; rows.push({ fieldId: fid, text: filled[fid] || '' });
  }
  return rows.concat(q3Doc(filled));
}
mkDoc(monolithDoc());
stA = call('deriveLadderState', []);
ok(stA && stA.el === 'q2-overall-difference' && stA.question === 'q2',
   'A5: monolith doc, nothing filled → Q2 first (exam order), synthetic Beat-1 el active');
// Whole Q2 complete → walk crosses into Q3:
const q2Done = {};
for (let i = 1; i <= 2; i++) for (const s of ['inf1-topic', 'inf1-evidence', 'inf2-topic', 'inf2-evidence']) q2Done[`outline-body-${i}-${s}-q2`] = 'done';
mkDoc(monolithDoc(q2Done));
stA = call('deriveLadderState', [stamp('q2-overall-difference', 'resolved'), stamp('q2-aspect-split', 'resolved')]);
ok(stA && stA.el === 'outline-body-1-topic-q3' && stA.question === 'q3',
   'A6: Q2 fully planned → active crosses to Q3 first el (one session, whole paper)', stA && `${stA.el}/${stA.question}`);
// Implied synthetic resolution (legacy mid-plan doc / missed marker — never pin a passed beat):
mkDoc(monolithDoc({ 'outline-body-1-inf1-topic-q2': 'their filed idea' }));
stA = call('deriveLadderState', []);
ok(stA && stA.el === 'outline-body-1-inf1-evidence-q2',
   'A7: synthetic unstamped but LATER box filled → implied resolved, active moves on (no wedge)', stA && stA.el);
// v7.20.645 (#627, Anam 1298 measured on prod): Q2 boxes EMPTY (planned in June in the old shape)
// while Q3 already holds filed work → the cursor must be on Q3, not pinned to Q2's first el.
mkDoc(monolithDoc({ 'outline-body-1-topic-q3': 'filed', 'outline-body-1-evidence-q3': 'filed', 'outline-body-1-analysis-q3': 'filed', 'outline-body-1-effects-q3': 'filed', 'outline-body-1-effects2-q3': 'filed', 'outline-body-1-purpose-q3': 'filed', 'outline-body-2-topic-q3': 'filed' }));
stA = call('deriveLadderState', []);
ok(stA && stA.question === 'q3' && !/q2/.test(String(stA.el)),
   'A7b: earlier question empty but a LATER question holds filed work → active follows the work (Q3), never pinned to Q2', stA && `${stA.el}/${stA.question}`);
// All-absent (legacy pre-outline bake) → dormant + warn, NEVER done-on-empty:
warns.length = 0;
mkDoc([{ fieldId: 'some-legacy-box', text: '' }]);
ok(call('deriveLadderState', []) === null, 'A8: doc with NO ladder boxes → null (dormant), never done:true');
ok(warns.some(w => /no outline boxes/.test(w)), 'A9: …and warns loudly (silent-dormant is the failure that shipped .205)');
// Q5-only transactional doc → q5 derived (q2-q4 skipped whole):
mkDoc([{ fieldId: 'outline-iumvcc-intro', text: '' }, { fieldId: 'outline-iumvcc-urgency', text: '' }]);
stA = call('deriveLadderState', [stamp('q5-task-analysis', 'resolved')]);
ok(stA && stA.el === 'q5-intro-image' && stA.question === 'q5',
   'A10: Q5-only doc → q5 derived from doc, task-analysis stamp honoured', stA && `${stA.el}/${stA.question}`);
// v7.20.207 (delta-verify F10): the Q4 walk arm — the one registry arm no fixture drove.
function q4Doc(filled) {
  filled = filled || {};
  const rows = [];
  for (let i = 1; i <= 3; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) {
    const fid = `outline-body-${i}-${s}`; rows.push({ fieldId: fid, text: filled[fid] || '' });
  }
  rows.push({ fieldId: 'outline-intro-thesis-q4', text: filled['outline-intro-thesis-q4'] || '' });
  rows.push({ fieldId: 'outline-conclusion-thesis', text: filled['outline-conclusion-thesis'] || '' });
  return rows;
}
mkDoc(q4Doc());
stA = call('deriveLadderState', []);
ok(stA && stA.el === 'q4-aspects' && stA.question === 'q4', 'A13: Q4-only doc, fresh → q4-aspects (Beat 1) active');
const q4Fill = {};
for (let i = 1; i <= 3; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) q4Fill[`outline-body-${i}-${s}`] = 'done';
q4Fill['outline-intro-thesis-q4'] = 'thesis';
mkDoc(q4Doc(q4Fill));
stA = call('deriveLadderState', [stamp('q4-aspects', 'resolved', { question: 'q4' })]);
ok(stA && stA.el === 'outline-conclusion-thesis' && stA.question === 'q4',
   'A14: Q4 bodies+intro filled → conclusion active (bodies→frame order holds)', stA && stA.el);

// Registry shape: Q4 body unsuffixed + intro suffixed + conclusion unsuffixed (the byte-trace law).
const q4reg = call('_ladderRegistry', 'q4').map(e => e.el);
ok(q4reg.includes('outline-body-1-topic') && !q4reg.includes('outline-body-1-topic-q4'),
   'A11: Q4 body els UNSUFFIXED');
ok(q4reg.includes('outline-intro-thesis-q4') && q4reg.includes('outline-conclusion-thesis'),
   'A12: Q4 intro suffixed + conclusion unsuffixed');

// ═══ B. ACTIVE-ELEMENT SCAN ═══════════════════════════════════════════════════════════════════
mkDoc(q3Doc());
let st = call('deriveLadderState', []);
ok(st && st.el === 'outline-body-1-topic-q3' && st.rung === 1, 'B1: fresh doc → first el, L1');
mkDoc(q3Doc({ 'outline-body-1-topic-q3': 'The concept of decay' }));
st = call('deriveLadderState', [stamp('q3-technique-p1', 'resolved')]);
ok(st && st.el === 'outline-body-1-evidence-q3',
   'B2: topic filled + technique stamp-resolved → evidence active', st && st.el);
mkDoc(q3Doc({ 'outline-body-1-topic-q3': 'x' }));
st = call('deriveLadderState', []);
ok(st && st.el === 'q3-technique-p1', 'B3: synthetic el (technique) gates until stamp-resolved');
// Absent boxes are skipped, never blocked on (a 2-paragraph doc).
mkDoc(q3Doc().filter(r => !r.fieldId.includes('-3-')));
const fullFill = {};
for (let i = 1; i <= 2; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) fullFill[`outline-body-${i}-${s}-q3`] = 'done';
mkDoc(q3Doc(fullFill).filter(r => !r.fieldId.includes('-3-')));
st = call('deriveLadderState', [stamp('q3-technique-p1', 'resolved'), stamp('q3-technique-p2', 'resolved'), stamp('q3-technique-p3', 'resolved')]);
ok(st && st.done === true, 'B4: all present boxes filled + synthetics resolved → done (absent ¶3 skipped)');
// v7.20.207 (delta-verify F1): same partial doc WITHOUT the ¶3 technique stamp — the synthetic has
// no later PRESENT filing el (¶3 pruned) → phantom beat, must NOT pin; done still reached.
st = call('deriveLadderState', [stamp('q3-technique-p1', 'resolved'), stamp('q3-technique-p2', 'resolved')]);
ok(st && st.done === true, 'B4b: pruned-doc synthetic tail never pins (no later PRESENT el → passed)', st && (st.done ? 'done' : st.el));
// Editor not mounted → dormant for the turn (v7.20.206: never a phantom derive off a mount race).
sandbox.canvasEditor = null;
ok(call('deriveLadderState', []) === null, 'B5: null editor → null (dormant turn, no phantom TELL)');

// ═══ C. RUNG MATH ═════════════════════════════════════════════════════════════════════════════
mkDoc(q3Doc());
const el1 = 'outline-body-1-topic-q3';
st = call('deriveLadderState', [stamp(el1, 'failed')]);
ok(st.rung === 2, 'C1: 1 genuine failed → L2');
st = call('deriveLadderState', [stamp(el1, 'failed'), stamp(el1, 'failed'), stamp(el1, 'failed')]);
ok(st.rung === 4, 'C2: 3 failed → L4');
st = call('deriveLadderState', [stamp(el1, 'failed'), stamp(el1, 'failed'), stamp(el1, 'failed'), stamp(el1, 'failed')]);
ok(st.rung === 4, 'C3: 4th failed → still L4 (hard cap, never 5)');
st = call('deriveLadderState', [stamp(el1, 'failed', { idkPending: true, source: 'code' })]);
ok(st.rung === 1 && st.regime === 'idk-pending', 'C4: IDK-failed → NO climb, idk-pending regime');
st = call('deriveLadderState', [stamp(el1, 'failed', { idkPending: true, source: 'code' }), stamp(el1, 'failed')]);
ok(st.rung === 2, 'C5: IDK then genuine failed → one climb only');
st = call('deriveLadderState', [stamp(el1, 'weak')]);
ok(st.rung === 1 && st.pushSpent === true && st.regime === 'owned-push', 'C6: llm-weak → push spent, NO climb');
st = call('deriveLadderState', [stamp(el1, 'weak', { source: 'heal-none' })]);
ok(st.pushSpent === false, 'C7: HEALED weak → push NOT spent (Fable fix F)');
// FADE: para-1 topic resolved at L3 → para-2 topic opens at L2.
const fadeFill = {};
for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) fadeFill[`outline-body-1-${s}-q3`] = 'done';
mkDoc(q3Doc(fadeFill));
st = call('deriveLadderState', [stamp('outline-body-1-topic-q3', 'resolved', { rung: 3 }), stamp('q3-technique-p1', 'resolved'), stamp('q3-technique-p2', 'resolved')]);
ok(st.el === 'outline-body-2-topic-q3' && st.base === 2 && st.fade === true,
   'C8: same-type sibling resolved ≥L3 → FADE, base L2', st && `${st.el} base=${st.base}`);
// PACE: 3 distinct els resolved ≥L3 → everything else opens at L2.
mkDoc(q3Doc(fadeFill));
st = call('deriveLadderState', [
  stamp('outline-body-1-evidence-q3', 'resolved', { rung: 3 }),
  stamp('outline-body-1-analysis-q3', 'resolved', { rung: 4 }),
  stamp('outline-body-1-effects-q3', 'resolved', { rung: 3 }),
  stamp('q3-technique-p1', 'resolved'), stamp('q3-technique-p2', 'resolved')]);
ok(st.paceValve === true && st.base === 2, 'C9: 3 els resolved ≥L3 → PACE valve, base L2');
// v7.20.206: pace/fade earned on ANOTHER question must not pre-open this one (per-question scope).
mkDoc(q3Doc());
st = call('deriveLadderState', [
  stamp('outline-body-1-inf1-topic-q2', 'resolved', { rung: 3, question: 'q2' }),
  stamp('outline-body-1-inf1-evidence-q2', 'resolved', { rung: 4, question: 'q2' }),
  stamp('outline-body-2-inf1-topic-q2', 'resolved', { rung: 3, question: 'q2' })]);
ok(st.paceValve === false && st.base === 1, 'C10: 3 high-resolves on Q2 do NOT pace Q3 (scope law)');

// ═══ D. RESUME (runId) ════════════════════════════════════════════════════════════════════════
mkDoc(q3Doc());
const oldRun = RUN();
const histD = [stamp(el1, 'failed'), stamp(el1, 'failed')]; // two climbs this "session"
setRun('r-reload');
st = call('deriveLadderState', histD);
ok(st.el === el1 && st.rung === 1, 'D1: reload (new runId) → climbs die, base rung restart');
// but resolutions SURVIVE reload (fade persists):
mkDoc(q3Doc(fadeFill));
st = call('deriveLadderState', [Object.assign({}, stamp('outline-body-1-topic-q3', 'resolved', { rung: 3 })), stamp('q3-technique-p1', 'resolved'), stamp('q3-technique-p2', 'resolved')].map(m => { m.ladder.runId = oldRun; return m; }));
ok(st.el === 'outline-body-2-topic-q3' && st.base === 2, 'D2: prior-run RESOLUTIONS survive reload (fade holds)');
setRun(oldRun);

// ═══ E+F. VERDICT ROUTING + SELF-HEALS (applyElementJudge on the real shipped code) ══════════
const TOLD = { el: el1, rung: 2, regime: 'normal', question: 'q3' };
const BEGUN = [stamp(el1, 'weak')]; // element-mode already begun
let s;
s = call('applyElementJudge', '@ELEMENT_JUDGE{"el":"outline-body-1-topic-q3","verdict":"resolved"}\nGreat.', TOLD, { verdict: null }, BEGUN);
ok(s && s.verdict === 'resolved' && s.source === 'llm', 'E1: clean resolved marker parsed');
s = call('applyElementJudge', '@ELEMENT_JUDGE{"el":"outline-body-1-topic-q3","verdict":"wrong","class":"technique-misID"}', TOLD, { verdict: null }, BEGUN);
ok(s && s.verdict === 'wrong' && s['class'] === 'technique-misid', 'E2: wrong+class parsed (case-normalised)');
s = call('applyElementJudge', '@ELEMENT_JUDGE{"el":"outline-body-1-topic-q3","verdict":"wrong"}', TOLD, { verdict: null }, BEGUN);
ok(s && s.verdict === 'weak' && s.source === 'heal', 'F1: wrong WITHOUT class → heals to weak (never escalates)');
warns.length = 0;
s = call('applyElementJudge', '@ELEMENT_JUDGE{"el":"outline-body-9-BOGUS","verdict":"failed"}', TOLD, { verdict: null }, BEGUN);
ok(s && s.el === el1 && s.verdict === 'failed', 'E3: el mismatch → told id trusted, verdict kept');
ok(warns.some(w => /mismatch/.test(w)), 'E4: el mismatch warns loudly');
s = call('applyElementJudge', '@ELEMENT_JUDGE{bad json,,}', TOLD, { verdict: null }, BEGUN);
ok(s && s.verdict === 'weak' && /heal/.test(s.source), 'F2: garbage JSON → safe heal to weak');
s = call('applyElementJudge', 'Filed. @FIELD_COMMIT{"field":"outline-body-1-topic-q3"}', TOLD, { verdict: null }, BEGUN);
ok(s && s.verdict === 'resolved' && s.source === 'heal-commit', 'F3: commit-without-judge → heals resolved (the file IS the resolution)');
s = call('applyElementJudge', 'Filed. @FIELD_COMMIT{"field":"plan-Q3-para-1"}', TOLD, { verdict: null }, []);
ok(s === null, 'F4: OTHER-field commit pre-begin → no spurious stamp (el-specific heal-commit)');
s = call('applyElementJudge', 'Filed both. @FIELD_COMMIT{"field":"plan-Q3-para-1"}\n@FIELD_COMMIT{"field":"outline-body-1-topic-q3"}', TOLD, { verdict: null }, []);
ok(s && s.verdict === 'resolved', 'F5: dual filing (plan+outline) → the el\'s own commit found among several');
s = call('applyElementJudge', 'What a thoughtful start to the session.', TOLD, { verdict: null }, []);
ok(s === null, 'F6: markerless turn BEFORE element-mode → no stamp (pre-chain protected)');
s = call('applyElementJudge', 'Try once more?', TOLD, { verdict: null }, BEGUN);
ok(s && s.verdict === 'weak' && s.source === 'heal-none', 'F7: markerless judged turn → weak heal (safe: no climb, no push spend)');
s = call('applyElementJudge', 'x', TOLD, { verdict: 'failed', idkPending: true }, BEGUN);
ok(s && s.verdict === 'failed' && s.idkPending === true && s.source === 'code', 'E5: code pre-verdict wins (LLM never judged)');
// v7.20.206: the protocol annex's literal marker TEMPLATE is parseable JSON — if echoed before the
// real marker, first-match parsing loses the real verdict. Parser must skip template echoes.
s = call('applyElementJudge',
  '@ELEMENT_JUDGE{"el":"<the active element id from the state block, byte-exact>","verdict":"resolved|weak|failed|wrong"}\n@ELEMENT_JUDGE{"el":"outline-body-1-topic-q3","verdict":"resolved"}',
  TOLD, { verdict: null }, BEGUN);
ok(s && s.verdict === 'resolved' && s.source === 'llm', 'E6: annex template echo skipped — the REAL marker wins');
// insight co-parse (Fable fix G2): a reply carrying BOTH keeps the verdict AND the spend.
s = call('applyElementJudge', '@INSIGHT_SPENT\n@ELEMENT_JUDGE{"el":"outline-body-1-topic-q3","verdict":"resolved"}', TOLD, { verdict: null }, BEGUN);
ok(s && s.verdict === 'resolved' && s.insightSpent === true, 'G1: insight + verdict co-parsed (verdict never lost)');
warns.length = 0;
s = call('applyElementJudge', 'Did you know Dickens serialised his novels?', TOLD, { verdict: null }, BEGUN);
ok(warns.some(w => /INSIGHT_SPENT/.test(w)), 'G2: "Did you know" without @INSIGHT_SPENT → warn-net fires (no auto-debit)');
ok(s && !s.insightSpent, 'G3: …and no spend is recorded (false debit is the worse error)');

// ═══ G. WALLET ════════════════════════════════════════════════════════════════════════════════
let w = call('_ladderWallet', [stamp(el1, 'resolved', { insightSpent: true }), { role: 'assistant', content: 'k', ladder: { el: 'e2', kind: 'insight', question: 'q3', runId: RUN() } }], 'q3');
ok(w.used === 2 && w.left === 2 && w.subCapLeft === 0, 'W1: verdict-riding spend + kind:insight both count; sub-cap 1/question exhausted');
w = call('_ladderWallet', [{ role: 'assistant', content: 'k', ladder: { el: 'e', kind: 'insight', question: 'q2', runId: 'r-old' } }], 'q3');
ok(w.used === 1 && w.subCapLeft === 1, 'W2: cross-question spend counts to ceiling, not this question\'s sub-cap (and survives reload)');

// ═══ H. DETERMINISTIC PRE-CHECK ═══════════════════════════════════════════════════════════════
const pc = (m) => call('_ladderPrecheck', m);
ok(pc('').verdict === 'failed' && !pc('').idkPending, 'H1: empty → failed (no idk gate)');
ok(pc('idk.').idkPending === true, 'H2: bare "idk." → failed + idkPending');
ok(pc("I don't know").idkPending === true, 'H3: bare IDK → idkPending');
ok(pc("dunno, maybe the writer is angry at the city?").verdict === null, 'H4: IDK + content = ATTEMPT (not swallowed — §4.4a)');
ok(pc('what do you mean').idkPending === true, 'H5: confusion family → idkPending');
ok(pc('???').idkPending === true, 'H6: bare ??? → confusion');
ok(pc('Not sure — maybe anger?').verdict === null, 'H7: hedge + content = attempt');
ok(pc('**I don\'t know**').idkPending === true, 'H8: markdown-wrapped IDK still caught (byte-pair rule)');
ok(pc('The writer uses a metaphor to suggest decay').verdict === null, 'H9: real answer → null (LLM judges)');
ok(pc('Explain further').idkPending === true, 'H10: struggle-menu "Explain further" → free-tier help, no climb, no LLM judge');
ok(pc('Ask me more questions').idkPending === true, 'H11: struggle-menu "Ask me more questions" → same gate');

// ═══ P1. AQA LANGUAGE PAPER 1 (v7.20.208 port — paper config + registries + walk arms) ════════
// REAL lesson state (staging shortcode, verified 2026-07-19: board="aqa"
// text="aqa_lang_paper_1" subject="language" topic="1", NO marks attr). At runtime the
// subject resolves to the paper-style family form — the fixture uses 'language_p1' so the
// gate's normalisation leg is exercised, never a designed-state literal.
sandbox.state.subject = 'language_p1'; sandbox.state.marks = 0; sandbox.state.question = '';
function p1Doc(filled) {
  filled = filled || {};
  const rows = [];
  for (let i = 1; i <= 2; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) {
    const fid = `outline-body-${i}-${s}-q2`; rows.push({ fieldId: fid, text: filled[fid] || '' });
  }
  for (let i = 1; i <= 2; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) {
    const fid = `outline-body-${i}-${s}-q3`; rows.push({ fieldId: fid, text: filled[fid] || '' });
  }
  for (let i = 1; i <= 3; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) {
    const fid = `outline-body-${i}-${s}`; rows.push({ fieldId: fid, text: filled[fid] || '' });
  }
  rows.push({ fieldId: 'outline-intro-thesis-q4', text: filled['outline-intro-thesis-q4'] || '' });
  rows.push({ fieldId: 'outline-conclusion-thesis', text: filled['outline-conclusion-thesis'] || '' });
  return rows;
}
// Registry dispatch: the SAME qKey resolves to the paper's own shape.
const p1q2 = call('_ladderRegistry', 'q2').map(e => e.el);
ok(p1q2.includes('outline-body-1-topic-q2') && p1q2.includes('q2-technique-p1') && !p1q2.includes('q2-overall-difference'),
   'P1-R1: subject language_p1 → q2 registry is the P1 TTECEA shape (not P2 inference)');
const p1q3 = call('_ladderRegistry', 'q3').map(e => e.el);
ok(p1q3.includes('q3-feature-p1') && !p1q3.includes('outline-body-3-topic-q3'),
   'P1-R2: P1 q3 = structural-feature synthetic, 2 paragraphs only');
const p1q4 = call('_ladderRegistry', 'q4').map(e => e.el);
ok(p1q4.includes('q4-concepts') && p1q4.includes('q4-technique-b1') && p1q4.includes('outline-body-1-topic')
   && p1q4.includes('outline-intro-thesis-q4') && p1q4.includes('outline-conclusion-thesis'),
   'P1-R3: P1 q4 = concepts + per-body technique synthetics + unsuffixed bodies + mixed-convention frame');
ok(call('_ladderQuestionOrder').join(',') === 'q2,q3,q4',
   'P1-R4: P1 question order ends at q4 — Q5 (creative writing) OUTSIDE the ladder by ruling');
sandbox.state.subject = 'language2';
ok(call('_ladderRegistry', 'q2').map(e => e.el).includes('q2-overall-difference'),
   'P1-R5: subject back to language2 → P2 registry again (dispatch is live, no cross-paper bleed)');
sandbox.state.subject = 'language_p1';
// Walk arms on the whole-paper P1 doc:
mkDoc(p1Doc());
let stP = call('deriveLadderState', []);
ok(stP && stP.el === 'outline-body-1-topic-q2' && stP.question === 'q2' && stP.rung === 1,
   'P1-A1: REAL P1 state + fresh whole-paper doc → ladder LIVE, Q2 first el, L1');
mkDoc(p1Doc({ 'outline-body-1-topic-q2': 'their concept' }));
stP = call('deriveLadderState', []);
ok(stP && stP.el === 'q2-technique-p1', 'P1-A2: topic filled → technique synthetic gates');
const p1q2Done = {};
for (let i = 1; i <= 2; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) p1q2Done[`outline-body-${i}-${s}-q2`] = 'done';
mkDoc(p1Doc(p1q2Done));
stP = call('deriveLadderState', [stamp('q2-technique-p1', 'resolved'), stamp('q2-technique-p2', 'resolved')]);
ok(stP && stP.el === 'outline-body-1-topic-q3' && stP.question === 'q3',
   'P1-A3: Q2 fully planned → walk crosses into Q3 (structure)', stP && `${stP.el}/${stP.question}`);
const p1q3Done = Object.assign({}, p1q2Done);
for (let i = 1; i <= 2; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) p1q3Done[`outline-body-${i}-${s}-q3`] = 'done';
mkDoc(p1Doc(p1q3Done));
stP = call('deriveLadderState', [stamp('q2-technique-p1', 'resolved'), stamp('q2-technique-p2', 'resolved'),
  stamp('q3-feature-p1', 'resolved'), stamp('q3-feature-p2', 'resolved')]);
ok(stP && stP.el === 'q4-concepts' && stP.question === 'q4',
   'P1-A4: Q3 done → Q4 concepts beat active (evaluation opens on the stamp beat)', stP && stP.el);
const p1q4Done = Object.assign({}, p1q3Done);
for (let i = 1; i <= 3; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose']) p1q4Done[`outline-body-${i}-${s}`] = 'done';
p1q4Done['outline-intro-thesis-q4'] = 'thesis';
mkDoc(p1Doc(p1q4Done));
const p1Stamps = [stamp('q2-technique-p1', 'resolved'), stamp('q2-technique-p2', 'resolved'),
  stamp('q3-feature-p1', 'resolved'), stamp('q3-feature-p2', 'resolved'),
  stamp('q4-concepts', 'resolved', { question: 'q4' }), stamp('q4-technique-b1', 'resolved', { question: 'q4' }),
  stamp('q4-technique-b2', 'resolved', { question: 'q4' }), stamp('q4-technique-b3', 'resolved', { question: 'q4' })];
stP = call('deriveLadderState', p1Stamps);
ok(stP && stP.el === 'outline-conclusion-thesis' && stP.question === 'q4',
   'P1-A5: Q4 bodies+intro filled → conclusion active (bodies→frame order holds)', stP && stP.el);
p1q4Done['outline-conclusion-thesis'] = 'synthesis';
mkDoc(p1Doc(p1q4Done));
stP = call('deriveLadderState', p1Stamps);
ok(stP && stP.done === true, 'P1-A6: every laddered element filed → done (Q5 scene spine never blocks it)');
// A P1 doc holding ONLY the Q5 scene rows (deferred-to-Story-Steps shape) → dormant, never done.
warns.length = 0;
mkDoc(['hook', 'setup', 'reaction', 'epiphany', 'proaction', 'climax', 'denouement'].map(s => ({ fieldId: `plan-scene-Q5-${s}`, text: '' })));
ok(call('deriveLadderState', []) === null, 'P1-A7: scene-rows-only doc → dormant (CW outside the ladder), never done-on-empty');
ok(warns.some(w => /no outline boxes/.test(w)), 'P1-A8: …and warns loudly');
sandbox.state.subject = 'language2';

// ═══ LIT. AQA LITERATURE (v7.20.229 port — essay family, three-arc walk) ══════════════════════
// REAL lesson state (staging post 42392, verified 2026-07-20: board="aqa"
// text="romeo_and_juliet" subject="shakespeare" topic="1" phase="redraft" task="planning").
// The fixture uses 'shakespeare' — the real value, never a designed-state literal.
sandbox.state.subject = 'shakespeare'; sandbox.state.marks = 0; sandbox.state.question = '';
function litDoc(filled) {
  filled = filled || {};
  const rows = [];
  for (let i = 1; i <= 3; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose', 'context']) {
    const fid = `outline-body-${i}-${s}`; rows.push({ fieldId: fid, text: filled[fid] || '' });
  }
  for (const s of ['thesis', 'hook', 'building']) rows.push({ fieldId: `outline-intro-${s}`, text: filled[`outline-intro-${s}`] || '' });
  for (const s of ['thesis', 'concept', 'purpose', 'message']) rows.push({ fieldId: `outline-conclusion-${s}`, text: filled[`outline-conclusion-${s}`] || '' });
  return rows;
}
// Registry dispatch + shape:
const litBodies = call('_ladderRegistry', 'bodies').map(e => e.el);
ok(litBodies.includes('outline-body-1-context') && litBodies.includes('lit-technique-b1')
   && !litBodies.includes('q4-aspects') && !litBodies.includes('outline-body-1-topic-q3'),
   'LIT-R1: subject shakespeare → bodies registry = TTECEA+C incl. context row (not a lang shape)');
ok(call('_ladderQuestionOrder').join(',') === 'bodies,intro,conclusion',
   'LIT-R2: lit walk order = bodies → intro → conclusion (bodies-first ruling)');
const litIntro = call('_ladderRegistry', 'intro').map(e => e.el);
ok(litIntro.join(',') === 'lit-overarching-concept,lit-working-thesis,outline-intro-thesis,outline-intro-hook,outline-intro-building',
   'LIT-R3: intro arc = b6 synthesis synthetics then b7 thesis→hook→building (planning-beat order)');
// Gate family test:
sandbox.state.subject = 'literature';
ok(call('deriveLadderState', []) === null, 'LIT-G1: bare "literature" subject stays dormant (no real lesson carries it)');
sandbox.state.subject = 'modern_text';
ok(call('_ladderQuestionOrder').join(',') === 'bodies,intro,conclusion', 'LIT-G2: modern_text joins the essay family (router map)');
// ── EDUQAS 19th-CENTURY leg (v7.20.235 — the first recipe-driven lit-family port) ─────────────
// Real convention (verified 2026-07-20): the parallel AQA christmas_carol lesson carries
// subject="19th_century"; the eduqas modern lesson carries board="eduqas" — so an eduqas 19th-c
// lesson is board="eduqas" subject="19th_century" (router eduqas+19th_century → literature dir).
// _ladderActive board-gates; the port widened it to admit ONLY eduqas 19th-c so the sibling eduqas
// subjects (shakespeare/modern — routed elsewhere, no b-ladder yet) can't silently enable.
sandbox.state.board = 'eduqas'; sandbox.state.subject = '19th_century'; sandbox.state.marks = 0; sandbox.state.question = '';
ok(call('_ladderQuestionOrder').join(',') === 'bodies,intro,conclusion',
   'LIT-EDU1: eduqas 19th_century → lit essay family (board-agnostic registry + order)');
mkDoc(litDoc());
let stEdu = call('deriveLadderState', []);
ok(stEdu && stEdu.el === 'outline-body-1-topic' && stEdu.question === 'bodies' && stEdu.rung === 1,
   'LIT-EDU2: eduqas 19th-c planning + fresh lit doc → ladder LIVE, body-1 topic first, L1', stEdu && stEdu.el);
sandbox.state.subject = 'shakespeare';
ok(call('deriveLadderState', []) === null,
   'LIT-EDU3: eduqas Shakespeare (no b-ladder ported) → dormant (sibling never silently enabled)');
sandbox.state.subject = 'modern_text';
ok(call('deriveLadderState', []) === null,
   'LIT-EDU4: eduqas modern_text (routes to eduqas/modern, no ladder) → dormant');
sandbox.state.board = 'edexcel'; sandbox.state.subject = '19th_century';
ok(call('deriveLadderState', []) === null,
   'LIT-EDU5: edexcel 19th_century (not yet ported) → dormant (board-scoped gate holds)');
sandbox.state.board = 'aqa';
sandbox.state.subject = 'shakespeare';
// Walk arms:
mkDoc(litDoc());
let stL = call('deriveLadderState', []);
ok(stL && stL.el === 'outline-body-1-topic' && stL.question === 'bodies' && stL.rung === 1,
   'LIT-A1: REAL lit state + fresh doc → ladder LIVE, body-1 topic first, L1');
mkDoc(litDoc({ 'outline-body-1-topic': 'their concept' }));
stL = call('deriveLadderState', []);
ok(stL && stL.el === 'lit-technique-b1', 'LIT-A2: topic filled → technique synthetic gates');
const litBodiesDone = {};
for (let i = 1; i <= 3; i++) for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose', 'context']) litBodiesDone[`outline-body-${i}-${s}`] = 'done';
const litTechStamps = [stamp('lit-technique-b1', 'resolved', { question: 'bodies' }),
  stamp('lit-technique-b2', 'resolved', { question: 'bodies' }), stamp('lit-technique-b3', 'resolved', { question: 'bodies' })];
mkDoc(litDoc(litBodiesDone));
stL = call('deriveLadderState', litTechStamps);
ok(stL && stL.el === 'lit-overarching-concept' && stL.question === 'intro',
   'LIT-A3: bodies arc complete → intro arc opens on the b6 synthesis beat', stL && `${stL.el}/${stL.question}`);
// Implied resolution: a resumed doc with the refined thesis already filed never re-pins b6.
const litIntroFill = Object.assign({ 'outline-intro-thesis': 'their refined thesis' }, litBodiesDone);
mkDoc(litDoc(litIntroFill));
stL = call('deriveLadderState', litTechStamps);
ok(stL && stL.el === 'outline-intro-hook',
   'LIT-A4: refined thesis filed, b6 synthetics unstamped → implied resolved, hook active (no wedge)', stL && stL.el);
const litAllDone = Object.assign({}, litBodiesDone);
for (const s of ['thesis', 'hook', 'building']) litAllDone[`outline-intro-${s}`] = 'done';
for (const s of ['thesis', 'concept', 'purpose', 'message']) litAllDone[`outline-conclusion-${s}`] = 'done';
mkDoc(litDoc(litAllDone));
stL = call('deriveLadderState', litTechStamps.concat([
  stamp('lit-overarching-concept', 'resolved', { question: 'intro' }), stamp('lit-working-thesis', 'resolved', { question: 'intro' })]));
ok(stL && stL.done === true, 'LIT-A5: every laddered element filed → done');
// Fade across paragraphs (the point of one bodies arc):
const litFade = {};
for (const s of ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose', 'context']) litFade[`outline-body-1-${s}`] = 'done';
mkDoc(litDoc(litFade));
stL = call('deriveLadderState', [stamp('outline-body-1-topic', 'resolved', { rung: 3, question: 'bodies' })].concat(litTechStamps));
ok(stL && stL.el === 'outline-body-2-topic' && stL.base === 2 && stL.fade === true,
   'LIT-C1: body-1 topic resolved ≥L3 → body-2 topic opens L2 (fade carries across paragraphs)', stL && `${stL.el} base=${stL.base}`);
// Arc scope: high-resolves in bodies must not pace the intro arc.
mkDoc(litDoc(litBodiesDone));
stL = call('deriveLadderState', litTechStamps.concat([
  stamp('outline-body-1-evidence', 'resolved', { rung: 3, question: 'bodies' }),
  stamp('outline-body-1-analysis', 'resolved', { rung: 4, question: 'bodies' }),
  stamp('outline-body-2-evidence', 'resolved', { rung: 3, question: 'bodies' })]));
ok(stL && stL.question === 'intro' && stL.paceValve === false && stL.base === 1,
   'LIT-C2: 3 high-resolves in bodies do NOT pace the intro arc (per-question scope law)');
sandbox.state.subject = 'language2';

// ═══ IGCSE2. EDEXCEL IGCSE SPEC A LANGUAGE PAPER 2 (v7.20.704 port — Q1 essay, three-arc walk) ═══════
// REAL lesson state (staging probe page 59207, read from WML.state in a browser 2026-10-05 on v7.20.704):
// board="edexcel-igcse" subject="language_p2" text="edexcel_igcse_lang_a_paper_2" task="planning" marks=30
// question="". Doc ids are the ones that page draws: kw-focus + plan-intro/body-N/conclusion (inputField),
// outline-intro-{thesis,hook,building}-q1, outline-body-{1..3}-{six TTECEA rows, NO context}, outline-conclusion-*,
// plan-scene-Q2-* (Section B — outside the ladder by ruling).
sandbox.state.board = 'edexcel-igcse'; sandbox.state.subject = 'language_p2'; sandbox.state.marks = 30; sandbox.state.question = '';
const IG2_BODY = ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose'];
function igcse2Doc(filled) {
  filled = filled || {};
  const rows = [{ fieldId: 'kw-focus', type: 'inputField', text: filled['kw-focus'] || '' }];
  for (const p of ['plan-intro', 'plan-body-1', 'plan-body-2', 'plan-body-3', 'plan-conclusion']) rows.push({ fieldId: p, type: 'inputField', text: filled[p] || '' });
  for (const s of ['hook', 'building', 'thesis']) rows.push({ fieldId: `outline-intro-${s}-q1`, text: filled[`outline-intro-${s}-q1`] || '' });
  for (let i = 1; i <= 3; i++) for (const s of IG2_BODY) { const fid = `outline-body-${i}-${s}`; rows.push({ fieldId: fid, text: filled[fid] || '' }); }
  for (const s of ['thesis', 'concept', 'purpose', 'message']) rows.push({ fieldId: `outline-conclusion-${s}`, text: filled[`outline-conclusion-${s}`] || '' });
  for (const s of ['hook', 'setup', 'reaction', 'epiphany', 'proaction', 'climax', 'denouement']) rows.push({ fieldId: `plan-scene-Q2-${s}`, type: 'inputField', text: '' });
  return rows;
}
// Registry dispatch + shape:
ok(call('_ladderPaperKey') === 'igcse2', 'IG2-R1: board edexcel-igcse + language_p2 → paper key igcse2 (board first — AQA shares the subject)');
const ig2Bodies = call('_ladderRegistry', 'bodies').map(e => e.el);
ok(ig2Bodies.length === 21 && ig2Bodies.includes('igcse2-technique-b1') && ig2Bodies.includes('outline-body-3-purpose')
   && !ig2Bodies.some(e => /context/.test(e)) && !ig2Bodies.includes('lit-technique-b1'),
   'IG2-R2: bodies = 3 × (six TTECEA rows + technique stamp), NO context row (4EA1/02 = AO1+AO2), own technique el', ig2Bodies.length);
ok(call('_ladderQuestionOrder').join(',') === 'bodies,intro,conclusion', 'IG2-R3: walk order = bodies → intro → conclusion');
ok(call('_ladderRegistry', 'intro').map(e => e.el).join(',') === 'outline-intro-thesis-q1,outline-intro-hook-q1,outline-intro-building-q1',
   'IG2-R4: intro arc = -q1 thesis → hook → building (B.6 working thesis files into the thesis box B.7 refines)');
sandbox.state.board = 'aqa';
ok(call('_ladderPaperKey') === 'p2' && call('_ladderRegistry', 'q2').map(e => e.el).includes('q2-overall-difference'),
   'IG2-R5: same subject on AQA → AQA P2 registry (no cross-board bleed)');
sandbox.state.board = 'edexcel-igcse';
// Gates:
mkDoc(igcse2Doc());
let stI = call('deriveLadderState', []);
ok(stI && stI.el === 'outline-body-1-topic' && stI.question === 'bodies' && stI.rung === 1,
   'IG2-A1: REAL IGCSE P2 state + fresh doc → ladder LIVE, body-1 topic first, L1', stI && `${stI.el}/${stI.question}`);
sandbox.state.board = 'edexcel_igcse';
stI = call('deriveLadderState', []);
ok(stI && stI.el === 'outline-body-1-topic', 'IG2-G1: underscore board form (live on 3 prod IGCSE lessons) → ladder LIVE too, like the pre-chain gate');
sandbox.state.board = 'edexcel-igcse'; sandbox.state.subject = 'language_p1';
ok(call('_ladderPaperKey') === 'igcse1', 'IG2-G2: IGCSE P1 planning routes to ITS OWN registry (igcse1, v7.20.710) — never the P2 essay arcs');
sandbox.state.subject = 'language_p2'; sandbox.state.task = 'assessment';
ok(call('deriveLadderState', []) === null, 'IG2-G3: IGCSE P2 assessment → dormant (planning only)');
sandbox.state.task = 'planning';
// Walk arms:
mkDoc(igcse2Doc({ 'outline-body-1-topic': 'their concept' }));
stI = call('deriveLadderState', []);
ok(stI && stI.el === 'igcse2-technique-b1', 'IG2-A2: topic filed → the technique stamp beat gates before evidence', stI && stI.el);
mkDoc(igcse2Doc({ 'kw-focus': 'question focus confirmed' }));
stI = call('deriveLadderState', []);
ok(stI && stI.el === 'outline-body-1-topic', 'IG2-A3: kw-focus (B.2A Question Focus) filed → NOT a ladder element, walk still opens on body-1 topic');
const ig2BodiesDone = {};
for (let i = 1; i <= 3; i++) for (const s of IG2_BODY) ig2BodiesDone[`outline-body-${i}-${s}`] = 'done';
const ig2TechStamps = [1, 2, 3].map(i => stamp('igcse2-technique-b' + i, 'resolved', { question: 'bodies' }));
mkDoc(igcse2Doc(ig2BodiesDone));
stI = call('deriveLadderState', ig2TechStamps);
ok(stI && stI.el === 'outline-intro-thesis-q1' && stI.question === 'intro',
   'IG2-A4: bodies arc complete → intro arc opens on the working thesis', stI && `${stI.el}/${stI.question}`);
mkDoc(igcse2Doc(Object.assign({ 'outline-intro-thesis-q1': 't', 'outline-intro-hook-q1': 'h', 'outline-intro-building-q1': 'b' }, ig2BodiesDone)));
stI = call('deriveLadderState', ig2TechStamps);
ok(stI && stI.el === 'outline-conclusion-thesis' && stI.question === 'conclusion', 'IG2-A5: intro filed → conclusion arc opens on the restated thesis', stI && stI.el);
const ig2AllDone = Object.assign({ 'outline-intro-thesis-q1': 't', 'outline-intro-hook-q1': 'h', 'outline-intro-building-q1': 'b' }, ig2BodiesDone);
for (const s of ['thesis', 'concept', 'purpose', 'message']) ig2AllDone[`outline-conclusion-${s}`] = 'done';
mkDoc(igcse2Doc(ig2AllDone));
stI = call('deriveLadderState', ig2TechStamps);
ok(stI && stI.done === true, 'IG2-A6: every laddered element filed → done (the empty Section B scene rows never block it)');
// Fade across paragraphs + arc scope:
const ig2Fade = {};
for (const s of IG2_BODY) ig2Fade[`outline-body-1-${s}`] = 'done';
mkDoc(igcse2Doc(ig2Fade));
stI = call('deriveLadderState', [stamp('outline-body-1-topic', 'resolved', { rung: 3, question: 'bodies' })].concat(ig2TechStamps));
ok(stI && stI.el === 'outline-body-2-topic' && stI.base === 2 && stI.fade === true,
   'IG2-C1: body-1 topic resolved ≥L3 → body-2 topic opens L2 (fade carries across paragraphs)', stI && `${stI.el} base=${stI.base}`);
mkDoc(igcse2Doc(ig2BodiesDone));
stI = call('deriveLadderState', ig2TechStamps.concat([
  stamp('outline-body-1-evidence', 'resolved', { rung: 3, question: 'bodies' }),
  stamp('outline-body-1-analysis', 'resolved', { rung: 4, question: 'bodies' }),
  stamp('outline-body-2-evidence', 'resolved', { rung: 3, question: 'bodies' })]));
ok(stI && stI.question === 'intro' && stI.paceValve === false && stI.base === 1,
   'IG2-C2: 3 high-resolves in bodies do NOT pace the intro arc (per-question scope law)');
sandbox.state.board = 'aqa'; sandbox.state.subject = 'language2'; sandbox.state.marks = 12; sandbox.state.question = 'Q3';

// ═══ IGCSE1. EDEXCEL IGCSE SPEC A LANGUAGE PAPER 1 (v7.20.710 port — Q4 → Q5 → Section B) ═════════════
// REAL lesson state (staging probe page 59205, read from WML.state in a browser 2026-10-05): board="edexcel-igcse"
// subject="language_p1" text="edexcel_igcse_lang_a" task="planning" marks=30 question="". Doc ids are the page
// builder's (bin/paper-render-probe.js . edexcel-igcse language_p1 --topic=1) + the prewrite inputFields.
sandbox.state.board = 'edexcel-igcse'; sandbox.state.subject = 'language_p1'; sandbox.state.marks = 30; sandbox.state.question = '';
const IG1_BODY = ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose'];
const IG1_IUMVCC = ['intro', 'urgency', 'method-point-1', 'method-point-2', 'method-point-3', 'vision', 'counter', 'conclusion'];
function igcse1Doc(filled) {
  filled = filled || {};
  const rows = [{ fieldId: 'kw-focus', type: 'inputField', text: filled['kw-focus'] || '' }, { fieldId: 'pred-unseen', type: 'inputField', text: filled['pred-unseen'] || '' }];
  for (let i = 1; i <= 3; i++) { rows.push({ fieldId: 'plan-Q4-para-' + i, type: 'inputField', text: '' }); }
  for (let i = 1; i <= 3; i++) for (const s of IG1_BODY) { const fid = `outline-body-${i}-${s}-q4`; rows.push({ fieldId: fid, text: filled[fid] || '' }); }
  for (const p of ['intro', 'body-1', 'body-2', 'body-3', 'conclusion']) rows.push({ fieldId: 'plan-Q5-' + p, type: 'inputField', text: '' });
  for (const s of ['perspectives', 'thesis']) rows.push({ fieldId: `outline-intro-${s}-q5`, text: filled[`outline-intro-${s}-q5`] || '' });
  for (let i = 1; i <= 3; i++) for (const s of IG1_BODY) { const fid = `outline-body-${i}-${s}`; rows.push({ fieldId: fid, text: filled[fid] || '' }); }
  for (const s of ['thesis', 'purpose']) rows.push({ fieldId: `outline-conclusion-${s}`, text: filled[`outline-conclusion-${s}`] || '' });
  for (const s of IG1_IUMVCC) rows.push({ fieldId: 'outline-iumvcc-' + s, text: filled['outline-iumvcc-' + s] || '' });
  return rows;
}
ok(call('_ladderPaperKey') === 'igcse1' && call('_ladderQuestionOrder').join(',') === 'q4,q5,q6', 'IG1-R1: IGCSE P1 → paper key igcse1, walk Q4 → Q5 → Section B (Q1–Q3 never planned)');
const ig1q4 = call('_ladderRegistry', 'q4').map(e => e.el);
ok(ig1q4.length === 21 && ig1q4.includes('outline-body-3-purpose-q4') && ig1q4.includes('q4-technique-p2') && !ig1q4.some(e => /context|-q3$/.test(e)),
   'IG1-R2: Q4 = 3 × (six -q4 TTECEA rows + technique stamp), no context', ig1q4.length);
const ig1q5 = call('_ladderRegistry', 'q5').map(e => e.el);
ok(ig1q5[0] === 'q5-aspects' && ig1q5.includes('outline-intro-perspectives-q5') && ig1q5.includes('outline-conclusion-purpose')
   && !ig1q5.some(e => /hook|context|-q4$/.test(e)) && ig1q5.indexOf('outline-body-3-purpose') < ig1q5.indexOf('outline-intro-perspectives-q5'),
   'IG1-R3: Q5 = aspects → bodies → perspectives + thesis → restated thesis + purposes; no hook, no context (Neil 2026-09-15)');
const ig1q6 = call('_ladderRegistry', 'q6');
ok(ig1q6.length === 9 && ig1q6.filter(e => e.resolveBy !== 'stamp').every(e => /^outline-iumvcc-/.test(e.resolveBy)), 'IG1-R4: Section B els are synthetic and resolve to the IUMVCC rows');
mkDoc(igcse1Doc());
let st1 = call('deriveLadderState', []);
ok(st1 && st1.el === 'outline-body-1-topic-q4' && st1.question === 'q4' && st1.rung === 1, 'IG1-A1: REAL P1 state + fresh doc → ladder LIVE on Q4 paragraph 1 topic, L1', st1 && `${st1.el}/${st1.question}`);
mkDoc(igcse1Doc({ 'outline-body-1-topic-q4': 'their concept' }));
st1 = call('deriveLadderState', []);
ok(st1 && st1.el === 'q4-technique-p1', 'IG1-A2: topic filed → the technique stamp beat gates before evidence', st1 && st1.el);
const ig1Q4Done = {}; for (let i = 1; i <= 3; i++) for (const s of IG1_BODY) ig1Q4Done[`outline-body-${i}-${s}-q4`] = 'done';
const ig1Tech = [1, 2, 3].map(i => stamp('q4-technique-p' + i, 'resolved', { question: 'q4' }));
mkDoc(igcse1Doc(ig1Q4Done));
st1 = call('deriveLadderState', ig1Tech);
ok(st1 && st1.el === 'q5-aspects' && st1.question === 'q5', 'IG1-A3: Q4 planned → Q5 opens on the aspects beat', st1 && `${st1.el}/${st1.question}`);
const ig1Q5Bodies = Object.assign({}, ig1Q4Done); for (let i = 1; i <= 3; i++) for (const s of IG1_BODY) ig1Q5Bodies[`outline-body-${i}-${s}`] = 'done';
const ig1Stamps = ig1Tech.concat([stamp('q5-aspects', 'resolved', { question: 'q5' })]);
mkDoc(igcse1Doc(ig1Q5Bodies));
st1 = call('deriveLadderState', ig1Stamps);
ok(st1 && st1.el === 'outline-intro-perspectives-q5', 'IG1-A4: comparative bodies filed → the introduction opens on both writers\' perspectives (bodies first, frame last)', st1 && st1.el);
const ig1Q5Done = Object.assign({ 'outline-intro-perspectives-q5': 'p', 'outline-intro-thesis-q5': 't', 'outline-conclusion-thesis': 'r', 'outline-conclusion-purpose': 'w' }, ig1Q5Bodies);
mkDoc(igcse1Doc(ig1Q5Done));
st1 = call('deriveLadderState', ig1Stamps);
ok(st1 && st1.el === 'q6-task-analysis' && st1.question === 'q6', 'IG1-A5: Q5 complete → Section B opens on the task analysis', st1 && `${st1.el}/${st1.question}`);
const ig1All = Object.assign({}, ig1Q5Done); IG1_IUMVCC.forEach(s => { ig1All['outline-iumvcc-' + s] = 'done'; });
mkDoc(igcse1Doc(ig1All));
st1 = call('deriveLadderState', ig1Stamps.concat([stamp('q6-task-analysis', 'resolved', { question: 'q6' })]));
ok(st1 && st1.done === true, 'IG1-A6: every laddered element filed → done (Q1–Q3 point boxes never block it)');
const ig1Fade = {}; for (const s of IG1_BODY) ig1Fade[`outline-body-1-${s}-q4`] = 'done';
mkDoc(igcse1Doc(ig1Fade));
st1 = call('deriveLadderState', [stamp('outline-body-1-topic-q4', 'resolved', { rung: 3, question: 'q4' })].concat(ig1Tech));
ok(st1 && st1.el === 'outline-body-2-topic-q4' && st1.base === 2 && st1.fade === true, 'IG1-C1: paragraph-1 topic resolved ≥L3 → paragraph-2 topic opens L2 (fade across Q4 paragraphs)', st1 && `${st1.el} base=${st1.base}`);
sandbox.state.board = 'aqa';
ok(call('_ladderPaperKey') === 'p1', 'IG1-R5: same subject on AQA → AQA P1 registry (board first, no cross-board bleed)');
sandbox.state.board = 'aqa'; sandbox.state.subject = 'language2'; sandbox.state.marks = 12; sandbox.state.question = 'Q3';

// ═══ REPORT ═══════════════════════════════════════════════════════════════════════════════════
console.log(`— LADDER SIM: ${passed}/${passed + failed} behavioural assertions passed (real sliced engine, scripted sessions).`);
if (failed) { console.log(`\n❌ ladder-sim-harness FAILED — ${failed} assertion(s); the shipped state machine violates the design contract.`); process.exit(1); }
console.log('✅ ladder-sim-harness passed (climb/cap/fade/pace/IDK/resume/heals/wallet/pre-check all hold on the shipped code).');
