#!/usr/bin/env bash
# v7.20.49 (D7 — brief §12/§13): gold-shape drift checker.
#
# Single-source rule: each assessment gold file carries ONE
#   <!-- @GOLD_SHAPE: <shape text> -->
# header. Any protocol that cites a gold carries
#   @GOLD_REF: <gold-file> @GOLD_SHAPE: <shape text>
# where <shape text> must be a BYTE-COPY of the gold's header. This script diffs
# every citation against its source and exits non-zero on any mismatch, missing
# source header, or unresolvable gold file — so planning can never silently teach
# toward a gold that assessment has moved (the Q2-staleness class, D7).
#
# Wire-in: run beside bin/pre-ship-check.sh before any protocol/gold commit.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

fail=0
checked=0

# Every protocol markdown that carries @GOLD_REF citations.
while IFS= read -r proto; do
  while IFS= read -r line; do
    file=$(printf '%s' "$line" | sed -E 's/^.*@GOLD_REF:[[:space:]]*([^[:space:]]+).*$/\1/')
    cite=$(printf '%s' "$line" | sed -E 's/^.*@GOLD_SHAPE:[[:space:]]*//; s/[[:space:]]*$//')
    if [ -z "$file" ] || [ -z "$cite" ]; then
      echo "❌ $proto: malformed @GOLD_REF line: $line"
      fail=1
      continue
    fi
    # Resolve the gold file: same dir tree as the citing protocol first, then repo-wide.
    src=$(find "$(dirname "$proto")/.." -name "$file" 2>/dev/null | head -1)
    [ -z "$src" ] && src=$(find protocols -name "$file" 2>/dev/null | head -1)
    if [ -z "$src" ]; then
      echo "❌ $proto: cited gold file not found: $file"
      fail=1
      continue
    fi
    shape=$(grep -m1 '@GOLD_SHAPE:' "$src" | sed -E 's/^.*@GOLD_SHAPE:[[:space:]]*//; s/[[:space:]]*-->[[:space:]]*$//; s/[[:space:]]*$//')
    if [ -z "$shape" ]; then
      echo "❌ $src: no @GOLD_SHAPE header (cited by $proto)"
      fail=1
      continue
    fi
    if [ "$cite" != "$shape" ]; then
      echo "❌ SHAPE DRIFT — $proto cites $file but the texts differ:"
      echo "   citation: $cite"
      echo "   source:   $shape"
      fail=1
    else
      checked=$((checked + 1))
    fi
  done < <(grep -h '@GOLD_REF:.*@GOLD_SHAPE:' "$proto")
done < <(grep -rl '@GOLD_REF:.*@GOLD_SHAPE:' protocols --include='*.md')

if [ "$fail" -eq 0 ]; then
  echo "✅ gold-shape check: $checked citation(s) byte-match their source golds."
else
  echo "gold-shape check FAILED — a gold's shape and its citing protocol must change in the same commit."
fi
exit $fail
