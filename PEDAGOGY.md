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

## §0. ⭐ PROCEDURE — SEARCH FOR THE RULING BEFORE YOU ASK NEIL FOR IT (mandatory)

**THE RULE (Neil, 2026-07-15):** *"I think we should make it a procedure that you check before
asking, because I have said this before."*

He is right, and it was measurable: on 2026-07-14 he ruled that the outline gate is
structure-based (§4 below). On 2026-07-15 a handoff listed *"does `short_analysis` get an
outline?"* as an **open ruling needed from Neil**. It was not open. It had been answered a day
earlier and written down. He was asked to re-decide a settled question.

**THE REASON.** Neil's rulings are the scarcest input in this project — he is one person, and every
re-ask spends him on work already done and risks a *drifted* second answer that silently contradicts
the first. A ruling that gets re-asked is a ruling that was never really recorded.

**THE PROCEDURE — before ANY question to Neil that starts "should X…", "does X get…", "which
shape…", and before writing any handoff line that calls a ruling OPEN or NEEDED:**
1. **Search this file** — §4 onward is the rulings register.
2. **Search the memory directory** for the topic (`grep -rli "<topic>" ~/.claude/.../memory/`). Most
   pre-2026-07-15 rulings still live only there.
3. **Search the protocol** that governs it — `feedback_derive_from_protocol_dont_ask_what_is_documented`.
4. **Only if all three miss**, ask — and ask in the confirm form, never the open form:
   *"I checked X, found Y, confirm?"* — never *"what should we do about Y?"*
5. **When he does rule: write it HERE in the same session**, not only in a memory or a commit
   message. A ruling recorded only in memory did not survive one day (§4 is the proof).

**THE ROOT CAUSE this prevents.** The 07-14 ruling was recorded in a memory file
(`reference_wml_outline_gate_20plus_marks`) and nowhere else. The docs that govern this arc —
this file and `ASSESSMENT-MECHANICS.md` — never carried it, so the next session read the *code*,
saw a marks-based gate, and concluded the question was open. **Memory is a recall aid; the .md
files are the law.** Same failure this whole document exists to prevent (see "Why this document
exists" above) — a rule with no home gets re-derived wrongly.

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

## §3. AN OUTLINE IS EARNED BY STRUCTURE, NEVER BY MARKS — the outline gate

**THE RULE (Neil, ruled 2026-07-14, re-stated verbatim 2026-07-15):**

> *"Any response that requires at least a paragraph structure needs an outline."*

And its inverse:

> *"Some of the questions require one simple statement. Some require two, some require three. Those
> ones, we're not gonna teach them anything about that, because that's basic comprehension that they
> either get right or they get wrong. It's not a technique as such."*

**MARKS ARE NOT THE CRITERION — this is the whole point of the rule.** Neil's own worked example:
**AQA Language Paper 2 Question 2 is only 8 marks but requires two structured paragraphs, so it gets
an outline.** Meanwhile AQA Language Paper 1 Q1 (4 marks, four simple statements) and AQA Language
Paper 2 Q1 (choose four true statements) get **none** — *"we don't need to give them a structure for
that. It's just four simple statements, that's it."* A marks threshold in either direction is the
wrong instrument; the question is only ever **"does answering this require the student to build a
paragraph?"**

**THE REASON — two distinct halves, and both matter:**
- **Structured questions get an outline** because structure is the thing we teach. The student sees
  and trains the SAME structure across planning → outlining → polishing
  (`reference_wml_planning_outline_response_lesson_flow`). An outline is the protocol's structure
  made fillable.
- **Comprehension questions get none** because *"they either get it right or they get wrong"* — there
  is no technique to train, so there is nothing an outline could teach. Neil's pedagogy for these is
  **self-testing**: *"we can afford to let them test themselves on that, because they either get it
  right or wrong. If they get it right, then that shows the comprehension is at least basic. If they
  get it wrong, then they just have to go and correct it."* Scaffolding a right/wrong retrieval
  question would train nothing and cost time. (Consistent with §1 — help is given where it teaches.)

**WHY THE OLD MARKS GATE EXISTED, AND WHY IT IS DEAD.** The original `qMarks >= 20` ceiling was a
TIME/FRICTION decision, never a pedagogical one: an outline per question used to force students to
copy-paste plan content by hand, so scaffolding short questions cost more than it was worth. **That
friction has been engineered away** — plan elements now auto-transfer (plan→outline autofill,
outline→response transfer). Students must convert their plan into full sentences anyway; doing it
INSIDE the outline adds structure-training at no extra time cost. The constraint that justified the
threshold is gone, so the threshold is gone. **Any marks-based outline gate found in the code is a
defect, not a spec.**

**THE PER-QUESTION MAP (AQA — ruled 2026-07-14, CORRECTED AGAINST THE PROTOCOL 2026-07-15):**
- **Skip (no structure to train):** AQA P1 Q1 (4m, list) · AQA P2 Q1 (true/false comprehension —
  `protocol-b-planning.md:144` excludes it from planning outright).
- **Body-only TTECEA outline:** P1 Q2 · P1 Q3 · P2 Q3 (3 × TTECEA, `protocol-b-planning.md:364-410`).
- **P2 Q2 — PAIRED CROSS-SOURCE INFERENCE, not TTECEA and NOT "synthesis".**
  2 paragraphs, each weaving BOTH sources: Inference 1 (Source A) → Inference 2 (Source B, opening
  with a comparative discourse marker). Each inference = topic sentence + perceptive inference +
  detail + embedded quote. `protocol-b-planning.md:157, :244-247`. The protocol is explicit:
  *"Never write one paragraph about Source A and a second about Source B."*
  ⚠️ **CORRECTION, 2026-07-15.** Until today this line read *"synthesis shape (Topic sentence ·
  Quote · Inference); pull the exact shape from the synthesis protocol."* **Both halves were false:**
  the protocol never uses the word "synthesis", and **no synthesis protocol exists** — the
  instruction was unfollowable. The error came from the 07-14 memory and was copied into this file
  unverified. It is the exact failure §0 exists to stop, in the file that stops it. **Rulings get
  byte-checked against the protocol before they are written down as law**
  (`feedback_never_guess_verify_the_real_answer`).
- **Full essay outline:** P1 Q4 · P2 Q4 — brief intro + 3 comparative bodies + brief conclusion
  (bodies carry 15 of the 16 marks; `protocol-b-planning.md:442-531`).
- **Writing questions:** P1 Q5 = the scene-structure plan IS the outline · P2 Q5 = IUMVCC.

**⭐ THE ONE SHAPE-EXCEPTION — Section B fiction / narrative (Neil, re-stated 2026-07-16).** "Every
question that needs at least a paragraph structure needs an outline" holds for every analytical /
transactional question — BUT Section B of the fiction Language papers (the STORY / creative narrative,
e.g. AQA P1 Q5) is the exception to the *paragraph-outline* shape. A story is not built from
TTECEA/IUMVCC paragraphs, so its "outline" is a **narrative plan — the story-spine / scene-structure
plot skeleton** (canonical: the Pixar-style story spine, `reference_cw_story_spine_canonical_pixar_six_beat`;
Neil also calls it the "seven-step scene structure" — confirm which granularity the CW build uses before
wiring, do not assert a beat count). It IS still an outline in the lesson-flow sense (planning →
outlining → polishing all work the same skeleton), just a plot skeleton rather than a paragraph one.
Creative writing is a SEPARATE build (out of scope of `_resolveBodyOnlyOutline`, cannot reuse TTECEA —
see below).

**WHAT IT GOVERNS.** `_resolveBodyOnlyOutline()` and `migrateMissingQOutlines()`
(`frontend/wml-assessment.js`) — the gate deciding which questions build an outline — **for every
board and paper, literature included** (Neil, 2026-07-15: *"We need to do it for ALL of the exam
boards. Everything, basically. Even for literature."*). Creative writing is explicitly out of scope
(separate build, Pixar six-beat spine, cannot reuse TTECEA).

**STATUS: ⚠️ IMPLEMENTED WRONG — live defect.** `_resolveBodyOnlyOutline` still enforces
`board !== 'aqa' → null`, `_specSubjectKey() !== 'language_p1' → null`, and the dead
`qMarks < 20` ceiling. So no board except AQA Language Paper 1 can ever get a per-question outline,
and AQA P2 Q2 (8m, two paragraphs — the rule's own worked example) is excluded twice over. The gate
must resolve to the CAPABILITY *"does this question require a multi-paragraph structured response?"*,
derived from `protocols/shared/language-paper-specs.json` — **never accumulate board arms**
(CLAUDE.md canvas rule 2). Literature and Section B outlines are ALREADY board-agnostic because they
read the specs — that is the proof the capability approach works; copy it, don't invent it.

**⭐⭐ THE MARK SCHEME IS THE AUTHORITY ON MARKS AND OBJECTIVES — NOT the spec file, NOT the
protocol, NOT the structure map (Neil, 2026-08-16).** Verbatim: *"it's not really about what the spec
file says. It's what the mark scheme says. If you don't know that, you've got it documented
somewhere. Right? If the spec file says something about assessment objectives, but the mark scheme
says something else, we have to go with the mark scheme, and we have to adjust accordingly. We can't
make up the rules."*

**THE ORDER OF AUTHORITY, and it is not negotiable:** the board's own **mark scheme PDF** → the real
past paper → everything we have written about it. Our spec JSON, our protocol files and our
structure map are all *claims about* the mark scheme; when a claim disagrees with the source, the
source wins and OUR FILE IS THE DEFECT. (This overrides, for marks and AOs specifically, the older
"protocol-a-assessment.md is canonical" line — that rule settles what we TEACH, never what the board
AWARDS.)

**AND THE MARK SCHEMES ARE ON THE SYSTEM — FIND THEM, NEVER ASK AND NEVER ASSUME.**
`mdfind -name "<paper code>"` locates them in seconds; the Sophicly copies live under
`sophicly-etchwp-package v2.6/Sophicly Etch Mark Scheme Resources/`, and `pdftotext -layout` reads
them. ([[reference_source_texts_and_extracts_on_system_search_never_ask]],
[[feedback_mdfind_first_and_a_killed_search_is_not_a_zero]].)

**⭐ THE PROOF, and it is why this needed a ruling rather than a preference.** On Edexcel IGCSE Lang
P1 (4EA1/01) our two internal sources disagreed, and **each was half wrong** — so believing either
one alone gave a broken paper:

| | Q2 marks | Q3 marks | Q3 objectives |
|---|---|---|---|
| **Mark scheme (June 2022, authority)** | **4** | **5** | **AO1 only** |
| our spec JSON | ✅ 4 | ✅ 5 | ❌ AO1+AO2 |
| our live protocol | ❌ 3 | ❌ 6 | ✅ AO1 only |

⚠️ **A TOTALS CHECK CANNOT CATCH THIS** — 2+3+6+12+22 and 2+4+5+12+22 both sum to 45, which is
exactly why an earlier audit accepted the wrong tariffs and recorded them as canonical. Only the
mark scheme discriminates. **Never validate a tariff set by checking that it adds up.**
(Fixed 2026-08-16: protocol Q2 → /4, Q3 → /5 with its sentence-count gate, spec JSON Q3 → AO1.)

**⚠️ THE QUESTION WORDING ROTATES BETWEEN SITTINGS — THE TARIFFS AND OBJECTIVES DO NOT.** June 2022's
Q2 asks for thoughts and feelings and Q3 for a description of an argument; June 2024's Q2 asks "in
your own words, describe what happens" and Q3 for thoughts and feelings. **Never key a protocol on
the wording of one paper** — key it on the question NUMBER, its tariff and its objective.

**⚠️ STILL GENUINELY OPEN (§0 applied — these are not re-asks; the protocol does not settle them):**
- ~~**How GRANULAR should an outline row be?**~~ — **⭐⭐ RULED, 2026-08-16. CLOSED. Do not re-ask,
  do not re-derive it per paper.** The question was put to Neil on the Edexcel IGCSE port, where a
  mark scheme itemises **8** criteria for a paragraph the outline renders in **6** boxes (IGCSE
  Lang P1 Q4 splits technique / quote / inference into three half-marks where TTECEA fuses them
  into one box; IGCSE Lang P2 Q1 itemises **10**). **The ruling: the student fills the SAME SIX
  BOXES on every paper, every board** — Topic Sentence · Technique + Evidence + Inference · Close
  Analysis · Effect 1 · Effect 2 · Author's Purpose (+ Context where the question assesses AO3).
  **A MARK-SCHEME CRITERION IS A MARKING GRANULARITY, NOT A WRITING ONE.** The paper is still
  marked against all 8 (or 10) of its own criteria — what does not change is the set of boxes the
  student fills in while planning.
  **THE REASON, and it is why this generalises past IGCSE:** the boxes are the unit of TRANSFER.
  A student who has learned one six-sentence paragraph shape carries it into every paper they sit;
  re-cutting the boxes per board teaches the mark scheme's filing system instead of the skill
  (`feedback_teach_to_the_mark_scheme_not_in_its_language`). It also keeps ONE shared row set
  (`OUTLINE_CRITERIA.literature`) rather than a per-paper set that drifts — the exact failure the
  shared spine exists to prevent. Consistent with §3c (a comparative body is TTECEA; the
  comparison lives in the HELPER TEXT, not in extra rows) and with all five shipped ports, which
  already do this. **Where a paper's mark scheme names something the six boxes do not** (IGCSE P2
  Q1's "technique interplay", "strategic selection of quotes"), it is taught in the box's HELPER
  TEXT and marked in assessment — never given a box of its own. Weigh against PACE
  (`feedback_deep_but_never_dragging_pace_principle`), which the ruling also serves.
- ~~**`comparison` BODY rows**~~ — **RULED, 2026-07-15. NOT open, and never was the design question
  this doc called it.** See §3c.
- **Multi-AO questions** (IGCSE P1 Q3 = AO1+AO2) — the machinery stamps ONE AO onto every row, so
  multi-AO is a shape question, not a gate flag.

---

## §3c. A COMPARATIVE BODY IS TTECEA. THE COMPARISON LIVES IN THE HELPER TEXT

**THE RULING (Neil, 2026-07-15, verbatim):**

> *"The comparative body or comparative rows are actually a lot simpler. They still follow the same
> TTECEA structure. And actually, the comparisons need to be integrated, so it's still the same
> structure. The only thing that would change with the comparative body or comparative rows is in
> the helper text. We just remind the students to integrate the comparisons. That's all."*

**VERIFIED AGAINST THE PROTOCOL BEFORE RECORDING** (`protocol-b-planning.md:468-498`, beats 5–9 per
aspect). The protocol's own labels are **T → T+E+I → C → E → A**. That IS TTECEA. Neil is right and
this document was wrong: an earlier revision listed those five elements correctly and still concluded
"a different row set from the literature body's six", which does not follow from its own evidence.
**A comparative body reuses the SAME six rows.** Applies to AQA Lang P2 Q4 (16m AO3) and Edexcel
IGCSE P1 Q5 (22m AO3), and is expected to serve the unseen-poetry comparison variants too.

**What "integrated" means, and why it is a helper-text rule rather than a row rule.** The comparison
is not a seventh element bolted on the end — it is a MOVE INSIDE each element, which is exactly why
adding rows for it would teach the wrong thing:
- **T** — A's concept → B's concept → *integrate*: "Both sources explore [aspect], yet A suggests…
  whereas B emphasises…". Never "Source A does X. Source B does Y." with no relationship (`:469-475`).
- **T+E+I** — both sources, then: "A chose [technique]; B chose [technique]. What does that CHOICE
  reveal?" (`:476-480`).
- **C** — a detail in EACH source, each bridged micro-to-macro, then the contrast (`:481-485`).
- **E** — the four-fold sequence for EACH source, then "A creates [effect] while B creates
  [effect]…" (`:486-494`). **ONE effect per source, two per paragraph** — see below.
- **A** — each writer's purpose, the explicit purpose-comparison as its own move, then the
  JUDGEMENT that earns the top band: "which writer's approach is more effective?" (`:491-498`).

**⭐ THE EFFECT ROWS — ONE EFFECT PER TEXT (Neil, 2026-07-15, ruled directly):**

> *"Because we ask the students to write two, and because they've got two texts — it's actually one
> effect per text. So it still becomes two, but one per text rather than two per text, per
> paragraph."*

So the two effect rows are kept, and what changes is what each one MEANS:

| row id (never changes) | single-source body | comparative body |
|---|---|---|
| `effects` | Effect 1 on Reader | **Effect on Reader — Source A** |
| `effects2` | Effect 2 on Reader | **Effect on Reader — Source B** |

**The count is identical (two); the second slot buys the COMPARISON instead of a second effect on
the same text.** That is the ruling's logic and it is why "same structure, only helper text" holds
all the way down — the rows do not even change in number, only in label.

**⚠️ THIS OVERRODE THE PROTOCOL, which taught the opposite.** `protocol-b-planning.md:486-488` read
*"two distinct effect sentences — four in total per paragraph"*. Under this ruling that is a DEFECT,
and it was corrected in the same session (the four-fold sequence — focus/emotions/thoughts/action —
is the ANALYSIS the student runs and was left alone; it was never a sentence count). AQA Lang P2 was
the only protocol carrying the claim — grepped, not assumed.

**JUDGEMENT rides in the A row's helper text**, not a new row — same reason: a seventh row would
break the structure the ruling preserves.

**Implementation:** this is the `v7.20.107` FOCUS-OVERLAY pattern, already built and shipped — it
swaps a row's label/prompt/items while **ids never change**, so a reword can never drift a write-key.
Comparative is another `focus` value, opted in via the spec's `focus` field, never a Q-id literal.

**Consequence: Q4 is NOT blocked and needs no design session.** This was logged as *"the one real
design question in the arc"* and as a Fable candidate. It was neither. What it needed was reading the
protocol's own element labels.

---

## §3b. THE SCAFFOLD DEMANDS EXACTLY WHAT THE PROTOCOL TEACHES — never more, never fewer

**THE RULE (derived from the protocols, not asked; recorded 2026-07-15 with the six IUMVCC rows):**

> Where a protocol plans a **RANGE**, the scaffold must let the student sit anywhere in it. Where a
> protocol names **exactly one**, the scaffold must permit exactly one. The control's SHAPE is a
> teaching act — it silently states what we demand.

**The worked case.** `protocol-b-planning.md:648` plans the Methodology as *"their 2–3 distinct
points"* — the count is **the student's**, chosen from their argument. So the outline bakes three
point rows and marks the **third `optional: true`**: a two-point argument completes its section, a
three-point argument has somewhere to write. Baking three REQUIRED rows would demand a point the
protocol never demands (and, because a section needs every row filled, would leave a perfectly good
two-point essay showing a permanently incomplete Methodology). Baking two would leave the
three-point student nowhere. **Neither failure is visible to us — only to the student.**

**The same rule, the other direction — `choice` vs a dropdown is pedagogy, not UX.** Where the
protocol says an element **LAYERS** ("professional writers layer 2–3 openers — invite the layer,
never force it" `:607`; rebuttal technique "layerable" `:676`; closing approach "layerable" `:689`)
the control is a **checklist with `choice: true`**. Where it names **ONE** ("ONE named emotional
appeal" `:646`; "a named TONE" `:672`; the organisation choice `:656`) the control is a
**dropdown** — the shape makes the teaching un-ignorable, so a student cannot tick four tones and
learn that tone is a pick-and-mix. Reach for the option-set the protocol offers **at that section**:
IUMVCC's Counter-argument teaches *rebuttal techniques* and its Conclusion teaches *closing
approaches*, so neither gets the MADFATHER'S CROPS device picker — that would teach a vocabulary the
protocol never offers there (`feedback_student_content_derives_from_protocols_never_assume`).

**Engine:** `optional` lives in `WML.outlineRow.complete` (wml-core.js) — empty ⇒ satisfied,
**started ⇒ finish it** (its controls become required the moment it has text). Distinct from
`locked` (a read-only carryover, satisfied either way). See ASSESSMENT-MECHANICS.md §3.

---

## §4. WE TEACH TO THE MARK SCHEME — WE DO NOT TEACH IN ITS LANGUAGE

**THE RULE (Neil, 2026-07-15, verbatim):**

> *"We don't always use exactly the same language as the mark scheme. What we're teaching them is how
> to GET TO the thing that the mark scheme is asking for — like 'sustained crafting of linguistic
> devices'. That's why we're trying to make them aggressive in terms of using multiple linguistic
> devices per sentence if possible, at least one."*

**THE REASON.** A mark-scheme descriptor is a **judgement an examiner makes about a finished piece**,
not an instruction a 15-year-old can act on. *"Sustained crafting of linguistic devices"* tells a
student nothing they can DO. *"At least one device per sentence — better, two or three combined"* is
the same thing as a habit they can practise, and practising it is what produces the descriptor.
**The protocol teaches the ACTION; the mark scheme names the RESULT.**

**WHERE EACH LAYER LIVES — verified 2026-07-15, and it is already right in the codebase:**
- **The descriptor lives in the MARKING modules**, because marking is where the criteria belong:
  `aqa/language2/modules/assessment-steps/a-q5-ao5.md:11` and
  `aqa/language2/modules/knowledge-mark-scheme-lang2.md:184` both carry AQA's Level 4 AO5 verbatim —
  *"Extensive and ambitious vocabulary with sustained crafting of linguistic devices."* Eleven files
  carry it in total, including the MSQ/MSA banks.
- **The habit lives in the PLANNING protocol**, which never uses the phrase — it teaches the image
  first, then the devices that deliver it (`protocol-b-planning.md:619-627`).
- **The bridge is written down**, and it is exactly Neil's rule made explicit:
  `edexcel-igcse/language1/modules/knowledge-hub.md:277` reads *"**Sustained Crafting of Linguistic
  Devices:** Employs a range of techniques in a deliberate and controlled manner. **Refer to the
  MADFATHER'S CROPS mnemonic.**"* Descriptor → habit, in one line.

**So the rule is: the descriptor belongs in MARKING; student-facing TEACHING states the habit.** Both
must exist; they must not be swapped.

**⚠️ THE TRAP — do not "fix" a descriptor's absence from a teaching surface.** Finding no
mark-scheme wording in a planning protocol is not a gap; it is the design. Ask *what concrete habit
produces this?* and check THAT is present.
**⚠️ AND DO NOT MANUFACTURE THE ABSENCE EITHER.** 2026-07-15, in this file, on the same day it was
written: I grepped for "sustained crafting", **piped the results through `head -10`**, saw only
Edexcel IGCSE hits, and concluded the phrase was deliberately absent from AQA — then wrote that
conclusion HERE as this section's proof. It was false: the AQA hits were below the truncation. **A
truncated search is not evidence of absence.** For any "X does not exist in the codebase" claim:
never `head` the search, count the hits (`grep -rc`), and state the exact command you ran.
(`feedback_never_guess_verify_the_real_answer` — the failure mode is not laziness, it is a search
that answered a narrower question than the one being asked.)

**THE CANONICAL EXAMPLE:**

| Layer | Wording |
|---|---|
| Official AQA AO5 mark scheme | "sustained crafting of linguistic devices" |
| What we tell the student | at least one technique per sentence — better, combine two or three |
| The tool that makes it doable | MAD FATHERS CROPS (15 taught-core devices) + the 245-entry table |
| Where it lands in the product | the technique picker, on **every** section of the IUMVCC outline |

**WHAT IT GOVERNS:** every protocol beat, outline row, prompt, checklist and chip that a student
reads. Translate DOWN to an observable action; never paste a descriptor into student-facing text and
call it teaching.

**WHAT IT DOES *NOT* LICENSE:** inventing mark-scheme claims. The descriptor is still the target and
must be real (`feedback_never_invent_mark_scheme_claims`). This rule governs the LANGUAGE we teach
in, never the accuracy of what we aim at — marking output still uses the real AO criteria. And per
§2, the training load sits deliberately ABOVE the descriptor's floor: "sustained" is the pass; one to
three devices in every sentence is the practice.

**STATUS: ✅ the pedagogy is live** (the protocols already teach this way). **🔵 the tooling is not** —
the IUMVCC outline currently gives the student no way to record the techniques they used. See §3's
open granularity question and the technique-picker build.

---

## §6. A SECTION IS EDITABLE ONLY IN ITS AUTHORING LESSON — the section-freeze law (Neil 2026-07-17)

**Principle:** a document section is editable ONLY in the lesson(s) where the student *authors* it.
In every DOWNSTREAM lesson of that phase it is a frozen, read-only snapshot the student can still
COMMENT on but not TYPE into. Keyed on **lesson role** (is this the authoring lesson for this
section?), NOT on phase number, NOT on a global flag. Follows the forward-snapshot doc chain
(`feedback_wml_forward_snapshot_doc_chain`).

| Section | Editable in | Frozen (read-only + comment-only) in |
|---|---|---|
| **Plan** | P1: Diagnostic · P2: Planning | all lessons after the authoring lesson |
| **Outline + Response** | Outlining + Polishing lessons | Assessment → Discuss/Mark/Feedback |
| **Keyword / Prediction** | editable everywhere it appears (incl. P2 Planning lesson) | — never frozen |

- **Why plan is free in P1 Diagnostic but protocol-authored in P2 Planning:** the diagnostic TESTS
  the student's own planning (they must plan unaided → editable); the redraft TRAINS via the Socratic
  planning protocol which autofills it (`feedback_diagnostic_tests_redraft_trains`). Both are still
  "the authoring lesson" for the plan in their phase — same law, different author.
- **From Assessment onward the WHOLE doc is frozen** (plan, outline, response) — read-only snapshot +
  comment marks only. You mark and discuss a fixed artefact; you do not retroactively edit what was
  assessed.
- **Keyword/Prediction is exempt** — it does not count toward the grade, it only primes thinking, so
  leave it editable wherever it shows (Neil: "not a big deal").
- **Mechanism (two distinct gates):** (1) CROSS-LESSON freeze needs no persisted flag — a downstream
  lesson simply isn't the authoring lesson, so it renders the section read-only by lesson identity.
  (2) INTRA-LESSON submit-lock is needed ONLY in the P2 Planning lesson (AI offers a final edit →
  student submits → plan locks even while still inside that lesson) → ONE persisted "plan submitted"
  flag, P2-planning-only. Autofill (`@FIELD_COMMIT`, a PM transaction) still writes after lock;
  contenteditable=false blocks only TYPING. Same lock mechanism as the .166 statement-lock. This is
  the build spec for handoff §4b.

---

## §6b. THE DISCUSS/MARK/FEEDBACK LESSON — one editable slot, no transfer buttons (Neil 2026-07-18)

Refines §6 for the terminal discuss-feedback lessons (e.g. "Discuss Your Feedback with Your Tutor").
These sit AFTER assessment → the whole doc is frozen by §6. Three additional rules:

1. **No transfer buttons anywhere in a freeze lesson.** Per-section "↓" transfer AND "TRANSFER ALL"
   are hidden in discuss/mark/feedback lessons — there is no downstream section to transfer INTO, so
   they are meaningless there. (Screenshot proof 2026-07-18: they still rendered on the Macbeth
   Discuss-Feedback lesson.)
2. **EVERY section is frozen — including the FEEDBACK section.** No exception. Nothing in a
   discuss-feedback lesson is typeable except the one slot in rule 3.
3. **An optional tutor free-comment input, placed just ABOVE the tutor sign-off area.** For a tutor
   to write a closing summary before signing off. (Comments-on-frozen-sections still work everywhere —
   freezing blocks TYPING into the section body, not commenting.) Design (Neil 2026-07-18, refined):
   - **EVERYWHERE the tutor sign-off renders — not feedback_discussion-only** (Neil 2026-07-18,
     broadened). The sign-off is appended to the doc in every terminal/frozen lesson (assessment,
     redraft_assessment, feedback_discussion), so the rule is simply: **wherever there is a sign-off,
     there is an optional tutor-comment box just above it.** One mechanism, no per-lesson special case.
   - **Editable by TUTOR / ADMIN / SSS only; parents + students see it READ-ONLY.** Reuse the exact
     sign-off audience: server write route gated by `check_tutor_auth`
     (`class-rest-api.php:792` — passes admin=manage_options, att_role tutor|specialist, sophicly_role
     sss; rejects parents/students), edit UI gated by the same `config.canSignOff` flag the sign-off
     uses. No new permission logic.
   - **Tutor-authored; PERSISTS; visible read-only to EVERY viewer** — student AND parent AND anyone
     who opens the page sees what the tutor wrote. NOT a private scratch field: durable, shared
     feedback. **Mirror the tutor SIGN-OFF persistence path** (tutor authors → persists to a durable
     `user_meta` sidecar keyed `canvas_meta_key(...) + '_tutorcomment'` → renders for all viewers via
     the NodeView, refetched on every load regardless of viewerMode), NOT canvas-autosave from the
     tutor's share-view (which may not write back to the student's canvas record — key-match risk).
     Same requirement as sign-off ⇒ same proven mechanism (`_signoff` sidecar is the template).

- **Outline in a discuss-feedback lesson is PHASE-SCOPED — absence in Phase 1 is CORRECT, not a bug
  (verified + confirmed by Neil 2026-07-18).** Phase 1 = diagnostic = "write cold" = plan + response
  only, NO outline (the outline is a Phase-2 redraft construct). The `_fbdiscuss` doc reseeds forward
  from the Phase-1 diagnostic/assessment docs (v7.19.855 forward-snapshot fix — deliberately prevents
  Phase-2 outlines leaking backward into Phase 1). So the **Phase-1 Discuss-Feedback correctly shows
  NO outline**; the **Phase-2 (Redraft/reassessment) Discuss-Feedback correctly DOES** (it reseeds from
  the outline-bearing Phase-2 docs). Neil's "missing outline on Macbeth" was him viewing the Phase-1
  lesson by mistake — Phase 2 has it. Do NOT "fix" this by injecting an outline into the Phase-1
  discuss lesson — that contradicts diagnostic=write-cold. (Root trace: mode resolves 'diagnostic' for
  feedback_discussion, `_buildDocumentTemplate` emits OUTLINE only under `mode==='redraft'`;
  `seed_from_sibling_stage` walks back to `_assessment`/diagnostic.)
- **REAFFIRMED by Neil, 2026-10-10 (FIXLIST #862), verbatim:** *"diagnostics should always have planning and
  response area for both language and literature, please."* A numbered-topic diagnostic gets ESSAY PLAN + RESPONSE
  however it is opened — embedded lesson, tutor review (`view_as`), or the standalone deep link. The plan was being
  dropped because those two entry paths set `state.mode = 'exam_prep'` and the template chooser read that as free
  practice. Since v7.20.807 ONE resolver (`_docTemplateMode`, wml-assessment.js) decides: the question + response
  template belongs to FREE practice only (no topic). Gate: `bin/doc-template-mode-harness.js`.

---

## §7. THE CONTINGENT SCAFFOLDING LADDER — research-grounded rulings (Neil 2026-07-18)

The planning/assessment help ladder (open prompt → focused hint → strategy/lens menu → worked model).
Full design: `PLANNING-PROTOCOL-AUDIT-AND-PLAN-2026-07-18.md` §2/§9/§11. These are the SETTLED
rulings; the research backing each is in `research/2026-07-18-*.md`.

7. **THE LADDER IS SETTLED (Neil 2026-07-18, all 14 decisions — decision sheet A1–E2).** Four
   rungs: open prompt → focused hint → lens menu (three ANGLES, never readings) → worked model on an
   UNRELATED instance which the student then applies to their own material (their application files).
   One rung per genuine failed attempt; every failed turn visibly changes the help; ceiling ~4 turns,
   typical ≤2. The rung a student rests at IS the differentiation — never pre-label ability (grade 7
   lives at L1; grades 4–6 resolve L1→L2; grades 1–3 produce via recognition/completion at L3/L4,
   every time). **Every model shown MUST meet our gold-standard criteria** — a model is exemplary or
   it is not a model. Full operating contract: `PROTOCOL-STANDARD.md` C-LADDER.
   **WHY:** contingent-shift + the assistance dilemma (Wood & Middleton; Koedinger & Aleven — mid-level
   partial support beats both extremes); completion effect for the floor (Renkl, van Merriënboer);
   expertise-reversal for the ceiling (Kalyuga). Research:
   `research/2026-07-18-scaffolding-escalation-and-socratic-tutoring.md`.
7b. **THREE REGIMES, PRECEDENCE WRONG → FAILED → WEAK/RESOLVED.** WRONG = falsifiable error only
   (misread · false fact · misidentified technique): 3-part wise-framed correction, free, no climb;
   interpretations are never wrong — only their grounding is challenged. FAILED = non-engagement
   (nothing ownable) — the only regime that climbs. WEAK-but-owned = one Socratic push then accept +
   file; never enters the ladder. "Incorrect" is `wrong` or `weak`, never `failed`. **WHY:** accepting
   a genuine error teaches the error (Shute; hypercorrection — Butterfield & Metcalfe); escalating an
   owned answer wears the student down (the one-push law, settled).
7c. **HELP ECONOMY (supersedes the old item 2 numbers — do not re-derive from them).** ONE shared
   code-counted content-insight WALLET (system-push + student-pull draw from the same pool):
   per-question sub-cap **1**, per-paper ceiling **4** (Neil's call — the audit doc's "3" is
   overridden). **L4 method models are NOT wallet items: uncapped, earned-only, one per element, never
   refused** (the unit is the ELEMENT, and refusing an earned model would starve exactly the student
   who needs it most). Struggle menu on failure only: Explain further (free, once per rung) · Ask me
   more questions (free) · Expert insight (spends). The menu feeds the rung; only contingent shift
   moves it. Budgets are code-counted, never LLM-self-counted; **build the numbers TUNABLE, not
   hard-coded.** Log ladder depth reached per question as a help-seeking signal.
7d. **FADE, PACE, RESUME.** Fade is per element-TYPE; from paragraph 2 the first hint is the student's
   own paragraph-1 version (zero-injection self-worked-example); redraft hints reach for the student's
   own Planning Targets first (§1 — help calibrated to instruction received). Pace valve: ~3 elements
   of a question resolved at L3+ → later elements open at L2. Resume: restart the element at L1 (L2
   only if a filed same-type sibling in THIS doc resolved at ≥L3), never mid-ladder.
7e. **THE OWNERSHIP PRINCIPLE (the line all of it reduces to).** The student owns every interpretive
   claim about this text. The tutor may freely supply METHOD (hints, lenses, models on unrelated
   material) and verifiable FACT (including correcting false facts); the tutor may NEVER supply a
   READING, and may challenge a reading only through its GROUNDING. L3 menus name a DIRECTION ("the
   writer's attitude"), never CONTENT ("the writer's bitterness"). The fact-delivery guard: a supplied
   fact never states the inference it licenses about the live quotation.
7f. **KNOWLEDGE IS A PARALLEL TRACK, NOT A RUNG.** Ask-first → insight → Library reading → derive runs
   as pre-training at question/text open, outside the ladder's turn ceiling (detail in item 7h below).
   For v1, post-pre-training mid-element failures are METHOD failures (the ladder); knowledge
   resurfaces mid-element only as a WRONG-correction or a spent insight. (Kintsch: no lens fixes a
   missing situation model; Mayer: pre-train before the reasoning step.)
7g. **Ungrounded interpretation = no analytical (AO2) credit for the move, PLUS a small −0.5 awareness
   penalty with a grounding fix-example.** *(This is the ASSESSMENT-side twin of 7b/7e's grounding
   rule: in planning we challenge the grounding of a live reading; in marking, an ungrounded reading
   carries this penalty.)* Matches real examiner practice (AO1 requires textual
   reference; AO2 requires analysis of method; boards credit *alternative* readings only when
   textually supported; unsupported assertion caps the band). **Neil's rationale for the small
   penalty:** even where the mark scheme applies no formal deduction, expert examiners *subconsciously*
   mark down ungrounded writing — the −0.5 translates that into something quantitative the student can
   see; its purpose is AWARENESS. **Never return a bare "no marks":** name it unsupported, point to
   where evidence could come from, show a one-line grounded version of the student's OWN idea (fits the
   universal "every penalty carries a fix-example" rule). **Distinguish ungrounded from wrong:**
   supported-but-debatable = valid alternative, credit it; gate = "is there evidence?", not "do I
   agree?". Existing penalty registry has no dedicated code — closest is **I1 (imprecise/underdeveloped
   interpretation, −0.5)**; widen I1's detection or add a dedicated code at build.
7h. **Context/background knowledge = ask-first → build → gate-the-output (text-agnostic).** *(This is
   the parallel KNOWLEDGE track of 7f — the full mechanism + AO3 output-gate.)* The real
   principle (Neil): students lack DEPTH, BREADTH and NUANCE of contextual knowledge for ANY text; the
   system must build it — for anything in the curriculum, not one worked example. Mechanism: (a)
   ACTIVATE — Sophia asks what they already know (elaborative interrogation; Ausubel, Fiorella & Mayer);
   (b) PRE-TRAIN — give the missing facts + connections, then the student generates the link to the text
   themselves (ownership law; Mayer pre-training); (c) GATE OUTPUT BY AO3 — context OUTPUTS into the
   scored plan only when the exam assesses it (AO3); when not assessed, still BUILT to fuel AO1/AO2
   inference but NOT written as a scored element (crediting unassessed context = construct-irrelevant
   variance, Messick). The gate DERIVES from the question's AO map, not a per-protocol hand-wire.
7i. **Prompt the student to review their PREVIOUS ASSESSMENT — timed per element (Neil 2026-07-18).**
   Students have access to prior assessments. The protocol reminds them to check last time's feedback —
   strengths, weaknesses, what they said they'd improve — AT THE RIGHT MOMENT: if they were weak on
   context last time, the "check what your tutor said about context" prompt fires AT the context step,
   not as a generic upfront reminder. Closing the feedback loop = self-regulated learning. Wires to the
   prior-feedback data the dashboard already holds.
7j. **Keep this research portable for the CREATIVE-WRITING protocols (Neil 2026-07-18).** The same ladder
   + ownership + grounding principles must carry into the Creative Writing course and Lang P2
   nonfiction/fiction when those protocols are built — they need their own depth, not a thin port. Do
   NOT assume the analytical-essay shape transfers verbatim; re-derive per the CW protocol (the doc
   lifecycle's CW lane is still TBD, per WML CLAUDE.md).

7k. **NO-PLAN QUESTIONS ARE TRANSPARENT — the student is TOLD coaching is withheld by design (Neil
   2026-07-18).** The simple retrieval questions (AQA Lang P1 Q1 "list four", P2 Q1 true-statements,
   and every true-false / mark-per-statement / short-retrieval / MCQ across boards) get NO planning
   protocol — right-or-wrong recall we do not train (§1 — help ∝ instruction received; the
   doc-lifecycle SKIP-plan set). A short static note on these questions tells the student to answer to
   the best of their ability, that we do not coach the method here, and that it is assessed later — so
   the ABSENCE of scaffolding reads as design, not a gap. Capability-derived (the `multiple_choice` +
   `retrieval≤5` template branches in `buildMultiQuestionTemplate`), never a per-question hand-list;
   shown only in the answering env (`.swml-noplan-note`, hidden in the marking view where "not marked
   now" would be false). Impl v7.20.204.

7l. **L4 WORKED MODELS DRAW ON REAL CURRICULUM MATERIAL — NEVER INVENTED (Neil 2026-07-21).** The
   rung-4 model is shown on an UNRELATED instance (§7/§7e) so it never hands the student their own
   answer — but "unrelated" means a DIFFERENT **real** text, not a fabricated one. When the curriculum
   already holds abundant usable material, inventing a model is the wrong default: real exemplars are
   richer, truer to the exam, and if a student later recalls one across the course's time-lapse that is
   a LEARNING GAIN, not leakage.
   - **Poetry:** L4 = a DIFFERENT anthology poem (any poem other than today's two being compared). NO
     exclusion guard needed — Neil 2026-07-21: the time-lapse before they meet that poem in their own
     comparison makes recall a feature, not pre-emption ("if they can recall it, it's probably a good
     thing").
   - **Set texts (lit):** modelling on the student's OWN set text IS the answer, so the unrelated
     instance must be another REAL text the course teaches (a different author / extract / poem), NOT an
     invented tale.
   - **The only hard line:** never model on TODAY's exact live material (that = injection). Any other
     real curriculum instance is fair game.
   - ⚠ **DEBT — retrofit lit off invented models.** AQA Literature currently INVENTS its L4 models (the
     "Clockmaker tale" + M-script bank in `aqa/literature/planning/b-ladder.md`). Neil 2026-07-21: "we
     shouldn't be inventing models… why would we have to invent a text when we have so many that we
     can use?" Queue a retrofit to real material. Lit keeps working until then; every NEW port (poetry
     onward) uses real curriculum material from the start. Tracked: `~/.claude/handoffs/open/wml-backlog.md`.

- **Cross-cutting:** help-ladder depth, the grounding gate, and the context-output gate all DERIVE from
  the question's AO/capability profile — one per-question config — never from literal task-names (same
  "capability, not task-name" discipline as the canvas rules). A new board/paper opts in, never silently
  misses.
- **Caveat before any student-facing mark-scheme QUOTE:** exact band-descriptor strings must be copied
  from the human-readable mark-scheme PDF, never reconstructed (`feedback_never_invent_mark_scheme_claims`).

---

## §8. WRITING CYCLES ARE ONCE-AND-MOVE-ON; RETRY-PULL IS FOR QUIZZES (Neil 2026-07-19)

**The ruling (verbatim intent):** for writing/assessment cycles (diagnostic write,
assessment, planning, outlining, polishing, reassessment) students are encouraged to
**attempt it once, finish it, move on — and that's how they should be doing it all the
time.** Students who re-run assessed cycles get stuck "going round and round in circles" —
they stop progressing, which is the opposite of what the practice is for.

**Scope split — do not over-apply:**
- **QUIZZES (FQ / MSQ / MSA)** are the retry-encouraged surface: bank-driven, code-marked,
  cheap. The sidebar's best-score (MAX) aggregation exists to pull retries HERE.
- **WRITING cycles**: attempt 1 is the course — sacred, never gated, never metered.
  RE-attempts are the exception, not a feature. The Silver-plan fair-use cap (cost arc)
  meters writing re-attempts only, framed as the designed flow, never as a paywall.
- Recommenders and messaging point a finished student FORWARD (next topic, redraft depth,
  CN) — never back into re-running a completed assessed cycle.

**Why:** forward motion is the same law the C-LADDER runs on (§7); circling trains
cramming-adjacent habits and costs the most (each full writing cycle = £0.50–£2 of AI vs
pennies for quizzes). One rule serves learning and unit economics simultaneously.
Memory: `feedback_writing_cycles_once_and_move_on`. Pairs with `feedback_no_assessment_chasing`.

## §9. THE OUTLINE CARRIES THE APPROVED PLAN, NOT THE RAW DICTATION (Neil, ruled 2026-07-20)

**THE RULE:** after a paragraph's mirror-back approval (A-Happy), the outline element boxes and
the plan box hold the SAME refined text — the student's own words, condensed to their plan mode,
approved at the mirror-back. The raw dictation captured live during planning is a WORKING state,
not the deliverable: it fills the outline boxes as the student speaks (immediate feedback), and
the approval upgrades it in place.

**Why this is ownership-clean, not injection:** the refined version contains only the student's
ideas and phrases (the condensation the protocol already mandates for the plan box); the approval
click is the consent checkpoint. What the ownership law forbids is the LLM ADDING interpretive
content — condensing the student's own confirmed words is drafting, not authorship (CLAUDE.md
§Behavioural 6).

**Why pedagogically:** the Outlining lesson asks the student to expand each element into a full
sentence. Expanding a clean, refined keyword line trains exactly that skill; expanding their own
unpunctuated mic ramble trains transcription-tidying instead. The plan is the skeleton; the
outline works each bone — both must show the same skeleton.

**Mechanics (engine-owned, never a second marker set):** `_planFanoutToOutline` in
wml-assessment.js; replay-guarded so outlining-lesson edits are never overwritten. Also ruled
same day: **planning clear-chat = start the plan fresh** (wipe + restart from step 1 — one
button, one meaning; the attempts model was tried and rejected as too complicated), and the plan
box renders one line per element (original spec restored).

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

## §10. LIT ESSAYS ARE ALWAYS FIVE PARAGRAPHS — MARKS SCALE DENSITY, NEVER STRUCTURE (Neil, ruled 2026-07-20)

**The ruling (verbatim intent):** "We never teach a four-body-paragraph essay. It's always
three body paragraphs with an introduction and conclusion — five paragraphs altogether. We
teach five paragraphs whether there's twenty marks or forty marks. All we do is adjust the
DENSITY of what the student is writing — and in the assessments, the density of what is
being assessed."

**What this rules out:** ANY derivation of paragraph count from marks for a literature
essay. The engine's old `marks >= 40 ? 4 : 3` body-count derivation was a defect by
construction — it rendered a 4th dead body box on every 40-mark lit paper (eduqas 19th-c,
OCR lit, IGCSE modern-prose) that no protocol teaches or fills. Fixed v7.20.236: ONE
constant `LIT_ESSAY_BODY_COUNT = 3` (wml-assessment.js), three consumers, never re-derived.

**What DOES scale with marks:** density — word-count targets per section, the number and
depth of assessed criteria per element (compare eduqas 19th-c body = 9 marks/paragraph vs
Edexcel IGCSE heritage = 7), and the granularity of feedback. Structure is invariant.

**Scope guard:** this is the LITERATURE-ESSAY law. Language READING questions keep their
own settled counts (AQA Lang: 8→2 ¶, 12→3 ¶ — CLAUDE.md derivation rule), and Section-B
extended writing keeps its whole-answer structures (IUMVCC / story-spine). Do not import
this rule into those, or theirs into this.

---

## §11. THE STUDENT DOES THEIR OWN SPaG — Sophia never tidies their prose (Neil, ruled 2026-07-22)

**The ruling.** When a student's words go into a document row — a story idea, a logline, a spine beat,
any free-text answer — they go in **verbatim**, and **the student fixes their own spelling,
punctuation and grammar**. Sophia never silently cleans up a sentence, never offers "a tidier
version", and never writes a polished rewrite into a row the student authored.

**Why it is pedagogy, not preference.** Two reasons, both load-bearing:

1. **This is a writing course and SPaG is assessed** (AO6 / technical accuracy). If the AI repairs
   every sentence, the student never practises the repair. The correction IS the exercise.
2. **It hides the evidence.** A silently tidied row shows Neil polished prose instead of what the
   student actually writes — so their real, recurring error patterns become invisible to the person
   teaching them. The document must show the student's true writing.

**What Sophia does instead:** comments on the **CONCEPT** — is this a flaw or just a quirk, does this
beat causally follow the last one, is this obstacle specific enough. Idea-level refinement is worth an
API call; prose-level tidying is worth none, and costs the student the practice.

**Where the shape constraint goes.** When a row needs a particular form (a spine beat is one sentence,
present tense, no lead-in connective), that constraint is stated **in the ASK**, up front — never
repaired afterwards by an AI pass. Cheaper, and it teaches the constraint instead of hiding it.

*(Implemented v7.20.262–.264 across CW Steps 2–4. Pairs with §9 — the approved-plan law is about
CONTENT grade, this is about who owns the surface polish: the student, always.)*

---

## §12. ONE COMMITTED IDEA BEATS THREE FORCED ONES — the CW Step 2 idea ladder (Neil, ruled 2026-07-22)

**The ruling.** CW Step 2 asks for a story idea. If the student lands one they are committed to, **one
is a complete and valid outcome**. The ladder:

1. Idea 1 lands → saved → one deepening question.
2. Invite a second **once**, framed as pedagogy (professional writers rarely run with their first;
   one alternative sharpens the one you keep).
3. If they give a second, invite a third **once**.
4. **A decline at ANY point is final.** No fourth ask. No re-ask after a decline, ever.

**Why.** The protocol previously demanded three and would not stop asking; Neil drove it with one idea
he was happy with and it kept pushing. Two ideas invented purely to satisfy a counter are fake ideas
the student will never pick — they teach nothing, cost the most tokens in the step, and train the
student that the system doesn't listen when they say no.

**The mechanism matters as much as the rule.** The decline is a **code-owned chip**, not an
instruction to the model. A "please respect a no" in a protocol is a request the model may ignore;
a code-owned decline makes the loop *structurally impossible*. Any rule about how much a student is
demanded of should be enforced where it cannot be re-litigated.

**The distinction that stops this being over-applied.** This is NOT a general "fewer is fine" rule.
Step 3 asks for **three loglines and keeps all three** — because three *ideas* is busywork, whereas
three *loglines* is the same story through three lenses (action / goal / character-arc), which is
deliberate practice, and it scaffolds (formula 3 is easy after 1 and 2). Ask: **is the repetition
generating throwaway alternatives, or practising the same skill through different lenses?** The first
gets an escape hatch; the second does not.

*(Implemented v7.20.262. Pairs with §0's procedure — this ruling is now written, so do not re-ask it.)*

---

## §13. VERDICTS ARE WITHHELD UNTIL THE END; SELECTING AN ANSWER ADVANCES (Neil, ruled 2026-07-23)

**The ruling.** In every multi-question interactive component (scenario / "Code of the
Quest", MSQ-style checks, true-false, matching — the whole family), the student is NOT
told whether an answer is right or wrong at the moment they give it. **All verdicts are
revealed together at the end**, after Submit. And selecting an answer **advances to the
next question automatically** — there is no per-question CHECK step.

**Why (Neil's reasoning, verbatim intent).** Two separate problems, one ruling:

1. **Immediate right/wrong creates restart temptation.** A student who sees "✗ wrong" on
   question 2 of 5 now knows their score is capped, and the rational move becomes
   *restart and re-run the whole thing* rather than finish honestly. That converts a
   diagnostic into a slot machine. Withholding the verdict removes the information that
   makes restarting attractive **at source** — there is nothing to peek at mid-run. This
   is the same logic as `feedback_writing_cycles_once_and_move_on` and
   `feedback_diagnostic_tests_redraft_trains`: the measurement must be allowed to
   measure. (⚠️ This paragraph used to end "an attempt abandoned at Q2 is a real cost,
   not a free retry" — **superseded 2026-07-30, see §23**. Withholding verdicts still
   removes the reason to restart; what changed is that an INTERRUPTED attempt is now
   resumed rather than graded where it stopped.)
2. **Choose → CHECK → read verdict → NEXT is three actions where one will do.** Neil,
   driving it live: *"I'm choosing my answer, and then I have to check it, and then it
   tells me it's right, and then I have to press the next button."* Selecting IS the
   commitment; the UI should honour it and move.

**What this means in build terms (all components, no exceptions):**
- **No per-question CHECK / CHECK ALL button.** Selecting an option commits it.
- **Auto-advance on selection**, with a short beat (~300ms) so the choice visibly
  registers before the move — instant advance reads as a glitch and punishes a mis-tap.
- **PREVIOUS remains, and answers stay changeable** until Submit. Auto-advance is a
  convenience, never a lock. A student who mis-taps must be able to go back and fix it —
  this is what stops auto-advance becoming a trap.
- **The last question advances to the Submit state**, never into nothing.
- **Submit reveals everything at once:** score, grade, and the per-question explanation
  for every question — right AND wrong. The teaching content is not reduced; it is
  **relocated to the end**, where it can be read as one coherent debrief.
- **Restart stays honest.** The existing "this attempt will be graded as-is" confirmation
  is correct and stays — it makes the cost explicit rather than hiding it.

**The one thing this ruling does NOT change.** Deliberate-practice retry-pull on QUIZZES
is untouched (§8): quizzes are for maxing out through repetition. This ruling governs the
*within-attempt* reveal, not whether a student may attempt again.

**Watch-it for the next build.** "Reveal at the end" is a property of the COMPONENT
FAMILY, not of one component. Any new interactive that scores multiple items inherits
it by default — a component shipping per-question verdicts is a defect, not a variant.

**Exception — practice drills (Neil, ruled 2026-10-10, his tap on the Components lane's picker: *"Two tries, like
Brilliant"*; WML FIXLIST #889).** `[sophicly_drill]` items (Final-Read Pass, Tense Lock, Purpose Sharpener) are
training, not measurement, so each item gets two tries: a Check, a hint after the first miss and the answer after the
second (Brilliant's ladder). Only the FIRST-TRY score is saved, so a second try teaches without inflating the grade. The
option he chose read: *"Your July rule stays for the other quizzes; drills become the practice exception, recorded in
PEDAGOGY."* Everything else in §13 stands for the quiz family — a quiz shipping per-question verdicts is still a
defect; a drill showing them is the ruling.

---

## §14. A STORY IS FINISHED TO FIRST DRAFT BEFORE A NEW ONE BEGINS — the CW project checkpoint (Neil, ruled 2026-07-25)

**THE RULING.** Creative Writing is deliberately MULTI-PROJECT: a student is meant to write two or
three different stories. But they may not start a new story on a whim. The gate is a **HARD gate
with NO exceptions**:

> **To CREATE a new story, the active story must have completed STEP 9 (Draft 1 – Prose Style)
> AND TRIAL 1 (Story Coherence).**

**Neil's reasoning, recorded because it is the load-bearing part.** The obvious objection is the
student four steps into an idea that is genuinely dead — why force them to draft it? Neil's answer:
*"the problem is they might think that ANY story is dead."* Left to a soft gate, "this one's dead"
becomes the universal escape hatch and nobody finishes anything. Reaching Draft 1 is what earns them
the thing that actually resolves the doubt — **feedback**: they get marked, they see what they could
have done better, they learn how to improve, **and they get a chance to fix the story**. A premise
that still looks dead after a full first draft and Trial 1 is a judgement made with evidence; one
made at Step 4 is a guess. A proposal for "one deliberate discard before the checkpoint" was put to
Neil and **explicitly rejected** — do not reintroduce it.

**SWITCHING IS FREE — only CREATING is gated (Neil, same ruling).** A student may move between
stories they already have, whenever they like, with no checkpoint test. Gating switching would trap
a student in whichever story they last opened, which is a bug wearing a checkpoint's clothes. The
behaviour being prevented is *constantly starting again*, and that is creation, not navigation.

**PER-STORY IS A DISPLAY SCOPE ONLY — SCORING IS ALWAYS GLOBAL.** This is the anti-penalty law, and
it is the half most likely to be got wrong by a later change:
- **STORY ring** = the active story's steps. Resets to 0 for a new story. This is correct and is not
  a penalty — it is a description of that story.
- **COURSE ring** = every step the student has ever completed, **across all stories. It never goes
  down.** A student who writes three stories has done MORE work, never less.
- **Grades, process score, and course completion count ALL work across ALL stories, always.**
- The two rings are **both shown, both labelled, and neither replaces the other.** "Course" always
  means the course. Never overload one ring with two meanings — a returning student watching their
  course drop from 60% to 8% on starting story 2 is the exact penalty this law exists to forbid.

**PREREQUISITE — the in-order scorer must be fixed BEFORE multi-story ships.** A student working two
stories necessarily completes course steps out of sequence. `compute_in_order()`
(`sophicly-student-data/includes/class-wml-rest-api.php:5624`) counts completed steps only while
CONTIGUOUS — the first gap zeroes everything after it. So multi-story students are precisely the
population that scorer punishes, and shipping multi-story on top of it would build Neil's stated
worry ("them getting penalized") into the product. Fix the scorer first, or ship them together.

**Watch-it for the build.** The checkpoint and the per-story completion writer hang off the same
event — "a CW step was completed on THIS story" — so they are one piece of work, not two. And the
gate must read the *project's* `step_completion`, never LearnDash's global state: LD would report
Step 9 complete from story one and wave story three straight through.

**THE LANGUAGE PAPER 1 STORY PROJECT — the same rule (Neil, ruled 2026-10-10, Actions card: "Keep the rule: they carry on
their story"; FIXLIST #883/#886).** When the story lessons run between the Paper 1 practice papers, a student who already has
an unfinished story carries it on; a new story still needs Draft 1 + Trial 1 on the active one. Measured that day: of 58 real
students in AQA Lang P1 (42205), 45 had no story (their first is free) and 13 had one, none past the gate.
⚠️ **Step numbers moved under this ruling (#885):** it was written when Draft 1 was Step 9. Since the v7.20.451 Step 8 insert,
Step 9 is Scene Selection and **Draft 1 is Step 10**. The RULING is Draft 1 + Trial 1, whatever their numbers.

---

## §15. A STUDENT STUDIES ONE COURSE AT A TIME, AND SWITCHES ONLY AT A CHECKPOINT (Neil, ruled 2026-07-27)

**THE RULING.** *"Generally speaking, students should only be working on one course."* The courses
are deliberately larger than a student can finish in one run, so the design is **not** "finish the
course, then move" — it is **"reach a checkpoint, then you may move."** Between checkpoints the
student stays on one course; at a checkpoint they may switch, and the course they leave is parked,
not abandoned.

**WHERE THE CHECKPOINTS SIT.**

| course family | checkpoint |
|---|---|
| **Creative Writing** | **Step 9 (Draft 1 – Prose Style) + Trial 1 (Story Coherence)** — the FIRST one; the same boundary §14 already gates new-story creation on. |
| **Exam courses** (Language / Literature papers) | **the end of each ESSAY — i.e. each WML "Topic" (Practice Paper 1, Practice Paper 2, …), taken all the way through its phases: diagnostic write → assessment → planning → outlining → polishing → reassessment.** The first checkpoint is the end of the first essay; there is another at the end of every essay after it. |

⚠ **"Topic" is an overloaded word — never use it unqualified with Neil or with students.** It means
three things in this codebase: a LearnDash `sfwd-topic` (which Sophicly renames "**Lesson**" for
students), a Sophicly "**Unit**" (LearnDash `sfwd-lessons`), and the WML sense used above — **one
whole practice paper / essay, with its diagnostic and redraft as phases inside it**. The checkpoint
is the WML sense. In student- or Neil-facing words, say **"when you've finished an essay properly —
written it, been marked, redrafted it, been remarked."**

**WHY CW's IS TRIAL 1 AND NOT TRIAL 2 — the reasoning that settles it, because the question recurs.**
Neil's instinct was Trial 2, on the grounds that it gives the student "a chance to fix their
writing." **That premise is false and must not be reintroduced.** The trials do not re-mark one
another — they assess *different dimensions*: Step 9 Draft 1 → **Trial 1 story coherence**; Step 12
Draft 2 (character arc) → **Trial 2 character depth**. Waiting for Trial 2 therefore does not buy a
second attempt at Trial 1's criteria; it buys a whole second skill plus its own assessment. The
"chance to fix" lives *inside* the draft chain (Steps 10–11 update plot and goals before Draft 2),
not between trials — and §14 already records it as delivered AT Trial 1: *"they get marked, they see
what they could have done better, they learn how to improve, and they get a chance to fix the
story."*

The second reason is consistency: §14 already makes **Step 9 + Trial 1** the boundary at which a
story counts as finished-enough. Using the same boundary to release a *course* switch keeps ONE
checkpoint concept in the student's head instead of two competing ones.

**THE GENERAL FORM (derive from this; do not hand-place per course).** A checkpoint is the first
point at which the student **holds a complete assessed artefact**. CW: a full first draft plus its
assessment. Exam courses: a finished essay taken through its Topic (diagnostic → assessment →
redraft → reassessment). A checkpoint is never a raw step count and never a percentage.

**THE MECHANISM ALREADY EXISTS — this is a placement decision, not a build.**
`[sophicly_next_step]` (`sophicly-components/includes/class-shortcode-next-step.php`) is the chooser.
Its options come from the student's own enrolment; it is gated on LearnDash completion of the prior
lessons in the course, and the pick calls `Sophicly_WML_Listener::promote_course()`. Placing a
checkpoint = putting the shortcode in that lesson. Live example: the Graduation lesson of Grade 9
Core Skills.

**THE COURSE THEY LEAVE IS PAUSED, NOT LEFT RUNNING (Neil, same ruling).** A pick parks the
previously focused course on the shelf so the student has one live course. This is a *kindness*, not
a demotion: the deadline engine freezes a paused course (no overdue stamping, no reminders), so a
student is never penalised for not progressing a course they were told to step away from. Anti-gaming
already holds — items already overdue at pause **stay** overdue.

**⛔ THE LAW THAT PROTECTS IT: A SYSTEM PAUSE MUST YIELD TO REAL WORK; A STUDENT'S PAUSE MUST NOT.**
`paused` already carries two meanings (onboarding's "queued, not yet started" and the CoursesPanel
"I deliberately parked this"), and `ensure_course_active()` deliberately refuses to un-pause on
canvas activity so a student's own Pause survives. An auto-pause that reuses the bare status
inherits that refusal — the student returns to the parked course, writes in it, and it stays on the
shelf with its deadlines frozen and no reminders, silently. **So an auto-pause must be stamped with
its provenance** (mirroring the array's existing `auto_added` flag), and only a system-stamped pause
may be lifted automatically by real activity. Never add a third meaning to one status value.

**⭐ FOCUS AND PAUSE ARE TWO DIFFERENT QUESTIONS — keep them on two different fields (Neil's
back-and-forth case, 2026-07-27).** Neil: *"we've had some students who will switch back and forth
unconsciously — what happens in that case?"* The answer is that drifting between lessons must not be
able to rewrite what the student is *studying*:

| question | field | changed by |
|---|---|---|
| **What am I studying?** (the card, "Studying Now", My Journey) | `sophicly_focused_course` | **a deliberate `[sophicly_next_step]` pick, and nothing else** |
| **Should this course's deadlines be running?** | `status` active/paused | a pick, a manual Pause/Resume, or real work in an auto-paused course |

Three consequences, and they are the whole answer to the drift case:
1. **Wandering into a lesson can never park a course.** Only a chooser pick calls `promote_course()`;
   `ensure_course_active()` (the canvas-save path) only ever *adds* or *activates*. A student cannot
   accidentally shelve their own work, and **never has to remember to pause anything** — the pick
   does it.
2. **Wandering back into a parked course un-freezes its deadlines but does NOT move their focus.**
   Deadlines should track what the student is genuinely doing; focus should track what they
   deliberately chose. A stray save is evidence of the first and no evidence of the second.
3. **Never flip a course's state silently in either direction.** Silent shelving and silent
   resurrection are the same defect. An automatic resume is announced (toast//dashboard), so the
   student's mental model and the data never diverge.

**A student who switches back and forth is a signal, not a fault to engineer against.** The system's
job is to hold ONE thing stable — the focused course — and let deadlines follow real behaviour. Do
not add friction, confirmation walls, or switch-rate limits to "fix" the drifting student.

---

## §16. A GRADE-9 RETAKE GETS SEVEN DAYS' GRACE, THEN JOINS THE EXISTING OVERDUE POOL (Neil, ruled 2026-07-27)

**THE RULING.** A component lesson has two completion criteria: no graded component → mark complete;
**with** a graded component → **grade 9 AND mark complete**. Marking complete below grade 9 is
allowed — it does not block progress — but it starts a **delayed** penalty:

> **7 calendar days' grace, no penalty during it. After that the shortfall accrues into the
> EXISTING overdue pool (0.5 points/day, 10 max per item, 20 cap). Reaching grade 9 clears it
> instantly, at any point.**

**WHY SEVEN — Neil asked specifically for the evidence, so it is recorded here rather than in a
handoff.** *"I don't actually know what the correct answer is there"* — so the number is derived,
not chosen:
- **Late-work grace** in secondary practice is normally 24–48h, and **longer windows measurably
  LOWER completion because urgency drops** (Edutopia). Grace must therefore be short.
- **Reassessment-to-mastery windows** run **3–10 school days, clustering at 5–6** (Tanglewood 3 ·
  LCPS 6 · Puyallup 10).
- A retake is **not** late work — it is a second attempt at mastery (Bloom), which carries real
  motivational value, so it earns a longer window than a late submission but must stay bounded.
- **Counter-evidence taken seriously:** soft deadlines enable procrastination and let students dig
  "late holes". 7 calendar days ≈ 5 school days is the *shortest* window still consistent with the
  reassessment literature — deliberately at the bottom of the range, not the middle.
- It also matches Sophicly's own cadence: ~3 lessons/week, so one week = one teaching cycle.

**✅ RE-EXAMINED 2026-08-03 AT NEIL'S INSTRUCTION — "base this decision on educational research" —
AND SEVEN STANDS. No code change.** He asked whether 7 is the number he wants; the answer is that it
was already derived, not chosen, and a second independent pass corroborates it from a different
literature:
- **Kulik & Kulik's meta-analysis via Shute (2008)** puts immediate feedback at **ES 0.80** against
  **0.35** for delayed, for procedural skills — component exercises are procedural practice, so the
  effect decays with delay. **This forbids lengthening the window.**
- **Nicol & Macfarlane-Dick (2006) and Boud & Molloy (2013)** hold that feedback is not complete
  until the learner acts, and that the loop must close **within the instructional cycle** so the
  next task can build on it. **This forbids shortening it to 2–3 days**, which in term time would
  fall inside a single week where a student may only sit down twice.
- **Cepeda et al. (2006)** contribute the shape rather than the number: optimal gaps are
  **proportional to the cycle, never a fixed calendar constant**. Noted below as the live caveat.

**⚠️ THE ONE PREMISE THAT DOES NOT HOLD RIGHT NOW, recorded so it is not rediscovered as a bug.**
The derivation above rests on *"one week = one teaching cycle"*. That is true in term time. It is
**false during the summer Creative Writing masterclass**, which runs **15 sessions between 2026-07-23
and 2026-08-22 — roughly one every other day**. Seven days there spans about **three sessions**, so a
student can attend three lessons carrying an unfixed grade-9 shortfall and the tutor cannot build on
it. The rule is not wrong, its premise is simply seasonal.
**Deliberately NOT changed without Neil's ruling**, because tightening grace mid-course would
penalise students who are already inside a live window — and because the honest fix is a shape
change (derive grace from the gap to the student's next scheduled session, floored so nobody is
penalised overnight and capped at 7 so a holiday cannot grant open-ended grace), not a different
constant. **That is a product call, not a research one.**

⛔ **NEIL RULED 2026-08-03: SEVEN DAYS STAYS. Do not re-open this, and do not build the
next-session derivation.** He was shown the summer arithmetic above (a student can attend ~3
sessions inside one grace window) and the self-adjusting alternative, and chose the flat 7. So the
seasonal slack is a KNOWN, ACCEPTED cost, not an outstanding defect — a later chat rediscovering
the "one week = one teaching cycle" mismatch is rediscovering something already decided.

**WHY IT JOINS THE EXISTING POOL RATHER THAN GETTING ITS OWN.** Research does not speak to penalty
plumbing, but the principle governing it does: **a consequence only changes behaviour when the
student can predict it.** One pool they already understand keeps cause→effect legible; a second
parallel penalty system obscures it and silently re-weights every other component.

**WHAT THE CARD MUST SAY.** State both criteria plainly on the row — "mark complete" vs "score grade
9 **and** mark complete" — and name the unit and lesson. ⚠ The leading number in a lesson title
("7. Where Do Authors Get Their Ideas?") is the lesson's OWN prefix, not its unit: derive the unit
from the LearnDash parent, never by parsing the title.

**⛔ Never list a non-graded component as gradeable.** `sophicly_deck` has no grade path, so a
"score grade 9" row against it is permanently unachievable. Gate on the classes that reference
`class-grade-event`, never on "is a shortcode".

---

## §17. A PRE-TEACHING QUIZ IS ALLOWED — IF IT IS ACHIEVABLE FROM WHAT THE STUDENT ALREADY HAS (Neil, ruled 2026-07-27)

**The ruling, verbatim:** *"There's no problem with them doing a little quiz on it before they
actually start learning about it — as long as it's achievable."* And on why it is achievable in
this case: *"the names make it quite obvious as to what they're actually about… just structure it
really well, make sure the wording's clear."*

**What this settles.** The teach-card-precedes-the-counted-retrieval pattern (the definition
cards, §7) is **not** a blanket ban on testing before instruction. Sophicly may place a graded
activity ahead of the lesson that teaches its material, provided a student who has never met the
material can still reason their way to the answer from something they already hold — a
self-describing name, ordinary language, general reading experience, or transferable sense.
The bar is **achievable**, not **already taught**.

**What it does NOT license.** A pre-teaching quiz on material that can only be known by having
been taught it — mark-scheme wording, a board's AO numbering, a technique's formal term, a
protocol's own vocabulary — is still the failure this rule guards against. Asking a student to
produce what only instruction supplies is the paste-wall in a different costume: the honest
answer is unavailable to them, so the score measures prior exposure, not thinking.

**The four obligations on any pre-teaching quiz.** All four, or it is not achievable:
1. **The answer must be reachable from the question.** If the distinguishing cue is not IN the
   stimulus, the student is guessing. Sharpen the wording until the right answer is inferable —
   e.g. Voyage and Return ends *"back HOME again, with no prize won at all"*, which separates it
   from The Quest's *"the prize won at last"* for someone meeting both cold.
2. **Say out loud that they have not been taught it yet**, and name the clue. Do not leave the
   student to discover that guessing is expected — that reads as a test they have failed before
   starting. Take the pressure off explicitly.
3. **It must TEACH on the way out**, and teach every item, not only the misses — a student who
   guessed correctly has learned nothing yet. The review screen is the real lesson.
4. **Distractors must be genuine conceptual boundaries**, never filler. If two options are
   separable only by prior instruction, the pairing is unfair; if they are separable by careful
   reading, it teaches the distinction at the moment of choosing.

**Reference implementation:** `[sophicly_plot_structures]` (sophicly-components v3.48.0) — the
eight archetypal plot structures, one question each, placed BEFORE CW STEP 5 where students
choose their own structure. Full rationale in that plugin's `PLOT-STRUCTURES-E2E-PLAN.md`.

**Why this is recorded here rather than in the component.** A ruling kept only inside its
consumer gets re-derived wrongly by the next one — the reason this file is the rulings register
(§0). The next person to place a quiz ahead of its teaching should find this rule, not re-ask.

---

## §18. ⭐⭐ UNCERTAINTY IS NEVER PAID FOR BY THE STUDENT — the scoring invariant (2026-07-28)

**THE LAW.**

> **A scoring component DROPS OUT when its input is unreliable. It never scores zero.**
> A student is never charged for a gap in OUR data, OUR timing, or OUR admin.

**Why this exists.** On 2026-07-28 nine separate defects were found and fixed across the process
score. They looked like nine bugs. They were one disease — **every single one resolved uncertainty
against the student**, and not one ever erred the other way:

| the gap | what the system did |
|---|---|
| reflection saved with no `session_id` | guessed by calendar date → 36 of 50 records credited to nothing |
| a lesson the student was still sitting in | counted as a reflection already owed |
| a session a tutor backfilled after the fact | counted as owed, already overdue on arrival |
| a session the tracker dated wrongly | no reflection could ever match it |
| six lessons completed in ONE live class | ticking them minutes out of order scored as out-of-sequence |
| sessions from a different programme | counted against this course's score |

Each was individually defensible and collectively indefensible: Yusra Kazi read **82** for five days
while doing everything asked, and would have been shown that number in front of her class.

**How to apply — the gate for any new scoring input.**
1. **Ask what the number does when the input is MISSING, LATE, or WRONG.** If the answer is "the
   student scores lower", it is a defect, not a default. The correct answer is "the component does
   not apply" (`applied: false`) — the discipline already half-exists in `compute_process_score_for`;
   the failure was never applying it consistently.
2. **A student can only owe what they had a fair OPPORTUNITY to do.** Two corollaries, both now
   in code: nothing is owed before the activity has finished (v2.31.157), and nothing is owed if
   the record of it was created after its own deadline (v2.31.158).
3. **Measure at the granularity where the signal is real.** Comparing completion timestamps to the
   minute measured click noise inside a single lesson and charged for it (v2.31.155). If the
   behaviour is a day-level behaviour, compare days.
4. **Never derive identity from what the transport happened to carry.** A reflection knows its
   session; if the client failed to send it, the SERVER resolves it rather than guessing from a
   date (v2.31.156). Guessing IS charging the student for our gap.
5. **Errors that flatter are still errors — but fix them in that direction.** Word counts currently
   over-credit students (Sophia's generated prose counted as theirs). That is wrong and must be
   fixed, but shipping a correction that would zero a student's real draft is worse. When only a
   wrong answer is available, take the one that does not punish.

**⛔ THE SECOND-ORDER RULE — NEIL IS NOT THE DETECTION MECHANISM.** Every one of the nine was found
by Neil looking at a number and saying "that's not right". Yusra's 82 stood for five days; 36
unlinked reflections were invisible to everyone. **Any scoring change ships with a runnable gate
that asserts the impossible states** (root CLAUDE.md §5e; reference impl
`sophicly-celebration/bin/verify-keys.php`) — a session created after its own date, two sessions on
one group+date, a reflection with no session, a denominator drawn from another course. A rule that
depends on a human noticing a wrong number in a child's face is not shipped.

Related: [[feedback_key_granularity_not_just_key_agreement]] (a key can agree and still name the
wrong thing), root CLAUDE.md §0 (root cause, not symptom) and §15 (done = works end to end).

---

## §19. ⭐⭐ THE STUDENT MARKS THEIR OWN WORK AGAINST STATED CRITERIA — self-assessment, not an AI check (Neil, ruled 2026-07-28)

**What happened.** Neil deliberately typed the *same sentence* into his Goal box and his Stakes box
to see whether anything would stop him. Nothing did; it filed exactly what he gave it. His response
was not "add a check" — it was: *"I feel like I can just put any answer in… maybe the students could
self-assess… they tick off the criteria that they've answered to the best of their ability. That
might be better, actually. And then maybe one check at the end with advice of how to make it better,
with examples."*

**THE RULING.** After a student's answer is filed, serve a **tick list built from the criteria the
ask already stated**, and let them mark their own work. Anything they leave unticked buys **ONE**
free follow-up. The end-of-set batched review then reads their claim alongside their writing and
polices it ("you ticked *emotional shield*, but what you wrote is a habit").

**WHY THIS AND NOT A PER-ANSWER SOPHIA CHECK — the pedagogy, which is the whole point:**
1. **An AI check OUTSOURCES the judgment; a checklist BUILDS it.** The goal is a student who can
   tell whether their own paragraph meets a criterion — in an exam hall, with no Sophia.
   Self-monitoring against a standard is among the highest-effect interventions Hattie measures.
2. **It IS the exam skill.** Reading your own answer against the mark scheme is the thing we are
   training. Outsourcing it trains dependence, which is the failure mode of every AI tutor.
3. **It is FREE**, so it runs on EVERY ask instead of being rationed to one by cost. A judgment the
   student makes sixteen times beats one an API makes once.
4. **Honesty is credited, not punished.** Nothing is pre-ticked, an unticked box costs nothing, and
   the follow-up is an offer. A tick list that gates progress becomes a lying game.

**THE ROLLOUT RULE — where a tick list belongs (derive from this; do not ask per step):**
> A tick list follows a **WRITTEN answer whose quality a later step depends on.**
> **Never a pick** — there is nothing to self-assess about a tap.
> **Never one row of many inside a larger unit** — the **UNIT** gets the tick list.

Applied: Step 1 no (factual profile) · Step 2 the chosen idea only · **Steps 3 + 4 every ask** ·
Step 5 no, it is a pick (it gets a *diagnostic* checklist instead — see below) · **Step 6 per STAGE,
never per row.** Neil on Step 6: *"there are so many beats… it can be very demanding on them to go
through all those beats and tick those criteria off for each one."* 801 rows × a tick list is
clicking, not thinking — and mindless clicking is the exact failure the mechanism exists to prevent.

**CRITERIA ARE LIFTED, NEVER AUTHORED BESIDE THE ASK.** Each tickable criterion must be a verbatim
substring of that ask's own "A strong X:" bullets, enforced mechanically (`bin/cw-keymatch-harness.js`).
A student must never be asked to tick a criterion the teaching did not give them.

**THE DIAGNOSTIC CHECKLIST IS A DIFFERENT INSTRUMENT (Step 5, Neil 2026-07-28).** Ticking traits to
find out *which archetype fits* is not self-assessment. It runs **AFTER** the student's instinctive
choice, never before: run first it PICKS FOR THEM (outsourcing again); run second it either confirms
their instinct — earned confidence — or disagrees, and **the disagreement is the teaching moment**
(*"you chose Rags to Riches but ticked mostly Overcoming the Monster — which is it?"*). You only get
that moment if they commit first.

Related: root CLAUDE.md §0 (root, not symptom), WML CLAUDE.md §4c (the ask template supplies the
criteria this rule ticks), §4c.9 (the help ladder — Sophia is the last rung, for the same reason).

---

## §20. FLAW BEFORE WOUND — observable before inferred (Neil, ruled 2026-07-28)

Neil asked whether the **wound** should come before the **flaw**, since *"the flaw actually grows out
of the wound"*. He is right about the causality and it still stays **flaw-first**.

**THE RULING: flaw first, wound second.** The flaw is **OBSERVABLE** — a behaviour you can watch a
character perform. The wound is **INFERRED** — a buried hurt you reason back to. Asking a 14-year-old
to name a character's deepest wound before they have a character asks them to invent psychology from
nothing; asking for a visible habit first, then *"what must have happened to make someone build
this?"*, is a step they can actually take.

This is the same principle as every other ordering in the arc: **name what can be seen, then reason
to what cannot.** The Step-4 spine does it too (the filmable action before the meaning).

Not a preference — a sequencing rule. If a future protocol asks for an inferred interior state
before its observable expression, that protocol has the order wrong.

---

## §21. ⭐⭐ HAMARTIA IS AN ERROR IN ACTION, NOT A "FATAL FLAW" — and it is NOT the creative-writing Flaw (Neil, ruled 2026-07-29)

**What happened.** Reviewing the CW Step-3 Flaw block, Neil rejected the framing two separate research
passes had arrived at. Verbatim: *"the fatal flaw in my understanding is actually a misunderstanding
or misinterpretation of what Aristotle actually meant in ancient Greek… the word he used was hamartia
and this word didn't actually mean fatal flaw, but it meant a fatal error in action. So it's a choice
that the protagonist makes that causes their downfall… what tragedy is, at least in part, is actually
about how these protagonists are forced into this error by the society surrounding them. In the end,
they make the error, so we have to hold them accountable, but the tragedy is actually a criticism of
the society and its values and pressures."*

**This was never open.** It is already our teaching, in the protocol, and has been:
`protocols/shared/literature/modules/conceptual-notes/cn-section-4-genre.md:187` —
> They make a **hamartia** (critical mistake/error in action)—NOT a 'fatal flaw' (this is a mistranslation)

and `:183` — *"often due to a critical mistake (hamartia), not necessarily a character flaw… Crucially,
tragedy also critiques the SOCIETY that enables or rewards such errors."*

**THE RULING — two concepts, two cards, never merged.**

| | HAMARTIA (`Hm`, Literature) | THE FLAW (`Fw`, Creative Writing) |
|---|---|---|
| what it is | a critical **mistake / error in ACTION** — a choice | a present protective **behaviour** |
| where it points | forward, to the consequence | back, to the wound it is built over |
| who is indicted | substantially the **SOCIETY** that pressed them into it; the protagonist is still accountable | nobody — it is character mechanics |
| source | Aristotle, correctly translated | Edson's shield (`Story Solution`) |

1. **NEVER teach "fatal flaw".** It is a mistranslation. Where a student meets the phrase, name it as
   one. Hamartia is an error in action, not a defect of personality.
2. **NEVER illustrate the CW Flaw with tragic-hero examples.** The live defect: the `Fw` technique card
   teaches *"its richest form is the flip-side of a genuine strength"* and cites **Macbeth's valour**
   and **Othello's openness** — that is the fatal-flaw reading, imported into a creative-writing card,
   contradicting our own genre module. Fix the card, do not propagate it into the ask.
3. **Tragedy's societal critique is not optional garnish.** A tragedy answer that names the error and
   omits what the society did to produce it has missed half the genre.
4. **Craft authority does NOT override the protocol.** Truby's "flip-side of a strength" is a real
   technique in a real book, and it is still wrong here, because Sophicly already teaches otherwise
   (root CLAUDE.md §5c: student-facing method derives from the protocols, never from general craft
   knowledge). Two research passes reached for the book and had to be corrected by the protocol.
5. **The two cards must cross-link as "not the same thing"**, in both directions, so a student who
   taps one from the other is told they are distinct rather than left to blend them.

Not a preference — a correctness rule. If a card, ask, guide or protocol says a flaw is what destroys
a tragic hero, that content is wrong.

---

## §22. ⭐⭐ THE INCITING INCIDENT AND THE STUNNING SURPRISE ARE TWO DISTINCT BEATS — teach both (Neil, ruled 2026-07-29)

**The ruling.** The course teaches Eric Edson's Inciting Incident and his Stunning Surprise as **two
separate beats**, not one. Neil ruled this after getting the logline blocks wrong twice himself:
*"Inciting incident and life-changing event — they're so similar to me that I can't tell the
difference… If I'm gonna get it wrong, definitely the students are gonna get it wrong."*

**The distinction, from the source** — `Model Answers/Model Answer Resources/Story Solution – 23
Actions All Great Heroes Must Take_nodrm.md` (Eric Edson, *The Story Solution*). These are separate,
numbered actions in Edson's own scheme, and the difference is WHEN they land and WHAT they do to the
goal:

| | Edson # | When | Effect on the goal |
|---|---|---|---|
| **Inciting Incident** | 4 | near the START of Act One (commonly 1–7 min) | introduces a **general, visible** goal |
| **Stunning Surprise #1** | 5 | the **END** of Act One (~25–35 pages) | *"suddenly transforms this general goal into a highly specific one"* |
| **Stunning Surprise #2** | 8 | the END of Act Two | destroys the hero's plan → Act Three |

**Why this is a correctness rule, not a preference.** Our content had them collapsed: the logline
bank's Inciting Incident card carried Edson's *Stunning Surprise* wording ("the stunning surprise —
the external event that shatters the protagonist's normal life"), so two blocks competed for one
beat while Edson's actual inciting incident — the event that introduces the **general** goal — was
not represented at all. The item was unanswerable by inspection. That is the same failure class as
§21: two genuinely different concepts taught with one definition.

**What must be true everywhere:**
1. **A beat is named for what it DOES to the goal**, not for being dramatic. "A shocking event that
   changes everything" describes both and therefore teaches neither.
2. **The Inciting Incident happens near the START and yields a GENERAL goal.** It is not the Act One
   curtain.
3. **The Stunning Surprise is the ACT-ENDING reversal** that makes the goal specific (#1) or destroys
   the plan (#2). It is not the opening disturbance.

   ⭐⭐ **ADDENDUM, 2026-09-05 (Neil) — rules 2 and 3 are about the JOB, never about the clock.**
   Verbatim, on being shown the corrected cards: *"there is a difference between an inciting incident
   and a stunning surprise, and **they may or may not use them in the same place**."*
   **The function is the discriminator. The position is a tendency.** Reading rules 2 and 3 as a
   placement rule — inciting incident in the first few minutes, stunning surprise at the act break —
   swaps one wrong definition for another, and the first cut of the notes cards did exactly that
   ("the event near the START", "the shock that ENDS AN ACT").
   ⭐ **Edson says so himself, in the passage this section already quotes:** *"Depending on story
   requirements, though, the Inciting Incident **can happen any time** in Act One."* (He adds:
   *"Most commonly it's within the first one to seven minutes"* — a tendency, and he gives
   ***Gladiator***, whose Inciting Incident lands 34 minutes in, five minutes from the end of the act.)
   **The consequence, made explicit: ONE EVENT CAN DO BOTH JOBS AT ONCE** — begin this story and no
   other, AND turn the general want into one specific plan — in which case the two beats coincide.
   More often a story lets the character want something vaguely first and makes it specific later,
   which is when they separate. So teach the two JOBS and let the student's own story put them in one
   moment or two; never teach either beat by where it sits.
   **Shipped wording to mirror rather than re-derive** (notes cards v2.6.211): `Ii` — *"…and it
   produces a GENERAL goal: get out, get even, get home. The job names it, not where it sits; it
   usually comes early, but it can land anywhere in the opening act. The Stunning Surprise does a
   different job — it makes a general want specific — and one event can do both at once."*; `Us` —
   *"…It often falls at the end of an act, but the job names it, not the timing — and where one event
   does both, the two beats land together."*
   **Enforced mechanically:** `bin/inciting-incident-gate.js` (in `pre-ship-check.sh`) fails on any
   student-facing sentence that names the inciting incident with stunning-surprise or
   "shatters-the-normal-life" wording, or that defines it purely by position without naming the
   general goal.
4. **"Life-Changing Event" is not an Edson term.** It appears only in the CW walk's logline template 3
   ("an opportunity to do something LIFE-CHANGING"). Where it stays, it must be taught as *the
   opportunity the protagonist chooses to chase* — which is a different thing again from both beats
   above — or be replaced by the Stunning Surprise.
5. **The beats must cross-link as "not the same thing"**, both directions, wherever a student can
   meet one from the other.

6. ⭐⭐ **THE GOAL IS ASKED FOR IN TWO STAGES, AND THE COURSE MUST ASK FOR THE RIGHT GRADE AT THE
   RIGHT STEP (Neil, ruled 2026-09-06 — FIXLIST #458d, "both, in two stages").**
   Rules 2 and 3 say what each beat DOES to the goal. This rule says what we may therefore DEMAND
   of a student, and when:

   | stage | where the course asks for it | what it is | test |
   |---|---|---|---|
   | **general want** | CW **Step 3**, block "5 of 7 — The goal" | a direction: get out, get even, get home | can you say it in a few plain words, and does it point somewhere? |
   | **specific plan** | CW **Step 6**, Stunning Surprise #1 at the Act One curtain | one finish line we could photograph them reaching | Hauge's test: not "get rich" but "a bank balance of £100,000" |

   **The defect this fixes, and why it was invisible.** Step 3's block 4 (the inciting incident) was
   corrected at v7.20.596/.597 to hand over a **general** goal and to say the specific plan comes
   later. Block 5 — the very next bubble — still opened *"That event hands your protagonist a goal"*
   and then demanded *"one physical, picturable finish line — we could photograph the moment they
   achieve it."* **Two consecutive asks contradicted each other**, and the student was required to
   invent, at Step 3, the plan that Step 6 exists to produce. Neither ask was wrong on its own; only
   the ORDER made the fault visible, which is why the .596/.597 sweep passed over it.
   ⭐ **Hauge's picturable-finish-line test is not withdrawn — it is RELOCATED.** It is the correct
   test for stage two and the wrong test for stage one. A craft rule that is right in general can
   still be asked at the wrong moment; check WHEN a test applies, not only whether it is true.
   ⚠️ **And the §22 addendum still governs:** because one event can do both jobs at once, the
   specific plan is **welcomed** at Step 3, never **demanded** — a student whose story hands over
   both in the same moment writes both, and is not marked down for having a plan early.
   **Enforced mechanically:** `bin/inciting-incident-gate.js` **rule E** fails any student-facing
   sentence that attaches picturable/photographable/"one specific" finish-line wording to what the
   inciting incident hands over. Prose alone had already failed here once.

**Where this lands** (all four carried the conflation; each is its own lane's work):
the CW walk in `wml-assessment.js` ("inciting incident" ×26, taught with Stunning Surprise wording) ·
the eight plot templates' beat rows · the Table of Techniques (`Ii` = Inciting Incident, `Tw` covers
the Stunning Surprise) · the logline matching bank in `sophicly-components`.

**Root note.** That bank was authored inside the components plugin rather than derived from the walk,
which is how two overlapping definitions shipped (root CLAUDE.md §5c). Where the walk itself derives
from a named source like Edson, the source is on the system and must be **quoted, not paraphrased
from memory**.


---

## §23. ⭐⭐ AN INTERRUPTED ATTEMPT IS RESUMED, NEVER BANKED (Neil, ruled 2026-07-30)

**The ruling.** Leaving a graded activity part-way through must **never** record a grade. Only an
explicit finish does. When the student comes back, they land in the **same attempt**, with their
earlier answers intact, at the first question they had not reached.

**What this replaces.** Components used to finalise an abandoned attempt on the student's next page
load — scoring it out of the full set, with everything unreached marked wrong. It was built to close
a real hole (start, see it going badly, close the tab, retry clean) and §13 above endorsed it.

**Why it changed — the case that broke it.** Neil, 2026-07-30: *"Shouldn't we make it so that the
only time it submits is when the student actually submits it? Just because they left the page and
came back — surely that shouldn't auto-submit, because sometimes I might be telling them to do stuff
in a live class where they have to transition to another page."*

A real student had already paid for it. Uid 1386 finished The Eight Plot Structures at **7/8, grade
8**, replayed it, answered 5 of 8, and left. Returning to the page banked **5/8, grade 5** — three
questions he never saw, marked wrong — and pulled his course average down. He did nothing wrong; the
rule charged him for an interruption.

**The farming hole stays shut — by a different mechanism.** Leaving buys no fresh start. The
in-flight answers are KEPT, so returning resumes the attempt in progress rather than offering a clean
one. There is nothing to escape into: you finish the run you began. A student who abandons forever
records no grade, but also gains nothing — the lesson stays unfinished.

**What must be true (all nine components with in-flight saving, no exceptions):**
1. **A page load NEVER commits an attempt.** Only an explicit finish writes a grade.
2. **Returning resumes** — answers restored, landing on the first unanswered item. If every item was
   answered but never submitted, land on the LAST one so the next action submits.
3. **No verdicts on resume.** Nothing was submitted, so nothing is marked right or wrong yet.
4. **Residue is discarded, not resumed.** A trailing progress-save can echo the attempt just
   committed; resuming that would drop the student back into a run they already finished.
5. **Server state beats the local draft** — the ruling exists for the student who returns on a
   different device or a cleared browser.

**Enforced mechanically:** `sophicly-components/bin/verify-inflight.js` fails if any component banks
on load, stops returning `resume`, ignores it client-side, or still carries the retired "your
previous unfinished attempt was graded" copy. The policy itself lives in ONE class
(`Sophicly_Components_Inflight`) so a component cannot drift from this ruling.

---

## §24. ⭐⭐ AN ARCHETYPAL PATTERN IS FOLLOWED BY DEFAULT AND DEPARTED FROM WITH A REASON (Neil, ruled 2026-08-02)

**The ruling, verbatim.** Reading the Step-6 Stage I bubble *"Yours will not match that exactly — it
is a shape, not a rule"*: *"I don't think it's right to say yours will not match that exactly. It IS
a shape, and it may or may not match that exactly. But we want them to TRY and follow the shape…
We don't want them to think it's a rule that they have to follow exactly as it is, but they need to
try. Right? And if they need to make edits, then there must be a reason, they must be able to
justify the edit, and it must be coherent and make sense."*

**THE POSITION IS A THIRD THING, not a midpoint.** There are three stances a student can take to an
archetypal pattern, and only the third is ours:

| stance | what it tells the student | why it is wrong / right |
|---|---|---|
| **RULE** — "your story must go: A → B → C" | a form to complete | Produces mechanical, joyless plotting; it is what §139's *"patterns, not rules"* was written to stop. |
| **SUGGESTION** — "yours will not match this" | the pattern is decorative | ⛔ **The over-correction, and the one that actually shipped.** It licenses ignoring the shape before the student has understood it, so the teaching is wasted and the plot loses its spine. |
| ⭐ **DEFAULT + JUSTIFIED DEPARTURE** | "aim to follow it; if you change it, know why, and keep it coherent" | **Ours.** The pattern carries real authority — these are the shapes stories keep landing on — AND the student stays the author. |

**WHY THIS IS THE PEDAGOGICALLY CORRECT ONE, and not just a tone preference.** A 13–16-year-old
cannot yet tell a *principled* departure from *not having thought about it*, and both look identical
on the page. Telling them up front that the shape will not fit removes the only reference they had
for judging their own choice. Requiring a REASON is what converts a deviation from an accident into
an authorial decision — which is the thing being taught. It is also exactly the standard the mark
scheme rewards (deliberate, controlled structural choices), so the demand is not arbitrary.

**HOW IT MUST READ, wherever a pattern is presented** (the shipped wording, v7.20.402):

> Aim to follow that shape — it is the one these stories keep landing on, and it works. Yours may
> not match it exactly, and that is fine: if you change something, know WHY you changed it and make
> sure your version still holds together.

Three moves, all required: **(1) endorse the shape** (it works, and here is why it has authority);
**(2) permit departure** without embarrassment; **(3) price the departure** — a reason, and
coherence. Dropping (1) gives the shipped defect; dropping (3) gives a rule with no teeth and the
student defaults to whatever they had already imagined.

**SCOPE.** Every archetypal pattern shown to a student: the six-stage skeletons, the eight plot
archetypes (Step 5), TTECEA and IUMVCC, the story spine, the 7-step scene. Not the mark scheme —
AO criteria are not a shape to depart from.

**Relationship to §139 (patterns, not rules).** This SHARPENS it, it does not contradict it. §139's
point was always that the archetypes are not a form to fill in — never that they will not fit.
Whoever wrote the shipped line read §139 and landed one step too far, which is why this section
exists: the same sentence has now been authored twice, and the second time it needed a rule.

## §25. ⭐⭐ RETELLING IS A LEGITIMATE CREATIVE ACT — imitation is not the enemy; the enemy is an ask that teaches nothing (Neil, ruled 2026-08-02)

Neil, pushing back on the zero-AI research's rule 5 ("more examples is the wrong lever — volume
increases copying"): *"I don't think it's a problem with students because they can never really
fully copy. Even with Shakespeare, Romeo and Juliet is not an original Shakespeare story — that's
Shakespeare taking a story that was popular during the time and he retold it in his own way. So I
don't see any problem with students doing the same thing. As long as what they end up with is a
story that is uniquely theirs… I don't think that it's strictly true, especially when it comes to
creative writing."*

**THE RULING.** Story-level imitation — taking a known story's shape, situation or premise and
retelling it — is a legitimate, even canonical, creative method, and no walk, protocol or feedback
surface may treat it as a fault. A student whose story is recognisably "Rebirth, but with an AI
empire" or "Christmas Carol, but a teenage girl" is doing what Shakespeare did, and is told so if
it ever comes up.

**WHAT SURVIVES OF THE RESEARCH FINDING, reconciled rather than averaged (root CLAUDE.md #7).**
The conformity-effect literature (Smith, Ward & Schumacher 1993) is about a NARROWER thing than
Neil is defending: when a single example sits directly beside a generate-ask, novices reproduce
that example's SURFACE FEATURES in that answer — the phrasing, the props, the specific move — which
displaces their own generation *on that beat*. That is not retelling; it is the ask short-circuiting
itself. So the design consequences stand ON DIFFERENT GROUNDS than "copying is bad":
- **Two contrasting examples + "what do they share?" beats one example** — not because imitation
  must be prevented, but because the comparison teaches the UNDERLYING MOVE, which is exactly what
  a student needs in order to retell WELL rather than transcribe.
- **Never model on the student's own story** — their material stays theirs to shape (the ownership
  law), not because borrowing is wrong.
- **"Add a constraint, not a fourth example"** stays as the fix for a weak ask — on teaching
  grounds, not anti-copying grounds.
Any copy, criteria line or feedback rule that penalises "derivative" story choices, or praises
"originality" as a virtue in itself, contradicts this section and is a defect.

## §26. ⭐ MOMENTUM OUTRANKS ENRICHMENT IN THE LONG WALKS (Neil, ruled 2026-08-02)

On the proposal to add error-spotting and richer per-beat exercises to Step 6: *"Part of what I
want them to do is actually just get through it — I want them to get through it well, but I don't
want them to get bogged down, because it is a lot of work for them to do. I have a feeling it's
gonna take us several sessions to get it finished."*

**THE RULING.** In a long walk (Step 6 is ~100 beats over several sessions), the default ask is
LEAN: criteria → example(s) → question → self-check. Enrichment moves (error-spotting, contrast-
before-telling, extra practice) are reserved for FIRST EXPOSURE to a beat type or served through
the help ladder on demand — never appended to every beat of a type the student has already met.
Sharpens §12 (forward motion) for the ~100-beat scale: the walk's job is a COMPLETED outline the
student owns, not maximal exercise per beat. Rough-now-polish-later (the drafts exist for depth)
is the standing frame; a beat that took three interactions when one would do is a pacing defect.

---

## §27 — EXAMPLES ON DEMAND ARE GENEROUS. The conformity finding governs the PUSH, never the PULL. (Neil, 2026-08-03)

**The ruling.** Neil, testing Step 6 live at Stage I beat 10 (False Identity), on the research
recommendation "more examples is the wrong lever": *"I have to disagree with that. What I found
really useful in the previous beats is just having the example button there, like more examples.
It was very, very helpful… I think having more is actually better."*

**He is right, and the evidence does not actually contradict him** — the two claims are about
different mechanisms, and the recommendation was written too broadly:

- **PUSH — examples stacked INTO the ask**, which the student cannot refuse. This is where
  Smith, Ward & Schumacher (1993) bites: more examples in front of a generator produces more
  feature-copying, and neither a delay nor an instruction not to copy reduces it. The design
  answer there is CONTRAST (two cases, "what do they share?"), not volume. **Unchanged.**
- **PULL — rung 1 `[💡 More examples]`**, which only a student who wants help ever taps. This is
  a different act: it is self-directed help-seeking by a student who has already read the criteria
  and one worked example and is still stuck. Kyun, Kalyuga & Sweller (2013) — worked examples in
  ENGLISH ESSAYS, our exact domain — found the condition that worked showed **several possible
  answers** per question, with the benefit concentrated in lower-prior-knowledge learners.
  Gentner, Loewenstein & Thompson (2003): comparison across cases is what abstracts the principle.

**So: be generous on the pull, disciplined on the push.** A rung the student reaches for should
not run dry in one tap; an ask should not grow a fourth example nobody asked for.

**Consequences for any walk (not just Step 6):**
1. **The examples rung serves ONE per tap**, not the whole pool at once — it survives as long as
   the student keeps wanting it, and retires only when genuinely spent (which is still Neil's
   .373 rule: *"once the three are done, that quick action button just disappears"* — it just
   takes three taps to get there now, not one).
2. **A retired rung still says something** — a spent pool must never read as a dead button (§4d).
3. **Growing the per-concept pool past 3 is a legitimate content job**, not a violation of the
   conformity finding, PROVIDED the examples are drawn from DIFFERENT stories (variation is what
   makes comparison possible; three examples of one text is the configuration that gets copied).
4. **Never model on the student's own story** — unchanged, and the reason the pull is safe: every
   example is a different text, so there is nothing to transcribe directly into their own beat.

**Supersedes** the flat reading of `research/2026-08-02-learning-without-ai-creative-beats.md`
rule 5 and recommendation 5 in `STEP6-RECOMMENDATIONS-2026-08-02.md`. Those rules stand for the
ASK; they do not govern the ladder. (Pairs with §4c.9 — the ladder is cheapest-first precisely so
a stuck student can spend as much FREE help as they like before reaching Sophia.)

---

## §28. ⭐⭐ PEER FEEDBACK IS THE PRIMARY NON-API CHECK — AND ITS PRECONDITIONS ARE NOT OPTIONAL (Neil, ruled 2026-08-06)

**The trigger.** Neil, reviewing a real student on prod Step 5: the *Thematic Message / Moral* box
held a 120-word retelling of the plot. *"That's got nothing to do with the moral. This is the
problem when you don't have AI… I don't wanna use any API calls, but at the same time, this is the
type of thing that'll slip through the net."* Then, on the answer: *"peer review has to have hard
preconditions, explicit criteria, training — exactly what you've said there… if we're trying not to
use API calls, then what we need to do is leverage peer feedback, which is totally doable. But it
has to be done very, very well."*

**THE RULING.** Where a written answer needs checking and we do not want to spend a call, **the
check is a PEER, working from the same criteria card the author was given.** This is not a
second-best substitute for an AI check — on the evidence it outperforms one.

**THE EVIDENCE** (`research/2026-08-02-learning-without-ai-creative-beats.md` §5):
- **Graham & Perin (2007)** — peer assistance **0.75** for adolescents; a top-five writing intervention.
- **Graham, Hebert & Harris (2015)** — peer feedback **0.58**, *above* computer feedback at **0.38**.
- **Gielen et al. (2010)**, secondary-school writing — a **single peer's feedback was as effective as
  the teacher's comments**, and **"justified" comments (carrying a reason) beat unexplained ones.**

**THE PRECONDITIONS, and a peer route does not ship without them** (Topping's reviews; the failure
mode is well attested): **explicit criteria · training · modelling of how to assess · repeated
practice.** Unstructured peer response *reliably* degrades into praise and proofreading, and turns
actively harmful when it becomes personal (Kluger & DeNisi — >⅓ of feedback interventions made
performance WORSE, and the harmful ones aimed at the person, not the task).

**THE DESIGN RULES that follow, and they are what make it safe:**
1. **The peer answers the SAME criteria items about someone else's answer** — never a free-form
   "what do you think?". Our criteria card IS the training artefact; the precondition is something
   we already produce.
2. **A reason is REQUIRED per item.** Gielen: justified comments carried the effect. A comment
   without a reason is not a comment.
3. **Task, never person** (§18, Hattie & Timperley) — the form should make a personal remark
   structurally hard to write, not merely discouraged.
4. **The author must see that it happened** and be able to act on it — a peer check the student
   cannot reach is not a check (Neil: *"it needs to be something that's reachable to the student…
   to show that they've signed off on it"*).
5. **Correct the GROUNDING, never the reading** (the §Corrective-Feedback ownership line). "Your
   moral is wrong" is injection; "that is what HAPPENS — what does it MEAN?" is task-level.

**WHO GETS A PEER — availability, NOT tier (Neil's correction, 2026-08-06).** *"Even students on a
silver package, it doesn't mean that they won't have someone to study with. It's just gonna be less
likely."* So the gate is **"is a peer available?"**, never "which tier are they on". Gold/Platinum
have a group of ≤16 so a peer is structurally there; Silver is link-only and not in an attendance
group, so pairing them needs its own mechanism (an invite, most likely) — **an open product
question, not an assumption.** Where no peer is available, the fallback is the batched API check.
**Encourage it for everyone; require it of no one who has nobody.**

**WHAT THIS DOES NOT LICENCE.** Peer feedback replaces neither the tutor's marking nor the
protocols. It is a check on whether an answer is ON TASK, done by someone holding the same criteria.

---

## §29. ⭐⭐ THE PLOT OUTLINE IS A LIVING DOCUMENT THAT MOVES FORWARD — append, then AMALGAMATE; each step keeps a snapshot (Neil, ruled 2026-08-06)

**The shape of the whole CW project, in his words:** *"each stage is just a snapshot, but the plot
outline is almost like a project within the project."* The outline is drafted once (Step 6), then
revisited seven times (Steps 8, 12, 15, 18, 21, 24, 27), each pass adding one conceptual lens —
values, goals, archetypes, empathy, theme/tone, genre, structural elements. **The drafts of the
scene will work the same way** — one scene, repeatedly improved, each draft a snapshot.

**"LAYER" IS CONCEPTUAL, NOT STRUCTURAL.** Ruled explicitly, because the opposite was nearly built:
*"they're adding more information for depth, but it's not necessarily a literal layer… it could just
be the student adds some information and then tweaks what was there before, and it becomes an
amalgamated new piece. It's creative writing — there could be a lot of different ways that the
student approaches it, but it becomes a more advanced version of what was there before."* So:

1. **The walk APPENDS.** Each beat's new material is auto-filed *underneath* what was seeded —
   nothing is ever overwritten by the system (his standing ruling, 2026-08-05).
2. **The student AMALGAMATES.** They manually merge the appended material into the beat, advancing
   it *"in the way that they think is most appropriate."* The seam is meant to dissolve. This IS the
   pedagogy — the merge is where the deepening happens; do not automate it, do not preserve the
   layers structurally, do not build a mechanism that keeps "from Step 6" separable.
3. **The living outline MOVES FORWARD.** After Step 8, Step 8's document is the outline; Step 6's is
   a frozen snapshot of what the student could do at that stage. Each update step seeds from the
   nearest earlier plot step and becomes the new home. *"Not only does each step seed the next one —
   each outline step becomes a snapshot of what was done at that stage. That's really what the whole
   project is about."*

**CONSEQUENCES FOR MECHANISM — ⭐⭐ THE CW MIRROR, RULED BY NEIL 2026-08-06 (his "yes" after the
append-vs-replace walk-through; supersedes the first draft of this block, which barred CW from the
mirror entirely — an overcorrection he caught). CW JOINS the automatic forward flow, with ONE
substitution:**
- **Relay (already built):** `6 → 8 → 12 → 15 → 18 → 21 → 24 → 27`, nearest-earlier-with-content,
  first-open copies the whole doc (`cw_seed_lineages`, class-rest-api.php ~5700).
- **Reseed-until-started** — YES for CW, same as Phase 2: an untouched downstream doc keeps
  re-copying upstream on every load; looking never freezes anything; the student's first real work
  in the doc freezes it. ⚠️ The CW freeze fingerprint must IGNORE derived cards (Document
  Progress text changes without the student typing) or docs false-freeze.
- **Automatic per-beat mirror after start — YES. Neil's rule: changes flow forward down the chain
  automatically, "unless the one in the subsequent step is newer."** That gate is newest-edit-wins,
  identical to literature's arbitration. **The ONE substitution: when upstream is newer AND the
  downstream beat has content, the new material APPENDS under the beat — never replaces.** The
  student amalgamates it: the same move the walk teaches. WHY not replace: literature's shared
  fields are single-valued (keywords are keywords in every lesson) so latest-wins-replace keeps one
  coherent value; CW beats FORK by design (each stage's version is an advancing snapshot), so
  replace would silently destroy amalgamation work — the exact data-loss class the Question-Focus
  repro (2026-07-14) killed in literature, and a breach of the standing append-never-overwrite
  ruling. Empty downstream beat → plain copy-in. Downstream newer → nothing moves (the frontier
  case — the normal case).
- **Engineering obligations riding the build:** a per-beat last-appended baseline so a reload can
  never append the same edit twice (extend the pull-stamp machinery) · the append must be VISIBLE
  when it lands (a change the student cannot see is a change that did not happen) · never backwards
  · never into a doc mid-walk without the walk knowing (the walk owns the screen while active).
- **No dot, no manual pull.** The pull FAB was retired at v7.20.75 by Neil's own ruling ("the chain
  feeds forward itself"); the automatic append-mirror re-earns that ruling for CW. The soft gate
  stays: the walk opens with "this builds on your finished Step 6 — [Go to Step 6] [Continue
  anyway]" — teach, never force (Neil, same day: no forced linear progression; extreme cases may
  legitimately skip lessons).
- Going back to an earlier step stays an exception, not the flow — but with the append-mirror it is
  a SAFE exception: nothing done downstream can be lost by it, by construction.

**AMALGAMATION TIMING — RESEARCHED AND ANSWERED, same day** (two Opus agents, convergent; full
returns + citations in `research/2026-08-06-amalgamation-timing-and-successive-refinement.md`):
**PER BEAT, immediately after that beat's new material** — Neil's assumption, confirmed, with a
sharper reason than freshness. The "distance improves revision" tradition is not violated: the
distance is ALREADY BANKED, because drafting (Step 6) and amalgamating (Step 8+) are separate
lessons — Chanquoy (2001) condemns only revising-while-composing. Within the session, batching six
beats maximises exactly the cognitive load that pushes novice adolescents to surface edits
(Kellogg 2001; Bereiter & Scardamalia CDO). Three-part shape for every plot-update walk:
1. **Per-beat amalgamation, one operation at a time**, the new material kept visible beside the
   beat (WM externalised — Gathercole & Alloway).
2. **Scaffolded CDO-shaped ask, never "improve this":** what does the new material say this beat
   should show? · where doesn't your version show it? · rewrite the beat. Criteria-first beats
   models-first ~3× (Graham & Perin 0.82 vs 0.25).
3. **One short whole-stage continuity pass AFTER the six beats** — reread for contradiction only,
   not re-revision (the last-phase effect; the one thing batching would have bought).
Plus the project-shape rules: each pass opens code-served (lens + criteria + one-line state recap,
never a re-read) · progress is a PROCESS goal ("Lens 1 of 7 built in") · passes 6–7 (genre,
structural elements) must be the SHORTEST — most revision gain lands in the first ~5 passes and
perceived repetition is what kills long projects. ⭐ **The biggest named risk is SURFACE DRIFT,
not fatigue** — novices tinker instead of revising; the lens-with-criteria design is the
countermeasure and must not be diluted. (Confidence: moderate — no study tests beat-level batching
in creative writing directly; limits recorded in the research file.)

---

## §30. ⭐⭐ A PLOT-UPDATE WALK ITERATES OVER THE LENS, NOT OVER THE PLOT — trait by trait, tapping real beats (Neil, ruled 2026-08-07)

**The question §29 left open, now closed.** §29 fixes *when* amalgamation happens (per beat) and
*how* the material lands (append, student merges). It never fixed **what the walk loops over**, and
the two obvious answers both fail on arithmetic:

| shape | asks | why it fails |
|---|---|---|
| **per STAGE** (what `CW-STEP-08-update-plot-values.md` currently says) | 7 | *"Which of your values are visible in this stage, and in which beat?"* is a **menu** — root `CLAUDE.md §18`: the student names one and skips the rest. 23 traits offered, ~3 answered. |
| **per BEAT** | ~700 | Step 6 emits **98–108 beat rows** (~17 per stage). Seven update steps × 100 beats is not a lesson. |
| ⭐ **per TRAIT** (RULED) | ~24–36 | Walk the **flagged traits only** (~8–12 of Step 7's 23), each ~3 taps. |

**THE RULING — the walk iterates over the LENS's own items.** For Step 8 the lens is values/traits,
so the unit is **one trait at a time** (root `CLAUDE.md §18` serial: one item, one verdict, next).
Per trait:

1. **Show the trait with its own worked example** — the thing a menu structurally cannot do (§18).
2. **The student TAPS the real beat rows where it shows** — picks from their own Step 6 outline,
   never a paste, never a retyped beat (WML `CLAUDE.md §3`: never ask for what the system holds).
   Multi-select, because the honest answer is often two or three beats (`CLAUDE.md §4c.8`).
3. **"Doesn't show anywhere yet" must cost exactly one tap** — that answer is the *interesting* one
   (it names an unexpressed trait), so it is cheap and it is not a failure state.

**THEN amalgamate only what was tagged** — typically **~10–20 beats**, not 100, per §29's per-beat
CDO-scaffolded shape, followed by the one whole-stage continuity pass. The beats nobody tagged were
never claimed to express this lens, so there is nothing there to merge.

**WHY THIS IS THE RIGHT UNIT AND NOT JUST THE CHEAP ONE.** The lens is the *teaching*; the plot is
the *material*. Looping over the plot asks "what is in this beat?", which is description and invites
the surface drift §29 names as the biggest risk. Looping over the lens asks "where does my story
show this, and if nowhere, why not?" — which is the transferable question, and it is the one that
makes an absent trait visible instead of invisible.

**GENERALISES TO ALL SEVEN PLOT-UPDATE STEPS** (8, 12, 15, 18, 21, 24, 27): each iterates over its
own lens's items — goals, archetypes, empathy beats, theme/tone, genre conventions, structural
elements — never over the ~100 beats. ⚠️ **Passes 6–7 must still be the SHORTEST** (§29), so their
item lists get pruned hardest.

⚠️ **The protocol markdown is now the stale surface.** `CW-STEP-08-update-plot-values.md` describes
the per-stage menu and must be rewritten to the trait-first shape in the same batch as the walk —
it is the source of truth (WML `CLAUDE.md` §1: protocol files are content) and a walk that
contradicts it will be re-derived wrongly by the next model.

---

## §31. ⭐⭐ FORCED **DECISION**, NEVER FORCED **REVISION** — and the intervention goes at the COMMIT POINT, not at every draft (Neil, ruled 2026-08-16)

**THE QUESTION.** Step 3 asks a student to write three loglines and choose one. What should happen
when the review judges one of them weak? Neil's instinct: *"my instinct is to say an unskippable
sharpened pass, but you might wanna do some research on that because I don't really know what would
be the best solution."* He delegated the judgment and then confirmed the answer below.

**THE RULING, in two halves.**

**1. A quality bar may force a DECISION. It may never force a REVISION.**
- *Forced revision* — "you may not continue until you rewrite this" — is **gameable**, and its
  cheapest escape is to type anything (Baker et al. on gaming the system, summarised in
  `research/2026-07-29-habits-of-mastery-surface-vs-deep-and-gaming.md` ⚠️ *named, not quoted — the
  abstracts are not held; pull the papers before citing any number*). It also collides head-on with
  **§19**: the student already self-assesses against stated criteria on every Step-3 ask, an
  unticked box buys ONE follow-up, and *"an unticked box costs nothing, and the follow-up is an
  OFFER. **A tick list that gates progress becomes a lying game.**"* Stack a hard gate on top of a
  tick list and you have taught the student that the honest tick is the expensive one.
- *Forced decision* — "you must SEE the verdict and choose: sharpen · keep · pick another" — is
  **not gameable and still unskippable.** There is no cheap escape because there is nothing to fake:
  every branch is a legitimate answer. It respects **§12** (a decline is final) and **§26**
  (momentum): one tap when the work is fine.
- The counter-authority is real and stated so nobody re-derives it as settled: Lemov, *Teach Like a
  Champion* Tech. 2 — *"Do not accept partially or almost right answers; hold out for all the way."*
  That governs a **live teacher** reading a **single** answer. It does not license a machine gate
  over a student's own three drafts.

**2. PLACEMENT BEATS MECHANISM — put the one intervention at the point of COMMITMENT.**
A weak draft among several is **practice** (§12 protects the three-lens repetition, and the whole
point of writing three loglines is that two of them are worse). **The damage is CARRYING a weak one
forward** — in Step 3's case into Steps 4→10, where the chosen logline becomes the spine and then
the story. So the intervention belongs at the **choice**, not at each draft: show the verdict on the
sentence they are about to commit to, name what it will cost downstream, and offer sharpen / keep /
re-pick. One decision, at the only moment it changes anything.

**GENERALISES.** Any walk with *N drafts → pick one*, or *N attempts → submit one*, or a step whose
output every later step is built on. Ask: **where does a weakness stop being practice and start
being load-bearing?** That point, and only that point, earns the gate — and the gate is a decision.

**AND A VERDICT MUST BE HONEST ABOUT ITS OWN ABSENCE.** "I checked and it holds", "I checked and it
is fuzzy", "I could not check", and "you rewrote it after I checked, so I have not read this
version" are FOUR different statements, and a student must never be shown one when another is true.
A check that silently fails open and a check that passed look identical from the outside — that is
what #377 was (the Step-3 review payload was built and never sent for three weeks, so the quality
check never ran once and the walk waved every student through). Root §10 fail-loud, in pedagogy
clothes: *never tell a student their work was checked when it was not.*

**Shipped:** v7.20.525, `_cwLoglineCtl` (`serveChoiceDecision` / `verdictLine`); gated behaviourally
by `bin/cw3-sim-harness.js` I12–I15, statically by `bin/cw3-batch-harness.js` §4b.

---

## §32. ⭐⭐ THE TEACHING ORDER STARTS WITH THE CRITERIA — assessment literacy BEFORE structure (Neil, ruled 2026-08-15)

**⚠️ THIS RULING WAS LOST FOR TWO DAYS.** Two lanes wrote it up on 2026-08-15 — the assessment lane
and the forms lane — and both handoffs said, correctly, *"PEDAGOGY.md is the rulings register and it
is your file."* Both were filed. Neither was read, because an inbound ask had no delivery path: the
session-start hook prints 128 handoffs for this lane and nobody reads 128 lines. Recorded here on
2026-08-17 after a probe found **zero** occurrences of "assessment literacy" in this file. The
process failure is logged because it is the exact thing root `CLAUDE.md` §SESSION HANDOFF exists to
prevent, and it still happened.

**HIS WORDS, and the load-bearing part is the ARGUMENT, not the list:**

> *"We do teach in a certain order. We teach the students about understanding the mark scheme first,
> which means understanding the criteria. Because the problem with most of these students is a lot
> of them don't even really understand what they're even being assessed on. **So they've actually
> got nothing to aim for.** And what's happening is they're either writing in a random way just to
> get it done, or they're just following the teacher's instruction just because they've been told to
> do that, without really understanding why the teacher says do it like this. And so what we want
> them to do is actually understand the criteria themselves."*

He named the concept himself, unprompted: **assessment literacy**, placed under metacognition, and
attributed to **Hattie**.

**THE ORDER, now SEVEN steps — a new FIRST rung was ruled 2026-09-07 (see the amendment below):**

| # | step | note |
|---|---|---|
| **0** | ⭐⭐ **Understand what the subject IS: it is about humanity** | *"That's what literature is about. English language and literature. It's about humanity"* — reading a text = working out which human problem the writer is exploring and what they say about it. *"That's where a lot of the marks lie."* |
| 1 | **Understand the criteria / mark scheme** — assessment literacy | *"they'll need to just keep on coming back to it"* — RECURRING, not a one-off |
| 2 | **Practise the structure** (five-paragraph essay, 20+ mark questions), **MACRO → MICRO** | *"once they've done that, then they'll understand WHY a five-paragraph structure is really important"* — and the work inside it is ordered whole-answer → paragraph → sentence (amendment below) |
| 3 | **Identify strengths and weaknesses** | |
| 4 | **Redraft**, targeting a 7, 8 or 9 each time | |
| 5 | **Portfolio** — every draft/redraft reaching 7/8/9 is stored | *"when the exam comes, you then use those for revision"* |
| 6 | **Structure and routine**, never crammed | *"cannot afford to leave it to the night before the exam, or even one week before, even two weeks before… it's essentially a gamble at that point"* |

**⭐ THE ORDER OF 1 AND 2 IS THE RULING, AND IT IS COUNTER-INTUITIVE.** The instinct — and what the
assessment report actually shipped — is to lead with STRUCTURE, because structure is the single
biggest lever on marks. He rules the opposite, and the reason is causal rather than tidy: **structure
taught before the criteria is a formula the student follows without knowing why**, which is precisely
the failure he is describing. Step 2 only *means* anything once step 1 is in place. Do not "optimise"
this back to structure-first on lever size; that is the mistake it was written to stop.

**PROOF IT WAS LIVE, not hypothetical.** `Forms/Sophicly Assessment Form/index.html:830` carried
`LEVER_ORDER=['structure','analysis','assessment',…]` — structure first, assessment **third**, the
reverse of the ruling — and `sfFocusPick()` sorted the report's "Start here" recommendation by it, so
a student whose weakest area WAS assessment literacy could be told to start with structure. Fixed in
the assessment lane (v1.2.3, `ec5fe95`), now `['assessment','structure',…]`, gated by
`sophicly-assessment/bin/regress-preview.mjs` — proved by injecting the reversal and watching it fail.

**WHAT IT BINDS IN WML.** Any surface that decides **what a student is told to work on FIRST**:
anything ranking weaknesses into a "start here", the planning protocols' opening moves (does the
student meet the criteria before the structure, or after?), and sidebar/step ordering where a student
picks what to do next. ⚠️ **An exception is allowed but must be WRITTEN DOWN.** If a WML surface
deliberately orders it differently for a good reason, record it as a stated exception under this
ruling — never as a silent divergence. The ruling is about the TEACHING sequence; it is not
automatically a claim about every UI ordering.

**⚠️ A PROSE/CODE DRIFT THIS SURFACED, now fixed.** WML `CLAUDE.md` summarised the intro as
"Hook · Context · Thesis". The real element in `OUTLINE_CRITERIA.literature`
(`frontend/wml-assessment.js:49262`) is **`Building Sentences`** (AO3, "contextual backdrop"), and
there is a separate `Context` element in the BODY set — so a model authoring a student-facing
"Context" intro line from the prose would name an element that does not exist. Verified against the
code and corrected in `CLAUDE.md` the same day. Conclusion elements are as documented: Restated
Thesis · Controlling Concept · Author's Central Purpose · Universal Message.

### §32a. ⭐⭐ AMENDMENT (Neil, ruled 2026-09-07) — a FIRST rung before the criteria, and structure work runs MACRO → MICRO

**His words, verbatim** (forms-assessment FIXLIST FA-038, recorded into WML on 2026-09-07 from
`forms-assessment-to-wml-THE-TEACHING-ORDER-GAINS-A-FIRST-RUNG-2026-09-07.md`):

> *"Actually try and get them to understand what the subject is about. It's about humanity. That's
> what literature is about. English language and literature. It's about humanity. And so when
> they're reading these texts, all they're doing is trying to evaluate what human issues the author
> is responding to and talking about and exploring. That's where a lot of the marks lie. Then we
> need to try and understand what exactly we're actually being assessed on…"*

> *"Now when it comes to essays, we actually get them to fix their essay structure first. So like
> the overall structure. So five paragraphs… Once they've worked on that, we then get them to refine
> each paragraph. So if you see what we're trying to do, we're basically going from the macro to the
> micro… And then once they've sorted that out, then we'll get down to things like sentence length,
> vocabulary."*

**TWO RULINGS.**

1. **STEP 0 — the subject is about humanity, and it comes BEFORE assessment literacy.** A student who
   does not know that a text is an argument about people has nothing for the criteria to attach to.
   The reading job is: *which human problem is the writer exploring, and what are they saying about
   it?* This is the same chain root `CLAUDE.md` §5c-ii.2 already demands of every explanation
   (**deficit → arc → argument**) — §32 step 0 is that chain stated as the teaching order's first
   rung, not a new idea.
2. **MACRO → MICRO inside step 2, in this order and no other:** whole answer (how many paragraphs and
   what belongs in each) → each paragraph's elements → **last** sentence length and vocabulary.
   ⛔ Sentence-level and vocabulary work before the whole-answer shape is polishing a structure the
   student cannot yet build — the same failure §32 names for structure-before-criteria, one level down.

**⚠️ THIS DOES NOT REOPEN "DO NOT ADD A SEVENTH STEP" (Neil, 2026-08-15).** That prohibition was aimed
at making `analysis` a step of its own, and it still holds. This adds a rung at the TOP and orders the
work INSIDE step 2; it does not promote analysis.

**WHAT IT BINDS.** Anything that sequences teaching or targets: the planning protocols' opening moves,
any "start here" ranking, redraft targeting (fix the shape before the sentences), the polishing
protocols when they get a standard (§6 Q1 of the 2026-09-07 START-HERE), and any student-facing
explanation of why we teach in this order. Shipped in the assessment report at v1.2.20 (`b9cfb2ff`)
with seven rungs, humanity first, and the three shapes named — TTECEA+C (analysis) · IUMVCC
(persuasive) · story spine (narrative).

⚠️ **A COVERAGE GAP THE SAME HANDOFF SURFACED, not a ruling:** Neil described OCR as Language Paper 1,
and `protocols/ocr/` holds only `literature` and `poetry` — **no OCR Language protocols exist.** That
is a hole in the port roadmap (§4.8 of the START-HERE, "24 unported cells"), not an error of his.

## §33. ⭐⭐ THE CW TRIALS + EXAMINER-LADDER SELF-ASSESSMENT — the rulings the build stands on (Neil, ruled 2026-08-21; placements delegated and settled 2026-08-22)

Full feature plan: `CW-TRIALS-AND-SELF-ASSESSMENT-PLAN-2026-08-21.md` (plugin root). The rulings,
so no lane re-asks:

1. **A trial is a FOCUSED DIAGNOSTIC on its own dimension** (Neil, 2026-08-21). The full AQA
   40-mark AO5+AO6 assessment runs ONCE, at the end. Trials do not re-mark one another (§27's
   different-dimensions premise holds).
2. **Trials FEED THE GRADE RING — "definitely"** (Neil, 2026-08-21). A trial cannot be gradeless;
   its diagnostic verdicts must convert to a mark the ring can aggregate (#409).
3. **The criteria carry NO BOARD LABEL** (Neil, 2026-08-21): *"we're not gonna label it AQA even
   though we use the criteria… we don't have to give it a label."* Descriptors are still lifted
   VERBATIM from AQA's document and gated (`bin/markscheme-gate.js`); only the student-facing
   label goes. This is what lets every summer CW student, whatever their board, see one criteria set.
4. **The examiner ladder is BOTTOM-UP** (Neil, 2026-08-21, from his own 1:1 teaching — supersedes
   FIXLIST #221 step (1)'s top-down pick): read Level 1, prove every criterion, climb; on the first
   level not fully met, place top/middle/bottom of it. The student marks their own work (§19); the
   mark arithmetic is CODE from band + placement, never a number the model (or the student) invents.
   The rest of #221 survives: reason banked verbatim · re-openable · model answer auto-filed ·
   reuse the existing sign-off machinery.
5. **Scope is language and literature too, not just CW** (Neil, 2026-08-21) — so the ladder is
   AO-generic over (AO, levels, descriptors, band edges) and a new paper is a DATA job. The data
   pipeline (one source md → generated dataset → divergence gate) shipped as slice 1, v7.20.544.
6. **The final 40-mark assessment sits after Step 29 (SPAG polish), before Step 30 (reflection)**
   (suggested 2026-08-21; Neil delegated the call 2026-08-22 — "wwad"). AO6 IS technical accuracy:
   marking before the SPAG step scores errors the student is about to fix; after Step 29 the mark
   is of the finished piece and Step 30 has something real to reflect on.
8. ⭐⭐ **THE RING GETS SOPHIA'S MARK, NOT THE SELF-MARK** (Neil, 2026-08-23, deciding the open
   question left by plan §4/#409). The order is fixed and it is the whole design: the student
   judges every criterion FIRST and their verdicts are banked before Sophia is asked anything
   (§19 — a judgment formed after hearing hers is not theirs); she then marks the same piece; and
   **the gap between the two is the teaching**. The ring aggregates HER number, because a
   self-reported grade that a parent reads as attainment is gameable in seven taps. Her job is the
   per-criterion VERDICT (judgment, which is a model's work); the arithmetic on top of it is CODE
   through the one canonical ladder — she is explicitly forbidden from stating a number, and a
   grade she writes in prose is ignored. Shipped for Trial 1 at v7.20.551; the same shape carries
   to Trials 2–6.
   ⚠️ **The filing path does not exist yet, and it is the dashboard lane's, not ours.** Measured
   2026-08-23: `sophicly_cw_trial_saved` has **zero consumers** anywhere in the monorepo, and CW
   writes one *ungraded* progress row per project (`session_id = cw_project:{id}`). WML now saves
   the full result (both judgments, marks, percent, grade) with every finished trial, so the ring
   has real data the day the consumer lands. Handoff: `wml-to-dashboard-cw-trial-grades-*`.

7. **Trial 6 moves to follow Draft 6 (Genre, step 26 — was 25 before the v7.20.568 renumber) as a genre-focused trial** (same delegation),
   so all seven drafts get assessment coverage and "comprehensive final feedback" lives only in the
   finale — Trial 6's old stub duplicated the final assessment's job.

9. ⭐⭐ **FEEDBACK ORDER: GRADE LAST AND QUIET, END ON THE STUDENT'S ACTION** (Neil, ruled
   2026-08-23, on the research `research/2026-08-23-trial-feedback-shape-and-ao-anchoring.md` —
   Butler 1988 / EEF 2021: a leading grade swallows the comments). The marking turn leads with the
   per-element verdicts → the disagreements → the priority for the next draft; the grade is a plain
   closing line, never the headline. The turn ENDS on a closing ask — *"your one target for
   Draft 2, in your own words"* — banked verbatim and seeded into the next draft step's opener
   (EEF rec 3 / Wiliam: feedback must be USED).
10. ⭐⭐ **THE TRIAL SELF-MARK IS AN EXAMINER WALK — the student marks the way a real examiner
   marks** (Neil, ruled 2026-08-23, superseding the same-day /14 met·partly·not confirmation;
   his words: *"I want them to learn how the examiners mark. I think that's really, really,
   really important"*). Per element: levels presented BOTTOM-UP, one at a time; *"meet all of
   this?"* → climb; stop at the level not fully met and place BOTTOM or TOP within it. Mechanics,
   all ruled the same session:
   - **Minimum 2 marks per level** (his check against the real schemes is correct — AQA's
     8-markers run 4 levels × 2 marks; no published GCSE scheme has 1-mark levels). So each
     element = 2 levels × 2 marks = **0–4** (nothing creditable 0 · Level 1 = 1–2 · Level 2 =
     3–4), seven elements → **/28**. Arithmetic stays CODE through the one canonical ladder.
   - **A level once presented is NEVER removed from the screen** — the student may climb, then
     realise they had not met the lower level, and come back down. Judgement revisable until the
     element is confirmed.
   - **Defend the mark**: an evidence sentence is required when claiming Level 2 (*"show me the
     line that proves it"*) and when stopping at a lower level (Panadero/Boud — self-assessment
     works when justified against criteria).
   - Level descriptors are the TAUGHT-element bars (derived from the teaching steps), NOT board
     descriptors — ruling 1 (focused diagnostic) and the finale-only verbatim-ladder rule stand.
     This amends the MECHANIC of the trial self-mark, not its content.
   - Sophia marks on the SAME 0–4 scale per element; ruling 8 (her mark feeds the ring, code
     arithmetic, no model-stated numbers) is unchanged. The calibration gap compares like-for-like.
11. **AO ANCHORING AS FRAMING** (Neil, ruled 2026-08-23): every trial badges its dimension under
   its AO family, plain words FIRST, code attached — *"everything in this trial is what the exam
   calls AO5: Content and Organisation"*. Trials 1–5 = AO5-family; Trial 6 + the finale's SPaG
   strand = AO6-family. Criteria stay the taught elements; verbatim descriptors stay in the
   finale's examiner ladder. ⚠️ AO5/AO6 are AQA + Edexcel GCSE codes (Edexcel IGCSE: AO4/AO5;
   Cambridge: W-codes) — lead with the NAME, attach the code, per ruling 3's one-surface premise.
12. **PROGRESS REPORTS CARRY THE TRIAL GRADE AND THE CALIBRATION GAP** (Neil, ruled 2026-08-23):
   how close the self-judgement ran to Sophia's — a real metacognitive metric (Panadero/Boud)
   that should shrink as the student learns what quality looks like. Specified in the dashboard
   handoff's payload.
13. ⭐ **ALL OTHER ASSESSMENTS ADAPT TO THE EXAMINER-WALK METHOD over time** (Neil, 2026-08-23:
   *"even for literature and language and stuff like that, we need to start adapting it to this
   method"* — there, with the boards' real level counts). Direction recorded, NOT built: trials
   are the proving ground first; the lit/lang adaptation is a roadmap item, not part of the CW
   slices.
   ⭐⭐ **BUILT for AQA Language P1 / P2 and unseen poetry at v7.20.604–.605 (Neil's brief,
   2026-09-06: *"we're not forcing them to really engage with the mark scheme and try and determine
   what level they think they are and why"*).** Before marking, the student walks the board's own
   verbatim descriptors for every assessed question × AO — bottom-up, every level read — in the
   **BEST-FIT regime of §35** (rung question *"is your writing still better than this
   description?"*, never a hurdle), then names the criteria met, places the mark inside the level
   (arithmetic, never typed), and justifies it against the descriptor and their own evidence. Level ·
   band · met · mark · reason file into the document section *Mark-Scheme Self-Assessment*; one
   confidence tap follows (kept — it never replaces the ladder); Sophia is handed the student's own
   marks and the Calibration Check compares against THEM. The CW trials keep §33.10's taught-element
   regime — different job, deliberate. Data: `bin/markscheme-sources.js` (a new paper is a registry
   row). Open: whether the blind 19-skill walk stays alongside it (FIXLIST #472), and the AQA
   Literature dataset rows (#473).
14. ⭐⭐ **TRIAL 1 CARRIES A SECOND DIMENSION — TECHNICAL ACCURACY, OUT OF 2 (Neil, ruled
   2026-08-25, testing .558; he acknowledged it overrules rulings 1, 6 and 11 above for the
   trials).** *"With the real GCSE for creative writing there's actually two sets of criteria —
   AO5 for content and organisation, and AO6 for technical accuracy. Once they've finished
   assessing the seven elements, give them one more criterion, out of two: one = 'some mistakes
   are common', two = 'accurate spelling, punctuation, grammar' — that pushes it up to thirty."*
   So: the seven scene parts (/28) are the **Content and Organisation** dimension; **Technical
   Accuracy** (/2) follows; the trial is /30. The two dimensions are NAMED plainly in the
   orientation with the codes attached (AO5 / AO6), with the caveat that **Edexcel IGCSE numbers
   them AO4 / AO5** and **Cambridge IGCSE folds accuracy into its one Writing objective (AO2,
   W1–W5)** — framed as *"mock practice for understanding these assessment objectives"*. The
   engine derives everything from the element's `outOf` (a 1-mark level offers Yes / Not yet
   only; Sophia's tokens for it are `none|l1|l2`), so a third dimension is data, not code.
   Ruling 6 still governs the FINALE (full AO5+AO6 after the SPaG step); this ruling is about the
   trial's early exposure to both objectives. Shipped v7.20.559 (FIXLIST #431).
15. ⭐⭐ **A TRIAL CARRIES THE FULL ASSESSMENT SHAPE — grade goal upfront · calibration question ·
   "How am I going? / Where to next?" — THEN the target (Neil, ruled 2026-08-25, overruling the
   engine lane's "skip it for a 20-minute trial").** His reason, verbatim: *"it's very possible for
   some of these students this may be the only assessment that they do for creative writing
   because some of them will work so slowly."* So the trial mirrors the Lang P1 protocol's spine
   (2a grade goal · the Calibration Check with its direction-adaptive question · the Final
   Summary's two questions), all CODE-served (§4 programmatic-first — still one API call): goal
   chips 7/8/9 banked to `cw-trial-1-goal`; after the reveal, self − Sophia over /30 with a ±2
   tolerance → a statement when within it, otherwise "which part drove the gap?" with the three
   largest gaps as chips, answered from her verdict + example + the over/under-marking habit;
   then How am I going? (grade vs goal, AO5/AO6 split, strength, calibration verdict) · Where
   to next? (her priority) · the target ask. §33.9 still holds: the trial ENDS on the target.
   Shipped v7.20.562 (FIXLIST #437).
16. ⭐⭐ **THE DRAFT DRIFTS FROM THE PLAN — SO THE PLAN IS RE-MAPPED BEFORE THE NEXT DRAFT IS
   PLANNED (Neil, ruled 2026-08-25, FIXLIST #440; overruling the engine lane's "no new step").**
   His reasoning, verbatim in substance: *"in step nine they selected the beats, but then they
   polished that off, so by the time it reaches draft one it's gonna look quite different to what
   it was in the scene selection and the plot outline. By the time they get to step twelve they'll
   need to decide where the elements from that draft fit into, which beats they fit into. And then
   they'll need to decide again for draft two which beats they're going to write about."* Three
   consequences, all built (v7.20.567/.568):
   - **Step 12 does two things, both on the student's own plot, both APPEND-only (§29):** the
     Step-11 profile (goals · need · stakes at the beginning; what happens to the goal · dilemma ·
     realisation · meaning at the end) placed into the beats in Step 8's own placer, banded I–III /
     IV–VI; then **Draft 1 as sentences** — the student taps the first and last sentence of a chunk
     and the beat it belongs to, and the chunk lands under that beat as a `Draft 1:` line. *"It's up
     to the student to amalgamate."* A chunk that fits no beat goes on the *Not in the plot yet*
     list — the draft telling the plot it needs a new beat. The map (beat → prose) is saved.
   - **A NEW Step 13 — Scene Selection for Draft 2 — sits before Draft 2** (old 13–30 → 14–31).
     Same walk as Step 9, over the updated plot. **THE MERGE:** a beat the student already drafted
     transfers as its Draft-1 prose; a beat picked for the first time transfers as its plan line.
     Draft 2 is therefore *"an updated draft one"* by construction — nothing written is lost, and
     widening the scene to a new beat costs nothing but writing that beat.
   - **The draft's progress feeds the living outline**, not only the next draft: beats grow longer;
     that is the amalgamation §29 already rules is the student's job, not the walk's.

## §34. ⭐⭐ THE EMERGENCY CREATIVE-WRITING UNIT — the three rulings it stands on (Neil, ruled 2026-08-23)

A short unit taking a subset of the 30-step CW project so a student can *"get a story on the board
ASAP."* Dependency analysis (Cambridge lane, 2026-08-22): **skip the plot-UPDATE steps, keep the
BUILDERS** — Step 9 auto-loads `plot_outline` from Step 6 (not 8), `primary_archetype` from Step 5,
`writer_profile` from Step 1; steps 8/15 only update what 6 built. Three rulings settle the design:

1. **THE UNIT'S DRAFT-1 LESSON IS A NEW GUIDED LESSON — the full project's Step 10 is UNTOUCHED
   and #366 STANDS.** Neil, verbatim: *"in the emergency unit, step 10 would become basically a
   different exercise, where they provide guidance… it wouldn't even be called step 10 anyway…
   what we have to be careful of is do not change the current step 10, but we'd maybe duplicate
   it… and then just add a contextual chat, like a polishing lesson basically."* So this is NOT a
   reversal of the 2026-08-10 ruling (#366: Step 10 = a test, no walk, `tools:'minimal'`) — that
   ruling still governs the full project. The emergency unit gets a draft-1 lesson with
   guidance + contextual chat (polishing-lesson shape), under its own sequence number.
   Confirmed 2026-08-23: Neil thinks of it as **a VARIATION of Step 10** — engineered as ONE
   protocol source + a variant switch (his "duplicate it, or whatever you think is the best
   solution" allows this), never a copied file, so the two cannot drift.
2. **WORD TARGETS ARE BOARD-KEYED — one map, engine-resolved, never duplicated protocol files.**
   Neil's constraint: *"350 to 450 is fine for Cambridge IGCSE, but I don't think it's
   recommendable for other exam boards because those are out of 40 marks."* Ruling: ONE
   board→word-target map as the single source; the engine injects the student's board's target
   into the draft lessons. Cambridge = **350–450** (the Paper 2 Section B instruction on all 40
   past papers); AQA/Edexcel keep the current 450–600 → ~700 → 650–750 ladder until their lanes
   rule otherwise. Never hardcode a board's number into shared protocol text again.
   ⚠️ Assessments (Neil, same day: *"we just need to think about how the assessments play
   out"*): trials mark the taught elements and are length-agnostic, so shorter Cambridge drafts
   mark on the same criteria — but any assessment surface that MENTIONS a word count resolves
   it from the same map.
3. ⭐ **THE EMERGENCY UNIT DOES NO PLOT WORK AT ALL — keep the story and character builders,
   drop every plot lesson (5, 6, 7, 8, 12, 15)** (Neil, **revised 2026-08-24**, walking the step
   list himself and superseding his own 08-23 "keep Step 12, renumbered"): *"we're not having a
   plot… the students basically just need to focus on developing the story."*
   Measured, not assumed: **Step 6 asks ~100 questions** (`CW-STEP-06:3`) — the biggest cost in
   the unit and the opposite of *ASAP*. It writes `plot_outline`, *"the ONE master document"*
   (`:183`), so removing it also removes the object every plot-UPDATE step annotates: **6, 8, 12
   and 15 go together as one rule, not four judgements.** Nothing is lost from the drafting
   cycle — `CW-STEP-12:129-137` only annotates the outline and **never touches the draft**; the
   character-arc layer Draft 2 integrates comes from **Step 11**, which stays.
   **Step 7 goes too, and for its own reason:** its output is read by nothing the unit keeps
   (Draft 1 and Draft 2 have zero hits for either values key); its consumers are Step 8 and
   Steps 20/21/22, all outside the unit. It is taken **later**, if the student continues to
   Step 20 — that is where it belongs. **Step 3 STAYS** (Neil was unsure): nine later steps read
   its `chosen_logline` / `story_components`.
   **The story plan becomes Step 4's six-beat spine** — the student's own words, one lesson
   instead of a hundred questions.
   ⚠️ **The cost of also dropping Step 5, accepted knowingly:** four kept lessons (9, 10, 13, 16)
   read `primary_archetype` and `authorial_intent` "from Step 5". With 5 and 6 both gone, **three
   keys are never written and six kept lessons read them** — they must fall back (`plot_outline`
   → `story_spine`; `authorial_intent` → Step 4's `dramatic_throughline`; `primary_archetype` →
   nothing). Unit lesson 5 (Step 9) is load-bearing: its first move is choosing which beat to
   dramatise, so a wrong fallback is a dead screen (§4d liveness). Spec §5 carries the table.
4. **THE UNIT STOPS AT TRIAL 3** (Neil, 2026-08-24): *"after a couple of drafts, it should be
   more or less a grade nine level anyway."* Three drafts, three trials, then the student
   continues into the full project if they want more. The plot-free continuation
   (17·19·20·22·23·25·26·28·29·30) is explicitly **not** in scope.

**The unit (13 lessons):** CW 1·2·3·4 → 9 → guided Draft 1 (new, from 10) → Trial 1 → 11 → 13 →
Trial 2 → 14 → 16 → Trial 3. Plan a story · choose one moment of it · write that moment three
times, each pass adding a layer and each pass marked. ALL lessons carry their own 1–13
numbering; source-step provenance lives in the spec, never on the student's screen.
⚠️ Trials 2 and 3 still need rebuilding to Trial 1's architecture before the unit can ship them.
Spec: `EMERGENCY-CW-UNIT-SPEC.md` (plugin root).

5. ⭐ **THE UNIT STOPS AT TRIAL 3, BUT TRIAL 3 NAMES WHAT THE STORY STILL NEEDS** (Neil, ruled
   2026-08-24): *"they would be missing a lot of stuff from the later units — how to build
   empathy, theme and tone and genre and structural elements… we need to sort of help to remind
   them about those."* Mechanism ruled: **Trial 3's priority names the ONE of the four layers
   that this student's story would gain most from** — their own draft, at the moment they care,
   never a generic list — and a short closing lesson then shows all four with one worked example
   each so they know what is waiting in the full project. A checklist alone was rejected as
   teaching-by-listing. (§27 examples-on-demand and §4c.2 both apply: the closing lesson's four
   examples are PULL, not push.)

## §35. ⭐⭐ MARKING IS BEST FIT, NOT HURDLES — and the examiner-marking component must teach the real thing (Neil, ruled 2026-08-24; his own described method corrected against the source)

Neil proposed a component where the student marks a real answer against the real mark scheme, as
an examiner does, and — correctly — asked for his description to be checked. It was, against
`0500-P1-MARK-SCHEME.pdf` (June 2024, subject-specific general marking principles).

**THE CORRECTION, and it is one joint in an otherwise right procedure.** He described: read the
lowest level, check the student *"has met ALL the criteria there"*, and only then move up.
Cambridge's own words forbid exactly that reading:

> *"Level descriptors are a means of general guidance and **should not be interpreted as hurdle
> statements**."*

- ✅ **Climbing from the bottom, reading every level** — legitimate, and **re-ruled by Neil the
  same day as the component's pedagogical spine** (see the sub-ruling below).
- ⛔ **Requiring every criterion of level N before entering level N+1** is hurdle marking. It caps
  a strong answer that happens to miss one lower-level detail, which is the precise error the rule
  exists to prevent.
- ✅ **His ending is exactly right:** decide which criteria are actually met, then place within the
  level's mark range. That IS best-fit placement.

**⭐⭐ THE SUB-RULING — the walk stays, the RUNG QUESTION changes** (Neil, pushing back the same
day: *"I still think they should still go through the process of reading from the bottom level and
working their way up, so that they understand what the criteria actually is… just for the sake of
being conscious of it"*). He is right, and the reason is structural. **Cambridge's level
descriptors are PARALLEL, not cumulative** — measured on Table B, Q3 (`0500-P1-MARK-SCHEME.pdf`
p.24): the same four dimensions (register · language · range · structure) restated at five
qualities. So reading all five bottom-to-top shows a student **the same four dimensions five times
at rising quality**, which is precisely how you learn what is being judged. That is real
calibration and it is lost if they jump to a number.
⚠️ **But it also refutes his stated premise.** He reasoned *"if they're at the high levels, they
should really be meeting the lower levels anyway."* That holds for cumulative criteria and **not
here: the lower levels describe WEAKNESS.** Level 1 says *"frequent copying from the original"* — a
Level 5 answer cannot "meet" it; the two are mutually exclusive descriptions of one dimension.
**⇒ THE BUILD RULE:** at each rung ask *"is this answer still better than this description?"* and
climb while the answer is; stop where the description **starts to match**; then place within that
range. Never *"have they met everything at this level?"* Copy must never use **hurdle · unlock ·
pass this level · before you can move up**. Same climb, every criterion seen, no false cap.

⚠️ **So the component teaches BEST FIT, and must never tell a student that examiners work through
hurdles** — that would hand them a false model of the exam in the one unit built to teach the
exam. Two further Cambridge principles belong in it, both verbatim from the same page: indicative
content *"is not a prescription of required content"*, and examiners *"must always be prepared to
meet candidates on their chosen ground, provided it is relevant ground."*

**THE DESIGN, ruled the same day:**
1. **One question, THREE answers per unit — weak · strong · MID, in that order.** Weak and strong
   calibrate the range; **the mid-range answer is where marking judgement actually lives** and is
   the point of the exercise. ~20 minutes. Coverage builds across units by varying the question,
   not by lengthening the sitting. A whole paper was rejected: its retrieval questions have no
   levels to judge.
2. **Against the REAL Cambridge descriptors, verbatim**, with a plain-English gloss beside them —
   not our taught elements. This is the mark-scheme-literacy unit; §32 puts the criteria first,
   and teaching our language here would defeat its purpose. (The CW trials keep taught-element
   bars per §33 — different job, and the distinction is deliberate.)
3. **The justification is the assessed act, not the number.** The student states the level, the
   criteria they judged met and unmet, and why that mark within the range — mirroring §19
   (self-assessment against stated criteria) and §33's *"defend the mark"*.

This is the first build of the direction recorded at §33.13 (*"all other assessments adapt to the
examiner-walk method"*) — there it was a roadmap note; here it becomes a component, and it starts
on Cambridge because that is where the student is. **Built by the COMPONENTS lane** (Neil,
2026-08-24: *"we actually have a components chat so you can hand off to that"*) — build brief:
`~/.claude/handoffs/open/wml-CAMBRIDGE-to-components-BUILD-THE-EXAMINER-MARKING-COMPONENT-best-fit-not-hurdles-2026-08-24.md`.
Board-agnostic by construction: descriptors, answers and question are DATA, so a second board is
a data file and never a fork.

## §36. ⭐⭐ THE CHANGE LAW — the protagonist goes through complete and utter change; a static protagonist is extremely unusual (Neil, ruled 2026-09-03)

**His words, verbatim:** *"the fundamental rule is that the protagonist goes through complete and
utter change. It will be extremely unusual that they do not change."* He ruled it after catching a
live library document asserting the opposite about a set text.

**Recorded here because PEDAGOGY.md is the register.** The full failure analysis, the sweep of the 220
library documents (41 matches, all legitimate) and the gates live in
`sophicly-plugins/sophicly_library_cpts_v1_9_0/LIBRARY-RESOURCE-FORMATS.md` §THE CHANGE LAW — read it
rather than restating it. Filed from `library-to-wml-THE-CHANGE-LAW-ruling-for-PEDAGOGY-md-2026-09-03.md`.

**WHAT IT BINDS IN WML.** Anything that states or elicits a character's development: the CW
plot-structure and character-arc walks (`Cr Character Arc`, `Gh The Ghost / Wound`, `Sr
Self-Revelation`); Step 6's eight plot templates (every one is an arc — 865 beat rows describe
change); literature planning where the student states a thesis about a protagonist; and any model
answer or exemplar asserting what a protagonist does or does not learn.

**THE THREE GATES, and they generalise past literature:**
1. **A claim about change requires evidence from the MIDDLE** — one piece per structural division
   (month / act / stave / chapter block) before asserting any arc. **Endpoint sampling yields *same*
   or *different*, never *how*** — measured on the failure: 76 lines surfaced from the novel's first
   month, **8 from the longest month (27% of the book)**, and the two ends were exactly where the
   character looked alike.
2. **Default to change.** State every protagonist as `begins X → ends Y`. An honest-looking "no
   change" is a signal the middle is unread, not a finding. A genuinely static figure is nearly always
   a FOIL or ANTAGONIST (Mr Birling refuses to learn — *that is the point*, because Sheila and Eric do).
3. **Separate the PERSON from the VOICE.** In the failing case the register genuinely never changed
   while the character did; conflating the two produced the error.

⭐⭐ **AND THE METHOD LESSON, which is why this is not only a literature rule: SAMPLING BY MOTIF CANNOT
FIND AN ARC.** Every search run before the bad claim was for a STATIC thing (an image, a character
name). A motif search returns where an image RECURS; **an arc is a difference between two times**, so
the method could not have found the answer whatever it returned. Twin of
`reference_a_sweep_keyed_on_a_known_phrase_cannot_find_the_population`.

⛔ **WML CONTENT IS NOT AUDITED FOR THIS.** The library swept its own 220 documents; **nobody has swept
the WML protocols, the 865 Step-6 beat rows, or the technique cards.** That sweep is open work, and it
must not be done by grepping for "does not change" — see the method lesson above.

---

## §37. ⭐⭐ THE LAST 0.25 OF EVERY CRITERION IS FOR PERCEPTIVENESS — the protocol's criteria and worths do not change (Neil, ruled 2026-09-15, restated and narrowed 2026-09-22; FIXLIST #547 → #572)

**THE RULING, whole, in his words (2026-09-22):** *"We have the protocol which has certain criteria that's
been working very, very well. What I was just thinking is that the last point two five would be for
perceptiveness."* And: *"why are we working on rungs all of a sudden? We have a protocol already."*

**THE RULE.** Every assessment protocol's marking table stays exactly as it is — same criteria, same names,
same worths, same totals. ONE universal rule sits on top: **the final 0.25 of any criterion is awarded only
for perceptive work** — insightful, convincing, and traceable to the words on the page (AQA's own L3→L4
step: *"Clear, relevant"* → *"Perceptive, detailed"*; Q4's *"convincing… judicious"*). A criterion met
clearly but not perceptively scores at most its worth − 0.25. Below that quarter, an element is marked
exactly as today.

**Why it is one rule and not a table change:** measured across all 30 assessment protocols (2026-09-22):
**467 criteria, worths 0.5 · 0.75 · 1.0 · 1.25 · 1.5 · 1.75 · 2.0 · 2.5 · 3.0 — none is 0.25**, so every
criterion has a top quarter to reserve; totals are untouched; the sum-to-max law is untouched. Nothing
per board, nothing per element type.

**THE EXCEPTIONS — whole questions with no criteria (ruled 2026-09-22):** retrieval / right-or-wrong
questions (Q1 on every language paper, per-statement marks) · extended writing marked as a whole piece by
band (Section B / Q5, AO5 + AO6) · any separate technical-accuracy mark (AO4 SPaG, IGCSE AO5) · quizzes ·
penalty rows.

**THE BONUS (Neil, 2026-09-22: *"we can give that, but it has to be convincing… and really, probably
perceptive as well"*):** a bonus is a Level-4 award in its entirety — the interplay bonus is given **only
for convincing, perceptive interplay analysis** (a real relationship in the quoted words, explained).
Written into `marking-fairness-universal.md` §Bonus elements.

**PLANNING TEACHES IT (Neil, 2026-09-22: *"we need to incorporate it into the planning as well"*):** the
rule is stated in the student's words at the first "how your answer will be marked" lead-in of every
planning protocol (AQA P1 Q2, one clause at Q3/Q4; AQA P2 Q2) — criteria upfront, §4c.1. Not repeated
per beat.

**What the grades do (AQA P1 Q2 paragraph, 4.0):** every criterion met clearly, none perceptive = 2.5 =
62.5% = **Grade 6**; clear AND perceptive throughout = 4.0 = **Grade 9**. Perceptiveness is what separates
a 6 from a 9, and the feedback names it per criterion.

⛔ **WITHDRAWN (2026-09-22): the "element rung ladder"** — sixteen named 0.25 rungs, attempt rungs,
zero-examples, job quarters, a per-type library (FIXLIST #547 design, #563 anchor v1, #565/#566 anchor v2,
`RUNG-LADDER-ANCHOR-AQA-P1-Q2.md`). It was my elaboration of the sentence above, not his design, and he did
not recognise it: *"I'm confused as to what we're even doing here now."* Root `CLAUDE.md` §0, move 4. The
attempt-mark debate it created is void — below the top quarter the protocol already decides.

**WHERE THE RULE LIVES:** `protocols/shared/mark-scheme/marking-fairness-universal.md` **Rule 5** (v1.1.0),
loaded by every manifest that has an assessment stage (the three without it — `shared/literature` ·
`shared/poetry` · `shared/nonfiction` — have no assessment stage, so nothing forks). The two AQA language
assessment protocols carry a one-paragraph `[AI_INTERNAL]` pointer to it because the protocol loads LAST
and dominates (PREAMBLE RULES §6); other protocols inherit it from the shared module alone.

**STILL RULED AND UNTOUCHED BY THIS:** the feedback prose is the product (#546 — what they missed · what
they scored · how to fix it · the model paragraphs stay API prose); §38 credit-the-analysis-dock-only-the-
terminology.

---

## §38. ⭐⭐ STRUCTURAL TERMINOLOGY IN A LANGUAGE QUESTION — credit the analysis, dock ONLY the terminology, teach the rename (Neil, ruled 2026-09-14; FIXLIST #541, resolving #530)

**The case:** 857 Qamar, AQA Lang P1 Q2: *"The word 'adrift' can be used to suggest some
foreshadowing…"*. She IS anchored on a word with an inference — squarely Q2. Neil's ruling: **award
the point, withhold only the precise-subject-terminology credit, and teach the rename** (metaphor /
nautical imagery; the anticipation is *foreboding*, not foreshadowing).

**The transferable student rule:** in Q2 name what is ON THE PAGE (word class, imagery, sentence
form); in Q3 name what is in the ORDER (pivot, juxtaposition, shift, pace). **If the technique only
makes sense by pointing at WHERE it sits, it belongs to Q3.**

⛔ **Never zero a structural technique in a language question.** AQA's own 2026 mark scheme states no
such rule; the only cap it names is for analysing OUTSIDE the given lines (→ Level 1 or 2).

**Under §37 this is mechanical:** the student keeps Attempt + Evidence/inference (+ Perceptive if
earned) and loses only the Technique rung — 0.75 of 1.0.

✅ **AQA WRITTEN (v7.20.663, 2026-09-29):** `protocols/aqa/language1/modules/protocol-a-assessment.md`
(Q2 STEP 2b) + `protocols/aqa/language2/modules/protocol-a-assessment.md` (Q3, the language question).
⬜ **STILL TO DO:** Edexcel, Eduqas, OCR, IGCSE, Cambridge language-question protocols (it binds them
the same way). Tracked: FIXLIST #541.

---


**Not ported to Edexcel IGCSE 4EA1 (recorded 2026-10-05, v7.20.703):** this rule exists because AQA splits
language (Q2) from structure (Q3). On 4EA1 there is no such split to protect — Paper 1 Q4 and Paper 2 Q1 both
reward language AND structure together ("how the writer uses language and structure"), so a structural term
in those answers is simply analysis, credited as such.
## §39. ⭐⭐ THE MARK-SCHEME SELF-ASSESSMENT REPLACES THE IN-CHAT REFLECTION PANEL (Neil, ruled 2026-09-14 as FIXLIST #539; ordered built 2026-09-22, #577)

**His words (2026-09-22):** *"there's quite a lot of self-assessments… in the chat we've got that
self-assessment there — do we need that in there, because we've got the mark scheme self-assessment…
maybe we could remove the one inside the chat, where it says how confident were you and which
assessment objective were you targeting — isn't that already covered in the mark scheme
self-assessment? So that's what I want to do."*

**THE RULE.** Where the mark-scheme self-assessment ladder exists for a paper (AQA Language P1, P2,
unseen — `_ladderSchemeKeysFor()` non-empty), the in-chat reflection panel (`@REFLECT_GATE`:
predicted mark · 1–5 self-rating · AO targeting) is **removed**. What it fed is already covered:
- the **predicted mark** → the student's own level + mark per question (the ladder already feeds
  `_setPredicted`, and the protocol already said their marks supersede the panel's prediction);
- the **AO targeting** → the ladder is walked per question × AO, so the AO is its own axis;
- the **1–5 confidence** → the ladder's one confidence tap.
Each question now opens at its STEP 2a (their own level and mark acknowledged in one line, then the
Y gate). The per-question **Calibration Check** and the end-of-assessment **calibration stage**
(§33 / v7.20.614) are untouched — those are the comparison with Sophia's marks, which is the point.

**THE GATE (#539):** removed only where the ladder exists. AQA Literature and poetry (no
descriptors in the dataset yet) keep the panel until their ladder data is authored; then the same
removal applies by construction — the predicate is the ladder's presence, never a board literal.
⭐ **AMENDED for AQA Literature essays, v7.20.673 — see §47:** Literature now HAS its ladder, and its
per-paragraph card keeps ONE question (the AO(s) the paragraph aimed for) rather than disappearing.
Poetry anthology still keeps the full panel (its comparison grid is not in the dataset yet).

**MECHANICS (v7.20.632):** one client predicate `_ladderReplacesReflect()` (renderer refuses the
panel and fires ONE continue directive per question — §4d; the ✓-continue directive stops demanding
STEP 1; the penalty ledger resets at the first card instead of the first gate); one server
predicate `ladder_marks_in_history()` (chat-truth: the hand-back line THE STUDENT'S OWN MARKS) that
skips the three reflection mandates in the preamble, ends the setup phase, and turns the per-question
"panel still owed" directive into "no panel"; the three ladder protocols mark every STEP 1 as
skipped and read the Final Summary's metacognitive journey from the student's own marks.
Gate: `bin/assess-ladder-host-harness.js` §G.

⬜ **Captured, not actioned (#574c):** Neil's thought that the remaining self-assessment might be
renamed ("the technical self-assessment"). Ask when he raises it again; do not rename on a float.

---

## §40. ⭐⭐ MARK COMPLETE IS EARNED BY THE DOCUMENT — and a student who did the work is never stopped (Neil, ruled 2026-08-07 + 2026-08-18; built 2026-09-23, FIXLIST #585–#588)

**THE RULE, his words:** *"wherever there is a document, the lesson can't be marked complete unless
the document is a hundred percent complete."* And (2026-08-18): *"the student should also get a
modal explaining they need to complete the document accordingly before marking the lessons
complete."* So it BLOCKS, and the block explains itself.

**THE TWO EXCEPTIONS, his words — do not widen or narrow them:**
1. **Grade 9 Core Skills** — *"It's one whole document. So they do the same document from start to
   finish."* (`mastery_codex`, capability flag `markCompleteGate: false`.)
2. **The very first diagnostic** — *"we don't expect that the students are going to complete the
   essay plan, because the whole point is the vast majority of them actually don't know how to write
   an essay."* Read through §1: the student's first diagnostic EVER, not the first in each course.

**HIS CONDITION, 2026-09-23, and it binds both directions:** *"if they follow the process properly,
they should be able to mark the lesson complete without fail, and if they don't then they get the
popup."* That is why the gate:
- reads **the same number the student sees** (the Document Progress card's own compute);
- **fails open** — only a positive "incomplete" reading stops anyone; an unknown reading, an error,
  or a missing config completes the lesson and is recorded;
- **never stops a student for Sophia's gap** — an assessment stops only on questions not yet marked
  before `[ASSESSMENT_COMPLETE]`; a Sophia-filled part (Analytics, Action Plan) left empty after the
  marking goes through and is recorded as ours to fix;
- is **proven before it is switched on**: mode `watch` records every click and stops nobody; a
  document family is only eligible for enforcement once measured (first: CW · diagnostic ·
  assessment).

**THE POP-UP, approved as previewed (2026-09-23):** the student's own Document Progress card in the
house modal. Writing step: *"This lesson isn't finished yet" · "Mark Complete works once your
document reaches 100%." · Not now · Take me there*. Assessment: *"Your assessment isn't finished
yet" · "Sophia fills in these parts as your assessment goes on. Carry on from where you stopped,
then mark the lesson complete." · Not now · Carry on with Sophia*.

**NOT decided, recorded for him:** whether lessons ALREADY marked complete while unfinished get
un-ticked (Fatou 1330, Maysa 1279, Annaya 1398) — never retro-untick without his word; and where a
staff "unmark lesson complete" control should live (he floated the review banner).

**THE CALIBRATION QUESTION ANSWERS BY TAP (same batch, #585).** After each marked question the
calibration check offers the units just marked as buttons, so the question must be one those
buttons ANSWER: *which paragraph did you mark higher than it earned?* (over-predicted) · *which are
you surest earned its mark?* (accurate) · *which was stronger than you thought?* (under-predicted).
Sophia then names the criterion in that paragraph and what it rewards. Proof of the defect it
fixes: Annaya was asked *"Which ONE criterion do you think you rated more highly…?"* with the
buttons *"Paragraph 1 / Paragraph 2"* — no button answered it, and she stopped there.

Gates: `bin/mc-gate-harness.js` (the rule extracted from the shipped file; mutation-proven).

---

## §41. ⭐⭐ THE PREPARED STORY — we teach it on EVERY board, not only Cambridge (Neil, ruled 2026-09-27; FIXLIST #599)

**His words** (source: `Blog Layout/research/idea-picks-2026-09-26/NEIL-RULINGS-AND-PICKS-2026-09-27.md`, item 3):
*"in terms of prepared story you're not correct about that and again all of these things need to be
documented somewhere right so we do actually get the students to prepare a story before the exam… we get
them to prepare a story because generally speaking stories are just about imagination so it's sort of
doesn't matter where the student decides to take the story they can take it anywhere they want really as
long as it answers the question stories are malleable because they they're creative they're not scientific
so they can almost always adapted to the to the question and get a decent score."*

⚠️ The option line he was answering read "prepare the parts, never a whole story". **His note overrides
it: the whole story is prepared.**

**What it means in WML:** the story a student builds in the Creative Writing course (the Story Steps) IS
their prepared story; on the day they adapt it to the question. Never tell a student preparing a story is
wrong or risky. Documented in: Cambridge `method/WRITERS-CRAFT-cambridge-paper2-writing.md` ("the prepared
story") and AQA Language P1 `planning/protocol-b-planning.md` Stage S6. ⬜ **STILL TO DO:** the other boards'
creative-writing protocols (Edexcel, Eduqas, OCR) — same note, same place. ✅ Edexcel IGCSE: done for
Paper 2's imaginative writing (`edexcel-igcse/language2/steps/b2-creative.md`, checked 2026-10-05); Paper 1
has no story to write (its Section B is transactional).

## §42. ⭐⭐ BEGINNING, MIDDLE AND END IS THE ORDER — the fault is RETELLING, never the order (Neil, ruled 2026-09-27; FIXLIST #599)

**His words** (same source, item 4, picking "The plan is right; fix the quiz"): *"well when you say
chronological I mean beginning middle and end is chromological [chronological] right you can't write about every single
act and seen [scene] it's not possible."*

**The rule:** a Literature essay's three body paragraphs draw on the beginning, middle and end of the text,
in that order (planning: `aqa/literature/.../protocol-a-assessment.md:213`, `planning/b4-anchors.md:21`).
What caps a response is **retelling** — a paragraph that says what happens instead of arguing a point. Any
quiz, feedback or model that marks the ORDER as the fault is wrong. Fixed 2026-09-27:
`protocols/shared/mark-scheme/shakespeare.md` Q14 (its Act 1 / 3 / 5 plan was marked "Chronological (risks
narrative)"; option A is now a retelling plan and the feedback says the order is right). The per-text
mark-scheme-quiz banks already target "chronological RETELLING", which is correct and unchanged.

## §43. ⭐⭐ EVENTS COUNT AS EVIDENCE — but we advise students to quote (Neil, ruled 2026-09-27; FIXLIST #599)

**His words** (same source, item 2): *"right four events has evidence yes we accept it because of the
examiners accepted but we advise students to quote you know referencing events and things like that can
happen if a quote is not so important which is relatively rare and also the students can do that if for
example they can't remember the quote right because ultimately it's not really the quote that gets the
marks it's the quality of the whole analysis."*

**The rule:** in Literature marking, a reference to an event is valid evidence (AQA AO1: "textual
references, including quotations") and is never zeroed for being an event. Teaching still says **quote
where you can**; events are the fallback (a quote that matters little, or one they cannot recall). The
marks follow the quality of the analysis, not the presence of quotation marks.

## §44. ⭐⭐ PREDICTIONS ARE PRACTICE, NEVER A PROMISE — understand the protagonist first (Neil, ruled 2026-09-27; FIXLIST #599)

**His words** (same source, item 1): *"throughout the years I've actually been against predictions… no
teacher can relyably predict the future… what you can predict with almost guaranteed certainty is… the
question that will come up will be about theme and character… it is vital that they understand the
protagonist first because they are the ones who reveal the meaning of the story their journey reveals the
meaning of the story once you understand that then you just try and figure out how all the other themes and
characters support that journey… one thing that did surprise us this year was the sign of the four question
that was about setting so that is also possible as well… they really got to understand the text rather than
relying on predictions right but we will try to publish a prediction bank for the students that they can
practice with."*

**The rule:** any prediction bank or prediction copy is framed as PRACTICE, never as what will come up.
Revision order: the protagonist's journey first, then how the other themes and characters serve it. Expect
theme or character; setting is possible (Sign of the Four, 2026).

**What to STUDY (not what the question will be):** his pick #13 ("Character or Theme?", same source):
*"students need to know both plus setting; I would also say they should understand relationships"*.
So revision covers character, theme, setting AND relationships, even though the question itself
is expected on theme or character.

**Also recorded the same day (context, not new rules):** poetry — *"about five poems is the minimum that the
students want to know well… any one of the 15 could come up"* (sits with CN-STANDARD "coverage is the
strategy"); essays — *"priority is quality; however, if you can have quality and quantity it's even better"*;
AQA Lang P2 Q3 → Q4 — *"if they want to reuse an idea there's no problem with that"* (different examiners).

## §45. ⭐⭐ THE SPOKEN LANGUAGE BONUS — the speech subject is the student's own, asked ONCE, with examples, and a school-set topic is always allowed (Neil, ruled 2026-09-29; FIXLIST #649, #656)

**The unit** (ruled earlier the same day, relayed by the LD lane): a bonus unit for the GCSE Spoken Language
endorsement, built like the non-fiction units — diagnostic → assessment → feedback → redraft (planning, outlining,
polishing) → reassessment — where the task is a **speech**, and it is **marked on that board's own Section B scheme**:
AQA Paper 2 Section B = 40 (AO5 24 + AO6 16, verified AQA-87002-MS-JUN22). Other boards' tariffs come from their own
mark-scheme PDFs when built (Neil's recollection: Edexcel GCSE 40, Edexcel IGCSE ~45; Eduqas = ONE 40-mark scheme as a
deliberate exception, because its Section B is two tasks — name which scheme the 40 is based on).

**The subject — ruled today, verbatim:** *"Free choice, with a few example subjects to help"* and *"I usually recommend
they write something they find interesting or is important to them. Sometimes, the school might tell them what to write
about so we have to provide for that as well."*
⇒ The ask is ONE code-served question (paste-wall law: a genuine unknown, asked once, stored per student, read back into
every later lesson — never asked again). It offers two paths, and neither is a menu of topics to pick from:
1. **Choose your own** — the guidance *"something you find interesting, or something that matters to you"* first, then
   a few worked example subjects (WML §4c.2 — Neil: *"examples really help students"*), then free text.
2. **My school set my topic** — they type the topic their teacher gave them, as given.
Both paths store the same thing: the speech's subject in the student's own words. **Never re-ask; a change of subject
is the student's deliberate edit, not a new question.**

## §46. ⭐⭐ A MARK SCHEME ASSESSMENT TICKED WITHOUT BEING TAKEN IS FLAGGED — but only when it was never attempted (Neil, ruled 2026-09-29; FIXLIST #652, #657)

**The case:** Anam 1298 had "Mark Scheme Assessment 2" ticked complete in LearnDash (16 Jun) while its quiz stood at
0 of 10 answered, so it showed as done with no grade and nothing told her. Neil: *"We also need to systematise it
somehow so she sees a modal, toast, notification"*, then ruled on the Actions page: *"Yes — but only when it was
never attempted."*
⇒ WML Mark Scheme Assessments join the existing §16 "ticked but not done" alarm (the persistent toast, the Focus lesson
bell, the report's "What to work on next") **only when the MSA was never attempted** — a ticked MSA with no recorded
score. An attempted MSA below Grade 9 is **not** chased by this alarm (deliberately unlike component exercises, which
are chased until Grade 9). Reuse the existing alarm; never a new modal. Build: dashboard lane (`build_todo_lists`).

## §47. ⭐⭐ SELF-ASSESS IN THE ORDER THE STUDENT THINKS: every part first, then the mark scheme, then the marks — and never the same question twice (Neil, 2026-09-30; FIXLIST #683)

**His words**, testing Zayan's Macbeth assessment on staging: *"there's nothing about the mark scheme. Right?
Because remember with the language one we also asked the students to think about their marks in terms of the mark
scheme. So they have to place themselves where they think they are in the mark scheme… we mark paragraph by
paragraph. And then add up the marks to get the total marks for the entire question. Whereas obviously when they're
looking at the mark scheme, the mark scheme is going to place them at a certain level in the mark scheme and give a
holistic mark. So our theory behind marking paragraph by paragraph is that they will arrive essentially at the same
mark as a holistic mark, but they'll also understand exactly where their strengths and weaknesses are… I want them to
engage with the mark scheme."* And: *"the self-assessment comes first which is fine… it should come underneath the
self-assessment, shouldn't it"* · *"I don't want the students to do the same thing multiple times"* · *"maybe we take
out the self-rating and keep the AO targeting."*

**1. THE ORDER — skills self-assessment → mark-scheme self-assessment → marking → calibration.** In the chat AND in the
document (the Mark-Scheme Self-Assessment and its Calibration sit directly under the Self-Assessment). Rating each part
first makes the student look at every part of their work; the mark scheme then asks them to weigh it all into ONE
level — the paragraph-to-holistic step, done by the student before Sophia does it for them. ⚠️ Before this, AQA
Language ran the ladder FIRST (v7.20.604) and told students "beginning marking…" before 19 more self-assessment
questions (measured on prod chats 1237, 1398); 20 of 31 live documents had the section at the BOTTOM.

**2. LITERATURE GETS THE MARK SCHEME** — AQA's own June 2024 descriptors, verbatim and gated: ONE six-level AO1–AO3
ladder per paper (Paper 2's grid differs in six wordings, so each paper keeps its own), plus AO4 for Shakespeare and
modern texts (never the 19th-century novel). The student's whole-essay mark and Sophia's five paragraph marks added up
sit on the SAME scale (34 = 30 + 4; 30 = 30), so the calibration is one comparison, no conversion — Neil's theory made
visible: *"when both methods are working, they land close together, and the paragraph marks show exactly where the
difference comes from."*

**3. NEVER THE SAME QUESTION TWICE — the Literature per-paragraph card keeps ONE thing: the aim.** The mark prediction
goes (the student's own whole-essay mark already exists) and the 1–5 rating goes (every element was already rated in
the skills walk). **AO targeting + "what were you trying to show?" stays** — Neil's float, adopted with the reason it is
right for Literature specifically: the mark scheme judges the WHOLE essay, so this is the only question that asks what
each paragraph was FOR, and the protocol's AO Targeting Reflection teaches which AOs each section should serve. In
Language a question IS one AO, which its ladder already names, so Language keeps no card (§39 unchanged).
⚙️ **One switch** — `SWML_Protocol_Router::LIT_LADDER_AO_CARD` (→ `swmlConfig.litLadderAoCard`). If Neil rules the
Literature card out entirely, flip it: the card, the router's instructions and the protocol's no-panel branch all follow.

**NOT decided, recorded for him:** poetry anthology's comparison grid (the next data job); whether the blind 19-skill
walk should itself shrink now that the mark scheme follows it (#472).

---

## §48. ⭐⭐ THE SELF-ASSESSMENT MUST BE USED, PARAGRAPH BY PARAGRAPH — their rating beside the mark, one question about the biggest gap, and no new mark prediction (Neil, ruled 2026-09-30; FIXLIST #686, #687)

**His words:** *"should we also get them to think about the marks per paragraph? … the students have done a self-rating,
right? A self-assessment. So does that get reflected on in the feedback? … I don't want them to just do it and move on
from it. I want them to think, okay, let's say when Sophia gives the feedback on the introduction, you know, how similar or
different is that to the student's own self-reflection? … I don't want them just to do it just for the sake of doing it.
It has to mean something in the end."* Then, on the recommendation below: *"happy for you to build it that way."*

**MEASURED FIRST (#686):** the skills ratings reached nobody. The walk writes them only into the document; its taps make no
chat turn; neither hand-off carries them; no server path reads that section. The real marking turn on staging (30 Sep,
`wp_mwai_chats` 11404) held the essay, the goal and the context — and zero ratings. So .673's per-section "Element Check"
asked Sophia to compare ratings she could not see. What DID use them was only the end-of-assessment average (self % vs
actual %) and the blind-spot line — never a paragraph, and never a question the student answered.

**1. THE RULE — after each paragraph's marks, the student's own ratings sit beside Sophia's marks for that paragraph's
parts, the biggest gap is named, and ONE question is asked about it.** Rated higher than it scored → *"What do you think it
is missing?"*; lower → *"What do you think made it work?"*; within one step everywhere → *"Which part are you surest about,
and what in your writing earned it?"* Then Sophia's own reason from her mark table is shown, both are filed under
Calibration, and only THEN do the continue buttons come back (§18 serial — a question they can skip is one they skip).

**2. NO PER-PARAGRAPH MARK PREDICTION.** The element ratings ARE the student's judgement of each paragraph, and a finer one
than a mark (three Introduction ratings say WHERE they think it is strong or weak; one predicted mark does not). A
predicted mark would be a third judgement of the same paragraph beside the ratings and the mark scheme — Neil's own
objection, *"they might end up giving two different ratings for the same thing."*

**3. IT MEANS SOMETHING AT THE END — and the research is why the end matters most.** Andrade's review of 76 studies (2019)
found self-assessment helps when it is followed by the chance to revise — accuracy for its own sake is not what helps. So the
gap is carried FORWARD, not just reported: the filed gaps ride the closing turn (Overall Feedback names the part misjudged
most; a part rated higher than it scored is named inside the first Action-Plan priority as the first thing to check in the
redraft), and they travel onto the phase record the polishing lesson reads. Nederhand, Tabbers & Rikers (2019): seeing the
standard after a self-estimate makes the NEXT estimate more accurate too, and helps weaker students most.

**4. ALL CODE, ZERO EXTRA CALLS (#687 — Neil: "I am really concerned about token usage").** The comparison, the biggest gap,
the question, the reveal and the filing are deterministic (WML CLAUDE.md §4 programmatic-first); the student's own words
reach Sophia inside turns that already happen. Sophia is told NOT to compare ratings herself. Measured the same day: ~90% of
a marking turn's output tokens are hidden thinking, so trimming feedback wording or dropping a gold model saves ~1–2% of
spend — the recommendation to him was to keep both golds (his float, NOT ruled: *"maybe we should keep those"*).

**v7.20.681 (#695 — Neil, 3 Oct: *"it should show what my rating would equal in terms of a mark… it doesn't even show me the
total marks that Sophia gave me"*):** the table shows **the rating as a mark** (its step × what the part is worth, to the nearest
quarter), **totals for the rated parts on both sides**, and **the paragraph's whole mark from the card's own total line** — with
the part no rating covers named and penalties said when they explain the difference. Because the student now reads MARKS, the
**biggest gap is the largest difference in marks among the parts more than one step out** (ties → the part worth more). Gate:
`bin/para-gap-check-harness.js` (Neil's own Body 1 card + Zayan's 0/3 Introduction as fixtures).

**v7.20.682 (Neil, 3 Oct, after running the whole calibration walk on .680 — FIXLIST #696–#704):**
- **The ratings are shown as a mark on every Literature Feedback card** (#702 — *"take the self-rating per paragraph…
  calculate what [that] percent is out of the marks we give per paragraph… versus an actual… is that within examiner
  tolerance?"*): "Your rating ≈ x · Actual y · Δ (examiner-accurate / slightly off / recalibrate)", tolerance one mark
  (`_toleranceFor`, ≤ 8 marks). **THE CONVERSION IS RATING ÷ 5 (Neil ruled 2026-10-04, #710):** *"I don't think it
  is fair to give 0 marks for a rating of 1 out of 5. Shouldn't that be a minimum of 1 or 2 marks depending on the total
  marks available"*. "Basic (1 of 5)" says something IS there, so it earns a fifth of the part (≈1.5 of an 8-mark
  paragraph, ≈0.5 of a 3-mark one). Applied per rated part (× what the part is worth, to the nearest quarter) in the
  paragraph table AND on the Feedback card — ONE conversion (`_gapCompare` / `_gapRatingMark`), so they never disagree.
  One step = 0.2 (`GAP_TOL`). (.682 briefly used (rating − 1) ÷ 4, where Basic earned nothing.)
- **"Your next goal" is gone from Calibration** (#701 — *"if it's different, that's fine. But I don't think there's much
  point in having it overlapping"*). Measured: it repeated the Action Plan's "Where to next?" word for word in intent,
  asked minutes earlier. Polishing now reads the Action Plan's `action-short-term`.
- **The keep / Sophia's / in between choice stays, named for what it is** (#698 — *"what's the point of that?… it's a bit
  confusing… We need some sort of disclaimer… we mark stricter than an examiner"*). Measured: it changes NO mark,
  total, grade or plan, and nothing on the server reads it. The ask now says so, carries his strictness line (§2), and
  the chips carry their numbers. Its value is the commitment the next question makes them back up.
- **The "which criterion" question says where to look and scrolls there** (#703), and the **finish turn reports Document
  Progress** from the card's own reading (#704): complete → ask your tutor to sign it off; incomplete → what is missing,
  with a button to each.

**MECHANICS (v7.20.674):** `@GAP-CHECK-PURE` core in wml-assessment.js (criterion → skill map, one scale: rating ÷ 5 (v7.20.684; was (v−1)/4)
against mark/worth, tolerance one step, tie → the part worth more marks); host `_gapCheckTakeOver` / `_gapAnswer` /
`_gapCheckResume`; the continue gate is ONE builder (`_buildAssessConfirmBar`, on the chat shell as `confirmBar`); rows
`calib-gap-<intro|body1|body2|body3|conclusion>` (+ `-why`) in the Literature Calibration template; closing fact
`_gapCheckFact`; phase record `calibration.gaps`. Gate: `bin/para-gap-check-harness.js` (pre-ship).

**NOT decided, recorded for him:** Language papers — their skills ratings are still used only at the end (their per-question
comparison is the ladder mark). Whether they get the same per-question skills check is his call.

---

## §49. ⭐⭐ THE CYCLE EACH TEXT GOES THROUGH — diagnostic-as-test, supported redraft, switch, return, then mixed papers — and what the research does and does not back (Neil, 2026-09-30; blog FIXLIST B568 → WML FIXLIST #688)

**Why it is recorded here:** Neil, to the blog lane: *"make sure this is documented — we have gone through this before."*
§32 holds WHAT is taught, in order (humanity → criteria → structure → strengths/weaknesses → redraft → portfolio →
routine). This section holds HOW each text is cycled. The two are one design, not rivals.

**His words (voice, 30 Sep 2026, as captured by the blog lane):** *"they initially do it by themselves and then they do a
redraft that has a lot of support… they also have to build up patterns… in their mind that they can easily recognize…
understanding who their main protagonist is first… how all the other themes and characters link to that… we're trying to
build layers of understanding to improve automaticity and then in the last few months before the exam, last three months,
that's when we focus purely on things like random past papers… diagnostic which is completely by themselves and then
feedback and then redraft and then feedback again… the redraft… practice planning and then outlining polishing to a 100%
level… model answers help from tutors… switch to a different text… eventually come back to that previous text so then
we're also practicing spaced repetition… they have to be able to analyze text they haven't seen before but they also have
to have very strong foundational skills and also a wide and deep range of knowledge for easy pattern recognition and
automaticity."*

**THE RULING — the cycle:**
1. **Diagnostic-as-test** — written completely alone. It is a TEST and a MEASUREMENT (it tells us what support to fit), not
   a lesson (the existing "diagnostic tests, redraft trains" rule, §3 area).
2. **Feedback.**
3. **Redraft with heavy support** — planning → outlining → polishing "to a 100% level", model answers, tutor help.
4. **Feedback again.**
5. **Switch to a different text** (and to Language).
6. **Return to the earlier text later** — spaced repetition.
7. **The last ~three months: random past papers.**

**THE AIM:** very strong foundations plus a wide, deep range of knowledge → pattern recognition and automaticity — while
the student can still analyse a text they have never seen. **Protagonist first**, then every theme and character linked to
it (whole → parts).

**WHAT THE RESEARCH SUPPORTS** — read at source by the blog lane (four agents, PDFs, quotes copied from the text; one
re-checked independently). Full notes: `Blog Layout/research/TEACHING-SEQUENCE-RESEARCH-2026-09-30.md` and
`teaching-sequence-2026-09-30/{A,B,C,D}-*.md`. ⚠️ **No study tests this sequence, or any part of it, on GCSE English**
— the evidence is adults learning facts, school maths and a few writing studies. Say that whenever it is cited.
- ✅ **Alone first, then feedback** — the attempt helps only when feedback follows and builds on it (Kornell, Hays & Bjork
  2009, p.995; adults, facts).
- ✅ **Heavy support for novices, faded as they improve** (Kirschner, Sweller & Clark 2006, p.75; Kalyuga et al. 2003,
  pp.26–27, the expertise-reversal effect).
- ✅ **Expert reading rests on stored patterns** (Peskin 1998, unseen poems); automaticity frees working memory.
- ✅ **Returning after a gap is spacing — IF the return is retrieval, not re-reading** (Cepeda 2006/2008; Roediger &
  Karpicke 2006).
- ✅ **Focused feedback plus a redraft beats comments alone** (Hillocks 1982 via 1986, pupils ~12–14).

**CONSTRAINTS — where the research pushes back. Each is a design question, not a ruling:**
1. **"Random past papers only in the last three months."** The only school trials (Rohrer 2015/2020, maths, 7th grade)
   mixed practice THROUGH the course; blocked-all-term with a mixed review at the end lost **38% v 61%**. The same paper
   keeps a small blocked start for each new skill. No study tests essays, or mixed-only-at-the-end — an inference from
   maths, not a finding. ⬜ **OPEN FOR NEIL:** short mixed unseen-question sets earlier (after each text)? If he keeps the
   current design, record it here as "researched, kept" so it is not re-argued.
2. **Switching text does not transfer by itself.** Learners "tend not to spontaneously compare" (Gentner, Loewenstein &
   Thompson 2003, p.400): 48% transfer when asked to compare v 19% studied apart. ⬜ **Not yet checked:** whether any
   protocol asks "how is this like the earlier text?" on the return. Check the protocols before claiming the gap.
3. **Support needs a FADE rule.** Research measures learning by the next UNAIDED attempt, not the polished redraft. Nothing
   in the cycle says help is reduced on text 2 or before the next diagnostic. (Weak writers learned more from models,
   strong writers from practice alone — Rijlaarsdam et al. 2008.) This is the same principle as §1 (help calibrated to the
   instruction received).
4. ⛔ **Never claim** "some skills can only be practised on unseen material" — no source says it. And never cite Ericsson
   1993 for "being told does not work": the paper builds a teacher into deliberate practice; what fails is repetition
   WITHOUT feedback (p.367).
5. **Deliberate practice has weak school evidence** (Macnamara et al. 2014). Borrow the design principles; never promise a
   result.

**SILENT — say so, never fill:** the whole sequence as one design; redrafting the same piece v writing new ones;
"protagonist first"; retrieval practice for essay SKILL (it is fine for quotations and terms); portfolios of best drafts.

**CORRECTIONS the blog lane found in OUR notes** — each note now carries a dated correction block (§20: mark what could not
be confirmed): `research/2026-09-19-front-loading-vs-spreading-anthology-texts.md` · `research/2026-07-18-scaffolding-
escalation-and-socratic-tutoring.md` · `research/2026-07-12-prediction-before-reading-pedagogy.md` · `research/2026-07-18-
context-knowledge-and-concept-driven-interpretation.md`.

---

## §50. ⭐⭐ FOUR RULINGS OF 4 OCTOBER 2026 — the check sits in the Feedback, AQA's own placement words, author's purpose in every Language paragraph, Sonnet 5.5 (Neil, WML Actions page; FIXLIST #709, #710)

**1. Each paragraph's check shows in THAT paragraph's Feedback, under Sophia's marks (#692).** His tap: *"Move each
paragraph's check into that paragraph's Feedback? → Yes, move them."* The reason he approved: the question is asked
while the document is already on that paragraph's Feedback, and a redraft is worked from the Feedback cards, so the gap
belongs next to the marks it is about. **Mechanics (v7.20.684, measured first):** a derived footer in each Literature
Feedback card (`.swml-gap-foot`, filled by `_renderGapFooters` from the `calib-gap-*` rows), NOT a box inside the card —
the marking write replaces the whole card body and the Section Guard would then undo the marking itself. So it survives
every re-mark, Sophia never reads it (payloads read only section content), and no document needs migrating. The rows stay
in Calibration's storage, hidden there. The whole-essay comparison stays in Calibration.

**2. AQA's own words when a student places their mark inside a level (#693).** His tap: *"Use AQA's own words when a
student places their mark inside a level? → Yes, use AQA's words."* Where the board prints a top and a bottom sentence
("How to arrive at a mark") — AQA Literature essays (8702/1, 8702/2 Section A, which differ in five small wordings) and
unseen Q27.1 — the ladder quotes both, verbatim. Where AQA prints none (Language Q2–Q4, AO6, a printed Upper/Lower band,
Literature AO4) our one-line explanation stays. Source: the knowledge-mark-scheme files' "HOW TO ARRIVE" sections; dataset
`level.arrive`; gated verbatim by `bin/markscheme-gate.js` §5. ⚠️ AQA's unseen Level 5 top sentence carries the board's own
slip ("likely to include be thoughtful") and is shown as printed — his call whether to keep it (handoff ASK).

**3. Author's purpose is REQUIRED in every Language TTECEA paragraph, every board.** His tap: *"Author's purpose:
required in every Language paragraph? → Yes, that is my ruling."* Replaces the May 2026 "optional for Language" rule.
Applied v7.20.684 to the nine places that still said optional (mark-scheme quiz ×6, rubric-base, the Edexcel IGCSE rubric
×2) and PROTOCOL-STANDARD. NOT covered, because it is conclusion-level: the Edexcel IGCSE Lang P1 planning's "optional
purpose comparison" in the Q5 conclusion (`b5-thesis.md`) — his call.

**4. Sophia runs on Sonnet 5.5.** His tap: *"Switch Sophia to Sonnet 5.5? → Yes."* Measured 29 Sep: ~50% faster writing,
same price per token, 5 marks stricter on one Paper 1 essay. Sonnet 5.5 can decline a request ("general_harms" can fire
on benign work and Anthropic's own fallback does not retry it), and literature essays are about murder and war — so
v7.20.684 re-sends a declined request once on Sonnet 5 and logs the category (`retry_anthropic_refusal`). A decline must
never leave a student without marking.

## §51. ⭐⭐ THE RULINGS OF 5 OCTOBER 2026 — from Neil's own taps on the WML Actions page (v27, copied back into WML 324 A)

Recorded here in the same session, as §0 requires. Each line is his tap; a quoted note is his own words.

1. **Mark Complete enforcement — "Assessments now, writing lessons after item 13."** (card 14) The gate blocks an
   unfinished ASSESSMENT now. Writing lessons (the diagnostic write, CW steps) stay watch-only until item 2 below is
   built and measured. Mechanism (v7.20.714): wp option `swml_mc_gate_families` names the families the site
   enforces; it can only narrow the measured set (cw · diagnostic · assessment, §40).
2. **A writing lesson's Predictions and Keywords boxes COUNT towards Mark Complete.** (card 13: "Yes, they count")
   Build before writing lessons are enforced.
3. **Mastery in the Foundational Quizzes = 100% at least ONCE.** (card 5, his note: *"I don't think it is correct
   to make students score 100% over 2 rounds of the same quiz; we need them to hit 100% at least once."*)
   **Status (2026-10-10, WML 343 A): nothing to build.** The card had RECOMMENDED a new rule ("100% twice, on
   two days"); he rejected it. The engine already ends the loop on the first 100% round
   (`wml-assessment.js` `_revealAndFinish`: `mastered = correctN === n`), so his ruling keeps the status quo.
4. **AQA Paper 1 Question 5 — we only teach STORIES.** (card 7, his note: *"We only teach stories"*) No
   description plan, no description branch in marking or polishing.
   **Built 2026-10-10 (WML 343 A):** the AQA P1 Q5 marking card (`protocols/aqa/language1/modules/
   protocol-a-assessment.md` STEP 2b) — beats always, a story gold always (on the paper's story option),
   one plain line telling a description-writer to choose the story; marks still judged on the piece they
   wrote (the board credits either option). Planning and polishing had no description route already.
5. ~~**AQA Paper 1 Question 5 — first-attempt notes go in a separate "First attempt" box.** (card 8)~~ **SUPERSEDED 2026-10-08 by §56** (Neil: today's ruling replaces it — no "First attempt" box anywhere; never built).
6. **AQA Paper 1 Question 1 — switch to the 2026 multiple-choice format.** (card 9)
   **Built 2026-10-10 (WML 343 A, FIXLIST #857):** the five practice papers' Q1 are four questions, three options, one
   answer each (AQA's 2026 sample shape); the platform scores the ticks (one answer per question — the paper says "Choose a
   maximum of one answer for each question") and Sophia gives the feedback. The Live Modelling past papers use it too (Neil, 10 Oct 2026, Actions v93 card 2: *"Change them to the 2026 format
   too"*; FIXLIST #859). A document that already holds a student's writing keeps the shape it was built with.
7. **Retire the old chatbot lessons — add ours and retire the old ones.** (card 10)
8. **Edexcel IGCSE Paper 1 Question 5 — the plan MUST compare the writers' purposes.** (card 11: "Required";
   already built in v7.20.710.)
9. **Rewrite all 155 quiz banks, IGCSE poetry first.** (card 4) His note on the two sample questions (card 6):
   *"It looks good but does it align with research? also, it seems like more than one answer is plausible"* —
   the shape is not ruled until both are answered: check the question-writing research, and every rewritten item
   must have exactly ONE defensible answer.
10. **The rest of the protocol work — "Go ahead."** (card 12) His note: *"Polishing always comes after assessment
    and planning for everything; the creative writing course and Grade 9 core skills course have their own
    sequence."* — the lesson order is Assessment → Planning → … → Polishing everywhere except those two courses.
    Card 12's parts (`wml-PROTOCOLS-PLAN-722-2026-10-05.md`): story-step criteria + example · an "opening" task plans
    an opening · **Edexcel IGCSE Language has NO word limit** · IGCSE P1 Q5 loses its yes/no stop + 550-word stop ·
    IGCSE polishing. **Status (2026-10-10, WML 344 A, FIXLIST #861):** IGCSE polishing built v7.20.719; the IGCSE
    word limit is GONE everywhere a session reads it (v7.20.807): no ceiling, no target number, no word-count penalty,
    no length halt — including the P1 `knowledge-hub.md` the polishing environment loads, which still carried the
    Q5 550-word and Q6 700-word halts; the page shows a word COUNT, never "N / 650". **v7.20.808:** the seven story
    beats (AQA P1 Q5 planning + Edexcel IGCSE P2 Section B) each ask with criteria → ONE example from a different,
    well-known story (quoted word for word from the live Table card) → the Table button(s) → the question last; and an
    AQA P1 **"opening" task** ("Write the opening of a story…", the 2026 sample) plans, is marked and is polished as the
    FIRST SCENE of a story — Climax = that scene's peak, the close leaves the story open (Cliffhanger); a fully
    resolved piece gets one coaching line, never a cap (AQA's cap is about the task's FOCUS). Gate: `bin/story-beat-gate.js`.
11. **The Edexcel IGCSE Paper 2 anthology gets its OWN quiz and its own notes document — never the AQA forms quiz.**
    (card 3, then his correction in chat the same day: *"it has its own anthology, which comprises both poetry and prose…
    it only has… five [poems]… if we're going to have a forms quiz, we'd have to have… a special one… that only covers
    the forms that are relevant for the poems in its anthology… then we also have to cover things like… protagonists… and
    genre for the prose… it's a bit more complex than the other anthologies."*) My card had recommended the AQA forms
    quiz — WRONG: that quiz serves a large, poetry-only anthology. The anthology (protocols/edexcel-igcse/language2/
    modules/knowledge-text-bank.md) is five poems — Disabled, "Out, Out—", An Unknown Girl, The Bright Lights of Sarajevo,
    Still I Rise — and five stories — The Story of an Hour, The Necklace, Significant Cigarettes, Whistle and I'll Come to
    You, Night — and the paper's protocol already plans Body 1 as FORM for a poem and GENRE for a story. So: ONE notes
    document holding all ten texts, and ONE quiz in two parts — (a) only the forms those five poems use (narrative poem,
    elegy, blank verse, iambic pentameter, free verse, interior and dramatic monologue, rhyming couplets, quatrains,
    refrain…); (b) for the five stories, genre, protagonist and the other prose ideas the notes document holds. Mastery =
    100% at least once (item 3).


## §52. ⭐⭐ FIT BEFORE REUSE — every quiz, assessment, planning walk, polishing step and notes document is built for the PAPER, the QUESTION and the ANTHOLOGY it serves (Neil, 2026-10-05)

Neil, after card 3 (§51.11): *"do we need to make an updated ruling? to make sure… quizzes, assessments, etc., are
suitable for the paper structure, the question structure and the anthology structure."* Yes — and the universal
form of it is root `CLAUDE.md` §23.

1. **Three structures, each read from its source, never assumed by analogy with another board:**
   - **paper structure** — sections, questions, tariffs, AOs: `protocols/shared/language-paper-specs.json` and
     `literature-paper-specs.json` (verified against the mark schemes; tariff gates in pre-ship);
   - **question structure** — paragraphs, elements, intro/conclusion shape: `PROTOCOL-QUESTION-STRUCTURE-MAP.md`
     (every row `file:line`-cited; its anti-guess gate already forbids the marks rule as a source);
   - **anthology structure** — which texts, how many poems and how many prose texts, which forms and genres they
     actually use, and which quiz and notes document serve them: **not yet documented in one place — the gap card 3
     fell into.** First job: an ANTHOLOGY MAP, one row per board anthology, read from each text bank / poem bank.
2. **Reuse is allowed when the fit check passes** — written as "Built for / This one / Source" — and is wrong when
   it does not. The Edexcel IGCSE Paper 2 anthology (5 poems + 5 stories) needs its own two-part quiz (§51.11);
   AQA's anthologies (15 poems, poetry only) keep the forms quiz.
3. **A decision put to Neil carries its fit check on the card** (`~/.sophicly/probe/decision-card-gate.mjs`). He
   can then see in seconds whether the premise was checked — the defence that does not depend on his catching it.
4. **A grade we recover or receive is filed by OUR CURRENT grading scale — never by a number Sophia wrote** (Neil,
   2026-10-05, on 1392's AI-run final: *"his grade should be the most correct one… whatever is our latest grading
   system, then that it should be that one. So I guess that's six."*). Sophia had written "Grade 7" for 70%; the
   canonical band (Sophicly_Grade_Mapper) gives 6. Recovered marks are labelled "not code-scored".
5. **A MARK-SCHEME quiz is per board; a play/text RECAP quiz is for every board** (Neil, same day: *"If it's… just a
   recap, then that's applicable to all exam boards… If you're talking about modern text… mark scheme quiz… each
   exam board is going to have its own… [with] questions and answers that relate to Inspector Calls, and then same
   for the other texts."*). The AIC mark-scheme quiz bank is AQA-only today, so non-AQA courses need their own
   (FIXLIST #735) — a §52 fit-check failure caught in the wild.

---

## §53. ⭐⭐ LITERATURE MARKING — the perceptive quarter, every row kept, and the supporting quotation (Neil, 2026-10-06; FIXLIST #738–#738f)

Plan and evidence: `LIT-PERCEPTIVE-INFERENCE-PLAN-2026-10-05.md` (plugin root). Rulings made so far, in his words:

1. **Every literature row's last 0.25 is for perceptiveness**, intro and conclusion included, every board (#738,
   #738d, #738f): *"close analysis, technique interplay, effect one, effect two, author's purpose, and context, all
   of them need to have the last point two five of mark for perceptive inference. Or just perceptiveness."* This is
   Rule 5 (`marking-fairness-universal.md`, 2026-09-22) carried into Literature, where it had never landed (prod
   count 2026-10-05: 0 of 7 Literature marks carried its wording).
2. **AQA's word is "conceptualised"** (#738b): AQA's Literature mark scheme never says "perceptive". Argument rows
   (thesis, topic sentence, conclusion) are judged as conceptualised on AQA; reading rows stay "perceptive".
3. **The bar is the Mrs Birling essay** (#738d): *"that's the standard we really want to reach."* (AQA model answer,
   `sophicly_library_cpts_v1_9_0/content/library-pages/_rewrites/aic-pilot-out/54869-3-mrs-birling-class-prejudice.md`;
   row-by-row definitions in the plan §3b and §3d.)
4. **The old rows stay, because each teaches something** (#738c): an **integrated** quote earns more than a quote
   that hangs (*"having a quote is okay… at least they've tried… but actually integrating the quote should carry
   additional marks"*); a **wrong technical term** (metaphor for a simile) loses that row's marks; **every sentence
   links back to the topic sentence and the question**, because otherwise *"they'll just write anything… It's just
   information."*
5. **A supporting quotation is a SCORED 0.25, not a bonus** (#738e): *"I favor… the last point two five just being
   incorporated in rather than a bonus. So it's part of the marking that we do."* One anchor quotation per
   paragraph can still reach a grade 9 (his premise; a one-anchor essay loses 0.75 of 34). The 0.25 comes out of
   another body row so each body stays at 8. **Which row gives it up: OPEN — WML Actions page** (recommended:
   close analysis 1.5 → 1.25, the one source that works on every table; author's purpose fails on the AQA
   19th-century body, where it is already 0.5).

6. **The topic sentence has three parts** (#738g): *"zero point five plus zero point two five when conceptualized,
   and another zero point two five when that conceptualization is based on the anchor quote, because… they don't
   always base their ideas on the anchor quote."*
7. **The second sentence is technique + anchor quote + inference, in that structure, and the structure earns
   marks** (#738g): *"otherwise… the students put the technique all over the place and… it ruins the logical flow
   of breaking that technique down."* A technique named elsewhere in the paragraph does not earn the structure.
8. **Terminology: correct = 0.5, wrong = 0. Integrated quote = 0.5** (#738g, confirmed). No split for "precise"
   terms (an addition of mine he did not ask for; removed).
9. **Every reading row shows its perceptive 0.25: close analysis, interplay, effect 1, effect 2, purpose, context**
   (#738g: *"Everything… I did say that."*).
10. **Topic sentence REBALANCED: 0.25 links + 0.5 CONVINCING concept + 0.25 drawn from the anchor quote**
    (#738h, superseding the 0.5 / 0.25 / 0.25 of item 6): *"conceptualization is actually the most important
    thing… it should be 0.25 linking and 0.5 concept… convincing conceptualization."*
11. **Terminology is worth 0.25** (correct 0.25, wrong 0), superseding item 8's 0.5 (#738h: *"I feel like 0.5 is
    too much"*). Where the freed 0.25 goes: OPEN (recommended the inference's convincing part, 0.25 → 0.5).
12. **"Convincing" is checkable** (#738h asked how): a convincing/perceptive part is awarded only when the Why
    names the student's reading and the exact quoted words it rests on (AQA Level 6 title: "Convincing, critical
    analysis"; Rule 5: "traceable to the words on the page"). (My proposal, carried with the plan; not yet ruled.)
13. **The row is "Judicious supporting quotations", 0.25** (#738i: *"it's not just necessarily one quote… judicious
    supporting quotations, 0.25"*). Judged on quality, not number: short quotations beyond the anchor, each woven in
    with its own inference (the Mrs Birling essay uses 2–3 per paragraph). One can earn it; three dropped in cannot.
14. **"Technique" in sentence 2 is the writer's METHOD — a big technique — and the row order follows the
    sentence** (#738j): *"what they really mean are the bigger techniques… they don't really want students going
    straight into like adverbs… they want them to talk about the metaphors and the juxtapositions and the dramatic
    ironies… and then break it down into the individual parts."* Fine-grained work (individual words, word classes,
    sounds, phonology, punctuation) is CLOSE ANALYSIS. AQA's own wording (Lit Paper 2 June 2024 MS, Level 6):
    *"Analysis of writer's methods with subject terminology used judiciously"*; *"a fine-grained and insightful
    analysis of methods"* — "judicious", not "sophisticated". Order: topic sentence → technique + anchor quote +
    inference (one sentence) → accurate technical terminology → quotation integrated → close analysis → the rest.

15. **The technique can be anything in the Table of Techniques, and techniques elsewhere still count** (#738k):
    *"those are just examples… it could literally be anything if you check the table of techniques"*; *"that's
    not how they'll be marked in the exam. I think it should still count… I want them to follow that structure so
    that they have a logical sequence to follow."* The 304-entry table holds no bare word class, so "anything in
    the table" and "a method, not a word class" are one rule. Naming the technique accurately counts wherever it is
    done; only the sequence 0.25 rewards the one-sentence structure.
16. **Terminology merges into the technique + anchor quote + inference line** (#738k, his suggestion, agreed):
    that row is 1.0 = technique named accurately 0.25 + the sequence 0.25 + a convincing, perceptive inference 0.5.
17. **A wrong technique name loses only its quarter** (#738l, his proposed split, matched to the boards): 0.25 for
    using a technique in the sequence + 0.25 for naming it correctly. No board zeroes a wrong term — AQA Language
    L1 "simple use of subject terminology, not always appropriately"; Eduqas "not always accurately".
18. **Every quotation must be integrated, supporting ones included — embedded, or correctly introduced (a colon-led
    quote is valid); embedding is the ideal** (#738n: *"if you use a colon and then you use a quote, that is also
    valid… Ideally, though, we do want them to embed because that's usually the skill that they're actually
    missing."*). Feedback on a colon-led quote encourages embedding without deducting.
19. **Coherence is two quarters** (#738p, his proposal, agreed): 0.25 every sentence links back to the topic
    sentence and the question + 0.25 every sentence flows on from the one before (*"every sentence essentially
    flowing on from each other"*). Two different faults — drifting off the idea, and a list of separate facts.
20. **A link is not only a discourse marker — the marking follows the Mastery Toolkit** (#738s, Neil, 2026-10-06):
    *"we don't necessarily always have to use discourse markers. Sometimes it can be a transitional phrase.
    Sometimes it can be a deliberate repetition of keywords. What have we done for that in the toolkit? Basically,
    it should be aligned with that. And again, if the students get it wrong, then we can give them a quick action
    button to open that up so a deep link."* The toolkit's own rule (section `sentence-transitions`, "Linking
    Sentences & Paragraphs", live on prod): *"Every sentence must follow logically from the one before. That is
    different from gluing a word on the front. If every sentence opens with a linking word, the linking becomes its
    own repetition."* — nine methods (a linking word chosen for its meaning, never twice in a paragraph · echo a key
    word · That/Such + a summing-up noun, never a bare "this" · a word from the quotation · the link inside the
    sentence · a time or place clause · cause then effect · contrast · general then specific), and *"Keep the
    question's key word alive… Repeat that key idea on purpose."* So the flow quarter is earned by ANY of these,
    and a linking word with the wrong meaning ("Additionally" before a result) is the toolkit's "wrong link". A
    missed quarter carries a chip to `sentence-transitions`. ⚠️ Consequences for the build: penalty **T2** ("Lacks
    transitional phrases/discourse markers… Fix: Add Furthermore, Consequently…", `aqa/literature/modules/penalty-codes.md:15`,
    also `aqa/poetry/modules/penalty-codes-poetry.md`) is restated to the toolkit's meaning and is never charged on a
    body paragraph whose coherence row already charged the same missing link (Rule 3, one fault one charge); the gold
    rewrite rule `shared/literature/modules/model-answer.md:54` ("Always begin sentences with a discourse marker…")
    is aligned the same way.
21. **T2 = no link by any of the nine methods** (#738t, Neil, 2026-10-06): *"the T2 penalty is a simplified version
    of that, right? It's about coherence… and cohesion… if there's no coherence cohesion, i.e. not using one of the
    nine techniques, then the penalty applies."* Restated so: a sentence joined to the one before by none of the
    toolkit's nine methods, or by a linking word with the wrong meaning. Scope (Rule 3, already law — stated to Neil,
    not a new ruling): T2 is charged on introductions, conclusions and tables with no coherence row; never on a
    Literature body paragraph, whose coherence row already charges the same fault. Costs no calls and no output.
22. **A reading that does not make sense is not counted** (#738t–#738v, Neil, 2026-10-06). He asked *"the
    interpretation is actually making sense"* and floated a separate 0.25 for *"the paragraph making sense
    convincingly"*, taken from close analysis; on the recommendation he ruled *"yes, that sounds better."* So: no
    separate mark. Each row is scored on its VALID readings only — the quoted words can carry it, it follows
    logically, it is true to the text (AQA: "Examiners are encouraged to reward any valid interpretations"). A row
    with no valid reading scores 0; an unusual reading the words support still counts and can be perceptive; no
    extra penalty (Rule 3). Sophia's Why names the words that do not carry it; the chip opens the toolkit's
    `interpretation-ladder`. Built as fairness Rule 6 (`marking-fairness-universal.md`), every board — the scope
    recommended on the card. Close analysis stays 1.25.

**THE ACTIONS-PAGE TAPS OF 6 OCTOBER (v44, Copy my answers, FIXLIST #738w) — the plan is RULED and goes to build:**

23. **The v5 body table — *"Yes, build it this way."*** Eleven rows, AQA out of 8, as plan §3 (row 2 = technique +
    anchor quote + inference in one sentence; row 10 coherence two quarters by the toolkit's nine links; row 11
    judicious supporting quotations 0.25).
24. **The one mark that moves — *"Yes, close analysis 1.5 to 1.25."***
25. **AQA 19th-century bodies (out of 7) — *"Yes: topic sentence whole, purpose 0.5, close analysis 1.0, context
    0.75."*** Supersedes the 21 July split (topic sentence 0.5) in `class-protocol-router.php:3128-3140`.
26. **Introduction and conclusion perceptive too; the thesis sets up the core argument** (no tap; his note):
    *"Ideally these are going to be perceptive as well. The thesis should also do more than simply say what the essay
    will cover; it should also set up the core argument."* The plan §3d definitions stand. The thesis row (1.0) is
    built as: **0.5** three points that map the essay · **+0.25** they set up ONE core argument that answers the
    question · **+0.25** perceptive (AQA: conceptualised). A roadmap alone ("this essay will explore three ways…")
    earns the 0.5 only. Today's protocol says "giving the essay's roadmap" (`aqa/literature/modules/protocol-a-assessment.md:233`,
    and :438) — rewritten in the build. (The split is the build's reading of his note, stated to him.)
27. **The overall criteria scorecard goes above the Action Priorities** — *"Above the Action Priorities."* Next: its
    own end-to-end plan + a picture for his tap before any build (plan §8.2).
28. **Sound devices** (his note): *"Alliteration, Assonance, Consonance, Sibilance, Onomatopoeia can be the technique
    in the second sentence. Plosive and Tense belong in the second sentence; what should we do if the student uses
    them in the second sentence? A real examiner would still credit them."* Read as: the five sound devices CAN be
    the sentence-2 technique; **Plosive and Tense belong in close analysis** ("belong in the second sentence" read as
    a slip — the question that follows only makes sense that way; stated to him). When a student does use Plosive or
    Tense as the sentence-2 technique, **both quarters are credited** (named correctly + the sequence), as an
    examiner would, and the feedback encourages naming the bigger method first without deducting — the same shape as
    the colon-led quotation (§53.18). Supersedes the recommended "close analysis" for the five. Library gate
    `bin/verify-big-technique.mjs` to be switched (handoff).
29. **The "type Y" step is dropped — *"Drop it: Continue starts the marking."*** ✓ Got it — continue starts the next
    section's marking directly; the fixed Y-gate call (#687b) is gone. In Language, the line repeating the student's
    own level and mark is drawn by code while the marking loads.
30. **Operational answers (not pedagogy, recorded for the next chat):** read Mishel's and Qamar's marked P1
    diagnostics — *"Yes, read them"* (#729) · Mishel's device — *"I don't know"* (#730 → instrument, never guess) ·
    recover six students' quiz grades — *"Yes, recover all six"* (#736) · the quick exam story — *"Every board's
    creative question"* (#727, plan first).
31. **"Uses … to show" is ONE fault — *"One penalty for that sentence."*** (Neil, 2026-10-06, Actions v48 card 4;
    FIXLIST #738z.) The case: *"Munby uses positive adjectives to show how beautiful the snow makes London."* Sophia
    charged F1 for "show" and T1 for "uses" — 1 mark from one sentence in a paragraph worth 4 — because the old rule
    said only "never both codes on the same VERB", and these were two verbs. The habit is one, and one rewrite fixes
    it (*"Munby conveys the snow's beauty through…"*). **The rule: a student sentence carries at most ONE
    analytical-verb charge.** When F1 and T1 both land on one sentence, charge F1 once (the "shows" verb) and never
    T1 as well; in Literature, where both verbs sit on the F1 list, that is one F1 per such sentence. Applies to every
    board and paper that uses the verb tier list. **Enforced in code** (v7.20.718): the mark auditor merges verb
    charges that quote the same student sentence, keeps the F1, and the card's `Total penalties` falls with it
    (`bin/pen-net-harness.js`).

Nothing in §53 is still open after 6 October: rulings 23–29 settled the table, the moved mark, the 19th-century
split and the introduction/conclusion definitions.

---

## §54. ⭐⭐ THE RULINGS OF 7 OCTOBER 2026 — one sentence per element, a filed mark may change, the sibling adaptations stand (Neil; FIXLIST #757, #760, #764, #765)

**1. GOLD MODELS: ONE DETAILED SENTENCE PER ELEMENT (FIXLIST #765, voice, on Zayan's Macbeth marking).**
Verbatim: *"ideally we want to try to write one detailed sentence per element rather than several sentences per
element… the structure has to be the TTECEA plus C structure… while meeting all of the criteria."* Then, on being
shown the interplay row: *"Yeah, you're right about the technique interplay. I forgot about that. Leave it with the
technique interplay."*
- **Body paragraph:** topic sentence · technique + anchor quotation + inference · close analysis · **technique
  interplay** · effect 1 · effect 2 · author's purpose · context — **8 sentences** (7 where the paper has no context row).
- **Introduction:** hook (*"a historical concept or a question or maybe a metaphor"*, rooted in the historical
  context) · building sentence (historical context — one sentence carries both building-sentence rows) · thesis —
  **3 sentences**.
- **Conclusion:** restated thesis · controlling concept · central purpose · universal message — **4 sentences**.
- **Every criterion is still earned, INSIDE those sentences:** the integrated anchor quotation, the supporting
  quotation (inside S3, S4 or S7 — never a sentence of its own), perceptive concepts, the links between sentences.
- **Why it was wrong before, measured:** the protocols themselves said "introductions (4-5 sentences), body paragraphs
  (7-10 sentences), conclusions (5-7 sentences)", and the 6 October table added two rows Sophia wrote as extra
  sentences (Zayan's Body 1 gold: 9 sentences for 7 elements). The model obeyed the instruction; the instruction was
  the defect. Section 2.B now sets tone and depth, never length.
- **Why it is right:** one sentence = one element is the same unit the outline lesson trains (one box per element), so
  the gold model is something a student can map onto their own work line by line. It also trims roughly 8% of each
  marking reply (estimated from Zayan's Body 1 card).
- **Scope:** the seven Literature tables on the 6 October marking (AQA + the #760 siblings). Every other Literature
  protocol takes it when it is ported. **Enforced:** `bin/lit-perceptive-gate.js` §A3 (+3 mutations).
- **AMENDED THE SAME DAY — THE CLARITY ALLOWANCE (FIXLIST #772b, Actions v57 note).** Verbatim: *"The goal is one
  sentence per element but that can't come at the expense of clarity. So, there has to be some allowance for clarity
  but at the same time, we can't make an exception for every paragraph."* **THE RULE (v7.20.733):** one detailed
  sentence per element stays the rule; an element may take a SECOND sentence only when one sentence would be unclear —
  **at most ONE element per model paragraph**, and most model paragraphs need none. Never two elements stretched,
  never a third sentence. Written into rule 2 and the body Sentence Plan of all seven tables; §A3 checks both (+2
  mutations: the cap removed, the plan line dropped). If he wants it stricter, the next step is one allowance per
  CARD (both models together).

**2. A FILED MARK MAY CHANGE — AND SOPHIA SAYS WHY (FIXLIST #757, closes #721).** Actions v56: *"Let the mark change,
and say why."* When Sophia finds a paragraph she has already marked was over- or under-marked, the document follows
her: the code applies the change to the filed card and its label, the total follows, and she tells the student the
reason in one plain sentence. The chat and the document must never disagree, and Sophia must never tell a student to
trust one over the other. ASSESSMENT-MECHANICS #19: do it in code.

**3. THE THREE §4 ADAPTATIONS STAND (FIXLIST #760).** Actions v56: *"Keep all three."* Eduqas/OCR topic sentence 0.5 =
0.25 + 0.25 perceptive; Eduqas/OCR thesis 3.0 = 1.5 roadmap + 1.25 core argument + 0.25 perceptive; Edexcel IGCSE
heritage/literature effects 0.5 each (the body now sums to its 7).

**4. A STUDENT'S PARAGRAPHS ARE READ THE WAY THEY SEE THEM — ONE RULE FOR EVERY PROTOCOL (FIXLIST #766, #770).**
Neil: *"How can we make sure that that is avoided completely in the future?"* and *"can we fix the issue of not
detecting the paragraphs universally for every single protocol"* — after Zayan's introduction was marked "not
submitted" because our reader joined his first four paragraphs. **Measured on prod, 7 Oct:** 9 of 260 essay answers
used single line breaks between paragraphs inside one block, and **42 of 110 Language answers** were made with a single
Enter — which the reader merged, because its "a single break counts in an answer box" branch never ran (the box is
itself a `<div>`). **THE RULE (v7.20.731, `_mqParas`):** a new paragraph or a blank line is always a break; a SINGLE
line break is a break when it ends one sentence and the next line starts another — what the student sees on screen —
and a soft wrap when it falls mid-sentence (Neil's #418 "it mustn't falsely detect them" still holds for a wrapped
line). A retrieval answer keeps every line as its own statement. And Sophia never argues a student's structure: if
they say a part exists that the labels do not show, she asks for its first words and marks what they point to
(router assessment block). The tap-to-confirm check proposed the same day was dropped: the sentence-boundary rule
settles the ambiguous case without asking the student anything.

**5. ONE PARAGRAPH THAT MAKES TWO POINTS — MARK BOTH PARTS, CALL IT ONE PARAGRAPH, TEACH THE SPLIT (FIXLIST #767,
#773).** Actions v57, item 3: *"Mark both parts, call it one paragraph, teach the split."* There was no earlier ruling
from him: the "bucket" split dates from 10 June (v7.19.402), an engineering fix to stop Sophia marking the same
material twice, and it called the second bucket "Paragraph 2". Then the same day, on the obvious edge: *"what if it
genuinely is one paragraph?… we used to just give zero for the second paragraph. If there wasn't one."*
- **The discriminator is CONTENT, never line breaks:** a part exists only where the paragraph moves to a NEW
  technique, feature or inference with its OWN quotation. Two points in one block → two cards titled "Part 1 / Part 2
  of your paragraph", equal depth, no penalty for the missing break, and one line quoting where Part 2 begins as the
  place to start a new paragraph. **One point → never split**: the second paragraph is missing and scores 0, with
  teaching and one optimal gold, exactly as before. So a student who really wrote one paragraph gets no credit for a
  second.
- **Where it lives (v7.20.734):** the rule in AQA P1, AQA P2 and Edexcel IGCSE P1 (body-only questions — never an
  Introduction/Conclusion essay shape); the label header names it whenever fewer paragraphs arrive than taught; the
  router's Q2 bucket map uses Parts; and "Part N" is the same slot as "Paragraph N" in the sidebar rows, the mark
  correction and the question re-sum. **Enforced:** `bin/mark-correct-harness.js` (+10).

## §55. ⭐⭐ THE WEEKEND STORY — seven Emergency-unit lessons plus one ADAPTING lesson, every board (Neil, ruled 2026-10-07; FIXLIST #727, #774, #774b, #777)

**His words.** The ask (#774b): *"the story needs to be based somehow on our creative writing course but what we've got in
there is too extensive for an exam preparation so we need to pick out the key exercises where a student can get a story
up within a weekend"*. Scope (6 Oct, §53.30): *"Every board's creative question"*. The choice (Actions v59, card 4):
**"Seven lessons plus the adapting lesson (about 3 to 5 hours)."**

**What it is.**
- **Lessons 1–7 = the first seven lessons of the Emergency unit (§34), unchanged in shape:** Writer's Profile · Story
  Ideas · Logline · Story Spine · choose the scene (Step 9, spine fallback) · guided Draft 1 (the Step-10 VARIANT, never a
  copied protocol) · Trial 1 (marked). No plot work — §34.3 stands.
- **Lesson 8 = NEW: adapt the story to the exam question.** §41 says students adapt their prepared story on the day;
  nothing in the course practised it. The lesson uses the student's OWN board's real prompt shapes (each board's
  papers, not general knowledge — CLAUDE.md §2c) and ends in a timed rewrite. Why it matters, measured: AQA's 2026 mark
  scheme caps AO5 at 12 if the story does not address the task's focus.
- **Drafts 2 and 3 (§34 lessons 8–13) are NOT in the weekend story.** A student with more time continues into them.
- The ~3–5 hours is an ESTIMATE (no student time is recorded anywhere); measure it once real students take it.

**Build plan:** `WEEKEND-STORY-PLAN.md` (plugin root). Research: `~/.claude/handoffs/open/wml-CW-EXAM-STORY-FACTS-2026-10-07.md`.

### §55.1 AMENDED 2026-10-08 — NINE lessons: lesson 5 is built around POLTI, and a POLISH lesson joins (FIXLIST #783)

**His words** (8 Oct, voice, to the LD lane while it built lessons 1–7 on staging):
*"We'll probably need to add one more, which is to polish, I think, no?"* · *"the choose your scene one is actually
based on the full plot structure, but we're not going to be using the full plot structure… it would need to be much
more focused on, let's say, Polti's dramatic situations"* · *"or the other option is they do writer's profile, story
ideas, logline, story spine, and then Polti's dramatic situations, and then write draft one, mark your draft, and then
polishing… structural techniques, like adding hooks and so on. We could add some of those in."*

**The list (decided by the WML lane from those words; he can overrule):**
1 Writer's Profile · 2 Story Ideas · 3 Logline · 4 Story Spine · **5 Your Dramatic Situation** · 6 Draft 1 ·
7 Mark Your Draft (Trial 1) · **8 Polish Your Draft** · 9 Adapt It to the Question.
- **Lesson 5 is Polti-first.** The dramatic situation is chosen FIRST and decides which moment of the spine the
  scene tells; the lesson still ENDS on the 7-element scene plan, because Draft 1 and Trial 1 read those seven rows.
  (His premise "based on the full plot structure" was already out of date for the weekend variant — since v7.20.737
  it picks from the Story Spine — but Polti was never in the walk at all: the code-served Step 9 walk has no
  dramatic-situation step. So the change is real.)
- **The list is OURS, not Polti's raw 36:** Neil's own adapted *"33 Dramatic Situations based on Georges Polti's
  Ideas"* (`Model Answers/Model Answer Resources/33-Dramatic-Situations-Based-on-Poltis-36-Dramatic-Situations (1).md`;
  also in the Archetypes Course downloads). The protocol's "Polti's 33" is therefore CORRECT — not a slip for 36.
  Its 1916 wording ("brigandage", "alienist", "kinsmen") is rewritten in plain words for students (root §5c-ii), and
  anything sexual in its variants never reaches a student (N566).
- **Polish (lesson 8) acts on the mark.** A mark nobody acts on is wasted ("diagnostic tests, redraft trains"). The
  lens is Trial 1's TOP priority for this student, not a generic list; where that priority is structure, the
  structural techniques he named (hooks and friends) are the teaching. Hooks are already element 1 of the plan, so
  the lesson polishes them, it does not introduce them.
- **Adapt stays, LAST.** His (4) list did not name it, but on 7 Oct he chose "Seven lessons plus the adapting lesson"
  explicitly; nothing since withdraws it, and it now rewrites the POLISHED story — the right input.
- EST total ≈ 4–6 h (was 3–5 h); still unmeasured.

### §55.2 AMENDED 2026-10-08 (evening) — TEN lessons: STRUCTURAL ELEMENTS before Draft 1, and Trial 1 marks them; the weekend story is its OWN project (FIXLIST #802, #804)

**His words** (voice, 8 Oct): *"you see unit 13, we've got uh, step 27. Structural elements… I think we should add that
in there, don't you think?… the interesting ones could be structural elements and then prose style that could be the
drafting and then the assessment"* · and on separation (#802): *"The weekend story needs to be separate. It can use the
same exercises but it should have its own wml document… a mini creative writing course. Students should also be able to
create a new weekend course project just like they can for the full creative writing project."*

**Ruled (his taps, same evening):** placement **"Before Draft 1"** and marking **"Yes, mark them"**. So:
1 Writer's Profile · 2 Story Ideas · 3 Logline · 4 Story Spine · 5 Your Dramatic Situation · **6 Structural Elements** ·
7 Draft 1 · 8 Mark Your Draft (Trial 1) · 9 Polish Your Draft · 10 Adapt It to the Question.
- **Lesson 6 = full-course Step 27 run as a weekend lesson**: the same 11 techniques and the same rule (irony
  compulsory, at least four) — planned INTO the lesson-5 scene plan, one technique at a time (§18 serial; a "no" costs
  one tap), each with a worked example. It reads the scene plan, not the full course's sixth draft / plot outline.
- **Draft 1 writes with prose style AND the planned techniques** (the prose-style lens stays; the plan sits beside it).
- **Trial 1 marks what was taught (§1):** the techniques the student planned are checked in the marking — taught,
  therefore marked. This supersedes §55.1's "structural techniques only in Polish when structure is the top priority".
- **Separation (#802, built v7.20.758):** a weekend story is its own project (`course_context: 'weekend'`), with its
  own documents; nothing done in it can change a full-course story, and the reverse.
- EST total ≈ 4.5–6.5 h; still unmeasured.

### §55.3 AMENDED 2026-10-09 — ONE MOMENT: the student chooses where the exam scene is, at the end of lesson 3, BEFORE the Story Spine (FIXLIST #813d, #815, #815f; built v7.20.775)

**His words.** #813d: *"The examiner's report said that the best stories were ones where the student focused on one
moment in the story rather than a complete story from start to finish. We need to achieve this between L4 and L5."*
#815: *"a scene is actually a mini story so still has the same structure as a story… somehow between the log line and…
the story spine they need to think about where in their story they want to actually focus on"* (+ "show the examiner's
words", "make one beat the normal choice"). #815f, asked WHEN: *"Before the Story Spine"* (the lane recommended "after";
his ruling stands, root §0).

**The source, verified word for word** (AQA 8700/1 June 2023 examiner report, story question, "Strongest responses";
`research/sources/aqa-8700-1-jun23-examiner-report.txt` lines 384–388): *"These responses managed the timed conditions by
focusing upon a moment in time, rather than trying to include journeys and other events that led to the main focus."*
and *"Students who did not aim to complete the whole narrative, but rather took the response as a chapter or a dramatic
moment in a story were also able to manage the time more successfully."* Both are shown to the student.

**The mechanics (weekend unit only; the full course is unchanged):**
- **Lesson 3** ends with ONE choice among four parts (a single choice, §4c.8): the moment everything changes · going
  after what they want · the obstacle at its worst · the ending, when everything is decided — each shown in the
  student's OWN words from the lesson-3 component it grows from (incident · goal · obstacle · stakes), each the seed of
  Story Spine beat 3 · 4 · 5 · 6. A tap; criteria + the examiners' words + a worked example first; Sophia only as the
  last help rung. Filed by code into a LOCKED "Your Exam Scene" row; changeable at any time.
- **Lesson 4** marks that beat: a note on its write-ask ("make this beat the most specific one you write") and the
  beat's label in the document.
- **Lesson 5** starts from it: the beat is pre-selected (one beat is the normal choice; the next beat only when the moment
  carries straight on into it), and the three suggested dramatic situations are the ones IN that moment. No choice
  (a story begun before this shipped) → lesson 5 runs as before, never a pre-select on nothing.

### §55.4 AMENDED 2026-10-09 — ELEVEN lessons and a BONUS: lesson 11 marks the adapted story again; the bonus is empathy (FIXLIST #813f, #815c; built v7.20.776–.777)

**His words.** #813f (on lesson 10): *"And then assess again and what about empathy? What if we add it as a bonus
lesson?"* #815c (card 4): *"Mark it again, then empathy as a bonus."*

- **Lesson 11, Mark It Again** (`cw_step_91`): lesson 8's marking (the same elements and levels, /34), on the story the
  student rewrote in lesson 10, self-marking first and then Sophia, on its own page. **Then and Now** shows each
  part's lesson-8 mark beside today's. Its result is its own graded activity; lesson 8's trial record is never
  replaced. The closing target is for the exam (there is no Draft 2 after it).
- **Bonus, Make the Reader Care** (`cw_step_92`): his Creative Writing Workbook Step 16 (CW-STEP-16-deepen-empathy.md)
  word for word — fifteen techniques in three groups, **at least 2 from each group, courage compulsory** — walked one at
  a time (§18), each "how and where in your story" filed to its row; then the student revises their story (lesson 10's
  rewrite, copied in once) with Sophia coaching empathy and never writing for them. No marking (it is a bonus).
- Unit order: 1 Profile · 2 Ideas · 3 Logline (+ exam scene, §55.3) · 4 Story Spine · 5 Dramatic Situation · 6 Structural
  Elements · 7 Draft 1 · 8 Mark Your Draft · 9 Polish · 10 Adapt It to the Question · **11 Mark It Again** · **Bonus: Make the
  Reader Care**.

## §56. ⭐⭐ A REDRAFT PLAN STARTS EMPTY — first-attempt notes are never carried into it (Neil, ruled 2026-10-08; FIXLIST #806; REVERSES #571 and SUPERSEDES §51.5)

**THE RULING (his taps, WML 336 A).** To *"should first-attempt notes stop being copied into redraft plan boxes, for
every student?"* he chose **"Stop for everyone"**; to *"does that replace the 5 Oct 'First attempt' box for AQA P1
Q5?"* he chose **"Yes, replace it"**. So:
- A Phase-2 document (planning → outlining → polishing → reassessment → discussion) inherits **no** words from the
  Phase-1 plan boxes. Its plan boxes start empty, on every board, paper and question.
- There is **no** separate "First attempt" box anywhere (§51.5 is withdrawn, never built).
- The first attempt is not lost: the **diagnostic document keeps it**, and **"Reflection: Last Attempt"** brings it
  into the redraft session as a reflection, not as a plan.
- #571 (21 Sep, *"Leave them in Paragraph 1's box"*) is reversed.

**WHY — the evidence that changed it.** Qamar 857, AQA P1 Topic 1 redraft planning, turn 15 — Sophia: *"Looking at
your document, you've already got two strong anchor quotes lined up from these lines: Paragraph 1: 'being adrift in a
boat' · Paragraph 2: 'roaring Pacific Ocean'"*. Both quotes were her FIRST-ATTEMPT notes carried into
`plan-Q2-para-1`, so **the redraft's quote-choice beat was skipped** — she never chose this redraft's evidence. A
student who did not carry notes (Mishel 1237, Q2) was asked for both quotes first. Anything in the document is read by
Sophia, which is also why a separate "First attempt" box was withdrawn: it would invite the same reuse. Visual cost
too: Anam 1298's whole untaught four-point Q4 plan sat in her Q4 Introduction box (#805). This is §1 applied —
*diagnostic tests, redraft trains*: the redraft trains each step, so it starts each step clean.

**MECHANISM.** `strip_plan_notes_for_redraft()` (`includes/class-rest-api.php`) empties every box inside a plan section
whenever `seed_from_sibling_stage()` walks back across the Phase 1→2 boundary (seed AND reseed). Gate:
`bin/plan-notes-strip-gate.php` (pre-ship; the shipped function on a real-shaped doc, checked by an independent DOM
parse, mutation-proven; run on prod's 138 real Phase-1 docs: 184 filled plan boxes emptied, nothing else touched).
Existing documents: a reseedable (untyped) doc re-seeds clean on its next load; the four students whose frozen docs
already hold carried notes (857, 1237, 1352, 1109) are cleaned with a backup, keeping any approved plan written under
the notes.

## §57. ⭐⭐ "PRACTICE KEPT" — a student's own planned practice time joins the Process Score, framed as grade-9 HABITS, never punishment (Neil, ruled 2026-10-08; dashboard FIXLIST #517/#519/#520)

Recorded here at the dashboard lane's request (handoff `dashboard-to-wml-NEIL-RULING-practice-kept-grade-9-habits-for-
PEDAGOGY-md-2026-10-08.md`); the dashboard lane builds it. Cross-reference **§16** — the precedent it follows.

**Neil, verbatim (8 Oct, ~18:05 UK, voice, dashboard chat):** *"it's not a punishment right it's not about punishing
the student it's about the fact that… these students all say they want a grade nine and what I want them to try to do
is… stick to the behaviors for a grade nine… if you miss your session if you miss your time if you don't practice
enough it could have a consequence for your exam… if we don't teach them that then when they get to the exam if they
struggle then a lot of times they don't understand why… some people will be so upset they won't even say anything they
won't even contact us they'll just keep quiet… I think the penalty is fine. I agree with number two."* Earlier the same
day: *"they need to try and find a couple of hours every week… 20 minutes a day… or four half hour sessions"*; *"they
chose those times… if they can't adhere to it, then they need to change it. Or they need to catch up another time and
then log it."*

**THE MECHANICS HE APPROVED:**
- **Practice kept** is a Process Score component. Each WEEK it compares the student's own planned practice time (Grade
  9 Core Skills lesson 55476 "4. ACTIVITY: Sorting Out Your Calendar"; saved as `sc_calendar_*` user meta) with the
  time actually practised. A catch-up anywhere in the same week counts. **It is never applied to grades.**
- **7 days' grace** after a plan is made. The plan must reach about **2 hours a week**; a smaller plan gets a note.
- **No plan** (his "number two"): 7 days after the dashboard first asks for one, "no plan" counts 0.
- Follows §16: grace → the ONE existing pool → clears instantly; *"a consequence only changes behaviour when the
  student can predict it."*
- **Student-facing words: grade-9 HABITS and their EXAM consequence. Never "penalty" or "punishment".**

## §58. ⭐⭐ THE MARKING SUMMARY ANSWERS WHAT THE STUDENT TOLD US IN THEIR FREE ASSESSMENT — in their own words, never as a before/after grade (Neil, ruled 2026-10-08 via the dashboard lane, d149/d150b; FIXLIST #807)

**THE RULING.** Neil, on the dashboard Feedback card: *"I think the current feedback needs to also reflect back on it"*
→ *"Both: (a) now, (b) to the marking chat"*. (a) is the dashboard's goal line; **(b) is ours:** when Sophia writes the
Overall Feedback of a marked response, she answers what the student wrote in their FREE assessment (sophicly-assessment):
their grade goal, what they find hardest, and the skill they most want to improve. **His approved example:** *"You said
you never know how much to write about one quote. In this essay, your second paragraph does that well."*

**HOW (v7.20.766):** the SUMMARY turn's server block (`assessment_final_summary_mandate` / `assessment_lit_final_summary_mandate`)
carries `free_assessment_reflection_block()`: the newest complete `{prefix}sophicly_assessments` row for the student —
answers 7 (goal, resolved through the assessment plugin's own label map), 39 (hardest), 40 (skill to improve), in their
words. Sophia adds ONE or TWO sentences inside Key Strength or Priority Targets, pointing at a specific paragraph:
progress → say so; still the problem → it becomes the priority target in their words; **no evidence either way → leave
it out, never forced.** A goal set at the start of THIS session outranks the assessment's (it is newer).

**THE GUARD (dashboard FIXLIST #523b — the response shift):** students rate themselves harder once taught, so a before/
after against the assessment's PREDICTED grade or SELF-RATINGS can show good teaching as going backwards. Only the goal
(a target) and the stated difficulty (a concern) reach Sophia; she never compares this mark with anything from that
assessment. **No linked assessment (most students, Oct 2026: 3 linked on prod) → no block, feedback exactly as before**;
placeholder answers under 8 characters are treated as absent. Gate: `bin/free-assessment-reflection-gate.php` (pre-ship).
Scope today: the essay/paper marking summary (Language + Literature). CW trial marking does not carry it yet.

**APPROVED AS SHIPPED (Neil, 9 Oct, WML Actions v71 card 3): *"Good, keep it"*** — after seeing the live before/after on
staging (the same marked P&C essay summarised with and without a free assessment; only Key Strength changed: *"You also
told me that you usually 'name the technique and stop, without explaining the effect' — but in Body 2, you don't do
that…"*). His note on the same card became §59.

## §59. ⭐⭐ WHEN FEEDBACK TALKS ABOUT THE MARK SCHEME, IT USES THE EXAMINER'S OWN WORDS — AND ONLY AT THE RIGHT LEVEL (Neil, ruled 2026-10-09; FIXLIST #813c)

**His words** (WML Actions v71, card 3 note): *"When talking about the mark scheme, make sure we are always using the
examiner's vocabulary appropriately."*

**What it means, measured the same morning.** Both live summaries he was shown (#807 before/after, AQA P&C poetry, a
**Level 2** Literature essay) praised the essay as **"perceptive"** — *"a perceptive observation (AO2)"*, *"reliable and
often perceptive"*. "Perceptive" is a band word: it is AQA **Language**'s TOP band (`knowledge-mark-scheme-lang1.md:65` —
"Level 4 — Perceptive, detailed analysis"), and it is not one of AQA Literature's level words at all (Level 2 there is
"Supported, relevant comments"). So two faults in one word: the wrong board's vocabulary, and a top-band word on a
Level 2 piece.

**THE RULE.**
1. A DISTINCTIVE band word from a mark scheme (perceptive, judicious, convincing, critical, exploratory,
   conceptualised, sophisticated…) is used ONLY for work at the level it names, and only the board's OWN words for the
   paper being marked — never another board's or another paper's. (Everyday words that also appear in descriptors —
   "clear", "relevant" — stay usable as plain praise; the rule targets words that a student or parent would read as a
   level claim. This boundary is the WML lane's reading of "appropriately"; he can overrule it.)
2. When feedback says what the mark scheme rewards, it quotes or closely follows the descriptor (the existing "Level
   Alignment" line already quotes it — that part is right).
3. Praise that is not a level claim uses plain words that carry no band ("this sentence explains the effect well"), so
   a student never reads a top-band word on a lower-band piece.

**Status:** recorded 9 Oct; ✅ BUILT v7.20.774 (FIXLIST #813c). Measured first on prod (read-only, 9 Oct): 5 saved
summary turns; a Grade 3 AQA Macbeth essay was praised for "genuine perceptive insight". 37 per-paragraph marking turns
were measured too and are NOT the fault: there "perceptive" is the protocol's own criterion name, a next-level target or
a gold model. So the rule rides the SUMMARY turn only: `examiner_vocabulary_block()` (class-protocol-router.php) is
appended by both summary mandates (language + literature). Gate: `bin/examiner-vocabulary-gate.php` (pre-ship) — it
proves the instruction is delivered, not that the model obeys; obedience is re-measured on saved summaries with
`~/.sophicly/probe/wml-338/bandwords.php`. Pairs with §37 (perceptiveness is the last 0.25 of a criterion — the
CRITERION may name it; a level claim may not borrow it), and the block allows exactly that: one criterion, named with
its paragraph.


## §60. ⭐⭐ ONE TTECEA PARAGRAPH ≈ 170 WORDS — the unit every reading-question word ADVICE is calculated from (Neil, ruled 2026-10-10; FIXLIST #871)

Neil, verbatim, answering the IGCSE advice-number card: *"1 TTECEA paragraph should be about 170 words; try calculate it"*.

**Applied (v7.20.816), Edexcel IGCSE Spec A advice (`MULTIQ_RESPONSE_TARGETS`, advice only — no limit, no stop, no penalty, §51.10):**
P1 Q4 (three TTECEA paragraphs) = 3 × 170 = **510** · P1 Q5 (short intro + three comparative paragraphs + short
conclusion) = 50 + 510 + 50 = **610** (the short intro/conclusion = the 50 each of Neil's AQA P2 Q4 ruling, 12 Jun)
· P2 Q1 (full essay) = 70 + 510 + 70 = **650**, which is already his essay ladder's 30 marks → 650 (v7.19.946).
Not TTECEA, so unchanged: P1 Q1–Q3 (point-marked, ~20 words a point) and the two writing tasks (P1 Q6 650, P2 Section B 450).

⚠️ **OPEN — not silently extended:** the AQA rows still use ~150 a paragraph (P1 Q2/Q3 300 = 2 × 150; P2 Q3 450 =
3 × 150; P2 Q4 550 = 50 + 3 × 150 + 50 — Neil, 12 Jun). Whether 170 replaces 150 there too is his call; asked on the
WML Actions page, not assumed (root §7: surface a conflict, never average it).
**10 Oct, night — his answer was a question, and it was the right one** (FIXLIST #886): *"what AQA word table? Have you
tried looking at a paragraph we have written to see how many words it is?"* There is no table he made: the AQA numbers are
per-question targets in a v7.19.423 code comment attributed to him (12 Jun). **Measured instead** (our own writing):
- **AQA Lang P2 sample answers** (`Model Answers/AQA Lang P2 Sample Answers — Death Zone + London Snow`): Q3's three body
  paragraphs 102 · 110 · 135 words (mean 116); Q4's four 124 · 118 · 115 · 138 (mean 124). Whole answers: Q3 379, Q4 551.
- **AQA Literature model answers** (60 essays, `Model Answers/AQA/*/topic-*.md`): body paragraphs mean 298 (102–646) —
  untimed library essays, not exam answers, so they do not decide a timed Language question.
- **No AQA Lang P1 or Edexcel IGCSE Language sample answers exist** on disk (both searches completed, nothing found).
So our own exam-shaped TTECEA paragraphs run about 115–125 words: below the code's 150 and well below 170. The AQA rows stay
as they are until he chooses; the measured numbers are on the Actions page for him.

## §61. ⭐⭐ AQA'S 2026 LANGUAGE WORDING IS THE AUTHORITY FOR THE NOVEMBER 2026 RESITS — applied, not a new ruling (v7.20.826, FIXLIST #887; Library's handoff of 2026-10-10)

AQA's question wording changed for exams "from summer 2026 onwards"; the specification, marks and AOs did not
(`research/sources/aqa-8700-faq-2026-changes.txt`). Under the standing law that **the mark scheme is the authority**
(WML `CLAUDE.md` §2a), these follow from AQA's own text — none is a house rule, so none is re-opened by preference:
1. **AQA Paper 1 Q3 names ONE effect.** AQA: *"If a student writes about structure but not the named focus then this
   would not be a 'clear' response to the question and will be reflected in the mark awarded."* Level 3 is "clear", so
   an answer that never addresses the named effect stops at **4/8, the top of Level 2** — the same reasoning AQA prints
   for its own Q5 cap. Sophia judges it (`Q3 focus: addressed / not addressed`, filed in the Paragraph 2 card); the code
   applies it. An older document whose Q3 asks "to interest you as a reader" is never capped.
2. **AQA Paper 2 Q1: a mark off for every tick beyond four.** AQA's November 2024 report: students who tick five or more
   "lose one mark for each additional choice beyond the required four". The platform scores the ticks; never below 0.
   (Our old rule scored the first four ticks — that was the defect.)
3. **AQA Paper 2 Q4 compares ideas and perspectives; methods are commented on**, "not necessarily" compared directly
   (FAQ p.5). Never deduct for two methods sitting side by side.
4. **AQA Paper 2 Q2 may ask for similarities** (FAQ p.4) — the marking follows the question's own word.
5. **Our practice papers carry the 2026 wording** (new documents only; a document already holding writing keeps the
   wording it was written to). Named effects, chosen so each is present in its extract and differs from that paper's
   Q4: City of the Beasts — a sense of unease · The Hunger Games — a sense of mystery · Life of Pi — build tension ·
   Mr Fisher — suspense · Jamaica Inn — a sense of foreboding.
**Already in place before #887:** the Q5 AO5 12-mark cap when the focus is missed (both papers' Protocol A).
**Still Neil's to rule** (AQA's reports disagree with our teaching, not our marking): the Q5 650-word ceiling, the
"SHOCKING STATISTIC" hook, "Picture this / Imagine" openers, the "Firstly… Secondly…" ban, and device stacking (§ ruled
2026-07-15 — AQA's June 2025 report warns against systematic device use; recorded once here, not re-argued).
