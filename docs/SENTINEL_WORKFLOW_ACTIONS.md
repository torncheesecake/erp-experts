# Sentinel Workflow Actions

Sentinel workflow actions are the task-oriented layer above the existing command and pipeline systems.

The operator should normally choose what they want to do next, such as start research, generate a brief, prepare a work package, move to review or refresh monitoring. Sentinel then maps that intent to a safe behaviour:

- local lifecycle transition
- local artefact creation
- existing allowlisted action execution

This does not add arbitrary shell access and does not publish content.

## Purpose

The Content Workbench should answer:

What should I do next for this content item?

It should not require the operator to start by asking:

Which command should I run?

Commands still exist for support, diagnostics and controlled power use, but the primary UX is now workflow-first and artefact-first.

If an action cannot produce a contextual output, it should fail clearly or show a collapsed advanced fallback. It should not expose a bare command with missing context.

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
- expected result
- suggested next action
- produced artefacts
- recovery note

## Execution Modes

`local_transition`

Updates browser-local content workflow status. It does not edit article files, publish content or run a command.

`local_artifact`

Creates a visible Workbench artefact from existing item context and records the result in local workflow history. Research, brief, package, review and monitoring artefacts now have browser-local document bodies under `sentinel.contentArtefacts.v1`.

`allowlisted_action`

Runs an existing action from `platform/actions/actions.json` through the Sentinel API. Authority checks still apply, and the API remains the only execution path.

Manual command fallbacks are treated as advanced implementation detail. They are only shown when contextual and complete, and they are not the primary operator output.

## Current Actions

The first action registry covers:

- Review opportunity
- Move to planning
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

- guided next-step recommendation
- artefact views for Research, Brief, Package, Review and Monitoring
- a focused central artefact document panel in the standalone shell
- primary workflow actions
- secondary support actions
- collapsed advanced manual controls
- local workflow action history

The article cards also surface the next workflow action directly, so operators can progress items without opening the raw command console.

## Action Outputs

Every workflow action now produces a visible result record for the selected item.

The result includes:

- action label
- content item title
- previous status
- new status when changed
- result state: success, warning, failed or manual step
- result summary
- produced artefacts where known
- suggested next action
- timestamp

The selected item detail panel shows the latest output immediately after the action runs. Local transitions show the status change and browser-local workflow state. Local artefact actions show what was created and where to review it. Allowlisted actions show the API execution summary and keep detailed output collapsed.

If a terminal fallback is unavoidable, Sentinel keeps it behind collapsed advanced detail and explains why it is not the primary workflow surface.

The Workbench also shows the latest five workflow outputs so the operator can see what just moved, what failed and what to do next.

## Artefact Model

The first visible artefacts are:

- Research: opportunity rationale, search intent, signals and suggested angle.
- Brief: content goal, intent, suggested structure, headings and CTA guidance.
- Package: scope, task list, dependencies, constraints and review checklist.
- Review: editorial judgement, QA context and readiness decision.
- Monitoring: post-publication health and follow-up monitoring guidance.

These artefacts are intentionally lightweight. Workbench-created artefacts now persist locally in the browser under `sentinel.contentArtefacts.v1`; allowlisted report outputs still point to their existing generated files. Future versions can promote stable artefacts into SQLite once the model has proved useful.

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

Content artefacts are also browser-local:

```text
sentinel.contentArtefacts.v1
```

They store the reviewable research, brief, draft package, review and monitoring bodies created from Workbench context. They do not store secrets or publish content.

## Future Work

Next safe improvements:

- promote proven artefacts into SQLite only after review
- add editable review notes and approvals to item-scoped artefacts
- add richer item notes if workflow friction appears in daily use
- connect Workbench actions to future authenticated Sentinel API mutations
- keep publishing and deploy flows approval-gated
