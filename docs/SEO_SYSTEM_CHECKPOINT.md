# SEO System Checkpoint

## Sentinel working name

Sentinel is the working name for the SEO/content operations platform. The existing file names, commands, folders and routes have not been renamed. Any filename cleanup, including files that still contain `PINHOLE`, should happen later as a separate low-risk cleanup.


## Current commands

- `npm run seo:pipeline`
- `npm run seo:pipeline -- --tenant erp-experts`
- `npm run seo:stats`
- `npm run seo:stats -- --tenant erp-experts`
- `npm run seo:monitor`
- `npm run seo:monitor -- --tenant erp-experts`
- `npm run seo:operator`
- `npm run seo:growth`
- `npm run seo:links`
- `npm run seo:freshness`
- `npm run seo:conversion`
- `npm run seo:opportunities`
- `npm run seo:opportunities -- --tenant erp-experts`
- `npm run seo:decisions`
- `npm run seo:plans`
- `npm run seo:plan:approve -- <planId>`
- `npm run seo:plan:run -- <planId>`
- `npm run seo:plan:status`
- `npm run seo:digest`
- `npm run seo:inbox`
- `npm run seo:autopilot`
- `npm run seo:autopilot -- --tenant erp-experts`
- `npm run platform:tenant -- erp-experts`
- `npm run platform:init`
- `npm run platform:status`
- `npm run platform:start`
- `npm run platform:cadence`
- `npm run platform:daily`
- `npm run platform:notify`
- `npm run platform:stakeholder`
- `npm run platform:state`
- `npm run platform:doctor`

## Current architecture

1. Quality baseline: resource QA report and gate totals.
2. Opportunity intelligence: growth, links, freshness, conversion.
3. Unified prioritisation: opportunity command centre output.
4. Strategic decisions: resolve overlap, cannibalisation, and create-vs-expand choices.
5. Execution control: plans, approvals, active plan, plan status.
6. Operator reporting: monitor, digest, stats, inbox.
7. Autopilot orchestration: one command runs the intelligence chain and decides the next safe step.
8. Dashboard: monitor-first control panel with secondary diagnostics.
9. Platform tenant foundation: read-only tenant config schema, ERP Experts tenant prototype and loader command.
10. Tenant-aware reporting: `seo:autopilot`, `seo:pipeline`, `seo:monitor`, `seo:stats` and `seo:opportunities` now read tenant name, report output path, dashboard route and base URL where relevant from config.
11. Platform persistence foundation: local SQLite DB for tenants, runs and monitor snapshots.
12. Sentinel operational state: `platform:state` summarises persisted health, opportunities, plans, approvals, statuses and next action.

## Health status

- Expected healthy target:
  - `pass=27`
  - `needs_review=0`
  - `blocked=0`
  - `humanReviewRecommended=no`
- Monitor mode should remain `HEALTHY` unless regressions occur.

## Dashboard access boundary

- `/seo-progress` is the stakeholder-facing SEO and content progress view.
- `/seo-roadmap` is the Sentinel operator dashboard for local/internal use only.
- Production builds redirect `/seo-roadmap` to `/seo-progress` until real authentication exists.
- Do not expose operator commands, prompts, diagnostics, tenant state, approval gates or generated report internals on public ERP Experts pages.

## Sentinel Control Centre

The private `/seo-roadmap` route is being consolidated into the Sentinel Control Centre rather than a stack of separate operator panels.

The route now uses a clearer app-shell structure:

- Top App Header: Sentinel branding, current tenant and lightweight health, workflow, cadence and readiness indicators.
- Left Navigation Rail: Overview, State, Inbox, Opportunities, Actions, Cadence, Tenants and Diagnostics.
- Main Content Area: existing panels grouped by operator purpose.
- Status Bar: readiness, latest cadence and state-source context.

The private Control Centre also persists lightweight operator preferences in local browser storage. It restores the last selected section, command search/filter, sidebar collapsed state, compact view preference and selected collapsed panel states. This is local-only UI state: no command outputs, credentials, API payloads, reports, notifications or database state are stored. The reset option clears only this local Sentinel UI state and restores the default Overview layout.

The Control Centre now supports saved local operator workspaces via `sentinel.operatorWorkspaces.v1`. Built-in presets cover Monitoring, Development, Deployment and Roadmap Review, while custom workspaces can be created from the current layout, overwritten, deleted and restored locally. Workspaces remember section, command filter/search, compact mode, sidebar state, visible focus panels and collapse state. They remain browser-local only and are not exposed on `/seo-progress`.

The Control Centre now includes contextual operator help backed by `platform/help/control-centre-help.json`. Help changes with the selected section, explains when to use each area, lists safe notes and shows a subtle first-run hint for new local sessions. This help is private/operator-only and is not exposed on `/seo-progress`.

The Control Centre has had a UX polish pass focused on daily operation rather than new behaviour. The Overview now prioritises current focus, recommended next step and primary safe actions; command groups are less dense; Activity Feed rows are quieter and taxonomy-labelled; stakeholder routes remain unchanged.

A follow-up UI quality pass checked `/seo-roadmap` and `/seo-progress` at desktop, laptop, tablet and mobile widths. It tightened responsive wrapping for the app header, workspace controls, command/action rows, action history and long roadmap command pills. The stakeholder `/seo-progress` hero keeps the content health card readable without clipping, and remains free of Sentinel operator controls, commands and diagnostics.

The Control Centre now includes local operator feedback capture for Matthew's day-to-day friction points and ideas. Feedback can be entered from `/seo-roadmap` when the local Sentinel API is running, or from the terminal with `npm run platform:feedback`. Items are stored only in ignored `reports/operator-feedback.json` and are intended as a future roadmap prioritisation source. Feedback can now be triaged with priority, effort, triage status, optional owner/link fields and notes, then turned into an ignored `reports/sentinel-feedback-backlog.md` with `npm run platform:feedback -- --backlog`. `/seo-progress` does not expose feedback capture, feedback history or backlog state.

Sentinel roadmap intelligence now turns triaged feedback, activity, cadence, readiness and persisted operational state into ignored `reports/sentinel-roadmap.json` and `reports/sentinel-roadmap.md` with `npm run platform:roadmap`. `npm run platform:roadmap:plan` turns the top or selected roadmap item into ignored `reports/sentinel-roadmap-plan.json` and `reports/sentinel-roadmap-plan.md` for review before implementation. A roadmap plan is not approval: `npm run platform:roadmap:approve -- --item <id>` writes ignored `reports/sentinel-roadmap-approvals.json` with local approval metadata, an expiry and `review_required` safety level. `npm run platform:roadmap:brief -- --item <id>` requires an active non-expired approval before generating ignored `reports/sentinel-implementation-brief.json` and `reports/sentinel-implementation-brief.md` for implementation planning detail. `npm run platform:roadmap:package -- --item <id>` exports ignored `reports/sentinel-work-package.json` and `reports/sentinel-work-package.md` as the single Codex-ready handoff for a later implementation task. `npm run platform:roadmap:review -- --item <id>` generates ignored `reports/sentinel-work-package-review.json` and checks approval, scope, required safety constraints, validation commands, forbidden likely paths and worktree status before handoff. `npm run platform:roadmap:status -- --item <id> --set ready` tracks lifecycle state in ignored `reports/sentinel-implementation-status.json` without implementing anything. The Control Centre surfaces the top operator-only recommendations in a compact Roadmap Intelligence panel with copy-only plan, approval, brief, package, review and status commands. The logic is heuristic and planning-only: it prioritises repeated or accepted feedback, low-effort/high-impact work, frequently used sections and deployment/readiness concerns, but it never auto-implements changes or uses external AI APIs.

Current operator zones:

- System Status: health, workflow, cadence state, deployment readiness and doctor state.
- Current Focus: latest opportunity, latest plan, practical inbox item and recommended next step.
- Activity Feed: chronological narrative of recent monitor runs, controlled operator actions, cadence runs, report generation and notification payload preparation.
- Tenant: active client context for ERP Experts, including base URL, operator route, stakeholder route and future multi-tenant note.
- Tenant Registry: read-only preview of registered tenants, showing ERP Experts as active and disabled fixtures as non-actionable.
- Operations: cadence, notification payloads, report generation and state refresh context.
- Tools & Commands: searchable command registry with copy buttons and allowlisted Run buttons.
- Diagnostics: secondary checks, advanced details and the future console placeholder.

The Activity Feed uses `platform/activity/activity_feed.mjs` and local `GET /activity` to aggregate persisted runs, action summaries and safe generated artefact timestamps into concise operator-only entries. It avoids raw command output, stack traces and secrets. `/seo-progress` does not expose this feed.

Activity taxonomy is now explicit in `platform/activity/activity-taxonomy.json`. Feed entries are normalised to the allowed types (`system`, `operator`, `cadence`, `notification`, `deploy`, `backup`, `tenant`, `health`, `api`) and severities (`info`, `success`, `warning`, `error`) before leaving the helper or API. `npm run platform:activity:validate` validates the taxonomy and locally generated entries.

The Tenant Registry preview uses `GET /tenants` when the local Sentinel API is running and falls back to the bundled registry. It does not enable switching, actions against disabled tenants or multi-tenant pipelines.

The command registry is stored at `platform/commands/commands.json`. It describes each known command, category, risk level, local-only expectation, API/deployment requirements, default tenant scope and recommended usage. The dashboard uses it for discovery and only exposes Run buttons for commands present in the stricter action allowlist. There is no browser-side shell, backend terminal or arbitrary command runner.

The stakeholder route `/seo-progress` remains separate and must not expose command registry data, operator workflows, readiness state, doctor state or private diagnostics.

## Controlled operator actions

Sentinel now has a strict allowlisted action layer for the private Control Centre.

The action registry is stored at `platform/actions/actions.json`. The local HTTP API accepts `POST /action` for known action IDs only, rejects unknown or non-UI actions, runs fixed `npm run <script>` commands with `spawn` and no shell, enforces timeouts and caps captured output. It records each action in `runs` as `ui_action:<id>`, stores concise redacted summaries in `action_results`, and exposes read-only `GET /actions/history` for recent actions.

Initial allowlisted UI actions:

- `platform:start`
- `platform:doctor`
- `platform:state`
- `platform:daily`
- `platform:stakeholder`
- `platform:health`
- `platform:status`
- `platform:api`
- `seo:monitor`

This is controlled local operator execution, not a terminal. There is no arbitrary command input, command chaining, deployment execution, cleanup execution, restore execution, FTP execution, notification sending or public exposure. The private dashboard shows recent controlled action history with summaries when the local API is running, with output excerpts collapsed by default. The stakeholder route `/seo-progress` remains separate and does not expose action controls or action history.

See `docs/SENTINEL_OPERATOR_ACTIONS.md`.

## Platform tenant layer

The first platform extraction boundary is now present under `platform/`.

- `platform/schema/tenant.schema.json` defines the generic tenant config shape.
- `platform/tenants/erp-experts.config.json` describes ERP Experts as the first tenant.
- `platform/tenants/tenant-registry.json` lists visible Sentinel tenants. ERP Experts is the only active tenant.
- `platform/README.md` documents the read-only extraction boundary.
- `npm run platform:tenant -- erp-experts` validates and prints the tenant summary.

Current engines still use their existing ERP Experts paths. The tenant layer is a safe foundation for future extraction, not a behaviour change.

The private Control Centre now shows the active tenant context but does not implement live switching. Future work remains tenant switching, isolated tenant dashboards and tenant-scoped authentication.

The Control Centre now also previews the tenant registry read-only. ERP Experts remains the only active tenant, while `demo-client` is shown as an `example_disabled` fixture with no Run buttons, no switching and no pipeline access.

Future tenant creation is scaffolded by `npm run platform:tenant:scaffold`. It is dry-run by default, writes only when `--write` is passed, creates `draft` registry entries by default and refuses `active` status unless `--allow-active` is passed. It does not generate live reports for new tenants.

Tenant consistency is checked by `npm run platform:tenant:validate`. It is read-only and validates registry/config matches, required fields, allowed statuses, duplicate tenant IDs, ERP Experts active status and placeholder domains on active tenants. JSON output is available with `--json` for future automation.

`demo-client` is included as an `example_disabled` fixture only. It is not active, does not generate reports, should not run SEO pipelines and exists solely to prove multi-tenant validation against a second registry/config entry.

`seo:autopilot`, `seo:pipeline`, `seo:monitor`, `seo:stats` and `seo:opportunities` are now tenant-aware. They still default to ERP Experts, so existing usage is unchanged. Explicit tenant usage is available with `npm run seo:autopilot -- --tenant erp-experts`, `npm run seo:pipeline -- --tenant erp-experts`, `npm run seo:monitor -- --tenant erp-experts`, `npm run seo:stats -- --tenant erp-experts` and `npm run seo:opportunities -- --tenant erp-experts`.

## Platform persistence layer

The first persistence layer is available under `platform/persistence/`.

- `platform/persistence/schema.sql` defines `tenants`, `runs` and `snapshots`.
- `platform/persistence/db.js` provides a minimal SQLite helper.
- `npm run platform:init` creates `platform/persistence/platform.db` and inserts ERP Experts as a tenant.
- `npm run platform:status` prints tenant, run and snapshot counts.
- `seo:monitor` dual-writes one snapshot row after a successful monitor state is built.

JSON reports remain the primary runtime outputs. SQLite is additive platform state at this stage.

## Automation lifecycle

1. Run `seo:pipeline` and `seo:stats`.
2. Confirm monitor health with `seo:monitor`.
3. If healthy, review `seo:opportunities`.
4. Resolve strategic direction with `seo:decisions`.
5. Create execution flow with `seo:plans`.
6. Approve scope with `seo:plan:approve`.
7. Generate active runbook with `seo:plan:run`.
8. Track status with `seo:plan:status`.
9. Use `seo:digest` and `seo:inbox` for weekly/operator view.
10. Use `seo:autopilot` when you want the system to run the full chain and recommend one next step.

## Generated and ignored report files

Ignored local/generated outputs:

- `reports/history/`
- `reports/seo-growth-opportunities.json`
- `reports/seo-internal-link-opportunities.json`
- `reports/seo-freshness-report.json`
- `reports/seo-conversion-paths.json`
- `reports/seo-opportunity-centre.json`
- `reports/seo-decision-engine.json`
- `reports/seo-execution-plans.json`
- `reports/seo-plan-approvals.json`
- `reports/seo-plan-status.json`
- `reports/seo-active-plan.md`
- `reports/seo-weekly-digest.md`
- `reports/seo-action-inbox.json`
- `reports/seo-autopilot-report.md`
- `reports/seo-autopilot-report.json`
- `reports/seo-next-batch-prompt.md`
- `reports/briefs/`

## Dashboard sections (healthy mode)

1. Health/autopilot summary.
2. Action Inbox.
3. Opportunity Command Centre.
4. Execution Plans.
5. Collapsed operational and intelligence details.

## Safety gates

- Review-first prompts only by default.
- The decision engine must resolve create-vs-expand conflicts before content drafting.
- Cannibalisation risk defaults to conservative recommendations: expand existing content first unless differentiation is clear.
- Approval gate controls planning vs patch proposal vs apply intent.
- `--allow-apply` required for `apply_patch` approval state.
- No automatic content edits, no automatic commits, no automatic publishing.
- `seo:autopilot` orchestrates reports and recommendations only; it does not approve, edit, patch, publish, or commit.
- Validation commands remain mandatory before any manual commit.

## Remaining future backlog

- Real authentication for admin/roadmap control.
- Standalone multi-client app architecture.
- CRM and outcome integration.
- Persistent backend for plan/approval/status storage.
- Scheduled digest notification delivery.
- Optional PR-based patch execution flow.

## Raspberry Pi server deployment plan

Deployment planning for Matthew's Raspberry Pi server is captured in `docs/PINHOLE_SERVER_DEPLOYMENT_PLAN.md`.

Current policy:

- No production deployment has been performed from this plan.
- Runtime data belongs outside Git.
- The server database should live outside the repo, for example `/srv/matthew-platform/data/seo-ops/platform.db`.
- Generated reports, backups and logs should also live outside the repo.
- The first deployment milestone should be documentation, environment templates and a read-only health check, not a live hosting move.

This keeps the working ERP Experts automation stable while creating a safe path towards hosted, multi-client platform operations.

## Platform health check

Use the read-only health command before deployment or server work:

```bash
npm run platform:health
```

It checks tenant config, SQLite readiness, report presence, latest QA totals, deployment docs and Git ignore policy for runtime files. It does not mutate source files, reports, article data or server state.

## Raspberry Pi readiness scaffold

The future server deployment scaffold is present:

- `docs/PINHOLE_SERVER_READINESS_CHECKLIST.md`
- `.env.example`
- `deploy/scripts/check-local.sh`
- `deploy/scripts/check-server.sh`

The scripts are scaffolds only. They do not deploy, create server folders, move repos, add secrets, or change production hosting.

## Deployment dry-run planner

Use the read-only deployment planner before any future server work:

```bash
npm run deploy:dry-run
```

It prints the intended Raspberry Pi server paths, future command sequence, expected `.env` variables and safety notes. It does not SSH, create directories, copy files or deploy anything.

## Backup and environment scaffold

`.env.example` now documents placeholder-only runtime, platform path, tenant, security, deployment and backup variables.

Backup planning commands:

```bash
npm run backup:dry-run
npm run backup:verify
npm run backup:restore:test
bash deploy/scripts/backup-platform.sh
bash deploy/scripts/backup-platform.sh --confirm
```

Current backup behaviour is intentionally non-mutating. The dry-run prints expected paths and retention. The placeholder backup script refuses without `--confirm`, and even with `--confirm` it prints TODO steps only. Real backup file creation is not implemented yet.

Local readiness checks use `platform/persistence/backups`, kept in Git with `.gitkeep` only. Backup files inside that folder remain ignored. Raspberry Pi backups must live outside the repo, for example `/srv/matthew-platform/data/seo-ops/backups`.

`backup:verify` checks the current SQLite DB, required tables, row counts, integrity, file size and modified time. `backup:restore:test` copies the DB to a temporary restore-test file, validates the copy and removes it afterwards unless `--keep-temp` is used. No live DB overwrite or destructive restore behaviour exists.

## Deployment readiness gate

Use the read-only readiness gate before any Raspberry Pi promotion:

```bash
npm run platform:deploy:ready
```

It checks Git cleanliness, build readiness, platform health, DB integrity, backup verification, restore simulation, SEO monitor, service scaffold readiness, deployment dry run and API smoke status if the local API is running. It writes ignored output to `reports/sentinel-deploy-readiness.json`.

It does not deploy, SSH, create directories, upload files, start services or expose the API. `READY WITH WARNINGS` is acceptable for local-only warnings. `NOT READY` blocks deployment work.

## SQLite run logging

Sentinel now uses the SQLite `runs` table for selected command execution history:

- `seo:monitor`
- `seo:pipeline`
- `seo:autopilot`
- `platform:health`

Run logging is warning-only. A DB logging failure should not fail the command unless the command itself fails. `npm run platform:status` shows run count, the last run and the latest five runs.

## SQLite opportunity summaries

Sentinel now also persists top strategic opportunity summaries from `seo:opportunities` into the SQLite `opportunity_summaries` table.

Current policy:

- `reports/seo-opportunity-centre.json` remains the runtime output consumed by the dashboard and existing automation.
- SQLite stores append-only opportunity history for future platform state.
- Persistence is warning-only and must not change opportunity scoring or command success.
- `npm run platform:status` shows the opportunity summary count and latest persisted opportunities.

This is the third persisted platform state after monitor snapshots and run history.

## SQLite execution plan summaries

Sentinel now persists top execution plan summaries from `seo:plans` into the SQLite `plan_summaries` table.

Current policy:

- `reports/seo-execution-plans.json` remains the runtime source for dashboard and automation behaviour.
- SQLite stores append-only execution planning history.
- Persistence is warning-only and must not change plan generation, dashboard consumers or command success.
- `seo:plans` supports default ERP Experts usage and explicit tenant usage with `--tenant erp-experts`.
- `npm run platform:status` shows the plan summary count and latest persisted plans.

This is the fourth persisted platform state after monitor snapshots, run history and opportunity summaries.

## SQLite approval and plan status history

Sentinel now persists approval and plan status workflow history into SQLite.

Current policy:

- `reports/seo-plan-approvals.json` remains the local operational approval file.
- `reports/seo-plan-status.json` remains the local operational status file.
- SQLite appends approval rows to `plan_approvals`.
- SQLite appends status rows to `plan_statuses`.
- `seo:plan:approve` defaults to ERP Experts and also supports `--tenant erp-experts`.
- `seo:plan:status` defaults to ERP Experts and also supports `--tenant erp-experts`.
- Persistence is warning-only and must not apply patches, approve work automatically, change QA scoring or change command success.
- `npm run platform:status` shows approval/status counts and latest rows.
- `npm run platform:health` checks the approval/status tables and prints the latest approval/status summary when present.

This is the fifth persisted platform state after monitor snapshots, run history, opportunity summaries and execution plan summaries.

## SQLite Action Inbox history

Sentinel now persists generated Action Inbox rows into SQLite.

Current policy:

- `reports/seo-action-inbox.json` remains the runtime inbox report.
- SQLite appends inbox rows to `inbox_items`.
- The `sentinel_state` recommendation is persisted when present.
- `seo:inbox` defaults to ERP Experts and also supports `--tenant erp-experts`.
- Persistence is warning-only and must not apply work, approve plans, change QA scoring or change command success.
- `npm run platform:status` shows inbox item counts and latest rows.
- `npm run platform:health` checks the inbox table and warns if an inbox report exists without persisted inbox rows.

This is the sixth persisted platform state after monitor snapshots, run history, opportunity summaries, execution plan summaries, approvals and plan statuses.

## SQLite retention cleanup

Sentinel now includes a dry-run-first cleanup command for append-only platform history:

```bash
npm run platform:cleanup
npm run platform:cleanup -- --days 30 --keep-latest 20
npm run platform:cleanup -- --days 30 --keep-latest 20 --confirm
```

Current policy:

- Dry-run is the default.
- `--confirm` is required before any deletion.
- Tenants are never deleted.
- Cleanup is scoped to the selected tenant.
- Latest rows are protected per table.
- Only rows older than the retention window are eligible.
- Missing tables warn and continue.
- `platform:health` warns when append-heavy tables exceed 1,000 rows but does not fail on row count alone.

## Sentinel operational state

`npm run platform:state` is the operator-level summary of what Sentinel currently knows from SQLite.

It generates ignored output:

- `reports/sentinel-state.json`

It reads persisted tenant, run, snapshot, opportunity, plan, approval and status state through the read-only Sentinel state API layer at `platform/api/state_api.mjs`, then classifies the current workflow as one of:

- `healthy_monitoring`
- `growth_ready`
- `planning_required`
- `approval_required`
- `execution_ready`
- `blocked`
- `human_review_required`

Command distinction:

- `platform:status` shows low-level DB readiness and table counts.
- `seo:autopilot` runs the orchestration workflow and regenerates reports.
- `platform:state` exports the concise operational intelligence summary to `reports/sentinel-state.json`.
- `platform:api` previews the same persisted state without writing files, with `--json` support for future services.
- `platform:api:serve` exposes the same state plus controlled allowlisted actions through a local-only HTTP prototype.

The private Sentinel operator dashboard at `/seo-roadmap` now reads `reports/sentinel-state.json` and shows the same high-level operating picture in a compact Current Sentinel State panel. The stakeholder-safe `/seo-progress` route does not expose this state, commands, approvals, diagnostics or prompts.

The current dashboard remains report-compatible. The new API layer is the first step towards DB-backed services and dashboard reads without relying entirely on generated report files.

The HTTP prototype defaults to `http://127.0.0.1:4317` and provides read-only `GET /health`, `GET /state`, `GET /state?tenant=erp-experts`, `GET /tenant`, `GET /tenants`, `GET /activity`, `GET /feedback` and `GET /actions/history`, plus controlled `POST /action` for allowlisted local operator actions, local-only `POST /feedback` for operator notes and `POST /feedback/triage` for feedback backlog updates. It has no authentication. Do not expose it publicly or run it as a Raspberry Pi service until auth, process supervision and deployment hardening exist.

For local operator testing, `/seo-roadmap` can try the HTTP API first when `VITE_SENTINEL_API_BASE_URL` is configured. It falls back quietly to `reports/sentinel-state.json` if the API is unavailable. `/seo-progress` remains stakeholder-safe and does not use Sentinel operator API state.

The inactive Raspberry Pi service scaffold is now documented in `docs/RASPBERRY_PI_SERVICE_PLAN.md`. `deploy/systemd/sentinel-api.service.example` is a template only, and `npm run service:dry-run` prints the future systemd install/start commands without modifying system files.

Access control planning is now scaffolded in `docs/SENTINEL_ACCESS_CONTROL_PLAN.md`, `docs/SENTINEL_BASIC_AUTH_SETUP.md` and `deploy/nginx/sentinel-basic-auth.example.conf`. These files document basic auth and reverse-proxy protection only. No runtime auth is enabled, no credentials are committed and the production `/seo-roadmap` redirect remains unchanged.

The Action Inbox now uses the same Sentinel operational state to create a top-level review item such as `Review approved planning work`. This makes the inbox the practical operator queue while preserving `reports/seo-action-inbox.json` and the existing opportunity, plan, link, freshness and conversion inputs. Inbox rows are also appended to SQLite as operator queue history.

It does not change SEO scoring, edit content, approve plans, apply patches, publish or commit.

## Local operator bootstrap

`npm run platform:start` is the preferred local operator startup command. It runs `platform:health` and `seo:monitor`, checks whether the local Sentinel API is available, reads the persisted operational summary and prints:

- health and QA totals
- workflow state
- latest opportunity and plan
- recommended next step
- operator dashboard URL
- stakeholder-safe URL
- latest deployment readiness status

It does not deploy, SSH, open browsers, start Vite or permanently start daemons. Optional `npm run platform:start -- --with-api` starts the local API server only as a foreground child process for that terminal session and stops it on `Ctrl+C`.

## Doctor diagnostics

`npm run platform:doctor` is the troubleshooting command for Sentinel.

Default mode is fast and mostly read-only. It checks Git state, required package scripts, SQLite integrity, persisted operational state, latest cadence output, notification payload presence, local API availability if running, deployment readiness output and the production route-guard expectation for `/seo-roadmap`.

It writes ignored local output to `reports/sentinel-doctor.json`. API absence and stale/missing optional reports are warnings, not failures. Critical failures, such as an unreadable DB or missing required scripts, return a non-zero exit code.

Use `npm run platform:doctor -- --full` when a deeper check is needed. Full mode also runs `platform:health`, `backup:verify`, `platform:state` and `seo:monitor`, so it may update normal local run/snapshot history. Use `platform:start` for daily operation and `platform:doctor` when something seems wrong.

## Daily operator report

`npm run platform:daily` creates a concise Markdown handoff at `reports/sentinel-daily-operator-report.md`.

The report includes tenant, health, QA totals, workflow state, latest opportunity, latest plan, latest inbox item, approval/status summary, deployment readiness status, recent runs, Matthew attention items and safe next commands. It reads persisted state through `platform/api/state_api.mjs` and does not run orchestration, edit content, expose private data publicly or deploy anything.

The report is ignored local operator output, not a stakeholder-facing artefact.

## Stakeholder weekly report

`npm run platform:stakeholder` creates a business-facing weekly progress summary at `reports/sentinel-stakeholder-weekly-report.md`.

It translates safe state and public report data into plain English: content health, QA totals, completed work, current work, planned next items, strategic opportunities and recommended focus. It deliberately excludes npm commands, Codex prompts, approval state, database/API internals, private route names, diagnostics and operator-only details.

Use `platform:daily` for Matthew's private operator handoff. Use `platform:stakeholder` for Tim/Ric/internal non-technical visibility. The generated report is ignored local output.

## Local automation cadence

`npm run platform:cadence` is the safe scheduled workflow wrapper for local Sentinel operation.

Default cadence runs:

- `seo:monitor`
- `platform:state`
- `platform:daily`
- `platform:stakeholder`
- `platform:notify -- --all`

It writes ignored output to `reports/sentinel-cadence-summary.json`, `reports/notifications/` and the existing report files. The private `/seo-roadmap` dashboard shows the latest cadence run in a compact Cadence Summary panel. The stakeholder-safe `/seo-progress` route does not expose this operator cadence state. It does not send messages, deploy, start services, install cron jobs or expose private data publicly. Use `--dry-run`, `--operator-only` or `--stakeholder-only` for narrower local scheduling. Cron and future Raspberry Pi examples are documented in `docs/SENTINEL_AUTOMATION_CADENCE.md`.

Inactive Raspberry Pi systemd timer templates are also present for later controlled deployment:

- `deploy/systemd/sentinel-cadence.service.example`
- `deploy/systemd/sentinel-cadence.timer.example`
- `deploy/systemd/sentinel-stakeholder.service.example`
- `deploy/systemd/sentinel-stakeholder.timer.example`

`npm run cadence:service:dry-run` validates those templates and prints future install commands without modifying system files.

## Notification payload scaffold

`npm run platform:notify` prepares local notification payloads only. It does not send email, connect Slack, call external APIs or use credentials.

Modes:

- `--operator`
- `--stakeholder`
- `--all`
- `--json`
- `--dry-run`

Generated payloads are ignored under `reports/notifications/`. Operator payloads may include useful commands and workflow context. Stakeholder payloads are sanitised and blocked if forbidden internal terms are detected, including commands, Codex, Sentinel, SQLite, DB, API, approval, private route names, diagnostics, tenant wording or plan IDs. Cadence now calls `platform:notify` for its selected mode, so notification payloads are prepared during scheduled/local refreshes while sending remains future work.

Future integrations may send these payloads via email, Slack or dashboard alerts, but delivery is intentionally not implemented yet.
