# EDEXCEL IGCSE — JS ROWS / GATE SPEC (for the chat that owns `frontend/*.js` + `bin/*`)

**Written by:** WML chat C, 2026-08-16 (protocol-only lane — I may not edit `.js` or `bin/`).
**Applies to:** the Edexcel IGCSE Language Paper 2 filing port committed this session, and the
Paper 1 port queued behind it.
**Read first:** `PLANNING-LADDER-PORT-RECIPE.md` §1 (precondition) and §2d of the parallel handoff.

---

## HEADLINE: THE BODY/INTRO/CONCLUSION ROWS NEED **NO JS CHANGE AT ALL**

This is the useful finding, and it is measured, not assumed.

`buildOutlineSection` (`frontend/wml-assessment.js:50451`) is already fully capability-driven:

- body rows come from `OUTLINE_CRITERIA.literature.body` (`:50481`) — the shared six + Context;
- `c.aoRequired` (`:50482`) **auto-drops the Context row** when the question's AO list has no AO3;
- `:50485` **auto-relabels Author's Purpose to AO1** when AO3 is absent.

Edexcel IGCSE Lang P2 Section A is **AO1 + AO2** (`BOARD_FORMAT_DEFAULTS['edexcel-igcse'].language_p2`,
`:47471`, and `PROTOCOL-QUESTION-STRUCTURE-MAP.md:664` — *"NO AO3 (context) is assessed"*). So the
paper renders **exactly** the six boxes, no Context, purpose stamped AO1 — which is precisely what the
protocol now files. Nothing to add.

`_planOutlineTargets` (`:38039`-ish region) is likewise board-agnostic — it derives from the plan
fieldId SHAPE, and its `has('outline-intro-hook')` / `has('outline-conclusion-concept')` runtime probes
already select the per-element intro/conclusion fan-out. IGCSE inherits it for free.

**Neil's ruling that made this true (2026-08-16, now recorded in `PEDAGOGY.md` §3b):** the student
fills the **same six boxes on every paper and every board**. A mark-scheme criterion is a MARKING
granularity, not a writing one — IGCSE P1 Q4 itemises 8 and P2 Q1 itemises 10, and *none* of those
become extra boxes. Anything the six boxes do not name (P2 Q1's "technique interplay", "strategic
selection of quotes") is taught in the box's HELPER TEXT and marked in assessment. **Do not add rows
for them.**

---

## 1. ⛔ HIGH — THE PLAN-FANOUT GATE IS BLIND TO THIS PROTOCOL. FIX BEFORE THE NEXT PORT.

`bin/plan-fanout-harness.js:59` collects protocols with:

```js
if (e.name === 'planning') out.push(p);
```

**`protocols/edexcel-igcse/language2/` has no `planning/` directory — its ladder lives in `steps/`**
(wired as planning steps 1–8 in that dir's `manifest.json`). The harness therefore never sees it. It
printed `✅ plan-fanout-harness passed` this session **while my 30 new markers went completely
unchecked** — a clean false pass, the `a-check-that-duplicates-its-subject` shape.

**Asked fix:** collect `planning` **or** `steps` (and assert the dir is referenced by a manifest
`planning` block, so the check keys on what the router actually loads rather than on a folder name).
Then re-run — my port should light up as a converted protocol with **30 fan-out ids**.

⚠️ Until that lands, the IGCSE P2 port is protocol-correct and hand-verified but **not
mechanically gated**. I verified every id by hand against the engine (table in §2); that is not a
substitute for the gate.

Same question for `bin/planning-keymatch-harness.js` and `bin/ladder-check-harness.js` — both are
described in the recipe as treating "the planning DIR as the invariant unit". Please check whether
they carry the identical `planning`-literal assumption; if so, one shared resolver fixes all three.

---

## 2. THE HAND-VERIFIED KEY-MATCH TABLE (§5d byte-trace, IGCSE Lang P2)

Every id below was traced through `_planOutlineTargets` → `_planLabelElement` and byte-compared to
the literal the protocol now emits. All 30 markers JSON-parse.

| protocol `@FIELD_SET` | engine route | label → element | outline id emitted | match |
|---|---|---|---|---|
| `plan-body-{1,2,3}` | `/^plan-(?:Q4-)?body-([123])$/` → elements | `Topic:`→topic · `TEI:`→evidence · `Close analysis:`→analysis · `Effect 1:`→effects · `Effect 2:`→effects2 · `Purpose:`→purpose | `outline-body-{i}-{el}` | ✅ |
| `plan-intro` | `has('outline-intro-hook')` → elements, family `intro` | `Hook:`→hook · `Building:`→building · `Thesis:`→thesis | `outline-intro-{el}` | ✅ |
| `plan-conclusion` | `has('outline-conclusion-concept')` → elements, family `conclusion` | `Restated thesis:`→thesis · `Controlling concept:`→concept · `Central purpose:`→purpose · `Universal message:`→message | `outline-conclusion-{el}` | ✅ |

No `context` marker is emitted anywhere on this paper (fenced with a ⛔ line in each filing block),
because the row is not rendered when AO3 is absent.

### 2b. ⭐ VERIFIED AGAINST REAL PROD DOCUMENTS (2026-08-16) — half proven, half not

I checked every `swml_canvas_edexcel-igcse*` document on prod (9 of them) for the ids my markers
target. Result splits cleanly, and I am reporting both halves:

**✅ The PLAN side is PROVEN.** The real IGCSE P2 document
(`swml_canvas_edexcel-igcse_edexcel_igcse_lang_a_paper_2_t1`, 2 users) carries exactly:
`plan-intro` · `plan-body-1` · `plan-body-2` · `plan-body-3` · `plan-conclusion`, under sections
`PLAN — Q1` / `Plan: Introduction — Q1` / `Plan: Body Paragraph 1–3 — Q1` / `Plan: Conclusion — Q1`.
**Those are byte-identical to the five `@FIELD_SET` fields the port emits.** No drift.

**⚠️ The OUTLINE side is NOT observed — derived only.** **Zero `outline-*` rows exist in any current
IGCSE P2 document.** That is expected rather than alarming: the outline block is gated
`mode === 'redraft'` (`:52105`), and **no IGCSE P2 planning/redraft document exists on prod yet** —
the planning lesson (topic 42570) has never been opened by anyone. So the 25 `@FIELD_COMMIT` targets
rest on the capability-trace in §1 and the hand-trace in §2, and have **not** been confirmed against
a rendered document.

⇒ **The first real planning drive on this paper is the check that matters.** Until then, treat the
outline filing as engineered-but-unwitnessed. Nothing about it is known to be wrong; it is simply
not yet proven, and this doc should not be read as though it were.

---

## 3. LOW — HELPER-TEXT DELTA ON THE INTRO `building` ROW (no fieldId change)

The shared intro row `building` is labelled **AO3** with the prompt *"Contextual backdrop — historical,
social, or cultural"* (`OUTLINE_CRITERIA.literature.intro`). On IGCSE Lang P2 there is no AO3, and the
paper's own intro uses that slot for **building sentences about authorial techniques and their
effects** (map row `:651`: *"Building sentence(s) establishing pertinent authorial techniques (form,
structure, language)"* + *"Building sentence(s) evaluating how techniques create meaning/effects"*).

The ROW and the fieldId are correct and filing works today. Only the label/prompt read wrong for this
paper. Suggested shape — same `aoList`-driven adaptation already used for `purpose` at `:50485`:

```js
if (!aoList.includes('AO3') && c.id === 'building') {
    adapted = { ...c, ao: 'AO1/AO2',
        prompt: 'Establish the techniques the writer uses, and how they create meaning' };
}
```

Cosmetic, student-facing, not blocking. Flagging rather than assuming — it changes wording on every
non-AO3 paper, so it is your call whether it wants Neil's eye first.

---

## 4. WHAT PAPER 1 WILL NEED WHEN ITS PORT LANDS (not yet built)

P1 (`4EA1/01`, 90 marks) is a genuine multi-question paper: Q1 2m · Q2 3m · Q3 6m (all three
**SKIP** — pure retrieval, no structure taught) · **Q4** 12m AO2 body-only ×3 · **Q5** 22m AO3
comparative full essay ×3 · **Q6** 45m AO4+AO5 IUMVCC.

Expected to need **no new rows**. The suffix question is now **DERIVED, not open** — I traced it
rather than asking, and the trace turned up two genuine defects that a bare "which one is suffixed?"
answer would have hidden.

### 4a. The suffix answer (settled by reading, 2026-08-16)

| path | taken by | body ids | intro ids | conclusion ids |
|---|---|---|---|---|
| body-only (`:50503-50509`) | **Q4** (12m, analysis, 3 bodies) | `outline-body-{i}-{el}`**`-q4`** | — | — |
| full essay (`:50525-50547`) | **Q5** (22m, ≥20) | `outline-body-{i}-{el}` **unsuffixed** (`:50538` passes `''`) | `outline-intro-{id}`**`-q5`** (`:50530`) | `outline-conclusion-{id}` **unsuffixed** (`:50545`) |

**No collision** — Q4 suffixed, Q5 unsuffixed, exactly the arrangement AQA P1 already ships and the
`:50498-50502` comment describes. Nothing to decide.

### 4b. ⛔ BUT THE PLAN→OUTLINE FAN-OUT HAS NO ROUTE FOR EITHER OF THEM

`_planOutlineTargets` only knows two body shapes:

```js
/^plan-Q([23])-para-([123])$/          // → outline-body-{p}-{el}-q{q}   ← Q2/Q3 ONLY
/^plan-(?:Q4-)?body-([123])$/          // → outline-body-{b}-{el}        ← UNSUFFIXED
```

1. **Q4 (suffixed `-q4`) has no fan-out route.** The suffixed regex stops at Q3; the `plan-Q4-body-`
   form maps to *unsuffixed* ids (correct for AQA P2, where Q4 is the full-essay question — wrong for
   IGCSE P1, where Q4 is the body-only one). **Asked change:** widen to
   `/^plan-Q([234])-para-([123])$/` and let IGCSE P1 Q4 file as `plan-Q4-para-{i}`. One character,
   but it must not disturb AQA P2's `plan-Q4-body-{i}` — the two forms stay distinct (`-para-` vs
   `-body-`), so widening is safe.

   ⭐ **CONFIRMED AGAINST A REAL DOCUMENT, 2026-08-16 — this is observed, not inferred.** The live
   IGCSE **Paper 1** doc (`swml_canvas_edexcel-igcse_edexcel_igcse_lang_a_t1`) carries these plan
   ids: `plan-Q3-para-1` · `plan-Q3-para-2` · **`plan-Q4-para-1`** · **`plan-Q4-para-2`** ·
   **`plan-Q4-para-3`** · `plan-intro` · `plan-body-1..3` · `plan-conclusion`.
   So the paper really does render `plan-Q4-para-{i}` (Q4 body-only ×3) alongside the unsuffixed
   full-essay set for Q5 — exactly the split predicted in §4a — and `_planOutlineTargets`' regex
   `/^plan-Q([23])-para-([123])$/` really does **fail to match all three of them**. The dead route is
   a fact about production, not a reading of the source.
2. **Q5's intro fan-out misses.** The intro branch probes `has('outline-intro-hook')` — unsuffixed —
   but a full-essay outline inside a multi-question doc renders **`outline-intro-hook-q5`**. The
   probe fails, and the fallback is `{ mode:'whole', target:'outline-intro-thesis-q4' }`, a row that
   does not exist on this paper. Result: the intro plan silently files nowhere. **Asked change:**
   make the probe suffix-aware (probe `outline-intro-hook{sfx}` derived from the plan field's own
   question), or have the full-essay path render intro rows unsuffixed like its bodies and
   conclusion — the inconsistency at `:50530` vs `:50538`/`:50545` is arguably the root defect.

✅ **AQA is NOT affected — I checked before claiming it.** (An earlier revision of this doc said it
was; that was wrong, corrected same session.) AQA's only full-essay-with-`partLabel` question is
P2 Q4, whose spec is `thesis_only`, so it renders exactly ONE intro row —
`outline-intro-thesis-q4` — which is *precisely* what the whole-mode fallback targets. It matches by
construction. AQA P1 Q5 is creative writing and never takes this path.

So the defect is narrow and specific: **a full-essay question with a MULTI-element (`standard`)
intro that carries a question label**. IGCSE P1 Q5 (22m, hook + comparative thesis) is the first
such question in the codebase, which is why the fallback has held until now. Fix it for IGCSE
without disturbing the P2 Q4 path that currently works.

I have NOT authored P1's markers, because they would file into these dead routes. P1 is unblocked
the moment 4b lands.

### 4c. Q6 IUMVCC

Should reuse `iumvcc-{intro,urgency,method,vision,counter,conclusion}` verbatim (AQA P2 Q5
precedent, `buildIUMVCCOutlineSection`). ⚠️ Its call site at `:52133-52138` is gated
`board === 'aqa' && _isLangPaper2()` for the non-`isPersuasive` route — check whether an IGCSE P1 Q6
resolves `isPersuasive` on its own, or the outline falls through to the generic essay branch.

**⛔ And the reason P1 is not urgent:** it has **no planning lesson on prod at all** — see the
bridge-lane handoff filed alongside this doc. A P1 port would load in nothing until its LearnDash
lessons are wired.

---

## 4d. 🔴 SEPARATE FINDING — THREE TEXT SLUGS FOR ONE PAPER ARE LIVE ON PROD

Surfaced while checking the documents above. Spec A Language Paper 2 exists on prod under **three
different text slugs**, each with its own canvas records:

| slug in the meta key | records |
|---|---|
| `edexcel_igcse_lang_a_paper_2` | the canonical one — carries the real `_t1` / `_ms` / `_msu` docs |
| `edexcel_igcse_spec_a_english_language_paper_2` | 1 `_msu` doc, 1,159 bytes |
| `edexcel-igcse-spec-a-english-language-paper-2` | 1 `_msu` doc, 1,159 bytes (dash form of the above) |

Two of the three are byte-identical orphans — work saved under a key nothing else reads. This is the
§5d write-key/read-key class exactly, and the dash-vs-underscore pair is the classic form of it.
Both orphans belong to uid 1 so no student's work is currently stranded, **but the slugs are clearly
reachable**, which means a student lesson emitting either form would strand theirs silently.

Fix direction is the registry, not a code fork: add both to `$SLUG_ALIASES` in
`includes/class-rest-api.php` so they normalise to `edexcel_igcse_lang_a_paper_2`. ⛔ Per that
file's own rules, never flip the canonical — normalisation drives meta-key construction, so changing
which form is canonical would silently re-key existing student data.

---

## 5. NOT A DEFECT — recorded so nobody "fixes" it

`buildSyntheticTopicData` (`:47531`) maps `igcse_lang_([ab])$` a→paper 1, b→paper 2 (the spec-letter/
paper-number conflation of `reference_wml_igcse_lang_a_spec_letter_paper_conflation`). The real P2
lesson carries `edexcel_igcse_lang_a_paper_2`, which matches **neither** regex — but it never reaches
that branch, because PHP already derived `subject = language_p2` server-side
(`sophicly-writing-mastery-lab.php:802-807`) so the `subject === 'language'` guard is false. Latent
only. Leave it unless you are fixing the whole resolver.
