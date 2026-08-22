# CW TRIALS + THE EXAMINER-LADDER SELF-ASSESSMENT — the whole-feature plan
**Written 2026-08-21 · WML engine lane · for Neil to read BEFORE any code (root `CLAUDE.md` §16)**

> Neil, 2026-08-21: *"We need to work on the trials. So like trial one. How are we going to actually
> structure that?"* — and, on whether to build or plan first: **plan first.**

Captured verbatim as FIXLIST **#405** (seeding), **#406** (what we assess against), **#407** (the
self-assessment interface). This document is the answer to all three as one chain.

---

## 0 · THE TWO RULINGS THIS PLAN IS BUILT ON

| ruled | by whom, when |
|---|---|
| **A trial is a FOCUSED DIAGNOSTIC on its own dimension.** The full AQA 40-mark AO5+AO6 assessment happens ONCE, at the end, after Trial 6. | Neil, 2026-08-21 |
| **Plan the whole feature before building any of it.** | Neil, 2026-08-21 |

---

## 1 · WHAT IS ALREADY THERE — measured, not assumed

**The course is a seven-draft ladder with six trials threaded through it** (`wml-core.js:1105–1131`).
The repeating unit is *workbook step → update plot → draft → trial*:

| draft | step | trial after it |
|---|---|---|
| Draft 1 — Prose Style | 10 (`env: diagnostic`, `tools: minimal`) | **Trial 1 — Story Coherence** |
| Draft 2 — Character Arc | 13 | Trial 2 — Character Depth |
| Draft 3 — Archetypes | 16 | Trial 3 — Archetype Coherence |
| Draft 4 — Empathy | 19 | Trial 4 — Emotional Impact |
| Draft 5 — Theme & Tone | 22 | Trial 5 — Thematic Clarity |
| Draft 6 — Genre | 25 | **— none —** |
| Draft 7 — Structural | 28 | Trial 6 — Technical Proficiency |
| Final Draft — SPAG | 29 | *(polish phase)* |
| Metacognitive Reflection | 30 | |

⚠️ **FIRST THING FOR NEIL: there are SEVEN drafts and SIX trials.** Draft 6 (Genre, step 25) has no
trial; Trial 6 assesses Draft 7. That may be deliberate or a gap — it is not recorded anywhere, so
it needs a ruling, not a guess.

**What exists per trial today:**
- ✅ A step definition, a task key (`cw_trial_N`), and a label.
- ✅ A protocol file — `protocols/shared/creative-writing/CW-TRIAL-0N-*.md` (~1KB each).
- ✅ A save endpoint — `saveTrial()` → `cw-project/trial`, flipping `trial_completion[N]`.
- ✅ A sidebar shape — but **the same four rows for all six trials**: Read Draft · Plot Fidelity ·
  Prose Quality · Feedback (`wml-core.js:1276`). Six dimension-named trials sharing one generic
  sidebar is the tension this plan resolves.

**What does NOT exist:** any code-served walk, any document builder, any seeding of the draft into
the trial, any mark.

### 1b · ⛔ THE EXISTING TRIAL PROTOCOLS BREAK THREE CURRENT LAWS — they are pre-law stubs

I opened `CW-TRIAL-01-story-coherence.md` rather than assuming (§14b). Verbatim from it:

1. > *"Ask the student to share their Draft 1 (it should be in the document)"*
   ⛔ **The paste-wall law** (WML `CLAUDE.md` §3): never ask a student for what the session already
   holds. The draft IS in the document — the protocol even says so in the same sentence.
2. > *"Score each criterion on a scale of 1-5"*
   ⛔ **Invented criteria** (root §5c, PEDAGOGY §4). Four criteria × 5 = a 20-point scale that
   belongs to no mark scheme on earth. A student cannot carry it into an exam hall.
3. The whole file is an instruction to the AI to narrate a marking conversation.
   ⛔ **Programmatic-first** (§4) and **PEDAGOGY §19** — the student marks their own work; an AI
   check outsources the judgment we are trying to build.

Also: Trial 1's criteria overlap Trial 6's (*"Prose Quality"* vs *"Language Craft"*), so the six
dimensions are not currently distinct. **These six files are rewritten by this plan, not extended.**

---

## 2 · THE ANSWER TO "WHAT DO WE ASSESS AGAINST" (#406)

Neil's two candidates were the **AQA Lang P1 criteria** or the **seven-element scene structure**
(hook · setup · reaction · epiphany · proaction · climax · denouement) marked 40 = 2×5 + 5×6.

**Recommendation: AQA AO5 + AO6 for the MARK. The seven elements for the FEEDBACK. Never 40 ÷ 7.**

Three reasons, in order of force:

1. ⭐ **AO6 is 16 of the 40 marks — 40% — and it lives in none of the seven elements.** Technical
   accuracy is vocabulary, sentence forms, punctuation and spelling *spread across the whole piece*.
   A per-element split has nowhere to put it. The arithmetic works (10 + 30 = 40); the mark scheme
   does not.
2. **Root `CLAUDE.md` already rules it:** Section B extended writing is marked **holistically** —
   *"Do NOT split Section B into equal-weighted paragraph marks."* AO5 is *sustained crafting across
   the arc*; a denouement does not carry 6 marks of it.
3. **A trial's job is to predict the real thing.** 40 ÷ 7 produces a number no examiner would give,
   which is the one thing a trial must not do.

**The seven elements are not wasted — they become the diagnostic lens.** They map onto AO5's
*Organisation* half, and they are what we taught, so feedback should speak in them.

⭐ **This dissolves the labelling problem Neil raised.** He is right that the draft has no
`hook`/`setup` labels — Step 9 deliberately joins the elements as *"just prose with no labels"*. But
you only need labels if **marks depend on them**. They don't. For feedback, Sophia can name where an
element sits (*"your epiphany arrives in the paragraph beginning…"*) without any mark hanging on it.

---

## 3 · THE CHAIN — every layer, end to end

### LAYER 1 — SEEDING: Draft 1 → Trial 1 (#405)

**The good news: the draft chain already carries itself forward.** `CW_DRAFT_PREDECESSOR`
(`wml-core.js`) maps `13:'draft_1', 16:'draft_2', …` so Draft 2 already opens seeded from Draft 1.
**Trial 1 therefore does not need to hand anything onward** — it is a *read-only* assessment of
`draft_1`, sitting beside the chain rather than inside it. That makes the seeding much simpler than
it first looks.

**When does it seed? Answer: at MOUNT, read fresh, every time.**
- The draft is saved into the `draft_1` artifact when Step 10 completes (`CW_ARTIFACT_MAP`).
- Trial 1 reads that artifact **on entry**, and re-reads on every entry.
- ⛔ **Never cache it into the trial's own document or a chat prime.** That is FIXLIST **#402**
  exactly — Step 8's roster came from a snapshot taken when the upstream step was half-finished, and
  editing the source changed nothing until the chat was cleared. The same shape here would show a
  student a stale draft while they mark themselves against it.
- The draft renders **read-only** in the trial (PEDAGOGY §6, the section-freeze law: a section is
  editable only in its authoring lesson). Trial 1 is not where you fix the writing — Step 13 is.

**Precedent to copy, not re-derive:** `bin/cw9-transfer-gate` already proves the Step 9 → Step 10
chain, including *"the seed only ever fills an EMPTY draft box"* and *"a failed artifact save tells
the STUDENT, it does not just log."* Trial seeding gets the same treatment and the same gate shape.

**Failure to design out now, because it is nameable:** *what if `draft_1` is empty or missing?* A
student who skipped Step 10, or whose save failed, must not meet a blank trial with no explanation
(§4d liveness). The trial says so in words and points back to Step 10.

### LAYER 2 — WHAT A TRIAL IS

**Per Neil's ruling: a focused diagnostic on its own dimension. No 40-mark score.** Trial 1 asks one
question well — *does this story hold together?* — and produces targets, not a grade.

Proposed shape, four stages, replacing the generic shared sidebar with a per-trial one:

1. **Read your draft** — the frozen `draft_1` beside the chat, plus their own plot outline from
   Step 6 (already available as the **My Plot** rail panel, shipped v7.20.535 — reuse it).
2. **The dimension's criteria, SERIAL** (root §18): one criterion at a time, each with a worked
   example, each answered *met / partly / not yet*. A "not yet" costs one tap.
3. **Their own verdict, in words** — one sentence per criterion they did not meet.
4. **Sophia responds to what they said** — reading their draft *alongside their self-assessment*,
   never instead of it.

⭐ **The criteria per trial must be DERIVED from what that draft's step actually taught**, not
invented (§5c, PEDAGOGY §3b: *the scaffold demands exactly what the protocol teaches*). Trial 2
(Character Depth) checks what Steps 11–13 taught. That is what makes the six dimensions distinct,
which today they are not.

### LAYER 3 — THE EXAMINER-LADDER SELF-ASSESSMENT (#407 / #221)

**This is the big one, and Neil wants it beyond creative writing: *"not just about the creative
writing, but actually about language and literature as well."***

It already has a ruling behind it — **PEDAGOGY §19**: *the student marks their own work against
stated criteria; an AI check outsources the judgment, a checklist builds it.* And it was captured as
**FIXLIST #221** on 2026-08-03 with the real AQA screenshots.

⚠️ **BUT WHAT NEIL DESCRIBED TODAY IS A CHANGE TO #221, AND IT IS A BETTER ONE.**
- **#221 (Aug 3):** the student is shown the four levels and **picks** which one they think they are.
- **Today (Aug 21):** the **real examiner procedure** — *"they read the bottom level first and ensure
  that the student has met all the criteria there. Then they read the next level… as long as they've
  met all the criteria, they just keep moving up… And if they haven't met all of the criteria, then
  they decide whether to put the student at the top of that level, at the middle of that level, or
  the bottom."*

The second is strictly better and it is the one to build: a top-down pick invites a student to
flatter themselves in one tap, while climbing from the bottom forces them to actually read Level 1
and Level 2 — which is where a weak piece genuinely sits, and where the honest evidence is. **This
supersedes #221's step (1); the rest of #221 survives.**

**The walk, per assessment objective, one AO at a time:**

```
for level in [1, 2, 3, 4]:                       # BOTTOM-UP, the examiner's own order
    serve the level's descriptors, paced         # verbatim mark-scheme text, code-served
    ask: "have you met EVERY one of these?"      # Yes / Not all of them
    if Yes:   climb to the next level
    if No:    → which ones HAVE you met?         # multi-select, per descriptor
              → top / middle / bottom of this level?
              → why? (one sentence, banked verbatim)
              → STOP. this is their mark.
```

- **The mark arithmetic is CODE**, derived from the band and the placement — never asked for as a
  number and never produced by the model. AQA's own Upper/Lower split gives the band edges
  (Upper L4 22–24, Lower L4 19–21, Upper L3 16–18, Lower L3 13–15 — all verbatim on disk).
- **Zero API for the entire ladder.** The descriptors are published mark-scheme text; the whole walk
  is code-served. **Only Sophia's closing reflection costs a call.**
- **Re-openable at any point** — Neil's explicit requirement in #221.
- **Then, and only then, Sophia marks it herself and reflects on the gap:** where the student was
  harder on themselves than the mark scheme is, where they were kinder, and what evidence in their
  own writing decides it. Their judgment is formed *before* they see hers — the same ordering
  PEDAGOGY §19 already requires for the Step-5 diagnostic checklist.
- **Tutor calibration + sign-off: reuse the existing sign-off machinery**, do not rebuild (#221).

**⭐ Neil named the risk himself: *"it might take them a long time."*** Design answers, not hopes:
- **Sixteen taps, not sixteen essays.** A "why?" is demanded only where they claim a level they have
  not fully met — the place the reasoning actually matters.
- **Resume must land on the exact level and descriptor**, never the top of the AO (§4c.8b).
- **AO5 and AO6 are separate sittings.** Two AOs in one run is the wall.
- The ladder short-circuits: a student who stops at Level 2 never reads Levels 3 and 4's descriptors
  in this pass.

### LAYER 4 — WHERE THE MARK-SCHEME DATA LIVES (and how it cannot drift)

**We already hold the real thing**: `protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md`
lines 166–300 carry AQA Q5 AO5 (24 marks) and AO6 (16 marks), every level, Upper and Lower, verbatim.

⛔ **Do NOT retype them into JavaScript.** Two copies of a mark scheme is the drift class this repo
has been bitten by repeatedly. Instead:
- **ONE source** — the protocol `.md` (itself quoted from the board's PDF).
- A **build step** extracts it to a data file the walk can serve (the `wml-cw6-concepts.js`
  precedent: a big code-owned dataset in `frontend/`).
- A **gate** diffs the extracted data against the protocol `.md` and fails the build on any
  divergence — the same discipline as `bin/tariff-gate.js`, which already requires every mark to be
  quoted from the board's own document.

This is also what makes Neil's "language and literature too" scope cheap: the walk is generic over
*(AO, levels, descriptors, band edges)*, so a new board or paper is a **data** job, not a code job.

### LAYER 5 — THE FINAL 40-MARK ASSESSMENT

Per the ruling, the full AQA AO5 + AO6 assessment happens **once, after Trial 6**, on the final
draft. That is where the examiner ladder runs in its complete form and where a real predicted grade
comes from. Placement — Step 29 (Final Draft — SPAG), a new step after it, or inside Step 30's
reflection — is an **open question for Neil** (see §6).

---

## 4 · WHAT I COULD NOT SETTLE FROM THE CODE — flagged, not guessed

1. **Do trials need to produce a SCORE for the dashboard?** Trials are `tier: 'si'`, and the grade
   ring aggregates every attempt (root §GRADE AGGREGATION). If a diagnostic trial returns no mark,
   it must be *deliberately* outside that aggregation rather than accidentally counted as zero.
   **Needs measuring against the grade endpoints before build** — I have not traced it, and I am not
   going to assume it.
2. **Seven drafts, six trials** (§1) — ruling needed.
3. **Does a Cambridge or Edexcel student do this course?** The mark scheme served must match the
   student's own board, and the CW course is currently AQA-shaped. Summer rule says *all* students
   do CW (`project_sophicly_summer_mode_all_students_do_cw`), which makes this a live question, not
   a theoretical one.

---

## 5 · SCOPE AND SEQUENCE — what to build, in what order, and how each is proven

| # | slice | why this order | proven by |
|---|---|---|---|
| 1 | **Mark-scheme data + extraction gate** | Everything else consumes it; and it is the piece that must not drift. | Gate diffs extracted data vs the protocol `.md`, verbatim, and fails on divergence. Proven RED by editing one descriptor. |
| 2 | **The examiner ladder walk, AO-generic, zero-API** | The biggest and most reusable piece — it serves CW, language and literature. Built once. | A walk sim: climbs, stops, short-circuits, banks a reason, resumes on the exact descriptor, and produces the arithmetic the band implies. Liveness is checked automatically inside `say()`/`tap()`. |
| 3 | **Trial 1 seeding + read-only draft** | Small, and it unblocks Neil testing the chain. | A gate in the `cw9-transfer-gate` shape: reads `draft_1` fresh at mount, never caches, renders read-only, and says something useful when the artifact is missing. |
| 4 | **Trial 1 as a focused diagnostic** (rewriting `CW-TRIAL-01`) | Needs 1–3 under it. Establishes the shape the other five copy. | Walk sim + the criteria-lint that already exists (every tickable criterion must be a verbatim substring of what the ask taught). |
| 5 | **Trials 2–6** | Mechanical once Trial 1's shape is agreed — each derives its criteria from its own draft's teaching. | Same sims, six times. |
| 6 | **The final 40-mark assessment** | Last, because it composes 1, 2 and the finished draft. | End-to-end: a real draft, both AOs, a mark, Sophia's reflection, tutor sign-off. |

**Slices 1–3 are one test cycle for Neil. Nothing is handed over piecemeal (root §12).**

---

## 6 · ASK NEIL — all four now ANSWERED (updated 2026-08-22)

1. **Seven drafts, six trials — RULED (2026-08-22, delegated by Neil to engineering judgment):**
   Trial 6 moves to follow Draft 6 (Genre, step 25) as a genre-focused trial; the full 40-mark
   assessment becomes the finale. Every draft gets its trial and "comprehensive final feedback"
   stops being duplicated between Trial 6's stub and the finale.
2. **Final 40-mark assessment placement — RULED (same delegation): after Step 29 (SPAG polish),
   before Step 30 (reflection).** AO6 IS technical accuracy — marking before the SPAG step scores
   errors the student is about to fix; after Step 29 the mark is of the finished piece and Step 30
   has something real to reflect on.
3. **Trials feed the grade ring — Neil ruled "definitely" (2026-08-21).** So a trial cannot be
   gradeless; the diagnostic verdicts must convert to a mark the ring can aggregate (design task
   inside slice 4, #409).
4. **No board label on the criteria — Neil ruled (2026-08-21):** descriptors still lifted verbatim
   from AQA's document and gated, but the student-facing surface carries no board name, so every
   summer CW student sees the same criteria regardless of their own board.

---

## 7 · WHAT THIS PLAN DELIBERATELY DOES NOT DO

- It does not touch the drafting steps (10, 13, 16, 19, 22, 25, 28) — they work.
- It does not rebuild the sign-off or tutor-calibration machinery — #221 already ruled: reuse it.
- It does not invent a single criterion. Every mark and descriptor traces to AQA's own document, and
  every trial criterion traces to what its own draft step taught.
