import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const BRIEF_JSON_PATH = path.join(repoRoot, "reports/sentinel-implementation-brief.json");
const PACKAGE_JSON_PATH = path.join(repoRoot, "reports/sentinel-work-package.json");
const PACKAGE_MD_PATH = path.join(repoRoot, "reports/sentinel-work-package.md");

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

function readBrief() {
  if (!fs.existsSync(BRIEF_JSON_PATH)) {
    fail("Missing reports/sentinel-implementation-brief.json. Run npm run platform:roadmap:brief -- --item <id> first.", "IMPLEMENTATION_BRIEF_MISSING");
  }

  const brief = readJson(BRIEF_JSON_PATH, null);
  if (!brief || !brief.approvedItemId || !brief.title) {
    fail("Implementation brief is invalid. Regenerate it with npm run platform:roadmap:brief -- --item <id>.", "IMPLEMENTATION_BRIEF_INVALID");
  }
  return brief;
}

function requireActiveBrief(brief, itemId) {
  if (itemId && brief.approvedItemId !== itemId) {
    fail(`Implementation brief is for ${brief.approvedItemId}, not ${itemId}. Run npm run platform:roadmap:brief -- --item ${itemId}.`, "IMPLEMENTATION_BRIEF_ITEM_MISMATCH");
  }

  const approval = brief.approval || {};
  if (approval.status !== "approved" || approval.approvedFor !== "implementation") {
    fail("Implementation brief is not actively approved for implementation.", "IMPLEMENTATION_BRIEF_NOT_APPROVED");
  }

  const expiresAt = new Date(approval.expiresAt || "");
  if (Number.isNaN(expiresAt.getTime())) {
    fail("Implementation brief approval expiry is missing or invalid. Reapprove the roadmap item.", "IMPLEMENTATION_BRIEF_EXPIRY_INVALID");
  }
  if (expiresAt.getTime() <= Date.now()) {
    fail("Implementation brief approval has expired. Reapprove the roadmap item before exporting a work package.", "IMPLEMENTATION_BRIEF_EXPIRED");
  }

  return brief;
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function sentence(value = "") {
  const text = String(value || "").trim();
  if (!text) return "Not recorded.";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function buildImplementationInstructions(brief) {
  const steps = [
    "Start by running git status --short and stop if unexpected tracked changes are present.",
    "Read this work package fully before editing files.",
    "Inspect only the files likely involved, plus any directly related helper modules needed to understand the approved scope.",
    ...list(brief.proposedImplementationSteps),
    "Make the smallest coherent implementation that satisfies the objective and stays inside scope.",
    "Run the validation commands listed in this work package.",
    "Commit only the approved implementation files after validation passes, if the operator requested commit/push for that implementation task.",
  ];

  return [...new Set(steps)];
}

function buildPackage(brief) {
  const generatedAt = new Date().toISOString();
  return {
    generatedAt,
    workPackageOnly: true,
    noCodeChanged: true,
    noPatchGenerated: true,
    noImplementationExecuted: true,
    sourceBriefPath: "reports/sentinel-implementation-brief.json",
    title: `Implement Sentinel improvement: ${brief.title}`,
    approvedRoadmapItem: {
      id: brief.approvedItemId,
      title: brief.title,
      approvalStatus: brief.approval.status,
      approvalExpiresAt: brief.approval.expiresAt,
      safetyLevel: brief.approval.safetyLevel || "review_required",
    },
    objective: sentence(brief.desiredOutcome),
    currentContext: [
      sentence(brief.problemStatement),
      `The roadmap item has active approval for implementation until ${brief.approval.expiresAt}.`,
      "This work package is a handoff file only. It does not run Codex or apply changes by itself.",
    ],
    exactScope: list(brief.implementationScope),
    outOfScope: list(brief.outOfScope),
    filesLikelyInvolved: list(brief.filesLikelyInvolved),
    implementationInstructions: buildImplementationInstructions(brief),
    safetyConstraints: [
      "You are implementing this work package.",
      "Do not broaden scope.",
      "Do not modify unrelated files.",
      "Stop if unexpected dirty files appear.",
      "Do not touch src/quizlift.",
      "Do not change SEO scoring unless explicitly in scope.",
      "Do not expose operator-only state, roadmap plans, approvals, briefs or work packages on /seo-progress.",
      ...list(brief.safetyConstraints),
    ],
    stopConditions: [
      "Stop if unexpected dirty files appear.",
      "Stop if the implementation requires files outside the likely scope and the reason is not obvious.",
      "Stop if validation fails and the fix is not clearly within this approved work package.",
      "Stop if secrets, credentials, deployment or production access are required.",
      ...list(brief.stopConditions),
    ],
    validationCommands: list(brief.validationCommands).length
      ? list(brief.validationCommands)
      : ["npm run lint", "npm run build", "npm run seo:monitor"],
    expectedDeliverables: [
      "A concise implementation within the approved scope only.",
      "No changes to src/quizlift.",
      "No SEO scoring changes unless explicitly in scope.",
      "Validation results for every listed command.",
      "A final response that states files changed, behaviour changed, validation results and final git status.",
    ],
    commitMessage: brief.suggestedCommitMessage || `Implement Sentinel improvement: ${brief.title}`,
    finalResponseChecklist: [
      "Files changed",
      "Implementation summary",
      "Safety constraints respected",
      "Validation results",
      "Commit hash if committed",
      "Push result if pushed",
      "Final git status",
    ],
  };
}

function linesForList(items) {
  const safeItems = list(items);
  return safeItems.length ? safeItems.map((item) => `- ${item}`) : ["- Not recorded."];
}

function markdownForPackage(workPackage) {
  const lines = [
    "# Sentinel Implementation Work Package",
    "",
    "You are implementing this work package. Do not broaden scope. Stop if unexpected dirty files appear.",
    "",
    `Generated: ${workPackage.generatedAt}`,
    `Source brief: ${workPackage.sourceBriefPath}`,
    "",
    "This file is an operator-controlled handoff. It does not run Codex, generate patches or apply code changes by itself.",
    "",
    `## ${workPackage.title}`,
    "",
    `Approved roadmap item: ${workPackage.approvedRoadmapItem.id}`,
    `Approval status: ${workPackage.approvedRoadmapItem.approvalStatus}`,
    `Approval expires: ${workPackage.approvedRoadmapItem.approvalExpiresAt}`,
    `Safety level: ${workPackage.approvedRoadmapItem.safetyLevel}`,
    "",
    "## Objective",
    "",
    workPackage.objective,
    "",
    "## Current Context",
    "",
    ...linesForList(workPackage.currentContext),
    "",
    "## Exact Scope",
    "",
    ...linesForList(workPackage.exactScope),
    "",
    "## Out Of Scope",
    "",
    ...linesForList(workPackage.outOfScope),
    "",
    "## Files Likely Involved",
    "",
    ...linesForList(workPackage.filesLikelyInvolved),
    "",
    "## Step By Step Implementation Instructions",
    "",
    ...list(workPackage.implementationInstructions).map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Safety Constraints",
    "",
    ...linesForList(workPackage.safetyConstraints),
    "",
    "## Stop Conditions",
    "",
    ...linesForList(workPackage.stopConditions),
    "",
    "## Validation Commands",
    "",
    ...linesForList(workPackage.validationCommands),
    "",
    "## Expected Deliverables",
    "",
    ...linesForList(workPackage.expectedDeliverables),
    "",
    "## Commit Message",
    "",
    workPackage.commitMessage,
    "",
    "## Final Response Checklist",
    "",
    ...linesForList(workPackage.finalResponseChecklist),
    "",
    "## Explicit Implementation Rules",
    "",
    "- Do not touch src/quizlift.",
    "- Do not change SEO scoring unless explicitly in scope.",
    "- Do not modify unrelated files.",
    "- Stop if validation fails.",
    "- Keep /seo-progress stakeholder-safe.",
    "",
  ];

  return `${lines.join("\n")}\n`;
}

function writePackage(workPackage) {
  fs.mkdirSync(path.dirname(PACKAGE_JSON_PATH), { recursive: true });
  fs.writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(workPackage, null, 2)}\n`);
  fs.writeFileSync(PACKAGE_MD_PATH, markdownForPackage(workPackage));
}

function printSummary(workPackage, dryRun = false) {
  console.log("Sentinel Implementation Work Package");
  console.log("");
  console.log(dryRun ? "Dry run: work package files not written." : "Work package files generated locally.");
  console.log("Export/handoff only. No code changed. No patch generated. No implementation executed.");
  console.log("");
  console.log(`Item: ${workPackage.approvedRoadmapItem.id}`);
  console.log(`Title: ${workPackage.title}`);
  console.log(`Approval expires: ${workPackage.approvedRoadmapItem.approvalExpiresAt}`);
  console.log(`Likely files: ${workPackage.filesLikelyInvolved.join(", ")}`);
  console.log(`Commit message: ${workPackage.commitMessage}`);
  if (!dryRun) {
    console.log("");
    console.log("Generated:");
    console.log("- reports/sentinel-work-package.json");
    console.log("- reports/sentinel-work-package.md");
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const brief = requireActiveBrief(readBrief(), args.item);
  const workPackage = buildPackage(brief);

  if (!args.dryRun) writePackage(workPackage);
  printSummary(workPackage, args.dryRun);
} catch (error) {
  console.error(`Roadmap work package error: ${error.message}`);
  if (error.code === "IMPLEMENTATION_BRIEF_MISSING") {
    console.error("Run: npm run platform:roadmap:brief -- --item <id>");
  }
  process.exit(1);
}
