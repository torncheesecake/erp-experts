# Sentinel Tenant Foundation

Sentinel is the working name for the SEO/content operations platform. This folder starts the extraction of the ERP Experts SEO automation system into a reusable multi-client platform.

The current implementation is intentionally read-only. It does not move existing scripts, alter scoring logic, change article data, or change the `/seo-roadmap` dashboard.

## Structure

```text
platform/
  schema/
    tenant.schema.json
  tenants/
    erp-experts.config.json
```

## Current Tenant

`platform/tenants/erp-experts.config.json` describes the current ERP Experts site as Sentinel's first tenant.

It defines:

- tenant identity and domain
- article and demand data paths
- service and contact paths
- scoring, opportunity, conversion, freshness and internal-link profiles
- approval safety settings
- current SEO commands

## Loader

Use the read-only loader to validate and inspect a tenant config:

```bash
npm run platform:tenant -- erp-experts
```

The loader prints a summary and validates required fields. It does not mutate source files or generated reports.

## Tenant-Aware Reporting Commands

`seo:autopilot`, `seo:pipeline`, `seo:monitor`, `seo:stats` and `seo:opportunities` read the tenant config.

Default use still targets ERP Experts:

```bash
npm run seo:autopilot
npm run seo:pipeline
npm run seo:monitor
npm run seo:stats
npm run seo:opportunities
```

Explicit tenant use is also supported:

```bash
npm run seo:autopilot -- --tenant erp-experts
npm run seo:pipeline -- --tenant erp-experts
npm run seo:monitor -- --tenant erp-experts
npm run seo:stats -- --tenant erp-experts
npm run seo:opportunities -- --tenant erp-experts
```

These commands use the tenant name, report output path, dashboard route and base URL where relevant from `platform/tenants/erp-experts.config.json`. Their scoring, report generation, regression, consistency, orchestration and health logic are unchanged.

## Extraction Boundary

Most SEO engines still use their current ERP Experts paths. `seo:autopilot`, `seo:pipeline`, `seo:monitor`, `seo:stats` and `seo:opportunities` are tenant-aware at the orchestration/reporting layer. The next safe step is to make one more low-risk intelligence command tenant-aware in the same pattern and compare output before replacing broader engine behaviour.

## Platform Health Check

Use the read-only health check before deployment or server work:

```bash
npm run platform:health
```

The command checks the ERP Experts tenant config, SQLite schema/readiness, report presence, latest QA totals, deployment documentation and ignore policy for local runtime files. It does not initialise, migrate, deploy or edit content.

## Local Operator Startup

Use the local bootstrap command as the normal Sentinel operator entry point:

```bash
npm run platform:start
```

It runs `platform:health` and `seo:monitor`, checks whether the local API is reachable at `http://127.0.0.1:4317/health`, reads the persisted Sentinel state summary and prints the operator dashboard and stakeholder URLs. It does not deploy, open browsers, start Vite, edit content or start background daemons.

If you want the API server attached to the current terminal session, use:

```bash
npm run platform:start -- --with-api
```

This starts `platform:api:serve` only for the current foreground session when the API is not already running. Stop it with `Ctrl+C`. Keep this local-only until auth and Raspberry Pi service hardening are complete.

## Daily Operator Report

Use the daily report when you want a human-readable operator handoff:

```bash
npm run platform:daily
```

It reads the persisted Sentinel state through `platform/api/state_api.mjs`, adds the latest deployment readiness status if available, and writes `reports/sentinel-daily-operator-report.md`. The report is local/operator-only, ignored by Git, and is not stakeholder-facing.

## Stakeholder Weekly Report

Use the stakeholder report when you need a business-facing SEO and content progress summary:

```bash
npm run platform:stakeholder
```

It writes `reports/sentinel-stakeholder-weekly-report.md` as ignored local output. The content is plain English and excludes commands, prompts, approvals, database details, API details, private routes and operator-only diagnostics. Use `platform:daily` for Matthew/operator handoff and `platform:stakeholder` for Tim/Ric/internal business visibility.

## Local Automation Cadence

Use the cadence command when you want Sentinel to refresh state and reports in one safe local workflow:

```bash
npm run platform:cadence
npm run platform:cadence -- --dry-run
npm run platform:cadence -- --operator-only
npm run platform:cadence -- --stakeholder-only
```

Default cadence runs `seo:monitor`, `platform:state`, `platform:daily` and `platform:stakeholder`, then writes `reports/sentinel-cadence-summary.json` as ignored local output. It does not deploy, start the API, install cron jobs or expose services. See `docs/SENTINEL_AUTOMATION_CADENCE.md`.

## Operational State Summary

Use the Sentinel state command when you want the current persisted operating picture:

```bash
npm run platform:state
```

It reads SQLite through the read-only Sentinel state API and summarises tenant, latest health snapshot, recent runs, top persisted opportunities, plan summaries, approvals, plan statuses and the recommended next move. It also writes `reports/sentinel-state.json` as an ignored dashboard compatibility file.

For API-style inspection without writing files, use:

```bash
npm run platform:api
npm run platform:api -- --json
```

`platform/api/state_api.mjs` exposes read-only accessors such as `getOperationalSummary`, `getLatestSnapshot`, `getLatestRuns`, `getLatestOpportunities`, `getLatestPlans`, `getLatestApprovals` and `getLatestInboxItems`. This is the first reusable API layer over SQLite. It does not mutate the DB and does not replace the existing JSON report workflow yet.

For local HTTP testing, run:

```bash
npm run platform:api:serve
npm run platform:api:smoke
```

The HTTP prototype uses Node's built-in `http` module and defaults to `http://127.0.0.1:4317`. It exposes `GET /health`, `GET /state` and `GET /tenant`. It is read-only, has no authentication, and must not be exposed publicly. Keep it local until authentication and service hardening are added.

The Raspberry Pi service scaffold is also present but inactive:

```bash
npm run service:dry-run
```

It validates `deploy/systemd/sentinel-api.service.example` and prints the future systemd commands without copying files, reloading systemd, enabling services or starting anything. See `docs/RASPBERRY_PI_SERVICE_PLAN.md`.

Access-control planning is also scaffolded but inactive:

- `docs/SENTINEL_ACCESS_CONTROL_PLAN.md`
- `docs/SENTINEL_BASIC_AUTH_SETUP.md`
- `deploy/nginx/sentinel-basic-auth.example.conf`

The short-term recommendation is reverse-proxy basic auth for operator routes, while the API remains bound to `127.0.0.1`. No auth code is active in the app yet, and no credentials belong in the repo.

The private `/seo-roadmap` operator dashboard consumes `reports/sentinel-state.json` for its compact Current Sentinel State panel by default. For local API experiments, set:

```bash
VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317
```

When that Vite variable is present, `/seo-roadmap` tries the local API first and falls back quietly to the report JSON if the API is unavailable. Stakeholder routes such as `/seo-progress` do not show this operational state and do not use the operator API state.

`seo:inbox` also reads this state and places the current Sentinel recommendation at the top of the operator queue. This keeps the inbox focused on the practical next review action while the existing JSON report sources remain as fallback context.

Command distinction:

- `platform:status` is infrastructure and persistence counts.
- `seo:autopilot` runs the orchestration workflow and regenerates reports.
- `platform:state` exports the operational summary to ignored JSON for the dashboard.
- `platform:api` previews the same persisted state as a future API contract.
- `platform:api:serve` exposes the same read-only state over a local-only HTTP prototype.

## Deployment Readiness Scaffold

The Raspberry Pi server readiness scaffold is documentation-first:

- `docs/PINHOLE_SERVER_READINESS_CHECKLIST.md`
- `.env.example`
- `deploy/scripts/check-local.sh`
- `deploy/scripts/check-server.sh`

`check-local.sh` runs local validation. `check-server.sh` performs read-only environment and directory checks. Neither script deploys Sentinel.

## Raspberry Pi Deployment Target

The future deployment target is Matthew's Raspberry Pi server. Current files, commands and folders keep their existing names while Sentinel is extracted gradually. Do not rename commands or routes until a separate migration is planned.

## Run Logging

Sentinel now records a small SQLite run history for selected commands:

- `seo:monitor`
- `seo:pipeline`
- `seo:autopilot`
- `platform:health`

Run logging is additive and warning-only. If SQLite logging fails, the command should continue unless the command itself failed. Use `npm run platform:status` to see the run count, last run and latest five runs.

## Opportunity Summary Persistence

`seo:opportunities` now dual-writes the latest strategic opportunity summaries into SQLite after generating `reports/seo-opportunity-centre.json`.

This is intentionally append-only for now:

- JSON reports remain the runtime source for the dashboard and existing commands.
- SQLite accumulates platform history for future multi-client state.
- Persistence failures warn only and must not fail `seo:opportunities`.
- `npm run platform:status` shows the opportunity summary count, latest top opportunity and latest five persisted opportunity summaries.

Run `npm run platform:init` after pulling schema changes so the local SQLite database has the `opportunity_summaries` table.

## Execution Plan Summary Persistence

`seo:plans` now reads the tenant configuration and dual-writes the latest execution plan summaries into SQLite after generating `reports/seo-execution-plans.json`.

Default use still targets ERP Experts:

```bash
npm run seo:plans
npm run seo:plans -- --tenant erp-experts
```

The persisted summaries include plan ID, title, plan type, priority, impact, effort, confidence, safety level, review requirement and target slug/path. This is append-only for now.

JSON execution plans remain the runtime source for dashboard and automation behaviour. SQLite is accumulating workflow history so Sentinel can later track planning state across clients, approvals and execution.

Run `npm run platform:init` after pulling schema changes so the local SQLite database has the `plan_summaries` table.

## Approval And Plan Status Persistence

`seo:plan:approve` and `seo:plan:status` now keep their ignored JSON files and also dual-write workflow history into SQLite.

Default use still targets ERP Experts:

```bash
npm run seo:plan:approve -- <planId>
npm run seo:plan:approve -- <planId> --tenant erp-experts
npm run seo:plan:status
npm run seo:plan:status -- --tenant erp-experts
```

The persisted approval rows include plan ID, approval level, safety level, review requirement, note, source title and approval time. The persisted status rows include current status, validation state, next recommended step and last-updated time.

`reports/seo-plan-approvals.json` and `reports/seo-plan-status.json` remain ignored local operational state for now. SQLite is append-only workflow history, not yet the canonical execution state. DB write failures warn only.

Run `npm run platform:init` after pulling schema changes so the local SQLite database has the `plan_approvals` and `plan_statuses` tables.

## Action Inbox Persistence

`seo:inbox` now keeps `reports/seo-action-inbox.json` and also appends the top generated inbox items into SQLite.

Default use still targets ERP Experts:

```bash
npm run seo:inbox
npm run seo:inbox -- --tenant erp-experts
```

The persisted inbox rows include source, title, priority, status, recommended next step, command, target slug/path, safety level, human review flag and related IDs. The `sentinel_state` item is included when present, so the DB captures the practical operator queue, not only raw opportunity reports.

SQLite is append-only history for now. JSON remains the runtime/report source, and DB write failures warn only.

Run `npm run platform:init` after pulling schema changes so the local SQLite database has the `inbox_items` table.

## DB Retention Cleanup

Sentinel appends operational history into SQLite, so use the cleanup command periodically:

```bash
npm run platform:cleanup
npm run platform:cleanup -- --days 30 --keep-latest 20
npm run platform:cleanup -- --days 30 --keep-latest 20 --confirm
```

The default is dry-run only. Nothing is deleted unless `--confirm` is passed. Cleanup never deletes tenants, only applies to the selected tenant, keeps the latest rows per table, and only removes rows older than the retention window.

Covered tables:

- `runs`
- `snapshots`
- `opportunity_summaries`
- `plan_summaries`
- `plan_approvals`
- `plan_statuses`
- `inbox_items`

`platform:health` warns when append-heavy tables exceed 1,000 rows and suggests `npm run platform:cleanup`; high row counts do not fail health.

## Backup Verification And Restore Simulation

Backups are not trusted until they have been verified and restore-tested. Sentinel now includes read-only checks for the local SQLite state:

```bash
npm run backup:verify
npm run backup:restore:test
npm run backup:restore:test -- --keep-temp
```

`backup:verify` checks that the SQLite DB exists, runs the integrity helper, confirms required tables, prints row counts, prints file size and prints the last modified time. Local verification uses `platform/persistence/backups` by default. The folder is kept with `.gitkeep`, while real backup artefacts inside it are ignored.

`backup:restore:test` copies `platform.db` to a temporary restore-test file, validates the copy, prints the temporary path and removes it afterwards unless `--keep-temp` is supplied. It never overwrites the live DB.

`scripts/platform/platform_db_integrity.mjs` is the shared integrity helper used by backup verification, restore simulation and `platform:health`.

## Deployment Readiness Gate

Use the read-only deployment gate before any Raspberry Pi promotion work:

```bash
npm run platform:deploy:ready
```

It checks Git cleanliness, production build readiness, platform health, DB integrity, backup verification, restore simulation, SEO monitor, service scaffold readiness, deployment dry run and API smoke status if the local API is already running.

It does not deploy, SSH, upload files, create server directories, start services or expose the API. `READY WITH WARNINGS` is acceptable for local-only warnings such as API smoke skipped because the API server is not running. `NOT READY` blocks deployment work.

On the Raspberry Pi, real backups must live outside the repo, for example `/srv/matthew-platform/data/seo-ops/backups`, and should not use the local `.gitkeep` directory as the production backup destination.
