#!/bin/bash
set -euo pipefail

echo "=== LinkedIn Export (strict mode) ==="

PROJECT_DIR="/Users/matthewhillman/Documents/E3/Wesbite redesign/erp-experts-pink"
cd "$PROJECT_DIR"

# Activate venv like the main script
if [ -f ".venv-refresh/bin/activate" ]; then
  source ".venv-refresh/bin/activate"
  echo "✅ Activated virtual environment"
fi

latest_epoch() {
  local pattern="$1"
  local latest=0
  local candidate
  for dir in "$HOME/Downloads" "$PROJECT_DIR/.playwright-cli" "$PROJECT_DIR/src/exports"; do
    [ -d "$dir" ] || continue
    while IFS= read -r -d '' candidate; do
      mtime=$(stat -f "%m" "$candidate" 2>/dev/null || echo 0)
      if [ "$mtime" -gt "$latest" ]; then
        latest="$mtime"
      fi
    done < <(find "$dir" -maxdepth 1 -type f -name "$pattern" -print0 2>/dev/null)
  done
  echo "$latest"
}

content_before=$(latest_epoch "Content_*_RicWilson*.xlsx")
audience_before=$(latest_epoch "Audience_*_RicWilson*.xlsx")

run_safari_linkedin_exports() {
osascript <<'APPLESCRIPT'
on run
  tell application "Safari"
    if (count of windows) = 0 then return
    set targetWindow to front window
    set targetTab to missing value
    repeat with t in tabs of targetWindow
        set u to URL of t
        if u contains "linkedin.com/analytics/creator" then
          set targetTab to t
          exit repeat
        end if
    end repeat
    if targetTab is missing value then
      set targetTab to current tab of targetWindow
    end if
    set URL of targetTab to "https://www.linkedin.com/analytics/creator/content/?timeRange=past_28_days"
  end tell
  delay 10
  tell application "Safari"
    do JavaScript "
      (function () {
        const txt = (el) => (el && (el.innerText || el.textContent || '') || '').trim();
        const clickByText = (targets) => {
          const nodes = Array.from(document.querySelectorAll('button, [role=\"button\"], a, span'));
          for (const t of targets) {
            const n = nodes.find(x => txt(x) === t || txt(x).includes(t));
            if (n) { n.click(); return true; }
          }
          return false;
        };
        clickByText(['Past 28 days', 'Last 28 days', 'Date range']);
      })();
    " in targetTab
  end tell
  delay 3
  tell application "Safari"
    do JavaScript "
      (function () {
        const txt = (el) => (el && (el.innerText || el.textContent || '') || '').trim();
        const nodes = Array.from(document.querySelectorAll('button, [role=\"button\"], a, span'));
        const pick = nodes.find(x => txt(x) === 'Past 28 days' || txt(x).includes('Past 28 days') || txt(x).includes('Last 28 days'));
        if (pick) pick.click();
      })();
    " in targetTab
  end tell
  delay 3
  tell application "Safari"
    do JavaScript "
      (function () {
        const txt = (el) => (el && (el.innerText || el.textContent || '') || '').trim();
        const nodes = Array.from(document.querySelectorAll('button, [role=\"button\"], a'));
        const exports = nodes.filter(x => txt(x) === 'Export' || txt(x).includes('Export'));
        if (exports.length) exports[0].click();
      })();
    " in targetTab
  end tell
  delay 8
  tell application "Safari"
    set URL of targetTab to "https://www.linkedin.com/analytics/creator/audience/?timeRange=past_28_days"
  end tell
  delay 10
  tell application "Safari"
    do JavaScript "
      (function () {
        const txt = (el) => (el && (el.innerText || el.textContent || '') || '').trim();
        const nodes = Array.from(document.querySelectorAll('button, [role=\"button\"], a, span'));
        const range = nodes.find(x => txt(x) === 'Past 28 days' || txt(x).includes('Past 28 days') || txt(x).includes('Last 28 days') || txt(x).includes('Date range'));
        if (range) range.click();
      })();
    " in targetTab
  end tell
  delay 3
  tell application "Safari"
    do JavaScript "
      (function () {
        const txt = (el) => (el && (el.innerText || el.textContent || '') || '').trim();
        const nodes = Array.from(document.querySelectorAll('button, [role=\"button\"], a, span'));
        const p28 = nodes.find(x => txt(x) === 'Past 28 days' || txt(x).includes('Past 28 days') || txt(x).includes('Last 28 days'));
        if (p28) p28.click();
      })();
    " in targetTab
  end tell
  delay 3
  tell application "Safari"
    do JavaScript "
      (function () {
        const txt = (el) => (el && (el.innerText || el.textContent || '') || '').trim();
        const nodes = Array.from(document.querySelectorAll('button, [role=\"button\"], a'));
        const exports = nodes.filter(x => txt(x) === 'Export' || txt(x).includes('Export'));
        if (exports.length) exports[0].click();
      })();
    " in targetTab
  end tell
  delay 8
end run
APPLESCRIPT
}

echo "Attempting Safari export automation (Content + Audience, Past 28 days)..."
for i in 1 2 3; do
  echo "Safari export attempt $i/3"
  run_safari_linkedin_exports || true
  sleep 6
  content_after=$(latest_epoch "Content_*_RicWilson*.xlsx")
  audience_after=$(latest_epoch "Audience_*_RicWilson*.xlsx")
  if [ "$content_after" -gt "$content_before" ] && [ "$audience_after" -gt "$audience_before" ]; then
    break
  fi
done

echo "Waiting briefly for downloads to complete..."
sleep 8

content_after=$(latest_epoch "Content_*_RicWilson*.xlsx")
audience_after=$(latest_epoch "Audience_*_RicWilson*.xlsx")

if [ "$content_after" -le "$content_before" ] || [ "$audience_after" -le "$audience_before" ]; then
  echo "❌ Safari export attempt did not produce fresh Content and Audience workbooks"
  echo "Manual action needed in signed-in Safari:"
  echo "1) Content analytics -> Past 28 days -> Export"
  echo "2) Audience analytics -> Past 28 days -> Export (must include FOLLOWERS and DEMOGRAPHICS)"
  exit 1
fi

echo "Running LinkedIn refresh with strict export checks..."
python scripts/refresh_reports.py --linkedin-only --strict-linkedin 2>&1 | tee /tmp/linkedin.log

if grep -Eqi "Updated reports\\.json \\(LinkedIn only\\)|Audience export OK" /tmp/linkedin.log; then
  echo "✅ LinkedIn data exported successfully"
else
  echo "❌ LinkedIn export validation failed"
  echo "Manual action needed in signed-in Safari:"
  echo "1) Content analytics -> Past 28 days -> Export"
  echo "2) Audience analytics -> Past 28 days -> Export (must include FOLLOWERS and DEMOGRAPHICS)"
  exit 1
fi

echo ""
echo "You can now run the full automation:"
echo "./scripts/friday_reports_refresh.sh"
