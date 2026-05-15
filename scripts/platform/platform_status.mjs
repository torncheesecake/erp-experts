import path from "node:path";
import { DEFAULT_DB_PATH, databaseExists, getPersistenceSummary } from "../../platform/persistence/db.js";

console.log("Platform Persistence Status");
console.log(`DB path: ${path.relative(process.cwd(), DEFAULT_DB_PATH)}`);

if (!databaseExists(DEFAULT_DB_PATH)) {
  console.log("Status: missing");
  console.log("Run npm run platform:init");
  process.exit(1);
}

const summary = getPersistenceSummary(DEFAULT_DB_PATH);

console.log("Status: ready");
console.log(`Tenant count: ${summary.tenantCount}`);
console.log(`Run count: ${summary.runCount}`);
console.log(`Snapshot count: ${summary.snapshotCount}`);
console.log(`ERP Experts tenant: ${summary.erpExpertsTenantExists ? "present" : "missing"}`);
