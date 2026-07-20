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

// Every planning protocol on disk, all boards. A "protocol" is the whole planning DIRECTORY
// (v7.20.228): the lang papers keep everything in protocol-b-planning.md, but literature
// splits across b1..b10 stage files — @FIELD_SET templates and @FIELD_COMMIT ids must be
// collected across the dir, since that is the unit the router serves per session.
function findProtocols(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name === 'planning') out.push(p);
            else findProtocols(p, out);
        }
    }
    return out;
}
function readProtocolDir(dir) {
    return fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort()
        .map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n\n');
}

let fail = 0, checkedProtocols = 0, totalIds = 0;
for (const file of findProtocols(path.join(ROOT, 'protocols'), [])) {
    const rel = path.relative(ROOT, file);
    const proto = readProtocolDir(file);

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

if (fail) { console.error('❌ plan-fanout-harness: ' + fail + ' failure(s)'); process.exit(1); }
console.log('✅ plan-fanout-harness passed (' + checkedProtocols + ' converted protocol(s), ' + totalIds + ' fan-out ids all resolve to real outline boxes).');
