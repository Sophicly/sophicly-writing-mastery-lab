# CW FINAL ASSESSMENT (#884 ⑦, slice 6) — the end-to-end plan
**Written 2026-10-12 · WML 347 A (engine lane) · root CLAUDE.md §16: agreed BEFORE code.**

Parent plan: `CW-TRIALS-AND-SELF-ASSESSMENT-PLAN-2026-08-21.md` (Layer 5 + §5 slice 6). Rulings: PEDAGOGY §33 (1–16),
§35. **Nothing here re-opens a ruling.** Where two rulings pull apart, §1 says which governs and why (root §7). Every
fact below was read from the source this session; `file:line` is given where a later build depends on it.

---

## 0 · WHAT IT IS
One new lesson, **Final Assessment**, after Step 30 (Final Draft — SPAG) and before Step 31 (Metacognitive Reflection)
(§33.6). The student marks their finished story against the exam's real level descriptors: **Content and Organisation
(AO5, /24)**, then **Technical Accuracy (AO6, /16)**. The descriptors are word for word from the mark scheme, with no
board name on screen (§33.3). They climb each ladder from Level 1, the way an examiner reads (§33.4, §35). Then Sophia
marks the same story in ONE call. Code turns her level calls into a mark out of 40, and the gap between her mark and
theirs is the lesson (§33.8). It ends on the student's own target, which Step 31 opens with (§33.9).

## 1 · DECISIONS — engineering calls inside the rulings, stated rather than asked
| # | decision | why |
|---|---|---|
| D1 | **The best-fit rung question** (`regime:'bestfit'`): *"is your writing still better than this description?"*, never *"have you met every one?"* | §33.4 (21 Aug) described hurdles; **§35 (24 Aug) corrected it** — descriptors "should not be interpreted as hurdle statements". The shipped Language host already walks THESE SAME AO5/AO6 descriptors best-fit (`wml-assessment.js:9525`). One descriptor set, one procedure: a student must never learn two ways to read the same scheme. §33.4 gets a pointer to §35 in the same commit. **AQA's own marking steps say the same for these descriptors** (`research/sources/aqa-8700-1-sms-2026.txt:83–101`): examiners "start at the lowest level… until you have a match between the level descriptor and the answer", and students "do not have to meet all the skill descriptors at that level". |
| D2 | **The data already exists:** `aqa_lang1_q5_ao5` (/24, Upper/Lower halves per level) + `aqa_lang1_q5_ao6` (/16), generated and gated by `bin/markscheme-gate.js` | AQA Paper 1 Q5 IS the narrative question. Measured: **0** occurrences of "AQA" in either scheme's student-facing text (§33.3 holds). No new data job. |
| D3 | **One lesson, two ladders in sequence**, with a pause point between them | The parent plan's "AO5 and AO6 are separate sittings" means two ladder RUNS, not two lessons. After AO5: *"Stop here if you need to — Technical Accuracy opens exactly where you left it."* Resume lands on the exact AO, level and criterion (§4c.8b). |
| D4 | **The levels come in the chat, from `_examinerLadderCtl`** (`wml-assessment.js:33704`), not on the trials' "Your Marking" pad | The parent plan named the finale "the ladder's first real host"; the controller is built for verbatim, multi-level descriptors and serves real Language students today. The trials' pad is built for two taught levels — AO5's four levels × two halves would be a wall there. Reuse before port (root §14c Gate 0). |
| D5 | **A document-driven host** — the Language host's shape (`_ladderHostRenderCurrent`, `:9515`) | The ladder's `onDone` callback does not survive a reload (`:34022`); the document rows do. Next step = the first AO whose mark row is empty → the marking → calibration → summary → target. |
| D6 | **Sophia's verdict goes through the SAME resolver as the student's** | Per AO she names level · half (AO5 only — the board prints Upper/Lower) · top/middle/bottom. `WML_EXAMINER_LADDER.resolve()` (`wml-examiner-ladder.js:111`) turns BOTH people's calls into marks, so the calibration compares like with like by construction (§33.8, §33.10). All-or-nothing parse: both AO verdicts or no mark is filed (the trials' rule, `:37047`). |
| D7 | **Grade = `_ladderGrade(pct)`** (`:13225`) | The ONE canonical ladder every trial uses. No second grade table (the trial gate already forbids one). |
| D8 | **The full assessment shape** (§33.15): grade goal 7/8/9 first · calibration with **±3 on /40** (the P1 protocol's own tolerance, cited at `:37135`) · *How am I going? / Where to next?* · the target | For a slow student this may be the only full mark they ever get. Same code-served spine as the trials; still ONE API call. |
| D9 | **Feedback order** (§33.9): her verdict per AO, each with one rewrite example (AO5: their own paragraph lifted a level; AO6: two of their sentences corrected — #434) → the disagreements → the priority → the grade as a quiet closing line → the target ask | Butler/EEF, ruled. |
| D10 | **The target is pinned at the top of Step 31's page** | §33.9: feedback must be USED. Step 31's third paragraph is "Next Steps" (`CW-STEP-31-metacognitive-reflection.md`) — the target is what it should start from. Reuses the trial-target pin's shape (`tryFillCwDraftTarget`, `:54751`), which today runs on draft steps only. |
| D11 | **Save identity: `trial: 'final', finale: true`** in the project's `trials` array | Measured, zero server change: the REST handler stamps only numbers 1–6 (`class-rest-api.php:7683`), so `'final'` is saved as sent, never touches `trial_completion` (`:7575`), and the new-story gate's `absint(...) === 1` (`:7344`) cannot mistake it for Trial 1. |
| D12 | **Task id `cw_final_assessment`**, and a CW_STEPS entry `{ id: 'final_assessment', label: 'Final Assessment', tier: 'si', phase: 'polish', final: true }` between Step 30 and Step 31, carrying **no `step` and no `trial` key** | A new step NUMBER would renumber Step 31 and everything keyed on step numbers. Unnumbered, like the trials. No `trial` key, like weekend lesson 11 (`wml-core.js` step 91), so no trial-keyed path picks it up by accident. 37 JS gates read `startsWith('cw_')` and include it; exactly **five** name gates must learn it, each through ONE predicate per language (WML canvas rule 2 — gate on a capability, never on a name): router `:2812` and `:4163`, router label `:4189`, `getCwStepDef` (`wml-core.js:1249`), the score piggyback (`wml-assessment.js:69109`). |
| D13 | **The grade ring gets Sophia's /40** through the canvas-save score piggyback (#435, v7.20.561) | The piggyback is gated by task name today (`:69109`); D12's predicate opens it. Student-data's listener files `score_raw/score_max` from any canvas save (`class-wml-listener.php:967`), so no dashboard change is needed for the number itself — **verified on staging before shipping** by reading the `session_records` row, the way #435 was. |

## 2 · THE CHAIN — every layer (§15/§16)
**Layer A — data and model (WML)**
- CW_STEPS entry (D12) + `getCwStepDef` branch for `final: true` + `cwTrialSource`-style source: the draft under
  assessment is the **`final_draft`** artifact (Step 30's; Step 31 already reads it — `CW-STEP-31-…md` "Reads from project").
- No new mark-scheme data (D2).

**Layer B — the page (WML)**, one producer for the template AND the heal (the trial pages' law, `:62776`):
About (plain words, no board name; the two objectives named with the codes attached and the trials' board caveat, §33.11/§33.14)
· **Your Story** — the final draft, read-only, refreshed at every mount, with the "not arrived yet" state that points back
to Step 30 (`_cwTrialDraftInner`, `:62943`) · **Your Marking** — goal + per AO: level · criteria met · mark · reason
(the ladder's own `fids` shape, `:9319`) · **Sophia's Verdict** — per AO, locked · **Overall Feedback** — Key Strength,
Priority for the Exam, locked · **Final Mark** — mark /40 + grade, where you differed, locked · **Your Target for the
Exam** — editable. Row ids from ONE builder `cw-final-*`, the same template the walk writes (§5d).
Built through `getCwDocTemplate(stepDef)` (`:59628`), which already ends every CW document with the Progress and **Tutor
Sign-off** sections — that IS "reuse the existing sign-off machinery" (#221); nothing new is built for it.

**Layer C — the walk (WML)**: orientation (paced, §4b) → goal chips → AO5 ladder → pause point → AO6 ladder → *"Give me
my marks →"* only if they left before the call → ONE marking call → code mark /40 → disagreements → calibration (±3) →
How am I going? / Where to next? → target ask → wrap with "Change my answers →" (re-openable, #221). Resume on any
device from the document (#897's law). The help ladder (§4c.9): "Marking levels" (re-serve the current level) ·
"Show my story" (the draft pad) · "Still stuck — ask Sophia" last.

**Layer D — the protocol (WML)**: `CW-FINAL-ASSESSMENT.md` in the trials' **"YOU DO NOT RUN THIS LESSON"** shape
(Job 1: a stuck student, on request · Job 2: the marking turn, with the marker lines below). Router map row + label.
Descriptors are NOT repeated in it (WML §5: served text never sits where the model narrates it).
```
@FINAL_LEVEL[ao5=<level 1-4>|<upper|lower>|<top|middle|bottom>] one sentence for the document
@FINAL_EXAMPLE[ao5] their own paragraph, rewritten one level up — their names, setting and voice
@FINAL_LEVEL[ao6=<level 1-4>|<top|middle|bottom>] one sentence
@FINAL_EXAMPLE[ao6] two of their actual sentences, corrected
@FINAL_STRENGTH one line   ·   @FINAL_PRIORITY one line
```

**Layer E — save and the ring (WML; dashboard reads)**: `saveTrial` with `trial:'final', finale:true` (D11), both
judgments, both marks, percent, grade, goal, calibration delta, comments, examples, target · the score piggyback
(D13) with strength_1 / target_1 / target_2 as the trials send.

**Layer F — wiring (WML)**: the trials' seven wiring points (`bin/cw-trial1-gate.js` §4: dispatcher arm · the three
controller maps · the walk registry · the reply fan-out · the start-miss map · export + boot resume + fresh entry ·
chat-clear restart) + sidebar `CW_SIDEBAR_STEPS` (Goal · Content and Organisation · Technical Accuracy · Sophia's
marking · Calibration · Your target) + Step 31's target pin (D10).

**Layer G — LearnDash (LD lane)**: ONE new shared lesson "Final Assessment", bridge → `cw_final_assessment`, inserted
straight after Step 30's lesson in **41165 · 42205 · 43628 · 55070**, `ld_course_<cid>` on it, `course_sections`
re-asserted. If Step 31 shares Step 30's unit, its lesson number moves one; unit numbers do not change (UNIT NUMBERS
law). Staging when WML's build is on staging; PROD only after WML's prod deploy is md5-verified (ship order).

**Layer H — the dashboard label (dashboard lane, one line)**: `class-topic-bindings.php` would show the task as
"Cw Final Assessment" (its fallback is `ucwords`); it needs `'cw_final_assessment' => 'CW Final Assessment'` (§14).

## 3 · SEQUENCE AND VERIFY POINTS (one build, one test cycle — root §12)
1. Predicates + CW_STEPS + router row + protocol → gate: a new `bin/cw-final-gate.js` (the five name gates call the one
   predicate; the protocol asks for exactly the walk's markers; no descriptor text in the protocol; no board name).
2. Page + heal → browser on staging: the final draft shows read-only; "not arrived" state when `final_draft` is empty.
3. Walk → a sim on `walk-sim-lib` (liveness is automatic): climbs both ladders, the pause, resume mid-AO5 and mid-AO6
   on a clean device, the all-or-nothing parse, a mangled reply → retry chip, the arithmetic equals `resolve()` for both
   people, calibration both directions, the target filed. Falsified on a scratch mirror.
4. Save + ring → staging: the `trials` entry reads `finale:true`; the `session_records` row carries Sophia's /40.
5. Step 31 pin → browser: the target sits at the top of Step 31; no pin when there is no finale yet.
6. LD (handoff + message) → their done_when probe on staging.
Proven end to end as test student 1938 on project `cwp_b9d0a5a233ab` (which already has every draft and trial seeded).

## 4 · HANDOFFS
- **LD** — Layer G, with the measured unit ids, written at build time (as for Trial 6).
- **Dashboard** — Layer H, one label line.

## 5 · WHAT THIS DOES NOT DO
- It does not change any trial, any draft step, or the Language host (the finale is a second host of the same ladder).
- It does not invent a criterion: every descriptor is the board's own, every mark is `resolve()` arithmetic.
- It does not add the finale to the weekend story (a weekend student's marking is lessons 8 and 11).
- It does not touch Step 31's own content — only a pinned target above it.
