# PORT BRIEF — Language boards, 2026-09-13 (read in full before any edit)

**Who reads this:** the three Fable subagents porting (1) Edexcel International GCSE English Language
A (4EA1, Papers 1 and 2), (2) Edexcel GCSE English Language (1EN0, Papers 1 and 2), (3) Eduqas GCSE
English Language (C700U10 Component 1, C700U20 Component 2). The ENGINE lane (the spawning session)
integrates: router rows, chip ladders, gates, manifests of other cells, JS, version, commit, deploy.

**Neil's outcome (verbatim):** *"Students should be guided towards independently producing answers
that meet the quality demonstrated by our gold-standard model answers and the requirements of their
particular examination question… The gold standard defines quality. It should allow valid answers
with different wording, evidence, and interpretations."*

## 0 · READ FIRST (in this order)

1. `PROTOCOL-STANDARD.md` — Parts A, B, C, D and **E (the porting procedure — your checklist)**.
2. `PLANNING-LADDER-PORT-RECIPE.md` — the planning port recipe (what is shared, what you author).
3. `PEDAGOGY.md` §0 (search before asking), §1, §3, §4, §10 (Lit only), §11, §32/§32a.
4. `PROTOCOL-QUESTION-STRUCTURE-MAP.md` — your board's rows are a STARTING claim about the papers,
   already found wrong once (IGCSE Q2/Q3 tariffs). Verify every row against the PDF.
5. The AQA templates: `protocols/aqa/language1/` and `protocols/aqa/language2/` (assessment
   `modules/protocol-a-assessment.md`, planning `planning/protocol-b-planning.md`, the gold
   `modules/knowledge-hub.md` / `modules/knowledge-mark-scheme.md`), the polishing rubrics
   `protocols/shared/modules/rubrics/rubric-aqa-lang-p1-fiction.md` and
   `rubric-aqa-lang-p2-nonfiction.md`, the CW rubric `rubric-cw-narrative.md`, and the engine that
   loads beside them `protocols/shared/modules/inline-coaching-engine-language.md`.
6. Your lane's latest handoffs in `~/.claude/handoffs/open/` (grep your board name) — earlier work
   and rulings you must not undo.

## 1 · HARD RULES (WML CLAUDE.md §PARALLEL LANES — content lanes)

- ⛔ **Never edit:** any `.js` or `.php`; `protocols/aqa/**`; `protocols/shared/modules/**` (engine,
  core, rubric-base, coaching pedagogy); another board's directories; `PROTOCOL-STANDARD.md`,
  `PEDAGOGY.md`, `PROTOCOL-QUESTION-STRUCTURE-MAP.md`, `protocols/shared/language-paper-specs.json`
  (propose changes in your report, with the PDF quote). Never bump a version. **Never `git commit`,
  never deploy** — the engine lane commits your files.
- ✅ **You own:** your board's `protocols/<board>/language1/**` and `language2/**` (protocol `.md`,
  `manifest.json`, planning dir), your NEW rubric files in `protocols/shared/modules/rubrics/`
  (named in §3), your `protocols/_marks/<board>__language_p{1,2}.json` (create or extend — every
  mark quoted from the PDF), and your report `protocols/<board>/_PORT-REPORT-2026-09-13.md`.
- **Official documents are the authority** (Part E1). `mdfind -name "<file>"` first;
  `pdftotext -layout "<pdf>" -` to read. Distinguish Edexcel International GCSE Language A (4EA1)
  from Edexcel GCSE (1EN0). Use Eduqas's official component names (Component 1: 20th Century
  Literature Reading and Creative Prose Writing — C700U10; Component 2: 19th and 21st Century
  Non-Fiction Reading and Transactional/Persuasive Writing — C700U20) — confirm from the spec PDF.
- **Never invent a gold standard.** Where a model answer for a question type does not exist on
  disk (search your board's modules, `Model Answers/` on the drive, `protocols/shared/templates/`,
  crib templates), write **GOLD MISSING** in the report and the rubric, and coach against the
  criteria + the nearest AQA model explicitly labelled as another board's.
- **Student-facing text** (anything a protocol says to a student): 13–16, second-language readers,
  UK English, no insider words (rubric / protocol / tier / engine / level-N-needs), no orphan
  references, one idea per sentence. Frameworks are Sophicly techniques, never the board's.
- **No paste-walls** (WML CLAUDE.md §3): the document holds the sources, the question, the
  student's response, the plan. A protocol line asking the student to paste or identify any of
  those is a defect — remove every one.
- **Retained-source law** (WML CLAUDE.md §5): once polishing is an environment, the cell's
  `protocol-c-polishing.md` must appear in NO loadable manifest list (`polishing.always: []` with a
  `_retired` note). Anything a manifest loads is in the model's context.

## 2 · DELIVERABLES PER PAPER (in this priority order; leave a clean state if time runs out)

1. **Assessment** — `modules/protocol-a-assessment.md` hardened to the LANGUAGE anchor's B-CHECKS
   (`node bin/protocol-standard-audit.js --board=<board>` must print 10/10 for the cell). Per
   question: tariff quoted from the PDF (`_marks` JSON + `node bin/tariff-gate.js` green), AOs,
   the taught shape (template by question TYPE, Part E2), per-element marks that sum exactly, the
   universal per-paragraph rule (mark · feedback · gold rewrite · alternative model) for reading
   questions, holistic marking for writing questions with per-section feedback, penalty codes each
   with a worked fix, level-alignment quoting the board's descriptor VERBATIM, the Phase-1 record
   fields the engine writes (grade, total, strength_1, target_1, target_2). Self-assessment where
   the marking method is level-based: the student picks the best-fit level and justifies it from
   their own writing before the mark is revealed (PEDAGOGY §19).
2. **Polishing** — a Part D rubric `rubric-<board>-lang-<paper>-<fiction|nonfiction>.md` mirroring
   the AQA rubrics section for section (Provenance · THE LESSON'S SHAPE · AOs with verbatim
   top-band pointer phrases · TAUGHT STRUCTURE PER QUESTION · PENALTY CODES · BANNED PATTERNS ·
   INLINE COACHING ACTIONS defining EVERY button the chip ships: `scan-structure` `scan-elements`
   `scan-coherence` `scan-concept` `scan-context-drive`(redirect) `strengthen-hook` `rephrase`
   `lang-scan-verbs` `lang-scan-starters` `cw-cut-modifiers` `strengthen-vocabulary` `tighten`
   `adjust-tone` `fix-spelling` `fix-grammar` `fix-punctuation` `compare-gold-standard` `explain`
   and, for a transactional paper, every `device-*` id listed in `rubric-aqa-lang-p2-nonfiction.md`
   · the two contrasting rewrites). Name the gold file(s) the router should load beside it. Retire
   the manifest's polishing list. In the report give the engine lane the ROUTER ROW:
   `{ text: '<slug>', cell: '<board>/language<N>', rubric: '<file>', gold: [<paths>], engine: 'language' }`
   and the chip ladder (which question is the writing question, so Section-B buttons gate to it).
3. **Planning** — `planning/protocol-b-planning.md` per `PLANNING-LADDER-PORT-RECIPE.md`: the
   pre-planning chain, per-question element asks with `@FIELD_COMMIT` (outline boxes) and
   `@FIELD_SET` at approval (plan boxes), C-CHECKS 8/8. The engine-side registry rows
   (`OUTLINE_CRITERIA`, fieldIds, `MULTIQ_RESPONSE_TARGETS` keys) you CANNOT add — write them as a
   JS-ROWS SPEC in your report exactly as `EDEXCEL-IGCSE-JS-ROWS-SPEC-2026-08-16.md` did.
4. **Journeys** — `protocols/<board>/_journeys-2026-09-13.json`: for each question type, a weak,
   a partial, a strong and a valid-but-different student response (your own prose, faults
   deliberate, quotations verbatim from a REAL source in the paper you studied), with the action
   to press and what a correct coaching reply must and must not do. The engine lane runs them
   through the real chat endpoint on staging.
5. **Report** — `protocols/<board>/_PORT-REPORT-2026-09-13.md`: provenance table (PDF · series ·
   version per paper), question-by-question map (question · marks · AOs · shape · template used ·
   gold file or GOLD MISSING · what changed and why), files changed, harness/gate results (paste the
   command output), the router row + ladder, the JS-ROWS SPEC, proposed edits to the shared files
   you may not touch (with quotes), unresolved decisions, and untested routes. Facts only; say
   "not tested" where it is not.

## 3 · OWNED FILE NAMES

| lane | protocol dirs | rubrics (new) | marks JSON |
|---|---|---|---|
| Edexcel IGCSE Lang A | `protocols/edexcel-igcse/language1/`, `language2/` | `rubric-edexcel-igcse-lang-p1-nonfiction.md`, `rubric-edexcel-igcse-lang-p2-anthology.md` | `protocols/_marks/edexcel-igcse__language_p1.json`, `_p2.json` (exist) |
| Edexcel GCSE Lang | `protocols/edexcel/language1/`, `language2/` | `rubric-edexcel-lang-p1-fiction.md`, `rubric-edexcel-lang-p2-nonfiction.md` | `protocols/_marks/edexcel__language_p1.json`, `_p2.json` (exist) |
| Eduqas GCSE Lang | `protocols/eduqas/language1/`, `language2/` | `rubric-eduqas-lang-c1-fiction.md`, `rubric-eduqas-lang-c2-nonfiction.md` | `protocols/_marks/eduqas__language_c1.json`, `_c2.json` (create) |

Text slugs the live lessons carry (measured census 2026-09-13): `edexcel_igcse_lang_a` (P1) and
`edexcel_igcse_lang_a_paper_2` (P2); `edexcel_lang_paper_1`, `edexcel_lang_paper_2`;
`eduqas_lang_paper_1`, `eduqas_lang_paper_2`. The bare `edexcel_igcse_lang_a` reaches P1 lessons
on prod; `edexcel_igcse_lang_a_paper_2` reaches 19 diagnostic lessons. Subject arrives as `language`
and is folded to `language1`/`language2` by the router from the `_paper_N` suffix.

## 4 · WHAT ALREADY EXISTS (inspect, do not assume)

- IGCSE: tariffs verified clean 2026-09-01 (handoff `wml-ENGINE-to-EDEXCEL-IGCSE-I-AM-TAKING-THE-LANGUAGE-PAPERS-audit-done-2026-09-01.md`
  — P1 Q1 2 · Q2 4 · Q3 5 · Q4 12 · Q5 22 · Q6/7 45; P2 Section A 30, Section B 30). Both papers
  are pre-hardening (0 `@REFLECT_GATE`, paste asks live), P1 planning emits zero markers, P2 has no
  planning dir. `EDEXCEL-IGCSE-JS-ROWS-SPEC-2026-08-16.md` is the precedent for JS-row specs.
- Edexcel GCSE: audit 2/10 assess, 1/8 plan, polishing monolith; `_marks` JSON exist.
- Eduqas: audit 2/10 assess, 1/8 plan (language2 4/8), polishing monolith; no `_marks` JSON.
- All three cells' manifests list `protocol-c-polishing.md` in `polishing.always`.

## 5 · TIME

You have ~90 minutes of work. Stop at a clean state; the report is mandatory even if a stage is
unfinished. Prefer one complete paper to two half papers. Run the harnesses before claiming a number.

## 6 · ADDENDUM (Neil, 2026-09-13, mid-run): OCR · CCEA · SQA — Language AND Literature (or equivalent)

Same rules (§1), same deliverables (§2), same evidence bar. Three more lanes:

| lane | qualifications | protocol dirs (existing → create) | rubrics (new) | marks JSON (create) |
|---|---|---|---|---|
| OCR | GCSE English Language J351 (Component 01 Communicating information and ideas · 02 Exploring effects and impact); GCSE English Literature J352 (01 Exploring modern and literary heritage texts · 02 Exploring poetry and Shakespeare) | `protocols/ocr/literature/`, `protocols/ocr/poetry/` exist; CREATE `protocols/ocr/language1/`, `protocols/ocr/language2/` (manifest + modules + planning) | `rubric-ocr-lang-c1-nonfiction.md`, `rubric-ocr-lang-c2-fiction.md`, `rubric-ocr-lit-*.md` as needed | `protocols/_marks/ocr__language_c1.json`, `ocr__language_c2.json`, `ocr__literature_*.json` |
| CCEA | GCSE English Language (Unit 1 Writing for Purpose and Audience and Reading to Access Non-fiction and Media Texts · Unit 4 Personal or Creative Writing and Reading Literary and Non-fiction Texts — confirm names from the spec); GCSE English Literature (Unit 1 The Study of Prose · Unit 2 The Study of Drama and Poetry · Unit 3 The Study of Shakespeare — confirm) | `protocols/ccea/prose/`, `protocols/ccea/unseen-prose/` exist; CREATE `protocols/ccea/language1/` (Unit 1), `protocols/ccea/language2/` (Unit 4) and any Literature cells the resolver map names (`shakespeare`, `modern`, `19th_century`, `poetry`, `unseen`) that you can source | `rubric-ccea-lang-u1-nonfiction.md`, `rubric-ccea-lang-u4-fiction.md`, `rubric-ccea-lit-*.md` | `protocols/_marks/ccea__language_u1.json`, `ccea__language_u4.json`, … |
| SQA | National 5 English (Reading for Understanding, Analysis and Evaluation — the "language" equivalent; Critical Reading — Scottish text + critical essay; the Writing portfolio) | `protocols/sqa/critical-reading/` exists; CREATE `protocols/sqa/ruae/` and `protocols/sqa/writing/` (or the group names the resolver map can take — say which) | `rubric-sqa-n5-ruae.md`, `rubric-sqa-n5-critical-reading.md`, `rubric-sqa-n5-writing.md` | `protocols/_marks/sqa__ruae.json`, `sqa__critical_reading.json`, … |

⚠️ **Official documents on disk:** OCR Literature and SQA National 5 mark schemes are under
`Sophicly Etch Mark Scheme Resources/`; **OCR Language and CCEA are NOT on the drive.** Fetch the
board's own current specification, sample/past papers and matching mark schemes from the board's
website (ocr.org.uk · ccea.org.uk · sqa.org.uk) and save what you use under
`protocols/<board>/_sources/` (PDF or extracted text) so provenance is on disk. If a document
cannot be obtained, write the gap — never invent the paper.

New cells need TWO engine-lane additions you cannot make: a `resolve_protocol_group` map entry
(`class-protocol-router.php`) and a `protocols/shared/language-paper-specs.json` block. Write both as
proposals in your report, byte-exact, and name the text slug each lesson should carry.
