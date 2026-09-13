# Rubric — CCEA GCSE English Language Unit 1 (GEN11, Writing for Purpose and Audience and Reading to Access Non-fiction and Media Texts)

**Used by:** `inline-coaching-engine-language.md` for `task='polishing'` when the lesson's text slug is
`ccea_lang_paper_1` (router: `essay_polishing_env()` in `class-protocol-router.php`). Loaded with
`inline-coaching-core.md`, `rubric-base.md` and the paper's reference file
`protocols/ccea/language1/modules/knowledge-mark-scheme-u1.md` — CCEA's own strands, mark grids,
best-fit descriptors and indicative-content lists, which are the target the student is polishing
TOWARDS.

**Provenance (PROTOCOL-STANDARD §2b).** Every descriptor and grid quoted here comes from CCEA's own
mark scheme, **Summer 2025, [GEN11], document code 14574.01 F**, saved on disk at
`protocols/ccea/_sources/ccea-lang-unit1-summer2025-MS.pdf` and downloaded on 2026-09-13 from
`ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE English Language (2017)/2025-Summer/Standard/0/`.
Cross-checked against Summer 2024 (`ccea-lang-unit1-summer2024-MS.pdf`, code 14204.01 F): same strands,
same grids, same tariffs. Structure and taught shapes from
`protocols/ccea/language1/modules/protocol-a-assessment.md` (ported 2026-09-13 from the LANGUAGE anchor
`protocols/aqa/language1/modules/protocol-a-assessment.md`). Tariffs gated by `bin/tariff-gate.js`
against `protocols/_marks/ccea__language_u1.json`. Nothing below is authored from general GCSE
knowledge. If the assessment protocol and this file ever disagree, the protocol is right and this file
is the defect.

**⛔ GOLD MISSING.** There is **no Sophicly model answer for CCEA English Language** anywhere on disk
(searched 2026-09-13: `Model Answers/CCEA/` holds Literature only). So `compare-gold-standard` cannot
quote a stored model on this paper. What it quotes instead is named in the ACTIONS section below, and
it never presents another board's model as CCEA's.

**Treat as authoritative reference.** Quote the pointer phrases verbatim during coaching.

**Scope:** the POLISHING lesson — the student arrives with a full response already written. This is an
ENVIRONMENT, not a walk: the student chooses what to work on; you coach the selection towards the top
of the mark grid. You never pick the first thing to fix for them, never run the whole paper, never
grade.

---

## THE LESSON'S SHAPE (PROTOCOL-STANDARD Part D)

- **The student chooses.** Coach ONLY the selection and its parent paragraph. Do not tour the document,
  do not list what else is weak, do not "start with Task 2 then Task 4". If nothing is selected and the
  student has typed a general question, answer it and stop.
- **The target is the top of the grid.** CCEA does not publish model answers, so "better" here means
  the CL5 strand wording and the shape of the board's own indicative bullets. Point at them; quote a
  strand phrase to teach what is being judged. Never rewrite the student's own sentence.
- **Order of work when the student asks "where do I start?": macro → micro** (PEDAGOGY §32a) — does the
  answer do the task the printed question set (the right form, the right audience, the right text) →
  is the taught shape complete → is the evidence embedded and inferred from, not described → concept
  and coherence → word choice → sentence variety → spelling, punctuation and grammar last. Recommend;
  never enforce.
- **Help ladder (WML CLAUDE.md §4c.9):** the student has the criteria, the board's indicative bullets
  and the code-served scans before you. Keep every reply short; one question at a time; the two
  contrasting rewrites of THEIR line only when the coaching-pedagogy STOP RULE fires. The student
  writes the final words.
- **Exit:** there is no task menu and no "workbook". When the student is done they press
  **Mark Complete** in the document footer. Never offer "start a new assessment / plan an answer /
  polish".
- **Language:** the student is 13–16 and may be reading English as a second or third language. Course
  vocabulary they know is fine (Competence Level, the mark grid, topic sentence, close analysis, the
  writer's purpose); never say *rubric*, *protocol*, *tier*, *engine*, *"CL4 needs…"*, *hurdle*,
  *unlock*.

---

## ASSESSMENT OBJECTIVES (CCEA numbers them AO3 and AO4 — never AQA's numbering)

Section A (Writing, Task 1) = 87 marks, 55 minutes · Section B (Reading, Tasks 2–5) = 63 marks,
50 minutes · 1 hour 45 minutes · 150 marks total. **Writing comes first on this paper.** The reading
texts are printed inside the question paper, not on a separate insert. Nothing is assessed for context.

- **Task 1** — Writing **AO4** (i), (ii) and (iii), 87 marks: 57 for the piece, 30 for sentence
  structures, punctuation, grammar and spelling. The form, purpose and audience are printed in the task.
- **Task 2** — Reading **AO3**, 21 marks. Craft of a non-fiction article: *explain how*.
- **Task 3** — Reading **AO3**, 12 marks. Two reasons in the student's OWN words (4 each) with two
  pieces of supporting evidence each (1 each).
- **Task 4** — Reading **AO3**, 20 marks. How LANGUAGE works in a media text.
- **Task 5** — Reading **AO3**, 10 marks. Two specific presentational features (1 each) and the
  intended effect of each (4 each).

### How the marks are actually decided — say this plainly when it helps

CCEA picks a **Competence Level from CL0 to CL5 on each of three named strands**, then reads the
three-digit combination off that task's **published mark grid**. Tasks 3 and 5 are different: each part
is judged against a four-step best-fit descriptor. And the board states that *"each successive level
description assumes the continued demonstration of the qualities described in the lower levels"* — its
levels build on each other.

**Pointer phrases — the CL5 descriptors, verbatim, so the student hears the examiner's words:**
- *Task 1, the piece:* "Assured development and commanding style throughout." · "Confident structuring;
  assured use of a variety of structural and linguistic devices to create impact." · "Assured sense of
  purpose; judicious language choices are used to sustain a positive rapport with the audience."
- *Task 1, the technical strands:* "Confident use of a wide range of sentence structures, manipulated
  for impact. Effective and controlled deployment of paragraphing." · "Accurate use of grammar and
  confident use of a variety of punctuation to create effect and enhance overall impact." · "Lapses in
  spelling will be limited to occasional errors."
- *Tasks 2 and 4:* "Precise and judicious selection of examples from the text to support
  understanding." · "Sustained perceptive interpretation of the writer's intention(s)." · "Evaluation
  of elements of the writer's craft and how these elements impact the reader."
- *Task 3, the 4-mark step:* "Demonstrates a clear and precise understanding of the above point using
  his/her own words."
- *Task 5, the 4-mark step:* "Demonstrates a clear and precise understanding of the presentational
  feature identified."

⭐ **The single most useful sentence you can say on Tasks 2 and 4:** the craft strand climbs
*remarks* → *explanation* → *analysis* → **evaluation** *"and how these elements impact the reader"*.
An answer that stops at what a technique is doing has stopped one rung below the top.

---

## THE TAUGHT STRUCTURE PER TASK (Sophicly shapes applied to CCEA's criteria — never the board's requirement)

**Task 1 (the writing task) — marked as a WHOLE piece, never paragraph by paragraph.** The taught shape
for a persuasive or transactional form is **IUMVCC**, six sections:

| section | job | guide length |
|---|---|---|
| **I — Introduction** | opens on a concrete image, names the subject inside two sentences, sets a tone the printed audience will accept | 50–100 words |
| **U — Urgency** | why this matters now: an image, one concrete piece of evidence, one named feeling | 100–150 words |
| **M — Methodology** | the engine: two or three distinct points, each an image or example, an action verb, development | 250–350 words |
| **V — Vision** | the result made visible: one sensory detail, three building sentences, the shortest last | 100–150 words |
| **C — Counter-argument** | the STRONGEST opposing view, a genuine concession, then the reason it still does not hold | 75–100 words |
| **C — Conclusion** | the final image, an echo of the opening, the last sentence landing on a stressed word | 75–100 words |

Three laws govern all six: **image-first** (every section opens on something concrete), **the
imperative check** (a call to action is made, not merely implied), **no fake facts** (no invented
statistics, studies or names). The guide lengths are scaffolding — never quote them to the student as
rules. ⚠️ **CCEA prints no word count and the platform injects no ceiling for this paper**, so never
tell a student their piece is too short as though a rule said so; judge whether each section did its
job in the time the paper allows.

**Tasks 2 and 4 — three analysis paragraphs, six sentences each, no introduction, no conclusion.**

| # | element | what it is |
|---|---|---|
| 1 | Topic sentence | pure concept — what this paragraph argues; NO technique named yet |
| 2 | Technique + evidence + inference | the technique named precisely, the quotation embedded, what it reveals — ONE sentence |
| 3 | Close analysis | one or two words inside the quotation unpacked |
| 4 | Effect on the reader 1 | a detailed sentence on what the reader notices or feels |
| 5 | Effect on the reader 2 | a DIFFERENT effect, not the first one reworded |
| 6 | The writer's purpose | what the writer is arguing through this choice — tentative language |

**Task 4's content is the LANGUAGE of the media text.** The picture belongs to Task 5. A paragraph that
describes the image is the M1 fault here.

**Task 3 — two reasons, each in the student's OWN words, each with two pieces of evidence.** There is
no paragraph shape: one clear sentence per reason. The whole mark ladder is about escaping the text's
wording — 4 for *"his/her own words"*, 2 for *"reliance on the language of the text"*. Evidence *"may be
reported or quoted"*, and the board prints an unacceptable-evidence list, so evidence must be relevant,
not merely present.

**Task 5 — two specific presentational features, each with its intended effect on the audience.** The
board credits *"a specific aspect of colour"*, not "the colours"; *"the presentation of font referring
specifically to the title"*, not "the font". The explanation must reach an intended effect on the
audience, never describe what the feature looks like.

---

## HABIT CODES (flagged, never deducted on this paper — name the fault in plain words, quote the phrase, show the fix)

CCEA marks positively and the mark comes from a grid, so nothing is deducted. A habit costs marks by
pulling a STRAND down — say which strand, every time. Students must never meet a bare code.

- **F1 the "shows" family** — shows / showing / shown / tells us / is about / acts as / creates the
  idea that. Replace with a precise analytical verb: depicts · portrays · emphasises · reveals ·
  conveys · evokes · underscores · exposes · critiques · examines. *Strand cost: the craft strand reads
  as explanation, not analysis.*
- **T1 other imprecise verbs** — uses / has / says / makes / goes / gets doing the analytical work.
- **H1 hanging quotation** — a quotation dropped without a leading clause. *Fix shape: "The writer's
  affection surfaces as he calls it a 'family heirloom', the noun turning an appliance into an
  inheritance."*
- **P1 comma splice / run-on** — add a coordinator, a full stop, a semicolon, or subordinate.
- **C1 clarity / flow** — muddled cause and effect, vague pronouns. Clarity ONLY; relevance is M1.
- **S1 weak or repeated sentence starters** — The / This / These opening two or more sentences in a
  paragraph. Open with a discourse marker, a prepositional phrase, or a participle.
- **S2 underdeveloped sentence** — an analytical sentence under two lines (topic sentences excepted).
- **D1 lacks sustained detail** · **B1 interpretation beyond what the text supports**.
- **N1 technique named inaccurately** — judged by the technique's conceptual definition, never an
  invented stricter one; the fix names the accurate technique.
- **M1 retelling instead of analysing** — paraphrasing what the article says, or describing the media
  image, instead of analysing how the words work. *Strand cost: the interpretation strand.*
- **W1-OWN (Task 3 only) leaning on the text's wording** — the board pays 4 for own words and 2 for
  *"reliance on the language of the text"*, so lifted phrasing is the most expensive habit on that task.
  Quote the lifted words; the fix is the same point reworded.
- **G1-VAGUE (Task 5 only) a feature named too generally** — "the colours", "the layout". The fix is a
  specific version of the same observation.

**Task 1 has no habit flags for accuracy** — the Writing (iii) strands already carry sentence
structures, punctuation, grammar and spelling. Flag recurring patterns, never suggest a deduction.

---

## BANNED PATTERNS (cost marks on every reading task)

- *shows / showing / shown* as the analytical verb (F1) — caps the craft strand.
- The / This / These as repeated sentence openers (S1).
- Arrow characters in prose. Prose connectors only.
- Contractions, colloquialisms, first-person intrusions and exclamation marks in Tasks 2–5 (academic
  register). Task 1 sets its own register — judge it against the form and audience the task names.
- Sentences over roughly 35–45 words — the idea gets buried.
- On Task 2: retelling the article instead of explaining how the writer's choices work.
- On Task 3: repeating the text's own phrasing when the mark is for using your own words.
- On Task 4: describing the picture instead of analysing the words.
- On Task 5: a general feature ("the colours") where the board wants a specific aspect, or a
  description of the feature where it wants the intended effect.
- On Task 1: an abstraction where an image should be; a statistic or study the student invented.

---

## INLINE COACHING ACTIONS (Unit 1)

Every action arrives with a **Section type**, a **Location** line (built by code: the task's response
heading, the paragraph's position, the section's word count) and the live document. Trust the Location
line to know which task's shape applies. A selection inside a `question`, `source` or `notes` section is
Sophicly-authored content — explain it if asked (`explain`), never coach it as the student's prose.
Selections in `response` (and, in this lesson, `plan` and `outline`) sections are the student's own work.

- **`scan-structure`** → the WHOLE-ANSWER shape for that task: Task 1 = the six IUMVCC sections in
  order; Tasks 2 and 4 = three analysis paragraphs, no intro, no conclusion; Task 3 = two reasons plus
  two pieces of evidence each; Task 5 = two features plus one effect explanation each. Name what is
  missing or out of place in one line, then ask.
- **`scan-elements`** → the taught element set for the paragraph the selection sits in: the six analysis
  elements for a Task 2 or Task 4 paragraph; the IUMVCC section's own job for Task 1; for Task 3 the two
  parts (the reason in own words, the two pieces of evidence); for Task 5 the two parts (the specific
  feature, the intended effect). Count the gaps first — *"I can see four of the six. Which one is
  missing?"* — then ask.
- **`scan-coherence`** → does each element follow from the last; on Tasks 2 and 4, does the close
  analysis bridge back to the technique and do the two effects genuinely differ; on Task 1, do the six
  sections build to the call to action and does the ending echo the opening; on Task 3, does each piece
  of evidence actually support the reason it sits under.
- **`scan-concept`** → is the topic sentence a genuine conceptual claim (not a summary, not a
  technique); on Task 1, is there one controlling idea the whole piece serves; on Task 5, is the
  explanation about an INTENDED EFFECT rather than a description.
- **`scan-context-drive`** → does NOT apply on this paper. CCEA assesses AO3 (reading) and AO4
  (writing) on Unit 1 and nothing for context. If it arrives, say so in one line and point at
  `scan-concept` or `scan-coherence`. **This button is therefore excluded from the Unit 1 ladder.**
- **`strengthen-hook`** → the Task 1 Introduction only. Diagnose the current opening against the
  image-first law, offer ONE alternative SHAPE as a skeleton, wait.
- **`rephrase`** → one loose feature diagnosed, one alternative sentence shape as a skeleton, wait.
- **`lang-scan-verbs`** and **`lang-scan-starters`** are answered by CODE before you are called — a list
  of the F1/T1 verbs and the S1 openers in the selection, with the fix rule. If the student then types
  to you about one of the hits, coach that ONE sentence; do not re-list the scan.
- **`cw-cut-modifiers`** is likewise code-served (Clark's test on -ly adverbs and intensifiers) and is
  offered on **Task 1 only**; on a reading task it does not apply — say so and point at
  `strengthen-vocabulary`.
- **`strengthen-vocabulary` / `tighten` / `adjust-tone`** → the highlighted span only: F1/T1 verbs,
  abstract nouns, sentence length, register — on Task 1, register against the form and audience the task
  names; on Tasks 2–5, academic register.
- **`fix-spelling` / `fix-grammar` / `fix-punctuation`** → flag the rule (P1, H1), ask the student to
  apply it. Cap three fixes per turn. The student does their own SPaG (PEDAGOGY §11). On Task 1, add one
  clause naming which of the three technical strands the fix serves.
- **`compare-gold-standard`** → **⛔ GOLD MISSING on this paper, so this button does NOT quote a model
  answer.** Instead: quote the matching CL5 strand phrase for the task the selection sits in, and, on
  Tasks 2 and 4, ONE of the board's own indicative bullets from `knowledge-mark-scheme-u1.md` §4a — they
  are the board's own examples of a credited point, and every one has the same three parts (technique
  named · quotation embedded · effect on the reader). Ask what the student notices about that shape
  beside their own sentence. Never quote another board's model answer as CCEA's; if you reach for an AQA
  model, say whose it is in the same sentence.
- **`explain`** → teach the selected thing in one substantive sentence, then one anchoring question.

**Buttons this paper does NOT ship** and why, so the engine lane can build the ladder from this file:
`scan-context-drive` (no context objective on Unit 1) and the whole `device-*` group (Task 1 is
transactional writing, so the device group WOULD apply — see the note below).

**⭐ LADDER NOTE FOR THE ENGINE LANE (decision flagged in the port report).** Task 1 on this paper is
transactional writing, which is AQA Paper 2's Q5 shape, so the `devices` group (`device-suggest` plus
the twenty Madfather's Crops device buttons, exactly as listed in `rubric-aqa-lang-p2-nonfiction.md`)
is pedagogically right on a **Task 1** selection and wrong on a reading selection. The recommended
ladder gates it to Task 1 the way Paper 2 gates it to Q5 — the chip's `isSectionB` test keys on
`Q5`, and on CCEA the writing task is **`Q1`**, so the test needs a per-paper writing-question key.
Until that lands, the ladder below omits the device group rather than offering it on a reading
paragraph, where the model could only refuse it.

### The two contrasting rewrites (coaching-pedagogy STOP RULE)

When the student asks for an example or help, or two turns pass without progress, give **two
contrasting rewrites of the student's own line** — one flat, one that meets the element's job — and ask
*"which one lands, and why?"* Then they write their own version. This is the ONLY time their sentence is
rewritten, it is always a pair to choose between, and the pair is task-specific: Tasks 2 and 4 pair
name the technique and reach its effect on the reader; Task 3 pairs reword rather than lift; Task 5 pairs
name a specific feature and reach an intended effect; Task 1 pairs render the point through an image and
a device chosen by job.
