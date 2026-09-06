# Self-assessment reference mechanism — what exists today, read from the code

**Date:** 2026-09-06 · **Scope:** read-only survey, no files changed except this one.
**Repo:** `sophicly_writing_mastery_lab_v7_12_30` (WML), branch `main` at `ce3e7077` (v7.20.599).
**Method:** every claim below carries a `file:line`. Nothing is stated from memory. Where a search
returned nothing, the section says "not found" and names the greps that were run (root §17c: an
incomplete search is not a zero — every command below ran to completion, exit 0).

---

## THE 10-LINE SUMMARY

1. **Two self-assessment engines already exist**, both shipped, both zero-to-one API call.
2. **`_cwTrial1Ctl`** (`frontend/wml-assessment.js:29033–30179`) is the CW trial walk: 8 elements ×
   a 2-level climb → mark → evidence sentence, then ONE API turn for Sophia's own level calls.
3. **`_examinerLadderCtl`** (`frontend/wml-assessment.js:28006–28465`) is the **host-agnostic**
   mark-scheme ladder — bottom-up climb over the board's own verbatim descriptors, N levels,
   Upper/Lower bands, top/middle/bottom placement, mark derived by arithmetic. **It has no
   production caller: `open()` is invoked only by `bin/examiner-ladder-sim-harness.js:85`.**
4. Its data (`window.WML_MARK_SCHEMES`) currently holds **exactly two schemes** — AQA Lang P1 Q5
   AO5 (/24, banded) and AO6 (/16, unbanded) — `frontend/wml-markscheme-data.js:18, 366 lines total`.
5. Its ladder CARD (`renderTrialLadderInline`, `wml-assessment.js:14344–14491`) already renders
   **whatever `levels` array it is handed**, including a `descriptors` bullet list — six levels need
   no second card (`wml-assessment.js:14331–14333`).
6. **Today's assessment "confidence" is three separate things**, none of them a criteria ladder: the
   `@REFLECT_GATE` panel (1–5 self-rating + AO chips + predicted mark), the **blind SA walk**
   (`_saWalkRenderCurrent`, `wml-assessment.js:7667`) rating each skill 1–5 against `SA_DESCRIPTORS`,
   and the protocol's prose **Calibration Check** (`protocol-a-assessment.md:97–122`).
7. The blind SA walk is **AQA-only by an explicit board gate** (`_saWalkEligible`, `wml-assessment.js:7641–7644`)
   and its ratings **never touch a mark** — they feed a calibration readout and a blind-spot finder only.
8. **Mark-scheme data:** AQA Lang **P1 and P2** carry board-verbatim level descriptors in a
   builder-parseable shape (25 strict blocks each); **AQA Literature** carries 6 levels in a
   *different* shape; **every other board's `knowledge-mark-scheme.md` carries zero strict blocks**.
9. **The rulings already exist and already say to do this**: PEDAGOGY `§33.5` (scope is lang + lit),
   `§33.13` (all other assessments adapt to the examiner-walk method — "direction recorded, NOT built"),
   `§33.4`, `§33.8`, `§33.10`, `§19`.
10. **The generalisable core is `_examinerLadderCtl` + `wml-examiner-ladder.js` + the ladder card.**
    What is CW-specific is `_cwTrial1Ctl`'s element list, its taught-element descriptors, its
    `@TRIAL_*` marker contract and its document blocks.

---

# 1. THE CW TRIAL MECHANISM

## 1.1 The two controllers, and which is which

| controller | file:line | data source | API cost | live? |
|---|---|---|---|---|
| `_cwTrial1Ctl` | `frontend/wml-assessment.js:29033–30179` | `WML.CW_TRIAL1_ELEMENTS` (taught elements) | **1 call** (the marking turn) + optional rung-3 help | **yes** — task `cw_trial_1` |
| `_examinerLadderCtl` | `frontend/wml-assessment.js:28006–28465` | `window.WML_MARK_SCHEMES` (board verbatim) | **0 calls** | **no production host** (see §1.9) |

Both are registered as CW walks together:
`registerCwWalkCtls([… _examinerLadderCtl, _cwCharProfileCtl, _cwGoalsPlotCtl, _cwTrial1Ctl])`
— `wml-assessment.js:30815`.

Trial dispatch wiring for `_cwTrial1Ctl` (the seven points `bin/cw-trial1-gate.js` asserts by name):
dispatcher `wml-assessment.js:16893–16894` · revive/probe maps `16671, 16685, 16784` ·
onReply fan-out `30831` · start-miss fallback `30852` · tp export `30899` ·
fresh entry `15771–15776` · boot resume `37820` · chat-clear restart `38012`.

## 1.2 `_cwTrial1Ctl` — the exact turn sequence

Phases are stamped on `st.phase` and re-entered by `serveCurrent()` (`wml-assessment.js:30041–30055`).

| # | phase | what the student sees | tap or type | file:line |
|---|---|---|---|---|
| 0 | `forceStart` | 5 orientation chunks, **paced one bubble per `Continue →`** via `serveCwChunks` | tap | `30075–30098`, chunks at `29252–29282` |
| 1 | `goal` | *"**Before we begin: what grade are you aiming for in creative writing?**"* | 3 chips `Grade 7/8/9` | `29774–29797`; `GRADE_GOALS = [7, 8, 9]` at `29772` |
| 2 | `items` (×8) | the element ask — label · *(n of 8)* · *What it is for* · *For example* · "Find this part in your draft" · "judge it on the **Your Marking** pad" | **no chips in chat**; the level calls are on the floating pad | `askText` `29284–29310`; `serveItem` `29358–29379` |
| 2a | pad | Level 1 card only, with `Yes — all of it` / `Some of it` / `Not yet` | tap | card render `14457–14480`; model `levelsModel` `29421–29438` |
| 2b | pad | Level 2 appears **only** after Level 1 = `all`; newest on top; each judged level keeps a `Change my answer` button | tap | `levelsModel` `29434–29435`; reverse render `14409` |
| 2c | chat | *"**N out of M.** Now prove it like an examiner: **in one sentence, point at the exact moment in your draft that earns it** — quote a few of your own words."* (Level-2 branch) / *"**In one sentence — what is missing?**"* (lower branch) | **TYPE** | `serveNote` `29397–29416` |
| 3 | `marking` | *"That is all of them. Here is your marking: …"* + the self-summary, then the ONE API call | — | `serveMarking` `29541–29596` |
| 4 | (reveal) | disagreements first, **grade last and quiet**, per-element rows written to the document | — | `onMarkingReply` `29670–29764`; reveal text `29745–29756` |
| 5 | `calib` | *"**Calibration check.** You marked yourself **X out of 30**; I marked **Y** — **N marks higher/lower** than me…"* then *"which one do you think it was?"* | 3 chips = the 3 largest gaps + `Something else` | `serveCalibration` `29807–29833`; `CALIB_TOLERANCE = 2` at `29773` |
| 6 | `summary` | "**How am I going?**" (grade vs goal, AO5/AO6 split, strength, calibration verdict) then "**Where to next?**" | paced 2 chunks | `serveSummary` `29856–29882` |
| 7 | `target` | *"**Last thing, and it matters most: your one target for Draft 2, in your own words.**"* | **TYPE** | `serveTargetAsk` `29931–29944` |
| 8 | `done` | wrap + `Change my answers →` | tap | `serveWrap` `30057–30070`; `onChangeAnswers` `29959–29965` |

**Tap vs type, exactly.** Tapped: grade goal, every level verdict, the calibration attribution, all
retry/change chips. Typed: the per-element evidence/target sentence (8 of them), the closing Draft-2
target. That is 2 typed kinds and everything else a tap.

**Pacing.** Every multi-bubble run goes through `serveCwChunks(chunks, opts)` (`19488`), never a run
of bare `aiBubble()` — the WML §4b law. `deferFirst` is used on resume so a re-entry re-attaches the
chip for the NEXT chunk rather than re-emitting (`29376`, `29784`, `29817`, `29830`, `29881`).

**Serial.** One element on screen at a time (`serveItem` reads `st.i`, `29358–29362`); one LEVEL on
screen at a time (`levelsModel`'s `show = show && verdict === 'all'`, `29435`).

**The help ladder** (WML §4c.9), attached to every ask by `helpBar(e)` (`29158–29188`):
1. `Marking levels` — reopens/refills the pad (free) — `29166–29169`
2. `More examples` — ONE further worked example per tap from `e.more` (free) — `29170–29176`, `serveMoreExample` `29191–29202`
3. `My Plot` — clicks `.swml-mv-trigger` (free) — `29177–29182`
4. `Still stuck — ask Sophia` — class `swml-cw-help-last`, **the only API call in the item loop** — `29183–29186`, `askSophia` `29204–29242`

## 1.3 Where the criteria, levels and marks come from

**Elements:** `els()` returns `WML.CW_TRIAL1_ELEMENTS || WML.CW_SCENE_ELEMENTS` (`29067`).

- `CW_SCENE_ELEMENTS` — `frontend/wml-core.js:1369–1445`, **7 entries**: `hook`, `setup`, `reaction`,
  `epiphany`, `proaction`, `climax`, `denouement`.
- `CW_TRIAL1_ACCURACY` — `wml-core.js:1454–1467`, the 8th: `{ id: 'accuracy', label: 'Technical
  Accuracy', outOf: 2, ao: 'AO6', l1: …, strong: …, example: …, more: [2] }`.
- `CW_TRIAL1_ELEMENTS = CW_SCENE_ELEMENTS.concat([CW_TRIAL1_ACCURACY])` — `wml-core.js:1468`; exported
  at `wml-core.js:5523`.

**Element record shape** (from `hook`, `wml-core.js:1370–1384`):

```
{ id, planFid, label, prompt, strong, example, more: [2 strings], outOf?, ao?, l1? }
```

- `prompt` = what the element is for → **becomes Level 1** unless the element states its own `l1`
  (`l1Body`, `wml-assessment.js:29522–29525`).
- `strong` = what a strong one does → **is Level 2** verbatim (`l2Body`, `29526`).
- `example` = the inline worked example (help rung 0); `more` = rung 1's pool.
- `planFid` = the Step-9 row the student's own plan lives in, read via `_cwDocValue('scene_selection', e.planFid)`
  (`planLine`, `29245–29249`). **Background only — never the thing being judged** (`29216–29223`,
  gated by `bin/cw-trial-judges-the-draft-gate.js`).

**Levels and marks — all derived, no constants:**

```js
const MARKS = { none: 0, l1_low: 1, l1_top: 2, l2_low: 3, l2_top: 4 };   // 29045
const LEVEL_DEFS = [{ n:1, label:'Level 1', range:'1 to 2 marks' },
                    { n:2, label:'Level 2', range:'3 to 4 marks' }];      // 29058–29061
function outOf(e)    { return (e && e.outOf) || 4; }                      // 29069
function perLevel(e) { return outOf(e) / 2; }                             // 29070
```

`levelDefs(e)` rewrites the printed range for a 1-mark level (`29071–29077`); `tokenMark(e, tok)`
collapses `l1_low|l1_top` → 1 and `l2_*` → 2 for a 2-mark element (`29080–29084`); `markPhrase`
prints the /2 wording for accuracy (`29085–29088`). **The /30 is a sum, not a number** (`29064–29066`,
`markFrom` `29640–29647`).

`markFromLevels(e)` is the whole arithmetic (`29504–29514`): `L1 not`→0 · `L1 some`→1 ·
`L1 all + L2 not`→p · `L1 all + L2 some`→p+1 · `L1 all + L2 all`→2p, where p = `perLevel(e)`.
Grade comes from the ONE canonical ladder `_ladderGrade(pct)` (`wml-assessment.js:9258–9261`,
9≥85 · 8≥75 · 7≥65 · 6≥55 · 5≥45 · 4≥35 · 3≥25 · 2≥15 · else 1).

**Re-judging drops everything above it** — `onLevelPick` `29479–29480`, `onLevelRevise` `29491–29503`.

## 1.4 The ladder card (the control surface)

- Model setter `setTrialLadderModel(model)` — `wml-assessment.js:14340–14343`.
- Renderer `renderTrialLadderInline()` — `14344–14491`; exported as `window.WML.renderTrialLadderUI`
  at `14492`; re-fired on every NodeView remount from `frontend/wml-section-block.js:695–696`.
- Target: `.swml-ladder-pad .swml-ladder-ui` first, falling back to an in-document
  `[data-section-type="ladder"]` (`14350–14356`).
- Breaker-guarded like every derived card: `_derivedCardFillOk('ladder')` at `14345`
  (`_derivedCardFillOk` at `14282`).
- **Idle state is spoken, never blank** (`14359–14369`) — §4d.
- **N levels by construction** — the comment at `14331–14333` states it explicitly: *"The card renders
  whatever `levels` it is handed — two for a CW trial's taught-element bars, six for a literature mark
  scheme — so the lit/lang adoption (PEDAGOGY §33.13) needs no second card."*
- It already accepts `lv.descriptors` (an array → `<ul class="swml-ladder-descriptors">`) as well as
  `lv.text` (`14441–14454`). **`_cwTrial1Ctl` only ever sets `text`** (`levelsModel`, `29429`); the
  descriptor path is used by nothing today (grep `descriptors:` in `wml-assessment.js` → only `28293`,
  `28182`, `28204`, which are `_examinerLadderCtl`'s engine steps, not this model).
- Per-level verdict chips: `[['all','Yes — all of it'], ['some','Some of it'], ['not','Not yet']]`,
  filtered by an optional `lv.verdicts` allow-list (`14460–14462`).

**The pads** (both are `.swml-extract-panel`, appended to `<body>`, drag + 8-way resize via
`_makePanelInteractive`, `wml-assessment.js:36054`):
- `_openLadderPadHook` / `_closeLadderPadHook` — `35989–36015`; title **"Your Marking"**; CSS
  `frontend/wml-canvas.css:16416–16428`.
- `_openTrialDraftPadHook` — `35932–35978`; title **"Your draft"**; clones the read-only draft section,
  prose only; fails loud to the student when the draft is absent (`35965–35971`).
- Hook declarations at `wml-assessment.js:7636–7640`.

## 1.5 How each answer is banked

**Document rows.** Everything is an `outlineRow` / `inputField` addressed by a literal `fieldId`.
`fid(id) => 'cw-trial-1-' + id` (`29068`); writes go through
`writeRow(f, text, {replace:true})` → `_writeOutlineRowField` (`wml-assessment.js:3571`) → `saveCanvasContent()`.

| row fieldId | written by | content | editable? |
|---|---|---|---|
| `cw-trial-1-goal` | `onGoalPick` `29795` | `Grade 7\|8\|9` | student's section |
| `cw-trial-1-<elementId>` (×8) | `bankMark` `29528–29530` | `N/M — <their sentence>` | student's section |
| `cw-trial-1-fb-<elementId>` (×8) | `onMarkingReply` `29715–29720` | `<markPhrase> — <her comment> For example: "<rewrite>"` | **locked** |
| `cw-trial-1-strength` | `29734` | Key Strength | **locked** |
| `cw-trial-1-priority` | `29735` | Priority for Draft 2 | **locked** |
| `cw-trial-1-mark` | `29737` | `Grade N (got/max · pct%) for story coherence` | **locked** |
| `cw-trial-1-gap` | `29739–29741` | the disagreement list, flattened | **locked** |
| `cw-trial-1-target` | `onTarget` `29947` | the student's own sentence | editable |

Document section producers (ONE producer used by both template and heal):
`_cwTrial1AboutHTML` `53495–53499` · `_cwTrial1JudgementBlock` `53505–53515` ·
`_cwTrial1SophiaBlock` `53516–53534` · `_cwTrial1TargetBlock` `53540–53545` ·
`_cwTrialDraftInner` `53548–53560` (`CW_TRIAL_DRAFT_LABEL = 'Your Draft'`, `53547`).
Assembled at `51548–51553`. Sophia's sections are `'response'`-typed, never `'feedback'`-typed —
stated at `53489–53491`, asserted by `bin/cw-trial1-gate.js`.

**Chat turn durability** — all three writers pass `durable: true` with a `why` (WML §4c.7 fossil law):
`aiBubble` `29106` · `userTurn` `29110` · `pickTurn` `29115` · the two hidden context turns
`29224`, `29587`. A resume re-serve is DRAWN not saved (`_cwIsReplay()` guard, `29105`).

**Sidecar (localStorage).** Key = `CANVAS_SAVE_KEY() + '_trial1'`, fallback `'swml_trial1'`
(`lsKey`, `29090–29095`). Payload `{ st, active, done }` (`persist`, `29096–29098`).
`st` = `{ i, levels, marks, notes, moreSpent, phase, awaitNote, gradeGoal, calibPick, sophia,
sophiaComments, sophiaExamples, mark, selfTotal, strengthLine, priorityLine, target }`.
**The DOCUMENT is the authority on position** — `deriveFromDoc()` (`30007–30039`) re-parses
`^([0-4])\s*/\s*([24])` out of each row and wins over the sidecar counter (`30133–30134`).

**Student-data / dashboard.** Two paths:
1. `saveTrialResult(opts)` — `29903–29925` → `WML.cwProject.saveTrial(projectId, payload, 1)`
   (`wml-core.js:3337–3342`) → REST → `SWML_Session_Manager::save_trial_result`
   (`includes/class-session-manager.php:564–588`), which appends to `$project['trials'][]`, pushes
   `calibration_delta` onto `$project['calibration_trend'][]`, and fires
   `do_action('sophicly_cw_trial_saved', …)` (`585`). **That action has zero listeners** — stated in
   the source at `wml-assessment.js:29757–29759` and `29885`.
   Payload fields: `trial, dimension:'story_coherence', ao_family:'AO5+AO6', self, sophia, notes,
   self_total, marks, out_of, percent, grade, target, timestamp` + optional `sophia_comments,
   sophia_examples, grade_goal, calibration_pick, calibration_delta` (`29907–29921`).
   Called twice: `withDelta:true` at reveal (`29762`), `withDelta:false` after the target (`29952`).
2. **The path that actually reaches `session_records.grade`** — `publishTrialScore()`
   (`29891–29902`) sets `state.cwTrialScore`, and the canvas-save body spreads it in at
   `wml-assessment.js:59374–59389`: `score_raw, score_max, score_percentage, grade_equivalent,
   strength_1, target_1, target_2, cw_project_id`. Gated to `snap.task.startsWith('cw_trial_')`
   **and** matching task **and** matching project id.

## 1.6 How Sophia's marking uses the self-assessment

**She sees it.** `serveMarking()` sends the student's own marks in the hidden context:
`'\n\nWHAT THE STUDENT DECIDED ABOUT THEIR OWN DRAFT (their marks out of 4, with their evidence):\n'
+ selfSummary()` — `wml-assessment.js:29584`; `selfSummary()` at `29533–29539` emits
`- <Label>: <mark>/<outOf> — <their note>` per element.

She is also handed the two level descriptors per element (`29585–29586`) and is **explicitly forbidden
from stating any number**: *"Do NOT give a mark, a score, a number out of 4, 2, 28 or 30, a percentage
or a grade anywhere in your prose — the marks are worked out from your level calls by the system, not
by you."* (`29580–29583`; the same prohibition in the protocol at
`protocols/shared/creative-writing/CW-TRIAL-01-story-coherence.md:27–29`).

**Marker contract** (`29570–29579`, mirrored in the protocol at `CW-TRIAL-01…md:55–70`):

```
@TRIAL_VERDICT[<id>=none|l1_low|l1_top|l2_low|l2_top]  <one-sentence comment>
@TRIAL_EXAMPLE[<id>]  <2–3 sentences of their own moment rewritten at Level 2>
@TRIAL_STRENGTH[element_id] …
@TRIAL_PRIORITY[element_id] …
```
(accuracy uses `none|l1|l2`.) `parseVerdicts` at `29602–29639` — the verdict regex deliberately uses
`[^\S\n]*` and the comment explains why (`29608–29610`).

**All-or-nothing:** a mark is filed only when every element's verdict parses (`29686–29697`);
otherwise it fails loud to the student with a `Give me my marks →` retry chip and **no partial mark**.
Comments / examples / strength / priority are best-effort with a `console.warn` (`29702–29704`,
`29732–29733`).

**The calibration delta — where it is computed:**

```js
function calibDelta() { return (st.selfTotal || 0) - ((st.mark && st.mark.got) || 0); }   // 29799
function gapElements() { … abs(self − sophia) per element, filtered >0, sorted desc }      // 29800–29806
```
`CALIB_TOLERANCE = 2` (`29773`, comment: *"P1 uses ±3 on /40; /30 → ±2"*). Within tolerance → a
statement (`29814–29818`); outside → the direction-adaptive question with the 3 largest gaps as chips
(`29820–29832`), answered with her comment + her Level-2 rewrite + the over/under-marking habit
(`onCalibPick`, `29834–29855`). The per-element disagreement list is `agreementLine(hers)` (`29658–29668`),
written to `cw-trial-1-gap` and led with in the reveal.

**Order of operations is the design** (PEDAGOGY §33.8): all 8 student marks are banked before the API
is called at all — `serveMarking()` is only reached when `st.i >= els().length` (`29361`, `30053`).

## 1.7 Gates and harnesses protecting the trial

All wired into `bin/pre-ship-check.sh`.

| gate | lines | trigger | asserts (headline) |
|---|---|---|---|
| `bin/cw-trial1-gate.js` | 380 | `pre-ship-check.sh:445–446` | the 7 elements exist in scene order · each names its Step-9 `planFid` as a **literal** key (§5d) · every element has `strong` + `example` + 2 `more` · **no insider words** · **never asks for the draft** (paste-wall) · the model may not state a mark · all 8 marker lines + strength/priority · rows are BUILT FROM the element list not hand-typed · Sophia's rows are LOCKED and `response`-typed · target row editable and healed in · **the 7 wiring points by name** |
| `bin/cw-trial1-sim-harness.js` | 727 | `pre-ship-check.sh:447` | slices the REAL `_cwTrial1Ctl` and drives it on `walk-sim-lib` with the REAL elements + REAL `_ladderGrade`. Ten contracts, headed at `1–20`: student marks first · **ONE API call** · serial · ask teaches before it asks · plan shown never requested · help ladder doesn't destroy the ask · mark is code's · reveal words-first grade-last · a missing marker files nothing · resume lands on the exact element AND level. Liveness (§4d) is checked automatically inside `say()`/`tap()` with no opt-out |
| `bin/cw-trial-seed-gate.js` | 264 | `pre-ship-check.sh:434–435` | the trial→draft link is DERIVED (re-run after MOVING a trial) · the draft copy is FRESH not cached (#402) · READ-ONLY · **not** flagged `student-composition` (double word count) · missing draft is named, never a blank box |
| `bin/cw-trial-judges-the-draft-gate.js` | 123 | (grep of `pre-ship-check.sh` shows **no** invocation line — see "not found" below) | Trial 1 marks Step 10 / draft_1 · the "What you planned in Step 9" heading is gone · the stuck-help context names the DRAFT as the thing judged |
| `bin/examiner-ladder-harness.js` | 173 | `pre-ship-check.sh:557` (unconditional) | direction (bottom-up) · the stop · the arithmetic incl. round-DOWN on ambiguity · bands only where the board prints them · resume · liveness |
| `bin/examiner-ladder-sim-harness.js` | 314 | `pre-ship-check.sh:563–564` | the climb is bottom-up · stops where they stop · short-circuits · per-criterion pass is serial · the mark is the board's own number read off the screen · reason banked verbatim on a `rewrite` cycle · resume lands on the exact criterion · **zero API** · every descriptor on screen is verbatim from the dataset |
| `bin/markscheme-gate.js` | 143 | `pre-ship-check.sh:535` (unconditional) | 4 independent axes vs a raw re-read of the source: FRESHNESS (sha1) · VERBATIM · **COMPLETENESS (bullet count — the §14c truncation defect)** · ARITHMETIC (ranges exist, bands partition, levels tile 1..maxMarks) |

**Not found:** `bin/cw-trial-judges-the-draft-gate.js` has no invocation in `bin/pre-ship-check.sh`.
Grep run: `grep -nE 'trial|ladder|markscheme' bin/pre-ship-check.sh` (exit 0, 20 matching lines, listed
above) — the file name does not appear. It is runnable by hand but is not in the ship gate.

## 1.8 The trial's protocol file

`protocols/shared/creative-writing/CW-TRIAL-01-story-coherence.md` (86 lines). It is a **restraint
document**, not a script: §"⛔ YOU DO NOT RUN THIS LESSON" (`15–32`) forbids the model from asking for
the draft, walking the elements, inventing a scale, or stating a number. Its two jobs are the stuck-help
turn (`34–39`) and the marking turn with the marker block (`41–75`). Trials 2–6 exist but are stubs
(`CW-TRIAL-02…md` 1020 bytes down to `CW-TRIAL-05…md` 928 bytes, vs Trial 1's 5351).
Router mapping: `includes/class-protocol-router.php:2136` (`'cw_trial_1' => 'CW-TRIAL-01-story-coherence.md'`)
and titles at `:3244`.

## 1.9 `_examinerLadderCtl` — the host-agnostic ladder that is built but unhosted

Header comment, `wml-assessment.js:27976–28005`, states the design intent verbatim:
*"HOST-AGNOSTIC BY DESIGN. Neil wants this beyond creative writing — 'not just about the creative
writing, but actually about language and literature as well' — so nothing here knows what a trial is.
A host calls `open({...})` with a scheme key, the field ids to bank into, and a done-callback.
Adding a board or a paper is then a DATA job: a new entry in the generated mark-scheme dataset, no new
code."*

**The contract:**
```js
open({ schemeKey, aoName, walkId, fids: { level, band, met, reason, mark }, onDone })   // 28384–28411
```

**Its step machine** (`serveCurrent`, `28367–28379`) is driven entirely by the pure engine's
`next(scheme, state)`:

| step | question served | chips | file:line |
|---|---|---|---|
| `climb` | `**Level N — <name>** *(min–max marks)*` + the strand-grouped descriptor bullets + **"Have you met every one of these in your writing?"** | `Yes — all of them` / `Not all of them` | `serveClimb` `28165–28177`; labels `28124–28125` |
| `which` | serial per-criterion: `*(k of n)*` + `> <descriptor>` + **"Did your writing do that?"** | `Yes, I met this one` / `Not this one` | `serveWhich` `28179–28196`; labels `28126–28127` |
| `band` | both halves printed with their ranges + **"Which half is your writing in?"** | the band names | `serveBand` `28198–28214` |
| `placement` | the range + "Top means… Bottom means…" + **"Where in X does your writing sit?"** | `Top of this level` / `Middle of this level` / `Bottom of this level` | `servePlacement` `28216–28231`; `PLACE`/`PLACE_KEY` `28128–28129` |
| `reason` | *"That gives you **N out of M** … **Now say why, in one sentence** — what in your own writing put you there rather than a level higher? … This is the part your tutor reads first."* | **TYPE**, `rewrite` cycle | `serveReason` `28233–28248` |
| `done` | `**Your own mark for <AO>: N / M**` + `Change my answer →` | tap | `serveWrap` `28250–28266` |

Orientation chunks at `28133–28149` — including *"the criteria below are **word for word from the exam
board** — nothing is reworded and nothing is added"*.

**Banked to:** `fid('met')` (the ✓ list, `28304`), `fid('band')` (`28313`), `fid('level')`
(`Level N · Band · Placement`, `28324`), `fid('mark')` (`N / M`, `28325`), `fid('reason')` (`28354`).
Sidecar key is `CANVAS_SAVE_KEY() + '_ladder'` — **deliberately independent of `cfg`**, with the
write-key ≠ read-key story written into the source at `28019–28025`.

**The pure engine** — `frontend/wml-examiner-ladder.js` (211 lines, no DOM):
`rungs` (the ONE place the board's top-down order is reversed, `46–49`) · `descriptorsOf` `52–63` ·
`climbDescriptors` (judges the LOWER band's descriptors — the threshold, `72–76`) · `hasBands` `79–81` ·
`bandsOf` `83–86` · `markFor(range, placement)` — bottom→min, top→max, middle→`Math.floor((min+max)/2)`
with the stricter-on-ambiguity rationale at `24–29` · `resolve` `111–129` · `topOut` `136–139` ·
`next` (the state machine, `149–178`) · `bandRange` `180–186` · `resumeAt` `193`.
Exposed as `window.WML_EXAMINER_LADDER` (`209`) and `module.exports` (`210`).

**⚠️ NO PRODUCTION HOST.** Grep run:
`grep -rn 'schemeKey|WML_EXAMINER_LADDER|WML_MARK_SCHEMES' frontend/ includes/ bin/ *.php` (exit 0).
Every hit is either the engine itself, the dataset, `_examinerLadderCtl`'s own internals, the builder,
or `bin/examiner-ladder-sim-harness.js:85` (`schemeKey: 'aqa_lang1_q5_ao5'`) and `:301`
(`'no_such_paper_ao9'`). **No `.open(` call exists in shipped code.** Both scripts are enqueued
(`sophicly-writing-mastery-lab.php:428–429` and `:1111–1112`), so the walk is loaded and reachable — it
simply is never opened.

---

# 2. THE CURRENT ASSESSMENT "CONFIDENCE" MECHANISMS

There are **three distinct instruments**, often conflated. None presents mark-scheme level descriptors.

## 2.1 The `@REFLECT_GATE` panel — 1–5 self-rating + AO chips + predicted mark

| | |
|---|---|
| **Fires** | once per question, **before** that question's marking; Q2, Q3, Q4, Q5 on AQA Lang P1. **Q1 has none.** `protocols/aqa/language1/modules/protocol-a-assessment.md:68–70` |
| **Marker** | `@REFLECT_GATE{"q":"Q2","skill":"…","ao":["AO1","AO2","AO4","AO5","AO6"],"target":"AO2","max":8}` — `protocol-a-assessment.md:389` (Q3 `:470`, Q4 `:511`, Q5 `:586`) |
| **Renders** | `_renderReflectPanel(parsed, onSubmit)` — `wml-assessment.js:10538` |
| **Field 1** | `1. Self-rating` (`10588`), five buttons 1–5 coloured by `_REFLECT_LADDER` (`10266`), scale caption **"1 = not at all · 5 = comprehensively"** (`10612`) |
| **Field 2** | `2. AO targeting` — one chip per AO the paper assesses (`10621–10626`) |
| **Field 3** | predicted-mark dropdown, placeholder **"— pick your predicted mark —"** (`10748`); shown only on the FIRST reflection with a derivable max (`10550–10551`) |
| **Field 4** | free-text + dictation box (`10648`) |
| **Submit** | `Submit reflection →` (`10656`) → one combined message: `Predicted Qn mark: X/Y. Self-rating: N/5. AO targeting: … <detail>` (`10672–10676`) |
| **Stored** | prediction → **localStorage only**: `swml_pred:<CANVAS_SAVE_KEY()>:Q<n>` — `_predKey` `6475`, `_getPredicted` `6476–6478`, `_setPredicted` `6479–6481`, cleared per doc at `6485–6490`. The self-rating and AO targeting live only in the chat transcript. |
| **Duplicate guard** | `_reflectDone` / `_reflectPending` / `_reflectRepairCount` — `8668–8670`, `10374–10393` |
| **Task gate** | `_taskUsesReflectPanel()` — `10414` (excludes chat-quiz tasks, whose per-question "Rate your confidence: 1–5" would otherwise trip the detector, `10408–10412`) |

**Downstream:** `_calibVerdict(pred, act, max)` (`6492–6499`) with a range-scaled tolerance
`_toleranceFor(max)` = ≤8→±1, ≤20→±2, else ±3 (`6491`); verdict `accurate|slightly|recalibrate` with
brand colours. It colours the feedback box header and feeds the protocol's Calibration Check prose.
**It never feeds a grade** — stated at `6463`: *"Predicted = whole-mark the student commits in chat
(calibration-only, NEVER feeds grade)."*

## 2.2 The BLIND SELF-ASSESSMENT WALK — the closest existing analogue to a criteria ladder

Header rationale at `wml-assessment.js:7612–7632`.

| | |
|---|---|
| **Fires** | as the LAST pre-marking pre-chain stage: grade → headline goal → key-aspects recall → **SELF-ASSESS** → marking. Stage resolution at `16447` / `16452` (twin pipeline `39929` / `39934`) |
| **Eligibility** | `_saWalkEligible()` — `7641–7644`: `state.task === 'assessment'`, not review mode, **and `state.board === 'aqa'`**. Comment: *"Scoped to the 3 AQA anchors … Phase 2/4 widen it by relaxing `_saWalkEligible`."* |
| **Rows** | parsed **from the document**, not a constant: `_saWalkRows()` `7645–7658` reads the `Self-Assessment` section and matches `/^(.+?):\s*(?:—|(\d))\s*\/\s*5$/` per `<p>`, grouped by the preceding `<h3>` |
| **Intro** | `SA_WALK_INTRO` — `57346`, verbatim: *"Before I mark anything, let's do a quick **self-assessment** together. I'll take you through each skill one at a time — for each, just tap the description that honestly matches what you did this time. There are no wrong answers, and it won't affect your grade: the point is to sharpen your eye for your *own* writing, which is exactly what the strongest students learn to do. Ready when you are."* |
| **Per-item ask** | `<lead>**<Skill>** — <definition>. <closer>` with rotating leads/closers (`7719–7723`), a progress chip `Self-assessment · <group> · k of n` (`7724–7731`), and the line **"Tap the closest description below (or type 1–5)."** (`7734`) |
| **The five options** | `SA_DESCRIPTORS[skill]` — **5 student-voice descriptors per skill**, `57301–57339` (38 skills). Fallback ladder `['1 — Basic','2 — Developing','3 — Secure','4 — Good','5 — Perceptive']` (`7740`) |
| **Definitions** | `SA_SKILL_DEFS` — `57347–57375` |
| **Extra rung** | `📄 Pop out my writing so I can see it while I self-assess` (`7701`), opening `_openEssayPadHook` — *"self-assessing against the real text, not memory"* |
| **Banked** | into the DOC as `<Skill>: N / 5` via `_setParagraphContentViaPM` — `_saWalkRate` `7768–7786`; then `_refreshLangSidebar`, `_scoreOverlaysRefresh`, `_recomputeAllCompletion`, `saveCanvasContent` |
| **Typed fallback** | bare `1`–`5` — `_saWalkConsumeTyped` `7788–7797` |
| **Hand-back** | *"Thanks — that's your blind self-assessment saved. Now let's see how it compares. Beginning marking…"* then a silent SYSTEM directive that starts marking — `_saWalkHandBack` `7798–7810` |

**Section builder:** `buildSelfAssessmentSection(isDual)` — `57377–57444`. Generic set is
Introduction (Hook, Building Sentences, Thesis) · Body (Topic Sentence, Technical Terms, Evidence,
Close Analysis, Effects on Reader, Author's Purpose, Context) · Conclusion (Restated Thesis,
Controlling Concept, Central Purpose, Universal Message) · Academic Writing (`57393–57397`), filtered
per paper for AQA Lang P1 (`57406–57420`). The dual-part variant asks **"Rate your overall confidence
(1 = not confident, 5 = very confident)"** (`57380`).

**Downstream consumers of the SA ratings:**
- `_saCalibrationData()` — `8000–8014`: mean SA % vs actual marked %, gap, verdict
  `well-calibrated | over-confident | under-confident` at **±10**.
- `_blindSpotData()` — `8023–8060`: a unit rated HIGH but scored LOW; fires only on
  `selfPct ≥ 70 && actualPct ≤ 50 && gap ≥ 20`; fails loud once per subject when no unit resolves.
- The **Analytics strip** — `_renderSectionStrips` `'Self-Assessment'` builder, `8129–8142`:
  `Average rating N/5 · P%` + `Calibration: scored A% [so far] · <verdict>`.
- `ASSESSMENT-MECHANICS.md:98–102` (the walk), `:117` (readout), `:466–467` (the ±10 rule and the
  conservative blind-spot thresholds).

**SA ratings never touch marks** — `wml-assessment.js:7626`: *"SA ratings never touch marks, so no
recalc is needed here."*

## 2.3 The protocol's CALIBRATION CHECK (prose, model-served)

- Contract: `protocols/aqa/language1/modules/protocol-a-assessment.md:97–122`
  (the CALIBRATION-GAP RULE). Runs after every `Qn Total: A/B` line + Percentage & Grade + Level
  Alignment. Direction-adaptive:
  **over-predicted** → *"which ONE criterion they over-rated and what it actually rewards"*;
  **accurate** (±1 for Q2/Q3, ±2 for Q4, ±3 for Q5) → *"which criterion they were surest of and the
  exact evidence that earned it"*; **under-predicted** → *"which strength they undervalued so they
  repeat it"*. ONE question only.
- The lettered options must be **the REAL units of that paper's structure** (`:117–122`) —
  `PROTOCOL-STANDARD.md:939` states the same as a hardened rule.
- Retrieval Q1 is exempt: *"no panel, no golds, no calibration, no level alignment"* —
  `PROTOCOL-STANDARD.md:499–500`, `protocol-a-assessment.md:359`.
- Echo rule (a live failure): `protocol-a-assessment.md:124–127`.
- Code net: `_enforceGradeLadder` rewrites calibration prose numbers from the audited total —
  `wml-assessment.js:9262–9300`; recorded in `PROTOCOL-STANDARD.md:215` and
  `ASSESSMENT-MECHANICS.md:437–439`.

## 2.4 The grade goal (already identical in both worlds)

- Assessment: **"Before we begin: what grade are you aiming for in this paper?"** (selector limited to
  7 / 8 / 9) — `protocol-a-assessment.md:299–300`. Code normally asks it programmatically
  (`:326–328`); it is a HARD precondition for marking (`:335–338`).
- Trial: **"Before we begin: what grade are you aiming for in creative writing?"** —
  `wml-assessment.js:29778`, chips from `GRADE_GOALS = [7, 8, 9]` (`29772`).
  The trial copied the assessment's spine deliberately — PEDAGOGY `§33.15` (`PEDAGOGY.md:1989–2001`).

## 2.5 What "confidence" is NOT

The quizzes' *"Rate your confidence (1-5): 1=Pure guess, 3=Moderately sure, 5=Completely confident"*
lives in the mark-scheme quiz protocols (`protocols/shared/mark-scheme/language1.md:127`,
`language2.md:112` and `:236`, `poetry_anthology.md:116`) — a per-question confidence tag on a
retrieval item, not a criteria judgement. It is explicitly excluded from the reflect panel by
`_taskUsesReflectPanel()` (`wml-assessment.js:10408–10414`).

---

# 3. THE MARK-SCHEME DATA A LADDER COULD DRAW ON

## 3.1 Machine-readable (in the generated dataset)

`frontend/wml-markscheme-data.js` — **GENERATED, DO NOT EDIT** (header `1–14`), 366 lines.
Built by `bin/build-markscheme-dataset.js` from **one** source:
`protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md`, **Q5 sections only**
(`build-markscheme-dataset.js:29–32`, comment at `:6–8`).

Full contents, read by executing the module:

| key | ao | maxMarks | levels | bands per level |
|---|---|---|---|---|
| `aqa_lang1_q5_ao5` | AO5 Content and Organisation | 24 | 4 | **2** (Upper / Lower) |
| `aqa_lang1_q5_ao6` | AO6 Technical Accuracy | 16 | 4 | 1 |

Plus `__sourceSha1 = 'ffeb81d6c5981c89afce651f2669a63cb6edc780'` (`:363`).
Shape: `levels[] → bands[] → strands[] → descriptors[]`, e.g. `:26–54`.
Guarded by `bin/markscheme-gate.js` on four axes (see §1.7).

**That is the entire structured dataset. Nothing else in the repo is in it.**
Grep run: `find . -maxdepth 3 -name '*.json'` → only crib outputs, `skills-lock.json`,
`live-modelling-manifest.json`, package files. No mark-scheme JSON.

## 3.2 Protocol prose in a builder-compatible shape (a parse away)

Count of strict-shape blocks `^\*\*Level N — …\*\*` across every `knowledge-mark-scheme*.md`:

| file | lines | strict blocks | in the dataset? |
|---|---|---|---|
| `protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md` | 302 | **25** | only the Q5 pair |
| `protocols/aqa/language2/modules/knowledge-mark-scheme-lang2.md` | 330 | **25** | **no** |
| `protocols/aqa/language2/modules/knowledge-mark-scheme.md` | 220 | 0 | no |
| `protocols/aqa/literature/modules/knowledge-mark-scheme.md` | 64 | 0 (different shape — see 3.3) | no |
| `protocols/cambridge-igcse/language1/…` | 329 | 0 | no |
| `protocols/cambridge-igcse/language2/…` | 213 | 0 | no |
| `protocols/edexcel-igcse/language2/…` | 154 | 0 | no |
| `protocols/edexcel-igcse/literature/…` | 57 | 0 | no |
| `protocols/edexcel/language2/…` | 718 | 0 | no |
| `protocols/edexcel/modern/…` | 52 | 0 | no |
| `protocols/edexcel/shakespeare/…` | 114 | 0 | no |
| `protocols/edexcel/unseen/…` | 174 | 0 | no |
| `protocols/eduqas/language2/…` | 224 | 0 | no |
| `protocols/eduqas/literature/…` | 112 | 0 | no |
| `protocols/eduqas/modern/…` | 117 | 0 | no |
| `protocols/eduqas/shakespeare/…` | 99 | 0 | no |
| `protocols/eduqas/unseen/…` | 279 | 0 | no |
| `protocols/ocr/literature/…` | 67 | 0 | no |
| `protocols/ocr/poetry/…` | 121 | 0 | no |

**Per AQA Lang P1 question** (`knowledge-mark-scheme-lang1.md` headings at `:41, 59, 94, 128, 166, 268`):

| question | AO | marks | descriptors |
|---|---|---|---|
| Q1 | AO1 | 4 | **no levels** — per-point guidance (`:41`) |
| Q2 | AO2 Language | 8 | **4 levels, structured** (`:59–90`; e.g. `**Level 4 — Perceptive, detailed analysis — 7–8 marks**` at `:63` + 3 bullets) |
| Q3 | AO2 Structure | 8 | **4 levels, structured** (`:94–…`) |
| Q4 | AO4 Evaluation | 20 | **4 levels, structured** (`:128–…`; L4 16–20, L3 11–15, L2 6–10) |
| Q5 | AO5 | 24 | **in the dataset**, banded (`:166`) |
| Q5 | AO6 | 16 | **in the dataset**, unbanded (`:268`) |

AQA Lang **P2** is the same shape: Q2 AO1 Inference /8, Q3 AO2 Language /12, Q4 AO3 Comparison /16,
Q5 AO5 /24 + AO6 /16 (`knowledge-mark-scheme-lang2.md:51, 60, 98, 137, 176, 295`).

The builder's parser already matches these lines: level regex
`/^\*\*Level (\d+) — (?:(.+) — )?(\d+)–(\d+) marks\*\*$/` and bullet regex `/^- (.+)$/`
(`build-markscheme-dataset.js:38, 71`). What stops it is the **section selector**, which is hard-scoped
to `## QUESTION 5 — AOx …` (`:35`, comment at `:30–36`) and a single SOURCE path (`:30–31`).
The AO5 strand rule would need relaxing for a reading question (it `throw`s on a bullet outside a
strand — `:76`), since Q2/Q3/Q4 print flat bullets under a lead-in sentence.

## 3.3 Structured but in a different markdown shape

`protocols/aqa/literature/modules/knowledge-mark-scheme.md` (64 lines) holds **six levels**, per-AO,
shaped as `#### **Level 6: Convincing, critical analysis and exploration (26-30 marks)**` followed by
`**AO1:** …`, `**AO2:** …`, `**AO3:** …`, `**Typical features:** …` (`:5–13`, `:15–23`, `:25–33`,
`:35–40`). Machine-parseable, but by a second parser — the current builder's regexes do not match it.
The AO-per-level split maps naturally onto the engine's `strands` (`wml-examiner-ladder.js:52–63`).

## 3.4 PDF-only

Board mark-scheme PDFs live outside this repo at
`sophicly-etchwp-package v2.6/Sophicly Etch Mark Scheme Resources/` (per the WML `CLAUDE.md`
§PARALLEL LANES §2(a)). Not surveyed here — out of scope for a code read.

## 3.5 Other mark-scheme assets (prose, not descriptors)

`protocols/shared/mark-scheme/` — 8 large `.md` files (language1 132 KB, language2 133 KB,
poetry_anthology 80 KB, shakespeare 76 KB, 19th_century 46 KB, modern_text 24 KB, SQA N5 387 KB) plus
`marking-fairness-universal.md` and `marking-rules-aqa-granular.md`, and a `text-data/` subdir.
`protocols/shared/mark-scheme-quiz/` — 50 per-text quiz banks. `protocols/shared/mark-scheme-assessment/banks/`
— 39 per-text MSA banks. These are teaching/quiz content, **not** level-descriptor datasets.

**Not found:** no `includes/class-*mark*` PHP file exists.
Grep run: `grep -rn '…' includes/*.php` across the schemeKey search (exit 0) returned no
mark-scheme class; `ls includes/` (via the FILE STRUCTURE section of `CLAUDE.md`) lists
`class-rest-api.php`, `class-protocol-router.php`, `class-session-manager.php`,
`class-topic-questions.php`, `class-function-handlers.php`.

---

# 4. THE RULINGS ALREADY ON RECORD

## PEDAGOGY.md

**§19 — THE STUDENT MARKS THEIR OWN WORK AGAINST STATED CRITERIA** (`PEDAGOGY.md:1183–1231`),
Neil, 2026-07-28, verbatim: *"I feel like I can just put any answer in… maybe the students could
self-assess… they tick off the criteria that they've answered to the best of their ability. That
might be better, actually. And then maybe one check at the end with advice of how to make it better,
with examples."* (`:1187–1190`)

The four reasons (`:1197–1206`), quoted in full because they are the argument for §5's port:
1. *"An AI check OUTSOURCES the judgment; a checklist BUILDS it."*
2. *"It IS the exam skill. Reading your own answer against the mark scheme is the thing we are training."*
3. *"It is FREE, so it runs on EVERY ask instead of being rationed to one by cost."*
4. *"Honesty is credited, not punished."*

Rollout rule (`:1208–1211`): *"A tick list follows a **WRITTEN answer whose quality a later step
depends on.** **Never a pick** … **Never one row of many inside a larger unit** — the **UNIT** gets
the tick list."*
Criteria provenance (`:1219–1221`): *"CRITERIA ARE LIFTED, NEVER AUTHORED BESIDE THE ASK."*

**§33 — THE CW TRIALS + EXAMINER-LADDER SELF-ASSESSMENT** (`PEDAGOGY.md:1884–2001`). The rulings that
bear directly on an assessment port:

- **§33.3** (`:1894–1897`) — *"The criteria carry NO BOARD LABEL … 'we're not gonna label it AQA even
  though we use the criteria… we don't have to give it a label.' Descriptors are still lifted VERBATIM
  from AQA's document and gated."*
- **§33.4** (`:1898–1903`) — *"The examiner ladder is BOTTOM-UP … read Level 1, prove every criterion,
  climb; on the first level not fully met, place top/middle/bottom of it. The student marks their own
  work (§19); the mark arithmetic is CODE from band + placement, never a number the model (or the
  student) invents."*
- **§33.5** (`:1904–1906`) — *"**Scope is language and literature too, not just CW** … so the ladder is
  AO-generic over (AO, levels, descriptors, band edges) and a new paper is a DATA job."*
- **§33.8** (`:1911–1920`) — *"**THE RING GETS SOPHIA'S MARK, NOT THE SELF-MARK** … the student judges
  every criterion FIRST and their verdicts are banked before Sophia is asked anything (§19 — a
  judgment formed after hearing hers is not theirs); she then marks the same piece; and **the gap
  between the two is the teaching**."*
- **§33.9** (`:1931–1937`) — *"**FEEDBACK ORDER: GRADE LAST AND QUIET, END ON THE STUDENT'S ACTION**"*
  (Butler 1988 / EEF 2021).
- **§33.10** (`:1938–1958`) — the examiner-walk mechanics: minimum 2 marks per level; *"A level once
  presented is NEVER removed from the screen"*; **"Defend the mark"** — an evidence sentence is
  required both when claiming Level 2 and when stopping lower (Panadero/Boud).
- **§33.11** (`:1959–1964`) — AO anchoring as framing, plain words first, code attached.
- **§33.12** (`:1965–1968`) — *"PROGRESS REPORTS CARRY THE TRIAL GRADE AND THE CALIBRATION GAP …
  a real metacognitive metric (Panadero/Boud) that should shrink as the student learns what quality
  looks like."*
- ⭐ **§33.13** (`:1969–1973`) — *"**ALL OTHER ASSESSMENTS ADAPT TO THE EXAMINER-WALK METHOD over
  time** (Neil, 2026-08-23: 'even for literature and language and stuff like that, we need to start
  adapting it to this method' — there, with the boards' real level counts). Direction recorded, NOT
  built: trials are the proving ground first; the lit/lang adaptation is a roadmap item, not part of
  the CW slices."* — **this is the ruling that authorises the work Neil is now asking for.**
- **§33.14** (`:1974–1988`) — the second dimension, /28 + /2 = /30, and the board caveats.
- **§33.15** (`:1989–2001`) — *"**A TRIAL CARRIES THE FULL ASSESSMENT SHAPE — grade goal upfront ·
  calibration question · 'How am I going? / Where to next?' — THEN the target**"*, his reason:
  *"it's very possible for some of these students this may be the only assessment that they do for
  creative writing because some of them will work so slowly."*

**Not found in PEDAGOGY.md:** no numbered ruling `§33.7` appears between 6 and 8 in file order —
the list runs 1,2,3,4,5,6,8,7,9,10,… (`:1889–1930`), i.e. 8 is printed before 7. Not an error to fix
here, just a note so a reader is not confused.

## ASSESSMENT-MECHANICS.md

- `:98–102` — the blind SA walk as pre-chain stage 4, rows read from the DOC, plus the writing pop-out.
- `:117` — the Analytics readout carries *"marks-lost order, calibration, blind-spot, and the
  code-tallied penalty Trend"*.
- `:238` — *"the Self-Assessment fill is CATEGORISED"* (v952, Neil's live review).
- `:277` — *"SA = average + calibration"*.
- `:394–396` — the ONE canonical grade ladder (`GRADE_BOUNDARIES` mirroring the server's
  `grade_band_percent`).
- `:437–439` — PER-QUESTION PROSE OWNERSHIP: `_enforceGradeLadder` owns the calibration prose numbers.
- `:466–467` — *"calibration (mean blind SA % vs actual %, ±10 well-calibrated); conservative
  blind-spot (rated ≥70, …)"*.
- `:997` — *"A number with no code owner = defect."*
- `:1067` — *"Never assert a mechanism the guard did not test."*

**Not found:** neither `ASSESSMENT-MECHANICS.md` nor `PROTOCOL-STANDARD.md` contains the word
"metacog…" in a ruling about the examiner ladder; `PROTOCOL-STANDARD.md` mentions metacognition only
at `:363–364` (AO chips as the calibration act) and `:434` (the Final Summary's metacognitive journey).
Grep run: `grep -niE 'self-assess|self assess|calibrat|confiden|metacog|ladder'` over both files
(exit 0, all hits reviewed).

## PROTOCOL-STANDARD.md

- **B-COMMON §7 — "Calibration Check — after every unit's total (retrieval units exempt)"** — `:410`.
- `:363–364` — reflect panels list EVERY AO the paper assesses; *"choosing is the calibration act"*.
- `:914` — hardened rule 3: *"(P) Reflect panels: full paper AO set + never re-ask."*
- `:939` — hardened rule 12: *"(P) Calibration-check choices = the REAL units of THAT paper's structure."*
- `:499–500` — retrieval Q1 is LEAN: no panel, no golds, no calibration, no level alignment.
- `:560` — the per-question chain order: Total → Percentage & Grade → Level Alignment → Calibration → Q-GATE.

## Feature plan

`CW-TRIALS-AND-SELF-ASSESSMENT-PLAN-2026-08-21.md` (plugin root, 18,936 bytes) — named as the full
feature plan by `PEDAGOGY.md:1886`. Not re-summarised here.

---

# 5. THE GENERALISABLE CORE

## 5.1 Reusable AS-IS for an assessment ladder

| component | file:line | signature / shape | why it ports unchanged |
|---|---|---|---|
| **`_examinerLadderCtl`** | `wml-assessment.js:28006–28465` | `open({ schemeKey, aoName, walkId, fids:{level,band,met,reason,mark}, onDone })` → bool; also `handleTurn(msg)`, `onReply()`, `reset()`, `tryResume()`, `nudge()`, `atStart()`, `.active`, `.pending` | **built for exactly this** (`27988–27992`); knows nothing about trials; needs a HOST and a scheme key |
| **`window.WML_EXAMINER_LADDER`** | `wml-examiner-ladder.js:195–210` | `rungs(scheme)` · `descriptorsOf(level)` · `climbDescriptors(level)` · `hasBands(level)` · `bandsOf(level)` · `bandRange(level, bandName)` · `markFor(range, placement)` · `resolve(scheme, {levelNumber, bandName, placement})` · `topOut(scheme)` · `next(scheme, state)` · `resumeAt(scheme, state)` · `PLACEMENTS` | pure, no DOM, node-testable, already gated |
| **the ladder card** | `wml-assessment.js:14340–14492` | `setTrialLadderModel({ title, index, total, prompt, levels[], mark, outOf, locked, foot, onPick(n,verdict), onRevise(n), onOpenDraft() })`; each level `{ n, label, range, text?, descriptors?[], verdicts?[], verdict, shown }` | **N levels by construction** (`14331–14333`); `descriptors[]` path already written and unused |
| **the floating pads** | `35989–36015` (ladder), `35932–35978` (source text) | `_openLadderPadHook()` / `_closeLadderPadHook()` / `_openTrialDraftPadHook()` | generic shell + `_makePanelInteractive` (`36054`); the draft pad's twin already exists for essays as `_openEssayPadHook` (`7633`, used at `7696–7713`) |
| **`_ladderGrade(pct)`** | `wml-assessment.js:9258–9261` | `(pct) => 1..9` | the ONE canonical ladder; both engines already use it |
| **the walk contract helpers** | `serveCwChunks(chunks, opts)` `19488` · `_walkSlot` `4803` (`.arm(walk, fid, {cycle})` / `.consume(walk)` / `.clear(walk)`) · `armWalkResume(id, fn, opts)` `4698` · `_cwNoAskGuard(walk, fallback, bubble)` `5150` · `_cwReplay(fn)` `5201` · `registerCwWalkCtls(list)` `5832` | — | pacing, banking, resume, liveness and no-ask guards, all shared |
| **document row plumbing** | `_writeOutlineRowField(fid, verbatim, opts)` `3571` · `outlineRowHTML(criterion, fieldId)` `55246` · `sectionHTML(type,label,editable,partNumber,innerHTML,extraDataAttrs)` `53447` · `dividerHTML(label, …)` `53581` | — | identical between trial and essay documents |
| **the score piggyback** | `59374–59389` | spread onto the canvas-save body | the only path that reaches `session_records.grade`; assessments already use the sibling branch at `59368–59373` |
| **the mark-scheme pipeline** | `bin/build-markscheme-dataset.js` + `bin/markscheme-gate.js` + `frontend/wml-markscheme-data.js` | source `.md` → generated JS → 4-axis divergence gate | adding a paper is a DATA job **once the builder's section selector is generalised** (see §3.2) |
| **`_saWalkRows()`** | `7645–7658` | reads rateable rows out of the live document | precedent for "the document, not a constant, is the row list" |

## 5.2 Reusable as a PATTERN (copy the shape, not the code)

- The **grade-goal → items → marking → calibration → summary → target** spine
  (`_cwTrial1Ctl` phases, §1.2) — it is itself a port of the P1 assessment protocol (PEDAGOGY §33.15).
- The **help ladder** `helpBar(e)` (`29158–29188`) with rung 3 as the only API call.
- **Evidence-sentence-on-every-mark** (`serveNote`, `29397–29416`) on a `rewrite` cycle.
- **All-or-nothing marker parsing with a loud retry** (`parseVerdicts` `29602`, `onMarkingReply`
  `29686–29697`).
- **`deriveFromDoc()`** (`30007–30039`) — the document out-ranks the sidecar on resume.
- The **calibration delta + gapElements + direction-adaptive question** (`29799–29855`), which is a
  code-served version of the protocol's prose Calibration Check (§2.3) and could replace it.

## 5.3 CW-specific — must be replaced, not reused

| thing | file:line | why it does not port |
|---|---|---|
| `CW_SCENE_ELEMENTS` + `CW_TRIAL1_ACCURACY` | `wml-core.js:1369–1468` | seven story beats + SPaG; an essay's units are paragraphs/questions/AOs |
| `l1Body` / `l2Body` | `wml-assessment.js:29522–29526` | synthesises Level 1 from `e.prompt` and Level 2 from `e.strong` — **taught-element bars, explicitly NOT board descriptors** (PEDAGOGY §33.10, `:1954–1956`). An assessment ladder must use the board's verbatim descriptors instead (§33.3) |
| `MARKS` / `LEVEL_DEFS` (2 levels, 0–4) | `29045–29061` | hard-coded two levels; boards print 4 (AQA Lang), 5 or 6 (AQA Lit) |
| `@TRIAL_VERDICT` / `@TRIAL_EXAMPLE` / `@TRIAL_STRENGTH` / `@TRIAL_PRIORITY` | `29570–29579`; protocol `CW-TRIAL-01…md:55–67` | trial-only marker contract; assessments already use `@FB_BEGIN`/`@FB_END` + `Qn Total:` (`protocol-a-assessment.md:85–95, 97–99`) |
| `fid(id) => 'cw-trial-1-' + id` and the four document blocks | `29068`; `53495–53545` | trial document shape |
| `cwTrialSource` / `cwDraftTrialSource` | `wml-core.js:1477–1509` | derive which DRAFT a trial assesses, from `CW_STEPS` |
| `planLine` → `_cwDocValue('scene_selection', …)` | `29245–29249` | Step-9 CW plan rows |
| `saveTrialResult` → `WML.cwProject.saveTrial` | `29903–29925`; `wml-core.js:3337` | CW project store; assessments file through the canvas save + session records |
| the trial's `orientationChunks` | `29252–29282` | names the seven scene parts and the /30 |
| `_cwTrial1Ctl`'s private `chipBar` copy | `29132–29155` | per the walk contract each controller owns a private copy; `_examinerLadderCtl` has its own at `28092–28121` |

## 5.4 The three gaps between "built" and "usable for assessments"

1. **No host.** `_examinerLadderCtl.open()` is never called in shipped code (§1.9). An assessment
   would need to call it — most naturally as a pre-chain stage beside/instead of the blind SA walk
   (`wml-assessment.js:16447`, `16452`), and to supply `fids` pointing at real document rows.
2. **No data beyond AQA Lang P1 Q5.** Two schemes exist (§3.1). Q2/Q3/Q4 of P1 and all of P2 are one
   parser generalisation away (§3.2); AQA Literature needs a second parser (§3.3); every other board
   has no structured descriptors at all.
3. **No multi-AO orchestration.** `_examinerLadderCtl`'s sidecar is deliberately ONE key per document
   with the comment *"only one ladder is ever in progress in a document at a time (AO5 finishes before
   AO6 opens)"* (`28019–28025`). A paper with five questions × multiple AOs needs a host that
   sequences ladders and aggregates — that host does not exist.

---

## Appendix — every search run for this document

All commands ran to completion (exit 0). Where a result was empty it is reported as "not found"
above with the command that produced it.

```
grep -oEn '[A-Za-z_$][A-Za-z0-9_$]*[Tt][Rr][Ii][Aa][Ll][A-Za-z0-9_$]*' frontend/wml-{assessment,core,app}.js
grep -n '<each Trial identifier>' frontend/*.js includes/*.php
awk 'NR>=29033 && NR<=30182' frontend/wml-assessment.js        # the whole of _cwTrial1Ctl, untruncated
awk 'NR>=27960 && NR<=28479' frontend/wml-assessment.js        # the whole of _examinerLadderCtl
awk 'NR>=14320 && NR<=14500' frontend/wml-assessment.js        # the ladder card
awk 'NR>=1360 && NR<=1520'   frontend/wml-core.js              # CW_SCENE_ELEMENTS + accuracy + cwTrialSource
cat frontend/wml-examiner-ladder.js                            # all 211 lines
node -e 'require("./frontend/wml-markscheme-data.js") …'       # enumerated every scheme key
grep -rn 'schemeKey|WML_EXAMINER_LADDER|WML_MARK_SCHEMES' frontend/ includes/ bin/ *.php
grep -niE 'confiden|calibrat|@REFLECT_GATE|selfAssess|self_assess|predicted_grade|prediction' \
     frontend/wml-{assessment,core,app}.js includes/*.php
grep -n '_saWalk[A-Za-z]*' frontend/wml-assessment.js
grep -niE 'confiden|calibration|predict|self-assess|grade goal|how confident' \
     protocols/aqa/language1/modules/protocol-a-assessment.md
grep -niE 'confiden|calibration|self-assess|metacog' PROTOCOL-STANDARD.md
grep -niE 'self-assess|self assess|calibrat|confiden|metacog|examiner ladder' PEDAGOGY.md ASSESSMENT-MECHANICS.md
find protocols -name 'knowledge-mark-scheme*.md' | while read f; do grep -cE '^\*\*Level [0-9]+ —' "$f"; done
find . -maxdepth 3 -name '*.json' -not -path './node_modules/*'
grep -nE 'trial|ladder|markscheme' bin/pre-ship-check.sh
sed -n '1,30p' bin/{cw-trial1-gate,cw-trial1-sim-harness,cw-trial-seed-gate,
     cw-trial-judges-the-draft-gate,examiner-ladder-harness,examiner-ladder-sim-harness,markscheme-gate}.js
cat protocols/shared/creative-writing/CW-TRIAL-01-story-coherence.md
```
