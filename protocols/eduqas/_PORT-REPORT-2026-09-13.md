# PORT REPORT — Eduqas GCSE English Language, Components 1 and 2 (2026-09-13)

**Lane:** Eduqas GCSE English Language content lane. **Branch:** `ports-2026-09-13` (worktree).
**Nothing committed, no version bumped, no deploy** — the ENGINE lane integrates (WML CLAUDE.md
§PARALLEL LANES).

## PROVENANCE HEADER (PROTOCOL-STANDARD E1.3 — two lines per component)

**Component 1 — 20th Century Literature Reading and Creative Prose Writing (C700U10-1).**
`mark scheme:` `Sophicly Etch Mark Scheme Resources/EDUQAS GCSE English/EDUQAS GCSE English Language Paper 1/2023 EDUQAS Lang P1 Mark Scheme and Q Paper/June 2023 MS - Component 1 Eduqas English Language GCSE.pdf`
— S23-C700U10-1, June 2023. Second series: `.../wjec-eduqas-gcse-english-language-sams-100914.pdf`
(Specimen Assessment Materials). Papers also read: June 2023 QP, June 2024 QP + Resource Material
(S24-C700U10-1A).
`anchor:` **LANGUAGE** — `protocols/aqa/language1/modules/protocol-a-assessment.md`. Verified
against the P1 anchor: **yes**.

**Component 2 — 19th and 21st Century Non-Fiction Reading and Transactional/Persuasive Writing
(C700U20-1).**
`mark scheme:` `Sophicly Etch Mark Scheme Resources/EDUQAS GCSE English/EDUQAS GCSE English Language Paper 2/Mark Scheme for Eduqas English Language Paper 2/November 2022 MS - Component 2 Eduqas English Language GCSE.pdf`
— A22-C700U20-1, November 2022. Second series: `Microsoft-Word-C700U20-1-EDUQUAS-GCSE-English-Lang-Comp-2-MS-A21.docx.pdf`
(Autumn 2021). Papers also read: June 2023 QP, November 2022 QP, June 2022 QP
(`Reading Sources.../z22-c700u20-1a.pdf`) — **four series, identical tariff set in every one**.
`anchor:` **LANGUAGE** — `protocols/aqa/language2/modules/protocol-a-assessment.md` (paired-source
and comparative shapes) verified against `protocols/aqa/language1/...` (the P1 gold standard):
**yes**.

**Component names confirmed from the board's own Specimen Assessment Materials** (page 5): "GCSE
ENGLISH LANGUAGE — COMPONENT 1 — 20th Century Literature Reading and Creative Prose Writing — 1 hour
45 minutes"; the C700U20-1 question papers print "ENGLISH LANGUAGE – Component 2 — 19th and 21st
Century Non-Fiction Reading and Transactional/Persuasive Writing — 2 hours". Both match the brief.

---

## 1 · THE LIVE DEFECT, AND ITS FIX (Component 2 Q1 and Q3)

**What was wrong.** The previous `protocols/eduqas/language2/modules/protocol-a-assessment.md`
marked Question 1 and Question 3 **out of 3 marks each, as one judgement**. `bin/tariff-gate.js`
reported six failures — Q1a, Q1b, Q1c, Q3a, Q3b, Q3c each "out of 3 — the board says 1". Students on
this paper were being scored against a total the board does not use, and three separate one-mark
decisions were being collapsed into one.

**The board's own words (verbatim, November 2022 mark scheme).**
- Q1: **"Award one mark for each correct response in a), b) and c)."** Annotated `(AO1 1a)`.
- Q3: **"Award one mark for a correct response."** Annotated `(AO1 1a, b, c, d)`.
- The question papers print `[1]` after each of the six part-questions. June 2023, November 2022 and
  June 2022 are identical.

**The fix.** Q1 and Q3 are now marked **part by part, one mark each**, in a single lean card per
question with per-part canonical lines (`Total Mark for Q1a: [X] / 1` …) and `Q1 Total: X/3`. The
protocol carries an explicit rule that the three parts are three separate judgements and that a
correct answer to (b) is unaffected by a wrong answer to (a), plus the Q3-specific note that a part
may require an **inference** from the 19th-century text, so a correct inference in the student's own
words earns the mark and a lifted clause that does not answer the question does not.
`bin/tariff-gate.js` now passes 103 checks across both papers with no unverified question.

**Also fixed in the same pass:** the Q7 and Q8 tariffs were *unverified*, not clean — the gate could
find no "Assessment Sub-Protocol: Question 7/8" section at all. Both now exist and state 20 marks.

---

## 2 · QUESTION-BY-QUESTION MAP

### Component 1 (C700U10-1) — Section A 40 + Section B 40 = 80

| Q | marks | AOs | taught shape | template used | gold | what changed and why |
|---|---|---|---|---|---|---|
| Q1 | 5 | AO1 | five separate points, no paragraphs | AQA P1 Q1 lean retrieval | none (correct — retrieval) | rewritten; adds the board's own "No mark should be awarded for unabridged quotation of whole sentences" rule with a worked one-clause fix |
| Q2 | 5 | AO2 (1a, c, d — language) | ONE TTECEA paragraph, 5.0 | LANGUAGE anchor Q2 | `knowledge-hub.md` §2.A Q2 model | new criteria table summing exactly to 5.0 (0.5 / 1.5 / 1.0 / 0.5 / 0.5 / 1.0); single-mark bands stated, because one element is a whole mark here |
| Q3 | 10 | AO2 (1a, **b**, c, d — language AND structure) | 2 TTECEA paragraphs × 5.0 | LANGUAGE anchor Q3 | §2.A Q3 model | **board delta:** Q3 is the ONLY Section A question whose annotation carries strand 1b, so one paragraph analyses language and one the organisation of events; the gold file's heading "Structure Analysis" was corrected to "Language AND Structure" |
| Q4 | 10 | AO2 (1a, c, d — language only) | 2 TTECEA paragraphs × 5.0 | LANGUAGE anchor Q2 | §2.A Q4 model | both halves of the printed question are marked (*what* the feeling is, *how* language conveys it); two paragraphs must carry two DIFFERENT feelings; structure is never required or charged here |
| Q5 | 10 | AO4 | 2 evaluative paragraphs × 5.0, the second taking a whole-passage overview | E2's sanctioned "Eduqas-style body-only when the board's tariff is small" | §2.A Q5 model | first drafted as stance 1 + 3 × 3; **changed to 2 × 5.0 to match our own gold model**, which is headed "10 marks, 2 paragraphs" — teaching a shape our gold does not demonstrate would untrain the method (A13) |
| Q6 | 40 | AO5 24 + AO6 16 | holistic; seven scene beats; about 450–600 words | AQA P1 Q5 | ⚠️ **GOLD PARTIAL** | the §2.A Section B example is a short style EXTRACT, not a complete model (A7). Relabelled in place as a style extract with an `[AI_INTERNAL]` instruction that every emitted gold is a complete ~600-word piece |

### Component 2 (C700U20-1) — Section A 40 + Section B 40 = 80

| Q | marks | AOs | taught shape | template used | gold | what changed and why |
|---|---|---|---|---|---|---|
| Q1 a/b/c | 1 + 1 + 1 | AO1 (1a) | three one-mark answers, Text 1 | AQA "SKIP" retrieval rule | none (correct) | **THE DEFECT FIX** — was marked out of 3 as one answer |
| Q2 | 10 | AO2 (1a, b, c, d) | 2 TTECEA paragraphs × 5.0 | LANGUAGE anchor Q3 | §2A Q2 models (two) | the printed bullets name language, **tone** and **structure**; criterion 2 widened to "a language choice, a shift of tone or a structural choice" and the two paragraphs must reach past word choice |
| Q3 a/b/c | 1 + 1 + 1 | AO1 (1a, b, c, d) | three one-mark answers, Text 2 | as Q1 | none (correct) | **THE DEFECT FIX** + the inference note (strands b/c/d mean a part may require an inference) |
| Q4 | 10 | AO4 | 2 evaluative paragraphs × 5.0, the second weighing the whole text | as C1 Q5, for transfer | ⚠️ **GOLD MISSING** | no AO4 model exists on this paper. Shape aligned with C1 Q5 so the skill transfers; the rubric and the planning protocol both say plainly that no model exists and forbid substituting the AQA one silently |
| Q5 | 4 | AO1 (2a, b) | ONE brief synthesis paragraph, 4.0 | none — authored from the board's own 1/2/3/4 ladder | ⚠️ **GOLD MISSING** | criteria mirror the board's ladder exactly (one text → one detail each → details from both → synthesise with a range and brief explanation). Explicit rule that no technique, effect or purpose is required — the commonest over-coaching risk on this question |
| Q6 | 10 | AO3 | 2 comparative paragraphs × 5.0, both texts in each | AQA P2 Q4 comparative | §2A comparative model | eight criteria summing to 5.0 (the AQA P2 BP set, unchanged); the board's own lowest-band line about dealing with one text is quoted as the trap |
| Q7 | 20 | AO5 12 + AO6 8 | holistic; IUMVCC; about 300–400 words | AQA P2 Q5 | §2A Section B model | new; the tariff was previously unverified |
| Q8 | 20 | AO5 12 + AO6 8 | holistic; IUMVCC; about 300–400 words | AQA P2 Q5 | §2A Section B model, read against Q8's own form | new; equal depth mandated, and an explicit rule that Q8's form is judged on its own — carrying Q7's form across is the commonest Section B loss |

**Two deltas where the template lost to the mark scheme (E2), both stated in the protocol headers:**
1. **Paragraph count is NOT marks ÷ 4 on either component.** That is an AQA convention. Eduqas marks
   each Section A question on its own level ladder with no paragraph rule, and allows about 50
   minutes for five or six questions — so both papers teach **5.0-mark paragraphs**.
2. **No introduction and no conclusion on the evaluation questions.** At 10 marks in roughly twelve
   minutes a full essay frame costs the student the analysis the band descriptors reward, and C1's
   own gold model is headed "2 paragraphs".

---

## 3 · FILES CHANGED

**Rewritten (mine to own):**
- `protocols/eduqas/language1/modules/protocol-a-assessment.md` — full rewrite to the LANGUAGE anchor.
- `protocols/eduqas/language2/modules/protocol-a-assessment.md` — full rewrite; carries the defect fix.
- `protocols/eduqas/language1/planning/protocol-b-planning.md` — **new** (de-stitched monolith).
- `protocols/eduqas/language2/planning/protocol-b-planning.md` — **new** (de-stitched monolith).
- `protocols/eduqas/language1/manifest.json` · `protocols/eduqas/language2/manifest.json` —
  `polishing.always: []` + `_retired` note; `planning` de-stitched to the monolith with
  `planning.steps: {}` and a `_destitched` note; `knowledge-mark-scheme-c1.md` / `-c2.md` added to
  `assessment.always` (they were authored but never loaded).
- `protocols/eduqas/language{1,2}/planning/b*.md` → moved to `planning/_superseded/` (ONE-TEMPLATE LAW).
- `protocols/eduqas/language1/modules/knowledge-hub.md` — three surgical corrections: the Q3 gold
  heading now says "Language AND Structure"; the AO note now names which questions assess language
  only; the Section B "Model Snippet" is relabelled a style extract with the complete-gold instruction.
- `protocols/eduqas/language2/modules/knowledge-mark-scheme.md` (the C2 gold file) — **contradiction
  source pruned.** It labelled the comparative gold "Question 4" (on this paper Q4 is the AO4
  evaluation) and used "Source A / Source B" throughout, which the printed paper never uses. Now:
  Q2 (two models), **Q6** (comparative), Section B; every "Source A/B" → "Text 1/Text 2" (0 left);
  the comparative CONCLUSION gold is marked retired, because Q6 teaches no conclusion; a header note
  states the real question numbering and that Q4 and Q5 have no gold.
- `protocols/_marks/eduqas__language_c1.json` — Section B note corrected (FOUR title choices in both
  series read, not three).
- `protocols/_marks/eduqas__language_c2.json` — Section B note corrected (the mark scheme prints no
  word guidance but the **question paper** prints "about 300–400 words for each task"); a fourth
  series added to the provenance.

**New (mine to own, per brief §3):**
- `protocols/shared/modules/rubrics/rubric-eduqas-lang-c1-fiction.md`
- `protocols/shared/modules/rubrics/rubric-eduqas-lang-c2-nonfiction.md`
- `protocols/eduqas/_journeys-2026-09-13.json`
- `protocols/eduqas/_PORT-REPORT-2026-09-13.md` (this file)

**Not touched:** any `.js` or `.php`, `protocols/aqa/**`, other boards' directories,
`PROTOCOL-STANDARD.md`, `PEDAGOGY.md`, `PROTOCOL-QUESTION-STRUCTURE-MAP.md`,
`protocols/shared/language-paper-specs.json`, `protocols/shared/modules/**` except the two new
rubrics.

---

## 4 · GATE OUTPUT (pasted, run from the worktree)

```
$ node bin/tariff-gate.js --only eduqas
✔ tariff-gate: 2 paper(s) gated, 103 checks, every mark quoted from the board's own document
```
(Before this port: `✘ tariff-gate: 6 problem(s)` on eduqas/language_c2 plus three UNVERIFIED notes.)

```
$ node bin/protocol-standard-audit.js --board=eduqas
board/subject                 ASSESS pass/abs  RG  FB  TMF  last      PLAN pass/abs  FC  GR  last   POLISH
eduqas/language1              10/10  7   7   9    2026-06-11          8/8  47  6                    monolith 1 5529 0
eduqas/language2              10/10  8   13  14   2026-06-11          8/8  54  7                    monolith 1 7625 0
```
(Before: `2/10` assess and `1/8` plan on both cells.)

```
$ grep -c paste protocols/eduqas/language{1,2}/modules/protocol-a-assessment.md \
                protocols/eduqas/language{1,2}/planning/protocol-b-planning.md
0   0   0   0
```

```
$ node bin/essay-polishing-env-gate.js
✅ essay-polishing-env-gate passed  (249 assertions, 0 failed)
```
⚠️ **Read that last one correctly: it passes because it asserts the AQA rows.** It says nothing about
Eduqas, and the audit's POLISH column still reads `monolith` for both cells, because the router row
and the chip-ladder entry are engine-lane edits I may not make (§6 below). The rubric halves of
D-CHECKS were verified by hand against the audit's own six regexes: both rubrics score **6/6**
(`## INLINE COACHING ACTIONS`, `Provenance`, `Mark Complete`, the student-chooses framing,
`macro → micro`, `no task menu`). The device-id set in the C2 rubric is **byte-identical** to
`rubric-aqa-lang-p2-nonfiction.md` (21 ids, `diff` clean).

**Journeys file:** parses; 10 journeys, 32 responses; **36 quotations machine-verified verbatim**
against the three extracted question papers (whitespace- and line-number-normalised). Two
misquotations found by that check and fixed before filing: a joined pair of separate speeches in the
C1 passage, and a lower-cased sentence opening in the 1869 report.

---

## 5 · ROUTER ROWS + CHIP LADDERS (engine lane — byte-exact)

Add to `$essay_polishing_rubrics` in `SWML_Protocol_Router::essay_polishing_env()`
(`includes/class-protocol-router.php`), beside the two AQA rows:

```php
            'eduqas_lang_paper_1' => [
                'cell'   => 'eduqas/language1',
                'rubric' => 'rubric-eduqas-lang-c1-fiction.md',
                'gold'   => ['protocols/eduqas/language1/modules/knowledge-hub.md'],
                'engine' => 'language',
            ],
            'eduqas_lang_paper_2' => [
                'cell'   => 'eduqas/language2',
                'rubric' => 'rubric-eduqas-lang-c2-nonfiction.md',
                'gold'   => ['protocols/eduqas/language2/modules/knowledge-mark-scheme.md'],
                'engine' => 'language',
            ],
```

And in `frontend/wml-selection-chip.js`:

```js
        const ESSAY_POLISH_ENV_TEXTS = ['aqa_lang_paper_1', 'aqa_lang_paper_2', 'eduqas_lang_paper_1', 'eduqas_lang_paper_2'];
```

**THE CHIP LADDERS.**

*Component 1 (`eduqas_lang_paper_1`) — the FICTION ladder, identical in shape to `aqa_lang_paper_1`:*
`langScan` (`scan-structure`, `scan-elements`, `scan-coherence`, `scan-concept`) → `elementPolish`
(`strengthen-hook`, `rephrase`) → `langWordChoice` (`lang-scan-verbs`, `lang-scan-starters`,
`cw-cut-modifiers`) → `polishProse` → `fixSpag` → `reference`. **No `device-*` group** (creative
prose is coached through imagery and sentence variety) and **no `scan-context-drive`** (no AO3).

*Component 2 (`eduqas_lang_paper_2`) — the NONFICTION ladder, identical in shape to
`aqa_lang_paper_2`:* `langScan` → `elementPolish` → **`devices`** (all 21 ids, writing questions
only) → `langWordChoice` → `polishProse` → `fixSpag` → `reference`.

⚠️ **THE ONE CODE CHANGE THE LADDER NEEDS — `isSectionB` is hardcoded to Q5.** In
`frontend/wml-selection-chip.js` the current line is `const isSectionB = q === 'Q5';`. On Eduqas the
writing questions are **Q6** on Component 1 and **Q7 and Q8** on Component 2, so as it stands the
device group and the modifier cut would gate to the wrong question on both papers (and to the
evaluation question on Component 1). Replace the literal with a per-text map, for example:

```js
        const SECTION_B_QUESTIONS = {
            aqa_lang_paper_1:    ['Q5'],
            aqa_lang_paper_2:    ['Q5'],
            eduqas_lang_paper_1: ['Q6'],
            eduqas_lang_paper_2: ['Q7', 'Q8'],
        };
        const isSectionB = !!(SECTION_B_QUESTIONS[envText] || ['Q5']).includes(q);
```

This is the A11 defect class exactly: behaviour gated on a literal that silently no-ops for every
sibling paper. It is a REGISTERED PORT SURFACE and every future language port needs the same entry.

---

## 6 · JS-ROWS SPEC (engine lane — the rows a content lane cannot add)

Format follows `EDEXCEL-IGCSE-JS-ROWS-SPEC-2026-08-16.md`. **Until these land, the planning
protocols' filing markers are inert** — a `@FIELD_COMMIT` whose outline row does not exist is a
silent no-op (`wml-assessment.js` ~2383; PLANNING-LADDER-PORT-RECIPE §1).

### 6.1 `MULTIQ_RESPONSE_TARGETS` + `_multiqTargetKey` (`frontend/wml-assessment.js` ~52008)

`_multiqTargetKey()` currently begins `if (state.board !== 'aqa') return null;`, so **no Eduqas
lesson can ever receive a word-count target or a Section-B ceiling.** Both assessment protocols are
written honestly around that (ECHO-ONLY, and "where the injected line is ABSENT apply no ceiling"),
but the feature is missing, not broken. Proposed:

```js
        'eduqas|lang_paper_1': { Q1: 0, Q2: 120, Q3: 240, Q4: 240, Q5: 240, Q6: 600 },
        'eduqas|lang_paper_2': { Q1: 0, Q2: 240, Q3: 0, Q4: 240, Q5: 60, Q6: 240, Q7: 400, Q8: 400 },
```
and in `_multiqTargetKey()`, before the board test:
```js
        if (state.board === 'eduqas') {
            if (txt.indexOf('lang_paper_2') !== -1) return 'eduqas|lang_paper_2';
            if (txt.indexOf('lang_paper_1') !== -1) return 'eduqas|lang_paper_1';
        }
```
**Derivation, stated so it can be checked:** Q6 600 and Q7/Q8 400 are the TOP of the board's own
printed guidance (450–600 and 300–400) — a ceiling must not fire on a piece the board would call
full length. Reading-question values are our own targets at roughly 24 words per mark (Q2 of C1 is
5 marks → 120), and reading questions carry no word-count penalty on either paper, so they are used
only by the progress widget. Q1/Q3 of C2 are 0 (three one-mark answers).
⚠️ **The target map is NOT the whole gap — `_sectionBWcCeiling` is Q5-only in three separate places**
(`frontend/wml-assessment.js` ~8955, read 2026-09-13):
```js
            if (qKey !== 'Q5' || !(den > 0)) return null;                       // 1. the gate
            const tgt = key && MULTIQ_RESPONSE_TARGETS[key] && MULTIQ_RESPONSE_TARGETS[key].Q5;  // 2. the target
            let wc = _lastQWordCounts.Q5;  if (!(wc > 0)) wc = _q5DomWordCount();                // 3. the word count
```
All three need to become per-paper (the writing question(s) named by the text slug), and the two
call sites at ~8701 and ~8964 read `.Q5` too. Until then **no Eduqas writing question can ever
receive a ceiling**, which is why both assessment protocols state the ceiling as ECHO-ONLY with an
explicit "if the injected line is absent, apply no ceiling" branch — a rule whose engine trigger
never fires would otherwise be a PROTOCOL-STANDARD fail, not a pass. Note also that **C2 is the
first paper in WML with two separately-ceilinged writing questions in one session**, so the
`_lastQWordCounts` source must distinguish Q7 from Q8.

### 6.2 `OUTLINE_CRITERIA` — new sections

Component 1 needs a reading-paragraph section of SIX rows and a scene section of SEVEN; Component 2
needs SIX (Q2), FIVE (Q4 evaluative), FOUR (Q5 synthesis), EIGHT (Q6 comparative) and SIX (IUMVCC).
Row labels, in order, exactly as the protocols name them:

| section | rows (in order) |
|---|---|
| `eduqasTtecea` (C1 Q2/Q3/Q4, C2 Q2) | Topic sentence · Method + evidence + inference · Close analysis · Effect on the reader 1 · Effect on the reader 2 · The writer's purpose |
| `eduqasEvaluative` (C1 Q5, C2 Q4) | Evaluative topic sentence · Reference + evaluative inference · Close analysis · Evaluation of the effect · Judgement against the statement |
| `eduqasSynthesis` (C2 Q5) | Detail from Text 1 · Detail from Text 2 · Range across both · The joining sentence |
| `eduqasComparative` (C2 Q6) | Comparative topic sentence · Text 1 method + evidence + inference · Text 1 effect · Text 2 method + evidence + inference (after the pivot) · Text 2 effect · The pair developed · Word-level analysis · Purposes compared |
| `eduqasScene` (C1 Q6) | Hook · Setup · Reaction · Epiphany · Proaction · Climax · Denouement |
| `iumvcc` (C2 Q7, Q8) | reuse the existing IUMVCC section — Introduction · Urgency · Methodology · Vision · Counter-argument · Conclusion |

### 6.3 fieldId builders — the 101 outline ids

**Component 1, 47 ids** (`protocols/eduqas/language1/planning/protocol-b-planning.md` holds the
byte-exact table): `outline-body-<1|2>-<topic|evidence|analysis|effects|effects2|purpose>-q<2|3|4>`
(Q2 uses body-1 only → 6; Q3 → 12; Q4 → 12), `outline-body-<1|2>-<topic|evidence|analysis|effects|judgement>-q5`
(10), `plan-scene-Q6-<hook|setup|reaction|epiphany|proaction|climax|denouement>` (7).

**Component 2, 54 ids** (`protocols/eduqas/language2/planning/protocol-b-planning.md`):
`outline-body-<1|2>-<topic|evidence|analysis|effects|effects2|purpose>-q2` (12),
`outline-body-<1|2>-<topic|evidence|analysis|effects|judgement>-q4` (10),
`outline-synthesis-<text1|text2|range|link>-q5` (4),
`outline-body-<1|2>-<topic|t1method|t1effect|t2method|t2effect|pair|analysis|purposes>-q6` (16),
`plan-iumvcc-Q<7|8>-<intro|urgency|method|vision|counter|conclusion>` (12).

Both lists are machine-checked: 47 and 54 literal markers, zero duplicates, zero extras.

### 6.4 `_planOutlineTargets` + `_planLabelElement`

Plan fields → outline ids, for the two-grade fan-out (recipe §1b):

| plan field | fans out to |
|---|---|
| `plan-Q2-para-1` (C1) | the six `…-q2` ids |
| `plan-Q3-para-1` / `-2` (C1) | the six `outline-body-1-…-q3` / `outline-body-2-…-q3` ids |
| `plan-Q4-para-1` / `-2` (C1) | the six `…-q4` ids per paragraph |
| `plan-Q5-para-1` / `-2` (C1) | the five `…-q5` ids per paragraph |
| `plan-Q6-scene` (C1) | the seven `plan-scene-Q6-…` ids |
| `plan-Q2-para-1` / `-2` (C2) | the six `…-q2` ids per paragraph |
| `plan-Q4-para-1` / `-2` (C2) | the five `…-q4` ids per paragraph |
| `plan-Q5-synthesis` (C2) | the four `outline-synthesis-…-q5` ids |
| `plan-Q6-para-1` / `-2` (C2) | the eight `…-q6` ids per paragraph |
| `plan-Q7-piece` / `plan-Q8-piece` (C2) | the six `plan-iumvcc-Q7-…` / `-Q8-…` ids |

`_planLabelElement` needs new label → element keys for the labels these protocols introduce:
`Judgement:` → `judgement`; `Text 1 method:` → `t1method`; `Text 1 effect:` → `t1effect`;
`Text 2 method:` → `t2method`; `Text 2 effect:` → `t2effect`; `The pair:` → `pair`;
`Purposes compared:` → `purposes`; `Detail from Text 1:` → `text1`; `Detail from Text 2:` → `text2`;
`Range:` → `range`; `Joining sentence:` → `link`.

### 6.5 ladder config, and the rest of E2

- `_LADDER_QUESTION_ORDER` per paper: C1 `['Q2','Q3','Q4','Q5','Q6']`; C2
  `['Q2','Q4','Q5','Q6','Q7','Q8']` (Q1 and Q3 of C2, and Q1 of C1, are retrieval — never in the walk).
- `_ladderRegistry(qKey)` per paper: `{el, type, resolveBy}` per element, in BEAT order, `el` byte-equal
  to the fieldId. **Element TYPES are the skill, not the position** — on C2 Q6 the Text 1 method beat
  and the Text 2 method beat are DIFFERENT types, because the pivot is a different skill and fade must
  not pre-open an unpractised one.
- Router `$question_subjects` — BOTH sites (~4377 and ~4401) must accept the Eduqas language cells so
  the papers enter question mode.
- `PRECHAIN_GOAL_OPTIONS_LANG` — BOTH pipelines (~6418 and ~14755). Paper-true options are in each
  protocol's pre-chain step 2b: C1 has no AO3 option; C2 has all six AOs (A–G).
- Recall rotation — router setup (~5713) and frontend `_recallTargetQ` (~643), kept identical:
  C1 `Q5 → Q3 → Q4 → Q6`; C2 `Q4 → Q2 → Q6 → Q7`. Reasons are in each protocol's step 2c.
- SA descriptor sets + `healLangP1SelfAssessment`-style lists; `getResponseText` labeller (C1: 1, 2, 2,
  2 paragraphs for Q2–Q5; C2: 2, 2, 1, 2); board caps registry entry (both papers 80).
- **PENALTY-CODE ↔ LEARN-CHIP PARITY:** the codes these protocols can emit are H1, P1, C1, N1, F1,
  T1, S1, S2, D1, B1, M1, plus E1 and K1 (evaluation) and H1-COMP (C2 Q6). Every one already exists on
  the AQA papers, so `PENALTY_LEARN_MAP` needs no new entry — **verify, do not assume.**

---

## 7 · PROPOSED EDITS TO FILES I MAY NOT TOUCH

1. **`PROTOCOL-QUESTION-STRUCTURE-MAP.md`** — add or correct the Eduqas language rows to the map in
   §2 above. The C2 row must show Q1 and Q3 as **three one-mark parts each**, not 3 marks.
2. **`protocols/shared/language-paper-specs.json`** — **no tariff change needed.** Both Eduqas blocks
   already match the PDFs exactly (the tariff gate's check D passes), including `Q1a`–`Q8`. Two
   cosmetic improvements only: `language_c1.source` and `language_c2.source` still say "verified by
   Neil 2026-04-02" for the tariffs — replace with the citations in the provenance header above, since
   PROTOCOL-STANDARD E1.3 treats a human check as unstated provenance. Suggested C1 value:
   `"EDUQAS C700U10 — June 2023 mark scheme (S23-C700U10-1) + Specimen Assessment Materials; tariffs quoted in protocols/_marks/eduqas__language_c1.json and gated by bin/tariff-gate.js"`.
3. **`PROTOCOL-STANDARD.md` §E2** — the "evaluation" row already sanctions "Eduqas-style body-only
   when the board's tariff is small". Worth one added clause recording what this port actually did:
   *"— and where the cell's own gold model declares a paragraph count, the gold wins over the marks
   rule."* That is the decision that moved C1 Q5 from stance + 3 to 2 × 5.0.
4. **`PROTOCOL-COVERAGE-MATRIX.md`** — Eduqas language rows: assessment **complete-mechanical /
   untested-live**; planning **complete-mechanical / inert until §6.3 lands**; polishing **rubric
   complete / router row pending**; documents **not checked** (no browser run in this lane).

---

## 8 · UNRESOLVED DECISIONS (for Neil or the engine lane)

1. **C1 Q6 has no complete gold, and C2 Q4 and Q5 have none at all.** Authoring three model answers
   is content work this lane did not have the budget for, and PROTOCOL-STANDARD forbids inventing
   one. Ruling needed on who writes them; until then the coaching runs from criteria and band
   phrases, which is honest but thinner than the AQA cells.
2. **No Component 2 Resource Material on the drive.** Every C2 question paper and mark scheme is
   there; the 21st-century Text 1 articles are not (searched with `mdfind` and `find`, both
   completed; the one file that looked like a C2 source pair is an AQA "Writers' viewpoints" insert
   filed in the Eduqas folder by mistake). Q2, Q5 and Q6 journeys therefore carry a declared Text 1
   placeholder. **Do not invent one.**
3. **Was the 2 × 5.0 evaluation shape the right call?** It follows our own gold model and the board's
   timing, and it makes C1 Q5 and C2 Q4 the same shape so the skill transfers. The alternative —
   a 1-mark stance plus three 3-mark paragraphs — teaches a frame the board's small tariff arguably
   does not pay for. Flagged because it is a pedagogy choice, not a mark-scheme fact.
4. **C2 has two ceilinged writing questions in one session.** No other WML paper does. Worth a ruling
   on whether a short Q7 and a short Q8 should each carry their own ceiling (my reading: yes — they
   are separately marked out of 20) before §6.1 ships.
5. **Q2 of C1 is marked in single-mark bands.** Our 0.5-granularity criteria are finer than the
   board's steps there. It is the right teaching grain, but it means a 0.5 loss can move a whole
   board mark; worth Neil knowing.

---

## 9 · UNTESTED ROUTES (facts only)

- **Nothing was driven on staging.** No live chat turn, no browser, no document render. Everything in
  §4 is mechanical: gate output and machine-checked counts.
- The polishing environment **cannot yet be reached** for either paper — the router row and the chip
  entry (§5) are engine-lane edits.
- The planning protocols' 101 filing markers are **inert** until §6.3 lands; a walk driven today would
  file nothing and would do so silently.
- `bin/plan-fanout-harness.js`, `bin/planning-keymatch-harness.js` and `bin/ladder-check-harness.js`
  were **not run against these cells** — they need the paper's el lists and fixtures added first
  (recipe §5), which is engine work.
- The **adversarial review pass** the recipe makes mandatory (§5b — an independent fresh-context
  reviewer, never the builder) has **not** happened for either planning monolith. It is a gate, not a
  nicety; the recipe records that it caught two defects on the LIT build that two builder self-passes
  missed.
- The assessment protocols have not been checked against `ASSESSMENT-MECHANICS.md` §0b's
  engine-parity table paper by paper. One parity failure is already known and stated: the word-count
  ceiling never fires for a non-AQA board (§6.1).
