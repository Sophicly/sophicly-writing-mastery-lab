#!/usr/bin/env bash
# v7.19.899 (Neil): mechanical pre-ship gate — the senior-dev safety net that does NOT rely on
# anyone remembering a rule. Runs on the files STAGED for commit (or `--all`):
#   • JS  → node --check (syntax) + eslint no-undef (scope: catches out-of-scope refs like the
#           .898 sendCanvasMessage crash that node --check sailed straight past).
#   • PHP → php -l (syntax) + brace-count parity.
# Exit non-zero on any failure so the deploy script / pre-commit hook can BLOCK on it.
#
# Wire-in (both are the enforcement, not this file's existence):
#   1. git hook:   ln -sf ../../bin/pre-ship-check.sh .git/hooks/pre-commit
#   2. deploy gate: deploy-staging.sh / deploy-production.sh call this before rsync.
#
# NOTE: this is layer 1 (static). Layer 2 is RUN THE FLOW (drive the change, /verify) — a syntax
# +scope-clean file can still be logically wrong. No gate replaces exercising the path once.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

# Portable file collection — macOS ships bash 3.2 which has no `mapfile` (v7.19.900 fix).
FILES=()
if [ "${1:-}" = "--all" ]; then
  while IFS= read -r line; do [ -n "$line" ] && FILES+=("$line"); done \
    < <(git ls-files '*.js' '*.php' | grep -v -E 'wml-tiptap.min.js|\.min\.js')
else
  while IFS= read -r line; do [ -n "$line" ] && FILES+=("$line"); done \
    < <(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|php)$' | grep -v -E 'wml-tiptap.min.js|\.min\.js')
fi

# ⚠️ v7.20.372 — A CSS-ONLY CHANGE USED TO SKIP THIS ENTIRE GATE. The collection above is JS/PHP
# only, so a stylesheet edit staged on its own hit the early exit and NOTHING ran. That is half of
# how .371 shipped a stylesheet whose comment closed early, leaving six lines of English prose as
# raw CSS tokens — the parser resyncs by discarding, so it ate the rules after it and Neil opened
# Step 6 to an unstyled dynamic island. CSS now owes an answer whether or not any JS is staged.
CSS_STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -cE '\.css$' || true)
if [ ${#FILES[@]} -eq 0 ]; then
  if [ "${CSS_STAGED:-0}" -eq 0 ]; then
    echo "pre-ship: no JS/PHP/CSS staged — nothing to check."; exit 0
  fi
  node bin/css-lint.js || { echo ""; echo "pre-ship gate FAILED — fix before shipping."; exit 1; }
  echo "pre-ship gate passed (CSS only)."
  exit 0
fi

fail=0
for f in "${FILES[@]}"; do
  [ -f "$f" ] || continue
  case "$f" in
    *.js)
      node --check "$f" || { echo "❌ node --check: $f"; fail=1; }
      # eslint no-undef — the scope gate. npx pins eslint@8 (uses .eslintrc.json).
      out=$(npx --yes eslint@8 "$f" 2>/dev/null | grep -E 'no-undef')
      if [ -n "$out" ]; then echo "❌ eslint no-undef (out-of-scope reference) in $f:"; echo "$out"; fail=1; fi
      ;;
    *.php)
      if php -l "$f" >/dev/null; then
        # php -l is authoritative for syntax. Raw brace counting double-fires on
        # braces inside string literals ("{$var}", JSON) — v7.19.915: warn-only
        # when php -l passed, hard-fail only when php -l itself is unavailable/broken.
        o=$(grep -o '{' "$f" | wc -l); c=$(grep -o '}' "$f" | wc -l)
        [ "$o" -ne "$c" ] && echo "⚠️  brace count differs in $f (open=$o close=$c) — php -l clean, likely braces in strings."
      else
        echo "❌ php -l: $f"; fail=1
      fi
      ;;
  esac
done

# v7.20.128: the technique index is GENERATED from protocols/shared/reference/table-of-techniques.md.
# If the table moves and the index is not regenerated, the outline's technique picker silently ships
# a vocabulary that has forked from the taught one — invisible to node --check. Runs whenever the
# table or the index is staged (or on --all).
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'table-of-techniques\.md|wml-techniques-index\.js'; then
  node bin/build-techniques-index.js --check || fail=1
fi

# v7.20.129: the outline-row completion RULE (WML.outlineRow in wml-core.js) is called by all
# three consumers — the row nodeView, the checkSectionComplete DOM reader, and the section
# nodeView. It used to be three hand-copies that drifted. The harness proves single-control rows
# stay byte-identical to v7.20.128 (an equivalence sweep against the OLD rule as an oracle, over
# every real criterion) and that multi-control state stays namespaced by control id — a flat
# `checked` array on a multi row is the key-mismatch bug class and the harness fails on it.
# Invisible to node --check: every mutation tested here is syntactically perfect.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-core\.js|wml-assessment\.js|wml-section-block\.js|outline-rule-harness\.js'; then
  node bin/outline-rule-harness.js || fail=1
fi

# v7.20.195: PLANNING KEY-MATCH. The #1 recurring bug is write-key ≠ read-key — a planning protocol
# @FIELD_COMMIT that no render box receives (the plan "saves but nothing appears"; Q5 Methodology
# shipped exactly this). This gate renders the REAL outline builders and diffs their fieldIds against
# each codified planning protocol's outline tags: 0 orphan writes, 0 un-allow-listed blank boxes.
# Runs when the render or any codified planning protocol or the harness is staged.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|protocols/.*/planning/.*\.md|planning-keymatch-harness\.js'; then
  node bin/planning-keymatch-harness.js || fail=1
fi

# v7.20.223: PLAN⇄OUTLINE FAN-OUT (Neil's reliability ask). Every planning protocol's literal
# @FIELD_SET plan templates run through the REAL SLICED engine mapping (_planOutlineTargets +
# _planLabelElement); every generated outline id must be a real @FIELD_COMMIT id in that protocol,
# every label must map. Unconverted protocols (no plan @FIELD_SETs) are skipped and start being
# enforced the moment their conversion ships. Negative-proven (label typo → UNMAPPED, exit 1).
# Runs when the engine, any planning protocol, or the harness is staged.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|protocols/.*/planning/.*\.md|plan-fanout-harness\.js'; then
  node bin/plan-fanout-harness.js || fail=1
fi

# v7.20.252 (Fable F1): the JS build-stamp (frontend/wml-core.js WML_BUILD, logged on load for
# stale-client diagnosis) must equal the plugin version, or the console log lies about freshness.
JS_BUILD=$(grep -oE "var WML_BUILD = '[^']+'" frontend/wml-core.js 2>/dev/null | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")
PHP_VER=$(grep -oE "SWML_VERSION', '[^']+'" sophicly-writing-mastery-lab.php 2>/dev/null | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")
if [ -n "$JS_BUILD" ] && [ -n "$PHP_VER" ] && [ "$JS_BUILD" != "$PHP_VER" ]; then
  echo "❌ WML_BUILD ($JS_BUILD) != SWML_VERSION ($PHP_VER) — bump wml-core.js WML_BUILD to match."; fail=1
fi

# v7.20.250 Piece 2: SCRIPTED-SEQUENCE PORT gate. Every `plain:` in the SEQUENCES teaching player
# must be byte-verbatim in its source protocol module (CLAUDE.md #13 — no drift, no dropped chunk).
# Runs when the engine, a poetry planning protocol, or the harness is staged.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|protocols/aqa/poetry/planning/.*\.md|seq-port-harness\.js'; then
  node bin/seq-port-harness.js || fail=1
fi

# v7.20.204: C-LADDER B-CHECKS. The universal contingent-scaffolding ladder reduces to three
# invariants (regime split · method-not-content · wrong=falsifiable). This gate asserts their
# canonical literal lines survive in PROTOCOL-STANDARD.md (contract can't silently erode) and checks
# every ladder-enabled planning protocol for them (dormant until the P3 retrofit opts protocols in).
# Runs when the standard, any planning protocol, or the harness is staged.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'PROTOCOL-STANDARD\.md|protocols/.*/planning/.*\.md|ladder-check-harness\.js'; then
  node bin/ladder-check-harness.js || fail=1
fi

# v7.20.206: C-LADDER SIMULATION (behavioural evals — WWAD). Drives the REAL sliced engine
# through scripted sessions: climb/cap/fade/pace/IDK-gate/resume/self-heals/wallet/pre-check.
# The static ladder-check guards the CONTRACT text; this guards the MACHINE's behaviour.
# Runs when the engine or the harness is staged.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|ladder-sim-harness\.js'; then
  node bin/ladder-sim-harness.js || fail=1
fi

# v7.20.296: CW STEP-6 OUTLINE WALK GATE. The walk and the doc builder must agree on every one of
# 801 row ids (§5d key-match, §5e granularity), the technique chips must name symbols the DEPLOYED
# table actually carries, the guide deep-links must resolve, and the concept map must cover the rows
# it claims to. All four are invisible failures at runtime — a lost answer, an empty card panel, a
# dead help button, an ask with no example — so they are checked mechanically, not remembered.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|wml-cw6-concepts\.js|cw6-outline-harness\.js|cw6-prod-technique-symbols\.txt'; then
  node bin/cw6-outline-harness.js || fail=1
  # Layer 2 (pre-ship 0b, RUN THE FLOW): drives the REAL sliced _cwOutlineCtl through a full ~100-ask
  # run of all eight archetypes, every resume position, both fail-open paths and the GAP revision —
  # and holds the API budget at 6 round-trips. Neil cannot hand-test 800 taps; the machine can.
  node bin/cw6-sim-harness.js || fail=1
  # v7.20.391 — CONCEPT REACHABILITY. `conceptFor()` picks the beat's concept by regex, and a
  # concept becomes UNREACHABLE the moment a broader one contains its phrase (/opening image/
  # swallowed "expand on the opening image"). The student is then served the WRONG beat's
  # criteria, examples, technique chips and guidance anchor — silently, because a wrong concept
  # renders exactly like a right one. Two of 70 were dead before this gate existed. CLAUDE.md §5d.
  node bin/cw6-concept-lint.js || fail=1
  # v7.20.400 — THE GREETING'S LIVE VALUE. `[SWML_LIVE:cw.plotStructure]` is resolved by a SYNC
  # getter; both of its sources were WARM-ONLY, so on a cold entry (the normal case) it could only
  # ever miss and the student read "your chosen plot structure". Worse, when the Step-5 pick and the
  # BUILT doc disagreed it named the pick — i.e. a structure the outline is not built from. Nothing
  # errors either way: a live value degrades to a true-but-vaguer phrase, which is correct §4d
  # behaviour and therefore invisible. Slices the real getter, so it cannot drift from it.
  node bin/cw6-livevalue-harness.js || fail=1
fi

# v7.20.404 — THE THEME TOGGLE, ONE STORE AND ONE WRITER (FIXLIST #183). Neil: "we've actually
# solved that problem several times before… solve it once and for all." It kept returning because
# the two halves were fixed months apart: v7.19.228/.229 taught the canvas toggle to persist into
# the private `swml-theme-manual` key, and v7.20.13 then retired that key on the READ side without
# touching the write. The canvas toggle became the only writer that never wrote the store the app
# reads, so a click flipped the theme and the next DOM mutation reverted it — one frame later,
# with no error. Runs on EVERY change, not just CW ones: the regression was a cross-file drift and
# either side can reintroduce it.
node bin/theme-writer-harness.js || fail=1

# v7.20.297: CW STEP-5 STRUCTURE WALK GATE. Step 5 shipped to prod filing NOTHING — the protocol had
# no filing marker, so nine document rows stayed empty through a whole session while the model told
# the student it had saved. Nothing errored, so nothing caught it. The gate that would have: drive the
# real walk and assert every row holds the student's words. Also holds the ONE-API-call budget, the
# eight label→key resolutions (the v7.19.438 silent-fallback bug) and the Step-6 structure carry.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|cw5-sim-harness\.js'; then
  node bin/cw5-sim-harness.js || fail=1
fi

# v7.20.312: CW STEP-1 LOOP GATE. Rifat (uid 1386) produced 1,765 turns / 1.4 MB of chat in ONE
# session with no student input: the walk handed off to the API, the v7.20.298 revive block treated
# that hand-off as a dead walk needing rescue, resurrected it, and the walk then ate its own
# hand-off as the student's answer — forever. Every gate was green because none of them drove
# Step 1. This one does, with negative controls that prove the loop returns if either guard is
# removed (a regression test that cannot fail is not a test).
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|cw1-loop-harness\.js'; then
  node bin/cw1-loop-harness.js || fail=1
fi

# v7.20.319: RAIL PANEL GATE. Neil could not resize ANY rail panel. The v7.20.317 intrinsic width
# band (max-width:380px) beat the inline width every resize handler wrote, so the drag ran perfectly
# and the browser discarded the result — no error, no warning, invisible to node --check and to
# eslint alike, because a CSS-vs-JS clamp is not a code defect in either file. Separately, the .318
# port of Previous Assessments copied the shared CSS but not the interaction, so that panel had no
# handles and no detach button at all. This drives the REAL _wireRailPanel against a fake DOM and
# also asserts that all four panels route through it — a fifth panel that hand-rolls its own copy,
# or a CSS rule that hides a handle the JS accepts, fails here instead of in front of a student.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|wml-canvas\.css|rail-panel-harness\.js'; then
  node bin/rail-panel-harness.js || fail=1
fi

# v7.20.322: CW KEY-SHAPE GATE (first half of the ghost-call/key-shape harness Neil approved).
# Root CLAUDE.md §5d: a write-key that does not match a read-key is the number-one recurring
# Sophicly defect, and it is SILENT — "it saved fine but nothing appears". This asserts that every
# CW document field id a walk writes, reads, or declares in its step table has a row that actually
# creates it, in BOTH the baked template (new projects) and an on-load heal (existing ones).
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|cw-keymatch-harness\.js'; then
  node bin/cw-keymatch-harness.js || fail=1
fi

# v7.20.325: CW STEP-3 BUDGET GATE. Step 3 spent ten API calls — one per ask, purely to judge "is
# this good enough yet". It now spends TWO (one over all seven components together, one over the
# three loglines) and files every answer verbatim with no round-trip. This asserts the budget, that
# the filing survived the rewrite, and that the review stays actionable without another call.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|cw3-batch-harness\.js'; then
  node bin/cw3-batch-harness.js || fail=1
fi

# v7.20.334: CW STEP-2 WALK-INVARIANT GATE. Step 2 lost its per-idea API call when it moved to the
# batched check, and that call was quietly doing THREE jobs: judging the idea, rejecting a
# non-answer, and answering a student who asked a question instead. Only the first was replaced
# by design; the answer slot and the [🤔 Ask Sophia] rung cover the other two, and this asserts
# all three — plus that the resource-GATED opener actually reaches its ask.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|cw2-sim-harness\.js|walk-sim-lib\.js'; then
  node bin/cw2-sim-harness.js || fail=1
fi

# v7.20.327: CW STEP-3 WALK-INVARIANT GATE. The behavioural twin of cw3-batch-harness (which is
# static). Drives the real _cwLoglineCtl and asserts the same invariants as the Step-4 sim, from
# the same rig (bin/walk-sim-lib.js) so the two cannot drift.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|cw3-sim-harness\.js|walk-sim-lib\.js'; then
  node bin/cw3-sim-harness.js || fail=1
fi

# v7.20.327: CW STEP-4 WALK-INVARIANT GATE. Step 3 reached a live lesson with the `▶ Let's go`
# launch chip filed into a student's Protagonist row and asks served in "first empty row" order.
# Nothing caught it because every CW harness asserted the walk's SHAPE and none DROVE it turn by
# turn. This drives the real _cwSpineCtl and asserts the invariants that hold for EVERY code-owned
# walk: nothing is written unless an ask was served; an answer lands in the field of the ask that
# requested it (even when the student edits the document in between); asks come in declared order;
# a chip pick files to its own field; a rewrite replaces; a reload never loses a turn.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|cw4-sim-harness\.js|walk-sim-lib\.js'; then
  node bin/cw4-sim-harness.js || fail=1
fi

# v7.20.290: WALK STOP-RULE GATE. A code-owned walk means CODE serves every ask; if the protocol
# does not order the model to END its reply at the verdict signal, the model invents the next ask
# and the student sees TWO competing questions (Neil's live catch: Step 4 doubled every beat from 2
# on, under two different beat numberings — CW-STEP-03 carried the rule, CW-STEP-04 never got it).
# Any CW protocol emitting a verdict signal MUST carry the stop rule. Runs when a CW protocol is
# staged (or --all), so Steps 5/6 cannot ship the same gap.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'protocols/shared/creative-writing/CW-STEP-.*\.md'; then
  _cwdir="protocols/shared/creative-writing"
  for _f in "$_cwdir"/CW-STEP-*.md; do
    [ -e "$_f" ] || continue
    if grep -qE '@[A-Z0-9_]+_OK' "$_f" && ! grep -qE 'reply ENDS there' "$_f"; then
      echo "❌ walk stop-rule MISSING in $_f — a protocol with a verdict signal must tell the model"
      echo "   its reply ENDS at that signal and it must never introduce/preview/number the next ask."
      fail=1
    fi
  done
  [ "$fail" = "1" ] || echo "✅ walk stop-rule gate passed (every CW verdict-signal protocol ends its reply at the signal)."
fi

# KNOWN-CONTEXT LINT (WML CLAUDE.md #3 — the paste-wall law). A CONVERTED planning protocol must
# never re-ask the student for context the session already holds (poem/text/question). Hard-fails
# only for converted lanes; unconverted boards WARN (tracked debt). Runs when any planning protocol
# or the lint itself is staged (or --all).
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'protocols/.*/planning/.*\.md|known-context-lint\.js'; then
  node bin/known-context-lint.js || fail=1
fi

# FOSSIL LINT (v7.20.351 — Neil: "why are we still getting fossils… get rid of it at its root").
# A turn PUSHED into chat history must never bake a MUTABLE value into its text: replay is
# verbatim, so the stored sentence keeps asserting the old value for ever (the Step 6 greeting
# announced "Rags to Riches" for five days after the student re-picked). Whole-repo by nature —
# the frontend is three files and the trace is cheap, so it runs on every invocation.
node bin/fossil-lint.js || fail=1

# CSS has NO fatal errors — a parse failure is recovered by discarding tokens until something looks
# like a rule again, so a broken stylesheet renders as a subtly (or wildly) wrong page rather than
# an error anyone sees. `node --check`/`php -l` were the only syntax gates here and both are blind
# to 6,000+ lines of the UI. Whole-repo and instant, like fossil-lint. (v7.20.372)
node bin/css-lint.js || fail=1

# v7.20.394 — a RETIRED surface colour written as rgba() is invisible to the hex sweep that
# retires it. That has now bitten three times on one palette (.swml-extract-panel, the rail shell,
# and --swml-tb-fade-0 — the last of which was missed by the person writing the warning about it).
# On its first run it also found .swml-comment-modal still painting #28292b, retired four moves ago.
node bin/palette-lint.js || fail=1


if [ "$fail" -ne 0 ]; then
  echo ""
  echo "pre-ship gate FAILED — fix before shipping (do NOT --no-verify past it)."
  exit 1
fi
echo "✅ pre-ship gate passed (${#FILES[@]} file(s))."
