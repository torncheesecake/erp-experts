# SEO System Checkpoint

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

## Health status

- Expected healthy target:
  - `pass=27`
  - `needs_review=0`
  - `blocked=0`
  - `humanReviewRecommended=no`
- Monitor mode should remain `HEALTHY` unless regressions occur.

## Platform tenant layer

The first platform extraction boundary is now present under `platform/`.

- `platform/schema/tenant.schema.json` defines the generic tenant config shape.
- `platform/tenants/erp-experts.config.json` describes ERP Experts as the first tenant.
- `platform/README.md` documents the read-only extraction boundary.
- `npm run platform:tenant -- erp-experts` validates and prints the tenant summary.

Current engines still use their existing ERP Experts paths. The tenant layer is a safe foundation for future extraction, not a behaviour change.

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

## Pinhole server deployment plan

Deployment planning for Matthew's pinhole server is captured in `docs/PINHOLE_SERVER_DEPLOYMENT_PLAN.md`.

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

## Pinhole readiness scaffold

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

It prints the intended pinhole server paths, future command sequence, expected `.env` variables and safety notes. It does not SSH, create directories, copy files or deploy anything.

## Backup and environment scaffold

`.env.example` now documents placeholder-only runtime, platform path, tenant, security, deployment and backup variables.

Backup planning commands:

```bash
npm run backup:dry-run
bash deploy/scripts/backup-platform.sh
bash deploy/scripts/backup-platform.sh --confirm
```

Current backup behaviour is intentionally non-mutating. The dry-run prints expected paths and retention. The placeholder backup script refuses without `--confirm`, and even with `--confirm` it prints TODO steps only. Real backup file creation is not implemented yet.
