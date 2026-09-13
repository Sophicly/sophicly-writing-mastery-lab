# PROTOCOL COVERAGE MATRIX — by qualification × paper × question type × stage

Living register (PROTOCOL-STANDARD Part E5). A row is **complete** only when all four evidence rows
are filled; anything else is a named gap. Mechanical status from `node bin/protocol-standard-audit.js`
(B = assessment 10 checks, C = planning 8 checks, D = polishing ENV 6 checks). Reachable = a live
lesson exists (census of `[writing_mastery_lab]` shortcodes, prod + staging, 2026-09-13).

Legend: ✅ done+tested · 🟢 built, mechanical gates green, not driven · 🟡 partial · ⬜ not started · ❌ gap (source missing)

## AQA GCSE English Language 8700 (spec 2026 sample papers; June 2024 mark schemes)

| paper | Q | type | assessment | planning | polishing | gold | reachable | notes |
|---|---|---|---|---|---|---|---|---|
| P1 | Q1 | retrieval | 🟢 (SKIP rule) | n/a | n/a | n/a | prod | |
| P1 | Q2 | language analysis, 2×TTECEA | 🟢 B 10/10 | 🟢 C 8/8 | 🟢 ENV v7.20.609 | knowledge-hub §2.A | prod | one staging chip turn measured (#485) |
| P1 | Q3 | structure analysis, 2×TTECEA | 🟢 | 🟢 | 🟢 | ❌ ¶2 is a placeholder (`knowledge-hub.md:47`) | prod | |
| P1 | Q4 | evaluation, intro+3+concl | 🟢 | 🟢 | 🟢 | knowledge-hub | prod | |
| P1 | Q5 | narrative, 7 scene elements | 🟢 | 🟢 | 🟢 | ❌ snippet + 376-word student model; floor is 650 | prod | |
| P2 | Q1 | true/false | 🟢 (SKIP) | n/a | n/a | n/a | prod diag | |
| P2 | Q2 | paired inference ×2 | 🟢 B 10/10 | 🟢 C 8/8 | 🟢 ENV v7.20.610 | knowledge-mark-scheme §2A | staging | |
| P2 | Q3 | language, 3×TTECEA | 🟢 | 🟢 | 🟢 | §2A | staging | |
| P2 | Q4 | comparison, intro+3+concl | 🟢 | 🟢 | 🟢 | §2A (no intro gold; effects-count self-contradiction :204) | staging | |
| P2 | Q5 | transactional, IUMVCC | 🟢 | 🟢 | 🟢 | §2A speech | staging | form list drift (review/leaflet) — mark scheme is authority |

## AQA GCSE English Literature 8702

| paper | task | assessment | planning | polishing | gold | reachable |
|---|---|---|---|---|---|---|
| P1 §A Shakespeare | extract + whole play, 34 | 🟢 B 10/10 | 🟢 C 8/8 | 🟡 ENV row v7.20.610 (rubric Part D sections pending) | knowledge-model-answer (Macbeth) + exemplars; R&J has no context-bank section | staging (R&J) |
| P1 §B 19th-c novel | 30, no AO4 | 🟢 (marked by the 34-shape — known over-mark) | 🟢 | 🟡 | same | prod planning only |
| P2 §A modern text | 34 | 🟢 | 🟢 | 🟡 | same | staging (inspector_calls outlining) |
| P2 §B anthology poetry | comparison 30 | 🟢 | 🟢 | 🟡 | model-answers-poetry | prod (planning) |
| P2 §C unseen 27.1 / 27.2 | 24 / 8 | 🟢 | 🟢 | 🟡 | knowledge-unseen | prod diag |

## Edexcel International GCSE English Language A (4EA1) — port in progress 2026-09-13 (subagent)

| paper | Q | type | assessment | planning | polishing | gold | reachable |
|---|---|---|---|---|---|---|---|
| P1 | Q1–Q3 | retrieval / own words | 🟡 tariffs verified | n/a | n/a | n/a | prod |
| P1 | Q4 | language+structure, 3×TTECEA | 🟡 (2/10) | 🟡 (0 markers) | ⬜ monolith | ? | prod |
| P1 | Q5 | comparative essay 22 | 🟡 | 🟡 | ⬜ | ? | prod |
| P1 | Q6/7 | transactional 45, IUMVCC | 🟡 | 🟡 | ⬜ | ? | prod |
| P2 | Q1 | anthology text analysis 30 | 🟡 (no protocol-a) | ⬜ (no planning dir) | ⬜ | ? | prod diag |
| P2 | Q2–4 | imaginative writing 30 | 🟡 | ⬜ | ⬜ | ? | prod diag |

## Edexcel GCSE English Language (1EN0) — port in progress 2026-09-13 (subagent)

| paper | Q | type | assessment | planning | polishing | gold | reachable |
|---|---|---|---|---|---|---|---|
| P1 | Q1–Q2 | retrieval | 🟡 | n/a | n/a | n/a | staging |
| P1 | Q3 | language+structure 6 | 🟡 (2/10) | 🟡 | ⬜ | ? | staging |
| P1 | Q4 | evaluation 15 | 🟡 | 🟡 | ⬜ | ? | staging |
| P1 | Q5/6 | imaginative writing 40 | 🟡 | 🟡 | ⬜ | ? | staging |
| P2 | Q1–2, 4–5 | retrieval | 🟡 | n/a | n/a | n/a | — |
| P2 | Q3 | language 15 | 🟡 | 🟡 | ⬜ | ? | — |
| P2 | Q6 | evaluation 15 | 🟡 | 🟡 | ⬜ | ? | — |
| P2 | Q7a/b | similarities 6 / compare 14 | 🟡 | 🟡 | ⬜ | ? | — |
| P2 | Q8/9 | transactional 40 | 🟡 | 🟡 | ⬜ | ? | — |

## Eduqas GCSE English Language (C700U10 / C700U20) — port in progress 2026-09-13 (subagent)

| component | Q | type | assessment | planning | polishing | gold | reachable |
|---|---|---|---|---|---|---|---|
| C1 | Q1 | list 5 | 🟡 | n/a | n/a | n/a | staging |
| C1 | Q2–Q4 | impressions / structure / thoughts, TTECEA ×1–2 | 🟡 (2/10) | 🟡 | ⬜ | ? | staging |
| C1 | Q5 | evaluation 10 | 🟡 | 🟡 | ⬜ | ? | staging |
| C1 | Q6 | creative prose 40 | 🟡 | 🟡 | ⬜ | ? | staging |
| C2 | Q1, Q3 | retrieval 3+3 | 🟡 | n/a | n/a | n/a | prod diag |
| C2 | Q2, Q4 | language 10 / evaluation 10 | 🟡 | 🟡 (4/8) | ⬜ | ? | prod diag |
| C2 | Q5 | synthesis 4 | 🟡 | 🟡 | ⬜ | ? | prod diag |
| C2 | Q6 | comparison 10 | 🟡 | 🟡 | ⬜ | ? | prod diag |
| C2 | Q7, Q8 | transactional 20+20 | 🟡 | 🟡 | ⬜ | ? | prod diag |

## Other boards (out of this brief's scope; recorded so nothing is rounded up)

Edexcel GCSE Literature (19th_century, modern, poetry, shakespeare, unseen) · Edexcel IGCSE Literature
(heritage, modern, modern-prose, literature) · Eduqas Literature (literature, modern, poetry,
shakespeare, unseen) · OCR (literature, poetry; NO OCR Language protocols exist) · SQA critical
reading · CCEA prose / unseen prose · Cambridge IGCSE (language1/2 no protocol-a): all 2/10 or
lower on the audit, polishing monolith, no Part D rubric.
