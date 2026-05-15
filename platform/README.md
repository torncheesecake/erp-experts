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

## Operational State Summary

Use the Sentinel state command when you want the current persisted operating picture:

```bash
npm run platform:state
```

It reads SQLite and summarises tenant, latest health snapshot, recent runs, top persisted opportunities, plan summaries, approvals, plan statuses and the recommended next move. It also writes `reports/sentinel-state.json` as an ignored future API/state source.

The private `/seo-roadmap` operator dashboard consumes `reports/sentinel-state.json` for its compact Current Sentinel State panel. Stakeholder routes such as `/seo-progress` do not show this operational state.

`seo:inbox` also reads this state and places the current Sentinel recommendation at the top of the operator queue. This keeps the inbox focused on the practical next review action while the existing JSON report sources remain as fallback context.

Command distinction:

- `platform:status` is infrastructure and persistence counts.
- `seo:autopilot` runs the orchestration workflow and regenerates reports.
- `platform:state` explains what Sentinel currently knows from persisted state.

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
