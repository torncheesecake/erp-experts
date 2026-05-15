# Pinhole Server Deployment Plan

This plan describes how the SEO and content operations platform should eventually live on Matthew's pinhole web server. It is a planning document only. It does not deploy anything, move repositories, create secrets, or change production hosting.

## 1. Current assumptions

- Matthew has a pinhole server available for future platform hosting.
- Codex can access the server when a deployment task is explicitly approved.
- Domains or subdomains can be pointed at the server later.
- The ERP Experts SEO automation currently runs from this repository locally and in GitHub workflows.
- The current dashboard is a Vite/React route at `/seo-roadmap`.
- The tenant configuration foundation exists under `platform/tenants/`.
- The SQLite persistence foundation exists locally at `platform/persistence/platform.db`.
- `platform.db` is ignored and must never be committed.
- JSON reports remain the current runtime outputs for the dashboard and scripts.
- Current content health is `pass=27`, `needs_review=0`, `blocked=0`.

## 2. Recommended server directory layout

Recommended root:

```text
/srv/matthew-platform/
  apps/
    seo-ops/
      current/              # checked-out application repo or release symlink
      releases/             # optional future release folders
      shared/               # shared runtime config if needed
  data/
    seo-ops/
      platform.db           # production SQLite database, outside Git
      reports/              # generated operational reports, outside Git
      backups/
        daily/
        weekly/
  logs/
    seo-ops/
      app.log
      jobs.log
      deploy.log
  sites/
    erp-experts/            # future hosted site artefacts, if needed
    future-client/          # placeholder for future client sites
  deploy/
    scripts/
      deploy-seo-ops.sh
      backup-seo-ops.sh
      health-check.sh
```

Key rule: Git contains source code and configuration templates. The server stores runtime state, reports, logs, databases, backups and secrets outside the repository.

## 3. Repo strategy

Recommended approach:

1. Keep the ERP Experts repo separate initially.
2. Continue extracting reusable platform pieces into `platform/` inside this repo while behaviour remains proven.
3. Create a separate platform repo later when the tenant boundary, persistence layer and deployment model are stable.
4. Keep client sites and platform core loosely coupled.
5. Avoid placing multiple unrelated client websites inside one monolithic production repo.

Short-term:

- ERP Experts remains the first tenant and reference implementation.
- The current repo remains the working development and validation repo.
- Server deployment should pull from GitHub and run the same commands used locally.

Long-term:

- `seo-ops-platform` becomes the reusable platform repo.
- `clients/erp-experts/` or tenant configs point to client-specific data and adapters.
- Client websites can remain in their own repos, with the platform reading approved content/report outputs through adapters.

## 4. Database strategy

Development:

- Keep local SQLite at `platform/persistence/platform.db`.
- Ignore the database in Git.
- Use `npm run platform:init` to create or repair the local DB.

Server:

- Store the production SQLite database outside Git, for example:
  - `/srv/matthew-platform/data/seo-ops/platform.db`
- Use a server-only environment variable later, for example:
  - `SEO_OPS_DB_PATH=/srv/matthew-platform/data/seo-ops/platform.db`
- Back up before any migration or manual inspection.
- Do not edit the production DB directly without a fresh backup.

Backups:

- Daily SQLite backup to `/srv/matthew-platform/data/seo-ops/backups/daily/`.
- Weekly retained backup to `/srv/matthew-platform/data/seo-ops/backups/weekly/`.
- Use SQLite's `.backup` command or a safe copy after pausing writes.
- Keep at least 7 daily and 8 weekly backups once real client state exists.

Future migration:

- SQLite remains the first operational persistence layer.
- Add dual-write JSON plus SQLite first.
- Move read paths to SQLite gradually.
- Migrate to Postgres only when multi-client concurrency, remote access, user roles, or reporting volume justifies it.

## 5. Domain strategy

Do not assume final domain names until DNS is confirmed. Sensible patterns are:

- `app.yourdomain.co.uk`: primary platform application.
- `seo.yourdomain.co.uk`: SEO operations dashboard.
- `reports.yourdomain.co.uk`: optional read-only report portal.
- `clientname.yourdomain.co.uk`: client-specific dashboard or report portal.
- `erp.yourdomain.co.uk`: optional ERP Experts-specific platform area if needed.

Recommended first step:

- Use a private or protected subdomain for the platform dashboard.
- Put basic auth or equivalent access control in front of it until proper app auth exists.
- Keep public marketing websites and private operations dashboards clearly separated.

## 6. Deployment model options

### Phase 1: Static dashboard plus CLI automation

- Server pulls the repo from GitHub.
- Server runs `npm ci`, `npm run build`, `npm run platform:init`, and health checks.
- Generated reports and SQLite DB live under `/srv/matthew-platform/data/seo-ops/`.
- Deployment is manual or scripted.
- No live API service yet.

Best for: proving the server layout without changing platform behaviour.

### Phase 2: Node service/API

- Add a small Node service for dashboard data and health endpoints.
- Run it with `systemd` or PM2.
- Keep SQLite local to the server.
- Add read-only API routes first.

Best for: DB-backed dashboard state, authenticated report viewing and operator workflows.

### Phase 3: Background jobs and reverse proxy

- Add scheduled jobs for monitor, autopilot, digest and backups.
- Put Nginx or Caddy in front of the app.
- Add HTTPS certificates and access controls.
- Store logs under `/srv/matthew-platform/logs/seo-ops/`.

Best for: ambient operations and reliable weekly automation.

### Phase 4: Multi-client app

- Add tenant-aware routing and access control.
- Add per-tenant dashboards, report storage, approvals and audit trails.
- Move towards Postgres if needed.
- Add billing/subscription later if SaaS packaging is approved.

Best for: reusable commercial platform.

## 7. Security notes

- Never commit credentials, `.env` files, database files, backup files, API keys, private folders or production reports that contain sensitive client data.
- Keep `.env` server-only.
- Use basic auth initially if the dashboard is exposed outside the local network.
- Add proper tenant user auth before selling or sharing client access.
- Restrict file permissions for database, reports and backups.
- Keep production DB and generated reports outside the web root unless intentionally exposed through authenticated routes.
- Back up before migrations or manual maintenance.
- Log deployment and automation runs, but avoid logging secrets.

## 8. Codex workflow with the server

Recommended workflow:

1. Make code changes in the repo locally.
2. Run validation locally.
3. Commit and push to GitHub.
4. Server pulls from GitHub.
5. Server runs install, build and health checks.
6. Server writes runtime state to `/srv/matthew-platform/data/seo-ops/`.
7. Codex should not edit production DB state directly unless the task explicitly requires it and a backup has been taken.

Initial server validation commands should mirror local checks:

```bash
npm ci
npm run lint
npm run build
npm run platform:init
npm run platform:status
npm run seo:monitor
```

## 9. First deployment milestone

Smallest safe first implementation:

1. Add deployment docs and server folder convention only.
2. Add example environment template, for example `.env.example`, without secrets.
3. Add a non-destructive health-check script that prints:
   - Node version
   - Git revision
   - platform DB status
   - monitor status
   - report path status
4. Do not move live hosting.
5. Do not switch dashboard reads to the server DB yet.
6. Do not expose a public app until basic auth or private network access is in place.

Recommended first engineering task after this plan:

- Add a read-only `scripts/platform/platform_health_check.mjs` command that can run locally or on the server and report platform readiness without mutating content or reports.

## 10. Future SaaS path

The pinhole server can become the proving ground for the reusable platform before any full SaaS build.

Likely evolution:

1. Private internal platform for ERP Experts.
2. Multi-tenant dashboard with tenant configs and SQLite persistence.
3. Client report portals with protected access.
4. Execution planning, approvals and audit history stored in DB.
5. Background jobs for weekly monitor, autopilot, digest and backups.
6. Standalone platform repo and deployable Node app.
7. Postgres-backed multi-client deployment.
8. Customer auth, roles and subscriptions.
9. Optional billing layer and managed SEO/content operations service.

Commercial packaging options:

- Internal marketing operations tool.
- Agency client dashboard.
- Managed SEO and content operations service.
- SaaS subscription once auth, isolation, billing and support processes are mature.

## 11. Open questions before deployment

- Which domain or subdomain should host the private platform dashboard?
- Should the first server deployment be local-network only or internet-accessible behind basic auth?
- Should generated reports on the server be treated as private by default?
- What backup retention is acceptable once client data exists?
- Should ERP Experts website hosting remain separate from the platform app during the first deployment?

## Recommendation

Do not deploy the platform yet. The next safe step is to add read-only deployment support: server folder documentation, `.env.example`, and a `platform:health` command. Once that is proven locally, run the same health check on the pinhole server without changing production hosting.

## 12. Read-only platform health command

The first deployment-readiness command is now:

```bash
npm run platform:health
```

It is read-only and suitable for local checks and future pinhole server checks. It verifies:

- ERP Experts tenant config is present and valid.
- SQLite can be inspected.
- Required SQLite tables exist.
- ERP Experts tenant exists in the DB.
- Snapshot count is readable.
- Core SEO reports are present.
- Latest QA totals can be read.
- Pinhole deployment planning docs are present.
- Runtime database and generated operational reports are ignored by Git policy.

The command does not deploy, initialise, migrate, edit reports, edit content or change production state. If it reports missing DB state, run `npm run platform:init` first.

## 13. Readiness scaffold

The repo now includes a pre-deployment scaffold only:

- `docs/PINHOLE_SERVER_READINESS_CHECKLIST.md`
- `.env.example`
- `deploy/scripts/check-local.sh`
- `deploy/scripts/check-server.sh`

These files do not deploy anything and do not touch the server. `check-local.sh` runs local validation. `check-server.sh` prints read-only environment and directory status and can be run locally or on the server later.

## 14. Deployment dry-run planner

Use the dry-run planner before any real server work:

```bash
npm run deploy:dry-run
```

It is read-only. It checks local prerequisites, confirms the local Git branch and clean worktree, prints the intended server paths, lists the future server command sequence, lists expected `.env` values and repeats the key safety rules. It does not SSH, create directories, copy files, deploy, restart services or modify server state.

## 15. Environment and backup scaffold

The server `.env` should live on the server only, outside Git. `.env.example` now documents placeholder values for runtime, platform paths, tenant defaults, security placeholders, deployment and backup settings.

Recommended server paths:

- DB: `/srv/matthew-platform/data/seo-ops/platform.db`
- Reports: `/srv/matthew-platform/data/seo-ops/reports`
- Backups: `/srv/matthew-platform/data/seo-ops/backups`
- Logs: `/srv/matthew-platform/logs/seo-ops`

Backup planning commands:

```bash
npm run backup:dry-run
bash deploy/scripts/backup-platform.sh
bash deploy/scripts/backup-platform.sh --confirm
```

`backup:dry-run` prints intended backup paths, file naming and retention only. `backup-platform.sh` refuses without `--confirm`. Even with `--confirm`, it is currently a safe placeholder that prints TODO backup steps only.

Restore principles:

- Back up before changing production DB state.
- Restore DB and reports together when they represent the same run state.
- Verify restored DB with `npm run platform:health`.
- Verify SEO health with `npm run seo:monitor`.
- Do not expose the dashboard publicly until authentication exists.
