import path from "node:path";
import { applySchema, DEFAULT_DB_PATH, getPersistenceSummary, upsertTenant } from "../../platform/persistence/db.js";
import { describeRuntimePaths } from "../../platform/runtime_paths.mjs";
import { loadTenantConfig, printTenantError } from "./tenant_config.mjs";

const tenantResult = loadTenantConfig("erp-experts");

if (!tenantResult.ok) {
  printTenantError(tenantResult);
  process.exit(1);
}

applySchema(DEFAULT_DB_PATH);
upsertTenant(tenantResult.config, DEFAULT_DB_PATH);

const summary = getPersistenceSummary(DEFAULT_DB_PATH);
const runtimePaths = describeRuntimePaths();

console.log("Platform Persistence Init");
console.log(`DB path: ${path.relative(process.cwd(), summary.dbPath)}`);
console.log(`DB path source: ${runtimePaths.db.source}`);
console.log(`Report output path: ${runtimePaths.reports.relativePath} (${runtimePaths.reports.source})`);
console.log(`Backup path: ${runtimePaths.backups.relativePath} (${runtimePaths.backups.source})`);
console.log(`Log path: ${runtimePaths.logs.relativePath} (${runtimePaths.logs.source})`);
console.log(`Tenant count: ${summary.tenantCount}`);
console.log(`Run count: ${summary.runCount}`);
console.log(`Snapshot count: ${summary.snapshotCount}`);
console.log(`ERP Experts tenant: ${summary.erpExpertsTenantExists ? "present" : "missing"}`);
console.log("Status: ready");
