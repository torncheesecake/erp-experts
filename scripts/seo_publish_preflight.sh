#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

MAX_ATTEMPTS="${MAX_ATTEMPTS:-6}"
SLEEP_SECONDS="${SLEEP_SECONDS:-20}"
CHECK_HOSTS=("erpexperts.co.uk" "ftp.erpexperts.co.uk")

if [ ! -f ".ftpconfig" ]; then
  echo "[preflight] ERROR: .ftpconfig not found in $PROJECT_DIR" >&2
  exit 1
fi

FTP_HOST=$(sed -n 's/^FTP_HOST=//p' .ftpconfig | head -n1)
FTP_USER=$(sed -n 's/^FTP_USER=//p' .ftpconfig | head -n1)
FTP_PASS=$(sed -n 's/^FTP_PASS=//p' .ftpconfig | head -n1)

if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
  echo "[preflight] ERROR: FTP_HOST/FTP_USER/FTP_PASS missing in .ftpconfig" >&2
  exit 1
fi

resolve_host() {
  local host="$1"
  if command -v dig >/dev/null 2>&1; then
    dig +short "$host" | head -n1
    return 0
  fi

  if command -v nslookup >/dev/null 2>&1; then
    nslookup "$host" 2>/dev/null | awk '/^Address: /{print $2}' | tail -n1
    return 0
  fi

  return 1
}

check_dns_round() {
  local ok=0
  for host in "${CHECK_HOSTS[@]}"; do
    local resolved
    resolved="$(resolve_host "$host" || true)"
    if [ -n "$resolved" ]; then
      echo "[preflight] DNS ok: $host -> $resolved"
      ok=$((ok + 1))
    else
      echo "[preflight] DNS fail: $host"
    fi
  done

  [ "$ok" -eq "${#CHECK_HOSTS[@]}" ]
}

check_https_round() {
  curl -sS -I --max-time 15 "https://erpexperts.co.uk" >/dev/null
  echo "[preflight] HTTPS ok: https://erpexperts.co.uk"
}

check_ftp_round() {
  lftp -e "set net:timeout 25; set net:max-retries 1; set ftp:ssl-allow true; set ssl:verify-certificate false; open $FTP_HOST; user $FTP_USER '$FTP_PASS'; ls; bye" >/dev/null
  echo "[preflight] FTP login ok: $FTP_HOST"
}

run_with_retries() {
  local label="$1"
  shift
  local attempt=1

  while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    echo "[preflight] $label attempt $attempt/$MAX_ATTEMPTS"
    if "$@"; then
      echo "[preflight] $label passed"
      return 0
    fi

    if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
      echo "[preflight] $label failed, sleeping ${SLEEP_SECONDS}s"
      sleep "$SLEEP_SECONDS"
    fi

    attempt=$((attempt + 1))
  done

  echo "[preflight] $label failed after $MAX_ATTEMPTS attempts" >&2
  return 1
}

echo "[preflight] Starting publish connectivity checks"
run_with_retries "DNS" check_dns_round
run_with_retries "HTTPS" check_https_round
run_with_retries "FTP" check_ftp_round

echo "[preflight] PASS: all checks healthy"
