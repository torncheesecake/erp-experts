#!/usr/bin/env bash
set -euo pipefail

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PWCLI="${PWCLI:-$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh}"
SESSION="${LINKEDIN_PW_SESSION:-linkedin-export}"
STATE_FILE="${LINKEDIN_STATE_FILE:-$HOME/.codex/linkedin-erp-experts-state.json}"
DOWNLOAD_DIR="${LINKEDIN_DOWNLOAD_DIR:-$HOME/Downloads}"
ANALYTICS_URL="https://www.linkedin.com/analytics/creator/content/"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required. Install Node.js/npm first." >&2
  exit 1
fi

if [ ! -x "$PWCLI" ]; then
  echo "Playwright CLI wrapper not found at $PWCLI" >&2
  exit 1
fi

mkdir -p "$(dirname "$STATE_FILE")" "$DOWNLOAD_DIR"

echo "Opening LinkedIn analytics in Chrome..."
"$PWCLI" "-s=$SESSION" open "$ANALYTICS_URL" --headed >/dev/null

if [ -f "$STATE_FILE" ]; then
  echo "Loading saved LinkedIn browser state..."
  "$PWCLI" "-s=$SESSION" state-load "$STATE_FILE" >/dev/null
  "$PWCLI" "-s=$SESSION" goto "$ANALYTICS_URL" >/dev/null
fi

cat <<EOF
Complete any LinkedIn sign-in or security checks in the browser window.
Leave the page on the analytics screen, then press Enter here to export.

The downloaded workbook will be saved to:
  $DOWNLOAD_DIR
EOF
read -r

export LINKEDIN_DOWNLOAD_DIR="$DOWNLOAD_DIR"
export_ref=""
for _ in 1 2 3 4 5 6 7 8 9 10; do
  snapshot_meta="$("$PWCLI" "-s=$SESSION" snapshot)"
  snapshot_path="$(printf '%s\n' "$snapshot_meta" | sed -n 's/.*\[Snapshot\](\(.*\.yml\)).*/\1/p' | head -n 1)"
  if [ -n "$snapshot_path" ] && [ -f "$snapshot_path" ]; then
    export_ref="$(sed -n 's/.*button "Export" \[ref=\([^]]*\)\].*/\1/p' "$snapshot_path" | head -n 1)"
  else
    export_ref=""
  fi
  if [ -n "$export_ref" ]; then
    break
  fi
  sleep 2
done

if [ -z "$export_ref" ]; then
  echo "Could not find the LinkedIn Export button. Leave the browser on the analytics screen and try again." >&2
  exit 1
fi

click_output="$("$PWCLI" "-s=$SESSION" click "$export_ref")"
download_name="$(printf '%s\n' "$click_output" | sed -n 's/.*Downloading file \(Content_[^ ]*\.xlsx\) .*/\1/p' | head -n 1)"
download_path="$(printf '%s\n' "$click_output" | sed -n 's/.*to \"\(.*\.xlsx\)\"/\1/p' | head -n 1)"

if [ -z "$download_path" ] || [ ! -f "$download_path" ]; then
  download_path="$(ls -t .playwright-cli/Content-*.xlsx 2>/dev/null | head -n 1 || true)"
fi

if [ -z "$download_name" ] || [ -z "$download_path" ] || [ ! -f "$download_path" ]; then
  echo "LinkedIn export started, but the downloaded workbook could not be located automatically." >&2
  exit 1
fi

cp -f "$download_path" "$DOWNLOAD_DIR/$download_name"
echo "Saved LinkedIn export to $DOWNLOAD_DIR/$download_name"

"$PWCLI" "-s=$SESSION" state-save "$STATE_FILE" >/dev/null
chmod 600 "$STATE_FILE" 2>/dev/null || true

echo "Saved LinkedIn browser state to $STATE_FILE"
echo "You can now run: python3 scripts/refresh_reports.py"
