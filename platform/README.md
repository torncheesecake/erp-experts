# SEO Platform Tenant Foundation

This folder starts the extraction of the ERP Experts SEO automation system into a reusable multi-client platform.

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

`platform/tenants/erp-experts.config.json` describes the current ERP Experts site as the first platform tenant.

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

## Tenant-Aware Monitor

`seo:monitor` is the first SEO engine to read the tenant config.

Default use still targets ERP Experts:

```bash
npm run seo:monitor
```

Explicit tenant use is also supported:

```bash
npm run seo:monitor -- --tenant erp-experts
```

The monitor uses the tenant name, report output path, dashboard route and base URL from `platform/tenants/erp-experts.config.json`. Its scoring, regression and health logic are unchanged.

## Extraction Boundary

Most SEO engines still use their current ERP Experts paths. `seo:monitor` is the first tenant-aware command. The next safe step is to make one more low-risk reporting helper tenant-aware in the same pattern and compare output before replacing broader engine behaviour.
