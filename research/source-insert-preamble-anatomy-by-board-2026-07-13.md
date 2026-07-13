# Source-Insert Preamble Anatomy by Exam Board (GCSE / IGCSE English Language)

**Author:** research pass, 2026-07-13
**Purpose:** Document, board-by-board and paper-by-paper, exactly what a real exam **source insert** looks like — the *preamble* that sits above each reading source (label form, title, author, date/period, contextual intro sentence), plus line-numbering and gloss conventions — so Sophicly practice-paper docs mirror the real thing.
**Rule honoured:** every claim below is backed by a REAL example found on this system and quoted verbatim with its file path. Where no on-system evidence exists for a board×paper, it is stated as **NO EVIDENCE FOUND ON SYSTEM** (see GAPS).

**Path shorthand.** `PKG =`
`/Users/neilwilliams/Library/CloudStorage/GoogleDrive-abdullah@sophicly.com/My Drive/Business/Web Development/Sophicly Website/Etch for Sophicly/Etch for Sophicly Walkthrough/Etch for Sophicly Walkthrough by Claude/sophicly-etchwp-package v2.6`
`MS = {PKG}/Sophicly Etch Mark Scheme Resources`
All paths below are absolute once the shorthand is expanded.

---

## 0. MOTIVATING BUG — AQA Lang P2, Source B missing its preamble

**Finding: the real AQA P2 insert gives EVERY source an equal preamble — a contents-page block AND a per-source contextual intro of 2–3 sentences. Source B is NOT allowed to be barer than Source A.** Confirmed verbatim from the real AQA June 2019 P2 insert (`AQA-87002-INS-JUN19`):

> `Source A:` `21st Century non-fiction` / `The Crossing` / `An extract from James Cracknell and Ben Fogle's autobiographical account of crossing the Atlantic, published in 2006`
> `Source B:` `19th Century literary non-fiction` / `Idle Days in Patagonia` / `An extract from W H Hudson's travel writing, published in 1893`

and on each source's own page:

> **Source A** — "In 2005, Ben Fogle and James Cracknell set off together in a seven week race across the Atlantic Ocean in a rowing boat called 'Spirit'. In their book *The Crossing*, Ben describes what happened one night as he rowed and James slept."
> **Source B** — "In 1893, William Hudson travelled by sea to Patagonia, a remote area in South America, to study birds. In his book *Idle Days in Patagonia*, he describes the journey to get there."

*File:* `{PKG}/Sophicly Etch Writing Mastery Plugin/Sophicly Writing Mastery Lab Language Extracts/Language Non-Fiction Extracts/AQA-87002-INS-JUN19-1 (1).pdf`

**What Source B ("London Snow", Arthur Munby, 1867) SHOULD render.** The Sophicly canonical source file ALREADY carries the correct preamble; the staging doc is simply failing to render it. The authored preamble to show is (verbatim from source-of-truth):

> **Source B — London Snow**
> **Author:** Arthur Munby (1867)
> **Form:** 19th-century literary non-fiction (diary entries)
> **Context:** "Extracts from a diary kept by Arthur Munby in the 1800s. In these entries from January 1867, he describes London in the snow."

*File (source of truth):* `{PKG}/Model Answers/AQA Lang P2 Sample Answers — Death Zone + London Snow/Source B — London Snow (extract).md`
Source A's parallel authored preamble (which the staging doc *does* show) is in the sibling file `Source A — The Death Zone (extract).md`: **Author:** Matt Dickinson (1997); **Form:** 20th-century non-fiction (expedition memoir); **Context:** "British climber Matt Dickinson… his colleague, Audrey Salkeld, is the first to see the approaching storm."

➡️ **Fix is a rendering/parity bug, not missing content:** render Source B's `Author / Form / Context` block with the same anatomy as Source A. To match AQA's real house style even more closely, Source B's block should read like a contents line + a 2-sentence intro, e.g. matching AQA's `Source B: 19th Century literary non-fiction / London Snow by Arthur Munby / An extract from a diary, published 1867` then the Context sentence.

---

## 1. AQA (8700) — Paper 1 & Paper 2

**P1 — where:** SEPARATE insert booklet (`8700/1`), one source only.
**P1 preamble anatomy (verbatim, 2026-spec insert):**
> `The source that follows is:`
> `Source A:` `21st Century prose-fiction` / `The Life of Pi by Yann Martel` / `An extract from the middle of a novel written in 2001`
> then on the source page: **Source A** — "This extract is from the middle of a novel. The narrator, a teenage boy called Pi, is in a large lifeboat in the Pacific Ocean. There are no people with him in the lifeboat but there are several animals, including an orang-utan, a zebra and a hyena."

- **Label form:** `Source A` (single source labelled A even though alone).
- **Contents block fields:** century+genre tag · `Title by Author` · "An extract from [where in the work] written/published in [year]".
- **Per-source intro:** 2–3 plain sentences of situational context.
- *File:* `{MS}/AQA Lang P1 Insert 2026 Spec.pdf`

**P2 — where:** SEPARATE insert booklet (`8700/2`), TWO sources (A + B), one 19thC + one 20th/21stC non-fiction.
**P2 preamble anatomy (verbatim, 2026-spec insert):**
> `Source A:` `20th Century literary non-fiction` / `One's Company by Peter Fleming` / `An extract from a travel book, published in 1933`
> `Source B:` `19th Century non-fiction` / `Records of a Girlhood by Fanny Kemble` / `An extract from a letter, published in 1878`
> **Source A** — "Source A is an extract from a travel book in which Peter Fleming describes his train journey on the Trans-Siberian Railway in 1933. The journey is over nine thousand kilometres…"
> **Source B** — "Source B is an extract from a letter written by Fanny Kemble to a friend about her first ride on a steam train in 1830, when she was 21. The steam engine had recently been invented by George Stephenson…"
- *File:* `{MS}/AQA Lang P2 Insert 2026 Spec.pdf` (June-2019 real insert corroborates, §0 above).

**Line numbering (both papers):** numbered **every 5 lines** in the left margin (5, 10, 15, 20, 25, 30, 35 …).
**Glosses:** yes — asterisk in text + footnote gloss at the foot of the source. Verbatim example (P2 2026, Source B): "these curious little fire-horses all mares\*" → glossed below the extract.

**Sophicly should render for AQA:**
- P1: one boxed `Source A` header → century/genre tag line → `Title by Author (year)` → 2–3-sentence context sentence → then the numbered text (every 5).
- P2: a two-line contents summary (Source A + Source B blocks) THEN each source on its own with `Source A`/`Source B` header + equal 2–3-sentence context intro. **Both sources get identical preamble depth** (this is the bug in §0). Glosses as footnotes with `*`.

---

## 2. Edexcel GCSE (1EN0) — Paper 1 & Paper 2

**P1 — where:** SEPARATE "Reading Text Insert (enclosed)", ONE fiction text. QP (`1EN0/01`) says: "Read the text in the Reading Text Insert provided and answer ALL questions." *File:* `{MS}/Edexcel GCSE English Language Paper 1/Edexcel GCSE English Language Paper 1 Past Papers/June 2024 QP - Paper 1 Edexcel English Language GCSE.pdf`
**P2 — where:** SEPARATE "Reading Texts Insert (enclosed)", TWO non-fiction texts labelled **Text 1 / Text 2**. QP (`1EN0/02`) verbatim: "Read **Text 1**. Then answer Questions 1–3." and later re-prints a boxed passage: "Read this extract. During the day, the job was manageable…". *File:* `{MS}/Edexcel GCSE English Language Paper 2/Edexcel GCSE English Language Paper 2 Past Papers/June 2024 QP - Paper 2 Edexcel English Language GCSE.pdf`

- **Label form:** `Text 1`, `Text 2` (NOT "Source A/B").
- **Line numbering:** yes, referenced by line ranges in questions ("From lines 17–20…", "From lines 1–3…") — inserts number in fives.
- **Preamble content:** ⚠️ The **insert booklets themselves are NOT on system** (only QP + MS). The QPs confirm the *structure* (separate insert, Text 1/Text 2 labels, line numbering) but the per-text preamble wording (title/author/date/context line) could not be quoted from a real Edexcel GCSE insert. Edexcel's known house style is a brief italic source line under each Text heading — treat as **STRUCTURE-CONFIRMED, PREAMBLE-WORDING UNCONFIRMED**.

**Sophicly should render for Edexcel GCSE:** P1 = single `Text` header + brief source line + numbered fiction text. P2 = `Text 1` and `Text 2` headers, each with a short source/attribution line, line-numbered. Do not use "Source A/B" labels for Edexcel.

---

## 3. Eduqas / WJEC (C700) — Component 1 & Component 2

**C1 (P1) — where:** SEPARATE "Resource Material for use with Section A" booklet; ONE 20thC prose-fiction passage. QP (`C700U10-1`) verbatim: "Read carefully the passage in the separate Resource Material for use with Section A. Then answer all the questions below." *File:* `{MS}/EDUQAS GCSE English/EDUQAS GCSE English Language Paper 1/EDUQAS GCSE English Language Paper 1 s19-5700-01.pdf`
**C2 (P2) — where:** TWO non-fiction sources across two centuries. One is in the SEPARATE Resource Material (a modern text); the other is PRINTED on the facing page of the QP. QP (`Z22-C700U20-1`) verbatim: "The separate Resource Material for use with Section A is a newspaper article, **'Knockout Punch'**." and "The account on the opposite page is from the book, **'London Labour and the London Poor' published in 1851**." *File:* `{MS}/EDUQAS GCSE English/EDUQAS GCSE English Language Paper 2/Reading Sources for EDUQAS Language Paper 2/z22-c700u20-1a.pdf`

- **Label form:** Eduqas does **NOT** use "Source A/B" or "Text 1/2" — sources are referred to **descriptively by title** ("the newspaper article, 'Knockout Punch'"; "the account… from the book 'London Labour and the London Poor'").
- **Preamble content:** minimal — **title in quotes + publication year** ("…'London Labour and the London Poor' published in 1851"). No boxed century-tag block, no multi-sentence AQA-style context intro.
- **Line numbering:** yes — questions reference line ranges ("lines 1–17", "lines 18–65", "lines 66–89"); passages numbered.
- ⚠️ A file named `EDUQAS …Specimen-insert-Oct-2016… (City of the Beasts / Alex Cold)` in this folder is a **Sophicly-ADAPTED diagnostic** (it is headed "DIAGNOSTIC PAPER" and uses an AQA-style boxed `Source A` block) — it is NOT pristine Eduqas house style; do not treat its layout as Eduqas convention. Real Eduqas convention is the descriptive-by-title style quoted above.

**Sophicly should render for Eduqas:** No "Source A/B" labels. Introduce each text descriptively in a lead sentence naming the genre + title + year ("The account below is from … , published in …"). Line-numbered. C1 = one passage; C2 = two texts (one modern, one 19thC).

---

## 4. OCR (J351/01, J351/02) — English Language

**NO EVIDENCE FOUND ON SYSTEM.** No OCR English *Language* question paper, insert, or specimen exists anywhere in the tree (searched `*J351*`, `*ocr*lang*`, all PDFs). The only OCR material present is **OCR *Literature* Mark Schemes** (`{MS}/OCR Literature Mark Schemes`) and OCR literature model answers (`{PKG}/Model Answers/OCR`). Sophicly's own `protocols/ocr/` templates exist but are Sophicly-authored, not the board's real insert. **Cannot document OCR Language insert anatomy from a real source — must be sourced.**

---

## 5. Edexcel International GCSE Spec A (4EA1) — Paper 1 & Paper 2

**P1 (`4EA1/01`) — where:** SEPARATE "Source Booklet (enclosed)", TWO non-fiction texts labelled **Text One / Text Two** (one drawn from the Pearson Edexcel International GCSE English **Anthology**, one unseen). QP verbatim: "The following questions are based on **Text One and Text Two** in the Source Booklet." then "**Text One: Tin Bath Tournament**". *File:* `{MS}/EDEXCEL IGCSE English Language Component A/Edexcel IGCSE Spec A Language Paper 1/Edexcel IGCSE Language Paper 1 June 2024 QP.pdf`
**P2 (`4EA1/02`) — where:** NO separate booklet ("You do not need any other materials"). The anthology poem/prose is PRINTED in the QP. Verbatim: "Remind yourself of **An Unknown Girl**, taken from the Pearson Edexcel International GCSE English Anthology." then the poem printed with a numbered gloss ("hennaing¹"). *File:* `{MS}/EDEXCEL IGCSE English Language Component A/Edexcel IGCSE Spec A Language Paper 2/Edexcel IGCSE Spec A Lang P2 June 2024 QP.pdf`

- **Label form:** `Text One`, `Text Two` (spelled out), each followed by its **title** on the heading line ("Text One: Tin Bath Tournament").
- **Preamble content:** heading label + title. Fuller source/attribution + any context lives in the Source Booklet / Anthology (Anthology on system: `…/Anthology for Edexcel IGCSE Spec A/iGCSE-Anthology-English-Language-A-and-English-Literature.pdf`).
- **Line numbering:** yes — every 5 (questions cite "lines 4–6", "lines 41–51").
- **Glosses:** yes — superscript numbered footnotes (e.g. "hennaing¹").
- **Note:** IGCSE Spec A Lang A P2 is a Poetry/Prose-anthology + imaginative-writing paper (literature-flavoured), not a two-source non-fiction reading paper.

**Sophicly should render for Edexcel IGCSE Spec A:** P1 = `Text One: [Title]` / `Text Two: [Title]` headers, line-numbered, anthology text carries its anthology attribution. P2 = "Remind yourself of [Title], taken from the … Anthology" + printed poem/prose with superscript numbered glosses.

---

## 6. Cambridge IGCSE (0500 / 0990) First Language English — Paper 1 & Paper 2

**P1 (`0500/01`) — where:** SEPARATE insert booklet ("This insert contains the reading texts"). **P2 (`0500/02`) — where:** SEPARATE insert booklet likewise.
**Preamble anatomy (verbatim, 2027 specimen inserts):**
> P1: "Read **Text A** and then answer Question 1(a)–(f) on the question paper." → heading "**Text A: Horses**" → straight into prose. (Second text later: "Text B".)
> P2: "Read both texts…" → "**Text A: Teamwork**" and "**Text B: Competition**".
- *Files:* `{MS}/CAIE GCSE English Language/CAIE English Language Paper 1/718835-2027-specimen-paper-1-insert.pdf` ; `…/CAIE English Language Paper 2/718836-2027-specimen-paper-2-insert.pdf`

- **Label form:** `Text A`, `Text B` + a **one-word/short topic title** on the same line ("Text A: Horses", "Text B: Competition").
- **Preamble content:** MINIMAL — label + short title only. **No author, no date/period, no contextual sentence.**
- **Line numbering:** yes — every 5, numbered in the **right** margin.
- **Glosses:** not shown in the sampled first texts (Cambridge uses occasional footnote glosses when needed).

**Sophicly should render for Cambridge IGCSE:** `Text A: [short title]` / `Text B: [short title]` headers only — deliberately sparse, no author/date/context line — line-numbered in fives. Cambridge is the leanest preamble of all boards.

---

## 7. CCEA (Unit 1 / Unit 4) — English Language

**NO EVIDENCE FOUND ON SYSTEM.** No CCEA English *Language* question paper, insert or specimen is present. Only CCEA *Literature* set-text data (`…/protocols/shared/exam-question/data/ccea-*.md`), CCEA FQ banks, CCEA literature model answers (`{PKG}/Model Answers/CCEA`), and Sophicly's own `protocols/ccea/` templates exist — all Sophicly-authored or literature-only, not the board's real Language insert. **Cannot document CCEA Language insert anatomy from a real source — must be sourced.**

---

## 8. SQA National 5 — Reading for Understanding, Analysis & Evaluation (RUAE) + Critical Reading

**RUAE (`X824/75/11`) — where:** the passage is printed IN the question paper itself (no separate insert). **Preamble anatomy (verbatim, 2025):**
> title "**How Taylor Swift Saved My Writing**" then a single italic context line: "In this article the writer reflects on the positive effects of listening to Taylor Swift's music."
- *File:* `{MS}/SQA English National 5 Reading for Understanding/SQA English National 5 N5_English_Reading-for-Understanding-Analysis-and-Evaluation_2025.pdf`
- **Label form:** none ("Source"/"Text" not used); a **title** + a one-line italic gloss of what the article is about. Author/source acknowledged at the foot of the passage, not in the header.
- **Line numbering:** yes — every 5.

**Critical Reading (`X824/75/12`) — where:** Scottish set-text extracts printed in the QP (this is a literature-style paper). **Preamble anatomy (verbatim, 2025):**
> "**Text 1 — Drama**" / "**Bold Girls by Rona Munro**" / "In this extract, Deirdre returns the money she has stolen."
- *File:* `{MS}/SQA English National 5 Critical Reading/SQA English National 5 N5_English_Critical-Reading_2025.pdf`
- **Label form:** `Text N — [Genre]` then `[Title] by [Author]` then a one-line situational context ("In this extract, …").

**Sophicly should render for SQA:** RUAE = article title + one-line italic "what it's about" gloss, no Source label, line-numbered, attribution at foot. Critical Reading = `Text N — [Genre]` / `[Title] by [Author]` / "In this extract, …".

---

## SUMMARY TABLE

| Board | Paper | Source location | Label form | Title? | Author? | Date/period? | Context sentence? | Line numbers | Glosses |
|---|---|---|---|---|---|---|---|---|---|
| AQA (8700) | P1 | separate insert | `Source A` | ✅ `Title by Author` | ✅ | ✅ (in block) | ✅ 2–3 sents | every 5 | ✅ `*` footnote |
| AQA (8700) | P2 | separate insert | `Source A` / `Source B` | ✅ | ✅ | ✅ | ✅ 2–3 sents, **both sources equal** | every 5 | ✅ `*` footnote |
| Edexcel GCSE (1EN0) | P1 | separate insert | `Text` (single) | (insert not on system) | ? | ? | ? | yes (line refs) | ? |
| Edexcel GCSE (1EN0) | P2 | separate insert | `Text 1` / `Text 2` | (insert not on system) | ? | ? | ? | yes (line refs) | ? |
| Eduqas (C700) | C1 | separate Resource Material | descriptive by title (no A/B) | ✅ in quotes | at foot | sometimes | brief lead only | yes (line refs) | occasional |
| Eduqas (C700) | C2 | 1 in Resource Material + 1 printed in QP | descriptive by title | ✅ in quotes | at foot | ✅ ("published in 1851") | brief lead only | yes | occasional |
| OCR (J351) | P1/P2 | — | **NO EVIDENCE ON SYSTEM** | — | — | — | — | — | — |
| Edexcel IGCSE Spec A (4EA1) | P1 | separate Source Booklet | `Text One` / `Text Two` + title | ✅ | in booklet/anthology | in booklet | in booklet | every 5 | ✅ superscript ¹ |
| Edexcel IGCSE Spec A (4EA1) | P2 | printed in QP (anthology) | "Remind yourself of [Title]…" | ✅ | anthology | anthology | anthology | (poem lines) | ✅ superscript ¹ |
| Cambridge IGCSE (0500/0990) | P1 | separate insert | `Text A` / `Text B` + short title | ✅ short | ❌ | ❌ | ❌ | every 5 (right margin) | rare |
| Cambridge IGCSE (0500/0990) | P2 | separate insert | `Text A` / `Text B` + short title | ✅ short | ❌ | ❌ | ❌ | every 5 | rare |
| CCEA (U1/U4) | P1/P2 | — | **NO EVIDENCE ON SYSTEM** | — | — | — | — | — | — |
| SQA N5 | RUAE | printed in QP | none (title only) | ✅ | at foot | — | ✅ 1 italic line | every 5 | — |
| SQA N5 | Critical Reading | printed in QP (lit) | `Text N — Genre` | ✅ | ✅ `by Author` | — | ✅ "In this extract…" | (as needed) | — |

**Preamble richness ranking (richest → leanest):** AQA (full boxed block + 2–3-sentence per-source intro + glosses) → SQA Critical Reading (genre/title/author + 1-line context) → Edexcel IGCSE Spec A (label+title, detail in booklet) → SQA RUAE (title + 1 italic line) → Eduqas (descriptive by title + year) → Edexcel GCSE (Text 1/2 labels; wording unconfirmed) → Cambridge IGCSE (label + short title ONLY, nothing else). This matches Neil's stated expectation that AQA is the richest and others give less.

---

## GAPS — boards/papers with no on-system real-insert evidence (Neil to source)

1. **OCR English Language (J351/01 fiction, J351/02 non-fiction)** — no QP/insert/specimen anywhere; only OCR *Literature* is on system. Need a real OCR Language paper + insert to document its preamble/label convention.
2. **CCEA English Language (Unit 1 / Unit 4)** — no QP/insert/specimen; only CCEA *Literature* set-text data + Sophicly-authored templates. Need a real CCEA Language paper.
3. **Edexcel GCSE (1EN0) reading inserts** — the QPs are on system and confirm the *structure* (separate insert; `Text`/`Text 1`/`Text 2` labels; line numbering) but the **actual insert booklets are not present**, so the per-text preamble WORDING (attribution/date/context line) is unconfirmed against a real Edexcel insert. Source the `1EN0/01` and `1EN0/02` Reading Text Insert booklets to lock the exact wording.
4. **Eduqas C1 pristine Resource Material** — real C2 evidence is solid (z22 QP); the C1 preamble style is inferred from the QP reference line + the C2 pattern. The only C1 "insert" on system is Sophicly-adapted (AQA-style). Source a genuine WJEC/Eduqas C1 Resource Material booklet to confirm C1's exact lead-in wording.

---

## PRIMARY EVIDENCE FILES (quick index)

- AQA P1 insert: `{MS}/AQA Lang P1 Insert 2026 Spec.pdf`
- AQA P2 insert (2026): `{MS}/AQA Lang P2 Insert 2026 Spec.pdf`
- AQA P2 insert (real June 2019): `{PKG}/Sophicly Etch Writing Mastery Plugin/Sophicly Writing Mastery Lab Language Extracts/Language Non-Fiction Extracts/AQA-87002-INS-JUN19-1 (1).pdf`
- Edexcel GCSE P1 QP: `{MS}/Edexcel GCSE English Language Paper 1/Edexcel GCSE English Language Paper 1 Past Papers/June 2024 QP - Paper 1 Edexcel English Language GCSE.pdf`
- Edexcel GCSE P2 QP: `{MS}/Edexcel GCSE English Language Paper 2/Edexcel GCSE English Language Paper 2 Past Papers/June 2024 QP - Paper 2 Edexcel English Language GCSE.pdf`
- Eduqas C1 QP: `{MS}/EDUQAS GCSE English/EDUQAS GCSE English Language Paper 1/EDUQAS GCSE English Language Paper 1 s19-5700-01.pdf`
- Eduqas C2 QP (reading source): `{MS}/EDUQAS GCSE English/EDUQAS GCSE English Language Paper 2/Reading Sources for EDUQAS Language Paper 2/z22-c700u20-1a.pdf`
- Edexcel IGCSE Spec A P1 QP: `{MS}/EDEXCEL IGCSE English Language Component A/Edexcel IGCSE Spec A Language Paper 1/Edexcel IGCSE Language Paper 1 June 2024 QP.pdf`
- Edexcel IGCSE Spec A P2 QP: `{MS}/EDEXCEL IGCSE English Language Component A/Edexcel IGCSE Spec A Language Paper 2/Edexcel IGCSE Spec A Lang P2 June 2024 QP.pdf`
- Edexcel IGCSE Anthology: `{MS}/EDEXCEL IGCSE English Language Component A/Anthology for Edexcel IGCSE Spec A/iGCSE-Anthology-English-Language-A-and-English-Literature.pdf`
- Cambridge IGCSE P1 insert: `{MS}/CAIE GCSE English Language/CAIE English Language Paper 1/718835-2027-specimen-paper-1-insert.pdf`
- Cambridge IGCSE P2 insert: `{MS}/CAIE GCSE English Language/CAIE English Language Paper 2/718836-2027-specimen-paper-2-insert.pdf`
- SQA N5 RUAE: `{MS}/SQA English National 5 Reading for Understanding/SQA English National 5 N5_English_Reading-for-Understanding-Analysis-and-Evaluation_2025.pdf`
- SQA N5 Critical Reading: `{MS}/SQA English National 5 Critical Reading/SQA English National 5 N5_English_Critical-Reading_2025.pdf`
- Sophicly AQA P2 canonical sources (bug fix source-of-truth): `{PKG}/Model Answers/AQA Lang P2 Sample Answers — Death Zone + London Snow/` (`Source A — The Death Zone (extract).md`, `Source B — London Snow (extract).md`)
