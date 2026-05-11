#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/matthewhillman/Documents/E3/Wesbite redesign/erp-experts-pink"
cd "$PROJECT_DIR"

LOG_DIR="$PROJECT_DIR/output"
mkdir -p "$LOG_DIR"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/friday-reports-refresh-$RUN_ID.log"
STATE_FILE="$LOG_DIR/friday-reports-refresh-state.json"
DIAG_FILE="$LOG_DIR/friday-reports-refresh-diagnostics-$RUN_ID.log"
SUMMARY_FILE="$LOG_DIR/friday-reports-refresh-summary-$RUN_ID.json"
LOCK_FILE="$LOG_DIR/friday-reports-refresh.lock"
LOCK_DIR="$LOG_DIR/friday-reports-refresh.lockdir"
DEPLOY_MARKER="deploy-meta.json"

step=""
RESUME_MODE=0
FROM_STEP=""
SKIP_PUBLISH_WAIT=0

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')" "$*" | tee -a "$LOG_FILE"
}

usage() {
  cat <<'USAGE'
Usage: ./scripts/friday_reports_refresh.sh [options]

Options:
  --resume            Reuse state and skip completed steps
  --from-step STEP    Start from a specific step name
  --no-wait           Skip 11:00-11:59 wait window
  -h, --help          Show this help
USAGE
}

while [ $# -gt 0 ]; do
  case "$1" in
    --resume) RESUME_MODE=1; shift ;;
    --from-step) FROM_STEP="${2:-}"; shift 2 ;;
    --no-wait) SKIP_PUBLISH_WAIT=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

set_state() {
  local status="$1"
  python3 - "$STATE_FILE" "$RUN_ID" "$step" "$status" <<'PY'
import json, pathlib, sys
state_path = pathlib.Path(sys.argv[1])
run_id, step, status = sys.argv[2], sys.argv[3], sys.argv[4]
state = {}
if state_path.exists():
    try:
        state = json.loads(state_path.read_text(encoding='utf-8'))
    except Exception:
        state = {}
state.update({"runId": run_id, "currentStep": step, "status": status})
steps = state.get("steps", {})
if step:
    steps[step] = status
state["steps"] = steps
state_path.write_text(json.dumps(state, indent=2), encoding='utf-8')
PY
}

step_status() {
  local key="$1"
  python3 - "$STATE_FILE" "$key" <<'PY'
import json, pathlib, sys
path = pathlib.Path(sys.argv[1]); key = sys.argv[2]
if not path.exists():
    print("")
    raise SystemExit(0)
try:
    state = json.loads(path.read_text(encoding='utf-8'))
except Exception:
    print("")
    raise SystemExit(0)
print((state.get("steps", {}) or {}).get(key, ""))
PY
}

run_step() {
  local name="$1"
  shift
  step="$name"

  if [ "$RESUME_MODE" -eq 1 ] && [ "$(step_status "$name")" = "done" ] && [ -z "$FROM_STEP" ]; then
    log "Skipping step '$name' (already done in state)"
    return 0
  fi

  if [ -n "$FROM_STEP" ] && [ "$FROM_STEP" != "$name" ] && [ -z "${_from_hit:-}" ]; then
    log "Skipping step '$name' (waiting for --from-step '$FROM_STEP')"
    return 0
  fi
  if [ -n "$FROM_STEP" ] && [ "$FROM_STEP" = "$name" ]; then
    _from_hit=1
  fi

  set_state "in_progress"
  "$@"
  set_state "done"
}

collect_diagnostics() {
  {
    echo "=== Diagnostics $(date '+%Y-%m-%d %H:%M:%S %Z') ==="
    echo "Step: $step"
    echo
    echo "--- DNS ---"
    nslookup ftp.erpexperts.co.uk || true
    nslookup erpexperts.co.uk || true
    echo
    echo "--- Network ---"
    curl -I --max-time 20 https://oauth2.googleapis.com/token || true
    curl -I --max-time 20 https://erpexperts.co.uk || true
    echo
    echo "--- Local reports head ---"
    node -e "const r=require('./src/data/reports.json');console.log({lastUpdated:r.lastUpdated,dataThrough:r.dataThrough,weekEnding:r.weeks?.[0]?.weekEnding});" || true
    echo
    echo "--- FTP preflight ---"
    lftp -d -e "set net:timeout 15; set net:max-retries 1; set ftp:ssl-allow true; set ssl:verify-certificate false; open $FTP_HOST; user $FTP_USER '$FTP_PASS'; ls; bye" || true
  } > "$DIAG_FILE" 2>&1
}

on_error() {
  local exit_code=$?
  set_state "failed"
  log "ERROR at step '$step' (exit $exit_code). Collecting diagnostics..."
  collect_diagnostics
  log "Diagnostics written to $DIAG_FILE"
  exit "$exit_code"
}
trap on_error ERR

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

load_ftp_env() {
  FTP_HOST=$(sed -n 's/^FTP_HOST=//p' .ftpconfig | head -n1)
  FTP_USER=$(sed -n 's/^FTP_USER=//p' .ftpconfig | head -n1)
  FTP_PASS=$(sed -n 's/^FTP_PASS=//p' .ftpconfig | head -n1)
  FTP_REMOTE_PATH=$(sed -n 's/^FTP_REMOTE_PATH=//p' .ftpconfig | head -n1)
  export FTP_HOST FTP_USER FTP_PASS FTP_REMOTE_PATH
}

wait_publish_slot() {
  if [ "$SKIP_PUBLISH_WAIT" -eq 1 ]; then
    echo "Skipping publish wait because --no-wait was provided"
    return 0
  fi
  python3 - <<'PY' 2>&1
from datetime import datetime
from zoneinfo import ZoneInfo
import random, time

tz = ZoneInfo("Europe/London")
now = datetime.now(tz)
minute = random.randint(0, 59)
target = now.replace(hour=11, minute=minute, second=0, microsecond=0)
print(f"Selected publish slot: {target.strftime('%Y-%m-%d %H:%M:%S %Z')}")
if now < target:
    wait = (target - now).total_seconds()
    print(f"Waiting {int(wait)}s until publish slot")
    time.sleep(wait)
else:
    print("11:xx window passed, deploying immediately")
PY
}

preflight() {
  [ -f "credentials/google-service-account.json" ]
  [ -f ".ftpconfig" ]
  [ -f "scripts/refresh_reports.py" ]
  [ -f "scripts/download_linkedin_export.sh" ]
  [ -d "dist" ] || true

  load_ftp_env

  # Fast network/API checks
  curl -I --max-time 15 https://oauth2.googleapis.com/token >/dev/null
  nslookup ftp.erpexperts.co.uk >/dev/null

  # FTP login/list preflight
  lftp -e "set net:timeout 20; set net:max-retries 1; set ftp:ssl-allow true; set ssl:verify-certificate false; open $FTP_HOST; user $FTP_USER '$FTP_PASS'; ls; bye" >/dev/null
}

verify_local_reports() {
  node <<'NODE'
const fs = require('fs');
const reports = JSON.parse(fs.readFileSync('src/data/reports.json', 'utf8'));
const latest = reports.weeks?.[0];
if (!latest?.weekEnding) throw new Error('Missing weeks[0].weekEnding');
if (!reports.dataThrough) throw new Error('Missing dataThrough');
const seo = reports.ga4Period?.seoInsights;
if (!seo || !Array.isArray(seo.allLandingPages) || !Array.isArray(seo.roadmapPhases) || !seo.demandSignals) {
  throw new Error('Missing required seoInsights keys');
}
console.log('Local verify:', { weekEnding: latest.weekEnding, dataThrough: reports.dataThrough });
NODE
}

verify_live() {
  local cb
  cb="?cb=$RUN_ID"
  local index_js
  index_js=$(curl -sL "https://erpexperts.co.uk/$cb" | rg -o 'assets/index-[^" ]+\.js' | head -n1)
  [ -n "$index_js" ]

  local reports_js
  reports_js=$(curl -sL "https://erpexperts.co.uk/$index_js$cb" | rg -o 'assets/reports-[^" ]+\.js' | head -n1)
  [ -n "$reports_js" ]

  local expect_date
  expect_date=$(node -e "const r=require('./src/data/reports.json');console.log(r.dataThrough)")

  local marker_json
  marker_json=$(curl -sL "https://erpexperts.co.uk/$DEPLOY_MARKER$cb")
  echo "$marker_json" | rg -q "\"runId\"\\s*:\\s*\"$RUN_ID\""
  echo "$marker_json" | rg -q "\"dataThrough\"\\s*:\\s*\"$expect_date\""

  curl -sL "https://erpexperts.co.uk/$reports_js$cb" | rg -q "$expect_date"
  log "Live verify ok: marker and $reports_js contain $expect_date"
}

write_summary() {
  python3 - "$SUMMARY_FILE" "$STATE_FILE" <<'PY'
import json, pathlib, sys, datetime
summary_path = pathlib.Path(sys.argv[1])
state_path = pathlib.Path(sys.argv[2])
state = {}
if state_path.exists():
    try:
        state = json.loads(state_path.read_text(encoding='utf-8'))
    except Exception:
        state = {}
summary = {
    "timestamp": datetime.datetime.now().isoformat(),
    "status": state.get("status", "unknown"),
    "runId": state.get("runId"),
    "currentStep": state.get("currentStep"),
    "steps": state.get("steps", {}),
}
summary_path.write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(f"Wrote summary: {summary_path}")
PY
}

verify_local_logged() {
  verify_local_reports | tee -a "$LOG_FILE"
}

wait_publish_logged() {
  wait_publish_slot | tee -a "$LOG_FILE"
}

deploy_logged() {
  write_deploy_marker
  load_ftp_env
  hardened_ftp_deploy
  verify_remote_marker
}

hardened_ftp_deploy() {
  local attempt=1
  local max_attempts=3
  while [ "$attempt" -le "$max_attempts" ]; do
    log "FTP deploy attempt $attempt/$max_attempts"
    if lftp -d -e "set net:timeout 30; set net:max-retries 2; set net:reconnect-interval-base 5; set net:reconnect-interval-max 20; set ftp:ssl-allow true; set ssl:verify-certificate false; open $FTP_HOST; user $FTP_USER '$FTP_PASS'; mirror -R --ignore-time --parallel=2 --exclude-glob videos/** dist/ $FTP_REMOTE_PATH; bye" 2>&1 | tee -a "$LOG_FILE"; then
      # Videos are optional for weekly report runs; enable only when needed.
      if [ "${SYNC_VIDEOS:-0}" = "1" ]; then
        if ! lftp -d -e "set net:timeout 45; set net:max-retries 1; set net:reconnect-interval-base 5; set ftp:ssl-allow true; set ssl:verify-certificate false; open $FTP_HOST; user $FTP_USER '$FTP_PASS'; mirror -R --only-newer --parallel=1 dist/videos/ $FTP_REMOTE_PATH/videos; bye" 2>&1 | tee -a "$LOG_FILE"; then
          log "Video sync warning: continuing (reports deploy already complete)"
        fi
      else
        log "Skipping video sync (set SYNC_VIDEOS=1 to enable)"
      fi
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 5
  done
  return 1
}

write_deploy_marker() {
  local data_through
  data_through=$(node -e "const r=require('./src/data/reports.json');console.log(r.dataThrough)")
  python3 - "$RUN_ID" "$data_through" "$DEPLOY_MARKER" <<'PY'
import json, pathlib, sys, datetime
run_id, data_through, marker = sys.argv[1], sys.argv[2], sys.argv[3]
path = pathlib.Path("dist") / marker
payload = {
    "runId": run_id,
    "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    "dataThrough": data_through,
}
path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
print(f"Wrote deploy marker: {path}")
PY
}

verify_remote_marker() {
  local remote_marker
  remote_marker=$(lftp -e "set net:timeout 20; set net:max-retries 1; set ftp:ssl-allow true; set ssl:verify-certificate false; open $FTP_HOST; user $FTP_USER '$FTP_PASS'; cat $FTP_REMOTE_PATH/$DEPLOY_MARKER; bye" 2>/dev/null || true)
  echo "$remote_marker" | rg -q "\"runId\"\\s*:\\s*\"$RUN_ID\""
  log "Remote marker verified for runId $RUN_ID"
}

log "Starting Friday Reports Refresh (robust mode)"

if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    log "Another refresh run is already in progress. Lock file: $LOCK_FILE"
    exit 1
  fi
else
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    log "Another refresh run is already in progress. Lock dir: $LOCK_DIR"
    exit 1
  fi
  trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT
fi

if [ -f ".venv-refresh/bin/activate" ]; then
  # shellcheck disable=SC1091
  source ".venv-refresh/bin/activate"
  log "Activated virtual environment"
fi

run_step "preflight" preflight

run_step "linkedin_export" run_retry "LinkedIn strict export" bash scripts/download_linkedin_export.sh

run_step "refresh_reports" run_retry "Refresh reports" python scripts/refresh_reports.py

run_step "verify_local" verify_local_logged

run_step "build" run_retry "Build" npm run build

run_step "publish_window" wait_publish_logged

run_step "deploy" deploy_logged

run_step "verify_live" verify_live

step="complete"; set_state "done"
write_summary | tee -a "$LOG_FILE"
log "=== Friday Reports Refresh Completed Successfully ==="
log "State file: $STATE_FILE"
log "Log file: $LOG_FILE"
log "Summary file: $SUMMARY_FILE"
