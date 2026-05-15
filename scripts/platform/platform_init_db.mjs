import path from "node:path";
import { applySchema, DEFAULT_DB_PATH, getPersistenceSummary, upsertTenant } from "../../platform/persistence/db.js";
import { loadTenantConfig, printTenantError } from "./tenant_config.mjs";

const tenantResult = loadTenantConfig("erp-experts");

if (!tenantResult.ok) {
  printTenantError(tenantResult);
  process.exit(1);
}

applySchema(DEFAULT_DB_PATH);
upsertTenant(tenantResult.config, DEFAULT_DB_PATH);

const summary = getPersistenceSummary(DEFAULT_DB_PATH);

console.log("Platform Persistence Init");
console.log(`DB path: ${path.relative(process.cwd(), summary.dbPath)}`);
console.log(`Tenant count: ${summary.tenantCount}`);
console.log(`Run count: ${summary.runCount}`);
console.log(`Snapshot count: ${summary.snapshotCount}`);
console.log(`ERP Experts tenant: ${summary.erpExpertsTenantExists ? "present" : "missing"}`);
console.log("Status: ready");
