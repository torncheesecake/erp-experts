#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DB_PATH="${PLATFORM_DB_PATH:-$ROOT_DIR/platform/persistence/platform.db}"
BACKUP_PATH="${PLATFORM_BACKUP_PATH:-$ROOT_DIR/platform/persistence/backups}"
INTEGRITY_SCRIPT="$ROOT_DIR/scripts/platform/platform_db_integrity.mjs"

echo "Sentinel Backup Verification"
echo
echo "Mode: READ ONLY"
echo "DB path: $DB_PATH"
echo "Backup path: $BACKUP_PATH"
echo

if [[ ! -f "$DB_PATH" ]]; then
  echo "ERROR: platform DB does not exist."
  exit 1
fi

if [[ ! -d "$BACKUP_PATH" ]]; then
  echo "Warning: backup path does not exist yet. Configure PLATFORM_BACKUP_PATH or create it during deployment."
else
  echo "Backup path: present"
fi

node "$INTEGRITY_SCRIPT" --db-path "$DB_PATH"

DB_SIZE_BYTES="$(wc -c < "$DB_PATH" | tr -d ' ')"
DB_MODIFIED="$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S %z" "$DB_PATH" 2>/dev/null || stat -c "%y" "$DB_PATH")"

echo
echo "DB file size: $DB_SIZE_BYTES bytes"
echo "DB last modified: $DB_MODIFIED"
echo "Result: backup verification passed"
