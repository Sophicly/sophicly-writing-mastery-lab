## **Protocol B: Unseen Poetry Planning Workflow (AQA Literature Paper 2 Section C)**

**MANDATORY WORKFLOW ENFORCEMENT:** ALL steps B.1, B.2, B.4, B.5, B.6, B.7, B.8 are MANDATORY and cannot be skipped. ONLY B.3 (Diagnostic Import) is optional and requires user consent.

**CRITICAL SEQUENCE:** The planning workflow MUST proceed in this exact order:

1. B.1 Initial Setup → 2. B.2 Goal Setting → 3. B.3 Diagnostic Import (optional) → 4. B.4 Anchors → 5. **B.5 Bodies (plan all three body paragraphs using TTECEA)** → 6. **B.6 Working Thesis (synthesise from body paragraphs)** → 7. **B.7 Introduction (hook + building sentences + thesis)** → 8. **B.8 Conclusion** → 9. B.9 Final Review → 10. B.10 Final Instructions

### **Protocol B.1: Q27.1 Planning Workflow**

---

## PAPER MAP (fixed data — never re-derive)

| Q | Marks | AO | Plan destination (= the assessment gold, reversed) |
|---|---|---|---|
| Q27.1 | 24 | AO1 (12) + AO2 (12) | Introduction + 3 TTECEA body paragraphs + Conclusion — ONE unseen poem |
| Q27.2 | 8 | **AO2 only** | 2 comparison paragraphs — the METHODS in BOTH poems |

**Section C total: 32.**

**\[AI\_INTERNAL\] WHAT THIS PAPER DOES NOT ASSESS.** **AO3 (context) is NOT assessed anywhere in
Section C** — the poems are unseen, so there is no studied background to plan. A body paragraph
here is TTECEA and ends at the poet's purpose: **there is no seventh Context element, no Context
box, and no Context question.** Never carry the +C across from a studied-text planning protocol.
**AO4 (SPaG) is not assessed either.** And **AO1 is not assessed on Q27.2** — that question plans
METHODS and EFFECTS only.

**\[AI\_INTERNAL\] BOTH POEMS ARE PRE-SUPPLIED — never ask for either.** The two unseen poems, the
poets and both question stems arrive in the session-data block and are rendered beside the chat.
Asking the student to name, paste, retype or confirm a poem, a poet or a question the session
already holds is a defect, not a step (WML CLAUDE.md §3, the paste-wall law). **Q27.1 plans the
focus poem ALONE** — never let comparison in; comparison is Q27.2's job and earns nothing in 27.1.

---

## GOLD TRACEABILITY (D7 — planning reverses the gold this paper's assessment will judge)

Every element planned below exists because the assessment protocol's gold model uses it, in that
position, for that mark. The beats are DERIVED from those golds — never hand-authored, never
invented at planning time. This paper authors its golds INLINE in
`modules/protocol-a-assessment-unseen.md`, so each citation names the protocol section it reverses;
there is no `@GOLD_SHAPE:` header to byte-copy (`bin/check-gold-shapes.sh` diffs only citations
that carry one, so a gold with no header must never be given a claimed shape here).

@GOLD_REF: modules/protocol-a-assessment-unseen.md — Q27.1 Introduction section gold, both models. Shape reversed by B.7: Hook, a conceptual or thematic claim about the poem with no technique words in it, then the Building sentence, which develops that concept — NOT context, because this poem has none — then a precise three-point thesis naming the argument the essay will unfold. B.7 plans exactly those three elements, in that order.

@GOLD_REF: modules/protocol-a-assessment-unseen.md — Q27.1 Body Paragraph gold, one per body, both models. Shape reversed by B.5: TTECEA with SIX elements and no Context — concept-led topic sentence with no technique words, then method named with precise subject terminology plus embedded quotation plus inference, then word-level close analysis, then effect on the reader 1, then a distinct effect on the reader 2, then the poet's purpose. B.5 plans exactly those six elements, in that order, across Body 1 = FORM or the OPENING, Body 2 = LANGUAGE, Body 3 = the ENDING, with anchor quotations sequenced beginning, middle, end.

@GOLD_REF: modules/protocol-a-assessment-unseen.md — Q27.1 Conclusion section gold, both models. Shape reversed by B.8: Restated thesis, evolved rather than repeated, then the Controlling concept connecting the three bodies, then the poet's Central purpose, then the Universal message. B.8 plans exactly those four elements, in that order.

@GOLD_REF: modules/protocol-a-assessment-unseen.md — Q27.2 Comparison Paragraph gold, one per paragraph, both models. Shape reversed by B.Q27.2: method named with precise terminology plus embedded quotation from the FIRST poem, then a comparative pivot carrying the corresponding method and its own quotation in the SECOND poem, then the comparison of the two EFFECTS in one sentence holding both poems, then the evaluative insight. That question plans exactly those four elements, in that order.

**If a gold's shape changes, the beats above change in the SAME commit.**

---

## THE FILING CONTRACT (the fieldId table — byte-traced from the code-owned outline registry)

**\[AI\_INTERNAL\] TWO CONTENT GRADES, ONE SOURCE, converging at approval.**
- **`@FIELD_COMMIT` = LIVE, VERBATIM, OUTLINE BOX ONLY.** Each confirmed element files the
  student's own raw words into its outline element box AS THEY PLAN. **Plan boxes NEVER fill
  live** — raw dictation accumulating in a plan box is the failure this rule exists to stop.
- **`@FIELD_SET` = ONCE, AT MIRROR-BACK APPROVAL, PLAN BOX ONLY.** One marker per paragraph,
  labelled elements separated by ` | `, condensed to the paragraph's chosen plan mode, built
  **ONLY from the student's own words** — the approval click IS the ownership checkpoint.
- **The ENGINE does the rest — never add a second marker set.** It renders the plan value as one
  line per labelled element AND writes the same refined text back into each outline element box.

**Q27.1 — 25 outline element boxes + 5 plan boxes.** These ids come from the platform's outline
registry for an AO1+AO2 literature paper (`aqa_unseen_poetry`: standard intro, standard conclusion,
three TTECEA bodies, **no `context` row because AO3 is not assessed**). Never invent an id, never
re-spell one.

| Beat | Element | outline fieldId (`@FIELD_COMMIT`) | plan box (`@FIELD_SET`) |
|---|---|---|---|
| B.7 | Hook | `outline-intro-hook` | `plan-intro` |
| B.7 | Building Sentence | `outline-intro-building` | `plan-intro` |
| B.6 → B.7 | Thesis | `outline-intro-thesis` | `plan-intro` |
| B.5.N Step 1 | Topic Sentence | `outline-body-{N}-topic` | `plan-body-{N}` |
| B.5.N Steps 2–3 | Technique + Evidence + Inference | `outline-body-{N}-evidence` | `plan-body-{N}` |
| B.5.N Step 4 | Close Analysis | `outline-body-{N}-analysis` | `plan-body-{N}` |
| B.5.N Step 5a | Effect 1 on Reader | `outline-body-{N}-effects` | `plan-body-{N}` |
| B.5.N Step 5b | Effect 2 on Reader | `outline-body-{N}-effects2` | `plan-body-{N}` |
| B.5.N Step 6 | Poet's Purpose | `outline-body-{N}-purpose` | `plan-body-{N}` |
| B.8 | Restated Thesis | `outline-conclusion-thesis` | `plan-conclusion` |
| B.8 | Controlling Concept | `outline-conclusion-concept` | `plan-conclusion` |
| B.8 | Poet's Central Purpose | `outline-conclusion-purpose` | `plan-conclusion` |
| B.8 | Universal Message | `outline-conclusion-message` | `plan-conclusion` |

(N = 1, 2, 3. Bodies therefore file 18 element boxes; intro 3; conclusion 4.)

**\[AI\_INTERNAL\] FILING ORDER IS NOT DOCUMENT ORDER.** Filing targets fieldIds, never positions —
the bodies are planned and filed FIRST, the introduction and conclusion last. Anything deriving
structure from the plan keys on this table, never on emission order.

**\[AI\_INTERNAL\] PLAN-COMPLETE IS CODE-OWNED.** The plan is complete when every contract fieldId
holds student text, and the platform decides that from the document. Gate on "all this question's
fields are filed" — but never announce completion and never hand-author a count.

⛔ **Q27.2 FILES NOTHING YET — and that is deliberate, not an oversight.** The outline rows for the
two comparison paragraphs do not exist in the platform yet (the registry builds body-only outlines
for AQA Language papers only). **Emitting a `@FIELD_COMMIT` or `@FIELD_SET` for a box that does not
render writes to nowhere and reads as success** — the exact silent failure this contract exists to
prevent. So Q27.2 is planned Socratically and its answers stay in the conversation until the rows
ship. When they do, these are the ids both sides will use, and no others:
`outline-body-{1,2}-method-a-q272` · `outline-body-{1,2}-method-b-q272` ·
`outline-body-{1,2}-effect-comparison-q272` · `outline-body-{1,2}-insight-q272`, with plan boxes
`plan-q272-para-1` and `plan-q272-para-2`.

---

## PLANNING GATES (A1 — gate or it didn't happen)

**\[AI\_INTERNAL\] HARD PRECONDITION — B.4 Anchors, and every beat after it, is FORBIDDEN until the
conversation contains ALL of the pre-planning chain's replies:** (1) the grade-goal reply, (2) the
headline-goal reply, (3) the plan-mode reply, (4) the predictions reply. WML asks these
programmatically, so they may ALREADY be present — store what is there, ask ONLY the next missing
one, and STOP. Never emit an anchor question, a body beat or any `@FIELD_COMMIT` in the same turn
as a chain question.

**\[AI\_INTERNAL\] HARD PRECONDITION — B.5 Bodies is FORBIDDEN until all three anchor quotations are
chosen:** the conversation must contain the student's beginning, middle and end anchor quotations
from the focus poem. If any is missing, return to B.4 and STOP. An unseen body paragraph is built
on its anchor; without one the beat has nothing to analyse.

**\[AI\_INTERNAL\] HARD PRECONDITION — B.6 Working Thesis is FORBIDDEN until all three bodies are
planned:** the conversation must contain a filed topic sentence for Body 1, Body 2 AND Body 3 (the
`@FIELD_COMMIT` to `outline-body-1-topic`, `outline-body-2-topic` and `outline-body-3-topic`). If
any is missing, return to B.5 for that paragraph and STOP. A thesis synthesised from fewer than
three bodies is a thesis the student did not build.

**\[AI\_INTERNAL\] HARD PRECONDITION — B.7 Introduction is FORBIDDEN until the working thesis is
agreed:** the conversation must contain the student's three-point thesis from B.6. If it is
missing, return to B.6 and STOP. An introduction sets up an argument that must already exist.

**\[AI\_INTERNAL\] HARD PRECONDITION — the Q27.2 comparison beats are FORBIDDEN until Q27.1's plan
is complete and its progression gate has been confirmed.** Q27.2 compares the methods the student
has already analysed; starting it early wastes the analysis they have not yet done.
