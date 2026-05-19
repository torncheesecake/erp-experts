# Sentinel Draft Workspace

Sentinel now supports a first draft production layer inside the private operator Workbench.

The Draft Workspace turns an approved brief into editable article content that can be reviewed and evolved before any publishing step happens outside Sentinel.

## Purpose

The draft layer closes the gap between planning and production.

Before this layer, Sentinel could:

- discover opportunities
- create research artefacts
- create editorial briefs
- move work through lifecycle stages
- capture review notes

The Draft Workspace adds:

- editable draft artefacts
- draft section structure
- edit, preview and review modes
- draft status decisions
- last edited state
- revision and approval notes

It does not auto-publish, call external AI generation, change SEO scoring or expose operator content on `/seo-progress`.

## Draft Artefact Model

Drafts are stored as browser-local content artefacts under:

```text
sentinel.contentArtefacts.v1
```

Each draft artefact includes the standard artefact fields:

- `id`
- `relatedWorkItemId`
- `type`
- `title`
- `createdAt`
- `updatedAt`
- `status`
- `summary`
- `body`
- `generatedBy`
- `nextStep`

Draft artefacts also include draft-specific fields:

- `draftStatus`
- `draftTitle`
- `draftIntro`
- `draftSections[]`
- `draftCta`
- `draftNotes`
- `lastEditedAt`

Supported draft statuses:

- `outline`
- `drafting`
- `review`
- `approved`
- `revision_requested`
- `ready_to_publish`

## Create Draft Action

The workflow action `Create draft` creates an editable starter draft from the selected work item and reviewed brief context.

The starter draft includes:

- working title
- intro placeholder
- section headings
- section body placeholders
- CTA guidance
- draft notes

The starter text is intentionally unfinished. It is a work-in-progress surface for an operator to edit, not an auto-generated final article.

## Workspace Modes

The draft document supports three modes.

`Edit`

Operators can edit:

- title
- intro
- section headings
- section copy
- CTA
- draft notes

`Preview`

Sentinel renders the draft as an article-style reading view so the operator can review flow, structure and reader experience.

`Review`

Operators can set the draft decision state and capture revision or approval notes. This supports editorial judgement without publishing anything.

## Workflow Progression

The intended editorial progression is:

```text
Research complete -> Generate brief
Brief reviewed -> Create draft
Draft edited -> Preview draft
Draft reviewed -> Move to review
Review complete -> Mark ready
Published outside Sentinel -> Mark published
Published content -> Monitoring
```

The Workbench should always answer:

- what exists
- what changed
- what to edit
- what to preview
- what decision is next

## Persistence And Scope

Draft content is browser-local in this first implementation. This keeps the operational model safe while the draft workflow is still being shaped.

Future work can promote proven draft artefacts into the Pi-backed SQLite database after review, authority and backup behaviour are confirmed.

## Safety Boundaries

The Draft Workspace does not:

- publish content
- deploy changes
- write article files
- run arbitrary commands
- call external AI systems
- expose drafts on `/seo-progress`
- change SEO scoring
- bypass authority gates

Publishing remains a separate controlled editorial process outside this first draft layer.
