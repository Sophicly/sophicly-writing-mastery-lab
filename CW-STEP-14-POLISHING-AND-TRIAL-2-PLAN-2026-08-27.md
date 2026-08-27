# Step 14 as a polishing environment · Trial 2 — build plan (2026-08-27)

**Status:** plan, not built. Written before code per CLAUDE.md §16.
**Neil's ruling this session:** Step 14 drops its teaching walk and becomes a pure polishing
environment. Steps 11–13 already teach the character arc; Step 14 is where the student *applies* it
to Draft 1.

---

## PART A — STEP 14: THE POLISHING ENVIRONMENT

### A1 · What the reference actually does (read, not assumed)

The environment Neil described — *"they select the writing that they want to edit, and then they get
a contextual chat"* — is **not** the `protocol-c-polishing.md` markdown. That file is a pre-hardening
LLM script that asks the student to paste their whole essay and type letter commands; it breaks the
paste-wall law (WML §3) and the serial law (root §18). **The environment is the engine.**

| layer | file | what it does |
|---|---|---|
| entry | `wml-assessment.js` selection toolbar | student selects text → toolbar (Comment / Copy / Note / **Sophia**) |
| box | `frontend/wml-selection-chip.js` (1391 lines) | `openBox()` → selection echo + textarea + mic + send + scope-filtered quick actions; drag / resize / snap-back / auto-follow |
| panel | `buildInlineCoachingPanels()` (`wml-assessment.js:30838`) | doc + right-hand Sophia panel, persistent thread |
| switch | `exerciseConfig.environment === 'inline-coaching'` (`wml-assessment.js:35029`) | the whole branch is config-driven |
| pedagogy | `protocols/shared/modules/inline-coaching-core.md` + `inline-coaching-engine-1.md` | Socratic-only; Sophia never grades and never writes for the student |

**Two tasks use it today:** `exam_crib` and `polishing` (`wml-core.js:1557`, `:1795`).

### A2 · The quick-action ladder already has a CW group

`ACTION_MAP` (`wml-selection-chip.js:50`) is a 7-tier polish ladder. It already ships:

```js
cw: ['check-sensory-variety', 'check-scene-structure-beats', 'check-show-dont-tell'],
```

plus `polishProse` (strengthen vocabulary · tighten · adjust tone), `fixSpag`, `reference`
(explain · compare gold-standard) and `elementPolish` (strengthen hook · rephrase). Most of what
Step 14 needs is therefore **already built** — the gap is routing, not vocabulary.

### A3 · The switch itself is small, and there is a precedent

Step 10 already overrides its environment per-step, and the resolver honours it:

```js
// wml-core.js:1104
{ step: 10, label: 'Draft 1: Prose Style', tier: 'si', phase: 'drafting', draft: 1, env: 'diagnostic', tools: 'minimal' },
// wml-core.js getExerciseConfig(): "`env` wins over `tier` … Capability first, never a literal" (v7.20.507)
```

So Step 14 takes the same route: `env: 'polishing'` on its row + a `cw_polishing` base config.

| | Step 14 now | after |
|---|---|---|
| base | `cw_si` | new `cw_polishing` |
| environment | `training` | `inline-coaching` |
| panels | sidebar ✓ **chat ✓** doc ✓ | sidebar ✓ **chat ✗** doc ✓ |
| entry | chat greets, walks sub-steps | student selects text → Sophia |
| protocol | `CW-STEP-14-draft-2-character-arc.md` (the walk) | coaching core + engine + **a CW rubric that does not yet exist** |
| notes tab / rail | on (not tools-minimal) | **unchanged — must stay on** |

### A4 · ⛔ The two things that make this a build, not a config flip

1. **The router's inline-coaching assembly is gated on `$task === 'exam_crib'`**
   (`class-protocol-router.php:1965`). Its sibling branch at `:3459` injects
   `coaching-pedagogy-shared.md` for polishing. Neither fires for `cw_step_14`. The router needs a
   branch that recognises a CW polishing step and loads
   `inline-coaching-core.md` + `inline-coaching-engine-1.md` + `rubric-base.md` + a CW rubric.
2. **There is no CW rubric.** `protocols/shared/modules/rubrics/` holds nine files, all AQA Lit,
   Edexcel IGCSE Lang or non-fiction. A `rubric-cw-narrative.md` must be authored — and per root
   §5c it is **derived from the CW protocols we already teach** (Step 10 prose style: concrete
   nouns, dynamic verbs, strategic technique; Steps 11–13 goals / needs / stakes / arc type), never
   from general GCSE knowledge.

### A5 · Sequence, with a verify point per layer

| # | layer | change | verified by |
|---|---|---|---|
| 1 | config | `env: 'polishing'` on the Step 14 row; add `cw_polishing` to the manifest | `getExerciseConfig('cw_step_14').environment === 'inline-coaching'` |
| 2 | rubric | author `rubric-cw-narrative.md` from the Step 10/11–14 protocols | quotations checked against the protocol files |
| 3 | router | CW polishing branch loads core + engine + base + CW rubric | dump the assembled protocol for `cw_step_14`, confirm the four parts and no walk |
| 4 | chip scope | confirm the `cw` action group is selected for this task and the Lit-only tier scans are not | open the box on a CW doc, list the rendered chips |
| 5 | rail | confirm notes tab + rail + Resources survive the env flip | on staging, at iPad landscape width |

⚠️ **Step 5 is the real risk.** The rail is built in `renderCanvasWorkspace()` *before* the env
branch, so it should survive — but no CW lesson has ever run `inline-coaching`, so that combination
is unproven. It is checked on staging before Neil sees it, never handed to him as "test and see"
(root §0d).

### A6 · Neil's open question, answered but not ruled

*"do you think that's gonna make too many API calls?"* — **No, and the polishing env is cheaper than
the walk it replaces.** Prompt caching is live (protocol at ~0.1× after the first call), so turn
count is not the expensive axis. The current Step 14 walk calls the API on **every** turn. In the
polishing env the API is called **only** when the student actually asks Sophia about a selection —
the chips, the panels and the document are code-served. The help ladder (§4c.9) keeps Sophia as the
last rung. **This is a recommendation; he has not ruled on it.**

---

## PART B — TRIAL 2: CHARACTER DEPTH

### B1 · It is not undecided — that claim in the previous handoff is wrong

Already ruled, and the search that proves it (PEDAGOGY.md §0 procedure):

- **PEDAGOGY.md §33** — a trial is a focused diagnostic on its own dimension; trials do not re-mark
  one another; trials feed the grade ring ("definitely"); the student self-assesses on the examiner
  ladder and Sophia marks, both judgments stored.
- **PEDAGOGY.md:946** — *"Step 12 Draft 2 (character arc) → **Trial 2 character depth**"*.
- **`CW-TRIALS-AND-SELF-ASSESSMENT-PLAN-2026-08-21.md:29`** — Draft 2 → Trial 2 Character Depth.
- **`wml-core.js:1119`** — the CW_STEPS row exists; the LD lesson exists on prod (#56358).

**What is actually missing is the port, not the decision.**

### B2 · What exists vs what shipped for Trial 1

| | Trial 1 (shipped .551) | Trial 2 |
|---|---|---|
| protocol | 86 lines — "⛔ YOU DO NOT RUN THIS LESSON", JOB 1 stuck-student, JOB 2 marking turn, marker contract | **22-line stub**, 1-to-5 scoring, no marker contract |
| document | `_cwTrial1AboutHTML` · `_cwTrial1JudgementBlock` · `_cwTrial1SophiaBlock` · `_cwTrial1TargetBlock` | falls through to a generic placeholder: *"Sophia will analyse your writing"* |
| walk | code-served: 7 elements × 2-level ladder, self-mark then Sophia | none |
| markers | `@TRIAL_VERDICT` / `@TRIAL_EXAMPLE` / `@TRIAL_STRENGTH` / `@TRIAL_PRIORITY`, parsed at `wml-assessment.js:29532` | none |

The stub's four invented criteria (Goals & Needs / Internal Conflict / Character Voice / Growth
Signals) and its 1-to-5 scale **must not be used** — they predate the rulings and contradict the
ladder. They are replaced, not ported.

### B3 · The element set derives; it is not a question for Neil

PEDAGOGY §3b: *the scaffold demands exactly what the protocol teaches.* Trial 2 checks Steps 11–14,
so the elements come from those protocols — the Character Profile's goal / need / stakes / arc type,
and Step 14's requirement that each becomes visible in the prose rather than told. Drafted element
set, to be checked line-by-line against the protocols before use:

1. Goal made visible · 2. Flaw / lack made visible · 3. Stakes made visible · 4. Need emerging at
the turning point · 5. Arc proving itself at the end · 6. Shown not told (action, dialogue, body
language, subtext) · 7. Consistency with the Step 11 profile · + technical accuracy (out of 2, as
Trial 1).

### B4 · The build is a GENERALISATION, not a clone

PEDAGOGY §33 says the Trial 1 shape *"carries to Trials 2–6"*. Trial 1's four document blocks and
its walk are currently bespoke to Trial 1 (`if (stepDef.trial === 1)`, `wml-assessment.js:51392`).
Cloning them five times is how six ladders drift apart. The work is to lift Trial 1's implementation
to a **dimension-driven spec** — element list, per-element ladder, About text — with Trial 1's
values as the first entry and Trial 2's as the second. The existing `cw-trial1-sim` (442 assertions)
becomes the regression anchor for the generalisation.

---

## SCOPE, AND WHAT IS ALREADY DONE

| item | state |
|---|---|
| Step 13 keeps its notes tab / rail / Resources | ✅ **shipped v7.20.576, on staging** |
| Step 14 → polishing environment | plan above; Part A5 steps 1–5 |
| `rubric-cw-narrative.md` | to author, derived from the CW protocols |
| Trial 2 | generalise Trial 1, then author the protocol to the Trial 1 shape |
| Trials 3–6 | ride the same generalisation, after Trial 2 proves it |

**Not in scope, still owed to other lanes:** the cutover time (2026-08-27T09:34 UTC) to
student-data; `cw-steps.php` mirror is two renumbers stale.
