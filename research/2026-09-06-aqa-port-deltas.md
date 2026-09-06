# AQA port deltas — 2026-09-06 (content lane)

**Lane:** CONTENT. No `.js` / `.php` / `.css` was edited, no version bumped, nothing deployed,
nothing staged or committed. The engine lane owns all three.

**Provenance header (every cell touched):**
- **mark scheme:** `sophicly-etchwp-package v2.6/Sophicly Etch Mark Scheme Resources/AQA Literature Mark Schemes/AQA Literature Paper 2 June 2024 MS.pdf` — **AQA 8702/2R, June 2024**, Section C (read with `pdftotext -layout`, descriptors transcribed verbatim from the grid, not from our own `.md` copy).
- **anchor (unseen assessment):** **LIT anchor** (`protocols/aqa/literature/modules/protocol-a-assessment.md`) for the ESSAY SHAPE of Q27.1 only — unit = SECTION. **Verified element-by-element against the P1 anchor (`protocols/aqa/language1/modules/protocol-a-assessment.md`): YES.** Every gate, the penalty registry, the analytical-verb tier list, the criterion-evidence rule, the output-hygiene rule, the ledger and the whole closing chain are P1's, not the lit protocol's. The multi-question spine (per-question total line + per-question Q-GATE) is P1's, because Section C is a two-question section — the one place this paper is neither anchor.
- **anchor (unseen planning):** the PLANNING MONOLITH (`protocols/aqa/language2/planning/protocol-b-planning.md`) via `PLANNING-LADDER-PORT-RECIPE.md`, with the AQA literature/poetry ladder ports as the modular mold.

---

## 1. THE MEASURED DELTA — before → after

`node bin/protocol-standard-audit.js --board aqa`

| cell | ASSESS before → after | PLAN before → after |
|---|---|---|
| aqa/language1 | 10/10 → **10/10** | 7/8 → **8/8** (`@GOLD_REF` 0 → 4) |
| aqa/language2 | 10/10 → **10/10** | 8/8 → **8/8** (untouched) |
| aqa/literature | 10/10 → **10/10** | 4/8 → **8/8** |
| aqa/poetry | 9/10 → **10/10** (`NEVER round` 0 → 1) | 5/8 → **8/8** |
| aqa/unseen | 2/10 → **10/10** | 1/8 → **8/8** |

Full unseen counts after: assessment `@REFLECT_GATE` 9 (6 real markers + 3 prose references) ·
`@FB` pairs 7 · `Total Mark for` 13 · every absolute row ≥1 / =0 as required. Planning
`@FIELD_COMMIT` 25 · `HARD PRECONDITION` 6 · `@GOLD_REF` 4 · precedence 1 · weak-never 1 ·
LENS REGISTRY 2 · falsifiable 1.

---

## 2. STEP 1 — RECONCILIATION: was the audit's grep wrong, or were the protocols short?

**Both, in different rows. Four findings, each with its file:line.**

### (a) `ladder precedence` = 2 → **the audit's literal grep was counting a SELF-REFERENCE.**
The law is stated **once** in each file:
- `protocols/aqa/literature/planning/b-ladder.md:77`
- `protocols/aqa/poetry/planning/b-ladder-poetry.md:75`

The second hit was inside each file's own `### Acceptance (grep-able, this file)` block
(literature:318, poetry:322), which **quoted the literal while describing the check**:

> *"the precedence line (`WRONG → FAILED → WEAK/RESOLVED`), the weak-never-climbs law, and the
> wrong=falsifiable discriminator."*

That is a meta-mention, not a second statement of the law — which is exactly why
`bin/ladder-check-harness.js` passed: **the harness tests PRESENCE** (`t.includes(...)`,
lines 100–106), **the C-CHECKS row tests COUNT** ("appears exactly once"). Both are right about
their own question; they simply ask different ones.

**Precedent already existed and neither ladder file followed it.** The AQA P2 monolith's §10
acceptance block (`protocols/aqa/language2/planning/protocol-b-planning.md:1418-1423`) solves this
by *naming the check without quoting the literal* — "the literal verdict-precedence line (WRONG,
then FAILED, then WEAK/RESOLVED, arrow-joined) … this check names the two lines without quoting
them so each grep count stays 1". **Fix applied:** the literature and poetry acceptance bullets were
reworded to the P2 shape. No law text changed; nothing was weakened.
**`PROTOCOL-STANDARD.md` was NOT edited** — the standard is right and the protocols were not
following its own precedent.

### (b) `weak never enters` = 0 in literature → **genuinely short, by a LINE WRAP.**
`b-ladder.md:93-94` read:

```
  … then accept and file their choice. A
  weak-but-owned answer NEVER enters the ladder.
```

The content was complete; the **literal** `A weak-but-owned answer NEVER enters the ladder` was
broken across a newline. The harness passed because its regex omits the leading "A"
(`/weak-but-owned answer NEVER enters the ladder/i`, harness:102); the C-CHECKS literal includes
it. Poetry had the same sentence unwrapped (`b-ladder-poetry.md:92`) and passed.
**Fix applied:** rewrapped so the literal sits on one line. **This is a real defect class, not
pedantry** — a wrapped literal is invisible to every count-based gate, and I hit it a second time
in my own new file (`b-ladder-unseen.md`, caught and fixed before the report).

### (c) `HARD PRECONDITION` = 0 in literature and poetry planning → **genuinely short.**
Confirmed by grep against the planning dirs: literature and poetry had **zero** in
`planning/*.md` (their 9 and 17 hits are in `modules/`, which the audit does not read for the
planning cell — correctly, since the planning cell measures the planning protocol). AQA
language1/2 carry 6 each in their planning monoliths. **Fix applied:** three real gates each
(pre-planning chain → bodies-before-thesis → thesis-before-introduction), written to the P1/P2
shape (name the artifact from the previous turn, or STOP).

### (d) `@GOLD_REF` = 0 in language1, literature and poetry planning → **genuinely short.**
Only language2 carried the D7 traceability lines. language1 already carried the *substance* as a
prose paragraph ("Gold traceability: this paper has no per-question gold FILES…",
`protocol-b-planning.md:462-468`) but without the `@GOLD_REF` literal, so the row read 0.
**Fix applied:** converted to per-question-section `@GOLD_REF` lines in all three.

**⚠️ ONE DELIBERATE DIVERGENCE FROM language2's SHAPE, stated so it is not "corrected" later.**
language2's lines are `@GOLD_REF: <file> @GOLD_SHAPE: <byte-copy of the gold's header>`, and
`bin/check-gold-shapes.sh` diffs those. **language1, literature, poetry and unseen have no separate
`a-*-gold.md` files — their golds are authored INLINE in the assessment protocol**, so there is no
`@GOLD_SHAPE:` header to byte-copy. Those citations therefore carry `@GOLD_REF:` **without**
`@GOLD_SHAPE:`, which the shape checker deliberately ignores (it greps
`@GOLD_REF:.*@GOLD_SHAPE:`). Giving a headerless gold a claimed shape would be a fabricated
traceability line — worse than none. `check-gold-shapes.sh` still reports ✅ 4/4.

---

## 3. FILES CHANGED (working tree, unstaged, uncommitted)

### Small fixes (steps 1–2)
| file | change |
|---|---|
| `protocols/aqa/literature/planning/b-ladder.md` | rewrapped the weak-never literal (93–94); acceptance bullet reworded to the P2 name-don't-quote shape |
| `protocols/aqa/poetry/planning/b-ladder-poetry.md` | acceptance bullet reworded to the P2 shape |
| `protocols/aqa/literature/planning/b-intro.md` | + GOLD TRACEABILITY block (3 `@GOLD_REF`) and + PLANNING GATES block (3 `HARD PRECONDITION`) |
| `protocols/aqa/poetry/planning/b-intro-poetry.md` | **NEW** — paper header, 3 `@GOLD_REF`, 3 `HARD PRECONDITION`, + the paste-wall reminder (both poems are pre-supplied) |
| `protocols/aqa/poetry/manifest.json` | `planning.always` gains `planning/b-intro-poetry.md` |
| `protocols/aqa/poetry/modules/protocol-a-assessment-poetry.md` | + the round-once discipline STATED ("**NEVER round a section total**"), the B-CHECKS row that was missing even though the engine enforces it |
| `protocols/aqa/language1/planning/protocol-b-planning.md` | the existing prose "Gold traceability" paragraph converted to four per-question `@GOLD_REF` lines (Q2/Q3/Q4/Q5) |

### The unseen port
| file | change |
|---|---|
| `protocols/aqa/unseen/modules/knowledge-mark-scheme-unseen.md` | **NEW** — the verbatim AQA descriptors, in the `bin/build-markscheme-dataset.js` shape (see §5) |
| `protocols/aqa/unseen/modules/protocol-a-assessment-unseen.md` | **REWRITTEN** — full B-COMMON port (see §4) |
| `protocols/aqa/unseen/modules/knowledge-unseen.md` | §2.A/2.B paraphrased mark-scheme grids replaced by a pointer to the verbatim file; **§2.C invented "approximate grade boundaries" table DELETED** (A6 violation); §2.G body allocation re-cut to six criteria; §2.H Q27.2 allocation re-weighted from the descriptors |
| `protocols/aqa/unseen/planning/b-intro.md` | **REWRITTEN** — paper map, gold traceability (4 `@GOLD_REF`), the full fieldId FILING CONTRACT table, 5 `HARD PRECONDITION` gates |
| `protocols/aqa/unseen/planning/b-ladder-unseen.md` | **NEW** — the C-LADDER (Session Law 9), lens registry (15 element types × 3 direction lenses), model-script bank M1–M7 on REAL poems |
| `protocols/aqa/unseen/planning/b5-bodies.md` | + the two-grade FILING block (18 `@FIELD_COMMIT` + 3 `@FIELD_SET`); the three "copy this plan into your workbook" instructions replaced by code filing |
| `protocols/aqa/unseen/planning/b7-introduction.md` | + FILING block (3 `@FIELD_COMMIT` + `plan-intro`), + the "building sentence is NOT context" rule |
| `protocols/aqa/unseen/planning/b8-conclusion.md` | + FILING block (4 `@FIELD_COMMIT` + `plan-conclusion`) |
| `protocols/aqa/unseen/planning/b-q272-comparison.md` | **REWRITTEN** — paste-wall violations removed (it asked the student to paste poem 2 and retype the question), beats re-cut to the four assessed criteria, + the explicit no-filing-yet block naming the ids the engine must add |
| `protocols/aqa/unseen/manifest.json` | `planning.always` gains `b-intro.md` + `b-ladder-unseen.md` (b-intro removed from step 1); `assessment.always` gains `knowledge-mark-scheme-unseen.md` |

---

## 4. THE UNSEEN ASSESSMENT PORT — what it now does, and what is deliberately different

**Confirmed from the PDF, never from the brief:** Q27.1 = **24 marks, AO1 = 12 + AO2 = 12, six
levels**, banded by the board on the 24 total. Q27.2 = **8 marks, AO2 ONLY, four levels**. Section C
total **32**. The mark scheme states in terms that **"AO4 will be assessed on Section A only"**, and
Section C prints no AO3 anywhere.

**Ported to the B-COMMON spine:** opening + three-part gated pre-assessment chain (grade goal /
headline goal / keyword recall, with a rotating recall target) · **6 `@REFLECT_GATE`** (five Q27.1
sections + one for Q27.2 as a whole) · `@FB_BEGIN`/`@FB_END` per marked sub-unit (7 pairs) ·
`| Criterion | Worth | Your Score | Why |` tables whose worths sum exactly · the universal penalty
registry with the analytical-verb tier list, **every penalty carrying a verbatim-quote requirement
AND a one-line worked fix-example** · `Total Mark for [label]` per sub-unit (decimal, never
rounded) · Calibration Check after every unit with the REAL units as lettered options · the 4-button
Q-GATE behind a HARD PRECONDITION · Final Summary with the metacognitive journey and the **Penalty
& Ceiling Ledger** with its reframe · `@SUMMARY_COMPLETE` ending the summary turn asking nothing ·
the SYSTEM-ASKED Action Plan + Transfer chain · the filing turn with all twelve `@FIELD_SET` ids ·
`[ASSESSMENT_COMPLETE]` on the filing turn only · the exact wrap line. **All level descriptors are
quoted, none invented** (A4) — the protocol points every Level Alignment at
`knowledge-mark-scheme-unseen.md`.

### What is genuinely different about unseen, and PRESERVED (never flattened into the R&J shape)
1. **TWO poems, and they do different jobs.** Q27.1 is the SECOND poem alone; Q27.2 compares both.
   The protocol states this and instructs that comparison inside Q27.1 earns nothing there,
   is credited where it stands if it contains single-poem analysis, and is never charged twice.
2. **No AO3, therefore no Context element.** A body paragraph is **TTECEA and ends at the poet's
   purpose** — there is no seventh Context sentence, no context criterion, no context outline row
   (the engine already drops it via `aoRequired: 'AO3'`), and context is never a Priority
   Improvement. The introduction's **Building Sentence is not context** either — on an unseen poem
   there is no backdrop, so it develops the concept the hook opened. This is stated three times in
   three files because "carry the +C over from the lit protocol" is exactly what a future port
   would do by default.
3. **No AO4/SPaG mark.** Technical accuracy gets a qualitative note in the Final Summary that says
   plainly it carries no mark here, and why it still matters (C1 penalties, hidden analysis).
4. **Q27.2 is AO2-only, and that is the hardest thing to get right.** The protocol forbids awarding
   a criterion for interpretation alone, forbids a Priority Improvement asking for more
   interpretation, and equally forbids PENALISING thin interpretation there.
5. **Two questions, so a two-question spine.** Per-question total lines and per-question Q-GATEs
   (P1's shape), inside an essay whose unit is the SECTION (the lit shape).
6. **N1 is softened for cold reading:** an accurate-but-modest technique name is rewarded; N1 is
   charged only for an identification that is WRONG, never for one that is unambitious.
7. **Body focus is the poem's own journey** (Form-or-Opening → Language → Ending) with anchor
   quotations sequenced beginning → middle → end, rather than the studied-text thematic split.

### Deliberate change to the March monolith's marking (stated so it is not silently reverted)
The old body table had **seven** criteria (terminology 0.5 and quote-integration 0.5 split apart, a
1.5-mark purpose). The planning outline for this paper files **six** boxes. A student planned six
and was marked against seven — the key-granularity class. **Re-cut to six, 1:1 with the outline
rows, verified against the P1 anchor's TTECEA table:** topic 1.0 · technique+evidence+inference 1.5
· close analysis 1.0 · effect 1 0.75 · effect 2 0.75 · purpose 1.0 = **6.0 exactly**, plus a `+0.5`
BONUS capped at 6.0 and omitted when absent. Intro 0.5+0.5+1.0 = 2.0 (3 criteria ↔ 3 outline rows);
Conclusion 4 × 1.0 = 4.0 (4 ↔ 4); Q27.2 0.75+0.75+1.5+1.0 = 4.0 per paragraph (criterion 3 carries
the most because the board's own Level-4 discriminator is *"Analytical comparison of the effects of
writers' methods to create meanings"*). Totals: 2 + 6 + 6 + 6 + 4 = **24**; 4 + 4 = **8**.

### Three A4/A6 violations found and removed in `knowledge-unseen.md`
- **§2.C was an invented "approximate grade boundaries" table** mapping AQA marks to grades 1–9.
  Deleted. Grades band on the canonical Sophicly ladder only.
- §2.A/§2.B held **paraphrased** level descriptors. Replaced by a pointer to the verbatim file — a
  paraphrase quoted to a student is a fabricated mark-scheme claim.
- §2.A instructed the model to present **"AO1: [X]/12, AO2: [Y]/12 → Combined Total"**. The board
  prints no AO sub-totals for 27.1; the 12/12 is AO WEIGHT. Removed, with the reason stated.

---

## 5. THE MARK-SCHEME DATASET (addendum)

`protocols/aqa/unseen/modules/knowledge-mark-scheme-unseen.md` is written in **exactly** the shape
`bin/build-markscheme-dataset.js` parses (`parseQ5Section`, regexes at :38 header, :64 level,
:78 band, :88 strand, :93 bullet) with the section selector widened from `QUESTION 5` to the
question id. I ran that parser's logic verbatim against the file with only the selector widened —
**all three sections parse clean, no `unrecognised line` throw, Level 0 present in each.**

| question | AO | max marks | levels | Upper/Lower bands printed? |
|---|---|---|---|---|
| 27.1 | AO1 | 24 (AO1 carries 12, banded on the 24 total) | 6 | **No** |
| 27.1 | AO2 | 24 (AO2 carries 12, banded on the 24 total) | 6 | **No** |
| 27.2 | AO2 | 8 | 4 | **No** |

Parsed output: `Q27.1 AO1` → 6 levels, 12 descriptors, ranges 1–4 / 5–8 / 9–12 / 13–16 / 17–20 /
21–24. `Q27.1 AO2` → identical ranges, 12 descriptors. `Q27.2 AO2` → 4 levels, 8 descriptors,
ranges 1–2 / 3–4 / 5–6 / 7–8.

**Shape decisions the engine lane should know:**
- The board prints a **per-AO split inside each level** for 27.1, so per the instruction the AO is
  carried in the level NAME (`**Level 6 — AO1 · Convincing, critical analysis and exploration —
  21–24 marks**`) **and** the section is split one-per-AO. Level names for 27.2 are the bare AO
  (`**Level 4 — AO2 — 7–8 marks**`) because the board prints no level names there.
- The parser **throws on any unrecognised line inside a section**, and a bare `Word:` line would be
  mis-read as an AO5-style strand. The board's **"How to arrive at a mark"** column therefore lives
  in a clearly-labelled prose section AFTER the last `---`, outside every parsed section, quoted
  verbatim. It is available to the protocol and invisible to the parser.
- One board typo is reproduced exactly ("likely to include be thoughtful", Level 5) with a note not
  to silently correct it and not to quote that clause to a student.

---

## 6. ENGINE ROWS THE ENGINE LANE MUST ADD (specs — I did not touch `frontend/` or `bin/`)

**E1–E3 are BLOCKING: the unseen assessment protocol must not ship until they land.** The protocol
carries an ENGINE PARITY table naming them, so this is stated in the protocol as well as here.

### E1 — `BOARD_FORMAT_DEFAULTS.aqa.unseen_poetry` is understated (24, single) — the paper is 32, dual
`frontend/wml-assessment.js:51855` currently:
```js
unseen_poetry:    { format: 'single', marks: 24, aos: 'AO1,AO2' },
```
AQA Section C is genuinely two questions. `format: 'dual'` already exists and is used by
eduqas (`:51869`). Required:
```js
unseen_poetry:    { format: 'dual',
                    partA: { marks: 24, aos: 'AO1,AO2' },   // Q27.1 — single unseen poem
                    partB: { marks: 8,  aos: 'AO2' } },     // Q27.2 — comparison, AO2 ONLY
```
and `BOARD_DEFAULT_MARKS.aqa.unseen_poetry` at `:51832` from `24` → **`32`**.
**Why blocking:** the grand-total verifier bands `Total: X/max` against the registered max. With 24
registered, the protocol's correct `Total: X/32` is re-verified against the wrong denominator.
**Check first:** whether `format:'dual'` changes the canvas box set for this paper in a way that
would strand an existing saved doc — if it does, gate it and heal on load.

### E2 — the per-question total parser matches `Q<digits> Total:` only, so `Q27.1 Total:` files nothing
Sites: `frontend/wml-assessment.js:3371`, `:8556`, `:8908`, `:9077`, `:9275`, `:9335` — all use
`/\bQ(\d+)\s*Total:/i` or `(?:Q\d+\s*)?Total:`. On `Q27.1 Total: 18/24` the `\d+` matches `27`, the
next character is `.`, and the match fails; the fallback branch also fails. Required: widen the
question-id group to `(\d+(?:\.\d+)?)` at every site (and the `@FB_BEGIN` `"q":"Q(\d+)"` twin at
`:3371` / `:9335`, since the Q27.2 cards use `"q":"Q27.2"`).
**Do not "solve" this by renaming the questions.** `Q27.1` / `Q27.2` are AQA's own labels and a
student must see them (A4 / house language).

### E3 — Q27.2 has no outline rows: `_resolveBodyOnlyOutline` returns null for anything but Lang P1/P2
`frontend/wml-assessment.js:55273-55292` hard-returns `null` unless `_specSubjectKey()` is
`language_p1` or `language_p2`. Unseen therefore renders the Q27.1 essay outline and **nothing for
Q27.2**. Until this lands, the unseen planning protocol deliberately emits **no** filing marker for
Q27.2 (a commit to a box that does not render writes to nowhere and reads as success). Required —
these exact rows, which the protocol already names on both sides so they cannot drift:

**Criteria set (new `OUTLINE_CRITERIA.unseenComparison`, 4 rows, AO2 throughout):**

| # | id | label | AO | type | prompt |
|---|---|---|---|---|---|
| 1 | `method-a` | Poem A — Method + Evidence | AO2 | checkbox | Name the method in the first poem with precise subject terminology, and embed the words that carry it. |
| 2 | `method-b` | Poem B — Comparative Pivot: Method + Evidence | AO2 | checkbox | Open with a comparative marker (Similarly, In contrast, Whereas), then name the matching method in the second poem and embed its words. |
| 3 | `effect-comparison` | Comparison of Effects | AO2 | checkbox | In ONE sentence holding both poems: what does each method do to a reader, and where do those two effects part company? |
| 4 | `insight` | Evaluative Insight | AO2 | checkbox | What does that similarity or difference reveal about the two poets' approaches? Reach tentatively. |

**fieldIds (body-only convention, suffix `-q272`, 2 paragraphs):**
`outline-body-1-method-a-q272` · `outline-body-1-method-b-q272` ·
`outline-body-1-effect-comparison-q272` · `outline-body-1-insight-q272` ·
`outline-body-2-method-a-q272` · `outline-body-2-method-b-q272` ·
`outline-body-2-effect-comparison-q272` · `outline-body-2-insight-q272`

**Plan boxes + fan-out:** `plan-q272-para-1`, `plan-q272-para-2`. `_planOutlineTargets`
(`:7217`) needs one arm:
```js
m = /^plan-q272-para-([12])$/.exec(planField);
if (m) { const p = m[1]; return { mode: 'elements', family: 'q272',
         make: el => 'outline-body-' + p + '-' + el + '-q272' }; }
```
and `_planLabelElement` (`:7305`) a `family === 'q272'` branch mapping the four `@FIELD_SET`
labels: `Poem A method:` → `method-a` · `Poem B method:` → `method-b` ·
`Effect comparison:` → `effect-comparison` · `Insight:` → `insight`.
The protocol will emit those labels the moment the rows exist; it emits nothing until then.

### E4 — non-blocking parity rows worth doing in the same pass
- `bin/planning-keymatch-harness.js` covers AQA Lang P2, Lang P1 and AQA Literature only. **Add an
  AQA unseen row** so the 25 outline tags are proven against real render boxes, the way the other
  three are. (`bin/plan-fanout-harness.js` already picks unseen up automatically and reports
  `5 plan @FIELD_SETs → 25 fan-out ids checked`, all resolving.)
- `bin/build-markscheme-dataset.js` — widen `parseQ5Section`'s section selector from the literal
  `QUESTION 5` to a question-id parameter, and add the three unseen sections to `main()`. The file
  is already written to parse; nothing in it needs to change.
- `buildIntroCriteria` (`:55171`): for a paper with **no AO3**, the "Building Sentences" row still
  offers `buildAO='AO1'` items (Concept statement / Technique preview / …), which is correct — but
  the row's *label* is inherited from the AO3 shape. Low priority, cosmetic; flagged only because
  the unseen protocol has to explain three times that the building sentence is not context.
- **Penalty-code ↔ learn-chip parity:** the unseen protocol emits the universal set
  H1 · P1 · C1 · N1 · F1 · T1 · S1 · S2 · D1 · B1 · M1. `PENALTY_LEARN_MAP`
  (`frontend/wml-core.js:4844`) holds F1 · T1 · W1 · N1 · K1 · M1 · I1 · D1 — so H1, P1, C1, S1,
  S2, B1 have no chip. **This is inherited, not new:** the P1 anchor emits the identical set, so
  the no-chip state is the existing ruling for those six. Noted, not fixed.

---

## 7. GATES RUN — tails

```
$ node bin/protocol-standard-audit.js --board aqa
aqa/language1   10/10  6   9   8    2026-07-15   8/8  54  4   2026-07-20
aqa/language2   10/10  6   9   7    2026-07-15   8/8  65  5   2026-07-20
aqa/literature  10/10  10  6   13   2026-07-07   8/8  28  3   2026-07-20
aqa/poetry      10/10  18  7   18   2026-07-21   8/8  28  3   2026-07-22
aqa/unseen      10/10  9   7   13   2026-04-22   8/8  25  4   2026-03-25

$ node bin/ladder-check-harness.js
— CONTRACT (PROTOCOL-STANDARD.md C-LADDER): 4/4 canonical lines present.
— PROTOCOL protocols/aqa/unseen/planning: ladder-enabled, all three invariants hold.
— EL BYTE-TRACE (LIT): 28/28 code filing els + 5/5 plan @FIELD_SET fields are real …
— ENGINE CONTRACT (ladder mechanics …): 8/8 load-bearing lines present.
✅ ladder-check-harness passed                                            exit 0

$ node bin/plan-fanout-harness.js
— protocols/aqa/unseen/planning: 5 plan @FIELD_SETs → 25 fan-out ids checked
✅ plan-fanout-harness passed (6 converted protocol(s), 199 fan-out ids all
   resolve to real outline boxes).                                        exit 0

$ node bin/planning-keymatch-harness.js
✅ planning-keymatch-harness passed (every protocol outline tag matches a
   render box).   [AQA P2 54/54 · P1 44/44 · AQA Lit 28/28 — unseen not yet
   a row in this harness; see E4]                                         exit 0

$ node bin/seq-port-harness.js
seq-port-harness: retained-source guard ok — 20 manifest-loaded modules, none
  carry code-served teaching text.
seq-port-harness: PASS — 20 ported segments verbatim against source modules.  exit 0

$ node bin/inciting-incident-gate.js
✅ inciting-incident gate passed — scanned 1344 file(s).                   exit 0

$ bash bin/check-gold-shapes.sh
✅ gold-shape check: 4 citation(s) byte-match their source golds.          exit 0

$ node bin/tariff-gate.js                                                  exit 0
$ node bin/markscheme-gate.js
✅ markscheme-gate passed (123 checks).                                    exit 0
```

**One red gate in the repo, and it is NOT mine: `bin/criteria-lint.js` fails** (45 criterion
failures across 15 blocks). Every failing block is in `frontend/wml-assessment.js` — the Creative
Writing walk tick-lists. It scans `frontend/*.js` walk code and no protocol markdown, it is not
wired into `bin/pre-ship-check.sh`, and I edited no JavaScript. **Pre-existing; owned by the CW
lane.**

**What no static gate can prove**, stated so it is not mistaken for coverage: none of the above
shows that the model actually emits the markers at the right turns, that a rung plays as designed,
or that the Q27.1 → Q27.2 hand-off resumes cleanly. That needs one real drive on staging after E1–E3
land, per the PORT SOP §6.

---

## 8. WHAT IS NOT DONE (tracked, not silently skipped)

1. **Q27.2 planning files nothing** until E3 lands — deliberate, documented in the protocol itself,
   with the exact ids pre-agreed on both sides.
2. **The adversarial review pass (PORT SOP §5b) has not been run** on the unseen ladder. It is a
   GATE, and it must be an INDEPENDENT fresh-context reviewer — by definition not me, the builder.
   Brief it with the six lenses; the two most likely finds here are (a) a lens cell that names a
   candidate concept rather than a direction, and (b) an unconverted beat in `b5-bodies.md`
   (941 lines) still hand-running its own scaffold and fighting the code-owned ladder.
3. **`protocols/aqa/unseen/modules/protocol-c-polishing-unseen.md`** (2,454 bytes, 0 markers) is
   untouched — there is no polishing standard to port to, and it was out of scope.
4. **The AQA literature planning set still has paste-wall defects** outside the C-CHECKS rows —
   `b1-setup.md` asks the student for the text title, the author and the essay question, all of
   which the session holds (WML CLAUDE.md §3). Fixing that is a bigger job than this brief and was
   left alone; it is a real defect and should be queued.
