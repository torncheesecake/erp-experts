#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DB_PATH="${PLATFORM_DB_PATH:-$ROOT_DIR/platform/persistence/platform.db}"
KEEP_TEMP="no"
INTEGRITY_SCRIPT="$ROOT_DIR/scripts/platform/platform_db_integrity.mjs"
TEMP_DB=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep-temp)
      KEEP_TEMP="yes"
      shift
      ;;
    --db-path)
      DB_PATH="${2:-}"
      if [[ -z "$DB_PATH" ]]; then
        echo "ERROR: --db-path requires a value"
        exit 1
      fi
      shift 2
      ;;
    *)
      echo "ERROR: Unknown flag: $1"
      echo "Usage: deploy/scripts/restore-simulate.sh [--db-path <path>] [--keep-temp]"
      exit 1
      ;;
  esac
done

cleanup() {
  if [[ "$KEEP_TEMP" != "yes" && -n "$TEMP_DB" && -f "$TEMP_DB" ]]; then
    rm -f "$TEMP_DB"
  fi
}
trap cleanup EXIT

echo "Sentinel Restore Simulation"
echo
echo "Mode: SIMULATION ONLY"
echo "Source DB: $DB_PATH"
echo

if [[ ! -f "$DB_PATH" ]]; then
  echo "ERROR: source DB does not exist."
  exit 1
fi

TEMP_DB="$(mktemp "${TMPDIR:-/tmp}/sentinel-restore-test.XXXXXX")"
cp "$DB_PATH" "$TEMP_DB"

echo "Temporary restore DB: $TEMP_DB"
echo

node "$INTEGRITY_SCRIPT" --db-path "$TEMP_DB"

echo
echo "Restore simulation successful."
if [[ "$KEEP_TEMP" == "yes" ]]; then
  echo "Temporary restore DB kept: $TEMP_DB"
else
  echo "Temporary restore DB will be removed."
fi
echo "No live DB was overwritten."
echo "No source files were changed."
