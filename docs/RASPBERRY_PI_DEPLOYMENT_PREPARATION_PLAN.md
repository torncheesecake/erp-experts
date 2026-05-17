# Raspberry Pi Deployment Preparation Plan

This is a planning document for preparing Matthew's Raspberry Pi to run Sentinel later. It is based on read-only discovery from `192.168.4.22` and does not approve deployment.

The first privileged preparation step has now been completed manually: Node/npm are installed and the canonical Sentinel directory tree exists under `/srv/sentinel`. No repo clone, service installation, service start or API exposure has been approved here.

## Naming Migration Note

Earlier planning used `/srv/matthew-platform` as an internal namespace. Sentinel is now the canonical Raspberry Pi deployment and runtime name. New scripts, templates and docs should use `/srv/sentinel`.

## 1. Current Pi Inventory

Latest confirmed runtime model:

- Host: `192.168.4.22`
- Hostname: `raspberrypi`
- Reverse DNS from scan: `pi.hole`
- OS/kernel: Debian Bookworm on `aarch64`, kernel `6.12.34+rpt-rpi-v8`
- Git: `2.39.5`
- systemd: available, `252`
- Disk: `29G` total, `18G` used, `11G` available, `62%` used on `/`
- Memory: `7.8Gi` total, `7.2Gi` available
- `/srv`: exists and is owned by `root:root`
- `/srv/sentinel`: present
- `/srv/sentinel/apps/seo-ops`: present, repo not cloned yet
- `/srv/sentinel/data/seo-ops/backups`: present
- `/srv/sentinel/data/seo-ops/reports`: present
- `/srv/sentinel/logs/seo-ops`: present
- Node.js: installed, verify exact version with `npm run platform:pi:post-prep:verify`
- npm: installed, verify exact version with `npm run platform:pi:post-prep:verify`
- Sentinel API port `4317`: closed

## 2. Remaining Readiness Blockers

The Pi is reachable and suitable for the next controlled repo deployment planning step, but it is not ready to run Sentinel as a managed service yet.

Remaining blockers:

- The repo has not been cloned to `/srv/sentinel/apps/seo-ops`.
- The server `.env` does not exist on the Pi.
- No Sentinel API service is installed or running.
- Port `4317` is closed, which is expected before service installation.
- No systemd Sentinel service has been installed.
- No cadence timers have been installed.

## 3. Node and npm Installation Approach

Node and npm were installed manually after non-interactive sudo stopped safely. Keep future Node changes explicit and reviewed.

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

No automatic Node/npm installation should be attempted unless a future task explicitly approves it.

## 4. Directory Plan

Target layout:

```text
/srv/sentinel/
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

- `/srv/sentinel/apps/seo-ops`: Git checkout for the Sentinel application.
- `/srv/sentinel/data/seo-ops`: runtime SQLite state and generated operational data.
- `/srv/sentinel/data/seo-ops/backups`: backup artefacts, outside Git.
- `/srv/sentinel/data/seo-ops/reports`: generated reports, outside public web roots.
- `/srv/sentinel/logs/seo-ops`: service logs if journald is not enough.

These folders are now the canonical runtime scaffold. Do not rename them back to the earlier internal namespace.

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
/srv/sentinel/apps/seo-ops/.env
```

Required runtime values:

```text
NODE_ENV=production
PLATFORM_TENANT=erp-experts
PLATFORM_DB_PATH=/srv/sentinel/data/seo-ops/platform.db
PLATFORM_REPORTS_PATH=/srv/sentinel/data/seo-ops/reports
PLATFORM_BACKUP_PATH=/srv/sentinel/data/seo-ops/backups
PLATFORM_LOG_PATH=/srv/sentinel/logs/seo-ops
SENTINEL_API_HOST=127.0.0.1
SENTINEL_API_PORT=4317
SENTINEL_REMOTE_AUTH_MODE=disabled
```

Rules:

- Do not commit the Pi `.env`.
- Do not store secrets in the repo.
- Bind the Sentinel API to `127.0.0.1` only.
- Keep backups under `/srv/sentinel/data/seo-ops/backups`.
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

`READY_WITH_WARNINGS` is acceptable before the first install preparation if the warnings are expected install targets, such as missing Node/npm, missing `/srv/sentinel` or closed API port `4317`.

The dry-run writes `reports/sentinel-pi-install-dry-run.md` and `.json`, both ignored. It does not SSH, install packages, create directories, clone repositories, copy files, start services or expose the API.

`platform:pi:install:prep` is also dry-run by default. It can perform the first controlled mutation only when `--confirm` is explicitly provided. Confirmed mode is limited to installing Node/npm and creating the Sentinel directory structure. It must not clone the app, start the API, install systemd services, enable timers or expose anything publicly.

Confirmed prep command, only after explicit approval:

```bash
npm run platform:pi:install:prep -- --confirm --node-version 22
```

The first confirmed attempt stopped safely because the Pi requires an interactive sudo password:

```text
sudo: a terminal is required to read the password
sudo: a password is required
```

Use the manual privileged setup guide instead of storing sudo credentials or enabling broad passwordless sudo:

```text
docs/RASPBERRY_PI_INTERACTIVE_SETUP.md
```

After the manual setup, verify the runtime and directory structure from the local repo:

```bash
npm run platform:pi:post-prep:verify
```

The verifier is read-only. It checks Node, npm, `/srv/sentinel`, required child directories, ownership metadata and permission bits. It does not install packages, create directories, clone the repo, write test files, start services or use sudo.

## 7.1 Repo Deployment Planning Gate

The first repo deployment step is now planned separately from runtime preparation:

```bash
npm run platform:pi:repo:plan
npm run platform:pi:repo:deploy
```

`platform:pi:repo:plan` is read-only. It reads the local Git origin, branch and latest commit, checks tracked worktree cleanliness, inspects `/srv/sentinel/apps/seo-ops` over read-only SSH and writes ignored planning reports. It chooses one of three strategies:

- clone if the app path is missing or empty
- pull with fast-forward only if the app path is already a Git repo
- refuse if the app path is non-empty and not a Git repo

`platform:pi:repo:deploy` is mutation-capable only when `--confirm` is supplied. Without `--confirm`, it refuses to deploy and writes an ignored dry-run report. Confirmed mode is limited to clone or pull, `npm ci`, `npm run build`, `npm run platform:init` and `npm run platform:health`.

It must not start the API, install systemd services, enable cadence timers, expose reverse proxies or commit `.env`.

Confirm the Pi can read the configured Git remote before any confirmed clone or pull. If the repo requires authentication, configure that outside this repository.

Important persistence caveat: the current `platform:init` script initialises the repo-local SQLite default unless persistence path support is extended. Before treating the Pi as canonical state, confirm whether the server DB should live under `/srv/sentinel/data/seo-ops/platform.db` and update runtime configuration accordingly.

## 7.2 React 19 Dependency Resolution

The first confirmed repo deployment cloned the repo successfully, then stopped at `npm ci`. The blocker was `react-helmet-async@2.0.5`, whose peer dependency allows React `^16`, `^17` or `^18`, while this project uses React `19.2.x`.

The chosen resolution is to remove `react-helmet-async` from the main app and use React 19's native document metadata support through the existing `SEO` component. The component still manages runtime metadata and JSON-LD without changing SEO scoring or article content.

This is safer than adding `--legacy-peer-deps` to the Pi deploy path because the server install should remain a normal `npm ci` using the committed lockfile. `--legacy-peer-deps` should remain an emergency compatibility escape hatch only, not the default deployment policy.

## 7.3 Stakeholder Progress Build Safety

The next Pi-side build failure came from `/seo-progress` importing ignored generated report JSON files directly from `reports/`. Those files exist locally during operation but are not committed, so they are absent from a clean Raspberry Pi Git checkout.

The stakeholder progress page now uses committed fallback data in `src/data/seoProgressSnapshot.js`. This keeps the page business-facing and build-safe while avoiding commands, diagnostics, API details, database internals and operator-only state. Generated reports may be layered in later as optional runtime enhancement, but they are no longer required for `npm run build`.

## 7.4 Repo Deployment Verification

Runtime preparation and repo deployment are now verified separately:

```bash
npm run platform:pi:post-prep:verify
npm run platform:pi:repo:verify
```

`platform:pi:post-prep:verify` checks the base runtime and `/srv/sentinel` directory structure. It can warn that a repo exists because repo deployment is outside its scope.

`platform:pi:repo:verify` checks the deployed application state under `/srv/sentinel/apps/seo-ops`: Git checkout, clean branch, package files, `node_modules`, `dist`, repo-local platform DB and required npm scripts. API port `4317` and `sentinel-api.service` are warnings at this stage, not blockers. The next phase after a passing repo verification is foreground API smoke testing.

Run the foreground Pi API smoke only after repo verification:

```bash
npm run platform:pi:api:smoke
```

The smoke command starts the API over SSH in a temporary session bound to `127.0.0.1:4317`, calls `/health`, `/state` and `/tenant` from the Pi itself, stops only the process it started and verifies the port closes afterwards. It writes ignored smoke reports and does not install a service, enable timers, add a reverse proxy or expose the API publicly.

Plan service installation only after the foreground smoke passes:

```bash
npm run platform:pi:service:plan
```

The service planner is read-only. It checks the deployed app, the `platform:api:serve` script, systemd availability, current service state, the passing smoke report and the local systemd template. The Pi currently resolves npm at `/usr/local/bin/npm`, so the template and plan use that absolute path. The planner prints the future `sudo systemctl` sequence but does not copy files, reload systemd, start the API or expose it publicly.

After service installation, verify service health with:

```bash
npm run platform:pi:service:verify
```

This is the post-service gate. It checks installed systemd state, localhost-only binding, API endpoint health, Git cleanliness and that no Sentinel cadence timers are enabled. It is separate from `platform:pi:repo:verify`, which only checks the deployed checkout and build artefacts.

## 7.5 Canonical Pi Data Path Planning

The active service still uses the repo-local SQLite DB:

```text
/srv/sentinel/apps/seo-ops/platform/persistence/platform.db
```

The intended canonical runtime DB path is:

```text
/srv/sentinel/data/seo-ops/platform.db
```

The full migration plan is documented in `docs/SENTINEL_PI_DATA_PATH_PLAN.md`. Generate the read-only migration dry-run with:

```bash
npm run platform:pi:data:path:plan
```

The command verifies the source DB, canonical data directories, canonical DB presence, service `.env` values and whether code currently honours `PLATFORM_DB_PATH`. It does not stop the service, copy the DB, edit `.env`, restart systemd or expose the API. The future migration sequence must keep the repo-local DB as a rollback copy until canonical DB health and backup verification pass.

1. Confirm SSH key-based access still works:

```bash
ssh -o BatchMode=yes -o PasswordAuthentication=no matthew@192.168.4.22 hostname
```

2. Install Node.js and npm using the approved Node LTS approach.
3. Create the `/srv/sentinel` directory layout.
4. Clone or pull the repo into `/srv/sentinel/apps/seo-ops`.
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

10. Smoke test the Pi API in foreground only:

```bash
npm run platform:pi:api:smoke
```

11. Generate the service install plan:

```bash
npm run platform:pi:service:plan
```

12. Install the systemd service only after the foreground smoke test and service plan pass, in a separate explicitly approved task.
13. Verify the installed service:

```bash
npm run platform:pi:service:verify
```

14. Enable cadence timers only in a later task after the API service is stable, remote auth is planned and backups are verified.

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

## Runtime Path Configuration Support

Sentinel now has code-level support for these Pi runtime variables:

```bash
PLATFORM_DB_PATH=/srv/sentinel/data/seo-ops/platform.db
PLATFORM_REPORT_OUTPUT_PATH=/srv/sentinel/data/seo-ops/reports
PLATFORM_BACKUP_PATH=/srv/sentinel/data/seo-ops/backups
PLATFORM_LOG_PATH=/srv/sentinel/logs/seo-ops
```

The current Pi service still uses the repo-local DB until a separate approved migration copies the DB and updates the Pi `.env`. Before that migration, run `npm run platform:runtime:paths` locally and with the intended Pi environment values to confirm the resolved paths.
