#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cleanup_linkedin_downloads() {
  shopt -s nullglob
  local removed=0
  local file=""

  for file in "$HOME"/Downloads/Content_*_RicWilson*.xlsx; do
    local name
    name="$(basename "$file")"
    if [[ "$name" =~ ^Content_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{4}-[0-9]{2}-[0-9]{2}_RicWilson(\ \([0-9]+\))?\.xlsx$ ]]; then
      rm -f "$file"
      echo "Removed $file"
      removed=1
    fi
  done

  if [ "$removed" -eq 0 ]; then
    echo "No LinkedIn export files found in $HOME/Downloads"
  fi
}

cd "$REPO_ROOT"

./scripts/download_linkedin_export.sh
python3 scripts/refresh_reports.py
npm run build
cleanup_linkedin_downloads
