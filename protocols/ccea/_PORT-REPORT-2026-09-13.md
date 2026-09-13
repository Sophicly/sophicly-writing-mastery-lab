# CCEA PORT REPORT — 2026-09-13

**Lane:** CCEA content lane (PORT BRIEF §6 addendum). **Branch:** `ports-2026-09-13`, worktree
`scratchpad/wml-ports`. **Nothing committed, nothing deployed, no version bumped** (WML CLAUDE.md
§PARALLEL LANES — content lanes do not ship). Facts only; "not tested" is written where it is true.

---

## 0 · WHAT SHIPPED THIS CYCLE, IN ONE TABLE

| qualification / paper | assessment | planning | polishing rubric | marks JSON | journeys |
|---|---|---|---|---|---|
| **Language Unit 1 (GEN11)** | ✅ new, audit **10/10** | ✅ new, C-CHECKS **8/8** | ✅ `rubric-ccea-lang-u1-nonfiction.md`, D-CHECKS 6/6 | ✅ green | ✅ 4 question types |
| **Language Unit 4 (GEN41)** | ✅ new, audit **10/10** | ✅ new, C-CHECKS **8/8** | ✅ `rubric-ccea-lang-u4-fiction.md`, D-CHECKS 6/6 | ✅ green | ✅ 2 question types (+1 with a source gap) |
| **Literature Unit 1 (GEL11)** Prose + Unseen Prose | ⛔ existing monoliths, still **2/10** | ⛔ still **1/8** | ⛔ not authored | ✅ green | ⛔ none |
| **Literature Unit 2 (GEL21)** Drama + Poetry | ⛔ no cell exists | ⛔ none | ⛔ not authored | ✅ green | ⛔ none |
| **Literature Unit 3** | ⛔ see §8 — probably not an exam paper at all; unconfirmed | — | — | — | — |

**Priority call, stated openly (brief §2 "prefer one complete paper to two half papers"):** the two
LANGUAGE units were taken to completion because they are the brief's named primary deliverable and
because neither existed at all. The four LITERATURE papers received the evidence layer (tariffs quoted
from the board's own documents, gated) and nothing else. Literature Unit 2 needs two new protocol cells
from scratch; Literature Unit 1 needs two monoliths rewritten. Both are named as gaps rather than
rounded up.

---

## 1 · PROVENANCE (PROTOCOL-STANDARD E1.3 — unstated provenance does not ship)

**⚠️ CCEA mark schemes are NOT on the Sophicly drive** (confirmed by the brief and by search). Every
document below was downloaded from the board's own past-paper library on **2026-09-13** and saved under
`protocols/ccea/_sources/` so the provenance is on disk, not on a URL.

| paper | document | series / code | saved as |
|---|---|---|---|
| Lang Unit 1 | mark scheme | Summer 2025, [GEN11], Wed 7 May am, 14574.01 F | `ccea-lang-unit1-summer2025-MS.pdf` |
| Lang Unit 1 | question paper | Summer 2025, [GEN11] | `ccea-lang-unit1-summer2025-paper.pdf` |
| Lang Unit 1 | mark scheme (2nd series) | Summer 2024, 14204.01 F | `ccea-lang-unit1-summer2024-MS.pdf` |
| Lang Unit 1 | question paper (2nd series) | Summer 2024, Wed 8 May am | `ccea-lang-unit1-summer2024-paper.txt` (text, pre-existing) |
| Lang Unit 4 | mark scheme | Summer 2025, [GEN41], Tue 20 May am, 14575.01 F | `ccea-lang-unit4-summer2025-MS.pdf` |
| Lang Unit 4 | question paper | Summer 2025, [GEN41] | `ccea-lang-unit4-summer2025-paper.pdf` |
| Lang Unit 4 | mark scheme (2nd series) | **November 2024**, 14841.01 F | `ccea-lang-unit4-november2024-MS.pdf` |
| Lang Unit 4 | question paper (2nd series) | Summer 2024, Mon 20 May am | `ccea-lang-unit4-summer2024-paper.txt` (text, pre-existing) |
| Lit Unit 1 | mark scheme | Summer 2025, [GEL11], Mon 12 May am, 14576.01 F | `ccea-lit-unit1-summer2025-MS.pdf` |
| Lit Unit 1 | question paper | Summer 2025, [GEL11] | `ccea-lit-unit1-summer2025-paper.pdf` |
| Lit Unit 1 | mark scheme (2nd series) | Summer 2024 | `ccea-lit-unit1-summer2024-MS.pdf` |
| Lit Unit 2 | mark scheme | Summer 2025, [GEL21], Thu 29 May am, 14577.01 F | `ccea-lit-unit2-summer2025-MS.pdf` |
| Lit Unit 2 | question paper | Summer 2025, [GEL21] | `ccea-lit-unit2-summer2025-paper.pdf` |
| Lit Unit 2 | mark scheme (2nd series) | Summer 2024 | `ccea-lit-unit2-summer2024-MS.pdf` |

URL pattern, recorded so the next lane does not have to search:
`https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20English%20{Language|Literature}%20(2017)/{2025-Summer|2024-Summer|2024-November}/Standard/0/GCSE-English%20{Language-490|Literature-493}-{Series}-Unit%20{N},%20{Full%20Unit%20Title}-{MS|Paper}.pdf`

### ⛔ SOURCE GAPS — recorded, not glossed (E1.5)

1. **The Summer 2024 Unit 4 MARK SCHEME could not be retrieved.** The URL pattern that resolves for
   every other Unit 1, Unit 4 and Literature paper returns the site's 404 HTML page for that one file.
   Three filename variants tried (`Non-fiction`, `Non-Fiction`, trailing space before `-MS`). The
   **November 2024** mark scheme was obtained instead and confirms the identical tariff set, so the
   two-series requirement is met by a different second series, and the Summer 2024 QUESTION PAPER text
   is on disk and prints the same tariffs.
2. **The Unit 4 Task 2 INSERT is not published with the question paper.** Tasks 3 and 4's article is
   printed inside the paper; the two literary extracts for the 32-mark comparison are on a separate
   insert which the Past-Papers download does not include. Consequence: the Task 2 journeys in
   `_journeys-2026-09-13.json` carry **no source quotations** and test the comparative shape only. No
   extract text was invented.
3. **The Unit 1 Task 5 media IMAGE is removed from the published PDF** for copyright ("DVD front cover
   of film 'Hugo' removed due to copyright find image on link below"). The mark scheme's own list of
   creditable features and explanations IS published, so the rubric and the journeys work from that and
   invent no visual detail.
4. **No specification PDF was obtained.** The spec download URL guessed from the Specifications path
   returned HTML. Unit and component NAMES in every file written here are taken from the question
   papers' own covers, which print them in full ("Unit 1 Writing for Purpose and Audience and Reading
   to Access Non-fiction and Media Texts"; "Unit 4 Personal or Creative Writing and Reading Literary
   and Non-fiction Texts"; "Unit 1 The Study of Prose"; "Unit 2 The Study of Drama and Poetry"), so the
   names the brief asked to be confirmed ARE confirmed — from the papers, not from the spec.
5. **⛔ GOLD MISSING for both Language units.** `Model Answers/CCEA/` on the drive holds model answers
   for CCEA **Literature only** (Lord of the Flies, Animal Farm, To Kill a Mockingbird, Of Mice and Men,
   About a Boy, How Many Miles to Babylon?, Blood Brothers, An Inspector Calls, Journey's End, Curious
   Incident, DNA, Leave Taking, Taste of Honey, and the Identity / Relationships / Conflict poetry
   anthologies). There is **no CCEA English Language model answer anywhere on disk**. Both rubrics and
   both protocols state this in place and route `compare-gold-standard` to the CL5 strand wording plus
   the board's own indicative bullets instead, with an explicit ban on presenting another board's model
   as CCEA's.

---

## 2 · QUESTION-BY-QUESTION MAP

### Language Unit 1 (GEN11) — 150 marks, 1 h 45 min. **Writing FIRST, then reading.**

| task | engine label | marks | CCEA objective | board's marking method | shape we teach | template used | gold |
|---|---|---|---|---|---|---|---|
| Task 1 — Writing for Purpose and Audience | `Q1` | **87** = 57 + 30 | Writing AO4 (i)(ii)(iii) | two CL strand sets → two grids | IUMVCC, six sections | AQA P2 Q5 transactional (E2 row "transactional / viewpoint writing") | ⛔ GOLD MISSING |
| Task 2 — Reading Non-fiction, craft | `Q2` | **21** | Reading AO3 (i)(ii)(iii) | three CL strands → Task 2 grid | 3 analysis paragraphs × 6 sentences | LANGUAGE anchor Q2/Q3 (E2 "single-source language analysis") | ⛔ GOLD MISSING |
| Task 3 — own words + evidence | `Q3` | **12** = 4+2+4+2 | Reading AO3 (i)(ii) | task-specific checklist + 4-step best-fit | 2 reasons, 2 pieces of evidence each | AQA P1 Q1 retrieval-family, LEAN | n/a (no golds on a retrieval-family task) |
| Task 4 — Reading Media, language | `Q4` | **20** | Reading AO3 (i)(ii)(iii) | three CL strands → **Task 4 grid** | 3 analysis paragraphs × 6 sentences | LANGUAGE anchor Q2/Q3 | ⛔ GOLD MISSING |
| Task 5 — presentational features | `Q5` | **10** = 1+4+1+4 | Reading AO3 (i)(iii) | checklist + 4-step best-fit | 2 specific features, 1 effect each | AQA P1 Q1 retrieval-family, LEAN-plus | n/a |

**What changed and why.** Nothing existed: `protocols/ccea/language1/` was created. Board wordings for
Summer 2025: Task 1 "Write a speech for your classmates persuading them to agree with your views on the
following question: 'Is homework still necessary for students today?'"; Task 2 "Explain how the writer
has presented this in a way that engages his readers' interest"; Task 3 "In your own words, write down
two reasons why the writer thinks toasties are appealing: one reason from each paragraph"; Task 4
"Explain how language has been used to develop a sense that this DVD would be exciting to watch";
Task 5 "Select two examples of presentational features … Explain the intended effect".

### Language Unit 4 (GEN41) — 150 marks, 1 h 45 min. **Writing FIRST; Task 2 is 32 of the 62 reading marks.**

| task | engine label | marks | CCEA objective | board's marking method | shape we teach | template used | gold |
|---|---|---|---|---|---|---|---|
| Task 1 — Personal OR Creative Writing | `Q1` | **88** = 58 + 30 | Writing AO4 (i)(ii)(iii) | two CL strand sets → two grids | (b) seven scene elements · (a) personal-essay arc | AQA P1 Q5 narrative (E2 "narrative / descriptive writing") | ⛔ GOLD MISSING |
| Task 2 — the comparison, two literary extracts | `Q2` | **32** | Reading AO3 (i)(ii)(iii) | three CL strands → Task 2 grid | 3 comparative paragraphs × 8 sentences | AQA P2 Q4 comparative TTECEA, ONE effect per source | ⛔ GOLD MISSING |
| Task 3 — gained AND held interest | `Q3` | **15** | Reading AO3 (i)(ii)(iii) | three CL strands → the 15-mark grid | 3 analysis paragraphs × 6 sentences | LANGUAGE anchor Q2/Q3 | ⛔ GOLD MISSING |
| Task 4 — a NAMED view | `Q4` | **15** | Reading AO3 (i)(ii)(iii) | three CL strands → the same 15-mark grid | 3 analysis paragraphs × 6 sentences | LANGUAGE anchor Q2/Q3 | ⛔ GOLD MISSING |

### Literature Unit 1 (GEL11) — 60 marks, 1 h 45 min

| question | marks | objectives | notes |
|---|---|---|---|
| Section A — Novel, one of seven, (a) or (b) | **40** | **AO1 + AO2 only** | Fixed command wording across every text: "With reference to the ways [author] presents [subject], show how far you agree that …". The novel is NOT allowed in the exam. 1 hour. |
| Section B — Unseen Prose, compulsory | **20** | **AO1 + AO2 only** | "Show how the writer of the extract engages the reader", with two bullets. 15 min reading + 30 min writing. |

### Literature Unit 2 (GEL21) — 80 marks, 2 h

| question | marks | objectives | notes |
|---|---|---|---|
| Section A — Drama, one of seven, (a) whole-text or (b) extract-and-elsewhere | **40** | **AO1 + AO2 only** | Unannotated text allowed. |
| Section B — Poetry, one anthology of three, (a) or (b) | **40** | **AO1 + AO2 + AO3 comparison + AO4 context** | One poem is named; the STUDENT chooses the second. "You should include relevant contextual material" is printed in every option — that clause is AO4's trigger. |

⭐ **The fact a Literature port must not get wrong:** Unit 2's two sections do NOT assess the same
objectives. Drama has two matrix rows; Poetry has four. Marking a drama answer for comparison or
context, or a poetry answer without them, is marking the wrong thing.

---

## 3 · THE CCEA DELTA — where the mark scheme beat the template (PROTOCOL-STANDARD E2)

1. **CCEA Language marks by COMPETENCE LEVEL STRANDS, not points.** Three named strands at CL0–CL5,
   then a published mark grid converts the three-digit combination to a mark range. There is no
   per-element 0.5 arithmetic anywhere on either Language unit except Unit 1's Tasks 3 and 5, which are
   genuinely checklist-marked.
   **How both protocols reconcile that with the platform's mark auditor:** the criteria table's rows
   ARE the board's strands; the Worth column is each strand's share of the task total so the worths sum
   exactly (Task 2: 7+7+7=21 · Task 4: 7+7+6=20 · U1 Task 1: 19×3=57 and 10×3=30 · U4 Task 1: 20+19+19=58
   and 10×3=30 · U4 Task 2: 11+11+10=32 · U4 Tasks 3/4: 5+5+5=15); and the Your Score column is filled
   by distributing **the grid mark** across those rows so the three scores sum to it exactly. The grid
   mark is the authority; the split exists so the student sees which strand cost them AND so the
   engine's own recompute agrees with the board's number.
2. **Penalty codes are FLAGGED, never deducted.** CCEA marks positively and the mark is a grid lookup,
   so a deduction would contradict the board's own number. Every card carries `Total penalties: −0`, and
   every flag instead NAMES the strand it pulled down and the grid consequence. This satisfies ONE
   FAULT, ONE CHARGE by construction, and it is a stronger teaching move than an arbitrary −0.5 because
   it is true. **This is a DECISION FOR NEIL — see §7.1.**
3. **No word-count ceiling, and the protocols promise none.** CCEA prints only timings. The engine
   computes a ceiling only for papers registered in `MULTIQ_RESPONSE_TARGETS`, and CCEA is not
   registered — so a protocol that promised a ceiling would state a rule whose engine trigger never
   fires, which PORT SOP §E calls a FAIL. Both protocols therefore state explicitly that no ceiling
   exists and forbid mentioning a word target as a rule. **Registering targets is a DECISION FOR NEIL
   — see §7.2.**
4. **CCEA's level descriptions are CUMULATIVE and the board says so:** "Each successive level
   description assumes the continued demonstration of the qualities described in the lower levels."
   That is the opposite of a board whose descriptors restate the same dimensions at rising quality, and
   it is why the self-assessment climb (PEDAGOGY §19/§35) starts at CL1 and asks "is your answer still
   better than this description?" at each rung. The words *hurdle*, *unlock* and *pass this level* are
   banned in both protocols and both rubrics.
5. **Paragraph counts are OURS, not the board's.** CCEA prints no paragraph requirement. Three
   paragraphs on each analysis task is a Sophicly shape sized to the board's own per-task timings
   (15, 17, 12 and 12 minutes) and to the CL5 demand for "precise and judicious selection of examples".
   It is labelled as ours everywhere it appears. **DECISION FOR NEIL — see §7.3.**

---

## 4 · FILES WRITTEN (all new unless marked)

**Language Unit 1 — `protocols/ccea/language1/`**
- `manifest.json`
- `modules/foundation-u1.md`
- `modules/protocol-a-assessment.md`
- `modules/knowledge-mark-scheme-u1.md` (CCEA's strands, grids, descriptors and indicative lists, verbatim)
- `planning/protocol-b-planning.md`

**Language Unit 4 — `protocols/ccea/language2/`**
- `manifest.json`
- `modules/foundation-u4.md`
- `modules/protocol-a-assessment.md`
- `modules/knowledge-mark-scheme-u4.md`
- `planning/protocol-b-planning.md`

**Polishing rubrics — `protocols/shared/modules/rubrics/`**
- `rubric-ccea-lang-u1-nonfiction.md`
- `rubric-ccea-lang-u4-fiction.md`

**Tariff evidence — `protocols/_marks/`**
- `ccea__language_u1.json` · `ccea__language_u4.json` · `ccea__literature_u1.json` · `ccea__literature_u2.json`

**Sources — `protocols/ccea/_sources/`** — eleven PDFs added (listed in §1).

**This lane's own docs — `protocols/ccea/`**
- `_journeys-2026-09-13.json`
- `_PORT-REPORT-2026-09-13.md` (this file)

**Deliberately NOT touched:** any `.js` or `.php`; `protocols/aqa/**`; other boards' directories;
`PROTOCOL-STANDARD.md`; `PEDAGOGY.md`; `PROTOCOL-QUESTION-STRUCTURE-MAP.md`;
`PROTOCOL-COVERAGE-MATRIX.md`; `protocols/shared/language-paper-specs.json`;
`protocols/shared/literature-paper-specs.json`; `protocols/ccea/prose/**`;
`protocols/ccea/unseen-prose/**`. No `protocol-c-polishing.md` was created for either new cell — there
is no walk file to retain, so the retained-source law is satisfied by absence (both manifests carry
`polishing.always: []` with a `_retired` note explaining it).

---

## 5 · GATE OUTPUT (pasted, not summarised)

```
$ node bin/tariff-gate.js --only ccea

✔ tariff-gate: 4 paper(s) gated, 102 checks, every mark quoted from the board's own document
```

```
$ node bin/tariff-gate.js            # whole repo, to prove nothing else broke
✔ tariff-gate: 21 paper(s) gated, 616 checks, every mark quoted from the board's own document
(the only notes are OCR's six "no Assessment Sub-Protocol: Question N section" warnings and the
 two pre-existing UNGATED rows aqa/language_p1 and aqa/language_p2 — none of them CCEA's)
```

```
$ node bin/protocol-standard-audit.js --board ccea
PROTOCOL-STANDARD audit — B-CHECKS (assessment) · C-CHECKS (planning) · D-CHECKS (polishing: ENV rubric pass/abs, else monolith)
board/subject                 ASSESS pass/abs  RG  FB  TMF  last      PLAN pass/abs  FC  GR  last   POLISH  ENV pass/abs rubric | monolith files bytes @ last
ccea/language1                10/10  8   7   6                        8/8  44  4                    —
ccea/language2                10/10  7   6   5                        8/8  72  5                    —
ccea/prose                    2/10  0   0   6    2026-06-27           1/8  0   0   2026-03-25       monolith 1 7808   0  2026-03-25
ccea/unseen-prose             2/10  0   0   5    2026-05-20           1/8  0   0   2026-03-25       monolith 1 3873   0  2026-03-25
```

```
$ grep -c "paste" protocols/ccea/language{1,2}/modules/protocol-a-assessment.md \
                  protocols/ccea/language{1,2}/planning/protocol-b-planning.md
protocols/ccea/language1/modules/protocol-a-assessment.md:0
protocols/ccea/language2/modules/protocol-a-assessment.md:0
protocols/ccea/language1/planning/protocol-b-planning.md:0
protocols/ccea/language2/planning/protocol-b-planning.md:0
```

```
$ node bin/essay-polishing-env-gate.js      # unchanged by this port; run to prove no regression
✅ essay-polishing-env-gate passed  (249 assertions, 0 failed)
```

**The polishing column reads `—` for both new cells and that is expected:** the audit prints an ENV
row only when the router's `essay_polishing_env` map already has a row whose `cell` is this
board/subject, and a content lane cannot add one. Both rubrics were checked against the six D-CHECKS by
hand and score **6/6** each (`## INLINE COACHING ACTIONS`, `Provenance`, `Mark Complete`,
`student chooses`, `macro → micro`, `no task menu` all present). The column will read
`ENV 6/6 rubric-ccea-lang-u1-nonfiction.md` the moment the row in §6.1 lands.

**Not run, and why:** `plan-fanout-harness`, `planning-keymatch-harness` and `ladder-check-harness`
require the engine-side registry rows this lane cannot add (§6.3), so they would fail for the right
reason and prove nothing. `bin/pre-ship-check.sh` was not run because no `.js` or `.php` was touched.

---

## 6 · WHAT THE ENGINE LANE MUST ADD (byte-exact)

### 6.0 ⭐ THE SLUG DECISION, MEASURED — and one engine map row that is genuinely needed

**`resolve_protocol_group()` already names both language cells.** The `'ccea' => [...]` block in
`includes/class-protocol-router.php` (~:3287) carries `'language1' => 'language1'` and
`'language2' => 'language2'`, and the bare-`language` fold above it (~:3204,
`preg_match('/(?:lang_)?paper_(\d)$/', …)`) turns a text slug's `_paper_N` suffix into the subject. So
Unit 1 resolves today with no change at all.

**⚠️ Unit 4 does NOT, and the reason is a §5d write-key / read-key mismatch between TWO engine
surfaces. Measured, not inferred:**

| surface | file:line | what it does with a CCEA `..._lang_paper_N` slug |
|---|---|---|
| Router group fold | `includes/class-protocol-router.php:3204` | `paper_4` → subject `language4` → `$map['ccea']['language4']` **does not exist** → falls through to `sanitize_key('language4')` → `protocols/ccea/language4/` MISSING |
| Frontend topic-data builder | `frontend/wml-assessment.js:~52277` (`buildSyntheticTopicData`, `boardLetterMap` has `ccea:'u'`) | `paper_4` → subject `language_u4` → `BOARD_FORMAT_DEFAULTS.ccea.language_u4` **exists** ✅ |
| the same builder, with `paper_2` | same | `paper_2` → `language_u2` → **no entry** → `getDefaultMarks` returns the 30-mark fallback |

So the two surfaces want **opposite** numbers in the slug, and the frontend's registries already
anticipate CCEA's real unit numbers (`language_u1` and `language_u4`, at
`frontend/wml-assessment.js:52151` and `:52228`). **The frontend wins, because it was written for
CCEA's own numbering and the router needs one line either way.**

**⭐ THE RECOMMENDATION:**

| lesson | text slug | why |
|---|---|---|
| CCEA Language **Unit 1** | `ccea_lang_paper_1` | folds to `language1` ✅ and to `language_u1` ✅ — works today |
| CCEA Language **Unit 4** | **`ccea_lang_paper_4`** | folds to `language_u4` ✅ (right topic data) and needs ONE new router map row (below) |

**The one router row that IS needed** — add to the `'ccea' => [...]` block:

```php
                'language4'             => 'language2',
```

with a comment explaining it: *CCEA calls this Unit 4, so its text slug ends `_paper_4` and the fold
produces `language4`; the CELL is `language2` because that is the map's own second-language-paper name
and what the frontend's `language_u4` topic data pairs with.*

⛔ **The alternative — slug `ccea_lang_paper_2` — is WRONG and this port initially had it.** It makes
the router work and silently breaks the frontend, which then builds a 30-mark synthetic topic for a
150-mark paper. Corrected 2026-09-13 after reading the frontend registries; every file in this port now
carries `ccea_lang_paper_4`.

**⛔⛔ AND TWO REAL ENGINE DEFECTS FOUND BY THE SAME READ — CCEA's language marks are recorded as 80.**
CCEA Units 1 and 4 are **150 marks each**, not 80. Both registries are wrong for all four keys:

```js
// frontend/wml-assessment.js:52151 — BOARD_DEFAULT_MARKS
ccea: { prose: 40, 'unseen-prose': 20, drama: 40, poetry: 40,
        language1: 80, language2: 80, language_u1: 80, language_u4: 80 },   // ← 80 is wrong, all four
// should read
ccea: { prose: 40, 'unseen-prose': 20, drama: 40, poetry: 40,
        language1: 150, language2: 150, language_u1: 150, language_u4: 150 },
```

```js
// frontend/wml-assessment.js:~52228 — BOARD_FORMAT_DEFAULTS.ccea
            language1:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO5,AO6' },
            language2:        { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO5,AO6' },
            language_u1:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO5,AO6' },
            language_u4:      { format: 'multi_question', marks: 80, aos: 'AO1,AO2,AO5,AO6' },
// should read (marks from the question papers, AOs from the mark schemes — see §6.4)
            language1:        { format: 'multi_question', marks: 150, aos: 'AO3,AO4' },
            language2:        { format: 'multi_question', marks: 150, aos: 'AO3,AO4' },
            language_u1:      { format: 'multi_question', marks: 150, aos: 'AO3,AO4' },
            language_u4:      { format: 'multi_question', marks: 150, aos: 'AO3,AO4' },
```

Both are pre-existing, neither was introduced by this port, and neither is something a content lane may
fix. They matter: a synthetic topic built at 80 marks for a 150-mark paper mis-bands every percentage.

**Nothing to alias.** `grep -rn 'ccea_lang\|ccea_unit'` over `sophicly-writing-mastery-lab.php` and
`includes/class-rest-api.php` returns nothing, and `$SLUG_ALIASES` has no CCEA language entry — there
are no existing CCEA language slugs to reconcile.

**Literature Unit 2 needs no map change either:** `modern_text → 'modern'` and
`poetry_anthology → 'poetry'` are already in the ccea block; only the directories
`protocols/ccea/modern/` and `protocols/ccea/poetry/` are missing.

### 6.1 ROUTER ROWS — `essay_polishing_env()`, the `$essay_polishing_rubrics` array

Add to `includes/class-protocol-router.php`, inside `$essay_polishing_rubrics`, after the
`aqa_lang_paper_2` row:

```php
            'ccea_lang_paper_1' => [
                'cell'   => 'ccea/language1',
                'rubric' => 'rubric-ccea-lang-u1-nonfiction.md',
                'gold'   => ['protocols/ccea/language1/modules/knowledge-mark-scheme-u1.md'],
                'engine' => 'language',
            ],
            'ccea_lang_paper_4' => [
                'cell'   => 'ccea/language2',
                'rubric' => 'rubric-ccea-lang-u4-fiction.md',
                'gold'   => ['protocols/ccea/language2/modules/knowledge-mark-scheme-u4.md'],
                'engine' => 'language',
            ],
```

⚠️ **`gold` points at the mark-scheme module, not a model-answer file, because none exists** (§1 gap 5).
That module carries the CL5 strand wording and the board's own indicative bullets, which is what both
rubrics tell `compare-gold-standard` to quote. When a CCEA Language model answer is authored, add it to
the array and leave the mark-scheme file in place.

### 6.2 CHIP LADDERS — `frontend/wml-selection-chip.js`

`ESSAY_POLISH_ENV_TEXTS` must equal the router map's keys (the gate asserts it across the two
languages), so:

```js
        const ESSAY_POLISH_ENV_TEXTS = ['aqa_lang_paper_1', 'aqa_lang_paper_2', 'ccea_lang_paper_1', 'ccea_lang_paper_4'];
```

**The ladder, both CCEA papers** — macro → micro, opening on `scan-structure`, ending on
`fixSpag, reference`, every button carrying a rubric row, and **`scan-context-drive` excluded** because
neither unit assesses context:

```js
        const isCcea = isLangEnv && (envText === 'ccea_lang_paper_1' || envText === 'ccea_lang_paper_4');
        if (isCcea) {
            // CCEA Unit 1 / Unit 4: the WRITING task is Q1, not Q5 — the `isSectionB` test above
            // cannot gate a writing-only button on these papers (see the note below).
            return [
                { key: 'langScan',       actions: ACTION_MAP.langScan },          // scan-structure, scan-elements, scan-coherence, scan-concept
                { key: 'elementPolish',  actions: ACTION_MAP.elementPolish },     // strengthen-hook, rephrase
                { key: 'langWordChoice', actions: isCceaWriting ? ACTION_MAP.langWordChoice : ACTION_MAP.langWordChoiceReading },
                { key: 'polishProse',    actions: ACTION_MAP.polishProse },       // strengthen-vocabulary, tighten, adjust-tone
                { key: 'fixSpag',        actions: ACTION_MAP.fixSpag },           // fix-spelling, fix-grammar, fix-punctuation
                { key: 'reference',      actions: ACTION_MAP.reference },         // explain, compare-gold-standard
            ];
        }
```

⭐ **THE ONE REAL BLOCKER IN THIS FILE, and it needs a decision, not a guess.** The existing gate is
`const isSectionB = q === 'Q5';` — it assumes the writing question is Q5. **On both CCEA papers the
writing task is `Q1`.** So `isCceaWriting` above does not exist yet; it needs
`const isCceaWriting = isCcea && q === 'Q1';`, or better, a per-paper writing-question key so no future
board has to special-case it:

```js
        // v7.20.6xx: the writing question is NOT Q5 on every board — CCEA puts it FIRST (Q1).
        const WRITING_QUESTION = { aqa_lang_paper_1: 'Q5', aqa_lang_paper_2: 'Q5', ccea_lang_paper_1: 'Q1', ccea_lang_paper_4: 'Q1' };
        const isSectionB = q === (WRITING_QUESTION[envText] || 'Q5');
```

That one map also unlocks two groups this port deliberately did NOT ship rather than offer on a reading
paragraph, where the model could only refuse them (both are named in the rubrics as recommended
follow-ups, not silent drops):
- **Unit 1 Task 1 is transactional writing**, so the `devices` group (`device-suggest` + the twenty
  Madfather's Crops buttons) is pedagogically right there — exactly as it is on AQA P2 Q5.
- **Unit 4 Task 1 is narrative or personal writing**, so the CW scans (`check-sensory-variety`,
  `check-scene-structure-beats`, `check-show-dont-tell`) are the right addition there.

### 6.3 JS-ROWS SPEC (the format of `EDEXCEL-IGCSE-JS-ROWS-SPEC-2026-08-16.md`)

**Why this is needed:** both planning protocols emit `@FIELD_COMMIT` and `@FIELD_SET` markers, and a
commit with no outline row is a **silent no-op**. Until these rows land, **both CCEA planning cells are
inert and must not be reported as working.** Both protocols say so in their own headers.

**(a) `OUTLINE_CRITERIA` — the element sets.** Two new entries, following the AQA naming convention
exactly (`outline-body-<N>-<element>-q<N>`):

```
ccea_lang_u1_analysis   (Unit 1 Tasks 2 and 4 — 6 rows per paragraph, 3 paragraphs)
  1 Topic sentence                     outline-body-<N>-topic-q<Q>        AO3(iii)
  2 Technique + evidence + inference   outline-body-<N>-evidence-q<Q>     AO3(iii)
  3 Close analysis                     outline-body-<N>-analysis-q<Q>     AO3(iii)
  4 Effect on the reader 1             outline-body-<N>-effects-q<Q>      AO3(ii)
  5 Effect on the reader 2             outline-body-<N>-effects2-q<Q>     AO3(ii)
  6 The writer's purpose               outline-body-<N>-purpose-q<Q>      AO3(ii)
  Q ∈ {2, 4} for Unit 1 · Q ∈ {3, 4} for Unit 4 · N ∈ {1, 2, 3}

ccea_lang_u4_comparative (Unit 4 Task 2 — 8 rows per paragraph, 3 paragraphs)
  1 Comparative topic sentence         outline-body-<N>-topic-q2          AO3(i)
  2 Text A technique + evidence        outline-body-<N>-a-evidence-q2     AO3(iii)
  3 Text A effect on the reader        outline-body-<N>-a-effect-q2       AO3(ii)
  4 Text B pivot + technique + evidence outline-body-<N>-b-evidence-q2    AO3(iii)
  5 Text B effect on the reader        outline-body-<N>-b-effect-q2       AO3(ii)
  6 The pair developed                 outline-body-<N>-pair-q2           AO3(i)
  7 Close analysis                     outline-body-<N>-analysis-q2       AO3(iii)
  8 The two writers' purposes compared outline-body-<N>-purpose-q2        AO3(ii)
```

**(b) The writing-task element sets.**

```
Unit 1 Task 1 — IUMVCC. REUSES the ids the engine already carries for this framework, so
`_planOutlineTargets` may need only a paper key, not new ids:
  outline-iumvcc-intro · outline-iumvcc-urgency · outline-iumvcc-method-point-1 ·
  outline-iumvcc-method-point-2 · outline-iumvcc-method-point-3 · outline-iumvcc-vision ·
  outline-iumvcc-counter · outline-iumvcc-conclusion
  ⚠️ VERIFY, do not assume: those rows are built by AQA P2's template builder keyed on that paper.
  If the builder is paper-keyed, CCEA needs the key adding, not the ids.

Unit 4 Task 1 — TWO alternative sets; exactly ONE is used per session, chosen by the option the
student wrote (the document shows it — never ask):
  (b) creative: outline-u4-story-hook · -setup · -reaction · -epiphany · -proaction · -climax · -denouement
  (a) personal: outline-u4-personal-opening · -subject · -change · -turn · -close
```

**(c) Plan boxes (`@FIELD_SET` targets) and the `_planOutlineTargets` fan-out.**

```
Unit 1: plan-Q1-writing → the eight iumvcc outline ids
        plan-Q2-para-1 / -2 / -3 → that paragraph's six -q2 ids
        plan-Q4-para-1 / -2 / -3 → that paragraph's six -q4 ids
Unit 4: plan-Q1-writing → the seven story ids OR the five personal ids
        plan-Q2-para-1 / -2 / -3 → that paragraph's eight -q2 ids
        plan-Q3-para-1 / -2 / -3 → that paragraph's six -q3 ids
        plan-Q4-para-1 / -2 / -3 → that paragraph's six -q4 ids
```

**(d) `_planLabelElement` — new labels the fan-out map must recognise** (Unit 4 Task 2's comparative
labels and Unit 4 Task 1's story/personal labels are the only ones not already in the map):

```
"Comparative topic sentence:" · "Text A evidence:" · "Text A effect:" · "Text B evidence:" ·
"Text B effect:" · "The pair:" · "Writers' purposes:" ·
"Hook:" · "Setup:" · "Reaction:" · "Epiphany:" · "Proaction:" · "Climax:" · "Denouement:" ·
"Opening moment:" · "The subject:" · "What changed:" · "The turn:" · "Reflective close:"
```

**(e) `MULTIQ_RESPONSE_TARGETS`.** ⛔ **Do NOT add CCEA keys without a Neil ruling** — see §7.2. The
protocols are written to the absence of a ceiling; adding targets silently would make both of them state
a rule they currently deny.

**(f) `$question_subjects`** (both sites, router ~4377 and ~4401) — add `language1`/`language2` for CCEA
if that list is board-scoped; **VERIFY first**: if it keys on the SUBJECT only, CCEA already enters
question mode because the subject strings are identical to AQA's.

**(g) Ladder registry** (`_LADDER_QUESTION_ORDER` / `_ladderRegistry`) — per the recipe's one-time
generalisation step, CCEA needs `{gate, order, registry}` config:
`ccea_lang_paper_1 → order ['Q1','Q2','Q4']` · `ccea_lang_paper_4 → order ['Q1','Q2','Q3','Q4']`,
with `resolveBy:'stamp'` on nothing (every CCEA planning beat files).

### 6.4 `language-paper-specs.json` — TWO corrections and TWO additions (proposed, not made)

The `ccea.language_u1` and `ccea.language_u4` blocks **already exist and their tariffs are correct**
(150 = 87 + 63 and 150 = 88 + 62; T1 87/88, T2 21/32, T3 12/15, T4 20/15, T5 10). Two defects and two
gaps:

**(1) ⛔ THE AOs ARE WRONG ON BOTH BLOCKS — AQA's numbering was used for a board that numbers
differently.** The spec records Task 1 as `["AO5","AO6"]` and the reading tasks as `["AO1"]`/`["AO2"]`/
`["AO1","AO2","AO3"]`. CCEA's own mark scheme says:

> "Below are the relevant assessment objectives for English Language Unit 1. **Reading AO3** Candidates
> must: (i) read and understand texts, selecting material appropriate to purpose; (ii) develop and
> sustain interpretations of writers' ideas and perspectives; and (iii) explain and evaluate how writers
> use linguistic, structural and presentational features to achieve effects and engage and influence the
> reader. **Writing AO4** Candidates must: (i) write to communicate clearly, effectively and
> imaginatively…; (ii) organise information and ideas…; and (iii) use a range of sentence structures for
> clarity, purpose and effect, with accurate spelling, punctuation and grammar."

Proposed: every Unit 1 and Unit 4 writing task becomes `["AO4"]`; every reading task becomes `["AO3"]`.
The tariff gate does not compare language AO sets, so **nothing would have caught this** — it is recorded
in both marks JSONs' `ao_warning` blocks so it cannot be lost.

**(2) Unit 1's `spag_marks: 30` is a narrower name than what CCEA assesses.** The 30-mark strand set is
"Range of Sentence Structures · Use of Punctuation and Grammar · Spelling" — sentence VARIETY as well as
accuracy. The number is right; the field name understates it. The marks JSON records the component as
kind `technical` rather than `spag` for that reason. No change proposed unless the field gains a
`technical_marks` sibling.

**(3) Unit 4's T1 has no `content_marks` / `spag_marks`.** Proposed addition, quoted from the paper
("Up to 58 marks are available for an organised and engaging piece of writing that matches form and
purpose with audience. Up to 30 marks are available for the use of a range of sentence structures and
accuracy in spelling, punctuation and grammar."):

```json
              "content_marks": 58,
              "spag_marks": 30,
```

**(4) Neither block records the CL-strand marking model, and a port that reads only the spec would
assume points.** Proposed `_note` amendment for both: append
`" Marked by Competence Level Strands (CL0–CL5 on three named strands) then a published mark grid — NOT per-element points. Unit 1 Tasks 3 and 5 are the exception (task-specific checklists)."`

### 6.5 `literature-paper-specs.json` — TWO new blocks (proposed, not made)

`ccea.prose` (40, AO1+AO2, split 5 + 9×3 + 8) and `ccea.unseen_prose` (20, AO1+AO2, split 2 + 5×3 + 3)
already exist and both sum correctly — `ccea__literature_u1.json` cites them and the gate's element-sum
check passes. Unit 2 has nothing. Proposed:

```json
    "drama": {
      "shape": "lit-no-extract",
      "marks": 40,
      "spag_marks": null,
      "aos": ["AO1", "AO2"],
      "split": { "shape": "standard", "intro": 5, "body": 9, "body_count": 3, "conclusion": 8 },
      "extract": null,
      "question_prefix": null,
      "_note": "CCEA GCSE Eng Lit Unit 2 Section A (drama set text) = 40 marks. Band-holistic on an assessment matrix with TWO rows only — AO1 Argument and AO2 Form and Language; Band 5 = [35]-[40]. Verified vs Summer 2025 MS (14577.01 F) + QP ('All questions in Section A and Section B carry equal marks, i.e. 40 marks for each question'). Option (b) prints an extract and asks for 'the extract and elsewhere in the play', so the shape is text-wide either way. NEVER mark this section for comparison or context — those rows are Section B's only."
    },
    "poetry_anthology": {
      "shape": "lit-no-extract",
      "marks": 40,
      "spag_marks": null,
      "aos": ["AO1", "AO2", "AO3", "AO4"],
      "split": { "shape": "standard", "intro": 5, "body": 9, "body_count": 3, "conclusion": 8 },
      "extract": null,
      "question_prefix": null,
      "_note": "CCEA GCSE Eng Lit Unit 2 Section B (poetry anthology: IDENTITY, RELATIONSHIPS or CONFLICT) = 40 marks. Band-holistic on an assessment matrix with FOUR rows — AO1 Argument, AO2 Form and Language, AO3 Comparison, AO4 context; Band 5 = [35]-[40]. One poem is NAMED in the question and the student chooses the second from the same anthology. 'You should include relevant contextual material' is printed in every option and is AO4's trigger. Verified vs Summer 2025 MS (14577.01 F) + QP."
    }
```

⚠️ The `split` values above are carried from `ccea.prose` because both are 40-mark band-holistic essays.
**They are OUR teaching split, not the board's**, and no CCEA document apportions the 40. Flagged as a
decision (§7.5) rather than presented as verified.

---

## 7 · UNRESOLVED DECISIONS (for Neil, or for the engine lane where marked)

1. **Penalty deductions on a positively-marked, grid-marked paper.** This port made every habit code
   FLAG-ONLY (`−0`) and moved the teaching force to "which strand did this pull down, and what did that
   cost on the grid". The alternative is Sophicly's usual −0.5 deductions, which would make the card's
   table sum disagree with the board's grid mark and be overwritten by the engine's own recompute.
   **Recommendation: keep flag-only.** It is board-true and the strand-cost sentence teaches more than a
   number. Needs a ruling because it is a visible departure from every other board's cards.
2. **Word-count targets.** CCEA publishes none. Sophicly's ceiling mechanism needs a
   `MULTIQ_RESPONSE_TARGETS` entry to fire at all, and both protocols currently state that no ceiling
   exists. A defensible target derived from the board's own timings (30 minutes of writing) would be
   ~450–600 words for each unit's Task 1. **Not added, because a target a student can falsify against
   the printed paper is worse than none.** Needs a ruling: register a Sophicly target, or keep the
   honest absence.
3. **Three paragraphs per analysis task.** Ours, not the board's, sized to the board's own timings
   (Task 2 15 min · Task 4 17 min · U4 Tasks 3 and 4 12 min each) and to the CL5 "precise and judicious
   selection of examples". Unit 4 Task 2 gets three comparative paragraphs in 26 minutes. Labelled as
   Sophicly's everywhere. Needs a sanity check from someone who teaches CCEA.
4. **Unit 4's text slug is `ccea_lang_paper_4` and its CELL is `language2`** (§6.0). That pairing is
   forced by two engine surfaces disagreeing, and it needs ONE new router map row
   (`'language4' => 'language2'`). Worth a look from the engine lane in case a cleaner fix is preferred —
   but NOT slug `_paper_2`, which silently breaks the frontend's topic-data lookup.
4b. **⛔ TWO PRE-EXISTING ENGINE DEFECTS, found by reading the registries (§6.0):** CCEA's language
   papers are recorded as **80 marks** in both `BOARD_DEFAULT_MARKS` and `BOARD_FORMAT_DEFAULTS`
   (`frontend/wml-assessment.js:52151` and `:~52228`) and are really **150**, and their AOs are recorded
   as AQA's `AO1,AO2,AO5,AO6` instead of CCEA's `AO3,AO4`. Neither was introduced here; a content lane
   cannot fix either. A 150-mark paper scored against an 80-mark default mis-bands every percentage.
5. **The Literature Unit 2 teaching split** in §6.5 is carried from `ccea.prose` and is not verified
   against anything CCEA publishes, because CCEA apportions nothing inside a band.
6. **ENGINE LANE:** the `isSectionB = q === 'Q5'` assumption (§6.2). CCEA is the first board in the map
   whose writing question is not Q5. A `WRITING_QUESTION` map fixes it for every future board at the
   same cost as a CCEA special case.
7. **ENGINE LANE:** whether the `outline-iumvcc-*` rows are paper-keyed (§6.3b). If they are, CCEA Unit 1
   Task 1 needs a key, not new ids — worth checking before authoring twelve new rows.

---

## 8 · LITERATURE UNIT 3 — what was actually established

The brief asked to confirm "Unit 3 The Study of Shakespeare". **No Unit 3 question paper or mark scheme
appears in CCEA's GCSE English Literature past-paper library alongside Unit 1 and Unit 2**, and the two
exam papers that DO exist account for 140 marks across two written units. The most likely explanation is
that Unit 3 is **not an externally examined paper** (a controlled-assessment or internally assessed
unit), which is why no paper is published. **That is a hypothesis, not a measurement** — no
specification PDF was obtained (§1 gap 4), so it is recorded as unconfirmed rather than asserted. The
next lane should read the specification before building or ruling out a Shakespeare cell.

---

## 9 · UNTESTED ROUTES (nothing below has been run)

- **No staging run of anything.** No assessment driven, no planning walk driven, no polishing turn
  measured, no document opened in a browser. Content lanes do not deploy, and this lane did not.
- **Both planning cells are INERT by construction** until the §6.3 rows land: every `@FIELD_COMMIT`
  targets an outline row the engine does not build. Both protocols state this in their own headers and
  in their §10 acceptance tables, so no one can read them as working.
- **Both polishing rubrics are unreachable** until the §6.1 router rows land. The audit's `—` in the
  polishing column is the honest reading of that.
- **The journeys have not been run** through the chat endpoint. Their `expect_must` / `expect_must_not`
  fields are acceptance criteria for whoever runs them, not results.
- **No CCEA lesson's real shortcode was read** from any environment, so the text slugs in §6.0 are a
  PROPOSAL for what a lesson should carry, not a measurement of what one does carry. There are no CCEA
  language lessons yet, and `grep` finds no CCEA language slug anywhere in the plugin — but the moment a
  lesson exists, PORT SOP §2 requires pulling its real `board` / `subject` / `text` values and diffing
  them against this proposal before trusting either.
- **Literature:** the two existing monoliths (`ccea/prose`, `ccea/unseen-prose`) were NOT modified and
  remain at 2/10 assessment and 1/8 planning with a polishing monolith each. Their tariffs are now
  evidenced and correct (`ccea__literature_u1.json`, and `literature-paper-specs.json` already had the
  right marks), so the hardening is a protocol rewrite against the LANGUAGE anchor, not a tariff
  investigation.
