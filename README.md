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
