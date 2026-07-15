# ASSESSMENT-MECHANICS.md — the engine/UX contract for WML assessments (v2)

**What this is.** The universal MECHANICS standard: how the assessment engine and canvas UX
actually work, why they work that way, and the failure classes that bite when you forget.
It pairs with **PROTOCOL-STANDARD.md** (the protocol CONTENT contract): a port is done when the
protocol meets PROTOCOL-STANDARD and the experience meets THIS document.

**v2 (2026-07-07).** Anchor state: **v7.19.934** (prod + staging), **AQA Lang P1 = THE gold
standard and the ONLY trusted reference** (Neil ruling 2026-07-07: the R&J/AQA-Shakespeare
protocol is demoted until re-audited against P1 — one AQA lit protocol serves Shakespeare,
modern AND 19th-century, so its gaps propagate; audit queued as the next lane-A arc). Reference transcript: **Reeham Run 9** (diagnostic, 51/80 Grade 6 — box labels, Score
Summary, calibration readout, and committed grade all agree; totals 49/50/51 across Runs 7–9 =
the consistency Neil signed off as "massive success"). v2 folds in every mechanic shipped
v915→929 and expands the failure-class index into the full POTENTIAL-ERRORS REGISTER (§9) Neil
asked for, plus the harness testing method (§10).

File anchors drift with edits — treat every `file:symbol` here as "grep this symbol", never as a
hard line number.

---

## §0. DOCTRINE — root, universal, dynamic (Neil's three words, made testable)

Every fix/feature must pass all three tests BEFORE it ships:

1. **ROOT** — you can state the mechanism of the bug in one sentence that names the actual
   cause, and your change removes that mechanism (not its symptom). Test: *"if I revert the
   symptom-site and keep my fix, does the symptom stay gone?"* Evidence first: WML exports the
   CONSOLE LOG inside every saved assessment doc — read it before theorising (Run 7's log is how
   the v912 scroll bug was proven: every scroll "fired correctly", so the fault had to be
   geometry, not targeting).
2. **UNIVERSAL** — the fix works for every sibling (board, paper, question, topic, pipeline)
   with ZERO per-sibling edits. Test: *"if we added a new exam board tomorrow, would this work
   untouched?"* Mechanically: gate on **capability/family, never a literal name**
   (`task.startsWith('cw_')` is how features silently no-op for siblings — the #1 WML bug
   class); cross-cutting consumers run **unconditionally + self-guard** (no-op internally when
   there's nothing for them); new tasks opt in via **config**, not new code branches. The v925
   tick/chevron fix is the template: a **capability class** (`.swml-collapsible`) stamped by the
   NodeView WHEREVER it installs a chevron, and every consumer (tick clearance,
   position:relative, collapse-all) keys off the class — the v762 enumerated selector list it
   replaced missed every section type added after it was written.
3. **DYNAMIC** — counts, targets, labels, and structures are derived from the live document /
   protocol / config at runtime, never hardcoded. Test: *"if Neil reorders or renames sections
   in the template, does this still work?"* (v911 beat-chip counts come from the doc-derived
   sidebar model, NOT the model's "Step N of M"; v912 scroll finds boxes by canonical key, not
   position — both survived Neil moving Self-Assessment above the feedback boxes.)

Plus the standing bar (CLAUDE.md NORTH STAR, restated for the port): if you can NAME a failure
mode, engineer it out in the same change; "test and see" is only for genuine unknowns; batch the
whole fix-list into one Neil test cycle; fail loud (`console.warn` on every silent-skip path).

**The protocol states the rule; CODE is the net.** v923 wrote the analytical-verb tier list into
the protocol; Run 9 charged 'frames' anyway. The v927 net (`_stripStrongVerbPenalties`) is why it
can never reach a student. Every rule that matters gets this pair: protocol instruction (so the
model usually behaves) + engine net (so it doesn't matter when it doesn't).

---

## §0b. THE UNIVERSALITY MAP — what ports for FREE vs what each board adapts (Neil, 2026-07-07)

AQA Lang P1 is the gold standard; every other board/paper is brought UP to it. The port cost is
low because the machine splits three ways:

**Tier 1 — ENGINE-UNIVERSAL (zero per-board work; already works for every port by construction):**
the whole session lifecycle (pre-chain, blind SA walk, marking loop, closing chain, Mark
Complete); ALL arithmetic nets (§4 — auditor, ladder, ledgers, ceilings, grand total, tier-list
net); collapsibles + ticks + collapse-all + strips + feedback pad + beat chip + scroll + queued
sends (§2–3); Learn chips + emoji layer (§8); analytics/calibration/blind-spot readouts (§5);
persistence, reseed, replay (§7); the naming layer (§6); Overall Feedback / Score Summary /
Analytics / Action Plan filing. **If a port session finds itself re-implementing ANY of this,
stop — that's a §9.1 name-guard bug in the engine to fix universally, never a per-board copy.**

**Tier 2 — DOC-DERIVED (adapts AUTOMATICALLY because it reads the live document/config, §0.3):**
SA-walk rows (parsed from that paper's SA section); sidebar model + beat counts; strip contents
(from labels); feedback-box set + Q-identity; word-count section model; `_paperFullyMarked`.
A new paper with a different question structure gets all of this right by seeding the right
template — no code.

**Tier 3 — PROTOCOL-PORTED (the actual per-board work, spec'd in PROTOCOL-STANDARD Part B +
PORT SOP):** question structure + AO mapping + mark values + band anchors from that paper's REAL
mark scheme; SA rubric rows (constant core + variable rows derived from the paper's longest-Q +
Section-B scheme); recall-rotation targets; golds' taught order per family (TTECEA / TTECEA+C /
IUMVCC / story-spine); leniency family; holistic scope (which units mark holistically). This is
CONTENT, not mechanics — the machine never changes.

---

## §1. THE SESSION LIFECYCLE (the experience spine — all code-driven, no LLM control flow)

Entry paths (all → `initAssessmentState()`, wml-assessment.js): A "Get Assessed" stepper,
B diagnostic → Mark Complete transition, C re-enter completed assessment. One function owns
sidebar progress + Mark Complete state for all three.

The **pre-chain** (deterministic, button-driven, zero AI round-trips until marking):
1. Grade goal → 2. Headline goal → 3. Key-aspects recall (student answers; instant deterministic
ack; Sophia's real VERDICT opens the marking turn — v904 coherence rule: **a student answer must
be acknowledged in the same breath it's given, and judged at the first moment judgement exists**)
→ 4. **Blind SA walk** (`_saWalkRenderCurrent`): every Self-Assessment row presented one at a
time BEFORE any mark is revealed (post-reveal self-rating = echoing, not judgement — the
metacognition rationale). Rows read from the DOC (`_saWalkRows` parses the SA section), so the
walk is paper-agnostic. Typed 1–5 = first-class fallback (reload-safe). Walk offers the
**writing pop-out** quick action (v914) — self-assessing against the real text, not memory.
5. Hand-back fires ONE silent SYSTEM directive → marking begins.

**Marking turns** (per question/paragraph): protocol emits the feedback-card shape
(PROTOCOL-STANDARD B-COMMON §5); the engine files, audits, scrolls, chips, and counts. The
student's only job per turn is reflection + continue.

**Beat chip** (assessment micro-progress, v906–921 arc): in-progress gradient bar + Playfair
label on every marking turn. The marking count comes from the doc-derived sidebar model, never
the model's own beat claim; a completed group falls back to its group label (v918); the closing
chain shows its own arc ("Action Plan · N of 4", v921). The beat is **stored on the history
message** and re-rendered by both resume loops — the refresh-replay pattern every per-turn UI
must follow.

**Closing chain** (`_fireClosingFiling`): code-derived FACTS (ranking, losses in
marks-lost order, calibration, blind-spot, **and the code-tallied penalty Trend** — exact codes /
counts / instances from the penalty-ledger card store, v921/v924) are APPENDED to the closing
directive so the AI files Analytics/Action-Plan from authoritative inputs — the AI renders,
never recomputes. Commit = auto-committed grade (`assessment auto-committed` log line) + server
flush.

## §2. DUAL PIPELINE + UI SENDS — the standing tax on every chat feature

Two `sendCanvasMessage` pipelines exist (primary + twin; plus main-chat planning). EVERY
cross-cutting consumer (`applySectionFills`, `applyAssessmentFeedback`, `applyFieldSets`,
beat-chip sync, pre-chain drivers, closing chain, learn-chip tagging, strip rendering) must be
called from BOTH canvas pipelines and must self-guard. The checklist in CLAUDE.md §DUAL CHAT
PIPELINE is mandatory per feature. Replay (refresh/cross-device) re-renders from
`canvasChatHistory` — anything a live path renders into a bubble must ALSO be stored on the
history message and re-prepended in BOTH resume loops (v911 beat pattern: store
`{section,step,total}` on the message; replay calls `progressChipHTML(msg.beat)`).

**QUEUED UI SENDS (v926 — the anti-silent-drop rule).** While `canvasChatLoading` is true, a
direct `sendCanvasMessage()` call is silently eaten by the in-flight guard (Run 9: the Q3
quick-action click did NOTHING). Every **UI-driven** send (buttons, quick actions, gate rows)
goes through `sendCanvasMessageQueued()` — exists in BOTH pipelines, exported on the tp handle —
which polls until idle then sends. Boot-time silent directives keep DIRECT calls deliberately
(they must not queue behind user turns). New button = queued form, no exceptions.

**SHARED-SURFACE UX LIVES IN THE SHARED RENDER FN (v962 — Neil, "fix once, fixed across the
board").** Any behaviour EVERY chat message/turn experiences — autoscroll, message positioning,
typing indicator, quick-action bars — belongs in the ONE function every message flows through,
and there are TWO (dual pipeline): `addChatMessage` (canvas, wml-assessment.js) and `addMessage`
(main/planning, wml-app.js). Fix BOTH, keep identical. A UX fix applied to a single bubble or
gated on a task name is a §9.1 name-guard bug and WILL recur on every sibling surface (the
message-top-align scroll was fixed once on the Self-Assessment bubble, then recurred on the FQ +
mark-scheme quiz until it moved into the shared fn). Canonical: a message taller than the viewport
aligns its TOP to the chat top so the start is always visible; short messages still scroll to
bottom. See memory `feedback_shared_surface_fix_in_one_function`.

## §2b. THE AUTO-FILL CONTRACT — how chat fills the document (Neil, 2026-07-07: codified
because it generalises — assessment, planning, creative writing, conceptual notes all use it)

Function-calling is DISABLED (settled): **text markers are the API.** The AI emits a typed marker
on its own line inside its normal reply; the frontend extracts it and writes the document. The
whole mechanism is five steps, and every current and future auto-fill follows them:

1. **MARKER — a byte-stable typed line the model emits.** Assessment: `@FB_BEGIN{json}…@FB_END`
   (feedback cards), `@FIELD_SET` (the twelve Analytics/Action-Plan fields),
   `@SECTION_BEGIN{"section":"…"}` (section fills, e.g. Overall Feedback), `@REFLECT_GATE{json}`
   (reflection panels), `@SUMMARY_COMPLETE` / `[ASSESSMENT_COMPLETE]` (stage transitions).
   Planning: `@CONFIRM_ELEMENT` (plan elements save ONLY through the confirm interceptor — the
   old fallback regex extractors are retired, never re-add). Every marker's exact form is pinned
   in PROTOCOL-STANDARD B-COMMON §12 (the frontend contract) — breaking a byte breaks the fill.
2. **EXTRACTOR — one consumer per marker family, runs on EVERY turn in BOTH pipelines,
   self-guards.** `applyAssessmentFeedback`, `applySectionFills`, `applyFieldSets`, reflection
   detection: called unconditionally, no-op internally when the reply has nothing for them.
   NEVER gate an extractor on a task name (§9.1 — the #1 recurring bug class).
3. **TARGET RESOLUTION — canonical key, never position or literal label.** Feedback cards land
   by question NUMBER (`_paraKey`: "Q2"/"Question 2"/"2" → "2"); sections by canonical section
   name; fields by field id. New surfaces resolve through the same helpers.
4. **WRITE — a PM transaction into the section's content** (`insertContentAt`,
   `_setParagraphContentViaPM`; labels/attrs via `setNodeMarkup`) — §3 PM law applies in full.
   Numbers pass through the code auditor BEFORE they are written (§4); fresh-filled boxes
   auto-expand + scroll (§3); the fill is idempotent (re-running on the same reply changes
   nothing).
5. **PERSIST + REPLAY — the fill must survive refresh.** Non-reproducible fills flush to the
   server immediately (§7); anything rendered per-turn is stored on the history message and
   re-rendered by both resume loops (§2). ONE silent repair when a mandated fill is missing
   (closing chain); every unresolvable marker `console.warn`s loudly — a marker that names a
   target that doesn't resolve is a defect, never a silent skip.

Porting auto-fill to a NEW surface (planning boards, CW scaffolds, conceptual notes) = define
the marker in the protocol + B-COMMON §12, add ONE self-guarding extractor called from both
pipelines, resolve targets by canonical key, write via PM transaction, store for replay. No new
architecture — the five steps ARE the architecture.

## §2c. QUIZ→DOC AUTOFILL + THE ONE-DOC LAW (v7.19.955 — Neil rulings 2026-07-07/08)

**Quizzes are programmatic end-to-end**, so their auto-fill needs no marker: CODE is the emitter.
The parsed-marker core of `applyFieldSets` is extracted as `_applyFieldValueSets(sets)` — code
callers file `{field, value}` pairs through the exact same steps 3–5 above (canonical fieldId,
PM transaction, idempotent, auto-fill provenance so a student edit is never clobbered). Never
fork a second write path for a code-driven fill; call the core.

**The FQ concept-note contract** (the first instance): bank questions carry `@form:<slug>` (slug
= slugified `###` heading of the bank's `.concept-notes.md` sidecar, kept OUT of the `[Tests …]`
stratification key); `/quiz/answer` attaches `note:{form,slot,text}` on a CORRECT answer (slot
from the question's own category); the controller files every note at the **REVEAL turn only** —
a mid-quiz fill would leak the correctness the quiz deliberately withholds. Tokenless questions
never autofill (by design); a tagged question with no sidecar note `error_log`s loudly.

**ONE-DOC LAW (FQ ↔ Conceptual Notes):** the FQ's canvas doc IS the CN doc. Doc identity resolves
through `WML.canvasDocScope()` (wml-core) — the text/topic twin of `resolveCanvasSuffix`: FQ maps
to suffix `_cn`, text = `state.fqBank || state.text` (the served BANK — poetic_forms is ONE shared
organiser across courses), topic pinned to the CN slot (2). EVERY canvas load/save/signoff/attempts
call keys off this scope, never raw `state.text`/`state.topicNumber` — a raw read forks the shared
doc back into separate keys. Chat storage, quiz scoring and grade filing keep the LESSON's own
identity (the v7.19.952 law: the bank override never re-keys grades). Corollary: **editable-ness
is BAKED into persisted section HTML**, so a shared doc must never be seeded with locked sections
by one consumer (the FQ-time lock died in .955 for exactly this reason).

## §3. THE CANVAS DOC — ProseMirror law + the section model

- Sections are `sectionBlock` nodes rendered by NodeViews (wml-section-block.js). Types:
  question/source/extract/response/feedback/scores/action/plan/outline/progress/signoff/divider.
- **PM law (memory `reference_wml_pm_nodeview_foreign_mutation_loop`):** real content changes go
  through a PM transaction (`_setParagraphContentViaPM`, `insertContentAt`) — NEVER raw
  textContent/innerHTML/style writes PM will revert. Any runtime UI written into a NodeView must
  live in a **firewalled element** (`ignoreMutation` covers it AND attribute writes on the
  wrapper dom — the v866 rule) with **idempotent writes** (compare before write) and, for
  repeated fills, the `_derivedCardFillOk` circuit breaker.
- **In-flow beats absolute — SETTLED FULLY at v951 (Neil ruling 2026-07-08).** ALL section
  widgets are IN-FLOW firewalled children now: progress card (v497) → sign-off UI (v828) →
  analytics strip (v913) → **the whole marking widget set (v951)**. `_renderControlRows`
  (wml-assessment.js) fills each collapsible section's `.swml-ctl-row` — per-box mark selector
  + Predicted·Actual·Δ readout, Self-Assessment dropdowns, Score-Summary grade row, Action-Plan
  grade goal, Analytics opt-outs. Fills are SIG-IDEMPOTENT (`data-sig` from the underlying
  values → mount-storm refills are no-ops), breaker-guarded (`_derivedCardFillOk('ctlrows')`),
  and handlers re-resolve their target paragraphs at CLICK time. `dropdownLayer`,
  `positionDropdownOverlays` and the scroll/resize/RO/accordion re-anchor wiring are GONE —
  nothing is positioned any more. Only two absolutes remain: the transfer-button layer
  (`transferLayer`, next naturalization candidate) and the transient body-portaled
  `.swml-popover` (closed on scroll). NEW-READER LAW: a whole-section DOM text read must go
  through `_sectionContentOf(sec)` (the `.swml-section-content` child) or control-row widget
  text pollutes it; clone-based readers strip `.swml-ctl-row` (see `_stripChipsFromClone`).
  **v952 (Neil live review of v951):** the Self-Assessment fill is CATEGORISED — it walks the
  section's own `<h3>` headings (buildSelfAssessmentSection structure) and renders one
  `.swml-ctl-group` (full-width, small-caps `.swml-ctl-group-title`) per category, items
  wrapping beneath. DERIVED from the doc — new papers' categories appear with zero wiring.
  Groups live INSIDE `.swml-ctl-row`, so every clone/baseline strip law holds by construction.
  **v957/v959 (Neil live review ×2):** the SA section's RAW doc paragraphs (h3s + "Skill: — / 5"
  lines) are DATA ONLY — permanently CSS-hidden (`> .swml-section-content { display:none }`);
  the ctl-groups + headline strip are the entire visible UI (expanding used to reveal the
  duplicate "old structure"). The paragraphs stay in the DOM/doc: dropdown writes, extraction
  and AI-payload reads are untouched. SA's COLLAPSE toggles the WIDGET GROUPS instead
  (`.swml-fb-collapsed > .swml-ctl-row` hidden, SA-scoped): collapsed = strip only, expanded =
  strip + groups. (v957 briefly removed SA's chevron as "meaningless" — wrong, it killed SA's
  collapse; v959 restored it with the row-collapse model.) Feedback boxes keep their
  mark-selector rows visible while collapsed (old-overlay-parity law) — SA is the sanctioned
  exception. Inside a ctl-group each skill is its own full-width row, label left / dropdown
  RIGHT-aligned (uniform right rag).
- **Display-lock indicator lives IN the section-label pill (v952).** The v947 banner rode
  `::before` — the SAME pseudo-element the section-label pill owns — so it REPLACED the pill,
  inherited its loud styling and lost the section name (Neil live review). The rule now
  composes the pill itself: tabler lock (data-URI) + `attr(data-section-num)` +
  `attr(data-section-label)` + ' — read-only · edit in the previous step'. ::before/::after on
  section blocks are OWNED (label pill / completion tick) — never mount an indicator on them;
  compose the pill content instead. Lock icons are the ONE tabler lock everywhere
  (`WML.lockIconSVG` in JS · same paths as data-URI in CSS `content:` · icons/emoji/padlock.svg
  for the chat emoji layer) — change all three together.
- **Collapsibles are a CAPABILITY (v925/926):** the NodeView stamps `.swml-collapsible` wherever
  it installs a chevron; completion-tick clearance, `position:relative`, and the collapse-all
  button all key off that class — never an enumerated list of section types. Score Summary joined
  the capability at v926 ('scores' type, collapsible + Total·%·Grade preview strip).
- **Collapse mechanics (v912 class):** feedback boxes collapse (`swml-fb-collapsed`),
  persisted in localStorage per page+label — collapse SURVIVES sessions and new runs. Anything
  measuring inside a collapsed box reads 0×0 rects and computes garbage. Rule: before
  measuring/scrolling inside `.swml-section-feedback`, auto-expand (class + localStorage `'0'`,
  because the NodeView remount re-reads localStorage) or target the always-visible wrapper.
  Fresh feedback ALWAYS auto-expands its box — collapse is a reading aid for read feedback.
- **Collapsed-summary strips (v920, ALWAYS-ON since v928):** every collapsible that has a
  summary shows a strip (`.swml-ana-strip`) — visible collapsed AND expanded. Capability table
  `_STRIP_MODE` in wml-section-block.js says which section types get one; ONE renderer
  (`_renderSectionStrips()`) fills EVERY strip in the document (including pad clones); builders
  are per label — SA = average + calibration, Action Plan = priorities, Overall Feedback =
  strength + priority, Score Summary = Total · % · Grade. Strips carry the **"so far" suffix**
  until `_paperFullyMarked()` (label-derived) says the paper is fully marked — a partial total
  must never read as final.
- **Feedback pad = the whole feedback lane (v928):** the pad clones every `.swml-collapsible`
  section in doc order (not just feedback boxes); strips live and update inside the pad because
  the renderer targets every `.swml-ana-strip` in the document; cloned form controls are
  disabled. Any new feedback-lane UI must survive the clone (no id-keyed lookups).
- **Scroll:** ONE helper (`_swmlScrollToTop`) lands targets' top just inside the viewport;
  requery FRESH on every fire; fire + re-assert after PM/animation settle (the v905 shape).
  Never `scrollIntoView({block:'center'})` scattered per call-site; never CSS.escape attribute
  selectors (loop + `getAttribute`).
- **Doc chain:** forward-only snapshots (diagnostic → assessment → … ). Students WRITE only in
  write-stages; assessment stages are mark-only. **RESEED-UNTIL-MARKED is BUILT (v920,
  class-rest-api):** `load_canvas` re-seeds `_assessment` / `_reassessment` / `_fbdiscuss` from
  the latest upstream stage until `stage_is_frozen()` — freeze-on-MARKED, not
  freeze-on-first-save. `stage_is_frozen()` biases FROZEN on ambiguity; write stages are
  EXCLUDED from reseed — never widen it to them. Load-time mutations remain the most dangerous
  code in WML (a migrate once wiped a marked doc) — hydration-gated, additive only.

## §4. NUMBERS ARE CODE-OWNED (the v832–929 settlement — never re-litigate)

The LLM never does arithmetic — or number RECALL — that reaches a student. The engine: parses
the canonical number lines (byte-disciplined formats in PROTOCOL-STANDARD B-COMMON §6),
**audits** per-element sums, snaps element marks to the 0.25 band grid, applies the word-count
CEILING (MIN, never a deduction; ONE ladder incl. per-section), recomputes question totals,
rounds the grand total to WHOLE (half-up), maps grade via the canonical band ladder
(`GRADE_BOUNDARIES` = server `grade_band_percent` — one ladder, two mirrors, keep in sync).
**One helper feeds every surface** — display "Total:", Score Summary "Total Marks:", committed
grade must be the same number by construction (Run 6's 46.75/46/47 disagreement = GPT-taint +
surfaces drifting; Runs 7–9 clean). Marks land in feedback-box labels `(score / max)` via
`_setFeedbackMark` — **labels are then THE grade source** every downstream surface reads
(ranking, analytics, strips, grand-total fallback).

The nets, in parse order:

- **Q5 / Section-B word-count ceiling ONE-SOURCE (v917):** the cap is applied AT the label write
  (`_setFeedbackMark`), so every consumer inherits it by construction. The ceiling sentence
  students read is CODE-BUILT with its derivation — the model echoes injected P and C only.
  **The "↻ Check my word count again" button is RETIRED (v875) — never resurrect it** (Neil,
  re-confirmed 2026-07-07): entry-time auto-check + the always-on ceiling replaced the whole
  halt/lift/button flow; `_updateWcRecheckBtn` exists only to REMOVE any legacy instance. No
  protocol may reference a re-check button or a SYSTEM lift line.
- **ESSAY-FAMILY word-count ceiling (v944, `_essayWcCeiling` — the Q5 twin; closes the lit
  ENGINE-PARITY gap Neil caught 2026-07-07):** ONE ladder, same formula (P = ROUND(deficit ×
  5/100)); target = the Word Count Model (`canvasWordTarget`, LIT_WORD_TARGETS); denominator =
  the paper's essay max (`_essayMaxMarks`, stashed wherever word targets are set). It is a
  **FINAL-TOTAL ceiling** (Q5's is per-question): section marks are never reduced; enforcement
  lives in the grand-total reconcile (`grand.total = MIN(grand.total, C)`, keyed on
  `grand.max === _essayMaxMarks`). Injection points: (1) the OPENING greeting — the cap is
  stated up-front, paired with the code-computed count, BEFORE the grade goal (Neil ruling
  2026-07-07: students set their goal knowing the ceiling; ONE builder,
  `_essayCapGreetingNote`, feeds all six greeting sites); (2) the essay payload header
  (`=== ESSAY — … | CODE-COMPUTED WORD-COUNT CEILING … ===` in `getResponseText`) — the model
  echoes injected P and C only. Capability-gated: language papers no-op (Q5 owns them),
  quiz/crib/notes tasks no-op, no word-count model no-op.
- **TIER-LIST NET (v927, `_stripStrongVerbPenalties` — Pass 0b):** any F1/T1 penalty whose
  quoted phrase contains NO banned/weak-tier verb is stripped BEFORE audit/ledger/Trend see it.
  The regex is the TWIN of the protocol's analytical-verb registry — any registry edit updates
  both in the same commit (cross-copy drift, §9.8).
- **Card auditor + ladder + missing-unit zeros (v832–852):** per-card recompute from the card's
  own table minus penalties; canonical re-banding; whole-mark question totals.
- **RESUME-PROOF penalty ledger (v924):** the in-session card store (`_penLedgerCards`) is the
  primary source only when `_penLedgerComplete`; otherwise `_penLedgerCardsFromDoc()`
  reconstructs it from the SAVED doc's feedback sections — penalty lines per block,
  ¶-attribution via `Mark Breakdown — <name>` headings. Both consumers (rebuilt Ledger + closing
  Trend) follow that rule; they skip only when the doc yields nothing. Tally lines are ×N-form,
  so re-parsing a rebuilt ledger cannot double-count BY FORMAT.
- **PER-QUESTION PROSE OWNERSHIP (v932, Reeham P2 run):** `_enforceGradeLadder` owns not just the
  canonical "which is a Grade" lines but the DASH form ("25% — Grade 2"), and rewrites the
  calibration prose — "actual … X/B" and "you scored X/B" after a `(Qn) Total:` line, denominator-
  matched — to the audited numerator. Predictions stay the student's own. (Run escape this kills:
  total said 1/8, prose said 25%/Grade 2/"actual mark is 2/8" in one message.)
- **GOLD-DISTINCTNESS NET (v932, warn-only):** `_auditGoldDistinctness` stores every quotation
  emitted inside a Gold section per question and `console.warn`s on reuse — the protocol GOLD
  DISTINCTNESS rule (PROTOCOL-STANDARD A13) is the root; the net makes a breach loud.
- **GRAND-TOTAL ONE-SOURCE (v928/929):** text-parse is primary (`_auditedGrandFromText` — needs
  ≥2 per-Q total lines); fallback is `_labelGrandFromDoc()` — summed from the capped,
  card-audited box labels, used only when `_paperFullyMarked()`, and **DOWNWARD-ONLY**: a lit
  final-stage ceiling is never raised by the fallback. Bare-Total summary turns (no per-Q lines)
  enter the auditor via their own entry (v929) so a summary-turn grand total is still re-banded.
  Run-9 escape this kills: chat said 53/80 Grade 7; true audited total 51/80 Grade 6.

**Review grep for every new feature:** any number the model states that code doesn't own is a
defect — grep the reply-shaping code for totals/counts/percentages and trace each to a
code-owned source.

## §5. READOUTS — every count/claim has one authoritative source

- **Counts** (beat chip "Step X of N", sidebar steps): the doc-derived sidebar model
  (`_buildLangSidebarModel`/`_buildLitSidebarModel`), synced POST-fill. The model's own claimed
  step numbers are documented-unreliable — never render them. **The chip labels what THIS TURN
  marked, never the pointer's next stop (v932):** a fill that completes Qn advances the pointer
  into Qn+1's group, so `_syncMarkingBeatChip(reply)` derives the marked question from the reply
  (`@FB_BEGIN` q / `Qn Total:`) and, when it names an earlier group than the pointer's, shows
  THAT group full (Reeham run: the Q1-marking turn wore a "Question 2 · Step 1 of 3" chip).
- **Ranking/analytics** (`_analyticsReadoutModel`): strongest + marks-lost (ordered by RAW marks
  lost, not pct — Ericsson: target where marks bleed) from the marked box labels; calibration
  (mean blind SA % vs actual %, ±10 well-calibrated); conservative blind-spot (rated ≥70,
  scored ≤50, gap ≥20 — never a soft claim). The SAME model feeds the closing-filing facts and
  the visible strip — readout and filed text cannot disagree by construction.
- **Strips (§3) are readouts too:** built from labels / the analytics model, never from the
  model's prose; "so far" until `_paperFullyMarked()`.
- **Colour = the brand rating ladder everywhere** (1–9 tier from mark ratio), with ONE settled
  exception (Neil 2026-07-07): "Most marks lost" chips colour by LOSS RANK
  (red/orange/yellow) — severity of the bleed, not quality of the score; full-marks chips get
  the brand purple gradient.
- **Theme-owned colours only:** every readout styles via theme-owned classes
  (`.swml-calib-readout`, v928 — was inline white, invisible on light theme). Review grep:
  `rgba(255,255,255` in any NEW inline style is a defect.

## §6. ONE CANONICAL NAMING LAYER (the anti-silent-skip infrastructure)

- Text slugs: `$SLUG_ALIASES` + `normalize_text_slug()` at the REST boundary — the ONLY place
  slugs reconcile. Canonical = live user_meta form; NEVER flip a canonical (re-keys student data).
- Task→family, subject↔canvas-slug: `resolve_session_fields` server-side; key behaviour off the
  family. Q-identity: match by NUMBER via `_paraKey` ("Q2"/"Question 2"/"2"/"Feedback: Q2 (—/8)"
  all → "2"; Intro/Conclusion keyed by name, idempotently).
- Suffix→task (`task_by_suffix`): unmapped suffixes default to 'planning' and MISFILE grades —
  every new stage suffix gets a mapping.

## §7. PERSISTENCE — what survives what

- JSON into WP meta: ALWAYS `wp_slash(wp_json_encode(...))`; read via the tolerant decoder.
- Feedback/marks = non-reproducible system mutations → immediate server flush
  (`_flushPendingSaves`, keepalive) — never trust the 5s debounce across refresh/SPA-nav.
- localStorage = per-browser UX state (collapse, drafts pre-flush); server = truth. Anything
  that must survive refresh/cross-device rides the SAVED doc or the SAVED chat history, nothing
  else (v911 beat lesson).
- **Every in-memory accumulator needs a DOC TWIN.** The penalty-ledger card store taught this
  (v924): a store filled per-turn is empty after refresh, and the resumed session silently
  undercounts. Pattern: primary = in-session store when provably complete; fallback =
  reconstruction from the saved doc; skip only when the doc yields nothing. Beat replay (§2) and
  the label-derived grand total (§4) are the same pattern. New accumulator with no doc twin =
  known-fragile, does not ship.
- SPA boot: `__swmlBooted` single-boot guard; inline IIFEs re-run every nav (run-once guards);
  stale-template wipes and uncancelled fetches are the known killers (memories:
  `reference_wml_canvas_blank_on_refresh_stale_template_wipe`,
  `reference_focus_spa_stale_render_remount_pingpong`).

## §7b. DETERMINISTIC QUIZ STATE — one session identity + resume re-renders the UI (v999 / v7.20.1)

The deterministic quiz controller (`_quizCtl` — FQ, MSQ, MSA all share it) has two settled laws. Both bit on staging (Neil 2026-07-09) because they are invisible until a student has TWO quizzes in flight and navigates between them. Full story: memory `reference_wml_quiz_session_identity_and_resume_ui`.

1. **ONE canonical quiz-session identity (`qsid`) scopes EVERY store.** A quiz keeps live state in three places — the client resume sidecar (`lsKey()`), the server accumulator (`wml_quiz_active_{uid}`, which drives the running total AND `finalize()`'s grade), and the server bank meta (`wml_quiz_bank_{uid}`). These were single-per-user slots → two in-flight quizzes clobbered each other. `lsKey()` IS the `qsid`, sent to `/quiz/start·/answer·/finish` (`_quizCtl.sessionId`); the server keys accumulator + bank meta off `__{qsid}` (`$scope` param, `''` = legacy AI-marker slot). Format: `swml_{fq|msq|msa}_{board}_{subject}_{fqBank||text}_{attempt}_s{stage}`.
   - **STAGE is part of identity. Poetry FQ is UNIQUE — it is STAGED (3 stages, bridge `fq_stage=1|2|3`), each a SEPARATE quiz (`_s1/_s2/_s3`). Every other text (Macbeth, single poems, prose) is single-stage → `fqStage=0` → `_s0`.** Any new quiz/bank must put its distinguishing dimension into `qsid` or two in-flight instances corrupt each other's grade.
   - Deterministic answers bypass the router and help turns are gated off quiz-state, so `build_state_block` stays on the legacy slot — no router change.

2. **RESUME re-renders the current question; it does NOT just restore state.** `rehydrate()` restoring `idx/qs/round` is necessary but NOT sufficient. On resume the chat is replayed from SAVED TEXT, so the current question comes back with (a) NO progress chip — the chip is ephemeral DOM, never persisted → "progress bar disappears"; and (b) the GENERIC auto-detected answer buttons, which send the full option label to `sendCanvasMessage` → the AI path, not the controller's own buttons (bare value → `handleTurn`, scored) → the answer never scores → "falls back to a generic AI quiz". FIX (in `rehydrate` mid-round tail): drop the trailing replayed question bubble + its `canvasChatHistory` entry (else it duplicates every resume) and call `renderQ()` so the controller re-owns the turn — chip + deterministic scoring buttons (which call `handleTurn` DIRECTLY, bypassing the send-gate) both return.
   - **General rule: a deterministic controller's interactive UI (chips, scoring buttons, widgets) is NOT in the saved transcript — the controller must RE-EMIT it on resume, never inherit it from the replay.** The replayed transcript's generic quick-action detector is the trap: its buttons route to the AI.

## §8. THE DISPLAY LAYER — presentation never touches the data

- **svgifyEmojis (v916):** emojis render as inline SVGs at DISPLAY time only. Raw history keeps
  the original emoji characters, so every detector/parser is untouched BY CONSTRUCTION (they
  read raw text, not rendered DOM). The PM canvas is EXCLUDED — the PM schema drops `<img>`
  (the v898-era lesson: what the schema doesn't know, it deletes on round-trip).
- **Fix→Learn chips (v922):** `PENALTY_LEARN_MAP` maps penalty codes → Table-of-Techniques /
  Toolkit destinations. Tagging happens at the TOP of `formatAI` (matches code-form AND ×N tally
  lines) so it sees raw text; the button is injected AFTER svgifyEmojis; `<pre>/<code>` tokens
  are dropped from matching. The pad gets chips via `WML.appendLearnChips` on non-PM clones; the
  PM doc got in-context chip NODES at v949 (next bullet). ONE delegated click handler, NEVER a
  bare `open()` per chip. The two
  destination halves are **feature-detected dormant** — the Toolkit half lit up the day the
  notes plugin deployed, with ZERO WML change (proof of the pattern: integrate by detection,
  not by coordinated deploys). Technique-name resolution: 245 names from the GENERATED
  `protocols/shared/reference/table-of-techniques.md` — hosted in THIS tree, re-sync on
  regeneration (§9.8) — PHP filemtime-cached into `swmlConfig`.
- **Fix→Learn chips IN CONTEXT, in the doc (v949 — supersedes v948's box-bottom rows; Neil
  live test 2026-07-08: a pooled row reads as detached from its penalties):** the chip is a
  REAL inline atom node (`learnChip`, the fbGlyph mold — taught to the schema so it survives
  insertion + save→reload) at the END of the penalty line it belongs to. `_healLearnChips`
  (wml-assessment, exported `WML.healLearnChips`) injects them via **PM transactions only**
  on mount (staggered past tryServerLoad), every overlay rebuild, and post-`applyAssessmentFeedback`
  — idempotent (line whose last inline is already a learnChip skips), so it equally covers
  STALE pre-949 docs, fresh fills, and reseed-seeded fbdiscuss copies. Resolution =
  `WML.learnChipsForLine` (wml-core, v950: N1 yields one chip PER technique named — misnamed + the genuine device): the v922 detection shape + `PENALTY_LEARN_MAP`,
  **UNGATED** — chips persist even where a destination global isn't deployed; visibility is
  view-gated by editor root attrs (`data-swml-learn-toolkit/-table`, stamped by
  `_stampLearnChipDests`) + CSS, so chips on existing docs light up the day a destination
  ships. The pill label renders via CSS `::before` from `data-learn-label` → the node carries
  **ZERO textContent** — auditor/ledger/seed/copy-paste text consumers untouched BY
  CONSTRUCTION (this also retired the v922 paste-bleed for doc chips). Clicks ride the ONE
  v922 delegated capture-phase handler (`.swml-learn-chip-node` added to its selector — works
  in v947 display-locked lessons). Pad clones strip the node spans (`_stripChipsFromClone`) —
  the pad keeps its v922 inline chips, never both.
- **SLUG LAW (v949 — the F1-opened-the-landing bug):** every `PENALTY_LEARN_MAP` toolkit arg
  MUST be a section id from the notes toolkit's SECTIONS registry (tkNavigate: `fix-`+slug,
  then bare slug, unknown → landing + warn). Verify against the registry before adding an
  entry; every penalty code a protocol can emit gets a map entry or a ruled no-chip.
- Known cosmetic bleed: chip labels appear in copy-pasted doc exports ("Learn: … →"). Accepted
  for now; revisit if Neil exports for parents (§9.9).

### §8c. ⭐ THE FLOATING-PANEL LAW — a panel anchored to a trigger is a CHILD of that trigger's
### sticky column, positioned absolutely (v7.20.117; the pattern v7.19.454 proved)

**LAW: every panel that must sit at a trigger is an ABSOLUTE child of the sticky
`.swml-outline-btn-column`, never a sticky/floated sibling in the scroller.** `top: 0` = the panel
takes over the button (document outline). `top: calc(100% + 4px)` = the panel sits under it
(resources, Writer's Profile). `left: 0` = flush with the button column. All three share
`.swml-outline-panel`; the two "under" variants override position via `.swml-resources-panel`.

**WHY (the root, so it is never re-broken).** `position: sticky` cannot express "pinned to the
button". A sticky element can never rise ABOVE its natural flow position — it only ever offsets
DOWNWARD from where the flow puts it. So at `scrollTop 0` there is no offset to apply and the
panel renders exactly where the flow left it; with `float: left; clear: left` that is BELOW the
floated button column. Neil reported it twice as "the panel gets pushed down at the top of the
document". It is not a tuning problem — sticky is the wrong primitive, and no `top`/`margin` value
fixes it. The button column is itself `position: sticky`, which makes it a containing block, so an
absolute child tracks it at EVERY scroll position for free.

**Corollaries (each one cost a cycle or was engineered out):**
1. **Out of flow = no flex gap.** The column is `display:flex; column`; an absolute child adds no
   gap and needs no source-order care.
2. **A panel that covers its trigger MUST be `pointer-events: none !important` when closed.**
   `opacity: 0` stays hit-testable, so the invisible panel swallows the button's own click — the
   v7.19.451 CLICK-STEAL bug. `pointer-events` is the reliable lever: Etch force-overrides
   `visibility`/`opacity` on divs, but not this. Keep the guard OFF `visibility` or the close
   fade-out dies.
3. **Detach escapes the column, by design.** `floatOutline` reparents to `document.body`
   (v7.19.91) because `position: fixed` + `z-index: 9999` cannot escape an ancestor stacking
   context (the column sets `z-index: 8`) or an ancestor `transform` (LD focus-mode). `dockOutline`
   restores the stashed parent. Any new panel copies this or it will be occluded.
4. **Supersedes v7.19.451** ("both triggers stay visible, so the panel must not cover them") —
   Neil ruled 2026-07-15 that the panel takes over the button and expands from it.

**Grep gate before touching any panel:** `grep -n "position: sticky" frontend/wml-canvas.css` —
a panel (as opposed to the button column) in that list is this bug returning.

## §8b. THE STAGE-RECORD FEED-FORWARD MECHANISM (Neil, 2026-07-14 — ⭐ THE canonical
## persistence/feed-forward pattern; reuse this anywhere content must flow between docs)

Neil-verified live (v7.20.93, R&J t1: "sky is blue → sky is green fed all the way
through, not backwards — works perfectly"). This is the house mechanism; do NOT invent a
new sync shape for a new surface — adopt this one.

**The three laws** (design doc §2b): (1) STAGE RECORD — each stage doc permanently shows
what the student wrote AT that stage; the chain is the visible drafting journey; (2)
FORWARD-ONLY, NEWEST-EDIT-WINS — any edit to any shared area flows to every LATER stage;
on load each area resolves to the newest edit among current-and-earlier stages; never
backwards; (3) FREEZE — a marked doc is a frozen record, nothing mirrors in (reset/clear-
chat wipes marks → unfreezes → newest work flows in → re-mark).

**Mechanism, in five moving parts** (all in wml-assessment.js):
1. **Provenance attr**: `editTs` (data-edit-ts) on every arbitrated node type (sectionBlock
   + inputField). Rides the doc's own HTML serialisation — localStorage, server, seeds —
   so there is NO side-channel key to drift (5d key-match by construction).
2. **Stamper**: onTransaction collector + rAF flush, throttled 3s/node, stamps ONLY user
   edits. Exclusions: `_migrationActive`, `_suppressFillScroll`, `addToHistory:false`,
   `swmlEditTs` meta, and the BULK-TXN GUARD (>3 sections in one txn = programmatic).
   Failure direction is chosen: a missed exclusion false-freshens (blocks inflow, loud in
   console) — it can NEVER delete student work.
3. **Arbitration** (mirror v3, `_healPhase1PrewriteCarryInner`): on load, fetch every
   EARLIER stage doc in the phase chain (placement via canonical `resolveCanvasSuffix`;
   chains = client twin of `stage_seed_chain`). Winner per area = newest editTs; tie →
   latest stage; non-empty local survives unless winner STRICTLY newer; unstamped-vs-
   unstamped keeps LOCAL (legacy safety); empty/placeholder-only local accepts any seed
   (§9.21 placeholder law).
4. **Carry, never re-stamp**: a mirrored copy keeps the ORIGIN edit's ts. Mirror writes run
   under `_migrationActive` + `swmlEditTs` meta + `addToHistory:false`,
   `updateSelection:false`.
5. **Diagnosability**: every run logs its sources (`chain: X sources → …`), every write
   (`live-synced (n, newest-wins)`), every kept-local decision, every bulk-txn skip. A
   flow question is answerable from the console alone.

**Coverage** (uniform — no task-name gating): response + outline(+tick census) section
families; all owned fields (pred-/kw-focus/reflect-/plan-/iumvcc-); SA + Action Plan
assessment→discuss while phase open. Phase 1 and Phase 2 run the SAME engine. CW excluded
by construction (not in the chains) — but QUEUED for onboarding (Neil 2026-07-14: "Creative
Writing is one long project — things feed through from lesson to lesson; the first few
lessons already work like that; come back and polish later"). When that pass lands, CW
adopts THIS mechanism (a `_cw_*` step chain + the same stamp/arbitrate/carry parts), never
a parallel sync. Adopting any new surface = add its section type/field prefix to the
mirror calls — never a new sync mechanism.

## §9. THE POTENTIAL-ERRORS REGISTER (Neil's ask — name the class before you fix the instance)

Per class: **trigger → symptom → the net that catches it → residual risk.** When a new bug
lands, file it under a class first; a bug that fits no class means a NEW class row in this table
in the same commit.

**1. Name-guard scoping** (task/board/label literals).
Trigger: behaviour gated on `task.startsWith(...)`, an enumerated selector list, a label
literal. Symptom: works for X, silently nothing for sibling Y — reads as success until a human
tests Y. Nets: capability classes/lookups (`.swml-collapsible`, `_STRIP_MODE`, task-family
config), cross-cutting consumers unconditional + self-guarded, SILENT-SKIP `console.warn`s.
Residual: any NEW enumerated list — reject at review.

**2. Model-recalled numbers** (totals, tallies, ceilings, keywords).
Trigger: the model states a number it "remembers". Symptom: drift from the audited cards
(Run 9: 53/80 vs true 51/80). Nets: card auditor, grade ladder, ledger rebuild + doc
reconstruction, code-tallied Trend, label-grand fallback (downward-only), ceiling ONE-SOURCE,
tier-list net, keyword-verbatim rule. Residual: any NEW number the model states that code
doesn't own — grep for it at review (§4).

**3. Two-line / format drift** (dual Q5 Total lines, backtick/bold wrappers, label suffix
drift). Trigger: the model emits a canonical line twice or wrapped. Symptom: parsers take the
wrong value. Nets: line-final rule, wrapper-tolerant regexes, LAST-pair parse. Residual: any new
parser written against the pretty format instead of the tolerant shape.

**4. Session-memory dependence** (in-memory stores vs refresh).
Trigger: per-turn accumulator with no doc twin. Symptom: resume/refresh undercounts or blanks —
works live, wrong tomorrow. Nets: doc-derived reconstruction (ledger, sidebar model, label
grand), RESEED-until-marked, beat replay on history. Residual: any new accumulator without a doc
twin (§7).

**5. Silent UI drops** (in-flight guards eating clicks; bars removing themselves).
Trigger: UI-driven send while `canvasChatLoading`. Symptom: click does nothing, no error, user
re-clicks or gives up. Net: `sendCanvasMessageQueued()` for every UI-driven send. Residual: NEW
buttons calling `sendCanvasMessage` directly — use the queued form.

**6. PM foreign mutation** (DOM writes on NodeView dom outside txn/firewall).
Trigger: style/attr/child write on a NodeView wrapper outside a PM transaction. Symptom: tab
freeze, NO error, onUpdate=0, txnTotal=0, editorMounts=1 (view redraw loop, not a doc change).
Nets: firewalled sub-elements (`ignoreMutation` incl. wrapper attributes), idempotent writes,
`_derivedCardFillOk` circuit breaker. Residual: new derived-card fills not routed through the
breaker.

**7. Theme blindness** (inline dark-only colours).
Trigger: inline `rgba(255,255,255,…)` / hex styled for the dark theme only. Symptom: invisible
text on light theme (v928 calibration readout). Net: theme-owned classes. Review grep:
`rgba(255,255,255` in any NEW inline style is a defect.

**8. Cross-copy drift** (a generated/derived artifact with a live twin). Each pair has a named
re-sync rule — breaking one silently forks behaviour:

| Copy A | Copy B | Re-sync rule |
|---|---|---|
| Analytical-verb tier registry (protocol, v923) | `_stripStrongVerbPenalties` regex (v927) | same commit, both sides |
| `protocols/shared/reference/table-of-techniques.md` (generated) | Learn-chip name resolution (§8) | re-copy on every regeneration; never hand-edit |
| Recall-rotation router (PHP) | frontend recall pair | same commit, both sides |
| `GRADE_BOUNDARIES` (JS) | `grade_band_percent` (server) | same commit, both sides |

**9. Export/display bleed.** Trigger: display-layer decoration reaching a copy-paste/export
surface. Symptom: "Learn: … →" labels in exported markdown (Run 9). Cosmetic — known/accepted;
becomes a real defect if Neil exports for parents.

**10. Zero-rect scroll** (collapsed geometry). Trigger: measuring/scrolling inside a collapsed
box. Symptom: scroll lands garbage; log claims success. Net: auto-expand before measure (§3).
Residual: new measurement paths that don't expand first.

**11. Slug/name drift.** Trigger: new course slug / picker id / dash-underscore variant.
Symptom: bank/canvas/quiz silently no-ops for one course form. Net: ONE `$SLUG_ALIASES` line +
the fail-loud FQ fallback warn. Residual: reconciling slugs anywhere other than the registry.

**12. Out-of-scope reference** (the .898 class). Trigger: function extracted across scopes;
free variable no longer reachable. Symptom: ReferenceError only when that path RUNS —
`node --check` clean. Net: the pre-ship gate (`eslint no-undef`) is WIRED (pre-commit + deploys,
v915). Residual: none if the gate runs; that's why it's mechanical, not memory.

**13. Load-time doc wipe.** Trigger: load-path doc mutation (migrate/heal/seed). Symptom: marked
doc blanks on entry. Nets: hydration-gated additive-only mutations; `stage_is_frozen()` biased
FROZEN; write stages excluded from reseed. Residual: any widening of the reseed set.

**14. Override-bank fallback → AI into a deterministic surface** (v960, Neil 2026-07-08).
Trigger: a deterministic quiz/assessment gates its code path on `state.text`, but a bank OVERRIDE
(`fq_bank`, or any case where the SERVED bank ≠ the course text) makes the real bank differ.
Symptom: the WHOLE quiz silently drops to the legacy AI path — questions AND answers become AI
(coaching, not code-scored); reads as "the quiz works" until you notice it never scored. Net:
gate on the EFFECTIVE served bank (`fqBank || text`), mirroring the server's own resolution
(`class-rest-api.php` fq_bank branch); fail-loud warn names fqBank+text on a genuine miss.
**Doctrine (universal): the FQ, mark-scheme quiz, and mark-scheme assessment are PROGRAMMATIC —
code-scored, never AI-scored. AI appears ONLY when the student explicitly asks for help.**
Residual: any NEW deterministic gate keyed on `state.text` alone while an override channel exists.

**15. Hardcoded count literal** (the "5/5" class, v961, Neil 2026-07-08).
Trigger: a display string hardcodes a question/round count (`5/5`, "answer all 5") that is actually
dynamic — the bank/stage serves 5/10/15/18. Symptom: a 10- or 18-Q round shows "5/5"; the number
lies. Net: derive EVERY count from the live set — `roundResults.length` / server `res.total` /
`q.total` — never a literal. Residual: any new count literal in quiz copy, the result card, the
clear-warnings, or the sidebar. **Corollary (first-paint, Neil): the sidebar must know the round
size at BOOT (server-injected) so it shows the real journey immediately — never a placeholder step
count that changes to the true one after the quiz starts. BUILT v968: the embed config computes
`fqRoundSize` server-side through the SAME code the round is served by (`fq_round_size` → shared
`fq_stage_subset` + `dedupe_stems`, effective-bank + canonical-slug resolution) and boot stamps
`state.fqRoundTotal`; `_syncFqSidebar` stays as the self-heal. Any future round-composition change
must keep serving and counting on the shared helpers — a fork makes the first paint lie.**

**16. Deferred DOM-attach race** (post-round menu, v961, Neil 2026-07-08).
Trigger: UI appended inside a `setTimeout` that resolves `chatMessages.lastElementChild` at
fire-time. Symptom: a bubble / re-render in the window steals or detaches the target → the buttons
vanish (the mastery menu was absent → the student was forced to TYPE → routed to clarify → looked
like a "fallback"). Net: capture the target element SYNCHRONOUSLY at call-time + an `isConnected`
fallback. Residual: any new `lastElementChild`-inside-a-timeout attach.

**17. Duplicate draw** (v961, Neil 2026-07-08).
Trigger: a round can serve two questions testing the same thing. Symptom: the same fact asked
2–3× in one round (Neil: epic length). Net: stem-dedup in `pick_from_pool` — UNIVERSAL, every
quiz AND assessment draws through it; fail-loud `error_log` when dupes are dropped. Residual:
same-concept-different-wording near-dupes (not stem-catchable) = a bank-authoring audit (chat B).

**18. Board-mismatch copy** (the "Level 6 on Language" class, v967, Neil 2026-07-08).
Trigger: student-facing marking copy hardcodes ONE board/subject's mark-scheme facts (a Level
number, an AO set, a descriptor word) on a surface that serves every board and subject. Symptom:
an AQA LANGUAGE student is told to "reread the Level 6 descriptor" — Level 6 is AQA LITERATURE;
Language marks Levels 1–4 and assesses AO5/AO6. The claim is confidently WRONG, which is worse
than vague. Net: key such copy on (board, subject-family); serve a specific claim ONLY where the
wording is verified against the real mark scheme (`MSA_ACTIONS_LIT` / `MSA_ACTIONS_LANG`, AQA
only); every unverified combination gets an honest generic pointer to ITS top band — NEVER a
named Level. Residual: any new student-facing string that names a Level/AO without a board key;
the chat-B AO-matrix is the verification source for extending the maps.

**19. Dishonest capability implication** (the "I meant D" class, v967, Neil 2026-07-08).
Trigger: a typed message expresses an intent the code can't (or won't) act on, and it routes to
the AI, which replies as if the thing will happen. Symptom: a student mistypes an answer, types
"I meant D", Sophia warmly implies it's fixed — it isn't; the wrong mark stands. Net: detect the
intent DETERMINISTICALLY before any AI routing and either DO it in code (mid-round correction:
regex-detected, re-scored through the idempotent `record_question` upsert, `roundResults`
replaced) or say honestly in code that it can't be done (post-reveal). Residual: any other typed
intent that falls through to the AI with an implied promise — audit `routeHelp` prompts when
adding capabilities.

**21. Placeholder ≠ empty** (the "response never seeded" class, v7.20.89, Neil 2026-07-14).
Trigger: an emptiness predicate (`onlyIfEmpty` seed gate, "fill while empty", fallback chains)
reads `textContent` of a section whose TEMPLATE ships real locked placeholder text
(`Write your essay here.` — buildResponseSection). Symptom: a pristine target counts as
non-empty, the seed silently never fires — polishing response stayed blank, reassessment +
discuss cascaded empty ("nothing persisted"). The word-count hit this first (v7.19.696 →
`_WC_PLACEHOLDERS`/`_stripScaffoldForCount`); the v7.20.88 mirror seed re-bit it. Net: every
emptiness guard strips `_WC_PLACEHOLDERS` on BOTH sides — target (may seed) and source (a
placeholder-only source has nothing to say, and must not satisfy a fallback chain). Residual:
any NEW emptiness predicate that doesn't route through the placeholder list; grep
`textContent || ''` + `trim()` guards at review. Memory:
`reference_wml_placeholder_defeats_emptiness_and_scroll_replay_law`.

**22. Replay scroll** (the "fbdiscuss lands mid-doc" class, v7.20.89, Neil 2026-07-14).
Trigger: a scroll call baked into a shared FILL helper (`_scrollToFilledField`,
applyAssessmentFeedback's `_fireScroll`) with no live/replay distinction; load-time replays
(`_healFeedbackBoxesFromHistory`, CN shape-heals, sibling merge, seed reconcile) re-run the
fill and drag the doc to a random section on open. Net: the FILL-SCROLL LAW — LIVE autofill
always scrolls to the filled section; LOAD/REPLAY fills NEVER scroll. Mechanism:
`_suppressFillScroll` module flag, checked at SYNCHRONOUS entry of every fill-scroll gate
(before any debounce/re-assert timer is scheduled); replay bodies set it in try/finally
(the updateSelection:false of scrolling). Residual: any NEW autofill site must wire both
halves — live scroll via `_swmlScrollToTop` (deferred past setContent rebuilds), replay wrap
via the flag.

**23. Owner-always-wins overwrite** (the "my edit vanished when I went back" class, v7.20.92,
Neil 2026-07-14 — STAGE-RECORD LAW §2b). Trigger: a mirror/sync that resolves a shared area
by OWNERSHIP ("head owns these fields; downstream edits are overwritten by design") instead
of by RECENCY. Symptom: a student edit made outside the area's home lesson is silently
REVERTED on next load — invisible data loss that reads as "it didn't save". Net: per-node
`data-edit-ts` (sectionBlock + inputField), stamped by the onTransaction collector on USER
edits only (programmatic writes excluded via `_migrationActive`/`_suppressFillScroll`/
`addToHistory:false`/`swmlEditTs` meta — a missed skip only false-freshens, the safe
direction); mirror v3 arbitrates every candidate across ALL earlier stages in the phase
chain: newest ts wins, tie → latest stage, unstamped-vs-unstamped with local content keeps
LOCAL (never delete a possible student edit), empty/placeholder local always accepts a seed
(§21), mirrored writes CARRY the origin ts (never re-stamp). Frozen (marked) docs accept
nothing. PROVEN residual (v7.20.93, same day): a load-path whole-doc txn outside the four
signals stamped all 57 nodes of reassessment/redraft at open → every section false-fresh →
newest-wins locked ALL upstream edits out (Neil's "doesn't reach assessment/discuss").
Net: the BULK-TXN GUARD — >3 sections touched in ONE transaction = programmatic, skip the
whole txn loudly (a user gesture never edits that many at once; structural, not a fifth
signal to forget). Remaining residual: a programmatic txn touching ≤3 sections still
false-freshens (grep new `dispatch(` sites at review); mirror logs every kept-local
decision + its sources so a block is console-diagnosable. Canonical spec: design doc §2b.

**20. One-input-path binding** (a cross-cutting UI consumer wired to a single input event).
Trigger: a feature that should fire "whenever X happens" is bound to ONE way X can happen —
`mouseup` for selection, a click handler for a state a keyboard can also reach. Symptom: works
when you drive it the way the author drove it, silently dead for every other route; nobody
reports it because nobody tries the other route. This is class 1 (name-guard scoping) wearing a
DOM-event costume: `mouseup` is a literal, exactly like `task.startsWith(...)`.
Proof (v7.20.118): the canvas selection toolbar (Comment/Copy) was bound to
`document.addEventListener('mouseup')`, so EVERY keyboard selection missed it — Cmd/Ctrl+A,
Shift+arrow, Shift+Home/End, programmatic. Invisible for months; only surfaced when v7.20.117's
field-scoped Cmd+A made keyboard selection worth doing. Net: bind to the STATE-CHANGE event, not
the input event (`selectionchange`, not `mouseup`) — it is input-agnostic by definition, so no
future route can miss it. Residual: state-change events also fire for the null/collapsed case the
input event never delivered — EVERY bail must clear stale UI, not just `return`.

**20b. The tax on class 20: a state-change driver fires N times, so the CONSUMER must be
idempotent** (v7.20.121 — a same-day regression on the v7.20.118 fix, caught by Neil first pass).
Symptom: the toolbar "blinked twice" on appear. Cause: the show path DESTROYS and REBUILDS the
element every call, and `.swml-selection-toolbar` carries `animation: swml-reply-pop`
(wml-styles.css:612) which replays on every NEW element. `mouseup` fired once per action so the
rebuild was invisible; `selectionchange` correctly fires several times for ONE action (PM syncs its
DOM selection after the txn, then focus settles) → 2-3 rebuilds → the pop replayed.
**LAW: a driver that fires N times for one logical change is CORRECT — do not throttle it. Make the
consumer idempotent: record the identity of what is mounted (here the PM `from:to`) and no-op when
it is unchanged.** Throttling would have hidden the blink while leaving the rebuild-per-event defect
in place AND risked re-breaking the keyboard paths class 20 just fixed. This is the same law as PM
rule 4 (idempotent DOM writes) and the v7.19.866 fill-storm — it is now the THIRD place a
non-idempotent consumer under a legitimately-chatty driver has bitten. Residual: the guard MUST sit
before the teardown; after it, the rebuild has already happened.

**21. Pseudo-element collision** (two rules, one `::before`/`::after`, per-property cascade).
Trigger: two independent features render on the same pseudo-element of the same node. Symptom: a
box positioned/painted in a way neither rule asks for. The trap: specificity is resolved
PER PROPERTY, not per rule — the losing rule's properties still apply wherever the winner is
silent, and a shorthand (`inset`) sets four properties that a winner setting only `top`/`right`
cannot displace. `left:0` + `right:44px` + a fixed `width` is over-constrained → `right` is
dropped → the box pins to the opposite side.
Proof (v7.20.119): the completion badge
(`.swml-section-block[data-section-complete]::after`) and the read-only hatch overlay
(`.swml-section-readonly::after`, `inset: 0`) collided — the badge rendered hard-LEFT on read-only
sections, and the hatch was destroyed. Net: never render two features on one pseudo-element; if a
badge and an overlay must coexist, one gets a real element. Residual: grep `::after`/`::before`
for a second rule on the same class family before adding either.

**22. Tri-state collapsed to boolean** (null/"not applicable" flattened into false).
Trigger: a helper answers a 3-valued question (yes / no / not-applicable) through a 2-valued
return — `'' | ' ✓'`, `bool`, a truthiness check. Symptom: "not applicable" is stored as "no",
and every PRESENCE-keyed consumer downstream then treats the inapplicable thing as a real,
pending item. Especially vicious when an attribute's PRESENCE is the contract and its VALUE is
only the state (a deliberate, documented pattern here — a faint tick marks a target before it is
filled).
Proof (v7.20.119): `getSectionIndicator` returns a string and refuses to evaluate read-only
sections (returns `''`); its caller (`wml-assessment.js` ~16158) wrote
`indicator ? 'true' : 'false'`, stamping `data-section-complete="false"` on a read-only notice.
Both presence-keyed consumers then believed it: the badge CSS drew a tick, `_computeCwProgress`
counted it in "0 of 3 sections complete". The law it broke ("read-only sections are
instruction/scaffold, never completable" — Neil, v7.19.500) was already enforced in THREE places;
this caller was the fourth opinion that ignored them. Net: when a law is stated in N places, a new
consumer reuses the SAME predicate — never re-derives it, never collapses the refusal into a
value. Residual: audit every caller of a `'' | value` helper for `x ? a : b`.

**23. Predicate named for the DOCUMENT when the rule is about the STUDENT** (⚠️ LIVE DEFECT —
`_isFirstDiagnostic`, wml-assessment.js ~8849).
Trigger: a rule whose real subject is the student's HISTORY gets implemented from what the current
document happens to be. Symptom: correct for the case the author had in mind, silently wrong for
every student who arrives by another route — and the name reads as correct, so nobody re-checks it.
**Neil's rule (2026-07-15):** the Topic-1/Phase-1 leniency (Essay Plan optional) applies ONLY to a
student's **very first attempt ever**. *"Once they've done topic 1 phase 1 they've had feedback,
grade-9 model answers, the redraft, more models — by the time they reach another topic 1 phase 1
they've learned enough to at least have a go, so we can no longer have that leniency, because it
isn't their first attempt."* The exemption is about **having been taught**, not about the document's
number.
**What the code does instead:** `topicNumber === 1 && phase === 'initial'` — of the CURRENT course.
So a student who completes AQA Lang P1 and starts Macbeth gets the beginner exemption again. This is
ONE shared predicate (v7.19.817, deliberately) so the bug lands in BOTH consumers: the progress card
AND `_isAssessmentComplete` (where it makes the Essay Plan wrongly optional for completion).
**The build (queued, not done):** the attempt ledger is `session_records` (student-data). WML must
get the answer server-side in the canvas payload. **It MUST be decided ONCE and stamped on the doc at
creation, never computed live** — the student's own record is registered at project creation
(class-rest-api.php ~6089), so a live check sees itself and flips mid-exercise, moving the progress
card's goalposts under the student. Set-once + a one-time heal for existing docs (which carry no
stamp). Same forward-snapshot law as stage records (§8b).
Net once built: the predicate is renamed for its real subject (student experience), not the doc.

**24. Known-open engine backlog** (tracked, unbuilt — not regressions): refuse-refile guard past
the cap (gap register #1), verbatim-quote validator for penalties (#3), completion-island items
(#6–8), dropdown NATIVIZATION design arc, emoji sweep phase 2, K1 toolkit destination (contract
TBD). See `~/.claude/handoffs/open/wml-backlog.md`.

## §9b. THE PRE-SHIP INTERROGATION (Neil, 2026-07-07: "what would a senior developer ask,
short of endless testing?") — ask ALL of these of any assessment-flow change before it ships

1. **Can it DOUBLE?** Can this step run twice (double-mark, double-file, double-count)? What
   registers it as done, and is that registration byte-reliable (canonical line, not prose)?
   Nets: one emission template per question (see below), `Q1 Total:`-only registration,
   RE-MARK warn in `_setFeedbackMark`, one-per-Q labels (label-derived totals can't double).
2. **Can it SKIP?** If the model jumps a question/stage, what catches it? Nets: state-block
   sequence + Q-GATE preconditions (prevention), missing-unit ZEROS in the final audit +
   `_paperFullyMarked` keeping the "so far" suffix (detection — a skip can never inflate a
   grade, only visibly lower it).
3. **Whose NUMBER is it?** Every number the student reads — where does code derive it from the
   audited cards? Chain: element marks → card auditor → `Qn Total` → per-question %/grade/
   calibration prose (v932) → grand total → committed grade. A number with no code owner = defect.
4. **Is there exactly ONE template?** Grep the paper's LOADED module set: exactly one emission
   shape per question/stage. Two templates = the Q1 double-mark class. Also: no RETIRED format
   may even be DESCRIBED in a loaded file (the v3.1 progress-bar changelog taught this — a
   described format is a format the model may imitate).
5. **Can the quote be FAKE?** Any charge/claim quoting the student — verified against the doc?
   Net: verbatim-quote strip (v932).
6. **Can output REPEAT itself?** Golds/examples across turns — distinctness enforced + warned?
7. **Both PIPELINES? Replay? Clone?** Called from both sendCanvasMessage paths, re-rendered
   from history on refresh, alive inside the feedback-pad clone?
8. **Where does it LAND visually?** Auto-fill must scroll to the filled region via the ONE
   helper (fresh requery, auto-expand collapsed targets, re-assert post-settle) — never a new
   ad-hoc scroll.
9. **What happens on the WORST reply?** Malformed/half reply: does every parser no-op + warn
   (fail loud), or does it half-apply?
10. **If it breaks silently, what makes it LOUD?** Every net warns; a silent skip is a §9.1 bug
   by definition. Console output IS the observability — any run doubles as a test because the
   nets narrate what they caught.

Settled UI rule (Neil, 2026-07-07): **mark-prediction control = buttons when max ≤ 8, dropdown
above 8** (already engine behaviour — Q2/8 buttons, Q3/12 dropdown).

## §10. THE HARNESS METHOD — how nets get proven before Neil ever tests

Every v915→929 net shipped with a Node harness that drove it against REAL run lines before
staging (chip tag/render 14 cases; formatAI end-to-end with DOM stubs; doc-ledger reconstruction
9 cases; tier-list net 10; label-grand decision table 7). The method:

1. **Extract the pure function** (or expose it on the namespace) so it runs outside the browser.
2. **Stub the DOM** minimally — only what the function touches.
3. **Drive it with REAL lines from saved run transcripts** (`Model Answer Resources/…Run N.md`),
   never invented fixtures — invented fixtures encode your assumptions, real lines encode the
   model's actual format drift.
4. **Assert the decision table** — enumerate the input classes (complete store / partial store /
   doc-only / nothing; capped / uncapped; banned / weak / strong / unlisted) and assert each row,
   not just the happy path.

The harness is evidence for §0 ROOT ("the net catches the real line") — it does not replace
RUN-THE-FLOW (§11.2), which proves the wiring.

## §11. SHIP GATES (mechanical, in order — never from memory)

1. `bin/pre-ship-check.sh` on staged changes (node --check + eslint no-undef; php -l authoritative,
   raw brace-count warn-only when php -l passes — string braces double-fire it).
   **WIRED as of v915:** `.git/hooks/pre-commit` is a wrapper file calling the gate (regular file,
   NOT a symlink — Google Drive mangles symlinks), and both deploy scripts run `--all` before rsync
   and abort on failure. Node authoring scripts get `tools/.eslintrc.json` (node env); page-injected
   globals (`Hls`, `sophiclyCursorConfig`, `module`) live in root `.eslintrc.json` globals.
   The gate is the FLOOR; RUN-THE-FLOW is the BAR.
2. **RUN THE FLOW** — drive the changed path once; scope-clean ≠ correct (the .898 crash was
   checked, not run).
3. Regression matrix for canvas/pipeline/doc-chain/boot changes: WML-SMOKE-TEST.md
   ({P1,P2}×{diagnostic,redraft}×topic + CW 1–4 + quiz + boot). Any red console error = fail.
4. Batch discipline: ONE version bump per distinct fix, ONE commit, ONE Neil test cycle with
   "TEST THIS" + "QUEUED" lists. Staging → Neil → prod (`echo y | deploy-production.sh`).

## §12. SIGN-OFF CHECKLIST — what "sharp" means for the anchor (and every port after it)

An assessment experience is signed off when, on a clean staging run by Neil:
- [ ] Pre-chain: all four stages fire in order, buttons + typed fallbacks, both pipelines.
- [ ] Every marked sub-unit: card filed into the right box, box auto-expands, doc scrolls to the
      region, beat chip matches the sidebar, calibration line correct.
- [ ] Element marks all on the 0.25 grid; penalties each carry a fix-example; two golds per ¶
      (holistic exception: Section B); golds obey the taught order and house language bans; no
      F1/T1 charge whose quoted phrase lacks a banned/weak verb survives to display.
- [ ] Grand total WHOLE and identical on ALL surfaces — chat text, box labels, Score Summary
      strip, calibration readout, committed grade; grade matches the canonical ladder.
- [ ] Analytics strip + filed Analytics/Action-Plan agree (same code-owned model), ladder
      colours; penalty Trend counts match the ledger cards.
- [ ] Strips render on every collapsible incl. inside the feedback pad; "so far" clears when the
      paper is fully marked; readable in BOTH themes.
- [ ] Every quick-action/button click mid-marking lands (queued, never dropped); Learn chips
      open the right destination via the delegated handler.
- [ ] Hard refresh mid-run: chips, cards, marks, ledger/Trend, chat all replay; nothing lost,
      nothing doubled (doc-twin reconstruction proves out).
- [ ] Clear-chat: doc gates reset, server records kept, fresh run seeds correctly.
- [ ] Console: zero red errors, zero SILENT-SKIP warns.

---
*Update this doc in the same commit as any change to the mechanics it describes — it is a
contract, and a stale contract is worse than none.*

**Changelog**
- 2026-07-07 — v2.1 (Reeham P2 run findings, v7.19.932). Per-question prose ownership + dash-form
  grade lines + calibration-actual rewrite in `_enforceGradeLadder`; gold-distinctness warn net;
  chip labels the marked group, not the pointer; q1-msq emission template deleted (Protocol A owns
  the Q1 turn — the double-mark root); protocol rules added universally: GOLD DISTINCTNESS,
  echo-the-choice-verbatim, GRADE-9 LINE-OF-SIGHT (A15).
- 2026-07-07 — v2 (the CODIFY session, post-Run-9 green). Folded in every v915→929 mechanic:
  wired pre-ship gate, svgifyEmojis display layer, Q5 ceiling one-source, beat-chip full arc,
  always-on strips, RESEED-until-marked, code-tallied Trend, resume-proof ledger, Fix→Learn
  chips, v923 ruling nets, tier-list net, collapsible capability class, queued UI sends,
  grand-total one-source (downward-only fallback), theme-owned readouts, feedback-pad lane.
  Expanded §8 failure index into the full POTENTIAL-ERRORS REGISTER (§9, now 18 classes with
  trigger/symptom/net/residual). Added §0b UNIVERSALITY MAP (engine-universal / doc-derived /
  protocol-ported — Neil's gold-standard ruling), §2b AUTO-FILL CONTRACT (the five-step
  chat→document machinery, Neil's codify ask — generalises to planning/CW/notes) and §10
  HARNESS METHOD. Anchor moved v914/Run-7 → v929/Run-9.
- 2026-07-07 — v1 (initial codification at v7.19.914, Run-7 anchor).
