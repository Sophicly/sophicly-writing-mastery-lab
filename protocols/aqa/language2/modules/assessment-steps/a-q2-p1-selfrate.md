<!-- CURRENT STEP — do ONLY this step, in full, then STOP. Do not run later steps; do not skip ahead. (Verbatim slice of protocol-a-assessment.md — moved, not edited.) -->

##### Assessment Sub-Protocol: Question 2 (AO1 – 8 Marks Total)

**Internal AI Note:** ONLY execute this section IF 2 is in SESSION\_STATE.selected\_questions. Retrieve answer from SESSION\_STATE.answers.q2

---

**Submission Validation — Mode Resolution + Rebucketing (v7.18.34):**

**Internal AI Note:** Resolve assessment mode from `SESSION_STATE.assessment_type` AND `SESSION_STATE.topic_number` (the topic number is supplied in the preamble — e.g. "Topic 1", "Topic 3").

Three modes apply to Question 2:

**Mode A — Lenient** (`topic_number == 1` AND `assessment_type == "Diagnostic"`)
- Accept whatever student submitted. Do NOT halt for paragraph count.
- Before mark-walk, REBUCKET student's content into 2 expected paragraphs, each containing FOUR inference units in the order Source A → Source B → Source A → Source B:
  - ¶1: the student's first paragraph — up to four units (two on Source A, two on Source B), each a perceptive inference anchored to a quote.
  - ¶2: the student's second paragraph — the same four-unit A-B-A-B shape.
  - If the student wrote source-separated material or fewer units, allocate what they wrote to the matching units by idea; mark what is present, missing units score 0.
  - BUCKETS ARE DISJOINT (v7.19.400): every sentence of the student's answer belongs to AT MOST ONE paragraph bucket. Material allocated to ¶1's units must NEVER be re-used or re-marked as ¶2 — the same inference earns marks ONCE across Q2. If allocating by idea consumes the whole answer inside ¶1's four units, ¶2 is 'not present' (its units score 0; route any extra comparative quality through the holistic top-up instead, never through a second walk over the same material).
- Then walk the per-paragraph mark scheme ONCE per paragraph (¶1 walk, then ¶2 walk — exactly as written below). Each paragraph alternates both sources; every inference must be perceptive and anchored to quotation.
- HOLISTIC TOP-UP: if the student's submission includes material that does not fit cleanly into either slot but demonstrates band-relevant comparative quality (perceptive inference / integrated synthesis / sophisticated argument across both sources), award up to +1.0 marks at the end of the Q2 final summary as "Holistic content top-up". Cap Q2 total at 8.0 regardless.
- NO STR2 penalty.
- Feedback opens with a **Structural Diagnosis Lead** (see below) BEFORE the per-paragraph walk.

**Mode B — Soft-strict** (`topic_number >= 3` AND `assessment_type == "Diagnostic"`)
- Same rebucketing + per-paragraph walk + holistic top-up as Mode A.
- PLUS: apply a light STR2 penalty if student paragraph count ≠ 2:
  - 0 or ≥4 paragraphs: −0.5 marks (capped).
  - 1 or 3 paragraphs: −0.25 marks.
  - exactly 2 paragraphs: 0.
- Structural Diagnosis Lead notes that the student has already been taught this rule in their Topic 1 redraft cycle.

**Mode C — Hard-strict** (`assessment_type IN ["Redraft", "Exam Practice"]`)

**Internal AI Note (v7.19.199):** AUTO-DETECT paragraph count from the canvas submission. The canvas IS the authoritative source — do NOT ask the student to confirm structure or resubmit.

- IF paragraph_count == 2 AND each paragraph alternates both sources (units in the order Source A → Source B → Source A → Source B, each inference anchored to a quote): PROCEED to AI-Led Reminder (skip the Structural Diagnosis Lead — it is not used in hard-strict mode).
- IF paragraph_count != 2 OR a paragraph does not alternate both sources: Say verbatim — "Your Q2 submission has \[N\] paragraph(s) (Redraft/Exam Practice expects exactly 2, each alternating Source A → Source B → Source A → Source B with every inference anchored to a quote). I'll mark what's here against the per-unit criteria; missing units score 0." Then PROCEED to AI-Led Reminder on what exists. Do NOT halt. Do NOT ask the student to resubmit. NEVER ask the student to confirm structure — the canvas already answers.

---

##### AI-Led Reminder and Self-Assessment (Paragraph 1)

**Internal AI Note:** Before asking for self-assessment, review student's most recent feedback for a weakness relevant to Q2. The reflection is mark-scheme metacognition — it trains the student to read what AO1 rewards. NEVER ask the student to explain or restate the inferences they drew (that is the assessment's job, not theirs).

**Internal AI Note (v7.19.400 — Structural Diagnosis Lead is INSIDE Step 1, never skip):** Mode A + Mode B: the diagnosis and bucket map below are the OPENING of the Step 1 message — one single message, diagnosis first, rating ask last. The later marking turns do NOT see the rebucketing rules above; the bucket map you declare here is the marking turns' contract, and the buckets must be DISJOINT (no sentence in both). Past failures, both real: omitting the Lead → whole response marked as one paragraph; overlapping buckets → the same material credited in both paragraphs (7/8 overmark). Mode C: open with the Mode C verbatim line instead, then the rating ask.

**Step 1 — Structural Diagnosis + Goal Achievement (Self-Rating).** Deliver ALL of this in ONE message, then wait:

Say: "Our teaching rule is one paragraph per 4 marks. For Q2 (8 marks), expected **2 paragraphs**, each alternating Source A → Source B → Source A → Source B, with every perceptive inference anchored to a quotation. You wrote **[count]**. I'll mark what you have. \[Mode B only: append 'You have already been taught this in your Topic 1 redraft — for redraft this time, stick to 2 alternating paragraphs to avoid a structural penalty.'\]

**Bucket map:** Paragraph 1 = \[which of the student's material fills the first 4-mark paragraph — e.g. 'your opening + your Source A and Source B material, allocated to the four units by idea'\]. Paragraph 2 = \[which REMAINING material fills the second — or 'no separate second paragraph: Paragraph 2's units will score 0, with any extra comparative quality credited through the holistic top-up'\]. The two buckets never overlap — nothing is marked twice. Each paragraph is marked separately out of 4.0, one at a time.

Before I assess your first paragraph, a quick reflection on the mark scheme. Q2 is AO1: the marks reward **perceptive inference** about the differences (going beyond what the text literally says), **developed in detail**, with every inference **anchored to a quotation** — not a plain summary.

On a scale of 1-5, how well do you think your first paragraph met those three demands?

1 = Summarised the differences without real inference
2 = Some inference, but mostly surface-level or unquoted
3 = Perceptive inference in places; detail or quoting inconsistent
4 = Consistently perceptive, detailed and quote-anchored, with minor gaps
5 = Perceptive, detailed, quote-anchored inference throughout

Type your rating (1-5)."

**Internal AI Note:** WAIT for the rating. Then proceed to Step 2.
