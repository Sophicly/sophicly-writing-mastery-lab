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

**⚠️ STILL GENUINELY OPEN (§0 applied — these are not re-asks; the protocol does not settle them):**
- **How GRANULAR should an outline row be?** The governing law is that the outline mirrors the
  planning protocol — but the AQA P2 Q5 IUMVCC outline renders **12 rows against ~30 taught
  elements** (the Methodology section, 250–350 words and the piece's engine, gets 2). Mirroring
  literally means ~30 rows; mirroring usefully may mean fewer. **This is the one real design
  question in the arc** and it recurs on every question of every paper, so it wants answering once.
  Weigh against PACE (`feedback_deep_but_never_dragging_pace_principle`).
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
   measure. (It also protects the grade-aggregation model — every attempt counts toward
   the average, so an attempt abandoned at Q2 is a real cost, not a free retry.)
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
