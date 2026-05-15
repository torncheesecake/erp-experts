# Pinhole Server Readiness Checklist

This checklist prepares the SEO operations platform for a future safe deployment to Matthew's pinhole server. It is not a deployment runbook and does not require server access yet.

## 1. Required server assumptions

Confirm before any deployment work starts:

- Node.js is installed. Target: current active LTS or the version confirmed by the project build.
- npm is installed and compatible with the Node version.
- Git is installed.
- The server can access the GitHub repository.
- A domain or subdomain decision has been made.
- A reverse proxy will be required later if the dashboard is exposed over HTTP(S).
- A backup path exists outside the Git checkout.
- A data directory exists outside the Git checkout.
- A logs directory exists outside the Git checkout.
- Server secrets are stored in `.env` or service config on the server only.

Useful read-only checks:

```bash
node -v
npm -v
git --version
pwd
```

## 2. Directory structure checklist

Recommended server structure:

```text
/srv/matthew-platform/apps/seo-ops
/srv/matthew-platform/data/seo-ops
/srv/matthew-platform/data/seo-ops/backups
/srv/matthew-platform/logs/seo-ops
/srv/matthew-platform/deploy/scripts
```

Checklist:

- [ ] `/srv/matthew-platform/apps/seo-ops` exists.
- [ ] `/srv/matthew-platform/data/seo-ops` exists.
- [ ] `/srv/matthew-platform/data/seo-ops/backups` exists.
- [ ] `/srv/matthew-platform/logs/seo-ops` exists.
- [ ] `/srv/matthew-platform/deploy/scripts` exists.
- [ ] Runtime database will live outside Git.
- [ ] Generated reports will live outside Git when server reporting becomes canonical.
- [ ] Logs will live outside Git.
- [ ] Backups will live outside Git.

## 3. Security checklist

Before exposing anything publicly:

- [ ] No secrets are committed to the repo.
- [ ] `.env` exists on the server only.
- [ ] `.env.example` contains placeholders only.
- [ ] Basic auth or equivalent access control is configured before any public dashboard exposure.
- [ ] Proper application auth is planned before client access.
- [ ] File permissions restrict the SQLite database.
- [ ] File permissions restrict generated reports.
- [ ] Backup files are not web-accessible.
- [ ] Database backups are scheduled.
- [ ] Report access is restricted by default.
- [ ] Reverse proxy logs do not expose secrets.

## 4. Deployment checklist

Future manual deployment sequence:

```bash
git clone <repo> /srv/matthew-platform/apps/seo-ops/current
cd /srv/matthew-platform/apps/seo-ops/current
npm ci
npm run build
npm run platform:init
npm run platform:health
npm run seo:monitor
```

Before running this for real:

- [ ] Confirm repo URL.
- [ ] Confirm branch.
- [ ] Confirm Node and npm versions.
- [ ] Confirm `.env` has server-only values.
- [ ] Confirm DB path points outside the repo once server DB path support is enabled.
- [ ] Confirm backup path exists.
- [ ] Confirm dashboard access will be private or protected.
- [ ] Confirm rollback plan.

## 5. Rollback checklist

If a future deployment fails:

- [ ] Identify the previous Git commit.
- [ ] Check whether the failure is code, environment, DB, report or proxy related.
- [ ] Restore the previous build or checkout the previous commit.
- [ ] Restore the SQLite DB from the latest good backup if DB state changed.
- [ ] Restore generated reports from backup if report state changed.
- [ ] Restart the service if a service exists later.
- [ ] Re-run `npm run platform:health`.
- [ ] Re-run `npm run seo:monitor`.

Rollback commands will depend on the final deployment model. Do not invent a destructive rollback command until the live layout is confirmed.

## 6. Current safe local checks

Use these before any future server work:

```bash
npm run lint
npm run build
npm run platform:health
npm run seo:monitor
bash deploy/scripts/check-local.sh
bash deploy/scripts/check-server.sh
```

`check-server.sh` is currently read-only and can be run locally. It does not create directories or change server files.

## 7. Deployment dry-run

Before any real server action, run:

```bash
npm run deploy:dry-run
```

Expected behaviour:

- Confirms local Git, Node and npm are available.
- Confirms the current Git branch and clean local worktree.
- Prints the future server paths.
- Prints the server command sequence that would be used later.
- Prints expected `.env` variables.
- Clearly states that no deployment actions were performed.

If the worktree is dirty, stop and resolve it before deployment planning continues.
