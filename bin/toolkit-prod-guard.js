#!/usr/bin/env node
/* eslint-env node */
// toolkit-prod-guard.js — v7.20.799 (#851). Run by deploy-production.sh BEFORE anything ships.
//
// WML draws a "Learn: …" chip for every Mastery Toolkit section in RESOURCE_TOOLKIT_IDS. The Toolkit itself
// belongs to the notes plugin, a different lane with its own release. If WML reaches production with an id the
// LIVE notes bundle does not have, the chip still draws — and clicking it does nothing (tkNavigate only
// console.warns). bin/toolkit-link-gate.js cannot catch that: it checks the LOCAL bundle, which is ahead of prod
// exactly when this goes wrong. The first case: the "Polishing Your Answer" page (notes 2.6.274) was on staging,
// waiting for Neil's go in the notes chat, while WML's "Polish" comment was ready to link to it.
//
// Input (stdin): the production bundle's ids, as `grep -o 'id:"…"'` prints them — the SAME loose match as
// bin/toolkit-link-gate.js (some sections are `id:"x",goto:"y",t:…`, so `id:…,t:` would miss them).
// Exit 0 = every id resolves · 1 = some id is missing (listed) · 2 = no sections read (UNVERIFIED is not a pass).
const fs = require('fs');
const path = require('path');
const core = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'wml-core.js'), 'utf8');
const m = core.match(/const RESOURCE_TOOLKIT_IDS = (\[[\s\S]*?\]);/);
if (!m) { console.log('RESOURCE_TOOLKIT_IDS not found in wml-core.js'); process.exit(2); }
const ids = [...m[1].matchAll(/'([a-z0-9-]+)'/g)].map(x => x[1]);
const prod = new Set([...fs.readFileSync(0, 'utf8').matchAll(/id:"([a-z0-9-]+)"/g)].map(x => x[1]));
if (prod.size < 30) { console.log('read only ' + prod.size + ' section(s) from the production Toolkit — cannot verify'); process.exit(2); }
// tkNavigate's own rule: 'fix-' + slug first, then the slug itself.
const missing = ids.filter(id => !prod.has('fix-' + id) && !prod.has(id));
if (missing.length) { console.log(missing.join(' ')); process.exit(1); }
console.log('all ' + ids.length + ' linked Toolkit sections are in the production bundle (' + prod.size + ' sections)');
process.exit(0);
