# PROTOCOL-STANDARD.md — the contract every WML protocol must meet

**What this is:** the codified gold standard for WML assessment (Part B) and planning (Part C) protocols,
extracted from the proven reference — `protocols/aqa/literature/modules/protocol-a-assessment.md` (the
"R&J standard") — plus Neil's locked expectations (2026-07-01 walkthrough) and the settled house rules.
**Before touching ANY assessment or planning protocol, read this file. It is the acceptance bar.**

- Part A = universal invariants (apply to BOTH assessment and planning).
- Part B = the assessment spec (component by component, with enforcement + grep checks).
- Part C = the planning spec (stub — fill after the assessment standard is proven; planning is the
  flip side of assessment and borrows Part A wholesale).
- Appendix = known-gap register (live violations observed + which lane owns each fix).

Authority order when documents conflict: Neil's latest decision > this file > the reference protocol file.
When you change this file, note WHY in the changelog at the bottom.

---

# PART A — UNIVERSAL INVARIANTS

## A1. Gate or it didn't happen (THE core invariant)
An instruction with no enforcement mechanism is a WISH, not a step. Live evidence: the keyword-recall
checkpoint and main-goal question existed as polite prose for months and silently never fired; every
gated step fired reliably. **Every mandatory step must chain to one of the four proven mechanisms:**

1. **Marker panel** (`@REFLECT_GATE{...}` etc.) — structural: frontend renders an interactive panel;
   the student's combined reply is a detectable artifact in the conversation.
2. **HARD PRECONDITION block** — before acting, the model must verify a NAMED artifact from an earlier
   turn exists in the conversation ("the reply arrives as 'Self-rating: N/5 …' — if absent, go back,
   emit the missing step, STOP"). Chain steps so each gate names the artifact of the previous one.
3. **HARD STOP turn-split** — "your turn ENDS on that line"; the next content requires a student
   keypress (type **Y**). Separates reflection from marks, prevents same-turn skipping.
4. **4-button progression gate** — exact literal strings `[✓ Got it — continue]` `[🤔 Still confused]`
   `[💬 Different question]` `[⏸ Pause here]` (frontend hard-codes detection). Emitted ONCE per section,
   only when the turn contains ALL required artifacts (listed in the precondition); anti-loop rule:
   after ✓, the next message MUST begin the next section's STEP 1 — never re-emit a confirmed gate.

When you add a new mandatory step, write its gate in the same edit. A step without a gate is a bug.

## A2. Markers are the API
Function-calling is disabled — text markers + deterministic frontend extraction are the only channel
(`reference_wml_function_calling_disabled_use_markers`). Emission rules, always: marker on its OWN line,
no code block, no backticks, nothing after it on the line; `q`/`title` labels EXACTLY from the section's
allowed set; JSON keys exactly as specified. The frontend contract (Part B §B9) lists every marker the
canvas consumes. Never invent a new marker without wiring the frontend first (that's a cross-lane ask).

## A3. Anti-fabrication (penalties + evidence)
A penalty MUST quote the offending phrase **verbatim from THAT section's submitted text**. Cannot find it
verbatim → the fault does not exist there → no penalty. 0 penalties is a valid outcome; never fill slots.
Protocol example phrases are FORMAT templates — never present one as the student's writing.
(Live violation observed 2026-07-01: W1 penalty quoted a phrase not present in the paragraph. A code-side
verbatim validator is queued — Chat B. Until then the prose rule is the only guard: enforce it hard.)

**CRITERION EVIDENCE (Neil, 2026-07-02 — universal, every assessed paper):** the same standard applies to
CRITERION scoring, not just penalties. Every criterion scored below full worth must be anchored in the
My Assessment prose either by (a) quoting the student's verbatim phrase that shows the shortfall — e.g.
for "surface-level, no word-level zoom", quote the analysis sentence that stayed surface-level and name
the word they failed to zoom into — or (b) stating the element is entirely absent ("no effects sentence
exists — nothing to quote"). A judgment without the evidence it judges is unusable feedback. The mark
table's Why column stays ≤10 words; the evidence lives in My Assessment. Every board's
`protocol-a-assessment.md` must carry this rule (R&J gold has it as of v7.19.813 — replicate on refactor).

## A4. Never invent mark-scheme claims
Level descriptors, band names, mark allocations: quoted from the REAL board mark scheme only
(`feedback_never_invent_mark_scheme_claims`). No descriptor available in the protocol's reference
sections → don't cite one. Same for AO definitions (e.g. Edexcel IGCSE AO4 = Context, NOT SPaG).

## A5. Output hygiene — never show your working
All mark arithmetic is internal. No visible calculation, recalculation, rounding narration, running sums,
or mid-reply self-corrections. Output finished values only. **One carve-out (Neil, 2026-07-01):** the
word-count penalty MAY display its formula (e.g. "−4 marks (rounded from 77 × 5/100 = 3.85)") — students
should see exactly how the WC penalty is derived. Everything else: silent.

## A6. Numbers have ONE source of truth
Totals, percentages, grades are COMPUTED BY CODE from the per-section marks; the model echoes, never
derives. (Live evidence of why: one run produced chat total 3/34, doc summary 4.75/34, actual box-sum
1.75/34 — three numbers, all different.) Until the code-computed pipeline ships (Chat B), the protocol
must at minimum: state each section total ONLY in the canonical line `Total Mark for [section]: A/B`,
and compute the final total ONLY as `MIN(sum of those five lines, max − WC penalty)`.

**WC penalty = CEILING, never a deduction (Neil, 2026-07-02 — SETTLED, universal):** an under-length
essay already loses marks organically, so the penalty must not double-punish. It lowers the MAXIMUM
achievable (`max − penalty`); the section sum is never reduced. The ceiling only bites when the sum
exceeds it. Doc Score Summary + Auto grade chip apply the same MIN (v7.19.816).

**One ladder everywhere:** every grade the assessment outputs — per-section "Percentage & Grade" lines
AND the final grade — bands on the SAME canonical Sophicly ladder (9≥85% … 2≥15%). Never real-exam
boundaries for sections. (Live 2026-07-02: sections banded on the real-exam scale while the final used
the canonical ladder — two scales in one assessment.)

## A7. Golds are never shortened
Every gold/model rewrite is COMPLETE (full paragraph counts per section spec), every time, both models,
all sections (`feedback_never_shorten_model_answers`). "..." or "continue in this style" = violation.

## A8. Deterministic structure mapping + hard caps
Map student work to canvas sections by POSITION with a hard cap equal to the box count — never re-select,
re-order, or invent new section labels. Overflow content is acknowledged in prose (Final Summary teaching
note) but NEVER gets a marker/box/section mark. (Live evidence: a 7-paragraph essay pushed the model past
the cap; it filed "Body Paragraph 5" into Body 2's box, destroying real feedback.)

## A9. One question per turn; options render as buttons
Ask exactly one thing, wait. Multi-option asks use lettered options (quick-action detection renders them);
the 4-button gate strings are byte-exact. Never two questions in a turn — the second dies.

## A10. Protocol separation
Assessment never asks for rewrites/new content (that's Planning/Polishing). Planning never marks.
Cross-references between protocols go through the menu handoff, not inline blending.

## A11. Scope behaviour by capability, never by literal task/board name
The #1 recurring bug class (see WML CLAUDE.md "CANVAS TASK-SCOPING"): behaviour gated on a name string
silently no-ops for every sibling. In protocol text, board-specific rules carry an explicit BOARD-GATE
note stating the capability condition (e.g. "applies when the question assesses AO3(context)"), not a
bare board name — so replication to other boards forces a conscious keep/adapt decision.

## A12. House language
British English. The AI is **Sophia**. Banned: "Units" for sub-parts, "1-to-1" (except platinum Assessment
Review), "crib", "shows" as analytical verb (it's a PENALTY — W1), arrows (→) in student-facing model
answers, "patriarchy/patriarchal", magic/spellbook framing, "move" as a noun. Scholarly, calm, encouraging.

## A13. Golds follow the taught sentence order — rigidly (Neil, 2026-07-02)
Students copy gold models as templates: a gold that deviates from the taught structure UNTEACHES the
method even when it would score full marks. Every gold (BOTH models, EVERY section, EVERY assessed
protocol — language, literature, poetry, Shakespeare, modern) follows that paper's taught sentence order
exactly. For lit essays (TTECEA+C): (1) conceptual-ONLY topic sentence — **no technique words in the
topic sentence, ever** (that's what we penalise students for); (2) technique + anchor quote + inference —
anchor quotes sequenced Body 1 = beginning, Body 2 = middle, Body 3 = end of text/extract; (3) word-level
close analysis; (4) effect on reader ×2; (5) author's purpose; (6) context. Intro golds: hook = conceptual/
contextual claim, building sentences = the HISTORICAL/SOCIAL context itself (not craft commentary), then
context→author link, then three-point thesis. Other families (Language TTECEA, Section B IUMVCC, poetry)
apply the same principle to THEIR taught order. The AI self-checks each gold sentence-by-sentence before
emitting. (R&J gold protocol carries the rule as of v7.19.812 — replicate on every refactor.)

---

# PART B — ASSESSMENT PROTOCOL SPEC

The reference implementation is AQA Literature (`protocols/aqa/literature/modules/protocol-a-assessment.md`).
Mark VALUES/criteria differ per board+paper (read that paper's real mark scheme); the COMPONENTS and their
enforcement below are the invariant standard. Unit of assessment: **paragraph** (Literature essays),
**question** (Language papers), IUMVCC-section feedback + holistic mark (extended writing / Section B).

## B0. Opening message
- Time-expectation note: "This assessment takes approximately 20–25 minutes. Complete **all steps** to
  receive your full score, grade, and personalised feedback." — NEVER a hardcoded step count ("all 8
  steps" shipped wrong; counts drift). Greet by first name. State text + assessment type + word count.
- **Word count comes from the code-computed value** (must equal the editor's word-count widget exactly);
  the model never re-counts.

## B1. Pre-assessment chain (ALL gated, in order — each precondition names the previous reply)
**TWO distinct goals are captured — never conflate them (live failure 2026-07-02: the model threaded the
grade goal as the headline goal because the conceptual question never fired):**
- **Grade goal** = the number (7/8/9). Used for the WC-adjusted ceiling note + Final Summary framing.
- **Headline goal** = the CONCEPTUAL aim (convincing argument / effects / structure / …). This is the one
  that threads through every section and closes in the Final Summary. The grade goal is NOT a substitute.
1. **Grade-goal ask** — "what grade are you aiming for?" Selector limited to 7 / 8 / 9.
2. **Headline-goal question** (essay-level) — stem declares the hierarchy: "Looking at your essay as a
   whole: what was the **one main goal** you were working toward? You'll set a mini-goal for each
   paragraph as we go — this is your headline goal for the whole piece." Lettered options (close
   analysis AO2 / context AO3 / conceptual topic sentences AO1 / reader effects AO2 /
   strengths-and-weaknesses / F something else, free-text). Options, not open text — AO-anchored
   answers stay comparable with per-section targeting.
   **THREADING RULE (the hierarchy made visible):** every section's STEP 1 reflection lead-in cites the
   stored headline goal back ("Your headline goal was *[goal]* — as you rate this paragraph, consider
   how far it served that goal…"), and the Final Summary closes it (B6). Headline goal (essay) →
   mini-goal (paragraph) → calibration per paragraph → closure at the end: one thread, five stitches,
   one knot.
3. **Keyword-recall checkpoint** — "what were the key aspects this question asked you to explore?" +
   validate/correct against the actual question. Question-focus check BEFORE marking begins.
4. Only then: Introduction STEP 1. **The Introduction @REFLECT_GATE's precondition explicitly requires
   replies 1–3 to be present in the conversation** (this is the fix for the months-long silent skip).

## B2. Submission validation
- **First-ever diagnostic (Topic 1 Phase 1):** accept ANY structure (2 paragraphs or 8) — assess what
  exists against the 5-section map; be generous + teach. Essay plan optional (sole exemption).
- **Everything else:** 5-paragraph structure required (re-request if missing); essay plan required.
- **Word count:** Diagnostic → penalty `ROUND((target − wc) × 5 / 100)`, formula displayed (A5 carve-out),
  stated ONCE with the adjusted ceiling, tied to the student's grade target ("ceiling is now 30/34 —
  Grade 8 territory; your next full-length essay is where we chase the 9"). Redraft/Exam Practice →
  HALT below target until resubmitted. Target is per-paper (AQA Lit Shakespeare/modern: 650 / 34 marks).
- Once validated + stored: NEVER ask the student to re-paste any part of the essay.

## B3. Paragraph mapping (position-only + hard cap — A8 applied)
Paragraphs arrive PRE-LABELLED by code (v807) — the model trusts the labels, never re-detects. Two regimes:
- **First diagnostic (T1P1), under 5 paragraphs:** 1–3 paragraphs = BODY 1–N only; 4 = INTRODUCTION + BODY 1–3.
  Rationale (Neil, 11 yrs): first-time students write analysis chunks — almost none write an intro, none a
  conclusion. **Missing sections score 0 with TEACHING feedback** (normal-at-this-stage line + what the
  section does + ONE optimal gold from the coherent Model-2 essay; no reflection panel, no elevated model),
  card still emitted so the box fills.
- **5+ paragraphs, or any later attempt:** strict position map — First → Introduction; 2nd/3rd/4th →
  Body 1/2/3; LAST → Conclusion; anything between 4th and last = EXTRA.
AT MOST five `@FB` cards per assessment, labels only from {Introduction, Body 1, Body 2, Body 3, Conclusion}.
After the Conclusion's progression gate the ONLY remaining output is the Final Summary — never another
section, never another `@FB` card.

**EXTRA-paragraph response is TWO-TIER (Neil, 2026-07-02) — scope: Literature essays ≥20 marks (any text
incl. poetry anthology, one-part or Part a/b). Unseen-poetry short questions (e.g. AQA Q2 = 8 marks,
2 paragraphs) are a different shape — out of scope, handled when unseen is built:**
- **Tier 1 — Topic 1 Phase 1 diagnostic ONLY (the one attempt before we teach the structure): generous.**
  Extras named + briefly characterised in the Final Summary, a rough extra-marks estimate ("might earn
  another 2–4 marks in a real exam"), then the repeatable-structure lesson — five-paragraph essay is the
  conventional, transferable structure; consolidate the strongest analysis into three body paragraphs.
- **Tier 2 — EVERYTHING else (any later diagnostic, redraft, Topic 2+, exam practice): stern.** By now the
  student has been walked through planning step-by-step — >5 paragraphs per question means the process was
  skipped. Extras score **ZERO** (stated plainly, no estimate), a stern-but-caring warning, and an explicit
  instruction to go back and redo the planning step properly before their next submission. Never soften
  Tier 2 into Tier 1.

## B4. Per-section cycle (×5 — identical shape, every section, equal depth)
1. **STEP 1 — Reflection panel.** One-line contextual lead-in (section's function in the argument arc:
   intro=set up, B1=foundation, B2=development, B3=climax, conclusion=synthesis) **+ the headline-goal
   thread (B1.2: cite their stored essay-level goal back in the lead-in)**, then on its own line:
   `@REFLECT_GATE{"q":"<label>","skill":"<section skill>","ao":[...],"max":<section max>}`
   Panel captures: predicted mark + self-rating 1–5 + AO chips + free-text intent. WAIT for the single
   combined reply. Never ask these as prose questions.
2. **STEP 2a — Acknowledge + gate.** Echo their rating/prediction/AOs, then "type **Y** to see your mark
   breakdown." HARD STOP — turn ends. (Reflection and marks always land in separate turns.)
3. **STEP 2b — the feedback card.** In order, all inside `@FB_BEGIN{"q":"<label>","title":"<label>"}` …
   `@FB_END`:
   - Quote the section's submitted text (reference for the student).
   - **Mark Breakdown table** `| Criterion | Worth | Your Score | Why |` — every criterion from the
     paper's scheme with its worth; Why ≤10 words, fragment.
   - **Penalties** — capped (2 intro/conclusion, 3 body), each `CODE (−X.X): "<student's verbatim
     phrase>" → Fix: "<worked rewrite>"` (A3 + fix-example rule). Priority order: structural →
     analysis → mechanics.
   - Totals: raw, total penalties, then the canonical line `Total Mark for [section]: A/B`.
   - Percentage + Grade for the section (canonical band).
   - **Level Alignment** — real descriptor quoted + specific path to the next level (A4).
   - **Calibration Check** — (a) self-rating vs actual; (b) predicted vs actual, DIRECTION-adaptive:
     over-predicted → which ONE criterion did you over-rate and what does it actually reward;
     accurate (±1) → which criterion were you surest of and what exact evidence earned it;
     under-predicted → which strength did you undervalue. ONE question. (c) AO-targeting vs the
     section's canonical AO profile (intro AO1+AO3; body AO2-dominant; conclusion AO1+AO3).
   - **My Assessment** — What You Did Well / Where You Lost Marks (per criterion) / Penalties Explained /
     exactly 3 Priority Improvements ranked by mark gain.
   - **Gold Standard model 1 — the student's section elevated.** MUST rewrite to the TRUE target shape,
     ADDING any missing ingredient (no context → the rewrite supplies context; changing their content is
     expected and is the point). Complete (intro 4–5 sentences, body 7–10, conclusion 5–7).
   - **Gold Standard model 2 — the optimal model, coherent across the essay (SELF-ANCHORING).** The
     Introduction's model 2 commits to a three-point thesis. Each Body N model 2 MUST develop point N of
     that thesis, explicitly continuing the previously OUTPUT model-2 sections (they are in the
     conversation — they ARE the persistent state; no hidden plan to lose). The Conclusion's model 2
     resolves that same argument. Result: the five model-2 sections read as ONE coherent Grade-9 essay.
   - **"Why these work"** breakdown (hook/building/thesis for intro; TTECEA+C for bodies; restated
     thesis/synthesis for conclusion) + offer of clarification.
4. **Progression gate** — 4-item precondition (STEP 1 artifact, mark table + canonical Total line,
   calibration, both golds) then the exact continue line + the 4 literal buttons. Anti-loop per A1.4.

**Canvas effects the protocol relies on (must hold on every section):** card auto-files to the correct
box (replace-not-append), actual mark auto-selects from the canonical Total line, Predicted/Actual/Δ chip
renders, view scrolls to the section as it files, section check mark appears on completion.

## B5. Section shapes (AQA Literature values — per-paper equivalents live in that paper's file)
Intro 3 marks / 4 criteria · Body 8 marks / 11 criteria (TTECEA+C: topic-concept, embedded quotes,
strategic selection, terminology, link-to-topic, close analysis 1.5, interplay, effects ×2 (Focus/Feel/
Think/Act chain), author's purpose, context) · Conclusion 7 marks / 7 criteria. Sequencing safeguard
(AQA Lit): B1=beginning, B2=middle, B3=end of text. The STANDARD is: granular per-criterion worths
summing to the section total, every criterion scored with a Why — never a holistic single number
(EXCEPT extended-writing/Section-B tasks: holistic mark + per-IUMVCC-section feedback + ONE labelled
holistic gold — see WML CLAUDE.md per-paragraph rule).

## B6. Final Summary (after Conclusion's ✓)
In order: Final Total (sum of the five canonical lines minus WC penalty — A6) → overall %/grade (always
`Y%, which is a Grade Z`) → Technical Accuracy note → overall Level alignment (real descriptor) →
**Metacognitive journey**: self-rating pattern across all five sections, AO-targeting pattern, and
**closure of the B1 main goal** ("you set out to improve X — here's what this essay shows") →
extra-paragraph note if applicable (B3) → WC advice if penalty applied → **Action Plan** (Hattie: Where
am I going? / How am I going? / Where to next?) → **Transfer prompt** (apply the chosen skill to another
subject — one concrete example) → offer to rebuild one body paragraph line-by-line → Session Conclusion →
Closing gate: 5-item precondition (Final Total, %/grade, Technical+Level, Action Plan, `[ASSESSMENT_COMPLETE]`)
then the exact wrap line + 4 buttons. Overall Feedback files to the Overall Feedback section; Score Summary
(dates, word count, totals, %, grade + boundaries) populates; Date Completed stamps; sidebar shows the grade.

## B7. Detours (student questions mid-assessment)
Welcome, Socratic, ONE concept + example + understanding check; no mark table during a detour; always end
with the resume-confirm block; depth cap 3 then nudge back; the state block (`current_paragraph`) is
authoritative — never guess the resume point.

## B8. Data pipeline
Everything persists: marks per section, predicted/actual/Δ, grade, dates → student-data listener →
dashboard (MyWork, grades ring, course steps). Producer-consumer rule (CHAT-OWNERSHIP §7): a protocol
change that alters emissions is not "shipped" until the data lands in the dashboard.

## B9. Frontend contract (markers/strings the canvas hard-codes — breaking any = silent feature loss)
- `@REFLECT_GATE{"q","skill","ao","max"}` — q from the five labels; max REQUIRED (predict row depends on it).
- `@FB_BEGIN{"q","title"}` / `@FB_END` — labels from the five, exactly; balanced pairs; 5 per assessment.
- `Total Mark for [section]: A/B` — the auto-fill regex target (score may be decimal; 0.5 steps).
- `[ASSESSMENT_COMPLETE]` — activates Mark Complete.
- The four gate buttons, byte-exact incl. emoji.
- Lettered options `A)`…`F)` for quick-action rendering.

## B10. Grep-able acceptance checks (run on any assessment protocol before ship)
| Check | Expect |
|---|---|
| `grep -c '@REFLECT_GATE'` | ≥ 1 per assessed section (5 for Lit essay) |
| `@FB_BEGIN`/`@FB_END` instruction SITES ("Now output …" lines) | one balanced pair per section template (raw string counts differ — prose rules mention the markers; that's fine) |
| `grep -c 'Total Mark for'` | = section count (canonical line present per section) |
| `grep -c 'ASSESSMENT_COMPLETE'` | ≥ 1 |
| `grep -c 'HARD PRECONDITION'` | ≥ 1 per gate (each REFLECT/mark/progression chained) |
| `grep -c 'Got it — continue'` | = section count + 1 (per-section + closing) |
| `grep -ci 'all [0-9]+ steps'` | 0 (no hardcoded step counts) |
| Level descriptors | quoted from the paper's real scheme section, none invented |
| Every penalty instruction | includes verbatim-quote requirement + fix-example |
| Grade-target + main-goal + keyword-recall | present AND named in the Introduction gate's precondition |
| Gold model instructions | "COMPLETE"/never-shorten language present; model-2 self-anchoring rule present |

---

# PART C — PLANNING PROTOCOL SPEC (STUB)

Planning is the flip side of assessment — same Part A invariants, mirrored components (assessment's
predict-mark reflection ↔ planning's anchor-quote commitment; per-criterion mark table ↔ per-element
scaffold check; calibration ↔ plan-vs-execution review). **Fill this part only after the assessment
standard has survived contact** (P1/P2 conversions built against Part B, Neil signed off). Reference
candidates for the planning gold: `protocols/aqa/literature/planning/` b-modules — evaluate and pick
the reference explicitly with Neil before codifying.

---

# APPENDIX — KNOWN-GAP REGISTER (2026-07-01 live-run audit, R&J AQA diagnostic on staging)

Violations observed with the standard above, and the owning lane:

| # | Gap | Fix | Lane |
|---|---|---|---|
| 1 | Box overwrite: 7-para essay → model assessed "Body Paragraph 5 (Paragraph 6)" INTO Body 2's box | Code guard: a filled+confirmed box refuses re-file; protocol: sharpen post-Conclusion stop | B (code) + A (protocol) |
| 2 | Three different totals (chat 3/34, doc 4.75/34, box-sum 1.75/34) | Code-computed totals from canonical lines; model echoes (A6) | B (code) + A (protocol wording) |
| 3 | Fabricated penalty quote (B3 W1 quoted phrase absent from paragraph) | Code validator: penalty quote must appear verbatim in section text, else strip+log; protocol A3 stays | B (code) |
| 4 | Keyword-recall + main-goal silently skipped (prose, ungated) | Gate both into the Introduction precondition chain (B1) | A |
| 5 | "Complete all 8 steps" hardcoded in greeting | "all steps" (greeting lives in class-protocol-router.php) | B |
| 6 | Score Summary section missing its ✓ check mark | completion-island handoff item | B |
| 7 | No progress card above tutor sign-off | completion-island item 3 (doc structure + migration — careful) | B |
| 8 | Essay-plan T1P1-only exemption not enforced | completion-island item 4 | B |
| 9 | Optimal golds not coherent across sections | Self-anchoring rule (B4 model 2) | A |
| 10 | Grade-target selector: verify limited to 7/8/9 | verify + wire if not | B |

---

## Changelog
- 2026-07-01 — v1. Extracted from the R&J gold file (full read) + Neil's walkthrough (screenshots +
  transcript) + live-run audit. Decisions locked: keep+gate keyword-recall AND main-goal (hierarchical,
  not redundant); WC-formula display carve-out; self-anchoring optimal golds; gold-1 adds missing
  ingredients; "all steps" not counts. Author: wml-chat-A (Fable).
- 2026-07-02 — v1.1. Added the REPLICATION PLAYBOOK appendix (below). First execution: AQA Language
  P1 (v7.19.826). Author: wml-chat-A (Fable).

---

# APPENDIX — REPLICATION PLAYBOOK (porting the standard to a new paper)

The proven step-by-step procedure for converting any paper's assessment protocol to this standard.
First executed on AQA Language P1 (v7.19.826) — the per-step references point at that build.
Run the phases IN ORDER; each phase's output is the next phase's input.

## Phase 0 — Recon (parallel, before any writing)
1. **Audit the current protocol** against Part B: count HARD PRECONDITIONs, 4-button gates,
   canonical Total lines, pre-chain gating, descriptor sources, WC rule shape. (The B10 table is
   the checklist.)
2. **Map the engine**: (a) router — is the paper in `is_assessment_state_machine_enabled` +
   `assessment_mode()` (`$question_subjects` — BOTH lists)? Does `assessment_question_order()`
   resolve its spec JSON? (b) frontend — marker contracts (`_parseReflectGate`, `applyAssessmentFeedback`
   region filing, `_detectQuestionTotal` regex), pre-chain gating in BOTH `sendCanvasMessage`
   pipelines, the `getResponseText` labeller path (single-section lit vs multi-section language),
   SA skill sets. Get file:line for every hook.
3. **Audit the paper's LOADED MODULE SET** (its `manifest.json` `assessment.always`) for
   contradiction sources: second grade ladders, workbook-copy relics, retired-mode branches
   ("Exam Practice"), task menus, gold-suppression rules, "model counts words" instructions,
   table-vs-bullets conflicts. Every file the manifest loads is in the AI's context — a
   contradiction anywhere is a coin-flip at runtime.
4. **Extract the REAL mark-scheme descriptors** (A4): pdftotext the board's actual mark scheme
   (Drive: "Sophicly Etch Mark Scheme Resources/"), verbatim, into
   `modules/knowledge-mark-scheme-<paper>.md`, tagged with source + page. Add it to the manifest
   (reference data LAST). If a descriptor can't be sourced, the protocol says "no descriptor
   available" — never invent.

## Phase 1 — Delta doc → Neil sign-off (the gate before build)
Write the delta doc: VERDICT (audit) / PAPER SHAPE (marks ÷ 4 taught-structure map) / PORTS
VERBATIM (the invariant spine below) / SWAPPED (paper content) / ENGINE WORK / DECISIONS for Neil.
No build until every decision is ruled.

**The invariant spine (ports verbatim, every paper):** gate mechanism texts (HARD PRECONDITION
naming the previous artifact; HARD STOP turn-split; 4-button gate + anti-loop), the Internal AI
Notes (feedback card, calibration-gap direction-adaptive, output hygiene, anti-fabrication,
criterion-evidence quote-or-Absent, gold self-anchoring, gold sentence-order self-check,
never-shorten), WC ceiling MIN rule, ONE canonical ladder, canonical Total lines, Final Summary
sequence + 5-item closing gate + `[ASSESSMENT_COMPLETE]`, detour protocol (depth cap 3 +
resume-confirm), missing-section teaching-not-critique, two-tier EXTRA rule, pre-chain
(grade goal → headline goal → keyword recall, all named in the first gate's precondition).

**What swaps per paper:** unit of assessment (paragraph/question/IUMVCC), element lists + worths
(from the paper's real spec), taught sentence orders, AO chips (paper-true only), penalty-code
set, descriptor file, word targets, headline-goal options (paper's real AOs), reflection
granularity (Lit = per section; Language = per question, D1).

## Phase 2 — Build
1. **Rewrite `protocol-a-assessment.md`** from scratch against Part B + the delta doc. Do not
   patch the monolith — port the spine, swap the paper content. Keep the frontend contract exact:
   `@REFLECT_GATE{"q","skill","ao","max"}`, `@FB_BEGIN{"q","para","title"}` (distinct titles =
   distinct box regions), `Total Mark for [label]: X/max` (per paragraph), `Qn Total: A/B`
   (question auto-fill), `Total: X/max` + `Grade: N` + `[ASSESSMENT_COMPLETE]` (completion),
   the four gate buttons byte-exact, `@SECTION_BEGIN{"section":"Overall Feedback"}`.
2. **Engine items** (language question-mode reference, v7.19.826): enable the paper in BOTH
   `$question_subjects` lists; verify the harvest regexes accept the protocol's canonical lines
   (`extract_question_result_from_message` — the `Qn Total` form); port the setup-phase block +
   headline-goal capture/echo + pending self-heal into the paper's state-block builder; un-gate
   the pre-chain in BOTH sendCanvasMessage pipelines with paper-true goal options; extend the
   `getResponseText` labeller (per-question paragraph labels vs taught count, code word counts);
   add SA descriptor sets. EVERY chat feature lands in BOTH pipelines — the dual-pipeline rule.
3. **Prune every contradiction source found in Phase 0.3** in the same ship — a contradiction
   left loaded is a coin-flip the model arbitrates at runtime.

## Phase 3 — Self-verify (before Neil touches it)
1. **B10 grep checks** on the new protocol file (adapt expectations to the paper's shape).
2. **Validation**: `php -l` every touched PHP file, `node --check` every JS, JSON-parse the
   manifest, brace-count.
3. **State-block dry run**: assessment + redraft contexts through the router (setup phase →
   mid-flight → wrap-up mandate).
4. **Synthetic replay on staging**: scripted AI replies through `applyAssessmentFeedback` /
   reflect panel / summary for every question — boxes fill (right box, right region), actual
   marks auto-set from the canonical lines, sidebar advances, Score Summary computes,
   `[ASSESSMENT_COMPLETE]` activates Mark Complete. Both pipelines × {diagnostic, redraft}.

## Phase 4 — Neil's one-shot live run
Staging (uid 1355), full paper end-to-end. Any red console error = fail. Then prod.

# APPENDIX — P1 FIRST-LIVE-RUN LESSONS (2026-07-03, v7.19.829 — apply to EVERY future port)

Neil's first full AQA Lang P1 run surfaced defects that generalise. Each is now either
engine-enforced (E) or a protocol contract rule (P). Grep-check them on every new paper:

1. **(P) Qn Total line hygiene.** `Qn Total: A/B` — A is a WHOLE number; NOTHING after `A/B`
   on the line. The engine files the line's LAST X/Y as the awarded mark, so a trailing
   "(ceilinged at 27/40)" filed the CEILING as the mark → Score Summary said 55/80 while the
   honest sum was 53/80. Ceiling/arithmetic notes go on their own line BEFORE the total.
   (E: `_extractQuestionMark` now also strips parentheticals — belt and braces.)
2. **(P) Penalties are applied-only, protocol-blind.** Never show a considered-but-rejected
   penalty ("W1 … no deduction applied" = leaked deliberation); never cite "(protocol: …)" in
   student-facing feedback. Enumerate the W1 banned-verb family explicitly so marking is
   consistent run-to-run.
3. **(P) Reflect panels: full paper AO set + never re-ask.** AO chips list EVERY AO the paper
   assesses (choosing is the calibration act; mis-targeting = teaching moment). Nothing the
   panel captured is ever re-asked in prose. Router preamble now carries a PROTOCOL-PANEL
   OVERRIDE: @REFLECT_GATE protocols supersede the legacy per-paragraph two-question cycle.
4. **(E) Chat furniture never reaches the document.** Q-GATE lines ("Does that clear it up…")
   + `[button]` rows are stripped by every feedback-card detector (`_stripChatFurniture`).
   Protocol: keep the gate AFTER the total; engine strips it regardless.
5. **(E/P) Per-question reflection is state-gated.** The router state block derives "panel
   emitted since last question closed" from chat truth and mandates the panel before any
   marking of the current question (the model had rolled Q2's rating into Q3).
6. **(E) Recall-target rotation.** The pre-chain keyword-recall question rotates by attempt
   (Q4 → Q2 → Q3 → Q5), code-owned in BOTH the router setup block and the frontend pre-chain —
   keep the two rotations identical.
7. **(E) Sidebar paragraph detection anchors on `Mark Breakdown — <name>` headings only** —
   prose mentions of "Paragraph 2" (calibration checks) created phantom beats.
8. **(P) Overall Feedback shows the MARK (`Total: X/80`), not just the percentage** — students
   must be able to trace the number. Chat total, Overall Feedback and Score Summary must derive
   from the same five whole-mark totals.
9. **(P/E) Action Plan + Analytics AUTO-FILE (Neil RULED 2026-07-03; built v7.19.830).** Date
   Completed requires SA + Analytics + Action Plan complete. The Final Summary now FILES Action
   Plan + Analytics into the doc via TWELVE `@FIELD_SET` markers (one per field id, single-line
   JSON values — see the filing step in the AQA lang1/lit protocols); Self-Assessment stays the
   student's manual act (stage-revealed + listed by the Document Progress card). Engine
   guarantees: `applyFieldSets` fills inputFields ONLY while empty (a student edit is never
   clobbered — replay/heal/re-emit safe); `applySectionFills` REFUSES wholesale replace of any
   field-bearing section (inputField/selectField nodes survive by construction); a silent repair
   turn re-requests missing markers on the closing-gate turn; the doc-heal replays filing
   markers from the transcript. **Every board port MUST carry the filing step** — grep
   `action-grade-goal` in the protocol; the closing-gate precondition must count the filing
   block. Filed sections stay student-EDITABLE.
10. **(E/P) Mark arithmetic is CODE-VERIFIED (v7.19.832 — universal engine).** The Run1-vs-Run2
    audit (2026-07-03) proved a 4-mark grade-boundary gap from pure LLM arithmetic (penalties
    declared but not subtracted; invented per-section rounding). The engine now recomputes every
    @FB card's total from its own `Worth | Your Score` table − `Total penalties:` line and
    corrects mismatches, and verifies `Qn Total` lines (word-count-ceilinged totals exempt).
    PORT REQUIREMENT: every protocol's cards must keep the auditable shape — a `Worth`/`Your
    Score` markdown table, a `Total penalties: −X` line, a `Total Mark for [unit]: X/Y` line.
    Sub-totals stay DECIMAL (round ONCE, at the question/final total); no "Base total: X/Z"
    lines; protocol text must say so (grep: "NEVER round").
11. **(E/P) Canonical grade ladder is CODE-ENFORCED (v7.19.832 — universal engine).** Every
    "X%, which is a Grade N" line and post-Total `Grade: N` line is re-banded in code on the
    ONE ladder (9≥85 · 8≥75 · 7≥65 · 6≥55 · 5≥45 · 4≥35 · 3≥25 · 2≥15). Protocols still state
    the ladder (grep: "CANONICAL GRADE LADDER") — the code is the net, not the excuse.
12. **(P) Calibration-check choices = the REAL units of THAT paper's structure.** Generic rule,
    instantiated per paper: lettered options must be the units just marked (Lang P1 Q4:
    Introduction/BP1-3/Conclusion; Q2/Q3: ¶1/¶2; Q5: AO5/AO6; Lit essay: Intro/Body 1-3/
    Conclusion; multi-part papers: their real parts). NEVER feedback bullets as buttons.
13. **(P) Penalty (& Ceiling) Ledger in the final summary.** Per-code sums with counts, ceiling
    cost where a word-count ceiling exists, + the reframe "without penalties you'd be on
    [X+P]/[max] ≈ Grade [N] — cheapest marks to reclaim". Honest sums from the actual cards.
14. **(P) Honest duration estimate.** State the realistic completion time for THAT paper family
    (Language full papers: 30–45 min) — never an inflated figure that scares students off.
