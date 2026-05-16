import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const PACKAGE_JSON_PATH = path.join(repoRoot, "reports/sentinel-work-package.json");
const REVIEW_JSON_PATH = path.join(repoRoot, "reports/sentinel-work-package-review.json");

const REQUIRED_SAFETY_TERMS = [
  "do not touch src/quizlift",
  "do not change seo scoring",
  "do not modify unrelated files",
  "stop if unexpected dirty files appear",
];

const FORBIDDEN_PATH_PATTERNS = [
  { label: "src/quizlift", test: (value) => value.includes("src/quizlift") },
  { label: "secrets", test: (value) => /(^|\/)secrets?(\/|$)/.test(value) || value.includes("credentials") },
  { label: ".env", test: (value) => /(^|\/)\.env(\.|$|\/)/.test(value) || value.endsWith("/.env") || value === ".env" },
  { label: "platform.db", test: (value) => value.includes("platform.db") },
  { label: "generated reports", test: (value) => value.startsWith("reports/") || value.includes("/reports/") },
];

function parseArgs(argv) {
  const args = { item: "", json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--item") {
      args.item = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--json") {
      args.json = true;
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

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalise(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function createReview(itemId = "", title = "") {
  return {
    reviewedAt: new Date().toISOString(),
    status: "pass",
    itemId,
    title,
    checks: [],
    warnings: [],
    failures: [],
    recommendedNextStep: "",
  };
}

function addCheck(review, name, status, message) {
  review.checks.push({ name, status, message });
  if (status === "warning") review.warnings.push(message);
  if (status === "fail") review.failures.push(message);
}

function readPackage() {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) return null;
  return readJson(PACKAGE_JSON_PATH, null);
}

function checkPackageIntegrity(review, workPackage, requestedItemId) {
  if (!workPackage) {
    addCheck(review, "package_integrity", "fail", "Missing reports/sentinel-work-package.json. Run npm run platform:roadmap:package -- --item <id>.");
    return;
  }

  const packageItemId = workPackage.approvedRoadmapItem?.id || "";
  const requiredBooleans = [workPackage.workPackageOnly, workPackage.noCodeChanged, workPackage.noPatchGenerated, workPackage.noImplementationExecuted];
  if (!packageItemId || !workPackage.title || !requiredBooleans.every(Boolean)) {
    addCheck(review, "package_integrity", "fail", "Work package is missing required metadata or safety flags.");
    return;
  }

  if (requestedItemId && packageItemId !== requestedItemId) {
    addCheck(review, "package_item", "fail", `Work package is for ${packageItemId}, not ${requestedItemId}.`);
  } else {
    addCheck(review, "package_integrity", "pass", "Work package metadata and safety flags are present.");
  }
}

function checkApproval(review, workPackage) {
  const approval = workPackage?.approvedRoadmapItem || {};
  const expiresAt = new Date(approval.approvalExpiresAt || "");
  if (approval.approvalStatus !== "approved") {
    addCheck(review, "approval", "fail", "Work package approval status is not approved.");
    return;
  }
  if (Number.isNaN(expiresAt.getTime())) {
    addCheck(review, "approval", "fail", "Work package approval expiry is missing or invalid.");
    return;
  }
  if (expiresAt.getTime() <= Date.now()) {
    addCheck(review, "approval", "fail", "Work package approval has expired.");
    return;
  }
  addCheck(review, "approval", "pass", `Approval is active until ${approval.approvalExpiresAt}.`);
}

function checkSafetyConstraints(review, workPackage) {
  const safetyText = [
    ...list(workPackage?.safetyConstraints),
    ...list(workPackage?.stopConditions),
    ...list(workPackage?.expectedDeliverables),
  ].map(normalise).join("\n");

  const missing = REQUIRED_SAFETY_TERMS.filter((term) => !safetyText.includes(term));
  if (missing.length) {
    addCheck(review, "safety_constraints", "fail", `Missing required safety constraints: ${missing.join(", ")}.`);
    return;
  }
  addCheck(review, "safety_constraints", "pass", "Required safety constraints are present.");
}

function checkValidationCommands(review, workPackage) {
  const commands = list(workPackage?.validationCommands).map((command) => String(command).trim());
  if (!commands.length) {
    addCheck(review, "validation_commands", "fail", "No validation commands are listed.");
    return;
  }

  const required = ["npm run lint", "npm run build", "npm run seo:monitor"];
  const missing = required.filter((command) => !commands.includes(command));
  if (missing.length) {
    addCheck(review, "validation_commands", "warning", `Recommended validation commands missing: ${missing.join(", ")}.`);
    return;
  }
  addCheck(review, "validation_commands", "pass", "Validation commands are present.");
}

function checkForbiddenPaths(review, workPackage) {
  const files = list(workPackage?.filesLikelyInvolved).map((filePath) => normalise(filePath));
  const hits = [];
  for (const filePath of files) {
    for (const pattern of FORBIDDEN_PATH_PATTERNS) {
      if (pattern.test(filePath)) hits.push(`${filePath} (${pattern.label})`);
    }
  }

  if (hits.length) {
    addCheck(review, "forbidden_paths", "fail", `Forbidden likely files found: ${[...new Set(hits)].join(", ")}.`);
    return;
  }
  addCheck(review, "forbidden_paths", "pass", "No forbidden likely files found.");
}

function gitStatusShort() {
  try {
    return execFileSync("git", ["status", "--short"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch (error) {
    return `git status failed: ${error.message}`;
  }
}

function checkWorktree(review) {
  const status = gitStatusShort();
  if (!status) {
    addCheck(review, "worktree", "pass", "Tracked worktree is clean.");
    return;
  }
  addCheck(review, "worktree", "warning", `Tracked worktree is not clean. Review before implementation:\n${status}`);
}

function finaliseReview(review) {
  if (review.failures.length) {
    review.status = "fail";
    review.recommendedNextStep = "Resolve review failures before handing the work package to Codex.";
  } else if (review.warnings.length) {
    review.status = "warning";
    review.recommendedNextStep = "Review warnings before handing reports/sentinel-work-package.md to Codex for implementation.";
  } else {
    review.status = "pass";
    review.recommendedNextStep = "Hand reports/sentinel-work-package.md to Codex for implementation.";
  }
  return review;
}

function writeReview(review) {
  fs.mkdirSync(path.dirname(REVIEW_JSON_PATH), { recursive: true });
  fs.writeFileSync(REVIEW_JSON_PATH, `${JSON.stringify(review, null, 2)}\n`);
}

function buildReview(args) {
  const workPackage = readPackage();
  const itemId = workPackage?.approvedRoadmapItem?.id || args.item || "";
  const title = workPackage?.title || "";
  const review = createReview(itemId, title);

  checkPackageIntegrity(review, workPackage, args.item);
  if (workPackage) {
    checkApproval(review, workPackage);
    checkSafetyConstraints(review, workPackage);
    checkValidationCommands(review, workPackage);
    checkForbiddenPaths(review, workPackage);
  }
  checkWorktree(review);
  return finaliseReview(review);
}

function printReview(review) {
  const check = (name) => review.checks.find((entry) => entry.name === name);
  console.log("Sentinel Work Package Review");
  console.log("");
  console.log(`Item: ${review.itemId || "unknown"}`);
  if (review.title) console.log(`Title: ${review.title}`);
  console.log(`Approval: ${check("approval")?.status || "not checked"}`);
  console.log(`Scope: ${check("package_integrity")?.status || check("package_item")?.status || "not checked"}`);
  console.log(`Forbidden paths: ${check("forbidden_paths")?.status === "pass" ? "none" : check("forbidden_paths")?.status || "not checked"}`);
  console.log(`Validation commands: ${check("validation_commands")?.status || "not checked"}`);
  console.log(`Worktree: ${check("worktree")?.status || "not checked"}`);
  console.log("");
  console.log(`Status: ${review.status.toUpperCase()}`);

  if (review.failures.length) {
    console.log("");
    console.log("Failures:");
    review.failures.forEach((failure) => console.log(`- ${failure}`));
  }
  if (review.warnings.length) {
    console.log("");
    console.log("Warnings:");
    review.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  console.log("");
  console.log("Recommended next step:");
  console.log(review.recommendedNextStep);
  console.log("");
  console.log("Generated:");
  console.log("- reports/sentinel-work-package-review.json");
}

const args = parseArgs(process.argv.slice(2));
const review = buildReview(args);
writeReview(review);

if (args.json) {
  console.log(JSON.stringify(review, null, 2));
} else {
  printReview(review);
}

if (review.status === "fail") process.exit(1);
