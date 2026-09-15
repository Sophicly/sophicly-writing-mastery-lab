#!/usr/bin/env bash
# cache-stability-from-log.sh — v7.20.626
#
# ANSWERS: "is the cached protocol prefix actually byte-stable between turns?"
#
# WHY. The prompt cache is the largest variable cost in the business, and until now nobody
# could say whether it was working: `wp_mwai_logmeta` carries no cache fields, AI Engine reads
# none, and v7.20.622's usage recorder is not on prod. But class-protocol-router.php has logged
#     WML CACHE: instr=<n>ch md5=<8> ctx=<n>ch
# on EVERY turn for months — and the md5 is of $query->instructions, which is exactly the block
# AI Engine marks cache_control:ephemeral. Anthropic caches a PREFIX, so a prefix that changes
# between turns can never hit. Same md5 turn-to-turn = stable = hits from turn 2. Different =
# something inside the "static" block is moving, and `instr=` says how much.
#
# The log was being discarded because WP_DEBUG_LOG was false on prod (FIXLIST #548).
#
# ⚠️ This proves STABILITY, not that Anthropic returned a hit. The direct proof is
# cache_read_input_tokens, which v7.20.622 records — ship that for the real number.
#
# Usage, on the server:  bash cache-stability-from-log.sh [path-to-debug.log]
# Or from here:
#   ssh -i ~/.ssh/sophicly_staging runcloud@18.133.5.229 \
#     'bash -s' < bin/cache-stability-from-log.sh

LOG="${1:-/home/runcloud/webapps/SophiclyMain/wp-content/debug.log}"
[ -f "$LOG" ] || { echo "no log at $LOG"; exit 1; }

total=$(grep -c 'WML CACHE:' "$LOG" 2>/dev/null | head -1 | tr -dc '0-9')
total=${total:-0}
if [ "$total" -eq 0 ]; then
  echo "No 'WML CACHE:' lines in $LOG."
  echo "Either no WML turns have run since logging was enabled, or WP_DEBUG_LOG is off again."
  exit 0
fi

echo "WML turns logged: $total"
echo
echo "── distinct instruction prefixes (md5), most frequent first ──"
grep -o 'md5=[0-9a-f]*' "$LOG" | sort | uniq -c | sort -rn | head -15
echo
echo "── the sequence, in order (a run of one md5 = cache hits) ──"
grep -o 'instr=[0-9]*ch md5=[0-9a-f]*' "$LOG" | tail -40
echo
distinct=$(grep -o 'md5=[0-9a-f]*' "$LOG" | sort -u | wc -l | tr -d ' ')
biggest=$(grep -o 'md5=[0-9a-f]*' "$LOG" | sort | uniq -c | sort -rn | head -1 | awk '{print $1}' | tr -dc '0-9')
biggest=${biggest:-0}
echo "── verdict ──"
echo "distinct prefixes: $distinct over $total turns; longest-shared prefix covers $biggest turns"
if [ "$distinct" -eq "$total" ]; then
  echo "⛔ EVERY TURN HAS A DIFFERENT PREFIX — nothing can be cached, ever."
  echo "   Diff two turns' instructions to find what moves. The dump is gated behind a"
  echo "   wp-config define in class-protocol-router.php (see the v7.19.408 cache-debug block)."
elif [ "$biggest" -ge 3 ]; then
  echo "✅ The prefix is stable across runs of turns — caching can and should be hitting."
  echo "   Confirm with real cache_read_input_tokens by shipping v7.20.622 to prod."
else
  echo "⚠️  Mixed. Some stability but the prefix changes often. Look at the instr= sizes above:"
  echo "   a CHANGING byte count means content is moving in or out of the cached block;"
  echo "   a CONSTANT byte count with a changing md5 means content is being REPLACED in place"
  echo "   (a name, a date, a question number) — that is the harder one to spot and the"
  echo "   likelier culprit."
fi
