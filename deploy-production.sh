#!/bin/bash
# Deploy Writing Mastery Lab to RunCloud PRODUCTION
# Usage: ./deploy-production.sh
# WARNING: This deploys to the LIVE site. Double-check before running.

set -e

# Shared git-hygiene guard (refuses dirty-tree prod, auto-commits on success)
source "$(dirname "$0")/.deploy/deploy-helpers.sh"
sophicly_predeploy_guard

# v7.19.915: mechanical pre-ship gate — syntax + eslint no-undef on the whole tree.
# BLOCKS the deploy; do not bypass (the .898 crash class ships past node --check).
"$(dirname "$0")/bin/pre-ship-check.sh" --all || { echo "❌ pre-ship gate failed — deploy aborted."; exit 1; }

REMOTE_USER="runcloud"
REMOTE_HOST="18.133.5.229"
SSH_KEY="$HOME/.ssh/sophicly_staging"
REMOTE_PATH="/home/runcloud/webapps/SophiclyMain/wp-content/plugins/sophicly-writing-mastery-lab/"
LOCAL_PATH="$(cd "$(dirname "$0")" && pwd)/"

# ⭐⭐ v7.20.451 — THE CW RENUMBER SPLIT GUARD. Neil inserted a new Step 8 ("Update Your Plot —
# Values") and WELDED the shortcode task keys to the lesson titles, so cw_step_8..30 mean different
# lessons before and after the renumber. LearnDash renumbered STAGING first; prod is renumbered
# separately. If this plugin (renumbered map) lands on a prod course that is NOT renumbered, EVERY
# CW step from 8 upward loads the wrong protocol — silently, with no error, for every student.
#
# The check is the renumber's own fingerprint: the new Step 8 topic in course 41165. It is queried
# on the target, not assumed. Escape hatch is deliberate and loud.
if grep -q "'cw_step_30'" "$LOCAL_PATH/includes/class-protocol-router.php" 2>/dev/null; then
    echo "Checking the production course is renumbered before shipping the renumbered map..."
    _cw_step8=$(ssh -i "$SSH_KEY" -o ConnectTimeout=20 "$REMOTE_USER@$REMOTE_HOST" \
        "cd /home/runcloud/webapps/SophiclyMain && wp --skip-plugins --skip-themes db query \
         \"SELECT COUNT(*) FROM wp_posts p JOIN wp_postmeta m ON m.post_id=p.ID AND m.meta_key='course_id' AND m.meta_value='41165' \
           WHERE p.post_type='sfwd-topic' AND p.post_status='publish' AND p.post_title LIKE '%STEP 8: Update Your Plot%'\" \
         --skip-column-names 2>/dev/null" | tr -d '[:space:]')
    if [ "$_cw_step8" != "1" ]; then
        echo ""
        echo "❌ REFUSING TO DEPLOY — the production Creative Writing course is NOT renumbered."
        echo "   Local router maps cw_step_8..30 (post-renumber); prod course 41165 has no"
        echo "   'STEP 8: Update Your Plot' lesson (query returned: '${_cw_step8:-nothing}')."
        echo "   Shipping now would serve the WRONG protocol for every CW step from 8 upward."
        echo ""
        echo "   Fix: the LearnDash lane renumbers the prod course FIRST, then deploy."
        echo "   Handoff: ~/.claude/handoffs/open/learndash-FROM-wml-cw-renumber-*.md"
        echo "   Override (only if you know the course just changed): CW_RENUMBER_OK=1 ./deploy-production.sh"
        [ "$CW_RENUMBER_OK" = "1" ] || exit 1
        echo "   ⚠️  CW_RENUMBER_OK=1 set — proceeding anyway."
    else
        echo "✅ Production course is renumbered (STEP 8: Update Your Plot present). Safe to ship."
    fi
fi

echo "⚠️  PRODUCTION DEPLOY — Writing Mastery Lab"
echo "From: $LOCAL_PATH"
echo "To:   $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
echo ""
read -p "Are you sure you want to deploy to PRODUCTION? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

rsync -avz --delete \
  --exclude="deploy-staging.sh" \
  --exclude="deploy-production.sh" \
  --exclude=".git" \
  --exclude=".gitignore" \
  --exclude=".DS_Store" \
  --exclude="*.log" \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_PATH" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

echo ""
# v7.19.375: purge LiteSpeed page cache so cached HTML stops referencing the
# previous asset ?ver (students saw the old sidebar until a hard refresh).
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" \
  "cd ${REMOTE_PATH%wp-content/plugins/sophicly-writing-mastery-lab/} && /usr/local/lsws/lsphp82/bin/php8.2 /usr/local/bin/wp eval 'do_action(\"litespeed_purge_all\");' 2>/dev/null" \
  && echo "LiteSpeed cache purged." || echo "WARN: cache purge failed — students may need a hard refresh."

echo "Production deploy complete!"
