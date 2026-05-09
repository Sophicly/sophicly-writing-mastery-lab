#!/usr/bin/env node
/**
 * qbank-md-to-tiptap.js
 *
 * Parses Sophicly Exam Prep Question Bank markdown docs into HTML for WML
 * canvas seeding. Output matches the section-HTML format produced by
 * frontend/wml-assessment.js sectionHTML() helper:
 *
 *   <div data-section-type="{type}" data-section-label="{label}"
 *        data-editable="{true|false}" [data-readonly="true"]
 *        class="swml-section-block swml-section-{type}[ swml-section-readonly]">
 *     {innerHTML}
 *   </div>
 *
 * Section types used:
 *   notice    — preamble + glossary blocks (readonly)
 *   divider   — "Q1 — title" anchor breaks (readonly)
 *   question  — Q stem + extract + frame bundle (readonly)
 *   plan      — editable skeleton plan
 *   response  — editable response area
 *
 * Usage:
 *   node tools/qbank-md-to-tiptap.js \
 *     "../Model Answers/Student Resources/Exam Prep Question Banks/Macbeth-10-Most-Likely-Questions.md" \
 *     > tools/output/macbeth-crib.json
 *
 * Output JSON shape:
 *   { html: "...full canvas HTML...", text_slug: "...", question_count: N, ... }
 */

const fs = require('fs');
const path = require('path');

// ─── Helpers ──────────────────────────────────────────────────────────────

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

function dividerHTML(label) {
    return sectionHTML('divider', label, false, `<p>${escapeHTML(label)}</p>`);
}

function noticeHTML(label, innerHTML) {
    return sectionHTML('notice', label, false, innerHTML);
}

function questionHTML(label, innerHTML) {
    return sectionHTML('question', label, false, innerHTML);
}

function planHTML(label, innerHTML) {
    return sectionHTML('plan', label, true, innerHTML);
}

function responseHTML(label) {
    // Empty response area — student types here. TipTap initialises empty.
    return sectionHTML('response', label, true, '<p></p>');
}

// Convert a block of markdown lines to HTML paragraphs (preserves bullets, blockquotes).
function mdLinesToHTML(lines) {
    let html = '';
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('> ')) {
            html += `<blockquote><p>${richText(trimmed.slice(2))}</p></blockquote>`;
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
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
    return html;
}

// ─── Parser ───────────────────────────────────────────────────────────────

function parseQbank(md) {
    // Split top-level on "## Q\d+ — " (questions). Everything before first Q is preamble.
    const qSplitRe = /^## Q(\d+)\s+—\s+(.+)$/gm;
    const positions = [];
    let m;
    while ((m = qSplitRe.exec(md)) !== null) {
        positions.push({ idx: m.index, qNum: parseInt(m[1], 10), title: m[2].trim() });
    }

    if (positions.length === 0) {
        throw new Error('No Q1...QN sections found. Expected "## Q1 — Title" headers.');
    }

    const preambleEnd = positions[0].idx;
    const preambleMd = md.slice(0, preambleEnd);

    // Each Q runs from its position to the next Q's position (or EOF).
    const questions = positions.map((pos, i) => {
        const nextIdx = positions[i + 1] ? positions[i + 1].idx : md.length;
        const block = md.slice(pos.idx, nextIdx);
        return { qNum: pos.qNum, title: pos.title, block };
    });

    return { preambleMd, questions };
}

function parsePreamble(preambleMd) {
    // Preamble has 2 logical sections: doc-intro (before "## Memorise these once") +
    // glossary (after that header up to first "---").
    const memorisePos = preambleMd.search(/^## Memorise these once/m);
    let intro, glossary;
    if (memorisePos === -1) {
        intro = preambleMd;
        glossary = '';
    } else {
        intro = preambleMd.slice(0, memorisePos).trim();
        glossary = preambleMd.slice(memorisePos).trim();
    }
    return { intro, glossary };
}

function parseQuestionBlock(block, qNum, title) {
    // Parse a single Q block into: question_text, typical_extract, frame, skeleton_plan_md.
    // Strategy: find sub-headers "**Question (...)**", "**Typical extract.**", "**Frame.**", "### Skeleton plan".
    const lines = block.split('\n');

    let inSection = 'header'; // 'header' | 'question' | 'extract' | 'frame' | 'plan'
    const buckets = { header: [], question: [], extract: [], frame: [], plan: [] };

    for (const line of lines) {
        if (/^## Q\d+\s+—/.test(line)) { inSection = 'header'; continue; }
        if (/^\*\*Question \(.*\):\*\*/.test(line)) { inSection = 'question'; continue; }
        // v7.19.100: source banks use `**Extract.**` (with optional preamble line);
        // older converter regex expected `**Typical extract.**` which matched no bank.
        if (/^\*\*(Typical extract|Extract|Preamble)\.\*\*/.test(line.trim())) { inSection = 'extract'; continue; }
        if (/^\*\*Frame\.\*\*/.test(line.trim())) { inSection = 'frame'; continue; }
        if (/^### Skeleton plan/.test(line)) { inSection = 'plan'; continue; }
        if (/^---\s*$/.test(line)) continue; // section break, ignore
        buckets[inSection].push(line);
    }

    return {
        qNum,
        title,
        questionLines: buckets.question,
        extractLines: buckets.extract,
        frameLines: buckets.frame,
        planLines: buckets.plan,
    };
}

// ─── Builders ─────────────────────────────────────────────────────────────

function buildPreambleHTML(preambleMd) {
    const { intro, glossary } = parsePreamble(preambleMd);

    let html = '';

    if (intro) {
        const introLines = intro.split('\n');
        html += noticeHTML('How to use this guide', mdLinesToHTML(introLines));
    }

    if (glossary) {
        html += dividerHTML('Memorise these once');
        const glossLines = glossary.split('\n').filter(l => !/^## /.test(l));
        html += noticeHTML('Controlling concept + key glossary', mdLinesToHTML(glossLines));
    }

    return html;
}

function buildQuestionHTML(parsed) {
    let html = '';

    // 1. Divider with anchor — "Q1 — Macbeth as a powerful but troubled character"
    html += dividerHTML(`Q${parsed.qNum} — ${parsed.title}`);

    // 2. Question + extract + frame bundle (readonly notice)
    let bundle = '';
    if (parsed.questionLines.length > 0) {
        bundle += `<h3>Question</h3>`;
        bundle += mdLinesToHTML(parsed.questionLines);
    }
    if (parsed.extractLines.length > 0) {
        bundle += `<h3>Typical Extract</h3>`;
        bundle += mdLinesToHTML(parsed.extractLines);
    }
    if (parsed.frameLines.length > 0) {
        bundle += `<h3>Frame</h3>`;
        bundle += mdLinesToHTML(parsed.frameLines);
    }
    if (bundle) {
        html += questionHTML(`Q${parsed.qNum} — Question + Extract + Frame`, bundle);
    }

    // 3. Skeleton plan (editable)
    if (parsed.planLines.length > 0) {
        const planInner = mdLinesToHTML(parsed.planLines);
        html += planHTML(`Q${parsed.qNum} — Skeleton Plan`, planInner);
    }

    // 4. Response area (editable, empty)
    html += responseHTML(`Q${parsed.qNum} — Your Response`);

    return html;
}

// ─── Main ─────────────────────────────────────────────────────────────────

function main() {
    const inputPath = process.argv[2];
    if (!inputPath) {
        console.error('Usage: node tools/qbank-md-to-tiptap.js <input.md> [output.json]');
        console.error('   Outputs to stdout if no output.json given.');
        process.exit(1);
    }

    const absPath = path.resolve(inputPath);
    if (!fs.existsSync(absPath)) {
        console.error(`File not found: ${absPath}`);
        process.exit(1);
    }

    const md = fs.readFileSync(absPath, 'utf8');
    const { preambleMd, questions } = parseQbank(md);

    let html = '';
    html += buildPreambleHTML(preambleMd);
    questions.forEach(q => {
        const parsed = parseQuestionBlock(q.block, q.qNum, q.title);
        html += buildQuestionHTML(parsed);
    });

    const filename = path.basename(absPath, '.md');
    const textSlug = filename.replace(/-10-Most-Likely-Questions$/i, '').toLowerCase();

    const out = {
        source_file: filename + '.md',
        text_slug: textSlug,
        question_count: questions.length,
        generated_at: new Date().toISOString(),
        html: html,
    };

    const outPath = process.argv[3];
    if (outPath) {
        fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
        console.error(`Wrote ${outPath} (${html.length} chars HTML, ${questions.length} questions).`);
    } else {
        console.log(JSON.stringify(out, null, 2));
    }
}

main();
