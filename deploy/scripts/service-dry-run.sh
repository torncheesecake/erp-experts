#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEMPLATE_PATH="$ROOT_DIR/deploy/systemd/sentinel-api.service.example"
PACKAGE_JSON="$ROOT_DIR/package.json"

echo "Sentinel API Service Dry Run"
echo
echo "Read-only check. No system files will be modified."
echo

if [[ ! -f "$TEMPLATE_PATH" ]]; then
  echo "ERROR: Missing service template: deploy/systemd/sentinel-api.service.example"
  exit 1
fi

if ! grep -q '"platform:api:serve"' "$PACKAGE_JSON"; then
  echo "ERROR: package.json does not include platform:api:serve"
  exit 1
fi

echo "Template: deploy/systemd/sentinel-api.service.example"
echo "Expected installed service: /etc/systemd/system/sentinel-api.service"
echo "Expected app directory: /srv/matthew-platform/apps/seo-ops"
echo "Expected env file: /srv/matthew-platform/apps/seo-ops/.env"
echo "Expected bind: 127.0.0.1:4317"
echo
echo "Commands that would be run later during a controlled deployment:"
echo "  sudo cp deploy/systemd/sentinel-api.service.example /etc/systemd/system/sentinel-api.service"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable sentinel-api"
echo "  sudo systemctl start sentinel-api"
echo "  sudo systemctl status sentinel-api"
echo
echo "Post-start smoke test:"
echo "  npm run platform:api:smoke"
echo
echo "Safety:"
echo "  - Do not expose the API publicly yet."
echo "  - Keep it bound to 127.0.0.1 until auth exists."
echo "  - Do not put secrets in the repo."
echo "  - Back up platform.db before any real service migration."
echo
echo "Status: dry run passed"
