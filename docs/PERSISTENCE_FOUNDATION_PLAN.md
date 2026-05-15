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
