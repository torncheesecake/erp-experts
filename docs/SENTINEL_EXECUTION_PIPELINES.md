# Sentinel Execution Pipelines

Sentinel execution pipelines are controlled, multi-step operator workflows for the private `/seo-roadmap` Control Centre.

They are not shell scripts. They are not editable browser commands.

## Purpose

Pipelines let Matthew run common safe workflows without manually clicking or copying each individual command.

Initial pipelines:

- Daily Operator Startup
- Health Audit
- Roadmap Review
- Stakeholder Update

## Registry

Pipeline metadata lives in:

```text
platform/pipelines/pipelines.json
```

Each pipeline contains:

- `id`
- `label`
- `description`
- `category`
- `riskLevel`
- `allowFromUI`
- `estimatedDuration`
- `notes`
- `steps[]`

Each step references an existing action ID from `platform/actions/actions.json`.

## Safety Boundary

Pipelines can only run registered actions where `allowFromUI` is `true`.

The API rejects:

- unknown pipelines
- pipelines not marked `allowFromUI`
- unknown action IDs
- actions not marked `allowFromUI`
- arbitrary step definitions
- custom arguments from the browser
- deploy, cleanup, restore, FTP or service-management actions

Execution remains fixed and local:

- no arbitrary shell input
- no command chaining
- no browser-side script editing
- no public exposure
- no external notification sending

Fixed action commands may include fixed registry-defined arguments, for example the stakeholder notification payload action. Operators cannot edit those arguments from the UI.

## API Flow

The local API exposes:

```text
GET /pipelines
POST /pipeline/run
GET /pipeline/execution/<executionId>
```

`POST /pipeline/run` accepts only a registered `pipelineId`. It creates an in-memory execution record and returns an execution ID.

`GET /pipeline/execution/<executionId>` returns:

- execution status
- started and finished timestamps
- duration
- completed step count
- failed step if present
- per-step status and summaries

There is no streaming yet.

## Execution Model

Pipelines execute sequentially.

Default behaviour:

- step 1 starts
- Sentinel waits for completion
- step 2 starts only if step 1 succeeds
- the pipeline stops on the first failed step
- timeout protection comes from the underlying action registry

Completed pipeline runs are recorded in SQLite through the existing `runs` table as `ui_pipeline:<pipelineId>` where possible. DB write failures should warn only and must not convert safe execution into a broader shell surface.

## Control Centre

The private `/seo-roadmap` Control Centre shows an Execution Pipelines panel with:

- available pipelines
- step count
- estimated duration
- risk level
- Run button
- current step state
- latest pipeline history

The stakeholder-safe `/seo-progress` route must not expose pipelines, execution state or operator controls.

## Future Direction

Higher-risk pipelines should require explicit approval gates before execution. Deployment, cleanup, restore and service-management workflows should remain excluded until Sentinel has authentication, roles, audit logs and approval policy enforcement.
