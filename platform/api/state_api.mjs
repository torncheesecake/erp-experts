import {
  DEFAULT_DB_PATH,
  databaseExists,
  getLatestInboxItems as getLatestInboxItemsFromDb,
  getLatestPlanApprovals,
  getLatestPlanStatuses,
  queryRows,
  queryValue,
  tableExists,
} from "../persistence/db.js";
import { loadTenantConfig } from "../../scripts/platform/tenant_config.mjs";

function quoteSql(value) {
  return String(value ?? "").replaceAll("'", "''");
}

function limitNumber(limit, fallback = 5) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function assertDatabaseReady() {
  if (!databaseExists(DEFAULT_DB_PATH)) {
    throw new Error("Platform DB is missing. Run npm run platform:init first.");
  }
}

function countRows(tableName, tenantId) {
  assertDatabaseReady();
  if (!tableExists(tableName, DEFAULT_DB_PATH)) return 0;

  return Number(
    queryValue(
      `SELECT COUNT(*) FROM ${tableName} WHERE tenant_id = '${quoteSql(tenantId)}';`,
      DEFAULT_DB_PATH,
    ) || 0,
  );
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function getTenantState(tenantId = "erp-experts") {
  const result = loadTenantConfig(tenantId);
  if (!result.ok) {
    const error = new Error(result.error);
    error.code = "TENANT_CONFIG_ERROR";
    error.details = result.details || [];
    throw error;
  }

  return result.config;
}

export function getLatestSnapshot(tenantId = "erp-experts") {
  assertDatabaseReady();
  if (!tableExists("snapshots", DEFAULT_DB_PATH)) return null;

  const row = queryRows(
    `SELECT id, tenant_id, pass_count, review_count, blocked_count, monitor_status, created_at
     FROM snapshots
     WHERE tenant_id = '${quoteSql(tenantId)}'
     ORDER BY created_at DESC, id DESC
     LIMIT 1;`,
    DEFAULT_DB_PATH,
  )[0];

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

export function getLatestRuns(tenantId = "erp-experts", limit = 8) {
  assertDatabaseReady();
  if (!tableExists("runs", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT id, tenant_id, command, status, COALESCE(started_at, ''), COALESCE(finished_at, '')
     FROM runs
     WHERE tenant_id = '${quoteSql(tenantId)}'
     ORDER BY COALESCE(finished_at, started_at) DESC, id DESC
     LIMIT ${limitNumber(limit, 8)};`,
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

function getLatestFailedRuns(tenantId = "erp-experts", limit = 5) {
  assertDatabaseReady();
  if (!tableExists("runs", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT id, tenant_id, command, status, COALESCE(started_at, ''), COALESCE(finished_at, '')
     FROM runs
     WHERE tenant_id = '${quoteSql(tenantId)}'
       AND status NOT IN ('success', 'running')
     ORDER BY COALESCE(finished_at, started_at) DESC, id DESC
     LIMIT ${limitNumber(limit, 5)};`,
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

export function getLatestOpportunities(tenantId = "erp-experts", limit = 5) {
  assertDatabaseReady();
  if (!tableExists("opportunity_summaries", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT id, tenant_id, opportunity_id, title, primary_type, score, priority_label, action_theme, target_slug, target_path, state, created_at
     FROM opportunity_summaries
     WHERE tenant_id = '${quoteSql(tenantId)}'
     ORDER BY created_at DESC, score DESC, id DESC
     LIMIT ${limitNumber(limit, 5)};`,
    DEFAULT_DB_PATH,
  ).map(([id, rowTenantId, opportunityId, title, primaryType, score, priorityLabel, actionTheme, targetSlug, targetPath, state, createdAt]) => ({
    id: Number(id),
    tenantId: rowTenantId,
    opportunityId,
    title,
    primaryType,
    score: Number(score || 0),
    priorityLabel,
    actionTheme,
    targetSlug,
    targetPath,
    state,
    createdAt,
  }));
}

export function getLatestPlans(tenantId = "erp-experts", limit = 5) {
  assertDatabaseReady();
  if (!tableExists("plan_summaries", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT id, tenant_id, plan_id, title, plan_type, execution_priority, estimated_impact, estimated_effort,
            confidence, safety_level, required_human_review, target_slug, target_path, state, created_at
     FROM plan_summaries
     WHERE tenant_id = '${quoteSql(tenantId)}'
     ORDER BY created_at DESC,
       CASE execution_priority
         WHEN 'high' THEN 3
         WHEN 'medium' THEN 2
         WHEN 'low' THEN 1
         ELSE 0
       END DESC,
       id DESC
     LIMIT ${limitNumber(limit, 5)};`,
    DEFAULT_DB_PATH,
  ).map(([
    id,
    rowTenantId,
    planId,
    title,
    planType,
    executionPriority,
    estimatedImpact,
    estimatedEffort,
    confidence,
    safetyLevel,
    requiredHumanReview,
    targetSlug,
    targetPath,
    state,
    createdAt,
  ]) => ({
    id: Number(id),
    tenantId: rowTenantId,
    planId,
    title,
    planType,
    executionPriority,
    estimatedImpact,
    estimatedEffort,
    confidence,
    safetyLevel,
    requiredHumanReview: requiredHumanReview === "1",
    targetSlug,
    targetPath,
    state,
    createdAt,
  }));
}

export function getLatestApprovals(tenantId = "erp-experts", limit = 5) {
  assertDatabaseReady();
  return getLatestPlanApprovals({ tenantId, limit: limitNumber(limit, 5) }, DEFAULT_DB_PATH);
}

export function getLatestStatuses(tenantId = "erp-experts", limit = 5) {
  assertDatabaseReady();
  return getLatestPlanStatuses({ tenantId, limit: limitNumber(limit, 5) }, DEFAULT_DB_PATH);
}

export function getLatestInboxItems(tenantId = "erp-experts", limit = 5) {
  assertDatabaseReady();
  return getLatestInboxItemsFromDb({ tenantId, limit: limitNumber(limit, 5) }, DEFAULT_DB_PATH);
}

function getCurrentPlanStatuses(tenantId = "erp-experts") {
  assertDatabaseReady();
  if (!tableExists("plan_statuses", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT ps.id, ps.tenant_id, ps.plan_id, ps.title, ps.current_status, ps.safety_level,
            ps.required_human_review, ps.next_recommended_step, ps.validation_state,
            ps.notes, ps.last_updated
     FROM plan_statuses ps
     INNER JOIN (
       SELECT plan_id, MAX(id) AS latest_id
       FROM plan_statuses
       WHERE tenant_id = '${quoteSql(tenantId)}'
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

function getCurrentApprovals(tenantId = "erp-experts") {
  assertDatabaseReady();
  if (!tableExists("plan_approvals", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT pa.id, pa.tenant_id, pa.plan_id, pa.approved_for, pa.safety_level,
            pa.required_human_review, pa.approval_note, pa.source_plan_title,
            pa.approved_at, pa.expires_at
     FROM plan_approvals pa
     INNER JOIN (
       SELECT plan_id, MAX(id) AS latest_id
       FROM plan_approvals
       WHERE tenant_id = '${quoteSql(tenantId)}'
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

function chooseWorkflow({ snapshot, counts, statuses, approvals, failedRuns }) {
  const topStatus = statuses[0] || null;
  const topApproval = approvals[0] || null;
  const executionApproval = approvals.find((approval) => ["patch_proposal", "apply_patch"].includes(approval.approvedFor));
  const activeStatus = statuses.find((status) => status.currentStatus === "active");
  const blockedStatus = statuses.find((status) => status.currentStatus === "blocked");
  const reviewCount = Number(snapshot?.reviewCount || 0);
  const blockedCount = Number(snapshot?.blockedCount || 0);

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
      recommendedNextStep: `Review the approved implementation workflow for ${executionApproval.planId}, then inspect the proposal before any patch.`,
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
      recommendedNextStep: `Review the planning output for ${topApproval.planId} and decide the next editorial action.`,
      reason: `${topApproval.planId} is approved for planning.`,
      humanInputRequired: true,
    };
  }

  if (counts.opportunitySummaryCount > 0 && counts.planSummaryCount === 0) {
    return {
      state: "planning_required",
      recommendedNextStep: "Run npm run seo:plans to turn strategic opportunities into reviewable plans.",
      reason: "Opportunities exist but no plan summaries are persisted yet.",
      humanInputRequired: false,
    };
  }

  if (counts.planSummaryCount > 0) {
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

function buildInboxRecommendation({ workflow, topPlan, topOpportunity, approvals, statuses }) {
  const planningApproval = approvals.find((approval) => approval.approvedFor === "planning");
  const executionApproval = approvals.find((approval) => ["patch_proposal", "apply_patch"].includes(approval.approvedFor));
  const activeStatus = statuses.find((status) => status.currentStatus === "active");

  if (workflow.state === "blocked" || workflow.state === "human_review_required") {
    return {
      title: workflow.state === "blocked" ? "Resolve blocked workflow item" : "Review flagged SEO workflow",
      priority: "high",
      status: "awaiting_review",
      recommendedNextStep: workflow.recommendedNextStep,
      relatedPlanId: activeStatus?.planId || topPlan?.planId || null,
      relatedOpportunityId: topOpportunity?.opportunityId || null,
      requiresHumanReview: true,
    };
  }

  if (workflow.state === "execution_ready" && executionApproval) {
    return {
      title: "Review approved patch proposal workflow",
      priority: "high",
      status: "awaiting_review",
      recommendedNextStep: workflow.recommendedNextStep,
      relatedPlanId: executionApproval.planId,
      relatedOpportunityId: topOpportunity?.opportunityId || null,
      requiresHumanReview: true,
    };
  }

  if (workflow.state === "approval_required" && activeStatus) {
    return {
      title: "Review active plan approval",
      priority: "high",
      status: "awaiting_review",
      recommendedNextStep: workflow.recommendedNextStep,
      relatedPlanId: activeStatus.planId,
      relatedOpportunityId: topOpportunity?.opportunityId || null,
      requiresHumanReview: true,
    };
  }

  if (workflow.state === "growth_ready" && planningApproval) {
    return {
      title: "Review planning work",
      priority: "medium",
      status: "awaiting_review",
      recommendedNextStep: workflow.recommendedNextStep,
      relatedPlanId: planningApproval.planId,
      relatedOpportunityId: topOpportunity?.opportunityId || null,
      requiresHumanReview: true,
    };
  }

  if (workflow.state === "planning_required") {
    return {
      title: "Create execution plans for strategic opportunities",
      priority: "medium",
      status: "suggested",
      recommendedNextStep: workflow.recommendedNextStep,
      relatedPlanId: null,
      relatedOpportunityId: topOpportunity?.opportunityId || null,
      requiresHumanReview: Boolean(workflow.humanInputRequired),
    };
  }

  return {
    title: "No maintenance action required",
    priority: "low",
    status: "suggested",
    recommendedNextStep: workflow.recommendedNextStep,
    relatedPlanId: topPlan?.planId || null,
    relatedOpportunityId: topOpportunity?.opportunityId || null,
    requiresHumanReview: Boolean(workflow.humanInputRequired),
  };
}

export function getOperationalSummary(tenantId = "erp-experts") {
  const tenant = getTenantState(tenantId);
  assertDatabaseReady();

  const resolvedTenantId = tenant.tenantId;
  const snapshot = getLatestSnapshot(resolvedTenantId);
  const runs = getLatestRuns(resolvedTenantId, 8);
  const failedRuns = getLatestFailedRuns(resolvedTenantId, 5);
  const opportunities = getLatestOpportunities(resolvedTenantId, 5);
  const plans = getLatestPlans(resolvedTenantId, 5);
  const approvals = getCurrentApprovals(resolvedTenantId);
  const statuses = getCurrentPlanStatuses(resolvedTenantId);
  const inboxItems = getLatestInboxItems(resolvedTenantId, 5);
  const counts = {
    runCount: countRows("runs", resolvedTenantId),
    snapshotCount: countRows("snapshots", resolvedTenantId),
    opportunitySummaryCount: countRows("opportunity_summaries", resolvedTenantId),
    planSummaryCount: countRows("plan_summaries", resolvedTenantId),
    planApprovalCount: countRows("plan_approvals", resolvedTenantId),
    planStatusCount: countRows("plan_statuses", resolvedTenantId),
    inboxItemCount: countRows("inbox_items", resolvedTenantId),
  };
  const workflow = chooseWorkflow({ snapshot, counts, statuses, approvals, failedRuns });
  const topOpportunity = opportunities[0] || null;
  const topPlan = plans[0] || null;
  const inboxRecommendation = buildInboxRecommendation({
    workflow,
    topPlan,
    topOpportunity,
    approvals,
    statuses,
  });

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: resolvedTenantId,
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
      count: counts.opportunitySummaryCount,
      top: topOpportunity,
      latest: opportunities,
      priorityLabels: countBy(opportunities, "priorityLabel"),
    },
    plans: {
      count: counts.planSummaryCount,
      top: topPlan,
      currentStatuses: countBy(statuses, "currentStatus"),
      executionReadyCount: approvals.filter((approval) => ["patch_proposal", "apply_patch"].includes(approval.approvedFor)).length,
      reviewOnlyCount: plans.filter((plan) => plan.safetyLevel === "review_only").length,
      latestStatuses: statuses.slice(0, 8),
    },
    approvals: {
      count: counts.planApprovalCount,
      current: approvals,
      countsByScope: countBy(approvals, "approvedFor"),
    },
    inbox: {
      count: counts.inboxItemCount,
      latestActionable: inboxItems.find((item) => item.status !== "done") || inboxItems[0] || null,
      latest: inboxItems,
    },
    runs: {
      count: counts.runCount,
      latest: runs,
      latestAutopilot: runs.find((run) => run.command === "seo:autopilot") || null,
      lastSuccessfulRun: runs.find((run) => run.status === "success") || null,
      failed: failedRuns,
    },
    recommendation: {
      nextStep: workflow.recommendedNextStep,
      reason: workflow.reason,
      humanInputRequired: workflow.humanInputRequired,
    },
    inboxRecommendation,
  };
}
