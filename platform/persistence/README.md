# Platform Persistence Foundation

This directory contains the first local persistence layer for the SEO platform extraction.

It is intentionally small and SQLite-based.

## Files

- `schema.sql` defines the initial platform tables.
- `db.js` provides a minimal Node wrapper around the local `sqlite3` CLI.
- `platform.db` is the local runtime database and must not be committed.
- `migrations/` is reserved for future schema migrations.

## Current Scope

The database is not yet the primary runtime source of truth. Existing JSON reports continue to power the current SEO automation and dashboard.

Current persisted state:

- tenants
- monitor snapshots

The first dual-write is from `seo:monitor`, which writes one snapshot row after a successful monitor run. If the database write fails, monitor prints a warning and still succeeds.

## Commands

Initialise the database:

```bash
npm run platform:init
```

Inspect database status:

```bash
npm run platform:status
```

## Policy

Do not commit `platform.db`, WAL files or SHM files. This is local operational state.
