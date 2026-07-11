# BOARD-ASSESSMENT-MAP.md — Canonical Exam-Assessment Grid

**Status:** SOURCE OF TRUTH. This is the single durable map of *which paper / component / question tests which AO(s) for how many marks* across every exam board Sophicly supports. Built to STOP re-deriving the mark schemes ever again, and to FEED the notes-toolkit board strip (one source, no drift).

**Siblings:** `PROTOCOL-STANDARD.md` (what the protocol says) · `ASSESSMENT-MECHANICS.md` (how the engine behaves) · `CN-STANDARD.md` (conceptual-notes contract). This doc = *where the marks live per board*.

**Owner:** Neil (Sophicly). **Last built:** 2026-07-11 (Language half; Literature = TODO batch 2).

---

## HOW THIS DOC IS MAINTAINED (read before editing)

1. **Every value is SOURCED FROM THE WML PROTOCOLS** — `protocols/{board}/{subject}/modules/{foundation*,protocol-a-assessment,knowledge-mark-scheme,assessment-section-*}.md`. Never author a mark/AO from general GCSE knowledge. (CLAUDE.md §5c; `feedback_student_content_derives_from_protocols_never_assume`.)
2. **`CONFIRM` = the protocol files do NOT state it.** A `CONFIRM` cell is a to-do for Neil to verify, NEVER a guess dressed as fact. Do not silently fill one.
3. **Arithmetic-only inferences are labelled** (e.g. "sums to 80, not asserted in protocol").
4. **Drift between protocol files is logged in §DRIFT**, not silently reconciled — feeds the toolkit decoder audit (Task 2).
5. **When a protocol's marks change, update this doc in the SAME commit** and the toolkit board-strip data that reads from it.

---

## LANGUAGE (GCSE + IGCSE) — active toolkit surface

AO legend (GCSE English Language, AQA/Edexcel/Eduqas): **AO1** retrieve/interpret · **AO2** analyse language & structure · **AO3** compare across texts · **AO4** evaluate critically · **AO5** content & organisation (writing) · **AO6** technical accuracy (SPaG). Section B writing marks split **AO5 : AO6**.

### AQA GCSE English Language (8700)
Source: `aqa/language1/modules/protocol-a-assessment.md` + `knowledge-ttecea-lang.md`; `aqa/language2/modules/protocol-a-assessment.md` + `knowledge-mark-scheme.md`.

| Paper | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| P1 | Q1 | AO1 | 4 | Retrieval — four explicit facts |
| P1 | Q2 | AO2 | 8 | Analyse writer's language |
| P1 | Q3 | AO2 | 8 | Analyse text structure |
| P1 | Q4 | **AO4** | 20 | Critically evaluate vs a statement *(EVALUATION)* |
| P1 | Q5 (Sec B) | AO5+AO6 | 40 (24/16) | Creative — descriptive/narrative |
| P2 | Q1 | AO1 | 4 | Select true statements (Source A) |
| P2 | Q2 | AO1 | 8 | Summarise differences across sources |
| P2 | Q3 | AO2 | 12 | Analyse language, one source |
| P2 | Q4 | **AO3** | 16 | Compare viewpoints + methods *(COMPARISON)* |
| P2 | Q5 (Sec B) | AO5+AO6 | 40 (24/16) | Transactional — present a viewpoint |

Per-paper total sums to **80** (not asserted in protocol — CONFIRM 80/1h45/50%).

### Edexcel GCSE English Language (1EN0)
Source: `edexcel/language1/modules/{foundation-lang1,protocol-a-assessment}.md`; `edexcel/language2/modules/{foundation-lang2,protocol-a-assessment,knowledge-mark-scheme}.md`.

| Paper | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| P1 | Q1 | AO1 | 1 | Simple retrieval |
| P1 | Q2 | AO1 | 2 | Retrieval |
| P1 | Q3 | AO2 | 6 | Language + structure analysis |
| P1 | Q4 | **AO4** | 15 | Critical evaluation *(EVALUATION)* |
| P1 | Q5 (Sec B) | AO5+AO6 | 40 (24/16) | Imaginative/creative writing |
| P2 | Q1 | AO1 | 2 | Retrieval |
| P2 | Q2 | AO1 | 2 | Retrieval |
| P2 | Q3 | AO2 | 15 | Language analysis (single source) |
| P2 | Q4 | AO1 | 1 | Retrieval |
| P2 | Q5 | AO1 | 1 | Retrieval |
| P2 | Q6 | **AO4** | 15 | Critical evaluation *(EVALUATION)* |
| P2 | Q7a | AO1 | 6 | Retrieval (second source) |
| P2 | Q7b | **AO3** | 14 | Compare ideas + methods *(COMPARISON)* |
| P2 | Q8/Q9 (Sec B) | AO5+AO6 | 40 (24/16) | Transactional writing |

P1 total = **64** (24 reading + 40 writing, stated). P2 total/subtotals CONFIRM (arithmetic → 56+40=96, not asserted).

### Eduqas GCSE English Language (C700)
Source: `eduqas/language1/modules/{foundation-lang1,protocol-a-assessment}.md`; `eduqas/language2/modules/{foundation-lang2,protocol-a-assessment}.md`. Papers = **Component 1 / Component 2**.

| Comp | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| C1 | Q1 | AO1 | 5 | Retrieval from extract |
| C1 | Q2 | AO2 | 5 | Language analysis (TTECEA) |
| C1 | Q3 | AO2 | 10 | Analyse writer's methods |
| C1 | Q4 | AO2 | 10 | Language/structure analysis |
| C1 | Q5 | **AO4** | 10 | Evaluation of the text *(EVALUATION)* |
| C1 | Sec B | AO5+AO6 | 40 (24/16) | Creative prose |
| C2 | Q1 | AO1 | 3 | Retrieval (Source A) |
| C2 | Q2 | AO2 | 10 | Language analysis (Source A) |
| C2 | Q3 | AO1 | 3 | Retrieval |
| C2 | Q4 | **AO4** | 10 | Evaluate a statement *(EVALUATION)* |
| C2 | Q5 | AO1 | 4 | Synthesis across both sources |
| C2 | Q6 | **AO3** | 10 | Compare ideas + methods *(COMPARISON)* |
| C2 | Sec B Task 1 | AO5+AO6 | 20 (12/8) | Transactional (~400 words) |
| C2 | Sec B Task 2 | AO5+AO6 | 20 (12/8) | Transactional (~400 words) |

Each component totals **80** (40 reading + 40 writing). Board code "C700" + durations/weightings CONFIRM (not in protocol text).

### Edexcel IGCSE English Language (Spec A) — ⚠ different AO scheme
Uses **AO1–AO5 labels, NOT the GCSE AO3/AO4 split.** Source: `edexcel-igcse/language1/modules/{foundation,protocol-a-assessment}.md`; `edexcel-igcse/language2/modules/{assessment-section-a,assessment-section-b}.md`. NOTE: the `language2` files self-label as **"Lang P2 = set-text literary analysis + creative writing"** (not anthology non-fiction) — reported as the protocol has it.

| Paper | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| P1 | Q1 | AO1 | 2 | Retrieval — two selections |
| P1 | Q2 | AO1 | 4 | Explain in own words |
| P1 | Q3 | AO1 | 5 | Five quoted thoughts/feelings (1 each) |
| P1 | Q4 | AO2 | 12 | Language & structure, effects |
| P1 | Q5 | **CONFIRM** | 22 | Comparative essay across two texts |
| P1 | Q6 | AO4+AO5 | 45 (27/18) | Transactional writing |
| P2 | Q1 | AO1+AO2 (no AO3) | CONFIRM total | Literary analysis of set text |
| P2 | Q2/Q3/Q4 (choose 1) | AO4+AO5 | 30 (18/12) | Creative/imaginative writing |

### Language boards WITHOUT protocol dirs (do NOT invent)
`OCR (J351)`, `CCEA`, `SQA` have **no `language1`/`language2` protocol folders** in the repo (OCR = literature+poetry only; CCEA = prose+unseen-prose; SQA = critical-reading). Their Language grids are **CONFIRM / out-of-scope** until protocols exist.
- OCR is Neil-confirmed *verbally* (`reference_board_paper_ao_map`): comparison AO3 = **Paper 1/Comp 01**, evaluation AO4 = **Paper 2/Comp 02** — but the per-question mark grid is NOT in the repo. Mark CONFIRM.
- Cambridge IGCSE 0500/0990, SQA, CCEA do **not** use the GCSE AO3/AO4 comparison/evaluation split — do not force those labels.

---

## §DRIFT — protocol inconsistencies caught during extraction (feeds toolkit decoder audit, Task 2)

1. **Edexcel IGCSE P1 Q6 AO mislabel.** `edexcel-igcse/language1/planning/b8-sectionb-final.md` L578 calls P1 Q6 "45 marks: 27 AO5, 18 AO6" — contradicts the authoritative `protocol-a-assessment.md` (**AO4=27, AO5=18**). The planning file shifted AO4→AO5 and AO5→AO6. Grid above uses protocol-a-assessment.md. **Fix: correct the planning file.**
2. **Edexcel IGCSE filename drift vs handoff spec:** actual is `language1/modules/foundation.md` (not `foundation-lang1.md`); `language2` has no `protocol-a-assessment.md` (uses `assessment-section-a.md` + `assessment-section-b.md`). Noted so future lookups don't chase a missing filename.
3. **No `exam-question-format*.md` for ANY Language subject** — those files exist only on the Literature side. Language paper structure lives in `foundation*` + `protocol-a-assessment` + `knowledge-mark-scheme`. (Corrects the handoff's stated source path.)

---

## §CONFIRM — consolidated open items for Neil

- **Edexcel IGCSE P1 Q5** (22m comparative): AO(s) never labelled in protocol → assign.
- **Edexcel IGCSE P2 Q1**: headline mark total not stated (internal rubric sums to 30). Confirmed AO1+AO2, AO3 explicitly excluded.
- **Per-paper totals / durations / weightings**: AQA, Edexcel P2, Eduqas — arithmetic known, not asserted in protocol.
- **Board/exam codes** (C700, 1EN0/02): supplied from general knowledge, not in protocol text.
- **OCR / CCEA / SQA / Cambridge IGCSE Language**: no protocol grid in repo.

---

## LITERATURE (GCSE + IGCSE)

AO allocation differs PER PAPER (do not assume uniformity). Key divergences: AQA/Eduqas lit AO4 = **SPaG** (Shakespeare/modern only); Edexcel/OCR carry AO4-SPaG on some Qs; **Edexcel IGCSE AO4 = CONTEXT, not SPaG** (opposite of GCSE); CCEA/SQA use their own scheme (no AO3/AO4 split). ⚠ Several boards' protocol files hold Sophicly's **internal marking rubric (Intro/Body/Conclusion), not always the real exam-paper grid** — flagged per board.

### AQA GCSE English Literature (8702)
Source: `aqa/literature/modules/{protocol-a-assessment,exam-question-format-extract,exam-question-format-modern}.md`; `aqa/poetry/…`; `aqa/unseen/…`.

| Paper/Section | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| P1 A | Shakespeare (extract→whole) | AO1+AO2+AO3 **+AO4 SPaG** | 30 **+4 = 34** | Extract-led play analysis |
| P1 B | 19th-C novel (extract→whole) | AO1+AO2+AO3 | 30 | Extract-led novel analysis |
| P2 A | Modern text (no extract) | AO1+AO2+AO3 **+AO4 SPaG** | 30 **+4 = 34** | Whole-text character/theme |
| P2 B | Anthology poetry comparison | AO1+AO2+AO3 | 30 | Compare named + chosen poem |
| P2 C | Q27.1 unseen poem | AO1 12 + AO2 12 | 24 | Single unseen analysis |
| P2 C | Q27.2 unseen comparison | AO2 only | 8 | Compare methods, two unseen |

AO4-SPaG on **Shakespeare + modern only** (verified). Per-AO split of the 30s = CONFIRM (protocol gives total + AO4 only).

### Edexcel GCSE English Literature (1ET0)
Protocols split each 40-mark Q into two 20-mark teaching sub-Qs (extract + whole-text). Source: per-subject `foundation/protocol-a-assessment/knowledge-mark-scheme/exam-question-format.md`.

| Paper/Section | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| P1 A Shakespeare | Q1(a) extract | AO2 | 20 | Language/form/structure in extract |
| P1 A Shakespeare | Q1(b) whole | AO1 15 + AO3 5 | 20 | Knowledge + context, whole play |
| P1 B Modern/post-1914 | single essay | AO1 15 + AO3 15 (+AO4 4?) | 34 | Response + context (+SPaG?) |
| P2 A 19th-C | Q(a) extract | AO2 | 20 | Language/form/structure |
| P2 A 19th-C | Q(b) whole | AO1 | 20 | Knowledge/critical engagement |
| P2 B Poetry anthology | comparative essay | AO1+AO2+AO3 | 20 | Compare two anthology poems + context |
| P2 C Unseen | single poem | AO1+AO2 | 15 | Analyse one unseen poem |
| P2 C Unseen | comparison (“Q12”) | AO1 8 + AO2 12 | 20 | Compare two unseen poems |

### Eduqas GCSE English Literature (C720) — “Component 1/2”
Source: per-subject `foundation/protocol-a-assessment/exam-question-format.md`.

| Comp/Section | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| C1 A Shakespeare | Q1 extract | AO1+AO2 | 15 | Methods in printed extract |
| C1 A Shakespeare | Q2 whole | AO1+AO2 (20) **+AO4 5** | 25 | Theme/character + SPaG |
| C1 B Poetry (from 1789) | single named poem | AO1+AO2+AO3 | 15 | Non-comparative anthology poem |
| C1 B Poetry | comparison | AO1+AO2+AO3 | 25 | Compare two anthology poems |
| C2 B 19th-C | single extract Q | AO1+AO2+AO3 | 40 | Theme/character extract→whole |
| C2 A Modern (post-1914) | whole-text Q | AO1+AO2 (35) **+AO4 5** | 40 | Prose/drama + SPaG; **no AO3** |
| C2 C Unseen | Q3.1 single | AO1+AO2 | 15 | One unseen poem |
| C2 C Unseen | Q3.2 comparison | AO1+AO2 | 25 | Compare two unseen; no AO3 |

Shakespeare/modern = **AO1+AO2 only, no AO3** (verified). C1 = C2 = 40 each.

### Edexcel IGCSE English Literature (4ET1) — ⚠ protocols = INTERNAL RUBRIC, not the real paper grid
AO4 = **CONTEXT** (SPaG explicitly not assessed). The files carry Intro/Body/Conclusion rubric totals, **not** Paper 1/2, Section A/B, open/closed-book, unseen or coursework mechanics — the real 4ET1 exam structure is **CONFIRM** (absent).

| Subject dir | AO(s) | Rubric total | Tests |
|---|---|---|---|
| heritage | AO1/AO2/AO4 | 30 | Hook+context intro / 3 bodies / conclusion |
| literature (unified) | AO1/AO2/AO4 | 30 | SPaG removed; concept + context |
| modern-prose | **AO1 20 + AO4 20 (no AO2)** | 40 | Knowledge/engagement + text–context |
| modern | AO1/AO2/(AO4) | 30 | Final total computed AO1+AO2 |

### OCR GCSE English Literature (J352)
Source: `ocr/literature/…` + `ocr/poetry/…` (Part a/b).

| Component/Section | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| Lit Comp1 A | Modern prose/drama (extract & elsewhere) | AO1–AO3 (36) **+AO4 4** | 40 | Modern text + wider work |
| Lit Comp1 B | 19th-C novel (**paired** extracts A+B) | AO1–AO3 **+AO4 4** | 40 | Two-extract close read + wider novel |
| Lit Comp2 A | Shakespeare (extract & elsewhere) | AO1–AO3 **+AO4 4** | 40 | Extract + wider play |
| Poetry J352/02 A | **Part (a)** anthology vs printed poem | AO1 + **AO2 (dominant)**; no AO3/AO4 | 20 | Compare two poems (interwoven) |
| Poetry J352/02 A | **Part (b)** single studied poem | AO1 + AO2 (equal) | 20 | Single-poem methods + response |

Part (a) penalty **S1**: sequential (Poem-A-then-Poem-B) comparison is penalised — must interweave. Component-code mapping is internally contradictory → CONFIRM.

### CCEA GCSE English Literature (spec code GEL11; protocols label board “CEA”)
No AO3/AO4 split. Bands (5). Source: `ccea/prose/…` + `ccea/unseen-prose/…`.

| Unit/Section | Question | AO(s) | Marks | Tests |
|---|---|---|---|---|
| Unit 1 A (prose) | “How far do you agree…” (char **or** theme) | AO1 20 + AO2 20 | 40 | Closed-book studied-novel argument |
| Unit 1 B (unseen-prose) | “How the writer engages the reader” (2 bullets) | AO1+AO2 (holistic) | 20 | Cold-read extract engagement |

Unit 2 (Drama & Poetry) referenced but AO/marks not stated → CONFIRM. Note: the memory’s “Unit 4 Task 2” pattern is **not** in these files.

### SQA English (National 5) — own scheme (Understanding/Analysis/Evaluation, NOT GCSE AOs)
Source: `sqa/critical-reading/…`. **Higher tier + Paper 1 (RUAE) absent → CONFIRM.**

| Paper/Section | Question | Skill | Marks | Tests |
|---|---|---|---|---|
| P2 Sec 1 Scottish Text | Q1–Q4 | Understanding/Analysis/Evaluation | 2–4 each | Extract close questions |
| P2 Sec 1 | Q5 comparison | Analysis+Evaluation | 8 | Compare extract to author’s other text |
| P2 Sec 2 | Critical essay | Analysis+Evaluation | 20 | Essay on a different-genre studied text |

Section 1 totals 20 (`2+4+2+4+8` typical). Technical accuracy integrated (no separate SPaG).

---

## §DRIFT — Literature (protocol inconsistencies caught during extraction)

1. **Edexcel GCSE Shakespeare AO4:** `exam-question-format.md` says the 40 “includes AO4”, but `knowledge-mark-scheme.md` gives Q1a AO2-only + Q1b AO1 15/AO3 5 with **no AO4**. → CONFIRM whether SPaG applies to Shakespeare.
2. **Edexcel GCSE Modern total + AO4 value:** exam-format says 40; mark-scheme/foundation give **34** (AO1 15+AO3 15+AO4 4); `protocol-a-assessment` says **AO4 8**. Uses AO3 (context) not AO2 — unusual for post-1914. → CONFIRM.
3. **Eduqas Shakespeare:** shared `exam-question-format.md` says single 40-mark Q incl. AO1–AO4; `shakespeare/foundation.md` says **two Qs (15+25), no AO3, AO4 on Q2 only**. Foundation is authoritative; board-format module stale.
4. **Eduqas Unseen:** `foundation.md` (Q3.1=24 AO1/AO2, Q3.2=8 AO2-only) contradicts `knowledge-mark-scheme.md`/`protocol-a-assessment` (Q3.1=15, Q3.2=25, AO1+AO2). Mark-scheme used; foundation L146/L150 appear stale.
5. **OCR component code:** `literature/foundation.md` “J352/01=19th-C, /02=Shakespeare” vs `exam-question-format.md` “Comp1=Modern+19th-C, Comp2=Shakespeare+Poetry+Unseen”. → CONFIRM.
6. **Generic module warning:** Edexcel’s `exam-question-format.md` is byte-identical across all 5 subjects and omits Poetry/Unseen allocations — never treat it as the sole source.

## §CONFIRM — Literature (open items for Neil)

- **Edexcel IGCSE 4ET1:** no real exam-paper grid in protocols (only internal rubric) — Paper 1/2, sections, open/closed-book, unseen/coursework all absent. Differing subject totals (modern-prose 40 vs others 30) not reconciled.
- **Per-AO numeric splits of the 30/40 totals** (AQA, Edexcel, Eduqas) — mostly stated as totals + AO4 only.
- **CCEA Unit 2** (Drama & Poetry) AO/marks; **SQA Higher + Paper 1 RUAE**; **exam durations / % weightings** across all boards.
- **Cambridge IGCSE 0500/0990 Literature** — no protocol dir extracted (not present among the board dirs).
