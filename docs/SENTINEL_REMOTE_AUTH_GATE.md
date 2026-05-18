# Sentinel Remote Authority Gate

This document describes the first Sentinel remote authority gate. It is not a full login system and it does not expose the API publicly.

## Purpose

Sentinel operator controls should eventually require Matthew-authorised API access before they unlock. This first layer makes the API and Control Centre aware of that authority boundary while keeping local development usable.

The goal is:

- frontend must prove authority before running operator mutations
- API validates authority server-side
- stakeholder views remain unaffected
- no user accounts or login flows yet

## Current Mode

Default mode is disabled:

```bash
SENTINEL_AUTHORITY_MODE=disabled
SENTINEL_AUTHORITY_LOCAL_BYPASS=true
```

In this mode, local operator actions continue to work as before. The Control Centre shows `local_bypass` in the Authority State panel.

## API Behaviour

The API exposes:

```http
GET /authority/status
```

It returns non-secret status only:

```json
{
  "mode": "disabled",
  "localBypass": true,
  "authorityVerified": false,
  "state": "local_bypass"
}
```

Protected mutation endpoints are:

- `POST /action`
- `POST /pipeline/run`
- `POST /feedback`
- `POST /feedback/triage`

Read-only endpoints remain available locally, including `/health`, `/state`, `/tenant`, `/activity`, `/actions/history` and `/pipelines`.

## Token Header

When authority is enabled later, the API expects the operator token in:

```http
X-Sentinel-Operator-Token: <token>
```

The expected token is read only from the API runtime environment:

```bash
SENTINEL_OPERATOR_TOKEN=
```

No token is committed to Git. No token value is returned from `/authority/status`.

## Frontend Behaviour

The private `/seo-roadmap` Control Centre reads `/authority/status` and shows one of these states:

- `local_bypass`
- `authority_required`
- `authority_verified`
- `authority_failed`

If authority is required and not verified, controlled action and pipeline Run buttons are disabled. There is no login form yet.

Do not put real production secrets in `VITE_` variables. Vite variables are bundled into frontend assets and are placeholders only at this stage.

## Non-Goals

This step does not add:

- public API exposure
- reverse proxy access
- username/password login
- user accounts
- sessions
- role-based access
- timer enablement
- deployment changes

## Stakeholder Separation

`/seo-progress` remains stakeholder-safe and does not use the authority gate. The production `/seo-roadmap` route remains protected separately and must not expose operator controls publicly.

## Next Steps

Before any public or remote operator access exists:

1. Keep the Pi API bound to `127.0.0.1`.
2. Add a private transport or reverse proxy only after auth is ready.
3. Replace placeholder token handling with a proper session/login model.
4. Add role and tenant-scoped permissions.
5. Add audit logging for approvals, actions and pipeline runs.
