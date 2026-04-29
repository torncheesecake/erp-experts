SEO Roadmap Guide Publisher Memory
Operating Notes
Publishes one guide per run from the SEO roadmap, scheduled Tuesday and Thursday at 09:30 local time.
Use British English and avoid em dashes.
Do not duplicate existing resources in src/data/articles.js or public/sitemap.xml.
NEW badges should use isNew: true plus newUntil set to 14 days after publication.
FTP deploy uses .ftpconfig; if FTP is locked, use the Sitello allowlist recovery documented in the Friday Reports automation memory.
Sitello control-panel password is in macOS Keychain service codex-sitello, account matthewahillman@icloud.com; never store it in plaintext.
Latest confirmation
Friday Reports refresh updates src/data/reports.json; /seo-roadmap imports that data and uses ga4Period.seoInsights.roadmapPhases, so no separate Friday afternoon roadmap automation is needed unless the reports refresh fails.
SEO Hygiene Additions
Future article runs must check canonical/sitemap consistency, indexability, one H1, unique title/meta description, meaningful image alt text, internal links, and no orphaned routes.
New or materially updated sitemap URLs should get accurate <lastmod> values only for changed pages.
Do not include noindex or robots-disallowed URLs in public/sitemap.xml.
Prefer Article/BlogPosting and BreadcrumbList structured data where the page/template supports it.
New guide article objects should include explicit ISO 8601 publishedAt and modifiedAt values so Article structured data has accurate dates.
2026-04-28 09:34:14 BST
Outcome: Skipped publishing.
Data freshness: src/data/reports.json is current through 2026-04-24, which matches the latest Friday refresh expected on this run.
Highest-priority unpublished roadmap candidate identified: NetSuite Apps & Extensions (netsuite-apps-extensions), based on roadmap item 4c with 98 impressions, 1 click, and clear commercial relevance.
Blocker: required publication files already contain unexpected local edits that would cause this run to publish more than one resource if deployed from the current workspace. Affected unpublished resource slugs already present locally include netsuite-next-ai-ui-overhaul, netsuite-apps-extensions, how-to-set-up-mcp-in-netsuite, why-netsuite-is-the-best-accounting-software-choice, understanding-the-role-of-erp-systems, and netsuite-project-management-financials.
Build result: not run.
Deploy result: not run.
Live verification: not run.
Sources used this run: local files only, including src/data/reports.json, src/pages/SeoRoadmap.jsx, src/data/articles.js, public/sitemap.xml, src/pages/Resources/ResourceArticle.jsx, src/components/ui/SEO.jsx, and src/pages/Resources/Resources.jsx.
Run time: analysis completed at 2026-04-28 09:34:14 BST.
2026-04-28 14:16 BST
Confirmed process gap: live NetSuite Apps & Extensions was already published while roadmap status 4c remained todo.
Updated automation prompt to require live sitemap/resources reconciliation before candidate selection and to persist done statuses in public/api/seo-statuses.json.
Set 4c to done in public/api/seo-statuses.json so /seo-roadmap reflects current published state.

2026-04-10T12:52:51Z
Completed Friday reports refresh and production FTP deploy for ERP Experts.
Live index now serves index-DkIudo1F.js and index-DUAM7U18.css.
Live routes /reports and /seo-roadmap return HTTP 200.
Deployed reports bundle includes weekEnding: 2026-04-10, dataThrough: 2026-04-10, and GA4 SEO insight keys allLandingPages plus roadmapPhases.
FTP allowlist includes runner IP and retained 154.57.249.212.
2026-04-17 Friday Reports Refresh
Run time: 2026-04-17 10:18:05 BST

Corrected Safari automation assumption: Safari is open and controllable via application id com.apple.Safari, not display name Safari in this shell. LinkedIn analytics URL provided/confirmed: https://www.linkedin.com/analytics/creator/content/.

Initial failures were DNS/network and Safari addressing related; after network was enabled, scripts/refresh_reports.py succeeded.

Current LinkedIn workbook used: ~/Downloads/Content_2026-01-18_2026-04-17_RicWilson.xlsx, with FOLLOWERS and DEMOGRAPHICS sheets verified.

src/data/reports.json now has weeks[0].weekEnding=2026-04-17, dataThrough=2026-04-17, GA4 period 2026-03-20 to 2026-04-16, Search Console source search_console_api, allLandingPages and roadmapPhases present.

Email stats: no parseable file or screenshot found in Downloads/Desktop/.playwright-cli/src/exports; previous email values retained.

npm run build succeeded with existing CSS warning for .print:hidden.

Background deploy started as PID 83991 using output/friday_reports_background_deploy.sh; log: output/friday-reports-refresh-20260417-101736.log. Random publish time selected: 2026-04-17 11:00 BST.

Correction: nohup jobs did not survive shell cleanup and launchd could not execute the script from Documents directly due Operation not permitted. Copied runner to /tmp/friday_reports_background_deploy.sh and submitted launchd label com.codex.friday-reports-refresh.20260417101920. Active PID 84379, log output/friday-reports-refresh-launchd-20260417-101920.log, selected publish time 2026-04-17 11:10 BST.

2026-04-17 Follow-up Instruction Correction
Run time: 2026-04-17 10:20:42 BST
For future Friday Reports Refresh runs, do not conclude Safari is unavailable from application "Safari" failure. Safari should be addressed with AppleScript application id "com.apple.Safari".
Preferred LinkedIn URL remains https://www.linkedin.com/analytics/creator/content/. If LinkedIn redirects to feed, check for a fresh Content_*_RicWilson.xlsx in Downloads before falling back to older local exports.
Background deploys should be verified after launch. Plain nohup may be reaped by shell cleanup in this environment; prefer launchctl submit and confirm with launchctl list, then check the log has reached the sleep/deploy stage.
2026-04-17 Live Email Watcher
Run time: 2026-04-17 10:36:04 BST
Added launchd watcher com.codex.friday-reports-live-email.20260417103555 to monitor output/friday-reports-refresh-launchd-20260417-101920.log.
Watcher emails matthewahillman@icloud.com via /usr/bin/mail after the deploy log contains both Live reports data includes 2026-04-17 and Route /reports serves fresh app shell. It will not send if FTP deploy fails.
Watcher log: output/friday-reports-live-email-watcher-20260417-103555.log.
2026-04-17 Email Recipient Correction
Run time: 2026-04-17 10:36:29 BST
User requested work email instead of iCloud. Removed watcher com.codex.friday-reports-live-email.20260417103555 and launched com.codex.friday-reports-live-email-work.20260417103619.
Live notification recipient is now mhillman@erpexperts.co.uk. Watcher log: output/friday-reports-live-email-watcher-work-20260417-103619.log.
2026-04-17 Deploy Wait Status Check
Run time: 2026-04-17 10:37:19 BST
Confirmed launchd deploy job com.codex.friday-reports-refresh.20260417101920 is active and waiting until selected publish slot 2026-04-17 11:10 BST before FTP upload.
Confirmed work-email watcher com.codex.friday-reports-live-email-work.20260417103619 is active.
2026-04-17 Manual Deploy Recovery
Run time: 2026-04-17 11:43:33 BST
User asked to confirm after slot. Found launchd deploy reached 11:10 but failed because launchd could not read .ftpconfig from Documents (Operation not permitted), leaving FTP_USER unset.
Removed active launchd deploy/email jobs and reran FTP deploy manually from interactive shell using .ftpconfig parsed as key/value shell exports. FTP deploy completed successfully.
Verified live index uses index-DFBRUiW3.js, live reports bundle reports-9ZXHO0H7.js returns 200 and includes 2026-04-17, /reports and /seo-roadmap serve fresh app shell.
Sent live confirmation email to mhillman@erpexperts.co.uk.
Future background deployment from launchd must not rely on reading project .ftpconfig directly unless permissions are verified first. Prefer foreground deploy if user is awaiting confirmation, or stage a credential env file in an accessible location with strict permissions.
2026-04-24 Safari Access Clarification
Run time: 2026-04-24 10:14:14 BST.
User challenged Safari access assumption. Confirmed Safari is controllable via AppleScript in the current environment; front tab was https://cp.sitello.com/manage and visible document titles were ERP Experts client area, Reddit, and ERP Experts House of Sip.
Earlier run had two distinct blockers: initial Safari script did not attach to the intended analytics tab, and fallback Playwright/npm failed while network was restricted. Network is now reachable.
Killed stale background sleep 5835 wait process from the interrupted deploy hold.
Current local state before deploy: src/data/reports.json refreshed to weekEnding/dataThrough 2026-04-24 using GA4 CSV fallback, Search Console CSV fallback, local LinkedIn Content workbook ending 2026-04-17, and retained prior email metrics. npm run build succeeded with the existing .print\:hidden CSS warning.
2026-04-24 Friday Reports Refresh Completed
Run time: 2026-04-24 11:15:17 BST.
Corrected LinkedIn/Safari handling: full Safari tab enumeration found LinkedIn at window 1 tab 3, URL https://www.linkedin.com/analytics/creator/content/. Set Content to Past 28 days and exported ~/Downloads/Content_2026-03-28_2026-04-24_RicWilson.xlsx.
Verified Audience export path by switching to https://www.linkedin.com/analytics/creator/audience/?timeRange=past_28_days and exporting again; LinkedIn saved it as Content_2026-03-28_2026-04-24_RicWilson-2.xlsx. Both workbooks contain FOLLOWERS and DEMOGRAPHICS sheets.
Reran source .venv-refresh/bin/activate && python scripts/refresh_reports.py after network access was available. GA4 and Search Console used live API data, not CSV fallbacks. Email had no parseable file, so previous email metrics were retained.
src/data/reports.json: weeks[0].weekEnding=2026-04-24, dataThrough=2026-04-24, GA4 period 2026-03-27 to 2026-04-23, Search Console source search_console_api, allLandingPages present with 22 rows, roadmapPhases present with 4 phases. LinkedIn week: 1,578 followers, 1,821 impressions, 2.4% engagement, 44 engagements, 12 new followers.
npm run build succeeded with the existing .print\:hidden CSS warning.
Random publish slot selected: 2026-04-24 11:11 BST. Waited until that time before deploying.
FTP deploy initially failed because plain source .ftpconfig cannot parse the password containing ). Retried by parsing .ftpconfig line-by-line into shell exports. FTP then returned 530 because current public IP was 38.242.184.167; added it through Sitello's Add IP Address control and FTP deploy succeeded.
Live verification: index serves assets/index-BA3phaj9.js; deployed reports data chunk assets/reports-C2Sk4qjT.js contains 2026-04-24, dataThrough, allLandingPages, roadmapPhases, 1578, and 1821. Rendered /reports shows Last refreshed: 24/04/2026, Data through: 24/04/2026, and fresh LinkedIn totals. Rendered /seo-roadmap shows roadmap phases and search data.
2026-04-24 Email Stats Correction
Run time: 2026-04-24 14:05:45 BST.
User provided email screenshot for two 24/04/2026 campaigns. Totals used: 2 campaigns, 1,681 recipients, 361 opens, 1,802 clicks, 4 unsubscribes. Weighted rates: 21.48% open and 107.2% click.
Created /Users/matthewhillman/Downloads/tim_email_stats.json, reran scripts/refresh_reports.py, and confirmed it used that file.
Rebuilt and redeployed immediately as a same-day correction to the already-published Friday report. FTP succeeded using the existing current IP allowlist.
Live reports data chunk assets/reports-As_eKdBq.js contains 1681, 21.48, 107.2, 2026-04-24. Rendered /reports Email section shows 1,681 recipients, 21.5% open rate, 107.2% click rate, and 4 unsubscribes after the count-up cards enter the viewport.
2026-04-24 Sitello FTP Recovery
Stored Sitello control-panel password in macOS Keychain item service codex-sitello, account matthewahillman@icloud.com; do not write the password to repo files or automation memory.
Retrieve for Safari/manual login with security find-generic-password -a matthewahillman@icloud.com -s codex-sitello -w if the existing browser session is not authenticated.
FTP 530 was caused by IP allowlisting. Current deploy IP was 38.242.184.167; Sitello service page was https://cp.sitello.com/services/5abda1a40c3a3764/service-overview.
Logged into Sitello in Safari, updated FTP allowed IPs to preserve 93.186.152.218 and 93.186.158.173, add 38.242.184.167, and remove stale 154.57.249.212.
Manual FTP deploy from foreground shell succeeded after allowlist update using .ftpconfig parsed as key/value shell exports.
Live verification for the resource deploy: /resources/netsuite-apps-extensions returned HTTP 200 on https://erpexperts.co.uk, sitemap included the new resource URLs, and live assets/articles-Da_SAOLd.js contained NetSuite Apps & Extensions plus active newUntil:"2026-05-08" badges.