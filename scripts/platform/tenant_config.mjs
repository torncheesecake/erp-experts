import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, "../..");
export const tenantsDir = path.join(repoRoot, "platform/tenants");

export const REQUIRED_TENANT_FIELDS = [
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

export function listTenantIds() {
  if (!fs.existsSync(tenantsDir)) return [];

  return fs
    .readdirSync(tenantsDir)
    .filter((file) => file.endsWith(".config.json"))
    .map((file) => file.replace(".config.json", ""));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateTenantConfig(config) {
  const errors = [];

  REQUIRED_TENANT_FIELDS.forEach((field) => {
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

  [
    "scoringProfile",
    "opportunityProfile",
    "conversionProfile",
    "freshnessProfile",
    "internalLinkProfile",
    "approvalProfile",
  ].forEach((field) => {
    if (!isPlainObject(config[field])) {
      errors.push(`${field} must be an object`);
    }
  });

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

export function loadTenantConfig(tenantId = "erp-experts") {
  const configPath = path.join(tenantsDir, `${tenantId}.config.json`);

  if (!fs.existsSync(configPath)) {
    const availableTenants = listTenantIds();
    return {
      ok: false,
      error: `Unknown tenant: ${tenantId}`,
      details: [availableTenants.length ? `Available tenants: ${availableTenants.join(", ")}` : "No tenants are configured"],
    };
  }

  let config;
  try {
    config = readJson(configPath);
  } catch (error) {
    return {
      ok: false,
      error: `Could not read ${path.relative(repoRoot, configPath)}`,
      details: [error.message],
    };
  }

  const errors = validateTenantConfig(config);
  if (errors.length > 0) {
    return {
      ok: false,
      error: `Invalid tenant config: ${path.relative(repoRoot, configPath)}`,
      details: errors,
    };
  }

  return {
    ok: true,
    config,
    configPath,
  };
}

export function printTenantError(result) {
  console.error(`Tenant config error: ${result.error}`);
  result.details?.forEach((detail) => console.error(`  - ${detail}`));
}
