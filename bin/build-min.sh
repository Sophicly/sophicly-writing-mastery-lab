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
# v7.20.912 (Neil, 16 Oct: "elements are loading conditionally… things don't load unless they need to"). MEASURED on staging
# (coverage, 6 lesson types): only wml-assessment + wml-core were minified; 9 more scripts shipped as written (wml-app 497 KB,
# selection-chip 137 KB, cw6-concepts 157 KB…) and the two stylesheets too (wml-canvas 735 KB, wml-styles 171 KB).
JS_FILES="wml-assessment wml-core wml-app wml-selection-chip wml-section-block wml-pull-overlay wml-video-player wml-examiner-ladder wml-cw6-concepts wml-markscheme-data wml-techniques-index"
for f in $JS_FILES; do
  rm -f "$f.min.js" "$f.min.js.map"
  "$T" "$f.js" -c -m --keep-fnames --source-map "url='$f.min.js.map'" -o "$f.min.js"
  node --check "$f.min.js"
  # A truncated or empty write can still parse — refuse anything implausibly small (under a tenth of its source).
  [ "$(wc -c < "$f.min.js")" -gt "$(( $(wc -c < "$f.js") / 10 ))" ] || { echo "❌ build-min: $f.min.js is suspiciously small"; exit 1; }
  printf '  ✓ %-24s %8d → %8d bytes\n' "$f.js" "$(wc -c < "$f.js")" "$(wc -c < "$f.min.js")"
done
# Stylesheets: csso 5.0.5 (pinned beside terser) with restructure OFF — whitespace, comments and value shortening only.
# Rules are never merged, moved or reordered, so the cascade is exactly the source's.
CSSO="$(dirname "$T")/../csso"
[ -d "$CSSO" ] || { echo "❌ build-min: csso not found at $CSSO — npm i --save-exact csso@5.0.5 in ~/.sophicly/tools/minify"; exit 1; }
for f in wml-canvas wml-styles; do
  rm -f "$f.min.css"
  CSSO="$CSSO" node -e '
    const fs = require("fs"); const csso = require(process.env.CSSO);
    const src = fs.readFileSync(process.argv[1], "utf8");
    const out = csso.minify(src, { restructure: false, comments: false }).css;
    // Every rule block survives; csso may drop only EMPTY ones (`x {}` — they style nothing; wml-canvas.css has 4).
    const rules = (x) => (x.match(/\{/g) || []).length - (x.match(/\{\s*\}/g) || []).length;
    const srcRules = rules(src.replace(/\/\*[\s\S]*?\*\//g, "")), outRules = rules(out);
    if (outRules !== srcRules) { console.error("❌ build-min: " + process.argv[1] + " rule blocks " + srcRules + " → " + outRules); process.exit(1); }
    fs.writeFileSync(process.argv[2], out);' "$f.css" "$f.min.css"
  printf '  ✓ %-24s %8d → %8d bytes\n' "$f.css" "$(wc -c < "$f.css")" "$(wc -c < "$f.min.css")"
done
echo "✅ build-min: minified copies built"
