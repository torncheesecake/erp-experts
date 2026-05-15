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

## Extraction Boundary

Existing SEO engines still use their current ERP Experts paths. The next safe step is to make one non-critical engine tenant-aware in read-only parallel mode and compare output before replacing any current command behaviour.
