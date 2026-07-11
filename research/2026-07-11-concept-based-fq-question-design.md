# Concept-based question design for foundational recognition quizzes
**Date:** 2026-07-11 · **For:** WML Foundational Quiz (FQ) bank redesign · **Method:** deep-research harness (103 agents, 21 sources fetched, 25 claims adversarially verified 3-vote, 24 confirmed / 1 refuted)
**Applied to:** `protocols/shared/foundational-quiz/banks/*.md` · governs `FQ-QUESTION-STANDARD.md` (the contract derived from this)

## Question
How to design foundational, recognition-format quiz items (MCQ / true-false / single-word fill, 3-5 per round) for GCSE/IGCSE English Literature (13-16) that test the **central enduring CONCEPT** of each aspect of a text — protagonist evolution, plot as causal tragic arc, controlling themes, genre-driven emotional effect, authorial message — rather than surface trivia.

## Verdict (validated)
Recognition rounds **can** test concepts, not just recall — **but only if the item itself demands higher-order processing.** A fact-only quiz does not transfer upward; a concept-keyed one does.

## The confirmed principles
1. **Higher-order retrieval transfers; fact retrieval does not.** Agarwal 2019 (*J. Educ. Psych.* 111(2), DOI 10.1037/edu0000282): "higher order and mixed quizzes improved higher order test performance, but fact quizzes did not." Design the round around concepts (change, causation, effect, message), not trivia. Corroborated: Karpicke & Blunt 2011 (*Science*). [3-0]
2. **Recognition format is not capped at recall.** MCQ/true-false reach Understand/Apply/Analyse (not Create) when the stem forces inference. Harder to author. PMC8368900; USask 2025; Smith & Karpicke 2013 ("little or no advantage of short-answer over multiple-choice"). [3-0]
3. **DISTRACTORS are the lever.** Each wrong option must be a **plausible conceptual MISREADING** (a documented student error), not an arbitrary false fact — so the student *reasons* "which reading is right." e.g. *"Macbeth as victim of fate"* vs *"agent of his own hamartia."* Little & Bjork 2015 (competitive distractors aid learning); Haladyna & Rodriguez 2013 (distractors from common misconceptions). [3-0]
4. **Threshold-concept "mimicry" warning.** A concept is a transformative, integrative *portal*; learners in the liminal state produce surface "mimicry." Build items so a mimicked/surface answer **cannot pass** as grasp. Land, Cousin, Meyer & Davies 2005. [3-0]
5. **UbD facets map 1:1 to the aspects.** Explanation (justified causal account) → PLOT arc; Empathy ("what the author made me feel") → EFFECTS (the intended emotion); Interpretation ("what does it mean / why does it matter") → THEMES + MESSAGE. Wiggins & McTighe. [3-0]
6. **Aristotle gives the tragedy targets.** Pity & fear arise from the plot's *inner causal structure*, not spectacle (EFFECTS); the hero is an *intermediate figure* who falls through *hamartia* — that middle position is *why* the fall moves us (PROTAGONIST + why-we-feel); plot = causal *necessity* not succession, "post hoc non ergo propter hoc" (PLOT as causal arc). *Poetics* ch.13-14. [3-0]

## Refuted — do NOT adopt
- "A higher-order stem must use a NOVEL, unseen scenario." **Refuted 0-3.** Reusing the familiar text is fine; the *new* demand is the thinking (inferring change/causation/emotion), not novel surface material.

## Caveats
- Foundational recognition rounds are a well-supported **low-stakes ENTRY** to conceptual understanding, not a full substitute for constructed conceptual assessment (essay/MSA). The strongest concept-based guidance (UbD, Erickson & Lanning) presumes constructed response — the recognition analogue is to push the reasoning **into competitive misconception-distractors**. Fits the Sophicly ladder: FQ = entry, MSQ/MSA/essay = production.
- **EFFECTS is genre-keyed.** Pity & fear is the *tragedy* answer. Other genres carry other genre-emotions (gothic → dread/horror; dystopia → fear/warning; comedy → delight/relief; realist social drama → moral discomfort). The *principle* (effects = the genre-driven emotional response) is universal; the *specific emotion* is per-text.
- Source quality: the two decisive empirical claims (Agarwal 2019; Little & Bjork) are primary peer-reviewed. Theory claims (UbD, Erickson/Lanning, threshold concepts) rest on faithful secondary reproductions of stable canonical frameworks. Aristotle verified against the primary *Poetics*.

## Key sources
- Agarwal 2019, *J. Educ. Psych.* — https://pdf.poojaagarwal.com/Agarwal_2019_JEdPsych.pdf
- Land/Cousin/Meyer/Davies 2005, Threshold Concepts (3) — https://www.ee.ucl.ac.uk/mflanaga/ISL04-pp53-64-Land-et-al.pdf
- Wiggins & McTighe, Six Facets — https://sites.duke.edu/aagc/files/2022/08/C9-SixFacetsUnderstanding.pdf
- Haladyna & Rodriguez distractor review — retrievalpractice.org/strategies/2018/multiple-choice
- MCQ higher-order (Bloom) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8368900/ · https://teaching.usask.ca/articles/2025-02-28-multichoice-questions-higher-order-thinking.php
- Aristotle *Poetics* ch.13-14 — https://personal.unizar.es/garciala/publicaciones/narrativetheory/1.Fabula.Aristotle.htm

## Application → FQ-QUESTION-STANDARD (per aspect)
| Aspect | Central concept | Distractors = misreadings of… | CN field |
|---|---|---|---|
| Protagonist | Evolution: who → becomes, and WHY | the arc (fixed / no-agency / undeserved) | §1 |
| Plot | Causal arc (necessity, not events) | causation (mere succession / external cause / random) | §3 |
| Themes | The controlling ideas | the idea's working | §5 |
| Effects | The **genre-driven emotion** (tragedy→pity&fear) | wrong genre-emotion / technique-naming / removes-agency | **§4 Genre & Emotion** |
| Message | Enduring "so what" / worldview affirmed | the opposite/partial worldview | §7 |
Raw report: `tasks/w12pvr282.output` (this session's transcript dir).
