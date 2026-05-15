import fs from "node:fs";
import path from "node:path";
import { DEFAULT_DB_PATH, databaseExists, persistPlanSummaries } from "../platform/persistence/db.js";
import { loadTenantConfig, printTenantError } from "./platform/tenant_config.mjs";

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

const tenantId = getArgValue("--tenant", "erp-experts");
const tenantResult = loadTenantConfig(tenantId);

if (!tenantResult.ok) {
  printTenantError(tenantResult);
  process.exit(1);
}

const tenant = tenantResult.config;
const REPORTS_DIR = path.resolve(tenant.reportOutputPath || "reports");
const INPUTS = {
  opportunities: path.join(REPORTS_DIR, "seo-opportunity-centre.json"),
  qa: path.join(REPORTS_DIR, "resource-qa-report.json"),
  growth: path.join(REPORTS_DIR, "seo-growth-opportunities.json"),
  links: path.join(REPORTS_DIR, "seo-internal-link-opportunities.json"),
  freshness: path.join(REPORTS_DIR, "seo-freshness-report.json"),
  conversion: path.join(REPORTS_DIR, "seo-conversion-paths.json"),
};

const OUTPUT = path.join(REPORTS_DIR, "seo-execution-plans.json");

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function impactLabel(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function effortLabel(planType, sourceItem) {
  if (planType === "internal_link_update") return "low";
  if (planType === "content_brief") return "medium";
  if (planType === "refresh_plan") return "medium";
  if (planType === "conversion_path_update") return "low";
  if ((sourceItem?.relatedActions || []).length >= 3) return "high";
  return "medium";
}

function planTypeFromOpportunity(item) {
  if (item.primaryType === "growth" || item.actionTheme === "content_creation") return "content_brief";
  if (item.primaryType === "internal_link" || item.actionTheme === "internal_linking") return "internal_link_update";
  if (item.primaryType === "freshness" || item.actionTheme === "refresh") return "refresh_plan";
  if (item.primaryType === "conversion" || item.actionTheme === "conversion_path") return "conversion_path_update";
  return "mixed_execution";
}

function confidenceLabel(item) {
  return item.confidenceLabel || "medium";
}

function executionPriority(score, requiredReview) {
  if (requiredReview && score >= 80) return "high";
  if (score >= 80) return "high";
  if (score >= 65) return "medium";
  return "low";
}

function safetyLevel({ planType, relatedCount, signalCount }) {
  if (planType === "mixed_execution" || relatedCount >= 4 || signalCount >= 4) return "high_review_required";
  if (planType === "internal_link_update" || planType === "conversion_path_update") return "safe_patch_candidate";
  return "review_only";
}

function stageDefinitions(plan) {
  const validateCommands = [
    "npm run lint",
    "npm run build",
    "npm run seo:pipeline",
    "npm run seo:stats",
  ];

  return [
    {
      stage: "PLAN",
      meaning: "Define a focused, single-target change plan before editing.",
      commands: [plan.recommendedWorkflow.nextCommand],
      stopConditions: ["Scope expands beyond one target", "Prompt suggests route/component redesign"],
      reviewCheckpoints: ["Target slug/path confirmed", "Plan type matches intent"],
    },
    {
      stage: "REVIEW",
      meaning: "Human checks relevance, tone, and risk before any patching.",
      commands: ["Review suggested action and prompt output"],
      stopConditions: ["Weak evidence or unclear business relevance", "Risk level seems underestimated"],
      reviewCheckpoints: ["Natural UK English", "No fake claims or unsupported stats"],
    },
    {
      stage: "APPLY",
      meaning: "Apply only the reviewed patch scope.",
      commands: ["Apply patch to target object/path only"],
      stopConditions: ["Patch touches unrelated files", "Change becomes broad rewrite"],
      reviewCheckpoints: ["Data shape preserved", "No route or component redesign"],
    },
    {
      stage: "VALIDATE",
      meaning: "Run validation commands to confirm system health.",
      commands: validateCommands,
      stopConditions: ["Any command fails", "QA regression appears"],
      reviewCheckpoints: ["QA gate remains stable", "Monitor remains healthy"],
    },
    {
      stage: "COMMIT",
      meaning: "Commit only intended source/docs changes after validation.",
      commands: ["git status --short", "git add <intended-files>", "git commit -m \"<message>\""],
      stopConditions: ["Generated report churn in commit", "Unexpected files staged"],
      reviewCheckpoints: ["Clean diff scope", "Rollback notes retained"],
    },
  ];
}

function createPlan(item, qaBySlug) {
  const score = clamp(item.score || 0);
  const planType = planTypeFromOpportunity(item);
  const relatedCount = Array.isArray(item.relatedActions) ? item.relatedActions.length : 0;
  const signalCount = Number(item.sourceSignalCount || (item.combinedSignals || []).length || 1);
  const safety = safetyLevel({ planType, relatedCount, signalCount });
  const reviewRequired = safety !== "safe_patch_candidate";
  const qaGate = item.targetSlug ? qaBySlug.get(item.targetSlug)?.gate : null;

  const nextCommand = planType === "content_brief"
    ? "Use Codex planning prompt only"
    : planType === "internal_link_update"
      ? "Use Codex to propose single-link patch only"
      : planType === "refresh_plan"
        ? "Use Codex to propose refresh plan only"
        : planType === "conversion_path_update"
          ? "Use Codex to propose CTA/path update patch"
          : "Split into phased subtasks before patching";

  const codexPlanningPrompt = [
    `Create an execution plan for: ${item.groupTitle || item.title}.`,
    `Target slug/path: ${item.targetSlug || "n/a"} ${item.targetPath || ""}`.trim(),
    `Plan type: ${planType}.`,
    "Output only a proposed plan, not file edits.",
    "Use UK English.",
    "No invented customer claims, statistics, or facts.",
    "Include risks, review checkpoints, and rollback notes.",
  ].join("\n");

  const codexPatchPrompt = [
    `Prepare a proposed patch for: ${item.groupTitle || item.title}.`,
    `Target slug/path: ${item.targetSlug || "n/a"} ${item.targetPath || ""}`.trim(),
    `Scope: ${planType}.`,
    "Do not apply broad rewrites.",
    "Preserve existing data shape and routes/components.",
    "Return proposed patch diff for review only.",
    "Use UK English and natural phrasing.",
  ].join("\n");

  const validationCommands = [
    "npm run lint",
    "npm run build",
    "npm run seo:pipeline",
    "npm run seo:stats",
  ];

  const postValidationPrompt = "Summarise gate totals, monitor health, and any regressions after validation. Stop if regressions appear.";

  return {
    id: `plan-${item.id}`,
    title: item.groupTitle || item.title,
    targetSlug: item.targetSlug || null,
    targetPath: item.targetPath || null,
    planType,
    opportunityScore: score,
    executionPriority: executionPriority(score, reviewRequired),
    estimatedImpact: impactLabel(score),
    estimatedEffort: effortLabel(planType, item),
    confidence: confidenceLabel(item),
    safetyLevel: safety,
    recommendedWorkflow: {
      lifecycle: "Plan -> Review -> Apply -> Validate -> Commit",
      nextCommand,
      notes: qaGate === "pass"
        ? "Target is currently QA-pass. Keep changes narrow to avoid regressions."
        : "Target is not QA-pass. Prefer review-only planning until QA is healthy.",
    },
    executionStages: stageDefinitions({ recommendedWorkflow: { nextCommand } }),
    validationCommands,
    rollbackNotes: [
      "If validation fails, revert only the latest target change.",
      "Re-run pipeline and stats before further edits.",
      "Keep one-article-at-a-time scope for safer rollback.",
    ],
    requiredHumanReview: reviewRequired,
    codexPlanningPrompt,
    codexPatchPrompt,
    postValidationPrompt,
    sourceOpportunityIds: [item.id, ...(item.relatedActions || []).map((r) => r.id)].filter(Boolean),
  };
}

function printTop(plans) {
  console.log("SEO Execution Plans");
  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Reports: ${path.relative(process.cwd(), REPORTS_DIR)}`);
  console.log(`Dashboard: ${tenant.dashboardRoute || "/seo-roadmap"}`);
  if (!plans.length) {
    console.log("No execution plans generated.");
    return;
  }
  plans.slice(0, 5).forEach((plan, idx) => {
    console.log(`${idx + 1}. ${plan.title}`);
    console.log(`   Type: ${plan.planType}`);
    console.log(`   Priority: ${plan.executionPriority} · Impact: ${plan.estimatedImpact} · Effort: ${plan.estimatedEffort} · Safety: ${plan.safetyLevel}`);
    console.log(`   Next: ${plan.recommendedWorkflow.nextCommand}`);
  });
}

function persistTopPlanSummaries(plans) {
  if (!databaseExists(DEFAULT_DB_PATH)) return;

  try {
    const count = persistPlanSummaries({
      tenantId: tenant.tenantId,
      plans: plans.slice(0, 10),
    });
    if (count) {
      console.log(`Persisted plan summaries: ${count}`);
    }
  } catch (error) {
    console.warn(`[seo:plans] SQLite plan summary warning: ${error.message}`);
  }
}

function main() {
  const opportunitiesReport = readJson(INPUTS.opportunities);
  const qaReport = readJson(INPUTS.qa);
  const growthReport = readJson(INPUTS.growth);
  const linksReport = readJson(INPUTS.links);
  const freshnessReport = readJson(INPUTS.freshness);
  const conversionReport = readJson(INPUTS.conversion);

  const missing = Object.entries({
    opportunities: opportunitiesReport,
    qa: qaReport,
    growth: growthReport,
    links: linksReport,
    freshness: freshnessReport,
    conversion: conversionReport,
  }).filter(([, value]) => !value).map(([name]) => name);

  if (!opportunitiesReport) {
    console.log("Missing required report: seo-opportunity-centre.json");
    console.log("Run npm run seo:opportunities first.");
    process.exit(1);
  }

  const qaBySlug = new Map((qaReport?.articles || []).map((a) => [a.slug, a]));
  const sourceOpportunities = Array.isArray(opportunitiesReport?.opportunities)
    ? opportunitiesReport.opportunities
    : [];

  const plans = sourceOpportunities
    .map((item) => createPlan(item, qaBySlug))
    .sort((a, b) => {
      const priorityRank = { high: 3, medium: 2, low: 1 };
      if ((priorityRank[b.executionPriority] || 0) !== (priorityRank[a.executionPriority] || 0)) {
        return (priorityRank[b.executionPriority] || 0) - (priorityRank[a.executionPriority] || 0);
      }
      return b.opportunityScore - a.opportunityScore;
    });

  const output = {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      baseUrl: tenant.baseUrl,
      dashboardRoute: tenant.dashboardRoute || "/seo-roadmap",
      reportOutputPath: tenant.reportOutputPath || "reports",
    },
    sourceReports: Object.fromEntries(Object.entries(INPUTS).map(([k, v]) => [k, path.relative(process.cwd(), v)])),
    missingReports: missing,
    lifecycle: "Plan -> Review -> Apply -> Validate -> Commit",
    planCount: plans.length,
    topPlans: plans.slice(0, 5),
    plans,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  persistTopPlanSummaries(plans);
  printTop(plans);
  console.log(`Report written: ${OUTPUT}`);
}

main();
