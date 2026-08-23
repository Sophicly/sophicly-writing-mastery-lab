# EMERGENCY CREATIVE-WRITING UNIT — SPEC (Neil ruled 2026-08-23)

**Purpose:** a short unit taking a subset of the 30-step CW project so a student can
*"get a story on the board ASAP."* Rulings recorded in `PEDAGOGY.md` §34 — read that first.
Dependency analysis: the 2026-08-22 Cambridge START-HERE handoff §3.1.

**Status:** SPEC ONLY. Nothing built. Engine lane owns every build item below (content lane:
no version bump, no deploy, no `.js` edits — WML CLAUDE.md §PARALLEL LANES).

---

## 1 · THE UNIT — 16 lessons, own numbering, sources untouched

⭐ Unit lessons carry their OWN 1–16 numbers on every student surface. Source-step provenance
lives here only (Neil: *"it wouldn't even be called step 10 anyway"*).

| unit lesson | source | why it survives |
|---|---|---|
| 1 | CW Step 1 — Writer's Profile | `writer_profile` auto-loaded by 9, 10, 13 |
| 2 | CW Step 2 | Neil's inclusion |
| 3 | CW Step 3 — Logline | `chosen_logline`, `story_components` → 9 |
| 4 | CW Step 4 — Story Spine | `story_spine` → 9 |
| 5 | CW Step 5 — Plot Structure | `primary_archetype` → 9 |
| 6 | CW Step 6 — Plot Outline | `plot_outline` CREATED here → 9 |
| 7 | CW Step 9 — Scene Selection | opens by showing the six stages from 6 |
| 8 | **NEW — Guided Draft 1** (duplicate of Step 10, see §2) | Neil's ruling 1 |
| 9 | Trial 1 | assesses Draft 1 |
| 10 | CW Step 11 | Neil's inclusion |
| 11 | CW Step 12 — plot update (character goals) | the ONE update kept (ruling 3) |
| 12 | CW Step 13 — Draft 2 | loads outline updated in 12 |
| 13 | Trial 2 | assesses Draft 2 |
| 14 | CW Step 14 — archetype builder | `archetype_*` required by 16 |
| 15 | CW Step 16 — Draft 3 | final draft |
| 16 | Trial 3 | assesses Draft 3 |

**Dropped:** 7 · 8 · 15 (plot-UPDATE steps — 8/15 only update the outline 6 creates) and
everything past 16. Rule: **skip the updates, keep the builders.**

## 2 · THE GUIDED DRAFT-1 LESSON (unit lesson 8)

Neil, verbatim: *"do not change the current step 10, but we'd maybe duplicate it… and then just
add a contextual chat, like a polishing lesson basically."*

- **Full-project Step 10 is UNTOUCHED.** #366 (test, no walk, `tools:'minimal'`) still governs it.
- The unit lesson is a **duplicate** with **guidance + contextual chat** — the polishing-lesson
  shape (student writes in the document, Sophia contextual chat alongside), NOT a full
  ask-by-ask walk. Help ladder applies (CLAUDE.md §4c.9): criteria + examples free, Sophia last.
- Reuses Step 10's auto-loads (`plot_outline`, `writer_profile`, scene selection from lesson 7)
  and its 7-element scene shape.
- Word target from the board map (§3), never hardcoded.

## 3 · BOARD-KEYED WORD-TARGET MAP (ruling 2)

ONE map, single source, engine injects the student's board's target into the draft lessons.
Never a per-board copy of protocol text; never a board's number hardcoded in shared files again.

| board | Draft 1 | Draft 2 | Draft 3 | basis |
|---|---|---|---|---|
| cambridge-igcse | **350–450** | **350–450** | **350–450** | P2 Section B instruction, all 40 past papers |
| aqa / edexcel GCSE (current default) | 450–600 | ~700 | 650–750 | current protocol ladder — unchanged until those lanes rule |

Current hardcoded sites (all in `protocols/shared/creative-writing/`, found 2026-08-23):
`CW-STEP-09-scene-selection.md:55,97,306` · `CW-STEP-10-draft-1-prose-style.md:10,67,79,83` ·
`CW-STEP-13-draft-2-character-arc.md:19` · Step 16 (650–750). Engine decides mechanism
(router-injected token à la live-value resolvers, or preamble line); shared text then says
"your exam's target: {resolved}". ⚠️ Drafts are cumulative (Draft 3 starts as a copy of
Draft 2), so a board's three targets must be consistent as a set.

## 4 · ENGINE-LANE BUILD ITEMS

1. Unit shell: 16 lessons, own numbering (bridge/course mapping — with LearnDash lane for the
   Cambridge course shell, which does not exist yet on either env).
2. Guided Draft-1 lesson: duplicate Step 10 protocol + contextual chat, polishing shape.
3. Board→word-target map + injection mechanism; strip hardcoded numbers from shared CW text.
4. Trials 1–3 placement per the map above (trials already shipped — slice 4/5 work).
5. Renumbering surface check: no "Step 10/12/16" leaks on any unit student surface
   (root CLAUDE.md §5c-ii(a): no insider words).

## 5 · GATES

- Key-match trace (CLAUDE.md §5d) on every auto-load the unit relies on — the duplicated
  draft lesson must read/write the SAME keys Step 10 does, or Trial 1 assesses nothing.
- Walk sim for the guided lesson (liveness auto-checked).
- Grep gate: no `450-600|650-750|700 words` left in shared CW protocol text after §3 lands.
