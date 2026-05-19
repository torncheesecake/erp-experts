# Sentinel Content Workbench

The Sentinel Content Workbench is the operator-facing content workflow layer inside `/sentinel` and `/seo-roadmap`. It shifts the Control Centre from infrastructure-first operation toward day-to-day editorial work.

## Purpose

The workbench answers the operator question:

```text
What content work should move next?
```

It sits between the Inbox and Opportunities sections so operators can move from attention signals into actual article workflow before inspecting deeper strategy or platform machinery.

## Source Data

The first version is intentionally lightweight and uses existing Sentinel data:

- opportunity centre output
- execution plans
- action inbox items
- resource QA article rows
- demand-led recommendations

It does not change SEO scoring and does not create a new content engine.

## Lifecycle Model

Content items use this lifecycle:

- `discovered`
- `researching`
- `planning`
- `drafting`
- `review`
- `ready`
- `published`
- `monitoring`

These statuses are workflow labels for the operator. They do not publish content, alter article data or approve implementation work by themselves.

Older browser-local state that used `approved` is normalised to `planning`. The intent is clearer: planning means the content item has enough context to become scoped editorial work, not that implementation or publication has been approved.

## Workbench UI

The standalone Sentinel shell now treats the workbench as a focused editorial workspace rather than a compact dashboard list. The top shell provides a short work-next strip, then the workbench becomes the main surface.

The current standalone design system is dark-first and workflow-led. It removes the previous pale dashboard slab from `/sentinel` and uses one coherent surface system:

- deep navy and graphite shell background
- elevated dark workspace panels
- cyan for primary action and selection state
- muted green, amber and red for health and risk only
- softer lane separation instead of repeated heavy cards
- full-width fluid grid and flex layout instead of a capped boxed dashboard canvas

Each content work card now prioritises:

- title
- category or topic
- next action
- lifecycle status
- priority
- enough rationale to choose what to open next

The focused working surface now splits the standalone Workbench into queue, document and context areas. The queue shows what can move next, the centre document area shows the active research or brief artefact, and the right panel keeps actions, review notes, latest output and item context close to the work.

The standalone view also includes a calmer stage ribbon for:

- Intake
- Making
- Review
- Live

The standalone Workbench now uses the full viewport width. The left rail is slim, the content queue sits beside a central editorial document surface, and the selected item context behaves as a docked right-hand action panel on larger screens.

## Actions

The workbench now prioritises workflow actions over raw command thinking. Workflow actions are defined in `platform/workflows/content-workflow-actions.json` and documented in `docs/SENTINEL_WORKFLOW_ACTIONS.md`.

Primary actions include:

- review opportunity
- start research
- generate brief
- prepare work package
- move to review
- mark ready
- mark published
- refresh monitoring
- open diagnostics
- generate roadmap update

Each action maps to one of three behaviours:

- local lifecycle transition
- local artefact creation
- existing allowlisted action execution through the Sentinel API

Raw status controls, linked plan commands and brief prompts remain available, but they are placed behind collapsed manual controls or advanced implementation detail so the operator starts from the task they want to complete.

It does not auto-generate articles, auto-publish, run arbitrary commands or expose deploy/restore/cleanup actions.

## Artefact Surfaces

The Workbench is now artefact-led. A selected content item can show reviewable artefact cards for:

- Research
- Brief
- Package
- Review
- Monitoring

Each artefact view shows whether it is available, ready to create or upcoming, then points to the next operational action. Opening an artefact shows either a generated document body or a structured preview. The document area is the dominant surface in `/sentinel`, with research presented as analysis and briefs presented as editorial instructions.

Workbench-local artefacts are not fake generated files. They are structured operator surfaces created from existing item context and action history, then stored locally under `sentinel.contentArtefacts.v1`. If a future action depends on a real local report, Sentinel states whether that report exists and where to review it.

See `docs/SENTINEL_CONTENT_ARTEFACTS.md` for the artefact model and review surface.

## Action Outputs

Workbench actions now leave visible operational feedback.

The selected item panel shows the latest action output with:

- result state
- summary of what happened
- status change when relevant
- suggested next action
- produced artefacts or pending output paths
- advanced fallback detail where relevant

Recent workflow outputs appear above the content lanes and show the latest five actions across the Workbench. This keeps the editorial flow clear after a status move, manual handoff or allowlisted diagnostic action.

Artefact awareness is deliberately conservative. Sentinel marks Workbench artefacts, committed outputs or already-present local reports as available. If a linked report does not exist yet, the UI states what action creates it. It does not invent files or expose bare commands as the primary result.

## Persistence

Status changes persist in browser local storage under:

```text
sentinel.contentWorkbench.v1
```

Workflow action history persists in browser local storage under:

```text
sentinel.workflowActions.v1
```

Generated Workbench artefacts persist in browser local storage under:

```text
sentinel.contentArtefacts.v1
```

Review notes persist in browser local storage under:

```text
sentinel.reviewNotes.v1
```

This is deliberately local-only for the first release. It avoids a database migration while the workflow model is still being shaped. No secrets, API payloads or stakeholder data are stored. Artefact bodies and review notes are private operator review content and are not exposed on `/seo-progress`.

A future version can promote stable workflow state into SQLite after the lifecycle and operational rules prove useful.

## Separation From Platform Machinery

Infrastructure and governance features remain available in their existing sections:

- Actions: controlled operator actions, command discovery and pipelines
- Cadence: reporting rhythm and notification payload preparation
- Diagnostics: readiness, service health and low-level checks
- Opportunities: strategic opportunity and plan intelligence

The Workbench is now the primary editorial/operator surface for content work.

## Stakeholder Safety

The workbench is private to `/seo-roadmap` and is not exposed on `/seo-progress`. It contains operator workflow context, linked plans and internal status labels that should not appear on stakeholder pages.
