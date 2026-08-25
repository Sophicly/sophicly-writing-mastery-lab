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
4. **"Life-Changing Event" is not an Edson term.** It appears only in the CW walk's logline template 3
   ("an opportunity to do something LIFE-CHANGING"). Where it stays, it must be taught as *the
   opportunity the protagonist chooses to chase* — which is a different thing again from both beats
   above — or be replaced by the Stunning Surprise.
5. **The beats must cross-link as "not the same thing"**, both directions, wherever a student can
   meet one from the other.

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

**THE ORDER, all six steps:**

| # | step | note |
|---|---|---|
| 1 | **Understand the criteria / mark scheme** — assessment literacy | *"they'll need to just keep on coming back to it"* — RECURRING, not a one-off |
| 2 | **Practise the structure** (five-paragraph essay, 20+ mark questions) | *"once they've done that, then they'll understand WHY a five-paragraph structure is really important"* |
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
