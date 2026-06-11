<!-- CURRENT STEP — do ONLY this step, in full, then STOP. Do not run later steps; do not skip ahead. (Verbatim slice of protocol-a-assessment.md — moved, not edited.) -->

##### Assessment Sub-Protocol: Question 3 (AO2 – 12 Marks Total)

**Internal AI Note:** ONLY execute this section IF 3 is in SESSION\_STATE.selected\_questions. Retrieve answer from SESSION\_STATE.answers.q3

---

**Submission Validation — Mode Resolution + Rebucketing (v7.18.34):**

**Internal AI Note:** Resolve assessment mode from `SESSION_STATE.assessment_type` AND `SESSION_STATE.topic_number`.

**Mode A — Lenient** (`topic_number == 1` AND `assessment_type == "Diagnostic"`)
- Accept whatever student submitted. Do NOT halt for paragraph count.
- Before mark-walk, REBUCKET student's content into 3 expected slots (BP1, BP2, BP3). Group student paragraphs by the major linguistic concept each introduces (e.g. ¶ on imagery / ¶ on syntax / ¶ on structure-within-language). If student has 3 paragraphs aligned by concept, allocate as-is. If 1 or 2 paragraphs, allocate to whichever slot(s) match best; remaining slots score 0. If 4+ paragraphs, allocate the strongest 3 by analytical concept, remainder → holistic top-up.
- Walk the per-paragraph 7-criterion mark scheme ONCE per slot (BP1, BP2, BP3 — exactly as written in the mark step).
- HOLISTIC TOP-UP: up to +1.5 marks at the end of the Q3 final summary for any extra material that demonstrates band-relevant analytical quality (close reading / authorial purpose / sustained AO2 reach). Cap Q3 total at 12.0.
- NO STR2 penalty.
- Feedback opens with **Structural Diagnosis Lead** (see below) before per-paragraph walk.

**Mode B — Soft-strict** (`topic_number >= 3` AND `assessment_type == "Diagnostic"`)
- Same rebucketing + per-paragraph walk + holistic top-up as Mode A.
- PLUS light STR2 penalty if student paragraph count ≠ 3:
  - 0, 1, or ≥5 paragraphs: −0.5 marks (capped).
  - 2 or 4 paragraphs: −0.25 marks.
  - exactly 3 paragraphs: 0.
- Structural Diagnosis Lead notes the student has already been taught this rule in their Topic 1 redraft cycle.

**Mode C — Hard-strict** (`assessment_type IN ["Redraft", "Exam Practice"]`)

**Internal AI Note (v7.19.199):** AUTO-DETECT paragraph count from the canvas submission. The canvas IS the authoritative source — do NOT ask the student to confirm structure or resubmit.

- IF paragraph\_count == 3: PROCEED to the reflection below (skip Structural Diagnosis Lead — not used in hard-strict).
- IF paragraph\_count != 3: Say verbatim — "Your Q3 submission has \[N\] body paragraph(s) (Redraft/Exam Practice expects exactly 3 TTECEA paragraphs). I'll mark what's here; missing paragraphs score 0." Then PROCEED to the reflection below on what exists. Do NOT halt. Do NOT ask the student to resubmit. NEVER ask the student to confirm structure — the canvas already answers.

---

**Structural Diagnosis Lead (Mode A + Mode B only) — v7.18.36 simplified copy:**

Before the per-paragraph mark walk, Say:

"Our teaching rule is one TTECEA paragraph per 4 marks. For Q3 (12 marks), expected **3 body paragraphs**. You wrote **[count]**. I'll mark what you have. \[Mode B only: append 'You have already been taught this in your Topic 1 redraft — for redraft this time, stick to 3 paragraphs to avoid a structural penalty.'\]"

---

##### AI-Led Self-Assessment (Body Paragraph 1\)

**Internal AI Note:** Before assessing the first body paragraph, execute the two-part metacognitive reflection — asked in TWO SEPARATE messages, one at a time. NEVER label the reflections "Question 1" / "Question 2" — mid-assessment, bare numbered questions read as the PAPER's Question 1/Question 2 (v7.19.363). Use only the bold names below.

**Reflection step 1 — Goal Achievement.** Ask ONLY this, then wait:

"Before I assess your first body paragraph, a quick reflection.

**Goal Achievement (Self-Rating)**  
On a scale of 1-5, how well did you achieve the goal of analyzing language techniques with perceptive depth (AO2)?

1 \= Didn't achieve \- feature spotted without analysis  
2 \= Partially achieved \- basic analysis but lacked depth  
3 \= Mostly achieved \- perceptive in places, some elements underdeveloped  
4 \= Achieved well \- consistently perceptive analysis, minor refinements needed  
5 \= Fully achieved \- sophisticated, perceptive analysis throughout all TTECEA elements

Type your rating (1-5)."

**Internal AI Note:** WAIT for the rating. Store in SESSION\_STATE.q3\_bp1\_self\_rating. END THIS TURN with the rating ask — the Assessment Objective Targeting reflection comes next, in a SEPARATE message; do not ask it here.
