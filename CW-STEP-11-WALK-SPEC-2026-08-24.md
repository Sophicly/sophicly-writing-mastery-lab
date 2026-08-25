# CW Step 11 (Character Profile) — needs a WALK + the arc row goes control-only

**Neil, 2026-08-24 (verbatim, dictated while testing Trial 1 v7.20.556):**

> "Step eleven, that needs a walk. So currently, it uses a diagnostic environment, which is
> basically a very bare environment. Now I think we were originally gonna go down that path, but I
> think it's better if it has a walk instead. It can probably just be a programmatic walk. You know
> the… where it says character arc. Which type of character arc? I don't think we need the double
> column. They don't need to explain it. They just need to choose. It needs to be similar in
> styling to how we did the drop down for when the student chose the plot structure."

Two work items, one slice (they touch the same doc):

## 1. The Character Arc row becomes CONTROL-ONLY

The current row (dropdown + a free-text explanation column he doesn't want — "they don't need to
explain it, they just need to choose"). **His DOM paste of the CURRENT element** (from the live
staging page, 2026-08-24 — note the page URL slug is `step-10-character-profile` while the sidebar
says Step 11; the fieldId is `cw-step-10-arc-type`, pre-renumber legacy):

```html
<div data-section-type="plan" data-section-label="Character Arc" data-editable="true" class="swml-section-block swml-section-plan swml-collapsible" data-section-complete="false" data-collapse-key="swml_fbcollapse:/courses/creative-writing-masterclass/units/draft-2-character-arc/lessons/step-10-character-profile/:Character Arc" data-section-num="4.1. " style="border-left-color: rgba(77, 118, 253, 0.5) !important;"><div class="swml-ana-strip swml-strip-collapsed-only" data-strip="Character Arc" data-strip-teaser="1" contenteditable="false" style="display: none;"></div><div class="swml-ctl-row" contenteditable="false" style="display: none;"></div><div class="swml-section-content"><h3>Which Type of Character Arc?</h3><div class="swml-outline-row" data-outline-row="true" data-field-id="cw-step-10-arc-type" style="min-height: 77px;"><div class="swml-outline-criteria" contenteditable="false"><span class="swml-outline-criterion-label">Arc Type</span><div class="swml-outline-ctl" data-ctl-id="arc-type" data-ctl-type="dropdown" data-ctl-done="0"><select class="swml-outline-select"><option value="" disabled="">Choose one…</option><option value="Positive (weakling to hero, ignorance to knowledge, etc.)">Positive (weakling to hero, ignorance to knowledge, etc.)</option><option value="Negative (good to bad, strong to weak, etc.)">Negative (good to bad, strong to weak, etc.)</option><option value="Ambiguous Positive">Ambiguous Positive</option><option value="Ambiguous Negative">Ambiguous Negative</option></select></div></div><div class="swml-outline-input" data-prompt="Choose the type of character arc"><br class="ProseMirror-trailingBreak"></div></div></div><button type="button" class="swml-fb-toggle" contenteditable="false" aria-label="Collapse or expand" data-tooltip="Collapse / expand"><span class="swml-fb-chevron" aria-hidden="true"></span></button></div>
```

**His DOM paste of the TARGET styling** — the Step-5 primary-archetype row (`controlonly`
variant: the dropdown IS the answer, the input div is a non-editable echo):

```html
<div class="swml-outline-row swml-outline-row-controlonly swml-row-complete" data-outline-row="true" data-field-id="cw-step-5-primary-archetype" style="min-height: 55px;"><div class="swml-outline-criteria" contenteditable="false"><span class="swml-outline-criterion-label">Your Primary Archetype</span><div class="swml-outline-ctl" data-ctl-id="archetype" data-ctl-type="dropdown" data-ctl-done="1"><select class="swml-outline-select swml-select-filled"><option value="" disabled="">Choose one…</option><option value="Hero’s Journey (Original)">Hero’s Journey (Original)</option><option value="Tragedy + Hero’s Journey">Tragedy + Hero’s Journey</option><option value="Rags to Riches + Hero’s Journey">Rags to Riches + Hero’s Journey</option><option value="Rebirth / Redemption + Hero’s Journey">Rebirth / Redemption + Hero’s Journey</option><option value="The Quest + Hero’s Journey">The Quest + Hero’s Journey</option><option value="Overcoming the Monster + Hero’s Journey">Overcoming the Monster + Hero’s Journey</option><option value="Voyage and Return + Hero’s Journey">Voyage and Return + Hero’s Journey</option><option value="Coming of Age + Hero’s Journey">Coming of Age + Hero’s Journey</option></select></div></div><div class="swml-outline-input swml-outline-controlonly swml-input-filled" data-prompt="Your Primary Archetype" contenteditable="false">Rebirth and Redemption</div></div>
```

So: find where the Step-5 template emits its `controlonly` row (grep
`swml-outline-row-controlonly` / `cw-step-5-primary-archetype` in wml-assessment.js), and make the
arc-type row use the SAME mechanism — copy it, don't re-derive (root §13). Baked docs need the
usual on-load heal (reference_wml_outline_scaffold_baked_needs_onload_heal).

## 2. The walk itself

- **Programmatic** (his call — §4 programmatic-first): a code-served walk in the `_cwXxxCtl` mold.
  Nearest molds: `_cwProfileCtl` (Step 1) / `_cwValuesCtl` — pick the nearest and copy the shape;
  the full contract is CLAUDE.md §4c (ask template, pacing, banking, fossil law, §4c.8b serial,
  §4c.9 help ladder, §4c.10 chat-points→document-scrolls) and every walk registers in
  `walk-sim-lib` so liveness is checked automatically.
- Step 11's current environment is the bare diagnostic one — the walk replaces that entry path
  the way Trial 1's did (all seven wiring points; the .490 dead-walk lesson — use the
  cw-trial1-gate §4 checklist as the crib).
- Read Step 11's doc template FIRST to derive the ask list (§14c full read; the sidebar in his
  screenshot shows Character Profile with sections incl. Character Arc).
- The arc question itself: choose-one dropdown (mutually exclusive alternatives → ONE screen,
  root §18 discriminator), NOT a serial walk of the four arc types.

## Status

✅ BUILT v7.20.563 (2026-08-25) — `_cwCharProfileCtl` + `migrateStep11ArcControlOnly` + `bin/cw11-sim-harness.js`. Originally: captured 2026-08-24 (FIXLIST #428), not built — queued behind the Trial-1 polish batch
(v7.20.557) because the session was near its end (Neil asked for a detailed handoff instead of a
new build).
