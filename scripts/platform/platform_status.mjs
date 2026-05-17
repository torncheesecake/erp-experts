import path from "node:path";
import { DEFAULT_DB_PATH, databaseExists, getPersistenceSummary } from "../../platform/persistence/db.js";
import { describeRuntimePaths } from "../../platform/runtime_paths.mjs";

const runtimePaths = describeRuntimePaths();
console.log("Platform Persistence Status");
console.log(`DB path: ${path.relative(process.cwd(), DEFAULT_DB_PATH)}`);
console.log(`DB path source: ${runtimePaths.db.source}`);
console.log(`Report output path: ${runtimePaths.reports.relativePath} (${runtimePaths.reports.source})`);
console.log(`Backup path: ${runtimePaths.backups.relativePath} (${runtimePaths.backups.source})`);
console.log(`Log path: ${runtimePaths.logs.relativePath} (${runtimePaths.logs.source})`);
console.log("Operational summary: run npm run platform:state");

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
console.log(`Approval count: ${summary.planApprovalCount}`);
console.log(`Plan status count: ${summary.planStatusCount}`);
console.log(`Inbox item count: ${summary.inboxItemCount}`);
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

if (summary.latestPlanApproval) {
  console.log(`Latest approval: ${summary.latestPlanApproval.planId} (${summary.latestPlanApproval.approvedFor}) at ${summary.latestPlanApproval.approvedAt}`);
}

console.log("Latest approvals:");
if (!summary.latestPlanApprovals.length) {
  console.log("  None recorded yet.");
} else {
  summary.latestPlanApprovals.forEach((approval) => {
    console.log(`  - #${approval.id} ${approval.planId} ${approval.approvedFor} ${approval.safetyLevel} ${approval.approvedAt}`);
  });
}

if (summary.latestPlanStatus) {
  console.log(`Latest plan status: ${summary.latestPlanStatus.planId} (${summary.latestPlanStatus.currentStatus}) at ${summary.latestPlanStatus.lastUpdated}`);
}

console.log("Latest plan statuses:");
if (!summary.latestPlanStatuses.length) {
  console.log("  None recorded yet.");
} else {
  summary.latestPlanStatuses.forEach((status) => {
    console.log(`  - #${status.id} ${status.planId} ${status.currentStatus} ${status.validationState} ${status.lastUpdated}`);
  });
}

if (summary.latestInboxItem) {
  console.log(`Latest inbox item: ${summary.latestInboxItem.title} (${summary.latestInboxItem.status}) at ${summary.latestInboxItem.createdAt}`);
}

console.log("Latest inbox items:");
if (!summary.latestInboxItems.length) {
  console.log("  None recorded yet.");
} else {
  summary.latestInboxItems.forEach((item) => {
    console.log(`  - #${item.id} ${item.title} ${item.priority} ${item.status} ${item.createdAt}`);
  });
}
