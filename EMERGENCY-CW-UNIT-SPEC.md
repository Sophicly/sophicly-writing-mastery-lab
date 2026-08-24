# EMERGENCY CREATIVE-WRITING UNIT — SPEC (Neil ruled 2026-08-23, revised 2026-08-24)

**Purpose:** a short unit taking a subset of the 30-step CW project so a student can
*"get a story on the board ASAP."* Rulings recorded in `PEDAGOGY.md` §34 — read that first.

**Status:** SPEC ONLY. Nothing built. Engine lane owns every build item below (content lane:
no version bump, no deploy, no `.js` edits — WML CLAUDE.md §PARALLEL LANES). ⭐ When built,
everything hands back to the **engine lane** to merge and push (Neil, 2026-08-23).

---

## 1 · THE GOVERNING RULE — the emergency unit has NO PLOT OUTLINE

Neil, 2026-08-24: *"we're not having a plot… the students basically just need to focus on
developing the story."* Measured against the protocols, he is right, and it resolves cleanly:

**The full project has TWO story artefacts. The emergency unit keeps only the light one.**

| artefact | built by | cost | in the unit? |
|---|---|---|---|
| **Story spine** — six causally-linked beats, the student's own words | Step 4 | one lesson | ✅ **this is the unit's story plan** |
| **Plot outline** — six-stage archetype template, every askable beat | Step 6 | **~100 questions** (`CW-STEP-06:3`) | ⛔ dropped |

Step 6's own file opens: *"This step asks the student around 100 questions — every askable beat
of their chosen archetype's six-stage template."* That is the single biggest cost in the unit and
the opposite of *ASAP*. Dropping it also removes the object every plot-UPDATE step exists to
annotate, so **Steps 6, 8, 12 and 15 all go together** — one rule, not four judgements:

> ⭐ **Keep the PROFILE/BUILDER lessons. Drop every PLOT-OUTLINE lesson.**

Step 12 is therefore **out** (Neil, 2026-08-24 — reversing the 08-23 "keep 12, renumbered"
ruling once the plot outline itself went). Nothing is lost from the drafting cycle: Step 12 only
annotates the outline (`CW-STEP-12:129-137` reads `plot_outline` + `character_profile`, writes
`plot_outline` v3, **never touches the draft**). The character-arc layer Draft 2 actually
integrates comes from **Step 11**, which stays.

---

## 2 · THE UNIT — 14 lessons, own numbering, sources untouched

⭐ Unit lessons carry their OWN 1–14 numbers on every student surface. Source-step provenance
lives here only (Neil: *"it wouldn't even be called step 10 anyway"*).

| # | source | what the student ends with |
|---|---|---|
| 1 | CW Step 1 — Writer's Profile | their passions/conflicts/scenarios + 3 seed loglines |
| 2 | CW Step 2 — Explore Story Ideas | 1–3 rough ideas, one ticked |
| 3 | CW Step 3 — Logline | 7 story components + 3 loglines they wrote, one chosen |
| 4 | CW Step 4 — Story Spine | **six causally-linked beats + a dramatic throughline — the story plan** |
| 5 | CW Step 5 — Plot Structure | chosen archetype, why it fits, intended emotion + theme |
| 6 | CW Step 9 — Scene Selection | the beat to dramatise, POV, tense, **7-element scene outline** |
| 7 | **NEW — Guided Draft 1** (Step 10 variant, §3) | Draft 1, all 7 elements as prose |
| 8 | Trial 1 — Story Coherence | self-mark + Sophia's mark on the 7 taught elements |
| 9 | CW Step 11 — Character Profile | external goal · internal goal · need · stakes · arc type |
| 10 | CW Step 13 — Draft 2 | Draft 2 — character arc layered into the same scene |
| 11 | Trial 2 — Character Depth | " |
| 12 | CW Step 14 — Character Archetypes | archetype at beginning / middle / end + physical tells |
| 13 | CW Step 16 — Draft 3 | Draft 3 — archetypal identity layered on |
| 14 | Trial 3 — Archetype Coherence | " |

**Dropped:** 6 · 7 · 8 · 12 · 15 and everything past 16.
**The spine of it:** plan a story (1–5) → choose one moment of it (6) → write that moment three
times, each pass adding one layer, each pass marked (7–14).

---

## 3 · THE GUIDED DRAFT-1 LESSON (unit lesson 7)

Neil: *"do not change the current step 10, but we'd maybe duplicate it, or whatever you think is
the best solution… and then just add a contextual chat, like a polishing lesson basically."*
Confirmed 2026-08-23: he thinks of it as **a VARIATION of Step 10**.

- **Full-project Step 10 is UNTOUCHED.** #366 (test, no walk, `tools:'minimal'`) still governs it.
- **Mechanism: VARIANT, not a copied file.** ONE protocol source; the unit context switches on
  the differences (contextual chat enabled, board word target injected). Never a duplicated
  protocol text — two copies of the same teaching drift (root CLAUDE.md §7).
- Delivers **guidance + contextual chat** — the polishing-lesson shape (student writes in the
  document, Sophia contextual chat alongside), NOT a full ask-by-ask walk. Help ladder applies
  (CLAUDE.md §4c.9): criteria + examples free, Sophia last.

## 4 · BOARD-KEYED WORD-TARGET MAP

ONE map, single source, engine injects the student's board's target into the draft lessons.
Never a per-board copy of protocol text; never a board's number hardcoded in shared files again.

| board | Draft 1 | Draft 2 | Draft 3 | basis |
|---|---|---|---|---|
| cambridge-igcse | **350–450** | **350–450** | **350–450** | P2 Section B instruction, all 40 past papers |
| aqa / edexcel GCSE (current default) | 450–600 | ~700 | 650–750 | current protocol ladder — unchanged until those lanes rule |

Current hardcoded sites (`protocols/shared/creative-writing/`, found 2026-08-23):
`CW-STEP-09-scene-selection.md:55,97,306` · `CW-STEP-10-draft-1-prose-style.md:10,67,79,83` ·
`CW-STEP-13-draft-2-character-arc.md:19` · `CW-STEP-16:10,73`. Engine decides mechanism
(router-injected token, or preamble line); shared text then says "your exam's target:
{resolved}". ⚠️ Drafts are cumulative (Draft 3 starts as a copy of Draft 2), so a board's three
targets must be consistent as a set.

⚠️ **Assessments** (Neil: *"we just need to think about how the assessments play out"*): trials
mark the seven TAUGHT elements (0–4 each, PEDAGOGY §33) — length-agnostic by design, so a
350–450 Cambridge draft marks on the same criteria as a 650-word AQA one. But any
trial/assessment surface that MENTIONS a word count must resolve it from this same map.

## 5 · ⚠️ THE NAMED FAILURE MODE — `plot_outline` is absent, and five lessons auto-load it

**This is the one thing that will break the unit if it is not engineered out in the same change**
(root CLAUDE.md §11 — a named failure mode never ships). With Step 6 gone, `plot_outline` is
never written, yet these lessons all declare it as an auto-load:

| lesson | declares | must degrade to |
|---|---|---|
| 6 (Step 9) | `plot_outline` (6) — **opens by showing the six stages and asking which to write** | `story_spine` (Step 4's six beats) |
| 9 (Step 11) | `plot_outline` (6) | `story_spine` |
| 10 (Step 13) | `plot_outline` *"updated in Step 12"* (`CW-STEP-13:342`) | `story_spine` |
| 12 (Step 14) | `plot_outline` *"with goals/needs from Step 12"* (`CW-STEP-14:152-154`) | `story_spine` |
| 13 (Step 16) | `plot_outline` **and** `plot_outline_archetypes` from Step 15 | `story_spine` |

**Requirement:** in the emergency-unit context, the resolver serves the **story spine** wherever
the full project serves the plot outline, and says so in plain words to the student. It must
never hand a lesson an empty artefact and never name Step 12/15 in text a unit student sees.
⭐ Lesson 6 is the load-bearing one — its first move is choosing which beat to dramatise, so if
the degrade is wrong the student is asked to pick from nothing (§4d liveness).

## 6 · ENGINE-LANE BUILD ITEMS

1. Unit shell — 14 lessons, own numbering (course mapping with the LearnDash lane; the Cambridge
   course shell does not exist yet on either env — MEDIUM, not rushed).
2. Guided Draft-1 lesson — Step-10 variant switch + contextual chat.
3. Board→word-target map + injection; strip the hardcoded numbers listed in §4.
4. **The `plot_outline` → `story_spine` degrade of §5** — five lessons, one resolver.
5. Trials 1–3 placement (after Draft 1 / 2 / 3 — matches the shipped trial slices).
6. No "Step N" leaks on any unit surface (root §5c-ii(a) — no insider words).

## 7 · GATES

- **Key-match trace** (CLAUDE.md §5d) on every auto-load in §5 — the variant lesson must read
  and write the SAME keys Step 10 does, or Trial 1 assesses nothing.
- **Walk sim** for the guided lesson and for lesson 6 with `plot_outline` deliberately absent —
  liveness is auto-checked, and this is exactly the "asked to pick from nothing" case.
- **Grep gate:** no `450-600|650-750|700 words` literal left in shared CW protocol text.
- **Grep gate:** no `Step 6|Step 12|Step 15|plot outline` in any unit-context student string.
