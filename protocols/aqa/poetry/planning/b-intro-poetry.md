# **Protocol B — AQA Poetry Comparison Planning: header, gold traceability and gates**

**\[AI\_INTERNAL\]** This module is on the planning `always` list, so the traceability block and the
gates below ride EVERY planning step. It carries no student-facing dialogue of its own.

---

## GOLD TRACEABILITY (D7 — planning reverses the gold this paper's assessment will judge)

Every element the student plans exists because the assessment protocol's gold model uses it, in
that position, for that mark. The planning beats are DERIVED from those golds — never
hand-authored, never invented at planning time. AQA Poetry authors its golds INLINE in
`modules/protocol-a-assessment-poetry.md` (benchmarked against `modules/model-answers-poetry.md`)
rather than in separate `a-*-gold.md` files, so each citation below names the protocol section it
reverses. There is no `@GOLD_SHAPE:` header to byte-copy: `bin/check-gold-shapes.sh` diffs only
citations that carry one, so a gold with no header must never be given a claimed shape here.

@GOLD_REF: modules/protocol-a-assessment-poetry.md — Introduction section gold (Model 1 + Model 2, STEP 4 Gold Standard Rewrite). Shape reversed by B.7: comparative Hook (one conceptual claim spanning BOTH poems, no technique words) then Building Sentences (the contextual backdrop of both poets, then the context-to-poet link) then a precise three-point comparative Thesis naming Form, Structure and Language. B.7 plans exactly those three elements, in that order.

@GOLD_REF: modules/protocol-a-assessment-poetry.md — Body Paragraph gold, one per body (Model 1 + Model 2, STEP 4). Shape reversed by B.5: comparative TTECEA+C — comparative-conceptual topic sentence (one claim spanning both poems, still no technique words) then technique + embedded evidence + inference, then word-level close analysis, then the effect on the reader in Poem A, then the effect on the reader in Poem B, then the poets' purposes, then context. B.5 plans exactly those seven elements, in that order, across the three comparative dimensions: Body 1 = FORM, Body 2 = STRUCTURE, Body 3 = LANGUAGE.

@GOLD_REF: modules/protocol-a-assessment-poetry.md — Conclusion section gold (Model 1 + Model 2, STEP 4). Shape reversed by B.8: Restated comparative Thesis (evolved, not repeated) then Controlling Concept spanning both poems, then the poets' Central Purpose, then Universal Message. B.8 plans exactly those four elements, in that order.

**If a gold's shape changes, the beats above change in the SAME commit.** A planning protocol that
teaches toward a gold the assessment has moved is the staleness class D7 exists to kill.

---

## PLANNING GATES (A1 — gate or it didn't happen)

**\[AI\_INTERNAL\] HARD PRECONDITION — B.4 Anchor Quotes, and every beat after it, is FORBIDDEN
until the conversation contains ALL of the pre-planning chain's replies:** (1) the grade-goal
reply, (2) the headline-goal reply, (3) the plan-mode reply, (4) the predictions reply. WML asks
these programmatically, so they may ALREADY be present in the conversation — store what is there,
ask ONLY the next missing one, and STOP. Never emit an anchor question, a body beat, or any
`@FIELD_COMMIT` in the same turn as a chain question.

**\[AI\_INTERNAL\] HARD PRECONDITION — B.6 Working Comparative Thesis is FORBIDDEN until all three
comparative bodies are planned:** the conversation must already contain a filed topic sentence for
Body 1 (Form), Body 2 (Structure) AND Body 3 (Language) — the `@FIELD_COMMIT` to
`outline-body-1-topic`, `outline-body-2-topic` and `outline-body-3-topic`. If any is missing,
return to B.5 for that paragraph and STOP. A comparative thesis synthesised from fewer than three
dimensions is a thesis the student did not build.

**\[AI\_INTERNAL\] HARD PRECONDITION — B.7 Introduction is FORBIDDEN until the working comparative
thesis is agreed:** the conversation must already contain the student's three-point comparative
thesis from B.6. If it is missing, return to B.6 and STOP. An introduction sets up an argument that
must already exist.

**\[AI\_INTERNAL\] BOTH POEMS ARE PRE-SUPPLIED — never ask for either.** The focus poem arrives in
the session-data block and the comparison poem is the student's B.1 chip pick. Asking the student
to name, paste or confirm a poem the session already holds is a defect, not a step (WML CLAUDE.md
§3, the paste-wall law).
