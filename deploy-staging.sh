#!/bin/bash
# Deploy Writing Mastery Lab to RunCloud staging
# Usage: ./deploy-staging.sh

set -e

REMOTE_USER="runcloud"
REMOTE_HOST="18.133.5.229"
SSH_KEY="$HOME/.ssh/sophicly_staging"
REMOTE_PATH="/home/runcloud/webapps/SophiclyMain-SOnG8uTN-staging/wp-content/plugins/sophicly-writing-mastery-lab/"
LOCAL_PATH="$(cd "$(dirname "$0")" && pwd)/"

echo "Deploying Writing Mastery Lab to staging..."
echo "From: $LOCAL_PATH"
echo "To:   $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
echo ""

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
echo "Deploy complete!"
