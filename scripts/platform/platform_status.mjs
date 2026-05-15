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

if (summary.latestRun) {
  console.log(`Last run: ${summary.latestRun.command} (${summary.latestRun.status}) at ${summary.latestRun.finishedAt || summary.latestRun.startedAt}`);
}

console.log("Latest runs:");
if (!summary.latestRuns.length) {
  console.log("  None recorded yet.");
} else {
  summary.latestRuns.forEach((run) => {
    console.log(`  - #${run.id} ${run.command} ${run.status} ${run.finishedAt || run.startedAt}`);
  });
}
