# WML Planning Protocol — Audit & Research-Grounded Improvement Plan
**Scope:** AQA Language Paper 2 planning (`protocol-b-planning.md`) — the one codified planning protocol; the reference for the fan-out.
**Date:** 2026-07-18 · **Method:** 3 parallel Opus audits (protocol pedagogy · code mechanics · educational research). **Next:** Fable review → Neil ruling → build.
**Governing principle (Neil):** every design choice must trace to educational research wherever one exists; where none does, it is flagged as a judgement call, not dressed up as evidence.

---

## 0. VERDICT
**⭐ ENHANCEMENT, NOT A REBUILD (Neil, load-bearing framing).** The protocol's general shape is the product of *years* of Neil's refinement and is **already robust** — and the same is true across the whole protocol family. Everything in this plan is a **serious enhancement layered onto a strong base**; nothing here rewrites the core. Approach every build the same way: preserve the shape, sharpen it — do not "improve" what already works (CLAUDE.md §3 surgical, §13 copy-what-works).

**The general shape is good — confirmed, not just asserted.** Greeting, turn-by-turn forward motion, perceptive-first Socratic elicitation, the second-inference push, autofill-only-after-validation, and verbatim student ownership are all fully specified and match our standing rulings. The *engine* underneath (auto-file writer, technique picker, quick-action detection, technique deep-links, the programmatic pre-chain) is robust. The gaps are (a) a handful of protocol refinements, (b) one research-shaped upgrade — a **named scaffolding ladder** — and (c) two structural mechanics items. None require re-architecting; all are additive.

---

## 1. SOLID — DO NOT TOUCH (verified with evidence)
| Area | Evidence |
|---|---|
| Humanizing greeting (by name, cites stored goals verbatim) | protocol §2 L210–215 |
| Forward motion — every turn ends with the next action, never a dead "Filed." | Session law 8, L116–121 |
| Socratic push — perceptive-first, clue-word, on-demand breakdown, 2nd distinct inference | Beats 4–5, L359–388 (ports `feedback_socratic_inference_elicitation_research_backed`) |
| Autofill only past a validation checkpoint | filing mechanic L140–144 |
| Ownership / no-injection — student's **verbatim** words filed, no LLM round-trip | Ownership Law §1 L60–66; writer `_writeOutlineRowField` `wml-assessment.js:2414` (matches BOTH `outlineRow`+`inputField`), bi-pipeline (`:12956`, `:22499`) |
| Technique picker — roster generated from the taught table, persists by code not label | `_showTechniquePicker` `:1135`, `WML_TECHNIQUES` `:1109` |
| Technique deep-links in chat — `@RESOURCE_LINK`/`SWML_LEARN` chips, canonical-validated, open a return-preserving overlay scrolled to the technique | `wml-core.js:3394–3448` |
| Programmatic pre-chain (greeting→reflect→headline→plan-mode→predictions) is code-driven, not LLM | `_planPreChainStageFor` `:761` |
| Expert-insight budget exists = **max 3 per SESSION** (not per question) | Law 7, L86–115 |

---

## 2. THE RESEARCH SPINE — a named 4-rung contingent scaffolding ladder
This is the centrepiece: it converts our per-beat prose scaffolding into ONE research-backed ladder every question inherits, and it answers Neil's core question ("how hard do we push before we help, and how does the weakest student still produce something?").

**The ladder (mirrors AutoTutor's validated Expectation-&-Misconception-Tailored dialogue — Graesser et al.):**
| Rung | Move | Research basis |
|---|---|---|
| **L1 — Open Socratic prompt** | "What does this suggest?" (AutoTutor PUMP). Always start here. | ZPD start-low (Vygotsky 1978); productive struggle (Kapur; D'Mello & Graesser on confusion) |
| **L2 — Focused hint** | Narrow to a clue word ("look at the verb 'crept'…"). Add specificity. | Contingent-shift: increase control only after a failure (Wood & Middleton 1975; Wood et al. 1978); mid-assistance is optimal (Koedinger & Aleven 2007) |
| **L3 — LENS menu (angles, NOT readings)** ⭐ | Offer 3 *angles/lenses* to read through — "which does '⟨their quote⟩' open: A) the writer's attitude · B) who is affected & how · C) what it implies about the wider situation?" Student picks the lens, then **still generates the inference through it**. A bounded recognition step that never hands over the idea. | Completion effect (Renkl; van Merriënboer) — bound the search space; **Ownership Law: METHOD-menus sanctioned, CONTENT-menus (a reading of THIS text) banned** |
| **L4 — Worked model on an UNRELATED instance → apply the METHOD to their OWN quote (same element)** ⭐ | Model the move on a domain UNRELATED to today's sources (the mechanism the protocol already sanctions, so it never hands over THIS reading), reasoning visible; the student then applies the *method* to their own quote — **THEIR application files the box**. Last resort: swap the thin quote, or accept a modest OWNED answer (planning never marks — an owned Grade-5 beats an injected Grade-9). | Bottom-out hint (VanLehn 2006); worked-example→completion→transfer (Renkl); Ownership Law |

**The Goldilocks zone (the reason the ladder exists).** The design deliberately lives in the MIDDLE. Research on the *assistance dilemma* (Koedinger & Aleven 2007) places optimal learning at an **intermediate** point — mid-level *partial* support empirically beats BOTH full worked examples (too much help → shallow processing, effort + self-regulation drop) AND no help (too little → floundering → frustration). L2 (hint) and L3 (options) ARE that partial support; L1 and L4 are the guard-rails we escalate *between*, not where most learning should happen. "Not too much, not too little, at the right time" is the whole game.

**TWO REGIMES — the ladder governs FAILURE only (Fable, critical — do not merge these):** *(⚠️ SUPERSEDED by §11: it is now THREE regimes — WRONG · FAILED · WEAK — with stated precedence. Read §11.1 decision tree before building.)*
- **Weak-but-OWNED answer** (the student produced something of their own, just surface-level): **ONE Socratic push for depth, then accept their choice.** UNCHANGED settled law (Session Law 1; `feedback_socratic_inference_elicitation_research_backed` "one push then fade"). Do NOT escalate an owned answer up the ladder — that turns "respect their choice" into "wear them down."
- **FAILURE** (empty · off-track · "I don't know" — nothing ownable produced): **the ladder runs.**

**Escalation rule (research-backed):**
- **Climb exactly ONE rung per genuine failed attempt** (Wood's contingent-shift — one attempt per rung, NO "3 tries per rung"; 4 rungs = a ~4-turn ceiling by construction. One-attempt-per-rung and 3-tries-per-rung cannot both hold — the latter is 12 turns = session death, `feedback_deep_but_never_dragging_pace_principle`).
- **Every failed turn must visibly CHANGE the help level** — never re-ask the same question reworded (that breeds frustration + hint-abuse; Aleven & Koedinger: ~72% of help-seeking was unproductive).
- **IDK gate:** a bare "I don't know" earns the CURRENT rung's help, but the climb to the NEXT rung is gated on a genuine micro-attempt at this one — so a student can't IDK-spam straight to L4.
- **Per-question pace valve:** if the ladder resolved at L3+ on ~3 elements in a question, later elements in THAT question open at **L2** (tighter), not L1 — the student's ZPD is known; re-probing from L1 every element is responsiveness-theatre that drags. **Typical resolution should be ≤2 turns; ~4 is the ceiling, not the norm.**
- **FADE per element-TYPE, not per adjacent element:** resolving *effects* at L3 predicts the next *effects*, not the next *topic sentence*. And the cheapest, zero-injection scaffold of all — **from paragraph 2 onward, the first hint points at the student's OWN paragraph-1 version** ("look how you built Effect 1 for 'grinding poverty' — same move here"). Self-worked-example, faster than any rung (van de Pol 2010; expertise-reversal — never force a capable student down).
- **Redraft uses the student's OWN data FIRST (PEDAGOGY §1 — help ∝ instruction received):** in a redraft the L2 hint reaches for their Planning Targets / prior assessment feedback ("your Target 1 was inferences beyond the obvious…") BEFORE a generic clue-word. This also auto-differentiates diagnostic-planning (no data → generic L2) from redraft-planning, no new rule needed.

**Affect at the bottom rungs (Fable):** frame every rung-descent as a change of ANGLE, never remediation ("let's come at it from another side" — never "since you're stuck"); an element resolved at L3/L4 still gets the grade-9 line-of-sight ("that lens IS what a Level-4 inference looks like"); after an L4, the next same-type element opens with a confidence bridge ("you built the last one — same move").

**Resume:** fade memory resets conservatively — restart an element at L1/L2 on resume, never mid-ladder (the filed/unfiled fields tell you WHERE you are; §9).

**Why this is the low-ability guarantee (ownership-safe):** the LENS + worked-model rungs bound the search space and turn an impossible *recall* task into an achievable *recognition-then-generate* task, so even a grade-1 student produces an **OWNED** element every time — they pick the angle and generate through it; they apply the method to their own quote. Recognition of an ANGLE is a scaffold; recognition of a READING would be injection — the ladder stays on the method side of that line.

**Key citations:** Wood, Bruner & Ross (1976); Wood & Middleton (1975)/Wood et al. (1978); Vygotsky (1978); van de Pol et al. (2010); Koedinger & Aleven (2007); VanLehn (2006, 2011); Graesser et al. (AutoTutor EMT); Aleven & Koedinger (help-seeking); Sweller & Cooper (1985); Renkl (1997/2002); Kalyuga et al. (expertise-reversal); van Merriënboer (completion); Kapur (productive failure); D'Mello & Graesser (confusion).

### 2.1 Serving the FULL ability range (grade 1 → grade 7) — one ladder, met at a different rung
Students arrive anywhere from **grade 1** (real — we get them) to **grade 7**; the bulk sit at **grade 4–6**. We do NOT build separate modes per ability — the rung a student RESTS at IS the differentiation, and the fade rule self-calibrates without us pre-labelling anyone:
- **Grade 7 / strong:** live almost entirely at **L1** (open prompt) — they generate perceptive readings unaided. Forcing them down the ladder would HARM them (expertise-reversal, Kalyuga et al. — worked support that helps novices hurts experts). Never push a capable student to options.
- **Grade 4–6 / the bulk:** resolve at **L1→L2** (open prompt, then a clue-word hint). This is the Goldilocks middle the whole design targets.
- **Grade 1–3 / struggling:** reach **L3 options / L4 near-give+apply** and ALWAYS produce via recognition/completion rather than blank recall (worked-example + completion effect for novices, Sweller/Renkl). This is the floor that guarantees a grade-1 student never sits stuck with an empty box.
The **contingent-shift + fade** rules ARE the differentiation engine: each student is met at the rung they need THIS turn and started one rung higher next time (van de Pol 2010; ZPD, Vygotsky) — the system finds each student's level instead of us guessing it.

### 2.2 ⭐ UNIVERSAL BY DESIGN — one ladder, EVERY question type (Neil 2026-07-18)
This is the standard for **all** planning protocols, not AQA Lang P2. Split the ladder into two layers:
- **UNIVERSAL (codify ONCE in `PROTOCOL-STANDARD.md`, every protocol inherits):** the four rungs (open→hint→options→model+apply), the one-rung-per-failed-attempt escalation, the ~3/rung + ~4-turn ceiling, the "every failed turn must change the help level" rule, the failure-detector (empty / off-track / "I don't know"), the fade, the ability-range calibration, and the ownership guard (options let the student CHOOSE + rephrase; L4 makes them APPLY — never inject the idea).
- **PER-QUESTION-TYPE (authored in each protocol):** the RUNG CONTENT — what an L3 "option" and an L4 "model" actually are for THAT element. A perceptive inference, a synthesis point, a comparative link, a story beat, and a persuasive image each need their own option-menus and model-and-apply, but they climb the SAME ladder.

**It must cover every question type** (a survey is being produced — see the appended QUESTION-TYPE SURVEY):
retrieval/list (no planning — excluded), single-source analysis (TTECEA/inference), **synthesis** (infer differences across two sources — AQA P2 Q2), comparative analysis (AO3), evaluation (AO4), literature essay (multi-AO, extract + whole-text), two-part (a)/(b), creative **fiction** (story-spine / 7-step scene), creative **non-fiction** / transactional (IUMVCC). The universal layer is identical for all; only the rung content changes.

---

## 3. GAPS & FIXES (prioritised; each tagged to its audit finding)

### P1 — Scaffolding ladder (research upgrade; the big pedagogy win)
- **3.1 Codify the UNIVERSAL ladder into BOTH `PROTOCOL-STANDARD.md` AND `PEDAGOGY.md`** (PEDAGOGY §1 governs any scaffold/hint/optionality rule — a scaffolding ruling with no home in the WHY layer gets re-derived wrongly). Codify the universal layer (§2.2): four rungs, one-attempt-per-rung escalation, the two regimes, the IDK gate, fade-per-type, affect framing, and the **method-not-content line**. **In the SAME build, rewrite the protocol's existing per-beat scaffolding prose AS instances of the ladder** — never two scaffolding vocabularies in one monolith (CLAUDE.md §7). Ship **grep-able B-checks**: the regime split (weak-owned ≠ failed) and the method-not-content rule, so no future port can reintroduce a readings menu. *(A3.)*
- **3.2 CLARIFY the two regimes — do NOT replace the one-push law (Fable correction).** "One push then accept" (weak-but-owned) and the ladder (failure) govern DIFFERENT situations — not a contradiction to average away (CLAUDE.md §7). Law 7's "2–3 attempts" is an *insight-deploy trigger*, not a scaffolding cap — leave it. Rewrite as a regime clarification, not a replacement. *(A4, corrected.)*
- **3.3 Give Q2 inference an L3 LENS floor (angles, NOT readings).** Q2 = the AO1 perceptive-inference question, where the protocol most fiercely guards the reading; its floor must be a LENS menu, never candidate readings. State the failure-ownership boundary so scaffolds don't stack: **quote-quality failure → the existing swap mechanic** (one-clarify-one-swap, already capped); **idea-generation failure → the ladder**. *(A2 + low-ability guarantee, corrected.)*
- **3.3b Redraft L2 pulls the student's own Planning Targets / prior feedback first** (PEDAGOGY §1). *(Fable change 9.)*

### P2 — Close the loop (cheap, student-facing, prevents real confusion)
- **3.4 Add two closing lines to the protocol's final review:** (a) "mark this lesson complete to move on"; (b) "your plan is now editable only through this chat — you'll edit the outline and the response directly in the next lessons." *(fixes A1.)*
- **3.5 (decision) Chat "mark complete" quick-action.** Optional: a chat button that completes the LearnDash planning lesson. Today Mark Complete is button-only and absent from planning (`:10908`), and planning-lesson completion is LearnDash-native in the embedded env. *Needs a Neil ruling — is a chat-driven complete wanted, or is the sidebar/LearnDash button enough?* *(B3.)*

### P3 — Structural mechanics (bigger; feed the fan-out)
- **3.6 Port a code progression gate to planning.** Assessment has a robust self-healing gate (`@REFLECT_GATE` / "Got it — continue", `:2772`); planning Q2→Q3→Q4→Q5 has **no code gate** — it's 100% LLM after the pre-chain, so a drifting model can skip/loop a question with nothing to catch it. Port the assessment gate pattern. *(B1.)*
- **3.7 Fan-out `@FIELD_COMMIT` to the other reading-Q planning protocols.** The auto-file engine is solid but only `aqa/language2` feeds it — every other board's Q2/Q3/Q4 planning emits **zero**, so their outline boxes never fill. This is the roadmap's planning fan-out; the ladder (§2) + the new key-match harness make it safe to run. *(B2; already roadmap item 3.)*

### P4 — Polish
- **3.8 Expert-insight code counter.** The "max 3/session" cap is LLM-self-counted (no code enforcement) — reliable short-session, drifts long-session. Consider a code counter. *(A5.)*
- **3.9 Library in-app slide-in + per-source deep-links.** Technique deep-links are excellent; the Library is a generic `/library/` in a new tab (`:12053`), non-specific, no return. Mirror the CW-guide slide-in reader (`wml-core.js:106`) for per-source Library reading. *(B4.)*
- **3.10 Auto-scroll-on-fill hardening.** Works, but a fixed 400 ms timer with a swallowed failure, running for all tasks (`:2395`). Gate to planning + use a settled-pass rather than a fixed delay. Low severity. *(B5.)*

---

## 4. RECOMMENDED SEQUENCING
1. ~~Fable review~~ **✅ DONE (2026-07-18)** — *yes-with-changes*; all corrections folded in above (lens-not-readings, two regimes, one-attempt-per-rung, fade-per-type, affect, resume, PEDAGOGY registration, B-checks).
2. **Question-type SURVEY** (in progress) — map the universal ladder's rung CONTENT to every question type. Appended when ready.
3. **Neil ruling** on the open decisions → build **P1 + P2** into the AQA P2 protocol + PROTOCOL-STANDARD + PEDAGOGY (the ladder is the reusable asset), guarded by the outline-rule + planning-key-match harnesses.
4. **P3 as its own arc** (planning progression gate + `@FIELD_COMMIT` fan-out) — ladder-first (Fable): don't fan out the current inconsistent prose then re-fan the ladder.
5. **P4 polish** opportunistically.

**OPEN DECISIONS — Fable's recommendations (Neil to ratify):**
- **3.5 chat mark-complete → NO (recommend).** Ship §3.4's two closing lines only. A chat→LearnDash completion write adds a cross-system key/API path (the plugin's #1 bug class) for zero pedagogical gain; completion is an LMS act the sidebar/LD button already owns.
- **~4-turn ceiling → KEEP as a ceiling, not the norm.** Holds only with one-attempt-per-rung. Typical resolution ≤2; the per-question pace valve prevents drag.
- **L3 options earned vs always-available → EARNED (firmly).** On-demand only ("break down ON DEMAND, never pre-emptively"). Always-available tier = the resource chips (Toolkit/Table = METHOD help, self-serve). Same method-vs-content line.
- **P3.6 planning gate → BUILD** (A16 programmatic-first mandates it). **P4.8 insight counter → cheapest ("insights used N/3" in context) or defer.** **P3.7 fan-out → ladder-first.**

---

## 5. ROBUSTNESS & SAFE-STATE (Neil 2026-07-18) — the conditional logic MUST be code-owned; sessions MUST survive interruption
*The §2 ladder has a lot of conditional state. "Sounds good" is not "works reliably." We've been burned by LLM-tracked stateful logic before (the expert-insight cap is already unreliable because it's self-counted). This section makes it robust. Architecture being detailed by an Opus engineering pass against the real persistence + state-machine code.*

### 5.1 The ladder's STATE is CODE-owned; the LLM only executes the move (A16 programmatic-first)
If the model has to REMEMBER rung-per-element-type + attempt counts + the pace valve ("resolved at L3+ on ~3 elements → open next at L2") + fade memory + insight budget across a long session, **it will drift** — the exact class of bug we've hit. So:
- **CODE owns the STATE** — a small planning-state machine tracks, per element: current rung, attempts, resolved-at-rung, plus the per-question pace counter and insight count. Deterministic transitions each turn (mirror `_planPreChainStageFor` + the assessment progression gate that already self-heals).
- **The LLM owns the DIALOGUE only** — given "you're at L2 for this element," it writes the hint; it NEVER decides when to escalate — code tells it the rung.
- **Fail-loud** — if state and doc disagree, warn + self-heal (never guess).
- **Testable** — a harness can drive the state machine end-to-end, so the whole ladder is auditable instead of trusted. This also makes the insight counter (P4.8) fall out for free.

### 5.2 SAFE-STATE — planning is long; students often WON'T finish in one session
A student can leave mid-question, mid-element, mid-ladder (parent calls, timeout, they close the tab). Requirement: **resume seamlessly, exactly where they left off, never losing filed work.**
- **Filed work already persists** — every `@FIELD_COMMIT` writes the canvas doc, which autosaves (forward-snapshot). Survives today.
- **The GAP: the ladder/pace/fade state is conversational** → lost on resume. Design options: (a) persist a small planning-state blob beside the canvas doc (server meta, key-match traced — the plugin's #1 bug is key drift, so byte-trace it); or (b) derive position from the filed/unfiled fields where possible (§9 already reads position this way). Prefer (b) where derivable, (a) for what isn't.
- **Conservative resume (Fable):** restart the current element at L1/L2 on resume — never resume mid-ladder — so a stale rung can't strand a student.
- **Ship gate:** verify the round-trip (save → leave → reload → resume) on the real interruption, not just in theory.

---

## 6. QUESTION-TYPE SURVEY — the universal ladder mapped to every planning shape
*Sources: `PROTOCOL-QUESTION-STRUCTURE-MAP.md` (element sets), `language-/literature-paper-specs.json` (AOs/marks/splits), `protocol-b-planning.md` (the one built protocol). Only the **rung CONTENT** below is per-type; every rule around it (§2) is universal.*

| # | Type (example) | Planning? | Element set | Built? |
|---|---|---|---|---|
| A | Retrieval / list / MCQ / true-false — AQA P1 Q1, P2 Q1 | **NO** (right-or-wrong recall, nothing to plan) | — | n/a |
| B | Single-source close analysis (TTECEA, single-AO) — AQA P1 Q2/Q3, IGCSE Q4, Eduqas reading | YES | Body-only ×N¶: TS · T+E+I · Close Analysis · Effect 1 · Effect 2 · Author's Purpose (all stamped the one AO) | Unbuilt (only AQA P2 Q3) |
| C | **Synthesis / cross-source inference** (AO1) — AQA P2 Q2 | YES | 2¶ paired Source-A→Source-B inference (NOT TTECEA) | **BUILT** |
| D | Comparative (AO3) — AQA P2 Q4; IGCSE Q5 | YES | TTECEA, **one effect PER SOURCE** + comparative markers + comparative evaluation | AQA P2 Q4 BUILT; IGCSE unbuilt |
| E | Evaluation (AO4) — AQA P1 Q4; Eduqas C1 Q5 | YES | TTECEA stamped AO4 + evaluative stance | Unbuilt |
| F | Literature essay (multi-AO) — extract + whole-text | YES | Full essay: Intro(Hook·Building·3-pt Thesis) + N×TTECEA(+Context if AO3) + Conclusion(Restated Thesis·Controlling Concept·Purpose·Universal Message) | Unbuilt |
| G | Two-part (a)/(b) — Edexcel/Eduqas Shakespeare & 19th-C | YES ×2 | (a) AO2 extract analysis · (b) AO1(+AO3) whole-text — same scaffold, **different AO regime + evidence source** | Unbuilt |
| H | Creative FICTION (story-spine) — P1 Q5 | YES (holistic beats) | Pixar 6-beat spine; no per-¶ mark | Unbuilt (**CW lifecycle still TBD**) |
| I | Creative NON-FICTION / transactional (IUMVCC) — AQA P2 Q5 | YES | Intro·Urgency·**Method (2–3 points)**·Vision·Counter·Conclusion | **BUILT** |

**Per-type L3 LENS menu + L4 unrelated-model (the rung content to author):**
- **B analysis** — hardest = Effect on Reader. Lenses: A) emotion felt · B) picture built · C) what the reader realises. L4: model T→E→I→Effect on an unrelated sentence ("United *crushed* City").
- **C synthesis** ⚠ — hardest = "the difference the pair states". Lenses (max abstraction): A) the writers' attitude · B) what each focuses on · C) the situation each describes. L4: model a difference on an unrelated pair (two restaurant reviews). *Never name THIS pair's difference.*
- **D comparative** — hardest = the comparative link. Lenses: A) same method/different effect · B) different method/same purpose · C) one text intensifies/undercuts the other. L4: two rival adverts.
- **E evaluation** — hardest = a stance beyond agree/disagree. Lenses: A) how far the method succeeds · B) which audience it works for · C) a limitation/trade-off. L4: "is a film's jump-scare effective?".
- **F lit essay** — hardest = 3-pt Thesis + Context. Thesis lenses: A) what the writer argues · B) the journey across your 3 points · C) the uniting concept. Context lenses: A) the era's belief the moment reflects · B) how an original audience reacts · C) the social pressure on the character. L4: 3-pt thesis on a well-known film.
- **G two-part** — hardest = the AO switch between (a) method/AO2 and (b) argument+context/AO1; the ladder must retune, not reuse (a)'s lenses. L4 (b): tracking a hero across a film trilogy.
- **H fiction** ⚠ — hardest = the "One day" turning point + show-not-tell. Lenses: A) what the reader SEES first · B) mood (weather/light/sound) · C) hook type. L4: the 6-beat spine on an unrelated prompt (a lost dog). *Highest ownership risk — model on a fully separate prompt, never draft a line of their scene.*
- **I transactional** — hardest = the Methodology points. Lenses: A) the emotional appeal · B) the image family · C) the objection to pre-empt. L4: one section on an unrelated motion (school uniform).

**Universal vs per-type:** everything in §2 (rungs, escalation, two regimes, IDK gate, fade-per-type, ability calibration, ownership/method-not-content, the two B-checks) lives ONCE in PROTOCOL-STANDARD + PEDAGOGY. Only the lens/model CONTENT above is authored per protocol.

**The 3 hardest to keep ownership-clean:** (1) **Synthesis** — the graded object IS the difference, so any lens naming *which* difference injects the answer; stay at maximum abstraction. (2) **Creative fiction** — no source to lens against, so a concrete option edges toward writing their story; lenses must be *categories* (visual/mood/hook), never instances. (3) **Lit context/thesis** — a context lens collapses into handing the AO3 point; frame as *where to look*, never the reading.

**Fan-out build order** (ladder-first, by shared element-shape not board): 1) universal layer + retrofit AQA P2 as reference; 2) **single-source TTECEA (B)** — bedrock, unlocks the most questions; 3) comparative (D) then evaluation (E) — TTECEA adapters; 4) lit essay (F) + two-part (G); 5) **creative fiction (H) LAST** (highest ownership risk + lifecycle TBD). IUMVCC (I) needs only the ladder-prose retrofit. Byte-trace every `@FIELD_COMMIT` pair before shipping (key-mismatch = #1 bug; only aqa/language2 emits today).

---

## 7. ARCHITECTURE — code-owned ladder state + safe resume (Opus engineering pass, 2026-07-18)
*Detailing §5.1 + §5.2 against the REAL persistence + state-machine code. All file:line refer to `frontend/wml-assessment.js` unless noted. Design principle throughout: mirror the two proven state-derivation engines already in the file — `_planPreChainStageFor` (state lives in CHAT HISTORY, no stored blob, :761) and the granular sidebar (state lives in the FILED DOC, :817 `_planDocQuestionFacts`) — and add nothing a harness can't drive.*

### 7A — CODE-OWNED LADDER STATE (details §5.1)

**7A.1 — The state the ladder needs (per element / per question / per session).**
| # | State | Grain | Meaning |
|---|---|---|---|
| a | `resolved` (element done, off-ladder) | element | a `@FIELD_COMMIT` filed this element's box |
| b | `currentRung` (L1–L4) | element (active) | which move to play THIS turn |
| c | `attemptsThisRun` | element (active) | genuine failed attempts on this element SINCE the last load/run boundary |
| d | `regime` (`owned-push` \| `failure`) | turn | which of the two §2 regimes governs this turn |
| e | `idkPending` | element (active) | a bare "I don't know" earned help but the climb is gated on a micro-attempt |
| f | `paceResolvedL3plus` | question | count of this question's elements that resolved at L3+ (drives the L2 pace valve) |
| g | `fadeByType` | element-TYPE | the rung the SAME element-type last resolved at (opens the next same-type element tighter) |
| h | `insightBudget` | session/doc | count of L4 worked-models spent (the P4.8 cap that is unreliable today because it is LLM-self-counted) |

**7A.2 — DERIVE almost everything; store nothing new. (This is the headline recommendation.)**
Every item above is DERIVABLE from the two existing sources of truth, so **no new server-meta blob is required** — the §5.2(a) option is explicitly NOT recommended for v1. Mechanism: ride the code-owned message-metadata channel that already exists. `canvasChatHistory.push({ role:'assistant', content: plain, beat: _beat })` (:11990, :12026) already round-trips arbitrary per-message fields to the server chat meta via `saveCanvasChat(history, chatId)` (:10552, 8s debounce + `beforeunload` keepalive). CODE (never the LLM) stamps each ladder turn with `ladder:{ el, rung, regime, verdict }` on that pushed message — the same shape as `beat`, so it persists with zero schema change.

- **(a) resolved** — DERIVED from the DOC: the element's `@FIELD_COMMIT`ed box holds text. This is the §9 position-from-filed-fields read the sidebar already does. A filed box short-circuits the ladder exactly as `_planPreChainStageFor` short-circuits on `askedBy(/@FIELD_COMMIT|Inference 1 \(Source A\)|anchor quote/i)` (:766).
- **active element** — DERIVED: first UNFILED required field in question order (same doc scan as `_planDocQuestionFacts` :817 + `data-section-label` :806).
- **(b/c) rung + attempts** — DERIVED from HISTORY: scan `canvasChatHistory` for `ladder:{}` markers on the active element with index ≥ the run-start boundary (see 7B.3). `currentRung = fadeBase(type) + attemptsThisRun` (capped at 4). This is the exact "count what the assistant has already asked" derivation `_planPreChainStageFor` uses, moved from content-regex to a code-stamped field (content regex is too lossy to encode "this was L2").
- **(f) pace** / **(g) fade** / **(h) insight** — DERIVED by aggregating the same `ladder:{}` markers across the persisted history: pace = markers on THIS question's now-filed elements with `rung≥3`; fade = last `rung` on a filed sibling of the same element-type; insight = count of `rung===4` markers (session/doc-scoped, NOT run-scoped — see open Q3).

**Why derive, not store:** a stored mutable counter the LLM updates is the exact drift class §5.1 names (the "already unreliable self-counted insight cap"). A stored counter that only CODE updates still forks from the doc on any partial-save/double-mount. Deriving from the two authoritative persisted stores (doc + history) means the state is *reconstructed* every turn and cannot desync — identical to why the pre-chain has no blob. Minimal-stored-state verdict: **zero new meta keys; zero new blob.**

**7A.3 — The code↔LLM boundary (how code TELLS the rung; how code DETECTS the outcome).**
- **TELL = preamble injection (code owns the number).** Mirror the protocol-router preamble assembly (`inject_session_context`, `class-protocol-router.php`, preamble→skip→protocol, WML CLAUDE.md §PREAMBLE). Each turn code prepends a ~4-line block: *"Active element: `<label>`. Regime: FAILURE. Play RUNG L2 — one focused clue-word hint on the student's quote '`<quote>`'. Do NOT escalate, do NOT give the reading, do NOT emit an option menu."* The LLM writes ONLY the dialogue (§5.1). No echoed rung marker is needed for TELL — code already knows the number; it stamps it onto the reply metadata itself (7A.2) for its own later derivation.
- **DETECT = the failure-detector `_planLadderClassify(studentMsg, aiReply)`** — a HYBRID mirroring the two proven detectors:
  1. **Deterministic (code, no LLM):** empty / whitespace, or IDK-regex (`/^\s*(i (really )?)?(don'?t|do ?n[o']t|dunno|idk|no idea|not sure)\b|^\s*\?+\s*$/i`), or below a min-chars floor → `verdict='failed'` (+ set `idkPending` on the IDK branch). Runs on `_planChainNorm`-stripped text (:737) per the byte-pair markdown rule.
  2. **LLM judgment-marker (the non-trivial resolved-vs-weak split):** the AI emits a tiny content-free signal `@ELEMENT_JUDGE{"el":"X","verdict":"resolved|weak|failed"}` — the EXACT `@FIELD_COMMIT` pattern (:2466, "tiny judgment-only signal … carries NO text, so a missed/garbled signal degrades gracefully"). Classification is a sanctioned LLM use (universal CLAUDE.md §6); routing/counting stays in code.
  3. **Advance:** `resolved` → the LLM also emits `@FIELD_COMMIT` → `applyFieldCommits` (:2466) files the VERBATIM student words → element off-ladder. `weak` → `owned-push` regime (§2: ONE Socratic push, do NOT climb). `failed` → climb exactly one rung (gated by `idkPending`: an IDK cannot climb until a real micro-attempt clears the flag).
  - **Name:** `_planLadderStageFor(history, doc)` (rung/element derivation, twin of `_planPreChainStageFor`); `_planLadderClassify(studentMsg, aiReply)` (the failure-detector); marker `@ELEMENT_JUDGE`.

**7A.4 — Self-heal + fail-loud on state/doc disagreement (mirror the @REFLECT_GATE gate).**
The gate at :2786/:6491 re-renders its own panel when the model loops or drops the marker, and `console.warn`s (:6608, :6632) rather than failing silent. Apply the same three healers:
1. **DOC WINS over history.** If markers say element X is at L3 but X's box is filled → X is resolved; ignore the stale markers, advance to the next unfiled element, `console.warn('WML ladder: doc/history disagree — filed box wins for '+X)`. (Same shape as the pre-chain's filed-field short-circuit.)
2. **Dropped `@ELEMENT_JUDGE` self-heal:** if the reply has `@FIELD_COMMIT` but no verdict → infer `resolved` (the file IS the resolution). If neither marker and the message is non-trivial → default `weak`/`owned-push` (the SAFE default: never auto-escalates, never wears the student down), `console.warn` once.
3. **Rung ceiling + circuit-breaker:** `currentRung` is `Math.min(4, …)`; if the derivation would emit >1 escalation in a single turn, clamp to +1 and warn (mirrors the `_derivedCardFillOk` >50-fills/sec breaker, WML CLAUDE.md §PROSEMIRROR-5).

**7A.5 — Build-time harness `bin/planning-ladder-harness.js` (mirror `bin/outline-rule-harness.js` + `bin/planning-keymatch-harness.js`).**
Slice `_planLadderStageFor` + `_planLadderClassify` + `fadeBase` out of `wml-assessment.js` by bracket-balance and `vm.runInContext` (the exact method `outline-rule-harness.js` uses — runs the CHANGED code, never a reimplementation). Drive synthetic `{history, doc, studentMsg}` fixtures asserting the emitted `{rung, regime, verdict}` for every transition:
- L1→L2→L3→L4 on repeated `failed`; **one-rung-per-attempt** (never +2), **L4 ceiling** (never L5).
- **IDK gate:** IDK at L2 stays L2 (help given, no climb) until a micro-attempt, THEN climbs.
- **Two regimes:** a `weak` owned answer produces `owned-push` and does NOT climb (the "don't wear them down" guard).
- **Pace valve:** after 3 same-question elements resolve at rung≥3, the next element opens at L2 not L1.
- **Fade-by-type:** an `effects` element resolving at L3 lowers the next `effects` base but NOT the next `topic-sentence`.
- **Resolve short-circuit:** a filed box makes the element inert regardless of stale L3 markers (the doc-wins healer).
- **Self-heal:** `@FIELD_COMMIT` present, `@ELEMENT_JUDGE` absent → `resolved`; both absent + non-trivial → `weak`.
- **Insight budget:** N×L4 across the session decrements the derived budget to 0 and the (N+1)th L4 is refused.
Wire into `bin/pre-ship-check.sh` beside the existing outline + planning-keymatch gates. This is the §5.1 "auditable instead of trusted" requirement, and makes P4.8's insight counter (7A.1h) fall out for free.

### 7B — SAFE SAVE/RESUME (details §5.2)

**7B.1 — What survives today vs what is lost.**
- **Survives (doc):** every `@FIELD_COMMIT` → `_writeOutlineRowField` (:2414) → `saveCanvasContent` (:37464): instant localStorage (:37+, key `CANVAS_SAVE_KEY()` :10444) + debounced server POST `API.canvasSave` → `save_canvas` (`class-rest-api.php`:2080) → `update_user_meta($uid, canvas_meta_key(...), wp_slash(wp_json_encode($doc)))` (:2307, key builder :5051). Forward-snapshot, `beforeunload` keepalive flush (:37689). **Filed elements are safe.**
- **Survives (history) — IF we stamp it:** `canvasChatHistory` persists via `saveCanvasChat` → server chat meta (8s debounce + `beforeunload`). Because the `ladder:{}` metadata rides the message object (7A.2), **the ladder/pace/fade/insight state persists with the history** — it is NOT lost. §5.2's "conversational state is lost" is true ONLY if the state lives in the LLM's memory; stamping it into persisted history closes that gap without a blob.
- **Genuinely lost = nothing structural.** The single lossy case is an EXPLICIT chat-clear (the "start over" button, :clearCanvasChat, or stale-detection discard) which deliberately wipes history — and there, restarting the ladder at L1 is the CORRECT behaviour, not a defect.

**7B.2 — Resume design: derive-from-doc, no blob (recommended); blob shape if ever needed.**
On resume, `loadCanvasContent` (:37786) hydrates the doc and `loadCanvasChat` (:10575) the history BEFORE the first ladder turn (same ordering the pre-chain relies on). `_planLadderStageFor` then re-derives: active element = first unfiled box (doc); fade base = filed-sibling markers (history); attempts = 0 (run boundary, 7B.3). **No new persistence.**
- **IF a stored blob is ever mandated** (only if Neil wants ladder state to survive an explicit chat-clear — open Q3): do NOT mint a new meta key (key-drift is the #1 bug). Piggyback a `planningLadder` field onto the EXISTING canvas save body (:37565, beside `sectionData`/`planningMode`) so it lands in the SAME `swml_canvas_…` doc under the SAME `canvas_meta_key`, written with the same `wp_slash(wp_json_encode())` at :2307. One key, byte-traced by construction. **Recommended: don't — derive instead.**

**7B.3 — Conservative-resume enforcement (restart current element at L1/L2, never mid-ladder).**
Use the codebase's proven run-scoped-vs-cross-run split (ref `reference_wml_run_scoped_captures_vs_cross_run_doc`; the same reason `_resetPlanningPredictions` treats predictions as per-run). At mount, set a non-persisted module local `_ladderRunStartIndex = canvasChatHistory.length`. `attemptsThisRun` counts ONLY `ladder:{}` markers with index ≥ that boundary → **0 on every fresh load** → `currentRung = fadeBase(type) + 0`, i.e. the active element restarts at its fade base (L1, or L2 if a same-type filed sibling resolved hard — see open Q1). Fade/pace/insight, being doc-lifetime aggregates, are NOT reset. This gives "restart at L1/L2, never mid-ladder" mechanically, with no flag the LLM can get wrong.

**7B.4 — Ship-gate round-trip test (the real interruption, not theory).**
1. Start planning; file elements 1–2 of Q-para-1 (`@FIELD_COMMIT` → boxes hold text). Take element 3 to L2 (one `failed` turn).
2. Hard-reload the lesson (and separately: SPA-nav away and back).
3. ASSERT: elements 1–2 still filled; element 3 is the active element and **opens at L1** (not mid-L2); history shows no duplicated turns; console shows **no** `doc/history disagree` warn.
4. 2nd-device variant: clear localStorage, reload → server chat + server doc rehydrate → identical result (proves the derive-from-persisted-history path, not a localStorage crutch).
5. Mid-file interruption: emit a `@FIELD_COMMIT`, then close the tab inside the debounce window → reload → box is filled (keepalive flush) OR element is cleanly re-active (graceful, never corrupt).
Run the full `WML-SMOKE-TEST.md` planning matrix too (both chat pipelines).

**7B.5 — Edge cases.**
- **Mid-`@FIELD_COMMIT` interruption:** the marker carries no partial state; `_writeOutlineRowField` is atomic per box; worst case cross-device is one unfiled element → it is simply the active element again → ladder restarts it. No corruption.
- **Double-mount / SPA-nav:** derivation is a PURE function of doc+history → re-mount re-derives the same rung (no double-increment — another reason to derive not store). The cross-lesson save guard (`_swmlBuiltForPost`, :37) and single-boot `__swmlBooted` already prevent writing the outgoing editor to the incoming key.
- **Stale tab:** a stale nonce 403s the save (ref `reference_sophicly_spa_tab_nonce_expiry_403_storm`); ladder state lives in doc+history, so a reload (which refreshes the nonce) fully restores it — no ladder-specific handling.
- **2nd device:** server chat meta + server canvas doc both load → full history+doc → correct re-derivation. The localStorage `__ts` freshness stamp (:37+, newest-wins) already arbitrates local-vs-server.

**7C — OPEN QUESTIONS (need a Neil / Fable / Opus decision).**
1. **Fade base on resume — L1 always, or L2 when a same-type sibling resolved at L3+?** §2 says "restart at L1/L2" but not which when. Recommend L1 default, L2 only if a filed same-type sibling in THIS doc last resolved at rung≥3 (derivable). Pedagogy calibration → Fable/Neil.
2. **`@ELEMENT_JUDGE` weak-vs-failed is the ONE LLM-judgment dependency in the loop** (the two-regime split hinges on it). It degrades to `weak`/`owned-push` (safe) on ambiguity — confirm that safe-default is acceptable, or whether a borderline case should instead re-ask before classifying.
3. **Insight budget scope: per-session or per-document-lifetime?** Determines whether `insightBudget` counts run-scoped or across the whole doc's history (affects 7A.2/7B.3). Also: does ladder state need to survive an EXPLICIT chat-clear? If yes → the 7B.2 piggyback blob; if no (recommended) → pure derive.

---

## 8. CONTEXT & CONCEPT-DRIVEN UNDERSTANDING (Neil 2026-07-18) — interpretation must be KNOWLEDGE-driven, never plucked from thin air
*Also serves Neil's opening ask — **strong consistency**: TTECEA + this context flow are reused everywhere, adapted per AO. (Research grounding + protocol verification pending an Opus pass — this section is Neil's requirement captured verbatim-in-intent.)*

### 8.1 The principle — concepts DERIVE from understanding of the text's context
Students build **context-driven concepts**: their interpretations grow OUT of understanding where the text comes from (its period, its ideas, the writer's world), never random guesses. A random, ungrounded interpretation earns no marks and **shouldn't** — examiners reward interpretation built on knowledge, not "any reading will do." Holds for EVERY literature question and every anthology text, whether or not context is formally assessed. This is the antidote to the "as long as I give an interpretation I get marks" misconception that produces weak, random readings.

### 8.2 The reality — students arrive with shallow, narrow, un-nuanced context
The vast majority know almost nothing, and lack **depth, breadth AND nuance** — all three. *Macbeth exemplar:* most cite only "divine right of kings"; on the witches, "everyone believed in witches," and stop. Typically absent: the **medieval SETTING** (Holinshed's Chronicles → medieval Scotland), the **feudal system** and how it drives the play, the **Renaissance / early-modern** period, **Machiavelli**, and Shakespeare's **techniques** (e.g. antithesis). Design must assume near-zero and build up.

### 8.3 The design — ASK-FIRST, then build knowledge (the §2 ladder applied to CONTEXT)
Same not-too-much/not-too-little discipline, with a knowledge-building rung set:
- **ASK FIRST** — "what do you know about [the period / this belief / the writer's world]?" Activate prior knowledge; assume shallow; never lecture first.
- **Scaffold the GAP:** **Expert insight** (a targeted fact, within the 3/session budget) → **Library READING** (the distinctive context rung — send them to a source to READ and build real knowledge, then return) → **derive the CONCEPT** ("now — how does the feudal order shape Macbeth's crime?"). We supply the *knowledge*; the student forms the *interpretation* (ownership preserved).
- Target depth + breadth + nuance — not one fact repeated. **This makes the Library pedagogically central** (reading IS the knowledge-building act) — elevates gap B4 (in-app Library slide-in + per-source deep-links) from polish to core.

### 8.4 Output rule — assessed → into the plan; not-assessed → known but NOT output
- **Context ASSESSED** (AQA lit throughout — Shakespeare, modern, 19th-C, poetry anthology; Edexcel IGCSE lit AO4=context): the context concept **IS a planned element** → outputs into the PLAN and the OUTLINE (the Context row, §6 type F).
- **Context NOT assessed** (Eduqas modern text; other non-context lit Qs; AQA/Edexcel **language** anthologies): STILL question them on context and STILL make them derive ideas from it — **same process** — but it is **NOT output** as a plan element. Tell the student explicitly: *"you're not assessed on context here, but you must understand where this text comes from — it's what stops your interpretations being random."* (Protocols already gesture at this — e.g. Eduqas.)
- **Judicious-context caveat (not-assessed):** a little highly-relevant, specific context in the essay is fine (examiners won't penalise it), but heavy context where it's not assessed gets **CAPPED** — so any context that surfaces must be specific + judicious, never a context essay.

### 8.5 The exceptions
- **Unseen poetry / unseen language:** we CANNOT ask about context (no known provenance). At most prompt some general ideas about the situation/voice — no context knowledge-building.
- **Edexcel IGCSE anthology:** they HAVE an anthology → they should read up on the authors. Heavy context thinking (knowledge-building via reading) so they can derive ideas from it — even where the language anthology doesn't assess it.

### 8.6 Build approach — AQA to GOLD STANDARD first, then borrow
AQA (context assessed throughout) is the cleanest place to perfect the context knowledge-building flow → get it gold-standard, then borrow as much as possible for every other board/text (assessed or not). Consistency is the goal: one context flow, adapted per AO, everywhere.

### 8.7 Research grounding + protocol reality (Opus-verified 2026-07-18)
**Research (strong backing):** ask-first = prior-knowledge activation (**Ausubel 1968** "the most important single factor influencing learning is what the learner already knows"; schema — **Bransford & Johnson 1972**). Interpretation needs background knowledge: **Willingham 2009**; **Recht & Leslie 1988** (the *baseball study* — domain knowledge beat general reading skill); **Hirsch** (knowledge deficit); **Kintsch** situation-model (no domain knowledge → no situation model → an "interpretation" is a guess, not an inference — the spine of §8.1). Build-not-tell = generative learning (**Fiorella & Mayer 2015**) + elaborative interrogation (**Pressley 1987; Dunlosky 2013**) + read-then-retrieve (**Karpicke**). TIMING = **pre-training principle (Mayer 2009; Sweller)** — build context BEFORE the interpretation step to protect a novice's working memory, and don't flood (the 3-insight budget). Full research → `research/2026-07-18-context-knowledge-and-concept-driven-interpretation.md`.
**The ONE judgement call (flag honestly):** "an ungrounded interpretation earns no marks and *shouldn't*" is an **assessment-validity STANCE** (keyed to GCSE examiner reward), not a lab finding — reader-response (Rosenblatt 1978) legitimises reader-generated meaning; research only proves grounded readings are *higher-quality / higher-inference*. Frame it as a design decision, not evidence.
**Protocol reality — most of this ALREADY EXISTS (⭐ enhancement, not rebuild):** the ask-first → expert-insight (DYK) → derive-concept flow is built in `protocols/shared/literature/modules/conceptual-notes/cn-section-2-context.md`; the causal context→concept validation is `context-drive-check.md` (board-agnostic — "essential even if not assessed"); **Eduqas modern already states the not-assessed build-but-withhold rule verbatim** (`protocols/eduqas/modern/planning/b5-bodies.md:304` + runs CONTEXT_DRIVE_CHECK); AQA per-text context bank exists (`knowledge-text-context-banks.md`, 13 texts: dated fact + "Drives the concept" + quote anchor + critics).
**Spec correction:** **Eduqas Shakespeare ALSO does NOT assess context** (AO1+AO2+AO4-SPaG — Neil didn't flag it; spec confirms). Add to §8.4/8.5 not-assessed list. (All other Neil claims verified against the specs.)
**⭐ TOP-3 genuinely-NEW build items (everything else already exists):**
1. **The Library-READING rung is net-new.** Today's "expert insight" is a DYK fact injection; there is NO "send the student to a Library source to READ, then return and derive" rung. It's the rung research rates highest (read-to-learn + retrieval, Karpicke). Build it as an escalation rung, not a subsystem.
2. **Author the deep Macbeth context.** Neil's flagship items — **Holinshed/medieval setting, feudal system, Machiavelli/Renaissance statecraft, antithesis** — are **ABSENT from the AQA context bank** (Gunpowder Plot / James I / Divine Right / Great Chain ARE present + strong). So §8.6's "AQA to gold standard first" **starts with CONTENT authoring** (add each as dated fact + "Drives the concept" + quote anchor — the bank's existing template), not wiring.
3. **Unify context under the §2 ladder + ONE shared output-gate.** Context logic is currently spread across `context-drive-check` + CN Section 2 + per-protocol body-Step-7, each restating the assessed/not-assessed rule → drift risk (#1 bug class). Fold into the universal ladder + one gate so every board inherits it.

---

## 9. HELP AGENCY & CORRECTIONS (Neil 2026-07-18) — research pending
*Research pass in flight (help-seeking + corrective feedback). Ideas captured; design provisional.*

### 9.1 Student-CALLABLE expert insights (agency + a budget they SPEND)
A pushed "go read about X" gets ignored; a scarce resource the student *chooses* to spend gets used. Idea: give the student a **limited budget of expert insights they personally call** — a "Give me an expert insight" button — capped **per question or per paper**. Agency + scarcity → engagement.
- Sits ALONGSIDE the system-pushed insight (Law 7, max 3/session) — decide: separate student budget vs one shared spendable budget; per-question vs per-paper cap.
- **Research angle (help-seeking):** student-initiated help is a metacognitive skill; agency raises engagement, but *free* help breeds abuse (Aleven & Koedinger, already cited). A **capped, spendable** budget is the sweet spot — help as a resource, not a reflex.
- **Robustness:** the budget is CODE-counted (§7) — never LLM-self-counted (the current cap's weakness).

### 9.2 Struggle → a HELP-TYPE menu (agency over HOW they're helped)
On detected struggle, offer a small choice of help TYPE via quick-action buttons — e.g. **"Explain further · Ask me more questions · Give me an expert insight."** The ladder's escalation made VISIBLE + student-chosen, within the earned-not-free discipline (appears on struggle, not always). Uses the quick-action infra that already works in planning.
- **Open question:** does student-chosen help mode OVERRIDE the code's contingent-shift rung, or feed it? (Research: learner-control vs system-control — the assistance dilemma has a learner-control dimension.)

### 9.3 CORRECTIONS — the protocol should not be AFRAID to correct, done right
Today the protocol leans Socratic/accepting (one-push-then-accept) — correct for weak-but-*valid*, but a genuinely **WRONG** answer (a misread, a false context claim, a misidentified technique) needs correcting, not accepting — accepting it *teaches the error*.
- **Adds a THIRD regime to §2:** weak-but-owned (push then accept) · failure/empty (ladder) · **WRONG (a definite error → correct it).** A misidentified technique isn't "weak," it's incorrect.
- **HOW (research pending):** name the error specifically + the correction + why, without demotivating; growth-mindset / "wise feedback" framing; correct the ERROR, not the student; immediate for factual/technique errors; never a bare "wrong."
- **Ownership caveat:** correcting a factual/technique error is NOT injection (a fact is a fact). Correcting an INTERPRETATION is trickier — correct the *reasoning/grounding*, don't impose your reading (ties to §8: a grounded reading that isn't yours stands; an ungrounded one gets questioned).

### 9.4 Research grounding + recommendations (Opus-verified 2026-07-18)
Research → `research/2026-07-18-help-seeking-and-corrective-feedback.md`.
**Help agency (9.1/9.2):** help-seeking is a metacognitive skill — shape toward INSTRUMENTAL (a hint to then succeed), not EXECUTIVE (the answer to dodge work) — Nelson-Le Gall (1981/85). Free help is abused (~72% unproductive, Aleven & Koedinger); a scarce SPENDABLE resource converts reflex→decision. Novices choose help BADLY → **SHARED control** (Corbalan, Kester & Kirschner 2008): the student picks WITHIN a code-bounded set, never overrides the rung. Chosen > pushed for engagement (Deci & Ryan autonomy; Patall 2008 choice meta-analysis — **2–4 options** is the sweet spot).
- **Recommendations:** (a) default stays system-PUSH; student-PULL is a bounded overlay that **FEEDS** the code's rung logic, never replaces it (**answers 9.2's open Q — the menu feeds the rung, doesn't override; the IDK-gate micro-attempt still gates L4**). (b) **ONE SHARED code-counted budget, not two** — pool student-pull + the Law-7 system-push into one "near-give" counter (a separate student budget could stack to over-help; a shared pool also *rewards* independence). (c) Cap = **per-question sub-cap of 1**, under a **per-paper ceiling (~3–4)**. (d) The "expert insight" menu option = L3/L4, draws from the shared budget; **"explain further" (re-hint) + "ask me more questions" (stay Socratic) are FREE**. Menu appears on detected struggle only. (e) Frame the spend as agency ("want me to spend one of your expert insights here?").
**Corrections (9.3) — the WRONG regime:** target TASK/PROCESS, **NEVER SELF** (Hattie & Timperley 2007; Kluger & DeNisi 1996 — >⅓ of feedback HARMS when self-directed). Never a bare "wrong" — elaborated + response-specific (Shute 2008). Errors-as-learning protect motivation (Yeager "wise feedback" 2014; Dweck; Metcalfe). **Hypercorrection — confident errors are corrected BEST; don't soften a confident-and-wrong answer.**
- **Recommendation — WRONG fires ONLY on a VERIFIABLE error** (misread of the text · false context/biographical fact · misidentified technique) — NOT a weak-but-valid interpretation (→ one-push regime) or empty/off-track (→ ladder). Discriminator: *is the claim falsifiable against the text or established fact?* **FORM (always 3 parts):** (1) name the error specifically · (2) why · (3) the fix. **FRAMING:** correct the error not the student; wise-feedback pair (high standard + "you'll catch this every time now"). **INTERPRETATION CAVEAT (ownership):** if it's an interpretation not a fact, correct the GROUNDING not the reading ("what in the line makes you say menacing?" — not "it isn't menacing"). **Ship a grep-able B-check** that WRONG keys on a falsifiable-error detector, never on interpretive content.
- **Judgement calls:** exact per-paper ceiling (3 vs 4); the confident-vs-low-confidence framing assumes confidence detection — default all corrections to wise-feedback framing if not cheaply detectable.

---

## 10. UNIVERSAL "LAST-ATTEMPT RECAP" on the greeting/start card (Neil 2026-07-18 — captured idea, SEPARATE build)
A dynamic, universal recap at the foot of the greeting/start card for **every quiz, assessment, AND planning start**:
- **First attempt:** "This is your first attempt." · **Returning / restart:** "Last attempt: X / total · Y% · Grade Z" for THIS text.
- **Data:** reads the SAME durable student-data record the dashboard reads (latest completed attempt for the text/lesson) via the shared score→%→grade helper — never a divergent copy (two-sources-drift = recurring bug).
- **Planning caveat (planning never marks):** a planning greeting shows the last **ASSESSMENT** grade for that text (the thing being redrafted) — *"Your last assessment: Grade 5 — this redraft is how you beat it."* A strong motivational tie-in: the redraft gets a target.
- **Brand:** OUR style, NOT the green-terminal "beat your score" arcade reference (off-brand). Purple accent, Proxima, the calm canvas dark surface-ladder. Scholarly, not gamified.
- **Framing (ties §9 wise-feedback + the no-gamification / real-stats-are-the-motivator rulings):** growth-framed ("last time 5 — let's push past it"), never a bare low grade that deflates. Real stats ARE the motivator; a returning student primed to beat their best serves deliberate practice.
- **Universal + dynamic:** ONE component, reads state, renders first-vs-returning — every quiz/assessment/planning greeting inherits it.
**Scope:** cross-surface (quiz engine + assessment + planning greeting), a SEPARATE build from the P1/P2/P3 planning work. Captured here so it isn't lost.
**Reference design (Neil):** `Quiz App.html` — the stat-strip layout to adapt (10 QUESTIONS / 15s / 70 HIGH SCORE). Port the LAYOUT, re-skin to brand (its green-terminal look is OFF-brand — CLAUDE.md §13: copy the structure, change what's named).

---

## 11. ⭐⭐ DEEP FABLE REVIEW — corrections to FOLD before build (2026-07-18). VERDICT: yes-with-changes.
*The base is buildable as one system, but the newer sections (§7/§8/§9) drifted from the older ones. Apply changes 1–10 at build time; several correct earlier sections (noted inline). This section is the authority where it conflicts with §2/§7/§8/§9 above.*

### 11.1 The single-turn DECISION TREE (the spine the plan was missing)
Two axes the plan smeared together: a **classification** axis (what did the turn produce?) and a **track** axis (method-help vs knowledge-help).
```
CODE derives (doc + stamped history): active element · fade-adjusted rung base · content-insight WALLET · pace valve
PRE-TRAINING (§8, at question/text OPEN, NOT under the element ceiling): ask-first → [gap] insight (SPENDS wallet) → Library reading → student derives concept.
STUDENT TURN on the active element:
  0. Deterministic (code): empty / IDK-regex / min-chars → verdict=failed (IDK sets idkPending; next-rung climb gated on a micro-attempt)
  1. LLM @ELEMENT_JUDGE → verdict ∈ {wrong, resolved, weak, failed}   PRECEDENCE: wrong FIRST, then the rest.
  • WRONG  (verifiable: misread of the words · false context/bio fact · misidentified technique) → 3-part correction (name·why·fix), wise-framing, FREE, NO rung climb, NO attempt increment → re-invite at CURRENT rung. (false CONTEXT fact → repair may hand to §8.)
  • FAILED (nothing ownable) → climb EXACTLY ONE rung → L1→L4. L4 = worked model on an UNRELATED instance: EARNED, UNBUDGETED, one per element (resolution ends it).
  • WEAK-but-owned → ONE Socratic push, then accept + file. Never enters the ladder.
  • RESOLVED → @FIELD_COMMIT (verbatim) → element off-ladder → next opens at its fade base.
  • HELP MENU (§9.2, only on verdict=failed): "Explain further" FREE (max 1/rung) · "Ask more questions" FREE · "Expert insight" SPENDS the wallet. NONE moves the rung — only contingent shift moves the rung.
```
The probe case (*confidently-wrong reading grounded in a false context fact*) resolves ONLY under this tree: judge fires **WRONG on the fact** → correct hard (hypercorrection) → question the now-ungrounded reading's **grounding**, never the reading → if the student then flounders, that's a **knowledge-deficit** failure → §8 knowledge move, not an L3 lens.

### 11.2 The changes (fold all 10)
1. **[§2/§7A.3/§9.3] State regime PRECEDENCE: WRONG → FAILED → WEAK/RESOLVED, and REDEFINE "off-track."** "off-track" = *non-engagement with the question* (drift), NOT "incorrect." An incorrect ANSWER is `wrong` (falsifiable) or `weak` (interpretive), never `failed`. (Most-certain re-derivation risk if unstated.)
2. **⭐ [§7/§9.4/§2 — the ONE hard contradiction] Un-merge the content-insight budget from L4.** §7 budgeting L4 (refuse the (N+1)th) KILLS §2's low-ability guarantee (a grade-1 needs L4 far more than 3–4×/paper). TWO counters: **(i) content-insight WALLET** (Law-7 push + §9.1 pull + §8 insights) — code-counted, per-Q sub-cap 1, per-paper ceiling **3**; **(ii) L4 method models — UNCAPPED, earned-only, never refused** (naturally bounded at one per element). The spendable thing is FACTS, never MODELS. (§3.2 already had this right; §7/§9 drifted.) Marker gains `kind:'insight'|'model'|'hint'` + `source:'push'|'pull'`.
3. **[§8.3] §8 is a PARALLEL KNOWLEDGE track run as PRE-TRAINING, not "the §2 ladder applied to context."** Method-deficit (hint→lens→model) vs knowledge-deficit (fact→reading). Kintsch: no lens fixes a missing situation model. Run ask→insight→read→derive at question/text OPEN (as `cn-section-2-context.md` already does — enhancement confirmed), carrying §2's discipline but NOT its 4-turn ceiling (a reading detour would blow it). Mid-element it surfaces only as a WRONG-correction of a false fact or a spent insight.
4. **[§7A.3/A.5] `@ELEMENT_JUDGE` = FOUR verdicts** (`resolved|weak|failed|wrong`); `wrong` does NOT increment attempts; self-heal default stays `weak`. **Pin the marker schema byte-exact NOW: `ladder:{el,rung,regime,verdict,kind,source}`** — it's a write-key↔read-key contract (#1 bug class). Add WRONG + wallet-vs-L4 fixtures to the harness.
5. **[§2/§3.1] Amend §2's header TWO REGIMES → THREE (+ precedence) in the same edit**; §3.1's PROTOCOL-STANDARD/PEDAGOGY codification carries: three regimes + precedence, the method-vs-knowledge two-track split, the wallet/L4 separation, the WRONG falsifiability B-check. One vocabulary, stated once (CLAUDE.md §7).
6. **[§7B/7C-Q3] Content wallet scope = per-DOCUMENT-lifetime, derive-don't-store; resume must NOT refill (reload-farming); an explicit chat-clear resets it — ACCEPT for v1** (clearing chat also destroys fade memory + progress, so the exploit self-punishes). L4 uncapped.
7. **[§9.2] Bound "Explain further" at ONCE per rung** (free+unlimited re-explain is the hint-refresh stall Aleven & Koedinger warn of), then collapse to "ask more questions" or a real attempt.
8. **[§8.7 item 3] Re-sequence the context-logic unification AFTER the AQA gold-standard arc** — folding `context-drive-check` + CN §2 + body-Step-7 into one gate touches `protocols/shared/` (all boards; WML critical rule 2) = the one rebuild-adjacent item. Right goal, own consolidation arc, no behaviour change.
9. **[§8, B-check] Fact-delivery guard:** an insight/correction supplies the fact WITHOUT stating the inference it licenses about the live quote ("Machiavelli argued rulers feign virtue — now look at 'innocent flower'" is a reading delivered as a fact). Decouple fact from the live quote mid-planning.
10. **[§7A.1] Add the Library-reading OPEN/return to the state table** (`ladder:{kind:'reading'}` on the surrounding turn) — else the knowledge track can't self-locate on resume.

### 11.3 ⭐ THE OWNERSHIP PRINCIPLE (stated once — all of §2/§8/§9 reduce to this)
> **The student owns every interpretive claim about this text. The tutor may freely supply METHOD (how to think: hints, lenses, models on UNRELATED material) and verifiable FACT (what is true about the words, the writer, the period — including correcting the student's false facts); the tutor may NEVER supply a READING (what this text means), and may challenge a reading only through its GROUNDING.**
Method-side = §2 L3/L4. Fact-side proactive = §8. Fact-side reactive = §9 corrections. Only leak points: change 9 (a fact that entails the reading) and a §6 menu naming *content* ("the writer's bitterness") not a *direction* ("the writer's attitude") — the drafted §6 menus pass; the 3 flagged high-risk types (synthesis, fiction, lit-context) are correctly identified.

### 11.4 Open-decision updates (supersede §4 where they differ)
- §4's four: concur. **AMENDMENT: P4.8 insight counter is now REQUIRED (load-bearing for §9's wallet), not "cheapest-or-defer."**
- Resume fade base: L1 default, L2 only when a filed same-type sibling resolved at ≥L3. · Judge safe-default `weak`: accept (no re-ask step). · Wallet scope: per-doc-lifetime, derive, no blob. · L4: uncapped. · §9.2 override-vs-feed: **feed** (change 2 mostly dissolves it — no menu option touches the rung). · Per-paper ceiling: **3** (matches Law-7 — don't relitigate). · Corrections: default ALL to wise-feedback framing (skip confidence detection).
- Residual "knowledge-deficit vs method-deficit mid-element": rule for v1 = **post-pre-training failures are METHOD failures** (simplest robust).

**§1 (SOLID) is untouched by all of the above. Fold 1–10 → the plan is buildable as one coherent system.**
