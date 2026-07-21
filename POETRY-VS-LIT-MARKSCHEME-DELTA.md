# AQA Poetry vs AQA Literature — Mark-Scheme Delta (build-gating)

**Verdict: DIFFERENCES-FOUND.** The *official AQA* 30-mark AO1=12/AO2=12/AO3=6 holistic scheme is the same in both, and the ONLY exam-board difference is the comparison dimension (poetry AO1 = comparison of two poems). But the two *Sophicly element-granular protocols* have diverged in more than comparison + the FSL body structure: different total denominators (poetry /30 vs lit /34), different per-section maxes, a poetry body-paragraph arithmetic bug (criteria sum to 6.0 under a "/7" label), and an asymmetric knowledge base (lit embeds the official AQA descriptors + AO4/SPaG; poetry embeds neither). Flags below.

Scope: read-only. No protocol files edited.

Files inspected (plugin root = `protocols/aqa/`):
- Poetry assessment: `poetry/modules/protocol-a-assessment-poetry.md` (1960 lines)
- Lit assessment: `literature/modules/protocol-a-assessment.md` (1004 lines)
- Lit official descriptors: `literature/modules/knowledge-mark-scheme.md` (65 lines)
- Poetry knowledge hub: `poetry/modules/knowledge-poetry.md` (579 lines)

---

## 1. Official AQA scheme — IDENTICAL apart from comparison (premise CONFIRMED)

`literature/modules/knowledge-mark-scheme.md:5-11` — official AQA June-2024 Level 6 (26–30):
- AO1: "Critical, exploratory, conceptualised response to task and whole text. Judicious use of precise references."
- AO2: "Analysis of the writer's methods with subject terminology used judiciously. Exploration of effects of writer's methods to create meanings."
- AO3: "Exploration of ideas/perspectives/contextual factors shown by specific, detailed links between context/text/task."

Poetry has **no** equivalent descriptor module; `poetry/modules/knowledge-poetry.md:559` only references the bands narratively ("AQA Level 5-6 descriptors require 'thoughtful,' 'perceptive,' 'critical,' and 'exploratory'"). Neil's supplied fact — poetry Level 6 is word-for-word identical except AO1 requires "critical, exploratory COMPARISON" and "well-structured COMPARISON" — is consistent with what the protocol demands (`poetry/…-poetry.md:453` "Sustaining comparison throughout"; `:614` "Comparative hook…between BOTH poems"). **At the exam-board level the two schemes ARE the same 30/12/12/6 scheme, comparison being the only difference.**

The divergence is entirely at the Sophicly *element-granular* implementation layer, below.

---

## 2. Mark-allocation tables (as authored in the protocols)

### 2a. AQA POETRY comparison — labelled total **/30**
Sequence: Introduction → Body 1 (Form) → Body 2 (Structure) → Body 3 (Language) → Conclusion (`…-poetry.md:28,506`).

| Section | Element (all COMPARATIVE — both poems) | AO | Worth | line |
|---|---|---|---|---|
| **Introduction (labelled /3)** | Comparative hook (both poems) | AO1/AO3 | 0.5 | 614 |
| | Building sentence — compares both poets' contexts | AO3 | 0.5 | 619 |
| | Building sentence — how each context shapes DIFFERENTLY | AO3 | 0.5 | 624 |
| | Three-point COMPARATIVE thesis | AO1 | 1.5 | 629 |
| | **criteria sum** | | **3.0 ✓** | 642 |
| **Body 1 Form / Body 2 Structure / Body 3 Language (labelled /7 EACH)** | Comparative topic sentence | AO1 | 0.5 | 849/1128/1370 |
| | Comparative terminology (both poems) | AO2 | 0.5 | 853/1132/1374 |
| | Strategic comparative evidence | AO1 | 0.5 | 857/1136/1378 |
| | Integrated comparative quotes | AO1 | 0.5 | 861/1140/1382 |
| | Comparative close analysis | AO2 | 1.0 | 865/1144/1386 |
| | Comparative effects, 2 sentences (each poet DIFFERENTLY) | AO2 | 1.0 | 869/1148/1390 |
| | Technique interplay | AO2 | 0.5 | 873/1152/1394 |
| | Comparative author's purpose | AO1/AO2 | 0.5 | 877/1156/1398 |
| | Comparative context (each poet) | AO3 | 1.0 | 881/1160/1402 |
| | **criteria sum** | | **6.0 ⚠ (labelled 7)** | 904/1166/1408 |
| **Conclusion (labelled /6)** | Restated comparative thesis | AO1 | 1.0 | 1598 |
| | Synthesised central comparative concept (F+S+L) | AO1 | 1.0 | 1602 |
| | Synthesised how both poets' methods serve purpose | AO1/AO2 | 1.5 | 1606 |
| | Universal comparative message | AO1 | 1.5 | 1610 |
| | Final evaluative judgement (which more effective) | AO1 | 1.0 | 1614 |
| | **criteria sum** | | **6.0 ✓** | 1629 |
| **TOTAL (labelled)** | Intro 3 + Body 7×3 + Conc 6 | | **/30** | 1769 |
| **TOTAL (criteria actually sum)** | Intro 3 + Body 6×3 + Conc 6 | | **27** | — |

### 2b. AQA LITERATURE (Shakespeare/prose, e.g. R&J) — total **/34**
Sequence: Introduction → Body 1 → Body 2 → Body 3 → Conclusion (`literature/…-assessment.md:28`). Bodies are anchor-quote (beginning/middle/end), single-text — not FSL.

| Section | Element | AO | Worth | line |
|---|---|---|---|---|
| **Introduction (/3)** | Compelling hook — concept/context | AO1/AO3 | 1.0 | 294 |
| | Building sentence — contextual backdrop | AO3 | 0.5 | 301 |
| | Building sentence — how context shapes themes/purpose | AO3 | 0.5 | 308 |
| | Clear three-point thesis | AO1 | 1.0 | 315 |
| | **sum** | | **3.0 ✓** | 334 |
| **Body ×3 (/8 EACH)** | Topic sentence links to thesis/question | AO1 | 1.0 | 516 |
| | Integrated quotes & evidence | AO1 | 0.5 | 523 |
| | Strategic selection of quotes | AO1 | 0.5 | 530 |
| | Accurate technical terminology | AO2 | 0.5 | 537 |
| | Analysis links to topic sentence | AO1/AO2 | 0.5 | 544 |
| | Perceptive close analysis (words/sound/structure) | AO2 | 1.5 | 551 |
| | Analysis of technique interplay | AO2 | 0.5 | 558 |
| | First detailed sentence on reader effects | AO2 | 0.5 | 565 |
| | Second detailed sentence on reader effects | AO2 | 0.5 | 575 |
| | Evaluates author's purpose | AO1 | 1.0 | 588 |
| | Context drives author's choices | AO3 | 1.0 | 595 |
| | **sum** | | **8.0 ✓** | 621 |
| **Conclusion (/7)** | Restates thesis | AO1 | 0.5 | 776 |
| | Links to question | AO1 | 0.5 | 783 |
| | Evaluates controlling concept | AO1 | 1.0 | 790 |
| | Links concept to key techniques | AO1/AO2 | 1.0 | 797 |
| | Evaluates author's purpose | AO1 | 2.0 | 804 |
| | Context drives central purpose | AO1/AO3 | 1.0 | 811 |
| | Evaluates moral/message | AO1 | 1.0 | 818 |
| | **sum** | | **7.0 ✓** | 836 |
| **TOTAL** | Intro 3 + Body 8×3 + Conc 7 | | **/34** | 921, 926 |

---

## 3. Per-AO / structural comparison

| Dimension | Poetry | Lit | Same? |
|---|---|---|---|
| 5-section shape (Intro + 3 bodies + Conc) | yes | yes | ✓ |
| TTECEA-family element criteria per body | yes (9, comparative) | yes (11) | ~ (leaner in poetry) |
| Body organising principle | **FSL fixed** (Form/Structure/Language), every element = BOTH poems | anchor-quote **B/M/E**, single text | ✗ (the comparison + FSL delta — expected) |
| AO4 / SPaG apparatus | none (poetry not SPaG-assessed) | `ao4-assessment.md`, `knowledge-ao4.md` present | ✗ |
| Official AQA Level 1–6 descriptors embedded | no descriptor module | `knowledge-mark-scheme.md` (full June-2024) | ✗ |
| Intro max | 3 | 3 | ✓ |
| Intro hook worth | 0.5 | 1.0 | ✗ |
| Intro thesis worth | 1.5 (comparative) | 1.0 | ✗ |
| Body max | **7** (labelled; criteria=6.0) | **8** | ✗ |
| Conclusion max | 6 | 7 | ✗ |
| **Grand total** | **30** | **34** | ✗ |

---

## 4. FLAGGED DIFFERENCES (beyond comparison + FSL)

1. **⚠ POETRY BODY ARITHMETIC BUG.** Each body paragraph is labelled "N Marks (7)" (`…-poetry.md:787,1072,1317`) and totals "out of 7" (`:904,1166,1408`), but its 9 element `Worth:` values sum to **6.0**, not 7.0 (verified by summation). Across 3 bodies that is **3 marks unaccounted for**: the criteria actually sum to Intro 3 + 6×3 + Conc 6 = **27**, yet the protocol's stated grand total is **/30** (`:1769,1929`). The /30 label is only reachable via the inflated per-body maxes, not the authored criteria. An examiner (AI) following the criteria can award at most 27; the % / grade conversion divides by 30. **Root fix needed before poetry ships:** either add 1.0 of criteria to each body (e.g. raise close-analysis to 1.5 to mirror lit) or relabel bodies /6 and the total /27 — decide which denominator is canonical. This is a key-match / arithmetic defect, not a comparison difference.

2. **Different grand total: poetry /30 vs lit /34.** Lit is +4 over the official AQA AO1/2/3 max of 30; the +4 aligns with AQA Shakespeare's AO4 (SPaG = 4 marks) apparatus that lit carries (`ao4-assessment.md`, `knowledge-ao4.md`, note at `…-assessment.md:182`) and poetry does not. So the denominators differ *legitimately* (poetry comparison is not SPaG-assessed) — but it means the two protocols are NOT the same 30-mark scheme numerically; they are two different Sophicly denominators. Any shared grade/percentage helper must key off each protocol's own total, never assume 30.

3. **Per-section weight drift.** Even setting totals aside, intro hook (0.5 vs 1.0), intro thesis (1.5 vs 1.0), body max (7 vs 8) and conclusion max (6 vs 7) differ. Poetry front-loads the comparative thesis (1.5); lit front-loads the hook (1.0). These are design choices, not comparison artefacts.

4. **Asymmetric descriptor anchoring.** Lit feedback is anchored to the embedded official AQA Level 1–6 bands (`knowledge-mark-scheme.md`); poetry has no such module, so its AI feedback references the bands only from memory/narrative (`knowledge-poetry.md:543-571` gives an "Ideas→Concept→Comparative Concept" ladder instead). For parity, poetry should carry the same official descriptor block (with the AO1 "comparison" wording swap) as a knowledge module.

---

## 5. Holistic → element-granular conversion — approaches DIFFER

Both protocols convert AQA's holistic Level 1–6 band scheme into Sophicly's stricter per-element deliberate-practice marks (each element carries a named `Worth:` and per-criterion score, penalty codes, gold rewrite + alternative model per section — the Ericsson granular-feedback model). The *method* (decompose each section into named, individually-scored criteria) is shared. But the *targets diverge*:
- **Lit** decomposes to a **34-mark** grid whose criteria sum exactly (3 + 8×3 + 7), i.e. AQA-30 for AO1/2/3 plus the AO4/SPaG headroom, and pins each band to the embedded official descriptors.
- **Poetry** decomposes to a **30-mark** label whose criteria only sum to **27** (the bug above) and does not embed the official descriptors.

So the conversion *philosophy* matches (granular, penalty-bearing, gold-modelled, Level-6-anchored) but the two implementations do **not** produce equivalent grids: one is arithmetically closed at 34, the other is arithmetically open (27 criteria under a 30 label). This must be reconciled before treating poetry as "same scheme as lit, comparison aside."

---

## Bottom line for the build gate
- Exam-board scheme: **same 30/12/12/6, comparison-only difference — CONFIRMED.**
- Sophicly protocol implementation: **NOT identical** — poetry /30 (criteria sum 27, a bug) vs lit /34, plus per-section weight drift and asymmetric descriptor/AO4 modules. Fix flag #1 (poetry body arithmetic) before ship; decide the canonical poetry denominator; consider porting the official descriptor block to poetry.
