import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_DB_PATH,
  databaseExists,
  getPersistenceSummary,
  queryRows,
  tableExists,
} from "../../platform/persistence/db.js";
import { loadTenantConfig, printTenantError } from "./tenant_config.mjs";

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function ensureReportsDir(reportsDir) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function latestSnapshot(tenantId) {
  if (!tableExists("snapshots", DEFAULT_DB_PATH)) return null;

  const rows = queryRows(
    `SELECT id, tenant_id, pass_count, review_count, blocked_count, monitor_status, created_at
     FROM snapshots
     WHERE tenant_id = '${tenantId.replaceAll("'", "''")}'
     ORDER BY created_at DESC, id DESC
     LIMIT 1;`,
    DEFAULT_DB_PATH,
  );

  const row = rows[0];
  if (!row) return null;

  const [id, rowTenantId, passCount, reviewCount, blockedCount, monitorStatus, createdAt] = row;
  return {
    id: Number(id),
    tenantId: rowTenantId,
    passCount: Number(passCount || 0),
    reviewCount: Number(reviewCount || 0),
    blockedCount: Number(blockedCount || 0),
    monitorStatus,
    createdAt,
  };
}

function latestRuns({ tenantId, limit = 8 }) {
  if (!tableExists("runs", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT id, tenant_id, command, status, COALESCE(started_at, ''), COALESCE(finished_at, '')
     FROM runs
     WHERE tenant_id = '${tenantId.replaceAll("'", "''")}'
     ORDER BY COALESCE(finished_at, started_at) DESC, id DESC
     LIMIT ${Number(limit) || 8};`,
    DEFAULT_DB_PATH,
  ).map(([id, rowTenantId, command, status, startedAt, finishedAt]) => ({
    id: Number(id),
    tenantId: rowTenantId,
    command,
    status,
    startedAt,
    finishedAt,
  }));
}

function latestFailedRuns({ tenantId, limit = 5 }) {
  if (!tableExists("runs", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT id, tenant_id, command, status, COALESCE(started_at, ''), COALESCE(finished_at, '')
     FROM runs
     WHERE tenant_id = '${tenantId.replaceAll("'", "''")}'
       AND status NOT IN ('success', 'running')
     ORDER BY COALESCE(finished_at, started_at) DESC, id DESC
     LIMIT ${Number(limit) || 5};`,
    DEFAULT_DB_PATH,
  ).map(([id, rowTenantId, command, status, startedAt, finishedAt]) => ({
    id: Number(id),
    tenantId: rowTenantId,
    command,
    status,
    startedAt,
    finishedAt,
  }));
}

function currentPlanStatuses(tenantId) {
  if (!tableExists("plan_statuses", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT ps.id, ps.tenant_id, ps.plan_id, ps.title, ps.current_status, ps.safety_level,
            ps.required_human_review, ps.next_recommended_step, ps.validation_state,
            ps.notes, ps.last_updated
     FROM plan_statuses ps
     INNER JOIN (
       SELECT plan_id, MAX(id) AS latest_id
       FROM plan_statuses
       WHERE tenant_id = '${tenantId.replaceAll("'", "''")}'
       GROUP BY plan_id
     ) latest ON latest.latest_id = ps.id
     ORDER BY
       CASE ps.current_status
         WHEN 'blocked' THEN 8
         WHEN 'approved_for_apply' THEN 7
         WHEN 'approved_for_patch_proposal' THEN 6
         WHEN 'active' THEN 5
         WHEN 'approved_for_planning' THEN 4
         WHEN 'paused' THEN 3
         WHEN 'discovered' THEN 2
         WHEN 'completed' THEN 1
         ELSE 0
       END DESC,
       ps.last_updated DESC,
       ps.id DESC;`,
    DEFAULT_DB_PATH,
  ).map(([
    id,
    rowTenantId,
    planId,
    title,
    currentStatus,
    safetyLevel,
    requiredHumanReview,
    nextRecommendedStep,
    validationState,
    notes,
    lastUpdated,
  ]) => ({
    id: Number(id),
    tenantId: rowTenantId,
    planId,
    title,
    currentStatus,
    safetyLevel,
    requiredHumanReview: requiredHumanReview === "1",
    nextRecommendedStep,
    validationState,
    notes,
    lastUpdated,
  }));
}

function currentApprovals(tenantId) {
  if (!tableExists("plan_approvals", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT pa.id, pa.tenant_id, pa.plan_id, pa.approved_for, pa.safety_level,
            pa.required_human_review, pa.approval_note, pa.source_plan_title,
            pa.approved_at, pa.expires_at
     FROM plan_approvals pa
     INNER JOIN (
       SELECT plan_id, MAX(id) AS latest_id
       FROM plan_approvals
       WHERE tenant_id = '${tenantId.replaceAll("'", "''")}'
       GROUP BY plan_id
     ) latest ON latest.latest_id = pa.id
     ORDER BY pa.approved_at DESC, pa.id DESC;`,
    DEFAULT_DB_PATH,
  ).map(([
    id,
    rowTenantId,
    planId,
    approvedFor,
    safetyLevel,
    requiredHumanReview,
    approvalNote,
    sourcePlanTitle,
    approvedAt,
    expiresAt,
  ]) => ({
    id: Number(id),
    tenantId: rowTenantId,
    planId,
    approvedFor,
    safetyLevel,
    requiredHumanReview: requiredHumanReview === "1",
    approvalNote,
    sourcePlanTitle,
    approvedAt,
    expiresAt,
  }));
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function chooseWorkflow({ snapshot, summary, statuses, approvals, failedRuns }) {
  const topStatus = statuses[0] || null;
  const topApproval = approvals[0] || null;
  const executionApproval = approvals.find((approval) => ["patch_proposal", "apply_patch"].includes(approval.approvedFor));
  const activeStatus = statuses.find((status) => status.currentStatus === "active");
  const blockedStatus = statuses.find((status) => status.currentStatus === "blocked");
  const reviewCount = Number(snapshot?.reviewCount || 0);
  const blockedCount = Number(snapshot?.blockedCount || 0);
  const opportunityCount = Number(summary.opportunitySummaryCount || 0);
  const planCount = Number(summary.planSummaryCount || 0);

  if (blockedCount > 0 || blockedStatus) {
    return {
      state: "blocked",
      recommendedNextStep: "Resolve blocked content or workflow items before growth work.",
      reason: blockedStatus ? `Plan ${blockedStatus.planId} is blocked.` : "The latest QA snapshot contains blocked pages.",
      humanInputRequired: true,
    };
  }

  if (failedRuns.length > 0 && failedRuns[0].command?.startsWith("seo:")) {
    return {
      state: "human_review_required",
      recommendedNextStep: `Review failed run ${failedRuns[0].command} before continuing.`,
      reason: "A recent SEO command failed.",
      humanInputRequired: true,
    };
  }

  if (reviewCount > 0) {
    return {
      state: "human_review_required",
      recommendedNextStep: "Clear needs-review content before strategic growth work.",
      reason: "The latest QA snapshot contains pages needing review.",
      humanInputRequired: true,
    };
  }

  if (executionApproval) {
    return {
      state: "execution_ready",
      recommendedNextStep: `Run npm run seo:plan:run -- ${executionApproval.planId}, then review the proposal before any patch.`,
      reason: `${executionApproval.planId} is approved for ${executionApproval.approvedFor}.`,
      humanInputRequired: true,
    };
  }

  if (activeStatus && !topApproval) {
    return {
      state: "approval_required",
      recommendedNextStep: `Review active plan ${activeStatus.planId}, then approve the next safe level if appropriate.`,
      reason: "An active plan exists without a persisted approval.",
      humanInputRequired: true,
    };
  }

  if (topApproval?.approvedFor === "planning") {
    return {
      state: "growth_ready",
      recommendedNextStep: `Review the approved planning work for ${topApproval.planId}.`,
      reason: `${topApproval.planId} is approved for planning.`,
      humanInputRequired: true,
    };
  }

  if (opportunityCount > 0 && planCount === 0) {
    return {
      state: "planning_required",
      recommendedNextStep: "Run npm run seo:plans to turn strategic opportunities into reviewable plans.",
      reason: "Opportunities exist but no plan summaries are persisted yet.",
      humanInputRequired: false,
    };
  }

  if (planCount > 0) {
    return {
      state: "growth_ready",
      recommendedNextStep: topStatus?.nextRecommendedStep || "Review the top persisted execution plan.",
      reason: "QA is healthy and persisted plans are available.",
      humanInputRequired: true,
    };
  }

  return {
    state: "healthy_monitoring",
    recommendedNextStep: "No maintenance action required. Continue weekly monitoring.",
    reason: "No persisted opportunity or plan needs attention.",
    humanInputRequired: false,
  };
}

function main() {
  const tenantId = getArgValue("--tenant", "erp-experts");
  const tenantResult = loadTenantConfig(tenantId);
  if (!tenantResult.ok) {
    printTenantError(tenantResult);
    process.exit(1);
  }

  if (!databaseExists(DEFAULT_DB_PATH)) {
    console.error("Platform DB is missing. Run npm run platform:init first.");
    process.exit(1);
  }

  const tenant = tenantResult.config;
  const reportsDir = path.resolve(tenant.reportOutputPath || "reports");
  const outputPath = path.join(reportsDir, "sentinel-state.json");
  const summary = getPersistenceSummary(DEFAULT_DB_PATH);
  const snapshot = latestSnapshot(tenant.tenantId);
  const runs = latestRuns({ tenantId: tenant.tenantId, limit: 8 });
  const failedRuns = latestFailedRuns({ tenantId: tenant.tenantId, limit: 5 });
  const statuses = currentPlanStatuses(tenant.tenantId);
  const approvals = currentApprovals(tenant.tenantId);
  const workflow = chooseWorkflow({ snapshot, summary, statuses, approvals, failedRuns });
  const topOpportunity = summary.latestOpportunitySummary;
  const topPlan = summary.latestPlanSummary;
  const latestAutopilot = runs.find((run) => run.command === "seo:autopilot") || null;
  const lastSuccessfulRun = runs.find((run) => run.status === "success") || null;

  const state = {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      baseUrl: tenant.baseUrl,
      dashboardRoute: tenant.dashboardRoute,
      reportOutputPath: tenant.reportOutputPath,
    },
    health: {
      monitorStatus: snapshot?.monitorStatus || "unknown",
      pass: snapshot?.passCount || 0,
      review: snapshot?.reviewCount || 0,
      blocked: snapshot?.blockedCount || 0,
      latestSnapshotAt: snapshot?.createdAt || null,
    },
    workflow,
    opportunities: {
      count: summary.opportunitySummaryCount,
      top: topOpportunity,
      latest: summary.latestOpportunitySummaries,
      priorityLabels: countBy(summary.latestOpportunitySummaries, "priorityLabel"),
    },
    plans: {
      count: summary.planSummaryCount,
      top: topPlan,
      currentStatuses: countBy(statuses, "currentStatus"),
      executionReadyCount: approvals.filter((approval) => ["patch_proposal", "apply_patch"].includes(approval.approvedFor)).length,
      reviewOnlyCount: summary.latestPlanSummaries.filter((plan) => plan.safetyLevel === "review_only").length,
      latestStatuses: statuses.slice(0, 8),
    },
    approvals: {
      count: summary.planApprovalCount,
      current: approvals,
      countsByScope: countBy(approvals, "approvedFor"),
    },
    runs: {
      count: summary.runCount,
      latest: runs,
      latestAutopilot,
      lastSuccessfulRun,
      failed: failedRuns,
    },
    recommendation: {
      nextStep: workflow.recommendedNextStep,
      reason: workflow.reason,
      humanInputRequired: workflow.humanInputRequired,
    },
  };

  ensureReportsDir(reportsDir);
  fs.writeFileSync(outputPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

  console.log("Sentinel State");
  console.log("");
  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Base URL: ${tenant.baseUrl}`);
  console.log(`Health: ${state.health.monitorStatus}`);
  console.log(`QA: ${state.health.pass} pass · ${state.health.review} review · ${state.health.blocked} blocked`);
  console.log(`Latest snapshot: ${state.health.latestSnapshotAt || "unknown"}`);
  console.log("");
  console.log("Latest Opportunity:");
  if (topOpportunity) {
    console.log(`${topOpportunity.title}`);
    console.log(`Priority: ${topOpportunity.priorityLabel || "unknown"} · Score: ${topOpportunity.score}`);
  } else {
    console.log("None persisted yet.");
  }
  console.log("");
  console.log("Latest Plan:");
  if (topPlan) {
    console.log(`${topPlan.planId} - ${topPlan.title}`);
    console.log(`Safety: ${topPlan.safetyLevel || "unknown"} · Priority: ${topPlan.executionPriority || "unknown"}`);
  } else {
    console.log("None persisted yet.");
  }
  console.log("");
  console.log("Workflow:");
  console.log(workflow.state);
  console.log("");
  console.log("Recommended Next Step:");
  console.log(workflow.recommendedNextStep);
  console.log(`Human input required: ${workflow.humanInputRequired ? "yes" : "no"}`);
  console.log("");
  console.log("Recent Runs:");
  if (!runs.length) {
    console.log("- None recorded yet.");
  } else {
    runs.slice(0, 5).forEach((run) => {
      console.log(`- ${run.command} ${run.status} ${run.finishedAt || run.startedAt}`);
    });
  }
  console.log("");
  console.log(`State JSON: ${path.relative(process.cwd(), outputPath)}`);
}

main();
