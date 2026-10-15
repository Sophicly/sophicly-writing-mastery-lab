#!/bin/bash
# build-min.sh — v7.20.905 (FIXLIST wml-cold-load, from Web Design 123).
#
# MEASURED on prod (Web Design 123, 15 Oct): a student's FIRST visit to a WML lesson took 14–16 s; wml-assessment.js alone
# was 5.7 MB decoded / 1.1 MB sent, and the cache key is the version, so every release puts every student back on that
# cold path. Minified (terser 5.31.6, -c -m --keep-fnames): wml-assessment.js 1,100 → 452 KB brotli, wml-core.js 147 → 74 KB.
#
# Built at EVERY deploy, from the source being shipped, into frontend/*.min.js (+ a source map so devtools still shows the
# source). The .min files are git-ignored: the source stays the one file anyone edits, reads, or gates. The plugin serves
# a .min copy only when it is NEWER than its source (swml_js_src in the main plugin file), so a deploy that skipped this
# step serves the source, never a stale build. Instant fall-backs to source, no deploy needed: SCRIPT_DEBUG, the
# ?swml_src=1 query, or `wp option update swml_minified_js off`.
#
# Usage: bin/build-min.sh   (the deploy scripts call it after the pre-ship gate, before rsync)
set -e
cd "$(dirname "$0")/../frontend"
T="${SWML_TERSER:-$HOME/.sophicly/tools/minify/node_modules/.bin/terser}"
if [ ! -x "$T" ]; then
  echo "❌ build-min: terser not found at $T"
  echo "   Install it once: mkdir -p ~/.sophicly/tools/minify && cd ~/.sophicly/tools/minify && npm i --save-exact terser@5.31.6"
  exit 1
fi
for f in wml-assessment wml-core; do
  rm -f "$f.min.js" "$f.min.js.map"
  "$T" "$f.js" -c -m --keep-fnames --source-map "url='$f.min.js.map'" -o "$f.min.js"
  node --check "$f.min.js"
  # A truncated or empty write can still parse — refuse anything implausibly small.
  [ "$(wc -c < "$f.min.js")" -gt 10000 ] || { echo "❌ build-min: $f.min.js is suspiciously small"; exit 1; }
  printf '  ✓ %-18s %8d → %8d bytes\n' "$f.js" "$(wc -c < "$f.js")" "$(wc -c < "$f.min.js")"
done
echo "✅ build-min: minified copies built"
