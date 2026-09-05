# Eduqas GCSE English Language — source PDF audit

**Folder audited:** `sophicly-etchwp-package v2.6/Sophicly Etch Mark Scheme Resources/EDUQAS GCSE English/`,
subfolders `EDUQAS GCSE English Language Paper 1` and `EDUQAS GCSE English Language Paper 2`.
(The Literature, WJEC Poetry and Unseen-Poetry workbook folders are out of scope for this lane and
are covered only by the note at the end.)

**Measured 2026-09-05** with poppler 25.x from `/opt/homebrew/bin`: `pdfinfo` for the page count,
`pdffonts` for embedded fonts, `pdftotext -layout` for the characters actually extractable.
"Text layer" below means `pdftotext` returned real prose, not that a font was merely embedded.

---

## HEADLINE

**All 32 Language PDFs have a text layer. Not one is image-only.** Character density runs
660–2,780 non-whitespace characters per page, which is normal for a born-digital exam paper.

### The "no text for 'poem'" probe was a false alarm — and this is why

The word **"poem" appears 0 times across all 32 Language PDFs**, and that is correct: **Eduqas GCSE
English *Language* sets no poetry.** Component 1 is 20th-century prose fiction, Component 2 is 19th-
and 21st-century non-fiction. Poetry lives in English *Literature* Component 1, in the sibling
`EDUQAS WJEC Poetry` folder — where the word appears 125 times in the anthology guide and 9 times in
every past paper, all extractable.

An empty grep for a word that the document was never going to contain reads exactly like an empty
grep caused by a missing text layer. The two were conflated. The discriminating measurement is the
**character count**, not the presence of a search term (root `CLAUDE.md` §19: measure the thing you
actually want to know).

**The only text-free PDFs anywhere under `EDUQAS GCSE English/` are three 1-page picture exports in
`EDUQAS WJEC Poetry/Images for EDUQAS Poetry/` (~95 characters each).** They are images by design.

---

## COMPONENT 1 — `EDUQAS GCSE English Language Paper 1` (C700U10)

Eduqas prints Component 1 as **two booklets**: the question paper (`C700U10-1`) and a separate
**Resource Material** carrying the passage (`C700U10-1A`). Some bundles here staple both into one
PDF; others hold only one half. A sitting is authorable only when **both** halves are present.

| file | pages | text layer | what it is | sitting |
|---|---|---|---|---|
| `18 MAY 2022.pdf` | 6 | ✅ | **QP (p1–3) + Resource Material (p4–6)** | Wed 18 May 2022 |
| `18 MAY 2022 Insert.pdf` | 2 | ✅ | Resource Material only (duplicate of the above, p4–6) | Wed 18 May 2022 |
| `EDUQAS GCSE English Language Paper 1 s19-5700-01.pdf` | 3 | ✅ | **QP only** | Tue 4 June 2019 |
| `JUNE 2019 Insert.pdf` | 2 | ✅ | **Resource Material only** (pairs with the QP above) | Tue 4 June 2019 |
| `2023 EDUQAS Lang P1 Mark Scheme and Q Paper/June 2023 QP - Component 1 ….pdf` | 6 | ✅ | **QP (p1–3) + Resource Material (p4–6)** | Mon 5 June 2023 |
| `2023 EDUQAS Lang P1 Mark Scheme and Q Paper/June 2023 MS - Component 1 ….pdf` | 17 | ✅ | **Mark scheme** | Summer 2023 |
| `June 2023 QP - Component 1 ….pdf` (folder root) | 6 | ✅ | byte-identical duplicate (`md5 b3bf1767…`) | Mon 5 June 2023 |
| `EDUQAS GCSE English Language Paper 1 Past Papers/June 2023 QP ….pdf` | 6 | ✅ | byte-identical duplicate | Mon 5 June 2023 |
| `Mark Scheme for EDUQAS English Language Paper 1/June 2023 QP ….pdf` | 6 | ✅ | byte-identical duplicate — ⚠️ the **folder name is wrong**, this is the question paper, not a mark scheme | Mon 5 June 2023 |
| `June 2024 QP - Component 1 ….pdf` (folder root) | 4 | ✅ | ⚠️ **Resource Material ONLY** (code `C700U10-1A`) — despite the filename there are **no questions in it** | Thu 23 May 2024 |
| `EDUQAS GCSE English Language Paper 1 Past Papers/June 2024 QP ….pdf` | 4 | ✅ | byte-identical duplicate of the 2024 Resource Material | Thu 23 May 2024 |
| `NOVEMBER 2020 Insert.pdf` | 2 | ✅ | Resource Material only — **no question paper in this folder** | November 2020 |
| `NOVEMBER 2021 Insert.pdf` | 2 | ✅ | Resource Material only — **no question paper in this folder** | November 2021 |
| `wjec-eduqas-gcse-english-language-sams-100914.pdf` | 4 | ✅ | Specimen Assessment Materials, Component 1 | specimen (2014) |
| `gcse-eng-lang-component-1-additional-assessment-material.pdf` | 5 | ✅ | Additional Assessment Materials, Component 1 | undated |
| `EDUQAS GCSE-English-Language-Paper-1-Specimen-insert-Oct-2016-2-1.pdf` | 6 | ✅ | **Sophicly-authored diagnostic** (City of the Beasts) — headed "Paper 1 Explorations in creative reading and writing", which is AQA's paper title, not Eduqas's | not a board paper |
| `EDUQAS GCSE-English-Language-Paper-1-Specimen-insert-Oct-2016-2-1 2.pdf` | 6 | ✅ | byte-identical duplicate of the above (`md5 1ad79207…`) | not a board paper |
| `EDUQAS WJEC GCSE-English-Language-Paper-1-Diagnostic Alex Cold.pdf` | 6 | ✅ | **Sophicly-authored mock**, same passage | not a board paper |

## COMPONENT 2 — `EDUQAS GCSE English Language Paper 2` (C700U20)

Component 2 is also two booklets, but the split is different and it matters: the **Resource Material
(`C700U20-1A`) carries only Source A**, the 21st-century newspaper article. **Source B, the
19th-century extract, is printed inside the question paper itself**, on the page facing the Section A
questions. A question-paper PDF that includes its Resource Material therefore contains both sources.

| file | pages | text layer | what it is | sitting |
|---|---|---|---|---|
| `Reading Sources …/z22-c700u20-1a.pdf` | 7 | ✅ | **QP + Source B (p1–4) + Resource Material / Source A (p5–7)** | Fri 10 June 2022 |
| `November 2022 QP - Component 2 ….pdf` | 7 | ✅ | **QP + Source B (p1–4) + Resource Material (p5–7)** | Wed 2 November 2022 |
| `June 2023 QP - Component 2 ….pdf` | 7 | ✅ | **QP + Source B (p1–4) + Resource Material (p5–7)** | Mon 12 June 2023 |
| `Mark Scheme …/November 2022 MS - Component 2 ….pdf` | 21 | ✅ | **Mark scheme** | Autumn 2022 |
| `Mark Scheme …/Microsoft-Word-C700U20-1-…-MS-A21.docx.pdf` | 19 | ✅ | **Mark scheme** — ⚠️ no matching question paper in this folder | Autumn 2021 |
| `June 2024 QP - Component 2 ….pdf` | 4 | ✅ | ⚠️ **Resource Material ONLY** (code `C700U20-1A`) — no questions | Thu 6 June 2024 |
| `June 2024 MS - Component 2 … Transactional Writing.pdf` | 2 | ✅ | ⚠️ **partial mark scheme** — Section B indicative content only, no Section A | June 2024 |
| `component-2-additional-assessment-materials-eng.pdf` | 12 | ✅ | Additional Assessment Materials, Component 2 | undated |
| `6-component-2-exemplars-unannotated.pdf` | 24 | ✅ | Exemplar candidate scripts (unannotated) | CPD Autumn 2016 |
| `Reading Sources …/EDUQAS … PAPER 2 READING SOURCE.pdf` | 5 | ✅ | **Sophicly-authored** source pair (The Crossing / Idle Days in Patagonia) — headed with AQA's paper title | not a board paper |
| `Reading Sources …/EDUQAS … PAPER 2 READING SOURCE v2.pdf` | 5 | ✅ | Sophicly-authored, revised version of the above | not a board paper |
| `Reading Sources …/Practice Paper 3 Lang p2.pdf` | 3 | ✅ | **Sophicly Practice Paper 3** (sources only, no questions) | not a board paper |
| `Reading Sources …/Practice Paper 4 Lang p2.pdf` | 4 | ✅ | **Sophicly Practice Paper 4** (sources only) | not a board paper |
| `Reading Sources …/Practice Paper 5 Lang p2.pdf` | 4 | ✅ | **Sophicly Practice Paper 5** (sources only) | not a board paper |

---

## WHAT THAT MAKES AUTHORABLE

**Six board sittings have both the questions and the source text, and all six are authored** by
`bin/live-model-author-eduqas.py`:

| component | sitting | topic | source(s) |
|---|---|---|---|
| 1 | June 2019 | `201906` | 89-line prose extract (Helen Simpson) |
| 1 | May 2022 | `202205` | 80-line prose extract (unattributed) |
| 1 | June 2023 | `202306` | *A World of Her Own*, 78 lines (Penelope Lively) |
| 2 | June 2022 | `202206` | *Knockout Punch* (Craig Arnott) / *London Labour and the London Poor* (1851) |
| 2 | November 2022 | `202211` | *Revealed: … Jumbo …* (Alan Lee) / Matthew Scott's autobiography (1885) |
| 2 | June 2023 | `202306` | *We save people. It's just our job* (Louise France) / New York Tribune (1869) |

**Four sittings are REFUSED, every one of them for a missing half — never for a text-layer problem:**

| component | sitting | what is here | what is missing |
|---|---|---|---|
| 1 | May 2024 | Resource Material only | the question paper (`C700U10-1`) |
| 1 | November 2020 | insert only | the question paper |
| 1 | November 2021 | insert only | the question paper |
| 2 | June 2024 | Resource Material + a Section-B-only mark scheme | the question paper (`C700U20-1`), which also carries Source B |

A sitting cannot be authored from a Resource Material alone: without the question paper there are no
questions, no tariffs and — for Component 2 — no Source B. Inventing any of those is forbidden.

⭐ **Also refused: everything Sophicly authored itself.** The two "Specimen insert"/"Diagnostic"
Component 1 files, the two "READING SOURCE" files and Practice Papers 3–5 are **our own material**,
not Eduqas's — three of them are even headed with AQA's paper titles ("Explorations in creative
reading and writing", "Writers' viewpoints and perspectives"). Live modelling is built on the
board's own past papers, so these are out of scope here. Practice Papers 3–5 additionally carry
sources with **no questions at all**.

## ⚠️ MORE SITTINGS EXIST OUTSIDE THIS FOLDER — flagged, not used

`mdfind` for the paper codes turned up Eduqas Language papers elsewhere on the drive that would
unlock further sittings. They were **not** used, because this lane's brief scopes authoring to the
folder above and provenance should not silently reach outside it. The engine lane may want them:

- `~/Downloads/a21-C700U20-1.pdf` + `a21-C700U20-1A.pdf` + `a21-C700U20-1-ms.pdf` — Component 2
  **Autumn 2021**: question paper, Resource Material *and* mark scheme, a complete set.
- `~/Downloads/November 2022 QP - Component 1 ….pdf`, `June 2022 QP - Component 1 ….pdf`,
  `June 2017 QP/IN - Component 1 ….pdf`, `s17-5700-01.pdf` + `s17-5700-01a.pdf`, `a17-5700-01.pdf`,
  `a20-C700U10-1A.pdf` — several further Component 1 sittings.
- `~/Downloads/June 2024 MS - Component 1 ….pdf`, `a21-C700U10-1-ms.pdf`, and
  `My Drive/GCSE English Courses/Mark Schemes for the Exam Boards/…/November 2022 MS - Component 1 ….pdf`
  — further mark schemes.

If those are copied into the audited folder, `live-model-author-eduqas.py` authors them unchanged —
it reads the sitting off the paper's own printed date and refuses if `--sitting` disagrees.
