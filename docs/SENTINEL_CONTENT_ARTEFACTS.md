# Sentinel Content Artefacts

Sentinel content artefacts are the first operational document layer inside the Content Workbench.

They make workflow actions visible as reviewable content rather than just status changes.

## Purpose

The operator should see the work that was created.

For example:

- Start research creates a research artefact.
- Generate brief creates an editorial brief artefact.
- Prepare work package creates a draft package artefact.
- Move to review creates a review checklist artefact.
- Refresh monitoring creates monitoring context.

The operator should not need to infer what happened from a raw command, status label or hidden report path.

## Artefact Model

The first model is browser-local and intentionally lightweight.

Each artefact includes:

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

Supported types:

- `research`
- `brief`
- `draft`
- `review`
- `monitoring`

Browser-local storage key:

```text
sentinel.contentArtefacts.v1
```

This keeps the first artefact layer low risk while the workflow model stabilises. It does not add a SQLite migration, publish content, call external research APIs or change SEO scoring.

## Generated Research Artefacts

The Start research workflow now creates a structured research document.

Initial sections:

- Search intent
- Audience
- Competitor themes
- Suggested article angles
- Suggested headings
- Internal linking ideas
- CTA ideas
- Risks and gaps

The content is generated from existing Workbench item context such as topic, opportunity rationale, category, suggested angle, QA signals and linked article path. It is not presented as external SERP data.

## Generated Brief Artefacts

The Generate brief workflow now creates a structured editorial brief.

Initial sections:

- Article goal
- Target topic
- Target reader
- Suggested structure
- Headings
- Tone guidance
- CTA direction
- Notes
- Next step

The brief is reviewable in the central document surface before package or drafting work begins.

## Review Surface

The standalone `/sentinel` Workbench now uses a three-part operational layout on larger screens:

- left: workflow queue and stage lanes
- centre: active artefact document
- right: workflow actions, item context and latest output

The centre panel is the main editorial workspace. It shows research, brief, draft, review and monitoring tabs for the selected work item, then renders the active artefact as a readable document.

If an artefact has not been generated yet, Sentinel shows a preview and the action needed to create it.

The review surface now treats generated content as a document. Research uses an analytical section rhythm, while briefs use an editorial review rhythm with stronger next-step emphasis.

## Review Notes

Operators can add local notes against the selected work item and artefact.

Supported note types:

- operator note
- review comment
- concern
- question
- draft reminder

Browser-local storage key:

```text
sentinel.reviewNotes.v1
```

Notes are private operator review context. They are not published, are not exposed on `/seo-progress` and do not change article content.

## Workflow Progression

The intended progression is:

```text
Start research -> research appears
Generate brief -> brief appears
Prepare work package -> draft package appears
Move to review -> review checklist appears
Refresh monitoring -> monitoring context appears
```

Every step should answer:

- what changed
- what was created
- where to review it
- what to do next
- what questions or reminders have been captured

Raw commands remain secondary and collapsed behind advanced controls.

## Safety Boundaries

Content artefacts do not:

- publish articles
- generate full articles automatically
- call external search APIs
- expose operator data on `/seo-progress`
- change SEO scoring
- add arbitrary shell execution
- bypass approval or authority gates
- publish review notes

The current artefacts are operational guidance and review surfaces for Matthew's private Sentinel workspace.

## Future Work

Likely next improvements:

- editable artefact notes
- artefact approval decisions
- SQLite persistence once the local model proves stable
- authenticated Pi-backed artefact storage
- richer draft preview and review annotation
- controlled export from brief to implementation package
