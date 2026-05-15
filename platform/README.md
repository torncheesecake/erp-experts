# Sentinel Tenant Foundation

Sentinel is the working name for the SEO/content operations platform. This folder starts the extraction of the ERP Experts SEO automation system into a reusable multi-client platform.

The current implementation is intentionally read-only. It does not move existing scripts, alter scoring logic, change article data, or change the `/seo-roadmap` dashboard.

## Structure

```text
platform/
  schema/
    tenant.schema.json
  tenants/
    erp-experts.config.json
```

## Current Tenant

`platform/tenants/erp-experts.config.json` describes the current ERP Experts site as Sentinel's first tenant.

It defines:

- tenant identity and domain
- article and demand data paths
- service and contact paths
- scoring, opportunity, conversion, freshness and internal-link profiles
- approval safety settings
- current SEO commands

## Loader

Use the read-only loader to validate and inspect a tenant config:

```bash
npm run platform:tenant -- erp-experts
```

The loader prints a summary and validates required fields. It does not mutate source files or generated reports.

## Tenant-Aware Reporting Commands

`seo:autopilot`, `seo:pipeline`, `seo:monitor`, `seo:stats` and `seo:opportunities` read the tenant config.

Default use still targets ERP Experts:

```bash
npm run seo:autopilot
npm run seo:pipeline
npm run seo:monitor
npm run seo:stats
npm run seo:opportunities
```

Explicit tenant use is also supported:

```bash
npm run seo:autopilot -- --tenant erp-experts
npm run seo:pipeline -- --tenant erp-experts
npm run seo:monitor -- --tenant erp-experts
npm run seo:stats -- --tenant erp-experts
npm run seo:opportunities -- --tenant erp-experts
```

These commands use the tenant name, report output path, dashboard route and base URL where relevant from `platform/tenants/erp-experts.config.json`. Their scoring, report generation, regression, consistency, orchestration and health logic are unchanged.

## Extraction Boundary

Most SEO engines still use their current ERP Experts paths. `seo:autopilot`, `seo:pipeline`, `seo:monitor`, `seo:stats` and `seo:opportunities` are tenant-aware at the orchestration/reporting layer. The next safe step is to make one more low-risk intelligence command tenant-aware in the same pattern and compare output before replacing broader engine behaviour.

## Platform Health Check

Use the read-only health check before deployment or server work:

```bash
npm run platform:health
```

The command checks the ERP Experts tenant config, SQLite schema/readiness, report presence, latest QA totals, deployment documentation and ignore policy for local runtime files. It does not initialise, migrate, deploy or edit content.

## Deployment Readiness Scaffold

The Raspberry Pi server readiness scaffold is documentation-first:

- `docs/PINHOLE_SERVER_READINESS_CHECKLIST.md`
- `.env.example`
- `deploy/scripts/check-local.sh`
- `deploy/scripts/check-server.sh`

`check-local.sh` runs local validation. `check-server.sh` performs read-only environment and directory checks. Neither script deploys Sentinel.

## Raspberry Pi Deployment Target

The future deployment target is Matthew's Raspberry Pi server. Current files, commands and folders keep their existing names while Sentinel is extracted gradually. Do not rename commands or routes until a separate migration is planned.
