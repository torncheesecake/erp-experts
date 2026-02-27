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

1. **Export data** from GA4 and LinkedIn into `src/exports/`
2. **Update** `src/data/reports.json` — either manually or via `python scripts/parse_all.py`
3. **Build and deploy** via the steps above

A GitHub Actions workflow runs daily at 9am and sends an email reminder when the data is more than 7 days old. This requires `SMTP_USERNAME` and `SMTP_PASSWORD` repository secrets to be configured.

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
