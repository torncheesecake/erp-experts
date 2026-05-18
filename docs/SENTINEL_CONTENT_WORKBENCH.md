# Sentinel Content Workbench

The Sentinel Content Workbench is the operator-facing content workflow layer inside `/seo-roadmap`. It shifts the Control Centre from infrastructure-first operation toward day-to-day editorial work.

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
- `approved`
- `researching`
- `drafting`
- `review`
- `ready`
- `published`
- `monitoring`

These statuses are workflow labels for the operator. They do not publish content, alter article data or approve implementation work by themselves.

## Workbench UI

The standalone Sentinel shell now treats the workbench as a focused editorial workspace rather than a compact dashboard list. The top shell provides a short work-next strip, then the workbench becomes the main surface.

Each content work card now prioritises:

- title
- category or topic
- next action
- lifecycle status
- priority
- enough rationale to choose what to open next

The focused working panel shows content goal, opportunity rationale, suggested angle, recommended next step, linked plan/opportunity state and local workflow history. It is designed to feel like working on the selected item, not reading a metadata table.

The standalone view also includes a calmer stage ribbon for:

- Intake
- Making
- Review
- Live

## Actions

The workbench supports safe operator actions only:

- open details
- change lifecycle status
- move status backward or forward
- copy linked plan command
- copy brief/planning prompt
- open the existing QA planner for a published article

It does not auto-generate articles, auto-publish, run arbitrary commands or expose deploy/restore/cleanup actions.

## Persistence

Status changes persist in browser local storage under:

```text
sentinel.contentWorkbench.v1
```

This is deliberately local-only for the first release. It avoids a database migration while the workflow model is still being shaped. No secrets, command output, article bodies or API payloads are stored.

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
