# SEO Automation Status

## Purpose

This document records what the current SEO automation system does, what has been proven in live tests, what risks remain, and what should be prioritised next.

## Current System Overview

The current workflow combines data quality controls, search-demand inputs, and editorial guidance into a read-only recommendation loop:

1. Resource article QA scoring (`scripts/qa_resources.mjs`)
2. Fix vs create recommendation building (`scripts/seo_action_briefs.mjs`)
3. Action brief generation with:
- channel outputs
- implementation plans
- Codex patch prompts
- outcome scoring
- sprint backlog metadata
4. Weekly executive summary generation (`scripts/seo_weekly_summary.mjs`)
5. Pipeline orchestration and snapshotting (`scripts/seo_pipeline.mjs`)
6. Admin-facing roadmap visibility in `/seo-roadmap` (Dashboard v2) with:
- weekly operator summary at the top
- article workbench with filter/sort and article selection
- front-end fix planner and prompt preview
- advanced diagnostics for raw QA/recommendation/brief/pipeline detail

No automatic publishing or automatic article editing is enabled.

## Scripts and Commands

Primary automation commands:

- `npm run qa:resources`
- `npm run seo:briefs`
- `npm run seo:summary`
- `npm run seo:pipeline`
- `npm run seo:batch`
- `npm run seo:batch:prompt`
- `npm run seo:batch:complete`

CI workflow command coverage:

- `npm run lint`
- `npm run build`
- `npm run seo:pipeline`
- `npm run seo:stats`

Validation commands used in delivery flow:

- `npm run lint`
- `npm run build`

Recommended run order:

1. `npm run qa:resources`
2. `npm run seo:briefs`
3. `npm run seo:summary`
4. `npm run seo:pipeline`
5. `npm run lint`
6. `npm run build`

## Generated Report Files

Generated outputs currently used by the roadmap/admin workflow:

- `reports/resource-qa-report.json`
- `reports/seo-action-briefs.json`
- `reports/seo-weekly-summary.json`
- `reports/seo-pipeline-summary.json`
- `reports/seo-next-batch-prompt.md`
- `reports/history/YYYY-MM-DD-HHmm/*`

Batch prompt generation:

- `npm run seo:batch:prompt` builds a read-only, copy-ready Markdown prompt for the current top batch queue.
- Output path: `reports/seo-next-batch-prompt.md`
- Queue source: same selection logic as `npm run seo:batch` (improve_existing briefs first, then needs_review QA fallback).

Batch completion helper:

- `npm run seo:batch:complete`
- `npm run seo:batch:complete -- --dry-run`
- Validates lint, build, pipeline, stats, and batch queue before any commit.
- Only auto-stages this allowlist:
  - `src/data/articles.js`
  - `reports/resource-qa-report.json`
  - `reports/seo-action-briefs.json`
  - `reports/seo-pipeline-summary.json`
  - `reports/seo-weekly-summary.json`
- Refuses to continue if unexpected files exist in git status, if blocked pages are present, if human review is recommended, if stats are not current, or if there is nothing to commit.

Recommended operator flow:

1. `npm run seo:batch:prompt`
2. Run the generated prompt in Codex sequentially.
3. `npm run seo:batch:complete -- --dry-run`
4. If dry run is safe, run `npm run seo:batch:complete`.
5. Refresh `/seo-roadmap` and review the next queue.

Current snapshot (latest generated state):

- Resource QA: `26` articles, `pass=9`, `needs_review=17`, `blocked=0`
- Briefs: `27` total recommendations, `5` dashboard briefs, `10` sprint backlog briefs
- Weekly summary: create-heavy split with `17` pages still needing review
- Pipeline: one-command run with snapshot and run-to-run diff support

## Pipeline Snapshot and Diff Model

`seo:pipeline` now performs one command execution for operational use.

It does all of the following:

1. Runs the three generation scripts in order (`qa:resources`, `seo:briefs`, `seo:summary`)
2. Validates expected output files exist
3. Creates a timestamped snapshot folder under `reports/history/YYYY-MM-DD-HHmm/`
4. Copies current report files into that snapshot
5. Compares current run with previous snapshot and reports:
- pass / needs_review / blocked change
- newly passing articles
- newly failing articles
- recommendation count delta
6. Writes a machine-readable run summary to `reports/seo-pipeline-summary.json`

Human review flags in pipeline summary:

- `humanReviewRecommended`
- `reason`

Current triggers:

- blocked articles are present
- large QA score swings across multiple articles
- structural regressions increase
- high commercial-value briefs have low confidence

## Proven Workflow Tests

The following end-to-end tests have been completed and validated with lint/build/QA/brief/summary runs:

1. Single-article improvement from `needs_review` to `pass`
- `10-signs-of-a-poor-netsuite-implementation`

2. Controlled multi-article sprint improvements
- `stress-free-erp-implementation`
- `how-to-choose-the-right-erp-consultant`
- `why-netsuite-aftercare-is-essential`

3. Sprint-backlog candidate improvement (outside dashboard top 5)
- `netsuite-project-management-financials` (selected from `displayRank` 6-15)

## Before/After Improvements (Recent Proven Cases)

- `10-signs-of-a-poor-netsuite-implementation`: `68 -> 97`, gate `needs_review -> pass`
- `stress-free-erp-implementation`: `71 -> 95`, gate `needs_review -> pass`
- `how-to-choose-the-right-erp-consultant`: `64 -> 94`, gate `needs_review -> pass`
- `why-netsuite-aftercare-is-essential`: `73 -> 93`, gate `needs_review -> pass`
- `netsuite-project-management-financials`: `68 -> 94`, gate `needs_review -> pass`

Observed quality trend from these runs:

- `pass` count increased
- `needs_review` count reduced
- structural errors remained `0`

## Known Limitations

1. Recommendation surface is still demand-weighted.
- Even with sprint backlog support, top demand themes dominate first-page visibility.

2. Article tone consistency is not fully standardised.
- Prompt constraints reduce drift, but legacy style differences remain across the library.

3. Repetition checker is intentionally lightweight.
- It is warning-only and catches obvious phrase reuse, not full semantic similarity.

4. Outcome scoring is heuristic, not attributed.
- Commercial fields are estimation-based and not connected to CRM conversion truth.

5. Dashboard planner is intentionally read-only.
- `/seo-roadmap` can generate prompts and guidance, but does not execute edits or pipeline commands from UI.

## Security Limitations

1. Roadmap edit control is not real auth.
- Client-side edit gating exists, but this is not a secure authentication model.

2. Canonical status write path depends on PHP endpoint availability.
- `/api/seo-statuses.php` is canonical.
- `/api/seo-statuses.json` remains fallback read path.

3. Admin-style content is visible client-side.
- Sensitive controls should eventually move behind server-side authenticated access.

## Stability Risks Still Present

1. Prompt drift across large sprint batches.
- Guardrails exist, but sustained high-volume editing can still create pattern repetition.

2. Build warning debt.
- Vite CSS warning around `.print:hidden` is still unresolved.

3. Manual sequencing dependency.
- Reduced by `seo:pipeline`, but still depends on operators using the pipeline consistently.

4. Dense diagnostics still exist behind collapsible sections.
- Main flow is clearer in v2, but diagnostics remain broad and may need further UX simplification.

## SEO Roadmap Dashboard v2 (Operator Flow)

Purpose:

- Improve operational clarity on what to fix next without changing scoring logic or report schemas.

What it does:

1. Highlights weekly summary, QA totals, human review flag, latest snapshot, and suggested next action.
2. Provides an Article Workbench with practical filters:
- needs review
- pass
- sprint candidates
- high commercial intent
- has Codex prompt
- missing CTA
- thin content
3. Shows article detail with warnings, structural issues, recommendation context, and brief data.
4. Generates a front-end-only Fix Planner prompt preview with selected fix toggles.

What it does not do:

- No browser-side file editing.
- No server-side execution.
- No scoring model changes.
- No auto-publishing.

Manual workflow:

1. Select article in workbench.
2. Choose fix toggles.
3. Copy prompt into Codex.
4. Apply article-only edit in `src/data/articles.js`.
5. Run `npm run seo:after-edit -- <slug>`.

## Future Backlog

1. Rework `/seo-roadmap` layout and wording for clearer operator workflow
2. Build a standalone multi-client app (separate from the marketing site codebase)
3. Implement real auth for roadmap/admin editing (server-side)
4. Integrate CRM/outcome feedback (`leadsGenerated`, `assistedConversions`, attribution)
5. Add CI automation for QA/report generation on PR and scheduled runs
6. Run article voice/style consistency pass across the full resource library
7. Clean up build warning for `.print:hidden`

## Suggested Next Technical Milestone

Implement CI job orchestration:

- run `seo:pipeline`
- publish report artifacts per run
- fail on structural QA errors
- surface warning deltas for review

This will reduce manual drift and make sprint quality progression auditable over time.

## CI Automation Status

Workflow file: `.github/workflows/seo-quality.yml`

Current CI behaviour:

1. Runs on pull requests, pushes to `main`, and manual dispatch.
2. Validates lint, build, pipeline generation, and stats output.
3. Uploads generated SEO reports as artefacts for review.

Failure vs warning behaviour:

- Fail conditions:
  - any failing command in lint/build/pipeline/stats
  - missing expected report outputs after pipeline
- Warning/visibility conditions:
  - non-zero `needs_review` count does not fail CI
  - blocked count is printed for operator visibility
