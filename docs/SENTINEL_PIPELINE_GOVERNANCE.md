# Sentinel Pipeline Governance

Sentinel execution pipelines are governed operator workflows. They are registry-defined, allowlisted and local-only.

This layer adds approval and scheduling metadata so pipelines can evolve safely without becoming arbitrary browser scripting.

## Current Boundary

Pipelines are not editable from the browser.

Sentinel does not allow:

- arbitrary shell execution
- freeform command entry
- custom pipeline definitions from the UI
- custom browser-supplied arguments
- deployment, cleanup, restore, FTP or service-management workflows
- public exposure on `/seo-progress`

Every pipeline step must reference an existing action in `platform/actions/actions.json` where `allowFromUI` is true.

## Registry Metadata

Pipeline definitions live in:

```text
platform/pipelines/pipelines.json
```

Governance fields:

- `approvalMode`: `none`, `operator_required` or `review_required`
- `executionMode`: `manual`, `scheduled` or `hybrid`
- `scheduleMode`: `disabled`, `daily`, `weekly` or `custom_future`
- `requiresReview`: whether review is required before future scheduling or promotion
- `allowScheduling`: whether this workflow can be considered for a future scheduler
- `maxFrequency`: `once_per_day`, `once_per_hour` or `manual_only`
- `tags`: searchable governance and workflow labels
- `safetyNotes`: human-readable safety boundary for the operator

## Validation

Use the read-only validator before adding or changing pipelines:

```bash
npm run platform:pipeline:validate
npm run platform:pipeline:validate -- --json
```

The validator checks:

- pipeline IDs are unique
- referenced action IDs exist
- referenced actions are UI-allowlisted
- governance fields use approved values
- scheduling metadata is internally consistent
- dangerous action names or commands are not referenced

A failure means the pipeline registry should not be used until fixed.

## Scheduling Preview

Use the schedule preview to see what could be scheduled later:

```bash
npm run platform:pipeline:schedule
```

This command only prints a preview. It does not install cron jobs, systemd timers, background daemons or Raspberry Pi services.

Current intent:

- `daily-startup`: schedulable daily with operator approval metadata
- `health-audit`: schedulable daily with review required
- `stakeholder-update`: schedulable weekly with review required
- `roadmap-review`: manual only

## Control Centre

The private `/seo-roadmap` Control Centre shows governance metadata in the Execution Pipelines panel:

- approval mode
- execution mode
- schedule mode
- schedulable or manual-only badge
- review-required badge
- safety notes

There are no scheduling controls yet.

## Future Direction

Future expansion should add explicit approval records, audit logs and scheduler installation steps before any pipeline can run unattended.

Higher-risk workflows must remain excluded until Sentinel has authentication, tenant-scoped roles and approval policy enforcement.
