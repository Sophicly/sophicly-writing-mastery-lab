# PROTOCOL QUESTION-STRUCTURE MAP

**Auto-generated 2026-07-16** by the `protocol-question-structure-map` workflow (7 board agents,
Sonnet) reading each board's `protocols/<board>/<subject>/modules/protocol-a-assessment.md` +
`protocols/shared/{language,literature}-paper-specs.json`. Every row is DERIVED + source-cited,
never invented. **This is the answer to "what elements does question X have" — never ask, look here.**
The derivation rules (para-count-by-marks, skip-list, TTECEA bedrock) live in `CLAUDE.md` →
"PLAN → OUTLINE → RESPONSE". Regenerate: re-run the workflow (script in the session workflows dir).

**Legend:** structureType = `ttecea-body` (reading/analysis, body-only) · `full-essay`
(intro+body+conc) · `iumvcc` (Section B transactional) · `scene-story-spine` (Section B creative) ·
`none` (SKIP — no plan/outline) · `other` (non-TTECEA structured, see notes).

## Boards
- **aqa** — 16 questions
- **Edexcel** — 21 questions
- **Edexcel IGCSE** — 12 questions
- **eduqas** — 22 questions
- **OCR** — 3 questions
- **ccea** — 2 questions
- **sqa** — 2 questions

---

## AQA

> **Coverage:** Read every protocol-a-assessment*.md in protocols/aqa/{language1,language2,literature,poetry,unseen}/modules/, plus protocols/shared/language-paper-specs.json (aqa block) and protocols/shared/literature-paper-specs.json (aqa block). Fully mapped: Lang P1 Q1-Q5, Lang P2 Q1-Q5, Literature Paper 1 Section A (Shakespeare) + Section B (19th-century), Literature Paper 2 Section A (modern text), Poetry Paper 2 Section B (anthology comparison), Unseen Poetry Paper 2 Section C Q27.1+Q27.2. Nothing in these 5 subjects was left unread. One gap surfaced directly by the source, not by me: literature-paper-specs.json flags 19th_century as a "SIBLING (Phase 2)" — it has no dedicated 30-mark protocol split of its own and is currently marked by the 34-shape (Shakespeare/modern) protocol, which over-marks a 30 paper by 4 (no AO4/SPaG on 19th-century) — logged as a deviation on that row, not invented by me. All AO stamps, worths and element wording are copied/paraphrased directly from the protocol tables, never invented.

### language1 — AQA Language Paper 1 (fiction)

#### Q1 — Retrieval — list 4 things from lines X-Y
- **4 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ True/false-style retrieval, mark-per-statement. Universal SKIP rule applies verbatim.
- _Source:_ `protocols/aqa/language1/modules/protocol-a-assessment.md (PAPER MAP, line 42); protocols/shared/language-paper-specs.json aqa.language_p1.Q1`

#### Q2 — Language Analysis — how the writer uses language to...
- **8 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence — conceptual only, no technique named (AO2) — 0.5
  - Technique + Evidence + Inference — technique named + integrated quote + inference (AO2) — 1.0
  - Close Analysis — perceptive word-level zoom (AO2) — 0.5
  - Effect 1 on Reader — first detailed sentence (AO2) — 0.5
  - Effect 2 on Reader — second detailed sentence (AO2) — 0.5
  - Author's Purpose (AO2) — 1.0
  - [optional BONUS] Technique interplay analysis (AO2) — +0.5, capped at 4.0, never required for full marks
- _Note:_ AO2-only question — Context row dropped (no AO3 assessed). 2 paragraphs x 4.0 = 8. 6 criteria sum exactly to 4.0; the interplay row is a bonus on top, capped, never a 7th required element.
- _Source:_ `protocols/aqa/language1/modules/protocol-a-assessment.md lines 399-419 (mark breakdown table)`

#### Q3 — Structure Analysis — how the writer has structured the text to...
- **8 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence — conceptual claim about a structural effect (AO2) — 0.5
  - Structural Feature Named + Evidence + Inference — whole-text, paragraph-level or sentence-level device (AO2) — 1.0
  - Close Analysis — word/paragraph-level zoom on the structural choice (AO2) — 0.5
  - Effect 1 on Reader — first detailed sentence (AO2) — 0.5
  - Effect 2 on Reader — second detailed sentence (AO2) — 0.5
  - Author's Purpose (AO2) — 1.0
  - [optional BONUS] Technique interplay analysis (AO2) — +0.5, capped at 4.0
- _Note:_ Same TTECEA bedrock as Q2, deviation = criterion 2 must be a STRUCTURAL device (whole-text, paragraph, or sentence-level shaping), not a language technique. Reward at least one whole-text and one paragraph-level feature across the two paragraphs.
- _Source:_ `protocols/aqa/language1/modules/protocol-a-assessment.md lines 464-483 ("Follows the EXACT Q2 template" with structural-feature swap)`

#### Q4 — Evaluation — to what extent do you agree...
- **20 marks** · AOs: AO4 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Clear opening engaging the statement's evaluative keywords with a sophisticated stance, not bare agree/disagree (AO4) — 0.5 · Precise thesis introducing three evaluative points (AO4) — 0.5
- **Body paragraph elements:**
  - Topic Sentence — addresses evaluative keywords + links to thesis (AO4) — 1.0
  - Integrated quotes & supporting evidence (AO4) — 0.5
  - Accurate technical terminology (AO4) — 0.5
  - Analysis links to topic sentence (AO4) — 0.5
  - Close Analysis — perceptive (AO4) — 1.0
  - Effect 1 on Reader — first detailed sentence (AO4) — 0.75
  - Effect 2 on Reader — second detailed sentence (AO4) — 0.75
  - Evaluates Author's Purpose against the statement (AO4) — 1.0
- **Conclusion:** Restates the evaluative stance in fresh words AND synthesises the three points against the statement (AO4) — 0.5 · Closes on the writer's overall achievement (AO4) — 0.5
- _Note:_ Single-AO question — every element marked against AO4 only, no separate AO2/AO1 rows and no Context row. Mini-essay: Intro(1) + 3xBP(6 each=18) + Conclusion(1) = 20 exactly. Not a bare agree/disagree mark — quality of execution is what scores.
- _Source:_ `protocols/aqa/language1/modules/protocol-a-assessment.md lines 489-552`

#### Q5 — Creative Writing — descriptive or narrative (choice of 2 tasks)
- **40 marks** · AOs: AO5, AO6 · structure: **scene-story-spine** · paragraphs: **0**
- _Note:_ HOLISTIC — no paragraph-count rule at all; marked whole-piece as Content & Organisation (AO5, /24) + Technical Accuracy (AO6, /16). Feedback walks the taught scene-structure beats (knowledge-hub 2.C creative-writing criteria — the Pixar-style story-spine beats used across CW), one block per beat, not a fixed paragraph count. 650-word ceiling applies (never a halt).
- _Source:_ `protocols/aqa/language1/modules/protocol-a-assessment.md lines 565-624; protocols/shared/language-paper-specs.json aqa.language_p1.Q5`

### language2 — AQA Language Paper 2 (non-fiction)

#### Q1 — Choose 4 true statements from 8 about Source A
- **4 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ Multiple-choice tick-box. Universal SKIP rule applies verbatim.
- _Source:_ `protocols/aqa/language2/modules/protocol-a-assessment.md (PAPER MAP, line 41); protocols/shared/language-paper-specs.json aqa.language_p2.Q1`

#### Q2 — Infer the differences between the two sources, supported by quotations
- **8 marks** · AOs: AO1 · structure: **other** · paragraphs: **2**
- **Body paragraph elements:**
  - Inference 1 (Source A): inferential claim beyond the obvious (AO1) — 0.5
  - Inference 1: developed in detail — interpretation, not paraphrase (AO1) — 0.5
  - Inference 1: judicious embedded Source A quotation (AO1) — 0.5
  - Inference 2 (Source B): opens with a comparative discourse marker + states the difference (AO1) — 0.5
  - Inference 2: developed in detail — interpretation, not paraphrase (AO1) — 0.5
  - Inference 2: judicious embedded Source B quotation (AO1) — 0.5
  - Perceptiveness of the difference — the Source-A/Source-B pair answers the question focus together (AO1) — 1.0
  - [optional BONUS, Topic 1 Phase 1 diagnostic ONLY] Integrated cross-source synthesis beyond the pair (AO1) — +0.5
- _Note:_ DEVIATION from TTECEA bedrock: NOT a TTECEA paragraph — each paragraph is a paired Source-A-then-Source-B INFERENCE structure (2026-spec inference-led, not summary), AO1 only. 2 paragraphs x 4.0 = 8. structureType='other' because the schema's ttecea-body label would misrepresent this shape.
- _Source:_ `protocols/aqa/language2/modules/protocol-a-assessment.md lines 398-476`
- **⭐ OUTLINE (planning) STRUCTURE — SETTLED (Neil, 2026-07-16, from the AQA mark-scheme Level 4 indicative-standard exemplar). This is what the OUTLINE boxes render + what the planning autofill must emit — DERIVED from the exemplar, not the marking table:**
  Decoded from the exemplar ("The train in Source A reflects significant progress…" → perceptive topic sentence · "…'mail van', 'a dining car', 'five sleeping cars', showing both the advancement…" → evidence AND developed inference in ONE sentence · "This relative luxury is a complete contrast to Source B, where the steam engine is an earlier model…" → discourse marker + topic sentence · then Source B evidence + developed inference in one sentence). Each **source part = TWO written elements**, so **4 outline boxes per paragraph, ×2 paragraphs:**
  1. Source A — **Perceptive Topic Sentence** (the inferential claim beyond the obvious)
  2. Source A — **Evidence + Developed Inference** (embed the quote AND develop what it reveals, in ONE sentence)
  3. Source B — **Discourse Marker + Perceptive Topic Sentence** (comparative pivot + the perceptive difference vs the Source A point)
  4. Source B — **Evidence + Developed Inference**
  - **4 boxes, NOT 6 or 7 (Neil 2026-07-16).** Evidence + developed inference are FUSED into one box because the exemplar writes them as one sentence and "one box = one sentence the student will actually write" — the two half-marks (embedded quote 0.5 + developed detail 0.5) are still scored INSIDE that one box. The topic sentence **IS** the claim (not a separate paragraph-level "aspect" box). The mark scheme's separate **"Perceptiveness of the difference" (1.0)** is a **HOLISTIC quality of the A+B pair, scored not written** — NEVER its own outline box.
  - **Assessment protocol: NO structural edit needed** — its 6 half-mark criteria (lines 423-428) already map 1:1 to the 6 elements; perceptiveness (line 429, 1.0) stays a holistic quality mark. (Optional cosmetics only: relabel criterion 1 "perceptive topic sentence"; reorder the table to claim→quote→develop.)
  - **Planning protocol: edit for autofill** — collapse the separate leading "aspect" into the Source A perceptive topic sentence, then confirm **element-by-element** (4 per paragraph) and emit TWO `@FIELD_COMMIT` per element turn: the element's outline box **and** the paragraph plan box. The fill writes the student's whole message to each marked field, so each of the 4 boxes must be a SEPARATE student turn; the plan box `plan-Q2-para-{i}` appends (accumulates the skeleton), each outline box writes its one element. Byte-exact fieldIds: `outline-body-{i}-{inf1-topic|inf1-evidence|inf2-topic|inf2-evidence}-q2` + `plan-Q2-para-{i}` (i = 1,2). (Today the planning protocol emits only `plan-Q2-para-1|2`; outline boxes render empty until this wiring lands — the reading-Q autofill gap.)
  - _Built:_ `OUTLINE_CRITERIA.inference` (4 rows) + `buildInferenceOutlineSection` (wml-assessment.js), render gate `_isP2Inference`, baked-doc reshape heal in `migrateMissingQOutlines` — shape-set aware, reshapes 6→4 and dedupes dividers (v7.20.149–.151).

#### Q3 — Language Analysis — how does the writer use language to... (one source, given lines)
- **12 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **3**
- **Body paragraph elements:**
  - Topic Sentence — conceptual only (AO2) — 0.5
  - Technique + Evidence + Inference (AO2) — 1.0
  - Close Analysis — perceptive word-level (AO2) — 0.5
  - Effect 1 on Reader — first detailed sentence (AO2) — 0.5
  - Effect 2 on Reader — second detailed sentence (AO2) — 0.5
  - Writer's Purpose (AO2) — 1.0
  - [optional BONUS] Technique interplay analysis (AO2) — +0.5, capped at 4.0
- _Note:_ Same bedrock as P1 Q2/Q3. Content confined to the GIVEN LINES of the named source only. AO2-only, no Context row. 3 paragraphs x 4.0 = 12.
- _Source:_ `protocols/aqa/language2/modules/protocol-a-assessment.md lines 479-522`

#### Q4 — Compare how the writers convey different perspectives on...
- **16 marks** · AOs: AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Names BOTH writers' overall feelings/perspectives on the shared topic (AO3) — 0.25 · Comparative thesis introducing three points of comparison (AO3) — 0.25
- **Body paragraph elements:**
  - Comparative-conceptual Topic Sentence spanning both writers (AO3) — 0.5
  - Source A method + embedded quote + inference (AO3) — 0.5
  - Effect on the reader — Source A (AO3) — 0.5
  - Source B method + embedded quote + inference, opened with a comparative pivot (AO3) — 0.5
  - Effect on the reader — Source B (AO3) — 0.5
  - Perceptive development of the difference/similarity as a PAIR (AO3) — 1.0
  - Word-level analysis of the sharpest quotation (AO3) — 0.5
  - Writers' Purposes compared against the question focus (AO3) — 1.0
- **Conclusion:** Resolves the comparative thesis in fresh words, synthesising the three points (AO3) — 0.25 · Closes on the most significant difference in perspective and WHY it matters (AO3) — 0.25
- _Note:_ This IS the "AQA Lang P2 Q4 fixed 3-aspect TTECEA" deviation flagged in WML CLAUDE.md: comparative-TTECEA with ONE effect sentence per source (not two floating generic ones), AO3 only. Intro(0.5)+3xBP(5 each=15)+Conclusion(0.5)=16. Intro/Conclusion carry NO penalty deductions (a -0.5 would outweigh the 0.5-mark section).
- _Source:_ `protocols/aqa/language2/modules/protocol-a-assessment.md lines 526-596`

#### Q5 — Transactional writing — article, letter, speech or leaflet
- **40 marks** · AOs: AO5, AO6 · structure: **iumvcc** · paragraphs: **0**
- **Body paragraph elements:**
  - Introduction
  - Urgency
  - Methodology
  - Vision
  - Counter-argument
  - Conclusion
- _Note:_ HOLISTIC — transactional/persuasive Section B question, marked as Content & Organisation (AO5,/24) + Technical Accuracy (AO6,/16), fed back per-IUMVCC-section, in the SET FORM (speech/article/letter/leaflet) for the SET audience. 650-word ceiling applies (never a halt). Gold model is ONE labelled-holistic piece, never split per-section marks.
- _Source:_ `protocols/aqa/language2/modules/protocol-a-assessment.md lines 600-666; protocols/shared/language-paper-specs.json aqa.language_p2.Q5`

### literature — AQA Literature Paper 1, Section A

#### Essay — Shakespeare — Starting with this extract, how does...
- **34 marks** · AOs: AO1, AO2, AO3, AO4 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — bold conceptual/contextual claim, never plot (AO1/AO3) — 1.0 · Building sentence(s) — historical/social context backdrop, no craft commentary (AO3) — 0.5 · Building sentence — context → author, how context shapes themes/purpose/choices (AO3) — 0.5 · Three-point Thesis — precise essay roadmap (AO1) — 1.0
- **Body paragraph elements:**
  - Topic Sentence links to thesis and question (AO1) — 1.0
  - Integrated quotes & supporting evidence (AO1) — 0.5
  - Strategic selection of quotes (AO1) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO1/AO2) — 0.5
  - Close Analysis — perceptive, words/sound/structure (AO2) — 1.5
  - Technique interplay analysis (AO2) — 0.5
  - Effect 1 on Reader — first detailed sentence (AO2) — 0.5
  - Effect 2 on Reader — second detailed sentence (AO2) — 0.5
  - Author's Purpose (AO1) — 1.0
  - Context drives author's choices (AO3) — 1.0
- **Conclusion:** Restates Thesis (AO1) — 0.5 · Links to question (AO1) — 0.5 · Evaluates Controlling Concept (AO1) — 1.0 · Links concept to key techniques (AO1/AO2) — 1.0 · Evaluates Author's Purpose (AO1) — 2.0 · Context drives author's central purpose (AO1/AO3) — 1.0 · Evaluates moral/Universal Message (AO1) — 1.0
- _Note:_ TTECEA+C — an extract-anchored single-text essay: Intro(3)+3xBP(8 each=24)+Conclusion(7)=34. This is the SHARED literature-a-assessment protocol reused for shakespeare AND modern_text. AO4 (SPaG) is a 4-mark separate criterion, folded into the 34 total, not itemised per-element here.
- _Source:_ `protocols/aqa/literature/modules/protocol-a-assessment.md lines 210-226, 288-336, 505-599, 770-836; protocols/shared/literature-paper-specs.json aqa.shakespeare`

### literature — AQA Literature Paper 1, Section B

#### Essay — 19th-Century Novel — Starting with this extract, how does...
- **30 marks** · AOs: AO1, AO2, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — bold conceptual/contextual claim, never plot (AO1/AO3) · Building sentence(s) — historical/social context backdrop (AO3) · Building sentence — context → author (AO3) · Three-point Thesis (AO1)
- **Body paragraph elements:**
  - Topic Sentence links to thesis and question (AO1)
  - Integrated quotes & supporting evidence (AO1)
  - Strategic selection of quotes (AO1)
  - Accurate technical terminology (AO2)
  - Analysis links to topic sentence (AO1/AO2)
  - Close Analysis (AO2)
  - Technique interplay analysis (AO2)
  - Effect 1 on Reader (AO2)
  - Effect 2 on Reader (AO2)
  - Author's Purpose (AO1)
  - Context drives author's choices (AO3)
- **Conclusion:** Restates Thesis (AO1) · Links to question (AO1) · Evaluates Controlling Concept (AO1) · Links concept to key techniques (AO1/AO2) · Evaluates Author's Purpose (AO1) · Context drives author's central purpose (AO1/AO3) · Evaluates moral/Universal Message (AO1)
- _Note:_ DEVIATION/KNOWN GAP flagged directly by the source: this paper is 30 marks, AO1-3 only, NO AO4/SPaG (AO4/SPaG belongs to Paper 1 Section A Shakespeare only). literature-paper-specs.json's own _split_note says there is NO dedicated 30-mark protocol split yet — it is currently marked by the 34-shape protocol above, which OVER-MARKS a 30 paper (element worths above sum to 34, not 30). Element list is the same TTECEA+C bedrock minus the AO4 criterion, but the exact re-weighted 30-split has not been authored — tracked as an open protocol gap, not invented here.
- _Source:_ `protocols/shared/literature-paper-specs.json aqa.19th_century (_split_note); protocols/aqa/literature/modules/protocol-a-assessment.md (same shared protocol as Shakespeare)`

### literature — AQA Literature Paper 2, Section A

#### Essay — Modern Text — How does [author] use the character of X to explore...
- **34 marks** · AOs: AO1, AO2, AO3, AO4 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — bold conceptual/contextual claim, never plot (AO1/AO3) — 1.0 · Building sentence(s) — historical/social context backdrop (AO3) — 0.5 · Building sentence — context → author (AO3) — 0.5 · Three-point Thesis (AO1) — 1.0
- **Body paragraph elements:**
  - Topic Sentence links to thesis and question (AO1) — 1.0
  - Integrated quotes & supporting evidence (AO1) — 0.5
  - Strategic selection of quotes (AO1) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO1/AO2) — 0.5
  - Close Analysis (AO2) — 1.5
  - Technique interplay analysis (AO2) — 0.5
  - Effect 1 on Reader (AO2) — 0.5
  - Effect 2 on Reader (AO2) — 0.5
  - Author's Purpose (AO1) — 1.0
  - Context drives author's choices (AO3) — 1.0
- **Conclusion:** Restates Thesis (AO1) — 0.5 · Links to question (AO1) — 0.5 · Evaluates Controlling Concept (AO1) — 1.0 · Links concept to key techniques (AO1/AO2) — 1.0 · Evaluates Author's Purpose (AO1) — 2.0 · Context drives author's central purpose (AO1/AO3) — 1.0 · Evaluates moral/Universal Message (AO1) — 1.0
- _Note:_ No extract — closed-book essay, choice of 2 per set text. Identical shape/worths to Shakespeare (Paper 1 Section A): Intro(3)+3xBP(8 each=24)+Conclusion(7)=34, AO4 SPaG folded into the total.
- _Source:_ `protocols/aqa/literature/modules/protocol-a-assessment.md (same shared protocol as Shakespeare); protocols/shared/literature-paper-specs.json aqa.modern_text`

### poetry — AQA Literature Paper 2, Section B

#### Essay — Poetry Anthology Comparison — Compare how poets present...
- **30 marks** · AOs: AO1, AO2, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Comparative Hook establishing an intriguing concept/contextual factor between BOTH poems (AO1/AO3) — 0.5 · Building sentence comparing pertinent contextual backdrops of BOTH poets (AO3) — 0.5 · Building sentence evaluating how EACH poem's context shapes themes/purpose DIFFERENTLY (AO3) — 0.5 · Three-point Comparative Thesis (AO1) — 1.5
- **Body paragraph elements:**
  - Comparative Topic Sentence — conceptual argument about how BOTH poets' choices convey meaning (AO1) — 0.5
  - Accurate comparative technical terminology in BOTH poems (AO2) — 0.5
  - Strategic comparative Evidence — quotes from BOTH poems (AO1) — 0.5
  - Integrated comparative quotes — smoothly embedded (AO1) — 0.5
  - Comparative Close Analysis of BOTH quotes (AO2) — 1.0
  - Comparative Effects — 2 sentences, how each poet's choice affects the reader DIFFERENTLY (AO2) — 1.0
  - Technique interplay across the compared element (AO2) — 0.5
  - Comparative Author's Purpose — why EACH poet chose their approach (AO1/AO2) — 0.5
  - Comparative Context — how EACH poet's context shapes their choice (AO3) — 1.0
- **Conclusion:** Restated Comparative Thesis in fresh phrasing (AO1) — 1.0 · Synthesised central comparative concept connecting all three body paragraphs (AO1) — 1.0 · Synthesised how BOTH poets' methods serve their comparative purposes (AO1/AO2) — 1.5 · Universal comparative message — broader significance beyond these poems (AO1) — 1.5 · Final evaluative judgement — which approach is more effective and why (AO1) — 1.0
- _Note:_ DEVIATION: 3 body paragraphs are fixed by TOPIC (Body 1=Form, Body 2=Structure, Body 3=Language comparison), not by quotation position, and every element is comparative (both poems, every row). Intro(3)+BP1(7)+BP2(7)+BP3(7)+Conclusion(6)=30. This is the poetry_anthology 30-mark question spec called SIBLING/no-dedicated-split in literature-paper-specs.json — but aqa/poetry DOES have its own fully-authored 1959-line protocol (unlike 19th_century), so this row reflects that real, dedicated protocol, not the fallback.
- _Source:_ `protocols/aqa/poetry/modules/protocol-a-assessment-poetry.md lines 612-642, 847-908, 1596-1629; protocols/shared/literature-paper-specs.json aqa.poetry_anthology`

### unseen — AQA Literature Paper 2, Section C — Q27.1

#### Q27.1 — In [poem title], how does the poet present...
- **24 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Compelling Hook — intriguing concept/thematic question (AO1) — 0.5 · Theme building sentence exploring the poem's central theme/idea (AO1) — 0.5 · Three-point Thesis about the poet's methods (AO1) — 1.0
- **Body paragraph elements:**
  - Concept-led Topic Sentence with clear argumentative claim (AO1) — 1.0
  - Precise subject terminology identifying the technique (AO2) — 0.5
  - Strategic quote selection with smooth integration (AO1/AO2) — 0.5
  - Close Analysis — zooming in on specific words/sounds/punctuation (AO2) — 1.0
  - Effect 1 on Reader — emotional/intellectual impact (AO2) — 0.75
  - Effect 2 on Reader — deeper/alternative dimension (AO2) — 0.75
  - Perceptive insight into the Poet's Purpose (AO1/AO2) — 1.5
- **Conclusion:** Restated Thesis — rephrased in fresh language (AO1) — 1.0 · Controlling Concept — the central big idea explored (AO1) — 1.0 · Author's Purpose — what the poet was ultimately trying to achieve (AO1/AO2) — 1.0 · Universal Message — timeless takeaway (AO1) — 1.0
- _Note:_ AO1/AO2 only — no Context row (single unseen poem, no biographical/social context taught for this Q). Body Paragraph 1 has a student-chosen pathway (Form OR Beginning of the poem) for its technique terminology; BP2=Language, BP3=Ending. Intro(2)+3xBP(6 each=18)+Conclusion(4)=24.
- _Source:_ `protocols/aqa/unseen/modules/protocol-a-assessment-unseen.md lines 200-260, 395-459, 583-627; protocols/shared/literature-paper-specs.json aqa.unseen_poetry_q1`

### unseen — AQA Literature Paper 2, Section C — Q27.2

#### Q27.2 — In both [poem A] and [poem B], the poets present... Compare the methods...
- **8 marks** · AOs: AO2 · structure: **other** · paragraphs: **2**
- **Body paragraph elements:**
  - Clear method identification with evidence (AO2) — 1.0
  - Analysis of effect (AO2) — 1.0
  - Explicit comparison to the other poem (AO2) — 1.0
  - Insight into different approaches (AO2) — 1.0
- _Note:_ DEVIATION — a 2-box comparison layout (4+4=8), NOT the 5-paragraph/TTECEA essay scaffold (matches the literature-paper-specs.json _split_note verbatim). 2 short paragraphs, each independently worth 4, AO2 only.
- _Source:_ `protocols/aqa/unseen/modules/protocol-a-assessment-unseen.md lines 797-836; protocols/shared/literature-paper-specs.json aqa.unseen_poetry_q2`

---

## EDEXCEL

> **Coverage:** Read protocol-a-assessment.md in full (or via targeted grep+read of every marked section) for all 7 Edexcel subjects: 19th_century, language1, language2, modern, poetry, shakespeare, unseen — plus protocols/shared/language-paper-specs.json and protocols/shared/literature-paper-specs.json (edexcel entries) for marks/AO cross-checks. All 21 rows are derived directly from these files; no structure was invented. Two literature-paper subjects (19th_century, shakespeare) use Edexcel's distinctive TWO-PART (a)/(b) question format — not a single full essay — so each contributes 2 rows. language2's Q7b explicitly has NO intro/conclusion (comparative-body-only, protocol states this outright). Three internal inconsistencies were found in the source protocols themselves (not introduced by me) and are flagged in the relevant row's "notes": (1) modern's protocol totals 36.5/37 marks vs the spec's stated 40; (2) poetry's intro section header says "3 Marks Total" but its own breakdown sums to 2; (3) unseen Q12's own breakdown sums to 25 marks but its Final Summary table and the spec both say 20. These are pre-existing protocol-authoring bugs, reported as read rather than silently reconciled — a Neil decision is needed on which total is authoritative before any of these three protocols are next edited. Section B/transactional writing (language2 Q8/Q9) is marked purely holistically against AO5/AO6 level descriptors with NO explicit IUMVCC-labelled sections in the protocol text, despite structureType being set to 'iumvcc' per the universal transactional-writing rule — flagged as a deviation worth checking before assuming labelled sections exist in the live chat output.

### language1 (Paper 1, fiction-based) — Paper 1

#### Q1 — Q1 — one explicit-information statement
- **1 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ Single mark-per-statement retrieval — SKIP per rule (equivalent to AQA P1 Q1 example).
- _Source:_ `protocols/edexcel/language1/modules/protocol-a-assessment.md (Q1 sub-protocol, lines 442-464); language-paper-specs.json edexcel.language_p1`

#### Q2 — Q2 — two implicit-information statements
- **2 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ Two short statements, not paragraphs — SKIP.
- _Source:_ `protocols/edexcel/language1/modules/protocol-a-assessment.md (Q2 sub-protocol, lines 466-487)`

#### Q3 — Q3 — language AND structure analysis in a specified line range
- **6 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence (AO2)
  - Technique + Evidence + Inference (AO2)
  - Close Analysis (AO2)
  - Effect on Reader (AO2)
  - Author's Purpose (AO2)
- _Note:_ DEVIATION: this Q3 TTECEA scaffold is 5-element (single Effect sentence, no second Effect) — unlike language2's 6-element paragraphs. 3 marks/paragraph, 2 paragraphs = 6. AO3/Context row absent (Q3 = AO2 only).
- _Source:_ `protocols/edexcel/language1/modules/protocol-a-assessment.md (Q3 sub-protocol + STRENGTHS breakdown, lines 489-791)`

#### Q4 — Q4 — evaluation ("to what extent...")
- **15 marks** · AOs: AO4 · structure: **ttecea-body** · paragraphs: **4**
- **Body paragraph elements:**
  - Topic Sentence linking to question keywords (AO4)
  - Technique + Evidence + Inference, integrated quotes (AO4)
  - Accurate technical terminology (AO4)
  - Analysis links to topic sentence (AO4)
  - Close Analysis (AO4)
  - Effect on Reader 1 (AO4)
  - Effect on Reader 2 (AO4, paragraphs 2-4 only)
  - Author's Purpose (AO4)
- _Note:_ AO4 evaluative TTECEA — marking is position-agnostic (agree/disagree irrelevant, only execution quality counts, stated explicitly). Paragraph 1 = 3 marks (7 condensed elements, single Effect); Paragraphs 2-4 = 4 marks each (8 elements, dual Effect). Context/AO3 row absent.
- _Source:_ `protocols/edexcel/language1/modules/protocol-a-assessment.md (Q4 sub-protocol, lines 793-1104)`

#### Q5 — Q5 — imaginative writing (narrative/descriptive choice)
- **40 marks** · AOs: AO5, AO6 · structure: **scene-story-spine** · paragraphs: **0**
- _Note:_ Section B creative writing (narrative or descriptive choice). Min 650 words for Redraft/Exam Practice (hard-halt); Diagnostic accepts any length. Marked holistically: Content & Organisation AO5=24, Technical Accuracy AO6=16. Protocol does not TTECEA-mark it — whole-piece narrative/descriptive structure, story-spine per universal rule.
- _Source:_ `protocols/edexcel/language1/modules/protocol-a-assessment.md (Q5 sub-protocol, lines 1105-1259); language-paper-specs.json edexcel.language_p1`

### language2 (Paper 2, anthology + transactional) — Paper 2

#### Q1 — Q1 — two explicit facts, Source A
- **2 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ Two simple sentences, not paragraphs — SKIP.
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Q1 sub-protocol, lines 220-267)`

#### Q2 — Q2 — two explicit facts, Source A
- **2 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ SKIP — same shape as Q1.
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Q2 sub-protocol, lines 271-318)`

#### Q3 — Q3 — language & structure analysis, Text 1 (Source A)
- **15 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **3**
- **Body paragraph elements:**
  - Topic Sentence establishing core concept (AO2)
  - Technique identified with embedded evidence (AO2)
  - Close Analysis of specific words/connotations (AO2)
  - Effect on Reader 1 (AO2)
  - Effect on Reader 2 (AO2)
  - Author's Purpose with tentative language (AO2)
- _Note:_ 6-element (dual-Effect) TTECEA — this is the CANONICAL 6-element paragraph reused for Q3/Q6/Q7a/Q7b in this paper. 5 marks per paragraph x3 = 15.
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Q3 sub-protocol, lines 322-483); language-paper-specs.json edexcel.language_p2`

#### Q4 — Q4 — one explicit fact, Text 2 (Source B)
- **1 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ SKIP — single-point retrieval.
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Q4 sub-protocol, lines 487-535)`

#### Q5 — Q5 — one explicit fact, Text 2 (Source B)
- **1 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ SKIP — single-point retrieval.
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Q5 sub-protocol, lines 537-584)`

#### Q6 — Q6 — evaluation, Text 2 (Source B)
- **15 marks** · AOs: AO4 · structure: **ttecea-body** · paragraphs: **3**
- **Body paragraph elements:**
  - Topic Sentence establishing evaluative judgement (AO4)
  - Technique identified with embedded evidence (AO4)
  - Close Analysis of specific words/connotations (AO4)
  - Effect on Reader 1 (AO4)
  - Effect on Reader 2 (AO4)
  - Author's Purpose with evaluative commentary (AO4)
- _Note:_ Protocol explicitly notes: 'Question 6 assesses AO4 but we still use TTECEA paragraph structure' — same 6-element canonical shape as Q3, AO4-stamped, evaluative framing not agree/disagree-graded.
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Q6 sub-protocol, lines 587-750)`

#### Q7a — Q7a — similarities across both sources
- **6 marks** · AOs: AO1 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence establishing core concept (AO1)
  - Embedded evidence with an inference (AO1)
  - Close Analysis of specific words/connotations (AO1)
  - Effect on Reader 1 (AO1)
  - Effect on Reader 2 (AO1)
  - Author's Purpose with tentative language (AO1)
- _Note:_ One TTECEA paragraph on Source A, one on Source B (not comparative within-paragraph, unlike Q7b). 3 marks/paragraph x2 = 6.
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Q7a sub-protocol, lines 754-921)`

#### Q7b — Q7b — compare how writers present ideas/perspectives
- **14 marks** · AOs: AO3 · structure: **ttecea-body** · paragraphs: **3**
- **Body paragraph elements:**
  - Comparative Topic Sentence (AO3)
  - Techniques + embedded evidence from BOTH sources (AO3)
  - Comparative Close Analysis, both sources (AO3)
  - Comparative Effect on Reader 1 (AO3)
  - Comparative Effect on Reader 2 (AO3)
  - Comparative Author's Purpose (AO3)
- _Note:_ Protocol explicit: 'No introduction or conclusion required — just three comparative TTECEA paragraphs'; any intro/conclusion content submitted earns no marks. Paragraphs 1-2 = 4.5 marks each, paragraph 3 = 5 marks (14 total). CB1-CB4 comparison-specific penalty codes apply.
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Q7b sub-protocol, lines 924-1165)`

#### Q8/Q9 (Section B) — Section B — transactional writing (article/letter/guide/speech choice)
- **40 marks** · AOs: AO5, AO6 · structure: **iumvcc** · paragraphs: **0**
- _Note:_ DEVIATION FROM UNIVERSAL RULE: the protocol does NOT mark this with explicit IUMVCC-labelled sections — it is scored purely holistically against AO5 (Content & Organisation, 5 Levels) and AO6 (Technical Accuracy, 5 Levels), no per-section breakdown. structureType set to 'iumvcc' per universal transactional-writing rule, but the actual protocol content should be checked before assuming labelled I/U/M/V/C/C sections exist in student-facing output. Min 650 words gate (hard-halt Redraft/Exam Practice; word-count penalty formula for Diagnostic).
- _Source:_ `protocols/edexcel/language2/modules/protocol-a-assessment.md (Section B assessment, lines 1168-1387); language-paper-specs.json edexcel.language_p2`

### 19th_century (Literature Paper 1 Section A — two-part) — Paper 1

#### Q1a (extract) — Q1(a) — extract-based close analysis
- **20 marks** · AOs: AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook (AO2) · Building Sentence establishing writer's stylistic approach (AO2) · Thesis (AO2)
- **Body paragraph elements:**
  - Topic Sentence (AO2)
  - Technique + Evidence + Inference (AO2)
  - Close Analysis (AO2)
  - Effect on Reader 1 (AO2)
  - Effect on Reader 2 (AO2)
  - Author's Purpose (AO2)
- **Conclusion:** Restated Thesis (AO2) · Controlling Concept (AO2) · How Controlling Concept drives major stylistic/structural features (AO2) · Author's Purpose (AO2)
- _Note:_ Intro 2 + Body 5x3=15 + Conclusion 3 = 20. AO2 only — no Context row (matches spec: 19th_century AOs = AO1+AO2, no AO3). Conclusion 4th slot is 'concept drives features', not the universal 'Universal Message' — that message slot appears only in the whole-text (b) conclusion instead.
- _Source:_ `protocols/edexcel/19th_century/modules/protocol-a-assessment.md (lines 362-1088); literature-paper-specs.json edexcel.19th_century`

#### Q1b (whole-text) — Q1(b) — whole-text critical engagement
- **20 marks** · AOs: AO1 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook (AO1) · Building Sentence evaluating how author's purpose shapes themes/textual choices (AO1) · Thesis (AO1)
- **Body paragraph elements:**
  - Topic Sentence (AO1)
  - Evidence & Quote Integration (AO1)
  - Critical Interpretation — detailed perceptive interpretation (AO1)
  - Critical Interpretation — evaluation of alternative interpretations (AO1)
  - Effect on Reader 1 (AO1)
  - Effect on Reader 2 (AO1)
  - Author's Purpose — 3 sub-elements: identification, sophisticated analysis, connection to interpretative depth (AO1)
- **Conclusion:** Restated Thesis (AO1) · Author's Central Purpose (AO1) · Contextual forces shaping controlling concept (AO3) · Universal Message (AO1)
- _Note:_ Intro 2 + Body 5x3=15 + Conclusion 3 = 20. All-AO1 body (no separate Context mark per protocol note: 'Context may inform interpretation but earns no separate marks in 19th Century Novel assessment') EXCEPT the conclusion, which does carry one explicit AO3 Context row — a genuine intra-question inconsistency in the protocol, reported as read.
- _Source:_ `protocols/edexcel/19th_century/modules/protocol-a-assessment.md (lines 786-1138, incl. lines 1094-1138 conclusion read directly, not inferred)`

### modern (Literature Paper 1 Section B — post-1914 text) — Paper 1

#### modern_essay — Extended response on post-1914 modern text
- **37 marks** · AOs: AO1, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook (AO1/AO3) · Building Sentence — contextual backdrop (AO3) · Building Sentence — how context shapes themes/purpose/choices (AO3) · Thesis (AO1)
- **Body paragraph elements:**
  - Topic Sentence (AO1)
  - Evidence & Quote Integration (AO1)
  - Critical Interpretation + Alternatives (AO1)
  - Effect on Reader 1 (AO1)
  - Effect on Reader 2 (AO1)
  - Author's Purpose, driven by contextual factors (AO1/AO3)
  - Context — drives choices/themes + detailed historical/social analysis (AO3)
- **Conclusion:** Restated Thesis (AO1) · Links to question (AO1) · Controlling Concept (AO1) · Contextual forces shaping controlling concept (AO3) · Author's Purpose (AO1) · Context drives author's central purpose (AO3) · Universal Message (AO1)
- _Note:_ FLAGGED DISCREPANCY: protocol totals Intro 4 + Body 9x3=27 + Conclusion 5.5 = 36.5 (rounds to 37 marks used here), but the spec JSON states this paper is worth 40 marks (AO1 16 + AO3 16 + AO4/SPaG 8) and explicitly flags 'protocol's intro/body/conclusion split needs reconciling to 40'. AO4 (SPaG, 8 marks) is NOT represented in this element breakdown — it is marked separately, outside the TTECEA scaffold. Context is heavily weighted (2.5/9 marks = 28% per body paragraph) — highest AO3 weighting of any Edexcel subject read.
- _Source:_ `protocols/edexcel/modern/modules/protocol-a-assessment.md (lines 282-891); literature-paper-specs.json edexcel.modern_text`

### poetry (Literature Paper 2 Section B Part 1 — anthology comparison) — Paper 2

#### poetry_comparison_essay — Compare the ways... (named anthology poem vs student-chosen second poem)
- **20 marks** · AOs: AO2, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Building Sentence — how EACH poem's context shapes themes/purpose differently (AO3) · Comparative Thesis (AO2/AO3)
- **Body paragraph elements:**
  - Comparative Topic Sentence (AO2)
  - Comparative technical terminology, both poems (AO2)
  - Comparative Evidence — both poems' quotations embedded (AO2)
  - Comparative Close Analysis, both quotes (AO2)
  - Comparative Effects — 2 sentences, how each poet's technique affects reader differently (AO2)
  - Comparative Author's Purpose — why EACH poet made this choice (AO2)
  - Comparative Context — how EACH poet's context shapes the choice (AO3)
- **Conclusion:** Restated Comparative Thesis (AO2/AO3) · Synthesised central comparative concept (AO2) · Universal comparative message (AO2/AO3)
- _Note:_ 3 body paragraphs are dedicated to Form / Structure / Language comparison respectively (not generic — each paragraph's terminology bank is pathway-specific). Intro header says '3 Marks Total' but its own breakdown sums to 2 (1.0+1.0) — an internal labelling bug; using the breakdown total, 2+5x3+3=20 matches the spec's 20-mark total exactly. No Hook element in the intro (only Context-building sentence + Thesis) — deviates from universal 3-part intro. Spec JSON labels this AO1+AO3 but the protocol stamps body/intro elements AO2/AO3 throughout — a spec-vs-protocol AO-label conflict, reported as read from the protocol (ground truth for student-facing marking).
- _Source:_ `protocols/edexcel/poetry/modules/protocol-a-assessment.md (lines 532-1696); literature-paper-specs.json edexcel.poetry_anthology`

### shakespeare (Literature Paper 1 Section A — two-part) — Paper 1

#### Qa (extract) — (a) — extract-based close analysis
- **20 marks** · AOs: AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook (AO2) · Building Sentence establishing writer's stylistic approach (AO2) · Thesis (AO2)
- **Body paragraph elements:**
  - Topic Sentence (AO2)
  - Technique + Evidence + Inference (AO2)
  - Close Analysis (AO2)
  - Effect on Reader 1 (AO2)
  - Effect on Reader 2 (AO2)
  - Author's Purpose (AO2)
- **Conclusion:** Restated Thesis (AO2) · Controlling Concept (AO2) · How Controlling Concept drives major stylistic/structural features (AO2) · Author's Purpose (AO2)
- _Note:_ Structurally identical scaffold to 19th_century Q1a (same 2+15+3=20 shape, same AO2-only element set). Intro 2 + Body 5x3=15 + Conclusion 3 = 20.
- _Source:_ `protocols/edexcel/shakespeare/modules/protocol-a-assessment.md (lines 397-1088); literature-paper-specs.json edexcel.shakespeare`

#### Qb (whole-play) — (b) — whole-play essay
- **20 marks** · AOs: AO1, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook (AO1) · Building Sentence evaluating how context shapes themes/purpose/choices (AO3) · Thesis (AO1)
- **Body paragraph elements:**
  - Topic Sentence (AO1)
  - Evidence & Quote Integration (AO1)
  - Critical Interpretation — detailed perceptive interpretation + evaluation of alternatives (AO1)
  - Effect on Reader 1 (AO1)
  - Effect on Reader 2 (AO1)
  - Author's Purpose (AO1)
  - Context — drives author's choices/themes + detailed historical/social analysis (AO3)
- **Conclusion:** Restated Thesis (AO1) · Author's Central Purpose (AO1) · Contextual forces shaping controlling concept (AO3) · Universal Message (AO1)
- _Note:_ Unlike 19th_century Q1b, this whole-play question DOES carry an explicit Context/AO3 row in the body paragraph (matches spec: shakespeare part-b = AO1 15 + AO3 5). Same conclusion shape (with Universal Message + Context row) as 19th_century Q1b.
- _Source:_ `protocols/edexcel/shakespeare/modules/protocol-a-assessment.md (lines 439-1128); literature-paper-specs.json edexcel.shakespeare (aos AO1+AO2+AO3, part-b=AO1 15 + AO3 5)`

### unseen (Literature Paper 2 Section B Part 2 — unseen poetry) — Paper 2

#### Q12 — Q12 — comparative response on two unseen poems
- **20 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Comparative Hook establishing shared theme + signalling comparison (AO1) · Comparative Theme sentence — how BOTH poets approach the theme differently (AO1) · Comparative Thesis, both poems (AO1)
- **Body paragraph elements:**
  - Comparative Topic Sentence covering BOTH poems (AO1)
  - Technique identification, BOTH poems, precise terminology (AO2)
  - Evidence from BOTH poems, smoothly integrated (AO1/AO2)
  - Comparative Close Analysis of BOTH quotes (AO2)
  - Comparative Effects on reader (AO2)
  - Comparative insight into both poets' purposes (AO1/AO2)
  - Sustained comparative language + balanced coverage (AO1/AO2)
- **Conclusion:** Restated comparative thesis (AO1) · Controlling comparative concept — what the comparison reveals (AO1) · Comparative poets' purposes (AO1/AO2) · Universal comparative message (AO1)
- _Note:_ FLAGGED DISCREPANCY: this question's own mark breakdown sums to 3 (intro) + 6+6+6 (body) + 4 (conclusion) = 25, but (a) the section header calls it '(20 marks)' and (b) its own Final Summary table lists Intro=1/Body=6 each/Conclusion=1 (totalling 20) — internally inconsistent with the breakdown used mid-protocol, and the spec JSON also states 20 marks total (AO1 8 + AO2 12). Used the mid-protocol per-section breakdown (3/6/6/6/4=25) as it is the actual scored criteria; the discrepancy vs the 20-mark spec/summary needs a Neil-facing fix, not a silent pick. No AO3/Context row — protocol explicitly states unseen poetry does not assess AO3.
- _Source:_ `protocols/edexcel/unseen/modules/protocol-a-assessment.md — Protocol A.2 'Q12 Comparative Assessment Workflow' (lines 821-1036, mandated for ALL Edexcel unseen assessment per line 23); literature-paper-specs.json edexcel.unseen`

---

## EDEXCEL IGCSE

> **Coverage:** Read: protocols/shared/language-paper-specs.json and literature-paper-specs.json (edexcel-igcse keys) for tariffs/AOs; every protocol-a-assessment.md under edexcel-igcse/{heritage,modern,modern-prose,literature}/modules/, edexcel-igcse/language1/modules/protocol-a-assessment.md, edexcel-igcse/language2/modules/assessment-section-a.md + assessment-section-b.md, and edexcel-igcse/language2/steps/b2-creative.md (story-spine planning beats for Section B). Confirmed via `find` that no poetry-specific files (unseen or anthology-comparison) exist anywhere under protocols/edexcel-igcse/ — the literature-paper-specs.json entries `anthology_poetry` and `unseen_poetry` (4ET1/01 Sections A & B) have NO built protocol in this board's directory tree; excluded as a genuine build gap rather than invented. Two spec-JSON vs live-protocol numeric mismatches were found and flagged inline rather than silently resolved: (1) language_p1 Q2/Q3 marks+AOs differ between language-paper-specs.json and the live protocol file (protocol used as canonical, per WML CLAUDE.md); (2) language_p1 Q5's live protocol lists body-paragraph mark-scheme elements that sum to 5.0 but labels the paragraph '6 Marks each', a 0.5-mark/paragraph internal arithmetic gap in the shipped protocol text itself. The literature-paper-specs.json 'literature' catch-all key's AO3 listing also doesn't match its own protocol file's actual mark-scheme content (AO1/AO2/AO4 only; one stray dialogue-text 'AO3' mention looks like a typo).

### heritage — Literature Paper 2 (4ET1/02) — Literary Heritage essay (whole-text, open book)

#### Essay — Literary Heritage essay (Shakespeare/heritage text)
- **30 marks** · AOs: AO1, AO2, AO4 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Compelling hook establishing an intriguing concept/contextual factor (AO1/AO4) — 1.0 · Building sentence(s) establishing pertinent contextual backdrop (AO4) — 0.5 · Building sentence(s) evaluating how context shapes themes/purpose/choices (AO4) — 0.5 · Clear, precise three-point thesis with powerful argument (AO1) — 1.0
- **Body paragraph elements:**
  - Topic sentence links to thesis and question (AO1) — 1.0
  - Integrated quotes & supporting evidence (AO1) — 0.5
  - Strategic selection of quotes (AO1) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO1/AO2) — 0.5
  - Perceptive close analysis of words/sound/structure (AO2) — 1.0
  - Analysis of technique interplay (AO2) — 0.5
  - First detailed sentence on reader effects (AO2) — 0.75
  - Second detailed sentence on reader effects (AO2) — 0.75
  - Evaluates author's purpose (AO1) — 1.0
  - Context drives author's choices (AO4) — 0.5
- **Conclusion:** Restates thesis (AO1) — 0.5 · Links to question (AO1) — 0.5 · Evaluates controlling concept (AO1) — 1.0 · Links concept to key techniques (AO1/AO2) — 1.0 · Evaluates author's purpose (AO1) — 1.5 · Context drives author's central purpose (AO1/AO4) — 1.0 · Evaluates moral/message (AO1) — 0.5
- _Note:_ TTECEA+C bedrock expanded to 11 granular body elements (adds a separate 'strategic selection of quotes' + splits effects into two scored sentences). Intro(3)+Body(7×3=21)+Conclusion(6)=30 verified against literature-paper-specs.json edexcel-igcse.heritage split.
- _Source:_ `protocols/edexcel-igcse/heritage/modules/protocol-a-assessment.md (lines 305-818); protocols/shared/literature-paper-specs.json (edexcel-igcse.heritage)`

### modern — Literature Paper 2 (4ET1/02) — Modern Drama essay (whole-text, open book)

#### Essay — Modern drama/text essay
- **30 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Compelling hook establishing an intriguing concept (AO1) — 0.5 · Building sentence(s) establishing the writer's approach to the central concern/question (AO1) — 0.5 · Building sentence(s) evaluating a major stylistic feature in relation to the question (AO2) — 1.0 · Clear, precise three-point thesis with powerful argument (AO1) — 1.0
- **Body paragraph elements:**
  - Topic sentence links to thesis and question (AO1) — 1.0
  - Integrated quotes & supporting evidence (AO1) — 0.5
  - Strategic selection of quotes (AO1) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO1/AO2) — 0.5
  - Perceptive close analysis of words/sound/structure (AO2) — 1.0
  - Analysis of technique interplay (AO2) — 0.5
  - First detailed sentence on reader effects (AO2) — 0.75
  - Second detailed sentence on reader effects (AO2) — 0.75
  - Evaluates author's purpose (AO1) — 1.0
- **Conclusion:** Restates thesis (AO1) — 0.5 · Links to question (AO1) — 0.5 · Evaluates controlling concept (AO1) — 1.0 · Links concept to key techniques (AO1/AO2) — 1.0 · Evaluates author's purpose (AO1) — 1.5 · Understanding of how context shapes author's central purpose (AO1) — 1.0 · Evaluates moral/message (AO1) — 0.5
- _Note:_ Same TTECEA+C skeleton as heritage minus the AO4-context row (no AO4 in this paper — verified: no context/AO4 mentions in file). Intro(3)+Body(7×3=21)+Conclusion(6)=30.
- _Source:_ `protocols/edexcel-igcse/modern/modules/protocol-a-assessment.md (lines 384-890); protocols/shared/literature-paper-specs.json (edexcel-igcse.modern)`

### modern-prose — Literature Paper 1 (4ET1/01) Section C — Modern Prose essay (whole-text, closed book)

#### Essay — Modern prose essay
- **40 marks** · AOs: AO1, AO4 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Compelling hook establishing an intriguing concept/contextual factor (AO1/AO4) — 1.25 · Building sentence(s) establishing pertinent historical/social context (AO4) — 1.25 · Building sentence(s) evaluating how context shapes themes/purpose/choices (AO4) — 1.25 · Clear, precise three-point thesis with powerful argument (AO1) — 1.25
- **Body paragraph elements:**
  - Concept-led topic sentence (AO1) — 1.5
  - Accurate technical terminology identifying technique (AO1) — 1.0
  - Strategic evidence — quote supporting concept, well-integrated (AO1) — 1.0
  - Integrated quote — smoothly embedded grammatically (AO1) — 0.5
  - Close analysis — word-level examination of how technique creates meaning (AO1) — 1.5
  - Effects on reader — 2 sentences, emotional AND intellectual impact (AO1) — 1.5
  - Author's purpose — WHY these choices were made (AO1/AO4) — 1.0
  - AO4 Context — historical/social/cultural context with CAUSAL language driving the concept (AO4) — 2.0
- **Conclusion:** Restated thesis — synthesised, not verbatim (AO1) — 1.25 · Controlling concept connecting all three body arguments (AO1) — 1.25 · AO4 context — how the text's historical moment gives it enduring significance (AO4) — 1.25 · Universal message transcending specific time/place (AO1) — 1.25
- _Note:_ No AO2 assessed (protocol states explicitly: 'AO2 isn't separately assessed'); AO4 = Context, not SPaG. Intro(5)+Body(10×3=30)+Conclusion(5)=40. Single dedicated AO4-context row per body paragraph (2.0 marks, largest single element) rather than the smaller 0.5 context row used elsewhere.
- _Source:_ `protocols/edexcel-igcse/modern-prose/modules/protocol-a-assessment.md (lines 77-735); protocols/shared/literature-paper-specs.json (edexcel-igcse.modern-prose)`

### literature — Generic literature essay (catch-all fallback — any IGCSE Spec A text type without a dedicated protocol)

#### Essay — Generic literature essay
- **30 marks** · AOs: AO1, AO2, AO4 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Compelling hook establishing an intriguing concept/contextual factor (AO1/AO4) — 1.0 · Building sentence(s) establishing pertinent contextual backdrop (AO4) — 0.5 · Building sentence(s) evaluating how context shapes themes/purpose/choices (AO4) — 0.5 · Clear, precise three-point thesis with powerful argument (AO1) — 1.0
- **Body paragraph elements:**
  - Topic sentence links to thesis and question (AO1) — 1.0
  - Integrated quotes & supporting evidence (AO1) — 0.5
  - Strategic selection of quotes (AO1) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO1/AO2) — 0.5
  - Perceptive close analysis of words/sound/structure (AO2) — 1.0
  - Analysis of technique interplay (AO2) — 0.5
  - First detailed sentence on reader effects (AO2) — 0.75
  - Second detailed sentence on reader effects (AO2) — 0.75
  - Evaluates author's purpose (AO1) — 1.0
  - Context drives author's choices (AO4) — 0.5
- **Conclusion:** Restates thesis (AO1) — 0.5 · Links to question (AO1) — 0.5 · Evaluates controlling concept (AO1) — 1.0 · Links concept to key techniques (AO1/AO2) — 1.0 · Evaluates author's purpose (AO1) — 1.5 · Context drives author's central purpose (AO1/AO4) — 1.0 · Evaluates moral/message (AO1) — 0.5
- _Note:_ Structurally byte-identical to heritage's protocol (same 11 body / 4 intro / 7 conclusion elements, lines 310-993). literature-paper-specs.json lists AO3 in this catch-all's aos array, but the only AO3 mention in the actual protocol file (line 993) reads as a stray typo in passing dialogue text ('tighten AO2 and AO3') — the worked mark scheme throughout uses AO1/AO2/AO4 only, so AO3 is not really assessed here. anthology_poetry and unseen_poetry keys also exist in literature-paper-specs.json (4ET1/01 Sections A & B) but have NO corresponding protocol file anywhere under this board's directory — those two question types are unbuilt/ungapped; not included as a row here since no source exists to derive a structure from.
- _Source:_ `protocols/edexcel-igcse/literature/modules/protocol-a-assessment.md (lines 310-993); protocols/shared/literature-paper-specs.json (edexcel-igcse.literature)`

### language1 — Language Paper 1 (4EA1/01)

#### Q1 — Q1 — Two retrieval selections
- **2 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ Pure retrieval: 1 mark per valid selection from specified lines. No planning/structure taught.
- _Source:_ `protocols/edexcel-igcse/language1/modules/protocol-a-assessment.md (lines 398-418)`

#### Q2 — Q2 — Description in own words
- **4 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ Short-retrieval in own words, no quotes; marked by counting valid distinct points. No TTECEA/planning. ⚠️ HISTORY (corrected 2026-08-29): this row previously recorded **3 marks**, siding with the live protocol over the spec JSON because the protocol "is the definitive marking document" — **that verdict was WRONG.** The board's own papers (June 2024 QP: "Total for Question 2 = 4 marks"; June 2022 MS: "up to a maximum of four marks") say 4. Both wrong-and-right tariff sets sum to 45, so the totals check could not catch it — root CLAUDE.md §PARALLEL-LANES 2a documents this exact case. The protocol was fixed at v7.20.528 and the tariff is now mechanically gated (`protocols/_marks/edexcel-igcse__language_p1.json` + `bin/tariff-gate.js`). **A protocol outranks OUR other files; the mark scheme outranks the protocol.**
- _Source:_ `protocols/edexcel-igcse/language1/modules/protocol-a-assessment.md (lines 420-440); protocols/shared/language-paper-specs.json (edexcel-igcse.language_p1.Q2, conflicts)`

#### Q3 — Q3 — Thoughts/feelings with quotes
- **5 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ Mark-per-valid-point retrieval/interpretation with brief quotes — not TTECEA, no planning taught. ⚠️ HISTORY (corrected 2026-08-29): this row previously recorded **6 marks**, and read the protocol's own "/5" prose as a typo — it was the TRUE tariff leaking through. June 2024 QP: "Total for Question 3 = 5 marks"; both the June 2024 and June 2022 mark schemes end the Q3 indicative content "(5)". AO1 only (the JSON's old [AO1, AO2] was the drift, since fixed). Protocol fixed at v7.20.528; gated as above.
- _Source:_ `protocols/edexcel-igcse/language1/modules/protocol-a-assessment.md (lines 442-491); protocols/shared/language-paper-specs.json (edexcel-igcse.language_p1.Q3, conflicts)`

#### Q4 — Q4 — Language and structure analysis
- **12 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **3**
- **Body paragraph elements:**
  - Topic sentence that perceptively introduces the concept (AO2) — 0.5
  - Judicious use of language and/or structure technical terminology (AO2) — 0.5
  - Judicious, integrated quotes (AO2) — 0.5
  - Perceptive inferences (AO2) — 0.5
  - Detailed, perceptive close analysis of language and/or structure techniques (AO2) — 0.5
  - First detailed, perceptive sentence evaluating effects on the reader (AO2) — 0.5
  - Second detailed, perceptive sentence evaluating effects on the reader (AO2) — 0.5
  - Perceptive evaluation of the author's purpose for creating these effects (AO2) — 0.5
- _Note:_ Body-only (reading question, no intro/conclusion — protocol explicitly forbids intro/conclusion content for Q4). Single AO (AO2) marks every element; no Context row (no AO3/AO4 in this question). 8 elements × 0.5 = 4.0 marks/paragraph × 3 paragraphs = 12. 'One paragraph for every 4 marks' rule confirmed (line 1919).
- _Source:_ `protocols/edexcel-igcse/language1/modules/protocol-a-assessment.md (lines 495-800)`

#### Q5 — Q5 — Comparative essay (Text A vs Text B)
- **22 marks** · AOs: AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — an engaging question or provocative statement about the concept (AO3) — 1.0 · Comparative thesis statement outlining the three main ideas of the essay, one per body paragraph (AO3) — 1.0
- **Body paragraph elements:**
  - Comparative topic sentence that takes a position and frames a like-for-like lens (AO3) — 0.5
  - Judicious, integrated evidence from BOTH texts, not bolted-on (AO3) — 0.5
  - Developed comparative analysis of methods → effects, each text addressed within the same move (AO3) — 1.0
  - Interplay between methods — how two techniques combine to create an effect (AO3) — 0.5
  - Reader impact 1 — specific, text-tethered effect (AO3) — 0.5
  - Reader impact 2 — a second, distinct effect (AO3) — 0.5
  - Comparative evaluation of writers' ideas/purposes — which is more effective and why (AO3) — 1.0
  - Cohesive flow with comparative discourse markers, e.g. whereas/similarly/in contrast (AO3) — 0.5
- **Conclusion:** Restated thesis — sophisticated rephrasing of introduction thesis (AO3) — 1.0 · Final perceptive evaluation of the authors' purposes — the ultimate moral/message each text carries (AO3) — 1.0
- _Note:_ This is the SAME TTECEA rows adapted for comparison (per feedback_comparative_body_is_ttecea_helper_text_only memory), not a different skeleton, with the two reader-effect rows generalised to 'reader impact 1/2' rather than one-per-source. ARITHMETIC — RESOLVED (commit 1a04d97, 2026-08-29): the 8 body elements summed to 5.0 against a 6-mark paragraph because the list was copied from AQA Lang P2 Q4 (whose comparative paragraph really is 5.0) and never re-weighted. The two criteria that ARE the AO3 skill (developed comparative analysis; comparative evaluation of writers' purposes) were re-cut 1.0 → 1.5, so the elements now sum to 6.0 and Q5 reconciles 2 + 18 + 2 = 22. Full marks are reachable.
- _Source:_ `protocols/edexcel-igcse/language1/modules/protocol-a-assessment.md (lines 868-1470, esp. 1026-1115 body-paragraph mark breakdown)`

#### Q6 — Q6 / Section B — Transactional writing (choice of 2: review, article, speech, letter)
- **45 marks** · AOs: AO4, AO5 · structure: **iumvcc** · paragraphs: **6**
- **Body paragraph elements:**
  - Introduction — hook + thesis
  - Urgency — why this matters NOW (metaphor, extended development, evidence)
  - Methodology — HOW to fix the problem (clear solution, specific steps)
  - Vision — what the future looks like if the methodology is implemented (vivid imagery, sensory detail)
  - Counter-argument — anticipate and refute objections
  - Conclusion — call to action
- _Note:_ AO4 = Content/Organisation (27 marks) + AO5 = Technical Accuracy (18 marks) = 45. Marked holistically per IUMVCC section via Level-based bands (AO4 Levels 1-5, AO5 Levels 1-5), not itemised sub-marks per element the way TTECEA papers are. 6 paragraphs of ~110-120 words each, 700+ words minimum.
- _Source:_ `protocols/edexcel-igcse/language1/modules/protocol-a-assessment.md (lines 1422-1921); protocols/shared/language-paper-specs.json (edexcel-igcse.language_p1.Q6)`

### language2 — Language Paper 2 (4EA1/02) — Section A: Reading (Anthology Part 2 — poetry OR prose)

#### Q1 — Q1 — Single anthology text analysis (poetry OR prose)
- **30 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Compelling hook establishing an intriguing concept/thematic question (AO1) — 1.0 · Building sentence(s) establishing pertinent authorial techniques (form, structure, language) (AO2) — 0.5 · Building sentence(s) evaluating how techniques create meaning/effects (AO1/AO2) — 0.5 · Clear, precise three-point thesis about the author's methods (AO1) — 1.0
- **Body paragraph elements:**
  - Topic sentence links to thesis and question (AO1) — 0.5
  - Integrated quotes & supporting evidence (AO1) — 0.5
  - Strategic selection of quotes (AO1) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO1/AO2) — 0.5
  - Perceptive close analysis of words/sound/structure (AO2) — 1.0
  - Analysis of technique interplay (AO2) — 0.5
  - First detailed sentence on reader effects (AO2) — 1.0
  - Second detailed sentence on reader effects (AO2) — 1.0
  - Evaluates author's purpose (AO1) — 1.0
- **Conclusion:** Restates thesis (AO1) — 0.5 · Links to question (AO1) — 0.5 · Evaluates controlling concept (AO1) — 1.0 · Links concept to key techniques (AO1/AO2) — 1.5 · Evaluates author's purpose (AO1) — 1.5 · Evaluates moral/message (AO1) — 1.0
- _Note:_ File explicitly states 'NO AO3 (context) is assessed in the extract section' — no context row anywhere. Effect-on-reader rows are worth 1.0 each here (vs 0.75 in the Literature papers) and conclusion drops the AO4-context row to 6 elements (vs 7 for heritage) — Intro(3)+Body(7×3=21)+Conclusion(6)=30 still holds.
- _Source:_ `protocols/edexcel-igcse/language2/modules/assessment-section-a.md (lines 104-503)`

### language2 — Language Paper 2 (4EA1/02) — Section B: Imaginative Writing (choice of 3: personal, title-based, image-prompted)

#### Q2/Q3/Q4 — Section B — Imaginative/creative writing (student picks one of Q2, Q3, or Q4)
- **30 marks** · AOs: AO4, AO5 · structure: **scene-story-spine** · paragraphs: **6**
- **Body paragraph elements:**
  - At first... — the ordinary situation for the main character (opening)
  - And then... — what disrupts this ordinary situation (inciting event)
  - Until... — the turning point/climax, character's biggest challenge
  - And because of this... — the immediate consequence of the turning point
  - And because of this... — the next consequence or realisation that follows
  - Until finally... — how the story resolves; the character's new situation
- _Note:_ AO4 = Communication/form/tone/register/audience (18 marks) + AO5 = Technical accuracy/vocabulary/sentence structures (12 marks) = 30. Assessment (assessment-section-b.md) marks the whole piece holistically via AO4/AO5 Level bands — no itemised per-beat marks. The 6-beat classic story spine is the PLANNING scaffold (only used for the student's first-ever Section B diagnostic/redraft; subsequent attempts are told to switch to the separate Creative Writing course's 'Story Step 1/2/...' protocol, which is out of this board's scope).
- _Source:_ `protocols/edexcel-igcse/language2/steps/b2-creative.md (lines 18-34, story-spine questions); protocols/edexcel-igcse/language2/modules/assessment-section-b.md (lines 41-142, holistic AO4/AO5 marking)`

---

## EDUQAS

> **Coverage:** Read every eduqas protocol-a-assessment.md (language1, language2, literature, modern, shakespeare, poetry, unseen) plus protocols/shared/language-paper-specs.json and literature-paper-specs.json (eduqas keys). All 7 subject folders and every question/section within them are covered below — nothing skipped. Two deviations from the shared spec JSON are flagged (not resolved, per instructions): (1) poetry — protocol totals Section A(15)+Section B(25)=40 marks, while literature-paper-specs.json's poetry_anthology entry states the real EDUQAS component total is 25 marks (its own _split_note already flags "no dedicated 25-split yet"); (2) unseen — protocol totals Q3.1(24)+Q3.2(25)=49 marks, while the spec's unseen entry is 20 marks with its own _split_note already flagging "Protocol currently sums 40 — reconcile to 20 (Phase 2)". Both are pre-existing acknowledged spec/protocol drifts, cited not invented. Also flagged: unseen protocol-a-assessment.md has internally inconsistent "out of N" captions in a couple of places (e.g. an inline "Total Mark for conclusion...out of 2" caption sits beside a mark-scheme whose Worth: values sum to 4) — the Worth: sums (which reconcile exactly to each section's stated header total, e.g. Q3.1's 2+18+4=24 matches "24 marks") were treated as authoritative over the stray captions.

### language1 — Component 1 (C700U10) — Language, fiction-based, no CN

#### Q1 — List/identify from specified lines
- **5 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ Basic retrieval/list task — 1 mark per point. SKIP per universal rule.
- _Source:_ `protocols/shared/language-paper-specs.json (eduqas.language_c1.Q1); protocols/eduqas/language1/modules/protocol-a-assessment.md (Sub-Protocol Q1, '1 mark per valid point/inference, up to five')`

### language1 — Component 1 (C700U10)

#### Q2 — What impressions does the writer create of X? (language analysis)
- **5 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **1**
- **Body paragraph elements:**
  - Topic Sentence (AO2) — 0.5
  - Technique+Evidence+Inference (AO2) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO2) — 0.5
  - Perceptive Close Analysis (AO2) — 1.0
  - Effect 1 on Reader (AO2) — 0.5
  - Effect 2 on Reader (AO2) — 0.5
  - Author's Purpose (AO2) — 1.0
- _Note:_ No Context row — AO2 only, AO3 not assessed on this Q. All mark values verbatim from the protocol's Mark Breakdown (sums to 5.0).
- _Source:_ `protocols/eduqas/language1/modules/protocol-a-assessment.md (Sub-Protocol Q2, 'Paragraph aim: 1 TTECEA paragraph (depth over breadth)')`

#### Q3 — In what ways does X change? How does the writer show this? (structure analysis)
- **10 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence (AO2) — 0.5
  - Technique+Evidence+Inference (AO2) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO2) — 0.5
  - Perceptive Close Analysis (AO2) — 1.0
  - Effect 1 on Reader (AO2) — 0.5
  - Effect 2 on Reader (AO2) — 0.5
  - Author's Purpose (AO2) — 1.0
- _Note:_ Structure-focused (whole-text/paragraph/sentence scale) but marked with the same TTECEA skeleton, 5 marks per paragraph. No Context row.
- _Source:_ `protocols/eduqas/language1/modules/protocol-a-assessment.md (Sub-Protocol Q3, 'For 10 marks, produce 2 high-quality TTECEA paragraphs (5 marks each)')`

#### Q4 — Narrator's thoughts and feelings — how does the writer show them?
- **10 marks** · AOs: AO2 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence (AO2) — 0.5
  - Technique+Evidence+Inference (AO2) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO2) — 0.5
  - Perceptive Close Analysis (AO2) — 1.0
  - Effect 1 on Reader (AO2) — 0.5
  - Effect 2 on Reader (AO2) — 0.5
  - Author's Purpose (AO2) — 1.0
- _Note:_ Identical TTECEA skeleton to Q3, no Context row.
- _Source:_ `protocols/eduqas/language1/modules/protocol-a-assessment.md (Sub-Protocol Q4, '2 well-developed TTECEA paragraphs, 5 marks each')`

#### Q5 — To what extent do you agree with this statement? (evaluation)
- **10 marks** · AOs: AO4 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence addressing evaluative keywords (AO4) — 0.5
  - Technique+Evidence+Inference (AO4) — 0.5
  - Accurate technical terminology (AO4) — 0.5
  - Analysis links to topic sentence + question keywords (AO4) — 0.5
  - Perceptive Close Analysis (AO4) — 1.0
  - Effect 1 on Reader (AO4) — 0.5
  - Effect 2 on Reader (AO4) — 0.5
  - Author's Purpose linked to evaluative focus (AO4) — 1.0
- _Note:_ Deviation: unlike a typical 'evaluation adds short intro/conclusion' pattern, this Eduqas Q5 stays pure TTECEA body-only (2 paragraphs) — the evaluative demand is folded into every element rather than producing a separate essay shape. AO stamped AO4 throughout, no Context row.
- _Source:_ `protocols/eduqas/language1/modules/protocol-a-assessment.md (Sub-Protocol Q5, 'CRITICAL Q5 MARKING PRINCIPLE — marks come from HOW WELL they execute TTECEA, not WHAT position they take')`

### language1 — Component 1 (C700U10) — Section B

#### Q6 — Section B: Creative prose writing (choice of 4 titles, 450-600 words / 650 min for redraft)
- **40 marks** · AOs: AO5, AO6 · structure: **scene-story-spine** · paragraphs: **0**
- _Note:_ Holistic creative narrative — marked as Content & Organisation (AO5, /24) + Technical Accuracy (AO6, /16), NOT TTECEA. Per universal rule this is the creative/narrative story-spine structure, not IUMVCC.
- _Source:_ `protocols/shared/language-paper-specs.json (eduqas.language_c1.Q6, content_marks 24 + spag_marks 16); protocols/eduqas/language1/modules/protocol-a-assessment.md (Sub-Protocol Section B, holistic AO5/AO6 marking)`

### language2 — Component 2 (C700U20) — Language, anthology + transactional writing

#### Q1a-c — Single fact retrieval from Source 1 (3 parts)
- **3 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ SKIP — basic retrieval, protocol itself auto-removes Q1 from any Exam-Practice selection with the message 'a simple retrieval task ... you should complete independently'.
- _Source:_ `protocols/shared/language-paper-specs.json (eduqas.language_c2.Q1a/b/c); protocols/eduqas/language2/modules/protocol-a-assessment.md (Assessment Sub-Protocol: Question 1, 1 mark per correct answer, max 3)`

### language2 — Component 2 (C700U20)

#### Q2 — How does the writer try to show X? Comment on language, tone, structure (Source A)
- **10 marks** · AOs: AO2, AO4 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence introducing language concept/effect (AO2) — 0.5
  - Terminology + integrated quotes (AO2) — 0.5
  - Perceptive Close Analysis of how language creates meaning (AO2) — 0.5
  - Effect 1 on Reader (AO2) — 1.0
  - Effect 2 on Reader (AO2) — 1.0
  - Author's Purpose (AO2) — 1.0
- _Note:_ Spec JSON lists AOs [AO2, AO4] but the protocol's mark breakdown stamps every element AO2 only — protocol is the definitive per-element source per WML rules. No Context row (no AO3).
- _Source:_ `protocols/eduqas/language2/modules/protocol-a-assessment.md (Assessment Sub-Protocol: Question 2, 2 paragraphs x 5 marks each)`

#### Q3a-c — Single fact retrieval from Source 2 (3 parts)
- **3 marks** · AOs: AO1 · structure: **SKIP (none)**
- _Note:_ SKIP — identical retrieval shape to Q1, also auto-removed from Exam-Practice selection by the protocol.
- _Source:_ `protocols/shared/language-paper-specs.json (eduqas.language_c2.Q3a/b/c); protocols/eduqas/language2/modules/protocol-a-assessment.md (Assessment Sub-Protocol: Question 3)`

#### Q4 — To what extent do you agree with this statement about Source 2? (evaluation)
- **10 marks** · AOs: AO2, AO4 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Topic Sentence — evaluative position on the statement (AO4) — 0.5
  - Terminology + integrated quotes from Source B (AO4) — 0.5
  - Close Analysis of language supporting/challenging the statement (AO4) — 0.5
  - Effect 1 — relationship to the statement (AO4) — 1.0
  - Effect 2 — developing evaluative analysis (AO4) — 1.0
  - Writer's Purpose in relation to the statement (AO4) — 1.0
- _Note:_ Spec JSON labels this AO2+AO4 but the live protocol's mark breakdown stamps every element AO4 only (protocol authoritative). No Context row.
- _Source:_ `protocols/eduqas/language2/modules/protocol-a-assessment.md (Assessment Sub-Protocol: Question 4, AO4, 2 x 5-mark paragraphs)`

#### Q5 — Using both texts, explain briefly X (synthesis)
- **4 marks** · AOs: AO1 · structure: **other** · paragraphs: **1**
- **Body paragraph elements:**
  - Holistic synthesis of BOTH texts (AO1) — marked 0-4 on a single holistic band descriptor, not itemised TTECEA elements
- _Note:_ Deviation: NOT TTECEA — a short (~150-200 word) synthesis-of-both-sources answer marked against 4 holistic band descriptors (4/3/2/1/0 marks), no separate criteria rows.
- _Source:_ `protocols/eduqas/language2/modules/protocol-a-assessment.md (Assessment Sub-Protocol: Question 5, 'Award up to 4 marks based on holistic assessment of synthesis quality')`

#### Q6 — Compare the impressions the writers create of X and Y
- **10 marks** · AOs: AO3 · structure: **ttecea-body** · paragraphs: **2**
- **Body paragraph elements:**
  - Comparative Topic Sentence — key difference/similarity (AO3) — 0.5
  - Comparative terminology + integrated quotes from BOTH sources (AO3) — 0.5
  - Comparative Close Analysis of both sources' language (AO3) — 0.5
  - Comparative Effect 1 on readers (AO3) — 1.0
  - Comparative Effect 2 on readers (AO3) — 1.0
  - Comparative evaluation of both writers' purposes (AO3) — 1.0
- _Note:_ Comparative-TTECEA variant — same 6-slot skeleton (drops the discrete Context row; the whole paragraph is AO3 comparison) but every element requires evidence/analysis from BOTH sources with comparative connectives.
- _Source:_ `protocols/eduqas/language2/modules/protocol-a-assessment.md (Assessment Sub-Protocol: Question 6, 2 comparative TTECEA paragraphs, 5 marks each)`

### language2 — Component 2 (C700U20) — Section B

#### Q7 — Section B Task 1 — transactional writing (article/guide, ~300-400 words)
- **20 marks** · AOs: AO5, AO6 · structure: **iumvcc** · paragraphs: **6**
- _Note:_ Section B transactional writing = IUMVCC (Introduction/Urgency/Methodology/Vision/Counter-argument/Conclusion), not TTECEA, per universal rule and confirmed by protocol's own self-assessment prompt naming IUMVCC sections.
- _Source:_ `protocols/shared/language-paper-specs.json (eduqas.language_c2.Q7, content_marks 12 + spag_marks 8); protocols/eduqas/language2/modules/protocol-a-assessment.md (Assessment Sub-Protocol: Section B Task 1/2, AO5=12 marks Content&Organisation / AO6=8 marks Technical Accuracy, references IUMVCC structure explicitly)`

#### Q8 — Section B Task 2 — transactional writing (letter/speech, ~300-400 words)
- **20 marks** · AOs: AO5, AO6 · structure: **iumvcc** · paragraphs: **6**
- _Note:_ Same IUMVCC shape as Q7 — protocol handles both tasks via one shared 'Section B Task 1 OR Task 2' sub-protocol.
- _Source:_ `protocols/shared/language-paper-specs.json (eduqas.language_c2.Q8); protocols/eduqas/language2/modules/protocol-a-assessment.md (Assessment Sub-Protocol: Section B, shared parameterized template for Task 1/2)`

### literature — Component 2 Section B — 19th-century prose

#### Essay — Extract-rooted whole-text essay on the 19th-century prose text
- **40 marks** · AOs: AO1, AO2, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — compelling concept/contextual factor (AO1/AO3) — 1.0 · Building sentence — pertinent contextual backdrop (AO3) — 0.5 · Building sentence — evaluates how context shapes themes/purpose (AO3) — 0.5 · Three-point Thesis (AO1) — 3.0 (1.0 per point)
- **Body paragraph elements:**
  - Topic sentence links to thesis and question (AO1) — 0.5
  - Integrated quotes & supporting evidence (AO1) — 0.5
  - Strategic selection of quotes (AO1) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO1/AO2) — 0.5
  - Perceptive Close Analysis of words/sound/structure (AO2) — 1.0
  - Analysis of technique interplay (AO2) — 1.0
  - Effect 1 on reader (AO2) — 1.0
  - Effect 2 on reader (AO2) — 1.0
  - Author's Purpose, evaluative language required (AO1) — 1.5
  - Context — drives author's conceptual/technical choices (AO3) — 1.0
- **Conclusion:** Restated Thesis (AO1) — 0.5 · Links to question (AO1) — 0.5 · Evaluates Controlling Concept (AO1) — 1.5 · Links concept to key techniques (AO1/AO2) — 1.5 · Author's Purpose, evaluative language required (AO1) — 1.5 · Context drives author's central purpose (AO1/AO3) — 1.5 · Universal moral/message (AO1) — 1.0
- _Note:_ TTECEA+Context (Context row present because AO3 IS assessed). Full 11-element body row list is the complete mark scheme (sums to 9.0/paragraph); intro sums to 5.0, conclusion to 8.0. No AO4/SPaG (confirmed by spec's own _note).
- _Source:_ `protocols/shared/literature-paper-specs.json (eduqas.19th_century, split.intro=5/body=9x3/conclusion=8); protocols/eduqas/literature/modules/protocol-a-assessment.md (full Intro/Body1-3/Conclusion mark breakdowns)`

### modern — Component 2 Section A — post-1914 prose/drama

#### Essay — Whole-text essay on the modern (post-1914) prose/drama set text
- **40 marks** · AOs: AO1, AO2, AO4 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — compelling concept (AO1) — 1.0 · Building sentence — writer's approach to the central concern/question (AO1) — 1.0 · Building sentence — evaluates a major stylistic feature (AO2) — 1.5 · Three-point Thesis (AO1) — 1.5
- **Body paragraph elements:**
  - Topic sentence links to thesis and question (AO1) — 1.0
  - Integrated quotes & supporting evidence (AO1) — 0.5
  - Strategic selection of quotes (AO1) — 0.5
  - Accurate technical terminology (AO2) — 0.5
  - Analysis links to topic sentence (AO1/AO2) — 0.5
  - Perceptive Close Analysis of words/sound/structure (AO2) — 1.5
  - Analysis of technique interplay (AO2) — 1.0
  - Effect 1 on reader (AO2) — 1.0
  - Effect 2 on reader (AO2) — 1.0
  - Author's Purpose, evaluative language required (AO1) — 1.5
- **Conclusion:** Restated Thesis (AO1) — 0.5 · Links to question (AO1) — 0.5 · Evaluates Controlling Concept (AO1) — 1.5 · Links concept to key techniques (AO1/AO2) — 1.5 · Author's Purpose, evaluative language required (AO1) — 2.0 · Understanding of how context shapes author's central purpose (AO1) — 1.0 · Universal moral/message (AO1) — 1.0
- _Note:_ Deviation from literature bedrock: NO Context row anywhere (no AO3 assessed) — the '6. Context drives central purpose' conclusion element is stamped AO1 only, not AO1/AO3, confirming context is used as an AO1 synthesis point not a distinct AO3 mark. The spec's AO4=5 SPaG marks are assessed separately/holistically via penalty deductions, not as a discrete body-paragraph row.
- _Source:_ `protocols/shared/literature-paper-specs.json (eduqas.modern_text, marks=40, spag_marks=5, aos AO1/AO2/AO4, split 5/9x3/8); protocols/eduqas/modern/modules/protocol-a-assessment.md`

### shakespeare — Component 1 Section A — Q1(a) extract

#### Q1a — Extract-only analysis question
- **15 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Three-point Thesis only (AO1) — 1.5 (short intro — no hook/building sentences for the extract question)
- **Body paragraph elements:**
  - Topic Sentence — conceptual, links to thesis/question (AO1) — 0.5
  - Technique+Evidence+Inference (AO1/AO2) — 0.5
  - Close Analysis — word-level/structural (AO2) — 1.0
  - Effect 1 on reader/audience (AO2) — 0.5
  - Effect 2 on reader/audience (AO2) — 0.5
  - Author's Purpose (AO1) — 1.0
- **Conclusion:** Restated thesis, synthesised, answers the question (AO1) — 1.5 (short conclusion — thesis restate only)
- _Note:_ Short-intro/short-conclusion mini-essay per universal rule ('evaluation Qs often use SHORT intro = thesis only / SHORT conclusion = restated thesis only'). No Context row (no AO3), no SPaG here.
- _Source:_ `protocols/shared/literature-paper-specs.json (eduqas.shakespeare, split.sections[0] '(a) extract' = 15 marks AO1+AO2); protocols/eduqas/shakespeare/modules/protocol-a-assessment.md (Q1_EXTRACT mark allocation 'Intro 1.5, Body 4+4+4, Conclusion 1.5 = 15 marks (no AO4)')`

### shakespeare — Component 1 Section A — Q2(b) whole-play essay

#### Q1b — Whole-play thematic essay (incl. 5 SPaG)
- **25 marks** · AOs: AO1, AO2, AO4 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — intriguing concept (AO1) — 0.5 · Building sentence — writer's approach to central concern (AO1) — 0.5 · Building sentence — evaluates a major stylistic feature (AO2) — 0.5 · Three-point Thesis (AO1) — 0.5
- **Body paragraph elements:**
  - Topic Sentence — conceptual, links to thesis/question (AO1) — 0.5
  - Technique+Evidence+Inference (AO1/AO2) — 1.0
  - Close Analysis — word-level (AO2) — 1.0
  - Effect 1 on reader/audience (AO2) — 1.0
  - Effect 2 on reader/audience (AO2) — 0.5
  - Author's Purpose — detailed (AO1) — 1.0
- **Conclusion:** Restated Thesis (AO1) — 0.5 · Evaluation of Controlling Concept (AO1) — 1.0 · Links concept to key techniques (AO1/AO2) — 0.5 · Author's Purpose + Context — how context shapes purpose (AO1) — 1.0
- _Note:_ Full intro+conclusion (unlike Q1a's short versions). 20 marks AO1+AO2 as itemised above (intro 2.0 + body 5x3=15 + conclusion 3.0), plus a separate 5-mark holistic AO4/SPaG assessment (not a TTECEA row). No discrete Context row — context appears only inside the conclusion's Purpose+Context AO1 element.
- _Source:_ `protocols/shared/literature-paper-specs.json (eduqas.shakespeare, split.sections[1] '(b) whole-play essay incl 5 SPaG' = 25 marks AO1/AO2/AO4); protocols/eduqas/shakespeare/modules/protocol-a-assessment.md (Q2_WHOLE_TEXT: 'Intro 2, Body 5+5+5, Conclusion 3 = 20 marks + 5 AO4'; AO4/SPaG assessed separately in section '3A. AO4 Assessment')`

### poetry — Component 1 Section B — Section A: single named poem

#### SectionA — Single (focus) poem analysis — Form/Structure/Language
- **15 marks** · AOs: AO1, AO2, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Thesis statement only (AO1) — 1.0 (short intro)
- **Body paragraph elements:**
  - Topic sentence — how the poet's [Form/Structure/Language] choice conveys meaning (AO1) — 0.5
  - Technical terminology identifying the technique (AO2) — 0.5
  - Strategic evidence — quote illustrating the choice (AO1) — 0.5
  - Close Analysis of the quote (AO2) — 0.5
  - Effect on the reader — focus/emotion/thought (AO2) — 0.5
  - Author's Purpose — why the poet chose this (AO1/AO2) — 0.5
  - Context — how the poet's context shapes this choice (AO3) — 1.0
- **Conclusion:** Restated thesis, fresh phrasing (AO1) — 1.0 · Ultimate moral message (AO1) — 1.0
- _Note:_ DEVIATION FLAGGED: protocol treats this as a separate 15-mark question with 3 paragraphs each dedicated to one of Form/Structure/Language (fixed 3-aspect TTECEA, same pattern class as AQA Lang P2 Q4), not a generic single TTECEA. literature-paper-specs.json's eduqas.poetry_anthology entry states the real component total is 25 marks with split=null — the protocol's Section A(15)+Section B(25)=40 split does not match that spec figure; flagged per instructions, not resolved.
- _Source:_ `protocols/eduqas/poetry/modules/protocol-a-assessment-poetry.md (Assessment Sequence 'SECTION A (Single Poem - 15 marks): Introduction (1) → Body 1: Form (4) → Body 2: Structure (4) → Body 3: Language (4) → Conclusion (2)')`

### poetry — Component 1 Section B — Section B: comparative

#### SectionB — Comparative analysis — focus poem vs chosen anthology poem
- **25 marks** · AOs: AO1, AO2, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Comparative hook — shared concept/contextual factor between BOTH poems (AO1/AO3) — 0.5 · Building sentence — compares contextual backdrops of BOTH poets (AO3) — 0.5 · Building sentence — evaluates how EACH poem's context shapes themes/purpose differently (AO3) — 0.5 · Three-point Comparative Thesis (AO1) — 1.5
- **Body paragraph elements:**
  - Comparative topic sentence — how BOTH poets' [Form/Structure/Language] choices convey meaning (AO1) — 0.5
  - Comparative technical terminology in BOTH poems (AO2) — 0.5
  - Comparative evidence — quotes from BOTH poems (AO1) — 0.5
  - Integrated comparative quotes, smoothly embedded (AO1) — 0.5
  - Comparative Close Analysis of BOTH quotes (AO2) — 1.0
  - Comparative Effects — how each poet's choice affects the reader differently (AO2) — 1.0
  - Comparative Author's Purpose — why EACH poet chose their approach (AO1/AO2) — 0.5
  - Comparative Context — how EACH poet's context shapes the choice (AO3) — 1.5
- **Conclusion:** Restated comparative thesis, fresh phrasing (AO1) — 1.0 · Synthesized central comparative concept (AO1) — 1.0 · How BOTH poets' methods serve their purposes (AO1/AO2) — 1.0 · Universal comparative message (AO1) — 1.0
- _Note:_ Body element list shown is for Body 1 (Form) — Body 2 (Structure) and Body 3 (Language) add a 9th 'Technique interplay — how [Structure/Language] works with the other two techniques (AO2) — 0.5/1.0' row not present in Body 1. Same 40-vs-25 spec deviation noted on SectionA row applies here.
- _Source:_ `protocols/eduqas/poetry/modules/protocol-a-assessment-poetry.md (Assessment Sequence 'SECTION B (Comparative - 25 marks): Introduction (3) → Body 1: Form (6) → Body 2: Structure (6) → Body 3: Language (6) → Conclusion (4)')`

### unseen — Component 2 Section C — Q3.1 single unseen poem

#### Q3.1 — Single unseen poem essay (Introduction/beginning, Language, Ending)
- **24 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — intriguing concept/thematic question (AO1) — 0.5 · Theme building sentence — poem's central theme/idea (AO1) — 0.5 · Three-point Thesis about the poet's methods (AO1) — 1.0
- **Body paragraph elements:**
  - Concept-led topic sentence with clear argumentative claim (AO1) — 1.0
  - Precise subject terminology identifying the technique (AO2) — 0.5
  - Strategic quote selection, smooth integration (AO1/AO2) — 0.5
  - Close Analysis — zooming in on specific words/sounds/punctuation (AO2) — 1.0
  - Effect on reader — first sentence, emotional/intellectual impact (AO2) — 0.75
  - Effect on reader — second sentence, deeper/alternative effect (AO2) — 0.75
  - Perceptive insight into the poet's purpose (AO1/AO2) — 1.5
- **Conclusion:** Restated thesis, fresh language (AO1) — 1.0 · Controlling concept — central big idea (AO1) — 1.0 · Author's Purpose — what the poet ultimately achieves (AO1/AO2) — 1.0 · Universal moral message (AO1) — 1.0
- _Note:_ Explicitly no AO3 for unseen poetry ('Unlike literature texts... unseen poetry does NOT assess AO3'). Body paragraphs are topic-anchored (Body1=Form/Beginning, Body2=Language, Body3=Ending) but use one shared 7-element TTECEA skeleton. Some inline 'Total Mark...out of N' captions and the final-summary display elsewhere in the file show stale/inconsistent lower numbers (e.g. 'out of 2' beside a 4.0-summing conclusion) — the header total (24) and Worth-value sums are internally consistent and were treated as authoritative.
- _Source:_ `protocols/eduqas/unseen/modules/protocol-a-assessment.md ('Protocol A.1: Q3.1 Assessment Workflow (24 marks)'; element Worth: values sum to 2 (intro) + 18 (3x6 body) + 4 (conclusion) = 24, matching the header)`

### unseen — Component 2 Section C — Q3.2 comparative unseen poems

#### Q3.2 — Comparative analysis of two unseen poems
- **25 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Comparative hook — shared theme, signals comparison (AO1) — 1.0 · Comparative theme sentence — how BOTH poets approach the theme differently (AO1) — 1.0 · Comparative thesis, three-point argument covering both poems (AO1) — 1.0
- **Body paragraph elements:**
  - Comparative concept-led topic sentence covering BOTH poems (AO1) — 1.0
  - Technique identification for BOTH poems, precise terminology (AO2) — 0.5
  - Evidence from BOTH poems, smooth integration (AO1/AO2) — 0.5
  - Comparative Close Analysis of BOTH quotes (AO2) — 1.0
  - Comparative Effects on reader (AO2) — 1.0
  - Comparative insight into both poets' purposes (AO1/AO2) — 1.0
  - Sustained comparative language, balanced coverage (AO1/AO2) — 1.0
- **Conclusion:** Restated comparative thesis, fresh language (AO1) — 1.0 · Controlling comparative concept — what the comparison reveals (AO1) — 1.0 · Comparative poets' purposes — what comparison deepens (AO1/AO2) — 1.0 · Universal comparative message (AO1) — 1.0
- _Note:_ Combined with Q3.1, the protocol totals 24+25=49 marks for the unseen section, while literature-paper-specs.json's eduqas.unseen entry states the real component is 20 marks total and its own _split_note already flags 'Protocol currently sums 40 — reconcile to 20 (Phase 2)' — a pre-existing acknowledged discrepancy, cited not resolved. Still no AO3 (unseen poetry explicitly excludes context).
- _Source:_ `protocols/eduqas/unseen/modules/protocol-a-assessment.md ('Protocol A.2: Q3.2 Comparative Assessment Workflow (25 marks)'; element Worth: values sum to 3 (intro) + 18 (3x6 body) + 4 (conclusion) = 25, matching header)`

---

## OCR

> **Coverage:** Read: protocols/ocr/literature/modules/protocol-a-assessment.md (full, 1074 lines), protocols/ocr/literature/modules/exam-question-format.md, protocols/ocr/poetry/modules/protocol-a-assessment.md (full, 619 lines), protocols/ocr/poetry/modules/protocol-a-part-b.md (full, 462 lines), protocols/ocr/poetry/modules/knowledge-scoring-tables.md (Tables 1K.1-1K.6, the granular per-criterion source), and protocols/shared/literature-paper-specs.json (ocr block: shakespeare/19th_century/modern_text/poetry_anthology). OCR only has two board subjects present per the task (literature, poetry) - no OCR language protocol exists in this repo tree (find confirmed only protocols/ocr/literature and protocols/ocr/poetry directories). Within literature, all three text types (Shakespeare, 19th Century, Modern Text) share ONE protocol-a-assessment.md with an identical intro(5)+3xbody(9)+conclusion(8)=40 structure, so they are reported as ONE row rather than three duplicate rows - the only variation is Shakespeare/19th Century also carry a separate AO4/SPaG component score applied via penalty deductions (no dedicated mark-scheme element row exists for it), which modern_text does not have; this is noted per-row. Within poetry, Part (a) (comparison, AO1+AO2, no AO3) and Part (b) (single poem, AO1+AO2, no AO3) are reported as two separate rows since their body-paragraph criteria and mark allocations differ (Table 1K.2 vs Table 1K.5). NO SKIP/retrieval-only questions exist anywhere in OCR literature or poetry (confirmed via exam-question-format.md - both components are 100% extract-based full-essay or poetry-comparison essay formats; there is no true/false or mark-per-statement question type on this board's literature/poetry papers), so no needsStructure=false rows are included - this is a genuine absence, not an omission. One inconsistency in the source worth flagging: protocol-a-assessment.md section headers (A.7/A.8/A.9) label Body 1=Form, Body 2=Language, Body 3=Structure for BOTH Part (a) and Part (b), but the earlier Part (b) essay-plan blueprint (Section 2.C) orders Body 1=Language, Body 2=Form, Body 3=Structure - the granular scoring table 1K.5 for Part (b) bodies is undifferentiated by aspect (same 5 criteria/marks regardless of Form/Language/Structure), so this labelling drift does not affect the structural row reported.

### Literature — Component 1 (Modern Prose/Drama, 19th Century Novel) / Component 2 (Shakespeare) - Section A/B extract-choice essay

#### Literature Essay (Shakespeare / 19th Century / Modern Text) — Explore how [author] presents... (extract or non-extract choice)
- **40 marks** · AOs: AO1, AO2, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook - compelling hook establishing an intriguing concept/contextual factor (AO1/AO3) - 1.0 · Building Sentence 1 - establishes pertinent contextual backdrop (AO3) - 0.5 · Building Sentence 2 - evaluates how context shapes themes/purpose/choices (AO3) - 0.5 · Thesis - clear, precise three-point thesis with powerful argument (AO1) - 3.0 (1.0 per point)
- **Body paragraph elements:**
  - Topic Sentence - links to thesis and question (AO1) - 0.5
  - Integrated Quotes & Supporting Evidence (AO1) - 0.5
  - Strategic Selection of Quotes (AO1) - 0.5
  - Accurate Technical Terminology (AO2) - 0.5
  - Analysis links to Topic Sentence (AO1/AO2) - 0.5
  - Perceptive Close Analysis of words/sound/structure (AO2) - 1.5
  - Analysis of Technique Interplay (AO2) - 0.5
  - Effect 1 on Reader - detailed sentence (AO2) - 1.0
  - Effect 2 on Reader - detailed sentence, different effect than Effect 1 (AO2) - 1.0
  - Author's Purpose evaluated - MUST use evaluative/tentative modals (AO1) - 1.0
  - Context - drives author's conceptual and technical choices (AO3) - 1.5
- **Conclusion:** Restated Thesis (AO1) - 0.5 · Links to Question (AO1) - 0.5 · Controlling Concept evaluated (AO1) - 1.0 · Links Concept to Key Techniques (AO1/AO2) - 1.0 · Author's Purpose evaluated - MUST use evaluative/tentative modals (AO1) - 2.0 · Context drives Author's Central Purpose (AO1/AO3) - 1.5 · Moral/Message evaluated (AO1) - 1.5
- _Note:_ DEVIATION from universal 7-item TTECEA bedrock: body paragraph is expanded to 11 granular elements (AO1 evidence-quality sub-items split into 3 rows: topic-sentence-link, integrated-quotes, strategic-quote-selection; 2 separate reader-effect sentences instead of the bedrock's combined Effect1+Effect2 pairing works the same but is scored as 2x1.0 not merged). Fixed sequencing safeguard: Body 1 quote from beginning of text, Body 2 from middle, Body 3 from end (OCR Literature only). Shakespeare and 19th Century texts ALSO carry a separate AO4/SPaG component score (spag_marks:4 per literature-paper-specs.json) that is folded into penalty deductions and a qualitative 'Technical Accuracy' note in the Final Summary - it has NO dedicated mark-scheme element row in protocol-a-assessment.md, so it is not listed as a bodyElements/conclusionElements row. Modern Text has no AO4/SPaG component (spag_marks: null). Total 40 marks = intro 5 + 3x body 9 (27) + conclusion 8.
- _Source:_ `protocols/ocr/literature/modules/protocol-a-assessment.md (lines 283-1073, per-criterion mark breakdown); protocols/shared/literature-paper-specs.json (ocr.shakespeare / ocr.19th_century / ocr.modern_text)`

### Poetry — Component 2 Section A - Poetry Across Time

#### Poetry Part (a) — Compare the ways in which these poems present... (named anthology poem + unseen/printed poem)
- **20 marks** · AOs: AO1, AO2 · structure: **other** · paragraphs: **3**
- **Intro:** Comparative Thesis - concept-led, uses evaluative connectives, states what the COMPARISON reveals (AO1) - 1.0 · Both Poems Introduced - both poets/poems named and positioned in relation to each other (AO1) - 0.5 · Critical Voice Established - confident analytical register from first sentence (AO1) - 0.5
- **Body paragraph elements:**
  - Comparative Topic Sentence - abstract concept spanning BOTH poems (AO1) - 1.0 (Body 1/2) / 0.5 (Body 3)
  - Technique Identification, Poem A (AO2) - 0.5
  - Evidence - Poem A, grammatically integrated (AO1) - 0.5
  - Technique Identification, Poem B (AO2) - 0.5
  - Evidence - Poem B, grammatically integrated (AO1) - 0.5
  - Comparative Close Analysis - ONE word per poem (AO2) - 1.0 (Body 1/2) / 0.5 (Body 3)
  - Comparative Effects - specific for BOTH poems, states what comparison reveals (AO2) - 1.0 (Body 1/2) / 0.5 (Body 3)
  - Author's Purpose, comparative - WHY each poet made this choice (AO1) - 0.5
  - Technique Interrelationship - connects this paragraph's focus to another technique dimension; Level 5->6 differentiator (AO2) - 0.5 (Body 1 & 2 ONLY - Body 3 omits this element, max drops to 4.0)
- **Conclusion:** Evaluative Synthesis - considered verdict on the comparison (AO1) - 1.0 · Personal Critical Voice - 'most powerfully', 'ultimately', 'the comparison reveals' (AO1) - 0.5 · Conceptual Return - returns to and deepens the intro's comparative concept (AO1) - 0.5
- _Note:_ DEVIATION from bedrock TTECEA/full-essay model: this is a fixed 3-aspect comparative structure (Body 1=Form, Body 2=Language, Body 3=Structure per protocol A.7-A.9 headers), analogous to AQA Lang P2 Q4's fixed 3-aspect TTECEA. NOT standard TTECEA - each body element pairs a technique+evidence+analysis+effect for TWO poems simultaneously (comparative, not single-text). structureType is 'other' rather than 'ttecea-body' because every element is doubled/comparative by design. Explicitly 'No AO3' per protocol A.3 - context integration only enriches AO1/AO2, no separate context element/reward. Body 3 (Structure) has a reduced 4-mark max (drops Technique Interrelationship entirely, halves 3 other criteria from 1.0 to 0.5). Total 20 marks = intro 2 + body1 6 + body2 6 + body3 4 + conclusion 2.
- _Source:_ `protocols/ocr/poetry/modules/protocol-a-assessment.md (A.0-A.6, A.11); protocols/ocr/poetry/modules/protocol-a-part-b.md (A.7-A.10); protocols/ocr/poetry/modules/knowledge-scoring-tables.md (Tables 1K.1-1K.3, exact per-criterion marks)`

#### Poetry Part (b) — Explore in detail one other poem from your anthology which presents... (single anthology poem, must differ from any Part (a) poems)
- **20 marks** · AOs: AO1, AO2 · structure: **ttecea-body** · paragraphs: **3**
- **Intro:** Concept-Led Thesis - interpretive argument about HOW the poem presents theme, not what it 'is about' (AO1) - 1.0 · Poet and Poem Named - both named, relationship to theme established (AO1) - 0.5 · Analytical Register - confident critical voice from first sentence (AO1) - 0.5
- **Body paragraph elements:**
  - Concept-Led Topic Sentence - abstract interpretive claim, NOT 'the poet uses X' (AO1) - 1.0
  - Technique + Integrated Evidence - precise technique named, quote grammatically embedded (AO2) - 1.0
  - Close Analysis - ONE word in depth: connotation, sound, or etymology (AO2) - 1.0
  - Effects - specific emotion and/or thought stated at Level 5-6 hierarchy (AO2) - 1.0
  - Author's Purpose - WHY this choice, context naturally integrated where relevant (AO1) - 1.0
- **Conclusion:** Evaluative Synthesis - evaluates poem as a whole, which technique is most significant and why (AO1) - 1.5 · Personal Evaluative Voice - confident, genuine evaluative stance (AO1) - 1.0 · Conceptual Return - returns to and enriches the intro's thesis (AO1) - 0.5
- _Note:_ Single-poem TTECEA-shape body (5 elements: Topic/Technique+Evidence/Close-Analysis/Effects/Purpose = the Single Poem TTECEA Blueprint S1-S5 in Section 2.F), each element worth a flat 1.0 mark - simpler than the bedrock's 7-item skeleton because there is no separate 'Effect 2' sentence (one combined Effects element) and Context is folded into Purpose rather than a distinct row ('No AO3' rule applies here too). 3 body paragraphs (Form/Language/Structure aspects per A.7-A.9 headers, though the essay-plan blueprint in 2.C orders them Language/Form/Structure - the scoring table itself, 1K.5, is identical regardless of aspect). Total 20 marks = intro 2 + body1 5 + body2 5 + body3 5 + conclusion 3.
- _Source:_ `protocols/ocr/poetry/modules/protocol-a-assessment.md (A.0-A.6, A.11, Section 2.C/2.E/2.F); protocols/ocr/poetry/modules/protocol-a-part-b.md (A.7-A.10); protocols/ocr/poetry/modules/knowledge-scoring-tables.md (Tables 1K.4-1K.6, exact per-criterion marks)`

---

## CCEA

> **Coverage:** Read every protocol file under protocols/ccea/{prose,unseen-prose}/ (manifest.json, modules/protocol-a-assessment.md for both subjects) plus protocols/shared/literature-paper-specs.json (ccea.prose, ccea.unseen_prose entries, both verified:true against Summer 2025 mark schemes). CCEA has only two subjects in this repo: "prose" = CCEA GCSE English Literature Unit 1 Section A (prescribed novel set text, no extract given, full 5-paragraph essay, 40 marks) and "unseen-prose" = Unit 1 Section B (single unseen 19th-c prose extract, fixed question "Show how the writer of the extract engages the reader", full 5-paragraph response, 20 marks). Both manifests confirm assessment always-loads exactly one protocol-a-assessment.md and there is no separate retrieval/true-false question type anywhere in this board — CCEA does not have an AQA-style Q1 mark-per-statement question, so there is nothing to mark needsStructure=false for on this board; both rows below are fully structured full-essay types. Element lists, mark values and AOs are copied verbatim from each protocol's "Mark Breakdown / Criteria Assessment" numbered lists (not invented/estimated) — the unseen-prose protocol-a-assessment.md explicitly labels its body-paragraph criteria with TTECEA (T)/(T,E,I)/(C)/(E)/(E)/(A) tags in its Gold Standard Model section (lines ~424-450), confirming the element order used below; the prose protocol's body criteria (10 numbered items, lines 577-652) were consolidated into the same 6-row TTECEA skeleton since several of its criteria (integrated quotes, strategic quote selection, terminology, analysis-links-to-topic) are sub-components of the single "Technique+Evidence+Inference" TTECEA slot rather than separate TTECEA rows. Context (AO3) is dropped from both bodyElements sets because both entries in literature-paper-specs.json stamp "aos": ["AO1","AO2"] only — CCEA GCSE Lit does not assess AO3/AO4 in these papers (SPaG/context are folded into the AO1 band judgement per protocol-a-assessment.md line 954). No planning/*.md files were needed to derive structure since protocol-a-assessment.md's own mark breakdown is the definitive per-element source per WML CLAUDE.md rules.

### prose — CCEA GCSE English Literature Unit 1, Section A (prescribed novel — set text essay)

#### Section A — Essay question on the whole set text (no extract provided — evidence drawn freely from across the text)
- **40 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — compelling hook establishing an intriguing concept (AO1) — 0.5 marks · Building Sentence 1 — establishes the writer's approach to the central concern/question (AO1) — 0.5 marks · Building Sentence 2 — evaluates a major stylistic feature in relation to the question (AO2) — 2.0 marks · Thesis — clear, precise three-point thesis with powerful argument (AO1) — 2.0 marks
- **Body paragraph elements:**
  - Topic Sentence — links to thesis and question (AO1) — 1.0 marks
  - Technique + Evidence + Inference — integrated & strategically selected quotes, accurate terminology, analysis linked to topic sentence (AO1/AO2) — combined 2.0 marks (four sub-criteria of 0.5 each)
  - Close Analysis — perceptive close analysis of words/sound/structure, plus analysis of technique interplay (AO2) — 2.5 marks
  - Effect 1 on Reader — first detailed sentence on reader effects, focus/emotion end of the effects chain (AO2) — 1.25 marks
  - Effect 2 on Reader — second detailed sentence on reader effects, thought/action end of the effects chain, must differ from Effect 1 (AO2) — 1.25 marks
  - Author's Purpose — evaluates why the author made these choices (AO1) — 1.0 marks
- **Conclusion:** Restated Thesis (AO1) — 0.5 marks · Links to Question (AO1) — 0.5 marks · Controlling Concept — evaluates the controlling concept (AO1) — 2.0 marks · Concept-to-Technique Link — links concept to key techniques (AO1/AO2) — 1.0 marks · Author's Central Purpose — evaluates author's purpose (AO1) — 2.5 marks · Context Shaping Purpose — understanding of how context shapes the author's central purpose (AO1) — 1.0 marks · Universal Message — evaluates the moral/message (AO1) — 0.5 marks
- _Note:_ No Context (AO3) row in bodyElements — protocol/spec stamp AO1+AO2 only; SPaG is embedded in the AO1 band judgement, not a separate mark (line 954). Body paragraphs are explicitly sequenced to source location: BP1=beginning of text, BP2=middle, BP3=end (the 'Sequencing Safeguard', lines 755-758) — this is a CCEA-specific deviation worth flagging. The protocol's own 'Length & Structure Standard (TTECEA)' block (lines 747-758) lists an additional unmarked 'S7+ Link Back' sentence (links analysis back to thesis/question) that has no separate mark-scheme criterion — included in target sentence count (7-10 sentences) but not as its own graded row here since it carries no independent mark allocation. Intro/body/conclusion mark splits (5/27/8=40) match protocols/shared/literature-paper-specs.json ccea.prose split exactly.
- _Source:_ `protocols/ccea/prose/modules/protocol-a-assessment.md (Mark Breakdown sections, lines 310-393 intro, 512-758 body, 774-877 conclusion); protocols/shared/literature-paper-specs.json ccea.prose (verified against Summer 2025 MS)`

### unseen-prose — CCEA GCSE English Literature Unit 1, Section B (unseen 19th-century prose extract)

#### Section B — Fixed question: "Show how the writer of the extract engages the reader" — considering (1) characters' feelings/reactions and (2) the writer's use of language, structure and form
- **20 marks** · AOs: AO1, AO2 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Opening Statement — clear opening statement that engages with the question (AO1) — 0.5 marks · Analytical Approach — establishes a clear analytical approach/nuanced stance beyond surface reading (AO1) — 0.5 marks · Thesis — well-structured thesis introducing three key methods of engagement (AO1/AO2) — 1.0 marks
- **Body paragraph elements:**
  - Topic Sentence — introduces a concept of engagement and links to thesis (AO1) — 0.5 marks
  - Technique + Evidence + Inference — integrated in one sentence (AO1/AO2) — 1.0 marks
  - Close Analysis — perceptive close analysis of specific words/sound/structure (AO2) — 0.75 marks
  - Effect 1 on Reader — what the technique makes the reader focus on and what emotion it creates (AO2) — 0.75 marks
  - Effect 2 on Reader — how the emotion shapes the reader's thoughts or sustained investment, must differ from Effect 1 (AO2) — 0.75 marks
  - Author's Purpose — evaluates the writer's purpose in engaging the reader (AO1/AO2) — 1.25 marks
- **Conclusion:** Restated Thesis — in fresh language (AO1) — 0.5 marks · Synthesis — synthesises how the three methods of engagement work together (AO1/AO2) — 1.0 marks · Author's Overall Purpose — evaluates writer's overall purpose in engaging the reader (AO1) — 1.0 marks · Final Evaluative Statement — lasting impression (AO1) — 0.5 marks
- _Note:_ No Context (AO3) row — protocol/spec stamp AO1+AO2 only for this paper too. The protocol's own Gold Standard model explicitly labels these six body rows with TTECEA tags (T / T-E-I / C / E / E / A) at lines 424-448, directly confirming this element ordering (this is the clearest TTECEA-labelled protocol found on this board). Diagnostic submissions are accepted with no minimum structure/word-count; Redraft/Exam Practice expects exactly 5 sections (Intro+3BP+Conclusion) and ≥400 words, auto-detected from the canvas rather than asked (v7.19.199 note) — flagging as a CCEA-specific mechanic, not a structure deviation. Band scale is 1-5 (Band 5=18-20) rather than a numeric grade. Intro/body/conclusion mark splits (2/15/3=20) match protocols/shared/literature-paper-specs.json ccea.unseen_prose split exactly.
- _Source:_ `protocols/ccea/unseen-prose/modules/protocol-a-assessment.md (Mark Breakdown sections, lines 146-197 intro, 279-450 body, 467-517 conclusion); protocols/shared/literature-paper-specs.json ccea.unseen_prose (verified against Summer 2025 MS)`

---

## SQA

> **Coverage:** Read: protocols/sqa/critical-reading/manifest.json (task-file map); modules/exam-question-format.md (full — Section 1/Section 2 shapes, past-paper style examples); modules/foundation.md (front matter/changelog only — confirms this is an AQA-Literature-derived protocol rescaled 30→20 for SQA N5); modules/protocol-a-assessment.md (full 1039 lines — the definitive marking structure: Part A/B/C/D workflow, Introduction 2-mark breakdown, Body Paragraph 5-mark×3 breakdown, Conclusion 3-mark breakdown); protocols/shared/literature-paper-specs.json (sqa block, both critical_reading_section_1 and critical_reading_section_2 entries) which independently corroborates both the "no TTECEA split" ruling for Section 1 and the exact 2/5×3/3=20 split for Section 2. Board only has one subject folder: sqa/critical-reading/ (no separate scottish-text or unseen-poetry subject directory exists under protocols/sqa/). COVERAGE GAP: SQA Section 1 (Scottish Text short-answer set, incl. the 8-mark comparison question) has NO planning/assessment protocol anywhere in the codebase — it is described only as an exam-question GENERATION format (modules/exam-question-format.md, task family "exam_question"), never as a student-answer marking/planning protocol. I did not invent a structure for it; flagged as needsStructure=false with the gap noted in that row, consistent with the shared spec JSON's own explicit ruling ("NOT a single essay. No TTECEA split."). Did not read planning/b1–b9 files in full (only manifest step labels) since the definitive element/paragraph structure for the CLAUDE.md instructions lives in protocol-a-assessment.md (the marking file), not the planning files, and the planning step labels (Setup/Goals, Diagnostic Import, Anchor Quotes, Body Paragraph 1/2/3, Thesis & Introduction, Conclusion & Review) are consistent with the 3-body-paragraph full-essay structure already confirmed.

### critical-reading — Paper 2 — Critical Reading, Section 1 (Scottish Text)

#### Section 1 — Scottish Text extract: 4-5 short analysis questions (understanding/language/technique/evaluation, 2-4 marks each) + 1 comparison question (8 marks, "With close reference to this [poem/extract] and at least one other... show how [author] explores...")
- **20 marks** · AOs: — · structure: **SKIP (none)**
- _Note:_ Skip per spec JSON's own ruling, not just the universal short-retrieval rule: this is a set of short skill-targeted questions (2-4 marks each), not a single structured response, and WML has NO planning/assessment protocol for it — only exam-question-format.md, which is used purely to GENERATE practice Section-1 papers (task family 'exam_question'), not to plan or mark student answers. The 8-mark comparison question at the end is the closest thing to a 'structured response' item in Section 1, but no protocol-a-assessment.md or planning/*.md exists for it in this codebase, so no body-element structure can be derived without inventing one — flagged as a gap, not populated.
- _Source:_ `protocols/sqa/critical-reading/modules/exam-question-format.md (question format only, no marking protocol); protocols/shared/literature-paper-specs.json:277-283 (sqa.critical_reading_section_1 — "CUSTOM: Scottish-text question set ... NOT a single essay. No TTECEA split.")`

### critical-reading — Paper 2 — Critical Reading, Section 2 (Critical Essay)

#### Section 2 — Critical Essay — student's chosen previously-studied text; whole-essay response (no extract).
- **20 marks** · AOs: AO1, AO2, AO3 · structure: **full-essay** · paragraphs: **3**
- **Intro:** Hook — compelling hook that establishes an intriguing concept/contextual factor — 1.0 mark (AO1/AO3) · Thesis — clear, precise thesis statement with powerful argument — 1.0 mark (AO1)
- **Body paragraph elements:**
  - Topic sentence links to thesis and question — 0.5 marks (AO1)
  - Technique + Evidence: integrated quotes & supporting evidence — 0.5 marks (AO2)
  - Technique naming: accurate technical terminology — 0.5 marks (AO2)
  - Close Analysis: analysis links to topic sentence — 0.5 marks (AO2)
  - Close Analysis: perceptive close analysis of words/sound/structure — 0.5 marks (AO2)
  - Close Analysis: technique interplay (how techniques work together) — 0.5 marks (AO2)
  - Effect 1 on reader (first detailed sentence on reader effects) — 0.5 marks (AO2)
  - Effect 2 on reader (second detailed sentence on reader effects) — 0.5 marks (AO2)
  - Author's Purpose — evaluates author's purpose — 0.5 marks (AO1/AO3)
  - Context — context drives author's choices — 0.5 marks (AO3)
- **Conclusion:** Restated Thesis — 0.5 marks (AO1) · Controlling Concept (evaluates controlling concept) — 1.0 mark (AO1) · Author's Central Purpose (evaluates author's purpose) — 1.0 mark (AO1/AO3) · Universal Message (evaluates moral/message) — 0.5 marks (AO1)
- _Note:_ DEVIATION from the universal 7-element TTECEA bedrock: this protocol splits the body paragraph into 10 granular 0.5-mark criteria rather than 7 (Technique, Evidence, and Close-Analysis are each split further, and Effect 1/Effect 2 are separate rows — same underlying TTECEA skeleton, just more finely graded per the adaptation notes' 'Body paragraphs reduced from 7 to 5 marks each' rescale from the AQA Literature 7-mark original). Context (AO3) is INCLUDED because AO3 is explicitly assessed (adaptation note: 'Historical context retained as brief references... supporting familiarity with text as a whole'). Intro and conclusion are both markedly shorter than the AQA original (2 marks / 3 marks vs typical 3-7 / 3-6), per the protocol's own SQA National 5 rescale (30→20 total marks).
- _Source:_ `protocols/sqa/critical-reading/modules/protocol-a-assessment.md:68-70 (mark totals per part), :308-384 (Introduction 2 marks: Hook 1.0 + Thesis 1.0), :484,549-625 (Body Paragraph 5 marks each = 10×0.5 elements), :746-833 (Conclusion 3 marks: Restated Thesis 0.5 + Controlling Concept 1.0 + Author's Purpose 1.0 + Moral/Message 0.5); protocols/sqa/critical-reading/modules/foundation.md:5 (adaptation notes: rescaled from AQA Lit 30→20); protocols/shared/literature-paper-specs.json:284-291 (sqa.critical_reading_section_2 split: intro 2 / body 5×3 / conclusion 3 = 20)`

---

