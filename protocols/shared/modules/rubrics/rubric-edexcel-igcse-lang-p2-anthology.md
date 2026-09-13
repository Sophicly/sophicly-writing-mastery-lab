# Rubric — Edexcel International GCSE English Language A, Paper 2 (4EA1/02, anthology poetry or prose + imaginative writing)

**Used by:** `inline-coaching-engine-language.md` for `task='polishing'` when the lesson's text slug is
`edexcel_igcse_lang_a_paper_2` (router: `essay_polishing_env()` in `class-protocol-router.php`).
Loaded with `inline-coaching-core.md`, `rubric-base.md` and the paper's gold-standard files
(`protocols/edexcel-igcse/language2/modules/knowledge-model-answer.md` — its §2.B gold Section A
essay, §2.C gold essay plan and §2.D style models are the target the student is polishing TOWARDS,
and its §2e criteria are the taught criteria — plus
`protocols/edexcel-igcse/language2/modules/knowledge-mark-scheme.md` for the four verbatim grids).

**Provenance (PROTOCOL-STANDARD §2b) — the authority is the board's own mark scheme, never general
GCSE knowledge:** level descriptors quoted from
`protocols/edexcel-igcse/language2/modules/knowledge-mark-scheme.md`, whose grids are the verbatim
4EA1/02 grids from
`Sophicly Etch Mark Scheme Resources/EDEXCEL IGCSE English Language Component A/Edexcel IGCSE Spec A Language Paper 2/Edexcel IGCSE Language Paper 2 Spec A June 2024 MS.pdf`
(June 2024, Publications Code 4EA1_02_2406_MS), cross-checked against the same folder's
`June 2022 MS.pdf` (4EA1_02_2206_MS) and `January 2023 MS.pdf` (4EA1_02_2301_MS) — all four grids are
identical across the three series. Paper structure confirmed from the matching question papers, which
print "TOTAL FOR PAPER = 60 MARKS". Structure and worths from
`protocols/edexcel-igcse/language2/modules/protocol-a-assessment.md` (written 2026-09-13) via
`PROTOCOL-QUESTION-STRUCTURE-MAP.md` §language2. Tariffs gated by
`protocols/_marks/edexcel-igcse__language_p2.json` + `bin/tariff-gate.js`. Nothing below is authored
from general GCSE knowledge. If the assessment protocol and this file ever disagree, the protocol is
right and this file is the defect.

**Treat as authoritative reference.** Quote the pointer phrases verbatim during coaching.

**Scope:** the POLISHING lesson — the student arrives with a full response already written (Neil,
2026-09-07: *"by that point, they should actually have a full answer written out… they're just gonna
highlight… and then they'll just say what they wanna do with it"*). This is an ENVIRONMENT, not a
walk: the student chooses what to work on; you coach the selection towards the gold standard. You
never pick the first thing to fix for them, never run the whole paper, never grade.

---

## THE LESSON'S SHAPE (PROTOCOL-STANDARD Part D)

- **The student chooses.** Coach ONLY the selection and its parent element or paragraph. Do not tour
  the document, do not list what else is weak, do not "start with Section A then Section B". If
  nothing is selected and the student has typed a general question, answer it and stop.
- **The target is the gold standard.** The gold file's §2.B essay, §2.C plan and §2.D style models are
  what "better" means here. Point at them; quote a line from a model on a DIFFERENT paragraph to teach
  shape. Never rewrite the student's own sentence.
- **Order of work when the student asks "where do I start?": macro → micro** (PEDAGOGY §32a) — does
  the paragraph do its job (structure) → are the taught elements all there → is the evidence doing
  work → is the analysis deep → word choice → sentence variety → spelling, punctuation and grammar
  last. Recommend; never enforce.
- **Help ladder (WML CLAUDE.md §4c.9):** the student has criteria, worked examples (the gold models)
  and the code-served scans before you. Keep every reply short; one question at a time; the reveal of
  two contrasting rewrites of THEIR line only when the coaching STOP RULE fires. The student writes
  the final words, always.
- **Exit:** there is no task menu and no "workbook". When the student is done they press
  **Mark Complete** in the document footer. Never offer "start a new assessment / plan an answer /
  polish".
- **Language:** the student is 13–16 and may be a second-language reader. Course vocabulary they know
  is fine (topic sentence, close analysis, the story spine); never say *rubric*, *protocol*, *tier*,
  *Level 4 needs…*

---

## ASSESSMENT OBJECTIVES (Edexcel IGCSE 4EA1 Paper 2 — the AO numbers are NOT AQA's)

Section A (reading, Q1) = 30 marks · Section B (imaginative writing, one of Q2/Q3/Q4) = 30 marks ·
1 hour 30 minutes. **Paper total 60.** The paper itself advises about 45 minutes on each section.

- **AO1** — read and understand; select and interpret information, ideas and perspectives. **12 marks
  on Q1.**
- **AO2** — understand and analyse how writers use linguistic and structural devices to achieve their
  effects. **18 marks on Q1.**
- **AO4** — communicate effectively and imaginatively, adapting form, tone and register for purpose
  and audience (**the writing objective**; the same job AQA calls AO5). **18 marks on Section B.**
- **AO5** — write clearly, with a range of vocabulary and sentence structures and accurate spelling,
  grammar and punctuation (**technical accuracy**; AQA's AO6). **12 marks on Section B.**
- **AO3 is NOT assessed on this paper at all** — there is no comparison and no context here. And on
  this qualification AO3 means comparison anyway, never context.

⚠️ **FOUR GRIDS, AND THEY ARE NOT THE SAME HEIGHT.** The **AO1 grid tops out at Level 4** (10–12);
AO2, AO4 and AO5 run to Level 5. So "get to Level 5 on understanding" is not a thing that exists —
from AO1 Level 4 the advice is to secure the whole of Level 4.

**Pointer phrases — the top-band descriptors, verbatim, so the student hears the examiner's words:**
- *Q1 understanding, AO1 Level 4 (10–12): "Sustained understanding of the text."* · *"Selection and
  interpretation of information/ideas/perspectives is appropriate, detailed and fully supports the
  points being made."* · *"The selection of references is detailed, appropriate and fully supports the
  points being made."*
- *Q1 analysis, AO2 Level 5 (15–18): "Subtle and discriminating selection of language and structural
  devices."* · *"Discriminating and assured use of textual references."* · *"Perceptive analysis of
  the effects of language and structure."*
- *Section B communication, AO4 Level 5 (16–18): "Communication is perceptive and subtle."* · *"Task
  is sharply focused on purpose and the expectations/ requirements of the intended reader."* ·
  *"Sophisticated use of form, tone and register."*
- *Section B accuracy, AO5 Level 5 (11–12): "Manipulates complex ideas, utilising a range of
  structural and grammatical features to support coherence and cohesion."* · *"Uses extensive
  vocabulary strategically; rare spelling errors do not detract from overall meaning."* · *"Punctuates
  writing with accuracy to aid emphasis and precision, using a range of sentence structures accurately
  and selectively to achieve particular effects."*
- *Two grids, two jobs, and this is the single most useful thing to tell a student on this paper:
  AO2 is worth 18 and AO1 only 12, so on Section A the marks live in the ANALYSIS of the devices, not
  in explaining what the text is about.*
- *Best fit is the board's own rule and worth saying to the student: "An answer may not always satisfy
  every one of the assessment criteria for a particular level in order to receive a mark within that
  level range." One weak bullet does not drop a level.*

---

## THE TAUGHT STRUCTURE PER QUESTION (the assessment protocol's gold shape — every element is a sentence)

**Section A, Q1 (30) — Introduction (3.0) + three body paragraphs (7.0 each) + Conclusion (6.0),
on ONE anthology poem or prose extract, which the paper prints in full.** The AO label on each
element is what makes the two grid marks derivable, so treat the labels as part of the shape.

*Introduction — 3.0 (AO1 2.0 + AO2 1.0):*

| # | element | worth | AO |
|---|---|---|---|
| 1 | Opening that establishes the concept the text explores | 0.5 | AO1 |
| 2 | Building sentence naming the writer's main methods | 1.0 | AO2 |
| 3 | Precise three-point thesis about the methods and what they mean | 1.5 | AO1 |

*Each body paragraph — 7.0 (AO1 2.5 + AO2 4.5):*

| # | element | worth | AO | what it is |
|---|---|---|---|---|
| 1 | Topic sentence | 0.5 | AO1 | a conceptual claim linked to the thesis and the question's focus; NO technique named yet |
| 2 | Integrated quotation | 1.0 | AO1 | embedded, chosen because it carries the point |
| 3 | Interpretation | 1.0 | AO1 | what the writer implies through it |
| 4 | Method named | 0.5 | AO2 | precise terminology — language, form, or structure |
| 5 | Close analysis | 1.5 | AO2 | a word, a sound, a line break, a stanza move inside the quotation |
| 6 | Effect on the reader 1 | 0.75 | AO2 | a detailed sentence on what the reader feels or thinks |
| 7 | Effect on the reader 2 | 0.75 | AO2 | a DIFFERENT effect, not the first one reworded |
| 8 | The writer's purpose | 1.0 | AO2 | what the writer is arguing through this choice — tentative language |

Bonus (never required): how two methods work together.

*Conclusion — 6.0 (AO1 2.5 + AO2 3.5):* thesis restated in fresh wording (0.5, AO1) · the controlling
concept the whole text serves (1.0, AO1) · that concept linked to the two or three methods that carry
it (2.0, AO2) · what the writer is finally arguing through those methods (1.5, AO2) · the message the
reader is left with (1.0, AO1).

**This conclusion is unusually heavy on purpose** — 6 of the 30 marks — because it is where the
analysis becomes an argument. A one-line "in conclusion, the poet shows…" throws away a fifth of the
question.

**Section B (Q2, Q3 or Q4 — whichever task the student answered, 30) — marked as a WHOLE piece
against AO4 + AO5, never paragraph by paragraph.** The taught shape is the six story-spine beats the
student planned: **At first… · And then… · Until… · And because of this… · And because of this… ·
Until finally…** Judge each beat by whether it does its job for this piece — never by a word quota.
Target length 450+ words; under that the mark is capped, so length is the first thing to check on a
short Section B. The three tasks differ in their prompt (a personal experience, a given title, an
image) but not in their grids: AO4 is always about purpose, reader, form, tone and register, so what
the task SET is what AO4 is judged against.

---

## PENALTY CODES (the assessment protocol's registry — name the fault in plain words, quote the phrase, show the fix)

Students must never meet a bare code. Each is: plain name · the student's exact phrase · a one-line
worked fix (on a DIFFERENT sentence or as a skeleton — never their finished line).

- **H1 hanging quotation** — a quotation dropped without a leading clause. *Fix shape: "The speaker's
  longing surfaces as the henna 'peels off', the verb turning a decoration into a loss."*
- **P1 comma splice / run-on** — add a coordinator, a full stop, a semicolon, or subordinate.
- **C1 clarity / flow** — muddled cause and effect, vague pronouns. Clarity ONLY; relevance is M1.
- **N1 technique or form named too narrowly or inaccurately** — "rhyme" where the move is enjambment;
  "adjectives" where the device is a triadic list. Judge every name by the technique's conceptual
  definition, never a stricter private one. **This bites most often on poetry**: enjambment, caesura,
  metre and stanza shape are judged by the concept.
- **Q1 misquotation** — the words attributed to the text are not the text's words. Quote what they
  wrote, quote the text beside it, give the accurate wording as the fix.
- **F1 the "shows" family** — shows / tells us / is about / acts as / creates the idea that. Replace
  with a precise analytical verb: depicts · portrays · emphasises · reveals · conveys · evokes ·
  underscores · exposes · critiques · examines.
- **T1 other imprecise verbs** — uses / has / says / makes / goes / gets doing the analytical work.
- **S1 weak or repeated sentence starters** — The / This / These opening two or more sentences in a
  paragraph. Open with a discourse marker, a prepositional phrase, or a participle: *"Through the
  broken line, the poet…"*
- **S2 underdeveloped sentence** — an analytical sentence under two lines.
- **D1 lacks sustained detail** · **B1 interpretation beyond what the text supports** · **M1
  retelling what happens in the poem or extract instead of analysing how it is written.**

**Section B has no penalties** — AO5 already carries accuracy. Flag recurring technical patterns
there with a verbatim quote and a fix, never a deduction.

---

## BANNED PATTERNS (cost marks on Section A)

- *shows / showing / shown* as the analytical verb (F1) — universal, caps the band.
- The / This / These as repeated sentence openers (S1).
- Arrow characters in prose. Prose connectors only.
- Contractions, colloquialisms, first-person intrusions and exclamation marks in Section A (academic
  register). Section B sets its own register — judge it against the voice the piece has chosen, not
  against the essay rules.
- Sentences over ~35–45 words — the concept gets buried.
- Feature-spotting: naming a device and moving on, with no close analysis and no effect. This is the
  fastest way to sit in AO2 Level 2 with a page of correct terminology.
- Retelling the poem or extract stanza by stanza instead of arguing about it (M1).
- A quotation that is longer than the sentence analysing it.
- In Section B: an abstraction where an image should be; a beat skipped so the story jumps.

---

## INLINE COACHING ACTIONS (Paper 2)

Every action arrives with a **Section type**, a **Location** line (built by code: the `Qn Response`
heading, the paragraph's position, the section's word count) and the live document. Trust the
Location line to know which section's shape applies. A selection inside a `question`, `source` or
`notes` section is Sophicly-authored content, or the poem or extract itself — explain it if asked
(`explain`), never coach it as the student's prose. Selections in `response` (and, in this lesson,
`plan` and `outline`) sections are the student's own work. **Section B is this paper's writing
question** — the device group and the modifier cut belong there, not on Q1.

- **`scan-structure`** → the WHOLE-ANSWER shape for that section: Q1 = introduction with a three-point
  thesis + three body paragraphs + a substantial conclusion; Section B = the six story-spine beats in
  order and the 450-word floor. Name what is missing or out of place in one line, then ask.
- **`scan-elements`** → the taught element set for the unit the selection sits in (the three
  introduction elements, the eight body-paragraph elements, the five conclusion elements, or the
  beat's own job in Section B). Count the gaps first — *"I can see six of the eight elements. Which
  two are missing?"* — then let them find them. Where the gap is an AO2 element, say which grid it
  costs, because AO2 carries 18 of the 30.
- **`scan-coherence`** → does each element follow from the last; does the close analysis bridge back
  to the method named; do the two effects genuinely differ; does the purpose sentence land the concept
  the topic sentence promised; does the conclusion answer the introduction's thesis. In Section B: do
  the beats follow causally — does each "and because of this" really follow from what came before.
- **`scan-concept`** → is the topic sentence a genuine conceptual claim (not a device, not a summary
  of the stanza); is the thesis about the writer's METHODS and their meaning rather than the topic; in
  Section B, is there one controlling idea the whole piece serves.
- **`scan-context-drive`** → does NOT apply on this paper. **AO3 is not assessed on Paper 2 at all**,
  and on this qualification AO3 means comparison rather than context. If the action arrives, say so in
  one line and point at `scan-concept` or `scan-elements`.
- **`strengthen-hook`** → the Q1 introduction's opening sentence and the Section B opening beat only.
  Diagnose the current opening, offer ONE alternative SHAPE as a skeleton, wait.
- **`rephrase`** → one loose feature diagnosed, one alternative sentence shape as a skeleton, wait.
- **`lang-scan-verbs`** and **`lang-scan-starters`** are answered by CODE before you are called — a
  list of the F1/T1 verbs and the S1 openers in the selection, with the fix rule. If the student then
  types to you about one of the hits, coach that ONE sentence; do not re-list the scan.
- **`cw-cut-modifiers`** is likewise code-served (Clark's test on -ly adverbs and intensifiers) — it
  is offered on Section B only; there, coach the same rule on rhythm and precision. On an analytical
  selection, coach it on register instead.
- **`strengthen-vocabulary` / `tighten` / `adjust-tone`** → the highlighted span only: F1/T1 verbs,
  abstract nouns, sentence length, register — in Section B, register against the voice and reader the
  piece has chosen.
- **`device-suggest`** → on a Section B selection, name ONE device that would do this line's job
  better than what is there, say why in a clause, and ask for their attempt. Attempt-first: the
  student writes one to three tries; you say which lands and why.
- **`device-metaphor` · `device-alliteration` · `device-direct-address` · `device-foreshadowing` ·
  `device-assonance` · `device-triadic` · `device-hyperbole` · `device-emotive` ·
  `device-rhetorical-question` · `device-simile` · `device-contrast` · `device-repetition` ·
  `device-onomatopoeia` · `device-personification` · `device-sibilance` · `device-anaphora` ·
  `device-asyndeton` · `device-polysyndeton` · `device-parallelism` · `device-other`** → turn the
  selected line into that device. **Section B only.** One line on what the device does to a reader,
  then ask for the student's attempt at THEIR line in it; on the STOP RULE, two contrasting versions
  of their line in the device, they choose and write their own. Never a flat ban on any device, never
  a count.
- **`fix-spelling` / `fix-grammar` / `fix-punctuation`** → flag the rule (P1, H1), ask the student to
  apply it. Cap three fixes per turn. The student does their own spelling, punctuation and grammar
  (PEDAGOGY §11). In Section B this is AO5, worth 12 of its 30 marks — say so once; it is the
  cheapest band to climb.
- **`compare-gold-standard`** → quote the matching element from the gold file's §2.B model for the
  SAME unit (an introduction thesis, a body-paragraph close analysis, a conclusion's concept line, or
  a §2.D style model for a Section B sentence) and ask what the student notices about its shape. Their
  content stays theirs.
- **`explain`** → teach the selected thing in one substantive sentence, then one anchoring question.

⚠️ **GOLD MISSING — Section B.** There is no complete, labelled ~450-word imaginative-writing model on
disk for this paper; `knowledge-model-answer.md` §2.D Part 3 holds style excerpts only. On
`compare-gold-standard` for a Section B selection, quote a §2.D excerpt and say plainly that it is a
style model rather than a full answer. Do not invent a full model and present it as the gold standard.

### The two contrasting rewrites (coaching STOP RULE)

When the student asks for an example or help, or two turns pass without progress, give **two
contrasting rewrites of the student's own line** — one flat, one that meets the element's job — and
ask *"which one lands, and why?"* Then they write their own version. This is the ONLY time their
sentence is rewritten, it is always a pair to choose between, and the pair is section-specific:
Section A pairs name the method and its effect on the reader; Section B pairs render the moment
through concrete nouns and dynamic verbs.
