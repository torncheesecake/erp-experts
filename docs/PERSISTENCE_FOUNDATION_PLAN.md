# Platform Persistence Foundation Plan

## Sentinel working name

Sentinel is the working name for the platform persistence layer and wider SEO/content operations system. The persistence files, commands and database paths are not being renamed in this phase.


## Purpose

The SEO automation system currently works well as a JSON-report orchestration layer. The next platform milestone is to introduce real persistent state without breaking the existing ERP Experts workflow.

This plan defines the persistence architecture and the first safe implementation layer.

## 1. Current State

The system currently relies on generated files:

- `reports/resource-qa-report.json`
- `reports/seo-action-briefs.json`
- `reports/seo-weekly-summary.json`
- `reports/seo-pipeline-summary.json`
- ignored operational reports such as opportunities, plans, inbox, digest, decisions and autopilot output
- history snapshots under `reports/history/`

The dashboard reads these report files directly or through static fetches. CLI commands regenerate them, and operator workflows infer current state from the latest JSON output.

This is reliable enough for a single local site, but it is not yet true platform state.

## 2. Problems With The Current Approach

The current JSON-first model has limits:

- Reports are acting as canonical state, even though they are generated artefacts.
- Workflow state is fragmented across reports, active plan files, approvals and ignored local files.
- It is difficult to query historical trends without scanning folders.
- Multi-client orchestration would require careful report path isolation.
- Approvals and execution history are not durable enough for a hosted platform.
- Notifications, scheduled digests and audit trails need stable persistence.
- Dashboard state is coupled to file availability rather than a platform state model.

The system should keep JSON reports for compatibility while gradually introducing a database-backed state layer.

## 3. Persistence Roadmap

### Phase 1: SQLite Foundation

Add a local SQLite database at `platform/persistence/platform.db`.

Initial scope:

- tenants
- monitor snapshots
- minimal run table for future orchestration tracking

JSON reports remain the primary runtime outputs.

### Phase 2: Dual-Write JSON And DB

Engines continue writing JSON reports, but selected state is also persisted to SQLite.

Likely next dual-writes:

- pipeline runs
- opportunity centre summaries
- execution plan status
- approval records
- digest records

### Phase 3: DB-First Orchestration

Commands read canonical state from SQLite, then export JSON for dashboard/static compatibility.

At this stage:

- current health comes from snapshots
- approvals come from DB
- execution status comes from DB
- reports become views/exports

### Phase 4: Multi-Tenant Persistence

Every persisted entity becomes tenant-scoped.

This enables:

- multiple client dashboards
- tenant-specific history
- tenant-specific approvals
- separate execution queues
- client-level reporting

### Phase 5: Postgres Migration

Postgres becomes useful when the platform needs:

- hosted multi-user access
- role-based permissions
- long-term history
- billing/subscriptions
- stronger backup and monitoring workflows
- multiple web workers or scheduled jobs

SQLite should remain the local development and single-server bootstrap option.

## 4. Initial Canonical Entities

Longer-term platform tables should include:

- `tenants`: client identity and domain information.
- `runs`: command/job executions.
- `reports`: generated report metadata and current export pointers.
- `opportunities`: unified opportunities and source signals.
- `plans`: execution plans and safety state.
- `approvals`: approval records and approval levels.
- `inbox_items`: suggested actions and review state.
- `digests`: weekly or scheduled stakeholder summaries.
- `snapshots`: health snapshots and QA totals.
- `actions`: user or automation actions.
- `execution_history`: proposed, reviewed, applied and validated work.

The first implementation only creates:

- `tenants`
- `runs`
- `snapshots`

## 5. What Remains File-Based Initially

These remain file-based for now:

- article data
- QA reports
- action briefs
- weekly summaries
- opportunity reports
- execution plans
- inbox reports
- digest files
- active plan files
- generated prompts
- dashboard JSON consumption

This avoids a big-bang migration and keeps the known working system intact.

## 6. What Becomes Canonical DB State First

The first canonical persisted entity is the monitor snapshot.

Each successful monitor run can write:

- tenant ID
- pass count
- review count
- blocked count
- monitor status
- timestamp

This is low risk because it does not change how the monitor calculates health or how JSON reports are consumed.

## 7. Migration Strategy

The migration strategy is deliberately conservative:

1. Add SQLite foundation.
2. Keep JSON reports as runtime outputs.
3. Dual-write selected state after successful commands.
4. Query SQLite through read-only status commands.
5. Move one workflow at a time from report inference to DB-backed state.
6. Keep exports for dashboard compatibility.
7. Only consider DB-first orchestration after several dual-write paths are stable.

No command should fail just because optional persistence fails during the early phase. Persistence warnings should be visible, but existing SEO workflows should continue.

## 8. First Persistence-Backed Feature

Recommended first feature:

> Monitor snapshot history.

Reason:

- It is already tenant-scoped.
- It is simple to validate.
- It supports dashboard trends later.
- It does not affect scoring or content.
- It proves database writes without changing report consumers.

The first implementation writes a snapshot row from `seo:monitor` after the monitor state is built.

## 9. Current Implementation Layer

Added:

- `platform/persistence/schema.sql`
- `platform/persistence/db.js`
- `platform/persistence/README.md`
- `scripts/platform/platform_init_db.mjs`
- `scripts/platform/platform_status.mjs`
- `npm run platform:init`
- `npm run platform:status`

Database file:

- `platform/persistence/platform.db`

Git policy:

- The database file is ignored.
- WAL and SHM files are ignored.
- Schema and persistence scripts are committed.

Current dual-write:

- `seo:monitor` inserts one row into `snapshots` when the database exists.
- If the DB write fails, monitor prints a warning and still succeeds.

## 10. Next Recommended Step

After this foundation stabilises, the next safe persistence-backed feature is pipeline run tracking:

- insert a `runs` row at the start of `seo:pipeline`
- update status and `finished_at` when the command completes
- keep report output unchanged
- keep failure handling explicit

That would give the platform a real execution history without changing SEO scoring or report consumers.

## Run logging foundation

The existing `runs` table is now used by selected commands:

- `seo:monitor`
- `seo:pipeline`
- `seo:autopilot`
- `platform:health`

Each logged run records tenant ID, command, status, start time and finish time. DB write failures are warning-only and must not change command success unless the underlying command failed.

`npm run platform:status` now shows total run count, the last run and the latest five runs. This is the second persisted platform state after monitor snapshots.

## Opportunity summary persistence

The next dual-write layer is strategic opportunity summaries.

The new `opportunity_summaries` table stores the latest top opportunities produced by `seo:opportunities`:

- tenant ID
- opportunity ID
- title
- primary type
- score
- priority label
- action theme
- target slug or path
- suggested state
- created timestamp

This does not replace `reports/seo-opportunity-centre.json`. The JSON report remains the runtime source for the dashboard and downstream scripts. SQLite is used as an append-only history layer so Sentinel can start tracking strategic opportunities over time.

This layer is deliberately simple. It does not dedupe perfectly yet, and DB write failures are warning-only. The future platform can later promote these summaries into canonical opportunity state after the dual-write path has proved stable.

## Execution plan summary persistence

Execution plan summaries are now dual-written from `seo:plans` into SQLite.

The new `plan_summaries` table stores:

- tenant ID
- plan ID
- title
- plan type
- execution priority
- estimated impact
- estimated effort
- confidence
- safety level
- required human review flag
- target slug or path
- suggested state
- created timestamp

`seo:plans` remains JSON-first for runtime behaviour. `reports/seo-execution-plans.json` is still the dashboard and automation source. SQLite stores append-only planning history for Sentinel so future platform stages can track planning state, review state and execution readiness without treating generated files as canonical state.

This is intentionally not a full workflow migration. No plan approval, patching or dashboard behaviour is changed by this persistence layer.

## Approval and plan status persistence

Plan approval and status workflow state is now also dual-written to SQLite.

The new `plan_approvals` table stores:

- tenant ID
- plan ID
- approved-for level
- safety level
- required human review flag
- approval note
- source plan title
- approval timestamp
- optional expiry timestamp

The new `plan_statuses` table stores:

- tenant ID
- plan ID
- title
- current status
- safety level
- required human review flag
- next recommended step
- validation state
- notes
- last-updated timestamp

This does not replace `reports/seo-plan-approvals.json` or `reports/seo-plan-status.json`. Those ignored JSON files remain the local operational state used by the current scripts. SQLite is accumulating append-only workflow history so Sentinel can later track approvals and execution lifecycle across tenants without relying on generated files as the long-term source of truth.

DB persistence is additive and warning-only. A database write failure must not approve, reject, apply, block or otherwise alter the existing file-based workflow.

## Action Inbox persistence

Action Inbox items are now also dual-written to SQLite.

The new `inbox_items` table stores:

- tenant ID
- item ID
- source
- title
- priority
- status
- recommended next step
- command
- target slug/path
- safety level
- required human review flag
- related IDs
- created timestamp

This does not replace `reports/seo-action-inbox.json`. The JSON report remains the runtime source for the dashboard and existing automation. SQLite is accumulating append-only operator queue history so Sentinel can later track review work, completion state and hand-offs across tenants.

DB persistence is additive and warning-only. A database write failure must not apply work, approve plans, alter scoring or change the generated inbox behaviour.

## Retention and cleanup

Sentinel now has a dry-run-first DB cleanup command:

```bash
npm run platform:cleanup
npm run platform:cleanup -- --days 30 --keep-latest 20
npm run platform:cleanup -- --days 30 --keep-latest 20 --confirm
```

Cleanup covers append-heavy history tables:

- `runs`
- `snapshots`
- `opportunity_summaries`
- `plan_summaries`
- `plan_approvals`
- `plan_statuses`
- `inbox_items`

The command never deletes tenants. It is scoped to one tenant, keeps the latest N rows per table, and only deletes rows older than the chosen retention window when `--confirm` is explicitly passed.

`platform:health` warns if any append-heavy table grows beyond 1,000 rows, but row count alone is not a health failure.

## Operational state summary

`npm run platform:state` is the first high-level operational summary layer on top of persisted Sentinel state.

It reads SQLite and summarises:

- tenant identity
- latest health snapshot
- recent runs and failed runs
- latest persisted opportunities
- latest persisted plans
- current approval and plan status state
- workflow classification
- recommended next action

It now uses the read-only Sentinel state API layer at `platform/api/state_api.mjs`. The API module exposes reusable SQLite accessors for tenant state, latest snapshots, runs, opportunities, plans, approvals, inbox items and the combined operational summary.

`npm run platform:api` previews that API-style state without writing files. `npm run platform:api -- --json` writes the future API contract to stdout only.

`npm run platform:api:serve` starts a local read-only HTTP prototype on `127.0.0.1:4317` by default. It exposes:

- `GET /health`
- `GET /state`
- `GET /state?tenant=erp-experts`
- `GET /tenant`

`npm run platform:api:smoke` checks a running local API server. This layer is deliberately localhost-first, unauthenticated and not suitable for public exposure. The future migration path is auth, dashboard API reads, Raspberry Pi service management, then a hardened multi-tenant API.

The private operator dashboard can optionally read this API by setting `VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317` during local development. If the API is unavailable, the dashboard falls back to `reports/sentinel-state.json`. The stakeholder-safe `/seo-progress` route remains report-based and does not expose Sentinel operator state.

`platform:state` still writes `reports/sentinel-state.json`, which is ignored as generated operational output. This preserves dashboard compatibility while the canonical operational state gradually moves towards SQLite-backed accessors.

The generated Action Inbox now reads this state and promotes the current Sentinel recommendation to the top of the queue. For example, when persisted approvals show planning work is ready for review, the inbox creates a `sentinel_state` item with status `awaiting_review`. Those inbox items are also appended to SQLite for history, while JSON remains the runtime source.

The distinction is:

- `platform:status`: low-level persistence and table counts.
- `seo:autopilot`: run the full orchestration chain and regenerate reports.
- `platform:state`: export what Sentinel currently knows to ignored dashboard JSON.
- `platform:api`: read-only API preview of the same persisted state.
- `platform:api:serve`: local HTTP prototype for future dashboard and server use.

This does not replace JSON reports, run orchestration, apply approvals, edit content or change scoring.
