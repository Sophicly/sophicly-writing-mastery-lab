#!/usr/bin/env bash
# Shared pre/post-deploy helpers for every Sophicly plugin.
#
# Usage — source this file at the top of each deploy-staging.sh / deploy-production.sh:
#   source "$(dirname "$0")/../_templates/deploy-helpers.sh"
#   sophicly_predeploy_guard
#
# Then at the bottom, after the rsync that ships the plugin:
#   sophicly_postdeploy_commit
#
# Why this exists: disk drifted 5+ versions past committed HEAD across multiple
# plugins because sessions deployed without committing. These helpers enforce
# commit-on-deploy so git always reflects production reality.

sophicly_predeploy_guard() {
    local script_name="$0"
    local plugin_dir
    plugin_dir="$(cd "$(dirname "$script_name")" && pwd)"
    cd "$plugin_dir" || return 1

    # Count uncommitted changes inside THIS plugin's directory only, so
    # unrelated dirty files elsewhere in the monorepo don't block the deploy.
    local dirty_count
    dirty_count=$(git status --porcelain -- . 2>/dev/null | wc -l | tr -d ' ')

    export SOPHICLY_DIRTY_COUNT="$dirty_count"

    if [[ "$dirty_count" -gt 0 ]]; then
        echo "⚠️  Plugin tree has $dirty_count uncommitted file(s):"
        git status --short -- .
        echo ""
        if [[ "$script_name" == *"production"* ]]; then
            if [[ "${FORCE_DIRTY_DEPLOY:-}" != "1" ]]; then
                echo "❌ Production deploys require a clean tree for this plugin."
                echo "   Commit first, or re-run with FORCE_DIRTY_DEPLOY=1 to override."
                exit 1
            fi
            echo "⚠️  FORCE_DIRTY_DEPLOY=1 — proceeding to production with dirty tree."
        else
            read -p "Continue staging deploy with dirty tree? (y/N) " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Aborted."
                exit 1
            fi
        fi
    fi

    # v7.20.559 (Neil, 2026-08-25): EVERY COMMIT IS PUSHED. Refuse to deploy code the remote has
    # never seen — try the push first, so the common case self-heals; only a FAILED push blocks.
    # Override (outage only): FORCE_UNPUSHED_DEPLOY=1.
    if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
        local ahead
        ahead=$(git rev-list --count '@{u}..HEAD' 2>/dev/null | tr -d ' ')
        if [[ "${ahead:-0}" -gt 0 ]]; then
            echo "↑ local is $ahead commit(s) ahead of origin — pushing before deploy…"
            if ! git push -q origin HEAD; then
                if [[ "${FORCE_UNPUSHED_DEPLOY:-}" != "1" ]]; then
                    echo "❌ push failed and $ahead commit(s) are unpushed. Fix the push (or FORCE_UNPUSHED_DEPLOY=1 for an outage)."
                    exit 1
                fi
                echo "⚠️  FORCE_UNPUSHED_DEPLOY=1 — deploying unpushed commits."
            fi
        fi
    fi
}

sophicly_postdeploy_commit() {
    local script_name="$0"
    local plugin_dir
    plugin_dir="$(cd "$(dirname "$script_name")" && pwd)"
    cd "$plugin_dir" || return 0

    local env_label
    if [[ "$script_name" == *"production"* ]]; then
        env_label="production"
    else
        env_label="staging"
    fi

    # Pick the plugin version from the bootstrap PHP file's header.
    local version
    version=$(grep -hEi "^\s*\*\s*Version:\s*[0-9.]+" ./*.php 2>/dev/null | head -1 | awk '{print $NF}')

    # Only commit if the plugin tree was dirty going in. Clean trees produce
    # no commit — that's the happy path (commit already done pre-deploy).
    local current_dirty
    current_dirty=$(git status --porcelain -- . 2>/dev/null | wc -l | tr -d ' ')
    [[ "$current_dirty" -eq 0 ]] && return 0

    git add -- . 2>/dev/null || return 0
    if git commit -m "Deploy ${env_label}: v${version:-unknown}

Auto-commit from $(basename "$script_name"). Tree was dirty at deploy time;
captured after successful rsync so git tracks what's live." 2>/dev/null; then
        echo "✓ Captured deploy in git: v${version:-unknown}"
    else
        echo "  (no commit produced — deploy still succeeded)"
    fi
}
