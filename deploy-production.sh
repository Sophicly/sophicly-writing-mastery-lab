#!/bin/bash
# Deploy Writing Mastery Lab to RunCloud PRODUCTION
# Usage: ./deploy-production.sh
# WARNING: This deploys to the LIVE site. Double-check before running.

set -e

REMOTE_USER="runcloud"
REMOTE_HOST="18.133.5.229"
SSH_KEY="$HOME/.ssh/sophicly_staging"
REMOTE_PATH="/home/runcloud/webapps/SophiclyMain/wp-content/plugins/sophicly-writing-mastery-lab/"
LOCAL_PATH="$(cd "$(dirname "$0")" && pwd)/"

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
  --exclude=".DS_Store" \
  --exclude="*.log" \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_PATH" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

echo ""
echo "Production deploy complete!"
