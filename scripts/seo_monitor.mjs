import { readJson } from "./seo_batch_helpers.mjs";
import { buildMonitorState } from "./seo_monitor_helpers.mjs";
import { loadTenantConfig, printTenantError } from "./platform/tenant_config.mjs";
import { DEFAULT_DB_PATH, databaseExists, insertSnapshot } from "../platform/persistence/db.js";
import fs from "node:fs";
import path from "node:path";

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function printList(label, items) {
  console.log(label);
  if (!items.length) {
    console.log("None");
    return;
  }
  items.forEach((item) => console.log(`- ${item}`));
}

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function reportPath(tenant, fileName) {
  return path.join(tenant.reportOutputPath || "reports", fileName);
}

function persistMonitorSnapshot(tenant, state) {
  if (!databaseExists(DEFAULT_DB_PATH)) return;

  try {
    insertSnapshot({
      tenantId: tenant.tenantId,
      passCount: state.pass,
      reviewCount: state.needsReview,
      blockedCount: state.blocked,
      monitorStatus: state.status,
    });
  } catch (error) {
    console.warn(`[seo:monitor] SQLite snapshot warning: ${error.message}`);
  }
}

function main() {
  const summaryOnly = process.argv.includes("--summary");
  const tenantId = getArgValue("--tenant", "erp-experts");
  const tenantResult = loadTenantConfig(tenantId);

  if (!tenantResult.ok) {
    printTenantError(tenantResult);
    process.exitCode = 1;
    return;
  }

  const tenant = tenantResult.config;
  const qaReport = readJson(reportPath(tenant, "resource-qa-report.json"));
  const pipelineSummary = readJson(reportPath(tenant, "seo-pipeline-summary.json"));
  const opportunityCentre = readJsonSafe(reportPath(tenant, "seo-opportunity-centre.json"));
  readJson(reportPath(tenant, "seo-action-briefs.json"));
  readJson(reportPath(tenant, "seo-weekly-summary.json"));

  const state = buildMonitorState({ qaReport, pipelineSummary });
  persistMonitorSnapshot(tenant, state);

  if (summaryOnly) {
    console.log(state.status);
    console.log(`${state.pass} pass`);
    console.log(`${state.needsReview} review`);
    console.log(`${state.blocked} blocked`);
    if (state.healthyStreak > 0) {
      console.log(`${state.healthyStreak} healthy snapshots`);
    } else if (state.regressionStreak > 0) {
      console.log(`${state.regressionStreak} regression snapshots`);
    } else {
      console.log("No snapshot streak yet");
    }
    console.log(state.status === "HEALTHY" ? "No action required" : "Run npm run seo:operator");
    return;
  }

  console.log(`SEO Monitor Report - ${tenant.name}`);
  console.log("");
  console.log(`Tenant: ${tenant.tenantId}`);
  console.log(`Base URL: ${tenant.baseUrl}`);
  console.log("");
  console.log(`Status: ${state.status}`);
  console.log("");
  console.log("Current:");
  console.log(`pass=${state.pass}`);
  console.log(`needs_review=${state.needsReview}`);
  console.log(`blocked=${state.blocked}`);
  console.log(`humanReviewRecommended=${state.humanReviewRecommended ? "yes" : "no"}`);
  console.log("");
  console.log("Previous:");
  if (!state.previousSnapshot) {
    console.log("No previous snapshot available yet.");
  } else {
    console.log(`pass=${state.previousTotals.pass}`);
    console.log(`needs_review=${state.previousTotals.needsReview}`);
    console.log(`blocked=${state.previousTotals.blocked}`);
  }
  console.log("");
  console.log("Changes:");
  console.log(
    `pass ${state.passChange >= 0 ? "+" : ""}${state.passChange}, needs_review ${state.needsReviewChange >= 0 ? "+" : ""}${state.needsReviewChange}, blocked ${state.blockedChange >= 0 ? "+" : ""}${state.blockedChange}`,
  );
  if (!state.previousSnapshot) {
    console.log("Not enough history snapshots to compare trend yet.");
  } else if (!state.hasRegression) {
    console.log("No regressions detected.");
    console.log("No newly failing articles.");
    console.log("No newly blocked articles.");
  } else {
    printList("Newly failing articles:", state.newlyFailing);
    printList("Newly blocked articles:", state.newlyBlocked);
  }
  if (state.healthyStreak > 0) {
    console.log(`Healthy streak: ${state.healthyStreak} snapshot${state.healthyStreak === 1 ? "" : "s"}.`);
  } else if (state.regressionStreak > 0) {
    console.log(`Regression streak: ${state.regressionStreak} snapshot${state.regressionStreak === 1 ? "" : "s"}.`);
  }
  if (state.recoverySnapshotsAgo !== null) {
    console.log(`Recovered from regression ${state.recoverySnapshotsAgo} snapshot${state.recoverySnapshotsAgo === 1 ? "" : "s"} ago.`);
  }
  console.log("");
  console.log("Recommendation:");
  if (state.status === "HEALTHY") {
    console.log("No action required this week.");
    console.log("Continue weekly autopilot monitoring.");
    if (Number(opportunityCentre?.opportunityCount || 0) > 0) {
      console.log(`Strategic opportunities available: ${opportunityCentre.opportunityCount}.`);
      console.log("Run npm run seo:opportunities");
    }
  } else {
    console.log("Review latest changes and run:");
    console.log("npm run seo:operator");
  }
  console.log("");
  console.log("Dashboard:");
  console.log(tenant.dashboardRoute || "/seo-roadmap");
  console.log("");
  console.log("Git safety:");
  console.log("Run git status --short before switching tasks.");
}

main();
