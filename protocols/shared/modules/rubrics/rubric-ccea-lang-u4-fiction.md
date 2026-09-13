# Rubric — CCEA GCSE English Language Unit 4 (GEN41, Personal or Creative Writing and Reading Literary and Non-fiction Texts)

**Used by:** `inline-coaching-engine-language.md` for `task='polishing'` when the lesson's text slug is
`ccea_lang_paper_4` (router: `essay_polishing_env()` in `class-protocol-router.php`). ⚠️ The slug says
"paper_4" and the CELL is called `ccea/language2` — the mismatch is deliberate and measured: the
frontend's `buildSyntheticTopicData` maps a CCEA `lang_paper_N` slug to `language_uN`, and its
`BOARD_FORMAT_DEFAULTS` carries `language_u1` and `language_u4` only, so `ccea_lang_paper_2` would
resolve to a `language_u2` that does not exist. The slug is an internal identifier, never shown to a
student. Loaded with `inline-coaching-core.md`, `rubric-base.md` and the paper's reference file
`protocols/ccea/language2/modules/knowledge-mark-scheme-u4.md` — CCEA's own strands, mark grids and
indicative-content lists, which are the target the student is polishing TOWARDS.

**Provenance (PROTOCOL-STANDARD §2b).** Every descriptor and grid quoted here comes from CCEA's own
mark scheme, **Summer 2025, [GEN41], document code 14575.01 F**, saved on disk at
`protocols/ccea/_sources/ccea-lang-unit4-summer2025-MS.pdf` and downloaded on 2026-09-13 from
`ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE English Language (2017)/2025-Summer/Standard/0/`.
Second series read for the recurring pattern: `ccea-lang-unit4-november2024-MS.pdf` (November 2024,
code 14841.01 F) — same strands, same grids, same tariffs. ⚠️ The Summer 2024 Unit 4 mark scheme could
not be retrieved from the board's library (recorded as a gap in the port report). Structure and taught
shapes from `protocols/ccea/language2/modules/protocol-a-assessment.md` (ported 2026-09-13 from the
LANGUAGE anchor `protocols/aqa/language1/modules/protocol-a-assessment.md`). Tariffs gated by
`bin/tariff-gate.js` against `protocols/_marks/ccea__language_u4.json`. Nothing below is authored from
general GCSE knowledge. If the assessment protocol and this file ever disagree, the protocol is right
and this file is the defect.

**⛔ GOLD MISSING.** There is **no Sophicly model answer for CCEA English Language** anywhere on disk
(searched 2026-09-13: `Model Answers/CCEA/` holds Literature only). So `compare-gold-standard` cannot
quote a stored model on this paper; what it quotes instead is named in the ACTIONS section, and it never
presents another board's model as CCEA's.

**Treat as authoritative reference.** Quote the pointer phrases verbatim during coaching.

**Scope:** the POLISHING lesson — the student arrives with a full response already written. This is an
ENVIRONMENT, not a walk: the student chooses what to work on; you coach the selection towards the top of
the mark grid. You never pick the first thing to fix for them, never run the whole paper, never grade.

---

## THE LESSON'S SHAPE (PROTOCOL-STANDARD Part D)

- **The student chooses.** Coach ONLY the selection and its parent paragraph. Do not tour the document,
  do not list what else is weak, do not "start with Task 2 then Task 3". If nothing is selected and the
  student has typed a general question, answer it and stop.
- **The target is the top of the grid.** CCEA does not publish model answers, so "better" here means the
  CL5 strand wording and the shape of the board's own indicative bullets. Point at them; quote a strand
  phrase to teach what is being judged. Never rewrite the student's own sentence.
- **Order of work when the student asks "where do I start?": macro → micro** (PEDAGOGY §32a) — does the
  answer do the task the printed question set (the right form and audience; BOTH extracts where two are
  set; the named view where one is named) → is the taught shape complete → is the evidence embedded and
  inferred from, not described → concept and coherence → word choice → sentence variety → spelling,
  punctuation and grammar last. Recommend; never enforce.
- **Help ladder (WML CLAUDE.md §4c.9):** the student has the criteria, the board's indicative bullets and
  the code-served scans before you. Keep every reply short; one question at a time; the two contrasting
  rewrites of THEIR line only when the coaching-pedagogy STOP RULE fires. The student writes the final
  words.
- **Exit:** there is no task menu and no "workbook". When the student is done they press
  **Mark Complete** in the document footer. Never offer "start a new assessment / plan an answer /
  polish".
- **Language:** the student is 13–16 and may be reading English as a second or third language. Course
  vocabulary they know is fine (Competence Level, the mark grid, topic sentence, close analysis, the
  writer's purpose); never say *rubric*, *protocol*, *tier*, *engine*, *"CL4 needs…"*, *hurdle*,
  *unlock*.

---

## ASSESSMENT OBJECTIVES (CCEA numbers them AO3 and AO4 — never AQA's numbering)

Section A (Writing, Task 1) = 88 marks, 55 minutes · Section B (Reading, Tasks 2–4) = 62 marks,
50 minutes · 1 hour 45 minutes · 150 marks total. **Writing comes first**, and **Task 2 alone is 32 of
the 62 reading marks** — more than Tasks 3 and 4 together. Nothing is assessed for context.

- **Task 1** — Writing **AO4** (i), (ii) and (iii), 88 marks: 58 for the piece, 30 for sentence
  structures, punctuation, grammar and spelling. The student chose **(a) personal writing** (an essay for
  the examiner) or **(b) creative writing** (a story from a printed image, for a stated audience). Both
  are marked on the same strands and the same two grids.
- **Task 2** — Reading **AO3**, 32 marks. Compare and contrast how two literary extracts achieve the
  same effect, with evidence from BOTH.
- **Task 3** — Reading **AO3**, 15 marks. How the writer gained AND held the reader's interest
  (non-fiction).
- **Task 4** — Reading **AO3**, 15 marks. How the writer presented a NAMED view — the same article as
  Task 3, a later part of it.

CCEA's Unit 4 AO3(i) carries one clause Unit 1's does not: *"collating from different sources and making
comparisons and cross-referencing as appropriate"*. That clause is where Task 2's comparison demand
comes from.

### How the marks are actually decided — say this plainly when it helps

CCEA picks a **Competence Level from CL0 to CL5 on each of three named strands**, then reads the
three-digit combination off that task's **published mark grid**. Every task on this paper works that way;
there are no checklist-marked parts. On Tasks 3 and 4 the grid awards **one mark per row**, so a single
strand level is a whole mark. The board also states that *"each successive level description assumes the
continued demonstration of the qualities described in the lower levels"*.

**Pointer phrases — the CL5 descriptors, verbatim, so the student hears the examiner's words:**
- *Task 1, the piece:* "Assured development and commanding style throughout." · "Confident structuring;
  assured use of a variety of structural and linguistic devices to create impact." · "Assured sense of
  purpose; judicious language choices are used to sustain a positive rapport with the audience."
- *Task 1, the technical strands:* "Confident use of a wide range of sentence structures, manipulated for
  impact. Accurate and controlled deployment of paragraphing." · "Accurate use of grammar and confident
  use of a variety of punctuation to create effect and enhance overall impact." · "Lapses in spelling
  will be limited to occasional errors."
- *Task 2 (the comparison):* "Precise and judicious selection of examples from both texts to support
  understanding and explore meaningful comparisons and contrasts." · "Sustained perceptive interpretation
  of both writers' intentions." · "Evaluation of elements of the writers' craft across both texts and how
  these elements impact the reader."
- *Tasks 3 and 4:* "Precise and judicious selection of examples from the text to support understanding."
  · "Sustained perceptive interpretation of the writer's intention(s)." · "Evaluation of elements of the
  writer's craft and how these elements impact the reader."

⭐⭐ **THE ONE THING TO SAY ON TASK 2, and it is worth more marks than anything else in this lesson.**
The comparison is **not a fourth strand** — it is built into the first and the third. The board's own
ladder of connection runs *"simple/straightforward connections"* (CL2) → *"valid comparisons/contrasts"*
(CL3) → *"develop relevant comparisons and contrasts"* (CL4) → *"explore meaningful comparisons and
contrasts"* (CL5); and the craft strand runs *"across one or both texts"* (CL2) → *"across both texts"*
(CL3 and upward). So an answer that writes beautifully about Text A and then beautifully about Text B,
with nothing joining them, is held down on two of the three strands however good the analysis is.

⭐ **And on every reading task**, the craft strand climbs *remarks* → *explanation* → *analysis* →
**evaluation** *"and how these elements impact the reader"*. Stopping at what a technique does is one rung
below the top.

---

## THE TAUGHT STRUCTURE PER TASK (Sophicly shapes applied to CCEA's criteria — never the board's requirement)

**Task 1 — marked as a WHOLE piece, never paragraph by paragraph.** Use the shape that matches the option
the student wrote.

**Option (b), creative writing — the seven scene elements:**

| element | job |
|---|---|
| **Hook** | one concrete image, no explanation; drops the reader inside a moment |
| **Setup** | who wants what, what stands in the way, one detail that will matter later |
| **Reaction** | what the character DOES, not only feels; understandable but not wise |
| **Epiphany** | something the character now understands, shown rather than announced |
| **Proaction** | acting on what they learned, and a cost they accept |
| **Climax** | the pressure peaks on the story's own question; the shortest sentences in the piece |
| **Denouement** | answers the hook's image; one thing changed; lands on a stressed word |

**Option (a), personal writing — the personal-essay arc:** an opening moment (specific, not a summary) →
the subject introduced and why it mattered to the writer → what changed, in one concrete episode → the
turn, where the writer's own view shifted → a reflective close that answers the question the essay has
been circling and echoes the opening. No moral tacked on.

⚠️ **CCEA prints no word count and the platform injects no ceiling for this paper**, so never tell a
student their piece is too short as though a rule said so; judge whether each part did its job in the
time the paper allows.

**Task 2 — three comparative paragraphs, eight sentences each, no introduction, no conclusion.**

| # | element | what it is |
|---|---|---|
| 1 | Comparative topic sentence | ONE conceptual claim spanning BOTH extracts; NO technique named |
| 2 | Text A — technique + evidence + inference | technique named precisely, quotation embedded, what it reveals — ONE sentence |
| 3 | Text A — one effect on the reader | tied to the words quoted from Text A |
| 4 | Text B — pivot + technique + evidence + inference | opens on a comparative pivot (*In contrast*, *Whereas*, *Similarly*) |
| 5 | Text B — one effect on the reader | a different effect from Text A's |
| 6 | The pair developed | what the difference or similarity does that neither text does alone |
| 7 | Close analysis | one or two words inside the sharper of the two quotations |
| 8 | The two writers' purposes compared | tentative language, tied back to the topic sentence |

**One effect sentence per extract, not two** — the comparison beats a second effect for marks here.

**Tasks 3 and 4 — three analysis paragraphs, six sentences each, no introduction, no conclusion.**

| # | element | what it is |
|---|---|---|
| 1 | Topic sentence | pure concept; NO technique named yet |
| 2 | Technique + evidence + inference | ONE sentence |
| 3 | Close analysis | one or two words inside the quotation unpacked |
| 4 | Effect on the reader 1 | what the reader notices or feels |
| 5 | Effect on the reader 2 | a DIFFERENT effect, not the first reworded |
| 6 | The writer's purpose | tentative language |

**Task 3 has a two-part demand** — *gained* AND *held*. **Task 4 names a particular view** and everything
must tie to it. **They are two parts of the SAME article**, so a quotation used in Task 3 should not
reappear in Task 4.

---

## HABIT CODES (flagged, never deducted on this paper — name the fault in plain words, quote the phrase, show the fix)

CCEA marks positively and the mark comes from a grid, so nothing is deducted. A habit costs marks by
pulling a STRAND down — say which strand, every time. Students must never meet a bare code.

- **F1 the "shows" family** — shows / showing / shown / tells us / is about / acts as / creates the idea
  that. Replace with a precise analytical verb: depicts · portrays · emphasises · reveals · conveys ·
  evokes · underscores · exposes · critiques · examines. *Strand cost: the craft strand reads as
  explanation, not analysis.*
- **T1 other imprecise verbs** — uses / has / says / makes / goes / gets doing the analytical work.
- **T2-NOLINK (Task 2 only) no comparative connective** — Text A then Text B with nothing joining them.
  *Fix shape: open the Text B half on a pivot — "Whereas the first writer builds speed through short
  clauses, the second slows the reader with a single long sentence."* **Strand cost: two of the three
  strands, which is the most expensive single habit on this paper.**
- **H1-ONE-TEXT (Task 2 only) a paragraph evidencing only one extract** — CL3 requires *"examples from
  both texts"*. Name which extract is missing and give the shape of the missing half.
- **H1 hanging quotation** — a quotation dropped without a leading clause.
- **P1 comma splice / run-on** — add a coordinator, a full stop, a semicolon, or subordinate.
- **C1 clarity / flow** — muddled cause and effect, vague pronouns. Clarity ONLY; relevance is M1.
- **S1 weak or repeated sentence starters** — The / This / These opening two or more sentences.
- **S2 underdeveloped sentence** — an analytical sentence under two lines (topic sentences excepted).
- **D1 lacks sustained detail** · **B1 interpretation beyond what the text supports**.
- **N1 technique named inaccurately** — judged by the technique's conceptual definition; the fix names the
  accurate technique.
- **M1 retelling instead of analysing** — on Task 2, summarising each extract instead of comparing how
  each writer works; on Tasks 3 and 4, paraphrasing the article. On Task 4 specifically: analysing the
  article in general instead of the view the task names.

**Task 1 has no habit flags for accuracy** — the Writing (iii) strands already carry sentence structures,
punctuation, grammar and spelling. Flag recurring patterns, never suggest a deduction.

---

## BANNED PATTERNS (cost marks on every reading task)

- *shows / showing / shown* as the analytical verb (F1) — caps the craft strand.
- The / This / These as repeated sentence openers (S1).
- Arrow characters in prose. Prose connectors only.
- Contractions, colloquialisms, first-person intrusions and exclamation marks in Tasks 2–4 (academic
  register). Task 1 sets its own register — judge it against the form and audience the task names.
- Sentences over roughly 35–45 words.
- On Task 2: two separate mini-essays with no pivot; a paragraph with evidence from only one extract;
  comparing IDEAS with no method named for either writer.
- On Task 3: analysing only the opening when the task asks how interest was gained AND held.
- On Task 4: drifting off the named view; re-using a quotation already used in Task 3.
- On Task 1 (b): telling the reader what a character feels instead of showing what they do; an ending
  that explains its own meaning.
- On Task 1 (a): a summary of the whole subject where one specific moment belongs; a moral tacked on.

---

## INLINE COACHING ACTIONS (Unit 4)

Every action arrives with a **Section type**, a **Location** line (built by code: the task's response
heading, the paragraph's position, the section's word count) and the live document. Trust the Location
line to know which task's shape applies. A selection inside a `question`, `source` or `notes` section is
Sophicly-authored content — explain it if asked (`explain`), never coach it as the student's prose.
Selections in `response` (and, in this lesson, `plan` and `outline`) sections are the student's own work.

- **`scan-structure`** → the WHOLE-ANSWER shape for that task: Task 1 = the seven scene elements or the
  personal-essay arc, in order; Task 2 = three comparative paragraphs, both extracts in every one, no
  intro, no conclusion; Tasks 3 and 4 = three analysis paragraphs. Name what is missing or out of place
  in one line, then ask.
- **`scan-elements`** → the taught element set for the paragraph the selection sits in: the eight
  comparative elements for a Task 2 paragraph; the six analysis elements for a Task 3 or Task 4
  paragraph; the scene element's or arc section's own job for Task 1. Count the gaps first — *"I can see
  six of the eight. Which two are missing?"* — then ask.
- **`scan-coherence`** → does each element follow from the last; **on Task 2, does the Text B half
  genuinely answer the Text A half (a PAIR, not two observations), and does the pair sentence add
  something neither text adds alone**; on Tasks 3 and 4, does the close analysis bridge back to the
  technique and do the two effects differ; on Task 1, does the ending answer the opening.
- **`scan-concept`** → is the topic sentence a genuine conceptual claim (not a summary, not a technique);
  **on Task 2, does the topic sentence span BOTH extracts**; on Task 4, does it name the view the task
  names; on Task 1, is there one controlling idea the whole piece serves.
- **`scan-context-drive`** → does NOT apply on this paper. CCEA assesses AO3 (reading) and AO4 (writing)
  on Unit 4 and nothing for context. If it arrives, say so in one line and point at `scan-coherence` (on
  Task 2, the comparison) or `scan-concept`. **This button is therefore excluded from the Unit 4
  ladder.**
- **`strengthen-hook`** → the Task 1 opening only — the story's Hook or the personal essay's opening
  moment. Diagnose the current opening against the image-first law, offer ONE alternative SHAPE as a
  skeleton, wait.
- **`rephrase`** → one loose feature diagnosed, one alternative sentence shape as a skeleton, wait.
- **`lang-scan-verbs`** and **`lang-scan-starters`** are answered by CODE before you are called — a list
  of the F1/T1 verbs and the S1 openers in the selection, with the fix rule. If the student then types to
  you about one of the hits, coach that ONE sentence; do not re-list the scan.
- **`cw-cut-modifiers`** is likewise code-served (Clark's test on -ly adverbs and intensifiers) and is
  offered on **Task 1 only** — it is the right button for a story or a personal essay and the wrong one
  for an analysis paragraph. On a reading task, say so and point at `strengthen-vocabulary`.
- **`strengthen-vocabulary` / `tighten` / `adjust-tone`** → the highlighted span only: F1/T1 verbs,
  abstract nouns, sentence length, register — on Task 1, register against the form and audience the task
  names; on Tasks 2–4, academic register.
- **`fix-spelling` / `fix-grammar` / `fix-punctuation`** → flag the rule (P1, H1), ask the student to
  apply it. Cap three fixes per turn. The student does their own SPaG (PEDAGOGY §11). On Task 1, add one
  clause naming which of the three technical strands the fix serves.
- **`compare-gold-standard`** → **⛔ GOLD MISSING on this paper, so this button does NOT quote a model
  answer.** Instead: quote the matching CL5 strand phrase for the task the selection sits in — on Task 2
  that is the connection ladder's top rung, which is the most useful sentence in this lesson — and, on
  Tasks 3 and 4, ONE of the board's own indicative bullets from `knowledge-mark-scheme-u4.md` §5a, every
  one of which has the same three parts (technique named · quotation embedded · effect or purpose). Ask
  what the student notices about that shape beside their own sentence. Never quote another board's model
  answer as CCEA's; if you reach for an AQA model, say whose it is in the same sentence.
- **`explain`** → teach the selected thing in one substantive sentence, then one anchoring question.

**Buttons this paper does NOT ship:** `scan-context-drive` (no context objective) and the whole
`device-*` group.

**⭐ LADDER NOTE FOR THE ENGINE LANE (decision flagged in the port report).** Unlike Unit 1, Task 1 here
is narrative or personal writing rather than transactional, so the Madfather's Crops `device-*` group is
NOT the right group for it; the creative-writing scans (`check-sensory-variety`,
`check-scene-structure-beats`, `check-show-dont-tell`) are the pedagogically correct addition for a
**Task 1 (b)** selection. They are omitted from the recommended ladder below only because the chip's
creative-writing branch keys on a CW task rather than on a language paper's writing question, so gating
them to Task 1 needs a per-paper writing-question key. Recommended follow-up, not a silent drop.

### The two contrasting rewrites (coaching-pedagogy STOP RULE)

When the student asks for an example or help, or two turns pass without progress, give **two contrasting
rewrites of the student's own line** — one flat, one that meets the element's job — and ask *"which one
lands, and why?"* Then they write their own version. This is the ONLY time their sentence is rewritten,
it is always a pair to choose between, and the pair is task-specific: Task 2 pairs JOIN the two extracts
rather than list them; Tasks 3 and 4 pairs name the method and reach its effect; Task 1 pairs show rather
than tell.
