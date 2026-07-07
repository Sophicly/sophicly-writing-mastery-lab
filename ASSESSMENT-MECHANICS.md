# ASSESSMENT-MECHANICS.md — the engine/UX contract for WML assessments (v1)

**What this is.** The universal MECHANICS standard: how the assessment engine and canvas UX
actually work, why they work that way, and the failure classes that bite when you forget.
It pairs with **PROTOCOL-STANDARD.md** (the protocol CONTENT contract): a port is done when the
protocol meets PROTOCOL-STANDARD and the experience meets THIS document. Written 2026-07-07
(Fable's last session) so every later session — any model — executes at the same depth.
Anchor state: **v7.19.914**, AQA Lang P1 = the reference experience (Reeham Run 7 = the
reference transcript, `Model Answer Resources/AQA_aqa_lang_paper_1_2026-07-07 Reeham Run 7.md`).

File anchors drift with edits — treat every `file:line` here as "grep this symbol", never as a
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
   there's nothing for them); new tasks opt in via **config**, not new code branches.
3. **DYNAMIC** — counts, targets, labels, and structures are derived from the live document /
   protocol / config at runtime, never hardcoded. Test: *"if Neil reorders or renames sections
   in the template, does this still work?"* (v911 beat-chip counts come from the doc-derived
   sidebar model, NOT the model's "Step N of M"; v912 scroll finds boxes by canonical key, not
   position — both survived Neil moving Self-Assessment above the feedback boxes.)

Plus the standing bar (CLAUDE.md NORTH STAR, restated for the port): if you can NAME a failure
mode, engineer it out in the same change; "test and see" is only for genuine unknowns; batch the
whole fix-list into one Neil test cycle; fail loud (`console.warn` on every silent-skip path).

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

**Closing chain** (`_fireClosingFiling`): code-derived FACTS (ranking, losses in
marks-lost order, calibration, blind-spot) are APPENDED to the closing directive so the AI
files Analytics/Action-Plan from authoritative inputs — the AI renders, never recomputes.
Commit = auto-committed grade (`assessment auto-committed` log line) + server flush.

## §2. DUAL PIPELINE — the standing tax on every chat feature

Two `sendCanvasMessage` pipelines exist (primary + twin; plus main-chat planning). EVERY
cross-cutting consumer (`applySectionFills`, `applyAssessmentFeedback`, `applyFieldSets`,
beat-chip sync, pre-chain drivers, closing chain) must be called from BOTH canvas pipelines and
must self-guard. The checklist in CLAUDE.md §DUAL CHAT PIPELINE is mandatory per feature. Replay
(refresh/cross-device) re-renders from `canvasChatHistory` — anything a live path renders into a
bubble must ALSO be stored on the history message and re-prepended in BOTH resume loops
(v911 beat pattern: store `{section,step,total}` on the message; replay calls
`progressChipHTML(msg.beat)`).

## §3. THE CANVAS DOC — ProseMirror law + the section model

- Sections are `sectionBlock` nodes rendered by NodeViews (wml-section-block.js). Types:
  question/source/extract/response/feedback/scores/action/plan/outline/progress/signoff/divider.
- **PM law (memory `reference_wml_pm_nodeview_foreign_mutation_loop`):** real content changes go
  through a PM transaction (`_setParagraphContentViaPM`, `insertContentAt`) — NEVER raw
  textContent/innerHTML/style writes PM will revert. Any runtime UI written into a NodeView must
  live in a **firewalled element** (`ignoreMutation` covers it AND attribute writes on the
  wrapper dom — the v866 rule) with **idempotent writes** (compare before write) and, for
  repeated fills, the `_derivedCardFillOk` circuit breaker.
- **In-flow beats absolute (the v828/v913 settlement):** derived UI belongs IN-FLOW inside its
  section via a firewalled child (progress card → sign-off UI → analytics strip all migrated to
  this shape) — absolute overlays in `dropdownLayer` drift on resize/zoom and clip. Only true
  overlays (dropdown selectors positioned over text) stay absolute.
- **Collapse mechanics (v912 class):** feedback boxes collapse (`swml-fb-collapsed`),
  persisted in localStorage per page+label — collapse SURVIVES sessions and new runs. Anything
  measuring inside a collapsed box reads 0×0 rects and computes garbage. Rule: before
  measuring/scrolling inside `.swml-section-feedback`, auto-expand (class + localStorage `'0'`,
  because the NodeView remount re-reads localStorage) or target the always-visible wrapper.
  Fresh feedback ALWAYS auto-expands its box — collapse is a reading aid for read feedback.
- **Scroll:** ONE helper (`_swmlScrollToTop`) lands targets' top just inside the viewport;
  requery FRESH on every fire; fire + re-assert after PM/animation settle (the v905 shape).
  Never `scrollIntoView({block:'center'})` scattered per call-site; never CSS.escape attribute
  selectors (loop + `getAttribute`).
- **Doc chain:** forward-only snapshots (diagnostic → assessment → … ). Students WRITE only in
  write-stages; assessment stages are mark-only. Target rule (design ready, unbuilt):
  **freeze-on-MARKED, not freeze-on-first-save** — an unmarked stage re-seeds from the latest
  upstream stage on load (`load_canvas()` seed gate). Load-time mutations are the most dangerous
  code in WML (a migrate once wiped a marked doc) — hydration-gated, additive only.

## §4. NUMBERS ARE CODE-OWNED (the v832–852 settlement — never re-litigate)

The LLM never does arithmetic that reaches a student. The engine: parses the canonical number
lines (byte-disciplined formats in PROTOCOL-STANDARD B-COMMON §6), **audits** per-element sums,
snaps element marks to the 0.25 band grid, applies the word-count CEILING (MIN, never a
deduction; ONE ladder incl. per-section), recomputes question totals, rounds the grand total to
WHOLE (half-up), maps grade via the canonical band ladder (`GRADE_BOUNDARIES` = server
`grade_band_percent` — one ladder, two mirrors, keep in sync). **One helper feeds every
surface** — display "Total:", Score Summary "Total Marks:", committed grade must be the same
number by construction (Run 6's 46.75/46/47 disagreement = GPT-taint + surfaces drifting;
Run 7 clean = 48/80 everywhere). Marks land in feedback-box labels `(score / max)` via
`_setFeedbackMark` — labels are then the SOURCE for ranking/analytics (`_rankMarkedAreas`).

## §5. READOUTS — every count/claim has one authoritative source

- **Counts** (beat chip "Step X of N", sidebar steps): the doc-derived sidebar model
  (`_buildLangSidebarModel`/`_buildLitSidebarModel`), synced POST-fill. The model's own claimed
  step numbers are documented-unreliable — never render them.
- **Ranking/analytics** (`_analyticsReadoutModel`): strongest + marks-lost (ordered by RAW marks
  lost, not pct — Ericsson: target where marks bleed) from the marked box labels; calibration
  (mean blind SA % vs actual %, ±10 well-calibrated); conservative blind-spot (rated ≥70,
  scored ≤50, gap ≥20 — never a soft claim). The SAME model feeds the closing-filing facts and
  the visible strip — readout and filed text cannot disagree by construction.
- **Colour = the brand rating ladder everywhere** (1–9 tier from mark ratio), with ONE settled
  exception (Neil 2026-07-07): "Most marks lost" chips colour by LOSS RANK
  (red/orange/yellow) — severity of the bleed, not quality of the score; full-marks chips get
  the brand purple gradient.

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
- SPA boot: `__swmlBooted` single-boot guard; inline IIFEs re-run every nav (run-once guards);
  stale-template wipes and uncancelled fetches are the known killers (memories:
  `reference_wml_canvas_blank_on_refresh_stale_template_wipe`,
  `reference_focus_spa_stale_render_remount_pingpong`).

## §8. FAILURE-CLASS INDEX (name the class before you fix the instance)

| Class | Signature | Rule that kills it |
|---|---|---|
| Name-guard silent skip | works for X, silently nothing for sibling Y | §0 UNIVERSAL: capability-gate + unconditional-call + fail-loud warn |
| PM foreign-mutation loop | tab freeze, no error, onUpdate=0, editorMounts=1 | §3 PM law: firewall + idempotent + circuit breaker |
| Zero-rect scroll | "scrolled to where it used to be"; log shows success | §3 collapse mechanics: expand before measure |
| Overlay drift/clip | UI off its section after resize/zoom; runs under controls | §3 in-flow beats absolute |
| Surface drift (numbers) | two UIs show different totals/grades | §4 one helper feeds all surfaces |
| Model-claimed counts | beat/step numbers contradict sidebar | §5 doc-derived model only |
| Slug/name drift | bank/canvas/quiz no-ops for one course form | §6 one alias registry line |
| Lost-on-refresh | feature works live, gone after reload | §7 store on saved doc/history + replay |
| Out-of-scope ref (.898) | ReferenceError only when path runs | pre-ship gate (`bin/pre-ship-check.sh`) + module-scope hooks for closure-locals |
| Load-time doc wipe | marked doc blanks on entry | §3 doc chain: hydration-gated, additive, freeze-on-marked |

## §9. SHIP GATES (mechanical, in order — never from memory)

1. `bin/pre-ship-check.sh` on staged changes (node --check + eslint no-undef; php -l + braces).
   **Wire it:** `ln -sf ../../bin/pre-ship-check.sh .git/hooks/pre-commit` + deploy-script call —
   as of v914 it is NOT wired, which is how 10 latent no-undef sites shipped.
2. **RUN THE FLOW** — drive the changed path once; scope-clean ≠ correct.
3. Regression matrix for canvas/pipeline/doc-chain/boot changes: WML-SMOKE-TEST.md
   ({P1,P2}×{diagnostic,redraft}×topic + CW 1–4 + quiz + boot). Any red console error = fail.
4. Batch discipline: ONE version bump per distinct fix, ONE commit, ONE Neil test cycle with
   "TEST THIS" + "QUEUED" lists. Staging → Neil → prod (`echo y | deploy-production.sh`).

## §10. SIGN-OFF CHECKLIST — what "sharp" means for the anchor (and every port after it)

An assessment experience is signed off when, on a clean staging run by Neil:
- [ ] Pre-chain: all four stages fire in order, buttons + typed fallbacks, both pipelines.
- [ ] Every marked sub-unit: card filed into the right box, box auto-expands, doc scrolls to the
      region, beat chip matches the sidebar, calibration line correct.
- [ ] Element marks all on the 0.25 grid; penalties each carry a fix-example; two golds per ¶
      (holistic exception: Section B); golds obey the taught order and house language bans.
- [ ] Grand total WHOLE and identical on all three surfaces; grade matches the canonical ladder.
- [ ] Analytics strip + filed Analytics/Action-Plan agree (same code-owned model), ladder colours.
- [ ] Hard refresh mid-run: chips, cards, marks, chat all replay; nothing lost, nothing doubled.
- [ ] Clear-chat: doc gates reset, server records kept, fresh run seeds correctly.
- [ ] Console: zero red errors, zero SILENT-SKIP warns.

---
*Update this doc in the same commit as any change to the mechanics it describes — it is a
contract, and a stale contract is worse than none.*
