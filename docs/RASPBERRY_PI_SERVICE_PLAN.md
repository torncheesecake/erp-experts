# Raspberry Pi Sentinel API Service Plan

Sentinel now has a local read-only HTTP API prototype. This document describes how it could later run as a managed private service on Matthew's Raspberry Pi server. It is planning and scaffold only. Do not deploy, enable or expose the service yet.

## Why localhost-only

The API currently has no authentication. It exposes operational state from SQLite, including workflow state, opportunities, plans, approvals and inbox summaries. That is operator data, not public website content.

The service should bind to `127.0.0.1` until authentication and access controls exist. A reverse proxy should not expose it publicly during this phase.

## Proposed systemd approach

Template:

```text
deploy/systemd/sentinel-api.service.example
```

Future installed service path:

```text
/etc/systemd/system/sentinel-api.service
```

The template uses:

- `WorkingDirectory=/srv/matthew-platform/apps/seo-ops`
- `EnvironmentFile=/srv/matthew-platform/apps/seo-ops/.env`
- `SENTINEL_API_HOST=127.0.0.1`
- `SENTINEL_API_PORT=4317`
- `PLATFORM_TENANT=erp-experts`
- `ExecStart=/usr/bin/npm run platform:api:serve`
- `Restart=on-failure`

The `User` and `Group` values are placeholders and must match the real Raspberry Pi deployment user.

## Required environment variables

The server `.env` should stay outside public access and must not be committed. Useful values:

```text
NODE_ENV=production
PLATFORM_TENANT=erp-experts
PLATFORM_DB_PATH=/srv/matthew-platform/data/seo-ops/platform.db
PLATFORM_REPORTS_PATH=/srv/matthew-platform/data/seo-ops/reports
PLATFORM_BACKUP_PATH=/srv/matthew-platform/data/seo-ops/backups
PLATFORM_LOG_PATH=/srv/matthew-platform/logs/seo-ops
SENTINEL_API_HOST=127.0.0.1
SENTINEL_API_PORT=4317
```

## Dry-run command

Use the dry-run script before any real service work:

```bash
npm run service:dry-run
```

It checks the service template and package script, then prints the commands that would be used later. It does not copy files, reload systemd, enable services, start services or modify the server.

## Future install sequence

These commands are documented only. Do not run them until a controlled deployment is approved:

```bash
sudo cp deploy/systemd/sentinel-api.service.example /etc/systemd/system/sentinel-api.service
sudo systemctl daemon-reload
sudo systemctl enable sentinel-api
sudo systemctl start sentinel-api
sudo systemctl status sentinel-api
```

Smoke test after a future start:

```bash
npm run platform:api:smoke
```

## Dashboard integration

For local operator testing, the dashboard can point to the API with:

```text
VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317
```

For Raspberry Pi deployment, the dashboard should only use the API once auth, reverse proxy rules and service supervision are in place. Until then, keep report-based fallback behaviour.

## Reverse proxy rule

Do not expose the Sentinel API through Nginx, Apache, Caddy or any public domain until auth exists. If a reverse proxy is later added, it should start behind basic auth or a stronger tenant-aware auth layer.

The access-control scaffold is documented in:

- `docs/SENTINEL_ACCESS_CONTROL_PLAN.md`
- `docs/SENTINEL_BASIC_AUTH_SETUP.md`
- `deploy/nginx/sentinel-basic-auth.example.conf`

These are templates only. Do not enable them with real traffic until credentials are generated on the server and the operator routes are confirmed private.

## Backup considerations

Before enabling a managed API service:

- Confirm `platform.db` lives outside Git.
- Confirm daily or weekly backups exist.
- Back up `platform.db` before any service migration.
- Run `npm run backup:verify`.
- Run `npm run backup:restore:test`.
- Keep generated reports and backups outside the public web root.
- Test restore steps before treating SQLite as canonical platform state.

Backups are not trusted until a restore simulation succeeds. The current restore simulation is non-destructive: it validates a temporary copy and never overwrites the live DB.

## Next safe step

Keep the service scaffold committed but inactive. The next safe implementation step is a local service dry run on the Raspberry Pi that confirms paths, Node, npm, Git and `.env` presence without installing the service.
