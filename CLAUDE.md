# CLAUDE.md — Writing Mastery Lab (WML) Project Guide

**Plugin slug:** `sophicly-writing-mastery-lab`
**Current version:** 7.14.33
**Purpose:** AI-powered GCSE/IGCSE English tutoring interface — essay writing, assessment, planning, and polishing.
**AI Provider:** Claude Sonnet 4.6 via MeowApps AI Engine (with GPT-5 fallback).
**Owner:** Neil (Sophicly)

---

## CRITICAL RULES — READ BEFORE ANY EDIT

1. **Surgical precision only.** Never rewrite entire files. Always use targeted edits with exact string matching. The JS file is ~12,000 lines — wholesale changes break things.
2. **Always read a file before editing it.** Content changes between sessions. Never assume line numbers or code blocks from memory.
3. **Bump the version for EACH piece of work.** Update BOTH `Version:` in the PHP header AND the `SWML_VERSION` constant. Every distinct fix/feature gets its own version bump (e.g. v7.12.31 → v7.12.32).
4. **Always validate after editing:** `node --check frontend/wml-app.js` for JS. Brace-count PHP files (`grep -o '{' file.php | wc -l` must equal `grep -o '}' file.php | wc -l`).
5. **Protocol markdown files are content, not code.** Edit them for pedagogy, not for bug fixes.
6. **Never modify shared modules** (`protocols/shared/`) without understanding that ALL exam boards use them.
7. **The sidebar always stays dark** — brand gradient background, never inverts with light/dark theme toggle.

---

## FILE STRUCTURE

```
sophicly-writing-mastery-lab/
├── sophicly-writing-mastery-lab.php    # Main plugin file, hooks, asset enqueue, config
├── frontend/
│   ├── wml-core.js        (~1,400 lines)  # Shared namespace (window.WML): state, config, constants, utilities, el(), formatAI()
│   ├── wml-app.js         (~11,600 lines) # Navigation, planning workspace, assessment canvas, chat, boot
│   ├── wml-styles.css     (~2,600 lines)  # All styles including dark/light theme tokens
│   ├── wml-canvas.css     (~3,500 lines)  # Canvas workspace styles (assessment, diagnostic)
│   ├── wml-shader.js      (~340 lines)    # Stripe-like WebGL shader for backgrounds
│   └── wml-theme-toggle.css (~70 lines)   # Moon/sun toggle component
├── includes/
│   ├── class-rest-api.php       (~1,100 lines) # REST endpoints, chat, canvas save/load
│   ├── class-protocol-router.php (~1,750 lines) # Modular protocol loading, preamble builder
│   ├── class-session-manager.php (~210 lines)   # Session CRUD, plan elements
│   ├── class-topic-questions.php (~900 lines)   # Topic question bank, bulk import
│   └── class-function-handlers.php (~200 lines) # AI Engine function calling handlers
├── protocols/                    # AI tutoring protocols per exam board
│   ├── shared/                   # Universal modules used by ALL boards
│   ├── aqa/                      # AQA exam board (5/5 groups)
│   ├── edexcel/                  # Edexcel (7/7 groups)
│   ├── eduqas/                   # EDUQAS (7/7 groups)
│   ├── ocr/                      # OCR (2/7 groups)
│   ├── edexcel-igcse/            # Edexcel IGCSE (5/7 groups)
│   ├── sqa/                      # SQA
│   └── ccea/                     # CCEA
└── templates/
    └── page-writing-mastery-lab.php  # Page template
```

---

## WORDPRESS META STORAGE — KNOWN GOTCHAS

### The wp_unslash problem
WordPress strips backslashes from meta values on write. JSON containing HTML attributes gets corrupted silently.

**ALWAYS use:**
```php
update_user_meta($uid, $key, wp_slash(wp_json_encode($data)));
```

This applies to ALL `update_user_meta`, `update_post_meta`, and `update_option` calls that store JSON. No exceptions.

**Reading side:** Use `decode_canvas_json()` which tries `json_decode`, then `wp_unslash`, then field-by-field recovery.

### update_user_meta success ≠ data readable
The return value only confirms the DB write. After any new meta storage pattern, verify the round-trip: save → load → decode.

### When data appears missing
Check the storage layer FIRST. Use the `/canvas/debug` endpoint before chasing JS consumer logic.

```js
// Browser console diagnostic:
fetch(swmlConfig.restUrl + 'canvas/debug', {headers: {'X-WP-Nonce': swmlConfig.nonce}}).then(r=>r.json()).then(d=>console.log('DEBUG:', JSON.stringify(d, null, 2)))
```

---

## JAVASCRIPT EVENT BINDING — CRITICAL PATTERN

### Never mix addEventListener and .onclick
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

Features added to one pipeline DON'T automatically work in the other. Checklist for any new chat feature:
- [ ] Works in main chat (planning)?
- [ ] Works in canvas chat (assessment)?
- [ ] Pattern detection runs in both pipelines?
- [ ] UI modifications find the correct container in both contexts?

---

## ASSESSMENT ARCHITECTURE (v7.12.22+)

### Three entry paths into assessment canvas

| Path | How | Notes |
|------|-----|-------|
| A: "Get Assessed" from stepper | `state.task = 'assessment'` → `renderCanvasWorkspace()` → auto-trigger | Most common |
| B: Diagnostic → Mark Complete | Assessment transition runs inside diagnostic canvas | Fresh chat, no history |
| C: Re-enter completed assessment | Same as A, phase already marked complete | Chat restored |

### `initAssessmentState()` — unified function
Handles sidebar progress + Mark Complete for all 3 paths. Scans `canvasChatHistory`, force-extracts scores, checks phase status via API. Called from both `hasSavedChat` and fresh greeting branches.

### Assessment Complete Detection
Triggers when ANY of these match in an AI message:
- `[ASSESSMENT_COMPLETE]` code word
- `## Session Complete` heading
- Both `Total: X/Y` AND `Grade: N` in the same message
- Keywords: `Key Strength`, `Priority Target`, `Action Plan`, `Grand Total`

### Mark Complete Button — three states
Managed by `setAssessBtnState('dormant'|'ready'|'done')`:
- **Dormant:** Grey, "Mark Complete" — click shows warning confirmation
- **Ready:** Green, pulses 3×, "Assessment Complete — Mark Complete" — click saves
- **Done:** Green static, "Complete" — disabled, `pointer-events: none`

Uses icon-btn pattern (`swml-btn-icon` + `swml-btn-text`) for collapsed sidebar support.

---

## PLAN EXTRACTION RULES

- Plan elements saved ONLY through confirm interceptor system (`@CONFIRM_ELEMENT` markers)
- Old fallback regex extractors were removed (v7.10.16) — don't add them back
- `validatePlanContent()` rejects: progress bar text, option labels, protocol leaks, advice text, single-word content
- Extraction runs AFTER the AI reply is added to `chatHistory` — "last assistant message" is the CURRENT reply

---

## PROTOCOL ROUTER PREAMBLE RULES

The preamble is the #1 source of AI behaviour regressions. Rules:

1. **Workflow instructions FIRST, reference data LAST** — AI follows top-of-context more reliably
2. **Scope injections to the relevant task** — never inject assessment-only content into global preamble
3. **Token budget awareness** — assessment preamble is ~80 lines. Compress aggressively.
4. **Guard phrasing** — always tell the AI what NOT to change when injecting reference data
5. **Anti-duplication: say what to skip AND what to still do** — omitting either half causes failures
6. **Never duplicate the protocol** — AI Engine loads it automatically, preamble is APPENDED
7. **The preamble is NOT the protocol** — it's session context and behaviour overrides only

When the AI misbehaves in WML but works in the raw AI Engine chatbot, the preamble is almost always the cause.

---

## QUICK ACTION DETECTION

Patterns checked in ORDER — first match wins.
- Add new patterns BEFORE Pattern 7 (generic fallback)
- Average raw label length > 55 chars = skip (summaries, not choices)
- Detect content context, not magic trigger phrases — the AI paraphrases

### Context-based detection example (AO multi-select):
```js
const isAoContext = /assessment\s*objective|which\s*AO|AO1.*AO2.*AO3/i.test(text)
    && actions.some(a => /^AO\d/i.test(a.label || a.value || ''));
```

---

## SECTION DETECTION (Document Outline)

Uses `getSectionIndicator(section)` for outline checks and `checkSignoffReady()` for gating.

**Clone+strip pattern** for student content detection:
```js
const clone = domSection.cloneNode(true);
clone.querySelectorAll('em, h3').forEach(el => el.remove());
const studentText = clone.textContent?.trim() || '';
if (studentText.length > THRESHOLD) return ' ✓';
```

**Never use `CSS.escape()` for attribute selectors** — use loop-based lookup with `getAttribute()`.

---

## DEBUGGING METHODOLOGY — Simplest Fix First

Check in this order. Stop at the first fix that works:

1. **CSS conflicts** — Is CSS fighting JavaScript?
2. **Load order** — Are dependencies loaded before consumers?
3. **Data existence** — Does the data actually exist in the database?
4. **DOM timing** — Do elements exist when queried?
5. **Only then** — Consider adding JavaScript solutions

The anti-pattern: Adding 20 lines of defensive JS when the real fix is deleting 2 lines of CSS.

---

## PRE-SHIP CHECKLIST

Before shipping any change:

1. **Trace the full click path.** User clicks → function → screen render → state change. Check no other handler also fires.
2. **Check for dual event bindings.** Search for `.onclick =` and `.addEventListener` on the same element.
3. **Verify screen transitions.** Old screen cleared before new one renders.
4. **Test the async path.** Both outcomes: data before click AND click before data.
5. **Check both chat pipelines.** Planning AND assessment.
6. **Run validation.** `node --check wml-app.js`. Brace count PHP. Always.
7. **Version bump.** Both places in PHP.

---

## BRAND & DESIGN

**Colours:** `#5333ed` and `#2c003e` (purple gradients), `#51dacf` / `#7DF9E9` / `#41aaa8` (teal accents), `#1CD991` (success green), `#4D76FD` / `#42A1EC` (blues)

**Fonts:** 'Proxima Soft Complete' (300/400/600/700) and 'Playfair Display Complete' italic, served from `sophicly.b-cdn.net`

**Status colours:**
- Not started: Grey `#9ca3af`
- In progress: Animated purple→blue gradient `#5333ed → #4D76FD → #42A1EC`
- Complete: Green `#1CD991`

**Deadline bar thresholds:** 6+ days = animated teal/blue shimmer, 3-5 days = yellow `#F1C40F`, 1-2 days = orange `#E67E22`, overdue = red

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

## SESSION HANDOFF

At the end of every work session, generate a comprehensive handoff document. See the session handoff skill for the full template. Key requirement: **document every version bump, every change, every decision, every remaining issue.** Zero context loss between sessions.

---

## CURRENT BACKLOG PRIORITIES

1. Entrance animation polish (panels pop rather than smooth fade)
2. Phase 2 planning migration to canvas
3. W1 penalty AI compliance (AI says -5 instead of correct calculation)
4. Score Summary in document not updating when scores change
5. Deep protocol audit — remove panel save references from all protocol files
6. Comments positioning (stuck at top instead of attached to commented text)
