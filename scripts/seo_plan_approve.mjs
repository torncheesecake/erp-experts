import fs from "node:fs";
import path from "node:path";
import { DEFAULT_DB_PATH, databaseExists, persistPlanApproval } from "../platform/persistence/db.js";
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
  console.log("npm run seo:plan:approve -- <planId> [--tenant erp-experts] [--allow-apply] [--note \"...\"] [--expires \"ISO_DATETIME\"]");
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const first = args[0];
  const allowApply = args.includes("--allow-apply");

  const tenantIndex = args.indexOf("--tenant");
  const tenantId = tenantIndex >= 0 && args[tenantIndex + 1] ? args[tenantIndex + 1] : "erp-experts";

  const noteIndex = args.indexOf("--note");
  const approvalNote = noteIndex >= 0 && args[noteIndex + 1] ? args[noteIndex + 1] : "";

  const expiresIndex = args.indexOf("--expires");
  const expiresAtRaw = expiresIndex >= 0 && args[expiresIndex + 1] ? args[expiresIndex + 1] : "";

  return {
    planId: first && !first.startsWith("--") ? first : "",
    tenantId,
    allowApply,
    approvalNote,
    expiresAtRaw,
  };
}

function approvalScope({ safetyLevel, allowApply }) {
  if (allowApply) return "apply_patch";
  if (safetyLevel === "high_review_required") return "patch_proposal";
  if (safetyLevel === "safe_patch_candidate") return "patch_proposal";
  return "planning";
}

function validateExpiry(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function persistApprovalToDb({ tenantId, record }) {
  if (!databaseExists(DEFAULT_DB_PATH)) {
    console.warn("[seo:plan:approve] SQLite approval warning: platform DB is missing. Run npm run platform:init to enable persistence.");
    return;
  }

  try {
    const count = persistPlanApproval({ tenantId, approval: record });
    if (count) console.log(`Persisted approval summary: ${count}`);
  } catch (error) {
    console.warn(`[seo:plan:approve] SQLite approval warning: ${error.message}`);
  }
}

function main() {
  const { planId, tenantId, allowApply, approvalNote, expiresAtRaw } = parseArgs(process.argv);
  if (!planId) {
    usage();
    process.exit(1);
  }

  const tenantResult = loadTenantConfig(tenantId);
  if (!tenantResult.ok) {
    printTenantError(tenantResult);
    process.exit(1);
  }

  const tenant = tenantResult.config;
  const reportsDir = path.resolve(tenant.reportOutputPath || "reports");
  const plansPath = path.join(reportsDir, "seo-execution-plans.json");
  const approvalsPath = path.join(reportsDir, "seo-plan-approvals.json");

  const plansReport = readJson(plansPath);
  if (!plansReport) {
    console.log("Missing execution plans report.");
    console.log("Run npm run seo:plans first.");
    process.exit(1);
  }

  const plans = Array.isArray(plansReport.plans) ? plansReport.plans : [];
  const plan = plans.find((entry) => entry.id === planId);
  if (!plan) {
    console.log(`Unknown plan ID: ${planId}`);
    const examples = plans.slice(0, 5).map((entry) => entry.id);
    if (examples.length) {
      console.log("Example plan IDs:");
      examples.forEach((id) => console.log(`- ${id}`));
    }
    process.exit(1);
  }

  const expiresAt = validateExpiry(expiresAtRaw);
  if (expiresAt === undefined) {
    console.log(`Invalid --expires value: ${expiresAtRaw}`);
    console.log("Use an ISO datetime, for example 2026-06-01T12:00:00Z");
    process.exit(1);
  }

  const approvedFor = approvalScope({ safetyLevel: plan.safetyLevel, allowApply });
  const approvals = readJson(approvalsPath, { generatedAt: null, approvals: [] });
  const existing = Array.isArray(approvals.approvals) ? approvals.approvals : [];
  const nowIso = new Date().toISOString();

  const record = {
    planId: plan.id,
    approvedAt: nowIso,
    approvedFor,
    safetyLevel: plan.safetyLevel,
    requiredHumanReview: Boolean(plan.requiredHumanReview),
    approvalNote: approvalNote || "",
    expiresAt: expiresAt || null,
    sourcePlanTitle: plan.title,
  };

  const nextApprovals = existing.filter((item) => item.planId !== plan.id);
  nextApprovals.push(record);

  const payload = {
    generatedAt: nowIso,
    approvals: nextApprovals.sort((a, b) => String(a.planId).localeCompare(String(b.planId))),
  };

  fs.writeFileSync(approvalsPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  persistApprovalToDb({ tenantId: tenant.tenantId, record });

  console.log("SEO Plan Approval Gate");
  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Plan: ${record.planId} - ${record.sourcePlanTitle}`);
  console.log(`Approved for: ${record.approvedFor}`);
  console.log(`Safety: ${record.safetyLevel} · requiredHumanReview=${record.requiredHumanReview ? "yes" : "no"}`);
  if (record.expiresAt) console.log(`Expires at: ${record.expiresAt}`);
  if (record.approvalNote) console.log(`Note: ${record.approvalNote}`);
  if (record.safetyLevel === "high_review_required" && !allowApply) {
    console.log("Warning: high_review_required plans are approved for proposal only.");
    console.log("Applying patches still needs explicit review and --allow-apply.");
  }
  if (approvedFor === "apply_patch") {
    console.log("Warning: apply_patch approval recorded. Human review is still mandatory before any commit.");
  }
  console.log(`Approval file: ${approvalsPath}`);
}

main();
