# Cambridge IGCSE 0500/0990 — METHOD DOCS (reference, NOT manifest-loaded)

Copied into the repo 2026-08-24 on Neil's instruction. Two shipped assessment modules
(`language1/modules/assessment-q3.md`, `language2/modules/assessment-section-a.md`) cite
`TOGA-one-technique-for-every-form.md` by name; before this it lived only in a Drive folder
beside the plugin, so nobody reading the module could open what it named (root CLAUDE.md §17b).

⛔ **NOT in either manifest, and must stay that way unless deliberately added.** The manifest
loads WHOLE `.md` files into the LLM context (`load_modular_protocol`) — 2,505 lines here would
blow the token budget, and any teaching text that is also code-served must live in a non-loaded
sidecar (WML CLAUDE.md §5, the retained-source law). These are **source material for authoring**
a planning protocol and for humans reading the assessment modules, not runtime context.

| file | what it is |
|---|---|
| `TOGA-one-technique-for-every-form.md` | The writing-in-role engine both papers mark against. Take · Own · Grow · Aim (P1 Q3) / Take · Own · **Weigh** · Aim (P2 Section A). Cited by both assessment modules. |
| `FORM-MASTERY-paper1-Q3-six-forms-with-models.md` | All six P1 Q3 forms (report · journal · interview · letter · speech · article) with a full model answer each, all from ONE shared text so the form differences are visible. |
| `FORM-MASTERY-paper2-sectionA-three-forms-with-models.md` | Letter · speech · article, a full model each, from one shared text pair. |
| `WORKED-EXAMPLES-every-move.md` | 3–5 worked examples for every named move in both papers. |
| `CAMBRIDGE-TRAPS-what-loses-marks.md` | Every documented way marks are lost, in Cambridge's own words. |
| `WRITERS-CRAFT-cambridge-paper1-reading.md` | The complete Paper 1 method, verbatim level tables. |
| `WRITERS-CRAFT-cambridge-paper2-writing.md` | The complete Paper 2 method — Directed Writing + Composition. |
| `EXAMINER-STUDY-what-separates-the-top-answers.md` | All 16 examiner reports, gate-verified quotations, per question-part. |

**Origin (still holds the PDF mirrors, practice packs, compendia and build scripts):**
`Etch for Sophicly Walkthrough by Claude/Cambridge IGCSE English 0500-0990/`
⭐ Edit at the origin and re-copy, or edit here and copy back — do not let the two drift.

**These are the source for the Cambridge planning protocol** (not yet built — Cambridge is the
only board with no `planning/` directory). Anchor for its shape:
`protocols/aqa/language2/planning/protocol-b-planning.md`; recipe: `PLANNING-LADDER-PORT-RECIPE.md`.
