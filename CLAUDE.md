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

Every protocol (board + paper + question) has its own AO structure, paragraph scaffold, marking granularity. Do NOT assume uniformity.

- **Language Section A reading Qs** (AQA / Edexcel / Eduqas): single AO per Q from schema. TTECEA ×N paragraphs. Q1 typically retrieval (mark-per-statement); Q2-Q4 analysis/evaluation.
- **Language Section B (Q5)**: AO5 + AO6 holistic-with-structure. Story-spine (narrative) or IUMVCC (transactional). NOT TTECEA. Edexcel IGCSE Spec A uses AO4+AO5 labels (same criteria, different names).
- **Literature essays**: multi-AO per Q. TTECEA+Context. AO allocation differs per paper: AQA lit = AO1+AO2+AO3 (+AO4 SPaG on Shakespeare/modern); Eduqas Shakespeare/modern = AO1+AO2; Edexcel varies per Q; Edexcel IGCSE lit = AO1+AO2+AO4 (AO4 = Context, NOT SPaG).
- **Marking is granular per element across ALL boards.** Every TTECEA (+C) element, intro element, conclusion element gets a specific mark value. Values live in the paper's `protocol-a-assessment.md`. Pedagogy: granular feedback enables deliberate practice (Hattie / Ericsson).
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

1. **Trace the full click path.** User clicks → function → screen render → state change. Check no other handler also fires.
2. **Check for dual event bindings.** Search for `.onclick =` and `.addEventListener` on the same element.
3. **Verify screen transitions.** Old screen cleared before new one renders.
4. **Test the async path.** Both outcomes — data before click AND click before data.
5. **Check both chat pipelines.** Planning AND assessment.

---

## TERMINOLOGY

- **"Units"** = LearnDash Lessons (sfwd-lessons) — renamed for clarity
- **"Lessons"** = LearnDash Topics (sfwd-topic) — renamed for clarity
- **Phase 1** = Initial Attempt (Diagnostic → Assessment)
- **Phase 2** = Redraft (Planning → Outlining → Polishing → Assessment)
- **Topic 1** = Diagnostic (solo essay → assess → guided redraft → assess)
- **Topic 2** = Conceptual Notes (the only notes topic)
- **Topics 3-10+** = Development Essays (same pipeline as Topic 1)

---

## CURRENT BACKLOG

Live items moved to `~/.claude/handoffs/open/wml-backlog.md`. Read that file before starting standalone WML work to know what's queued.
