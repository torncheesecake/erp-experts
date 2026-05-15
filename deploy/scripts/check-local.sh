#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "Local platform readiness check"
echo "Root: $ROOT_DIR"

npm run lint
npm run build
npm run platform:health
npm run seo:monitor

echo "Local platform readiness check passed"
