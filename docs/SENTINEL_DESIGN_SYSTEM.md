# Sentinel Design System

Sentinel is a private operational application for content work. The interface must feel like an editorial workspace, not a marketing page, dashboard wall or command console.

## Product Direction

- Modern SaaS workspace.
- Calm, premium and readable.
- Full-width on desktop, adaptive on tablet, single-column on mobile.
- Content review and draft work are the centre of the screen.
- Infrastructure, runtime and commands are supporting systems only.

## Typography Scale

Use a restrained hierarchy:

- App title: 20-28px, semibold, tight tracking.
- Workspace heading: 22-32px, semibold, tight tracking.
- Document title: 28-44px, semibold, tight tracking, line-height close to 1.05.
- Section heading: 18-24px, semibold.
- Body text: 14-16px, line-height 1.6-1.8.
- Metadata: 11-13px, muted, never allowed to dominate.
- Buttons and controls: 12-14px, semibold.

Do not stack multiple large headings in the first viewport.

## Spacing Scale

Use consistent spacing instead of borders around everything:

- 4px: tight icon/text gaps.
- 8px: small control gaps.
- 12px: compact row padding.
- 16px: default component gap.
- 20px: panel padding.
- 24px: major region gap.
- 32px: document section rhythm.
- 40px+: only for breathing room around primary document surfaces.

## Grid System

Desktop `/sentinel` layout:

- Top: one slim app bar.
- Left: compact persistent navigation.
- Main: three-column work grid.
- Left work column: queue and filters.
- Centre column: selected artefact or draft document preview.
- Right column: next action, notes, review controls and history.

Preferred desktop grid:

```text
nav | work queue | document review | actions/notes
```

Collapse rules:

- At laptop widths, document remains central and queue/actions reduce density.
- At tablet widths, queue, document and actions stack vertically.
- At mobile widths, hide decorative metadata and keep one clear work flow.

## Surface Rules

Use fewer, calmer surfaces:

- Shell background: soft graphite/navy, not pure black.
- Primary document surface: higher contrast and more readable than the surrounding shell.
- Queue surface: subtle, list-like, no heavy card wall.
- Action surface: narrow, calm, contextual.
- Diagnostics and operations: secondary and visually quieter.

Avoid:

- box inside box inside box
- bright white slabs on dark shells
- repeated thick borders
- large rounded dashboard cards everywhere
- multiple hero surfaces before the work appears

## Theme Tokens

Dark theme default:

- `--sentinel-bg`: `#07111f`
- `--sentinel-bg-soft`: `#0b1625`
- `--sentinel-surface`: `#101b2b`
- `--sentinel-surface-strong`: `#162235`
- `--sentinel-document`: `#f4efe4`
- `--sentinel-text`: `#edf4f8`
- `--sentinel-muted`: `#8ea0b4`
- `--sentinel-border`: `rgba(148, 163, 184, 0.18)`
- `--sentinel-accent`: `#8de9f5`
- `--sentinel-success`: `#8bd9b0`
- `--sentinel-warning`: `#f2c879`
- `--sentinel-danger`: `#ee8f9b`

Light theme foundation:

- `--sentinel-bg`: `#f5f2ea`
- `--sentinel-bg-soft`: `#ede8dd`
- `--sentinel-surface`: `#ffffff`
- `--sentinel-surface-strong`: `#f7f3ea`
- `--sentinel-document`: `#ffffff`
- `--sentinel-text`: `#172033`
- `--sentinel-muted`: `#667085`
- `--sentinel-border`: `rgba(23, 32, 51, 0.12)`
- `--sentinel-accent`: `#0e8fa3`

Do not hardcode random cyan glows everywhere. Accent colour should point to active work, selected artefacts or the next action.

## Button Hierarchy

Primary:

- One dominant action per selected item.
- Filled accent surface.
- Clear action verb, for example `Create draft`, `Mark ready`, `Start research`.

Secondary:

- Subtle filled or outline surface.
- Used for alternate actions.

Tertiary:

- Text or ghost button.
- Used for utility controls.

Advanced:

- Collapsed by default.
- Commands and implementation details must never be the primary CTA.

## Card Rules

Cards are allowed only when they represent an object:

- work item
- artefact
- note
- action result

Do not use cards to frame every label, statistic or line of copy. Prefer list rows, whitespace and typography.

## Document And Review Layout Rules

The selected artefact or draft is the main work surface.

It must show:

- selected item title
- artefact tabs: Research, Brief, Draft, Review, Monitoring
- readable document body or draft editor
- next review decision
- generated or edited timestamp where useful

The document area should be visually central and larger than the queue and action columns.

## Navigation Rules

Navigation must be compact and app-like:

- Workbench
- Queue
- Planning
- Operations
- Monitoring or Runtime
- Settings

Do not use ERP Experts website navigation, public CTAs, marketing links or footer patterns inside `/sentinel`.

## What Not To Do

- Do not add a large hero above the workspace.
- Do not repeat `Content Workbench` headings three times.
- Do not make every element a bordered rounded rectangle.
- Do not lead with health, cadence or runtime status.
- Do not expose raw commands as primary workflow output.
- Do not make ERP Experts look like the host product.
- Do not hide the document preview below dashboards.
