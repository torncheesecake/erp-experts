import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const PLAN_JSON_PATH = path.join(repoRoot, "reports/sentinel-roadmap-plan.json");
const APPROVALS_PATH = path.join(repoRoot, "reports/sentinel-roadmap-approvals.json");
const APPROVED_FOR_VALUES = new Set(["implementation"]);

function parseArgs(argv) {
  const args = {
    item: "",
    approvedFor: "implementation",
    note: "",
    expiresDays: 14,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--item") {
      args.item = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--approved-for") {
      args.approvedFor = argv[i + 1] || "implementation";
      i += 1;
    } else if (arg === "--note") {
      args.note = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--expires-days") {
      args.expiresDays = Number(argv[i + 1] || 14);
      i += 1;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readPlanPayload() {
  if (!fs.existsSync(PLAN_JSON_PATH)) {
    const error = new Error("Missing reports/sentinel-roadmap-plan.json. Run npm run platform:roadmap:plan first.");
    error.code = "ROADMAP_PLAN_MISSING";
    throw error;
  }

  const payload = readJson(PLAN_JSON_PATH, null);
  if (!payload || !Array.isArray(payload.plans) || payload.plans.length === 0) {
    const error = new Error("Roadmap plan file has no plans. Run npm run platform:roadmap:plan again.");
    error.code = "ROADMAP_PLAN_EMPTY";
    throw error;
  }
  return payload;
}

function selectPlan(payload, itemId) {
  if (itemId) {
    const plan = payload.plans.find((entry) => entry.roadmapItemId === itemId);
    if (!plan) {
      const error = new Error(`Roadmap plan item not found: ${itemId}`);
      error.code = "ROADMAP_PLAN_ITEM_NOT_FOUND";
      throw error;
    }
    return plan;
  }

  if (payload.plans.length === 1) return payload.plans[0];

  const error = new Error("Multiple roadmap plans exist. Re-run with --item <roadmapItemId>.");
  error.code = "ROADMAP_PLAN_ITEM_REQUIRED";
  throw error;
}

function cleanText(value = "", max = 500) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function expiresAtFromDays(days) {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 14;
  return new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000).toISOString();
}

function buildApproval(plan, args) {
  const approvedFor = String(args.approvedFor || "implementation").trim().toLowerCase();
  if (!APPROVED_FOR_VALUES.has(approvedFor)) {
    const error = new Error(`Unsupported approval scope: ${approvedFor}. Allowed: implementation.`);
    error.code = "ROADMAP_APPROVAL_SCOPE_INVALID";
    throw error;
  }

  const approvedAt = new Date().toISOString();
  return {
    id: `roadmap-approval-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
    roadmapItemId: plan.roadmapItemId,
    title: plan.title,
    approvedFor,
    approvedAt,
    expiresAt: expiresAtFromDays(args.expiresDays),
    approvalNote: cleanText(args.note || "Approved for implementation planning."),
    sourcePlanPath: "reports/sentinel-roadmap-plan.json",
    status: "approved",
    safetyLevel: "review_required",
  };
}

function readApprovals() {
  const approvals = readJson(APPROVALS_PATH, []);
  return Array.isArray(approvals) ? approvals : [];
}

function writeApproval(approval) {
  fs.mkdirSync(path.dirname(APPROVALS_PATH), { recursive: true });
  const approvals = readApprovals();
  fs.writeFileSync(APPROVALS_PATH, `${JSON.stringify([approval, ...approvals], null, 2)}\n`);
}

function printApproval(approval, dryRun = false) {
  console.log("Sentinel Roadmap Implementation Approval");
  console.log("");
  console.log(dryRun ? "Dry run: approval file not written." : "Approval recorded locally.");
  console.log("Approval metadata only. No code changed. No patch generated. No implementation executed.");
  console.log("");
  console.log(`Roadmap item: ${approval.roadmapItemId}`);
  console.log(`Title: ${approval.title}`);
  console.log(`Approved for: ${approval.approvedFor}`);
  console.log(`Status: ${approval.status}`);
  console.log(`Safety level: ${approval.safetyLevel}`);
  console.log(`Expires: ${approval.expiresAt}`);
  if (approval.approvalNote) console.log(`Note: ${approval.approvalNote}`);
  if (!dryRun) {
    console.log("");
    console.log("Generated:");
    console.log("- reports/sentinel-roadmap-approvals.json");
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const planPayload = readPlanPayload();
  const plan = selectPlan(planPayload, args.item);
  const approval = buildApproval(plan, args);

  if (!args.dryRun) writeApproval(approval);
  printApproval(approval, args.dryRun);
} catch (error) {
  console.error(`Roadmap approval error: ${error.message}`);
  if (error.code === "ROADMAP_PLAN_MISSING") {
    console.error("Run: npm run platform:roadmap:plan");
  }
  process.exit(1);
}
