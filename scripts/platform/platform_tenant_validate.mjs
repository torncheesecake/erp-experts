import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { repoRoot, tenantsDir } from "./tenant_config.mjs";

const registryPath = path.join(tenantsDir, "tenant-registry.json");
const allowedStatuses = new Set(["draft", "active", "archived", "example_disabled"]);
const requiredConfigFields = [
  "tenantId",
  "name",
  "baseUrl",
  "domain",
  "locale",
  "market",
  "articleDataPath",
  "reportOutputPath",
  "dashboardRoute",
];
const placeholderDomainPattern = /(^|\.)example\.|\.test$|\.invalid$|localhost|127\.0\.0\.1|demo\./i;

function rel(filePath) {
  return path.relative(repoRoot, filePath) || ".";
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function addFailure(result, message) {
  result.failures.push(message);
}

function addWarning(result, message) {
  result.warnings.push(message);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return Array.from(duplicates);
}

function tenantConfigFiles() {
  if (!fs.existsSync(tenantsDir)) return [];
  return fs
    .readdirSync(tenantsDir)
    .filter((file) => file.endsWith(".config.json"))
    .sort();
}

function registryAllowsMissingConfig(entry) {
  return entry.status === "example_disabled" && entry.allowMissingConfig === true;
}

function validateRegistryEntry(entry, result) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    addFailure(result, "Registry contains a non-object tenant entry.");
    return;
  }

  if (!entry.tenantId) addFailure(result, "Registry tenant is missing tenantId.");
  if (!entry.name) addFailure(result, `Registry tenant ${entry.tenantId || "unknown"} is missing name.`);
  if (!entry.status) addFailure(result, `Registry tenant ${entry.tenantId || "unknown"} is missing status.`);
  if (entry.status && !allowedStatuses.has(entry.status)) {
    addFailure(result, `Registry tenant ${entry.tenantId || "unknown"} has invalid status: ${entry.status}.`);
  }
}

function validateConfigShape({ file, config, registryById, result }) {
  const fileTenantId = file.replace(".config.json", "");
  const registryEntry = config.tenantId ? registryById.get(config.tenantId) : null;

  requiredConfigFields.forEach((field) => {
    if (config[field] === undefined || config[field] === null || config[field] === "") {
      addFailure(result, `${file} is missing required field: ${field}.`);
    }
  });

  if (config.tenantId && config.tenantId !== fileTenantId) {
    addFailure(result, `${file} tenantId ${config.tenantId} does not match filename ${fileTenantId}.`);
  }

  if (config.tenantId && !registryById.has(config.tenantId)) {
    addFailure(result, `${file} is not listed in tenant-registry.json.`);
  }

  if (config.status && !allowedStatuses.has(config.status)) {
    addFailure(result, `${file} has invalid status: ${config.status}.`);
  }

  if (registryEntry?.status === "example_disabled" && config.status !== "example_disabled") {
    addFailure(result, `${file} must declare status example_disabled to match the disabled registry entry.`);
  }

  if (config.status && registryEntry?.status && config.status !== registryEntry.status) {
    addFailure(result, `${file} status ${config.status} does not match registry status ${registryEntry.status}.`);
  }

  if (config.baseUrl && !/^https?:\/\//.test(config.baseUrl)) {
    addFailure(result, `${file} baseUrl must be an absolute http(s) URL.`);
  }

  if (config.dashboardRoute && !String(config.dashboardRoute).startsWith("/")) {
    addFailure(result, `${file} dashboardRoute must start with /.`);
  }
}

export function validateTenants() {
  const result = {
    status: "pass",
    tenantsChecked: 0,
    activeTenants: [],
    warnings: [],
    failures: [],
  };

  if (!fs.existsSync(registryPath)) {
    addFailure(result, `Tenant registry is missing: ${rel(registryPath)}.`);
    result.status = "fail";
    return result;
  }

  let registry;
  try {
    registry = readJson(registryPath);
  } catch (error) {
    addFailure(result, `Tenant registry could not be parsed: ${error.message}.`);
    result.status = "fail";
    return result;
  }

  const registryTenants = Array.isArray(registry.tenants) ? registry.tenants : [];
  if (!Array.isArray(registry.tenants)) {
    addFailure(result, "Tenant registry must include a tenants array.");
  }

  registryTenants.forEach((entry) => validateRegistryEntry(entry, result));

  const registryIds = registryTenants.map((entry) => entry?.tenantId).filter(Boolean);
  duplicateValues(registryIds).forEach((tenantId) => {
    addFailure(result, `Duplicate registry tenant ID: ${tenantId}.`);
  });

  const registryById = new Map(registryTenants.filter((entry) => entry?.tenantId).map((entry) => [entry.tenantId, entry]));
  const configFiles = tenantConfigFiles();
  const configById = new Map();

  configFiles.forEach((file) => {
    const fullPath = path.join(tenantsDir, file);
    try {
      const config = readJson(fullPath);
      if (config?.tenantId) {
        if (configById.has(config.tenantId)) {
          addFailure(result, `Duplicate config tenant ID: ${config.tenantId}.`);
        }
        configById.set(config.tenantId, { file, config });
      }
      validateConfigShape({ file, config, registryById, result });
    } catch (error) {
      addFailure(result, `Could not parse ${file}: ${error.message}.`);
    }
  });

  registryTenants.forEach((entry) => {
    if (!entry?.tenantId) return;
    if (!configById.has(entry.tenantId) && !registryAllowsMissingConfig(entry)) {
      addFailure(result, `Registry tenant ${entry.tenantId} has no matching config file.`);
    }
    if (!configById.has(entry.tenantId) && registryAllowsMissingConfig(entry)) {
      addWarning(result, `Registry tenant ${entry.tenantId} is example_disabled and explicitly allows a missing config.`);
    }
  });

  configFiles.forEach((file) => {
    const tenantId = file.replace(".config.json", "");
    if (!registryById.has(tenantId)) {
      addFailure(result, `${file} has no matching registry entry.`);
    }
  });

  const activeTenants = registryTenants.filter((entry) => entry?.status === "active");
  result.activeTenants = activeTenants.map((entry) => entry.tenantId);
  result.tenantsChecked = registryTenants.length;

  if (activeTenants.length === 0) {
    addFailure(result, "At least one active tenant is required.");
  }

  const erpExperts = registryById.get("erp-experts");
  if (!erpExperts || erpExperts.status !== "active") {
    addFailure(result, "ERP Experts must remain active.");
  }

  activeTenants.forEach((entry) => {
    const config = configById.get(entry.tenantId)?.config;
    const domain = config?.domain || entry.domain || "";
    const baseUrl = config?.baseUrl || entry.baseUrl || "";
    if (placeholderDomainPattern.test(domain) || placeholderDomainPattern.test(baseUrl)) {
      addFailure(result, `Active tenant ${entry.tenantId} uses a placeholder/example domain.`);
    }
  });

  result.status = result.failures.length ? "fail" : result.warnings.length ? "warn" : "pass";
  return result;
}

function printText(result) {
  console.log("Sentinel Tenant Validation");
  console.log("");
  console.log(`Registry: ${fs.existsSync(registryPath) ? "present" : "missing"}`);
  console.log(`Tenants checked: ${result.tenantsChecked}`);
  console.log(`Active tenants: ${result.activeTenants.length ? result.activeTenants.join(", ") : "none"}`);
  console.log(`Warnings: ${result.warnings.length}`);
  console.log(`Failures: ${result.failures.length}`);
  console.log(`Status: ${result.status}`);

  if (result.warnings.length) {
    console.log("\nWarnings:");
    result.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (result.failures.length) {
    console.log("\nFailures:");
    result.failures.forEach((failure) => console.log(`- ${failure}`));
  }
}

function hasFlag(flag) {
  return process.argv.slice(2).includes(flag);
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] || "").href;

if (isDirectRun) {
  const result = validateTenants();
  if (hasFlag("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printText(result);
  }

  if (result.status === "fail") {
    process.exitCode = 1;
  }
}
