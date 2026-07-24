# PROTOCOL-STANDARD.md — the contract every WML protocol must meet (v2)

**What this is:** the codified gold standard for WML assessment (Part B) and planning (Part C)
protocols, plus the **PORT SOP** — the mechanical checklist for converting any board/paper to the
standard. **Before touching ANY assessment or planning protocol, read this file. It is the
acceptance bar. A protocol change that fails its checks does not ship.**

**v2 (2026-07-03, Neil ruling): the standard has TWO NAMED GOLD ANCHORS.** Every port copies from
the nearer anchor — never from memory, never from an older port:

| Anchor | File | Covers |
|---|---|---|
| **LANGUAGE** | `protocols/aqa/language1/modules/protocol-a-assessment.md` (as of v7.19.852) | multi-question papers — unit = QUESTION, sub-unit = paragraph; Section B/extended writing holistic |
| **LIT** | `protocols/aqa/literature/modules/protocol-a-assessment.md` (the R&J standard) | single-essay papers — unit = SECTION (Intro / Body 1–3 / Conclusion), TTECEA+C |

**Poetry comparison questions are NOT a third anchor** (Neil, 2026-07-03): most poetry questions
compare two poems but keep the five-paragraph essay structure — they use the LIT anchor plus the
COMPARISON VARIANT (§B-LIT.4).

**ANCHOR DEMOTION (Neil ruling, 2026-07-07): AQA Language Paper 1 is THE gold standard — the
LIT/R&J protocol is NO LONGER a trusted reference until re-audited against it.** Facts: the "R&J"
protocol is the AQA **Shakespeare** protocol (R&J is the text), and AQA serves Shakespeare, modern
texts and 19th-century through the SAME literature protocol — so its quality level propagates to
every AQA lit text. It predates most of the v900→v934 hardening. Rule: ports of essay-family
papers may still take the essay SHAPE (unit = section, TTECEA+C) from the lit protocol, but every
element must be VERIFIED against the P1 anchor's rules and this standard — never copied on trust.
**QUEUED (next lane-A arc): full audit of protocols/aqa/literature/ against the P1 gold standard
+ ASSESSMENT-MECHANICS**, same method as the P2 port (recon → B-CHECKS → one-template audit →
delta → fix batch).

- Part A = universal invariants (apply to BOTH assessment and planning).
- Part B = the assessment spec: B-COMMON (the invariant spine, both anchors) → B-LANG → B-LIT
  (incl. comparison variant) → B-CHECKS (grep table).
- PORT SOP = the three-way ENGINE / PROTOCOL / CONFIG split + the phased playbook.
- Part C = the planning spec: C-COMMON (the settled spine) → C-LADDER (the universal
  contingent-scaffolding ladder every planning protocol inherits) → C-CHECKS (grep table). Anchor =
  the P2 planning monolith. Grows with the codify arc (outline contract + ownership map).
- Appendices = P1 first-live-run lessons (items 1–14, still binding) + known-gap register.

Authority order when documents conflict: Neil's latest decision > this file > the anchor files.
When you change this file, note WHY in the changelog at the bottom.

---

# PART A — UNIVERSAL INVARIANTS

## A1. Gate or it didn't happen (THE core invariant)
An instruction with no enforcement mechanism is a WISH, not a step. Live evidence: the keyword-recall
checkpoint and main-goal question existed as polite prose for months and silently never fired; every
gated step fired reliably. **Every mandatory step must chain to one of the four proven mechanisms:**

1. **Marker panel** (`@REFLECT_GATE{...}` etc.) — structural: frontend renders an interactive panel;
   the student's combined reply is a detectable artifact in the conversation.
2. **HARD PRECONDITION block** — before acting, the model must verify a NAMED artifact from an earlier
   turn exists in the conversation ("the reply arrives as 'Self-rating: N/5 …' — if absent, go back,
   emit the missing step, STOP"). Chain steps so each gate names the artifact of the previous one.
3. **HARD STOP turn-split** — "your turn ENDS on that line"; the next content requires a student
   keypress (type **Y**). Separates reflection from marks, prevents same-turn skipping.
4. **4-button progression gate** — exact literal strings `[✓ Got it — continue]` `[🤔 Still confused]`
   `[💬 Different question]` `[⏸ Pause here]` (frontend hard-codes detection). Emitted ONCE per unit,
   only when the turn contains ALL required artifacts (listed in the precondition); anti-loop rule:
   after ✓, the next message MUST begin the next unit's STEP 1 — never re-emit a confirmed gate.

When you add a new mandatory step, write its gate in the same edit. A step without a gate is a bug.
**Escalation path (sessions 5–10 lesson): every observed drift gets its gate CODE-OWNED same-day** —
the prose gate is the first line, the engine gate is the net (see A14).

## A2. Markers are the API
Function-calling is disabled — text markers + deterministic frontend extraction are the only channel
(`reference_wml_function_calling_disabled_use_markers`). Emission rules, always: marker on its OWN line,
no code block, no backticks, nothing after it on the line; `q`/`title` labels EXACTLY from the unit's
allowed set; JSON keys exactly as specified. The frontend contract (§B-COMMON.12) lists every marker the
canvas consumes. Never invent a new marker without wiring the frontend first (that's a cross-lane ask).

## A3. Anti-fabrication (penalties + evidence)
A penalty MUST quote the offending phrase **verbatim from THAT unit's submitted text**. Cannot find it
verbatim → the fault does not exist there → no penalty. 0 penalties is a valid outcome; never fill slots.
Protocol example phrases are FORMAT templates — never present one as the student's writing.

**CRITERION EVIDENCE (Neil, 2026-07-02 — universal, every assessed paper):** the same standard applies to
CRITERION scoring, not just penalties. Every criterion scored below full worth must be anchored in the
My Assessment prose either by (a) quoting the student's verbatim phrase that shows the shortfall — e.g.
for "surface-level, no word-level zoom", quote the analysis sentence that stayed surface-level and name
the word they failed to zoom into — or (b) stating the element is entirely absent ("no effects sentence
exists — nothing to quote"). A judgment without the evidence it judges is unusable feedback. The mark
table's Why column stays ≤10 words; the evidence lives in My Assessment. Every board's
`protocol-a-assessment.md` must carry this rule (both anchors carry it — replicate on every port).

## A4. Never invent mark-scheme claims
Level descriptors, band names, mark allocations: quoted from the REAL board mark scheme only
(`feedback_never_invent_mark_scheme_claims`). No descriptor available in the protocol's reference
sections → don't cite one ("no descriptor available" — never fabricate). Same for AO definitions
(e.g. Edexcel IGCSE AO4 = Context, NOT SPaG; Edexcel IGCSE Spec A writing AOs = AO4+AO5, same criteria
as AQA AO5/AO6 under different names). Source: Neil's mark-scheme PDFs on Drive
("Sophicly Etch Mark Scheme Resources/"), extracted verbatim into the paper's
`knowledge-mark-scheme-<paper>.md`, tagged with source + page.

## A5. Output hygiene — never show your working
All mark arithmetic is internal. No visible calculation, recalculation, rounding narration, running sums,
or mid-reply self-corrections. Output finished values only. **One carve-out (Neil, 2026-07-01):** the
word-count penalty/ceiling MAY display its formula — students should see exactly how it is derived
(on Language papers the numbers themselves arrive CODE-COMPUTED; the model echoes them — §B-LANG.4).
Everything else: silent. Penalties are APPLIED-ONLY: a considered-but-rejected penalty is internal
deliberation and never appears; never cite the protocol in student-facing feedback (no "(protocol: …)").

## A6. Numbers have ONE source of truth — and since v7.19.832 that source is CODE
Totals, percentages, grades are COMPUTED BY CODE; the model echoes, never derives. The engine
(universal, both pipelines — `frontend/wml-assessment.js`, v7.19.832–852) recomputes every feedback
card's total from its own `Worth | Your Score` table minus its `Total penalties:` line and corrects
mismatches (bonus `+X` scores accepted since 851); re-bands every %/grade line on the canonical ladder;
rebuilds the Penalty & Ceiling Ledger from the actual cards; verifies question/final totals; strips
forbidden "Base total:" lines (852). **The code is the net, not the excuse** — protocols still state
the rules, and must keep the AUDITABLE SHAPES the engine parses (A14).

- **Rounding happens exactly ONCE** — at the question total (Language) / final total (Lit). Sub-unit
  totals stay DECIMAL: never round a paragraph/section total, no "→ rounded" suffix, no "Base total:"
  line.
- **WC penalty = CEILING, never a deduction (Neil, 2026-07-02 — SETTLED, universal):** an under-length
  piece already loses marks organically; the penalty lowers the MAXIMUM achievable (`MIN(sum, max −
  penalty)`); the sum is never reduced. Doc Score Summary + Auto grade chip apply the same MIN.
- **One ladder everywhere:** every grade output — per-unit "Percentage & Grade" lines AND the final
  grade — bands on the SAME canonical Sophicly ladder (9 ≥ 85 · 8 ≥ 75 · 7 ≥ 65 · 6 ≥ 55 · 5 ≥ 45 ·
  4 ≥ 35 · 3 ≥ 25 · 2 ≥ 15 · else 1). NEVER real-exam boundaries anywhere. Code-enforced since 832;
  protocols still state the ladder (grep: "CANONICAL GRADE LADDER").
- Chat total, Overall Feedback and Score Summary must derive from the same whole-mark unit totals —
  identical wherever they appear.

## A7. Golds are never shortened
Every gold/model rewrite is COMPLETE (full sentence/paragraph counts per unit spec), every time, both
models, all units (`feedback_never_shorten_model_answers`). "..." or "continue in this style" = violation.

## A8. Deterministic structure mapping + hard caps
Map student work to canvas units by POSITION with a hard cap equal to the box count — never re-select,
re-order, or invent new unit labels. Paragraphs arrive PRE-LABELLED by code (v807) — trust the labels,
never re-detect. Overflow content is acknowledged in prose (Final Summary teaching note) but NEVER gets
a marker/box/unit mark. (Live evidence: a 7-paragraph essay pushed the model past the cap; it filed
"Body Paragraph 5" into Body 2's box, destroying real feedback.)

## A9. One question per turn; options render as buttons
Ask exactly one thing, wait. Multi-option asks use lettered options (quick-action detection renders
them); the 4-button gate strings are byte-exact. Never two questions in a turn — the second dies.
Since v7.19.852 the frontend sends the FULL label ("A) Paragraph 1"), not the bare letter, so the
model cannot mismap the choice — protocols must keep option labels self-describing.

## A10. Protocol separation
Assessment never asks for rewrites/new content (that's Planning/Polishing). Planning never marks.
Cross-references between protocols go through the menu handoff, not inline blending.

## A11. Scope behaviour by capability, never by literal task/board name
The #1 recurring bug class (see WML CLAUDE.md "CANVAS TASK-SCOPING"): behaviour gated on a name string
silently no-ops for every sibling. In protocol text, board-specific rules carry an explicit BOARD-GATE
note stating the capability condition (e.g. "applies when the question assesses AO3(context)"), not a
bare board name — so replication to other boards forces a conscious keep/adapt decision. In engine
code, prefer capability lookups (`WML.isLanguageSubject()`) over subject-literal lists; where a literal
list is unavoidable it is a REGISTERED PORT SURFACE (PORT SOP §E2) that every port must extend.

## A12. House language
British English. The AI is **Sophia**. Banned: "Units" for sub-parts, "1-to-1" (except platinum Assessment
Review), "crib", "shows" as analytical verb (it's a PENALTY — F1), arrows (→) in student-facing model
answers, "patriarchy/patriarchal", magic/spellbook framing, "move" as a noun. Scholarly, calm, encouraging.

## A13. Golds follow the taught sentence order — rigidly (Neil, 2026-07-02)
Students copy gold models as templates: a gold that deviates from the taught structure UNTEACHES the
method even when it would score full marks. Every gold (BOTH models, EVERY unit, EVERY assessed
protocol — language, literature, poetry, Shakespeare, modern) follows that paper's taught sentence order
exactly. For lit essays (TTECEA+C): (1) conceptual-ONLY topic sentence — **no technique words in the
topic sentence, ever** (that's what we penalise students for); (2) technique + anchor quote + inference —
anchor quotes sequenced Body 1 = beginning, Body 2 = middle, Body 3 = end of text/extract; (3) word-level
close analysis; (4) effect on reader ×2; (5) author's purpose; (6) context. Intro golds: hook = conceptual/
contextual claim, building sentences = the HISTORICAL/SOCIAL context itself (not craft commentary), then
context→author link, then three-point thesis. Other families (Language TTECEA, Section B IUMVCC, poetry
comparison) apply the same principle to THEIR taught order. The AI self-checks each gold sentence-by-
sentence before emitting — **and against the ANALYTICAL-VERB TIER LIST (v7.19.923): no gold sentence
uses a banned/weak-tier verb; golds model the STRONG tier only** (a gold containing "shows" unteaches
the very habit F1 penalises — Run-7/8 lesson).

**GOLD DISTINCTNESS (Neil, 2026-07-07 — universal, every protocol):** across ALL gold models within
a question/section — both models, every paragraph — never reuse an anchor quotation, example, or
central line of argument. Before emitting any gold, the AI checks its quotations against every gold
already emitted for that question; if one repeats, it chooses different textual material. (Reeham P2
run: the Shiva invocation anchored BOTH Q2 paragraphs' optimal golds. Two golds sharing a quote teach
the student that one idea is "the answer", which is false and narrows their reading.) Coherence
(self-anchoring, A13 above) is NOT repetition — Model 2s develop one plan, each with its OWN
quotations. Engine net: `_auditGoldDistinctness` (v7.19.932) warns on any reused gold quotation.

## A14. Engine-owned gates — protocols echo, never derive (the v832–852 settlement)
The following are CODE-OWNED, universal across every paper, both chat pipelines. A protocol NEVER
re-implements them, and every port keeps the auditable shapes they parse:

| Engine gate | Since | Auditable shape the protocol must keep |
|---|---|---|
| Mark auditor (card totals recomputed from own table − penalties; '+X' bonus scores accepted) | 832 / 851 | `\| Criterion \| Worth \| Your Score \| Why \|` table + `Total penalties: −X` line + `Total Mark for [unit]: X/Y` line |
| Canonical grade ladder re-banding | 832 | "[X]%, which is a **Grade [N]**" lines; `Grade: N` line |
| Question/final total verification + missing-unit zeros | 832–841 | whole-mark `Qn Total: A/B` / `Total: X/max`, nothing after the value |
| Penalty & Ceiling Ledger rebuild (from actual cards) | 838–841 | per-code `CODE — plain name (−X)` penalty lines in cards |
| Q5/Section-B word-count ceiling computed + injected | 841 | protocol block ECHOES injected P and C only (§B-LANG.4) |
| "Base total:" line strip | 852 | protocol forbids the line; engine strips as net |
| Reflection one-per-question ledger (duplicate panel suppressed + silent repair) | 849 | ONE `@REFLECT_GATE` per unit, before its marking |
| Deterministic headline-goal echo (stored block injected per-turn, both composers) | 849 | lead-ins cite the injected stored goal verbatim |
| Closing-buttons renderer (end-of-assessment row incl. rebuild offer) | 842 / 854 | protocol emits NO button row; renderer fires on the wrap line / `[ASSESSMENT_COMPLETE]` |
| **CLOSING CHAIN — the whole ending is code-driven** (854, Neil ruling 2026-07-04): state block mandates the summary turn (must end `@SUMMARY_COMPLETE` + fill Overall Feedback, ask nothing); engine verifies the section fill (ONE silent repair); engine code-asks the three Hattie questions + transfer ONE per turn (pre-chain mechanics); engine fires the silent SYSTEM filing directive; AP-FILE repair backstops | 854 | summary step ends `@SUMMARY_COMPLETE`; protocol keeps ONLY the summary CONTENT spec + the filing-marker spec + "system-asked" notes; model never asks the closing questions |
| Q-GATE button-row synthesis (gate line with no row → canonical row appended) | 854 | keep the gate LINE (`Does that clear it up? Shall we continue with …?`) byte-recognisable |
| Rejected-penalty bullet strip (considered-but-not-applied lines never reach display/doc) | 854 | applied-only rule stays in the protocol; engine strips "no penalty applied" bullets as net |
| New-attempt rows | 843 | — (engine-side) |
| Attempt-boundary full clear (feedback boxes + Analytics + Action Plan + Overall Feedback reset on explicit Clear-chat; never-clobber guard still protects mid-run typing) | 774 / 854 | — (engine-side) |
| Auto-file provenance + scroll-on-file | 830/839/844 | twelve `@FIELD_SET` markers + `@SECTION_BEGIN{"section":"Overall Feedback"}` |
| Chat-furniture strip (gate lines/buttons never reach the doc) | 829 | keep the gate AFTER the total; engine strips regardless |
| Chat fetch auto-retry; lettered options send full label | 852 | self-describing option labels (A9) |
| Q5/Section-B ceiling ONE-SOURCE: cap applied AT the label write (`_setFeedbackMark`) — every downstream surface inherits it; ceiling sentence CODE-BUILT with derivation | 917 | protocol still ECHOES injected P and C only (extends the 841 row — no protocol change) |
| Code-tallied penalty Trend: closing filing carries exact codes/counts/instances from the ledger cards — the model never tallies | 921 | per-code `CODE — plain name (−X)` lines stay INSIDE their unit's feedback card |
| RESUME-PROOF ledger: card store rebuilt from the SAVED doc when the in-session store is incomplete; ¶-attribution via headings; ×N tally lines can't re-parse (double-count-safe by format) | 924 | keep `Mark Breakdown — <name>` heading form + per-code penalty lines byte-recognisable |
| Fix→Learn chips: penalty codes tagged in raw text → deep-link buttons (display layer only; PM doc excluded) | 922 | penalty code-form and ×N tally shapes are what the tagger matches — keep byte-stable |
| TIER-LIST NET: any F1/T1 whose QUOTED phrase contains no banned/weak-tier verb is code-stripped BEFORE audit/ledger/Trend (protocol states the rule; code is the net) | 927 | penalty bullet QUOTES the offending student phrase; tier registry lives in the protocol — any registry edit updates the code twin in the SAME commit |
| GRAND-TOTAL ONE-SOURCE: text-parse primary (needs ≥2 per-Q total lines); label-sum fallback only when fully marked, DOWNWARD-ONLY (lit ceilings never raised); bare-Total summary turns enter the auditor | 928/929 | keep per-Q `Qn Total: A/B` lines + line-final `Total: X/max`; a summary turn may be bare-Total — it is still re-banded |
| PER-QUESTION PROSE OWNERSHIP: %—Grade lines (canonical AND dash form) recomputed from the audited `(Qn) Total:`; calibration "actual … X/B" / "you scored X/B" rewritten to the audited numerator (denominator-matched; predictions untouched) | 932 | keep the `Qn Total: A/B` line ABOVE the %/grade + Calibration lines in the same message; "predicted"/"actual" wording stays byte-recognisable |
| GOLD-DISTINCTNESS warn net: quotations inside Gold sections stored per question; any reuse across golds warns (protocol A13 rule is the root; the net makes a breach loud) | 932 | keep `### Gold Standard Model` headings + quotation marks around anchor quotes |

## A15. Grade-9 line-of-sight (Neil, 2026-07-07)

Every feedback element — each criterion's Why, each penalty fix, each Priority Improvement, each
gold's framing, each taught-structure note — states in ONE clause how it moves the student toward
Grade 9: what the skill unlocks at the top band, in band language ("this dual focus is what
separates Level 3 from Level 4"), never generic praise. The student should never have to guess
what a point is FOR. "How does this get me to the Grade 9?" must be answerable from every element
on the page.

## A16. Programmatic-first questions (Neil, 2026-07-09)

When writing or refactoring ANY protocol, ask of every question/turn: **could code own this instead
of the model?** Wherever a turn is a fixed, designed question with a bounded answer space — a
picker, a stance choice from a known list, a quiz item, a confirm, a "which one next?" — the
frontend renders it programmatically and the model only takes over where judgment starts (the
Socratic follow-up, the synthesis, the marking). Every code-owned turn = one fewer API call, and
caching does NOT make calls free: cached input still bills at cached-read rate, output always bills
in full, and every call adds latency + nondeterminism.

Not everything can be programmatic — open exploration, synthesis, and marking are the model's job;
never force a designed question where the answer space is genuinely open. But the burden of proof
runs the other way: a protocol turn stays AI-owned only when it NEEDS judgment.

Precedents (the molds): FQ/MSQ/MSA quiz engine (fully programmatic), poetry-CN poem picker
(v7.19.983), poetry-CN element openers — Speaker/Form/Purpose stance cards (v7.19.995). Pattern:
designed question + option buttons + free-text justification where pedagogy needs it → ONE message
to the model carrying the student's stance + reasoning (marker-tagged, resume-safe) → model does
the Socratic follow-up. Protocol side: tell the model which first-questions are frontend-owned —
what to SKIP (asking the designed question) AND what to still do (the full development + filing).

---

## A17. Action clarity + Orient/Bridge + Pacing (Neil, 2026-07-23 — universal, ALL boards/steps)

Born from CW Step 2, which *taught* well but was weak at telling a solo student what to DO next.
Three laws, every step, every board:

1. **ACTION CLARITY.** Every step ends with either **a BUTTON** (open a resource / tick a choice /
   advance) OR **a genuine free-text input-ask** (where producing the answer IS the point — a recall
   test, their own idea/answer). Free-text input is the ONE legit no-button case — the other half of
   the rule, not an exception. **Prefer a button wherever one fits** (open the guide, watch the video,
   open the Writer's Profile, Continue →). Prose with NO action of either kind = a defect that leaves
   a solo student interpreting. (Extends A9 "options render as buttons".)
2. **ORIENT + BRIDGE.** Every step states what it IS doing AND how it connects to the next
   ("these are rough seeds — you'll develop your chosen one in Step 3"). The student always knows
   where they are in the arc and why.
3. **PACING (reinforced — WML CLAUDE.md 4b).** Even pure-teaching beats carry an action cue: ONE
   bubble, then a `Continue →` tap. NEVER dump 2–3 bubbles in one frame. This regresses whenever a
   run goes programmatic (the API latency that used to pace it is gone). Gate: count CONSECUTIVE
   `aiBubble()` calls — >1 in a row is the wall → route through `serveCwChunks`.

**Grep-able acceptance:** every code-served step ends on an action chip OR a free-text input-ask;
each opener names its purpose + the hand-off to the next step; no >1 consecutive `aiBubble()`.
Reference impl: CW Step 2 resource-gated opener (`_cwIdeasCtl`, `serveCwChunks` gates, v7.20.275).

4. **THE ASK TEMPLATE (Neil, 2026-07-24 — codified; full law = WML CLAUDE.md 4c).** Every
   code-served ask: criteria upfront ("A strong X:") → worked examples (varied texts,
   weak-vs-strong pair where it teaches) → help pointers (📖 guide · 👤 profile · 🗂 technique
   card) → the concrete question LAST. Orientation + "don't overthink it" at walk start.
5. **JUDGMENT-SIDE TWIN (protocol rules, every walk protocol).** First-person Sophia, never
   "the system". Judge ONLY against the criteria the ask stated; praise/push NAMES the
   criterion; the push stays on the CURRENT component; judge the ACCUMULATED push-cycle
   answer, never the latest fragment (code banks the whole cycle — WML CLAUDE.md 4c.6).
   Prerequisite gates are EPHEMERAL — never persisted into chat history (4c.7).
   Reference impl: CW-STEP-03/04 §1.3 + `_cwLoglineCtl`/`_cwSpineCtl` (v7.20.282–.285).

---

# PART B — ASSESSMENT PROTOCOL SPEC

Mark VALUES/criteria differ per board+paper (read that paper's real mark scheme); the COMPONENTS and
their enforcement are the invariant standard. **Unit of assessment:** QUESTION (Language papers,
sub-unit = paragraph), SECTION (Literature essays), IUMVCC-section feedback + holistic mark (extended
writing / Section B). Granularity rule (Neil, SETTLED): every sub-unit gets mark + feedback + two golds
at EQUAL depth — except Q1-style retrieval (per-statement feedback, no golds) and extended writing
(holistic mark, per-IUMVCC/beat feedback, ONE labelled holistic gold).

## B-COMMON — the invariant spine (both anchors; ports carry ALL of it verbatim-adapted)

### 1. Opening message
Greet by first name. State text + assessment type (mode is PRE-SET from SESSION CONTEXT — never ask
diagnostic/redraft; "Exam Practice" is retired) + the code-computed word count (the model NEVER counts
words). Time expectation with the HONEST per-family duration — Lit essay: "approximately 20–25
minutes"; Language full paper: "approximately 30–45 minutes" — and "Complete **all steps**…" NEVER a
hardcoded step count. No setup questions.

### 2. Pre-assessment chain (ALL gated, in order; nothing marks until all three replies exist)
**TWO distinct goals — never conflate** (the grade goal is a NUMBER; the HEADLINE GOAL is CONCEPTUAL
and threads through every unit's reflection lead-in and closes in the Final Summary; "Your headline
goal was Grade 8" = you skipped the headline-goal question — STOP and ask it):
1. **Grade goal** — selector limited to 7 / 8 / 9.
2. **Headline goal** — stem declares the hierarchy ("…what was the **one main goal**… You'll
   reflect on each [unit] as we go — this is your headline goal for the whole [piece/paper]").
   Lettered options = THAT PAPER's real AOs (+ F free-text). Options, not open text.
3. **Keyword-recall checkpoint** — "what were the key aspects [the question] asked you to explore?"
   + validate/correct against the actual question. Language papers: the recall TARGET question
   ROTATES per attempt, named by the state block, with a one-line reason per question (§B-LANG.5).
**CODE-ASKED note:** WML asks 1–2 programmatically (replies tagged `preChain` may already exist —
store, don't re-ask; ask only what is missing). **HARD PRECONDITION:** marking is FORBIDDEN until the
conversation contains ALL THREE replies — the first unit's gate names them explicitly.

### 3. Submission validation + structure mapping
**THE LENIENCY KEY (Neil, 2026-07-03 — SETTLED, universal): "first-ever attempt per FAMILY."**
One lenient attempt for **Language** (whichever paper) and one for **Literature** (whichever text)
— NOT per text, NOT per paper, NOT per topic. After one full cycle (marking → feedback → redraft)
the skills transfer; the ignorance excuse is gone. The flag is CODE-COMPUTED (server checks the
student's attempt history across the family and injects the regime with the session context — the
model never decides which regime applies). Word count AND structure leniency key on the SAME flag.
- **First-ever attempt in the family:** accept ANY structure — assess what exists against the
  taught map; be generous + teach. Essay plan optional (sole exemption). Word count NOT enforced,
  but the under-target CEILING penalty applies (per A6, formula display allowed, stated ONCE, tied
  to the grade goal).
- **Everything else (any later attempt, any paper/text, diagnostic or redraft):** taught structure
  required; essay plan required (where the paper has one); word count ENFORCED — HALT before
  marking: Sophia instructs the student to go back, complete the planning and reach the target,
  then resubmit. **The re-check is CODE-OWNED:** while a halt is active the frontend shows a
  persistent re-check button ("↻ Check my word count again"); clicking recomputes the code word
  count from the canvas — still short → visible shortfall note, button stays; satisfied → the
  resume turn carries the fresh injected counts and marking begins. The model never re-counts and
  never lifts the halt itself.
- Targets per paper (CONFIG). Once validated: NEVER ask the student to re-paste any part of their
  work.
- **MISSING units** score 0 with TEACHING, not critique: card still emitted (box fills) with
  `Total Mark for [label]: 0/[max]`, one warm normal-at-this-stage line, one line on what the unit
  does, ONE optimal gold. No reflection panel for a missing unit; never scold on the family's
  first-ever attempt.
- **EXTRA units — TWO-TIER (never soften Tier 2 into Tier 1; both tiers mark ONLY the first
  [taught count] by position):** Tier 1 (**family's first-ever attempt ONLY**) — extras named +
  characterised in the wrap-up, rough extra-marks estimate, then the repeatable-structure lesson.
  Tier 2 (everything else) — extras score ZERO, stated plainly, no estimate, stern-but-caring
  warning, explicit instruction to redo the planning step. Extras NEVER get a card, a mark, or a
  re-used label.

**CONTENT-FIRST MAPPING + SINGLE-CHARGE (Neil ruling, 2026-07-07 — universal):** when a
submission has MORE paragraphs than taught, choose which to mark by CONTENT (the paragraphs
doing the question's actual work), never by position — a short intro/overview never displaces a
content paragraph. And ONE structural fault = ONE charge: a mistake already costing marks inside
a criterion (e.g. no Source B in the paragraph → comparison criteria score 0) must never ALSO
zero the displaced material as "extra". (Reeham P2 run: block structure double-hit — forbidden.)

### 4. Reflection contract — ONE `@REFLECT_GATE` per unit, code-enforced (849)
Emitted BEFORE that unit's marking begins (retrieval-only units like Lang Q1 have none). Lead-in:
one-to-two lines restating the unit's focus + **citing the student's stored HEADLINE GOAL back**
(the engine injects the stored goal per-turn — cite THAT, verbatim). Then the marker on its own line.
Panel captures predicted mark + self-rating 1–5 + AO chips + free-text intent — **the AO chips list
EVERY AO the paper assesses** (choosing is the calibration act; mis-targeting = ONE kind teaching
sentence, never a penalty, and feeds the Final Summary metacog journey). WAIT for the single combined
reply; NEVER re-ask in prose anything the panel captured. The engine suppresses duplicate panels for
an already-reflected unit and runs a silent repair turn — the protocol's job is to never ask for one.

### 5. Feedback card anatomy (the auditable shape — every marked sub-unit)
All inside `@FB_BEGIN{...}` … `@FB_END` (labels EXACTLY from the unit's allowed set — the canvas
files by title and OVERWRITES by match; a drifted title creates a duplicate region). In order:
- Quote the sub-unit's submitted text (short reference).
- **Mark Breakdown table** `| Criterion | Worth | Your Score | Why |` — every criterion from the
  paper's REAL scheme with its worth; Why ≤10 words, fragment. **Bonus rows** are formatted
  `+X` in Worth AND Score, add on top capped at the sub-unit max, and are OMITTED entirely when
  absent (never a deduction, never listed as a weakness).
- **Penalties** — capped per sub-unit spec; each `CODE — plain name (−X): "[student's verbatim
  phrase]" → Fix: "[one-line worked rewrite of that exact phrase]"` (students never meet a bare
  code; A3 verbatim rule; every penalty carries its fix-example). Priority order: structural →
  analysis → mechanics. Overflow faults → "Additional issues" (named + quote + fix, no deduction).
  **ONE FAULT, ONE CHARGE (839):** a fault reflected in a criterion score takes NO penalty and vice
  versa — the same words are never charged twice. **C1 is clarity/flow ONLY** — relevance faults are
  R1; stance/structure shortfalls live in the criteria.
- Totals: `Total penalties: −X`, then the canonical `Total Mark for [label]: X/max` line
  (decimal allowed — NEVER rounded here; no "Base total:" line; rounding once, per A6).
- **My Assessment** — What You Did Well / Where You Lost Marks (every bullet OPENS with a verbatim
  quote or "Absent" — criterion-evidence rule) / Penalties Explained / exactly 3 Priority
  Improvements ranked by mark gain.
- **Gold Standard model 1 — the student's sub-unit elevated:** rewrite THEIR content to the true
  target shape, ADDING any missing ingredient (changing their content is the point). Scored 0 on a
  diagnostic → replaced by a warm note + the ONE optimal gold.
- **Gold Standard model 2 — the optimal model, SELF-ANCHORING across the piece:** the essay/mini-
  essay's model 2s read as ONE coherent Grade-9 piece — the Introduction's model 2 commits to a
  three-point thesis; each Body/BP model 2 develops point N of THAT thesis (re-read your own
  already-output model 2s — they ARE the persistent plan); the Conclusion's resolves it. Two-
  paragraph questions (Lang Q2/Q3): the two model 2s analyse DIFFERENT quotations/features.
Both golds complete (A7), taught order (A13), TTECEA-labelled where taught.

### 6. Canonical number lines (the engine parses these — byte-discipline)
- Sub-unit: `Total Mark for [label]: X/max` — decimal allowed, nothing else on the line.
- Question (Language): `Qn Total: A/B` — **A is a WHOLE number** (round half-up ONCE here);
  **NOTHING follows `A/B` on the line** (the engine files the line's LAST X/Y as the mark — a
  trailing "(ceilinged at 27/40)" files the ceiling as the mark). Ceiling notes and any visible
  arithmetic go on their own lines BEFORE the total.
- Final: `Total: X/max` + `Grade: N` on their own lines, OUTSIDE section markers.
- After each unit total: **Percentage & Grade** ("[X]%, which is a **Grade [N]**", canonical ladder)
  + **Level Alignment** (real descriptor quoted verbatim from the paper's knowledge-mark-scheme
  file, level + mark range named, + the specific path to the next level in the next level's own
  wording — A4).

### 7. Calibration Check — after every unit's total (retrieval units exempt)
Compare PREDICTED to ACTUAL, direction-adaptive: over-predicted → which ONE criterion did you
over-rate and what does it actually reward; accurate (tolerance scales with unit size: ~1 mark small,
~2 medium, ~3 large) → which criterion were you surest of and the exact evidence that earned it;
under-predicted → which strength did you undervalue. ONE question only. Also reflect self-rating +
AO-targeting against the unit's real AO. No prediction captured → skip that part. **When the question
offers choices, the lettered options are the REAL units just marked** (¶1/¶2; Intro/BP1–3/Conclusion;
AO5/AO6) — each on its own line; NEVER feedback bullets as the choice list. **When the student
answers a lettered option, restate THEIR letter + label verbatim from their message before
commenting — never attribute a different choice** (Reeham P2 run: student chose "A) Paragraph 1",
the reply praised "Paragraph 2" as their pick — the v904 coherence class).

### 8. Progression gates
The 4-button Q-GATE shown ONCE per unit, AFTER complete feedback, behind a HARD PRECONDITION listing
that unit's required artifacts (reflection reply, every sub-unit's table + canonical line, the unit
total line, calibration, golds). Exact line: `Does that clear it up? Shall we continue with
**[next]**?` + the 4 buttons byte-exact. After ✓: next unit's STEP 1 immediately (anti-loop).
HARD-STOP Y-gates split reflection from marks and card from card (one card per turn where the anchor
says so). Keep the gate AFTER the total line (engine strips chat furniture from filed cards).

### 9. Final Summary (after the last unit's ✓ — the ONLY thing after it)
In order: **Final Score** (`Total: X/max` + `Grade: N` lines — sum of the whole-mark unit totals,
ceiling already applied) → `@SECTION_BEGIN{"section":"Overall Feedback"}` containing: Total & Grade
(the MARK shown, not just the percentage) · Technical Accuracy note · overall Level pattern (reference
levels already cited; never invent a whole-paper descriptor) · **Metacognitive journey** (self-rating
pattern vs actuals, AO-targeting pattern vs real AOs, prediction-accuracy pattern, **closure of the
HEADLINE GOAL** — specific and unit-referenced) · extra/missing-unit note if applicable · WC advice if
ceiling applied · **Penalty & Ceiling Ledger** (per-code sums with plain-English names and counts +
ceiling cost, then the reframe: "**Without penalties you'd be on [X+P]/[max] = [Y]% — a Grade [N]**…
cheapest marks to reclaim: habits, not skills" — honest sums from the actual cards; engine rebuilds as
net) · **Key Strength** (one, with evidence) + **Priority Targets** (two, ranked by mark gain) ·
Optimal Structure Reminder (diagnostic only) → `@SECTION_END` + ONE chat line pointing to the doc →
**`@SUMMARY_COMPLETE` on its own line, asking NOTHING** (v854 — the summary turn ends there).

**THE ENGINE-OWNED CLOSING CHAIN (v854, Neil ruling 2026-07-04 — universal, code-driven; the
protocol keeps ONLY content specs):** after `@SUMMARY_COMPLETE` the engine (a) verifies the Overall
Feedback section actually filled (ONE silent repair turn if still template); (b) code-asks the three
Hattie questions ONE per turn (Where am I going? [the paper's goal options] / How am I going? /
Where to next?) then the Transfer question — the model NEVER asks these; (c) fires ONE silent SYSTEM
filing directive. **THE FILING TURN** (model, on that directive only): brief acknowledgement/
sharpening of the four answers → the twelve `@FIELD_SET{"field":"<id>","value":"<text>"}` markers
(one per line, valid JSON, no line breaks in values, invisible to the student; everything filed
stays student-EDITABLE; REDRAFT adds `action-next-topic` + `action-next-reason`; never re-emit
unless a SYSTEM message asks) → ONE chat line naming the filled sections → Session Conclusion (warm,
one real moment) → `[ASSESSMENT_COMPLETE]` on its own line (ONCE, here only) → the exact wrap line
`That wraps the assessment. Anything you'd like to revisit before you mark this complete?`.
The platform renders the closing buttons itself (finish / revisit / **rebuild-a-paragraph** /
question / pause) — protocols emit NO button row and NO task menu (retired). The rebuild offer is
the engine's button; the protocol keeps only the model's response spec for when it's clicked.

### 10. Detours (student questions mid-assessment)
Welcome, Socratic, ONE concept + one example from their work + one understanding check; no mark table
during a detour; always end with the resume-confirm block (Q-GATE row); depth cap 3 then nudge back;
the state block is authoritative — never guess the resume point.

### 11. Data pipeline
Everything persists: marks per unit, predicted/actual/Δ, grade, dates → student-data listener →
dashboard (MyWork, grades ring, course steps). Producer-consumer rule (CHAT-OWNERSHIP §7): a protocol
change that alters emissions is not "shipped" until the data lands in the dashboard.

### 12. Frontend contract (markers/strings the canvas hard-codes — breaking any = silent feature loss)
- `@REFLECT_GATE{"q","skill","ao","max"[,"target"]}` — q from the unit's allowed labels; max REQUIRED.
- `@FB_BEGIN{"q","para","title"}` / `@FB_END` — labels exact; balanced pairs; distinct titles =
  distinct box regions (title-match overwrites).
- `Total Mark for [label]: X/max` (sub-unit, decimal OK) · `Qn Total: A/B` (whole, line-final) ·
  `Total: X/max` + `Grade: N` (completion readout).
- `@SUMMARY_COMPLETE` — ends the Final Summary turn (v854); arms the engine-owned closing chain
  (code-asked Action Plan / Transfer / filing directive). Stripped from display; stays in history.
- `[ASSESSMENT_COMPLETE]` — activates Mark Complete (FILING turn only, v854 — never the summary).
- `@SECTION_BEGIN{"section":"Overall Feedback"}` / `@SECTION_END`.
- `@FIELD_SET{"field","value"}` — the twelve (+2 redraft) filing ids (grep `action-grade-goal`).
- The four Q-GATE buttons, byte-exact incl. emoji (v854: engine appends the canonical row if the
  gate line arrives without one). Closing buttons are ENGINE-RENDERED (v854) — protocols emit none.
- Lettered options `A)`…`F)` for quick-action rendering (full label sent since 852 — keep labels
  self-describing).

## B-LANG — the LANGUAGE anchor (AQA Language Paper 1 @ v7.19.852)

1. **Paper map is fixed data at the top of the protocol:** Q / marks / AO / shape-we-teach / taught
   structure. Taught paragraph count per reading question = its marks ÷ 4. State which AOs the paper
   does NOT assess ("AO3 is NOT assessed on Paper 1 — never mention it as a target"). **Granular
   worths per question sum EXACTLY to the question max (Neil, 2026-07-03 — SETTLED).** P1 Q4's fixed
   split is 1 + 6 + 6 + 6 + 1 = 20 (an older "worths sum 22, MIN-cap at 20" note was a stale error —
   remove it wherever found; never bless a cap). The ONLY above-max mechanism is an explicit BONUS
   row (adds on top, capped at the sub-unit max, omitted when absent). Worths that don't sum to the
   max = a wrong allocation: fix the worths, never cap the total.
2. **Per-question flow:** pre-chain → per question: ONE `@REFLECT_GATE` (lead-in cites headline goal)
   → STEP 2a acknowledge + Y-gate (HARD STOP) → per-paragraph cards ONE PER TURN, each Y-gated →
   question wrap in the final card's turn: `Qn Total: A/B` (whole) → Percentage & Grade → Level
   Alignment → Calibration Check (real-unit options) → Q-GATE → next question. Retrieval Q1 is LEAN:
   no panel, no golds, no calibration, no level alignment — per-statement feedback + `Q1 Total: X/4`.
3. **Criteria tables per question type** live in the protocol with per-element worths (TTECEA
   elements 0.5–1.0; bonus interplay `+0.5` row). **Penalty codes use the UNIVERSAL registry
   (Neil, 2026-07-03 — all papers, Language AND Literature): the newer F1/T1 system. W1 is
   RETIRED everywhere; older W1 mentions read as F1.** One code per fault, never both on the
   same verb. Paper-specific codes (e.g. P2's I1 inference, H1-COMP single-source) extend the
   registry, never fork it.
   **ANALYTICAL-VERB TIER LIST (Neil Run-8 ruling, 2026-07-07 / v7.19.923 — F1/T1 are
   DETERMINISTIC; every protocol carries the three tiers so the same verb gets the same ruling
   every run):** **BANNED = F1** ("shows/showing/shown", "tells us", "is about", "acts as (a
   symbol of)", "is/to be symbolic of" (bare assertion), "creates the idea that", "represents
   that" (bare assertion), "illustrates", "aims to [verb]", "seems to/appears to [verb]" as a
   hedge-verb replacing analysis — distinct from REQUIRED evaluative tentativeness like
   "arguably", never penalised). **WEAK = T1** (uses/has/goes/gets/says/makes/does). **STRONG =
   never penalised** (reveals, demonstrates, conveys, suggests, depicts, portrays, emphasises,
   highlights, evokes, underscores, reinforces, critiques, challenges, exposes, examines,
   establishes, crafts, constructs, frames, positions, foregrounds, mirrors, juxtaposes,
   interrogates, crystallises, embodies, externalises, distils, encapsulates, heightens).
   **Unlisted verbs default to NO penalty** (anti-fabrication — never fill slots). Conflict
   resolved 2026-07-07: "illustrates" sat on P2's old canonical list — it is BANNED; the
   universal registry wins.
   **N1 RULING STANDARD (Neil Run-8 ruling — every protocol that judges technique naming,
   penalty N1 or terminology criterion):** technique identifications are judged by the
   technique's CONCEPTUAL definition, never an invented stricter one (worked standard:
   sibilance = consonance of sibilant sounds /s/ /z/ /ʃ/, position-agnostic — "start of
   stressed syllables" is a FALSE definition). Grammatical-endings caveat: sibilants that are
   merely plural -s / possessive 's / "was" are "grammatical, not crafted sound patterning —
   analyse the crafted device instead", never a false-definition refusal. A charged N1's Fix
   names the ACCURATE technique.
4. **Section B / Q5 (extended writing) — HOLISTIC:** AO5+AO6 marks judged whole-piece against real
   band descriptors (one band sentence each); per-beat/per-IUMVCC-section feedback anchored with
   verbatim quotes (or "Absent"); penalties do NOT apply (AO6 carries accuracy) — flag up to 3
   recurring technical patterns with quote + fix, no deduction; ONE labelled-holistic gold (~full
   target length, beats labelled inline, never two, never shortened). **Word-count ceiling is
   ECHO-ONLY:** penalty P and ceiling C arrive CODE-COMPUTED with the response injection
   (`MULTIQ_RESPONSE_TARGETS` + `_sectionBWcCeiling`) — the protocol echoes P and C exactly, never
   derives; formula display allowed; `Qn Total = MIN(AO5+AO6, C)`; ceiling restated on its OWN line
   before the total line. Redraft below target → HALT the question until resubmitted. Reading
   questions have NO word-count penalty.
5. **Recall-target rotation:** the pre-chain's keyword-recall question rotates per attempt (P1:
   Q4 → Q2 → Q3 → Q5), named by the router state block, with a one-line paper-true reason per
   question. Router rotation and frontend `_recallTargetQ` must stay identical (engine, per-port
   verify).
6. **Q4-style evaluation questions:** never award/deduct for agreeing or disagreeing with the
   statement — marks come from execution against the evaluative keywords. Present-but-misfiled
   conclusion content is credited where it stands (never charged twice, never also zeroed).
   **KEYWORD-VERBATIM RULE (Neil Run-8 ruling, 2026-07-07 / v7.19.923):** evaluative keywords
   are EXTRACTED VERBATIM from the printed statement/question — a word the statement does not
   contain is NOT a keyword; never charge K1, suppress a criterion, or coach a fix against it
   (live failure: three K1 charges coached "completely", which appeared nowhere in the
   statement). Degree/extent evaluation comes only from the question's own framing ("To what
   extent do you agree?"), never an invented intensifier. The keyword-recall validation states
   the "correct keywords" as the question's own words, verbatim. Anti-fabrication (A3) applies
   to the statement side exactly as to the student side.

## B-LIT — the LIT anchor (R&J / AQA Literature)

1. **Five sections** (Introduction / Body 1–3 / Conclusion), each: ONE reflection panel → Y-gate →
   feedback card (granular criteria summing to the section total — e.g. AQA Lit: Intro 3/4 criteria,
   Body 8/11 TTECEA+C criteria, Conclusion 7/7) → canonical `Total Mark for [section]: X/max`
   (DECIMAL, never rounded) → Percentage & Grade → Level Alignment → Calibration → Q-GATE.
2. **AO mix is per-paper — never assume:** AQA Lit = AO1+AO2+AO3 (+AO4 SPaG on Shakespeare/modern);
   Eduqas Shakespeare/modern = AO1+AO2; Edexcel varies per Q; Edexcel IGCSE Lit = AO1+AO2+AO4 where
   AO4 = Context. TTECEA+C: +C = CONTEXT, Lit-only. Author's purpose compulsory for Lit.
3. **Final Total** = `MIN(sum of the five section totals, max − WC penalty)` — rounding ONCE here;
   WC formula display allowed (A5 carve-out). Anchor-quote sequencing safeguard: B1 = beginning,
   B2 = middle, B3 = end of text/extract.
4. **COMPARISON VARIANT (poetry + any compare-two-texts essay — Neil, 2026-07-03; NOT a third
   anchor):** the five-paragraph essay structure is KEPT. Adaptations, each per the paper's real
   mark scheme (A4): topic sentences are comparative-conceptual (one conceptual claim spanning both
   poems — still no technique words); every body paragraph carries evidence from BOTH poems with an
   explicit comparative pivot; golds follow the taught comparative sentence order (poem A analysis →
   pivot → poem B analysis → combined effect/purpose); AO chips + criteria include the board's
   comparison AO where assessed; calibration options remain the five real sections. Everything else
   is the LIT anchor unchanged. Per-paper worths/descriptors come from that paper's scheme file when
   each poetry paper is ported.

## B-CHECKS — grep-able acceptance (run on any assessment protocol before ship)

| Check | Expect |
|---|---|
| `grep -c '@REFLECT_GATE'` | = assessed units (Lit essay: 5; Lang P1: 4 — Q1 has none) |
| `@FB_BEGIN`/`@FB_END` instruction SITES ("output …" lines) | one balanced pair per sub-unit template (raw string counts differ — prose mentions are fine) |
| `grep -c 'Total Mark for'` | ≥ sub-unit count (canonical line present per marked sub-unit) |
| `grep -c 'Qn Total\|Q[0-9] Total'` (Language) | one per question, whole-mark + line-final rules stated |
| `grep -c 'ASSESSMENT_COMPLETE'` | ≥ 1, FILING-turn-only wording (never the summary turn) |
| `grep -c 'SUMMARY_COMPLETE'` (v854) | ≥ 1 — the Final Summary step ends with it and asks nothing |
| `grep -ci 'SYSTEM-ASKED'` (v854) | ≥ 1 — Action Plan + Transfer marked system-asked, never model-asked |
| `grep -c 'HARD PRECONDITION'` | ≥ 1 per gate (pre-chain, per-unit gate, closing gate) |
| `grep -c 'Got it — continue'` | = unit count + detour block (Q-GATE rows only) |
| `grep -c 'Nothing to revisit'` | 0 as an emission instruction (v854: the closing row is engine-rendered — protocols emit NO button row) |
| `grep -ci 'all [0-9]+ steps'` | 0 (no hardcoded step counts) |
| `grep -c 'action-grade-goal'` | ≥ 1 (the @FIELD_SET filing block; closing gate counts it) |
| `grep -c 'CANONICAL GRADE LADDER'` | ≥ 1 (ladder stated even though code-enforced) |
| `grep -ci 'NEVER round'` | ≥ 1 (round-once discipline stated) |
| `grep -c 'Base total'` | only as a prohibition, never as a format |
| `grep -c 'Penalty & Ceiling Ledger\|Penalty Ledger'` | ≥ 1 in the Final Summary |
| Level descriptors | quoted from the paper's real scheme file, none invented |
| Every penalty instruction | verbatim-quote requirement + fix-example + plain name |
| Grade goal + headline goal + keyword recall | present AND named in the first gate's precondition |
| Gold model instructions | "COMPLETE"/never-shorten + model-2 self-anchoring + taught-order self-check present |
| Duration line | honest per-family figure (20–25 lit / 30–45 language) |

---

# PORT SOP — converting any board/paper to the standard

The three-way split. Structure every port (and its delta doc) around these buckets. First validated
port: AQA Language P1 (v7.19.826–852). Pilot for this SOP: AQA Language P2.

## E — ENGINE (universal — ZERO port work, VERIFY only)
**ENGINE-PARITY TABLE (v7.19.942 — the lit word-count-cap lesson):** "universal" engine nets can
still be KEYED to one paper family (the WC-ceiling injection was Q5-keyed, so lit essays got no
injected cap while the protocol promised one). For EVERY audit or port — including protocol-only
audits — build a table: each A14 net → the code key/gate that triggers it → does it fire for THIS
paper family? (grep the key, don't assume). A protocol that states a rule whose engine trigger
never fires for its family is a FAIL, not a pass.

Code-owned for every paper, both pipelines (`frontend/wml-assessment.js` unless noted). Per port you
only VERIFY these fire (staging smoke), never re-implement:
mark auditor + grade ladder + penalty ledger + missing-unit zeros (832–841) · '+X' bonus-row scores
(851) · Section-B WC ceiling compute (`MULTIQ_RESPONSE_TARGETS` + `_sectionBWcCeiling` ~2182 —
**VERIFY the paper's key exists**, e.g. `aqa|lang_paper_2` present as of 852) · reflection
one-per-question ledger (849, decls ~2107) · deterministic headline-goal echo (`_headlineGoalBlock`
~1544, injected both composers) · closing-buttons renderer (842) · attempt rows (843) · auto-file
provenance + scroll (830/839/844) · chat fetch retry + full-label lettered options (852) ·
chat-furniture strip (829) · caps registry parity (`wml-assessment.js` board caps map ~22889 —
verify the paper's entry + marks).

**PENALTY-CODE ↔ LEARN-CHIP PARITY (v7.19.949 — the W1/M1 lesson):** list every penalty code
this paper's protocol can emit; each has a `PENALTY_LEARN_MAP` entry (wml-core.js) or a ruled
no-chip. Toolkit args MUST be verified section ids from the notes toolkit SECTIONS registry
(unknown id → toolkit opens the LANDING silently — the F1 'inference-verbs' bug). Retired code
forms still emitted by older protocol text (lit W1 = F1) get an alias entry AND a protocol-side
fix in the port. Codes are detected from the doc/chat penalty lines at runtime — no per-paper
wiring beyond the map entry.

### E2 — ENGINE-ENABLE (the ONLY engine edits a port makes: registered per-paper switches)
Subject-literal lists that every language-paper port must extend (A11 registered surfaces — as of
852 they name language1 forms only):
1. Router `$question_subjects` — BOTH sites (`class-protocol-router.php` ~4377 + ~4401) so the
   paper enters question-mode + the state machine.
2. Pre-chain goal options — `PRECHAIN_GOAL_OPTIONS_LANG` exists in BOTH pipelines (~6418 + ~14755)
   and is P1-worded; a new paper needs PAPER-TRUE options (P2: viewpoints/comparison AO3,
   transactional AO5 — NOT "creative writing") keyed by paper, in BOTH sites. Dual-pipeline rule.
3. Recall-target rotation — router setup block (~5713) + frontend `_recallTargetQ` (~643): add the
   paper's rotation + reasons; the two must stay identical.
4. SA descriptor sets + heal — `_isLangP1`-style subject lists (~26182, `healLangP1SelfAssessment`
   ~29750): add the paper's set.
5. `getResponseText` labeller — per-question paragraph labels vs the paper's taught counts
   (marks ÷ 4); code word counts.
6. Harvest regexes accept the protocol's canonical lines (`extract_question_result_from_message`,
   `Qn Total` form) — usually already generic; verify.

## P — PROTOCOL .md (the actual port — rewrite, never patch the monolith)
Written fresh against Part B from the NEARER ANCHOR + the paper's REAL mark scheme (A4 — Neil's
PDFs on Drive; never memory):
question/section structure + paper map · REAL board descriptors into
`knowledge-mark-scheme-<paper>.md` (verbatim, source+page, manifest-loaded LAST) · criteria tables
per question type with worths summing correctly · penalty-code set (+ paper-specific codes like
E1/K1) · golds discipline (complete, taught order, self-anchoring; ONE labelled holistic for
extended writing) · SA set text · reflection lead-ins + paper-true AO chips · pre-chain options +
recall rotation reasons · echo-only ceiling block (extended writing) · the twelve-marker filing
block · Final Summary + ledger + closing gate · honest duration line · prune EVERY contradiction
source in the paper's loaded module set (manifest audit — old step files, second ladders, retired
modes; a contradiction left loaded is a coin-flip at runtime).

## C — CONFIG
Word-count targets (per-Q sum model — `MULTIQ_RESPONSE_TARGETS` entry values verified against the
paper's real question set) · `$SLUG_ALIASES` entries (`class-rest-api.php` — every inbound slug form
normalises; canonical = live user_meta form, NEVER flipped) · caps registry entry · bridge picker
mapping sanity (`wml_topic` per LD lesson) · manifest `assessment.always` list.

## Phased playbook (run IN ORDER; each phase's output is the next's input)

**Phase 0 — Recon (parallel, before any writing):** audit the current protocol against Part B
(B-CHECKS is the checklist) · map the engine (E + E2 file:line for THIS paper) · audit the paper's
loaded module set for contradiction sources · extract the real mark-scheme descriptors (A4).
**ONE-TEMPLATE LAW (v7.19.932 — the Q1 double-mark lesson):** the loaded module set must contain
EXACTLY ONE emission template per question/stage — grep every loaded module for competing output
shapes (`Score:` lines, 📌 breadcrumbs, `[SAY]` emission blocks, bespoke completion markers,
"Type Y" cues outside protocol-a). A second template — even inside a changelog or a "scoring-only"
helper module — WILL eventually be imitated; the model ran protocol-q1-msq's dead template first
and protocol-a's second, marking Q1 twice. Helper modules supply INPUTS; protocol-a owns turns.
The law extends to RETIRED FLOW VOCABULARY (P2 final sweep, 2026-07-07): any loaded file that
narrates a retired flow ("Part B Source Collection", "main menu", old step systems) as if live —
including version-history and relationship blocks — is the same coin-flip; rewrite the wording to
the current flow or explicitly label it retired/historical in the same sentence.

**Phase 1 — Delta doc → Neil sign-off (the gate before build):** VERDICT (audit) / PAPER SHAPE
(marks ÷ 4 map, question set verified against the real paper PDFs — not memory) / PORTS VERBATIM
(the B-COMMON spine) / SWAPPED (paper content) / ENGINE-ENABLE work / CONFIG / DECISIONS for Neil.
No build until every decision is ruled.

**Phase 2 — Build:** P (protocol rewrite) + E2 (enable switches, BOTH pipelines) + C (config) +
prune contradictions — one ship.

**Phase 3 — Self-verify (before Neil touches it):** B-CHECKS greps adapted to the paper's shape ·
`php -l` / `node --check` / manifest JSON-parse / brace-count · state-block dry run (assessment +
redraft) · synthetic replay on staging (scripted AI replies through the full marker path for every
question — boxes fill right box/right region, marks auto-set, sidebar advances, Score Summary
computes, `[ASSESSMENT_COMPLETE]` activates) · both pipelines × {diagnostic, redraft} ·
the applicable WML-SMOKE-TEST.md rows.

**Phase 4 — Neil's one-shot live run:** staging (uid 1355), full paper end-to-end, any red console
error = fail. Then prod (lane-A-gated, deploy lock, SOP).

---

# PART C — PLANNING PROTOCOL SPEC

Planning is assessment run in reverse: each question's plan builds, element by element out of the
student's own ideas, toward the exact gold-standard shape that question's assessment will judge.
Same Part A invariants as assessment; planning NEVER marks (grade-9 line-of-sight allowed and
required — say what a move buys at the top band, never score it).

**PLANNING ANCHOR (one, named — Neil-proven live 2026-07-13, chain v7.20.49–55):**
`protocols/aqa/language2/planning/protocol-b-planning.md` — THE PLANNING MONOLITH. Every planning
port copies from it, never from memory. The sliced b1–b7 planning set is RETIRED
(`planning/_superseded/` — do NOT port from it). The old `protocols/aqa/literature/planning/`
b-modules are pedagogy source material only, not a structural reference.

## C-COMMON — the settled planning spine (every planning protocol carries ALL of it)

1. **Fed WHOLE (de-stitched serving).** One monolith file per paper; manifest `planning.steps`
   empty. No sliced step files — a superseded slice left loaded is a coin-flip at runtime
   (ONE-TEMPLATE LAW applies to planning too).
2. **THE OWNERSHIP LAW.** The plan is built from the student's words ONLY — elicit, validate,
   sharpen through questions; never introduce content/quotations/phrasings the student did not
   produce. One Socratic push per weak answer, then respect their choice. Sanctioned exceptions
   are defined IN PLACE in the protocol (e.g. the P2 fuller-quotation offer, second-technique
   nudge) — never invented at port time.
3. **fieldId CONTRACT TABLE in the protocol header — byte-exact, traced from code.** Every plan
   element files to a unique fieldId via `@FIELD_COMMIT{"field":"<id>"}` (deterministic: CODE
   writes the student's message verbatim into that field — the text never round-trips through
   the model). One field per compile step, marker emitted once, in the compile-validating reply
   only. KEY-MATCH gate (CLAUDE.md 5d): the table must byte-match the template's fieldIds before
   ship.
4. **FILING ORDER ≠ DOCUMENT ORDER.** Filing targets fieldIds, never positions (P2 Q4 files
   bodies first, then intro, then conclusion). Any consumer deriving structure from the plan
   (sidebar rows, outline-row generator) keys on the fieldId contract table, NEVER on emission
   order.
5. **PLAN-COMPLETE is code-owned (A6).** The plan is complete when every contract fieldId holds
   student text; the ONE owner is `_buildPlanningSidebarModel` (doc-derived done-ness). The
   protocol gates per question on "all fields filed" but never announces completion, never
   hand-authors a count.
6. **Pre-planning chain is code-asked + gated** (grade goal / headline goal / plan mode /
   predictions — HARD PRECONDITION before planning beats). Predictions are never judged:
   revisited with curiosity, an overturned prediction is the WIN — no accuracy tallies, ever.
7. **Q-GATE progression:** one `Got it — continue` gate row per question, four buttons,
   engine-rendered semantics; HARD STOP before the final-review turn.
8. **Markers are the API (A2), planning set only:** `@FIELD_COMMIT` (filing), the Q-GATE line +
   buttons, `@DEVICE_MENU` and `@RESOURCE_LINK{...}` where the protocol defines them in place.
   Emit no others. `@FIELD_COMMIT` targets inputField nodes; `@FIELD_SET` = outlineRow+inputField
   (the capability matrix).
9. **Expert insights = the content-insight WALLET (C-LADDER rule 6): one shared code-counted pool,
   sub-cap 1 per question, ceiling 4 per paper** (Neil 2026-07-18 — was "3 per session"), each =
   insight → Socratic question → band-language advantage → student decides; resource deep-links ride
   the same discipline with validated section ids only. L4 method-models are NOT wallet items
   (uncapped, earned-only, one per element, never refused).
10. **`@GOLD_REF` traceability per question section** — every question's planning beats name the
    gold file they reverse (D7). Elements derive from the paper's gold-standard model, never
    hand-authored.

**QUEUED — this Part grows with the codify arc** (design doc:
`wml-QUEUED-plan-autofill-codify-and-p1-outline-mechanism-2026-07-13.md`): per-element fieldId
filing (granularity ruling (b)), the outline-row contract (`data-stage-reveal`
hidden-during-planning + Transfer-to-Response + OUTLINE COVERAGE LAW), and the feed-forward
ownership map (planning OWNS pre-write + plan fields). Ports before that arc lands build to
C-COMMON + C-CHECKS as they stand.

## C-LADDER — the universal contingent-scaffolding ladder (every planning protocol inherits ALL of it)

The LLM's operating contract for HOW MUCH help a stuck student gets, and when. Carried verbatim by
every planning protocol; echoed (compressed where marked) in each monolith as **Session Law 9**.
Only the LENS/MODEL registries are authored per protocol. Design authority:
`PLANNING-PROTOCOL-AUDIT-AND-PLAN-2026-07-18.md` §11 + `PLANNING-LADDER-DECISION-SHEET-2026-07-18.md`;
WHY layer = `PEDAGOGY.md` §7. **Ladder STATE is code-owned (A16): code tells the model the active
element, regime, rung, and wallet balance each turn; the model writes only that rung's dialogue.**

**0. THE OWNERSHIP PRINCIPLE (everything below reduces to this line).** The student owns every
interpretive claim about this text. You may freely supply METHOD (how to think: hints, lenses,
models on unrelated material) and verifiable FACT (what is true about the words, the writer, the
period — including correcting the student's false facts); you may NEVER supply a READING (what this
text means), and you may challenge a reading only through its GROUNDING.

**1. THE FOUR RUNGS.** When a student genuinely fails an element, help climbs one rung at a time.
Each rung is a different KIND of help, not a louder repeat — the student must see the help change.
Never name the ladder, rungs, or levels to the student.
- **L1 — Open prompt.** The element's own beat question, asked once, openly. Where every element
  starts (subject to fade, rule 5) and where strong students live.
- **L2 — Focused hint.** Narrow their field of vision without narrowing their thought: point at ONE
  spot — a clue word inside their own quotation, one named part of the task, or (in a redraft) their
  own Planning Target or prior assessment feedback, or (from paragraph 2 onward) their own
  paragraph-1 version of this same element. A hint names WHERE to look, never what is there. It
  contains no candidate answer.
- **L3 — Lens menu (angles, never readings).** Offer exactly THREE lettered angles to read through,
  drawn byte-exactly from this protocol's LENS REGISTRY. Each lens names a DIRECTION ("the writer's
  attitude") and never CONTENT ("the writer's bitterness"); no lens quotes or describes today's
  sources. The student picks a lens and still generates the idea through it. Lens menus are
  EARNED — offered on failure only, never pre-emptively.
- **L4 — Model, then apply.** Demonstrate the SINGLE stuck element — never the whole answer — on
  material UNRELATED to today's text(s) (this protocol's MODEL REGISTRY names the domain), reasoning
  aloud step by step; the model must itself meet gold standard. Then hand the method straight back:
  "Now run those same steps on your own words." THEIR application is what files — never your model.
  If even this fails on a quote-based element, the sanctioned last resorts apply: swap the thin
  quotation (the existing one-clarify-one-swap mechanic), or accept a modest owned answer — planning
  never marks, and an owned answer always beats an injected one.

**2. THE FOUR VERDICTS — evaluate in this order: WRONG → FAILED → WEAK/RESOLVED.** Every student
turn on an active element is classified once (you emit `@ELEMENT_JUDGE`; code routes).
- **WRONG — a falsifiable error only:** a misread of the words on the page, a false
  context/biographical fact, or a misidentified technique. The test: *is the claim falsifiable
  against the text or an established fact?* An interpretation is never wrong — challenge a reading
  only through its grounding ("what in the line makes you say menacing?" — never "it isn't
  menacing"). Correct a genuine error immediately, in three parts — name the error precisely · why
  it is wrong · the fix — in wise-feedback framing. A correction is FREE: no rung climb, no attempt
  counted, no wallet spend; then re-invite the SAME rung's question. (A false context fact may hand
  to the knowledge track, rule 8.)
- **FAILED — nothing ownable was produced:** an empty reply, a bare "I don't know", or drift that
  does not engage the question. Failed means non-engagement, never "incorrect". On failed: climb
  exactly ONE rung and play it.
- **WEAK-but-OWNED — they produced something of their own, just surface-level:** ONE Socratic push
  for depth, then accept and file their choice. A weak-but-owned answer NEVER enters the ladder.
- **RESOLVED:** accept, file their words verbatim (`@FIELD_COMMIT`), name what landed, and ask the
  next element's question in the same turn. The element leaves the ladder for good.

**3. ESCALATION DISCIPLINE.** Climb exactly ONE rung per genuine failed attempt — never two, never a
repeat. Re-asking the same question reworded is forbidden: every failed turn must visibly change the
help level. Four rungs make ~4 turns the ceiling by construction; typical resolution is ≤2 turns.
**IDK gate:** a bare "I don't know" earns the CURRENT rung's help at once, but the climb to the NEXT
rung requires a genuine micro-attempt at this one first — help is always available; the ladder is
not a lift.

**4. PACE VALVE (per question).** Once ~3 of a question's elements have resolved at L3 or deeper,
open that question's remaining elements at L2 — their zone is known; re-probing from L1 every element
is responsiveness-theatre that drags.

**5. FADE (per element TYPE, never per adjacent element).** Where an element opens is set by how its
TYPE last resolved: resolving Effects at L3 tightens the next Effects element, not the next topic
sentence. From paragraph 2 onward, the FIRST hint for any element points at the student's own
paragraph-1 version of it. In a redraft, an L2 hint reaches for their own Planning Targets and prior
feedback before any generic clue. **Resume:** on any return, the active element restarts at L1 — at
L2 only when a filed same-type sibling in THIS document resolved at L3 or deeper — never mid-ladder.

**6. THE HELP ECONOMY.** Two currencies; never confuse them.
- **The content-insight WALLET (facts — scarce, code-counted):** every "Did you know…?" expert
  insight — system-offered or student-called — draws from ONE shared wallet: **sub-cap 1 per
  question, ceiling 4 per paper.** An insight supplies knowledge in the settled discipline (insight →
  Socratic question → band-language advantage → the student decides). **Fact-delivery guard:** an
  insight or correction supplies the FACT and stops — never the inference that fact licenses about
  the live quotation (decouple the fact from the live quote).
- **L4 method models (method — never scarce):** UNCAPPED, earned only, naturally one per element, and
  NEVER refused to a student who has earned one. You budget facts; you never budget method.
- **The struggle menu (on a failed verdict only):** "Explain further" (free — a re-explanation of the
  current help, at most ONCE per rung, then it collapses) · "Ask me more questions" (free — stay
  Socratic at the current rung) · "Expert insight" (spends the wallet). The menu FEEDS the current
  rung; nothing on it moves the rung — only a genuine failed attempt does.
- Resource chips (Toolkit / Table of Techniques / Library deep-links) are always-available METHOD
  help and ride alongside any rung, unbudgeted.

**7. AFFECT (non-negotiable framing).** Every descent is a change of ANGLE, never a remediation —
"let's come at it from another side", never "since you're stuck". An element resolved at L3/L4 still
earns its grade-9 line-of-sight ("that lens is exactly what the top band calls a perceptive
inference — you've just built one"). After an L4, open the next same-type element with a confidence
bridge ("you built the last one — run the same method here"). Never patronise; never announce
difficulty.

**8. THE KNOWLEDGE TRACK (parallel, not a rung).** Knowledge-building (ask-first → insight → Library
reading → the student derives the concept) runs as PRE-TRAINING at question/text open, outside the
element ceiling — a reading detour never counts against the four turns. After pre-training, a
mid-element failure is a METHOD failure and the ladder runs; knowledge resurfaces mid-element only
as a WRONG-correction of a false fact or a spent wallet insight.

**9. CODE OWNS THE STATE.** Each turn, code tells you the active element, the regime, the rung to
play, and the wallet balance. You write the dialogue for exactly that rung and emit
`@ELEMENT_JUDGE{"el":"…","verdict":"resolved|weak|failed|wrong"}`; you never decide when to
escalate, never count attempts or insights, never announce ladder state.

**Per-protocol layer:** only the LENS REGISTRY (the three angles per element type) and MODEL REGISTRY
(the unrelated model domain per element type) are authored per protocol — everything above is
inherited unchanged. See the AQA P2 reference registry in `protocols/aqa/language2/planning/`.

## C-CHECKS — grep-able acceptance (run on any planning protocol before ship)

Promoted from the P2 monolith §10; counts parameterize per paper.

| Check | Expect |
|---|---|
| Literal `@FIELD_COMMIT{"field":"…"}` marker lines | = the paper's plan-element count EXACTLY (P2: 16 = Q2×2 + Q3×3 + Q4×5 + Q5×6), every fieldId byte-matching the header contract table, each in a compile-validating reply |
| `grep -c 'Got it — continue'` | = Q-GATE row count + 1 (the acceptance line itself; P2: 4+1=5) |
| `grep -c 'HARD PRECONDITION'` | ≥ 3 (pre-planning chain + per-question gates) |
| Simulated-state vocabulary | appears NOWHERE as an instruction (only the prohibition line itself + provenance comments may contain the word) |
| `grep -ci 'all [0-9]+ steps'` | 0 (no hardcoded step counts — "all steps", never "all N steps") |
| Ownership stated at every compile | "their own words" / mode rules present per compile step |
| `@GOLD_REF` | one traceability line per question section (D7) |
| Completion announcements | 0 — no protocol-authored "plan complete" message or count (PLAN-COMPLETE is code-owned) |
| House bans | hold throughout: no "shows", no "Unit" for sub-parts, no arrows in student-facing content (internal structural notes may use arrows) |
| **C-LADDER (a) regime split** | the literal precedence line `WRONG → FAILED → WEAK/RESOLVED` appears exactly once, and `A weak-but-owned answer NEVER enters the ladder` exactly once (weak never climbs; only failed climbs, by exactly one) |
| **C-LADDER (b) method-not-content** | a LENS REGISTRY block is present in the protocol header; no registry lens line contains a source quotation or a completed reading of today's text (allowed: "the writer's attitude/focus/choice"; banned: "the writer's &lt;content-noun&gt;", e.g. "the writer's bitterness"). No insight/correction turn contains both the supplied fact AND the student's live quotation (fact-delivery guard) |
| **C-LADDER (c) wrong = falsifiable-only** | the literal discriminator `falsifiable against the text or an established fact` is present; `@ELEMENT_JUDGE` verdict `wrong` carries a named error class ∈ {misread · false-fact · technique-misID}; interpretive content is never classified `wrong`, and `wrong` increments neither rung nor attempts |

---

# APPENDIX — P1 FIRST-LIVE-RUN LESSONS (items 1–14 — still binding; grep-check on every port)

Neil's first full AQA Lang P1 runs (2026-07-03, v7.19.829–852) surfaced defects that generalise.
Each is engine-enforced (E) and/or a protocol contract rule (P):

1. **(P) Qn Total line hygiene.** Whole number; NOTHING after `A/B` on the line (the engine files
   the line's LAST X/Y). Ceiling/arithmetic notes on their own lines BEFORE the total.
   (E: `_extractQuestionMark` strips parentheticals — belt and braces.)
2. **(P) Penalties are applied-only, protocol-blind.** No considered-but-rejected penalties; no
   "(protocol: …)" citations; W1 banned family enumerated for run-to-run consistency.
3. **(P) Reflect panels: full paper AO set + never re-ask.** Choosing is the calibration act.
   Router preamble carries the PROTOCOL-PANEL OVERRIDE (panels supersede the legacy two-question
   cycle).
4. **(E) Chat furniture never reaches the document** (`_stripChatFurniture`). Keep the gate after
   the total; engine strips regardless.
5. **(E/P) Per-question reflection is state-gated** — the state block derives "panel emitted since
   last question closed" and mandates the panel before marking. (Since 849 also ledger-enforced:
   ONE per question, duplicates suppressed + silent repair.)
6. **(E) Recall-target rotation** code-owned in BOTH router setup block and frontend pre-chain —
   keep the two identical.
7. **(E) Sidebar paragraph detection anchors on `Mark Breakdown — <name>` headings only.**
8. **(P) Overall Feedback shows the MARK, not just the percentage** — chat, Overall Feedback and
   Score Summary derive from the same whole-mark totals.
9. **(P/E) Action Plan + Analytics AUTO-FILE (Neil RULED 2026-07-03; v7.19.830).** Twelve
   `@FIELD_SET` markers (+2 on redraft); `applyFieldSets` fills ONLY while empty (student edits
   never clobbered); `applySectionFills` refuses wholesale replace of field-bearing sections;
   silent repair re-requests missing markers; doc-heal replays from transcript. **Every port
   carries the filing block** (grep `action-grade-goal`); the closing gate counts it. Filed
   sections stay student-editable.
10. **(E/P) Mark arithmetic is CODE-VERIFIED (832; '+X' bonus scores 851).** Cards keep the
    auditable shape: `Worth`/`Your Score` table + `Total penalties:` line + canonical total line.
    Sub-totals DECIMAL, round ONCE, no "Base total:" lines (852 strips as net; protocol says
    "NEVER round").
11. **(E/P) Canonical grade ladder is CODE-ENFORCED (832).** Protocols still state it
    (grep "CANONICAL GRADE LADDER") — the code is the net, not the excuse.
12. **(P) Calibration-check choices = the REAL units of THAT paper's structure.** Never feedback
    bullets as buttons. (Since 852 the frontend sends the full label — labels must self-describe.)
13. **(P) Penalty (& Ceiling) Ledger in the final summary.** Per-code sums with plain names +
    counts, ceiling cost, + the "without penalties you'd be on…" reframe. Honest sums from the
    actual cards (engine rebuilds as net).
14. **(P) Honest duration estimate.** Realistic per-family figure (Language full papers: 30–45
    min; Lit essay: 20–25) — never an inflated figure that scares students off.

---

# APPENDIX — KNOWN-GAP REGISTER

From the 2026-07-01 live-run audit (R&J AQA diagnostic) + status as of v7.19.852:

| # | Gap | Status |
|---|---|---|
| 1 | Box overwrite past the cap (7-¶ essay filed "BP5" into Body 2's box) | Protocol: post-Conclusion stop + Tier rules shipped (both anchors). Code refuse-refile guard still open — lane A backlog |
| 2 | Three different totals (chat/doc/box-sum) | **CLOSED** — mark arithmetic code-owned (832–841), one ladder, ledger rebuilt from cards |
| 3 | Fabricated penalty quote | Protocol rule (A3) hard in both anchors; code verbatim-validator still open — backlog |
| 4 | Keyword-recall + main-goal silently skipped | **CLOSED** — pre-chain code-asked + gated (826); headline echo deterministic (849) |
| 5 | "Complete all 8 steps" hardcoded | **CLOSED** — "all steps" + honest duration (B-COMMON.1) |
| 6 | Score Summary missing its ✓ | completion-island — lane B |
| 7 | No progress card above tutor sign-off | completion-island — lane B |
| 8 | Essay-plan T1P1-only exemption not enforced | completion-island — lane B |
| 9 | Optimal golds not coherent across sections | **CLOSED** — self-anchoring rule (B-COMMON.5), both anchors |
| 10 | Grade-target selector limited to 7/8/9 | verify on next lit run (language pre-chain confirmed) |

---

## Changelog
- 2026-07-14 — v2.5 (codify arc, fix 5). **PART C FILLED** (was stub): planning anchor named =
  the P2 planning monolith (`protocols/aqa/language2/planning/protocol-b-planning.md`, proven
  live 2026-07-13, audit-passed READY AFTER FIXES, fixes 1–4 shipped v7.20.72); C-COMMON spine
  (de-stitched whole-file serving, OWNERSHIP LAW, byte-exact fieldId contract table + KEY-MATCH
  gate, filing-order ≠ document-order, PLAN-COMPLETE code-owned via `_buildPlanningSidebarModel`,
  code-asked pre-chain, Q-GATEs, planning marker set, insight cap, @GOLD_REF per question);
  C-CHECKS promoted from the monolith's §10 with per-paper parameterized counts. Outline contract
  + feed-forward ownership map explicitly QUEUED to the codify arc (design doc
  wml-QUEUED-plan-autofill-codify-and-p1-outline-mechanism-2026-07-13.md). Author: wml-chat-C
  (Fable 5, codify session).
- 2026-07-07 — v2.4 (the CODIFY session, post-Run-9 green at v7.19.929). A14 rows added for the
  v917–929 engine nets: Q5 ceiling one-source-at-label-write (917), code-tallied penalty Trend
  (921), Fix→Learn chip tagging shapes (922), resume-proof ledger doc-reconstruction (924),
  TIER-LIST NET (927 — protocol states the rule, code is the net), GRAND-TOTAL ONE-SOURCE with
  downward-only label fallback + bare-Total auditor entry (928/929). Companion:
  ASSESSMENT-MECHANICS.md rewritten to v2 (full v915→929 contract + §0b universality map + §9
  potential-errors register + §10 harness method) — a port is done only when BOTH docs are met.
- 2026-07-07 — v2.3 (Neil's Run-8 doc-audit rulings, v7.19.923). (1) **ANALYTICAL-VERB TIER
  LIST** (B-LANG.3, A13): F1/T1 deterministic via BANNED/WEAK/STRONG tiers; unlisted verbs
  default to no penalty; "illustrates" conflict resolved BANNED (P2's old canonical list
  corrected); "frames"/"positions" explicitly STRONG; "seems to" banned as hedge-verb with the
  evaluative-tentativeness carve-out; golds self-check verbs (STRONG tier only). (2) **N1
  RULING STANDARD** (B-LANG.3): conceptual definitions only — sibilance worked standard
  (position-agnostic) + grammatical-endings caveat; lit twin governs the terminology criterion.
  (3) **KEYWORD-VERBATIM RULE** (B-LANG.6): statement keywords extracted verbatim; never charge
  K1/suppress a criterion/coach a fix against a word the statement doesn't contain; degree only
  from "To what extent" framing; recall-validation states keywords verbatim. Applied to: aqa
  language1 (anchor — registry+N1+recall+Q4 rule+K1 line+golds), aqa language2
  (knowledge-penalties.md Global Rules 4/5 + F1 entry, inline registry, recall), aqa literature
  (golds verb check + TECHNIQUE-DEFINITION STANDARD). Un-ported boards inherit at port time via
  the anchors. Author: wml-chat-A (Fable, Run-9 prep session).
- 2026-07-04 — v2.2. **ENGINE-OWNED CLOSING CHAIN (v7.19.854, Neil ruling):** the whole assessment
  ending is code-driven — state-block summary mandate (ends `@SUMMARY_COMPLETE`, fills Overall
  Feedback, asks nothing) → code-side section-fill verify (ONE silent repair) → code-asked Hattie
  ×3 + Transfer (pre-chain mechanics, one per turn) → silent SYSTEM filing directive →
  `[ASSESSMENT_COMPLETE]` + wrap line on the filing turn → engine-rendered closing buttons incl.
  the rebuild offer. A14 rows added (closing chain, Q-GATE row synthesis, rejected-penalty strip,
  attempt-boundary full clear); B-COMMON.9 rewritten; B-CHECKS updated (`SUMMARY_COMPLETE` /
  `SYSTEM-ASKED` present, `Nothing to revisit` emission = 0); §12 contract gains
  `@SUMMARY_COMPLETE`. Lit hardened to the standard: universal penalty registry (W1→F1, T1→T2,
  K1→L1, structure-F1→STR1, old-T2→TTE1, F2→STR2; dup L1 retired), 4-col card table re-pinned
  (protocol + lit state block), family-first re-key (code-computed line in the lit state block),
  P1 summary suite ported into the lit Final Summary. Applied to P1 + P2 + lit protocols.
  Author: wml-chat-A (Fable, session 12).
- 2026-07-01 — v1. Extracted from the R&J gold file (full read) + Neil's walkthrough + live-run
  audit. Decisions locked: keep+gate keyword-recall AND main-goal (hierarchical); WC-formula display
  carve-out; self-anchoring optimal golds; gold-1 adds missing ingredients; "all steps" not counts.
  Author: wml-chat-A (Fable).
- 2026-07-02 — v1.1. Added the REPLICATION PLAYBOOK appendix. First execution: AQA Language P1
  (v7.19.826). Author: wml-chat-A (Fable).
- 2026-07-03 — v2. Neil ruling: restructure around TWO NAMED GOLD ANCHORS (AQA Lang P1 v852 =
  LANGUAGE; R&J = LIT) + poetry comparison as a LIT variant, not a third anchor. Folded in
  everything sessions 5–10 settled: engine-owned gates register (A14 — auditor/ladder/ledger 832–841,
  '+X' bonus 851, WC ceiling echo-only 841, reflection ledger + headline echo 849, closing buttons
  842, attempt rows 843, auto-file 830/839/844, retry + full-label options + Base-total strip 852);
  ONE-FAULT-ONE-CHARGE; round-once discipline; whole-mark line-final Qn totals; real-unit calibration
  options; Penalty & Ceiling Ledger; @FIELD_SET filing in the closing gate; honest durations.
  Replaced the replication playbook with the PORT SOP (ENGINE verify / ENGINE-ENABLE registered
  surfaces w/ file:line / PROTOCOL / CONFIG + phases). Updated B-CHECKS + gap register statuses.
  Author: wml-chat-A (Fable 5, session 11).
- 2026-07-03 — v2.1 (same day, Neil's P2 delta rulings — four of them universal). (1) Leniency key
  = FIRST-EVER ATTEMPT PER FAMILY (one lenient attempt for Language, one for Literature; word count
  penalised-not-enforced on it, ENFORCED with code-owned halt + re-check button after it; structure
  two-tier keys on the same flag; regime flag code-computed). (2) Penalty registry UNIVERSAL: newer
  F1/T1 system, W1 retired everywhere (A12 + B-LANG.3 updated); paper codes extend, never fork.
  (3) Granular worths sum EXACTLY to the question max — the P1 "sum 22, MIN-cap 20" note was stale
  (fixed split 1+6+6+6+1=20); bonus rows are the only above-max mechanism. (4) WC rate one number:
  5/100 ceiling (engine) — P2's stray 6/100 dies. Author: wml-chat-A (Fable 5, session 11).
