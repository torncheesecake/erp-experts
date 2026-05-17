#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" != "--confirm" ]; then
  echo "Refusing to run backup without --confirm"
  echo "This placeholder does not create backups yet. Run deploy/scripts/backup-dry-run.sh to inspect the intended behaviour."
  exit 0
fi

DEPLOY_ROOT="${DEPLOY_ROOT:-/srv/sentinel}"
PLATFORM_DB_PATH="${PLATFORM_DB_PATH:-$DEPLOY_ROOT/data/seo-ops/platform.db}"
PLATFORM_REPORTS_PATH="${PLATFORM_REPORTS_PATH:-$DEPLOY_ROOT/data/seo-ops/reports}"
PLATFORM_BACKUP_PATH="${PLATFORM_BACKUP_PATH:-$DEPLOY_ROOT/data/seo-ops/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

cat <<EOF_BACKUP
Backup placeholder confirmed
Mode: SAFE PLACEHOLDER ONLY

No backup files were created.
No files were copied.
No files were compressed.
No files were deleted.

Future TODO steps:
1. Back up SQLite DB from: $PLATFORM_DB_PATH
2. Archive reports from: $PLATFORM_REPORTS_PATH
3. Write backups to: $PLATFORM_BACKUP_PATH
4. Verify backup integrity.
5. Apply retention policy: $BACKUP_RETENTION_DAYS days.

Result: TODO backup steps printed only.
EOF_BACKUP
