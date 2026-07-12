# FQ-QUESTION-STANDARD.md — the contract for Foundational-Quiz question banks (prose/drama)

**Status:** contract (like `PROTOCOL-STANDARD.md`, `CN-STANDARD.md`). A bank that fails these checks does not ship.
**Governs:** `protocols/shared/foundational-quiz/banks/*.md` for **prose + drama** texts (novels, plays). Poetry banks keep their own per-poem structure — see **§ POETRY** at the foot of this file.
**Derived from:** `research/2026-07-11-concept-based-fq-question-design.md` (verified educational research).
**Reference implementation:** `macbeth.md` (the mold every other bank copies).

---

## THE PRINCIPLE (non-negotiable)
A foundational recognition round (MCQ / true-false / single-word fill) **tests the CENTRAL, enduring CONCEPT of each aspect** — not surface trivia. Research verdict (Agarwal 2019): concept-keyed retrieval transfers upward; fact-only retrieval does not. The round is the **low-stakes ENTRY** to the concept; production depth stays with MSQ / MSA / essay.

## THE FIVE ASPECTS + their central concept (prose/drama)
Each `@dim` maps to a Conceptual-Notes field via `concept_field_for_dim()`:

| `@dim` | Central concept the item MUST elicit | CN field |
|---|---|---|
| `protagonist` | **Evolution** — who they are → what they become, **and why** (their own choice / error, not chance) | `cn_section_1` |
| `plot` | **Causal arc** — one act causes the next by necessity (hamartia → turning point → catastrophe → restoration). NOT an event list. | `cn_section_3` |
| `themes` | The **controlling ideas** the text explores, and how each *works* through the text | `cn_section_5` |
| `effects` | The **genre-driven emotional response** in the reader/audience (see genre table). NOT technique-naming. | `cn_section_4` (Genre & Emotion) |
| `message` | The enduring **"so what"** — the worldview / authorial intention the whole text affirms | `cn_section_7` |

**20 questions per bank = 4 variations of each of the 5 aspects.** Picker serves ONE random per aspect (`fq_dim_stratified`) → a 5-question round; depth comes from mastery repetition drawing a fresh variation each round. **Every variation of an aspect must test that aspect's central concept** — no "endpoint only" or "name the technique" fillers.

## THE DISTRACTOR LAW (the single most important rule)
Each wrong option is a **plausible CONCEPTUAL MISREADING** a real student holds — never an arbitrary false fact. The student must *reason* "which reading is right," not recall a fact. Build items so a surface/"mimicry" answer **cannot pass** (threshold-concept warning). Canonical misreading families to draw distractors from:
- **No-change / fixed:** "he was always like this" (kills evolution).
- **No-agency / fate-puppet:** "the witches/fate forced him" (removes the *why*).
- **Mere succession:** "these events just happen in order" (kills causal necessity — Aristotle's *post hoc non ergo propter hoc*).
- **Wrong genre-emotion:** e.g. "we feel amused / triumphant" at a tragedy.
- **Technique-naming as effect:** "the effect is a soliloquy" (names a device instead of the feeling).
- **Innocent-victim / all-evil:** flattens the intermediate tragic figure.

Every distractor carries a `Why <letter>:` gloss naming the *misreading* (not just "wrong").

## GENRE → EFFECT-EMOTION (the `effects` aspect is genre-keyed)
The *principle* is universal (effects = the genre-driven emotion); the *emotion* is per-text. Author the effects items to the text's genre:
| Genre | Core emotional effect to test |
|---|---|
| Tragedy (Macbeth, R&J, Lear, Othello, JC, A View, DNA?) | **Pity & fear** → catharsis. Pity for undeserved/self-caused ruin; fear for "one like us". |
| Gothic (Jekyll & Hyde, Frankenstein, Sign of Four) | **Dread, horror, unease**; sublime terror; moral disturbance. |
| Dystopia (Never Let Me Go, Animal Farm) | **Fear as warning**; unease; disquiet at complicity. |
| Social realism / morality (Inspector Calls, OMAM, Blood Brothers) | **Moral discomfort**; collective guilt; injustice-anger; pathos. |
| Comedy (Much Ado, Twelfth Night, Merchant) | **Delight, relief, warmth**; the pleasure of disorder resolved. |
| Bildungsroman / coming-of-age (Jane Eyre, Great Expectations, Pigeon English) | **Empathy, hope, poignancy** at growth and cost. |
Author verifies the text's genre before writing its effects items; if unlisted, name the genre-emotion explicitly and cite the text.

## STEM TEMPLATES (per aspect — adapt, don't hard-copy)
- **Protagonist:** "Which best captures how [X] **changes** across the [play/novel] — and what drives it?" · "What makes [X] a **tragic** hero rather than simply a villain/victim?"
- **Plot:** "Why does [event A] **lead to** [event B]?" · "Which shows the **causal chain** of [X]'s fall — not just the order of events?"
- **Themes:** "[Quote] — what does this reveal about the [play/novel]'s view of [idea]?" · "Which idea does [X] most explore, and how does it *work*?"
- **Effects (genre-emotion):** "Why do we feel **[pity/dread/…]** for/at [X], despite …?" · "A [tragedy/gothic tale/…] is built to make us feel — above all — …?"
- **Message:** "What is the [play/novel]'s overall **message** about [idea]?" · "What enduring idea about [human experience] does the ending affirm?"

## EVIDENCE + PROVENANCE RULES (hard gates)
1. **Anchor quotes must be REAL and correctly attributed** — quote only from the actual text. NEVER invent a line. Reuse quotes already verified in the existing bank / concept-notes; if a new quote is needed, it must be a canonical line of that text. (CLAUDE.md 5c + `feedback_never_invent_mark_scheme_claims`.)
2. **Content DERIVES from what we teach** — align to the protocols + the text's `.concept-notes.md`; never author pedagogy from general knowledge.
   - **Unsure of a technique or a text's genre? Check the Table of Techniques (Notes plugin) — the canonical Sophicly reference — before writing.** Never guess a genre/technique label (see `reference_wml_techniques_md_central_reference`, `reference_table_of_techniques_generated_assets`). The genre drives the `effects` emotion, so getting it right is load-bearing.
3. **Each aspect's correct answer must be consistent with that aspect's concept-note** (the note is what autofills the CN doc on a correct answer).
4. **Fill format:** single-word / short-phrase fill ONLY for an unmissable iconic answer; never make the blank the concept itself.

## ACCEPTANCE CHECKS (grep-able; a bank failing any does not ship)
- [ ] Exactly 20 questions; each has `@dim:` ∈ {protagonist, plot, themes, effects, message}; **4 per dim**.
- [ ] `effects` items test a **feeling** (genre-emotion), NOT a technique name. (grep the 4 effects Qs — none should be "what is this device called".)
- [ ] `plot` items test **causation** ("why does … lead to", "causal chain"), not "who did what".
- [ ] `protagonist` items test **change + why**, not a single endpoint.
- [ ] Every distractor is a conceptual misreading with a `Why <letter>:` gloss.
- [ ] Every quote is real + attributable to the text.
- [ ] A `<text>.concept-notes.md` companion exists, its `effects` note is **genre-emotion** (not technique), and its header maps `effects → cn_section_4`.
- [ ] Parses under `SWML_Quiz_Bank::parse_file()` (section heading + numbered `**Type:**` items).

## COMPANION: concept-notes (`<text>.concept-notes.md`)
One note per aspect (the autofill payload). The **effects** note is the **genre-emotion** (pity/fear/…), NOT a technique list. Mapping header must read `Effects → cn_section_4`.

---

# § POETRY — the contract for poetry FQ banks
**Reference implementation:** `power_conflict_poetry.md` (the poetry mold every poetry bank copies).

**THE PRINCIPLE is identical** (concept over trivia; conceptual-misreading distractors; research-grounded).
Only the STRUCTURE differs — poetry is per-poem across an anthology, not per-text 5 aspects.

## STRUCTURE (preserved — do NOT relabel to the 5 prose aspects)
- **Per-poem, 3 questions each**, across **3 dimensions**: `[Tests Recognising the Poem]` · `[Tests Form & Features]` · `[Tests Meaning & Effects]`. (No `@dim:` — poetry keys on these three category labels, which the parser stratifies.)
- **Anthology banks** = 3 × N poems (e.g. 45 Q for a 15-poem anthology), staged by reading order with `@set:N` (5 poems per set); **single-poet / forms banks** use `@part:N`. **KEEP the existing `@set`/`@part` staging and poem membership exactly** — the reading-order gate must not change.
- Single-poet collections (SQA) + unseen banks: same 3 dimensions per poem, scaled to the bank's poems.

## THE THREE DIMENSIONS + their central concept
| Category label | Central concept the item MUST elicit |
|---|---|
| Recognising the Poem | Recognise the poem by its **controlling idea / argument** (its central concern), anchored by a signature image or line — NOT image-matching alone. |
| Form & Features | How the poem's **form / structure / method SHAPES meaning** (the *effect* of the form) — NOT naming the form. |
| Meaning & Effects | The poem's **controlling idea + the reader's feeling / response** it produces — NOT a plot-summary or technique label. |

## DISTRACTOR LAW (same as prose)
Each wrong option is a plausible **conceptual misreading**, with a `Why <letter>:` gloss.
- **Recognising:** distractors are OTHER poems in the same anthology **whose central argument differs** (so the student must reason from concept, not spot a stray image).
- **Form & Features:** distractors are **misreadings of the form's effect** ("it makes the poem song-like", "it shows the speaker's power") or a form belonging to a different poem in the set.
- **Meaning & Effects:** distractors are **wrong emotional / conceptual readings**, never arbitrary false facts.

## EVIDENCE RULES (same hard gates)
- **Real anchor quotes only**, correctly attributed to the poem. **Reuse the quotes already in the existing bank** (verified). Never invent a line; check the Table of Techniques "Genre & Mode" / form families if unsure of a form.
- **Effects/Meaning items test a FEELING or IDEA, never a technique name.**

## ACCEPTANCE CHECKS (poetry)
- [ ] Every poem in the bank has exactly 3 questions — one per category (Recognising / Form & Features / Meaning & Effects).
- [ ] `@set:N` / `@part:N` staging + poem membership unchanged from the prior bank.
- [ ] Recognising items key on the **controlling idea**, and their distractors are other anthology poems with a *different* argument.
- [ ] Form items test the form's **effect on meaning**, not the label.
- [ ] Meaning & Effects items test an idea/feeling, not a technique name; distractors are conceptual misreadings.
- [ ] Every quote real + correctly attributed to its poem.
- [ ] Parses under `SWML_Quiz_Bank::parse_file()`.

## POETRY CN AUTOFILL (note)
Poetry FQ→CN autofill uses the poetry `pf_*` / poem-field path (per `reference_wml_fq_cn_autofill_pf_path_poetry_only`), NOT `concept_field_for_dim`/`cn_section_*` — that lit mapping is prose/drama-only. Poetry banks do not author a `concept_field_for_dim` companion; leave the poetry autofill path untouched.

## ⭐ POEM-TEXT SOURCES — verify EVERY quote against these (NEVER re-search; do not guess)
The 2026-07-12 poetry fan-out FAILED the quote gate because agents had no poem text. **Poetry quotes
MUST be verified against the anthology source** (words are enough; stanza layout not needed for quotes).
Sources live under `sophicly-etchwp-package v2.6/`. Feed the matching source FILE to each rebuild agent
and require: every quote-marked phrase confirmed verbatim in the source, or de-quoted. Also see memory
`reference_poem_text_source_location_and_stanza_gold`.

**Bank → source (VERIFIABLE — re-run the rebuild WITH this file):**
| Bank | Source file (under `Model Answers/Model Answer Resources/` unless noted) |
|---|---|
| power_conflict_poetry | `Power and Conflict Anthology.md` |
| worlds_lives_poetry | `AQA Worlds and Live Anthology.md` |
| love_relationships_poetry | `The Art of Poetry – AQA Love & relationships_nodrm.md` (cleaner than the garbled `AQA love relationships poetry-copy2.md`) |
| edexcel_belonging_poetry | `Edexcel Belonging Anthology.md` |
| edexcel_conflict_poetry | `Edexcel Conflict Anthology.md` |
| edexcel_relationships_poetry | `Edexcel Relationships Anthology.md` |
| edexcel_time_place_poetry | `Edexcel Time and Place Anthology.md` |
| eduqas_poetry_anthology | `EDUQAS-2027-poetry-anthology-for-first-examination-in-2027-mlp-18pt.md` |
| conflict (OCR) | `OCR Poetry Anthologies_ Complete Poems and Study Guide Latest.md` |
| igcse_lit_poetry / igcse_lang_poetry | `iGCSE-Anthology-English-Language-A-and-English-Literature.md` (+ PDFs under `Sophicly Etch Mark Scheme Resources/Edexcel IGCSE Poetry Anthology/`) |

**GAP — no clean on-system poem text found (2026-07-12); DO NOT rebuild these until a source is located:**
`ccea_conflict`, `ccea_identity`, `ccea_relationships` (CCEA anthology) · `cambridge_songs_ourselves`
(CAIE Songs of Ourselves — only a WML template exists) · all `sqa_*` (dharker/duffy/higher_collection/
jamie/kay/lochhead/maccaig/morgan/n5_collection/paterson — Scottish set texts; no clean text on disk).
These stay on their current live banks until Neil provides the source, or a source is found under
`Sophicly Etch Mark Scheme Resources/` (SQA / CCEA / CAIE subfolders — PDFs may exist to Read).
