# Sentinel Basic Auth Setup Guide

This guide is for a future private Raspberry Pi deployment. It is not active in the current app and does not add credentials.

## Rules

- Do not commit credentials.
- Do not commit htpasswd files.
- Generate password hashes on the server.
- Store htpasswd files outside the repo.
- Keep the Sentinel API bound to `127.0.0.1`.
- Protect operator routes before any public exposure.
- Do not protect public stakeholder routes unless the business wants them private too.

## Suggested protected routes

Protect:

- `/seo-roadmap`
- Any future `/sentinel` operator routes.
- Any future private dashboard/API proxy paths.

Do not protect by default:

- `/seo-progress`
- Public ERP Experts pages.
- Public reports intended for stakeholders.

## Example htpasswd generation

On the server, generate a credentials file outside the repo:

```bash
sudo mkdir -p /srv/matthew-platform/security
sudo htpasswd -c /srv/matthew-platform/security/sentinel.htpasswd matthew
```

If `htpasswd` is unavailable, install the relevant Apache utilities package for the server OS. Do not paste the resulting hash into Git.

## Nginx example

The example file is:

```text
deploy/nginx/sentinel-basic-auth.example.conf
```

It is a template only. It contains placeholders and must be adapted on the server.

## API policy

Do not expose the Sentinel API directly yet. Until real auth exists:

- Keep `SENTINEL_API_HOST=127.0.0.1`.
- Let the private dashboard use it locally or through a protected server-side path later.
- Do not create a public `/api/sentinel` route.

## Future direction

Basic auth is only a temporary gate. Sentinel should eventually use app-level authentication, tenant-scoped users, role permissions and audit logs.
