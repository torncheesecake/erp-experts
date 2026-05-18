# Sentinel Tenant Foundation

Sentinel is the working name for the SEO/content operations platform. This folder starts the extraction of the ERP Experts SEO automation system into a reusable multi-client platform.

The current implementation is intentionally conservative. It does not move existing scripts, alter scoring logic or change article data. The private `/seo-roadmap` dashboard now has a narrow allowlisted action layer, but no arbitrary terminal access.

The current stable Pi operating state is documented in `docs/SENTINEL_V1_OPERATIONAL_BASELINE.md`: service active, API localhost-only, canonical DB active, backup verified, restore simulation passed and remote authority scaffold present but disabled.

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

The private `/seo-roadmap` route is now framed as the Sentinel Control Centre. It remains operator-only in local/dev use and production builds still redirect it to `/seo-progress` until authentication exists. The future ownership model is that operator controls should only unlock when authorised by Matthew's Sentinel API, likely running on the Raspberry Pi or another Matthew-controlled server.

The Control Centre is now moving toward an app-shell structure:

- Top App Header: Sentinel branding, current tenant, health, workflow, cadence and readiness indicators.
- Left Navigation Rail: section-level navigation for Overview, State, Inbox, Content Workbench, Opportunities, Actions, Cadence, Tenants and Diagnostics.
- Main Content Area: the current operator panels grouped by purpose rather than stacked as one long dashboard.
- Status Bar: lightweight readiness, cadence and state-source context.

The app shell remembers lightweight operator preferences in local browser storage:

- last selected section
- command search text and category filter
- collapsed sidebar state
- compact or expanded view preference
- selected collapsed panel states for supporting intelligence, the workbench and advanced diagnostics

This is local UI state only. It does not sync remotely and does not store command outputs, API payloads, credentials, notification payloads, report data or database state. The header includes a reset option that clears only this Sentinel Control Centre browser state.

The Control Centre also supports saved local operator workspaces in `sentinel.operatorWorkspaces.v1`. Built-in presets cover Monitoring, Development, Deployment and Roadmap Review. Matthew can switch between them, create custom workspaces from the current layout, overwrite custom workspaces, delete custom workspaces and reset the selected workspace. These workspaces are browser-local only and store section, command filter, search, compact mode, sidebar state and panel collapse preferences. They do not sync remotely and do not store secrets, command output, reports or database state.

Contextual operator help lives in `platform/help/control-centre-help.json`. The private Control Centre reads this metadata to explain the selected section, when to use it, safe notes and practical next actions. The help layer is operator-only, includes a subtle first-run hint, and is not shown on `/seo-progress`.

The Content Workbench is now the primary editorial/operator surface inside `/seo-roadmap`. It turns existing opportunities, plans, inbox items, article QA rows and recommendations into content work cards with lifecycle status, priority, category, next action and linked context. Status changes are browser-local workflow state in `sentinel.contentWorkbench.v1`; they do not publish articles, generate articles, run commands or change SEO scoring. See `docs/SENTINEL_CONTENT_WORKBENCH.md`.

The Control Centre groups the operator experience into:

- System Status: health, workflow, cadence, readiness and doctor state.
- Current Focus: latest opportunity, latest plan, inbox item and recommended next step.
- Content Workbench: article and topic workflow from discovery through review, readiness, publication and monitoring.
- Activity Feed: a concise chronological narrative of recent monitor runs, operator actions, cadence runs, report generation and notification payload preparation.
- Tenant: active client context, stakeholder route, operator route and default tenant scope.
- Authority State: first gate layer showing whether controlled operator actions are in local bypass, required, verified or failed state.
- Tenant Registry: read-only preview of registered tenants, including active and disabled fixture entries.
- Operations: cadence, notification payloads, report generation and state refresh context.
- Operator Console: controlled allowlisted execution with selected action, lifecycle state, prominent summary, duration, collapsed output preview and recent console history.
- Execution Pipelines: registered multi-step workflows with approval, execution and scheduling metadata. They run fixed allowlisted actions sequentially and stop safely on failure.
- Tools & Commands: searchable command discovery, copy buttons and low-risk Run buttons for allowlisted actions only.
- Diagnostics: collapsed/secondary checks and the same controlled console surface when deeper checks are needed.

The latest UX polish pass tightened the first-screen hierarchy around current focus, recommended next step and primary safe actions. Command groups are easier to scan, Activity Feed entries use calmer timeline styling and secondary details remain lower in the operator flow. This was a visual organisation pass only, with no SEO scoring or execution behaviour changes.

A follow-up UI quality pass checked `/seo-roadmap` and `/seo-progress` across desktop, laptop, tablet and mobile widths. The Control Centre now has safer header wrapping, workspace controls, command/action rows and long command pills, while the stakeholder progress page keeps its health summary readable without overlapping the hero. This was layout and readability hardening only.

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
npm run platform:roadmap:review -- --item roadmap-feedback-workflow-actions
npm run platform:roadmap:status -- --item roadmap-feedback-workflow-actions --set ready --note "Reviewed package ready"
```

This generates ignored `reports/sentinel-roadmap.json` and `reports/sentinel-roadmap.md`. `platform:roadmap:plan` turns the top or selected roadmap item into ignored `reports/sentinel-roadmap-plan.json` and `reports/sentinel-roadmap-plan.md` with problem statement, evidence, scope, out-of-scope, implementation steps, safety constraints and validation. A roadmap plan is not implementation approval. `platform:roadmap:approve` writes ignored `reports/sentinel-roadmap-approvals.json` with local approval metadata, an expiry and `review_required` safety level before any separate implementation work begins. `platform:roadmap:brief` requires an active non-expired approval, then writes ignored `reports/sentinel-implementation-brief.json` and `reports/sentinel-implementation-brief.md` as planning detail. `platform:roadmap:package` then exports ignored `reports/sentinel-work-package.json` and `reports/sentinel-work-package.md` as the Codex-ready implementation handoff. `platform:roadmap:review` writes ignored `reports/sentinel-work-package-review.json` after checking approval expiry, required safety constraints, validation commands, forbidden likely paths and worktree status. `platform:roadmap:status` writes ignored `reports/sentinel-implementation-status.json` to track lifecycle states (`ready`, `in_progress`, `blocked`, `implemented`, `validated`, `abandoned`) without implementing anything. The work package remains operator-controlled: it does not run Codex, generate patches or apply changes, but it gives the future implementation task a single file with exact scope, stop conditions, validation commands, deliverables and final response checklist. The review is required before handoff, and status tracking records what happened after handoff. The scoring is heuristic and operator-guided: repeated or accepted feedback, low-effort/high-impact work, frequently used sections and deployment/readiness concerns rise in priority; deferred or rejected items drop down. It does not call external AI APIs, does not auto-code and does not expose roadmap intelligence, roadmap plans, approvals, briefs, work packages, reviews or implementation statuses on `/seo-progress`.

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

The local API exposes `POST /action` for allowlisted actions only. It rejects unknown action IDs, rejects actions not marked `allowFromUI`, starts fixed `npm run <script>` commands with `spawn` and no shell, applies timeouts and limits captured output. It now returns an execution ID immediately so the private dashboard can poll `GET /actions/execution/<id>` for `queued`, `running`, `success` or `failed` state, including timestamps, `durationMs`, `durationLabel`, summary and capped output excerpts. Completed actions are recorded in `runs` as `ui_action:<id>` with concise redacted results in `action_results`. It also exposes read-only `GET /actions/history` so the private dashboard can show recent actions, statuses, durations and short summaries.

Pipeline metadata lives in:

```text
platform/pipelines/pipelines.json
```

The local API exposes `GET /pipelines`, `POST /pipeline/run` and `GET /pipeline/execution/<id>`. Pipelines are registered workflows only: every step must reference an existing `allowFromUI` action, steps run sequentially, the pipeline stops on the first failed step and operators cannot edit steps or arguments in the browser. Completed pipeline summaries are recorded in `runs` as `ui_pipeline:<id>` where possible.

Pipeline governance metadata now records approval mode, execution mode, schedule mode, review requirement, scheduling eligibility, max frequency, tags and safety notes. Validate pipeline definitions and preview future scheduling intent with:

```bash
npm run platform:pipeline:validate
npm run platform:pipeline:validate -- --json
npm run platform:pipeline:schedule
```

These commands are read-only. They do not install cron jobs, systemd timers or background schedules. See `docs/SENTINEL_EXECUTION_PIPELINES.md` and `docs/SENTINEL_PIPELINE_GOVERNANCE.md`.

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
- `platform:roadmap`
- `platform:feedback:backlog`
- `platform:notify:stakeholder`

Deploy, cleanup, restore, FTP, service installation and arbitrary shell commands are intentionally excluded. The dashboard shows Run buttons only for allowlisted actions and pipelines, keeps full output out of the default view, shows capped excerpts and shows recent operator action history when the local API is running. The Operator Console is the structured execution surface for safe single actions: it has a selected action, run button, clear execution status, started/finished timestamps, duration, prominent summary, collapsed output preview, recent console history and a disabled cancellation placeholder for future work. Failed actions surface a clear failure state and suggest `platform:doctor`. Execution Pipelines are the structured workflow surface for safe multi-step operations, with governance metadata visible before a workflow is run. See `docs/SENTINEL_OPERATOR_ACTIONS.md`, `docs/SENTINEL_OPERATOR_CONSOLE.md`, `docs/SENTINEL_EXECUTION_PIPELINES.md` and `docs/SENTINEL_PIPELINE_GOVERNANCE.md`.

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

The HTTP prototype uses Node's built-in `http` module and defaults to `http://127.0.0.1:4317`. It exposes read-only `GET /health`, `GET /authority/status`, `GET /state`, `GET /tenant`, `GET /tenants`, `GET /activity`, `GET /feedback`, `GET /actions/history`, `GET /actions/execution/<id>`, `GET /pipelines` and `GET /pipeline/execution/<id>` endpoints, plus controlled `POST /action` for allowlisted local operator actions, controlled `POST /pipeline/run` for registered safe pipelines, local-only `POST /feedback` for operator notes and `POST /feedback/triage` for feedback backlog updates. The first authority gate is disabled by default; when `SENTINEL_AUTHORITY_MODE=enabled`, those mutation endpoints require `X-Sentinel-Operator-Token` unless an explicit local bypass is configured. Keep the API local-only until remote auth, transport and service hardening are complete.

The Raspberry Pi service scaffold is also present but inactive:

```bash
npm run platform:pi:discover
npm run service:dry-run
```

`platform:pi:discover` targets the known Raspberry Pi host `192.168.4.22` by default and writes ignored local discovery reports. It is read-only. It uses optional local environment variables for user, port and deploy root, and only attempts SSH when `--ssh` is explicitly passed. If DHCP changes the address, `npm run platform:pi:discover -- --scan` checks the local range for SSH port `22` and Sentinel API port `4317` without authenticating; use `--subnet <prefix-or-cidr>` for a known alternative LAN range. SSH mode uses non-interactive read-only checks and never prompts for passwords.

Local Raspberry Pi discovery environment setup is documented in `docs/RASPBERRY_PI_LOCAL_ENV_SETUP.md`. Keep `.env`, SSH keys, passwords and tokens outside Git.

Review the concrete preparation plan before any Pi mutation:

```bash
npm run platform:pi:prepare:plan
```

The committed plan is `docs/RASPBERRY_PI_DEPLOYMENT_PREPARATION_PLAN.md`. The command writes ignored preparation reports from the latest discovery report and does not SSH, install Node, create directories, copy files, start services or deploy.

Generate the proposed command sequence without running it:

```bash
npm run platform:pi:install:preflight
npm run platform:pi:install:dry-run
```

`platform:pi:install:preflight` requires local `RASPBERRY_PI_HOST` and `RASPBERRY_PI_USER`, then runs read-only non-interactive SSH checks and a local `4317` port probe. It does not use sudo, install Node, create directories, clone files, start services or expose the API. `READY_WITH_WARNINGS` can be acceptable before first install prep when the warnings are expected missing install targets.

This writes ignored install dry-run reports and prints preflight, Node/npm, directory, repo, API smoke, service and post-install check sections. It is dry-run only and does not SSH or mutate the Pi.

The first mutation-capable command is still dry-run by default:

```bash
npm run platform:pi:install:prep
```

It refuses to mutate without `--confirm`. Confirmed mode only installs Node/npm, creates the `/srv/sentinel` directory layout, assigns ownership to the SSH user and runs post-checks. It does not clone the repo, start the API, install systemd services, enable timers or expose anything publicly.

The first confirmed prep attempt may stop safely if the Pi requires an interactive sudo password. Do not put sudo passwords in scripts or configure broad passwordless sudo. Use the manual guide instead:

```text
docs/RASPBERRY_PI_INTERACTIVE_SETUP.md
```

After manual setup, verify the Pi from the local repo:

```bash
npm run platform:pi:post-prep:verify
```

The verifier is read-only and checks Node, npm, `/srv/sentinel`, child directories, ownership metadata and SSH-user permission bits. It does not install packages, create directories, clone the repo, write test files, start services or use sudo.

`/srv/sentinel` is now the canonical Raspberry Pi runtime root. `/srv/matthew-platform` was an early internal namespace; new deployment scripts, service templates and verification commands should not target it.

Plan the first repo deployment separately:

```bash
npm run platform:pi:repo:plan
npm run platform:pi:repo:deploy
```

`platform:pi:repo:plan` is dry-run/read-only. It checks the local Git remote, branch, latest commit, tracked worktree state and `/srv/sentinel/apps/seo-ops` over SSH, then writes ignored plan reports.

`platform:pi:repo:deploy` refuses to mutate without `--confirm`. Confirmed mode is limited to clone or fast-forward pull, `npm ci`, `npm run build`, `npm run platform:init` and `npm run platform:health`. It does not start the API, install services, enable timers or expose anything publicly. Confirm Pi Git remote access outside the repo if authentication is required.

The first Pi repo deploy cloned successfully but exposed a normal `npm ci` blocker: `react-helmet-async@2.0.5` did not declare React 19 peer support. The main app now uses React 19 native document metadata through `src/components/ui/SEO.jsx`, so deployment can stay on strict `npm ci` instead of a `--legacy-peer-deps` workaround.

The stakeholder `/seo-progress` page is also build-safe without generated report artefacts. It uses committed fallback data in `src/data/seoProgressSnapshot.js`; ignored `reports/*.json` files can enhance future runtime flows but are not required for the Pi build.

Verify the repo-deployed phase separately from runtime prep:

```bash
npm run platform:pi:repo:verify
```

This read-only verifier checks `/srv/sentinel/apps/seo-ops` for a clean Git checkout, package files, `node_modules`, `dist`, active DB runtime state and the required npm scripts. When `PLATFORM_DB_PATH`, the canonical DB file and `platform:runtime:paths` confirm `/srv/sentinel/data/seo-ops/platform.db`, the repo-local SQLite file is reported as `present as fallback`, not as a warning. It reports closed API port `4317` and missing `sentinel-api.service` as warnings because the next phase is foreground API smoke testing, not service installation.

Smoke test the Pi API in a temporary foreground session before any service installation:

```bash
npm run platform:pi:api:smoke
```

This SSH-based smoke starts `npm run platform:api:serve` on the Pi with `SENTINEL_API_HOST=127.0.0.1` and `SENTINEL_API_PORT=4317`, curls `/health`, `/state` and `/tenant` from the Pi itself, then stops only the process it started and confirms port `4317` closes. It writes ignored smoke reports and does not install systemd, enable timers, reverse proxy the API or expose it publicly.

Plan the systemd service installation without installing it:

```bash
npm run platform:pi:service:plan
```

This read-only planner verifies the deployed app, `platform:api:serve`, the passing foreground smoke report, systemd availability, current service state, `deploy/systemd/sentinel-api.service.example` and the Pi npm path. The current Pi runtime resolves npm at `/usr/local/bin/npm`, so the inactive template uses that absolute path plus an explicit `PATH`. The planner writes ignored service-plan reports and prints future `sudo systemctl` commands only.

Verify the installed service as a separate post-install phase:

```bash
npm run platform:pi:service:verify
```

This read-only verifier checks that `sentinel-api.service` exists, is enabled, is active, uses `/usr/local/bin/npm run platform:api:serve`, points at `/srv/sentinel/apps/seo-ops`, reads `/srv/sentinel/apps/seo-ops/.env`, listens on `127.0.0.1:4317` only, responds on `/health`, `/tenant` and `/state`, and has no Sentinel cadence timers enabled. It writes ignored service verification reports and does not restart or mutate the Pi.

Plan the migration from repo-local SQLite to the canonical Pi runtime data path:

```bash
npm run platform:pi:data:path:plan
```

This read-only planner checks the current repo-local DB at `/srv/sentinel/apps/seo-ops/platform/persistence/platform.db`, the canonical runtime paths under `/srv/sentinel/data/seo-ops`, the Pi service `.env` and whether the persistence layer already honours `PLATFORM_DB_PATH`. The canonical target is `/srv/sentinel/data/seo-ops/platform.db`, with reports in `/srv/sentinel/data/seo-ops/reports`, backups in `/srv/sentinel/data/seo-ops/backups` and logs in `/srv/sentinel/logs/seo-ops`. It writes ignored data-path reports and does not stop the service, copy the DB, edit `.env` or restart anything.

`service:dry-run` validates `deploy/systemd/sentinel-api.service.example` and prints the future systemd commands without copying files, reloading systemd, enabling services or starting anything. See `docs/RASPBERRY_PI_SERVICE_PLAN.md`.

Access-control planning is also scaffolded but inactive:

- `docs/SENTINEL_ACCESS_CONTROL_PLAN.md`
- `docs/SENTINEL_BASIC_AUTH_SETUP.md`
- `docs/SENTINEL_OWNERSHIP_AUTH_ARCHITECTURE.md`
- `deploy/nginx/sentinel-basic-auth.example.conf`

The short-term recommendation remains to keep the API bound to `127.0.0.1`. The first authority gate now lets the operator dashboard check `GET /authority/status` and disables controlled Run buttons if authority is required but not verified. Full login, sessions and role-based access are still future work, and no credentials belong in the repo.

The private `/seo-roadmap` operator dashboard consumes `reports/sentinel-state.json` for its compact Current Sentinel State panel by default. For local API experiments, set:

```bash
VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317
```

When that Vite variable is present, `/seo-roadmap` tries the local API first and falls back quietly to the report JSON if the API is unavailable. Stakeholder routes such as `/seo-progress` do not show this operational state and do not use the operator API state.

Future remote-auth placeholders exist in `.env.example` as blank values. Real operator tokens must stay outside Git and should live on Matthew-controlled infrastructure.

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

## Raspberry Pi Canonical DB Backup

The Pi runtime has dedicated backup checks for the canonical SQLite database:

```bash
npm run platform:pi:backup:verify
npm run platform:pi:backup
npm run platform:pi:backup:restore:test
```

`platform:pi:backup:verify` is read-only. It SSHes to the Pi, confirms `PLATFORM_DB_PATH=/srv/sentinel/data/seo-ops/platform.db`, confirms `PLATFORM_BACKUP_PATH=/srv/sentinel/data/seo-ops/backups`, checks the canonical DB integrity, checks that the backup directory is writable by the SSH user and lists recent `platform.db.backup-*` files if present.

`platform:pi:backup` is dry-run by default and creates nothing. Confirmed mode requires `--confirm`; it creates a timestamped SQLite online backup under `/srv/sentinel/data/seo-ops/backups` and does not stop `sentinel-api.service`, expose the API, enable timers or delete old backups.

`platform:pi:backup:restore:test` copies the latest Pi backup to a timestamped temporary restore-test DB under `/srv/sentinel/data/seo-ops/backups`, runs SQLite integrity and expected table checks, confirms the live canonical DB path was not targeted and removes the temporary DB by default. Use `-- --keep-temp` only when you explicitly need to inspect the temporary copy. It never overwrites `/srv/sentinel/data/seo-ops/platform.db`.

## Deployment Readiness Gate

Use the read-only deployment gate before any Raspberry Pi promotion work:

```bash
npm run platform:deploy:ready
```

It checks Git cleanliness, production build readiness, platform health, DB integrity, backup verification, restore simulation, SEO monitor, service scaffold readiness, deployment dry run and API smoke status if the local API is already running.

It does not deploy, SSH, upload files, create server directories, start services or expose the API. `READY WITH WARNINGS` is acceptable for local-only warnings such as API smoke skipped because the API server is not running. `NOT READY` blocks deployment work.

On the Raspberry Pi, real backups must live outside the repo, for example `/srv/sentinel/data/seo-ops/backups`, and should not use the local `.gitkeep` directory as the production backup destination.

## Runtime Path Configuration

Sentinel supports configurable runtime paths for the SQLite DB, platform report output, backups and logs:

```bash
PLATFORM_DB_PATH=/srv/sentinel/data/seo-ops/platform.db
PLATFORM_REPORT_OUTPUT_PATH=/srv/sentinel/data/seo-ops/reports
PLATFORM_BACKUP_PATH=/srv/sentinel/data/seo-ops/backups
PLATFORM_LOG_PATH=/srv/sentinel/logs/seo-ops
```

Local defaults are still used when these variables are absent:

- DB: `platform/persistence/platform.db`
- reports: `reports/`
- backups: `platform/persistence/backups`
- logs: `logs/`

Inspect the active configuration with:

```bash
npm run platform:runtime:paths
npm run platform:runtime:paths -- --json
```

`platform:init` can initialise an overridden `PLATFORM_DB_PATH` and create its parent directory. Read-only commands report missing path parents rather than mutating them. The Raspberry Pi migration to `/srv/sentinel/data/seo-ops/platform.db` remains a separate approved task.

## Pi Runtime Data Path Migration

Use this command to preview the Pi runtime data-path migration:

```bash
npm run platform:pi:data:path:migrate
```

The default mode is dry-run only. It validates the repo-local source DB, canonical `/srv/sentinel/data/seo-ops` paths, Pi `.env`, service state and current API health without changing the Pi.

Confirmed mode is explicit:

```bash
npm run platform:pi:data:path:migrate -- --confirm
```

It backs up the repo-local DB, copies it to `/srv/sentinel/data/seo-ops/platform.db`, updates the Pi `.env` with `PLATFORM_DB_PATH`, `PLATFORM_REPORT_OUTPUT_PATH`, `PLATFORM_BACKUP_PATH` and `PLATFORM_LOG_PATH`, runs `platform:health`, restarts `sentinel-api.service` and verifies `/health`, `/state` and `/tenant`. It does not expose the API or enable timers, and it leaves the repo-local DB as the rollback copy.

## Interactive Pi DB Migration Verification

If the automated data-path migration is blocked by interactive sudo, follow:

```text
docs/RASPBERRY_PI_INTERACTIVE_DB_MIGRATION.md
```

Then verify the result with:

```bash
npm run platform:pi:data:path:verify
```

The verifier is read-only. It confirms the canonical DB exists under `/srv/sentinel/data/seo-ops/platform.db`, the repo-local rollback DB still exists, the Pi `.env` contains canonical runtime paths, `sentinel-api.service` is active, the local API responds and `platform:runtime:paths` reports the canonical DB path.

## Pi Verifiers After Canonical DB Migration

After the Pi `.env` points `PLATFORM_DB_PATH` at `/srv/sentinel/data/seo-ops/platform.db`, the repo and service verifiers treat the repo-local SQLite file as an intentional fallback:

```text
Active DB: canonical
Repo-local DB: present as fallback
```

This avoids false repo/service warnings after migration. The verifiers still warn if the canonical DB is missing, runtime paths are not `READY`, runtime paths point at the repo-local DB, or the API cannot return `/state`.
