# GATE-NOTES — for the ENGINE lane

Written by the Cambridge IGCSE content sub-lane, 2026-09-05. Content lanes do not edit `bin/*`, so
nothing here has been applied. **Two one-line blockers** in `live-model-paper-gate.php` (both
patches written out below, both verified on a scratch copy against every board in the tree), **one
blocker in `live-model-manifest.py`**, and two FYIs.

**With the two gate lines changed, all 73 Cambridge papers pass every check.** Without them the
gate cannot see a single Cambridge source, so the line-marker and line-count assertions — the ones
that actually matter — never run at all.

---

## 1. BLOCKER — the gate looks for a source labelled "Source X"; Cambridge heads its texts "Text A"

### Symptom

Every Cambridge paper. 73 papers, 183 failures, all from this one predicate:

```
❌ cambridge_igcse_lang_paper_1/2024062.md — 3 failed
  ✗ Source A present in metadata
  ✗ Source B present in metadata
  ✗ Source C present in metadata
```

### Root cause

`live-model-paper-gate.php`, in the per-source loop:

```php
foreach ($meta['sources'] as $s) { if (preg_match('/Source\s*' . $L . '/i', $s['label'])) $src = $s; }
if (!$src) { $ok(false, "Source $L present in metadata"); continue; }
```

Cambridge prints **`Text A: <title>`**, `Text B`, `Text C` on its inserts, and the plugin's own
Cambridge topic templates
(`protocols/shared/templates/topics/cambridge-igcse-language-p1.md`) and
`SWML_Topic_Parser::parse_multi_question()` both already speak that vocabulary — the parser's second
source pattern is `Text\s*(?:One|Two|1|2|A|B|C)`. So the parsed label is `Text A`, the regex looks
for `Source A`, and the lookup misses.

⚠️ Because the miss `continue`s, **the four assertions that follow are skipped silently** — line
count, the printed line markers landing on the board's own words, title/author, and the
`[NEEDS HUMAN]` scan. A red line here is not "one thing wrong", it is "the source was never
checked". Renaming our headings to `## Source A` is not an option: `Source\s*[AB]?` in the parser
has no `C`, three-text papers would lose Text C, and "Source" is not the board's word.

### The fix — one line, already proven

```php
foreach ($meta['sources'] as $s) { if (preg_match('/(?:Source|Text)\s*' . $L . '\b/i', $s['label'])) $src = $s; }
```

The added `\b` is deliberate: without it `/…\s*A/` matches the label `Text ABC`, and with three
letters in play a loose match is worth ruling out.

---

## 2. BLOCKER — title + author are asserted unconditionally; Cambridge Paper 2 prints neither

### Symptom

Only visible **after** §1 is applied (before it, the assertion is skipped). All 35 Paper 2 papers:

```
  ✗ Source A: title + author present ('' / 'Unknown')
```

### Root cause

```php
$ok(!empty($src['title']) && !empty($src['author']), "Source $L: title + author present …");
```

A Cambridge **Paper 1** insert heads each text `Text A: Bring your child to work day` — a real
title, and it is emitted. A Cambridge **Paper 2** insert heads them `Text A` and `Text B` with no
title at all and no author for either paper; what it prints instead is a one-line description
(*"The following passage is part of a magazine article about telling the truth."*), which is emitted
as `**Context:**`. Inventing a title would be authoring words Cambridge never printed.

Author follows the AQA tool's existing convention for an unattributed source — `**Author:** Unknown`
— so `author` is never empty and needs no change.

### The fix — one line, already proven

Every Cambridge sidecar declares, per source, `"title": <string|null>` and `"untitled": true|false`.
Read the declaration; keep today's behaviour for anything that does not declare it:

```php
$ok((!empty($sc['untitled']) || !empty($src['title'])) && !empty($src['author']), "Source $L: title + author present ('" . ($src['title'] ?? '') . "' / '" . ($src['author'] ?? '') . "')");
```

Existing AQA / Eduqas / Edexcel sidecars carry no `untitled` key, so they keep the strict check
byte-for-byte. A paper can only skip the title assertion by declaring the source untitled — never
by omission.

### Verified, not proposed

Both patches applied to a scratch copy of the gate and run against every board in the tree:

| | original gate | patched gate |
|---|---|---|
| `live-modelling-papers/cambridge-igcse` (73) | ❌ 183 assertions failed | ✅ **73 papers pass every check** |
| `live-modelling-papers/aqa` (8) | ❌ 3 failed | ❌ **3 failed — identical lines** |
| `live-modelling-papers/eduqas` (6) | ✅ pass | ✅ **pass** |
| `live-modelling-papers/edexcel-igcse` (19) | ❌ 30 failed | ❌ **30 failed — identical lines** |

Nothing is weakened anywhere. The AQA red is pre-existing (`aqa_lang_paper_2/202011` — its own
sidecar says `NEEDS HUMAN: Q1 true/false key not read from the mark scheme`), already flagged by the
Eduqas lane.

### Already done, no action needed

`q1_format` (Eduqas GATE-NOTES §1) is in the gate and Cambridge uses it: every sidecar declares
`"q1_format": "sub_parts"` (Paper 1 — lettered sub-parts (a)–(f) plus the Text B summary) or
`"open"` (Paper 2 — the directed-writing task). Cambridge never sets AQA's true/false question. The
`^\d{6,7}\.md$` filename filter (Eduqas §2) is in too, so this file is not itself gated.

---

## 3. BLOCKER — `bin/live-model-manifest.py` cannot see Cambridge at all

`python3 bin/live-model-manifest.py` currently dies:

```
KeyError: ('cambridge-igcse', 'cambridge_igcse_lang_paper_1')
```

Four changes, all in that file's maps, none of which affects an existing board:

```python
SITTING = {'03': 'March', '06': 'June', '11': 'November'}      # Cambridge sits a March series

UNITS = {
    ...
    ('cambridge-igcse', 'cambridge_igcse_lang_paper_1'):
        ('Fiction reading — Language Paper 1 family', 'Cambridge IGCSE 0500 Paper 1 (Reading)'),
    ('cambridge-igcse', 'cambridge_igcse_lang_paper_2'):
        ('Non-fiction reading + transactional writing — Language Paper 2 family',
         'Cambridge IGCSE 0500 Paper 2 (Directed Writing and Composition)'),
}
SUBJECT = {..., 'cambridge_igcse_lang_paper_1': 'language', 'cambridge_igcse_lang_paper_2': 'language'}

order = {'March': 3, 'June': 6, 'November': 11}                 # in the newest-first sort key
```

⚠️ **and the lesson-title regex.** It reads titles from `^## Source [AB]\n\*\*Title:\*\* …`, which
matches no Cambridge paper (`## Text A`, three letters, and Paper 2 has no `**Title:**` line at all).
Cambridge sidecars carry a ready-made `label`
(*"Cambridge IGCSE 0500 Paper 1 — June 2024 (variant 2) · Bring your child to work day / A change of
direction / Changing places"*), so the simplest correct change is to take the part after `· ` from
`side['label']` when the `## Source` scan finds nothing.

⚠️ **The variant digit is not a reserve-paper flag here.** `variant = ' (reserve)' if len(str(n)) == 7`
is an AQA rule. Every Cambridge topic number is 7 digits by construction — `YYYY` + `MM` + the
paper's variant digit (June 2024 variant 2 → `2024062`), because Cambridge sits up to three variants
of the same paper in one series and they are different papers, not reserves. The label already says
`(variant 2)`; the manifest should read the variant from `str(n)[6]`, never call it a reserve.

---

## 4. FYI — seven sittings are unauthorable, and the reason is Cambridge's

`bin/live-model-author-cambridge.py` refuses rather than approximates. Seven of the 80 sittings in
the mirror are refused for one reason only: **Cambridge has replaced the reading text with
"Content removed due to copyright restrictions."** in the published insert, so the words are not in
the PDF and no tool can recover them.

`0500_m21_qp_12` · `0500_s21_qp_22` · `0500_s25_qp_22` · `0500_s25_qp_23` · `0500_w22_qp_11` ·
`0500_w23_qp_22` · `0500_w24_qp_22`

They can only be authored from a paper copy of the insert, by hand. Nothing to fix in the tooling.

## 5. FYI — the Edexcel IGCSE `Text One / Text Two` papers still miss §1's lookup

With §1 applied, `edexcel_igcse_lang_a` still fails `Source A present in metadata`: its labels are
`Text One (Unseen)` and `Text Two (Anthology)` while its sidecar keys them `A` and `B`, so no
letter-based regex can match. That is their lane's call — either key the sidecar `One`/`Two`, or let
a sidecar declare each source's label and match on that. Flagged here because the same predicate is
the cause, and a fix that covers both is better than two.

---

## 6. How to regenerate every paper

The authoring tool is `bin/live-model-author-cambridge.py` (one sitting per call, same CLI shape as
`live-model-author-paper.py`). The whole set rebuilds from the 0500 mirror with:

```bash
PP="…/Cambridge IGCSE English 0500-0990/Past Papers (mirror 2020-2026)"
for f in "$PP"/0500_*_qp_*.pdf; do
  b=$(basename "$f" .pdf); ser=${b:5:1}; yr=${b:6:2}; paper=${b:12:1}; var=${b:13:1}
  case "$ser" in m) mm=03 ;; s) mm=06 ;; w) mm=11 ;; esac
  ins="$PP/0500_${ser}${yr}_in_${paper}${var}.pdf"; [ -f "$ins" ] || continue
  python3 bin/live-model-author-cambridge.py --paper "$paper" --sitting "20${yr}${mm}" --variant "$var" \
    --ins "$ins" --qp "$f" \
    --out "bin/live-modelling-papers/cambridge-igcse/cambridge_igcse_lang_paper_${paper}/20${yr}${mm}${var}.md"
done
```

`0500` and `0990` are the same paper (measured — `CAMBRIDGE-PAPER-SPEC.md`), so one 0500 PDF authors
the topic for both syllabus codes; `--syllabus 0990` only changes the label.

⚠️ **These files are excluded from git** by `.git/info/exclude` (lines added before this sub-lane
ran), so `git status` does not show them and `git add -A` will not pick them up. They need
`git add -f bin/live-model-author-cambridge.py bin/live-modelling-papers/cambridge-igcse` — flagging
it so the batch is not lost.
