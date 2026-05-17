# Raspberry Pi Sentinel API Service Plan

Sentinel now has a local read-only HTTP API prototype. This document describes how it could later run as a managed private service on Matthew's Raspberry Pi server. It is planning and scaffold only. Do not deploy, enable or expose the service yet.

## Why localhost-only

The API currently has no authentication. It exposes operational state from SQLite, including workflow state, opportunities, plans, approvals and inbox summaries. That is operator data, not public website content.

The service should bind to `127.0.0.1` until authentication and access controls exist. A reverse proxy should not expose it publicly during this phase.

The Raspberry Pi is also the intended private authority node for future Sentinel operator access. In that model, `/seo-roadmap` only unlocks operator controls when it can authenticate against Matthew's Sentinel API. If the Pi or API is unavailable, the operator system should fail closed while `/seo-progress` remains stakeholder-safe.

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
SENTINEL_REMOTE_AUTH_MODE=disabled
SENTINEL_REMOTE_API_BASE_URL=
SENTINEL_OPERATOR_TOKEN=
```

The repo contains `platform/persistence/backups/.gitkeep` only so local readiness checks have a safe backup folder convention. Do not use that repo folder for production backups. Raspberry Pi backups should stay under `/srv/matthew-platform/data/seo-ops/backups` or another server data path outside Git.

## Dry-run command

Use the dry-run script before any real service work:

```bash
npm run service:dry-run
```

It checks the service template and package script, then prints the commands that would be used later. It does not copy files, reload systemd, enable services, start services or modify the server.

## Read-only Pi discovery

Use the discovery command before planning any real Raspberry Pi deployment:

```bash
npm run platform:pi:discover
```

Local environment setup is documented in:

```text
docs/RASPBERRY_PI_LOCAL_ENV_SETUP.md
```

The default target host is `192.168.4.22`. The command reads optional local environment variables only:

```text
RASPBERRY_PI_HOST
RASPBERRY_PI_USER
RASPBERRY_PI_SSH_PORT
RASPBERRY_PI_DEPLOY_ROOT
RASPBERRY_PI_APP_PATH
```

If the user is missing, the command exits with a warning rather than failing. It writes ignored local reports to `reports/sentinel-pi-discovery.json` and `reports/sentinel-pi-discovery.md`.

If DHCP changes the Pi address, use the port-only local network fallback:

```bash
npm run platform:pi:discover -- --scan
```

The scan checks `192.168.4.1-254` by default for SSH port `22` and Sentinel API port `4317`. It does not authenticate, prompt for passwords, copy files, create directories, install packages or deploy. Use `--subnet <prefix-or-cidr>` only for a known local range. The preferred long-term fix is a DHCP reservation or static lease for the Pi.

Read-only SSH discovery is available only when explicitly requested:

```bash
npm run platform:pi:discover -- --ssh
```

SSH mode uses `BatchMode=yes`, does not prompt for a password and runs read-only checks only: host name, kernel, Node, npm, Git, disk, memory, `/srv` path visibility and systemd version. It does not install packages, create directories, copy files, start services or expose the API.

## Deployment preparation planning

The concrete preparation plan is documented in:

```text
docs/RASPBERRY_PI_DEPLOYMENT_PREPARATION_PLAN.md
```

Generate the local ignored preparation report with:

```bash
npm run platform:pi:prepare:plan
```

This command reads `reports/sentinel-pi-discovery.json`, prints current blockers and writes `reports/sentinel-pi-preparation-plan.md` plus `.json`. It does not SSH, install Node, create directories, copy files, start services or deploy.

Generate the exact install dry-run sequence with:

```bash
npm run platform:pi:install:preflight
npm run platform:pi:install:dry-run
```

The preflight command requires `RASPBERRY_PI_HOST` and `RASPBERRY_PI_USER` in the local environment. It uses non-interactive read-only SSH checks, no password prompts, no sudo and no writes. It returns `READY_FOR_INSTALL_PREP`, `READY_WITH_WARNINGS` or `NOT_READY`. Missing Node/npm and missing `/srv/matthew-platform` are warnings before first install, not blockers.

This writes `reports/sentinel-pi-install-dry-run.md` plus `.json`. It prints proposed preflight, Node/npm, directory, repo, API smoke, service and post-install commands for review only. It does not SSH or mutate the Pi.

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

Future remote-authority mode should require a token handshake before operator controls are usable. The API should validate that token server-side, with the token stored in the server `.env` or another Matthew-controlled secret store outside Git. Client websites should receive stakeholder-safe outputs only.

For daily local operator startup, use:

```bash
npm run platform:start
```

This checks platform health, runs the SEO monitor, reports the current persisted Sentinel state and tells you whether the local API is running. It does not start the Raspberry Pi service, deploy files or expose anything publicly. `npm run platform:start -- --with-api` is local-only and keeps the API attached to the current terminal until `Ctrl+C`.

For scheduled local reporting, use the cadence wrapper:

```bash
npm run platform:cadence
npm run platform:cadence -- --operator-only
npm run platform:cadence -- --stakeholder-only
```

The cadence command is safe to call from cron later, but no cron jobs or systemd timers are installed by the repo. See `docs/SENTINEL_AUTOMATION_CADENCE.md` before enabling anything on the Raspberry Pi.

Inactive systemd timer templates also exist:

- `deploy/systemd/sentinel-cadence.service.example`
- `deploy/systemd/sentinel-cadence.timer.example`
- `deploy/systemd/sentinel-stakeholder.service.example`
- `deploy/systemd/sentinel-stakeholder.timer.example`

Preview the future timer setup with:

```bash
npm run cadence:service:dry-run
```

The dry-run prints planned install commands and expected schedules only. It does not copy files, reload systemd, enable timers or start jobs.

## Reverse proxy rule

Do not expose the Sentinel API through Nginx, Apache, Caddy or any public domain until auth exists. If a reverse proxy is later added, it should start behind basic auth or a stronger tenant-aware auth layer.

Do not embed a fully functional operator Control Centre in a public ERP Experts site without Matthew-controlled API authority. The public site should continue to expose `/seo-progress` only unless the operator route is protected and authorised.

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

## Deployment readiness gate

Before any Raspberry Pi promotion, run:

```bash
npm run platform:deploy:ready
```

This is the pre-deployment gate. It checks Git cleanliness, build readiness, platform health, DB integrity, backup verification, restore simulation, SEO monitor, service scaffold readiness, deployment dry run and API smoke status if the API is already running.

It does not deploy, SSH, create directories, upload files, start services or expose the API. `READY WITH WARNINGS` is acceptable for local-only warnings. `NOT READY` blocks deployment work.

## Next safe step

Keep the service scaffold committed but inactive. The next safe implementation step is to review the deployment preparation plan, then approve a separate preparation-only task for Node/npm installation, directory creation, repo checkout and foreground API smoke testing.
