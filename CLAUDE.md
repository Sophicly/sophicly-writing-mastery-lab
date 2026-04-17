# CLAUDE.md — Writing Mastery Lab (WML) Project Guide

**Plugin slug:** `sophicly-writing-mastery-lab`
**Current version:** 7.15.52
**Purpose:** AI-powered GCSE/IGCSE English tutoring interface — essay writing, assessment, planning, and polishing.
**AI Provider:** Claude Sonnet 4.6 via MeowApps AI Engine (with GPT-5 fallback).
**Owner:** Neil (Sophicly)

---

## UNIVERSAL BEHAVIORAL PRINCIPLES

These are mindset defaults. The sections below (`CRITICAL RULES`, `BUG FIX SOP`, etc.) are WML-specific overrides — when they conflict with these, WML-specific wins. For trivial one-liner fixes, use judgment; don't let process block a typo fix.

### 1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

For debugging specifically, see `Debugging Methodology — Simplest Fix First` below.

### 3. Surgical Changes
See CRITICAL RULE #1 for the WML-specific enforcement. Additional universal rules:
- Don't "improve" adjacent code, comments, or formatting.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused. Don't remove pre-existing dead code unless asked.
- Test: every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

For WML bug fixes specifically, the `BUG FIX STANDARD OPERATING PROCEDURE` below is the project-tuned instance of this principle.

---

## CRITICAL RULES — READ BEFORE ANY EDIT

1. **Surgical precision only.** Never rewrite entire files. Always use targeted edits with exact string matching. The JS file is ~12,000 lines — wholesale changes break things.
2. **Always read a file before editing it.** Content changes between sessions. Never assume line numbers or code blocks from memory.
3. **Bump the version for EACH piece of work.** Update BOTH `Version:` in the PHP header AND the `SWML_VERSION` constant. Every distinct fix/feature gets its own version bump (e.g. v7.12.31 → v7.12.32).
4. **Always validate after editing:** `node --check frontend/wml-app.js` for JS. For PHP: run `php -l file.php` on every modified PHP file (catches syntax errors AND missing class references). Also brace-count (`grep -o '{' file.php | wc -l` must equal `grep -o '}' file.php | wc -l`). When calling a class statically (e.g. `ClassName::method()`), always `grep '^class '` in the target file to verify the exact class name — the project uses mixed naming conventions (`SWML_*` vs `Sophicly_*`).
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

## BUG FIX STANDARD OPERATING PROCEDURE

For any bug that isn't a trivial one-liner:

1. **INVESTIGATE** — Trace the full code path. Read the actual code, don't guess. Find the ROOT CAUSE, not the symptom. Log the findings.
2. **PLAN** — Write a clear fix plan: what file, what line, why this is the actual cause, what the fix is. Get user confirmation before coding.
3. **EXECUTE** — Make the surgical fix. One targeted change, not a cascade of patches.
4. **VALIDATE** — `node --check`, brace count, syntax validation.
5. **TEST** — Deploy to staging. Verify the fix works. Check console for errors.
6. **COMMIT** — Git commit with clear message describing root cause + fix.
7. **DEPLOY** — Deploy to production when confirmed.

**NEVER patch symptoms.** If a fix doesn't work, go back to step 1 and investigate deeper. Do not add another layer of patches on top — that creates fragile, hard-to-debug code. Every fix attempt that fails means the root cause hasn't been found yet.

**INVESTIGATE BEFORE FIXING.** For every bug report, always read the actual code and trace the full execution path BEFORE proposing any fix. Don't make assumptions about what the code does — read it. Multiple bugs in a session often share a single root cause (e.g. a scoping issue, a timing race, a missing condition). Find the root and fix it once, rather than patching each symptom individually.

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

## SOPHICLY ROLE + PERMISSION CONVENTIONS

### Roles are user_meta, NOT WordPress roles
Sophicly never calls `add_role()`. Role identity lives in two `user_meta` keys:
- `sophicly_role`: `'student'` | `'parent'` | `'sss'`
- `sophicly_att_role`: `'tutor'` | `'specialist'`
- Admin is the stock WordPress check: `current_user_can('manage_options')`.

**SSS is dual-checked:** a user is a Student Success Specialist if `sophicly_role === 'sss'` OR `sophicly_att_role === 'specialist'`. Both forms exist in the DB and permission code must accept either.

Canonical role-check block:
```php
$is_admin      = current_user_can('manage_options');
$att_role      = get_user_meta($uid, 'sophicly_att_role', true);
$sophicly_role = get_user_meta($uid, 'sophicly_role', true);
$is_tutor      = $att_role === 'tutor';
$is_specialist = $att_role === 'specialist' || $sophicly_role === 'sss';
$is_parent     = $sophicly_role === 'parent' || $att_role === 'parent';
```

### Parent → child mapping
Custom DB table `{prefix}sophicly_connections`. Schema at `sophicly-plugins/sophicly-student-data/includes/class-database.php:224-239`.
- Columns: `parent_id`, `student_id`, `status`, `invited_email`, `created_at`, `connected_at`.
- **Status values drift between `'active'` (legacy) and `'connected'` (current).** Queries must accept both: `status IN ('active', 'connected')`. Don't assume one or the other.
- Reverse direction (parent → children) has NO helper function — query the table directly.
- Forward direction (student → parents): `Sophicly_Deadline_Engine::get_parent_ids($student_id)` at `sophicly-student-data/includes/class-deadline-engine.php:786`.

### Tutor access policy — global, NOT group-scoped
Any tutor can view and comment on ANY student's work, regardless of group assignment. **Reason:** Sophicly runs catch-up lessons where a student may attend any tutor's session, so their tutor-of-the-day needs access. Attendance-tracker `group_tutors` exists but is NOT used for WML review gating. Do not add group-scoping back in.

Admins and specialists likewise bypass any scoping. Only parents are gated per-student (via the connections table).

### WML viewer-mode enum
`Sophicly_Writing_Mastery_Lab::resolve_viewer_mode($viewer_id, $target_user_id)` returns:
- `'edit'` — viewer is the student themselves.
- `'comment'` — admin / tutor / specialist viewing anyone.
- `'readonly'` — parent viewing a connected child.
- `false` — no permission.

Threaded to frontend via `swmlConfig.viewerMode` and `state.viewerMode`. Use this enum for any new permission gating rather than inventing parallel checks.

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
6. **Run validation.** `node --check` on all modified JS. `php -l` on all modified PHP. Brace count PHP. Verify any `ClassName::method()` calls use the correct class name (`grep '^class '` in the file). Always.
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
