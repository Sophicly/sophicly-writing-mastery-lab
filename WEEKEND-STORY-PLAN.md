# THE WEEKEND STORY — end-to-end build plan

**Ruled:** Neil, 2026-10-07 (PEDAGOGY §55): *"Seven lessons plus the adapting lesson (about 3 to 5 hours)"*, every
board's creative question. **Built on:** the Emergency unit (PEDAGOGY §34, `EMERGENCY-CW-UNIT-SPEC.md`).
**Research:** `~/.claude/handoffs/open/wml-CW-EXAM-STORY-FACTS-2026-10-07.md` (every claim cited there).
**Status:** PLAN — nothing built. Root §16: this plan is agreed before code; build in the order of §4.

## 1 · The eight lessons (own numbering on every student screen; sources live here only)

| # | source | the student ends with | EST active |
|---|---|---|---|
| 1 | CW Step 1 — Writer's Profile | passions · conflicts · situations · 3 seed loglines | 20–40 min |
| 2 | CW Step 2 — Story Ideas | 1–3 ideas, one chosen | 5–20 min |
| 3 | CW Step 3 — Logline | 7 story components + a chosen logline | 15–30 min |
| 4 | CW Step 4 — Story Spine | six causally linked beats + a dramatic throughline — **the story plan** | 15–30 min |
| 5 | CW Step 9 — Scene Selection (unit variant) | the moment to write, as a 7-element scene plan, picked from the SPINE | 30–55 min |
| 6 | NEW — Guided Draft 1 (Step-10 variant) | Draft 1, every element as prose, at the board's word target | 15–40 min |
| 7 | Trial 1 — Story Coherence | self-mark + Sophia's mark on the 7 taught elements (/30) | ~20 min |
| 8 | **NEW — Adapt it to the question** | the story rewritten, timed, to a real prompt from the student's own board | 45–75 min |

Total ≈ 3–5 h (EST — no time-on-task exists; measure on the first students).

## 2 · Lesson 8 — adapting the prepared story (the only new teaching)

**Why it exists:** PEDAGOGY §41 — students prepare a whole story and adapt it on the day; nothing in the course
practised that. AQA 2026: AO5 capped at 12 if the task's focus is not addressed (`AQA-8700-1-SMS-2026.pdf`).

**Shape (serial, CLAUDE.md §4c; code-served except the one judgement turn):**
1. Orientation chunk — "stories are malleable" (§41 in plain words), what the examiner checks (the focus cap).
2. **Prompt-shape drills, ONE at a time**, only the shapes the student's board actually sets (facts file §4, from each
   board's own papers):

| board | shapes to drill | time / words |
|---|---|---|
| AQA P1 Q5 | "Write the opening of a story about…" (2026 SAM) · "a story about…" · title · picture | 45 min · none printed |
| Edexcel GCSE P1 | "Write about a time when…" (images) | 45 min · none printed |
| Eduqas C1 B | title · "a story that begins:" · "a story that ends:" · "an occasion when…" | 10 plan + 35 write · 450–600 |
| Edexcel IGCSE P2 | "a time when…" · title · images + "begins…" | 45 min · none printed |
| Cambridge P2 B | includes-the-words · element · title (the 5 Cambridge drills are the model) | ~55 min · 350–450 |
| CCEA Unit 4 | competition story from a picture, own title | 15 + 30 + 10 · none printed |

   Each drill: a real past prompt → the student writes ONE adapted opening line or decision ("which beat changes,
   what is the title now") → a worked example of the same move on the Scrooge spine (§4c.2) → next.
3. **One timed rewrite** (board time, timer optional) of the whole scene to one real prompt.
4. **One judgement turn (the only API call):** does the rewrite answer the prompt's focus? — named against the board's
   own descriptor; never a re-mark of the whole story.

**Open, not blocking the build:** OCR J351/02 is not on the drive (facts §8) — OCR students get the generic shapes
until the paper is found; SQA N5 has no creative question (no lesson 8 for SQA).

## 3 · The four layers (root §15 — every link, up front)

| layer | what it needs | owner |
|---|---|---|
| **Data** | Unit flag on the lesson (shortcode att, e.g. `unit="weekend"` — read through the ONE CW context); the §34 §5 **fallback resolver**: `plot_outline`→`story_spine`, `authorial_intent`→`dramatic_throughline`, `primary_archetype`→none. `CW_STEP_DEPS` (wml-assessment.js:6322) gates 9 and 10 on `plot_outline` → in unit context they read the fallback. Board→word-target map (one source, engine-injected; strip the hardcoded `450-600/650-750` in CW-STEP-09/10). Lesson-8 drill bank per board (data file, from the papers). | engine (this lane) |
| **Admin / course** | A "Weekend Story" unit (8 lessons) in each board's Language course — the canonical section G "BONUS: Emergency Grade 9 Exam Preparation" slot exists on every course. | **LD lane — handoff** |
| **Wiring** | Lessons 5–6 seed from the spine; Trial 1 reads lesson 5's seven rows (existing key); lesson 8 reads Draft 1. Key-match trace (root §5d) on every key above. | engine |
| **Student surface** | Own 1–8 numbering; no "Step N" / "plot outline" leaks (root §5c-ii); liveness on every turn (§4d). | engine |

## 4 · Build order + the proof at each step

1. **Fallback resolver** (highest risk — lesson 5 must never ask a student to pick from nothing). Proof: walk sim of
   lesson 5 with `plot_outline`/`primary_archetype`/`authorial_intent` all absent → it offers the six spine beats.
2. **Unit flag + gates** (9/10 accept the fallback only in unit context; the full course unchanged). Proof: full-course
   walk sims still pass; key-match trace table.
3. **Guided Draft 1** — Step-10 VARIANT switch (contextual chat, board target), Step 10 itself untouched (#366).
4. **Board word-target map** + the grep gate (no literal targets left in shared CW text).
5. **Lesson 8** — drill bank per board (sourced, cited), code-served walk, one judgement turn; walk sim with liveness.
6. **LD unit shells** — LD-lane handoff with the lesson list and shortcodes.
7. **Staging walk end-to-end** as test student 1938 on two boards (AQA + Cambridge), then Neil's one test pass.

## 5 · Gates (mechanical)
Walk sims for lessons 5, 6, 8 (liveness auto-checked) · key-match trace on the four §34 keys · grep: no
`450-600|650-750|700 words` literal in shared CW text · grep: no unit-context string names Step 5/6/7/12/15 or
"plot outline" · pre-ship green.
