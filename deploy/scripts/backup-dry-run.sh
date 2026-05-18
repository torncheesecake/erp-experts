#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/srv/sentinel}"
PLATFORM_DB_PATH="${PLATFORM_DB_PATH:-$DEPLOY_ROOT/data/seo-ops/platform.db}"
PLATFORM_REPORTS_PATH="${PLATFORM_REPORTS_PATH:-$DEPLOY_ROOT/data/seo-ops/reports}"
PLATFORM_BACKUP_PATH="${PLATFORM_BACKUP_PATH:-$DEPLOY_ROOT/data/seo-ops/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP_PATTERN="YYYY-MM-DD-HHmmss"

cat <<EOF_DRY_RUN
Sentinel Backup Dry Run
Mode: DRY RUN ONLY

Expected runtime paths:
- DB: $PLATFORM_DB_PATH
- Reports: $PLATFORM_REPORTS_PATH
- Backups: $PLATFORM_BACKUP_PATH

Expected backup naming:
- platform-$TIMESTAMP_PATTERN.db
- reports-$TIMESTAMP_PATTERN.tar.gz

Retention policy:
- Keep backups for $BACKUP_RETENTION_DAYS days unless a stricter manual policy is set.

Future backup steps:
1. Verify DB exists.
2. Verify report directory exists.
3. Create timestamped DB backup.
4. Create timestamped report archive.
5. Verify backup files are readable.
6. Remove backups older than retention policy only after verification.

Safety notes:
- This dry run does not copy files.
- This dry run does not compress files.
- This dry run does not delete files.
- This dry run does not mutate the server or local filesystem.

Result: BACKUP DRY RUN COMPLETE. No backup actions were performed.
EOF_DRY_RUN
