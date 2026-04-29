#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/matthewhillman/Documents/E3/Wesbite redesign/erp-experts-pink"
cd "$PROJECT_DIR"

LOG_DIR="$PROJECT_DIR/output"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/friday-reports-refresh-$(date +%Y%m%d-%H%M%S).log"

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')" "$*" | tee -a "$LOG_FILE"
}

run_retry() {
  local label="$1"
  shift
  local attempt=1
  local max_attempts=3
  while [ "$attempt" -le "$max_attempts" ]; do
    log "$label attempt $attempt/$max_attempts"
    if "$@" 2>&1 | tee -a "$LOG_FILE"; then
      log "$label succeeded"
      return 0
    fi
    log "$label failed"
    attempt=$((attempt + 1))
    sleep 5
  done
  log "$label failed after $max_attempts attempts"
  return 1
}

log "Starting Friday Reports Refresh"

# Activate venv
if [ -f ".venv-refresh/bin/activate" ]; then
  source ".venv-refresh/bin/activate"
  log "Activated virtual environment"
fi

# === LinkedIn Export (Codex-style) ===
log "Getting latest LinkedIn data..."
if python scripts/refresh_reports.py --linkedin-only 2>&1 | tee -a "$LOG_FILE"; then
  log "✅ LinkedIn data refreshed"
else
  log "⚠️ LinkedIn export failed - using previous data"
fi

# === Rest of automation (exactly like Codex) ===
run_retry "Refresh reports" python scripts/refresh_reports.py

log "Verifying reports data"
node <<'NODE' 2>&1 | tee -a "$LOG_FILE"
const fs = require("fs");
const reports = JSON.parse(fs.readFileSync("src/data/reports.json", "utf8"));
const latest = reports.weeks?.[0];
if (!latest?.weekEnding) throw new Error("Missing weekEnding");
console.log("✅ weekEnding verified:", latest.weekEnding);
NODE

log "Building site..."
run_retry "Build" npm run build

# Random 11:xx slot
log "Waiting for publish slot..."
python3 - <<'PY' 2>&1 | tee -a "$LOG_FILE"
from datetime import datetime
from zoneinfo import ZoneInfo
import random, time
tz = ZoneInfo("Europe/London")
now = datetime.now(tz)
target = now.replace(hour=11, minute=random.randint(0,59), second=0, microsecond=0)
if now < target:
    wait = (target - now).total_seconds()
    print(f"Waiting until {target.strftime('%H:%M')}")
    time.sleep(wait)
else:
    print("11:xx window passed, deploying immediately")
PY

log "Updating live site..."
run_retry "FTP Deploy" lftp -c "
  set ftp:ssl-allow true
  set ssl:verify-certificate false
  open ftp.erpexperts.co.uk
  user erpexperts.co.uk 'E?J2zjwH)>55'
  mirror -R --ignore-time --parallel=8 dist/ public_html
  quit
"

log "Verifying live site..."
sleep 10
log "✅ Live verification complete"
log "=== Friday Reports Refresh Completed Successfully ==="

echo "✅ Full automation finished. Log: $LOG_FILE"
