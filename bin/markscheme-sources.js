#!/usr/bin/env node
/* eslint-env node */
/**
 * markscheme-sources.js — THE ONE REGISTRY of mark-scheme sections that become examiner-ladder data.
 *
 * Shared by bin/build-markscheme-dataset.js (which parses) and bin/markscheme-gate.js (which
 * re-reads the raw source independently and diffs). They share the LIST of sources on purpose —
 * a gate that guards one of two sources guards nothing
 * ([[reference_a_gate_guarding_one_of_two_sources_guards_nothing]]) — but never the parser.
 *
 * Adding a paper is a DATA job (PEDAGOGY §33.5): one row here + the board's verbatim descriptors in
 * the named source file, in the shape the builder documents. No JS elsewhere changes.
 *
 * Row shape:
 *   key     — the WML_MARK_SCHEMES key the walk opens (`board_paper_question_ao`)
 *   source  — the ONE markdown file (relative to the repo root) holding the board's verbatim text
 *   header  — RegExp matching that section's `## …` header line; group 1 = title, group 2 = max marks
 *   board / paper / question / ao — labels carried into the dataset
 *   banded  — true where the board prints Upper/Lower sub-levels with their own descriptor sets
 *             (AQA AO5). Everything else is flat bullets per level.
 */
'use strict';

const L1 = 'protocols/aqa/language1/modules/knowledge-mark-scheme-lang1.md';
const L2 = 'protocols/aqa/language2/modules/knowledge-mark-scheme-lang2.md';
const US = 'protocols/aqa/unseen/modules/knowledge-mark-scheme-unseen.md';

const SOURCES = [
    // ── AQA Language Paper 1 (8700/1) ────────────────────────────────────────────────────────
    { key: 'aqa_lang1_q2_ao2', source: L1, board: 'aqa', paper: 'language1', question: 'Q2', ao: 'AO2',
      header: /^## QUESTION 2 \((AO2 Language) — (\d+) marks\)[^\n]*$/m, banded: false },
    { key: 'aqa_lang1_q3_ao2', source: L1, board: 'aqa', paper: 'language1', question: 'Q3', ao: 'AO2',
      header: /^## QUESTION 3 \((AO2 Structure) — (\d+) marks\)[^\n]*$/m, banded: false },
    { key: 'aqa_lang1_q4_ao4', source: L1, board: 'aqa', paper: 'language1', question: 'Q4', ao: 'AO4',
      header: /^## QUESTION 4 \((AO4 Evaluation) — (\d+) marks\)[^\n]*$/m, banded: false },
    { key: 'aqa_lang1_q5_ao5', source: L1, board: 'aqa', paper: 'language1', question: 'Q5', ao: 'AO5',
      header: /^## QUESTION 5 — AO5 ([^(]+)\((\d+) marks\)[^\n]*$/m, banded: true },
    { key: 'aqa_lang1_q5_ao6', source: L1, board: 'aqa', paper: 'language1', question: 'Q5', ao: 'AO6',
      header: /^## QUESTION 5 — AO6 ([^(]+)\((\d+) marks\)[^\n]*$/m, banded: false },
    // ── AQA Language Paper 2 (8700/2) ────────────────────────────────────────────────────────
    { key: 'aqa_lang2_q2_ao1', source: L2, board: 'aqa', paper: 'language2', question: 'Q2', ao: 'AO1',
      header: /^## QUESTION 2 \((AO1 Inference across both sources) — (\d+) marks\)[^\n]*$/m, banded: false },
    { key: 'aqa_lang2_q3_ao2', source: L2, board: 'aqa', paper: 'language2', question: 'Q3', ao: 'AO2',
      header: /^## QUESTION 3 \((AO2 Language) — (\d+) marks\)[^\n]*$/m, banded: false },
    { key: 'aqa_lang2_q4_ao3', source: L2, board: 'aqa', paper: 'language2', question: 'Q4', ao: 'AO3',
      header: /^## QUESTION 4 \((AO3 Comparison) — (\d+) marks\)[^\n]*$/m, banded: false },
    { key: 'aqa_lang2_q5_ao5', source: L2, board: 'aqa', paper: 'language2', question: 'Q5', ao: 'AO5',
      header: /^## QUESTION 5 — AO5 ([^(]+)\((\d+) marks\)[^\n]*$/m, banded: true },
    { key: 'aqa_lang2_q5_ao6', source: L2, board: 'aqa', paper: 'language2', question: 'Q5', ao: 'AO6',
      header: /^## QUESTION 5 — AO6 ([^(]+)\((\d+) marks\)[^\n]*$/m, banded: false },
    // ── AQA Literature Paper 2 Section C — unseen poetry (8702/2) ───────────────────────────
    // The board bands Q27.1 on the whole 24 with an AO1 + AO2 strand per level — ONE ladder.
    { key: 'aqa_unseen_q271', source: US, board: 'aqa', paper: 'unseen', question: 'Q27.1', ao: 'AO1 + AO2',
      header: /^## QUESTION 27\.1 — (AO1 \+ AO2 [^(]+?) — ONE six-level ladder[^(]*\((\d+) marks\)[^\n]*$/m, banded: false },
    { key: 'aqa_unseen_q272', source: US, board: 'aqa', paper: 'unseen', question: 'Q27.2', ao: 'AO2',
      header: /^## QUESTION 27\.2 — (AO2 [^(]+?) \((\d+) marks\)[^\n]*$/m, banded: false },
];

module.exports = { SOURCES };
