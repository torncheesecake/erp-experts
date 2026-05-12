import fs from "node:fs";
import path from "node:path";

const INPUTS = {
  qa: path.resolve("reports/resource-qa-report.json"),
  pipeline: path.resolve("reports/seo-pipeline-summary.json"),
  opportunities: path.resolve("reports/seo-opportunity-centre.json"),
  plans: path.resolve("reports/seo-execution-plans.json"),
  planStatus: path.resolve("reports/seo-plan-status.json"),
  links: path.resolve("reports/seo-internal-link-opportunities.json"),
  freshness: path.resolve("reports/seo-freshness-report.json"),
  conversion: path.resolve("reports/seo-conversion-paths.json"),
};

const OUTPUT = path.resolve("reports/seo-action-inbox.json");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function priorityFromScore(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function main() {
  const qa = readJson(INPUTS.qa);
  const pipeline = readJson(INPUTS.pipeline);
  const opportunities = readJson(INPUTS.opportunities);
  const plans = readJson(INPUTS.plans);
  const planStatus = readJson(INPUTS.planStatus);
  const links = readJson(INPUTS.links);
  const freshness = readJson(INPUTS.freshness);
  const conversion = readJson(INPUTS.conversion);

  const humanReview = Boolean(pipeline?.review?.humanReviewRecommended);
  const gate = qa?.gateSummary || {};
  const blocked = Number(gate.blocked || 0);
  const needsReview = Number(gate.needs_review || 0);
  const stamp = nowIso();

  const items = [];

  if (humanReview || blocked > 0 || needsReview > 0) {
    items.push({
      id: "monitor-health",
      source: "monitor",
      title: "Quality health requires attention",
      priority: "high",
      status: "awaiting_review",
      recommendedNextStep: "Stabilise QA health before strategic work.",
      command: "npm run seo:monitor",
      targetSlug: null,
      targetPath: null,
      safetyLevel: "review_only",
      requiresHumanReview: true,
      createdAt: stamp,
      relatedIds: [],
    });
  }

  const topOpp = Array.isArray(opportunities?.topOpportunities) ? opportunities.topOpportunities.slice(0, 5) : [];
  topOpp.forEach((op) => {
    items.push({
      id: `opportunity-${op.id}`,
      source: "opportunity",
      title: op.groupTitle || op.title,
      priority: op.priorityLabel === "critical" ? "high" : op.priorityLabel === "high" ? "high" : "medium",
      status: "suggested",
      recommendedNextStep: op.recommendedAction || "Review opportunity details.",
      command: "npm run seo:opportunities",
      targetSlug: op.targetSlug || null,
      targetPath: op.targetPath || null,
      safetyLevel: "review_only",
      requiresHumanReview: true,
      createdAt: stamp,
      relatedIds: op.sourceOpportunityIds || [],
    });
  });

  const topPlans = Array.isArray(plans?.topPlans) ? plans.topPlans.slice(0, 5) : [];
  const statusByPlanId = new Map((Array.isArray(planStatus?.statuses) ? planStatus.statuses : []).map((item) => [item.planId, item]));
  topPlans.forEach((plan) => {
    const planState = statusByPlanId.get(plan.id);
    const status = planState?.currentStatus?.startsWith("approved_") ? "approved" : "awaiting_review";
    items.push({
      id: `plan-${plan.id}`,
      source: "execution_plan",
      title: plan.title,
      priority: plan.executionPriority || priorityFromScore(plan.opportunityScore || 0),
      status,
      recommendedNextStep: planState?.nextRecommendedStep || plan.recommendedWorkflow?.nextCommand || "Review execution stages.",
      command: `npm run seo:plan:run -- ${plan.id}`,
      targetSlug: plan.targetSlug || null,
      targetPath: plan.targetPath || null,
      safetyLevel: plan.safetyLevel || "review_only",
      requiresHumanReview: Boolean(plan.requiredHumanReview),
      createdAt: stamp,
      relatedIds: plan.sourceOpportunityIds || [],
    });
  });

  const topLink = Array.isArray(links?.opportunities) ? links.opportunities[0] : null;
  if (topLink) {
    items.push({
      id: `link-${topLink.id}`,
      source: "internal_link",
      title: `${topLink.sourceTitle} -> ${topLink.targetTitle || topLink.targetPath}`,
      priority: topLink.riskLabel === "low" ? "medium" : "high",
      status: "suggested",
      recommendedNextStep: topLink.whyItMatters || "Review internal link proposal.",
      command: "npm run seo:links",
      targetSlug: topLink.sourceSlug || null,
      targetPath: topLink.targetPath || null,
      safetyLevel: "safe_patch_candidate",
      requiresHumanReview: true,
      createdAt: stamp,
      relatedIds: [topLink.id],
    });
  }

  const topFreshness = Array.isArray(freshness?.entries) ? freshness.entries[0] : null;
  if (topFreshness) {
    items.push({
      id: `freshness-${topFreshness.slug}`,
      source: "freshness",
      title: topFreshness.title,
      priority: topFreshness.decayRisk === "high" ? "high" : "medium",
      status: "suggested",
      recommendedNextStep: `Prepare a ${topFreshness.suggestedRefreshType} plan first.`,
      command: "npm run seo:freshness",
      targetSlug: topFreshness.slug || null,
      targetPath: null,
      safetyLevel: "review_only",
      requiresHumanReview: true,
      createdAt: stamp,
      relatedIds: [topFreshness.slug],
    });
  }

  const topConversion = Array.isArray(conversion?.entries) ? conversion.entries[0] : null;
  if (topConversion) {
    items.push({
      id: `conversion-${topConversion.slug}`,
      source: "conversion",
      title: topConversion.title,
      priority: topConversion.intentLevel === "high" ? "high" : "medium",
      status: "suggested",
      recommendedNextStep: topConversion.suggestedAction || "Review conversion path recommendation.",
      command: "npm run seo:conversion",
      targetSlug: topConversion.slug || null,
      targetPath: topConversion.suggestedCTATarget || null,
      safetyLevel: "safe_patch_candidate",
      requiresHumanReview: true,
      createdAt: stamp,
      relatedIds: [topConversion.slug],
    });
  }

  const priorityRank = { high: 3, medium: 2, low: 1 };
  const sorted = items.sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0));

  const summary = {
    highPriority: sorted.filter((item) => item.priority === "high").length,
    awaitingReview: sorted.filter((item) => item.status === "awaiting_review").length,
    suggested: sorted.filter((item) => item.status === "suggested").length,
    noUrgentAction: !sorted.some((item) => item.priority === "high" && item.source === "monitor"),
  };

  const output = {
    generatedAt: stamp,
    summary,
    items: sorted,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log("SEO Action Inbox");
  console.log(`High priority: ${summary.highPriority}`);
  console.log(`Awaiting review: ${summary.awaitingReview}`);
  console.log(`Suggested: ${summary.suggested}`);
  if (summary.noUrgentAction) {
    console.log("No urgent action. Strategic opportunities available.");
  }
  console.log(`Report written: ${OUTPUT}`);
}

main();
