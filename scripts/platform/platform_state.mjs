import fs from "node:fs";
import path from "node:path";
import { getOperationalSummary } from "../../platform/api/state_api.mjs";

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function ensureReportsDir(reportsDir) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function printError(error) {
  if (error.code === "TENANT_CONFIG_ERROR") {
    console.error(`Tenant config error: ${error.message}`);
    error.details?.forEach((detail) => console.error(`  - ${detail}`));
    return;
  }

  console.error(error.message);
}

function main() {
  const tenantId = getArgValue("--tenant", "erp-experts");

  try {
    const state = getOperationalSummary(tenantId);
    const reportsDir = path.resolve(state.tenant.reportOutputPath || "reports");
    const outputPath = path.join(reportsDir, "sentinel-state.json");

    ensureReportsDir(reportsDir);
    fs.writeFileSync(outputPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

    console.log("Sentinel State");
    console.log("");
    console.log(`Tenant: ${state.tenant.name} (${state.tenant.tenantId})`);
    console.log(`Base URL: ${state.tenant.baseUrl}`);
    console.log(`Health: ${state.health.monitorStatus}`);
    console.log(`QA: ${state.health.pass} pass · ${state.health.review} review · ${state.health.blocked} blocked`);
    console.log(`Latest snapshot: ${state.health.latestSnapshotAt || "unknown"}`);
    console.log("");
    console.log("Latest Opportunity:");
    if (state.opportunities.top) {
      console.log(`${state.opportunities.top.title}`);
      console.log(`Priority: ${state.opportunities.top.priorityLabel || "unknown"} · Score: ${state.opportunities.top.score}`);
    } else {
      console.log("None persisted yet.");
    }
    console.log("");
    console.log("Latest Plan:");
    if (state.plans.top) {
      console.log(`${state.plans.top.planId} - ${state.plans.top.title}`);
      console.log(`Safety: ${state.plans.top.safetyLevel || "unknown"} · Priority: ${state.plans.top.executionPriority || "unknown"}`);
    } else {
      console.log("None persisted yet.");
    }
    console.log("");
    console.log("Workflow:");
    console.log(state.workflow.state);
    console.log("");
    console.log("Recommended Next Step:");
    console.log(state.workflow.recommendedNextStep);
    console.log(`Human input required: ${state.workflow.humanInputRequired ? "yes" : "no"}`);
    console.log("");
    console.log("Recent Runs:");
    if (!state.runs.latest.length) {
      console.log("- None recorded yet.");
    } else {
      state.runs.latest.slice(0, 5).forEach((run) => {
        console.log(`- ${run.command} ${run.status} ${run.finishedAt || run.startedAt}`);
      });
    }
    console.log("");
    console.log(`State JSON: ${path.relative(process.cwd(), outputPath)}`);
  } catch (error) {
    printError(error);
    process.exit(1);
  }
}

main();
