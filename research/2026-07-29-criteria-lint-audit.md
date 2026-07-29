# Self-assessment criteria — full audit (2026-07-29)

**Instrument:** `bin/criteria-lint.js` (new, report-only — deliberately NOT wired into
`bin/pre-ship-check.sh` yet, and no criteria were edited by this pass).
**Run:** `node bin/criteria-lint.js` · `node bin/criteria-lint.js --json`
**Trigger:** Neil found the Step 3 *Flaw* tick list shipping `'is an emotional shield'` /
`'actually works'` to staging — bullets whose meaning-bearing clause had been dropped in the lift.

---

## 1. Headline numbers

| | blocks | criteria | criteria failing | blocks with ≥1 failure |
|---|---|---|---|---|
| **Walk code** (`frontend/wml-assessment.js`) | 16 | 45 | **21 (47%)** | **14 / 16** |
| **Protocol markdown** (`protocols/**.md`) | 9 | 28 | **2 (7%)** | 3 / 9 |
| **Total** | **25** | **73** | **23 (32%)** | 17 / 25 |

**44 rule-hits** in total (a criterion can fail several rules).

| rule | hits |
|---|---|
| INFO-LOSS | 17 |
| NO-NOUN | 10 |
| MIN-WORDS | 9 |
| COUNT | 4 |
| BARE-VERB | 3 |
| DENY | 1 |
| DUPLICATE | 0 |
| RESTATES | 0 |

`DUPLICATE` and `RESTATES` never fire on the live corpus, so the linter drives them against
fixtures in its own `selfCheck()` — a rule nothing exercises is a rule that can rot silently.

### Does the information-loss rule catch the live defect? **Yes — and only the right ones.**

```
INFO-LOSS  wml-assessment.js:18610  [Flaw]  "is an emotional shield"   keeps 23% (needs ≥40%)
INFO-LOSS  wml-assessment.js:18611  [Flaw]  "actually works"           keeps 14% (needs ≥40%)
```

The third criterion in that same block —
`'is something the protagonist doesn’t yet understand about themselves'` — keeps 100% and is
**not** flagged. That discrimination is asserted as a permanent fixture inside the script, so this
file can never stop catching the defect it was written for.

### What is NOT in scope, and why

`frontend/wml-assessment.js` contains **71** `criteria:` arrays. Only **16** are tick lists. The
other 55 (`iumvcc.sections[].criteria`, the eight `cwPlotArchetypes` stage tables) are arrays of
**objects** — outline-row definitions the student never reads as a checklist. The linter
discriminates on element type, which is mechanical, and independently counts every
string-element `criteria:` array so one sitting outside a `{ fid: … }` step entry is reported as
`UNSCANNED` rather than passing quietly. Zero UNSCANNED today.

---

## 2. Full failure table

Grouped one row per criterion. `file:line` is the criterion's own line.

### 2a. Walk code — `frontend/wml-assessment.js`

| line | block | criterion | rules failed |
|---|---|---|---|
| 18604 | Protagonist | `changes more than anyone else` | INFO-LOSS (37%) · NO-NOUN |
| 18605 | Protagonist | `has courage` | INFO-LOSS (14%) · MIN-WORDS · BARE-VERB · NO-NOUN |
| 18606 | Protagonist | `makes us care fast` | INFO-LOSS (17%) · NO-NOUN |
| 18610 | Flaw | `is an emotional shield` | INFO-LOSS (23%) |
| 18611 | Flaw | `actually works` | INFO-LOSS (14%) · MIN-WORDS · BARE-VERB · NO-NOUN · **DENY** |
| 18617 | Wound | `fits the flaw exactly` | INFO-LOSS (35%) |
| 18618 | Wound | `stays hidden at first` | INFO-LOSS (27%) · NO-NOUN |
| 18623 | Inciting Incident | `breaks the routine` | INFO-LOSS (28%) · MIN-WORDS |
| 18627 | **Goal** (block) | *(whole block — 2 criteria)* | COUNT |
| 18629 | Goal | `stands for a deeper need` | INFO-LOSS (17%) |
| 18633 | Obstacle | `attacks the flaw specifically` | INFO-LOSS (27%) |
| 18634 | Obstacle | `is often a dark mirror` | INFO-LOSS (21%) |
| 18635 | Obstacle | `is specific` | INFO-LOSS (12%) · MIN-WORDS · BARE-VERB · NO-NOUN |
| 18639 | Stakes | `personal and specific` | INFO-LOSS (25%) · MIN-WORDS · NO-NOUN |
| 18640 | Stakes | `as heavy as survival` | INFO-LOSS (26%) · NO-NOUN |
| 18648 | Logline 1 (Action) | `a concrete action` | MIN-WORDS |
| 18649 | Logline 1 (Action) | `a specific antagonist` | MIN-WORDS |
| 18654 | Logline 2 (Goal) | `a picturable goal` | MIN-WORDS |
| 18659 | Logline 3 (Character arc) | `the opportunity` | MIN-WORDS |
| 19365 | **Until** (block) | *(whole block — 2 criteria)* | COUNT |
| 19374 | And because of this (Beat 4) | `a decision and an action` | INFO-LOSS (21%) |
| 19381 | And because of this (Beat 5) | `the obstacle attacks the flaw` | INFO-LOSS (33%) |
| 19386 | **Until finally** (block) | *(whole block — 2 criteria)* | COUNT |
| 19388 | Until finally | `carries the self-revelation` | INFO-LOSS (29%) |

Clean walk blocks: **At first** (Beat 1) and **And then** (Beat 2) — both authored in the
v7.20.282 interaction redesign and both lift the full clause. They are the model to copy.

### 2b. Protocol markdown

| file:line | block | criterion | rules failed |
|---|---|---|---|
| `protocols/shared/creative-writing/_cw-step-3-source.md:46` | A strong protagonist | `has courage — flawed, frightened, failing is fine; too cowardly to act is not` | NO-NOUN |
| `protocols/shared/creative-writing/_cw-step-3-source.md:141` | A strong goal | *(whole block — 2 bullets)* | COUNT |
| `protocols/shared/creative-writing/_cw-step-3-source.md:191` | Strong stakes are | `personal and specific — we can picture exactly what would be lost, and who loses it` | NO-NOUN |

**This is the finding that matters.** The markdown is 93% clean; the walk code is 53% clean. The
teaching bullets were authored well and the criteria were **broken at the moment they were
lifted**. Nothing here is a pedagogy problem — the words that fix every one of these already sit
on the line above.

---

## 3. The ten worst offenders, with self-contained rewrites

Ranked by rules failed, ties broken by retention. **Every rewrite is drawn from the bullet's own
explanatory clause — no new pedagogy, nothing invented.** Line numbers are pre-fix.

| # | line | block | current criterion | suggested rewrite (from its own bullet) |
|---|---|---|---|---|
| 1 | 18611 | Flaw | `actually works` | `actually works — it holds the pain at bay in everyday life, which is why they keep using it` |
| 2 | 18635 | Obstacle | `is specific` | `is a person, a group or a force we can point at — never “society” in the abstract` |
| 3 | 18605 | Protagonist | `has courage` | `has courage — flawed, frightened or failing is fine; too cowardly to act is not` |
| 4 | 18639 | Stakes | `personal and specific` | `is personal and specific — we can picture exactly what would be lost, and who loses it` |
| 5 | 18606 | Protagonist | `makes us care fast` | `makes us care fast — good at something, kind to someone, or treated unfairly` |
| 6 | 18610 | Flaw | `is an emotional shield` | `is an emotional shield — a behaviour built to protect a deeper hurt` |
| 7 | 18629 | Goal | `stands for a deeper need` | `stands for a deeper need the protagonist doesn’t fully understand yet` |
| 8 | 18634 | Obstacle | `is often a dark mirror` | `is often a dark mirror — it embodies the flaw the protagonist must overcome` |
| 9 | 18640 | Stakes | `as heavy as survival` | `is as heavy as survival — failing must cost something enormous` |
| 10 | 18618 | Wound | `stays hidden at first` | `stays hidden at first — we see it in their behaviour before anyone names it aloud` |

**A distinct eleventh class — the logline slot names.** `'the opportunity'` (18659),
`'a concrete action'` (18648), `'a specific antagonist'` (18649) and `'a picturable goal'`
(18654) are not truncations of a bullet at all; those blocks carry only worked examples, so
INFO-LOSS has nothing to compare against and only MIN-WORDS fires. They are formula SLOT names
being reused as tick criteria, and `'the opportunity'` is the emptiest string in the corpus.
They need a tick-shaped sentence written from the formula they belong to (e.g.
`'names the opportunity the story gives them'`) — a decision for whoever owns Step 3's wording,
not something to derive from a bullet that does not exist.

**Three COUNT blocks** (Goal, Until, Until finally) carry two criteria where the rule asks three.
Goal is two because its markdown source is two — fixing the source fixes both.

---

## 4. Marginal calls — stated, not hidden

Two INFO-LOSS hits sit just under the 40% line and read acceptably when detached:
`'fits the flaw exactly'` (35%) and `'changes more than anyone else'` (37%). If a reviewer judges
those fine, the honest move is to raise the retention on those two criteria, not to lower
`MIN_RETAIN` — dropping the threshold to 0.30 would let `'stays hidden at first'` (27%) and
`'is often a dark mirror'` (21%) through, and those genuinely lose the claim.

`NO-NOUN` firing on two long markdown bullets (`has courage — …`, `personal and specific — …`) is
correct but reads oddly at first: those bullets never name a thing at all, which is precisely why
their lifted forms are the worst two entries in the table above.

---

## 5. Verdict — small phrasing job, large coverage job

**The fix is small.** 23 criteria, 16 blocks, **one file**, all inside CW Steps 3 and 4. Every
rewrite is already written — it is the clause sitting immediately after the em-dash on the same
line. No pedagogy call, no protocol change, no schema change, no student data touched. One
batched edit pass, one `node bin/criteria-lint.js` run to confirm zero, one deploy. Call it an
hour, and it is the kind of change that should ride with whatever else is in the next batch
rather than being its own test cycle.

**The coverage is not small, which is the whole reason the gate is worth more than the fix.**
Only two of the six CW walks serve tick lists at all today (Steps 3 and 4). Step 5 is a pick and
correctly has none; Step 6 is scheduled to get them per STAGE across **801 rows / 8 archetypes**;
Steps 1 and 2 are partially covered; and no planning protocol on any board has been converted to
code-served asks yet. Every one of those ports will lift criteria out of teaching bullets, which
is exactly the operation that failed here — and it failed while a gate (`cw-keymatch-harness`'s
self-assessment block) was already green, because that gate asserts a criterion is a *verbatim
substring* of its ask, and a truncation is a verbatim substring. **The existing gate could not
have caught this by construction.** So: fix the 23 now, wire `criteria-lint.js` into
`pre-ship-check.sh` the moment the count reaches zero, and every future port inherits the check
instead of relying on someone remembering it.

**Recommended sequence** (nothing here is blocking):
1. Main chat rewrites the 23 criteria + the 3 short blocks (report-only lint stays report-only).
2. Re-run `node bin/criteria-lint.js` → expect `✅ passed`.
3. Add the `criteria-lint.js` stanza to `bin/pre-ship-check.sh`, gated on
   `wml-assessment.js|protocols/.*\.md|criteria-lint\.js` being staged.
4. Append `HEADING_FORMS` / `DENY_LIST` / `CRAFT_NOUNS` as new shapes appear — all three are
   built to be added to, and each addition is a decision on the record.
