# CLAUDE.md — Writing Mastery Lab (WML)

**Belongs here:** WML-only patterns — protocol router, dual chat pipeline, assessment architecture, plan extraction, terminology.
**Does NOT belong here:** universal Sophicly rules. Those live at `../../../CLAUDE.md`.
**See also:** `PRODUCT.md` (this dir) for users + voice. `../../../sophicly-plugins/BRAND.md` for design.

**Plugin slug:** `sophicly-writing-mastery-lab`
**Current version:** 7.19.102
**Purpose:** AI-powered GCSE/IGCSE English tutoring interface — essay writing, assessment, planning, polishing.
**AI Provider:** Claude Sonnet 4.6 via MeowApps AI Engine (with GPT-5 fallback).

---

## WML CRITICAL ADDITIONS — read before any edit

(Universal critical rules in `../../../CLAUDE.md`. WML adds:)

1. **Protocol markdown files are content, not code.** Edit them for pedagogy, not for bug fixes.
2. **Never modify shared modules** (`protocols/shared/`) without understanding ALL exam boards use them.

---

## FILE STRUCTURE

- `sophicly-writing-mastery-lab.php` — main, hooks, asset enqueue
- `frontend/wml-core.js` (~1.4K lines) — `window.WML` namespace: state, config, constants, `el()`, `formatAI()`
- `frontend/wml-app.js` (~11.6K lines) — navigation, planning, assessment canvas, chat, boot
- `frontend/wml-styles.css` (~2.6K) + `wml-canvas.css` (~3.5K) + `wml-shader.js` (WebGL bg) + `wml-theme-toggle.css`
- `includes/class-rest-api.php` (~1.1K) — REST endpoints, chat, canvas save/load
- `includes/class-protocol-router.php` (~1.75K) — modular protocol loading, preamble builder
- `includes/class-session-manager.php` (~210) + `class-topic-questions.php` (~900) + `class-function-handlers.php` (~200)
- `protocols/shared/` — universal modules used by ALL boards
- `protocols/{aqa,edexcel,eduqas,ocr,edexcel-igcse,sqa,ccea}/` — board-specific
- `templates/page-writing-mastery-lab.php`

---

## JAVASCRIPT EVENT BINDING — CRITICAL PATTERN

The `el()` helper uses `addEventListener('click', fn)` internally. Setting `.onclick = newFn` later does NOT replace the addEventListener callback — both fire.

```js
// WRONG — both doA() and doB() fire on click
const btn = el('button', { onClick: () => doA() });
btn.onclick = () => doB(); // doA() STILL fires too!

// RIGHT — use a flag variable
let action = null;
const btn = el('button', { onClick: () => {
    if (action) action();
    else doA();
}});
action = () => doB(); // clean override
```

---

## CANVAS TASK-SCOPING — #1 RECURRING BUG CLASS (read before adding any canvas post-processor)

Almost every "it works for X but silently does nothing for Y" bug in WML is **behaviour gated by a task-NAME string check**. Examples that have bitten us: `applyAssessmentFeedback` appended inside `if (state.task.startsWith('cw_'))` → never ran for `assessment` (v7.19.600); `assessment_mode()` keyed off a `language2`-only list → P1 vs P2 diverge; canvas slug `aqa_lang_paper_1` vs subject `language1` vs `language_p1` (three names, one thing); `diagnostic` vs `redraft_assessment`; `"Q2"` vs `"Question 2"`. New code inherits the **nearest** name-guard by accident and silently no-ops for every sibling task — and silence reads as success until a human tests.

**RULES (enforce on every canvas change):**

1. **Cross-cutting marker/content consumers run UNCONDITIONALLY + self-guard.** Functions that fill the canvas from the AI reply (`applySectionFills`, `applyAssessmentFeedback`, `applyFieldSets`, reflection detection, …) must be called on EVERY canvas turn and decide internally whether to act (no-op when the reply has nothing for them). NEVER nest them inside a `if (task === …)` / `startsWith('cw_')` guard — that is exactly how they silently skip sibling tasks. Both `sendCanvasMessage` pipelines (the dual pipeline below) must call them.

2. **Gate on CAPABILITIES / task-family, never on a literal task name.** Prefer a capability lookup (does this task get feedback boxes? a reflection panel?) over `task.startsWith(...)`. A new task / topic / paper should opt in via config, so it can't silently miss. (Same principle as the dashboard "derive, don't per-type-wire" rule.)

3. **One canonical naming layer.** Resolve task→family, subject↔canvas-slug, and Q-id (`Q2`/`Question 2`/`2`) through a single helper and reuse it everywhere; key behaviour off the family, not the literal. (`resolve_session_fields` does half of this server-side — extend it; add the JS twin rather than re-deriving names ad hoc.)

4. **Fail loud + rollout matrix.** When a turn LOOKS like it should fill the canvas but fills nothing, `console.warn` loudly (see the SILENT-SKIP guard in `applyAssessmentFeedback`) — don't fail quietly. Before shipping any canvas feature, verify it across **{P1, P2} × {diagnostic, redraft} × {topic 1 … N}** (and both chat pipelines). Match the box by question NUMBER, not the `"Qn"` literal — labels render as `Feedback: Q2 (— / 8)` but the format drifts.

5. **GRANULAR, CANVAS-DERIVED sidebar — the STANDARD for every canvas task (Neil 2026-07-13).**
   No de-stitched task ships the generic essay sidebar. Steps are DERIVED, never hand-authored
   per protocol: (a) one row per document plan/feedback FIELD, grouped by question (labels from
   `data-section-label`, done = field holds text); (b) code-owned pre-chain stages each get their
   own row (grade goal / headline goal / plan mode / predictions), done-ness from the chain's own
   stage detection; (c) live intra-step beats surface via the universal `📌` pin →
   `parseProgressBeat` chip — a protocol wanting finer sidebar granularity emits pins, never a
   new hand-authored step list. Reference impl: `_buildPlanningSidebarModel` (planning) +
   `_buildLangSidebarModel` (assessment, v7.19.625). Numbers/counts in chain texts are likewise
   DERIVED from the document (`_planDocQuestionFacts`) — a hardcoded "five questions" was the bug.

6. **Detection regexes vs markdown (v7.20.50 lesson).** Any regex matched against chat-history
   content must run on MARKDOWN-STRIPPED text (`_planChainNorm`-style `replace(/\*/g,'')`) or
   avoid crossing a `**bold**` boundary — `**3 themes** do` broke `/themes do/` and looped the
   predictions capture forever. Detection regex + question text are ONE unit: change one,
   re-check the other (byte-pair rule).

---

## PROSEMIRROR NODEVIEW — never write to a NodeView's DOM outside a transaction (v7.19.866)

**Root of a whole freeze class.** A section is a ProseMirror NodeView. If ANY code writes DOM
(style / attr / children) onto a NodeView's own `dom` (the `.swml-section-block`) or `contentDOM`
**outside a PM transaction** and it isn't firewalled by that NodeView's `ignoreMutation`, PM's
DOMObserver treats it as a foreign edit → `flush()` → `updateState()` → **redraws every section
NodeView** (removeChild/insertBefore churn). If the write came from the NodeView's own on-(re)mount
fill, the redraw re-runs the fill → re-writes → **infinite compounding remount loop that freezes the
tab** — with **NO error, `onUpdate=0`, `txnTotal=0`, `editorMounts=1`** (it's a view redraw, not a
doc change). Bit the AQA Lang P1 T1 diagnostic on staging (v7.19.866); only there because the big
53-section shared-lesson doc mounts raggedly so a completed-count flickered and toggled a
`style.display` every fill. Full story + the 7-step probe method: memory
`reference_wml_pm_nodeview_foreign_mutation_loop`.

RULES:
1. **Derived-card NodeViews are display-only** (progress, sign-off, any non-editable card filled by
   wml-assessment): their `ignoreMutation` MUST firewall their whole rendered UI **including
   attribute writes on their own `dom`** — `if (mutation.type==='attributes' && mutation.target===dom) return true;`
2. **Write derived-card content into the firewalled sub-element** (`.swml-progress-card` / `.swml-signoff-ui`), never onto the `.swml-section-block` wrapper.
3. **Real content changes go through a PM transaction** (`_setParagraphContentViaPM` / `setNodeMarkup`), never a raw `textContent`/`innerHTML`/`style` write PM will revert.
4. **Idempotent writes** — guard `if (el.style.x !== want) el.style.x = want;` so a same-value write can't fire a needless MutationRecord.
5. **Circuit-breaker exists** (`_derivedCardFillOk` in wml-assessment.js): progress/sign-off fills bail + `console.warn` once at >50 fills/sec. If you add a new derived-card fill, route it through the same guard.

---

## TEXT-SLUG REGISTRY — one canonical layer (v7.19.823+)

`$SLUG_ALIASES` in `includes/class-rest-api.php` is THE text-slug registry. Every inbound slug
(bridge/course-map, picker id, legacy form) normalises through `normalize_text_slug()` at the REST
boundary — canvas load/save AND quiz start; FQ activation (`swmlConfig.fqBankTexts`, built by
`get_fq_bank_texts()` in the main plugin file) expands it so every alias form activates.

1. **Canonical = the form live user_meta keys use.** NEVER flip a canonical to a different form —
   normalisation drives meta-key construction, so flipping silently re-keys student data.
2. **Bank + template FILENAMES use the canonical slug.** Never ship duplicate files per slug form —
   add an alias instead.
3. **Any new divergence** (new course slug, new picker id, dash/underscore drift) gets ONE line in
   `$SLUG_ALIASES`. That is the only place slugs reconcile.
4. **Never silent:** a `foundational_quiz` text with no matching bank `console.warn`s and falls back
   to the legacy AI quiz — that warning means "add an alias or a bank", never a code fork.

### SOP — resolving a bank / template / protocol FILE by text (Neil 2026-07-08: "fix path/file/slug at the root")

Recurring bug class (§9.11 slug/name drift): a selector keys on the WRONG dimension (subject, not
text) or guesses a filename ad-hoc per directory, so the wrong file — or none — is served. The fix
is ALWAYS the same shape; do NOT invent a new per-dir lookup:

1. **Key on the most specific dimension the content varies by.** Mark-scheme examples vary by
   TEXT/anthology (L&R ≠ W&L), not by subject (`poetry_anthology`). A selector keyed on subject
   serves cross-anthology content — that IS the bug. Key on `state.text`; fall back to subject only
   as a last resort.
2. **Resolve through the ONE canonical slug ladder**, never a bare filename:
   `{text}.md · {text}_poetry.md · {canonical(text)}.md · {canonical(text)}_poetry.md`, where
   `canonical()` = `$SLUG_ALIASES`. Reference impl: `SWML_Quiz_Bank::parse_sections_text()` (MSQ,
   v963) + `parse_sections_msa()` (MSA). New bank/template dir → reuse this ladder, don't re-derive.
3. **`file_exists()`-driven, first match wins, graceful fallback.** No hard-coded filename per slug
   form; add a `$SLUG_ALIASES` line for a genuinely new divergence.
4. **Filenames use the canonical slug** (the form the FQ/MSA banks + live user_meta already use —
   e.g. `love_relationships_poetry`, not `love_relationships`). Verify against an existing per-text
   bank in a sibling dir before authoring.
5. **Fail loud on a miss** (`error_log`/`console.warn` naming the slug tried) — a missing per-text
   file means "author the bank / add the alias", never a code fork or a silent generic fallback that
   reads as success.
6. **id/scoring namespaces follow the source** — a per-text quiz stamps `msq:{text}:{board}:{q_num}`
   (not `{subject}:…`) so the stateless resume-scorer rebuilds from the right pool.

## DUAL CHAT PIPELINE

WML has two separate chat systems:
- **Main chat** (`sendChat()`, `addMessage()`, `extractAndSavePlan()`) — planning flow
- **Canvas chat** (`sendCanvasMessage()`, canvas `addChatMessage()`) — assessment flow

Features added to one DON'T automatically work in the other. Checklist for any new chat feature:
- [ ] Works in main chat (planning)?
- [ ] Works in canvas chat (assessment)?
- [ ] Pattern detection runs in both pipelines?
- [ ] UI modifications find the correct container in both contexts?

---

## ⭐ PLAN → OUTLINE → RESPONSE — the doc lifecycle (SETTLED, do NOT relitigate — Neil, re-confirmed 2026-07-16 after multiple re-derivations)

Every structured question (all EXCEPT no-structure ones — AQA P1 Q1 4-mark list, P2 Q1 true/false)
runs this Phase-2 redraft lifecycle. **CW (creative writing) is the one TBD — not yet worked; do NOT
assume this model applies to CW until checked.**

### The three lessons (one continuous doc chain, forward-snapshot)
1. **Planning lesson** — student works ONLY the PLAN section (Socratic planning protocol chat). The
   OUTLINE + RESPONSE sections are not shown/worked here.
2. **Outline lesson** — OUTLINE section shows, **already pre-filled** (from the planning autofill);
   RESPONSE section is empty. Student converts each outline element into a full sentence, then
   transfers to RESPONSE.
3. **Polishing lesson** — same sections + contextual Sophia chat → **Assessment** → **Discuss w/ tutor**.
**Coexistence law:** the outline sits ALONGSIDE the plan — it never replaces it. Never delete the
plan-paragraph boxes when a question gains an outline.

### TWO sections, TWO granularities (this is the part that keeps getting re-derived — get it right)
- **PLAN section = ONE box per paragraph.** That box holds the WHOLE paragraph plan (every element
  line together, accumulated). Q3 = 3 paragraphs → 3 plan boxes (`plan-Q3-para-1/2/3`). Plan
  granularity = **paragraph**.
- **OUTLINE section = one section per paragraph, split into ONE box per ELEMENT.** Outline
  granularity = **element**. Q3 para-1 outline = 6 element boxes.
- A paragraph IS its elements — so "per paragraph" (plan) and "per element" (outline) are the SAME
  content at two layouts, NOT a conflict. Plan = all-in-one-box; outline = split-into-boxes.

### The autofill (v7.20.221 — two grades, ONE source, converging at approval; Neil 2026-07-20)
Two content grades, one lifecycle:
1. **LIVE (during planning):** each confirmed element `@FIELD_COMMIT`s the student's VERBATIM
   words into its own **outline element box** only (immediate feedback; resume-from-doc reads it).
   Plan boxes do NOT fill live (the raw-dictation-accumulating alarm, v7.20.216).
2. **AT MIRROR-BACK APPROVAL (A-Happy):** ONE `@FIELD_SET` per paragraph carries the REFINED
   plan (student's own words condensed to their plan mode — the approval click IS the ownership
   checkpoint, so this is not injection). The ENGINE (`_planFanoutToOutline`, wml-assessment.js)
   then writes that same value to BOTH destinations: the **plan box** as one LINE per labelled
   element (the original "elements as separate LINES — a plan, not prose" spec), and each
   **outline element box** per-element (replacing the raw dictation with the refined text).
   Deterministic, code-owned, label→fieldId mapping byte-traced against the protocol registry —
   NEVER a second set of LLM markers.
**The law restored:** plan and outline hold the SAME content at two layouts ("copy to two
destinations"), now at the approved grade. Replays (`applyFieldSets(…, {replay:true})`) may fill
empty rows or untouched auto-fills only — a student's outlining-lesson edits are never clobbered.

### Q3 paragraph elements (6; ×3 paragraphs). Q2/Q4 DIFFER — read the protocol, do not assume.
1. Topic sentence · 2. Technical terms + evidence + inference *(ONE element/line)* · 3. Close
analysis · 4. Effect 1 · 5. Effect 2 · 6. Author's purpose.
(Q2 = 2 paragraphs, a different element set; Q4 = evaluation/AO4, its own set + paragraph count.
Pull each question's real element set from the protocol/outline builder before building.)

### Which questions get plan+outline · how many paragraphs · which elements (the derivation rule — Neil 2026-07-16)
Do NOT ask which elements a question has — it DERIVES from these rules + the protocol. Full per-question
map (every board/paper): `PROTOCOL-QUESTION-STRUCTURE-MAP.md` (plugin root).

**⛔ ANTI-GUESS GATE (Neil caught this twice 2026-07-16 — trust rule, not cosmetic).** The
paragraph-count-by-marks rule below is a **FALLBACK/default only — it is a GUESS.** A question's REAL
structure is the PROTOCOL's per-question line, already recorded + `file:line`-cited in
`PROTOCOL-QUESTION-STRUCTURE-MAP.md`. **Before stating ANY question's structure, READ its map row and
quote it — NEVER restate structure from the marks rule.** Proof: AQA Lang P2 Q4 = *short Intro (0.5) +
3 comparative TTECEA BPs + short Conclusion (0.5)*, NOT the "16→4 body paragraphs" the marks rule
implies — the map had it right; guessing from marks got it wrong. If the map and the marks-rule
disagree, the map wins (it read the protocol); if the map is silent, read the protocol directly and
cite it — do not fill the gap with the marks rule.
- **Plan+outline ONLY for questions needing STRUCTURE.** SKIP the basic retrieval ones (no plan/outline):
  AQA Lang P1 Q1 (list 4 statements), P2 Q1 (choose 4 true statements), and any true/false /
  mark-per-statement / short-retrieval / MCQ comprehension. Right-or-wrong; we don't teach planning for them.
- **Paragraph count by marks (default; a protocol may override):** 8→2 body ¶ · 12→3 ¶ · 16→4 ¶ OR 5
  (short intro + 3 strong body + short conclusion) · 20+/literature essays → full essay (intro+N body+conc).
  Reading/analysis Qs = **body-only** TTECEA (no intro/conc). Section B extended writing = a whole-answer
  structure, NOT TTECEA: transactional/persuasive → **IUMVCC** (Intro·Urgency·Method·Vision·Counter·
  Conclusion); creative/narrative → **story-spine / 7-step scene**.
- **TTECEA body bedrock** (the reused analytical skeleton — one outline element-row each; source of truth =
  `OUTLINE_CRITERIA.literature` in wml-assessment.js): 1. Topic Sentence (AO1) · 2. Technique+Evidence+
  Inference (AO2/AO1, one row) · 3. Close Analysis (AO2) · 4. Effect 1 on Reader (AO2) · 5. Effect 2 on
  Reader (AO2) · 6. Author's Purpose (AO1/AO3) · 7. Context (AO3 — **only if the Q assesses AO3**).
  Whole-essay/evaluation adds intro (Hook·Context·Thesis) + conclusion (Restated Thesis·Controlling
  Concept·Central Purpose·Universal Message); evaluation Qs often use a SHORT intro (thesis only) + SHORT
  conclusion (restated thesis). Single-AO Qs stamp EVERY element to that AO (AQA Lang P1 Q2/Q3 = AO2; Q4 =
  AO4 evaluation). TTECEA is the bedrock; other questions ADAPT it (AO restriction, short intro/conc) —
  continuous transfer of the same skill (Ericsson deliberate practice: work each element one at a time).
- **Why the outline is element-boxes not a paragraph box:** it forces the student to treat each SENTENCE as
  a graded unit (every sentence contributes), building the paragraph sentence-by-sentence. The PLAN is the
  skeleton (elements as separate LINES — a plan, not prose); the OUTLINE makes them work each element into a
  full sentence.

### Precedent + the live gap
- **IUMVCC (AQA P2 Q5) is the working precedent** — its plan sections + outline rows already wire
  this way (`buildIUMVCCOutlineSection`, `_iumvccFieldId`). Mirror its shape, not its literal ids.
- **THE READING-Q GAP (the planning arc):** Q2/Q3/Q4 outlines already RENDER element boxes
  (`outline-body-{i}-{elementId}-q{N}`, `-q{N}` suffix added v7.20.107) but the reading-Q **planning
  protocol never emits `@FIELD_COMMIT` to them** → outline stays empty (Neil's "no outline sections
  filled for Q2/Q3/Q4"). The fix is protocol + wiring (Opus lane, pedagogy already ruled — NOT
  Fable): make the reading-Q planning chat confirm element-by-element and emit to each outline
  element box + the paragraph plan box. **Byte-trace every fieldId pair before shipping**
  (key-mismatch = #1 recurring bug). Only `aqa/language2/planning/protocol-b-planning.md` emits
  `@FIELD_COMMIT` today; ~others emit 0.
- Node types: PLAN boxes = `inputField`; OUTLINE boxes = `outlineRow`; `@FIELD_COMMIT` fills both.
  Outline shape is BAKED into the saved doc → element/scaffold changes need an on-load heal.

Fuller detail + the 3-lesson forward-snapshot chain: memory
`reference_wml_planning_outline_response_lesson_flow`.

---

## ASSESSMENT ARCHITECTURE (v7.12.22+)

Three entry paths into the assessment canvas:

| Path | How | Notes |
|------|-----|-------|
| A: "Get Assessed" from stepper | `state.task = 'assessment'` → `renderCanvasWorkspace()` → auto-trigger | Most common |
| B: Diagnostic → Mark Complete | Assessment transition runs inside diagnostic canvas | Fresh chat, no history |
| C: Re-enter completed assessment | Same as A, phase already marked complete | Chat restored |

**`initAssessmentState()`** — unified function. Handles sidebar progress + Mark Complete for all 3 paths. Scans `canvasChatHistory`, force-extracts scores, checks phase status via API.

**Assessment Complete Detection** triggers when ANY match in an AI message: `[ASSESSMENT_COMPLETE]` code word, `## Session Complete` heading, both `Total: X/Y` AND `Grade: N` in the same message, or keywords (`Key Strength`, `Priority Target`, `Action Plan`, `Grand Total`).

**Mark Complete Button** — three states via `setAssessBtnState('dormant'|'ready'|'done')`:
- **Dormant:** Grey. Click → warning confirmation.
- **Ready:** Green, pulses 3×. Click → saves.
- **Done:** Green static. Disabled (`pointer-events: none`).

Uses icon-btn pattern (`swml-btn-icon` + `swml-btn-text`) for collapsed sidebar support.

---

## PLAN EXTRACTION RULES

- Plan elements saved ONLY through confirm interceptor system (`@CONFIRM_ELEMENT` markers).
- Old fallback regex extractors removed (v7.10.16) — don't add them back.
- `validatePlanContent()` rejects: progress bar text, option labels, protocol leaks, advice text, single-word content.
- Extraction runs AFTER the AI reply is added to `chatHistory` — "last assistant message" is the CURRENT reply.

---

## PROTOCOL ROUTER PREAMBLE RULES

The preamble is the #1 source of AI behaviour regressions. Rules:

1. **Workflow instructions FIRST, reference data LAST** — AI follows top-of-context more reliably.
2. **Scope injections to the relevant task** — never inject assessment-only content into global preamble.
3. **Token budget awareness** — assessment preamble is ~80 lines. Compress aggressively.
4. **Guard phrasing** — always tell the AI what NOT to change when injecting reference data.
5. **Anti-duplication: say what to skip AND what to still do** — omitting either half causes failures.
6. **Preamble is PREPENDED, protocol LAST.** `inject_session_context()` assembles `preamble → skip_block → modular_protocol` as `$query->instructions`. LLMs typically weight late content more heavily, so protocol module content is closest to the user turn and should dominate. If both give conflicting rules, expect the protocol to win (model-dependent, not guaranteed).
7. **The preamble is NOT the protocol** — it's session context + hard gates + cross-cutting invariants. Behaviour rules belong in protocol modules.

When the AI misbehaves in WML but works in the raw AI Engine chatbot, the preamble is almost always the cause.

---

## PROTOCOL REFACTORS — STUDY EACH PROTOCOL (v7.17.0+)

**⭐ Before touching ANY assessment or planning protocol, read `PROTOCOL-STANDARD.md` (plugin root). It is the codified contract — R&J gold standard + Neil's locked expectations + grep-able acceptance checks. A protocol change that fails its checks does not ship.**

**⭐ Before touching the assessment ENGINE or canvas UX, read `ASSESSMENT-MECHANICS.md` (plugin root, added at v7.19.914). It is the engine/UX contract — the root/universal/dynamic doctrine made testable, the session-lifecycle spine, PM law, code-owned arithmetic, the failure-class index, and the sign-off checklist. PROTOCOL-STANDARD = what the protocol says; ASSESSMENT-MECHANICS = how the machine behaves; a port is done only when BOTH are met. Update it in the same commit as any mechanics change.**

**⭐ Before building ANY rule that decides HOW MUCH A STUDENT IS HELPED, DEMANDED OF, OR EXEMPTED FROM — read `PEDAGOGY.md` (plugin root, added 2026-07-15). It is the WHY layer: the learning principles the protocols and the engine must SERVE. PROTOCOL-STANDARD = what the protocol says; ASSESSMENT-MECHANICS = how the machine behaves; PEDAGOGY = why either is right. When a pedagogy rule and the code disagree, PEDAGOGY.md is right and the code is a defect. Its §1 is load-bearing and easy to get wrong: leniency/scaffolding/optionality are calibrated to the INSTRUCTION THE STUDENT HAS RECEIVED, never to where they sit in a course — any predicate keying on topic/phase/paper to decide "how much help" is suspect BY CONSTRUCTION (that IS the live `_isFirstDiagnostic` defect). Update it in the same commit as any pedagogy ruling — a rule recorded only inside its consumer gets re-derived wrongly by the next one.**
**It is also the RULINGS REGISTER. `§0` is a mandatory PROCEDURE: search PEDAGOGY.md → memory → the protocol BEFORE asking Neil any "should X / does X get…" question, and before writing any handoff line that calls a ruling OPEN. Neil has given this instruction three times; it is now a gate, not a preference. `§3` = the outline gate: an outline is earned by STRUCTURE, never by MARKS (AQA Lang P2 Q2 = 8 marks, two paragraphs → gets one). When Neil rules, write it into PEDAGOGY.md in the SAME session — a ruling recorded only in a memory file survived exactly one day before he was asked to re-decide it.**

**⭐ Before touching ANY Conceptual-Notes protocol, template, or chat surface (poetry, literature/novels-and-plays, nonfiction), read `CN-STANDARD.md` (plugin root, added 2026-07-10). It is the CN contract — depth calibration (anthology=light per-item, set text=deep), element/doc structure (notes → quotes → effect, craft-only effect boxes), PACE (deep never dragging), four-fold EFFECTS, OWNERSHIP (no-injection law, evidence ladder, wrongness gate, enrichment), session-lifecycle laws (start path always produces a turn; gap-aware re-entry; code-derived chip), the Part B port checklist, and grep-able acceptance checks. A CN change that fails its checks does not ship. Update it in the same commit as any CN mechanics change.**

Every protocol (board + paper + question) has its own AO structure, paragraph scaffold, marking granularity. Do NOT assume uniformity.

- **Language Section A reading Qs** (AQA / Edexcel / Eduqas): single AO per Q from schema. TTECEA ×N paragraphs. Q1 typically retrieval (mark-per-statement); Q2-Q4 analysis/evaluation.
- **Language Section B (Q5)**: AO5 + AO6 holistic-with-structure. Story-spine (narrative) or IUMVCC (transactional). NOT TTECEA. Edexcel IGCSE Spec A uses AO4+AO5 labels (same criteria, different names).
- **Literature essays**: multi-AO per Q. TTECEA+Context. AO allocation differs per paper: AQA lit = AO1+AO2+AO3 (+AO4 SPaG on Shakespeare/modern); Eduqas Shakespeare/modern = AO1+AO2; Edexcel varies per Q; Edexcel IGCSE lit = AO1+AO2+AO4 (AO4 = Context, NOT SPaG).
- **Marking is granular per element across ALL boards.** Every TTECEA (+C) element, intro element, conclusion element gets a specific mark value. Values live in the paper's `protocol-a-assessment.md`. Pedagogy: granular feedback enables deliberate practice (Hattie / Ericsson).
- **UNIVERSAL PER-PARAGRAPH RULE (SETTLED — do not relitigate).** Every *paragraph* in a reading question gets ALL FOUR, every time: (1) granular mark, (2) feedback, (3) the student's answer rewritten to gold standard, (4) an alternative optimal gold-standard model. Applies uniformly to Q2 ¶1 AND ¶2, Q3 BP1/2/3, Q4 intro + BPs + conclusion — equal depth per paragraph. If a protocol gives one paragraph less than another (e.g. a monolith that marks ¶2 but skips its feedback/gold), that is a **protocol bug to fix**, not a spec to preserve. **Q1 excluded** (true/false retrieval: score + per-statement feedback, no gold). **Section B / Q5 (extended writing, e.g. AQA 40 = AO5 24 + AO6 16): MARK holistically** (whole-piece — AO5 = sustained crafting + structure across the arc; AO6 = vocab/sentence forms/punctuation-for-effect/SPaG across the whole). Do NOT split Section B into equal-weighted paragraph marks. **But keep granularity where it teaches**: per-IUMVCC-section feedback (Introduction/Urgency/Methodology/Vision/Counter-argument/Conclusion) + ONE labelled-holistic gold rewrite (one flowing article, six sections labelled inside). Unit of granularity = paragraph for reading Qs, IUMVCC-section for writing.
- **Every penalty must carry a fix-example (UNIVERSAL — all protocols).** A deducted penalty states the fault AND a one-line worked example of the fix (rewrite the student's actual phrase / give a model phrasing). Never "use more precise language" with no example. Applies to every board/paper's penalty instructions + shared penalty-code modules.
- **Never label sub-parts "Unit N" (terminology clash).** "Units" = LearnDash Lessons in Sophicly's course structure — students know that meaning. Do NOT call A-B-A-B inference sub-parts (or any paragraph sub-elements) "Unit 1 / Unit 2" in marking output. Use a non-colliding word (e.g. "Point", "Element", "Inference 1").
- **Creative writing** is more holistic but still element-targeted per protocol beats.
- **Preamble is session-context + hard gates only** (v7.17.0+). Mark-scheme shape lives in protocol modules.

**Anomalies that bite** (full list in `~/.claude/plans/you-are-wml-chat-humble-turing.md`): AQA Lang P2 Q4 fixed 3-aspect TTECEA; Edexcel IGCSE Lang P1/P2 are multi-Q response sets not essays; Edexcel IGCSE AO4 = Context (opposite of GCSE); OCR Poetry Part (a)/(b) penalty rules; TTECEA element-AO annotations in shared modules are TEACHING guides, not mark-allocation keys.

**Before refactoring any assessment code**, read the paper's `protocol-a-assessment.md`, `foundation*.md`, `knowledge-ttecea*.md`.

---

## QUICK ACTION DETECTION

Patterns checked in ORDER — first match wins.
- Add new patterns BEFORE Pattern 7 (generic fallback).
- Average raw label length > 55 chars = skip (summaries, not choices).
- Detect content context, not magic trigger phrases — the AI paraphrases.

Context-based detection example (AO multi-select):
```js
const isAoContext = /assessment\s*objective|which\s*AO|AO1.*AO2.*AO3/i.test(text)
    && actions.some(a => /^AO\d/i.test(a.label || a.value || ''));
```

---

## SECTION DETECTION (Document Outline)

`getSectionIndicator(section)` for outline checks; `checkSignoffReady()` for gating.

Clone+strip pattern for student-content detection:
```js
const clone = domSection.cloneNode(true);
clone.querySelectorAll('em, h3').forEach(el => el.remove());
const studentText = clone.textContent?.trim() || '';
if (studentText.length > THRESHOLD) return ' ✓';
```

**Never use `CSS.escape()` for attribute selectors** — use loop-based lookup with `getAttribute()`.

---

## WML PRE-SHIP CHECKLIST

(Universal validation rules in `../../../CLAUDE.md`. WML adds:)

0. **MECHANICAL GATE FIRST — do not rely on memory.** Run `bin/pre-ship-check.sh` on your staged
   changes before commit/deploy: `node --check` + `eslint no-undef` (JS) and `php -l` + brace
   parity (PHP). `node --check` catches SYNTAX only; **`eslint no-undef` catches the out-of-scope
   reference class** — e.g. a module-scope helper calling a closure-local `sendCanvasMessage`
   (the v7.19.898 crash: `sendCanvasMessage is not defined`, invisible to `node --check`). When
   extracting a function across scopes, EVERY free variable it uses must be reachable in the new
   scope (module-scope + params only — closure-locals do NOT hoist); the gate proves it, so you
   don't have to eyeball it.
0b. **RUN THE FLOW — a syntax/scope-clean file can still be logically wrong.** For any change
   touching a runtime path (a chat pipeline, a submit handler, marking, boot), DRIVE that path
   once (or `/verify`) before shipping. Syntax-checking a submit handler is not testing it. The
   .898 crash shipped because it was checked, not run.
0c. **SLUG / IDENTITY TRACE — mandatory for ANY feature keyed on a slug/subject/text/path/family/key.**
   Verifying the DESIGNED slug exists (seeded option, config key, bank `@text`, file on disk) is NOT
   enough — the feature is inert if the REAL lesson resolves to a different slug than the gates check.
   (a) Grep EVERY gate that keys on the identity (client detection predicates, router arms, preamble
   branches, server discriminators, roster/bank/template/protocol resolvers, canvas meta-key builders,
   autofill field composers). (b) Get the REAL resolved value from a real lesson — read the shortcode
   atts or `wp eval` the resolver (`text_to_template_slug`, subject derivation, `normalize_text_slug`,
   `canonical_slug`); NEVER assume the picker/design sets it (the bridge/course-map/derivation
   overrides). (c) Diff real-vs-expected at EVERY gate (table: gate | checks-for | real | match?). Any
   mismatch = a silent miss. Prefer ONE canonical predicate/resolver over N literal checks. Full SOP:
   memory `feedback_slug_trace_mandatory_preship_gate` (proof: nonfiction CN loaded Literature because
   the bridge emits `language_p1`/`edexcel_igcse_lang_a`, not the mold's `nonfiction_anthology`/
   `igcse_lang_nonfiction` — every gate missed while all "data exists" checks passed).

1. **Trace the full click path.** User clicks → function → screen render → state change. Check no other handler also fires.
2. **Check for dual event bindings.** Search for `.onclick =` and `.addEventListener` on the same element.
3. **Verify screen transitions.** Old screen cleared before new one renders.
4. **Test the async path.** Both outcomes — data before click AND click before data.
5. **Check both chat pipelines.** Planning AND assessment.

**Full regression gate:** for any change touching canvas / either chat pipeline / migrate-heal chain / saved doc shape / quiz engine / boot wiring, run the staging matrix in **`WML-SMOKE-TEST.md`** (plugin root) before prod. `{P1,P2}×{diagnostic,redraft}×topic` + CW steps 1–4 + quiz record/resume + boot/SPA-nav. Any red console error = fail.

---

## TERMINOLOGY

- **"Units"** = LearnDash Lessons (sfwd-lessons) — renamed for clarity
- **"Lessons"** = LearnDash Topics (sfwd-topic) — renamed for clarity
- **Phase 1** = Initial Attempt (Diagnostic → Assessment)
- **Phase 2** = Redraft (Planning → Outlining → Polishing → Assessment)

**Topic 2 = Conceptual Notes when:**
- All Literature texts (fixed text — notes scratchpad)
- Paper 2 across most boards (anthology + creative-writing mix): AQA, Edexcel GCSE, Edexcel IGCSE, Cambridge IGCSE, CCEA, Eduqas
- All Edexcel IGCSE Language papers (Spec A anthology-style — both P1 and P2)

**Topic 2 = PP2 (NO Conceptual Notes) when:**
- All Language Paper 1 across most boards — AQA, Edexcel GCSE, Cambridge IGCSE, CCEA, Eduqas, OCR. Paper 1 is fiction-based and Sophicly embeds its separate Creative Writing course into these papers, so no need for Conceptual Notes at the paper level.
- OCR Paper 2 (also fiction-based — exception to the P2-has-CN rule above).

**Topic numbering — Language Paper 1 (fiction-based, no CN):**
- **Topic N** = Practice Paper N. 5 topics total per paper.
- Each Topic contains diagnostic write + initial assessment + guided redraft + reassessment as PHASES — NOT separate Topics.

**Topic numbering — Language Paper 2 (anthology + CW mix, has CN — AQA / Edexcel GCSE):**
- Topic 1 = Diagnostic Paper (paired sources)
- Topic 2 = Conceptual Notes
- Topics 3, 5, 7, 9 = Transactional Writing prompts (Article, Speech, Letter, Leaflet)
- Topics 4, 6, 8, 10 = Practice Papers 2-5 (paired sources)

**Topic numbering — Literature texts + Edexcel IGCSE Language:**
- **Topic 1** = First essay — diagnostic + redraft phases inside
- **Topic 2** = Conceptual Notes
- **Topics 3-10+** = Development essays / anthology items

The bridge picker's `wml_topic` field maps each LD lesson (Write Essay / Assessment / Planning / Outlining / Polishing / Reassessment) to which Practice Paper or topic it belongs to.

---

## CURRENT BACKLOG

Live items moved to `~/.claude/handoffs/open/wml-backlog.md`. Read that file before starting standalone WML work to know what's queued.
