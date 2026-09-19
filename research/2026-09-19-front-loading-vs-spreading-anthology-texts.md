# Front-loading vs spreading the anthology texts — what the research supports

**Date:** 2026-09-19 · **Asked by:** Neil (WML FIXLIST #560) · **Status:** recommendation, awaiting his ruling

## The question

Edexcel IGCSE Spec A Language Paper 1 has a 10-text non-fiction anthology. The live course
(44760) puts all the reading + quizzes in **unit 1**, before any writing. The AQA poetry courses
spread theirs: *Reading Poems 1–5* (unit 2) → first writing unit → *Poems 6–10* → notes →
*Poems 11–15* (measured on prod 2026-09-19, courses 42517 / 42623). Neil: *"Shouldn't we be
spreading them out?"* — with the constraint that a text used in a diagnostic must already have
been studied.

## What the literature says

1. **Spaced beats massed, robustly.** Cepeda, Pashler, Vul, Wixted & Rohrer (2006), *Psychological
   Bulletin* 132 — 839 assessments, 317 experiments: spaced conditions led to better retention
   than massed **at every retention interval**, and the best gap between sessions **grows with how
   long the material must be remembered**. For an exam months away, the useful gap is weeks, not
   days.
2. **It holds for educational material, with a caveat.** Carpenter, Cepeda, Rohrer, Kang & Pashler
   (2012), *Educational Psychology Review* 24 — spacing benefits diverse learning types and they
   give instructional recommendations; but they note few studies had used real curricula and
   realistic intervals.
3. **The strongest classroom result is spacing COMBINED with retrieval.** Rawson, Dunlosky &
   Sciartelli (2013), *Educational Psychology Review* — successive relearning (retrieve to
   criterion, then again in later sessions) in a real course: relearned concepts beat self-studied
   ones by more than a letter grade. Rawson & Dunlosky (2022) call it "underexplored but potent".
4. **Honest limit.** The EEF's *Cognitive Science Approaches in the Classroom* (2021): lab and
   controlled results are positive and replicable, but in realistic classrooms effects are
   **mixed and smaller**, and evidence on *how* to apply them day-to-day is thin.

## ⚠️ The distinction that matters here

**The spacing effect is about RETURNING to the same material, not about spreading first
exposures.** Moving texts 7–10 from unit 1 to unit 5 does not, by itself, "space" anything — each
text is still met once. Spreading helps for other reasons:

- each pair of texts lands **next to a writing task that uses one of them** (study → apply);
- unit 1 stops being a 15-lesson reading wall before the student writes a word;
- it creates natural moments to **re-quiz earlier texts** — and *that* is where the measured
  retention gain lives (points 1 and 3).

So spreading alone is a modest win. **Spreading + cumulative re-quizzing is the researched win.**

## The risk spreading introduces

The exam can set **any** of the 10 anthology texts. Front-loading guarantees a student who joins
late or runs out of time has at least met all ten. Spread across five topics, a student who stops
at Topic 3 has never seen texts 7–10. The poetry courses already carry this risk and answer it
with the *Emergency Exam Prep* bonus unit; the IGCSE course has the same bonus unit and would need
the four unread texts reachable from it.

## Recommendation (not yet ruled)

1. **Spread, on the poetry pattern**: one reading stage (2 texts + quiz) immediately **before the
   topic whose paper uses one of those two texts** — Neil's own constraint, and it makes the
   reading purposeful. Topic 1's paper uses Adichie (per the staging seed docs — ⚠️ the
   topic→text mapping could not be read from `wp_sophicly_topics`, which holds names only; verify
   each topic's paper before placing its stage).
2. **Make every quiz after the first CUMULATIVE** — stage N's quiz re-samples a few questions from
   stages 1…N−1. This is the successive-relearning mechanism, it is where the evidence is
   strongest, and the bank already supports it (questions carry `@text`; PEDAGOGY §8 already rules
   that retry-pull belongs to quizzes). Engine work: a `fq_review` share in `pick_session_fq`.
3. **Keep a safety net**: all ten texts reachable from the Emergency Exam Prep unit.
4. **Constraint today:** the IGCSE P1 course has only **Topic 1** built, so there is nowhere to
   spread stages 2–5 *to* yet. Stages move out of unit 1 as Topics 2–5 are built — this is a
   course-build sequence (ld-customization), plus one engine change (cumulative sampling).

## Sources

- Cepeda et al. 2006 — https://www.yorku.ca/ncepeda/publications/CPVWR2006.html · https://augmentingcognition.com/assets/Cepeda2006.pdf
- Carpenter et al. 2012 — https://files.eric.ed.gov/fulltext/ED536925.pdf
- Rawson, Dunlosky & Sciartelli 2013 — https://link.springer.com/article/10.1007/s10648-013-9240-4
- Rawson & Dunlosky 2022 — https://journals.sagepub.com/doi/10.1177/09637214221100484
- EEF 2021 review — https://d2tic4wvo1iusb.cloudfront.net/documents/guidance/Cognitive_science_approaches_in_the_classroom_-_A_review_of_the_evidence.pdf
