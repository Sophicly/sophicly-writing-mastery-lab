# PLANNING-LADDER PORT RECIPE (v1 — written after the AQA P2 reference build, 2026-07-19)

**What this is:** the mechanical checklist for porting the C-LADDER to another paper's planning
protocol. Written from what the P2 build ACTUALLY took (v7.20.205 build + the 4-lens review +
the v7.20.206 fix batch), so every port pays the lessons once. The UNIVERSAL prose gets promoted
into PROTOCOL-STANDARD only after the SECOND port proves what generalises (design §5.7) — this
recipe is the mechanics layer, not that promotion.

**Division of labour (settled):** Fable = per-paper pedagogy design (lens menus, L4 model domains,
model-script bank, boundary lines — everything a student reads or a rung plays). Opus = the
engineering (registry, gate, harness rows, splice placement, byte-traces, ship). The engine
itself is SHARED — a port adds config + prose, never a fork of the state machine.

---

## 0. WHAT IS SHARED (never re-implement per paper)
- The engine: `deriveLadderState` (doc-derived question walk), `applyElementJudge` (verdict
  routing + self-heals), `_ladderPrecheck` (IDK/confusion/struggle-menu), `_ladderWallet`,
  `_ladderFieldState`, stamps on `canvasChatHistory`, both-pipeline wiring, the POST `ladder`
  param, the PHP `dynamic_ladder` TELL builder, the strip lines in `stripAIInternals`.
- The marker contract: `@ELEMENT_JUDGE{"el","verdict"[,"class"]}` + `@INSIGHT_SPENT`.
- The verdict semantics, rung ladder L1–L4, one-push law, wallet ceiling 4 / sub-cap 1.

**⚠️ ONE-TIME ENGINE STEP (first port only — do it in the P1 port):** the paper is currently
hardcoded (gate = `_isLangPaper2`, one `_LADDER_QUESTION_ORDER`, one `_ladderRegistry`).
Generalise to a PAPER CONFIG keyed by the resolved paper: `{ gate(), order: [...],
registry(qKey) }` — the walk, TELL, stamps stay identical. Do NOT fork deriveLadderState.

## 1. PRECONDITION — the paper's protocol must HAVE a filing layer
The ladder rides `@FIELD_COMMIT` + outline rows. Most planning protocols emit **0** markers
(only aqa/language2 had them). Before any ladder work:
1. `grep -c '@FIELD_COMMIT' <protocol>` — if 0, the port STARTS with the filing retrofit
   (element-by-element confirm → commit pairs: outline box + plan box, per the doc-lifecycle law).
2. Verify outline rows RENDER for this paper's questions (the keymatch-harness pattern —
   `bin/planning-keymatch-harness.js`; a commit without a row is a silent no-op,
   wml-assessment.js:2383). Rows may need building (the P2 ones came from v7.20.107–.148).
3. Byte-trace: protocol filing ids ↔ template builder ids ↔ registry els. Suffix conventions
   DIFFER per question even within a paper (P2: `-q2`/`-q3` suffixed, Q4 body UNSUFFIXED, intro
   suffixed, conclusion unsuffixed) — never assume, read the builder.

## 2. REAL-STATE VERIFY (the .205 lesson — do this FIRST, not last)
The P2 ladder shipped silently dormant because the gate keyed on `state.marks`, which the real
lesson never sets. Before writing the gate or any fixture:
- Pull the REAL shortcode off the target env:
  `wp eval` search post_content for `[writing_mastery` + task="planning" + this paper's text.
  Record the exact `board` / `subject` / `text` / (absent) `marks` values.
- The gate keys ONLY on values the real lesson carries (subject-family via a normalised
  `_isLangPaperN`-style test, proven by the pre-chain precedent). The QUESTION is never gated —
  it is doc-derived.
- Harness fixtures use THESE values, labelled "REAL lesson state, verified <date>"
  ([[fixtures-must-use-real-lesson-state-not-designed-state]]). Slice real collaborators
  (the gate fn) into the sim sandbox — never stub what is under test.

## 3. THE REGISTRY (Opus, from Fable's per-paper design)
Per question, in PLANNING-BEAT order (not render order): `{ el, type, resolveBy }`.
- `el` = the outline fieldId for filing elements (byte-equal to the @FIELD_COMMIT field);
  synthetic ids (`qN-…`) for non-filing beats. el is echo-only — one producer.
- `type` = the SKILL, not the position — two beats that teach different skills get different
  types even if both are "topic" boxes (P2 lesson: Beat-4 perceptive-idea ≠ Beat-6
  difference-sentence; fade must not pre-open an unpractised skill).
- `resolveBy: 'stamp'` only for beats that file nothing. Every stamp el gets implied-resolution
  cover automatically (later element filled ⇒ beat passed).
- Order the paper's questions in `order: [...]` (exam order — the doc walk crosses questions).

## 4. THE PROTOCOL SPLICES (Fable designs, Opus places — same 9-splice shape as P2)
Copy the P2 spliced form as the mold (protocols/aqa/language2/planning/protocol-b-planning.md),
adapt per paper: Session Law 9 (carries the three exactly-once C-CHECK literals — ONLY in Law 9),
Law 7→wallet + the `@INSIGHT_SPENT` spend-signal sentence, **Law 4's marker list MUST name
@ELEMENT_JUDGE + @INSIGHT_SPENT** (the P2 review caught "Emit no others" banning our own
markers), the verdict annex (paraphrases, never repeats, the literals), the LENS & MODEL
REGISTRY (Fable: three DIRECTION lenses per element, L4 model on an invented unrelated domain,
byte-exact — the harness lens-scan checks lettered A)/B)/C) menus), the model-script bank
(structure from this paper's model answers, zero quotations), quote-vs-idea boundary lines,
§10 acceptance deltas. UNTOUCHED: every base question, filing markers, gates, forward motion.

## 5. HARNESS ROWS (Opus — the gate that keeps ports honest)
- `bin/ladder-check-harness.js`: add this paper's el list to the byte-trace (els ⊆ real
  @FIELD_COMMIT fields). The per-protocol invariant section fires automatically on "Session
  Law 9"/"LENS REGISTRY".
- `bin/ladder-sim-harness.js`: add (a) a REAL-state activation fixture for this paper, (b) a
  monolith walk fixture covering EVERY question arm of the new registry (the P2 batch left Q4
  untested — cover all arms), (c) any paper-specific shape (split questions, CW).
- Negative-test one mutation (break a rule in a scratch copy → harness must fail for the
  right reason).

## 6. SHIP
Version bump → `bin/pre-ship-check.sh` (all harnesses) → commit → staging → **one real
planning-chat drive** (weak → one push; drift → visible help change; IDK → no climb; wrong fact
→ free correction; no marker leak; resume sane). The real drive is the only check for LLM
behaviour with the TELL — everything else is proven by the harnesses.

## 7. AFTER THE SECOND PORT (P1) — the promotion step
Diff P2's Law 9 / annex / wallet prose against P1's. What is byte-identical = universal → promote
VERBATIM into PROTOCOL-STANDARD as the C-LADDER companion block (the C-CHECKS promotion path);
protocols then reference, never fork. What differed = per-paper by design → stays in each
protocol. Update this recipe with anything P1 taught that P2 didn't.

## Paper-specific watchlist (from the P2 build — check each on every port)
- One doc = whole paper? (P2 yes; if a paper is one-lesson-per-question the doc walk simply
  finds one question's boxes — no code change.)
- CW / Section B: the ladder's CW shape is **TBD — do not assume** (doc-lifecycle ruling).
  P1 Q5 = creative writing: design first (Fable), don't port TTECEA mechanics onto it.
- Split questions (Edexcel IGCSE multi-part): registry per PART; el naming must follow the
  real fieldIds, never invented part labels.
- Wallet ceiling is per-CHAT (emergent 4/paper on P2 = sub-cap 1 × 4 laddered questions).
  A paper with >4 laddered questions needs a real cross-question count decision — flag to Neil.
