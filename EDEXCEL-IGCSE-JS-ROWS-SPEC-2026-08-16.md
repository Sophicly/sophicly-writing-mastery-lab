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

Expected to need **no new rows** either, but two things want checking before its markers are authored:

1. **Q4 + Q5 in ONE document ⇒ suffix collision.** `:50498-50502` is explicit: body-only outlines
   carry a question suffix precisely because "a P1 doc holds Q2, Q3 AND Q4 outlines, and the legacy
   body ids are NOT question-scoped". An IGCSE P1 doc holding Q4 **and** Q5 hits the same trap.
   Confirm which of the two takes the unsuffixed ids before I write a single `@FIELD_COMMIT` —
   this is the #1 recurring bug class and I will not guess it.
2. **Q6 IUMVCC** should reuse `iumvcc-{intro,urgency,method,vision,counter,conclusion}` verbatim
   (AQA P2 Q5 precedent). Please confirm those rows render for `edexcel-igcse` + `language_p1`.

**⛔ And the reason P1 is not urgent:** it has **no planning lesson on prod at all** — see the
bridge-lane handoff filed alongside this doc. A P1 port would load in nothing until its LearnDash
lessons are wired.

---

## 5. NOT A DEFECT — recorded so nobody "fixes" it

`buildSyntheticTopicData` (`:47531`) maps `igcse_lang_([ab])$` a→paper 1, b→paper 2 (the spec-letter/
paper-number conflation of `reference_wml_igcse_lang_a_spec_letter_paper_conflation`). The real P2
lesson carries `edexcel_igcse_lang_a_paper_2`, which matches **neither** regex — but it never reaches
that branch, because PHP already derived `subject = language_p2` server-side
(`sophicly-writing-mastery-lab.php:802-807`) so the `subject === 'language'` guard is false. Latent
only. Leave it unless you are fixing the whole resolver.
