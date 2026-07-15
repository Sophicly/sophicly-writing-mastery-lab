# PEDAGOGY.md — WHY Sophicly behaves the way it does (the learning principles)

**Owner:** Neil. **Started:** 2026-07-15.

**Belongs here:** the LEARNING principles that the protocols and the engine must serve — rules about
how students learn, when support is given or withdrawn, what is measured, and why. The *why*.

**Does NOT belong here:**
- what a protocol says, step by step → `PROTOCOL-STANDARD.md`
- how the machine behaves (engine/UX contract, failure classes) → `ASSESSMENT-MECHANICS.md`
- who the users are + voice → `PRODUCT.md`
- board/paper facts (AOs, marks) → `protocols/shared/*-paper-specs.json`

**Why this document exists (2026-07-15, Neil).** We had three documents covering WHAT and HOW, and
none covering WHY. So a pedagogy rule — the first-attempt leniency — ended up recorded only as a
comment inside the progress-card function that consumed it. With no home of its own it drifted into
a *document*-shaped predicate (`topicNumber === 1`) when the rule was always about the *student*.
**A pedagogy rule written down only inside its consumer will be re-derived wrongly by the next
consumer.** That is the failure this file exists to prevent.

**How to use it.** Every rule here states: the RULE (Neil's words where possible) → the REASON →
WHAT IT GOVERNS (every surface it should reach) → its STATUS in the code. When a rule and the code
disagree, THIS FILE IS RIGHT and the code is a defect — file it in the ASSESSMENT-MECHANICS §9
register and fix it. When a new feature touches a surface a rule governs, that rule is a
requirement, not a nice-to-have.

**Status key:** ✅ implemented · ⚠️ implemented WRONG (tracked defect) · 🔵 not built · 🔍 principle
asserted, research not yet done.

---

## §1. SUPPORT IS WITHDRAWN AS INSTRUCTION IS RECEIVED — the first-attempt rule

**THE RULE (Neil, 2026-07-15, verbatim):** the Topic-1 / Phase-1 leniency — the Essay Plan is
optional, and the progress card counts only what the student can actually be expected to do —
applies **ONLY to a student's very first attempt, ever**. Not the first attempt in a course; the
first attempt in their life on Sophicly.

> *"Once they've done topic 1 phase 1, they would have got feedback, grade 9 model answers, gold
> standard model answers, then they would do the redraft, study more model answers, and so on. So by
> the time they get to another topic 1 phase 1, they've learned enough to at least have a go. And
> therefore we can no longer have that leniency that it's their first attempt — because it isn't."*

So: a student who completes AQA Language Paper 1 and then starts Macbeth Topic 1 Phase 1 gets **no**
leniency. **After the very first attempt, everything is always compulsory.**

**THE REASON.** The exemption is not about the document's position in a course. It is about **having
been taught**. On a genuine first attempt the student has received no feedback, seen no model
answer, and been shown no method — asking them to produce a plan measures nothing they have been
given. One full cycle later (feedback → grade-9 models → redraft → more models) they have been
taught; the same leniency now measures nothing at all, and worse, it withholds the demand that
produces the learning.

**THE GENERALISATION (this is why the rule is here and not just in the progress card).** The rule
Sophicly actually holds is broader:

> **Leniency, scaffolding, and optionality are calibrated to the INSTRUCTION THE STUDENT HAS
> RECEIVED — never to where they happen to be sitting in a course.**

A student's position in a course is a proxy for their experience, and it is a BAD one, because
students arrive at Topic 1 from many routes. Any rule that keys on topic/phase/paper to decide "how
much help does this person get" is suspect BY CONSTRUCTION and should be interrogated against this
principle.

**WHAT IT GOVERNS** (every surface where "how much do we demand / help" is decided — audit each
before assuming it is exempt):
- the diagnostic progress card (what counts toward completion)
- `_isAssessmentComplete` (is the Essay Plan required to finish?)
- any future hint / scaffold / optionality gate
- Sophia's coaching posture (how much she offers unprompted)
- the marking bar — see §2 for why this one is DIFFERENT and must not follow the rule

**STATUS: ⚠️ IMPLEMENTED WRONG — live defect, tracked.** `_isFirstDiagnostic()`
(`frontend/wml-assessment.js` ~8849) is `topicNumber === 1 && phase === 'initial'` of the CURRENT
course. It cannot see the student's history, so it grants the beginner exemption on every course's
Topic 1. Full spec + the build shape (server-side answer from `session_records`, **stamped ONCE on
the doc at creation, never computed live** — the student's own record is registered at project
creation, so a live check sees itself and flips mid-exercise): ASSESSMENT-MECHANICS §9 class 23.

**🔍 RESEARCH NOT YET DONE.** The rule is Neil's, from teaching experience, and it stands on its own.
It also *appears* to sit on well-established ground, and naming the right literature would let us
apply it deliberately elsewhere rather than case by case. Candidate frames, **asserted not verified
— do not cite these to students or in student-facing content until checked**
(`feedback_never_invent_mark_scheme_claims`, `feedback_student_content_derives_from_protocols_never_assume`):
- **Scaffolding and its FADING** (Wood/Bruner/Ross lineage) — support is temporary by design; the
  removal is the point, not a compromise. This is the closest fit to Neil's rule.
- **The expertise-reversal effect** (Kalyuga and colleagues) — support that helps a novice can
  actively *harm* a more expert learner. If it holds as stated, it upgrades Neil's rule from
  "leniency is no longer needed" to "leniency is now HARMFUL", which is a stronger claim and would
  change how aggressively we withdraw help elsewhere.
- **Zone of proximal development** (Vygotsky) — the demand should sit just beyond independent
  ability, which MOVES as the student learns. Explains why a fixed, course-position rule is wrong in
  principle and not just in this instance.
- **Pre-testing / the testing effect** (Roediger & Karpicke lineage) — why a first diagnostic
  BEFORE instruction is worth running at all even though the student will do badly.
Open question worth the research: does "instruction received" mean *exposure* (they saw the models)
or *demonstrated* competence (they scored above X)? Neil's rule currently says exposure — one
completed cycle. That is simpler and un-gameable; worth confirming it is also right.

---

## §2. RULES THAT MUST *NOT* FOLLOW §1 (recorded so the generalisation isn't over-applied)

- **The marking bar never softens for a beginner.** Sophicly marks STRICTER than examiners
  (grade 9 ≈ 85% vs the real ~75%) and marks what is actually there on a first diagnostic
  (`feedback_marking_stricter_than_examiners_ericsson`, `feedback_diagnostic_t1_mark_whats_there`).
  §1 governs how much we DEMAND and HELP — never how honestly we MEASURE. A lenient mark would
  falsify the baseline the whole programme is calibrated against.
- **Every attempt is saved and counts** (`feedback_grade_aggregation_hierarchy_max_then_avg`). §1
  does not license discarding a weak first attempt.

---

## §3. WHERE THE REST OF THE PEDAGOGY CURRENTLY LIVES (to be migrated in as it is touched)

Not a rewrite — the principles below are already recorded and working. Move one INTO this file when
you touch it, so migration follows real work rather than a big-bang pass:
- **Diagnostic TESTS, redraft TRAINS** — `feedback_diagnostic_tests_redraft_trains` (⭐ closely
  related to §1: it is the same distinction between measuring and teaching).
- Deliberate practice / granular marking → `feedback_granular_marking_rule`,
  `feedback_wml_mark_to_train_not_examiner_element_bands`.
- The student owns their ideas; never inject → `feedback_student_owns_ideas_no_injection`.
- Deep but never dragging (PACE) → `feedback_deep_but_never_dragging_pace_principle`.
- Notes depth scales inversely with text count → `feedback_cn_depth_scales_inverse_to_text_count`.
- Content derives from the protocols, never assumption →
  `feedback_student_content_derives_from_protocols_never_assume`.
- Easy wins first, then maintain challenge → `feedback_easy_wins_grade9_then_maintain_challenge`.
