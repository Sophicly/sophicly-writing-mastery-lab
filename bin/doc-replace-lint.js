#!/usr/bin/env node
/* eslint-env node */
/**
 * doc-replace-lint.js — v7.20.854 (FIXLIST never-again-1298).
 *
 * WHY THIS EXISTS. Neil, 13 Oct, after Anam's plan vanished: "how can we ensure that the same problem never occurs
 * again?" The same defect had shipped THREE times, each time fixed at one site with its own private test for "does this
 * document hold a person's work?":
 *   v7.19.713  a stale-question check blanked a marked R&J essay (573 words + 6 feedback boxes)
 *   v7.20.779  a version-stamp check replaced Conceptual Notes with the blank template on a new device
 *   v7.20.853  a re-worded topic question wiped a planning document (its work is in plan/outline boxes)
 * Every one was a call that put OTHER content in place of what the editor held, reached on page load, guarded by a test
 * that missed one kind of work. A rule in prose cannot beat that: the default when you write `setContent(template)` is
 * to not think about what is already there. So this gate makes every replacement answer the question, in the code.
 *
 * THE RULE. Every call that replaces the editor's content —
 *     <editor>.commands.setContent(ARG …)   _setContentMigrating(ARG)   runMSUSetContent(ARG)
 * in any frontend/wml-*.js file must be ONE of:
 *   A. PROVABLY DERIVED — ARG is built from the live document itself (followed back through its assignments to an
 *      expression that calls getHTML(), with no template builder or artifact on the way). Heals and migrations that
 *      rewrite the student's own document pass with no ceremony.
 *   B. ANNOTATED — `// @DOC-REPLACE(<class>): <why, at least 15 characters>` on the call's line or one of the 4 above.
 *        guarded     reached only after a person-work check (docReplaceVerdict / staleRegenVerdict /
 *                    outlineHasStudentInput) — CHECKED: one of them is called within the 150 lines above
 *        empty       the editor holds no document yet — CHECKED: an emptiness test sits within the 10 lines above
 *                    (!…includes('data-section-type'), getText()…length < / <=, or the plot placeholder)
 *        same-doc    this document's own stored copy (its server copy, or this browser's copy of it)
 *        view-only   a tutor / live-modelling viewer — the page never saves
 *        user        an explicit action the person took (a button, a confirm)
 *        carry-over  rebuilt from a template, carrying every box the person filled
 *        wrong-doc   what is being replaced is not this lesson's document (another step's or task's leaked in)
 *        server-net  a failure-path fallback; any populated document it could overwrite is backed up by the server
 *                    (SWML_Canvas_Safety) before the write lands — recoverable, and logged
 *   Anything else FAILS the build, naming the line.
 * And the ONE predicate exists: the @STALE-REGEN-PURE block defines docReplaceVerdict, and staleRegenVerdict decides
 * through it.
 *
 * Usage:  node bin/doc-replace-lint.js            (whole repo — a replacement in ANY file can wipe a document)
 *         node bin/doc-replace-lint.js --self-test (proves the gate fails on each defect shape it exists to stop)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONT = path.join(ROOT, 'frontend');
const CLASSES = ['guarded', 'empty', 'derived', 'same-doc', 'view-only', 'user', 'carry-over', 'wrong-doc', 'server-net', 'wrapper'];
const CALL_RE = /(?:\.commands\.setContent|\b_setContentMigrating|\brunMSUSetContent)\s*\(/g;
const WRAPPER_DEF_RE = /(?:function\s+(?:_setContentMigrating|runMSUSetContent)\s*\(|(?:const|let|var)\s+(?:_setContentMigrating|runMSUSetContent)\s*=)/;
const GUARD_RE = /\b(?:docReplaceVerdict|_liveDocReplaceVerdict|staleRegenVerdict|outlineHasStudentInput)\s*\(/;
// "the editor holds no document yet": a negated section test, or a getText() read compared against a small number.
const EMPTY_SECTION_RE = /!\s*[\w$.]*(?:getHTML\(\)|currentHTML|existing)[^;\n]*\.includes\(\s*'data-section-type'\s*\)/;
function emptinessTested(text) {
    if (EMPTY_SECTION_RE.test(text) || /_hasPlaceholder/.test(text)) return true;
    return /getText\(\)/.test(text) && /(?:length|Len|Content)\s*[<>]=?\s*\d+/.test(text);
}
const FOREIGN_RE = /get\w*Template\s*\(|loadArtifact|\.value\b|res\.doc|data\.html|\bpreamble\b|Template\(\)/;

// The first argument's source text: from the '(' to the matching ')' or the first top-level ','.
function firstArg(src, openAt) {
    let depth = 0, i = openAt + 1, q = null;
    for (; i < src.length; i++) {
        const c = src[i];
        if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
        if (c === '"' || c === "'" || c === '`') { q = c; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') { if (depth === 0) break; depth--; }
        else if (c === ',' && depth === 0) break;
    }
    return src.slice(openAt + 1, i).trim();
}

// A: is ARG built from the live document? Follow `id` / `id.innerHTML` back through assignments (≤ 4 hops, ≤ 150
// lines each) until an expression calls getHTML(). Any template builder / artifact / server copy on the way → not derived.
function provablyDerived(lines, lineIdx, arg) {
    let expr = arg, from = lineIdx, prevRhs = null;
    for (let hop = 0; hop < 5; hop++) {
        if (FOREIGN_RE.test(expr)) return false;
        if (/getHTML\s*\(/.test(expr)) return true;
        const m = /^([A-Za-z_$][\w$]*)(\.innerHTML)?$/.exec(expr.trim())
            || /^([A-Za-z_$][\w$]*)(\.innerHTML)?\s*(?:\.replace\(|\.slice\(|\+)/.exec(expr.trim());
        if (!m) {
            // An expression over several identifiers (`html.slice(0, i) + x + html.slice(i)`): derived when its FIRST
            // identifier is.
            const lead = /^([A-Za-z_$][\w$]*)/.exec(expr.trim());
            if (!lead) return false;
            expr = lead[1];
            continue;
        }
        const id = m[1].replace(/\$/g, '\\$'), inner = !!m[2];
        const asg = inner
            ? new RegExp('\\b' + id + '\\.innerHTML\\s*=\\s*([^;]+)')
            : new RegExp('(?:\\b(?:const|let|var)\\s+|[^.\\w$])' + id + '\\s*=\\s*(?!=)([^;]+)');
        let found = null;
        // The call's own line counts (a one-line heal assigns and replaces together), then the 150 above.
        for (let j = from; j >= Math.max(0, from - 150); j--) {
            const t = lines[j].trim();
            if (t.startsWith('//') || t.startsWith('*')) continue;
            const a = asg.exec(lines[j]);
            // Skip the assignment we just came from (`html = html.slice(…)` would otherwise find itself again).
            if (a && !(j === from && a[1].trim() === prevRhs)) { found = { rhs: a[1].trim(), at: j }; break; }
        }
        if (!found) return false;
        prevRhs = found.rhs; expr = found.rhs; from = found.at;
    }
    return false;
}

function lintSource(src, file) {
    const lines = src.split('\n');
    const problems = [];
    let calls = 0, derived = 0, annotated = 0;
    const byClass = {};
    for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const t = line.trim();
        if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) continue;
        if (WRAPPER_DEF_RE.test(line)) continue;
        CALL_RE.lastIndex = 0;
        let m;
        while ((m = CALL_RE.exec(line))) {
            // Skip a call that sits inside a // comment on this line.
            const cpos = line.indexOf('//');
            if (cpos > -1 && cpos < m.index) continue;
            calls++;
            const lineStart = lines.slice(0, li).join('\n').length + (li ? 1 : 0);
            const arg = firstArg(src, lineStart + m.index + m[0].length - 1);
            const where = file + ':' + (li + 1);
            // B. an annotation on this line or the 4 above
            let ann = null;
            for (let k = li; k >= Math.max(0, li - 4); k--) {
                const a = /@DOC-REPLACE\(([^)]*)\)\s*:?\s*(.*)$/.exec(lines[k]);
                if (a) { ann = { cls: a[1].trim(), why: a[2].trim(), at: k }; break; }
            }
            if (ann) {
                annotated++;
                byClass[ann.cls] = (byClass[ann.cls] || 0) + 1;
                if (CLASSES.indexOf(ann.cls) === -1) { problems.push(where + ' — @DOC-REPLACE(' + ann.cls + ') is not a known class (' + CLASSES.join(' · ') + ')'); continue; }
                if (ann.why.replace(/\*\/\s*$/, '').length < 15) { problems.push(where + ' — @DOC-REPLACE(' + ann.cls + ') needs a reason of at least 15 characters (why is this safe?)'); continue; }
                if (ann.cls === 'guarded') {
                    // 150 lines above, or 40 below for a closure defined just before the check that calls it.
                    const near = lines.slice(Math.max(0, li - 150), Math.min(lines.length, li + 41)).join('\n');
                    if (!GUARD_RE.test(near)) problems.push(where + ' — claims "guarded" but no person-work check (docReplaceVerdict / staleRegenVerdict / outlineHasStudentInput) is called near it');
                }
                if (ann.cls === 'empty') {
                    const above = lines.slice(Math.max(0, li - 16), li + 1).join('\n');
                    if (!emptinessTested(above)) problems.push(where + ' — claims "empty" but no emptiness test (!…includes(\'data-section-type\') / getText()…length <) sits in the 16 lines above');
                }
                if (ann.cls === 'wrapper') {
                    const above = lines.slice(Math.max(0, li - 4), li + 1).join('\n');
                    if (!WRAPPER_DEF_RE.test(above)) problems.push(where + ' — claims "wrapper" but is not the body of _setContentMigrating / runMSUSetContent (whose callers this gate checks)');
                }
                continue;
            }
            // A. provably derived from the live document
            if (provablyDerived(lines, li, arg)) { derived++; continue; }
            problems.push(where + ' — replaces the document with `' + arg.slice(0, 70) + '`, which is not built from the document itself.'
                + ' Decide through docReplaceVerdict(…) and annotate @DOC-REPLACE(guarded), or annotate the class that makes it safe.');
        }
    }
    return { calls, derived, annotated, byClass, problems };
}

function lintRepo(override) {
    const files = override ? Object.keys(override) : fs.readdirSync(FRONT)
        .filter((f) => /^wml-.*\.js$/.test(f) && !/\.min\.js$/.test(f));
    const out = { calls: 0, derived: 0, annotated: 0, byClass: {}, problems: [] };
    for (const f of files) {
        const src = override ? override[f] : fs.readFileSync(path.join(FRONT, f), 'utf8');
        const r = lintSource(src, 'frontend/' + f);
        out.calls += r.calls; out.derived += r.derived; out.annotated += r.annotated; out.problems.push(...r.problems);
        for (const k in r.byClass) out.byClass[k] = (out.byClass[k] || 0) + r.byClass[k];
    }
    // THE ONE PREDICATE
    const asm = override ? override['wml-assessment.js'] : fs.readFileSync(path.join(FRONT, 'wml-assessment.js'), 'utf8');
    if (asm) {
        const b = asm.indexOf('// @STALE-REGEN-PURE-BEGIN'), e = asm.indexOf('// @STALE-REGEN-PURE-END');
        const block = (b > -1 && e > b) ? asm.slice(b, e) : '';
        if (!/function docReplaceVerdict\s*\(/.test(block)) out.problems.push('frontend/wml-assessment.js — the @STALE-REGEN-PURE block must define docReplaceVerdict (the ONE "does this document hold a person\'s work?" rule)');
        const sr = /function staleRegenVerdict\s*\([^)]*\)\s*\{([\s\S]*?)\n    \}/.exec(block);
        if (!sr || !/docReplaceVerdict\s*\(/.test(sr[1])) out.problems.push('frontend/wml-assessment.js — staleRegenVerdict must decide through docReplaceVerdict, never a private copy of the rule');
    }
    return out;
}

if (process.argv.includes('--self-test')) {
    const real = fs.readFileSync(path.join(FRONT, 'wml-assessment.js'), 'utf8');
    const anchor = '    function saveCanvasContent() {';
    const inject = (snippet) => ({ 'wml-assessment.js': real.replace(anchor, snippet + '\n' + anchor) });
    const cases = [
        ['an unannotated template replacement on load (the v7.20.853 shape)', '    function _probe1() { canvasEditor.commands.setContent(getDocumentTemplate(mode, topicData), false); }', true],
        ['an unannotated artifact load over the editor (the predecessor-draft shape)', '    async function _probe2() { const a = await WML.cwProject.loadArtifact(1, "x"); canvasEditor.commands.setContent(a.value); }', true],
        ['an unannotated empty-wipe', "    function _probe3() { canvasEditor.commands.setContent('<p></p>', false); }", true],
        ['"guarded" claimed with no person-work check above', '    function _probe4() {\n        // @DOC-REPLACE(guarded): trust me, the doc is always empty at this point\n        canvasEditor.commands.setContent(getDefaultEssayTemplate(), false);\n    }', true],
        ['an unknown class', '    function _probe5() {\n        // @DOC-REPLACE(probably-fine): the template is what the student wants anyway\n        canvasEditor.commands.setContent(getDefaultEssayTemplate(), false);\n    }', true],
        ['a class with no reason', '    function _probe6() {\n        // @DOC-REPLACE(user)\n        canvasEditor.commands.setContent(getDefaultEssayTemplate(), false);\n    }', true],
        ['a variable that held the document, then reassigned to a template', '    function _probe8() {\n        let html = canvasEditor.getHTML();\n        html = getDocumentTemplate(mode, topicData);\n        canvasEditor.commands.setContent(html, false);\n    }', true],
        ['a heal derived from the live document (must PASS)', '    function _probe7() { const html = canvasEditor.getHTML(); const tmp = document.createElement("div"); tmp.innerHTML = html; canvasEditor.commands.setContent(tmp.innerHTML, false); }', false],
    ];
    let bad = 0;
    for (const [name, snippet, shouldFail] of cases) {
        const r = lintRepo(inject(snippet));
        const failed = r.problems.some((p) => /_probe|frontend\/wml-assessment\.js:/.test(p)) && r.problems.length > lintRepo().problems.length;
        const ok = shouldFail ? failed : (r.problems.length === lintRepo().problems.length);
        console.log((ok ? '  ✓ ' : '  ✗ ') + (shouldFail ? 'FAILS on ' : 'passes ') + name);
        if (!ok) bad++;
    }
    // The predicate gate: a private copy of the rule in staleRegenVerdict must fail.
    const privateCopy = real.replace(/return docReplaceVerdict\(o\) === 'replace' \? 'regen' : 'preserve';/, "return (o.typedBox || o.hasFeedback) ? 'preserve' : 'regen';");
    const r2 = lintRepo({ 'wml-assessment.js': privateCopy });
    const okPred = privateCopy !== real && r2.problems.some((p) => /staleRegenVerdict must decide through docReplaceVerdict/.test(p));
    console.log((okPred ? '  ✓ ' : '  ✗ ') + 'FAILS when staleRegenVerdict keeps a private copy of the rule');
    if (!okPred) bad++;
    console.log(bad ? '\n❌ doc-replace-lint self-test FAILED (' + bad + ')' : '\n✅ doc-replace-lint self-test passed (' + (cases.length + 1) + ' shapes)');
    process.exit(bad ? 1 : 0);
}

const r = lintRepo();
const cls = Object.keys(r.byClass).sort().map((k) => k + ' ' + r.byClass[k]).join(' · ');
if (r.problems.length) {
    console.log('❌ doc-replace-lint: ' + r.problems.length + ' replacement(s) do not say why they are safe for a document that holds a person\'s work:');
    r.problems.forEach((p) => console.log('   ' + p));
    console.log('   (' + r.calls + ' calls · ' + r.derived + ' derived from the document · ' + r.annotated + ' annotated: ' + cls + ')');
    process.exit(1);
}
console.log('✅ doc-replace-lint: ' + r.calls + ' content replacements — ' + r.derived + ' derived from the document itself, ' + r.annotated + ' annotated (' + cls + '); the ONE predicate is docReplaceVerdict');
