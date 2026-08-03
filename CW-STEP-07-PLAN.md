# CW STEP 7 — UNIVERSAL HUMAN VALUES: THE WHOLE-FEATURE PLAN

**Status:** plan only, nothing built. Written 2026-08-03 against v7.20.412 (prod = staging).
**Rule this obeys:** CLAUDE.md §16 (plan the whole feature end-to-end BEFORE building) and §11
(grill first). Read this, disagree with anything, and I build the batch in one go.

**What was read before writing this** (§14b — no guessing): the Step-7 workbook source Neil supplied
(`resources/step7/universal-human-values-source.md` + `step7-task-screenshot.png`), the Step-7
protocol (`protocols/shared/creative-writing/CW-STEP-07-universal-values.md`), the whole Step-6
walk implementation, the harness/gate architecture, and the live LearnDash wiring on the server.

---

## 0. WHAT NEIL DECIDES (three questions, defaults already chosen)

I have picked a default for each so nothing is blocked. Say the word on any one and I change it.

**Q1 — Order of the walk.**
- **DEFAULT: workbook order** — all six values at the BEGINNING, then all six at the END, then the
  reflection. This matches your table, your teaching, and the protocol's three sub-steps.
- Alternative: per-value (Courage beginning *and* end together, then the next value). Pedagogically
  the transformation is more visible, but it breaks the two-table shape you teach from.

**Q2 — How many values must a student map?**
- **DEFAULT: all six get a one-tap state pick** (In balance / In excess / In deficit / Not explored),
  and **only the ones in play get a written explanation.** At least one must be in play; the ask
  recommends two or three ("a story that seriously tests six values usually tests none of them").
- Alternative: force a written explanation for all six (24 written answers — a form, not a lesson).

**Q3 — The last help rung, with no AI.**
- **DEFAULT: `[🤔 Still stuck]` files the stuck point for the tutor** and re-offers the free rungs —
  the "honest triple" from the zero-API research. No dangling chip, no fabricated answer.
- Alternative: drop rung 3 entirely on this step.

---

## 1. THE HEADLINE

Step 7 is the **first CW step that is 100% zero-API** — no stage checks, no finish check, nothing.
Step 6 spends six round trips per student; Step 7 spends **zero**, and the sim asserts it
mechanically (`world.sends.length === 0`). It is therefore the cheapest possible proof of the
code-first thesis before Step 9 runs it at scale.

What replaces the AI's judgment, per `research/2026-08-02-learning-without-ai-creative-beats.md`:
criteria stated upfront · two *contrasting* worked examples (Gentner 2003 — two beats one, and one
uncontrasted example gets copied) · a criteria-referenced self-assessment tick list after each
written answer (Andrade 2010, at exactly our age group, on writing) · and a constraint on every ask
rather than a blank one (Haught-Tromp 2017).

---

## 2. THE CHAIN — all four layers, scoped up front (§15/§16)

| Layer | State today | What this plan does |
|---|---|---|
| **Lesson wiring** | ✅ **Already live and verified.** LD topic **41312** "1. STEP 7: Universal Human Values" holds `[writing_mastery_lab task="cw_step_7" board="all" text="creative_writing" subject="skills"]`. Router maps `cw_step_7` → the protocol file; `CW_STEPS` has step 7; `CW_ARTIFACT_MAP` has `7: 'universal_values'`. | Nothing. Slug trace clean (§0c). |
| **The environment** | ⚠️ Step 7 is `tier: 'workbook'` → `panels: { sidebar:false, **chat:false**, guidance:true }`. **There is no chat panel on this step at all.** | Flip to `tier: 'si'` (one line, `wml-core.js:1024`) so it gets the same shell as Step 6. Without this there is nowhere for a walk to speak. |
| **The document** | ⚠️ Exists but is **inert prose** — six bold value names and empty `<p></p>`s, **zero field ids**, so nothing can be filed, ticked, counted or shown in the sidebar. | Rebuild as 27 real rows (§4), plus an on-load heal. **One saved Step-7 doc exists on prod** (1 user) — the heal preserves it, never overwrites. |
| **The walk** | ❌ Does not exist. No controller, no asks. | Build `_cwValuesCtl` to the Step-6 pattern (§3). |
| **The gates** | ❌ Nothing covers Step 7. | New `bin/cw7-sim-harness.js` + registrations (§6). |

---

## 3. THE WALK — the ask sequence

Every ask obeys the §4c template: criteria upfront · worked examples inside the ask · pointers to the
free help · the concrete question last. Every code-served run pages one bubble at a time behind a
`Continue →` chip (§4b). Nothing the system already holds is ever asked for (§3 — we quote their
protagonist, flaw, spine, archetype and key beats back to them).

**Orientation (paced chunks, code-served):**
1. What this step does and why it matters for their draft — plus "rough is fine, you will deepen it".
2. The six values and their strengths, with a `[🗂 …]` deep-link per value where a technique card exists.
3. **The balance insight, taught with two CONTRASTING examples** — *Frankenstein* (wisdom in excess)
   against *Macbeth* (courage in excess), then the deficit direction. Contrast is the load-bearing
   part; one example on its own gets copied.
4. One canon story mapped end-to-end as the worked model, threaded through the whole walk (the CW4
   Scrooge-spine pattern) so a complete example assembles alongside theirs.

**Then, for BEGINNING and again for END:**
- **Six state picks** — one tap each: `In balance` / `In excess` / `In deficit` / `Not explored in
  this story`. A tap is not self-assessed and gets no tick list. Mini progress ("Value 3 of 6").
- **A written explanation for each value in play** — criteria + one inline example, ending on the
  question; followed by its self-assessment tick list.
- Values marked *Not explored* have the phrase filed into both of their rows by code, so the
  document is complete and honest rather than half-empty (this is what stops the section never
  ticking green).

**Reflection (3 asks):**
- Which value shifts most — **the shift is computed from their own picks and shown to them**, so the
  ask is "you moved Courage from deficit to balance — what forces that change?" rather than a blank.
- Does it align with the theme and arc they already wrote (quoted from Step 5).
- Does the plot create enough pressure on that value (two or three of their own Step-6 beats quoted).

**Ask count:** 12 picks + typically 4–6 written explanations + 3 reflection ≈ **20 asks**. Same
lesson length as a Step-6 stage, not a 36-cell form.

### The one deliberate deviation from your workbook — stated, not assumed (§13/§5b)
Your table asks Yes/No separately for *balance*, *excess* and *deficit* on every value. A value
cannot be two of those at once, so on paper that grid is a convenience; in the chat it would be
three questions to say one thing. **I am asking it as a single four-way pick per value.** The
document still shows all three columns' worth of meaning, and the printed workbook is unchanged.

---

## 4. THE DOCUMENT — 27 rows, one field-id producer

One canonical producer, prefix derived from it, never pasted (the Step-6 law):

```js
function _cw7RowFieldId(when, valueId, slot) {   // when: 'begin' | 'end'
    return 'cw-step-7-' + when + '-' + valueId + '-' + slot;   // slot: 'state' | 'why'
}
```

- `cw-step-7-begin-courage-state` · `cw-step-7-begin-courage-why` · `cw-step-7-end-courage-state` …
- Reflection: `cw-step-7-reflect-shift` · `-align` · `-pressure`
- Value ids: `wisdom · courage · humanity · justice · temperance · transcendence`

**Row types:** the state row is a **dropdown control row** (`type:'dropdown'`, `controlOnly`) — the
same shape as `cw-step-5-primary-archetype`, so it stays fully usable by hand and the chat's tap just
sets it. The explanation and reflection rows are ordinary `outlineRow`s.

**Why the `cw-step-7-…` prefix and not Step 6's `outline-cw-…`:** the key-match harness and the
criteria lint both key on `cw-step-N-*`, so this naming inherits their coverage for free.

**Heal:** existing Step-7 documents are bare paragraphs. On load, if the doc has no `cw-step-7-` rows,
insert the row scaffold under `_migrationActive` and leave any text the student already typed
untouched below it. Never a silent rewrite.

---

## 5. THE CONTENT FILE

`frontend/wml-cw7-values.js` — six records, one resolver, the same shape as the Step-6 concept map:

```
{ id, name, strengths[], why, inBalance, inExcess, inDeficit,
  crit: [...],        // what a strong explanation does — lifted verbatim into the tick list
  ex, more: [...],    // worked examples, canon texts, varied — never all Macbeth
  tech: [...],        // Table-of-Techniques symbols, verified against the live dataset
  find }              // optional "browse the whole family" search term
```

Two rules that already cost us a cycle each and are non-negotiable here: **any quoted span must be
verbatim in a real source** (the `cw6-quote-gate` extended to this file), and **criteria are lifted
from the ask prose, never re-worded** (the lint fails otherwise).

---

## 6. REGISTRATION + GATES — the complete list

**Code registration** (each one is a known site, all cited in the Step-6 spec):
`wml-core.js` tier flip · the six controller-registration sites in `wml-assessment.js`
(`_cwNudgeActiveWalkImpl`, `_cwActiveWalkProbe`, `_cwCtls`, the `handleTurn` gate,
`registerCwWalkCtls`, the `onReply` chain) · the SPA/reload `tryResume` block · the init `.then()`
chain for the template + heal · the enqueue dependency on **both** enqueue paths (the second one
currently omits the Step-6 concepts file — the same trap applies) · the PHP task allow-list, which
today stops at `cw_step_5` and needs checking.

**Gates:**

| Gate | Status |
|---|---|
| `bin/cw7-sim-harness.js` (new) | Drives the whole walk on the real controller. Asserts: **zero API sends**, ask order with no repeats and no back-jumps, every row filed exactly once, the *Not explored* path leaves no empty row, liveness after every event (automatic — the rig cannot opt out), and resume from mid-walk. |
| `pre-ship-check.sh` | One new line beside the CW4/CW5 blocks. |
| `cw-keymatch-harness.js` | Dispatcher-arm count 6 → 7; one `kind` declaration per new chip handler; tick-list counts bumped. |
| `fossil-lint.js` | Automatic — but any new live resolver must be registered, and the reflection ask **names a mutable value, so it is drawn, never stored**. |
| `criteria-lint.js` | Automatic if the asks use the `{ fid: 'cw-step-7-…', criteria:[…] }` head shape. |
| quote gate + concept lint | Extended to the new content file. |

---

## 7. SEQUENCE, AND HOW EACH LAYER IS PROVEN

1. **Content file + its gates** → gates green, every quote sourced.
2. **Document rows + heal** → row count exact, the one existing prod doc opens unharmed.
3. **Controller + walk** → `cw7-sim-harness` green, including the zero-API and order assertions;
   then deliberately break each assertion once to prove the harness can fail (mutation convention).
4. **Registration + tier flip** → `pre-ship-check.sh --all` green.
5. **I drive it end-to-end on staging myself** — the whole walk, both a 1-value and a 4-value story,
   a reload mid-walk, and the *Not explored* path — before it reaches Neil.
6. **Neil tests once** (§12), with a written TEST-THIS list.

---

## 8. RISKS NAMED NOW, ENGINEERED OUT IN THE BUILD (§11 — no known-fragile ships)

| Risk | Designed-out how |
|---|---|
| The tier flip changes Step 7's whole environment (chat, sidebar, greeting, resume, project id). | Driven on staging across a fresh entry, a resume and an SPA navigation before handover — not "test and see". |
| Twelve taps in a row reads as a form. | Each pick carries that value's meaning and a stage-scoped progress line; the picks are split by beginning/end and broken up by the written asks between them. |
| *Not explored* values leave the document half-empty, so the section never ticks. | Code files the phrase into both rows at the tap. |
| The reflection sentence names a value the student can later change. | Drawn on entry, never persisted (the fossil law) — or a live token with a fallback. |
| The one existing prod Step-7 document. | Heal inserts, never overwrites; verified against that exact document. |
| A new step silently misses a lint. | Every gate above is either automatic or has an explicit registration line in §6 — no gate is assumed. |

---

## 9. WHAT THIS UNLOCKS

Step 7 establishes the **workbook-step pattern**: tier flip, picks + short written answers, tick
lists instead of API judgment, one content file, one field-id producer, one sim. Six later steps
(10, 11, 14, 17, 20, 23, 26) are the same shape, so the second one is materially faster than the
first. Step 8 (scene selection) then reuses this walk shell with a different content file, and Step
9 runs the zero-API thesis on real drafting.
