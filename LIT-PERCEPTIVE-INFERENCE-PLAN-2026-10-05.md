# Perceptive inferences in Literature marking — the plan (FIXLIST #738, #738b)

**Status:** PLAN ONLY, nothing built. Waiting on Neil's ruling (WML Actions page, card 2).
**Written:** 2026-10-05, WML 325 A. **Totals:** unchanged on every paper, by construction (§4).

## 1. What Neil asked (FIXLIST #738, #738b, verbatim in the FIXLIST)

- The last 0.25 of each literature criterion is for perceptiveness, as in AQA Language Paper 1.
- Topic sentence: today worth 1. Make it 0.75 for linking to the thesis and question, plus 0.25 for perceptiveness.
- The next sentence is technique + evidence + inference. Credit the structure, then 0.25 more when the inference is perceptive.
- "Analysis links to topic sentence": what does it mean? Close analysis, effect 1, effect 2, purpose and context must ALL link to the topic sentence, and ALL need perceptiveness.
- Introduction and conclusion must be perceptive too. Every exam board. Totals stay the same.
- #738b: AQA Literature's word is "conceptual", not "perceptive". AQA still rewards inferences, and the Mrs Birling essay shows how powerful they are.

## 2. What is already true (measured, with sources)

1. **The rule already exists and already claims Literature.** `protocols/shared/mark-scheme/marking-fairness-universal.md:28-34`, Rule 5 (v7.20.630, Neil 2026-09-22): *"Every criterion's last 0.25 is reserved for work that is perceptive… It is the board's own top step."* Scope line 4: *"EVERY assessment — Language + Literature… all boards."* Every literature manifest loads it (counted: 31 of 31 board manifests).
2. **It has not reached Literature marking.** Count-only probe on prod, 2026-10-05 (no student text read): marks in the AQA Language Paper 1 table shape carry the Rule 5 wording ("not yet perceptive") in **12 of 25** chats + docs; marks in the Literature table shape carry it in **0 of 7**. Not yet known: whether any of those 7 were marked after 22 September.
3. **Why it does not land: the Literature table has no row for it to land on.** AQA Language Paper 1 restates Rule 5 inside its own protocol (`aqa/language1/modules/protocol-a-assessment.md:64-69`), and its rows follow the sentences the student writes: topic sentence · technique + quote + inference (one row) · close analysis · effect 1 · effect 2 · purpose. The Literature tables (`aqa/literature/modules/protocol-a-assessment.md:528-611` and eight siblings) are an older shape with 11 rows:
   - **No inference row at all.** The technique + evidence + inference sentence is split across three rows about quotes and terms (integrated quotes, strategic selection, terminology). A perceptive inference has nowhere to earn its quarter.
   - **"Analysis links to topic sentence" (0.5)** is defined in only one place, `shared/literature/modules/model-answer.md:849`: *"Analysis of author's methods links clearly back to the topic sentence."* So Neil's reading is right: it is about every analytical sentence, not one of them. As a single row, the marker has to guess which sentence it scores, and the self-assessment check already leaves it unmapped for that reason (`frontend/wml-assessment.js:9206`).
   - None of the literature protocols restates Rule 5 (grep: 0 of 22 files).
4. **Each board's own top-band words** (read from the mark-scheme PDFs on the drive, 2026-10-05):

| Board | Top band wording | Source |
|---|---|---|
| AQA Literature | "Critical, exploratory, **conceptualised** response… Judicious use of precise references… fine-grained and **insightful** analysis". The word "perceptive" appears **0** times. | `AQA Literature Mark Schemes/AQA Literature June 2024 MS.pdf`, Level 6 |
| Edexcel GCSE Literature | "A critical style is developed with maturity, **perceptive** understanding and interpretation. Discerning references…" | `Edexcel Literature Mark Schemes/June 2024 MS - Paper 1…pdf`, Level 5 |
| Edexcel IGCSE Literature | "assured personal engagement and a **perceptive** critical style" | `…/Edexcel IGCSE Modern Prose June 2024 MS.pdf`, Level 5 |
| Eduqas Literature | "show a **perceptive** understanding of the text" | `…/June 2024 MS - Component 1 Eduqas English Literature GCSE.pdf`, band 5 |
| OCR Literature | "consistently **perceptive** understanding… precise, pertinent and skilfully interwoven" | `OCR Literature Mark Schemes/June 2024 MS - Component 1…pdf`, Level 6 |
| CCEA, SQA, CAIE Literature | **Not read this session.** No CCEA Literature mark scheme was found among the drive's mark-scheme PDFs; SQA and CAIE PDFs exist and were not opened. | to read before their rows are relabelled |

5. **The Library already defines a perceptive inference**, and marking should use the same definition: `sophicly_library_cpts_v1_9_0/MODEL-ANSWER-STANDARD.md:175` (inference = what the words DO and what they are FOR, hedged), §3d at :371 (*ask what the writer uses the character FOR*), and N472 at :188 (a supporting quotation carries a perceptive inference, not its own analysis). Proof text: the AQA Mrs Birling model answer, `content/library-pages/_rewrites/aic-pilot-out/54869-3-mrs-birling-class-prejudice.md`.

## 3. The proposal — one rule, applied to every literature table

**A. One row per sentence the student writes** (the TTECEA+C order the planning, the outline and the Library model answers already use):
topic sentence · technique + evidence + inference · close analysis · interplay (where the board's table has it) · effect 1 · effect 2 · purpose · context (where the paper assesses it).

**B. Two mechanical moves make that table from today's, so no worth is invented:**
1. **Merge:** "Integrated quotes" + "Strategic selection of quotes" + "Accurate technical terminology" → ONE row, *Technique + evidence + inference*, worth their sum.
2. **Dissolve:** "Analysis links to topic sentence" stops being a row. Linking to the topic sentence becomes part of the "clear" standard of EVERY analytical row (Neil's reading). Its worth is split equally between Effect 1 and Effect 2.
   - Why the effects: they are the rows most often written as stand-alone, generic sentences ("this makes the reader feel sad"), which is exactly the failure that linking cures. At 0.5 each, the clear mark would be only 0.25; at 0.75 it is 0.5 clear + 0.25 perceptive. The Edexcel IGCSE tables already use 0.75 for the effects.
   - The alternatives, for Neil's note box: into the inference row (Neil's emphasis), or into the topic sentence.

**C. Rule 5 is restated inside every literature protocol** (as AQA Language Paper 1 does), so the last 0.25 of every row is the perceptive quarter, intro and conclusion included. The Why line says which quarter was missed: *"clear; not yet perceptive"* / *"perceptive — [the reading]"*.

**D. The word on each row (#738b):**
- **Rows about the ARGUMENT** (hook, thesis, topic sentence, the conclusion's rows): the board's own word. AQA = **conceptualised**; Edexcel, Edexcel IGCSE, Eduqas, OCR = **perceptive**.
- **Rows about READING THE QUOTATION** (the inference, close analysis, effects, purpose, context): **perceptive** on every board, because that is what we teach. AQA's own name for it is "insightful analysis" (Level 6), so the AQA Why can say "perceptive (AQA: insightful)" the first time it appears.

## 4. Every table, before → after (totals held)

Body paragraph, the shape now (11-row family) → after. Worths in marks. Intro and conclusion rows do not change on any board; they gain the restated Rule 5 only.

| Protocol | Body total | Topic sentence | Tech + evidence + inference | Close | Interplay | Effect 1 / 2 | Purpose | Context |
|---|---|---|---|---|---|---|---|---|
| AQA Lit, Shakespeare + Modern | 8 | 1.0 | 1.5 (was 0.5+0.5+0.5) | 1.5 | 0.5 | 0.75 / 0.75 (was 0.5 / 0.5) | 1.0 | 1.0 |
| AQA Lit, 19th century (router override) | 7 | 0.5 | 1.5 | 1.5 | 0.5 | 0.75 / 0.75 | 0.5 | 1.0 |
| CCEA prose | 9 | 1.0 | 1.5 | 2.0 | 0.5 | 1.5 / 1.5 (was 1.25) | 1.0 | — |
| Edexcel IGCSE heritage + literature | 7.5 | 1.0 | 1.5 | 1.0 | 0.5 | 1.0 / 1.0 (was 0.75) | 1.0 | 0.5 |
| Edexcel IGCSE modern | 7 | 1.0 | 1.5 | 1.0 | 0.5 | 1.0 / 1.0 | 1.0 | — |
| Eduqas literature | 9 | 0.5 | 1.5 | 1.0 | 1.0 | 1.25 / 1.25 (was 1.0) | 1.5 | 1.0 |
| Eduqas modern | 9 | 1.0 | 1.5 | 1.5 | 1.0 | 1.25 / 1.25 | 1.5 | — |
| OCR literature | 9 | 0.5 | 1.5 | 1.5 | 0.5 | 1.25 / 1.25 (was 1.0) | 1.0 | 1.5 |
| SQA critical reading | 5 | 0.5 | 1.0 (was 0.5+0.5) | 0.5 | 0.5 | 0.75 / 0.75 | 0.5 | 0.5 |

**Comparative poetry** (no "links" row, so only the merge applies): AQA poetry bodies (×3, /7) TEI 1.5 · Edexcel poetry bodies (×3, /4.5) TEI 1.0 · Eduqas poetry bodies (/4 and /6) TEI 1.0–1.5. Every section sum unchanged.

**Already in sentence order** (Edexcel Shakespeare + 19th century part (a), Eduqas Shakespeare): rows unchanged, Rule 5 restated; their TEI row (0.5 or 1.0) gains the named perceptive-inference quarter. Edexcel part (b) tables (Evidence & Quote Integration · Critical Interpretation · Effects · Purpose · Context) keep their rows.

**Not yet mapped** (their tables use a different format my extractor did not read): `aqa/unseen`, `ccea/unseen-prose`, `edexcel/unseen`, `edexcel/modern` (body), `edexcel-igcse/modern-prose`, `eduqas/unseen`, `ocr/poetry`. The gate below counts them, so none can be skipped silently.

## 5. What else must change in the same build (key-match, root §5d)

1. **AQA 19th-century override** — `includes/class-protocol-router.php:3128-3140` names the rows "Topic sentence links to thesis and question" and "Evaluates author's purpose" by their exact text and re-weights them for the /30 essay. Renamed rows must be renamed there in the same change, or the override silently points at text that no longer exists.
2. **Self-assessment gap check (#686)** — `GAP_SKILL_RULES` in `frontend/wml-assessment.js:9200-9215` maps each criterion to the skill the student rated. The new inference row must be mapped (to *Evidence*; the student does not rate "inference" separately). `bin/para-gap-check-harness.js` gate A counts the protocol's criteria and fails until it is.

## 6. The gates that prove it

1. **New `bin/lit-perceptive-gate.js`, in pre-ship:** for every literature protocol (a COUNT of files from the manifests, so a new or unmapped file fails): every section's worths sum to the same total as today (today's totals frozen in the gate from this plan's §4); each body has exactly one technique + evidence + inference row and no "Analysis links to topic sentence" row; Rule 5 is restated with the board's word. Proved by mutation: put the old row back → red.
2. **`tariff-gate.js`** stays green: board totals are quoted from the PDFs and do not move.
3. **`para-gap-check-harness.js`** green after the mapping in §5.2.
4. **After release, the measurement that matters:** re-run the count-only prod probe. The Rule 5 wording must appear in new Literature marks (today 0 of 7).

## 7. Order of work, once ruled

AQA Literature first (the anchor), walked once on staging as a student with a real essay → the eight sibling tables by the same two moves → poetry → the unmapped seven after reading them → gates → one test cycle.
