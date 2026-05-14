import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_MD = path.resolve(ROOT, "reports/seo-autopilot-report.md");
const OUTPUT_JSON = path.resolve(ROOT, "reports/seo-autopilot-report.json");
const ACTIVE_PLAN_PATH = path.resolve(ROOT, "reports/seo-active-plan.md");

const COMMANDS = [
  ["seo:pipeline", ["npm", ["run", "seo:pipeline"]]],
  ["seo:stats", ["npm", ["run", "seo:stats"]]],
  ["seo:monitor", ["npm", ["run", "seo:monitor"]]],
  ["seo:growth", ["npm", ["run", "seo:growth"]]],
  ["seo:links", ["npm", ["run", "seo:links"]]],
  ["seo:freshness", ["npm", ["run", "seo:freshness"]]],
  ["seo:conversion", ["npm", ["run", "seo:conversion"]]],
  ["seo:opportunities", ["npm", ["run", "seo:opportunities"]]],
  ["seo:plans", ["npm", ["run", "seo:plans"]]],
  ["seo:decisions", ["npm", ["run", "seo:decisions"]]],
  ["seo:inbox", ["npm", ["run", "seo:inbox"]]],
  ["seo:digest", ["npm", ["run", "seo:digest"]]],
];

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(ROOT, filePath), "utf8"));
  } catch {
    return fallback;
  }
}

function readText(filePath, fallback = "") {
  try {
    return fs.readFileSync(path.resolve(ROOT, filePath), "utf8");
  } catch {
    return fallback;
  }
}

function runCommand(label, command, args) {
  console.log(`\n[seo:autopilot] ${label}`);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  return {
    label,
    command: [command, ...args].join(" "),
    status: result.status ?? 1,
    ok: result.status === 0,
  };
}

function parseActivePlanId() {
  const text = readText(ACTIVE_PLAN_PATH, "");
  const match = text.match(/Plan ID:\s*`([^`]+)`/i);
  return match?.[1] || "";
}

function approvalFor(planId, approvalsReport) {
  const approvals = Array.isArray(approvalsReport?.approvals) ? approvalsReport.approvals : [];
  return approvals.find((approval) => approval.planId === planId) || null;
}

function commandForPlanRun(plan) {
  return plan?.id ? `npm run seo:plan:run -- ${plan.id}` : "npm run seo:plans";
}

function buildCodexPrompt({ state, topPlan, activePlanId, topDecision }) {
  if (topDecision?.codexDecisionPrompt && (state === "growth_ready" || state === "planning_required")) {
    return topDecision.codexDecisionPrompt;
  }
  if (state === "maintenance_required") {
    return "Run the SEO batch from reports/seo-next-batch-prompt.md exactly as written. Work sequentially, validate after each article, and stop if any validation stop condition is triggered.";
  }
  if (state === "planning_required" || state === "growth_ready") {
    const command = commandForPlanRun(topPlan);
    return `Run ${command}, then create the planning brief only. Do not edit article content, do not publish, and do not apply patches. Report the proposed plan for human review.`;
  }
  if (state === "approval_required") {
    const id = activePlanId || topPlan?.id || "<planId>";
    return `Review the plan, then if acceptable run npm run seo:plan:approve -- ${id}. Do not approve apply_patch unless Matthew explicitly asks for that level.`;
  }
  if (state === "execution_ready") {
    return "Use the approved active plan to propose a patch only. Do not apply or commit until the proposed patch has been reviewed and explicitly approved.";
  }
  return "No maintenance action is required. Keep weekly monitoring active and review the top strategic opportunity when planning growth work.";
}

function decideState({ qaReport, pipelineSummary, opportunitiesReport, plansReport, approvalsReport, decisionsReport }) {
  const gate = qaReport?.gateSummary || {};
  const pass = Number(gate.pass || 0);
  const needsReview = Number(gate.needs_review || 0);
  const blocked = Number(gate.blocked || 0);
  const humanReviewRecommended = Boolean(pipelineSummary?.review?.humanReviewRecommended);
  const reviewReason = pipelineSummary?.review?.reason || "No critical review triggers detected.";
  const opportunities = Array.isArray(opportunitiesReport?.topOpportunities)
    ? opportunitiesReport.topOpportunities
    : Array.isArray(opportunitiesReport?.opportunities)
      ? opportunitiesReport.opportunities
      : [];
  const plans = Array.isArray(plansReport?.topPlans)
    ? plansReport.topPlans
    : Array.isArray(plansReport?.plans)
      ? plansReport.plans
      : [];
  const topOpportunity = opportunities[0] || null;
  const topPlan = plans[0] || null;
  const decisions = Array.isArray(decisionsReport?.topDecisions)
    ? decisionsReport.topDecisions
    : Array.isArray(decisionsReport?.decisions)
      ? decisionsReport.decisions
      : [];
  const topDecision = decisions[0] || null;
  const activePlanId = parseActivePlanId();
  const activePlan = plans.find((plan) => plan.id === activePlanId) || null;
  const selectedPlan = activePlan || topPlan;
  const selectedApproval = selectedPlan?.id ? approvalFor(selectedPlan.id, approvalsReport) : null;

  let state = "healthy_monitoring";
  let recommendedNextStep = "npm run seo:monitor";
  let humanInputRequired = false;
  let stopReason = "";

  if (blocked > 0) {
    state = "blocked";
    recommendedNextStep = "npm run seo:batch";
    humanInputRequired = true;
    stopReason = "Blocked pages must be fixed before growth or planning work.";
  } else if (humanReviewRecommended) {
    state = "human_review_required";
    recommendedNextStep = "npm run seo:pipeline";
    humanInputRequired = true;
    stopReason = reviewReason;
  } else if (needsReview > 0) {
    state = "maintenance_required";
    recommendedNextStep = "npm run seo:batch:prompt";
    humanInputRequired = true;
    stopReason = "Needs_review articles should be cleared before growth work.";
  } else if (opportunities.length > 0 && plans.length === 0) {
    state = "planning_required";
    recommendedNextStep = "npm run seo:plans";
    humanInputRequired = false;
  } else if (selectedPlan && selectedApproval?.approvedFor === "patch_proposal") {
    state = "execution_ready";
    recommendedNextStep = commandForPlanRun(selectedPlan);
    humanInputRequired = true;
  } else if (selectedPlan && selectedApproval?.approvedFor === "apply_patch") {
    state = "execution_ready";
    recommendedNextStep = commandForPlanRun(selectedPlan);
    humanInputRequired = true;
  } else if (activePlanId && selectedPlan && !selectedApproval) {
    state = "approval_required";
    recommendedNextStep = `npm run seo:plan:approve -- ${selectedPlan.id}`;
    humanInputRequired = true;
  } else if (plans.length > 0) {
    state = "growth_ready";
    recommendedNextStep = topDecision?.nextRecommendedCommand || commandForPlanRun(topPlan);
    humanInputRequired = true;
  } else if (opportunities.length > 0) {
    state = "growth_ready";
    recommendedNextStep = topDecision?.nextRecommendedCommand || "npm run seo:decisions";
    humanInputRequired = true;
  }

  return {
    state,
    health: blocked > 0 || humanReviewRecommended ? "ACTION REQUIRED" : needsReview > 0 ? "WARNING" : "HEALTHY",
    qa: { pass, needsReview, blocked },
    humanReviewRecommended,
    reviewReason,
    topOpportunity,
    topPlan,
    topDecision,
    activePlanId: activePlanId || null,
    selectedApproval,
    recommendedNextStep,
    humanInputRequired,
    stopReason,
    codexPrompt: buildCodexPrompt({ state, topPlan: selectedPlan, activePlanId, topDecision }),
  };
}

function asLineList(items, formatter) {
  if (!items.length) return "- None detected";
  return items.map(formatter).join("\n");
}

function buildMarkdown({ generatedAt, decision, commandResults, reports }) {
  const opportunities = (reports.opportunities?.topOpportunities || reports.opportunities?.opportunities || []).slice(0, 5);
  const plans = (reports.plans?.topPlans || reports.plans?.plans || []).slice(0, 5);
  const decisions = (reports.decisions?.topDecisions || reports.decisions?.decisions || []).slice(0, 5);
  const inboxSummary = reports.inbox?.summary || {};
  const didAutomatically = commandResults.map((item) => `- ${item.command}: ${item.ok ? "passed" : "failed"}`).join("\n");

  return `# SEO Autopilot Report

Generated: ${generatedAt}

## Current Health

- State: ${decision.state}
- Health: ${decision.health}
- QA: ${decision.qa.pass} pass, ${decision.qa.needsReview} review, ${decision.qa.blocked} blocked
- Human review recommended: ${decision.humanReviewRecommended ? "yes" : "no"}
- Review reason: ${decision.reviewReason}

## Top Gap

${decision.topOpportunity ? `- ${decision.topOpportunity.groupTitle || decision.topOpportunity.title}` : "- No strategic opportunity detected"}

## Top Unified Opportunities

${asLineList(opportunities, (item, index) => `- ${index + 1}. ${item.groupTitle || item.title} (${item.score ?? "n/a"}) - ${item.recommendedAction || "Review opportunity"}`)}

## Top Execution Plans

${asLineList(plans, (item, index) => `- ${index + 1}. ${item.title} (${item.planType || "plan"}, ${item.safetyLevel || "unknown safety"}) - ${item.recommendedWorkflow?.nextCommand || "Review plan"}`)}

## Strategic Decisions

${asLineList(decisions, (item, index) => `- ${index + 1}. ${item.title} - ${item.decisionType} (${item.confidence}) - ${item.preferredPath}`)}

## Action Inbox

- High priority: ${inboxSummary.highPriority || 0}
- Awaiting review: ${inboxSummary.awaitingReview || 0}
- Suggested: ${inboxSummary.suggested || 0}
- No urgent action: ${inboxSummary.noUrgentAction ? "yes" : "no"}

## Recommended Next Step

- Command: ${decision.recommendedNextStep}
- Human input required: ${decision.humanInputRequired ? "yes" : "no"}
- Stop reason: ${decision.stopReason || "No stop condition triggered."}

## What Autopilot Did Automatically

${didAutomatically}

## What Autopilot Refused To Do Automatically

- It did not edit article content.
- It did not publish content.
- It did not approve plans.
- It did not apply patches.
- It did not commit changes.

## Next Safe Codex Prompt

\`\`\`text
${decision.codexPrompt}
\`\`\`
`;
}

function ensureReportsDir() {
  fs.mkdirSync(path.resolve(ROOT, "reports"), { recursive: true });
}

function main() {
  const commandResults = [];
  for (const [label, [command, args]] of COMMANDS) {
    const result = runCommand(label, command, args);
    commandResults.push(result);
    if (!result.ok) {
      console.error(`\n[seo:autopilot] ${label} failed. Stopping.`);
      process.exit(result.status || 1);
    }
  }

  const reports = {
    qa: readJson("reports/resource-qa-report.json"),
    pipeline: readJson("reports/seo-pipeline-summary.json"),
    opportunities: readJson("reports/seo-opportunity-centre.json"),
    plans: readJson("reports/seo-execution-plans.json"),
    decisions: readJson("reports/seo-decision-engine.json"),
    approvals: readJson("reports/seo-plan-approvals.json", { approvals: [] }),
    inbox: readJson("reports/seo-action-inbox.json"),
    digest: readText("reports/seo-weekly-digest.md"),
  };

  const decision = decideState({
    qaReport: reports.qa,
    pipelineSummary: reports.pipeline,
    opportunitiesReport: reports.opportunities,
    plansReport: reports.plans,
    approvalsReport: reports.approvals,
    decisionsReport: reports.decisions,
  });

  const generatedAt = new Date().toISOString();
  const output = {
    generatedAt,
    state: decision.state,
    health: decision.health,
    qa: decision.qa,
    humanReviewRecommended: decision.humanReviewRecommended,
    topGap: decision.topOpportunity
      ? {
          id: decision.topOpportunity.id,
          title: decision.topOpportunity.groupTitle || decision.topOpportunity.title,
          score: decision.topOpportunity.score,
          actionTheme: decision.topOpportunity.actionTheme,
          signals: decision.topOpportunity.combinedSignals || [],
        }
      : null,
    topPlan: decision.topPlan
      ? {
          id: decision.topPlan.id,
          title: decision.topPlan.title,
          planType: decision.topPlan.planType,
          safetyLevel: decision.topPlan.safetyLevel,
        }
      : null,
    topDecision: decision.topDecision
      ? {
          id: decision.topDecision.id,
          title: decision.topDecision.title,
          decisionType: decision.topDecision.decisionType,
          confidence: decision.topDecision.confidence,
          preferredPath: decision.topDecision.preferredPath,
          cannibalisationRisk: decision.topDecision.cannibalisationRisk,
        }
      : null,
    activePlanId: decision.activePlanId,
    recommendedNextStep: decision.recommendedNextStep,
    humanInputRequired: decision.humanInputRequired,
    stopReason: decision.stopReason || null,
    codexPrompt: decision.codexPrompt,
    generatedReports: {
      markdown: "reports/seo-autopilot-report.md",
      json: "reports/seo-autopilot-report.json",
    },
    commandResults,
  };

  ensureReportsDir();
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  fs.writeFileSync(OUTPUT_MD, buildMarkdown({ generatedAt, decision, commandResults, reports }), "utf8");

  console.log("\nSEO Autopilot Report");
  console.log("");
  console.log(`State: ${decision.state}`);
  console.log(`Health: ${decision.health}`);
  console.log(`QA: ${decision.qa.pass} pass, ${decision.qa.needsReview} review, ${decision.qa.blocked} blocked`);
  console.log("");
  console.log("Top gap:");
  console.log(decision.topOpportunity ? decision.topOpportunity.groupTitle || decision.topOpportunity.title : "None detected");
  console.log("");
  console.log("Recommended next step:");
  console.log(decision.recommendedNextStep);
  console.log("");
  console.log(`Human input required: ${decision.humanInputRequired ? "Yes" : "No"}`);
  console.log("");
  console.log("Generated:");
  console.log("reports/seo-autopilot-report.md");
  console.log("reports/seo-autopilot-report.json");
}

main();
