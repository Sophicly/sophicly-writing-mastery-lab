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
    // IUMVCC criteria content (pure data + tiny control builders). They shape what a row SAYS, not its id, but
    // OUTLINE_CRITERIA calls them as it is built, so they go first (a const read before it is declared throws).
    ['const _IU_ACTION_VERBS = [', '['], ['const _IU_SENSORY_VERBS = [', '['], ['const _IU_TONES_GENERAL = [', '['],
    ['function _iuVerbCtl(', '('], ['function _iuToneCtl(', '('], ['function _iuEffectCtl(', '('],
    ['const OUTLINE_BODY_ONLY_OVERRIDES = {'], ['const OUTLINE_BODY_FOCUS = {'], ['const OUTLINE_CRITERIA = {'],
    ['const OUTLINE_SPECS = {'], ['function needsFullEssayStructure(', '('], ['function getOutlineSpecKey(', '('],
    ['function getParagraphCount(', '('], ['const OUTLINE_VERIFIED_PAPERS = {'], ['const SWML_PERSUASIVE_RE = ', ';'],
    ['function _outlinePaperKey(', '('], ['function _outlinePaperVerified(', '('], ['function _resolveBodyOnlyOutline(', '('],
    ['function buildIntroCriteria(', '('], ['function buildConclusionCriteria(', '('], ['function buildOutlineSection(', '('],
    ['function buildInferenceOutlineSection(', '('], ['function buildIUMVCCOutlineSection(', '('], ['function _iumvccFieldId(', '('],
    ['function _iuPoint(', '('], ['function _langSpecPaper(', '('], ['function lookupQuestionSpec(', '('],
    ['function buildSectionMap(', '('], ['function _specSubjectKey(', '('], ['function _isLangPaper2(', '('],
    ['function buildPlanSection(', '('], ['function buildIUMVCCPlanSection(', '('], ['function buildComparativePlanSection(', '('],
    ['function buildCreativeScenePlan(', '('], ['function _redraftPlanSectionsHTML(', '('], ['function _canonicalWordHint(', '('],
    ['function getQuestionWordTarget(', '('], ['const MULTIQ_RESPONSE_TARGETS = {'], ['function _multiqTargetKey(', '('],
    ['function _questionWritingFlags(', '('], ['function _redraftOutlineSectionsHTML(', '('],
    ['function buildMultiQuestionTemplate(', '('],
    // v7.20.699: the load heal, so a gate can prove a FRESH document needs no healing (bin/fresh-doc-heal-gate.js)
    ['function _purposeWithoutAO3(', '('], ['function _isAnyLanguagePaper(', '('], ['function _healOutlineScaffold(', '('],
    ['function _outlineBodyCriterion(', '('], ['function _comparisonOutlineArgs(', '('], ['const COMPARISON_OUTLINE_SPEC = {'],
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

// Top-level declarations in a source text: `function NAME(` and `const|let|var NAME =`.
const DECL = /^\s*(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)/gm;
const namesIn = text => new Set([...text.matchAll(DECL)].map(m => m[1] || m[2]));

// The page's HTML helpers are replaced by RECORDERS: one line per section / divider / field, in render order.
// opts.src: read the builder from another copy of wml-assessment.js (a gate proving it can fail runs an older build).
function makeTemplateRenderer(root, opts) {
    const src = fs.readFileSync((opts && opts.src) || path.join(root, 'frontend', 'wml-assessment.js'), 'utf8');
    const slice = slicer(src);
    const parts = MARKERS.map(m => slice(m[0], m[1]));
    // a brace-matched slice can swallow a later declaration; drop any part wholly inside another
    const uniq = parts.filter((a, i) => !parts.some((b, j) => j !== i && b.length > a.length && b.includes(a)));
    // Helpers wml-assessment.js imports from wml-core.js (`const { … } = WML;`) live in the other file.
    const core = fs.readFileSync(path.join(root, 'frontend', 'wml-core.js'), 'utf8');
    const coreParts = [['const isLanguageSubject = () => {', '{']].map(m => slicer(core)(m[0], m[1]));
    const sliced = coreParts.concat(uniq).join('\n');
    const explicit = {
        console,
        LIT_ESSAY_BODY_COUNT: parseInt((src.match(/var LIT_ESSAY_BODY_COUNT = (\d+)/) || [, '3'])[1], 10),
        sectionHTML: (type, label, editable, part, inner) => `\n§S\t${type}\t${label}\n${inner || ''}`,
        dividerHTML: label => `\n§D\t${label}`,
        inputHTML: (prompt, fid) => `\n§I\t${fid}`,
        outlineRowHTML: (crit, fid) => `\n§R\t${fid}\t${JSON.stringify(crit)}`,
        escapeHTML: s => String(s), richText: s => String(s),
        state: {},
        canvasEditor: null, saveCanvasContent: () => {}, _migrationActive: false,
        // the server embeds language-paper-specs.json verbatim as window.swmlLangSpecs (main plugin file)
        window: { swmlLangSpecs: JSON.parse(fs.readFileSync(path.join(root, 'protocols/shared/language-paper-specs.json'), 'utf8')) },
    };
    const NOOP = new Proxy(function () { return NOOP; }, {
        get: (t, k) => (k === Symbol.toPrimitive || k === 'toString' ? () => '__STUB__' : NOOP),
    });
    // ⛔ A name the sliced code reaches for that IS defined in wml-assessment.js but was not sliced must FAIL, never
    // fall through to the no-op: a no-op lookup returns nothing, and "no spec found" then reads as a measurement.
    // (Found the day this file was written: the #618 fix added _langSpecPaper(), this sandbox had not sliced it,
    // and the probe went on reporting NO SPEC FOUND for a lookup that now worked.) Names NOT defined in the file
    // (DOM helpers, other scripts' globals) still no-op — that is what the stub is for.
    // …and every name it imports from WML counts as declared too: unprovided, `typeof isLanguageSubject ===
    // 'function'` on the catch-all stub is TRUE, which made every Literature subject a language paper here.
    const imported = [...src.matchAll(/const \{([^}]*)\} = WML;/g)]
        .flatMap(m => m[1].split(',').map(x => x.trim().split(':')[0].trim()).filter(Boolean));
    const declared = new Set([...namesIn(src), ...imported]), slicedNames = namesIn(sliced);
    const sandbox = new Proxy(explicit, {
        has: () => true,
        get: (t, k) => {
            if (k in t) return t[k];
            if (k in globalThis) return globalThis[k];
            if (typeof k === 'string' && declared.has(k) && !slicedNames.has(k)) {
                throw new Error('template-render-sandbox: the doc builder reaches for ' + k + ', which wml-assessment.js '
                    + 'defines but this sandbox did not slice — add it to MARKERS (or stub it in `explicit` on purpose).');
            }
            return NOOP;
        },
        set: (t, k, v) => { t[k] = v; return true; },
    });
    vm.runInContext(sliced, vm.createContext(sandbox));

    // Render one topic → [{ qId, specFound, type, marks, plan: [ids], outline: [ids], response: [ids] }].
    function render(st, mode, topic) {
        explicit.state = Object.assign({ text: '', phase: mode }, st);
        const out = sandbox.buildMultiQuestionTemplate(mode, {
            metadata: JSON.stringify({ questions: topic.questions, sources: [] }), aos: topic.aos,
        });
        const byQ = [], seq = [];
        let cur = null, zone = null;
        for (const line of out.split('\n')) {
            const [tag, a, b] = line.split('\t');
            if (tag === '§S') seq.push({ sep: true, type: a, label: b });
            else if (tag === '§D') seq.push({ sep: true, type: 'divider', label: a });
            else if (tag === '§R') seq.push({ fid: a, crit: JSON.parse(b || '{}') });
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
        byQ.seq = seq;
        return byQ;
    }

    // Run the shipped _healOutlineScaffold on a document made of exactly these rows (as a fresh build lays them out)
    // and return every change it would make. A fake editor: one position per node, a section boundary between
    // sections, so "the row after this one" means what it means in the real document.
    function healFresh(st, seq) {
        const nodes = seq.map(it => it.sep
            ? { type: { name: 'sectionBlock' }, attrs: { sectionType: it.type, label: it.label || '' }, nodeSize: 1, textContent: '' }
            : { type: { name: 'outlineRow' }, attrs: { fieldId: it.fid, criteria: JSON.stringify(it.crit), checkState: '{}' }, nodeSize: 1, textContent: '' });
        const ops = [];
        const tr = {
            setMeta() {},
            setNodeMarkup: (pos, t, attrs) => ops.push({ op: 'relabel', fid: nodes[pos].attrs.fieldId,
                from: JSON.parse(nodes[pos].attrs.criteria), to: JSON.parse(attrs.criteria) }),
            delete: from => ops.push({ op: 'delete', fid: nodes[from] && nodes[from].attrs.fieldId }),
            insert: (pos, node) => ops.push({ op: 'insert', fid: node.attrs.fieldId }),
        };
        explicit.state = Object.assign({ text: '' }, st);
        explicit.canvasEditor = {
            state: { doc: { descendants: cb => nodes.forEach((n, i) => cb(n, i)), nodeAt: p => nodes[p] || null } },
            chain: () => ({ command: fn => ({ run: () => fn({ tr }) }) }),
            schema: { nodes: { outlineRow: { create: attrs => ({ attrs }) } } },
        };
        try { sandbox._healOutlineScaffold(); } finally { explicit.canvasEditor = null; }
        return ops;
    }
    return { render, sandbox, healFresh };
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
