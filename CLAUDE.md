# CLAUDE.md — Writing Mastery Lab (WML)

**Belongs here:** WML-only patterns — protocol router, dual chat pipeline, assessment architecture, plan extraction, terminology.
**Does NOT belong here:** universal Sophicly rules. Those live at `../../../CLAUDE.md`.
**See also:** `PRODUCT.md` (this dir) for users + voice. `../../../sophicly-plugins/BRAND.md` for design.

**Plugin slug:** `sophicly-writing-mastery-lab`
**Current version:** 7.19.102
**Purpose:** AI-powered GCSE/IGCSE English tutoring interface — essay writing, assessment, planning, polishing.
**AI Provider:** Claude Sonnet 4.6 via MeowApps AI Engine (with GPT-5 fallback).

---

## WML CRITICAL ADDITIONS — read before any edit

(Universal critical rules in `../../../CLAUDE.md`. WML adds:)

1. **Protocol markdown files are content, not code.** Edit them for pedagogy, not for bug fixes.
2. **Never modify shared modules** (`protocols/shared/`) without understanding ALL exam boards use them.
3. **⭐ NEVER ASK THE STUDENT FOR WHAT THE SYSTEM ALREADY HOLDS (Neil, 2026-07-21 — the paste-wall law).**
   A protocol step that asks the student to type, paste, or identify any context the session already
   binds — text/poem title, author, poem or extract TEXT, the question, board, paper, topic, phase —
   is a DEFECT, not a design choice. Resolve it from the shortcode atts / `topicData` /
   `swml_poems_*` banks / stored state, and open the chat already knowing it ("We're planning your
   comparison of X and Y for: '[question]'"). The ONLY legitimate student inputs are (a) genuine
   unknowns the system cannot hold (their own ideas, answers, choices), and (b) deliberate RETRIEVAL
   TESTS where producing the thing IS the pedagogy (quizzes, recall checks — explicitly framed as
   such). Even genuine choices are PICKS (chips/pickers from a code-owned list), never free-typed
   pastes — paste survives only as the off-bank fallback. Proof of the failure class: poetry b1
   demanded two FULL POEMS pasted while the doc rendered the focus poem beside the chat, and it
   survived a full port + mechanical gate because no rule named it. (Twin of root CLAUDE.md §14
   never-show-a-raw-ID: §14 = never SHOW machine data raw; this = never DEMAND known data back.)
4. **⭐ PROGRAMMATIC-FIRST for deterministic turns (Neil, 2026-07-21).** Any chat turn whose output is
   100% pre-scripted or derivable from stored state — fixed teaching chunks and their "explain more"
   expansions, menus/format choices, canned confirmations, summaries of stored state, wrap-ups — is
   served by CODE (scripted-sequence turns, quick-action chips, pickers), never by an API round-trip.
   The API is called ONLY for genuine judgment: reading the student's free text, Socratic dialogue,
   wrong/weak/resolved verdicts, plan condensation at approval. Reference precedent: the S0–S1
   pre-planning chain (code-owned turns, no AI round-trip). ~35% of a poetry planning session's API
   calls were deterministic before this rule. Watch-it: a turn is judgment the moment it READS the
   student (an A/B tap is deterministic; "explain in your own words" is not) — never strip those.
4b. **⭐ PACING IS A FEATURE — a code-served run delivers ONE bubble per tap (Neil, 2026-07-23).**
   Going programmatic-first silently deletes pacing. While the API narrated a teaching run, each
   chunk arrived on its own round-trip, so the one-at-a-time rhythm was a free by-product of
   latency. Serve the same text from code and it all lands in a single frame — Neil on the CW
   Step 2 opener: *"all of the messages just came at once. No, they need to come one at a time,
   and there needs to be an acknowledgment quick-action button to move on to the next one,
   because nobody's gonna read that."* So: **any code-served run that emits more than one bubble
   MUST page** — emit one chunk, gate the next behind a `Continue →` chip, repeat; the LAST chunk
   is the question and never carries a chip (the student answers it). Use the shared
   `serveCwChunks(chunks, opts)` (wml-assessment.js, v7.20.268) — never a bare run of `aiBubble()`
   calls. Resume-safe by design: delivered bubbles replay from saved history, so `deferFirst`
   re-attaches the chip for the NEXT chunk instead of auto-emitting it. **Gate for every future
   port (Steps 5-29, poetry, CN): after converting a turn to code, count consecutive `aiBubble()`
   calls — more than one in a row is the wall, by construction.**
4c. **⭐⭐ THE ASK TEMPLATE + WALK LAWS — codified at Neil's order (2026-07-24: "Opus keeps
   slacking with the interaction… codify it"). This is THE mechanism for every code-served
   walk, present and future.** Reference impl: `_cwLoglineCtl` / `_cwSpineCtl`
   (wml-assessment.js, v7.20.282–.285). Every CODE-served ask that requests student input:
   1. **CRITERIA UPFRONT** — "A strong X:" bullets BEFORE the question. The student always
      knows what is wanted; never a vague ask Socratically mined afterwards.
   2. **WORKED EXAMPLES IN THE ASK** — 2–3, varied texts students know, a weak-vs-strong pair
      where it teaches. Examples replace API round-trips (Neil: "examples will help the
      students a lot"). Multi-step walks may thread ONE story across all asks (the CW4
      Scrooge spine) so a known example assembles in parallel with the student's.
   3. **POINT AT THE HELP** — 📖 Guidance (reference guide at this section) · 👤 Writer's
      Profile · 🗂 technique deep-dive chips where a Table-of-Techniques card exists
      (deep-link via `window.SophiclyTable.open(sym)`; symbols verified against table data).
   4. **THE CONCRETE ACTION LAST** — the ask ENDS on the question (checklist form when
      multi-part). Never leave the student at a teaching paragraph.
   5. **ORIENTATION AT WALK START** — how the walk works, the help buttons, and
      "don't overthink it" (rough now, polish later), served as PACED chunks. FIRST-PERSON
      Sophia throughout — never "the system"/"the platform" (protocol voice rule).
   6. **⭐ PUSH-CYCLE BANKING — decide ACCUMULATE vs REWRITE per ask (v7.20.283 + .289).**
      A walk that banks student answers MUST persist every answer of a push cycle, and each
      ask declares HOW the cycle banks:
      - **`accumulate`** (default; the .283 protagonist bug) — the push asks for a MISSING
        DETAIL, so the follow-up ADDS and the WHOLE cycle is banked verbatim on accept.
        Banking only the in-flight message files the final FRAGMENT as the whole answer.
      - **`rewrite`** (the .289 logline bug) — the ask owns ONE self-contained artefact (a
        logline, a thesis, a title), so a push means "write it again, better" and only the
        LATEST complete answer is banked. Accumulating files every draft into one box —
        Neil's live catch: the Chosen Logline box held both attempts stitched together.
      Stamp the kind at STEPS construction (`{cycle:'accumulate'|'rewrite'}`) so a newly
      added ask cannot inherit the wrong one silently. **Protocol twin, both directions:**
      judge against the STATED criteria only and keep the push on the CURRENT component; and
      on a `rewrite` ask, the push MUST demand the COMPLETE artefact rewritten — asking to
      "rewrite the middle section" banks a fragment, which is the .283 bug in reverse.
   7. **⭐⭐ THE FOSSIL LAW — now MECHANICAL, v7.20.351/.352. Do not re-derive it from prose.**
      **THE ROOT.** `canvasChatHistory` does two jobs with opposite requirements: it is a
      TRANSCRIPT (immutable record, fed to the API) and it is the SCREEN (replayed VERBATIM
      on re-entry). So a persisted turn asserting a CURRENT FACT becomes a lie the moment
      that fact changes. This rule lived in prose from .284 to .350 and was re-broken five
      times by models that had read it — because `history.push()` meant "persist for ever"
      and persisting was **the default you got by not thinking**. A rule in prose cannot
      beat a default in code, so the default is gone.
      **TWO SUB-CLASSES — the second went unnamed for months and is the one that bit:**
      - **TURN fossil** — a whole turn true only under a condition (prereq gate .284,
        greeting .324, resume re-serve .345, anchor chips .350, and the empty-response
        redirect the .351 audit found still live).
      - **VALUE fossil** — a turn that SHOULD persist but bakes a MUTABLE value into its
        text. Proof: the Step 6 greeting stored 2026-07-25 read "You chose **Rags to
        Riches**" while the artifact said `tragedy` and the document had rebuilt correctly.
      **THE DISCRIMINATOR IS TENSE, NOT INTERPOLATION.** "I've received your essay (873
      words)" is a PAST-EVENT report — correct to freeze. "You chose X" is a PRESENT-STATE
      assertion — must stay live. A naive "no interpolation in stored turns" rule fires on
      ~10 sites, 4 of them correct, and gets switched off.
      **HOW YOU WRITE A TURN NOW — there is exactly one way, and it will not let you skip
      the question:**
      ```js
      WML.recordTurn(history, { role, content }, { durable: true|false, why: '…' })
      WML.rehydrateTurn(history, entry)   // replay only — restoring, not deciding
      ```
      `durable` has NO default; omitting it fails the build. `why` is mandatory and is the
      review artefact. **THE TEST, which decides every case:** *"if this fact changes
      tomorrow, should this sentence still be on the screen?"* — no → `durable:false`
      (draw it, never store it; it re-derives on entry, and §4d liveness still applies).
      For a durable turn that must NAME something mutable, store a token and register a
      **sync** resolver with a mandatory fallback:
      `'You chose **[SWML_LIVE:cw.plotStructure]**'` + `WML.registerLiveValue(name, get, fallback)`.
      **ENFORCED, so you do not have to remember any of the above:** `bin/fossil-lint.js`
      (in `pre-ship-check.sh`) fails on a raw `.push` into chat history, on a missing
      `durable`/`why`, and on a mutable value traced into a durable turn; `walk-sim-lib`'s
      shim THROWS on a contract breach, so every walk sim is automatically a durability
      test with no opt-out. Every check was proven by injecting the real defect — the first
      two cuts of the lint PASSED it, and the `why` prose itself once blinded the value
      check. **A stored fossil does not heal itself:** stopping new ones is only half, so
      `_healFossilTurns` rewrites already-stored ones on load. If you fix a fossil-shaped
      bug, ask what is ALREADY in the database.
   8. **PICKS: single-tap for one-of-N; MULTI-SELECT (toggle + Continue) when the honest
      answer is "several"** — a main pick may stage into an optional "any others?" multi
      (the CW4 unmet-needs pattern, v7.20.285). A pick is a transcript-visible user turn,
      never `hidden`.
   8b. **⭐⭐ SERIAL, NEVER A MENU — a set of things that each need a decision is walked ONE
      AT A TIME (Neil, 2026-08-04, ruled as a general UX law: *"all questions as much as
      possible and everything should always be serial… that needs to be a rule. I think
      that's, like, an important user experience rule"*).**
      **THE REASON, in his words:** *"if you present all of them, they'll most likely skip
      over the rest. They'll just choose one and skip over the rest."* A menu turns N
      judgements into one judgement plus N−1 skips. Serial makes every item cost a
      deliberate tap, which is the whole point — the student has to actually consider the
      one in front of them.
      **THE DISCRIMINATOR, so this does not over-fire — ask what each option IS:**
      - **Each option needs its own decision → SERIAL.** The 23 Step-7 traits, a list of
        techniques to consider, beats to confirm, criteria to self-check. Present ONE, ask
        for a verdict on it (`Yes / No`, a condition, a rating), then the next. A `No` must
        cost exactly one tap so the walk stays cheap for the items that don't apply.
      - **The options are mutually-exclusive ALTERNATIVES and only one applies → ONE
        screen.** "Which plot structure?" is a single choice among 8, not 8 decisions;
        walking it serially would be strictly worse. §8 above still governs this case.
      **AND WHAT SERIAL BUYS THAT A MENU CANNOT:** each item gets its own worked EXAMPLE
      at the moment it is asked (§4c.2, §4c.9 rung 0) — impossible in a menu, where the
      examples would have to be either absent or a wall. **Neil explicitly overrules the
      example-count finding in `research/learning-WITHOUT-AI` for this shape**: *"I know the
      research says don't worry about examples. I don't agree with that, that's not from my
      experience. In my experience, the examples really help students."* That is a ruling —
      do not re-argue it from the research doc.
      **THE COST, stated so it is designed for and not discovered:** serial multiplies turn
      count, so §4b pacing and §4c.6 banking are load-bearing, and a long serial run needs
      resume to land the student back on the exact item they were on (not the top of the
      value/section). Design the carry-forward for any SECOND pass over the same set — a
      re-walk of items already decided should ask what CHANGED, never re-ask from zero.
   9. **⭐ THE HELP LADDER — Sophia is the LAST rung, never the first (Neil, 2026-07-25).**
      *"If we make it so that the students have lots of examples and very clear criteria,
      they'll become much less reliant on the API… maybe they could ask Sophia, but only as
      a last resort, so we leave that option buried underneath a few options."* A stuck
      student must be able to get unstuck WITHOUT spending an API call. Every ask carries the
      rungs in this order, cheapest first, and only the last one costs anything:
      - **Rung 0 — the ask** (free): criteria upfront + **ONE short worked example INLINE**
        so the instruction is never abstract, ending on the question (4c.1/2/4).
      - **Rung 1 — `[💡 More examples]`** (free): 2–3 further worked examples served from
        code as a NEW bubble. Keeps the ask short without losing the examples.
      - **Rung 2 — `[📖 Guidance]` + `[🗂 <Technique>]`** (free): the guide at this section,
        and the Table of Techniques card for the exact concept.
      - **Rung 3 — `[🤔 Still stuck — ask Sophia]`**: visually last and quieter. **This is
        the only rung that calls the API.**
      **DEPTH LIVES IN THE TABLE OF TECHNIQUES, NOT THE REFERENCE GUIDE (Neil's ruling,
      2026-07-25).** The 217 technique cards already carry, per concept, a definition + THREE
      worked examples from varied texts + reader effects, and the chat already deep-links them
      (`window.SophiclyTable.open(sym)`). The reference guide keeps STRUCTURE-level teaching
      (what Rags to Riches is, how the six stages work) and must NOT duplicate per-concept
      depth — two copies of ~40 concepts is the drift class.
      **AND: MAP TO CONCEPTS, NEVER AUTHOR PER ROW.** The eight Step-6 plot templates hold
      **865 beat rows** (106–112 each) — per-row authoring is a job that never finishes. Those
      865 rows are ~40 RECURRING concepts reworded (opening image · theme stated · inciting
      incident · false identity · B story · turning point · dark night · ticking clock…), and
      112 of them already exist as narrative/structure/archetype technique cards. The
      deliverable is a **row → technique-symbol map**; a concept with no card gets a NEW
      technique entry (which improves the table everywhere else). Never re-author what a card
      already holds. **Judgment is NOT a rung** — the ladder governs the HELP direction only.
      A turn that READS the student's free text is still judgment (4b watch-it) and is never
      stripped to save a call.

4d. **⭐⭐ A REFUSAL IS HALF A CHANGE — LIVENESS IS THE OTHER HALF (Neil, 2026-07-28, emphatic).**
   Verbatim: *"how is it that we make a fundamental mistake that fundamentally destroys the user
   experience?"* — after a guard I added to stop a stray chip being filed left a student on a
   greeting with help buttons and **no question**, mid-lesson, in front of a class.
   **THE LAW:** any change that BLOCKS, GUARDS, REFUSES, SWALLOWS, GATES or gives up on an input
   MUST state, in the SAME change, what the student sees instead. "Not filed, not sent" is a
   complete sentence in a commit message and a broken page to a 14-year-old. A guard has three
   possible outcomes — *allowed* · *refused, with a way forward* · *refused, with nothing* — and
   the third must be **unreachable by construction**, not merely unlikely.
   **THE INVARIANT (mechanical, not remembered):** after ANY inbound event — an answer, a chip tap,
   a stale tap, a resume, a reload — the student must have **either a question on screen or a chip
   to press**. Never zero. Note what does NOT count: "the input box would accept text" is not
   liveness. On staging v7.20.329 the slot WAS armed, so typing would have been filed — but with no
   question on screen the student had no idea what to type. **What a person recognises as working
   is that the SCREEN RESPONDED.**
   **ENFORCED:** `bin/walk-sim-lib.js` checks liveness AUTOMATICALLY inside `say()` and `tap()`, so
   a walk sim cannot be written that ignores it — opt-out is impossible by design. Any new walk
   registers in the rig and inherits the check.
   **WHY IT WAS MISSED, so the next model doesn't repeat it:** every invariant in the harnesses was
   a NEGATIVE — *nothing is written unless an ask was served · no answer leaks · no rewind · a
   rewrite doesn't stitch*. **A suite made entirely of "X must not happen" passes perfectly on a
   screen that does nothing at all.** The instruments inspected rows and writes, so the reasoning
   followed the data and never looked at the screen. When you add a guard, the first question is
   not "does this stop the bad write?" — it is **"what is on the screen one second later?"**

5. **⭐ CODE-SERVED SOURCE TEXT MUST NEVER SIT IN A MANIFEST-LOADED MODULE (Neil, 2026-07-22 — the
   retained-source law).** When a deterministic turn is converted from LLM-narrated to CODE-served
   (a `@PLAY_SEQ` scripted-sequence beat, a chip menu, any canned text), its teaching/source text must
   NOT remain inside a protocol module the manifest loads into the LLM context. **The manifest loads
   WHOLE `.md` files** (`protocols/{board}/{subject}/manifest.json` → `load_modular_protocol`), so any
   teaching text left in a loaded module is IN the model's context — and **the model narrates it
   regardless of any "do NOT deliver" / "[AI_INTERNAL — CODE-SERVED SOURCE]" fence** (the protocol
   loads LAST and dominates the prepended router gate — see PROTOCOL ROUTER PREAMBLE RULES §6). The
   byte-diff-harness source lives in a **non-loaded sidecar** (leading `_`, absent from the manifest —
   e.g. `protocols/aqa/poetry/planning/_seq-source.md`); the loaded module carries ONLY the marker
   directive. Enforced mechanically: `bin/seq-port-harness.js`'s retained-source guard FAILS if any
   `SEQUENCES` `plain` (≥40 chars) appears in a manifest-loaded module. **Why this is a law:** the
   Piece-2 port (v7.20.250/.251) kept the chunk text in b2/b3/b4/b5 "so the harness could check it,"
   and the model narrated the whole teaching in a live session — the gate lost to the in-file text
   (v7.20.252 fix). The miss = not tracing whether the retained text lands in the LLM payload
   (read-before-write on the *model-input* side, not just the code side). Before retaining ANY text
   "for reference" in a protocol file, ask: does the manifest load this file into context? If yes, the
   reference belongs in a sidecar.

---

## ⭐⭐ ALIGNMENT / GEOMETRY ASKS — SOLVE THE GEOMETRY ON PAPER BEFORE WRITING ANY CODE (Neil, 2026-08-08, after FIVE builds on ONE badge: *"we've been back and forth with this too many times"*)

**THE COST, stated first, because it is the whole reason this rule exists.** One 28px badge took
v7.20.465 → .470 and five of Neil's test cycles. Every build was a real fix of a real defect, the
gate passed every time, and **not one of them made the badge look right** — because the thing that
was actually wrong was never a defect at all.

**WHAT ACTUALLY HAPPENED, in order — the shape matters more than the details:**
1. `.465` the aligner never ran (measured a detached tree). Real bug. Fixed.
2. `.466` it ran too early, and compared `offsetTop` across two different `offsetParent` chains.
   Two more real bugs. Fixed.
3. `.467` measured correctly at last → returned **3px**. Neil: *"it looks horrible."*
4. **The 3px WAS the correct answer.** The rail's first button sits ~31px below the panel's top
   edge; the badge is 28px tall; so "badge BOTTOM level with the button's TOP" leaves 31 − 28 = 3px
   above it — **by arithmetic, on every screen, forever.** No measurement fix could ever have
   produced a different number.
5. `.470` the only free variable was the RAIL'S OWN TOP. Lowering it 32px gave the badge ~36px of
   air *and* kept the datum exact. **That change was available on day one.**

**THE RULE — before ANY "align X to Y" / "line it up with" / "move it up/down" request, write the
one-line equation and check it has a pleasing solution:**

    available space = (Y's position) − (container edge)      e.g. 31px
    required space  = (X's size) + (the gap you want above)  e.g. 28px + 32px = 60px
    if required > available → THE DATUM CANNOT BE SATISFIED PRETTILY.
    Say so, and name the free variable that fixes it, BEFORE writing code.

**FOUR THINGS THAT WOULD EACH HAVE SAVED FOUR CYCLES:**
1. ⭐ **A CONSTRAINT CAN BE UNSATISFIABLE. Check that FIRST.** "Make the numbers right" assumes a
   good answer exists. Here the good answer did not exist inside the variables being adjusted. Ten
   seconds of arithmetic beats four correct fixes to the wrong quantity.
2. ⭐ **A DATUM IS ONLY AS GOOD AS THE BOX IT SITS IN.** Neil asked for this exact alignment once
   before and was right (#297) — because the collapse icon it applied to sat in a **50px head**
   that gave it room. #340a *deleted that head*. **Carrying a datum across a layout change is not
   reusing it, it is re-deriving it against a box that no longer exists.** When a rule is inherited
   from an earlier ruling, re-check its PRECONDITIONS, not just its wording.
3. ⭐ **"IT LOOKS WRONG" IS NOT ALWAYS "IT IS COMPUTED WRONG."** Three builds assumed a broken
   measurement because the result looked bad. The discriminator is cheap and must be run before
   touching code: **compute the number the spec DEMANDS by hand. If it equals what the screen
   shows, the code is right and the SPEC is what needs the conversation.**
4. ⭐ **NEIL'S DOM PASTE ENDED IT IN ONE MESSAGE.** `--swml-badge-top: 3px` instantly proved the JS
   ran and the arithmetic was the issue — something three rounds of source-reading had failed to
   settle. **For any layout question, ASK FOR THE COMPUTED VALUE FIRST** (he can right-click →
   Inspect and paste an element). It is seconds of his time and it replaces a whole cycle of
   inference (root §19: measure, never guess — and the DOM is the measurement).

**AND WHEN HE RE-ASSERTS A DATUM YOU BELIEVE IS UNSATISFIABLE** (he did: *"just sort out the
arithmetics"*), the answer is not to silently substitute your own (`.468` switched to tops-aligned
and was rejected) **and not to ship his and let it look bad** (`.469` restored the 3px he had
already called horrible). It is to satisfy his datum AND fix the constraint that makes it ugly, in
ONE change — which is what `.470` finally did. Root §12: work the whole list, one test cycle.

---

## ⭐⭐ PARALLEL LANES — WHO SHIPS, AND WHERE CRITERIA COME FROM (Neil, 2026-08-18)

WML often runs **several chats at once**: one ENGINE lane and one or more CONTENT lanes (Cambridge,
Edexcel IGCSE, …). Neil's model, verbatim: *"they're supposed to create material… but not actually
push any versions. They coordinate back with you, and then you push everything when they're ready."*
That is the rule. It lives HERE, always loaded, because it previously lived only in one lane's
handoff — so the lane that happened to be told obeyed it and the lane that wasn't told bumped a
version (`.528`) without ever knowing a rule existed. **A rule that only reaches the lane whose
handoff remembered to state it is not a rule.**

### 1. ONLY THE ENGINE LANE DEPLOYS OR BUMPS A VERSION

| lane | may edit | may bump version | may deploy |
|---|---|---|---|
| **ENGINE** | `frontend/*.js`, `island/src/*`, `bin/*`, everything | ✅ **yes — it owns all three version sites** | ✅ **yes, and only it** |
| **CONTENT** (Cambridge, Edexcel IGCSE, any board port) | protocol `.md`, banks, datasets, its own `.md` docs, its own `bin/` gate | ⛔ **no** | ⛔ **no** |

- ⛔ A content lane **never** runs `deploy-staging.sh` / `deploy-production.sh`, and **never** edits
  the plugin header `Version:`, `SWML_VERSION`, or `WML_BUILD`. It **commits** its work and stops.
  The universal "bump for each piece of work" rule (root `CLAUDE.md` §3) is **suspended for content
  lanes** precisely so two chats cannot claim the same number or ship an untested half-batch.
- ⛔ A content lane **does not edit `.js`.** Where a JS change is needed it **writes the spec** and
  the engine lane applies it (precedent: `EDEXCEL-IGCSE-JS-ROWS-SPEC-2026-08-16.md`).
- ✅ It hands back a handoff carrying a **`done_when:`** probe; the ENGINE lane folds those commits
  into the next batch, bumps once, and ships **one** deploy after Neil's test pass (root §12).
- **Engine lane's duty in return:** check `git log` for unshipped content commits before every
  deploy, and say in the test-pass note which content changes are riding along. A content commit
  sitting unshipped is the engine lane's miss, not the content lane's.

### 2. ⭐⭐ WHERE THE CRITERIA COME FROM — NEVER FROM GENERAL GCSE KNOWLEDGE

Neil, 2026-08-18: *"I'm not sure where they're getting the criteria from… they need to get it from
the mark schemes, the official mark schemes, and then plan the protocols against the principles
we've already established."* Both halves are already law; this is the single place that names them
together, so a lane needs one pointer rather than three.

**(a) MARKS, AOs AND BAND DESCRIPTORS — from the board's own mark scheme, quoted, never paraphrased.**
Order of authority (`PEDAGOGY.md` §"THE MARK SCHEME IS THE AUTHORITY", Neil 2026-08-16):
**mark scheme PDF → the real past paper → anything we have written.** Our spec JSON, protocol files
and `PROTOCOL-QUESTION-STRUCTURE-MAP.md` are *claims about* the mark scheme — when a claim disagrees
with the source, **our file is the defect.** ⚠️ **A totals check cannot catch a wrong tariff set**
(2+3+6+12+22 and 2+4+5+12+22 both sum to 45 — that is how a wrong set was once recorded as
canonical). Never validate tariffs by checking they add up.

**The PDFs are on the drive** — `sophicly-etchwp-package v2.6/Sophicly Etch Mark Scheme Resources/`,
by board: AQA Lang (+ 2026 spec papers/inserts) · AQA Literature · **CAIE GCSE English Language
(Cambridge) 11 PDFs · CAIE Literature 6** · Edexcel GCSE Lang P1/P2 · **Edexcel IGCSE Component A 70
· Spec B 23** · Edexcel IGCSE Literature 16 · EDUQAS 70 · OCR Literature · SQA National 5. ⭐ `mdfind`
first, always (root §17c) — never tell Neil a mark scheme is missing without a completed search.

**(b) THE SHAPE OF THE PROTOCOL — from the established anchors, not from a sibling port.**
`PROTOCOL-STANDARD.md` is the acceptance bar and names **two gold anchors**; every port copies from
the **nearer** one, *"never from memory, never from an older port"*:

| anchor | file | covers |
|---|---|---|
| **LANGUAGE** | `protocols/aqa/language1/modules/protocol-a-assessment.md` | multi-question papers — unit = QUESTION, sub-unit = paragraph |
| **LIT** | `protocols/aqa/literature/modules/protocol-a-assessment.md` | single-essay papers — unit = SECTION, TTECEA+C |

⚠️ **THE LIT ANCHOR IS DEMOTED (Neil, 2026-07-07) and the re-audit is still QUEUED.** AQA **Language
Paper 1 is THE gold standard**; the lit protocol predates the v900→v934 hardening, so a port may
take its essay SHAPE but **every element must be verified against the P1 anchor** — never copied on
trust. State which anchor you used and that you verified against P1.
Planning protocols: `PROTOCOL-STANDARD.md` Part C + **C-LADDER**, ported via
`PLANNING-LADDER-PORT-RECIPE.md`. Pedagogy rulings that constrain either: `PEDAGOGY.md` (its §0 is a
MANDATORY search before asking Neil anything).

**(c) NEVER AUTHOR CRITERIA FROM GENERAL GCSE KNOWLEDGE.** Root `CLAUDE.md` §5c already forbids it
for student-facing content; it binds protocols the same way. If the mark scheme is silent, say so
and ask — do not fill the gap from the marks rule or from what the shape "usually" is.

**THE TWO-LINE PROVENANCE HEADER — every content lane's handoff states, for each paper it touched:**
`mark scheme: <exact PDF path + sitting>` and `anchor: <which of the two + verified against P1? y/n>`.
Unstated provenance is treated as unverified, and the engine lane does not ship it.

---


## FILE STRUCTURE

- `sophicly-writing-mastery-lab.php` — main, hooks, asset enqueue
- `frontend/wml-core.js` (~1.4K lines) — `window.WML` namespace: state, config, constants, `el()`, `formatAI()`
- `frontend/wml-app.js` (~11.6K lines) — navigation, planning, assessment canvas, chat, boot
- `frontend/wml-styles.css` (~2.6K) + `wml-canvas.css` (~3.5K) + `wml-shader.js` (WebGL bg) + `wml-theme-toggle.css`
- `includes/class-rest-api.php` (~1.1K) — REST endpoints, chat, canvas save/load
- `includes/class-protocol-router.php` (~1.75K) — modular protocol loading, preamble builder
- `includes/class-session-manager.php` (~210) + `class-topic-questions.php` (~900) + `class-function-handlers.php` (~200)
- `protocols/shared/` — universal modules used by ALL boards
- `protocols/{aqa,edexcel,eduqas,ocr,edexcel-igcse,sqa,ccea}/` — board-specific
- `templates/page-writing-mastery-lab.php`

---

## JAVASCRIPT EVENT BINDING — CRITICAL PATTERN

The `el()` helper uses `addEventListener('click', fn)` internally. Setting `.onclick = newFn` later does NOT replace the addEventListener callback — both fire.

```js
// WRONG — both doA() and doB() fire on click
const btn = el('button', { onClick: () => doA() });
btn.onclick = () => doB(); // doA() STILL fires too!

// RIGHT — use a flag variable
let action = null;
const btn = el('button', { onClick: () => {
    if (action) action();
    else doA();
}});
action = () => doB(); // clean override
```

---

## CANVAS TASK-SCOPING — #1 RECURRING BUG CLASS (read before adding any canvas post-processor)

Almost every "it works for X but silently does nothing for Y" bug in WML is **behaviour gated by a task-NAME string check**. Examples that have bitten us: `applyAssessmentFeedback` appended inside `if (state.task.startsWith('cw_'))` → never ran for `assessment` (v7.19.600); `assessment_mode()` keyed off a `language2`-only list → P1 vs P2 diverge; canvas slug `aqa_lang_paper_1` vs subject `language1` vs `language_p1` (three names, one thing); `diagnostic` vs `redraft_assessment`; `"Q2"` vs `"Question 2"`. New code inherits the **nearest** name-guard by accident and silently no-ops for every sibling task — and silence reads as success until a human tests.

**RULES (enforce on every canvas change):**

1. **Cross-cutting marker/content consumers run UNCONDITIONALLY + self-guard.** Functions that fill the canvas from the AI reply (`applySectionFills`, `applyAssessmentFeedback`, `applyFieldSets`, reflection detection, …) must be called on EVERY canvas turn and decide internally whether to act (no-op when the reply has nothing for them). NEVER nest them inside a `if (task === …)` / `startsWith('cw_')` guard — that is exactly how they silently skip sibling tasks. Both `sendCanvasMessage` pipelines (the dual pipeline below) must call them.

2. **Gate on CAPABILITIES / task-family, never on a literal task name.** Prefer a capability lookup (does this task get feedback boxes? a reflection panel?) over `task.startsWith(...)`. A new task / topic / paper should opt in via config, so it can't silently miss. (Same principle as the dashboard "derive, don't per-type-wire" rule.)

3. **One canonical naming layer.** Resolve task→family, subject↔canvas-slug, and Q-id (`Q2`/`Question 2`/`2`) through a single helper and reuse it everywhere; key behaviour off the family, not the literal. (`resolve_session_fields` does half of this server-side — extend it; add the JS twin rather than re-deriving names ad hoc.)

4. **Fail loud + rollout matrix.** When a turn LOOKS like it should fill the canvas but fills nothing, `console.warn` loudly (see the SILENT-SKIP guard in `applyAssessmentFeedback`) — don't fail quietly. Before shipping any canvas feature, verify it across **{P1, P2} × {diagnostic, redraft} × {topic 1 … N}** (and both chat pipelines). Match the box by question NUMBER, not the `"Qn"` literal — labels render as `Feedback: Q2 (— / 8)` but the format drifts.

5. **GRANULAR, CANVAS-DERIVED sidebar — the STANDARD for every canvas task (Neil 2026-07-13).**
   No de-stitched task ships the generic essay sidebar. Steps are DERIVED, never hand-authored
   per protocol: (a) one row per document plan/feedback FIELD, grouped by question (labels from
   `data-section-label`, done = field holds text); (b) code-owned pre-chain stages each get their
   own row (grade goal / headline goal / plan mode / predictions), done-ness from the chain's own
   stage detection; (c) live intra-step beats surface via the universal `📌` pin →
   `parseProgressBeat` chip — a protocol wanting finer sidebar granularity emits pins, never a
   new hand-authored step list. Reference impl: `_buildPlanningSidebarModel` (planning) +
   `_buildLangSidebarModel` (assessment, v7.19.625). Numbers/counts in chain texts are likewise
   DERIVED from the document (`_planDocQuestionFacts`) — a hardcoded "five questions" was the bug.

6. **Detection regexes vs markdown (v7.20.50 lesson).** Any regex matched against chat-history
   content must run on MARKDOWN-STRIPPED text (`_planChainNorm`-style `replace(/\*/g,'')`) or
   avoid crossing a `**bold**` boundary — `**3 themes** do` broke `/themes do/` and looped the
   predictions capture forever. Detection regex + question text are ONE unit: change one,
   re-check the other (byte-pair rule).

---

## PROSEMIRROR NODEVIEW — never write to a NodeView's DOM outside a transaction (v7.19.866)

**Root of a whole freeze class.** A section is a ProseMirror NodeView. If ANY code writes DOM
(style / attr / children) onto a NodeView's own `dom` (the `.swml-section-block`) or `contentDOM`
**outside a PM transaction** and it isn't firewalled by that NodeView's `ignoreMutation`, PM's
DOMObserver treats it as a foreign edit → `flush()` → `updateState()` → **redraws every section
NodeView** (removeChild/insertBefore churn). If the write came from the NodeView's own on-(re)mount
fill, the redraw re-runs the fill → re-writes → **infinite compounding remount loop that freezes the
tab** — with **NO error, `onUpdate=0`, `txnTotal=0`, `editorMounts=1`** (it's a view redraw, not a
doc change). Bit the AQA Lang P1 T1 diagnostic on staging (v7.19.866); only there because the big
53-section shared-lesson doc mounts raggedly so a completed-count flickered and toggled a
`style.display` every fill. Full story + the 7-step probe method: memory
`reference_wml_pm_nodeview_foreign_mutation_loop`.

RULES:
1. **Derived-card NodeViews are display-only** (progress, sign-off, any non-editable card filled by
   wml-assessment): their `ignoreMutation` MUST firewall their whole rendered UI **including
   attribute writes on their own `dom`** — `if (mutation.type==='attributes' && mutation.target===dom) return true;`
2. **Write derived-card content into the firewalled sub-element** (`.swml-progress-card` / `.swml-signoff-ui`), never onto the `.swml-section-block` wrapper.
3. **Real content changes go through a PM transaction** (`_setParagraphContentViaPM` / `setNodeMarkup`), never a raw `textContent`/`innerHTML`/`style` write PM will revert.
4. **Idempotent writes** — guard `if (el.style.x !== want) el.style.x = want;` so a same-value write can't fire a needless MutationRecord.
5. **Circuit-breaker exists** (`_derivedCardFillOk` in wml-assessment.js): progress/sign-off fills bail + `console.warn` once at >50 fills/sec. If you add a new derived-card fill, route it through the same guard.

---

## TEXT-SLUG REGISTRY — one canonical layer (v7.19.823+)

`$SLUG_ALIASES` in `includes/class-rest-api.php` is THE text-slug registry. Every inbound slug
(bridge/course-map, picker id, legacy form) normalises through `normalize_text_slug()` at the REST
boundary — canvas load/save AND quiz start; FQ activation (`swmlConfig.fqBankTexts`, built by
`get_fq_bank_texts()` in the main plugin file) expands it so every alias form activates.

1. **Canonical = the form live user_meta keys use.** NEVER flip a canonical to a different form —
   normalisation drives meta-key construction, so flipping silently re-keys student data.
2. **Bank + template FILENAMES use the canonical slug.** Never ship duplicate files per slug form —
   add an alias instead.
3. **Any new divergence** (new course slug, new picker id, dash/underscore drift) gets ONE line in
   `$SLUG_ALIASES`. That is the only place slugs reconcile.
4. **Never silent:** a `foundational_quiz` text with no matching bank `console.warn`s and falls back
   to the legacy AI quiz — that warning means "add an alias or a bank", never a code fork.

### SOP — resolving a bank / template / protocol FILE by text (Neil 2026-07-08: "fix path/file/slug at the root")

Recurring bug class (§9.11 slug/name drift): a selector keys on the WRONG dimension (subject, not
text) or guesses a filename ad-hoc per directory, so the wrong file — or none — is served. The fix
is ALWAYS the same shape; do NOT invent a new per-dir lookup:

1. **Key on the most specific dimension the content varies by.** Mark-scheme examples vary by
   TEXT/anthology (L&R ≠ W&L), not by subject (`poetry_anthology`). A selector keyed on subject
   serves cross-anthology content — that IS the bug. Key on `state.text`; fall back to subject only
   as a last resort.
2. **Resolve through the ONE canonical slug ladder**, never a bare filename:
   `{text}.md · {text}_poetry.md · {canonical(text)}.md · {canonical(text)}_poetry.md`, where
   `canonical()` = `$SLUG_ALIASES`. Reference impl: `SWML_Quiz_Bank::parse_sections_text()` (MSQ,
   v963) + `parse_sections_msa()` (MSA). New bank/template dir → reuse this ladder, don't re-derive.
3. **`file_exists()`-driven, first match wins, graceful fallback.** No hard-coded filename per slug
   form; add a `$SLUG_ALIASES` line for a genuinely new divergence.
4. **Filenames use the canonical slug** (the form the FQ/MSA banks + live user_meta already use —
   e.g. `love_relationships_poetry`, not `love_relationships`). Verify against an existing per-text
   bank in a sibling dir before authoring.
5. **Fail loud on a miss** (`error_log`/`console.warn` naming the slug tried) — a missing per-text
   file means "author the bank / add the alias", never a code fork or a silent generic fallback that
   reads as success.
6. **id/scoring namespaces follow the source** — a per-text quiz stamps `msq:{text}:{board}:{q_num}`
   (not `{subject}:…`) so the stateless resume-scorer rebuilds from the right pool.

## DUAL CHAT PIPELINE

WML has two separate chat systems:
- **Main chat** (`sendChat()`, `addMessage()`, `extractAndSavePlan()`) — planning flow
- **Canvas chat** (`sendCanvasMessage()`, canvas `addChatMessage()`) — assessment flow

Features added to one DON'T automatically work in the other. Checklist for any new chat feature:
- [ ] Works in main chat (planning)?
- [ ] Works in canvas chat (assessment)?
- [ ] Pattern detection runs in both pipelines?
- [ ] UI modifications find the correct container in both contexts?

---

## ⭐ PLAN → OUTLINE → RESPONSE — the doc lifecycle (SETTLED, do NOT relitigate — Neil, re-confirmed 2026-07-16 after multiple re-derivations)

Every structured question (all EXCEPT no-structure ones — AQA P1 Q1 4-mark list, P2 Q1 true/false)
runs this Phase-2 redraft lifecycle. **CW (creative writing) is the one TBD — not yet worked; do NOT
assume this model applies to CW until checked.**

### The three lessons (one continuous doc chain, forward-snapshot)
1. **Planning lesson** — student works ONLY the PLAN section (Socratic planning protocol chat). The
   OUTLINE + RESPONSE sections are not shown/worked here.
2. **Outline lesson** — OUTLINE section shows, **already pre-filled** (from the planning autofill);
   RESPONSE section is empty. Student converts each outline element into a full sentence, then
   transfers to RESPONSE.
3. **Polishing lesson** — same sections + contextual Sophia chat → **Assessment** → **Discuss w/ tutor**.
**Coexistence law:** the outline sits ALONGSIDE the plan — it never replaces it. Never delete the
plan-paragraph boxes when a question gains an outline.

### TWO sections, TWO granularities (this is the part that keeps getting re-derived — get it right)
- **PLAN section = ONE box per paragraph.** That box holds the WHOLE paragraph plan (every element
  line together, accumulated). Q3 = 3 paragraphs → 3 plan boxes (`plan-Q3-para-1/2/3`). Plan
  granularity = **paragraph**.
- **OUTLINE section = one section per paragraph, split into ONE box per ELEMENT.** Outline
  granularity = **element**. Q3 para-1 outline = 6 element boxes.
- A paragraph IS its elements — so "per paragraph" (plan) and "per element" (outline) are the SAME
  content at two layouts, NOT a conflict. Plan = all-in-one-box; outline = split-into-boxes.

### The autofill (v7.20.221 — two grades, ONE source, converging at approval; Neil 2026-07-20)
Two content grades, one lifecycle:
1. **LIVE (during planning):** each confirmed element `@FIELD_COMMIT`s the student's VERBATIM
   words into its own **outline element box** only (immediate feedback; resume-from-doc reads it).
   Plan boxes do NOT fill live (the raw-dictation-accumulating alarm, v7.20.216).
2. **AT MIRROR-BACK APPROVAL (A-Happy):** ONE `@FIELD_SET` per paragraph carries the REFINED
   plan (student's own words condensed to their plan mode — the approval click IS the ownership
   checkpoint, so this is not injection). The ENGINE (`_planFanoutToOutline`, wml-assessment.js)
   then writes that same value to BOTH destinations: the **plan box** as one LINE per labelled
   element (the original "elements as separate LINES — a plan, not prose" spec), and each
   **outline element box** per-element (replacing the raw dictation with the refined text).
   Deterministic, code-owned, label→fieldId mapping byte-traced against the protocol registry —
   NEVER a second set of LLM markers.
**The law restored:** plan and outline hold the SAME content at two layouts ("copy to two
destinations"), now at the approved grade. Replays (`applyFieldSets(…, {replay:true})`) may fill
empty rows or untouched auto-fills only — a student's outlining-lesson edits are never clobbered.

### Q3 paragraph elements (6; ×3 paragraphs). Q2/Q4 DIFFER — read the protocol, do not assume.
1. Topic sentence · 2. Technical terms + evidence + inference *(ONE element/line)* · 3. Close
analysis · 4. Effect 1 · 5. Effect 2 · 6. Author's purpose.
(Q2 = 2 paragraphs, a different element set; Q4 = evaluation/AO4, its own set + paragraph count.
Pull each question's real element set from the protocol/outline builder before building.)

### Which questions get plan+outline · how many paragraphs · which elements (the derivation rule — Neil 2026-07-16)
Do NOT ask which elements a question has — it DERIVES from these rules + the protocol. Full per-question
map (every board/paper): `PROTOCOL-QUESTION-STRUCTURE-MAP.md` (plugin root).

**⛔ ANTI-GUESS GATE (Neil caught this twice 2026-07-16 — trust rule, not cosmetic).** The
paragraph-count-by-marks rule below is a **FALLBACK/default only — it is a GUESS.** A question's REAL
structure is the PROTOCOL's per-question line, already recorded + `file:line`-cited in
`PROTOCOL-QUESTION-STRUCTURE-MAP.md`. **Before stating ANY question's structure, READ its map row and
quote it — NEVER restate structure from the marks rule.** Proof: AQA Lang P2 Q4 = *short Intro (0.5) +
3 comparative TTECEA BPs + short Conclusion (0.5)*, NOT the "16→4 body paragraphs" the marks rule
implies — the map had it right; guessing from marks got it wrong. If the map and the marks-rule
disagree, the map wins (it read the protocol); if the map is silent, read the protocol directly and
cite it — do not fill the gap with the marks rule.
- **Plan+outline ONLY for questions needing STRUCTURE.** SKIP the basic retrieval ones (no plan/outline):
  AQA Lang P1 Q1 (list 4 statements), P2 Q1 (choose 4 true statements), and any true/false /
  mark-per-statement / short-retrieval / MCQ comprehension. Right-or-wrong; we don't teach planning for them.
- **Paragraph count by marks (default; a protocol may override):** 8→2 body ¶ · 12→3 ¶ · 16→4 ¶ OR 5
  (short intro + 3 strong body + short conclusion) · 20+/literature essays → full essay: intro + **ALWAYS
  3 body** + conclusion (PEDAGOGY.md §10, Neil 2026-07-20 — marks scale DENSITY, never paragraph count;
  the engine's `LIT_ESSAY_BODY_COUNT = 3` is the one source, never re-derive from marks).
  Reading/analysis Qs = **body-only** TTECEA (no intro/conc). Section B extended writing = a whole-answer
  structure, NOT TTECEA: transactional/persuasive → **IUMVCC** (Intro·Urgency·Method·Vision·Counter·
  Conclusion); creative/narrative → **story-spine / 7-step scene**.
- **TTECEA body bedrock** (the reused analytical skeleton — one outline element-row each; source of truth =
  `OUTLINE_CRITERIA.literature` in wml-assessment.js): 1. Topic Sentence (AO1) · 2. Technique+Evidence+
  Inference (AO2/AO1, one row) · 3. Close Analysis (AO2) · 4. Effect 1 on Reader (AO2) · 5. Effect 2 on
  Reader (AO2) · 6. Author's Purpose (AO1/AO3) · 7. Context (AO3 — **only if the Q assesses AO3**).
  Whole-essay/evaluation adds intro (Hook·Building Sentences·Thesis) + conclusion (Restated Thesis·Controlling
  Concept·Central Purpose·Universal Message); evaluation Qs often use a SHORT intro (thesis only) + SHORT
  conclusion (restated thesis). Single-AO Qs stamp EVERY element to that AO (AQA Lang P1 Q2/Q3 = AO2; Q4 =
  AO4 evaluation). TTECEA is the bedrock; other questions ADAPT it (AO restriction, short intro/conc) —
  continuous transfer of the same skill (Ericsson deliberate practice: work each element one at a time).
- **Why the outline is element-boxes not a paragraph box:** it forces the student to treat each SENTENCE as
  a graded unit (every sentence contributes), building the paragraph sentence-by-sentence. The PLAN is the
  skeleton (elements as separate LINES — a plan, not prose); the OUTLINE makes them work each element into a
  full sentence.

### Precedent + the live gap
- **IUMVCC (AQA P2 Q5) is the working precedent** — its plan sections + outline rows already wire
  this way (`buildIUMVCCOutlineSection`, `_iumvccFieldId`). Mirror its shape, not its literal ids.
- **THE READING-Q GAP — CLOSED for AQA P1 + P2 (v7.20.209–.226) AND AQA Literature
  (filing .228, C-LADDER .229).** All three AQA planning protocols now emit element-by-element
  `@FIELD_COMMIT` (outline) + approval `@FIELD_SET` (plan) per the two-grade autofill above;
  AQA Lit also carries the full C-LADDER (modular pattern: `planning/b-ladder.md` on the
  manifest's ALWAYS list — laws/registry/scripts ride every step). Enforcement is mechanical:
  `plan-fanout-harness` + `planning-keymatch-harness` + `ladder-check` in pre-ship — a port
  with a wrong label or drifted fieldId cannot ship. Remaining papers (other boards) still
  emit 0 markers — each port follows `PLANNING-LADDER-PORT-RECIPE.md` (§1b two-grade rule).
- Node types: PLAN boxes = `inputField`; OUTLINE boxes = `outlineRow`; `@FIELD_COMMIT` fills both.
  Outline shape is BAKED into the saved doc → element/scaffold changes need an on-load heal.

Fuller detail + the 3-lesson forward-snapshot chain: memory
`reference_wml_planning_outline_response_lesson_flow`.

---

## ASSESSMENT ARCHITECTURE (v7.12.22+)

Three entry paths into the assessment canvas:

| Path | How | Notes |
|------|-----|-------|
| A: "Get Assessed" from stepper | `state.task = 'assessment'` → `renderCanvasWorkspace()` → auto-trigger | Most common |
| B: Diagnostic → Mark Complete | Assessment transition runs inside diagnostic canvas | Fresh chat, no history |
| C: Re-enter completed assessment | Same as A, phase already marked complete | Chat restored |

**`initAssessmentState()`** — unified function. Handles sidebar progress + Mark Complete for all 3 paths. Scans `canvasChatHistory`, force-extracts scores, checks phase status via API.

**Assessment Complete Detection** triggers when ANY match in an AI message: `[ASSESSMENT_COMPLETE]` code word, `## Session Complete` heading, both `Total: X/Y` AND `Grade: N` in the same message, or keywords (`Key Strength`, `Priority Target`, `Action Plan`, `Grand Total`).

### ⭐ MARK COMPLETE LIVES IN THE FOOTER — ONE control, never the sidebar (Neil, 2026-07-23)

**SETTLED. Do not relitigate, do not "restore" the sidebar button.** There is exactly ONE
Mark Complete in WML: the **footer** control in the canvas status bar. The old sidebar
3D-push button (`build3DButton('Mark Complete', …)` + `setAssessBtnState()`, wml-assessment.js
~12743) is **retired** — it was assessment-only, so the control appeared in the sidebar on some
tasks and in the footer on others, and that inconsistency is exactly why Neil killed it. Anything
still referencing `assessCompleteBtnRef` / `setAssessBtnState` is legacy: leave it inert, never
re-surface it, and never add a second completion control anywhere.

**The footer control is a PROXY, not ours.** It mirrors LearnDash's own button
(`.spl-footer .learndash_mark_complete_button`) and forwards the click. WML does not own
completion — LD does. Consequences that WILL look like bugs and are not:

- **A completed lesson has NO button.** `learndash_mark_complete()` returns an empty string once
  the step is complete, so the footer proxy has nothing to mirror. Re-testing a step you already
  finished = no button. (Proved 2026-07-23: prod topics 41228/41172 complete → 0 bytes; 41177
  incomplete → 331 bytes.)
- **Unit pages never get it.** `etch-theme-child/single-sfwd-focus.php:1162` gates on
  `$is_topic_page && ! $is_review_mode`, where `$is_topic_page = (post_type === 'sfwd-topic')`.
  A Sophicly "Unit" (`sfwd-lessons`) is completed by finishing its lessons.
- **Review mode never gets it** — a reviewer must never complete a lesson against the student.

**When it's genuinely missing**, the console says which gate closed (v7.20.267, the
`no LearnDash Mark Complete in the footer` line). Only the *lesson page + not review + still
absent* branch is a real defect; the rest are by design. The proxy also retries ~6s for a late
footer (v7.20.266) — a JS-built footer delayed by a perf plugin used to lose the button silently.

**Diagnosing it — never guess, query LD:** `wp --user=<id> eval` with the post set up as global
`$post`, then compare `learndash_is_item_complete()` against `strlen(trim(learndash_mark_complete($p)))`.
**Without `--user=`, `learndash_mark_complete()` returns empty for EVERY step** and you will
"prove" a bug that isn't there.

---

## PLAN EXTRACTION RULES

- Plan elements saved ONLY through confirm interceptor system (`@CONFIRM_ELEMENT` markers).
- Old fallback regex extractors removed (v7.10.16) — don't add them back.
- `validatePlanContent()` rejects: progress bar text, option labels, protocol leaks, advice text, single-word content.
- Extraction runs AFTER the AI reply is added to `chatHistory` — "last assistant message" is the CURRENT reply.

---

## PROTOCOL ROUTER PREAMBLE RULES

The preamble is the #1 source of AI behaviour regressions. Rules:

1. **Workflow instructions FIRST, reference data LAST** — AI follows top-of-context more reliably.
2. **Scope injections to the relevant task** — never inject assessment-only content into global preamble.
3. **Token budget awareness** — assessment preamble is ~80 lines. Compress aggressively.
4. **Guard phrasing** — always tell the AI what NOT to change when injecting reference data.
5. **Anti-duplication: say what to skip AND what to still do** — omitting either half causes failures.
6. **Preamble is PREPENDED, protocol LAST.** `inject_session_context()` assembles `preamble → skip_block → modular_protocol` as `$query->instructions`. LLMs typically weight late content more heavily, so protocol module content is closest to the user turn and should dominate. If both give conflicting rules, expect the protocol to win (model-dependent, not guaranteed).
7. **The preamble is NOT the protocol** — it's session context + hard gates + cross-cutting invariants. Behaviour rules belong in protocol modules.

When the AI misbehaves in WML but works in the raw AI Engine chatbot, the preamble is almost always the cause.

---

## PROTOCOL REFACTORS — STUDY EACH PROTOCOL (v7.17.0+)

**⭐ Before touching ANY assessment or planning protocol, read `PROTOCOL-STANDARD.md` (plugin root). It is the codified contract — R&J gold standard + Neil's locked expectations + grep-able acceptance checks. A protocol change that fails its checks does not ship.**

**⭐ Before touching the assessment ENGINE or canvas UX, read `ASSESSMENT-MECHANICS.md` (plugin root, added at v7.19.914). It is the engine/UX contract — the root/universal/dynamic doctrine made testable, the session-lifecycle spine, PM law, code-owned arithmetic, the failure-class index, and the sign-off checklist. PROTOCOL-STANDARD = what the protocol says; ASSESSMENT-MECHANICS = how the machine behaves; a port is done only when BOTH are met. Update it in the same commit as any mechanics change.**

**⭐ Before building ANY rule that decides HOW MUCH A STUDENT IS HELPED, DEMANDED OF, OR EXEMPTED FROM — read `PEDAGOGY.md` (plugin root, added 2026-07-15). It is the WHY layer: the learning principles the protocols and the engine must SERVE. PROTOCOL-STANDARD = what the protocol says; ASSESSMENT-MECHANICS = how the machine behaves; PEDAGOGY = why either is right. When a pedagogy rule and the code disagree, PEDAGOGY.md is right and the code is a defect. Its §1 is load-bearing and easy to get wrong: leniency/scaffolding/optionality are calibrated to the INSTRUCTION THE STUDENT HAS RECEIVED, never to where they sit in a course — any predicate keying on topic/phase/paper to decide "how much help" is suspect BY CONSTRUCTION (that IS the live `_isFirstDiagnostic` defect). Update it in the same commit as any pedagogy ruling — a rule recorded only inside its consumer gets re-derived wrongly by the next one.**
**It is also the RULINGS REGISTER. `§0` is a mandatory PROCEDURE: search PEDAGOGY.md → memory → the protocol BEFORE asking Neil any "should X / does X get…" question, and before writing any handoff line that calls a ruling OPEN. Neil has given this instruction three times; it is now a gate, not a preference. `§3` = the outline gate: an outline is earned by STRUCTURE, never by MARKS (AQA Lang P2 Q2 = 8 marks, two paragraphs → gets one). When Neil rules, write it into PEDAGOGY.md in the SAME session — a ruling recorded only in a memory file survived exactly one day before he was asked to re-decide it.**

**⭐ Before touching ANY Conceptual-Notes protocol, template, or chat surface (poetry, literature/novels-and-plays, nonfiction), read `CN-STANDARD.md` (plugin root, added 2026-07-10). It is the CN contract — depth calibration (anthology=light per-item, set text=deep), element/doc structure (notes → quotes → effect, craft-only effect boxes), PACE (deep never dragging), four-fold EFFECTS, OWNERSHIP (no-injection law, evidence ladder, wrongness gate, enrichment), session-lifecycle laws (start path always produces a turn; gap-aware re-entry; code-derived chip), the Part B port checklist, and grep-able acceptance checks. A CN change that fails its checks does not ship. Update it in the same commit as any CN mechanics change.**

Every protocol (board + paper + question) has its own AO structure, paragraph scaffold, marking granularity. Do NOT assume uniformity.

- **Language Section A reading Qs** (AQA / Edexcel / Eduqas): single AO per Q from schema. TTECEA ×N paragraphs. Q1 typically retrieval (mark-per-statement); Q2-Q4 analysis/evaluation.
- **Language Section B (Q5)**: AO5 + AO6 holistic-with-structure. Story-spine (narrative) or IUMVCC (transactional). NOT TTECEA. Edexcel IGCSE Spec A uses AO4+AO5 labels (same criteria, different names).
- **Literature essays**: multi-AO per Q. TTECEA+Context. AO allocation differs per paper: AQA lit = AO1+AO2+AO3 (+AO4 SPaG on Shakespeare/modern); Eduqas Shakespeare/modern = AO1+AO2; Edexcel varies per Q; Edexcel IGCSE lit = AO1+AO2+AO4 (AO4 = Context, NOT SPaG).
- **Marking is granular per element across ALL boards.** Every TTECEA (+C) element, intro element, conclusion element gets a specific mark value. Values live in the paper's `protocol-a-assessment.md`. Pedagogy: granular feedback enables deliberate practice (Hattie / Ericsson).
- **UNIVERSAL PER-PARAGRAPH RULE (SETTLED — do not relitigate).** Every *paragraph* in a reading question gets ALL FOUR, every time: (1) granular mark, (2) feedback, (3) the student's answer rewritten to gold standard, (4) an alternative optimal gold-standard model. Applies uniformly to Q2 ¶1 AND ¶2, Q3 BP1/2/3, Q4 intro + BPs + conclusion — equal depth per paragraph. If a protocol gives one paragraph less than another (e.g. a monolith that marks ¶2 but skips its feedback/gold), that is a **protocol bug to fix**, not a spec to preserve. **Q1 excluded** (true/false retrieval: score + per-statement feedback, no gold). **Section B / Q5 (extended writing, e.g. AQA 40 = AO5 24 + AO6 16): MARK holistically** (whole-piece — AO5 = sustained crafting + structure across the arc; AO6 = vocab/sentence forms/punctuation-for-effect/SPaG across the whole). Do NOT split Section B into equal-weighted paragraph marks. **But keep granularity where it teaches**: per-IUMVCC-section feedback (Introduction/Urgency/Methodology/Vision/Counter-argument/Conclusion) + ONE labelled-holistic gold rewrite (one flowing article, six sections labelled inside). Unit of granularity = paragraph for reading Qs, IUMVCC-section for writing.
- **Every penalty must carry a fix-example (UNIVERSAL — all protocols).** A deducted penalty states the fault AND a one-line worked example of the fix (rewrite the student's actual phrase / give a model phrasing). Never "use more precise language" with no example. Applies to every board/paper's penalty instructions + shared penalty-code modules.
- **Never label sub-parts "Unit N" (terminology clash).** "Units" = LearnDash Lessons in Sophicly's course structure — students know that meaning. Do NOT call A-B-A-B inference sub-parts (or any paragraph sub-elements) "Unit 1 / Unit 2" in marking output. Use a non-colliding word (e.g. "Point", "Element", "Inference 1").
- **Creative writing** is more holistic but still element-targeted per protocol beats.
- **Preamble is session-context + hard gates only** (v7.17.0+). Mark-scheme shape lives in protocol modules.

**Anomalies that bite** (full list in `~/.claude/plans/you-are-wml-chat-humble-turing.md`): AQA Lang P2 Q4 fixed 3-aspect TTECEA; Edexcel IGCSE Lang P1/P2 are multi-Q response sets not essays; Edexcel IGCSE AO4 = Context (opposite of GCSE); OCR Poetry Part (a)/(b) penalty rules; TTECEA element-AO annotations in shared modules are TEACHING guides, not mark-allocation keys.

**Before refactoring any assessment code**, read the paper's `protocol-a-assessment.md`, `foundation*.md`, `knowledge-ttecea*.md`.

---

## QUICK ACTION DETECTION

Patterns checked in ORDER — first match wins.
- Add new patterns BEFORE Pattern 7 (generic fallback).
- Average raw label length > 55 chars = skip (summaries, not choices).
- Detect content context, not magic trigger phrases — the AI paraphrases.

Context-based detection example (AO multi-select):
```js
const isAoContext = /assessment\s*objective|which\s*AO|AO1.*AO2.*AO3/i.test(text)
    && actions.some(a => /^AO\d/i.test(a.label || a.value || ''));
```

---

## SECTION DETECTION (Document Outline)

`getSectionIndicator(section)` for outline checks; `checkSignoffReady()` for gating.

Clone+strip pattern for student-content detection:
```js
const clone = domSection.cloneNode(true);
clone.querySelectorAll('em, h3').forEach(el => el.remove());
const studentText = clone.textContent?.trim() || '';
if (studentText.length > THRESHOLD) return ' ✓';
```

**Never use `CSS.escape()` for attribute selectors** — use loop-based lookup with `getAttribute()`.

---

## WML PRE-SHIP CHECKLIST

(Universal validation rules in `../../../CLAUDE.md`. WML adds:)

0. **MECHANICAL GATE FIRST — do not rely on memory.** Run `bin/pre-ship-check.sh` on your staged
   changes before commit/deploy: `node --check` + `eslint no-undef` (JS) and `php -l` + brace
   parity (PHP). `node --check` catches SYNTAX only; **`eslint no-undef` catches the out-of-scope
   reference class** — e.g. a module-scope helper calling a closure-local `sendCanvasMessage`
   (the v7.19.898 crash: `sendCanvasMessage is not defined`, invisible to `node --check`). When
   extracting a function across scopes, EVERY free variable it uses must be reachable in the new
   scope (module-scope + params only — closure-locals do NOT hoist); the gate proves it, so you
   don't have to eyeball it.
0b. **RUN THE FLOW — a syntax/scope-clean file can still be logically wrong.** For any change
   touching a runtime path (a chat pipeline, a submit handler, marking, boot), DRIVE that path
   once (or `/verify`) before shipping. Syntax-checking a submit handler is not testing it. The
   .898 crash shipped because it was checked, not run.
0c. **SLUG / IDENTITY TRACE — mandatory for ANY feature keyed on a slug/subject/text/path/family/key.**
   Verifying the DESIGNED slug exists (seeded option, config key, bank `@text`, file on disk) is NOT
   enough — the feature is inert if the REAL lesson resolves to a different slug than the gates check.
   (a) Grep EVERY gate that keys on the identity (client detection predicates, router arms, preamble
   branches, server discriminators, roster/bank/template/protocol resolvers, canvas meta-key builders,
   autofill field composers). (b) Get the REAL resolved value from a real lesson — read the shortcode
   atts or `wp eval` the resolver (`text_to_template_slug`, subject derivation, `normalize_text_slug`,
   `canonical_slug`); NEVER assume the picker/design sets it (the bridge/course-map/derivation
   overrides). (c) Diff real-vs-expected at EVERY gate (table: gate | checks-for | real | match?). Any
   mismatch = a silent miss. Prefer ONE canonical predicate/resolver over N literal checks. Full SOP:
   memory `feedback_slug_trace_mandatory_preship_gate` (proof: nonfiction CN loaded Literature because
   the bridge emits `language_p1`/`edexcel_igcse_lang_a`, not the mold's `nonfiction_anthology`/
   `igcse_lang_nonfiction` — every gate missed while all "data exists" checks passed).

1. **Trace the full click path.** User clicks → function → screen render → state change. Check no other handler also fires.
2. **Check for dual event bindings.** Search for `.onclick =` and `.addEventListener` on the same element.
3. **Verify screen transitions.** Old screen cleared before new one renders.
4. **Test the async path.** Both outcomes — data before click AND click before data.
5. **Check both chat pipelines.** Planning AND assessment.

**Full regression gate:** for any change touching canvas / either chat pipeline / migrate-heal chain / saved doc shape / quiz engine / boot wiring, run the staging matrix in **`WML-SMOKE-TEST.md`** (plugin root) before prod. `{P1,P2}×{diagnostic,redraft}×topic` + CW steps 1–4 + quiz record/resume + boot/SPA-nav. Any red console error = fail.

---

## TERMINOLOGY

- **"Units"** = LearnDash Lessons (sfwd-lessons) — renamed for clarity
- **"Lessons"** = LearnDash Topics (sfwd-topic) — renamed for clarity
- **Phase 1** = Initial Attempt (Diagnostic → Assessment)
- **Phase 2** = Redraft (Planning → Outlining → Polishing → Assessment)

**Topic 2 = Conceptual Notes when:**
- All Literature texts (fixed text — notes scratchpad)
- Paper 2 across most boards (anthology + creative-writing mix): AQA, Edexcel GCSE, Edexcel IGCSE, Cambridge IGCSE, CCEA, Eduqas
- All Edexcel IGCSE Language papers (Spec A anthology-style — both P1 and P2)

**Topic 2 = PP2 (NO Conceptual Notes) when:**
- All Language Paper 1 across most boards — AQA, Edexcel GCSE, Cambridge IGCSE, CCEA, Eduqas, OCR. Paper 1 is fiction-based and Sophicly embeds its separate Creative Writing course into these papers, so no need for Conceptual Notes at the paper level.
- OCR Paper 2 (also fiction-based — exception to the P2-has-CN rule above).

**Topic numbering — Language Paper 1 (fiction-based, no CN):**
- **Topic N** = Practice Paper N. 5 topics total per paper.
- Each Topic contains diagnostic write + initial assessment + guided redraft + reassessment as PHASES — NOT separate Topics.

**Topic numbering — Language Paper 2 (anthology + CW mix, has CN — AQA / Edexcel GCSE):**
- Topic 1 = Diagnostic Paper (paired sources)
- Topic 2 = Conceptual Notes
- Topics 3, 5, 7, 9 = Transactional Writing prompts (Article, Speech, Letter, Leaflet)
- Topics 4, 6, 8, 10 = Practice Papers 2-5 (paired sources)

**Topic numbering — Literature texts + Edexcel IGCSE Language:**
- **Topic 1** = First essay — diagnostic + redraft phases inside
- **Topic 2** = Conceptual Notes
- **Topics 3-10+** = Development essays / anthology items

The bridge picker's `wml_topic` field maps each LD lesson (Write Essay / Assessment / Planning / Outlining / Polishing / Reassessment) to which Practice Paper or topic it belongs to.

---

## CURRENT BACKLOG

Live items moved to `~/.claude/handoffs/open/wml-backlog.md`. Read that file before starting standalone WML work to know what's queued.
