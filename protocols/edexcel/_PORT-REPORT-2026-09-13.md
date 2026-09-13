# PORT REPORT — Edexcel GCSE English Language (1EN0), Papers 1 and 2 · 2026-09-13

**Lane:** Edexcel GCSE English Language (1EN0) content lane. **Not** Edexcel International GCSE Language A
(4EA1) — a different lane owns that, and nothing in this report touches `protocols/edexcel-igcse/`.
**Branch:** `ports-2026-09-13` in the shared worktree. **Nothing committed, no version bumped, nothing
deployed** (WML CLAUDE.md §PARALLEL LANES — the engine lane ships these files).

Facts only. Where something is untested, it says so.

---

## 1 · PROVENANCE (PROTOCOL-STANDARD Part E1 — the two-line header per paper)

**Paper 1 (1EN0/01, Fiction and Imaginative Writing)**
`mark scheme:` `MSR/Edexcel GCSE English Language Paper 1/Edexcel GCSE English Language Paper 1 Mark Scheme/June 2024 MS - Paper 1 Edexcel English Language GCSE.pdf` — Mark Scheme (Results) Summer 2024; second series read: `November 2023 MS - Paper 1 Edexcel English Language GCSE.pdf` (extracted to `protocols/edexcel/_sources/p1-ms-nov2023.txt`); question paper read: `June 2024 QP - Paper 1 Edexcel English Language GCSE.pdf`
`anchor:` the LANGUAGE anchor `protocols/aqa/language1/modules/protocol-a-assessment.md` — verified against AQA Lang P1: **yes**

**Paper 2 (1EN0/02, Non-fiction and Transactional Writing)**
`mark scheme:` `MSR/Edexcel GCSE English Language Makr Schemes/June 2024 MS - Paper 2 Edexcel English Language GCSE.pdf` — Mark Scheme (Results) Summer 2024; second series read: `June 2022 MS - Paper 2 Edexcel English Language GCSE.pdf` (extracted to `protocols/edexcel/_sources/p2-ms-jun2022.txt`); question paper read: `June 2024 QP - Paper 2 Edexcel English Language GCSE.pdf`
`anchor:` the LANGUAGE anchor `protocols/aqa/language1/modules/protocol-a-assessment.md`, via its sibling port `protocols/edexcel/language1/modules/protocol-a-assessment.md` — verified against AQA Lang P1: **yes**

**On the third source tree.** `bin/tariff-gate.js` resolves only the `MSR/` and `CAM/` aliases. Both
papers' PRIMARY authority (the June 2024 mark schemes) resolves under `MSR/`, so **no new alias is
needed and none is proposed.** The SECOND series for each paper lives in `My Drive/GCSE English
Courses/`, which the gate cannot reach, so its `pdftotext -layout` output is committed to
`protocols/edexcel/_sources/` with a README naming each source PDF — the protocol headers cite those
paths. The PDFs themselves are not copied.

⚠️ **Worktree note for whoever runs the gate next.** `MSR_ROOT` is computed as
`<plugin dir>/../../Sophicly Etch Mark Scheme Resources`. In a worktree outside the Drive tree that
path does not exist and the gate reports **every** cited authority as missing — a false failure that
looks exactly like a wrong citation. I made it resolve by symlinking the real folder two levels above
the worktree. In the real checkout no symlink is needed.

**One drift found across series, recorded, not applied.** The November 2023 Paper 1 mark scheme prints
the AO6 bands as 1–3 · 4–6 · 7–9 · 10–12 · 13–16; the June 2024 grids for BOTH papers print 1–4 · 5–7 ·
8–10 · 11–13 · 14–16. June 2024 is the current series and is what both protocols quote.

---

## 2 · QUESTION MAP

### Paper 1 — 64 marks (Section A 24 + Section B 40), 1 h 45

| Q | Marks | AO | Board's method | Shape taught | Template | Gold | Changed? |
|---|---|---|---|---|---|---|---|
| Q1 | 1 | AO1 | points | one word/phrase, no paragraphs | AQA P1 Q1 SKIP rule | n/a (retrieval) | verified, unchanged |
| Q2 | 2 | AO1 | points | two points | AQA P1 Q1 SKIP rule | n/a | verified, unchanged |
| Q3 | 6 | AO2 | levels ×3 (1–2 · 3–4 · 5–6) | 2 TTECEA ¶ × 3: ¶1 language, ¶2 structure | LANGUAGE anchor Q2/Q3 | `language1/modules/knowledge-hub.md` §2.A | verified, unchanged |
| Q4 | 15 | AO4 | levels ×5 (1–3 … 13–15) | 4 evaluative ¶, body-only, 3+4+4+4 | AQA P1 Q4 | `knowledge-hub.md` §2.A | verified, unchanged |
| Q5 | 40 | AO5 24 + AO6 16 | levels ×5 each | holistic, seven scene elements, 650-word target | AQA P1 Q5 | `knowledge-hub.md` §2.A | verified, unchanged |

### Paper 2 — 96 marks (Section A 56 + Section B 40), 2 h 5 (Section A ≈ 1 h 20 by the paper's own line)

| Q | Marks | AO | Board's method | Shape taught | Template | Gold | Changed? |
|---|---|---|---|---|---|---|---|
| Q1 | 2 | AO1 | points | two points, Text 1 | AQA P1 Q1 SKIP rule | n/a | **rewritten** |
| Q2 | 2 | AO1 | points | two points, printed extract | AQA P1 Q1 SKIP rule | n/a | **rewritten** |
| Q3 | 15 | AO2 | levels ×5 (1–3 · 4–6 · 7–9 · 10–12 · 13–15) | 3 TTECEA ¶ × 5: ¶1 LANGUAGE, ¶2 STRUCTURE, ¶3 the two TOGETHER | LANGUAGE anchor Q2/Q3 | `language2/modules/knowledge-mark-scheme.md` §2A (three variants: language · structure · balanced) | **rewritten** |
| Q4 | 1 | AO1 | points | one point, Text 2 | SKIP rule | n/a | **rewritten** |
| Q5 | 1 | AO1 | points | one point, Text 2 | SKIP rule | n/a | **rewritten** |
| Q6 | 15 | AO4 | levels ×5 | 3 evaluative ¶ × 5, body-only | AQA P1 Q4, shortened to 3 ¶ | §2A (three evaluative variants) | **rewritten** |
| Q7a | 6 | AO1 | levels ×3 (1–2 · 3–4 · 5–6) | 2 SIMILARITY ¶ × 3, both texts inside each | AQA P2 Q2 paired-inference, re-purposed for synthesis | §2A Q7a (shape delta below) | **rewritten** |
| Q7b | 14 | AO3 | levels ×5 (1–2 · 3–5 · 6–8 · 9–11 · 12–14) | 3 comparative ¶, both texts + a pivot inside each: 5 + 4.5 + 4.5 | AQA P2 Q4 comparative | §2A Q7b | **rewritten** |
| Q8 (or Q9) | 40 | AO5 24 + AO6 16 | levels ×5 each | holistic, IUMVCC, 650-word target | AQA P2 Q5 | §2A Section B | **rewritten** |

**Every tariff is quoted from the board's own per-question objectives table** (`Question 1 … 2`,
`Question 7a … 6`, `Question 8 or 9 … 24 16 40`, `TOTAL FOR PAPER = 96 MARKS`) and confirmed identical in
the June 2022 series. **No gold is missing** for either paper: P1's golds are in
`language1/modules/knowledge-hub.md` §2.A, P2's in `language2/modules/knowledge-mark-scheme.md` §2A. No
question type is marked **GOLD MISSING**.

### Deltas, and why each one exists

1. **P2 Q3 and Q6 are THREE paragraphs, not four, although P1's 15-mark Q4 is four.** The reason is the
   board's own timing line: Section A is 56 marks in about 1 h 20, so Q3 and Q6 each get ~21 minutes,
   against the ~28 minutes P1's Q4 gets from its 24-mark Section A. Three paragraphs at 5 marks each is
   what fits, and the worths still sum to exactly 15. This is a derivation from the paper, not taste.
2. **P2 Q3's third paragraph pairs language with structure.** The board's balance rule bites twice —
   *"cannot progress beyond the top of Level 2 if only language OR structure has been considered"* and
   *"Responses that are unbalanced cannot access Level 3 or above"* — and a 2:1 split invites the second
   charge. Language · structure · both-together guarantees balance and is exactly what Level 5 describes.
   The gold file already holds a "Balanced Language and Structure" model paragraph, so the three taught
   paragraphs map one-for-one onto the three models on file.
3. ⚠️ **P2 Q7a changed shape against the gold file.** `knowledge-mark-scheme.md` §2A models Q7a
   text-by-text (Paragraph 1 = Text 1, Paragraph 2 = Text 2). The objective is *"Select and synthesise
   evidence from different texts"* and Level 3 asks for *"Detailed synthesis of the two texts"*, so the
   mark scheme wins (Part E2) and the taught shape is one SIMILARITY per paragraph carrying BOTH texts.
   The §2A paragraphs remain usable as sentence-level models. **A gold-file update is proposed in §7.**
4. **P2 Q7b's worths are 5 · 4.5 · 4.5, where the retired monolith had 4.5 · 4.5 · 5.** ¶1 carries the
   extra half mark on its combined-judgement criterion because ¶1 states the overarching comparative claim
   the rest of the answer sustains — the same reason P1 Q4's ¶1 differs from its ¶2–4. Total is 14 either
   way; this is a deliberate, disclosed change of which paragraph is heavier.
5. **Two faults have NO penalty code on P2, deliberately.** "Only one text in this paragraph" is already
   charged twice (the missing text's criteria score 0, plus the board's own 5/14 cap); "the comparison is
   never pivoted" is already charged once (the pivot IS a 0.5 criterion). An earlier cut of this port
   invented a `Z1` code for the second one — removed, because it breaks ONE FAULT ONE CHARGE and because
   `Z1` has no `PENALTY_LEARN_MAP` entry, so it would also have emitted a penalty with no learn chip.
   `I1` is used as the EXISTING universal inference code (it is already mapped to the Close Analysis
   toolkit section in `wml-core.js`), not as a new Paper-2 invention.
6. **The 650-word target on both papers is OURS.** Edexcel prints no length guidance for either writing
   question. Both protocols now say so explicitly and forbid telling the student the examiner requires it.
7. **The retired monolith's "CB1–CB4 comparison penalty codes" are gone**, along with the `H1-COMP`
   automatic-cap code. The cap is the board's own rule and is applied as a CAP on the question-total line,
   never as a penalty.

---

## 3 · FILES CHANGED

**Written this cycle (Paper 2 — built from scratch):**
- `protocols/edexcel/language2/modules/protocol-a-assessment.md` — full rewrite against Part B. Was the
  1,502-line March-2026 monolith (audit 2/10, "Main Menu", "Assessment Type Selection", "Part B: Source
  Collection", "Exam Practice"); now 10/10 with zero paste asks.
- `protocols/edexcel/language2/modules/knowledge-mark-scheme-lang2.md` — **new.** Every Paper 2 level
  descriptor, verbatim, with the board's Specific Marking Guidance and its per-question objectives table.
  The only file the Level Alignment step may quote from.
- `protocols/edexcel/language2/modules/knowledge-safeguarding.md` — rewritten to the current flow. The
  previous version instructed the model to make the student "copy the relevant output into their
  workbook" and to present "the main menu" again at the end of every workflow. Both are retired, and both
  were being loaded into every assessment turn.
- `protocols/edexcel/language2/modules/foundation-lang2.md` — two surgical edits: the version-history
  block is now labelled HISTORICAL RECORD ONLY (it described an "Exam Practice" mode and a word-count
  hard stop that no longer exist), and the sentence-scanner's one paste ask is gone.
- `protocols/edexcel/language2/manifest.json` — `assessment.always` pruned (see §3b), the new
  mark-scheme module added, `polishing.always` emptied with a `_retired` note.
- `protocols/shared/modules/rubrics/rubric-edexcel-lang-p2-nonfiction.md` — **new**, Part D shape,
  mirroring `rubric-aqa-lang-p2-nonfiction.md` section for section.
- `protocols/edexcel/_journeys-2026-09-13.json` — 18 journeys (16 graded + 2 guard journeys).
- `protocols/edexcel/_sources/{README.md, p2-ms-jun2022.txt, p1-ms-nov2023.txt}` — second-series
  provenance.
- `protocols/edexcel/_PORT-REPORT-2026-09-13.md` — this file.

**Verified, not changed (Paper 1 — a previous agent's work this cycle):** I re-read
`protocols/edexcel/language1/modules/protocol-a-assessment.md`, `modules/knowledge-mark-scheme-lang1.md`,
`manifest.json` and `rubric-edexcel-lang-p1-fiction.md` against the June 2024 PDF and the Nov 2023 PDF
and found **no defect to correct**: tariffs 1/2/6/15/40 = 64 match the board's table; the Q3 cap is
quoted correctly as *the top of Level 1* (2/6 — Paper 1's Level 1 is 1–2, and this is DIFFERENT from
Paper 2's top-of-Level-2 6/15, a place a careless port would copy the wrong number); worths sum exactly
(Q3 3.0/¶, Q4 3+4+4+4); 0 paste asks; polishing retired with a `_retired` note; the rubric passes all six
D-checks. **The one thing it promises that the engine cannot deliver is the Q5 word-count ceiling — see
§5.** I changed nothing in the Paper 1 cell.

### 3b · The manifest prune (ONE-TEMPLATE LAW)

Removed from `language2` `assessment.always`: `modules/knowledge-algorithm.md`,
`modules/knowledge-progress.md`, `modules/knowledge-operations.md` (1,209 lines),
`modules/knowledge-penalties.md`. All four narrate the retired March-2026 walk as if it were live — a
"Main Menu", an "Exam Practice" assessment type, an "Assessment Type Branching" step, `Type your response
to continue` cues outside protocol-a, a command menu (`P or NEXT`, `M or MENU`), and a second penalty
registry. Grep counts before the prune: knowledge-operations 18 hits, knowledge-progress 13,
knowledge-algorithm 4, knowledge-penalties 2. They stay on disk as source. `modules/knowledge-mark-scheme.md`
is KEPT because it is the GOLD file (§2A models, §2B criteria, §2.C style models, §2.D polishing criteria)
and carries no competing emission template (0 hits). Reason recorded in the manifest's `_pruned` key.

---

## 4 · GATE OUTPUT (pasted, run in this worktree, 2026-09-13)

```
$ node bin/protocol-standard-audit.js --board edexcel
PROTOCOL-STANDARD audit — B-CHECKS (assessment) · C-CHECKS (planning) · D-CHECKS (polishing: ENV rubric pass/abs, else monolith)
board/subject                 ASSESS pass/abs  RG  FB  TMF  last      PLAN pass/abs  FC  GR  last   POLISH  ENV pass/abs rubric | monolith files bytes @ last
edexcel/19th_century          2/10  0   0   9    2026-04-22           1/8  0   0   2026-03-25       monolith 1 8190   0  2026-03-25
edexcel/language1             10/10  5   9   6    2026-05-20          1/8  0   0   2026-03-25       monolith 1 5044   0  2026-03-25
edexcel/language2             10/10  7   15  10   2026-05-20          1/8  0   0   2026-03-25       monolith 1 19688  0  2026-03-25
edexcel/modern                2/10  0   0   6    2026-04-22           1/8  0   0   2026-03-25       monolith 1 8282   0  2026-03-25
edexcel/poetry                2/10  0   0   6    2026-08-18           1/8  0   0   2026-03-25       monolith 1 11517  0  2026-07-19
edexcel/shakespeare           2/10  0   0   9    2026-04-22           1/8  0   0   2026-03-25       monolith 1 8186   0  2026-03-25
edexcel/unseen                2/10  0   0   6    2026-08-18           1/8  0   0   2026-03-25       monolith 1 2419   0  2026-03-25
```

**Both language cells: ASSESS 10/10.** `RG 7` on language2 is 5 emission sites + 2 prose mentions of the
marker name inside the internal notes, which the standard allows.

```
$ node bin/tariff-gate.js --only 'edexcel/language'
✔ tariff-gate: 2 paper(s) gated, 54 checks, every mark quoted from the board's own document
```

```
$ node bin/essay-polishing-env-gate.js
✅ essay-polishing-env-gate passed  (249 assertions, 0 failed)
```

```
$ grep -c -i 'paste' protocols/edexcel/language1/modules/protocol-a-assessment.md protocols/edexcel/language2/modules/protocol-a-assessment.md
protocols/edexcel/language1/modules/protocol-a-assessment.md:0
protocols/edexcel/language2/modules/protocol-a-assessment.md:0
```

```
$ python3 -c "import json;json.load(open('protocols/edexcel/language2/manifest.json'));print('parses')"
parses
$ python3 -c "import json;d=json.load(open('protocols/edexcel/_journeys-2026-09-13.json'));print(len(d['journeys']),'journeys')"
18 journeys
```

**The POLISH column still reads `monolith` for both cells, and that is expected, not a failure.** The
audit decides "ported" by looking for a row in the ROUTER's `essay_polishing_env` map whose `cell`
matches — a `.php` file this lane may not edit. Both rubrics already satisfy all six D-checks
(`## INLINE COACHING ACTIONS` · `Provenance` · `Mark Complete` · student-chooses · `macro → micro` ·
`no task menu` — verified by grep), so each cell will print `ENV 6/6 <rubric>` the moment its router row
lands. **Nothing else is needed from this lane for that column to flip.**

---

## 5 · ENGINE-PARITY TABLE (PROTOCOL-STANDARD § E — every net, and whether it fires for THIS board)

Each row is a net the protocols rely on, the code key that triggers it, and whether that key can match an
Edexcel GCSE Language lesson. Grepped, not assumed.

| net | key / gate | fires for Edexcel 1EN0? |
|---|---|---|
| question-mode + question state machine | `$question_subjects` in `class-protocol-router.php` :5526 and :5552 — `['language1','language_p1','language_paper_1','lang_p1','language2','language_p2','language_paper_2','lang_p2']`, keyed on SUBJECT | ✅ **yes** — subject arrives as `language`, folded to `language1`/`language2` |
| pre-chain P2 detection | `_preChainIsLangP2()` — regex on `state.subject` | ✅ yes |
| pre-chain goal options | `PRECHAIN_GOAL_OPTIONS_LANG_P2` (`wml-assessment.js` :16653 + :40218) | ⚠️ **fires, but the options are AQA P2's** — they name AQA's comparison AO3 and transactional AO5 and have **no AO4 option**, which is Edexcel P2's Q6. JS-ROWS item 3 |
| keyword-recall rotation | `_recallTargetQ()` :2976 — `['Q4','Q2','Q3','Q5']`, board-agnostic | ❌ **WRONG for both Edexcel papers.** On P2, Q4 and Q5 are 1-mark retrieval questions — precisely the ones that must never be recall targets; on P1 the rotation should be Q4 → Q3 → Q5. JS-ROWS item 4 |
| recall ask wording | `_recallAskForTarget()` branches on `_isLangPaper2()` | ⚠️ fires, but describes AQA P2's question semantics (Q2 "the inference question", Q4 "comparison") |
| Section-B word-count ceiling | `MULTIQ_RESPONSE_TARGETS` :52008 has `aqa|lang_paper_1` and `aqa|lang_paper_2` only; `_multiqTargetKey()` :52015 returns `null` unless `state.board === 'aqa'` | ❌ **never fires.** Both protocols already handle this correctly — each says "if NO such line is injected, no ceiling applies and none is invented" — so nothing breaks, but the ceiling is inert on Edexcel. JS-ROWS item 1 |
| polishing environment (router branch) | `essay_polishing_env()` :1827 — `$essay_polishing_rubrics` has AQA P1 and P2 only | ❌ **no row for either Edexcel paper.** JS-ROWS item 5 |
| polishing chip ladder | `ESSAY_POLISH_ENV_TEXTS` (`wml-selection-chip.js` :355) `= ['aqa_lang_paper_1','aqa_lang_paper_2']`; fiction/nonfiction split is `envText === 'aqa_lang_paper_1'` :359; Section-B gate is `q === 'Q5'` :363 | ❌ **no** — all three need generalising. JS-ROWS item 6 |
| non-fiction coaching branch | `$nonfiction_lang_texts` (router :2114) and `NF_TEXTS` (chip :328) both ALREADY list `edexcel_lang_paper_2` | ✅ yes |
| mark auditor · grade ladder · penalty ledger · missing-unit zeros · `+X` bonus rows · reflection one-per-question ledger · headline-goal echo · closing-buttons renderer · attempt rows · auto-file provenance · chat-furniture strip | board-agnostic | ✅ assumed yes — **not driven on staging by this lane** |
| penalty-code ↔ learn-chip parity | `PENALTY_LEARN_MAP` (`wml-core.js` :4846) maps F1 · T1 · W1 · N1 · K1 · M1 · I1 · D1 | ✅ for every mapped code the protocols emit. **Ruled no-chip** (pre-existing, same as the AQA anchor): E1 · S1 · S2 · H1 · P1 · C1 · B1. No new unmapped code is introduced — `Z1` was removed for exactly this reason |
| ladder / planning engine | `_ladderPaperKey()` :4236 resolves to `lit`, `p1` or falls through to `p2`; registries are `_ladderRegistryP1/P2/Lit` with AQA fieldIds | ❌ **an Edexcel lesson silently takes an AQA registry.** This is why no planning protocol was authored — see §6 |

---

## 6 · PLANNING — NOT AUTHORED THIS CYCLE, AND THE REASON IS MEASURED

Both cells are at **C-CHECKS 1/8** (the only passing row is "no hardcoded step counts"; `@FIELD_COMMIT`
0, `@GOLD_REF` 0, `HARD PRECONDITION` 0, and all four C-LADDER rows 0). I did not author
`planning/protocol-b-planning.md` for either paper, and this is a deliberate refusal rather than a
shortfall of time. `PLANNING-LADDER-PORT-RECIPE.md` §1 makes the filing layer a **precondition**, and §1.2
states the failure mode plainly: *"a commit without a row is a silent no-op."* Three things I read make
that the certain outcome here:

1. `_planOutlineTargets()` (`wml-assessment.js` :7259) recognises exactly four plan-field shapes —
   `plan-Q[23]-para-[123]`, `plan-(Q4-)?body-[123]`, `plan-intro`, `plan-conclusion`. Edexcel P2's
   planned questions are Q3, Q6, Q7a and Q7b. Only `plan-Q3-para-{1,2,3}` would match, and it would fan
   out to `outline-body-{p}-{el}-q3` — the AQA Paper 2 Q3 row set. Q6, Q7a and Q7b have no shape at all.
2. `_ladderPaperKey()` (:4236) has three outcomes — `lit`, `p1`, else `p2`. An Edexcel Paper 2 lesson
   falls through to `p2` and would be walked with `_LADDER_QUESTION_ORDERS.p2 = ['q2','q3','q4','q5']`
   against AQA's fieldIds; an Edexcel Paper 1 lesson takes `p1 = ['q2','q3','q4']`, and Edexcel P1's Q2
   is 2-mark retrieval with no plan at all.
3. So every `@FIELD_COMMIT` I could author would name a fieldId no template builder renders. It would
   pass the audit's count check (`@FIELD_COMMIT ≥ 1`) and file nothing at runtime — the exact
   authored-but-inert ship the standard forbids, and invisible to every gate this lane can run.

**What the engine lane needs, in order:** the one-time generalisation the recipe already names (paper
CONFIG keyed by the resolved paper instead of the hardcoded `_isLangPaper2` gate and the three
registries), the outline row sets for Edexcel P2's Q3/Q6/Q7a/Q7b and P1's Q3/Q4/Q5, and the
`_planOutlineTargets` / `_planLabelElement` rows in §7's JS-ROWS SPEC. **The moment those rows exist,
the planning protocols are a straightforward authoring job** and the element sets are already fixed by
§2 of this report (they are the same criteria tables, one plan box per paragraph and one outline box per
element). That is the next piece of work for this lane, and it cannot start before the rows land.

---

## 7 · JS-ROWS SPEC (for the ENGINE lane — byte-exact, in the format of `EDEXCEL-IGCSE-JS-ROWS-SPEC-2026-08-16.md`)

Nine items. **1, 5 and 6 are what stop the ported stages reaching a student**; 2–4 are correctness bugs
that are live today; 7–9 unblock planning.

### 1 · `MULTIQ_RESPONSE_TARGETS` + `_multiqTargetKey()` — `frontend/wml-assessment.js` :52008–52020
The Section-B word-count ceiling cannot fire for any non-AQA board, so both Edexcel protocols' ceiling
blocks are inert. Add the two rows and make the key resolver board-aware.

```js
    const MULTIQ_RESPONSE_TARGETS = {
        'aqa|lang_paper_1': { Q1: 20, Q2: 300, Q3: 300, Q4: 500, Q5: 650 },
        // v7.19.854 (Neil D3): P2 Q1 is a tick-box checklist — nothing is written, no
        // word target. Q2 200 / Q3 450 / Q4 550 / Q5 650 confirmed.
        'aqa|lang_paper_2': { Q1: 0, Q2: 200, Q3: 450, Q4: 550, Q5: 650 },
        // Edexcel GCSE 1EN0 (2026-09-13 port). Reading-question targets scale with the tariff at the
        // same words-per-mark the AQA rows use (~30); Q1/Q2/Q4/Q5 are one- or two-point retrieval and
        // carry NO target. The 650 on the writing question is OURS — Edexcel prints no length guidance.
        'edexcel|lang_paper_1': { Q1: 0, Q2: 0, Q3: 180, Q4: 450, Q5: 650 },
        'edexcel|lang_paper_2': { Q1: 0, Q2: 0, Q3: 450, Q4: 0, Q5: 0, Q6: 450, Q7a: 180, Q7b: 420, Q8: 650 },
    };
    function _multiqTargetKey() {
        const board = String(state.board || '').toLowerCase().replace(/-/g, '_');
        if (board !== 'aqa' && board !== 'edexcel') return null;
        const txt = String(state.text || '');
        if (txt.indexOf('lang_paper_2') !== -1) return board + '|lang_paper_2';
        if (txt.indexOf('lang_paper_1') !== -1) return board + '|lang_paper_1';
        return null;
    }
```
⚠️ `_sectionBWcCeiling` and the two `MULTIQ_RESPONSE_TARGETS[key].Q5` reads at :8701 and :8964 look up
`Q5` by name. **Edexcel Paper 2's writing question is `Q8`**, so those two reads need the paper's writing
key, not the literal `Q5` — e.g. a `_sectionBQKey()` returning `'Q8'` for `edexcel|lang_paper_2` and
`'Q5'` otherwise. Without that, the Edexcel P2 row above is added and still never fires. **This is the
`Q5`-literal twin of the CANVAS TASK-SCOPING bug class; please do not fix only the map.**

### 2 · `_recallTargetQ()` — `frontend/wml-assessment.js` :2976 — **live defect**
The rotation is a single board-agnostic array, so Edexcel P2 rotates onto `Q4` and `Q5`, its two 1-mark
retrieval questions. Replace the literal array with a per-paper one.

```js
    var _RECALL_ROTATIONS = {
        'aqa|lang_paper_1':     ['Q4', 'Q2', 'Q3', 'Q5'],
        'aqa|lang_paper_2':     ['Q4', 'Q2', 'Q3', 'Q5'],
        // Edexcel 1EN0 (2026-09-13): never target a retrieval question. P1 has three real
        // targets (Q3 language+structure, Q4 evaluation, Q5 imaginative writing); P2 has four
        // (Q3 language+structure, Q6 evaluation, Q7b comparison, Q8 transactional writing).
        'edexcel|lang_paper_1': ['Q4', 'Q3', 'Q5'],
        'edexcel|lang_paper_2': ['Q6', 'Q3', 'Q7b', 'Q8'],
    };
```
…and index it with the same `(attempt - 1 + topic - 1 + redraft) % len` arithmetic, falling back to the
AQA P1 array when the key is unknown. **The protocols already state these rotations** (Edexcel P1:
`Q4 → Q3 → Q5`; Edexcel P2: `Q6 → Q3 → Q7b → Q8`) and the two must stay identical — the router's setup
block (~:5713) needs the same change.

### 3 · `PRECHAIN_GOAL_OPTIONS_LANG_P2` — `wml-assessment.js` :16653 **and** :40218 (dual pipeline)
The P2 options are AQA-worded and have no AO4 entry, which is Edexcel P2's 15-mark Q6. Add a
board-keyed Edexcel P2 set; the protocol's authored options are:

```
A) Analysing how the writer uses language and structure for effect (AO2)
B) Evaluating how successfully a writer achieves something (AO4)
C) Finding and synthesising the same idea across two texts (AO1)
D) Comparing how two writers present their ideas and perspectives (AO3)
E) Writing clearly and persuasively for a real purpose and audience (AO5)
F) Improving my vocabulary, sentences, spelling and punctuation (AO6)
G) Something else (please specify)
```
Edexcel P1's set is the existing `PRECHAIN_GOAL_OPTIONS_LANG` with **AO3 removed** (AO3 is not assessed
on Paper 1) — the P1 protocol's authored options are language-AO2, structure-AO2, evaluation-AO4,
imaginative-AO5, technical-AO6, other.

### 4 · `getResponseText` paragraph labeller — per-question taught counts
The AQA rule (`marks ÷ 4`) gives the wrong paragraph count for Edexcel. The taught counts are:
`edexcel|lang_paper_1` → Q3 **2**, Q4 **4** (Q1/Q2 none, Q5 holistic);
`edexcel|lang_paper_2` → Q3 **3**, Q6 **3**, Q7a **2**, Q7b **3** (Q1/Q2/Q4/Q5 none, Q8 holistic).
Q7a's labels are `Similarity 1` / `Similarity 2`, not `Paragraph n` — the protocol's `@FB_BEGIN` titles
use those strings, and a drifted title creates a duplicate box region.

### 5 · Router `$essay_polishing_rubrics` — `includes/class-protocol-router.php` :1834
**THE ROUTER ROWS. Both rubrics and both gold files exist on disk today.**

```php
            'edexcel_lang_paper_1' => [
                'cell'   => 'edexcel/language1',
                'rubric' => 'rubric-edexcel-lang-p1-fiction.md',
                'gold'   => ['protocols/edexcel/language1/modules/knowledge-hub.md'],
                'engine' => 'language',
            ],
            'edexcel_lang_paper_2' => [
                'cell'   => 'edexcel/language2',
                'rubric' => 'rubric-edexcel-lang-p2-nonfiction.md',
                'gold'   => ['protocols/edexcel/language2/modules/knowledge-mark-scheme.md'],
                'engine' => 'language',
            ],
```
In the report's requested shape:
`{ text: 'edexcel_lang_paper_1', cell: 'edexcel/language1', rubric: 'rubric-edexcel-lang-p1-fiction.md', gold: ['protocols/edexcel/language1/modules/knowledge-hub.md'], engine: 'language' }`
`{ text: 'edexcel_lang_paper_2', cell: 'edexcel/language2', rubric: 'rubric-edexcel-lang-p2-nonfiction.md', gold: ['protocols/edexcel/language2/modules/knowledge-mark-scheme.md'], engine: 'language' }`

### 6 · Chip ladder — `frontend/wml-selection-chip.js` :355–363 and the `isLangEnv` branch
Three literals to generalise, and the gate asserts `ESSAY_POLISH_ENV_TEXTS` equals the router map's keys.

```js
        const ESSAY_POLISH_ENV_TEXTS = ['aqa_lang_paper_1', 'aqa_lang_paper_2', 'edexcel_lang_paper_1', 'edexcel_lang_paper_2'];
        // FICTION papers get the no-device ladder; NONFICTION papers get the device group on the
        // writing question. Keyed on the paper, not on one slug (v7.20.610 hardcoded aqa_lang_paper_1).
        const FICTION_ENV_TEXTS = ['aqa_lang_paper_1', 'edexcel_lang_paper_1'];
        const isFictionLang = isLangEnv && FICTION_ENV_TEXTS.includes(envText);
        // The WRITING question per paper — Section-B-only buttons (devices, the modifier cut) gate to it.
        const SECTION_B_Q = { aqa_lang_paper_1: 'Q5', aqa_lang_paper_2: 'Q5', edexcel_lang_paper_1: 'Q5', edexcel_lang_paper_2: 'Q8' };
        const isSectionB = q === (SECTION_B_Q[envText] || 'Q5');
```

**THE CHIP LADDER, per paper (what each cell's rubric defines):**

| paper | ladder groups, in order | notes |
|---|---|---|
| `edexcel_lang_paper_1` (fiction) | `langScan` (scan-structure · scan-elements · scan-coherence · scan-concept) → `elementPolish` (strengthen-hook · rephrase) → `langWordChoice` on **Q5** / `langWordChoiceReading` on Q3–Q4 → `polishProse` (strengthen-vocabulary · tighten · adjust-tone) → `fixSpag` (fix-spelling · fix-grammar · fix-punctuation) → `reference` (explain · compare-gold-standard) | identical to the AQA P1 ladder. **No `scan-context-drive`** — Paper 1 has no AO3. Writing question = **Q5**. |
| `edexcel_lang_paper_2` (nonfiction) | `langScan` → `elementPolish` → **`devices` (all 21 `device-*` ids) on Q8 only** → `langWordChoice` on **Q8** / `langWordChoiceReading` on Q3 · Q6 · Q7a · Q7b → `polishProse` → `fixSpag` → `reference` | identical to the AQA P2 ladder except the Section-B question. **No `scan-context-drive`** — AO3 here is COMPARISON, not context. Writing question = **Q8**, which is the only change the branch needs. |

Every button in both ladders has a row in its rubric, including all 21 device ids
(`device-suggest` · `device-metaphor` · `device-alliteration` · `device-direct-address` ·
`device-foreshadowing` · `device-assonance` · `device-triadic` · `device-hyperbole` · `device-emotive` ·
`device-rhetorical-question` · `device-simile` · `device-contrast` · `device-repetition` ·
`device-onomatopoeia` · `device-personification` · `device-sibilance` · `device-anaphora` ·
`device-asyndeton` · `device-polysyndeton` · `device-parallelism` · `device-other`), plus
`lang-scan-verbs` · `lang-scan-starters` · `cw-cut-modifiers` · `strengthen-vocabulary` · `tighten` ·
`adjust-tone` · `fix-spelling` · `fix-grammar` · `fix-punctuation` · `compare-gold-standard` · `explain` ·
`strengthen-hook` · `rephrase` · the four scans, and `scan-context-drive` as an explicit does-not-apply.

### 7 · `_planOutlineTargets()` — `wml-assessment.js` :7259 (PLANNING PRECONDITION)
Add the Edexcel plan-field shapes. Field ids follow the existing conventions (`plan-Q<n>-para-<i>` →
`outline-body-<i>-<el>-q<n>`), so the only new shapes are Q6, Q7a and Q7b:

```js
        m = /^plan-Q([67])b?-para-([123])$/.exec(planField);   // Edexcel P2: Q6 evaluative, Q7b comparative
        if (m) { const q = m[1] === '7' ? '7b' : m[1], p = m[2]; return { mode: 'elements', make: el => 'outline-body-' + p + '-' + el + '-q' + q }; }
        m = /^plan-Q7a-sim-([12])$/.exec(planField);            // Edexcel P2: Q7a synthesis
        if (m) { const s = m[1]; return { mode: 'elements', family: 'synthesis', make: el => 'outline-sim-' + s + '-' + el }; }
```
⚠️ **Key-granularity warning (root CLAUDE.md §5e).** `plan-Q3-para-{1,2,3}` ALREADY matches the existing
AQA regex and fans out to `outline-body-{p}-{el}-q3`. Edexcel P2's Q3 also has three paragraphs, so the
ids collide by coincidence rather than by design. Either scope the builder by paper or accept the
collision deliberately and write it down — do not leave it as an accident.

### 8 · `_planLabelElement()` — `wml-assessment.js` :7291
Two new label families for Edexcel P2:
- **synthesis (Q7a):** `Similarity:` → `similarity` · `Text 1 evidence:` → `ev1` · `Text 2 evidence:` →
  `ev2` · `Synthesis:` → `synth`.
- **comparative (Q7b):** the existing per-source effect labels plus `Pivot:` → `pivot` ·
  `Text 1 perspective:` → `persp1` · `Text 2 perspective:` → `persp2` · `Combined judgement:` →
  `judgement`.
Unrecognised labels must keep warning and skipping (fail loud, raw kept).

### 9 · Ladder paper CONFIG — `wml-assessment.js` :4236–4261 (the recipe's one-time engine step)
`_ladderPaperKey()` has three outcomes and an Edexcel lesson silently inherits an AQA registry. Replace
the hardcoded gate + three registries with a config keyed by the resolved paper, adding:
`edexcel_p1` order `['q3','q4']` and `edexcel_p2` order `['q3','q6','q7a','q7b']` — Q8/Q5 creative and
transactional writing stay OUTSIDE the ladder by the existing ruling. **The walk, the TELL and the stamps
stay identical; do not fork `deriveLadderState`.**

---

## 8 · PROPOSED EDITS TO FILES THIS LANE MAY NOT TOUCH

### 8a · `protocols/shared/language-paper-specs.json` — provenance only, no numbers change
Both Edexcel blocks' marks and AOs **already match the PDFs exactly** (P1 1+2+6+15 = 24, +40 = 64;
P2 2+2+15 = 19, 1+1+15 = 17, 6+14 = 20 → 56, +40 = 96). The only defect is the provenance line, which is
a human check rather than a citation — the shape of claim that was wrong on Edexcel IGCSE P1 for four
months.

```
-   "source": "Edexcel 1EN0/01 past papers (verified by Neil 2026-04-02)",
+   "source": "Pearson Edexcel 1EN0/01 Mark Scheme (Results) Summer 2024 — MSR/Edexcel GCSE English Language Paper 1/Edexcel GCSE English Language Paper 1 Mark Scheme/June 2024 MS - Paper 1 Edexcel English Language GCSE.pdf; cross-read November 2023. Gated by protocols/_marks/edexcel__language_p1.json.",
```
```
-   "source": "Edexcel 1EN0/02 past papers (verified by Neil 2026-04-02)",
+   "source": "Pearson Edexcel 1EN0/02 Mark Scheme (Results) Summer 2024 — MSR/Edexcel GCSE English Language Makr Schemes/June 2024 MS - Paper 2 Edexcel English Language GCSE.pdf; cross-read June 2022. Gated by protocols/_marks/edexcel__language_p2.json.",
```

### 8b · `PROTOCOL-QUESTION-STRUCTURE-MAP.md` — the Edexcel language2 rows now describe a retired protocol
Every language2 row cites line numbers in the 1,502-line monolith this port replaced, so each `_Source:_`
line is stale, and three rows describe a shape the port deliberately changed. Proposed replacements:

- **Q3** (map line ~325): element list unchanged in spirit but the worths are now
  `0.5 / 1.5 / 1.0 / 1.0 / 1.0 = 5.0` per paragraph (five elements, ONE effect sentence, not the
  dual-Effect six), and the three paragraphs are **¶1 language · ¶2 structure · ¶3 both together**.
  Replace the note with: *"3 ¶ × 5 = 15. ¶1 LANGUAGE, ¶2 STRUCTURE, ¶3 the two analysed as one effect —
  the board caps a one-sided or unbalanced answer at the top of Level 2 (6/15)."*
- **Q6**: `paragraphs: 3` stands; elements are now six summing to 5.0 with an explicit evaluative
  judgement element, not the dual-Effect TTECEA.
- **Q7a**: **the shape changed.** Replace *"One TTECEA paragraph on Source A, one on Source B"* with
  *"2 SIMILARITY paragraphs × 3 marks; each carries BOTH texts. Elements: similarity statement 0.5 ·
  Text 1 evidence + what it tells us 1.0 · Text 2 evidence + what it tells us 1.0 · synthesis sentence
  0.5. AO1 SYNTHESIS — no techniques, no differences, no reader effects."*
- **Q7b**: worths are now **¶1 5.0, ¶2 4.5, ¶3 4.5** (was 4.5/4.5/5); elements are seven, including an
  explicit **Pivot** and a per-text **perspective**, not the dual-Effect six. Delete the sentence *"CB1-CB4
  comparison-specific penalty codes apply"* — those codes are retired; `I1` is the only comparison-scoped
  code and there is deliberately none for a missing pivot or a single-text paragraph.
- **Q8/Q9**: delete *"Min 650 words gate (hard-halt Redraft/Exam Practice; word-count penalty formula for
  Diagnostic)"* — there is no halt, the ceiling is code-computed, the 650 is Sophicly's target and the
  board prints no length guidance. The row's DEVIATION note also no longer applies: the port DOES give
  per-IUMVCC-section feedback with a labelled holistic gold, which is the universal rule.
- All nine `_Source:_` lines should point at
  `protocols/edexcel/language2/modules/protocol-a-assessment.md (2026-09-13 port)` without line numbers,
  since a rewrite invalidates them.
- Header line 270's coverage paragraph should lose the Section-B DEVIATION sentence for the same reason.

### 8c · `PROTOCOL-COVERAGE-MATRIX.md`
`edexcel / language_p1` and `edexcel / language_p2`: **assessment** → complete on the mechanical rows
(audit 10/10, tariff gate green, 0 paste asks), **judgement row NOT filled** (no staging run — see §10).
**polishing** → rubric authored and D-checks satisfied, **blocked on the router row** (§7 item 5), so the
audit still reports `monolith`. **planning** → 1/8, blocked on engine rows (§6, §7 items 7–9).
**documents** → not opened in a browser by this lane.

### 8d · `bin/tariff-gate.js` — no change requested
Both papers resolve under the existing `MSR/` alias. An earlier handoff proposed a `GEC/` alias for
`My Drive/GCSE English Courses`; it is **not needed** and is not proposed. If a future lane wants the
second-series PDFs citable, that would be the change — but the committed text extracts in
`protocols/edexcel/_sources/` serve provenance without touching the gate, and a text file could never be
the authority the gate exists to check.

---

## 9 · UNRESOLVED DECISIONS (one is a real judgement call; the rest are engine-lane routing)

1. ⭐ **Edexcel P2 Q7a's shape is my call against the gold file, and it is the one thing here worth a
   second opinion.** The mark scheme says *synthesis*; the gold models on file are text-by-text. I
   followed the mark scheme (Part E2 says it wins) and proposed the gold-file update, but a student who
   already learned the text-by-text shape from `knowledge-mark-scheme.md` §2A will meet a different shape
   in the lesson until that file is updated. **Either update the gold file or hold the delta knowingly —
   do not leave it unnoticed.**
2. **Q7b's heavier paragraph moved from ¶3 to ¶1.** Defensible (¶1 states the sustained claim) and it
   matches the P1 Q4 precedent, but it is a change from the retired monolith and is not the board's
   business either way — the board marks holistically by level, so this is purely our teaching choice.
3. **Whether Edexcel P2's reading-question word targets in §7 item 1 are right.** I derived them at the
   AQA rows' ~30 words-per-mark, which is an inference from the AQA numbers, **not** a board figure. The
   board gives no guidance. A Neil ruling or a tutor's judgement should confirm them before they gate
   anything.
4. **The `Q5`-literal reads at `wml-assessment.js` :8701 and :8964** are an engine decision (a
   `_sectionBQKey()` helper vs a per-paper map); this lane can only name the problem.

---

## 10 · UNTESTED ROUTES (stated plainly — none of this was driven on staging)

- **No chat turn was run**, on staging or anywhere. Every claim in §4 is a static gate result. The
  assessment judgement row of E5 ("one weak + one strong response marked on staging") is **not** filled
  for either paper.
- **No polishing session was opened**, because the router rows do not exist yet — the lesson cannot reach
  the environment. The 18 journeys in `_journeys-2026-09-13.json` are written to be run by the engine
  lane the moment item 5 lands, and none of them has been run.
- **No document was opened in a browser.** Whether the Edexcel P2 lesson's document renders nine question
  sections with the right labels (including `Similarity 1` / `Similarity 2`) is **unverified**, and §7
  item 4 exists because I expect it does not.
- **No planning walk**, for the reason in §6.
- **The pruned modules were not runtime-tested.** I removed four files from `assessment.always` on the
  ONE-TEMPLATE LAW; if any of them carried something protocol-a needs that I did not notice, it will show
  as a missing behaviour in the first staging run, not as a gate failure. The four are still on disk. The
  specific thing to watch: `knowledge-operations.md` was 1,209 lines, and I read its retired-flow hits
  rather than all of it.
- **`edexcel/19th_century`, `modern`, `poetry`, `shakespeare`, `unseen`** are untouched and still at
  2/10 assessment · 1/8 planning · polishing monolith. This lane owns Language only.

---

## 11 · ONE CROSS-LANE FINDING FOR THE ENGINE LANE (observed, not mine to fix)

Running the planning harnesses over the whole repo from this worktree:

```
$ node bin/plan-fanout-harness.js
✅ plan-fanout-harness passed (6 converted protocol(s), 199 fan-out ids all resolve to real outline boxes).
$ node bin/planning-keymatch-harness.js
✅ planning-keymatch-harness passed (every protocol outline tag matches a render box).
$ node bin/ladder-check-harness.js
  ❌ protocols/edexcel-igcse/language1/planning — ladder-enabled but violates 1 invariant(s):
❌ ladder-check-harness FAILED — the C-LADDER contract, a ladder protocol, the el key-match, or the engine mechanics have drifted.
```

**That failure is not this lane's.** `protocols/edexcel-igcse/` is the Edexcel INTERNATIONAL GCSE Language A
(4EA1) lane, working in the same worktree; its new `protocols/edexcel-igcse/language1/planning/b-ladder.md`
is untracked in `git status` and is the file the harness names. I have not touched anything under
`protocols/edexcel-igcse/`, and removing my changes does not change this result. Recording it because the
engine lane checks `git log` for unshipped content commits before deploying and should not discover a red
harness at the deploy step — it is one invariant in one file, and it belongs to the IGCSE lane to clear.
