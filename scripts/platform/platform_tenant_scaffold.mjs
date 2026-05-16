import fs from "node:fs";
import path from "node:path";
import { REQUIRED_TENANT_FIELDS, repoRoot, tenantsDir } from "./tenant_config.mjs";

const registryPath = path.join(tenantsDir, "tenant-registry.json");
const allowedStatuses = new Set(["draft", "active", "archived", "example_disabled"]);

function usage() {
  return [
    "Usage:",
    "  npm run platform:tenant:scaffold -- --tenant-id <id> --name <name> --domain <domain> --base-url <url> [--write]",
    "",
    "Required:",
    "  --tenant-id     Lowercase slug, e.g. demo-client",
    "  --name          Tenant display name",
    "  --domain        Tenant domain, e.g. demo.example.com",
    "  --base-url      Absolute URL, e.g. https://demo.example.com",
    "",
    "Optional:",
    "  --market        Default: UK",
    "  --locale        Default: en-GB",
    "  --industry      Default: To be configured",
    "  --status        draft | active | archived | example_disabled. Default: draft",
    "  --write         Write the tenant config and registry entry",
    "  --allow-active  Required if --status active is requested",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      throw new Error(`Unexpected argument: ${item}`);
    }

    const key = item.slice(2);
    if (["write", "allow-active", "help"].includes(key)) {
      args[key] = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    index += 1;
  }
  return args;
}

function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function relative(filePath) {
  return path.relative(repoRoot, filePath);
}

function validateInput(args, configPath, registry) {
  const errors = [];
  const tenantId = args["tenant-id"];
  const required = ["tenant-id", "name", "domain", "base-url"];

  required.forEach((key) => {
    if (!args[key] || !String(args[key]).trim()) {
      errors.push(`Missing required argument: --${key}`);
    }
  });

  if (tenantId && !/^[a-z0-9][a-z0-9-]*$/.test(tenantId)) {
    errors.push("--tenant-id must use lowercase letters, numbers and hyphens only");
  }

  if (args["base-url"] && !/^https?:\/\//.test(args["base-url"])) {
    errors.push("--base-url must be an absolute http(s) URL");
  }

  const status = args.status || "draft";
  if (!allowedStatuses.has(status)) {
    errors.push(`--status must be one of: ${Array.from(allowedStatuses).join(", ")}`);
  }

  if (status === "active" && !args["allow-active"]) {
    errors.push("Refusing to scaffold an active tenant unless --allow-active is passed");
  }

  if (fs.existsSync(configPath)) {
    errors.push(`Tenant config already exists: ${relative(configPath)}`);
  }

  const registryTenants = Array.isArray(registry.tenants) ? registry.tenants : [];
  if (registryTenants.some((tenant) => tenant.tenantId === tenantId)) {
    errors.push(`Tenant registry already includes: ${tenantId}`);
  }

  return errors;
}

function validateGeneratedConfigShape(config) {
  return REQUIRED_TENANT_FIELDS
    .filter((field) => config[field] === undefined || config[field] === null || config[field] === "")
    .map((field) => `Generated config is missing required field: ${field}`);
}

function buildTenantConfig({ tenantId, name, domain, baseUrl, market, locale, industry }) {
  const articleDataPath = `clients/${tenantId}/articles.js`;
  const reportingPath = `clients/${tenantId}/reports.json`;
  const reportOutputPath = `reports/tenants/${tenantId}/`;

  return {
    tenantId,
    name,
    brandName: name,
    domain,
    baseUrl,
    locale,
    market,
    industry,
    primaryServices: ["To be configured"],
    servicePaths: {
      primary: {
        path: "/services",
        label: "Primary services",
        intent: "Configure tenant-specific service intent before activation",
      },
      contact: {
        path: "/contact",
        label: "Contact",
        intent: "Configure tenant-specific enquiry path before activation",
      },
    },
    contactPaths: {
      primary: {
        path: "/contact",
        label: `Contact ${name}`,
        intent: "Primary enquiry path",
      },
    },
    contentSources: [
      {
        id: "resource-articles",
        type: "tenant-content-source",
        path: articleDataPath,
        routeBase: "/resources",
        description: "Draft tenant article source placeholder. Create this source before activation.",
      },
      {
        id: "reporting-demand",
        type: "tenant-reporting-source",
        path: reportingPath,
        description: "Draft tenant reporting and demand source placeholder. Create this source before activation.",
      },
    ],
    articleDataPath,
    reportOutputPath,
    publicReportPaths: {
      dashboardRoute: "/seo-roadmap",
      stakeholderRoute: "/seo-progress",
    },
    dashboardRoute: "/seo-roadmap",
    scoringProfile: {
      commercialTopics: [],
      genericInformationalPenalty: true,
      requiresPublishedAt: true,
    },
    opportunityProfile: {
      preferredMarketTerms: [market],
      priorityServices: [],
      avoidDuplicateIntent: true,
    },
    conversionProfile: {
      preferredCtaTargets: ["/contact"],
      highIntentTopics: [],
      awarenessTopicsNeedSoftCta: true,
    },
    freshnessProfile: {
      fastMovingTopics: [],
      reviewOlderThanMonths: 18,
      requiresPublishedAt: true,
    },
    internalLinkProfile: {
      resourceBasePath: "/resources",
      serviceTargets: ["/services", "/contact"],
      avoidOverLinking: true,
    },
    approvalProfile: {
      reviewFirst: true,
      allowAutoPublish: false,
      allowAutoCommit: false,
      requiresHumanReviewForHighRisk: true,
    },
    commands: {
      pipeline: `npm run seo:pipeline -- --tenant ${tenantId}`,
      monitor: `npm run seo:monitor -- --tenant ${tenantId}`,
      autopilot: `npm run seo:autopilot -- --tenant ${tenantId}`,
      opportunities: `npm run seo:opportunities -- --tenant ${tenantId}`,
      dashboard: "/seo-roadmap",
    },
    notes: [
      "Draft tenant scaffold only. Do not activate until content sources, service paths, CTA map, reports and scoring profile have been reviewed.",
      "No reports are generated by the scaffold command.",
      "Generated from scripts/platform/platform_tenant_scaffold.mjs.",
    ],
  };
}

function buildRegistryEntry({ tenantId, name, status, baseUrl }) {
  return {
    tenantId,
    name,
    status,
    dashboardRoute: "/seo-roadmap",
    stakeholderRoute: "/seo-progress",
    baseUrl,
    notes: [
      status === "active" ? "Active tenant scaffold created with explicit allow-active flag." : "Draft tenant scaffold. Not active.",
      "Configure tenant sources and validate before activation.",
    ],
  };
}

function printScaffold({ tenantConfig, registryEntry, configPath, write }) {
  console.log("Sentinel Tenant Scaffold");
  console.log("");
  console.log(`Tenant: ${tenantConfig.name} (${tenantConfig.tenantId})`);
  console.log(`Status: ${registryEntry.status}`);
  console.log(`Mode: ${write ? "write" : "dry run"}`);
  console.log(`Proposed config path: ${relative(configPath)}`);
  console.log("");
  console.log("Proposed registry entry:");
  console.log(JSON.stringify(registryEntry, null, 2));
  console.log("");
  if (write) {
    console.log("Files written:");
    console.log(`  - ${relative(configPath)}`);
    console.log(`  - ${relative(registryPath)}`);
  } else {
    console.log("No files written. Re-run with --write to create the draft tenant files.");
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }

  const tenantId = args["tenant-id"];
  const name = args.name;
  const domain = args.domain;
  const baseUrl = args["base-url"];
  const market = args.market || "UK";
  const locale = args.locale || "en-GB";
  const industry = args.industry || "To be configured";
  const status = args.status || "draft";
  const configPath = path.join(tenantsDir, `${tenantId}.config.json`);
  const registry = readJsonIfExists(registryPath, { defaultTenantId: "erp-experts", tenants: [] });
  const errors = validateInput(args, configPath, registry);

  if (errors.length > 0) {
    console.error("Tenant scaffold error:");
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error("");
    console.error(usage());
    process.exitCode = 1;
  } else {
    const tenantConfig = buildTenantConfig({ tenantId, name, domain, baseUrl, market, locale, industry });
    const registryEntry = buildRegistryEntry({ tenantId, name, status, baseUrl });
    const generatedErrors = validateGeneratedConfigShape(tenantConfig);

    if (generatedErrors.length > 0) {
      console.error("Tenant scaffold error:");
      generatedErrors.forEach((error) => console.error(`  - ${error}`));
      process.exitCode = 1;
    } else {
      if (args.write) {
        fs.mkdirSync(tenantsDir, { recursive: true });
        fs.writeFileSync(configPath, `${JSON.stringify(tenantConfig, null, 2)}\n`);
        const nextRegistry = {
          defaultTenantId: registry.defaultTenantId || "erp-experts",
          tenants: [...(Array.isArray(registry.tenants) ? registry.tenants : []), registryEntry],
        };
        fs.writeFileSync(registryPath, `${JSON.stringify(nextRegistry, null, 2)}\n`);
      }

      printScaffold({ tenantConfig, registryEntry, configPath, write: Boolean(args.write) });
    }
  }
} catch (error) {
  console.error(`Tenant scaffold error: ${error.message}`);
  console.error("");
  console.error(usage());
  process.exitCode = 1;
}
