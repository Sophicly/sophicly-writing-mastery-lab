#!/usr/bin/env node
/* eslint-env node */
/**
 * criteria-lint.js — SELF-ASSESSMENT CRITERIA gate (2026-07-29).
 *
 * ⭐ THE BUG CLASS. A code-owned walk asks the student a question, then serves a tick list:
 * "which of these does your answer actually do?" Each tick is lifted from that ask's own
 * "A strong X:" bullets. The lift is where the meaning dies. Neil found this on staging, in the
 * Step 3 "Flaw" block:
 *
 *     criterion   'is an emotional shield'
 *     source      'is an **emotional shield** — a behaviour built to protect a deeper hurt'
 *     criterion   'actually works'
 *     source      '**actually works** — in everyday life it holds the pain at bay, which is
 *                  exactly why they keep using it'
 *
 * The author copied the bullet's OPENING PHRASE and dropped the clause that carries the meaning.
 * On the page the bullet teaches; in the tick list "actually works" asks a fourteen-year-old to
 * certify nothing at all. It is not a typo and not a bug — it is a silent quality failure that no
 * existing gate could see, because the existing gate (cw-keymatch-harness's self-assessment
 * block) only asserts that a criterion IS a verbatim substring of its ask. A substring is exactly
 * what a truncation is. That check proves no DRIFT; this one proves no LOSS.
 *
 * WHAT IT ASSERTS (all mechanical — no model judgment anywhere in this file)
 *   INFO-LOSS   a criterion derived from a longer teaching bullet keeps ≥ MIN_RETAIN of it.
 *   MIN-WORDS   a criterion is a phrase, not a fragment.
 *   BARE-VERB   a criterion does not open on a bare verb phrase with nothing to hang it on.
 *   NO-NOUN     a criterion names a THING — a noun phrase, or a term from the craft vocabulary.
 *   DENY        a criterion is not one of the known-vacuous phrases (append to DENY_LIST).
 *   DUPLICATE   two criteria in one block are not near-restatements of each other.
 *   RESTATES    a criterion says more than the block's own label already says.
 *   COUNT       a tick list has at least MIN_CRITERIA entries.
 *
 * WHAT IT DOES NOT CLAIM. It cannot tell you a criterion is pedagogically WRONG — only that it
 * cannot stand on its own detached from the teaching that produced it. That is the failure mode
 * that actually recurs, because the detaching is the mechanical step.
 *
 * SOURCES SCANNED
 *   (a) walk code      frontend/*.js — `criteria: [ '…', '…' ]` arrays of STRING literals.
 *                      `criteria:` arrays of OBJECTS (the IUMVCC section rows and the eight
 *                      cwPlotArchetypes stage tables) are outline-row definitions, not tick
 *                      lists, and are deliberately not in scope. The discriminator is the
 *                      element type, which is mechanical — see collectWalkBlocks().
 *   (b) protocol md    protocols/ (recursive, .md) — bullet blocks under a quality-standard heading
 *                      (`**A strong X:**`, `**Strong X are:**`, `**What makes a good X:**`).
 *                      These are the SOURCE the walk criteria are lifted from, so INFO-LOSS is
 *                      not applicable to them (criterion === bullet); every other rule is.
 *
 * Usage:  node bin/criteria-lint.js            human report, exit 1 on any failure
 *         node bin/criteria-lint.js --json     machine-readable dump (for the audit doc)
 *         node bin/criteria-lint.js --quiet    counts + failures only
 *
 * NOT wired into bin/pre-ship-check.sh yet — report-only until the live failures are fixed.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ARGS = process.argv.slice(2);
const JSON_OUT = ARGS.includes('--json');
const QUIET = ARGS.includes('--quiet');

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE RULES — every threshold and list here is a DECISION ON THE RECORD, meant to be appended to.
// ══════════════════════════════════════════════════════════════════════════════════════════════

// INFO-LOSS. A criterion lifted from a longer bullet must keep at least this share of it.
// Calibrated against the live defect: 'is an emotional shield' keeps 23% of its bullet and
// 'actually works' keeps 14%, while the third criterion in that same block — the one that
// survives detachment — keeps 100%. 0.40 separates them with room either side.
const MIN_RETAIN = 0.40;

// STANDALONE. Fewer words than this cannot carry a self-contained claim.
const MIN_WORDS = 4;

// COUNT. A tick list shorter than this is not a check.
const MIN_CRITERIA = 3;

// DUPLICATE. Jaccard similarity over content words, within one block.
const DUP_SIMILARITY = 0.7;

// ⭐ DENY_LIST — vacuous phrases, designed to be appended to. A criterion matches when it IS one
// of these, or is one of these plus at most two more words (i.e. the phrase carries the whole
// claim). Add a line whenever a new empty formula reaches a student; never delete one.
const DENY_LIST = [
    'actually works',
    'is effective',
    'is clear',
    'makes sense',
    'is strong',
    'is good',
    'works well',
];

// BARE-VERB. Verb heads that need a thing after them to mean anything.
const VERB_HEADS = new Set([
    'is', 'are', 'was', 'were', 'be', 'has', 'have', 'had', 'does', 'do', 'did',
    'works', 'work', 'makes', 'make', 'shows', 'show', 'gives', 'give', 'keeps', 'keep',
    'feels', 'feel', 'fits', 'fit', 'stays', 'stay', 'changes', 'change', 'reads', 'read',
    'sounds', 'sound', 'flows', 'flow', 'holds', 'hold', 'lands', 'land', 'hits', 'hit',
    'begins', 'begin', 'ends', 'end', 'runs', 'run', 'moves', 'move',
]);

// Leading intensifiers that add nothing — stripped before the bare-verb test so
// 'actually works' is judged as 'works'.
const INTENSIFIERS = new Set([
    'actually', 'really', 'genuinely', 'truly', 'always', 'never', 'also', 'still',
    'simply', 'just', 'clearly', 'obviously', 'properly', 'definitely',
]);

// NO-NOUN. A criterion names a THING when it carries a determiner-headed noun phrase, a
// possessive, or a term from the craft vocabulary below.
const DETERMINERS = new Set([
    'a', 'an', 'the', 'their', 'his', 'her', 'its', 'my', 'your', 'our',
    'one', 'two', 'three', 'this', 'that', 'these', 'those', 'every', 'each',
]);

// ⭐ CRAFT_NOUNS — the taught vocabulary. A criterion built on one of these names something a
// student can point at even without a determiner ('shows the PRESSURE'). Appendable; keep it to
// nouns the PROTOCOLS actually teach, never abstractions like 'courage' or 'quality' — an
// abstraction in a tick list is the defect this rule exists to catch.
const CRAFT_NOUNS = new Set([
    // story craft (CW steps 1–6)
    'shield', 'hurt', 'wound', 'flaw', 'goal', 'need', 'want', 'obstacle', 'stake', 'stakes',
    'protagonist', 'character', 'antagonist', 'incident', 'event', 'routine', 'habit',
    'pressure', 'beat', 'spine', 'logline', 'arc', 'stage', 'scene', 'image', 'story',
    'conflict', 'consequence', 'setting', 'plot', 'ending', 'opening', 'climax',
    // sentence craft
    'sentence', 'tense', 'verb', 'noun', 'adjective', 'clause', 'phrase', 'word', 'line',
    'paragraph', 'punctuation',
    // analysis craft (planning / TTECEA protocols)
    'quotation', 'quote', 'evidence', 'technique', 'device', 'effect', 'purpose', 'reader',
    'writer', 'author', 'poet', 'context', 'thesis', 'concept', 'inference', 'method',
    'source', 'text', 'extract', 'poem', 'question', 'answer', 'point', 'idea',
    // concrete world
    'camera', 'day', 'moment', 'place', 'person', 'people', 'family', 'name', 'age',
    'behaviour', 'action', 'detail', 'object', 'body', 'voice', 'room', 'hand', 'face',
]);

// ══════════════════════════════════════════════════════════════════════════════════════════════
// helpers
// ══════════════════════════════════════════════════════════════════════════════════════════════

const stripMd = (s) => String(s).replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
const collapse = (s) => String(s).replace(/\s+/g, ' ').trim();
const norm = (s) => collapse(stripMd(s)).toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const words = (s) => norm(s).split(' ').filter(Boolean);

const STOP = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'is',
    'are', 'it', 'its', 'as', 'not', 'but', 'with', 'by', 'that', 'this', 'their', 'your']);
const contentWords = (s) => words(s).filter((w) => !STOP.has(w));

function jaccard(a, b) {
    const A = new Set(contentWords(a));
    const B = new Set(contentWords(b));
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach((w) => { if (B.has(w)) inter++; });
    return inter / (A.size + B.size - inter);
}

/** Line number (1-based) of a character offset. */
function lineOf(src, idx) { return src.slice(0, idx).split('\n').length; }

/** Brace-match an object literal starting at `i` (string-aware). Same shape as cw-keymatch. */
function objectAt(s, i) {
    let d = 0;
    for (let k = i; k < s.length; k++) {
        const c = s[k];
        if (c === '{') d++;
        else if (c === '}') { d--; if (d === 0) return { text: s.slice(i, k + 1), end: k + 1 }; }
        else if (c === "'" || c === '"' || c === '`') {
            const q = c; k++;
            while (k < s.length && s[k] !== q) { if (s[k] === '\\') k++; k++; }
        }
    }
    return { text: '', end: i };
}

/** Every single-quoted literal in `src`, unescaped, in order. */
function quotedLiterals(src) {
    const out = [];
    const re = /'((?:[^'\\]|\\.)*)'/g;
    let m;
    while ((m = re.exec(src))) {
        out.push(m[1]
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\'));
    }
    return out;
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// (a) WALK CODE — `criteria: [ 'string', … ]` inside a walk-step entry
// ══════════════════════════════════════════════════════════════════════════════════════════════
//
// The entry head is `{ fid: 'cw-…'`, which is how every code-owned walk declares a step. The
// element-TYPE discriminator below is what keeps the outline-row `criteria:` arrays (IUMVCC
// sections, the eight plot archetypes) out: those hold OBJECTS, not strings, and are document
// row definitions rather than anything a student ever reads as a tick list.
//
// COVERAGE. A head-anchored scanner goes blind the moment a walk declares a step some other way,
// and a gate that silently scans nothing is worse than no gate (the v7.20.336 lesson). So every
// string-element `criteria:` array in the file is counted independently and any the head scan
// missed is reported as UNSCANNED rather than passing quietly.

function collectWalkBlocks() {
    const blocks = [];
    const unscanned = [];
    const jsDir = path.join(ROOT, 'frontend');
    const jsFiles = fs.readdirSync(jsDir)
        .filter((f) => f.endsWith('.js') && !/\.min\.js$/.test(f))
        .sort();

    jsFiles.forEach((file) => {
        const src = fs.readFileSync(path.join(jsDir, file), 'utf8');
        if (!/criteria:\s*\[/.test(src)) return;

        // Every criteria array whose first element is a STRING literal — the tick lists.
        const stringArrays = new Set();
        const scanRe = /criteria:\s*\[\s*(?:\/\/[^\n]*\n\s*)*'/g;
        let s;
        while ((s = scanRe.exec(src))) stringArrays.add(s.index);

        const claimed = new Set();
        const headRe = /\{\s*fid:\s*'([a-z0-9_-]+)'/g;
        let h;
        while ((h = headRe.exec(src))) {
            const { text: block } = objectAt(src, h.index);
            if (!block) continue;
            const cm = /criteria:\s*\[([\s\S]*?)\]/.exec(block);
            if (!cm) continue;
            const absCriteria = h.index + cm.index;
            // Only tick lists — an object-element array is an outline-row table.
            if (!/^\s*(?:\/\/[^\n]*\n\s*)*'/.test(cm[1])) continue;
            stringArrays.forEach((p) => { if (p >= h.index && p < h.index + block.length) claimed.add(p); });

            const label = (/\blabel:\s*'((?:[^'\\]|\\.)*)'/.exec(block) || [])[1]
                || (/\blead:\s*'((?:[^'\\]|\\.)*)'/.exec(block) || [])[1]
                || h[1];

            // Criteria, one per quoted literal inside the array, with real line numbers.
            const arrBody = cm[1];
            const arrStart = absCriteria + cm[0].indexOf('[') + 1;
            const critRe = /'((?:[^'\\]|\\.)*)'/g;
            const criteria = [];
            let c;
            while ((c = critRe.exec(arrBody))) {
                criteria.push({
                    text: c[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'),
                    line: lineOf(src, arrStart + c.index),
                });
            }

            // The teaching prose this block serves: everything from its first ask-bearing key on.
            let askAt = -1;
            ['chipQ:', 'ask:'].forEach((k) => {
                const at = block.indexOf(k);
                if (at !== -1 && (askAt === -1 || at < askAt)) askAt = at;
            });
            const prose = askAt === -1 ? '' : quotedLiterals(block.slice(askAt)).join('\n');

            blocks.push({
                source: 'walk',
                file: path.join('frontend', file),
                line: lineOf(src, h.index),
                label: stripMd(label),
                criteria,
                bullets: bulletsOf(prose),
            });
        }

        stringArrays.forEach((p) => {
            if (claimed.has(p)) return;
            unscanned.push({ file: path.join('frontend', file), line: lineOf(src, p) });
        });
    });

    return { blocks, unscanned };
}

/** Bullet lines of a teaching block: `- …` / `* …`, markdown stripped. */
function bulletsOf(prose) {
    return String(prose).split('\n')
        .map((l) => /^\s*[-*]\s+(.+?)\s*$/.exec(l))
        .filter(Boolean)
        .map((m) => collapse(stripMd(m[1])))
        .filter((t) => t.length > 0);
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// (b) PROTOCOL MARKDOWN — bullet blocks under a quality-standard heading
// ══════════════════════════════════════════════════════════════════════════════════════════════
//
// ⭐ APPENDABLE. HEADING_FORMS is the whole detector. These blocks are the SOURCE that walk
// criteria get lifted from, so a new heading shape must be added here the moment one is authored
// — otherwise its bullets stop being checked and the next lift has an unlinted parent.

const HEADING_FORMS = [
    /^(?:a|an)\s+strong\b[^:]*:$/i,          // **A strong flaw:**
    /^strong\b[^:]*\bare:$/i,                // **Strong stakes are:**
    /^(?:a|an)\s+(?:good|great|effective)\b[^:]*:$/i,
    /^what makes a\s+(?:strong|good|great)\b[^:]*:$/i,
];

// Named exclusions, so each is a decision on the record rather than a silent hole.
//  - _superseded/  : retired protocol text, not served to anyone.
//  - AI-internal   : lines the model reads, not the student ("Say: …", "[AI:] …", ALL-CAPS macros).
const SKIP_PATH = /(^|\/)_superseded(\/|$)/;
const AI_INTERNAL = /^(?:\[?AI[:\]]|SAY|ASK|Say:|Ask:|Internal)/;

function collectMarkdownBlocks() {
    const blocks = [];
    const files = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.md')) files.push(p);
        }
    })(path.join(ROOT, 'protocols'));

    files.sort().forEach((abs) => {
        const rel = path.relative(ROOT, abs);
        if (SKIP_PATH.test(rel)) return;
        const L = fs.readFileSync(abs, 'utf8').split('\n');
        L.forEach((raw, i) => {
            const head = collapse(stripMd(raw));
            if (!head || head.length > 100) return;
            if (AI_INTERNAL.test(head)) return;
            if (!HEADING_FORMS.some((re) => re.test(head))) return;

            let j = i + 1;
            while (j < L.length && !L[j].trim()) j++;
            const criteria = [];
            while (j < L.length && /^\s*[-*]\s+\S/.test(L[j])) {
                criteria.push({ text: collapse(stripMd(L[j].replace(/^\s*[-*]\s+/, ''))), line: j + 1 });
                j++;
            }
            if (criteria.length < 2) return;
            blocks.push({
                source: 'markdown',
                file: rel,
                line: i + 1,
                label: head.replace(/:$/, ''),
                criteria,
                // In markdown the criterion IS the bullet — nothing has been lifted yet, so
                // INFO-LOSS cannot apply. Recording them anyway keeps the report shape uniform.
                bullets: criteria.map((c) => c.text),
            });
        });
    });
    return blocks;
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE CHECKS
// ══════════════════════════════════════════════════════════════════════════════════════════════

/** The bullet a criterion was lifted from: the shortest bullet that verbatim contains it. */
function sourceBulletFor(criterion, bullets) {
    const c = norm(criterion);
    if (!c) return null;
    let best = null;
    bullets.forEach((b) => {
        const n = norm(b);
        if (n === c) return;                       // identical — nothing was dropped
        if (n.indexOf(c) === -1) return;
        if (!best || n.length < norm(best).length) best = b;
    });
    return best;
}

/**
 * The DEFINING CLAUSE of a bullet — what the criterion was actually lifted FROM.
 *
 * A bullet often runs `**lead** — the clause that makes it mean something.` and then continues
 * into a separate coaching sentence ("A character who simply 'rebels' tells us how they behave…").
 * Only the first is part of the claim; measuring against the whole bullet would fail a criterion
 * for dropping commentary it was never meant to carry. So the comparison stops at the first
 * sentence boundary AFTER the criterion ends.
 *
 * This narrows the rule; it does not weaken it. The live Flaw defect still fails, because
 * 'actually works' and 'is an emotional shield' each drop a clause inside their FIRST sentence —
 * which is exactly the difference between a truncation and a summary.
 */
function definingClause(bullet, criterion) {
    // BOTH sides must be markdown-stripped or the lookup is decided by punctuation placement.
    // The criterion was stripped and the bullet was not, so a criterion whose span contains any
    // `**bold**` could never be found inside its own bullet: indexOf returned -1, `from` silently
    // fell back to 0, and INFO-LOSS then measured against the wrong clause. Identical wording
    // scored differently depending on whether an author typed `**tick.**` or `**tick**.`
    // (WML CLAUDE.md §CANVAS 6 — a regex matched against markdown must run on stripped text).
    const b = collapse(stripMd(bullet));
    const c = collapse(stripMd(criterion));
    const at = b.toLowerCase().indexOf(c.toLowerCase());
    const from = at === -1 ? 0 : at + c.length;
    const m = /[.!?](?:\s|$)/.exec(b.slice(from));
    return m ? b.slice(0, from + m.index + 1) : b;
}

function hasNounPhrase(criterion) {
    const w = words(criterion);
    for (let i = 0; i < w.length; i++) {
        if (DETERMINERS.has(w[i]) && i + 1 < w.length) return true;
        if (/'s$/.test(w[i])) return true;
        const bare = w[i].replace(/(?:es|s)$/, '');
        if (CRAFT_NOUNS.has(w[i]) || CRAFT_NOUNS.has(bare)) return true;
    }
    return false;
}

function isBareVerbPhrase(criterion) {
    let w = words(criterion);
    while (w.length && INTENSIFIERS.has(w[0])) w = w.slice(1);
    if (!w.length || w.length > 3) return false;
    if (!VERB_HEADS.has(w[0])) return false;
    return !hasNounPhrase(criterion);
}

function deniedPhrase(criterion) {
    const n = norm(criterion);
    const nw = n.split(' ').filter(Boolean);
    for (const p of DENY_LIST) {
        const pw = p.split(' ');
        if (n === p) return p;
        if (n.startsWith(p + ' ') && nw.length <= pw.length + 2) return p;
    }
    return null;
}

function restatesLabel(criterion, label) {
    const lab = new Set(contentWords(label));
    if (!lab.size) return false;
    const cw = contentWords(criterion);
    if (!cw.length) return false;
    // Every content word of the criterion already appears in the label → it adds nothing.
    return cw.every((w) => lab.has(w) || lab.has(w.replace(/s$/, '')));
}

function lintBlock(block, failures) {
    const add = (crit, rule, why, bullet) => failures.push({
        file: block.file,
        line: crit ? crit.line : block.line,
        block: block.label,
        source: block.source,
        criterion: crit ? crit.text : '(whole block)',
        rule,
        why,
        bullet: bullet || null,
    });

    if (block.criteria.length < MIN_CRITERIA) {
        add(null, 'COUNT',
            `the tick list has ${block.criteria.length} criteria; a check needs at least ${MIN_CRITERIA}`);
    }

    block.criteria.forEach((crit, i) => {
        const text = crit.text;
        const w = words(text);

        // INFO-LOSS — only where a longer parent bullet exists (walk code, by construction).
        const bullet = block.source === 'walk' ? sourceBulletFor(text, block.bullets) : null;
        if (bullet) {
            const clause = definingClause(bullet, text);
            const kept = collapse(stripMd(text)).length / clause.length;
            if (kept < MIN_RETAIN) {
                add(crit, 'INFO-LOSS',
                    `keeps only ${Math.round(kept * 100)}% of its source clause (needs ≥ ${Math.round(MIN_RETAIN * 100)}%) `
                    + '— the clause that carried the meaning was dropped in the lift',
                    clause);
            }
        }

        // STANDALONE
        if (w.length < MIN_WORDS) {
            add(crit, 'MIN-WORDS', `${w.length} word(s); a self-contained criterion needs ≥ ${MIN_WORDS}`, bullet);
        }
        if (isBareVerbPhrase(text)) {
            add(crit, 'BARE-VERB',
                'opens on a bare verb phrase with no thing attached — detached from the ask it certifies nothing',
                bullet);
        }
        if (!hasNounPhrase(text)) {
            add(crit, 'NO-NOUN',
                'names no concrete thing (no determiner-headed noun phrase, no taught craft noun) '
                + '— the student cannot tell WHAT is being claimed',
                bullet);
        }

        // DENY
        const denied = deniedPhrase(text);
        if (denied) {
            add(crit, 'DENY', `matches the vacuous phrase "${denied}" (DENY_LIST)`, bullet);
        }

        // DISTINCTNESS
        for (let j = i + 1; j < block.criteria.length; j++) {
            const sim = jaccard(text, block.criteria[j].text);
            if (sim >= DUP_SIMILARITY) {
                add(crit, 'DUPLICATE',
                    `${Math.round(sim * 100)}% the same as "${block.criteria[j].text}" in the same block`, bullet);
            }
        }
        if (restatesLabel(text, block.label)) {
            add(crit, 'RESTATES',
                `adds nothing beyond the block's own label "${block.label}"`, bullet);
        }
    });
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// SELF-CHECK — a rule that has stopped firing is worse than no rule
// ──────────────────────────────────────────────────────────────────────────────────────────────
// DUPLICATE and RESTATES do not fire anywhere in the current corpus, so nothing else in this file
// would tell you if they broke. Each rule is driven against a known-bad fixture and a known-good
// one; the good ones are the important half — a lint that refuses honest work costs more than one
// that misses a fault, because it trains people to skip the gate.
// The BAD fixtures are the live defect itself, verbatim, so this file can never stop catching it.
function selfCheck() {
    const probes = [];
    const runFull = (block) => { const f = []; lintBlock(block, f); return f; };
    const run = (block) => runFull(block).map((x) => x.rule);
    const mk = (label, criteria, bullets) => ({
        source: 'walk', file: '(self-check)', line: 0, label,
        criteria: criteria.map((t, i) => ({ text: t, line: i })), bullets,
    });

    // THE LIVE DEFECT (Neil, staging, 2026-07-29) — must fail on INFO-LOSS, always.
    const SELF_CONTAINED = 'is something the protagonist doesn’t yet understand about themselves';
    const flaw = runFull(mk('Flaw',
        ['is an emotional shield', 'actually works', SELF_CONTAINED],
        ['is an emotional shield — a behaviour built to protect a deeper hurt (that hurt is our next block)',
            'actually works — in everyday life it holds the pain at bay, which is exactly why they keep using it',
            SELF_CONTAINED]));
    probes.push(['the live Flaw defect is caught on INFO-LOSS (both truncated criteria)',
        flaw.filter((f) => f.rule === 'INFO-LOSS').length === 2
        && flaw.some((f) => f.rule === 'INFO-LOSS' && f.criterion === 'is an emotional shield')
        && flaw.some((f) => f.rule === 'INFO-LOSS' && f.criterion === 'actually works')]);
    probes.push(['the self-contained third Flaw criterion is NOT flagged (no false refusal)',
        flaw.every((f) => f.criterion !== SELF_CONTAINED)]);

    probes.push(['DENY fires on a vacuous phrase', run(mk('X',
        ['actually works', 'names one specific past hurt', 'fits the flaw exactly and no other'], []))
        .includes('DENY')]);
    probes.push(['DUPLICATE fires on a near-restatement', run(mk('X',
        ['names one specific past hurt', 'names the one specific hurt', 'shows the reader a place'], []))
        .includes('DUPLICATE')]);
    probes.push(['RESTATES fires on a criterion that only echoes its label', run(mk('Thesis',
        ['is a thesis', 'names one specific past hurt', 'shows the reader a place'], []))
        .includes('RESTATES')]);
    probes.push(['COUNT fires on a two-item tick list',
        run(mk('X', ['names one specific past hurt', 'shows the reader a place'], [])).includes('COUNT')]);
    probes.push(['BARE-VERB fires on a bare verb phrase',
        run(mk('X', ['has courage', 'names one specific past hurt', 'shows the reader a place'], []))
            .includes('BARE-VERB')]);

    // NEGATIVE CONTROLS — well-formed criteria must pass clean.
    probes.push(['a well-formed tick list passes clean', run(mk('Wound',
        ['is one specific past hurt, not a general sadness',
            'matches the flaw the protagonist built to cover it',
            'stays hidden in their behaviour before anyone names it aloud'], [])).length === 0]);
    probes.push(['a criterion that summarises its bullet faithfully is NOT an INFO-LOSS', run(mk('Beat 3',
        ['it must be caused by Beat 3'],
        ['it must be caused by Beat 3. Say it aloud with “…and because of that…” between them.']))
        .includes('INFO-LOSS') === false]);

    const bad = probes.filter(([, ok]) => !ok).map(([what]) => what);
    if (bad.length) {
        console.error('❌ criteria-lint SELF-CHECK FAILED — the rules no longer do what they claim:');
        bad.forEach((b) => console.error('   • ' + b));
        process.exit(2);
    }
}
selfCheck();

// ══════════════════════════════════════════════════════════════════════════════════════════════
// RUN
// ══════════════════════════════════════════════════════════════════════════════════════════════

const { blocks: walkBlocks, unscanned } = collectWalkBlocks();
const mdBlocks = collectMarkdownBlocks();
const allBlocks = walkBlocks.concat(mdBlocks);

const failures = [];
allBlocks.forEach((b) => lintBlock(b, failures));

const nWalk = walkBlocks.reduce((n, b) => n + b.criteria.length, 0);
const nMd = mdBlocks.reduce((n, b) => n + b.criteria.length, 0);

// A scanner that has gone blind must fail LOUD, not pass quietly (v7.20.336 lesson).
const blind = [];
if (walkBlocks.length < 15) {
    blind.push(`the walk scan found only ${walkBlocks.length} tick-list block(s) — it used to see 16 `
        + '(10 Step-3 asks + 6 Step-4 beats). '
        + 'A step declaration changed shape and this gate is no longer looking at the product.');
}
if (mdBlocks.length < 5) {
    blind.push(`the markdown scan found only ${mdBlocks.length} criteria block(s) — add the new `
        + 'heading shape to HEADING_FORMS, or the bullets a walk lifts from are unlinted.');
}

if (JSON_OUT) {
    process.stdout.write(JSON.stringify({
        totals: {
            blocks: allBlocks.length, walkBlocks: walkBlocks.length, mdBlocks: mdBlocks.length,
            criteria: nWalk + nMd, walkCriteria: nWalk, mdCriteria: nMd,
            failures: failures.length,
        },
        blocks: allBlocks.map((b) => ({
            source: b.source, file: b.file, line: b.line, label: b.label,
            criteria: b.criteria, bullets: b.bullets,
        })),
        failures,
        unscanned,
        blind,
    }, null, 2));
    process.exit(failures.length || blind.length || unscanned.length ? 1 : 0);
}

console.log('SELF-ASSESSMENT CRITERIA — every tick a student can read on its own');
console.log(`   ${walkBlocks.length} walk tick-list(s) · ${mdBlocks.length} markdown criteria block(s)`);
console.log(`   ${nWalk} walk criteria · ${nMd} markdown criteria · ${nWalk + nMd} total\n`);

blind.forEach((b) => console.error('  ❌ SCANNER BLIND — ' + b));
unscanned.forEach((u) => console.error(
    `  ❌ UNSCANNED  ${u.file}:${u.line}  a criteria[] of strings sits outside any { fid: … } step `
    + 'entry, so this lint never saw it. Give the step a fid, or teach collectWalkBlocks() the new shape.'));

if (!QUIET) {
    const byRule = {};
    failures.forEach((f) => { (byRule[f.rule] = byRule[f.rule] || []).push(f); });
    Object.keys(byRule).sort().forEach((rule) => {
        console.log(`\n── ${rule} (${byRule[rule].length}) ─────────────────────────────────────────`);
        byRule[rule].forEach((f) => {
            console.log(`  ❌ ${f.file}:${f.line}  [${f.block}]`);
            console.log(`     criterion : "${f.criterion}"`);
            console.log(`     rule      : ${rule} — ${f.why}`);
            if (f.bullet) console.log(`     source    : "${f.bullet}"`);
        });
    });
}

console.log('');
const ruleCounts = {};
failures.forEach((f) => { ruleCounts[f.rule] = (ruleCounts[f.rule] || 0) + 1; });
Object.keys(ruleCounts).sort().forEach((r) => console.log(`   ${r.padEnd(11)} ${ruleCounts[r]}`));

if (failures.length || blind.length || unscanned.length) {
    console.error(`\n❌ criteria-lint FAILED — ${failures.length} criterion failure(s) across `
        + `${new Set(failures.map((f) => f.block)).size} block(s).`);
    console.error('   A criterion is read DETACHED from the teaching that produced it. If it does not '
        + 'stand alone there, it asks a fourteen-year-old to certify nothing.');
    process.exit(1);
}
console.log('✅ criteria-lint passed (every criterion stands on its own).');
