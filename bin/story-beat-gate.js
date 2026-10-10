#!/usr/bin/env node
/* eslint-env node */
// story-beat-gate.js — v7.20.808 (FIXLIST #861 A/B; Neil's card 12, PEDAGOGY §51.10).
//
// The seven creative-writing scene beats (Hook · Setup · Reaction · Epiphany · Proaction · Climax ·
// Denouement) used to be asked as bare questions. Each beat ask now carries, in order (WML CLAUDE.md §4c):
// criteria ("A strong …") → ONE worked example from a different, well-known story → the Table of
// Techniques button(s) → the question LAST → the row's @FIELD_COMMIT. This gate holds that shape and the
// two things a reviewer cannot see by eye:
//   • every example QUOTATION is word-for-word on the live Table of Techniques card (the card the button
//     opens), so a quotation can never be misremembered into the protocol (root CLAUDE.md §5c-i);
//   • every button names a card WML can resolve (protocols/shared/reference/table-of-techniques.md is the
//     name list get_technique_names() serves) — an unresolvable name is silently DROPPED in the chat.
// Plus the AQA Paper 1 "opening" task: planning, marking card and polishing rubric all carry it.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m); };

// The live Table (sophicly-notes) — the card each button opens. Sibling repo on the same drive.
const LIVE = process.env.STORY_GATE_LIVE || path.resolve(ROOT, '../../../sophicly-plugins/sophicly-notes/assets/js/sophicly-techniques.js');   // env override = mutation tests only
let live = '';
try { live = fs.readFileSync(LIVE, 'utf8'); } catch (e) { /* reported below */ }
ok(live.length > 100000, `the live Table of Techniques is readable (${path.relative(ROOT, LIVE)}) — needed to check every example quotation`);

// The name list WML resolves chips through — the same parse as get_technique_names().
const TOT = read('protocols/shared/reference/table-of-techniques.md');
const NAMES = new Set();
for (const m of TOT.matchAll(/^###\s+(.+?)\s+`[^`]{1,4}`\s*$/gm)) NAMES.add(m[1]);

const BEATS = ['Hook', 'Setup', 'Reaction', 'Epiphany', 'Proaction', 'Climax', 'Denouement'];
const FILES = [
    { file: 'protocols/aqa/language1/planning/protocol-b-planning.md', q: 'Q5',
      from: '## 7. STAGE S6', to: '### Q5 progression gate', opening: true },
    { file: 'protocols/edexcel-igcse/language2/steps/b2-creative.md', q: 'Q2',
      from: '**Step 3 \\- The scene beats', to: '**Progression gate', opening: false },
];

for (const F of FILES) {
    const src = read(F.file);
    const a = src.indexOf(F.from), b = src.indexOf(F.to, a);
    ok(a >= 0 && b > a, `${F.file}: the scene-beat section is found`);
    if (a < 0 || b < 0) continue;
    const sec = src.slice(a, b);
    // split into beat blocks at "N. **Beat**"
    const heads = [...sec.matchAll(/^(\d)\. \*\*(Hook|Setup|Reaction|Epiphany|Proaction|Climax|Denouement)\*\*/gm)];
    ok(heads.map((h) => h[2]).join(',') === BEATS.join(','), `${F.file}: the seven beats, in the taught order (${heads.map((h) => h[2]).join(' · ')})`);
    heads.forEach((h, i) => {
        const block = sec.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : sec.length);
        const beat = h[2];
        const iCrit = block.indexOf('**A strong'), iEx = block.indexOf('**Example:**');
        const iChip = block.indexOf('@RESOURCE_LINK'), iAsk = block.indexOf('**Ask:**');
        const marker = `@FIELD_COMMIT{"field":"plan-scene-${F.q}-${beat.toLowerCase()}"}`;
        const iMark = block.lastIndexOf(marker);
        const order = iCrit > 0 && iEx > iCrit && iAsk > iEx && iMark > iAsk && (iChip < 0 || (iChip > iEx && iChip < iAsk));
        ok(order, `${F.file.split('/').slice(-2).join('/')} ${beat}: criteria → example → button → question → ${marker.slice(0, 40)}…`);
        ok((block.match(/@FIELD_COMMIT\{/g) || []).length === 1, `  ${beat}: exactly ONE row marker`);
        // quotations: every “…” inside an Example line is on the live Table, word for word
        const exLines = block.split('\n').map((l, k, arr) => l.includes('**Example:**') ? arr.slice(k, k + 4).join(' ') : '').filter(Boolean);
        const quotes = [];
        exLines.forEach((t) => { for (const m of t.replace(/\s+/g, ' ').matchAll(/“([^”]+)”/g)) quotes.push(m[1]); });
        ok(quotes.length >= 1, `  ${beat}: carries a worked example with a quotation (${quotes.length})`);
        quotes.forEach((q) => ok(live.includes(q), `  ${beat}: “${q.slice(0, 48)}${q.length > 48 ? '…' : ''}” is word for word on the live Table`));
        // buttons: each names a card WML resolves, label == arg
        for (const m of block.matchAll(/@RESOURCE_LINK(\{[^}]*\})/g)) {
            let j = null; try { j = JSON.parse(m[1]); } catch (e) { /* below */ }
            ok(!!j && j.dest === 'table' && NAMES.has(j.arg) && j.label === j.arg,
                `  ${beat}: button "${j && j.arg}" resolves in table-of-techniques.md (else the chat silently drops it)`);
        }
        if (beat === 'Proaction') ok(!/@RESOURCE_LINK\{/.test(block) && /Turning Point/.test(block),
            '  Proaction: no button until "Turning Point" is linkable (FIXLIST #863) — and the note says why');
    });
    ok(!/TBD by\s+ruling/.test(src), `${F.file}: no "TBD by ruling" left for the story beats`);
    if (F.opening) {
        ok(/\*\*\(b\) An "opening" task\*\*/.test(sec) && /@RESOURCE_LINK\{"dest":"table","arg":"Cliffhanger","label":"Cliffhanger"\}/.test(sec)
            && /Write the opening of a story about a human meeting\s+an animal/.test(sec),
            `${F.file}: the "opening" task plans an opening (2026 sample wording, Cliffhanger close)`);
        ok((src.match(/@FIELD_COMMIT\{"field":"/g) || []).length === 54, `${F.file}: @FIELD_COMMIT count unchanged at 54 (the file's own acceptance check)`);
    }
}

// The marking card and the polishing rubric judge an "opening" the same way.
const MARK = read('protocols/aqa/language1/modules/protocol-a-assessment.md');
ok(/\*\*An "opening" task\*\* \(the paper asks for "the opening of a story"/.test(MARK) && /never a mark cap on that basis/.test(MARK)
    && /For an "opening" task the gold\s+is that opening scene/.test(MARK),
    'AQA P1 marking: an opening is judged as a first scene (open close, coaching line, never a cap) and its gold ends open');
const RUB = read('protocols/shared/modules/rubrics/rubric-aqa-lang-p1-fiction.md');
ok(/\*\*An "opening" task\*\*/.test(RUB) && /Cliffhanger/.test(RUB), 'AQA P1 polishing rubric: the "opening" task note is present');

console.log((fail ? '❌ FAIL' : '✅ PASS') + ` — story-beat-gate: ${n} checks`);
process.exit(fail);
