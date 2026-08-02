# The full-screen theme toggle — the problem, the solution, and why it kept coming back

**Status: FIXED in v7.20.404 (staging + prod, 2026-08-02). Confirmed by Neil: *"full screen theme
toggle works now."*** Before changing anything in this area, read this file and run
`node bin/theme-writer-harness.js`.

---

## The symptom

In the WML canvas, go full screen, click the theme toggle. Nothing happens. Neil: *"the theme
toggle doesn't work. This is kind of frozen."*

Reported and fixed several times over months. It always came back.

---

## What was actually wrong

A **write-key ≠ read-key** drift — the single most recurring bug class in Sophicly (root CLAUDE.md
§5d). The two halves were fixed months apart, and **each fix was correct on the day it was made**:

1. **v7.19.228 / .229** — the canvas toggle was built to save the student's choice into a private
   key, `swml-theme-manual`. That was right: it is what `getTheme()` read at the time.
2. **v7.20.13** — the *read* side was rebuilt. The site-wide store `theme-preference`
   (sessionStorage, backed by a durable cookie) became the source of truth, and `toggleTheme()`
   was made to **delete** `swml-theme-manual`, so a stale private copy could never fight the
   site-wide toggle again.
3. **Nobody changed the canvas toggle's write.** It became the only writer in the whole app that
   never wrote the store the app reads.

Neither change was a mistake. The defect only exists in the *gap between them* — which is exactly
why re-reading either file on its own never revealed it.

## Why it looked frozen rather than merely wrong

The revert is a loop one frame wide, and nothing errors:

1. Click → the page flips to the new theme, and only the private key records it.
2. `themeObserver` (wml-core ~2295) fires on the very next DOM change — and the canvas is changing
   constantly — which calls `getTheme()`.
3. `getTheme()` reads the shared store, which still holds the **old** theme.
4. `applyTheme(old)` runs, sees the page disagreeing, and calls `window.themeToggle.setTheme(old)`,
   dragging the whole site back.

Flip and snap-back are about a frame apart, so the control reads as dead rather than wrong.

## Why it was always reported as a *full-screen* bug

Because full screen is the **only place that toggle is visible**. It is hidden whenever LearnDash's
own header toggle is on screen. The bug was in theme storage the entire time — full screen just
happens to be where you meet it. That misdirection is a large part of why it kept being "fixed"
without being fixed.

---

## The solution: one store, one writer

`toggleTheme()` already does every part of this correctly — writes the shared store and the durable
cookie, clears the retired private key, and drives LearnDash's own theme API through `applyTheme`
so its CSS variables flip too (which was the whole reason a separate embedded branch existed).

So **both branches now simply call `toggleTheme()`**, and the embedded/standalone split is gone.
Both `syncCanvasTheme` twins stopped re-writing the retired key — re-seeding it is how a value that
v7.20.13 deletes came back from the dead.

No third key. No new mechanism. One writer.

---

## The gate that stops it returning: `bin/theme-writer-harness.js`

Runs inside `bin/pre-ship-check.sh` on **every** change, not just canvas ones — the drift was
cross-file, and either side can reintroduce it. 14 assertions, pinned to both sides at once:

- `getTheme()` reads the shared store **before** any legacy key;
- `toggleTheme()` writes the shared store **and** retires the legacy key;
- ⭐ **nothing anywhere in the frontend persists `swml-theme-manual`** — this is the assertion that
  would have caught the regression the day it landed;
- the canvas toggle goes through the one writer and does not hand-roll page attributes;
- and behaviourally: drive the real `getTheme`/`toggleTheme` and prove a click **sticks**.

**Every assertion was proven by injecting the real defect and watching it go red**, then green on
restore.

⚠️ **The first version of this harness was fake and nearly shipped.** `getTheme()` opens with a
comment that names both stores in the correct order, so the check was reading the *prose* and stayed
green with the bug injected. It strips comments before measuring now. A check a comment can satisfy
is not a check.

---

## If it ever seems to come back

1. Run `node bin/theme-writer-harness.js` first. If it fails, the message names the exact drift.
2. If it passes and the toggle still misbehaves, the fault is **not** storage — look at whether the
   control is being rendered at all (it is deliberately hidden outside full screen when embedded).
3. Do not add a new storage key. Every recurrence of this bug so far has been a second writer.
