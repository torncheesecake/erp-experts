# Sentinel Access Control Plan

This plan prepares Sentinel for private operator access. It does not enable public access, add credentials, change the production route guard or alter local development behaviour.

## Current state

- `/seo-roadmap` is the private Sentinel operator dashboard.
- Production builds redirect `/seo-roadmap` to `/seo-progress` until real authentication exists.
- `/seo-progress` is stakeholder-safe and does not expose commands, prompts, approvals, diagnostics or tenant state.
- The Sentinel API binds to `127.0.0.1` by default and is read-only.
- The Raspberry Pi service scaffold is inactive and must not be enabled until access controls are ready.

## Short-term access model

The safest short-term model is server-layer protection:

- Keep the Sentinel API bound to `127.0.0.1`.
- Put basic auth at the reverse proxy for operator-facing routes.
- Protect `/seo-roadmap` before any public exposure.
- Keep `/seo-progress` public or stakeholder-visible as required.
- Store htpasswd files outside the repo.
- Do not commit credentials or generated password hashes.

This keeps the working local dashboard untouched while creating a clear deployment path.

## Medium-term access model

Move from proxy-only protection to app-level authentication when Sentinel becomes a real multi-client product.

Suggested roles:

- `owner/operator`: full access to Sentinel state, plans, approvals and execution prompts.
- `reviewer`: can view plans, briefs and proposed work, but cannot approve execution.
- `stakeholder`: can view progress summaries only.
- `tenant_admin`: can manage tenant settings, users and service mappings.

## Long-term access model

For a reusable platform, Sentinel should eventually support:

- Tenant-scoped users.
- Tenant-scoped roles and permissions.
- Audit logs for approvals, status changes and execution actions.
- Approval permissions for plan stages.
- Separate public stakeholder views.
- Billing and subscription state.
- Revocable sessions and proper password reset flows.

## Route policy

- `/seo-progress`: stakeholder-safe.
- `/seo-roadmap`: operator-only.
- Local API `/state`: private operator state.
- API exposure through a public reverse proxy: blocked until auth exists.

## Recommended next step

Keep this as scaffold only. The next safe implementation step is to test a local reverse proxy basic auth config against a non-public development host, using an htpasswd file generated on the server and stored outside the repo.
