# PROTOCOL COVERAGE MATRIX — by qualification × paper × question type × stage

Living register (PROTOCOL-STANDARD Part E5). A row is **complete** only when all four evidence rows
are filled; anything else is a named gap. Mechanical status from `node bin/protocol-standard-audit.js`
(B = assessment 10 checks, C = planning 8 checks, D = polishing ENV 6 checks). Reachable = a live
lesson exists (census of `[writing_mastery_lab]` shortcodes, prod + staging, 2026-09-13).

Legend: ✅ done+tested · 🟢 built, mechanical gates green, not driven · 🟡 partial · ⬜ not started · ❌ gap (source missing)

**Journeys (real /chat on staging, 2026-09-13, v7.20.610):** P1 Q2 weak ✅ · P1 Q2 strong-different ✅ · P1 Q5 partial ✅ · P2 Q2 weak ✅ · P2 Q5 weak ✅ · Lit R&J body weak ✅ · Lit R&J STOP-RULE example ✅. Not driven in a browser by Neil yet.

## AQA GCSE English Language 8700 (spec 2026 sample papers; June 2024 mark schemes)

| paper | Q | type | assessment | planning | polishing | gold | reachable | notes |
|---|---|---|---|---|---|---|---|---|
| P1 | Q1 | retrieval | 🟢 (SKIP rule) | n/a | n/a | n/a | prod | |
| P1 | Q2 | language analysis, 2×TTECEA | 🟢 B 10/10 | 🟢 C 8/8 | 🟢 ENV v7.20.609 | knowledge-hub §2.A | prod | one staging chip turn measured (#485) |
| P1 | Q3 | structure analysis, 2×TTECEA | 🟢 | 🟢 | 🟢 | ❌ ¶2 is a placeholder (`knowledge-hub.md:47`) | prod | |
| P1 | Q4 | evaluation, intro+3+concl | 🟢 | 🟢 | 🟢 | knowledge-hub | prod | |
| P1 | Q5 | narrative, 7 scene elements | 🟢 | 🟢 | 🟢 | ❌ snippet + 376-word student model; floor is 650 | prod | |
| P2 | Q1 | true/false | 🟢 (SKIP) | n/a | n/a | n/a | prod diag | |
| P2 | Q2 | paired inference ×2 | 🟢 B 10/10 | 🟢 C 8/8 | 🟢 ENV v7.20.610 (journey ✅) | knowledge-mark-scheme §2A | staging | |
| P2 | Q3 | language, 3×TTECEA | 🟢 | 🟢 | 🟢 | §2A | staging | |
| P2 | Q4 | comparison, intro+3+concl | 🟢 | 🟢 | 🟢 | §2A (no intro gold; effects-count self-contradiction :204) | staging | |
| P2 | Q5 | transactional, IUMVCC | 🟢 | 🟢 | 🟢 | §2A speech | staging | form list drift (review/leaflet) — mark scheme is authority |

## AQA GCSE English Literature 8702

| paper | task | assessment | planning | polishing | gold | reachable |
|---|---|---|---|---|---|---|
| P1 §A Shakespeare | extract + whole play, 34 | 🟢 B 10/10 | 🟢 C 8/8 | 🟢 ENV v7.20.610 (gate green; R&J journeys ✅ staging) | knowledge-model-answer (Macbeth) + exemplars; R&J has no context-bank section | staging (R&J) |
| P1 §B 19th-c novel | 30, no AO4 | 🟢 /30 via the router override (v7.20.239; AQA-only v7.20.668) | 🟢 | 🟢 ENV v7.20.610 | same | prod: ACC planning + outlining only — NO 19th-c assessment lesson on prod, 0 essays ever marked (measured 2026-09-29) |
| P2 §A modern text | 34 | 🟢 | 🟢 | 🟢 ENV v7.20.610 | same | staging (inspector_calls outlining) |
| P2 §B anthology poetry | comparison 30 | 🟢 | 🟢 | 🟢 ENV v7.20.610 | model-answers-poetry | ⚠️ NOT reachable (audit 2026-10-05): only L&R 42623 has the WML assessment (41449); no course has WML planning/outlining/polishing/reassessment — LD splice pending (handoff wml-to-ld-AQA-POETRY-COURSES-…-2026-10-05) |
| P2 §C unseen 27.1 / 27.2 | 24 / 8 | 🟢 | 🟢 | 🟢 ENV v7.20.610 | knowledge-unseen | prod diag |

## Edexcel International GCSE English Language A (4EA1) — port RESUMED 2026-10-05 (WML 323 A → 324 A, FIXLIST #722 B2); state = prod v7.20.718 (assessment + planning); polishing ENV v7.20.719 on staging. Audit: P1 ASSESS 10/10 · PLAN 8/8 · POLISH ENV 6/6; P2 ASSESS 10/10 · PLAN 8/8 · POLISH ENV 6/6

Engine + gates first (v7.20.697–.702): IGCSE question specs now reach the page (#618), the page builder is what the render probe, key-match and fan-out harnesses check, and new gates hold the heals, goal options and recall rotation to it. Full log: FIXLIST #722 "STEP 1 ENGINE"; port plan: `~/.claude/handoffs/open/wml-IGCSE-LANG-P1-P2-PORT-STATE-2026-10-05.md`.

| paper | Q | type | assessment | planning | polishing | gold | reachable |
|---|---|---|---|---|---|---|---|
| P1 | Q1–Q3 | AO1 point-marked (2/4/5) — Q2/Q3 task read from the question | ✅ B 10/10 (v7.20.703, branch harvest + §5.2) | n/a | n/a | Q3: one optimal model | prod (old protocol until shipped) |
| P1 | Q4 | language+structure on TEXT TWO, 3×TTECEA ×4.0 | ✅ | ✅ `planning/protocol-b-planning.md` monolith (v7.20.710, ported from the AQA P2 monolith's Q3) + `planning/b-ladder.md`; 18 outline commits + 3 plan approvals, keymatch/fan-out/ladder-check (3f) green; de-stitched | 🟢 ENV v7.20.719 (rubric reconciled 6 Oct; journeys below) | hub §2.B internal gold (Q4 model) | prod |
| P1 | Q5 | comparison 22 — intro 2 + 3×6.0 (paired per text) + conclusion 2, one-text cap 8 | ✅ | ✅ monolith (from AQA P2 Q4): aspects → 3 comparative bodies → perspectives + thesis → restated thesis + writers' purposes (REQUIRED); no hook; Text One prediction revisited | 🟢 ENV v7.20.719 (rubric reconciled 6 Oct; journeys below) | hub §2.B internal gold (Q5 model) | prod |
| P1 | Q6/7 | transactional 45 (AO4 27 + AO5 18), IUMVCC, holistic | ✅ (one criteria set, box Q6) | ✅ monolith (from AQA P2 Q5): task choice → task analysis → six IUMVCC sections, form-aware, no word quota | 🟢 ENV v7.20.719 (rubric reconciled 6 Oct; journeys below) | ❌ hub has a speech SNIPPET only (#505) | prod |
| P2 | Q1 | anthology text essay 30 (AO1 12 + AO2 18, June 2024 split) | ✅ B 10/10 (section-a + section-b) | ✅ `steps/` files fed WHOLE (de-stitched v7.20.707) + `steps/b-ladder.md`; walked end to end on staging 59207 (v7.20.708) | 🟢 ENV v7.20.719 (rubric reconciled 6 Oct; journeys below) | knowledge-model-answer §2.B gold essay | prod diag |
| P2 | Q2–4 | imaginative writing 30 (box Q2) | ✅ | ✅ 7 scene rows `plan-scene-Q2-*` (keymatch-gated) | 🟢 ENV v7.20.719 (rubric reconciled 6 Oct; journeys below) | ❌ GOLD MISSING (#505) — §2.D style excerpts only | prod diag |

## Edexcel GCSE English Language (1EN0) — port STARTED 2026-09-13 by a Fable agent, STOPPED before any report; partial work in `wml-port-agents-inflight-2026-09-13.patch` (FIXLIST #492)

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

## Eduqas GCSE English Language (C700U10 / C700U20) — port STARTED 2026-09-13 by a Fable agent, STOPPED before any report; partial work in `wml-port-agents-inflight-2026-09-13.patch` (FIXLIST #492)

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
