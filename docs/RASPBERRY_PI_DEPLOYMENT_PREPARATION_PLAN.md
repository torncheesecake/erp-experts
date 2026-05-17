# Raspberry Pi Deployment Preparation Plan

This is a planning document for preparing Matthew's Raspberry Pi to run Sentinel later. It is based on read-only discovery from `192.168.4.22` and does not approve deployment.

No SSH mutation, package installation, directory creation, file copying, service start or API exposure has been performed.

## 1. Current Pi Inventory

Latest confirmed read-only discovery:

- Host: `192.168.4.22`
- Hostname: `raspberrypi`
- Reverse DNS from scan: `pi.hole`
- OS/kernel: Debian Bookworm on `aarch64`, kernel `6.12.34+rpt-rpi-v8`
- Git: `2.39.5`
- systemd: available, `252`
- Disk: `29G` total, `18G` used, `11G` available, `62%` used on `/`
- Memory: `7.8Gi` total, `7.2Gi` available
- `/srv`: exists and is owned by `root:root`
- `/srv/matthew-platform`: not present
- Node.js: not installed
- npm: not installed
- Sentinel API port `4317`: closed

## 2. Readiness Blockers

The Pi is reachable and suitable for a controlled preparation sequence, but it is not ready to run Sentinel yet.

Current blockers:

- Node.js is not installed.
- npm is not installed.
- The deployment root `/srv/matthew-platform` does not exist.
- The application path `/srv/matthew-platform/apps/seo-ops` does not exist.
- Data, backup, report and log folders do not exist.
- The server `.env` does not exist on the Pi.
- No Sentinel API service is installed or running.
- Port `4317` is closed, which is expected before service installation.
- No systemd Sentinel service has been installed.
- No cadence timers have been installed.

## 3. Node and npm Installation Approach

Node and npm should be installed only during an approved preparation task, not during discovery.

Recommended target:

- Use Node.js `22` LTS as the safer first Raspberry Pi target unless local validation proves the project is ready for Node.js `24` LTS.
- Node.js `24` LTS remains the preferred future target after dependency and build validation.
- Do not target Node.js `20`, because its maintenance window ended in 2026 according to the official Node.js release schedule.

Recommended installation approach for Debian Bookworm `aarch64`:

1. Confirm the current official Node.js LTS status before installation.
2. Use either the official Node.js Linux binary route or NodeSource LTS packages for Debian Bookworm `aarch64`.
3. Pin the chosen major version in the deployment notes, for example `nodejs 22.x` for the first install or `nodejs 24.x` after validation.
4. Verify after installation with:

```bash
node -v
npm -v
```

References for the future install decision:

- Node.js release schedule: `https://github.com/nodejs/Release`
- Node.js releases overview: `https://nodejs.org/en/about/previous-releases`

No Node/npm installation has been performed yet.

## 4. Directory Plan

Target layout:

```text
/srv/matthew-platform/
  apps/
    seo-ops/
  data/
    seo-ops/
      backups/
      reports/
  logs/
    seo-ops/
```

Purpose:

- `/srv/matthew-platform/apps/seo-ops`: Git checkout for the Sentinel application.
- `/srv/matthew-platform/data/seo-ops`: runtime SQLite state and generated operational data.
- `/srv/matthew-platform/data/seo-ops/backups`: backup artefacts, outside Git.
- `/srv/matthew-platform/data/seo-ops/reports`: generated reports, outside public web roots.
- `/srv/matthew-platform/logs/seo-ops`: service logs if journald is not enough.

Do not create these folders until a separate preparation task is approved.

## 5. Service User Assumptions

Initial assumption:

- Use the current SSH user `matthew` for first controlled preparation and smoke testing.

Future hardening option:

- Create a dedicated `sentinel` service user after the initial path and permissions model is proven.
- If a dedicated user is added later, it should own only the application, data and log paths it needs.
- Do not run the API as `root` unless a future task explicitly justifies it.

## 6. Runtime Environment Plan

The Pi should use a server-local `.env` outside Git.

Planned path:

```text
/srv/matthew-platform/apps/seo-ops/.env
```

Required runtime values:

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
```

Rules:

- Do not commit the Pi `.env`.
- Do not store secrets in the repo.
- Bind the Sentinel API to `127.0.0.1` only.
- Keep backups under `/srv/matthew-platform/data/seo-ops/backups`.
- Keep generated operational reports outside public web roots.

## 7. Deployment Sequence Proposal

This is a proposed sequence only. Do not run it until deployment preparation is explicitly approved.

Before running anything on the Pi, generate the exact dry-run command plan:

```bash
npm run platform:pi:install:preflight
npm run platform:pi:install:dry-run
npm run platform:pi:install:prep
```

The preflight writes `reports/sentinel-pi-install-preflight.md` and `.json`, both ignored. It uses read-only non-interactive SSH checks and a local port probe. It does not install packages, create directories, clone repositories, copy files, start services or expose the API.

`READY_WITH_WARNINGS` is acceptable before the first install preparation if the warnings are expected install targets, such as missing Node/npm, missing `/srv/matthew-platform` or closed API port `4317`.

The dry-run writes `reports/sentinel-pi-install-dry-run.md` and `.json`, both ignored. It does not SSH, install packages, create directories, clone repositories, copy files, start services or expose the API.

`platform:pi:install:prep` is also dry-run by default. It can perform the first controlled mutation only when `--confirm` is explicitly provided. Confirmed mode is limited to installing Node/npm and creating the Sentinel directory structure. It must not clone the app, start the API, install systemd services, enable timers or expose anything publicly.

Confirmed prep command, only after explicit approval:

```bash
npm run platform:pi:install:prep -- --confirm --node-version 22
```

1. Confirm SSH key-based access still works:

```bash
ssh -o BatchMode=yes -o PasswordAuthentication=no matthew@192.168.4.22 hostname
```

2. Install Node.js and npm using the approved Node LTS approach.
3. Create the `/srv/matthew-platform` directory layout.
4. Clone or pull the repo into `/srv/matthew-platform/apps/seo-ops`.
5. Create the Pi `.env` outside Git.
6. Install dependencies:

```bash
npm ci
```

7. Build the app:

```bash
npm run build
```

8. Initialise platform persistence:

```bash
npm run platform:init
```

9. Run health checks:

```bash
npm run platform:health
npm run backup:verify
npm run backup:restore:test
npm run seo:monitor
```

10. Smoke test the local API in foreground only:

```bash
npm run platform:api:serve
npm run platform:api:smoke
```

11. Install the systemd service only after the foreground smoke test passes.
12. Enable cadence timers only in a later task after the API service is stable and backups are verified.

## 8. Rollback and Safety Plan

Before any real preparation work:

- Confirm Git status is clean locally.
- Confirm the Pi has enough disk space.
- Confirm no public reverse proxy points at Sentinel.
- Confirm backups are outside Git and outside public web roots.
- Capture the exact commands before running them.

Rollback principles:

- Stop before modifying system services if smoke tests fail.
- If dependency installation fails, do not proceed to service setup.
- If `platform:health` fails, do not install systemd service files.
- If the API smoke test fails, keep the API foreground-only and do not enable it.
- If permissions are wrong, fix ownership deliberately rather than widening permissions globally.

## 9. What Not To Do Yet

Do not do these in the preparation phase:

- Do not expose the Sentinel API publicly.
- Do not add a reverse proxy for Sentinel yet.
- Do not enable cadence timers yet.
- Do not migrate production routes yet.
- Do not put credentials in Git.
- Do not commit `.env` files.
- Do not copy `platform.db` into the repo.
- Do not run deploy commands from the dashboard.
- Do not make `/seo-roadmap` publicly accessible.
- Do not run destructive cleanup or restore commands on the Pi.

## 10. Next Review Point

The next safe step is to review and approve a preparation-only work package for:

- Node/npm installation,
- directory creation,
- repo checkout,
- environment file creation,
- local-only API smoke testing.

That task should still avoid public exposure and should stop before enabling systemd if any validation step fails.
