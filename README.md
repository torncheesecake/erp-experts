# ERP Experts Website

The main marketing website for [ERP Experts](https://erpexperts.co.uk) — UK-based NetSuite implementation and consulting specialists.

## Tech Stack

- **React 19** + **React Router 7** (SPA with client-side routing)
- **Vite 7** (build tooling)
- **Tailwind CSS 4** (styling)
- **Lucide React** (icons)
- **Apache** shared hosting via FTP

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Project Structure

```
src/
├── App.jsx                 # Routes and lazy-loaded page imports
├── main.jsx                # Entry point
├── index.css               # Global styles and Tailwind config
├── components/ui/          # Shared UI components (LeadMagnet, etc.)
├── data/
│   ├── reports.json        # Weekly marketing dashboard data (GA4 + LinkedIn)
│   └── articles.js         # Resource/blog article definitions
├── exports/                # Raw GA4 CSV and LinkedIn Excel exports
├── hooks/                  # Custom React hooks
├── pages/                  # Page components (one per route)
│   ├── Home/
│   ├── About/
│   ├── Implementation/
│   ├── Support/
│   ├── CaseStudies/
│   ├── Contact/
│   ├── Resources/
│   ├── WhatIsNetSuite/
│   ├── FAQ/
│   ├── Partners/
│   ├── Reports.jsx         # Internal marketing dashboard (not indexed)
│   └── ...
├── assets/                 # Images (avif/webp)
└── quizlift/               # NETscore quiz submodule
scripts/
├── parse_exports.py        # Parse GA4 CSVs + LinkedIn xlsx → reports.json
├── parse_ga4_monthly.py    # Parse monthly GA4 snapshots
└── parse_all.py            # Run all parsers
public/
├── .htaccess               # Apache config: SPA fallback, 301 redirects, caching
├── sitemap.xml
├── robots.txt
└── videos/
```

## Deployment

The site is deployed to Apache shared hosting via FTP. Credentials are in `.ftpconfig` (not committed to git).

```bash
npm run build
lftp -c "set ssl:verify-certificate no; open -u \$FTP_USER,'\$FTP_PASS' \$FTP_HOST; mirror -R --verbose --delete dist/ public_html/"
```

## Updating Reports Data

The marketing dashboard at `/reports` is powered by `src/data/reports.json`. To update:

1. **Export LinkedIn** into `~/Downloads` (weekly workbook named `Content_YYYY-MM-DD_YYYY-MM-DD_RicWilson.xlsx`)
2. **Ensure GA service account JSON** exists (default path: `credentials/google-service-account.json`)
3. **Optional Tim email stats file** in `~/Downloads` (`.csv`, `.xlsx`, or `.json`)
4. Run `python3 scripts/refresh_reports.py`
5. **Build and deploy** via the steps above

`scripts/refresh_reports.py` now polls `~/Downloads` for Tim's email stats while it is processing GA4 and LinkedIn data.  
If no parseable email file is found, it keeps the previous email values in `reports.json`.

Supported email metric fields (case/format insensitive):

- `campaignsSent`
- `totalRecipients`
- `openRate`
- `clickRate`
- `unsubscribes`

Optional environment variables for the refresh script:

- `GOOGLE_SERVICE_ACCOUNT_JSON` (override service account file path)
- `GA4_PROPERTY_ID` (override GA4 property id)
- `EMAIL_WAIT_MINUTES` (default `20`)
- `EMAIL_POLL_SECONDS` (default `20`)
- `LINKEDIN_SKIP_PROMPT=1` (skip the Enter prompt in `download_linkedin_export.sh`)

The file at `credentials/google-service-account.json` is git-ignored and intended for the live key.

### LinkedIn Export Helper

For a supervised LinkedIn export, run:

```bash
./scripts/download_linkedin_export.sh
python3 scripts/refresh_reports.py
```

What it does:

- opens LinkedIn content analytics in headed Chrome
- reuses a saved local browser state from `~/.codex/linkedin-erp-experts-state.json` if present
- lets you complete login or MFA if LinkedIn asks for it
- saves the latest workbook into `~/Downloads`, where `scripts/refresh_reports.py` will pick it up

This is intended as a supervised fallback. It is not a good candidate for unattended scheduling because LinkedIn login and export flows are brittle.

### One Command Refresh

If you want the LinkedIn export and reports refresh in one step, run:

```bash
./scripts/refresh_reports_with_linkedin.sh
```

That will:

- open LinkedIn analytics in Chrome
- export the latest LinkedIn workbook into `~/Downloads`
- refresh `src/data/reports.json` from LinkedIn, GA4, Search Console, and Tim email stats (if available)
- remove LinkedIn export workbooks from `~/Downloads` after a successful refresh

A GitHub Actions workflow sends an email when `src/data/reports.json` is updated on `main`. This requires `SMTP_USERNAME` and `SMTP_PASSWORD` repository secrets to be configured.

## SEO Redirects

Old-site URLs (from the previous Wix site) are 301-redirected in `public/.htaccess` to their new equivalents. This covers `/post/*`, `/netsuite-*`, `/services/*`, `/blog/*`, and other legacy paths. React Router also handles these client-side as a fallback.

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_NETSUITE_FORM_URL` | NetSuite Suitelet endpoint for contact form submissions |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID |
| `VITE_LEAD_CAPTURE_URL` | Lead capture API endpoint (optional) |

## Design System

See `DESIGN_LANGUAGE.md` for the full brand guide — colours, typography, spacing, and component patterns.

## SEO Roadmap Status Source

- Canonical status endpoint: `/api/seo-statuses.php` (read and write).
- Storage file: `public/api/seo-statuses.json` (persisted status map used by PHP).
- Frontend fallback: if PHP is unavailable, `/seo-roadmap` reads `/api/seo-statuses.json` as read-only fallback and shows a warning when writes are not guaranteed.
- Current limitation: this repo does not implement full server-side user authentication for roadmap edits. Any client-side edit gate is exposure reduction only, not secure auth.

## Resource QA Scoring and Publish Gate

Run:

```bash
npm run qa:resources
```

What it does:

- Scores each resource article in `src/data/articles.js` across:
  - metadata completeness
  - content depth
  - duplicate or cannibalisation risk
  - CTA and service relevance
  - freshness and `publishedAt` validity
  - internal link readiness (detectable route/path signals)
- Writes a structured report to `reports/resource-qa-report.json`.
- Prints a console summary with publish gate suggestions per article:
  - `pass`
  - `needs_review`
  - `blocked`

Behaviour:

- Non-destructive by default.
- The script fails only on serious structural errors (for example missing required metadata blocks, duplicate slugs/titles, or invalid `publishedAt` values when present).
- Content quality concerns are reported as warnings and gate suggestions in the JSON report.

## SEO Roadmap Fix vs Create Recommendations

The admin SEO roadmap now derives read-only recommendations by combining:

- Resource QA report data (`reports/resource-qa-report.json`)
- Search demand signals from `src/data/reports.json` (`contentGaps` and `topicBacklogV2`)
- Existing roadmap status context where titles match

Recommendation types:

- `improve_existing`: existing article has weak QA signals and should be improved first
- `create_new`: demand and content-gap signal suggests a new article
- `monitor`: article quality is acceptable but demand warrants close tracking
- `blocked_review`: structural QA issues must be fixed before action

Each recommendation includes title, optional slug, reason, priority score, source signals, and suggested next action.

## SEO Action Briefs

Run:

```bash
npm run seo:briefs
```

This reads `reports/resource-qa-report.json`, `src/data/reports.json`, and current SEO roadmap statuses, then writes `reports/seo-action-briefs.json`.

Each brief includes the recommendation type, target article/title, existing slug where available, priority score, why it matters, primary issue, suggested content changes, suggested internal links, CTA angle, and a review checklist. The roadmap admin view also shows compact read-only briefs for the current top recommendations.

Brief batching now supports both dashboard and sprint planning outputs:

- `briefs`: top 5 briefs for dashboard display
- `sprintBacklogBriefs`: next backlog briefs (up to rank 15) for controlled sprint planning
- `allBriefs`: full generated brief set for automation analysis

Brief priority now includes commercial conversion intent, not just QA weakness or search demand. Topics score higher when they relate to NetSuite implementation, NetSuite support, ERP consultants or partners, manufacturing ERP, finance/accounting systems, migration, rescue, failed implementation, or aftercare. Generic informational topics such as `what is ERP` score lower unless the topic has clear service relevance.

Each brief includes:

- `conversionIntentScore`: 0-100 commercial intent score
- `conversionIntentLabel`: `high`, `medium`, or `low`
- `recommendedCTA`: one of `audit/readiness check`, `support review`, `implementation consultation`, `manufacturing ERP discussion`, or `finance systems review`
- `displayRank`: rank in the full recommendation set before dashboard truncation
- `sprintCandidate`: true when suitable for sprint backlog planning (outside top 5, within backlog window, non-monitor)
- `sprintReason`: plain-English reason why the brief is in sprint backlog
- `articleTypeBucket`: `commercial`, `informational`, `support`, `implementation`, `partner`, `manufacturing`, or `finance`
- `estimatedBusinessValue`, `estimatedLeadIntent`, `assistedConversionPotential`, `strategicImportance`, and `confidenceLevel`: 0-100 estimated outcome scores
- `outcomeLabel`: `high_value`, `medium_value`, or `awareness_only`
- `whyThisMattersCommercially`: a short explanation of the estimated commercial value
- `channelOutputs`: compact supporting outputs for LinkedIn, email nurture, sales follow-up, FAQ questions, meta title, and meta description
- `implementationPlan`: for `improve_existing` briefs only, a practical edit plan covering sections to improve, missing elements, suggested new headings, stronger CTA recommendation, internal links to add, risk notes, and review questions
- `codexPatchPrompt`: for `improve_existing` briefs only, a concise copy-ready prompt for safely editing the target article in `src/data/articles.js`
- `leadsGenerated`, `assistedConversions`, `rankingMovement`, and `manualOutcomeNotes`: future-ready placeholders for real outcome feedback

Channel outputs are angles, not ready-to-publish copy. They are intended to help one resource idea feed the wider marketing and sales loop while still requiring human review.

Outcome scoring is estimation-based only. It currently uses conversion intent, topic category, ERP Experts service relevance, and weighted commercial themes such as implementation, support, manufacturing ERP, finance/accounting systems, migration, rescue, failed implementation, and aftercare. Generic informational searches are deliberately reduced unless there is a clear service-relevant angle. The placeholder outcome fields are not connected to CRM, analytics attribution, or rank tracking yet.

Implementation plans are read-only planning aids. They are generated from Resource QA weaknesses, conversion intent, CTA type, and source signals so a human or Codex can improve an existing article without changing the article automatically. They should be reviewed before editing `src/data/articles.js`.

Codex patch prompts are generated from the implementation plan and include strict constraints: edit only the target article object, preserve article data shape, avoid component redesigns or route changes, do not invent customer stories or statistics, use UK English, and run the validation commands after editing. Prompts now also include anti-repetition guidance to vary CTA wording and conclusion structure and avoid repeated stock phrases across batch edits.

Generated `create_new` briefs include both:

- `rawQuery`: the original demand signal
- `preferredTitle`: a cleaned human-facing B2B title

Title normalisation uppercases `ERP`, preserves `NetSuite` casing, prefers `UK` for UK search intent, removes awkward phrases such as `Which X are best for...`, and avoids generic suffixes such as `How to Choose and Deliver`.

Example:

- Bad: `Which Erp Consultants Are Best For Small It And Software Development Companies In Great Britain`
- Better: `How UK Software Companies Should Choose an ERP Consultant`

Briefs also include title quality flags for overly long titles, keyword-stuffed wording, awkward phrases, and casing mistakes such as `Erp`.

## Repeated Phrase QA Warning

`npm run qa:resources` now includes a warning-only cross-article repeated-phrase check for CTA/conclusion-heavy stock phrases (for example repeated CTA labels or repeated boilerplate wording).

- It does not fail the build.
- It is intended to surface style drift risk during multi-article sprints.

## SEO Weekly Summary

Run after Resource QA and action briefs:

```bash
npm run seo:summary
```

This reads `reports/resource-qa-report.json`, `reports/seo-action-briefs.json`, and `src/data/reports.json`, then writes `reports/seo-weekly-summary.json`.

The summary is designed for non-technical stakeholders. It includes:

- headline summary
- top three recommended actions
- highest commercial opportunity
- biggest quality risk
- create vs improve split
- pages needing review count
- blocked count
- suggested focus for next week

The admin SEO roadmap loads this report as a compact read-only executive summary. It does not edit, publish, or schedule content.

## SEO Pipeline Orchestration

Run the full operational pipeline:

```bash
npm run seo:pipeline
```

Pipeline behaviour:

- runs `qa:resources`, `seo:briefs`, and `seo:summary` in sequence
- validates expected report files exist
- writes `reports/seo-pipeline-summary.json`
- creates timestamped snapshots in `reports/history/YYYY-MM-DD-HHmm/`
- compares against the previous snapshot and reports:
  - pass / needs_review / blocked deltas
  - newly passing and newly failing articles
  - recommendation count changes

The pipeline also sets review flags:

- `humanReviewRecommended`
- `reason`

Flag logic currently checks blocked items, large score swings, structural regressions, and high commercial briefs with low confidence.

## SEO Helper Commands

Quick operational helpers (read-only terminal views):

```bash
npm run seo:needs-review
npm run seo:passes
npm run seo:blocked
npm run seo:sprint
npm run seo:top
npm run seo:stats
npm run seo:verify -- <slug>
npm run seo:after-edit -- <slug>
```

Cheat sheet:

- `seo:needs-review`: list all `needs_review` articles with title, slug, score, gate
- `seo:passes`: list all `pass` articles with title, slug, score, gate
- `seo:blocked`: list all `blocked` articles with title, slug, score, gate
- `seo:sprint`: show sprint backlog candidates with recommendation type and `displayRank`
- `seo:top`: show dashboard top 5 briefs
- `seo:stats`: show QA totals plus pipeline diff and review flag
- `seo:verify -- <slug>`: verify one article after an edit, including score, gate, warnings, newlyPassing/newlyFailing status, related brief, repetition warnings, and review flag
- `seo:after-edit -- <slug>`: run pipeline first, then verify one edited article, with a combined operational summary

## SEO Automation Status

For a full system status snapshot, proven workflow tests, risk register, and future backlog, see `docs/SEO_AUTOMATION_STATUS.md`.

For the latest sprint progress summary and next-priority decision, see `docs/SEO_SPRINT_CHECKPOINT.md`.

## SEO Quality CI

GitHub Actions workflow: `.github/workflows/seo-quality.yml`

Triggers:

- pull requests
- pushes to `main`
- manual run (`workflow_dispatch`)

CI steps:

1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. `npm run seo:pipeline`
5. `npm run seo:stats`

Reports uploaded as artefact (`seo-reports`):

- `reports/resource-qa-report.json`
- `reports/seo-action-briefs.json`
- `reports/seo-weekly-summary.json`
- `reports/seo-pipeline-summary.json`

Current gate behaviour:

- CI fails on command/script errors (lint/build/pipeline/stats).
- CI does not fail just because some articles are still `needs_review`.
- Blocked count is printed in job logs for visibility.

## SEO Roadmap Dashboard v2

Purpose:

- Make `/seo-roadmap` usable as an operator control panel for choosing the next article improvement task.
- Keep automation outputs visible without forcing operators through raw technical panels first.

What it does:

- Shows weekly summary, QA totals, human review flag, pipeline snapshot, and suggested next action at the top.
- Adds an Article Workbench with filter and sort controls.
- Supports article selection with detail view for warnings, structural issues, related recommendation, brief, implementation plan, and Codex prompt where available.
- Adds a front-end-only Fix Planner that generates a copy-friendly Codex prompt preview based on selected toggles.
- Keeps deeper raw sections in collapsed Advanced diagnostics.

What it does not do:

- Does not edit article files.
- Does not run server-side write actions from the browser.
- Does not change scoring logic or report structures.
- Does not auto-publish content.

Manual workflow:

1. Select article in the workbench.
2. Choose fixes in Fix Planner.
3. Copy prompt for Codex.
4. Run Codex patch safely.
5. Run `npm run seo:after-edit -- <slug>` to validate.
