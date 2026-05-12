#!/usr/bin/env node
/**
 * qbank-modern-text-md-to-tiptap.js
 *
 * Parses AQA Modern Text 20-Most-Likely-Questions markdown into WML crib JSON.
 *
 * Source shape (May 2026 model-answers update):
 *   # AQA GCSE English Literature — *Text* — 20 Most Likely Questions
 *   ## How this list was generated
 *   ## Priority order — rehearse in this order
 *   ## How to use this document
 *   ## Pedagogical depth — three non-negotiables for HIGH-confidence picks
 *   ## The seven-sentence body paragraph shape
 *   ## Memorise these once
 *   ## CHARACTER QUESTIONS (ordered most-likely to come up)
 *   ## C1 — Title [confidence note]
 *   > blockquote question stem
 *   **Frame.** ... paragraph ...
 *   **Pedagogical depth to thread.** ... (optional)
 *   **Technique gloss:** bullets
 *   ### INTRODUCTION ...
 *   ### BODY PARAGRAPH 1 ...
 *   ### BODY PARAGRAPH 2 ...
 *   ### BODY PARAGRAPH 3 ...
 *   ### CONCLUSION ...
 *   ## C2 ...
 *   ## THEME QUESTIONS (ordered most-likely to come up)
 *   ## T1 — Title ...
 *
 * Output shape: html field consumed by REST seed-on-mount + TipTap setContent.
 * Structure:
 *   section-header  "How to use this guide"
 *   notice          "How to use this guide" (full preamble content)
 *   section-header  "Top 10 Character Questions"
 *   divider         "C1 — Title"
 *   question        "C1 — Question + Frame + Technique gloss"
 *   plan            "C1 — Skeleton Plan"
 *   response        "C1 — Your Response"
 *   ... (×10 character) ...
 *   section-header  "Top 10 Theme Questions"
 *   ... (×10 theme) ...
 *
 * Usage:
 *   node tools/qbank-modern-text-md-to-tiptap.js \
 *     "<path-to-X-10-Most-Likely-Questions.md>" \
 *     tools/output/<slug>-crib.json
 */

const fs = require('fs');
const path = require('path');

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function richText(str) {
    if (!str) return '';
    let s = escapeHTML(str);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    return s;
}

function sectionHTML(type, label, editable, innerHTML) {
    const ro = editable === false ? ' data-readonly="true"' : '';
    const roClass = editable === false ? ' swml-section-readonly' : '';
    return `<div data-section-type="${type}" data-section-label="${escapeHTML(label)}" data-editable="${editable !== false}"${ro} class="swml-section-block swml-section-${type}${roClass}">${innerHTML}</div>`;
}

const dividerHTML       = (l)    => sectionHTML('divider', l, false, `<p>${escapeHTML(l)}</p>`);
const sectionHeaderHTML = (l, b) => sectionHTML('section-header', l, false, b);
const noticeHTML        = (l, b) => sectionHTML('notice', l, false, b);
const questionHTML      = (l, b) => sectionHTML('question', l, false, b);
const planHTML          = (l, b) => sectionHTML('plan', l, true, b);
const responseHTML      = (l)    => sectionHTML('response', l, true, '<p></p>');

// Coalesce consecutive `> ...` lines into one <blockquote>. Bullets become <p>•...</p>
// to match existing crib markup convention. Bare `>` separator lines drop silently.
function mdLinesToHTML(lines) {
    let html = '';
    let bqBuffer = [];
    const flushBq = () => {
        if (bqBuffer.length === 0) return;
        html += '<blockquote>' + bqBuffer.map(p => `<p>${p}</p>`).join('') + '</blockquote>';
        bqBuffer = [];
    };
    for (const raw of lines) {
        const line = raw.replace(/\s+$/, '');
        const trimmed = line.trim();
        if (!trimmed) { flushBq(); continue; }
        if (trimmed === '>') continue;
        if (trimmed.startsWith('> ')) {
            bqBuffer.push(richText(trimmed.slice(2)));
            continue;
        }
        flushBq();
        if (/^---+$/.test(trimmed)) continue;
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            html += `<p>• ${richText(trimmed.slice(2))}</p>`;
        } else if (trimmed.startsWith('#### ')) {
            html += `<h4>${richText(trimmed.slice(5))}</h4>`;
        } else if (trimmed.startsWith('### ')) {
            html += `<h3>${richText(trimmed.slice(4))}</h3>`;
        } else if (trimmed.startsWith('## ')) {
            html += `<h2>${richText(trimmed.slice(3))}</h2>`;
        } else if (trimmed.startsWith('# ')) {
            html += `<h1>${richText(trimmed.slice(2))}</h1>`;
        } else {
            html += `<p>${richText(trimmed)}</p>`;
        }
    }
    flushBq();
    return html;
}

// Strip the trailing confidence-note bracket from a Q title — "Title [HIGH ...]" → "Title".
function stripConfidenceNote(title) {
    return title.replace(/\s*\[[^\]]*\]\s*$/, '').trim();
}

// Parse the full document into preamble + 2 sections (character / theme), each with 10 Qs.
function parseDoc(md) {
    // Find super-section headers
    const charHeaderRe = /^##\s+CHARACTER QUESTIONS\b/m;
    const themeHeaderRe = /^##\s+THEME QUESTIONS\b/m;
    const cm = md.match(charHeaderRe);
    const tm = md.match(themeHeaderRe);
    if (!cm) throw new Error('No "## CHARACTER QUESTIONS" header found.');
    if (!tm) throw new Error('No "## THEME QUESTIONS" header found.');
    const charStart = cm.index;
    const themeStart = tm.index;
    if (themeStart < charStart) throw new Error('Theme header precedes Character header — unsupported order.');

    const preambleMd = md.slice(0, charStart).trim();
    const charMd = md.slice(charStart, themeStart).trim();
    const themeMd = md.slice(themeStart).trim();

    return { preambleMd, charMd, themeMd };
}

// Split a Q-section (character or theme) into individual Q blocks. Prefix is 'C' or 'T'.
function splitQuestions(sectionMd, prefix) {
    const re = new RegExp(`^##\\s+${prefix}(\\d+)\\s+—\\s+(.+)$`, 'gm');
    const positions = [];
    let m;
    while ((m = re.exec(sectionMd)) !== null) {
        positions.push({ idx: m.index, qNum: parseInt(m[1], 10), title: stripConfidenceNote(m[2]) });
    }
    return positions.map((pos, i) => {
        const nextIdx = positions[i + 1] ? positions[i + 1].idx : sectionMd.length;
        const block = sectionMd.slice(pos.idx, nextIdx);
        return { qNum: pos.qNum, title: pos.title, block, prefix };
    });
}

// Parse a single Q block into question/plan buckets.
// Question bucket = blockquote stem + Frame + Pedagogical depth (optional) + Technique gloss.
// Plan bucket = INTRODUCTION + BODY PARAGRAPH 1/2/3 + CONCLUSION sections.
function parseQuestionBlock(block) {
    const lines = block.split('\n');
    // Strip the leading `## C1 — Title ...` line — already captured.
    const body = [];
    let dropped = false;
    for (const ln of lines) {
        if (!dropped && /^##\s+[CT]\d+\s+—/.test(ln)) { dropped = true; continue; }
        body.push(ln);
    }

    // Plan starts at the first `### INTRODUCTION` (allowing for prefix like "###  INTRODUCTION...").
    let planStartIdx = -1;
    for (let i = 0; i < body.length; i++) {
        if (/^###\s+INTRODUCTION\b/i.test(body[i])) { planStartIdx = i; break; }
    }
    if (planStartIdx === -1) {
        throw new Error('No "### INTRODUCTION" found inside Q block.');
    }

    let questionLines = body.slice(0, planStartIdx);
    let planLines = body.slice(planStartIdx);

    // Trim trailing/leading `---` separators + whitespace from both buckets.
    const trimEdges = arr => {
        while (arr.length && (arr[0].trim() === '' || /^---+$/.test(arr[0].trim()))) arr.shift();
        while (arr.length && (arr[arr.length - 1].trim() === '' || /^---+$/.test(arr[arr.length - 1].trim()))) arr.pop();
        return arr;
    };
    questionLines = trimEdges(questionLines);
    planLines = trimEdges(planLines);

    return { questionLines, planLines };
}

function buildSuperGroupHeader(title, descriptionHTML) {
    let inner = `<h2>${escapeHTML(title)}</h2>`;
    if (descriptionHTML) inner += descriptionHTML;
    return sectionHeaderHTML(title, inner);
}

function buildPreambleHTML(preambleMd) {
    // Whole preamble (lines from doc start to "## CHARACTER QUESTIONS") becomes
    // ONE section-header banner. The section-header retains all h1/h2/p structure
    // so students can read everything inside. No separate notice block — section-
    // header is the visible preamble in exam_crib canvas mode (notice is CSS-
    // hidden in exam_crib; section-header is the visible super-group banner that
    // doubles as the preamble carrier).
    const lines = preambleMd.split('\n');
    const innerHTML = mdLinesToHTML(lines);
    return sectionHeaderHTML('How to use this guide', innerHTML);
}

function buildQuestionTripletHTML(parsed) {
    const labelStem = `${parsed.prefix}${parsed.qNum} — ${parsed.title}`;
    let html = '';
    html += dividerHTML(labelStem);

    // Question bundle inner — h3 Question for the blockquote, h3 Frame for the frame para, etc.
    // We let the structural markers inside the source (e.g. **Frame.**, **Technique gloss:**)
    // pass through mdLinesToHTML; just wrap the whole bundle in a single readonly question block.
    const qInner = mdLinesToHTML(parsed.questionLines);
    html += questionHTML(`${parsed.prefix}${parsed.qNum} — Question + Frame + Technique Gloss`,
        `<h3>Question</h3>${qInner}`);

    // Plan
    const planInner = mdLinesToHTML(parsed.planLines);
    html += planHTML(`${parsed.prefix}${parsed.qNum} — Skeleton Plan`, planInner);

    // Empty response
    html += responseHTML(`${parsed.prefix}${parsed.qNum} — Your Response`);

    return html;
}

function buildSectionGroup(title, descriptionHTML, qBlocks) {
    let html = '';
    html += buildSuperGroupHeader(title, descriptionHTML);
    for (const q of qBlocks) {
        const parsed = parseQuestionBlock(q.block);
        parsed.qNum = q.qNum;
        parsed.title = q.title;
        parsed.prefix = q.prefix;
        html += buildQuestionTripletHTML(parsed);
    }
    return html;
}

function main() {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3];
    if (!inputPath) {
        console.error('Usage: node tools/qbank-modern-text-md-to-tiptap.js <input.md> <output.json>');
        process.exit(1);
    }
    const absPath = path.resolve(inputPath);
    if (!fs.existsSync(absPath)) {
        console.error(`File not found: ${absPath}`);
        process.exit(1);
    }
    const md = fs.readFileSync(absPath, 'utf8');
    const { preambleMd, charMd, themeMd } = parseDoc(md);

    const charQs = splitQuestions(charMd, 'C');
    const themeQs = splitQuestions(themeMd, 'T');
    if (charQs.length !== 10) {
        console.error(`WARN: expected 10 character Qs, got ${charQs.length}`);
    }
    if (themeQs.length !== 10) {
        console.error(`WARN: expected 10 theme Qs, got ${themeQs.length}`);
    }

    let html = '';
    html += buildPreambleHTML(preambleMd);

    // CHARACTER super-group first (source order)
    html += buildSectionGroup(
        'Top 10 Character Questions',
        '<p>Most likely AQA Modern Text character questions, ordered by examiner-prediction confidence. Each carries one ready-to-rehearse plan with seven-sentence body paragraphs and an empty response area to draft against.</p>',
        charQs
    );

    // THEME super-group
    html += buildSectionGroup(
        'Top 10 Theme Questions',
        '<p>Most likely AQA Modern Text theme questions, ordered by examiner-prediction confidence. Identical scaffolding to the character set — every plan is yours to memorise, redraft, and write against.</p>',
        themeQs
    );

    // Optional Tutor Sign-off block — kept at the bottom of every crib so a tutor can
    // mark the work as reviewed. No score/self-assess/analytics/action-plan tail
    // (per Neil 2026-05-12 — exam_crib does not need the assessment-flow footer).
    html += sectionHTML(
        'signoff',
        'Tutor Sign-off (optional)',
        false,
        '<h3>Tutor Sign-off (optional)</h3>'
        + '<p><em>Status: NOT STARTED</em></p>'
        + '<p><em>This block is optional. A tutor can sign here to confirm the student has rehearsed the plans in this crib.</em></p>'
    );

    const filename = path.basename(absPath, '.md');
    const textSlug = filename
        .replace(/-10-Most-Likely-Questions$/i, '')
        .replace(/-20-Most-Likely-Questions$/i, '')
        .toLowerCase();

    const out = {
        source_file: filename + '.md',
        text_slug: textSlug,
        question_count: charQs.length + themeQs.length,
        character_count: charQs.length,
        theme_count: themeQs.length,
        generated_at: new Date().toISOString(),
        html,
    };

    if (outputPath) {
        fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));
        console.error(`Wrote ${outputPath} (${html.length} chars HTML, ${charQs.length}C+${themeQs.length}T = ${charQs.length + themeQs.length} questions).`);
    } else {
        console.log(JSON.stringify(out, null, 2));
    }
}

main();
