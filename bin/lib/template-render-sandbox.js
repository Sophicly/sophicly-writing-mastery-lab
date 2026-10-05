/* eslint-env node */
// v7.20.697 (#722 B2 step 0) — run the SHIPPED multi-question doc builder (buildMultiQuestionTemplate and
// everything it calls, sliced from wml-assessment.js, never reimplemented) against a REAL topic template,
// and report the field ids the page would render, question by question.
//
// Why this exists: bin/paper-render-probe.js and bin/planning-keymatch-harness.js both used to re-type the
// page's question dispatch by hand. A hand copy cannot see a change to the real dispatch, so both gates
// reported on their own copy — the probe said "IGCSE P1 Q4 renders 18 rows" while the page rendered none
// (#618), and the key-match harness never looked at IGCSE at all. Topic questions come from the shipped PHP
// parser (bin/lib/topic-dump.php), so q.text — which decides creative vs transactional routing — is real too.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');

const MARKERS = [
    ['const OUTLINE_BODY_ONLY_OVERRIDES = {'], ['const OUTLINE_BODY_FOCUS = {'], ['const OUTLINE_CRITERIA = {'],
    ['const OUTLINE_SPECS = {'], ['function needsFullEssayStructure(', '('], ['function getOutlineSpecKey(', '('],
    ['function getParagraphCount(', '('], ['const OUTLINE_VERIFIED_PAPERS = {'], ['const SWML_PERSUASIVE_RE = ', ';'],
    ['function _outlinePaperKey(', '('], ['function _outlinePaperVerified(', '('], ['function _resolveBodyOnlyOutline(', '('],
    ['function buildIntroCriteria(', '('], ['function buildConclusionCriteria(', '('], ['function buildOutlineSection(', '('],
    ['function buildInferenceOutlineSection(', '('], ['function buildIUMVCCOutlineSection(', '('], ['function _iumvccFieldId(', '('],
    ['function _iuPoint(', '('], ['function lookupQuestionSpec(', '('], ['function buildSectionMap(', '('],
    ['function _specSubjectKey(', '('], ['function _isLangPaper2(', '('], ['function buildPlanSection(', '('],
    ['function buildIUMVCCPlanSection(', '('], ['function buildComparativePlanSection(', '('], ['function buildCreativeScenePlan(', '('],
    ['function _redraftPlanSectionsHTML(', '('], ['function _canonicalWordHint(', '('], ['function getQuestionWordTarget(', '('],
    ['const MULTIQ_RESPONSE_TARGETS = {'], ['function _multiqTargetKey(', '('],
    ['function _questionWritingFlags(', '('], ['function _redraftOutlineSectionsHTML(', '('],
    ['function buildMultiQuestionTemplate(', '('],
];

function slicer(src) {
    return function slice(marker, opener = '{') {
        const i = src.indexOf(marker);
        if (i < 0) throw new Error('template-render-sandbox: marker not found in wml-assessment.js: ' + marker);
        let j = src.indexOf(opener, i), depth = 0, k = j;
        for (; k < src.length; k++) {
            const ch = src[k];
            if (ch === '{' || ch === '[') depth++;
            else if (ch === '}' || ch === ']') { depth--; if (depth === 0) break; }
        }
        let end = k + 1;
        if (src[end] === ';') end++;
        return src.slice(i, end);
    };
}

// The page's HTML helpers are replaced by RECORDERS: one line per section / divider / field, in render order.
function makeTemplateRenderer(root) {
    const src = fs.readFileSync(path.join(root, 'frontend', 'wml-assessment.js'), 'utf8');
    const slice = slicer(src);
    const parts = MARKERS.map(m => slice(m[0], m[1]));
    // a brace-matched slice can swallow a later declaration; drop any part wholly inside another
    const uniq = parts.filter((a, i) => !parts.some((b, j) => j !== i && b.length > a.length && b.includes(a)));
    const explicit = {
        console,
        LIT_ESSAY_BODY_COUNT: parseInt((src.match(/var LIT_ESSAY_BODY_COUNT = (\d+)/) || [, '3'])[1], 10),
        sectionHTML: (type, label, editable, part, inner) => `\n§S\t${type}\t${label}\n${inner || ''}`,
        dividerHTML: label => `\n§D\t${label}`,
        inputHTML: (prompt, fid) => `\n§I\t${fid}`,
        outlineRowHTML: (crit, fid) => `\n§R\t${fid}`,
        escapeHTML: s => String(s), richText: s => String(s),
        state: {},
        // the server embeds language-paper-specs.json verbatim as window.swmlLangSpecs (main plugin file)
        window: { swmlLangSpecs: JSON.parse(fs.readFileSync(path.join(root, 'protocols/shared/language-paper-specs.json'), 'utf8')) },
    };
    const NOOP = new Proxy(function () { return NOOP; }, {
        get: (t, k) => (k === Symbol.toPrimitive || k === 'toString' ? () => '__STUB__' : NOOP),
    });
    const sandbox = new Proxy(explicit, {
        has: () => true,
        get: (t, k) => (k in t ? t[k] : (k in globalThis ? globalThis[k] : NOOP)),
        set: (t, k, v) => { t[k] = v; return true; },
    });
    vm.runInContext(uniq.join('\n'), vm.createContext(sandbox));

    // Render one topic → [{ qId, specFound, type, marks, plan: [ids], outline: [ids], response: [ids] }].
    function render(st, mode, topic) {
        explicit.state = Object.assign({ text: '', phase: mode }, st);
        const out = sandbox.buildMultiQuestionTemplate(mode, {
            metadata: JSON.stringify({ questions: topic.questions, sources: [] }), aos: topic.aos,
        });
        const byQ = [];
        let cur = null, zone = null;
        for (const line of out.split('\n')) {
            const [tag, a, b] = line.split('\t');
            if (tag === '§S' && a === 'question') {
                const q = topic.questions.find(x => (x.id || x.label) === b) || {};
                const spec = sandbox.lookupQuestionSpec(b);
                cur = { qId: b, specFound: !!spec, type: q.type || (spec && spec.type) || null,
                    marks: parseInt((spec && spec.marks) != null ? spec.marks : q.marks) || 0, plan: [], outline: [], response: [] };
                byQ.push(cur); zone = 'response';
            } else if (tag === '§D' && cur) {
                zone = /^PLAN\b/.test(a) ? 'plan' : /^OUTLINE\b/.test(a) ? 'outline' : 'response';
            } else if (tag === '§S' && cur && /^(plan|outline|response)$/.test(a)) {
                zone = a;
            } else if ((tag === '§I' || tag === '§R') && cur) {
                // by the id's own family, not by which helper drew it: the creative scene plan draws its plan
                // rows with outlineRowHTML, and they are PLAN fields (plan-scene-Qn-*), never outline ones.
                (/^outline-/.test(a) ? cur.outline : zone === 'response' ? cur.response : cur.plan).push(a);
            }
        }
        return byQ;
    }
    return { render, sandbox };
}

// The shipped PHP topic parser's view of a template: [{ topic, label, aos, format, questions }].
function readTopics(root, templateFile) {
    return JSON.parse(cp.execFileSync('php', [path.join(root, 'bin', 'lib', 'topic-dump.php'), templateFile], { encoding: 'utf8' }));
}

// Language paper templates are named {board}-language-p{N}.md (the router's text_to_template_slug form).
function languageTemplate(root, board, subject) {
    const n = (/([12])$/.exec(String(subject)) || [])[1];
    return path.join(root, 'protocols', 'shared', 'templates', 'topics', `${board}-language-p${n}.md`);
}

module.exports = { makeTemplateRenderer, readTopics, languageTemplate };
