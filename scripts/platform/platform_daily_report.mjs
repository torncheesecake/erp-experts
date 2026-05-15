import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getOperationalSummary } from "../../platform/api/state_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const reportPath = path.join(repoRoot, "reports/sentinel-daily-operator-report.md");
const tenantId = getArgValue("--tenant", process.env.PLATFORM_TENANT || "erp-experts");

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath);
}

function readReadinessStatus() {
  const readinessPath = path.join(repoRoot, "reports/sentinel-deploy-readiness.json");
  if (!fs.existsSync(readinessPath)) {
    return {
      status: "UNKNOWN",
      checkedAt: null,
      warnings: [],
      failures: [],
      detail: "No readiness report found. Run npm run platform:deploy:ready.",
    };
  }

  try {
    const report = JSON.parse(fs.readFileSync(readinessPath, "utf8"));
    return {
      status: report.overallStatus || "UNKNOWN",
      checkedAt: report.checkedAt || null,
      warnings: report.warnings || [],
      failures: report.failures || [],
      detail: report.overallStatus || "Latest readiness report found.",
    };
  } catch {
    return {
      status: "UNKNOWN",
      checkedAt: null,
      warnings: [],
      failures: [],
      detail: "Could not read reports/sentinel-deploy-readiness.json.",
    };
  }
}

function valueOrNone(value) {
  return value || "None recorded.";
}

function yesNo(value) {
  return value ? "yes" : "no";
}

function listItems(items, formatter, empty = "None recorded.") {
  if (!items?.length) return `- ${empty}`;
  return items.map((item) => `- ${formatter(item)}`).join("\n");
}

function latestApprovalSummary(state) {
  const approval = state.approvals.current?.[0];
  if (!approval) return "None recorded.";

  return `${approval.planId} approved for ${approval.approvedFor || "unknown"} on ${approval.approvedAt || "unknown date"}`;
}

function latestStatusSummary(state) {
  const status = state.plans.latestStatuses?.[0];
  if (!status) return "None recorded.";

  return `${status.planId} is ${status.currentStatus || "unknown"}; next step: ${status.nextRecommendedStep || "not recorded"}`;
}

function attentionItems(state, readiness) {
  const items = [];

  if (state.health.blocked > 0) {
    items.push(`Resolve ${state.health.blocked} blocked SEO item${state.health.blocked === 1 ? "" : "s"}.`);
  }

  if (state.health.review > 0) {
    items.push(`Review ${state.health.review} SEO item${state.health.review === 1 ? "" : "s"} marked needs-review.`);
  }

  if (state.recommendation.humanInputRequired) {
    items.push(state.recommendation.nextStep);
  }

  const inboxItem = state.inbox.latestActionable || state.inboxRecommendation;
  if (inboxItem?.requiresHumanReview && inboxItem.recommendedNextStep && inboxItem.recommendedNextStep !== state.recommendation.nextStep) {
    items.push(inboxItem.recommendedNextStep);
  }

  readiness.failures.forEach((failure) => {
    items.push(`Readiness failure: ${failure.name} - ${failure.detail}`);
  });

  return [...new Set(items)].filter(Boolean);
}

function safeNextCommands(state) {
  const commands = [
    "npm run platform:start",
    "npm run platform:state",
    "npm run seo:autopilot",
  ];

  const nextStep = state.recommendation.nextStep || "";
  const commandMatch = nextStep.match(/npm run [\w:-]+(?: -- [^\n]+)?/);
  if (commandMatch && !commands.includes(commandMatch[0])) {
    commands.push(commandMatch[0]);
  }

  return commands;
}

function renderReport(state, readiness) {
  const generatedAt = new Date().toISOString();
  const topOpportunity = state.opportunities.top;
  const topPlan = state.plans.top;
  const inboxItem = state.inbox.latestActionable || state.inboxRecommendation;
  const attention = attentionItems(state, readiness);

  return `# Sentinel Daily Operator Report

Generated: ${generatedAt}

## Tenant

- Name: ${state.tenant.name}
- Tenant ID: ${state.tenant.tenantId}
- Base URL: ${state.tenant.baseUrl || "Not recorded."}

## Health Summary

- Health: ${state.health.monitorStatus}
- QA: ${state.health.pass} pass, ${state.health.review} review, ${state.health.blocked} blocked
- Latest snapshot: ${state.health.latestSnapshotAt || "Not recorded."}

## Current Workflow

- Workflow state: ${state.workflow.state}
- Human input required: ${yesNo(state.recommendation.humanInputRequired)}
- Reason: ${state.recommendation.reason || "Not recorded."}

## Latest Opportunity

- Title: ${topOpportunity?.title || "None persisted yet."}
- Priority: ${topOpportunity?.priorityLabel || "Not recorded."}
- Score: ${topOpportunity?.score ?? "Not recorded."}
- Type: ${topOpportunity?.primaryType || "Not recorded."}

## Latest Plan

- Plan: ${topPlan ? `${topPlan.planId} - ${topPlan.title}` : "None persisted yet."}
- Type: ${topPlan?.planType || "Not recorded."}
- Safety: ${topPlan?.safetyLevel || "Not recorded."}
- Priority: ${topPlan?.executionPriority || "Not recorded."}

## Latest Inbox Item

- Title: ${inboxItem?.title || "None recorded."}
- Status: ${inboxItem?.status || "Not recorded."}
- Priority: ${inboxItem?.priority || "Not recorded."}
- Recommended next step: ${inboxItem?.recommendedNextStep || "Not recorded."}

## Latest Approval And Status

- Approval: ${latestApprovalSummary(state)}
- Status: ${latestStatusSummary(state)}

## Deployment Readiness

- Status: ${readiness.status}
- Checked at: ${readiness.checkedAt || "Not recorded."}
- Warnings: ${readiness.warnings.length}
- Failures: ${readiness.failures.length}

## Recommended Next Step

${valueOrNone(state.recommendation.nextStep)}

## What Sentinel Did Recently

${listItems(state.runs.latest.slice(0, 5), (run) => `${run.command} ${run.status}${run.finishedAt ? ` at ${run.finishedAt}` : ""}`)}

## What Needs Matthew's Attention

${listItems(attention, (item) => item, "No immediate human action required.")}

## Safe Next Commands

${listItems(safeNextCommands(state), (command) => `\`${command}\``)}
`;
}

function main() {
  const state = getOperationalSummary(tenantId);
  const readiness = readReadinessStatus();
  const report = renderReport(state, readiness);

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report, "utf8");

  console.log("Sentinel Daily Operator Report");
  console.log("");
  console.log(`Report: ${rel(reportPath)}`);
  console.log(`Health: ${state.health.monitorStatus}`);
  console.log(`QA: ${state.health.pass}/${state.health.review}/${state.health.blocked}`);
  console.log(`Workflow: ${state.workflow.state}`);
  console.log(`Readiness: ${readiness.status}`);
  console.log("");
  console.log("Next Step:");
  console.log(state.recommendation.nextStep);
}

main();
