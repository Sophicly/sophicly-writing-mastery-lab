<!--
  _seq-source.md — CANONICAL PORT SOURCE for the code-served scripted-sequence player.
  ⚠️ NOT LOADED INTO THE LLM. This file is deliberately ABSENT from manifest.json (the leading
  underscore + omission from the manifest keep it out of every LLM payload). It exists ONLY so
  bin/seq-port-harness.js can prove each SEQUENCES `plain` (frontend/wml-assessment.js) is a
  byte-verbatim port of the teaching text these turns replaced.

  WHY THIS FILE EXISTS (v7.20.252 — the retained-source defect):
  The teaching text used to live inside the manifest-loaded protocol modules (b2/b3/b4/b5) as
  "[AI_INTERNAL — CODE-SERVED SOURCE, do NOT deliver]" blocks. The manifest loads WHOLE .md files
  into the model's context, so the model SAW that teaching and NARRATED it — despite "do NOT
  deliver" — overriding the router gate (the protocol loads last and dominates). The fix: the
  source lives here, out of context, and the loaded modules carry ONLY the @PLAY_SEQ directive.
  LAW: code-served source text must NEVER sit in a manifest-loaded module (see WML CLAUDE.md).

  Edit rule: if a SEQUENCES `plain` changes, update the matching line here so the harness passes.
  The harness checks SUBSTRINGS, so surrounding prose/formatting is free — only the quoted teaching
  strings must stay byte-identical to their SEQUENCES `plain`.
-->

# Code-served teaching — canonical source (harness reference only)

## poetry_b2a_teach — B.2A Step 3, Comparative Focus Confirmation

For poetry comparison, comparison must be **sustained throughout** — never Poem A paragraph then Poem B paragraph. Every body paragraph weaves BOTH poems together. Does this make sense?

Explain-more: Instead of 'In Poem A the poet does X. In Poem B the poet does Y,' you write 'While Poet A employs X to achieve effect 1, Poet B's contrasting Y creates effect 2, revealing…' Every sentence is comparative — showing the examiner you can synthesise both poems, not describe each one separately.

## poetry_b4_teach — B.3 pedagogical note

A quick note on sequence: **we'll plan your three body paragraphs first, then your introduction, then your conclusion.** This seems backwards, but your comparative ideas *should* evolve as you plan. Plan the introduction first and you lock yourself into ideas before you've explored the comparison. Planning bodies first lets you discover your strongest comparative arguments, then craft an introduction that reflects your *developed* thinking — a cohesive whole, not an essay forced to match early guesses.

Explain-more: When you plan body paragraphs, you engage deeply with your anchor quotes from BOTH poems, discover comparative connections, and sharpen your argument. Plan the introduction *after* and you introduce the comparative argument you actually developed — more precise thesis, more cohesive essay.

## poetry_b4_teach — six-quote overview

2 Form quotes (1 per poem) → Body 1 · 2 Structure quotes → Body 2 · 2 Language quotes → Body 3.

## poetry_b4_teach — Why Form, Structure, and Language? (CHUNK 1–4)

CHUNK 1: Before we select your six anchor quotes, let's understand why we organise poetry comparison around **Form, Structure, and Language**. It's a teaching mechanism that makes you compare like with like — how each poet handles the SAME dimension of craft, not a metaphor in one poem against a rhyme scheme in the other.
CHUNK 1 explain-more: Pick random quotes from both poems and you might compare very different things — that isn't meaningful comparison. Form/Structure/Language guarantees you compare each dimension against its match.

CHUNK 2: Poetry analysis works across three distinct dimensions:
• **FORM** — what TYPE of poem it is (sonnet, dramatic monologue, elegy, free verse, ballad…) and the genre conventions each poet uses or subverts.
• **STRUCTURE** — HOW it is built internally (metre, rhyme scheme, enjambment, caesura, stanza arrangement, volta).
• **LANGUAGE** — the WORD-LEVEL choices (imagery, figurative language, diction, sound devices, semantic fields).
Comparing all three reveals the COMPLETE craft of each poet, not isolated features.
CHUNK 2 explain-more: Comparing a sonnet with free verse: Form — why did Poet A choose strict sonnet form while Poet B rejected traditional form? Structure — how does A's iambic pentameter differ in effect from B's irregular rhythm? Language — how do their images and sound devices compare? Each dimension reveals something different.

CHUNK 3: Many students confuse Form and Structure. The distinction is load-bearing:
**FORM = WHAT kind of poem** (sonnet, dramatic monologue, elegy, ode, ballad, free verse, lyric, narrative).
**STRUCTURE = HOW it is built** (iambic pentameter, ABAB rhyme, enjambment, caesura, volta, stanza breaks).
✗ 'The form is iambic pentameter' · ✓ 'The poem is a sonnet; its structure employs iambic pentameter.'
Form is the container; structure is how the container is built.

In your own words — the difference between form and structure?
CHUNK 3 confirm: Exactly. Form is WHAT kind of poem; structure is HOW it's built.

CHUNK 4: Analysing Form, Structure and Language separately and comparatively builds systematic analytical skill and precise terminology — it kills the vague 'the poet uses language effectively' trap. You'll pick two quotes per dimension, one from each poem, for a like-with-like comparison.

## poetry_b5_teach — Why Comparative TTECEA+C? (CHUNK 1–4)

CHUNK 1: You may have been taught PEE, PETL, PEAK at school. Useful starts, but **inherently limited** — they don't cover every mark-scheme criterion, and they don't build in COMPARISON. That's where Comparative TTECEA+C comes in.
CHUNK 1 explain-more: They typically miss Close Analysis, Effects on readers, and Author's Purpose — 3–4 marks a paragraph. And they're built for single-text analysis: they never prompt you to weave comparison throughout. Comparative TTECEA+C fixes both.

CHUNK 2: Comparative TTECEA+C targets EVERY assessable element while sustaining comparison:
- **T**opic = comparative conceptual foundation (what BOTH poets explore, and how differently) — AO1
- **T**echnique = the method carrying each poem's idea — AO2
- **E**vidence = textual proof from BOTH poems — AO1
- **C**lose analysis = micro-examination of a word/sound in EACH quote — AO2
- **E**ffects = reader impact of EACH poem, compared — AO2
- **A**uthor's purpose = why EACH poet chose this — AO1/AO2
- **+C**ontext = the factor DRIVING each poet, compared — AO3
Mark-scheme-complete AND comparison-integrated.
CHUNK 2 explain-more: You won't memorise it — I walk you through each element one question at a time. By the end it feels natural.

CHUNK 3: Crucially, context, concepts and methods aren't separate boxes — they're one system: **Context (AO3) → Concepts (AO1) → Methods (AO2)**. Each poet's context inspires their concepts, which drive their techniques. For comparison this means: **Different contexts → different concepts → different methods → different effects.**
CHUNK 3 explain-more: Poets don't pick techniques at random — they choose methods that best carry their concept, and their world shapes what they want to say. Two poets on the same theme write differently *because* their contexts and concepts differ.

CHUNK 4: Watch the shape once, somewhere else — two war poems, Owen's *Exposure* and Hughes's *Bayonet Charge*. Same subject, opposite craft: Owen's lyric form makes suffering feel collective; Hughes's fragmented narrative makes it feel like sudden, isolating chaos. Same theme, different form → different concept → different effect. That's the comparative move you'll make on your own two poems.
