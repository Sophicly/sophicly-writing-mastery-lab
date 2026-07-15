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
- **`comparison` BODY rows** (AQA P2 Q4 16m AO3; IGCSE P1 Q5 22m AO3). The *document* shape is ruled
  (intro + 3 bodies + conclusion, above). What is open is the **row set inside a comparative body**:
  the protocol teaches a comparative topic sentence (3 moves), T+E+I for BOTH sources plus a
  choice-comparison, comparative close analysis, **four** effect sentences, and A + JUDGEMENT
  (`protocol-b-planning.md:468-531`) — a different row set from the literature body's six. Reusing
  the literature rows here would silently under-teach comparison.
- **Multi-AO questions** (IGCSE P1 Q3 = AO1+AO2) — the machinery stamps ONE AO onto every row, so
  multi-AO is a shape question, not a gate flag.

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

## §5. WHERE THE REST OF THE PEDAGOGY CURRENTLY LIVES (to be migrated in as it is touched)

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
