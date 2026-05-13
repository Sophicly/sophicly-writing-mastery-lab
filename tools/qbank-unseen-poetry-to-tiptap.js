#!/usr/bin/env node
/**
 * qbank-unseen-poetry-to-tiptap.js (v7.19.158)
 *
 * Custom generator for the AQA English Literature Paper 2 Section C (Unseen Poetry)
 * 10 Most Likely Questions crib. Source MD ships each top-level `## Q{N}` block
 * with TWO sub-questions:
 *   Q27.1 — 24 marks, single-poem analysis, 5-paragraph plan
 *     (Intro / BP1 / BP2 / BP3 / Conclusion — all `**bold**` headers, not `### h3`)
 *   Q27.2 — 8 marks, method comparison to printed Poem B, 2-paragraph plan
 *     (Paragraph 1 + Paragraph 2)
 *
 * Output crib has 10 top-level Qs, each emitting:
 *   - divider "Q{N} — {title}"
 *   - question "Q{N}.1 — Question + Anchor Poem A + Frame" (readonly bundle)
 *   - 5 plan sections "Q{N}.1 — Plan: Introduction / Body Paragraph 1-3 / Conclusion"
 *   - response "Q{N}.1 — Your Response"
 *   - question "Q{N}.2 — Question + Anchor Poem B" (readonly bundle)
 *   - 2 plan sections "Q{N}.2 — Plan: Paragraph 1 / Paragraph 2"
 *   - response "Q{N}.2 — Your Response"
 *
 * Plan section bullets follow the v7.19.155 shape: plain inline element labels
 * (Hook / Topic / Tech+Ev / Close analysis / Effect / Author's purpose / Context),
 * no <strong> wrapping, no <h3> inside the plan section. migrateInputFields +
 * consolidateCribPlanInputFields then collapse each plan section's bullets into
 * ONE input field per paragraph at render time.
 *
 * Usage:
 *   node tools/qbank-unseen-poetry-to-tiptap.js <input.md> <output.json>
 */

const fs = require('fs');
const path = require('path');

// ─── Helpers (mirror qbank-md-to-tiptap.js conventions) ───────────────────

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
    return sectionHTML('response', label, true, '<p></p>');
}

function mdLinesToHTML(lines) {
    let html = '';
    let bqBuffer = [];
    const flushBq = () => {
        if (bqBuffer.length === 0) return;
        html += '<blockquote>' + bqBuffer.map(p => `<p>${p}</p>`).join('') + '</blockquote>';
        bqBuffer = [];
    };
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) { flushBq(); continue; }
        if (trimmed === '>') continue;
        if (trimmed.startsWith('> ')) {
            bqBuffer.push(richText(trimmed.slice(2)));
            continue;
        }
        flushBq();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            html += `<p>• ${richText(trimmed.slice(2))}</p>`;
            continue;
        }
        // Numbered list items (1. ... / 2. ... / 7. ...)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
        if (numMatch) {
            html += `<p>• ${richText(numMatch[2])}</p>`;
            continue;
        }
        // Plain paragraph
        html += `<p>${richText(trimmed)}</p>`;
    }
    flushBq();
    return html;
}

// ─── Parser ───────────────────────────────────────────────────────────────

/**
 * Split source MD into preamble + 10 question blocks.
 */
function splitDoc(md) {
    const lines = md.split('\n');
    const preambleLines = [];
    const qBlocks = [];
    let current = null;
    let inPreamble = true;
    for (const line of lines) {
        const qMatch = line.match(/^## Q(\d+)\s+—\s+(.+?)\s*$/);
        if (qMatch) {
            if (current) qBlocks.push(current);
            current = { qNum: parseInt(qMatch[1], 10), title: qMatch[2].trim(), lines: [line] };
            inPreamble = false;
            continue;
        }
        if (inPreamble) {
            preambleLines.push(line);
        } else if (current) {
            current.lines.push(line);
        }
    }
    if (current) qBlocks.push(current);
    return { preambleMd: preambleLines.join('\n'), qBlocks };
}

/**
 * Parse one Q block into Q27.1 + Q27.2 components.
 */
function parseQuestionBlock(block) {
    // Split at the `### Q27.2` boundary.
    const splitIdx = block.lines.findIndex(l => /^### Q27\.2/.test(l));
    const q1Lines = splitIdx === -1 ? block.lines : block.lines.slice(0, splitIdx);
    const q2Lines = splitIdx === -1 ? [] : block.lines.slice(splitIdx);

    const q1 = parseSubQ(q1Lines, 'Q27.1');
    const q2 = parseSubQ(q2Lines, 'Q27.2');

    return { qNum: block.qNum, title: block.title, q1, q2 };
}

/**
 * Parse a sub-Q's lines into stem (blockquote), anchor poem, frame, and plan chunks.
 *
 * Plan markers:
 *   `**Q27.1 Grade-9 worked plan**` or `**Q27.2 Grade-9 worked plan ...**` — start
 *   `**INTRODUCTION (...)**`  → Introduction chunk
 *   `**BP1 — ...**`           → Body Paragraph 1
 *   `**BP2 — ...**`           → Body Paragraph 2
 *   `**BP3 — ...**`           → Body Paragraph 3
 *   `**CONCLUSION (...)**`    → Conclusion chunk
 *   `**Paragraph 1 — ...**`   → Paragraph 1 (Q27.2 only)
 *   `**Paragraph 2 — ...**`   → Paragraph 2 (Q27.2 only)
 */
function parseSubQ(lines, kind) {
    if (lines.length === 0) return null;
    // Locate where the plan starts.
    const planStartIdx = lines.findIndex(l => /^\*\*Q27\.\d+ Grade-9 worked plan/.test(l));
    const headerLines = planStartIdx === -1 ? lines : lines.slice(0, planStartIdx);
    const planLines = planStartIdx === -1 ? [] : lines.slice(planStartIdx + 1);

    // header section contains: Q stem (blockquote w/ marks), anchor poem heading + blockquote, frame.
    // For Q27.1, lines[0] is `## Q1 — title` (skip).
    // For Q27.2, lines[0] is `### Q27.2 — title` (skip).
    const skipLeadHeader = headerLines[0] && (/^##\s|^###\s/).test(headerLines[0]) ? 1 : 0;
    const headerBodyLines = headerLines.slice(skipLeadHeader);

    // Split plan into chunks at each `**HEADER**` line.
    const chunks = parsePlanChunks(planLines, kind);

    return {
        kind,
        headerHtml: mdLinesToHTML(headerBodyLines),
        planChunks: chunks,
    };
}

function parsePlanChunks(planLines, kind) {
    const chunks = [];
    let current = null;
    const headerRe = /^\*\*(INTRODUCTION|BP\d|BP[1-3]\s*—.*|CONCLUSION|Paragraph\s+\d+\s*—.*|Paragraph\s+\d+)(\s*\([^)]*\))?\s*:?\*\*\s*$/i;
    for (const line of planLines) {
        const m = line.match(headerRe);
        if (m) {
            if (current) chunks.push(current);
            current = { rawLabel: m[1].trim(), lines: [] };
            continue;
        }
        if (current) current.lines.push(line);
    }
    if (current) chunks.push(current);
    // Normalise display labels.
    for (const c of chunks) {
        c.label = normalisePlanLabel(c.rawLabel, kind);
    }
    return chunks;
}

function normalisePlanLabel(raw, kind) {
    const r = raw.trim();
    if (/^INTRODUCTION/i.test(r)) return 'Introduction';
    if (/^CONCLUSION/i.test(r)) return 'Conclusion';
    let bp = r.match(/^BP\s*(\d)/i);
    if (bp) return `Body Paragraph ${bp[1]}`;
    let p = r.match(/^Paragraph\s+(\d)/i);
    if (p) return `Paragraph ${p[1]}`;
    return r.replace(/\s*—.*$/, '');
}

// ─── Builders ─────────────────────────────────────────────────────────────

function buildPreambleHTML(preambleMd) {
    // Single consolidated notice block — entire preamble in one readonly section.
    // (Earlier version split on blank lines → 14+ tiny notices. Worse UX.)
    const inner = mdLinesToHTML(preambleMd.split('\n'));
    if (!inner) return '';
    return noticeHTML('How to use this guide (Unseen Poetry)', inner);
}

function buildQuestionTriplet(q) {
    let html = '';
    html += dividerHTML(`Q${q.qNum} — ${q.title}`);

    // Q27.1 bundle: Q stem + Anchor poem A + frame.
    if (q.q1) {
        html += questionHTML(`Q${q.qNum}.1 — Question + Anchor Poem A + Frame`, q.q1.headerHtml);
        q.q1.planChunks.forEach(chunk => {
            const label = `Q${q.qNum}.1 — Plan: ${chunk.label}`;
            // Strip <strong> from bullet element labels (Hook / Topic / etc.) → plain inline text
            let inner = mdLinesToHTML(chunk.lines);
            inner = inner.replace(/<strong>(.*?)<\/strong>/gs, '$1');
            html += planHTML(label, inner);
        });
        html += responseHTML(`Q${q.qNum}.1 — Your Response (24 marks, ~600 words)`);
    }

    // Q27.2 bundle: sub-Q stem + Anchor poem B.
    if (q.q2) {
        html += questionHTML(`Q${q.qNum}.2 — Question + Anchor Poem B`, q.q2.headerHtml);
        q.q2.planChunks.forEach(chunk => {
            const label = `Q${q.qNum}.2 — Plan: ${chunk.label}`;
            let inner = mdLinesToHTML(chunk.lines);
            inner = inner.replace(/<strong>(.*?)<\/strong>/gs, '$1');
            html += planHTML(label, inner);
        });
        html += responseHTML(`Q${q.qNum}.2 — Your Response (8 marks, ~250 words)`);
    }

    return html;
}

// ─── Main ─────────────────────────────────────────────────────────────────

function main() {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3];
    if (!inputPath || !outputPath) {
        console.error('Usage: node tools/qbank-unseen-poetry-to-tiptap.js <input.md> <output.json>');
        process.exit(1);
    }
    const absPath = path.resolve(inputPath);
    if (!fs.existsSync(absPath)) {
        console.error(`File not found: ${absPath}`);
        process.exit(1);
    }
    const md = fs.readFileSync(absPath, 'utf8');
    const { preambleMd, qBlocks } = splitDoc(md);
    if (qBlocks.length !== 10) {
        console.error(`WARN: expected 10 Q blocks, got ${qBlocks.length}`);
    }

    let html = '';
    html += buildPreambleHTML(preambleMd);
    qBlocks.forEach(block => {
        const parsed = parseQuestionBlock(block);
        html += buildQuestionTriplet(parsed);
    });

    const filename = path.basename(absPath, '.md');
    const textSlug = filename.replace(/-10-Most-Likely-Questions$/i, '').toLowerCase();

    const out = {
        source_file: filename + '.md',
        text_slug: textSlug,
        // template_version 8 matches the 19C/Sh generator (universal plan-section shape).
        template_version: 8,
        question_count: qBlocks.length,
        // Each Q produces 5 + 2 = 7 plan sections (Q27.1 5-para + Q27.2 2-para).
        sub_question_shape: 'Q27.1 (24m, 5-para) + Q27.2 (8m, 2-para)',
        generated_at: new Date().toISOString(),
        html,
    };

    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));
    console.error(`Wrote ${outputPath} (${html.length} chars HTML, ${qBlocks.length} top-level Qs, each with Q27.1 + Q27.2).`);
}

main();
