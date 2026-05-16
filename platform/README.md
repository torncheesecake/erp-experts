# Sentinel Tenant Foundation

Sentinel is the working name for the SEO/content operations platform. This folder starts the extraction of the ERP Experts SEO automation system into a reusable multi-client platform.

The current implementation is intentionally conservative. It does not move existing scripts, alter scoring logic or change article data. The private `/seo-roadmap` dashboard now has a narrow allowlisted action layer, but no arbitrary terminal access.

## Structure

```text
platform/
  schema/
    tenant.schema.json
  tenants/
    erp-experts.config.json
    tenant-registry.json
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

`platform/tenants/tenant-registry.json` is the lightweight active-tenant registry used by the Control Centre and local API. ERP Experts is currently the only active tenant. Multi-tenant switching, tenant-scoped auth and isolated dashboards are planned later.

## Loader

Use the read-only loader to validate and inspect a tenant config:

```bash
npm run platform:tenant -- erp-experts
```

The loader prints a summary and validates required fields. It does not mutate source files or generated reports.

## Tenant Scaffold

Use the scaffold command to propose a future tenant config without hand-editing JSON:

```bash
npm run platform:tenant:scaffold -- --tenant-id demo-client --name "Demo Client" --domain demo.example.com --base-url https://demo.example.com
```

The command is dry-run by default. It prints the proposed `platform/tenants/<tenant-id>.config.json` path and registry entry, but writes nothing unless `--write` is passed.

Future tenants start as `draft` by default. The command refuses `--status active` unless `--allow-active` is also passed. Draft tenants do not generate reports and are not operational until content sources, service paths, CTA maps, scoring profile and approval settings are reviewed.

Validate tenant registry and config consistency before adding or activating future tenants:

```bash
npm run platform:tenant:validate
npm run platform:tenant:validate -- --json
```

Validation checks registry/config matches, required tenant fields, allowed statuses, duplicate IDs, active tenant rules, ERP Experts active status and placeholder domains on active tenants. The intended lifecycle is scaffold, validate, then later activate explicitly after review.

`platform/tenants/demo-client.config.json` is a disabled fixture with registry status `example_disabled`. It proves Sentinel can validate more than one tenant entry without creating a second active client. It uses placeholder example paths and must not be used for live reporting, pipelines or automation.

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

## Doctor Diagnostics

Use the doctor command when something seems wrong and you need a concise troubleshooting view:

```bash
npm run platform:doctor
npm run platform:doctor -- --full
```

Default mode reads Git state, package scripts, SQLite integrity, persisted Sentinel state, latest cadence output, notification payload presence, local API availability, deployment readiness output and route-guard expectations. It writes `reports/sentinel-doctor.json` as ignored local diagnostic output and exits non-zero only for critical failures.

Full mode additionally runs `platform:health`, `backup:verify`, `platform:state` and `seo:monitor`. Use `platform:start` for daily operation. Use `platform:doctor` when the system needs diagnosing.

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

Default cadence runs `seo:monitor`, `platform:state`, `platform:daily`, `platform:stakeholder` and `platform:notify -- --all`, then writes `reports/sentinel-cadence-summary.json` as ignored local output. The private `/seo-roadmap` operator dashboard surfaces this latest cadence state in a compact panel. It does not send messages, deploy, start the API, install cron jobs or expose services. See `docs/SENTINEL_AUTOMATION_CADENCE.md`.

Raspberry Pi systemd timer templates are available but inactive:

```bash
npm run cadence:service:dry-run
```

The dry-run validates the cadence and stakeholder timer templates and prints future install commands only.

## Notification Payloads

Use notification payloads when you want a prepared message without sending anything:

```bash
npm run platform:notify -- --dry-run --all
npm run platform:notify -- --operator
npm run platform:notify -- --stakeholder
npm run platform:notify -- --all
```

Generated payloads are ignored under `reports/notifications/`. Operator payloads may include commands and private workflow context. Stakeholder payloads are sanitised and safety-scanned so they do not expose commands, prompts, approvals, database/API details, private route names or operator diagnostics. No email, Slack or external delivery integration exists yet. Cadence now prepares these payloads automatically for its selected mode, but still sends nothing.

## Sentinel Control Centre

The private `/seo-roadmap` route is now framed as the Sentinel Control Centre. It remains operator-only in local/dev use and production builds still redirect it to `/seo-progress` until authentication exists.

The Control Centre is now moving toward an app-shell structure:

- Top App Header: Sentinel branding, current tenant, health, workflow, cadence and readiness indicators.
- Left Navigation Rail: section-level navigation for Overview, State, Inbox, Opportunities, Actions, Cadence, Tenants and Diagnostics.
- Main Content Area: the current operator panels grouped by purpose rather than stacked as one long dashboard.
- Status Bar: lightweight readiness, cadence and state-source context.

The app shell remembers lightweight operator preferences in local browser storage:

- last selected section
- command search text and category filter
- collapsed sidebar state
- compact or expanded view preference
- selected collapsed panel states for supporting intelligence, the workbench and advanced diagnostics

This is local UI state only. It does not sync remotely and does not store command outputs, API payloads, credentials, notification payloads, report data or database state. The header includes a reset option that clears only this Sentinel Control Centre browser state.

Contextual operator help lives in `platform/help/control-centre-help.json`. The private Control Centre reads this metadata to explain the selected section, when to use it, safe notes and practical next actions. The help layer is operator-only, includes a subtle first-run hint, and is not shown on `/seo-progress`.

The Control Centre groups the operator experience into:

- System Status: health, workflow, cadence, readiness and doctor state.
- Current Focus: latest opportunity, latest plan, inbox item and recommended next step.
- Activity Feed: a concise chronological narrative of recent monitor runs, operator actions, cadence runs, report generation and notification payload preparation.
- Tenant: active client context, stakeholder route, operator route and default tenant scope.
- Tenant Registry: read-only preview of registered tenants, including active and disabled fixture entries.
- Operations: cadence, notification payloads, report generation and state refresh context.
- Tools & Commands: searchable command discovery, copy buttons and low-risk Run buttons for allowlisted actions only.
- Diagnostics: collapsed/secondary checks and future console direction.

The latest UX polish pass tightened the first-screen hierarchy around current focus, recommended next step and primary safe actions. Command groups are easier to scan, Activity Feed entries use calmer timeline styling and secondary details remain lower in the operator flow. This was a visual organisation pass only, with no SEO scoring or execution behaviour changes.

Operator feedback capture is now available for local workflow discovery. The private Control Centre can save short notes for UX, workflow, automation, deployment, API, tenant, bug and idea categories through the local API. The terminal equivalent is:

```bash
npm run platform:feedback -- --add --category ux --section overview --summary "Short note"
npm run platform:feedback -- --list
npm run platform:feedback -- --triage fb-123 --priority high --effort low --triage-status accepted --note "Do this next"
npm run platform:feedback -- --backlog
```

Feedback is stored locally in ignored `reports/operator-feedback.json`. It is not sent externally, not written to SQLite yet and not exposed on `/seo-progress`. The triage workflow adds priority, effort, triage status, optional ownership and notes so captured friction can become a lightweight improvement backlog. `npm run platform:feedback -- --backlog` generates ignored `reports/sentinel-feedback-backlog.md` with accepted items, new untriaged items, deferred items and a suggested next improvement.

Sentinel roadmap intelligence turns feedback triage, activity, cadence, readiness and persisted operational state into a local improvement roadmap for Sentinel itself:

```bash
npm run platform:roadmap
npm run platform:roadmap:plan
npm run platform:roadmap:plan -- --item roadmap-feedback-workflow-actions
npm run platform:roadmap:approve -- --item roadmap-feedback-workflow-actions --note "Approved for implementation planning"
npm run platform:roadmap:brief -- --item roadmap-feedback-workflow-actions
npm run platform:roadmap:package -- --item roadmap-feedback-workflow-actions
```

This generates ignored `reports/sentinel-roadmap.json` and `reports/sentinel-roadmap.md`. `platform:roadmap:plan` turns the top or selected roadmap item into ignored `reports/sentinel-roadmap-plan.json` and `reports/sentinel-roadmap-plan.md` with problem statement, evidence, scope, out-of-scope, implementation steps, safety constraints and validation. A roadmap plan is not implementation approval. `platform:roadmap:approve` writes ignored `reports/sentinel-roadmap-approvals.json` with local approval metadata, an expiry and `review_required` safety level before any separate implementation work begins. `platform:roadmap:brief` requires an active non-expired approval, then writes ignored `reports/sentinel-implementation-brief.json` and `reports/sentinel-implementation-brief.md` as planning detail. `platform:roadmap:package` then exports ignored `reports/sentinel-work-package.json` and `reports/sentinel-work-package.md` as the Codex-ready implementation handoff. The work package is still operator-controlled: it does not run Codex, generate patches or apply changes, but it gives the future implementation task a single file with exact scope, stop conditions, validation commands, deliverables and final response checklist. The scoring is heuristic and operator-guided: repeated or accepted feedback, low-effort/high-impact work, frequently used sections and deployment/readiness concerns rise in priority; deferred or rejected items drop down. It does not call external AI APIs, does not auto-code and does not expose roadmap intelligence, roadmap plans, approvals, briefs or work packages on `/seo-progress`.

The Activity Feed is backed by `platform/activity/activity_feed.mjs` and the local `GET /activity` API endpoint. It is operator-only, deliberately concise and does not show raw command output, stack traces or secrets. If the local API is unavailable, the Control Centre shows a calm fallback rather than failing.

Activity categories and severities are standardised in `platform/activity/activity-taxonomy.json`. New activity sources should use the allowed types (`system`, `operator`, `cadence`, `notification`, `deploy`, `backup`, `tenant`, `health`, `api`) and severities (`info`, `success`, `warning`, `error`). Run `npm run platform:activity:validate` to check the taxonomy and locally generated feed entries.

The Tenant Registry panel uses the local `GET /tenants` API when available and falls back to the bundled `platform/tenants/tenant-registry.json` file. It is intentionally read-only. ERP Experts is the only active tenant, `demo-client` is shown as a disabled fixture, and the Control Centre does not provide tenant switching or disabled-tenant actions.

Command metadata lives in `platform/commands/commands.json`. The registry also states the default tenant scope as `erp-experts`, so the dashboard can make clear that commands currently run against ERP Experts unless a command explicitly supports `--tenant`. Command discovery remains separate from execution. Any browser-triggered execution must go through the stricter action allowlist below, not through arbitrary command text.

## Controlled Operator Actions

Sentinel now has a narrow local action layer for the private Control Centre.

Action metadata lives in:

```text
platform/actions/actions.json
```

The local API exposes `POST /action` for allowlisted actions only. It rejects unknown action IDs, rejects actions not marked `allowFromUI`, runs fixed `npm run <script>` commands with `spawn` and no shell, applies timeouts and limits captured output. It records each action in `runs` as `ui_action:<id>` and stores a concise redacted result in `action_results`. It also exposes read-only `GET /actions/history` so the private dashboard can show recent actions, statuses and short summaries.

Initial UI actions are limited to low-risk local commands:

- `platform:start`
- `platform:doctor`
- `platform:state`
- `platform:daily`
- `platform:stakeholder`
- `platform:health`
- `platform:status`
- `platform:api`
- `seo:monitor`

Deploy, cleanup, restore, FTP, service installation and arbitrary shell commands are intentionally excluded. The dashboard shows Run buttons only for allowlisted actions, keeps full output out of the default view, shows collapsed capped excerpts and shows recent operator action history when the local API is running. See `docs/SENTINEL_OPERATOR_ACTIONS.md`.

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

The HTTP prototype uses Node's built-in `http` module and defaults to `http://127.0.0.1:4317`. It exposes read-only `GET /health`, `GET /state`, `GET /tenant`, `GET /tenants`, `GET /activity`, `GET /feedback` and `GET /actions/history` endpoints, plus controlled `POST /action` for allowlisted local operator actions, local-only `POST /feedback` for operator notes and `POST /feedback/triage` for feedback backlog updates. It has no authentication and must not be exposed publicly. Keep it local until authentication and service hardening are added.

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
- `platform:api:serve` exposes read-only state plus controlled allowlisted actions over a local-only HTTP prototype.
- `platform:doctor` is the troubleshooting command for fast local diagnostics, with optional `--full` checks.

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
