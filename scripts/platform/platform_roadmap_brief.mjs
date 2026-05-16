import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const PLAN_JSON_PATH = path.join(repoRoot, "reports/sentinel-roadmap-plan.json");
const APPROVALS_PATH = path.join(repoRoot, "reports/sentinel-roadmap-approvals.json");
const BRIEF_JSON_PATH = path.join(repoRoot, "reports/sentinel-implementation-brief.json");
const BRIEF_MD_PATH = path.join(repoRoot, "reports/sentinel-implementation-brief.md");

function parseArgs(argv) {
  const args = { item: "", dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--item") {
      args.item = argv[i + 1] || "";
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

function fail(message, code) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function readPlanPayload() {
  if (!fs.existsSync(PLAN_JSON_PATH)) {
    fail("Missing reports/sentinel-roadmap-plan.json. Run npm run platform:roadmap:plan first.", "ROADMAP_PLAN_MISSING");
  }

  const payload = readJson(PLAN_JSON_PATH, null);
  if (!payload || !Array.isArray(payload.plans) || payload.plans.length === 0) {
    fail("Roadmap plan file has no plans. Run npm run platform:roadmap:plan again.", "ROADMAP_PLAN_EMPTY");
  }
  return payload;
}

function selectPlan(payload, itemId) {
  if (itemId) {
    const plan = payload.plans.find((entry) => entry.roadmapItemId === itemId);
    if (!plan) fail(`Roadmap plan item not found: ${itemId}`, "ROADMAP_PLAN_ITEM_NOT_FOUND");
    return plan;
  }

  if (payload.plans.length === 1) return payload.plans[0];
  fail("Multiple roadmap plans exist. Re-run with --item <roadmapItemId>.", "ROADMAP_PLAN_ITEM_REQUIRED");
}

function readApprovals() {
  const approvals = readJson(APPROVALS_PATH, []);
  return Array.isArray(approvals) ? approvals : [];
}

function findActiveApproval(itemId) {
  if (!fs.existsSync(APPROVALS_PATH)) {
    fail("Roadmap item is not approved for implementation. Run npm run platform:roadmap:approve first.", "ROADMAP_APPROVAL_MISSING");
  }

  const approvals = readApprovals()
    .filter((approval) => approval.roadmapItemId === itemId && approval.approvedFor === "implementation")
    .sort((a, b) => String(b.approvedAt || "").localeCompare(String(a.approvedAt || "")));

  const activeApproval = approvals.find((approval) => {
    const expiresAt = new Date(approval.expiresAt || "");
    const expired = Number.isNaN(expiresAt.getTime()) ? false : expiresAt.getTime() <= Date.now();
    return approval.status === "approved" && !expired;
  });

  if (!activeApproval) {
    const latest = approvals[0] || null;
    if (latest?.expiresAt) {
      const expiresAt = new Date(latest.expiresAt);
      if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) {
        fail("Roadmap item is not approved for implementation. The latest approval has expired.", "ROADMAP_APPROVAL_EXPIRED");
      }
    }
    fail("Roadmap item is not approved for implementation.", "ROADMAP_APPROVAL_INACTIVE");
  }

  return activeApproval;
}

function sentence(value = "") {
  const text = String(value || "").trim();
  if (!text) return "Not recorded.";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function likelyFilesForPlan(plan) {
  const sections = list(plan.currentEvidence?.linkedSections).map((section) => String(section).toLowerCase());
  const category = String(plan.category || "").toLowerCase();
  const files = new Set(["platform/README.md", "docs/SEO_SYSTEM_CHECKPOINT.md"]);

  if (["ux", "workflow", "automation", "tenant", "api"].includes(category) || sections.length) {
    files.add("src/pages/SeoRoadmap.jsx");
  }
  if (category === "workflow" || sections.includes("actions")) {
    files.add("platform/actions/actions.json");
    files.add("platform/commands/commands.json");
  }
  if (category === "automation" || sections.includes("cadence")) {
    files.add("scripts/platform/platform_cadence.mjs");
    files.add("docs/SENTINEL_AUTOMATION_CADENCE.md");
  }
  if (category === "deployment") {
    files.add("scripts/platform/platform_deploy_readiness.mjs");
    files.add("docs/RASPBERRY_PI_SERVICE_PLAN.md");
  }
  if (category === "tenant" || sections.includes("tenants")) {
    files.add("platform/tenants/tenant-registry.json");
  }
  if (category === "api") {
    files.add("platform/api/server.mjs");
    files.add("platform/api/state_api.mjs");
  }

  return [...files];
}

function buildBrief(plan, approval) {
  const generatedAt = new Date().toISOString();
  const validationCommands = list(plan.validationChecklist).filter((item) => String(item).startsWith("npm run"));
  const commands = validationCommands.length
    ? validationCommands
    : ["npm run lint", "npm run build", "npm run seo:monitor"];

  return {
    generatedAt,
    implementationBriefOnly: true,
    noCodeChanged: true,
    noPatchGenerated: true,
    noImplementationExecuted: true,
    approvedItemId: plan.roadmapItemId,
    title: plan.title,
    approval: {
      id: approval.id,
      status: approval.status,
      approvedFor: approval.approvedFor,
      approvedAt: approval.approvedAt,
      expiresAt: approval.expiresAt,
      approvalNote: approval.approvalNote || "",
      safetyLevel: approval.safetyLevel || "review_required",
    },
    problemStatement: plan.problemStatement || "Not recorded.",
    desiredOutcome: plan.desiredOutcome || "A scoped Sentinel improvement implemented only after operator review.",
    implementationScope: list(plan.scope),
    outOfScope: list(plan.outOfScope),
    filesLikelyInvolved: likelyFilesForPlan(plan),
    proposedImplementationSteps: list(plan.proposedImplementationSteps),
    safetyConstraints: [
      ...list(plan.safetyConstraints),
      "Do not modify unrelated files.",
      "Stop if validation fails.",
      "Do not touch src/quizlift.",
      "Do not change SEO scoring unless explicitly required.",
      "Do not expose roadmap plans, approvals or implementation briefs on /seo-progress.",
      "Do not deploy, send notifications or enable services as part of this implementation brief.",
    ],
    validationCommands: commands,
    stopConditions: [
      "Stop if git status contains unexpected tracked changes before implementation starts.",
      "Stop if the approved roadmap item no longer matches the requested implementation task.",
      "Stop if implementation requires changing SEO scoring, article content or src/quizlift.",
      "Stop if validation fails and the fix is not directly related to the approved scope.",
      "Stop if secrets, credentials, deployment or production access become necessary.",
    ],
    suggestedCommitMessage: `Implement Sentinel improvement: ${plan.title}`,
    explicitInstructions: [
      "Do not modify unrelated files.",
      "Stop if validation fails.",
      "Do not touch src/quizlift.",
      "Do not change SEO scoring unless explicitly required.",
      "Keep /seo-progress stakeholder-safe.",
      "Commit only the approved implementation scope after validation passes.",
    ],
  };
}

function markdownForBrief(brief) {
  const lines = [
    "# Sentinel Approved Implementation Brief",
    "",
    `Generated: ${brief.generatedAt}`,
    "",
    "Brief generation only. No code changed. No patch generated. No implementation executed.",
    "",
    `## ${brief.title}`,
    "",
    `Approved item ID: ${brief.approvedItemId}`,
    `Approval status: ${brief.approval.status}`,
    `Approved for: ${brief.approval.approvedFor}`,
    `Approval expires: ${brief.approval.expiresAt}`,
    `Safety level: ${brief.approval.safetyLevel}`,
    brief.approval.approvalNote ? `Approval note: ${brief.approval.approvalNote}` : "Approval note: Not recorded.",
    "",
    "## Problem Statement",
    "",
    sentence(brief.problemStatement),
    "",
    "## Desired Outcome",
    "",
    sentence(brief.desiredOutcome),
    "",
    "## Implementation Scope",
    "",
    ...brief.implementationScope.map((item) => `- ${item}`),
    "",
    "## Out Of Scope",
    "",
    ...brief.outOfScope.map((item) => `- ${item}`),
    "",
    "## Files Likely Involved",
    "",
    ...brief.filesLikelyInvolved.map((item) => `- ${item}`),
    "",
    "## Proposed Implementation Steps",
    "",
    ...brief.proposedImplementationSteps.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Safety Constraints",
    "",
    ...brief.safetyConstraints.map((item) => `- ${item}`),
    "",
    "## Validation Commands",
    "",
    ...brief.validationCommands.map((item) => `- ${item}`),
    "",
    "## Stop Conditions",
    "",
    ...brief.stopConditions.map((item) => `- ${item}`),
    "",
    "## Suggested Commit Message",
    "",
    brief.suggestedCommitMessage,
    "",
    "## Explicit Instructions",
    "",
    ...brief.explicitInstructions.map((item) => `- ${item}`),
    "",
  ];

  return `${lines.join("\n")}\n`;
}

function writeBrief(brief) {
  fs.mkdirSync(path.dirname(BRIEF_JSON_PATH), { recursive: true });
  fs.writeFileSync(BRIEF_JSON_PATH, `${JSON.stringify(brief, null, 2)}\n`);
  fs.writeFileSync(BRIEF_MD_PATH, markdownForBrief(brief));
}

function printSummary(brief, dryRun = false) {
  console.log("Sentinel Approved Implementation Brief");
  console.log("");
  console.log(dryRun ? "Dry run: brief files not written." : "Brief files generated locally.");
  console.log("Brief generation only. No code changed. No patch generated. No implementation executed.");
  console.log("");
  console.log(`Item: ${brief.approvedItemId}`);
  console.log(`Title: ${brief.title}`);
  console.log(`Approval: ${brief.approval.status}`);
  console.log(`Expires: ${brief.approval.expiresAt}`);
  console.log(`Likely files: ${brief.filesLikelyInvolved.join(", ")}`);
  console.log(`Suggested commit: ${brief.suggestedCommitMessage}`);
  if (!dryRun) {
    console.log("");
    console.log("Generated:");
    console.log("- reports/sentinel-implementation-brief.json");
    console.log("- reports/sentinel-implementation-brief.md");
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const planPayload = readPlanPayload();
  const plan = selectPlan(planPayload, args.item);
  const approval = findActiveApproval(plan.roadmapItemId);
  const brief = buildBrief(plan, approval);

  if (!args.dryRun) writeBrief(brief);
  printSummary(brief, args.dryRun);
} catch (error) {
  console.error(`Roadmap brief error: ${error.message}`);
  if (error.code === "ROADMAP_PLAN_MISSING") {
    console.error("Run: npm run platform:roadmap:plan");
  } else if (error.code?.startsWith("ROADMAP_APPROVAL")) {
    console.error("Run: npm run platform:roadmap:approve -- --item <roadmapItemId>");
  }
  process.exit(1);
}
