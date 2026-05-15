import fs from "node:fs";
import path from "node:path";
import { DEFAULT_DB_PATH, databaseExists, persistPlanStatus } from "../platform/persistence/db.js";
import { loadTenantConfig, printTenantError } from "./platform/tenant_config.mjs";

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function usage() {
  console.log("Usage:");
  console.log("npm run seo:plan:status -- --tenant erp-experts");
  console.log("npm run seo:plan:status -- --mark-completed <planId> --tenant erp-experts");
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const markIdx = args.indexOf("--mark-completed");
  const markCompletedPlanId = markIdx >= 0 && args[markIdx + 1] ? args[markIdx + 1] : "";
  const tenantIndex = args.indexOf("--tenant");
  const tenantId = tenantIndex >= 0 && args[tenantIndex + 1] ? args[tenantIndex + 1] : "erp-experts";
  return { markCompletedPlanId, tenantId };
}

function parseActivePlanId(activePlanPath) {
  try {
    const text = fs.readFileSync(activePlanPath, "utf8");
    const match = text.match(/Plan ID:\s*`([^`]+)`/i);
    return match?.[1] || "";
  } catch {
    return "";
  }
}

function statusFromApproval(approval) {
  if (!approval) return "discovered";
  if (approval.approvedFor === "apply_patch") return "approved_for_apply";
  if (approval.approvedFor === "patch_proposal") return "approved_for_patch_proposal";
  return "approved_for_planning";
}

function nextStepFor(status, plan) {
  if (status === "completed") return "No next step. Plan marked complete.";
  if (status === "paused") return "Review pause note and decide whether to resume.";
  if (status === "blocked") return "Resolve blocker before continuing.";
  if (status === "active") return "Run npm run seo:plan:run -- <planId> and review staged workflow.";
  if (status === "approved_for_apply") return "Prepare reviewed patch proposal and validate before manual commit.";
  if (status === "approved_for_patch_proposal") return "Generate patch proposal only, then run review checkpoints.";
  if (status === "approved_for_planning") return "Generate planning output and request patch approval if needed.";
  if (plan.safetyLevel === "high_review_required") return "Approve for patch proposal first: npm run seo:plan:approve -- <planId>.";
  return "Review the plan, then approve with npm run seo:plan:approve -- <planId>.";
}

function deriveValidationState(status, plan) {
  if (status === "completed") return "validated";
  if (status === "blocked") return "blocked";
  if (status === "active") return "pending_validation";
  if (plan.requiredHumanReview) return "review_required";
  return "pending";
}

function persistStatusesToDb({ tenantId, statuses }) {
  if (!databaseExists(DEFAULT_DB_PATH)) {
    console.warn("[seo:plan:status] SQLite status warning: platform DB is missing. Run npm run platform:init to enable persistence.");
    return;
  }

  try {
    let count = 0;
    statuses.forEach((status) => {
      count += persistPlanStatus({ tenantId, status });
    });
    if (count) console.log(`Persisted plan status rows: ${count}`);
  } catch (error) {
    console.warn(`[seo:plan:status] SQLite status warning: ${error.message}`);
  }
}

function main() {
  const { markCompletedPlanId, tenantId } = parseArgs(process.argv);
  const tenantResult = loadTenantConfig(tenantId);
  if (!tenantResult.ok) {
    printTenantError(tenantResult);
    process.exit(1);
  }

  const tenant = tenantResult.config;
  const reportsDir = path.resolve(tenant.reportOutputPath || "reports");
  const plansPath = path.join(reportsDir, "seo-execution-plans.json");
  const approvalsPath = path.join(reportsDir, "seo-plan-approvals.json");
  const activePlanPath = path.join(reportsDir, "seo-active-plan.md");
  const statusPath = path.join(reportsDir, "seo-plan-status.json");

  const plansReport = readJson(plansPath);
  if (!plansReport) {
    console.log("Missing execution plans report.");
    console.log("Run npm run seo:plans first.");
    process.exit(1);
  }

  const plans = Array.isArray(plansReport.plans) ? plansReport.plans : [];
  const approvalsReport = readJson(approvalsPath, { approvals: [] });
  const approvals = Array.isArray(approvalsReport.approvals) ? approvalsReport.approvals : [];
  const approvalById = new Map(approvals.map((item) => [item.planId, item]));
  const activePlanId = parseActivePlanId(activePlanPath);
  const nowIso = new Date().toISOString();

  const existingStatusReport = readJson(statusPath, { statuses: [] });
  const existingStatuses = Array.isArray(existingStatusReport.statuses) ? existingStatusReport.statuses : [];
  const existingById = new Map(existingStatuses.map((item) => [item.planId, item]));

  if (markCompletedPlanId && !plans.some((plan) => plan.id === markCompletedPlanId)) {
    console.log(`Unknown plan ID: ${markCompletedPlanId}`);
    process.exit(1);
  }

  const statuses = plans.map((plan) => {
    const existing = existingById.get(plan.id);
    const approval = approvalById.get(plan.id);
    let currentStatus = statusFromApproval(approval);
    if (activePlanId && plan.id === activePlanId) currentStatus = "active";
    if (existing?.currentStatus === "paused" || existing?.currentStatus === "blocked") currentStatus = existing.currentStatus;
    if (markCompletedPlanId && plan.id === markCompletedPlanId) currentStatus = "completed";

    return {
      planId: plan.id,
      title: plan.title,
      currentStatus,
      safetyLevel: plan.safetyLevel,
      requiredHumanReview: Boolean(plan.requiredHumanReview),
      lastUpdated: nowIso,
      nextRecommendedStep: nextStepFor(currentStatus, plan),
      validationState: deriveValidationState(currentStatus, plan),
      notes: existing?.notes || "",
    };
  });

  const output = {
    generatedAt: nowIso,
    activePlanId: activePlanId || null,
    statuses,
  };
  fs.writeFileSync(statusPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  persistStatusesToDb({ tenantId: tenant.tenantId, statuses });

  const top = statuses
    .filter((item) => item.currentStatus !== "discovered")
    .slice(0, 5);

  console.log("SEO Plan Status Tracker");
  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Tracked plans: ${statuses.length}`);
  if (markCompletedPlanId) {
    console.log(`Marked completed: ${markCompletedPlanId}`);
  }
  if (!top.length) {
    console.log("No active or approved plan statuses yet.");
  } else {
    top.forEach((item, index) => {
      console.log(`${index + 1}. ${item.planId}`);
      console.log(`   Status: ${item.currentStatus} · validation: ${item.validationState}`);
      console.log(`   Next: ${item.nextRecommendedStep}`);
    });
  }
  console.log(`Status file: ${statusPath}`);
}

main();
