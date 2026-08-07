# Canvas Chrome — Minimal Spec

**Status:** ⭐ **SHAPE APPROVED by Neil, 2026-08-07.** Ready to build.
**Author:** WML chat A · 2026-08-07 · against v7.20.458
**Register:** product (design serves the product — `PRODUCT.md`)
**Trigger:** Neil, 2026-08-07: *"I want the WML header and the chat header, I want them both gone.
There's really no reason for them to be there."* Plus: keep the carousel; find a new home for
dictation, download and the others.

---

## 1. What is being removed, and what has to go somewhere

Measured from the code today, not from memory.

| surface | contents | verdict |
|---|---|---|
| `.swml-canvas-header` | context badges — **EIGHT kinds, not three; one of them is a button. Full inventory + ruling in §4d** · **19-tool carousel** · theme toggle · fullscreen | **DELETE the bar.** Contents redistributed below. |
| `.swml-canvas-chat-header` | step title (`Step 5: Choose Plot Structure — "project"`) · clear-chat button | **DELETE the bar.** Title is a third copy; button rehomed. |
| `.swml-logo` (sidebar) | Writing Mastery Lab phoenix | **DELETE.** They know which product they are in. |
| `.swml-collapse-btn` | collapse/expand sidebar | **KEEP,** unchanged position. |

**The 19 tools** (`wml-assessment.js:25400-25445`): bold · italic · underline · strike · highlight
(6 colours + remove) · H2 · H3 · ¶ · text smaller · text larger · blockquote · horizontal rule ·
checklist · undo · redo · comment · save · export · dictation.

⭐ **The carousel exists because 19 tools do not fit.** Neil wants to keep the carousel and that is
fine — but the count is the reason the bar felt heavy, so the triage below still applies. A
contextual toolbar holding all 19 would reproduce the problem in a floating box.

---

## 2. ⚠️ THE FINDING THAT RESIZES THE JOB — there is no document selection toolbar

Both existing `.swml-selection-toolbar` instances (`wml-assessment.js:15292` and `:32935`) bind to
**`chatMessages.addEventListener('mouseup')`** and carry **Reply · Insert into Doc · Copy · Note**.
They act on **Sophia's** text, not the student's.

So this is not "add a layer to the contextual toolbar we have". It is:
- **BUILD** a document-side contextual toolbar (new), and
- **LEAVE the chat-side one completely alone** (§4c — Neil ruled it unchanged).

⭐ **CORRECTION, measured 2026-08-07:** the two chat copies are NOT both live. The one at
`wml-assessment.js:15292` sits behind an unconditional `return;` with an
`// eslint-disable-next-line no-unreachable` above it — **it is dead code**. The live one is at
`:32935`. So there is exactly ONE live chat toolbar, and FIXLIST #275's "one toolbar source" is a
smaller job than it reads. Do not "fix" the dead copy; do not delete it in this cycle either — it is
out of scope and touching the chat file is what Neil ruled out.

**The corollary that matters for the build:** the document toolbar is genuinely NEW code, not an
extension of an existing component. Nothing is being refactored underneath it, so it can ship
without putting the chat surface at risk.

---

## 3. THE TRIGGER — researched, and the answer is selection, with one addition

Neil's question: on writing · on highlight · or a subtle cursor affordance that expands?

**Verdict: SELECTION-triggered, and never typing-triggered.**

1. **Formatting is a post-hoc act.** A student writing a sentence is composing, not styling. A bar
   that appears while typing arrives exactly when it is not wanted, and occludes the line being
   written — the single most-cited complaint about balloon toolbars is that they obstruct the
   content ([CKEditor](https://ckeditor.com/blog/best-rich-text-editor-for-any-use-case/)).
2. **Selection is the universal convention** — Medium, Notion, Docs, Craft, Linear, and both
   references Neil supplied (Notatify, Notelify). Zero learning cost for a 14-year-old who has met
   it in Google Docs at school. Contextual toolbars appear only when text is selected, which is
   what removes the clutter during normal typing
   ([Velt](https://velt.dev/blog/rich-text-editor-ui-design-best-practices)).
3. **The evidence is not one-sided and the dissent matters:** some users prefer a fixed bar because
   the balloon covers the text, and the usual guidance is that **long-form writing anchors the
   toolbar to the top of the editor** ([Velt](https://velt.dev/blog/rich-text-editor-ui-design-best-practices),
   [Zendesk Garden](https://garden.zendesk.com/patterns/rich-text-editor/)). WML *is* long-form.
   **This is answered by placement, not by re-adding a bar** — see §5 (the toolbar flips above/below
   the selection so it never covers what is selected).

**The cursor affordance Neil floated is right, but for a different job.** A dot or handle near the
cursor is how Notion exposes *block* actions (insert, turn-into) — things you do with **no selection**.
That is precisely where our homeless tools live. So it is not an alternative to the selection
trigger; it is the answer to §4. Recommend deferring it to phase 2 rather than shipping two new
affordances at once.

### Discoverability — the one real risk of going contextual

A student who never highlights anything never sees a formatting control. Mitigations, cheapest first:
- **Nothing is lost that was reachable.** Keyboard shortcuts (Cmd/Ctrl+B/I/U) keep working and are
  what most formatting actually uses.
- **First-run only:** the first time a student opens a canvas, one quiet inline line under the
  document title: *"Select any text to format it."* Dismissed permanently on first selection. No
  modal, no tooltip tour.
- ⚠️ Do NOT add a persistent hint. That re-creates the chrome we are deleting.

---

## 4. WHERE THE HOMELESS CONTROLS GO

The rule: **selection-scoped → contextual toolbar. Needed with nothing selected → the rail.**
Anything needed with no selection cannot live behind a selection, or it becomes unreachable at
exactly the moment it is wanted (root `CLAUDE.md §4d` liveness).

| control | home | why |
|---|---|---|
| bold · italic · underline · strike · highlight · H2 · H3 · ¶ · blockquote · checklist · rule | **document contextual toolbar** — the CAROUSEL | all act on a selection or its block |
| **comment** | **document toolbar — PINNED** (Neil, 2026-08-07) | *"I would definitely want to use the comments quite a lot"* — pinned outside the carousel, label visible, never scrolls away |
| **dictation** | **document toolbar — PINNED**, beside comment (Neil, 2026-08-07: *"the microphone definitely belongs in the contextual toolbar next to the comment button… definitely not in the rail"*) | ⚠️ **AND ALSO listed inside the `+` strip** — see the note below; this is not optional |
| **text size ± ** | inside the `+` strip | a comfort setting fixed before writing, not mid-selection |
| **export / download** | inside the `+` strip | document-scoped, rare |
| **fullscreen** | **SPL header** (LearnDash lane) — ⚠️ **but STAYS in the `+` strip until that lane actually ships it** | Neil's call, agreed — it is page chrome, not document chrome. **Deleting it on the strength of another lane's unshipped work makes fullscreen unreachable in the meantime.** Remove it here only after the SPL button is live, verified on the page — not on the handoff being filed. |
| **theme toggle** | **`+` strip**, under exactly today's conditions | ⚠️ **MISSING FROM THE FIRST DRAFT OF THIS TABLE — measured 2026-08-07.** `:26082` hides it when embedded (SPL owns it there, so deleting costs nothing) — **but `:26147` RE-SHOWS it on entering fullscreen** (`goingFs ? '' : 'none'`), and fullscreen is precisely where LD's own toggle is hidden. It is also the only theme control in standalone mode. Deleting the header without rehoming it resurrects **FIXLIST #183** (Neil: *"in full screen the theme toggle doesn't work… it's kind of frozen"*) in a new costume. It must keep calling `toggleTheme()` and nothing else — `bin/theme-writer-harness.js` gates that. |
| **clear chat** | **rail overflow, chat panel** | see the warning below |
| **undo · redo** | **keyboard only** | Cmd+Z / Cmd+Shift+Z already work; a button for a universal shortcut is furniture |
| **save** | **DELETE the button** | an autosave status indicator already sits beside it. A manual save button next to an autosave teaches students the save might not have happened |
| context badges — all EIGHT kinds | ⭐ **SUPERSEDED BY §4d (Neil, ruled 2026-08-07): Tier A deleted · Tier B to the sidebar `LESSON` cell · Tier C tutor pill pinned to the sidebar header.** The "top of the document column" answer in this row was written before he ruled and is **WRONG** — an inline strip above the document scrolls away exactly when a long piece is being written, and he rejected it. | and one of them is a `<button>`, not metadata — see §4d |
| step title | **DELETE** | already in the LD breadcrumb and the sidebar — a third copy |

### ⭐⭐ 4a. THE MICROPHONE IS PINNED **AND** IN THE `+` — both, by construction

Neil pinned dictation to the document toolbar. **The toolbar only exists while text is selected**, and
a student starting to dictate has selected nothing — that is the definition of the act. So the pin
alone makes dictation unreachable from a blank or unselected document, which is the `CLAUDE.md §4d`
liveness failure in its purest form: a control that exists only in a state the user is not in.

**Therefore: the microphone appears in BOTH places, and this is a requirement, not a nicety.**
- **Pinned in the document toolbar** (Neil's ruling) — for when text is selected.
- **Listed inside the `+` strip** — the only route with nothing selected.

Same action, one handler, reachable from whichever state the student is actually in. **If a later
change removes it from the `+`, dictation becomes unreachable from a blank document** — gate this.

### 4c. THE CHAT SELECTION TOOLBAR IS UNCHANGED THIS CYCLE

Neil, 2026-08-07: *"the contextual toolbar in the chat should probably just remain as it is. So no
change to the contextual toolbar in the chat."* Reply · Insert into Doc · Copy · Note stay exactly as
they ship, flat and labelled, no pin, no carousel.

⚠️ **Consequence for scope:** the "one component, two content sets" consolidation in §2 is therefore
**deferred**. This cycle BUILDS the document-side toolbar as a new component and LEAVES both chat
copies alone. They bind to `chatMessages` mouseup and the new one binds to the document, so they
cannot collide. **The chat-side de-duplication stays queued as FIXLIST #275** — do not fold it in
opportunistically, because touching the chat toolbar is exactly what Neil ruled out.

⚠️ **CLEAR CHAT IS DESTRUCTIVE AND MUST NOT SIMPLY MOVE.** Rare + destructive = behind an overflow,
never on permanent display — but it needs a confirm before it is relocated anywhere quieter.
**Gate: verify it has one; if not, add it in the same change** (root `CLAUDE.md §0d` — never ship a
known-fragile change, and destructive-without-confirm is a named pitfall).

⭐ **The rail already exists** (`_wireRailPanel`, four panels, float/dock/grip-drag/resize all
shared). Reuse it. Do not invent a floating cluster — that is a new surface to maintain and the
reuse-before-build gate (`CLAUDE.md §14c Gate 0`) says grep for the existing component first.

### ⭐⭐ 4b. THE ICON STRIP COLLAPSES BEHIND A `+` — RULED (Neil, 2026-08-07)

Neil, seeing all three built: *"the icon strip, everything behind the plus icon."* He heard the
objection below and chose anyway; **this is settled, do not re-litigate it.**

**The rule (refined 2026-08-07):** at rest the strip shows **the Outline button, then the `+`** —
outline stays permanently visible because it is what students navigate the document with. Pressing
the `+` reveals the rest (dictate, resources, writer's profile, progress, notes, text size, download,
find). The `+` rotates 45° to a close affordance while open.

⛔ **The microphone is NOT a permanent strip button** (Neil reversed an earlier draft that made it
one: *"definitely not in the rail, that's in the wrong place there"*). It is pinned in the document
toolbar and listed inside the `+` — see §4a.

**⭐ THE STICKINESS IS LOAD-BEARING, NOT A NICETY — it is what pays off the objection.** The cost
named at design time was real: hiding navigation behind a toggle taxes every use, and the panels
here (outline, resources, profile) are opened *while* writing, not once. **The strip therefore
REMEMBERS its open/closed state and restores it on every canvas open** — across steps, across
sessions, until the student closes it themselves. The extra click is then paid ONCE, ever, not per
use, and a student who never opens it keeps the calm default. **If the persistence is dropped or
regresses, the objection comes straight back** — so it ships in the same change, never as a
follow-up.

**Persistence discipline** (the theme-toggle lesson, `CLAUDE.md §5d` + `reference_wml_theme_toggle_one_store_one_writer`):
ONE key, ONE writer, read through one helper. Do not add a second store, and do not let a sync path
write it. Default when unset = **closed** (Neil's aesthetic default).

**Also required by `CLAUDE.md §4d` (a refusal is half a change):** while collapsed, the `+` must be
the only thing on the strip and must be unmistakably pressable — no state exists where a student
has neither a visible control nor a way to reveal one.

---

### ⭐⭐ 4d. THE CONTEXT BADGES — THREE TIERS, RULED (Neil, 2026-08-07)

**Neil raised the gap in this spec himself:** *"in the top of the header where it has the toolbar,
you also have the badges there. So if we get rid of that header, what are we gonna do with the
badges? I think that's sort of a question that we need to think about."* He was right — §1 above
listed only three badges in passing. **There are eight kinds.** Measured at
`wml-assessment.js:25840-25942`:

| badge | class | when | interactive? |
|---|---|---|---|
| Tutor view pill + "View as student" toggle | `.swml-tutor-view-pill` | `state.reviewMode` | ⭐ **YES — a `<button>`** opening the review-context modal (`:513-532`) |
| Creative Writing Masterclass · `Step N` / `Trial N` | `…-lowpri` / `…-topic` | CW tasks | no |
| board · subject · text | `…-lowpri` ×3 | non-CW | no |
| `Topic N` · `Stage N of M` | `…-topic` / `…-stage` | most / staged CN | no |
| exercise label (e.g. Mastery Codex) | `…-topic` | manifest | no |
| `Phase 1` / `Phase 2` / Preliminary / Free Practice / Exam Practice | `…-phase` | non-CW | no |
| `Diagnostic` / Plan Redraft / Outline Redraft / Polish Redraft / Discuss Feedback | `…-diag` | most | no |
| `Attempt N` | `.swml-ctx-attempt-badge` | guided context only | no |
| `…` overflow + dropdown | `.swml-canvas-ctx-overflow` | **when they collide with the carousel** | yes |

⚠️ **The correction that matters: the tutor-view pill is a CONTROL, not a label.** Deleting the
header deletes a button and a safety signal, not just text. The first read of this spec called the
badges decorative; they are not, uniformly.

### ⭐⭐ THE TWO STRIPS ARE ALTERNATES, NOT DUPLICATES — the gate decides which one runs (Neil's correction, 2026-08-07)

⛔ **AN EARLIER DRAFT OF THIS SECTION CLAIMED THE HEADER STRIP WAS A "STRICT SUBSET" OF THE SIDEBAR
STRIP AND COULD SIMPLY BE DELETED. THAT WAS WRONG, AND NEIL CAUGHT IT IN ONE LINE:** *"remember, for
the diagnostic, there is no sidebar. That's the point."*

**THE MEASURED GATE.** `useTrainingEnv = envType === 'training'` (`wml-assessment.js:28561`), and
`buildTrainingPanels()` — the function that builds `protoPanel` / `.swml-sidebar-badges` — is called
**only** inside `} else if (useTrainingEnv) {` (`:30346`). Meanwhile `:26014` hides the HEADER badges
**only** in training env, with the comment that gives the whole game away: *"Hide context badges for
training-env exercises — **sidebar already shows them**"*.

| environment | WML sidebar | header badges | consequence of deleting the header |
|---|---|---|---|
| **training** — assessment · redraft_assessment · mark_scheme · mark_scheme_unit · planning · exam_question · essay_plan · model_answer · verbal_rehearsal · conceptual_notes · foundational_quiz · memory_practice · cw_si | ✅ built | already hidden | **nothing changes** |
| **free** — `diagnostic` · `outlining` · `response` · `mastery_codex` · `cw_workbook` · `feedback_discussion` · `model_answer_video` | ❌ **none** | **the only copy** | ⚠️ **all WML orientation lost** |

**So they are ALTERNATES selected by environment, and the free-env list is SEVEN tasks, not just the
diagnostic.** (Task→environment map read from `wml-core.js` — `polishing` and `exam_crib` are a third
value, `inline-coaching`.)

⚠️ **TWO SIDEBARS, AND CONFLATING THEM IS WHAT CAUSED THE ERROR.** The sidebar visible in Neil's
Mastery Codex screenshot — course title, COURSE/UNIT/LESSON rings, the lesson list — is the
**LearnDash Focus** sidebar, which is present regardless. WML's own `.swml-canvas-proto` sidebar is a
different element and is absent in that shot. Mastery Codex is `free`, which is *precisely why* its
badges (`ALL · Induction · Mastery Codex · …`) are in the header there. **The header badges appear
exactly when there is no WML sidebar to hold them.** Do not reason about this from a screenshot; read
the environment.

---

### ⭐⭐ 4d-ii. WHAT TO ACTUALLY DO — Neil's two options, and the measurement that separates them (2026-08-07)

**Neil, thinking aloud after the correction, put two options on the table and asked for a view
rather than agreement:**
1. **ETCH THEM INTO THE DOCUMENT** — *"write them as a slightly lighter shade of the document itself
   in dark theme, and a slightly darker shade [in light]… almost like watermarks at the top of the
   document"*, applied **everywhere** (free AND training) for consistency, *"they could be fairly
   light"* even where the sidebar repeats them.
2. **GET RID OF THEM** — *"If we get rid of them, the next option is just to make sure that the
   lessons are really named very well."*

He also named option 1's own defect before anyone else could: *"the problem with etching them into
the top of the document would be you won't see them when you're typing… we don't have pages, so"* a
running per-page badge is not available.

**⭐ THE PRECONDITION IN OPTION 2 IS CHECKABLE, SO IT WAS CHECKED (real prod titles, 2026-08-07):**

| course | lesson titles |
|---|---|
| Creative Writing Masterclass (41165) | `STEP 5: Choose Your Plot Structure` · `STEP 14: Character Archetypes` · `STEP 2: Explore Story Ideas` |
| Macbeth Mastery for AQA (41370) | `3. Write Your Diagnostic Essay` · `4. Polish Your Writing` · `5. Discuss Your Feedback with Your Tutor` · `2. EXAM PREP: Generate an Exam-Style Question` |

**The titles already carry the orientation, and the course name carries the rest.** "Macbeth Mastery
for AQA" is board + text; the unit + lesson title are topic + task; "Diagnostic" vs "Polish" implies
the phase. **All of it sits in the SPL breadcrumb and the LearnDash Focus sidebar, which are
permanent and never scroll** — unlike anything etched at the top of a document. His precondition
holds *today*, without new naming work.

**⭐ THE SPLIT THAT DECIDES IT — ask what each badge ANSWERS:**

| what it answers | badges | verdict |
|---|---|---|
| **"Which lesson am I in?"** — IDENTITY | board · subject · text · `Topic N` · `Phase 1/2` · task/diag label · `Step N`/`Trial N` · `Stage N of M` · course name | **DELETE.** Redundant against a permanent, non-scrolling breadcrumb. Seven of the nine kinds. |
| **"What is true about ME right now that no title can state?"** — STATE | ⭐ **`Attempt N`** · ⭐ **the tutor-view pill** | **KEEP, and NOT as a watermark.** |

**RECOMMENDATION: option 2 (delete), plus keep exactly those two.** Reasoning, stated as
disagreement with option 1 rather than deference (`CLAUDE.md §20`):
- **Etching optimises the wrong eight.** It makes the redundant identity badges prettier while
  leaving them redundant, and it puts them where they vanish under the first paragraph of writing.
- **A watermark structurally cannot carry either survivor.** The tutor-view badge is a `<button>`
  and a safety signal — "you are not the student" must be legible and pressable, never a 6%-opacity
  smudge. And `Attempt N` mutates (`_updateCtxAttemptBadge` rewrites it live), so baking it into
  document chrome makes it a value fossil.
- **Consistency argues for deleting, not for etching.** Etching "everywhere" means the training env
  shows every badge TWICE — once etched, once in the sidebar. Deleting is what actually makes the
  two environments behave the same.

⚠️ **THE TWO SURVIVORS STILL NEED A HOME, and it must not be a new bar.** Both are small, rare and
state-shaped: `Attempt N` belongs beside the existing autosave/status indicator (document state,
already a permanent non-scrolling spot); the tutor-view pill stays a real pill, and in the training
env it is already in the sidebar at `:14042` — free env needs the same pill pinned, never etched,
never behind the `+`. **And the collapsed-sidebar exemption still applies**
(`wml-canvas.css:4443` zeroes `.swml-sidebar-badges` opacity; the tutor pill must survive it).

🟢 **RULED BY NEIL, 2026-08-07 — option 2 + keep exactly two. THE IDENTITY/STATE SPLIT IS THE SPEC.**
Etching is rejected. The eight identity badges are DELETED in **both** environments — that includes
removing them from `protoBadges` in the sidebar, not only from the header, because the argument that
kills them (the breadcrumb already says it, permanently) is environment-independent. What survives,
and all that survives:

| survivor | home | rules |
|---|---|---|
| **`Attempt N`** | beside the existing autosave/status indicator | document state, permanent non-scrolling spot; keep `_updateCtxAttemptBadge` as the ONE writer and re-point it there — it must not write to a detached node |
| **the tutor-view pill** (+ "View as student" toggle) | a real pill, visible whenever `state.reviewMode` | ⛔ never etched · ⛔ never behind the `+` · ⛔ must survive sidebar collapse (`wml-canvas.css:4443` exemption) — it is a safety signal, not decoration |

⭐ **CONSEQUENCE WORTH STATING: `.swml-canvas-ctx`, the whole overflow mechanism
(`.swml-canvas-ctx-overflow` + `.swml-canvas-ctx-dropdown` + `checkCtxOverflow` + its
`ResizeObserver`), and the THREE duplicate phase maps (`PHASE_LABELS` `:14084`, `PHASE_LABELS_SB`
`:14095`, `CANVAS_PHASE_LABELS` `:25882`) all die with this.** The overflow existed only to hide
identity badges that no longer exist. Delete them rather than leaving them inert.
⚠️ **Two consumers query `.swml-canvas-ctx` and must be handled, not left to silently no-op:**
`_updateCtxAttemptBadge` (`:8838`) — re-point to the attempt survivor's new home; and the assessment
transition's badge fade (`:32253-32256`) — its `if (ctxEl)` guard would swallow the change silently,
so remove the dead fade rather than let it read as working.

---

### The evidence that made the wrong claim tempting — kept, because the sidebar strip IS a superset of CONTENT

Where the WML sidebar *does* render, `protoBadges` (`wml-assessment.js:14041-14140`) carries **every
badge the header carries, plus two more**. That part was measured correctly; the error was concluding
the sidebar is always there.

| badge | header `:25840+` | sidebar `:14041+` |
|---|---|---|
| tutor-view pill | `:25843` | ✅ `:14042` |
| Creative Writing Masterclass | `:25846` | ✅ `:14044` |
| `Step N` / `Trial N` | `:25850` | ✅ `:14046-14049` |
| CW project name | — | ✅ `:14055` **(sidebar only)** |
| board · subject · text | `:25855-25863` | ✅ `:14064` |
| `Topic N` | `:25869` | ✅ `:14074` |
| `Phase 1/2` etc. | `:25884` | ✅ `:14095-14098` |
| task / diagnostic label | `:25891-25897` | ✅ `:14091-14094` |
| CN `Stage N of M` | `:25874` | ✅ `:14114` |
| FQ `Stage N of M` | — | ✅ `:14103` **(sidebar only)** |
| `Attempt N` | `:25919` | ✅ `:14118-14120` |

⭐ **The code already said so.** `:14110-14113`: *"The canvas ctxBadges are HIDDEN in training-env,
and CN lessons ARE training-env, so the canvas badge never shows — this sidebar row is the only
visible chip strip."* And **three copies of the same phase map** exist (`PHASE_LABELS` `:14084`,
`PHASE_LABELS_SB` `:14095`, `CANVAS_PHASE_LABELS` `:25882`) — the duplication was already a known
smell nobody had cashed in.

**SO THE BUILD IS: DELETE THE HEADER STRIP. Nothing relocates. Nothing needs a new home.** Tier A
was right for the wrong reason (the duplication is with the *sidebar*, not only the SPL bar); Tier B
needs no new sidebar line, because that line already exists; Tier C is already pinned in the sidebar
at `:14042`. This is the `CLAUDE.md §14c Gate 0` outcome — **reuse before port** — and it removes an
entire component's worth of new code from this cycle.

⚠️ **THE ONE REAL REQUIREMENT THAT SURVIVES, and it is a `§4d` liveness fix:**
`.swml-canvas-proto.collapsed .swml-sidebar-badges { opacity: 0 }` (`wml-canvas.css:4443`) — a
collapsed sidebar hides the badge strip. **Today the header pill is the fallback; delete the header
and a tutor in review mode with a collapsed sidebar has NO indication they are not the student.**
So: **exempt the tutor-view pill from the collapsed rule** and let it render icon-only when
collapsed (`.swml-sidebar-icon-btn` at `:4449` already does exactly this). A student losing
orientation chrome on a deliberate collapse is the intended effect of collapsing; a tutor losing the
safety signal is not.

⚠️ **Small label gap to close in the same change:** the sidebar's `sidebarTaskLabel` (`:14091`) maps
only guided planning/polishing and otherwise falls back to `exerciseConfig.label || 'Assessment'`,
while the header's `diagBadgeLabel` (`:25891`) also covers **`Outline Redraft`**, **`Discuss
Feedback`** and the plain **`Diagnostic`** default. Fold those cases into the sidebar label — do
not leave an outlining lesson reading "Assessment". (This is the `v7.19.718` defect exactly: a
mislabelled task there once hid the Notes tab.)

---

**THE ORIGINAL RULING — kept for the reasoning; superseded in mechanism by the correction above:**

**TIER A — DELETE, genuinely duplicated.** Course name · board · subject · text. The WML sidebar
already renders the course title and COURSE · UNIT n · LESSON n, and the SPL bar above renders
`Unit 1 / 4. WRITING: …`. Three copies of "where am I". ⭐ **Cutting Tier A also deletes the `…`
overflow and its dropdown outright** — the overflow exists *because* of the pills that repeat the
sidebar, so it has nothing left to hide. Two components die for the price of one.

**TIER B — MOVES TO THE SIDEBAR `LESSON` CELL.** `Phase 1/2` · `Diagnostic / Plan Redraft /
Outline Redraft / Polish Redraft / Discuss Feedback` · `Topic N` · `Step N` (CW) · `Stage N of M`
(CN) · `Attempt N`. This is *which pass am I on*, and **nothing outside WML knows it** — the SPL
breadcrumb and the sidebar rings cannot supply it. Rendered as one quiet line beneath the existing
`Complete` status, e.g. `Diagnostic · Phase 1` / `Topic 3 · Attempt 2`. Why the sidebar: it is
already the orientation surface, it never scrolls away, and it puts **zero** chrome back into the
writing area — which is the whole point of the pass.
⛔ **Not behind the `+`.** Orientation you must press to see is orientation you do not have.
⛔ **Not a subtitle above the document** — it would scroll out of view exactly when a long piece is
being written, and it re-introduces a strip in the area being emptied.

**TIER C — TUTOR VIEW PINS TO THE SIDEBAR HEADER, always visible while `reviewMode` is on.** Never
inside the `+`, never conditional on scroll. A tutor must know they are not the student **before**
they type. It costs a student nothing — they never render it. (The chat pane's
`.swml-chat-readonly-note` at `:502` stays as the second, independent signal.)

**Build obligations riding this:**
- ONE producer for the Tier-B line — it reads the same `state` fields the header read
  (`state.phase` · `state.task` · `state.topicNumber` · `state.cnStage` · `state.attempt` ·
  `getCwStepDef`), so the label maps (`CANVAS_PHASE_LABELS`, `diagBadgeLabel`) MOVE, they are not
  re-authored. Re-deriving them is how "Outline Redraft" silently became "Diagnostic" at v7.19.718.
- The attempt badge's live updater `_updateCtxAttemptBadge` currently targets the header node —
  **re-point it, do not leave it writing to a detached element** (a ghost-function silent no-op).
- Tier B must render in **every** canvas task, not just the ones with a topic number — CW has no
  `state.topicNumber` and must still show `Step N`.

---

## 5. THE DOCUMENT CONTEXTUAL TOOLBAR — behaviour spec

- **Trigger:** a non-empty text selection inside `.swml-canvas-content`. Never on typing, never on
  caret-only.
- **Placement:** anchored to the selection, **above** it by default, flipping **below** when the
  selection sits within one toolbar-height of the top of the scroller. It must never cover the
  selected text — that is the whole objection to balloon toolbars, and it is solvable by geometry.
- **Dismiss:** selection collapses · Escape · scroll · click elsewhere. Escape must return focus to
  the editor at the same caret.
- ⭐⭐ **THE CLICK-AWAY RULE — COPY IT EXACTLY OR THE THEME-TOGGLE BLINK COMES BACK.** The existing
  handler (`wml-assessment.js` ~15372, v7.20.433) does NOT dismiss on any outside mousedown. It
  defers one frame and dismisses **only if the selection actually went away**:
  ```js
  if (!toolbar || toolbar.contains(e.target)) return;
  requestAnimationFrame(() => {
      const s = window.getSelection();
      if (!s || s.isCollapsed || !s.toString().trim()) removeToolbar();
  });
  ```
  **Why:** a naive dismiss-on-any-outside-mousedown destroys the toolbar when the student presses
  any other control (the theme toggle), then the mouseup rebuild handler recreates it with the
  selection still intact — two handlers, one click, read as a blink. That cost **three** speculative
  fixes before it was measured (root `CLAUDE.md §19` exists because of it). The new document toolbar
  MUST use this shape from the first line.
- **Anatomy (matched to Neil's reference, 2026-08-07):** `[ pinned actions, labelled ] │ [ carousel ]`.
  The pins sit OUTSIDE the scroller and outside the fade mask, so they can never scroll away.
- **Surface:** the **raised rung** `#333437` — the floating toolbar must read as an object ABOVE the
  page, not a flat strip on it. Derived from the `#1c1d1f` seed in OKLCH; ⛔ `#2b2c2f` and `#313235`
  are RETIRED and lint-blocked, do not reintroduce either. 13px radius, 32px targets, deep shadow.
- **Carousel:** retained (Neil's call). **PORT the existing implementation verbatim** — three cloned
  sets, drag/wheel/momentum, arrows. It is already tuned; do not re-derive it (`CLAUDE.md §13`).
  ⚠️ The end-fades derive from `--swml-tb-fade`, which currently resolves to the HEADER colour. It
  must be repointed at the **floating** surface, or the exact drift bug of v7.20.390 returns in a
  new place — that variable exists precisely so the fades follow their surface by construction.
- **Reduced motion:** `prefers-reduced-motion` removes the entrance transition, not the toolbar.
- **Touch/iPad:** must survive the native selection handles and the iOS callout menu. This is the
  most likely place the build breaks and needs a real device check, not a desktop emulation.

**Chat-side contextual toolbar** keeps Reply · Insert into Doc · Copy · Note, unchanged in
behaviour, but served from the same single component.

---

## 6. LAYOUT CONSEQUENCES

1. **Canvas height: automatic.** `.swml-canvas-content` is `flex: 1` (`wml-canvas.css:409`) inside
   `.swml-canvas { display: flex; height: 100% }` (`:329`). Removing the header lets the document
   absorb the space. No recalculation.
2. ⚠️ **BUT the viewport maths is keyed to the SPL header, hardcoded as `60px` in four places** —
   `wml-canvas.css:141`, `:144`, `:1948`, `:5731`. Our removal does not touch it. **The LearnDash
   lane shrinking the SPL heading/running man DOES**, and the canvas would then overshoot the footer
   by exactly the difference. **Root fix: consume `var(--spl-header-height, 60px)`** instead of the
   literal, so it tracks whatever LD sets. Confirm the theme actually publishes that variable before
   relying on it.
3. **The alignment datum changes.** Rail buttons, document and the first chat bubble currently align
   to the header's bottom edge. With the header gone they need a new shared reference line —
   decide it once, publish it as a variable, and have all three consume it rather than each carrying
   its own top offset.

---

## 7. SCOPE, AND WHAT IS EXPLICITLY NOT IN IT

**In:** delete both headers + logo · build the document contextual toolbar · dedupe the chat one
(#275) · rehome dictation/text-size/export/clear-chat to the rail · delete save + undo/redo buttons ·
move context badges inline · first-run hint.

**Out, and handed off, not done here:**
- **SPL header sizing + the fullscreen button + publishing `--spl-header-height`** → LearnDash lane.
  Written as a handoff by WML chat A, not carried by Neil.
- **The cursor/block affordance** (Notion-style handle for no-selection block actions) → phase 2.

**Verification before it ships:** the full staging matrix in `WML-SMOKE-TEST.md` —
`{P1,P2}×{diagnostic,redraft}×topic` + CW steps + boot/SPA-nav — because this touches every canvas
task, plus a real iPad selection check.

---

## 8. RULED BY NEIL, 2026-08-07 — nothing open

| question | ruling |
|---|---|
| Both headers removed | **YES** — canvas header and chat header both gone |
| Icon strip | **Everything behind the `+`** (§4b), sticky open/closed state |
| Contextual toolbar | **Minimal, with the carousel scrolling retained** |
| Text size / dictate / download | inside the `+` strip, alongside the panels |
| First run | **Show it silently** — the toolbar demonstrates itself once, no text, no dismiss |

**Prototype (the visual reference for the build):**
`https://claude.ai/code/artifact/8587d0b2-e8ca-4948-bd75-7a37a7ed1da5`

⚠️ **The prototype is desktop mouse-selection only.** The riskiest part of this build is iPad, where
the native selection handles and the iOS callout menu fight a custom toolbar. **Verify on a real
device before shipping** — an emulator will pass and the device will not.
