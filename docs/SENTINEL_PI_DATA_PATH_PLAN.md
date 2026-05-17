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

## Important Implementation Caveat

The current persistence module still defaults to `platform/persistence/platform.db`. Before the migration is executed, Sentinel must either:

- honour `PLATFORM_DB_PATH` in the persistence layer, or
- provide an equivalent runtime configuration mechanism that points API and platform commands at `/srv/sentinel/data/seo-ops/platform.db`.

Do not update the Pi service `.env` to `PLATFORM_DB_PATH` and assume it works until this support is verified.

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
2. Confirm `PLATFORM_DB_PATH` support is implemented and validated.
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
