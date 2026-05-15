#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PACKAGE_JSON="$ROOT_DIR/package.json"
TEMPLATES=(
  "deploy/systemd/sentinel-cadence.service.example"
  "deploy/systemd/sentinel-cadence.timer.example"
  "deploy/systemd/sentinel-stakeholder.service.example"
  "deploy/systemd/sentinel-stakeholder.timer.example"
)

cd "$ROOT_DIR"

echo "Sentinel Cadence Service Dry Run"
echo
echo "Read-only check. No system files will be modified."
echo

for template in "${TEMPLATES[@]}"; do
  if [[ ! -f "$template" ]]; then
    echo "ERROR: Missing template: $template"
    exit 1
  fi
  echo "Template present: $template"
done

if ! grep -q '"platform:cadence"' "$PACKAGE_JSON"; then
  echo "ERROR: package.json does not include platform:cadence"
  exit 1
fi

echo
echo "Expected installed files:"
echo "  /etc/systemd/system/sentinel-cadence.service"
echo "  /etc/systemd/system/sentinel-cadence.timer"
echo "  /etc/systemd/system/sentinel-stakeholder.service"
echo "  /etc/systemd/system/sentinel-stakeholder.timer"
echo
echo "Expected schedules:"
echo "  sentinel-cadence.timer: Mon..Fri 07:30"
echo "  sentinel-stakeholder.timer: Mon 08:00"
echo
echo "Commands that would be run later during a controlled deployment:"
echo "  sudo cp deploy/systemd/sentinel-cadence.service.example /etc/systemd/system/sentinel-cadence.service"
echo "  sudo cp deploy/systemd/sentinel-cadence.timer.example /etc/systemd/system/sentinel-cadence.timer"
echo "  sudo cp deploy/systemd/sentinel-stakeholder.service.example /etc/systemd/system/sentinel-stakeholder.service"
echo "  sudo cp deploy/systemd/sentinel-stakeholder.timer.example /etc/systemd/system/sentinel-stakeholder.timer"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable sentinel-cadence.timer"
echo "  sudo systemctl enable sentinel-stakeholder.timer"
echo "  sudo systemctl start sentinel-cadence.timer"
echo "  sudo systemctl start sentinel-stakeholder.timer"
echo "  systemctl list-timers 'sentinel-*'"
echo
echo "Safety:"
echo "  - Do not install or enable timers yet."
echo "  - Keep API localhost-only."
echo "  - Keep .env secrets outside Git."
echo "  - Confirm backups, log paths and disk usage before enabling schedules."
echo "  - Review generated reports before sharing stakeholder summaries."
echo
echo "Status: cadence service dry run passed"
