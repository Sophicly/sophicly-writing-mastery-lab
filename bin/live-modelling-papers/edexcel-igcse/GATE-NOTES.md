# GATE-NOTES — Edexcel IGCSE English Language Specification A (4EA1)

```
php bin/live-model-paper-gate.php bin/live-modelling-papers/edexcel-igcse
✅ 20 paper(s) pass every check
```

**The shared gate needed no change and none was made.** All 20 topics (2 × Paper 1, 18 × Paper 2)
go through `bin/live-model-paper-gate.php` unmodified. This file records the two sidecar fields
this board's papers rely on, the real bugs the gate caught, the one sitting that was refused, and
three findings for other lanes.

---

## 1. What the sidecar has to declare for this board, and why

### `q1_format: "open"` — on every 4EA1 paper

The gate's true/false branch is `($side['q1_format'] ?? (empty($side['sources']['B']) ? 'open' :
'statements'))`. Paper 1 has two texts, so without the declaration it would default to
`statements` and demand eight of them with four marked TRUE. Edexcel Spec A has no statement
question on either paper: Paper 1 Q1 is worth 2 marks and reads, in June 2024, *"From lines 4–6,
select two words or phrases that describe the weather"*; Paper 2 Q1 is a 30-mark essay. Declaring
`open` is the gate's own supported way to say so — it is not an exemption, and the gate still
asserts that no `[T]`/`[F]` key leaks into the question text.

### Source labels: `Text One (Unseen)` / `Text Two (Anthology)` on Paper 1

The gate matches a source as `(?:Source|Text)\s*(?:A|One|1)`, which its own comment already names
as the Edexcel IGCSE case, so `Text One`/`Text Two` resolve against sidecar keys `A`/`B` with no
help. Those labels are not this lane's invention:

* they are the grammar of the plugin's topic template for this board,
  `protocols/shared/templates/topics/edexcel-igcse-language-p1.md`;
* `includes/class-topic-parser.php::parse_multi_question()` matches them (pattern 2 of
  `$source_patterns`);
* every question in the paper refers to the texts by those names — *"How does the writer use
  language and structure in **Text Two**…"*, *"Question 5 is based on both **Text One** and **Text
  Two**"*. Relabelling them "Source A/B" would point the board's own questions at names the
  student cannot see.

Paper 2 has a single text and keeps `## Source A`, exactly as
`protocols/shared/templates/topics/edexcel-igcse-language-p2.md` has it.

The sidecar also carries `source_headings` (`{"A": "Text One (Unseen)", "B": "Text Two
(Anthology)"}`) so the heading a topic actually uses is recorded rather than inferred.

---

## 2. Two real bugs the gate caught in this lane's own output

Recorded because they are the reason to run it, and because both were invisible by inspection.

1. **The line-number column is 3 characters wide, which breaks at line 100.** Four Paper 2 prose
   extracts run past 99 lines (`The Necklace` 233, `Night` 254 and 257, `Significant Cigarettes`
   149). `f'{n:<3}{txt}'` renders line 100 as `100Towards evening…` with no space, so the gate's
   `/^(\d+)\s+(.*)$/` stops matching and the line silently ceases to be a numbered line at all.
   The gate reported "99 numbered lines (expect 254)". The author tool now widens the column to 4
   when an extract reaches 100 lines.
2. **A footnote gloss can read as a numbered line.** Paper 1's glossary entries are printed with a
   superscript marker, so rendered plainly as `1 halyards: ropes…` they parse as body line 1. They
   are emitted as a `- ¹ halyards: …` bullet list under `**Glossary:**` instead.

Two more defects were caught outside the gate, and both are worth recording because the gate is
structurally unable to see them.

3. **The furniture filter matched `Pearson Edexcel` as a prefix**, which swallowed the middle of
   the board's own sentence *"…taken from the Pearson Edexcel International GCSE English Anthology,
   which is provided in the Extract Booklet."* Caught by the verbatim check below. Furniture is now
   split into whole-line and prefix patterns.
4. ⭐ **Fixing (3) then leaked the rotated "DO NOT WRITE IN THIS AREA" strip into a poem and into a
   question.** The strip is printed three times per margin and pdftotext returns it as
   `DO NOT WRITE IN THIS AREA DO NOT WRITE IN THIS AREADO NOT WRITE IN THIS AREA` — with **no space
   between the second and third**, which the new whole-line pattern's `\s+` separator did not
   match. Two of its lines became lines 32 and 33 of *Still I Rise*.
   **Neither the gate nor the verbatim check could catch it**: that poem has no printed markers to
   assert against, and the strip *is* text the board printed, so it passes a verbatim test
   perfectly. It surfaced from diffing the two sittings that print the same anthology poem against
   each other (43 lines against 45).
   The filter now reads `(?:DO NOT WRITE IN THIS AREA\s*)+`, and — because an input filter is a
   pattern and a pattern can be wrong — the tool now also asserts on its **output**: every emitted
   line is checked against what the furniture actually looks like on the page, and the paper is
   refused rather than authored around a missing form.

**Beyond the gate, every emitted word was checked against the board's PDF a second way**: 1,860
numbered body lines and 442 question paragraphs were each required to appear verbatim in
`pdftotext -layout` output — a different extraction mode from the `-bbox-layout` one that authored
them. All match. (Two Paper 1 paragraphs match only after the rotated margin strip is removed from
the haystack, because it sits between the two printed halves in the `-layout` stream.)

And the six anthology texts that appear in more than one sitting were diffed against themselves
across sittings. Every difference is the board's own: en-dash for em-dash in the two *Disabled*
sittings, `soulful cries.` against `soulful cries?` in the two *Still I Rise* sittings, `at a
stroller's pace` against `at stroller's pace` in the two *Bright Lights of Sarajevo* sittings, and
different line wrapping in *Night* (254 lines against 257) and *Whistle and I'll Come to You*. Each
is verbatim to its own paper.

---

## 3. One sitting refused, and the one decision it needs

**June 2023 (R), Paper 2 — `Significant Cigarettes (from The Road Home)`, Rose Tremain.**

Every printed line number in that paper sits one line **above** the line it numbers: the board
prints `5` level with *"the edge of the road."*, the fourth line of its own extract, `10` level
with the ninth, and so on to `150` level with the 149th and last. The offset is uniform across all
29 markers and was confirmed by rendering the page image, not inferred — the paper appears to count
the extract's heading as line 1. The June 2020 sitting prints the *same extract* with `5` on the
fifth line of the text, so the two papers disagree with each other.

The tool refuses rather than renumber the board:

> `Significant Cigarettes (from The Road Home): the board prints marker 5 beside line 4 of its own
> extract, so its printed numbering runs 1 line(s) ahead of the text it numbers … REFUSING rather
> than renumbering the board — author this sitting by hand if that shift is intended.`

To install it, someone has to decide one thing: whether the topic numbers the extract 1–149
(matching the text) or 2–150 (matching the numbers the board printed). Nothing else about the
sitting is in doubt — the questions, the tariff and the author all read cleanly, and the same
extract is already available as the June 2020 sitting.

---

## 4. Three things for other lanes (not this lane's files to change)

1. **`bin/live-model-install-papers.php` hard-codes five questions in its round-trip check**
   (`count($bq) === 5`). Edexcel Paper 1 has six question blocks and Paper 2 has two, so every
   Edexcel install would print `⛔ ROUND-TRIP FAILED` and be counted as refused even after a
   successful write. It should compare against `count($side['questions'])`, the way the gate
   already does.
2. **`bin/live-model-manifest.py` has no January in `SITTING`** (`{'06': 'June', '11':
   'November'}`), so the eight January sittings come out titled `01 2023 · The Necklace
   (Maupassant)` instead of `January 2023 · …`. One line: add `'01': 'January'`. Everything else in
   the manifest already handles this board — it picks up all 20 rows and reads Paper 1's Text
   One/Text Two titles correctly.
3. **The hand-authored diagnostic in
   `protocols/shared/templates/topics/edexcel-igcse-language-p1.md` carries a tariff and an AO
   split the board does not use.** It has Q1–Q3 as 2 · 3 · 6; both real sittings held here (June
   2023 and June 2024) print 2 · 4 · 5. Both add to 45 for Section A, so a totals check cannot tell
   them apart — root `CLAUDE.md` §PARALLEL LANES 2(a) names this exact trap. It also splits Q4 as
   "(AO1 4 + AO2 8)" and Q5 as "(AO1 10 + AO3 12)"; the June 2024 mark scheme and the
   specification's *Breakdown of assessment objectives and raw marks* table both give the paper's
   Q4 as **AO2 only (12)** and Q5 as **AO3 only (22)**. The authored sittings follow the papers,
   the mark schemes and the specification; the template is flagged here for whoever owns it.

---

## 5. Two things a reader will want to check about the extracts themselves

* **June 2021 Paper 2 (`Night`) carries no printed line numbers at all**, verified from the
  rendered page. That is the board's page, not a parse failure. The topic numbers the lines itself,
  one per printed line, and the sidecar records `line_checks: {}` plus a note saying there is
  nothing of the board's to assert them against. The same is true of every poem: Edexcel numbers
  prose extracts and leaves poems unnumbered, so the ten poem sittings all carry zero markers by
  design.
* **Section B is emitted as ONE question** — `Q6` (Paper 1, 45 marks) and `Q2` (Paper 2, 30 marks)
  — carrying the board's own numbered options inside it as `**Question 6:** / **Question 7:**` and
  `**Question 2:** / **Question 3:** / **Question 4:**`. The paper is answered once; this is the
  shape `protocols/shared/language-paper-specs.json → edexcel-igcse` already declares, and the only
  one whose tariff sums to the 90 and 60 the papers print.
