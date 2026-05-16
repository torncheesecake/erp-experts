import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getActivityFeed } from "../../platform/activity/activity_feed.mjs";
import { readFeedbackItems } from "../../platform/feedback/feedback_store.mjs";
import { getOperationalSummary } from "../../platform/api/state_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const DEFAULT_TENANT = "erp-experts";
const ROADMAP_JSON_PATH = path.join(repoRoot, "reports/sentinel-roadmap.json");
const ROADMAP_MD_PATH = path.join(repoRoot, "reports/sentinel-roadmap.md");

function parseArgs(argv) {
  const args = { tenant: DEFAULT_TENANT, limit: 12 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--tenant") {
      args.tenant = argv[i + 1] || DEFAULT_TENANT;
      i += 1;
    } else if (arg === "--limit") {
      args.limit = Number(argv[i + 1] || 12);
      i += 1;
    }
  }
  return args;
}

function readJsonIfPresent(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function ensureReportsDir() {
  fs.mkdirSync(path.join(repoRoot, "reports"), { recursive: true });
}

function slug(value = "") {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function rankPriority(priority = "medium") {
  return {
    critical: 95,
    high: 78,
    medium: 56,
    low: 35,
  }[priority] || 56;
}

function rankEffort(effort = "medium") {
  return {
    low: 82,
    medium: 56,
    high: 32,
  }[effort] || 56;
}

function effortLabelFromScore(score) {
  if (score >= 70) return "low";
  if (score >= 45) return "medium";
  return "high";
}

function impactLabel(score) {
  if (score >= 82) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function priorityLabel(score) {
  if (score >= 82) return "high";
  if (score >= 58) return "medium";
  return "low";
}

function confidenceLabel({ feedbackCount = 0, acceptedCount = 0, operational = false, deferredOnly = false }) {
  if (deferredOnly) return "low";
  if (operational || acceptedCount > 0 || feedbackCount > 1) return "high";
  if (feedbackCount === 1) return "medium";
  return "low";
}

function urgencyLabel(score) {
  if (score >= 82) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function mostCommon(items, key, fallback = "general") {
  const counts = new Map();
  for (const item of items) {
    const value = item[key] || fallback;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
}

function titleFromCluster(category, section) {
  const sectionLabel = section === "actions" ? "operator actions" : section === "overview" ? "overview workflow" : section.replaceAll("-", " ");
  const categoryLabel = category === "ux" ? "UX" : category;
  return `Improve ${sectionLabel} ${categoryLabel} friction`;
}

function nextStepFromCluster(category, section, topItem) {
  if (topItem?.linkedCommand) return `Review ${topItem.linkedCommand} flow and convert the feedback into a scoped UI or workflow patch.`;
  if (section === "actions") return "Review the Actions section and make the next safe operator step easier to find or run.";
  if (section === "cadence") return "Review cadence visibility and reduce ambiguity around the latest scheduled run.";
  if (section === "tenants") return "Review tenant context and decide whether a read-only switcher prototype is now warranted.";
  if (category === "deployment") return "Review deployment readiness notes before adding any live server behaviour.";
  return "Turn the linked feedback into a small scoped improvement proposal before implementation.";
}

function clusterFeedbackItems(feedbackItems) {
  const actionable = feedbackItems.filter((item) => !["rejected", "done"].includes(item.triageStatus));
  const clusters = new Map();

  for (const item of actionable) {
    const key = `${item.category}:${item.linkedSection || item.section || "general"}`;
    const current = clusters.get(key) || [];
    current.push(item);
    clusters.set(key, current);
  }

  return [...clusters.entries()].map(([key, items]) => {
    const [category, section] = key.split(":");
    const acceptedCount = items.filter((item) => item.triageStatus === "accepted").length;
    const deferredCount = items.filter((item) => item.triageStatus === "deferred").length;
    const deferredOnly = deferredCount === items.length;
    const topItem = [...items].sort((a, b) => rankPriority(b.priority) - rankPriority(a.priority))[0];
    const impactScore = Math.min(
      100,
      Math.round(
        rankPriority(mostCommon(items, "priority", "medium"))
        + Math.min(items.length * 8, 24)
        + (acceptedCount > 0 ? 12 : 0)
        + (["deployment", "api", "automation"].includes(category) ? 8 : 0)
        + (["actions", "overview", "cadence"].includes(section) ? 6 : 0)
        - (deferredOnly ? 22 : 0),
      ),
    );
    const effortScore = Math.round(items.reduce((sum, item) => sum + rankEffort(item.effort), 0) / items.length);
    const urgencyScore = Math.min(100, Math.round((impactScore * 0.7) + (acceptedCount > 0 ? 18 : 0) - (deferredOnly ? 25 : 0)));
    const totalScore = Math.round((impactScore * 0.45) + (effortScore * 0.25) + (urgencyScore * 0.3));

    return {
      id: `roadmap-feedback-${slug(category)}-${slug(section)}`,
      title: titleFromCluster(category, section),
      category,
      source: "operator_feedback",
      impact: impactLabel(impactScore),
      effort: effortLabelFromScore(effortScore),
      urgency: urgencyLabel(urgencyScore),
      confidence: confidenceLabel({ feedbackCount: items.length, acceptedCount, deferredOnly }),
      suggestedPriority: priorityLabel(totalScore),
      score: totalScore,
      rationale: `${items.length} linked feedback item${items.length === 1 ? "" : "s"}; ${acceptedCount} accepted; ${deferredCount} deferred. Highest signal: ${topItem.summary}`,
      linkedFeedbackIds: items.map((item) => item.id),
      linkedSections: [...new Set(items.map((item) => item.linkedSection || item.section || "general"))],
      suggestedNextStep: nextStepFromCluster(category, section, topItem),
    };
  });
}

function buildReadinessItems(readiness) {
  if (!readiness?.checks?.length) return [];
  const warnings = Array.isArray(readiness.warnings) ? readiness.warnings : [];
  const failures = Array.isArray(readiness.failures) ? readiness.failures : [];
  if (!warnings.length && !failures.length) return [];

  return [{
    id: "roadmap-operational-deploy-readiness",
    title: failures.length ? "Resolve deployment readiness blockers" : "Reduce deployment readiness warnings",
    category: "deployment",
    source: "deployment_readiness",
    impact: failures.length ? "high" : "medium",
    effort: "medium",
    urgency: failures.length ? "high" : "medium",
    confidence: "high",
    suggestedPriority: failures.length ? "high" : "medium",
    score: failures.length ? 88 : 66,
    rationale: failures.length
      ? `${failures.length} readiness failure${failures.length === 1 ? "" : "s"} recorded by the deployment gate.`
      : `${warnings.length} readiness warning${warnings.length === 1 ? "" : "s"} recorded by the deployment gate.`,
    linkedFeedbackIds: [],
    linkedSections: ["diagnostics"],
    suggestedNextStep: "Review the readiness warning and decide whether it should become a concrete deployment hardening task.",
  }];
}

function buildOperationalStateItems(state) {
  const items = [];
  const failedRuns = state?.runs?.failed || [];
  if (failedRuns.length) {
    const command = failedRuns[0]?.command || "unknown command";
    items.push({
      id: `roadmap-operational-failed-runs-${slug(command)}`,
      title: `Stabilise failed command: ${command}`,
      category: "workflow",
      source: "operational_state",
      impact: "high",
      effort: "medium",
      urgency: "high",
      confidence: "high",
      suggestedPriority: "high",
      score: 86,
      rationale: `${failedRuns.length} recent failed run${failedRuns.length === 1 ? "" : "s"} found in persisted state.`,
      linkedFeedbackIds: [],
      linkedSections: ["diagnostics"],
      suggestedNextStep: `Run npm run platform:doctor -- --full and inspect ${command} before adding new features.`,
    });
  }

  const workflowState = state?.workflow?.state || "";
  if (["approval_required", "human_review_required", "blocked"].includes(workflowState)) {
    items.push({
      id: `roadmap-operational-workflow-${slug(workflowState)}`,
      title: `Clarify ${workflowState.replaceAll("_", " ")} workflow`,
      category: "workflow",
      source: "operational_state",
      impact: workflowState === "blocked" ? "high" : "medium",
      effort: "medium",
      urgency: workflowState === "blocked" ? "high" : "medium",
      confidence: "medium",
      suggestedPriority: workflowState === "blocked" ? "high" : "medium",
      score: workflowState === "blocked" ? 84 : 63,
      rationale: `Current Sentinel workflow state is ${workflowState}.`,
      linkedFeedbackIds: [],
      linkedSections: ["overview", "inbox"],
      suggestedNextStep: state.workflow.recommendedNextStep || "Review the current workflow state and decide whether operator guidance needs improving.",
    });
  }

  return items;
}

function buildCadenceItems(cadence) {
  const tasks = Array.isArray(cadence?.tasksRun) ? cadence.tasksRun : [];
  const failedTasks = tasks.filter((task) => task.status && task.status !== "success");
  if (!failedTasks.length) return [];
  return [{
    id: "roadmap-operational-cadence-failures",
    title: "Improve cadence failure visibility",
    category: "automation",
    source: "cadence_summary",
    impact: "high",
    effort: "medium",
    urgency: "high",
    confidence: "high",
    suggestedPriority: "high",
    score: 85,
    rationale: `${failedTasks.length} cadence task${failedTasks.length === 1 ? "" : "s"} did not complete successfully.`,
    linkedFeedbackIds: [],
    linkedSections: ["cadence"],
    suggestedNextStep: "Make the cadence panel show the failed task and the exact next diagnostic command.",
  }];
}

function buildActivityItems(activities) {
  const warningOrError = activities.filter((entry) => ["warning", "error"].includes(entry.severity));
  if (!warningOrError.length) return [];
  const top = warningOrError[0];
  return [{
    id: `roadmap-activity-${slug(top.type)}-${slug(top.source)}`,
    title: `Review recurring ${top.displayLabel || top.type} warnings`,
    category: top.type === "api" ? "api" : top.type === "deploy" ? "deployment" : "workflow",
    source: "activity_feed",
    impact: top.severity === "error" ? "high" : "medium",
    effort: "medium",
    urgency: top.severity === "error" ? "high" : "medium",
    confidence: "medium",
    suggestedPriority: top.severity === "error" ? "high" : "medium",
    score: top.severity === "error" ? 82 : 61,
    rationale: `Latest warning source: ${top.title}. ${top.summary || "No further detail recorded."}`,
    linkedFeedbackIds: [],
    linkedSections: ["diagnostics"],
    suggestedNextStep: "Confirm whether this warning is expected noise or should become a concrete hardening task.",
  }];
}

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.category}:${item.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortRoadmapItems(items) {
  const priorityRank = { high: 3, medium: 2, low: 1 };
  const urgencyRank = { high: 3, medium: 2, low: 1 };
  const effortRank = { low: 3, medium: 2, high: 1 };
  return [...items].sort((a, b) => {
    const scoreDelta = Number(b.score || 0) - Number(a.score || 0);
    if (scoreDelta) return scoreDelta;
    const priorityDelta = (priorityRank[b.suggestedPriority] || 0) - (priorityRank[a.suggestedPriority] || 0);
    if (priorityDelta) return priorityDelta;
    const urgencyDelta = (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0);
    if (urgencyDelta) return urgencyDelta;
    return (effortRank[b.effort] || 0) - (effortRank[a.effort] || 0);
  });
}

function markdownForRoadmap(roadmap) {
  const byPriority = (priority) => roadmap.items.filter((item) => item.suggestedPriority === priority);
  const section = (title, items) => [
    `## ${title}`,
    "",
    ...(items.length ? items.flatMap((item) => [
      `- ${item.title}`,
      `  - Impact: ${item.impact}; effort: ${item.effort}; urgency: ${item.urgency}; confidence: ${item.confidence}`,
      `  - Rationale: ${item.rationale}`,
      `  - Next: ${item.suggestedNextStep}`,
    ]) : ["- None."]),
    "",
  ];

  return [
    "# Sentinel Roadmap Intelligence",
    "",
    `Generated: ${roadmap.generatedAt}`,
    `Tenant: ${roadmap.tenantId}`,
    "",
    "Planning/prioritisation only. No autonomous implementation is performed.",
    "",
    "## Recommended Next Improvement",
    "",
    roadmap.recommendedNextImprovement
      ? `- ${roadmap.recommendedNextImprovement.title}`
      : "- No actionable roadmap item yet.",
    "",
    ...section("High Priority", byPriority("high")),
    ...section("Medium Priority", byPriority("medium")),
    ...section("Low Priority", byPriority("low")),
  ].join("\n");
}

function writeRoadmap(roadmap) {
  ensureReportsDir();
  fs.writeFileSync(ROADMAP_JSON_PATH, `${JSON.stringify(roadmap, null, 2)}\n`);
  fs.writeFileSync(ROADMAP_MD_PATH, `${markdownForRoadmap(roadmap)}\n`);
}

function loadOperationalState(tenantId, warnings) {
  try {
    return getOperationalSummary(tenantId);
  } catch (error) {
    warnings.push(`Operational state unavailable: ${error.message}`);
    return null;
  }
}

function loadActivities(tenantId, warnings) {
  try {
    return getActivityFeed({ tenantId, limit: 20 });
  } catch (error) {
    warnings.push(`Activity feed unavailable: ${error.message}`);
    return [];
  }
}

function printSummary(roadmap) {
  const high = roadmap.items.filter((item) => item.suggestedPriority === "high");
  const medium = roadmap.items.filter((item) => item.suggestedPriority === "medium");
  const low = roadmap.items.filter((item) => item.suggestedPriority === "low");
  const printGroup = (title, items) => {
    console.log(title);
    if (!items.length) {
      console.log("- None");
      return;
    }
    for (const item of items.slice(0, 5)) {
      console.log(`- ${item.title}`);
    }
  };

  console.log("Sentinel Roadmap Intelligence");
  console.log("");
  printGroup("High Priority:", high);
  console.log("");
  printGroup("Medium Priority:", medium);
  console.log("");
  printGroup("Low Priority:", low);
  console.log("");
  console.log("Recommended Next Improvement:");
  console.log(roadmap.recommendedNextImprovement?.title || "No actionable roadmap item yet.");
  if (roadmap.warnings.length) {
    console.log("");
    console.log("Warnings:");
    for (const warning of roadmap.warnings) console.log(`- ${warning}`);
  }
  console.log("");
  console.log("Generated:");
  console.log("- reports/sentinel-roadmap.json");
  console.log("- reports/sentinel-roadmap.md");
}

const args = parseArgs(process.argv.slice(2));
const warnings = [];
const feedbackItems = readFeedbackItems();
const operationalState = loadOperationalState(args.tenant, warnings);
const cadenceSummary = readJsonIfPresent("reports/sentinel-cadence-summary.json");
const readinessSummary = readJsonIfPresent("reports/sentinel-deploy-readiness.json");
const activities = loadActivities(args.tenant, warnings);
const rawItems = [
  ...clusterFeedbackItems(feedbackItems),
  ...buildOperationalStateItems(operationalState),
  ...buildCadenceItems(cadenceSummary),
  ...buildReadinessItems(readinessSummary),
  ...buildActivityItems(activities),
];
const items = sortRoadmapItems(dedupeItems(rawItems)).slice(0, Number.isFinite(args.limit) ? Math.max(args.limit, 1) : 12);
const roadmap = {
  generatedAt: new Date().toISOString(),
  tenantId: operationalState?.tenant?.tenantId || args.tenant,
  inputs: {
    feedbackCount: feedbackItems.length,
    activityCount: activities.length,
    cadenceAvailable: Boolean(cadenceSummary),
    operationalStateAvailable: Boolean(operationalState),
    readinessAvailable: Boolean(readinessSummary),
  },
  recommendedNextImprovement: items[0] || null,
  items,
  warnings,
};

writeRoadmap(roadmap);
printSummary(roadmap);
