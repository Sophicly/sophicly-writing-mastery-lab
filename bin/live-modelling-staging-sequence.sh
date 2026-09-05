#!/bin/bash
# live-modelling-staging-sequence.sh — the WHOLE staging sequence for the live-modelling build,
# in the order handoff §8.7 states, over ONE ssh master connection (the server bans bursts of
# separate connections — memory reference_sophicly_server_bans_ssh_bursts_use_controlmaster).
#
#   bin/live-modelling-staging-sequence.sh            → everything below, stops at the first failure
#   bin/live-modelling-staging-sequence.sh gate-only  → just the access gate (after a deploy)
#
# Steps: 1 deploy v7.20.589 → 2 seed the designated-author option → 3 access gate →
#        4 install papers (dry, then apply) → 5 remove prod's duplicate Rosabel topic 12 (prod, read-write, ONE option)
#        → 6 headless logged-in render of Rosabel + one authored paper.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
HOST=runcloud@18.133.5.229; KEY=~/.ssh/sophicly_staging
CM=(-o ControlMaster=auto -o "ControlPath=$HOME/.ssh/cm-%r@%h-%p" -o ControlPersist=15m -o ConnectTimeout=20 -i "$KEY")
STG=/home/runcloud/webapps/SophiclyMain-SOnG8uTN-staging; STGWP="/usr/local/lsws/lsphp82/bin/php8.2 /usr/local/bin/wp"
PRD=/home/runcloud/webapps/SophiclyMain;                 PRDWP="/usr/local/lsws/lsphp83/bin/php /usr/local/bin/wp"
PLUG=wp-content/plugins/sophicly-writing-mastery-lab
AUTHOR_STG=1355; STUDENT_STG=1352   # Neil's staging user · Reham (QA student)
r() { ssh "${CM[@]}" "$HOST" "$@"; }

echo "── 0 · connection"; r 'echo ok: $(hostname)'
if [ "${1:-}" != "gate-only" ]; then
  echo "── 1 · deploy v7.20.589 to staging"
  grep -q "Version: 7.20.589" "$HERE/sophicly-writing-mastery-lab.php" || { echo "local header is not 7.20.589"; exit 1; }
  (cd "$HERE" && ./deploy-staging.sh) || { echo "deploy-staging.sh failed"; exit 1; }
  r "grep -m1 'Version:' $STG/$PLUG/sophicly-writing-mastery-lab.php; md5sum < $STG/$PLUG/frontend/wml-assessment.js | cut -c1-12"
  md5 -q "$HERE/frontend/wml-assessment.js" | cut -c1-12
  echo "── 2 · seed swml_live_modelling_authors = [$AUTHOR_STG] on staging"
  r "cd $STG && $STGWP option update swml_live_modelling_authors '[$AUTHOR_STG]' --format=json && $STGWP option get swml_live_modelling_authors --format=json"
fi
echo "── 3 · access gate"
r "cd $STG && $STGWP eval-file $PLUG/bin/live-modelling-access-gate.php author=$AUTHOR_STG student=$STUDENT_STG 2>&1 | grep -v Warning" | tee /tmp/lm-gate.out
grep -q "passed" /tmp/lm-gate.out || { echo "⛔ access gate did not pass — stop here"; exit 1; }
[ "${1:-}" = "gate-only" ] && exit 0
echo "── 4 · install papers: dry run, then apply"
r "cd $STG && $STGWP eval-file $PLUG/bin/live-model-install-papers.php 2>&1 | grep -v Warning" | tail -25
r "cd $STG && $STGWP eval-file $PLUG/bin/live-model-install-papers.php apply 2>&1 | grep -v Warning" | tee /tmp/lm-install.out | tail -25
grep -q "0 refused" /tmp/lm-install.out || echo "⚠️ some papers were refused — read /tmp/lm-install.out"
echo "── 5 · prod: remove the duplicate Rosabel topic 12 (topic 11 stays; the live page uses 11)"
r "cd $PRD && $PRDWP eval '\$k=\"swml_topics_aqa_aqa_lang_paper_1\"; \$t=get_option(\$k,[]); \$n=count(\$t); \$t=array_values(array_filter(\$t, function(\$x){ return (int)(\$x[\"topic_number\"]??0)!==12; })); if (count(\$t)===\$n-1) { update_option(\$k,\$t,false); wp_cache_delete(\$k,\"options\"); echo \"removed topic 12: \$n → \".count(get_option(\$k,[]))."\\n"; } else { echo \"topic 12 not present (\$n topics) — nothing done\\n\"; }' 2>&1 | grep -v Warning"
echo "── 6 · headless logged-in render: Rosabel (topic 11) and the June 2023 P2 paper (202306)"
COOK=$(r "cd $STG && $STGWP eval '\$u=$AUTHOR_STG; \$e=time()+3600; \$m=WP_Session_Tokens::get_instance(\$u); \$t=\$m->create(\$e); echo \"wordpress_logged_in_\".COOKIEHASH.\"|\".wp_generate_auth_cookie(\$u,\$e,\"logged_in\",\$t).\"|\".\$t;' 2>&1 | grep -v Warning | tail -1")
CNAME=${COOK%%|*}; REST=${COOK#*|}; CVAL=${REST%|*}; TOKEN=${REST##*|}
SCRATCH="${SCRATCH:-/tmp}"; SITE="https://sophiclymain-staging.kjjabv7qty-yjr3ozq9r41m.p.temp-site.link"
node "${ROSABEL_CHECK:-$HERE/bin/rosabel-check.mjs}" "$SITE/live-modelling-aqa-p1-rosabel/" "$CNAME" "$CVAL" staging-rosabel || true
node "${ROSABEL_CHECK:-$HERE/bin/rosabel-check.mjs}" "$SITE/live-modelling-aqa-p1-rosabel/?topic=202306&text=aqa_lang_paper_2" "$CNAME" "$CVAL" staging-p2-202306 || true
r "cd $STG && $STGWP eval 'WP_Session_Tokens::get_instance($AUTHOR_STG)->destroy(\"$TOKEN\"); echo \"session destroyed\\n\";' 2>&1 | grep -v Warning"
echo "── done"
