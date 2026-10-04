# Quiz audit — can a student pass without knowing the text? (4 October 2026)

**Asked by Neil, 4 Oct 2026**, after watching a student (Maysa Adham, Edexcel IGCSE Spec A English Language,
"6. Poetry Anthology Quiz") on production. FIXLIST #714–#719. Companion files: the research
(`research/QUIZ-DESIGN-RESEARCH-2026-10-04.md`, #716) and two measured traces in the handoff queue
(`~/.claude/handoffs/open/wml-IGCSE-P2-ANTHOLOGY-QUIZ-DOC-TRACE-2026-10-04.md`,
`…-AUDIT-2026-10-04.md`).

## 1. The answer in plain words

Yes, mostly. In almost every graded quiz on the platform the right answer is the longest option, and
True/False questions are nearly always "True". A student who notices that can score well without reading
the text. A shuffle of the letters hides WHERE the answer is; it cannot hide that the answer is the long,
detailed one. This is true of every quiz bank we have, not just the IGCSE poetry quiz.

## 2. What was measured, and how

`bin/quiz-cue-gate.php` (new) reads every bank through **the real parser** (`SWML_Quiz_Bank::parse_file`
— exactly what students are served) and checks each question for answer cues.

| Quiz | Banks | Multiple-choice items | Right answer is the longest option | True/False keyed "True" |
|---|---|---|---|---|
| Foundational Quiz (FQ) | 66 | 1,289 | **83%** (31 banks at 100%) | **280 of 286** |
| Mark Scheme Quiz (MSQ) | 50 | 868 | **74%** | **222 of 266** |
| Mark Scheme Assessment (MSA) | 39 | 2,164 | **90%** | none |
| **All** | **155** | **4,321** | **85%** | **502 of 552** |

Chance would be 25% (four options). **All 155 banks fail the gate.** Reproduce: `php bin/quiz-cue-gate.php`;
one bank item by item: `php bin/quiz-cue-gate.php --bank=igcse_lang_poetry.md`.

## 3. The IGCSE poetry quiz Neil was watching (lesson 58601, course 55070)

- **Cues.** "Pick the longest option; on the select-all pick the options that quote the poem; answer True"
  scores **12/15 (80%, Grade 7) with no knowledge** — exactly the student's first round. On the eight
  form/meaning questions the right answer is the longest every time (3.6× the wrong ones on average) and is
  the only quoted option in six. Two "which poem is this?" questions quote the poem's own title in the
  question. The keys themselves are all correct and every quotation is real.
- **No rotation.** The bank holds 15 questions and a round serves 15, so every round is the same questions;
  only their order and the option letters change. The review shows every right answer and the next round
  starts at once, so round 2 tests memory of round 1's answers (she went 12 → 14 → 15/15 "Mastery" in one
  sitting). The text "here's a fresh set of 15" was untrue for this bank.
- **Multi-select works.** A tap selects, a second tap deselects; nothing submits until Submit. She picked
  several options in rounds 2 and 3; 58 of 65 select-all answers across production are multi-letter.
- **Wrong document.** The lesson builds the single-novel notes document (Protagonist, Plot Structure…)
  because Edexcel IGCSE Language Paper 2 (five poems + five prose texts) was never mapped to an anthology
  (`wml-core.js`: "deliberately unmapped until the Phase 2 wiring…"). Two such documents exist, both empty.
- **Ruling conflict (Neil's call).** His 11 Jul ruling: this paper's quiz is the poetry FORMS quiz (as AQA),
  with no per-poem quiz. The live lesson serves the 15-question per-poem quiz.

## 4. Defects found and fixed (staging, v7.20.686 batch)

| Defect (measured) | Fix |
|---|---|
| Enter with nothing selected "clicked" the hidden Submit: the answer buttons vanished and nothing was sent — the student was left with no way to answer (same for a half-done ranking, which sent a partial order) | Both canvas Enter handlers only press a **visible** Submit |
| Prompts and the review showed literal backticks ("e.g. \`B\`", "Your answer: \`C\`") — the chat renderer has no code style | Bold instead; checked through the real `formatAI` |
| A typed "A C", "A and C", "AC", or "C\`" (a mark copied from the prompt) went to Sophia as a question: an API call, and the answer was not recorded | One normaliser turns every everyday shape into "A, C" before scoring; ordinary questions still go to Sophia |
| "Here's a fresh set of 15" when the bank repeats the same 15 | "Your next round is ready: 15 questions…" |
| A doc-identity lookup recursed ~2,900 calls deep on the IGCSE quizzes until an error was swallowed (28.8 ms per call) | Re-entrancy guard; identical results on all four doc types tested, 0.01 ms per call |

## 5. Not yet fixed — needs the research and Neil's decisions

1. **Rewrite the options** so the right answer is not the longest or the only quoted one, and half the
   True/False statements are false — under the gate, bank by bank. `bin/quiz-cue-gate.enforced.txt` is a
   ratchet: a bank listed there can never regain a cue.
2. **Rotation**: the engine already serves one random question per aspect (`@dim`) — the literature banks
   use it; the poetry banks have no variants to rotate. Needs variants per poem × aspect.
3. **The IGCSE Language Paper 2 document**: one poems + prose document, built through one resolver
   (client and server), plus a sweep gate so no anthology quiz can fall back to the novel template again.
