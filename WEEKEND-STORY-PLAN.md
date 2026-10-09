# THE WEEKEND STORY — end-to-end build plan

**Ruled:** Neil, 2026-10-07 (PEDAGOGY §55): *"Seven lessons plus the adapting lesson (about 3 to 5 hours)"*, every
board's creative question. **Built on:** the Emergency unit (PEDAGOGY §34, `EMERGENCY-CW-UNIT-SPEC.md`).
**Research:** `~/.claude/handoffs/open/wml-CW-EXAM-STORY-FACTS-2026-10-07.md` (every claim cited there).
**Status:** lessons 1–7 BUILT (v7.20.737–.741, staging); LD built the unit shells on staging 8 Oct (units 59221 AQA,
59222 Eduqas; lessons 59223–59229). Lesson 5 rebuild, lesson 8 and lesson 9 to build — §2a, §2b, §2. Root §16: this plan is agreed before code; build in the order of §4.

## 1 · The nine lessons (own numbering on every student screen; sources live here only)

**Amended 2026-10-08 (PEDAGOGY §55.1, FIXLIST #783):** lesson 5 is rebuilt around Polti's dramatic situations, and a
Polish lesson joins after the mark. Lessons 1–4, 6, 7 are unchanged and already built (v7.20.737–.741).

| # | source | the student ends with | EST active |
|---|---|---|---|
| 1 | CW Step 1 — Writer's Profile | passions · conflicts · situations · 3 seed loglines | 20–40 min |
| 2 | CW Step 2 — Story Ideas | 1–3 ideas, one chosen | 5–20 min |
| 3 | CW Step 3 — Logline | 7 story components + a chosen logline | 15–30 min |
| 4 | CW Step 4 — Story Spine | six causally linked beats + a dramatic throughline — **the story plan** | 15–30 min |
| 5 | **Your Dramatic Situation** — CW Step 9 unit variant, Polti-first (§2a) | ONE dramatic situation from our 33, the spine moment it decides, the 7-element scene plan | 30–55 min |
| 6 | Guided Draft 1 (Step-10 variant) | Draft 1, every element as prose, at the board's word target | 15–40 min |
| 7 | Trial 1 — Story Coherence | self-mark + Sophia's mark on the 7 taught elements (/30) | ~20 min |
| 8 | **NEW — Polish Your Draft** (§2b) | Draft 1 improved on Trial 1's top priority | 20–40 min |
| 9 | **NEW — Adapt it to the question** (§2) | the story rewritten, timed, to a real prompt from the student's own board | 45–75 min |

Total ≈ 4–6 h (EST — no time-on-task exists; measure on the first students).

## 2 · Lesson 9 — adapting the prepared story

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

### 2c · Lesson 9 — the engineering (WML 333 A, 8 Oct; root §16 — written before code)

**Task id = `cw_step_90`, a UNIT-ONLY step number** (`CW_STEPS` entry `{ step: 90, phase: 'unit', unitOnly: true }`).
Measured, not assumed: a new string id (`cw_adapt`) misses every `cw_step_(\d+)` parser and ~60 `def.step` sites;
a step NUMBER plugs into all of them (completion, server integer step, storage suffix `_cw_90`, sign-off,
`cwStepUrls`, router `cw_step_` branch + CW preamble). Only ONE place lists every step (the CW Step Dashboard,
`wml-app.js:1746`) and it draws a FIXED phase list, so phase `unit` never appears there. **Numbers 90+ are reserved
for unit-only steps** so a future course renumber (there have been two) can never collide.
**Touchpoints:** `CW_STEPS` + `CW_UNIT_SIDEBAR_STEPS[90]` + `CW_STEP_DEPS[90]` (core/assessment) · doc template
(`_cwDocTemplateInner`, step 90) · walk controller `_cwAdaptCtl` (code-served) · router: protocol map
`cw_step_90 → CW-STEP-90-adapt-to-the-question.md` (judgement rules ONLY — §5 retained-source law) + step label ·
the prompt bank → client (PHP adds `cwAdaptPrompts` to the embed config for step 90 only, mapped from the
student's `cwExamBoard` through ONE board table — §5d key-match, every board traced) · a guard: step 90 opened
outside `unit="weekend"` says so and stops.
**The walk (code-served, §4/§4b/§4c):** orientation chunks (paced) → per drill, ONE at a time (§4c.8b): the real
prompt verbatim + its source line → criteria → the student's ONE line (banked to the drill's box, no API) → the
worked example on the Scrooge spine (§4c.2; transferable rule first, §5c-ii) → Continue → next. Then a ONE-screen
pick of the prompt to rewrite to → the rewrite box (seeded with their latest draft) + optional board timer →
"Check my rewrite" → **the ONE judgement turn**: hidden context (prompt + rewrite + the board's own focus rule,
quoted only where verified) → `@ADAPT_CHECK{"focus":"yes|partly|no","where":"…","fix":"…"}` → code validates →
files "Sophia's check" into the document. Fail-open (§4d): no usable marker → a Try-again chip, never a dead screen.
**v1 scope (named, not silent):** TEXT prompts only. CCEA's question is built on a picture and the papers never
describe their pictures (FIXLIST #789), so v1 gives CCEA students other boards' text prompts, saying so plainly;
picture prompts (AQA's picture option, CCEA) follow once the images are cropped from the papers. OCR J351/02
(June 2024, on the drive) joins the bank as data. SQA: no lesson 9.
**Gates:** weekend-story-harness section L (template, bank→board mapping for every board, marker validator,
no step/plot words) · walk sim with liveness (walk-sim-lib) · pre-ship.
**As built (v7.20.753), where it adds to the above:**
- The help ladder rides BOTH asks: each question's line, and the rewrite (rung 3 sends their rewrite so far).
- **ONE check per lesson** (Step 11's `pushed` precedent): after it, a question looked at again leads back to the end, never to a second call.
- A reload between the verdict reaching the transcript and reaching the document recovers it from the transcript and never buys it twice.
- The time line is the student's OWN board's sentence (a CCEA student practising another board's question still sits CCEA's 55 minutes). Cambridge prints no section time, so its 55 is ours and says so.
- AQA's sample paper is shown as "sample paper for exams from 2026".
- A scene typed into the chat stays on screen and the student is told it goes in the box.
- `CW_STEP_DEPS[90] = plot_outline`, which a unit swaps for the Story Spine.
- The bank's `source` paths are relative to the walkthrough folder; none ships to the page.
- The AQA cap is verified at source: `AQA-8700-1-SMS-2026.pdf` lines 860–861, first exam June 2026.
**Found in the staging browser walk of .753, fixed in .754:**
- The progress chip read "Step 1 of 3". The chip's default counter word leaked into the weekend unit, lesson 3's Logline walk included ("Step N of 7"). In a unit the default is now "Part"; lesson 9 counts "Question N of 3", headed by the kind of question.
- The shared walk ending said "That’s this step done". In a unit it now says "lesson".
- **Weekend lessons never name a course step (v7.20.755):** the smoke of LD's real pages found "Step 2: Explore Story Ideas", "Sparks From Step 1", "go back to Step 3" in lessons 1–4's documents and "Step 10" in lesson 7's, and lessons 2–4's walks said "carries straight into Step 3". Documents now go through `CW_UNIT_DOC_EDITS` (template + heals + fill). Every bubble of lessons 1–4 and 7 goes through `_cwUnitText`, which names every course step the unit HAS by its lesson. Steps the unit lacks get a phrase edit, and the harness fails on any left (population checks, §M).
- **The page keeps its questions:** each question row saves its question's identity (`criteria.adapt`), and the walk reads the page first. A bank change (OCR and picture questions are planned) can never ask one question in the chat while the page shows another.

## 2a · Lesson 5 — Your Dramatic Situation (Polti-first; replaces the unit's "Choose Your Scene")

**Source of the list:** Neil's own adapted *33 Dramatic Situations based on Georges Polti's Ideas*
(`../../Model Answers/Model Answer Resources/33-Dramatic-Situations-Based-on-Poltis-36-Dramatic-Situations (1).md`).
Its index repeats #22 in #23's cell — the detail section is right (#23 = Discovery of the Dishonour of a Loved One).
#33 Mistaken Identity has no roles in the source; ours are written to match the others' shape.

**Student-facing bank (data, one file, gated):** per situation — plain name · what it is (one line a 12-year-old
reads without guessing, root §5c-ii) · the ROLES in plain words · one famous example (weighted to our set texts,
then famous films/books, §5c-i; no quotation unless verified). The source's sub-variants are NOT shown (several are
sexual — N566). Gate: 33 entries, ids 1–33 match the source order, no archaic words (kinsman, brigandage, alienist,
suitor…), no banned student words.

**The walk (code-served except ONE judgement turn — CLAUDE.md §4, §4c):**
1. Greeting + paced orientation (§4b): a scene grips when ONE conflict drives it; Polti found the classic conflicts
   stories return to; each has fixed roles; ours has 33. How it works: 1 pick your situation · 2 check the moment ·
   3 shape the scene.
2. **Judgement turn (the only API call):** Sophia reads the student's Story Spine + logline and offers the THREE
   situations from our 33 that their spine already contains — each with the beat where it peaks and who plays each
   role. Output = a marker the code validates against the bank (id 1–33, beat 1–6). Invalid/missing → the browse
   list below (liveness §4d: never a screen with nothing to press).
3. The student taps one — or **"Show me all 33"** (one screen of plain names + one line each; a pick among
   alternatives is one screen, §4c.8) — then picks the beat if the situation came from the browse list.
4. The existing island opens with that beat pre-selected (the student can change it) → mark the run → shape the
   7 elements, with the situation's roles shown as the reminder ("Pursuit — on the run: Mia · chasing: the storm").
5. Transfer as today (the seven rows Draft 1 and Trial 1 read) + the situation stored with the scene state and shown
   on the Scene Structure page.
**Words:** never "Step 9", "plot", "stage" (root §5c-ii); "Polti" named once, as the person who found them.

## 2b · Lesson 8 — Polish Your Draft

The CW polishing environment (Draft 2 already runs on it with a `character_arc` lens — the lens is data, never a
per-step clone). New unit-only task `cw_polish`: the page shows the student's Draft 1 (lesson 6's prose) with Trial
1's top priority at the head; the student selects prose and gets the contextual chat, lens = **that priority**.
Where the priority is structural, the structural techniques (Step 27's list — hooks, foreshadowing, irony…) are the
teaching; hooks are element 1 already, so the lesson sharpens them rather than introducing them. Ends on Mark
Complete (the §40 gate family `cw`).

## 2d · Lesson 6 — Structural Elements (v7.20.761; PEDAGOGY §55.2, FIXLIST #804) — THE WEEKEND IS NOW TEN LESSONS

⚠️ Renumbered: 1 Profile · 2 Ideas · 3 Logline · 4 Spine · 5 Dramatic Situation · **6 Structural Elements** · 7 Draft 1 ·
8 Mark (Trial 1) · 9 Polish · 10 Adapt. Section headings above still use the OLD numbers (2 = now lesson 10, 2b = now 9).
LD shell: topic 59238 `[writing_mastery_lab task="cw_step_27" unit="weekend"]` in 59221 + 59222 (slugs kept, titles renumbered).

- **Data (one source, wml-core):** `CW_STRUCT_TECHNIQUES` — Step 27's 11, its order, its row ids (`cw-step-25-*`, kept so
  no saved Step 27 doc is orphaned), `what` from the protocol's definitions, one described example + one more each (no
  quotations), Table cards checked against the live allowlist. Musts: irony, denouement, senses; `CW_STRUCT_MIN` 4.
- **Engine:** `unitTier:'si'` on step 27 via `cwStepTier` → the chat appears in a unit only. `_cwStructCtl`: orientation
  (paced) → one technique at a time (musts asked "where", others Yes / Not this time) → typed "where and how" filed to the
  row → count check (≥4; else pick one more) → wrap with "Change a technique". Zero API except "Still stuck — ask Sophia".
  Document = position (resume from the rows). Wired at the 12 sites both pipelines use for lesson 10.
- **Draft 1 (lesson 7):** `tryFillCwStructPlan` pins a locked "Your Structural Plan" above the writing box from the
  `structural_elements` artifact (mirrored on every save). Coaching lens stays `prose_style` (a structural lens would need
  rubric content first — not built).
- **Trial 1 (lesson 8):** `cwTrial1Elements()` adds `CW_TRIAL1_STRUCTURE` (/4, AO5) before accuracy in a unit → /34; the
  marking context carries the student's lesson-6 plan; the router's weekend note tells Sophia there are NINE verdict lines.
- **Gates:** weekend harness §O (data · page · trial rows · wiring · the walk driven like a student · resume from the doc),
  5 mutations red; cw-keymatch knows the four chip menus; lesson-number literals updated (REST gate, lesson 9 About, seed gate).

## 2e · NEXT BATCH (Neil's test pass, 9 Oct — FIXLIST #813–#815f; root §16 plan, written before code)

Built only AFTER the tested 7.20.772 batch reaches prod (no shipped file moves before his typed go).

### 2e.1 · Choose where to focus — END OF LESSON 3, before the Story Spine (Neil, v73: *"Before the Story Spine"*)
His notes: the best stories *"focused on one moment in the story rather than a complete story from start to finish"*;
*"a scene is actually a mini story so still has the same structure"*; students *"think about where in their story they
want to actually focus on"*; show the examiners' words; one part as the normal choice.
- **Source quote (verified, `research/sources/aqa-8700-1-jun23-examiner-report.txt`):** "These responses managed the timed
  conditions by focusing upon a moment in time, rather than trying to include journeys and other events that led to the
  main focus." (AQA 8700/1 June 2023, Question 5, Strongest responses.)
- **The ask (unit only, code-served, §4c):** after the chosen logline, ONE screen of alternatives (§4c.8 — only one
  applies): *"Which part of your story will your exam scene tell?"* — the four DRAMATIC parts the logline already names,
  each showing the student's own words: the moment everything changes (`cw-step-3-incident` → spine beat 3) · going
  after what they want (`cw-step-3-goal` → beat 4) · the obstacle hits hardest (`cw-step-3-obstacle` → beat 5) · the
  ending, when everything is decided (`cw-step-3-stakes` → beat 6). Criteria + the examiners' line first; a worked example
  on A Christmas Carol (the known story threaded through the unit); help ladder. Filed to a new row
  `cw-step-3-scene-focus` (value = the beat number + label) and its artifact `scene_focus`.
- **Lesson 4:** the chosen beat is marked "Your exam scene" in the spine walk and document (that beat's ask adds one line:
  make it the most specific beat, because it is the one you write).
- **Lesson 5:** starts FROM the chosen part — the beat is pre-selected from `scene_focus` (one beat is the normal choice;
  the next beat may be added only when the moment carries on into it), Polti's situations are suggested for THAT moment,
  then the seven elements (unchanged). Fallback when `scene_focus` is empty (students who did lesson 3 before this
  ships): today's Polti-first pre-select, so nobody is stranded (§4d).
- **Key trace (§5d):** writer = lesson 3 walk → `cw-step-3-scene-focus` + artifact `scene_focus`; readers = lesson 4 walk
  marker, lesson 5 pre-select. Gate: weekend harness new section — the ask drives like a student, the value reaches
  lessons 4 and 5, the full course's Step 3 is unchanged.

### 2e.2 · Lesson 11 — Mark It Again (Neil, v72: *"Mark it again, then empathy as a bonus"*)
- Unit-only step **91** (`cw_step_91`, the 90+ rule above). Input = lesson 10's adapted rewrite (the rewrite box seeded
  by `tryFillCwAdaptRewrite`); marking = Trial 1's own (`cwTrial1Elements()` incl. the structural row, /34) — the
  same marking on a new text, never a copy of the rubric. The page shows each element's Trial 1 mark beside the new one
  so the student sees what changed. Self-mark first, then Sophia (Trial 1's order). Guard: opened outside the weekend unit
  → says so and stops (as lesson 10).

### 2e.3 · Bonus lesson — Make the Reader Care (empathy; optional, after lesson 11)
- Source = his workbook `CW-STEP-16-deepen-empathy.md` verbatim: 15 techniques in 3 categories (victim · humanistic
  virtues · desirable qualities), **at least 2 per category, courage compulsory**. Unit-only step **92**.
- Walk = lesson 6's shape (`_cwStructCtl` pattern): one technique at a time, a "no" costs one tap, "where and how" filed
  to its row, count check per category, change-one at the end. Then a revise box seeded with the latest story (lesson 10's
  rewrite) and the contextual chat lensed on empathy (the polishing lens is data, §2b). No marking (it is a bonus).
- Data: `CW_EMPATHY_TECHNIQUES` in wml-core (ids aligned with the full course's Step 18 rows so a student's work maps).

### 2e.4 · Smaller items in the same batch
- **Lesson 6:** Duality shows "Recommended" — his workbook marks it RECOMMENDED (`CW-STEP-25-structural-elements.md:32`),
  lesson 6 did not (root §13: match the workbook).
- **§59 band words (#813c):** level words only at their level, the board's own words — summary/feedback instructions +
  a gate (measured: "perceptive" on a Level 2 AQA Literature essay).
- **Banks to 40 (#815d):** 198 board sections, 3,763 questions → 4,157 new; texts students take now first; item rules
  as the current banks (one defensible answer, every distractor explained). Content work — drafted outside the plugin,
  applied after the prod go.
- **LD lane:** two new topics in each weekend unit (staging first): "11. Mark It Again" `[writing_mastery_lab
  task="cw_step_91" unit="weekend"]` and "Bonus: Make the Reader Care" `[writing_mastery_lab task="cw_step_92"
  unit="weekend"]` — handoff written when the steps exist on staging.

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
5. **Lesson 5 rebuild (§2a)** — the 33-situation bank + gate, the judgement turn + its validator, the browse screen,
   the beat pre-select; walk sim with liveness; the full-course Step 9 unchanged.
5b. **Lesson 8 Polish (§2b)** — `cw_polish` + the priority lens; full-course polishing steps unchanged.
5c. **Lesson 9 Adapt** — drill bank per board (sourced, cited), code-served walk, one judgement turn; walk sim with liveness.
6. **LD unit shells** — LD-lane handoff with the lesson list and shortcodes.
7. **Staging walk end-to-end** as test student 1938 on two boards (AQA + Cambridge), then Neil's one test pass.

## 5 · Gates (mechanical)
Walk sims for lessons 5, 6, 8 (liveness auto-checked) · key-match trace on the four §34 keys · grep: no
`450-600|650-750|700 words` literal in shared CW text · grep: no unit-context string names Step 5/6/7/12/15 or
"plot outline" · pre-ship green.
