#!/bin/bash
echo "=== LinkedIn Export (Codex-style) ==="

PROJECT_DIR="/Users/matthewhillman/Documents/E3/Wesbite redesign/erp-experts-pink"
cd "$PROJECT_DIR"

# Activate venv like the main script
if [ -f ".venv-refresh/bin/activate" ]; then
  source ".venv-refresh/bin/activate"
  echo "✅ Activated virtual environment"
fi

echo "Running LinkedIn export via refresh_reports.py..."
python scripts/refresh_reports.py --linkedin-only 2>&1 | tee /tmp/linkedin.log

if grep -q "success\|exported\|completed" /tmp/linkedin.log; then
  echo "✅ LinkedIn data exported successfully"
else
  echo "⚠️ LinkedIn export had issues - opening Safari for manual fallback"
  open -a Safari "https://www.linkedin.com/analytics/creator/content/"
fi

echo ""
echo "You can now run the full automation:"
echo "./scripts/friday_reports_refresh.sh"
