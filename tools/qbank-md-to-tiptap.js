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

// v7.19.153: split plan lines into 5 chunks at each `### ` heading (INTRODUCTION /
// BODY PARAGRAPH 1/2/3 / CONCLUSION). Returns array of { label, lines } where
// label is normalised for display (parenthetical word-counts stripped).
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
    for (const c of chunks) {
        c.label = c.rawLabel
            .replace(/\s*\(.*?\)\s*$/, '')
            .replace(/^INTRODUCTION$/i, 'Introduction')
            .replace(/^BODY PARAGRAPH (\d)$/i, 'Body Paragraph $1')
            .replace(/^BODY PARAGRAPH (\d)\s+—.*$/i, 'Body Paragraph $1')
            .replace(/^CONCLUSION$/i, 'Conclusion');
    }
    return chunks;
}

function planHTML(label, innerHTML) {
    return sectionHTML('plan', label, true, innerHTML);
}

function responseHTML(label) {
    // Empty response area — student types here. TipTap initialises empty.
    return sectionHTML('response', label, true, '<p></p>');
}

// Convert a block of markdown lines to HTML paragraphs (preserves bullets, blockquotes).
// v7.19.101: Skip bare `>` separator lines (they emit as empty blockquotes — visible
// as stray arrows in the rendered canvas). Coalesce consecutive blockquote lines
// into a single <blockquote> with one <p> per line so multi-paragraph extracts
// render as a single quoted block.
function mdLinesToHTML(lines) {
    let html = '';
    let bqBuffer = []; // pending blockquote paragraphs
    const flushBq = () => {
        if (bqBuffer.length === 0) return;
        html += '<blockquote>' + bqBuffer.map(p => `<p>${p}</p>`).join('') + '</blockquote>';
        bqBuffer = [];
    };
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) { flushBq(); continue; }
        if (trimmed === '>') {
            // Bare blockquote separator — skip silently.
            continue;
        }
        if (trimmed.startsWith('> ')) {
            bqBuffer.push(richText(trimmed.slice(2)));
            continue;
        }
        flushBq();
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
    // Parse a single Q block into: preamble, extract, question, frame, skeleton plan.
    // Source markers (one per Q section): `**Preamble.** ...` (1-line context),
    // `**Extract.** Stave/Act/Chapter — scene label:` followed by `>` blockquote(s),
    // `**Question (AQA house style):**` followed by `>` blockquote question,
    // `**Frame.** ...` (analytical framing), `### Skeleton plan` (editable plan).
    //
    // v7.19.101: Preamble + Extract are now separate buckets so render order can
    // match the AQA paper exactly: Preamble → Extract → Question → Frame.
    // Inline content after `**Preamble.**` and `**Extract.**` markers is captured
    // (the preamble text and the scene-setup label respectively).
    const lines = block.split('\n');

    let inSection = 'header'; // 'header' | 'preamble' | 'extract' | 'question' | 'frame' | 'plan'
    const buckets = { header: [], preamble: [], extract: [], question: [], frame: [], plan: [] };

    const switchSection = (newSection, inlineRest) => {
        inSection = newSection;
        const trimmed = (inlineRest || '').trim();
        if (trimmed) buckets[newSection].push(trimmed);
    };

    for (const line of lines) {
        if (/^## Q\d+\s+—/.test(line)) { inSection = 'header'; continue; }
        const preMatch = line.match(/^\*\*Preamble\.\*\*\s*(.*)$/);
        if (preMatch) { switchSection('preamble', preMatch[1]); continue; }
        // v7.19.101: tolerate `**Extract.** Stave 5 — title:` (CC/Macbeth/J&H/SOTF/R&J)
        // AND `**Extract — Act 1 Scene 1:**` (Much Ado dialogue extracts use em-dash
        // inside the bold). Also keeps legacy `**Typical extract.**`.
        const extMatch = line.match(/^\*\*(?:Typical extract|Extract)(?:\.|\s+—\s+[^*]+:)\*\*\s*(.*)$/);
        if (extMatch) { switchSection('extract', extMatch[1]); continue; }
        // v7.19.161: AQA Poetry anthology source uses `**Anchor poem (printed on the AQA paper):**`
        // (or similar) heading before a blockquote-wrapped poem. Treat as extract.
        // Capture the heading itself so the rendered extract section retains its label.
        const anchorMatch = line.match(/^\*\*Anchor poem[^*]*\*\*\s*(.*)$/);
        if (anchorMatch) {
            inSection = 'extract';
            buckets.extract.push(line); // keep the bold heading line in the extract
            continue;
        }
        // v7.19.161: also bucket the poetry meta-headers (Predicted anchor / Suggested
        // comparison / Alternative comparison candidates) as part of the extract so
        // students see the comparison guidance alongside the anchor poem.
        if (/^\*\*(Predicted anchor|Suggested comparison|Alternative comparison)/i.test(line)) {
            inSection = 'extract';
            buckets.extract.push(line);
            continue;
        }
        // Explicit `**Question (AQA house style):**` marker — most banks.
        if (/^\*\*Question[^*]*\*\*/.test(line)) { inSection = 'question'; continue; }
        const frMatch = line.match(/^\*\*Frame\.\*\*\s*(.*)$/);
        if (frMatch) { switchSection('frame', frMatch[1]); continue; }
        if (/^### Skeleton plan/.test(line)) { inSection = 'plan'; continue; }
        // v7.19.153: P&P + Much Ado don't have `### Skeleton plan` parent — they jump
        // straight to `### INTRODUCTION` after the technique gloss. Treat that (and the
        // BP / CONCLUSION sub-headings) as an implicit plan-section start so the lines
        // bucket correctly.
        if (inSection !== 'plan' && /^###\s+(INTRODUCTION|BODY\s+PARAGRAPH|CONCLUSION)\b/i.test(line)) {
            inSection = 'plan';
            // fall through — `buckets[inSection].push(line)` below catches the header line
        }
        if (/^---\s*$/.test(line)) continue; // section break, ignore
        // v7.19.101: For banks without explicit `**Question.**` markers
        // (IC/Much Ado/P&P), detect the AQA-style question blockquote by content
        // signature and switch buckets here. Question always opens with one of
        // these standard examiner phrasings, so detection is unambiguous.
        // v7.19.161: added "Compare how" / "Compare the ways" for poetry anthology.
        if (/^>\s*(Starting with this extract|How does\b|How is\b|How far\b|Read again|Explore how|Write about\b|Compare how\b|Compare the ways\b|In ['‘"]\w)/i.test(line.trim())) {
            if (inSection === 'extract' || inSection === 'header' || inSection === 'preamble') {
                inSection = 'question';
            }
        }
        buckets[inSection].push(line);
    }

    return {
        qNum,
        title,
        preambleLines: buckets.preamble,
        extractLines: buckets.extract,
        questionLines: buckets.question,
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

    // 2. Preamble + Extract + Question + Frame bundle (readonly notice).
    // v7.19.101: AQA paper order — Preamble → Extract → Question → Frame.
    // Earlier versions rendered Question first which inverted the actual exam
    // paper layout (extract anchors the question, not the other way round).
    let bundle = '';
    if (parsed.preambleLines.length > 0) {
        bundle += `<h3>Preamble</h3>`;
        bundle += mdLinesToHTML(parsed.preambleLines);
    }
    if (parsed.extractLines.length > 0) {
        bundle += `<h3>Extract</h3>`;
        bundle += mdLinesToHTML(parsed.extractLines);
    }
    if (parsed.questionLines.length > 0) {
        bundle += `<h3>Question</h3>`;
        bundle += mdLinesToHTML(parsed.questionLines);
    }
    if (parsed.frameLines.length > 0) {
        bundle += `<h3>Frame</h3>`;
        bundle += mdLinesToHTML(parsed.frameLines);
    }
    if (bundle) {
        html += questionHTML(`Q${parsed.qNum} — Preamble + Extract + Question + Frame`, bundle);
    }

    // 3. Plan — v7.19.153: split into 5 plan sections (Plan: Introduction / BP1 / BP2 / BP3 / Conclusion).
    // Each section is its own data-section-type="plan" block. <h3> sub-headings dropped (redundant
    // with section label). <strong> stripped from bullet element labels (Hook / Topic / etc. → plain
    // inline text). Aligns with universal plan-section shape across diagnostic / planning / exam_plan
    // / exam_crib. Saved canvases convert via SWML_Crib_Plan_Restructure_Migration.
    if (parsed.planLines.length > 0) {
        const planChunks = splitPlanByH3(parsed.planLines);
        if (planChunks.length === 0) {
            // Fallback: emit a single plan section if no <h3> sub-headings found.
            let inner = mdLinesToHTML(parsed.planLines);
            inner = inner.replace(/<strong>(.*?)<\/strong>/gs, '$1');
            html += planHTML(`Q${parsed.qNum} — Plan`, inner);
        } else {
            for (const chunk of planChunks) {
                const label = `Q${parsed.qNum} — Plan: ${chunk.label}`;
                let inner = mdLinesToHTML(chunk.lines);
                inner = inner.replace(/<strong>(.*?)<\/strong>/gs, '$1');
                html += planHTML(label, inner);
            }
        }
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
        // v7.19.153: bump to 8 — plan section now splits into 5 sub-sections
        // (Plan: Introduction / BP1 / BP2 / BP3 / Conclusion) with stripped
        // <strong> labels. Aligns with Modern crib generator (tv 6 there is the
        // Modern-specific counter; this 19C/Shakespeare counter advances independently).
        // Previous tv values: 2/3/7 used for unrelated shape changes; 8 marks the
        // plan-section restructure.
        template_version: 8,
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
