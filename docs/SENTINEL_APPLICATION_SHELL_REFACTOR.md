# Sentinel Application Shell Refactor

Sentinel is now treated as the host operator application, not as a page inside the ERP Experts marketing website.

## Purpose

The standalone `/sentinel` route is the local prototype for the future `sentinel.artifexa.co.uk` operator app. It keeps the operator experience separate from ERP Experts public website chrome so editorial work, workflow actions, artefacts, drafts and controlled operations feel like one private product surface.

## Surface Separation

- `/seo-progress` remains the stakeholder-safe ERP Experts progress page.
- `/seo-roadmap` remains the legacy embedded compatibility surface for local operator use.
- `/sentinel` is the primary standalone Sentinel operator workspace.
- Production builds still protect `/sentinel` and `/seo-roadmap` by redirecting to `/seo-progress`.

## Tenant Model

ERP Experts is now presented only as active tenant context inside Sentinel. It is not the app brand, shell brand, navigation brand or host product.

Sentinel is the application brand.

Artifexa is the owner/operator context.

## Shell Direction

The standalone shell uses:

- a compact Sentinel product header
- a persistent app navigation rail
- fluid full-width layout gutters
- dark-first operational surfaces
- docked editorial workspace panels
- Content Workbench as the default primary work surface
- infrastructure and diagnostics as secondary support areas

The shell intentionally avoids:

- ERP Experts marketing navigation
- ERP Experts footer or CTA chrome
- centred website page containers
- large landing-page hero treatment
- bright white dashboard slabs as the dominant pattern

## Navigation Direction

The standalone navigation is workbench-first:

- Workbench
- Queue
- Planning
- Command
- Operations
- Rhythm
- Runtime
- Tenant
- Settings

The labels are product/application labels rather than website section labels. Underlying Control Centre systems are preserved, but infrastructure does not lead the operator journey.

## Layout Model

Desktop layout should feel like operational software:

- full viewport width
- CSS grid for shell navigation and workspace
- flex/grid panels inside the Workbench
- document/work surfaces in the centre
- action and context panels to the side

Tablet and mobile layouts collapse gracefully, but the primary design target remains a private desktop operator workspace.

## Security Boundary

This refactor does not expose Sentinel publicly, change DNS, expose the Raspberry Pi API, enable auth, enable timers or deploy `sentinel.artifexa.co.uk`.

The Raspberry Pi API remains localhost-only. Remote authority/auth remains the expected next hardening step before public operator exposure.

## Next Steps

- Keep evolving `/sentinel` as the primary operator UX.
- Freeze `/seo-roadmap` as compatibility unless a safety fix is required.
- Add a separate build/deploy mode before serving `sentinel.artifexa.co.uk`.
- Enable remote authority authentication before exposing any operator route publicly.
