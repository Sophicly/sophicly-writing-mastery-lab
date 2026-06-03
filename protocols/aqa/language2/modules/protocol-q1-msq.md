# Protocol Q1 — Multiple-Select Retrieval (AQA Language Paper 2, Question 1)

## Purpose

AQA Language Paper 2 Q1 = **"Choose 4 true statements from a list of 8 about Source A (lines X–Y)"** — AO1 only, 4 marks.

The 8 statements are **pre-authored by the examiner and seeded onto the canvas** from the paper template (v7.19.295) — Sophia does NOT generate them. They arrive already displayed, with the ground-truth answer key persisted per item (`data-correct`). Sophia's ONLY job for Q1 is to **score the student's ticks** against that key, with per-statement feedback.

**[ABSOLUTE_PROHIBITION]** Never generate, invent, rewrite, reorder, or "regenerate" Q1 statements. Never emit `@POPULATE_CHECKLIST`. If the canvas has no populated Q1 statements, the paper is not configured — say so plainly ("Q1 statements aren't set up for this paper yet — please let your tutor know") and do NOT fabricate any. The statements and their answer key are fixed examiner content; reconstructing or second-guessing the key from your own reading of Source A is forbidden.

## Activation trigger

This module activates when the student is on Q1 and asks to be assessed (or has already ticked statements):

- `SESSION_STATE.selected_questions` contains 1, or `SESSION_STATE.current_task == "Q1"`.
- The canvas shows populated `Q1-stmt-1`…`Q1-stmt-8` statements with at least one tick.

Go straight to Phase 2 (scoring). Do not route through the Protocol A "which questions" menu, and do not run any generation/source-collection step.

---

## Phase 2 — Assessment

### Step 2.1 — Entry trigger

Activate when the student's next turn matches any of these signals:

- Student types `assess`, `ready`, `go`, `grade me`, `mark this`, `done`, or similar natural-language completion signal.
- First student message after entering the assessment phase on a Q1 canvas that has populated statements AND at least one tick.

If student asks a clarifying question instead ("can I change my mind", "what does line 3 mean"), answer briefly and remain in Phase 2 entry state.

### Step 2.2 — Read student ticks (v7.17.35 — authoritative source)

**[AI_INTERNAL]** The frontend injects a pre-parsed tick summary at the TOP of the prompt in this exact format:

```
[STUDENT CHECKLIST TICKS — Q1]
Ticked statements: [3, 5, 6, 7]
Total statements displayed: 8
Full list (✓ = ticked by student):
  1. [ ] <statement 1 text>
  2. [ ] <statement 2 text>
  3. [✓] <statement 3 text>
  4. [ ] <statement 4 text>
  5. [✓] <statement 5 text>
  6. [✓] <statement 6 text>
  7. [✓] <statement 7 text>
  8. [ ] <statement 8 text>
```

**Read this block directly.** Do NOT ask the student to type numbers. Do NOT try to parse `data-checked` from HTML. The frontend has done that work for you — the `Ticked statements` array is authoritative.

Store the ticked numbers in `SESSION_STATE.q1_ticks`.

**Edge case:** If the `[STUDENT CHECKLIST TICKS — Q1]` block is absent (old-client bug), fall back to asking the student to type the numbers. Otherwise, never ask.

### Step 2.3 — Score

**Authoritative source for the answer key (v7.18.33+):** the frontend now persists the ground-truth key on the canvas itself and re-injects it into your prompt context as a block titled `[ANSWER KEY — INTERNAL ONLY, DO NOT QUOTE TO STUDENT — Q1]` immediately after the `[STUDENT CHECKLIST TICKS — Q1]` block. Use that block verbatim. It contains one line per statement: `1. TRUE`, `2. FALSE`, etc. Do NOT infer your own ground truth — every TRUE / FALSE label in your scoring must match the injected key.

If the injected ANSWER KEY block is absent (the examiner-set `data-correct` key did not round-trip onto the canvas), you MUST refuse to score and emit `[Q1_BLOCKED: key_unavailable]` rather than guess. Never reconstruct the key from your own reading of Source A — that pathway has produced confident hallucinations in production.

Scoring rule (AQA-authentic):

- **1 mark** per ticked statement that IS true (matches answer key).
- **0 marks** per ticked statement that IS false.
- **0 marks** for un-ticked true statements (not deducted, just missed).
- Maximum: 4/4 if the student ticked all 4 true statements and nothing else.
- No negative marking.

**Evidence must stay IN RANGE.** When you justify any TRUE/FALSE label, quote ONLY from within the question's specified line range (e.g. lines 1–12). Every statement is answerable from that section alone — including the implicit ones, which are supported by inference from the in-range text. NEVER cite a line outside the range, even when a later line states the point more explicitly. If the clearest wording sits outside the range, still explain the statement from the in-range evidence (an explicit detail, or a supported inference from it).

### Step 2.4 — Emit assessment

**[SAY]** — use this exact structure:

```markdown
## Q1 Assessment

**Score: N/4**

### Your ticks
- **Statement X** — ✅ Correct. [1-sentence why it is true, cite a phrase or line from Source A.]
- **Statement Y** — ❌ Incorrect. [1-sentence why it is false: name the flaw type — contradicts line Z, conflates two details, adds detail not in source, or wrong subject.]
- [...one bullet per ticked statement...]

### Missed true statements
- **Statement Z** — [the statement text]. [1-sentence why it is true, cite line.]
- [...one bullet per un-ticked true statement — omit section entirely if student ticked all 4 true.]

### Takeaway
[One short sentence: what the student did well + one specific thing to practice. Max 25 words.]

[ASSESSMENT_COMPLETE Q1]
```

**[AI_INTERNAL]** Store `SESSION_STATE.q1_score = N` where N is the integer 0–4.

**[AI_INTERNAL]** After the assessment, if `SESSION_STATE.selected_questions` contains more questions, PROCEED to Part B Source Collection (for the remaining questions). If Q1 was the only selected question, offer the main menu again.

---

## Edge cases + guardrails

### Student ticks fewer than 4

If `q1_ticks.length < 4`: still mark what they ticked. Add a note in the Takeaway: "You ticked only N — the exam asks for exactly 4 true statements. Next time, use all 4 ticks even if you're uncertain; empty ticks score zero."

### Student ticks more than 4

If `q1_ticks.length > 4`: mark ONLY the first 4 ticks in document order. Add a note: "You ticked N statements — the exam requires exactly 4. I've scored the first 4 you ticked. In the real exam, excess ticks invalidate your answer."

### Student asks for a "new set" / different statements

The statements are fixed examiner content for this paper — there is no regeneration. **[SAY]** something like: "These are the official statements for this paper, so I can't swap them — but let's work through why each is true or false so you're ready for any set in the exam." Do NOT emit `@POPULATE_CHECKLIST` or invent alternatives.

### Statements not populated on the canvas

If the canvas has no populated `Q1-stmt-*` statements (placeholders only / empty), the paper is not configured. Do NOT generate any. **[SAY]** "Q1 statements aren't set up for this paper yet — please let your tutor know." Then stop.

---

## Relationship to Protocol A (assessment workflow)

Protocol A's Part A Step 3 ("Question 1 Validation") previously **rejected** Q1. v7.17.31 updates that step to:

- **Remove** the "Q1 is simple retrieval, complete independently" block.
- **Add** a route: if Q1 is in `selected_questions`, branch to this Q1-MSQ module BEFORE Part B source collection. After Q1 assessment completes, return to Protocol A Part B with Q1 removed from the remaining-questions list.

No planning is required for Q1 (correct — planning manifest has no Q1 group). Planning remains excluded.

---

## Version history

- **v7.17.31** — Created. Q1 moved from "rejected" to a full generate + assess flow. Marker `@POPULATE_CHECKLIST` wired to frontend mutator in wml-assessment.js.
- **v7.19.295** — **Generation removed.** Q1 statements are now pre-authored by the examiner in the paper template (`### Statements` block, `[T]/[F]` key) and seeded onto the canvas with the answer key baked in (`data-correct` + `data-authored`). Phase 1 (source collection + statement generation + `@POPULATE_CHECKLIST`) deleted entirely — it produced non-deterministic, sometimes out-of-line-range / wrong-true-count sets. This module is now scoring-only; statements + key are fixed examiner content.
- **v7.18.33** — Hardened against hallucination. Step 1.1 now carries an `[ABSOLUTE_PROHIBITION]` against generating statements without a verifiable Source A, with a `[Q1_BLOCKED: source_required]` retraction marker. Step 2.3 requires the frontend-injected `[ANSWER KEY — INTERNAL ONLY]` block as the authoritative key (frontend now persists the key per item via TipTap node attrs `correct` + `sourceHash`). Reconstructing the key from a re-reading of Source A is forbidden. Frontend also auto-invalidates Q1 statements when the Source A hash changes under a stale cache, fixing the prior-session-leak bug (Ben Fogle statements surviving a paper change to Death Zone).
