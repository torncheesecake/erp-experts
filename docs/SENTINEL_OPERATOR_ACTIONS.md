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
- returns structured JSON
- logs action starts and finishes to the API console

Action execution summaries are appended to the existing SQLite `runs` table as `ui_action:<actionId>` where possible. DB logging failures should warn only and must not make the action endpoint unsafe.

## Dashboard behaviour

The private `/seo-roadmap` Control Centre shows Run buttons only for allowlisted actions. Output is shown as a compact preview. There is no free-text terminal input and no arbitrary command runner.

The stakeholder-safe `/seo-progress` route must never expose operator actions, command execution, diagnostics or private Sentinel state.

## Future direction

A fuller operator console should wait until Sentinel has:

- authentication
- operator roles
- audit logs
- command approval policy
- tighter process isolation
- server-side action history

Until then, browser-triggered execution remains deliberately narrow and allowlisted.
