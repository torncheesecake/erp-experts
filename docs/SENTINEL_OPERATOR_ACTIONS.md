# Sentinel Operator Actions

Sentinel operator actions are the first controlled execution layer for the private Control Centre.

They are not a browser terminal and they are not arbitrary shell access.

## Current model

The action registry lives at:

```text
platform/actions/actions.json
```

Only actions in that file can be requested through the local API. Each action has:

- `id`
- `label`
- `command`
- `category`
- `riskLevel`
- `executionMode`
- `description`
- `allowFromUI`
- `timeoutSeconds`

The local API endpoint is:

```text
POST /action
```

The request body must provide a known action ID, for example:

```json
{
  "actionId": "platform:doctor"
}
```

Recent controlled action history is available through:

```text
GET /actions/history
```

The endpoint reads the persisted `runs` table and returns the latest `ui_action:*` rows. It is local-only, read-only and supports a bounded `?limit=20` style query.

Each new action also stores a concise result row in `action_results`:

- `run_id`
- `tenant_id`
- `action_id`
- `status`
- `summary`
- `output_excerpt`
- `created_at`

The summary is intended to answer "what happened?" without exposing a full terminal log. The excerpt is capped and redacted before storage.

## Allowed actions

The initial allowlist intentionally contains low-risk local actions only:

- `platform:start`
- `platform:doctor`
- `platform:state`
- `platform:daily`
- `platform:stakeholder`
- `platform:health`
- `platform:status`
- `platform:api`
- `seo:monitor`

These commands may read state, run health checks or generate ignored local reports. They do not deploy, publish, restore, clean up, upload, send notifications or edit article content.

## Explicitly excluded

The UI action layer must not include:

- deploy commands
- FTP commands
- cleanup commands
- restore commands beyond safe manual terminal use
- service installation commands
- arbitrary command strings
- user-supplied arguments
- command chaining
- shell execution

## API safety controls

The API action endpoint:

- is intended for localhost only
- rejects non-local requests
- rejects unknown action IDs
- rejects actions where `allowFromUI=false`
- runs fixed `npm run <script>` commands only
- uses `spawn` without `shell=true`
- applies per-action timeouts
- limits captured output
- redacts obvious password, token, secret and API key patterns before storing result excerpts
- returns structured JSON
- logs action starts and finishes to the API console

Action executions are appended to the existing SQLite `runs` table as `ui_action:<actionId>` where possible. Concise result summaries are stored in `action_results`. DB logging failures should warn only and must not make the action endpoint unsafe.

The history endpoint returns those rows back to the private dashboard so Matthew can see what ran, when it ran, whether it succeeded and a short result summary. It does not expose deployment, cleanup, restore or arbitrary shell history because those actions are not in the UI allowlist.

## Dashboard behaviour

The private `/seo-roadmap` Control Centre shows Run buttons only for allowlisted actions. Output is shown as a compact preview, and the Recent Operator Actions panel shows the latest logged UI actions with summaries when the local Sentinel API is running. Output excerpts are collapsed by default. There is no free-text terminal input and no arbitrary command runner.

The stakeholder-safe `/seo-progress` route must never expose operator actions, command execution, diagnostics or private Sentinel state.

## Future direction

A fuller operator console should wait until Sentinel has:

- authentication
- operator roles
- audit logs
- command approval policy
- tighter process isolation

Until then, browser-triggered execution remains deliberately narrow and allowlisted.
