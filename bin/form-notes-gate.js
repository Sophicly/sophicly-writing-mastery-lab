#!/usr/bin/env node
/* eslint-env node */
/**
 * form-notes-gate.js — FIXLIST #816b (Neil, 9 Oct 2026, on the Ballad card of the Poetic Forms organiser):
 *   "a deep link into the table of techniques, or an explanation, or both. Maybe that's better" · "is it always iambic
 *   tetrameter and trimeter… dactylic… Charge of the Light Brigade?" · "the conceptual notes should refer back to those…
 *   how does that apply to this particular poem… how does it convey meaning".
 * Checks, against the SHIPPED files:
 *   (1) EXPLANATION — every technical term a form note uses is explained in plain words where it appears;
 *   (2) ACCURACY — the patterns that are only usual say so, and the named exceptions are present;
 *   (3) DEEP LINKS — every organiser form has its Table of Techniques cards (live symbols only), and the section
 *       NodeView builds the row once and firewalls it (the NodeView law);
 *   (4) THE CN FORM STEP — the form stance carries the student's own organiser notes, and the protocol starts from them.
 *   node bin/form-notes-gate.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
let fail = 0;
const ok = (c, m, got) => { if (!c) fail = 1; console.log((c ? '  ✅ ' : '  ❌ ') + m + (c || got === undefined ? '' : '   got: ' + JSON.stringify(got))); };
console.log('form-notes-gate — Poetic Forms notes: explained, accurate, linked, and used in the poem notes (#816b)');

// ── the notes, parsed exactly as the server parses them (SWML_Quiz_Bank::concept_notes_for) ──
const NOTES_SRC = read('protocols/shared/foundational-quiz/banks/poetic_forms.concept-notes.md');
const notes = {};
let cur = '';
NOTES_SRC.split(/\r\n|\r|\n/).forEach((ln) => {
    const h = /^###\s+(.+?)\s*$/.exec(ln);
    if (h) { cur = h[1].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); return; }
    const m = /^\s*-\s*\*\*(.+?):\*\*\s*(.+)$/.exec(ln);
    if (cur && m) {
        const slot = { definition: 'definition', features: 'features', effects: 'effects', 'form & meaning': 'meaning' }[m[1].toLowerCase().trim()];
        if (slot) { notes[cur] = notes[cur] || {}; notes[cur][slot] = m[2]; }
    }
});
const FORMS = Object.keys(notes);
ok(FORMS.length === 11 && FORMS.every((f) => ['definition', 'features', 'effects', 'meaning'].every((s) => notes[f][s])), 'eleven forms, four notes each, all parse the way the server parses them', FORMS);

// (1) every technical term is explained where it appears — [term, the explanation that must sit beside it]
const GLOSS = [
    [/\bquatrains?\b/i, /quatrains?(?: \(|, )four-line/i],
    [/\btetrameter\b/i, /four-beat line/i],
    [/\biamb(ic)?\b/i, /da-DUM|soft beat then a strong one/i],
    [/\brefrain\b/i, /refrain \(a line or chorus that repeats\)|the repetition \(the refrain\)/i],
    [/\bdactylic\b/i, /strong-soft-soft/i],
    [/\bblank verse\b/i, /blank verse \(unrhymed/i],
    [/\bin medias res\b/i, /in medias res \(in the middle of the action\)/i],
    [/\bdiction\b/i, /diction \(grand, formal word choices\)/i],
    [/\bapostrophe\b/i, /apostrophe \(speaking directly/i],
    [/\bvolta\b/i, /volta(, where| \(the turn\))/i],
    [/\boctave\b/i, /octave, eight lines/i],
    [/\bsestet\b/i, /sestet, six lines/i],
    [/\benjambment\b/i, /enjambment \(a sentence running on/i],
    [/\bcatharsis\b/i, /catharsis \(a release of strong feeling\)/i],
    [/\bstream of consciousness\b/i, /stream of consciousness \(thoughts written down/i],
    [/\bfigurative language\b/i, /figurative language \(images and comparisons/i],
    [/\bmetre\b/i, /metre \(no regular pattern of beats\)|ballad metre:|no single metre/i],
];
FORMS.forEach((f) => ['definition', 'features', 'effects', 'meaning'].forEach((s) => {
    const t = notes[f][s];
    GLOSS.forEach(([term, gloss]) => {
        if (term.test(t) && !GLOSS.some(([, g]) => g.test(t) && term.test(t) && g === gloss)) {
            // the term is used: its explanation must be in the SAME note, or in an earlier note of the same card
            const card = ['definition', 'features', 'effects', 'meaning'].slice(0, ['definition', 'features', 'effects', 'meaning'].indexOf(s) + 1).map((x) => notes[f][x]).join(' ');
            ok(gloss.test(card), f + '.' + s + ': "' + term.source + '" is explained where it is used (or earlier on the same card)', t.slice(0, 120));
        }
    });
}));

// (2) accuracy — Neil's question, answered: "usually", and the exceptions named
ok(/^Usually quatrains/.test(notes.ballad.features) && /Charge of the Light Brigade/.test(notes.ballad.features) && /dactylic dimeter/.test(notes.ballad.features)
    && /“Half a league, half a league”/.test(notes.ballad.features),
    '⭐ the ballad says "usually" and names the exception he asked about: "The Charge of the Light Brigade" is dactylic dimeter');
ok(/no single metre/.test(notes.epic.features) && /Paradise Lost/.test(notes.epic.features) && /used rhyme/.test(notes.epic.features),
    '⭐ the epic no longer says English epics are blank verse: Milton is, Spenser and Pope rhymed');
const BANK = read('protocols/shared/foundational-quiz/banks/poetic_forms.md');
ok(!/English epic tradition favours/.test(BANK) && /Light Brigade/.test(BANK), 'the quiz feedback says the same (epic corrected; the ballad\'s exception named)');
ok(/Half a league, half a league/.test(read('protocols/shared/foundational-quiz/banks/power_conflict_poetry.md')),
    '§5c-i: the quoted line is the poem\'s own (checked against the anthology bank on disk)');

// (3) deep links — live symbols only, every form with cards, the NodeView row firewalled
const CORE = read('frontend/wml-core.js');
const mi = CORE.indexOf('const POETIC_FORM_TECH_CARDS = {');
// eslint-disable-next-line no-eval
const CARDS = mi < 0 ? {} : eval('(' + CORE.slice(mi + 'const POETIC_FORM_TECH_CARDS = '.length, CORE.indexOf('\n    };', mi) + 6) + ')');
const ALLOW = new Set(read('bin/cw6-prod-technique-symbols.txt').split('\n').map((l) => l.trim()).filter((l) => l && l[0] !== '#'));
const withCards = FORMS.filter((f) => f !== 'hybrid_forms');
ok(withCards.every((f) => (CARDS[f] || []).length >= 1) && Object.keys(CARDS).every((k) => FORMS.indexOf(k) !== -1),
    'every organiser form (bar Hybrid Forms) has its Table of Techniques cards, keyed by the organiser\'s own slug', Object.keys(CARDS));
const syms = [].concat(...Object.values(CARDS).map((L) => L.map((x) => x.s)));
ok(syms.length && syms.every((s) => ALLOW.has(s)), 'every card is one the LIVE table carries (an unknown symbol opens an empty panel)', syms.filter((s) => !ALLOW.has(s)));
ok(['Ib', 'Tm', 'Ri', 'Dc', 'Rf'].every((s) => (CARDS.ballad || []).some((x) => x.s === s)), 'the Ballad card links iamb, tetrameter, trimeter, dactyl and refrain — the words he could not expect a student to know');
ok(/POETIC_FORM_TECH_CARDS,/.test(CORE), 'the map is exported on window.WML');
const SB = read('frontend/wml-section-block.js');
ok(/let _formSlug = '';[\s\S]{0,400}\/\^pf_\(\[a-z_\]\+\?\)_\(\?:definition\|features\|effects\|meaning\|notes\)\$\//.test(SB),
    'a form card is found by its CONTENT (a pf_{form}_* field), never by its label');
const tb0 = SB.indexOf('let techRow = null;'), tb1 = SB.indexOf('} catch (_) { techRow = null; }', tb0);
const TB = tb0 >= 0 && tb1 > tb0 ? SB.slice(tb0, tb1) : '';
const outside = (SB.slice(0, tb0) + SB.slice(tb1)).match(/techRow\.[a-zA-Z]+/g) || [];
ok(/dom\.appendChild\(techRow\);/.test(TB) && JSON.stringify(outside) === '["techRow.contains"]'
    && /if \(techRow && \(techRow === mutation\.target \|\| techRow\.contains\(mutation\.target\)\)\) return true;/.test(SB),
    '⭐ the row is built ONCE at construction and firewalled in ignoreMutation (no write after mount — the NodeView law)');
ok(/\.swml-section-block\.swml-fb-collapsed > \.swml-form-techs \{ display: none; \}/.test(read('frontend/wml-canvas.css')), 'the row hides with the collapsed card');

// (4) the poem's Form element starts from the student's own form notes
const A = read('frontend/wml-assessment.js');
ok(/if \(slug === 'form'\) \{\s*const fn = _cnFormNotesFor\(chosen\.id\);/.test(A) && /function _cnFormNotesFor\(formSlug\)/.test(A),
    '⭐ the form stance carries the student\'s OWN organiser notes for the form they picked');
const PN = read('protocols/shared/poetry/modules/conceptual-notes/pn-conceptual-notes.md');
ok(/\*\*Start from THEIR form notes/.test(PN) && /ask them to find it in THIS poem/.test(PN) && /what that feature does to the meaning here/.test(PN),
    '⭐ Element 3 (Form) starts from their notes, asks where it is in THIS poem, then what it does to the meaning');

console.log(fail ? '❌ form-notes-gate FAILED' : '✅ form-notes-gate');
process.exit(fail);
