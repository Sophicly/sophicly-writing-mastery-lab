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

### 1b. ⭐ TWO CONTENT GRADES (v7.20.216/.221 — Neil sign-off on P1; NON-NEGOTIABLE on every port)
The filing layer has TWO grades, ONE source, converging at approval (the restored doc-lifecycle
law: plan and outline hold the SAME content at two layouts):
- **`@FIELD_COMMIT` = LIVE + VERBATIM + OUTLINE-ONLY.** Each confirmed element files the
  student's raw words into its outline element box AS THEY PLAN. Plan boxes NEVER fill live
  (raw-dictation accumulation was the .216 alarm).
- **`@FIELD_SET` = ONCE, AT MIRROR-BACK APPROVAL, PLAN BOX.** One marker per paragraph,
  labelled elements ` | `-separated, plan-mode-condensed, ONLY the student's words (the
  A-Happy click is the ownership checkpoint — PEDAGOGY.md §9).
- **The ENGINE does the rest — never add a second marker set.** `_applyFieldValueSets`
  renders the plan value as one LINE per labelled element, and `_planFanoutToOutline`
  writes the same refined text per-element into the outline boxes (replacing the raw).
  New papers extend `_planOutlineTargets` (plan field → outline ids) and, if the paper
  introduces new element labels, `_planLabelElement` (label → element key: lit adds
  `Context:`; comparative adds per-source effect labels).
- **The gate:** `bin/plan-fanout-harness.js` (pre-ship) runs every protocol's literal
  @FIELD_SET templates through the real sliced engine and fails on any unmapped label or
  unreal outline id. It skips unconverted protocols — your port is enforced the moment its
  first plan @FIELD_SET lands. Do not ship a port while it reports FAIL.

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

## 5b. ⭐ MANDATORY ADVERSARIAL REVIEW PASS (before ship — an INDEPENDENT fresh-context reviewer, never the builder)

Every port gets one adversarial review by a reviewer who did NOT build it (fresh-context
agent), briefed to REFUTE and to report only defects that survive its own verification, with
file:line cites. This is a GATE, not a nicety: on the P2 build it produced the .206 fix
batch; on the LIT build (v7.20.230/.231) it caught 2 defects TWO builder self-passes missed
(a beat still hand-running its own scaffold; lenses naming candidate concepts). The SIX
LENSES (brief the reviewer with all of them):

- **A. OWNERSHIP:** METHOD and verifiable FACT only — never a READING. Hunt L2 hints, L3
  lenses, L4 scripts, and every splice for handed interpretations, set-text content, or a
  model that leaks an answer. A lens naming a CANDIDATE CONCEPT the student could adopt
  wholesale is content, not a direction.
- **B. CONTRACT COMPLIANCE:** diff the port's ladder text against PROTOCOL-STANDARD §C-LADDER
  and the P2 mold — any universal rule missing, weakened, or quietly reworded (including in
  the port's own acceptance block)?
- **C. REGISTRY/BEAT BYTE-MATCH:** every registry el ↔ literal @FIELD_COMMIT field or
  declared synthetic; JS registry + order ↔ protocol tables ↔ the real beat sequence;
  @FIELD_SET labels ↔ the fan-out label map.
- **D. INTERNAL CONTRADICTIONS:** any surviving text still hand-running a scaffold sequence,
  self-counting insights, or otherwise fighting the code-owned ladder? Check EVERY beat of
  every step file, not just the ones the builder says were converted.
- **E. LANGUAGE BANS:** British English; no "shows" as analytical verb; no "Unit N"
  sub-part labels; no arrows in student-facing content; machinery words (rung/ladder/
  wallet/verdict) never in student-facing scripts.
- **F. MODEL SCRIPTS:** each L4 script itself meets gold standard (no "shows", tentative
  purpose verbs, invented-domain content only, no set-text quotation) and ends handing the
  method back to the student's own words.

Fix every CONFIRMED defect in the same cycle, then re-run the mechanical gates. Two builder
self-passes are NOT a substitute — author-blindness is the failure mode this step exists for.

**THE STOP RULE (convergence criterion — never decide "enough passes" by feel):** review
passes repeat until an independent adversarial pass returns **ZERO findings of MEDIUM or
higher severity**. A pass that finds a MEDIUM+ defect gets its fixes applied and ONE more
confirming pass (scope the re-pass to unswept surface + the found defect's class — not a
full re-sweep of already-verified-clean lenses). A pass returning only LOW/none = converged,
STOP; further passes are theatre. Note what static passes can NEVER catch: live LLM
behaviour (marker emission at the right turns, rung-playing quality) — that residual is the
one real planning drive (§6), not another review.

**SWEEP SCOPE (the LIT pass-3 lesson):** the reviewer's target list must include EVERY file
the manifest loads for the task — the `always` and per-step MODULE files (macros, knowledge,
progress, workflow-entry), not just the step files the builder edited. Legacy scaffold
macros, stuck-detect sequences, or self-counted insight limits in a module ride every step
and fight the ladder exactly like an unconverted beat. Module conflicts are retired by a
NAMED, SCOPED supersession block in the port's ladder text (see b-ladder.md ⛔ SUPERSESSION —
the lit mold), never by editing shared modules other boards depend on. Known accepted edge:
if the code state block ever fails to inject, the supersession predicate goes false and the
legacy module machinery resurrects for that turn — an intentional degradation fallback
(some scaffolding beats none), not a defect.

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

## What the P1 port taught

### v7.20.209 additions (Neil's first live P1 drive — port these WITH the mold)
- **The engine dispatch is part of the port surface.** `applyFieldCommits` sat inside the
  `cw_` guard in BOTH pipelines — every ladder filing no-opped live while all static gates
  stayed green (sim calls functions directly; the gate lived in pipeline dispatch). The
  ladder-check harness now asserts the call sites are ungated (PIPELINE DISPATCH check).
  Cascade: unfiled doc ⇒ `deriveLadderState` never advances (it reads doc field state) ⇒
  TELL/rung frozen ⇒ push mis-accounting. One live drive caught what 74 sim assertions
  could not — budget ONE real-drive leg per port.
- **Monolith mold gained laws 5 (never name the machinery) + 5b (dictation tolerance) and
  the `technique-misID` mini-check arm** — copy the current P1/P2 monolith text verbatim;
  they are universal voice/UX laws, not paper content.
- **"TTE sentence" is banned — the element is the TEI sentence** (Technique + Evidence +
  Inference). Renamed across all protocols 2026-07-19; new ports must not reintroduce it.
 (v7.20.208, 2026-07-19 — additions the P2 build couldn't know)

1. **Engine step 0 is DONE.** `_ladderPaperKey()` + `_LADDER_QUESTION_ORDERS` + the
   `_ladderRegistry` dispatcher (`_ladderRegistryP1` / `_ladderRegistryP2`) now exist. A new
   paper adds: a `_isXxx()` gate leg in `_ladderActive`, an order entry, a registry fn — the
   walk/TELL/stamps are untouched, as designed.
2. **The PRE-PLANNING CHAIN is part of every port** (it wasn't in §0's shared list). It is
   paper-gated (`_planPreChainActive`) and its prediction stages are now SOURCE-COUNT-derived
   (`_planChainSourceCount`: doc-derived, paper fallback): predB + the tidy trigger + the
   sidebar's final-pred detection + `predsFiled` all key on it, and the greeting/tidy texts
   derive paper name + prediction count. The predictions SECTION falls to the generic
   per-source branch for non-P2 papers (pred-paper + pred-source-a…). A port to a paper with
   a different source count touches NOTHING — it derives.
3. **An un-laddered stage after the last laddered question is safe**: P1 Q5 (CW scene spine)
   runs after Q4 resolves. The TELL's done-branch wording is stage-neutral ("every LADDERED
   element… move to the protocol's next stage") — never re-tighten it to "the plan is
   complete".
4. **No-gold-files papers** (P1 has no a-qN-gold.md — golds live in the assessment cards):
   the monolith's traceability block cites protocol-a-assessment.md sections in prose instead
   of `@GOLD_REF` lines; check-gold-shapes stays out of it.
5. **Activation proof without a browser**: subject derives server-side in
   `render_embedded_wml` (subject==='language' + text → `text_to_template_slug` →
   `language_pN`); read that chain against the real shortcode and put the DERIVED form in the
   sim fixture (P1 used 'language_p1'). The real lesson may already exist under a misleading
   title — search post_content for `task="planning"` + the text slug, never trust titles
   (P1's planning lesson lives in topic 42364, titled "Diagnostic Assessment… Q5").
6. **Negative test, cheap form**: python-swap one @FIELD_COMMIT fieldId in the real protocol
   → run ladder-check-harness → it must name exactly that orphan el → swap back, re-run green.

## What the LIT port taught (v7.20.229 — first MODULAR protocol + first single-essay paper; Eduqas/Edexcel lit ports follow THIS shape)

1. **Modular protocols get a `b-ladder.md` on the manifest's ALWAYS list.** A step-file
   protocol (b1…b10 + manifest slicing) cannot carry Session Law 9 inside one step — the
   contract would vanish on every other step. The whole ladder module (Session Law 9 +
   verdict contract + LENS & MODEL REGISTRY + model-script bank + acceptance block) lives in
   ONE new always-loaded file; step files carry only short `[AI_INTERNAL — C-LADDER]`
   handover splices. ladder-check now treats the planning DIR as the invariant unit
   (concatenated), and asserts the manifest `always` entry exists — a step-scoped ladder
   file is a hard fail.
2. **A single-essay paper walks as ARCS, not questions.** Lit order =
   `['bodies', 'intro', 'conclusion']` (planning-beat order — bodies first, Neil's
   2026-07-20 ruling). 'bodies' is ONE walk unit so fade/pace carry across the three
   TTECEA+C paragraphs (the P2-Q3 precedent: 3 paragraphs = one question); the wallet's
   per-question sub-cap then lands 1 insight per arc under the universal ceiling 4 — no new
   wallet law needed.
3. **Convert the beats' hand-authored scaffolds — never leave them running beside the
   ladder.** Legacy step files carried their own "LEVEL 1-4" stuck sequences (b7 hook,
   b8 concept/purpose/message). Left in place they double-ladder (the LLM obeys the local
   sequence, code's rung state desyncs) and one (b8's LEVEL-3 "thought-starter") flatly
   supplied a READING — an ownership violation. Rule: the beat's first stuck-question
   becomes the WEAK-push; pointing prompts become L2 raw material; category menus become L3
   lenses; every "deploy Did You Know" becomes wallet-governed (`@INSIGHT_SPENT`); any
   assemble-it-for-them scaffold DIES. Same for stale media: the b6 "workbook" recall levels
   became a document-pointer (the plan lives IN the doc beside the chat).
4. **One narrative model domain for the whole paper.** Lit L4s all run on ONE invented tale
   ("The Clockmaker" — three lines, beginning/middle/end) so the model domain itself mirrors
   the B/M/E anchor arc the protocol teaches. A lit-family port needs its OWN invented tale
   (never reuse another paper's verbatim — students cross papers), same three-moment shape.
   NEVER use other set texts as parallel examples (the old b8 universal-message scaffold
   quoted A Christmas Carol/Macbeth messages — if the student's text IS one of those, the
   example is the answer).
5. **Recall of the student's own filed work is KNOWLEDGE-TRACK, not a laddered element**
   (b6 Step 1). No @ELEMENT_JUDGE inside it; quoting their own filed words back is recall
   support, not injection.
6. **Synthesis beats that file nothing later get implied-resolution cover** — b6's
   `lit-overarching-concept`/`lit-working-thesis` (stamp-resolved) are implied-resolved when
   the b7 refined thesis box is filled, so a resumed doc never re-pins b6 (sim LIT-A4).
7. **Shared TYPE = deliberate fade bridges:** b6 concept ↔ b8 controlling concept share
   'concept-synthesis'; working/refined/restated thesis share 'thesis' — a skill practised in
   the intro arc opens its conclusion twin at L2. Distinct skills (hook, building,
   central-purpose, universal-message) keep their own types even though each has no sibling.
8. **Unsuffixed el collisions across papers are fine** — lit body els equal P1/P2 Q4's
   (`outline-body-{i}-topic` …); papers are disjoint by the `_ladderActive` gate, no bleed
   (sim LIT-R1 + P1-R5 prove dispatch).
9. **Gate = the essay-family subject set the router serves the protocol dir for**
   (`shakespeare|modern_text|19th_century` → aqa/literature), byte-normalised like the lang
   twins. Bare `literature` stays dormant (no real lesson carries it; sim asserts it).
   Verify the family against the ROUTER's subject→dir map, never guess.
10. **Wallet supersession is part of the port:** legacy self-counted insight counters
    (b-intro's "DYK counter: max 3/session") must be rewritten to point at the code-counted
    wallet — two counters means the LLM obeys whichever it read last.

## Paper-specific watchlist (from the P2 build — check each on every port)
- One doc = whole paper? (P2 yes; if a paper is one-lesson-per-question the doc walk simply
  finds one question's boxes — no code change.)
- CW / Section B: the ladder's CW shape is **TBD — do not assume** (doc-lifecycle ruling).
  P1 Q5 = creative writing: design first (Fable), don't port TTECEA mechanics onto it.
- Split questions (Edexcel IGCSE multi-part): registry per PART; el naming must follow the
  real fieldIds, never invented part labels.
- **⚠️ EDUQAS DUAL-PART PLAN-ID LANDMINE (spotted 2026-07-20, unfixed — fix BEFORE any Eduqas
  markers land):** the dual-part doc dispatch calls buildPlanSection('Part A'/'Part B')
  (wml-assessment.js ~38039-38056) but buildPlanSection's plan fieldIds are NOT part-suffixed
  (plan-intro / plan-body-{i} / plan-conclusion, ~34307-34329) — a two-part Eduqas doc renders
  DUPLICATE plan fieldIds across parts (write-key collision, the #1 bug class). Outline ids
  ARE part-suffixed. The Eduqas port must part-suffix the plan ids + on-load heal BAKED docs
  first. Verified Eduqas Shakespeare structure (map rows, cited): part (a) 15m = 3 BP + SHORT
  intro (thesis only) + SHORT conclusion (restated thesis only), anchors ALL from the extract
  (the anchors-ruling exception); part (b) 25m (20+5 SPaG) = full intro + 3 BP + full 4-element
  conclusion, B/M/E whole play; NO Context row either part (AO1+AO2 only).
- Wallet ceiling is per-CHAT (emergent 4/paper on P2 = sub-cap 1 × 4 laddered questions).
  A paper with >4 laddered questions needs a real cross-question count decision — flag to Neil.
