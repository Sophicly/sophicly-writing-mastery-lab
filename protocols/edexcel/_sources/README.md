# Edexcel GCSE English Language (1EN0) — second-series sources, extracted text

**Why these files exist.** `bin/tariff-gate.js` resolves only two path aliases — `MSR/` (the shared
`Sophicly Etch Mark Scheme Resources` library) and `CAM/` (the Cambridge tree). Both papers' PRIMARY
authority, the June 2024 mark schemes, resolve under `MSR/` and are cited directly in
`protocols/_marks/edexcel__language_p1.json` and `_p2.json`, so no new alias is needed for the gate.

PROTOCOL-STANDARD Part E1.4 also requires reading **more than one series**, to tell a recurring pattern
from one paper's feature. The second series for each paper lives in a THIRD tree the gate cannot reach —
`My Drive/GCSE English Courses/` — so its `pdftotext -layout` output is committed here, and the protocol
headers cite these paths. The PDFs themselves are not copied (they are large and already on the drive).

| file | source PDF on the drive | what it confirmed |
|---|---|---|
| `p2-ms-jun2022.txt` | `My Drive/GCSE English Courses/Edexcel English Language/Edexcel English Language Paper 2/June 2022 MS - Paper 2 Edexcel English Language GCSE.pdf` | Paper 2's question set and tariffs are RECURRING, not one series' feature: Q1 2 · Q2 2 · Q3 15 · Q4 1 · Q5 1 · Q6 15 · Q7a 6 · Q7b 14 · Q8 or 9 40 (24 + 16) — identical to June 2024. |
| `p1-ms-nov2023.txt` | `My Drive/GCSE English Courses/Mark Schemes for the Exam Boards/Language Paper 1 Mark Schemes/November 2023 MS - Paper 1 Edexcel English Language GCSE.pdf` | Paper 1's set is likewise recurring (Q1 1 · Q2 2 · Q3 6 · Q4 15 · Q5 or 6 40), and the AO2 three-level grid with its language-OR-structure note is unchanged. ⚠️ It also shows ONE drift: its AO6 grid prints the bands as 1–3 · 4–6 · 7–9 · 10–12 · 13–16, where June 2024 prints 1–4 · 5–7 · 8–10 · 11–13 · 14–16. June 2024 is the current series and is what the protocols quote. |

Extracted 2026-09-13 with `pdftotext -layout`. These are extraction artefacts for provenance, never a
substitute for the PDF: the tariff gate deliberately re-opens PDFs, because a markdown or text
transcription can be edited and a citation to one proves nothing.
