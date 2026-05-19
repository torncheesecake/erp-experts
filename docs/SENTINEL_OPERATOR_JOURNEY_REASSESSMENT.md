# Sentinel Operator Journey Reassessment

This document records the first workflow reassessment after Sentinel gained the standalone `/sentinel` operator shell, Content Workbench, workflow actions and Pi-backed runtime.

The conclusion is simple: Sentinel should not feel like a command shell with statuses. It should feel like a guided operational workspace that shows what work exists, what was generated, what needs review and what decision comes next.

## Current UX Problems

The previous workflow action layer improved the dashboard, but it still leaked implementation detail at the wrong moment.

Observed failure:

```text
Generate brief
```

returned a bare terminal instruction similar to:

```text
npm run seo:plan:run --
```

That is not an operator workflow. It has no item context, no plan ID, no visible brief, no explanation of what changed and no clear next decision.

Primary operator pain points:

- The operator can still be forced to ask which command to run.
- Missing IDs or missing linked plans can produce confusing manual output.
- Status transitions can happen without a visible operational artefact.
- The Workbench can show metadata without showing the work itself.
- Generated or expected outputs are not always treated as reviewable objects.
- Infrastructure language competes with editorial workflow language.

## Core Principle

The operator should never need to ask:

- What command do I run?
- Where do I find the ID?
- What happened?
- What was created?
- What should I review?
- What do I do next?

Sentinel should answer those questions in the selected item panel and the work queue.

## Reworked Journey

### 1. Discovered

What the operator sees:

- A content opportunity or queue item with rationale, category, priority and likely topic.

What the operator can do:

- Accept the opportunity for research.
- Start research.
- Leave it in intake if the rationale is weak.

What Sentinel generates:

- Research summary artefact shell.
- Search intent, rationale and angle preview.

Recommended next step:

- Review research and generate an editorial brief.

Review or approval:

- Operator judgement on whether the opportunity is worth progressing.

Artefacts:

- Research.

### 2. Researching

What the operator sees:

- Research preview with topic, search intent, source signals and suggested angle.

What the operator can do:

- Generate an editorial brief.
- Move to planning if enough context already exists.
- Open diagnostics only if workflow is blocked.

What Sentinel generates:

- Editorial brief artefact.

Recommended next step:

- Review the brief and prepare the work package.

Review or approval:

- Operator checks that the angle is worth drafting.

Artefacts:

- Research.
- Brief.

### 3. Planning

What the operator sees:

- Editorial brief preview with goal, intent, structure and CTA guidance.

What the operator can do:

- Prepare a work package.
- Keep reviewing the brief if scope is unclear.

What Sentinel generates:

- Implementation package artefact.

Recommended next step:

- Start drafting against the package.

Review or approval:

- Operator confirms scope before drafting.

Artefacts:

- Brief.
- Package.

### 4. Drafting

What the operator sees:

- Package preview with task list, constraints and review checklist.

What the operator can do:

- Move to review once drafting work has been completed outside the Workbench.

What Sentinel generates:

- Review checklist artefact.

Recommended next step:

- Complete editorial review.

Review or approval:

- Drafting is not automatic. Sentinel tracks the handoff and review state only.

Artefacts:

- Package.
- Review.

### 5. Review

What the operator sees:

- Review preview with quality criteria, QA context and readiness decision guidance.

What the operator can do:

- Mark ready after editorial judgement.
- Refresh monitoring if review needs fresh QA context.

What Sentinel generates:

- Readiness decision artefact.

Recommended next step:

- Publish through the controlled editorial process outside Sentinel, then mark published.

Review or approval:

- Editorial judgement is required before ready.

Artefacts:

- Review.

### 6. Ready

What the operator sees:

- The work item is ready for controlled publication outside Sentinel.

What the operator can do:

- Mark published after the real publishing step has happened.
- Refresh monitoring if a final pre-publication check is needed.

What Sentinel generates:

- Publication record once marked published.

Recommended next step:

- Refresh monitoring after publication.

Review or approval:

- Publication remains outside Sentinel. Sentinel does not publish content.

Artefacts:

- Review.
- Monitoring.

### 7. Published

What the operator sees:

- Publication recorded locally and waiting for post-publication monitoring.

What the operator can do:

- Refresh monitoring through the allowlisted monitor action.

What Sentinel generates:

- Monitoring check.

Recommended next step:

- Keep the item in monitoring if healthy.

Review or approval:

- Operator reviews the monitor result.

Artefacts:

- Monitoring.

### 8. Monitoring

What the operator sees:

- Health and monitoring context for live content.

What the operator can do:

- Continue periodic monitoring.
- Re-open diagnostics if health changes.

What Sentinel generates:

- Updated monitoring artefact when the safe monitor action runs.

Recommended next step:

- Keep weekly monitoring active or create a new improvement item if friction repeats.

Review or approval:

- Operator decides whether the content loop is stable or needs new work.

Artefacts:

- Monitoring.

## Artefact-Driven Workflow Model

Workflow actions should produce named operational artefacts rather than exposing raw implementation commands.

Initial artefacts:

- Research: rationale, intent, source signals and suggested angle.
- Brief: editorial goal, structure, headings, intent and CTA guidance.
- Package: scope, tasks, dependencies, constraints and review checklist.
- Review: editorial judgement, QA context and readiness decision.
- Monitoring: post-publication health, QA result and next monitoring step.

An artefact can be:

- a Workbench-local preview generated from existing item context
- an existing local report generated by an allowlisted action
- a future persisted object once the model is promoted beyond local browser state

If an output does not exist yet, Sentinel should say what will appear and which action creates it. It should not invent generated files.

## Guided Next-Step Model

The selected item panel should always show:

- current stage
- next recommended action
- why that action matters
- the artefact to review
- what will become available after the action

Example:

```text
Brief available. Next recommended step: Prepare work package.
Review the brief first, then create the package before drafting starts.
```

This is deliberately stronger than showing a status badge or terminal command.

## First Implementation Pass

This pass intentionally avoids a large database migration or a full editorial CMS.

Implemented direction:

- Replaced the ambiguous `approved` lifecycle stage with `planning`, while normalising existing local state from `approved` to `planning`.
- Added `local_artifact` workflow actions for brief and package creation.
- Added strict manual command hydration so incomplete commands with missing IDs are not surfaced as useful output.
- Added visible Workbench artefact cards for Research, Brief, Package, Review and Monitoring.
- Added a guided next-step panel in the selected item surface.
- Added artefact preview panels so the operator can see the work, not just metadata.
- Collapsed terminal fallbacks behind advanced implementation detail.

## Safety Boundaries

This workflow reassessment does not:

- publish content
- generate full articles automatically
- add arbitrary shell execution
- expose operator controls publicly
- change SEO scoring
- touch `src/quizlift`
- remove existing governance, console, pipeline or diagnostic systems

The infrastructure remains available, but it is now secondary to the guided content workflow.

## Future Direction

Recommended next improvements:

- Persist proven artefacts in SQLite after the local model stabilises.
- Add a richer document preview for actual draft and brief bodies.
- Connect item-specific plan IDs directly to generated artefact records.
- Add review notes and decision history per artefact.
- Add safe item-scoped API mutations once remote authority is enabled.
- Keep terminal commands as support and debugging detail, not primary workflow output.
