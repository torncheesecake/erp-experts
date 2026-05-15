import path from "node:path";
import { loadTenantConfig, printTenantError, repoRoot } from "./tenant_config.mjs";

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
  printTenantError({
    error: "Missing tenant ID",
    details: ["Usage: npm run platform:tenant -- <tenantId>", "Example: npm run platform:tenant -- erp-experts"],
  });
  process.exitCode = 1;
} else {
  const result = loadTenantConfig(tenantId);
  if (!result.ok) {
    printTenantError(result);
    process.exitCode = 1;
  } else {
    printTenantSummary(result.config, result.configPath);
  }
}
