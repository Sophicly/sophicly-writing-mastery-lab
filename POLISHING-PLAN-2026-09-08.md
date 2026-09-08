# THE POLISHING LESSON — end-to-end plan (2026-09-08)

**Status:** plan only, agreed shape / open decisions marked. Nothing built.
**Becomes:** `PROTOCOL-STANDARD.md` **Part D — Polishing** (Parts A/B/C exist; polishing has no
standard anywhere, which is why every board's `protocol-c-polishing.md` is still a March-2026
monolith).
**Neil's ruling this plans against (FIXLIST #476, 2026-09-07, verbatim):**

> *"by that point, they should actually have a full answer written out. And all they're gonna do is
> just pick certain things that they might want to improve, that they're not happy with. And that's
> all it is. So they're just gonna highlight… they'll get that contextual chat, and then they'll
> just say what they wanna do with it."* … *"the goal is to try and help them get it to the gold
> standard level that we have in the protocols. But it's up to them to choose what they wanna work
> on."*

---

## 0 · THE HEADLINE: THIS IS MOSTLY A DELETION, NOT A BUILD

⭐ **The surface Neil described already exists and is live.** `frontend/wml-selection-chip.js`
(1,544 lines, v7.19.42+) is exactly *highlight → contextual chat → say what you want*: selection
echo, textarea, mic, send, **scope-filtered quick-action groups**, drag/resize/snap-back, replies in
the persistent Sophia panel. It already scopes its buttons by subject and text slug
(`tierScans` · `elementPolish` · `devices` · `polishProse` · `fixSpag` · `reference`, with a separate
CW ladder). The polishing preamble already injects `coaching-pedagogy-shared.md`
(`class-protocol-router.php:3517`) and already tells the model the essay is in the document.

**So the work is not "build a polishing environment". It is:**
1. **stop loading the thing that fights it** — `protocol-c-polishing.md`;
2. **give the lesson a target** — the gold standard, and the student's own assessment targets;
3. **decide the two things Neil raised** — how much help, and how much context per turn.

⛔ **The paste-wall is not a wording problem, it is a LOADING problem.** The preamble says *"SKIP
protocol steps 3-6"*, but the protocol loads **last** and dominates (WML `CLAUDE.md` §PROTOCOL ROUTER
PREAMBLE RULES §6), and the retained-source law (§5, proved at v7.20.250/.252) is our own measured
proof that **a fence loses to in-file text** — the model narrated a whole teaching chunk through an
explicit "do NOT deliver" instruction. Rewording Protocol C therefore does not fix it. The file must
stop being loaded, exactly as the CW polishing steps did at v7.20.578.

---

## 1 · THE CHAIN — five layers, all of them in scope

| # | layer | what it needs to be operable | state today |
|---|---|---|---|
| 1 | **Model input** (router) | essay polishing loads the inline-coaching stack + the subject's rubric + the lesson's target — NOT `protocol-c-polishing.md` | ⛔ loads the monolith |
| 2 | **Document** | the response is present and **editable** in this lesson (PEDAGOGY §6: Outline+Response editable in Outlining *and* Polishing); selection toolbar is the entry point | ✅ exists |
| 3 | **Coaching surface** | selection chip with essay-scoped quick actions, the help ladder, code-served buttons where the answer is deterministic | 🟡 exists, needs its action set + ladder order settled |
| 4 | **The target** | the student can see WHAT "better" means here: the gold standard for this question + their own assessment targets from Phase 1 | 🟡 the data exists (`target_1`, `target_2`, `strength_1` are persisted assessment elements; a `model_answer` lesson runs earlier in the sequence) — nothing surfaces it in polishing |
| 5 | **Orientation + exit** | how the lesson opens (what to do, one worked example, don't overthink), and how it ends (no task menu, Mark Complete in the footer) | ⛔ Protocol C ends with a task menu and *"update your workbook"* — the workbook does not exist |

---

## 2 · THE SHAPE PROPOSED (Part D, one page)

**A polishing lesson is an ENVIRONMENT, not a walk.** No steps, no sequence, no gate. The student
arrives with a finished response and leaves with a better one. Concretely:

1. **Opening turn (code-served, one bubble, §4b):** names the question, states that the response is
   theirs to improve, points at the two help surfaces, and gives ONE worked example of a
   before/after at this grain. Ends on the invitation, not on teaching.
2. **The student highlights.** Everything after the opening is student-initiated. There is no
   "next item" — this is the one lesson in the chain that is not serial (§18's discriminator: these
   are not N decisions each needing a verdict; it is one surface the student drives).
3. **Quick actions, scoped to the subject**, in the order we teach (macro → micro, §32a):
   does this paragraph do its job → is the evidence doing work → is the analysis deep enough →
   word choice → sentence variety → SPaG last.
4. **Sophia never writes the sentence.** She diagnoses, asks, and offers at most a micro-example in
   someone else's words. (§11, PEDAGOGY:766, and `inline-coaching-core.md` already say this.)
5. **The target is visible, not implied:** their own Phase-1 targets are shown as suggested starting
   points, and the gold standard for this question is one tap away.
6. **Exit:** no task menu, no workbook. Mark Complete lives in the footer (the settled ruling).

---

## 3 · THE TWO DECISIONS NEIL RAISED — with a recommendation each

### 3.1 How much help? ⚠️ WE HAVE THREE STANDARDS AND THEY DISAGREE

| standard | where | what it says |
|---|---|---|
| **The help ladder** | WML `CLAUDE.md` §4c.9 | rung 0 ask+example → rung 1 more examples → rung 2 guidance + technique card → **rung 3 Sophia (the only paid rung)** |
| **`coaching-pedagogy-shared.md`** | injected into every polishing session today | attempt-first → two contrasting worked examples → fade; STOP RULE; re-anchor |
| **Protocol C's own** | the monolith being retired | `STUCK_DETECT()` → `SUGGESTION_LIMIT(3)` → `FADE_HINTS()`; suggestions locked until stuck or "H" |

They agree in spirit (student attempts first, help escalates, Sophia never supplies the sentence) and
nothing says which governs.

**RECOMMENDATION — the help ladder governs, the coaching stack implements it.** The ladder is the
only one of the three that is about COST as well as pedagogy, and polishing is the lesson where a
student can tap forever. Concretely: every quick action answers from CODE or from the rubric where it
can; Sophia is the last rung and is visibly last. ⚠️ **The one thing the ladder must NOT strip:**
a turn that READS the student's own sentence is judgement, not help (§4b watch-it) — that is the
lesson's whole point and is never code-served.

### 3.2 Does every turn need the whole essay? — THE TOKEN QUESTION

**Not measured yet, and I will not estimate it.** What is known: the polishing preamble attaches the
full document (`[response]`, `[question]`, `[source]` on language papers) to **every** message, so on
a 20-mark essay with a source booklet the student's 40-word selection is a rounding error in the
payload — and the student is expected to tap many times.

**RECOMMENDATION — scope the context to the action, three tiers:**

| tier | what is sent | which actions |
|---|---|---|
| **none** | the selection only, answered by code | the deterministic scans (`was/were`, `-ly` adverbs) — already $0 since v7.20.585 |
| **local** | selection + its paragraph + the question + that element's criteria | word choice, sentence variety, "is this analysis deep enough", SPaG — **the majority of taps** |
| **whole** | + the full response | only the genuinely global asks: "does this paragraph serve my thesis", "is my argument consistent", conclusion work |

**Measure first, then build:** one instrumented polishing session, reading the real per-turn payload
size, before any tier is coded. (§19 — a fix built on an unverified cause is a guess.)

---

## 4 · BUILD ORDER, with a verify point per step

| # | step | verified by |
|---|---|---|
| 1 | **Measure** the current per-turn polishing payload on staging | the real number, from one driven session — not an estimate |
| 2 | **Router:** essay polishing loads the coaching stack + the subject's rubric + the target; `protocol-c-polishing.md` no longer loaded | a gate mirroring `bin/cw-polishing-env-gate.js`: the monolith is loadable by nobody, and every polishing task maps to a rubric that exists |
| 3 | **Rubric coverage** — ⚠️ `rubric-aqa-lit-*` and `rubric-nonfiction-lang` exist; **no P1-fiction rubric exists** and must be authored from the mark scheme (§2b provenance rules) | the gate above fails on a missing rubric |
| 4 | **Surface the target** — Phase-1 targets + the gold standard, in the document | present on a real staging lesson, and correct for the question |
| 5 | **Quick actions + opening turn**, context-tiered per 3.2 | one bubble per tap (§4b), liveness after every event (§4d), and the payload size per tier |
| 6 | **Live drive** — a real polishing lesson start to finish | the PORT SOP Phase-4 sign-off; nothing ships as done without it (§15) |
| 7 | **Port to the other boards** | the audit runner reports polishing per cell, as it now does for assessment/planning |

**Out of scope this cycle, named so it is not silently dropped:** CW polishing (already built and
governed by its own lens map); the other 24 unported board cells; retiring the blind walk (#472,
ruled, waiting on the ladder's live drive).

---

## 5 · WHAT WOULD MAKE THIS PLAN WRONG

- If the response is **not** reliably present at the polishing lesson for some board or question
  type, then step 2 of the chain is a stub and the whole environment is built on sand. **Check
  before building:** the outlining lesson's transfer-to-RESPONSE actually fires on each board.
- If Neil wants a **lens per lesson** after all (as CW has), then §2.2 changes from free choice to a
  named layer — his ruling says free choice, so free choice it is unless he says otherwise.
