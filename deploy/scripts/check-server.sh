#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/srv/matthew-platform}"
EXPECTED_DIRS=(
  "$DEPLOY_ROOT/apps/seo-ops"
  "$DEPLOY_ROOT/data/seo-ops"
  "$DEPLOY_ROOT/data/seo-ops/backups"
  "$DEPLOY_ROOT/logs/seo-ops"
  "$DEPLOY_ROOT/deploy/scripts"
)

echo "Server readiness read-only check"
echo "Node: $(node -v 2>/dev/null || echo 'missing')"
echo "npm: $(npm -v 2>/dev/null || echo 'missing')"
echo "Git: $(git --version 2>/dev/null || echo 'missing')"
echo "Working directory: $(pwd)"
echo "Deploy root: $DEPLOY_ROOT"

echo "Directory checks:"
for dir in "${EXPECTED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "  present: $dir"
  else
    echo "  missing: $dir"
  fi
done

echo "Read-only server check complete"
