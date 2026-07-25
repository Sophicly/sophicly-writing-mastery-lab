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

[ ${#FILES[@]} -eq 0 ] && { echo "pre-ship: no JS/PHP staged — nothing to check."; exit 0; }

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
fi

# v7.20.297: CW STEP-5 STRUCTURE WALK GATE. Step 5 shipped to prod filing NOTHING — the protocol had
# no filing marker, so nine document rows stayed empty through a whole session while the model told
# the student it had saved. Nothing errored, so nothing caught it. The gate that would have: drive the
# real walk and assert every row holds the student's words. Also holds the ONE-API-call budget, the
# eight label→key resolutions (the v7.19.438 silent-fallback bug) and the Step-6 structure carry.
if [ "${1:-}" = "--all" ] || git diff --cached --name-only --diff-filter=ACM 2>/dev/null \
     | grep -qE 'wml-assessment\.js|cw5-sim-harness\.js'; then
  node bin/cw5-sim-harness.js || fail=1
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

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "pre-ship gate FAILED — fix before shipping (do NOT --no-verify past it)."
  exit 1
fi
echo "✅ pre-ship gate passed (${#FILES[@]} file(s))."
