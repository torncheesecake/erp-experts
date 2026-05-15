# SEO Automation Platform Extraction Plan

## Purpose

This document outlines a safe path for turning the current ERP Experts SEO automation system into a reusable multi-client SEO and content operations platform.

The current ERP Experts system should remain stable while extraction is planned. No working commands, scoring rules, article data, routes or dashboard behaviour should be moved or refactored until the platform boundary is explicit and tested.

## 1. Current System Summary

### What Exists Now

The ERP Experts repo contains a working local SEO/content operating system with these capabilities:

- Resource article QA scoring and publish gate suggestions.
- SEO pipeline orchestration through `npm run seo:pipeline`.
- Monitoring through `npm run seo:monitor` and `npm run seo:operator`.
- Growth opportunity generation through `npm run seo:growth`.
- Internal link opportunity generation through `npm run seo:links`.
- Freshness and content decay analysis through `npm run seo:freshness`.
- Conversion path intelligence through `npm run seo:conversion`.
- Unified opportunity prioritisation through `npm run seo:opportunities`.
- Strategic decision resolution through `npm run seo:decisions`.
- Execution planning through `npm run seo:plans`.
- Review-first plan runner, approval gate and local status tracking through `seo:plan:run`, `seo:plan:approve` and `seo:plan:status`.
- Weekly digest, action inbox and autopilot orchestration through `seo:digest`, `seo:inbox` and `seo:autopilot`.
- A private `/seo-roadmap` dashboard that reads generated reports and presents health, opportunities, plans and operational state.

The system is currently most useful as a local or private operator console. It generates reviewable recommendations and prompts, but it does not auto-edit or auto-publish content.

### ERP Experts-Specific Parts

These areas are tied to the ERP Experts website and should not be treated as reusable platform logic without abstraction:

- `src/data/articles.js` article data and article object shape.
- `src/data/reports.json` demand and reporting data.
- ERP Experts service paths such as `/services/netsuite`, `/support`, `/implementation`, `/partners` and `/contact`.
- ERP Experts tone, CTA language, commercial priorities and service relevance rules.
- ERP Experts resource URLs, slugs, article titles and internal link relationships.
- `src/pages/SeoRoadmap.jsx` as a site-integrated dashboard page.
- Public status files such as `public/api/seo-statuses.json` and any ERP Experts-specific status update flow.
- Generated reports under `reports/`, which currently reflect this single tenant.

### Reusable Engine Logic

These parts are candidates for extraction into generic platform modules:

- Report loading and validation utilities.
- Resource QA scoring framework and gate model.
- Opportunity generation patterns.
- Topic clustering and deduplication logic.
- Internal link opportunity heuristics.
- Freshness and decay scoring framework.
- Conversion path scoring framework.
- Unified opportunity prioritisation.
- Strategic decision resolver.
- Execution plan generation.
- Approval, plan status and review-first workflow concepts.
- Autopilot state classification.
- Dashboard composition patterns for health, inbox, opportunities, plans and reports.

The extraction should separate reusable algorithms from tenant data, service mappings, copy tone and route assumptions.

## 2. Target Platform Architecture

### Platform Shell

The platform shell should provide the runtime boundary for commands, dashboards, scheduled jobs and tenant selection. It should not contain client-specific content or commercial assumptions.

Responsibilities:

- Load tenant configuration.
- Run engine modules in sequence.
- Route report output to the correct tenant workspace.
- Provide dashboard navigation and shared UI layout.
- Enforce review-first safety defaults.
- Provide standard CLI commands and workflow entry points.

### Tenant and Client Layer

Each client should be represented by a tenant configuration and optional adapters. The tenant layer should describe what the platform needs to know about that client without hardcoding that knowledge into engine scripts.

Responsibilities:

- Identify the client.
- Define content sources.
- Define service paths and CTA options.
- Define scoring and opportunity priorities.
- Define report output paths.
- Define dashboard labels and visibility.

### Site Adapters

Site adapters translate a client website into the platform’s generic content model.

Examples:

- Vite/React static article adapter.
- CMS export adapter.
- Markdown content adapter.
- API-backed content adapter.

The first adapter should be read-only and should mirror the current ERP Experts article loading process. Write support should only be added later behind explicit approval gates.

### Engine Modules

Engine modules should be tenant-aware but not tenant-specific.

Candidate modules:

- QA engine.
- Monitor engine.
- Growth engine.
- Internal links engine.
- Freshness engine.
- Conversion engine.
- Opportunity centre.
- Decision engine.
- Execution planning engine.
- Digest and inbox generators.
- Autopilot orchestrator.

Each engine should accept normalised tenant content and configuration, then emit structured report objects.

### Dashboard Modules

Dashboard modules should be reusable components that render report categories rather than ERP Experts-specific page logic.

Suggested modules:

- Health overview.
- Action inbox.
- Opportunity command centre.
- Strategic decisions.
- Execution plans.
- Digest and reports.
- Advanced diagnostics.
- Tenant settings and configuration summary.

### Persistence Layer

The platform should begin with JSON reports, then graduate to SQLite, then Postgres when true multi-tenant usage is needed.

The persistence layer should track:

- Current reports.
- Historical snapshots.
- Plan approvals.
- Plan status.
- Operator notes.
- Outcome feedback.
- Tenant configuration versions.

### Execution and Approval Layer

The execution layer should remain review-first.

It should support:

- Plan generation.
- Approval status tracking.
- Active plan files.
- Proposed patch prompts.
- Validation command tracking.
- Human review checkpoints.
- Audit notes.

It should not apply content changes automatically until a later explicit phase with proper auth, permissions, audit logging and rollback support.

## 3. Proposed Folder Structure

A future extraction could use this shape:

```text
platform/
  core/
    config/
    content-model/
    reporting/
    safety/
  engines/
    qa/
    monitor/
    growth/
    internal-links/
    freshness/
    conversion/
    opportunities/
    decisions/
    execution-plans/
    autopilot/
  tenants/
    schema/
    loaders/
  dashboard/
    components/
    layouts/
    views/
  persistence/
    json/
    sqlite/
    postgres/
  workflows/
    github-actions/
    local-cli/

clients/
  erp-experts/
    tenant.config.json
    adapters/
    reports/
    dashboard.config.json
  demo-client/
    tenant.config.json
    adapters/
    reports/
```

Initial extraction should not move the existing ERP Experts files. The first implementation should introduce a tenant contract in parallel, then prove it can describe ERP Experts without changing existing commands.

## 4. Tenant Model

Each tenant should define at least:

```json
{
  "clientId": "erp-experts",
  "name": "ERP Experts",
  "domain": "erp-experts.co.uk",
  "contentSource": {
    "type": "local-js",
    "path": "src/data/articles.js",
    "resourceBasePath": "/resources"
  },
  "demandSource": {
    "type": "local-json",
    "path": "src/data/reports.json"
  },
  "servicePaths": {
    "netsuite": "/services/netsuite",
    "support": "/support",
    "implementation": "/implementation",
    "partners": "/partners",
    "contact": "/contact"
  },
  "ctaMap": {
    "support": {
      "label": "Review NetSuite support options",
      "path": "/support"
    },
    "implementation": {
      "label": "Discuss implementation support",
      "path": "/implementation"
    },
    "advisory": {
      "label": "Book an ERP review",
      "path": "/contact"
    }
  },
  "scoringProfile": {
    "commercialTopics": ["NetSuite", "ERP consultant", "implementation", "support", "finance", "manufacturing"],
    "genericTopicPenalty": true
  },
  "opportunityProfile": {
    "preferredMarkets": ["UK"],
    "priorityServices": ["NetSuite", "support", "implementation", "partners"]
  },
  "reportOutputPath": "reports/tenants/erp-experts",
  "dashboardConfig": {
    "title": "SEO Overview",
    "showExecutionPlans": true,
    "showAdvancedDiagnostics": true
  }
}
```

The real schema should be stricter than this example, but the first version can remain JSON-based and local.

## 5. ERP Experts as the First Tenant

ERP Experts should become the first tenant because it is the proven reference implementation.

A future `clients/erp-experts/` folder could contain:

- Tenant configuration.
- Service path map.
- CTA map.
- Scoring profile.
- Opportunity profile.
- Site adapter for `src/data/articles.js`.
- Report output folder.
- Dashboard configuration.

The current site should remain the source of truth during the first extraction phase. Platform code should read ERP Experts data, not move it.

Safe migration sequence:

1. Define the tenant config contract.
2. Add an ERP Experts config that mirrors current paths.
3. Add a read-only loader that can normalise ERP Experts articles.
4. Run one non-critical engine from the tenant config in parallel.
5. Compare output with existing reports.
6. Only then consider migrating commands behind the tenant-aware layer.

## 6. Server Deployment Plan

Matthew has a web server, domains, GitHub repo access and Codex access. The platform should use those assets incrementally.

### Option A: Static Dashboard and CLI First

This is the safest first deployment model.

- Continue generating reports through CLI commands or GitHub Actions.
- Publish a static dashboard build to a private or protected path.
- Keep JSON reports as artefacts or server files.
- Use basic server protection rather than real multi-user auth.
- Keep execution and approvals local.

This keeps risk low and avoids premature backend work.

### Option B: Node App Later

A Node app can be introduced when the system needs live tenant switching, persistent state or authenticated dashboards.

Possible responsibilities:

- Tenant selection.
- Report API endpoints.
- Approval state API.
- Scheduled job runner.
- User sessions.
- Audit logs.

### Option C: SQLite First

SQLite is a sensible first persistent store for a single-server platform.

Benefits:

- Simple deployment.
- Easy backups.
- Low operational overhead.
- Good enough for local dashboards, approvals, history and digest state.

### Option D: Postgres Later

Postgres becomes useful when there are multiple clients, multiple users, billing events, permissions and long-term outcome history.

### Reverse Proxy and Domains Later

When ready, run the platform behind Nginx, Caddy or an equivalent reverse proxy.

Suggested domain model:

- `seo.matthew-domain.co.uk` for the platform shell.
- `client-name.seo.matthew-domain.co.uk` for tenant dashboards.
- Basic auth initially, then real auth later.

## 7. Persistence Roadmap

### Phase 1: JSON Reports Remain

Use the current report files as the operational store.

Pros:

- Already working.
- Easy to inspect.
- GitHub Actions friendly.
- Simple to archive.

Limitations:

- Weak concurrency.
- No proper audit trail.
- No multi-user permissions.
- Easy to confuse current reports with generated artefacts.

### Phase 2: SQLite

Introduce SQLite for platform state while keeping JSON export compatibility.

Store:

- Tenant registry.
- Report runs.
- Snapshots.
- Approvals.
- Plan status.
- Inbox items.
- Digest history.
- Operator notes.

### Phase 3: Postgres and Multi-Tenant Database

Move to Postgres when the platform needs:

- Multiple users.
- Multiple tenants.
- Role-based access.
- Billing records.
- Outcome history.
- Larger report volumes.
- Stronger backups and monitoring.

## 8. Auth Roadmap

### Phase 1: Local and Private Use

Use local CLI and private dashboard access only.

No public editing. No public execution. No secrets in frontend bundles.

### Phase 2: Basic Auth

Protect the dashboard with server-level basic auth or an equivalent simple gate.

This is not a full product auth system, but it is much safer than client-side passwords.

### Phase 3: Tenant Users and Roles

Introduce real users and roles:

- Platform admin.
- Client admin.
- Reviewer.
- Read-only stakeholder.

Tie approvals and plan status changes to user identities.

### Phase 4: Billing and Subscription

Only add billing once the operational model is stable.

Likely needs:

- Account ownership.
- Tenant limits.
- Subscription status.
- Invoice history.
- Usage or package entitlements.

## 9. Monetisation Roadmap

Possible commercial models:

### Internal Marketing Ops Tool

Use it first as Matthew’s private SEO/content operations system.

Value:

- Faster content review.
- Better prioritisation.
- Safer SEO workflows.
- Reduced manual interpretation.

### Agency Client Dashboard

Offer managed clients a dashboard showing:

- Health state.
- Opportunities.
- Work completed.
- Recommendations.
- Review queue.

This can begin as a managed service, not a full self-serve SaaS.

### Managed SEO and Content Ops Service

Sell the outcome, not the software:

- Monthly monitoring.
- Content improvement sprints.
- Internal linking reviews.
- Conversion path reviews.
- Executive summaries.

### SaaS Subscription Later

Only move to SaaS after the system has proven repeatability across multiple clients.

Potential packages:

- Single site monitoring.
- Agency multi-client dashboard.
- Content operations suite.
- Approval and execution workflow add-on.

## 10. Legal and IP Separation Notes

### ERP Experts Content and Data

ERP Experts article content, service positioning, report data, routes, commercial context and dashboard outputs are site-specific. They should not be copied into a generic platform package or reused for other clients.

### Reusable Platform Architecture

The reusable value is in the workflow design, engine patterns, report schemas, decision logic, safety gates and dashboard framework.

### Generic Engines

When extracting engines, remove or parameterise:

- ERP Experts-specific service names.
- ERP Experts-specific CTA text.
- ERP Experts article titles and slugs.
- ERP Experts domain assumptions.
- Any client-specific ranking or report data.

### Clean-Room Extraction Approach

Recommended approach:

1. Document the platform interfaces.
2. Build generic modules from interfaces rather than by blindly moving scripts.
3. Use ERP Experts only as the first adapter and test tenant.
4. Add a demo tenant with synthetic content to prove generality.
5. Keep client data out of reusable package examples unless explicitly permitted.

This reduces IP leakage risk and makes the eventual product cleaner.

## 11. Recommended Next Implementation Step

The safest next engineering task is to create the tenant contract without changing the working ERP Experts commands.

Recommended first task:

> Add a read-only tenant configuration schema and an ERP Experts tenant config prototype that mirrors current paths, then build a small validation script that confirms the config can locate articles, reports, service paths and output folders without running or changing any SEO engines.

Why this is the right first step:

- It creates the platform boundary.
- It does not move existing files.
- It does not change scoring logic.
- It does not affect the dashboard or routes.
- It makes ERP Experts the first tenant without breaking the current system.
- It gives future engines a stable input contract.

Implemented foundation command:

```bash
npm run platform:tenant -- erp-experts
```

This is read-only and fails clearly if a tenant config is incomplete.

## 12. Tenant Foundation Created

The first platform boundary now exists without changing any current ERP Experts SEO automation commands.

Added:

- `platform/schema/tenant.schema.json` for the generic tenant configuration contract.
- `platform/tenants/erp-experts.config.json` as the first tenant prototype.
- `platform/README.md` to document the extraction boundary.
- `scripts/platform/tenant_loader.mjs` as a read-only tenant loader.
- `npm run platform:tenant -- erp-experts` to inspect and validate the tenant config.

Current limitation:

- Existing engines still read the current ERP Experts paths directly.
- The tenant config is descriptive only for now.
- No article data, report paths, scoring logic or dashboard route has been moved.

Updated recommended next engineering task:

> Make one non-critical engine tenant-aware in parallel mode, probably a read-only summary or monitor helper, then compare its output against the current ERP Experts command before replacing any existing behaviour.

## Non-Goals for the Next Step

Do not start with:

- Moving scripts into `platform/`.
- Rewriting dashboard routing.
- Adding a database.
- Adding multi-user auth.
- Adding billing.
- Creating a live multi-client server.
- Changing article data shape.

Those are later phases once the tenant boundary is proven.
