# CW Steps 5 · 6 · Plot-Update Lessons — End-to-End Plan (2026-07-24)

**Status: DRAFT — awaiting Neil's approval before any build.**
Scope law: root CLAUDE.md #16 (plan the whole feature end-to-end BEFORE building).
Interaction law: WML CLAUDE.md 4c (THE ASK TEMPLATE + WALK LAWS) — every ask in this plan follows it.

---

## 0. The one architecture rule (Neil, 2026-07-24)

**ONE living plot-outline document per project.** Step 6 fills it. Steps 11/14/17/20/23/26 open
THAT SAME document and add a layer each. Nothing else ever writes to the `plot_outline` artifact.
The Step-11-style separate "workbook" docs RETIRE as documents — their question text survives as
the update-walks' chat asks.

---

## 1. The chain (every layer, per root CLAUDE.md #15/#16)

| Layer | What it is | State today | This plan |
|---|---|---|---|
| Data | `plot_outline` artifact (per project, user_meta JSON blob) | EXISTS — mirror-save wired (3s debounce) | unchanged store; ONE writer rule enforced |
| Doc shape | 8 archetype templates × 6 stages × ~108 beat rows (in `wml-assessment.js` template defs) | EXISTS (Step-6 doc builds from chosen archetype) | + layer-rows appended by update lessons |
| Step 5 | Choose plot structure | built; menu-ish, weak UX | redesign to 4c walk (see §3) |
| Step 6 walk | fills the outline | API-led Socratic (heavy) | programmatic element walk (see §4) |
| Update lessons ×6 | 11 goals · 14 archetypes · 17 empathy · 20 theme · 23 genre · 26 structural | ⚠ open a SEPARATE workbook doc; mirror-save can CLOBBER the outline | unified on the one doc (see §5) |
| End-user surface | student sees outline evolve across the course | broken by the workbook fork | fixed by §5 |
| Readers | Trials + drafts + dep-priming read `plot_outline` | wired | verify after §5 (no clobber = honest reads) |

## 2. Verified facts this plan stands on

- Templates: **8 archetypes**, all **six** stages (`setup / dream / fascination / nightmare /
  final-push / aftermath`), ~108 beats each, 881 total. Similarity vs Hero's Journey: V&R 98% ·
  CoA 94% · Quest 91% · R2R 86% · OtM 77% · Rebirth 63% · Tragedy 61% (divergence = Stage III +
  endings). Source: template defs in wml-assessment.js (~line 2625722-char offset region).
- `CW_ARTIFACT_MAP`: 5→`plot_structure_choice`, 6→`plot_outline`, and 11/14/17/20/23/26 ALSO
  →`plot_outline` (the clobber risk AND the unification lever).
- Artifact mirror: every canvas save mirrors doc HTML→artifact after 3s (41608). Update-step
  preload branch exists (23786) but the workbook doc wins the render today (Neil's Step-11
  screenshot) — exact firing order to be traced in Phase C before any change.
- Beat rows carry `beatType` (`negative`/`positive`/`turning-point`) — turning points are the
  non-skippable spine.

## 3. Phase A — Step 5 redesign (smallest, ships first)

The decision is real but light: pick the archetype that fits the story. 4c walk:

1. Opener (paced): what a plot structure is · don't overthink — you can re-choose · buttons.
2. **Recommendation ask** — code reads their Step-4 throughline + spine and NAMES the 2-3
   archetypes that usually fit ("defeated ending → look at Tragedy first"), with one-line
   what-it-is each + 📖 Guidance chip (8-structures guide section) per candidate. Chips = pick.
3. On pick: code files `plot_structure_choice` + `plot_structure_key` (existing artifacts),
   fills the doc's choice row, then ONE free-text ask: "why does this shape fit your story?"
   (their reasoning row — genuine thinking, filed verbatim; light AI verdict optional — default
   NONE, per Neil's light-touch).
4. Secondary-elements + authorial-intent rows (already in the doc): 2 short free-text asks,
   filed verbatim. Done.

**API calls in Step 5: zero required.** (Optional single "Ask Sophia — which fits my story?"
fallback chip = one call, on demand.)

### 3b. THE HELP LADDER — applies to EVERY ask in Phases A, B and C (Neil ruling, 2026-07-25)

Codified as WML CLAUDE.md **4c.9**; the short form, because it shapes how every ask below is
written. Neil: *"if we make it so that the students have lots of examples and very clear
criteria… they'll become much less reliant on the API… maybe they could ask Sophia, but only as
a last resort, so we leave that option buried underneath a few options."*

**Rung 0** the ask — criteria + **ONE worked example inline** (never abstract), ends on the
question · **Rung 1** `[💡 More examples]` → 2–3 more, code-served as a new bubble ·
**Rung 2** `[📖 Guidance]` + `[🗂 <Technique>]` → guide section + the concept's technique card ·
**Rung 3** `[🤔 Still stuck — ask Sophia]`, visually last and quieter — **the only rung that
spends an API call.**

Two rulings that decide where the content comes from:
- **Depth lives in the TABLE OF TECHNIQUES, not the reference guide.** The 217 cards already
  carry per concept a definition + THREE worked examples from varied texts + reader effects, and
  the chat already deep-links them (`window.SophiclyTable.open(sym)`). The guide keeps
  STRUCTURE-level teaching (what Rags to Riches is, how the six stages work) and does not
  duplicate ~40 concepts into a second, drifting copy.
- **Map to concepts, never author per row.** The eight plot templates hold **865 beat rows**
  (106–112 each) — verified by count, not estimated. Per-row authoring never finishes. Those rows
  are ~40 recurring concepts reworded, and 112 concepts already exist as narrative/structure/
  archetype cards. Phase B's deliverable is a **row → technique-symbol map**; a concept with no
  card gets a new technique entry. This is what makes Rung 1/2 nearly free to build.

Judgment is NOT a rung — the ladder governs the HELP direction only. A turn that reads the
student's free text stays a judgment call (4b watch-it) and is never stripped to save a call.

### 3c. SEEDED BOOKENDS IN STEP 6 — ANSWERED (Neil, 2026-07-25)

Neil: *"a spine beat anchors a stage, never fills it — I agree… I'm not saying re-ask, but maybe
the student just wants to see if there's anything, because as you're doing this the student's
ideas will be evolving, so they might want to fine-tune it a bit."* Ruled:
1. **Echo as the anchor, never re-ask** (paste-wall law). A stage holds MANY beats (Stage I ~9 of
   its ~15 rows), so a spine beat ANCHORS the stage; the student still works its elements.
2. **Light confirm, not a review gate:** `[That's still right →]` / `[I'd sharpen it]`. The
   second opens a free-text rewrite; the first moves straight on. Mandatory review every stage
   would fight forward-motion, but the OPTION matters because ideas evolve between Step 4 and 6.
3. **An edit is a `rewrite` cycle, not `accumulate`** (4c.6) — one self-contained sentence.
   Getting this wrong stitches two openings together: the .289 logline bug.
4. **An edit writes to the STEP-6 doc ONLY, never back to Step 4** (stage-record law is
   forward-only; the Step-4 artifact is the historical record of what they did in Step 4).
5. **Beat 6 → Stage VI: same pattern, stronger prompt** — "You planned to end here — does that
   still hold, now you've built the middle?"

## 4. Phase B — Step 6: the programmatic element walk (RULINGS APPLIED, Neil 2026-07-24)

One controller (`_cwOutlineCtl`), driven ENTIRELY by the chosen archetype's template — zero
per-archetype authoring; Tragedy's different beats ride automatically.

**Three altitudes (Neil's beginning/end framing — the forward-thinking scaffold):**
1. **Story bookends first.** Code ECHOES their Step-4 Beat 1 ("At first…") and Beat 6 ("Until
   finally…") — never re-asks (paste-wall law) — then one ask: keep as anchors / sharpen.
2. **Stage bookends on entering each stage:** "How does your protagonist BEGIN this stage — and
   how are they different when they LEAVE it?" Two quick asks, filed into a NEW stage-arc row
   per stage (healed into existing docs on load).
3. **Then every element**, one at a time, anchored between the known start and end.

- **Per beat:** ONE ask from the template's own label + prompt + symbolic nudge ("what could
  this stand for in YOUR story?"). Verbatim auto-file into the beat's row **+ AUTO-TICK the
  beat's checkbox in the same write** (hand-ticking dies). No AI judgment, no push.
- **⛔ NOTHING SKIPPABLE (Neil ruling).** Every element asked in order. Length is compensated by
  momentum + examples + "rough is fine" + per-stage progress — never by skipping.
- **Help ladder per ask (3 tiers):** 💡 Examples (code-served: stage examples + this beat
  expanded) · 📖 Guidance (guide section) · **Ask Sophia** (the ONLY per-beat API use: "an
  example for MY story" — reads their logline/spine context, on demand).
- **Progress:** per-stage counts ("Setup — 9 of 15") in sidebar + ask headers; resume from
  first empty row (doc-derived, like CW3/CW4).
- **Coherence — THREE LAYERS (Neil ruling, superseding the earlier "drop it"):**
  1. **Whole story at SPINE level = Step 4's existing check** (fireCoherenceCheck, v7.20.264,
     live) — untouched; it already validates the 6-beat concept end-to-end.
  2. **Per-stage micro-check** on completing each Step-6 stage: reads ONLY the stage's bookend
     answers (begin/end) + its turning point; verdict = does the stage travel from entry to
     exit, and does the exit CAUSE the next stage's entry? One Socratic question on a gap.
     Six small calls (~hundreds of tokens each), never the full doc.
  3. **Whole story SAMPLED at the finish** (Neil's hook/climax/end idea): ONE small call
     reading the opening beat + Stage-V climax + closing beat + their logline — incl. the
     opening/closing-image mirror criterion the templates themselves state. Not a Step-4 redo:
     Step 4 checked the PLAN; this checks the three load-bearing points of what they WROTE.
  Code-only completeness stays free (all elements filled = stage ticks green).
- Pacing law: one bubble per ask; stage orientations paced via `serveCwChunks`.

**API calls in a full Step-6 run: ~7 small judgment calls** (6 stage micro-checks + 1 sampled
finish) + on-demand Ask-Sophia examples. No full-document reads anywhere.

### 4b. Re-choice migration (Step 5 changed after Step 6 started — Neil ruling)
- Re-choice confirm in Step 5: "Changing structure rebuilds your outline — everything that
  matches carries over. Continue?" (gentle discouragement, never a block; forward-motion).
- Doc rebuilds from the NEW archetype's template, **preserving student text for every beat
  whose label matches** (label-keyed carry-over — the 85–98% overlap does the work); divergent
  beats start empty. Checkbox state carries with the text.
- Chat/walk needs NO migration by construction: the walk resumes at the doc's first empty row,
  so it automatically continues where the new template has gaps.

## 5. Phase C — Update lessons 11/14/17/20/23/26 unified on the ONE document

**FORWARD-SNAPSHOT (Neil, 2026-07-24 — same law as the literature phase chain):** each lesson's
doc is its own record, SEEDED from `plot_outline` on entry; its edits mirror back to
`plot_outline`; every LATER step reads the updated head. Updates flow forward only — Step 11's
changes appear in 14/17/20/23/26; never backwards.

1. **Trace first (mandatory):** exact firing order of workbook-doc build vs `plot_outline`
   preload vs mirror-save on the update steps — name the current clobber path with file:line.
2. Entry = the **plot outline** (their filed Step-6 outline). No workbook doc, ever — "retired"
   = the worksheet stops opening as a document; its QUESTIONS move into the chat walk.
3. **Students can EDIT the existing outline text directly in the doc** (Neil ruling) — the doc
   stays fully editable in every update lesson; the walk ADDS the new layer alongside.
4. Each lesson's questions (today's workbook text = the source) become a short programmatic
   walk: per stage, the lesson's 2-3 layer questions → answers **filed into new layer-rows**
   appended under that stage (`goals-setup`, `theme-nightmare`, … — fieldIds namespaced per
   lesson, one canonical builder, key-match traced).
5. Mirror-save keeps writing `plot_outline` — now always FROM the one true doc, so the clobber
   disappears by construction.
6. Existing outlines heal on load (rows appended if absent — the baked-doc heal pattern).
7. Per-lesson guide buttons; help ladder as §4; light/no AI per answer.

## 6. Sequence + verify points (one batch per phase, prod after Neil's pass)

| # | Build | Verified by |
|---|---|---|
| A | Step-5 walk | Neil drives Step 5 fresh; choice lands in both artifacts; Step-6 gate opens |
| B | Step-6 walk | Neil files a few beats per stage on prod project; rows + `plot_outline` mirror verified by `wp eval` count; resume mid-stage works |
| C | Update-lesson unification | Step 11 opens HIS outline (63,692-char artifact visible), goals-walk files layer rows, Step-6 content intact after save (clobber test) — then 14/17/20/23/26 same mechanism verified once |

Phases ship separately (A cheap, B the core, C the fork-fix). Each = version bump + harness gate
+ staging + prod (Neil: prod ASAP).

## 7. Out of scope this arc (tracked, not forgotten)

- Guide per-element depth beyond the shipped stage-level sections (grow on demand per Neil).
- Trials 1-6 grading defect (separate handoff: `ld-to-wmlA-cw-trial-protocols-cannot-record-a-grade`).
- Steps 7-9 and later drafts (untouched by this arc except that they read an honest `plot_outline`).

## 8. Open questions — ALL ANSWERED (Neil, 2026-07-24, same session)

1. Coherence check → **DROPPED as mandatory** (token cost). Optional student-triggered
   "review my outline" button only. Code-only completeness check is free.
2. Skip rule → **NOTHING skippable.** Every element, in order. Length compensated by momentum,
   examples, "rough is fine", per-stage progress — never by skipping.
3. Workbook docs → **retired as documents**; their questions become the update-walks' chat asks.
4. NEW (Neil): the beginning/end framing (§4 altitude 1-2), auto-tick (§4), edit-in-place
   (§5.3), forward-snapshot semantics (§5), re-choice migration (§4b).

---

## 9. BUILD INSTRUCTIONS (for the Opus build chat — Fable designed, Opus builds)

**Model ruling (Neil, 2026-07-24):** the design is DONE (this doc). The build is engineering →
Opus. Escalation rule: if a UX/pedagogy call arises that this doc and WML CLAUDE.md 4c do NOT
answer, ASK NEIL — never invent a design decision mid-build. If a shipped phase FEELS wrong
when Neil drives it, that conversation goes to Fable (design), not more Opus iteration.

**Non-negotiable laws for every line you write** (all codified, all greppable):
- WML CLAUDE.md **4c** — the ASK TEMPLATE + walk laws (criteria-first, examples-in-ask, help
  pointers, action-LAST, paced orientation, push-cycle accumulation, ephemeral gates,
  transcript-visible picks). PROTOCOL-STANDARD **A17.1–.5**.
- Reference implementations to MIRROR (not re-derive): `_cwLoglineCtl` (Step-3 walk) and
  `_cwSpineCtl` (Step-4 walk) in wml-assessment.js — persistence shape, tryResume, chip
  re-attach, serveCwChunks pacing, aiBubble double-write rule, armWalkResume judgment turns.
- New code-served text → non-loaded sidecar (`_cw-step-N-source.md`); protocol files become
  judgment-only with a start marker (mirror CW-STEP-03's `@CW3_START` pattern).
- Every new fieldId (stage-arc rows, layer rows): write the key template, list every
  producer/reader, byte-diff (KEY-MATCH gate). Heal-on-load for docs that already exist.
- `bin/pre-ship-check.sh` before every commit; version bump BOTH files; deploy staging then
  prod FOREGROUND (`echo y | bash deploy-production.sh`) — Neil wants prod per phase.

**Phase A checklist (Step 5):**
1. Read the Step-5 doc builder + existing chat flow first (grep `cw_step_5`, `plot_structure`).
2. Controller `_cwStructCtl` (IIFE, registered in registerCwWalkCtls + resetCwWalks + the
   fail-loud start fallback list). Start marker `@CW5_START` from a judgment-only protocol.
3. Recommend-arm: read Step-4 throughline + beats (rowText from the cw_step_4 doc / artifacts);
   map throughline→candidate archetypes (succeeds→HJ/Quest/R2R/OtM/CoA · defeated→Tragedy ·
   abandons→Rebirth/V&R — state the mapping in code comments; it's heuristic, all 8 remain
   pickable via a "See all eight" chip).
4. Pick files BOTH `plot_structure_choice` + `plot_structure_key` artifacts + the doc row +
   auto-tick. Then "why this fits" free-text → doc row, verbatim. Then secondary/intent asks.
5. Re-choice path: if `plot_structure_key` already set and differs from the new pick →
   confirm chip ("rebuilds your outline — matching work carries over") before filing (§4b).
6. Verify: Neil drives fresh + re-choice on staging; artifacts checked by wp eval; Step-6
   gate opens.

**Phase B checklist (Step 6):**
1. Trace how the Step-6 doc builds from the template (the `'heros-journey': {` defs; ⚠ the
   `final-push` id contains a HYPHEN — regexes with `[a-z_]+` silently drop it).
2. `_cwOutlineCtl`: altitude 1 (echo Step-4 beats 1+6, one sharpen-ask) → per stage: bookend
   asks (2) → each element in template order. File verbatim + tick checkbox in the SAME PM
   write. NOTHING skippable. Per-stage progress in ask headers + sidebar.
3. Help ladder per ask: 💡 Examples = code-served (stage examples from the guide's new
   sections + this beat's own prompt expanded) · 📖 Guidance chip (stage anchor) · Ask Sophia
   chip (one-shot API with logline/spine context primed).
4. Coherence per §4 layer 2+3 ONLY (bookends + turning point per stage; sampled hook/climax/
   end at finish). Never send the full doc.
5. Stage-arc rows are NEW doc nodes → heal-on-load for existing Step-6 docs; key-match trace.
6. Verify: Neil files beats on prod project; `plot_outline` mirror length grows (wp eval);
   reload mid-stage resumes at first empty row; re-choice from Phase A migrates matching text.

**Phase C checklist (update lessons):**
1. TRACE FIRST (mandatory, before any edit): for step 11, log the firing order of workbook-doc
   build vs plot_outline preload (~23786) vs mirror-save (~41608). Name the clobber with
   file:line in the commit message.
2. Entry loads the outline; workbook questions move into a per-lesson walk config
   ({step: 11, layer: 'goals', perStage: [q1, q2]} — ONE generic controller, six configs).
3. Layer rows append under each stage (`cw-plot-goals-setup` style ids — canonical builder fn).
4. Clobber test is the acceptance test: fill Step 6 → open Step 11 → type → verify Step-6
   content intact in the artifact byte-for-byte outside the appended layer rows.
5. Verify per §6 row C; then 14/17/20/23/26 = the same config mechanism, one smoke each.
