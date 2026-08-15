# CW STEP 8 — THE VALUES INTERFACE (build spec)

**FIXLIST:** #374 · #374a · #374b (all ruled by Neil, 2026-08-13; re-confirmed 2026-08-15
*"we just need to get it completed according to how I said"*).
**Status:** spec written 2026-08-15, from the shipped code. The shape is NOT re-opened here —
this document only states the mechanics that carry it out.

---

## 0. WHY (the measured problem, not a preference)

The current Step-8 walk asks, per flagged trait: *which stage?* → *which beat?* as chat chips.
The eight plot templates hold **97–108 askable beat rows each across 6 stages — 16–18 chips per
stage**. Neil: *"there's so many beats in each stage that it's actually quite overwhelming."*

And the goal changed: **most students have not finished Step 6**, many not past stage one, so
Step 8 is now **depth + gap-filling**, not depth alone.

---

## 1. THE RULED SHAPE (#374 / #374a / #374b — do not re-derive)

1. **Interface** — opens on the full plot (like Step 9), student picks which Step-7 **traits** to
   work on, then the **beats**, and their **Step-7 words are PORTED straight in — no typing.**
2. **Chat** — then walks them through *refining* the ported beats. **Deliberately LIGHT:** Steps 9
   and 10 carry the later refinement; this must not demand polish it will ask for twice more.
3. **Optional gap-filling** — empty beats are visible and selectable, so a student behind on Step 6
   can fill in as they go.
4. ⭐⭐ **THE PORT APPENDS — IT NEVER REPLACES.** A beat holding the student's words is the NORMAL
   case. The ported line lands **underneath**; the student merges it (PEDAGOGY §29 — the merge IS
   the pedagogy). ⛔ `_cw9ReplaceRowLines` is the wrong helper. A re-port must be **idempotent**.
5. **LABELLING IS LOAD-BEARING.** Step 7 records each trait at the **beginning** and at the **end**,
   so the picker bands the plot **BEGINNING = Stages I–III · END = Stages IV–VI** (his correction,
   stated twice).

---

## 2. THE CHAIN — every layer this touches (§15/§16)

| Layer | What it is | State after this build |
|---|---|---|
| **Data in — traits** | `universal_values` artifact → `_cw8ParseValuesAudit()` → roster `{value, trait, begin, end, wanted, cond, said}` | reused unchanged |
| **Data in — beats** | the LIVE Step-8 document (`_cw8EnumerateBeats(canvasEditor)`); Step 8's doc IS the plot outline (`CW_ARTIFACT_MAP[8] = 'plot_outline'`) | extended to carry each beat's TEXT |
| **Interface** | the island (`island/`, built to `frontend/wml-scene-island.min.js`) | **+ a Step-8 mode**, same bundle, same CSS |
| **Port out** | `_writeOutlineRowField(fid, _cw8AppendLine(label, text))` — append path, accumulate | reused; guarded idempotent |
| **Provenance** | NEW artifact `cw8_values_state` — per (beat, trait) port record | new |
| **Chat** | `_cwPlotValuesCtl` | trait→stage→beat chip maze retired; becomes the light refine walk + continuity + wrap |
| **Gates** | `bin/cw8-sim-harness.js` (+ new `bin/cw8-port-gate.js`) | rewritten for the new shape |

⚠️ **Beats come from the LIVE DOC, never the `plot_outline` artifact.** Step 8's document is the
seeded, student-edited copy and is on screen; the artifact is a save of it. Step 9 reads the
artifact only because the plot doc is not on screen there.

---

## 3. THE INTERFACE — Step-8 mode

Mounted through the same island as Step 9 (Neil: *"a shared plot-picker with a Step-8 mode"*), so
one bundle, one stylesheet, one design system. Step 9's own component is **not** refactored — its
frame/stepper/actionbar are lifted into a shared `Shell.jsx` only if the lift is mechanical and the
scene harness proves Step 9 byte-unchanged; otherwise Step-8 mode renders the same class names.

### Phase 1 — Pick your traits
Grid of the **flagged** traits from Step 7 (the roster). Each card carries:
- trait label + its value ("Creativity — Wisdom and Knowledge")
- the condition: *in excess* / *in deficit* / *in balance*, or **build list** (wanted)
- **their own Step-7 words** (`said`) — quoted, so they recognise their own thinking
- a count badge: *already in N beats* (derived from `_cw8BeatHasTrait`, so a re-visit is honest)

**Multi-select** (a selection of what to work on, not N verdicts — §18's discriminator says one
screen here). Continue is disabled at zero.

### Phase 2 — Place each trait (SERIAL, one trait per screen — §18)
For the current trait:
- **The band is derived from Step 7, not asked.** `begin` real → **BEGINNING (Stages I–III)**;
  `end` real → **END (Stages IV–VI)**; both real → both bands shown, labelled; wanted-only → both
  (they choose where it is earned). A trait marked only at the beginning therefore halves the plot
  on screen before the student picks anything — that is the overwhelm fix.
- Beats listed by stage **with their current text**. An empty beat renders as
  *"empty — nothing written here yet"* and is selectable (gap-filling, no special case).
- A **"Show empty beats only"** filter, for the student behind on Step 6.
- A beat already carrying this trait shows *"already worked here"* and is not re-portable.
- Multi-select beats → **Next trait** (serial) until all selected traits are placed. A trait may be
  left with zero beats — the honest answer *"it doesn't show anywhere yet"* is a one-tap skip and
  files to the existing `cw-step-8-notyet` row.

### Phase 3 — Review & add
Per selected beat, in story order: the beat's current text, and underneath, in a distinct block,
**the exact line that will be appended**:

```
Values (Creativity): she rewrites her friend's speech without being asked
```

Nothing is retyped; any line can be unchecked here. Then **"Add to my beats"**.

**When a trait has no Step-7 words** (flagged by condition alone), the ported line is the honest
condition marker rather than invented prose:
`Values (Bravery): in deficit — this is where it should show.`
The chat refine pass is what turns that into their sentence. 🔵 *Flagged to Neil, not blocking.*

---

## 4. THE PORT — mechanics

```js
// per (beat fid, trait):
if (_cw8BeatHasTrait(rowText(fid), traitLabel)) return 'already';   // idempotent, doc-derived
_writeOutlineRowField(fid, _cw8AppendLine(traitLabel, said));       // APPEND (no replace flag)
ledger[fid + '::' + traitId] = { text, at, machine: true };         // provenance
```

- **Append only.** `_writeOutlineRowField`'s default path inserts at the row's end preserving prior
  content, and already skips an exact duplicate; `_cw8BeatHasTrait` is the stronger guard because it
  survives the student editing the ported line.
- **`_cw8BeatHasTrait` is provenance, not presence** — it matches OUR OWN `Values (X):` prefix plus
  the trait name. That is exactly the distinction Step 9's ROOT A got wrong (it probed for *any*
  text). No gate in this build may ask "does the row have text?" to mean "has this been done?".
- **The ledger (`cw8_values_state`)** records what the port filed, so the chat can diff it against
  the live row and say *ported / untouched / refined / rewritten* per beat (#374a's question,
  answered — the same mechanism as `scene_selection_state.transfers`).

---

## 5. THE CHAT AFTER THE PORT — light, serial, zero-API

Serial over the beats that were ported this session, cheapest-exit-first:

> **Stage II · The first real setback** — your beat says: *"…"*
> I added underneath: *Values (Creativity): …*
> **Make it one line of story: what does she DO here?** — or leave it as it is.
> `[Leave as is →]` `[Trait examples]` `[My values]` `[Story Components]`

- A typed answer **replaces that trait's ported line only** (a new `_cw8ReplaceTraitLine`, keyed on
  the same one-composer/one-reader prefix pair). It never touches the student's own prose — the port
  rule is "never clobber the STUDENT"; replacing our own machine line with their sentence is the
  point of the pass.
- `Leave as is` costs one tap (§18: a no must be cheap).
- Zero API — every turn here is code-served. The help ladder (§4c.9) is the existing free rungs.
- Then the existing **continuity** pass and **wrap**, unchanged.

---

## 6. WHAT THE STEP-9 POST-MORTEM FORCES ON THIS BUILD

1. **ROOT A — provenance, never presence.** Every "have they done this?" gate reads the ledger or
   the labelled line, never row text (§4 above).
2. **ROOT B — one flag, one job.** The Step-8 controller's `active` stays a WALK-level flag; the
   island's own turns emit with `suppressActions: true` so the generic quick-action detector cannot
   parse our numbered prose into phantom chips.
3. **Insert anchoring** — anything inserted into the doc anchors on `[data-section-type="progress"]`
   and inserts BEFORE it, never `insertAdjacentHTML('beforeend')`.
4. **Scaffold changes need a `_migrateStep` heal** — a row shape is baked into saved docs.
5. **Liveness (§4d)** — after every entry, resume, close and refusal there is a question or a chip on
   screen. Enforced automatically by the walk-sim rig.

---

## 7. BUILD ORDER + VERIFY POINT PER LAYER

| # | Build | Proven by |
|---|---|---|
| 1 | `_cw8EnumerateBeats` carries beat TEXT + band index; 6-stage assertion | new `bin/cw8-port-gate.js` |
| 2 | Island Step-8 mode (`PlotValues.jsx`) + mount contract | `npm run build`, scene harness green (Step 9 unchanged) |
| 3 | Bridge: roster + world in, port + ledger out | `cw8-port-gate` — append-not-replace, idempotent re-port, empty-beat fill |
| 4 | Chat refine walk + continuity + wrap | rewritten `bin/cw8-sim-harness.js` (liveness inherited) |
| 5 | Doc heal for any new row | migrate step + re-scan |
| 6 | Staging deploy, one test cycle | Neil |

---

## 8. OPEN, FLAGGED, NOT BLOCKING

1. A trait flagged with **no Step-7 words** ports a condition marker rather than prose (§3).
2. The refine pass **replaces our own ported line** with the student's sentence; their prose is never
   touched. Stated because it is the one place "append never replaces" needs reading precisely.
