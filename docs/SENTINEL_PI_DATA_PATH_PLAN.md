# Sentinel Pi Data Path Migration Plan

Sentinel is currently running on the Raspberry Pi with `sentinel-api.service` installed and active. The API is private and bound to `127.0.0.1:4317`, but the SQLite database is still in the deployed Git checkout:

```text
/srv/sentinel/apps/seo-ops/platform/persistence/platform.db
```

That repo-local DB path is acceptable for early smoke testing only. It is not the correct long-term runtime layout because Git checkouts are deployable app code, not durable operational state.

## Canonical Runtime Paths

Use `/srv/sentinel` as the Raspberry Pi runtime root.

```text
/srv/sentinel/apps/seo-ops                 # deployed app checkout
/srv/sentinel/data/seo-ops/platform.db     # canonical SQLite database
/srv/sentinel/data/seo-ops/reports         # generated operational reports
/srv/sentinel/data/seo-ops/backups         # backup artefacts
/srv/sentinel/logs/seo-ops                 # service and operational logs
```

The canonical DB path is:

```text
/srv/sentinel/data/seo-ops/platform.db
```

The canonical reports path is:

```text
/srv/sentinel/data/seo-ops/reports
```

The canonical backups path is:

```text
/srv/sentinel/data/seo-ops/backups
```

The canonical logs path is:

```text
/srv/sentinel/logs/seo-ops
```

## Required Runtime Environment

The Pi-local `.env` should eventually include these runtime paths:

```bash
PLATFORM_DB_PATH=/srv/sentinel/data/seo-ops/platform.db
PLATFORM_REPORT_OUTPUT_PATH=/srv/sentinel/data/seo-ops/reports
PLATFORM_BACKUP_PATH=/srv/sentinel/data/seo-ops/backups
PLATFORM_LOG_PATH=/srv/sentinel/logs/seo-ops
```

Keep `.env` on the Pi only. Do not commit it.

## Runtime Path Support

Sentinel now resolves runtime paths from environment variables while keeping local defaults for development:

- `PLATFORM_DB_PATH` controls the active SQLite DB path.
- `PLATFORM_REPORT_OUTPUT_PATH` controls Sentinel platform report output.
- `PLATFORM_BACKUP_PATH` controls backup verification and backup planning.
- `PLATFORM_LOG_PATH` documents the active operational log location.

The local default DB remains `platform/persistence/platform.db`, so existing development commands continue to work. `platform:init` can create the parent directory for an overridden DB path. Read-only checks report missing path parents clearly and do not create directories.

Before the Pi DB is migrated, verify the configured paths with:

```bash
npm run platform:runtime:paths
npm run platform:runtime:paths -- --json
```

## Dry-run Planning Command

Use:

```bash
npm run platform:pi:data:path:plan
```

This command is read-only. It checks the repo-local DB, canonical directories, service `.env`, service state and whether a canonical DB already exists. It writes ignored reports:

```text
reports/sentinel-pi-data-path-plan.md
reports/sentinel-pi-data-path-plan.json
```

It does not stop the service, copy the DB, edit `.env`, restart systemd or expose the API.

## Proposed Future Migration Sequence

Run these steps only in a separate approved migration task:

1. Confirm `platform:pi:service:verify` is healthy.
2. Confirm `PLATFORM_DB_PATH` support is validated with `platform:runtime:paths`, `platform:init`, `platform:status` and `platform:health`.
3. Stop `sentinel-api.service`.
4. Copy the repo-local DB to `/srv/sentinel/data/seo-ops/platform.db`.
5. Preserve the repo-local DB as a temporary rollback copy.
6. Update the Pi `.env` with canonical runtime paths.
7. Run `npm run platform:health` using the canonical DB.
8. Restart `sentinel-api.service`.
9. Verify `/health`, `/state` and `/tenant`.
10. Run backup verification against `/srv/sentinel/data/seo-ops/backups`.
11. Keep the rollback copy until the service has been stable and backup verification has passed.

## Rollback Notes

If the service fails after migration:

- stop `sentinel-api.service`,
- restore the previous Pi `.env`,
- restart the service against the repo-local DB,
- verify `/health`, `/tenant` and `/state`,
- do not delete either DB copy until the failure is understood.

## What Not To Do Yet

- Do not migrate the DB in the planning step.
- Do not edit the active Pi `.env` in the planning step.
- Do not restart `sentinel-api.service` during planning.
- Do not enable cadence timers.
- Do not expose the API through a reverse proxy.
- Do not delete the repo-local DB until rollback confidence exists.

## Confirmed Migration Command

The controlled migration command is:

```bash
npm run platform:pi:data:path:migrate
npm run platform:pi:data:path:migrate -- --confirm
```

Default mode is dry-run only. It performs read-only SSH checks, prints the planned steps and writes ignored local reports. It does not stop the service, copy the DB, edit `.env` or restart anything.

Confirmed mode requires `--confirm`. It refuses to run if the repo-local DB is missing, the canonical DB already exists, the service is missing or inactive, canonical directories are missing, Pi `.env` is missing, or SSH fails. If `--allow-existing-target` is supplied, an existing canonical DB is not overwritten.

The confirmed sequence backs up the repo-local DB to `/srv/sentinel/data/seo-ops/backups`, copies the DB to `/srv/sentinel/data/seo-ops/platform.db`, updates Pi `.env` with canonical runtime paths, runs `platform:health` with that env loaded, restarts `sentinel-api.service`, verifies `/health`, `/state` and `/tenant`, and leaves the repo-local DB untouched as the rollback copy.

### Sudo Gate

Confirmed migration requires non-interactive sudo for the narrow service-control steps. The dry-run checks `sudo -n true` and reports `NOT_READY` if sudo would require an interactive password. Do not store sudo passwords in scripts or `.env`. If non-interactive sudo is unavailable, use a separately approved interactive maintenance window or a narrowly scoped sudoers rule before retrying the confirmed migration.
