#!/usr/bin/env node
/* eslint-env node */
/**
 * PLAN⇄OUTLINE FAN-OUT HARNESS (v7.20.223 — Neil's reliability ask, 2026-07-20:
 * "how are you gonna make sure all of that runs reliably?")
 *
 * The v7.20.221 convergence law: the mirror-back @FIELD_SET plan value ALSO refines the
 * paragraph's outline element boxes, via a deterministic engine mapping
 * (_planOutlineTargets + _planLabelElement in wml-assessment.js). A wrong label or a
 * drifted fieldId is the #1 recurring bug class (write-key ≠ read-key) — and it fails
 * SILENTLY: the plan files fine, the outline just never refines.
 *
 * This harness makes that failure impossible to ship. For EVERY planning protocol:
 *   1. extract its literal @FIELD_SET plan templates (the labels are real; values are …)
 *   2. run each through the REAL SLICED engine code (no reimplementation — the shipped
 *      _planFieldSegments/_planOutlineTargets/_planLabelElement are eval'd from source)
 *   3. assert every generated outline id is a real @FIELD_COMMIT id in that protocol
 *   4. assert every labelled segment maps (no silent UNMAPPED labels)
 * A protocol with no plan @FIELD_SETs (not yet converted, e.g. P2 pre-conversion) is
 * SKIPPED with a notice — the gate starts enforcing the moment the conversion ships.
 *
 * Abbreviated sibling templates (plan-body-2 value:"…") inherit the labels of their
 * -1 sibling (the protocol's own "same rule" shorthand).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'frontend', 'wml-assessment.js'), 'utf8');

function slice(name) {
    const i = SRC.indexOf('function ' + name + '(');
    if (i === -1) { console.error('❌ plan-fanout-harness: shipped engine is missing ' + name); process.exit(1); }
    let d = 0;
    for (let k = SRC.indexOf('{', i); k < SRC.length; k++) {
        if (SRC[k] === '{') d++;
        else if (SRC[k] === '}') { d--; if (!d) return SRC.slice(i, k + 1); }
    }
    console.error('❌ plan-fanout-harness: unbalanced braces slicing ' + name); process.exit(1);
}
// v7.20.228: _planRowExists is _planOutlineTargets' default doc probe — sliced so the
// reference resolves; the harness always injects its own probe (the @FIELD_COMMIT id set),
// so the canvasEditor path never runs here.
const { _planFieldSegments, _planOutlineTargets, _planLabelElement } = new Function(
    'const canvasEditor = null;'
    + slice('_planRowExists') + slice('_planFieldSegments') + slice('_planOutlineTargets') + slice('_planLabelElement')
    + '; return { _planFieldSegments, _planOutlineTargets, _planLabelElement };'
)();

// Every planning protocol the ROUTER LOADS, all boards. A "protocol" is the whole planning
// DIRECTORY (v7.20.228): the lang papers keep everything in protocol-b-planning.md, but
// literature splits across b1..b10 stage files — @FIELD_SET templates and @FIELD_COMMIT ids
// must be collected across the dir, since that is the unit the router serves per session.
//
// v7.20.616: the directory set now comes from the MANIFESTS, not from a name match on disk.
// This harness used to ask `if (e.name === 'planning')`, which is blind to Edexcel IGCSE
// Lang P2 — its ladder lives in `steps/` — so that port's 25 @FIELD_COMMIT + 5 @FIELD_SET
// went unchecked from 2026-08-16 while this gate printed ✅. See bin/lib/protocol-planning-dirs.js.
const { resolvePlanningDirs, readProtocolDir, reportOrphans } = require('./lib/protocol-planning-dirs.js');
const { dirs: PLANNING_DIRS, orphans: PLANNING_ORPHANS } = resolvePlanningDirs(ROOT);

let fail = 0, checkedProtocols = 0, totalIds = 0;
fail += reportOrphans(PLANNING_ORPHANS);
for (const entry of PLANNING_DIRS) {
    const rel = entry.rel;
    const proto = readProtocolDir(entry.dir);

    const templates = [];
    for (const m of proto.matchAll(/@FIELD_SET\{"field":"(plan-[^"]+)","value":"([^"]*)"\}/g)) {
        templates.push({ field: m[1], value: m[2] });
    }
    if (!templates.length) { console.log('— ' + rel + ': no plan @FIELD_SETs (not yet converted) — skipped'); continue; }
    checkedProtocols++;

    const real = new Set();
    for (const m of proto.matchAll(/@FIELD_COMMIT\{"field":"(outline-[^"]+)"/g)) real.add(m[1]);

    // Sibling-template inheritance for abbreviated "…" values (plan-body-2 → plan-body-1's labels).
    const byField = Object.fromEntries(templates.map(t => [t.field, t.value]));
    let ids = 0;
    for (const t of templates) {
        let value = t.value;
        if (!/:/.test(value)) {
            const sib = t.field.replace(/\d+$/, '1');
            if (sib !== t.field && byField[sib] && /:/.test(byField[sib])) value = byField[sib];
        }
        // v7.20.228: the probe = this protocol's own @FIELD_COMMIT id set — the same rows the
        // doc renders (planning-keymatch proves commits ↔ rendered rows separately). This is
        // how the doc-aware lit intro/conclusion branches resolve without a live editor.
        const target = _planOutlineTargets(t.field, id => real.has(id));
        if (!target) {
            // Scene rows etc. legitimately have no outline pair ONLY if the protocol
            // declares them single-emit — a plan-* @FIELD_SET with no mapping is suspect.
            console.log('FAIL ' + rel + ': ' + t.field + ' has a @FIELD_SET but no fan-out mapping (extend _planOutlineTargets)');
            fail++; continue;
        }
        const wanted = target.mode === 'whole'
            ? [target.target]
            : _planFieldSegments(value).map(s => {
                const el = _planLabelElement(s.label, target.family);
                return el ? target.make(el) : ('UNMAPPED<' + s.label + '>');
            });
        for (const id of wanted) {
            ids++; totalIds++;
            if (id.startsWith('UNMAPPED<')) { console.log('FAIL ' + rel + ': ' + t.field + ' label ' + id + ' — extend _planLabelElement'); fail++; continue; }
            if (!real.has(id)) { console.log('FAIL ' + rel + ': ' + t.field + ' → ' + id + ' is not a @FIELD_COMMIT outline id in this protocol'); fail++; }
        }
    }
    console.log('— ' + rel + ': ' + templates.length + ' plan @FIELD_SETs → ' + ids + ' fan-out ids checked');
}

// ── DOC-AWARE (v7.20.701, #722 B2 step 1.4) ──────────────────────────────────────────────────────────────────
// Everything above checks a protocol against ITSELF: its @FIELD_SETs fan out to its own @FIELD_COMMIT ids. That is
// how §3.2 shipped — IGCSE P2 committed to outline-intro-hook while the page drew outline-intro-hook-q1, and the
// fan-out agreed with the protocol, not the page. So, on every topic of every language paper, redraft, through the
// PAGE builder (bin/lib/template-render-sandbox.js), with the doc's own ids as the row probe:
//   (1) every plan box the fan-out maps must land on rows that EXIST in that doc (whole: the target; elements: at
//       least one row of the family — a wrong suffix or name lands on none);
//   (2) every outline row of a question whose plan fans out must be REACHABLE from that question's plan boxes.
{
    const { makeTemplateRenderer, readTopics } = require('./lib/template-render-sandbox.js');
    const { render } = makeTemplateRenderer(ROOT);
    const FAMILY_KEYS = {
        body: ['topic', 'evidence', 'analysis', 'effects', 'effects2', 'purpose', 'context', 'inf1-topic', 'inf1-evidence', 'inf2-topic', 'inf2-evidence'],
        intro: ['hook', 'building', 'thesis', 'perspectives'],
        conclusion: ['thesis', 'concept', 'purpose', 'message'],
    };
    const T = path.join(ROOT, 'protocols', 'shared', 'templates', 'topics');
    const boardOf = f => (/^(edexcel-igcse|cambridge-igcse)-/.exec(f) || [, f.split('-')[0]])[1];
    // ENFORCED where the fan-out actually runs: a paper whose planning protocol files plans (@FIELD_SET), plus a paper
    // under an active port (its protocol is being written to these ids). Elsewhere a mismatch is LATENT — no protocol
    // sends a plan there yet — and is listed, never silently dropped.
    const PORTING = ['edexcel-igcse/language1'];   // #722 B2: IGCSE P1 planning is being written to these ids
    const filing = new Set(PLANNING_DIRS.filter(d => /@FIELD_SET\{"field":"plan-/.test(readProtocolDir(d.dir))).map(d => d.board + '/' + d.group));
    PORTING.forEach(p => filing.add(p));
    const latent = new Map();
    let docs = 0, boxes = 0; const seen = new Set();
    for (const f of fs.readdirSync(T).filter(x => /-language-(p|c|u)\d+\.md$/.test(x)).sort()) {
        const n = (/-(?:p|c|u)(\d+)\.md$/.exec(f) || [])[1];
        const st = { board: boardOf(f), subject: 'language_p' + (n === '1' ? '1' : '2') };
        const enforced = filing.has(st.board + '/language' + (n === '1' ? '1' : '2'));
        for (const t of readTopics(ROOT, path.join(T, f)).filter(x => x.questions.length)) {
            const qs = render(st, 'redraft', t); docs++;
            const ids = new Set(qs.flatMap(q => q.outline));
            for (const q of qs) {
                if (!q.outline.length) continue;   // nothing to refine — the fan-out is moot for this question
                const reached = new Set(); let mapped = 0;
                const flag = (key, msg) => {
                    if (seen.has(key)) return; seen.add(key);
                    if (enforced) { fail++; console.log('FAIL ' + msg); } else latent.set(key, msg);
                };
                for (const pf of q.plan) {
                    const tg = _planOutlineTargets(pf, id => ids.has(id));
                    if (!tg) continue;
                    mapped++; boxes++;
                    const cands = tg.mode === 'whole' ? [tg.target] : FAMILY_KEYS[tg.family || 'body'].map(k => tg.make(k));
                    const hits = cands.filter(id => ids.has(id));
                    hits.forEach(id => reached.add(id));
                    const key = `${f} ${q.qId} ${pf}`;
                    if (!hits.length) flag(key, `doc ${f} Topic ${t.topic} ${q.qId}: ${pf} fans out to ${tg.mode === 'whole' ? tg.target : cands.slice(0, 3).join(', ') + '…'} — no such row in the document`);
                }
                if (!mapped) continue;
                const orphan = q.outline.filter(id => !reached.has(id));
                const key = `${f} ${q.qId} orphan`;
                if (orphan.length) flag(key, `doc ${f} Topic ${t.topic} ${q.qId}: ${orphan.length} outline row(s) no plan box fans out to — ${orphan.slice(0, 4).join(', ')}`);
            }
        }
    }
    console.log('— DOC-AWARE: ' + docs + ' real redraft documents, ' + boxes + ' plan boxes fanned out against the rows the page draws; enforced on '
        + [...filing].sort().join(', '));
    if (latent.size) {
        console.log('  · LATENT (' + latent.size + ') — papers whose planning protocol does not file plans yet; fix before porting one:');
        [...latent.values()].slice(0, 6).forEach(m => console.log('      ' + m));
        if (latent.size > 6) console.log('      … and ' + (latent.size - 6) + ' more');
    }
}

if (fail) { console.error('❌ plan-fanout-harness: ' + fail + ' failure(s)'); process.exit(1); }
console.log('✅ plan-fanout-harness passed (' + checkedProtocols + ' converted protocol(s), ' + totalIds + ' fan-out ids all resolve to real outline boxes).');
