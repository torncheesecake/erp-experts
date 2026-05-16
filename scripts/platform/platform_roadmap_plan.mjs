import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const ROADMAP_JSON_PATH = path.join(repoRoot, "reports/sentinel-roadmap.json");
const PLAN_JSON_PATH = path.join(repoRoot, "reports/sentinel-roadmap-plan.json");
const PLAN_MD_PATH = path.join(repoRoot, "reports/sentinel-roadmap-plan.md");

function parseArgs(argv) {
  const args = { item: "", top: 1, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--item") {
      args.item = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--top") {
      args.top = Number(argv[i + 1] || 1);
      i += 1;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    }
  }
  return args;
}

function readRoadmap() {
  if (!fs.existsSync(ROADMAP_JSON_PATH)) {
    const error = new Error("Missing reports/sentinel-roadmap.json. Run npm run platform:roadmap first.");
    error.code = "ROADMAP_MISSING";
    throw error;
  }

  const roadmap = JSON.parse(fs.readFileSync(ROADMAP_JSON_PATH, "utf8"));
  if (!Array.isArray(roadmap.items) || roadmap.items.length === 0) {
    const error = new Error("Roadmap has no actionable items. Add or triage feedback, then run npm run platform:roadmap again.");
    error.code = "ROADMAP_EMPTY";
    throw error;
  }
  return roadmap;
}

function sentence(value = "") {
  const text = String(value || "").trim();
  if (!text) return "Not recorded.";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function categoryScope(item) {
  const sections = Array.isArray(item.linkedSections) && item.linkedSections.length ? item.linkedSections.join(", ") : "Control Centre";
  if (item.category === "deployment") return `Deployment/readiness workflow around ${sections}.`;
  if (item.category === "automation") return `Automation cadence workflow around ${sections}.`;
  if (item.category === "tenant") return `Tenant visibility workflow around ${sections}.`;
  if (item.category === "api") return `Local API/operator state workflow around ${sections}.`;
  if (item.category === "ux") return `Operator UI and copy around ${sections}.`;
  return `Operator workflow around ${sections}.`;
}

function proposedSteps(item) {
  const base = [
    "Read the linked feedback and confirm the friction is still valid.",
    "Inspect the current Control Centre section or script flow related to the roadmap item.",
    "Define the smallest safe change that addresses the friction without broad refactoring.",
  ];

  if (item.category === "deployment") {
    base.push("Check existing readiness, backup and service scaffold docs before proposing any deployment change.");
    base.push("Keep any deployment change read-only or scaffold-only until a separate deployment task is approved.");
  } else if (item.category === "automation") {
    base.push("Map the current cadence output and decide whether the operator needs clearer status, next action or failure visibility.");
  } else if (item.category === "ux" || item.category === "workflow") {
    base.push("Sketch the desired operator flow and decide whether copy, grouping or a compact UI affordance is enough.");
  } else if (item.category === "api") {
    base.push("Check local API behaviour and preserve report fallback before proposing any API-backed UI change.");
  } else if (item.category === "tenant") {
    base.push("Keep ERP Experts as the only active tenant and avoid enabling tenant switching unless separately approved.");
  }

  base.push("Write a scoped implementation task with explicit files, validation commands and non-goals before coding.");
  return base;
}

function buildPlan(item, roadmap) {
  const feedbackIds = Array.isArray(item.linkedFeedbackIds) ? item.linkedFeedbackIds : [];
  const linkedSections = Array.isArray(item.linkedSections) ? item.linkedSections : [];
  return {
    generatedAt: new Date().toISOString(),
    planningOnly: true,
    noCodeChanged: true,
    noPatchGenerated: true,
    roadmapGeneratedAt: roadmap.generatedAt || null,
    roadmapItemId: item.id,
    title: item.title,
    category: item.category,
    problemStatement: `${sentence(item.rationale)} The current risk is that this friction remains implicit instead of being converted into a scoped platform improvement.`,
    currentEvidence: {
      source: item.source,
      rationale: item.rationale,
      impact: item.impact,
      effort: item.effort,
      urgency: item.urgency,
      confidence: item.confidence,
      suggestedPriority: item.suggestedPriority,
      linkedFeedbackIds: feedbackIds,
      linkedSections,
    },
    desiredOutcome: `A reviewable, low-risk Sentinel improvement proposal that addresses ${item.title.toLowerCase()} without changing SEO scoring or public stakeholder behaviour.`,
    scope: [
      categoryScope(item),
      "Operator-only Sentinel workflow, dashboard or scaffold improvements.",
      "Documentation updates that explain the intended workflow clearly.",
    ],
    outOfScope: [
      "Autonomous coding or patch generation from this plan.",
      "Changes to SEO scoring logic or article content.",
      "Any changes under src/quizlift.",
      "Public stakeholder route exposure on /seo-progress.",
      "Deployment, credentials, external APIs or production service changes unless separately approved.",
    ],
    proposedImplementationSteps: proposedSteps(item),
    safetyConstraints: [
      "Planning only. No code changes are made by this command.",
      "No patch is generated and no implementation is auto-applied.",
      "Keep all roadmap plans local and ignored until intentionally converted into source/docs work.",
      "Preserve current ERP Experts SEO command behaviour.",
      "Keep operator-only data out of /seo-progress.",
    ],
    validationChecklist: [
      "npm run lint",
      "npm run build",
      "npm run platform:roadmap",
      "npm run platform:roadmap:plan",
      "npm run seo:monitor",
      "Manual check: /seo-roadmap still shows operator-only planning context.",
      "Manual check: /seo-progress does not expose Sentinel roadmap plans.",
    ],
    rollbackNotes: [
      "Because this is planning-only, rollback is deleting ignored reports/sentinel-roadmap-plan.md and reports/sentinel-roadmap-plan.json.",
      "If a later implementation uses this plan and causes issues, revert that later source commit rather than changing feedback history blindly.",
    ],
    suggestedCommitMessage: `Plan Sentinel improvement: ${item.title}`,
    humanReviewNotes: [
      "Matthew should confirm that the roadmap item is still worth prioritising before implementation.",
      "Check whether the linked feedback is real usage friction or validation noise.",
      "Approve a separate implementation task before any source code changes are made.",
    ],
  };
}

function selectItems(roadmap, args) {
  if (args.item) {
    const item = roadmap.items.find((entry) => entry.id === args.item);
    if (!item) {
      const error = new Error(`Roadmap item not found: ${args.item}`);
      error.code = "ROADMAP_ITEM_NOT_FOUND";
      throw error;
    }
    return [item];
  }

  const count = Number.isFinite(args.top) ? Math.max(Math.floor(args.top), 1) : 1;
  return roadmap.items.slice(0, count);
}

function markdownForPlan(planPayload) {
  const plans = planPayload.plans;
  const lines = [
    "# Sentinel Roadmap Implementation Plan",
    "",
    `Generated: ${planPayload.generatedAt}`,
    "",
    "Planning only. No code changed. No patch generated. Safe to review before implementation.",
    "",
  ];

  for (const plan of plans) {
    lines.push(
      `## ${plan.title}`,
      "",
      `Roadmap item ID: ${plan.roadmapItemId}`,
      `Category: ${plan.category}`,
      "",
      "### Problem Statement",
      "",
      plan.problemStatement,
      "",
      "### Current Evidence",
      "",
      `- Source: ${plan.currentEvidence.source}`,
      `- Impact: ${plan.currentEvidence.impact}`,
      `- Effort: ${plan.currentEvidence.effort}`,
      `- Urgency: ${plan.currentEvidence.urgency}`,
      `- Confidence: ${plan.currentEvidence.confidence}`,
      `- Linked feedback: ${plan.currentEvidence.linkedFeedbackIds.length ? plan.currentEvidence.linkedFeedbackIds.join(", ") : "None"}`,
      `- Linked sections: ${plan.currentEvidence.linkedSections.length ? plan.currentEvidence.linkedSections.join(", ") : "None"}`,
      `- Rationale: ${plan.currentEvidence.rationale}`,
      "",
      "### Desired Outcome",
      "",
      plan.desiredOutcome,
      "",
      "### Scope",
      "",
      ...plan.scope.map((item) => `- ${item}`),
      "",
      "### Out Of Scope",
      "",
      ...plan.outOfScope.map((item) => `- ${item}`),
      "",
      "### Proposed Implementation Steps",
      "",
      ...plan.proposedImplementationSteps.map((item, index) => `${index + 1}. ${item}`),
      "",
      "### Safety Constraints",
      "",
      ...plan.safetyConstraints.map((item) => `- ${item}`),
      "",
      "### Validation Checklist",
      "",
      ...plan.validationChecklist.map((item) => `- ${item}`),
      "",
      "### Rollback Notes",
      "",
      ...plan.rollbackNotes.map((item) => `- ${item}`),
      "",
      "### Suggested Commit Message",
      "",
      plan.suggestedCommitMessage,
      "",
      "### Human Review Notes",
      "",
      ...plan.humanReviewNotes.map((item) => `- ${item}`),
      "",
    );
  }

  return `${lines.join("\n")}\n`;
}

function writePlan(planPayload) {
  fs.mkdirSync(path.dirname(PLAN_JSON_PATH), { recursive: true });
  fs.writeFileSync(PLAN_JSON_PATH, `${JSON.stringify(planPayload, null, 2)}\n`);
  fs.writeFileSync(PLAN_MD_PATH, markdownForPlan(planPayload));
}

function printSummary(planPayload, dryRun = false) {
  console.log("Sentinel Roadmap Action Planning");
  console.log("");
  console.log(dryRun ? "Dry run: no plan files written." : "Plan files generated.");
  console.log("Planning only. No code changed. No patch generated.");
  console.log("");
  for (const plan of planPayload.plans) {
    console.log(`- ${plan.title}`);
    console.log(`  Item: ${plan.roadmapItemId}`);
    console.log(`  Category: ${plan.category}`);
    console.log(`  Next: ${plan.proposedImplementationSteps[0]}`);
  }
  if (!dryRun) {
    console.log("");
    console.log("Generated:");
    console.log("- reports/sentinel-roadmap-plan.json");
    console.log("- reports/sentinel-roadmap-plan.md");
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const roadmap = readRoadmap();
  const items = selectItems(roadmap, args);
  const planPayload = {
    generatedAt: new Date().toISOString(),
    planningOnly: true,
    roadmapGeneratedAt: roadmap.generatedAt || null,
    selectedCount: items.length,
    plans: items.map((item) => buildPlan(item, roadmap)),
  };

  if (!args.dryRun) writePlan(planPayload);
  printSummary(planPayload, args.dryRun);
} catch (error) {
  console.error(`Roadmap planning error: ${error.message}`);
  if (error.code === "ROADMAP_MISSING") {
    console.error("Run: npm run platform:roadmap");
  }
  process.exit(1);
}
