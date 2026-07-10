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
