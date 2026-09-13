# PORT REPORT — SQA National 5 English, 2026-09-13

**Lane:** SQA content lane (port brief §6 addendum). **Branch:** `ports-2026-09-13` (worktree).
**Cells:** `protocols/sqa/ruae` (NEW) · `protocols/sqa/critical-reading` (REWRITTEN) ·
`protocols/sqa/writing` (NEW). **No version bumped, nothing committed, nothing deployed, no `.js` or
`.php` touched.** Facts only; every "not tested" below is literal.

---

## 0 · HEADLINE — what a reader of this report needs in ten lines

1. **All three cells are at the standard on paper:** assessment B-CHECKS **10/10** each, planning
   C-CHECKS **8/8** each, `tariff-gate` **green — 64 checks, every mark quoted from SQA's own
   document**, **zero paste asks**, three Part D rubrics at **D 6/6** with all 18 buttons defined.
2. ⛔ **None of them can be shown to a student yet**, and the reason is engine work I may not do:
   every cell needs a `resolve_protocol_group` map entry, a `language-paper-specs.json` block, router
   polishing rows, a chip-ladder arm, and — the real blocker — **outline rows and
   `_planOutlineTargets` fan-out mappings that do not exist.** `plan-fanout-harness` names exactly 17
   missing mappings (§7). All proposals below are byte-exact.
3. ⭐ **The single most important finding: SQA MARKS POSITIVELY AND NEVER DEDUCTS.** *"they are not
   deducted from a maximum on the basis of errors or omissions."* Every penalty deduction in the
   anchors is therefore wrong on this board. All three protocols carry `Total penalties: −0` and treat
   the universal codes as **named faults with worked fixes and no mark change**.
4. ⭐ **The second: SQA National 5 English has NO assessment objectives.** The skills are
   understanding · analysis · evaluation (plus content · style on the portfolio). Every cell forbids
   printing an AO label.
5. ⭐ **The third: the RUAE tariff set changes every single sitting** (2025 `2·4·2·4·2·6·4·4·2` · 2024
   `3·4·2·4·6·4·3·2·2` · 2023 `2·4·2·5·2·4·4·5·2`). Nine questions and 30 marks are the invariants;
   the numbers are not. The protocol marks by TYPE from the live printed tariff.
6. ⭐ **The fourth: the Critical Reading extract split varies BY TEXT inside one sitting** (2025: Bold
   Girls 4+4+4 · Duffy 4+2+4+2 · Morgan 2+4+4+2). Only the 8-mark commonality question is fixed, and
   its three-part formula is printed word-for-word identically in 2025 and 2024.
7. ⛔ **A fabricated mark scheme was live in the old SQA cell and is now off every loaded list**:
   `protocols/sqa/critical-reading/modules/foundation.md` states *"Introduction simplified to 2 marks
   (Hook + Thesis only)"*, *"Body paragraphs reduced from 7 to 5 marks each"*, *"Conclusion reduced
   from 6 to 3 marks"* for a paper SQA marks with a **five-band holistic grid and no element worths at
   all**. Six more modules came off with it (§4).
8. **The Portfolio is coursework SQA marks, and the specification forbids giving the candidate model
   answers for their own task, rephrasings, key ideas, a structure or SPaG corrections.** That cell is
   therefore stricter than every other polishing cell in WML — including a re-scoped `rephrase`,
   re-scoped SPaG buttons, and contrasting rewrites that may only ever be written on invented material.
9. **Nine documents were fetched from sqa.org.uk and saved on disk** (`protocols/sqa/_sources/`): the
   Course Specification v6.0 and the Portfolio assessment task v3.0 — **neither of which is on the
   drive at all**, so without them the Portfolio cell could not have been built from any source — plus
   the 2024 and 2023 RUAE and Critical Reading question papers and the marking instructions that were
   available for them.
10. **Nothing has been run through a chat endpoint, a browser or a student.** `_journeys-2026-09-13.json`
    is written to be run and has not been.

---

## 1 · PROVENANCE (PROTOCOL-STANDARD §E1.3 — unstated provenance does not ship)

| paper | authority document | series / version | on disk where | anchor used · verified against P1? |
|---|---|---|---|---|
| RUAE (X824/75/11) | `SQA English National 5 mi_N5_English_Reading-for-Understanding-Analysis-and-Evaluation_2025.pdf` (Question Paper Finalised Marking Instructions) + matching question paper | **2025**, Tue 6 May, 09:00–10:00 | `Sophicly Etch Mark Scheme Resources/SQA English National 5 Reading for Understanding/` | **LANGUAGE anchor** `protocols/aqa/language1/modules/protocol-a-assessment.md` · n/a (it IS the P1 anchor) |
| RUAE — 2nd + 3rd series | `N5_English_Reading-…_2024.pdf`, `…_2023.pdf`, `mi_…_2023.pdf` | 2024, 2023 | `protocols/sqa/_sources/` (fetched from sqa.org.uk 2026-09-13) | — |
| Critical Reading (X824/75/12) | `SQA English National 5 mi_N5_English_Critical-Reading_2025.pdf` (incl. the Critical Essay supplementary marking grid, pp. 59–60) + matching question paper | **2025**, Tue 6 May, 10:30–12:00 | `Sophicly Etch Mark Scheme Resources/SQA English National 5 Critical Reading/` | **LANGUAGE anchor** for Section 1; **LIT anchor** for the essay SHAPE only — **yes, verified against the P1 anchor**: card anatomy, gate wording, calibration rule, filing block and closing chain are all P1's, nothing was copied from the lit protocol on trust |
| Critical Reading — 2nd + 3rd series | `N5_English_Critical-Reading_{2024,2023}.pdf`, `mi_…_{2024,2023}.pdf` | 2024, 2023 | `protocols/sqa/_sources/` (fetched 2026-09-13) | — |
| Portfolio–writing (X824/75/03) | `n5-cat-english.pdf` (*Portfolio–writing and Performance–spoken language*, instructions for candidates) | **Version 3.0** | `protocols/sqa/_sources/` — ⚠️ **NOT on the drive**, fetched from https://www.sqa.org.uk/files_ccc/n5-cat-english.pdf | **LANGUAGE anchor**, Q5 extended-writing model (holistic + per-element feedback + one labelled holistic gold) · yes |
| Portfolio — marking grids | `n5-course-spec-english.pdf` (*National 5 English Course Specification*) — general marking principles, best-fit rule, both genre grids | **Version 6.0** | `protocols/sqa/_sources/` — ⚠️ **NOT on the drive**, fetched from https://www.sqa.org.uk/files_ccc/n5-course-spec-english.pdf | — |
| Course structure (all three) | the same Course Specification, pp. 4, 9–12 | Version 6.0 | as above | — |

**⛔ DOCUMENTS I COULD NOT OBTAIN (never invented around):**
- The **2024 RUAE marking instructions** — `https://www.sqa.org.uk/pastpapers/papers/instructions/2024/mi_N5_English_Reading-for-Understanding-Analysis-and-Evaluation_2024.pdf` returns **HTTP 404**. The 2024 question paper WAS obtained, so the 2024 tariff set is read from the paper's own printed marks; its per-question marking notes are unread.
- **Any SQA-published portfolio exemplar or candidate evidence.** Not at the URLs tried. → **GOLD MISSING** for the whole Portfolio cell.
- **Examiner/course reports** for any of the three components. Not searched exhaustively; not used.

---

## 2 · QUESTION-BY-QUESTION MAP

### 2a · RUAE — X824/75/11, 30 marks, 1 hour, nine compulsory questions, one unseen non-fiction passage

Tariffs below are the **2025 sitting**. ⭐ **They are not stable across sittings** — the protocol reads
the live printed tariff and derives the piece count from it (points = the number the paper states;
pairs = marks ÷ 2).

| Q | marks (2025) | skill | mark formula (SQA's own) | shape we teach | gold |
|---|---|---|---|---|---|
| Q1 | 2 | understanding | *"Any two points."* — 1 per glossed key point | the gloss | authored in-card from the passage |
| Q2 | 4 | analysis | *"Reference (1) / Comment (1) / x2"*; one word-choice pair AND one sentence-structure pair | R+C pairs | in-card |
| Q3 | 2 | analysis (linkage) | *"Any pair OR two selections covering different directions."* | the hinge | in-card |
| Q4 | 4 | understanding | *"Any four points."* | the gloss ×4 | in-card |
| Q5 | 2 | analysis | *"Reference (1) / Comment (1)"* | one R+C pair | in-card |
| Q6 | 6 | understanding | *"Any six points."* | the gloss ×6 | in-card |
| Q7 | 4 | understanding | *"Any four points."* | the gloss ×4 | in-card |
| Q8 | 4 | analysis | *"Reference (1) / Comment (1) / x2"* | R+C pairs | in-card |
| Q9 | 2 | evaluation | *"Selection (1) / Comment (1)"* + the explicit refusal of *"it sums up the main ideas"* | the loop-back | in-card |

**What changed and why:** the cell did not exist. Built from the LANGUAGE anchor with six forced
departures, each named in the protocol's own §DELTA: no deductions (SQA's positive-marking rule) · no
level descriptors exist for this paper so "Level Alignment" becomes **Standard Alignment** quoting the
formula (A4 forbids inventing one) · no word count, ceiling or halt anywhere · the unit is the question
and it is small · own-words questions carry SQA's *"use their own words as far as possible"* rule as the
paper's biggest single loss · eight of nine questions fence off their own lines. **Over-answering is
credited best-N, not first-N**, which is the exact opposite of the anchor's position-capped Tier rules
and is forced by positive marking.

### 2b · Critical Reading — X824/75/12, 40 marks, 1 h 30, two sections, two DIFFERENT genres

**Section 1 — Scottish text, 20 marks.** Recorded against the cited text option (Part A Text 1,
*Bold Girls* by Rona Munro, the board's own question numbers).

| Q | marks | skill | mark formula | shape we teach | gold |
|---|---|---|---|---|---|
| Q1 | 4 | analysis | *"Reference (1) / Comment (1) / x2"* | R+C pairs | in-card; poetry options may reverse `Model Answers/SQA/{Duffy,Kay,MacCaig,Morgan}/` |
| Q2 | 4 | analysis | as above | R+C pairs | as above |
| Q3 | 4 | analysis | as above | R+C pairs | as above |
| Q4 | **8** | analysis + evaluation across the writer's work | *"Identification of commonality (2)"* + *"A further 2 marks … for reference to the extract given"* + *"4 additional marks … for similar references to at least one other text/part of the text"*, with *"(maximum of 2 marks only for discussion of extract)"* | the bridge | in-card, in bullet form |

⭐ **The 12 extract marks split differently for every text in the same sitting.** Read the live tariff.
⭐ **Q4 is 8 marks on every text in every sitting read, and its formula is printed identically in 2025
and 2024** — the one row that can be relied on.

**Section 2 — critical essay, 20 marks**, one question from Drama · Prose · Poetry · Film and TV Drama ·
Language, on a different genre from Section 1. **LEVEL-BASED**, five bands (20–18 · 17–14 · 13–10 ·
9–5 · 4–0), four strands (familiarity + line of thought · analysis + critical terminology ·
**evaluation: what was enjoyed/gained** · language, accuracy, structure). **Minimum standards not met
→ maximum 9.** Gold: poetry options only (37 model answers on disk for the four prescribed poets);
⛔ **GOLD MISSING** for drama, prose, film/TV and language essays and for every Scottish drama and prose
text.

**What changed and why:** the `protocol-a-assessment.md` was **rewritten**, not patched (PORT SOP §P).
The March-2026 file asked the student to *"paste your essay plan now"* and *"paste your complete essay
now"*, told them to *"copy and paste this complete feedback … into the 'Introduction Feedback' section
of your workbook"*, carried **0** `@REFLECT_GATE`, **0** `HARD PRECONDITION`, no Q-GATE, no filing
markers, no canonical grade ladder and no cited tariffs (audit: **2/10**). It now audits **10/10** with
zero paste asks. The critical essay is marked holistically against the real grid with the student's own
band judgement taken first (PEDAGOGY §19).

### 2c · Portfolio–writing — X824/75/03, 30 marks, coursework

| unit | marks | how it is marked | shape we teach | gold |
|---|---|---|---|---|
| the piece | **30** | ONE piece, ≤1,000 words, broadly creative OR broadly discursive, judged HOLISTICALLY on content and style, best-fit band out of **15**, then **doubled** | creative: the seven scene elements · discursive: Introduction · Case · Evidence · Counter-argument · Vision · Conclusion | ⛔ **GOLD MISSING** — authored to the grid, on an invented subject, never presented as an SQA exemplar |

Bands **15–13 · 12–10 · 9–7 · 6–4 · 3–1**; **satisfactory technical accuracy is a requirement for the
9–7 band**; the board's three-case best-fit rule is quoted and followed.
⭐ **The word rule runs the OPPOSITE way to every other paper we teach:** a MAXIMUM of 1,000 words,
**no minimum at all**, and a penalty only above 1,100. There is no under-length ceiling on this
component and the protocol forbids advising a longer piece.
⚠️ **ONE piece, not two.** Older National 5 practice and most third-party material say two pieces at 15
each; the current documents say one, marked out of 15 and doubled.

---

## 3 · FILES WRITTEN (21 authored files + 10 moved slices + 11 source documents; nothing else touched)

**New cell — RUAE**
- `protocols/sqa/ruae/manifest.json`
- `protocols/sqa/ruae/modules/protocol-a-assessment.md`
- `protocols/sqa/ruae/modules/knowledge-mark-scheme-ruae.md` (verbatim principles, formulas, fault list)
- `protocols/sqa/ruae/planning/protocol-b-planning.md`

**Rewritten cell — Critical Reading**
- `protocols/sqa/critical-reading/manifest.json` (v2.0.0 — seven modules pruned, planning de-stitched, polishing retired)
- `protocols/sqa/critical-reading/modules/protocol-a-assessment.md` (**full rewrite**)
- `protocols/sqa/critical-reading/modules/knowledge-mark-scheme-critical-reading.md` (verbatim principles, the commonality formula, the five-band grid)
- `protocols/sqa/critical-reading/planning/protocol-b-planning.md` (**new monolith**)
- `protocols/sqa/critical-reading/planning/_superseded/` ← `b-intro.md`, `b1-setup.md` … `b9-review.md` **moved** (10 files, `git mv`, unedited)

**New cell — Portfolio–writing**
- `protocols/sqa/writing/manifest.json`
- `protocols/sqa/writing/modules/protocol-a-assessment.md`
- `protocols/sqa/writing/modules/knowledge-mark-scheme-portfolio.md` (both verbatim grids + the board's coursework conditions)
- `protocols/sqa/writing/planning/protocol-b-planning.md`

**Shared by all three cells (mine, board-local so it shadows the shared file)**
- `protocols/sqa/_shared/foundation-sqa.md` — ⭐ **written because `protocols/shared/modules/foundation.md` is the AQA Literature foundation**: it is titled *"AQA GCSE English Literature: Unified AI Tutor Protocol"*, says *"You are an expert AQA GCSE English Literature tutor … mastering the AQA assessment objectives (AO1, AO2, AO3) … across the six AQA marking levels (Level 1-6)"*, lists AQA set texts, and instructs *"Never accept 'I don't know'"* — which directly contradicts the C-LADDER's IDK gate. Loading it on an SQA cell would put false facts and a contradicting rule in the model's context.

**Part D rubrics (new, in the files §3 of the brief names as mine)**
- `protocols/shared/modules/rubrics/rubric-sqa-n5-ruae.md`
- `protocols/shared/modules/rubrics/rubric-sqa-n5-critical-reading.md`
- `protocols/shared/modules/rubrics/rubric-sqa-n5-writing.md`

**Tariff sources**
- `protocols/_marks/sqa__ruae.json` · `sqa__critical_reading.json` · `sqa__writing.json`

**Evidence + this report**
- `protocols/sqa/_journeys-2026-09-13.json` · `protocols/sqa/_PORT-REPORT-2026-09-13.md`
- `protocols/sqa/_sources/` — 11 files: 9 PDFs (2024 + 2023 RUAE and Critical Reading question papers, the 2023 RUAE marking instructions, the 2024 + 2023 Critical Reading marking instructions, the Course Specification v6.0, the Portfolio assessment task v3.0) + the 2 extracted texts of the two specification PDFs

**⛔ NOT edited, as required:** any `.js` or `.php` · `protocols/aqa/**` · any other board's directory ·
`protocols/shared/modules/**` except the three new rubric files · `PROTOCOL-STANDARD.md` ·
`PEDAGOGY.md` · `PROTOCOL-QUESTION-STRUCTURE-MAP.md` · `PROTOCOL-COVERAGE-MATRIX.md` ·
`protocols/shared/language-paper-specs.json`. No version bumped. No commit. No deploy.

---

## 4 · THE SEVEN PRUNED MODULES (Critical Reading) — kept on disk, off every loaded list

| module | why it cannot load |
|---|---|
| `modules/foundation.md` | states an **invented granular mark scheme** for a level-marked paper (*"Introduction simplified to 2 marks (Hook + Thesis only)"*, *"Body paragraphs reduced from 7 to 5 marks each"*, *"Conclusion reduced from 6 to 3 marks"*) — A4 violation; also declares itself an AQA Literature adaptation with *"All pedagogical frameworks … preserved from AQA master protocol"* |
| `modules/knowledge-hub.md` | AQA persona (*"mastering the AQA assessment criteria"*) + a `MENU_FOOTER()` that appends a retired main menu (*"type A (Start a new assessment), B (Plan a new essay), C (Polish writing)"*) to **every message** |
| `modules/knowledge-macros.md` | its own Socratic engine, stuck-response sequences and expert-insight prompts — a second template beside the code-owned ladder |
| `modules/knowledge-algorithm.md` | its own per-turn algorithm |
| `modules/knowledge-state.md` | its own persistent student profile store |
| `modules/knowledge-progress.md` | its own progress indicator on every response |
| `modules/knowledge-validation.md` | its own redirection logic, written for **AQA Literature** essays |
| `modules/protocol-c-polishing.md` | the March-2026 walk Part D retires; `polishing.always` is now `[]` with a `_retired` note |
| `planning/b-intro.md` … `b9-review.md` | moved to `planning/_superseded/`: paste-walls (*"Please paste three anchor quotes from key scenes"*), a *"Notes section at the end of your workbook"*, and hand-authored help sequences beside the ladder |

---

## 5 · GATE OUTPUT (pasted verbatim)

```
$ node bin/tariff-gate.js --only sqa
✔ tariff-gate: 3 paper(s) gated, 64 checks, every mark quoted from the board's own document
```

```
$ node bin/protocol-standard-audit.js --board sqa
PROTOCOL-STANDARD audit — B-CHECKS (assessment) · C-CHECKS (planning) · D-CHECKS (polishing: ENV rubric pass/abs, else monolith)
board/subject                 ASSESS pass/abs  RG  FB  TMF  last      PLAN pass/abs  FC  GR  last   POLISH  ENV pass/abs rubric | monolith files bytes @ last
sqa/critical-reading          10/10  7   7   6    2026-06-27          8/8  40  5                    monolith 1 7778   0  2026-03-25
sqa/ruae                      10/10  10  4   10                       8/8  27  5                    —
sqa/writing                   10/10  3   2   2                        8/8  15  5                    —
```
⚠️ Read the POLISH column correctly: it says `monolith` / `—` because the audit derives ENV status from
the **router's** `essay_polishing_env` rows, which only the engine lane can add. The rubrics themselves
pass D-CHECKS 6/6 (measured directly, §5b). `sqa/critical-reading` will read `monolith` until the
router row lands even though its manifest `polishing.always` is `[]`.

```
$ # paste asks across the 13 LOADED protocol files (3 × protocol-a + 3 × knowledge-mark-scheme
$ # + 3 × protocol-b + foundation-sqa + 3 × rubric). Scoped to loaded files on purpose: this report
$ # and _journeys quote the old file's paste-walls, so a whole-directory grep counts its own evidence.
files checked: 13
paste total: 0
AO-label lines (non-prohibition): 2   ← both are quotations ABOUT AQA (the anchor this cell ported
                                        from, and the AQA text in protocols/shared/modules/foundation.md
                                        that foundation-sqa.md exists to reject). No SQA-facing AO label.
shows-that lines (non-prohibition): 0
```
(`planning/_superseded/` still contains the old paste-walls verbatim, unedited, and is absent from
every manifest list. The retained-source law keeps it on disk; nothing loads it.)

```
$ node bin/planning-keymatch-harness.js
✅ planning-keymatch-harness passed (every protocol outline tag matches a render box).
```

```
$ node bin/ladder-check-harness.js   # SQA lines only
— PROTOCOL protocols/sqa/critical-reading/planning: ladder-enabled, all three invariants hold.
— PROTOCOL protocols/sqa/ruae/planning: ladder-enabled, all three invariants hold.
— PROTOCOL protocols/sqa/writing/planning: ladder-enabled, all three invariants hold.
```
(The harness's overall verdict is ❌ because of a pre-existing `protocols/edexcel-igcse/language1`
failure that is not mine and that I did not touch.)

```
$ node bin/essay-polishing-env-gate.js
✅ essay-polishing-env-gate passed  (249 assertions, 0 failed)
```

```
$ node bin/plan-fanout-harness.js   # SQA lines only — ⛔ 17 FAILURES, ALL OF THEM ENGINE WORK
FAIL protocols/sqa/critical-reading/planning: plan-Q1 has a @FIELD_SET but no fan-out mapping (extend _planOutlineTargets)
FAIL protocols/sqa/critical-reading/planning: plan-Q2 has a @FIELD_SET but no fan-out mapping (extend _planOutlineTargets)
FAIL protocols/sqa/critical-reading/planning: plan-Q3 has a @FIELD_SET but no fan-out mapping (extend _planOutlineTargets)
FAIL protocols/sqa/critical-reading/planning: plan-Q4 has a @FIELD_SET but no fan-out mapping (extend _planOutlineTargets)
FAIL protocols/sqa/critical-reading/planning: plan-commonality has a @FIELD_SET but no fan-out mapping (extend _planOutlineTargets)
FAIL protocols/sqa/critical-reading/planning: plan-conclusion label UNMAPPED<Evaluation> — extend _planLabelElement
FAIL protocols/sqa/ruae/planning: plan-Q1 … plan-Q9 has a @FIELD_SET but no fan-out mapping (extend _planOutlineTargets)   [9 lines]
FAIL protocols/sqa/writing/planning: plan-portfolio has a @FIELD_SET but no fan-out mapping (extend _planOutlineTargets)   [2 lines, one per purpose]
— protocols/sqa/critical-reading/planning: 10 plan @FIELD_SETs → 24 fan-out ids checked
— protocols/sqa/ruae/planning: 9 plan @FIELD_SETs → 0 fan-out ids checked
— protocols/sqa/writing/planning: 2 plan @FIELD_SETs → 0 fan-out ids checked
```
**Total harness failures went 45 → 62; all 17 new ones are SQA and all 17 are the missing engine
mappings in §7.** I chose to land the `@FIELD_SET` markers rather than omit them: omitting them would
have made the harness SKIP these protocols and report green, which is the false-pass shape the gate
exists to prevent (`plan-fanout-harness` skips unconverted protocols). ⛔ **Per
`PLANNING-LADDER-PORT-RECIPE.md` §1b, do not ship these cells student-facing while this gate is red.**
Note the useful half: **24 of Critical Reading's fan-out ids already resolve** — the essay's
body/intro/conclusion rows are the engine's existing shared literature rows and work today. Only the
new `Evaluation` label and the Section 1 rows are missing.

### 5b · D-CHECKS measured directly on the three rubrics

```
rubric-sqa-n5-ruae.md              D 6/6   all 18 buttons defined
rubric-sqa-n5-critical-reading.md  D 6/6   all 18 buttons defined
rubric-sqa-n5-writing.md           D 6/6   all 18 buttons defined
```
(Checks: `## INLINE COACHING ACTIONS` · `Provenance` · `Mark Complete` · student-chooses ·
`macro → micro` · `no task menu`. Buttons: `scan-structure` `scan-elements` `scan-coherence`
`scan-concept` `scan-context-drive` `strengthen-hook` `rephrase` `lang-scan-verbs`
`lang-scan-starters` `cw-cut-modifiers` `strengthen-vocabulary` `tighten` `adjust-tone`
`fix-spelling` `fix-grammar` `fix-punctuation` `compare-gold-standard` `explain`, plus all 21
`device-*` ids in the writing rubric.)

---

## 6 · ROUTER ROWS + CHIP LADDERS (for the engine lane)

**Text slugs each lesson should carry** — I could find **no existing SQA slug convention** to follow:
`grep -n sqa protocols/shared/language-paper-specs.json` → no match; `grep -rn sqa includes/class-rest-api.php`
→ no match (no `$SLUG_ALIASES` entry); `grep -rn sqa sophicly-writing-mastery-lab.php` → no match. So
these are proposals, not measured values, and they follow the census convention (`aqa_lang_paper_1`):

| cell | subject the lesson should send | text slug | router keying |
|---|---|---|---|
| RUAE | `ruae` | `sqa_n5_ruae` | **text slug**, `engine: 'language'` |
| Critical Reading | `critical_reading` | `sqa_n5_critical_reading` | **`sqa/critical_reading` subject row**, `engine: 'lit'` |
| Portfolio–writing | `writing` | `sqa_n5_portfolio` | **text slug**, `engine: 'language'` |

### 6a · ROW 1 — RUAE (`$essay_polishing_rubrics`, keyed on the text slug)
```php
            'sqa_n5_ruae' => [
                'cell'   => 'sqa/ruae',
                'rubric' => 'rubric-sqa-n5-ruae.md',
                'gold'   => ['protocols/sqa/ruae/modules/knowledge-mark-scheme-ruae.md'],
                'engine' => 'language',
            ],
```
**Why `engine: 'language'`:** RUAE is a multi-question reading paper with no five-paragraph essay, no
context objective and no substrate bank — exactly what `inline-coaching-engine-language.md` was
separated out for at v7.20.610.

### 6b · ROW 2 — Critical Reading (`$essay_polishing_subject_rows`, keyed on board/subject)
```php
            'sqa/critical_reading' => [
                'cell'   => 'sqa/critical-reading',
                'rubric' => 'rubric-sqa-n5-critical-reading.md',
                'gold'   => ['protocols/sqa/critical-reading/modules/knowledge-mark-scheme-critical-reading.md'],
                'extras' => [],
                'context_bank' => null,
                'engine' => 'lit',
            ],
```
**Why a SUBJECT row and `engine: 'lit'`:** the rubric, the gold and the fault list are per FAMILY while
the TEXT varies per lesson (Bold Girls · Sailmaker · Jekyll and Hyde · Duffy · Kay · MacCaig · Morgan
…) — the same reason the AQA Literature rows are subject-keyed. `context_bank` is **null on purpose**:
SQA National 5 assesses no context objective, so there is no AO3 substrate to slice.
⚠️ **`resolve_protocol_group`'s sqa map has `'critical_reading' => 'critical-reading'` already** — the
underscore/hyphen fold is done there, so the polishing row's key must be the **underscored** subject
`sqa/critical_reading` to match how `essay_polishing_env` builds `$key`.

### 6c · ROW 3 — Portfolio (`$essay_polishing_rubrics`, keyed on the text slug)
```php
            'sqa_n5_portfolio' => [
                'cell'   => 'sqa/writing',
                'rubric' => 'rubric-sqa-n5-writing.md',
                'gold'   => ['protocols/sqa/writing/modules/knowledge-mark-scheme-portfolio.md'],
                'engine' => 'language',
            ],
```

### 6d · CHIP LADDERS (`frontend/wml-selection-chip.js`)
`ESSAY_POLISH_ENV_TEXTS` must gain `'sqa_n5_ruae'` and `'sqa_n5_portfolio'`;
`ESSAY_POLISH_ENV_SUBJECTS` must gain `'sqa/critical_reading'` (§5d — the gate asserts the chip lists
equal the router maps).

| cell | ladder (macro → micro) | the writing question · gating |
|---|---|---|
| **RUAE** | `langScan` → `elementPolish` → `langWordChoiceReading` → `polishProse` → `fixSpag` → `reference` | **no writing question on this paper** — never show the `devices` group, and `langWordChoice`'s creative arm never applies. `scan-context-drive` must answer with its one-line redirect (no context objective). |
| **Critical Reading** | `langScan` → `elementPolish` → `langWordChoice` (analytical arm) → `polishProse` → `fixSpag` → `reference` | **no transactional writing question** — no `devices` group. `strengthen-hook` gates to the ESSAY's Introduction (located by the essay's own section heading, not by `q === 'Q5'`). `scan-context-drive` is present as a REDIRECT only. |
| **Portfolio** | `langScan` → `elementPolish` → **`devices` (broadly DISCURSIVE pieces only)** → `langWordChoice` → `polishProse` → `fixSpag` → `reference` | ⭐ **the Section-B gate has no question number here.** The existing pattern gates devices on `q === 'Q5'`; this component is ONE piece, so the gate must read the **declared purpose** instead: devices + `cw-cut-modifiers` show on `purpose === 'discursive'`, and `cw-cut-modifiers` alone on `'creative'`. Where the purpose is unknown, show both (the `!q` fallback's equivalent). |

---

## 7 · JS-ROWS SPEC (the engine-side rows I cannot add — modelled on `EDEXCEL-IGCSE-JS-ROWS-SPEC-2026-08-16.md`)

### 7.1 ⛔ HIGH — outline rows for the two new row families (`buildOutlineSection`, `OUTLINE_CRITERIA`)

Neither RUAE's three-element set nor the Portfolio's element set exists. **A `@FIELD_COMMIT` without a
rendered row writes nowhere** (`wml-assessment.js` ~2383) — every filing marker in two of my three
planning protocols is currently a silent no-op.

**(a) RUAE — three rows per question, and they must be TARIFF-INDEPENDENT.** This is the load-bearing
design decision and it is measured, not assumed: the tariff set changes every sitting, so a
row-per-point set would break each June. Rows:
| id | label | prompt |
|---|---|---|
| `outline-ruae-q{n}-target` | Target | *"What is the question asking you to do, and how many pieces does it want?"* |
| `outline-ruae-q{n}-evidence` | Evidence | *"Your quotations or your key points — one per line."* |
| `outline-ruae-q{n}-comment` | Comment | *"What each one suggests, or your own wording — one line each."* |
`{n}` = 1…9. **The number of points or pairs lives INSIDE the element** and is derived from the live
question's printed tariff — do not add rows for it.

**(b) Critical Reading Section 1** — the same three rows per extract question, ids
`outline-cr-q{n}-{target,evidence,comment}` for `{n}` = 1…4, plus four commonality rows:
`outline-cr-commonality-shared` · `-extract` · `-elsewhere-1` · `-elsewhere-2`.

**(c) Portfolio** — `outline-portfolio-purpose` · `-audience`, then either the creative seven
(`-hook -setup -reaction -epiphany -proaction -climax -denouement`) or the discursive six
(`-intro -case -evidence -counter -vision -conclusion`), selected by the declared purpose.

**(d) Plan boxes** — `plan-Q1`…`plan-Q9` (RUAE), `plan-Q1`…`plan-Q4` + `plan-commonality` (CR
Section 1), `plan-portfolio` (Portfolio). CR's essay uses the existing `plan-intro` / `plan-body-{i}` /
`plan-conclusion` and needs nothing new.

### 7.2 ⛔ HIGH — `_planOutlineTargets`: the 17 missing fan-out mappings the gate names
```
plan-Q{1..9}          → outline-ruae-q{n}-{target,evidence,comment}          (RUAE)
plan-Q{1..4}          → outline-cr-q{n}-{target,evidence,comment}            (CR Section 1)
plan-commonality      → outline-cr-commonality-{shared,extract,elsewhere-1,elsewhere-2}
plan-portfolio        → outline-portfolio-*, the set chosen by purpose
```
⚠️ **`plan-Q{n}` COLLIDES ACROSS CELLS.** AQA P1 planning already emits `plan-Q2-para-1` etc., and the
existing regex is `/^plan-(?:Q4-)?body-([123])$/` plus per-paper arms. My `plan-Q{n}` is a NEW shape
(question-level, no `-para-`). Route it per cell, not by pattern alone — key the fan-out on the
resolved paper as `_ladderPaperKey()` does, so an SQA `plan-Q3` cannot be read as an AQA one. **This is
the §5d write-key/read-key class and it is the one thing in this spec that could silently corrupt
another board's document if it is done by pattern.**

### 7.3 ⛔ HIGH — `_planLabelElement`: one new label
`Evaluation:` → `evaluation`, for `outline-conclusion-evaluation`. The gate names it:
`plan-conclusion label UNMAPPED<Evaluation>`.
And the row itself: **`outline-conclusion-evaluation` is new and it is the point of the SQA essay** —
the grid's third strand is *"a well developed commentary of what has been enjoyed/gained from the
text(s), supported by a range of well-chosen references to its relevant features"*, and students omit
it. It replaces the shared conclusion set's `purpose`/`message` pair on this board.

### 7.4 ⛔ HIGH — the Context row must NOT render on any SQA cell
`OUTLINE_CRITERIA.literature.body` includes a Context row dropped by `c.aoRequired` when the AO list has
no AO3 (`wml-assessment.js` :50482, and :50485 relabels Author's Purpose to AO1). **SQA has no AO list at
all**, so verify which branch an empty/absent `aos` takes. If an empty list does not drop the row, an SQA
essay renders a Context box that earns nothing and that the protocol explicitly forbids filling. The
same applies to the AO LABELS on every rendered row: they must be suppressed or replaced with
`Understanding` / `Analysis` / `Evaluation` on this board, because printing "AO2" to an SQA student is
a factual error.

### 7.5 MEDIUM — `MULTIQ_RESPONSE_TARGETS` and the word-count machinery
- **RUAE and Critical Reading: add NO entry.** Neither paper sets any length guidance, so there must be
  no target, no ceiling and no halt. If a generic default fires for a language-family paper, gate it off
  for these two cells.
- **Portfolio: the direction is INVERTED.** The rule is a MAXIMUM of 1,000 words with **no minimum**, and
  a penalty above 1,100 (+10%). The existing `_sectionBWcCeiling` computes an UNDER-length ceiling and
  would be actively wrong here. What this cell needs is an OVER-length notice: report the count against
  1,000 and flag above 1,100. **SQA does not publish the penalty's size — do not invent a rate.**

### 7.6 MEDIUM — pre-chain goal options and recall rotation
- `PRECHAIN_GOAL_OPTIONS_LANG` exists in BOTH pipelines (~6418 + ~14755) and is P1-worded. Each SQA cell
  needs its own paper-true options — they are written out in each protocol's §2b and must be copied to
  **both** sites (dual-pipeline rule).
- Recall-target rotation (router setup ~5713 + frontend `_recallTargetQ` ~643) — the rotations are in each
  protocol's §2c: RUAE *the 6-mark own-words question → the conclusion question → the link question → a
  4-mark analysis question*; Critical Reading *the commonality question → the essay task → the first
  extract question → the essay task's second half*; the Portfolio has one unit and needs no rotation. The
  two sites must stay identical.

### 7.7 MEDIUM — ladder gate legs (`_ladderActive`, `_LADDER_QUESTION_ORDERS`, `_ladderRegistry`)
All three cells are **new families**, so each needs a gate leg, an order entry and a registry function
(`PLANNING-LADDER-PORT-RECIPE.md` §0). Orders: RUAE `['q1'…'q9']` (exam order); Critical Reading
`['extract', 'commonality', 'bodies', 'intro', 'conclusion']` (bodies-first, per the lit ruling);
Portfolio `['frame', 'beats']`. Element TYPES are declared in each protocol's LENS REGISTRY and its FADE
paragraph — RUAE and CR share `effect-on-reader` deliberately so Section 1 practice opens the essay's
twin at L2.

### 7.8 LOW — `$SLUG_ALIASES` (`class-rest-api.php`)
There is no `sqa` entry today. If the live lessons end up carrying a different slug form from §6's
proposals (e.g. `sqa_ruae` or `n5_ruae`), add ONE alias line each rather than forking any resolver —
canonical must be whatever form live `user_meta` keys use, and must never be flipped afterwards.

---

## 8 · THE TWO ENGINE PROPOSALS THE BRIEF ASKS FOR, BYTE-EXACT

### 8a · `resolve_protocol_group()` — `includes/class-protocol-router.php` ~3277

Replace the existing `'sqa'` block with this. **The three added lines are `ruae`, `writing` and the
two aliases**; everything else is byte-identical to what is there now.

```php
            'sqa' => [
                'ruae'                  => 'ruae',
                'reading_for_uae'       => 'ruae',
                'critical_reading'      => 'critical-reading',
                'writing'               => 'writing',
                'portfolio_writing'     => 'writing',
                'shakespeare'           => 'shakespeare',
                'modern_text'           => 'modern',
                '19th_century'          => '19th_century',
                'poetry_anthology'      => 'poetry',
                'unseen_poetry'         => 'unseen',
                'language1'             => 'language1',
                'language2'             => 'language2',
            ],
```

**MEASURED NOTE, so nobody treats this as the blocker it is not:** the method's fallback is
`return sanitize_key($subject) ?: 'literature';` (~3332), so a lesson whose subject is `ruae` or
`writing` **already resolves to `protocols/sqa/ruae` / `protocols/sqa/writing` today**, via the
fallback, with an `error_log` line. The map entry is still worth adding — a documented route beats a
fallback, and `reading_for_uae` / `portfolio_writing` cover the obvious naming drift — but the route is
not dead without it.

### 8b · `protocols/shared/language-paper-specs.json` — a new top-level `sqa` block

Insert alongside the other boards. ⚠️ **Read the two shape deviations before merging:** this file's
schema assumes an `aos` array per question, and **SQA has no assessment objectives** — so `aos` is `[]`
everywhere and a `skills` array carries the truth. And `tariffs_vary_per_sitting` is a new key, added
because recording one sitting's numbers as canonical is exactly how a wrong tariff set became
canonical before (the totals-check warning in `PROTOCOL-QUESTION-STRUCTURE-MAP.md`). If the engine lane
prefers not to extend the schema, drop `skills` and `tariffs_vary_per_sitting` and keep the note in
`source` — but do **not** fill `aos` with invented labels.

```json
  "sqa": {
    "_provenance": "SQA National 5 English. RUAE + Critical Reading from the 2025 Finalised Marking Instructions (Sophicly Etch Mark Scheme Resources/SQA English National 5 …); Portfolio from the Course Specification v6.0 and the Portfolio assessment task v3.0 (protocols/sqa/_sources/). Tariff citations: protocols/_marks/sqa__{ruae,critical_reading,writing}.json. Ported 2026-09-13 by the SQA content lane.",
    "_no_assessment_objectives": "SQA National 5 English has NO numbered assessment objectives. The skills are understanding, analysis and evaluation (content and style on the portfolio). Every `aos` array below is deliberately empty; `skills` carries the truth. Never print an AO label for this board.",
    "ruae": {
      "verified": true,
      "source": "SQA 2025 Finalised Marking Instructions X824/75/11 + question paper; 2024 and 2023 papers read for the recurring pattern",
      "total": 30,
      "time_minutes": 60,
      "tariffs_vary_per_sitting": true,
      "sections": [
        {
          "label": "Reading for Understanding, Analysis and Evaluation",
          "marks": 30,
          "questions": [
            { "id": "Q1", "marks": 2, "aos": [], "skills": ["understanding"], "type": "own_words", "description": "Using your own words as far as possible, explain … You should make N key points." },
            { "id": "Q2", "marks": 4, "aos": [], "skills": ["analysis"], "type": "analysis_two_examples", "description": "By referring to one example of word choice and one example of sentence structure, explain how …" },
            { "id": "Q3", "marks": 2, "aos": [], "skills": ["analysis"], "type": "link", "description": "By referring to any part of this sentence, explain how it helps to provide a link between the writer's ideas." },
            { "id": "Q4", "marks": 4, "aos": [], "skills": ["understanding"], "type": "own_words", "description": "Using your own words as far as possible, summarise …" },
            { "id": "Q5", "marks": 2, "aos": [], "skills": ["analysis"], "type": "analysis_one_example", "description": "By referring to one example of language, explain how …" },
            { "id": "Q6", "marks": 6, "aos": [], "skills": ["understanding"], "type": "own_words", "description": "Using your own words as far as possible, explain …" },
            { "id": "Q7", "marks": 4, "aos": [], "skills": ["understanding"], "type": "own_words", "description": "Using your own words as far as possible, explain …" },
            { "id": "Q8", "marks": 4, "aos": [], "skills": ["analysis"], "type": "analysis_two_examples", "description": "By referring to two examples of language, explain how …" },
            { "id": "Q9", "marks": 2, "aos": [], "skills": ["evaluation"], "type": "conclusion_evaluation", "description": "Select any expression from these lines and explain how it contributes to the passage's effective conclusion." }
          ]
        }
      ]
    },
    "critical_reading": {
      "verified": true,
      "source": "SQA 2025 Finalised Marking Instructions X824/75/12 + question paper; 2024 and 2023 read — the 8-mark commonality formula is printed identically",
      "total": 40,
      "time_minutes": 90,
      "tariffs_vary_per_sitting": true,
      "sections": [
        {
          "label": "Section 1: Scottish text",
          "marks": 20,
          "questions": [
            { "id": "Q1", "marks": 4, "aos": [], "skills": ["analysis"], "type": "extract_analysis", "description": "By referring to two examples of language, explain how … (the 12 extract marks split differently for every text)" },
            { "id": "Q2", "marks": 4, "aos": [], "skills": ["analysis"], "type": "extract_analysis", "description": "By referring to two examples of language, explain how …" },
            { "id": "Q3", "marks": 4, "aos": [], "skills": ["analysis"], "type": "extract_analysis", "description": "By referring to two examples of language, explain how …" },
            { "id": "Q4", "marks": 8, "aos": [], "skills": ["analysis", "evaluation"], "type": "commonality", "description": "By referring to this extract and to elsewhere in the text, show how … Commonality 2 + extract 2 + elsewhere 4; maximum of 2 marks only for discussion of extract." }
          ]
        },
        {
          "label": "Section 2: Critical essay",
          "marks": 20,
          "questions": [
            { "id": "S2", "marks": 20, "aos": [], "skills": ["understanding", "analysis", "evaluation"], "type": "critical_essay_level_based", "description": "One essay from Drama/Prose/Poetry/Film and TV Drama/Language, on a different genre from Section 1. Five bands 20-18/17-14/13-10/9-5/4-0; minimum standards not met caps the mark at 9." }
          ]
        }
      ]
    },
    "writing": {
      "verified": true,
      "source": "SQA National 5 English Course Specification v6.0 + Portfolio-writing assessment task v3.0 (protocols/sqa/_sources/)",
      "total": 30,
      "time_minutes": null,
      "coursework": true,
      "word_maximum": 1000,
      "word_minimum": null,
      "over_length_penalty_above": 1100,
      "sections": [
        {
          "label": "Portfolio-writing",
          "marks": 30,
          "questions": [
            { "id": "W1", "marks": 30, "marked_out_of_before_doubling": 15, "aos": [], "skills": ["content", "style"], "type": "portfolio_piece_level_based", "description": "ONE piece of no more than 1,000 words, broadly creative OR broadly discursive. Holistic best-fit band out of 15 (15-13/12-10/9-7/6-4/3-1), then doubled. Satisfactory technical accuracy is a requirement for the 9-7 band." }
          ]
        }
      ]
    }
  },
```

---

## 9 · PROPOSED EDITS TO FILES I MAY NOT TOUCH (with the quote that forces each)

1. **`PROTOCOL-STANDARD.md` §E2 (the template table).** It has no row for a **point-marked reading
   paper with no level descriptors** and no row for **level-marked coursework**. Suggested additions:
   *"point-marked short-answer reading paper (SQA RUAE) → LANGUAGE anchor, but Standard Alignment
   quoting the mark formula in place of Level Alignment, and no penalty deductions"* and
   *"level-marked single-piece coursework (SQA Portfolio) → AQA P1 Q5 holistic model, with the
   board's own best-fit rule and the student's band self-assessment before the mark"*.
2. **`PROTOCOL-STANDARD.md` A6 / the penalty machinery.** The standard assumes deductions exist.
   Suggested one-line carve-out: *"On a board whose marking instructions state that marks are not
   deducted (SQA: 'they are not deducted from a maximum on the basis of errors or omissions'), the
   penalty registry applies as NAMED FAULTS with worked fixes and no mark change; `Total penalties: −0`
   is the correct output."*
3. **`PROTOCOL-STANDARD.md` B-COMMON.6 (Level Alignment).** Add: *"Where the paper publishes no level
   descriptors at all, quote the mark formula as Standard Alignment and say 'no descriptor available'
   — never borrow a band from another component of the same qualification."*
4. **`PEDAGOGY.md` §19.** Worth recording that the ruling now has a second, exam-facing application:
   on a level-marked component the student picks the best-fit BAND and quotes the sentence that makes
   them say so, **before** any mark is revealed. Implemented in both level-marked SQA cells.
5. **`PROTOCOL-QUESTION-STRUCTURE-MAP.md`.** It has no SQA rows. §2 of this report is the data; the
   load-bearing addition is the warning that **RUAE tariffs change every sitting and Critical Reading
   extract splits change per text**, so a recorded row must be dated and labelled per sitting.
6. **`PROTOCOL-COVERAGE-MATRIX.md`.** Three rows to add, with assessment/planning = built-and-gated,
   polishing = rubric written / router row pending, documents = **not opened in a browser**, and every
   engine dependency in §7 listed as open.
7. **`protocols/shared/modules/foundation.md`.** Not an SQA problem to fix, but worth flagging: it is
   the **AQA Literature** foundation serving as the shared default (17 AQA mentions, AQA set-text
   lists, six AQA levels, *"Never accept 'I don't know'"*). Any board that loads it inherits false
   facts and a rule that contradicts the C-LADDER. SQA now shadows it with
   `protocols/sqa/_shared/foundation-sqa.md`; the other boards do not.

---

## 10 · UNRESOLVED DECISIONS (for Neil or the engine lane — none of these is guessed at in the files)

1. **Directory names.** I created `protocols/sqa/ruae/` and `protocols/sqa/writing/`, as the brief's
   first option. The alternative was reusing the resolver's existing `language1`/`language2` names,
   which resolve with zero engine change but would mean calling a Portfolio "language2". I chose
   accuracy and wrote the map entry (§8a) — and measured that the fallback already reaches both
   directories, so the cost of the choice is an `error_log` line until the entry lands.
2. **Does an empty `aos` array drop the Context row and suppress AO labels?** §7.4. I could not test
   it without running `.js`. If it does not, an SQA essay renders a box the protocol forbids filling.
3. **The Performance–spoken language component is out of scope and unbuilt.** It is a compulsory
   requirement for a course award, assessed achieved/not achieved, and nothing in WML addresses it. Not
   a defect of this port; a gap in the qualification's coverage that should be a named row.
4. **Which Scottish texts our students actually study.** SQA's prescribed list covers drama, prose and
   poetry; we have model answers for exactly four poets. Knowing the real set would tell us where the
   GOLD MISSING gaps actually hurt.
5. **The critical-essay genre split.** A student must use two different genres across the paper. If our
   course pairs a poetry Scottish text with a poetry essay, the lesson itself breaks an exam rule. The
   protocol names it as a procedural warning and marks on merit; whether the COURSE should prevent the
   pairing is a curriculum decision.
6. **Portfolio conditions in a Sophicly context.** The board requires the first draft to be written in
   class under supervision and forbids the teacher supplying ideas, structure, rephrasing or
   corrections. Our polishing environment is deliberately built behind that line — but whether a
   Sophicly student's portfolio is submitted to SQA at all, and therefore whether those conditions
   bind us, is Neil's call. If it is practice only, the cell could be loosened; **I have assumed it is
   real coursework, because assuming the looser case would breach the board's conditions if I were
   wrong.**
7. **The 2024 RUAE marking instructions 404.** If someone has that PDF, the 2024 per-question notes
   should be read to confirm the type system a third time from the marking side rather than the paper
   side.

---

## 11 · UNTESTED ROUTES (literal — nothing below has been observed)

- **No chat endpoint was called.** No assessment, planning or polishing turn has been run for any SQA
  cell, on staging or anywhere.
- **No document was opened in a browser.** Whether an SQA lesson renders the paper's sections, the
  plan/outline shape, or a spurious Context box is **unknown**.
- **`_journeys-2026-09-13.json` has not been run.** Eight journeys across the three cells (RUAE
  analysis, own-words, link, conclusion; CR extract, commonality, essay; Portfolio creative,
  discursive), each with weak/partial/strong/valid-but-different responses and explicit must / must-not
  lists. Quotations in them are verbatim from the 2025 papers I read; the student prose is mine.
- **No real lesson state was measured.** `PLANNING-LADDER-PORT-RECIPE.md` §2 asks for the real
  shortcode off the target environment. I have no environment access from this lane, so §6's subject
  and text slugs are **proposals triangulated from the census convention**, not measured values —
  recorded as such per recipe gap 6.
- **The outline and plan filing is engineered but unwitnessed**, and for RUAE and the Portfolio it
  cannot work at all until §7.1/§7.2 land. Critical Reading's essay half (24 fan-out ids) resolves
  today but has not been driven.
- **No `php -l` or `node --check` was needed** — I wrote no PHP and no JS. The four JSON files I wrote
  all parse (`JSON.parse`, checked).
- **Prod/staging data:** not queried. No claim in this report rests on a database.
