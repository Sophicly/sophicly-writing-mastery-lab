#!/usr/bin/env node
/* eslint-env node */
/**
 * SHARED PLANNING-DIRECTORY RESOLVER (v7.20.616)
 *
 * THE DEFECT THIS EXISTS TO KILL (measured 2026-09-15):
 * `plan-fanout-harness.js` collected a protocol by asking `if (e.name === 'planning')`.
 * Edexcel IGCSE Language Paper 2's ladder lives in `steps/`, not `planning/` — so its
 * 25 @FIELD_COMMIT + 5 @FIELD_SET markers were NEVER CHECKED, and the harness printed ✅
 * for a month (since 2026-08-16) while covering nothing. A gate keyed on a FOLDER NAME
 * passes perfectly on a protocol it cannot see.
 *
 * THE FIX: key on WHAT THE ROUTER ACTUALLY LOADS. `load_modular_protocol()`
 * (class-protocol-router.php:2428-2575) resolves every planning file as
 * `<plugin dir>/<manifest.base_path>/<file>`, drawn from `planning.always` and
 * `planning.steps[*].files`. So the authoritative set of planning directories is the set
 * of directories those paths land in — not a name match on disk.
 *
 * AND THE ORPHAN CHECK, because the twin failure is a dir the manifest forgot:
 * a planning/steps directory on disk that NO manifest planning block references is
 * dead to the router. If it carries filing markers, that is a silent miss (the student's
 * plan would never file) — the caller FAILS on it. If it carries none, it is reported.
 *
 * Used by: plan-fanout-harness.js · planning-keymatch-harness.js · ladder-check-harness.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PLANNING_DIR_NAMES = new Set(['planning', 'steps']);

function findManifests(dir, out) {
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) findManifests(p, out);
        else if (e.name === 'manifest.json') out.push(p);
    }
    return out;
}

function findDirsOnDisk(dir, out) {
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (!e.isDirectory()) continue;
        if (p.includes('_superseded')) continue;
        if (PLANNING_DIR_NAMES.has(e.name)) out.push(p);
        else findDirsOnDisk(p, out);
    }
    return out;
}

/** Every .md in a planning dir, concatenated — the unit the router serves per session. */
function readProtocolDir(dir) {
    return fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort()
        .map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n\n');
}

function hasFilingMarkers(dir) {
    const t = readProtocolDir(dir);
    return /@FIELD_COMMIT\{|@FIELD_SET\{/.test(t);
}

/**
 * @returns {{dirs: Array<{dir,rel,manifest,board,group,files:string[]}>, orphans: Array<{rel,markers:boolean}>}}
 *   dirs    — planning directories the router genuinely loads, each with the manifest that loads it
 *   orphans — planning/steps dirs on disk that no manifest planning block references
 */
function resolvePlanningDirs(root = ROOT) {
    const byDir = new Map();

    for (const mf of findManifests(path.join(root, 'protocols'), [])) {
        let m;
        try { m = JSON.parse(fs.readFileSync(mf, 'utf8')); }
        catch (err) { throw new Error('unparseable manifest ' + path.relative(root, mf) + ': ' + err.message); }
        const plan = m.planning;
        if (!plan || typeof plan !== 'object') continue;

        const board = m.board || path.basename(path.dirname(path.dirname(mf)));
        const group = m.group || path.basename(path.dirname(mf));
        const base = path.join(root, m.base_path || path.posix.join('protocols', board, group));

        const refs = [];
        if (Array.isArray(plan.always)) refs.push(...plan.always);
        if (plan.steps && typeof plan.steps === 'object') {
            for (const step of Object.values(plan.steps)) {
                if (step && Array.isArray(step.files)) refs.push(...step.files);
            }
        }

        for (const ref of refs) {
            if (typeof ref !== 'string') continue;
            const abs = path.resolve(base, ref);
            const dir = path.dirname(abs);
            if (!PLANNING_DIR_NAMES.has(path.basename(dir))) continue; // modules/ etc. are not the ladder
            if (!fs.existsSync(dir)) continue;
            if (!byDir.has(dir)) {
                byDir.set(dir, {
                    dir,
                    rel: path.relative(root, dir),
                    manifest: path.relative(root, mf),
                    board, group,
                    files: new Set(),
                });
            }
            byDir.get(dir).files.add(path.basename(abs));
        }
    }

    const dirs = [...byDir.values()]
        .map(d => ({ ...d, files: [...d.files].sort() }))
        .sort((a, b) => a.rel.localeCompare(b.rel));

    const loaded = new Set(dirs.map(d => d.dir));
    const orphans = findDirsOnDisk(path.join(root, 'protocols'), [])
        .filter(d => !loaded.has(d))
        .map(d => ({ rel: path.relative(root, d), markers: hasFilingMarkers(d) }))
        .sort((a, b) => a.rel.localeCompare(b.rel));

    return { dirs, orphans };
}

/**
 * Print orphan findings and return the number that are FAILURES (unreferenced dir that
 * nonetheless carries filing markers — the student's plan would file into nothing).
 */
function reportOrphans(orphans, log = console.log) {
    let fail = 0;
    for (const o of orphans) {
        if (o.markers) {
            log('FAIL ' + o.rel + ': carries @FIELD_COMMIT/@FIELD_SET markers but NO manifest planning block loads it — the router never serves these files, so the plan would file into nothing.');
            fail++;
        } else {
            log('— ' + o.rel + ': on disk but not referenced by any manifest planning block (no filing markers, so not a silent-miss risk).');
        }
    }
    return fail;
}

module.exports = { ROOT, resolvePlanningDirs, readProtocolDir, reportOrphans, PLANNING_DIR_NAMES };
