#!/usr/bin/env bash
# v7.20.559 (Neil, 2026-08-25): EVERY COMMIT IS PUSHED. Agreed long ago, never mechanised — 263
# commits sat local-only until 2026-08-25 because deploy = rsync and nothing ever ran `git push`.
# A rule in prose loses to a default in code, so this is the code: a post-commit hook (wired at
# .git/hooks/post-commit, which execs this file) pushes the current branch; the deploy guard
# (.deploy/deploy-helpers.sh) refuses a deploy while local is ahead of origin.
cd "$(git rev-parse --show-toplevel)" || exit 0
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
[[ -z "$branch" || "$branch" == "HEAD" ]] && exit 0
if git push -q origin "$branch" 2>/tmp/swml-post-commit-push.err; then
  echo "↑ pushed $branch to origin"
else
  echo "⚠️  post-commit push FAILED — $(head -1 /tmp/swml-post-commit-push.err). Run: git push origin $branch"
fi
exit 0
