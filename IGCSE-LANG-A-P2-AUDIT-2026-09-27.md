# Edexcel IGCSE Spec A English Language Paper 2 (4EA1/02): course audit

**Date:** 2026-09-27 · **Scope:** LearnDash course **55070** "Edexcel IGCSE (Spec A) English Language Paper 2", end to end · **Mode:** READ-ONLY. Nothing was edited, deployed or written to any database. The only writes were read-only probe scripts and their JSON output, placed in the server's `/tmp`.

**Environments:** prod WML = **7.20.631** (measured from the plugin header). Repo HEAD = **7.20.641** (`4beef04b`). **Prod does not have the v7.20.636 `slug_family` / quiz-claim fix.** The first probe fatalled on `SWML_Quiz_Bank::slug_family()` being undefined on prod.

Legend: **[M]** = MEASURED (prod query, gate run, or the real file read) · **[I]** = INFERRED from code, not observed · **[?]** = could not confirm (where I looked is stated).

---

## 0. The real 4EA1/02 paper (the authority)

Source: `Sophicly Etch Mark Scheme Resources/EDEXCEL IGCSE English Language Component A/Edexcel IGCSE Spec A Language Paper 2/Edexcel IGCSE Spec A Lang P2 June 2024 MS.md` and `… June 2024 QP.pdf` (pdftotext). [M]

| Section | Q | Task | Marks | AOs / grids |
|---|---|---|---|---|
| A: Reading (45 min) | Q1 (compulsory) | "How does the writer present X in *<anthology text>*? In your answer, you should write about: • … • … • the use of language and structure. You should support your answer with close reference to the poem, including brief quotations." The **whole text is printed** ("Remind yourself of An Unknown Girl…"). Anthology Part 3 = poetry OR prose. | 30 | AO1 12 (L1 1–3 · L2 4–6 · L3 7–9 · L4 10–12, **4 levels**) + AO2 18 (L1 1–3 · L2 4–6 · L3 7–10 · L4 11–14 · L5 15–18) |
| B: Imaginative Writing (45 min) | Q2 **or** Q3 **or** Q4 | Q2 personal ("Write about a time when…"), Q3 titled story, Q4 story from a given opening, with an optional **image** prompt. "Your response will be marked for the accurate and appropriate use of vocabulary, spelling, punctuation and grammar." No word limit. | 30 | AO4 18 (1–3 · 4–7 · 8–11 · 12–15 · 16–18) + AO5 12 (1–2 · 3–4 · 5–7 · 8–10 · 11–12) |
| **Total** | | | **60** (1h30) | **No AO3 on Paper 2.** No comparison, no retrieval questions. |

`protocols/shared/language-paper-specs.json` → `edexcel-igcse.language_p2` and `protocols/_marks/edexcel-igcse__language_p2.json` **match this** [M]. So do `protocols/edexcel-igcse/language2/modules/knowledge-mark-scheme.md` and `BOARD_FORMAT_DEFAULTS` at `frontend/wml-assessment.js:53162` [M].

---

## 1. How a lesson in course 55070 resolves at runtime

Chain [M, code + prod data]: `render_embedded_wml()` (`sophicly-writing-mastery-lab.php:829`) → `resolve_current_course_id()` (:1532; request param → LD `sfwd-courses` query var → URL → reverse lookup → LD primary) → `get_embed_course_context()` (:1607, delegates to `Sophicly_LearnDash_Bridge::get_course_context`) **overrides the shortcode's board, text and subject** → board `_`→`-` → subject `language` → `text_to_template_slug()` → bridge option `sophicly_ld_bridge_55070` (task/step/topic) → `derive_wml_task_from_topic()` fallback.

Measured on prod for 55070:
- Course meta: `_sophicly_course_text_slug = edexcel_igcse_lang_a_paper_2`, `_sophicly_course_board = edexcel_igcse`, `_sophicly_course_category = language`, `_sophicly_access_tier = free`.
- Resolved: **board `edexcel-igcse`, text `edexcel_igcse_lang_a_paper_2`, subject `language_p2`** (via `text_to_template_slug` → `language-p2`). **So the baked `board="aqa" text="aqa_lang_paper_1"` shortcodes ARE overridden to IGCSE P2.** A student who reaches a lesson through the course URL gets IGCSE P2 protocols, not AQA P1. The owner's suspicion is half right: the **WML lessons are rerouted correctly**, but the **non-WML lessons are genuine AQA P1 content** (§3, D1).
- Router: `resolve_protocol_group('edexcel-igcse','language_p2')` → `language2` → `protocols/edexcel-igcse/language2/manifest.json` (planning / assessment / polishing; every module path exists [M, script]). `resolve_mark_scheme_family` → `language2` [M prod].
- `$SLUG_ALIASES`: **no entry containing "igcse"** [M prod: `slug_aliases()` filtered = `[]`].
- LD shared steps = **yes** [M]. The WML lessons are shared across up to 55 courses, and their LD **primary** course is Macbeth (41370) or AQA P1 (42205) [M]. The correct resolution therefore depends on the nested `/courses/<slug>/…` URL (see D13).
- Enrolment: 21 `course_55070_access_from` rows, 21 with `sophicly_role=student` (includes uid 1). Only **uid 1279** (a real student) and uid 1 hold IGCSE P2 WML data [M]. **No IGCSE P2 assessment chat exists for anyone** [M]. The assessment path has never run on prod, so its filing behaviour is unmeasured.

---

## 2. Per-lesson table (WML lessons + P2-specific lessons)

| Lesson (id) | Shortcode says | Resolves to [M] | Protocol / bank | Code-scored? | Files into doc? | Matches 4EA1/02? |
|---|---|---|---|---|---|---|
| Poetry 1–5 (58596–58600) | `sophicly_media` bento only | n/a (video) | none | n/a | no | ✅ the 5 anthology poems (the prod option lists the same 5) |
| **6. Poetry Anthology Quiz** (58601) | `foundational_quiz fq_bank=igcse_lang_poetry subject=poetry board=edexcel-igcse` | FQ, bank `igcse_lang_poetry` | `foundational-quiz/banks/igcse_lang_poetry.md`, **15 Qs** [M prod] | ✅ **code** (`wml_quiz_bank_1__swml_fq_…` exists) [M] | Quiz score only. **No concept notes:** the bank has no `@form`/`@dim` tokens and no `.concept-notes.md` sidecar [M]. | ✅ content is about the 5 poems |
| Survey (48771) | `sophicly_rating` | n/a | n/a | n/a | n/a | ❌ title says "Language **Paper 1** Mark Scheme" (shared by 7 courses) |
| MS video 55166, read MS 55170 | bento | n/a | n/a | n/a | n/a | ✅ P2-specific bentos |
| **4. Mark Scheme Quiz** (53059) | `mark_scheme_unit step=1 board=aqa text=aqa_lang_paper_1` | MSQ; bridge `wml_step=1`; text `edexcel_igcse_lang_a_paper_2`, subject `language_p2` | Generic `mark-scheme-quiz/language2.md` → `resolve_board('edexcel-igcse')` → section **"Edexcel IGCSE English Language Spec A Paper 1"** (22 Qs) [M prod] | ✅ code (controller ran for 1279; "Quiz Result" card is in the doc) [M] | ✅ Quiz Result card | ❌❌ **Serves PAPER 1 content.** 1279 was served "A student analysing non-fiction… statistics about refugee numbers" and "Spec A's 22-mark comparison question" [M] (D2) |
| **5. Spot the Difference = Forging Your Weapon** (53036) | `mark_scheme_unit step=2` | FYW; bridge `wml_step=2` | `shared/forging-your-weapon/language2.md` (AI) | ❌ AI-narrated (no controller exists for FYW) [M code] | ❌ no markers; the "Notes: Forging Your Weapon" box is manual | ❌ non-fiction opinion-column extract; asks which board (D7) |
| **6. Mark Scheme Final Assessment** (53048) and **Mark Scheme Assessment 2** (42392) | `mark_scheme` | MSA; text `edexcel_igcse_lang_a_paper_2` | **No bank resolves:** `parse_sections_msa` → `[]` on prod [M]. Repo HEAD would also miss it (no alias; the regex misses `lang_a_paper`). | ❌ prod .631: controller inactive → AI narrates, no grade [I from the CLAUDE.md §5 history + measured no-bank; 1279's `_ms` chat stopped at the greeting (1 msg) [M]]. Repo .641: honest "can't load", still no quiz [I]. | ❌ | ❌ even if routed, bank SECTION D is wrong (D3) |
| Why Authors Write (42237) | bento | n/a | n/a | n/a | n/a | generic, OK |
| Grade 9 Language Paper Structure (56938) | `sophicly_exercise exc_ttecea_macbeth_captain` | n/a | components exercise | [?] | [?] | ❌ a Macbeth TTECEA exercise, not the P2 structure |
| **3. Write Your Diagnostic** (41502) | `diagnostic topic=1 aqa/aqa_lang_paper_1` | diagnostic, IGCSE P2, topic 1 | template `shared/templates/topics/edexcel-igcse-language-p2.md` Topic 1 (Story of an Hour + Q1 30 + Q2 30) | n/a (writing) | ✅ doc shape correct: SOURCE A · SECTION A Q1 (Plan Intro/BP1–3/Conclusion) · Q1 Response · SECTION B Q2 (Plan: Scene Structure) · Q2 Response · Feedback Q1/Q2 · Results [M, 1279's `_t1` doc] | ⚠️ tariffs right; wording not in the paper's format (D12) |
| **4. Get Your Assessment** (41449) and **Reassessment** (54953) | `assessment` / `redraft_assessment` | assessment manifest (redraft_assessment → assessment) | `assessment-section-a.md` + `assessment-section-b.md` + knowledge modules | ❌ AI marks and sums | ⚠️ **No `@FB_BEGIN`, no `[ASSESSMENT_COMPLETE]`** [M grep]. Relies on the fallback detector [I]. Tells the student to paste feedback into "Introduction Feedback" / "Conclusion Feedback" workbook sections that do not exist [M]. | ❌ band errors + paste-wall + a "no extract" error (D4, D5) |
| Discuss w/ tutor (42390, 42455) | `feedback_discussion` | IGCSE P2 | tutor flow | n/a | n/a | n/a |
| **Plan Your Redraft** (56050) | `planning redraft topic=1` | planning manifest, 8 steps | `language2/steps/*` | AI Socratic (judgement, correct) | ✅ Q1: 25 `@FIELD_COMMIT` + 5 `@FIELD_SET`, fan-out verified by `plan-fanout-harness` [M run]. ❌ **Section B (step 8, `b2-creative.md`) files nothing** [M]. | ⚠️ Q1 shape OK (Intro + 3 TTECEA + Conclusion); `b-setup.md:74` paste-wall + "no extract" error |
| **Outline Your Response** (56054) | `outlining` | the manifest has **no `outlining` key** (no manifest on any board has one) | [I] router logs "Manifest missing task 'outlining'" → no protocol | [?] | [?] outline rows are fed by planning | [?] systemic; not verified live |
| **Polish Your Writing** (41523) | `polishing` | no `essay_polishing_env` row for this text (`class-protocol-router.php:1975`) → legacy manifest `polishing-section-a/b.md` | legacy | AI | ❌ | ⚠️ `polishing-section-a.md:9,11` asks for title/author/extract/question bundle + whole-essay paste |
| Conceptual Notes (Topic 2) | **no lesson in the course** [M] | n/a | template has Topic 2 CN | n/a | n/a | ❌ missing (D6) |
| Prose anthology reading | **no lessons** [M]; prod option `swml_poems_edexcel-igcse_igcse_lang_prose` holds 5 prose texts; FQ bank `igcse_lang_prose` = **0 Qs** [M] | n/a | n/a | n/a | n/a | ❌ half the P2 anthology is untaught (D6) |

## 3. Non-WML lessons that are AQA Lang P1 content (units 43018, 49008, 49022, 49530) [M]

All are shared with course 42205 (AQA GCSE Lang P1). **None carry a `writing_mastery_lab` shortcode**, so the course-context override never touches them: the student sees the AQA material exactly as authored.

| Unit | Lessons | What the student gets |
|---|---|---|
| 43018 "Generating Story Ideas + **Practice Paper 1**" | 43020–43038 CW story steps 1–4 (`mwai_chatbot`); 43040 "Practice Paper 1"; **43043/43708/43714/43045/43048 "Practice Paper 1 Assessment: AQA LANG P1: Q1…Q5"** (`mwai_chatbot id="AQA Lang P1, Q1 Assessment"` etc.); 43054–43206 "Practice Paper 1 Redraft: AQA Q1–Q5" (AQA P1 answer-plan chatbots); 43050/43052/43208/43210 discuss/submit | AI marking of AQA P1 Q1–Q5 inside an IGCSE P2 course. The CW steps are relevant to Section B but run as legacy `mwai` chatbots that tell the student to "copy and paste into your workbook" and file nothing in WML. |
| 49008 "Recapping the Mark Scheme" | 49097 "Recap the Mark Scheme: **AQA Language Paper 1**" (download = AQA-87001-MS-JUN23); 49011 "Mark Scheme Quiz: **AQA Language Paper 1**" (`mwai_chatbot "AQA Lang P1 Mark Scheme Quiz"`, AI-scored); 49015 "COMMENT: The AQA Language Paper 1 Mark Scheme…" | The wrong board's mark scheme, and the wrong paper's. An AI-scored quiz. |
| 49022 "Grade 9 Story Draft 1 + Practice Paper 2" | 49027–49037 CW steps 5–9 (`mwai` chatbots) | Section B-relevant craft, but legacy and unfiled |
| 49530 "Exam Strategy, Timing and Walkthrough" | 49532 "**Lang P1** Exam Strategy" (bento "AQA Language Paper 1 Exam Walkthrough"); 49763 "Random TTECEA Paragraph Test" (`mwai`) | AQA P1 exam walkthrough |

---

## 4. DEFECT LIST (sorted by student impact)

**D1. Most of the course is AQA Lang P1 content, not IGCSE P2.** [M] · Lane: **ld-customization**
Evidence: §3. Units 43018, 49008, 49530 (plus survey 48771's title and exercise 56938 = Macbeth TTECEA) teach, quiz and AI-mark AQA P1 Q1–Q5 inside course 55070. The students get the wrong exam's questions, mark scheme and walkthrough. Fix: detach these units from 55070 and replace them with IGCSE P2 units: Practice Papers on anthology texts (the template already holds Topics 3–11), an IGCSE P2 mark-scheme recap, and a P2 exam walkthrough. Keep the CW story steps only if they are re-pointed to WML `cw_step` lessons.

**D2. The Mark Scheme Quiz (53059) is code-scored but serves Paper 1 questions.** [M] · Lane: **content lane** (bank) + **WML** (resolver)
Evidence: prod `questions_for('language_p2','edexcel-igcse')` → 22 Qs from the section "Edexcel IGCSE English Language Spec A **Paper 1**". Student 1279's served round: "A student analysing non-fiction… statistics about refugee numbers", "Spec A's 22-mark comparison question". Cause: `protocols/shared/mark-scheme-quiz/language2.md:1516` is the only IGCSE quiz section and it is titled and written as Paper 1 (Q5 AO3 22, Q4 AO2 12). `resolve_board()` (`includes/class-quiz-bank.php:355`) takes the first label containing "edexcel igcse". The overview at `language2.md:470–490` is also wrong ("Questions 1-3 comprehension", "literary non-fiction", "Question 4 (20 marks)", an AO3 section). Fix: author `### Quiz: Edexcel IGCSE English Language Spec A Paper 2` (Q1 30 = AO1 12 [4 levels] + AO2 18 [5 levels]; Section B AO4 18 + AO5 12; poem/prose examples) plus its answer key, and move the Paper 1 quiz to `language1.md`. Optionally add a text-first bank `mark-scheme-quiz/edexcel_igcse_lang_a_paper_2.md`.

**D3. The Mark Scheme Final Assessment (53048) and Mark Scheme Assessment 2 (42392) have no code-scored bank.** [M] · Lane: **WML** (routing) + **content lane** (bank)
Evidence: prod `parse_sections_msa('edexcel_igcse_lang_a_paper_2')` = `[]`. The regex at `includes/class-quiz-bank.php:586` `/(?:lang|language)_?paper[_-]?([12])/` does not match `lang_a_paper_2`, `$subject_map` has no key for it, and there is no alias. On prod (7.20.631, before .636) the student's turns go to the AI, which narrates an unscored quiz. On repo HEAD, the student gets "can't load". The bank it *should* reach is also wrong: `protocols/shared/mark-scheme-assessment/banks/language2.md:555` SECTION D says P2 reads "literary non-fiction" with "Q4 (AO2, 20)" and "Q5 (AO3 comparison, 20)". Fix: (a) `class-quiz-bank.php:586` → `/(?:lang|language)(?:_[ab])?_?paper[_-]?([12])/i`, or route MSA through `resolve_mark_scheme_family()`; (b) rewrite SECTION D against the June 2024 MS (Q1 AO1/AO2 poem/prose; Section B AO4/AO5 imaginative). Ship (a) and (b) together, or (a) will serve the wrong content. Also ship v7.20.636+ to prod.

**D4. The assessment protocol (41449 diagnostic assessment, 54953 reassessment) makes the student paste what the system already holds, states a false fact, and files by instruction rather than by marker.** [M files; filing behaviour I] · Lane: **WML**
Evidence: `modules/assessment-section-a.md:25` asks for title and author; `:31–32` says **"there is no extract; the students can write about any part of the text"**, but the real paper prints the whole text; `:32` asks for the essay question; `:36` asks for the essay type; `:78/85/89` asks the student to "paste your essay plan"; `assessment-section-b.md:7,11` asks for the question number and "paste the full question". Both files contain **0 `@FB_BEGIN` and 0 `[ASSESSMENT_COMPLETE]`**. `assessment-section-a.md:220,471` tells the student to copy feedback into "Introduction/Conclusion Feedback" sections, and those do not exist in the doc (the doc has "Feedback: Q1/Q2"). `bin/feedback-filing-gate.js:60` only scans `protocol-a-assessment*.md`, so **this protocol is invisible to the gate**: it is neither checked nor listed as known debt. Fix: port to the AQA P1 anchor (`protocols/aqa/language1/modules/protocol-a-assessment.md`), with `@FB_BEGIN{"q":"Q1",…}` cards per section, a Q2 holistic card and the `[ASSESSMENT_COMPLETE]` code word. Read the question and text from the doc. Widen the gate's glob to `assessment-section-*.md`. ⚠️ Once v7.20.634 ships with the MC gate on `enforce`, the `assessment` family depends on that code word [I].

**D5. Level bands and totals contradict the mark scheme in 4 places.** [M] · Lane: **WML** (protocol content)
- `assessment-section-a.md:489`: AO2 levels "17-18 / 13-16 / 9-12 / 5-8 / 1-4". The MS says **15-18 / 11-14 / 7-10 / 4-6 / 1-3**.
- `assessment-section-b.md:118`: AO4 levels "16-18 / 13-15 / 10-12 / 7-9 / 4-6 / 1-3" (six bands, two "Level 1"). The MS says **16-18 / 12-15 / 8-11 / 4-7 / 1-3**.
- `assessment-section-b.md:120`: AO5 levels "11-12 / 9-10 / 7-8 / 5-6 / 3-4 / 1-2". The MS says **11-12 / 8-10 / 5-7 / 3-4 / 1-2**.
- `modules/workflow-entry.md:160` says Q1 "Maximum marks: 15 (AO1=7, AO2=8)", and `:180` says "Section A Q1: 0-15". The real maximum is **30 (AO1 12 + AO2 18)**. The sanity check can therefore "correct" a valid 20/30 down.
Fix: copy the bands from `modules/knowledge-mark-scheme.md:7–147`, which is correct, and set Q1 to 30.

**D6. The prose half of the anthology and Conceptual Notes are missing from the course.** [M] · Lane: **ld-customization** (lessons) + **content lane** (prose FQ bank)
Evidence: the only P2 unit is poetry (58595). The prod option `swml_poems_edexcel-igcse_igcse_lang_prose` holds 5 prose texts (Story of an Hour, The Necklace, Significant Cigarettes, Whistle and I'll Come to You, Night). The FQ bank `igcse_lang_prose` has 0 questions. There is no Topic 2 CN lesson (CLAUDE.md: IGCSE Lang Topic 2 = CN; the template has one). The diagnostic (Topic 1) is a **prose** text the student has never been taught. Only Topic 1 exists in the course. Fix: add a "Reading the Prose Anthology" unit (5 lessons + FQ), author `foundational-quiz/banks/igcse_lang_prose.md`, and add a CN lesson and Practice Paper topics.

**D7. Forging Your Weapon (53036) is the non-fiction module and asks for the board.** [M] · Lane: **WML** (protocol) — also a candidate for being served by code
Evidence: `protocols/shared/forging-your-weapon/language2.md:3` "Non-Fiction Analysis"; `:60` extract "The Case Against Fast Fashion"; `:30–38` "tell me which Exam Board…" (the system knows the board); `:123` "Edexcel IGCSE (4EA1/4EB1 — Paper 2 Q2/Q3)… non-fiction argument" (wrong for 4EA1/02). It is AI-narrated with no filing markers. Fix: an IGCSE P2 variant on an anthology poem or prose extract (Q1 AO1/AO2 descriptors), with the board derived from the session. Per CLAUDE.md §4, the A/B "which is the weapon" judgement is deterministic and could be served by code.

**D8. Section B planning files nothing, and the planning setup is a paste-wall.** [M] · Lane: **WML**
Evidence: `steps/b2-creative.md` has 0 filing markers, so the doc's "Plan: Scene Structure" box never fills. `b2-creative.md:7` has the student type "2, 3, or 4" when chips should be offered. `steps/b-setup.md:74` repeats the "no extract… please provide the essay question" error. Fix: add `@FIELD_SET` for the scene-structure box (six-beat spine), serve the question choice as chips, and resolve the question and text from the doc.

**D9. Polishing (41523) is legacy and asks for pastes.** [M] · Lane: **WML** (the parked board-port patch)
Evidence: `essay_polishing_env()` (`includes/class-protocol-router.php:1975`) has rows only for AQA. `modules/polishing-section-a.md:9` asks for "title, author, extract details, and the exam question" and `:11` asks the student to "paste your complete essay". Fix: add an `edexcel_igcse_lang_a_paper_2` row once the parked port lands (PROTOCOL-COVERAGE-MATRIX §4EA1).

**D10. The IGCSE "lang poetry" mark-scheme banks describe a paper that does not exist.** [M] · Lane: **content lane**
Evidence: `mark-scheme-quiz/igcse_lang_poetry.md:12,30,45,67` and `mark-scheme-assessment/banks/igcse_lang_poetry.md:12,69,96,130–148` teach "Questions 1-3 retrieval", "the single-text 20-mark analysis" and "the 20-mark AO3 comparison" on anthology poems. On 4EA1/02 the poetry question is Q1, 30 marks, AO1 12 + AO2 18, with no AO3. These banks are not reached from 55070 today (text-slug mismatch), but any lesson with `text=igcse_lang_poetry` gets them. Fix: rewrite them against the June 2024 P2 MS, or retire them.

**D11. The board default max for IGCSE Language is 80.** [M] · Lane: **WML** (engine)
Evidence: `frontend/wml-assessment.js:53096` `'edexcel-igcse': { … language2: 80, language_p2: 80, language1: 80 … }` contradicts `BOARD_FORMAT_DEFAULTS` at `:53159–53162` (P1 90, P2 60), the spec JSON and the MS. Fix: set language1/p1 to 90 and language2/p2 to 60.

**D12. The topic template does not use the real paper's format.** [M] · Lane: **content lane**
Evidence: `protocols/shared/templates/topics/edexcel-igcse-language-p2.md:73–107` (and every topic after it). Q1 is worded "Explore how… You should consider: language / structure and form / how the extract engages the reader" (AQA-style). The real question is "How does the writer present… In your answer, you should write about: • … • … • the use of language and structure… brief quotations". Section B is a single "Q2" with Options A/B/C, "Write between 250-350 words" (not in the paper) and no image option. The real paper has Q2/Q3/Q4 with EITHER/OR, and Q4 is image-supported. The SPaG line is also missing. Fix: rewrite the question blocks to the paper's format. The doc builder already handles a Section B choice.

**D13. Shared-step fallback can serve Macbeth or AQA P1.** [I] · Lane: **ld-customization / WML**
Evidence [M]: shared_steps = yes; 41502/41449/42390/41523/42455/42392 are shared by 26–55 courses with LD primary course **41370 Macbeth**, and 53059/53036/53048 have primary **43628 Edexcel GCSE Lang P1**. `resolve_current_course_id()` falls to `learndash_get_course_id()` (primary) when the URL has no `/courses/<slug>/` segment and no `course_id` param. Not observed live. Fix: pass `course_id` in every WML deep link and AJAX call, or clone the IGCSE P2 lessons out of the shared pool.

**D14. The Outlining lesson has no protocol on any board.** [I, systemic] · Lane: **WML**
Evidence: no `protocols/*/*/manifest.json` has an `outlining` key [M script]. The router returns null with "Manifest missing task 'outlining'" (`class-protocol-router.php:2660`) [I]. I did not check whether outlining is chat-less by design. Fix: confirm the intended behaviour, and add the manifest key or document it as chat-less.

**D15. Prod is 10 versions behind the repo.** [M] · Lane: **WML** (engine deploy)
Prod runs 7.20.631, so the .636 quiz-bank family and "claim unrecorded controller quiz" safety net is absent. That is why D3 is AI narration on prod rather than "can't load".

**D16 (minor). The FQ files no concept notes.** [M] · Lane: **content lane**
`igcse_lang_poetry.md` carries no `@form`/`@dim` tokens and has no sidecar, so a correct answer autofills nothing into the organiser. The same is true of every poem FQ bank (0 poetry sidecars on disk), so this may be by design [?].

**D17 (minor, docs).** `PROTOCOL-COVERAGE-MATRIX.md:46–47` says P2 has "no planning dir". Planning steps with 25 markers have existed since 2026-08-16. · Lane: **WML**.

---

## 5. What I could not confirm, and where I looked

- **Real assessment filing for IGCSE P2:** no student has run a P2 assessment on prod. There is no `swml_chat_*edexcel_igcse_lang_a_paper_2_t1*` for anyone [M]. Whether `_detectFeedbackCard` files "Total Mark for Introduction … out of 3" into "Feedback: Q1" is inferred, not observed. It needs one staging run.
- **Outline row render for the IGCSE P2 redraft doc:** `planning-keymatch-harness` flags the "render case still owed". `plan-fanout-harness` passes on its 25 ids [M]. No prod redraft doc exists.
- **Contents of the components exercise `exc_ttecea_macbeth_captain` (56938):** the name says Macbeth; the content was not read.
- **What the MSA fallback shows on prod .631:** inferred from the CLAUDE.md §5 history (FIXLIST #592) and from 1279's `_ms` chat stopping at the greeting (1 message). The chat text was not read.
- **The mwai chatbot internals** (units 43018/49008/49022/49530): identified by chatbot id and title only.

## 6. Probe artefacts
Local: `/private/tmp/claude-501/igcse_p2_audit.{php,json}`, `igcse_p2_audit2.{php,json}`, `igcse_p2_audit3.php`/`a3.json`, `igcse_p2_audit4.php`/`a4.json`, `qp_p2_jun24.txt`. Server `/tmp/igcse_p2_audit*.{php,json}` (read-only probes, safe to delete).
