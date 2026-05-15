#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_ROOT="${DEPLOY_ROOT:-/srv/matthew-platform}"
APP_DIR="$DEPLOY_ROOT/apps/seo-ops"
DATA_DIR="$DEPLOY_ROOT/data/seo-ops"
BACKUP_DIR="$DATA_DIR/backups"
LOG_DIR="$DEPLOY_ROOT/logs/seo-ops"

required_commands=(git node npm)
missing_commands=()
for command_name in "${required_commands[@]}"; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    missing_commands+=("$command_name")
  fi
done

if [ "${#missing_commands[@]}" -gt 0 ]; then
  echo "Deployment dry run failed: missing local command(s): ${missing_commands[*]}" >&2
  exit 1
fi

branch="$(git branch --show-current 2>/dev/null || echo 'unknown')"
status="$(git status --short 2>/dev/null || true)"

if [ -n "$status" ]; then
  git_status_label="dirty"
else
  git_status_label="clean"
fi

cat <<EOF_DRY_RUN
Pinhole Deployment Dry Run
Mode: DRY RUN ONLY

Local prerequisites:
- Git: $(git --version)
- Node: $(node -v)
- npm: $(npm -v)
- Branch: $branch
- Git status: $git_status_label

Expected server paths:
- App: $APP_DIR
- Data: $DATA_DIR
- Backups: $BACKUP_DIR
- Logs: $LOG_DIR

Expected server command sequence later:
1. cd $APP_DIR
2. git pull
3. npm ci --legacy-peer-deps
4. npm run build
5. npm run platform:init
6. npm run platform:health
7. npm run seo:monitor

Expected .env values on server:
- NODE_ENV
- PLATFORM_TENANT
- PLATFORM_DB_PATH
- PLATFORM_REPORTS_PATH
- PLATFORM_BASE_URL
- PLATFORM_DASHBOARD_ROUTE
- BASIC_AUTH_USER
- BASIC_AUTH_PASSWORD
- GITHUB_REPO
- DEPLOY_ROOT

Safety notes:
- This dry run does not SSH to the server.
- This dry run does not create server directories.
- This dry run does not copy files.
- platform.db must live outside Git.
- Reports and backups must live outside Git.
- Do not expose a public dashboard until authentication exists.

Recommended local checks before a real deployment:
- npm run lint
- npm run build
- npm run platform:health
- npm run seo:monitor

EOF_DRY_RUN

if [ -n "$status" ]; then
  echo "Git status detail:"
  echo "$status"
  echo "Warning: resolve or commit local changes before any real deployment."
fi

echo "Result: DRY RUN COMPLETE. No deployment actions were performed."
