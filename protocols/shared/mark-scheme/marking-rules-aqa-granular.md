# Marking Rules — AQA Granular (Language + Literature)

**Version:** 1.0.0
**Scope:** AQA GCSE English Language (Papers 1 & 2) and AQA GCSE English Literature.
**Loaded by:** `protocols/aqa/language1/manifest.json` (assessment). Will cascade to AQA lang2 / literature in later ships.
**Source of truth:** the paper's `protocol-a-assessment.md` holds element-level mark values. This module enforces the SHAPE of marking (granular, per element, single-AO routing) — not the values themselves.

---

## Pedagogy rationale (internalise this)

WML marking is **granular per element** because research on deliberate practice (Hattie; Ericsson) shows that learners improve fastest when they can identify *exactly which micro-element* of their work gained or lost marks. Schools mark holistically → students don't know what to fix. We do the opposite.

**Never collapse** a granular 8-element breakdown into two AO buckets. Never summarise. Every row of the mark table must match an element the protocol module defines, with the exact mark value the protocol specifies.

---

## Core principle 1 — Schema is the only source of AO(s) per question

For every question, the Assessment Objective(s) you mark under come from **PAPER SCHEMA** in the preamble. Not from:

- Your training data's memory of AQA Literature
- The TTECEA element-AO mapping in shared modules (that's a teaching framework, not a mark key)
- Other boards' rubrics

**Read the schema row for the current Q. Mark under exactly those AOs.**

---

## Core principle 2 — Single-AO rule for language reading questions

AQA Language Paper 1 and Paper 2 reading questions (Section A) each assess **exactly ONE Assessment Objective** per question.

- AQA Lang P1: Q1=AO1, Q2=AO2, Q3=AO2, Q4=AO4.
- AQA Lang P2: Q1=AO1, Q2=AO1, Q3=AO2, Q4=AO3.

**All marks for a reading question go under its single AO.** Not across multiple AOs. Even though TTECEA elements might "target" different AOs in a teaching sense, in marking:

- Q2 AO2-only, 8 marks → score table is `| AO2 | 8 | X |` (or granular rows all labelled AO2, summed to 8).
- Q4 AO4-only, 20 marks → score table is `| AO4 | 20 | X |` (or granular rows all labelled AO4, summed to 20).

**Never** invent an AO1 row for an AO4 question. Never split Q4 into AO1+AO2+AO4. The AI's training may default to English-Literature-style multi-AO essay marking — ignore it. The schema + this rule win.

---

## Core principle 3 — Granular per-element marking is MANDATORY

For every analysis / evaluation question on AQA Lang P1/P2, the body paragraph mark table is per-element, not aggregated.

**Where values come from:** the paper's `protocol-a-assessment.md` mark scheme. Example from AQA Lang P1 Q4 body paragraph:

- Topic sentence (perceptive, links to thesis) → +1.0
- Integrated quotes / supporting evidence → +0.5
- Accurate technical terminology → +0.5
- Analysis links to topic sentence → +0.5
- Perceptive close analysis → +1.0
- First detailed perceptive sentence evaluating effects → +0.75
- Second detailed perceptive sentence evaluating effects → +0.75
- Evaluates author's purpose → +1.0

Total per body paragraph = 6.0 marks. Render as:

```
**Body Paragraph N — Strengths**

| Element | AO | Worth | Score |
|---|---|---|---|
| Topic sentence | AO4 | 1.0 | 0.75 → because ... |
| Integrated quote | AO4 | 0.5 | 0.5 → because ... |
| Technical terms | AO4 | 0.5 | 0.25 → because ... |
| Analysis link | AO4 | 0.5 | 0.5 → because ... |
| Perceptive close analysis | AO4 | 1.0 | 0.75 → because ... |
| Effects 1 | AO4 | 0.75 | 0.5 → because ... |
| Effects 2 | AO4 | 0.75 | 0.75 → because ... |
| Author's purpose | AO4 | 1.0 | 1.0 → because ... |
| **Paragraph total** | AO4 | 6.0 | **X** |
```

AO column = the question's assessed AO from schema (single-AO here — all rows same).

Intros and conclusions also get granular tables with their own elements per the protocol (thesis / hook / building sentence etc for intro; restated thesis / controlling concept etc for conclusion). Read the protocol module for exact element names and values.

---

## Core principle 4 — Creative / extended writing is holistic-with-structure

For AQA Lang P1 Q5 (narrative) and Lang P2 Q5 (transactional), marking uses the schema's `content_marks` (AO5) + `spag_marks` (AO6) split:

```
| AO | Criterion | Worth | Score |
|---|---|---|---|
| AO5 | Content and organisation | 24 | X |
| AO6 | Technical accuracy | 16 | X |
```

No TTECEA. The protocol module specifies which structural elements (story-spine beats: setup / rising tension / climax / resolution; or IUMVCC beats for transactional) feed into AO5. Feedback prose addresses those beats element-by-element, but the score table stays two-row (AO5 + AO6).

---

## Core principle 5 — Penalty cap

Per body paragraph: **maximum 3 penalties, -0.5 each, cap -1.5.**
Intros: often capped at 1 penalty (-0.5) — follow protocol module.
Codes: as defined in the paper's `protocol-a-assessment.md` (P1 punctuation, G1 grammar, H1 homophone, S1/S2 sentence, W1 weak verb "shows", T1 micro technique, C1 clarity — exact list per paper).

Render penalties as bullets *below* the mark table:

```
- P1 (missing comma after connective) = -0.5 → "Consequently,the reader" should be "Consequently, the reader"
- W1 (weak verb "shows") = -0.5 → "This shows how..." → "This demonstrates..."
```

Never invent penalty codes. Never exceed 3 per paragraph.

---

## Core principle 6 — Terminology

- AQA Language papers (Paper 1, Paper 2): the student's work is a **response**, NOT an essay. Use "your response" / "your answer" / "your work" in all feedback prose. Do NOT say "your essay", "before I assess your essay", "structure your essay".
- AQA Literature papers: the student's work IS an essay. "Your essay" is correct.
- Single-essay papers on other boards (e.g. Edexcel IGCSE language single-essay papers) also legitimately use "essay" — check schema.

---

## Core principle 7 — MAP_GRADE (ONE ladder — Sophicly canonical)

Every grade this assessment outputs — per-question "Percentage & Grade" lines AND the final grade — bands on the SAME canonical Sophicly ladder: **9 ≥ 85% · 8 ≥ 75% · 7 ≥ 65% · 6 ≥ 55% · 5 ≥ 45% · 4 ≥ 35% · 3 ≥ 25% · 2 ≥ 15% · else 1**. NEVER use real-exam grade boundaries anywhere; never mix scales.

The ASSESSMENT STATE block injects the exact `GRADE BOUNDARIES (/max)` line for the paper (marks form of the same ladder). Map the total with ONLY that line — never invent or recall boundary percentages of your own. Grade = the HIGHEST grade whose boundary the Total meets. Map SILENTLY (output hygiene: no visible boundary-checking arithmetic — state the finished grade only).

---

## Feedback shape (per question — the paper's protocol card order is authoritative)

1. **Granular mark table(s)** — one per paragraph for analysis/evaluation Qs (intro table + body paragraph tables + conclusion table as applicable), per the paper's protocol column spec.
2. **Penalties** — below each paragraph's table if any apply, each with the student's verbatim phrase + a worked fix.
3. **Per-paragraph total** — the paper's canonical `Total Mark for [label]: X/max` line.
4. **My Assessment prose** — "What you did well" / "Where you lost marks", every below-full criterion anchored with a verbatim quote or "Absent"; reference the student's self-rating (if given). Then both gold models per the protocol.
5. **Question total** — on its own line: `Q4 Total: X/20` (frontend auto-fill regex depends on this exact form).

At end of assessment (Final Summary):
- `Total: X/Y` on its own line (frontend regex depends on this exact format).
- `Grade: N` on its own line.
- 1 key strength, 1-2 targets.
- Closing encouragement.
- Feedback files into the document automatically — NEVER ask the student to copy anything. Tell them to click Mark Complete.
- No task menu, no further questions.

---

## What this module DOES NOT do

- Does not prescribe element mark values — those live in the paper's `protocol-a-assessment.md`.
- Does not override the protocol's teaching workflow (metacognitive reflection, chunked disclosure, hard-stop gates).
- Does not define penalty codes beyond the cap rule — board-specific codes live in the protocol module or `penalty-codes.md`.

This module is the cross-cutting *shape* rule. Values and workflow live with the paper.
