# GATE-NOTES — for the ENGINE lane

Written by the Eduqas content sub-lane, 2026-09-05. Content lanes do not edit `bin/*`, so nothing
here has been applied. Four items: **two one-line blockers** in `live-model-paper-gate.php` (both
patches written out below and both verified on a scratch copy), a **correction to a repo file** that
disagrees with the board's own mark schemes, and one FYI.

---

## 1. BLOCKER — `live-model-paper-gate.php` treats "two sources" as "this is AQA Paper 2"

### Symptom

All six Eduqas papers pass every applicable assertion. The three **Component 2** papers then fail
two more:

```
❌ eduqas_lang_paper_2/202206.md — 2 failed
  ✗ Q1 carries 8 statements (got 0)
  ✗ Q1 key has exactly 4 TRUE statements (got 0)
```

### Root cause

`live-model-paper-gate.php`, near the end of `swml_lm_paper_checks()`:

```php
if (!empty($side['sources']['B'])) {
    $q1 = $qs[0];
    $ok(!empty($q1['statements']) && count($q1['statements']) === 8, "Q1 carries 8 statements …");
    $true = array_sum(array_map('intval', $q1['statement_key'] ?? []));
    $ok($true === 4, "Q1 key has exactly 4 TRUE statements (got $true)");
    $ok(strpos($q1['text'], '[T]') === false && …, "Q1 text carries no [T]/[F] leak");
}
```

The predicate is **"does this paper have a Source B?"**. It is standing in for **"is Q1 a
true/false statement-selection question?"** — which is true of AQA Language Paper 2 and of nothing
else we hold. Eduqas Component 2 also has two sources, but its Q1 is **three one-mark retrieval
sub-parts** (`1 1 a) b) c)`, 3 marks), verified against the board's Autumn 2021 and Autumn 2022 mark
schemes. There are no statements to carry and there never will be.

Two sources is an **incidental correlation** with the statement format, not a cause — the exact
shape WML's own `CANVAS TASK-SCOPING` rule forbids ("gate on capabilities, never on a literal").
Fabricating eight true/false statements so the gate goes green is not an option: it would invent a
question Eduqas never set.

### The fix — one line, already proven

The authored sidecars now declare Q1's shape explicitly. Every Eduqas `.checks.json` carries:

```json
"q1_format": "sub_parts"     // Component 2 — three 1-mark retrieval parts
"q1_format": "open"          // Component 1 — 'List five things you learn about X'
```

Change the predicate to read that declaration, defaulting to today's behaviour:

```php
if (($side['q1_format'] ?? 'statements') === 'statements' && !empty($side['sources']['B'])) {
```

**Why the `?? 'statements'` default matters:** every existing AQA sidecar lacks the key, so it keeps
the current behaviour byte-for-byte. **No AQA sidecar needs editing**, and a paper can only skip the
statement checks by explicitly declaring a different Q1 shape — it cannot skip them by omission.

### Verified, not proposed

The patch was applied to a scratch copy of the gate and run against both boards:

| | before | after |
|---|---|---|
| `live-modelling-papers/eduqas` (6 papers) | ❌ 6 assertions failed | ✅ **6 papers pass every check** |
| `live-modelling-papers/aqa` (8 papers) | ❌ 3 assertions failed | ❌ **3 assertions failed — identical** |

The AQA result is unchanged in both the count and the exact failing lines, which is the point: the
patch does not weaken the AQA check.

⚠️ **That AQA failure is pre-existing and is NOT caused by anything in this lane.**
`aqa/aqa_lang_paper_2/202011.md` fails on its own today, with the reason already in its sidecar:
`NEEDS HUMAN: Q1 true/false key not read from the mark scheme — statements written as [?]`. Flagging
it because it means `live-model-paper-gate.php bin/live-modelling-papers` has been red before this
lane touched anything, so a whole-tree run is not a clean baseline.

---

## 2. BLOCKER — the gate treats every `.md` under the tree as a paper, documentation included

### Symptom

```
❌ eduqas/SOURCES-AUDIT.md — 1 failed
  ✗ no sidecar …/SOURCES-AUDIT.checks.json
❌ eduqas/GATE-NOTES.md — 1 failed
```

### Root cause

The CLI block collects targets with:

```php
$files = is_dir($target) ? array_values(array_filter(iterator_to_array(new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($target))), function ($f) { return substr((string) $f, -3) === '.md'; })) : [$target];
```

Any `.md` anywhere under the tree is a paper. This audit (`SOURCES-AUDIT.md`) and this file are the
first documentation to live inside `live-modelling-papers/`, so the assumption has not bitten before.
They are at the paths this lane was asked to write them to; moving them out is the alternative fix,
but the filter is the real defect — a papers directory should be allowed to carry a README.

### The fix — one line, already proven

Papers are named by topic number (`202306.md`, and AQA's reserve-paper form `2023061.md`). Match that:

```php
function ($f) { return (bool) preg_match('/^\d{6,7}\.md$/', basename((string) $f)); }
```

Deliberately **not** "skip any `.md` with no sidecar": that would silently swallow a genuinely
missing sidecar on a real paper, which is one of the things this gate exists to catch.

### Verified together with §1

With **both** one-line patches applied to a scratch copy:

```
php gate.php bin/live-modelling-papers/eduqas   →  ✅ 6 paper(s) pass every check
```

⚠️ A whole-tree run is still red, but **for other lanes' papers, not Eduqas's**: as of 2026-09-05 the
Cambridge IGCSE (6 papers) and Edexcel IGCSE (2 papers) sets fail 34 assertions between them, and
`aqa/aqa_lang_paper_2/202011.md` fails 3 (see below). Eduqas is green.

---

## 3. CORRECTION — `protocols/shared/language-paper-specs.json` disagrees with the mark schemes

`eduqas.language_c2` is marked `"verified": true`, source *"EDUQAS C700U20 past paper (verified by
Neil 2026-04-02)"*. Two of its AO claims do not match what the board actually prints. Ordering of
authority is `PROTOCOL-STANDARD.md` / PARALLEL LANES §2(a): **mark scheme → real past paper → our
files**, so the spec file is the defect. Content lanes do not edit shared protocol files, so this is
recorded rather than changed.

Read off **both** Eduqas Component 2 mark schemes we hold (Autumn 2021 and Autumn 2022 — they agree
line for line):

| printed cell | spec says | the mark scheme's own annotation |
|---|---|---|
| `1 2` (Q2, 10 marks) | `AO2, AO4` | **`(AO2 1a, b, c and d)`** — AO2 only |
| `1 4` (Q4, 10 marks) | `AO2, AO4` | **`(AO4)`** — AO4 only |

The other six agree: `1 1` AO1 · `1 3` AO1 · `1 5` `(AO1 2a and b)` · `1 6` AO3 · Section B AO5 (60%)
+ AO6 (40%). The authored papers use the **mark scheme's** values; if the spec file is corrected the
two will match.

**Also worth a decision, though not a defect:** the spec splits Q1 and Q3 into six separate entries
(`Q1a`, `Q1b`, `Q1c`, `Q3a`, `Q3b`, `Q3c`, 1 mark each), giving ten questions in Section A. The board
prints them as **two cells** (`1 1` and `1 3`), each with a single AO annotation and a single mark
band. The authored papers follow the board: **eight questions**, `Q1`(3) `Q2`(10) `Q3`(3) `Q4`(10)
`Q5`(4) `Q6`(10) `Q7`(20) `Q8`(20) = 80, with each `a) … [1]` preserved verbatim inside its question
text. So the ids track the board's own cells 1:1 in count, order and tariff. Note also that
`SWML_Topic_Parser`'s question-heading regex accepts `## Q1(a)` but **not** `## Q1a`, so the spec's
id spelling is not emittable as a heading as written.

---

## 4. FYI — the Component 2 template still carries its own "needs rebuilding" note

`protocols/shared/templates/topics/eduqas-language-c2.md` opens with a structural note saying the
file does not match the real Eduqas C2 structure (missing the Q1/Q3 retrieval triples, the 4-mark
synthesis, and the second writing task). **That note is correct**, and the structure it describes is
exactly what the authored papers now emit. The template itself was not touched — content lanes do
not edit `protocols/` — but whoever rebuilds it can take the shape from
`bin/live-modelling-papers/eduqas/eduqas_lang_paper_2/202306.md`.
