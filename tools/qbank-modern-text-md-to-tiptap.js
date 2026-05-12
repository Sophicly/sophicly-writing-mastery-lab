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

// Parse a markdown table starting at lines[i]. Returns { html, consumed } where
// consumed is the count of lines covered (header + separator + N body rows).
// TipTap StarterKit has no Table extension, so we render table rows as rich
// paragraphs instead: each body row becomes one paragraph headed by a bold
// label (cells joined into a structured "label — value (modifier): rest" form).
// The priority-order tables in the AQA Modern Text preamble follow the shape
// `| C1 | **The Inspector** | HIGH | Core character + ... |` which the row
// formatter renders as `<p><strong>C1 — The Inspector (HIGH)</strong>: Core ...</p>`.
function parseMarkdownTable(lines, i) {
    const isTableRow = ln => /^\s*\|.*\|\s*$/.test(ln);
    const isAlignRow = ln => /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(ln);
    if (!isTableRow(lines[i])) return null;
    if (i + 1 >= lines.length || !isAlignRow(lines[i + 1])) return null;
    const splitRow = ln => ln.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    let consumed = 2;
    const body = [];
    let j = i + 2;
    while (j < lines.length && isTableRow(lines[j])) {
        body.push(splitRow(lines[j]));
        consumed++;
        j++;
    }
    let html = '';
    for (const row of body) {
        // Strip surrounding bold from any cell — already-bold cells get a single
        // <strong> wrap on the composite label.
        const clean = row.map(c => c.replace(/^\*\*(.+)\*\*$/, '$1'));
        if (clean.length >= 4) {
            // Priority-order shape: Section | Name | Confidence | Why
            const label = clean[0] + ' — ' + clean[1] + ' (' + clean[2] + ')';
            html += '<p><strong>' + richText(label) + '</strong>: ' + richText(clean.slice(3).join(' — ')) + '</p>';
        } else if (clean.length === 3) {
            const label = clean[0] + ' — ' + clean[1];
            html += '<p><strong>' + richText(label) + '</strong>: ' + richText(clean[2]) + '</p>';
        } else if (clean.length === 2) {
            html += '<p><strong>' + richText(clean[0]) + '</strong>: ' + richText(clean[1]) + '</p>';
        } else {
            html += '<p>' + richText(clean.join(' — ')) + '</p>';
        }
    }
    return { html, consumed };
}

// Coalesce consecutive `> ...` lines into one <blockquote>. Bullets become <p>•...</p>
// to match existing crib markup convention. Bare `>` separator lines drop silently.
// v7.19.131: also detects pipe tables (header row + `|---|---|` align row + body rows)
// and emits real <table> markup so the priority-order tables in the AQA Modern Text
// preamble render as tables instead of literal `| Section | ... |` text.
function mdLinesToHTML(lines) {
    let html = '';
    let bqBuffer = [];
    const flushBq = () => {
        if (bqBuffer.length === 0) return;
        html += '<blockquote>' + bqBuffer.map(p => `<p>${p}</p>`).join('') + '</blockquote>';
        bqBuffer = [];
    };
    let i = 0;
    while (i < lines.length) {
        const raw = lines[i];
        const line = raw.replace(/\s+$/, '');
        const trimmed = line.trim();
        if (!trimmed) { flushBq(); i++; continue; }
        if (trimmed === '>') { i++; continue; }
        if (trimmed.startsWith('> ')) {
            bqBuffer.push(richText(trimmed.slice(2)));
            i++;
            continue;
        }
        flushBq();
        if (/^---+$/.test(trimmed)) { i++; continue; }
        // Markdown table — pipe row followed by alignment row.
        const tbl = parseMarkdownTable(lines, i);
        if (tbl) {
            html += tbl.html;
            i += tbl.consumed;
            continue;
        }
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
        i++;
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

// Split the preamble markdown into discrete chunks keyed by their h2 headings.
// Returns an array of { label, lines } where label is the h2 heading text and
// lines are the markdown lines underneath (until the next h2 or end).
// The first chunk (before the first h2) keeps the document title + label info.
function splitPreambleByH2(preambleMd) {
    const lines = preambleMd.split('\n');
    const chunks = [];
    let current = { label: 'Overview', lines: [] };
    for (const ln of lines) {
        const m = ln.match(/^##\s+(.+?)\s*$/);
        if (m) {
            if (current.lines.length > 0) chunks.push(current);
            current = { label: m[1].trim(), lines: [] };
        } else {
            current.lines.push(ln);
        }
    }
    if (current.lines.length > 0) chunks.push(current);
    return chunks;
}

function buildPreambleHTML(preambleMd) {
    // Preamble structure: a super-group section-header banner ("How to use this
    // guide") followed by one notice block per logical chunk of the original
    // preamble (How list was generated / Priority order / How to use / Pedagogical
    // depth / 7-sent body paragraph shape / Memorise these once). Each notice is
    // visible in exam_crib mode (CSS override for .swml-canvas-inline-coaching)
    // so the full preamble renders directly in canvas. The super-group banner
    // gives the TOC a single "How to use this guide" chevron entry.
    let html = '';
    html += sectionHeaderHTML('How to use this guide',
        '<h2>How to use this guide</h2>'
        + '<p>Read the briefing notes below before drilling the plans. They explain how the question list was generated, which characters and themes to rehearse first, what the seven-sentence body paragraph shape looks like, the three pedagogical depths Sophia threads into every Grade-9 answer, and the universal terminology you must memorise.</p>');

    const chunks = splitPreambleByH2(preambleMd);
    for (const chunk of chunks) {
        const inner = '<h2>' + escapeHTML(chunk.label) + '</h2>' + mdLinesToHTML(chunk.lines);
        html += noticeHTML(chunk.label, inner);
    }
    return html;
}

// Split plan lines into 5 chunks at each `### ` heading (INTRODUCTION / BODY
// PARAGRAPH 1 / BODY PARAGRAPH 2 / BODY PARAGRAPH 3 / CONCLUSION). Returns an
// array of { label, lines } where label is normalised for display.
function splitPlanByH3(planLines) {
    const chunks = [];
    let current = null;
    for (const ln of planLines) {
        const m = ln.match(/^###\s+(.+?)\s*$/);
        if (m) {
            if (current) chunks.push(current);
            current = { rawLabel: m[1].trim(), lines: [] };
        } else if (current) {
            current.lines.push(ln);
        }
    }
    if (current) chunks.push(current);
    // Normalise display labels — strip the parenthetical word-count.
    for (const c of chunks) {
        c.label = c.rawLabel
            .replace(/\s*\(.*?\)\s*$/, '')
            .replace(/^INTRODUCTION$/i, 'Introduction')
            .replace(/^BODY PARAGRAPH (\d)$/i, 'Body Paragraph $1')
            .replace(/^BODY PARAGRAPH (\d)\s+—.*$/i, 'Body Paragraph $1')
            .replace(/^CONCLUSION$/i, 'Conclusion');
        // Preserve any "— Act 1: theatrical dominance" sub-title in a stored field.
        const sub = c.rawLabel.match(/^BODY PARAGRAPH \d\s+—\s+(.*?)\s*(?:\(.*\))?$/i);
        if (sub) c.subtitle = sub[1].trim();
    }
    return chunks;
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

    // Plan — split into 5 sub-sections (Introduction / BP1 / BP2 / BP3 / Conclusion).
    // Per Neil 2026-05-12: one monolithic plan block with all elements bullet-ed
    // together reads as visually confusing to teenagers. Splitting into the five
    // canonical paragraph blocks groups the elements where they belong.
    const planChunks = splitPlanByH3(parsed.planLines);
    for (const chunk of planChunks) {
        const label = `${parsed.prefix}${parsed.qNum} — ${chunk.label}`;
        const headerHTML = '<h3>' + escapeHTML(chunk.label)
            + (chunk.subtitle ? ' — ' + escapeHTML(chunk.subtitle) : '')
            + '</h3>';
        const inner = headerHTML + mdLinesToHTML(chunk.lines);
        html += planHTML(label, inner);
    }

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
        // template_version drives the canvas-load auto-migration path in
        // class-rest-api.php:1568-1593. Saved canvases stamped with a lower
        // _template_version get re-seeded (student response edits preserved
        // via merge_student_responses_into_template). Bump when the template
        // shape changes meaningfully (section structure, preamble layout etc.).
        // 2026-05-12 v3 — preamble now multiple notice blocks (visible in
        // exam_crib via CSS override) + per-Q plan split into 5 sub-sections
        // (Intro / BP1 / BP2 / BP3 / Conclusion) instead of one monolith.
        // 2026-05-12 v4 — markdown tables in preamble (Priority order, etc.)
        // now render as rich paragraph rows instead of literal `| ... |` text
        // (TipTap StarterKit has no Table extension so real <table> markup is
        // stripped on setContent).
        template_version: 4,
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
