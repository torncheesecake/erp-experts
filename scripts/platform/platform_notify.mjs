import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getOperationalSummary } from "../../platform/api/state_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const outputDir = path.join(repoRoot, "reports/notifications");
const tenantId = getArgValue("--tenant", process.env.PLATFORM_TENANT || "erp-experts");
const dryRun = process.argv.includes("--dry-run");
const jsonMode = process.argv.includes("--json");
const mode = process.argv.includes("--all")
  ? "all"
  : process.argv.includes("--stakeholder")
    ? "stakeholder"
    : "operator";

const forbiddenStakeholderTerms = [
  /npm run/i,
  /Codex/i,
  /Sentinel/i,
  /SQLite/i,
  /\bDB\b/i,
  /\bAPI\b/i,
  /approval/i,
  /seo-roadmap/i,
  /operator/i,
  /diagnostics?/i,
  /tenant/i,
  /plan-op-centre/i,
];

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function readJson(relativePath, fallback = {}) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return fallback;

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function rel(filePath) {
  return path.relative(repoRoot, filePath);
}

function cleanStakeholderText(value = "") {
  return String(value)
    .replace(/SEO automation/gi, "SEO review")
    .replace(/[a-z0-9]+(?:-[a-z0-9]+){2,}\s*→\s*\/[^\s.]+/gi, "a relevant service link")
    .replace(/\/services\/netsuite/gi, "the NetSuite services page")
    .replace(/\bpublishedAt\b/gi, "published date")
    .replace(/validate published date format/gi, "check the article date is clear")
    .replace(/Review link a relevant service link before applying/gi, "Review a relevant service link before adding it to the content plan")
    .replace(/\bbrief\b/gi, "content plan")
    .replace(/npm run [^\s.]+(?: -- [^\n.]+)?/gi, "the next internal review")
    .replace(/\bCodex\b/gi, "the content team")
    .replace(/\bSentinel\b/gi, "the content programme")
    .replace(/\bSQLite\b|\bDB\b|\bdatabase\b|\bAPI\b/gi, "internal system")
    .replace(/\bapproval gate\b|\bapprovals?\b/gi, "review")
    .replace(/\boperator\b|\bdiagnostics?\b/gi, "internal")
    .replace(/\btenant\b/gi, "site")
    .replace(/\/seo-roadmap/gi, "the internal dashboard")
    .replace(/plan-op-centre-\d+/gi, "the current content plan")
    .replace(/reports\/[^\s)]+/gi, "the internal report")
    .replace(/\s+/g, " ")
    .trim();
}

function readReadinessStatus() {
  const readiness = readJson("reports/sentinel-deploy-readiness.json", null);
  if (!readiness) {
    return {
      status: "UNKNOWN",
      checkedAt: null,
    };
  }

  return {
    status: readiness.overallStatus || "UNKNOWN",
    checkedAt: readiness.checkedAt || null,
  };
}

function roadmapItems(reportData) {
  return (reportData?.ga4Period?.seoInsights?.roadmapPhases || [])
    .flatMap((phase) => (phase.items || []).map((item) => ({ ...item, phase: phase.title })));
}

function latestStakeholderProgress({ reportData, weeklySummary, opportunityReport, state }) {
  const roadmap = roadmapItems(reportData);
  const completed = roadmap.filter((item) => item.status === "done").slice(0, 3);
  const planned = roadmap.filter((item) => item.status !== "done").slice(0, 3);
  const opportunities = (opportunityReport?.topOpportunities || opportunityReport?.opportunities || state.opportunities.latest || []).slice(0, 3);
  const nextFocus = planned[0]?.title
    || weeklySummary?.suggestedFocusForNextWeek
    || state.opportunities.top?.title
    || "Keep monitoring content health and select the next strategic content opportunity.";

  return {
    completed: completed.map((item) => cleanStakeholderText(item.title)),
    planned: planned.map((item) => cleanStakeholderText(item.title)),
    opportunities: opportunities.map((item) => cleanStakeholderText(item.groupTitle || item.title)),
    nextFocus: cleanStakeholderText(nextFocus),
  };
}

function buildOperatorNotification(state, readiness) {
  const inboxItem = state.inbox.latestActionable || state.inboxRecommendation;
  return {
    audience: "operator",
    generatedAt: new Date().toISOString(),
    subject: `Sentinel operator update: ${state.health.monitorStatus}`,
    health: {
      status: state.health.monitorStatus,
      qa: `${state.health.pass}/${state.health.review}/${state.health.blocked}`,
    },
    workflow: state.workflow.state,
    nextRecommendedStep: state.recommendation.nextStep,
    latestOpportunity: state.opportunities.top?.title || "None persisted yet.",
    latestPlan: state.plans.top ? `${state.plans.top.planId} - ${state.plans.top.title}` : "None persisted yet.",
    inboxItem: inboxItem?.title || "No active inbox item.",
    readiness: readiness.status,
    commands: [
      "npm run platform:start",
      "npm run platform:state",
      "npm run seo:autopilot",
    ],
  };
}

function renderOperatorMarkdown(payload) {
  return `# ${payload.subject}

- Health: ${payload.health.status}
- QA: ${payload.health.qa}
- Workflow: ${payload.workflow}
- Readiness: ${payload.readiness}

## Next Recommended Step

${payload.nextRecommendedStep}

## Latest Opportunity

${payload.latestOpportunity}

## Latest Plan

${payload.latestPlan}

## Inbox Item

${payload.inboxItem}

## Useful Commands

${payload.commands.map((command) => `- \`${command}\``).join("\n")}
`;
}

function buildStakeholderNotification(state) {
  const qaReport = readJson("reports/resource-qa-report.json");
  const weeklySummary = readJson("reports/seo-weekly-summary.json");
  const opportunityReport = readJson("reports/seo-opportunity-centre.json");
  const reportData = readJson("src/data/reports.json");
  const gate = qaReport?.gateSummary || {};
  const pass = Number(gate.pass ?? state.health.pass ?? 0);
  const review = Number(gate.needs_review ?? state.health.review ?? 0);
  const blocked = Number(gate.blocked ?? state.health.blocked ?? 0);
  const progress = latestStakeholderProgress({ reportData, weeklySummary, opportunityReport, state });
  const healthSummary = blocked === 0 && review === 0
    ? `${pass} resources are passing QA, with no items needing review or blocked.`
    : `${pass} resources are passing QA, with ${review} needing review and ${blocked} blocked.`;

  return {
    audience: "stakeholder",
    generatedAt: new Date().toISOString(),
    subject: "SEO and content progress update",
    healthSummary: cleanStakeholderText(healthSummary),
    progressSummary: cleanStakeholderText(weeklySummary?.headlineSummary || "SEO and content work is healthy, with current focus on controlled strategic growth."),
    completedRecently: progress.completed,
    plannedNext: progress.planned,
    strategicOpportunities: progress.opportunities,
    nextFocus: progress.nextFocus,
  };
}

function renderStakeholderMarkdown(payload) {
  return `# ${payload.subject}

${payload.healthSummary}

${payload.progressSummary}

## Completed Recently

${payload.completedRecently.length ? payload.completedRecently.map((item) => `- ${item}`).join("\n") : "- No completed items are listed in the current progress data."}

## Planned Next

${payload.plannedNext.length ? payload.plannedNext.map((item) => `- ${item}`).join("\n") : "- No planned items are listed in the current progress data."}

## Strategic Opportunities

${payload.strategicOpportunities.length ? payload.strategicOpportunities.map((item) => `- ${item}`).join("\n") : "- No strategic opportunities are listed in the current progress data."}

## Next Focus

${payload.nextFocus}
`;
}

function validateStakeholderSafety(markdown, payload) {
  const combined = `${markdown}\n${JSON.stringify(payload, null, 2)}`;
  const matches = forbiddenStakeholderTerms
    .filter((pattern) => pattern.test(combined))
    .map((pattern) => pattern.source);

  if (matches.length) {
    throw new Error(`Stakeholder notification safety scan failed: ${matches.join(", ")}`);
  }
}

function ensureOutputDir() {
  fs.mkdirSync(outputDir, { recursive: true });
}

function writePayload(name, payload, markdown) {
  ensureOutputDir();
  const jsonPath = path.join(outputDir, `${name}-notification.json`);
  const mdPath = path.join(outputDir, `${name}-notification.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdPath, markdown, "utf8");
  return { jsonPath, mdPath };
}

function preview(targets) {
  console.log("Sentinel Notification Preview");
  console.log("");
  if (targets.includes("operator")) {
    console.log("Operator: would generate reports/notifications/operator-notification.md/json");
  }
  if (targets.includes("stakeholder")) {
    console.log("Stakeholder: would generate reports/notifications/stakeholder-notification.md/json");
  }
  console.log("No messages sent.");
}

function printGenerated(files) {
  console.log("Sentinel Notification Payloads");
  console.log("");
  files.forEach((file) => {
    console.log(`${file.audience}:`);
    console.log(`- ${rel(file.mdPath)}`);
    console.log(`- ${rel(file.jsonPath)}`);
  });
  console.log("");
  console.log("No messages sent.");
}

function main() {
  const targets = mode === "all" ? ["operator", "stakeholder"] : [mode];

  if (dryRun) {
    preview(targets);
    return;
  }

  const state = getOperationalSummary(tenantId);
  const readiness = readReadinessStatus();
  const generated = [];
  let jsonOutput = {};

  if (targets.includes("operator")) {
    const payload = buildOperatorNotification(state, readiness);
    const markdown = renderOperatorMarkdown(payload);
    const files = writePayload("operator", payload, markdown);
    generated.push({ audience: "operator", ...files });
    jsonOutput.operator = payload;
  }

  if (targets.includes("stakeholder")) {
    const payload = buildStakeholderNotification(state);
    const markdown = renderStakeholderMarkdown(payload);
    validateStakeholderSafety(markdown, payload);
    const files = writePayload("stakeholder", payload, markdown);
    generated.push({ audience: "stakeholder", ...files });
    jsonOutput.stakeholder = payload;
  }

  if (jsonMode) {
    process.stdout.write(`${JSON.stringify(jsonOutput, null, 2)}\n`);
    return;
  }

  printGenerated(generated);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
