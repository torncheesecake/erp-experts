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
console.log(`Opportunity summary count: ${summary.opportunitySummaryCount}`);
console.log(`Plan summary count: ${summary.planSummaryCount}`);
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

if (summary.latestOpportunitySummary) {
  console.log(`Latest top opportunity: ${summary.latestOpportunitySummary.title} (${summary.latestOpportunitySummary.score})`);
}

console.log("Latest opportunity summaries:");
if (!summary.latestOpportunitySummaries.length) {
  console.log("  None recorded yet.");
} else {
  summary.latestOpportunitySummaries.forEach((opportunity) => {
    console.log(`  - #${opportunity.id} ${opportunity.title} ${opportunity.score} ${opportunity.priorityLabel} ${opportunity.createdAt}`);
  });
}

if (summary.latestPlanSummary) {
  console.log(`Latest top plan: ${summary.latestPlanSummary.title} (${summary.latestPlanSummary.safetyLevel}, ${summary.latestPlanSummary.executionPriority})`);
}

console.log("Latest plan summaries:");
if (!summary.latestPlanSummaries.length) {
  console.log("  None recorded yet.");
} else {
  summary.latestPlanSummaries.forEach((plan) => {
    console.log(`  - #${plan.id} ${plan.title} ${plan.planType} ${plan.executionPriority} ${plan.safetyLevel} ${plan.createdAt}`);
  });
}
