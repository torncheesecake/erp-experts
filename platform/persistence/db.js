import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

export const DEFAULT_DB_PATH = path.join(__dirname, "platform.db");
export const SCHEMA_PATH = path.join(__dirname, "schema.sql");

function runSqlite(args, input = "") {
  const result = spawnSync("sqlite3", args, {
    cwd: repoRoot,
    input,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error((result.stderr || "sqlite3 failed").trim());
  }

  return result.stdout || "";
}

function quoteSql(value) {
  return String(value ?? "").replaceAll("'", "''");
}

export function ensurePersistenceDir() {
  fs.mkdirSync(__dirname, { recursive: true });
}

export function databaseExists(dbPath = DEFAULT_DB_PATH) {
  return fs.existsSync(dbPath);
}

export function applySchema(dbPath = DEFAULT_DB_PATH) {
  ensurePersistenceDir();
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  runSqlite([dbPath], schema);
}

export function executeSql(sql, dbPath = DEFAULT_DB_PATH) {
  ensurePersistenceDir();
  runSqlite([dbPath], sql);
}

export function queryValue(sql, dbPath = DEFAULT_DB_PATH) {
  const output = runSqlite(["-noheader", "-batch", dbPath, sql]).trim();
  return output;
}

export function queryRows(sql, dbPath = DEFAULT_DB_PATH) {
  const output = runSqlite(["-noheader", "-batch", "-separator", "\t", dbPath, sql]).trim();
  if (!output) return [];
  return output.split("\n").map((line) => line.split("\t"));
}

export function tableExists(tableName, dbPath = DEFAULT_DB_PATH) {
  return queryValue(
    `SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = '${quoteSql(tableName)}';`,
    dbPath,
  ) === "1";
}

export function upsertTenant(tenant, dbPath = DEFAULT_DB_PATH) {
  executeSql(
    `INSERT INTO tenants (tenant_id, name, domain)
     VALUES ('${quoteSql(tenant.tenantId)}', '${quoteSql(tenant.name)}', '${quoteSql(tenant.domain)}')
     ON CONFLICT(tenant_id) DO UPDATE SET
       name = excluded.name,
       domain = excluded.domain;`,
    dbPath,
  );
}

export function insertSnapshot(snapshot, dbPath = DEFAULT_DB_PATH) {
  executeSql(
    `INSERT INTO snapshots (tenant_id, pass_count, review_count, blocked_count, monitor_status)
     VALUES (
       '${quoteSql(snapshot.tenantId)}',
       ${Number(snapshot.passCount || 0)},
       ${Number(snapshot.reviewCount || 0)},
       ${Number(snapshot.blockedCount || 0)},
       '${quoteSql(snapshot.monitorStatus)}'
     );`,
    dbPath,
  );
}

export function persistOpportunitySummaries({ tenantId, opportunities = [] }, dbPath = DEFAULT_DB_PATH) {
  if (!opportunities.length) return 0;

  const statements = opportunities.map((opportunity) => (
    `INSERT INTO opportunity_summaries (
       tenant_id,
       opportunity_id,
       title,
       primary_type,
       score,
       priority_label,
       action_theme,
       target_slug,
       target_path,
       state
     )
     VALUES (
       '${quoteSql(tenantId)}',
       '${quoteSql(opportunity.id || opportunity.opportunityId || "")}',
       '${quoteSql(opportunity.groupTitle || opportunity.title)}',
       '${quoteSql(opportunity.primaryType || "")}',
       ${Number(opportunity.score || 0)},
       '${quoteSql(opportunity.priorityLabel || "")}',
       '${quoteSql(opportunity.actionTheme || "")}',
       '${quoteSql(opportunity.targetSlug || "")}',
       '${quoteSql(opportunity.targetPath || "")}',
       'suggested'
     );`
  ));

  executeSql(statements.join("\n"), dbPath);
  return opportunities.length;
}

export function persistPlanSummaries({ tenantId, plans = [] }, dbPath = DEFAULT_DB_PATH) {
  if (!plans.length) return 0;

  const statements = plans.map((plan) => (
    `INSERT INTO plan_summaries (
       tenant_id,
       plan_id,
       title,
       plan_type,
       execution_priority,
       estimated_impact,
       estimated_effort,
       confidence,
       safety_level,
       required_human_review,
       target_slug,
       target_path,
       state
     )
     VALUES (
       '${quoteSql(tenantId)}',
       '${quoteSql(plan.id || plan.planId || "")}',
       '${quoteSql(plan.title)}',
       '${quoteSql(plan.planType || "")}',
       '${quoteSql(plan.executionPriority || "")}',
       '${quoteSql(plan.estimatedImpact || "")}',
       '${quoteSql(plan.estimatedEffort || "")}',
       '${quoteSql(plan.confidence || "")}',
       '${quoteSql(plan.safetyLevel || "")}',
       ${plan.requiredHumanReview ? 1 : 0},
       '${quoteSql(plan.targetSlug || "")}',
       '${quoteSql(plan.targetPath || "")}',
       'suggested'
     );`
  ));

  executeSql(statements.join("\n"), dbPath);
  return plans.length;
}

export function persistPlanApproval({ tenantId, approval }, dbPath = DEFAULT_DB_PATH) {
  if (!approval?.planId) return 0;

  executeSql(
    `INSERT INTO plan_approvals (
       tenant_id,
       plan_id,
       approved_for,
       safety_level,
       required_human_review,
       approval_note,
       source_plan_title,
       approved_at,
       expires_at
     )
     VALUES (
       '${quoteSql(tenantId)}',
       '${quoteSql(approval.planId)}',
       '${quoteSql(approval.approvedFor || "")}',
       '${quoteSql(approval.safetyLevel || "")}',
       ${approval.requiredHumanReview ? 1 : 0},
       '${quoteSql(approval.approvalNote || "")}',
       '${quoteSql(approval.sourcePlanTitle || "")}',
       '${quoteSql(approval.approvedAt || new Date().toISOString())}',
       '${quoteSql(approval.expiresAt || "")}'
     );`,
    dbPath,
  );

  return 1;
}

export function persistPlanStatus({ tenantId, status }, dbPath = DEFAULT_DB_PATH) {
  if (!status?.planId) return 0;

  executeSql(
    `INSERT INTO plan_statuses (
       tenant_id,
       plan_id,
       title,
       current_status,
       safety_level,
       required_human_review,
       next_recommended_step,
       validation_state,
       notes,
       last_updated
     )
     VALUES (
       '${quoteSql(tenantId)}',
       '${quoteSql(status.planId)}',
       '${quoteSql(status.title || "")}',
       '${quoteSql(status.currentStatus || "")}',
       '${quoteSql(status.safetyLevel || "")}',
       ${status.requiredHumanReview ? 1 : 0},
       '${quoteSql(status.nextRecommendedStep || "")}',
       '${quoteSql(status.validationState || "")}',
       '${quoteSql(status.notes || "")}',
       '${quoteSql(status.lastUpdated || new Date().toISOString())}'
     );`,
    dbPath,
  );

  return 1;
}

export function getLatestPlanApprovals({ tenantId = "", limit = 5 } = {}, dbPath = DEFAULT_DB_PATH) {
  if (!tableExists("plan_approvals", dbPath)) return [];

  const whereTenant = tenantId ? `WHERE tenant_id = '${quoteSql(tenantId)}'` : "";

  return queryRows(
    `SELECT id, tenant_id, plan_id, approved_for, safety_level, required_human_review, approval_note, source_plan_title, approved_at, expires_at
     FROM plan_approvals
     ${whereTenant}
     ORDER BY approved_at DESC, id DESC
     LIMIT ${Number(limit) || 5};`,
    dbPath,
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

export function getLatestPlanStatuses({ tenantId = "", limit = 5 } = {}, dbPath = DEFAULT_DB_PATH) {
  if (!tableExists("plan_statuses", dbPath)) return [];

  const whereTenant = tenantId ? `WHERE tenant_id = '${quoteSql(tenantId)}'` : "";

  return queryRows(
    `SELECT id, tenant_id, plan_id, title, current_status, safety_level, required_human_review, next_recommended_step, validation_state, notes, last_updated
     FROM plan_statuses
     ${whereTenant}
     ORDER BY last_updated DESC, id DESC
     LIMIT ${Number(limit) || 5};`,
    dbPath,
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

export function persistInboxItems({ tenantId, items = [] }, dbPath = DEFAULT_DB_PATH) {
  if (!items.length) return 0;
  if (!tableExists("inbox_items", dbPath)) return 0;

  const statements = items.map((item) => (
    `INSERT INTO inbox_items (
       tenant_id,
       item_id,
       source,
       title,
       priority,
       status,
       recommended_next_step,
       command,
       target_slug,
       target_path,
       safety_level,
       requires_human_review,
       related_ids,
       created_at
     )
     VALUES (
       '${quoteSql(tenantId)}',
       '${quoteSql(item.id || item.itemId || "")}',
       '${quoteSql(item.source || "")}',
       '${quoteSql(item.title || "")}',
       '${quoteSql(item.priority || "")}',
       '${quoteSql(item.status || "")}',
       '${quoteSql(item.recommendedNextStep || "")}',
       '${quoteSql(item.command || "")}',
       '${quoteSql(item.targetSlug || "")}',
       '${quoteSql(item.targetPath || "")}',
       '${quoteSql(item.safetyLevel || "")}',
       ${item.requiresHumanReview ? 1 : 0},
       '${quoteSql(JSON.stringify(item.relatedIds || []))}',
       '${quoteSql(item.createdAt || new Date().toISOString())}'
     );`
  ));

  executeSql(statements.join("\n"), dbPath);
  return items.length;
}

export function getLatestInboxItems({ tenantId = "", limit = 5 } = {}, dbPath = DEFAULT_DB_PATH) {
  if (!tableExists("inbox_items", dbPath)) return [];

  const whereTenant = tenantId ? `WHERE tenant_id = '${quoteSql(tenantId)}'` : "";

  return queryRows(
    `SELECT id, tenant_id, item_id, source, title, priority, status, recommended_next_step,
            command, target_slug, target_path, safety_level, requires_human_review,
            related_ids, created_at
     FROM inbox_items
     ${whereTenant}
     ORDER BY created_at DESC,
       CASE source
         WHEN 'monitor' THEN 100
         WHEN 'sentinel_state' THEN 90
         WHEN 'execution_plan' THEN 70
         WHEN 'opportunity' THEN 60
         WHEN 'conversion' THEN 50
         WHEN 'internal_link' THEN 40
         WHEN 'freshness' THEN 30
         ELSE 0
       END DESC,
       CASE priority
         WHEN 'high' THEN 3
         WHEN 'medium' THEN 2
         WHEN 'low' THEN 1
         ELSE 0
       END DESC,
       id ASC
     LIMIT ${Number(limit) || 5};`,
    dbPath,
  ).map(([
    id,
    rowTenantId,
    itemId,
    source,
    title,
    priority,
    status,
    recommendedNextStep,
    command,
    targetSlug,
    targetPath,
    safetyLevel,
    requiresHumanReview,
    relatedIds,
    createdAt,
  ]) => ({
    id: Number(id),
    tenantId: rowTenantId,
    itemId,
    source,
    title,
    priority,
    status,
    recommendedNextStep,
    command,
    targetSlug,
    targetPath,
    safetyLevel,
    requiresHumanReview: requiresHumanReview === "1",
    relatedIds: (() => {
      try {
        return JSON.parse(relatedIds || "[]");
      } catch {
        return [];
      }
    })(),
    createdAt,
  }));
}

export function startRun(run, dbPath = DEFAULT_DB_PATH) {
  return Number(queryValue(
    `INSERT INTO runs (tenant_id, command, status, started_at)
     VALUES ('${quoteSql(run.tenantId)}', '${quoteSql(run.command)}', 'running', datetime('now'));
     SELECT last_insert_rowid();`,
    dbPath,
  ));
}

export function finishRun(run, dbPath = DEFAULT_DB_PATH) {
  executeSql(
    `UPDATE runs
     SET status = '${quoteSql(run.status)}', finished_at = datetime('now')
     WHERE id = ${Number(run.runId)};`,
    dbPath,
  );
}

export function logRun(run, dbPath = DEFAULT_DB_PATH) {
  return Number(queryValue(
    `INSERT INTO runs (tenant_id, command, status, started_at, finished_at)
     VALUES (
       '${quoteSql(run.tenantId)}',
       '${quoteSql(run.command)}',
       '${quoteSql(run.status)}',
       '${quoteSql(run.startedAt)}',
       '${quoteSql(run.finishedAt)}'
     );
     SELECT last_insert_rowid();`,
    dbPath,
  ));
}

export function persistActionResult(result, dbPath = DEFAULT_DB_PATH) {
  if (!tableExists("action_results", dbPath)) {
    applySchema(dbPath);
  }

  executeSql(
    `INSERT INTO action_results (
       run_id,
       tenant_id,
       action_id,
       status,
       summary,
       output_excerpt,
       created_at
     )
     VALUES (
       ${result.runId ? Number(result.runId) : "NULL"},
       '${quoteSql(result.tenantId)}',
       '${quoteSql(result.actionId)}',
       '${quoteSql(result.status)}',
       '${quoteSql(result.summary || "")}',
       '${quoteSql(result.outputExcerpt || "")}',
       '${quoteSql(result.createdAt || new Date().toISOString())}'
     );`,
    dbPath,
  );
}

export function listLatestRuns(limit = 5, dbPath = DEFAULT_DB_PATH) {
  return queryRows(
    `SELECT id, tenant_id, command, status, COALESCE(started_at, ''), COALESCE(finished_at, '')
     FROM runs
     ORDER BY COALESCE(finished_at, started_at) DESC, id DESC
     LIMIT ${Number(limit) || 5};`,
    dbPath,
  ).map(([id, tenantId, command, status, startedAt, finishedAt]) => ({
    id: Number(id),
    tenantId,
    command,
    status,
    startedAt,
    finishedAt,
  }));
}

export function listLatestOpportunitySummaries(limit = 5, dbPath = DEFAULT_DB_PATH) {
  if (!tableExists("opportunity_summaries", dbPath)) return [];

  return queryRows(
    `SELECT id, tenant_id, opportunity_id, title, primary_type, score, priority_label, action_theme, target_slug, target_path, state, created_at
     FROM opportunity_summaries
     ORDER BY created_at DESC, score DESC, id DESC
     LIMIT ${Number(limit) || 5};`,
    dbPath,
  ).map(([id, tenantId, opportunityId, title, primaryType, score, priorityLabel, actionTheme, targetSlug, targetPath, state, createdAt]) => ({
    id: Number(id),
    tenantId,
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

export function listLatestPlanSummaries(limit = 5, dbPath = DEFAULT_DB_PATH) {
  if (!tableExists("plan_summaries", dbPath)) return [];

  return queryRows(
    `SELECT id, tenant_id, plan_id, title, plan_type, execution_priority, estimated_impact, estimated_effort, confidence, safety_level, required_human_review, target_slug, target_path, state, created_at
     FROM plan_summaries
     ORDER BY created_at DESC,
       CASE execution_priority
         WHEN 'high' THEN 3
         WHEN 'medium' THEN 2
         WHEN 'low' THEN 1
         ELSE 0
       END DESC,
       id DESC
     LIMIT ${Number(limit) || 5};`,
    dbPath,
  ).map(([
    id,
    tenantId,
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
    tenantId,
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

export function getPersistenceSummary(dbPath = DEFAULT_DB_PATH) {
  const latestRuns = listLatestRuns(5, dbPath);
  const hasOpportunitySummaries = tableExists("opportunity_summaries", dbPath);
  const latestOpportunitySummaries = hasOpportunitySummaries ? listLatestOpportunitySummaries(5, dbPath) : [];
  const hasPlanSummaries = tableExists("plan_summaries", dbPath);
  const latestPlanSummaries = hasPlanSummaries ? listLatestPlanSummaries(5, dbPath) : [];
  const hasPlanApprovals = tableExists("plan_approvals", dbPath);
  const latestPlanApprovals = hasPlanApprovals ? getLatestPlanApprovals({ limit: 5 }, dbPath) : [];
  const hasPlanStatuses = tableExists("plan_statuses", dbPath);
  const latestPlanStatuses = hasPlanStatuses ? getLatestPlanStatuses({ limit: 5 }, dbPath) : [];
  const hasInboxItems = tableExists("inbox_items", dbPath);
  const latestInboxItems = hasInboxItems ? getLatestInboxItems({ limit: 5 }, dbPath) : [];

  return {
    dbPath,
    exists: databaseExists(dbPath),
    tenantCount: Number(queryValue("SELECT COUNT(*) FROM tenants;", dbPath) || 0),
    runCount: Number(queryValue("SELECT COUNT(*) FROM runs;", dbPath) || 0),
    snapshotCount: Number(queryValue("SELECT COUNT(*) FROM snapshots;", dbPath) || 0),
    opportunitySummaryCount: hasOpportunitySummaries
      ? Number(queryValue("SELECT COUNT(*) FROM opportunity_summaries;", dbPath) || 0)
      : 0,
    planSummaryCount: hasPlanSummaries
      ? Number(queryValue("SELECT COUNT(*) FROM plan_summaries;", dbPath) || 0)
      : 0,
    planApprovalCount: hasPlanApprovals
      ? Number(queryValue("SELECT COUNT(*) FROM plan_approvals;", dbPath) || 0)
      : 0,
    planStatusCount: hasPlanStatuses
      ? Number(queryValue("SELECT COUNT(*) FROM plan_statuses;", dbPath) || 0)
      : 0,
    inboxItemCount: hasInboxItems
      ? Number(queryValue("SELECT COUNT(*) FROM inbox_items;", dbPath) || 0)
      : 0,
    erpExpertsTenantExists: queryValue("SELECT COUNT(*) FROM tenants WHERE tenant_id = 'erp-experts';", dbPath) === "1",
    latestRun: latestRuns[0] || null,
    latestRuns,
    latestOpportunitySummary: latestOpportunitySummaries[0] || null,
    latestOpportunitySummaries,
    latestPlanSummary: latestPlanSummaries[0] || null,
    latestPlanSummaries,
    latestPlanApproval: latestPlanApprovals[0] || null,
    latestPlanApprovals,
    latestPlanStatus: latestPlanStatuses[0] || null,
    latestPlanStatuses,
    latestInboxItem: latestInboxItems[0] || null,
    latestInboxItems,
  };
}
