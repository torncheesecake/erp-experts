# Sentinel Operator Console

The Sentinel Operator Console is the first controlled execution surface inside the private `/seo-roadmap` Control Centre.

It is not a browser terminal. It does not provide arbitrary shell access.

## Current Scope

The console can only run actions from `platform/actions/actions.json` where `allowFromUI` is `true`.

The API accepts fixed action IDs only:

- `platform:start`
- `platform:doctor`
- `platform:state`
- `platform:daily`
- `platform:stakeholder`
- `platform:health`
- `platform:status`
- `platform:api`
- `seo:monitor`

The action registry maps each ID to a fixed `npm run <script>` command. The browser never sends raw command text, custom arguments, command chains or shell snippets.

## API Flow

`POST /action` now creates an in-memory execution record and returns an execution ID immediately.

The execution lifecycle is:

- `queued`
- `running`
- `success`
- `failed`
- `cancelled` as a UI placeholder for a future cancellation model

The local API exposes:

```text
POST /action
GET /actions/execution/<executionId>
GET /actions/history
```

`GET /actions/execution/<executionId>` returns the latest execution state, timestamps, `durationMs`, `durationLabel`, summary, stderr excerpt when available and a capped output excerpt. There is no streaming yet.

`GET /actions/history` returns the latest completed UI actions from SQLite with the same duration fields where timestamps are available. The dashboard uses this as the console history source when the local API is running.

## Safety Boundary

The implementation uses `child_process.spawn` with `shell: false`.

The console intentionally excludes:

- arbitrary shell input
- custom arguments
- command chaining
- deployment commands
- FTP commands
- cleanup commands
- restore commands
- backup mutation commands
- service installation commands
- public exposure

The API remains bound to localhost by default and has no authentication. Do not expose it publicly.

## Output Handling

Sentinel captures a capped stdout/stderr excerpt for operator visibility. It also redacts obvious password, token, secret and API key patterns before showing or storing summaries.

The Control Centre keeps output excerpts collapsed by default. The active execution view promotes the concise summary, status, started time, finished time and duration first. Failed actions show a clear failure state and suggest checking `platform:doctor` before deeper troubleshooting.

The local console history shows the last five executions with action label, status, duration, timestamp, summary and a collapsed output preview.

Long-running process state is not persisted yet. Completed controlled UI actions are still logged to SQLite as `ui_action:<id>` with concise action result summaries.

## Future Direction

Future expansion should add approval-gated execution before any higher-risk action class is exposed. Deploy, restore, cleanup and service-management commands should remain excluded until auth, role permissions, audit logging and explicit approval gates exist.
