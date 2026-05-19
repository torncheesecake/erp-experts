# Sentinel Standalone Operator App Migration Plan

This document plans the safe migration of the private Sentinel operator frontend out of the ERP Experts website shell and into an Artifexa-owned operator space at `sentinel.artifexa.co.uk`.

The first local prototype now exists at `/sentinel`. It does not deploy `sentinel.artifexa.co.uk`, change DNS, expose the Raspberry Pi API, remove `/seo-progress`, change the production `/seo-roadmap` redirect or alter stakeholder behaviour. The prototype now treats Content Workbench as the default operator surface and keeps its browser session state separate from `/seo-roadmap`.

## Goal

Sentinel has grown from a reporting dashboard into an operational platform with content workflow, activity, pipelines, governance, feedback, backup and diagnostics. Keeping that private operator interface inside the ERP Experts public website shell is useful for early local development, but it is not the right long-term ownership boundary.

The target model is:

- `erpexperts.co.uk/seo-progress`: stakeholder-safe SEO and content progress page for ERP Experts.
- `sentinel.artifexa.co.uk`: private Sentinel operator frontend owned by Artifexa and controlled by Matthew's Sentinel authority.

The operator frontend should become a Sentinel product surface, not a hidden section of a client website.

## Why Move The Operator UI

Moving the operator UI out of the ERP Experts shell gives clearer separation:

- Ownership: Sentinel platform logic and operator workflow belong with Matthew's infrastructure and Artifexa, not with the client website shell.
- Security: operator controls, pipelines, actions, roadmap plans and diagnostics should not be bundled into a public client site as fully usable functionality.
- Product clarity: Sentinel can develop its own app structure, branding, navigation and auth without being constrained by ERP Experts public chrome.
- Tenant readiness: ERP Experts remains the first active tenant, while Sentinel can later support additional clients without each client website hosting the operator app.
- Deployment safety: stakeholder views can stay static and public, while operator controls can depend on remote authority, private API access and stronger auth.

## Ownership Model

Sentinel is Artifexa-owned operational software. ERP Experts is the first active tenant and receives stakeholder-safe outputs.

Ownership boundaries:

- Artifexa/Sentinel owns the operator app, runtime API, orchestration logic, persistence model, backup flow and governance system.
- Matthew controls the Raspberry Pi or future server that acts as Sentinel authority.
- ERP Experts keeps public pages, stakeholder-safe reporting and tenant-specific content outputs.
- ERP Experts branding appears in Sentinel only as tenant context, not as global operator app chrome.

## Target Route And Domain Structure

### ERP Experts Public Site

```text
https://erpexperts.co.uk/seo-progress
```

Purpose:

- stakeholder progress view
- plain-English SEO and content status
- no Sentinel/operator/internal wording
- no commands, diagnostics, approvals, pipelines, API state or database state

Existing related route:

```text
https://erpexperts.co.uk/reports
```

This should continue to point stakeholders towards `/seo-progress`.

### Sentinel Operator App

```text
https://sentinel.artifexa.co.uk/
```

Purpose:

- private Sentinel operator frontend
- Artifexa/Sentinel branding
- Content Workbench as primary editorial workflow
- controlled actions, pipelines, cadence, roadmap intelligence, feedback, backups and diagnostics
- tenant context showing ERP Experts as first active tenant
- auth-gated before serious or public use

Local prototype route:

```text
http://localhost:5173/sentinel
```

The prototype reuses the existing Control Centre systems but renders outside the ERP Experts website layout, with Sentinel by Artifexa branding and no ERP Experts public header or footer. It opens into a standalone operator frame that highlights the active tenant, runtime source and private access state before the detailed platform panels.

For local Pi-backed testing, use `docs/SENTINEL_LOCAL_OPERATOR_LAUNCH.md`. The workflow keeps the Pi API private by using an SSH tunnel from local port `4317` to the Pi's `127.0.0.1:4317`, then starts Vite with `VITE_SENTINEL_API_BASE_URL=http://127.0.0.1:4317`. `npm run sentinel:launch -- --tunnel` can start that tunnel in the foreground when explicitly requested.

### Existing `/seo-roadmap`

Current production behaviour should remain safe:

- production `/seo-roadmap` continues to redirect or stay protected until the standalone app and auth gate are ready
- local `/seo-roadmap` can continue as the development route during the transition
- later, `/seo-roadmap` can redirect to `sentinel.artifexa.co.uk` or be retired from the ERP Experts build

## What Stays On ERP Experts

ERP Experts should keep:

- `/seo-progress`
- `/reports` link to stakeholder progress
- published ERP Experts content and resources
- stakeholder-safe content health summaries
- tenant-specific public web pages

ERP Experts should not expose:

- Sentinel Control Centre
- Content Workbench internals
- operator actions or pipelines
- action history or activity feed
- roadmap governance, approvals, briefs or work packages
- diagnostics, API status, database state or Pi runtime details
- operator tokens, authority state or auth errors

## What Moves To Artifexa/Sentinel

The standalone Sentinel app should own:

- Control Centre app shell
- Content Workbench
- Activity Feed
- Operator Console
- Execution Pipelines
- Cadence and notification operations
- Tenant registry preview and future tenant switcher
- Feedback capture and triage
- Roadmap intelligence and implementation governance
- Pi runtime and backup diagnostics
- Authority state and future login/session UI

## Proposed App Split

### Option A: Same Repo, Separate Build Mode

Keep the ERP Experts public website and Sentinel operator app in the same repository, but build them as separate frontend targets.

Possible shape:

```text
src/apps/erp-site/
src/apps/sentinel-operator/
src/pages/SeoProgress.jsx
src/pages/SeoRoadmap.jsx or src/apps/sentinel-operator/SentinelApp.jsx
```

Build outputs:

```text
dist/erp-site
Dist for erpexperts.co.uk

/dist/sentinel-operator
Dist for sentinel.artifexa.co.uk
```

Benefits:

- fastest path
- keeps current components and reports available
- avoids premature repo extraction
- easier to preserve `/seo-progress` while extracting operator chrome
- lower deployment risk

Costs:

- repo remains mixed for a while
- build config needs careful route and environment separation
- discipline needed so stakeholder pages do not import operator-only modules

### Option B: Separate Sentinel Repo/App Later

Extract Sentinel into its own repository and application once the standalone app shell, auth model and deployment target are stable.

Benefits:

- cleaner product boundary
- clearer release process
- easier future multi-tenant productisation
- less risk of operator code entering the ERP Experts public bundle

Costs:

- more setup
- duplicated config during transition
- migration cost for shared data, docs and scripts
- harder to move quickly while the product shape is still evolving

### Recommendation

Start with Option A: same repo, separate build mode.

This gives the safest short-term migration because the current app, docs, reports, Pi deployment scripts and stakeholder page already live in one repository. Once `sentinel.artifexa.co.uk` has a working standalone shell, authority gate and deployment process, extract to a separate Sentinel repository only if the boundary is stable enough to justify it.

## Current Prototype

The first standalone operator shell prototype is implemented as a development-only route:

```text
/sentinel
```

Prototype behaviour:

- renders outside the ERP Experts `Layout`, so it does not show the ERP Experts public navbar, footer or marketing navigation
- reuses the current Control Centre, Content Workbench, Activity Feed, Operator Console, Workspaces, Authority State, Execution Pipelines and governance panels
- applies Sentinel by Artifexa header treatment, a darker standalone shell frame and a concise operator context strip
- defaults to Content Workbench via the standalone browser session key `sentinel.operatorSession.standalone.v1`
- can be launched locally against the Pi-backed API through the documented SSH tunnel workflow
- shows ERP Experts only as active tenant context
- mirrors the existing `/seo-roadmap` production guard by redirecting to `/seo-progress` in production builds

This is still a prototype. It is not a separate build target yet and it has not been deployed to `sentinel.artifexa.co.uk`.

## Standalone UX Direction

The `/sentinel` prototype now has a dedicated design direction that is separate from the ERP Experts website shell and the legacy `/seo-roadmap` dashboard layout.

Design principles:

- Content Workbench is the dominant operating surface.
- Infrastructure, diagnostics, pipelines, cadence and governance are support systems rather than the first visual priority.
- The top rail is compact and status-led, showing health, authority, runtime and cadence without large dashboard cards.
- Navigation is calmer and workbench-first, with Content Workbench, Inbox and Opportunities ahead of infrastructure sections.
- The layout uses a wider dark workspace, subtle depth, slimmer rails and fewer equal-weight boxes.
- The standalone shell now uses the full viewport width with CSS grid and flexbox. The Workbench is no longer constrained to a large centred dashboard box.
- ERP Experts remains visible only as active tenant context, not as app branding.
- A code-native Sentinel mark now anchors the header and workspace surface, replacing generic icon treatment.
- The first viewport is a command surface with live editorial queue rows and lifecycle lanes, not a boxed admin hero.
- The latest interaction pass reduces the hero treatment further into a compact work-next strip so the Content Workbench itself becomes the main surface.
- Content items behave as focused editorial work cards with a persistent working panel for rationale, goal, next action, status and safe helpers.
- Workflow actions now sit above raw commands. The operator chooses tasks such as start research, generate brief, move to review or refresh monitoring, while manual commands remain collapsed for advanced use.
- The operator journey is now artefact-led rather than command-led. Research, Brief, Package, Review and Monitoring outputs appear as reviewable Workbench surfaces with guided next-step recommendations.
- The first content artefact system is browser-local under `sentinel.contentArtefacts.v1`. Start research creates a research document, Generate brief creates an editorial brief, and the standalone shell shows the active artefact in a central document workspace.
- The editorial workspace now supports browser-local review notes under `sentinel.reviewNotes.v1`, plus persistent next-step guidance beside the active artefact. This keeps `/sentinel` moving toward an editorial operations tool rather than a command dashboard.
- The unified design system is dark-first. It uses deep navy and graphite shell surfaces, softer elevated work surfaces, cyan as the primary accent, and muted green, amber and red only for semantic state.
- Bright white slabs have been removed from the standalone Workbench. Queue lanes, cards, filters, recent outputs and the working panel now share one operational surface language.
- Infrastructure context is deliberately quieter. The top rail now presents Healthy, Private, Connected and Operational state before implementation detail.

This design pass does not remove operator functionality, change scoring, deploy the standalone app or expose the Pi API. It is a same-repo layout and hierarchy refactor for local operator use.

## Branding Plan

The standalone app should use Sentinel and Artifexa identity:

- product name: Sentinel
- owner identity: Artifexa
- domain: `sentinel.artifexa.co.uk`
- tenant context: ERP Experts as first active tenant

Planned UI changes:

- remove ERP Experts public header, footer, phone number and marketing navigation from the operator app
- use a Sentinel-first app header
- show ERP Experts only inside tenant context panels
- keep stakeholder language and ERP Experts public branding on `/seo-progress`
- keep operator language out of the stakeholder route

## Nginx And Domain Plan

Future target:

```text
sentinel.artifexa.co.uk
```

Planned shape:

- dedicated Nginx vhost for `sentinel.artifexa.co.uk`
- HTTPS certificate for `sentinel.artifexa.co.uk`
- static standalone frontend served from a separate dist directory
- no ERP Experts public chrome in the Sentinel frontend
- Pi API remains bound to `127.0.0.1:4317`
- reverse proxy to API only after auth and transport rules are implemented
- no public API before auth enforcement

Potential filesystem layout on the Pi:

```text
/srv/sentinel/apps/seo-ops
/srv/sentinel/apps/operator-frontend
/srv/sentinel/data/seo-ops
/srv/sentinel/logs/seo-ops
```

The exact layout should be confirmed in a later deployment plan. The key rule is that static frontend files and runtime data remain separate.

## API And Auth Requirements Before Public Exposure

Before `sentinel.artifexa.co.uk` becomes a serious operator surface, Sentinel needs a stronger authority path.

Minimum requirements:

- `SENTINEL_AUTHORITY_MODE=enabled` on the Pi API or successor service
- operator token stored only on Matthew-controlled infrastructure or secure local operator config
- frontend authority check before enabling mutation controls
- mutation endpoints remain protected, including actions, pipelines, feedback triage and future content workflow mutations
- API must not leak secrets or internal filesystem paths
- failed authority check must lock or disable operator controls

Preferred later requirements:

- proper login
- short-lived sessions
- role-based access
- tenant-scoped permissions
- audit log for controlled actions and approvals
- explicit production route guard tests

## Deployment Phases

### Phase 0: Planning Baseline

Current step.

- document target architecture
- keep `/seo-progress` unchanged
- keep `/seo-roadmap` production redirect unchanged
- keep Pi API localhost-only
- no DNS or deployment changes

### Phase 1: Standalone Build Scaffold

Started locally with the `/sentinel` prototype route.

- add a separate Sentinel operator app entry point
- create a Sentinel app shell without ERP Experts public chrome
- reuse Control Centre sections inside the new shell
- keep `/seo-roadmap` local route working during transition
- add build command for Sentinel operator frontend
- validate that `/seo-progress` remains stakeholder-safe

Remaining Phase 1 work:

- split a true standalone build output for the operator app
- decide final source folder boundaries
- add route/domain-aware environment defaults
- keep production exposure blocked until authority is ready

### Phase 2: Local Preview And Static Deploy Dry Run

Planned future implementation.

- build standalone operator dist locally
- preview on local dev host
- verify Artifexa/Sentinel branding
- verify no ERP Experts public header/footer in operator app
- verify `/seo-progress` still builds separately
- produce deployment dry-run for Pi static frontend path

### Phase 3: Auth-Gated Pi Preview

Planned future implementation.

- enable authority requirements in a controlled environment
- verify operator controls disable when authority is missing
- verify authorised local operator flow
- keep API localhost-only unless reverse proxy and auth are explicitly approved

### Phase 4: Domain Deployment

Planned future implementation.

- configure `sentinel.artifexa.co.uk` vhost
- install or verify HTTPS certificate
- deploy static operator frontend
- keep API protected behind auth-aware reverse proxy only if approved
- verify live stakeholder and operator boundaries

### Phase 5: Route Retirement Or Redirect

Planned future implementation.

- decide whether `/seo-roadmap` redirects to `sentinel.artifexa.co.uk`
- or remove operator route from ERP Experts production build entirely
- keep local development route only if still useful

## Risks

Key risks:

- accidentally exposing operator controls in the ERP Experts public bundle
- exposing the Pi API before auth is ready
- confusing tenant branding with product ownership
- splitting the app before the operator workflow stabilises
- breaking `/seo-progress` while separating the operator shell
- creating two deployment targets without clear rollback

Mitigations:

- keep this step docs-only
- start with same repo and separate build mode
- keep `/seo-roadmap` production redirect until replacement is verified
- keep `/seo-progress` stakeholder-safe and independently validated
- keep API bound to localhost until authority is enforced
- make DNS, Nginx and service exposure separate approved tasks

## Rollback Plan

For early phases:

- keep existing `/seo-roadmap` local development route intact
- keep `/seo-progress` unchanged on ERP Experts
- do not remove ERP Experts production redirect until standalone app is verified
- if standalone build fails, continue using local `/seo-roadmap`
- if domain deployment fails later, remove or disable the `sentinel.artifexa.co.uk` vhost and keep Pi API localhost-only

No rollback is required for this planning step because it changes documentation only.

## Non-Goals For This Plan

This plan does not:

- deploy `sentinel.artifexa.co.uk`
- change DNS
- expose the Pi API
- enable remote auth
- add login or user accounts
- remove `/seo-roadmap`
- change `/seo-progress`
- change SEO scoring
- move files into a separate repository
- install Nginx vhosts or certificates

## Recommended Next Step

Create a future work package for Phase 1: same repo, separate Sentinel operator build mode.

That implementation should introduce a standalone Sentinel app shell without ERP Experts chrome, keep `/seo-progress` in the ERP Experts build, preserve `/seo-roadmap` production safety, and avoid API exposure until the authority gate is ready.

## Draft Workspace Update

The standalone `/sentinel` shell now includes the first Draft Workspace layer. This reinforces the target product direction for `sentinel.artifexa.co.uk`: a private editorial operations application rather than an infrastructure dashboard.

Drafts are editable local artefacts with edit, preview and review modes. ERP Experts remains the active tenant context only. Drafting and review stay inside the private operator shell and are not exposed on the stakeholder ERP Experts site.
