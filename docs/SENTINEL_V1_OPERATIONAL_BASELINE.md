# Sentinel v1 Operational Baseline

Checked: 18 May 2026

This checkpoint records the first stable Sentinel operating baseline after the Raspberry Pi node, canonical runtime database, backup workflow and restore simulation were verified.

## Architecture Summary

Sentinel now has three separated operating surfaces:

- Local development workspace: source code, local validation, dashboard development and operator tooling.
- Raspberry Pi Sentinel node: Matthew-controlled private runtime for the Sentinel API and persistent operational state.
- ERP Experts public website: stakeholder-safe content and progress pages only.

The current model keeps application code under Git and persistent operational state outside the repo on the Pi. The Pi API remains bound to localhost only and is not exposed through a reverse proxy.

The planned next ownership boundary is a standalone Sentinel operator frontend at `sentinel.artifexa.co.uk`. A local prototype route now exists at `/sentinel`; it uses Artifexa/Sentinel branding, keeps ERP Experts as tenant context only, removes ERP Experts public website chrome from the operator experience and opens with Content Workbench as the primary work surface. The migration plan is documented in `docs/SENTINEL_STANDALONE_APP_MIGRATION_PLAN.md`.

The current standalone UX direction is workflow-first rather than infrastructure-first. `/sentinel` uses a unified dark-first operational workspace, compact status rail, slimmer navigation and a more prominent Content Workbench. A code-native Sentinel mark anchors the product identity. The top frame is now a compact work-next strip, while the Workbench provides dark editorial lanes, focused work cards and a working panel for the selected item. Existing orchestration, pipelines, governance, activity, authority, workspaces and diagnostics remain available as supporting systems.

## Local Platform State

Local Sentinel remains healthy for the ERP Experts tenant:

- Tenant: `erp-experts`
- SEO monitor: `HEALTHY`
- QA: `pass=27`, `needs_review=0`, `blocked=0`
- Local build: expected to pass with committed stakeholder-safe fallback data
- Operator dashboard: developed at `/seo-roadmap`
- Stakeholder page: `/seo-progress`

Local generated reports, SQLite files, browser state and operational artefacts remain ignored and should not be committed.

## Raspberry Pi Node State

Current Pi node baseline:

- Host: `192.168.4.22`
- Hostname: `raspberrypi`
- Runtime root: `/srv/sentinel`
- App path: `/srv/sentinel/apps/seo-ops`
- Service: `sentinel-api.service`
- Service state: installed, enabled and active
- API bind: `127.0.0.1:4317`
- Public API exposure: none
- Reverse proxy: not configured
- Cadence timers: not enabled

The repo checkout on the Pi is expected to remain clean before deployment or service work.

## Canonical Runtime Paths

The canonical Pi runtime paths are:

```text
/srv/sentinel/apps/seo-ops
/srv/sentinel/data/seo-ops/platform.db
/srv/sentinel/data/seo-ops/reports
/srv/sentinel/data/seo-ops/backups
/srv/sentinel/logs/seo-ops
```

The repo-local database remains intentionally present as a fallback only:

```text
/srv/sentinel/apps/seo-ops/platform/persistence/platform.db
```

Verifiers should report:

```text
Active DB: canonical
Repo-local DB: present as fallback
```

The repo-local DB should not be deleted until a later rollback policy is explicitly approved.

## DB, Backup And Restore Status

Current canonical DB state:

- Active DB: `/srv/sentinel/data/seo-ops/platform.db`
- Backup path: `/srv/sentinel/data/seo-ops/backups`
- First canonical backup: `platform.db.backup-20260518-104625`
- Backup integrity: `ok`
- Restore simulation: passed
- Restore simulation mode: latest backup copied to a temporary restore-test DB, integrity checked, expected tables checked, temporary DB removed
- Live DB safety: live canonical DB was not overwritten

The restore simulation confirms recovery confidence without performing a destructive restore.

## API And Service Status

The Pi service baseline is:

- `sentinel-api.service` enabled at boot
- `sentinel-api.service` active
- `ExecStart` uses `/usr/local/bin/npm run platform:api:serve`
- Working directory: `/srv/sentinel/apps/seo-ops`
- Environment file: `/srv/sentinel/apps/seo-ops/.env`
- API listens only on `127.0.0.1:4317`
- `/health` returns `ok`
- `/tenant` returns ERP Experts
- `/state` returns JSON

The API must stay localhost-only until remote authority enforcement and transport hardening are explicitly enabled.

## Stakeholder And Operator Routes

Current route separation:

- `/seo-progress`: stakeholder-safe progress page, live and plain-English
- `/reports`: points stakeholders to `/seo-progress`
- `/seo-roadmap`: private operator route, protected in production
- `/sentinel`: local standalone operator shell prototype, protected in production, defaulting to Content Workbench
- `sentinel.artifexa.co.uk`: planned standalone operator app, not deployed yet

The stakeholder page must not expose Sentinel internals, operator controls, commands, diagnostics, API details, database details, approvals, pipelines or implementation roadmap content.

The `/sentinel` prototype keeps its local browser session preferences under `sentinel.operatorSession.standalone.v1` so its Content Workbench-first default does not change `/seo-roadmap` behaviour.

The `/sentinel` visual hierarchy now prioritises content operations:

- Compact operational rail for health, authority, runtime and cadence.
- Content Workbench-first navigation order.
- Full-width fluid shell with a slim left rail, expanding article queue and docked selected item detail.
- Workflow actions on cards and selected-item panels so operators choose the next task before thinking about commands.
- Artefact cards for Research, Brief, Package, Review and Monitoring, so actions create visible review surfaces rather than exposing implementation detail.
- Raw commands, status overrides and brief prompts remain available behind collapsed manual controls or advanced detail.
- Workspace and help controls placed after the active work surface so they do not compete with the editorial queue.
- Infrastructure sections remain accessible but visually secondary.

Workflow action history is local browser state under `sentinel.workflowActions.v1`. It records selected content item actions, status transitions, generated artefact context and safe execution outcomes without storing secrets or raw command output.

Content artefacts are local browser state under `sentinel.contentArtefacts.v1`. They store private operator research, brief, draft package, review and monitoring documents created from Workbench item context. They are shown in the standalone `/sentinel` centre document workspace and are not exposed on `/seo-progress`.

Review notes are local browser state under `sentinel.reviewNotes.v1`. They capture operator comments, concerns, questions and draft reminders against the selected artefact. They are private review context and do not publish content.

Local Pi-backed `/sentinel` testing is documented in `docs/SENTINEL_LOCAL_OPERATOR_LAUNCH.md`. It uses an SSH tunnel to reach the Pi API through local `127.0.0.1:4317`, then launches Vite with `VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317`. `npm run sentinel:launch -- --tunnel` can start the tunnel in the foreground when explicitly requested. This does not expose the Pi API publicly.

## Security And Auth Status

Current auth/security baseline:

- Remote authority gate scaffold exists
- `SENTINEL_AUTHORITY_MODE` remains disabled
- No operator token is committed
- No public API exposure exists
- No reverse proxy is configured for the API
- No user login flow exists yet
- No cadence timers are enabled

The only expected verifier warning at this baseline is remote auth enforcement pending. That warning is acceptable while the API remains localhost-only.

## Known Warnings

Expected warning:

- Remote auth enforcement is not implemented yet. Keep the API localhost-only and do not add a reverse proxy until auth exists.

Warnings that should not appear in this baseline:

- Repo-local DB treated as active state
- Canonical DB missing
- Runtime paths not ready
- API bound to `0.0.0.0`
- Sentinel timers enabled unexpectedly
- Backup integrity failure
- Restore-test temp DB retained unexpectedly

## Intentionally Disabled

These are intentionally disabled or not yet implemented:

- Public Sentinel API exposure
- Reverse proxy for the Sentinel API
- Remote authority enforcement
- Login and user accounts
- Tenant switching
- Cadence timers
- Deployment automation from the UI
- Arbitrary shell execution
- Destructive restore workflows
- Cleanup automation on the Pi

## Next Phase Recommendations

Recommended next phases, in order:

1. Keep collecting operational evidence from the Pi node with the current localhost-only service.
2. Add remote authority enforcement and token handling before any public transport is considered.
3. Turn the local `/sentinel` prototype into a same-repo, separate-build Sentinel operator frontend for `sentinel.artifexa.co.uk`, without deploying it publicly yet.
4. Add a controlled service restart/deploy policy for Pi updates, still without exposing the API.
5. Define backup retention and restore runbook policy before enabling timers.
6. Consider cadence timers only after auth, backup retention and restore runbooks are reviewed.

Do not expose the Pi API publicly or enable timers until remote authority, backup policy and service rollback procedures are in place.

## Draft Workspace Layer

Sentinel now includes a browser-local Draft Workspace inside `/sentinel`.

The `Create draft` action creates editable draft artefacts from brief context. Operators can edit draft title, intro, sections, CTA and notes, preview the article-like reading flow, and set draft review status.

This layer is private local operator state. It does not publish content, write article files, expose drafts on `/seo-progress`, change SEO scoring or alter the Pi API exposure model.

## Standalone Application Shell

`/sentinel` now has a dedicated application-shell treatment documented in `docs/SENTINEL_APPLICATION_SHELL_REFACTOR.md`.

The shell removes ERP Experts marketing chrome from the standalone operator route, keeps Sentinel as the host product identity, presents ERP Experts only as tenant context and uses a fluid app workspace rather than a centred website page container.

`/seo-roadmap` remains a legacy embedded compatibility route. `/seo-progress` remains the stakeholder-safe ERP Experts route.
