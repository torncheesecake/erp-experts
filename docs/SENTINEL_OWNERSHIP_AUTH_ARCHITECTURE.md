# Sentinel Ownership and Remote Auth Architecture

This document defines the intended ownership and remote-authority model for Sentinel. It is architecture planning only. It does not implement auth, add secrets, expose the API or change local development behaviour.

## 1. Ownership Principle

Sentinel platform logic belongs with Matthew's infrastructure.

ERP Experts can receive stakeholder-safe reporting views and published outputs, but operator orchestration should depend on a Matthew-controlled Sentinel authority. The private operational layer should not become fully functional client-side code on a public website without a live authority check.

Ownership boundaries:

- Matthew owns the Sentinel platform runtime, SQLite state, API authority, orchestration logic and operational data.
- ERP Experts can expose stakeholder-safe views such as `/seo-progress`.
- Operator controls, action execution, pipeline orchestration, approvals and operational state should require Matthew-controlled Sentinel API authority before any production exposure.
- The platform should remain portable so the same Sentinel foundation can later support other tenants without embedding control logic into a client site.

## 2. Surfaces

### `/seo-progress`

Stakeholder-safe, client-visible SEO and content progress view.

It should remain useful without the Sentinel API. It must not expose commands, prompts, approvals, database state, tenant internals, diagnostics, action controls, pipelines or operator history.

### `/seo-roadmap`

Private operator Control Centre.

Today it works locally for Matthew and production builds redirect it to `/seo-progress`. In the future, the page should only unlock operator controls when it can authenticate against Matthew's Sentinel API/server.

### Sentinel API

Private authority and key source for operator access.

The API should remain local-only or privately reachable until auth exists. It should validate operator tokens, expose authorised state and mediate controlled actions, pipelines and future governance operations.

### Raspberry Pi

Private runtime/control node.

The Raspberry Pi, or another Matthew-controlled server, is the intended future home for the managed Sentinel API service, SQLite persistence, backups, cadence jobs and operational reports.

## 3. Proposed Auth Model

### Phase 1: Current Local Scaffold

- Local-only API binds to `127.0.0.1` by default.
- Production `/seo-roadmap` remains guarded by redirect.
- Manual environment config points local experiments at the API.
- No runtime auth is active.
- No secrets are committed.

### Phase 2: Remote Authority Handshake

- Frontend checks `VITE_SENTINEL_REQUIRE_REMOTE_AUTH`.
- Frontend reads `VITE_SENTINEL_API_BASE_URL` only when configured.
- Frontend sends an operator token to the Sentinel API.
- API validates the token against server-side configuration.
- Operator controls unlock only when the API returns an authorised response.
- If the handshake fails, `/seo-roadmap` stays locked or read-only.

The token should never be committed. Server-side secrets should live in the Raspberry Pi `.env` or another Matthew-controlled secret store outside Git.

### Phase 3: Proper Login and Roles

- App-level login.
- Session tokens with expiry and revocation.
- Role-based access.
- Tenant-scoped permissions.
- Audit logs for approvals, actions, pipeline runs and status changes.

Suggested future roles:

- `owner_operator`: full Matthew-controlled Sentinel access.
- `reviewer`: can inspect proposed work but cannot run actions.
- `stakeholder`: can view business-safe progress only.
- `tenant_admin`: future tenant settings and user management.

## 4. Failure Modes

Expected safe behaviour:

- API unavailable: operator dashboard locked or read-only. Stakeholder `/seo-progress` still works.
- Invalid token: no operator controls, actions, pipelines or diagnostics unlock.
- Raspberry Pi offline: Sentinel operator system is unavailable until the private authority returns.
- ERP site public route: only stakeholder-safe `/seo-progress` should remain visible.
- Production `/seo-roadmap`: remains redirected or locked until real auth exists.

Failure should degrade to safety, not partial operator access.

## 5. IP and Ownership Protection

Sentinel should keep operational control outside the public ERP Experts website.

Rules:

- Keep `platform.db` outside Git and outside the public web root.
- Keep runtime API, cadence jobs, backups and generated operational data on Matthew-controlled infrastructure.
- Do not commit API tokens, operator passwords, htpasswd files, `.env` files or generated secrets.
- Do not make production `/seo-roadmap` expose operator controls without auth.
- Do not embed fully functional action or pipeline control in public-site code unless it is locked behind the Matthew-controlled Sentinel API authority.
- Keep stakeholder outputs separate from operator state.
- Keep Sentinel portable across future tenants.

## 6. Future Deployment Model

Target model:

- Raspberry Pi or another Matthew-controlled server runs the Sentinel API.
- API remains private or protected behind a strict reverse proxy.
- Client websites receive stakeholder-safe outputs only.
- Operator dashboard connects to the Sentinel API only when configured and authorised.
- Controlled actions, execution pipelines, cadence, approvals and operational reports remain governed by Matthew-controlled infrastructure.
- Future tenant dashboards should authenticate against Sentinel rather than becoming standalone public control panels.

## Implemented First Gate

The first authority gate layer now exists in the local Sentinel API and private Control Centre. The API exposes `GET /authority/status`, reads any expected operator token from `SENTINEL_OPERATOR_TOKEN`, and protects mutation endpoints when `SENTINEL_AUTHORITY_MODE=enabled`. The default remains disabled with local bypass for development. This is not a login system and it does not expose the API publicly.

## Non-Goals For This Step

This document does not implement:

- login
- bearer tokens
- basic auth enforcement
- public API exposure
- route unlocking
- dashboard blocking
- Raspberry Pi deployment
- secret management

Those should be separate implementation steps with tests, rollback notes and explicit approval.
