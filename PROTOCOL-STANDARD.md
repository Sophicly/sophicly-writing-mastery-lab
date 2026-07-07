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
- Part C = the planning spec (stub — fill after the assessment standard is proven).
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

# PART C — PLANNING PROTOCOL SPEC (STUB)

Planning is the flip side of assessment — same Part A invariants, mirrored components (assessment's
predict-mark reflection ↔ planning's anchor-quote commitment; per-criterion mark table ↔ per-element
scaffold check; calibration ↔ plan-vs-execution review). **Fill this part only after the assessment
standard has survived contact** (P2 + Edexcel IGCSE ports built against Part B, Neil signed off).
Reference candidates for the planning gold: `protocols/aqa/literature/planning/` b-modules — evaluate
and pick the reference explicitly with Neil before codifying.

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
