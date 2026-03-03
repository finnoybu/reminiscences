#!/usr/bin/env bash
set -euo pipefail

# Applies repository rulesets using GitHub REST API via gh.
# Requires: gh authenticated. jq recommended for pretty output.

REPO_FULL="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
OWNER="${REPO_FULL%%/*}"
REPO="${REPO_FULL##*/}"

echo "Applying ruleset to ${OWNER}/${REPO}..."

gh api -X POST "repos/${OWNER}/${REPO}/rulesets" --input "github/rulesets/main.ruleset.json"   -H "Accept: application/vnd.github+json"   -H "X-GitHub-Api-Version: 2022-11-28"

echo "Rulesets now:"
if command -v jq >/dev/null 2>&1; then
  gh api "repos/${OWNER}/${REPO}/rulesets" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" | jq .
else
  gh api "repos/${OWNER}/${REPO}/rulesets" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28"
fi
