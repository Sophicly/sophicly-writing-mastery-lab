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

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "pre-ship gate FAILED — fix before shipping (do NOT --no-verify past it)."
  exit 1
fi
echo "✅ pre-ship gate passed (${#FILES[@]} file(s))."
