import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const tenantsDir = path.join(repoRoot, "platform/tenants");

const REQUIRED_FIELDS = [
  "tenantId",
  "name",
  "brandName",
  "domain",
  "baseUrl",
  "locale",
  "market",
  "industry",
  "primaryServices",
  "servicePaths",
  "contactPaths",
  "contentSources",
  "articleDataPath",
  "reportOutputPath",
  "publicReportPaths",
  "dashboardRoute",
  "scoringProfile",
  "opportunityProfile",
  "conversionProfile",
  "freshnessProfile",
  "internalLinkProfile",
  "approvalProfile",
  "commands",
  "notes",
];

function fail(message, details = []) {
  console.error(`Tenant config error: ${message}`);
  details.forEach((detail) => console.error(`  - ${detail}`));
  process.exitCode = 1;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Could not read ${path.relative(repoRoot, filePath)}`, [error.message]);
    return null;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateTenantConfig(config) {
  const errors = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (config[field] === undefined || config[field] === null || config[field] === "") {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (config.tenantId && !/^[a-z0-9][a-z0-9-]*$/.test(config.tenantId)) {
    errors.push("tenantId must use lowercase letters, numbers and hyphens only");
  }

  if (config.baseUrl && !/^https?:\/\//.test(config.baseUrl)) {
    errors.push("baseUrl must be an absolute http(s) URL");
  }

  if (config.dashboardRoute && !config.dashboardRoute.startsWith("/")) {
    errors.push("dashboardRoute must start with /");
  }

  if (!Array.isArray(config.primaryServices) || config.primaryServices.length === 0) {
    errors.push("primaryServices must be a non-empty array");
  }

  if (!Array.isArray(config.contentSources) || config.contentSources.length === 0) {
    errors.push("contentSources must be a non-empty array");
  }

  ["servicePaths", "contactPaths", "publicReportPaths", "commands"].forEach((field) => {
    if (!isPlainObject(config[field])) {
      errors.push(`${field} must be an object`);
    }
  });

  ["scoringProfile", "opportunityProfile", "conversionProfile", "freshnessProfile", "internalLinkProfile", "approvalProfile"].forEach(
    (field) => {
      if (!isPlainObject(config[field])) {
        errors.push(`${field} must be an object`);
      }
    },
  );

  if (config.articleDataPath) {
    const articlePath = path.join(repoRoot, config.articleDataPath);
    if (!fs.existsSync(articlePath)) {
      errors.push(`articleDataPath does not exist: ${config.articleDataPath}`);
    }
  }

  if (Array.isArray(config.contentSources)) {
    config.contentSources.forEach((source) => {
      if (!source.id || !source.type || !source.path) {
        errors.push("Each content source must include id, type and path");
        return;
      }

      const sourcePath = path.join(repoRoot, source.path);
      if (!fs.existsSync(sourcePath)) {
        errors.push(`content source path does not exist: ${source.path}`);
      }
    });
  }

  return errors;
}

function loadTenant(tenantId) {
  const configPath = path.join(tenantsDir, `${tenantId}.config.json`);

  if (!fs.existsSync(configPath)) {
    const available = fs
      .readdirSync(tenantsDir)
      .filter((file) => file.endsWith(".config.json"))
      .map((file) => file.replace(".config.json", ""));

    fail(`Unknown tenant: ${tenantId}`, [
      available.length ? `Available tenants: ${available.join(", ")}` : "No tenants are configured",
    ]);
    return null;
  }

  const config = readJson(configPath);
  if (!config) return null;

  const errors = validateTenantConfig(config);
  if (errors.length > 0) {
    fail(`Invalid tenant config: ${path.relative(repoRoot, configPath)}`, errors);
    return null;
  }

  return { config, configPath };
}

function printTenantSummary(config, configPath) {
  const serviceEntries = Object.entries(config.servicePaths);
  const contactEntries = Object.entries(config.contactPaths);

  console.log("SEO Platform Tenant");
  console.log("");
  console.log(`Tenant: ${config.name} (${config.tenantId})`);
  console.log(`Brand: ${config.brandName}`);
  console.log(`Domain: ${config.domain}`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Locale: ${config.locale}`);
  console.log(`Market: ${config.market}`);
  console.log(`Industry: ${config.industry}`);
  console.log(`Config: ${path.relative(repoRoot, configPath)}`);
  console.log("");
  console.log("Key paths:");
  console.log(`  Article data: ${config.articleDataPath}`);
  console.log(`  Report output: ${config.reportOutputPath}`);
  console.log(`  Dashboard: ${config.dashboardRoute}`);
  console.log("");
  console.log("Content sources:");
  config.contentSources.forEach((source) => {
    console.log(`  - ${source.id}: ${source.type} at ${source.path}`);
  });
  console.log("");
  console.log("Primary services:");
  config.primaryServices.forEach((service) => console.log(`  - ${service}`));
  console.log("");
  console.log("Service paths:");
  serviceEntries.forEach(([key, value]) => {
    console.log(`  - ${key}: ${value.path} (${value.label})`);
  });
  console.log("");
  console.log("Contact paths:");
  contactEntries.forEach(([key, value]) => {
    console.log(`  - ${key}: ${value.path} (${value.label})`);
  });
  console.log("");
  console.log("Commands:");
  Object.entries(config.commands).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });
  console.log("");
  console.log("Status: valid read-only tenant configuration");
}

const tenantId = process.argv[2];

if (!tenantId) {
  fail("Missing tenant ID", ["Usage: npm run platform:tenant -- <tenantId>", "Example: npm run platform:tenant -- erp-experts"]);
} else {
  const tenant = loadTenant(tenantId);
  if (tenant) {
    printTenantSummary(tenant.config, tenant.configPath);
  }
}
