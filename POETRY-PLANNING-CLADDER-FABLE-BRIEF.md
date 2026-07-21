# OPUS BUILD-SPEC — AQA Poetry Planning C-LADDER: the stuck-help lookup (L2/L3/L4)

**Owner:** Opus (WML chat A), 2026-07-21. **Fable: NOT used** (Neil 2026-07-21 — no design-genius
needed; we REUSE lit's ladder shape + LIFT L4 examples from existing model answers, we do not
invent).
**What this table IS (plain):** a per-element STUCK-HELP LOOKUP the AI reads during planning. For
each element (topic sentence, close analysis, effect…) three columns: **L2** a one-line hint · **L3**
three "angles" to try · **L4** a *single-element* worked example (one model sentence) shown only when
a student is stuck on THAT element. NOT a set of full model essays.

**How Opus authors it WITHOUT writing new prose (Neil's library rule):**
1. **Reuse** lit's `b-ladder.md` registry table shape verbatim (L2/L3 wording bent to poetry beats).
2. **Add the comparison angle** to L3 (mechanical — `feedback_comparative_body_is_ttecea_helper_text_only`
   says this is explicitly NOT a Fable job).
3. **LIFT** each L4 single-element example from EXISTING sources — `modules/model-answers-poetry.md`
   (2.A gold model answer + 2.B per-element gold plan) and the library's L&R model answers — on a
   poem DIFFERENT from the student's live pair. **Write no new model answers.** Verify any poem text
   pulled is real (poems.json / anthology PDF), never from memory.

---

## 0. WHAT A C-LADDER IS (so you design to the contract, not around it)

WML planning help escalates one rung at a time when a student genuinely fails an element:

- **L1** = the beat's own question (not authored here).
- **L2** = a focused hint (one nudge; points at the spot without giving the reading).
- **L3** = a lens menu: **three ANGLES, lettered A/B/C — a DIRECTION to look, NEVER a reading, NEVER content.** ("the writer's attitude" ✅ / "the writer's bitterness" ❌).
- **L4** = a **worked model of that ONE element, on UNRELATED real material**, which the student then applies to their own poems. Per element, uncapped, earned-only, gold-standard.

The **universal contract** (Session Law 9, verdict `@ELEMENT_JUDGE`, wallet, affect rules,
quote-echo, dictation tolerance) is INHERITED UNCHANGED from `aqa/literature/planning/b-ladder.md`
— Opus copies it verbatim. **Do not design the contract. Design only the registry tables + the
model-poem domain.**

Reference format to mirror exactly: lit's `b-ladder.md` §"LENS & MODEL REGISTRY" (a 4-column
table: `Element (el) | L2 hint | L3 lenses (byte-exact) | L4 model`) and its §"THE MODEL DOMAIN".

---

## 1b. RESOLVED L4 SOURCING (Neil 2026-07-21) — REAL PAIR FROM A DIFFERENT ANTHOLOGY, LIFTED NOT WRITTEN
Neil's constraints: (1) NO fake poems; (2) never reveal a poem the student is currently studying;
(3) minimise tokens. Resolution:
- **L4 model domain = a fixed PAIR of REAL poems from an anthology OTHER than the student's own.** A
  different anthology guarantees no reveal (a GCSE student studies one cluster), and it's real.
- **PRIMARY pair (already written — zero new tokens):** Owen **'Exposure'** vs Hughes **'Bayonet
  Charge'** — a COMPLETE gold-standard comparison already in `modules/model-answers-poetry.md` §2.A,
  every element (Form/Structure/Language · TTECEA+C). These are **Power & Conflict** poems. Serve to
  every NON-P&C student (Love & Relationships, Worlds & Lives, other boards). L4 = LIFT one sentence
  per element from §2.A — write nothing.
- **FALLBACK pair (for P&C students only):** a real pair from a different anthology. FIRST check the
  library / model-answer resources for an existing L&R (or other-cluster) gold comparison; only
  author if none exists.
- **Router rule (Opus):** pick the model pair whose anthology ≠ the student's current anthology. With
  the ladder anthology-agnostic, this one bank serves all three AQA clusters + other boards.
- **The only hard line:** never model on the student's current-anthology poems. Verify every lifted
  line is the REAL poem text (poems.json / anthology PDF), never memory.

## 1. (superseded framing kept for context) L4 MODELS RUN ON A REAL POEM — see §1b for the resolved plan

Lit fixes all L4 models on an INVENTED folk tale ("The Clockmaker") because for a set text like
Macbeth *any* real Macbeth content IS the answer. **Poetry does NOT invent.** (PEDAGOGY.md §7l:
"why would we have to invent a text when we have so many that we can use?")

**Your model domain = a REAL AQA Love & Relationships anthology poem** — one the student is NOT
comparing in today's lesson. Because the exam pairing varies per lesson while the registry is
authored once, design it as:

- **PRIMARY model poem** — a real L&R anthology poem rich in Form + Structure + Language features
  (so all three bodies can model on it). You choose it from the real anthology; name it explicitly.
- **FALLBACK model poem** — a second real L&R poem, used at runtime ONLY when the primary happens
  to be one of the student's two live poems this lesson (Opus wires the swap). This is the sole
  guard; Neil has ruled that in every OTHER case a student later recalling the model poem is a
  LEARNING GAIN, not leakage — so no cluster-exclusion logic, just primary+fallback.
- **The only hard line:** never model on TODAY's exact live pair. Any other real anthology poem is
  fair game.

⚠ **Do NOT quote poem lines from memory.** Give the model poem NAME + which features you'll model;
Opus will pull the verified poem text from `poems.json` / the anthology PDFs and hand you exact
lines to author the byte-scripts against (hallucinated poem text has shipped before — hard-blocked).

---

## 2. THE ELEMENT SET (derived from the real protocol — `aqa/poetry/planning/b5-bodies.md`, b7, b8)

AQA poetry anthology = single comparative essay **/30**, AO1+AO2+AO3. Structure = Intro + 3 bodies
(**Body 1 = Form, Body 2 = Structure, Body 3 = Language**) + Conclusion. Bodies use **Comparative
TTECEA+C**, marking each poem then comparing. Registry must cover every element below.

### 2a. Bodies arc (b5) — per body `{i} ∈ {1,2,3}`, els shown are the OUTLINE fieldIds
| # | Element | el (fieldId) | AO |
|---|---|---|---|
| 1 | Comparative Topic Sentence (concept) | `outline-body-{i}-topic` | AO1 |
| 2 | Comparative Technical Terminology | `lit-technique-b{i}` (files nothing; feeds TEI) | AO2 |
| 3 | Evidence + Inference (TEI sentence) | `outline-body-{i}-evidence` | AO2/AO1 |
| 4 | Comparative Close Analysis | `outline-body-{i}-analysis` | AO2 |
| 5 | **Effect — Poem A** | `outline-body-{i}-effects` | AO2 |
| 6 | **Effect — Poem B** | `outline-body-{i}-effects2` | AO2 |
| 7 | Comparative Author's Purpose | `outline-body-{i}-purpose` | AO1/AO3 |
| 8 | Comparative Context (causal: context→concept→method) | `outline-body-{i}-context` | AO3 |

**THE COMPARATIVE SIGNATURE (Neil's settled ruling — `feedback_comparative_body_is_ttecea_helper_text_only`):**
the comparative body is the SAME TTECEA+C rows — the comparison lives in HELPER TEXT, not extra
rows. The effect rows carry it: `effects` = **Effect on Reader — Poem A**, `effects2` = **Effect on
Reader — Poem B** (one effect per poem, not two on one poem). Every element's L2/L3 should carry a
one-line reminder to *integrate the comparison* (e.g. an L3 angle like "the CONTRAST in how each
poet handles X"), but you never add a 7th "comparison" element — comparison is a move inside each
element.

### 2b. Intro (b7) & Conclusion (b8) — from OUTLINE_SPECS `aqa_poetry_anthology` (standard/standard, buildAO=AO3, purposeAO=AO1/AO3)
- **Intro:** Hook (AO1) · Building Sentences (AO3 context) · Thesis (AO1, comparative).
- **Conclusion:** Restated Thesis · Controlling Concept · Author's Central Purpose (AO1/AO3) ·
  Universal Message · (poetry adds an **evaluative judgement** beat — confirm against b8).

Author registry rows for these too (lit's ladder covers its intro/conc arc). Same rule: L3 = angle
not reading; L4 = model on the real fallback/primary poem's intro-or-conclusion move.

---

## 3. WHAT TO DELIVER (one markdown block Opus will splice into `b-ladder-poetry.md`)

1. **§ MODEL DOMAIN** — name PRIMARY + FALLBACK anthology poems; one line each on why they're rich
   for Form/Structure/Language; (leave exact quoted lines as `<OPUS: verified line>` placeholders —
   Opus fills from poems.json).
2. **§ LENS & MODEL REGISTRY tables** — mirror lit's 4-column format, one table per arc:
   THE BODIES ARC (the 8 rows above, per-body where the angle differs by Form/Structure/Language),
   THE INTRO ARC, THE CONCLUSION ARC. For each element:
   - **L2 hint** — one focused nudge, obeys the quote-echo law (echo the student's anchor words).
   - **L3 lenses** — exactly three lettered A/B/C ANGLES, byte-exact, direction-only, ≥one carrying
     the comparison move. NEVER a reading, NEVER a content claim, NEVER a quote from today's poems.
   - **L4 model** — what you model on the PRIMARY poem for that element (a script-shape, gold-standard).
3. **§ Model-script bank** — the fuller L4 scripts (like lit's M1L/M2L/M3L), on the model poem.

**Design bar:** every model must itself meet our grade-9 gold-standard (TTECEA+C, two-effect,
academic register, no "shows", British English, no arrows). Angles must genuinely differ (not three
rewordings). Match the taught pedagogy in b5 (Form-first rationale, causal context chain, empathy as
a key effect, specific emotion vocab).

**Out of scope for you:** markers, fieldIds, the verdict contract, wallet counting, doc-variant,
manifest — all Opus. If you think an element's fieldId is wrong, flag it; don't redesign it.

---

## 4. OPEN FOR NEIL BEFORE BUILD
- Confirm PRIMARY/FALLBACK model-poem approach (vs a single fixed poem accepting rare overlap).
- Confirm this targets **Love & Relationships** first (the staging lessons use
  `text="love_relationships_poetry"`); Power & Conflict / Worlds & Lives registries port after.
- NOTE: L4 examples are LIFTED from existing model answers, not authored fresh (§0). Opus verifies
  every pulled poem line is real (poems.json / anthology PDF).
