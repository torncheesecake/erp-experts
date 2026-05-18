# Sentinel Workflow Actions

Sentinel workflow actions are the task-oriented layer above the existing command and pipeline systems.

The operator should normally choose what they want to do next, such as start research, generate a brief, move to review or refresh monitoring. Sentinel then maps that intent to one of three safe behaviours:

- local lifecycle transition
- copy-only manual guidance
- existing allowlisted action execution

This does not add arbitrary shell access and does not publish content.

## Purpose

The Content Workbench should answer:

What should I do next for this content item?

It should not require the operator to start by asking:

Which command should I run?

Commands still exist for support, diagnostics and controlled power use, but the primary UX is now workflow-first.

## Action Model

Workflow actions are defined in:

```text
platform/workflows/content-workflow-actions.json
```

Each action includes:

- `id`
- `label`
- `description`
- valid lifecycle statuses
- primary lifecycle statuses
- optional next lifecycle status
- execution mode
- safety label
- optional allowlisted action ID
- optional manual copy template or source
- expected result
- recovery note

## Execution Modes

`local_transition`

Updates browser-local content workflow status. It does not edit article files, publish content or run a command.

`manual_copy`

Copies an existing plan, brief or prompt command for manual review. This is used when the underlying workflow is not safe to run directly from the Workbench yet.

`allowlisted_action`

Runs an existing action from `platform/actions/actions.json` through the Sentinel API. Authority checks still apply, and the API remains the only execution path.

## Current Actions

The first action registry covers:

- Review opportunity
- Approve plan
- Start research
- Generate brief
- Prepare work package
- Move to review
- Mark ready
- Mark published
- Refresh monitoring
- Open diagnostics
- Generate roadmap update

Actions that imply editorial judgement, content generation or publishing remain manual or local-only.

## Workbench Behaviour

In `/sentinel` and `/seo-roadmap`, selected content items now show:

- primary workflow actions
- secondary support actions
- manual handoff actions
- collapsed advanced manual controls
- local workflow action history

The article cards also surface the next workflow action directly, so operators can progress items without opening the raw command console.

## Safety Boundaries

Workflow actions do not:

- add arbitrary shell execution
- allow custom command input
- publish content
- generate full articles automatically
- change SEO scoring
- expose operator controls on `/seo-progress`

Any executable action must already be present in the controlled action registry and must pass the existing authority gate.

## Persistence

Status changes continue to use browser-local Workbench state:

```text
sentinel.contentWorkbench.v1
```

Workflow action history is browser-local:

```text
sentinel.workflowActions.v1
```

This is intentionally lightweight. It records operator workflow decisions and execution outcomes without adding a new database dependency.

## Future Work

Next safe improvements:

- promote proven manual copy actions into allowlisted API actions only after review
- add richer item notes if workflow friction appears in daily use
- connect Workbench actions to future authenticated Sentinel API mutations
- keep publishing and deploy flows approval-gated
