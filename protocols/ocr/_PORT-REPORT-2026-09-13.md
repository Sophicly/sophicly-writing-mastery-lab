# OCR PORT REPORT — 2026-09-13 (content lane; facts only)

**Scope delivered:** OCR GCSE English Language **J351/01** and **J351/02** ported as new cells
(`protocols/ocr/language1/`, `protocols/ocr/language2/`) — assessment, polishing rubric, planning,
marks JSON, journeys. OCR GCSE English Literature **J352/01** and **J352/02**: tariffs sourced and
gated only; the two existing Literature cells were **not** ported (reason in §8).

**Nothing here was authored from general GCSE knowledge.** Every mark, AO and descriptor traces to a
board PDF named below, and every tariff carries a quote the gate re-finds in that PDF.

---

## 1 · PROVENANCE

| component | document | series | where it is on disk |
|---|---|---|---|
| J351/01 Communicating information and ideas | OCR mark scheme (primary) | **November 2024** | `protocols/ocr/_sources/741958-mark-scheme-communicating-information-and-ideas.pdf` (+ `.txt`) |
| J351/01 | OCR mark scheme (second series) | **November 2021** | `protocols/ocr/_sources/667576-mark-scheme-communicating-information-and-ideas.pdf` (+ `.txt`) |
| J351/02 Exploring effects and impact | OCR mark scheme (primary) | **June 2023** | `protocols/ocr/_sources/704889-mark-scheme-exploring-effects-and-impact.pdf` (+ `.txt`) |
| J351/02 | OCR mark scheme (second series) | **June 2017** | `protocols/ocr/_sources/470672-exploring-effects-and-impacts.pdf` (+ `.txt`) |
| J352/01 Exploring modern and literary heritage texts | OCR mark scheme | **June 2024** | drive: `Sophicly Etch Mark Scheme Resources/OCR Literature Mark Schemes/June 2024 MS - Component 1 …pdf`; extract at `protocols/ocr/_sources/ocr-j352-01-june2024-ms.txt` |
| J352/02 Exploring poetry and Shakespeare | OCR mark scheme | **June 2024** | same folder, Component 2; extract at `protocols/ocr/_sources/ocr-j352-02-june2024-ms.txt` |

**Where the Language PDFs came from and why.** `Sophicly Etch Mark Scheme Resources/` contains OCR
**Literature** only — there is no OCR Language folder (searched 2026-09-13 with `mdfind` and a
completed `find`). The four Language PDFs were downloaded from OCR's own site
(`https://www.ocr.org.uk/Images/{741958,667576,704889,470672}-…pdf`) and committed under
`protocols/ocr/_sources/` so the citation is reproducible and `bin/tariff-gate.js` can re-open it.

**Corroboration found on the drive (not used as authority):**
`Model Answers/Model Answer Resources/ocr-paper-2-fiction-corpus-2017-2026.md` — an earlier Sophicly
corpus built from the June 2023 + June 2024 J351/02 mark schemes and examiner reports. Its paper
architecture table matches the PDFs question for question, including the varying Q1 split. Useful for
question-stem history; it contains **no model answers**.

**Gaps in provenance, stated rather than rounded up:**
1. **J352/01 and J352/02 have only ONE series on disk** (June 2024). PROTOCOL-STANDARD E1.4 (read more
   than one paper) is **not satisfied** for Literature. Both marks files record this.
2. **No OCR specification PDF was obtained.** The URL guessed for J351's spec returned HTML, and the
   spec was not needed for any claim made here (every tariff, AO and descriptor came from mark
   schemes). Timings (2 hours per Language component) are taken from the existing
   `language-paper-specs.json` entry, not from a document read in this pass — flagged in §7.
3. **No question papers or examiner reports were read.** The mark schemes reprint the question stems,
   which is what the port needed.

---

## 2 · QUESTION MAP — J351/01 (80 marks, 2 hours)

Source: the mark scheme's own AO grid (November 2024, p. 20) plus each question's skills line.

| Q | marks | AOs | board's marking method | shape we teach | per-element worths | gold |
|---|---|---|---|---|---|---|
| Q1 | 4 | AO1i | point-marked, parts as printed (Nov 2024: 1+1+2) | retrieval, LEAN — no panel, no golds, no levels | n/a | n/a |
| Q2 | 6 | AO1ii | 3 levels (5–6 / 3–4 / 1–2) | **2 synthesis connections × 3** | 0.5 + 0.75 + 0.75 + 1.0 = 3.0 | **GOLD MISSING** |
| Q3 | 12 | AO2 | 6 levels (11–12 … 1–2) | 3 TTECEA paragraphs × 4 (12 ÷ 4) | 0.5 + 1.0 + 0.5 + 0.5 + 0.5 + 1.0 = 4.0 (+0.5 bonus, capped) | **GOLD MISSING** |
| Q4 | 18 | AO4 12 + AO3 6 | two strands, added | Intro 1.5 + 3 comparative bodies × 5 + Conclusion 1.5 | AO4 criteria sum 12.0, AO3 criteria sum 6.0, total 18 | **GOLD MISSING** |
| Q5 | 40 | AO5 24 + AO6 16 | holistic, AO5 6 levels / AO6 **4 levels** | IUMVCC, transactional | holistic | **GOLD MISSING** |

## 2b · QUESTION MAP — J351/02 (80 marks, 2 hours)

| Q | marks | AOs | board's marking method | shape we teach | per-element worths | gold |
|---|---|---|---|---|---|---|
| Q1 | 4 | AO1 | point-marked, parts as printed (Jun 2023: 2+1+1) | retrieval, LEAN | n/a | n/a |
| Q2 | 6 | AO2 | 6 levels, **one mark apart** (6 / 5 / 4 / 3 / 2 / 1) | 2 short TTECEA paragraphs × 3, on Text 1 | 0.5 + 1.0 + 0.5 + 0.5 + 0.5 = 3.0 | **GOLD MISSING** |
| Q3 | 12 | AO2 | 6 levels (11–12 … 1–2) | 3 TTECEA paragraphs × 4, on **Text 2** | as C1 Q3 | **GOLD MISSING** |
| Q4 | 18 | AO4 12 + AO3 6 | two strands, added | as C1 Q4 | as C1 Q4 | **GOLD MISSING** |
| Q5 | 40 | AO5 24 + AO6 16 | holistic | the seven scene elements, creative | holistic | **GOLD MISSING** |

**GOLD MISSING is the finding, not a shortcut.** `Model Answers/OCR/` holds Literature texts only;
the J351/02 corpus has none; `protocols/ocr/**` has none. Both protocols and both rubrics therefore
instruct: build the gold fresh against the criteria and the board's descriptors, never describe
anything as "the OCR model answer", and if another board's model is used for shape, say so.

## 2c · QUESTION MAP — Literature (tariffs only, one series)

| paper | question | marks | AOs | notes |
|---|---|---|---|---|
| J352/01 | Section A part (a) — modern prose/drama + unseen extract | 20 | AO1 + AO2 + AO3 | holistic; "AO1 and AO3 are the equally dominant assessment objectives" |
| J352/01 | Section A part (b) — whole-text essay | 20 | AO1 + AO2 | holistic, "equally weighted" |
| J352/01 | Section B — 19th century prose (1 of 8) | 40 | AO1 14 + AO2 14 + AO3 8 + AO4 4 | printed as "36 +4"; extract-only caps at Level 3 |
| J352/02 | Section A part (a) — poetry across time + unseen poem | 20 | AO1 8 + AO2 12 | one-poem answers "cannot move beyond Level 3" |
| J352/02 | Section A part (b) — second anthology poem | 20 | AO1 10 + AO2 10 | |
| J352/02 | Section B — Shakespeare (1 of 8) | 40 | AO1 14 + AO2 14 + AO3 8 + AO4 4 | printed as "36+4" |

⚠️ **Board-document inconsistency, recorded in `ocr__literature_p1.json`:** on J352/01 the final AO
grid gives part (a) as AO1 8 + AO2 12 with no AO3, while its own weightings table, skills line and
every level descriptor include AO3. The MARKS agree (20). We take the descriptors as the marking
authority. The same class of artefact appears in the J351/01 grid (a stray 6 in Question 2's AO3
column) and is recorded in `ocr__language_c1.json`.

---

## 3 · FILES WRITTEN

**New cell — `protocols/ocr/language1/` (J351/01)**
- `manifest.json` — assessment + planning lists; `polishing.always: []` with a `_retired` note.
- `modules/foundation-c1.md` — identity, paper facts, house bans, no-paste law, one-template law.
- `modules/protocol-a-assessment.md` — the full B-COMMON spine adapted; 5 question sub-protocols.
- `modules/knowledge-mark-scheme-c1.md` — every level descriptor verbatim, with provenance.
- `planning/protocol-b-planning.md` — monolith; 9 session laws, C-LADDER, 53 `@FIELD_COMMIT` ids.

**New cell — `protocols/ocr/language2/` (J351/02)** — the same five files (`foundation-c2.md`,
`knowledge-mark-scheme-c2.md`, 56 `@FIELD_COMMIT` ids).

**Part D rubrics (new, in `protocols/shared/modules/rubrics/`)**
- `rubric-ocr-lang-c1-nonfiction.md` — every chip button defined, `device-*` group included.
- `rubric-ocr-lang-c2-fiction.md` — every chip button defined, `device-*` explicitly not in the ladder.

**Marks sources (new, in `protocols/_marks/`)** — `ocr__language_c1.json`, `ocr__language_c2.json`,
`ocr__literature_p1.json`, `ocr__literature_p2.json`.

**Other** — `protocols/ocr/_journeys-2026-09-13.json` (7 question types × 4 responses = 28 rows),
`protocols/ocr/_sources/` (4 PDFs + 6 extracted `.txt`), this report.

**Nothing else was touched.** No `.js`, no `.php`, no `protocols/aqa/**`, no
`protocols/shared/modules/**` beyond the two new rubric files, no other board's directory, no
`PROTOCOL-STANDARD.md` / `PEDAGOGY.md` / `PROTOCOL-QUESTION-STRUCTURE-MAP.md` /
`language-paper-specs.json` / `literature-paper-specs.json`, no version bump, no commit, no deploy.

---

## 4 · GATE OUTPUT (pasted)

```
$ node bin/protocol-standard-audit.js --board ocr
board/subject                 ASSESS pass/abs  RG  FB  TMF  last      PLAN pass/abs  FC  GR  last   POLISH
ocr/language1                 10/10  6   7   7                        8/8  54  2                    —
ocr/language2                 10/10  6   7   7                        8/8  57  2                    —
ocr/literature                2/10  0   0   6    2026-06-27           1/8  0   0   2026-03-25       monolith 1 7901   0  2026-03-25
ocr/poetry                    2/10  0   0   0    2026-03-25           1/8  0   0   2026-03-25       monolith 1 5590   0  2026-03-25
```
**Assessment B-CHECKS 10/10 and planning C-CHECKS 8/8 for both new cells.** `POLISH` reads `—`
because the router has no `essay_polishing_env` row for OCR yet — that is the engine ask in §5.
`ocr/literature` and `ocr/poetry` are unchanged monoliths (not in scope, see §8).

```
$ node bin/tariff-gate.js --only ocr
✔ tariff-gate: 4 paper(s) gated, 123 checks, every mark quoted from the board's own document

[notes] E PROTOCOL — ocr/literature_p1 Q1/Q2/Q3 and ocr/literature_p2 Q1/Q2/Q3:
        no "Assessment Sub-Protocol: Question N" section in protocol-a-assessment.md,
        so its tariff is UNVERIFIED (not clean, just unchecked).
```
Those six notes are the truth: the Literature monoliths carry no per-question sections, so the gate
cannot check their tariffs against the board. They are notes, not failures.

**Whole-tree re-run at the end of this pass** (other lanes were writing concurrently, so this is a
point-in-time reading, 2026-09-13):
```
$ node bin/tariff-gate.js
✔ tariff-gate: 21 paper(s) gated, 616 checks, every mark quoted from the board's own document
[note] UNGATED — no protocols/_marks source, so NOTHING verifies these tariffs:
       aqa/language_p1
       aqa/language_p2
```
Earlier in the session the same command was RED with 9 problems (3 on `edexcel-igcse` — protocol files
a sibling lane had not yet written — and 6 on `eduqas/language_c2`, whose protocol marked Q1a/b/c and
Q3a/b/c out of 3 where the board says 1). Those cleared while this lane worked; none of them were
this lane's files and none were edited here. The only remaining coverage note is that the two AQA
Language papers — the anchors — still have no `_marks` source of their own.

```
$ node bin/essay-polishing-env-gate.js
✅ essay-polishing-env-gate passed  (249 assertions, 0 failed)
```
Green, but it asserts nothing about OCR yet — there is no OCR row for it to check.

```
$ node bin/plan-fanout-harness.js      # 46 failures total; 33 of them are OCR's
FAIL protocols/ocr/language1/planning: plan-Q2-para-1 label UNMAPPED<Text 1>   — extend _planLabelElement
FAIL protocols/ocr/language1/planning: plan-Q2-para-1 label UNMAPPED<Text 2>   — extend _planLabelElement
FAIL protocols/ocr/language1/planning: plan-Q2-para-1 label UNMAPPED<Together> — extend _planLabelElement
FAIL protocols/ocr/language{1,2}/planning: plan-Q4-body-{1,2,3} label UNMAPPED<Text 1 | Comparison | Impact | Judgement>
— protocols/ocr/language1/planning: 13 plan @FIELD_SETs → 57 fan-out ids checked
— protocols/ocr/language2/planning: 13 plan @FIELD_SETs → 60 fan-out ids checked
```
**All 33 OCR failures are the SAME missing thing: six rows in `_planLabelElement`** (§6.1). Every plan
field name and every outline id already resolves through the existing `_planOutlineTargets` regexes —
that was designed for deliberately, to keep the engine delta to six lines. The other 13 failures are
`sqa/ruae` (another lane).

```
$ node bin/ladder-check-harness.js
— PROTOCOL protocols/ocr/language1/planning: ladder-enabled, all three invariants hold.
— PROTOCOL protocols/ocr/language2/planning: ladder-enabled, all three invariants hold.
❌ ladder-check-harness FAILED
```
Both OCR planning protocols PASS all three C-LADDER invariants. The single failure is another lane's
file — `protocols/edexcel-igcse/language1/planning`, invariant (b): a lens line reads "the change in
the writer's situation at this point", which names content rather than a direction. Reported here so
nobody chases it into OCR. The harness's el byte-trace still covers AQA + EDUQAS lit only; adding the
OCR el lists to it is part of §6.3.
```

```
$ grep -rn "paste" protocols/ocr/language1 protocols/ocr/language2 | grep -v <prohibition lines>
0
```
Zero paste asks. Every occurrence of the word is a prohibition.

---

## 5 · ROUTER ROWS + CHIP LADDERS (for the engine lane)

### 5.1 `resolve_protocol_group` — **NO CHANGE NEEDED** (measured, read-only)

`includes/class-protocol-router.php` ~3229 already carries, inside the `'ocr'` map:

```php
                'language1'             => 'language1',
                'language2'             => 'language2',
```

and the normaliser above it already folds `language_p1` / `language_paper_1` / a bare `language` with
a `*_paper_N` text slug into `language1`/`language2` (v7.20.610, #482). `$question_subjects`
(~5526/5552) is board-blind and already lists `language1`/`language2`, so both cells enter
question-mode. **Text slugs the lessons must carry: `ocr_lang_paper_1` (J351/01) and
`ocr_lang_paper_2` (J351/02)** — the same `<board>_lang_paper_N` shape as every other board, and
`ocr_lang_paper_1` is ALREADY in the router's `$nonfiction_lang_texts` list (~2114) and the chip's
`NF_TEXTS` (`wml-selection-chip.js` ~328), which is correct: J351/01 is the non-fiction paper.

### 5.2 `essay_polishing_env` — the rows to ADD (byte-exact, into `$essay_polishing_rubrics`)

```php
            'ocr_lang_paper_1' => [
                'cell'   => 'ocr/language1',
                'rubric' => 'rubric-ocr-lang-c1-nonfiction.md',
                'gold'   => ['protocols/ocr/language1/modules/knowledge-mark-scheme-c1.md'],
                'engine' => 'language',
            ],
            'ocr_lang_paper_2' => [
                'cell'   => 'ocr/language2',
                'rubric' => 'rubric-ocr-lang-c2-fiction.md',
                'gold'   => ['protocols/ocr/language2/modules/knowledge-mark-scheme-c2.md'],
                'engine' => 'language',
            ],
```

⚠️ **`gold` points at the mark-scheme file, not a model-answer file, because none exists (GOLD
MISSING).** That file carries the verbatim descriptors and the explicit instruction not to fake a
model. If Neil would rather the coach could show a model's SHAPE, the alternative is to add
`protocols/aqa/language2/modules/knowledge-mark-scheme.md` (transactional) or
`protocols/aqa/language1/modules/knowledge-hub.md` (creative) as a SECOND gold entry — but only with
the rubric's "another board's paper" labelling intact. **That is a decision, not a default (§7.1).**

### 5.3 Chip ladders (`frontend/wml-selection-chip.js` ~355)

```js
        const ESSAY_POLISH_ENV_TEXTS = ['aqa_lang_paper_1', 'aqa_lang_paper_2', 'ocr_lang_paper_1', 'ocr_lang_paper_2'];
```
and the fiction test must stop being a single-slug comparison, because **on OCR it is the SECOND
paper that is fiction** (the inverse of AQA):
```js
        const FICTION_LANG_TEXTS = ['aqa_lang_paper_1', 'ocr_lang_paper_2'];
        const isFictionLang = isLangEnv && FICTION_LANG_TEXTS.indexOf(envText) !== -1;
```
Ladder per cell (the rubric defines every button):
- **`ocr_lang_paper_1` (non-fiction/transactional)** — `langScan` → `elementPolish` → `devices`
  *(Q5 only)* → `langWordChoice` *(Q5)* / `langWordChoiceReading` *(Q1–Q4)* → `polishProse` →
  `fixSpag` → `reference`. Same shape as `aqa_lang_paper_2`.
- **`ocr_lang_paper_2` (fiction/creative)** — `langScan` → `elementPolish` → `langWordChoice` *(Q5)* /
  `langWordChoiceReading` *(Q1–Q4)* → `polishProse` → `fixSpag` → `reference`. Same shape as
  `aqa_lang_paper_1`; **no `devices` group**, and `scan-context-drive` must not appear on either OCR
  paper (J351 has no context AO — OCR's AO3 is comparison).
- **Section-B gating:** the writing question is `Q5` on both OCR papers, so the existing
  `isSectionB = (q === 'Q5')` test needs no change.

---

## 6 · JS-ROWS SPEC (the engine-side rows this lane cannot add)

Written in the form of `EDEXCEL-IGCSE-JS-ROWS-SPEC-2026-08-16.md`. Everything below is in
`frontend/wml-assessment.js` unless stated.

### 6.1 `_planLabelElement` — SIX new label rows (clears all 33 plan-fanout failures)

In the body-family block (after the existing `if (l.indexOf('close') === 0) return 'analysis';`):

```js
        if (/^text\s*1/.test(l)) return 'text1';           // OCR Q4 — the Text 1 quotation + inference
        if (l.indexOf('comparison') === 0) return 'compare'; // OCR Q4 — the comparative pivot into Text 2
        if (l.indexOf('impact') === 0) return 'impact';     // OCR Q4 — impact on the reader
        if (l.indexOf('judgement') === 0) return 'judgement'; // OCR Q4 — how far the statement holds
        if (/^text\s*2/.test(l)) return 'evidence2';        // OCR C1 Q2 — the second text's evidence
        if (l.indexOf('together') === 0) return 'synthesis'; // OCR C1 Q2 — what both show together
```
⚠️ `text1` must be tested BEFORE `text2`/`together` only in the sense that all six are mutually
exclusive prefixes; no existing row is shadowed (nothing in the current map begins "text",
"comparison", "impact", "judgement" or "together").

### 6.2 `OUTLINE_CRITERIA` — a new key per paper, so the outline rows render

The two cells' documents need element rows the builder does not have. Proposed entries (mirroring the
`inference` block's shape), keyed so nothing else changes:

```js
        // ── OCR J351/01 Q2 — synthesis across two texts (AO1ii, 6 marks, 2 connections × 3.0) ──
        ocr_synthesis: [
            { id: 'topic',      label: 'Topic — the shared idea', ao: 'AO1', type: 'checkbox', prompt: 'The idea both texts share — one clear sentence' },
            { id: 'evidence',   label: 'Text 1',   ao: 'AO1', type: 'checkbox', prompt: 'A short quotation from Text 1, embedded, and what it tells us' },
            { id: 'evidence2',  label: 'Text 2',   ao: 'AO1', type: 'checkbox', prompt: 'A short quotation from Text 2 on the SAME idea, and what it tells us' },
            { id: 'synthesis',  label: 'Together', ao: 'AO1', type: 'checkbox', prompt: 'What the two quotations show TOGETHER — the conceptual idea' },
        ],
        // ── OCR J351 Q4 — comparative evaluation (AO4 12 + AO3 6) ──
        ocr_comparative_evaluation: [
            { id: 'topic',      label: 'Topic',          ao: 'AO4', type: 'checkbox', prompt: 'A comparative claim that faces the statement’s own words' },
            { id: 'text1',      label: 'Text 1',         ao: 'AO4', type: 'checkbox', prompt: 'Quotation from Text 1 + what you infer from it' },
            { id: 'compare',    label: 'Comparison',     ao: 'AO3', type: 'checkbox', prompt: 'Text 2 on the same point — quotation + how it compares' },
            { id: 'analysis',   label: 'Close analysis', ao: 'AO4', type: 'checkbox', prompt: 'One word or detail, unpacked' },
            { id: 'impact',     label: 'Impact',         ao: 'AO4', type: 'checkbox', prompt: 'The impact on the reader' },
            { id: 'judgement',  label: 'Judgement',      ao: 'AO4', type: 'checkbox', prompt: 'How far the statement holds here — use a careful word' },
        ],
```
Plus **a third Q3 paragraph**: the existing TTECEA body loop must render `outline-body-3-*-q3` for
these cells (both OCR papers teach THREE paragraphs on the 12-mark question, where AQA P1 teaches two
on its 8-mark questions). And **Q2 on `ocr/language2`** uses the TTECEA body set minus `effects2`
(five elements, 3.0) — a per-paper element filter, not a new set.

### 6.3 Ladder paper config (`_ladderPaperKey`, `_LADDER_QUESTION_ORDERS`, `_ladderRegistry`)

**Measured defect:** `_ladderPaperKey()` (~4236) returns `'p1'` when `_isLangPaper1()` and `'p2'`
otherwise, and both predicates test **`state.subject` only** — they are board-blind. So today an OCR
`language1` lesson would walk the **AQA P1** registry (Q2/Q3 two paragraphs, Q4 unsuffixed bodies) and
an OCR `language2` lesson the AQA P2 registry. Those element ids do not exist in the OCR documents, so
the ladder would walk boxes that are not there.

```js
    function _ladderPaperKey() {
        if ((typeof _isLitEssay === 'function' && _isLitEssay()) || (typeof _isPoetryLadder === 'function' && _isPoetryLadder())) return 'lit';
        var brd = String((state && state.board) || '').toLowerCase().replace(/[^a-z]/g, '');
        if (brd === 'ocr' && typeof _isLangPaper1 === 'function' && _isLangPaper1()) return 'ocr_c1';
        if (brd === 'ocr' && typeof _isLangPaper2 === 'function' && _isLangPaper2()) return 'ocr_c2';
        return (typeof _isLangPaper1 === 'function' && _isLangPaper1()) ? 'p1' : 'p2';
    }
    var _LADDER_QUESTION_ORDERS = { p2: ['q2','q3','q4','q5'], p1: ['q2','q3','q4'], lit: ['bodies','intro','conclusion'],
                                    ocr_c1: ['q2','q3','q4','q5'], ocr_c2: ['q2','q3','q4','q5'] };
```
Registries (element order = planning-beat order; `resolveBy` = the outline id, or `'stamp'` for a beat
that files nothing). **C1:** Q2 = 2 × (topic · evidence · evidence2 · synthesis) suffixed `-q2`;
Q3 = 3 × (topic · `q3-feature-pN` stamp · evidence · analysis · effects · effects2 · purpose) suffixed
`-q3`; Q4 = `outline-intro-stance-q4`, `outline-intro-thesis-q4`, then 3 × (topic · text1 · compare ·
analysis · impact · judgement) **unsuffixed**, then `outline-conclusion-thesis`; Q5 = the six
`outline-iumvcc-*-q5`. **C2:** Q2 = 2 × (topic · evidence · analysis · effects · purpose) suffixed
`-q2`; Q3, Q4 as C1; Q5 = the seven `outline-scene-*-q5`. The byte-exact id list per cell is the
"THE N MARKERS, LITERALLY" block at the end of each planning monolith's field contract — copy from
there, do not retype.

### 6.4 Pre-chain goal options — **a real inversion defect, not a cosmetic one**

`PRECHAIN_GOAL_OPTIONS_LANG` / `_LANG_P2` (~16641) are chosen by `_preChainIsLangP2()`, which tests
**subject only**. On OCR that hands the student the wrong paper's options *in both directions*:
J351/01 (`language1`) would be offered *"Crafting an engaging piece of creative writing (AO5)"* —
but its Section B is transactional; J351/02 (`language2`) would be offered *"Crafting persuasive
transactional writing (AO5)"* — but its Section B is creative. Add board-aware sets (paper-true lists
are in each protocol's §2b, verbatim) in BOTH pipelines (~6418 + ~14755 twins), and key the chooser on
`board + subject`.

### 6.5 Self-assessment skill sets — the same inversion

`buildSelfAssessmentSection`'s `_isLangP1` / `_isLangP2sa` (~57721) are subject-only, so OCR
`language1` gets a *"Creative Writing (Q5)"* group and OCR `language2` gets *"Transactional Writing
(Q5)"* — inverted. The skills themselves are identical; only the label and the board test need fixing.
OCR also wants an *"Across Two Texts"* group (`Synthesis` on C1, `Comparison` on both).

### 6.6 Recall-target rotation wording

`_recallAskForTarget` (~2986) branches on `_isLangPaper2()` and calls Q2 "the inference question" and
Q5 "transactional writing" — wrong for OCR C2 (Q2 is language; Q5 is creative) and for OCR C1 (Q2 is
synthesis). The paper-true one-line reasons are in each protocol's §2c, verbatim.

### 6.7 `MULTIQ_RESPONSE_TARGETS` + `_multiqTargetKey`

`_multiqTargetKey()` returns `null` unless `state.board === 'aqa'`, so **no code-computed word-count
ceiling reaches either OCR paper**. Both protocols are written to match that exactly: they echo an
injected ceiling if one arrives and are forbidden from inventing one otherwise. If Neil wants a length
target taught, add:
```js
        'ocr|lang_paper_1': { Q1: 0, Q2: 150, Q3: 350, Q4: 500, Q5: 550 },
        'ocr|lang_paper_2': { Q1: 0, Q2: 150, Q3: 350, Q4: 500, Q5: 550 },
```
⚠️ **Those five numbers are OURS, derived from the marks and the two-hour paper — OCR prints no word
guidance on either component.** They are a proposal for Neil to rule on, not a board fact (§7.2).

### 6.8 Caps registry + `getResponseText` labeller

Add the two papers to the board caps map (~22889) with the tariffs in §2, and to the per-question
paragraph labeller: **C1** Q2 → 2 connections, Q3 → 3 paragraphs, Q4 → intro + 3 bodies + conclusion,
Q5 → whole; **C2** Q2 → 2 paragraphs, Q3 → 3, Q4 as C1, Q5 → whole.

---

## 7 · PROPOSED EDITS TO FILES THIS LANE MAY NOT TOUCH

### 7.1 `protocols/shared/language-paper-specs.json` — the `ocr` block is WRONG on AOs

The block exists and is marked `"verified": true`, but two of its claims contradict the board's own AO
grid, and one is unsourced:

| key | in the file now | the board's grid says | evidence |
|---|---|---|---|
| `ocr.language_c1.sections[0].questions[3].aos` | `["AO1","AO2","AO3"]` | **`["AO3","AO4"]`** — Q4 is AO4 12 + AO3 6 | Nov 2024 grid row `4 0 0 6 12 0 0 18`; skills line "Mark the response out of 12 marks (AO4) and out of 6 marks (AO3)" |
| `ocr.language_c2.sections[0].questions[3].aos` | `["AO1","AO2","AO3"]` | **`["AO3","AO4"]`** | Jun 2023 grid row `4 0 0 6 12 0 0 18` |
| `ocr.language_c1.…Q5` / `c2.…Q5` | no `content_marks` / `spag_marks` | **`content_marks: 24`, `spag_marks: 16`** | "Mark the response out of 24 marks (AO5) and out of 16 marks (AO6)" |
| `ocr.language_c2.…Q1.sub_parts` | `"1a(3)+1b(1)"` | **varies by series** — Jun 2023 is 2+1+1, Jun 2017 is 1+1+2 | both grids |
| `ocr.language_c1.…Q2.type` | `"comparison"` | better `"synthesis"` — AO1ii, and calling it comparison invites AO3 coaching the question does not assess | Q2 skills line: "AO1ii: Select and synthesise evidence from different texts." |
| both `source` fields | "OCR J351/0N specification + June 2024 past papers" | the documents actually read are the Nov 2024 / Nov 2021 / Jun 2023 / Jun 2017 **mark schemes** now on disk | §1 |

**Byte-exact replacement for the two Q4 entries** (everything else in the block stays):
```json
     {
      "id": "Q4",
      "marks": 18,
      "aos": [
       "AO3",
       "AO4"
      ],
      "type": "evaluation",
      "content_marks": 12,
      "spag_marks": null,
      "description": "How far do you agree with the statement? Evaluate (AO4, 12) and compare both texts (AO3, 6)"
     }
```
and for each Q5, add the two fields:
```json
      "content_marks": 24,
      "spag_marks": 16,
```
**Marks and totals need no change** — 4 / 6 / 12 / 18 / 40 = 80 is already right on both components,
and `tariff-gate` check D confirms it (both OCR Language papers cite `spec.key`).

### 7.2 `protocols/shared/literature-paper-specs.json` — `ocr.modern_text` is a 40 where the paper says 20

`ocr.modern_text` records `marks: 40` with `split: {intro 5, body 9 ×3, conclusion 8}`. J352/01
Section A is **two 20-mark questions** (part (a) and part (b)), not one 40-mark essay — so a student
would be marked out of a total the paper does not award, and our element split would contradict the
tariff. Proposed shape (mirroring `poetry_anthology`, which is already recorded correctly at 20):
```json
  "modern_text": {
   "shape": "lit-extract-paired",
   "marks": 20,
   "spag_marks": null,
   "aos": ["AO1", "AO2", "AO3"],
   "split": null,
   "_split_note": "J352/01 Section A is TWO 20-mark questions on ONE studied modern text: part (a) compares a studied extract with an UNSEEN extract (AO1+AO2+AO3, holistic, 'AO1 and AO3 are the equally dominant assessment objectives'), part (b) is a whole-text essay (AO1+AO2, 'equally weighted'). Both marked holistically on six levels 18-20 / 15-17 / 11-14 / 7-10 / 4-6 / 1-3 — NOT the 3-body TTECEA split. Verified against the June 2024 Component 1 mark scheme, AO grid rows '1a, 2a, 3a 8 12 20' and '1b, 2b, 3b 10 10 20'.",
   "_was": "marks 40 with a 5/9x3/8 split — corrected 2026-09-13 by the OCR lane; the 40 belongs to Section B (19th century prose), which is recorded separately."
  },
```
This lane did **not** edit the file: the CCEA and SQA lanes are writing to it in the same window, and a
concurrent whole-file rewrite would clobber them. `ocr__literature_p1.json` therefore omits
`spec_key` on Q1/Q2 and says why; add the key back once the block is corrected.

### 7.3 `PROTOCOL-QUESTION-STRUCTURE-MAP.md` / `PROTOCOL-COVERAGE-MATRIX.md`

Add the six rows of §2/§2b/§2c with this report as the source. Not edited here (both are on the
do-not-touch list for content lanes).

---

## 8 · WHAT WAS **NOT** DONE, AND WHY

1. **OCR Literature was not ported.** `protocols/ocr/literature/` (Shakespeare + 19th century) and
   `protocols/ocr/poetry/` (anthology + unseen) are the March-2026 monoliths and stayed untouched: the
   audit still reads 2/10 and 1/8 for both. Porting them needs the LIT anchor path, per-text context
   banks and the paired-extract shape, which is a second batch of the same size as this one. What was
   done instead — because it is the half that stops a future invented tariff — is the two gated marks
   files with citations, the AO grid, the level ranges, the "36 +4" split and the extract/wider-text
   rubric caps. **No `rubric-ocr-lit-*.md` was written:** a Part D rubric must mirror a PORTED cell's
   per-question structure, and writing one against a monolith whose own tariffs may be wrong (e.g. the
   spec's 40-vs-20 above) would ship half a chain.
2. **No staging run of anything.** No lesson opened, no chat turn driven, no document rendered. Every
   claim in §4 is a static gate result.
3. **No second Literature series** (not on disk; see §1).
4. **No OCR specification PDF** (see §1).

---

## 9 · UNRESOLVED DECISIONS FOR NEIL

1. **GOLD MISSING on all four OCR Language question types.** Options: (a) leave it as built — coach
   from criteria + descriptors only; (b) let the coach borrow AQA's model answers for SHAPE, always
   labelled as another board's paper; (c) commission OCR model answers (the highest-value option, and
   the only one that gives `compare-gold-standard` its real job). Built as (a).
2. **Section B word targets** — §6.7's five numbers per paper are ours, not the board's. Rule them or
   leave the ceiling off.
3. **J351/01 Q2 taught as TWO connections of 3 marks.** The board gives 6 marks on a three-level
   ladder and does not prescribe a paragraph count; two connections is our reading of "synthesise
   appropriate ideas and evidence from both texts". A single richer connection is defensible.
4. **J351 Q4's 1.5 / 5 / 5 / 5 / 1.5 split.** The AO strands sum exactly (AO4 12.0, AO3 6.0), but the
   short intro and conclusion are deliberately light because the board marks the two strands across
   the whole answer. If Neil wants the introduction to carry more teaching weight, the split has to be
   re-balanced with the AO sums held.
5. **Literature port sequencing** — J352/01 and J352/02 in one batch (they share level descriptors and
   the 36+4 grid), or Shakespeare first?

## 10 · UNTESTED ROUTES (every one of them)

- Both OCR Language assessment protocols: never run against a real student response, on staging or
  anywhere.
- Both planning monoliths: never walked; and the ladder has no OCR arm yet (§6.3), so the help levels
  would currently be played from prose, not from code-owned state.
- Both polishing rubrics: no router row exists, so the environment cannot be entered — all 28 journey
  rows are unrun (`_journeys-2026-09-13.json` says so in its own `_not_tested` field).
- Outline rows and plan boxes for all 109 new fieldIds: not rendered (the builder rows are §6.2).
- The document itself: never opened in a browser for either cell.
