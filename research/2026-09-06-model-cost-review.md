# Model cost review — Sonnet 5 vs Gemini 3.8 Flash

**Date:** 2026-09-06 · **Lane:** WML · **Status:** research only, nothing changed, nothing deployed
**Question (Neil, verbatim):** *"I've also raised the concern about our token usage. I even suggested at one
point we might need to consider moving away from, like Sonnet. Gemini 3.8 Flash is out at the moment. You
might want to check those prices out. Would we save anything compared to Sonnet 5, considering Sonnet 5 has
caching?"*

---

## E. RECOMMENDATION (read this and stop)

1. **Yes, Flash is cheaper — about 4x — and caching does NOT close that gap.** Gemini caches too (implicitly,
   free, no write premium) at the same 0.1x discount on a base price 2.7x lower. Even at a *perfect* 100%
   cache hit, Sonnet 5 costs **$0.98** per assessment session against Flash's **$0.25**.
2. **But right now the whole WML bill is about $3 a month.** Measured: 313 Claude calls, 46 sessions, 30 days.
   Switching model today saves roughly **£2 a month**. This is a scale question, not a today question.
3. **KEEP Sonnet 5 for assessment marking.** At £4.05 per active student per month it is **2.9% of a Gold
   £140** and **5.8% of a Silver £70**. Marking accuracy is the product; 3% of revenue is not the place to
   economise.
4. ⚠️ **Bronze £20 is the one tier where this bites.** A heavy student (12 assessments/month) costs **£12.15
   on Sonnet 5 — 61% of a £20 Bronze**. That is Neil's own stated fear, and the arithmetic confirms it.
5. **The single highest-value action is NOT a model switch — it is an instrument.** We cannot currently
   measure our cache-hit ratio at all (see A2). Every number below assumes caching works; if it does not,
   Sonnet 5 costs up to **4x more than modelled**. One line of logging settles it.
6. **Second action: fix the CLAUDE.md header.** It says "Sonnet 4.6". Production is `claude-sonnet-5`.
7. **If you want a cheaper model, try Haiku 4.5 BEFORE Gemini.** Same vendor, same marker behaviour family,
   same tokenizer, zero integration work — and it is already configured on the site chatbot. £1.79/student
   vs £4.05. It captures 55% of the available saving for ~5% of the risk.
8. **Trial design if you still want Flash:** 20 already-marked AQA Lang P1 scripts, re-marked on Flash,
   scored on three gates — marker compliance rate (target ≥98%), mark agreement with the Sonnet baseline
   (target within ±1 grade on ≥90%), and Neil's blind read of 5 feedback cards. Full design in §D4.
9. **Cost to run that trial: about $6 in tokens, plus one engine-lane day and one hour of Neil's reading.**
10. **Do not switch on price alone.** The gap is £2/month today and £194/month at 200 students — real, but
    smaller than one lost Gold subscription caused by worse marking.

---

## A. WHAT WE ACTUALLY RUN TODAY

### A1. The configured model — CONFIRMED, and the docs were stale

The WML `CLAUDE.md` header says *"AI Provider: Claude Sonnet 4.6 via MeowApps AI Engine (with GPT-5
fallback)"*. **That is out of date.** Measured on production, 2026-09-06:

| what | value | how measured |
|---|---|---|
| WML chatbot id | `wml-claude` | `includes/class-rest-api.php:1463` — `$params['botId'] ?? 'wml-claude'` |
| **Model** | **`claude-sonnet-5`** | prod `wp eval` over `get_option('mwai_chatbots')` |
| Environment | `5yds2p9b` (type `anthropic`) | same |
| temperature | 0.3 — **stripped before send** | `class-protocol-router.php:579` `strip_temperature_for_claude5` (Claude 5 rejects the param) |
| maxTokens / maxMessages | 64000 / 1024 | same |
| Fallback bot | `wml` (OpenAI) — only if the Claude bot errors | `class-rest-api.php:1637-1655` |
| Site chatbot (not WML) | `claude-haiku-4-5` on the same Anthropic env | bot `default` |
| AI Engine global default | `gpt-4.1-mini` on env `2hxmij2c` | `mwai_options.ai_default_model` |

**Measured volume — prod `wp_mwai_logs`, the complete retention window 2026-08-07 → 2026-09-06:**

| model | calls | sessions | turns/session | output tokens |
|---|---|---|---|---|
| `claude-sonnet-4-6` | 191 | 27 | 7.1 | 26,544 |
| `claude-sonnet-5` | 122 | 19 | 6.4 | 77,370 |
| `claude-haiku-4-5` (site bot) | 4 | 1 | 4.0 | — |
| `gpt-4.1-mini` (other bots) | 31 | 1 | 31.0 | — |
| **WML Claude total** | **313** | **46** | **6.8** | **103,914** |

Distinct users in the window: **13**. Distinct days with traffic: **31**.

⚠️ **Three caveats on that table, and they matter:**
- `statistics_retention_days = 30`, so the table holds **exactly one month** and nothing older exists. It is a
  valid monthly measure; it is not a trend.
- **August is the summer trough.** 13 users is not a term-time cohort. Every projection in §C scales this.
- The switch from Sonnet 4.6 → Sonnet 5 happened *during* the window (4.6 appears only in August).

**What `units` and `price` actually mean — measured, not assumed.** The repo memory says
`mwai_logs.price` is output-only and is not the billed cost. That is **confirmed by arithmetic**:

```
sonnet-4-6:  26,544 units x $15/MTok (output rate) = $0.3982   logged price = $0.3913  ✓
sonnet-5  :  77,370 units x $10/MTok (output rate) = $0.7737   logged price = $0.7701  ✓
haiku-4-5 :   4,166 units x  $5/MTok              = $0.0208   logged price = $0.0052  ✗
```

⇒ On the WML/Anthropic streaming path, **`units` = OUTPUT tokens only** and `price` = output cost only.
Input tokens are **never recorded**. (The Haiku rows do not fit that formula, so the non-streaming site-bot
path logs something else — total tokens most likely. Not load-bearing here.)

**So the logged $1.16 for the month is NOT the bill.** It is the output half of it. §C models the rest.

### A2. Prompt caching — live and well engineered, but its hit rate is UNMEASURABLE

**CONFIRMED live.** `includes/class-protocol-router.php:600-700`, `extend_anthropic_cache_ttl`, hooked on
`http_request_args`. Two deliberate moves, both correct:

1. **TTL upgrade (v7.19.428).** AI Engine hard-codes Anthropic's 5-minute ephemeral TTL with no filter.
   Sophicly's 2-hour sessions contain a ~15-minute break, which expires a 5-minute cache. The router rewrites
   `cache_control.ttl` to `1h` at the WordPress HTTP layer, scoped to `api.anthropic.com/v1/messages` only.
   Update-safe — it never edits the AI Engine plugin.
2. **History caching (v7.19.593).** AI Engine only marks the *instructions* block, so the growing conversation
   history was re-sent at full input price every turn. The router (a) relocates the per-turn dynamic context
   ("LIVE SESSION DIRECTIVES") out of the system array into the current user turn — a changing block sitting
   before the history is a cache wall — and (b) stamps a rolling 1h breakpoint on the last message. The
   in-code comment names the stakes: *"the real cost driver on long assessment flows ($5+/assessment)"*.

⛔ **NOT MEASURABLE FROM THE LOGS.** `DESCRIBE wp_mwai_logs` returns
`id, userId, ip, session, model, feature, units, type, price, scope, envId, time, refId, stats, accuracy`.
There is **no `cache_read_input_tokens` column, no `cache_creation_input_tokens` column, and no input-token
column of any kind**; `stats` is `NULL` on the sampled rows. Anthropic returns those counts in every
response `usage` object — nothing on our side persists them.

**This is a real gap, not a footnote** (root CLAUDE.md §19: measure, never guess). Everything in §C assumes the
cache works as designed. The router's own comment at line 7432 records the opposite risk — *"canvas change
shifted N and busted the whole prompt-cache prefix"* — so a degraded hit rate is a known, named failure mode
that we currently cannot see. §C's sensitivity table shows it is worth up to **4x**.

**Cheap fix (engine lane, ~10 lines, no student impact):** capture `usage.cache_read_input_tokens`,
`usage.cache_creation_input_tokens` and `usage.input_tokens` from the Anthropic response and write them to a
`swml_token_usage` option or `wp_mwai_logmeta`. One week of that turns every estimate below into a measurement.

### A3. Representative workflow shapes — MEASURED where possible

**The static prefix, measured from disk** (`protocols/aqa/language1/manifest.json`, the `assessment.always`
list, resolved through `protocols/aqa/language1/` then `protocols/shared/`):

| phase | modules | bytes | ~tokens @4 ch/tok | ~tokens on Sonnet 5 tokenizer (+30%) |
|---|---|---|---|---|
| **assessment** | 13 | **154,966** | 38,742 | **50,364** |
| planning | 5 | 118,569 | 29,642 | 38,535 |
| polishing | 10 | 100,857 | 25,214 | 32,778 |

The single largest file is `modules/protocol-a-assessment.md` at 54,371 bytes; `planning/protocol-b-planning.md`
is 84,672 bytes. Add the WML preamble (~1.3k tokens) → **modelled assessment prefix ≈ 40,000 tokens**
(≈52,000 on Sonnet 5, see the tokenizer note in §B).

**The representative assessment session — a REAL one, not an invented one.** Session
`6d268142cb79da5859fb5553ad95d19e`, 2026-09-04 12:52 → 17:42 (4h50m):
**24 turns, 30,871 output tokens**, logged output-only price $0.3083. This is the largest real session in the
window and is what a full AQA Lang P1 marking run looks like.

**The representative planning session:** the fleet average is **6.8 turns**; modelled at 7 turns and ~6,000
output tokens against the 118,569-byte planning prefix. *(ESTIMATED — per-session output for planning
specifically was not separated in the logs.)*

---

## B. OFFICIAL PRICING (quoted, with URL, fetched 2026-09-06)

### Anthropic — CONFIRMED
Source: <https://platform.claude.com/docs/en/about-claude/pricing> (fetched 2026-09-06; `docs.claude.com`
302-redirects here). Per MTok:

| Model | Base input | 5m cache write | 1h cache write | Cache hit | Output |
|---|---|---|---|---|---|
| **Claude Sonnet 5** | **$2** | **$2.50** | **$4** | **$0.20** | **$10** |
| Claude Sonnet 4.6 | $3 | $3.75 | $6 | $0.30 | $15 |
| Claude Haiku 4.5 | $1 | $1.25 | $2 | $0.10 | $5 |
| Claude Opus 5 | $5 | $6.25 | $10 | $0.50 | $25 |

- Cache multipliers, quoted: *"5-minute cache write 1.25x base input price … 1-hour cache write 2x base input
  price … Cache read (hit) 0.1x base input price"*.
- Page note, quoted: *"The $2/$10 per million input/output token pricing for Claude Sonnet 5, announced at
  launch as introductory pricing through August 31, 2026, is now the standard price. The previously scheduled
  increase to $3/$15 … will not occur."* **Sonnet 5 got permanently cheaper five days ago.**
- ⚠️ **Tokenizer, quoted:** *"Claude 4.7 and later models … use a newer tokenizer … This tokenizer produces
  approximately 30% more tokens for the same text … Claude Sonnet 4.6 and earlier models use the previous
  tokenizer."* Sonnet 5 is in the new-tokenizer generation, so **its effective input price on our protocol text
  is nearer $2.60/MTok than $2**. This is applied throughout §C.
- **Batch API: 50% off input and output** (Sonnet 5 → $1 / $5). *"Batch API and prompt caching discounts can
  be combined."* ⛔ **Not usable for WML** — batch is asynchronous and our sessions are interactive.
- **Long context:** *"Claude 4.6 and later models … include the full 1M token context window at standard
  pricing."* No >200k premium. Good for us.

### Google Gemini — CONFIRMED
Source: <https://ai.google.dev/gemini-api/docs/pricing?hl=en> (fetched 2026-09-06). Per 1M tokens, paid tier:

| Model | Input | Cached input | Output | Cache storage |
|---|---|---|---|---|
| **Gemini 3.8 Flash** (`gemini-3.8-flash`) | **$0.75** | **$0.075** | **$3.75** | $0.50 /MTok/hour |
| *…from 1 Jan 2027* | $1.50 | $0.15 | $7.50 | $1.00 /MTok/hour |
| Gemini 3.1 Pro Preview (`gemini-3.1-pro-preview`) | $2.00 (≤200k) / $4.00 (>200k) | $0.20 / $0.40 | $12.00 / $18.00 | $4.50 /MTok/hour |

- **Neil's model name is real.** `gemini-3.8-flash` exists and is on the official page; it launched 2 Sept 2026
  ([GCN](https://gcn.com/google-ships-gemini-flash-stronger-agentic/21390/)). The current price is explicitly
  **introductory and doubles on 1 Jan 2027** — quoted: *"$0.75 through December 31, 2026. $1.50 starting
  January 1, 2027."* Any decision must be costed at the January price, not today's.
- ⚠️ **"Gemini 3.8 Pro" does not exist.** The newest Pro on the official page is **Gemini 3.1 Pro Preview**.
  I have used that and said so rather than invent a price.
- **Batch API: 50% discount** (*"Batch API (비용 50% 절감)"* on the paid-tier feature list). Same
  interactive-workload objection as Anthropic — not usable for WML.
- **Implicit caching — the structurally important bit.** Source
  <https://ai.google.dev/gemini-api/docs/caching?hl=en>, quoted: *"Implicit caching is enabled by default for
  all Gemini 2.5 and newer models"*, with automatic cost savings and no setup. Minimum for a cache hit on
  **Gemini 3.8 Flash: 4,096 tokens** — our 40,000-token protocol prefix clears that by 10x. **There is no
  cache-write premium on implicit caching and no storage fee**; the $0.50/MTok/hour storage line applies to
  *explicit* caches only. Cache performance is readable at runtime via `usage.total_cached_tokens`.

---

## C. THE SUM

**Model.** Anthropic turn 1 writes the 40k prefix at the 1h-write rate (2x base), turns 2–24 read
prefix+history at 0.1x base and re-write the ~1,500-token increment at 2x. Gemini has no write premium: turn 1
pays base, turns 2–24 pay cached-input. Output is uncacheable on both. Sonnet 5's prefix is inflated 30% for
its tokenizer. Session = the **real** 24-turn / 30,871-output-token session from A3.

### One assessment session

| scenario | turn-1 write | cache reads | re-writes | output | **TOTAL** | no cache at all |
|---|---|---|---|---|---|---|
| **(i) Today — Sonnet 5, 1h cache** | $0.208 | $0.322 | $0.138 | $0.309 | **$0.977** | $3.633 |
| Sonnet 5, 5m cache (AI Engine default) | $0.130 | $0.322 | $0.086 | $0.309 | **$0.847** | $3.633 |
| Sonnet 4.6, 1h cache (what we ran in Aug) | $0.240 | $0.400 | $0.207 | $0.463 | **$1.310** | $4.585 |
| Haiku 4.5, 1h cache | $0.080 | $0.133 | $0.069 | $0.154 | **$0.437** | $1.528 |
| **(iii) Gemini 3.8 Flash** (implicit) | $0.030 | $0.100 | — | $0.116 | **$0.246** | — |
| Gemini 3.8 Flash from 1 Jan 2027 | $0.060 | $0.200 | — | $0.232 | **$0.492** | — |
| **(iv) Gemini 3.1 Pro Preview** | $0.080 | $0.267 | — | $0.370 | **$0.717** | — |

**Sonnet 5 : Flash = 3.97x today, 1.99x from January, 1.36x against Gemini 3.1 Pro.**

⭐ **Note the 1h-vs-5m row.** Our 1h TTL costs **$0.13 more per session** than the 5-minute default would.
That is correct engineering — it buys immunity to the 15-minute mid-session break, which would otherwise cost a
full $0.21 re-write — but it is a real, deliberate premium, not free.

### Monthly, at the volume actually measured (46 sessions, 103,914 output tokens)

Scaling the representative session down to the measured monthly output:

| | monthly |
|---|---|
| (i) Sonnet 5, 1h cache — **today's setup** | **$3.29** |
| (ii) Sonnet 5, 5m cache | $2.85 |
| Sonnet 4.6, 1h cache | $4.41 |
| Haiku 4.5 | $1.47 |
| (iii) **Gemini 3.8 Flash** | **$0.83** |
| Gemini 3.8 Flash from Jan 2027 | $1.65 |
| (iv) Gemini 3.1 Pro | $2.41 |

**Switching to Flash today saves $2.46 a month.** That is the honest answer to the question as asked.

### Where it actually matters — per active student, and at cohort scale

*ESTIMATED workload: 4 assessment + 4 planning sessions per active student per month. FX assumed at
$1 = £0.79 — this is an assumption, not a quoted rate; the ratios are unaffected by it.*

| model | per student/mo | 20 students | 50 | 100 | 200 |
|---|---|---|---|---|---|
| **Sonnet 5** | **£4.05** | £81 | £203 | £405 | £810 |
| Haiku 4.5 | £1.79 | £36 | £89 | £179 | £358 |
| Gemini 3.8 Flash | £0.97 | £19 | £48 | £97 | £194 |
| Gemini 3.8 Flash (Jan 27) | £1.94 | £39 | £97 | £194 | £388 |

**As a share of the tier the student is paying for** (prices per the shipped tier cards,
`mu-plugin-sources/sophicly-funnel-pages/science/price-panel.html`, per root CLAUDE.md §SERVICE MODEL):

| model | £/student/mo | of Bronze £20 | of Silver £70 | of Gold £140 |
|---|---|---|---|---|
| Sonnet 5 | £4.05 | **20.3%** | 5.8% | 2.9% |
| Haiku 4.5 | £1.79 | 8.9% | 2.6% | 1.3% |
| Gemini 3.8 Flash | £0.97 | 4.8% | 1.4% | 0.7% |

⚠️ **Heavy-user stress test (12 assessment + 12 planning sessions in one month):**

| model | cost | share of a £20 Bronze |
|---|---|---|
| **Sonnet 5** | **£12.15** | **61%** |
| Haiku 4.5 | £5.36 | 27% |
| Gemini 3.8 Flash | £2.91 | 15% |

This is Neil's own stated worry, quoted in root CLAUDE.md: *"with the price of AI now, if a student is doing
loads of assessments using Sophia, we could end up losing money on a twenty pound subscription."* **The
arithmetic supports the worry — but only for Bronze, and Bronze is already ruled to exclude the platform.**
If that ruling holds, Bronze students never reach Sophia and the risk is zero. If Bronze ever gains platform
access, it needs either a usage cap or a cheaper model, and that is the decision this document actually
informs.

### Sensitivity — what cache-hit ratio changes the answer

Sonnet 5, same 24-turn session, varying the fraction `h` of input that hits cache:

| cache hit rate | Sonnet 5 session | vs Gemini 3.8 Flash ($0.246) |
|---|---|---|
| 0% (cache broken) | $3.875 | 15.8x |
| 50% | $2.426 | 9.9x |
| 90% | $1.267 | 5.2x |
| **100% (as modelled)** | **$0.977** | **4.0x** |

⭐⭐ **The finding that answers Neil's question directly: there is NO cache-hit ratio at which Sonnet 5 beats
Gemini 3.8 Flash.** Even perfect caching leaves it 4x dearer. The premise — *"considering Sonnet 5 has
caching"* — assumes caching is a Claude advantage. It is not: **Gemini caches too, implicitly, automatically,
with no write premium and no storage fee, at the same 0.1x discount on a base price 2.7x lower.** Caching
scales both sides down together; the ratio survives.

What caching *does* buy us is real and large — **$3.63 → $0.98 per session, a 3.7x saving against no cache at
all.** The v7.19.428/.593 work was worth doing. It just does not win this particular comparison.

---

## D. THE QUALITY AXIS

### D1. What the protocols demand of the model — CONFIRMED from the repo

This is not a general chat workload. From `PROTOCOL-STANDARD.md` §B-COMMON:

- **Byte-exact structured markers.** `@REFLECT_GATE{"q","skill","ao","max"[,"target"]}` (§B-COMMON.4, line
  471) — *"max REQUIRED"*; `@FB_BEGIN{"q","para","title"}` … `@FB_END` (line 472) — *"labels exact; balanced
  pairs"*; and the canonical `Total Mark for [label]: X/max` line (line 399) — *"decimal allowed, **nothing
  else on the line**"*. The acceptance gates count them: `grep -c '@REFLECT_GATE'` must equal the assessed
  unit count (Lang P1 = 4), and `grep -c 'Total Mark for'` must be ≥ the sub-unit count (lines 581–583).
- **A markdown table with recomputed arithmetic** — `| Criterion | Worth | Your Score | Why |` plus
  `Total penalties: −X` (line 192), audited by code.
- **~40,000 tokens of instruction held simultaneously** — 13 modules, and per PROTOCOL ROUTER PREAMBLE RULES §6
  the protocol sits *last*, closest to the user turn, and is expected to dominate the prepended preamble.
- **Socratic judgment** — wrong/weak/resolved verdicts on free student text (WML CLAUDE.md §4b: *"a turn is
  judgment the moment it READS the student"*).
- **UK English register**, non-negotiable and pervasive.

**A missed marker is not a cosmetic defect.** The canvas renders feedback cards *from* the markers; the engine
carries a SILENT-SKIP guard precisely because a turn that looks successful can fill nothing. A dropped
`@FB_END` = an unrendered feedback card = a failed turn = a re-run, and per root CLAUDE.md §12 a re-run that
reaches Neil costs a test cycle, which is the most expensive resource in the project.

### D2. Published benchmark evidence — thin, and I will not overstate it

There is **no public benchmark that measures the thing we actually need** — sustained emission of a bespoke
marker grammar over a 40k-token instruction set. What exists:

- **Gemini 3.8 Flash leads on aggregate quality.** Artificial Analysis has it at **78.41 vs Sonnet 5's 70.76**,
  with non-overlapping 90% intervals ([benchlm comparison](https://benchlm.ai/compare/claude-sonnet-5-vs-gemini-3-8-flash),
  [DataCamp](https://www.datacamp.com/blog/gemini-3-8-flash-cyber)).
- **Terminal-Bench 2.1: Flash 90.8% vs Sonnet 5 80.4%** (same sources).
- **Sonnet 5 leads on knowledge work: GDPval-AA v2 1,618 vs Gemini 3.6 Flash 1,421** — ahead of Opus 4.8 (1,615)
  ([docsbot comparison](https://docsbot.ai/models/compare/claude-sonnet-5/gemini-3-8-flash)).
- **Instruction-following drift** is where the sources favour Claude — *"Claude follows complex, nuanced
  instructions with less drift"*, and Sonnet 5 leads Agent's Last Exam 33.3% vs 26.3%
  ([CodingFleet](https://codingfleet.com/blog/gemini-3-7-flash-vs-claude-sonnet-5/)).
- Both models list a **1M-token context window**, so our 40k prefix is unremarkable for either.

⚠️ **Read that honestly.** These are third-party aggregators, several of them comparing 3.6/3.7 Flash rather
than 3.8, and none of them is a vendor benchmark of structured-output fidelity. The one axis where the
evidence leans our way — instruction-following drift over long nuanced instructions — is *exactly* our
workload, but it is a qualitative claim in secondary sources, not a measurement. **Anyone who tells you they
know how Flash will handle `@FB_BEGIN` pairs across a 24-turn marking run is guessing.** Only a trial answers it.

Two further unknowns, both practical:

- **Integration is not free.** AI Engine's WML path is Anthropic-specific in our own code: the 1h-TTL rewrite
  and history-cache breakpoint (`extend_anthropic_cache_ttl`) are scoped to `api.anthropic.com/v1/messages`,
  and `strip_temperature_for_claude5` exists for a Claude quirk. A Gemini switch abandons that work and needs
  an equivalent built and proven against Gemini's implicit caching. Budget engine-lane days, not minutes.
- **UK English.** Every student-facing string is British English by standing rule. Untested on Flash.

### D3. The retry tax — computed, and it does not rescue Sonnet

If a model misses a marker on X% of assessment turns and the turn is re-run:

| miss rate | Sonnet 5 session | Flash session | Flash still cheaper by |
|---|---|---|---|
| 0% | $0.977 | $0.246 | 4.0x |
| 5% | $1.026 | $0.258 | 4.0x |
| 20% | $1.172 | $0.295 | 4.0x |

**Retries scale both models identically, so they never change the ratio.** **Flash would have to be re-run
297% of the time** — i.e. every turn attempted four times — to cost what a clean Sonnet 5 run costs.

⭐ **Which is precisely why cost must not decide this.** The retry *money* is trivial at any plausible miss
rate. What a 5% miss rate actually costs is a student staring at a marking screen with no feedback card, and
a Neil test cycle to find out why. That is the currency that matters, and it does not appear in any of the
tables above.

### D4. The controlled trial, if Neil wants one

- **Corpus:** 20 AQA Language Paper 1 scripts already marked on Sonnet 5 in the last 60 days (real student
  work, so the baseline exists and costs nothing to produce).
- **Procedure:** re-mark all 20 on `gemini-3.8-flash` through the same protocol payload, on staging, with no
  student exposure. Blind the outputs before Neil sees them.
- **Gate 1 — marker compliance (mechanical, automated).** Reuse the existing acceptance greps:
  `@REFLECT_GATE` count = 4 per paper; `@FB_BEGIN`/`@FB_END` balanced; `Total Mark for [label]: X/max` present
  per marked sub-unit with nothing else on the line; the criterion table parses.
  **Pass = ≥98% of turns clean. Below 95% = stop, no further analysis needed.**
- **Gate 2 — mark agreement.** Per-paper total vs the Sonnet 5 baseline. **Pass = within ±1 grade on ≥90% of
  papers and no systematic drift** (a consistent +1 or −1 is a recalibration problem, not a failure).
- **Gate 3 — Neil's blind read.** **5 feedback cards only**, presented old-beside-new as a tick-list artifact
  with a note box and a Copy button, per root CLAUDE.md §21. Not 20. Five. He rules on register, UK English,
  and whether the teaching is as good — and that ruling then governs the rest of the batch.
- **Cost to run:** 20 papers × ~$0.25 on Flash ≈ **$5, plus ~$1 of re-baselining** ≈ **$6 in tokens.** The real
  cost is one engine-lane day to build the Gemini transport and ~1 hour of Neil's reading.
- **Order of operations:** ship the cache instrument (§A2) **first** and let it run a week. If our real hit
  rate turns out to be poor, fixing it is a bigger, cheaper win than changing vendor — and it changes the
  numbers this whole document rests on.

---

## Provenance

- **Production measurements:** `wp_mwai_logs`, `mwai_chatbots`, `mwai_options` on `runcloud@18.133.5.229`,
  `/home/runcloud/webapps/SophiclyMain`, read-only, 2026-09-06. `wp` invoked via
  `/usr/local/lsws/lsphp83/bin/php` per the prod PHP-version rule.
- **Repo measurements:** `protocols/aqa/language1/manifest.json` + `os.path.getsize` on every resolved module;
  `includes/class-protocol-router.php`; `includes/class-rest-api.php`; `PROTOCOL-STANDARD.md`.
- **Pricing:** `platform.claude.com/docs/en/about-claude/pricing` and
  `ai.google.dev/gemini-api/docs/pricing?hl=en` + `/docs/caching?hl=en`, all fetched 2026-09-06. Quoted, not
  recalled.
- **ESTIMATED, flagged in place:** chars-per-token conversion (4 ch/tok, Anthropic's own guidance); the +30%
  Sonnet 5 tokenizer factor (vendor note, applied not measured); planning-session output volume; the
  4-assessments-per-student workload; USD→GBP at 0.79.
- **NOT MEASURABLE and stated as such:** our actual cache-hit ratio, our actual input-token volume, and
  therefore our actual bill. Fix per §A2.

## Follow-ups for the engine lane (not actioned here — this document changed nothing)

1. **Instrument the cache** (§A2). Highest value, ~10 lines, no student impact.
2. **Correct the WML `CLAUDE.md` header** — "Claude Sonnet 4.6" → `claude-sonnet-5`; note the OpenAI `wml`
   fallback bot rather than "GPT-5 fallback".
3. **Consider Haiku 4.5 for the non-marking turns** — planning chat, Socratic pushes, chip handling — keeping
   Sonnet 5 for the marking run. Same vendor, same markers, no transport work. Worth its own costing once the
   cache instrument reports.
