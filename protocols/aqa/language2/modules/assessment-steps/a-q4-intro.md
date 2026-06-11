<!-- CURRENT STEP — do ONLY this step, in full, then STOP. Do not run later steps; do not skip ahead. (Verbatim slice of protocol-a-assessment.md — moved, not edited.) -->

##### Assessment Sub-Protocol: Question 4 (AO3 – 16 Marks Total)

**Internal AI Note:** ONLY execute this section IF 4 is in SESSION\_STATE.selected\_questions. Retrieve answer from SESSION\_STATE.answers.q4

---

**Submission Validation — Mode Resolution + Rebucketing (v7.18.34):**

**Internal AI Note:** Resolve assessment mode from `SESSION_STATE.assessment_type` AND `SESSION_STATE.topic_number`.

**Mode A — Lenient** (`topic_number == 1` AND `assessment_type == "Diagnostic"`)
- Accept whatever student submitted. Do NOT halt for paragraph count.
- Before mark-walk, REBUCKET student's content into 5 expected slots (Intro / BP1 / BP2 / BP3 / Conclusion):
  - **Intro slot:** topic-orienting prose, opens with thesis or umbrella claim across both sources, no close-reading detail. If absent, slot scores 0/2.
  - **BP slots (×3):** comparative paragraphs, each grouped by a major comparison axis. If student wrote 4+ body paragraphs, allocate the strongest 3 by comparative reach; remainder → holistic top-up. If 1 or 2 body paragraphs, allocate to corresponding slot(s); remaining slots score 0.
  - **Conclusion slot:** closure-marker prose, returns to whole-text comparison without new evidence. If absent, slot scores 0/2.
- Walk the existing per-slot mark scheme: Intro /2, BP1 /4, BP2 /4, BP3 /4, Conclusion /2.
- HOLISTIC TOP-UP: up to +2.0 marks at the end of the Q4 final summary for any extra material that demonstrates band-relevant comparative quality (sustained AO3 reach across both sources / sophisticated method comparison / perceptive perspective-comparison). Cap Q4 total at 16.0.
- NO STR2 penalty.
- Feedback opens with **Structural Diagnosis Lead** (see below) before per-slot walk.

**Mode B — Soft-strict** (`topic_number >= 3` AND `assessment_type == "Diagnostic"`)
- Same rebucketing + per-slot walk + holistic top-up as Mode A.
- PLUS light STR2 penalty if structure diverges from Intro + 3 body + Conclusion:
  - Missing Intro AND Conclusion: −1.0 marks.
  - Missing Intro OR Conclusion: −0.5 marks.
  - Body-paragraph count 0, 1, or ≥5: extra −0.5 marks (capped, total Q4 STR2 ≤ −1.0).
  - Body-paragraph count 2 or 4: extra −0.25 marks.
  - Exact Intro + 3 body + Conclusion: 0.
- Structural Diagnosis Lead notes the student has already been taught this rule in their Topic 1 redraft cycle.

**Mode C — Hard-strict** (`assessment_type IN ["Redraft", "Exam Practice"]`)

**Internal AI Note (v7.19.197):** AUTO-DETECT section count from the canvas submission. The canvas IS the authoritative source — you have already received the student's Q4 response. Do NOT ask the student to confirm, verify, or describe their paper structure. Count Introduction (opening framing prose), Body Paragraphs (TTECEA blocks responding to the prompt), Conclusion (closure prose).

- IF section\_count >= 5: PROCEED directly to Introduction Assessment (skip Structural Diagnosis Lead — not used in hard-strict).
- IF section\_count < 5: Say verbatim — "Your Q4 submission has \[N\] sections (Redraft/Exam Practice expects 5: Intro + 3 BP + Conclusion). I'll mark what's here and apply STR2 penalty (−1.0 marks). Slots without content score 0." Then PROCEED to per-slot mark walk on what exists. Apply STR2 −1.0 to the Q4 total at the end. Do NOT halt. Do NOT ask the student to resubmit. NEVER emit a question like "did you write 5 paragraphs?" or "is this a full five-paragraph essay?" — the canvas already answers that.

---

**Structural Diagnosis Lead (Mode A + Mode B only) — v7.18.36 simplified copy:**

Before the per-slot mark walk, Say:

"Our teaching rule is Introduction + one TTECEA body paragraph per 4 marks + Conclusion. For Q4 (16 marks), expected **5 sections — Intro + 3 body + Conclusion**. You wrote **[count]**. I'll mark what you have. \[Mode B only: append 'You have already been taught this in your Topic 1 redraft — for redraft this time, stick to the 5-section shape to avoid a structural penalty.'\]"

---

##### Introduction Assessment (2 Marks)

Say: "Let's start with your introduction. Type **Y** when you're ready to see your introduction assessment."

**Internal AI Note:** Wait for Y confirmation.

---

**Mark Breakdown:**

**STRENGTHS \- Marks Awarded:**

* Identifies viewpoint/perspective for Source A (AO3): **plus 0.5 marks** → Awarded **\[X\]** because \[specific reason\]  
* Identifies viewpoint/perspective for Source B (AO3): **plus 0.5 marks** → Awarded **\[X\]** because \[specific reason\]  
* Uses comparative language to establish relationship (AO3): **plus 0.5 marks** → Awarded **\[X\]** because \[specific reason\]  
* Concise and focused (1-2 lines) (AO3): **plus 0.5 marks** → Awarded **\[X\]** because \[specific reason\]

**Potential marks: 2.0 marks**

---

**WEAKNESSES \- Marks Deducted:**

**Internal AI Note:** Apply maximum of 2 penalties (minus 1.0 marks total). GLOBAL PENALTY RULES apply (v7.19.372); penalties only on written material (v7.19.369); never re-price a gap an element mark already priced (v7.19.379).

* **Penalty 1:** \[Name with code\] \= **minus 0.5 marks** → \[reason\]  
* **Penalty 2:** \[Name with code\] \= **minus 0.5 marks** → \[reason\]

---

Say: "**Introduction score: \[X\] out of 2.0 marks**

My Assessment: \[Brief feedback\]"

**Internal AI Note:** Store mark in SESSION\_STATE.marks.q4\_intro

---

**Internal AI Note (closing cue):** END THIS TURN here. The introduction ALSO gets the gold standard step — MANDATORY, never skip. Say: "Type **Y** to see both gold standard examples for your introduction." Wait for Y — the introduction gold step comes next; do not begin it in this message, and do not offer "move to Body Paragraph 1".
